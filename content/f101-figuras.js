/* ===== F101 · Figuras interactivas de los apuntes =====
   Se agregan al final de «La idea» de cada ficha (E.addFigures). Las que tienen `play` se animan con el botón
   «Reproducir»; el deslizador del tiempo también se puede mover a mano. g = 9,8 m/s² en todas. */
(function () {
  const E = window.Efecen, R = String.raw, g0 = 9.8;
  const nf = (x, d = 2) => String(+x.toFixed(d)).replace(".", "{,}").replace(/^-0$/, "0");
  const rad = d => d * Math.PI / 180;
  // resorte en zigzag entre (xa, y) y (xb, y)
  const spring = (g, xa, xb, y, amp = 0.25, n = 10) => { const pts = [[xa, y]]; for (let i = 1; i < 2 * n; i++) pts.push([xa + (xb - xa) * i / (2 * n), y + (i % 2 ? amp : -amp)]); pts.push([xb, y]); g.curve(pts, { c: "muted", w: 2 }); };

  // tiro oblicuo: la trayectoria, la posición y las componentes de la velocidad
  const proyectil = {
    xr: [-3, 95], yr: [-3, 50], h: 240,
    sliders: [{ k: "v", label: R`v_0\ (\text{m/s})`, min: 5, max: 30, step: 0.5, v: 20 }, { k: "th", label: R`\theta\ (°)`, min: 10, max: 80, step: 1, v: 45 }, { k: "s", label: R`t / t_{\text{vuelo}}`, min: 0, max: 1, step: 0.01, v: 0.35 }],
    play: { k: "s", max: 1, speed: 0.35 },
    draw(g, p) {
      const th = rad(p.th), vx = p.v * Math.cos(th), vy = p.v * Math.sin(th), T = 2 * vy / g0, t = p.s * T;
      const x = vx * t, y = vy * t - g0 * t * t / 2, vyt = vy - g0 * t, sc = 1;
      g.grid(10, 10); g.axes();
      g.curve(Array.from({ length: 61 }, (_, i) => { const u = T * i / 60; return [vx * u, vy * u - g0 * u * u / 2]; }), { c: "muted", dash: true, w: 2 });
      g.arrow(x, y, x + vx * sc, y, { c: "ok", w: 2.5 }); g.arrow(x, y, x, y + vyt * sc, { c: "f", w: 2.5 }); g.arrow(x, y, x + vx * sc, y + vyt * sc, { c: "p", w: 2 });
      g.dot(x, y, { c: "p", r: 7 });
      return `t = ${nf(t)}\\ \\text{s}\\qquad \\text{alcance } \\frac{v_0^2\\sin 2\\theta}{g} \\approx ${nf(vx * T, 1)}\\ \\text{m}\\qquad h_{\\max} \\approx ${nf(vy * vy / (2 * g0), 1)}\\ \\text{m}`;
    }
  };

  // MRUV: x(t) es una parábola y v(t) una recta
  const mruv = {
    xr: [0, 6], yr: [-20, 40], h: 230,
    sliders: [{ k: "v0", label: R`v_0\ (\text{m/s})`, min: -5, max: 10, step: 0.5, v: 2 }, { k: "a", label: R`a\ (\text{m/s}^2)`, min: -3, max: 3, step: 0.1, v: 1.5 }, { k: "t", label: R`t\ (\text{s})`, min: 0, max: 6, step: 0.05, v: 2 }],
    play: { k: "t", max: 6, speed: 1.2 },
    draw(g, p) {
      const x = t => p.v0 * t + p.a * t * t / 2, v = t => p.v0 + p.a * t;
      g.grid(1, 10); g.axes();
      g.fn(x, { c: "p" }); g.fn(v, { c: "f", w: 2 });
      g.line(p.t, -20, p.t, 40, { c: "muted", dash: true, w: 1.5 });
      g.dot(p.t, x(p.t)); g.dot(p.t, v(p.t), { c: "f", r: 4 });
      return `x(t) = v_0t + \\tfrac12at^2 = ${nf(x(p.t))}\\ \\text{m}\\qquad v(t) = v_0 + at = ${nf(v(p.t))}\\ \\text{m/s}`;
    }
  };

  // movimiento circular uniforme: v tangente y a centrípeta
  const circular = {
    xr: [-4.2, 4.2], yr: [-4.2, 4.2], equal: true, h: 250,
    sliders: [{ k: "w", label: R`\omega\ (\text{rad/s})`, min: 0.3, max: 2, step: 0.05, v: 1 }, { k: "R", label: R`R\ (\text{m})`, min: 1, max: 3, step: 0.1, v: 2.5 }, { k: "t", label: R`t\ (\text{s})`, min: 0, max: 30, step: 0.05, v: 0.6 }],
    play: { k: "t", max: 30, speed: 1, loop: true },
    draw(g, p) {
      const th = p.w * p.t, x = p.R * Math.cos(th), y = p.R * Math.sin(th), v = p.w * p.R, ac = p.w * p.w * p.R, k = 0.5;
      g.circle(0, 0, p.R, { c: "muted", w: 1.5, dash: true }); g.dot(0, 0, { c: "muted", r: 3 });
      g.line(0, 0, x, y, { c: "muted", w: 1 });
      g.arrow(x, y, x - k * v * Math.sin(th), y + k * v * Math.cos(th), { c: "ok" });
      g.arrow(x, y, x - k * ac * Math.cos(th), y - k * ac * Math.sin(th), { c: "bad" });
      g.dot(x, y, { r: 7 });
      return `v = \\omega R = ${nf(v)}\\ \\text{m/s (verde)}\\qquad a_c = \\omega^2R = ${nf(ac)}\\ \\text{m/s}^2\\ \\text{(roja)}`;
    }
  };

  // plano inclinado con rozamiento: fuerzas y si el bloque desliza
  const plano = {
    xr: [-0.5, 6.5], yr: [-0.5, 4.5], equal: true, h: 240,
    sliders: [{ k: "th", label: R`\theta\ (°)`, min: 0, max: 60, step: 1, v: 30 }, { k: "mu", label: R`\mu`, min: 0, max: 1, step: 0.01, v: 0.4 }],
    draw(g, p) {
      const th = rad(p.th), L = 6, cs = Math.cos(th), sn = Math.sin(th), H = L * Math.tan(th) > 4 ? 4 : L * Math.tan(th), base = H / Math.tan(th || 1e-9);
      const Lb = Math.min(L, th ? base : L), m = 1, P = m * g0, N = P * cs, slides = Math.tan(th) > p.mu, fr = slides ? p.mu * N : P * sn, acc = slides ? g0 * (sn - p.mu * cs) : 0;
      g.poly([[0, 0], [Lb, 0], [0, Lb * Math.tan(th)]], { c: "muted", w: 2, fill: "line", alpha: 0.6 });
      // bloque en la mitad de la rampa (ejes paralelo y perpendicular)
      const s0 = 0.55 * Math.hypot(Lb, Lb * Math.tan(th)), cx = (Lb - s0 * cs), cy = s0 * sn, ux = [-cs, sn], nx = [sn, cs], hw = 0.45, hh = 0.35;
      const c = [cx + nx[0] * hh, cy + nx[1] * hh];
      g.poly([[cx - ux[0] * hw, cy - ux[1] * hw], [cx + ux[0] * hw, cy + ux[1] * hw], [cx + ux[0] * hw + nx[0] * 2 * hh, cy + ux[1] * hw + nx[1] * 2 * hh], [cx - ux[0] * hw + nx[0] * 2 * hh, cy - ux[1] * hw + nx[1] * 2 * hh]], { c: "p", fill: true, alpha: 0.35 });
      const k = 0.12;
      g.arrow(c[0], c[1], c[0], c[1] - k * P, { c: "ink" });
      g.arrow(c[0], c[1], c[0] + nx[0] * k * N, c[1] + nx[1] * k * N, { c: "ok" });
      if (fr > 1e-6) g.arrow(c[0], c[1], c[0] + ux[0] * k * fr, c[1] + ux[1] * k * fr, { c: "bad" });  // hacia arriba de la rampa
      return `${slides ? `\\text{desliza: } a = g(\\sin\\theta - \\mu\\cos\\theta) \\approx ${nf(acc)}\\ \\text{m/s}^2` : `\\text{no desliza: } \\tan\\theta = ${nf(Math.tan(th))} \\le \\mu`}\\qquad N = mg\\cos\\theta \\approx ${nf(N, 1)}\\ \\text{N (con } m = 1\\ \\text{kg)}`;
    }
  };

  // MAS: el fasor que gira y su proyección, con la masa en el resorte
  const mas = {
    xr: [-6.2, 4.2], yr: [-2.6, 2.6], equal: true, h: 220,
    sliders: [{ k: "A", label: R`A\ (\text{m})`, min: 0.3, max: 1.8, step: 0.05, v: 1.4 }, { k: "w", label: R`\omega\ (\text{rad/s})`, min: 0.5, max: 3, step: 0.05, v: 1.5 }, { k: "t", label: R`t\ (\text{s})`, min: 0, max: 40, step: 0.05, v: 0.4 }],
    play: { k: "t", max: 40, speed: 1, loop: true },
    draw(g, p) {
      const ph = p.w * p.t, x = p.A * Math.cos(ph), cx = -4.2, eq = 1.6;
      g.circle(cx, 0, p.A, { c: "muted", w: 1.5, dash: true });
      g.arrow(cx, 0, cx + x, p.A * Math.sin(ph), { c: "p" });
      g.line(cx + x, p.A * Math.sin(ph), cx + x, 0, { c: "muted", dash: true, w: 1.5 }); g.dot(cx + x, 0, { c: "f", r: 4 });
      g.line(-1.6, -1.2, -1.6, 1.2, { c: "ink", w: 3 }); g.line(-1.6, -0.6, 4.2, -0.6, { c: "line", w: 2 });
      spring(g, -1.6, eq + x - 0.35, 0);
      g.rect(eq + x - 0.35, -0.55, 0.7, 1.1, { c: "f", fill: true, alpha: 0.4 });
      g.line(eq, -0.9, eq, 0.9, { c: "muted", dash: true, w: 1 });
      return `x(t) = A\\cos(\\omega t) = ${nf(x)}\\ \\text{m}\\qquad T = \\frac{2\\pi}{\\omega} \\approx ${nf(2 * Math.PI / p.w)}\\ \\text{s}`;
    }
  };

  // péndulo simple (ángulos chicos) con las barras de energía cinética y potencial
  const pendulo = {
    xr: [-2.5, 3.5], yr: [-2.6, 0.4], equal: true, h: 230,
    sliders: [{ k: "L", label: R`L\ (\text{m})`, min: 0.5, max: 2.2, step: 0.05, v: 1.8 }, { k: "th0", label: R`\theta_0\ (°)`, min: 5, max: 40, step: 1, v: 25 }, { k: "t", label: R`t\ (\text{s})`, min: 0, max: 40, step: 0.02, v: 0.3 }],
    play: { k: "t", max: 40, speed: 1, loop: true },
    draw(g, p) {
      const w = Math.sqrt(g0 / p.L), th0 = rad(p.th0), th = th0 * Math.cos(w * p.t), bx = p.L * Math.sin(th), by = -p.L * Math.cos(th);
      const Etot = g0 * p.L * (1 - Math.cos(th0)), U = g0 * p.L * (1 - Math.cos(th)), K = Math.max(0, Etot - U), hmax = 2;
      g.line(-1, 0, 1, 0, { c: "ink", w: 3 });
      g.line(0, 0, bx, by, { c: "muted", w: 2 }); g.dot(bx, by, { c: "p", r: 9 });
      g.rect(2.3, -2.4, 0.35, hmax * K / Etot, { c: "ok", fill: true, alpha: 0.7 }); g.rect(2.8, -2.4, 0.35, hmax * U / Etot, { c: "f", fill: true, alpha: 0.7 });
      g.text("K", 2.475, -2.55, { c: "ok", size: 11 }); g.text("U", 2.975, -2.55, { c: "f", size: 11 });
      return `T = 2\\pi\\sqrt{L/g} \\approx ${nf(2 * Math.PI / w)}\\ \\text{s}\\qquad \\theta = ${nf(th * 180 / Math.PI, 1)}°\\qquad K + U = \\text{cte}`;
    }
  };

  // choque en una dimensión: m₁ con v₁ contra m₂ quieta, con coeficiente de restitución e
  const choque = {
    xr: [-6, 6], yr: [-1.2, 1.6], equal: true, h: 170,
    sliders: [{ k: "m1", label: R`m_1\ (\text{kg})`, min: 0.5, max: 3, step: 0.1, v: 1 }, { k: "m2", label: R`m_2\ (\text{kg})`, min: 0.5, max: 3, step: 0.1, v: 2 }, { k: "e", label: R`e`, min: 0, max: 1, step: 0.05, v: 1 }, { k: "t", label: R`t\ (\text{s})`, min: 0, max: 5, step: 0.02, v: 0 }],
    play: { k: "t", max: 5, speed: 1 },
    draw(g, p) {
      const v1 = 2, s1 = 0.4 * Math.sqrt(p.m1), s2 = 0.4 * Math.sqrt(p.m2), x1s = -4, x2 = 0, tc = (x2 - s2 - (x1s + s1)) / v1;
      const u1 = (p.m1 - p.e * p.m2) * v1 / (p.m1 + p.m2), u2 = (1 + p.e) * p.m1 * v1 / (p.m1 + p.m2);
      const t = p.t, after = t > tc, xa = after ? x1s + v1 * tc + u1 * (t - tc) : x1s + v1 * t, xb = after ? x2 + u2 * (t - tc) : x2;
      g.line(-6, -1, 6, -1, { c: "line", w: 2 });
      g.rect(xa - s1, -1, 2 * s1, 2 * s1, { c: "p", fill: true, alpha: 0.45 }); g.rect(xb - s2, -1, 2 * s2, 2 * s2, { c: "f", fill: true, alpha: 0.45 });
      const Ki = 0.5 * p.m1 * v1 * v1, Kf = 0.5 * p.m1 * u1 * u1 + 0.5 * p.m2 * u2 * u2;
      return `p = ${nf(p.m1 * v1)}\\ \\text{kg m/s (antes y después)}\\qquad v_1' = ${nf(u1)},\\ v_2' = ${nf(u2)}\\ \\text{m/s}\\qquad \\Delta K = ${nf(Kf - Ki)}\\ \\text{J}`;
    }
  };

  // oscilador amortiguado: subamortiguado, crítico y sobreamortiguado
  const amort = {
    xr: [0, 10], yr: [-1.1, 1.1], h: 220,
    sliders: [{ k: "b", label: R`\gamma\ (\text{s}^{-1})`, min: 0, max: 4, step: 0.05, v: 0.3 }],
    draw(g, p) {
      const w0 = 2, b = p.b;
      // x(0) = 1, v(0) = 0
      const x = b < w0 - 1e-6 ? (t => { const wd = Math.sqrt(w0 * w0 - b * b); return Math.exp(-b * t) * (Math.cos(wd * t) + b / wd * Math.sin(wd * t)); })
        : b > w0 + 1e-6 ? (t => { const q = Math.sqrt(b * b - w0 * w0), r1 = -b + q, r2 = -b - q, c1 = -r2 / (r1 - r2), c2 = r1 / (r1 - r2); return c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t); })
          : (t => (1 + w0 * t) * Math.exp(-w0 * t));
      g.grid(1, 0.5); g.axes();
      if (b > 0 && b < w0) { g.fn(t => Math.exp(-b * t), { c: "muted", dash: true, w: 1.5 }); g.fn(t => -Math.exp(-b * t), { c: "muted", dash: true, w: 1.5 }); }
      g.fn(x, { c: "p" });
      const reg = b < w0 - 1e-6 ? "subamortiguado: oscila" : b > w0 + 1e-6 ? "sobreamortiguado: vuelve lento, sin oscilar" : "crítico: vuelve lo más rápido posible sin oscilar";
      return `\\gamma = ${nf(b)},\\ \\omega_0 = 2\\ \\text{s}^{-1}\\qquad \\text{${reg}}`;
    }
  };

  E.addFigures("f101", {
    "f1-proyectiles": [{ viz: proyectil, caption: R`Verde: $v_x$, constante. Naranja: $v_y$, que baja $9{,}8$ m/s por segundo. Probá dos ángulos complementarios: el alcance es el mismo.` }],
    "f1-mruv": [{ viz: mruv, caption: R`Violeta: $x(t)$, una parábola. Naranja: $v(t)$, una recta de pendiente $a$. Donde $v = 0$, $x(t)$ tiene su vértice.` }],
    "f1-circular": [{ viz: circular, caption: R`La velocidad (verde) es tangente; la aceleración centrípeta (roja) apunta al centro y crece como $\omega^2$.` }],
    "f1-rozamiento": [{ viz: plano, caption: R`Negra: el peso; verde: la normal; roja: el rozamiento. El bloque empieza a deslizar cuando $\tan\theta$ supera a $\mu$ (con $g = 9{,}8$ m/s²).` }],
    "f1-mas": [{ viz: mas, caption: R`La masa se mueve como la sombra de un vector que gira con velocidad angular $\omega$: eso es un movimiento armónico simple.` }],
    "f1-pendulos": [{ viz: pendulo, caption: R`El período depende de $L$ pero no del ángulo inicial (si es chico). La energía pasa de potencial (naranja) a cinética (verde) y vuelve.` }],
    "f1-choques": [{ viz: choque, caption: R`Con $e = 1$ el choque es elástico y no se pierde energía; con $e = 0$ los bloques quedan juntos. La cantidad de movimiento se conserva siempre.` }],
    "f1-amortiguadas": [{ viz: amort, caption: R`Con poco rozamiento oscila dentro de la envolvente $e^{-\gamma t}$; con $\gamma = \omega_0$ (amortiguamiento crítico) vuelve lo más rápido posible.` }]
  });
})();
