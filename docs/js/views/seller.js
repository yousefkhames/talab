// Talab views: seller dashboard shell + products tab.

import { esc, fileToDataUrl, money, modal, closeModal, productImg, render, settings, store, toast, tr } from "../app.js";
import { parsePrice } from "../core/format.js";
import { renderSellerOrders } from "./seller-orders.js";
import { renderSellerSettings } from "./seller-settings.js";
import { renderSellerShare } from "./seller-share.js";

export function renderSeller(main, tab) {
  const tabs = [
    ["products", tr("tabProducts")],
    ["orders", tr("tabOrders")],
    ["settings", tr("tabSettings")],
    ["share", tr("tabShare")],
  ];
  main.innerHTML = `
    <h1 style="font-size:1.4rem">${esc(tr("sellerTitle"))}</h1>
    <div class="tabs" role="tablist">
      ${tabs
        .map(
          ([id, label]) =>
            `<button class="tab ${tab === id ? "active" : ""}" role="tab"
              aria-selected="${tab === id}" data-tab="${id}">${esc(label)}</button>`
        )
        .join("")}
    </div>
    <div id="tab-body"></div>`;

  main.querySelectorAll("[data-tab]").forEach((b) =>
    b.addEventListener("click", () => {
      window.location.hash = `#/seller/${b.dataset.tab}`;
    })
  );

  const body = main.querySelector("#tab-body");
  if (tab === "orders") renderSellerOrders(body);
  else if (tab === "settings") renderSellerSettings(body);
  else if (tab === "share") renderSellerShare(body);
  else renderSellerProducts(body);
}

function renderSellerProducts(body) {
  const products = store.getProducts();
  body.innerHTML = `
    <button class="btn btn-primary btn-block" id="add-product" style="margin-bottom:1rem">
      ＋ ${esc(tr("addProduct"))}
    </button>
    ${
      products.length === 0
        ? `<div class="empty-state"><div class="big">📦</div><p>${esc(tr("productsEmpty"))}</p></div>`
        : products.map(sellerRow).join("")
    }`;

  body.querySelector("#add-product").addEventListener("click", () => productForm(null));
  body.querySelectorAll("[data-edit]").forEach((b) =>
    b.addEventListener("click", () => productForm(products.find((p) => p.id === b.dataset.edit)))
  );
  body.querySelectorAll("[data-del]").forEach((b) =>
    b.addEventListener("click", () => {
      if (window.confirm(tr("confirmDeleteProduct"))) {
        store.deleteProduct(b.dataset.del);
        render();
      }
    })
  );
  body.querySelectorAll("[data-stock]").forEach((b) =>
    b.addEventListener("click", () => {
      const p = store.getProducts().find((x) => x.id === b.dataset.stock);
      if (p) {
        store.upsertProduct({ ...p, inStock: !p.inStock });
        render();
      }
    })
  );
}

function sellerRow(p) {
  const img = p.image
    ? `<img src="${esc(p.image)}" alt="">`
    : `<div class="thumb-ph" aria-hidden="true">🛍️</div>`;
  return `
    <div class="seller-product-row">
      ${img}
      <div class="seller-product-info">
        <div class="name">${esc(p.name)}</div>
        <div class="meta">${money(p.price)}${p.category ? " · " + esc(p.category) : ""}</div>
      </div>
      <div class="row-actions">
        <button class="btn btn-ghost btn-sm" data-stock="${esc(p.id)}">
          ${p.inStock ? "✅ " : "🚫 "}${esc(tr("inStock"))}
        </button>
        <button class="btn btn-ghost btn-sm" data-edit="${esc(p.id)}">${esc(tr("edit"))}</button>
        <button class="btn btn-danger btn-sm" data-del="${esc(p.id)}">${esc(tr("delete"))}</button>
      </div>
    </div>`;
}

