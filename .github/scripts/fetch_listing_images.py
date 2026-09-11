#!/usr/bin/env python3
"""Recover the photos of a removed real estate listing.

The listing pages themselves are gone (Etuovi answers 410, OP Koti 404), so the
photo URLs have to come from what is left behind:

  1. the body of the "listing removed" page, which often still carries the
     original image tags,
  2. the Wayback Machine snapshots of the listing and photo pages,
  3. an image search (Bing), which still indexes the pictures.

Each candidate is then downloaded from the live CDN, falling back to the
Wayback copy when the CDN has dropped it too.

Usage:
    python3 fetch_listing_images.py -o out/            # listing 598764
    python3 fetch_listing_images.py -o out/ --id 12345 --url https://...
    python3 fetch_listing_images.py --list-only        # show URLs, download nothing

Stdlib only.
"""

import argparse
import hashlib
import json
import os
import re
import socket
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

# Archive endpoints answer slowly or not at all, so every request is capped and
# each phase gets a wall-clock budget.
socket.setdefaulttimeout(20)
STARTED = time.monotonic()
PHASE_BUDGET = 150.0        # seconds per phase
REQ_TIMEOUT = 20

# Kotipolku 11 A, Keskusta, Siilinjarvi, 3h+k+s, 71 m2
LISTING_ID = "598764"
LISTING_PAGES = [
    "https://www.etuovi.com/kohde/598764/kuvat",
    "https://www.etuovi.com/kohde/598764",
    "https://op-koti.fi/kohde/598764",
]
SEARCH_QUERIES = [
    "etuovi 598764 Kotipolku 11 Siilinjärvi",
    "Kotipolku 11 A Siilinjärvi kerrostalo 3h myynnissä kuvat",
]

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")

IMG_RE = re.compile(
    r'https?://[^\s"\'<>\\)\]]+?\.(?:jpe?g|png|webp)(?:\?[^\s"\'<>\\)\]]*)?',
    re.IGNORECASE)

JUNK = re.compile(
    r'(logo|icon|favicon|sprite|placeholder|dummy|avatar|badge|banner|/ads?/|'
    r'/static/|/assets/(?:img/)?ui|footer|header|qr[-_]|pixel|tracking|'
    r'gravatar|googletagmanager|facebook\.com|doubleclick)', re.IGNORECASE)

# Search engines answer bot traffic with whatever they feel like, so nothing is
# downloaded unless it sits on a host that actually serves listing photos.
# d3ls91xgksobn.cloudfront.net is Etuovi's media CDN.
ALLOWED_HOSTS = re.compile(
    r'(^|\.)((d3ls91xgksobn\.cloudfront\.net)|(etuovi\.com)|(etuovimedia)|'
    r'(op-koti\.fi)|(asuntopalvelu\.op\.fi)|(oikotie\.fi)|(oikotiecdn))',
    re.IGNORECASE)

WAYBACK_PREFIX = re.compile(r'^https?://web\.archive\.org/web/[^/]+/', re.I)


def log(msg):
    print(msg, flush=True)


def unescape(text):
    return (text.replace("\\u002F", "/").replace("\\u002f", "/")
                .replace("\\/", "/").replace("&amp;", "&"))


class Phase:
    """Wall-clock budget for one source, so a stalled archive cannot hang the job."""

    def __init__(self, name, budget=PHASE_BUDGET):
        self.name, self.budget = name, budget

    def __enter__(self):
        self.t0 = time.monotonic()
        log(f"\n{self.name}")
        return self

    def __exit__(self, *exc):
        log(f"  ({self.name} took {time.monotonic() - self.t0:.0f}s)")
        return False

    def left(self):
        return self.budget - (time.monotonic() - self.t0)

    def spent(self):
        if self.left() <= 0:
            log(f"  budget spent, moving on")
            return True
        return False


