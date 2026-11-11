// Tests del servicio de avisos. Uso: node push/test.mjs
// Corre el Worker contra una base SQLite en memoria (con la misma interfaz que D1) y un servicio de push falso.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { handle, runDue, cleanup, cleanTimes, validEndpoint, vapidAuth, LIMITS } from "./worker.js";

const dir = path.dirname(fileURLToPath(import.meta.url));
let checks = 0, failures = 0;
const ok = (cond, msg) => { checks++; if (!cond) { failures++; console.log("  ✗ " + msg); } };

// D1 mínimo sobre node:sqlite
function fakeD1() {
  const db = new DatabaseSync(":memory:");
  db.exec(fs.readFileSync(path.join(dir, "schema.sql"), "utf8"));
  const stmt = (sql, bound = []) => {
    // D1 usa ?1, ?2…; acá se pasan a «?» sueltos, repitiendo el valor cada vez que aparece
    const args = [], q = sql.replace(/\?(\d+)/g, (m, n) => { args.push(bound[n - 1]); return "?"; });
    return {
      bind: (...a) => stmt(sql, a),
      run: async () => { db.prepare(q).run(...args); return { success: true }; },
      all: async () => ({ results: db.prepare(q).all(...args) }),
      first: async () => db.prepare(q).get(...args) || null,
      _run: () => db.prepare(q).run(...args)
    };
  };
  return {
    prepare: sql => stmt(sql),
    batch: async list => { db.exec("BEGIN"); try { for (const s of list) s._run(); db.exec("COMMIT"); } catch (e) { db.exec("ROLLBACK"); throw e; } return []; },
    raw: db
  };
}
const b64u = buf => Buffer.from(buf).toString("base64url");
async function makeEnv() {
  const kp = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  return {
    DB: fakeD1(), VAPID_SUBJECT: "https://efecen.com.ar",
    VAPID_PRIVATE_JWK: JSON.stringify(await crypto.subtle.exportKey("jwk", kp.privateKey)),
    VAPID_PUBLIC: b64u(await crypto.subtle.exportKey("raw", kp.publicKey)), pub: kp.publicKey
  };
}
const post = (p, body, origin = "https://efecen.com.ar") => new Request("https://push.example" + p, { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: typeof body === "string" ? body : JSON.stringify(body) });
const EP = n => `https://fcm.googleapis.com/fcm/send/dispositivo-${n}`;
const count = (env, t) => env.DB.raw.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n;

const NOW = 1_800_000_000 - (1_800_000_000 % 60);

// --- validaciones ---
ok(validEndpoint(EP(1)) && validEndpoint("https://updates.push.services.mozilla.com/wpush/v2/abc") && validEndpoint("https://web.push.apple.com/QGk") && validEndpoint("https://wns2-by3p.notify.windows.com/w/?token=x"), "no acepta los servicios de push conocidos");
ok(!validEndpoint("https://evil.example/x") && !validEndpoint("http://fcm.googleapis.com/x") && !validEndpoint("https://fcm.googleapis.com.evil.io/x") && !validEndpoint("https://a@fcm.googleapis.com/x") && !validEndpoint("https://fcm.googleapis.com:8443/x") && !validEndpoint(null) && !validEndpoint("x".repeat(2000)), "acepta una dirección que no es de un servicio de push");
{
  const t = cleanTimes([NOW + 125, NOW + 125, NOW + 130, NOW - 5000, NOW + LIMITS.ahead + 999, "x", NaN, NOW + 3600], NOW);
  ok(t.join() === [NOW + 120, NOW + 3600].join(), "cleanTimes: debe redondear al minuto, sacar repetidas, pasadas y lejanas: " + t.join());
  ok(cleanTimes(Array.from({ length: 500 }, (_, i) => NOW + 60 * (i + 1)), NOW).length === LIMITS.times && cleanTimes("no", NOW).length === 0, "cleanTimes: no respeta el tope");
}

// --- VAPID: el JWT se verifica con la clave pública y trae la audiencia del servicio de push ---
{
  const env = await makeEnv(), auth = await vapidAuth(env, EP(1), NOW);
  const m = /^vapid t=([\w-]+)\.([\w-]+)\.([\w-]+), k=([\w-]+)$/.exec(auth);
  ok(!!m, "cabecera VAPID mal formada");
  if (m) {
    const good = await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, env.pub, Buffer.from(m[3], "base64url"), new TextEncoder().encode(`${m[1]}.${m[2]}`));
    const head = JSON.parse(Buffer.from(m[1], "base64url")), body = JSON.parse(Buffer.from(m[2], "base64url"));
    ok(good, "la firma del JWT no verifica");
    ok(head.alg === "ES256" && head.typ === "JWT" && body.aud === "https://fcm.googleapis.com" && body.sub === "https://efecen.com.ar" && body.exp > NOW && body.exp - NOW <= 86400, "JWT: cabecera o datos incorrectos");
    ok(m[4] === env.VAPID_PUBLIC && Buffer.from(m[4], "base64url").length === 65, "la clave pública no va en la cabecera");
  }
}

