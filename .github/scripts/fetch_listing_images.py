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
import sys
import urllib.error
import urllib.parse
import urllib.request

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
    r'(logo|icon|favicon|sprite|placeholder|avatar|badge|banner|/ads?/|'
    r'/static/|/assets/(?:img/)?ui|footer|header|qr[-_]|pixel|tracking|'
    r'gravatar|googletagmanager|facebook\.com|doubleclick)', re.IGNORECASE)

WAYBACK_PREFIX = re.compile(r'^https?://web\.archive\.org/web/[^/]+/', re.I)


def log(msg):
    print(msg, flush=True)


def unescape(text):
    return (text.replace("\\u002F", "/").replace("\\u002f", "/")
                .replace("\\/", "/").replace("&amp;", "&"))


def get(url, timeout=45):
    """Fetch a URL. Returns the body even for 4xx/5xx, since a 410 page still
    carries markup worth parsing."""
    req = urllib.request.Request(url, headers={
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
        "Accept-Language": "fi-FI,fi;q=0.9,en;q=0.8",
    })
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


def from_pages(pages):
    found = []
    for url in pages:
        body, _ = get(url)
        found += candidates(body)
    return found


def from_wayback(pages):
    found, snapshots = [], []
    for page in pages:
        target = page.split("://", 1)[1]
        cdx = ("https://web.archive.org/cdx/search/cdx?url="
               + urllib.parse.quote(target, safe="")
               + "*&output=json&limit=25&filter=statuscode:200&collapse=digest")
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
    for snap in snapshots[:12]:
        body, _ = get(snap)
        found += candidates(body)
    return found


def from_image_search(queries):
    found = []
    for q in queries:
        url = ("https://www.bing.com/images/search?q="
               + urllib.parse.quote(q) + "&form=HDRSC2&first=1")
        body, _ = get(url)
        if not body:
            continue
        for m in re.findall(r'murl&quot;:&quot;(.*?)&quot;', body):
            found.append(unescape(m))
        found += candidates(body)
    return found


def biggest(url):
    url = re.sub(r'([?&])(w|width|h|height|size)=\d+', r'\g<1>\g<2>=2048', url)
    url = re.sub(r'/(\d{2,4})x(\d{2,4})/', '/1920x1440/', url)
    url = re.sub(r'/(thumb|thumbnail|small|medium|preview)/', '/large/', url,
                 flags=re.IGNORECASE)
    return url


def dedupe(urls, listing_id):
    seen, out = set(), []
    for url in urls:
        url = biggest(url.strip().rstrip('\\'))
        key = urllib.parse.urlsplit(url).path.lower()
        if key and key not in seen:
            seen.add(key)
            out.append(url)
    # If several candidates carry the listing id, the rest are other listings.
    keyed = [u for u in out if listing_id in u]
    if len(keyed) >= 3:
        log(f"  filtering to {len(keyed)} urls containing id {listing_id}")
        return keyed
    return out


def fetch_binary(url):
    req = urllib.request.Request(url, headers={
        "User-Agent": UA, "Referer": "https://www.etuovi.com/"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def download(urls, outdir):
    os.makedirs(outdir, exist_ok=True)
    hashes, saved = set(), 0
    width = max(2, len(str(len(urls))))
    for i, url in enumerate(urls, 1):
        data = None
        for attempt in (url, "https://web.archive.org/web/2020id_/" + url):
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
    args = ap.parse_args()

    pages = args.url or LISTING_PAGES
    found = []

    log("1. listing pages (parsing the body even when removed)")
    found += from_pages(pages)
    log(f"  {len(found)} candidates so far")

    log("2. wayback machine")
    found += from_wayback(pages)
    log(f"  {len(found)} candidates so far")

    log("3. image search")
    found += from_image_search(SEARCH_QUERIES)
    log(f"  {len(found)} candidates so far")

    urls = dedupe(found, args.id)
    log(f"\n{len(urls)} unique candidate images:")
    for u in urls:
        log("  " + u)
    if args.list_only:
        return 0
    if not urls:
        return 1

    log(f"\ndownloading into {args.outdir}/")
    n = download(urls, args.outdir)
    log(f"\ndone: {n} images saved")
    return 0 if n else 1


if __name__ == "__main__":
    sys.exit(main())
