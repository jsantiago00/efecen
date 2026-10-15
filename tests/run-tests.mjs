// Tests del motor y del contenido. Uso:  node tests/run-tests.mjs [instancias por plantilla]
// - Carga el <script id="engine"> de index.html y los cursos de content/ en un contexto aislado.
// - Genera muchas instancias de cada plantilla y valida estructura, LaTeX (KaTeX estricto) y,
//   cuando la plantilla trae `verify`, que la respuesta sea numéricamente correcta.
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const N = +process.argv[2] || 300;
const ONLY = process.argv[3] || null; // opcional: probar las plantillas de una sola materia (p. ej. m104)
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const engine = /<script id="engine">([\s\S]*?)<\/script>/.exec(html)[1];
const contentFiles = [...html.matchAll(/<script src="(content\/[^"]+)"><\/script>/g)].map(m => m[1]);

const ctx = { console, Math, Date, JSON };
ctx.window = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, "assets/vendor/katex/katex.min.js"), "utf8"), ctx);
vm.runInContext(engine, ctx);
for (const f of contentFiles) vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f });
const E = ctx.Efecen, katex = ctx.katex;

let failures = 0, checks = 0;
const fail = (where, msg) => { failures++; if (failures <= 60) console.log(`  ✗ ${where}: ${msg}`); };
const ok = (cond, where, msg) => { checks++; if (!cond) fail(where, msg); };

// ---------- 1. parser numérico ----------
const P = [["3/4", 0.75], ["-2,5", -2.5], ["pi/2", Math.PI / 2], ["π/6", Math.PI / 6], ["sqrt(3)", Math.sqrt(3)], ["√3/2", Math.sqrt(3) / 2],
  ["2pi", 2 * Math.PI], ["e^2", Math.E ** 2], ["-2^2", -4], ["2^-1", 0.5], ["3sqrt(2)", 3 * Math.sqrt(2)], ["(1+2)*3", 9],
  ["sin(pi/6)", 0.5], ["ln(e)", 1], ["1.5e", 1.5 * Math.E], ["sqrt(2", Math.SQRT2], ["4 / 3", 4 / 3], ["", NaN], ["abc", NaN], ["2+", NaN], ["1/0", Infinity]];
for (const [s, v] of P) {
  const got = E.parseNum(s);
  ok(Number.isNaN(v) ? Number.isNaN(got) : Math.abs(got - v) < 1e-12 || got === v, "parseNum", `"${s}" -> ${got}, esperaba ${v}`);
}
ok(E.checkNumeric(0.33, 1 / 3), "checkNumeric", "0.33 ≈ 1/3");
ok(E.checkNumeric(4.71, 1.5 * Math.PI), "checkNumeric", "4.71 ≈ 3π/2");
ok(!E.checkNumeric(0.3, 1 / 3), "checkNumeric", "0.3 no es 1/3");
ok(E.checkNumeric(0, 0) && !E.checkNumeric(0.1, 0), "checkNumeric", "cero");
ok(!E.checkNumeric(Infinity, 1), "checkNumeric", "infinito");

// ---------- 2. SRS ----------
{
  let c = E.srs.newCard();
  c = E.srs.update(c, 5, "2026-01-01"); ok(c.int === 1 && c.due === "2026-01-02", "srs", `1ra rep ${JSON.stringify(c)}`);
  c = E.srs.update(c, 4, "2026-01-02"); ok(c.int === 3 && c.due === "2026-01-05", "srs", `2da rep ${JSON.stringify(c)}`);
  c = E.srs.update(c, 4, "2026-01-05"); ok(c.int >= 7, "srs", `3ra rep ${JSON.stringify(c)}`);
  c = E.srs.update(c, 1, "2026-01-12"); ok(c.int === 1 && c.reps === 0 && c.ef >= 1.3, "srs", `fallo ${JSON.stringify(c)}`);
  ok(E.addDays("2026-02-28", 1) === "2026-03-01" && E.diffDays("2026-03-28", "2026-03-30") === 2, "fechas", "addDays/diffDays");
}

