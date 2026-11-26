// Talab core: settings, products, cart and orders storage.
// Storage is injected so the same code runs in the browser (localStorage)
// and in Node tests (in-memory shim).

import { clampText, isHexColor, normalizeWhatsApp, shortOrderId, uid } from "./format.js";

export const STORE_VERSION = 1;
const K = {
  settings: "talab.settings.v1",
  products: "talab.products.v1",
  cart: "talab.cart.v1",
  orders: "talab.orders.v1",
  seeded: "talab.seeded.v1",
};

export function defaultSettings() {
  return {
    shopName: "متجر طلب",
    tagline: "اختار، اطلب، ويصلك الرد على واتساب",
    whatsapp: "", // international digits only, e.g. 201034310323
    countryCode: "20",
    currencyCode: "EGP",
    currencySymbol: "ج.م",
    lang: "ar", // default UI language: ar | en
    primary: "#0e7a5f",
    accent: "#f59e0b",
    logo: "", // dataURL or asset path
    deliveryFee: 0,
    askPhone: true,
    askAddress: true,
    instagram: "",
    facebook: "",
  };
}

function oneLine(v) {
  return String(v ?? "").replace(/\s*\n+\s*/g, " / ");
}

function read(storage, key, fallback) {
  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("talab:storage-failed"));
  }
}

export function sanitizeSettings(input, base = defaultSettings()) {
  const s = { ...base };
  const src = input && typeof input === "object" ? input : {};
  s.shopName = clampText(src.shopName ?? base.shopName, 60) || base.shopName;
  s.tagline = clampText(src.tagline ?? base.tagline, 140);
  s.countryCode = clampText(src.countryCode ?? base.countryCode, 4).replace(/[^0-9]/g, "") || "20";
  s.whatsapp = normalizeWhatsApp(String(src.whatsapp ?? base.whatsapp), s.countryCode);
  s.currencyCode = clampText(src.currencyCode ?? base.currencyCode, 8) || "EGP";
  s.currencySymbol = clampText(src.currencySymbol ?? base.currencySymbol, 8);
  s.lang = src.lang === "en" || src.lang === "ar" ? src.lang : base.lang;
  s.primary = isHexColor(src.primary) ? src.primary : base.primary;
  s.accent = isHexColor(src.accent) ? src.accent : base.accent;
  s.logo = typeof src.logo === "string" ? src.logo.slice(0, 400000) : base.logo;
  const fee = Number(src.deliveryFee ?? base.deliveryFee);
  s.deliveryFee = Number.isFinite(fee) && fee >= 0 ? Math.round(fee * 100) / 100 : 0;
  s.askPhone = src.askPhone !== false;
  s.askAddress = src.askAddress !== false;
  s.instagram = clampText(src.instagram ?? base.instagram, 120);
  s.facebook = clampText(src.facebook ?? base.facebook, 120);
  return s;
}

export function sanitizeProduct(input) {
  const src = input && typeof input === "object" ? input : {};
  const price = Number(src.price);
  const compareAt = src.compareAt === "" || src.compareAt == null ? null : Number(src.compareAt);
  return {
    id: typeof src.id === "string" && src.id ? src.id : uid("p"),
    name: clampText(src.name, 80),
    desc: clampText(src.desc, 500),
    price: Number.isFinite(price) && price >= 0 ? Math.round(price * 100) / 100 : 0,
    compareAt: Number.isFinite(compareAt) && compareAt > 0 ? Math.round(compareAt * 100) / 100 : null,
    category: clampText(src.category, 40),
    image: typeof src.image === "string" ? src.image.slice(0, 400000) : "",
    inStock: src.inStock !== false,
    created: Number.isFinite(src.created) ? src.created : Date.now(),
  };
}

