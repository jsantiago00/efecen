// Service worker de efecen: precachea todo para funcionar offline.
// Al publicar cambios, subí CACHE para que los clientes descarguen la versión nueva.
const CACHE = "efecen-v102";
const AVISOS = "efecen-avisos"; // la lista de avisos que deja la app (no se borra al actualizar)
const KATEX_FONTS = ["AMS-Regular", "Caligraphic-Bold", "Caligraphic-Regular", "Fraktur-Bold", "Fraktur-Regular",
  "Main-Bold", "Main-BoldItalic", "Main-Italic", "Main-Regular", "Math-BoldItalic", "Math-Italic",
  "SansSerif-Bold", "SansSerif-Italic", "SansSerif-Regular", "Script-Regular", "Size1-Regular", "Size2-Regular",
  "Size3-Regular", "Size4-Regular", "Typewriter-Regular"].map(f => `assets/vendor/katex/fonts/KaTeX_${f}.woff2`);
const CONTENT = ["content/carrera.js", "content/calendario.js", "content/m101-calculo1.js", "content/m104-algebra-lineal.js", "content/f101-fisica1.js", "content/f102b-fisica2b.js", "content/m102-calculo2.js", "content/m106-geometria-analitica.js", "content/m105-probabilidad.js", "content/f102a-fisica2a.js", "content/f104-fisica3.js", "content/q101-quimica-general.js", "content/m101-figuras.js", "content/m102-figuras.js", "content/m106-figuras.js", "content/m105-figuras.js", "content/m104-figuras.js", "content/f101-figuras.js", "content/f102b-figuras.js", "content/f102a-figuras.js", "content/f104-figuras.js", "content/m101-examenes.js", "content/m104-examenes.js", "content/f101-examenes.js", "content/m106-examenes.js", "content/f102b-examenes.js", "content/m102-examenes.js", "content/m105-examenes.js", "content/f102a-examenes.js", "content/f104-examenes.js", "content/q101-examenes.js", "content/m101-practica.js", "content/f101-practica.js", "content/m102-practica.js", "content/f102b-practica.js", "content/f102a-practica.js", "content/m104-practica.js", "content/m106-practica.js", "content/m105-practica.js", "content/f104-practica.js", "content/q101-practica.js", "content/q101-figuras.js"];
const PRECACHE = [
  "./", "index.html", "engine.js", "manifest.json", "sync.js", "board.js", "assets/vendor/perfect-freehand/perfect-freehand.js",
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
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== AVISOS).map(k => caches.delete(k))))
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

// ---------- avisos ----------
// La app deja en la caché AVISOS la lista de los próximos días ({ on, list: [{ id, date, title, body }] }).
// Cuando el navegador despierta al service worker (sincronización periódica), se muestran los de hoy que
// todavía no se mostraron. No hay servidor: el momento lo decide el navegador.
const pad2 = n => String(n).padStart(2, "0");
const localDay = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
async function showAvisos() {
  const cache = await caches.open(AVISOS);
  const res = await cache.match("avisos.json");
  if (!res) return;
  const data = await res.json();
  if (!data.on || self.Notification.permission !== "granted") return;
  const now = new Date(), t = localDay(now);
  // de noche no se avisa: queda para la próxima vez
  if (now.getHours() < 8 || now.getHours() >= 22) return;
  const seenRes = await cache.match("vistos.json");
  let seen = seenRes ? await seenRes.json() : [];
  const due = data.list.filter(a => a.date === t && !seen.includes(a.id));
  for (const a of due) {
    await self.registration.showNotification(a.title, { body: a.body, icon: "assets/icons/icon-192.png", badge: "assets/icons/icon-192.png", tag: a.id, data: { url: "./#/plan" } });
    seen.push(a.id);
  }
  // solo hace falta recordar los de hoy
  seen = seen.filter(id => id.startsWith(t));
  await cache.put("vistos.json", new Response(JSON.stringify(seen), { headers: { "Content-Type": "application/json" } }));
}
self.addEventListener("periodicsync", e => { if (e.tag === AVISOS) e.waitUntil(showAvisos().catch(() => {})); });
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "./";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => {
    for (const c of cs) if ("focus" in c) { if ("navigate" in c) c.navigate(url).catch(() => {}); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
