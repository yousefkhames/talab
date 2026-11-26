// Talab views: cart, checkout form, WhatsApp handoff, success state.

import { buildOrderMessage, waLink } from "../core/whatsapp.js";
import { isValidWhatsApp } from "../core/format.js";
import { esc, money, render, renderHeader, settings, store, toast, tr, ui } from "../app.js";

export function renderCart(main) {
  const s = settings();
  const lines = store.cartLines();
  const totals = store.cartTotals(s);

  if (lines.length === 0) {
    main.innerHTML = `
      <div class="empty-state">
        <div class="big">🛒</div>
        <h2>${esc(tr("cartEmptyTitle"))}</h2>
        <p>${esc(tr("cartEmptyBody"))}</p>
        <a class="btn btn-primary" href="#/" data-nav>${esc(tr("continueShopping"))}</a>
      </div>`;
    return;
  }

  const linesHtml = lines
    .map(({ product: p, qty }) => {
      const img = p.image
        ? `<img src="${esc(p.image)}" alt="${esc(p.name)}">`
        : `<div class="thumb-ph" aria-hidden="true">🛍️</div>`;
      return `
      <div class="cart-line" data-line="${esc(p.id)}">
        ${img}
        <div class="cart-line-info">
          <div class="name">${esc(p.name)}</div>
          <div class="unit">${money(p.price)} ${esc(tr("each"))}</div>
          <button class="link-remove" data-remove="${esc(p.id)}">${esc(tr("remove"))}</button>
        </div>
        <div class="cart-line-side">
          <div class="qty-stepper">
            <button data-dec="${esc(p.id)}" aria-label="-">−</button>
            <span class="qty">${qty}</span>
            <button data-inc="${esc(p.id)}" aria-label="+">+</button>
          </div>
          <div class="cart-line-total">${money(p.price * qty)}</div>
        </div>
      </div>`;
    })
    .join("");

  const summary = `
    <div class="summary-card">
      <div class="summary-row"><span>${esc(tr("subtotal"))}</span><span>${money(totals.subtotal)}</span></div>
      <div class="summary-row"><span>${esc(tr("delivery"))}</span><span>${totals.delivery > 0 ? money(totals.delivery) : esc(tr("free"))}</span></div>
      <div class="summary-row grand"><span>${esc(tr("total"))}</span><span>${money(totals.total)}</span></div>
    </div>`;

  const form = `
    <form class="form-card" id="checkout-form" novalidate>
      <h2>${esc(tr("checkoutTitle"))}</h2>
      <div class="field" id="f-name">
        <label for="in-name">${esc(tr("yourName"))}</label>
        <input type="text" id="in-name" maxlength="60" autocomplete="name">
        <div class="error-text">${esc(tr("nameRequired"))}</div>
      </div>
      ${
        s.askPhone
          ? `<div class="field" id="f-phone">
              <label for="in-phone">${esc(tr("yourPhone"))}</label>
              <input type="tel" id="in-phone" maxlength="30" autocomplete="tel" inputmode="tel">
              <div class="error-text">${esc(tr("phoneRequired"))}</div>
            </div>`
          : ""
      }
      ${
        s.askAddress
          ? `<div class="field" id="f-address">
              <label for="in-address">${esc(tr("yourAddress"))}</label>
              <textarea id="in-address" rows="2" maxlength="200" autocomplete="street-address"></textarea>
              <div class="error-text">${esc(tr("addressRequired"))}</div>
            </div>`
          : ""
      }
      <div class="field">
        <label for="in-notes">${esc(tr("orderNotes"))}</label>
        <textarea id="in-notes" rows="2" maxlength="300"></textarea>
      </div>
      <button type="submit" class="btn btn-whatsapp btn-block" id="send-order">
        ${esc(tr("sendWhatsApp"))}
      </button>
      <button type="button" class="btn btn-ghost btn-block" id="copy-order" style="margin-top:0.5rem">
        ${esc(tr("copyOrder"))}
      </button>
      <p class="note-honest">${esc(tr("orderNoteHonest"))}</p>
    </form>`;

  main.innerHTML = `<h1 style="font-size:1.4rem">${esc(tr("yourCart"))}</h1>` + linesHtml + summary + form;

  main.querySelectorAll("[data-inc]").forEach((b) =>
    b.addEventListener("click", () => {
      store.addToCart(b.dataset.inc, 1);
      render();
    })
  );
  main.querySelectorAll("[data-dec]").forEach((b) =>
    b.addEventListener("click", () => {
      const cart = store.getCart();
      store.setQty(b.dataset.dec, (cart[b.dataset.dec] || 1) - 1);
      render();
    })
  );
  main.querySelectorAll("[data-remove]").forEach((b) =>
    b.addEventListener("click", () => {
      store.setQty(b.dataset.remove, 0);
      render();
    })
  );

  const formEl = main.querySelector("#checkout-form");

  function readCustomer() {
    return {
      name: formEl.querySelector("#in-name")?.value || "",
      phone: formEl.querySelector("#in-phone")?.value || "",
      address: formEl.querySelector("#in-address")?.value || "",
      notes: formEl.querySelector("#in-notes")?.value || "",
    };
  }

  function validate(customer) {
    let ok = true;
    const mark = (id, bad) => {
      formEl.querySelector(id)?.classList.toggle("invalid", bad);
      if (bad) ok = false;
    };
    mark("#f-name", !customer.name.trim());
    if (s.askPhone) mark("#f-phone", !customer.phone.trim());
    if (s.askAddress) mark("#f-address", !customer.address.trim());
    return ok;
  }

  function placeOrder(customer) {
    return store.addOrder({ customer, lang: ui.lang });
  }

  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const customer = readCustomer();
    if (!validate(customer)) return;
    if (!isValidWhatsApp(s.whatsapp)) {
      // No seller number yet: do not record a phantom order, tell the user inline.
      toast(tr("whatsappNotSet"));
      return;
    }
    const order = placeOrder(customer);
    const msg = buildOrderMessage({ shopName: s.shopName, order, settings: s, lang: ui.lang });
    window.open(waLink(s.whatsapp, msg), "_blank", "noopener");
    renderSuccess(main, order);
  });

  formEl.querySelector("#copy-order").addEventListener("click", () => {
    const customer = readCustomer();
    if (!validate(customer)) return;
    const order = placeOrder(customer);
    const msg = buildOrderMessage({ shopName: s.shopName, order, settings: s, lang: ui.lang });
    copyText(msg).then(() => toast(tr("copied")));
    renderSuccess(main, order);
  });
}

function renderSuccess(main, order) {
  store.clearCart();
  renderHeader();
  main.innerHTML = `
    <div class="success-hero">
      <div class="tick">✓</div>
      <h1>${esc(tr("orderReadyTitle"))}</h1>
      <p>${esc(tr("orderReadyBody"))} <strong>${esc(order.id)}</strong></p>
      <p class="note-honest">${esc(tr("orderNoteHonest"))}</p>
      <a class="btn btn-primary" href="#/" data-nav style="margin-top:1rem">${esc(tr("newOrderBtn"))}</a>
    </div>`;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}
