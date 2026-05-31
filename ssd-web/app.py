#!/usr/bin/env python3
"""
Finnish store scraper web UI.
Run: python3 app.py  →  open http://localhost:5000
"""

import re
import time
import threading
from typing import Optional
from flask import Flask, render_template_string, request, jsonify
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "fi-FI,fi;q=0.9",
    "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
}


# ─── Helpers ─────────────────────────────────────────────────────────────────

def parse_price(text: str) -> Optional[float]:
    # Remove thousands separators (space, non-breaking space) before converting decimal comma
    text = text.replace("\xa0", "").replace(" ", "").replace(" ", "").replace(",", ".").strip()
    m = re.search(r"(\d+\.\d+|\d+)", text)
    return float(m.group(1)) if m else None


# ─── Jimm's ──────────────────────────────────────────────────────────────────

JIMMS_BASE = "https://www.jimms.fi"


def _parse_jimms_html(html: str) -> list:
    soup = BeautifulSoup(html, "html.parser")
    results = []
    for h5 in soup.select("h5.product-box-name"):
        col = h5.parent
        row = col.parent if col else None
        if not row:
            continue

        name = h5.get_text(" ", strip=True)

        price_el = row.select_one("span.price__amount")
        price = parse_price(price_el.get_text()) if price_el else None

        avail_el = row.select_one("availability-product")
        avail_text = avail_el.get_text(" ", strip=True).lower() if avail_el else ""
        in_stock = "varastossa" in avail_text and "ei varastossa" not in avail_text
        for badge in row.select(".badge"):
            if "loppuunmyyty" in badge.get_text().lower():
                in_stock = False
                break

        link = row.select_one('a.js-gtm-product-link[href*="/fi/Product/Show/"]')
        href = link["href"] if link else ""
        url = JIMMS_BASE + href if href.startswith("/") else href

        results.append({
            "store": "Jimm's",
            "store_url": "https://www.jimms.fi",
            "name": name,
            "price": price,
            "in_stock": in_stock,
            "url": url,
        })
    return results


def scrape_jimms(keyword: str) -> list:
    results = []
    seen_urls: set = set()
    page = 1
    while page <= 15:
        if page == 1:
            url = f"{JIMMS_BASE}/fi/?q={requests.utils.quote(keyword)}"
        else:
            url = f"{JIMMS_BASE}/fi/?q={requests.utils.quote(keyword)}&page={page}"
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
        except requests.RequestException:
            break
        if resp.status_code != 200:
            break
        page_results = _parse_jimms_html(resp.text)
        if not page_results:
            break
        # Deduplicate — stop if this page returned only already-seen items
        new_items = [r for r in page_results if r["url"] not in seen_urls]
        if not new_items:
            break
        for r in new_items:
            seen_urls.add(r["url"])
        results.extend(new_items)
        if len(page_results) < 25:
            break
        page += 1
        time.sleep(0.4)
    return results


# ─── Verkkokauppa ────────────────────────────────────────────────────────────

def scrape_verkkokauppa(keyword: str) -> list:
    try:
        from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout
    except ImportError:
        return []

    url = f"https://www.verkkokauppa.com/fi/search?query={requests.utils.quote(keyword)}&pageSize=96"
    results = []

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=30000)
            page.wait_for_selector("article[data-product-id]", timeout=20000)
            time.sleep(2)
        except Exception:
            browser.close()
            return []
        html = page.content()
        browser.close()

    soup = BeautifulSoup(html, "html.parser")
    for art in soup.select("article[data-product-id]"):
        h3 = art.find("h3")
        name = h3.get_text(" ", strip=True) if h3 else ""
        if not name:
            continue

        price_data = art.select_one("[class*='stm-price__currentData']")
        try:
            price = float(price_data["value"]) if price_data and price_data.get("value") else None
        except (ValueError, TypeError):
            price = None

        card_text = art.get_text(" ", strip=True)
        kpl_match = re.search(r"(yli\s+)?(\d+)\s*kpl", card_text, re.IGNORECASE)
        if kpl_match:
            in_stock = bool(kpl_match.group(1)) or int(kpl_match.group(2)) > 0
        else:
            in_stock = False

        link = art.select_one('a[href*="/fi/product/"]')
        href = link["href"] if link else ""
        product_url = "https://www.verkkokauppa.com" + href if href.startswith("/") else href

        results.append({
            "store": "Verkkokauppa",
            "store_url": "https://www.verkkokauppa.com",
            "name": name,
            "price": price,
            "in_stock": in_stock,
            "url": product_url,
        })
    return results


# ─── Search endpoint ─────────────────────────────────────────────────────────