export function createStore(storage) {
  return {
    // settings
    getSettings() {
      return sanitizeSettings(read(storage, K.settings, {}));
    },
    saveSettings(s) {
      write(storage, K.settings, sanitizeSettings(s));
      return this.getSettings();
    },

    // products
    getProducts() {
      const list = read(storage, K.products, []);
      return Array.isArray(list) ? list.map(sanitizeProduct) : [];
    },
    saveProducts(list) {
      write(storage, K.products, (Array.isArray(list) ? list : []).map(sanitizeProduct));
    },
    upsertProduct(p) {
      const product = sanitizeProduct(p);
      const list = this.getProducts();
      const i = list.findIndex((x) => x.id === product.id);
      if (i >= 0) list[i] = product;
      else list.unshift(product);
      this.saveProducts(list);
      return product;
    },
    deleteProduct(id) {
      this.saveProducts(this.getProducts().filter((p) => p.id !== id));
    },

    // cart: {productId: qty}
    getCart() {
      const c = read(storage, K.cart, {});
      return c && typeof c === "object" && !Array.isArray(c) ? c : {};
    },
    setQty(id, qty) {
      const cart = this.getCart();
      const q = Math.floor(Number(qty));
      if (!Number.isFinite(q) || q <= 0) delete cart[id];
      else cart[id] = Math.min(q, 99);
      write(storage, K.cart, cart);
      return cart;
    },
    addToCart(id, qty = 1) {
      const cart = this.getCart();
      return this.setQty(id, (cart[id] || 0) + qty);
    },
    clearCart() {
      write(storage, K.cart, {});
    },
    cartCount() {
      return Object.values(this.getCart()).reduce((a, b) => a + b, 0);
    },
    // cart lines joined with live product data; drops lines whose product is gone
    cartLines() {
      const cart = this.getCart();
      const products = this.getProducts();
      const lines = [];
      for (const [id, qty] of Object.entries(cart)) {
        const p = products.find((x) => x.id === id);
        if (p) lines.push({ product: p, qty });
      }
      return lines;
    },
    cartTotals(settings = this.getSettings()) {
      const lines = this.cartLines();
      const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
      const delivery = lines.length === 0 ? 0 : settings.deliveryFee || 0;
      return {
        subtotal: Math.round(subtotal * 100) / 100,
        delivery: Math.round(delivery * 100) / 100,
        total: Math.round((subtotal + delivery) * 100) / 100,
        count: lines.reduce((a, l) => a + l.qty, 0),
      };
    },

    // orders (placed on this device; the seller's copy arrives on WhatsApp)
    getOrders() {
      const list = read(storage, K.orders, []);
      return Array.isArray(list) ? list : [];
    },
    addOrder({ customer, lang }) {
      const settings = this.getSettings();
      const lines = this.cartLines();
      const totals = this.cartTotals(settings);
      const order = {
        id: shortOrderId(),
        created: Date.now(),
        lang,
        customer: {
          name: clampText(oneLine(customer?.name), 60),
          phone: clampText(oneLine(customer?.phone), 30),
          address: clampText(oneLine(customer?.address), 200),
          notes: clampText(oneLine(customer?.notes), 300),
        },
        items: lines.map((l) => ({ id: l.product.id, name: l.product.name, price: l.product.price, qty: l.qty })),
        subtotal: totals.subtotal,
        delivery: totals.delivery,
        total: totals.total,
        status: "sent",
      };
      const orders = this.getOrders();
      orders.unshift(order);
      write(storage, K.orders, orders.slice(0, 200));
      return order;
    },
    setOrderStatus(id, status) {
      const orders = this.getOrders();
      const o = orders.find((x) => x.id === id);
      if (o && (status === "sent" || status === "done")) {
        o.status = status;
        write(storage, K.orders, orders);
      }
      return o;
    },
    deleteOrder(id) {
      write(storage, K.orders, this.getOrders().filter((o) => o.id !== id));
    },

    // white-label export / import
    exportShop() {
      return {
        app: "talab",
        version: STORE_VERSION,
        exportedAt: new Date().toISOString(),
        settings: this.getSettings(),
        products: this.getProducts(),
      };
    },
    validateImport(data) {
      const errors = [];
      if (!data || typeof data !== "object") errors.push("not-object");
      else {
        if (data.app !== "talab") errors.push("not-talab-file");
        if (data.settings != null && typeof data.settings !== "object") errors.push("bad-settings");
        if (data.products != null && !Array.isArray(data.products)) errors.push("bad-products");
      }
      return { ok: errors.length === 0, errors };
    },
    importShop(data) {
      const check = this.validateImport(data);
      if (!check.ok) return check;
      if (data.settings) this.saveSettings(data.settings);
      if (data.products) this.saveProducts(data.products);
      this.clearCart();
      return { ok: true, errors: [] };
    },

    // first-run demo data
    isSeeded() {
      return read(storage, K.seeded, false) === true;
    },
    markSeeded() {
      write(storage, K.seeded, true);
    },
    resetAll() {
      for (const key of Object.values(K)) storage.removeItem(key);
    },
  };
}
