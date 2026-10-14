/*
 * Curso: Cálculo en una variable
 * --------------------------------
 * Solo datos y generadores. Para agregar contenido:
 *   1. Definí los conceptos nuevos en `concepts` (son la unidad de repetición espaciada).
 *   2. Escribí plantillas en `T` (cada una devuelve una instancia a partir de un RNG con semilla).
 *   3. Agregá una lección en `units` que liste las plantillas.
 *
 * Una plantilla:  { type, concepts: [...], difficulty: 1-3, generate(r, H) -> instancia | null }
 *   - devolver null = "estos valores no sirven, generá otros".
 *   - `verify` es opcional y solo lo usan los tests automáticos (tests/run-tests.mjs)
 *     para comprobar numéricamente que la respuesta es correcta.
 *
 * Todos los enunciados son originales.
 */
(function () {
  const E = window.Efecen, H = E.H;
  const { frac, num, poly, polyc, xp, xm, cf, kx, par, sg } = H;
  const T = {};

  // función a trozos en LaTeX
  const cases = (a, left, right, leftOp = "<", rightOp = "\\ge") =>
    `f(x)=\\begin{cases} ${left} & \\text{si } x ${leftOp} ${a} \\\\ ${right} & \\text{si } x ${rightOp} ${a} \\end{cases}`;

  /* =====================================================================
   *  UNIDAD 1 · LÍMITES Y CONTINUIDAD
   * ===================================================================== */

  // 1 · Leer límites en un gráfico
  T["lim-grafico-mc"] = {
    type: "mc", concepts: ["lim-grafico"], difficulty: 1,
    generate(r) {
      const a = r.int(-2, 2), L1 = r.int(-3, 3);
      const m1 = r.pick([-1, -0.5, 0.5, 1]), m2 = r.pick([-1, -0.5, 0.5, 1]);
      const NE = "\\text{No existe}";
      if (r.bool(0.4)) {
        // hueco: el límite existe pero no coincide con f(a)
        let P; do P = r.int(-3, 3); while (P === L1);
        const ask = r.pick(["", "^{-}", "^{+}"]);
        return {
          prompt: `Mirando el gráfico de $f$, ¿cuánto vale $\\displaystyle\\lim_{x\\to ${a}${ask}} f(x)$?`,
          graph: { pieces: [{ f: x => L1 + m1 * (x - a) }], points: [{ x: a, y: L1, open: true }, { x: a, y: P }], xr: [-5, 5], yr: [-5, 5] },
          ...H.mc(r, String(L1), [String(P), NE, String(L1 + 1), String(L1 - 1)], { fallback: [String(L1 + 2), String(-L1)] }),
          solution: [
            `Cuando $x$ se acerca a $${a}$ (por izquierda y por derecha) la curva se acerca a la altura $${L1}$.`,
            `El punto lleno en $(${a}, ${P})$ indica que $f(${a}) = ${P}$, pero el límite no depende del valor en el punto.`,
            `Entonces el límite vale $${L1}$.`
          ]
        };
      }
      // salto
      let L2; do L2 = r.int(-3, 3); while (L2 === L1);
      const closedLeft = r.bool();
      const fa = closedLeft ? L1 : L2;
      const ask = r.pick(["^{-}", "^{+}", ""]);
      const correct = ask === "^{-}" ? String(L1) : ask === "^{+}" ? String(L2) : NE;
      return {
        prompt: `Mirando el gráfico de $f$, ¿cuánto vale $\\displaystyle\\lim_{x\\to ${a}${ask}} f(x)$?`,
        graph: {
          pieces: [{ f: x => L1 + m1 * (x - a), to: a }, { f: x => L2 + m2 * (x - a), from: a }],
          points: [{ x: a, y: L1, open: !closedLeft }, { x: a, y: L2, open: closedLeft }], xr: [-5, 5], yr: [-5, 5]
        },
        ...H.mc(r, correct, [String(L1), String(L2), NE, String(L1 + L2)].filter(x => x !== correct), { fallback: ["0", "1", "-1", "2", "-2"] }),
        solution: [
          `Por izquierda, la curva se acerca a $${L1}$: $\\lim_{x\\to ${a}^-} f(x) = ${L1}$.`,
          `Por derecha, se acerca a $${L2}$: $\\lim_{x\\to ${a}^+} f(x) = ${L2}$.`,
          ask === "" ? `Como los límites laterales son distintos, el límite (bilateral) no existe.` : `Lo que pedía era el límite ${ask === "^{-}" ? "por izquierda" : "por derecha"}: $${correct}$. (Y $f(${a}) = ${fa}$, que no importa para el límite.)`
        ]
      };
    }
  };

  // 2 · Sustitución directa
  T["lim-sust-num"] = {
    type: "numeric", concepts: ["lim-sustitucion"], difficulty: 1,
    generate(r) {
      const b = r.nz(-3, 3), c = r.int(-5, 5), d = r.nz(-4, 4), a = r.int(-3, 3);
      if (a + d === 0) return null;
      const n = b * a * a + c, den = a + d;
      return {
        prompt: `Calculá $$\\lim_{x\\to ${a}} \\frac{${polyc([b, 0, c])}}{${polyc([1, d])}}$$`,
        answer: n / den, answerTex: frac(n, den),
        solution: [
          `En $x = ${a}$ el denominador vale $${a}${sg(d)} = ${den} \\neq 0$, así que la función es continua ahí: alcanza con sustituir.`,
          `$\\dfrac{${b === 1 ? "" : b === -1 ? "-" : b + "\\cdot "}${par(a)}^2${sg(c)}}{${den}} = \\dfrac{${n}}{${den}} = ${frac(n, den)}$`
        ],
        verify: { kind: "limit", f: x => (b * x * x + c) / (x + d), a }
      };
    }
  };

  // 3 · Límites laterales de una función a trozos
  const piecewise = (r, forceEqual) => {
    const a = r.int(-2, 2), m1 = r.nz(-3, 3), b1 = r.int(-4, 4), c2 = r.nz(-2, 2);
    let b2 = r.int(-4, 4);
    const Lm = m1 * a + b1;
    if (forceEqual === true) b2 = Lm - c2 * a * a;
    if (forceEqual === false && c2 * a * a + b2 === Lm) b2 += 1;
    const Lp = c2 * a * a + b2;
    return { a, m1, b1, c2, b2, Lm, Lp, tex: cases(a, polyc([m1, b1]), polyc([c2, 0, b2])) };
  };
  T["lim-lateral-num"] = {
    type: "numeric", concepts: ["lim-laterales"], difficulty: 1,
    generate(r) {
      const p = piecewise(r), side = r.pick(["-", "+"]);
      const ans = side === "-" ? p.Lm : p.Lp;
      return {
        prompt: `Sea $$${p.tex}$$ Calculá $\\displaystyle\\lim_{x\\to ${p.a}^{${side}}} f(x)$.`,
        answer: ans,
        solution: side === "-"
          ? [`Para $x < ${p.a}$ vale la primera fórmula: $f(x) = ${polyc([p.m1, p.b1])}$.`, `Es un polinomio, así que sustituimos: $${p.m1 === 1 ? "" : p.m1 === -1 ? "-" : p.m1 + "\\cdot"}${par(p.a)}${sg(p.b1)} = ${p.Lm}$.`]
          : [`Para $x > ${p.a}$ vale la segunda fórmula: $f(x) = ${polyc([p.c2, 0, p.b2])}$.`, `Sustituimos: $${p.c2 === 1 ? "" : p.c2 === -1 ? "-" : p.c2 + "\\cdot"}${par(p.a)}^2${sg(p.b2)} = ${p.Lp}$.`],
        verify: { kind: "limit", side, a: p.a, f: x => (x < p.a ? p.m1 * x + p.b1 : p.c2 * x * x + p.b2) }
      };
    }
  };
  T["lim-existe-vf"] = {
    type: "tf", concepts: ["lim-laterales"], difficulty: 1,
    generate(r) {
      const p = piecewise(r, r.bool());
      const eq = p.Lm === p.Lp;
      return {
        prompt: `Sea $$${p.tex}$$ <b>Verdadero o falso:</b> existe $\\displaystyle\\lim_{x\\to ${p.a}} f(x)$.`,
        answer: eq,
        explanation: eq
          ? `Los dos límites laterales valen $${p.Lm}$, así que el límite existe y vale $${p.Lm}$.`
          : `Los límites laterales son distintos ($${p.Lm}$ y $${p.Lp}$), así que el límite no existe.`,
        solution: [
          `Por izquierda: $\\lim_{x\\to ${p.a}^-} f(x) = ${H.psub([p.m1, p.b1], p.a)} = ${p.Lm}$.`,
          `Por derecha: $\\lim_{x\\to ${p.a}^+} f(x) = ${p.Lp}$.`,
          `El límite existe si y solo si los laterales coinciden.`
        ]
      };
    }
  };

  // 4 · Indeterminación 0/0 por factorización
  T["lim-factor-num"] = {
    type: "numeric", concepts: ["lim-factorizar"], difficulty: 2,
    generate(r) {
      const [p, s, t] = r.distinct(3, -4, 4);
      const numC = [1, -(p + s), p * s], denC = [1, -(p + t), p * t];
      return {
        prompt: `Calculá $$\\lim_{x\\to ${p}} \\frac{${polyc(numC)}}{${polyc(denC)}}$$`,
        answer: (p - s) / (p - t), answerTex: frac(p - s, p - t),
        solution: [
          `Sustituyendo $x = ${p}$ numerador y denominador dan $0$: indeterminación $\\frac{0}{0}$.`,
          `Entonces $x = ${p}$ es raíz de los dos. Factorizamos: $\\dfrac{(${xm(p)})(${xm(s)})}{(${xm(p)})(${xm(t)})}$.`,
          `Para $x \\neq ${p}$ simplificamos: $\\dfrac{${xm(s)}}{${xm(t)}}$.`,
          `Ahora sí sustituimos: $\\dfrac{${p}${sg(-s)}}{${p}${sg(-t)}} = ${frac(p - s, p - t)}$.`
        ],
        verify: { kind: "limit", a: p, f: x => H.peval(numC, x) / H.peval(denC, x) }
      };
    }
  };

  // 5 · Conjugado
  const conjParams = r => {
    const c = r.int(1, 4), k = r.pick([1, 2, 3]), a = r.int(-3, 4), b = c * c - k * a;
    return { c, k, a, b, inner: polyc([k, b]) };
  };
  T["lim-conj-num"] = {
    type: "numeric", concepts: ["lim-conjugado"], difficulty: 2,
    generate(r) {
      const { c, k, a, b, inner } = conjParams(r);
      return {
        prompt: `Calculá $$\\lim_{x\\to ${a}} \\frac{\\sqrt{${inner}} - ${c}}{${xm(a)}}$$`,
        answer: k / (2 * c), answerTex: frac(k, 2 * c),
        solution: [
          `En $x = ${a}$: $\\sqrt{${k * a + b}} - ${c} = 0$ y el denominador también: $\\frac{0}{0}$.`,
          `Multiplicamos y dividimos por el conjugado $\\sqrt{${inner}} + ${c}$.`,
          `Numerador: $(${inner}) - ${c * c} = ${polyc([k, b - c * c])}${k === 1 ? "" : ` = ${k}(${xm(a)})`}$.`,
          `Simplificamos $(${xm(a)})$: queda $\\dfrac{${k}}{\\sqrt{${inner}} + ${c}}$.`,
          `Sustituimos: $\\dfrac{${k}}{${c} + ${c}} = ${frac(k, 2 * c)}$.`
        ],
        verify: { kind: "limit", a, f: x => (Math.sqrt(k * x + b) - c) / (x - a) }
      };
    }
  };
  T["lim-order-conj"] = {
    type: "order", concepts: ["lim-conjugado"], difficulty: 2,
    generate(r) {
      const { c, k, a, inner } = conjParams(r);
      return {
        prompt: `Ordená los pasos para calcular $$\\lim_{x\\to ${a}} \\frac{\\sqrt{${inner}} - ${c}}{${xm(a)}}$$`,
        steps: [
          `Sustituir $x=${a}$: da $\\frac{0}{0}$, hay que transformar la expresión.`,
          `Multiplicar numerador y denominador por $\\sqrt{${inner}} + ${c}$.`,
          `Usar $(A-B)(A+B) = A^2 - B^2$: el numerador queda $${k === 1 ? "" : k}(${xm(a)})$.`,
          `Cancelar $(${xm(a)})$: queda $\\frac{${k}}{\\sqrt{${inner}} + ${c}}$.`,
          `Sustituir $x = ${a}$: el límite vale $${frac(k, 2 * c)}$.`
        ],
        solution: [`Idea clave: el conjugado elimina la raíz del numerador y hace aparecer el factor $(${xm(a)})$ que se cancela con el denominador.`]
      };
    }
  };

  // 6 · Encontrá el error (factorización)
  T["lim-error-factor"] = {
    type: "error", concepts: ["lim-factorizar"], difficulty: 2,
    generate(r) {
      const [p, s] = r.distinct(2, -5, 5, { nonzero: true });
      const P = polyc([1, -(p + s), p * s]);
      const kind = r.pick(["factor", "cancel", "eval"]);
      const ok = [
        `Sustituyendo $x = ${p}$ queda $\\frac{0}{0}$: hay que simplificar.`,
        `Factorizamos el numerador: $${P} = (${xm(p)})(${xm(s)})$.`,
        `Simplificamos: $\\dfrac{(${xm(p)})(${xm(s)})}{${xm(p)}} = ${xm(s)}$ para $x\\neq ${p}$.`,
        `Entonces el límite es $${p}${sg(-s)} = ${p - s}$.`
      ];
      const steps = ok.slice();
      let wrongIndex, fix;
      if (kind === "factor") {
        wrongIndex = 1;
        steps[1] = `Factorizamos el numerador: $${P} = (${xm(p)})(${xm(-s)})$.`;
        steps[2] = `Simplificamos: $\\dfrac{(${xm(p)})(${xm(-s)})}{${xm(p)}} = ${xm(-s)}$ para $x\\neq ${p}$.`;
        steps[3] = `Entonces el límite es $${p}${sg(s)} = ${p + s}$.`;
        fix = `Las raíces del numerador son $${p}$ y $${s}$, así que $${P} = (${xm(p)})(${xm(s)})$.`;
      } else if (kind === "cancel") {
        wrongIndex = 2;
        steps[2] = `Simplificamos: $\\dfrac{(${xm(p)})(${xm(s)})}{${xm(p)}} = ${xm(p)}$ para $x\\neq ${p}$.`;
        steps[3] = `Entonces el límite es $${p} - ${par(p)} = 0$.`;
        fix = `Al cancelar $(${xm(p)})$ arriba y abajo queda el otro factor: $${xm(s)}$.`;
      } else {
        wrongIndex = 3;
        const wrong = p + s !== p - s ? p + s : p - s + 1;
        steps[3] = `Entonces el límite es $${p}${sg(-s)} = ${wrong}$.`;
        fix = `La cuenta da $${p}${sg(-s)} = ${p - s}$.`;
      }
      return {
        prompt: `Alguien calculó $\\displaystyle\\lim_{x\\to ${p}} \\frac{${P}}{${xm(p)}}$ así. <b>Tocá el primer paso incorrecto.</b>`,
        steps, wrongIndex, fix,
        solution: ok
      };
    }
  };

  // 7 · Límites trigonométricos
  T["lim-sin-num"] = {
    type: "numeric", concepts: ["lim-trig"], difficulty: 2,
    generate(r) {
      const [a, b] = r.distinct(2, 1, 7);
      const v = r.pick(["sin/x", "tan/x", "sin/sin", "tan/sin"]);
      const top = v.startsWith("sin") ? `\\sin(${kx(a)})` : `\\tan(${kx(a)})`;
      const bot = v.endsWith("/x") ? kx(b) : `\\sin(${kx(b)})`;
      const fTop = v.startsWith("sin") ? x => Math.sin(a * x) : x => Math.tan(a * x);
      const fBot = v.endsWith("/x") ? x => b * x : x => Math.sin(b * x);
      const sol = [`Usamos el límite notable $\\displaystyle\\lim_{u\\to 0} \\frac{\\sin u}{u} = 1$${v.startsWith("tan") ? " y que $\\tan u = \\frac{\\sin u}{\\cos u}$ con $\\cos u \\to 1$" : ""}.`];
      sol.push(v.endsWith("/x")
        ? `Reescribimos: $\\dfrac{${top}}{${kx(b)}} = \\dfrac{${top}}{${kx(a)}} \\cdot \\dfrac{${kx(a)}}{${kx(b)}}$.`
        : `Reescribimos: $\\dfrac{${top}}{${kx(a)}} \\cdot \\dfrac{${kx(b)}}{\\sin(${kx(b)})} \\cdot \\dfrac{${kx(a)}}{${kx(b)}}$.`);
      sol.push(`Los cocientes notables tienden a $1$; queda $\\dfrac{${a}}{${b}} = ${frac(a, b)}$.`);
      return {
        prompt: `Calculá $$\\lim_{x\\to 0} \\frac{${top}}{${bot}}$$`,
        answer: a / b, answerTex: frac(a, b), solution: sol,
        verify: { kind: "limit", a: 0, f: x => fTop(x) / fBot(x) }
      };
    }
  };
  T["lim-1cos-num"] = {
    type: "numeric", concepts: ["lim-trig"], difficulty: 3,
    generate(r) {
      const a = r.int(1, 5), b = r.int(1, 4);
      return {
        prompt: `Calculá $$\\lim_{x\\to 0} \\frac{1 - \\cos(${kx(a)})}{${H.term(b, "x^{2}", true)}}$$`,
        answer: (a * a) / (2 * b), answerTex: frac(a * a, 2 * b),
        solution: [
          `Como en el [[lim-1-cos|límite notable de 1 − cos]], multiplicamos y dividimos por $1 + \\cos(${kx(a)})$: el numerador queda $1 - \\cos^2(${kx(a)}) = \\sin^2(${kx(a)})$.`,
          `Reescribimos: $\\left(\\dfrac{\\sin(${kx(a)})}{${kx(a)}}\\right)^2 \\cdot \\dfrac{${a * a}}{${b === 1 ? "" : b + "\\,"}(1+\\cos(${kx(a)}))}$.`,
          `El primer factor tiende a $1$ y $1 + \\cos(${kx(a)}) \\to 2$.`,
          `Resultado: $\\dfrac{${a * a}}{${2 * b}} = ${frac(a * a, 2 * b)}$.`
        ],
        verify: { kind: "limit", a: 0, f: x => (1 - Math.cos(a * x)) / (b * x * x), h: 1e-3 }
      };
    }
  };

  // 8 · Límites al infinito
  T["lim-inf-cociente-num"] = {
    type: "numeric", concepts: ["lim-infinito"], difficulty: 2,
    generate(r) {
      const m = r.pick([2, 3]), n = r.bool(0.7) ? m : m - 1;
      const numC = [r.nz(-6, 6), ...Array.from({ length: n }, () => r.int(-5, 5))];
      const denC = [r.nz(-5, 5), ...Array.from({ length: m }, () => r.int(-5, 5))];
      const ans = n === m ? numC[0] / denC[0] : 0;
      return {
        prompt: `Calculá $$\\lim_{x\\to \\infty} \\frac{${polyc(numC)}}{${polyc(denC)}}$$`,
        answer: ans, answerTex: n === m ? frac(numC[0], denC[0]) : "0",
        solution: [
          `Dividimos numerador y denominador por $x^{${m}}$, la mayor potencia del denominador.`,
          `Todo término de la forma $\\frac{k}{x^j}$ con $j \\ge 1$ tiende a $0$.`,
          n === m
            ? `Sobreviven los coeficientes principales: $\\dfrac{${numC[0]}}{${denC[0]}} = ${frac(numC[0], denC[0])}$.`
            : `El numerador tiene grado menor: todo el numerador tiende a $0$ y el denominador a $${denC[0]}$. El límite es $0$.`
        ],
        verify: { kind: "liminf", f: x => H.peval(numC, x) / H.peval(denC, x) }
      };
    }
  };

  // 9 · Asíntotas
  T["lim-asintota-mc"] = {
    type: "mc", concepts: ["lim-asintotas"], difficulty: 2,
    generate(r) {
      if (r.bool()) {
        const a = r.nz(-4, 4), b = r.int(-5, 5), c = r.nz(-4, 4);
        if (a * c + b === 0 || a === c || a === -c) return null;
        const o = (vx, hy) => `x = ${vx},\\; y = ${hy}`;
        return {
          prompt: `¿Cuáles son las asíntotas vertical y horizontal de $$f(x) = \\frac{${polyc([a, b])}}{${xm(c)}}\\,?$$`,
          ...H.mc(r, o(c, a), [o(-c, a), o(c, b === a ? a + 1 : b), o(a, c), o(c, 0)]),
          solution: [
            `Vertical: el denominador se anula en $x = ${c}$ y el numerador no ($${a * c + b} \\neq 0$), así que $x = ${c}$ es asíntota vertical.`,
            `Horizontal: $\\displaystyle\\lim_{x\\to\\pm\\infty} \\frac{${polyc([a, b])}}{${xm(c)}} = ${a}$ (cociente de coeficientes principales).`,
            `Asíntotas: $x = ${c}$ e $y = ${a}$.`
          ]
        };
      }
      const a = r.nz(-4, 4), c = r.int(1, 3);
      const o = (vx, hy) => `x = ${vx},\\; y = ${hy}`;
      return {
        prompt: `¿Cuáles son las asíntotas de $$f(x) = \\frac{${H.term(a, "x^{2}", true)}}{x^{2} - ${c * c}}\\,?$$`,
        ...H.mc(r, o(`\\pm ${c}`, a), [o(c, a), o(`\\pm ${c}`, 0), o(`\\pm ${c * c}`, a), o(`\\pm ${c}`, -a)]),
        solution: [
          `El denominador $x^2 - ${c * c} = (x - ${c})(x + ${c})$ se anula en $x = \\pm ${c}$, donde el numerador vale $${a * c * c} \\neq 0$: dos asíntotas verticales.`,
          `Grados iguales: $\\displaystyle\\lim_{x\\to\\pm\\infty} f(x) = ${a}$, asíntota horizontal $y = ${a}$.`
        ]
      };
    }
  };

  // 10 · Límites infinitos
  T["lim-infinito-signo-mc"] = {
    type: "mc", concepts: ["lim-infinitos"], difficulty: 2,
    generate(r) {
      const a = r.int(-3, 3), k = r.nz(-5, 5), p = r.pick([1, 2]), side = r.pick(["+", "-"]);
      const sgn = p === 2 ? Math.sign(k) : Math.sign(k) * (side === "+" ? 1 : -1);
      const correct = sgn > 0 ? "+\\infty" : "-\\infty";
      const den = p === 1 ? xm(a) : `(${xm(a)})^{2}`;
      return {
        prompt: `Calculá $$\\lim_{x\\to ${a}^{${side}}} \\frac{${k}}{${den}}$$`,
        ...H.mc(r, correct, ["+\\infty", "-\\infty", "0", String(k)].filter(x => x !== correct)),
        solution: [
          p === 2
            ? `$(${xm(a)})^2 \\to 0$ siempre con valores positivos, sin importar el lado.`
            : `Si $x \\to ${a}^{${side}}$, entonces $${xm(a)} \\to 0^{${side}}$ (valores ${side === "+" ? "positivos" : "negativos"} muy chicos).`,
          `El numerador es $${k}$, ${k > 0 ? "positivo" : "negativo"}.`,
          `Un número fijo dividido por algo que tiende a $0$ crece sin cota; el signo es ${sgn > 0 ? "positivo" : "negativo"}: $${correct}$.`
        ],
        verify: { kind: "limsign", a, side, f: x => k / Math.pow(x - a, p), sign: sgn }
      };
    }
  };

  // 11 · Tipos de discontinuidad
  T["cont-tipo-mc"] = {
    type: "mc", concepts: ["continuidad"], difficulty: 2,
    generate(r) {
      const OPTS = ["Evitable", "De salto", "Infinita (asíntota vertical)", "No hay: es continua en ese punto"];
      const kind = r.int(0, 3);
      const [p, s] = r.distinct(2, -4, 4);
      let fx, sol;
      if (kind === 0) {
        fx = `f(x) = \\frac{${polyc([1, -(p + s), p * s])}}{${xm(p)}}`;
        sol = [`$f$ no está definida en $x = ${p}$, pero $f(x) = ${xm(s)}$ para $x\\neq ${p}$.`, `El límite existe (vale $${p - s}$): se puede "tapar el agujero". Es <b>evitable</b>.`];
      } else if (kind === 1) {
        const pw = piecewise(r, false);
        return {
          prompt: `¿Qué tipo de discontinuidad tiene $$${pw.tex}$$ en $x = ${pw.a}$?`,
          ...H.mc(r, OPTS[1], OPTS.filter((_, i) => i !== 1), { text: true, keepOrder: true }),
          solution: [`Límite por izquierda: $${pw.Lm}$. Límite por derecha: $${pw.Lp}$.`, `Los laterales existen pero son distintos: discontinuidad <b>de salto</b>.`]
        };
      } else if (kind === 2) {
        fx = `f(x) = \\frac{${xm(s)}}{${xm(p)}}`;
        sol = [`En $x = ${p}$ el denominador se anula y el numerador vale $${p - s} \\neq 0$.`, `$|f(x)| \\to \\infty$ cerca de $${p}$: discontinuidad <b>infinita</b> (asíntota vertical).`];
      } else {
        const pw = piecewise(r, true);
        return {
          prompt: `¿Qué tipo de discontinuidad tiene $$${pw.tex}$$ en $x = ${pw.a}$?`,
          ...H.mc(r, OPTS[3], OPTS.slice(0, 3), { text: true, keepOrder: true }),
          solution: [`Límite por izquierda: $${pw.Lm}$. Por derecha: $${pw.Lp}$. Coinciden.`, `Además $f(${pw.a}) = ${pw.Lp}$ (segunda fórmula). Límite = valor: <b>es continua</b>.`]
        };
      }
      return {
        prompt: `¿Qué tipo de discontinuidad tiene $$${fx}$$ en $x = ${p}$?`,
        ...H.mc(r, OPTS[kind], OPTS.filter((_, i) => i !== kind), { text: true, keepOrder: true }),
        solution: sol
      };
    }
  };

  // 12 · Parámetro para continuidad
  T["cont-param-num"] = {
    type: "numeric", concepts: ["continuidad"], difficulty: 2,
    generate(r) {
      const c = r.int(-2, 2), a = r.nz(-3, 3), b = r.nz(-2, 2), d = r.int(-4, 4);
      const k = b * c * c + d - a * c;
      return {
        prompt: `¿Qué valor de $k$ hace que $$${cases(c, `${H.term(a, "x", true)} + k`, polyc([b, 0, d]))}$$ sea continua en todo $\\mathbb{R}$?`,
        answer: k,
        solution: [
          `Cada trozo es un polinomio: el único punto a revisar es $x = ${c}$.`,
          `Por izquierda: $\\lim_{x\\to ${c}^-} f(x) = ${a * c} + k$.`,
          `Por derecha (y $f(${c})$): $${b * c * c + d}$.`,
          `Igualamos: $${a * c} + k = ${b * c * c + d} \\Rightarrow k = ${k}$.`
        ]
      };
    }
  };

  // 13 · Bolzano
  T["cont-tvi-vf"] = {
    type: "tf", concepts: ["bolzano"], difficulty: 2,
    generate(r) {
      const v = r.pick(["poly", "poly", "disc", "exp"]);
      if (v === "poly") {
        const b = r.int(-6, 6), d = r.int(-6, 6), p = r.int(-3, 1), q = p + r.int(1, 3);
        const f = x => x ** 3 + b * x + d;
        const fp = f(p), fq = f(q);
        if (fp === 0 || fq === 0) return null;
        const yes = fp * fq < 0;
        return {
          prompt: `Sea $f(x) = ${polyc([1, 0, b, d])}$. <b>Verdadero o falso:</b> el teorema de Bolzano garantiza que $f$ tiene una raíz en $(${p}, ${q})$.`,
          answer: yes,
          explanation: yes
            ? `$f$ es continua (polinomio), $f(${p}) = ${fp}$ y $f(${q}) = ${fq}$ tienen signos opuestos: Bolzano garantiza una raíz.`
            : `$f(${p}) = ${fp}$ y $f(${q}) = ${fq}$ tienen el mismo signo, así que Bolzano no garantiza nada (podría haber raíces o no).`,
          solution: [`Bolzano: si $f$ es continua en $[a,b]$ y $f(a)\\,f(b) < 0$, existe $c\\in(a,b)$ con $f(c) = 0$.`]
        };
      }
      if (v === "disc") {
        const c = r.int(-2, 2);
        return {
          prompt: `Sea $f(x) = \\dfrac{1}{${xm(c)}}$. Como $f(${c - 1}) = -1 < 0$ y $f(${c + 1}) = 1 > 0$, <b>verdadero o falso:</b> Bolzano garantiza una raíz en $(${c - 1}, ${c + 1})$.`,
          answer: false,
          explanation: `$f$ no es continua en $[${c - 1}, ${c + 1}]$ (no está definida en $x = ${c}$), así que no se puede aplicar Bolzano. De hecho, $f$ nunca vale $0$.`,
          solution: [`Bolzano exige continuidad en todo el intervalo cerrado.`]
        };
      }
      const k = r.int(2, 9);
      const yes = k < Math.E ** 2;
      return {
        prompt: `Sea $f(x) = e^{x} - ${k}$. <b>Verdadero o falso:</b> Bolzano garantiza que $f$ tiene una raíz en $(0, 2)$.`,
        answer: yes,
        explanation: `$f(0) = ${1 - k} < 0$ y $f(2) = e^2 - ${k} \\approx ${num(Math.E ** 2 - k, 2)}$. ${yes ? "Signos opuestos y $f$ continua: hay raíz." : "Los dos son negativos: Bolzano no garantiza raíz (y de hecho la raíz $\\ln " + k + "$ está fuera del intervalo)."}`,
        solution: [`Recordá $e^2 \\approx 7{,}39$.`]
      };
    }
  };

  // 14 · Unir fórmula ↔ gráfico
  const FAMILIES = [
    r => { const c = r.int(-3, 1); return { fam: "par", tex: `x^{2}${c ? sg(c) : ""}`, f: x => x * x + c }; },
    r => { const c = r.int(-2, 2); return { fam: "abs", tex: `|${xm(c)}|`, f: x => Math.abs(x - c) }; },
    r => { const c = r.int(-2, 2); return { fam: "hip", tex: `\\frac{1}{${xm(c)}}`, f: x => 1 / (x - c), asym: { x: [c] } }; },
    r => { const c = r.int(0, 3); return { fam: "raiz", tex: `\\sqrt{${xm(-c)}}`, f: x => Math.sqrt(x + c) }; },
    r => { const c = r.int(-1, 1); return { fam: "cub", tex: `\\frac{x^{3}}{4}${c ? sg(c) : ""}`, f: x => x ** 3 / 4 + c }; },
    r => { const c = r.int(-3, 0); return { fam: "exp", tex: `e^{x}${c ? sg(c) : ""}`, f: x => Math.exp(x) + c }; },
    r => { const c = r.int(-1, 1); return { fam: "sin", tex: `2\\sin x${c ? sg(c) : ""}`, f: x => 2 * Math.sin(x) + c }; },
    r => { const c = r.int(-1, 1); return { fam: "log", tex: `\\ln(${xm(c)})`, f: x => Math.log(x - c) }; }
  ];
  T["lim-match-graph"] = {
    type: "match", concepts: ["graficos"], difficulty: 1,
    generate(r) {
      const fs = r.sample(FAMILIES, 4).map(g => g(r));
      return {
        prompt: `Uní cada fórmula con su gráfico.`,
        pairs: fs.map(f => [{ tex: `f(x) = ${f.tex}` }, { graph: { fns: [f.f], xr: [-5, 5], yr: [-4, 5], asym: f.asym } }]),
        solution: [
          `Pistas: $x^2$ es una parábola; $|x|$ tiene forma de V; $\\frac{1}{x}$ tiene asíntotas; $\\sqrt{x}$ y $\\ln x$ arrancan en un punto y crecen cada vez más lento ($\\ln$ baja a $-\\infty$); $e^x$ crece muy rápido; $\\sin$ oscila.`,
          `El número sumado al final sube o baja el gráfico; el que acompaña a $x$ adentro lo corre a izquierda o derecha.`
        ]
      };
    }
  };

  /* =====================================================================
   *  UNIDAD 2 · DERIVADAS
   * ===================================================================== */

  // 15 · Ordenar la derivada por definición
  T["der-def-order"] = {
    type: "order", concepts: ["der-definicion"], difficulty: 2,
    generate(r) {
      const a = r.nz(-4, 4), b = r.nz(-5, 5);
      return {
        prompt: `Ordená los pasos para derivar $f(x) = ${polyc([a, b, 0])}$ usando la definición.`,
        steps: [
          `$f'(x) = \\displaystyle\\lim_{h\\to 0} \\frac{f(x+h) - f(x)}{h}$`,
          `$f(x+h) = ${poly([[a, "(x+h)^{2}"], [b, "(x+h)"]])} = ${poly([[a, "x^{2}"], [2 * a, "xh"], [a, "h^{2}"], [b, "x"], [b, "h"]])}$`,
          `$f(x+h) - f(x) = ${poly([[2 * a, "xh"], [a, "h^{2}"], [b, "h"]])}$`,
          `Dividimos por $h \\neq 0$: $${poly([[2 * a, "x"], [a, "h"], [b, ""]])}$`,
          `Tomamos $h \\to 0$: $f'(x) = ${poly([[2 * a, "x"], [b, ""]])}$`
        ],
        solution: [`Se plantea el cociente incremental, se expande, se cancela $h$ y recién ahí se toma el límite.`]
      };
    }
  };

  // 16 · Reconocer una derivada escrita como límite
  T["der-def-num"] = {
    type: "numeric", concepts: ["der-definicion"], difficulty: 2,
    generate(r) {
      const v = r.pick(["pow", "pow", "sqrt", "inv"]);
      const shift = x0 => (x0 === 0 ? "h" : x0 > 0 ? `${x0} + h` : `h - ${-x0}`);
      if (v === "pow") {
        const n = r.int(2, 4), x0 = r.nz(-3, 3), val = x0 ** n, ans = n * x0 ** (n - 1);
        return {
          prompt: `Calculá $$\\lim_{h\\to 0} \\frac{(${shift(x0)})^{${n}} ${val < 0 ? "+ " + -val : "- " + val}}{h}$$`,
          answer: ans,
          solution: [
            `Es la definición de $f'(${x0})$ para $f(x) = x^{${n}}$, ya que $f(${x0}) = ${val}$.`,
            `$f'(x) = ${n}x^{${n - 1}}$.`,
            `$f'(${x0}) = ${n}\\cdot${par(x0)}^{${n - 1}} = ${ans}$.`
          ],
          verify: { kind: "limit", a: 0, f: h => ((x0 + h) ** n - val) / h }
        };
      }
      if (v === "sqrt") {
        const s = r.int(1, 4), x0 = s * s;
        return {
          prompt: `Calculá $$\\lim_{h\\to 0} \\frac{\\sqrt{${x0} + h} - ${s}}{h}$$`,
          answer: 1 / (2 * s), answerTex: frac(1, 2 * s),
          solution: [
            `Es $f'(${x0})$ para $f(x) = \\sqrt{x}$ (porque $\\sqrt{${x0}} = ${s}$).`,
            `$f'(x) = \\dfrac{1}{2\\sqrt{x}}$.`,
            `$f'(${x0}) = \\dfrac{1}{2\\cdot ${s}} = ${frac(1, 2 * s)}$.`
          ],
          verify: { kind: "limit", a: 0, f: h => (Math.sqrt(x0 + h) - s) / h }
        };
      }
      const x0 = r.nz(-3, 3);
      return {
        prompt: `Calculá $$\\lim_{h\\to 0} \\frac{\\frac{1}{${shift(x0)}} ${x0 < 0 ? "+" : "-"} \\frac{1}{${Math.abs(x0)}}}{h}$$`,
        answer: -1 / (x0 * x0), answerTex: frac(-1, x0 * x0),
        solution: [
          `Es $f'(${x0})$ para $f(x) = \\dfrac{1}{x}$ (porque $f(${x0}) = ${frac(1, x0)}$).`,
          `$f'(x) = -\\dfrac{1}{x^{2}}$.`,
          `$f'(${x0}) = -\\dfrac{1}{${x0 * x0}}$.`
        ],
        verify: { kind: "limit", a: 0, f: h => (1 / (x0 + h) - 1 / x0) / h }
      };
    }
  };

  // 17 · Derivabilidad y continuidad
  T["der-cont-vf"] = {
    type: "tf", concepts: ["der-continuidad"], difficulty: 1,
    generate(r) {
      const c = r.int(-3, 3);
      const pool = [
        { s: `Si $f$ es derivable en $x = a$, entonces $f$ es continua en $x = a$.`, a: true, e: `Es un teorema: $f(a+h) - f(a) = \\frac{f(a+h)-f(a)}{h}\\cdot h \\to f'(a)\\cdot 0 = 0$.` },
        { s: `Si $f$ es continua en $x = a$, entonces $f$ es derivable en $x = a$.`, a: false, e: `Contraejemplo: $|x|$ es continua en $0$ pero tiene un "pico": las pendientes laterales son $-1$ y $1$.` },
        { s: `$f(x) = |${xm(c)}|$ es derivable en $x = ${c}$.`, a: false, e: `Las derivadas laterales en $x=${c}$ son $-1$ y $1$: no coinciden, no es derivable (aunque sí continua).` },
        { s: `$f(x) = \\sqrt[3]{x}$ es derivable en $x = 0$.`, a: false, e: `$f'(x) = \\frac{1}{3}x^{-2/3}$ explota en $0$: la recta tangente es vertical.` },
        { s: `$f(x) = x\\,|x|$ es derivable en $x = 0$.`, a: true, e: `$\\frac{f(h) - f(0)}{h} = |h| \\to 0$, así que $f'(0) = 0$.` },
        { s: `Una función con una discontinuidad de salto en $x = ${c}$ no puede ser derivable en $x = ${c}$.`, a: true, e: `Derivable implica continua; si no es continua, no puede ser derivable.` },
        { s: `$f(x) = (${xm(c)})^{2}$ es derivable en $x = ${c}$.`, a: true, e: `Es un polinomio: es derivable en todo $\\mathbb{R}$, y $f'(${c}) = 0$.` }
      ];
      const q = r.pick(pool);
      return { prompt: `<b>Verdadero o falso:</b> ${q.s}`, answer: q.a, explanation: q.e, solution: [] };
    }
  };

  // 18 · Regla de la potencia (opción múltiple)
  const fracTerm = (c, e, first) => {
    // c / x^e   (e puede ser 0)
    if (c === 0) return "";
    if (e === 0) return H.term(c, "", first);
    const sign = c < 0 ? "-" : first ? "" : "+";
    const body = `\\frac{${Math.abs(c)}}{${xp(e)}}`;
    return first ? sign + body : ` ${sign} ${body}`;
  };
  T["der-pot-mc"] = {
    type: "mc", concepts: ["der-potencia"], difficulty: 1,
    generate(r) {
      const a = r.nz(-5, 5), n = r.int(2, 6), b = r.nz(-4, 4), m = r.int(1, 3);
      const opt = (c1, e1, c2, e2) => H.term(c1, xp(e1), true) + fracTerm(c2, e2, false);
      return {
        prompt: `Si $\\displaystyle f(x) = ${H.term(a, xp(n), true)}${fracTerm(b, m, false)}$, ¿cuál es $f'(x)$?`,
        ...H.mc(r, opt(a * n, n - 1, -b * m, m + 1), [
          opt(a * n, n - 1, b * m, m + 1), opt(a * n, n, -b * m, m + 1), opt(a * n, n - 1, -b * m, m - 1), opt(a, n - 1, -b, m + 1)
        ]),
        solution: [
          `Escribimos $\\dfrac{${b}}{${xp(m)}} = ${b}x^{-${m}}$.`,
          `Regla de la potencia: $(x^{k})' = k\\,x^{k-1}$, también para $k$ negativo.`,
          `$(${H.term(a, xp(n), true)})' = ${H.term(a * n, xp(n - 1), true)}$ y $(${b}x^{-${m}})' = ${-b * m}x^{-${m + 1}}$.`,
          `$f'(x) = ${opt(a * n, n - 1, -b * m, m + 1)}$`
        ],
        verify: { kind: "deriv-fn", f: x => a * x ** n + b / x ** m, df: x => a * n * x ** (n - 1) - b * m / x ** (m + 1), dom: [0.5, 3] }
      };
    }
  };

  // 19 · Derivada de un polinomio en un punto
  T["der-poly-num"] = {
    type: "numeric", concepts: ["der-potencia"], difficulty: 1,
    generate(r) {
      const C = [r.nz(-3, 3), r.int(-5, 5), r.int(-6, 6), r.int(-9, 9)], x0 = r.int(-3, 3);
      const d = [3 * C[0], 2 * C[1], C[2]];
      const ans = H.peval(d, x0);
      return {
        prompt: `Si $f(x) = ${polyc(C)}$, calculá $f'(${x0})$.`,
        answer: ans,
        solution: [
          `Derivamos término a término: $f'(x) = ${polyc(d)}$.`,
          `Evaluamos: $f'(${x0}) = ${H.psub(d, x0)} = ${ans}$.`
        ],
        verify: { kind: "deriv", f: x => H.peval(C, x), x0 }
      };
    }
  };

  // 20 · Unir función ↔ derivada (fórmulas)
  const DPAIRS = [
    r => { const n = r.int(2, 5); return { k: "pow", f: xp(n), d: `${n}${xp(n - 1)}` }; },
    r => { const k = r.int(2, 4); return { k: "sin", f: `\\sin(${k}x)`, d: `${k}\\cos(${k}x)` }; },
    r => { const k = r.int(2, 4); return { k: "cos", f: `\\cos(${k}x)`, d: `-${k}\\sin(${k}x)` }; },
    r => { const k = r.int(2, 4); return { k: "exp", f: `e^{${k}x}`, d: `${k}e^{${k}x}` }; },
    r => { const k = r.int(2, 5); return { k: "ln", f: `\\ln(${k}x)`, d: `\\frac{1}{x}` }; },
    () => ({ k: "sqrt", f: `\\sqrt{x}`, d: `\\frac{1}{2\\sqrt{x}}` }),
    () => ({ k: "inv", f: `\\frac{1}{x}`, d: `-\\frac{1}{x^{2}}` }),
    () => ({ k: "tan", f: `\\tan x`, d: `\\sec^{2} x` })
  ];
  T["der-match-formula"] = {
    type: "match", concepts: ["der-potencia", "der-trig", "der-explog"], difficulty: 1,
    generate(r) {
      const ps = r.sample(DPAIRS, 4).map(g => g(r));
      return {
        prompt: `Uní cada función con su derivada.`,
        pairs: ps.map(p => [{ tex: p.f }, { tex: p.d }]),
        solution: ps.map(p => `$\\left(${p.f}\\right)' = ${p.d}$`)
      };
    }
  };

  // 21 · Regla del producto
  T["der-prod-num"] = {
    type: "numeric", concepts: ["der-producto"], difficulty: 2,
    generate(r) {
      const v = r.pick(["exp", "ln", "cos"]);
      if (v === "exp") {
        const a = r.nz(-4, 4), b = r.int(-5, 5), k = r.nz(-3, 3), x0 = r.pick([0, 1]);
        const ans = (a + k * (a * x0 + b)) * Math.exp(k * x0), co = a + k * (a * x0 + b);
        if (co === 0) return null;
        return {
          prompt: `Si $f(x) = (${polyc([a, b])})\\,e^{${kx(k)}}$, calculá $f'(${x0})$.`,
          answer: ans, answerTex: x0 === 0 ? String(co) : `${cf(co)}e^{${k}}`,
          solution: [
            `[[regla-producto|Regla del producto]]: $(uv)' = u'v + uv'$ con $u = ${polyc([a, b])}$ y $v = e^{${kx(k)}}$.`,
            `$u' = ${a}$, $\\;v' = ${k}e^{${kx(k)}}$.`,
            `$f'(x) = ${a}e^{${kx(k)}} + ${par(k)}(${polyc([a, b])})e^{${kx(k)}} = (${polyc([k * a, a + k * b])})e^{${kx(k)}}$.`,
            `$f'(${x0}) = ${x0 === 0 ? co : cf(co)}${x0 === 0 ? "" : `\\,e^{${k}}`}${x0 === 0 ? "" : ` \\approx ${num(ans, 3)}`}$.`
          ],
          verify: { kind: "deriv", f: x => (a * x + b) * Math.exp(k * x), x0 }
        };
      }
      if (v === "ln") {
        const b = r.int(-3, 6), x0 = r.pick([1, 2]);
        const ans = 2 * x0 * Math.log(x0) + (x0 * x0 + b) / x0;
        return {
          prompt: `Si $f(x) = (x^{2}${b ? sg(b) : ""})\\ln x$, calculá $f'(${x0})$.`,
          answer: ans, answerTex: x0 === 1 ? String(1 + b) : `4\\ln 2 + ${frac(4 + b, 2)}`,
          solution: [
            `$u = x^{2}${b ? sg(b) : ""}$, $u' = 2x$; $\\;v = \\ln x$, $v' = \\frac{1}{x}$.`,
            `$f'(x) = 2x\\ln x + \\dfrac{x^{2}${b ? sg(b) : ""}}{x}$.`,
            x0 === 1 ? `En $x = 1$: $\\ln 1 = 0$, así que $f'(1) = ${1 + b}$.` : `En $x = 2$: $f'(2) = 4\\ln 2 + \\frac{${4 + b}}{2} \\approx ${num(ans, 3)}$.`
          ],
          verify: { kind: "deriv", f: x => (x * x + b) * Math.log(x), x0 }
        };
      }
      const n = r.int(1, 3);
      const ans = -n * Math.PI ** (n - 1);
      return {
        prompt: `Si $f(x) = ${xp(n)}\\cos x$, calculá $f'(\\pi)$.`,
        answer: ans, answerTex: n === 1 ? "-1" : `-${n}\\pi${n - 1 > 1 ? `^{${n - 1}}` : ""}`,
        solution: [
          `$f'(x) = ${n === 1 ? "" : n}${xp(n - 1) || "1"}\\cos x - ${xp(n)}\\sin x$.`.replace("1\\cos", "\\cos"),
          `En $x = \\pi$: $\\cos\\pi = -1$, $\\sin\\pi = 0$.`,
          `$f'(\\pi) = -${n === 1 ? "1" : n + "\\pi" + (n - 1 > 1 ? `^{${n - 1}}` : "")} ${n > 1 ? `\\approx ${num(ans, 3)}` : ""}$.`
        ],
        verify: { kind: "deriv", f: x => x ** n * Math.cos(x), x0: Math.PI }
      };
    }
  };

  // 22 · Regla del cociente
  T["der-coc-num"] = {
    type: "numeric", concepts: ["der-cociente"], difficulty: 2,
    generate(r) {
      const a = r.nz(-5, 5), b = r.int(-5, 5), c = r.nz(-3, 3), d = r.int(-5, 5), x0 = r.int(-2, 3);
      const D = a * d - b * c, v = c * x0 + d;
      if (D === 0 || v === 0) return null;
      return {
        prompt: `Si $f(x) = \\dfrac{${polyc([a, b])}}{${polyc([c, d])}}$, calculá $f'(${x0})$.`,
        answer: D / (v * v), answerTex: frac(D, v * v),
        solution: [
          `[[regla-cociente|Regla del cociente]]: $\\left(\\frac{u}{v}\\right)' = \\dfrac{u'v - uv'}{v^2}$, con $u' = ${a}$ y $v' = ${c}$.`,
          `$f'(x) = \\dfrac{${cf(a)}(${polyc([c, d])}) - ${par(c)}(${polyc([a, b])})}{(${polyc([c, d])})^2} = \\dfrac{${D}}{(${polyc([c, d])})^2}$`,
          `En $x = ${x0}$: el denominador es $(${v})^2 = ${v * v}$, así que $f'(${x0}) = ${frac(D, v * v)}$.`
        ],
        verify: { kind: "deriv", f: x => (a * x + b) / (c * x + d), x0 }
      };
    }
  };

  // 23 · Encontrá el error (cociente)
  T["der-error-coc"] = {
    type: "error", concepts: ["der-cociente"], difficulty: 2,
    generate(r) {
      const a = r.nz(-4, 4), b = r.nz(-5, 5), c = r.int(1, 5);
      const U = polyc([a, b]), V = `x^{2} + ${c}`;
      const ok = [
        `Regla del cociente: $\\left(\\frac{u}{v}\\right)' = \\dfrac{u'v - uv'}{v^{2}}$.`,
        `$u = ${U},\\ u' = ${a};\\quad v = ${V},\\ v' = 2x$.`,
        `$f'(x) = \\dfrac{${cf(a)}(${V}) - (${U})\\cdot 2x}{(${V})^{2}}$`,
        `$f'(x) = \\dfrac{${poly([[-a, "x^{2}"], [-2 * b, "x"], [a * c, ""]])}}{(${V})^{2}}$`
      ];
      const steps = ok.slice();
      const kind = r.pick(["formula", "vprime", "square", "expand"]);
      let wrongIndex, fix;
      if (kind === "formula") {
        wrongIndex = 0;
        steps[0] = `Regla del cociente: $\\left(\\frac{u}{v}\\right)' = \\dfrac{uv' - u'v}{v^{2}}$.`;
        steps[2] = `$f'(x) = \\dfrac{(${U})\\cdot 2x ${a > 0 ? "-" : "+"} ${cf(Math.abs(a))}(${V})}{(${V})^{2}}$`;
        steps[3] = `$f'(x) = \\dfrac{${poly([[a, "x^{2}"], [2 * b, "x"], [-a * c, ""]])}}{(${V})^{2}}$`;
        fix = `El orden es $u'v - uv'$ (primero la derivada del numerador).`;
      } else if (kind === "vprime") {
        wrongIndex = 1;
        steps[1] = `$u = ${U},\\ u' = ${a};\\quad v = ${V},\\ v' = 2x + ${c}$.`;
        steps[2] = `$f'(x) = \\dfrac{${cf(a)}(${V}) - (${U})(2x + ${c})}{(${V})^{2}}$`;
        steps[3] = `$f'(x) = \\dfrac{${poly([[-a, "x^{2}"], [-(a * c + 2 * b), "x"], [a * c - b * c, ""]])}}{(${V})^{2}}$`;
        fix = `La derivada de una constante es $0$: $v' = 2x$.`;
      } else if (kind === "square") {
        wrongIndex = 2;
        steps[2] = `$f'(x) = \\dfrac{${cf(a)}(${V}) - (${U})\\cdot 2x}{${V}}$`;
        steps[3] = `$f'(x) = \\dfrac{${poly([[-a, "x^{2}"], [-2 * b, "x"], [a * c, ""]])}}{${V}}$`;
        fix = `El denominador va al cuadrado: $(${V})^{2}$.`;
      } else {
        wrongIndex = 3;
        steps[3] = `$f'(x) = \\dfrac{${poly([[-a, "x^{2}"], [-2 * b, "x"], [-a * c, ""]])}}{(${V})^{2}}$`;
        fix = `Al distribuir, $${cf(a)}(${V})$ aporta $${a * c}$ (con ese signo) al término independiente.`;
      }
      return {
        prompt: `Alguien derivó $f(x) = \\dfrac{${U}}{${V}}$ así. <b>Tocá el primer paso incorrecto.</b>`,
        steps, wrongIndex, fix, solution: ok
      };
    }
  };

  // 24 · Derivadas trigonométricas
  T["der-trig-mc"] = {
    type: "mc", concepts: ["der-trig"], difficulty: 1,
    generate(r) {
      const v = r.pick(["sincos", "sincos", "tan", "sec"]);
      if (v === "sincos") {
        const a = r.nz(-4, 4), c = r.nz(-4, 4), b = r.int(2, 5);
        const S = `\\sin(${b}x)`, C = `\\cos(${b}x)`;
        return {
          prompt: `Si $f(x) = ${poly([[a, S], [c, C]])}$, ¿cuál es $f'(x)$?`,
          ...H.mc(r, poly([[a * b, C], [-c * b, S]]), [poly([[a * b, C], [c * b, S]]), poly([[a, C], [-c, S]]), poly([[a * b, S], [-c * b, C]]), poly([[-a * b, C], [c * b, S]])]),
          solution: [
            `[[derivadas-trig|Derivadas trigonométricas]] con cadena: $(\\sin u)' = \\cos u \\cdot u'$ y $(\\cos u)' = -\\sin u \\cdot u'$, con $u = ${b}x$, $u' = ${b}$.`,
            `$f'(x) = ${poly([[a * b, C], [-c * b, S]])}$`
          ],
          verify: { kind: "deriv-fn", f: x => a * Math.sin(b * x) + c * Math.cos(b * x), df: x => a * b * Math.cos(b * x) - c * b * Math.sin(b * x) }
        };
      }
      if (v === "tan") {
        const a = r.nz(-4, 4), b = r.int(2, 5);
        const s2 = `\\sec^{2}(${b}x)`;
        return {
          prompt: `Si $f(x) = ${H.term(a, `\\tan(${b}x)`, true)}$, ¿cuál es $f'(x)$?`,
          ...H.mc(r, H.term(a * b, s2, true), [H.term(a, s2, true), H.term(a * b, `\\sec(${b}x)\\tan(${b}x)`, true), H.term(-a * b, s2, true), H.term(a * b, `\\tan^{2}(${b}x)`, true)]),
          solution: [`[[derivadas-trig|Derivadas trigonométricas]]: $(\\tan u)' = \\sec^2 u \\cdot u'$ con $u = ${b}x$.`, `$f'(x) = ${H.term(a * b, s2, true)}$`],
          verify: { kind: "deriv-fn", f: x => a * Math.tan(b * x), df: x => a * b / Math.cos(b * x) ** 2, dom: [-0.2, 0.2] }
        };
      }
      const a = r.nz(-5, 5);
      return {
        prompt: `Si $f(x) = ${H.term(a, "\\sec x", true)}$, ¿cuál es $f'(x)$?`,
        ...H.mc(r, H.term(a, "\\sec x\\tan x", true), [H.term(a, "\\tan^{2} x", true), H.term(a, "\\sec^{2} x", true), H.term(-a, "\\sec x\\tan x", true), H.term(a, "\\csc x", true)]),
        solution: [`$\\sec x = \\frac{1}{\\cos x}$; por [[regla-cociente|cociente]] ([[derivadas-trig|ver derivadas trigonométricas]]): $\\left(\\frac{1}{\\cos x}\\right)' = \\frac{\\sin x}{\\cos^2 x} = \\sec x\\tan x$.`, `$f'(x) = ${H.term(a, "\\sec x\\tan x", true)}$`],
        verify: { kind: "deriv-fn", f: x => a / Math.cos(x), df: x => a * Math.tan(x) / Math.cos(x), dom: [-1, 1] }
      };
    }
  };

  // 25 · Exponencial y logaritmo
  T["der-explog-num"] = {
    type: "numeric", concepts: ["der-explog"], difficulty: 1,
    generate(r) {
      const a = r.nz(-4, 4), b = r.nz(-5, 5), c = r.nz(-3, 3), n = r.int(2, 3), x0 = r.pick([1, 2]);
      const ans = a * Math.exp(x0) + b / x0 + c * n * x0 ** (n - 1);
      return {
        prompt: `Si $f(x) = ${poly([[a, "e^{x}"], [b, "\\ln x"], [c, xp(n)]])}$, calculá $f'(${x0})$.`,
        answer: ans,
        solution: [
          `[[exp-log|Derivadas de exp y ln]]: $(e^x)' = e^x$, $\\;(\\ln x)' = \\frac{1}{x}$, $\\;(x^{${n}})' = ${n}${xp(n - 1)}$.`,
          `$f'(x) = ${poly([[a, "e^{x}"], [b, "\\frac{1}{x}"], [c * n, xp(n - 1)]])}$`.replace(/(\d)\\frac\{1\}\{x\}/, "\\frac{$1}{x}"),
          `$f'(${x0}) = ${H.term(a, `e^{${x0}}`, true)}${sg(b / x0)}${sg(c * n * x0 ** (n - 1))} \\approx ${num(ans, 3)}$`
        ],
        verify: { kind: "deriv", f: x => a * Math.exp(x) + b * Math.log(x) + c * x ** n, x0 }
      };
    }
  };

  // 26 · a·xⁿ·sin(bx)
  T["der-axnsin-num"] = {
    type: "numeric", concepts: ["der-producto", "der-trig"], difficulty: 3,
    generate(r) {
      const a = r.int(2, 6), n = r.int(2, 4), b = r.pick([1, 2, 3]), X = r.pick(H.angles);
      const x0 = X.v;
      const t1 = a * n * x0 ** (n - 1) * Math.sin(b * x0), t2 = a * b * x0 ** n * Math.cos(b * x0);
      const ans = t1 + t2;
      if (Math.abs(ans) < 0.05) return null;
      const bx = b === 1 ? "x" : b + "x";
      return {
        prompt: `Si $f(x) = ${a}x^{${n}}\\sin(${bx})$, calculá $f'\\left(${X.t}\\right)$ (con 2 decimales alcanza).`,
        answer: ans,
        solution: [
          `[[regla-producto|Regla del producto]]: $u = ${a}x^{${n}}$, $u' = ${a * n}${xp(n - 1)}$; $\\;v = \\sin(${bx})$, $v' = ${b === 1 ? "" : b}\\cos(${bx})$.`,
          `$f'(x) = ${a * n}${xp(n - 1)}\\sin(${bx}) + ${a * b}x^{${n}}\\cos(${bx})$`,
          `En $x = ${X.t}$: primer término $\\approx ${num(t1, 3)}$, segundo $\\approx ${num(t2, 3)}$.`,
          `$f'\\left(${X.t}\\right) \\approx ${num(ans, 3)}$`
        ],
        verify: { kind: "deriv", f: x => a * x ** n * Math.sin(b * x), x0 }
      };
    }
  };

  // 27 · Regla de la cadena (opción múltiple)
  T["der-cadena-mc"] = {
    type: "mc", concepts: ["der-cadena"], difficulty: 2,
    generate(r) {
      const v = r.pick(["pow", "pow", "sin", "exp"]);
      const a = r.int(1, 4), m = r.int(2, 3);
      const inner = H.term(a, xp(m), true);
      const dIn = `${a * m}${xp(m - 1)}`;
      if (v === "pow") {
        const b = r.nz(-5, 5), n = r.int(3, 5);
        const U = `(${inner}${sg(b)})`;
        return {
          prompt: `Si $f(x) = ${U}^{${n}}$, ¿cuál es $f'(x)$?`,
          ...H.mc(r, `${a * m * n}${xp(m - 1)}${U}^{${n - 1}}`, [
            `${n}${U}^{${n - 1}}`, `${a * m * n}${xp(m - 1)}${U}^{${n}}`, `${n * a}${xp(m - 1)}${U}^{${n - 1}}`, `${n}(${dIn})^{${n - 1}}`
          ]),
          solution: [
            `Cadena: $(u^{${n}})' = ${n}u^{${n - 1}}\\cdot u'$ con $u = ${inner}${sg(b)}$.`,
            `$u' = ${dIn}$.`,
            `$f'(x) = ${n}${U}^{${n - 1}}\\cdot ${dIn} = ${a * m * n}${xp(m - 1)}${U}^{${n - 1}}$`
          ],
          verify: { kind: "deriv-fn", f: x => (a * x ** m + b) ** n, df: x => a * m * n * x ** (m - 1) * (a * x ** m + b) ** (n - 1), dom: [-1.5, 1.5] }
        };
      }
      if (v === "sin") {
        return {
          prompt: `Si $f(x) = \\sin(${inner})$, ¿cuál es $f'(x)$?`,
          ...H.mc(r, `${dIn}\\cos(${inner})`, [`\\cos(${inner})`, `-${dIn}\\cos(${inner})`, `\\cos(${dIn})`, `${dIn}\\sin(${inner})`]),
          solution: [`$(\\sin u)' = \\cos u\\cdot u'$ con $u = ${inner}$, $u' = ${dIn}$.`, `$f'(x) = ${dIn}\\cos(${inner})$`],
          verify: { kind: "deriv-fn", f: x => Math.sin(a * x ** m), df: x => a * m * x ** (m - 1) * Math.cos(a * x ** m), dom: [-1, 1] }
        };
      }
      return {
        prompt: `Si $f(x) = e^{${inner}}$, ¿cuál es $f'(x)$?`,
        ...H.mc(r, `${dIn}\\,e^{${inner}}`, [`e^{${inner}}`, `${inner}\\,e^{${inner} - 1}`, `${dIn}\\,e^{${dIn}}`, `e^{${dIn}}`]),
        solution: [`$(e^{u})' = e^{u}\\cdot u'$ con $u = ${inner}$, $u' = ${dIn}$.`, `$f'(x) = ${dIn}\\,e^{${inner}}$`],
        verify: { kind: "deriv-fn", f: x => Math.exp(a * x ** m), df: x => a * m * x ** (m - 1) * Math.exp(a * x ** m), dom: [-0.8, 0.8] }
      };
    }
  };

  // 28 · Regla de la cadena (numérico)
  T["der-cadena-num"] = {
    type: "numeric", concepts: ["der-cadena"], difficulty: 2,
    generate(r) {
      const v = r.pick(["sqrt", "ln", "sin2", "expsin"]);
      if (v === "sqrt" || v === "ln") {
        const a = r.int(1, 4), b = r.int(1, 9), x0 = r.nz(-3, 3);
        const U = polyc([a, 0, b]), u0 = a * x0 * x0 + b;
        if (v === "sqrt") {
          const ans = a * x0 / Math.sqrt(u0);
          return {
            prompt: `Si $f(x) = \\sqrt{${U}}$, calculá $f'(${x0})$.`,
            answer: ans,
            solution: [
              `$(\\sqrt{u})' = \\dfrac{u'}{2\\sqrt{u}}$ con $u = ${U}$, $u' = ${2 * a}x$.`,
              `$f'(x) = \\dfrac{${2 * a}x}{2\\sqrt{${U}}} = \\dfrac{${a === 1 ? "" : a}x}{\\sqrt{${U}}}$`,
              `$f'(${x0}) = \\dfrac{${a * x0}}{\\sqrt{${u0}}} \\approx ${num(ans, 3)}$`
            ],
            verify: { kind: "deriv", f: x => Math.sqrt(a * x * x + b), x0 }
          };
        }
        return {
          prompt: `Si $f(x) = \\ln(${U})$, calculá $f'(${x0})$.`,
          answer: 2 * a * x0 / u0, answerTex: frac(2 * a * x0, u0),
          solution: [
            `$(\\ln u)' = \\dfrac{u'}{u}$ con $u = ${U}$, $u' = ${2 * a}x$.`,
            `$f'(${x0}) = \\dfrac{${2 * a}\\cdot ${par(x0)}}{${u0}} = ${frac(2 * a * x0, u0)}$`
          ],
          verify: { kind: "deriv", f: x => Math.log(a * x * x + b), x0 }
        };
      }
      const k = r.int(2, 5);
      if (v === "sin2") {
        return {
          prompt: `Si $f(x) = \\sin^{2}(${k}x)$, calculá $f'\\left(\\frac{\\pi}{${4 * k}}\\right)$.`,
          answer: k,
          solution: [
            `Cadena dos veces: $f'(x) = 2\\sin(${k}x)\\cdot\\cos(${k}x)\\cdot ${k} = ${k}\\sin(${2 * k}x)$.`,
            `En $x = \\frac{\\pi}{${4 * k}}$: $\\sin\\left(\\frac{\\pi}{2}\\right) = 1$, así que $f' = ${k}$.`
          ],
          verify: { kind: "deriv", f: x => Math.sin(k * x) ** 2, x0: Math.PI / (4 * k) }
        };
      }
      return {
        prompt: `Si $f(x) = e^{\\sin(${k}x)}$, calculá $f'(0)$.`,
        answer: k,
        solution: [
          `$f'(x) = e^{\\sin(${k}x)}\\cdot\\cos(${k}x)\\cdot ${k}$.`,
          `En $x = 0$: $e^{0}\\cdot\\cos 0\\cdot ${k} = ${k}$.`
        ],
        verify: { kind: "deriv", f: x => Math.exp(Math.sin(k * x)), x0: 0 }
      };
    }
  };

  // 29 · Encontrá el error (cadena)
  T["der-error-cadena"] = {
    type: "error", concepts: ["der-cadena"], difficulty: 2,
    generate(r) {
      const a = r.int(1, 4), b = r.nz(-5, 5);
      const U = polyc([a, 0, b]);
      const isSin = r.bool();
      const outer = isSin ? "\\sin" : "\\cos";
      const dOuter = isSin ? "\\cos(u)" : "-\\sin(u)";
      const res = isSin ? `${2 * a}x\\cos(${U})` : `-${2 * a}x\\sin(${U})`;
      const ok = [
        `Llamamos $u = ${U}$, así $f(x) = ${outer} u$.`,
        `Regla de la cadena: $f'(x) = ${dOuter}\\cdot u'$.`,
        `Derivamos la de adentro: $u' = ${2 * a}x$.`,
        `Resultado: $f'(x) = ${res}$.`
      ];
      const steps = ok.slice();
      const kind = r.pick(["outer", "inner", "subst"]);
      let wrongIndex, fix;
      if (kind === "outer") {
        wrongIndex = 1;
        steps[1] = `Regla de la cadena: $f'(x) = ${isSin ? "-\\cos(u)" : "\\sin(u)"}\\cdot u'$.`;
        steps[3] = `Resultado: $f'(x) = ${isSin ? `-${2 * a}x\\cos(${U})` : `${2 * a}x\\sin(${U})`}$.`;
        fix = isSin ? `$(\\sin u)' = \\cos u$, sin signo menos.` : `$(\\cos u)' = -\\sin u$: falta el signo menos.`;
      } else if (kind === "inner") {
        wrongIndex = 2;
        steps[2] = `Derivamos la de adentro: $u' = ${poly([[2 * a, "x"], [b, ""]])}$.`;
        steps[3] = `Resultado: $f'(x) = ${isSin ? "" : "-"}(${poly([[2 * a, "x"], [b, ""]])})${isSin ? "\\cos" : "\\sin"}(${U})$.`;
        fix = `La derivada de la constante $${b}$ es $0$: $u' = ${2 * a}x$.`;
      } else {
        wrongIndex = 3;
        steps[3] = `Resultado: $f'(x) = ${isSin ? "" : "-"}${2 * a}x${isSin ? "\\cos" : "\\sin"}(${2 * a}x)$.`;
        fix = `Adentro de la función de afuera va $u$ (sin derivar): $${res}$.`;
      }
      return {
        prompt: `Alguien derivó $f(x) = ${outer}(${U})$ así. <b>Tocá el primer paso incorrecto.</b>`,
        steps, wrongIndex, fix, solution: ok
      };
    }
  };

  // 30 · Ordenar: derivada de ln(trig)
  T["der-order-lntrig"] = {
    type: "order", concepts: ["der-cadena", "der-trig"], difficulty: 2,
    generate(r) {
      const a = r.int(2, 5), ax = `${a}x`;
      const v = r.pick([
        { g: `\\sec(${ax})`, dg: `${a}\\sec(${ax})\\tan(${ax})`, res: `${a}\\tan(${ax})` },
        { g: `\\sin(${ax})`, dg: `${a}\\cos(${ax})`, res: `${a}\\cot(${ax})` },
        { g: `\\cos(${ax})`, dg: `-${a}\\sin(${ax})`, res: `-${a}\\tan(${ax})` }
      ]);
      return {
        prompt: `Ordená los pasos para derivar $f(x) = \\ln\\left(${v.g}\\right)$.`,
        steps: [
          `Llamamos $u = ${v.g}$, así $f = \\ln u$ y $f' = \\dfrac{u'}{u}$.`,
          `Derivamos $u$ (otra vez cadena): $u' = ${v.dg}$.`,
          `Armamos el cociente: $f'(x) = \\dfrac{${v.dg}}{${v.g}}$.`,
          `Simplificamos: $f'(x) = ${v.res}$.`
        ],
        solution: [`Cadena "de afuera hacia adentro": primero $\\ln$, después la trigonométrica, después $${ax}$.`]
      };
    }
  };

  // 31 · Recta tangente
  T["der-tangente-num"] = {
    type: "numeric", concepts: ["der-tangente"], difficulty: 2,
    generate(r) {
      const a = r.nz(-3, 3), b = r.int(-5, 5), c = r.int(-6, 6), x0 = r.int(-3, 3);
      const m = 2 * a * x0 + b, y0 = a * x0 * x0 + b * x0 + c, k = y0 - m * x0;
      const askSlope = r.bool();
      return {
        prompt: `La recta tangente al gráfico de $f(x) = ${polyc([a, b, c])}$ en $x = ${x0}$ es $y = mx + k$. ¿Cuánto vale ${askSlope ? "$m$" : "$k$"}?`,
        answer: askSlope ? m : k,
        solution: [
          `$f'(x) = ${polyc([2 * a, b])}$, así que $m = f'(${x0}) = ${m}$.`,
          `El punto de tangencia es $(${x0}, f(${x0})) = (${x0}, ${y0})$.`,
          `$y - ${par(y0)} = ${m}(x - ${par(x0)}) \\Rightarrow y = ${polyc([m, k])}$.`,
          askSlope ? `$m = ${m}$` : `$k = ${k}$`
        ],
        verify: askSlope ? { kind: "deriv", f: x => a * x * x + b * x + c, x0 } : undefined
      };
    }
  };

  // 32 · Derivación implícita
  T["der-implicita-num"] = {
    type: "numeric", concepts: ["der-implicita"], difficulty: 3,
    generate(r) {
      if (r.bool()) {
        const [p0, q0, R] = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17]]);
        const swap = r.bool();
        const p = (swap ? q0 : p0) * r.sign(), q = (swap ? p0 : q0) * r.sign();
        return {
          prompt: `Sobre la circunferencia $x^{2} + y^{2} = ${R * R}$, calculá $\\dfrac{dy}{dx}$ en el punto $(${p}, ${q})$.`,
          answer: -p / q, answerTex: frac(-p, q),
          solution: [
            `Derivamos ambos lados respecto de $x$ (con $y = y(x)$): $2x + 2y\\,y' = 0$.`,
            `Despejamos: $y' = -\\dfrac{x}{y}$.`,
            `En $(${p}, ${q})$: $y' = -\\dfrac{${p}}{${q}} = ${frac(-p, q)}$.`
          ],
          verify: { kind: "implicit", F: (x, y) => x * x + y * y - R * R, p, q }
        };
      }
      const p = r.nz(-3, 3), q = r.nz(-3, 3);
      if (p + 2 * q === 0) return null;
      const C = p * p + p * q + q * q;
      return {
        prompt: `La curva $x^{2} + xy + y^{2} = ${C}$ pasa por $(${p}, ${q})$. Calculá $\\dfrac{dy}{dx}$ en ese punto.`,
        answer: -(2 * p + q) / (p + 2 * q), answerTex: frac(-(2 * p + q), p + 2 * q),
        solution: [
          `Derivamos implícitamente: $2x + (y + x\\,y') + 2y\\,y' = 0$.`,
          `Agrupamos: $y'(x + 2y) = -(2x + y)$, así que $y' = -\\dfrac{2x + y}{x + 2y}$.`,
          `En $(${p}, ${q})$: $y' = -\\dfrac{${2 * p + q}}{${p + 2 * q}} = ${frac(-(2 * p + q), p + 2 * q)}$.`
        ],
        verify: { kind: "implicit", F: (x, y) => x * x + x * y + y * y - C, p, q }
      };
    }
  };

  // 33 · Derivadas sucesivas
  T["der-orden2-num"] = {
    type: "numeric", concepts: ["der-sucesivas"], difficulty: 2,
    generate(r) {
      const v = r.pick(["poly", "poly", "exp", "sin"]);
      if (v === "poly") {
        const C = [r.nz(-2, 2), r.int(-3, 3), r.int(-4, 4), r.int(-5, 5), 0], x0 = r.int(-2, 2);
        const d2 = [12 * C[0], 6 * C[1], 2 * C[2]], ans = H.peval(d2, x0);
        return {
          prompt: `Si $f(x) = ${polyc(C)}$, calculá $f''(${x0})$.`,
          answer: ans,
          solution: [`Derivamos dos veces ([[derivadas-sucesivas|derivadas sucesivas]]): $f'(x) = ${polyc([4 * C[0], 3 * C[1], 2 * C[2], C[3]])}$`, `$f''(x) = ${polyc(d2)}$`, `$f''(${x0}) = ${ans}$`],
          verify: { kind: "deriv2", f: x => H.peval(C, x), x0 }
        };
      }
      const a = r.nz(-4, 4), k = r.int(2, 4);
      if (v === "exp") {
        return {
          prompt: `Si $f(x) = ${H.term(a, `e^{${k}x}`, true)}$, calculá $f''(0)$.`,
          answer: a * k * k,
          solution: [`Cada derivada baja un factor $${k}$: $f''(x) = ${a * k * k}e^{${k}x}$.`, `$f''(0) = ${a * k * k}$`],
          verify: { kind: "deriv2", f: x => a * Math.exp(k * x), x0: 0 }
        };
      }
      return {
        prompt: `Si $f(x) = ${H.term(a, `\\sin(${k}x)`, true)}$, calculá $f''\\left(\\frac{\\pi}{${2 * k}}\\right)$.`,
        answer: -a * k * k,
        solution: [`$f'(x) = ${a * k}\\cos(${k}x)$, $\\;f''(x) = ${-a * k * k}\\sin(${k}x)$.`, `En $x = \\frac{\\pi}{${2 * k}}$: $\\sin\\frac{\\pi}{2} = 1$, así que $f'' = ${-a * k * k}$.`],
        verify: { kind: "deriv2", f: x => a * Math.sin(k * x), x0: Math.PI / (2 * k) }
      };
    }
  };

  // 34 · Unir gráfico de f ↔ gráfico de f'
  const GPAIRS = [
    { f: x => x * x / 2 - 2, d: x => x, why: `$f$ es una parábola con mínimo en $0$: $f'$ es una recta creciente que cruza el $0$ ahí.` },
    { f: x => -x * x / 2 + 2, d: x => -x, why: `$f$ es una parábola con máximo en $0$: $f'$ es una recta decreciente.` },
    { f: x => x ** 3 / 3 - 2 * x, d: x => x * x - 2, why: `$f$ cúbica con un máximo y un mínimo: $f'$ es una parábola que vale $0$ en esos puntos.` },
    { f: x => 2 * Math.sin(x), d: x => 2 * Math.cos(x), why: `$f$ oscila: $f'$ también, desfasada (vale $0$ en los picos de $f$).` },
    { f: x => Math.abs(x) - 1, d: x => (x < 0 ? -1 : 1), holes: true, why: `$f$ es una V: pendiente $-1$ a la izquierda y $1$ a la derecha.` },
    { f: x => 2 - x, d: () => -1, why: `$f$ es una recta de pendiente $-1$: $f'$ es constante $-1$.` },
    { f: x => -(x ** 3) / 3 + x, d: x => -x * x + 1, why: `$f$ cúbica "al revés": $f'$ es una parábola hacia abajo.` }
  ];
  T["der-match-graph"] = {
    type: "match", concepts: ["der-grafica"], difficulty: 2,
    generate(r) {
      const ps = r.sample(GPAIRS, 3);
      const g = f => ({ fns: [f], xr: [-4, 4], yr: [-4, 4] });
      return {
        prompt: `Uní el gráfico de cada función $f$ (izquierda) con el de su derivada $f'$ (derecha).`,
        pairs: ps.map(p => [{ graph: g(p.f) }, { graph: p.holes ? { pieces: [{ f: p.d, to: 0 }, { f: p.d, from: 0 }], points: [{ x: 0, y: -1, open: true }, { x: 0, y: 1, open: true }], xr: [-4, 4], yr: [-4, 4] } : g(p.d) }]),
        solution: [`[[grafico-derivada|Leer f' en el gráfico de f]]: donde $f$ crece, $f' > 0$; donde decrece, $f' < 0$; en máximos y mínimos, $f' = 0$.`, ...ps.map(p => p.why)]
      };
    }
  };

  /* =====================================================================
   *  CURSO
   * ===================================================================== */
  E.registerCourse({
    id: "calculo",
    title: "Cálculo en una variable",
    icon: "sigma",
    concepts: {
      "lim-grafico": { name: "Límites en un gráfico" },
      "lim-sustitucion": { name: "Límite por sustitución" },
      "lim-laterales": { name: "Límites laterales" },
      "lim-factorizar": { name: "0/0 por factorización" },
      "lim-conjugado": { name: "0/0 con conjugado" },
      "lim-trig": { name: "Límites trigonométricos" },
      "lim-infinito": { name: "Límites al infinito" },
      "lim-asintotas": { name: "Asíntotas" },
      "lim-infinitos": { name: "Límites infinitos" },
      "continuidad": { name: "Continuidad" },
      "bolzano": { name: "Teorema de Bolzano" },
      "graficos": { name: "Funciones y gráficos" },
      "der-definicion": { name: "Derivada por definición" },
      "der-continuidad": { name: "Derivabilidad y continuidad" },
      "der-potencia": { name: "Regla de la potencia" },
      "der-producto": { name: "Regla del producto" },
      "der-cociente": { name: "Regla del cociente" },
      "der-trig": { name: "Derivadas trigonométricas" },
      "der-explog": { name: "Derivadas de exp y ln" },
      "der-cadena": { name: "Regla de la cadena" },
      "der-tangente": { name: "Recta tangente" },
      "der-implicita": { name: "Derivación implícita" },
      "der-sucesivas": { name: "Derivadas sucesivas" },
      "der-grafica": { name: "Gráfico de f y de f'" }
    },
    units: [
      {
        id: "limites", title: "Límites y continuidad", icon: "target",
        diagnostic: ["lim-factor-num", "lim-sin-num", "cont-param-num"],
        lessons: [
          { id: "lim-idea", title: "Idea de límite", templates: ["lim-grafico-mc", "lim-sust-num", "lim-lateral-num", "lim-existe-vf"],
            intro: `$\\lim_{x\\to a} f(x) = L$ significa que $f(x)$ se acerca a $L$ cuando $x$ se acerca a $a$ (sin importar $f(a)$). El límite existe si y solo si los dos laterales existen y coinciden.` },
          { id: "lim-00", title: "Indeterminaciones 0/0", templates: ["lim-factor-num", "lim-conj-num", "lim-error-factor", "lim-order-conj"],
            intro: `Si al sustituir queda $\\frac{0}{0}$, hay que transformar: factorizar y cancelar, o multiplicar por el conjugado $\\sqrt{A} + B$ usando $(A-B)(A+B) = A^2 - B^2$.` },
          { id: "lim-trig", title: "Límites trigonométricos", templates: ["lim-sin-num", "lim-1cos-num"],
            intro: `$$\\lim_{u\\to 0}\\frac{\\sin u}{u} = 1 \\qquad \\lim_{u\\to 0}\\frac{1 - \\cos u}{u^2} = \\frac{1}{2}$$ Truco: multiplicar y dividir para que aparezca el mismo argumento abajo.` },
          { id: "lim-inf", title: "Límites infinitos y asíntotas", templates: ["lim-inf-cociente-num", "lim-asintota-mc", "lim-infinito-signo-mc"],
            intro: `Al infinito, en un cociente de polinomios mandan los términos de mayor grado. Si el denominador tiende a $0$ y el numerador no, el cociente tiende a $\\pm\\infty$: mirá los signos.` },
          { id: "cont", title: "Continuidad", templates: ["cont-tipo-mc", "cont-param-num", "cont-tvi-vf", "lim-match-graph"],
            intro: `$f$ es continua en $a$ si $\\lim_{x\\to a} f(x) = f(a)$. Bolzano: si $f$ es continua en $[a,b]$ y $f(a)f(b)<0$, tiene una raíz en $(a,b)$.` }
        ]
      },
      {
        id: "derivadas", title: "Derivadas", icon: "zap",
        diagnostic: ["der-prod-num", "der-cadena-mc", "der-coc-num"],
        lessons: [
          { id: "der-def", title: "Definición de derivada", templates: ["der-def-order", "der-def-num", "der-cont-vf"],
            intro: `$$f'(a) = \\lim_{h\\to 0}\\frac{f(a+h) - f(a)}{h}$$ Es la pendiente de la recta tangente. Derivable $\\Rightarrow$ continua (no al revés).` },
          { id: "der-basicas", title: "Reglas básicas", templates: ["der-pot-mc", "der-poly-num", "der-match-formula"],
            intro: `$(x^n)' = n\\,x^{n-1}$ para todo $n$ real. La derivada es lineal: $(af + bg)' = af' + bg'$.` },
          { id: "der-prodcoc", title: "Producto y cociente", templates: ["der-prod-num", "der-coc-num", "der-error-coc"],
            intro: `$$(uv)' = u'v + uv' \\qquad \\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}$$` },
          { id: "der-trans", title: "Trigonométricas, exp y ln", templates: ["der-trig-mc", "der-explog-num", "der-axnsin-num"],
            intro: `$(\\sin x)' = \\cos x$, $(\\cos x)' = -\\sin x$, $(\\tan x)' = \\sec^2 x$, $(e^x)' = e^x$, $(\\ln x)' = \\frac{1}{x}$.` },
          { id: "der-cadena", title: "Regla de la cadena", templates: ["der-cadena-mc", "der-cadena-num", "der-error-cadena", "der-order-lntrig"],
            intro: `$$\\big(f(g(x))\\big)' = f'(g(x))\\cdot g'(x)$$ Derivás la de afuera dejando la de adentro igual, y multiplicás por la derivada de la de adentro.` },
          { id: "der-apl", title: "Tangentes, implícita y sucesivas", templates: ["der-tangente-num", "der-implicita-num", "der-orden2-num", "der-match-graph"],
            intro: `Tangente en $a$: $y = f(a) + f'(a)(x - a)$. Implícita: derivás todo respecto de $x$ tratando $y$ como $y(x)$ (aparece $y'$) y despejás.` }
        ]
      },
      { id: "aplicaciones", title: "Aplicaciones de la derivada", icon: "chart-column", comingSoon: true },
      { id: "integrales", title: "Integrales", icon: "sigma", comingSoon: true },
      { id: "tecnicas", title: "Técnicas de integración", icon: "zap", comingSoon: true },
      { id: "apl-integral", title: "Aplicaciones de la integral", icon: "target", comingSoon: true },
      { id: "series", title: "Series", icon: "sparkles", comingSoon: true }
    ],
    templates: T
  });
})();
