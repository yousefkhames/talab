// Talab views: seller settings tab — the white-label control panel.

import { esc, fileToDataUrl, render, settings, store, toast, tr, ui } from "../app.js";
import { normalizeWhatsApp, parsePrice } from "../core/format.js";

export function renderSellerSettings(body) {
  const s = settings();
  let logo = s.logo;

  body.innerHTML = `
    <form id="settings-form" novalidate>
      <div class="form-card">
        <h2>${esc(tr("shopIdentity"))}</h2>
        <div class="field">
          <label for="s-name">${esc(tr("shopName"))}</label>
          <input type="text" id="s-name" maxlength="60" value="${esc(s.shopName)}">
        </div>
        <div class="field">
          <label for="s-tagline">${esc(tr("shopTagline"))}</label>
          <input type="text" id="s-tagline" maxlength="140" value="${esc(s.tagline)}">
        </div>
        <div class="field">
          <label>${esc(tr("shopLogo"))}</label>
          <div style="display:flex;gap:0.6rem;align-items:center">
            <img id="s-logo-preview" src="${esc(logo || "assets/logo.svg")}" alt=""
              style="width:52px;height:52px;border-radius:12px;object-fit:cover;border:1px solid var(--line)">
            <button type="button" class="btn btn-ghost btn-sm" id="s-logo-btn">${esc(tr("uploadLogo"))}</button>
            ${logo ? `<button type="button" class="btn btn-danger btn-sm" id="s-logo-rm">${esc(tr("removeImage"))}</button>` : ""}
          </div>
          <input type="file" id="s-logo-file" accept="image/*" hidden>
        </div>
      </div>

      <div class="form-card">
        <h2>${esc(tr("contactSection"))}</h2>
        <div class="field-row">
          <div class="field">
            <label for="s-whatsapp">${esc(tr("whatsappNumber"))}</label>
            <input type="tel" id="s-whatsapp" maxlength="20" dir="ltr" value="${esc(s.whatsapp)}">
            <div class="help">${esc(tr("whatsappHelp"))}</div>
          </div>
          <div class="field">
            <label for="s-cc">${esc(tr("countryCode"))}</label>
            <input type="text" id="s-cc" maxlength="4" dir="ltr" inputmode="numeric" value="${esc(s.countryCode)}">
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="s-ig">${esc(tr("instagram"))}</label>
            <input type="url" id="s-ig" maxlength="120" dir="ltr" placeholder="https://instagram.com/…" value="${esc(s.instagram)}">
          </div>
          <div class="field">
            <label for="s-fb">${esc(tr("facebook"))}</label>
            <input type="url" id="s-fb" maxlength="120" dir="ltr" placeholder="https://facebook.com/…" value="${esc(s.facebook)}">
          </div>
        </div>
      </div>

      <div class="form-card">
        <h2>${esc(tr("moneySection"))}</h2>
        <div class="field-row">
          <div class="field">
            <label for="s-ccode">${esc(tr("currencyCode"))}</label>
            <input type="text" id="s-ccode" maxlength="8" dir="ltr" value="${esc(s.currencyCode)}">
          </div>
          <div class="field">
            <label for="s-csym">${esc(tr("currencySymbol"))}</label>
            <input type="text" id="s-csym" maxlength="8" value="${esc(s.currencySymbol)}">
          </div>
        </div>
        <div class="field">
          <label for="s-fee">${esc(tr("deliveryFee"))}</label>
          <input type="text" inputmode="decimal" id="s-fee" value="${s.deliveryFee}">
        </div>
      </div>

      <div class="form-card">
        <h2>${esc(tr("lookSection"))}</h2>
        <div class="field-row">
          <div class="field">
            <label>${esc(tr("primaryColor"))}</label>
            <div class="color-row">
              <input type="color" id="s-primary" value="${esc(s.primary)}">
              <span class="color-swatch-note">${esc(s.primary)}</span>
            </div>
          </div>
          <div class="field">
            <label>${esc(tr("accentColor"))}</label>
            <div class="color-row">
              <input type="color" id="s-accent" value="${esc(s.accent)}">
              <span class="color-swatch-note">${esc(s.accent)}</span>
            </div>
          </div>
        </div>
        <div class="field">
          <label for="s-lang">${esc(tr("defaultLanguage"))}</label>
          <select id="s-lang">
            <option value="ar" ${s.lang === "ar" ? "selected" : ""}>${esc(tr("arabic"))}</option>
            <option value="en" ${s.lang === "en" ? "selected" : ""}>${esc(tr("english"))}</option>
          </select>
        </div>
      </div>

      <div class="form-card">
        <h2>${esc(tr("checkoutSection"))}</h2>
        <label class="check-row"><input type="checkbox" id="s-askphone" ${s.askPhone ? "checked" : ""}> ${esc(tr("askPhone"))}</label>
        <label class="check-row"><input type="checkbox" id="s-askaddr" ${s.askAddress ? "checked" : ""}> ${esc(tr("askAddress"))}</label>
      </div>

      <button type="submit" class="btn btn-primary btn-block">${esc(tr("saveSettings"))}</button>
    </form>`;

  const $ = (sel) => body.querySelector(sel);

  // live hex label next to each color picker
  for (const id of ["#s-primary", "#s-accent"]) {
    $(id).addEventListener("input", (e) => {
      e.target.closest(".color-row").querySelector(".color-swatch-note").textContent = e.target.value;
    });
  }

  $("#s-logo-btn").addEventListener("click", () => $("#s-logo-file").click());
  $("#s-logo-rm")?.addEventListener("click", () => {
    logo = "";
    $("#s-logo-preview").src = "assets/logo.svg";
  });
  $("#s-logo-file").addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      logo = await fileToDataUrl(file, 400);
      $("#s-logo-preview").src = logo;
    } catch {
      toast("⚠️");
    }
  });

  $("#settings-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const cc = $("#s-cc").value.trim() || "20";
    const fee = parsePrice($("#s-fee").value);
    store.saveSettings({
      shopName: $("#s-name").value.trim() || s.shopName,
      tagline: $("#s-tagline").value.trim(),
      whatsapp: normalizeWhatsApp($("#s-whatsapp").value, cc),
      countryCode: cc,
      instagram: $("#s-ig").value.trim(),
      facebook: $("#s-fb").value.trim(),
      currencyCode: $("#s-ccode").value.trim() || "EGP",
      currencySymbol: $("#s-csym").value.trim(),
      deliveryFee: fee == null || fee < 0 ? 0 : fee,
      primary: $("#s-primary").value,
      accent: $("#s-accent").value,
      lang: $("#s-lang").value,
      askPhone: $("#s-askphone").checked,
      askAddress: $("#s-askaddr").checked,
      logo,
    });
    ui.lang = $("#s-lang").value;
    toast(tr("settingsSaved"));
    render();
  });
}