def _name_matches_keyword(name: str, keyword: str) -> bool:
    """Filter out results Jimm's search engine returns for irrelevant reasons.
    At least one meaningful token from the keyword must appear in the product name."""
    tokens = [t.lower() for t in keyword.split() if len(t) > 2]
    if not tokens:
        return True  # very short keyword — skip filter
    name_lower = name.lower()
    return any(t in name_lower for t in tokens)


def run_scrape(keyword: str) -> list:
    # Run both stores in parallel to cut total time roughly in half
    jimms_results: list = []
    vk_results: list = []

    def _jimms():
        jimms_results.extend(scrape_jimms(keyword))

    def _vk():
        vk_results.extend(scrape_verkkokauppa(keyword))

    t1 = threading.Thread(target=_jimms)
    t2 = threading.Thread(target=_vk)
    t1.start(); t2.start()
    t1.join(); t2.join()

    all_results = [
        r for r in jimms_results + vk_results
        if _name_matches_keyword(r["name"], keyword)
    ]
    all_results.sort(key=lambda r: (not r["in_stock"], r["price"] or 9999))
    return all_results


@app.route("/search")
def search():
    keyword = request.args.get("q", "").strip()
    max_price = request.args.get("max_price", "")
    if not keyword:
        return jsonify({"error": "No keyword", "results": []})
    results = run_scrape(keyword)
    if max_price:
        try:
            cap = float(max_price)
            results = [r for r in results if r["price"] is None or r["price"] <= cap]
        except ValueError:
            pass
    return jsonify({"results": results, "total": len(results)})


# ─── HTML ────────────────────────────────────────────────────────────────────

