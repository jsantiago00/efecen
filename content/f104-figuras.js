/* ===== F104 · Figuras interactivas de los apuntes =====
   Se agregan al final de «La idea» de cada ficha (E.addFigures). Las cuánticas usan unidades con ħ²/2m = 1 salvo que
   se diga otra cosa; las del hidrógeno, el radio de Bohr a₀. */
(function () {
  const E = window.Efecen, R = String.raw;
  const nf = (x, d = 2) => String(+x.toFixed(d)).replace(".", "{,}").replace(/^-0$/, "0");

  // diagrama de Minkowski: ejes de otro observador y un evento con su tipo de intervalo
  const minkowski = {
    xr: [-4, 4], yr: [-1, 5], equal: true, h: 260,
    sliders: [{ k: "b", label: R`\beta`, min: -0.9, max: 0.9, step: 0.01, v: 0.5 }, { k: "x", label: R`x_B`, min: -3.5, max: 3.5, step: 0.05, v: 1.5 }, { k: "t", label: R`ct_B`, min: 0.2, max: 4.5, step: 0.05, v: 3 }],
    draw(g, p) {
      g.grid(1, 1); g.axes();
      g.line(0, 0, 5, 5, { c: "gold", dash: true }); g.line(0, 0, -5, 5, { c: "gold", dash: true });
      g.line(-4 * p.b, -4, 5 * p.b, 5, { c: "p", w: 2 }); g.line(-4, -4 * p.b, 4, 4 * p.b, { c: "p", w: 2 });
      g.text("ct'", 4.6 * p.b, 4.6, { c: "p", dx: 12 }); g.text("x'", 3.7, 3.7 * p.b, { c: "p", dy: -10 });
      const s2 = p.t * p.t - p.x * p.x, gm = 1 / Math.sqrt(1 - p.b * p.b), tp = gm * (p.t - p.b * p.x);
      g.dot(0, 0, { c: "ink", r: 4 }); g.dot(p.x, p.t, { c: s2 > 0 ? "ok" : "bad" }); g.text("B", p.x, p.t, { dx: 10, dy: -10 });
      return `s^2 = (ct)^2 - x^2 = ${nf(s2)}\\ (${s2 > 0 ? "\\text{temporal}" : "\\text{espacial}"})\\qquad ct'_B = \\gamma(ct - \\beta x) = ${nf(tp)}`;
    }
  };

  // espectro de Planck en función de λ (μm), normalizado al máximo del Sol
  const planck = {
    xr: [0, 3], yr: [0, 1.25], h: 230,
    sliders: [{ k: "T", label: R`T\ (\text{K})`, min: 2500, max: 8000, step: 50, v: 5800 }],
    draw(g, p) {
      const c2 = 14388, B = (l, T) => 1 / (l ** 5 * Math.expm1(c2 / (l * T))), ref = B(2898 / 5800, 5800);
      g.grid(0.5, 0.25); g.axes();
      g.rect(0.38, 0, 0.37, 1.25, { c: "gold", fill: "gold", alpha: 0.12, noStroke: true });
      g.fn(l => B(l, 5800) / ref, { c: "line", dash: true, w: 1.5, from: 0.05 });
      g.fn(l => B(l, p.T) / ref, { c: "p", w: 2.5, from: 0.05 });
      const lm = 2898 / p.T; g.dot(lm, B(lm, p.T) / ref);
      return `\\lambda_{max} = \\frac{2898\\ \\mu\\text{m}\\,\\text{K}}{T} = ${nf(lm)}\\ \\mu\\text{m}\\qquad \\frac{P}{P_\\odot} = \\left(\\frac{T}{5800}\\right)^4 = ${nf((p.T / 5800) ** 4)}`;
    }
  };

  // niveles de Bohr y una transición
  const bohr = {
    xr: [0, 10], yr: [-14.5, 1], h: 260,
    sliders: [{ k: "ni", label: R`n_i`, min: 2, max: 7, step: 1, v: 3 }, { k: "nf", label: R`n_f`, min: 1, max: 6, step: 1, v: 2 }],
    draw(g, p) {
      g.grid(10, 2); g.axes();
      for (let n = 1; n <= 7; n++) { const En = -13.6 / (n * n); g.line(1, En, 9, En, { c: n === p.ni || n === p.nf ? "ink" : "line", w: n === p.ni || n === p.nf ? 2.5 : 1.5 }); g.text(`n = ${n}`, 9.6, En, { size: 10 }); }
      if (p.nf >= p.ni) return `\\text{elegí } n_f < n_i\\text{ para ver una emisión}`;
      const Ei = -13.6 / p.ni ** 2, Ef = -13.6 / p.nf ** 2, lam = 1240 / (Ei - Ef), x = 2 + p.nf;
      g.arrow(x, Ei, x, Ef, { c: lam < 400 ? "p" : lam > 700 ? "bad" : "ok", w: 2.5 });
      return `E_\\gamma = 13{,}6\\left(\\frac{1}{${p.nf * p.nf}} - \\frac{1}{${p.ni * p.ni}}\\right) = ${nf(Ei - Ef)}\\ \\text{eV}\\qquad \\lambda = ${nf(lam, 1)}\\ \\text{nm}\\ (${lam < 400 ? "\\text{UV}" : lam > 700 ? "\\text{IR}" : "\\text{visible}"})`;
    }
  };

  // paquete gaussiano: |ψ(x)|² y |φ(k)|² con anchos inversos
  const paquete = {
    xr: [-6, 6], yr: [0, 1.1], h: 220,
    sliders: [{ k: "s", label: R`\sigma`, min: 0.3, max: 3, step: 0.05, v: 1 }],
    draw(g, p) {
      g.grid(1, 0.25); g.axes();
      g.fn(x => Math.exp(-x * x / (2 * p.s * p.s)), { c: "p", w: 2.5 });
      g.fn(k => Math.exp(-2 * k * k * p.s * p.s), { c: "f", w: 2.5 });
      return `\\Delta x = \\sigma = ${nf(p.s)}\\qquad \\Delta k = \\frac{1}{2\\sigma} = ${nf(1 / (2 * p.s))}\\qquad \\Delta x\\,\\Delta p = \\frac\\hbar2`;
    }
  };

  // pozo infinito: φ_n y |φ_n|² (L = 1)
  const pozo = {
    xr: [-0.1, 1.1], yr: [-1.6, 2.2], h: 230,
    sliders: [{ k: "n", label: R`n`, min: 1, max: 6, step: 1, v: 2 }],
    draw(g, p) {
      g.grid(0.25, 0.5); g.axes();
      g.line(0, -1.6, 0, 2.2, { c: "ink", w: 3 }); g.line(1, -1.6, 1, 2.2, { c: "ink", w: 3 });
      g.fn(x => Math.SQRT2 * Math.sin(p.n * Math.PI * x), { c: "line", w: 1.5, from: 0, to: 1 });
      g.fn(x => 2 * Math.sin(p.n * Math.PI * x) ** 2, { c: "p", w: 2.5, from: 0, to: 1 });
      return `E_${p.n} = ${p.n * p.n}E_1\\qquad \\text{nodos adentro: } ${p.n - 1}\\qquad \\text{violeta: } |\\varphi_${p.n}|^2`;
    }
  };

  // superposición de φ₁ y φ₂: la densidad se mueve de un lado al otro
  const superpos = {
    xr: [-0.05, 1.05], yr: [0, 3.6], h: 230,
    sliders: [{ k: "t", label: R`t/T`, min: 0, max: 1, step: 0.01, v: 0 }],
    play: { k: "t", max: 1, speed: 0.25, loop: true },
    draw(g, p) {
      const ph = 2 * Math.PI * p.t, d = x => Math.sin(Math.PI * x) ** 2 + Math.sin(2 * Math.PI * x) ** 2 + 2 * Math.sin(Math.PI * x) * Math.sin(2 * Math.PI * x) * Math.cos(ph);
      g.grid(0.25, 0.5); g.axes();
      g.line(0, 0, 0, 3.6, { c: "ink", w: 3 }); g.line(1, 0, 1, 3.6, { c: "ink", w: 3 });
      g.fn(d, { c: "p", w: 2.5, from: 0, to: 1 });
      const xm = 0.5 - 16 / (9 * Math.PI * Math.PI) * Math.cos(ph); g.dot(xm, 0.1, { c: "f" });
      return `|\\psi|^2 = \\tfrac12\\left|\\varphi_1 + \\varphi_2e^{-i(E_2 - E_1)t/\\hbar}\\right|^2\\qquad \\langle x\\rangle = ${nf(xm)}\\,L\\qquad T = \\frac{h}{E_2 - E_1}`;
    }
  };

  // transmisión por una barrera (ħ²/2m = 1, V₀ = 10) en función de E/V₀
  const barrera = {
    xr: [0, 3], yr: [0, 1.1], h: 220,
    sliders: [{ k: "a", label: R`a`, min: 0.1, max: 1.5, step: 0.02, v: 0.5 }, { k: "e", label: R`E/V_0`, min: 0.05, max: 2.9, step: 0.01, v: 0.6 }],
    draw(g, p) {
      const V = 10, Tf = r => { const E = r * V; if (Math.abs(r - 1) < 1e-6) return 1 / (1 + V * p.a * p.a / 4); if (r < 1) { const k = Math.sqrt(V - E); return 1 / (1 + V * V * Math.sinh(k * p.a) ** 2 / (4 * E * (V - E))); } const k = Math.sqrt(E - V); return 1 / (1 + V * V * Math.sin(k * p.a) ** 2 / (4 * E * (E - V))); };
      g.grid(0.5, 0.25); g.axes();
      g.line(1, 0, 1, 1.1, { c: "line", dash: true });
      g.fn(Tf, { c: "p", w: 2.5, from: 0.01 });
      g.dot(p.e, Tf(p.e), { c: "f" });
      return `T = ${nf(Tf(p.e), 4)}\\qquad ${p.e < 1 ? "\\text{túnel: clásicamente } T = 0" : "\\text{por encima: clásicamente } T = 1"}`;
    }
  };

  // oscilador: potencial, niveles y una autofunción (unidades con ħω = 1, x en x₀)
  const oscilador = {
    xr: [-4.5, 4.5], yr: [0, 7.2], h: 260,
    sliders: [{ k: "n", label: R`n`, min: 0, max: 5, step: 1, v: 1 }],
    draw(g, p) {
      const Hm = (n, x) => { let a = 1, b = 2 * x; if (n === 0) return a; for (let k = 1; k < n; k++) { const c = 2 * x * b - 2 * k * a; a = b; b = c; } return b; };
      let fact = 1; for (let k = 2; k <= p.n; k++) fact *= k;
      const N = 1 / Math.sqrt(2 ** p.n * fact * Math.sqrt(Math.PI)), psi = x => N * Hm(p.n, x) * Math.exp(-x * x / 2), En = p.n + 0.5;
      g.grid(1, 1); g.axes();
      g.fn(x => x * x / 2, { c: "line", w: 2 });
      for (let k = 0; k <= 6; k++) g.line(-Math.sqrt(2 * (k + 0.5)), k + 0.5, Math.sqrt(2 * (k + 0.5)), k + 0.5, { c: k === p.n ? "ink" : "line", w: k === p.n ? 2 : 1 });
      g.fn(x => En + 1.2 * psi(x), { c: "p", w: 2.5 });
      return `E_${p.n} = \\left(${p.n} + \\tfrac12\\right)\\hbar\\omega\\qquad \\text{la función se mete un poco más allá de los puntos de retorno clásicos}`;
    }
  };

  // densidad radial P(r) = r²R²_nl del hidrógeno
  const RAD = {
    "1,0": r => 2 * Math.exp(-r), "2,0": r => (1 - r / 2) * Math.exp(-r / 2) / Math.SQRT2, "2,1": r => r * Math.exp(-r / 2) / Math.sqrt(24),
    "3,0": r => 2 / Math.sqrt(27) * (1 - 2 * r / 3 + 2 * r * r / 27) * Math.exp(-r / 3), "3,1": r => 8 / (27 * Math.sqrt(6)) * r * (1 - r / 6) * Math.exp(-r / 3), "3,2": r => 4 / (81 * Math.sqrt(30)) * r * r * Math.exp(-r / 3)
  };
  const radial = {
    xr: [0, 25], yr: [0, 0.6], h: 230,
    sliders: [{ k: "n", label: R`n`, min: 1, max: 3, step: 1, v: 2 }, { k: "l", label: R`l`, min: 0, max: 2, step: 1, v: 1 }],
    draw(g, p) {
      const l = Math.min(p.l, p.n - 1), f = RAD[`${p.n},${l}`];
      g.grid(5, 0.1); g.axes();
      g.fn(r => (r * f(r)) ** 2, { c: "p", w: 2.5, from: 0 });
      const rav = (3 * p.n * p.n - l * (l + 1)) / 2; g.line(rav, 0, rav, 0.6, { c: "f", dash: true });
      return `${p.n}${"spd"[l]}:\\ \\langle r\\rangle = ${nf(rav, 1)}\\,a_0\\qquad \\text{nodos radiales: } ${p.n - l - 1}${p.l > p.n - 1 ? "\\qquad (l \\le n - 1)" : ""}`;
    }
  };

  E.addFigures("f104", {
    "f3-intervalo": [{ viz: minkowski, caption: R`Diagrama de Minkowski. Dorado: el cono de luz del origen; violeta: los ejes $ct'$ y $x'$ de un observador que se mueve a $\beta c$. Si B está afuera del cono (rojo), hay observadores para los que ocurre antes que el origen: probá $\beta$ cerca de $\frac{ct_B}{x_B}$.` }],
    "f3-cuerpo-negro": [{ viz: planck, caption: R`Espectro de Planck (punteado: el Sol, a 5800 K; la franja dorada es el visible). Al calentar, el máximo se corre a longitudes de onda cortas (Wien) y el área crece como $T^4$ (Stefan-Boltzmann).` }],
    "f3-bohr": [{ viz: bohr, caption: R`Niveles de energía del hidrógeno. La flecha es el fotón emitido: violeta si es ultravioleta, verde si es visible, rojo si es infrarrojo. Las líneas que terminan en $n = 2$ forman la serie de Balmer.` }],
    "f3-incerteza": [{ viz: paquete, caption: R`Violeta: $|\psi(x)|^2$ de un paquete gaussiano; naranja: su distribución de números de onda $|\phi(k)|^2$ (con $k_0 = 0$, en el mismo eje). Al angostar uno se ensancha el otro.` }],
    "f3-pozo-infinito": [{ viz: pozo, caption: R`Gris: $\varphi_n$; violeta: la densidad $|\varphi_n|^2$ en un pozo de ancho 1. El estado $n$ tiene $n - 1$ nodos; para $n$ grande, la densidad se vuelve casi uniforme, como la de una partícula clásica.` }],
    "f3-superposicion": [{ viz: superpos, caption: R`Densidad de la superposición $\frac{1}{\sqrt2}(\varphi_1 + \varphi_2)$ en el pozo. Con «Reproducir», la probabilidad va y viene de un lado al otro con período $\frac{h}{E_2 - E_1}$; el punto naranja es $\langle x\rangle$.` }],
    "f3-barrera": [{ viz: barrera, caption: R`Transmisión por una barrera de alto $V_0$ y ancho $a$ (en unidades con $\frac{\hbar^2}{2m} = 1$ y $V_0 = 10$). Debajo de $V_0$ crece exponencialmente al achicar la barrera; por encima, oscila y vale 1 en las resonancias.` }],
    "f3-oscilador": [{ viz: oscilador, caption: R`Potencial del oscilador, sus niveles equiespaciados y la autofunción $\varphi_n$ dibujada sobre su nivel. Cada línea de nivel termina en los puntos de retorno clásicos.` }],
    "f3-hidrogeno": [{ viz: radial, caption: R`Densidad radial $r^2R_{nl}^2$ del hidrógeno ($r$ en $a_0$); la línea naranja es $\langle r\rangle$. Los estados con $l = n - 1$ tienen un solo máximo, en $n^2a_0$.` }]
  });
})();
