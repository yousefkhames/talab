// Talab core: build the WhatsApp order message and wa.me deep link.
// Pure functions, no DOM. Tested in Node.

import { formatMoney } from "./format.js";

function line(label, value) {
  const v = String(value ?? "").trim();
  return v ? `${label}: ${v}` : null;
}

// items: [{name, price, qty}]
export function buildOrderMessage({ shopName, order, settings, lang }) {
  const ar = lang === "ar";
  const L = ar
    ? {
        newOrder: "طلب جديد",
        qty: "×",
        subtotal: "المجموع الفرعي",
        delivery: "التوصيل",
        free: "مجاني",
        total: "الإجمالي",
        name: "الاسم",
        phone: "الموبايل",
        address: "العنوان",
        notes: "ملاحظات",
        orderNo: "رقم الطلب",
        via: "عبر تطبيق طلب",
      }
    : {
        newOrder: "New order",
        qty: "x",
        subtotal: "Subtotal",
        delivery: "Delivery",
        free: "Free",
        total: "Total",
        name: "Name",
        phone: "Phone",
        address: "Address",
        notes: "Notes",
        orderNo: "Order",
        via: "via Talab",
      };

  const money = (n) => formatMoney(n, settings, lang);
  const lines = [];
  lines.push(`🛒 ${L.newOrder} — ${shopName}`);
  lines.push("");
  for (const it of order.items) {
    lines.push(`• ${it.qty} ${L.qty} ${it.name} — ${money(it.price * it.qty)}`);
  }
  lines.push("");
  lines.push(`${L.subtotal}: ${money(order.subtotal)}`);
  lines.push(
    `${L.delivery}: ${order.delivery > 0 ? money(order.delivery) : L.free}`
  );
  lines.push(`${L.total}: ${money(order.total)}`);
  lines.push("");
  const customer = order.customer || {};
  [
    line(L.name, customer.name),
    line(L.phone, customer.phone),
    line(L.address, customer.address),
    line(L.notes, customer.notes),
  ]
    .filter(Boolean)
    .forEach((l) => lines.push(l));
  lines.push("");
  lines.push(`${L.orderNo}: ${order.id} · ${L.via}`);
  return lines.join("\n");
}

export function waLink(whatsAppDigits, message) {
  return `https://wa.me/${whatsAppDigits}?text=${encodeURIComponent(message)}`;
}
