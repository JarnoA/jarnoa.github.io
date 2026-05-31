#!/usr/bin/env python3
"""
SSD scraper for Finnish online stores.
Finds 500GB / 1TB SSDs under 150 EUR suitable for Blackmagic 4K cameras
(needs sustained write ~450 MB/s — any SATA or NVMe with DRAM cache works).

Usage:
    pip install -r requirements.txt
    python scraper.py

For Verkkokauppa.com (JS-rendered), also run:
    playwright install chromium
"""

import re
import sys
import time
from typing import Optional
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "fi-FI,fi;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

MAX_PRICE = 150.0

# Capacity strings to match — covers "500GB", "1TB", Finnish "1 Tt"/"500 Gt", and edge cases
TARGET_CAPS = ["500gb", "500 gb", "1tb", "1 tb", "960gb", "1000gb", "1024gb",
               "500gt", "500 gt", "1tt", "1 tt"]  # Finnish: Gt=GB, Tt=TB


# ─── Helpers ─────────────────────────────────────────────────────────────────

def parse_price(text: str) -> Optional[float]:
    """Extract a float price from Finnish locale strings like '89,90 €' or '1\xa0099,90 €'."""
    text = text.replace("\xa0", "").replace(" ", "").replace(",", ".").strip()
    m = re.search(r"(\d+\.\d+|\d+)", text)
    return float(m.group(1)) if m else None


def matches_capacity(name: str) -> bool:
    n = name.lower()
    return any(cap in n for cap in TARGET_CAPS)


def is_ssd(name: str) -> bool:
    """Exclude spinning HDDs — they won't work for Blackmagic 4K RAW recording."""
    n = name.lower()
    hdd_signals = ["rpm", "sisäinen kiintolevy", "7200", "5400", "internal hard drive"]
    if any(h in n for h in hdd_signals) and "ssd" not in n:
        return False
    return "ssd" in n or "nvme" in n or "nand" in n


def keep(r: dict) -> bool:
    return (
        r["price"] is not None
        and r["price"] <= MAX_PRICE
        and matches_capacity(r["name"])
        and is_ssd(r["name"])
    )


# ─── Jimm's ──────────────────────────────────────────────────────────────────

JIMMS_BASE = "https://www.jimms.fi"
JIMMS_SSD = f"{JIMMS_BASE}/fi/Product/List/000-00K/komponentit--ssd-levyt-kiintolevyt"


def _jimms_parse_page(html: str) -> list:
    soup = BeautifulSoup(html, "html.parser")
    results = []

    # Each product is a div.row containing h5.product-box-name
    # Structure: div.row > [div.col(image), div.col(name+sku), div.col(price+stock)]
    name_headings = soup.select("h5.product-box-name")

    for h5 in name_headings:
        # Navigate up: h5 -> div.col -> div.row
        col = h5.parent
        row = col.parent if col else None
        if not row:
            continue

        name = h5.get_text(" ", strip=True)

        # Price is in span.price__amount within the same row
        price_el = row.select_one("span.price__amount")
        price = parse_price(price_el.get_text()) if price_el else None

        # Stock: "Varastossa" = in stock, "Ei varastossa" = NOT in stock
        # "Ei varastossa" contains "varastossa" as a substring — must check the negative explicitly
        avail_el = row.select_one("availability-product")
        avail_text = avail_el.get_text(" ", strip=True).lower() if avail_el else ""
        in_stock = "varastossa" in avail_text and "ei varastossa" not in avail_text
        # Sold-out badge overrides (e.g. "Erä loppuunmyyty")
        for badge in row.select(".badge"):
            if "loppuunmyyty" in badge.get_text().lower():
                in_stock = False
                break

        # URL from first product link
        link = row.select_one('a.js-gtm-product-link[href*="/fi/Product/Show/"]')
        href = link["href"] if link else ""
        url = JIMMS_BASE + href if href.startswith("/") else href

        results.append({
            "store": "Jimm's",
            "name": name,
            "price": price,
            "in_stock": in_stock,
            "url": url,
        })

    return results


JIMMS_PAGE_SIZE = 25


def scrape_jimms() -> list:
    results = []
    page = 1
    while page <= 20:
        url = JIMMS_SSD if page == 1 else f"{JIMMS_SSD}?page={page}"
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
        except requests.RequestException as e:
            print(f"  [Jimm's] Error on page {page}: {e}", file=sys.stderr)
            break

        if resp.status_code != 200:
            break

        page_results = _jimms_parse_page(resp.text)
        if not page_results:
            break

        results.extend(page_results)
        print(f"      page {page}: {len(page_results)} products", end="\r")

        # Stop when a page returns fewer items than the page size
        if len(page_results) < JIMMS_PAGE_SIZE:
            break

        page += 1
        time.sleep(0.5)

    print()  # newline after \r progress
    return results


