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
  // signos dobles o restos de JS en el texto
  if (/\+ -|- -|undefined|NaN|\[object/.test(s)) fail(where, `texto sospechoso: ${s.slice(0, 140)}`);
}
const numDeriv = (f, x, h = 1e-5) => (f(x + h) - f(x - h)) / (2 * h);
const numDeriv2 = (f, x, h = 1e-4) => (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
const close = (a, b, tol = 1e-4) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

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
    for (const k of t.concepts) ok(c.concepts[k], id, `concepto no definido: ${k}`);
    ok([1, 2, 3].includes(t.difficulty), id, "difficulty debe ser 1-3");
    const answers = new Set();
    for (let s = 1; s <= N; s++) {
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
          answers.add(inst.answer);
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
      const v = inst.verify;
      if (v) {
        const target = inst.answer;
        if (v.kind === "limit") {
          const h = v.h || 1e-6;
          const vals = v.side === "-" ? [v.f(v.a - h)] : v.side === "+" ? [v.f(v.a + h)] : [v.f(v.a - h), v.f(v.a + h)];
          for (const y of vals) ok(close(y, target, 1e-3), w, `límite numérico ${y} vs ${target}`);
        } else if (v.kind === "liminf") {
          ok(close(v.f(1e7), target, 1e-4), w, `límite al infinito ${v.f(1e7)} vs ${target}`);
        } else if (v.kind === "limsign") {
          const y = v.f(v.a + (v.side === "+" ? 1e-7 : -1e-7));
          ok(Math.sign(y) === v.sign && Math.abs(y) > 1e5, w, "signo del límite infinito");
        } else if (v.kind === "deriv") {
          ok(close(numDeriv(v.f, v.x0), target, 1e-4), w, `f'(${v.x0}) numérica ${numDeriv(v.f, v.x0)} vs ${target}`);
        } else if (v.kind === "deriv2") {
          ok(close(numDeriv2(v.f, v.x0), target, 1e-3), w, `f''(${v.x0}) numérica ${numDeriv2(v.f, v.x0)} vs ${target}`);
        } else if (v.kind === "deriv-fn") {
          const [lo, hi] = v.dom || [-2, 2];
          for (let i = 0; i < 5; i++) {
            const x = lo + (hi - lo) * (i + 0.37) / 5;
            ok(close(numDeriv(v.f, x), v.df(x), 1e-4), w, `f' en x=${x}: ${numDeriv(v.f, x)} vs ${v.df(x)}`);
          }
        } else if (v.kind === "implicit") {
          ok(Math.abs(v.F(v.p, v.q)) < 1e-9, w, "el punto no está en la curva");
          const h = 1e-6;
          const Fx = (v.F(v.p + h, v.q) - v.F(v.p - h, v.q)) / (2 * h), Fy = (v.F(v.p, v.q + h) - v.F(v.p, v.q - h)) / (2 * h);
          ok(close(-Fx / Fy, target, 1e-5), w, `implícita ${-Fx / Fy} vs ${target}`);
        }
      }
    }
    // variedad: una plantilla paramétrica no debería repetir siempre lo mismo
    ok(answers.size >= (t.type === "tf" ? 2 : 5), id, `poca variedad: ${answers.size} variantes distintas en ${N}`);
  }
}
ok(totalTemplates >= 30, "contenido", `solo ${totalTemplates} plantillas (meta: 30)`);

console.log(`\n${checks} chequeos, ${failures} fallas`);
process.exit(failures ? 1 : 0);
