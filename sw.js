// Service Worker — Control de Pases DGT
const CACHE = 'pases-dgt-v1';
const ARCHIVOS = [
  '/control-pases/',
  '/control-pases/index.html',
  '/control-pases/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

// Instalar: guardar todo en caché
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ARCHIVOS))
  );
  self.skipWaiting();
});

// Activar: limpiar cachés viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: primero caché, si no hay red
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Cachear respuestas válidas
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => cached); // Si no hay red y no hay caché, error controlado
    })
  );
});
