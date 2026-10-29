'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const SKIP_DIRS = new Set(['.git', 'node_modules', 'test']);
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    if (SKIP_DIRS.has(e.name)) return [];
    const p = path.join(dir, e.name);
    return e.isDirectory() ? files(p) : [p];
  });
}
const shipped = files(root).filter(f => /\.(html|js|css|json|md)$/.test(f));
const read = f => fs.readFileSync(f, 'utf8');

test('no file points to an outside origin', () => {
  const urlRe = new RegExp('https?:' + '//', 'i');
  for (const f of shipped) assert.ok(!urlRe.test(read(f)), path.relative(root, f) + ' contains an outside URL');
});

test('no protocol-relative or remote script/style/import', () => {
  const re = /(src|href)\s*=\s*["']\s*\/\/|@import|importScripts\s*\(\s*["'](?!\.)/i;
  for (const f of shipped) assert.ok(!re.test(read(f)), path.relative(root, f));
});

test('index.html has a same-origin CSP and loads only local files', () => {
  const html = read(path.join(root, 'index.html'));
  assert.match(html, /http-equiv="Content-Security-Policy" content="default-src 'self'"/);
  const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m => m[1]);
  assert.ok(refs.length > 0);
  for (const r of refs) assert.ok(fs.existsSync(path.join(root, r)), r + ' must be a local file');
});

test('service worker only handles same-origin requests', () => {
  const sw = read(path.join(root, 'sw.js'));
  assert.match(sw, /url\.origin !== self\.location\.origin/);
});

test('app stores nothing but the language choice', () => {
  const app = read(path.join(root, 'app.js'));
  const keys = [...app.matchAll(/localStorage\.setItem\(([^,]+),/g)].map(m => m[1].trim());
  assert.deepEqual(keys, ['LANG_KEY']);
  assert.ok(!/sessionStorage|indexedDB|document\.cookie|XMLHttpRequest|sendBeacon|WebSocket/.test(app));
});

test('public text avoids banned words', () => {
  const banned = /(?<![-\w])(profit|guarantee|live|audit|launched)\b/i;
  for (const f of shipped) assert.ok(!banned.test(read(f)), path.relative(root, f));
});