def get(url, timeout=REQ_TIMEOUT, cookie=None):
    """Fetch a URL. Returns the body even for 4xx/5xx, since a 410 page still
    carries markup worth parsing."""
    headers = {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
        "Accept-Language": "fi-FI,fi;q=0.9,en;q=0.8",
    }
    if cookie:
        headers["Cookie"] = cookie
    req = urllib.request.Request(url, headers=headers)
    try:
        r = urllib.request.urlopen(req, timeout=timeout)
        body = r.read()
        code = r.status
    except urllib.error.HTTPError as e:
        body = e.read()
        code = e.code
    except Exception as e:                                  # noqa: BLE001
        log(f"    {url} -> {e}")
        return None, 0
    log(f"    {url} -> http {code}, {len(body)} bytes")
    return body.decode("utf-8", errors="replace"), code


def candidates(text):
    if not text:
        return []
    text = unescape(text)
    out = []
    for url in IMG_RE.findall(text):
        url = WAYBACK_PREFIX.sub("", url)     # unwrap archived originals
        if not JUNK.search(url):
            out.append(url)
    return out


def from_pages(pages, phase):
    found = []
    for url in pages:
        if phase.spent():
            break
        body, _ = get(url)
        found += candidates(body)
    return found


def from_wayback(pages, phase):
    found, snapshots = [], []
    for page in pages:                      # cheap lookup first, CDX is flaky
        if phase.spent():
            break
        body, _ = get("https://archive.org/wayback/available?url="
                      + urllib.parse.quote(page, safe=""))
        try:
            snap = json.loads(body or "{}")["archived_snapshots"]["closest"]["url"]
            snapshots.append(snap.replace("/http", "id_/http", 1))
        except (ValueError, KeyError, TypeError):
            pass
    for page in pages:
        if phase.spent():
            break
        target = page.split("://", 1)[1]
        cdx = ("https://web.archive.org/cdx/search/cdx?url="
               + urllib.parse.quote(target, safe="")
               + "*&output=json&limit=15&filter=statuscode:200&collapse=digest")
        body, _ = get(cdx)
        if not body:
            continue
        try:
            rows = json.loads(body)
        except ValueError:
            continue
        for row in rows[1:]:
            ts, original = row[1], row[2]
            snapshots.append(f"https://web.archive.org/web/{ts}id_/{original}")
    log(f"  {len(snapshots)} wayback snapshots")
    for snap in snapshots[:10]:
        if phase.spent():
            break
        body, _ = get(snap)
        found += candidates(body)
    return found


def from_image_search(queries, phase):
    """Image search still indexes the photos even though the listing is gone.
    Everything here is filtered by ALLOWED_HOSTS later, because these engines
    happily answer a datacenter IP with results for a completely different
    query."""
    found = []
    engines = [
        "https://www.google.com/search?tbm=isch&hl=fi&gl=fi&num=40&q={q}",
        "https://www.bing.com/images/search?q={q}&mkt=fi-FI&form=HDRSC2&first=1",
    ]
    for q in queries:
        for tpl in engines:
            if phase.spent():
                return found
            body, _ = get(tpl.format(q=urllib.parse.quote(q)),
                          cookie="CONSENT=YES+cb.20220301-11-p0.en+FX+111")
            if not body:
                continue
            found += candidates(body)
            for m in re.findall(r'murl&quot;:&quot;(.*?)&quot;', body):
                found.append(unescape(m))
    return found


def biggest(url):
    # Etuovi's CDN takes the size in the path: /500x,q90/etuovimedia/...
    url = re.sub(r'/\d{2,4}x,q\d{1,3}/', '/1600x,q90/', url)
    url = re.sub(r'([?&])(w|width|h|height|size)=\d+', r'\g<1>\g<2>=2048', url)
    url = re.sub(r'/(\d{2,4})x(\d{2,4})/', '/1920x1440/', url)
    url = re.sub(r'/(thumb|thumbnail|small|medium|preview)/', '/large/', url,
                 flags=re.IGNORECASE)
    return url


def dedupe(urls, listing_id):
    seen, out, rejected = set(), [], 0
    for url in urls:
        url = biggest(url.strip().rstrip('\\'))
        parts = urllib.parse.urlsplit(url)
        if not ALLOWED_HOSTS.search(parts.netloc):
            rejected += 1
            continue
        key = parts.path.lower()
        if key and key not in seen:
            seen.add(key)
            out.append(url)
    log(f"  {rejected} candidates dropped as off-host, {len(out)} kept")
    # If several candidates carry the listing id, the rest are other listings.
    keyed = [u for u in out if listing_id in u]
    if len(keyed) >= 3:
        log(f"  filtering to {len(keyed)} urls containing id {listing_id}")
        return keyed
    return out


