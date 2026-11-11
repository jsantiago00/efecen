/* ===== Q101 · Escribir la expresión y paso a paso =====
   Se suman a lecciones que ya existen (E.addPractice). */
(function () {
  const E = window.Efecen, H = E.H;
  const T = {};
  const dec = (x, d = 4) => H.num(x, d).replace(".", "{,}");
  // RK4 de una variable: integra y' = f(y) desde y0 durante un tiempo t
  const rk = (f, y0, t, N = 400) => { let y = y0; const h = t / N; for (let i = 0; i < N; i++) { const k1 = f(y), k2 = f(y + h / 2 * k1), k3 = f(y + h / 2 * k2), k4 = f(y + h * k3); y += h / 6 * (k1 + 2 * k2 + 2 * k3 + k4); } return y; };

  // ley integrada de primer o de segundo orden: la concentración en función del tiempo
  T["qg-integrada-expr"] = {
    type: "expr", concepts: ["qg-integradas"], difficulty: 2,
    generate(r) {
      const ord = r.pick([1, 2]), A0 = r.int(2, 20) / 10, k = r.pick([0.01, 0.02, 0.04, 0.05, 0.1, 0.2, 0.25, 0.5]);
      const tmax = ord === 1 ? 3 / k : 3 / (k * A0), dom = [[0, tmax]], kA = +(k * A0).toFixed(4);
      const ans = ord === 1 ? `${A0}*exp(-${k}*t)` : `${A0}/(1 + ${kA}*t)`;
      const ansT = ord === 1 ? `${dec(A0)}\\,e^{-${dec(k)}\\,t}` : `\\dfrac{${dec(A0)}}{1 + ${dec(kA)}\\,t}`;
      return {
        prompt: `La descomposición $\\mathrm{A} \\to \\text{productos}$ es de ${ord === 1 ? "primer" : "segundo"} orden, con $k = ${dec(k)}$ ${ord === 1 ? "s$^{-1}$" : "L/(mol·s)"}. Al principio, $[\\mathrm{A}]_0 = ${dec(A0)}$ mol/L. Escribí $[\\mathrm{A}]$ en función del tiempo $t$ (en segundos).`,
        lhs: "[\\mathrm{A}](t) = ", answer: ans, answerTex: ansT, vars: ["t"], domain: dom,
        traps: ord === 1 ? [
          { expr: `${A0} - ${k}*t`, msg: "Esa recta es la ley de orden cero. En primer orden la concentración decae como una exponencial." },
          { expr: `${A0}*exp(${k}*t)`, msg: "Revisá el signo del exponente: el reactivo se consume, así que la concentración tiene que bajar." }
        ] : [
          { expr: `${A0}*exp(-${k}*t)`, msg: "Esa es la ley de primer orden. En segundo orden lo que crece linealmente es $1/[\\mathrm{A}]$." },
          { expr: `${A0}/(1 + ${k}*t)`, msg: "Al despejar de $\\frac{1}{[\\mathrm{A}]} = \\frac{1}{[\\mathrm{A}]_0} + kt$, el tiempo queda multiplicado por $k\\,[\\mathrm{A}]_0$, no solo por $k$." }
        ].filter(t => A0 !== 1 || !t.expr.includes("/(1 +")),
        solution: ord === 1 ? [
          `[[qg-integradas|Primer orden]]: la velocidad es $-\\dfrac{d[\\mathrm{A}]}{dt} = k[\\mathrm{A}]$, y al integrar queda $\\ln[\\mathrm{A}] = \\ln[\\mathrm{A}]_0 - kt$.`,
          `Despejando: $[\\mathrm{A}](t) = [\\mathrm{A}]_0\\,e^{-kt} = ${ansT}$.`
        ] : [
          `[[qg-integradas|Segundo orden]]: la velocidad es $-\\dfrac{d[\\mathrm{A}]}{dt} = k[\\mathrm{A}]^2$, y al integrar queda $\\dfrac{1}{[\\mathrm{A}]} = \\dfrac{1}{[\\mathrm{A}]_0} + kt$.`,
          `Despejando: $[\\mathrm{A}](t) = \\dfrac{[\\mathrm{A}]_0}{1 + k[\\mathrm{A}]_0\\,t} = ${ansT}$, con $k[\\mathrm{A}]_0 = ${dec(kA)}$ s$^{-1}$.`
        ],
        // se integra la ley de velocidad con RK4, sin usar la ley integrada
        verify: { kind: "fnEq", g: t => rk(y => -k * y ** ord, A0, t), dom, tol: 1e-5 }
      };
    }
  };

  // equilibrio A ⇌ 2 B: el cociente en función del avance, el avance en el equilibrio y la concentración de B
  T["qg-ice-multi"] = {
    type: "multi", concepts: ["qg-equilibrio"], difficulty: 3,
    generate(r) {
      const A0 = r.pick([0.5, 1, 1.5, 2]), alpha = r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]), xr = alpha * A0;
      // K con tres cifras, y el avance exacto para ese K: 4x² + Kx − K·A0 = 0
      const K = +(4 * xr * xr / (A0 - xr)).toPrecision(3), x = (-K + Math.sqrt(K * K + 16 * K * A0)) / 8, B = 2 * x;
      const dom = [[0.05 * A0, 0.9 * A0]];
      return {
        prompt: `En un recipiente cerrado se colocan $${dec(A0)}$ mol/L del gas $\\mathrm{A}$, que se disocia según $\\mathrm{A(g)} \\rightleftharpoons 2\\,\\mathrm{B(g)}$, con $K_c = ${dec(K)}$ a esa temperatura. Al principio no hay $\\mathrm{B}$.`,
        parts: [
          { q: "Si reaccionan $x$ mol/L de $\\mathrm{A}$, escribí el cociente $\\dfrac{[\\mathrm{B}]^2}{[\\mathrm{A}]}$ en función de $x$.", type: "expr", vars: ["x"], lhs: "Q(x) = ", answer: `(2*x)^2/(${A0} - x)`, answerTex: `\\dfrac{(2x)^{2}}{${dec(A0)} - x}`, domain: dom,
            traps: [{ expr: `x^2/(${A0} - x)`, msg: "Por cada $\\mathrm{A}$ que reacciona se forman dos $\\mathrm{B}$: $[\\mathrm{B}] = 2x$." },
              { expr: `2*x/(${A0} - x)`, msg: "El coeficiente $2$ de $\\mathrm{B}$ también va como exponente: $[\\mathrm{B}]^2$." }],
            // la reacción avanza de a pasitos, llevando la cuenta de cada concentración
            verify: { kind: "fnEq", g: t => { let a = A0, b = 0; for (let i = 0; i < 1000; i++) { a -= t / 1000; b += 2 * t / 1000; } return b * b / a; }, dom, tol: 1e-6 } },
          { q: "¿Cuánto vale $x$ en el equilibrio, en mol/L?", type: "numeric", answer: x,
            // cinética: directa con constante K e inversa con constante 1, hasta que deja de cambiar
            verify: { kind: "value", fn: () => rk(y => K * (A0 - y) - (2 * y) ** 2, 0, 80, 16000), tol: 1e-5 } },
          { q: "¿Y la concentración de $\\mathrm{B}$ en el equilibrio, en mol/L?", type: "numeric", answer: B,
            traps: [{ value: x, msg: "Ese es $x$. Por la estequiometría, $[\\mathrm{B}] = 2x$." }],
            verify: { kind: "zero", fn: b => b * b / (A0 - b / 2) - K, scale: K } }
        ],
        solution: [
          `Tabla de avance: $[\\mathrm{A}] = ${dec(A0)} - x$ y $[\\mathrm{B}] = 2x$. Entonces $Q(x) = \\dfrac{(2x)^{2}}{${dec(A0)} - x}$.`,
          `En el [[qg-equilibrio|equilibrio]], $Q = K_c$: $4x^2 = ${dec(K)}\\,(${dec(A0)} - x)$, es decir, $4x^2 + ${dec(K)}\\,x - ${dec(+(K * A0).toPrecision(4))} = 0$.`,
          `La raíz positiva es $x = ${dec(x)}$ mol/L (la otra es negativa y no tiene sentido).`,
          `$[\\mathrm{B}] = 2x = ${dec(B)}$ mol/L, y queda $[\\mathrm{A}] = ${dec(A0 - x)}$ mol/L.`
        ]
      };
    }
  };

  E.addPractice("q101", { templates: T, lessons: { "qg-l-integradas": ["qg-integrada-expr"], "qg-l-ice": ["qg-ice-multi"] } });
})();
