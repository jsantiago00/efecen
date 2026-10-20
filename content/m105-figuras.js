/* ===== M105 · Figuras interactivas de los apuntes =====
   Se agregan al final de «La idea» de cada ficha (E.addFigures). Usan la biblioteca estadística E.pye (Φ, cuantiles,
   binomial, Poisson). Las muestras «al azar» salen de un generador con semilla, para que la figura no cambie sola. */
(function () {
  const E = window.Efecen, R = String.raw, S = E.pye;
  const nf = (x, d = 2) => String(+x.toFixed(d)).replace(".", "{,}").replace(/^-0$/, "0");
  const dnorm = (x, m, s) => Math.exp(-(((x - m) / s) ** 2) / 2) / (s * Math.sqrt(2 * Math.PI));
  // generador pseudoaleatorio con semilla (mulberry32) y normales por Box-Muller
  const rng = seed => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const gauss = u => () => Math.sqrt(-2 * Math.log(1 - u())) * Math.cos(2 * Math.PI * u());
  const bars = (g, xs, ys, o = {}) => xs.forEach((x, i) => g.rect(x - (o.w || 0.4), 0, 2 * (o.w || 0.4), ys[i], { c: o.c || "p", fill: o.c || "p", alpha: 0.35, w: 1 }));

  // binomial con su aproximación normal
  const binomial = {
    xr: [-0.5, 30.5], yr: [0, 0.42], h: 230,
    sliders: [{ k: "n", label: R`n`, min: 1, max: 30, step: 1, v: 12 }, { k: "p", label: R`p`, min: 0.02, max: 0.98, step: 0.01, v: 0.3 }],
    draw(g, p) {
      const n = Math.round(p.n), ks = Array.from({ length: n + 1 }, (_, k) => k), ys = ks.map(k => S.binpmf(k, n, p.p)), m = n * p.p, sd = Math.sqrt(n * p.p * (1 - p.p));
      g.grid(5, 0.1); g.axes();
      bars(g, ks, ys);
      if (sd > 0.05) g.fn(x => dnorm(x, m, sd), { c: "f", w: 2 });
      return `\\mu = np = ${nf(m)}\\qquad \\sigma = \\sqrt{np(1 - p)} = ${nf(sd)}\\qquad ${n * p.p >= 5 && n * (1 - p.p) >= 5 ? "np,\\ n(1 - p) \\ge 5:\\ \\text{la normal aproxima bien}" : "\\text{todavía asimétrica: la normal aproxima mal}"}`;
    }
  };

  // Poisson
  const poisson = {
    xr: [-0.5, 25.5], yr: [0, 0.4], h: 220,
    sliders: [{ k: "l", label: R`\lambda`, min: 0.3, max: 15, step: 0.1, v: 3 }],
    draw(g, p) {
      const ks = Array.from({ length: 26 }, (_, k) => k), ys = ks.map(k => S.poispmf(k, p.l));
      g.grid(5, 0.1); g.axes();
      bars(g, ks, ys, { c: "ok" });
      return `P(X = k) = \\frac{e^{-\\lambda}\\lambda^k}{k!}\\qquad E(X) = \\text{Var}(X) = \\lambda = ${nf(p.l, 1)}\\qquad P(X = 0) = ${nf(Math.exp(-p.l), 3)}`;
    }
  };

  // normal: área entre a y b
  const normal = {
    xr: [-4, 4], yr: [-0.02, 0.45], h: 220,
    sliders: [{ k: "a", label: R`z_1`, min: -3.5, max: 3.5, step: 0.05, v: -1 }, { k: "b", label: R`z_2`, min: -3.5, max: 3.5, step: 0.05, v: 1 }],
    draw(g, p) {
      const lo = Math.min(p.a, p.b), hi = Math.max(p.a, p.b), pts = [[lo, 0]];
      for (let i = 0; i <= 80; i++) { const x = lo + (hi - lo) * i / 80; pts.push([x, dnorm(x, 0, 1)]); } pts.push([hi, 0]);
      g.grid(1, 0.1); g.axes();
      if (hi > lo) g.poly(pts, { c: "p", fill: "p", alpha: 0.3, noStroke: true });
      g.fn(x => dnorm(x, 0, 1), { c: "p" });
      return `P(${nf(lo)} < Z < ${nf(hi)}) = \\Phi(${nf(hi)}) - \\Phi(${nf(lo)}) = ${nf(S.Phi(hi) - S.Phi(lo), 4)}`;
    }
  };

  // teorema central del límite: media de n exponenciales de media 1 (exacta: gamma) contra la normal
  const tcl = {
    xr: [0, 3], yr: [0, 2.6], h: 230,
    sliders: [{ k: "n", label: R`n`, min: 1, max: 40, step: 1, v: 3 }],
    draw(g, p) {
      const n = Math.round(p.n), dens = x => (x <= 0 ? 0 : Math.exp(n * Math.log(n) + (n - 1) * Math.log(x) - n * x - S.lgamma(n)));
      g.grid(0.5, 0.5); g.axes();
      g.fn(x => Math.exp(-x), { c: "line", dash: true, w: 1.5 });
      g.fn(dens, { c: "p", from: 0.001 }); g.fn(x => dnorm(x, 1, 1 / Math.sqrt(n)), { c: "f", w: 2 });
      return `\\bar X \\text{ de } n = ${n} \\text{ exponenciales}\\qquad \\sigma_{\\bar X} = \\frac{\\sigma}{\\sqrt n} = ${nf(1 / Math.sqrt(n), 3)}`;
    }
  };

  // intervalos de confianza: de 25 muestras, cuántos atrapan a μ
  const ic = {
    xr: [-2.2, 2.2], yr: [0, 26], h: 270,
    sliders: [{ k: "c", label: R`\text{confianza}`, min: 0.5, max: 0.99, step: 0.01, v: 0.95 }, { k: "n", label: R`n`, min: 5, max: 100, step: 1, v: 20 }, { k: "s", label: R`\text{otras muestras}`, min: 1, max: 30, step: 1, v: 1 }],
    draw(g, p) {
      const z = S.zq(1 - (1 - p.c) / 2), n = Math.round(p.n), u = rng(1000 + Math.round(p.s)), N = gauss(u);
      g.line(0, 0, 0, 26, { c: "ink", w: 2 });
      let ok = 0;
      for (let i = 0; i < 25; i++) {
        let s = 0; for (let j = 0; j < n; j++) s += N();
        const m = s / n, half = z / Math.sqrt(n), hit = Math.abs(m) <= half;
        ok += hit; g.line(m - half, i + 0.6, m + half, i + 0.6, { c: hit ? "p" : "bad", w: 3 }); g.dot(m, i + 0.6, { c: hit ? "p" : "bad", r: 3 });
      }
      return `\\bar x \\pm z\\frac{\\sigma}{\\sqrt n},\\ z = ${nf(z, 3)}\\qquad ${ok} \\text{ de } 25 \\text{ contienen a } \\mu\\ (\\text{se esperan } ${nf(25 * p.c, 1)})`;
    }
  };

  // prueba de hipótesis: α, β y potencia
  const hipotesis = {
    xr: [-3.5, 6.5], yr: [-0.02, 0.45], h: 230,
    sliders: [{ k: "d", label: R`\text{efecto real } \delta\sqrt n/\sigma`, min: 0, max: 5, step: 0.05, v: 2.5 }, { k: "al", label: R`\alpha`, min: 0.01, max: 0.2, step: 0.005, v: 0.05 }],
    draw(g, p) {
      const zc = S.zq(1 - p.al), d = p.d;
      const area = (f, a, b, c) => { const pts = [[a, 0]]; for (let i = 0; i <= 60; i++) { const x = a + (b - a) * i / 60; pts.push([x, f(x)]); } pts.push([b, 0]); g.poly(pts, { c, fill: c, alpha: 0.3, noStroke: true }); };
      g.grid(1, 0.1); g.axes();
      area(x => dnorm(x, d, 1), -3.5, zc, "gold"); area(x => dnorm(x, 0, 1), zc, 6.5, "bad");
      g.fn(x => dnorm(x, 0, 1), { c: "p" }); g.fn(x => dnorm(x, d, 1), { c: "ok" });
      g.line(zc, 0, zc, 0.45, { c: "ink", w: 2 });
      const beta = S.Phi(zc - d);
      return `\\text{rechazo si } z > ${nf(zc, 3)}\\qquad \\alpha = ${nf(p.al, 3)}\\ \\text{(roja)}\\qquad \\beta = ${nf(beta, 3)}\\ \\text{(dorada)}\\qquad \\text{potencia} = ${nf(1 - beta, 3)}`;
    }
  };

  // regresión: nube de puntos, recta de mínimos cuadrados y residuos
  const regresion = {
    xr: [-0.5, 10.5], yr: [-2, 12], h: 240,
    sliders: [{ k: "rho", label: R`\text{correlación de la población}`, min: -0.98, max: 0.98, step: 0.01, v: 0.8 }, { k: "s", label: R`\text{otra muestra}`, min: 1, max: 30, step: 1, v: 1 }],
    draw(g, p) {
      const u = rng(500 + Math.round(p.s)), N = gauss(u), pts = [];
      for (let i = 0; i < 25; i++) { const z1 = N(), z2 = N(), x = 5 + 2 * z1, y = 5 + 2.5 * (p.rho * z1 + Math.sqrt(1 - p.rho * p.rho) * z2); pts.push([x, y]); }
      const mx = pts.reduce((s, q) => s + q[0], 0) / 25, my = pts.reduce((s, q) => s + q[1], 0) / 25;
      const sxy = pts.reduce((s, q) => s + (q[0] - mx) * (q[1] - my), 0), sxx = pts.reduce((s, q) => s + (q[0] - mx) ** 2, 0), syy = pts.reduce((s, q) => s + (q[1] - my) ** 2, 0);
      const b = sxy / sxx, a = my - b * mx, r = sxy / Math.sqrt(sxx * syy);
      g.grid(1, 1); g.axes();
      for (const [x, y] of pts) g.line(x, y, x, a + b * x, { c: "line", w: 1.5 });
      g.fn(x => a + b * x, { c: "f", w: 2.5 });
      for (const [x, y] of pts) g.dot(x, y, { c: "p", r: 3.5 });
      return `\\hat y = ${nf(a)} ${b < 0 ? "-" : "+"} ${nf(Math.abs(b))}\\,x\\qquad r = ${nf(r, 3)}\\qquad r^2 = ${nf(r * r, 3)}`;
    }
  };

  // máxima verosimilitud: verosimilitud de p con k éxitos en n ensayos
  const verosimilitud = {
    xr: [0, 1], yr: [0, 1.1], h: 220,
    sliders: [{ k: "n", label: R`n`, min: 1, max: 50, step: 1, v: 10 }, { k: "k", label: R`k\ \text{(éxitos)}`, min: 0, max: 50, step: 1, v: 3 }, { k: "q", label: R`p`, min: 0.01, max: 0.99, step: 0.01, v: 0.5 }],
    draw(g, p) {
      const n = Math.round(p.n), k = Math.min(Math.round(p.k), n), ph = k / n;
      const logL = x => k * Math.log(x) + (n - k) * Math.log(1 - x), Lmax = k === 0 || k === n ? 0 : logL(ph), L = x => Math.exp(logL(x) - Lmax);
      g.grid(0.1, 0.25); g.axes();
      g.fn(L, { c: "p", from: 0.001, to: 0.999 });
      g.line(ph, 0, ph, 1, { c: "f", dash: true, w: 1.5 }); g.dot(p.q, L(p.q), { c: "ok" });
      return `L(p) \\propto p^{${k}}(1 - p)^{${n - k}}\\qquad \\hat p = \\frac kn = ${nf(ph, 3)}\\qquad \\frac{L(${nf(p.q)})}{L(\\hat p)} = ${nf(L(p.q), 3)}`;
    }
  };

  E.addFigures("m105", {
    "pe-binomial": [{ viz: binomial, caption: R`Barras: la probabilidad de cada valor. Naranja: la normal con la misma media y desvío. Con $np$ y $n(1 - p)$ grandes, las barras toman forma de campana.` }],
    "pe-poisson": [{ viz: poisson, caption: R`Distribución de Poisson: con $\lambda$ chico se amontona en $0$; al crecer $\lambda$ se corre, se ensancha (su varianza también es $\lambda$) y se parece a una normal.` }],
    "pe-normal": [{ viz: normal, caption: R`La probabilidad es el área bajo la curva normal estándar. Entre $-1$ y $1$ queda el $68\,\%$, entre $-2$ y $2$ el $95\,\%$, y entre $-3$ y $3$ casi todo.` }],
    "pe-tcl": [{ viz: tcl, caption: R`Punteada: una exponencial, muy asimétrica. Violeta: la distribución exacta del promedio de $n$ de ellas; naranja: la normal que predice el teorema central del límite. Con $n$ grande ya casi coinciden.` }],
    "pe-ic-media": [{ viz: ic, caption: R`Veinticinco muestras de una población normal con $\mu = 0$ y $\sigma = 1$, cada una con su intervalo. La confianza es el porcentaje de intervalos que, a la larga, atrapan a $\mu$; los rojos fallan. Más confianza, intervalos más anchos; más datos, más angostos.` }],
    "pe-hipotesis": [{ viz: hipotesis, caption: R`Violeta: el estadístico si $H_0$ es cierta; verde: si hay un efecto real. Rojo: $\alpha$, rechazar $H_0$ siendo cierta. Dorado: $\beta$, no rechazarla siendo falsa. Bajar $\alpha$ aumenta $\beta$; un efecto más grande (o más datos) sube la potencia.` }],
    "pe-regresion": [{ viz: regresion, caption: R`La recta de mínimos cuadrados (naranja) es la que hace mínima la suma de los cuadrados de los residuos (segmentos grises). Con correlación cercana a $\pm1$ los puntos se pegan a la recta.` }],
    "pe-max-verosimilitud": [{ viz: verosimilitud, caption: R`La verosimilitud mide qué tan probables hacen los datos a cada valor de $p$. Es máxima en $\hat p = \frac kn$ (punteada), y se vuelve más angosta con más datos: hay menos incertidumbre.` }]
  });
})();
