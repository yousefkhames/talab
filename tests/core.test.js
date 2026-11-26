// Talab unit tests — run with: node --test tests/
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  escapeHtml,
  formatMoney,
  isHexColor,
  isValidWhatsApp,
  normalizeWhatsApp,
  parsePrice,
} from "../docs/js/core/format.js";
import { buildOrderMessage, waLink } from "../docs/js/core/whatsapp.js";
import { createStore, defaultSettings, sanitizeProduct, sanitizeSettings } from "../docs/js/core/store.js";
import { DICT, dirFor, missingKeys, t } from "../docs/js/core/i18n.js";

function memStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
}

// ---------- format ----------

test("parsePrice handles latin, commas and Arabic-Indic digits", () => {
  assert.equal(parsePrice("250"), 250);
  assert.equal(parsePrice("1,250.50"), 1250.5);
  assert.equal(parsePrice("٢٥٠"), 250);
  assert.equal(parsePrice("abc"), null);
  assert.equal(parsePrice(""), null);
  assert.equal(parsePrice("12.9"), 12.9);
});

test("formatMoney uses the shop symbol and latin digits", () => {
  const s = { currencySymbol: "ج.م" };
  assert.equal(formatMoney(250, s, "ar"), "250 ج.م");
  assert.equal(formatMoney(1250.5, s, "en"), "1,250.5 ج.م");
  assert.equal(formatMoney(NaN, s, "en"), "");
});

test("normalizeWhatsApp converts Egyptian local numbers", () => {
  assert.equal(normalizeWhatsApp("01012345678", "20"), "201012345678");
  assert.equal(normalizeWhatsApp("+20 101 234 5678", "20"), "201012345678");
  assert.equal(normalizeWhatsApp("00201012345678", "20"), "201012345678");
  assert.equal(normalizeWhatsApp("١٠١٢٣٤٥٦٧٨", "20"), "201012345678");
  assert.equal(normalizeWhatsApp("1012345678", "20"), "201012345678");
});

test("isValidWhatsApp bounds length", () => {
  assert.ok(isValidWhatsApp("201012345678"));
  assert.ok(!isValidWhatsApp("123"));
  assert.ok(!isValidWhatsApp("1".repeat(16)));
  assert.ok(!isValidWhatsApp("20abc123456"));
});

test("escapeHtml escapes markup", () => {
  assert.equal(escapeHtml('<b>"x"</b>'), "&lt;b&gt;&quot;x&quot;&lt;/b&gt;");
});

test("isHexColor", () => {
  assert.ok(isHexColor("#0e7a5f"));
  assert.ok(isHexColor("#fff"));
  assert.ok(!isHexColor("red"));
  assert.ok(!isHexColor("#12345"));
});

// ---------- whatsapp message ----------

test("buildOrderMessage contains items, total and customer", () => {
  const settings = defaultSettings();
  const order = {
    id: "TLB-ABC123",
    items: [
      { name: "تيشيرت", price: 250, qty: 2 },
      { name: "كاب", price: 180, qty: 1 },
    ],
    subtotal: 680,
    delivery: 50,
    total: 730,
    customer: { name: "يوسف", phone: "01012345678", address: "اسكندرية", notes: "" },
  };
  const msg = buildOrderMessage({ shopName: "لمسة", order, settings, lang: "ar" });
  assert.ok(msg.includes("لمسة"));
  assert.ok(msg.includes("تيشيرت"));
  assert.ok(msg.includes("730"));
  assert.ok(msg.includes("يوسف"));
  assert.ok(msg.includes("TLB-ABC123"));
  assert.ok(!msg.includes("undefined"));
});

test("buildOrderMessage english + free delivery", () => {
  const settings = { ...defaultSettings(), currencySymbol: "EGP" };
  const order = {
    id: "TLB-X",
    items: [{ name: "Mug", price: 150, qty: 1 }],
    subtotal: 150,
    delivery: 0,
    total: 150,
    customer: { name: "Sam" },
  };
  const msg = buildOrderMessage({ shopName: "Shop", order, settings, lang: "en" });
  assert.ok(msg.includes("New order"));
  assert.ok(msg.includes("Free"));
  assert.ok(msg.includes("150 EGP"));
});

test("waLink encodes the message", () => {
  const link = waLink("201012345678", "مرحبا\nبالعالم");
  assert.ok(link.startsWith("https://wa.me/201012345678?text="));
  assert.ok(link.includes(encodeURIComponent("مرحبا")));
  assert.ok(!link.includes("\n"));
});

