// Service worker de efecen: precachea todo para funcionar offline.
// Al publicar cambios, subí CACHE para que los clientes descarguen la versión nueva.
const CACHE = "efecen-v20";
const KATEX_FONTS = ["AMS-Regular", "Caligraphic-Bold", "Caligraphic-Regular", "Fraktur-Bold", "Fraktur-Regular",
  "Main-Bold", "Main-BoldItalic", "Main-Italic", "Main-Regular", "Math-BoldItalic", "Math-Italic",
  "SansSerif-Bold", "SansSerif-Italic", "SansSerif-Regular", "Script-Regular", "Size1-Regular", "Size2-Regular",
  "Size3-Regular", "Size4-Regular", "Typewriter-Regular"].map(f => `assets/vendor/katex/fonts/KaTeX_${f}.woff2`);
const CONTENT = ["content/carrera.js", "content/m101-calculo1.js", "content/m104-algebra-lineal.js", "content/f101-fisica1.js", "content/f102b-fisica2b.js", "content/m102-calculo2.js"];
const PRECACHE = [
  "./", "index.html", "manifest.json", "sync.js", "board.js",
  // un archivo por materia (ver content/carrera.js)
  ...CONTENT,
  "assets/vendor/katex/katex.min.js", "assets/vendor/katex/katex.min.css", ...KATEX_FONTS,
  "assets/fonts/nunito-latin-wght.woff2",
  "assets/icons/sprite.svg", "assets/icons/icon-192.png", "assets/icons/icon-512.png", "assets/icons/icon-180.png",
  "assets/img/schrodi.svg",
  "assets/sounds/correct.ogg", "assets/sounds/wrong.ogg", "assets/sounds/tap.ogg",
  "assets/sounds/complete.ogg", "assets/sounds/streak.ogg"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// stale-while-revalidate: responde al toque desde caché y actualiza en segundo plano
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(req, { ignoreSearch: true });
      const fresh = fetch(req).then(res => {
        if (res.ok) cache.put(req, res.clone());
        return res;
      }).catch(() => cached || (req.mode === "navigate" ? cache.match("index.html") : undefined));
      return cached || fresh;
    })
  );
});