# ─── Verkkokauppa.com (Playwright — JS-rendered) ─────────────────────────────

def scrape_verkkokauppa() -> list:
    try:
        from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout
    except ImportError:
        print(
            "  [Verkkokauppa] Playwright not installed.\n"
            "  Run: pip install playwright && playwright install chromium",
            file=sys.stderr,
        )
        return []

    results = []
    search_url = "https://www.verkkokauppa.com/fi/search?query=ssd&pageSize=96"

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
            # Wait for product articles to appear (stable selector based on real DOM)
            page.wait_for_selector("article[data-product-id]", timeout=20000)
            time.sleep(2)  # let prices finish rendering
        except PWTimeout:
            print("  [Verkkokauppa] Timed out waiting for products.", file=sys.stderr)
            browser.close()
            return []
        except Exception as e:
            print(f"  [Verkkokauppa] Error: {e}", file=sys.stderr)
            browser.close()
            return []

        html = page.content()
        browser.close()

    soup = BeautifulSoup(html, "html.parser")
    articles = soup.select("article[data-product-id]")

    for art in articles:
        # Name from h3 heading
        h3 = art.find("h3")
        name = h3.get_text(" ", strip=True) if h3 else ""
        if not name:
            continue

        # Price: data element with value attribute (e.g. value="201.99")
        price_data = art.select_one("[class*='stm-price__currentData']")
        if price_data and price_data.get("value"):
            try:
                price = float(price_data["value"])
            except ValueError:
                price = None
        else:
            price = None

        # Availability: parse "X kpl" count — "0 kpl" = out of stock even if "Heti" appears
        # "yli 25 kpl" means >25, definitely in stock
        card_text = art.get_text(" ", strip=True)
        kpl_match = re.search(r'(yli\s+)?(\d+)\s*kpl', card_text, re.IGNORECASE)
        if kpl_match:
            if kpl_match.group(1):  # "yli X kpl" prefix = definitely in stock
                in_stock = True
            else:
                in_stock = int(kpl_match.group(2)) > 0
        else:
            in_stock = False

        # URL
        link = art.select_one('a[href*="/fi/product/"]')
        href = link["href"] if link else ""
        url = "https://www.verkkokauppa.com" + href if href.startswith("/") else href

        results.append({
            "store": "Verkkokauppa",
            "name": name,
            "price": price,
            "in_stock": in_stock,
            "url": url,
        })

    return results


# ─── Output ──────────────────────────────────────────────────────────────────

def print_table(rows: list[dict]):
    if not rows:
        print("  (none)")
        return

    W_STORE = max(len(r["store"]) for r in rows)
    W_NAME = min(58, max(len(r["name"]) for r in rows))
    W_PRICE = 9

    header = f"  {'Store':<{W_STORE}}  {'Price':>{W_PRICE}}  {'Name':<{W_NAME}}  URL"
    print(header)
    print("  " + "─" * (len(header) - 2))

    for r in rows:
        price_s = f"{r['price']:.2f} €" if r["price"] else "   N/A"
        name_s = r["name"][:W_NAME]
        print(f"  {r['store']:<{W_STORE}}  {price_s:>{W_PRICE}}  {name_s:<{W_NAME}}  {r['url']}")


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("─" * 60)
    print(" SSD Finder for Blackmagic 4K — Finnish stores")
    print(f" Filter: 500GB or 1TB  •  max {MAX_PRICE} €  •  in stock")
    print("─" * 60)

    all_results: list = []

    print("\n[1/2] Scraping Jimm's (jimms.fi)...")
    jimms = scrape_jimms()
    filtered_jimms = [r for r in jimms if keep(r)]
    print(f"      {len(jimms)} SSDs found → {len(filtered_jimms)} match filters")
    all_results.extend(filtered_jimms)

    print("\n[2/2] Scraping Verkkokauppa.com (requires Playwright)...")
    vk = scrape_verkkokauppa()
    filtered_vk = [r for r in vk if keep(r)]
    print(f"      {len(vk)} SSDs found → {len(filtered_vk)} match filters")
    all_results.extend(filtered_vk)

    in_stock = sorted([r for r in all_results if r["in_stock"]], key=lambda x: x["price"] or 9999)
    not_stock = sorted([r for r in all_results if not r["in_stock"]], key=lambda x: x["price"] or 9999)

    print(f"\n{'═' * 60}")
    print(f" IN STOCK  ({len(in_stock)} results, sorted by price)")
    print(f"{'═' * 60}")
    print_table(in_stock)

    if not_stock:
        print(f"\n{'─' * 60}")
        print(f" OUT OF STOCK  ({len(not_stock)} results)")
        print(f"{'─' * 60}")
        print_table(not_stock)

    if not all_results:
        print("\nNo results found. Try running with Playwright installed for Verkkokauppa.")


if __name__ == "__main__":
    main()
