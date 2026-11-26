// Talab app: boot, router, header/footer, shared UI helpers.

import { createStore } from "./core/store.js";
import { DICT, dirFor, t } from "./core/i18n.js";
import { escapeHtml, formatMoney, isValidWhatsApp } from "./core/format.js";
import { demoProducts, demoSettings } from "./core/demo.js";
import { renderShop, renderProduct } from "./views/shop.js";
import { renderCart } from "./views/cart.js";
import { renderSeller } from "./views/seller.js";

export const store = createStore(window.localStorage);

// Seed demo data once, so first-time visitors see a real shop.
if (!store.isSeeded()) {
  store.saveSettings(demoSettings());
  store.saveProducts(demoProducts());
  store.markSeeded();
}

export const ui = {
  lang: store.getSettings().lang,
  search: "",
  category: "",
  toastTimer: null,
};

export function settings() {
  return store.getSettings();
}

export function tr(key, vars) {
  return t(ui.lang, key, vars);
}

export function money(n) {
  return formatMoney(n, settings(), ui.lang);
}

export function esc(v) {
  return escapeHtml(v);
}

export function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(ui.toastTimer);
  ui.toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

export function applyChrome() {
  const s = settings();
  const root = document.documentElement;
  root.lang = ui.lang;
  root.dir = dirFor(ui.lang);
  root.style.setProperty("--primary", s.primary);
  root.style.setProperty("--accent", s.accent);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", s.primary);
  document.title = ui.lang === "ar" ? `${s.shopName} | طلب` : `${s.shopName} | Talab`;
}

export function renderHeader() {
  const s = settings();
  const count = store.cartCount();
  const logo = s.logo
    ? `<img class="brand-logo" src="${esc(s.logo)}" alt="">`
    : `<img class="brand-logo" src="assets/logo.svg" alt="">`;
  document.getElementById("topbar").innerHTML = `
    <div class="topbar-inner">
      <a class="brand" href="#/" data-nav>
        ${logo}
        <span class="brand-name">${esc(s.shopName)}</span>
      </a>
      <span class="topbar-spacer"></span>
      <a class="icon-btn" href="#/seller" data-nav title="${esc(tr("sellerArea"))}" aria-label="${esc(tr("sellerArea"))}">⚙️</a>
      <button class="lang-btn" id="lang-toggle">${esc(tr("langToggle"))}</button>
      <a class="icon-btn cart-btn" href="#/cart" data-nav aria-label="${esc(tr("yourCart"))}">
        🛒${count > 0 ? `<span class="cart-count">${count}</span>` : ""}
      </a>
    </div>`;
  document.getElementById("lang-toggle").addEventListener("click", () => {
    ui.lang = ui.lang === "ar" ? "en" : "ar";
    render();
  });
  document.getElementById("footer").innerHTML = `<p>${esc(tr("footerMadeWith"))}</p>`;
}

// A product image or a soft placeholder block.
export function productImg(p, cls = "") {
  if (p.image) return `<img class="${cls}" src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">`;
  return `<div class="card-img-placeholder ${cls}" aria-hidden="true">🛍️</div>`;
}

export function modal(html) {
  closeModal();
  const veil = document.createElement("div");
  veil.className = "modal-veil";
  veil.id = "modal-veil";
  veil.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  veil.addEventListener("click", (e) => {
    if (e.target === veil) closeModal();
  });
  document.body.appendChild(veil);
  const first = veil.querySelector("input, textarea, select, button");
  if (first) first.focus();
  return veil;
}

export function closeModal() {
  document.getElementById("modal-veil")?.remove();
}

export function confirmDialog(message) {
  return window.confirm(message);
}

// Image file -> resized dataURL (max 900px, JPEG). Stays on the device.
export function fileToDataUrl(file, maxSide = 900) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read-failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("bad-image"));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export function shopNeedsSetup() {
  return !isValidWhatsApp(settings().whatsapp);
}

export function shopUrl() {
  return window.location.origin + window.location.pathname;
}

// ---------- router ----------

export function render() {
  applyChrome();
  renderHeader();
  const main = document.getElementById("main");
  const hash = window.location.hash.replace(/^#\/?/, "");
  const [route, arg] = hash.split("/");
  window.scrollTo(0, 0);
  if (route === "cart") renderCart(main);
  else if (route === "seller") renderSeller(main, arg || "products");
  else if (route === "p") renderProduct(main, arg);
  else renderShop(main);
}

window.addEventListener("hashchange", render);
render();

// PWA offline cache (best effort; the app works without it).
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
