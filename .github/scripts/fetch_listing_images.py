#!/usr/bin/env python3
"""Download the photos of a real estate listing (Etuovi / OP Koti / Oikotie).

Usage
-----
  # 1) straight from the listing pages
  python3 get_listing_images.py -o kotipolku11

  # 2) other listing / other site
  python3 get_listing_images.py -o out https://www.etuovi.com/kohde/123456/kuvat

  # 3) if the site blocks scripted access: open the photo page in a browser,
  #    save it (Ctrl+S, "Web page, complete" or "HTML only"), then:
  python3 get_listing_images.py -o kotipolku11 --from-file saved_page.html

  # 4) just print what it found, download nothing
  python3 get_listing_images.py --list-only

Stdlib only, no dependencies.
"""

import argparse
import os
import re
import sys
import urllib.request
from urllib.parse import urlsplit

# Kotipolku 11 A, Keskusta, Siilinjarvi, 3h+k+s, 71 m2 (listing id 598764)
DEFAULT_SOURCES = [
    "https://www.etuovi.com/kohde/598764/kuvat",
    "https://www.etuovi.com/kohde/598764",
    "https://op-koti.fi/kohde/598764",
    "https://op-koti.fi/api/v1/listings/598764",
]

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")

IMG_RE = re.compile(
    r'https?://[^\s"\'<>\\)]+?\.(?:jpe?g|png|webp)(?:\?[^\s"\'<>\\)]*)?',
    re.IGNORECASE,
)

# assets that are never listing photos
JUNK = re.compile(
    r'(logo|icon|favicon|sprite|placeholder|avatar|badge|banner|map[-_]|'
    r'/static/|/assets/(?:img/)?ui|footer|header|qr[-_])',
    re.IGNORECASE,
)


def unescape(url: str) -> str:
    return (url.replace("\\u002F", "/").replace("\\u002f", "/")
               .replace("\\/", "/"))


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
        "Accept-Language": "fi-FI,fi;q=0.9,en;q=0.8",
    })
    with urllib.request.urlopen(req, timeout=30) as r:
        body = r.read().decode(r.headers.get_content_charset() or "utf-8",
                               errors="replace")
    print(f"  status {r.status}, {len(body)} chars, "
          f"type {r.headers.get('Content-Type', '?')}")
    return body


def biggest(url: str) -> str:
    """Ask the CDN for a full size version instead of a thumbnail."""
    url = re.sub(r'([?&])(w|width|h|height|size)=\d+', r'\g<1>\g<2>=2048', url)
    # Etuovi / OP style path tokens: /800x600/, /medium/, /thumb/
    url = re.sub(r'/(?:\d{2,4}x\d{2,4})/', '/1920x1440/', url)
    url = re.sub(r'/(?:thumb|thumbnail|small|medium|preview)/', '/large/', url,
                 flags=re.IGNORECASE)
    return url


def collect(text: str) -> list:
    # JSON blobs inside the page escape their slashes; normalise first so the
    # same regex finds URLs in markup and in __NEXT_DATA__ alike.
    text = unescape(text)
    seen, out = set(), []
    for url in IMG_RE.findall(text):
        if JUNK.search(url):
            continue
        url = biggest(url)
        key = urlsplit(url).path.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(url)
    return out


def download(urls: list, outdir: str) -> int:
    os.makedirs(outdir, exist_ok=True)
    ok = 0
    width = max(2, len(str(len(urls))))
    for i, url in enumerate(urls, 1):
        ext = os.path.splitext(urlsplit(url).path)[1] or ".jpg"
        path = os.path.join(outdir, f"{i:0{width}d}{ext.lower()}")
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA,
                                                       "Referer": "https://www.etuovi.com/"})
            with urllib.request.urlopen(req, timeout=60) as r, open(path, "wb") as f:
                data = r.read()
                if len(data) < 8000:          # icon sized, not a photo
                    print(f"  skip (too small) {url}")
                    continue
                f.write(data)
        except Exception as e:                # noqa: BLE001
            print(f"  FAIL {url}: {e}")
            continue
        print(f"  {path}  ({len(data)//1024} kB)")
        ok += 1
    return ok


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("sources", nargs="*", default=[],
                    help="listing page URLs (default: Kotipolku 11 listing)")
    ap.add_argument("-o", "--outdir", default="listing-images")
    ap.add_argument("--from-file", action="append", default=[],
                    help="parse a page saved from the browser instead of fetching")
    ap.add_argument("--list-only", action="store_true")
    args = ap.parse_args()

    pages = []
    for p in args.from_file:
        with open(p, encoding="utf-8", errors="replace") as f:
            pages.append((p, f.read()))
    if not pages:
        for url in (args.sources or DEFAULT_SOURCES):
            try:
                pages.append((url, fetch(url)))
                print(f"fetched {url}")
            except Exception as e:            # noqa: BLE001
                print(f"could not fetch {url}: {e}", file=sys.stderr)

    urls, seen = [], set()
    for _, body in pages:
        for u in collect(body):
            k = urlsplit(u).path.lower()
            if k not in seen:
                seen.add(k)
                urls.append(u)

    if not urls:
        print("No image URLs found. The page is probably rendered behind a "
              "bot check: open it in a browser, save the page, and rerun with "
              "--from-file.", file=sys.stderr)
        return 1

    print(f"\n{len(urls)} candidate images:")
    for u in urls:
        print("  " + u)
    if args.list_only:
        return 0

    print(f"\ndownloading into {args.outdir}/")
    n = download(urls, args.outdir)
    print(f"\ndone: {n}/{len(urls)} saved")
    return 0 if n else 1


if __name__ == "__main__":
    sys.exit(main())