// ---------- 3. estructura de cursos ----------
const texOf = s => (String(s).match(/\$\$[^$]+\$\$|\$[^$]+\$/g) || []).map(m => m.replace(/^\$\$?|\$?\$$/g, ""));
function checkTex(where, s) {
  for (const m of texOf(s)) {
    checks++;
    try { katex.renderToString(m, { throwOnError: true, strict: "error", displayMode: false }); }
    catch (e) { fail(where, `LaTeX inválido: ${m}  (${e.message.slice(0, 90)})`); }
  }
  // el texto de un link no puede tener LaTeX (se rompería al separar las fórmulas)
  if (/\[\[[a-z0-9-]+\|[^\]]*\$/.test(String(s))) fail(where, "link con LaTeX en el texto: " + String(s).match(/\[\[[^\]]*\]\]/)[0]);
  // los links [[id]] de ejercicios y apuntes tienen que apuntar a fichas existentes
  for (const m of String(s).matchAll(/\[\[([a-z0-9-]+)(?:\|[^\]]+)?\]\]/g)) { checks++; if (!E.cards[m[1]]) fail(where, `link roto [[${m[1]}]]`); }
  // signos dobles o restos de JS en el texto
  if (/\+ -|- -|undefined|NaN|\[object/.test(s)) fail(where, `texto sospechoso: ${s.slice(0, 140)}`);
}
const numDeriv = (f, x, h = 1e-5) => (f(x + h) - f(x - h)) / (2 * h);
const numDeriv2 = (f, x, h = 1e-4) => (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
const close = (a, b, tol = 1e-4) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

// ---------- verificación numérica independiente ----------
// Cada plantilla trae `verify` con datos crudos (funciones, matrices, ecuaciones de movimiento);
// acá se recalcula la respuesta por otro camino (diferencias finitas, Simpson, RK4, Gauss, sumas parciales)
// y se compara con la que muestra la app.
// Plantillas del MVP que no traían verify (las nuevas lo tienen obligatorio):
const LEGACY_NO_VERIFY = new Set(["lim-grafico-mc", "lim-existe-vf", "lim-order-conj", "lim-error-factor", "lim-asintota-mc", "cont-tipo-mc",
  "cont-param-num", "cont-tvi-vf", "lim-match-graph", "der-def-order", "der-cont-vf", "der-match-formula", "der-error-coc",
  "der-error-cadena", "der-order-lntrig", "der-tangente-num", "der-match-graph"]);
const simpson = (f, a, b, n = 20000) => {
  if (n % 2) n++;
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
};
const integrate = (f, a, b, inf) => (inf
  ? simpson(s => { const e = Math.exp(s); return f(a - 1 + e) * e; }, 0, 80, 400000) // x = a - 1 + e^s: las colas tipo potencia quedan exponenciales
  : simpson(f, a, b));
function rk4(f, y0, t1, opts = {}) {
  const dt = opts.dt || 1e-4;
  let t = 0, y = y0.slice();
  const add = (a, b, k) => a.map((v, i) => v + b[i] * k);
  for (let n = 0; n < 5e7; n++) {
    if (!opts.until && t >= t1 - 1e-12) break;
    const h = opts.until ? dt : Math.min(dt, t1 - t);
    const k1 = f(t, y), k2 = f(t + h / 2, add(y, k1, h / 2)), k3 = f(t + h / 2, add(y, k2, h / 2)), k4 = f(t + h, add(y, k3, h));
    const yn = y.map((v, i) => v + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    if (opts.until && opts.until(t + h, yn) && !opts.until(t, y)) {
      // evento: interpolación lineal entre los dos pasos usando la función g = until.value
      const g0 = opts.g(t, y), g1 = opts.g(t + h, yn), s = g0 / (g0 - g1);
      return { t: t + s * h, y: y.map((v, i) => v + s * (yn[i] - v)) };
    }
    t += h; y = yn;
    if (opts.until && t > (opts.tmax || 1e4)) break;
  }
  return { t, y };
}
// álgebra lineal por eliminación de Gauss (independiente de cofactores o Cramer)
const clone = A => A.map(r => r.slice());
function gaussDet(A) {
  const M = clone(A), n = M.length;
  let det = 1;
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-12) return 0;
    if (p !== c) { [M[p], M[c]] = [M[c], M[p]]; det = -det; }
    det *= M[c][c];
    for (let r = c + 1; r < n; r++) { const f = M[r][c] / M[c][c]; for (let k = c; k < n; k++) M[r][k] -= f * M[c][k]; }
  }
  return det;
}
function gaussRank(A) {
  const M = clone(A), rows = M.length, cols = M[0].length;
  let r = 0;
  for (let c = 0; c < cols && r < rows; c++) {
    let p = r;
    for (let i = r + 1; i < rows; i++) if (Math.abs(M[i][c]) > Math.abs(M[p][c])) p = i;
    if (Math.abs(M[p][c]) < 1e-9) continue;
    [M[p], M[r]] = [M[r], M[p]];
    for (let i = r + 1; i < rows; i++) { const f = M[i][c] / M[r][c]; for (let k = c; k < cols; k++) M[i][k] -= f * M[r][k]; }
    r++;
  }
  return r;
}
const matmul = (A, B) => A.map(row => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)));
const matvec = (A, x) => A.map(row => row.reduce((s, a, k) => s + a * x[k], 0));
const near = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
const eye = n => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));

