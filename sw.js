// Caches the page files for offline use. Same-origin only.
var CACHE = 'obq-v1';
var FILES = ['./', 'index.html', 'style.css', 'quiz-core.js', 'questions.js', 'questions.json', 'app.js'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }));
});
self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin || e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(function (hit) { return hit || fetch(e.request); }));
});
