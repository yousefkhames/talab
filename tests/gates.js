// Shared review gates, run from each kit's tests/review.test.js: node tests/gates.js is not needed.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
function walk(d, out) { out = out || []; for (const f of fs.readdirSync(d)) { if (['node_modules', '.git', 'tests', 'docs'].includes(f)) continue; const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p, out) : out.push(p); } return out; }
function runGates(test, assert, opts) {
  opts = opts || {};
  test('identity files and byline', () => {
    ['assets/yk-logo.svg', 'assets/favicon.svg', 'assets/kit-theme.js', 'LICENSE'].forEach((f) => assert.ok(fs.existsSync(path.join(ROOT, f)), f));
    assert.match(read('README.md'), /By Yousef Khames · من تطوير يوسف خميس/);
    assert.match(read('index.html'), /rel="icon" href="assets\/favicon\.svg"/);
    assert.match(read('index.html'), /assets\/kit-theme\.js/);
    assert.match(read('kit-base.js'), /By Yousef Khames · من تطوير يوسف خميس/);
  });
  test('kit-theme palette keeps contrast', () => {
    const T = require(path.join(ROOT, 'assets/kit-theme.js'));
    [false, true].forEach((d) => { const p = T.palette({}, d); assert.ok(T.contrast(p.ink, p.paper) >= 4.5); assert.ok(T.contrast(p.onAccent, p.accent) >= 4.5); });
    assert.equal(T.author.en, 'By Yousef Khames'); assert.equal(T.author.ar, 'من تطوير يوسف خميس');
  });
  test('no external runtime network URLs in source', () => {
    const allow = /^https?:\/\/(wa\.me|m\.me|www\.google\.com\/maps|www\.instagram\.com|www\.facebook\.com|www\.tiktok\.com|maps\.google\.com|www\.w3\.org|github\.com\/yousefkhames|yousefkhames\.github\.io|www\.opensource\.org|www\.denso-wave\.com|www\.d-project\.com|opensource\.org|localhost|127\.0\.0\.1)/;
    walk(ROOT).filter((f) => /\.(js|html|css|webmanifest)$/.test(f) && !/qrcode\.js$/.test(f)).forEach((f) => {
      (fs.readFileSync(f, 'utf8').match(/https?:\/\/[^\s"'`)<>]+/g) || []).forEach((u) => assert.ok(allow.test(u), f + ' -> ' + u));
    });
    assert.ok(!/\b(fetch|XMLHttpRequest|sendBeacon|WebSocket)\b[^;\n]*https?:\/\/(?!wa\.me)/.test(read('kit-base.js')));
  });
  test('service worker lists files that exist', () => {
    const sw = read('sw.js'); const list = sw.match(/const FILES = \[([^\]]*)\]/)[1].match(/'([^']+)'/g).map((s) => s.slice(1, -1));
    list.filter((f) => f !== './').forEach((f) => assert.ok(fs.existsSync(path.join(ROOT, f)), 'missing ' + f));
  });
  test('AR/EN string parity', () => {
    const dict = [].concat(opts.dictFile || []).map((f) => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
    assert.ok(dict.length > 0);
    const pairs = dict.match(/:\s*\[\s*'[^']*'\s*,\s*'[^']*'\s*\]/g) || [];
    assert.ok(pairs.length > 10);
    pairs.forEach((p) => { const m = p.match(/\[\s*'([^']*)'\s*,\s*'([^']*)'\s*\]/); assert.ok(m[1].trim() && m[2].trim(), p); });
  });
}
module.exports = { runGates, ROOT };
