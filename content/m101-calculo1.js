/*
 * M101 · Cálculo I — Licenciatura en Ciencias Básicas (FCEN, UNCuyo), Plan Ord. 77/15 C.S.
 * ===========================================================================================
 * Temario: programa oficial 2026 de Cálculo I (M101), 5 unidades:
 *   1 Conjuntos numéricos y funciones · 2 Límite y continuidad · 3 Derivadas (y aplicaciones)
 *   4 Integrales (y aplicaciones, impropias, EDO separables) · 5 Sucesiones y series
 * Las unidades 3 y 4 del programa se dividen en dos unidades de la app cada una (para que los
 * tests diagnósticos sean más finos); el campo `program` dice a qué unidad del programa pertenecen.
 *
 * El archivo es una secuencia de bloques: el primero registra la materia y cada bloque siguiente
 * agrega unidades con E.extendCourse (conceptos, plantillas, lecciones y apuntes).
 * Todo el texto y los ejercicios son originales.
 */
(function () {
  window.Efecen.registerCourse({ id: "m101", code: "M101", title: "Cálculo I", icon: "sigma" });
})();

/*
 * Bloque: Unidades 2 y 3 del programa (Límite y continuidad, Derivadas)
 * --------------------------------------------------------------------
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
  E.extendCourse("m101", {
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
        id: "limites", order: 2, program: "Unidad 2", title: "Límite y continuidad", icon: "target",
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
        id: "derivadas", order: 3, program: "Unidad 3", title: "Derivadas", icon: "zap",
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
    ],
    templates: T
  });
})();

/*
 * Apuntes de las unidades 1-3 (fichas de teoría navegables con hipervínculos).
 * ------------------------------------------------------------------
 * Cada ficha:
 *   group     unidad a la que pertenece (por defecto, la unidad del bloque)
 *   title     nombre visible
 *   aliases   términos que, si aparecen en un ejercicio o resolución, se vuelven link a esta ficha
 *   concepts  conceptos del curso que explica (para "Practicar este tema" y los links del feedback)
 *   summary   una línea (índice y cabecera)
 *   def / idea / demo / tips   bloques: texto (con $LaTeX$, **negrita**, <br>) o { graph, caption } / { svg, caption }
 *   examples  [{ q, steps: [...] }]
 *   see       ids de fichas relacionadas
 * Links explícitos dentro del texto:  [[id]]  o  [[id|texto visible]]
 *
 * Todo el texto es original.
 */