function runVerify(v, answer, w) {
  const target = v.target !== undefined ? v.target : answer;
  // en álgebra lineal la matriz puede depender de la respuesta (por ejemplo, el k que anula un determinante)
  if (typeof v.A === "function") v = Object.assign({}, v, { A: v.A(answer) });
  const okNum = (got, msg, tol = 1e-4) => ok(Number.isFinite(got) && close(got, target, tol), w, `${msg}: ${got} vs ${target}`);
  switch (v.kind) {
    case "limit": {
      const h = v.h || 1e-6;
      const vals = v.side === "-" ? [v.f(v.a - h)] : v.side === "+" ? [v.f(v.a + h)] : [v.f(v.a - h), v.f(v.a + h)];
      for (const y of vals) ok(close(y, target, 1e-3), w, `límite numérico ${y} vs ${target}`);
      break;
    }
    case "liminf": okNum(v.f(v.x || 1e7), "límite al infinito"); break;
    case "limsign": {
      const y = v.f(v.a + (v.side === "+" ? 1e-7 : -1e-7));
      ok(Math.sign(y) === v.sign && Math.abs(y) > 1e5, w, "signo del límite infinito");
      break;
    }
    case "deriv": okNum(numDeriv(v.f, v.x0), `f'(${v.x0}) numérica`); break;
    case "deriv2": okNum(numDeriv2(v.f, v.x0), `f''(${v.x0}) numérica`, 1e-3); break;
    case "deriv-fn": case "antideriv": {
      // deriv-fn: df es la derivada de f; antideriv: F es una primitiva de f
      const F = v.kind === "antideriv" ? v.F : v.f, f = v.kind === "antideriv" ? v.f : v.df;
      const [lo, hi] = v.dom || [-2, 2];
      for (let i = 0; i < 5; i++) {
        const x = lo + (hi - lo) * (i + 0.37) / 5;
        ok(close(numDeriv(F, x), f(x), 1e-4), w, `derivada en x=${x}: ${numDeriv(F, x)} vs ${f(x)}`);
      }
      break;
    }
    case "implicit": {
      ok(Math.abs(v.F(v.p, v.q)) < 1e-9, w, "el punto no está en la curva");
      const h = 1e-6;
      const Fx = (v.F(v.p + h, v.q) - v.F(v.p - h, v.q)) / (2 * h), Fy = (v.F(v.p, v.q + h) - v.F(v.p, v.q - h)) / (2 * h);
      okNum(-Fx / Fy, "implícita", 1e-5);
      break;
    }
    case "integral": okNum(integrate(v.f, v.a, v.b, v.inf), "integral por Simpson", v.tol || 1e-4); break;
    case "sum": {
      let s = 0;
      const N = v.inf ? (v.N || 1e6) : v.to;
      for (let n = v.from; n <= N; n++) s += v.term(n);
      okNum(s, v.inf ? `suma parcial S_${N}` : "suma", v.tol || 1e-4);
      break;
    }
    case "seqlim": {
      const y = v.a(v.n || 1e6);
      if (target === Infinity || target === -Infinity) ok(Math.sign(y) === Math.sign(target) && Math.abs(y) > 1e4, w, `la sucesión no diverge: ${y}`);
      else okNum(y, `a_n para n grande`, v.tol || 1e-3);
      break;
    }
    case "ratio": {
      // límite de |a_{n+1}/a_n| a partir del logaritmo de los términos
      const n = v.n || 2e4;
      okNum(Math.exp(v.logTerm(n + 1) - v.logTerm(n)), "cociente |a(n+1)/a(n)| numérico", v.tol || 2e-3);
      break;
    }
    case "exponent": {
      // a_n ~ C/n^p: p ≈ log(a(N)/a(10N))/log 10
      const N = v.N || 1e5;
      okNum(Math.log(v.term(N) / v.term(10 * N)) / Math.LN10, "exponente efectivo", 5e-3);
      break;
    }
    case "ode": {
      const r = rk4(v.f, v.y0, v.t1, v);
      okNum(v.out(r.t, r.y), "simulación numérica (RK4)", v.tol || 1e-3);
      break;
    }
    case "value": okNum(v.fn(), "valor recalculado", v.tol || 1e-6); break;
    case "zero": {
      const res = [].concat(v.fn(answer));
      for (const r of res) ok(Number.isFinite(r) && Math.abs(r) <= (v.tol || 1e-6) * Math.max(1, v.scale || 1), w, `residuo ${r} ≠ 0`);
      break;
    }
    case "truth": ok(v.fn() === target, w, `el enunciado vale ${v.fn()} y la respuesta dice ${target}`); break;
    case "det": okNum(gaussDet(v.A), "determinante por Gauss", 1e-6); break;
    case "rank": ok(gaussRank(v.A) === target, w, `rango por Gauss ${gaussRank(v.A)} vs ${target}`); break;
    case "solve": {
      if (v.x) matvec(v.A, v.x).forEach((y, i) => ok(near(y, v.b[i]), w, `A·x ≠ b en la fila ${i + 1}`));
      else ok(gaussRank(v.A) < gaussRank(v.A.map((r, i) => r.concat([v.b[i]]))), w, "el sistema sí tenía solución");
      break;
    }
    case "inv": matmul(v.A, v.B).forEach((r, i) => r.forEach((x, j) => ok(near(x, i === j ? 1 : 0), w, `A·A⁻¹ no da I en (${i},${j})`))); break;
    case "matmul": matmul(v.A, v.B).forEach((r, i) => r.forEach((x, j) => ok(near(x, v.C[i][j]), w, `producto distinto en (${i},${j})`))); break;
    case "eig": {
      const n = v.A.length, M = v.A.map((r, i) => r.map((x, j) => x - (i === j ? v.lambda : 0)));
      ok(Math.abs(gaussDet(M)) < 1e-6 * Math.max(1, ...v.A.flat().map(Math.abs)) ** n, w, `det(A - λI) ≠ 0 para λ = ${v.lambda}`);
      if (v.v) matvec(v.A, v.v).forEach((y, i) => ok(near(y, v.lambda * v.v[i]), w, "A·v ≠ λ·v"));
      break;
    }
    case "rouche": {
      // 0: compatible determinado, 1: compatible indeterminado, 2: incompatible
      const rA = gaussRank(v.A), rAb = gaussRank(v.A.map((r, i) => r.concat([v.b[i]]))), n = v.A[0].length;
      const cls = rA < rAb ? 2 : rA === n ? 0 : 1;
      ok(cls === target, w, `Rouché-Frobenius por Gauss da ${cls} y la respuesta dice ${target}`);
      break;
    }
    case "nullity": ok(v.A[0].length - gaussRank(v.A) === target, w, `nulidad por Gauss ${v.A[0].length - gaussRank(v.A)} vs ${target}`); break;
    case "all": for (const sub of v.list) runVerify(sub, answer, w); break;
    default: fail(w, "tipo de verify desconocido: " + v.kind);
  }
}

