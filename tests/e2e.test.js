const assert = require('node:assert/strict'), { serve, launch } = require('./cdp.js'); const KIT = require('../package.json').name;
(async () => {
  const srv = await serve(8130); const b = await launch(); let fail = 0;
  const step = async (n, f) => { try { await f(); console.log('ok  ' + n); } catch (e) { fail++; console.log('FAIL ' + n + ' ' + e.message); } };
  const U = 'http://127.0.0.1:8130/';
  try {
    await b.goto(U);
    await step('demo banner, demo tags, byline', async () => { const t = await b.text(); assert.match(t, /متجر تجريبي/); assert.match(t, /من تطوير يوسف خميس/); assert.ok(await b.eval("document.querySelectorAll('.pcard .badge.demo').length >= 3")); });
    await step('language toggle', async () => { await b.click('.top .btn'); assert.equal(await b.eval('document.documentElement.dir'), 'ltr'); await b.click('.top .btn'); });
    await step('product page, add to bag, order draft has no phone so copy only', async () => {
      await b.eval("location.hash='#/p/p3'"); await b.waitFor("document.querySelector('#add-bag')");
      if (await b.eval("!!document.querySelector('.opt')")) { for (const g of await b.eval("[...document.querySelectorAll('.field[class] [role=group]')].map((_, i) => i)")) { await b.eval("(()=>{const g=document.querySelectorAll('[role=group]')[" + g + "];const o=[...g.querySelectorAll('.opt')];g.querySelector('.opt').click();})()"); } }
      await b.click('#add-bag'); await b.waitFor("document.querySelector('#open-bag')"); await b.click('#open-bag'); await b.waitFor("document.querySelector('#prepare')"); await b.type('#bag-name', 'سارة'); await b.click('#prepare');
      await b.waitFor("document.querySelector('#order-text')"); const t = await b.eval("document.querySelector('#order-text').textContent"); assert.match(t, /طلب تجريبي/); assert.match(t, /سارة/); assert.ok(await b.eval("!document.querySelector('#wa-link')"));
    });
    await step('sold-out product cannot be added', async () => { await b.eval("location.hash='#/p/p4'"); await b.waitFor("document.querySelector('#add-bag')"); assert.ok(await b.eval("document.querySelector('#add-bag').disabled === true || /غير متوفر/.test(document.querySelector('#add-bag').textContent)")); });
    await step('owner: add product, clear demo, draft preview, published unchanged', async () => {
      await b.eval("location.hash='#/edit'"); await b.waitFor("document.querySelector('#add-product')"); await b.click('#clear-demo'); await b.waitFor("!document.querySelector('#clear-demo')");
      await b.click('#add-product'); await b.type('#p-ne', 'Test item'); await b.type('#p-pr', '99'); await b.click('#p-save'); await b.waitFor("document.querySelector('[data-pid]')");
      await b.eval("location.hash='#/draft'"); await b.waitFor("document.body.innerText.includes('Test item')"); assert.ok(!/Demo/i.test(await b.eval("document.querySelector('.pcard .pname').textContent")));
      await b.eval("location.hash='#/'"); await b.waitFor("document.querySelector('.pcard')"); assert.ok(!(await b.text()).includes('Test item'));
    });
    if (KIT === 'lebs') await step('lebs: filters, wishlist, size guide', async () => {
      await b.eval("location.hash='#/'"); await b.waitFor("document.querySelector('#f-stock')"); await b.click('#f-stock'); assert.ok(await b.eval("!document.querySelector('.pcard.out')"));
      await b.click('.heart'); assert.match(await b.eval("document.querySelector('.tab:nth-child(2)').textContent"), /\(1\)/);
      await b.eval("location.hash='#/p/p1'"); await b.waitFor("document.querySelector('.pdetail')"); await b.click('.btn.small', 'دليل المقاسات'); assert.match(await b.text(), /صف تجريبي/);
    });
    if (KIT === 'talab') await step('talab: social profile layout, share, qr', async () => {
      await b.eval("location.hash='#/'"); await b.waitFor("document.querySelector('.profile')"); assert.ok(await b.eval("!!document.querySelector('.layout-feed')"));
      await b.eval("location.hash='#/qr'"); await b.waitFor("document.querySelector('#qr-url')"); await b.type('#qr-url', 'https://yousefkhames.github.io/talab/'); assert.ok(await b.eval("!!document.querySelector('.qrbox svg path')"));
    });
    await step('no script errors', async () => assert.deepEqual(b.logs, []));
    await b.eval("location.hash='#/'"); await b.viewport(412, 860, true); await b.eval("localStorage.clear();location.reload()"); await new Promise((r) => setTimeout(r, 800)); await b.waitFor("document.body.dataset.ready"); await b.shot('/tmp/' + KIT + '-home.png');
    await b.eval("location.hash='#/p/p1'"); await new Promise((r) => setTimeout(r, 300)); await b.shot('/tmp/' + KIT + '-product.png');
  } finally { await b.close(); srv.close(); }
  process.exit(fail ? 1 : 0);
})();
