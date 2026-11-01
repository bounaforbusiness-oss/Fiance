// Garde l'écran d'ouverture et l'icône en mémoire pour que l'appli démarre vite.
// Les données, elles, viennent toujours en direct de ton Google Sheets.
const CACHE = 'finances-v1';
const FICHIERS = ['./', 'index.html', 'manifest.webmanifest', 'icone-192.png', 'icone-512.png', 'apple-touch-icon.png', 'favicon-32.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((cles) => Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// Réseau d'abord (pour prendre tout de suite une mise à jour), mémoire si pas de connexion.
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((r) => { const copie = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copie)); return r; })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('index.html')))
  );
});