let totalTemplates = 0;
for (const cid of E.courseOrder) {
  const c = E.courses[cid];
  console.log(`Curso ${cid}: ${Object.keys(c.templates).length} plantillas, ${c.lessonList.length} lecciones`);
  totalTemplates += Object.keys(c.templates).length;
  const used = {};
  for (const l of c.lessonList) for (const t of l.templates) {
    ok(c.templates[t], `lección ${l.id}`, `plantilla inexistente ${t}`);
    used[t] = (used[t] || 0) + 1;
  }
  for (const id of Object.keys(c.templates)) ok(used[id] === 1, `plantilla ${id}`, `aparece en ${used[id] || 0} lecciones (debe ser 1)`);
  for (const u of c.units) for (const t of u.diagnostic || []) ok(c.tplLesson[t] && c.tplLesson[t].unit === u, `diagnóstico ${u.id}`, `${t} no es de la unidad`);
  const ids = c.lessonList.map(l => l.id);
  ok(new Set(ids).size === ids.length, cid, "ids de lección repetidos");
  for (const l of c.lessonList) checkTex(`intro ${l.id}`, l.intro || "");

  for (const [id, t] of Object.entries(c.templates)) {
    if (ONLY && cid !== ONLY) continue;
    for (const k of t.concepts) ok(c.concepts[k], id, `concepto no definido: ${k}`);
    ok([1, 2, 3].includes(t.difficulty), id, "difficulty debe ser 1-3");
    const answers = new Set();
    // las plantillas con simulaciones caras pueden pedir menos instancias (testN)
    const Nt = Math.min(N, t.testN || N), t0 = Date.now();
    for (let s = 1; s <= Nt; s++) {
      const w = `${id}#${s}`;
      let inst;
      try { inst = E.instantiate(c, id, s * 2654435761 >>> 0); }
      catch (e) { fail(w, "excepción: " + e.message); continue; }
      ok(inst.type === t.type, w, `type ${inst.type} != ${t.type}`);
      checkTex(w + " prompt", inst.prompt);
      for (const x of inst.solution || []) checkTex(w + " solución", x);
      if (inst.explanation) checkTex(w + " explicación", inst.explanation);
      if (inst.fix) checkTex(w + " fix", inst.fix);
      switch (inst.type) {
        case "mc":
          ok(inst.options.length === 4, w, `${inst.options.length} opciones`);
          ok(new Set(inst.options).size === inst.options.length, w, `opciones repetidas: ${inst.options.join(" | ")}`);
          ok(inst.correct >= 0 && inst.correct < inst.options.length, w, "índice correcto inválido");
          inst.options.forEach(o => checkTex(w + " opción", o));
          answers.add(inst.prompt + inst.options[inst.correct]);
          break;
        case "numeric":
          ok(typeof inst.answer === "number" && isFinite(inst.answer), w, `respuesta no finita: ${inst.answer}`);
          if (inst.answerTex) {
            checkTex(w + " answerTex", "$" + inst.answerTex + "$");
            // si answerTex es una fracción o entero, debe coincidir con answer
            const m = /^(-?)\\frac\{(\d+)\}\{(\d+)\}$/.exec(inst.answerTex);
            if (m) ok(close((m[1] ? -1 : 1) * m[2] / m[3], inst.answer, 1e-9), w, `answerTex ${inst.answerTex} != ${inst.answer}`);
            if (/^-?\d+$/.test(inst.answerTex)) ok(+inst.answerTex === inst.answer, w, `answerTex ${inst.answerTex} != ${inst.answer}`);
          }
          answers.add(inst.prompt + "|" + inst.answer);
          break;
        case "tf":
          ok(typeof inst.answer === "boolean", w, "answer debe ser booleano");
          ok(!!inst.explanation, w, "V/F sin explicación");
          answers.add(inst.answer);
          break;
        case "order":
          ok(inst.steps.length >= 3, w, "pocos pasos");
          ok(new Set(inst.steps).size === inst.steps.length, w, "pasos repetidos");
          inst.steps.forEach(x => checkTex(w + " paso", x));
          answers.add(inst.steps.join());
          break;
        case "error":
          ok(inst.steps.length >= 3 && inst.wrongIndex >= 0 && inst.wrongIndex < inst.steps.length, w, "wrongIndex inválido");
          ok(inst.steps[inst.wrongIndex] !== inst.solution[inst.wrongIndex], w, "el paso marcado como error es igual al correcto");
          for (let i = 0; i < inst.wrongIndex; i++) ok(inst.steps[i] === inst.solution[i], w, `el paso ${i} antes del error difiere`);
          inst.steps.forEach(x => checkTex(w + " paso", x));
          answers.add(inst.steps.join());
          break;
        case "match": {
          ok(inst.pairs.length >= 3, w, "pocos pares");
          const L = inst.pairs.map(p => JSON.stringify(p[0].tex || "g")), R = inst.pairs.map(p => p[1].tex || null);
          ok(inst.pairs.every(p => p[0].tex || p[0].graph) && inst.pairs.every(p => p[1].tex || p[1].graph), w, "par vacío");
          if (inst.pairs[0][0].tex) ok(new Set(L).size === L.length, w, "lados izquierdos repetidos");
          if (R[0]) ok(new Set(R).size === R.length, w, "lados derechos repetidos");
          inst.pairs.forEach(p => { if (p[0].tex) checkTex(w, "$" + p[0].tex + "$"); if (p[1].tex) checkTex(w, "$" + p[1].tex + "$"); });
          answers.add(inst.pairs.map(p => p[0].tex || String(p[0].graph.fns ? p[0].graph.fns[0] : "")).join("|"));
          break;
        }
        default: fail(w, "tipo desconocido " + inst.type);
      }
      // verificación numérica independiente
      if (inst.verify) runVerify(inst.verify, inst.answer, w);
      else ok(LEGACY_NO_VERIFY.has(id), w, "plantilla nueva sin verify (toda plantilla nueva necesita verificación numérica)");
    }
    const ms = Date.now() - t0;
    if (ms > 8000) console.log(`  (lenta: ${id} tardó ${(ms / 1000).toFixed(1)} s con ${Nt} instancias; considerá testN)`);
    // variedad: una plantilla paramétrica no debería repetir siempre lo mismo
    // (con pocas instancias, por ejemplo en una corrida rápida, el chequeo no tiene sentido)
    if (Nt >= 10) ok(answers.size >= (t.type === "tf" ? 2 : 5), id, `poca variedad: ${answers.size} variantes distintas en ${N}`);
  }
}
ok(totalTemplates >= 30, "contenido", `solo ${totalTemplates} plantillas (meta: 30)`);

