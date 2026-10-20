/* ===== M102 · Figuras interactivas de los apuntes =====
   Se agregan al final de «La idea» de cada ficha (E.addFigures). Las que tienen `play` se animan con el botón
   «Reproducir». Las funciones de dos variables se muestran con sus curvas de nivel. */
(function () {
  const E = window.Efecen, R = String.raw;
  const nf = (x, d = 2) => String(+x.toFixed(d)).replace(".", "{,}").replace(/^-0$/, "0");
  // curvas de nivel de f en la ventana de g (marching squares)
  const contours = (g, f, levels, o = {}) => {
    const [x0, x1] = g.xr, [y0, y1] = g.yr, nx = o.nx || 60, ny = o.ny || 45, hx = (x1 - x0) / nx, hy = (y1 - y0) / ny;
    const V = []; for (let i = 0; i <= nx; i++) { V.push([]); for (let j = 0; j <= ny; j++) V[i].push(f(x0 + i * hx, y0 + j * hy)); }
    for (const L of levels) for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const c = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([a, b]) => [x0 + (i + a) * hx, y0 + (j + b) * hy, V[i + a][j + b] - L]), cut = [];
      for (let e = 0; e < 4; e++) { const A = c[e], B = c[(e + 1) % 4]; if (A[2] * B[2] < 0) { const t = A[2] / (A[2] - B[2]); cut.push([A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])]); } }
      if (cut.length >= 2) g.line(cut[0][0], cut[0][1], cut[1][0], cut[1][1], { c: o.c || "line", w: o.w || 1.5 });
      if (cut.length === 4) g.line(cut[2][0], cut[2][1], cut[3][0], cut[3][1], { c: o.c || "line", w: o.w || 1.5 });
    }
  };
  const fact = n => (n < 2 ? 1 : n * fact(n - 1));

  // curvas paramétricas (Lissajous): el punto recorre la curva con t
  const lissajous = {
    xr: [-1.4, 1.4], yr: [-1.2, 1.2], equal: true, h: 250,
    sliders: [{ k: "a", label: R`a`, min: 1, max: 5, step: 1, v: 3 }, { k: "b", label: R`b`, min: 1, max: 5, step: 1, v: 2 }, { k: "t", label: R`t`, min: 0, max: 6.283, step: 0.01, v: 2 }],
    play: { k: "t", max: 6.283, speed: 1, loop: true },
    draw(g, p) {
      const P = t => [Math.cos(p.a * t), Math.sin(p.b * t)], V = t => [-p.a * Math.sin(p.a * t), p.b * Math.cos(p.b * t)];
      g.grid(0.5, 0.5); g.axes();
      g.curve(Array.from({ length: 401 }, (_, i) => P(2 * Math.PI * i / 400)), { c: "line", w: 1.5 });
      g.curve(Array.from({ length: 201 }, (_, i) => P(p.t * i / 200)), { c: "p" });
      const [x, y] = P(p.t), [vx, vy] = V(p.t);
      g.arrow(x, y, x + 0.15 * vx, y + 0.15 * vy, { c: "ok" }); g.dot(x, y, { c: "f" });
      return `x = \\cos(${p.a}t),\\ y = \\sin(${p.b}t)\\qquad \\vec r\\,'(t) = (${nf(vx)};\\ ${nf(vy)})`;
    }
  };

  // curvas en polares: r = a + b·cos(nθ), dibujada a medida que crece θ
  const polar = {
    xr: [-3.2, 3.2], yr: [-3.2, 3.2], equal: true, h: 260,
    sliders: [{ k: "a", label: R`a`, min: 0, max: 2, step: 0.05, v: 0 }, { k: "b", label: R`b`, min: 0.5, max: 2, step: 0.05, v: 2 }, { k: "n", label: R`n`, min: 1, max: 6, step: 1, v: 3 }, { k: "th", label: R`\theta`, min: 0, max: 6.283, step: 0.01, v: 6.283 }],
    play: { k: "th", max: 6.283, speed: 1.2 },
    draw(g, p) {
      const r = t => p.a + p.b * Math.cos(p.n * t), P = t => [r(t) * Math.cos(t), r(t) * Math.sin(t)];
      g.grid(1, 1); g.axes();
      for (const R0 of [1, 2, 3]) g.circle(0, 0, R0, { c: "line", w: 1 });
      g.curve(Array.from({ length: 401 }, (_, i) => P(p.th * i / 400)), { c: "p" });
      const [x, y] = P(p.th);
      g.line(0, 0, x, y, { c: "f", w: 2 }); g.dot(x, y, { c: "f" });
      const kind = p.a === 0 ? (p.n % 2 ? `rosa de ${p.n} pétalos` : `rosa de ${2 * p.n} pétalos`) : p.n === 1 ? (p.a < p.b ? "caracol con lazo" : p.a === p.b ? "cardioide" : "caracol") : "curva de pétalos desplazada";
      return `r = a + b\\cos(n\\theta) = ${nf(r(p.th))}\\qquad \\text{${kind}}`;
    }
  };

  // polinomio de Taylor de grado n alrededor de a
  const taylor = {
    xr: [-6, 6], yr: [-3, 3], h: 240,
    sliders: [{ k: "f", label: R`\text{función}`, min: 1, max: 3, step: 1, v: 1 }, { k: "n", label: R`n`, min: 0, max: 15, step: 1, v: 5 }],
    draw(g, p) {
      const k = Math.round(p.f), n = Math.round(p.n);
      const fs = [Math.sin, Math.exp, x => (x > -1 ? Math.log(1 + x) : NaN)][k - 1];
      // coeficientes de Maclaurin
      const c = j => k === 1 ? (j % 2 ? (((j - 1) / 2) % 2 ? -1 : 1) / fact(j) : 0) : k === 2 ? 1 / fact(j) : (j === 0 ? 0 : (j % 2 ? 1 : -1) / j);
      const Pn = x => { let s = 0; for (let j = 0; j <= n; j++) s += c(j) * x ** j; return s; };
      g.grid(1, 1); g.axes();
      if (k === 3) g.line(-1, -3, -1, 3, { c: "muted", dash: true, w: 1 });
      if (k === 3) g.line(1, -3, 1, 3, { c: "muted", dash: true, w: 1 });
      g.fn(fs, { c: "ink", w: 2, from: k === 3 ? -0.999 : -6 });
      g.fn(Pn, { c: "p" });
      const err = Math.abs(fs(1) - Pn(1));
      return `f = ${["\\sin x", "e^x", "\\ln(1 + x)"][k - 1]}\\qquad T_{${n}}(x)\\ \\text{alrededor de } 0\\qquad |f(1) - T_{${n}}(1)| = ${err < 1e-4 ? nf(err * 1e6, 1) + "\\times10^{-6}" : nf(err, 4)}${k === 3 ? "\\qquad \\text{solo converge en } (-1, 1]" : ""}`;
    }
  };

  // serie de Fourier de una onda cuadrada (fenómeno de Gibbs)
  const fourier = {
    xr: [-6.5, 6.5], yr: [-1.5, 1.5], h: 220,
    sliders: [{ k: "N", label: R`\text{términos}`, min: 1, max: 40, step: 1, v: 5 }],
    draw(g, p) {
      const N = Math.round(p.N), S = x => { let s = 0; for (let k = 0; k < N; k++) { const m = 2 * k + 1; s += Math.sin(m * x) / m; } return 4 / Math.PI * s; };
      g.grid(Math.PI / 2, 0.5); g.axes();
      g.fn(x => (Math.sin(x) >= 0 ? 1 : -1), { c: "line", w: 2 });
      g.fn(S, { c: "p", w: 2 });
      let mx = 0; for (let i = 1; i < 400; i++) mx = Math.max(mx, S(Math.PI * i / 400));
      return `S_N(x) = \\frac4\\pi\\sum_{k=0}^{N-1}\\frac{\\sin((2k + 1)x)}{2k + 1}\\qquad \\max S_N \\approx ${nf(mx, 3)}\\ \\text{(Gibbs: no baja de } 1{,}18)`;
    }
  };

  // circunferencia osculatriz de y = f(x)
  const curvatura = {
    xr: [-3, 3], yr: [-1, 4], equal: true, h: 250,
    sliders: [{ k: "x", label: R`x_0`, min: -1.8, max: 1.8, step: 0.01, v: 0.5 }],
    play: { k: "x", max: 1.8, speed: 0.6, loop: true },
    draw(g, p) {
      const f = x => x * x / 2 + 0.5, d1 = x => x, d2 = () => 1;
      const x0 = p.x, y0 = f(x0), q = 1 + d1(x0) ** 2, kap = Math.abs(d2(x0)) / q ** 1.5, Rr = 1 / kap;
      const n = [-d1(x0), 1].map(c => c / Math.sqrt(q)), C = [x0 + Rr * n[0], y0 + Rr * n[1]];
      g.grid(1, 1); g.axes();
      g.fn(f, { c: "p" });
      g.circle(C[0], C[1], Rr, { c: "f", w: 1.5 }); g.line(x0, y0, C[0], C[1], { c: "muted", dash: true, w: 1 });
      g.dot(x0, y0); g.dot(C[0], C[1], { c: "f", r: 3 });
      return `\\kappa = \\frac{|f''|}{(1 + f'^2)^{3/2}} = ${nf(kap, 3)}\\qquad R = \\frac1\\kappa = ${nf(Rr)}`;
    }
  };

  // curvas de nivel y gradiente
  const gradiente = {
    xr: [-3, 3], yr: [-2.4, 2.4], equal: true, h: 250,
    sliders: [{ k: "x", label: R`x_0`, min: -2.5, max: 2.5, step: 0.05, v: 1.2 }, { k: "y", label: R`y_0`, min: -2, max: 2, step: 0.05, v: 0.8 }],
    draw(g, p) {
      const f = (x, y) => x * x + 2 * y * y, gx = 2 * p.x, gy = 4 * p.y, m = Math.hypot(gx, gy);
      contours(g, f, [0.5, 1, 2, 3, 4.5, 6, 8, 10]);
      g.axes();
      contours(g, f, [f(p.x, p.y)], { c: "p", w: 2 });
      if (m > 1e-9) g.arrow(p.x, p.y, p.x + 0.8 * gx / m, p.y + 0.8 * gy / m, { c: "f" });
      g.dot(p.x, p.y, { c: "ink" });
      return `f = x^2 + 2y^2\\qquad \\nabla f = (${nf(gx)};\\ ${nf(gy)})\\qquad \\text{perpendicular a la curva de nivel}`;
    }
  };

  // multiplicadores de Lagrange: f sobre la circunferencia x² + y² = 4
  const lagrange = {
    xr: [-3, 3], yr: [-2.6, 2.6], equal: true, h: 260,
    sliders: [{ k: "t", label: R`\text{posición sobre la restricción } (°)`, min: 0, max: 360, step: 0.5, v: 30 }],
    play: { k: "t", max: 360, speed: 30, loop: true },
    draw(g, p) {
      const f = (x, y) => x + 2 * y, t = p.t * Math.PI / 180, x = 2 * Math.cos(t), y = 2 * Math.sin(t);
      contours(g, f, [-6, -4.47, -3, -1.5, 0, 1.5, 3, 4.47, 6]);
      g.axes(); g.circle(0, 0, 2, { c: "ok", w: 2.5 });
      contours(g, f, [f(x, y)], { c: "p", w: 2 });
      g.arrow(x, y, x + 1 / Math.sqrt(5) * 0.9, y + 2 / Math.sqrt(5) * 0.9, { c: "f" });
      g.arrow(x, y, x + 0.45 * x, y + 0.45 * y, { c: "ok", w: 2 });
      g.dot(x, y, { c: "ink" });
      const cr = Math.abs(1 * y - 2 * x) / 2;
      return `f(x, y) = x + 2y = ${nf(f(x, y))}\\qquad ${cr < 0.06 ? `\\nabla f \\parallel \\nabla g:\\ \\text{${f(x, y) > 0 ? "máximo" : "mínimo"}}` : `\\nabla f \\not\\parallel \\nabla g:\\ \\text{se puede mejorar moviéndose}`}`;
    }
  };

  // campo de pendientes de la ecuación logística
  const logistica = {
    xr: [0, 10], yr: [-0.5, 12], h: 240,
    sliders: [{ k: "k", label: R`k`, min: 0.2, max: 2, step: 0.05, v: 0.8 }, { k: "y0", label: R`y_0`, min: 0.2, max: 11.5, step: 0.1, v: 1 }],
    draw(g, p) {
      const K = 8, F = y => p.k * y * (1 - y / K);
      for (let i = 0; i <= 10; i++) for (let j = 0; j <= 12; j++) { const s = F(j), L = 0.35 / Math.hypot(1, s / 1.2); g.line(i - L, j - s * L, i + L, j + s * L, { c: "line", w: 1.5 }); }
      g.axes(); g.line(0, K, 10, K, { c: "muted", dash: true, w: 1 });
      // solución exacta y(t) = K / (1 + (K/y0 − 1)·e^{−kt})
      g.fn(t => K / (1 + (K / p.y0 - 1) * Math.exp(-p.k * t)), { c: "p" });
      return `y' = ky\\left(1 - \\frac yK\\right),\\ K = 8\\qquad y(t) = \\frac{K}{1 + (K/y_0 - 1)e^{-kt}}`;
    }
  };

  E.addFigures("m102", {
    "c2-parametricas": [{ viz: lissajous, caption: R`Una curva paramétrica es un punto que se mueve: $t$ es el tiempo. La flecha verde es el vector velocidad $\vec r\,'(t)$, siempre tangente. Con $a$ y $b$ enteros, la curva se cierra.` }],
    "c2-polares": [{ viz: polar, caption: R`Con «Reproducir», el radio (naranja) gira y dibuja la curva. Con $a = 0$ salen rosas; con $n = 1$ y $a = b$, la cardioide; con $a < b$, el caracol tiene un lazo interior (donde $r < 0$).` }],
    "c2-taylor": [{ viz: taylor, caption: R`Negra: la función; violeta: su polinomio de Taylor en $0$. Cuantos más términos, más lejos se parece. Para $\ln(1 + x)$ la serie solo converge en $(-1, 1]$: afuera, más términos empeoran.` }],
    "c2-fourier": [{ viz: fourier, caption: R`Sumas parciales de la serie de Fourier de una onda cuadrada. Convergen en cada punto, pero cerca del salto queda siempre un pico de casi el $9\,\%$ (fenómeno de Gibbs).` }],
    "c2-curvatura": [{ viz: curvatura, caption: R`La circunferencia osculatriz (naranja) es la que mejor se pega a la curva en ese punto; su radio es $\frac1\kappa$. En el vértice de la parábola la curvatura es máxima y el círculo, el más chico.` }],
    "c2-gradiente": [{ viz: gradiente, caption: R`Curvas de nivel de $f(x, y) = x^2 + 2y^2$. El gradiente (naranja) apunta hacia donde $f$ crece más rápido y es perpendicular a la curva de nivel que pasa por el punto (violeta).` }],
    "c2-lagrange": [{ viz: lagrange, caption: R`Se busca el extremo de $f = x + 2y$ sobre la circunferencia verde. Naranja: $\nabla f$; verde: $\nabla g$. En el máximo y el mínimo la curva de nivel es tangente a la restricción y los gradientes son paralelos: $\nabla f = \lambda\nabla g$.` }],
    "c2-edo-modelos": [{ viz: logistica, caption: R`Campo de pendientes de la ecuación logística: cada segmento tiene la pendiente $y'$ que pide la ecuación. La solución (violeta) sigue los segmentos y tiende a la capacidad $K$, desde abajo o desde arriba.` }]
  });
})();
