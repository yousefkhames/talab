// Talab views: storefront grid + product detail.

import { esc, money, productImg, render, renderHeader, settings, shopNeedsSetup, store, toast, tr, ui } from "../app.js";

function categories(products) {
  return [...new Set(products.map((p) => p.category).filter(Boolean))];
}

function matches(p, q) {
  if (!q) return true;
  const hay = `${p.name} ${p.desc} ${p.category}`.toLowerCase();
  return q.toLowerCase().split(/\s+/).every((w) => hay.includes(w));
}

export function renderShop(main) {
  const s = settings();
  const products = store.getProducts();
  const cats = categories(products);
  const visible = products.filter(
    (p) => matches(p, ui.search) && (!ui.category || p.category === ui.category)
  );

  const hero = `
    <section class="hero">
      <h1>${esc(s.shopName)}${s.whatsapp ? "" : `<span class="demo-badge">${esc(tr("demoBadge"))}</span>`}</h1>
      ${s.tagline ? `<p>${esc(s.tagline)}</p>` : ""}
    </section>`;

  const banner = shopNeedsSetup()
    ? `<div class="setup-banner">
        <span>${esc(tr("setupBanner"))}</span>
        <a class="btn btn-primary btn-sm" href="#/seller/settings" data-nav>${esc(tr("tabSettings"))}</a>
      </div>`
    : "";

  const search = `
    <div class="search-row">
      <input class="search-input" id="search" type="search" autocomplete="off"
        placeholder="${esc(tr("searchPlaceholder"))}" value="${esc(ui.search)}"
        aria-label="${esc(tr("searchPlaceholder"))}">
    </div>`;

  const chips =
    cats.length > 1
      ? `<div class="chips" role="tablist">
          <button class="chip ${ui.category ? "" : "active"}" data-cat="">${esc(tr("allCategories"))}</button>
          ${cats
            .map(
              (c) =>
                `<button class="chip ${ui.category === c ? "active" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`
            )
            .join("")}
        </div>`
      : "";

  let body;
  if (products.length === 0) {
    body = `<div class="empty-state"><div class="big">🛍️</div>
      <h2>${esc(tr("noProductsTitle"))}</h2><p>${esc(tr("noProductsBody"))}</p></div>`;
  } else {
    // #results is re-rendered on every keystroke without touching the input
    body = `<div id="results">${resultsHtml(visible)}</div>`;
  }

  const socials =
    s.instagram || s.facebook
      ? `<div style="text-align:center;margin-top:1.4rem">
          <div style="font-weight:700;margin-bottom:0.4rem">${esc(tr("followUs"))}</div>
          ${s.instagram ? `<a class="btn btn-ghost btn-sm" href="${esc(s.instagram)}" target="_blank" rel="noopener">Instagram</a>` : ""}
          ${s.facebook ? `<a class="btn btn-ghost btn-sm" href="${esc(s.facebook)}" target="_blank" rel="noopener">Facebook</a>` : ""}
        </div>`
      : "";

  main.innerHTML = hero + banner + search + chips + body + socials;

  const searchEl = main.querySelector("#search");
  searchEl?.addEventListener("input", () => {
    ui.search = searchEl.value;
    const results = main.querySelector("#results");
    if (!results) return;
    const fresh = store
      .getProducts()
      .filter((p) => matches(p, ui.search) && (!ui.category || p.category === ui.category));
    results.innerHTML = resultsHtml(fresh);
    bindAddButtons(results);
  });

  main.querySelectorAll("[data-cat]").forEach((btn) =>
    btn.addEventListener("click", () => {
      ui.category = btn.dataset.cat;
      render();
    })
  );

  bindAddButtons(main);
}

function resultsHtml(visible) {
  if (visible.length === 0) {
    return `<div class="empty-state"><div class="big">🔍</div>
      <h2>${esc(tr("noResultsTitle"))}</h2><p>${esc(tr("noResultsBody"))}</p></div>`;
  }
  return `<div class="grid" id="products">` + visible.map(productCard).join("") + `</div>`;
}

function bindAddButtons(scope) {
  scope.querySelectorAll("[data-add]").forEach((btn) =>
    btn.addEventListener("click", () => {
      store.addToCart(btn.dataset.add, 1);
      toast(tr("added"));
      renderHeader();
    })
  );
}


function productCard(p) {
  const veil = p.inStock
    ? ""
    : `<div class="soldout-veil"><span>${esc(tr("soldOut"))}</span></div>`;
  const compare = p.compareAt
    ? `<span class="compare">${money(p.compareAt)}</span>`
    : "";
  return `
    <article class="card">
      <a class="card-img-wrap" href="#/p/${esc(p.id)}" data-nav aria-label="${esc(p.name)}">
        ${productImg(p)}
        ${veil}
      </a>
      <div class="card-body">
        <a class="card-name" href="#/p/${esc(p.id)}" data-nav>${esc(p.name)}</a>
        <div class="price-row"><span class="price">${money(p.price)}</span>${compare}</div>
        <div class="card-actions">
          <button class="btn btn-primary btn-sm btn-block" data-add="${esc(p.id)}" ${p.inStock ? "" : "disabled"}>
            ${esc(p.inStock ? tr("addToCart") : tr("soldOut"))}
          </button>
        </div>
      </div>
    </article>`;
}

export function renderProduct(main, id) {
  const p = store.getProducts().find((x) => x.id === id);
  if (!p) {
    main.innerHTML = `<div class="empty-state"><div class="big">😕</div>
      <p>${esc(tr("productNotFound"))}</p>
      <a class="btn btn-ghost" href="#/" data-nav>${esc(tr("backToShop"))}</a></div>`;
    return;
  }
  let qty = 1;
  const compare = p.compareAt ? `<span class="compare">${money(p.compareAt)}</span>` : "";
  main.innerHTML = `
    <a class="back-link" href="#/" data-nav>${ui.lang === "ar" ? "→" : "←"} ${esc(tr("backToShop"))}</a>
    <div class="product-page">
      <div class="product-hero">${productImg(p)}</div>
      <div class="product-info">
        ${p.category ? `<span class="chip">${esc(p.category)}</span>` : ""}
        <h1>${esc(p.name)}</h1>
        <div class="price-row" style="margin-bottom:0.8rem">
          <span class="price" style="font-size:1.4rem">${money(p.price)}</span>${compare}
        </div>
        ${p.desc ? `<h2 style="font-size:1rem;margin:0 0 0.2rem">${esc(tr("description"))}</h2><p class="desc">${esc(p.desc)}</p>` : ""}
        <div style="display:flex;gap:0.8rem;align-items:center;margin-top:1.2rem;flex-wrap:wrap">
          <div class="qty-stepper" aria-label="${esc(tr("quantity"))}">
            <button id="q-minus" aria-label="-">−</button>
            <span class="qty" id="q-val">1</span>
            <button id="q-plus" aria-label="+">+</button>
          </div>
          <button class="btn btn-primary" id="add-btn" ${p.inStock ? "" : "disabled"}>
            ${esc(p.inStock ? tr("addToCart") : tr("soldOut"))}
          </button>
        </div>
      </div>
    </div>`;
  const val = main.querySelector("#q-val");
  main.querySelector("#q-minus").addEventListener("click", () => {
    qty = Math.max(1, qty - 1);
    val.textContent = qty;
  });
  main.querySelector("#q-plus").addEventListener("click", () => {
    qty = Math.min(99, qty + 1);
    val.textContent = qty;
  });
  main.querySelector("#add-btn")?.addEventListener("click", () => {
    store.addToCart(p.id, qty);
    toast(tr("added"));
    render();
  });
}
