/* MIT · Copyright (c) 2026 Yousef Khames · shared storefront UI. Each kit calls Shop.run(config) with its own features. */
(function (root) {
  'use strict';
  const { el, t, pick } = Kit, S = ShopCore;
  const A = (p, ...k) => p.append(...k.flat(Infinity).filter((x) => x != null && x !== false));
  function run(cfg) {
    const F = Object.assign({ variants: false, wishlist: false, filters: false, sizeGuide: false, social: false, messenger: false, share: false, qr: false, layout: 'grid' }, cfg.features);
    const pub = S.normalize(root.CATALOG_DATA);
    const store = Kit.store(cfg.id, 1, { draft: null, wish: [], qrUrl: '' });
    const app = document.getElementById('app');
    let f = { cat: '', q: '', size: '', color: '', max: null, sort: '', inStock: false }, cart = [], bagNote = '', bagName = '';
    const draft = () => store.data.draft ? S.normalize(store.data.draft) : null;
    const working = () => draft() || pub;
    const saveDraft = (c) => { store.data.draft = S.normalize(c); store.save(); };
    const route = () => location.hash.replace(/^#\/?/, '') || 'home';
    const field = (label, input) => el('label', { class: 'field' }, el('span', { text: label }), input);
    const price = (c, p) => p.price === null ? t('noPrice') : Kit.money(p.price, c.currency);
    const img = (p) => p.img || S.art(p);

    function header(r, c) {
      const tab = (id, href, label) => el('a', { class: 'tab' + (r === id ? ' on' : ''), href, 'aria-current': r === id ? 'page' : null }, label);
      return el('header', { class: 'top noprint' },
        el('div', { class: 'brand' }, el('img', { src: 'assets/favicon.svg', width: 28, height: 28, alt: '' }), el('strong', { text: Kit.shopName(pick(pub.shop) || t('title')) })),
        el('nav', { class: 'tabs', 'aria-label': 'Main' }, tab('home', '#/', t('shop')), F.wishlist ? tab('saved', '#/saved', t('saved') + (store.data.wish.length ? ' (' + store.data.wish.length + ')' : '')) : null,
          F.qr ? tab('qr', '#/qr', t('qr')) : null, tab('edit', '#/edit', t('owner'))),
        el('button', { class: 'btn small', onclick: () => { Kit.setLang(Kit.lang === 'ar' ? 'en' : 'ar', cfg.id); render(); } }, t('lang')));
    }
    function banners(c, useDraft) {
      return [c.demo ? el('div', { class: 'banner', role: 'note', text: t('demoBanner') }) : null, useDraft ? el('div', { class: 'banner', role: 'note', text: t('draftBanner') }) : null];
    }
    function card(c, p) {
      const wished = store.data.wish.includes(p.id), ok = S.hasStock(p);
      return el('article', { class: 'pcard' + (ok ? '' : ' out'), 'data-id': p.id },
        el('a', { class: 'pimg', href: '#/p/' + p.id, 'aria-label': pick(p.name) }, el('img', { src: img(p), alt: '', loading: 'lazy' })),
        el('div', { class: 'pbody' }, el('a', { class: 'pname', href: '#/p/' + p.id, text: pick(p.name) }),
          el('div', { class: 'row' }, el('span', { class: 'price', text: price(c, p) }), p.compareAt && p.price !== null ? el('s', { class: 'was', text: Kit.money(p.compareAt, c.currency) }) : null),
          el('div', { class: 'row' }, !ok ? el('span', { class: 'badge', text: t('soldOut') }) : null, p.isNew ? el('span', { class: 'badge', text: t('isNew') }) : null, p.demo ? el('span', { class: 'badge demo', text: t('demoTag') }) : null,
            F.wishlist ? el('button', { class: 'btn small heart', 'aria-pressed': String(wished), 'aria-label': wished ? t('unwish') : t('wish'), onclick: () => toggleWish(p.id) }, wished ? '♥' : '♡') : null)));
    }
    function toggleWish(id) { const w = store.data.wish; store.data.wish = w.includes(id) ? w.filter((x) => x !== id) : w.concat([id]); store.save(); render(); }

    function viewHome(c, useDraft, savedOnly) {
      const root = el('main', { id: 'main-content', tabindex: '-1', class: 'layout-' + F.layout });
      A(root, ...banners(c, useDraft));
      if (F.social) {
        const links = S.social(c);
        A(root, el('section', { class: 'profile' }, el('img', { class: 'avatar', src: 'assets/favicon.svg', alt: '' }), el('div', {}, el('h1', { text: pick(c.shop) || t('title') }), pick(c.about) ? el('p', { text: pick(c.about) }) : null,
          el('div', { class: 'row' }, links.map((l) => el('a', { class: 'btn small', href: l.url, target: '_blank', rel: 'noopener' }, l.label))))));
      } else A(root, el('h1', { text: savedOnly ? t('saved') : (pick(c.shop) || t('title')) }), !savedOnly && pick(c.about) ? el('p', { text: pick(c.about) }) : null);
      const inp = el('input', { type: 'search', 'aria-label': t('search'), placeholder: t('search'), value: f.q });
      const chips = el('div', { class: 'chips' }), list = el('div', { class: 'grid' }), flt = el('div', { class: 'filters row' });
      const sel = (label, val, opts, on) => el('label', { class: 'field mini' }, el('span', { text: label }), el('select', { onchange: (e) => on(e.target.value) }, opts.map(([v, l]) => el('option', { value: v, selected: v === val }, l))));
      const draw = () => {
        chips.replaceChildren(...[el('button', { class: 'chip' + (!f.cat ? ' on' : ''), 'aria-pressed': String(!f.cat), onclick: () => { f.cat = ''; draw(); } }, t('all')),
          ...c.categories.map((x) => el('button', { class: 'chip' + (f.cat === x.id ? ' on' : ''), 'aria-pressed': String(f.cat === x.id), onclick: () => { f.cat = x.id; draw(); } }, pick(x.name)))]);
        if (F.filters) flt.replaceChildren(sel(t('size'), f.size, [['', t('anySize')]].concat(S.allSizes(c).map((x) => [x, x])), (v) => { f.size = v; draw(); }),
          sel(t('color'), f.color, [['', t('anyColor')]].concat(S.allColors(c).map((x) => [x, x])), (v) => { f.color = v; draw(); }),
          sel(t('sort'), f.sort, [['', t('sortDef')], ['low', t('sortLow')], ['high', t('sortHigh')]], (v) => { f.sort = v; draw(); }),
          el('label', { class: 'field mini' }, el('span', { text: t('maxPrice') }), el('input', { id: 'f-max', type: 'number', inputmode: 'decimal', value: f.max == null ? '' : f.max, onchange: (e) => { f.max = e.target.value === '' ? null : Kit.num(e.target.value, null); draw(); } })),
          el('label', { class: 'row' }, el('input', { type: 'checkbox', id: 'f-stock', style: 'width:auto;min-height:0', checked: f.inStock, onchange: (e) => { f.inStock = e.target.checked; draw(); } }), el('span', { text: t('inStockOnly') })));
        const items = S.visible(c, Object.assign({}, f, { wish: savedOnly ? store.data.wish : null }));
        list.replaceChildren(...(items.length ? items.map((p) => card(c, p)) : [el('p', { text: savedOnly ? t('noSaved') : t('noProducts') })]));
      };
      inp.addEventListener('input', () => { f.q = inp.value; draw(); });
      A(root, inp, chips, F.filters ? flt : null, list); draw();
      return root;
    }

    function viewProduct(c, id) {
      const p = c.products.find((x) => x.id === id), root = el('main', { id: 'main-content', tabindex: '-1' });
      A(root, el('a', { class: 'btn small', href: '#/' }, '← ' + t('back')));
      if (!p) return (A(root, el('p', { text: t('noProducts') })), root);
      if (c.demo) A(root, el('div', { class: 'banner', role: 'note', text: t('demoBanner') }));
      let size = p.sizes.length === 1 ? p.sizes[0] : '', color = p.colors.length === 1 ? p.colors[0] : '';
      const pick2 = (label, vals, get, set) => el('div', { class: 'field' }, el('span', { text: label }), el('div', { class: 'row', role: 'group' }, vals.map((v) =>
        el('button', { class: 'chip opt' + (get() === v ? ' on' : ''), 'aria-pressed': String(get() === v), 'data-v': v, onclick: (e) => { set(v); e.currentTarget.parentNode.querySelectorAll('.opt').forEach((b) => { const on = b.dataset.v === v; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }); update(); } },
          v + (p.sizes.length && vals === p.sizes && p.colors.length === 0 && !S.available(p, v, '') ? ' ✕' : '')))));
      const addBtn = el('button', { class: 'btn primary', id: 'add-bag', onclick: () => {
        if (!S.available(p, size, color) || (p.sizes.length && !size) || (p.colors.length && !color)) return Kit.toast(t('pickVariant'));
        cart = S.addLine(cart, p.id, size, color, 1); Kit.toast(t('added')); drawBar(); } }, t('add'));
      const update = () => { if (!S.hasStock(p)) { addBtn.disabled = true; addBtn.textContent = t('soldOut'); return; } const need = (p.sizes.length && !size) || (p.colors.length && !color); const ok = !need && S.available(p, size, color); addBtn.disabled = need ? false : !ok; addBtn.textContent = need ? t('add') : (ok ? t('add') : t('soldOut')); };
      A(root, el('div', { class: 'pdetail' }, el('img', { class: 'pbig', src: img(p), alt: '' }), el('div', {},
        el('h1', { text: pick(p.name) }), el('div', { class: 'row' }, el('span', { class: 'price big', text: price(c, p) }), p.compareAt && p.price !== null ? el('s', { class: 'was', text: Kit.money(p.compareAt, c.currency) }) : null, p.demo ? el('span', { class: 'badge demo', text: t('demoTag') }) : null),
        pick(p.desc) ? el('p', { text: pick(p.desc) }) : null,
        F.variants && p.sizes.length ? pick2(t('size'), p.sizes, () => size, (v) => { size = v; }) : null,
        F.variants && p.colors.length ? pick2(t('color'), p.colors, () => color, (v) => { color = v; }) : null,
        F.variants && F.sizeGuide && p.sizes.length ? el('p', {}, el('button', { class: 'btn small', onclick: () => guideSheet(c) }, t('sizeGuide'))) : null,
        el('div', { class: 'row' }, addBtn,
          F.wishlist ? el('button', { class: 'btn', 'aria-pressed': String(store.data.wish.includes(p.id)), onclick: () => toggleWish(p.id) }, store.data.wish.includes(p.id) ? '♥ ' + t('unwish') : '♡ ' + t('wish')) : null,
          F.share ? el('button', { class: 'btn', id: 'share', onclick: async () => { const u = S.productUrl(location.href, p.id); try { if (navigator.share) await navigator.share({ title: pick(p.name), url: u }); else { await navigator.clipboard.writeText(u); Kit.toast(t('linkCopied')); } } catch (e) { /* cancelled */ } } }, t('share')) : null))));
      update(); return root;
    }
    function guideSheet(c) {
      const sheet = el('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('sizeGuide') });
      A(sheet, el('div', { class: 'panel' }, el('h2', { text: t('sizeGuide') }), c.demo ? el('p', { class: 'banner', text: t('sizeGuideDemo') }) : null,
        c.sizeGuide.length ? el('table', { class: 'guide' }, c.sizeGuide.map((r) => el('tr', {}, el('th', { text: r.size }), el('td', { text: pick(r.note) })))) : el('p', { text: t('sizeGuideNone') }),
        el('button', { class: 'btn', onclick: () => sheet.remove() }, t('close'))));
      sheet.addEventListener('keydown', (e) => { if (e.key === 'Escape') sheet.remove(); }); document.body.append(sheet);
    }

    /* ---------- bag ---------- */
    const bar = el('div', { class: 'cartbar noprint' });
    function drawBar() {
      const n = S.totals(pub, cart).count; bar.replaceChildren(); bar.hidden = !n || /^(edit|qr)/.test(route());
      if (!bar.hidden) A(bar, el('button', { class: 'btn primary wide', id: 'open-bag', onclick: bagSheet }, t('bag') + ' · ' + t('items', { n })));
    }
    function bagSheet() {
      const sheet = el('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('bag') }), panel = el('div', { class: 'panel' }); A(sheet, panel);
      const close = () => { sheet.remove(); drawBar(); };
      const before = cart.length; cart = S.prune(pub, cart);
      const draw = (dropped) => {
        panel.replaceChildren(el('h2', { text: t('bag') }));
        if (dropped) A(panel, el('p', { class: 'banner', role: 'alert', text: t('dropped') }));
        if (!cart.length) return A(panel, el('p', { text: t('bagEmpty') }), el('button', { class: 'btn', onclick: close }, t('close')));
        cart.forEach((l) => { const p = pub.products.find((x) => x.id === l.pid);
          A(panel, el('div', { class: 'row line', 'data-k': l.k }, el('span', { class: 'grow', text: pick(p.name) + ([l.size, l.color].filter(Boolean).length ? ' (' + [l.size, l.color].filter(Boolean).join(' / ') + ')' : '') }),
            el('button', { class: 'btn small', 'aria-label': '-', onclick: () => { cart = S.setQty(cart, l.k, l.qty - 1); draw(); } }, '−'), el('strong', { text: String(l.qty) }),
            el('button', { class: 'btn small', 'aria-label': '+', onclick: () => { cart = S.setQty(cart, l.k, Math.min(99, l.qty + 1)); draw(); } }, '+'))); });
        const tt = S.totals(pub, cart);
        const nm = el('input', { id: 'bag-name', value: bagName, onchange: (e) => { bagName = e.target.value; } }), nt = el('textarea', { id: 'bag-note', onchange: (e) => { bagNote = e.target.value; } }, bagNote);
        A(panel, el('p', { class: 'total' }, t('total') + ': ', el('strong', { text: Kit.money(tt.total, pub.currency) })), el('p', { class: 'small', text: tt.unpriced ? t('priceCheck') : t('totalNote') }), field(t('yourName'), nm), field(t('orderNote'), nt),
          el('div', { class: 'row' }, el('button', { class: 'btn primary', id: 'prepare', onclick: () => { bagName = nm.value; bagNote = nt.value; prepare(sheet); } }, t('orderWa')), el('button', { class: 'btn', onclick: () => { cart = []; draw(); } }, t('clearBag')), el('button', { class: 'btn', onclick: close }, t('close'))));
      };
      sheet.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
      draw(before !== cart.length); document.body.append(sheet);
    }
    function prepare(sheet) {
      const text = S.orderText(pub, cart, Kit.lang, { shop: pick(pub.shop), name: bagName.trim(), note: bagNote.trim() });
      const wa = Kit.waLink(pub.whatsapp, text), ms = F.messenger && pub.social.messenger;
      sheet.firstChild.replaceChildren(...[el('h2', { text: t('orderWa') }), el('pre', { class: 'ordertext', id: 'order-text', text }),
        el('p', { class: 'banner', role: 'note', text: ms && !wa.ok ? t('howMsg') : t('howSend') }),
        !wa.ok && !ms ? el('p', { text: t('noWa') }) : null, wa.ok && wa.long ? el('p', { text: t('longMsg') }) : null,
        el('div', { class: 'row' }, wa.ok && !wa.long ? el('a', { class: 'btn primary', id: 'wa-link', href: wa.url, target: '_blank', rel: 'noopener' }, t('orderWa')) : null,
          ms ? el('a', { class: 'btn', id: 'ms-link', href: 'https://m.me/' + pub.social.messenger, target: '_blank', rel: 'noopener', onclick: () => { try { navigator.clipboard.writeText(text); } catch (e) { /* copy manually */ } } }, t('orderMsg')) : null,
          el('button', { class: 'btn', id: 'copy-order', onclick: async () => { try { await navigator.clipboard.writeText(text); Kit.toast(t('copied')); } catch (e) { const r = document.createRange(); r.selectNodeContents(document.getElementById('order-text')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); } } }, t('copy')),
          el('button', { class: 'btn', onclick: () => sheet.remove() }, t('close')))].filter(Boolean));
    }

    /* ---------- QR ---------- */
    function viewQr() {
      const root = el('main', { id: 'main-content', tabindex: '-1' }), out = el('div', { class: 'qrcard' });
      const inp = el('input', { id: 'qr-url', type: 'url', inputmode: 'url', placeholder: 'https://yousefkhames.github.io/' + cfg.id + '/', value: store.data.qrUrl, 'aria-label': t('qrUrl') });
      const draw = () => { out.replaceChildren(); const v = inp.value.trim(); if (!v) return;
        if (/^https?:\/\/(localhost|127\.|192\.168\.)/.test(v) || !/^https?:\/\//.test(v)) A(out, el('p', { class: 'banner noprint', role: 'alert', text: t('qrLocal') }));
        const box = el('div', { class: 'qrbox' }); box.innerHTML = Kit.qrSvg(v);
        A(out, el('div', { class: 'tcard' }, el('h2', { text: pick(pub.shop) || t('title') }), box, el('p', { text: t('scan') }), el('small', { class: 'mono', text: v }),
          el('div', { class: 'yk-footer small' }, el('img', { src: 'assets/yk-logo.svg', width: 16, height: 16, alt: '' }), el('span', { text: 'By Yousef Khames · من تطوير يوسف خميس' }))), el('button', { class: 'btn primary noprint', onclick: () => window.print() }, t('print'))); };
      inp.addEventListener('input', () => { store.data.qrUrl = inp.value.trim(); store.save(); draw(); });
      A(root, el('h1', { text: t('qrTitle') }), field(t('qrUrl'), inp), out); draw(); return root;
    }

    /* ---------- owner builder ---------- */
    function viewEdit() {
      const root = el('main', { id: 'main-content', tabindex: '-1' });
      if (store.blocked) A(root, el('div', { class: 'banner', role: 'alert', text: t('blocked') }), el('button', { class: 'btn danger', onclick: () => { if (confirm(t('confirmReset'))) { store.reset(); render(); } } }, t('resetAll')));
      const c = working(), commit = (n, quiet) => { saveDraft(n); if (!quiet) Kit.toast(t('savedMsg')); render(); };
      A(root, el('h1', { text: t('owner') }), el('div', { class: 'banner', role: 'note', text: t('publishHelp') }));
      if (c.demo) A(root, el('div', { class: 'banner', role: 'note', text: t('demoBanner') }));
      const st = { c: c.categories.length, p: c.products.length, s: c.products.filter((p) => !S.hasStock(p)).length, n: c.products.filter((p) => p.price === null).length };
      A(root, el('p', { text: t('statsLine', st) }));
      const inp = (id, v, type) => el('input', { id, value: v, type: type || 'text' }), shop = { ar: inp('f-shop-ar', c.shop.ar), en: inp('f-shop-en', c.shop.en) }, ab = { ar: el('textarea', { id: 'f-about-ar' }, c.about.ar), en: el('textarea', { id: 'f-about-en' }, c.about.en) };
      const cur = inp('f-cur', c.currency), wa = inp('f-wa', c.whatsapp, 'tel'), ig = inp('f-ig', c.social.instagram), fb = inp('f-fb', c.social.facebook), tk = inp('f-tt', c.social.tiktok), ms = inp('f-ms', c.social.messenger);
      const onShop = () => commit(Object.assign({}, c, { shop: { ar: shop.ar.value, en: shop.en.value }, about: { ar: ab.ar.value, en: ab.en.value }, currency: cur.value, whatsapp: wa.value, social: { instagram: ig.value, facebook: fb.value, tiktok: tk.value, messenger: ms.value } }), true);
      [shop.ar, shop.en, ab.ar, ab.en, cur, wa, ig, fb, tk, ms].forEach((i) => i.addEventListener('change', onShop));
      A(root, el('section', { class: 'card' }, field(t('shopAr'), shop.ar), field(t('shopEn'), shop.en), field(t('aboutAr'), ab.ar), field(t('aboutEn'), ab.en), field(t('currency'), cur), field(t('waNumber'), wa),
        F.social ? [field(t('igHandle'), ig), field(t('fbHandle'), fb), field(t('ttHandle'), tk)] : null, F.messenger ? field(t('msHandle'), ms) : null));
      const cb = el('section', { class: 'card' }, el('h2', { text: t('categories') }));
      c.categories.forEach((x, i) => A(cb, el('div', { class: 'row' },
        el('input', { class: 'grow', 'aria-label': t('catAr'), value: x.name.ar, onchange: (e) => commit(Object.assign({}, c, { categories: c.categories.map((y) => y.id === x.id ? { id: y.id, name: { ar: e.target.value, en: y.name.en } } : y) }), true) }),
        el('input', { class: 'grow', 'aria-label': t('catEn'), value: x.name.en, onchange: (e) => commit(Object.assign({}, c, { categories: c.categories.map((y) => y.id === x.id ? { id: y.id, name: { ar: y.name.ar, en: e.target.value } } : y) }), true) }),
        el('button', { class: 'btn small danger', onclick: () => { if (confirm(t('confirmDel'))) commit(Object.assign({}, c, { categories: c.categories.filter((y) => y.id !== x.id) })); } }, t('del')))));
      A(cb, el('button', { class: 'btn', id: 'add-cat', onclick: () => commit(Object.assign({}, c, { categories: c.categories.concat([{ id: Kit.uid('c'), name: { ar: 'قسم جديد', en: 'New category' } }]) })) }, t('addCat')));
      A(root, cb);
      const pb = el('section', { class: 'card' }, el('h2', { text: t('products') }));
      c.products.forEach((p) => A(pb, el('div', { class: 'row line', 'data-pid': p.id }, el('img', { class: 'thumb', src: img(p), alt: '' }), el('span', { class: 'grow', text: pick(p.name) }), p.demo ? el('span', { class: 'badge demo', text: t('demoTag') }) : null,
        el('button', { class: 'btn small', onclick: () => productForm(c, p) }, t('editProduct')), el('button', { class: 'btn small danger', onclick: () => { if (confirm(t('confirmDel'))) commit(Object.assign({}, c, { products: c.products.filter((x) => x.id !== p.id) })); } }, t('del')))));
      A(pb, el('button', { class: 'btn primary', id: 'add-product', onclick: () => productForm(c, null) }, t('addProduct')));
      A(root, pb);
      if (F.sizeGuide) { const gb = el('section', { class: 'card' }, el('h2', { text: t('guideRows') }));
        c.sizeGuide.forEach((r, i) => A(gb, el('div', { class: 'row' }, el('input', { 'aria-label': t('guideSize'), value: r.size, style: 'width:90px', onchange: (e) => commit(Object.assign({}, c, { sizeGuide: c.sizeGuide.map((x, j) => j === i ? Object.assign({}, x, { size: e.target.value }) : x) }), true) }),
          el('input', { class: 'grow', 'aria-label': t('guideNoteAr'), value: r.note.ar, onchange: (e) => commit(Object.assign({}, c, { sizeGuide: c.sizeGuide.map((x, j) => j === i ? { size: x.size, note: { ar: e.target.value, en: x.note.en } } : x) }), true) }),
          el('input', { class: 'grow', 'aria-label': t('guideNoteEn'), value: r.note.en, onchange: (e) => commit(Object.assign({}, c, { sizeGuide: c.sizeGuide.map((x, j) => j === i ? { size: x.size, note: { ar: x.note.ar, en: e.target.value } } : x) }), true) }),
          el('button', { class: 'btn small danger', onclick: () => commit(Object.assign({}, c, { sizeGuide: c.sizeGuide.filter((x, j) => j !== i) }), true) }, t('del')))));
        A(gb, el('button', { class: 'btn', onclick: () => commit(Object.assign({}, c, { sizeGuide: c.sizeGuide.concat([{ size: '', note: { ar: '', en: '' } }]) }), true) }, t('addRow'))); A(root, gb); }
      const imp = el('input', { type: 'file', accept: '.json,application/json', hidden: true, onchange: async (e) => { const fl = e.target.files[0]; if (!fl) return; const r = store.importJSON(await Kit.readFile(fl));
        if (!r.ok) return Kit.toast(r.error === 'newer' ? t('importNewer') : t('importFail')); if (!r.data.draft) return Kit.toast(t('importFail')); commit(r.data.draft, true); Kit.toast(t('importOk')); } });
      A(root, el('section', { class: 'card row' }, el('button', { class: 'btn primary', id: 'export-data', onclick: () => Kit.download('catalog-data.js', S.toDataJs(c), 'text/javascript') }, t('exportData')),
        el('button', { class: 'btn', onclick: () => Kit.download(cfg.id + '-backup.json', JSON.stringify({ kit: cfg.id, kind: 'brand-kit', v: 1, exportedAt: new Date(Kit.now()).toISOString(), data: { draft: c } }, null, 2), 'application/json') }, t('exportJson')),
        el('button', { class: 'btn', onclick: () => imp.click() }, t('importJson')), imp,
        c.products.some((p) => p.demo) ? el('button', { class: 'btn', id: 'clear-demo', onclick: () => commit(S.clearDemo(c)) }, t('clearDemo')) : null,
        store.data.draft ? el('button', { class: 'btn danger', onclick: () => { if (confirm(t('confirmReset'))) { store.reset(); render(); } } }, t('resetAll')) : null), el('p', {}, el('a', { href: '#/draft', text: t('preview') })));
      return root;
    }
    function productForm(c, p) {
      const isNew = !p; p = p || { id: Kit.uid('p'), cat: '', name: { ar: '', en: '' }, desc: { ar: '', en: '' }, price: null, compareAt: null, sizes: [], colors: [], out: [], soldOut: false, demo: false, img: '', isNew: false };
      let image = p.img || '';
      const fl = { na: el('input', { id: 'p-na', value: p.name.ar }), ne: el('input', { id: 'p-ne', value: p.name.en }), da: el('textarea', { value: p.desc.ar }), de: el('textarea', { value: p.desc.en }),
        pr: el('input', { id: 'p-pr', inputmode: 'decimal', value: p.price === null ? '' : p.price }), cp: el('input', { inputmode: 'decimal', value: p.compareAt === null ? '' : p.compareAt }),
        ct: el('select', {}, [el('option', { value: '' }, t('noCat'))].concat(c.categories.map((x) => el('option', { value: x.id, selected: x.id === p.cat }, pick(x.name))))),
        sz: el('input', { id: 'p-sz', value: p.sizes.join(', ') }), cl: el('input', { id: 'p-cl', value: p.colors.join(', ') }), so: el('input', { type: 'checkbox', checked: p.soldOut }), nw: el('input', { type: 'checkbox', checked: p.isNew }) };
      const outBox = el('div', { class: 'row' });
      const drawOut = () => { const tmp = S.normalize({ categories: [], products: [{ id: 'x', sizes: fl.sz.value, colors: fl.cl.value }] }).products[0];
        outBox.replaceChildren(...S.combos(tmp).filter((v) => v.size || v.color).map((v) => el('label', { class: 'badge' }, el('input', { type: 'checkbox', value: v.key, checked: p.out.includes(v.key), style: 'width:auto;min-height:0;margin-inline-end:6px' }), [v.size, v.color].filter(Boolean).join(' / ')))); };
      if (F.variants) { fl.sz.addEventListener('change', () => { p.out = [...outBox.querySelectorAll('input:checked')].map((x) => x.value); drawOut(); }); fl.cl.addEventListener('change', () => { p.out = [...outBox.querySelectorAll('input:checked')].map((x) => x.value); drawOut(); }); drawOut(); }
      const prev = el('div', {}), drawPrev = () => prev.replaceChildren(...(image ? [el('img', { class: 'thumb', src: image, alt: '' }), el('button', { class: 'btn small', type: 'button', onclick: () => { image = ''; drawPrev(); } }, t('removePhoto'))] : []));
      drawPrev(); const file = el('input', { type: 'file', accept: 'image/*', onchange: async (e) => { if (e.target.files[0]) { try { image = await Kit.resizeImage(e.target.files[0], 640, 0.72); drawPrev(); } catch (x) { Kit.toast(t('importFail')); } } } });
      const sheet = el('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('editProduct') }), close = () => sheet.remove();
      const save = () => { if (!fl.na.value.trim() && !fl.ne.value.trim()) return Kit.toast(t('needName'));
        const outKeys = F.variants ? [...outBox.querySelectorAll('input:checked')].map((x) => x.value) : [];
        const np = { id: p.id, cat: fl.ct.value, name: { ar: fl.na.value, en: fl.ne.value }, desc: { ar: fl.da.value, en: fl.de.value }, price: fl.pr.value.trim() === '' ? null : Kit.num(fl.pr.value, null), compareAt: fl.cp.value.trim() === '' ? null : Kit.num(fl.cp.value, null),
          sizes: F.variants ? fl.sz.value : '', colors: F.variants ? fl.cl.value : '', out: outKeys, soldOut: fl.so.checked, isNew: fl.nw.checked, demo: false, img: image };
        saveDraft(Object.assign({}, c, { products: isNew ? c.products.concat([np]) : c.products.map((x) => x.id === p.id ? np : x) })); close(); Kit.toast(t('savedMsg')); render(); };
      A(sheet, el('div', { class: 'panel' }, el('h2', { text: t('editProduct') }), field(t('nameAr'), fl.na), field(t('nameEn'), fl.ne), field(t('descAr'), fl.da), field(t('descEn'), fl.de), field(t('priceF'), fl.pr), field(t('compareF'), fl.cp), field(t('category'), fl.ct),
        F.variants ? [field(t('sizesF'), fl.sz), field(t('colorsF'), fl.cl), el('div', { class: 'field' }, el('span', { text: t('outF') }), outBox)] : null,
        field(t('photo'), file), prev, el('label', { class: 'row' }, fl.so, el('span', { text: t('soldOutF') })), el('label', { class: 'row' }, fl.nw, el('span', { text: t('newF') })),
        el('div', { class: 'row' }, el('button', { class: 'btn primary', id: 'p-save', onclick: save }, t('save')), el('button', { class: 'btn', onclick: close }, t('cancel')))));
      sheet.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); }); document.body.append(sheet); fl.na.focus();
    }

    function render() {
      const r = route(); Kit.applyTheme(); document.title = cfg.id + ' | ' + cfg.titleAr; document.querySelectorAll('.sheet').forEach((x) => x.remove());
      const useDraft = r === 'draft', c = useDraft ? working() : pub; let view, tab = 'home';
      if (r === 'edit') { view = viewEdit(); tab = 'edit'; } else if (r === 'qr' && F.qr) { view = viewQr(); tab = 'qr'; }
      else if (r === 'saved' && F.wishlist) { view = viewHome(pub, false, true); tab = 'saved'; } else if (/^p\//.test(r)) view = viewProduct(pub, r.slice(2)); else view = viewHome(c, useDraft, false);
      app.replaceChildren(header(tab, c), el('div', { class: 'wrap' }, view), Kit.footer(), bar); drawBar(); document.body.dataset.ready = '1';
    }
    window.addEventListener('hashchange', () => { if (!/^p\//.test(route())) { f.cat = ''; f.q = ''; } render(); window.scrollTo(0, 0); });
    Kit.initLang(cfg.id); render();
    if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  root.Shop = { run };
})(globalThis);