(function () {
  const E = window.Efecen;
  const R = String.raw;

  // Figura para la demostración de sen x / x (circunferencia de radio 1, x ≈ 40°)
  const UNIT_CIRCLE = `<svg viewBox="0 0 236 200" class="fig" role="img" aria-label="Circunferencia unitaria con los triángulos OAP y OAT y el sector OAP">
    <path d="M30 175 L190 175 L190 40.7 Z" style="fill:var(--gold);opacity:.3"/>
    <path d="M30 175 L190 175 A160 160 0 0 0 152.6 72.2 Z" style="fill:var(--primary);opacity:.18"/>
    <path d="M30 175 L190 175 L152.6 72.2 Z" style="fill:var(--primary);opacity:.3"/>
    <path d="M190 175 A160 160 0 0 0 30 15" style="fill:none;stroke:var(--muted);stroke-width:1.5"/>
    <path d="M22 175 H206 M30 183 V10" style="stroke:var(--muted);stroke-width:1.2"/>
    <path d="M30 175 L190 40.7" style="stroke:currentColor;stroke-width:2"/>
    <path d="M152.6 72.2 V175" style="stroke:var(--primary);stroke-width:3"/>
    <path d="M190 175 V40.7" style="stroke:var(--fire);stroke-width:3"/>
    <path d="M62 175 A32 32 0 0 0 54.5 154.4" style="fill:none;stroke:currentColor;stroke-width:1.5"/>
    <g style="fill:currentColor;font:700 13px Nunito,sans-serif">
      <text x="16" y="193">O</text><text x="186" y="193">A</text><text x="146" y="64">P</text><text x="196" y="40">T</text>
      <text x="68" y="166" style="font-style:italic">x</text><text x="104" y="192">1</text>
      <text x="118" y="132" style="fill:var(--primary)">sen x</text>
      <text x="196" y="112" style="fill:var(--fire)">tan x</text>
    </g></svg>`;

  const cards = {
    /* ========================= HERRAMIENTAS ========================= */
    "funcion": {
      group: "funciones", title: "Función, dominio e imagen", aliases: ["dominio"], concepts: ["graficos"],
      summary: "Una regla que a cada x del dominio le asigna un único valor f(x).",
      def: [R`Una **función** $f: A \to B$ es una regla que a cada elemento $x$ del conjunto $A$ (el **dominio**) le asigna **un único** elemento $f(x)$ de $B$. El conjunto de valores que efectivamente toma se llama **imagen**.`],
      idea: [R`Pensala como una máquina: entra $x$, sale $f(x)$. Para calcular [[limite|límites]] o [[derivada|derivadas]] importa mucho **dónde está definida**: por ejemplo $\frac{1}{x-2}$ no está definida en $x=2$ y $\sqrt{x}$ solo existe para $x \ge 0$.`,
        R`Las familias básicas tienen gráficos que conviene reconocer de un vistazo: $x^2$ es una parábola, $|x|$ una V, $\frac1x$ tiene [[asintotas|asíntotas]], $\sqrt x$ y $\ln x$ arrancan en un punto y crecen cada vez más lento, $e^x$ crece muy rápido y $\sin x$ oscila. Sumar una constante afuera sube o baja el gráfico; cambiar $x$ por $x - c$ lo corre $c$ a la derecha.`],
      examples: [{ q: R`¿Cuál es el dominio de $f(x)=\dfrac{\sqrt{x+3}}{x-1}$?`, steps: [R`La raíz pide $x+3\ge 0$, o sea $x \ge -3$.`, R`El denominador no puede ser $0$: $x \ne 1$.`, R`Dominio: $[-3, 1)\cup(1, +\infty)$.`] }],
      see: ["limite", "continuidad", "grafico-derivada"]
    },
    "radian": {
      group: "funciones", title: "Radianes", aliases: ["radianes", "radián"], concepts: ["lim-trig", "der-trig"],
      summary: "La medida natural de los ángulos: el largo del arco en la circunferencia de radio 1.",
      def: [R`Un ángulo mide $x$ **radianes** si, en una circunferencia de radio $1$, el arco que abarca mide $x$. Una vuelta entera es $2\pi$, así que $180^\circ = \pi$ y $1^\circ = \frac{\pi}{180}$.`],
      idea: [R`Los límites y las derivadas de funciones trigonométricas **solo dan "lindo" en radianes**. El [[lim-trig-notable|límite notable]] $\frac{\sin x}{x} \to 1$ sale de comparar el arco (que mide $x$) con el seno, y eso funciona porque el arco mide exactamente $x$. En grados daría $\frac{\pi}{180}$ y todas las [[derivadas-trig|derivadas trigonométricas]] arrastrarían ese factor.`],
      examples: [{ q: R`Pasá $135^\circ$ a radianes.`, steps: [R`Multiplicamos por $\frac{\pi}{180^\circ}$: $135\cdot\frac{\pi}{180} = \frac{3\pi}{4}$.`] }],
      see: ["lim-trig-notable", "identidades-trig"]
    },
    "identidades-trig": {
      group: "funciones", title: "Identidades trigonométricas útiles", aliases: ["identidad pitagórica", "identidades trigonométricas"], concepts: ["lim-trig", "der-trig"],
      summary: "sen² + cos² = 1, tan = sen/cos y ángulo doble: las que más se usan en cálculo.",
      def: [R`$$\sin^2 x + \cos^2 x = 1 \qquad \tan x = \frac{\sin x}{\cos x} \qquad \sec x = \frac{1}{\cos x}$$`,
        R`$$\sin(2x) = 2\sin x\cos x \qquad \cos(2x) = \cos^2 x - \sin^2 x = 1 - 2\sin^2 x$$`,
        R`$$\sin(a+b) = \sin a\cos b + \cos a\sin b$$`],
      idea: [R`La primera es Pitágoras en la circunferencia de radio $1$: el punto $(\cos x, \sin x)$ está a distancia $1$ del origen. En límites aparece mucho como $1 - \cos^2 x = \sin^2 x$, al multiplicar por el [[conjugado]] $1+\cos x$.`],
      examples: [{ q: R`Simplificá $\dfrac{1-\cos^2 x}{\sin x}$.`, steps: [R`Por la identidad pitagórica, $1-\cos^2 x = \sin^2 x$.`, R`$\dfrac{\sin^2 x}{\sin x} = \sin x$ (para $\sin x \neq 0$).`] }],
      see: ["lim-1-cos", "derivadas-trig", "radian"]
    },
    "factorizar": {
      group: "limites", title: "Factorizar polinomios", aliases: ["factorizamos", "factorizar", "factorizando", "Ruffini"], concepts: ["lim-factorizar"],
      summary: "Si r es raíz de p(x), entonces (x − r) divide a p(x).",
      def: [R`**Teorema del factor:** si $p(r) = 0$, entonces $p(x) = (x - r)\,q(x)$ para algún polinomio $q$ de un grado menos. El cociente $q$ sale dividiendo, por ejemplo con la regla de **Ruffini**.`,
        R`Para una cuadrática con raíces $r_1, r_2$: $\;x^2 + bx + c = (x - r_1)(x - r_2)$, con $r_1 + r_2 = -b$ y $r_1 r_2 = c$.`],
      idea: [R`Es la herramienta clave para la [[indeterminacion|indeterminación]] $\frac{0}{0}$ en cocientes de polinomios: si al sustituir $x=a$ arriba y abajo da $0$, entonces $a$ es raíz de los dos, así que **los dos tienen el factor $(x-a)$**, que se cancela.`],
      examples: [{ q: R`Factorizá $x^2 - x - 6$.`, steps: [R`Buscamos dos números que sumen $1$ (porque $-b = 1$) y multipliquen $-6$: son $3$ y $-2$.`, R`$x^2 - x - 6 = (x-3)(x+2)$.`, R`Chequeo: $(x-3)(x+2) = x^2 + 2x - 3x - 6$ ✓.`] }],
      tips: [R`Error típico con los signos: si las raíces son $3$ y $-2$, los factores son $(x-3)$ y $(x+2)$. **La raíz va con el signo cambiado.**`],
      see: ["indeterminacion", "conjugado"]
    },
    "conjugado": {
      group: "limites", title: "Multiplicar por el conjugado", aliases: ["conjugado"], concepts: ["lim-conjugado"],
      summary: "(A − B)(A + B) = A² − B²: sirve para sacar raíces del numerador.",
      def: [R`El **conjugado** de $A - B$ es $A + B$. Su producto es una diferencia de cuadrados: $$(A-B)(A+B) = A^2 - B^2.$$`],
      idea: [R`Si $A = \sqrt{\text{algo}}$, al elevar al cuadrado la raíz desaparece. Por eso, en un límite $\frac{\sqrt{g(x)} - c}{x - a}$ que da [[indeterminacion|indeterminación]] $\frac{0}{0}$, multiplicamos **arriba y abajo** por $\sqrt{g(x)} + c$ (eso es multiplicar por $1$, no cambia nada). El numerador queda $g(x) - c^2$ y aparece el factor $(x-a)$ para cancelar.`,
        R`Mismo truco con $1 - \cos x$: su conjugado es $1 + \cos x$ y el producto da $1 - \cos^2 x = \sin^2 x$ (ver [[lim-1-cos]]).`],
      examples: [{ q: R`Calculá $\displaystyle\lim_{x\to 4}\frac{\sqrt{x}-2}{x-4}$.`, steps: [R`Sustituyendo queda $\frac{0}{0}$.`, R`Multiplicamos por $\frac{\sqrt{x}+2}{\sqrt{x}+2}$: el numerador es $(\sqrt x)^2 - 2^2 = x - 4$.`, R`Queda $\dfrac{x-4}{(x-4)(\sqrt{x}+2)} = \dfrac{1}{\sqrt{x}+2}$ para $x\neq 4$.`, R`Sustituimos: $\dfrac{1}{2+2} = \dfrac14$.`] }],
      see: ["indeterminacion", "lim-1-cos"]
    },

    /* ========================= LÍMITES ========================= */
    "limite": {
      group: "limites", title: "Límite de una función", aliases: ["definición de límite", "límite bilateral"], concepts: ["lim-grafico", "lim-sustitucion"],
      summary: "f(x) se acerca a L cuando x se acerca a a, sin importar qué pasa justo en a.",
      def: [R`Decimos que $\displaystyle\lim_{x\to a} f(x) = L$ si podemos hacer que $f(x)$ esté **tan cerca de $L$ como queramos** tomando $x$ suficientemente cerca de $a$, **con $x \ne a$**.`,
        R`**Versión formal ($\varepsilon$-$\delta$):** para todo $\varepsilon > 0$ existe $\delta > 0$ tal que $$0 < |x - a| < \delta \implies |f(x) - L| < \varepsilon.$$`],
      idea: [R`El límite mira lo que pasa **alrededor** de $a$, no en $a$. Por eso una función puede tener límite en un punto donde no está definida, o donde vale otra cosa:`,
        { graph: { fns: [x => x / 2 + 1], points: [{ x: 2, y: 2, open: true }, { x: 2, y: -1 }], xr: [-3, 5], yr: [-3, 4] }, caption: R`Acá $\lim_{x\to 2} f(x) = 2$ aunque $f(2) = -1$.` },
        R`El límite existe si y solo si existen los [[limites-laterales|límites laterales]] y son iguales.`],
      demo: [R`**Una prueba con $\varepsilon$-$\delta$:** veamos que $\lim_{x\to 1}(3x+2) = 5$.`,
        R`Dado $\varepsilon>0$ queremos $|3x + 2 - 5| < \varepsilon$, o sea $3|x - 1| < \varepsilon$.`,
        R`Alcanza con $\delta = \varepsilon/3$: si $|x-1| < \delta$, entonces $|f(x) - 5| = 3|x-1| < 3\delta = \varepsilon$. $\blacksquare$`],
      examples: [{ q: R`Si $f(x) = \dfrac{x^2-1}{x-1}$, ¿existe $\lim_{x\to1} f(x)$?`, steps: [R`$f$ no está definida en $x=1$, pero eso no importa para el límite.`, R`Para $x\ne1$: $\dfrac{(x-1)(x+1)}{x-1} = x+1$.`, R`Entonces $\lim_{x\to1} f(x) = 2$.`] }],
      see: ["limites-laterales", "algebra-limites", "sustitucion", "indeterminacion"]
    },
    "limites-laterales": {
      group: "limites", title: "Límites laterales", aliases: ["límites laterales", "límite lateral", "laterales", "por izquierda", "por derecha"], concepts: ["lim-laterales", "lim-grafico"],
      summary: "Acercarse a a solo desde la izquierda (x < a) o solo desde la derecha (x > a).",
      def: [R`$\displaystyle\lim_{x\to a^-} f(x)$ es el límite tomando solo $x < a$ (**por izquierda**), y $\displaystyle\lim_{x\to a^+} f(x)$ tomando solo $x > a$ (**por derecha**).`,
        R`**Teorema:** $\displaystyle\lim_{x\to a} f(x) = L$ si y solo si los dos laterales existen y valen $L$.`],
      idea: [R`Son clave en funciones **a trozos**, donde de cada lado vale una fórmula distinta. Si los laterales no coinciden hay un salto y el límite no existe.`,
        { graph: { pieces: [{ f: x => x + 1, to: 1 }, { f: x => x - 2, from: 1 }], points: [{ x: 1, y: 2, open: true }, { x: 1, y: -1 }], xr: [-3, 5], yr: [-4, 4] }, caption: R`Por izquierda tiende a $2$, por derecha a $-1$: el límite en $x=1$ no existe.` }],
      examples: [{ q: R`Si $f(x)=\begin{cases} 2x+1 & x<1\\ x^2+2 & x\ge 1\end{cases}$, ¿existe $\lim_{x\to1}f(x)$?`, steps: [R`Por izquierda vale $2x+1$, que tiende a $3$.`, R`Por derecha vale $x^2+2$, que tiende a $3$.`, R`Coinciden: el límite existe y vale $3$.`] }],
      see: ["limite", "discontinuidades"]
    },
    "algebra-limites": {
      group: "limites", title: "Propiedades de los límites", aliases: ["propiedades de los límites", "álgebra de límites"], concepts: ["lim-sustitucion"],
      summary: "El límite de una suma, producto o cociente es la suma, producto o cociente de los límites (si existen).",
      def: [R`Si $\displaystyle\lim_{x\to a} f(x) = L$ y $\displaystyle\lim_{x\to a} g(x) = M$ son números, entonces:`,
        R`$$\lim (f \pm g) = L \pm M \qquad \lim (f\cdot g) = L\cdot M \qquad \lim \frac{f}{g} = \frac{L}{M}\ \ (\text{si } M \neq 0)$$`,
        R`y también $\lim c\,f = c\,L$, $\;\lim f^n = L^n$ y $\lim \sqrt[n]{f} = \sqrt[n]{L}$ (cuando la raíz tiene sentido).`],
      idea: [R`Estas reglas justifican la [[sustitucion|sustitución directa]] en polinomios y cocientes. **Ojo:** la del cociente solo vale si $M \ne 0$. Si $L = M = 0$ estamos ante una [[indeterminacion|indeterminación]] y hay que trabajar más.`],
      demo: [R`**Suma:** dado $\varepsilon > 0$, elegimos $\delta_1$ con $|f(x) - L| < \varepsilon/2$ y $\delta_2$ con $|g(x) - M| < \varepsilon/2$.`,
        R`Con $\delta = \min(\delta_1, \delta_2)$ y la desigualdad triangular: $|f + g - (L+M)| \le |f - L| + |g - M| < \varepsilon$. $\blacksquare$`],
      see: ["limite", "sustitucion"]
    },
    "sustitucion": {
      group: "limites", title: "Sustitución directa", aliases: ["sustitución directa", "sustituir", "sustituimos", "sustituyendo", "alcanza con sustituir"], concepts: ["lim-sustitucion"],
      summary: "Si f es continua en a, el límite es simplemente f(a).",
      def: [R`Si $f$ es [[continuidad|continua]] en $a$, entonces $\displaystyle\lim_{x\to a} f(x) = f(a)$: alcanza con **reemplazar $x$ por $a$**.`,
        R`Son continuas en todo su dominio: polinomios, cocientes de polinomios (donde el denominador no se anula), raíces, $\sin$, $\cos$, $e^x$, $\ln x$, y sumas, productos, cocientes y composiciones de ellas.`],
      idea: [R`**Siempre probá sustituir primero.** Puede pasar una de tres cosas:`,
        R`1. Da un número: ese es el límite.<br>2. Da $\frac{k}{0}$ con $k \ne 0$: es un [[limites-infinitos|límite infinito]] (mirá los signos).<br>3. Da $\frac{0}{0}$, $\frac{\infty}{\infty}$, etc.: es una [[indeterminacion|indeterminación]] y hay que transformar la expresión.`],
      examples: [{ q: R`Calculá $\displaystyle\lim_{x\to 2}\frac{x^2+1}{x+3}$.`, steps: [R`En $x=2$ el denominador vale $5 \neq 0$: la función es continua ahí.`, R`Sustituimos: $\dfrac{4+1}{5} = 1$.`] }],
      see: ["algebra-limites", "indeterminacion", "continuidad"]
    },
    "indeterminacion": {
      group: "limites", title: "Indeterminaciones", aliases: ["indeterminación", "indeterminaciones", "indeterminado", "forma indeterminada"], concepts: ["lim-factorizar", "lim-conjugado"],
      summary: "0/0, ∞/∞, ∞ − ∞, 0·∞…: expresiones cuyo límite depende del caso.",
      def: [R`Una **forma indeterminada** es una expresión como $\frac{0}{0}$, $\frac{\infty}{\infty}$, $\infty - \infty$, $0\cdot\infty$, $1^\infty$, $0^0$ o $\infty^0$ que aparece al sustituir y que **no determina** el valor del límite: según la función, puede dar cualquier cosa.`],
      idea: [R`Mirá estos tres límites, todos de la forma $\frac00$ en $x = 0$: $$\lim_{x\to 0}\frac{2x}{x} = 2 \qquad \lim_{x\to 0}\frac{x^2}{x} = 0 \qquad \lim_{x\to 0}\frac{x}{x^2}\ \text{no existe}$$ Por eso "$\frac00$" no es un resultado: es una señal de que hay que **transformar la expresión**.`,
        R`Herramientas según el caso: [[factorizar|factorizar y cancelar]], multiplicar por el [[conjugado]], usar los [[lim-trig-notable|límites notables]] o dividir por la mayor potencia en los [[limites-al-infinito|límites al infinito]]. (Más adelante, la regla de L'Hôpital.)`],
      examples: [{ q: R`Calculá $\displaystyle\lim_{x\to 3}\frac{x^2-9}{x-3}$.`, steps: [R`Sustituyendo queda $\frac{0}{0}$: indeterminado.`, R`[[factorizar|Factorizamos]]: $x^2 - 9 = (x-3)(x+3)$.`, R`Cancelamos $(x-3)$ y queda $x + 3 \to 6$.`] }],
      tips: [R`¿Por qué se puede cancelar? Porque el [[limite]] no mira $x = a$: para $x \neq a$ las dos expresiones son **iguales**, así que tienen el mismo límite.`],
      see: ["factorizar", "conjugado", "lim-trig-tecnicas"]
    },
    "sandwich": {
      group: "limites", title: "Teorema del sándwich", aliases: ["teorema del sándwich", "sándwich", "teorema de encaje"], concepts: ["lim-trig"],
      summary: "Si g ≤ f ≤ h y g, h tienden al mismo L, entonces f también tiende a L.",
      def: [R`Si cerca de $a$ (salvo quizás en $a$) vale $$g(x) \le f(x) \le h(x)$$ y $\displaystyle\lim_{x\to a} g(x) = \lim_{x\to a} h(x) = L$, entonces $\displaystyle\lim_{x\to a} f(x) = L$.`],
      idea: [R`$f$ queda "apretada" entre dos funciones que van al mismo lugar: no le queda otra que ir ahí también. Es la herramienta para límites donde no se puede despejar nada, como el [[lim-trig-notable|límite notable]] $\frac{\sin x}{x}$.`,
        { graph: { fns: [x => x * x * Math.sin(1 / x), x => x * x, x => -x * x], xr: [-1, 1], yr: [-1, 1] }, caption: R`En violeta, $x^2\sin(1/x)$; en naranja y verde, $\pm x^2$. Queda apretada y tiende a $0$.` }],
      demo: [R`Dado $\varepsilon > 0$, para $x$ suficientemente cerca de $a$ tenemos $L - \varepsilon < g(x)$ y $h(x) < L + \varepsilon$.`,
        R`Entonces $L - \varepsilon < g(x) \le f(x) \le h(x) < L + \varepsilon$, o sea $|f(x) - L| < \varepsilon$. $\blacksquare$`],
      examples: [{ q: R`Calculá $\displaystyle\lim_{x\to 0} x^2 \sin\!\left(\frac1x\right)$.`, steps: [R`No se puede sustituir: $\sin(1/x)$ oscila y no tiene límite.`, R`Pero $-1 \le \sin(1/x) \le 1$, así que $-x^2 \le x^2\sin(1/x) \le x^2$.`, R`Como $\pm x^2 \to 0$, por el sándwich el límite es $0$.`] }],
      see: ["lim-trig-notable", "limite"]
    },
    "lim-trig-notable": {
      group: "limites", title: "El límite notable sen x / x", aliases: ["límite notable", "límites notables"], concepts: ["lim-trig"],
      summary: "lim (x→0) sen(x)/x = 1: la base de todos los límites trigonométricos.",
      def: [R`$$\lim_{x\to 0}\frac{\sin x}{x} = 1$$ con $x$ medido en [[radian|radianes]]. Más en general, si $u(x) \to 0$ (y $u \neq 0$ cerca): $$\lim \frac{\sin u}{u} = 1.$$`],
      idea: [R`Para $x$ chico, **$\sin x \approx x$**: el seno y el arco casi coinciden. El gráfico de $\frac{\sin x}{x}$ no está definido en $0$, pero se acerca a $1$ por los dos lados:`,
        { graph: { fns: [x => Math.sin(x) / x], points: [{ x: 0, y: 1, open: true }], xr: [-10, 10], yr: [-1, 2] }, caption: R`$y = \frac{\sin x}{x}$, con el agujero en $(0, 1)$.` },
        R`Al sustituir queda $\frac{0}{0}$, una [[indeterminacion|indeterminación]], y no hay nada que factorizar. Por eso hace falta una demostración geométrica.`],
      demo: [R`Tomamos $0 < x < \frac{\pi}{2}$ en la circunferencia de radio $1$, con $P = (\cos x, \sin x)$, $A = (1, 0)$ y $T$ el punto donde la recta tangente en $A$ corta la recta $OP$:`,
        { svg: UNIT_CIRCLE, caption: R`Triángulo $OAP$ ⊂ sector $OAP$ ⊂ triángulo $OAT$.` },
        R`Comparando áreas: $$\underbrace{\tfrac12\sin x}_{\triangle OAP} \;\le\; \underbrace{\tfrac12 x}_{\text{sector}} \;\le\; \underbrace{\tfrac12\tan x}_{\triangle OAT}$$ El área del sector es $\frac{x}{2}$ justamente porque $x$ está en [[radian|radianes]].`,
        R`Dividimos por $\frac12 \sin x > 0$: $\;1 \le \dfrac{x}{\sin x} \le \dfrac{1}{\cos x}$. Invirtiendo (se dan vuelta las desigualdades): $$\cos x \le \frac{\sin x}{x} \le 1.$$`,
        R`Como $\cos x \to 1$ cuando $x\to 0$, por el [[sandwich|teorema del sándwich]] $\frac{\sin x}{x} \to 1$ por derecha. Por izquierda es lo mismo, porque $\frac{\sin x}{x}$ es par: $\frac{\sin(-x)}{-x} = \frac{\sin x}{x}$. $\blacksquare$`],
      examples: [
        { q: R`Calculá $\displaystyle\lim_{x\to 0}\frac{\sin(5x)}{x}$.`, steps: [R`Para usar el límite notable necesitamos **el mismo argumento abajo**: $5x$.`, R`Multiplicamos y dividimos por $5$: $\dfrac{\sin(5x)}{x} = 5\cdot\dfrac{\sin(5x)}{5x}$.`, R`Con $u = 5x \to 0$, $\dfrac{\sin u}{u} \to 1$. El límite es $5$.`] },
        { q: R`Calculá $\displaystyle\lim_{x\to 0}\frac{\tan x}{x}$.`, steps: [R`$\tan x = \frac{\sin x}{\cos x}$, así que $\dfrac{\tan x}{x} = \dfrac{\sin x}{x}\cdot\dfrac{1}{\cos x}$.`, R`El primer factor tiende a $1$ y el segundo a $\frac{1}{1} = 1$.`, R`Resultado: $1$.`] }
      ],
      tips: [R`**Solo vale si el argumento tiende a $0$.** Por ejemplo $\lim_{x\to\infty}\frac{\sin x}{x} = 0$ (no $1$): ahí el seno queda acotado y $x$ crece.`,
        R`El argumento del seno y el denominador tienen que ser **exactamente iguales**: $\frac{\sin 3x}{3x} \to 1$, pero $\frac{\sin 3x}{x} \to 3$.`],
      see: ["lim-trig-tecnicas", "lim-1-cos", "sandwich", "radian", "derivadas-trig"]
    },
    "lim-1-cos": {
      group: "limites", title: "El límite notable (1 − cos x)/x²", aliases: ["uno menos coseno"], concepts: ["lim-trig"],
      summary: "lim (x→0) (1 − cos x)/x² = 1/2, y (1 − cos x)/x → 0.",
      def: [R`$$\lim_{x\to 0}\frac{1 - \cos x}{x^2} = \frac{1}{2} \qquad\qquad \lim_{x\to 0}\frac{1-\cos x}{x} = 0$$`],
      idea: [R`Para $x$ chico, $\cos x \approx 1 - \frac{x^2}{2}$ (es el comienzo de su serie de Taylor), así que $1 - \cos x \approx \frac{x^2}{2}$.`],
      demo: [R`Multiplicamos y dividimos por el [[conjugado]] $1 + \cos x$ y usamos la [[identidades-trig|identidad pitagórica]]: $$\frac{1-\cos x}{x^2} = \frac{1-\cos^2 x}{x^2(1+\cos x)} = \frac{\sin^2 x}{x^2}\cdot\frac{1}{1+\cos x}.$$`,
        R`Reescribimos como $\left(\dfrac{\sin x}{x}\right)^2 \cdot \dfrac{1}{1+\cos x}$, que tiende a $1^2\cdot\dfrac{1}{2} = \dfrac{1}{2}$ por el [[lim-trig-notable|límite notable]]. $\blacksquare$`,
        R`El segundo sale del primero: $\dfrac{1-\cos x}{x} = x\cdot\dfrac{1-\cos x}{x^2} \to 0\cdot\frac12 = 0$.`],
      examples: [{ q: R`Calculá $\displaystyle\lim_{x\to 0}\frac{1-\cos(4x)}{x^2}$.`, steps: [R`Queremos $(4x)^2$ abajo: $\dfrac{1-\cos 4x}{x^2} = 16\cdot\dfrac{1-\cos 4x}{(4x)^2}$.`, R`Con $u = 4x \to 0$: $\dfrac{1-\cos u}{u^2}\to\dfrac12$.`, R`Resultado: $16\cdot\frac12 = 8$.`] }],
      see: ["lim-trig-notable", "conjugado", "lim-trig-tecnicas"]
    },
    "lim-trig-tecnicas": {
      group: "limites", title: "Cómo resolver límites trigonométricos", aliases: ["límites trigonométricos", "límite trigonométrico"], concepts: ["lim-trig"],
      summary: "Receta: sustituí, y si da 0/0 armá los límites notables con el argumento correcto.",
      def: [R`Los dos resultados que se usan todo el tiempo (con $u \to 0$): $$\frac{\sin u}{u} \to 1 \qquad\qquad \frac{1-\cos u}{u^2} \to \frac12$$ Sus demostraciones están en [[lim-trig-notable]] y [[lim-1-cos]].`],
      idea: [R`**Receta en 4 pasos:**`,
        R`1. **Sustituí.** Si no da una indeterminación, listo: las trigonométricas son [[continuidad|continuas]].<br>2. Pasá todo a $\sin$ y $\cos$ ($\tan = \frac{\sin}{\cos}$, etc.).<br>3. **Armá el argumento:** por cada $\sin(\square)$, hacé aparecer el mismo $\square$ en el denominador, multiplicando y dividiendo.<br>4. Reemplazá cada cociente notable por su límite y operá con lo que sobra.`,
        R`Multiplicar y dividir por lo mismo es multiplicar por $1$: no cambia la función, solo la escribe de forma que se vea el límite notable.`],
      examples: [
        { q: R`Calculá $\displaystyle\lim_{x\to 0}\frac{\sin(3x)}{\sin(7x)}$.`, steps: [R`Sustituyendo queda $\frac00$.`, R`Armamos los dos notables: $\dfrac{\sin 3x}{\sin 7x} = \dfrac{\sin 3x}{3x}\cdot\dfrac{7x}{\sin 7x}\cdot\dfrac{3x}{7x}$.`, R`Los dos primeros factores tienden a $1$, y $\dfrac{3x}{7x} = \dfrac37$.`, R`Resultado: $\dfrac{3}{7}$.`] },
        { q: R`Calculá $\displaystyle\lim_{x\to 0}\frac{x\tan x}{1-\cos x}$.`, steps: [R`Da $\frac00$. Pasamos a seno y coseno: $\dfrac{x\sin x}{\cos x\,(1-\cos x)}$.`, R`Dividimos arriba y abajo por $x^2$: $\dfrac{\frac{\sin x}{x}}{\cos x\cdot\frac{1-\cos x}{x^2}}$.`, R`Tiende a $\dfrac{1}{1\cdot\frac12} = 2$.`] }
      ],
      tips: [R`Error típico: "$\frac{\sin 3x}{\sin 7x} = \frac{3}{7}$ porque se simplifica el seno". ¡Una función no se simplifica! Acá el resultado coincide de casualidad, pero el razonamiento está mal: con $x \to \frac{\pi}{2}$ da $\frac{-1}{-1} = 1$, no $\frac37$.`],
      see: ["lim-trig-notable", "lim-1-cos", "identidades-trig"]
    },
    "limites-infinitos": {
      group: "limites", title: "Límites infinitos", aliases: ["límite infinito", "límites infinitos"], concepts: ["lim-infinitos"],
      summary: "Cuando el denominador tiende a 0 y el numerador no, el cociente se va a ±∞.",
      def: [R`$\displaystyle\lim_{x\to a} f(x) = +\infty$ significa que $f(x)$ se hace **más grande que cualquier número** cuando $x$ se acerca a $a$. Formalmente: para todo $M > 0$ existe $\delta > 0$ tal que $0<|x-a|<\delta \implies f(x) > M$.`],
      idea: [R`Si al [[sustitucion|sustituir]] queda $\frac{k}{0}$ con $k \ne 0$, el cociente "explota". El **signo** sale de mirar el signo de $k$ y el de lo que tiende a $0$ de cada lado:`,
        R`$x - a \to 0^+$ si $x \to a^+$, y $x - a \to 0^-$ si $x\to a^-$. En cambio $(x-a)^2 \to 0^+$ siempre.`,
        { graph: { fns: [x => 1 / (x - 1)], asym: { x: [1] }, xr: [-4, 6], yr: [-5, 5] }, caption: R`$\frac{1}{x-1}$ tiende a $-\infty$ por izquierda y a $+\infty$ por derecha.` }],
      examples: [{ q: R`Calculá $\displaystyle\lim_{x\to 2^-}\frac{3}{x-2}$.`, steps: [R`Si $x \to 2^-$, entonces $x < 2$ y $x - 2 \to 0^-$.`, R`Positivo sobre negativo muy chico: $-\infty$.`] }],
      tips: [R`Decir que el límite "es $+\infty$" es una forma de decir que **no existe** como número, pero describe cómo no existe.`],
      see: ["asintotas", "limites-laterales"]
    },
    "limites-al-infinito": {
      group: "limites", title: "Límites al infinito", aliases: ["límite al infinito", "límites al infinito", "mayor potencia", "coeficientes principales"], concepts: ["lim-infinito"],
      summary: "En cocientes de polinomios mandan los términos de mayor grado.",
      def: [R`$\displaystyle\lim_{x\to\infty} f(x) = L$ si $f(x)$ se acerca a $L$ cuando $x$ crece sin cota. El resultado básico es $\displaystyle\lim_{x\to\infty}\frac{1}{x^k} = 0$ para $k > 0$.`],
      idea: [R`Para un cociente de polinomios $\frac{p(x)}{q(x)}$, **dividimos todo por la mayor potencia del denominador**:`,
        R`• Si el grado de $p$ es menor que el de $q$, el límite es $0$.<br>• Si los grados son iguales, da el cociente de los **coeficientes principales**.<br>• Si el grado de $p$ es mayor, tiende a $\pm\infty$.`],
      demo: [R`Con $p(x) = a_n x^n + \dots$ y $q(x) = b_n x^n + \dots$ (mismo grado), dividimos por $x^n$: $$\frac{a_n + \frac{a_{n-1}}{x} + \dots}{b_n + \frac{b_{n-1}}{x} + \dots} \to \frac{a_n}{b_n}$$ porque cada $\frac{c}{x^k} \to 0$.`],
      examples: [{ q: R`Calculá $\displaystyle\lim_{x\to\infty}\frac{4x^2 - x}{2x^2 + 5}$.`, steps: [R`Dividimos por $x^2$: $\dfrac{4 - \frac1x}{2 + \frac{5}{x^2}}$.`, R`Tiende a $\dfrac{4}{2} = 2$.`] }],
      see: ["asintotas", "indeterminacion"]
    },
    "asintotas": {
      group: "limites", title: "Asíntotas", aliases: ["asíntota", "asíntotas", "asíntota vertical", "asíntota horizontal"], concepts: ["lim-asintotas"],
      summary: "Rectas a las que el gráfico se pega: verticales (límite infinito) y horizontales (límite al infinito).",
      def: [R`La recta $x = a$ es **asíntota vertical** de $f$ si alguno de los [[limites-laterales|límites laterales]] en $a$ es $\pm\infty$.`,
        R`La recta $y = L$ es **asíntota horizontal** si $\displaystyle\lim_{x\to+\infty} f(x) = L$ o $\displaystyle\lim_{x\to-\infty} f(x) = L$.`],
      idea: [R`En una función racional, las verticales están en los ceros del denominador **que no anulan también el numerador** (si lo anulan, puede ser una [[discontinuidades|discontinuidad evitable]]). Las horizontales salen de los [[limites-al-infinito|límites al infinito]].`,
        { graph: { fns: [x => (2 * x + 1) / (x - 1)], asym: { x: [1], y: [2] }, xr: [-6, 6], yr: [-5, 8] }, caption: R`$\frac{2x+1}{x-1}$, con asíntotas $x=1$ e $y=2$.` }],
      examples: [{ q: R`Encontrá las asíntotas de $f(x) = \dfrac{2x+1}{x-1}$.`, steps: [R`Vertical: el denominador se anula en $x=1$ y el numerador vale $3 \ne 0$, así que $x = 1$ es asíntota.`, R`Horizontal: los grados son iguales, $\lim_{x\to\pm\infty} f = \frac21 = 2$, así que $y = 2$.`] }],
      see: ["limites-infinitos", "limites-al-infinito"]
    },

    /* ========================= CONTINUIDAD ========================= */
    "continuidad": {
      group: "limites", title: "Continuidad", aliases: ["continua", "continuas", "continuidad"], concepts: ["continuidad"],
      summary: "f es continua en a si lim (x→a) f(x) = f(a): se dibuja sin levantar el lápiz.",
      def: [R`$f$ es **continua en $a$** si se cumplen tres cosas: $f(a)$ está definida, $\lim_{x\to a} f(x)$ existe y $$\lim_{x\to a} f(x) = f(a).$$`,
        R`$f$ es continua en un intervalo si lo es en cada punto (en los extremos, con [[limites-laterales|límites laterales]]).`],
      idea: [R`Intuitivamente: el gráfico no tiene saltos, agujeros ni asíntotas en ese tramo. Es exactamente la condición que permite la [[sustitucion|sustitución directa]].`],
      examples: [{ q: R`¿Qué valor de $k$ hace continua a $f(x)=\begin{cases} x + k & x<2\\ x^2 & x\ge 2\end{cases}$?`, steps: [R`Solo hay que revisar $x=2$ (cada trozo es un polinomio).`, R`Por izquierda el límite es $2 + k$. Por derecha (y $f(2)$) vale $4$.`, R`Igualamos: $2 + k = 4 \Rightarrow k = 2$.`] }],
      see: ["discontinuidades", "bolzano", "derivable-continua"]
    },
    "discontinuidades": {
      group: "limites", title: "Tipos de discontinuidad", aliases: ["discontinuidad", "discontinuidades", "evitable", "de salto"], concepts: ["continuidad"],
      summary: "Evitable (agujero), de salto (laterales distintos) o infinita (asíntota).",
      def: [R`Si $f$ no es continua en $a$, la discontinuidad puede ser:`,
        R`• **Evitable:** el límite existe pero no coincide con $f(a)$, o $f(a)$ no existe. Se arregla redefiniendo un punto.<br>• **De salto:** los [[limites-laterales|límites laterales]] existen pero son distintos.<br>• **Infinita:** algún lateral es $\pm\infty$ (hay [[asintotas|asíntota vertical]]).`],
      idea: [{ graph: { fns: [x => x / 2 + 1], points: [{ x: 2, y: 2, open: true }], xr: [-3, 5], yr: [-2, 4] }, caption: R`Evitable: un agujero en $x = 2$.` },
        { graph: { pieces: [{ f: () => 1, to: 0 }, { f: () => -1, from: 0 }], points: [{ x: 0, y: 1 }, { x: 0, y: -1, open: true }], xr: [-4, 4], yr: [-3, 3] }, caption: R`De salto en $x = 0$.` }],
      examples: [{ q: R`¿Qué discontinuidad tiene $\dfrac{x^2-4}{x-2}$ en $x=2$?`, steps: [R`No está definida en $2$, pero $\dfrac{(x-2)(x+2)}{x-2} = x+2 \to 4$.`, R`El límite existe: es **evitable** (definiendo $f(2)=4$ queda continua).`] }],
      see: ["continuidad", "asintotas"]
    },
    "bolzano": {
      group: "limites", title: "Teorema de Bolzano y del valor intermedio", aliases: ["Bolzano", "valor intermedio"], concepts: ["bolzano"],
      summary: "Una función continua que cambia de signo en [a, b] tiene una raíz en el medio.",
      def: [R`**Bolzano:** si $f$ es [[continuidad|continua]] en $[a,b]$ y $f(a)\cdot f(b) < 0$, existe $c \in (a,b)$ con $f(c) = 0$.`,
        R`**Valor intermedio** (generalización): si $f$ es continua en $[a,b]$, toma **todos** los valores entre $f(a)$ y $f(b)$.`],
      idea: [R`Si arrancás abajo del eje y terminás arriba **sin levantar el lápiz**, en algún momento cruzaste el eje. Las dos hipótesis importan: sin continuidad se puede "saltar" el cero, como $\frac1x$ en $[-1,1]$.`],
      demo: [R`Idea de la prueba (bisección): partimos $[a,b]$ a la mitad y nos quedamos con la mitad donde sigue habiendo cambio de signo. Repitiendo, los intervalos se achican hacia un punto $c$. Por continuidad, $f(c)$ es límite de valores positivos y también de valores negativos, así que $f(c) = 0$. La prueba completa usa la completitud de $\mathbb{R}$.`],
      examples: [{ q: R`¿Tiene $x^3 + x - 1$ una raíz en $(0,1)$?`, steps: [R`Es un polinomio, así que es continua.`, R`$f(0) = -1 < 0$ y $f(1) = 1 > 0$.`, R`Por Bolzano, sí: existe $c \in (0,1)$ con $f(c) = 0$.`] }],
      tips: [R`Si $f(a)$ y $f(b)$ tienen el **mismo** signo, Bolzano no dice nada: puede haber raíces o no.`],
      see: ["continuidad"]
    },

    /* ========================= DERIVADAS ========================= */
    "derivada": {
      group: "derivadas", title: "Derivada", aliases: ["cociente incremental", "definición de derivada", "usando la definición", "derivada por definición"], concepts: ["der-definicion"],
      summary: "f'(a) = lim (h→0) [f(a+h) − f(a)]/h: la pendiente de la recta tangente.",
      def: [R`$$f'(a) = \lim_{h\to 0}\frac{f(a+h) - f(a)}{h}$$ si ese límite existe. La expresión de adentro es el **cociente incremental**.`],
      idea: [R`El cociente incremental es la pendiente de la recta secante que pasa por $(a, f(a))$ y $(a+h, f(a+h))$. Cuando $h \to 0$, la secante gira hasta la [[recta-tangente|recta tangente]]: $f'(a)$ es su pendiente. En física, si $f$ es la posición, $f'$ es la velocidad instantánea.`],
      demo: [R`**Ejemplo:** derivada de $f(x) = x^2$ por definición.`,
        R`$\dfrac{(x+h)^2 - x^2}{h} = \dfrac{2xh + h^2}{h} = 2x + h$ (para $h\neq0$).`,
        R`Tomando $h \to 0$: $f'(x) = 2x$. $\blacksquare$`],
      examples: [{ q: R`¿Qué es el límite $\displaystyle\lim_{h\to 0}\frac{(3+h)^2 - 9}{h}$?`, steps: [R`Es la definición de $f'(3)$ con $f(x) = x^2$ (porque $f(3) = 9$).`, R`Como $f'(x) = 2x$, vale $6$.`] }],
      tips: [R`Al calcular por definición, **nunca reemplaces $h=0$ antes de cancelar**: daría $\frac00$, una [[indeterminacion|indeterminación]].`],
      see: ["recta-tangente", "derivable-continua", "regla-potencia"]
    },
    "derivable-continua": {
      group: "derivadas", title: "Derivable implica continua", aliases: ["derivable", "derivabilidad", "no es derivable"], concepts: ["der-continuidad"],
      summary: "Toda función derivable es continua; la recíproca es falsa (|x| en 0).",
      def: [R`**Teorema:** si $f$ es derivable en $a$, entonces $f$ es [[continuidad|continua]] en $a$.`, R`La recíproca es **falsa**: $|x|$ es continua en $0$ pero no es derivable ahí.`],
      idea: [R`Una función no es derivable en $a$ cuando tiene un **pico** (pendientes laterales distintas), una **tangente vertical** (como $\sqrt[3]{x}$ en $0$) o una **discontinuidad**.`,
        { graph: { fns: [x => Math.abs(x)], xr: [-4, 4], yr: [-1, 4] }, caption: R`$|x|$ tiene pendiente $-1$ a la izquierda y $1$ a la derecha.` }],
      demo: [R`Para $x \ne a$: $$f(x) - f(a) = \frac{f(x) - f(a)}{x - a}\cdot(x - a).$$`,
        R`Cuando $x \to a$, el primer factor tiende a $f'(a)$ y el segundo a $0$, así que $f(x) - f(a) \to f'(a)\cdot 0 = 0$, o sea $\lim_{x\to a} f(x) = f(a)$. $\blacksquare$`],
      examples: [{ q: R`¿Es derivable $|x|$ en $0$?`, steps: [R`El cociente $\dfrac{|h| - 0}{h}$ vale $1$ si $h > 0$ y $-1$ si $h < 0$.`, R`Los [[limites-laterales|límites laterales]] son distintos: no existe $f'(0)$.`] }],
      see: ["derivada", "continuidad"]
    },
    "regla-potencia": {
      group: "derivadas", title: "Regla de la potencia", aliases: ["regla de la potencia", "término a término"], concepts: ["der-potencia"],
      summary: "(xⁿ)' = n·xⁿ⁻¹ para cualquier exponente real; la derivada es lineal.",
      def: [R`$$(x^n)' = n\,x^{n-1} \qquad\text{para todo } n \in \mathbb{R}$$ Además la derivada es **lineal**: $(a f + b g)' = a f' + b g'$, así que los polinomios se derivan **término a término**.`],
      idea: [R`Vale también con exponentes negativos o fraccionarios, reescribiendo: $\frac{1}{x^3} = x^{-3}$ y $\sqrt{x} = x^{1/2}$.`],
      demo: [R`Para $n$ natural, por el binomio de Newton: $(x+h)^n = x^n + n x^{n-1}h + (\text{términos con } h^2)$.`,
        R`Entonces $\dfrac{(x+h)^n - x^n}{h} = n x^{n-1} + h\cdot(\dots) \to n x^{n-1}$. $\blacksquare$ Para exponente real se prueba más adelante con $x^n = e^{n\ln x}$.`],
      examples: [{ q: R`Derivá $f(x) = 3x^4 - \dfrac{2}{x^2} + \sqrt{x}$.`, steps: [R`Reescribimos: $3x^4 - 2x^{-2} + x^{1/2}$.`, R`$f'(x) = 12x^3 + 4x^{-3} + \frac12 x^{-1/2} = 12x^3 + \dfrac{4}{x^3} + \dfrac{1}{2\sqrt{x}}$.`] }],
      tips: [R`Con exponente negativo, el exponente igual **baja** en uno: $(x^{-2})' = -2x^{-3}$, no $-2x^{-1}$.`],
      see: ["derivada", "regla-producto"]
    },
    "regla-producto": {
      group: "derivadas", title: "Regla del producto", aliases: ["regla del producto"], concepts: ["der-producto"],
      summary: "(uv)' = u'v + uv'.",
      def: [R`$$(u\,v)' = u'\,v + u\,v'$$`],
      idea: [R`Pensalo como un rectángulo de lados $u$ y $v$: si los dos lados crecen un poquito, el área crece en dos franjas, $u'v$ y $uv'$ (el cuadradito de la esquina es despreciable). **Ojo:** $(uv)' \neq u'v'$.`],
      demo: [R`Sumamos y restamos $u(x+h)v(x)$: $$\frac{u(x+h)v(x+h) - u(x)v(x)}{h} = u(x+h)\,\frac{v(x+h)-v(x)}{h} + v(x)\,\frac{u(x+h)-u(x)}{h}.$$`,
        R`Cuando $h\to0$: $u(x+h)\to u(x)$, porque $u$ es [[derivable-continua|derivable y por lo tanto continua]], y los cocientes tienden a $v'$ y $u'$. $\blacksquare$`],
      examples: [{ q: R`Derivá $f(x) = x^2\sin x$.`, steps: [R`$u = x^2$, $u' = 2x$; $\;v = \sin x$, $v' = \cos x$.`, R`$f'(x) = 2x\sin x + x^2\cos x$.`] }],
      see: ["regla-cociente", "regla-cadena"]
    },
    "regla-cociente": {
      group: "derivadas", title: "Regla del cociente", aliases: ["regla del cociente"], concepts: ["der-cociente"],
      summary: "(u/v)' = (u'v − uv')/v².",
      def: [R`$$\left(\frac{u}{v}\right)' = \frac{u'\,v - u\,v'}{v^2} \qquad (v \neq 0)$$`],
      idea: [R`Para acordarse del orden: **"la de arriba derivada por la de abajo, menos la de arriba por la de abajo derivada, todo sobre la de abajo al cuadrado"**. El orden importa por el signo menos.`],
      demo: [R`Escribimos $\frac{u}{v} = u\cdot v^{-1}$ y usamos la [[regla-producto|regla del producto]] y la [[regla-cadena|de la cadena]]: $$\left(u v^{-1}\right)' = u' v^{-1} + u\cdot\left(-v^{-2}v'\right) = \frac{u'v - uv'}{v^2}. \;\blacksquare$$`],
      examples: [{ q: R`Derivá $f(x) = \dfrac{x}{x^2+1}$.`, steps: [R`$u' = 1$ y $v' = 2x$.`, R`$f'(x) = \dfrac{1\cdot(x^2+1) - x\cdot 2x}{(x^2+1)^2} = \dfrac{1 - x^2}{(x^2+1)^2}$.`] }],
      tips: [R`Errores típicos: invertir el orden del numerador, u olvidarse de elevar al cuadrado el denominador.`],
      see: ["regla-producto", "derivadas-trig"]
    },
    "derivadas-trig": {
      group: "derivadas", title: "Derivadas trigonométricas", aliases: ["derivadas trigonométricas", "derivada del seno", "derivada del coseno"], concepts: ["der-trig"],
      summary: "(sen x)' = cos x, (cos x)' = −sen x, (tan x)' = sec² x.",
      def: [R`$$(\sin x)' = \cos x \qquad (\cos x)' = -\sin x \qquad (\tan x)' = \sec^2 x$$ $$(\sec x)' = \sec x\tan x \qquad (\cot x)' = -\csc^2 x$$ Todo con $x$ en [[radian|radianes]].`],
      idea: [R`La pendiente del seno en cada punto es el valor del coseno: en $x = 0$ el seno sube con pendiente $1 = \cos 0$, y en $x = \frac\pi2$ está en su máximo, con pendiente $0 = \cos\frac\pi2$.`,
        { graph: { fns: [x => Math.sin(x), x => Math.cos(x)], xr: [-7, 7], yr: [-2, 2] }, caption: R`En violeta $\sin x$, en naranja su derivada $\cos x$.` }],
      demo: [R`Por definición y con la fórmula del [[identidades-trig|seno de una suma]]: $$\frac{\sin(x+h) - \sin x}{h} = \sin x\,\frac{\cos h - 1}{h} + \cos x\,\frac{\sin h}{h}.$$`,
        R`Por los límites notables, $\frac{\sin h}{h}\to 1$ ([[lim-trig-notable]]) y $\frac{\cos h - 1}{h}\to 0$ ([[lim-1-cos]]). Queda $(\sin x)' = \cos x$. $\blacksquare$`,
        R`Las demás salen de esta: $\cos x = \sin(\frac\pi2 - x)$, y $\tan = \frac{\sin}{\cos}$ con la [[regla-cociente|regla del cociente]].`],
      examples: [{ q: R`Derivá $\tan x$ usando que $\tan x = \frac{\sin x}{\cos x}$.`, steps: [R`$\left(\dfrac{\sin x}{\cos x}\right)' = \dfrac{\cos x\cos x - \sin x\,(-\sin x)}{\cos^2 x}$.`, R`$= \dfrac{\cos^2 x + \sin^2 x}{\cos^2 x} = \dfrac{1}{\cos^2 x} = \sec^2 x$.`] }],
      see: ["lim-trig-notable", "regla-cadena", "identidades-trig"]
    },
    "exp-log": {
      group: "derivadas", title: "Exponencial y logaritmo", aliases: ["exponencial", "logaritmo", "número e"], concepts: ["der-explog"],
      summary: "(eˣ)' = eˣ y (ln x)' = 1/x.",
      def: [R`$$(e^x)' = e^x \qquad (\ln x)' = \frac{1}{x} \quad (x>0)$$ Más en general, $(a^x)' = a^x \ln a$.`],
      idea: [R`El **número $e \approx 2{,}718$** es justamente la base para la cual la exponencial es su propia derivada: su pendiente en cada punto es igual a su altura. Dicho de otra forma, $\displaystyle\lim_{h\to0}\frac{e^h - 1}{h} = 1$.`],
      demo: [R`**$e^x$:** $\dfrac{e^{x+h} - e^x}{h} = e^x\cdot\dfrac{e^h - 1}{h} \to e^x \cdot 1$.`,
        R`**$\ln x$:** como $e^{\ln x} = x$, derivando con la [[regla-cadena|regla de la cadena]] queda $e^{\ln x}\cdot(\ln x)' = 1$, o sea $x\,(\ln x)' = 1$. $\blacksquare$`],
      examples: [{ q: R`Derivá $f(x) = 3e^x - 2\ln x$ y evaluá en $x=1$.`, steps: [R`$f'(x) = 3e^x - \dfrac{2}{x}$.`, R`$f'(1) = 3e - 2 \approx 6{,}15$.`] }],
      see: ["regla-cadena", "regla-potencia"]
    },
    "regla-cadena": {
      group: "derivadas", title: "Regla de la cadena", aliases: ["regla de la cadena", "cadena"], concepts: ["der-cadena"],
      summary: "(f(g(x)))' = f'(g(x))·g'(x): derivada de afuera por derivada de adentro.",
      def: [R`$$\big(f(g(x))\big)' = f'\big(g(x)\big)\cdot g'(x)$$ En notación de Leibniz, con $y = f(u)$ y $u = g(x)$: $\;\dfrac{dy}{dx} = \dfrac{dy}{du}\cdot\dfrac{du}{dx}$.`],
      idea: [R`Si $u$ cambia $g'$ veces más rápido que $x$, e $y$ cambia $f'$ veces más rápido que $u$, entonces $y$ cambia $f'\cdot g'$ veces más rápido que $x$: como dos engranajes.`,
        R`**Receta:** identificá la función de afuera y la de adentro. Derivá la de afuera **dejando la de adentro igual**, y multiplicá por la derivada de la de adentro. Si hay más capas, se repite.`],
      demo: [R`Idea, cuando $g(x+h) \neq g(x)$ para $h$ chico: $$\frac{f(g(x+h)) - f(g(x))}{h} = \frac{f(g(x+h)) - f(g(x))}{g(x+h) - g(x)}\cdot\frac{g(x+h) - g(x)}{h}.$$`,
        R`Con $k = g(x+h) - g(x) \to 0$ (porque $g$ es continua), el primer factor tiende a $f'(g(x))$ y el segundo a $g'(x)$. $\blacksquare$ La prueba completa evita dividir por $0$ con una función auxiliar.`],
      examples: [
        { q: R`Derivá $(x^2+1)^5$.`, steps: [R`Afuera: $u^5$. Adentro: $u = x^2 + 1$.`, R`$5(x^2+1)^4\cdot 2x = 10x(x^2+1)^4$.`] },
        { q: R`Derivá $\sin^2(3x)$.`, steps: [R`Hay tres capas: $(\cdot)^2$, $\sin(\cdot)$ y $3x$.`, R`$2\sin(3x)\cdot\cos(3x)\cdot 3 = 6\sin(3x)\cos(3x)$.`] }
      ],
      tips: [R`Error típico: olvidarse de multiplicar por $g'(x)$, o derivar lo de adentro y dejarlo adentro: $(\sin(x^2))' = 2x\cos(x^2)$, **no** $\cos(2x)$.`],
      see: ["regla-producto", "derivadas-trig", "implicita"]
    },
    "recta-tangente": {
      group: "derivadas", title: "Recta tangente", aliases: ["recta tangente"], concepts: ["der-tangente"],
      summary: "y = f(a) + f'(a)(x − a).",
      def: [R`La recta tangente al gráfico de $f$ en $(a, f(a))$ es $$y = f(a) + f'(a)\,(x - a).$$`],
      idea: [R`Es la recta que pasa por el punto y tiene pendiente $f'(a)$, la [[derivada]]. Cerca de $a$, $f(x) \approx f(a) + f'(a)(x-a)$: es la **mejor aproximación lineal** de $f$.`,
        { graph: { fns: [x => x * x / 2, x => 2 * x - 2], points: [{ x: 2, y: 2 }], xr: [-2, 5], yr: [-3, 6] }, caption: R`En violeta $y=\frac{x^2}{2}$; en naranja su tangente en $x=2$, $\;y = 2x - 2$.` }],
      examples: [{ q: R`Encontrá la tangente a $f(x) = x^2/2$ en $x = 2$.`, steps: [R`$f(2) = 2$ y $f'(x) = x$, así que $f'(2) = 2$.`, R`$y = 2 + 2(x - 2) = 2x - 2$.`] }],
      see: ["derivada", "implicita"]
    },
    "implicita": {
      group: "derivadas", title: "Derivación implícita", aliases: ["derivación implícita", "implícitamente", "implícita"], concepts: ["der-implicita"],
      summary: "Derivar ambos lados respecto de x tratando a y como y(x), y despejar y'.",
      def: [R`Si una curva está dada por una ecuación $F(x, y) = 0$ sin despejar $y$, derivamos **ambos lados respecto de $x$** pensando $y = y(x)$. Cada vez que derivamos algo con $y$ aparece un factor $y'$, por la [[regla-cadena|regla de la cadena]]. Después despejamos $y'$.`],
      idea: [R`¿Por qué aparece $y'$? Porque $\frac{d}{dx}\left(y^2\right) = 2y\cdot y'$, igual que $\frac{d}{dx}\left(g(x)^2\right) = 2g(x)\,g'(x)$.`],
      examples: [
        { q: R`Calculá la pendiente de $x^2 + y^2 = 25$ en $(3, 4)$.`, steps: [R`Derivamos: $2x + 2y\,y' = 0$.`, R`Despejamos: $y' = -\dfrac{x}{y}$.`, R`En $(3,4)$: $y' = -\dfrac34$.`] },
        { q: R`Calculá $y'$ en $xy + y^2 = 6$.`, steps: [R`[[regla-producto|Regla del producto]] en $xy$: $y + x\,y' + 2y\,y' = 0$.`, R`$y'(x + 2y) = -y \Rightarrow y' = -\dfrac{y}{x + 2y}$.`] }
      ],
      see: ["regla-cadena", "recta-tangente"]
    },
    "derivadas-sucesivas": {
      group: "derivadas", title: "Derivadas sucesivas", aliases: ["derivada segunda", "derivadas sucesivas", "derivadas de orden superior"], concepts: ["der-sucesivas"],
      summary: "f'' es la derivada de f': mide cómo cambia la pendiente (concavidad, aceleración).",
      def: [R`La **derivada segunda** es $f'' = (f')'$, la tercera es $f''' = (f'')'$, y en general $f^{(n)}$.`],
      idea: [R`Si $f$ es la posición, $f'$ es la velocidad y $f''$ la **aceleración**. Geométricamente, $f'' > 0$ indica concavidad hacia arriba: la pendiente crece.`],
      examples: [{ q: R`Si $f(x) = \sin(2x)$, calculá $f''(x)$.`, steps: [R`$f'(x) = 2\cos(2x)$, por la [[regla-cadena|regla de la cadena]].`, R`$f''(x) = -4\sin(2x)$.`] }],
      tips: [R`Con $e^{kx}$, cada derivada multiplica por $k$: $\left(e^{kx}\right)^{(n)} = k^n e^{kx}$.`],
      see: ["derivada", "grafico-derivada"]
    },
    "grafico-derivada": {
      group: "derivadas", title: "Leer f' en el gráfico de f", aliases: ["gráfico de la derivada"], concepts: ["der-grafica", "graficos"],
      summary: "Donde f crece, f' > 0; donde decrece, f' < 0; en máximos y mínimos, f' = 0.",
      def: [R`Si $f' > 0$ en un intervalo, $f$ **crece** ahí; si $f' < 0$, **decrece**. En un máximo o mínimo local con tangente, $f' = 0$.`],
      idea: [R`Para dibujar $f'$ a partir de $f$, recorré el gráfico de $f$ de izquierda a derecha y preguntate **qué tan empinado está** en cada punto: esa pendiente es la altura de $f'$.`,
        { graph: { fns: [x => x ** 3 / 3 - 2 * x, x => x * x - 2], xr: [-4, 4], yr: [-4, 4] }, caption: R`En violeta $f = \frac{x^3}{3} - 2x$; en naranja $f' = x^2 - 2$, que se anula justo donde $f$ tiene su máximo y su mínimo.` }],
      examples: [{ q: R`Si $f$ es una parábola con mínimo en $x = 1$, ¿cómo es $f'$?`, steps: [R`A la izquierda de $1$, $f$ decrece: $f' < 0$. A la derecha crece: $f' > 0$.`, R`$f'(1) = 0$. De hecho, $f'$ es una recta creciente que corta el eje en $x = 1$.`] }],
      see: ["derivada", "derivadas-sucesivas", "funcion"]
    }
  };

  E.extendCourse("m101", {
    cards,
    // qué fichas conviene leer antes de cada lección (en orden)
    lessons: {
      "lim-idea": ["limite", "limites-laterales", "sustitucion", "algebra-limites"],
      "lim-00": ["indeterminacion", "factorizar", "conjugado"],
      "lim-trig": ["lim-trig-tecnicas", "lim-trig-notable", "lim-1-cos", "sandwich", "radian", "identidades-trig"],
      "lim-inf": ["limites-infinitos", "limites-al-infinito", "asintotas"],
      "cont": ["continuidad", "discontinuidades", "bolzano", "funcion"],
      "der-def": ["derivada", "derivable-continua"],
      "der-basicas": ["regla-potencia", "derivadas-trig", "exp-log"],
      "der-prodcoc": ["regla-producto", "regla-cociente"],
      "der-trans": ["derivadas-trig", "exp-log"],
      "der-cadena": ["regla-cadena"],
      "der-apl": ["recta-tangente", "implicita", "derivadas-sucesivas", "grafico-derivada"]
    }
  });
})();