// ---------- 4. apuntes (teoría con hipervínculos) ----------
const linkIds = s => [...String(s).matchAll(/\[\[([a-z0-9-]+)(?:\|[^\]]+)?\]\]/g)].map(m => m[1]);
function checkTheoryText(where, s) {
  checkTex(where, s);
  for (const id of linkIds(s)) ok(E.cards[id], where, `link a ficha inexistente: [[${id}]]`);
  // un link no puede quedar adentro del LaTeX
  for (const m of texOf(s)) ok(!m.includes("[["), where, `link dentro de LaTeX: ${m.slice(0, 60)}`);
}
const allAliases = new Map();
for (const cid of E.courseOrder) {
  const c = E.courses[cid];
  if (!c.theory) { fail(cid, "el curso no tiene apuntes"); continue; }
  const cards = c.theory.cards, groups = c.units.map(u => u.id);
  console.log(`Apuntes ${cid}: ${Object.keys(cards).length} fichas`);
  for (const [id, card] of Object.entries(cards)) {
    const w = `ficha ${id}`;
    ok(groups.includes(card.group), w, `grupo desconocido ${card.group}`);
    ok(card.title && card.summary && card.def && card.def.length, w, "falta título, resumen o definición");
    for (const k of card.concepts || []) ok(c.concepts[k], w, `concepto inexistente ${k}`);
    for (const a of card.aliases || []) {
      const key = a.toLowerCase();
      ok(!allAliases.has(key), w, `alias "${a}" repetido (también en ${allAliases.get(key)})`);
      allAliases.set(key, id);
    }
    for (const sid of card.see || []) ok(E.cards[sid] && sid !== id, w, `"ver también" inválido: ${sid}`);
    checkTheoryText(w, card.summary);
    for (const sec of ["def", "idea", "demo", "tips"]) for (const b of card[sec] || []) {
      if (typeof b === "string") checkTheoryText(`${w} ${sec}`, b);
      else {
        if (b.caption) checkTheoryText(`${w} ${sec} caption`, b.caption);
        if (b.graph) for (const f of [...(b.graph.fns || []), ...(b.graph.pieces || []).map(p => p.f)]) ok(typeof f(0.5) === "number", w, "gráfico no evaluable");
        ok(b.graph || b.svg, w, "bloque sin contenido");
      }
    }
    for (const ex of card.examples || []) { checkTheoryText(`${w} ejemplo`, ex.q); ex.steps.forEach(st => checkTheoryText(`${w} ejemplo`, st)); }
  }
  // cobertura: cada concepto tiene al menos una ficha, y cada lección su lista de apuntes
  for (const k of Object.keys(c.concepts)) ok((c.conceptCards[k] || []).length > 0, `concepto ${k}`, "sin ficha de teoría");
  for (const l of c.lessonList) {
    ok(l.theory.length > 0, `lección ${l.id}`, "sin apuntes");
    for (const id of l.theory) ok(cards[id], `lección ${l.id}`, `ficha inexistente ${id}`);
    checkTheoryText(`intro ${l.id}`, l.intro || "");
  }
}
// ---------- 5. la carrera y la estructura de cada unidad ----------
{
  ok(!!E.career, "carrera", "no hay carrera registrada");
  const subs = E.career.years.flatMap(y => y.semesters.flatMap(sm => sm.subjects));
  const steps = subs.map(x => x.step);
  ok(new Set(steps).size === steps.length, "carrera", "pasos del trayecto repetidos");
  for (const cid of E.courseOrder) {
    const sub = subs.find(x => x.course === cid);
    ok(!!sub, cid, "materia sin lugar en la carrera");
    if (sub) ok(E.courses[cid].code === sub.code, cid, `código ${E.courses[cid].code} distinto del de la carrera (${sub.code})`);
    const c = E.courses[cid];
    for (const u of c.units.filter(u => u.lessons.length)) {
      const w = `${cid}/${u.id}`;
      const tpls = u.lessons.flatMap(l => l.templates);
      ok(tpls.length >= 4, w, `la unidad tiene ${tpls.length} plantillas (mínimo 4)`);
      ok(new Set(tpls.map(t => c.templates[t].type)).size >= 2, w, "la unidad usa un solo tipo de ejercicio");
      ok(Object.values(c.theory.cards).some(card => card.group === u.id), w, "la unidad no tiene apuntes");
      const diag = E.unitDiagnostic(c, u);
      ok(diag.length >= 2 && diag.every(t => tpls.includes(t)), w, "test de la unidad inválido: " + diag.join(","));
      ok(typeof u.order === "number" && !!u.program, w, "falta order o program (unidad del programa oficial)");
    }
  }
}
// el service worker tiene que precachear todos los archivos de contenido (si no, no andan offline)
{
  const sw = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
  for (const f of contentFiles) ok(sw.includes(`"${f}"`), "service-worker", `no precachea ${f}`);
}
// autolink: une términos conocidos, una vez por ficha, sin tocar LaTeX ni links existentes
{
  const html = E.linkText("Usamos la regla de la cadena y otra vez la Regla de la Cadena, por izquierda.", { auto: true });
  ok((html.match(/data-id="regla-cadena"/g) || []).length === 1, "linkText", "debe linkear la regla de la cadena una sola vez: " + html);
  ok(html.includes('data-id="limites-laterales"'), "linkText", "no linkeó 'por izquierda'");
  const ex = E.linkText("ver [[conjugado|el conjugado]] y el conjugado", { auto: true });
  ok((ex.match(/<a /g) || []).length === 1, "linkText", "link explícito + alias de la misma ficha duplicado: " + ex);
  ok(!E.linkText("encadenado", { auto: true }).includes("<a"), "linkText", "linkeó una palabra que solo contiene el alias");
  ok(!E.linkText("la cadena", { auto: false }).includes("<a"), "linkText", "autolink sin pedirlo");
}

