// Talab views: seller orders tab (orders placed on this device).

import { esc, money, render, store, tr } from "../app.js";
import { formatTime } from "../core/format.js";
import { ui } from "../app.js";

export function renderSellerOrders(body) {
  const orders = store.getOrders();
  body.innerHTML = `
    <div class="disclaimer">${esc(tr("ordersDisclaimer"))}</div>
    ${
      orders.length === 0
        ? `<div class="empty-state"><div class="big">🧾</div><p>${esc(tr("ordersEmpty"))}</p></div>`
        : orders.map(orderCard).join("")
    }`;

  body.querySelectorAll("[data-done]").forEach((b) =>
    b.addEventListener("click", () => {
      store.setOrderStatus(b.dataset.done, "done");
      render();
    })
  );
  body.querySelectorAll("[data-del-order]").forEach((b) =>
    b.addEventListener("click", () => {
      if (window.confirm(tr("confirmDeleteOrder"))) {
        store.deleteOrder(b.dataset.delOrder);
        render();
      }
    })
  );
}

function orderCard(o) {
  const items = o.items
    .map((it) => `<li>${it.qty} × ${esc(it.name)} — ${money(it.price * it.qty)}</li>`)
    .join("");
  const c = o.customer || {};
  return `
    <div class="order-card ${o.status === "done" ? "done" : ""}">
      <div class="order-head">
        <span class="order-id">${esc(o.id)}</span>
        <span class="order-time">${esc(formatTime(o.created, ui.lang))}</span>
      </div>
      <ul class="order-items">${items}</ul>
      <div class="order-customer">
        ${esc(tr("orderFrom"))}: <strong>${esc(c.name || "—")}</strong>
        ${c.phone ? ` · ${esc(c.phone)}` : ""}
        ${c.address ? `<br>${esc(c.address)}` : ""}
        ${c.notes ? `<br><em>${esc(c.notes)}</em>` : ""}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.5rem;gap:0.5rem;flex-wrap:wrap">
        <span class="order-total">${money(o.total)}</span>
        <span class="row-actions">
          ${
            o.status === "done"
              ? `<span class="chip">✓ ${esc(tr("done"))}</span>`
              : `<button class="btn btn-ghost btn-sm" data-done="${esc(o.id)}">${esc(tr("markDone"))}</button>`
          }
          <button class="btn btn-danger btn-sm" data-del-order="${esc(o.id)}">${esc(tr("delete"))}</button>
        </span>
      </div>
    </div>`;
}
