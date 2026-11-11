// Service worker de efecen: precachea todo para funcionar offline.
// Al publicar cambios, subí CACHE para que los clientes descarguen la versión nueva.
const CACHE = "efecen-v104";
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
// La app deja en la caché AVISOS la lista de los próximos días:
//   { on, list: [{ id, date, at (ms), title, body }], push: { url, key } }
// A la hora de cada aviso, el servicio efecen-push (push/worker.js) manda un push sin contenido; acá se arma la
// notificación con esa lista, que nunca sale del dispositivo. Si no hay push, queda la sincronización periódica.
const NOTIF = { icon: "assets/icons/icon-192.png", badge: "assets/icons/icon-192.png" };
const jsonRes = data => new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
const avisoAt = a => (typeof a.at === "number" ? a.at : new Date(a.date + "T08:00:00").getTime());
async function showAvisos(fromPush) {
  if (self.Notification.permission !== "granted") return 0;
  const cache = await caches.open(AVISOS);
  const res = await cache.match("avisos.json"), data = res ? await res.json() : null;
  const now = Date.now(), seenRes = await cache.match("vistos.json");
  let seen = (seenRes ? await seenRes.json() : []).filter(s => s && typeof s === "object");
  const ids = new Set(seen.map(s => s.id));
  // los que ya vencieron (hasta 12 h atrás) y todavía no se mostraron
  const due = data && data.on ? data.list.filter(a => avisoAt(a) <= now + 60000 && avisoAt(a) > now - 12 * 3600000 && !ids.has(a.id)) : [];
  for (const a of due) {
    await self.registration.showNotification(a.title, { ...NOTIF, body: a.body, tag: a.id, data: { url: a.id.startsWith("prueba/") ? "./#/ajustes" : "./#/plan" } });
    seen.push({ id: a.id, t: now });
  }
  // un push siempre tiene que mostrar algo (si no, el navegador puede retirar el permiso)
  if (fromPush && !due.length) await self.registration.showNotification("efecen", { ...NOTIF, body: "Mirá qué toca hoy en tu plan de estudio.", tag: "efecen-general", data: { url: "./#/plan" } });
  seen = seen.filter(s => now - s.t < 2 * 86400000);
  await cache.put("vistos.json", jsonRes(seen));
  return due.length;
}
self.addEventListener("push", e => e.waitUntil(showAvisos(true).catch(() => {})));
self.addEventListener("periodicsync", e => { if (e.tag === AVISOS) e.waitUntil(showAvisos(false).catch(() => {})); });
// el navegador renovó la suscripción: se registra la nueva con las mismas horas
self.addEventListener("pushsubscriptionchange", e => e.waitUntil((async () => {
  const cache = await caches.open(AVISOS), res = await cache.match("avisos.json"), data = res ? await res.json() : null;
  if (!data || !data.on || !data.push) return;
  const post = (path, body) => fetch(data.push.url + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const key = Uint8Array.from(atob(data.push.key.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
  const sub = e.newSubscription || await self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  const nowS = Date.now() / 1000, times = [...new Set(data.list.map(a => Math.floor(avisoAt(a) / 60000) * 60).filter(t => t > nowS))];
  if (e.oldSubscription) await post("/unsubscribe", { endpoint: e.oldSubscription.endpoint }).catch(() => {});
  await post("/subscribe", { endpoint: sub.endpoint, times });
})().catch(() => {})));
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "./";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => {
    for (const c of cs) if ("focus" in c) { if ("navigate" in c) c.navigate(url).catch(() => {}); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