// sincronización: combinar el progreso de dos dispositivos no pierde nada y no depende del orden
{
  const D = E.store.defaults;
  const a = Object.assign(D(), { xp: 120, answered: 30, answeredOk: 20, bestStreak: 3, streak: 2, lastActive: "2026-10-10",
    xpByDay: { "2026-10-09": 50, "2026-10-10": 70 }, read: { derivada: true }, activeCourse: "m101",
    srs: { "m101/limite": { ef: 2.5, int: 4, reps: 2, due: "2026-10-14", last: "2026-10-10", seen: 6, ok: 5 } },
    courses: { m101: { lessons: { l1: { done: true, plays: 2, best: 0.8 } }, diag: null, unitsOpen: { u1: true }, bosses: { u1: { won: true, wins: 2 } }, rush: 210 } },
    log: [{ d: "2026-10-10", kind: "lesson", title: "A", n: 5, ok: 4, xp: 40, c: "m101" }],
    exams: { "m101/p1": { best: 72, attempts: [{ d: "2026-10-10", t: 2, score: 72 }, { d: "2026-10-09", t: 1, score: 50 }] } }, daily: { "2026-10-10": { cid: "m101", tpl: "x", ok: true }, "2026-10-11": { cid: "m101", tpl: "y", ok: false } } });
  const b = Object.assign(D(), { xp: 90, answered: 25, answeredOk: 22, bestStreak: 5, streak: 1, lastActive: "2026-10-12",
    xpByDay: { "2026-10-10": 30, "2026-10-12": 60 }, read: { tfc: true }, activeCourse: "f101", settings: { goal: 100, sound: false, theme: "dark" },
    srs: { "m101/limite": { ef: 2.6, int: 6, reps: 3, due: "2026-10-18", last: "2026-10-12", seen: 9, ok: 8 }, "f101/f1-mruv": { ef: 2.5, int: 1, reps: 1, due: "2026-10-13", last: "2026-10-12", seen: 3, ok: 3 } },
    courses: { m101: { lessons: { l1: { done: false, plays: 1, best: 0.9 }, l2: { done: true, plays: 1, best: 1 } }, diag: null, bosses: { u1: { won: false, wins: 0 }, u2: { won: true, wins: 1 } }, rush: 140 }, f101: { lessons: {}, diag: null } },
    log: [{ d: "2026-10-12", kind: "lesson", title: "B", n: 5, ok: 5, xp: 50, c: "f101" }],
    exams: { "m101/p1": { best: 64, attempts: [{ d: "2026-10-12", t: 3, score: 64 }, { d: "2026-10-09", t: 1, score: 50 }] }, "m101/p2": { best: 80, attempts: [{ d: "2026-10-12", t: 4, score: 80 }] } }, daily: { "2026-10-11": { cid: "m101", tpl: "y", ok: true }, "2026-10-12": { cid: "f101", tpl: "z", ok: false } } });
  const m = E.store.merge(a, b), w = "store.merge";
  // comparación con las claves ordenadas (el orden de las claves no importa)
  const canon = x => JSON.stringify(x, (k, v) => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([p], [q]) => (p < q ? -1 : 1))) : v));
  ok(E.store.valid(m), w, "el resultado no es un estado válido");
  ok(m.xp === 120 && m.answered === 30 && m.answeredOk === 22 && m.bestStreak === 5, w, "acumulables: debe quedarse con el máximo");
  ok(m.lastActive === "2026-10-12" && m.streak === 1 && m.activeCourse === "f101" && m.settings.goal === 100, w, "estado: debe tomarse del dispositivo más reciente");
  ok(m.xpByDay["2026-10-09"] === 50 && m.xpByDay["2026-10-10"] === 70 && m.xpByDay["2026-10-12"] === 60, w, "XP por día: máximo por día");
  ok(m.read.derivada && m.read.tfc, w, "fichas leídas: unión");
  ok(m.srs["m101/limite"].seen === 9 && m.srs["f101/f1-mruv"], w, "tarjetas de repaso: la más practicada y todas las que haya");
  const l1 = m.courses.m101.lessons.l1;
  ok(l1.done && l1.plays === 2 && l1.best === 0.9 && m.courses.m101.lessons.l2.done && m.courses.f101 && m.courses.m101.unitsOpen.u1, w, "lecciones: hechas si lo están en alguno, con el mejor resultado");
  ok(m.log.length === 2 && m.log[0].title === "B", w, "historial: unión ordenada, la más nueva primero");
  ok(m.exams["m101/p1"].best === 72 && m.exams["m101/p1"].attempts.map(x => x.t).join() === "3,2,1" && m.exams["m101/p2"].best === 80, w, "evaluaciones: unión de intentos y la mejor nota");
  ok(m.courses.m101.bosses.u1.won && m.courses.m101.bosses.u1.wins === 2 && m.courses.m101.bosses.u2.won && m.courses.m101.rush === 210, w, "juegos: jefe vencido si lo está en alguno y el mejor récord");
  ok(m.daily["2026-10-10"].ok && m.daily["2026-10-11"].ok && m.daily["2026-10-12"].tpl === "z", w, "ejercicio del día: unión, resuelto si lo está en alguno");
  ok(canon(E.store.merge(m, m)) === canon(m), w, "no es idempotente");
  ok(canon(E.store.merge(m, a)) === canon(m) && canon(E.store.merge(b, m)) === canon(m), w, "volver a combinar con un estado viejo cambia el resultado");
  const ba = E.store.merge(b, a);
  ok(ba.xp === m.xp && ba.srs["m101/limite"].seen === 9 && ba.lastActive === m.lastActive && ba.log.length === 2, w, "el orden de los argumentos cambia el resultado");
  ok(a.xp === 120 && b.courses.m101.lessons.l1.done === false, w, "modificó sus argumentos");
}

