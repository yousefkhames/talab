// Talab smoke tests: files referenced by the app actually exist, and HTML/JS
// wiring is consistent. Run with: node --test tests/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { demoProducts, demoSettings } from "../docs/js/core/demo.js";
import { defaultSettings } from "../docs/js/core/store.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const docs = join(root, "docs");

test("index.html references existing css and js", () => {
  const html = readFileSync(join(docs, "index.html"), "utf8");
  for (const ref of ["css/app.css", "js/app.js", "assets/logo.svg", "manifest.webmanifest"]) {
    assert.ok(html.includes(ref), `index.html should reference ${ref}`);
    assert.ok(existsSync(join(docs, ref)), `${ref} should exist`);
  }
});

test("every ES module imported by the app exists", () => {
  const jsFiles = [];
  const walk = (dir) => {
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, f.name);
      if (f.isDirectory()) walk(p);
      else if (f.name.endsWith(".js")) jsFiles.push(p);
    }
  };
  walk(join(docs, "js"));
  for (const file of jsFiles) {
    const src = readFileSync(file, "utf8");
    const imports = [...src.matchAll(/from\s+"(\.[^"]+)"/g)].map((m) => m[1]);
    for (const imp of imports) {
      const target = join(dirname(file), imp);
      assert.ok(existsSync(target), `${file} imports missing ${imp}`);
    }
  }
});

test("service worker cache list points at real files", () => {
  const sw = readFileSync(join(docs, "sw.js"), "utf8");
  const entries = [...sw.matchAll(/"\.\/([^"]+)"/g)].map((m) => m[1]);
  assert.ok(entries.length >= 10);
  for (const e of entries) {
    if (e === "") continue; // "./"
    assert.ok(existsSync(join(docs, e)), `sw.js caches missing file: ${e}`);
  }
});

test("demo product images exist on disk", () => {
  for (const p of demoProducts()) {
    assert.ok(p.image, `demo product ${p.id} should have an image`);
    assert.ok(existsSync(join(docs, p.image)), `missing demo image ${p.image}`);
  }
});

test("demo settings cover every default settings key", () => {
  const def = defaultSettings();
  const demo = demoSettings();
  for (const key of Object.keys(def)) {
    assert.ok(key in demo, `demoSettings missing key ${key}`);
  }
});

test("manifest is valid JSON with required PWA fields", () => {
  const m = JSON.parse(readFileSync(join(docs, "manifest.webmanifest"), "utf8"));
  assert.ok(m.name && m.short_name && m.start_url && m.display === "standalone");
  assert.ok(Array.isArray(m.icons) && m.icons.length > 0);
});
