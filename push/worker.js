// efecen-push: despierta a la app instalada a la hora de cada aviso (Cloudflare Worker + D1 + cron por minuto).
//
// La app registra su suscripción de Web Push y las horas en las que quiere que la despierten. Cada minuto el cron
// manda un push SIN contenido a las suscripciones que vencen; el service worker de la app arma la notificación
// con la lista que tiene guardada en el dispositivo. Acá no se guarda ningún texto, ni cuentas, ni claves de
// cifrado: solo la dirección de la suscripción y las horas.
//
// Rutas (JSON, solo desde los orígenes de la app):
//   POST /subscribe    { endpoint, times: [segundos epoch] }  -> reemplaza las horas de esa suscripción
//   POST /unsubscribe  { endpoint }
//   POST /test         { endpoint }                           -> manda un push ya (para «probar»)
//   GET  /             -> { ok: true }

const ORIGINS = [/^https:\/\/(www\.)?efecen\.com\.ar$/, /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/];
// servicios de push de los navegadores: no se manda nada a ninguna otra dirección
const PUSH_HOSTS = [/^fcm\.googleapis\.com$/, /^([a-z0-9-]+\.)*push\.services\.mozilla\.com$/, /^([a-z0-9-]+\.)*notify\.windows\.com$/, /^([a-z0-9-]+\.)*push\.apple\.com$/];
export const LIMITS = {
  body: 20000,        // bytes de un pedido
  times: 120,         // horas por suscripción
  ahead: 62 * 86400,  // hasta cuándo se aceptan (s)
  stale: 6 * 3600,    // un aviso atrasado más que esto ya no se manda (s)
  perRun: 40,         // suscripciones por corrida del cron (el plan gratis permite 50 pedidos salientes)
  idle: 120 * 86400,  // una suscripción que no se renueva en este tiempo se borra (s)
  testEvery: 20,      // segundos entre dos pruebas de la misma suscripción
  early: 45           // el cron corre en cualquier momento del minuto: manda lo que vence en los próximos segundos
};

const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const enc = s => new TextEncoder().encode(s);
const sha256 = async s => [...new Uint8Array(await crypto.subtle.digest("SHA-256", enc(s)))].map(b => b.toString(16).padStart(2, "0")).join("");

export function validEndpoint(endpoint) {
  if (typeof endpoint !== "string" || endpoint.length > 1000) return false;
  let u;
  try { u = new URL(endpoint); } catch (e) { return false; }
  return u.protocol === "https:" && !u.username && !u.port && PUSH_HOSTS.some(re => re.test(u.hostname));
}

// las horas válidas de un pedido: enteras, futuras, dentro de la ventana, al minuto, sin repetir y con tope
export function cleanTimes(times, now) {
  if (!Array.isArray(times)) return [];
  const out = new Set();
  for (const t of times) {
    if (typeof t !== "number" || !Number.isFinite(t)) continue;
    const m = Math.floor(t / 60) * 60;
    if (m > now - 60 && m <= now + LIMITS.ahead) out.add(m);
  }
  return [...out].sort((a, b) => a - b).slice(0, LIMITS.times);
}

// ---------- VAPID (RFC 8292): un JWT firmado con ES256 que identifica al servidor ante el servicio de push ----------
const jwtCache = new Map(); // audiencia -> { jwt, exp }
export async function vapidAuth(env, endpoint, now) {
  const aud = new URL(endpoint).origin;
  let c = jwtCache.get(aud);
  if (!c || c.exp - now < 3600) {
    const key = await crypto.subtle.importKey("jwk", JSON.parse(env.VAPID_PRIVATE_JWK), { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
    const exp = now + 12 * 3600;
    const head = b64u(enc(JSON.stringify({ typ: "JWT", alg: "ES256" }))), body = b64u(enc(JSON.stringify({ aud, exp, sub: env.VAPID_SUBJECT })));
    const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc(`${head}.${body}`));
    c = { jwt: `${head}.${body}.${b64u(sig)}`, exp };
    jwtCache.set(aud, c);
  }
  return `vapid t=${c.jwt}, k=${env.VAPID_PUBLIC}`;
}

// un push sin contenido; devuelve el código HTTP del servicio de push (0 si no se pudo conectar)
export async function sendPush(env, endpoint, now, fetcher = fetch) {
  try {
    const res = await fetcher(endpoint, { method: "POST", headers: { Authorization: await vapidAuth(env, endpoint, now), TTL: String(LIMITS.stale), Urgency: "high", "Content-Length": "0" } });
    return res.status;
  } catch (e) { return 0; }
}

// ---------- cron: manda lo que vence ----------
export async function runDue(env, now, fetcher = fetch) {
  const db = env.DB;
  const { results } = await db.prepare("SELECT d.sub AS sub, MAX(d.at) AS last, s.endpoint AS endpoint FROM due d JOIN subs s ON s.id = d.sub WHERE d.at <= ?1 GROUP BY d.sub ORDER BY MIN(d.at) LIMIT ?2").bind(now, LIMITS.perRun).all();
  const stats = { sent: 0, gone: 0, retry: 0, stale: 0 };
  await Promise.all(results.map(async r => {
    const done = db.prepare("DELETE FROM due WHERE sub = ?1 AND at <= ?2").bind(r.sub, now);
    // todo lo vencido es demasiado viejo (el servicio estuvo caído, por ejemplo): se descarta sin molestar
    if (now - r.last > LIMITS.stale) { stats.stale++; await done.run(); return; }
    const st = await sendPush(env, r.endpoint, now, fetcher);
    if (st >= 200 && st < 300) {
      stats.sent++;
      await db.batch([done, db.prepare("UPDATE subs SET fails = 0 WHERE id = ?1").bind(r.sub)]);
    } else if (st === 404 || st === 410) {
      // la suscripción ya no existe (se desinstaló la app o se revocó el permiso)
      stats.gone++;
      await db.batch([db.prepare("DELETE FROM due WHERE sub = ?1").bind(r.sub), db.prepare("DELETE FROM subs WHERE id = ?1").bind(r.sub)]);
    } else {
      // falla pasajera: queda para el próximo minuto, hasta que se vuelva vieja
      stats.retry++;
      await db.prepare("UPDATE subs SET fails = fails + 1 WHERE id = ?1").bind(r.sub).run();
    }
  }));
  return stats;
}

// limpieza diaria: suscripciones abandonadas y horas sin dueño
export async function cleanup(env, now) {
  await env.DB.batch([
    env.DB.prepare("DELETE FROM subs WHERE updated < ?1").bind(now - LIMITS.idle),
    env.DB.prepare("DELETE FROM due WHERE sub NOT IN (SELECT id FROM subs)"),
    env.DB.prepare("DELETE FROM due WHERE at < ?1").bind(now - 2 * LIMITS.stale)
  ]);
}

// ---------- API ----------
const json = (data, status, cors) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...cors } });