// ejercicio del día: el mismo todo el día, de los más exigentes, nunca V/F
{
  const w = "E.dailyPick";
  const cands = [{ cid: "a", tpl: "t1", difficulty: 1, type: "mc" }, { cid: "a", tpl: "t2", difficulty: 2, type: "numeric" }, { cid: "a", tpl: "t3", difficulty: 3, type: "tf" },
    { cid: "a", tpl: "t4", difficulty: 3, type: "mc" }, { cid: "b", tpl: "t5", difficulty: 2, type: "order" }];
  const p1 = E.dailyPick(cands, "2026-10-15"), p2 = E.dailyPick(cands, "2026-10-15");
  ok(p1 && p1.tpl === p2.tpl && p1.seed === p2.seed, w, "no es el mismo en el mismo día");
  const days = Array.from({ length: 40 }, (_, i) => E.dailyPick(cands, E.addDays("2026-10-01", i)));
  ok(days.every(x => ["t2", "t4", "t5"].includes(x.tpl)), w, "eligió una plantilla fácil o de V/F");
  ok(new Set(days.map(x => x.tpl)).size === 3, w, "no varía entre días");
  const hard = cands.concat([{ cid: "b", tpl: "t6", difficulty: 3, type: "numeric" }, { cid: "b", tpl: "t7", difficulty: 3, type: "match" }]);
  ok(Array.from({ length: 30 }, (_, i) => E.dailyPick(hard, E.addDays("2026-10-01", i))).every(x => x.difficulty === 3), w, "con 3 o más difíciles, debe elegir entre ellas");
  ok(E.dailyPick([], "2026-10-15") === null, w, "sin lecciones hechas no hay ejercicio del día");
}

// pizarra (board.js): borrador, deshacer/rehacer y guardado, sin DOM
{
  vm.runInContext(fs.readFileSync(path.join(root, "board.js"), "utf8"), ctx, { filename: "board.js" });
  const B = E.board.T, w = "pizarra";
  const mk = (pts, wd = 4) => ({ c: "ink", w: wd, h: 0, p: pts.flatMap(([x, y]) => [x, y, 0.5]) });
  const pg = { s: [] };
  const a = mk([[0, 0], [100, 0]]), b = mk([[0, 50], [100, 50]]), c = mk([[200, 200]]);
  for (const s of [a, b, c]) B.doAct(pg, { a: "add", s });
  ok(B.hits(a, 50, 3, 2) && !B.hits(a, 50, 10, 2), w, "el borrador toca el trazo solo cerca de la línea");
  ok(B.hits(c, 203, 0 + 200, 2) && !B.hits(c, 210, 200, 2), w, "trazo de un solo punto");
  const act = B.eraseAt(pg, 50, 49, 3);
  ok(act && pg.s.length === 2 && pg.s[0] === a && pg.s[1] === c, w, "borró el trazo equivocado");
  pg._undo.push({ a: "seq", acts: [act] }); pg._redo = [];
  ok(B.undoAny(pg) && pg.s[1] === b && pg.s.length === 3, w, "deshacer el borrado no repone el trazo en su lugar");
  ok(B.redoAny(pg) && pg.s.length === 2 && !pg.s.includes(b), w, "rehacer el borrado");
  B.doAct(pg, { a: "clear", list: [...pg.s] });
  ok(pg.s.length === 0 && B.undoAny(pg) && pg.s.length === 2, w, "borrar la hoja y deshacer");
  ok(B.undoAny(pg) && pg.s.length === 3 && B.undoAny(pg) && pg.s.length === 2 && pg.s[1] === b && pg._redo.length === 3, w, "deshacer en cadena");
  const packed = B.packPage({ id: "x", t: 1, s: [Object.assign(mk([[1.234, 5.678]]), { _bb: {}, _path: {} })] });
  ok(JSON.stringify(packed.s[0]) === '{"c":"ink","w":4,"h":0,"p":[1.2,5.7,0.5]}', w, "guardado compacto: " + JSON.stringify(packed.s[0]));
  const bb = B.bbox(mk([[10, 20], [30, 5]], 4));
  ok(Math.abs(bb.x0 - (10 - 1.75)) < 1e-9 && Math.abs(bb.y1 - (20 + 1.75)) < 0.01, w, "caja del trazo con el grosor");
}

