const test = require('node:test'), assert = require('node:assert/strict'), fs = require('fs'), path = require('path');
const S = require('../shop-core.js');
const raw = new Function('window', fs.readFileSync(path.join(__dirname, '../catalog-data.js'), 'utf8') + ';return window.CATALOG_DATA')({});
const c = S.normalize(raw);
test('demo catalog is flagged and every product is demo', () => { assert.equal(c.demo, true); assert.ok(c.products.length >= 4); assert.ok(c.products.every((p) => p.demo)); assert.equal(c.whatsapp, ''); });
test('normalize rejects bad images, prices and handles', () => {
  const n = S.normalize({ social: { instagram: 'a b<', facebook: '@ok.page' }, categories: [], products: [{ id: 'x y', name: { en: 'X' }, price: -1, img: 'javascript:alert(1)' }, { id: 'z', img: 'img/a.jpg', price: '12.5' }] });
  assert.equal(n.social.instagram, ''); assert.equal(n.social.facebook, 'ok.page'); assert.equal(n.products[0].id, 'xy'); assert.equal(n.products[0].price, null); assert.equal(n.products[0].img, ''); assert.equal(n.products[1].img, 'img/a.jpg'); assert.equal(n.products[1].price, 12.5);
});
test('variants and stock', () => {
  const p = S.normalize({ products: [{ id: 'a', sizes: 'S, M', colors: ['red'], out: ['S|red'] }] }).products[0];
  assert.equal(S.combos(p).length, 2); assert.equal(S.available(p, 'S', 'red'), false); assert.equal(S.available(p, 'M', 'red'), true); assert.equal(S.hasStock(p), true);
  assert.equal(S.hasStock(Object.assign({}, p, { soldOut: true })), false);
});
test('filters by category, text, size, price, stock, wishlist and sort', () => {
  const first = c.categories[0].id; assert.ok(S.visible(c, { cat: first }).every((p) => p.cat === first));
  assert.equal(S.visible(c, { q: 'zzzz' }).length, 0); assert.ok(S.visible(c, { max: 200 }).every((p) => p.price <= 200));
  assert.ok(S.visible(c, { inStock: true }).every(S.hasStock)); assert.equal(S.visible(c, { wish: [c.products[0].id] }).length, 1);
  const low = S.visible(c, { sort: 'low' }).map((p) => p.price); assert.deepEqual(low, low.slice().sort((a, b) => a - b));
});
test('cart merges lines, clamps, totals and prunes unavailable items', () => {
  const p = c.products[0]; let cart = S.addLine([], p.id, '', '', 2); cart = S.addLine(cart, p.id, '', '', 200); assert.equal(cart.length, 1); assert.equal(cart[0].qty, 99);
  assert.equal(S.totals(c, cart).total, p.price * 99); cart = S.setQty(cart, cart[0].k, 0); assert.equal(cart.length, 0);
  const sold = c.products.find((x) => !S.hasStock(x)); if (sold) assert.equal(S.prune(c, S.addLine([], sold.id, '', '', 1)).length, 0);
});
test('order text has demo tag, lines and total in both languages', () => {
  const p = c.products.find((x) => S.hasStock(x) && !x.sizes.length) || c.products[0]; const cart = S.addLine([], p.id, p.sizes[0] || '', p.colors[0] || '', 2);
  const ar = S.orderText(c, cart, 'ar', { shop: 'م', name: 'سارة' }), en = S.orderText(c, cart, 'en', { note: 'hi' });
  assert.match(ar, /\[طلب تجريبي\]/); assert.match(ar, /2 ×/); assert.match(ar, /الاسم: سارة/); assert.match(en, /\[DEMO order\]/); assert.match(en, /Note: hi/);
});
test('social links only for valid handles; product url', () => {
  const n = S.normalize({ social: { instagram: 'shop.demo', messenger: 'demopage' } }); assert.deepEqual(S.social(n).map((x) => x.id), ['instagram', 'messenger']);
  assert.equal(S.productUrl('https://x.io/talab/#/p/a', 'b'), 'https://x.io/talab/#/p/b');
});
test('export file round-trips and escapes script closers', () => {
  const m = S.normalize(raw); m.shop.en = '</script>'; const js = S.toDataJs(m); assert.ok(!js.includes('</script>'));
  assert.equal(S.normalize(new Function('window', js + ';return window.CATALOG_DATA')({})).shop.en, '</script>');
});
test('clear demo removes only demo products', () => { const m = S.normalize(Object.assign({}, raw, { products: raw.products.concat([{ id: 'real', name: { en: 'R' }, price: 5 }]) })); const n = S.clearDemo(m); assert.equal(n.products.length, 1); assert.equal(n.demo, false); });
test('demo art placeholder is a labelled data URI', () => { assert.match(decodeURIComponent(S.art(c.products[0])), /DEMO/); });