export async function handle(request, env, now = Math.floor(Date.now() / 1000), fetcher = fetch) {
  const url = new URL(request.url), origin = request.headers.get("Origin") || "";
  const allowed = ORIGINS.some(re => re.test(origin));
  const cors = allowed ? { "Access-Control-Allow-Origin": origin, Vary: "Origin", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" } : {};
  if (request.method === "OPTIONS") return new Response(null, { status: allowed ? 204 : 403, headers: cors });
  if (request.method === "GET" && url.pathname === "/") return json({ ok: true, service: "efecen-push" }, 200, cors);
  if (request.method !== "POST") return json({ ok: false, error: "no encontrado" }, 404, cors);
  if (!allowed) return json({ ok: false, error: "origen no permitido" }, 403, cors);
  const text = await request.text();
  if (text.length > LIMITS.body) return json({ ok: false, error: "pedido demasiado grande" }, 413, cors);
  let data;
  try { data = JSON.parse(text); } catch (e) { return json({ ok: false, error: "JSON inválido" }, 400, cors); }
  if (!data || !validEndpoint(data.endpoint)) return json({ ok: false, error: "suscripción inválida" }, 400, cors);
  const db = env.DB, id = await sha256(data.endpoint);

  if (url.pathname === "/subscribe") {
    const times = cleanTimes(data.times, now);
    await db.batch([
      db.prepare("INSERT INTO subs (id, endpoint, updated, fails) VALUES (?1, ?2, ?3, 0) ON CONFLICT(id) DO UPDATE SET updated = ?3").bind(id, data.endpoint, now),
      db.prepare("DELETE FROM due WHERE sub = ?1").bind(id),
      ...times.map(t => db.prepare("INSERT OR IGNORE INTO due (sub, at) VALUES (?1, ?2)").bind(id, t))
    ]);
    return json({ ok: true, n: times.length }, 200, cors);
  }
  if (url.pathname === "/unsubscribe") {
    await db.batch([db.prepare("DELETE FROM due WHERE sub = ?1").bind(id), db.prepare("DELETE FROM subs WHERE id = ?1").bind(id)]);
    return json({ ok: true }, 200, cors);
  }
  if (url.pathname === "/test") {
    // solo para suscripciones registradas, y no más de una cada tanto
    const row = await db.prepare("SELECT tested FROM subs WHERE id = ?1").bind(id).first();
    if (!row) return json({ ok: false, error: "suscripción no registrada" }, 404, cors);
    if (now - (row.tested || 0) < LIMITS.testEvery) return json({ ok: false, error: "esperá unos segundos" }, 429, cors);
    await db.prepare("UPDATE subs SET tested = ?2 WHERE id = ?1").bind(id, now).run();
    const st = await sendPush(env, data.endpoint, now, fetcher);
    return json({ ok: st >= 200 && st < 300, status: st }, 200, cors);
  }
  return json({ ok: false, error: "no encontrado" }, 404, cors);
}

export default {
  async fetch(request, env) {
    try { return await handle(request, env); } catch (e) { console.error("fetch", e && e.stack || e); return json({ ok: false, error: "error interno" }, 500, {}); }
  },
  async scheduled(event, env, ctx) {
    // la hora real de la corrida (no la programada), más la anticipación: la app acepta un aviso hasta 60 s antes
    const now = Math.floor(Date.now() / 1000);
    ctx.waitUntil((async () => {
      const stats = await runDue(env, now + LIMITS.early);
      if (stats.sent || stats.gone || stats.retry || stats.stale) console.log("avisos", JSON.stringify(stats));
      // una vez por día (4:07 UTC)
      const d = new Date(event.scheduledTime);
      if (d.getUTCHours() === 4 && d.getUTCMinutes() === 7) await cleanup(env, now);
    })());
  }
};