// plantillas propias de las evaluaciones: corrección automática, verify obligatorio y variedad
for (const [cid, ex] of Object.entries(E.exams || {})) {
  if (ONLY && cid !== ONLY) continue;
  const c = E.courses[cid];
  for (const [id, t] of Object.entries(ex.templates)) {
    const w0 = `${cid}/examen/${id}`, answers = new Set(), Nt = Math.min(N, t.testN || N);
    ok(!c.templates[id], w0, "el id choca con una plantilla de la materia");
    for (const k of t.concepts) ok(c.concepts[k], w0, `concepto no definido: ${k}`);
    for (let s = 1; s <= Nt; s++) {
      const w = `${w0}#${s}`;
      let inst;
      try { inst = E.instantiateExam(cid, id, s * 2654435761 >>> 0); } catch (e) { fail(w, "excepción: " + e.message); continue; }
      ok(inst.type === t.type, w, `type ${inst.type} != ${t.type}`);
      checkTex(w + " prompt", inst.prompt);
      for (const x of inst.solution || []) checkTex(w + " solución", x);
      if (inst.type === "numeric") { ok(Number.isFinite(inst.answer), w, `respuesta no finita: ${inst.answer}`); answers.add(inst.prompt + "|" + inst.answer); }
      else if (inst.type === "mc") { ok(inst.options.length === 4 && new Set(inst.options).size === 4, w, "opciones inválidas"); inst.options.forEach(o => checkTex(w, o)); answers.add(inst.prompt + inst.correct); }
      else if (inst.type === "tf") { ok(typeof inst.answer === "boolean" && !!inst.explanation, w, "V/F inválido"); answers.add(inst.prompt + inst.answer); }
      else fail(w, "tipo no soportado en plantillas de examen: " + inst.type);
      ok(!/undefined|NaN/.test(inst.prompt + (inst.solution || []).join("")), w, "texto con undefined o NaN");
      if (inst.verify) runVerify(inst.verify, inst.type === "mc" ? undefined : inst.answer, w);
      else fail(w, "plantilla de examen sin verify");
    }
    if (Nt >= 10) ok(answers.size >= (t.type === "tf" ? 2 : 5), w0, `poca variedad: ${answers.size} variantes`);
  }
}
// evaluaciones (parciales y finales simulados): puntajes, plantillas y ejercicios de desarrollo
for (const [cid, ex] of Object.entries(E.exams || {})) {
  const c = E.courses[cid];
  ok(!!c, "examenes", `materia inexistente: ${cid}`);
  if (!c) continue;
  for (const x of ex.list) {
    const w = `${cid}/examen/${x.id}`;
    // con ítems alternativos, todas las alternativas tienen que valer lo mismo
    const itemPts = it => it.parts.reduce((t, p) => t + p.pts, 0);
    for (const it of x.items) if (it.any) ok(it.any.every(a => itemPts(a) === itemPts(it.any[0])), w, `alternativas de "${it.any[0].title}" con distinto puntaje`);
    const items = x.items.map(it => (it.any ? it.any[0] : it)), parts = x.items.flatMap(it => (it.any ? it.any.flatMap(a => a.parts) : it.parts));
    ok(items.reduce((t, it) => t + itemPts(it), 0) === 100, w, "los puntajes no suman 100");
    ok(x.minutes > 0 && x.pass > 0 && x.pass <= 100 && !!x.title && !!x.topics, w, "faltan minutos, aprobación, título o temas");
    for (const p0 of parts) {
      ok(p0.pts > 0, w, "parte con puntaje no positivo");
      for (const p of p0.any || [p0]) {
        const tpls = p.tpl ? [p.tpl] : p.pick || [];
        ok(tpls.length > 0 || !!p.self, w, "parte sin plantilla ni ejercicio de desarrollo");
        for (const t of tpls) ok(!!E.examTemplate(cid, t), w, `plantilla inexistente: ${t}`);
        if (p.self) ok(!!ex.self[p.self], w, `ejercicio de desarrollo inexistente: ${p.self}`);
      }
    }
    for (let k = 0; k < Math.min(N, 40); k++) {
      const b = E.buildExam(cid, x.id, 1000 + k);
      for (const p of b.parts) {
        if (!p.self) { E.instantiateExam(cid, p.tpl, p.seed); continue; }
        const o = E.instantiateSelf(cid, p.self, p.seed, p.args), ws = `${w}/${p.self}`;
        ok(typeof o.prompt === "string" && o.prompt.length > 10 && Array.isArray(o.solution) && o.solution.length > 0, ws, "falta enunciado o resolución");
        ok(Array.isArray(o.rubric) && o.rubric.length > 0 && o.rubric.every(q => q.w > 0 && q.text), ws, "rúbrica inválida");
        const pts = E.rubricPoints(o.rubric, p.pts);
        ok(Math.abs(pts.reduce((t, v) => t + v, 0) - p.pts) < 1e-9 && pts.every(v => v >= 0), ws, "la rúbrica no reparte bien los puntos: " + pts.join(","));
        for (const str of [o.prompt, ...o.solution, ...o.rubric.map(q => q.text)]) checkTex(ws, str);
        ok(!/undefined|NaN/.test(o.prompt + o.solution.join("") + o.rubric.map(q => q.text).join("")), ws, "texto con undefined o NaN");
        // los ejercicios de desarrollo con cuentas también se verifican por otro camino
        if (o.verify) runVerify(o.verify, undefined, ws);
      }
    }
  }
}

console.log(`\n${checks} chequeos, ${failures} fallas`);
process.exit(failures ? 1 : 0);
