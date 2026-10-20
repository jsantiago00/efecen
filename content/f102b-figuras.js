/* ===== F102B · Figuras interactivas de los apuntes =====
   Se agregan al final de «La idea» de cada ficha (E.addFigures). Las que tienen `play` se animan con el botón
   «Reproducir». Las unidades son arbitrarias salvo que se diga otra cosa (por ejemplo, nR = 1 en los diagramas P-V). */
(function () {
  const E = window.Efecen, R = String.raw;
  const nf = (x, d = 2) => String(+x.toFixed(d)).replace(".", "{,}").replace(/^-0$/, "0");
  const rad = d => d * Math.PI / 180;

  // isotermas del gas ideal (nR = 1)
  const isotermas = {
    xr: [0, 10], yr: [0, 10], h: 240,
    sliders: [{ k: "T", label: R`T`, min: 2, max: 20, step: 0.5, v: 8 }, { k: "V", label: R`V`, min: 1, max: 10, step: 0.05, v: 3 }],
    draw(g, p) {
      g.grid(1, 1); g.axes();
      for (const T of [4, 8, 12, 16, 20]) g.fn(V => T / V, { c: "line", w: 1.5, from: 0.2 });
      g.fn(V => p.T / V, { c: "f", from: 0.2 });
      g.dot(p.V, p.T / p.V);
      return `PV = nRT\\qquad P = \\frac{nRT}{V} = ${nf(p.T / p.V)}\\qquad \\text{más lejos del origen, más temperatura}`;
    }
  };

  // isotérmica contra adiabática desde el mismo estado, con el trabajo sombreado
  const procesos = {
    xr: [0, 6], yr: [0, 6], h: 240,
    sliders: [{ k: "V2", label: R`V_f`, min: 1.2, max: 5.5, step: 0.05, v: 4 }, { k: "gam", label: R`\gamma`, min: 1.1, max: 1.67, step: 0.01, v: 1.4 }],
    draw(g, p) {
      const V1 = 1, P1 = 5, iso = V => P1 * V1 / V, adi = V => P1 * (V1 / V) ** p.gam;
      g.grid(1, 1); g.axes();
      const pts = [[V1, 0]]; for (let i = 0; i <= 60; i++) { const V = V1 + (p.V2 - V1) * i / 60; pts.push([V, adi(V)]); } pts.push([p.V2, 0]);
      g.poly(pts, { c: "p", fill: "p", alpha: 0.15, noStroke: true });
      g.fn(iso, { c: "f", from: 0.6 }); g.fn(adi, { c: "p", from: 0.6 });
      g.dot(V1, P1, { c: "ink" }); g.dot(p.V2, iso(p.V2), { c: "f", r: 4 }); g.dot(p.V2, adi(p.V2), { r: 4 });
      const Wi = P1 * V1 * Math.log(p.V2 / V1), Wa = (P1 * V1 - adi(p.V2) * p.V2) / (p.gam - 1);
      return `W_{\\text{isot}} = P_1V_1\\ln\\frac{V_f}{V_1} = ${nf(Wi)}\\qquad W_{\\text{adiab}} = \\frac{P_1V_1 - P_fV_f}{\\gamma - 1} = ${nf(Wa)}`;
    }
  };

  // ciclo de Carnot
  const carnot = {
    xr: [0, 12.5], yr: [0, 11], h: 240,
    sliders: [{ k: "r", label: R`T_C/T_H`, min: 0.4, max: 0.9, step: 0.01, v: 0.6 }],
    draw(g, p) {
      const gam = 5 / 3, TH = 10, TC = TH * p.r, V1 = 1, V2 = 3, k = (TH / TC) ** (1 / (gam - 1)), V3 = V2 * k, V4 = V1 * k;
      const seg = (f, a, b) => Array.from({ length: 41 }, (_, i) => { const V = a + (b - a) * i / 40; return [V, f(V)]; });
      const AB = seg(V => TH / V, V1, V2), BC = seg(V => TH / V2 * (V2 / V) ** gam, V2, V3), CD = seg(V => TC / V, V3, V4), DA = seg(V => TC / V4 * (V4 / V) ** gam, V4, V1);
      g.grid(1, 1); g.axes();
      g.poly([...AB, ...BC, ...CD, ...DA], { c: "p", fill: "p", alpha: 0.15, noStroke: true });
      g.curve(AB, { c: "bad" }); g.curve(BC, { c: "p" }); g.curve(CD, { c: "ok" }); g.curve(DA, { c: "p" });
      [[V1, TH / V1, "A"], [V2, TH / V2, "B"], [V3, TC / V3, "C"], [V4, TC / V4, "D"]].forEach(([x, y, t]) => { g.dot(x, y, { c: "ink", r: 4 }); g.text(t, x, y, { dx: 10, dy: -10 }); });
      return `\\eta = 1 - \\frac{T_C}{T_H} = ${nf(1 - p.r)}\\qquad \\text{roja: } T_H\\qquad \\text{verde: } T_C\\qquad \\text{violetas: adiabáticas}`;
    }
  };

  // distribución de Maxwell de rapideces (m = k = 1)
  const maxwell = {
    xr: [0, 6], yr: [0, 0.9], h: 230,
    sliders: [{ k: "T", label: R`T`, min: 0.3, max: 4, step: 0.05, v: 1 }],
    draw(g, p) {
      const f = (v, T) => 4 * Math.PI * (1 / (2 * Math.PI * T)) ** 1.5 * v * v * Math.exp(-v * v / (2 * T));
      g.grid(1, 0.1); g.axes();
      g.fn(v => f(v, 1), { c: "line", w: 1.5, dash: true });
      g.fn(v => f(v, p.T), { c: "p" });
      const vp = Math.sqrt(2 * p.T), vm = Math.sqrt(8 * p.T / Math.PI), vr = Math.sqrt(3 * p.T);
      g.line(vp, 0, vp, f(vp, p.T), { c: "f", w: 1.5 }); g.line(vm, 0, vm, f(vm, p.T), { c: "ok", w: 1.5 }); g.line(vr, 0, vr, f(vr, p.T), { c: "bad", w: 1.5 });
      return `v_p = \\sqrt{\\tfrac{2kT}{m}} = ${nf(vp)}\\qquad \\bar v = ${nf(vm)}\\qquad v_{rms} = \\sqrt{\\tfrac{3kT}{m}} = ${nf(vr)}`;
    }
  };

  // onda viajera: la forma avanza, cada partícula solo sube y baja
  const viajera = {
    xr: [0, 10], yr: [-2.2, 2.2], h: 220,
    sliders: [{ k: "lam", label: R`\lambda`, min: 1, max: 8, step: 0.1, v: 4 }, { k: "A", label: R`A`, min: 0.3, max: 2, step: 0.05, v: 1.2 }, { k: "t", label: R`t / T`, min: 0, max: 4, step: 0.01, v: 0 }],
    play: { k: "t", max: 4, speed: 0.5, loop: true },
    draw(g, p) {
      const k = 2 * Math.PI / p.lam, y = x => p.A * Math.sin(k * x - 2 * Math.PI * p.t);
      g.grid(1, 1); g.axes();
      g.fn(y, { c: "p" });
      const x0 = 3, y0 = y(x0), vy = -p.A * 2 * Math.PI * Math.cos(k * x0 - 2 * Math.PI * p.t);
      g.line(x0, -2.2, x0, 2.2, { c: "line", dash: true, w: 1 }); g.dot(x0, y0, { c: "f", r: 6 });
      g.arrow(x0, y0, x0, y0 + 0.15 * vy, { c: "ok", w: 2 });
      // una cresta, para ver que la forma avanza a v = λ/T
      const xc = (((p.t + 0.25) * p.lam) % p.lam);
      for (let xx = xc; xx <= 10; xx += p.lam) g.dot(xx, p.A, { c: "p", r: 3 });
      return `y = A\\sin(kx - \\omega t)\\qquad v = \\frac{\\lambda}{T} = ${nf(p.lam)}\\ \\text{(con } T = 1)\\qquad \\text{la partícula naranja solo oscila}`;
    }
  };

  // ondas estacionarias: armónicos de una cuerda fija en los dos extremos
  const estacionaria = {
    xr: [0, 10], yr: [-1.6, 1.6], h: 220,
    sliders: [{ k: "n", label: R`n`, min: 1, max: 6, step: 1, v: 3 }, { k: "t", label: R`t`, min: 0, max: 12.57, step: 0.02, v: 1 }],
    play: { k: "t", max: 12.57, speed: 2, loop: true },
    draw(g, p) {
      const L = 10, n = Math.round(p.n), k = n * Math.PI / L, w = n * 0.5;
      g.grid(1, 0.5); g.axes();
      g.fn(x => Math.sin(k * x), { c: "line", dash: true, w: 1 }); g.fn(x => -Math.sin(k * x), { c: "line", dash: true, w: 1 });
      g.fn(x => Math.sin(k * x) * Math.cos(w * p.t), { c: "p" });
      for (let j = 0; j <= n; j++) g.dot(j * L / n, 0, { c: "f", r: 4 });
      return `\\lambda_n = \\frac{2L}{n}\\qquad f_n = n\\,f_1\\qquad \\text{${n + 1} nodos (naranjas) y ${n} antinodos}`;
    }
  };

  // refracción y reflexión total (Snell)
  const snell = {
    xr: [-3, 3], yr: [-2.5, 2.5], equal: true, h: 250,
    sliders: [{ k: "th", label: R`\theta_1\ (°)`, min: 0, max: 89, step: 0.5, v: 35 }, { k: "n1", label: R`n_1`, min: 1, max: 2, step: 0.01, v: 1 }, { k: "n2", label: R`n_2`, min: 1, max: 2, step: 0.01, v: 1.5 }],
    draw(g, p) {
      const t1 = rad(p.th), s2 = p.n1 * Math.sin(t1) / p.n2, L = 2.5;
      g.rect(-3, -2.5, 6, 2.5, { c: "p", fill: "p", alpha: Math.min(0.35, 0.1 + 0.25 * (p.n2 - 1)), noStroke: true });
      g.line(-3, 0, 3, 0, { c: "ink", w: 1.5 }); g.line(0, -2.5, 0, 2.5, { c: "muted", dash: true, w: 1 });
      g.arrow(-L * Math.sin(t1), L * Math.cos(t1), 0, 0, { c: "gold" });
      g.arrow(0, 0, L * Math.sin(t1), L * Math.cos(t1), { c: "line", w: 1.5 });
      if (s2 <= 1) { const t2 = Math.asin(s2); g.arrow(0, 0, L * Math.sin(t2), -L * Math.cos(t2), { c: "f" }); return `n_1\\sin\\theta_1 = n_2\\sin\\theta_2\\qquad \\theta_2 = ${nf(t2 * 180 / Math.PI, 1)}°`; }
      g.arrow(0, 0, L * Math.sin(t1), L * Math.cos(t1), { c: "f" });
      return `\\text{reflexión total: } \\theta_1 > \\theta_c = \\arcsin\\frac{n_2}{n_1} = ${nf(Math.asin(p.n2 / p.n1) * 180 / Math.PI, 1)}°`;
    }
  };

  // lente delgada: los tres rayos principales y la imagen
  const lente = {
    xr: [-9, 9], yr: [-4, 4], equal: true, h: 250,
    sliders: [{ k: "o", label: R`d_o`, min: 0.6, max: 8.5, step: 0.05, v: 5 }, { k: "f", label: R`f`, min: 1, max: 4, step: 0.05, v: 2 }],
    draw(g, p) {
      const f = p.f, d = p.o, h = 1.5;
      g.line(-9, 0, 9, 0, { c: "muted", w: 1 }); g.line(0, -3.6, 0, 3.6, { c: "p", w: 3 });
      g.dot(f, 0, { c: "ink", r: 3 }); g.dot(-f, 0, { c: "ink", r: 3 }); g.text("F", f, 0, { dy: 12 }); g.text("F", -f, 0, { dy: 12 });
      g.arrow(-d, 0, -d, h, { c: "ok", w: 3 });
      if (Math.abs(d - f) < 0.03) { g.line(-d, h, 0, h, { c: "gold", w: 1.5 }); g.line(0, h, 9, h - 9 * h / f, { c: "gold", w: 1.5 }); g.line(-d, h, 9, h - 9 * h / d, { c: "gold", w: 1.5 }); return `d_o = f:\\ \\text{los rayos salen paralelos, la imagen está en el infinito}`; }
      const di = 1 / (1 / f - 1 / d), m = -di / d, hi = m * h;
      // rayo paralelo al eje → pasa por F'; rayo por el centro → sigue derecho
      const far = 9;
      g.line(-d, h, 0, h, { c: "gold", w: 1.5 }); g.line(0, h, far, h - far * h / f, { c: "gold", w: 1.5 });
      g.line(-d, h, far, h - (far + d) * h / d, { c: "f", w: 1.5 });
      if (di > 0) g.arrow(di, 0, di, hi, { c: "bad", w: 3 });
      else { g.line(0, h, di, hi, { c: "gold", dash: true, w: 1 }); g.line(-d, h, di, hi, { c: "f", dash: true, w: 1 }); g.arrow(di, 0, di, hi, { c: "bad", w: 3, dash: true }); }
      return `\\frac1{d_o} + \\frac1{d_i} = \\frac1f:\\ d_i = ${nf(di)}\\qquad m = -\\frac{d_i}{d_o} = ${nf(m)}\\qquad \\text{${di > 0 ? "real e invertida" : "virtual y derecha"}}`;
    }
  };

  // doble rendija: franjas de interferencia (con la envolvente de difracción de cada rendija)
  const young = {
    xr: [-30, 30], yr: [-0.05, 1.1], h: 220,
    sliders: [{ k: "lam", label: R`\lambda\ (\text{nm})`, min: 400, max: 700, step: 5, v: 550 }, { k: "d", label: R`d\ (\mu\text{m})`, min: 20, max: 100, step: 1, v: 50 }, { k: "a", label: R`a\ (\mu\text{m})`, min: 2, max: 20, step: 0.5, v: 10 }],
    draw(g, p) {
      // y en mm sobre una pantalla a L = 1 m
      const L = 1, I = y => { const th = Math.atan(y / 1000 / L), s = Math.sin(th), b = Math.PI * p.a * 1e-6 * s / (p.lam * 1e-9), env = b === 0 ? 1 : (Math.sin(b) / b) ** 2; return Math.cos(Math.PI * p.d * 1e-6 * s / (p.lam * 1e-9)) ** 2 * env; };
      g.grid(5, 0.25); g.axes();
      g.fn(y => { const th = Math.atan(y / 1000), b = Math.PI * p.a * 1e-6 * Math.sin(th) / (p.lam * 1e-9); return b === 0 ? 1 : (Math.sin(b) / b) ** 2; }, { c: "line", dash: true, w: 1.5 });
      g.fn(I, { c: "p", w: 2 });
      return `\\Delta y \\approx \\frac{\\lambda L}{d} = ${nf(p.lam * 1e-9 * L / (p.d * 1e-6) * 1000)}\\ \\text{mm}\\qquad \\text{primer cero de difracción: } \\frac{\\lambda L}{a} = ${nf(p.lam * 1e-9 * L / (p.a * 1e-6) * 1000, 1)}\\ \\text{mm}`;
    }
  };

  E.addFigures("f102b", {
    "f2b-gas-ideal": [{ viz: isotermas, caption: R`Cada hipérbola es una isoterma ($PV$ constante). Con $T$ fija, al aumentar el volumen baja la presión; al subir $T$, la isoterma se aleja del origen.` }],
    "f2b-procesos": [{ viz: procesos, caption: R`Naranja: isotérmica; violeta: adiabática, que cae más rápido porque el gas se enfría. El área sombreada es el trabajo de la adiabática; la isotérmica hace más trabajo porque recibe calor.` }],
    "f2b-segunda-ley": [{ viz: carnot, caption: R`Ciclo de Carnot de un gas monoatómico entre dos isotermas y dos adiabáticas. El área encerrada es el trabajo neto; el rendimiento solo depende del cociente de temperaturas.` }],
    "f2b-cinetica": [{ viz: maxwell, caption: R`Distribución de Maxwell de las rapideces (en unidades con $m = k = 1$; punteada: $T = 1$). Al calentar, la curva se corre a la derecha y se aplana. Naranja: la más probable; verde: la media; roja: la cuadrática media.` }],
    "f2b-ondas": [{ viz: viajera, caption: R`La forma de la onda avanza, pero cada partícula de la cuerda (naranja) solo sube y baja: la onda transporta energía, no materia. La flecha verde es la velocidad de la partícula.` }],
    "f2b-sonido": [{ viz: estacionaria, caption: R`Armónicos de una cuerda (o de un tubo cerrado en los dos extremos para la presión): entran $n$ medias longitudes de onda. Los nodos no se mueven nunca.` }],
    "f2b-optica": [{ viz: snell, caption: R`Dorado: el rayo incidente; naranja: el refractado (o el reflejado, si hay reflexión total); gris: la reflexión parcial. Probá $n_1 = 1{,}5$ y $n_2 = 1$: pasado el ángulo crítico, la luz no sale.` }],
    "f2b-lentes": [{ viz: lente, caption: R`Lente convergente. El rayo paralelo al eje sale por el foco (dorado) y el que pasa por el centro sigue derecho (naranja); donde se cortan está la imagen. Con el objeto más cerca que el foco, la imagen es virtual (punteada): es una lupa.` }],
    "f2b-interferencia": [{ viz: young, caption: R`Intensidad en una pantalla a $1$ m de una doble rendija. Las franjas están separadas $\frac{\lambda L}{d}$, y la envolvente punteada es la difracción de cada rendija, de ancho $a$.` }]
  });
})();
