/* VORX service worker: offline shell, fresh code when online, live gold feed never cached */
const CACHE = 'vorx-v4';
const ASSETS = ['./', './index.html', './rate.html', './karat.html', './price.html', './converter.html', './casio.html', './settings.html',
  './vorx.css', './vorx.js', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png', './favicon-64.png', './logo.svg'];

self.addEventListener('install', e => {
  self.skipWaiting();
  /* add files one by one so a single missing file can never break the whole offline install */
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(ASSETS.map(a => c.add(a).catch(() => null)))));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;
  const same = u.origin === location.origin, fonts = /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (!same && !fonts) return;                       /* gold price API etc. always go to the network */
  const code = r.mode === 'navigate' || /\.(html|css|js)$/.test(u.pathname);
  const keep = res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); return res; };
  if (code) e.respondWith(fetch(r).then(keep).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('./index.html'))));
  else e.respondWith(caches.match(r, { ignoreSearch: true }).then(m => m || fetch(r).then(keep)));
});
