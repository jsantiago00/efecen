/* ===== F102A · Escribir la expresión y paso a paso =====
   Se suman a lecciones que ya existen (E.addPractice). */
(function () {
  const E = window.Efecen, H = E.H;
  const T = {};
  const dec = x => String(x).replace(".", "{,}");

  T["f2a-campo-expr"] = {
    type: "expr", concepts: ["f2a-potencial"], difficulty: 2,
    generate(r) {
      const v = r.pick(["cuad", "mixto", "puntual"]), wx = r.bool(), comp = wx ? "x" : "y", dom = [[0.5, 2], [0.5, 2]];
      let V, f, ex, ey;
      if (v === "cuad") {
        const a = r.nz(-5, 5), b = r.nz(-4, 4), c = r.nz(-5, 5);
        V = H.terms([{ p: a, m: "x^2", t: "x^{2}" }, { p: b, m: "x*y", t: "xy" }, { p: c, m: "y^2", t: "y^{2}" }])[1];
        f = (x, y) => a * x * x + b * x * y + c * y * y;
        ex = H.terms([{ p: -2 * a, m: "x", t: "x" }, { p: -b, m: "y", t: "y" }]);
        ey = H.terms([{ p: -b, m: "x", t: "x" }, { p: -2 * c, m: "y", t: "y" }]);
      } else if (v === "mixto") {
        const a = r.nz(-5, 5), c = r.nz(-9, 9);
        V = H.terms([{ p: a, m: "x^2*y", t: "x^{2}y" }, { p: c, m: "x", t: "x" }])[1];
        f = (x, y) => a * x * x * y + c * x;
        ex = H.terms([{ p: -2 * a, m: "x*y", t: "xy" }, { p: -c }]);
        ey = H.terms([{ p: -a, m: "x^2", t: "x^{2}" }]);
      } else {
        const k = r.pick([2, 5, 10, 18, 36]);
        V = `\\dfrac{${k}}{\\sqrt{x^{2} + y^{2}}}`; f = (x, y) => k / Math.hypot(x, y);
        ex = [`${k}*x/(x^2 + y^2)^(3/2)`, `\\dfrac{${k}x}{(x^{2} + y^{2})^{3/2}}`];
        ey = [`${k}*y/(x^2 + y^2)^(3/2)`, `\\dfrac{${k}y}{(x^{2} + y^{2})^{3/2}}`];
      }
      const [ans, ansT] = wx ? ex : ey;
      return {
        prompt: `En una región del plano el potencial eléctrico es $V(x, y) = ${V}$ ($V$ en volts, $x$ e $y$ en metros). Escribí la componente $E_${comp}$ del campo eléctrico, en V/m.`,
        lhs: `E_${comp} = `, answer: ans, answerTex: ansT, vars: ["x", "y"], domain: dom,
        solution: [
          `[[f2a-gradiente-potencial|El campo es menos el gradiente del potencial]]: $E_${comp} = -\\dfrac{\\partial V}{\\partial ${comp}}$. El signo menos dice que el campo apunta hacia donde el potencial baja.`,
          `Derivando respecto de $${comp}$ con la otra coordenada fija: $E_${comp} = ${ansT}$ V/m.`
        ],
        verify: { kind: "derivOf", f, wrt: wx ? 0 : 1, k: -1, dom }
      };
    }
  };

  T["f2a-kirchhoff-multi"] = {
    type: "multi", concepts: ["f2a-kirchhoff"], difficulty: 3,
    generate(r) {
      const R = [1, 2, 3, 4, 5, 6, 8, 10], E1 = r.int(2, 24), E2 = r.int(2, 24), R1 = r.pick(R), R2 = r.pick(R), R3 = r.pick(R);
      if (E1 === E2 && R1 === R2) return null;
      // método de nodos: B a tierra y una sola incógnita, el potencial de A
      const V = (E1 / R1 + E2 / R2) / (1 / R1 + 1 / R2 + 1 / R3), I1 = (E1 - V) / R1, P3 = V * V / R3;
      // verificación por mallas (otro método): J1 en la malla de la izquierda y J2 en la de la derecha, en sentido horario
      const det = (R1 + R3) * (R2 + R3) - R3 * R3, J1 = (E1 * (R2 + R3) - R3 * E2) / det, J2 = ((R1 + R3) * -E2 + R3 * E1) / det;
      return {
        prompt: `Entre dos nodos $A$ y $B$ hay tres ramas en paralelo. La rama 1 tiene una fuente de $${E1}$ V, con el borne positivo hacia $A$, en serie con $R_1 = ${R1}\\ \\Omega$; la rama 2 tiene solo $R_2 = ${R3}\\ \\Omega$; la rama 3, una fuente de $${E2}$ V con el positivo hacia $A$, en serie con $R_3 = ${R2}\\ \\Omega$. Las fuentes son ideales.`,
        parts: [
          { q: "¿Cuánto vale $V_A - V_B$ (en V)?", type: "numeric", answer: V, verify: { kind: "value", fn: () => (J1 - J2) * R3 } },
          { q: "¿Qué corriente circula por la rama 1 (en A)? Tomala positiva si sale del borne positivo de su fuente hacia $A$.", type: "numeric", answer: I1, verify: { kind: "value", fn: () => J1 } },
          { q: "¿Qué potencia se disipa en $R_2$ (en W)?", type: "numeric", answer: P3, verify: { kind: "value", fn: () => (J1 - J2) ** 2 * R3 } }
        ],
        solution: [
          `[[f2a-kirchhoff|Ley de nodos]] en $A$, con $V_B = 0$ y $V = V_A$: la suma de las corrientes que salen de $A$ es cero, $\\dfrac{V - ${E1}}{${R1}} + \\dfrac{V}{${R3}} + \\dfrac{V - ${E2}}{${R2}} = 0$.`,
          `Despejando, $V = \\dfrac{${E1}/${R1} + ${E2}/${R2}}{1/${R1} + 1/${R2} + 1/${R3}} \\approx ${H.num(V, 3)}$ V.`,
          `Por la rama 1 sube $I_1 = \\dfrac{${E1} - V}{${R1}} \\approx ${H.num(I1, 3)}$ A${I1 < 0 ? ": el signo negativo dice que esa fuente se está cargando" : ""}.`,
          `En $R_2$: $P = \\dfrac{V^{2}}{R_2} \\approx ${H.num(P3, 3)}$ W.`
        ]
      };
    }
  };

  T["f2a-rc-multi"] = {
    type: "multi", concepts: ["f2a-rc"], difficulty: 2,
    generate(r) {
      const Ev = r.pick([6, 9, 12, 24]), R = r.pick([1, 2, 3, 5, 10]), C = r.pick([1, 2, 5, 10, 22, 47, 100]), fr = r.pick([0.5, 1, 2, 3]);
      // unidades: kΩ, µF, ms, µC y mA (kΩ·µF = ms, V/kΩ = mA = µC/ms)
      const tau = R * C, t = +(fr * tau).toPrecision(4), q = C * Ev * (1 - Math.exp(-t / tau)), i = Ev / R * Math.exp(-t / tau);
      const ode = { kind: "ode", f: (_, y) => [(Ev - y[0] / C) / R], y0: [0], dt: tau / 2000 };
      return {
        prompt: `Un capacitor descargado de $${C}\\ \\mu$F se conecta en $t = 0$ a una batería de $${Ev}$ V a través de una resistencia de $${R}$ k$\\Omega$.`,
        parts: [
          { q: "¿Cuánto vale la constante de tiempo (en ms)?", type: "numeric", answer: tau,
            verify: { kind: "ode", f: ode.f, y0: [0], t1: 0, dt: tau / 2000, until: (_, y) => y[0] >= C * Ev * (1 - Math.exp(-1)), g: (_, y) => y[0] - C * Ev * (1 - Math.exp(-1)), out: tt => tt } },
          { q: `¿Qué carga tiene el capacitor en $t = ${dec(t)}$ ms (en $\\mu$C)?`, type: "numeric", answer: q,
            traps: [{ value: C * Ev * Math.exp(-t / tau), msg: "Esa es la carga de un capacitor que se descarga. Al cargarse, $q = CE\\,(1 - e^{-t/\\tau})$: arranca en cero y tiende a $CE$." }],
            verify: Object.assign({ t1: t, out: (_, y) => y[0] }, ode) },
          { q: "¿Y qué corriente circula en ese instante (en mA)?", type: "numeric", answer: i,
            verify: Object.assign({ t1: t, out: (_, y) => (Ev - y[0] / C) / R }, ode) }
        ],
        solution: [
          `[[f2a-rc|Circuito RC]]: $\\tau = RC = ${R}\\ \\text{k}\\Omega\\cdot ${C}\\ \\mu\\text{F} = ${tau}$ ms.`,
          `Al cargarse, $q(t) = CE\\,(1 - e^{-t/\\tau}) = ${C * Ev}\\,(1 - e^{-${dec(+(t / tau).toFixed(4))}}) \\approx ${H.num(q, 3)}\\ \\mu$C.`,
          `La corriente decae: $i(t) = \\dfrac{E}{R}\\,e^{-t/\\tau} \\approx ${H.num(i, 4)}$ mA (con V y k$\\Omega$ da mA).`
        ]
      };
    }
  };

  E.addPractice("f102a", {
    templates: T,
    lessons: { "f2a-potencial-l2": ["f2a-campo-expr"], "f2a-circuitos-l2": ["f2a-kirchhoff-multi"], "f2a-circuitos-l3": ["f2a-rc-multi"] }
  });
})();
