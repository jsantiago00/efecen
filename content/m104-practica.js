/* ===== M104 · Escribir la expresión y paso a paso =====
   Se suman a lecciones que ya existen (E.addPractice). */
(function () {
  const E = window.Efecen, H = E.H;
  const T = {};
  const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
  const vec = a => `(${a.join(",\\ ")})`;
  // mínimo de una función de una variable por sección áurea (para verificar)
  const golden = (f, a, b) => { const g = (Math.sqrt(5) - 1) / 2; for (let i = 0; i < 200; i++) { const x1 = b - g * (b - a), x2 = a + g * (b - a); if (f(x1) < f(x2)) b = x2; else a = x1; } return (a + b) / 2; };
  const far = (v, ans) => Math.abs(v - ans) > 0.03 * Math.max(1, Math.abs(ans));

  // proyección de un vector sobre otro: el producto escalar, el factor y la parte perpendicular
  T["al-proy-multi"] = {
    type: "multi", concepts: ["al-escalar"], difficulty: 2,
    generate(r) {
      const u = [r.nz(-4, 4), r.int(-4, 4), r.nz(-4, 4)], v = [r.nz(-3, 3), r.nz(-3, 3), r.int(-3, 3)];
      const d = dot(u, v), n2 = dot(v, v), u2 = dot(u, u);
      // sin perpendiculares ni paralelos: en esos casos no hay nada que calcular
      if (d === 0 || d * d === u2 * n2) return null;
      const k = d / n2, perp = Math.sqrt(u2 - d * d / n2);
      const sum = u.map((x, i) => x + v[i]), dif = u.map((x, i) => x - v[i]);
      return {
        prompt: `Sean $\\vec u = ${vec(u)}$ y $\\vec v = ${vec(v)}$.`,
        parts: [
          { q: "Calculá $\\vec u\\cdot\\vec v$.", type: "numeric", answer: d,
            // identidad de polarización: no usa la suma de productos componente a componente
            verify: { kind: "value", fn: () => (dot(sum, sum) - dot(dif, dif)) / 4 } },
          { q: "La proyección de $\\vec u$ sobre $\\vec v$ es un múltiplo de $\\vec v$: $k\\,\\vec v$. ¿Cuánto vale $k$?", type: "numeric", answer: k, answerTex: H.frac(d, n2),
            traps: [
              { value: d / Math.sqrt(n2), msg: "Eso es la proyección escalar (cuánto mide la sombra). Para el factor que multiplica a $\\vec v$ se divide por $|\\vec v|^2$, no por $|\\vec v|$." },
              { value: d / u2, msg: "Dividiste por $|\\vec u|^2$. Se proyecta sobre $\\vec v$, así que va $|\\vec v|^2$." }
            ].filter(t => far(t.value, k)),
            // lo que queda al restar la proyección tiene que ser perpendicular a v
            verify: { kind: "zero", fn: x => dot(u.map((c, i) => c - x * v[i]), v) } },
          { q: "¿Cuánto mide la parte de $\\vec u$ perpendicular a $\\vec v$, es decir, $|\\vec u - k\\,\\vec v|$?", type: "numeric", answer: perp,
            // es la menor distancia de u a la recta generada por v
            verify: { kind: "value", fn: () => { const f = t => Math.hypot(...u.map((c, i) => c - t * v[i])); return f(golden(f, -30, 30)); }, tol: 1e-6 } }
        ],
        solution: [
          `[[al-producto-escalar|Producto escalar]]: $\\vec u\\cdot\\vec v = ${u.map((x, i) => `${H.par(x)}\\cdot${H.par(v[i])}`).join(" + ")} = ${d}$.`,
          `La proyección es $\\dfrac{\\vec u\\cdot\\vec v}{|\\vec v|^2}\\,\\vec v$. Como $|\\vec v|^2 = ${n2}$, el factor es $k = ${H.frac(d, n2)}$.`,
          `La parte perpendicular y la proyección forman un triángulo rectángulo con $\\vec u$, así que por Pitágoras $|\\vec u - k\\vec v|^2 = |\\vec u|^2 - k^2|\\vec v|^2 = ${u2} - ${H.frac(d * d, n2)}$.`,
          `Entonces $|\\vec u - k\\vec v| = ${H.num(perp, 4).replace(".", "{,}")}$.`
        ]
      };
    }
  };

  // autovalores de una matriz de 2×2: el polinomio característico, el autovalor mayor y su autovector
  T["al-autoval-multi"] = {
    type: "multi", concepts: ["al-autovalores"], difficulty: 3,
    generate(r) {
      const [l1, l2] = r.distinct(2, -4, 5).sort((x, y) => x - y), p = r.pick([-3, -2, 1, 2]), q = p + 1;
      // A = P D P⁻¹ con P = [[1, 1], [p, q]]: los autovectores son (1, p) y (1, q)
      const a = l1 * q - l2 * p, b = l2 - l1, c = p * q * (l1 - l2), d = q * l2 - p * l1, tr = a + d, det = a * d - b * c;
      const [pm, pt] = H.terms([{ p: 1, m: "x^2", t: "x^{2}" }, { p: -tr, m: "x", t: "x" }, { p: det }]);
      const M = `\\begin{pmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{pmatrix}`;
      return {
        prompt: `Sea la matriz $A = ${M}$.`,
        parts: [
          { q: "Escribí su polinomio característico, $\\det(A - \\lambda I)$, usando $x$ en lugar de $\\lambda$.", type: "expr", vars: ["x"], lhs: "p(x) = ", answer: pm, answerTex: pt, domain: [[-5, 5]],
            traps: [{ expr: H.terms([{ p: 1, m: "x^2", t: "x^{2}" }, { p: tr, m: "x", t: "x" }, { p: det }])[0], msg: "Revisá el signo del término lineal: es $-\\operatorname{tr}(A)\\,x$." }].filter(() => tr !== 0),
            verify: { kind: "fnEq", g: x => (a - x) * (d - x) - b * c, dom: [[-5, 5]] } },
          { q: "¿Cuál es el autovalor más grande de $A$?", type: "numeric", answer: l2,
            traps: [{ value: l1, msg: "Ese es el más chico: el polinomio tiene otra raíz." }],
            // método de las potencias sobre A + 10 I (así el autovalor buscado es el dominante)
            verify: { kind: "value", fn: () => { let x = 1, y = 0.3, lam = 0; for (let i = 0; i < 2000; i++) { const nx = (a + 10) * x + b * y, ny = c * x + (d + 10) * y, n = Math.hypot(nx, ny); lam = (x * nx + y * ny) / (x * x + y * y); x = nx / n; y = ny / n; } return lam - 10; }, tol: 1e-6 } },
          { q: "Un autovector de ese autovalor tiene la forma $(1,\\ y)$. ¿Cuánto vale $y$?", type: "numeric", answer: q,
            traps: [{ value: p, msg: "Ese es el autovector del otro autovalor." }],
            verify: { kind: "zero", fn: y => [a + b * y - l2, c + d * y - l2 * y] } }
        ],
        solution: [
          `[[al-autovalores|Polinomio característico]]: $\\det(A - \\lambda I) = (${a} - \\lambda)(${d} - \\lambda) - ${H.par(b)}\\cdot${H.par(c)} = ${pt.replace(/x/g, "\\lambda")}$. En una matriz de $2\\times2$ siempre queda $\\lambda^2 - \\operatorname{tr}(A)\\,\\lambda + \\det A$.`,
          `Sus raíces son los autovalores: $\\lambda = ${l1}$ y $\\lambda = ${l2}$. El más grande es $${l2}$.`,
          `Para el autovector se resuelve $(A - ${H.par(l2)}I)\\vec v = \\vec 0$. De la primera fila, $${H.par(a - l2)}\\cdot 1 + ${H.par(b)}\\,y = 0$, así que $y = ${q}$.`,
          `Control: $A\\,(1, ${q}) = (${a + b * q}, ${c + d * q}) = ${l2}\\cdot(1, ${q})$.`
        ]
      };
    }
  };

  E.addPractice("m104", { templates: T, lessons: { "al-escalar": ["al-proy-multi"], "al-autovalores": ["al-autoval-multi"] } });
})();
