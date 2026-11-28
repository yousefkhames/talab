/* MIT · Copyright (c) 2026 Yousef Khames · shared base for the YK white-label kits.
   Pure helpers work in the browser and in Node (tests). DOM helpers need a document. */
(function (root) {
  'use strict';
  const Kit = {};
  const hasDoc = typeof document !== 'undefined';

  /* ---------- text and ids ---------- */
  Kit.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  Kit.uid = (p) => (p || 'id') + '_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  Kit.now = () => (typeof root.__NOW === 'number' ? root.__NOW : Date.now());
  Kit.num = (v, fallback) => { const n = Number(String(v == null ? '' : v).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(',', '.')); return Number.isFinite(n) ? n : (fallback == null ? 0 : fallback); };
  Kit.money = (n, cur) => { const v = Kit.num(n); const s = (Math.round(v * 100) / 100).toFixed(v % 1 ? 2 : 0); return s + (cur ? ' ' + cur : ''); };

  /* ---------- language ---------- */
  Kit.dict = {};           // key -> [ar, en]
  Kit.lang = 'ar';
  Kit.t = (key, vars) => {
    const e = Kit.dict[key]; let s = e ? e[Kit.lang === 'ar' ? 0 : 1] : key;
    if (vars) Object.keys(vars).forEach((k) => { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  };
  Kit.pick = (o) => (o && typeof o === 'object') ? (o[Kit.lang] || o.ar || o.en || '') : (o || '');
  Kit.setLang = (l, key) => {
    Kit.lang = l === 'en' ? 'en' : 'ar';
    if (hasDoc) { document.documentElement.lang = Kit.lang; document.documentElement.dir = Kit.lang === 'ar' ? 'rtl' : 'ltr'; }
    try { localStorage.setItem((key || 'kit') + ':lang', Kit.lang); } catch (e) { /* storage unavailable */ }
  };
  Kit.initLang = (key) => { let l = 'ar'; try { l = localStorage.getItem((key || 'kit') + ':lang') || 'ar'; } catch (e) { /* noop */ } Kit.setLang(l, key); };
  Kit.byline = () => root.KitTheme ? root.KitTheme.author[Kit.lang] : (Kit.lang === 'ar' ? 'من تطوير يوسف خميس' : 'By Yousef Khames');

  /* ---------- theme ---------- */
  Kit.applyTheme = () => {
    if (!hasDoc || !root.KitTheme) return;
    const dark = root.matchMedia && root.matchMedia('(prefers-color-scheme: dark)').matches;
    const p = root.KitTheme.palette({}, dark);
    const s = document.documentElement.style;
    s.setProperty('--ink', p.ink); s.setProperty('--paper', p.paper); s.setProperty('--accent', p.accent); s.setProperty('--on-accent', p.onAccent);
    s.setProperty('--card', p.dark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.045)');
    s.setProperty('--line', p.dark ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.16)');
    const m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', p.paper);
    document.documentElement.dataset.mode = p.dark ? 'dark' : 'light';
  };
  Kit.shopName = (fallback) => {
    const c = root.KitTheme && root.KitTheme.config.name;
    return (c && (c[Kit.lang] || c.ar || c.en)) || fallback;
  };

  /* ---------- DOM ---------- */
  Kit.el = (tag, attrs, ...kids) => {
    const n = document.createElement(tag);
    Object.keys(attrs || {}).forEach((k) => {
      const v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else if (k === 'value') n.value = v;
      else if (k === 'checked' || k === 'disabled' || k === 'hidden' || k === 'selected') { if (v) n.setAttribute(k, ''); n[k] = !!v; }
      else n.setAttribute(k, v === true ? '' : v);
    });
    kids.flat(Infinity).forEach((c) => { if (c == null || c === false) return; n.append(c.nodeType ? c : document.createTextNode(c)); });
    return n;
  };
  Kit.toast = (msg) => {
    const t = document.getElementById('toast'); if (!t) return;
    t.textContent = msg; t.classList.add('on'); clearTimeout(Kit._tt);
    Kit._tt = setTimeout(() => t.classList.remove('on'), 2600);
  };
  Kit.footer = () => Kit.el('footer', { class: 'yk-footer' },
    Kit.el('img', { src: 'assets/yk-logo.svg', width: 24, height: 24, alt: '' }),
    Kit.el('span', { text: 'By Yousef Khames · من تطوير يوسف خميس' }));
  Kit.download = (name, text, mime) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: mime || 'text/plain;charset=utf-8' }));
    a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  Kit.readFile = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsText(file); });
  Kit.resizeImage = (file, max, quality) => new Promise((res, rej) => {
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', quality || 0.72));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('image')); };
    img.src = url;
  });

  /* ---------- store: versioned localStorage with safe handling of newer or corrupt data ---------- */
  Kit.store = (key, version, defaults, storage) => {
    const st = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    const copy = (o) => JSON.parse(JSON.stringify(o));
    const api = { key, version, blocked: false, data: copy(defaults) };
    api.load = () => {
      if (!st) return api.data;
      let raw = null; try { raw = st.getItem(key); } catch (e) { raw = null; }
      if (!raw) { api.data = copy(defaults); return api.data; }
      try {
        const o = JSON.parse(raw);
        if (!o || typeof o !== 'object' || typeof o.v !== 'number') throw new Error('shape');
        if (o.v > version) { api.blocked = 'newer'; api.data = copy(defaults); return api.data; }
        api.data = Object.assign(copy(defaults), o.data || {}); api.blocked = false;
      } catch (e) { api.blocked = 'corrupt'; api.data = copy(defaults); }
      return api.data;
    };
    api.save = () => {
      if (api.blocked || !st) return false;      // never overwrite unreadable state until reset
      try { st.setItem(key, JSON.stringify({ v: version, data: api.data })); return true; } catch (e) { return false; }
    };
    api.reset = () => { api.blocked = false; api.data = copy(defaults); if (st) { try { st.removeItem(key); } catch (e) { /* noop */ } } return api.data; };
    api.exportJSON = (kind) => JSON.stringify({ kit: key, kind: kind || 'backup', v: version, exportedAt: new Date(Kit.now()).toISOString(), data: api.data }, null, 2);
    api.importJSON = (text) => {
      let o; try { o = JSON.parse(text); } catch (e) { return { ok: false, error: 'json' }; }
      if (!o || o.kit !== key || typeof o.v !== 'number' || !o.data) return { ok: false, error: 'kit' };
      if (o.v > version) return { ok: false, error: 'newer' };
      return { ok: true, kind: o.kind, data: o.data };
    };
    api.load();
    return api;
  };

  /* ---------- WhatsApp: drafts only, never sent by the app ---------- */
  Kit.phone = (raw, cc) => {
    let d = String(raw || '').replace(/[٠-٩]/g, (x) => '٠١٢٣٤٥٦٧٨٩'.indexOf(x)).replace(/[^\d+]/g, '');
    if (d.startsWith('+')) d = d.slice(1);
    else if (d.startsWith('00')) d = d.slice(2);
    else if (d.startsWith('0')) d = (cc || '20') + d.slice(1);
    else if (cc && d.length <= 10) d = cc + d;
    return /^[1-9]\d{9,14}$/.test(d) ? d : '';
  };
  Kit.waLink = (phone, text) => {
    const p = Kit.phone(phone);
    const q = 'text=' + encodeURIComponent(text || '');
    const url = (p ? 'https://wa.me/' + p : 'https://wa.me/') + '?' + q;
    return { url, ok: !!p, long: url.length > 1900 };
  };

  /* ---------- QR (offline, qrcode-generator by Kazuhiko Arase, MIT) ---------- */
  Kit.qrSvg = (text, opts) => {
    opts = opts || {}; const Q = root.qrcode; if (!Q) return '';
    const q = Q(0, opts.level || 'M'); q.addData(String(text)); q.make();
    const n = q.getModuleCount(), m = opts.margin == null ? 4 : opts.margin; let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += 'M' + (c + m) + ' ' + (r + m) + 'h1v1h-1z';
    const s = n + m * 2;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + s + ' ' + s + '" shape-rendering="crispEdges" role="img" aria-label="QR"><rect width="' + s + '" height="' + s + '" fill="#fff"/><path d="' + d + '" fill="#000"/></svg>';
  };

  if (typeof module === 'object' && module.exports) module.exports = Kit; else root.Kit = Kit;
})(globalThis);
