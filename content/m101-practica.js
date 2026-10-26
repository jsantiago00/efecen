/* ===== M101 · Escribir la expresión y paso a paso =====
   Ejercicios que se suman a lecciones que ya existen (E.addPractice). En los de tipo expr se escribe la función
   (la derivada, una primitiva, la solución de una ecuación diferencial); la app la compara evaluando en puntos del
   dominio, así que se acepta cualquier forma equivalente: sin simplificar, en otro orden, con o sin paréntesis. */
(function () {
  const E = window.Efecen, H = E.H;
  const T = {};
  const sum = H.terms, xp = H.pw;
  // exponente de e en TeX y para el parser: k·x
  const kx = k => ({ m: `${k}*x`, t: H.kx(k) });
  // coeficiente en TeX delante de algo: "1" → "", "-1" → "-"
  const co1 = s => (s === "1" ? "" : s === "-1" ? "-" : s);
  const rk4 = (F, y0) => x => {
    const n = 400, h = x / n;
    let y = y0, t = 0;
    for (let i = 0; i < n; i++) {
      const k1 = F(t, y), k2 = F(t + h / 2, y + h * k1 / 2), k3 = F(t + h / 2, y + h * k2 / 2), k4 = F(t + h, y + h * k3);
      y += h * (k1 + 2 * k2 + 2 * k3 + k4) / 6; t += h;
    }
    return y;
  };
  // máximo de una función unimodal en [lo, hi] por sección áurea
  const argmax = (g, lo, hi) => {
    const ph = (Math.sqrt(5) - 1) / 2;
    let a = lo, b = hi;
    for (let i = 0; i < 200; i++) { const c = b - ph * (b - a), d = a + ph * (b - a); if (g(c) > g(d)) b = d; else a = c; }
    return (a + b) / 2;
  };
  // área de un polígono por la fórmula del lazo (shoelace)
  const shoelace = pts => Math.abs(pts.reduce((s, [x, y], i) => { const [u, v] = pts[(i + 1) % pts.length]; return s + x * v - u * y; }, 0)) / 2;

  /* ---------- derivadas ---------- */
  T["der-reglas-expr"] = {
    type: "expr", concepts: ["der-potencia"], difficulty: 1,
    generate(r) {
      const n = r.int(2, 5), m = r.int(1, n - 1), a = r.nz(-6, 6), b = r.nz(-5, 5), k = r.nz(-4, 4);
      const extra = r.pick(["cte", "sin", "cos", "exp", "inv"]), c = r.nz(-9, 9);
      const f = [{ p: a, ...xp(n) }, { p: b, ...xp(m) }], d = [{ p: a * n, ...xp(n - 1) }, { p: b * m, ...xp(m - 1) }];
      const lazy = [{ p: a * n, ...xp(n) }, { p: b * m, ...xp(m) }]; // multiplica por el exponente pero no lo baja
      const K = Math.abs(k), sk = Math.sign(k);
      const ex = {
        cte: { f: [{ p: c }], d: [], fn: () => c, step: "La derivada de una constante es $0$." },
        sin: { f: [{ p: k, m: "sin(x)", t: "\\sin x" }], d: [{ p: k, m: "cos(x)", t: "\\cos x" }], fn: x => k * Math.sin(x), step: "Además, $(\\sin x)' = \\cos x$ (ver [[derivadas-trig]])." },
        cos: { f: [{ p: k, m: "cos(x)", t: "\\cos x" }], d: [{ p: -k, m: "sin(x)", t: "\\sin x" }], fn: x => k * Math.cos(x), step: "Además, $(\\cos x)' = -\\sin x$ (ver [[derivadas-trig]])." },
        exp: { f: [{ p: k, m: "exp(x)", t: "e^{x}" }], d: [{ p: k, m: "exp(x)", t: "e^{x}" }], fn: x => k * Math.exp(x), step: "Además, $(e^x)' = e^x$ (ver [[exp-log]])." },
        inv: { f: [{ p: sk, m: `${K}/x`, t: `\\frac{${K}}{x}` }], d: [{ p: -sk, m: `${K}/x^2`, t: `\\frac{${K}}{x^{2}}` }], fn: x => k / x, step: `Además, $\\frac{${K}}{x} = ${K}x^{-1}$, así que su derivada es $-${K}x^{-2}$.` }
      }[extra];
      const [, F] = sum([...f, ...ex.f]), [ans, D] = sum([...d, ...ex.d]);
      const traps = [{ expr: sum([...lazy, ...ex.d])[0], msg: "Multiplicaste por el exponente pero no le restaste 1: $(x^n)' = n\\,x^{n-1}$." }];
      if (extra === "cos") traps.push({ expr: sum([...d, { p: k, m: "sin(x)", t: "" }])[0], msg: "La derivada del coseno es $-\\sin x$: te faltó el signo menos." });
      return {
        prompt: `Derivá $f(x) = ${F}$.`,
        lhs: "f'(x) = ", answer: ans, answerTex: D, vars: ["x"], domain: [extra === "inv" ? [0.3, 2.5] : [-2, 2]], traps,
        solution: [
          `Por la [[regla-potencia|regla de la potencia]], $(x^n)' = n\\,x^{n-1}$, y como la derivada es lineal, se deriva término a término.`,
          ex.step,
          `$f'(x) = ${D}$`
        ],
        verify: { kind: "derivOf", f: x => a * x ** n + b * x ** m + ex.fn(x), dom: [extra === "inv" ? [0.3, 2.5] : [-2, 2]] }
      };
    }
  };
  T["der-prodcoc-expr"] = {
    type: "expr", concepts: ["der-producto", "der-cociente"], difficulty: 2,
    generate(r) {
      const v = r.pick(["linsin", "potexp", "cociente"]);
      if (v === "linsin") {
        const a = r.nz(-4, 4), b = r.nz(-6, 6), [L, LT] = sum([{ p: a, m: "x", t: "x" }, { p: b }]);
        return {
          prompt: `Derivá $f(x) = (${LT})\\sin x$.`,
          lhs: "f'(x) = ", answer: `${a}*sin(x) + (${L})*cos(x)`, answerTex: `${H.cf(a)}\\sin x + (${LT})\\cos x`, vars: ["x"],
          traps: [{ expr: `${a}*cos(x)`, msg: "La derivada de un producto no es el producto de las derivadas: $(fg)' = f'g + fg'$." }],
          solution: [`[[regla-producto|Regla del producto]] con $u = ${LT}$ y $v = \\sin x$: $u' = ${a}$, $v' = \\cos x$.`, `$f'(x) = u'v + uv' = ${H.cf(a)}\\sin x + (${LT})\\cos x$`],
          verify: { kind: "derivOf", f: x => (a * x + b) * Math.sin(x), dom: [[-2, 2]] }
        };
      }
      if (v === "potexp") {
        const n = r.int(2, 5), c = r.pick([1, 2, 3, -1, -2]);
        const lo = xp(n - 1);
        return {
          prompt: `Derivá $f(x) = ${H.cf(c)}x^{${n}}e^{x}$.`,
          lhs: "f'(x) = ", answer: `${c}*(${n}*${lo.m}*exp(x) + x^${n}*exp(x))`, answerTex: `${H.cf(c)}\\left(${n}${lo.t}e^{x} + x^{${n}}e^{x}\\right)`, vars: ["x"],
          traps: [{ expr: `${c * n}*${lo.m}*exp(x)`, msg: "La derivada de un producto no es el producto de las derivadas: $(fg)' = f'g + fg'$." }],
          solution: [`[[regla-producto|Regla del producto]] con $u = x^{${n}}$ y $v = e^{x}$: $u' = ${n}${lo.t}$, $v' = e^{x}$.`, `$f'(x) = ${H.cf(c)}\\left(${n}${lo.t}e^{x} + x^{${n}}e^{x}\\right) = ${H.cf(c)}${lo.t}e^{x}(x + ${n})$`],
          verify: { kind: "derivOf", f: x => c * x ** n * Math.exp(x), dom: [[-2, 2]] }
        };
      }
      const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.int(1, 9);
      const [L, LT] = sum([{ p: a, m: "x", t: "x" }, { p: b }]), [N, NT] = sum([{ p: -a, m: "x^2", t: "x^{2}" }, { p: -2 * b, m: "x", t: "x" }, { p: a * c }]);
      return {
        prompt: `Derivá $f(x) = \\dfrac{${LT}}{x^{2} + ${c}}$.`,
        lhs: "f'(x) = ", answer: `(${N})/(x^2 + ${c})^2`, answerTex: `\\dfrac{${NT}}{(x^{2} + ${c})^{2}}`, vars: ["x"],
        traps: [{ expr: `(${N})/(x^2 + ${c})`, msg: "Te faltó el cuadrado del denominador: $\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}$." }],
        solution: [
          `[[regla-cociente|Regla del cociente]] con $u = ${LT}$ y $v = x^{2} + ${c}$: $u' = ${a}$, $v' = 2x$.`,
          `$f'(x) = \\dfrac{${a}(x^{2} + ${c}) - (${LT})\\cdot 2x}{(x^{2} + ${c})^{2}} = \\dfrac{${NT}}{(x^{2} + ${c})^{2}}$`
        ],
        verify: { kind: "derivOf", f: x => (a * x + b) / (x * x + c), dom: [[-2, 2]] }
      };
    }
  };
  T["der-cadena-expr"] = {
    type: "expr", concepts: ["der-cadena"], difficulty: 2,
    generate(r) {
      const v = r.pick(["sin", "pot", "ln", "sqrt"]);
      const inner = "Te faltó multiplicar por la derivada de lo de adentro: $(f(g(x)))' = f'(g(x))\\,g'(x)$.";
      if (v === "pot") {
        const a = r.pick([2, 3, 4, -2, -3]), b = r.nz(-5, 5), n = r.int(3, 6), [U, UT] = sum([{ p: a, m: "x", t: "x" }, { p: b }]);
        return {
          prompt: `Derivá $f(x) = (${UT})^{${n}}$.`,
          lhs: "f'(x) = ", answer: `${n * a}*(${U})^${n - 1}`, answerTex: `${n * a}(${UT})^{${n - 1}}`, vars: ["x"],
          traps: [{ expr: `${n}*(${U})^${n - 1}`, msg: inner }],
          solution: [`[[regla-cadena|Regla de la cadena]] con $u = ${UT}$: $(u^{${n}})' = ${n}u^{${n - 1}}\\,u'$ y $u' = ${a}$.`, `$f'(x) = ${n}\\cdot ${H.par(a)}\\,(${UT})^{${n - 1}} = ${n * a}(${UT})^{${n - 1}}$`],
          verify: { kind: "derivOf", f: x => (a * x + b) ** n, dom: [[-2, 2]] }
        };
      }
      const a = v === "sin" ? r.nz(-3, 3) : r.int(1, 4), b = v === "sin" ? r.int(-4, 4) : r.int(1, 9);
      const [U, UT] = sum([{ p: a, m: "x^2", t: "x^{2}" }, { p: b }]), u = x => a * x * x + b;
      if (v === "sin") return {
        prompt: `Derivá $f(x) = \\sin(${UT})$.`,
        lhs: "f'(x) = ", answer: `${2 * a}*x*cos(${U})`, answerTex: `${H.cf(2 * a)}x\\cos(${UT})`, vars: ["x"],
        traps: [{ expr: `cos(${U})`, msg: inner }],
        solution: [`[[regla-cadena|Regla de la cadena]] con $u = ${UT}$: $(\\sin u)' = \\cos u\\cdot u'$ y $u' = ${H.cf(2 * a)}x$.`, `$f'(x) = ${H.cf(2 * a)}x\\cos(${UT})$`],
        verify: { kind: "derivOf", f: x => Math.sin(u(x)), dom: [[-2, 2]] }
      };
      if (v === "ln") return {
        prompt: `Derivá $f(x) = \\ln(${UT})$.`,
        lhs: "f'(x) = ", answer: `${2 * a}*x/(${U})`, answerTex: `\\dfrac{${H.cf(2 * a)}x}{${UT}}`, vars: ["x"],
        traps: [{ expr: `1/(${U})`, msg: inner }],
        solution: [`[[regla-cadena|Regla de la cadena]] con $u = ${UT}$: $(\\ln u)' = \\dfrac{u'}{u}$ y $u' = ${H.cf(2 * a)}x$.`, `$f'(x) = \\dfrac{${H.cf(2 * a)}x}{${UT}}$`],
        verify: { kind: "derivOf", f: x => Math.log(u(x)), dom: [[-2, 2]] }
      };
      return {
        prompt: `Derivá $f(x) = \\sqrt{${UT}}$.`,
        lhs: "f'(x) = ", answer: `${a}*x/sqrt(${U})`, answerTex: `\\dfrac{${H.cf(a)}x}{\\sqrt{${UT}}}`, vars: ["x"],
        traps: [{ expr: `1/(2*sqrt(${U}))`, msg: inner }],
        solution: [`[[regla-cadena|Regla de la cadena]] con $u = ${UT}$: $(\\sqrt u)' = \\dfrac{u'}{2\\sqrt u}$ y $u' = ${H.cf(2 * a)}x$.`, `$f'(x) = \\dfrac{${H.cf(2 * a)}x}{2\\sqrt{${UT}}} = \\dfrac{${H.cf(a)}x}{\\sqrt{${UT}}}$`],
        verify: { kind: "derivOf", f: x => Math.sqrt(u(x)), dom: [[-2, 2]] }
      };
    }
  };

  /* ---------- primitivas ---------- */
  T["anti-expr"] = {
    type: "expr", concepts: ["antiderivada"], difficulty: 1,
    generate(r) {
      const n = r.int(1, 4), a = r.nz(-6, 6), b = r.nz(-5, 5), c = r.nz(-6, 6), extra = r.pick(["cos", "sin", "exp", "inv"]);
      const B = Math.abs(b), sb = Math.sign(b);
      const ex = {
        cos: { f: [{ p: b, m: "cos(x)", t: "\\cos x" }], F: [{ p: b, m: "sin(x)", t: "\\sin x" }], fn: x => b * Math.cos(x), d: "$\\int\\cos x\\,dx = \\sin x$" },
        sin: { f: [{ p: b, m: "sin(x)", t: "\\sin x" }], F: [{ p: -b, m: "cos(x)", t: "\\cos x" }], fn: x => b * Math.sin(x), d: "$\\int\\sin x\\,dx = -\\cos x$" },
        exp: { f: [{ p: b, m: "exp(x)", t: "e^{x}" }], F: [{ p: b, m: "exp(x)", t: "e^{x}" }], fn: x => b * Math.exp(x), d: "$\\int e^x\\,dx = e^x$" },
        inv: { f: [{ p: sb, m: `${B}/x`, t: `\\frac{${B}}{x}` }], F: [{ p: b, m: "ln(x)", t: "\\ln x" }], fn: x => b / x, d: "$\\int \\frac{dx}{x} = \\ln|x|$ (acá $x > 0$)" }
      }[extra];
      const f = [{ p: a, ...xp(n) }, ...ex.f, { p: c }], F = [{ p: a, q: n + 1, ...xp(n + 1) }, ...ex.F, { p: c, m: "x", t: "x" }];
      const [, fT] = sum(f), [ans, FT] = sum(F);
      const dom = [extra === "inv" ? [0.3, 3] : [-2, 2]];
      const traps = [{ expr: sum([{ p: a, ...xp(n + 1) }, ...ex.F, { p: c, m: "x", t: "x" }])[0], msg: "Al subir el exponente hay que dividir por el exponente nuevo: $\\int x^n\\,dx = \\frac{x^{n+1}}{n+1}$." },
        { expr: sum([{ p: a * n, ...xp(n - 1) }, ...{ cos: [{ p: -b, m: "sin(x)" }], sin: [{ p: b, m: "cos(x)" }], exp: [{ p: b, m: "exp(x)" }], inv: [{ p: -b, m: "1/x^2" }] }[extra]])[0], msg: "Eso es la derivada de $f$, no una primitiva: buscás una $F$ con $F' = f$." }];
      if (extra === "sin") traps.push({ expr: sum([{ p: a, q: n + 1, ...xp(n + 1) }, { p: b, m: "cos(x)" }, { p: c, m: "x" }])[0], msg: "Ojo con el signo: $\\int\\sin x\\,dx = -\\cos x$, porque $(-\\cos x)' = \\sin x$." });
      return {
        prompt: `Encontrá una primitiva de $f(x) = ${fT}$, es decir, una $F$ con $F'(x) = f(x)$.`,
        lhs: "F(x) = ", answer: ans, answerTex: FT, vars: ["x"], domain: dom, constant: true, traps,
        solution: [
          `Se integra término a término ([[antiderivada|primitivas inmediatas]]): $\\int x^n\\,dx = \\dfrac{x^{n+1}}{n+1}$, ${ex.d} y $\\int k\\,dx = kx$.`,
          `$F(x) = ${FT} + C$`, `Comprobación: al derivar $F$ vuelve a salir $f$.`
        ],
        verify: { kind: "primOf", f: x => a * x ** n + ex.fn(x) + c, dom }
      };
    }
  };
  T["sust-expr"] = {
    type: "expr", concepts: ["int-sustitucion"], difficulty: 2,
    generate(r) {
      const v = r.pick(["exp", "cos", "ln", "pot"]);
      if (v === "exp" || v === "cos") {
        const a = v === "exp" ? r.pick([1, 2, 3, -1, -2]) : r.pick([1, 2, 3]), c = r.pick([1, 2, 3, 4, 6]);
        const aT = H.cf(a) + "x^{2}", co = H.frac(c, 2 * a), coS = `(${c}/${2 * a})`;
        const fx = v === "exp" ? x => c * x * Math.exp(a * x * x) : x => c * x * Math.cos(a * x * x);
        return {
          prompt: `Calculá $\\displaystyle\\int ${c === 1 ? "" : c}x\\,${v === "exp" ? `e^{${aT}}` : `\\cos(${aT})`}\\,dx$.`,
          lhs: "", answer: v === "exp" ? `${coS}*exp(${a}*x^2)` : `${coS}*sin(${a}*x^2)`, answerTex: `${co1(co)}${v === "exp" ? `e^{${aT}}` : `\\sin(${aT})`}`,
          vars: ["x"], domain: [[-1.5, 1.5]], constant: true,
          solution: [
            `[[int-sustitucion|Sustitución]] $u = ${aT}$, $du = ${2 * a}x\\,dx$, así que $x\\,dx = \\dfrac{du}{${2 * a}}$.`,
            `$\\displaystyle\\int ${c === 1 ? "" : c}x\\,${v === "exp" ? `e^{${aT}}` : `\\cos(${aT})`}\\,dx = ${co1(co)}\\int ${v === "exp" ? "e^{u}" : "\\cos u"}\\,du = ${co1(co)}\\,${v === "exp" ? `e^{${aT}}` : `\\sin(${aT})`} + C$`
          ],
          verify: { kind: "primOf", f: fx, dom: [[-1.5, 1.5]] }
        };
      }
      if (v === "ln") {
        const a = r.int(1, 3), b = r.int(-4, 4), d = Math.floor(b * b / (4 * a)) + r.int(1, 4);
        const [Q, QT] = sum([{ p: a, m: "x^2", t: "x^{2}" }, { p: b, m: "x", t: "x" }, { p: d }]), [, DT] = sum([{ p: 2 * a, m: "x", t: "x" }, { p: b }]);
        return {
          prompt: `Calculá $\\displaystyle\\int \\frac{${DT}}{${QT}}\\,dx$.`,
          lhs: "", answer: `ln(${Q})`, answerTex: `\\ln(${QT})`, vars: ["x"], domain: [[-1.5, 1.5]], constant: true,
          solution: [`El numerador es la derivada del denominador: [[int-sustitucion|sustitución]] $u = ${QT}$, $du = (${DT})\\,dx$.`, `$\\displaystyle\\int\\frac{du}{u} = \\ln|u| + C = \\ln(${QT}) + C$ (el denominador siempre es positivo).`],
          verify: { kind: "primOf", f: x => (2 * a * x + b) / (a * x * x + b * x + d), dom: [[-1.5, 1.5]] }
        };
      }
      const a = r.pick([2, 3, 4, -2]), b = r.nz(-4, 4), n = r.int(2, 5), c = r.pick([1, 2, 3, 6]);
      const [U, UT] = sum([{ p: a, m: "x", t: "x" }, { p: b }]), co = H.frac(c, a * (n + 1));
      return {
        prompt: `Calculá $\\displaystyle\\int ${c === 1 ? "" : c}(${UT})^{${n}}\\,dx$.`,
        lhs: "", answer: `(${c}/${a * (n + 1)})*(${U})^${n + 1}`, answerTex: `${co}(${UT})^{${n + 1}}`, vars: ["x"], domain: [[-1.5, 1.5]], constant: true,
        solution: [`[[int-sustitucion|Sustitución]] $u = ${UT}$, $du = ${a}\\,dx$.`, `$\\displaystyle\\int ${c === 1 ? "" : c}u^{${n}}\\,\\frac{du}{${a}} = ${H.frac(c, a)}\\cdot\\frac{u^{${n + 1}}}{${n + 1}} + C = ${co}(${UT})^{${n + 1}} + C$`],
        verify: { kind: "primOf", f: x => c * (a * x + b) ** n, dom: [[-1.5, 1.5]] }
      };
    }
  };
  T["partes-expr"] = {
    type: "expr", concepts: ["int-partes"], difficulty: 2,
    generate(r) {
      const v = r.pick(["xexp", "xsin", "xcos", "ln"]), uv = "Te faltó restar la integral de $v\\,du$: $\\int u\\,dv = uv - \\int v\\,du$.";
      if (v === "ln") {
        const n = r.int(0, 3), m = n + 1, dom = [[0.3, 2.5]];
        const [ans, FT] = sum([{ p: 1, q: m, m: `${xp(m).m || "1"}*ln(x)`, t: `${xp(m).t}\\ln x` }, { p: -1, q: m * m, ...xp(m) }]);
        return {
          prompt: `Calculá $\\displaystyle\\int ${xp(n).t}\\ln x\\,dx$ (con $x > 0$).`,
          lhs: "", answer: ans, answerTex: FT, vars: ["x"], domain: dom, constant: true,
          traps: [{ expr: `${xp(m).m}*ln(x)/${m}`, msg: uv }],
          solution: [
            `[[int-partes|Por partes]] con $u = \\ln x$ (se simplifica al derivar) y $dv = ${xp(n).t || "1"}\\,dx$: $du = \\dfrac{dx}{x}$, $v = ${m === 1 ? "x" : `\\dfrac{x^{${m}}}{${m}}`}$.`,
            `$\\displaystyle\\int = ${m === 1 ? "x" : `\\frac{x^{${m}}}{${m}}`}\\ln x - \\int ${m === 1 ? "1" : `\\frac{${xp(n).t}}{${m}}`}\\,dx = ${FT} + C$`
          ],
          verify: { kind: "primOf", f: x => x ** n * Math.log(x), dom }
        };
      }
      const k = v === "xexp" ? r.pick([1, 2, 3, -1, -2]) : r.pick([1, 2, 3, 4]), K = kx(k), dom = [[-2, 2]];
      const E1 = v === "xexp" ? { m: `exp(${K.m})`, t: `e^{${K.t}}` } : v === "xsin" ? { m: `sin(${K.m})`, t: `\\sin(${K.t})` } : { m: `cos(${K.m})`, t: `\\cos(${K.t})` };
      // primitivas: x e^{kx}/k - e^{kx}/k² ; -x cos(kx)/k + sin(kx)/k² ; x sin(kx)/k + cos(kx)/k²
      const terms = v === "xexp" ? [{ p: 1, q: k, m: `x*${E1.m}`, t: `x\\,${E1.t}` }, { p: -1, q: k * k, ...E1 }]
        : v === "xsin" ? [{ p: -1, q: k, m: `x*cos(${K.m})`, t: `x\\cos(${K.t})` }, { p: 1, q: k * k, m: `sin(${K.m})`, t: `\\sin(${K.t})` }]
        : [{ p: 1, q: k, m: `x*sin(${K.m})`, t: `x\\sin(${K.t})` }, { p: 1, q: k * k, m: `cos(${K.m})`, t: `\\cos(${K.t})` }];
      const [ans, FT] = sum(terms), [first] = sum([terms[0]]);
      const vT = v === "xexp" ? `${co1(H.frac(1, k))}e^{${K.t}}` : v === "xsin" ? `-${co1(H.frac(1, k))}\\cos(${K.t})` : `${co1(H.frac(1, k))}\\sin(${K.t})`;
      const fx = v === "xexp" ? x => x * Math.exp(k * x) : v === "xsin" ? x => x * Math.sin(k * x) : x => x * Math.cos(k * x);
      return {
        prompt: `Calculá $\\displaystyle\\int x\\,${E1.t}\\,dx$.`,
        lhs: "", answer: ans, answerTex: FT, vars: ["x"], domain: dom, constant: true,
        traps: [{ expr: first, msg: uv }],
        solution: [
          `[[int-partes|Por partes]] con $u = x$ (se simplifica al derivar) y $dv = ${E1.t}\\,dx$: $du = dx$, $v = ${vT}$.`,
          `$\\displaystyle\\int x\\,${E1.t}\\,dx = uv - \\int v\\,du = ${FT} + C$`
        ],
        verify: { kind: "primOf", f: fx, dom }
      };
    }
  };

  /* ---------- ecuaciones diferenciales ---------- */
  T["edo-expr"] = {
    type: "expr", concepts: ["edo"], difficulty: 2,
    generate(r) {
      const v = r.pick(["exp", "gauss", "newton"]), dom = [[-1, 1.2]];
      if (v === "exp") {
        const k = r.nz(-3, 3), y0 = r.nz(-5, 5);
        return {
          prompt: `Resolvé $y' = ${H.cf(k)}y$ con $y(0) = ${y0}$.`,
          lhs: "y(x) = ", answer: `${y0}*exp(${k}*x)`, answerTex: `${H.cf(y0)}e^{${H.kx(k)}}`, vars: ["x"], domain: dom,
          solution: [`[[edo|Separando variables]]: $\\dfrac{dy}{y} = ${k}\\,dx$, así que $\\ln|y| = ${H.kx(k)} + C$ y $y = A\\,e^{${H.kx(k)}}$.`, `La condición inicial da $A = y(0) = ${y0}$: $y(x) = ${H.cf(y0)}e^{${H.kx(k)}}$.`],
          verify: { kind: "fnEq", g: rk4((x, y) => k * y, y0), dom }
        };
      }
      if (v === "gauss") {
        const k = r.pick([-4, -2, -1, 1, 2, 4]), y0 = r.nz(-5, 5), co = H.frac(k, 2);
        return {
          prompt: `Resolvé $y' = ${H.cf(k)}x\\,y$ con $y(0) = ${y0}$.`,
          lhs: "y(x) = ", answer: `${y0}*exp(${k}*x^2/2)`, answerTex: `${H.cf(y0)}e^{${co1(co)}x^{2}}`, vars: ["x"], domain: dom,
          solution: [`[[edo|Separando variables]]: $\\dfrac{dy}{y} = ${k}x\\,dx$, así que $\\ln|y| = ${co1(co)}x^{2} + C$ y $y = A\\,e^{${co1(co)}x^{2}}$.`, `Con $y(0) = ${y0}$ queda $A = ${y0}$.`],
          verify: { kind: "fnEq", g: rk4((x, y) => k * x * y, y0), dom }
        };
      }
      const k = r.int(1, 3), M = r.int(1, 9), y0 = r.int(0, 12);
      if (y0 === M) return null;
      return {
        prompt: `Resolvé $y' = ${H.cf(k)}(${M} - y)$ con $y(0) = ${y0}$ (como la ley de enfriamiento de Newton).`,
        lhs: "y(x) = ", answer: `${M} + (${y0 - M})*exp(${-k}*x)`, answerTex: `${M} ${y0 - M < 0 ? "-" : "+"} ${Math.abs(y0 - M) === 1 ? "" : Math.abs(y0 - M)}e^{${H.kx(-k)}}`, vars: ["x"], domain: dom,
        traps: [{ expr: `${M} + (${y0 - M})*exp(${k}*x)`, msg: `La solución tiene que acercarse a $${M}$ cuando $x$ crece: el exponente es $${H.kx(-k)}$, no $${H.kx(k)}$.` }],
        solution: [`[[edo|Separando variables]]: $\\dfrac{dy}{${M} - y} = ${k}\\,dx$, así que $-\\ln|${M} - y| = ${H.kx(k)} + C$ y $y = ${M} + A\\,e^{${H.kx(-k)}}$.`, `Con $y(0) = ${y0}$: $A = ${y0} - ${M} = ${y0 - M}$.`],
        verify: { kind: "fnEq", g: rk4((x, y) => k * (M - y), y0), dom }
      };
    }
  };

  /* ---------- paso a paso ---------- */
  T["optim-multi"] = {
    type: "multi", concepts: ["optimizacion"], difficulty: 3,
    generate(r) {
      if (r.bool()) {
        const L = r.pick([40, 60, 80, 100, 120, 200]), A = x => shoelace([[0, 0], [L - 2 * x, 0], [L - 2 * x, x], [0, x]]), xs = argmax(A, 0, L / 2);
        return {
          prompt: `Con $${L}$ m de alambre se quiere cercar un terreno rectangular contra una pared recta, que hace de cuarto lado. Llamá $x$ al largo de los dos lados perpendiculares a la pared.`,
          parts: [
            { q: "Escribí el área del terreno en función de $x$.", type: "expr", vars: ["x"], lhs: "A(x) = ", answer: `x*(${L} - 2*x)`, answerTex: `x(${L} - 2x)`, domain: [[0, L / 2]],
              traps: [{ expr: `x*(${L} - x)`, msg: `El alambre cubre tres lados: dos de largo $x$ y el paralelo a la pared, de largo $${L} - 2x$.` }],
              verify: { kind: "fnEq", g: A, dom: [[0, L / 2]] } },
            { q: "¿Para qué $x$ (en m) el área es máxima?", type: "numeric", answer: L / 4, verify: { kind: "value", fn: () => xs } },
            { q: "¿Cuál es el área máxima (en m²)?", type: "numeric", answer: L * L / 8, verify: { kind: "value", fn: () => A(xs) } }
          ],
          solution: [
            `El lado paralelo a la pared mide $${L} - 2x$, así que $A(x) = x(${L} - 2x) = ${L}x - 2x^{2}$, con $0 < x < ${L / 2}$.`,
            `[[optimizacion|Punto crítico]]: $A'(x) = ${L} - 4x = 0$ da $x = ${H.num(L / 4)}$ m. Como $A'' = -4 < 0$, es un máximo.`,
            `$A_{\\text{máx}} =${H.num(L / 4)}\\cdot ${H.num(L / 2)} = ${H.num(L * L / 8)}$ m².`
          ]
        };
      }
      const a = r.pick([12, 18, 24, 30, 36, 60]), V = x => shoelace([[0, 0], [a - 2 * x, 0], [a - 2 * x, a - 2 * x], [0, a - 2 * x]]) * x, xs = argmax(V, 0, a / 2);
      return {
        prompt: `De una lámina cuadrada de cartón de $${a}$ cm de lado se recorta un cuadrado de lado $x$ en cada esquina y se doblan los bordes para armar una caja sin tapa.`,
        parts: [
          { q: "Escribí el volumen de la caja en función de $x$.", type: "expr", vars: ["x"], lhs: "V(x) = ", answer: `x*(${a} - 2*x)^2`, answerTex: `x(${a} - 2x)^{2}`, domain: [[0, a / 2]],
            traps: [{ expr: `x*(${a} - x)^2`, msg: "Al recortar un cuadrado en cada esquina, cada lado del fondo pierde $2x$, no $x$." }],
            verify: { kind: "fnEq", g: V, dom: [[0, a / 2]] } },
          { q: "¿Para qué $x$ (en cm) el volumen es máximo?", type: "numeric", answer: a / 6,
            traps: [{ value: a / 2, msg: "Ese valor anula $V'$, pero ahí la caja tiene volumen cero: es un mínimo. El máximo está en el otro punto crítico." }],
            verify: { kind: "value", fn: () => xs } },
          { q: "¿Cuál es el volumen máximo (en cm³)?", type: "numeric", answer: 2 * a ** 3 / 27, verify: { kind: "value", fn: () => V(xs) } }
        ],
        solution: [
          `El fondo es un cuadrado de lado $${a} - 2x$ y la altura es $x$: $V(x) = x(${a} - 2x)^{2}$, con $0 < x < ${a / 2}$.`,
          `[[optimizacion|Puntos críticos]], con la regla del producto: $V'(x) = (${a} - 2x)^{2} - 4x(${a} - 2x)$.`,
          `Sacando factor común, $V'(x) = (${a} - 2x)(${a} - 6x)$, que se anula en $x = ${a / 2}$ (volumen cero) y en $x = ${a / 6}$.`,
          `$V(${a / 6}) = ${a / 6}\\cdot ${2 * a / 3}^{2} = ${H.num(2 * a ** 3 / 27)}$ cm³.`
        ]
      };
    }
  };
  T["area-multi"] = {
    type: "multi", concepts: ["area-curvas"], difficulty: 2,
    generate(r) {
      const [p, q] = r.distinct(2, -3, 4).sort((x, y) => x - y), m = r.int(-3, 3), b = r.int(-4, 4);
      const f = x => m * x + b - (x - p) * (x - q), g = x => m * x + b;
      const F = H.polyc([-1, p + q + m, b - p * q]), G = H.poly([[m, "x"], [b, ""]]), A = (q - p) ** 3 / 6;
      return {
        prompt: `Considerá la parábola $f(x) = ${F}$ y la recta $g(x) = ${G}$.`,
        parts: [
          { q: "¿En qué $x$ se cortan? Escribí el punto de corte de la izquierda.", type: "numeric", answer: p, verify: { kind: "zero", fn: x => f(x) - g(x) } },
          { q: "¿Y el de la derecha?", type: "numeric", answer: q, verify: { kind: "zero", fn: x => f(x) - g(x) } },
          { q: "¿Cuál es el área de la región encerrada entre las dos curvas?", type: "numeric", answer: A, answerTex: H.frac((q - p) ** 3, 6),
            traps: [{ value: -A, msg: "El área no puede ser negativa: integrá la de arriba menos la de abajo. Entre los cortes, la parábola queda arriba." }],
            verify: { kind: "integral", f: x => Math.abs(f(x) - g(x)), a: p, b: q } }
        ],
        solution: [
          `Igualando: $f(x) - g(x) = ${H.polyc([-1, p + q, -p * q])} = -(${H.xm(p)})(${H.xm(q)}) = 0$, así que $x = ${p}$ y $x = ${q}$.`,
          `Entre los cortes $f - g \\ge 0$: la parábola queda arriba. [[area-curvas|El área]] es $\\displaystyle\\int_{${p}}^{${q}} -(${H.xm(p)})(${H.xm(q)})\\,dx$.`,
          `$= \\dfrac{(${q} - ${H.par(p)})^{3}}{6} = ${H.frac((q - p) ** 3, 6)}$`
        ]
      };
    }
  };

  E.addPractice("m101", {
    templates: T,
    lessons: {
      "der-basicas": ["der-reglas-expr"], "der-prodcoc": ["der-prodcoc-expr"], "der-cadena": ["der-cadena-expr"],
      "antiderivadas": ["anti-expr"], "sustitucion": ["sust-expr"], "partes": ["partes-expr"], "edo": ["edo-expr"],
      "optimizacion": ["optim-multi"], "areas": ["area-multi"]
    }
  });
})();
