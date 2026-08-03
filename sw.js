// 塩梅（あんばい） — オフラインで開けるようにする最小のサービスワーカー
const CACHE = "anbai-v11";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon.svg",
  "./privacy.html",
  "./support.html",
  "./lib/qrcode.min.js",
  "./lib/jsqr.min.js",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ネット優先・失敗したらキャッシュ（更新を取りこぼさないため）
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
