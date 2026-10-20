/* ===== F102A · Figuras interactivas de los apuntes =====
   Se agregan al final de «La idea» de cada ficha (E.addFigures). Las que tienen `play` se animan con el botón
   «Reproducir»; el deslizador del tiempo también se puede mover a mano. Las unidades de las figuras son arbitrarias
   salvo que se diga otra cosa. */
(function () {
  const E = window.Efecen, R = String.raw;
  const nf = (x, d = 2) => String(+x.toFixed(d)).replace(".", "{,}").replace(/^-0$/, "0");
  // campo y potencial de cargas puntuales [[q, x, y], …] (con k = 1)
  const field = (Q, x, y) => Q.reduce((s, [q, a, b]) => { const dx = x - a, dy = y - b, r3 = Math.hypot(dx, dy) ** 3 || 1e-12; return [s[0] + q * dx / r3, s[1] + q * dy / r3]; }, [0, 0]);
  const pot = (Q, x, y) => Q.reduce((s, [q, a, b]) => s + q / (Math.hypot(x - a, y - b) || 1e-6), 0);
  const charges = (g, Q) => Q.forEach(([q, a, b]) => { if (!q) return; g.dot(a, b, { c: q > 0 ? "bad" : "p", r: 7 + 2 * Math.min(3, Math.abs(q)) }); g.text(q > 0 ? "+" : "−", a, b, { c: "card", size: 13 }); });

  // líneas de campo de dos cargas
  const lineas = {
    xr: [-5, 5], yr: [-3.2, 3.2], equal: true, h: 250,
    sliders: [{ k: "q1", label: R`q_1`, min: -3, max: 3, step: 1, v: 2 }, { k: "q2", label: R`q_2`, min: -3, max: 3, step: 1, v: -1 }, { k: "d", label: R`d`, min: 1, max: 6, step: 0.1, v: 3 }],
    draw(g, p) {
      const Q = [[p.q1, -p.d / 2, 0], [p.q2, p.d / 2, 0]].filter(c => c[0] !== 0);
      g.grid(1, 1);
      if (Q.length) {
        // las líneas salen de las cargas positivas (o, si no hay, entran a las negativas), en número proporcional a |q|
        const src = Q.some(c => c[0] > 0) ? Q.filter(c => c[0] > 0) : Q, dir = Q.some(c => c[0] > 0) ? 1 : -1;
        for (const [q, a, b] of src) {
          const n = 8 * Math.abs(q);
          for (let i = 0; i < n; i++) {
            const an = 2 * Math.PI * (i + 0.5) / n; let x = a + 0.15 * Math.cos(an), y = b + 0.15 * Math.sin(an); const pts = [[x, y]];
            for (let s = 0; s < 500; s++) {
              const [ex, ey] = field(Q, x, y), m = Math.hypot(ex, ey); if (!(m > 0)) break;
              x += dir * 0.04 * ex / m; y += dir * 0.04 * ey / m; pts.push([x, y]);
              if (Math.abs(x) > 6 || Math.abs(y) > 4.5 || Q.some(([, c, e]) => Math.hypot(x - c, y - e) < 0.12)) break;
            }
            g.curve(pts, { c: "muted", w: 1.5 });
            const k = Math.min(pts.length - 1, 25); if (k > 2) g.arrow(pts[k - 2][0], pts[k - 2][1], pts[k][0], pts[k][1], { c: "muted", w: 1.5 });
          }
        }
      }
      charges(g, Q);
      const tot = p.q1 + p.q2;
      return `q_1 + q_2 = ${tot}\\qquad \\text{${tot === 0 ? "lejos, el campo es el de un dipolo" : "lejos, parece una carga " + (tot > 0 ? "positiva" : "negativa") + " de " + Math.abs(tot)}}`;
    }
  };

  // curvas equipotenciales (marching squares sobre una grilla)
  const equipot = {
    xr: [-5, 5], yr: [-3.2, 3.2], equal: true, h: 250,
    sliders: [{ k: "q1", label: R`q_1`, min: -3, max: 3, step: 1, v: 1 }, { k: "q2", label: R`q_2`, min: -3, max: 3, step: 1, v: -1 }, { k: "d", label: R`d`, min: 1, max: 6, step: 0.1, v: 3 }],
    draw(g, p) {
      const Q = [[p.q1, -p.d / 2, 0], [p.q2, p.d / 2, 0]].filter(c => c[0] !== 0);
      const [x0, x1] = g.xr, [y0, y1] = g.yr, nx = 70, ny = 46, hx = (x1 - x0) / nx, hy = (y1 - y0) / ny;
      const V = []; for (let i = 0; i <= nx; i++) { V.push([]); for (let j = 0; j <= ny; j++) V[i].push(pot(Q, x0 + i * hx, y0 + j * hy)); }
      // niveles geométricos a cada lado; el cero se corre apenas para no caer justo sobre los nodos de la grilla
      const lv = [0.15, 0.25, 0.4, 0.6, 1, 1.6, 2.5], levels = [...lv.map(v => -v), 1e-9, ...lv];
      for (const L of levels) {
        for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
          const c = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([a, b]) => [x0 + (i + a) * hx, y0 + (j + b) * hy, V[i + a][j + b]]), cut = [];
          for (let e = 0; e < 4; e++) { const A = c[e], B = c[(e + 1) % 4]; if ((A[2] - L) * (B[2] - L) < 0) { const t = (L - A[2]) / (B[2] - A[2]); cut.push([A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])]); } }
          if (cut.length >= 2) g.line(cut[0][0], cut[0][1], cut[1][0], cut[1][1], { c: L > 1e-6 ? "bad" : L < 0 ? "p" : "ink", w: L < 1e-6 && L > 0 ? 2 : 1.5 });
          if (cut.length === 4) g.line(cut[2][0], cut[2][1], cut[3][0], cut[3][1], { c: L > 1e-6 ? "bad" : L < 0 ? "p" : "ink", w: L < 1e-6 && L > 0 ? 2 : 1.5 });
        }
      }
      charges(g, Q);
      return `V = \\frac{q_1}{r_1} + \\frac{q_2}{r_2}\\qquad \\text{rojas: } V > 0,\\ \\text{violetas: } V < 0,\\ \\text{negra: } V = 0`;
    }
  };

  // carga en un campo magnético (B saliendo de la pantalla)
  const ciclo = {
    xr: [-6.5, 6.5], yr: [-6.5, 6.5], equal: true, h: 260,
    sliders: [{ k: "v", label: R`v`, min: 0.5, max: 3, step: 0.1, v: 2 }, { k: "B", label: R`B`, min: 0.5, max: 3, step: 0.1, v: 1 }, { k: "q", label: R`\text{signo de } q`, min: -1, max: 1, step: 2, v: 1 }, { k: "t", label: R`t`, min: 0, max: 40, step: 0.05, v: 1 }],
    play: { k: "t", max: 40, speed: 1, loop: true },
    draw(g, p) {
      // m = 1 y |q| = 1: gira alrededor del origen; arranca en (0, ±r) con v según +x (con q > 0, en sentido horario)
      const sq = p.q > 0 ? 1 : -1, r = p.v / p.B, wt = p.B * p.t, cy = 0;
      const x = r * Math.sin(wt), y = sq * r * Math.cos(wt), vx = p.v * Math.cos(wt), vy = -sq * p.v * Math.sin(wt);
      for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) g.circle(i, j, 0.08, { c: "line", w: 1.5 });
      g.circle(0, cy, r, { c: "muted", dash: true, w: 1.5 });
      const Fx = sq * vy * p.B, Fy = -sq * vx * p.B, Fm = Math.hypot(Fx, Fy) || 1, k = 0.9;
      g.arrow(x, y, x + k * vx, y + k * vy, { c: "ok" }); g.arrow(x, y, x + 1.2 * Fx / Fm, y + 1.2 * Fy / Fm, { c: "bad" });
      g.dot(x, y, { c: p.q > 0 ? "bad" : "p", r: 7 });
      return `r = \\frac{mv}{|q|B} = ${nf(r)}\\qquad T = \\frac{2\\pi m}{|q|B} = ${nf(2 * Math.PI / p.B)}\\qquad \\text{gira ${p.q > 0 ? "en sentido horario" : "en sentido antihorario"}}`;
    }
  };

  // carga y descarga de un capacitor
  const rc = {
    xr: [0, 10], yr: [-0.15, 1.15], h: 230,
    sliders: [{ k: "tau", label: R`\tau = RC`, min: 0.3, max: 4, step: 0.05, v: 1.5 }, { k: "t", label: R`t`, min: 0, max: 10, step: 0.05, v: 1.5 }],
    play: { k: "t", max: 10, speed: 1.5 },
    draw(g, p) {
      const q = t => 1 - Math.exp(-t / p.tau), i = t => Math.exp(-t / p.tau);
      g.grid(1, 0.25); g.axes();
      g.line(0, 1, 10, 1, { c: "muted", dash: true, w: 1 }); g.line(p.tau, -0.15, p.tau, 1.15, { c: "gold", dash: true, w: 1.5 });
      g.fn(q, { c: "p" }); g.fn(i, { c: "f", w: 2 });
      g.dot(p.t, q(p.t)); g.dot(p.t, i(p.t), { c: "f", r: 4 });
      return `\\frac{q}{C\\varepsilon} = 1 - e^{-t/\\tau} = ${nf(q(p.t))}\\qquad \\frac{I}{\\varepsilon/R} = e^{-t/\\tau} = ${nf(i(p.t))}`;
    }
  };

  // barra sobre rieles: el área crece, el flujo crece, aparece la fem
  const barra = {
    xr: [-0.5, 10.5], yr: [-1, 4.5], equal: true, h: 230,
    sliders: [{ k: "v", label: R`v`, min: 0.5, max: 3, step: 0.1, v: 1.5 }, { k: "B", label: R`B`, min: 0.2, max: 2, step: 0.1, v: 1 }, { k: "t", label: R`t`, min: 0, max: 5, step: 0.02, v: 1.5 }],
    play: { k: "t", max: 5, speed: 1, loop: true },
    draw(g, p) {
      const L = 3, x = 1 + (p.v * p.t) % 9;
      for (let i = 0; i <= 10; i++) for (let j = 0; j <= 4; j++) { g.line(i - 0.1, j - 0.1, i + 0.1, j + 0.1, { c: "line", w: 1.5 }); g.line(i - 0.1, j + 0.1, i + 0.1, j - 0.1, { c: "line", w: 1.5 }); }
      g.rect(0, 0, x, L, { c: "p", fill: "p", alpha: 0.12, noStroke: true });
      g.line(0, 0, 10.3, 0, { c: "ink", w: 3 }); g.line(0, L, 10.3, L, { c: "ink", w: 3 }); g.line(0, 0, 0, L, { c: "gold", w: 4 });
      g.line(x, -0.2, x, L + 0.2, { c: "f", w: 5 }); g.arrow(x, L / 2, x + 1.2, L / 2, { c: "ok" });
      // corriente inducida (Lenz): con B entrando y el área creciendo, circula en sentido antihorario visto desde el frente
      g.arrow(x, 0.6, x, L - 0.6, { c: "bad", w: 2 });
      return `\\Phi = BLx = ${nf(p.B * L * x)}\\qquad \\varepsilon = BLv = ${nf(p.B * L * p.v)}\\qquad \\text{la fuerza sobre la barra la frena}`;
    }
  };

  // generador: flujo y fem de una bobina que gira
  const generador = {
    xr: [0, 12.6], yr: [-1.3, 1.3], h: 220,
    sliders: [{ k: "w", label: R`\omega`, min: 0.5, max: 3, step: 0.05, v: 1 }, { k: "t", label: R`t`, min: 0, max: 12.6, step: 0.02, v: 2 }],
    play: { k: "t", max: 12.6, speed: 1.2, loop: true },
    draw(g, p) {
      const sc = 1 / 3, ph = t => Math.cos(p.w * t), em = t => p.w * sc * Math.sin(p.w * t);
      g.grid(Math.PI / 2, 0.5); g.axes();
      g.fn(ph, { c: "p" }); g.fn(em, { c: "f", w: 2 });
      g.line(p.t, -1.3, p.t, 1.3, { c: "muted", dash: true, w: 1 }); g.dot(p.t, ph(p.t)); g.dot(p.t, em(p.t), { c: "f", r: 4 });
      return `\\frac{\\Phi}{NBA} = \\cos\\omega t = ${nf(ph(p.t))}\\qquad \\frac{\\varepsilon}{NBA} = \\omega\\sin\\omega t = ${nf(p.w * Math.sin(p.w * p.t))}`;
    }
  };

  // fasores del RLC serie
  const fasores = {
    xr: [-3.2, 3.2], yr: [-3.2, 3.2], equal: true, h: 260,
    sliders: [{ k: "R", label: R`R`, min: 0.2, max: 2.5, step: 0.05, v: 1.5 }, { k: "XL", label: R`X_L`, min: 0, max: 3, step: 0.05, v: 2.5 }, { k: "XC", label: R`X_C`, min: 0, max: 3, step: 0.05, v: 1 }, { k: "t", label: R`\omega t`, min: 0, max: 6.28, step: 0.02, v: 0.5 }],
    play: { k: "t", max: 6.28, speed: 1, loop: true },
    draw(g, p) {
      // corriente de amplitud 1 con fase ωt; V_R en fase, V_L adelantada 90°, V_C atrasada 90°
      const a = p.t, u = [Math.cos(a), Math.sin(a)], n = [-Math.sin(a), Math.cos(a)], s = 0.9;
      const VR = u.map(c => c * p.R * s), VL = n.map(c => c * p.XL * s), VC = n.map(c => -c * p.XC * s), V = [VR[0] + VL[0] + VC[0], VR[1] + VL[1] + VC[1]];
      g.grid(1, 1); g.axes(); g.circle(0, 0, 1, { c: "line", w: 1 });
      g.arrow(0, 0, u[0], u[1], { c: "muted", w: 2 });
      g.arrow(0, 0, VR[0], VR[1], { c: "ok" }); g.arrow(VR[0], VR[1], VR[0] + VL[0], VR[1] + VL[1], { c: "f" }); g.arrow(VR[0] + VL[0], VR[1] + VL[1], V[0], V[1], { c: "gold" });
      g.arrow(0, 0, V[0], V[1], { c: "p", w: 3 });
      g.line(V[0], V[1], 3.1, V[1], { c: "p", dash: true, w: 1 });
      const Z = Math.hypot(p.R, p.XL - p.XC), phi = Math.atan2(p.XL - p.XC, p.R) * 180 / Math.PI;
      return `Z = \\sqrt{R^2 + (X_L - X_C)^2} = ${nf(Z)}\\qquad \\phi = ${nf(phi, 1)}°\\ \\text{(${phi > 0.5 ? "inductivo" : phi < -0.5 ? "capacitivo" : "resonancia"})}`;
    }
  };

  // curva de resonancia
  const resonancia = {
    xr: [0, 3], yr: [-0.05, 1.15], h: 230,
    sliders: [{ k: "Q", label: R`Q`, min: 0.5, max: 10, step: 0.1, v: 3 }, { k: "w", label: R`\omega/\omega_0`, min: 0.05, max: 3, step: 0.01, v: 1.3 }],
    draw(g, p) {
      const I = x => 1 / Math.sqrt(1 + p.Q * p.Q * (x - 1 / x) ** 2);
      g.grid(0.5, 0.25); g.axes();
      g.line(0, Math.SQRT1_2, 3, Math.SQRT1_2, { c: "muted", dash: true, w: 1 });
      g.fn(I, { c: "p", from: 0.02 });
      g.dot(p.w, I(p.w), { c: "f" });
      return `\\frac{I}{I_{\\max}} = ${nf(I(p.w))}\\qquad \\text{ancho a media potencia: } \\frac{\\Delta\\omega}{\\omega_0} = \\frac1Q = ${nf(1 / p.Q)}`;
    }
  };

  E.addFigures("f102a", {
    "f2a-campo-electrico": [{ viz: lineas, caption: R`Las líneas salen de las cargas positivas (rojas) y entran en las negativas (violetas), en número proporcional a la carga. Con cargas iguales y opuestas aparece el dipolo.` }],
    "f2a-equipotenciales": [{ viz: equipot, caption: R`Curvas de potencial constante de dos cargas (con $k = 1$). Cerca de cada carga son casi circunferencias, y donde están más juntas el campo es más intenso.` }],
    "f2a-movimiento-carga": [{ viz: ciclo, caption: R`El campo sale de la pantalla. La fuerza (roja) es siempre perpendicular a la velocidad (verde): la carga gira sin cambiar su rapidez. Más rápida, círculo más grande, mismo período.` }],
    "f2a-rc": [{ viz: rc, caption: R`Violeta: la carga, que tiende a $C\varepsilon$. Naranja: la corriente, que decae. La línea dorada marca $t = \tau$, cuando la carga llega al $63\,\%$.` }],
    "f2a-fem-movimiento": [{ viz: barra, caption: R`El campo entra en la pantalla. La barra (naranja) avanza, el área encerrada crece y con ella el flujo: aparece la fem $BLv$ y una corriente (roja) cuya fuerza frena la barra.` }],
    "f2a-faraday": [{ viz: generador, caption: R`Bobina que gira: violeta, el flujo; naranja, la fem (dibujada a un tercio de su escala). La fem es máxima cuando el flujo pasa por cero, porque es su ritmo de cambio.` }],
    "f2a-rlc": [{ viz: fasores, caption: R`Gris: la corriente. Verde: $V_R$, en fase; naranja: $V_L$, adelantada $90°$; dorada: $V_C$, atrasada $90°$. Su suma (violeta) es la tensión de la fuente, y su sombra horizontal, el valor instantáneo.` }],
    "f2a-resonancia": [{ viz: resonancia, caption: R`Corriente en función de la frecuencia, relativa al máximo. Con $Q$ grande el pico es angosto; la línea punteada marca la media potencia ($I = I_{\max}/\sqrt2$).` }]
  });
})();
