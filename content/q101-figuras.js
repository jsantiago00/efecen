/* ===== Q101 · Figuras interactivas de los apuntes =====
   Se agregan al final de «La idea» de cada ficha (E.addFigures). */
(function () {
  const E = window.Efecen, R = String.raw;
  const nf = (x, d = 2) => String(+x.toFixed(d)).replace(".", "{,}").replace(/^-0$/, "0");
  const simpson = (f, a, b, n = 200) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3; };

  // leyes integradas: la misma concentración inicial y la misma k, con orden 0, 1 y 2
  const integradas = {
    xr: [0, 10], yr: [0, 1.15], h: 230,
    sliders: [{ k: "k", label: R`k`, min: 0.1, max: 1, step: 0.01, v: 0.3 }, { k: "t", label: R`t`, min: 0, max: 10, step: 0.05, v: 2 }],
    draw(g, p) {
      const f0 = t => Math.max(0, 1 - p.k * t), f1 = t => Math.exp(-p.k * t), f2 = t => 1 / (1 + p.k * t);
      g.grid(1, 0.25); g.axes();
      g.line(0, 0.5, 10, 0.5, { c: "line", dash: true, w: 1.5 });
      g.fn(f0, { c: "f", w: 2.5 }); g.fn(f1, { c: "p", w: 2.5 }); g.fn(f2, { c: "ok", w: 2.5 });
      g.line(p.t, 0, p.t, 1.15, { c: "muted", dash: true, w: 1 });
      g.dot(p.t, f0(p.t), { c: "f" }); g.dot(p.t, f1(p.t), { c: "p" }); g.dot(p.t, f2(p.t), { c: "ok" });
      g.text("orden 0", 8.9, 1.08, { c: "f", size: 11 }); g.text("orden 1", 8.9, 0.99, { c: "p", size: 11 }); g.text("orden 2", 8.9, 0.9, { c: "ok", size: 11 });
      return `[\\mathrm{A}] = ${nf(f0(p.t))}\\ (0),\\ ${nf(f1(p.t))}\\ (1),\\ ${nf(f2(p.t))}\\ (2)\\qquad t_{1/2} = ${nf(0.5 / p.k)},\\ ${nf(Math.LN2 / p.k)},\\ ${nf(1 / p.k)}`;
    }
  };

  // distribución de velocidades de Maxwell-Boltzmann (el eje vertical, en 10⁻³ s/m)
  const maxwell = {
    xr: [0, 3000], yr: [0, 4.6], h: 230,
    sliders: [{ k: "T", label: R`T\ (\text{K})`, min: 150, max: 1000, step: 10, v: 500 }, { k: "M", label: R`M\ (\text{g/mol})`, min: 4, max: 70, step: 1, v: 28 }],
    draw(g, p) {
      const a = p.M * 1e-3 / (2 * 8.314 * p.T), f = v => 4 * Math.PI * (a / Math.PI) ** 1.5 * v * v * Math.exp(-a * v * v) * 1e3;
      const vp = 1 / Math.sqrt(a), vm = 2 * vp / Math.sqrt(Math.PI), vr = vp * Math.sqrt(1.5);
      g.grid(500, 1); g.axes();
      // el nitrógeno a 300 K, como referencia
      const a0 = 0.028 / (2 * 8.314 * 300);
      g.fn(v => 4 * Math.PI * (a0 / Math.PI) ** 1.5 * v * v * Math.exp(-a0 * v * v) * 1e3, { c: "line", dash: true, w: 1.5 });
      g.fn(f, { c: "p", w: 2.5 });
      g.line(vp, 0, vp, f(vp), { c: "f", w: 2 }); g.line(vr, 0, vr, f(vr), { c: "ok", w: 2 });
      g.text("500", 500, 0, { dy: -9, size: 10, c: "muted" }); g.text("1500", 1500, 0, { dy: -9, size: 10, c: "muted" }); g.text("2500 m/s", 2500, 0, { dy: -9, size: 10, c: "muted" });
      return `v_p = \\sqrt{\\tfrac{2RT}{M}} = ${nf(vp, 0)}\\qquad \\bar v = ${nf(vm, 0)}\\qquad v_{rms} = \\sqrt{\\tfrac{3RT}{M}} = ${nf(vr, 0)}\\ \\text{m/s}`;
    }
  };

  // titulación de 25 mL de un ácido 0,1 M con NaOH 0,1 M: el pH sale del balance de cargas, por bisección
  const pH = (V, Ka) => {
    const Ca = 0.1 * 25 / (25 + V), Cb = 0.1 * V / (25 + V);
    // Ka = null: ácido fuerte (todo disociado)
    const f = h => h + Cb - 1e-14 / h - (Ka == null ? Ca : Ca * Ka / (Ka + h));
    let lo = 0, hi = 14;
    for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (f(10 ** -m) > 0) lo = m; else hi = m; }
    return (lo + hi) / 2;
  };
  const titulacion = {
    xr: [0, 50], yr: [0, 14], h: 250,
    sliders: [{ k: "V", label: R`V_{\text{NaOH}}\ (\text{mL})`, min: 0, max: 50, step: 0.1, v: 12.5 }, { k: "pKa", label: R`\mathrm{p}K_a`, min: 2, max: 10, step: 0.1, v: 4.8 }],
    draw(g, p) {
      const Ka = 10 ** -p.pKa, y = pH(p.V, Ka);
      g.grid(5, 2); g.axes();
      g.line(0, 7, 50, 7, { c: "line", dash: true, w: 1.5 }); g.line(25, 0, 25, 14, { c: "gold", dash: true, w: 1.5 });
      g.fn(V => pH(V, null), { c: "line", w: 2 });
      g.fn(V => pH(V, Ka), { c: "p", w: 2.5 });
      g.dot(12.5, pH(12.5, Ka), { c: "ok", r: 4 }); g.dot(25, pH(25, Ka), { c: "gold", r: 4 });
      g.dot(p.V, y, { c: "f" });
      g.text("pH 7", 3, 7, { dy: -8, size: 10, c: "muted" }); g.text("12,5", 12.5, 0, { dy: -9, size: 10, c: "muted" }); g.text("25", 25, 0, { dy: -9, dx: -10, size: 10, c: "muted" }); g.text("50 mL", 47, 0, { dy: -9, size: 10, c: "muted" }); g.text("equivalencia", 25, 13.2, { dx: 38, size: 10, c: "gold" });
      const zona = p.V < 0.05 ? "\\text{ácido débil solo}" : Math.abs(p.V - 25) < 0.15 ? "\\text{equivalencia: solo la sal}" : p.V < 25 ? "\\text{buffer}" : "\\text{exceso de base}";
      return `\\mathrm{pH} = ${nf(y)}\\ (${zona})\\qquad \\mathrm{pH}_{eq} = ${nf(pH(25, Ka))}\\qquad \\mathrm{pH}(12{,}5\\ \\text{mL}) = ${nf(pH(12.5, Ka))} \\approx \\mathrm{p}K_a`;
    }
  };

  // distribución de energías de las moléculas y la fracción que supera la energía de activación
  const arrhenius = {
    xr: [0, 40], yr: [0, 0.32], h: 230,
    sliders: [{ k: "T", label: R`T\ (\text{K})`, min: 200, max: 800, step: 5, v: 300 }, { k: "Ea", label: R`E_a\ (\text{kJ/mol})`, min: 3, max: 30, step: 0.5, v: 6 }],
    draw(g, p) {
      const RT = 8.314e-3 * p.T, f = e => 2 / Math.sqrt(Math.PI) * RT ** -1.5 * Math.sqrt(Math.max(e, 0)) * Math.exp(-e / RT);
      g.grid(5, 0.05); g.axes();
      const dE = 0.25;
      for (let e = p.Ea; e < 40; e += dE) g.rect(e, 0, dE, f(e + dE / 2), { c: "f", fill: "f", alpha: 0.35, noStroke: true });
      g.fn(f, { c: "p", w: 2.5 });
      g.line(p.Ea, 0, p.Ea, 0.32, { c: "f", w: 2 }); g.text("Eₐ", p.Ea, 0.3, { dx: 12, c: "f" });
      g.text("10", 10, 0, { dy: -9, size: 10, c: "muted" }); g.text("20", 20, 0, { dy: -9, size: 10, c: "muted" }); g.text("30 kJ/mol", 30, 0, { dy: -9, size: 10, c: "muted" });
      // fracción con E > Ea (la cola se integra hasta donde ya no aporta)
      const frac = simpson(f, p.Ea, p.Ea + 40 * RT, 400), boltz = Math.exp(-p.Ea / RT), RT2 = 8.314e-3 * (p.T + 10);
      return `e^{-E_a/RT} = ${boltz < 0.001 ? boltz.toExponential(1).replace(".", "{,}").replace(/e-?(\d+)/, (m, x) => `\\times 10^{-${x}}`) : nf(boltz, 3)}\\qquad \\text{fracción con } E > E_a:\\ ${nf(100 * frac, frac < 0.01 ? 3 : 1)}\\,\\%\\qquad \\frac{k(T + 10)}{k(T)} = ${nf(Math.exp(-p.Ea / RT2) / boltz)}`;
    }
  };

  E.addFigures("q101", {
    "qg-integradas": [{ viz: integradas, caption: R`Concentración de A (con $[\mathrm{A}]_0 = 1$) según el orden de la reacción, con la misma $k$. En orden 0 baja en línea recta y se termina; en orden 1 cada vida media dura lo mismo; en orden 2 cada vida media dura el doble que la anterior. Los números de abajo van en ese orden: 0, 1 y 2.` }],
    "qg-graham": [{ viz: maxwell, caption: R`Distribución de velocidades de las moléculas de un gas. Al calentar, la curva se ensancha y se corre a la derecha; con moléculas más pesadas, se angosta y se corre a la izquierda. La línea naranja marca la velocidad más probable y la verde, la cuadrática media. En gris, el nitrógeno a 300 K.` }],
    "qg-neutralizacion": [{ viz: titulacion, caption: R`Titulación de 25 mL de un ácido débil 0,1 M con NaOH 0,1 M (en gris, un ácido fuerte). A mitad de camino (punto verde) el pH es igual al $\mathrm{p}K_a$: es la zona buffer, donde la curva es más plana. En la equivalencia (punto amarillo) queda solo la sal, y el pH es mayor que 7 porque el anión se hidroliza.` }],
    "qg-arrhenius": [{ viz: arrhenius, caption: R`Distribución de energías de las moléculas a temperatura $T$. Solo las de la zona sombreada, con más energía que $E_a$, pueden reaccionar al chocar. Al subir la temperatura esa fracción crece muchísimo, y por eso la velocidad se multiplica aunque la energía media cambie poco.` }]
  });
})();
