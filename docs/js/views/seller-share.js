// Talab views: share tab — shop link, WhatsApp share, export/import, danger zone.

import { esc, render, shopUrl, store, toast, tr } from "../app.js";
import { demoProducts, demoSettings } from "../core/demo.js";

export function renderSellerShare(body) {
  const url = shopUrl();
  body.innerHTML = `
    <div class="form-card">
      <h2>${esc(tr("shareTitle"))}</h2>
      <p style="color:var(--ink-soft);font-size:0.92rem">${esc(tr("shareBody"))}</p>
      <div class="share-link-box" id="shop-url">${esc(url)}</div>
      <div style="display:flex;gap:0.6rem;margin-top:0.8rem;flex-wrap:wrap">
        <button class="btn btn-primary" id="copy-link">${esc(tr("copyLink"))}</button>
        <a class="btn btn-whatsapp" id="share-wa" target="_blank" rel="noopener">${esc(tr("shareWhatsApp"))}</a>
      </div>
    </div>

    <div class="form-card">
      <h2>${esc(tr("backupSection"))}</h2>
      <p style="color:var(--ink-soft);font-size:0.92rem">${esc(tr("exportHelp"))}</p>
      <div style="display:flex;gap:0.6rem;flex-wrap:wrap">
        <button class="btn btn-ghost" id="export-btn">⬇️ ${esc(tr("exportShop"))}</button>
        <button class="btn btn-ghost" id="import-btn">⬆️ ${esc(tr("importShop"))}</button>
        <input type="file" id="import-file" accept="application/json,.json" hidden>
      </div>
    </div>

    <div class="form-card danger-card">
      <h2>${esc(tr("dangerZone"))}</h2>
      <div style="display:flex;gap:0.6rem;flex-wrap:wrap">
        <button class="btn btn-ghost" id="reset-demo">🔄 ${esc(tr("resetDemo"))}</button>
        <button class="btn btn-danger" id="erase-all">🗑️ ${esc(tr("eraseAll"))}</button>
      </div>
    </div>`;

  const shareText = `${tr("shareText")} ${url}`;
  body.querySelector("#share-wa").href =
    "https://wa.me/?text=" + encodeURIComponent(shareText);

  body.querySelector("#copy-link").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    toast(tr("copied"));
  });

  body.querySelector("#export-btn").addEventListener("click", () => {
    const data = store.exportShop();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    const name = (data.settings.shopName || "talab").replace(/[\\/:*?"<>|]/g, "").trim() || "talab";
    a.href = URL.createObjectURL(blob);
    a.download = `${name}-talab-shop.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  });

  body.querySelector("#import-btn").addEventListener("click", () =>
    body.querySelector("#import-file").click()
  );
  body.querySelector("#import-file").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let data = null;
      try {
        data = JSON.parse(reader.result);
      } catch {
        data = null;
      }
      if (data && !window.confirm(tr("confirmRestore"))) return;
      const result = data ? store.importShop(data) : { ok: false };
      toast(tr(result.ok ? "importOk" : "importBad"));
      if (result.ok) setTimeout(() => location.reload(), 600);
    };
    reader.readAsText(file);
  });

  body.querySelector("#reset-demo").addEventListener("click", () => {
    store.saveSettings(demoSettings());
    store.saveProducts(demoProducts());
    store.clearCart();
    render();
  });

  body.querySelector("#erase-all").addEventListener("click", () => {
    if (window.confirm(tr("confirmErase"))) {
      store.resetAll();
      location.reload();
    }
  });
}
