// ============================================================
// SERVICE WORKER — CatatanKeu
// Tujuan: (1) bikin app bisa benar-benar "terinstal" (PWA/WebAPK)
//         (2) percepat loading dengan cache aset statis & library CDN
// PENTING: Data keuangan (panggilan ke script.google.com) TIDAK
// pernah di-cache — selalu diambil langsung dari server.
// ============================================================

// Naikkan angka versi ini setiap kali css/js/html direvisi,
// supaya pengguna lama otomatis dapat versi terbaru.
const CACHE_VERSION = 'catatankeu-v4';

const APP_SHELL = [
  './',
  './index.html',
  './css/style.css',
  './js/config.js',
  './js/api.js',
  './js/turbo.js',
  './js/app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './favicon.ico',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // SW baru langsung aktif, tidak menunggu semua tab ditutup
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache =>
      // allSettled: kalau 1 aset gagal di-cache (mis. jaringan putus), yang lain tetap lanjut
      Promise.allSettled(APP_SHELL.map(url => cache.add(url)))
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim()) // SW baru langsung mengontrol tab yang sedang terbuka
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Jangan pernah ikut campur request ke backend GAS — data keuangan harus selalu realtime
  if (url.hostname.includes('script.google.com') || url.hostname.includes('script.googleusercontent.com')) {
    return;
  }
  if (req.method !== 'GET') return;

  // Dokumen HTML (navigasi) -> network-first, fallback ke cache saat offline/lambat
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Aset statis & library CDN -> stale-while-revalidate:
  // tampil instan dari cache, sambil diam-diam update ke versi terbaru di belakang layar
  event.respondWith(
    caches.match(req).then(cached => {
      const networkFetch = fetch(req)
        .then(res => {
          if (res && (res.status === 200 || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then(c => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