/* =====================================================================
 *  UNIDAD 1 · CONJUNTOS NUMÉRICOS Y FUNCIONES
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { frac, num, poly, polyc, xp, xm, cf, kx, par, sg } = H;
  const T = {};

  // ---------- Lección: números reales y complejos ----------
  const SETS = ["\\mathbb{N}", "\\mathbb{Z}", "\\mathbb{Q}", "\\mathbb{R}\\setminus\\mathbb{Q}", "\\mathbb{C}\\setminus\\mathbb{R}"];
  const SET_NAMES = ["natural", "entero (no natural)", "racional (no entero)", "irracional", "complejo no real"];
  T["num-clasif-mc"] = {
    type: "mc", concepts: ["conjuntos-num"], difficulty: 1,
    generate(r) {
      // cada caso: LaTeX, valor numérico (o null si no es real) y conjunto más chico
      const cases = [
        () => { const k = r.int(2, 9); return { t: `\\sqrt{${k * k}}`, v: k, set: 0 }; },
        () => { const k = r.int(2, 9); return { t: `-\\sqrt{${k * k}}`, v: -k, set: 1 }; },
        () => { const [p, q] = r.distinct(2, 2, 9); if (p % q === 0) return null; return { t: `\\frac{${p * 3}}{${q * 3}}`, v: p / q, set: 2 }; },
        () => { const k = r.pick([2, 3, 5, 6, 7, 8, 10, 11]); return { t: `\\sqrt{${k}}`, v: Math.sqrt(k), set: 3 }; },
        () => { const k = r.int(2, 6); return { t: `${k}\\pi`, v: k * Math.PI, set: 3 }; },
        () => { const k = r.int(2, 9); return { t: `\\sqrt{-${k * k}}`, v: null, set: 4, it: `${k}i` }; },
        () => { const k = r.int(2, 9); return { t: `${k} - ${k}`, v: 0, set: 0, zero: true }; },
        () => { const k = r.int(1, 8); return { t: `0{,}${k}${k}${k}\\ldots`, v: k / 9, set: 2 }; }
      ];
      const c = r.pick(cases)();
      if (!c || c.zero) return null;
      return {
        prompt: `¿Cuál es el conjunto **más chico** de estos al que pertenece $${c.t}$?`,
        ...H.mc(r, SETS[c.set], SETS.filter((_, i) => i !== c.set).slice(0, 3), { keepOrder: false }),
        solution: [
          `Recordá la cadena $\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R} \\subset \\mathbb{C}$ ([[conjuntos-numericos|conjuntos numéricos]]).`,
          c.v === null ? `$${c.t} = ${c.it}$: ningún real elevado al cuadrado da un negativo ([[numeros-complejos|números complejos]]).` : `$${c.t} = ${num(c.v, 4)}${c.set === 3 ? "\\ldots" : ""}$.`,
          `Es ${SET_NAMES[c.set]}.`
        ],
        // verificación: clasificar a partir del valor numérico
        verify: { kind: "value", target: c.set, fn: () => c.v === null ? 4 : Number.isInteger(c.v) ? (c.v >= 0 ? 0 : 1) : isRationalSmall(c.v) ? 2 : 3 }
      };
    }
  };
  // ¿x es p/q con q ≤ 100? (para distinguir racionales de irracionales en la verificación)
  function isRationalSmall(x) { for (let q = 1; q <= 100; q++) if (Math.abs(x * q - Math.round(x * q)) < 1e-9) return true; return false; }

  T["abs-ineq-num"] = {
    type: "numeric", concepts: ["valor-absoluto"], difficulty: 2,
    generate(r) {
      const m = r.pick([1, 2, 3]), c = r.int(-6, 6), b = r.int(1, 9);
      const lo = (-b - c) / m, hi = (b - c) / m;
      const askHi = r.bool();
      const lin = polyc([m, c]);
      return {
        prompt: `El conjunto solución de $|${lin}| < ${b}$ es un intervalo $(p, q)$. ¿Cuánto vale ${askHi ? "$q$" : "$p$"}?`,
        answer: askHi ? hi : lo, answerTex: askHi ? frac(b - c, m) : frac(-b - c, m),
        solution: [
          `$|A| < b \\iff -b < A < b$ ([[valor-absoluto|valor absoluto]]).`,
          `$-${b} < ${lin} < ${b}$`,
          `Restamos $${c}$ ${m > 1 ? `y dividimos por $${m}$` : ""}: $${frac(-b - c, m)} < x < ${frac(b - c, m)}$.`
        ],
        verify: { kind: "zero", fn: ans => [Math.abs(m * ans + c) - b] }
      };
    }
  };

  T["complex-num"] = {
    type: "numeric", concepts: ["complejos"], difficulty: 2,
    generate(r) {
      const a = r.nz(-5, 5), b = r.nz(-5, 5), c = r.nz(-5, 5), d = r.nz(-5, 5);
      const z = `${a}${b < 0 ? "-" : "+"}${Math.abs(b) === 1 ? "" : Math.abs(b)}i`, w2 = `${c}${d < 0 ? "-" : "+"}${Math.abs(d) === 1 ? "" : Math.abs(d)}i`;
      const re = a * c - b * d, im = a * d + b * c;
      const ask = r.pick(["re", "im", "mod2"]);
      const ans = ask === "re" ? re : ask === "im" ? im : re * re + im * im;
      const q = ask === "re" ? "la parte real de" : ask === "im" ? "la parte imaginaria de" : "el módulo al cuadrado, $|zw|^2$, de";
      return {
        prompt: `Sean $z = ${z}$ y $w = ${w2}$. Calculá ${q} ${ask === "mod2" ? "ese producto" : "$z\\,w$"}.`,
        answer: ans,
        solution: [
          `Distribuimos usando $i^2 = -1$ ([[numeros-complejos|números complejos]]): $(${z})(${w2}) = ${a * c} ${sg(a * d).trim()}i ${sg(b * c).trim()}i ${sg(-b * d).trim()}$.`,
          `$z\\,w = ${re} ${im < 0 ? "-" : "+"} ${Math.abs(im)}i$.`,
          ask === "mod2" ? `$|zw|^2 = ${re}^2 + ${par(im)}^2 = ${ans}$ (también $= |z|^2|w|^2 = ${a * a + b * b}\\cdot${c * c + d * d}$).` : `Respuesta: $${ans}$.`
        ],
        // verificación por forma polar: módulos que se multiplican y argumentos que se suman
        verify: { kind: "value", tol: 1e-9, fn: () => {
          const r1 = Math.hypot(a, b), r2 = Math.hypot(c, d), t = Math.atan2(b, a) + Math.atan2(d, c);
          return ask === "re" ? r1 * r2 * Math.cos(t) : ask === "im" ? r1 * r2 * Math.sin(t) : (r1 * r2) ** 2;
        } }
      };
    }
  };

  T["abs-vf"] = {
    type: "tf", concepts: ["valor-absoluto", "complejos"], difficulty: 1,
    generate(r) {
      if (r.bool()) {
        const a = r.int(-5, 5), b = r.int(1, 6), x0 = r.int(-10, 10);
        const truth = Math.abs(x0 - a) <= b;
        return {
          prompt: `<b>Verdadero o falso:</b> $x = ${x0}$ cumple $|x ${a < 0 ? "+ " + -a : "- " + a}| \\le ${b}$.`,
          answer: truth,
          explanation: `$|${x0} ${a < 0 ? "+ " + -a : "- " + a}| = ${Math.abs(x0 - a)}$, que ${truth ? "sí" : "no"} es $\\le ${b}$. Geométricamente: la distancia de $${x0}$ a $${a}$ es $${Math.abs(x0 - a)}$.`,
          solution: [`$|x - a| \\le b$ dice que $x$ está a distancia a lo sumo $b$ de $a$ ([[valor-absoluto]]).`],
          verify: { kind: "truth", fn: () => x0 >= a - b && x0 <= a + b }
        };
      }
      const a = r.int(-6, 6), b = r.int(-6, 6), m = r.int(1, 9);
      const mod2 = a * a + b * b, truth = mod2 === m * m;
      return {
        prompt: `<b>Verdadero o falso:</b> el complejo $z = ${a} ${b < 0 ? "-" : "+"} ${Math.abs(b)}i$ tiene módulo $${m}$.`,
        answer: truth,
        explanation: `$|z| = \\sqrt{${a}^2 + ${par(b)}^2} = \\sqrt{${mod2}}${Number.isInteger(Math.sqrt(mod2)) ? " = " + Math.sqrt(mod2) : ""}$, ${truth ? "que es" : "que no es"} $${m}$.`,
        solution: [`$|a + bi| = \\sqrt{a^2 + b^2}$: es la distancia al origen en el plano complejo ([[numeros-complejos]]).`],
        verify: { kind: "truth", fn: () => Math.abs(Math.hypot(a, b) - m) < 1e-9 }
      };
    }
  };

  // ---------- Lección: dominio e imagen ----------
  T["dom-sqrt-num"] = {
    type: "numeric", concepts: ["dominio"], difficulty: 1,
    generate(r) {
      const a = r.nz(-4, 4), b = r.int(-9, 9), isLog = r.bool();
      const lin = polyc([a, b]), x0 = -b / a;
      const dir = a > 0 ? (isLog ? ">" : "\\ge") : (isLog ? "<" : "\\le");
      return {
        prompt: `El dominio de $f(x) = ${isLog ? `\\ln(${lin})` : `\\sqrt{${lin}}`}$ es de la forma $x ${dir} c$. ¿Cuánto vale $c$?`,
        answer: x0, answerTex: frac(-b, a),
        solution: [
          isLog ? `El logaritmo pide argumento **positivo**: $${lin} > 0$.` : `La raíz cuadrada pide radicando **no negativo**: $${lin} \\ge 0$.`,
          `Despejamos: ${a < 0 ? `al dividir por $${a} < 0$ se da vuelta la desigualdad, ` : ""}$x ${dir} ${frac(-b, a)}$ ([[funcion|dominio]]).`
        ],
        verify: { kind: "zero", fn: ans => [a * ans + b] }
      };
    }
  };
  T["dom-rat-mc"] = {
    type: "mc", concepts: ["dominio"], difficulty: 1,
    generate(r) {
      const [p, q, s] = r.distinct(3, -5, 5);
      const den = polyc([1, -(q + s), q * s]);
      const set = (u, v) => `\\mathbb{R} \\setminus \\{${Math.min(u, v)}, ${Math.max(u, v)}\\}`;
      return {
        prompt: `¿Cuál es el dominio de $$f(x) = \\frac{${xm(p)}}{${den}}\\,?$$`,
        ...H.mc(r, set(q, s), [set(-q, -s), `\\mathbb{R} \\setminus \\{${p}\\}`, set(p, q), `\\mathbb{R}`], { fallback: [set(q, s + 1), set(q - 1, s)] }),
        solution: [
          `Un cociente no está definido donde el denominador vale $0$.`,
          `$${den} = (${xm(q)})(${xm(s)})$ se anula en $x = ${q}$ y $x = ${s}$ ([[factorizar|factorizando]]).`,
          `Dominio: $${set(q, s)}$. (El numerador no importa para el dominio.)`
        ],
        verify: { kind: "zero", fn: () => [H.peval([1, -(q + s), q * s], q), H.peval([1, -(q + s), q * s], s)] }
      };
    }
  };
  T["img-quad-num"] = {
    type: "numeric", concepts: ["dominio", "cuadratica"], difficulty: 2,
    generate(r) {
      const a = r.nz(-3, 3), h = r.int(-4, 4), k = r.int(-6, 6);
      const C = [a, -2 * a * h, a * h * h + k];
      return {
        prompt: `La imagen de $f(x) = ${polyc(C)}$ es de la forma ${a > 0 ? "$[m, +\\infty)$" : "$(-\\infty, m]$"}. ¿Cuánto vale $m$?`,
        answer: k,
        solution: [
          `[[cuadratica|Completamos cuadrados]]: $f(x) = ${cf(a)}(${xm(h)})^2 ${sg(k)}$.`,
          `El cuadrado es $\\ge 0$, así que el ${a > 0 ? "mínimo" : "máximo"} se alcanza en el vértice $x = ${h}$.`,
          `$m = f(${h}) = ${k}$.`
        ],
        // verificación: buscar el extremo recorriendo una grilla fina
        verify: { kind: "value", tol: 1e-5, fn: () => { let best = a > 0 ? Infinity : -Infinity; for (let x = -20; x <= 20; x += 1e-3) { const y = H.peval(C, x); best = a > 0 ? Math.min(best, y) : Math.max(best, y); } return best; } }
      };
    }
  };

  // ---------- Lección: álgebra de funciones, composición e inversa ----------
  T["comp-eval-num"] = {
    type: "numeric", concepts: ["composicion"], difficulty: 1,
    generate(r) {
      const a = r.nz(-4, 4), b = r.int(-5, 5), c = r.int(-5, 5), x0 = r.int(-3, 3);
      const f = x => a * x + b, g = x => x * x + c, fog = r.bool();
      const ans = fog ? f(g(x0)) : g(f(x0));
      return {
        prompt: `Sean $f(x) = ${polyc([a, b])}$ y $g(x) = ${polyc([1, 0, c])}$. Calculá $(${fog ? "f \\circ g" : "g \\circ f"})(${x0})$.`,
        answer: ans,
        solution: fog
          ? [`$(f\\circ g)(${x0}) = f(g(${x0}))$: primero $g$, después $f$ ([[composicion]]).`, `$g(${x0}) = ${g(x0)}$.`, `$f(${g(x0)}) = ${ans}$.`]
          : [`$(g\\circ f)(${x0}) = g(f(${x0}))$: primero $f$, después $g$ ([[composicion]]).`, `$f(${x0}) = ${f(x0)}$.`, `$g(${f(x0)}) = ${ans}$.`],
        verify: { kind: "value", fn: () => { const inner = fog ? x0 * x0 + c : a * x0 + b; return fog ? a * inner + b : inner * inner + c; } }
      };
    }
  };
  T["comp-formula-mc"] = {
    type: "mc", concepts: ["composicion"], difficulty: 2,
    generate(r) {
      const a = r.int(2, 4), b = r.nz(-4, 4), n = r.pick([2, 3]);
      // f(x) = x^n, g(x) = ax + b  ->  f∘g = (ax+b)^n,  g∘f = a x^n + b
      const lin = polyc([a, b]);
      return {
        prompt: `Si $f(x) = x^{${n}}$ y $g(x) = ${lin}$, ¿cuál es $(f \\circ g)(x)$?`,
        ...H.mc(r, `(${lin})^{${n}}`, [poly([[a, xp(n)], [b, ""]]), `${a}${xp(n)}(${lin})`, `(${lin})${xp(n)}`]),
        solution: [`$(f\\circ g)(x) = f(g(x))$: reemplazamos la $x$ de $f$ por $g(x)$ ([[composicion]]).`, `$f(${lin}) = (${lin})^{${n}}$.`, `Ojo: $(g \\circ f)(x) = ${poly([[a, xp(n)], [b, ""]])}$ es otra función: la composición no conmuta.`],
        // la opción correcta, (ax+b)^n, tiene que coincidir con f(g(x)) armada componiendo las funciones
        verify: { kind: "zero", fn: () => { const f = x => x ** n, g = x => a * x + b, F = x => Math.pow(a * x + b, n); return [-1.3, 0.4, 2.2].map(x => F(x) - f(g(x))); } }
      };
    }
  };
  T["inverse-num"] = {
    type: "numeric", concepts: ["inversa"], difficulty: 2,
    generate(r) {
      if (r.bool()) {
        const a = r.nz(-4, 4), b = r.int(-5, 5), c = r.nz(-3, 3), d = r.int(-5, 5);
        if (a * d - b * c === 0) return null;
        const y0 = r.int(-4, 4);
        if (c * y0 - a === 0) return null;
        const x = (b - d * y0) / (c * y0 - a);
        return {
          prompt: `Sea $f(x) = \\dfrac{${polyc([a, b])}}{${polyc([c, d])}}$. Calculá $f^{-1}(${y0})$.`,
          answer: x, answerTex: frac(b - d * y0, c * y0 - a),
          solution: [
            `$f^{-1}(${y0})$ es el $x$ tal que $f(x) = ${y0}$ ([[funcion-inversa|función inversa]]).`,
            `$${polyc([a, b])} = ${y0}(${polyc([c, d])}) \\Rightarrow ${polyc([a - c * y0, 0])} = ${d * y0 - b}$.`,
            `$x = ${frac(b - d * y0, c * y0 - a)}$.`
          ],
          verify: { kind: "zero", fn: ans => [(a * ans + b) / (c * ans + d) - y0] }
        };
      }
      const A = r.int(2, 5), k = r.pick([1, 2, 3, -1, -2]), B = r.int(-3, 3), y0 = B + A * r.pick([2, 3, 5, 7]);
      const x = Math.log((y0 - B) / A) / k;
      return {
        prompt: `Sea $f(x) = ${A}e^{${kx(k)}}${B ? sg(B) : ""}$. Calculá $f^{-1}(${y0})$ (con 3 decimales alcanza).`,
        answer: x,
        solution: [
          `Buscamos $x$ con $${A}e^{${kx(k)}}${B ? sg(B) : ""} = ${y0}$ ([[funcion-inversa]]).`,
          `$e^{${kx(k)}} = ${frac(y0 - B, A)}$, y aplicamos $\\ln$ ([[exp-log-func|la inversa de la exponencial]]).`,
          `$x = \\dfrac{\\ln(${frac(y0 - B, A)})}{${k}} \\approx ${num(x, 4)}$.`
        ],
        verify: { kind: "zero", fn: ans => [A * Math.exp(k * ans) + B - y0], tol: 1e-3, scale: y0 }
      };
    }
  };
  T["comp-order"] = {
    type: "order", concepts: ["inversa"], difficulty: 2,
    generate(r) {
      const a = r.nz(-5, 5), b = r.nz(-6, 6), c = r.int(2, 4);
      if (a === 1) return null;
      // f(x) = (a x + b)^{1/c}? -> usamos f(x) = a x^c... mejor lineal con raíz: f(x) = a·x + b
      return {
        prompt: `Ordená los pasos para hallar la inversa de $f(x) = ${polyc([a, b])}$.`,
        steps: [
          `Escribimos $y = ${polyc([a, b])}$.`,
          `Despejamos $x$: $${H.term(a, "x", true)} = y ${b < 0 ? "+ " + -b : "- " + b}$.`,
          `$x = \\dfrac{y ${b < 0 ? "+ " + -b : "- " + b}}{${a}}$.`,
          `Cambiamos los nombres de las variables: $f^{-1}(x) = \\dfrac{x ${b < 0 ? "+ " + -b : "- " + b}}{${a}}$.`
        ],
        solution: [`Para invertir: se despeja $x$ en función de $y$ y al final se intercambian los nombres ([[funcion-inversa]]).`, `Chequeo: $f(f^{-1}(x)) = x$.`],
        verify: { kind: "zero", fn: () => [-2, 0.5, 3].map(x => a * ((x - b) / a) + b - x) }
      };
    }
  };

  // ---------- Lección: transformaciones y funciones trascendentes ----------
  const BASES = [
    { t: "x^{2}", f: x => x * x }, { t: "|x|", f: x => Math.abs(x) }, { t: "\\sqrt{x}", f: x => Math.sqrt(x) }, { t: "x^{3}", f: x => x ** 3 }
  ];
  T["transf-mc"] = {
    type: "mc", concepts: ["transformaciones"], difficulty: 1,
    generate(r) {
      const h = r.nz(-4, 4), k = r.nz(-4, 4);
      const right = h > 0 ? `${h} unidades a la derecha` : `${-h} unidades a la izquierda`;
      const up = k > 0 ? `${k} hacia arriba` : `${-k} hacia abajo`;
      const o = (hh, kk) => `f(${xm(hh)})${sg(kk)}`;
      return {
        prompt: `El gráfico de $y = f(x)$ se desplaza ${right} y ${up}. ¿Cuál es la nueva fórmula?`,
        ...H.mc(r, o(h, k), [o(-h, k), o(h, -k), o(-h, -k)]),
        solution: [
          `Correr el gráfico $h$ a la derecha es reemplazar $x$ por $x - h$: el valor que antes estaba en $x$ ahora aparece en $x + h$ ([[transformaciones]]).`,
          `Subirlo $k$ es sumar $k$ afuera.`,
          `Resultado: $y = ${o(h, k)}$.`
        ],
        // verificación con f(x) = x^2 y un punto: (x0, f(x0)) tiene que ir a (x0 + h, f(x0) + k)
        verify: { kind: "zero", fn: () => [0.7, -1.2, 2].map(x0 => ((x0 + h) - h) ** 2 + k - (x0 * x0 + k)) }
      };
    }
  };
  T["transf-match"] = {
    type: "match", concepts: ["transformaciones"], difficulty: 2,
    generate(r) {
      const base = r.pick(BASES);
      const opts = r.sample([
        { t: `f(x - 2)`, g: x => base.f(x - 2) }, { t: `f(x) + 2`, g: x => base.f(x) + 2 }, { t: `-f(x)`, g: x => -base.f(x) },
        { t: `f(x + 2)`, g: x => base.f(x + 2) }, { t: `f(x) - 2`, g: x => base.f(x) - 2 }, { t: `f(-x)`, g: x => base.f(-x) }
      ], 3);
      const curves = opts.map(o => o.g);
      if (opts.some((o, i) => opts.some((p, j) => j > i && [-1.5, 0.5, 1.5, 2.5].every(x => { const a = o.g(x), b = p.g(x); return (isNaN(a) && isNaN(b)) || Math.abs(a - b) < 1e-9; })))) return null;
      return {
        prompt: `Sea $f(x) = ${base.t}$. Uní cada transformación con su gráfico.`,
        pairs: opts.map(o => [{ tex: `y = ${o.t}` }, { graph: { fns: [o.g], xr: [-5, 5], yr: [-5, 5] } }]),
        solution: [`$f(x - c)$: corre a la derecha. $f(x) + c$: sube. $-f(x)$: refleja respecto del eje $x$. $f(-x)$: refleja respecto del eje $y$ ([[transformaciones]]).`],
        verify: { kind: "zero", fn: () => opts.map((o, i) => [0.5, 1.5].map(x => { const a = curves[i](x), b = o.g(x); return isNaN(a) && isNaN(b) ? 0 : a - b; })).flat() }
      };
    }
  };
  T["trig-param-num"] = {
    type: "numeric", concepts: ["trig-func"], difficulty: 2,
    generate(r) {
      const A = r.int(1, 5) * r.sign(), B = r.pick([1, 2, 3, 4, 0.5]), D = r.int(-3, 3), C = r.pick([0, 1, -1]);
      const f = x => A * Math.sin(B * x + C) + D;
      const ask = r.pick(["T", "max", "amp"]);
      const ans = ask === "T" ? 2 * Math.PI / B : ask === "max" ? Math.abs(A) + D : Math.abs(A);
      const Btex = B === 0.5 ? "\\tfrac{1}{2}" : B === 1 ? "" : String(B);
      return {
        prompt: `Sea $f(x) = ${cf(A)}\\sin(${Btex}x${C ? sg(C) : ""})${D ? sg(D) : ""}$. Calculá ${ask === "T" ? "su **período**" : ask === "max" ? "su **valor máximo**" : "su **amplitud**"}.`,
        answer: ans, answerTex: ask === "T" ? { 1: "2\\pi", 0.5: "4\\pi", 2: "\\pi", 3: "\\frac{2\\pi}{3}", 4: "\\frac{\\pi}{2}" }[B] : String(ans),
        solution: [
          `Para $A\\sin(Bx + C) + D$: amplitud $|A|$, período $\\frac{2\\pi}{|B|}$, y oscila entre $D - |A|$ y $D + |A|$ ([[funciones-trig|funciones trigonométricas]]).`,
          ask === "T" ? `Período: $\\dfrac{2\\pi}{${B}} \\approx ${num(ans, 4)}$.` : ask === "max" ? `Máximo: $${D} + ${Math.abs(A)} = ${ans}$.` : `Amplitud: $|${A}| = ${ans}$.`
        ],
        verify: ask === "T" ? { kind: "zero", fn: ans2 => [0.3, 1.1, 2.7].map(x => f(x + ans2) - f(x)), tol: 1e-6 }
          : { kind: "value", tol: 1e-6, fn: () => { let mx = -Infinity, mn = Infinity; for (let x = 0; x < 30; x += 1e-4) { const y = f(x); mx = Math.max(mx, y); mn = Math.min(mn, y); } return ask === "max" ? mx : (mx - mn) / 2; } }
      };
    }
  };
  T["explog-eq-num"] = {
    type: "numeric", concepts: ["exp-log-func"], difficulty: 2,
    generate(r) {
      if (r.bool()) {
        const b = r.pick([2, 3, 5, 10]), a = r.int(1, 5), m = r.int(1, 4), c = a * b ** m * r.pick([1, b]);
        const x = Math.log(c / a) / Math.log(b);
        return {
          prompt: `Resolvé $${a === 1 ? "" : a + "\\cdot "}${b}^{x} = ${c}$.`,
          answer: x,
          solution: [`Dividimos por $${a}$: $${b}^x = ${c / a}$.`, `Aplicamos $\\log_{${b}}$ ([[exp-log-func|propiedades de los logaritmos]]): $x = \\log_{${b}} ${c / a} = ${num(x, 4)}$.`],
          verify: { kind: "zero", fn: ans => [a * b ** ans - c], scale: c }
        };
      }
      const p = r.int(1, 6), q = r.int(1, 6);
      // ln(x) + ln(x + p) = ln(q(q+p))  ->  x = q
      return {
        prompt: `Resolvé $\\ln x + \\ln(x + ${p}) = \\ln ${q * (q + p)}$.`,
        answer: q,
        solution: [
          `$\\ln a + \\ln b = \\ln(ab)$: queda $\\ln\\big(x(x+${p})\\big) = \\ln ${q * (q + p)}$ ([[exp-log-func]]).`,
          `Como $\\ln$ es inyectiva: $x^2 + ${p}x - ${q * (q + p)} = 0$, con raíces $x = ${q}$ y $x = ${-q - p}$.`,
          `Solo $x = ${q}$ está en el dominio ($x > 0$).`
        ],
        verify: { kind: "zero", fn: ans => [Math.log(ans) + Math.log(ans + p) - Math.log(q * (q + p))] }
      };
    }
  };

  // ---------- Lección: modelos matemáticos ----------
  T["model-lineal-num"] = {
    type: "numeric", concepts: ["modelos"], difficulty: 1,
    generate(r) {
      const t1 = r.int(0, 3), t2 = t1 + r.int(2, 5), y1 = r.int(10, 40), m = r.nz(-6, 6), y2 = y1 + m * (t2 - t1), t3 = t2 + r.int(2, 6);
      const ans = y1 + m * (t3 - t1);
      return {
        prompt: `Un tanque tiene ${y1} litros a los ${t1} minutos y ${y2} litros a los ${t2} minutos. Suponiendo que el volumen varía **linealmente**, ¿cuántos litros tiene a los ${t3} minutos?`,
        answer: ans,
        solution: [
          `Pendiente: $m = \\dfrac{${y2} - ${y1}}{${t2} - ${t1}} = ${m}$ litros por minuto ([[modelos|modelo lineal]]).`,
          `$V(t) = ${y1} ${sg(m).trim()}\\,(t - ${t1})$.`,
          `$V(${t3}) = ${ans}$.`
        ],
        verify: { kind: "zero", fn: ans2 => [(ans2 - y2) / (t3 - t2) - (y2 - y1) / (t2 - t1)] }
      };
    }
  };
  T["model-exp-num"] = {
    type: "numeric", concepts: ["modelos", "exp-log-func"], difficulty: 3,
    generate(r) {
      const T12 = r.pick([2, 5, 8, 10, 12, 30]), N0 = r.pick([100, 200, 500, 800, 1000]), t = T12 * r.pick([0.5, 1.5, 2, 2.5, 3]);
      const k = Math.LN2 / T12, ans = N0 * Math.exp(-k * t);
      return {
        prompt: `Una muestra radiactiva tiene ${N0} mg y su vida media es de ${T12} días. ¿Cuántos mg quedan a los ${t} días?`,
        answer: ans,
        solution: [
          `Decaimiento exponencial: $N(t) = N_0\\,2^{-t/T_{1/2}}$ ([[modelos|modelo exponencial]]).`,
          `$\\dfrac{t}{T_{1/2}} = \\dfrac{${t}}{${T12}} = ${num(t / T12, 3)}$.`,
          `$N = ${N0}\\cdot 2^{-${num(t / T12, 3)}} \\approx ${num(ans, 3)}$ mg.`
        ],
        // verificación: integrar dN/dt = -kN con RK4
        verify: { kind: "ode", f: (_, y) => [-k * y[0]], y0: [N0], t1: t, dt: 1e-2, out: (_, y) => y[0] }
      };
    }
  };

  /* --------------------------- apuntes de la unidad --------------------------- */
  const cards = {
    "conjuntos-numericos": {
      title: "Conjuntos numéricos", aliases: ["conjuntos numéricos", "números racionales", "números irracionales", "irracional"], concepts: ["conjuntos-num"],
      summary: "ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ: cada conjunto agrega lo que al anterior le faltaba para resolver ecuaciones.",
      def: [R`$$\mathbb{N} \subset \mathbb{Z} \subset \mathbb{Q} \subset \mathbb{R} \subset \mathbb{C}$$`,
        R`• $\mathbb{N} = \{1, 2, 3, \dots\}$ (naturales; hay quien incluye al $0$).<br>• $\mathbb{Z}$: enteros, agrega los negativos y el $0$.<br>• $\mathbb{Q} = \{\frac{p}{q} : p, q \in \mathbb{Z},\ q \neq 0\}$: racionales; su expresión decimal es finita o periódica.<br>• $\mathbb{R}$: reales, agrega los **irracionales** como $\sqrt 2$, $\pi$ o $e$ (decimales infinitos no periódicos).<br>• $\mathbb{C}$: complejos, agrega $i$ con $i^2 = -1$ (ver [[numeros-complejos]]).`],
      idea: [R`Cada ampliación permite resolver una ecuación que antes no tenía solución: $x + 3 = 1$ necesita a $\mathbb{Z}$, $2x = 1$ necesita a $\mathbb{Q}$, $x^2 = 2$ necesita a $\mathbb{R}$ y $x^2 = -1$ necesita a $\mathbb{C}$.`,
        R`Lo que distingue a $\mathbb{R}$ de $\mathbb{Q}$ es la **completitud**: la recta real "no tiene agujeros". Todo el cálculo (límites, continuidad, [[bolzano|Bolzano]]) se apoya en eso.`],
      demo: [R`**$\sqrt 2$ es irracional.** Supongamos que $\sqrt 2 = \frac{p}{q}$ con la fracción ya simplificada (sin factores comunes).`,
        R`Elevando al cuadrado: $p^2 = 2q^2$, así que $p^2$ es par y entonces $p$ es par: $p = 2m$.`,
        R`Reemplazando: $4m^2 = 2q^2$, o sea $q^2 = 2m^2$, y $q$ también es par.`,
        R`Pero entonces $p$ y $q$ tienen el factor $2$ en común: contradicción. $\blacksquare$`],
      examples: [{ q: R`Escribí $0{,}\overline{27} = 0{,}272727\ldots$ como fracción.`, steps: [R`$x = 0{,}2727\ldots \Rightarrow 100x = 27{,}2727\ldots$`, R`Restando: $99x = 27$, así que $x = \frac{27}{99} = \frac{3}{11}$.`] }],
      tips: [R`$0{,}999\ldots = 1$ exactamente: con el mismo truco, $10x - x = 9$ da $x = 1$.`],
      see: ["valor-absoluto", "numeros-complejos"]
    },
    "valor-absoluto": {
      title: "Valor absoluto y desigualdades", aliases: ["valor absoluto", "desigualdad triangular"], concepts: ["valor-absoluto"],
      summary: "|x| es la distancia de x al 0; |x − a| < b dice que x está a menos de b de a.",
      def: [R`$$|x| = \begin{cases} x & x \ge 0 \\ -x & x < 0 \end{cases}$$ Geométricamente, $|x - a|$ es la **distancia** entre $x$ y $a$ en la recta.`],
      idea: [R`Por eso $|x - a| < b \iff a - b < x < a + b$: los puntos a menos de $b$ de $a$. Y $|x - a| > b$ son los que están más lejos: $x < a - b$ o $x > a + b$.`,
        R`**Desigualdad triangular:** $|x + y| \le |x| + |y|$. Es la herramienta central de las pruebas con $\varepsilon$ y $\delta$ (ver [[limite]]).`],
      demo: [R`**Desigualdad triangular.** Sabemos que $-|x| \le x \le |x|$ y $-|y| \le y \le |y|$.`, R`Sumando: $-(|x|+|y|) \le x + y \le |x| + |y|$, que es exactamente $|x + y| \le |x| + |y|$. $\blacksquare$`],
      examples: [{ q: R`Resolvé $|2x - 3| \le 5$.`, steps: [R`$-5 \le 2x - 3 \le 5$.`, R`$-2 \le 2x \le 8$, o sea $-1 \le x \le 4$.`, R`Solución: $[-1, 4]$.`] }],
      tips: [R`Al multiplicar o dividir una desigualdad por un número **negativo**, se da vuelta.`],
      see: ["conjuntos-numericos", "limite"]
    },
    "numeros-complejos": {
      title: "Números complejos", aliases: ["números complejos", "número complejo", "parte imaginaria", "forma polar"], concepts: ["complejos"],
      summary: "z = a + bi con i² = −1; se suman como vectores y al multiplicar se multiplican módulos y se suman ángulos.",
      def: [R`Un **número complejo** es $z = a + bi$ con $a, b \in \mathbb{R}$ e $i^2 = -1$. $a = \operatorname{Re} z$ es la parte real y $b = \operatorname{Im} z$ la parte imaginaria.`,
        R`**Módulo:** $|z| = \sqrt{a^2 + b^2}$. **Conjugado:** $\bar z = a - bi$, y $z\bar z = |z|^2$.`,
        R`**Forma polar:** $z = r(\cos\theta + i\sin\theta)$ con $r = |z|$ y $\theta$ el ángulo con el eje real.`],
      idea: [R`Pensá $z$ como el punto $(a, b)$ del plano. Sumar complejos es sumar vectores. Multiplicar es más lindo en forma polar: **los módulos se multiplican y los ángulos se suman**. Multiplicar por $i$ es rotar $90^\circ$.`],
      demo: [R`Con $z = r(\cos\alpha + i\sin\alpha)$ y $w = s(\cos\beta + i\sin\beta)$: $$zw = rs\big[(\cos\alpha\cos\beta - \sin\alpha\sin\beta) + i(\sin\alpha\cos\beta + \cos\alpha\sin\beta)\big]$$`,
        R`Por las fórmulas de suma ([[identidades-trig]]): $zw = rs\big(\cos(\alpha+\beta) + i\sin(\alpha+\beta)\big)$. $\blacksquare$`],
      examples: [{ q: R`Calculá $(2 + 3i)(1 - i)$.`, steps: [R`Distribuimos: $2 - 2i + 3i - 3i^2$.`, R`Con $i^2 = -1$: $2 + i + 3 = 5 + i$.`] }, { q: R`Calculá $\dfrac{1}{1+i}$.`, steps: [R`Multiplicamos arriba y abajo por el conjugado $1 - i$: $\dfrac{1-i}{(1+i)(1-i)} = \dfrac{1-i}{2}$.`] }],
      see: ["conjuntos-numericos", "identidades-trig"]
    },
    "cuadratica": {
      title: "La función cuadrática", aliases: ["completar cuadrados", "completamos cuadrados", "vértice", "función cuadrática"], concepts: ["cuadratica"],
      summary: "a x² + b x + c = a(x − h)² + k: el vértice (h, k) da el mínimo o el máximo.",
      def: [R`Toda cuadrática se puede escribir en **forma canónica**: $$ax^2 + bx + c = a(x - h)^2 + k, \qquad h = -\frac{b}{2a},\quad k = c - \frac{b^2}{4a}.$$ Su gráfico es una parábola con vértice $(h, k)$.`],
      idea: [R`Como $(x - h)^2 \ge 0$: si $a > 0$ la parábola abre hacia arriba y $k$ es el **mínimo**; si $a < 0$ abre hacia abajo y $k$ es el **máximo**. Por eso la imagen es $[k, +\infty)$ o $(-\infty, k]$.`,
        { graph: { fns: [x => (x - 1) ** 2 - 2], points: [{ x: 1, y: -2 }], xr: [-3, 5], yr: [-3, 5] }, caption: R`$(x-1)^2 - 2$: vértice en $(1, -2)$, imagen $[-2, +\infty)$.` }],
      demo: [R`**Completar cuadrados:** $ax^2 + bx + c = a\left(x^2 + \frac{b}{a}x\right) + c = a\left(x + \frac{b}{2a}\right)^2 - \frac{b^2}{4a} + c$.`, R`De acá salen $h$ y $k$, y también la fórmula resolvente igualando a $0$.`],
      examples: [{ q: R`Imagen de $f(x) = -2x^2 + 8x - 3$.`, steps: [R`$h = -\frac{8}{2(-2)} = 2$ y $f(2) = -8 + 16 - 3 = 5$.`, R`Como $a < 0$, el máximo es $5$: imagen $(-\infty, 5]$.`] }],
      see: ["funcion", "transformaciones"]
    },
    "composicion": {
      title: "Álgebra de funciones y composición", aliases: ["composición", "función compuesta"], concepts: ["composicion"],
      summary: "(f ∘ g)(x) = f(g(x)): primero se aplica g y al resultado se le aplica f.",
      def: [R`Con $f$ y $g$ se definen $f + g$, $f\cdot g$ y $\frac{f}{g}$ punto a punto, y la **composición** $$(f\circ g)(x) = f\big(g(x)\big),$$ definida donde $x \in \operatorname{Dom} g$ y $g(x) \in \operatorname{Dom} f$.`],
      idea: [R`Es "encadenar máquinas": la salida de $g$ entra en $f$. El orden importa: en general $f\circ g \neq g\circ f$. Saber descomponer una función en capas es justo lo que pide la [[regla-cadena|regla de la cadena]].`],
      examples: [{ q: R`Si $f(x) = \sqrt{x}$ y $g(x) = 1 - x^2$, ¿cuál es el dominio de $f\circ g$?`, steps: [R`$(f\circ g)(x) = \sqrt{1 - x^2}$.`, R`Hace falta $1 - x^2 \ge 0$, o sea $-1 \le x \le 1$.`] }],
      tips: [R`$f(x)^2$ es $(f(x))^2$; $f(x^2)$ es otra cosa. Y $f^{-1}$ es la [[funcion-inversa|inversa]], no $\frac{1}{f}$.`],
      see: ["funcion-inversa", "regla-cadena"]
    },
    "funcion-inversa": {
      title: "Función inversa", aliases: ["función inversa", "inyectiva", "biyectiva"], concepts: ["inversa"],
      summary: "Si f es inyectiva, f⁻¹ deshace lo que hace f: f⁻¹(f(x)) = x. Su gráfico es el de f reflejado en y = x.",
      def: [R`$f$ es **inyectiva** si $x_1 \neq x_2 \Rightarrow f(x_1) \neq f(x_2)$. En ese caso existe $f^{-1}$ (definida en la imagen de $f$) con $$f^{-1}(y) = x \iff f(x) = y.$$`],
      idea: [R`Para calcularla: se despeja $x$ de $y = f(x)$ y se cambian los nombres. El gráfico de $f^{-1}$ es el de $f$ **reflejado sobre la recta $y = x$**, porque se intercambian las coordenadas.`,
        { graph: { fns: [x => Math.exp(x), x => Math.log(x), x => x], xr: [-4, 4], yr: [-4, 4] }, caption: R`En violeta $e^x$, en naranja su inversa $\ln x$, en verde la recta $y = x$.` },
        R`Pares clásicos: $e^x$ y $\ln x$; $x^2$ (con $x\ge0$) y $\sqrt x$; $\sin x$ (en $[-\frac\pi2,\frac\pi2]$) y $\arcsin x$.`],
      examples: [{ q: R`Inversa de $f(x) = \dfrac{2x + 1}{x - 3}$.`, steps: [R`$y(x - 3) = 2x + 1 \Rightarrow x(y - 2) = 3y + 1$.`, R`$x = \dfrac{3y + 1}{y - 2}$, o sea $f^{-1}(x) = \dfrac{3x + 1}{x - 2}$.`] }],
      see: ["composicion", "exp-log-func"]
    },
    "transformaciones": {
      title: "Transformaciones de gráficos", aliases: ["transformaciones", "reflexión"], concepts: ["transformaciones"],
      summary: "f(x − h) + k corre el gráfico h a la derecha y k hacia arriba; −f(x) y f(−x) lo reflejan.",
      def: [R`A partir de $y = f(x)$:<br>• $f(x - h)$: desplaza $h$ a la derecha (a la izquierda si $h<0$).<br>• $f(x) + k$: desplaza $k$ hacia arriba.<br>• $a\,f(x)$: estira verticalmente (y refleja si $a < 0$).<br>• $f(bx)$: comprime horizontalmente por $b$ (y refleja si $b < 0$).`],
      idea: [R`Lo que se hace **afuera** de $f$ afecta los valores ($y$) y va "en el sentido esperado". Lo que se hace **adentro** afecta a $x$ y va "al revés": $f(x - 2)$ corre a la **derecha**, porque el valor que antes tenía $f$ en $0$ ahora aparece en $x = 2$.`,
        { graph: { fns: [x => x * x, x => (x - 2) ** 2 + 1], xr: [-4, 5], yr: [-2, 6] }, caption: R`En violeta $x^2$; en naranja $(x - 2)^2 + 1$.` }],
      examples: [{ q: R`¿Qué le hace $y = 3 - f(x + 1)$ al gráfico de $f$?`, steps: [R`$f(x + 1)$: corre $1$ a la izquierda.`, R`$-f(\cdot)$: refleja respecto del eje $x$.`, R`$+3$: sube $3$.`] }],
      see: ["funcion", "cuadratica", "funciones-trig"]
    },
    "funciones-trig": {
      title: "Funciones trigonométricas", aliases: ["funciones trigonométricas", "período", "amplitud"], concepts: ["trig-func"],
      summary: "A·sen(Bx + C) + D oscila con amplitud |A| y período 2π/|B| alrededor de D.",
      def: [R`$\sin$ y $\cos$ son periódicas de período $2\pi$ y toman valores en $[-1, 1]$. Para $$f(x) = A\sin(Bx + C) + D:$$ la **amplitud** es $|A|$, el **período** es $\frac{2\pi}{|B|}$, el desfase es $-\frac{C}{B}$ y la función oscila entre $D - |A|$ y $D + |A|$.`],
      idea: [R`Es el seno de siempre [[transformaciones|transformado]]: $B$ comprime en horizontal (más oscilaciones), $A$ estira en vertical, $C$ corre y $D$ sube. En física es el modelo de cualquier oscilación: $x(t) = A\cos(\omega t + \varphi)$ con $\omega = \frac{2\pi}{T}$.`,
        { graph: { fns: [x => Math.sin(x), x => 2 * Math.sin(2 * x) + 1], xr: [-6, 6], yr: [-3, 4] }, caption: R`En violeta $\sin x$; en naranja $2\sin(2x) + 1$ (amplitud $2$, período $\pi$).` }],
      examples: [{ q: R`Período y máximo de $3\cos(4x) - 1$.`, steps: [R`Período: $\frac{2\pi}{4} = \frac{\pi}{2}$.`, R`Máximo: $-1 + 3 = 2$.`] }],
      see: ["radian", "identidades-trig", "transformaciones"]
    },
    "exp-log-func": {
      title: "Funciones exponencial y logarítmica", aliases: ["propiedades de los logaritmos", "función exponencial", "función logarítmica", "ecuación exponencial"], concepts: ["exp-log-func"],
      summary: "logₐ es la inversa de aˣ: logₐ(xy) = logₐx + logₐy y logₐ(xᵏ) = k·logₐx.",
      def: [R`Para $a > 0$, $a \neq 1$: $\;y = \log_a x \iff a^y = x$ (definido para $x > 0$). Con base $e$ se escribe $\ln x$.`,
        R`**Propiedades:** $\log_a(xy) = \log_a x + \log_a y$, $\;\log_a\frac{x}{y} = \log_a x - \log_a y$, $\;\log_a(x^k) = k\log_a x$, $\;\log_a x = \frac{\ln x}{\ln a}$.`],
      idea: [R`El logaritmo convierte productos en sumas porque la exponencial convierte sumas en productos: $a^{u+v} = a^u a^v$. Para despejar una incógnita del exponente, se aplica el logaritmo a ambos lados.`,
        { graph: { fns: [x => 2 ** x, x => Math.log2(x)], xr: [-4, 6], yr: [-4, 6] }, caption: R`En violeta $2^x$; en naranja $\log_2 x$, su [[funcion-inversa|inversa]].` }],
      examples: [{ q: R`Resolvé $3\cdot 2^{x} = 48$.`, steps: [R`$2^x = 16 = 2^4$.`, R`$x = 4$.`] }],
      tips: [R`$\ln(a + b) \neq \ln a + \ln b$. Y siempre chequeá el dominio: el argumento del logaritmo tiene que ser positivo.`],
      see: ["funcion-inversa", "modelos", "exp-log"]
    },
    "modelos": {
      title: "Modelos matemáticos", aliases: ["modelo lineal", "modelo exponencial", "vida media", "decaimiento exponencial"], concepts: ["modelos"],
      summary: "Lineal si cambia a ritmo constante; exponencial si cambia en proporción a lo que hay.",
      def: [R`**Modelo lineal:** $y(t) = y_0 + m\,t$, con razón de cambio constante $m$.`, R`**Modelo exponencial:** $N(t) = N_0 e^{kt}$, que crece ($k>0$) o decae ($k<0$) a un ritmo **proporcional a la cantidad**: $N'(t) = kN(t)$.`],
      idea: [R`En el decaimiento radiactivo la **vida media** $T_{1/2}$ es el tiempo en que queda la mitad, $e^{-kT_{1/2}} = \frac12$, así que $k = \frac{\ln 2}{T_{1/2}}$ y $N(t) = N_0\,2^{-t/T_{1/2}}$.`,
        R`El modelo exponencial es la solución de la ecuación diferencial $N' = kN$, que aparece en la unidad de integrales.`],
      examples: [{ q: R`Una población se duplica cada 3 horas. Si arranca con 500, ¿cuántos hay a las 7 horas?`, steps: [R`$N(t) = 500\cdot 2^{t/3}$.`, R`$N(7) = 500\cdot 2^{7/3} \approx 2520$.`] }],
      see: ["exp-log-func"]
    }
  };

  // la ficha "funcion" (unidades 2-3) también explica dominio e imagen
  E.cards.funcion.concepts.push("dominio");
  E.extendCourse("m101", {
    concepts: {
      "conjuntos-num": { name: "Conjuntos numéricos" },
      "valor-absoluto": { name: "Valor absoluto y desigualdades" },
      "complejos": { name: "Números complejos" },
      "dominio": { name: "Dominio e imagen" },
      "cuadratica": { name: "Función cuadrática" },
      "composicion": { name: "Composición de funciones" },
      "inversa": { name: "Función inversa" },
      "transformaciones": { name: "Transformaciones de gráficos" },
      "trig-func": { name: "Funciones trigonométricas" },
      "exp-log-func": { name: "Exponenciales y logaritmos" },
      "modelos": { name: "Modelos matemáticos" }
    },
    templates: T,
    units: [{
      id: "funciones", order: 1, program: "Unidad 1", title: "Conjuntos numéricos y funciones", icon: "sigma",
      diagnostic: ["abs-ineq-num", "inverse-num", "trig-param-num"],
      lessons: [
        { id: "num-reales", title: "Números reales y complejos", templates: ["num-clasif-mc", "abs-vf", "abs-ineq-num", "complex-num"],
          theory: ["conjuntos-numericos", "valor-absoluto", "numeros-complejos"],
          intro: R`$\mathbb{N}\subset\mathbb{Z}\subset\mathbb{Q}\subset\mathbb{R}\subset\mathbb{C}$. $|x - a| < b$ significa que $x$ está a distancia menor que $b$ de $a$. En $\mathbb{C}$, $i^2 = -1$.` },
        { id: "dominio-imagen", title: "Dominio e imagen", templates: ["dom-sqrt-num", "dom-rat-mc", "img-quad-num"],
          theory: ["funcion", "cuadratica"],
          intro: R`El dominio excluye lo que no se puede hacer: dividir por $0$, raíces pares de negativos, logaritmos de no positivos. La imagen de una cuadrática sale de su vértice.` },
        { id: "composicion-inversa", title: "Composición e inversa", templates: ["comp-eval-num", "comp-formula-mc", "inverse-num", "comp-order"],
          theory: ["composicion", "funcion-inversa"],
          intro: R`$(f\circ g)(x) = f(g(x))$. La inversa deshace a $f$: se despeja $x$ de $y = f(x)$.` },
        { id: "transformaciones", title: "Transformaciones y funciones trascendentes", templates: ["transf-mc", "transf-match", "trig-param-num", "explog-eq-num"],
          theory: ["transformaciones", "funciones-trig", "exp-log-func", "radian", "identidades-trig"],
          intro: R`$f(x - h) + k$ corre el gráfico. $A\sin(Bx + C) + D$ tiene amplitud $|A|$ y período $\frac{2\pi}{|B|}$. $\log_a$ es la inversa de $a^x$.` },
        { id: "modelos", title: "Modelos matemáticos", templates: ["model-lineal-num", "model-exp-num"],
          theory: ["modelos", "exp-log-func"],
          intro: R`Lineal: cambio constante. Exponencial: cambio proporcional a lo que hay ($N' = kN$), con vida media $T_{1/2} = \frac{\ln 2}{k}$.` }
      ]
    }],
    cards
  });
})();