// --- API ---
{
  const env = await makeEnv();
  let r = await handle(post("/subscribe", { endpoint: EP(1), times: [NOW + 60, NOW + 600] }), env, NOW);
  let j = await r.json();
  ok(r.status === 200 && j.ok && j.n === 2 && r.headers.get("Access-Control-Allow-Origin") === "https://efecen.com.ar", "subscribe: no registra o no manda CORS");
  ok(count(env, "subs") === 1 && count(env, "due") === 2, "subscribe: filas incorrectas");
  // volver a registrar reemplaza las horas, no las suma
  await handle(post("/subscribe", { endpoint: EP(1), times: [NOW + 900] }), env, NOW + 5);
  ok(count(env, "subs") === 1 && count(env, "due") === 1 && env.DB.raw.prepare("SELECT updated FROM subs").get().updated === NOW + 5, "subscribe: debe reemplazar las horas y renovar la fecha");
  ok((await handle(post("/subscribe", { endpoint: EP(1), times: [] }, "https://otro.sitio"), env, NOW)).status === 403, "acepta otro origen");
  ok((await handle(post("/subscribe", { endpoint: "https://evil.example/x", times: [NOW + 60] }), env, NOW)).status === 400, "acepta una suscripción inválida");
  ok((await handle(post("/subscribe", "{no json"), env, NOW)).status === 400 && (await handle(post("/subscribe", JSON.stringify({ endpoint: EP(1), pad: "x".repeat(30000) })), env, NOW)).status === 413, "no rechaza pedidos rotos o enormes");
  ok((await handle(new Request("https://push.example/", { method: "OPTIONS", headers: { Origin: "http://localhost:4173" } }), env, NOW)).status === 204 && (await handle(new Request("https://push.example/"), env, NOW)).status === 200, "OPTIONS o GET / no responden");
  // prueba: solo registradas y con espera
  const sent = [], fetcher = async (u, o) => { sent.push({ u, o }); return new Response(null, { status: 201 }); };
  ok((await handle(post("/test", { endpoint: EP(9) }), env, NOW, fetcher)).status === 404 && sent.length === 0, "test: manda a una suscripción no registrada");
  j = await (await handle(post("/test", { endpoint: EP(1) }), env, NOW + 100, fetcher)).json();
  ok(j.ok && j.status === 201 && sent.length === 1 && sent[0].u === EP(1) && sent[0].o.method === "POST" && sent[0].o.headers.Authorization.startsWith("vapid t=") && sent[0].o.headers.TTL && !sent[0].o.body, "test: no manda el push sin contenido con VAPID");
  ok((await handle(post("/test", { endpoint: EP(1) }), env, NOW + 105, fetcher)).status === 429 && sent.length === 1, "test: no limita la frecuencia");
  r = await handle(post("/unsubscribe", { endpoint: EP(1) }), env, NOW);
  ok(r.status === 200 && count(env, "subs") === 0 && count(env, "due") === 0, "unsubscribe: no borra todo");
}

// --- cron ---
{
  const env = await makeEnv();
  const sub = (n, times) => handle(post("/subscribe", { endpoint: EP(n), times }), env, NOW);
  await sub(1, [NOW + 60, NOW + 120, NOW + 7200]);   // dos vencen juntas: un solo push
  await sub(2, [NOW + 120]);                         // el servicio dice que ya no existe
  await sub(3, [NOW + 120]);                         // falla pasajera
  await sub(4, [NOW + 3600]);                        // todavía no vence
  const calls = [];
  const fetcher = async u => { calls.push(u); return new Response(null, { status: u === EP(2) ? 410 : u === EP(3) ? 503 : 201 }); };
  let st = await runDue(env, NOW, fetcher);
  ok(calls.length === 0 && st.sent === 0, "manda antes de hora");
  st = await runDue(env, NOW + 120, fetcher);
  ok(st.sent === 1 && st.gone === 1 && st.retry === 1 && calls.length === 3 && calls.filter(u => u === EP(1)).length === 1, "corrida: " + JSON.stringify(st) + " con " + calls.length + " envíos");
  ok(count(env, "subs") === 3 && env.DB.raw.prepare("SELECT COUNT(*) AS n FROM due WHERE sub = (SELECT id FROM subs WHERE endpoint = ?)").get(EP(1)).n === 1, "tras mandar: debe quedar solo la hora futura y borrarse la suscripción caída");
  // la que falló se reintenta al minuto siguiente; las ya enviadas no se repiten
  calls.length = 0;
  st = await runDue(env, NOW + 180, fetcher);
  ok(calls.length === 1 && calls[0] === EP(3) && st.retry === 1 && env.DB.raw.prepare("SELECT fails FROM subs WHERE endpoint = ?").get(EP(3)).fails === 2, "no reintenta solo la que falló");
  // si sigue fallando hasta volverse vieja, se descarta sin mandar
  calls.length = 0;
  st = await runDue(env, NOW + 120 + LIMITS.stale + 60, fetcher);
  ok(st.stale === 1 && !calls.includes(EP(3)) && calls.includes(EP(4)) && calls.includes(EP(1)), "no descarta lo viejo o no manda lo que venció después: " + JSON.stringify(st));
  ok(count(env, "due") === 0, "quedaron horas sin procesar");
  // tope por corrida: lo que sobra queda para el minuto siguiente
  for (let i = 0; i < LIMITS.perRun + 5; i++) await handle(post("/subscribe", { endpoint: EP(100 + i), times: [NOW + 60] }), env, NOW);
  calls.length = 0;
  await runDue(env, NOW + 60, fetcher);
  ok(calls.length === LIMITS.perRun, "no respeta el tope por corrida");
  await runDue(env, NOW + 120, fetcher);
  ok(calls.length === LIMITS.perRun + 5 && count(env, "due") === 0, "lo que sobró no se mandó en la corrida siguiente");
  // limpieza: suscripciones abandonadas
  await cleanup(env, NOW + LIMITS.idle + 86400);
  ok(count(env, "subs") === 0, "cleanup no borra las suscripciones abandonadas");
}

console.log(`${checks} chequeos, ${failures} fallas`);
process.exit(failures ? 1 : 0);
