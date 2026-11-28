/* MIT · Copyright (c) 2026 Yousef Khames · shared storefront logic for talab, mahal and lebs (browser and Node). */
(function (root) {
  'use strict';
  const str = (v, n) => String(v == null ? '' : v).slice(0, n || 200);
  const bi = (o) => ({ ar: str(o && o.ar), en: str(o && o.en) });
  const num = (p) => { if (p === null || p === '' || p === undefined) return null; const n = Number(p); return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null; };
  const list = (a, n) => (Array.isArray(a) ? a : String(a || '').split(/[,،]/)).map((x) => str(x, 24).trim()).filter(Boolean).filter((x, i, arr) => arr.indexOf(x) === i).slice(0, n || 12);
  const IMG = /^(data:image\/(jpeg|png|webp);base64,[\w+/=]+|(\.\/)?img\/[\w.-]+\.(jpe?g|png|webp|svg))$/i;
  const handle = (h) => /^[\w.]{1,40}$/.test(String(h || '').replace(/^@/, '')) ? String(h).replace(/^@/, '') : '';

  function normalize(c) {
    c = c && typeof c === 'object' ? c : {};
    const cats = (Array.isArray(c.categories) ? c.categories : []).map((x, i) => ({ id: str(x && x.id, 40) || 'c' + (i + 1), name: bi(x && x.name) }));
    const ids = new Set(cats.map((x) => x.id));
    const products = (Array.isArray(c.products) ? c.products : []).map((p, i) => ({
      id: str(p && p.id, 40).replace(/[^\w-]/g, '') || 'p' + (i + 1), cat: ids.has(p && p.cat) ? p.cat : '',
      name: bi(p && p.name), desc: bi(p && p.desc), price: num(p && p.price), compareAt: num(p && p.compareAt),
      sizes: list(p && p.sizes), colors: list(p && p.colors), out: list(p && p.out, 200), soldOut: !!(p && p.soldOut), demo: !!(p && p.demo),
      img: IMG.test(p && p.img || '') ? p.img : '', isNew: !!(p && p.isNew)
    }));
    const s = c.social || {};
    return { v: 1, demo: !!c.demo, shop: bi(c.shop), about: bi(c.about), currency: str(c.currency, 12), whatsapp: str(c.whatsapp, 20),
      social: { instagram: handle(s.instagram), facebook: handle(s.facebook), tiktok: handle(s.tiktok), messenger: handle(s.messenger) },
      sizeGuide: (Array.isArray(c.sizeGuide) ? c.sizeGuide : []).slice(0, 12).map((r) => ({ size: str(r && r.size, 12), note: bi(r && r.note) })),
      categories: cats, products };
  }
  const key = (s, c) => (s || '') + '|' + (c || '');
  function combos(p) {
    const S = p.sizes.length ? p.sizes : [''], C = p.colors.length ? p.colors : [''];
    return S.flatMap((s) => C.map((c) => ({ size: s, color: c, key: key(s, c) })));
  }
  const available = (p, size, color) => !p.soldOut && !p.out.includes(key(size, color));
  const hasStock = (p) => combos(p).some((v) => available(p, v.size, v.color));
  function visible(c, f) {
    f = f || {}; const q = str(f.q).trim().toLowerCase();
    let r = c.products.filter((p) => (!f.cat || p.cat === f.cat) && (!f.size || p.sizes.includes(f.size)) && (!f.color || p.colors.includes(f.color)) &&
      (f.min == null || (p.price !== null && p.price >= f.min)) && (f.max == null || (p.price !== null && p.price <= f.max)) &&
      (!f.wish || f.wish.includes(p.id)) && (!f.inStock || hasStock(p)) && (!q || [p.name.ar, p.name.en, p.desc.ar, p.desc.en].some((x) => x.toLowerCase().includes(q))));
    if (f.sort === 'low') r = r.slice().sort((a, b) => (a.price == null) - (b.price == null) || a.price - b.price);
    if (f.sort === 'high') r = r.slice().sort((a, b) => (a.price == null) - (b.price == null) || b.price - a.price);
    return r;
  }
  const allSizes = (c) => [...new Set(c.products.flatMap((p) => p.sizes))];
  const allColors = (c) => [...new Set(c.products.flatMap((p) => p.colors))];
  /* cart: array of {pid,size,color,qty} */
  function addLine(cart, pid, size, color, qty) {
    const k = pid + '|' + key(size, color); const out = cart.map((l) => Object.assign({}, l)); const l = out.find((x) => x.k === k);
    if (l) l.qty = Math.min(99, l.qty + qty); else out.push({ k, pid, size: size || '', color: color || '', qty: Math.min(99, qty) });
    return out;
  }
  function setQty(cart, k, qty) { return cart.map((l) => l.k === k ? Object.assign({}, l, { qty }) : l).filter((l) => l.qty > 0); }
  function prune(c, cart) { return cart.filter((l) => { const p = c.products.find((x) => x.id === l.pid); return p && available(p, l.size, l.color); }); }
  function totals(c, cart) {
    let total = 0, unpriced = 0, count = 0;
    cart.forEach((l) => { const p = c.products.find((x) => x.id === l.pid); if (!p) return; count += l.qty; if (p.price === null) unpriced++; else total += p.price * l.qty; });
    return { total: Math.round(total * 100) / 100, unpriced, count };
  }
  function orderText(c, cart, lang, o) {
    o = o || {}; const L = lang === 'en';
    const lines = cart.map((l) => { const p = c.products.find((x) => x.id === l.pid); if (!p) return ''; const v = [l.size, l.color].filter(Boolean).join(' / ');
      return l.qty + ' × ' + (p.name[lang] || p.name.ar || p.name.en) + (v ? ' (' + v + ')' : '') + (p.price === null ? '' : ' - ' + p.price * l.qty + (c.currency ? ' ' + c.currency : '')); }).filter(Boolean);
    const t = totals(c, cart);
    return [(c.demo ? (L ? '[DEMO order] ' : '[طلب تجريبي] ') : '') + (L ? 'New order' : 'طلب جديد') + (o.shop ? ' - ' + o.shop : ''), ...lines,
      t.unpriced ? '' : (L ? 'Total (shop prices): ' : 'الإجمالي حسب أسعار المتجر: ') + t.total + (c.currency ? ' ' + c.currency : ''),
      o.name ? (L ? 'Name: ' : 'الاسم: ') + o.name : '', o.note ? (L ? 'Note: ' : 'ملاحظة: ') + o.note : ''].filter(Boolean).join('\n');
  }
  const social = (c) => { const s = c.social, out = [];
    if (s.instagram) out.push({ id: 'instagram', url: 'https://www.instagram.com/' + s.instagram, label: '@' + s.instagram });
    if (s.facebook) out.push({ id: 'facebook', url: 'https://www.facebook.com/' + s.facebook, label: s.facebook });
    if (s.tiktok) out.push({ id: 'tiktok', url: 'https://www.tiktok.com/@' + s.tiktok, label: '@' + s.tiktok });
    if (s.messenger) out.push({ id: 'messenger', url: 'https://m.me/' + s.messenger, label: 'Messenger' });
    return out; };
  function productUrl(base, id) { return String(base || '').split('#')[0] + '#/p/' + id; }
  function clearDemo(c) { return Object.assign({}, c, { demo: false, products: c.products.filter((p) => !p.demo) }); }
  function toDataJs(c) { return '/* Published catalog exported from the builder (#/edit). Replace catalog-data.js with this file and commit. */\nwindow.CATALOG_DATA = ' + JSON.stringify(normalize(c), null, 2).replace(/</g, '\\u003c') + ';\n'; }
  function art(p) { // demo placeholder tile, plain SVG, no external image
    let h = 0; for (const ch of p.id) h = (h * 31 + ch.charCodeAt(0)) % 360;
    const t = (p.name.en || p.name.ar || '?').trim().charAt(0).toUpperCase();
    return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="hsl(' + h + ',35%,82%)"/><text x="100" y="118" text-anchor="middle" font-size="84" font-family="sans-serif" fill="hsl(' + h + ',40%,26%)">' + t.replace(/[<&]/g, '') + '</text><text x="100" y="186" text-anchor="middle" font-size="16" font-family="sans-serif" fill="hsl(' + h + ',40%,26%)">DEMO</text></svg>');
  }
  const api = { normalize, combos, available, hasStock, visible, allSizes, allColors, addLine, setQty, prune, totals, orderText, social, productUrl, clearDemo, toDataJs, art, key };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.ShopCore = api;
})(globalThis);