HTML = """<!DOCTYPE html>
<html lang="fi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Finnish Store Finder</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: #0f0f13;
    color: #e8e8ec;
    min-height: 100vh;
  }

  header {
    background: #1a1a24;
    border-bottom: 1px solid #2a2a3a;
    padding: 24px 32px;
  }

  header h1 {
    font-size: 1.4rem;
    font-weight: 600;
    color: #fff;
    letter-spacing: -0.3px;
  }

  header p {
    font-size: 0.85rem;
    color: #888;
    margin-top: 4px;
  }

  .search-bar {
    background: #1a1a24;
    border-bottom: 1px solid #2a2a3a;
    padding: 20px 32px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: flex-end;
  }

  .field { display: flex; flex-direction: column; gap: 6px; }
  .field label { font-size: 0.75rem; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }

  input[type="text"], input[type="number"] {
    background: #0f0f13;
    border: 1px solid #333;
    color: #e8e8ec;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.15s;
  }
  input[type="text"] { width: 340px; }
  input[type="number"] { width: 120px; }
  input:focus { border-color: #5b6af0; }

  button {
    background: #5b6af0;
    color: #fff;
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
    height: 40px;
  }
  button:hover { background: #4a59e0; }
  button:disabled { background: #333; color: #666; cursor: default; }

  .main { padding: 28px 32px; max-width: 1200px; }

  .status {
    font-size: 0.85rem;
    color: #888;
    margin-bottom: 20px;
    min-height: 20px;
  }
  .status.searching { color: #5b6af0; }
  .status.done { color: #4ade80; }
  .status.error { color: #f87171; }

  .section-title {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #666;
    margin-bottom: 12px;
    margin-top: 28px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .section-title::after {
    content: "";
    flex: 1;
    height: 1px;
    background: #2a2a3a;
  }
  .section-title:first-child { margin-top: 0; }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 14px;
  }

  .card {
    background: #1a1a24;
    border: 1px solid #2a2a3a;
    border-radius: 12px;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: border-color 0.15s;
  }
  .card:hover { border-color: #444; }
  .card.out { opacity: 0.55; }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
  }

  .store-badge {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 3px 8px;
    border-radius: 4px;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .store-jimms { background: #1e3a2a; color: #4ade80; }
  .store-verkkokauppa { background: #1e2a4a; color: #60a5fa; }

  .stock-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 5px;
  }
  .stock-dot.yes { background: #4ade80; box-shadow: 0 0 6px #4ade8088; }
  .stock-dot.no  { background: #f87171; }

  .card-name {
    font-size: 0.9rem;
    font-weight: 500;
    color: #d0d0e0;
    line-height: 1.4;
    flex: 1;
  }

  .card-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .price {
    font-size: 1.3rem;
    font-weight: 700;
    color: #fff;
  }
  .price.na { font-size: 0.85rem; color: #666; font-weight: 400; }

  .stock-label {
    font-size: 0.75rem;
    font-weight: 600;
  }
  .stock-label.yes { color: #4ade80; }
  .stock-label.no  { color: #f87171; }

  .view-btn {
    display: inline-block;
    background: #22223a;
    color: #a0a0c0;
    border: 1px solid #333;
    padding: 7px 14px;
    border-radius: 6px;
    font-size: 0.8rem;
    text-decoration: none;
    transition: background 0.12s, color 0.12s;
    text-align: center;
  }
  .view-btn:hover { background: #2e2e50; color: #fff; }

  .empty { color: #555; font-size: 0.9rem; padding: 12px 0; }

  .spinner {
    display: inline-block;
    width: 14px; height: 14px;
    border: 2px solid #333;
    border-top-color: #5b6af0;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    vertical-align: middle;
    margin-right: 6px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
</head>
<body>

<header>
  <h1>Finnish Store Finder</h1>
  <p>Searches Jimm's &amp; Verkkokauppa.com in real time — availability verified</p>
</header>

<div class="search-bar">
  <div class="field">
    <label>Keyword</label>
    <input type="text" id="keyword" placeholder="e.g. samsung 870 evo, ssd 1tb, rtx 4070…" value="ssd 500gb">
  </div>
  <div class="field">
    <label>Max price (€)</label>
    <input type="number" id="maxprice" placeholder="150" value="150" min="0">
  </div>
  <button id="searchBtn" onclick="doSearch()">Search</button>
</div>

<div class="main">
  <div class="status" id="status">Enter a keyword and press Search.</div>
  <div id="results"></div>
</div>

<script>
const keyword = document.getElementById('keyword');
const maxprice = document.getElementById('maxprice');
const btn = document.getElementById('searchBtn');
const status = document.getElementById('status');
const resultsEl = document.getElementById('results');

keyword.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
maxprice.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });

function storeClass(store) {
  if (store === "Jimm's") return 'store-jimms';
  if (store === 'Verkkokauppa') return 'store-verkkokauppa';
  return '';
}

function makeCard(r) {
  const priceHtml = r.price != null
    ? `<span class="price">${r.price.toFixed(2)} €</span>`
    : `<span class="price na">Price N/A</span>`;
  const stockClass = r.in_stock ? 'yes' : 'no';
  const stockLabel = r.in_stock ? 'In stock' : 'Out of stock';
  return `
    <div class="card ${r.in_stock ? '' : 'out'}">
      <div class="card-top">
        <div style="display:flex;gap:8px;align-items:flex-start;flex:1">
          <div class="stock-dot ${stockClass}"></div>
          <span class="card-name">${escHtml(r.name)}</span>
        </div>
        <span class="store-badge ${storeClass(r.store)}">${escHtml(r.store)}</span>
      </div>
      <div class="card-bottom">
        ${priceHtml}
        <span class="stock-label ${stockClass}">${stockLabel}</span>
      </div>
      <a class="view-btn" href="${escHtml(r.url)}" target="_blank" rel="noopener">View in store →</a>
    </div>`;
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function doSearch() {
  const q = keyword.value.trim();
  if (!q) return;
  const mp = maxprice.value.trim();

  btn.disabled = true;
  status.className = 'status searching';
  status.innerHTML = '<span class="spinner"></span>Searching Finnish stores — please wait…';
  resultsEl.innerHTML = '';

  const params = new URLSearchParams({ q });
  if (mp) params.set('max_price', mp);

  fetch('/search?' + params)
    .then(r => r.json())
    .then(data => {
      btn.disabled = false;
      if (data.error) {
        status.className = 'status error';
        status.textContent = data.error;
        return;
      }
      const all = data.results;
      const inStock = all.filter(r => r.in_stock);
      const outStock = all.filter(r => !r.in_stock);

      status.className = 'status done';
      status.textContent = `${all.length} results — ${inStock.length} in stock`;

      let html = '';
      if (inStock.length) {
        html += `<div class="section-title">In stock (${inStock.length})</div>`;
        html += `<div class="grid">${inStock.map(makeCard).join('')}</div>`;
      }
      if (outStock.length) {
        html += `<div class="section-title">Out of stock (${outStock.length})</div>`;
        html += `<div class="grid">${outStock.map(makeCard).join('')}</div>`;
      }
      if (!all.length) {
        html = '<div class="empty">No results found. Try a different keyword.</div>';
      }
      resultsEl.innerHTML = html;
    })
    .catch(err => {
      btn.disabled = false;
      status.className = 'status error';
      status.textContent = 'Search failed: ' + err.message;
    });
}
</script>
</body>
</html>"""


@app.route("/")
def index():
    return render_template_string(HTML)


if __name__ == "__main__":
    import webbrowser, threading
    def open_browser():
        time.sleep(1)
        webbrowser.open("http://localhost:5001")
    threading.Thread(target=open_browser, daemon=True).start()
    print("Starting server at http://localhost:5001")
    app.run(debug=False, port=5001)
