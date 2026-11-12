/* ===== M103 · Figuras interactivas de los apuntes =====
   Se agregan al final de «La idea» de cada ficha (E.addFigures). Todas dibujan en el plano complejo
   (eje horizontal: parte real; vertical: parte imaginaria), salvo la de Taylor, que es un gráfico real. */
(function () {
  const E = window.Efecen, R = String.raw, Z = E.c3;
  const nf = (x, d = 2) => String(+(+x).toFixed(d)).replace(".", "{,}").replace(/^-0$/, "0");
  const ct = (z, d = 2) => { const a = +z[0].toFixed(d) || 0, b = +z[1].toFixed(d) || 0; return `${nf(a, d)} ${b < 0 ? "-" : "+"} ${nf(Math.abs(b), d)}\\,i`; };
  const arc = (x, y, rad, a, b, n = 60) => Array.from({ length: n + 1 }, (_, k) => [x + rad * Math.cos(a + (b - a) * k / n), y + rad * Math.sin(a + (b - a) * k / n)]);

  // producto: se multiplican los módulos y se suman los argumentos
  const producto = {
    xr: [-4, 4], yr: [-3, 3.4], equal: true, h: 260,
    sliders: [{ k: "s", label: R`|w|`, min: 0.4, max: 2, step: 0.05, v: 1.3 }, { k: "a", label: R`\arg w`, min: -3.1, max: 3.1, step: 0.05, v: 1.1 }],
    draw(g, p) {
      const z = Z.polar(1.6, 0.5), w = Z.polar(p.s, p.a), zw = Z.mul(z, w);
      g.grid(1, 1); g.axes(); g.circle(0, 0, 1, { c: "line", w: 1.5, dash: true });
      g.curve(arc(0, 0, 0.6, 0, 0.5), { c: "muted", w: 1.5 }); g.curve(arc(0, 0, 0.8, 0.5, 0.5 + p.a), { c: "f", w: 1.5 });
      g.arrow(0, 0, z[0], z[1], { c: "muted", w: 2.5 }); g.arrow(0, 0, w[0], w[1], { c: "f", w: 2.5 }); g.arrow(0, 0, zw[0], zw[1], { c: "p", w: 3 });
      g.text("z", z[0], z[1], { dx: 10, dy: -8, c: "muted" }); g.text("w", w[0], w[1], { dx: 10, dy: -8, c: "f" }); g.text("zw", zw[0], zw[1], { dx: 14, dy: -8, c: "p" });
      return `|zw| = 1{,}6\\cdot ${nf(p.s)} = ${nf(1.6 * p.s)}\\qquad \\arg(zw) = 0{,}5 + ${p.a < 0 ? `(${nf(p.a)})` : nf(p.a)} = ${nf(0.5 + p.a)}\\qquad zw = ${ct(zw)}`;
    }
  };

  // raíces n-ésimas: un polígono regular
  const raices = {
    xr: [-2.4, 2.4], yr: [-2.2, 2.2], equal: true, h: 260,
    sliders: [{ k: "n", label: "n", min: 2, max: 8, step: 1, v: 3 }, { k: "t", label: R`\operatorname{Arg} z_0`, min: -3.1, max: 3.14, step: 0.02, v: 1.2 }, { k: "r", label: R`|z_0|`, min: 0.3, max: 6, step: 0.1, v: 4 }],
    draw(g, p) {
      const n = Math.round(p.n), rho = p.r ** (1 / n), ws = Array.from({ length: n }, (_, k) => Z.polar(rho, (p.t + 2 * Math.PI * k) / n));
      g.grid(1, 1); g.axes(); g.circle(0, 0, rho, { c: "line", w: 1.5, dash: true });
      g.poly(ws, { c: "p", w: 1.5, fill: "p", alpha: 0.1 });
      ws.forEach((w, k) => { g.line(0, 0, w[0], w[1], { c: k ? "line" : "f", w: k ? 1.5 : 2.5 }); g.dot(w[0], w[1], { c: k ? "p" : "f" }); g.text(`w${"₀₁₂₃₄₅₆₇"[k]}`, w[0] * 1.18, w[1] * 1.18, { size: 11 }); });
      return `|w_k| = \\sqrt[${n}]{${nf(p.r, 1)}} = ${nf(rho)}\\qquad \\arg w_0 = \\frac{${nf(p.t)}}{${n}} = ${nf(p.t / n)}\\qquad \\text{separación: } \\frac{2\\pi}{${n}} = ${nf(2 * Math.PI / n)}`;
    }
  };

  // la exponencial: una recta vertical va a una circunferencia y una horizontal, a una semirrecta
  const expo = {
    xr: [-4.2, 4.2], yr: [-3.2, 3.2], equal: true, h: 260,
    sliders: [{ k: "a", label: R`x = a`, min: -1.5, max: 1.3, step: 0.05, v: 0.6 }, { k: "b", label: R`y = b`, min: -3.14, max: 3.14, step: 0.02, v: 0.9 }],
    draw(g, p) {
      const rad = Math.exp(p.a), w = Z.polar(rad, p.b), far = Z.polar(6, p.b);
      g.grid(1, 1); g.axes();
      g.circle(0, 0, rad, { c: "p", w: 2.5 }); g.line(0, 0, far[0], far[1], { c: "f", w: 2.5 });
      g.dot(0, 0, { c: "ink", open: true, r: 4 }); g.dot(w[0], w[1], { c: "ok" });
      g.text("imagen de x = a", 0, rad, { c: "p", dy: -10, size: 11 }); g.text("imagen de y = b", far[0] * 0.55, far[1] * 0.55, { c: "f", dx: 44, size: 11 });
      return `z = ${ct([p.a, p.b])}\\qquad |e^z| = e^{a} = ${nf(rad)}\\qquad \\arg e^z = b = ${nf(p.b)}\\qquad e^z = ${ct(w)}`;
    }
  };

  // el logaritmo principal: al cruzar el semieje real negativo, el argumento salta 2π
  const logar = {
    xr: [-2.6, 2.6], yr: [-2.1, 2.1], equal: true, h: 250,
    sliders: [{ k: "r", label: "|z|", min: 0.3, max: 2, step: 0.05, v: 1.4 }],
    play: { k: "t", max: 1, speed: 0.12, loop: true },
    draw(g, p) {
      const th = 2 * Math.PI * (p.t || 0) + 0.4, z = Z.polar(p.r, th), L = Z.log(z);
      g.grid(1, 1); g.axes();
      g.line(-2.6, 0, 0, 0, { c: "bad", w: 4 }); g.text("corte", -1.9, 0, { c: "bad", dy: 12, size: 11 });
      g.circle(0, 0, p.r, { c: "line", w: 1.5, dash: true });
      g.curve(arc(0, 0, 0.45, 0, L[1]), { c: "f", w: 2 });
      g.arrow(0, 0, z[0], z[1], { c: "p", w: 2.5 }); g.dot(z[0], z[1], { c: "p" }); g.dot(0, 0, { c: "bad", r: 4 });
      return `\\operatorname{Arg} z = ${nf(L[1])}\\qquad \\operatorname{Log} z = \\ln ${nf(p.r)} + i\\operatorname{Arg} z = ${ct(L)}`;
    }
  };

  // una función analítica gira y estira: cerca de z0 actúa como multiplicar por f'(z0)
  const conforme = {
    xr: [-4.5, 4.5], yr: [-3.3, 3.3], equal: true, h: 260,
    sliders: [{ k: "x", label: R`\operatorname{Re} z_0`, min: -1.5, max: 1.5, step: 0.05, v: 1 }, { k: "y", label: R`\operatorname{Im} z_0`, min: -1.5, max: 1.5, step: 0.05, v: 0.6 }],
    draw(g, p) {
      const z0 = [p.x, p.y], f = z => Z.mul(z, z), d = Z.sc(2, z0), h = 0.3, sq = [[-h, -h], [h, -h], [h, h], [-h, h]];
      const side = (a, b) => Array.from({ length: 13 }, (_, k) => f(Z.add(z0, [a[0] + (b[0] - a[0]) * k / 12, a[1] + (b[1] - a[1]) * k / 12])));
      g.grid(1, 1); g.axes();
      g.poly(sq.map(q => Z.add(z0, q)), { c: "muted", w: 2, fill: "muted", alpha: 0.15 });
      g.poly(sq.flatMap((q, i) => side(q, sq[(i + 1) % 4])), { c: "p", w: 2.5, fill: "p", alpha: 0.15 });
      g.arrow(z0[0], z0[1], z0[0] + h, z0[1], { c: "muted", w: 2 }); const w0 = f(z0), e = Z.sc(h, d); g.arrow(w0[0], w0[1], w0[0] + e[0], w0[1] + e[1], { c: "f", w: 2 });
      g.dot(z0[0], z0[1], { c: "muted", r: 3 }); g.dot(w0[0], w0[1], { c: "p", r: 3 });
      return `f(z) = z^2\\qquad f'(z_0) = 2z_0 = ${ct(d)}\\qquad \\text{estira } |f'(z_0)| = ${nf(Z.abs(d))}\\qquad \\text{gira } \\arg f'(z_0) = ${nf(Z.abs(d) < 1e-9 ? 0 : Z.arg(d))}`;
    }
  };

  // por qué la serie de 1/(1 + x²) solo converge en |x| < 1: los polos ±i
  const taylor = {
    xr: [-2.5, 2.5], yr: [-0.6, 1.8], h: 230,
    sliders: [{ k: "N", label: R`\text{términos}`, min: 1, max: 14, step: 1, v: 4 }],
    draw(g, p) {
      const N = Math.round(p.N), S = x => { let s = 0; for (let n = 0; n < N; n++) s += (-1) ** n * x ** (2 * n); return s; };
      g.grid(0.5, 0.5); g.axes();
      g.rect(-1, -0.6, 2, 2.4, { c: "ok", fill: "ok", alpha: 0.08, noStroke: true });
      g.line(-1, -0.6, -1, 1.8, { c: "ok", dash: true, w: 1.5 }); g.line(1, -0.6, 1, 1.8, { c: "ok", dash: true, w: 1.5 });
      g.fn(x => 1 / (1 + x * x), { c: "muted", w: 2.5 }); g.fn(S, { c: "p", w: 2.5 });
      return `S_{${N}}(x) = \\sum_{n=0}^{${N - 1}}(-1)^nx^{2n}\\qquad S_{${N}}(0{,}8) = ${nf(S(0.8), 3)}\\ \\ \\left(\\tfrac{1}{1 + 0{,}8^2} = 0{,}61\\right)\\qquad S_{${N}}(1{,}2) = ${nf(S(1.2), 1)}`;
    }
  };

  // teorema de los residuos: solo cuentan los polos que quedan dentro del contorno
  const residuos = {
    xr: [-4.5, 4.5], yr: [-3.3, 3.3], equal: true, h: 260,
    sliders: [{ k: "c", label: R`\text{centro}`, min: -3, max: 3, step: 0.05, v: 0 }, { k: "R", label: "R", min: 0.3, max: 3.2, step: 0.05, v: 1.5 }],
    draw(g, p) {
      // f(z) = 1/((z − 1)(z + 2)(z − 2i)): residuos por p/q'
      const poles = [[1, 0], [-2, 0], [0, 2]], res = poles.map((a, i) => Z.div([1, 0], poles.reduce((m, b, j) => (j === i ? m : Z.mul(m, Z.sub(a, b))), [1, 0])));
      g.grid(1, 1); g.axes(); g.circle(p.c, 0, p.R, { c: "p", w: 2.5, fill: "p", alpha: 0.08 });
      let sum = [0, 0], cnt = 0;
      poles.forEach((a, i) => { const inside = Math.hypot(a[0] - p.c, a[1]) < p.R; if (inside) { sum = Z.add(sum, res[i]); cnt++; } g.dot(a[0], a[1], { c: inside ? "ok" : "bad" }); g.text(["1", "−2", "2i"][i], a[0], a[1], { dx: 12, dy: -10, size: 11 }); });
      const I = Z.mul([0, 2 * Math.PI], sum);
      return `f(z) = \\frac{1}{(z - 1)(z + 2)(z - 2i)}\\qquad \\text{polos adentro: } ${cnt}\\qquad \\oint_C f\\,dz = 2\\pi i\\sum\\operatorname{Res} = ${ct(I, 3)}`;
    }
  };

  // integral impropia: el arco deja de aportar cuando R crece
  const semicirculo = {
    xr: [-6.5, 6.5], yr: [-1, 6.5], equal: true, h: 250,
    sliders: [{ k: "R", label: "R", min: 1.3, max: 6, step: 0.05, v: 2.5 }],
    draw(g, p) {
      g.grid(1, 1); g.axes();
      g.poly([[-p.R, 0], ...arc(0, 0, p.R, 0, Math.PI)], { c: "p", w: 2.5, fill: "p", alpha: 0.08 });
      g.arrow(-0.4, 0, 0.4, 0, { c: "p", w: 2.5 }); const m = Z.polar(p.R, 1.0), m2 = Z.polar(p.R, 1.25); g.arrow(m[0], m[1], m2[0], m2[1], { c: "p", w: 2.5 });
      g.dot(0, 1, { c: "ok" }); g.text("i", 0, 1, { dx: 10, dy: -8 }); g.dot(0, -1, { c: "bad" }); g.text("−i", 0, -1, { dx: 14 });
      const seg = 2 * Math.atan(p.R), cota = Math.PI * p.R / (p.R * p.R - 1);
      return `\\int_{-R}^{R}\\frac{dx}{x^2 + 1} = ${nf(seg, 3)}\\qquad \\left|\\int_{C_R}\\right| \\le \\frac{\\pi R}{R^2 - 1} = ${nf(cota, 3)}\\qquad 2\\pi i\\operatorname*{Res}_{z = i} = \\pi = 3{,}142`;
    }
  };

  // principio del argumento: las vueltas de f(z) alrededor del origen cuentan los ceros encerrados
  const vueltas = {
    xr: [-9, 9], yr: [-6.2, 6.2], equal: true, h: 260,
    sliders: [{ k: "R", label: "R", min: 0.3, max: 1.9, step: 0.02, v: 1.2 }],
    play: { k: "t", max: 1, speed: 0.15, loop: true },
    draw(g, p) {
      // f(z) = z (z − 1) (z + 1,5): ceros en 0, 1 y −1,5
      const f = z => Z.mul(z, Z.mul(Z.sub(z, [1, 0]), Z.add(z, [1.5, 0]))), N = 400;
      const pts = Array.from({ length: N + 1 }, (_, k) => f(Z.polar(p.R, 2 * Math.PI * k / N)));
      let turn = 0; for (let k = 1; k <= N; k++) { let d = Z.arg(pts[k]) - Z.arg(pts[k - 1]); if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; turn += d; }
      const zeros = [0, 1, -1.5].filter(a => Math.abs(a) < p.R).length, w = f(Z.polar(p.R, 2 * Math.PI * (p.t || 0)));
      g.grid(2, 2); g.axes(); g.curve(pts, { c: "p", w: 2.5 });
      g.line(0, 0, w[0], w[1], { c: "f", w: 1.5 }); g.dot(w[0], w[1], { c: "f" }); g.dot(0, 0, { c: "ink", r: 4 });
      return `f(z) = z(z - 1)(z + 1{,}5),\\ \\ |z| = ${nf(p.R)}\\qquad \\text{vueltas de } f(z) \\text{ al origen: } ${nf(turn / (2 * Math.PI), 0)}\\qquad \\text{ceros adentro: } ${zeros}`;
    }
  };

  E.addFigures("m103", {
    "c3-polar": [{ viz: producto, caption: R`Multiplicar por $w$ (naranja) estira a $z$ (gris) en un factor $|w|$ y lo gira un ángulo $\arg w$: el resultado es $zw$ (violeta). La circunferencia punteada es $|z| = 1$: con $|w| = 1$ el producto es un giro puro.` }],
    "c3-raices": [{ viz: raices, caption: R`Las $n$ raíces $n$-ésimas de $z_0$ son los vértices de un polígono regular. En naranja, la raíz principal $w_0$. Al mover $\operatorname{Arg} z_0$ todo el polígono gira, $n$ veces más despacio; al cruzar $\pm\pi$, la raíz principal salta a otro vértice.` }],
    "c3-exponencial": [{ viz: expo, caption: R`Plano $w = e^z$. La recta vertical $x = a$ se enrolla sobre la circunferencia de radio $e^a$ (violeta), y la horizontal $y = b$ va a la semirrecta de ángulo $b$ (naranja). El punto verde es $e^{a + ib}$. El origen nunca se alcanza.` }],
    "c3-logaritmo": [{ viz: logar, caption: R`Con «Reproducir», $z$ da vueltas alrededor del origen. $\operatorname{Arg} z$ crece hasta $\pi$ y, al cruzar el corte (rojo), salta a $-\pi$: por eso $\operatorname{Log} z$ no es continua ahí, y ninguna rama del logaritmo puede serlo en un dominio que rodee al origen.` }],
    "c3-derivada": [{ viz: conforme, caption: R`Un cuadradito alrededor de $z_0$ (gris) y su imagen por $f(z) = z^2$ (violeta). La imagen es casi el mismo cuadrado, estirado en $|f'(z_0)|$ y girado en $\arg f'(z_0)$: los ángulos rectos se conservan. Llevá $z_0$ al origen, donde $f' = 0$, y mirá cómo se rompe.` }],
    "c3-taylor": [{ viz: taylor, caption: R`Gris: $\frac{1}{1 + x^2}$; violeta: la suma parcial de su serie de Maclaurin. Dentro de $|x| < 1$ (franja verde) la serie se le pega; afuera, se dispara, aunque la función sea perfectamente suave. El motivo está fuera de la recta: los polos $\pm i$, a distancia 1.` }],
    "c3-residuo": [{ viz: residuos, caption: R`Mové el contorno: la integral solo cambia cuando un polo entra o sale (verde: adentro; rojo: afuera). Mientras no se cruce ninguno, deformar el contorno no cambia nada.` }],
    "c3-impropias-residuos": [{ viz: semicirculo, caption: R`El contorno para $\int_{-\infty}^{\infty}\frac{dx}{x^2 + 1}$. La integral sobre el contorno cerrado vale siempre $\pi$ (el polo $i$ está adentro). Al crecer $R$, la cota de la parte curva tiende a $0$ y la integral sobre el segmento tiende a $\pi$.` }],
    "c3-argumento": [{ viz: vueltas, caption: R`La curva violeta es la imagen de la circunferencia $|z| = R$ por $f$. Cada vez que $R$ pasa por el módulo de un cero ($0$, $1$ y $1{,}5$), la curva cruza el origen y gana una vuelta: la cantidad de vueltas es la cantidad de ceros encerrados.` }]
  });
})();
