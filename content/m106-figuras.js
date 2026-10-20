/* ===== M106 · Figuras interactivas de los apuntes =====
   Se agregan al final de «La idea» de cada ficha (E.addFigures). Son de geometría plana: cónicas, sus definiciones
   métricas, traslaciones y rotaciones de ejes. */
(function () {
  const E = window.Efecen, R = String.raw;
  const nf = (x, d = 2) => String(+x.toFixed(d)).replace(".", "{,}").replace(/^-0$/, "0");
  const rad = d => d * Math.PI / 180;
  const sg = x => (x < 0 ? "-" : "+");

  // definición por foco y directriz: PF = e·d(P, directriz)
  const focoDirectriz = {
    xr: [-5, 6], yr: [-4, 4], equal: true, h: 250,
    sliders: [{ k: "e", label: R`e`, min: 0.2, max: 2, step: 0.01, v: 0.7 }, { k: "t", label: R`\theta\ (°)`, min: 0, max: 360, step: 0.5, v: 60 }],
    play: { k: "t", max: 360, speed: 40, loop: true },
    draw(g, p) {
      // foco en el origen, directriz x = 2: r = e·p / (1 + e·cos θ), con p = 2
      const pd = 2, r = th => p.e * pd / (1 + p.e * Math.cos(th));
      g.grid(1, 1); g.axes(); g.line(pd, -4, pd, 4, { c: "ink", w: 2 });
      let seg = [];
      for (let i = 0; i <= 720; i++) {
        const th = 2 * Math.PI * i / 720, rr = r(th);
        if (!(rr > 0 && rr < 40)) { if (seg.length > 1) g.curve(seg, { c: "p" }); seg = []; continue; }
        seg.push([rr * Math.cos(th), rr * Math.sin(th)]);
      }
      if (seg.length > 1) g.curve(seg, { c: "p" });
      g.dot(0, 0, { c: "f", r: 5 });
      const th = rad(p.t), rr = r(th);
      if (rr > 0 && rr < 40) {
        const P = [rr * Math.cos(th), rr * Math.sin(th)];
        g.line(0, 0, P[0], P[1], { c: "f", w: 2 }); g.line(P[0], P[1], pd, P[1], { c: "ok", w: 2 }); g.dot(P[0], P[1], { c: "ink" });
        return `\\frac{PF}{d(P, \\text{directriz})} = \\frac{${nf(rr)}}{${nf(Math.abs(pd - P[0]))}} = e = ${nf(p.e)}\\qquad \\text{${p.e < 0.995 ? "elipse" : p.e < 1.005 ? "parábola" : "hipérbola"}}`;
      }
      return `e = ${nf(p.e)}\\qquad \\text{${p.e < 0.995 ? "elipse" : p.e < 1.005 ? "parábola" : "hipérbola: en esa dirección el punto no existe"}}`;
    }
  };

  // elipse: la suma de distancias a los focos es 2a
  const elipse = {
    xr: [-5, 5], yr: [-3.5, 3.5], equal: true, h: 240,
    sliders: [{ k: "a", label: R`a`, min: 1.5, max: 4.5, step: 0.05, v: 4 }, { k: "b", label: R`b`, min: 0.5, max: 3, step: 0.05, v: 2.5 }, { k: "t", label: R`t`, min: 0, max: 6.283, step: 0.01, v: 1 }],
    play: { k: "t", max: 6.283, speed: 1, loop: true },
    draw(g, p) {
      const a = Math.max(p.a, p.b), b = Math.min(p.a, p.b), c = Math.sqrt(a * a - b * b), hor = p.a >= p.b;
      const P = [p.a * Math.cos(p.t), p.b * Math.sin(p.t)], F1 = hor ? [-c, 0] : [0, -c], F2 = hor ? [c, 0] : [0, c];
      g.grid(1, 1); g.axes();
      g.curve(Array.from({ length: 201 }, (_, i) => [p.a * Math.cos(2 * Math.PI * i / 200), p.b * Math.sin(2 * Math.PI * i / 200)]), { c: "p" });
      g.line(F1[0], F1[1], P[0], P[1], { c: "f", w: 2 }); g.line(F2[0], F2[1], P[0], P[1], { c: "ok", w: 2 });
      g.dot(F1[0], F1[1], { c: "ink", r: 4 }); g.dot(F2[0], F2[1], { c: "ink", r: 4 }); g.dot(P[0], P[1], { c: "ink" });
      const d1 = Math.hypot(P[0] - F1[0], P[1] - F1[1]), d2 = Math.hypot(P[0] - F2[0], P[1] - F2[1]);
      return `PF_1 + PF_2 = ${nf(d1)} + ${nf(d2)} = ${nf(d1 + d2)} = 2a\\qquad c = \\sqrt{a^2 - b^2} = ${nf(c)},\\ e = ${nf(c / a)}`;
    }
  };

  // hipérbola: la diferencia de distancias es 2a; asíntotas y = ±(b/a)x
  const hiperbola = {
    xr: [-6, 6], yr: [-4, 4], equal: true, h: 240,
    sliders: [{ k: "a", label: R`a`, min: 0.5, max: 3, step: 0.05, v: 1.5 }, { k: "b", label: R`b`, min: 0.5, max: 3, step: 0.05, v: 1 }, { k: "t", label: R`t`, min: -2, max: 2, step: 0.01, v: 0.8 }],
    play: { k: "t", max: 2, speed: 0.8, loop: true },
    draw(g, p) {
      const c = Math.hypot(p.a, p.b), br = s => [p.a * Math.cosh(s), p.b * Math.sinh(s)];
      g.grid(1, 1); g.axes();
      g.line(-6, -6 * p.b / p.a, 6, 6 * p.b / p.a, { c: "muted", dash: true, w: 1.5 }); g.line(-6, 6 * p.b / p.a, 6, -6 * p.b / p.a, { c: "muted", dash: true, w: 1.5 });
      const pts = Array.from({ length: 161 }, (_, i) => br(-2.5 + 5 * i / 160));
      g.curve(pts, { c: "p" }); g.curve(pts.map(([x, y]) => [-x, y]), { c: "p" });
      const P = br(p.t);
      g.line(-c, 0, P[0], P[1], { c: "f", w: 2 }); g.line(c, 0, P[0], P[1], { c: "ok", w: 2 });
      g.dot(-c, 0, { c: "ink", r: 4 }); g.dot(c, 0, { c: "ink", r: 4 }); g.dot(P[0], P[1], { c: "ink" });
      const d1 = Math.hypot(P[0] + c, P[1]), d2 = Math.hypot(P[0] - c, P[1]);
      return `|PF_1 - PF_2| = |${nf(d1)} - ${nf(d2)}| = ${nf(Math.abs(d1 - d2))} = 2a\\qquad \\text{asíntotas } y = \\pm\\frac ba x`;
    }
  };

  // parábola: equidistante del foco y de la directriz; propiedad de reflexión
  const parabola = {
    xr: [-4, 4], yr: [-1.5, 5], equal: true, h: 250,
    sliders: [{ k: "p", label: R`p`, min: 0.3, max: 2, step: 0.05, v: 0.8 }, { k: "x", label: R`x_P`, min: -3.5, max: 3.5, step: 0.05, v: 2 }],
    draw(g, p) {
      // x² = 4p·y: foco (0, p), directriz y = −p
      const f = x => x * x / (4 * p.p), P = [p.x, f(p.x)];
      g.grid(1, 1); g.axes(); g.line(-4, -p.p, 4, -p.p, { c: "ink", w: 2 });
      g.fn(f, { c: "p" }); g.dot(0, p.p, { c: "f", r: 5 });
      g.line(P[0], P[1], 0, p.p, { c: "f", w: 2 }); g.line(P[0], P[1], P[0], -p.p, { c: "ok", w: 2 });
      // un rayo que baja vertical se refleja hacia el foco
      g.arrow(P[0], 5, P[0], P[1] + 0.05, { c: "gold", w: 1.5 });
      g.dot(P[0], P[1], { c: "ink" });
      return `PF = ${nf(Math.hypot(P[0], P[1] - p.p))} = d(P, \\text{directriz}) = ${nf(P[1] + p.p)}\\qquad x^2 = 4py`;
    }
  };

  // traslación de ejes: la misma elipse con centro (h, k)
  const traslacion = {
    xr: [-6, 6], yr: [-4.5, 4.5], equal: true, h: 240,
    sliders: [{ k: "h", label: R`h`, min: -3, max: 3, step: 0.1, v: 1.5 }, { k: "k", label: R`k`, min: -2, max: 2, step: 0.1, v: -1 }],
    draw(g, p) {
      const a = 2.5, b = 1.5;
      g.grid(1, 1); g.axes();
      g.line(p.h, -4.5, p.h, 4.5, { c: "f", dash: true, w: 1.5 }); g.line(-6, p.k, 6, p.k, { c: "f", dash: true, w: 1.5 });
      g.curve(Array.from({ length: 201 }, (_, i) => [a * Math.cos(2 * Math.PI * i / 200), b * Math.sin(2 * Math.PI * i / 200)]), { c: "line", w: 1.5 });
      g.curve(Array.from({ length: 201 }, (_, i) => [p.h + a * Math.cos(2 * Math.PI * i / 200), p.k + b * Math.sin(2 * Math.PI * i / 200)]), { c: "p" });
      g.dot(p.h, p.k, { c: "f", r: 4 });
      const X = p.h === 0 ? "x" : `x ${sg(-p.h)} ${nf(Math.abs(p.h), 1)}`, Y = p.k === 0 ? "y" : `y ${sg(-p.k)} ${nf(Math.abs(p.k), 1)}`;
      return `\\frac{(${X})^2}{6{,}25} + \\frac{(${Y})^2}{2{,}25} = 1\\qquad x' = x - h,\\ y' = y - k`;
    }
  };

  // rotación de ejes: Ax² + Bxy + Cy² = 1
  const rotacion = {
    xr: [-3, 3], yr: [-2.5, 2.5], equal: true, h: 250,
    sliders: [{ k: "A", label: R`A`, min: -1, max: 2, step: 0.05, v: 1 }, { k: "B", label: R`B`, min: -2, max: 2, step: 0.05, v: 1 }, { k: "C", label: R`C`, min: -1, max: 2, step: 0.05, v: 1 }],
    draw(g, p) {
      // ángulo que elimina el término cruzado y autovalores de la forma cuadrática
      const th = Math.abs(p.A - p.C) < 1e-12 ? (Math.abs(p.B) < 1e-12 ? 0 : Math.PI / 4) : 0.5 * Math.atan2(p.B, p.A - p.C);
      const m = (p.A + p.C) / 2, rr = Math.hypot((p.A - p.C) / 2, p.B / 2), l1 = m + rr, l2 = m - rr;
      g.grid(1, 1); g.axes();
      const u = [Math.cos(th), Math.sin(th)], v = [-Math.sin(th), Math.cos(th)];
      g.line(-3 * u[0], -3 * u[1], 3 * u[0], 3 * u[1], { c: "f", dash: true, w: 1.5 }); g.line(-3 * v[0], -3 * v[1], 3 * v[0], 3 * v[1], { c: "f", dash: true, w: 1.5 });
      // en los ejes rotados: λ₁x'² + λ₂y'² = 1
      let seg = [];
      for (let i = 0; i <= 400; i++) {
        const t = 2 * Math.PI * i / 400, c = Math.cos(t), sn = Math.sin(t), q = l1 * c * c + l2 * sn * sn, r0 = q > 1e-3 ? 1 / Math.sqrt(q) : Infinity;
        if (r0 < 8) seg.push([r0 * (c * u[0] + sn * v[0]), r0 * (c * u[1] + sn * v[1])]);
        else { if (seg.length > 1) g.curve(seg, { c: "p" }); seg = []; }
      }
      if (seg.length > 1) g.curve(seg, { c: "p" });
      const D = p.B * p.B - 4 * p.A * p.C, kind = l1 > 0 && l2 > 0 ? "elipse" : l1 > 0 && l2 < 0 ? "hipérbola" : l1 > 0 ? "par de rectas paralelas" : "no hay puntos reales";
      return `\\theta = \\tfrac12\\arctan\\frac{B}{A - C} = ${nf(th * 180 / Math.PI, 1)}°\\qquad ${nf(l1)}\\,x'^2 ${sg(l2)} ${nf(Math.abs(l2))}\\,y'^2 = 1\\qquad B^2 - 4AC = ${nf(D)}:\\ \\text{${kind}}`;
    }
  };

  // recta tangente a una elipse en un punto
  const tangente = {
    xr: [-5, 5], yr: [-3.5, 3.5], equal: true, h: 240,
    sliders: [{ k: "t", label: R`\text{punto de tangencia } (°)`, min: 0, max: 360, step: 0.5, v: 40 }],
    play: { k: "t", max: 360, speed: 30, loop: true },
    draw(g, p) {
      const a = 4, b = 2.5, t = rad(p.t), x0 = a * Math.cos(t), y0 = b * Math.sin(t), c = Math.sqrt(a * a - b * b);
      g.grid(1, 1); g.axes();
      g.curve(Array.from({ length: 201 }, (_, i) => [a * Math.cos(2 * Math.PI * i / 200), b * Math.sin(2 * Math.PI * i / 200)]), { c: "p" });
      // recta x·x₀/a² + y·y₀/b² = 1, en forma paramétrica con dirección (−a sen t, b cos t)
      const d = [-a * Math.sin(t), b * Math.cos(t)], s = 3 / Math.hypot(...d);
      g.line(x0 - s * d[0], y0 - s * d[1], x0 + s * d[0], y0 + s * d[1], { c: "f", w: 2 });
      // propiedad focal: forma ángulos iguales con las rectas a los focos
      g.line(-c, 0, x0, y0, { c: "line", w: 1.5 }); g.line(c, 0, x0, y0, { c: "line", w: 1.5 });
      g.dot(-c, 0, { c: "ink", r: 3 }); g.dot(c, 0, { c: "ink", r: 3 }); g.dot(x0, y0, { c: "ink" });
      return `\\frac{x\\,x_0}{a^2} + \\frac{y\\,y_0}{b^2} = 1\\quad (x_0;\\ y_0) = (${nf(x0)};\\ ${nf(y0)})\\qquad \\text{ángulos iguales con los dos focos}`;
    }
  };

  E.addFigures("m106", {
    "ga-conica-def": [{ viz: focoDirectriz, caption: R`Foco (naranja) en el origen y directriz $x = 2$. Para cada punto, el cociente entre la distancia al foco (naranja) y a la directriz (verde) es la excentricidad $e$: menor que $1$ da una elipse, igual a $1$ una parábola y mayor que $1$ una hipérbola.` }],
    "ga-elipse": [{ viz: elipse, caption: R`Aunque el punto se mueve, la suma de las distancias a los dos focos (naranja + verde) es siempre $2a$: así se dibuja una elipse con un hilo y dos clavos.` }],
    "ga-hiperbola": [{ viz: hiperbola, caption: R`En la hipérbola lo que se mantiene es la diferencia de distancias a los focos, $2a$. Lejos del centro, la curva se pega a las asíntotas punteadas.` }],
    "ga-parabola": [{ viz: parabola, caption: R`Cada punto de la parábola está a la misma distancia del foco (naranja) que de la directriz (verde). Por eso un rayo que baja paralelo al eje (dorado) se refleja hacia el foco: así funcionan las antenas parabólicas.` }],
    "ga-traslacion": [{ viz: traslacion, caption: R`Trasladar los ejes al punto $(h, k)$ es cambiar $x$ por $x - h$ e $y$ por $y - k$: la forma no cambia, solo se mueve el centro.` }],
    "ga-rotacion-ejes": [{ viz: rotacion, caption: R`El término $Bxy$ indica que los ejes de la cónica están girados. En los ejes punteados (girados $\theta$) la ecuación queda sin término cruzado, con los autovalores de la forma cuadrática como coeficientes.` }],
    "ga-tangente-conica": [{ viz: tangente, caption: R`La tangente a la elipse en $(x_0, y_0)$ se obtiene «desdoblando» la ecuación. Forma ángulos iguales con las rectas que van a los dos focos: un rayo que sale de un foco se refleja hacia el otro.` }]
  });
})();
