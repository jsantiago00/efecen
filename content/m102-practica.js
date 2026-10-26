/* ===== M102 · Escribir la expresión y paso a paso =====
   Se suman a lecciones que ya existen (E.addPractice). */
(function () {
  const E = window.Efecen, H = E.H;
  const T = {};
  const dom = [[0.3, 1.5], [0.3, 1.5]];
  // derivada parcial numérica (para verificar), respecto de la variable i
  const dpart = (f, p, i, h = 1e-6) => { const a = p.slice(), b = p.slice(); a[i] += h; b[i] -= h; return (f(...a) - f(...b)) / (2 * h); };
  // monomio x^m y^n para H.terms
  const mono = (m, n) => {
    const X = H.pw(m, "x"), Y = H.pw(n, "y");
    return { m: [X.m, Y.m].filter(Boolean).join("*"), t: X.t + Y.t };
  };

  T["c2-parcial-expr"] = {
    type: "expr", concepts: ["c2-parciales"], difficulty: 2,
    generate(r) {
      const v = r.pick(["poly", "exp", "trig", "ln"]), wx = r.bool(), lhs = `\\dfrac{\\partial f}{\\partial ${wx ? "x" : "y"}} = `;
      let F, f, dx, dy;
      if (v === "poly") {
        const m = r.int(1, 3), n = r.int(1, 3), a = r.nz(-4, 4), b = r.nz(-3, 3), c = r.nz(-5, 5);
        F = H.terms([{ p: a, ...mono(m, n) }, { p: b, ...mono(0, 2) }, { p: c, ...mono(1, 0) }])[1];
        f = (x, y) => a * x ** m * y ** n + b * y * y + c * x;
        dx = H.terms([{ p: a * m, ...mono(m - 1, n) }, { p: c }]);
        dy = H.terms([{ p: a * n, ...mono(m, n - 1) }, { p: 2 * b, ...mono(0, 1) }]);
      } else if (v === "exp") {
        const a = r.pick([1, 2, 3, -1, -2]), ex = `${H.cf(a)}xy`;
        F = `e^{${ex}}`; f = (x, y) => Math.exp(a * x * y);
        dx = [`${a}*y*exp(${a}*x*y)`, `${H.cf(a)}y\\,e^{${ex}}`];
        dy = [`${a}*x*exp(${a}*x*y)`, `${H.cf(a)}x\\,e^{${ex}}`];
      } else if (v === "trig") {
        const m = r.int(1, 4), a = r.int(2, 5), X = H.pw(m, "x"), X1 = H.pw(m - 1, "x");
        F = `${X.t}\\sin(${a}y)`; f = (x, y) => x ** m * Math.sin(a * y);
        dx = [`${m}${X1.m ? "*" + X1.m : ""}*sin(${a}*y)`, `${m === 1 ? "" : m}${X1.t}\\sin(${a}y)`];
        dy = [`${a}*${X.m}*cos(${a}*y)`, `${a}${X.t}\\cos(${a}y)`];
      } else {
        const a = r.int(1, 5), den = `x^{2} + ${a === 1 ? "" : a}y^{2}`, denP = `(x^2 + ${a}*y^2)`;
        F = `\\ln(${den})`; f = (x, y) => Math.log(x * x + a * y * y);
        dx = [`2*x/${denP}`, `\\dfrac{2x}{${den}}`];
        dy = [`${2 * a}*y/${denP}`, `\\dfrac{${2 * a}y}{${den}}`];
      }
      const [ans, ansT] = wx ? dx : dy, [oth] = wx ? dy : dx;
      return {
        prompt: `Si $f(x, y) = ${F}$, escribí $\\dfrac{\\partial f}{\\partial ${wx ? "x" : "y"}}$.`,
        lhs, answer: ans, answerTex: ansT, vars: ["x", "y"], domain: dom,
        traps: [{ expr: oth, msg: `Esa es la derivada respecto de la otra variable. Al derivar respecto de $${wx ? "x" : "y"}$, la $${wx ? "y" : "x"}$ queda fija, como si fuera una constante.` }],
        solution: [
          `Para la [[c2-parciales|derivada parcial]] respecto de $${wx ? "x" : "y"}$, se deriva como en una variable y se trata a $${wx ? "y" : "x"}$ como una constante.`,
          `$\\dfrac{\\partial f}{\\partial ${wx ? "x" : "y"}} = ${ansT}$`
        ],
        verify: { kind: "derivOf", f, wrt: wx ? 0 : 1, dom }
      };
    }
  };

  T["c2-plano-multi"] = {
    type: "multi", concepts: ["c2-gradiente"], difficulty: 2,
    generate(r) {
      const a = r.nz(-3, 3), b = r.nz(-3, 3), c = r.nz(-4, 4), d = r.int(-5, 5), x0 = r.nz(-2, 2), y0 = r.nz(-2, 2);
      const dX = r.pick([0.1, -0.1, 0.2, 0.05]), dY = r.pick([0.1, -0.1, -0.2, 0.05]);
      // f = a x² + b x y + c y² + d
      const f = (x, y) => a * x * x + b * x * y + c * y * y + d;
      const F = H.terms([{ p: a, m: "x^2", t: "x^{2}" }, { p: b, m: "x*y", t: "xy" }, { p: c, m: "y^2", t: "y^{2}" }, { p: d }])[1];
      const fx = 2 * a * x0 + b * y0, fy = b * x0 + 2 * c * y0, f0 = f(x0, y0), L = f0 + fx * dX + fy * dY;
      const X1 = +(x0 + dX).toFixed(2), Y1 = +(y0 + dY).toFixed(2), dec = v => String(v).replace(".", "{,}"), pd = v => (v < 0 ? `(${dec(v)})` : dec(v));
      return {
        prompt: `Sea $f(x, y) = ${F}$ y el punto $P = (${x0}, ${y0})$.`,
        parts: [
          { q: "¿Cuánto vale $f_x(P)$?", type: "numeric", answer: fx, verify: { kind: "deriv", f: x => f(x, y0), x0 } },
          { q: "¿Y $f_y(P)$?", type: "numeric", answer: fy, verify: { kind: "deriv", f: y => f(x0, y), x0: y0 } },
          { q: `Con el plano tangente en $P$, aproximá $f(${dec(X1)}, ${dec(Y1)})$.`, type: "numeric", answer: L, tolerance: 0.002,
            traps: [{ value: f0, msg: "Ese es $f(P)$: falta sumarle cómo cambia $f$ al moverse, $f_x\\,\\Delta x + f_y\\,\\Delta y$." }].filter(t => Math.abs(t.value - L) > 0.004 * Math.max(1, Math.abs(L))),
            verify: { kind: "value", fn: () => f0 + dpart(f, [x0, y0], 0) * dX + dpart(f, [x0, y0], 1) * dY, tol: 1e-5 } }
        ],
        solution: [
          `[[c2-parciales|Derivadas parciales]]: $f_x = ${H.terms([{ p: 2 * a, m: "x", t: "x" }, { p: b, m: "y", t: "y" }])[1]}$ y $f_y = ${H.terms([{ p: b, m: "x", t: "x" }, { p: 2 * c, m: "y", t: "y" }])[1]}$. En $P$: $f_x = ${fx}$ y $f_y = ${fy}$.`,
          `[[c2-gradiente|Plano tangente]]: $f(x, y) \\approx f(P) + f_x(P)\\,(x - ${H.par(x0)}) + f_y(P)\\,(y - ${H.par(y0)})$, con $f(P) = ${f0}$.`,
          `Con $\\Delta x = ${dec(dX)}$ y $\\Delta y = ${dec(dY)}$: $f \\approx ${f0} + ${H.par(fx)}\\cdot ${pd(dX)} + ${H.par(fy)}\\cdot ${pd(dY)} = ${H.num(L, 4).replace(".", "{,}")}$.`
        ]
      };
    }
  };

  E.addPractice("m102", { templates: T, lessons: { "c2-parciales": ["c2-parcial-expr"], "c2-gradiente": ["c2-plano-multi"] } });
})();
