/* ===== M104 · Figuras interactivas de los apuntes =====
   Se agregan al final de «La idea» de cada ficha (E.addFigures). Todas son en el plano, con matrices de 2 × 2,
   para ver la geometría que después se generaliza a ℝⁿ. */
(function () {
  const E = window.Efecen, R = String.raw;
  const nf = (x, d = 2) => String(+x.toFixed(d)).replace(".", "{,}").replace(/^-0$/, "0");
  const vec = (v, d = 2) => `(${nf(v[0], d)};\\ ${nf(v[1], d)})`;
  const mat = (a, b, c, d) => `\\begin{pmatrix} ${nf(a, 1)} & ${nf(b, 1)} \\\\ ${nf(c, 1)} & ${nf(d, 1)} \\end{pmatrix}`;
  const rad = d => d * Math.PI / 180;

  // combinación lineal a·u + b·v (regla del paralelogramo)
  const combinacion = {
    xr: [-5, 5], yr: [-4, 4], equal: true, h: 250,
    sliders: [{ k: "a", label: R`a`, min: -2, max: 2, step: 0.05, v: 1.5 }, { k: "b", label: R`b`, min: -2, max: 2, step: 0.05, v: 1 }],
    draw(g, p) {
      const u = [2, 0.5], v = [0.5, 1.5], au = u.map(c => p.a * c), bv = v.map(c => p.b * c), w = [au[0] + bv[0], au[1] + bv[1]];
      g.grid(1, 1); g.axes();
      g.line(au[0], au[1], w[0], w[1], { c: "muted", dash: true, w: 1.5 }); g.line(bv[0], bv[1], w[0], w[1], { c: "muted", dash: true, w: 1.5 });
      g.arrow(0, 0, u[0], u[1], { c: "line", w: 2 }); g.arrow(0, 0, v[0], v[1], { c: "line", w: 2 });
      g.arrow(0, 0, au[0], au[1], { c: "f" }); g.arrow(0, 0, bv[0], bv[1], { c: "ok" }); g.arrow(0, 0, w[0], w[1], { c: "p", w: 3 });
      return `a\\vec u + b\\vec v = ${nf(p.a)}\\,(2;\\ 0{,}5) ${p.b < 0 ? "-" : "+"} ${nf(Math.abs(p.b))}\\,(0{,}5;\\ 1{,}5) = ${vec(w)}`;
    }
  };

  // producto escalar y proyección
  const escalar = {
    xr: [-4, 4], yr: [-2.5, 3.5], equal: true, h: 240,
    sliders: [{ k: "th", label: R`\theta\ (°)`, min: 0, max: 180, step: 1, v: 50 }, { k: "m", label: R`\|\vec u\|`, min: 0.5, max: 3, step: 0.05, v: 2.5 }],
    draw(g, p) {
      const v = [3, 0], u = [p.m * Math.cos(rad(p.th)), p.m * Math.sin(rad(p.th))], dot = u[0] * v[0] + u[1] * v[1], pr = dot / 9;
      g.grid(1, 1); g.axes();
      g.line(u[0], u[1], pr * v[0], 0, { c: "muted", dash: true, w: 1.5 });
      g.arrow(0, 0, v[0], v[1], { c: "ok" }); g.arrow(0, 0, u[0], u[1], { c: "p" });
      g.arrow(0, 0.04, pr * v[0], 0.04, { c: "f", w: 4 });
      return `\\vec u\\cdot\\vec v = \\|\\vec u\\|\\,\\|\\vec v\\|\\cos\\theta = ${nf(dot)}\\qquad \\text{${Math.abs(dot) < 0.02 ? "son ortogonales" : dot > 0 ? "ángulo agudo: proyección hacia adelante" : "ángulo obtuso: proyección hacia atrás"}}`;
    }
  };

  // determinante: área orientada del paralelogramo de las columnas
  const determinante = {
    xr: [-3.5, 3.5], yr: [-3, 3], equal: true, h: 250,
    sliders: [{ k: "a", label: R`a_{11}`, min: -2, max: 2, step: 0.1, v: 2 }, { k: "c", label: R`a_{21}`, min: -2, max: 2, step: 0.1, v: 0.5 }, { k: "b", label: R`a_{12}`, min: -2, max: 2, step: 0.1, v: 0.6 }, { k: "d", label: R`a_{22}`, min: -2, max: 2, step: 0.1, v: 1.5 }],
    draw(g, p) {
      const c1 = [p.a, p.c], c2 = [p.b, p.d], det = p.a * p.d - p.b * p.c;
      g.grid(1, 1); g.axes();
      g.poly([[0, 0], c1, [c1[0] + c2[0], c1[1] + c2[1]], c2], { c: det >= 0 ? "p" : "bad", fill: det >= 0 ? "p" : "bad", alpha: 0.2, w: 1.5 });
      g.arrow(0, 0, c1[0], c1[1], { c: "f" }); g.arrow(0, 0, c2[0], c2[1], { c: "ok" });
      return `\\det ${mat(p.a, p.b, p.c, p.d)} = ${nf(det)}\\qquad \\text{${Math.abs(det) < 0.005 ? "columnas paralelas: área nula, no invertible" : det > 0 ? "conserva la orientación" : "invierte la orientación"}}`;
    }
  };

  // una transformación lineal deforma la cuadrícula
  const transformacion = {
    xr: [-4, 4], yr: [-3.5, 3.5], equal: true, h: 260,
    sliders: [{ k: "a", label: R`a`, min: -2, max: 2, step: 0.1, v: 1 }, { k: "b", label: R`b`, min: -2, max: 2, step: 0.1, v: 0.8 }, { k: "c", label: R`c`, min: -2, max: 2, step: 0.1, v: 0 }, { k: "d", label: R`d`, min: -2, max: 2, step: 0.1, v: 1 }, { k: "s", label: R`\text{de la identidad a } A`, min: 0, max: 1, step: 0.01, v: 1 }],
    play: { k: "s", max: 1, speed: 0.5 },
    draw(g, p) {
      // se interpola entre la identidad y A para ver cómo se deforma el plano
      const A = [1 + p.s * (p.a - 1), p.s * p.b, p.s * p.c, 1 + p.s * (p.d - 1)], T = (x, y) => [A[0] * x + A[1] * y, A[2] * x + A[3] * y];
      for (let k = -3; k <= 3; k++) { g.line(...T(k, -3), ...T(k, 3), { c: "line", w: 1.5 }); g.line(...T(-3, k), ...T(3, k), { c: "line", w: 1.5 }); }
      g.poly([T(0, 0), T(1, 0), T(1, 1), T(0, 1)], { c: "p", fill: "p", alpha: 0.2, w: 1.5 });
      g.curve(Array.from({ length: 73 }, (_, i) => T(Math.cos(i * Math.PI / 36), Math.sin(i * Math.PI / 36))), { c: "gold", w: 2 });
      g.arrow(0, 0, ...T(1, 0), { c: "f" }); g.arrow(0, 0, ...T(0, 1), { c: "ok" });
      return `A = ${mat(p.a, p.b, p.c, p.d)}\\qquad A\\vec e_1 = (a;\\ c),\\ A\\vec e_2 = (b;\\ d)\\qquad \\text{las áreas se multiplican por } |\\det A| = ${nf(Math.abs(p.a * p.d - p.b * p.c))}`;
    }
  };

  // sistemas de dos ecuaciones: dos rectas que se cortan, son paralelas o coinciden
  const sistema = {
    xr: [-5, 5], yr: [-4, 4], equal: true, h: 240,
    sliders: [{ k: "m", label: R`\text{pendiente de la segunda}`, min: -2, max: 2, step: 0.05, v: -0.5 }, { k: "q", label: R`\text{ordenada de la segunda}`, min: -3, max: 3, step: 0.05, v: 2 }],
    draw(g, p) {
      // 1.ª: y = 0,5x + 1; 2.ª: y = m x + q
      const m1 = 0.5, q1 = 1;
      g.grid(1, 1); g.axes();
      g.fn(x => m1 * x + q1, { c: "p" }); g.fn(x => p.m * x + p.q, { c: "f" });
      let txt;
      if (Math.abs(p.m - m1) < 1e-9) txt = Math.abs(p.q - q1) < 1e-9 ? "rectas coincidentes: compatible indeterminado (infinitas soluciones)" : "rectas paralelas: incompatible (sin solución)";
      else { const x = (q1 - p.q) / (p.m - m1), y = m1 * x + q1; g.dot(x, y, { c: "ink" }); txt = `se cortan en ${"(" + nf(x) + "; " + nf(y) + ")"}: compatible determinado`.replace(/\{,\}/g, ","); }
      return `\\text{${txt}}`;
    }
  };

  // autovectores: A·x es paralelo a x solo en ciertas direcciones
  const autovectores = {
    xr: [-4, 4], yr: [-3.5, 3.5], equal: true, h: 260,
    sliders: [{ k: "t", label: R`\text{ángulo de } \vec x\ (°)`, min: 0, max: 360, step: 0.5, v: 20 }],
    play: { k: "t", max: 360, speed: 30, loop: true },
    draw(g, p) {
      const A = [2, 1, 1, 2], x = [Math.cos(rad(p.t)), Math.sin(rad(p.t))], Ax = [A[0] * x[0] + A[1] * x[1], A[2] * x[0] + A[3] * x[1]];
      g.grid(1, 1); g.axes();
      g.line(-4, -4, 4, 4, { c: "muted", dash: true, w: 1.5 }); g.line(-4, 4, 4, -4, { c: "muted", dash: true, w: 1.5 });
      g.circle(0, 0, 1, { c: "line", w: 1 });
      g.arrow(0, 0, x[0], x[1], { c: "p" }); g.arrow(0, 0, Ax[0], Ax[1], { c: "f" });
      const cr = x[0] * Ax[1] - x[1] * Ax[0], par = Math.abs(cr) < 0.03;
      return `A = ${mat(2, 1, 1, 2)}\\qquad ${par ? `\\text{¡autovector! } A\\vec x = ${nf((x[0] * Ax[0] + x[1] * Ax[1]), 1)}\\,\\vec x` : `A\\vec x \\text{ no es paralelo a } \\vec x`}\\qquad \\lambda_1 = 3,\\ \\lambda_2 = 1`;
    }
  };

  // potencias de A: la dirección de Aⁿx tiende al autovector dominante
  const potencias = {
    xr: [-1.3, 1.3], yr: [-1.3, 1.3], equal: true, h: 240,
    sliders: [{ k: "t", label: R`\text{ángulo inicial } (°)`, min: 0, max: 180, step: 1, v: 150 }, { k: "n", label: R`n`, min: 0, max: 8, step: 1, v: 3 }],
    play: { k: "n", max: 8, speed: 1.5 },
    draw(g, p) {
      const A = [1.5, 0.5, 0.5, 1.5];
      let x = [Math.cos(rad(p.t)), Math.sin(rad(p.t))];
      g.grid(0.5, 0.5); g.axes(); g.circle(0, 0, 1, { c: "line", w: 1 });
      g.line(-1.3, -1.3, 1.3, 1.3, { c: "muted", dash: true, w: 1.5 });
      for (let k = 0; k <= Math.round(p.n); k++) {
        const m = Math.hypot(...x) || 1, u = x.map(c => c / m);
        g.arrow(0, 0, u[0], u[1], { c: k === Math.round(p.n) ? "p" : "line", w: k === Math.round(p.n) ? 3 : 1.5 });
        x = [A[0] * x[0] + A[1] * x[1], A[2] * x[0] + A[3] * x[1]];
      }
      return `A = ${mat(1.5, 0.5, 0.5, 1.5)},\\ \\lambda = 2 \\text{ y } 1\\qquad \\frac{A^n\\vec x}{\\|A^n\\vec x\\|} \\to \\text{autovector de } \\lambda = 2`;
    }
  };

  // Gram-Schmidt: a v₂ se le resta su proyección sobre u₁
  const gram = {
    xr: [-1, 4], yr: [-1, 3.2], equal: true, h: 240,
    sliders: [{ k: "th", label: R`\text{ángulo de } \vec v_2\ (°)`, min: 10, max: 170, step: 1, v: 40 }, { k: "s", label: R`\text{paso}`, min: 0, max: 1, step: 0.01, v: 1 }],
    play: { k: "s", max: 1, speed: 0.5 },
    draw(g, p) {
      const v1 = [3, 0.6], v2 = [2.4 * Math.cos(rad(p.th)), 2.4 * Math.sin(rad(p.th))], k = (v2[0] * v1[0] + v2[1] * v1[1]) / (v1[0] ** 2 + v1[1] ** 2), pr = v1.map(c => k * c);
      const u2 = [v2[0] - p.s * pr[0], v2[1] - p.s * pr[1]];
      g.grid(1, 1); g.axes();
      g.line(-1, -0.2, 4, 0.8, { c: "line", w: 1 });
      g.arrow(0, 0, v1[0], v1[1], { c: "ok" }); g.arrow(0, 0, v2[0], v2[1], { c: "line", w: 2 });
      g.arrow(0, 0, pr[0], pr[1], { c: "gold", w: 2 }); g.line(v2[0], v2[1], pr[0], pr[1], { c: "muted", dash: true, w: 1.5 });
      g.arrow(0, 0, u2[0], u2[1], { c: "p", w: 3 });
      const dot = u2[0] * v1[0] + u2[1] * v1[1];
      return `\\vec u_2 = \\vec v_2 - ${nf(p.s)}\\,\\text{proy}_{\\vec v_1}\\vec v_2\\qquad \\vec u_2\\cdot\\vec v_1 = ${nf(dot)}`;
    }
  };

  E.addFigures("m104", {
    "al-vectores": [{ viz: combinacion, caption: R`Gris: $\vec u$ y $\vec v$. Naranja: $a\vec u$; verde: $b\vec v$; violeta: su suma, la diagonal del paralelogramo. Moviendo $a$ y $b$ se llega a cualquier punto del plano: $\vec u$ y $\vec v$ lo generan.` }],
    "al-producto-escalar": [{ viz: escalar, caption: R`Violeta: $\vec u$; verde: $\vec v$; naranja: la proyección de $\vec u$ sobre $\vec v$. El producto escalar es positivo con ángulo agudo, cero a $90°$ y negativo con ángulo obtuso.` }],
    "al-determinante": [{ viz: determinante, caption: R`El paralelogramo que forman las columnas tiene área $|\det A|$. Si se vuelve rojo, el determinante es negativo: la matriz da vuelta la orientación. Si se aplasta, $\det A = 0$.` }],
    "al-transformacion": [{ viz: transformacion, caption: R`Con «Reproducir», el plano pasa de la identidad a $A$. Las rectas siguen siendo rectas y paralelas, el origen queda fijo, y las columnas de $A$ son las imágenes de $\vec e_1$ (naranja) y $\vec e_2$ (verde). La circunferencia se vuelve una elipse.` }],
    "al-sistemas": [{ viz: sistema, caption: R`Cada ecuación de un sistema de $2\times2$ es una recta. Hay solución única si se cortan, ninguna si son paralelas e infinitas si coinciden (probá pendiente $0{,}5$ y ordenada $1$).` }],
    "al-autovalores": [{ viz: autovectores, caption: R`Violeta: $\vec x$, que da vueltas; naranja: $A\vec x$. Casi siempre apuntan a lados distintos, salvo sobre las diagonales punteadas: ahí $A\vec x = \lambda\vec x$ y $\vec x$ es un autovector.` }],
    "al-diagonalizacion": [{ viz: potencias, caption: R`Aplicando $A$ una y otra vez, la dirección de $A^n\vec x$ se acerca al autovector del autovalor más grande: la componente según ese autovector crece como $2^n$ y la otra queda igual.` }],
    "al-gram-schmidt": [{ viz: gram, caption: R`Verde: $\vec v_1 = \vec u_1$. Dorada: la proyección de $\vec v_2$ sobre $\vec v_1$. Al restarla (violeta) queda $\vec u_2$, perpendicular a $\vec u_1$: el producto escalar llega a cero.` }]
  });
})();
