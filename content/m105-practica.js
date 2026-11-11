/* ===== M105 · Escribir la expresión y paso a paso =====
   Se suman a lecciones que ya existen (E.addPractice). */
(function () {
  const E = window.Efecen, H = E.H;
  const T = {};
  const simpson = (f, a, b, n = 400) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3; };
  const dec = (x, d = 4) => H.num(x, d).replace(".", "{,}");
  const far = (v, ans) => Math.abs(v - ans) > 0.03 * Math.max(1, Math.abs(ans));

  // densidad k·xⁿ en [0, b]: la constante, la función de distribución y la esperanza
  T["pe-densidad-multi"] = {
    type: "multi", concepts: ["pe-va-continua"], difficulty: 2,
    generate(r) {
      const n = r.int(1, 3), b = r.int(1, 4), B = b ** (n + 1), k = (n + 1) / B, mu = (n + 1) * b / (n + 2);
      const xn = H.pw(n, "x").t, xn1 = H.pw(n + 1, "x").t, f = x => k * x ** n, dom = [[0.1 * b, 0.95 * b]];
      return {
        prompt: `Una variable aleatoria continua $X$ tiene densidad $f(x) = k\\,${xn}$ para $0 \\le x \\le ${b}$, y $f(x) = 0$ fuera de ese intervalo.`,
        parts: [
          { q: "¿Cuánto tiene que valer $k$?", type: "numeric", answer: k, answerTex: H.frac(n + 1, B),
            // con ese k, el área bajo la densidad (por Simpson) tiene que dar 1
            verify: { kind: "zero", fn: x => simpson(t => x * t ** n, 0, b) - 1 } },
          { q: `Escribí la función de distribución $F(x) = P(X \\le x)$ para $0 \\le x \\le ${b}$.`, type: "expr", vars: ["x"], lhs: "F(x) = ", answer: B === 1 ? `x^${n + 1}` : `x^${n + 1}/${B}`, answerTex: B === 1 ? xn1 : `\\dfrac{${xn1}}{${B}}`, domain: dom,
            traps: [{ expr: `(${n + 1}/${B})*x^${n + 1}`, msg: `Al integrar $${xn}$ aparece un $\\frac{1}{${n + 1}}$, que se simplifica con el $${n + 1}$ de $k$.` }],
            // el área acumulada de la densidad desde 0 hasta x
            verify: { kind: "fnEq", g: x => simpson(f, 0, x), dom } },
          { q: "¿Cuánto vale la esperanza $E[X]$?", type: "numeric", answer: mu, answerTex: H.frac((n + 1) * b, n + 2),
            traps: [{ value: b / 2, msg: "Ese es el punto medio del intervalo: sería la esperanza si la densidad fuera constante. Acá hay más probabilidad cerca del extremo derecho." }].filter(t => far(t.value, mu)),
            verify: { kind: "integral", f: x => x * f(x), a: 0, b } }
        ],
        solution: [
          `Una [[pe-va-continua|densidad]] tiene que integrar $1$: $\\int_0^{${b}} k\\,${xn}\\,dx = k\\,\\dfrac{${B}}{${n + 1}} = 1$, así que $k = ${H.frac(n + 1, B)}$.`,
          `La función de distribución acumula la densidad: $F(x) = \\int_0^x ${H.frac(n + 1, B)}\\,t^{${n}}\\,dt = ${B === 1 ? xn1 : `\\dfrac{${xn1}}{${B}}`}$. Vale $0$ en $x = 0$ y $1$ en $x = ${b}$, como tiene que ser.`,
          `Esperanza: $E[X] = \\int_0^{${b}} x\\,f(x)\\,dx = ${H.frac(n + 1, B)}\\cdot\\dfrac{${b}^{${n + 2}}}{${n + 2}} = ${H.frac((n + 1) * b, n + 2)}$.`
        ]
      };
    }
  };

  // recta de mínimos cuadrados con cinco datos: la pendiente, la ordenada y una predicción
  T["pe-recta-multi"] = {
    type: "multi", concepts: ["pe-regresion"], difficulty: 3,
    generate(r) {
      const xs = r.distinct(5, 0, 9).sort((p, q) => p - q), b0 = r.pick([-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2]), a0 = r.int(-3, 8);
      const ys = xs.map(x => Math.round(a0 + b0 * x + r.int(-1, 1)));
      const n = 5, mx = xs.reduce((s, x) => s + x, 0) / n, my = ys.reduce((s, y) => s + y, 0) / n;
      const Sxx = xs.reduce((s, x) => s + (x - mx) ** 2, 0), Sxy = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0), Syy = ys.reduce((s, y) => s + (y - my) ** 2, 0);
      if (Sxy === 0 || Syy === 0) return null;
      const b = Sxy / Sxx, a = my - b * mx, x0 = r.pick([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(x => !xs.includes(x))), y0 = a + b * x0;
      const table = `\\begin{array}{c|ccccc} x & ${xs.join(" & ")} \\\\ \\hline y & ${ys.join(" & ")} \\end{array}`;
      return {
        prompt: `Se midieron estos cinco pares de datos: $$${table}$$ Se ajusta la recta de mínimos cuadrados $\\hat y = a + b\\,x$.`,
        parts: [
          { q: "¿Cuánto vale la pendiente $b$?", type: "numeric", answer: b,
            traps: [{ value: Sxy / Syy, msg: "Dividiste por la variación de $y$. La pendiente es $S_{xy}/S_{xx}$: abajo va la variación de $x$." }].filter(t => far(t.value, b)),
            // con esa pendiente, los residuos no guardan relación lineal con x
            verify: { kind: "zero", fn: m => xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my - m * (x - mx)), 0), scale: Sxx } },
          { q: "¿Y la ordenada al origen $a$?", type: "numeric", answer: a,
            traps: [{ value: my, msg: "Ese es el promedio de $y$. La recta pasa por $(\\bar x, \\bar y)$, así que $a = \\bar y - b\\,\\bar x$." }].filter(t => far(t.value, a)),
            // con esa ordenada, los residuos suman cero
            verify: { kind: "zero", fn: c => ys.reduce((s, y, i) => s + (y - c - b * xs[i]), 0), scale: Math.abs(my) * n } },
          { q: `¿Qué valor de $y$ predice la recta para $x = ${x0}$?`, type: "numeric", answer: y0,
            // ecuaciones normales con las sumas crudas, resueltas por Cramer
            verify: { kind: "value", fn: () => { const sx = xs.reduce((s, x) => s + x, 0), sy = ys.reduce((s, y) => s + y, 0), sxx = xs.reduce((s, x) => s + x * x, 0), sxy = xs.reduce((s, x, i) => s + x * ys[i], 0), d = n * sxx - sx * sx; return (sy * sxx - sx * sxy) / d + (n * sxy - sx * sy) / d * x0; }, tol: 1e-6 } }
        ],
        solution: [
          `Promedios: $\\bar x = ${dec(mx)}$ y $\\bar y = ${dec(my)}$.`,
          `$S_{xx} = \\sum (x_i - \\bar x)^2 = ${dec(Sxx)}$ y $S_{xy} = \\sum (x_i - \\bar x)(y_i - \\bar y) = ${dec(Sxy)}$.`,
          `[[pe-regresion|Recta de mínimos cuadrados]]: $b = \\dfrac{S_{xy}}{S_{xx}} = ${dec(b)}$ y $a = \\bar y - b\\,\\bar x = ${dec(a)}$.`,
          `Predicción: $\\hat y(${x0}) = ${dec(a)} + ${H.par(+b.toFixed(4)).replace(".", "{,}")}\\cdot ${x0} = ${dec(y0)}$.`
        ]
      };
    }
  };

  E.addPractice("m105", { templates: T, lessons: { "pe-cont-l1": ["pe-densidad-multi"], "pe-reg-l1": ["pe-recta-multi"] } });
})();
