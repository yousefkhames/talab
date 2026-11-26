// Talab core: formatting and text utilities. Pure functions, no DOM, no storage.
// Works in the browser (ES module) and in Node (tests).

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function uid(prefix = "id") {
  const rand = Math.random().toString(36).slice(2, 8);
  const time = Date.now().toString(36);
  return `${prefix}_${time}${rand}`;
}

export function shortOrderId() {
  // Human friendly order reference, e.g. "TLB-4F9K2Q"
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `TLB-${out}`;
}

// Parse a user typed price like "1,250.50" or "١٢٥٠٫٥" into a number, or null.
export function parsePrice(input) {
  if (typeof input === "number") return Number.isFinite(input) ? input : null;
  if (typeof input !== "string") return null;
  let s = input.trim();
  if (!s) return null;
  // Arabic-Indic digits -> Latin
  s = s.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
  // Arabic decimal separator and thousands
  s = s.replace(/٫/g, ".").replace(/٬/g, "").replace(/,/g, "");
  s = s.replace(/[^0-9.\-]/g, "");
  if (!s || s === "-" || s === ".") return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100) / 100;
}

// Format money with the shop's currency symbol and the active UI locale.
// Latin digits everywhere: Egyptian sellers write prices in Latin digits.
export function formatMoney(amount, settings, lang) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "";
  const symbol = (settings && settings.currencySymbol) || "";
  const locale = lang === "ar" ? "ar-EG-u-nu-latn" : "en-US";
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
  return symbol ? `${formatted} ${symbol}` : formatted;
}

// Normalize a WhatsApp number to international digits only (wa.me format).
// Local Egyptian numbers (01xxxxxxxxx) get the default country code applied.
export function normalizeWhatsApp(raw, defaultCountryCode = "20") {
  if (typeof raw !== "string") return "";
  let s = raw.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
  s = s.replace(/[^0-9+]/g, "");
  if (s.startsWith("+")) s = s.slice(1);
  const cc = String(defaultCountryCode || "").replace(/[^0-9]/g, "");
  if (s.startsWith("00")) s = s.slice(2);
  // Local mobile starting with 0 (Egypt style) -> country code + rest
  if (cc && s.startsWith("0") && !s.startsWith(cc)) s = cc + s.slice(1);
  // Bare national mobile without leading 0, e.g. 10xxxxxxxx for EG
  else if (cc && !s.startsWith(cc) && s.length >= 9 && s.length <= 10) s = cc + s;
  return s.replace(/[^0-9]/g, "");
}

export function isValidWhatsApp(digits) {
  // wa.me expects a full international number, 8 to 15 digits.
  return /^[0-9]{8,15}$/.test(digits);
}

export function clampText(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

export function isHexColor(value) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(String(value || "").trim());
}

export function formatTime(ts, lang) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(lang === "ar" ? "ar-EG-u-nu-latn" : "en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}