def image_headers(url):
    """Photo hosts reject a bare urllib request, so ask the way a browser
    rendering the listing page would, referer included."""
    parts = urllib.parse.urlsplit(url)
    return {
        "User-Agent": UA,
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Accept-Language": "fi-FI,fi;q=0.9,en;q=0.8",
        "Referer": f"{parts.scheme}://{parts.netloc}/",
        "Sec-Fetch-Dest": "image",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "same-origin",
        "Connection": "keep-alive",
    }


def proxied(url):
    """Public image proxy: fetches server side, which gets past hosts that
    refuse this runner's address."""
    return ("https://images.weserv.nl/?url="
            + urllib.parse.quote(url.split("://", 1)[1], safe="") + "&n=-1")


def fetch_binary(url, headers=None):
    req = urllib.request.Request(url, headers=headers or image_headers(url))
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def download(urls, outdir, budget=420.0):
    os.makedirs(outdir, exist_ok=True)
    hashes, saved = set(), 0
    t0 = time.monotonic()
    width = max(2, len(str(len(urls))))
    for i, url in enumerate(urls, 1):
        if time.monotonic() - t0 > budget:
            log(f"  download budget spent after {i - 1} urls")
            break
        data = None
        for attempt in (url, proxied(url)):
            try:
                data = fetch_binary(attempt)
                break
            except Exception as e:                          # noqa: BLE001
                log(f"  {attempt[:110]} -> {e}")
        if not data or len(data) < 12000:
            log(f"  skip {url[:110]} ({0 if not data else len(data)} bytes)")
            continue
        digest = hashlib.sha1(data).hexdigest()
        if digest in hashes:
            log(f"  duplicate, skipped: {url[:110]}")
            continue
        hashes.add(digest)
        ext = os.path.splitext(urllib.parse.urlsplit(url).path)[1].lower() or ".jpg"
        path = os.path.join(outdir, f"{i:0{width}d}{ext}")
        with open(path, "wb") as f:
            f.write(data)
        log(f"  saved {path} ({len(data)//1024} kB)")
        saved += 1
    return saved


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("-o", "--outdir", default="listing-images")
    ap.add_argument("--id", default=LISTING_ID)
    ap.add_argument("--url", action="append", default=[])
    ap.add_argument("--list-only", action="store_true")
    ap.add_argument("--urls-file",
                    help="skip discovery and download these urls instead")
    args = ap.parse_args()

    if args.urls_file and os.path.exists(args.urls_file):
        with open(args.urls_file) as f:
            known = [l.strip() for l in f if l.strip().startswith("http")]
        log(f"using {len(known)} urls from {args.urls_file}")
        if known:
            return 0 if download(known, args.outdir, budget=420.0) else 1

    pages = args.url or LISTING_PAGES
    found = []

    # Cheapest and most reliable sources first: a stalled archive then only
    # costs the candidates it would have added, not the whole run.
    with Phase("1. listing pages (body is parsed even when the page is gone)", 60) as p:
        found += from_pages(pages, p)
        log(f"  {len(found)} candidates so far")

    with Phase("2. image search", 90) as p:
        found += from_image_search(SEARCH_QUERIES, p)
        log(f"  {len(found)} candidates so far")

    with Phase("3. wayback machine", 120) as p:
        found += from_wayback(pages, p)
        log(f"  {len(found)} candidates so far")

    urls = dedupe(found, args.id)[:80]
    log(f"\n{len(urls)} unique candidate images:")
    for u in urls:
        log("  " + u)
    if args.list_only:
        return 0
    if not urls:
        return 1

    os.makedirs(args.outdir, exist_ok=True)
    with open(os.path.join(args.outdir, "urls.txt"), "w") as f:
        f.write("\n".join(urls) + "\n")

    log(f"\ndownloading into {args.outdir}/")
    n = download(urls, args.outdir, budget=300.0)
    log(f"\ndone: {n} images saved")
    return 0 if n else 1


if __name__ == "__main__":
    sys.exit(main())
