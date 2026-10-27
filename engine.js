// Motor de efecen: RNG, helpers de LaTeX, parser, repaso espaciado, registro de materias y estado.
// Lo carga index.html antes del contenido, y los tests lo ejecutan en un vm de Node.
(function (root) {
  "use strict";
  const E = root.Efecen = { version: "0.1.0", courses: {}, courseOrder: [] };

  // ---------- RNG con semilla (mulberry32) ----------
  E.rng = function (seed) {
    let a = seed >>> 0;
    const next = () => {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const r = {
      seed, next,
      int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
      nz: (lo, hi) => { let v; do v = r.int(lo, hi); while (v === 0); return v; },
      pick: arr => arr[Math.floor(next() * arr.length)],
      bool: (p = 0.5) => next() < p,
      sign: () => (next() < 0.5 ? -1 : 1),
      shuffle: arr => { const a2 = arr.slice(); for (let i = a2.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a2[i], a2[j]] = [a2[j], a2[i]]; } return a2; },
      sample: (arr, n) => r.shuffle(arr).slice(0, n),
      distinct: (n, lo, hi, opts = {}) => {
        const out = [];
        let guard = 0;
        while (out.length < n && guard++ < 1000) {
          const v = r.int(lo, hi);
          if (opts.nonzero && v === 0) continue;
          if (opts.exclude && opts.exclude.includes(v)) continue;
          if (!out.includes(v)) out.push(v);
        }
        return out;
      }
    };
    return r;
  };
  E.newSeed = () => (Math.random() * 4294967296) >>> 0;

  // ---------- Helpers para escribir LaTeX ----------
  // métodos del lápiz `g` de las figuras interactivas (bloques `viz` de los apuntes; los dibuja la UI)
  E.VIZ_API = ["grid", "axes", "fn", "curve", "line", "arrow", "dot", "circle", "rect", "poly", "text", "px"];
  const H = E.H = {};
  H.gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  // fracción reducida en LaTeX
  H.frac = (p, q) => {
    if (q === 0) return "\\text{indef.}";
    if (q < 0) { p = -p; q = -q; }
    const g = H.gcd(p, q); p /= g; q /= g;
    if (q === 1) return String(p);
    return (p < 0 ? "-" : "") + `\\frac{${Math.abs(p)}}{${q}}`;
  };
  // número "lindo": entero si lo es, si no hasta d decimales
  H.num = (x, d = 3) => {
    if (!isFinite(x)) return x > 0 ? "\\infty" : "-\\infty";
    const r = Math.round(x);
    if (Math.abs(x - r) < 1e-9) return String(r === 0 ? 0 : r);
    const s = String(+x.toFixed(d));
    return s === "-0" ? "0" : s;
  };
  H.m = s => `$\\displaystyle ${s}$`;
  H.xp = (n, v = "x") => (n === 0 ? "" : n === 1 ? v : `${v}^{${n}}`);
  // término con signo: term(-3,"x^{2}",false) -> " - 3x^{2}"
  H.term = (c, mono, first) => {
    if (c === 0) return "";
    const sign = c < 0 ? "-" : first ? "" : "+";
    const a = Math.abs(c);
    const body = mono ? (a === 1 ? mono : a + mono) : String(a);
    return first ? sign + body : ` ${sign} ${body}`;
  };
  // poly([[3,"x^{2}"],[-1,"x"],[5,""]]) -> "3x^{2} - x + 5"
  H.poly = terms => {
    let out = "", first = true;
    for (const [c, mono] of terms) {
      if (c === 0) continue;
      out += H.term(c, mono, first);
      first = false;
    }
    return out || "0";
  };
  // coeficientes de mayor a menor grado
  H.polyc = (coeffs, v = "x") => H.poly(coeffs.map((c, i) => [c, H.xp(coeffs.length - 1 - i, v)]));
  H.peval = (coeffs, x) => coeffs.reduce((acc, c) => acc * x + c, 0);
  // sustitución visible: psub([6,-4,1], 2) -> "6\cdot 2^{2} - 4\cdot 2 + 1"
  H.psub = (coeffs, v) => {
    const deg = coeffs.length - 1, pv = v < 0 ? `(${v})` : String(v);
    let out = "", first = true;
    coeffs.forEach((c, i) => {
      const k = deg - i;
      if (c === 0) return;
      const a = Math.abs(c), sign = c < 0 ? "-" : first ? "" : "+";
      const body = k === 0 ? String(a) : (a === 1 ? "" : a + "\\cdot ") + pv + (k > 1 ? `^{${k}}` : "");
      out += first ? sign + body : ` ${sign} ${body}`;
      first = false;
    });
    return out || "0";
  };
  // "x - 3", "x + 2", "x"
  H.xm = (r, v = "x") => (r === 0 ? v : r > 0 ? `${v} - ${r}` : `${v} + ${-r}`);
  // coeficiente delante de un paréntesis: 1 -> "", -1 -> "-"
  H.cf = c => (c === 1 ? "" : c === -1 ? "-" : String(c));
  H.kx = (k, v = "x") => (k === 1 ? v : k === -1 ? "-" + v : k + v);
  // número entre paréntesis si es negativo (para sustituciones)
  H.par = v => (typeof v === "number" && v < 0 ? `(${H.num(v)})` : typeof v === "number" ? H.num(v) : v);
  // " + 3" / " - 3"
  H.sg = v => (v < 0 ? ` - ${H.num(-v)}` : ` + ${H.num(v)}`);
  H.angles = [
    { v: Math.PI / 6, t: "\\frac{\\pi}{6}" }, { v: Math.PI / 4, t: "\\frac{\\pi}{4}" },
    { v: Math.PI / 3, t: "\\frac{\\pi}{3}" }, { v: Math.PI / 2, t: "\\frac{\\pi}{2}" }
  ];
  // para las respuestas de tipo expr: una suma de términos { p, q, m, t } (coeficiente p/q, monomio para el parser m
  // y en TeX t) → [texto para el parser, TeX], con signos, fracciones y coeficientes 1 resueltos
  H.terms = terms => {
    let P = "", X = "";
    terms.filter(o => o.p !== 0).forEach((o, i) => {
      let p = o.p, q = o.q || 1;
      if (q < 0) { p = -p; q = -q; }
      const g = H.gcd(p, q), a = Math.abs(p / g), d = q / g, neg = p < 0;
      const cp = d === 1 ? (a === 1 && o.m ? "" : String(a)) : `(${a}/${d})`;
      const ct = d === 1 ? (a === 1 && o.t ? "" : String(a)) : `\\frac{${a}}{${d}}`;
      const sg = neg ? (i ? " - " : "-") : i ? " + " : "";
      P += sg + (o.m ? (cp ? `${cp}*${o.m}` : o.m) : cp);
      X += sg + ct + (o.t || "");
    });
    return [P || "0", X || "0"];
  };
  // potencia de una variable como monomio de H.terms: pw(0) = 1, pw(1, "t") = t, pw(3) = x³
  H.pw = (e, v = "x") => (e === 0 ? { m: "", t: "" } : e === 1 ? { m: v, t: v } : { m: `${v}^${e}`, t: `${v}^{${e}}` });
  // armar opción múltiple: dedup + completar con fallbacks + mezclar
  H.mc = (r, correct, distractors, opts = {}) => {
    const seen = new Set([correct]);
    const ds = [];
    for (const d of [...distractors, ...(opts.fallback || [])]) {
      if (ds.length >= (opts.n || 4) - 1) break;
      if (d != null && !seen.has(d)) { seen.add(d); ds.push(d); }
    }
    const raw = opts.keepOrder ? [correct, ...ds] : r.shuffle([correct, ...ds]);
    const options = opts.text ? raw : raw.map(H.m);
    return { options, correct: raw.indexOf(correct) };
  };

  // ---------- Parser de expresiones (sin eval) ----------
  // E.parseExpr(src, vars) devuelve un árbol, o null si no se entiende. Sirve para las respuestas numéricas (sin
  // variables, ver E.parseNum) y para las de tipo `expr`, donde se escribe una función: 3x^2 - 2sen(x), e^(2t)…
  // Acepta multiplicación implícita (2x, (x+1)(x-1)), sen o sin, tg o tan, arcsen…, |x|, raiz o √, ² y ³, y
  // potencias de funciones: sen^2 x y sen(x)^2 son (sen x)², pero sen x^2 es sen(x²). Sin paréntesis, el argumento
  // de una función se lleva los números y variables que le siguen: sen 2x es sen(2x), y sen x cos x es sen(x)·cos(x).
  // Nodos: ["n", v], ["c", "pi" | "e"], ["v", nombre], ["neg", a], ["+" | "-" | "/" | "^", a, b],
  // ["*", a, b, implícita], ["f", nombre, a] (una función de FN) y ["abs", a].
  const FN = {
    sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan,
    asin: Math.asin, acos: Math.acos, atan: Math.atan, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
    sec: x => 1 / Math.cos(x), csc: x => 1 / Math.sin(x), cot: x => 1 / Math.tan(x)
  };
  // lo que se puede escribir → función o constante
  const ALIAS = {
    sqrt: "sqrt", raiz: "sqrt", exp: "exp", ln: "ln", log: "log", sin: "sin", sen: "sin", cos: "cos", tan: "tan", tg: "tan",
    arcsin: "asin", arcsen: "asin", asin: "asin", arccos: "acos", acos: "acos", arctan: "atan", arctg: "atan", atan: "atan",
    sinh: "sinh", senh: "sinh", cosh: "cosh", tanh: "tanh", tgh: "tanh", sec: "sec", csc: "csc", cosec: "csc", cot: "cot", cotg: "cot",
    pi: "pi", e: "e"
  };
  const NAMES = Object.keys(ALIAS).sort((a, b) => b.length - a.length);
  E.parseExpr = function (src, vars = []) {
    if (src == null) return null;
    const VS = vars.map(v => v.toLowerCase()).sort((a, b) => b.length - a.length);
    let s = String(src).trim();
    // notación científica: 1,3E-5, 1,3e7 (e pegada a un dígito y seguida de dígitos) y 1,3 x 10^7; «2e» sola sigue siendo 2·e
    if (!VS.includes("x")) s = s.replace(/(\d)\s*[xX]\s*10\s*\^/g, "$1*10^");
    s = s.replace(/(\d)E([+-]?\d+)/g, "$1*10^($2)").replace(/(\d)e(\d+)/g, "$1*10^($2)").toLowerCase()
      .replace(/,/g, ".").replace(/π/g, "pi").replace(/√/g, "sqrt").replace(/²/g, "^2").replace(/³/g, "^3")
      .replace(/[·×]/g, "*").replace(/[−–]/g, "-").replace(/\s+/g, "");
    if (!s) return null;
    const open = (s.match(/\(/g) || []).length - (s.match(/\)/g) || []).length;
    if (open > 0) s += ")".repeat(open);
    const toks = [];
    for (let i = 0; i < s.length;) {
      const num = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));
      if (num) { toks.push({ t: "n", v: parseFloat(num[1]) }); i += num[1].length; continue; }
      if ("+-*/^()|".includes(s[i])) { toks.push({ t: s[i] }); i++; continue; }
      const name = NAMES.find(n => s.startsWith(n, i));
      if (name) { toks.push({ t: "id", v: ALIAS[name] }); i += name.length; continue; }
      const vn = VS.find(v => s.startsWith(v, i));
      if (vn) { toks.push({ t: "v", v: vn }); i += vn.length; continue; }
      return null;
    }
    let k = 0, bars = 0;
    const peek = () => toks[k];
    const eat = t => (toks[k] && toks[k].t === t ? (k++, true) : false);
    const startsFactor = p => p && (p.t === "n" || p.t === "id" || p.t === "v" || p.t === "(" || (p.t === "|" && !bars));
    const expr = () => { let a = term(); for (;;) { if (eat("+")) a = ["+", a, term()]; else if (eat("-")) a = ["-", a, term()]; else return a; } };
    const term = () => {
      let a = unary();
      for (;;) {
        if (eat("*")) a = ["*", a, unary()];
        else if (eat("/")) a = ["/", a, unary()];
        else if (startsFactor(peek())) a = ["*", a, power(), 1];
        else return a;
      }
    };
    const unary = () => (eat("-") ? ["neg", unary()] : eat("+") ? unary() : power());
    const power = () => { const b = atom(); return eat("^") ? ["^", b, unary()] : b; };
    const atom = () => {
      const p = toks[k++];
      if (!p) throw 0;
      if (p.t === "n") return ["n", p.v];
      if (p.t === "v") return ["v", p.v];
      if (p.t === "(") { const a = expr(); if (!eat(")")) throw 0; return a; }
      if (p.t === "|") { bars++; const a = expr(); bars--; if (!eat("|")) throw 0; return ["abs", a]; }
      if (p.t === "id") {
        if (p.v === "pi" || p.v === "e") return ["c", p.v];
        const ex = eat("^") ? atom() : null;
        let arg;
        if (peek() && peek().t === "(") arg = atom();
        else { arg = power(); while (peek() && (peek().t === "n" || peek().t === "v")) arg = ["*", arg, power(), 1]; }
        return ex ? ["^", ["f", p.v, arg], ex] : ["f", p.v, arg];
      }
      throw 0;
    };
    try { const a = expr(); return k === toks.length ? a : null; } catch (e) { return null; }
  };
  E.evalExpr = function ev(a, env) {
    switch (a[0]) {
      case "n": return a[1];
      case "c": return a[1] === "pi" ? Math.PI : Math.E;
      case "v": return env[a[1]];
      case "neg": return -ev(a[1], env);
      case "+": return ev(a[1], env) + ev(a[2], env);
      case "-": return ev(a[1], env) - ev(a[2], env);
      case "*": return ev(a[1], env) * ev(a[2], env);
      case "/": return ev(a[1], env) / ev(a[2], env);
      case "^": return Math.pow(ev(a[1], env), ev(a[2], env));
      case "f": return FN[a[1]](ev(a[2], env));
      case "abs": return Math.abs(ev(a[1], env));
    }
    return NaN;
  };
  E.parseNum = function (src) {
    const a = E.parseExpr(src);
    return a ? E.evalExpr(a, {}) : NaN;
  };
  // la expresión como función de sus variables, en el orden de `vars` (o null si no se entiende)
  E.exprFn = function (src, vars) {
    const a = E.parseExpr(src, vars);
    if (!a) return null;
    const names = vars.map(v => v.toLowerCase());
    return (...xs) => { const env = {}; names.forEach((v, i) => { env[v] = xs[i]; }); return E.evalExpr(a, env); };
  };
  // el árbol en TeX, para la vista previa: así se ve si «e^2x» quedó como e²·x o como e^(2x)
  const TEXF = { ln: "\\ln", log: "\\log", sin: "\\sin", cos: "\\cos", tan: "\\tan", asin: "\\arcsin", acos: "\\arccos", atan: "\\arctan",
    sinh: "\\sinh", cosh: "\\cosh", tanh: "\\tanh", sec: "\\sec", csc: "\\csc", cot: "\\cot" };
  const numTex = v => {
    if (!isFinite(v)) return "\\infty";
    const s = String(+v.toPrecision(12)), m = /^([\d.]+)e([+-]\d+)$/.exec(s);
    return m ? `${m[1].replace(".", "{,}")} \\times 10^{${+m[2]}}` : s.replace(".", "{,}");
  };
  // si el primer factor de un producto es negativo, el producto sin ese signo (para escribirlo adelante)
  const leadNeg = a => {
    if (a[0] === "neg") return a[1];
    if (a[0] !== "*") return null;
    const s = leadNeg(a[1]);
    return s ? ["*", s, a[2], a[3]] : null;
  };
  // prec: 0 suelto, 0.5 a la derecha de una resta, 1 factor de un producto, 2 base de una potencia
  E.exprTex = function tx(a, prec = 0) {
    const P = (s, need) => (need ? `\\left(${s}\\right)` : s);
    switch (a[0]) {
      case "n": return numTex(a[1]);
      case "c": return a[1] === "pi" ? "\\pi" : "e";
      case "v": return a[1];
      case "neg": return P("-" + tx(a[1], 1), prec >= 0.5);
      case "+": case "-": return P(`${tx(a[1], 0)} ${a[0]} ${tx(a[2], 0.5)}`, prec >= 0.5);
      case "*": {
        // -2·x se escribe −2x (el signo afuera), 1·x es x, y el punto va solo si lo que sigue empieza con un número
        const pos = leadNeg(a);
        if (pos) return P("-" + tx(pos, 1), prec >= 0.5);
        const l = tx(a[1], 1), r = tx(a[2], 1);
        if (l === "1") return P(r, prec >= 2);
        return P(/^[\d-]/.test(r) ? `${l} \\cdot ${r}` : `${l} ${r}`, prec >= 2);
      }
      case "/": return P(`\\frac{${tx(a[1], 0)}}{${tx(a[2], 0)}}`, prec >= 2);
      case "^": {
        const b = a[1];
        if (b[0] === "f" && TEXF[b[1]]) return P(`${TEXF[b[1]]}^{${tx(a[2], 0)}}\\left(${tx(b[2], 0)}\\right)`, prec >= 2);
        return P(`{${tx(b, 2)}}^{${tx(a[2], 0)}}`, prec >= 2);
      }
      case "f": {
        const arg = tx(a[2], 0);
        if (a[1] === "sqrt") return `\\sqrt{${arg}}`;
        if (a[1] === "exp") return P(`e^{${arg}}`, prec >= 2);
        return P(`${TEXF[a[1]]}\\left(${arg}\\right)`, prec >= 2);
      }
      case "abs": return `\\left|${tx(a[1], 0)}\\right|`;
    }
    return "";
  };
  // ¿la respuesta numérica es correcta? tolerancia relativa, o redondeo a 2 decimales
  E.checkNumeric = function (user, answer, tol = 0.01) {
    if (!isFinite(user)) return false;
    const diff = Math.abs(user - answer);
    if (diff <= tol * Math.abs(answer) + 1e-9) return true;
    // el redondeo a 2 decimales solo para respuestas no muy chicas (con 1,8·10⁻⁵ no tiene que valer un 0)
    if (Math.abs(answer) >= 0.1 && Math.abs(user - Math.round(answer * 100) / 100) < 1e-9) return true;
    return Math.abs(answer) < 1e-9 && Math.abs(user) < 1e-6;
  };

  // ---------- respuestas de tipo `expr` (se escribe una función) ----------
  // inst: { answer: "2x cos(x^2)" (con la sintaxis del parser), answerTex, vars: ["x"], domain: [[lo, hi], …],
  // constant?: true si alcanza con acertar salvo una constante (primitivas), lhs?: TeX que va antes, «f'(x) =» }.
  // Se comparan las dos funciones en puntos fijos del dominio (siempre los mismos para una plantilla).
  function exprSamples(src, inst) {
    const vars = inst.vars || ["x"], f = E.exprFn(src, vars), g = E.exprFn(inst.answer, vars);
    if (!f || !g) return null;
    const dom = inst.domain || vars.map(() => [-2, 2]), r = E.rng(9973), out = [];
    for (let i = 0; i < 200 && out.length < 12; i++) {
      const p = dom.map(([lo, hi]) => lo + (hi - lo) * r.next()), b = g(...p);
      if (Number.isFinite(b)) out.push([f(...p), b]);
    }
    return out.length >= 6 && out.every(([a]) => Number.isFinite(a)) ? out : null;
  }
  // ¿los valores son todos iguales? (con una tolerancia relativa a `scale`)
  const allSame = (xs, tol, scale) => xs.every(x => Math.abs(x - xs[0]) <= tol * scale);
  E.checkExpr = function (src, inst) {
    const sm = exprSamples(src, inst), tol = inst.tolerance ?? 2e-3;
    if (!sm) return false;
    const scale = Math.max(1e-9, ...sm.map(([, b]) => Math.abs(b)));
    if (inst.constant) return allSame(sm.map(([a, b]) => a - b), tol, Math.max(1, scale));
    return sm.every(([a, b]) => Math.abs(a - b) <= tol * Math.max(Math.abs(b), 0.1 * scale));
  };

  // ---------- errores típicos ----------
  // E.diagnose(inst, raw) mira una respuesta incorrecta (lo que escribió o eligió la persona) y devuelve una pista, o null.
  // Primero van las trampas de la plantilla, inst.traps: [{ value, msg }] en las numéricas, [{ expr, msg }] en las de
  // expresión y [{ option, msg }] en las de opción múltiple. Después, errores generales que valen para cualquier
  // ejercicio: el signo, un factor 2, g, grados y radianes, potencias de 10, la inversa, una raíz o el redondeo.
  const isNear = (u, v, tol) => Math.abs(u - v) <= tol * Math.abs(v);
  const G_RE = /9[.,]8|9\{,\}8/;
  function numHint(u, A, tol, inst) {
    if (!A || !u || !Number.isFinite(A)) return null;
    if (isNear(u, -A, tol)) return "El valor está bien, pero el signo no: revisá qué sentido tomaste como positivo o el signo de algún término.";
    if (isNear(u, 2 * A, tol)) return "Te dio el doble: fijate si te sobra un factor 2 (un ½ que se perdió, un diámetro en lugar de un radio, ida y vuelta…).";
    if (isNear(u, A / 2, tol)) return "Te dio la mitad: fijate si te falta un factor 2 (un ½ de más, un radio en lugar de un diámetro, ida y vuelta…).";
    if (G_RE.test(inst.prompt || "") && (isNear(u, A * 9.8, tol) || isNear(u, A / 9.8, tol))) return "Te difiere en un factor $g = 9{,}8$: revisá si confundiste masa con peso ($m$ con $mg$) o si se te coló una $g$ de más.";
    if (isNear(u, A * 180 / Math.PI, tol) || isNear(u, A * Math.PI / 180, tol)) return "Parece una mezcla de grados y radianes: revisá en qué unidad está el ángulo y cómo está configurada la calculadora.";
    if (Math.abs(A) !== 1 && isNear(u, 1 / A, tol)) return "Te dio la inversa: ¿invertiste un cociente? (período y frecuencia, $R$ y $1/R$, numerador y denominador…)";
    if (A > 0 && A !== 1 && isNear(u, A * A, tol)) return "Te dio el cuadrado de la respuesta: ¿te faltó sacar una raíz?";
    if (A > 0 && A !== 1 && u > 0 && isNear(u * u, A, 2 * tol)) return "Te dio la raíz cuadrada de la respuesta: ¿sacaste una raíz de más o te faltó elevar al cuadrado?";
    const L = Math.log10(Math.abs(u / A)), k = Math.round(L);
    if (k && Math.abs(k) <= 12 && Math.sign(u) === Math.sign(A) && Math.abs(L - k) < Math.log10(1 + tol))
      return `El número está bien, pero corrido en un factor $10^{${k}}$: revisá las unidades y los prefijos (cm y m, g y kg, µ, m, k, M…) y dónde quedó la coma.`;
    if (isNear(u, A, 0.05)) return "Estás muy cerca: seguramente redondeaste en un paso intermedio. Arrastrá más decimales y redondeá recién al final.";
    return null;
  }
  function exprHint(src, inst) {
    const sm = exprSamples(src, inst);
    if (!sm) return null;
    const scale = Math.max(...sm.map(([, b]) => Math.abs(b)));
    if (scale < 1e-9) return null;
    const ratio = sm.filter(([, b]) => Math.abs(b) > 0.05 * scale).map(([a, b]) => a / b);
    if (ratio.length >= 4 && allSame(ratio, 1e-3, Math.max(1, Math.abs(ratio[0])))) {
      const c = ratio[0];
      if (Math.abs(c + 1) < 1e-3) return "Te quedó con el signo cambiado: revisá los signos (por ejemplo, la derivada del coseno o un menos que sale afuera).";
      if (Math.abs(c - 2) < 2e-3) return "Está bien salvo por un factor 2 de más: revisá las constantes que salen afuera.";
      if (Math.abs(c - 0.5) < 1e-3) return "Está bien salvo por un factor 2 de menos: revisá las constantes que salen afuera.";
      if (Math.abs(c) > 1e-6) return `Está bien salvo por un factor constante (te da $${numTex(+c.toPrecision(3))}$ veces la respuesta): revisá las constantes que salen afuera, como la derivada de lo de adentro en la regla de la cadena.`;
    }
    if (!inst.constant && allSame(sm.map(([a, b]) => a - b), 1e-3, Math.max(1, scale)))
      return "Te difiere solo en una constante: revisá los términos que no dependen de la variable.";
    return null;
  }
  E.diagnose = function (inst, raw) {
    const traps = inst.traps || [];
    if (inst.type === "mc") { const t = traps.find(x => x.option === inst.options[raw]); return t ? t.msg : null; }
    if (inst.type === "expr") {
      const t = traps.find(x => E.checkExpr(raw, Object.assign({}, inst, { answer: x.expr })));
      return t ? t.msg : exprHint(raw, inst);
    }
    if (inst.type !== "numeric") return null;
    const u = E.parseNum(raw), tol = Math.max(inst.tolerance ?? 0.01, 1e-4);
    if (!Number.isFinite(u)) return null;
    const t = traps.find(x => E.checkNumeric(u, x.value, tol));
    return t ? t.msg : numHint(u, inst.answer, tol, inst);
  };

  // ---------- ejercicios paso a paso (type: "multi") ----------
  // inst.parts: [{ q, type: "numeric" | "expr" | "mc", …los campos de ese tipo, verify }]. Se responde de a una parte;
  // si una sale mal, se muestra la correcta y se sigue con la próxima, así los pasos siguientes se practican igual.
  // E.subInst arma la instancia de una parte, para corregirla y mostrarla como cualquier otra.
  E.subInst = (inst, k) => Object.assign({ solution: [] }, inst.parts[k], { prompt: inst.parts[k].q });

  // ejercicios que se suman a lecciones que ya existen (los de expresión y paso a paso, por ejemplo), desde
  // un archivo aparte: E.addPractice(cid, { concepts, templates, lessons: { idLección: [idPlantilla, …] } })
  E.addPractice = function (cid, ext) {
    const c = E.courses[cid];
    if (!c) throw new Error("Materia no registrada: " + cid);
    Object.assign(c.concepts, ext.concepts || {});
    Object.assign(c.templates, ext.templates || {});
    for (const [lid, ids] of Object.entries(ext.lessons || {})) {
      const l = c.lessonList.find(x => x.id === lid);
      if (!l) throw new Error(`Lección inexistente en ${cid}: ${lid}`);
      for (const id of ids) if (!l.templates.includes(id)) l.templates.push(id);
    }
    indexCourse(c);
  };

  // ---------- Fechas (siempre en hora local) ----------
  const pad = n => String(n).padStart(2, "0");
  E.fmtDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  E.today = () => E.fmtDate(new Date());
  // la meta diaria es fija para todos (como en la liga compiten todos con las mismas reglas)
  E.DAILY_GOAL = 50;
  // liga semanal: la semana va de lunes a domingo; se identifica por la fecha de su lunes
  E.weekStart = str => { const [y, m, d] = str.split("-").map(Number), wd = (new Date(y, m - 1, d).getDay() + 6) % 7; return E.addDays(str, -wd); };
  E.weekXp = (s, date) => { const w = E.weekStart(date); let t = 0; for (let i = 0; i < 7; i++) t += s.xpByDay[E.addDays(w, i)] || 0; return t; };
  // nombre que se muestra en la liga: el primer nombre y la inicial del apellido
  E.leagueName = full => { const p = String(full || "").trim().split(/\s+/).filter(Boolean); return !p.length ? "Anónimo" : (p[0] + (p[1] ? " " + p[1][0].toUpperCase() + "." : "")).slice(0, 40); };
  E.addDays = (str, n) => { const [y, m, d] = str.split("-").map(Number); return E.fmtDate(new Date(y, m - 1, d + n)); };
  E.diffDays = (a, b) => { const [y1, m1, d1] = a.split("-").map(Number); const [y2, m2, d2] = b.split("-").map(Number); return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 864e5); };

  // ---------- Repetición espaciada (SM-2 simplificado, por concepto) ----------
  E.srs = {
    newCard: () => ({ ef: 2.5, int: 0, reps: 0, due: null, last: null, seen: 0, ok: 0 }),
    // nota 0-5 a partir del desempeño (sin autoevaluación)
    grade(ok, ms, difficulty = 1) {
      if (!ok) return 1;
      const s = ms / 1000 / difficulty;
      return s < 25 ? 5 : s < 70 ? 4 : 3;
    },
    update(card, q, today) {
      const c = Object.assign(E.srs.newCard(), card);
      if (q < 3) { c.reps = 0; c.int = 1; }
      else {
        c.reps += 1;
        c.int = c.reps === 1 ? 1 : c.reps === 2 ? 3 : Math.max(1, Math.round(c.int * c.ef));
      }
      c.ef = Math.max(1.3, +(c.ef + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)).toFixed(3));
      c.due = E.addDays(today, c.int);
      c.last = today;
      return c;
    }
  };

  // ---------- Registro de cursos ----------
  // ---------- Registro de materias (una materia = un curso) ----------
  // Cada archivo de materia llama una vez a E.registerCourse y después a E.extendCourse por
  // cada unidad (conceptos, plantillas, lecciones y apuntes). Así se agrega contenido de a una unidad.
  E.cards = {};      // id -> ficha de apuntes (ids únicos entre materias)
  E.termIndex = [];  // [{ alias, id }] para el autolink
  // carreras (una por orientación): E.career es la que eligió la cuenta (por defecto, la primera registrada)
  E.careers = {}; E.careerOrder = []; E.career = null;
  E.registerCareer = def => {
    def.id = def.id || "c" + E.careerOrder.length;
    if (!E.careers[def.id]) E.careerOrder.push(def.id);
    E.careers[def.id] = def;
    if (!E.career || E.career.id === def.id) E.career = def;
  };
  E.setCareer = id => { E.career = E.careers[id] || E.careers[E.careerOrder[0]] || null; return E.career; };
  E.registerCourse = function (c) {
    c.concepts = c.concepts || {};
    c.templates = c.templates || {};
    c.units = c.units || [];
    c.theory = { cards: {}, lessons: {} };
    E.courses[c.id] = c;
    if (!E.courseOrder.includes(c.id)) E.courseOrder.push(c.id);
    indexCourse(c);
    return c;
  };
  E.extendCourse = function (cid, ext) {
    const c = E.courses[cid];
    if (!c) throw new Error("Materia no registrada: " + cid);
    Object.assign(c.concepts, ext.concepts || {});
    Object.assign(c.templates, ext.templates || {});
    for (const u of ext.units || []) {
      const i = c.units.findIndex(x => x.id === u.id);
      if (i >= 0) c.units[i] = u; else c.units.push(u);
    }
    const defGroup = ext.units && ext.units.length === 1 ? ext.units[0].id : null;
    for (const [id, card] of Object.entries(ext.cards || {})) {
      card.id = id; card.course = cid; card.group = card.group || defGroup;
      c.theory.cards[id] = card;
      E.cards[id] = card;
      for (const a of card.aliases || []) E.termIndex.push({ alias: a.toLowerCase(), id });
    }
    Object.assign(c.theory.lessons, ext.lessons || {});
    E._termRe = null;
    indexCourse(c);
  };
  // figuras interactivas para fichas que ya existen: { "id-ficha": [bloque, …] }. Cada bloque va al final de la
  // sección `sec` (por defecto «La idea»).
  E.addFigures = function (cid, figs) {
    for (const [id, list] of Object.entries(figs)) {
      const card = E.cards[id];
      if (!card || card.course !== cid) throw new Error(`Ficha inexistente en ${cid}: ${id}`);
      for (const b of list) { const sec = b.sec || "idea"; (card[sec] = card[sec] || []).push(b); }
    }
  };
  // compatibilidad con el formato anterior de apuntes
  E.registerTheory = (cid, th) => E.extendCourse(cid, { cards: th.cards, lessons: th.lessons });
  function indexCourse(c) {
    c.units.sort((a, b) => (a.order || 0) - (b.order || 0));
    c.tplLesson = {}; c.conceptUnit = {}; c.lessonList = [];
    for (const [id, t] of Object.entries(c.templates)) t.id = id;
    c.units.forEach((u, ui) => {
      u.index = ui;
      u.lessons = u.lessons || [];
      u.lessons.forEach((l, li) => {
        l.unit = u; l.index = li;
        l.concepts = [...new Set(l.templates.flatMap(t => (c.templates[t] ? c.templates[t].concepts : [])))];
        l.templates.forEach(t => { c.tplLesson[t] = l; });
        l.concepts.forEach(k => { if (!c.conceptUnit[k]) c.conceptUnit[k] = u; });
        l.theory = c.theory.lessons[l.id] || l.theory || [];
        c.lessonList.push(l);
      });
    });
    // concepto -> fichas, priorizando el orden en que aparecen en las lecciones
    c.conceptCards = {};
    const order = [...new Set([...c.lessonList.flatMap(l => l.theory), ...Object.keys(c.theory.cards)])].filter(id => c.theory.cards[id]);
    // orden de lectura de los apuntes: el del recorrido de las lecciones (las fichas sueltas, al final)
    c.cardOrder = order;
    // la lección donde se presenta cada ficha; en las siguientes que la listan, la ficha es de repaso
    c.cardFirstLesson = {};
    for (const l of c.lessonList) for (const id of l.theory) if (!c.cardFirstLesson[id]) c.cardFirstLesson[id] = l;
    for (const id of order) {
      const card = c.theory.cards[id];
      if (card) for (const k of card.concepts || []) (c.conceptCards[k] = c.conceptCards[k] || []).push(id);
    }
  }
  // test de una unidad: las plantillas declaradas o, si no hay, una de cada lección (las más difíciles)
  E.unitDiagnostic = function (c, u) {
    if (u.diagnostic && u.diagnostic.length) return u.diagnostic;
    const ls = u.lessons;
    const pick = ls.length <= 3 ? ls : [ls[0], ls[Math.floor(ls.length / 2)], ls[ls.length - 1]];
    return pick.map(l => l.templates.slice().sort((a, b) => c.templates[b].difficulty - c.templates[a].difficulty)[0]);
  };
  const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  E.termRegex = () => E._termRe || (E._termRe = E.termIndex.length
    ? new RegExp(`(?<![\\p{L}\\p{N}])(${E.termIndex.map(t => t.alias).sort((a, b) => b.length - a.length).map(escRe).join("|")})(?![\\p{L}\\p{N}])`, "giu")
    : null);
  // Convierte un trozo de texto (sin LaTeX) en HTML: [[id|texto]] -> link, **negrita**,
  // y si ctx.auto, los términos conocidos -> link (una vez por ficha y por bloque).
  E.linkText = function (text, ctx = {}) {
    const seen = ctx.seen || new Set();
    const link = (id, label) => `<a class="term" role="link" tabindex="0" data-act="learn" data-id="${id}">${label}</a>`;
    let out = String(text)
      .replace(/\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g, (m, id, label) => {
        const card = E.cards[id];
        if (!card) return label || id;
        seen.add(id);
        return link(id, label || card.title);
      })
      .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
    const re = ctx.auto && E.termRegex();
    if (!re) return out;
    let inA = false;
    return out.split(/(<[^>]+>)/).map(piece => {
      if (piece.startsWith("<")) { if (/^<a\b/.test(piece)) inA = true; else if (/^<\/a>/.test(piece)) inA = false; return piece; }
      if (inA) return piece;
      return piece.replace(re, m => {
        const t = E.termIndex.find(x => x.alias === m.toLowerCase());
        if (!t || seen.has(t.id) || t.id === ctx.exclude) return m;
        seen.add(t.id);
        return link(t.id, m);
      });
    }).join("");
  };

  // genera una instancia reproducible de una plantilla
  E.instantiate = function (course, tplId, seed) {
    const t = course.templates[tplId];
    for (let tries = 0; tries < 30; tries++) {
      const inst = t.generate(E.rng(seed + tries * 7919), H);
      if (inst) { inst.type = inst.type || t.type; return inst; }
    }
    throw new Error("No se pudo generar " + tplId);
  };

  // ---------- evaluaciones: parciales y finales simulados ----------
  // E.exams[cid] = { self: { id: { concepts, generate(r, H, args) → { prompt, rubric: [{ text, w }], solution } } }, list: [examen] }
  // examen: { id, kind: "parcial" | "final", title, topics, minutes, pass, items: [{ title, parts: [parte] }] }
  // parte: { pts, tpl } (plantilla fija), { pts, pick: [...] } (una al azar), { pts, self, args } (de desarrollo,
  // autocorregida) o { pts, any: [alternativas] }: en cada intento se sortea una de las alternativas (cada una es
  // una parte sin pts), así un mismo examen puede traer ejercicios distintos, como pasa de un año a otro.
  // Las plantillas de nivel examen (corrección automática, con verify) van en `templates` y se buscan ahí si la
  // materia no tiene una con ese id.
  E.exams = {};
  E.registerExams = function (cid, def) {
    const prev = E.exams[cid] || { self: {}, templates: {}, list: [] };
    E.exams[cid] = { self: Object.assign(prev.self, def.self), templates: Object.assign(prev.templates, def.templates), list: prev.list.concat(def.exams || []) };
  };
  E.examTemplate = (cid, id) => (E.courses[cid].templates[id] || (E.exams[cid] && E.exams[cid].templates[id]));
  E.instantiateExam = function (cid, id, seed) {
    const t = E.examTemplate(cid, id);
    return E.instantiate({ templates: { [id]: t } }, id, seed);
  };
  E.instantiateSelf = function (cid, id, seed, args) {
    const g = E.exams[cid].self[id];
    for (let tries = 0; tries < 30; tries++) {
      const o = g.generate(E.rng(seed + tries * 7919), H, args);
      if (o) return Object.assign({ type: "self", concepts: g.concepts || [] }, o);
    }
    throw new Error("No se pudo generar " + id);
  };
  // reparte los puntos de una parte entre los criterios de la rúbrica (en medios puntos, sumando exacto)
  E.rubricPoints = function (rubric, pts) {
    const W = rubric.reduce((t, x) => t + x.w, 0);
    let acc = 0;
    return rubric.map((x, i) => {
      if (i === rubric.length - 1) return pts - acc;
      const v = Math.round(pts * x.w / W * 2) / 2;
      acc += v;
      return v;
    });
  };
  // arma un intento: cada parte con su plantilla (sorteada si hay varias) y su semilla
  E.buildExam = function (cid, examId, seed) {
    const ex = E.exams[cid].list.find(e => e.id === examId), r = E.rng(seed), parts = [];
    // un ítem también puede ser { any: [ítems] }: se sortea el ejercicio entero (todas las alternativas valen lo mismo)
    const items = ex.items.map(it => (it.any ? r.pick(it.any) : it));
    items.forEach((it, i) => it.parts.forEach((p0, j) => {
      const p = p0.any ? r.pick(p0.any) : p0;
      parts.push({
        item: i, label: it.parts.length > 1 ? `${i + 1}.${j + 1}` : `${i + 1}`, pts: p0.pts,
        tpl: p.tpl || (p.pick ? r.pick(p.pick) : null), self: p.self || null, args: p.args || null, seed: r.int(1, 1e9)
      });
    }));
    return { exam: Object.assign({}, ex, { items }), parts };
  };

  // ---------- Ejercicio del día ----------
  // Sale de las lecciones ya completadas y es el mismo todo el día (la semilla es la fecha).
  // Se queda con las plantillas más exigentes que tengas: dificultad 3 si hay al menos 3, si no 2 y 3.
  // `cands` es una lista de { cid, tpl, difficulty, type } en un orden fijo.
  E.dailySeed = date => { let h = 2166136261; for (const ch of "efecen-dia-" + date) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h % 1e9 + 1; };
  E.dailyPick = (cands, date) => {
    const ok = cands.filter(c => c.type !== "tf" && c.difficulty >= 2);
    if (!ok.length) return null;
    const hard = ok.filter(c => c.difficulty >= 3), pool = hard.length >= 3 ? hard : ok;
    const r = E.rng(E.dailySeed(date));
    return Object.assign({ seed: r.int(1, 1e9) }, r.pick(pool));
  };

  // ---------- Estado persistente ----------
  E.store = {
    key: "efecen:v1",
    defaults: () => ({
      app: "efecen", version: 1,
      settings: { goal: 50, sound: true, theme: "auto", league: true },
      xp: 0, streak: 0, bestStreak: 0, lastActive: null,
      xpByDay: {}, activeCourse: null,
      courses: {}, srs: {}, log: [], answered: 0, answeredOk: 0, read: {},
      exams: {}, // "m101/p1" -> { best, attempts: [{ d, t, score }] } (los más nuevos primero)
      career: null, careerAt: 0, // carrera elegida ("fis", "mat", "qui", "bio") y cuándo se eligió (ms)
      daily: {} // ejercicio del día: "2026-10-15" -> { cid, tpl, ok }
    }),
    migrate(s) {
      const d = E.store.defaults();
      for (const k of Object.keys(d)) if (s[k] === undefined) s[k] = d[k];
      s.settings = Object.assign(d.settings, s.settings);
      // materias renombradas al pasar a "la carrera" (calculo -> m101)
      for (const [o, n] of Object.entries(E.store.renamed)) {
        if (s.courses[o] && !s.courses[n]) s.courses[n] = s.courses[o];
        delete s.courses[o];
        for (const k of Object.keys(s.srs)) if (k.startsWith(o + "/")) { s.srs[n + k.slice(o.length)] = s.srs[k]; delete s.srs[k]; }
        if (s.activeCourse === o) s.activeCourse = n;
        for (const l of s.log) if (l.c === o) l.c = n;
      }
      return s;
    },
    renamed: { calculo: "m101" },
    valid: s => !!s && typeof s === "object" && s.app === "efecen" && typeof s.version === "number" && typeof s.srs === "object" && typeof s.courses === "object",
    load() {
      try {
        const raw = localStorage.getItem(E.store.key);
        if (!raw) return E.store.defaults();
        const s = JSON.parse(raw);
        return E.store.valid(s) ? E.store.migrate(s) : E.store.defaults();
      } catch (e) { return E.store.defaults(); }
    },
    save(s) { try { localStorage.setItem(E.store.key, JSON.stringify(s)); return true; } catch (e) { return false; } },
    // combina el progreso de dos dispositivos sin perder nada: todo lo acumulable se queda con el máximo
    // o la unión, y lo "de estado" (ajustes, materia activa, racha) se toma del más reciente.
    // Es idempotente y conmutativo en lo acumulable, así que sincronizar dos veces no cambia nada.
    merge(a, b) {
      a = E.store.migrate(JSON.parse(JSON.stringify(a))); b = E.store.migrate(JSON.parse(JSON.stringify(b)));
      const newer = (b.lastActive || "") > (a.lastActive || "") ? b : a, older = newer === a ? b : a;
      const out = JSON.parse(JSON.stringify(newer));
      const max = (x, y) => Math.max(x || 0, y || 0);
      out.xp = max(a.xp, b.xp); out.answered = max(a.answered, b.answered); out.answeredOk = max(a.answeredOk, b.answeredOk);
      out.bestStreak = max(a.bestStreak, b.bestStreak);
      if (a.lastActive === b.lastActive) out.streak = max(a.streak, b.streak);
      out.activeCourse = newer.activeCourse || older.activeCourse;
      // la carrera: la que se eligió último (a igualdad, la del más reciente)
      const ch = (older.careerAt || 0) > (newer.careerAt || 0) ? older : newer;
      out.career = ch.career || null; out.careerAt = ch.careerAt || 0;
      for (const [d, x] of Object.entries(older.xpByDay)) out.xpByDay[d] = max(out.xpByDay[d], x);
      for (const id of Object.keys(older.read)) out.read[id] = true;
      // tarjetas de repaso: la que más se practicó (a igualdad, la de repaso más reciente)
      for (const [k, c] of Object.entries(older.srs)) {
        const o = out.srs[k];
        if (!o || c.seen > o.seen || (c.seen === o.seen && (c.last || "") > (o.last || ""))) out.srs[k] = c;
      }
      for (const [cid, oc] of Object.entries(older.courses)) {
        const st = out.courses[cid] = out.courses[cid] || { lessons: {}, diag: null };
        st.lessons = st.lessons || {}; st.unitsOpen = Object.assign({}, oc.unitsOpen || {}, st.unitsOpen || {});
        st.diag = st.diag || oc.diag || null;
        // juegos: un jefe vencido en algún dispositivo queda vencido; el récord del contrarreloj, el máximo
        if (oc.bosses) {
          st.bosses = st.bosses || {};
          for (const [uid, ob] of Object.entries(oc.bosses)) {
            const b = st.bosses[uid] = st.bosses[uid] || {};
            b.won = !!(b.won || ob.won); b.wins = max(b.wins, ob.wins);
          }
        }
        if (st.rush || oc.rush) st.rush = max(st.rush, oc.rush);
        for (const [lid, ol] of Object.entries(oc.lessons || {})) {
          const l = st.lessons[lid] = st.lessons[lid] || {};
          l.done = !!(l.done || ol.done); l.plays = max(l.plays, ol.plays); l.best = max(l.best, ol.best);
        }
      }
      for (const st of Object.values(out.courses)) { st.lessons = st.lessons || {}; st.unitsOpen = st.unitsOpen || {}; if (st.diag === undefined) st.diag = null; }
      // evaluaciones: la unión de los intentos (sin repetir) y la mejor nota
      for (const [k, oe] of Object.entries(older.exams)) {
        const e = out.exams[k] = out.exams[k] || { best: 0, attempts: [] }, have = new Set(e.attempts.map(x => x.t));
        e.best = max(e.best, oe.best);
        e.attempts = e.attempts.concat((oe.attempts || []).filter(x => !have.has(x.t))).sort((x, y) => y.t - x.t).slice(0, 30);
      }
      // ejercicio del día: si se resolvió bien en algún dispositivo, cuenta como resuelto
      for (const [d, od] of Object.entries(older.daily)) {
        const x = out.daily[d];
        if (!x || (od.ok && !x.ok)) out.daily[d] = od;
      }
      const seen = new Set();
      out.log = a.log.concat(b.log).filter(l => { const k = JSON.stringify(l); return seen.has(k) ? false : seen.add(k); })
        .sort((x, y) => (y.d > x.d ? 1 : y.d < x.d ? -1 : 0)).slice(0, 60);
      return out;
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