// ---------- i18n ----------

test("ar and en dictionaries have key parity", () => {
  const { missingInAr, missingInEn } = missingKeys();
  assert.deepEqual(missingInAr, []);
  assert.deepEqual(missingInEn, []);
});

test("t() falls back and interpolates", () => {
  assert.equal(t("ar", "total"), "الإجمالي");
  assert.equal(t("en", "total"), "Total");
  assert.equal(t("fr", "total"), "Total");
  assert.equal(t("en", "no-such-key"), "no-such-key");
  assert.equal(dirFor("ar"), "rtl");
  assert.equal(dirFor("en"), "ltr");
  for (const lang of ["ar", "en"]) {
    for (const v of Object.values(DICT[lang])) {
      assert.ok(!v.includes("undefined"), `undefined in ${lang} string`);
    }
  }
});

// ---------- store ----------

test("settings sanitize fixes junk and normalizes whatsapp", () => {
  const s = sanitizeSettings({
    shopName: "  محل  ",
    whatsapp: "010 1234 5678",
    countryCode: "20",
    primary: "not-a-color",
    deliveryFee: -5,
    lang: "de",
  });
  assert.equal(s.shopName, "محل");
  assert.equal(s.whatsapp, "201012345678");
  assert.equal(s.primary, defaultSettings().primary);
  assert.equal(s.deliveryFee, 0);
  assert.equal(s.lang, "ar");
});

test("products sanitize clamps and defaults", () => {
  const p = sanitizeProduct({ name: "x".repeat(200), price: "abc", inStock: false });
  assert.equal(p.name.length, 80);
  assert.equal(p.price, 0);
  assert.equal(p.inStock, false);
  assert.ok(p.id);
});

test("cart math and totals with delivery fee", () => {
  const store = createStore(memStorage());
  store.saveSettings({ ...defaultSettings(), deliveryFee: 30 });
  const a = store.upsertProduct({ name: "A", price: 100 });
  const b = store.upsertProduct({ name: "B", price: 50.5 });
  store.addToCart(a.id, 2);
  store.addToCart(b.id, 1);
  store.addToCart(a.id, 1);
  assert.equal(store.cartCount(), 4);
  const totals = store.cartTotals();
  assert.equal(totals.subtotal, 350.5);
  assert.equal(totals.delivery, 30);
  assert.equal(totals.total, 380.5);
  store.setQty(a.id, 0);
  assert.equal(store.cartCount(), 1);
  assert.equal(store.cartTotals().total, 80.5);
});

test("cart lines drop deleted products", () => {
  const store = createStore(memStorage());
  const a = store.upsertProduct({ name: "A", price: 10 });
  store.addToCart(a.id, 3);
  store.deleteProduct(a.id);
  assert.equal(store.cartLines().length, 0);
  assert.equal(store.cartTotals().total, 0);
});

test("order captures cart snapshot and clamps customer text", () => {
  const store = createStore(memStorage());
  store.saveSettings({ ...defaultSettings(), deliveryFee: 10 });
  const a = store.upsertProduct({ name: "A", price: 20 });
  store.addToCart(a.id, 2);
  const order = store.addOrder({ customer: { name: " نور ".repeat(40), phone: "010" }, lang: "ar" });
  assert.equal(order.items[0].qty, 2);
  assert.equal(order.total, 50);
  assert.ok(order.customer.name.length <= 60);
  assert.match(order.id, /^TLB-[A-Z2-9]{6}$/);
  store.setOrderStatus(order.id, "done");
  assert.equal(store.getOrders()[0].status, "done");
});

test("export/import round trip preserves shop and rejects junk", () => {
  const a = createStore(memStorage());
  a.saveSettings({ ...defaultSettings(), shopName: "محل نور", whatsapp: "01012345678" });
  a.upsertProduct({ name: "فستان", price: 800, category: "ملابس" });
  const data = a.exportShop();

  const b = createStore(memStorage());
  const result = b.importShop(JSON.parse(JSON.stringify(data)));
  assert.ok(result.ok);
  assert.equal(b.getSettings().shopName, "محل نور");
  assert.equal(b.getSettings().whatsapp, "201012345678");
  assert.equal(b.getProducts()[0].name, "فستان");

  assert.ok(!b.validateImport({ app: "other" }).ok);
  assert.ok(!b.validateImport(null).ok);
  assert.ok(!b.validateImport({ app: "talab", products: "nope" }).ok);
});
