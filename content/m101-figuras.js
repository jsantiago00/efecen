/* ===== M101 · Figuras interactivas de los apuntes =====
   Cada figura se agrega al final de «La idea» de su ficha (E.addFigures). draw(g, p) dibuja con el lápiz `g`
   en coordenadas del mundo y devuelve una línea en TeX que se muestra debajo de la figura. */
(function () {
  const E = window.Efecen, R = String.raw;
  const nf = (x, d = 3) => String(+x.toFixed(d)).replace(".", "{,}").replace(/^-0$/, "0");
  const D = (f, x) => (f(x + 1e-5) - f(x - 1e-5)) / 2e-5;

  // derivada: la secante por (a, f(a)) y (a + h, f(a + h)) tiende a la tangente
  const fd = x => 0.25 * x ** 3 - x + 1;
  const derivada = {
    xr: [-3, 3], yr: [-2, 4], h: 230,
    sliders: [{ k: "a", label: "a", min: -2.5, max: 2, step: 0.05, v: -1.5 }, { k: "h", label: "h", min: 0.02, max: 2.5, step: 0.02, v: 1.8 }],
    draw(g, p) {
      const a = p.a, b = p.a + p.h, m = (fd(b) - fd(a)) / p.h, t = D(fd, a);
      g.grid(); g.axes();
      g.fn(fd, { c: "p" });
      g.fn(x => fd(a) + t * (x - a), { c: "ok", dash: true, w: 2 });
      g.fn(x => fd(a) + m * (x - a), { c: "f", w: 2.5 });
      g.line(b, fd(a), b, fd(b), { c: "muted", w: 1.5, dash: true }); g.line(a, fd(a), b, fd(a), { c: "muted", w: 1.5, dash: true });
      g.dot(a, fd(a)); g.dot(b, fd(b), { c: "f" });
      return `\\text{secante: } \\frac{f(a + h) - f(a)}{h} \\approx ${nf(m)}\\qquad \\text{tangente: } f'(a) = ${nf(t)}`;
    }
  };

  // sumas de Riemann con n rectángulos (izquierda, punto medio o derecha)
  const fr = x => 1 + Math.sin(x) + x / 3, ra = 0, rb = 4;
  const exact = (() => { let s = 0; const n = 2000, h = (rb - ra) / n; for (let i = 0; i <= n; i++) s += fr(ra + i * h) * (i === 0 || i === n ? 1 : i % 2 ? 4 : 2); return s * h / 3; })();
  const riemann = {
    xr: [-0.4, 4.4], yr: [-0.4, 3.4], h: 230,
    sliders: [{ k: "n", label: "n", min: 1, max: 40, step: 1, v: 4 }, { k: "m", label: R`\text{regla}`, min: 0, max: 2, step: 1, v: 0 }],
    draw(g, p) {
      const n = Math.round(p.n), m = Math.round(p.m), w = (rb - ra) / n, off = [0, 0.5, 1][m];
      let s = 0;
      for (let i = 0; i < n; i++) { const x = ra + i * w, y = fr(x + off * w); s += y * w; g.rect(x, 0, w, y, { c: "p", w: 1, fill: true, alpha: 0.22 }); }
      g.axes(); g.fn(fr, { c: "f" });
      return `\\text{${["izquierda", "punto medio", "derecha"][m]}, } n = ${n}:\\ \\ S_n \\approx ${nf(s, 4)}\\qquad \\int_0^4 f \\approx ${nf(exact, 4)}`;
    }
  };

  // transformaciones: y = a·f(x − h) + k a partir de la parábola
  const transf = {
    xr: [-5, 5], yr: [-5, 5], h: 230,
    sliders: [{ k: "a", label: "a", min: -2, max: 2, step: 0.1, v: 1 }, { k: "h", label: "h", min: -3, max: 3, step: 0.1, v: 0 }, { k: "k", label: "k", min: -3, max: 3, step: 0.1, v: 0 }],
    draw(g, p) {
      g.grid(); g.axes();
      g.fn(x => x * x, { c: "muted", dash: true, w: 2 });
      g.fn(x => p.a * (x - p.h) ** 2 + p.k, { c: "p" });
      g.dot(p.h, p.k, { c: "f" });
      return `y = ${nf(p.a, 1)}\\,(x ${p.h < 0 ? "+" : "-"} ${nf(Math.abs(p.h), 1)})^2 ${p.k < 0 ? "-" : "+"} ${nf(Math.abs(p.k), 1)}\\qquad \\text{vértice } (${nf(p.h, 1)};\\ ${nf(p.k, 1)})`;
    }
  };

  // teorema del valor medio: hay un c con tangente paralela a la secante
  const fv = x => x ** 3 / 6 - x + 2, fvp = x => x * x / 2 - 1, va = -2;
  const valorMedio = {
    xr: [-2.5, 3.5], yr: [-0.5, 4.5], h: 230,
    sliders: [{ k: "b", label: "b", min: -1, max: 3.2, step: 0.05, v: 2.5 }],
    draw(g, p) {
      const b = p.b, m = (fv(b) - fv(va)) / (b - va), cs = [Math.sqrt(2 * (m + 1)), -Math.sqrt(2 * (m + 1))].filter(c => c > va && c < b);
      g.grid(); g.axes();
      g.fn(fv, { c: "p" });
      g.line(va, fv(va), b, fv(b), { c: "f" });
      for (const c of cs) { g.fn(x => fv(c) + fvp(c) * (x - c), { c: "ok", dash: true, w: 2, from: c - 1.2, to: c + 1.2 }); g.dot(c, fv(c), { c: "ok" }); }
      g.dot(va, fv(va), { c: "f" }); g.dot(b, fv(b), { c: "f" });
      return `\\frac{f(b) - f(a)}{b - a} \\approx ${nf(m)}\\qquad ${cs.map(c => `f'(${nf(c, 2)}) \\approx ${nf(fvp(c))}`).join(",\\ ")}`;
    }
  };

  // función inversa: el punto (x, f(x)) se refleja en la recta y = x
  const fi = x => x ** 3 / 8 + x / 2;
  const finv = y => { let lo = -10, hi = 10; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (fi(m) < y) lo = m; else hi = m; } return (lo + hi) / 2; };
  const inversa = {
    xr: [-4, 4], yr: [-4, 4], equal: true, h: 250,
    sliders: [{ k: "x", label: "x_0", min: -3, max: 3, step: 0.05, v: 1.5 }],
    draw(g, p) {
      const y = fi(p.x);
      g.grid(); g.axes();
      g.line(-4, -4, 4, 4, { c: "muted", dash: true, w: 1.5 });
      g.fn(fi, { c: "p" }); g.fn(finv, { c: "f" });
      g.line(p.x, y, y, p.x, { c: "muted", dash: true, w: 1.5 });
      g.dot(p.x, y); g.dot(y, p.x, { c: "f" });
      return `(${nf(p.x, 2)};\\ ${nf(y, 2)}) \\in f\\quad\\Longleftrightarrow\\quad (${nf(y, 2)};\\ ${nf(p.x, 2)}) \\in f^{-1}`;
    }
  };

  // límite: para cada ε hay un δ (con f(x) = x²/2 + 1, a = 1, L = 3/2)
  const fl = x => x * x / 2 + 1, la = 1, LL = 1.5;
  const limite = {
    xr: [-0.5, 2.6], yr: [0, 3.5], h: 230,
    sliders: [{ k: "e", label: R`\varepsilon`, min: 0.05, max: 1.2, step: 0.01, v: 0.6 }],
    draw(g, p) {
      const e = p.e, right = Math.sqrt(2 * (LL + e - 1)) - la, left = la - Math.sqrt(Math.max(0, 2 * (LL - e - 1))), d = Math.min(right, left);
      g.rect(-0.5, LL - e, 3.1, 2 * e, { c: "ok", fill: true, alpha: 0.18, noStroke: true });
      g.rect(la - d, 0, 2 * d, 3.5, { c: "f", fill: true, alpha: 0.18, noStroke: true });
      g.axes();
      g.fn(fl, { c: "p" });
      g.line(-0.5, LL, la, LL, { c: "muted", dash: true, w: 1.5 }); g.line(la, 0, la, LL, { c: "muted", dash: true, w: 1.5 });
      g.dot(la, LL);
      return `\\varepsilon = ${nf(e, 2)}\\ \\Rightarrow\\ \\delta \\approx ${nf(d)}:\\ \\ |x - 1| < \\delta \\text{ asegura } |f(x) - \\tfrac32| < \\varepsilon`;
    }
  };

  // series geométricas: las sumas parciales se acercan a 1/(1 − r)
  const series = {
    xr: [-1, 31], yr: [-1, 10.5], h: 220,
    sliders: [{ k: "r", label: "r", min: -0.9, max: 0.9, step: 0.01, v: 0.5 }, { k: "n", label: "n", min: 1, max: 30, step: 1, v: 8 }],
    draw(g, p) {
      const r = p.r, n = Math.round(p.n), S = 1 / (1 - r);
      g.grid(5, 1); g.axes();
      g.line(-1, S, 31, S, { c: "ok", dash: true, w: 2 });
      let s = 0;
      for (let k = 0; k < n; k++) { s += r ** k; g.dot(k + 1, s, { r: 3.5, c: k === n - 1 ? "f" : "p" }); }
      return `S_{${n}} = \\sum_{k=0}^{${n - 1}} (${nf(r, 2)})^k \\approx ${nf(s, 4)}\\qquad \\frac{1}{1 - r} \\approx ${nf(S, 4)}`;
    }
  };

  // el signo de f′ dice si f crece o decrece
  const fg = x => x ** 3 / 3 - x, fgp = x => x * x - 1;
  const graficoDerivada = {
    xr: [-2.6, 2.6], yr: [-2.5, 3], h: 240,
    sliders: [{ k: "x", label: "x", min: -2.3, max: 2.3, step: 0.02, v: -1.6 }],
    draw(g, p) {
      const x = p.x, s = fgp(x);
      g.grid(); g.axes();
      g.fn(fg, { c: "p" }); g.fn(fgp, { c: "f", w: 2 });
      g.fn(t => fg(x) + s * (t - x), { c: s >= 0 ? "ok" : "bad", w: 2, from: x - 0.8, to: x + 0.8 });
      g.line(x, fgp(x), x, fg(x), { c: "muted", dash: true, w: 1.5 });
      g.dot(x, fg(x), { c: s >= 0 ? "ok" : "bad" }); g.dot(x, fgp(x), { c: "f", r: 4 });
      return `f'(${nf(x, 2)}) \\approx ${nf(s, 2)}:\\ f \\text{ ${Math.abs(s) < 0.03 ? "tiene tangente horizontal" : s > 0 ? "crece" : "decrece"}}`;
    }
  };

  E.addFigures("m101", {
    "derivada": [{ viz: derivada, caption: R`Achicá $h$: la secante (naranja) se pega a la tangente (verde), y su pendiente tiende a $f'(a)$.` }],
    "integral-definida": [{ viz: riemann, caption: R`Con más rectángulos, las tres reglas (0 izquierda, 1 punto medio, 2 derecha) se acercan a la integral.` }],
    "transformaciones": [{ viz: transf, caption: R`$h$ corre el gráfico en horizontal, $k$ en vertical y $a$ lo estira (o lo da vuelta si es negativo).` }],
    "valor-medio": [{ viz: valorMedio, caption: R`Movés $b$: siempre hay al menos un punto $c$ (verde) donde la tangente es paralela a la secante.` }],
    "funcion-inversa": [{ viz: inversa, caption: R`El gráfico de $f^{-1}$ (naranja) es el reflejo del de $f$ (violeta) respecto de $y = x$.` }],
    "limite": [{ viz: limite, caption: R`Por más angosta que sea la banda verde ($\varepsilon$), hay una banda naranja ($\delta$) alrededor de $a$ cuyo gráfico queda adentro.` }],
    "series": [{ viz: series, caption: R`Con $|r| < 1$, las sumas parciales se acercan a $\frac{1}{1 - r}$; con $r$ negativo, lo hacen saltando de un lado al otro.` }],
    "grafico-derivada": [{ viz: graficoDerivada, caption: R`Violeta: $f$; naranja: $f'$. Donde $f'$ es positiva la tangente sube, y donde se anula, $f$ tiene un extremo.` }]
  });
})();