function productForm(p) {
  const isNew = !p;
  let image = p?.image || "";
  const veil = modal(`
    <h2>${esc(isNew ? tr("addProduct") : tr("editProduct"))}</h2>
    <form id="product-form" novalidate>
      <div class="field">
        <label>${esc(tr("productImage"))}</label>
        <img class="img-preview" id="pf-preview" src="${esc(image || "assets/logo.svg")}" alt=""
          style="${image ? "" : "opacity:0.25"}" >
        <div style="display:flex;gap:0.5rem;margin-top:0.5rem;flex-wrap:wrap">
          <button type="button" class="btn btn-ghost btn-sm" id="pf-upload">
            ${esc(image ? tr("changeImage") : tr("uploadImage"))}
          </button>
          ${image ? `<button type="button" class="btn btn-danger btn-sm" id="pf-rmimg">${esc(tr("removeImage"))}</button>` : ""}
        </div>
        <div class="help">${esc(tr("imageHint"))}</div>
        <input type="file" id="pf-file" accept="image/*" hidden>
      </div>
      <div class="field" id="pf-f-name">
        <label for="pf-name">${esc(tr("productName"))}</label>
        <input type="text" id="pf-name" maxlength="80" value="${esc(p?.name || "")}">
      </div>
      <div class="field-row">
        <div class="field" id="pf-f-price">
          <label for="pf-price">${esc(tr("productPrice"))}</label>
          <input type="text" inputmode="decimal" id="pf-price" value="${p ? p.price : ""}">
        </div>
        <div class="field">
          <label for="pf-compare">${esc(tr("comparePrice"))}</label>
          <input type="text" inputmode="decimal" id="pf-compare" value="${p?.compareAt ?? ""}">
        </div>
      </div>
      <div class="field">
        <label for="pf-cat">${esc(tr("productCategory"))}</label>
        <input type="text" id="pf-cat" maxlength="40" value="${esc(p?.category || "")}">
      </div>
      <div class="field">
        <label for="pf-desc">${esc(tr("productDesc"))}</label>
        <textarea id="pf-desc" rows="3" maxlength="500">${esc(p?.desc || "")}</textarea>
      </div>
      <label class="check-row">
        <input type="checkbox" id="pf-stock" ${p?.inStock === false ? "" : "checked"}>
        ${esc(tr("inStock"))}
      </label>
      <div class="error-text" id="pf-error" style="display:none;color:var(--danger)">${esc(tr("namePriceRequired"))}</div>
      <div style="display:flex;gap:0.6rem;margin-top:1rem">
        <button type="submit" class="btn btn-primary" style="flex:1">${esc(tr("saveProduct"))}</button>
        <button type="button" class="btn btn-ghost" id="pf-cancel">${esc(tr("cancel"))}</button>
      </div>
    </form>`);

  const $ = (sel) => veil.querySelector(sel);
  const preview = $("#pf-preview");

  function setImage(dataUrl) {
    image = dataUrl;
    preview.src = image || "assets/logo.svg";
    preview.style.opacity = image ? "1" : "0.25";
  }

  $("#pf-upload").addEventListener("click", () => $("#pf-file").click());
  $("#pf-rmimg")?.addEventListener("click", () => setImage(""));
  $("#pf-file").addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImage(await fileToDataUrl(file));
    } catch {
      toast("⚠️");
    }
  });
  $("#pf-cancel").addEventListener("click", closeModal);

  $("#product-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#pf-name").value.trim();
    const price = parsePrice($("#pf-price").value);
    const compareAt = parsePrice($("#pf-compare").value);
    const bad = !name || price == null || price < 0;
    $("#pf-error").style.display = bad ? "block" : "none";
    if (bad) return;
    store.upsertProduct({
      id: p?.id,
      name,
      price,
      compareAt,
      category: $("#pf-cat").value.trim(),
      desc: $("#pf-desc").value.trim(),
      image,
      inStock: $("#pf-stock").checked,
      created: p?.created,
    });
    closeModal();
    render();
  });
}
