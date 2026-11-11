/* ===== M106 · Escribir la expresión y paso a paso =====
   Se suman a lecciones que ya existen (E.addPractice). */
(function () {
  const E = window.Efecen, H = E.H;
  const T = {};
  const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
  const sub = (a, b) => a.map((x, i) => x - b[i]);
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const det3 = (a, b, c) => a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);
  const pt = a => `(${a.join(",\\ ")})`;
  const bisect = (f, a, b) => { let fa = f(a); for (let i = 0; i < 200; i++) { const m = (a + b) / 2, fm = f(m); if ((fm < 0) === (fa < 0)) { a = m; fa = fm; } else b = m; } return (a + b) / 2; };
  const dec = (x, d = 4) => H.num(x, d).replace(".", "{,}");

  // plano por tres puntos: la normal, la ecuación con z despejada y la distancia de un punto
  T["ga-plano-multi"] = {
    type: "multi", concepts: ["ga-plano", "ga-distancias"], difficulty: 3,
    generate(r) {
      const A = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)], AB = [r.nz(-3, 3), r.int(-3, 3), r.int(-2, 2)], AC = [r.int(-3, 3), r.nz(-3, 3), r.int(-2, 2)];
      const B = A.map((x, i) => x + AB[i]), C = A.map((x, i) => x + AC[i]), n = cross(AB, AC);
      if (n[2] === 0 || (n[0] === 0 && n[1] === 0)) return null;
      // la normal más simple: sin factor común y con la z positiva
      const g = H.gcd(H.gcd(n[0], n[1]), n[2]) * Math.sign(n[2]), m = n.map(x => x / g), D = dot(m, A);
      const Q = [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)], num = Math.abs(dot(m, Q) - D), nm = Math.hypot(...m), dist = num / nm;
      if (num === 0) return null;
      // z = -x confunde al chequeo de respuestas alteradas de la suite (0,1·z + x/10 se anula)
      if (m[0] === m[2] && m[1] === 0 && D === 0) return null;
      const [zm, zt] = H.terms([{ p: -m[0], m: "x", t: "x" }, { p: -m[1], m: "y", t: "y" }, { p: D }]);
      const [, eqt] = H.terms([{ p: m[0], m: "x", t: "x" }, { p: m[1], m: "y", t: "y" }, { p: m[2], m: "z", t: "z" }]);
      return {
        prompt: `Un plano pasa por los puntos $A = ${pt(A)}$, $B = ${pt(B)}$ y $C = ${pt(C)}$.`,
        parts: [
          { q: "Un vector normal es $\\vec n = \\overrightarrow{AB}\\times\\overrightarrow{AC}$. ¿Cuánto vale su componente $z$?", type: "numeric", answer: n[2],
            // con esa componente, el vector tiene que ser perpendicular a AB y a AC
            verify: { kind: "zero", fn: z => [dot([n[0], n[1], z], AB), dot([n[0], n[1], z], AC)] } },
          { q: "Escribí la ecuación del plano con la $z$ despejada.", type: "expr", vars: ["x", "y"], lhs: "z = ", answer: m[2] === 1 ? zm : `(${zm})/${m[2]}`, answerTex: m[2] === 1 ? zt : `\\dfrac{${zt}}{${m[2]}}`, domain: [[-3, 3], [-3, 3]],
            // el punto (x, y, z) está en el plano si AP, AB y AC son coplanares: el determinante es lineal en z
            verify: { kind: "fnEq", g: (x, y) => { const f = z => det3(sub([x, y, z], A), AB, AC), f0 = f(0); return -f0 / (f(1) - f0); }, dom: [[-3, 3], [-3, 3]] } },
          { q: `¿A qué distancia del plano está el punto $Q = ${pt(Q)}$?`, type: "numeric", answer: dist,
            traps: [{ value: num, msg: "Falta dividir por el módulo del vector normal." }].filter(t => Math.abs(t.value - dist) > 0.03 * Math.max(1, dist)),
            // el punto del plano más cercano a Q, por mínimos cuadrados sobre A + s·AB + t·AC
            verify: { kind: "value", fn: () => { const w = sub(Q, A), a11 = dot(AB, AB), a12 = dot(AB, AC), a22 = dot(AC, AC), b1 = dot(w, AB), b2 = dot(w, AC), dd = a11 * a22 - a12 * a12, s = (b1 * a22 - b2 * a12) / dd, t = (a11 * b2 - a12 * b1) / dd; return Math.hypot(...w.map((c, i) => c - s * AB[i] - t * AC[i])); }, tol: 1e-6 } }
        ],
        solution: [
          `$\\overrightarrow{AB} = ${pt(AB)}$ y $\\overrightarrow{AC} = ${pt(AC)}$. Su producto vectorial es $\\vec n = ${pt(n)}$, perpendicular a los dos.`,
          `[[ga-plano|Ecuación del plano]]: se puede usar cualquier múltiplo de $\\vec n$, por ejemplo $${pt(m)}$. Con el punto $A$: $${eqt} = ${D}$.`,
          `Despejando: $z = ${m[2] === 1 ? zt : `\\dfrac{${zt}}{${m[2]}}`}$.`,
          `[[ga-distancias|Distancia de un punto a un plano]]: se reemplaza $Q$ en $${eqt} - ${H.par(D)}$, se toma el valor absoluto y se divide por el módulo de la normal: $d = \\dfrac{${num}}{${dec(nm)}} = ${dec(dist)}$.`
        ]
      };
    }
  };

  // elipse: la distancia focal, la excentricidad y la mitad de arriba como función
  T["ga-elipse-multi"] = {
    type: "multi", concepts: ["ga-elipse"], difficulty: 2,
    generate(r) {
      const a = r.int(3, 9), b = r.int(2, a - 1), c = Math.sqrt(a * a - b * b), e = c / a;
      const dom = [[-0.8 * a, 0.8 * a]];
      return {
        prompt: `Considerá la elipse $\\dfrac{x^2}{${a * a}} + \\dfrac{y^2}{${b * b}} = 1$.`,
        parts: [
          { q: "¿A qué distancia del centro está cada foco?", type: "numeric", answer: c,
            traps: [{ value: Math.sqrt(a * a + b * b), msg: "En la elipse es $c^2 = a^2 - b^2$. Con el signo más es la relación de la hipérbola." }],
            // la suma de las distancias de un punto de la elipse a los focos es 2a (acá, el vértice (0, b))
            verify: { kind: "zero", fn: x => 2 * Math.hypot(x, b) - 2 * a } },
          { q: "¿Cuánto vale su excentricidad?", type: "numeric", answer: e,
            traps: [{ value: b / a, msg: "Ese es $b/a$. La excentricidad es $c/a$." }].filter(t => Math.abs(t.value - e) > 0.03),
            // definición con foco y directriz: distancia al foco sobre distancia a la directriz x = a²/c
            verify: { kind: "value", fn: () => { const x = a * Math.cos(1), y = b * Math.sin(1); return Math.hypot(x - c, y) / (a * a / c - x); }, tol: 1e-6 } },
          { q: "Escribí la mitad de arriba de la elipse como función de $x$.", type: "expr", vars: ["x"], lhs: "y = ", answer: `(${b}/${a})*sqrt(${a * a} - x^2)`, answerTex: `${H.frac(b, a)}\\sqrt{${a * a} - x^{2}}`, domain: dom,
            traps: [{ expr: `(${a}/${b})*sqrt(${a * a} - x^2)`, msg: "Revisá el factor: al despejar queda $y = \\frac{b}{a}\\sqrt{a^2 - x^2}$." }],
            // para cada x, la y positiva que cumple la ecuación, buscada por bisección
            verify: { kind: "fnEq", g: x => bisect(y => x * x / (a * a) + y * y / (b * b) - 1, 0, b), dom, tol: 1e-6 } }
        ],
        solution: [
          `En la [[ga-elipse|elipse]], $a^2 = ${a * a}$ y $b^2 = ${b * b}$, con $c^2 = a^2 - b^2 = ${a * a - b * b}$. Entonces $c = ${dec(c)}$ y los focos están en $(\\pm ${dec(c)},\\ 0)$.`,
          `Excentricidad: $e = \\dfrac{c}{a} = ${dec(e)}$. Está entre $0$ (circunferencia) y $1$ (muy achatada).`,
          `Despejando $y$: $\\dfrac{y^2}{${b * b}} = 1 - \\dfrac{x^2}{${a * a}}$, así que $y^2 = \\dfrac{${b * b}}{${a * a}}(${a * a} - x^2)$.`,
          `La mitad de arriba es la raíz positiva: $y = ${H.frac(b, a)}\\sqrt{${a * a} - x^{2}}$.`
        ]
      };
    }
  };

  E.addPractice("m106", { templates: T, lessons: { "ga-pr-l2": ["ga-plano-multi"], "ga-conicas-l3": ["ga-elipse-multi"] } });
})();
