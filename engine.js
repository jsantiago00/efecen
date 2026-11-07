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

  // ---------- Calendario académico (content/calendario.js) ----------
  // Turnos de examen (un rango `from`–`to` o días sueltos `days`), la fecha de mesa de cada materia en cada
  // llamado (`mesas[cid][turno]`, cuando se conoce), feriados y recesos. Vale para todos los usuarios.
  E.calendar = { source: "", turnos: [], mesas: {}, feriados: [], receso: [] };
  E.turnoFrom = t => (t.days ? t.days[0] : t.from);
  E.turnoTo = t => (t.days ? t.days[t.days.length - 1] : t.to);
  E.registerCalendar = def => {
    const C = E.calendar;
    if (def.source) C.source = def.source;
    for (const t of def.turnos || []) { const i = C.turnos.findIndex(x => x.id === t.id); if (i >= 0) C.turnos[i] = t; else C.turnos.push(t); }
    C.turnos.sort((a, b) => (E.turnoFrom(a) < E.turnoFrom(b) ? -1 : 1));
    for (const [cid, m] of Object.entries(def.mesas || {})) C.mesas[cid] = Object.assign(C.mesas[cid] || {}, m);
    C.feriados = C.feriados.concat(def.feriados || []).sort((a, b) => (a.date < b.date ? -1 : 1));
    C.receso = C.receso.concat(def.receso || []);
  };
  // la mesa de una materia en un llamado: { date, time, insc: [desde, hasta], note } (o una fecha suelta)
  E.mesaInfo = (cid, tid) => { const m = (E.calendar.mesas[cid] || {})[tid]; return !m ? null : typeof m === "string" ? { date: m } : m; };
  E.mesaDate = (cid, tid) => { const m = E.mesaInfo(cid, tid); return m ? m.date : null; };
  // las mesas con inscripción abierta un día: [{ cid, tid, mesa }]
  E.inscOn = d => Object.entries(E.calendar.mesas).flatMap(([cid, ms]) => Object.keys(ms).map(tid => ({ cid, tid, mesa: E.mesaInfo(cid, tid) })))
    .filter(x => x.mesa.insc && d >= x.mesa.insc[0] && d <= x.mesa.insc[1]);
  // la fecha que se propone al elegir un turno: la de la mesa de la materia o, si no se sabe, el primer día del
  // llamado a partir de `after` (sin contar ese día)
  E.turnoDate = (cid, tid, after) => {
    const t = E.calendar.turnos.find(x => x.id === tid);
    if (!t) return null;
    const m = E.mesaDate(cid, tid);
    if (m && m > after) return m;
    if (t.days) return t.days.find(d => d > after) || null;
    const d = t.from > after ? t.from : E.addDays(after, 1);
    return d <= t.to ? d : null;
  };
  E.dayInfo = d => ({
    feriado: E.calendar.feriados.find(f => f.date === d) || null,
    turno: E.calendar.turnos.find(t => (t.days ? t.days.includes(d) : d >= t.from && d <= t.to)) || null,
    receso: E.calendar.receso.find(r => d >= r.from && d <= r.to) || null
  });

  // ---------- Plan de estudio ----------
  // Reparte el estudio de los finales (y parciales) que cargues entre hoy y cada fecha, según el tiempo que
  // tengas cada día. Es para estudiar fuera de la app: teoría, guía de ejercicios y simulacros, más un repaso
  // corto en efecen por unidad. Lo hecho se anota en `log`; cada día se vuelve a armar con lo que falta,
  // así que atrasarse no deja tareas vencidas: se reacomodan solas.
  //   p.mode: "hours" (horas por día de la semana, `hours[0..6]`, lunes primero) o "slots" (franjas fijas
  //   `{ d, a: "18:00", b: "20:00" }`); p.off: días sin estudio; p.goals: { id, cid, kind: "final"|"parcial",
  //   date, from (cuándo se cargó), units (null = todas), exam, intensity }; p.log: fecha -> clave -> { m, t }.
  // `info(goal)` lo da la app: { units: [{ id, label, lessons, mastery (0..1 o null) }], exam: { minutes } | null }.
  // todo se mide en cuartos de hora, así no quedan bloques de 5 minutos
  const r15 = x => Math.max(15, Math.round(x / 15) * 15), f15 = x => Math.floor(x / 15) * 15;
  const PL = E.plan = {
    DAYS: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    INTENSITY: { 0.7: "Liviana", 1: "Normal", 1.4: "A fondo" },
    defaults: () => ({ at: 0, mode: "hours", hours: [2, 2, 2, 2, 2, 3, 0], slots: [], off: [], goals: [], log: {} }),
    dow: date => { const [y, m, d] = date.split("-").map(Number); return (new Date(y, m - 1, d).getDay() + 6) % 7; },
    toMin: hm => { const [h, m] = String(hm).split(":").map(Number); return h * 60 + (m || 0); },
    fromMin: t => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`,
    // `from`: minutos desde la medianoche; las franjas (o la parte) anteriores no cuentan (sirve para hoy)
    slotsOn(p, date, from = 0) {
      if (p.off.includes(date)) return [];
      const d = PL.dow(date);
      return p.slots.filter(s => s.d === d).map(s => ({ a: Math.max(PL.toMin(s.a), from), b: PL.toMin(s.b) })).filter(s => s.b > s.a).sort((x, y) => x.a - y.a);
    },
    capacity(p, date, from = 0) {
      if (p.off.includes(date)) return 0;
      if (p.mode === "slots") return f15(PL.slotsOn(p, date, from).reduce((t, s) => t + s.b - s.a, 0));
      return Math.max(0, f15((p.hours[PL.dow(date)] || 0) * 60));
    },
    weekMinutes: p => [0, 1, 2, 3, 4, 5, 6].reduce((t, d) => t + (p.mode === "slots"
      ? p.slots.filter(s => s.d === d).reduce((u, s) => u + Math.max(0, PL.toMin(s.b) - PL.toMin(s.a)), 0)
      : Math.round((p.hours[d] || 0) * 60)), 0),
    doneByKey(p) {
      const o = {};
      for (const day of Object.values(p.log)) for (const [k, e] of Object.entries(day)) if (e.m > 0) o[k] = (o[k] || 0) + e.m;
      return o;
    },
    doneOn: (p, date) => Object.values(p.log[date] || {}).reduce((t, e) => t + Math.max(0, e.m), 0),
    // lo que hay que estudiar para una fecha. Primera vuelta, por unidad: teoría → práctica → repaso en la app.
    // Segunda vuelta (cerca de la fecha): un repaso corto de cada unidad y, en un final, la integración.
    work(g, info) {
      const k = g.intensity || 1, items = [];
      const sel = info.units.filter(u => !g.units || g.units.includes(u.id));
      for (const u of sel) {
        // lo que ya dominás pide menos tiempo; lo flojo, más (sin datos: lo normal)
        const f = k * (u.mastery == null ? 1 : 1.35 - 0.85 * u.mastery), L = Math.max(1, u.lessons), base = `${g.id}/${u.id}/`;
        const teo = Math.max(30, r15(L * 30 * f)), pra = Math.max(30, r15(L * 40 * f));
        items.push({ key: base + "teo", kind: "teoria", uid: u.id, min: teo },
          { key: base + "pra", kind: "practica", uid: u.id, min: pra },
          { key: base + "app", kind: "app", uid: u.id, min: r15(L * 8 * f) });
      }
      for (const u of sel) {
        const it = items.filter(x => x.uid === u.id && x.kind !== "app");
        items.push({ key: `${g.id}/${u.id}/rep`, kind: "repaso", uid: u.id, min: r15(0.3 * (it[0].min + it[1].min)) });
      }
      if (g.kind === "final" && sel.length > 1) items.push({ key: g.id + "/integ", kind: "integrar", min: Math.max(60, r15(sel.length * 20 * k)) });
      return items;
    },
    // días fijos antes de la fecha: simulacros (con su corrección) y la víspera, liviana. Dependen de cuánto
    // faltaba cuando cargaste la fecha (`from`), así no cambian a medida que se acerca.
    fixed(g, exam) {
      const n = E.diffDays(g.from || g.date, g.date), sim = r15(((exam && exam.minutes) || 150) + 30), out = [];
      const sims = n >= 21 ? [4, 2] : n >= 8 ? [3] : n >= 3 ? [2] : [];
      sims.forEach((d, i) => out.push({ key: `${g.id}/sim${i + 1}`, kind: "simulacro", min: sim, day: E.addDays(g.date, -d) }));
      if (n >= 2) out.push({ key: g.id + "/vispera", kind: "vispera", min: 60, day: E.addDays(g.date, -1) });
      return out;
    },
    // llena `need` minutos usando todo el tiempo de cada día, desde el primero (o desde el último, con
    // `fromEnd`), sin pasarse de `cap` y sin bloques de menos de media hora (salvo lo último que quede)
    fill(days, cap, need, fromEnd = false) {
      const alloc = {};
      let left = need;
      for (const d of fromEnd ? days.slice().reverse() : days) {
        if (left <= 0) break;
        if (cap[d] < Math.min(30, left)) continue;
        const t = Math.min(cap[d], left);
        alloc[d] = t; left -= t;
      }
      return { alloc, short: left };
    },
    // arma el plan desde hoy: { days: { fecha: [bloques] }, goals: [resumen], warnings, last }. `now` (minutos
    // desde la medianoche) hace que, con franjas, hoy solo cuente lo que queda del día.
    // Hoy queda fijo en lo que se planificó al empezar el día: lo que tildás se descuenta y, si terminás
    // antes, no aparece más para hoy (lo adelantado se descuenta de los días siguientes).
    build(p, today, info, now = 0) {
      if (!PL.doneOn(p, today)) return PL._build(p, today, info, now, null);
      const q = Object.assign({}, p, { log: Object.assign({}, p.log) });
      delete q.log[today];
      const planned = (PL._build(q, today, info, 0, null).days[today] || []).reduce((t, b) => t + b.min, 0);
      return PL._build(p, today, info, now, Math.max(0, planned - PL.doneOn(p, today)));
    },
    _build(p, today, info, now, todayLeft) {
      const done = PL.doneByKey(p), days = {}, cap = {}, warnings = [], summary = [];
      const goals = p.goals.filter(g => g.date > today && info(g)).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : 1));
      const last = goals.length ? goals[goals.length - 1].date : today;
      for (let d = today; d < last; d = E.addDays(d, 1)) { days[d] = []; cap[d] = d !== today ? PL.capacity(p, d) : todayLeft != null ? Math.min(todayLeft, PL.capacity(p, d, p.mode === "slots" ? now : 0)) : PL.capacity(p, d, p.mode === "slots" ? now : 0); cap[d] = Math.max(0, f15(cap[d])); }
      const put = (d, it, g, min) => { days[d].push({ key: it.key, gid: g.id, kind: it.kind, uid: it.uid || null, min }); cap[d] -= min; };
      // 1) los días fijos de cada fecha, del último al primero: la víspera y, antes, los simulacros, cada uno en
      // un día anterior al siguiente (si el previsto no tiene lugar, hasta 3 días antes)
      const eveOf = {};
      for (const g of goals) {
        const inf = info(g);
        let limit = g.date;
        for (const it of PL.fixed(g, inf.exam).reverse()) {
          const left = it.min - (done[it.key] || 0);
          if (left <= 0 || it.day < today) continue;
          // el día previsto si entra entero; si no, hasta 3 días antes; si en ninguno entra, el de más lugar
          let d = null, best = null;
          const from = it.day < limit ? it.day : E.addDays(limit, -1);
          for (let k = 0; k <= 3; k++) {
            const c = E.addDays(from, -k);
            if (c < today) break;
            if (cap[c] >= left) { d = c; break; }
            if (cap[c] >= 45 && (!best || cap[c] > cap[best])) best = c;
          }
          d = d || best;
          if (!d) { warnings.push({ gid: g.id, kind: "nofixed", what: it.kind }); continue; }
          put(d, it, g, Math.min(left, cap[d]));
          limit = d;
          if (it.kind === "vispera") eveOf[g.id] = d;
        }
      }
      // 2) el estudio de cada fecha, la más cercana primero: la primera vuelta usa todo el tiempo desde hoy; el
      //    repaso y la integración van hacia atrás desde los días fijos, para llegar frescos a la fecha
      for (const g of goals) {
        const inf = info(g), items = PL.work(g, inf), fx = PL.fixed(g, inf.exam);
        const total = items.reduce((t, it) => t + it.min, 0) + fx.reduce((t, it) => t + it.min, 0);
        const doneG = Object.entries(done).filter(([k]) => k.startsWith(g.id + "/")).reduce((t, [, m]) => t + m, 0);
        // todos los días hasta la víspera (los simulacros ya ocupan su lugar); sin víspera, hasta la fecha
        const end = eveOf[g.id] && eveOf[g.id] > today ? eveOf[g.id] : g.date, win = Object.keys(days).filter(d => d < end).sort();
        const queue = items.map(it => Object.assign({}, it, { left: it.min - (done[it.key] || 0) })).filter(it => it.left > 0);
        const late = it => it.kind === "repaso" || it.kind === "integrar";
        let short = 0;
        for (const [q, fromEnd] of [[queue.filter(it => !late(it)), false], [queue.filter(late), true]]) {
          const fl = PL.fill(win, cap, q.reduce((t, it) => t + it.left, 0), fromEnd);
          short += fl.short;
          let qi = 0;
          for (const d of win) {
            let a = fl.alloc[d] || 0;
            while (a > 0 && qi < q.length) {
              const it = q[qi], take = Math.min(a, it.left);
              put(d, it, g, take);
              it.left -= take; a -= take;
              if (it.left <= 0) qi++;
            }
          }
        }
        if (short > 0) warnings.push({ gid: g.id, kind: "short", min: short });
        // el último día de temas nuevos (la primera vuelta)
        const lastStudy = win.filter(d => days[d].some(b => b.gid === g.id && ["teoria", "practica", "app"].includes(b.kind))).pop() || null;
        summary.push({ id: g.id, total, done: Math.min(total, doneG), short, lastStudy });
      }
      // 3) en franjas horarias, cada bloque con su hora (si cruza el fin de una franja, se parte)
      if (p.mode === "slots") for (const d of Object.keys(days)) {
        const sl = PL.slotsOn(p, d, d === today ? now : 0), out = [];
        let si = 0, t = sl.length ? sl[0].a : 0;
        for (const b of days[d]) {
          let rem = b.min;
          while (rem > 0 && si < sl.length) {
            if (t >= sl[si].b) { si++; if (si < sl.length) t = sl[si].a; continue; }
            const take = Math.min(rem, sl[si].b - t);
            out.push(Object.assign({}, b, { min: take, at: PL.fromMin(t) }));
            t += take; rem -= take;
          }
          if (rem > 0) out.push(Object.assign({}, b, { min: rem }));
        }
        days[d] = out;
      }
      return { days, goals: summary, warnings, last };
    },
    // marcar (o desmarcar) un bloque como hecho hoy
    mark(p, date, key, min, on, now = Date.now()) {
      const day = p.log[date] = p.log[date] || {}, prev = (day[key] && day[key].m) || 0;
      day[key] = { m: on ? prev + min : 0, t: now };
    },
    // combinar dos dispositivos: la configuración del que la cambió último; lo hecho, entrada por entrada
    // (la escrita último gana, así desmarcar también se sincroniza)
    merge(a, b) {
      const cfg = (b.at || 0) > (a.at || 0) ? b : a, out = JSON.parse(JSON.stringify(cfg));
      out.log = {};
      for (const src of [a, b]) for (const [d, day] of Object.entries(src.log || {})) for (const [k, e] of Object.entries(day)) {
        const o = (out.log[d] = out.log[d] || {})[k];
        if (!o || e.t > o.t || (e.t === o.t && e.m > o.m)) out.log[d][k] = { m: e.m, t: e.t };
      }
      return out;
    },
    // archivo .ics para Google Calendar: con franjas, un evento por bloque; con horas por día, uno de todo el
    // día con la lista. `label(b)` da el texto de cada bloque y `goalLabel(g)`, el de cada fecha.
    ics(p, plan, label, goalLabel, stamp) {
      const esc = s => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
      const D = d => d.replace(/-/g, ""), L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//efecen//plan//ES", "CALSCALE:GREGORIAN", "X-WR-CALNAME:efecen · plan de estudio"];
      const ev = (uid, start, end, sum, desc) => L.push("BEGIN:VEVENT", `UID:${uid}@efecen.com.ar`, `DTSTAMP:${stamp}`, start, end, `SUMMARY:${esc(sum)}`, ...(desc ? [`DESCRIPTION:${esc(desc)}`] : []), "END:VEVENT");
      for (const [d, bl] of Object.entries(plan.days)) {
        if (!bl.length) continue;
        if (p.mode === "slots" && bl.every(b => b.at)) {
          bl.forEach((b, i) => {
            const t0 = PL.toMin(b.at), t1 = t0 + b.min, hm = t => PL.fromMin(t).replace(":", "") + "00";
            ev(`${D(d)}-${i}-${b.key.replace(/[^a-z0-9]/gi, "")}`, `DTSTART:${D(d)}T${hm(t0)}`, `DTEND:${D(d)}T${hm(t1)}`, label(b), "");
          });
        } else {
          const tot = bl.reduce((t, b) => t + b.min, 0);
          ev(`${D(d)}-dia`, `DTSTART;VALUE=DATE:${D(d)}`, `DTEND;VALUE=DATE:${D(E.addDays(d, 1))}`,
            `Estudiar ${H_hours(tot)}`, bl.map(b => `• ${label(b)} (${H_hours(b.min)})`).join("\n"));
        }
      }
      for (const g of p.goals) {
        const m = g.turno ? E.mesaInfo(g.cid, g.turno) : null;
        ev(`${D(g.date)}-${g.id}`, `DTSTART;VALUE=DATE:${D(g.date)}`, `DTEND;VALUE=DATE:${D(E.addDays(g.date, 1))}`, goalLabel(g) + (m && m.date === g.date && m.time ? ` · ${m.time} h` : ""), (m && m.note) || "");
        if (m && m.insc && m.date === g.date) ev(`${D(m.insc[0])}-${g.id}-insc`, `DTSTART;VALUE=DATE:${D(m.insc[0])}`, `DTEND;VALUE=DATE:${D(E.addDays(m.insc[1], 1))}`,
          `Inscribirse: ${goalLabel(g)} (SIU Guaraní)`, `La inscripción abre el ${m.insc[0]} a las 10 h y cierra el ${m.insc[1]}.`);
      }
      L.push("END:VCALENDAR");
      // las líneas de más de 75 caracteres se parten (RFC 5545)
      return L.map(l => (l.length <= 72 ? l : l.match(/.{1,72}/gu).join("\r\n "))).join("\r\n") + "\r\n";
    }
  };
  // "1 h 30 min", "45 min", "2 h"
  const H_hours = m => { m = Math.round(m); const h = Math.floor(m / 60), r = m % 60; return h ? (r ? `${h} h ${r} min` : `${h} h`) : `${r} min`; };
  PL.fmt = H_hours;

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
      daily: {}, // ejercicio del día: "2026-10-15" -> { cid, tpl, ok }
      plan: E.plan.defaults() // plan de estudio (ver E.plan)
    }),
    migrate(s) {
      const d = E.store.defaults();
      for (const k of Object.keys(d)) if (s[k] === undefined) s[k] = d[k];
      s.settings = Object.assign(d.settings, s.settings);
      s.plan = Object.assign(d.plan, s.plan);
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
      out.plan = E.plan.merge(a.plan, b.plan);
      const seen = new Set();
      out.log = a.log.concat(b.log).filter(l => { const k = JSON.stringify(l); return seen.has(k) ? false : seen.add(k); })
        .sort((x, y) => (y.d > x.d ? 1 : y.d < x.d ? -1 : 0)).slice(0, 60);
      return out;
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
