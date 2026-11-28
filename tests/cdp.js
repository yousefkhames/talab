// Minimal Chrome DevTools Protocol driver (no dependencies) + static server, used by the e2e tests.
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const ROOT = path.join(__dirname, '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };
function serve(port) {
  return new Promise((res) => {
    const srv = http.createServer((req, rsp) => {
      let p = decodeURIComponent(req.url.split('?')[0].split('#')[0]); if (p === '/') p = '/index.html';
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rsp.writeHead(404); return rsp.end('nf'); }
      rsp.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); rsp.end(fs.readFileSync(f));
    }).listen(port, () => res(srv));
  });
}
async function launch(opts) {
  opts = opts || {};
  const port = 9300 + Math.floor(Math.random() * 500);
  const dir = fs.mkdtempSync('/tmp/chr-');
  const proc = spawn('google-chrome', ['--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=' + port, '--user-data-dir=' + dir, '--hide-scrollbars', '--window-size=' + (opts.w || 412) + ',' + (opts.h || 860), 'about:blank'], { stdio: 'ignore' });
  let targets;
  for (let i = 0; i < 60; i++) { try { targets = await (await fetch('http://127.0.0.1:' + port + '/json')).json(); if (targets.find((t) => t.type === 'page')) break; } catch (e) { /* retry */ } await new Promise((r) => setTimeout(r, 250)); }
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const pend = new Map(); const logs = [];
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); }
    else if (d.method === 'Runtime.exceptionThrown') logs.push('EXC ' + JSON.stringify(d.params.exceptionDetails.exception && d.params.exceptionDetails.exception.description || d.params.exceptionDetails.text));
    else if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') logs.push('ERR ' + d.params.args.map((a) => a.value || a.description).join(' '));
    else if (d.method === 'Page.javascriptDialogOpening') { send('Page.handleJavaScriptDialog', { accept: true }); }
  };
  const send = (method, params) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
  await send('Page.enable'); await send('Runtime.enable');
  const api = {
    logs, send,
    async goto(url) { await send('Page.navigate', { url }); await new Promise((r) => setTimeout(r, 600)); await api.waitFor('document.body && document.body.dataset.ready'); },
    async eval(expr) {
      const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
      if (r.result.exceptionDetails) throw new Error('eval: ' + JSON.stringify(r.result.exceptionDetails.exception && r.result.exceptionDetails.exception.description));
      return r.result.result.value;
    },
    async waitFor(expr, ms) { const end = Date.now() + (ms || 5000); while (Date.now() < end) { try { if (await api.eval('!!(' + expr + ')')) return true; } catch (e) { /* retry */ } await new Promise((r) => setTimeout(r, 80)); } throw new Error('timeout waiting for ' + expr); },
    async click(sel, text) {
      const ok = await api.eval('(()=>{const els=[...document.querySelectorAll(' + JSON.stringify(sel) + ')].filter(e=>!' + JSON.stringify(text || '') + '||e.textContent.includes(' + JSON.stringify(text || '') + '));const e=els[0];if(!e)return false;e.scrollIntoView({block:"center"});e.click();return true})()');
      if (!ok) throw new Error('click: no element ' + sel + ' ' + (text || ''));
      await new Promise((r) => setTimeout(r, 120));
    },
    async type(sel, value) {
      const ok = await api.eval('(()=>{const e=document.querySelector(' + JSON.stringify(sel) + ');if(!e)return false;e.focus();e.value=' + JSON.stringify(value) + ';e.dispatchEvent(new Event("input",{bubbles:true}));e.dispatchEvent(new Event("change",{bubbles:true}));return true})()');
      if (!ok) throw new Error('type: no element ' + sel);
      await new Promise((r) => setTimeout(r, 120));
    },
    async text() { return api.eval('document.body.innerText'); },
    async shot(file, full) {
      let clip;
      if (full) { const m = await send('Page.getLayoutMetrics'); const c = m.result.cssContentSize; clip = { x: 0, y: 0, width: c.width, height: Math.min(c.height, 3000), scale: 1 }; }
      const r = await send('Page.captureScreenshot', Object.assign({ format: 'png' }, clip ? { clip, captureBeyondViewport: true } : {}));
      fs.writeFileSync(file, Buffer.from(r.result.data, 'base64'));
    },
    async viewport(w, h, mobile) { await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: mobile ? 2 : 1, mobile: !!mobile }); },
    async setNow(ts) { await send('Page.addScriptToEvaluateOnNewDocument', { source: 'window.__NOW=' + ts + ';' }); },
    async close() { try { ws.close(); } catch (e) { /* noop */ } proc.kill('SIGKILL'); }
  };
  return api;
}
module.exports = { serve, launch };
