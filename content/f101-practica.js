/* ===== F101 · Escribir la expresión y paso a paso =====
   Se suman a lecciones que ya existen (E.addPractice). Los paso a paso separan el planteo en etapas (la normal,
   después el rozamiento, después la aceleración): si una etapa sale mal, se ve la correcta y se sigue con la próxima. */
(function () {
  const E = window.Efecen, H = E.H;
  const T = {}, g = 9.8;
  const dec = x => String(x).replace(".", "{,}");
  const rad = d => d * Math.PI / 180;
  // RK4 para un sistema y' = F(t, y), de 0 a t1 en n pasos
  const rk4 = (F, y0, t1, n = 400) => {
    const h = t1 / n, add = (a, b, k) => a.map((v, i) => v + b[i] * k);
    let y = y0.slice(), t = 0;
    for (let i = 0; i < n; i++) {
      const k1 = F(t, y), k2 = F(t + h / 2, add(y, k1, h / 2)), k3 = F(t + h / 2, add(y, k2, h / 2)), k4 = F(t + h, add(y, k3, h));
      y = y.map((v, j) => v + h * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]) / 6); t += h;
    }
    return y;
  };

  /* ---------- escribir la expresión ---------- */
  T["f1-cinem-expr"] = {
    type: "expr", concepts: ["f1-mruv"], difficulty: 1,
    generate(r) {
      const c3 = r.pick([0, 0, 1, -1, 2]), c2 = r.int(-4, 4), c1 = r.int(-10, 10), c0 = r.int(-20, 20), ask = r.pick(["v", "v", "a"]);
      if (c3 === 0 && c2 === 0) return null;
      const X = H.polyc([c3, c2, c1, c0], "t"), x = t => c3 * t ** 3 + c2 * t * t + c1 * t + c0;
      const [vP, vT] = H.terms([{ p: 3 * c3, ...H.pw(2, "t") }, { p: 2 * c2, ...H.pw(1, "t") }, { p: c1 }]);
      const [aP, aT] = H.terms([{ p: 6 * c3, ...H.pw(1, "t") }, { p: 2 * c2 }]);
      const dom = [[0, 5]];
      return {
        prompt: `La posición de una partícula sobre el eje $x$ es $x(t) = ${X}$ ($x$ en metros y $t$ en segundos). Escribí su ${ask === "v" ? "velocidad" : "aceleración"} en función del tiempo.`,
        lhs: ask === "v" ? "v(t) = " : "a(t) = ", answer: ask === "v" ? vP : aP, answerTex: ask === "v" ? vT : aT, vars: ["t"], domain: dom,
        traps: ask === "a" ? [{ expr: vP, msg: "Eso es la velocidad: la aceleración es su derivada, o sea, la derivada segunda de $x(t)$." }] : [],
        solution: [
          `La [[f1-mruv|velocidad]] es la derivada de la posición respecto del tiempo, ${ask === "v" ? "y se deriva término a término" : "y la aceleración es la derivada de la velocidad"}.`,
          `$v(t) = \\dfrac{dx}{dt} = ${vT}$ m/s`,
          ...(ask === "a" ? [`$a(t) = \\dfrac{dv}{dt} = ${aT}$ m/s²`] : [])
        ],
        verify: ask === "v" ? { kind: "derivOf", f: x, dom } : { kind: "fnEq", g: t => (x(t + 1e-3) - 2 * x(t) + x(t - 1e-3)) / 1e-6, dom, tol: 1e-4 }
      };
    }
  };
  T["f1-mas-expr"] = {
    type: "expr", concepts: ["f1-mas"], difficulty: 2,
    generate(r) {
      const A = r.pick([2, 3, 4, 5, 8, 10]), w = r.int(2, 6), fn = r.pick(["cos", "sin"]), ask = r.pick(["v", "a"]);
      const other = fn === "cos" ? "sin" : "cos", tx = f => `\\${f}(${w}t)`, px = f => `${f}(${w}*t)`;
      // derivar cos da −sen y derivar sen da cos
      const vc = fn === "cos" ? -A * w : A * w, ac = -A * w * w;
      const vP = `${vc}*${px(other)}`, vT = `${vc}${tx(other)}`, aP = `${ac}*${px(fn)}`, aT = `${ac}${tx(fn)}`;
      // simulación del oscilador x'' = −ω²x desde sus condiciones iniciales
      const y0 = fn === "cos" ? [A, 0] : [0, A * w];
      const sim = t => rk4((_, y) => [y[1], -w * w * y[0]], y0, t, 600);
      const dom = [[0.05, 3]];
      return {
        prompt: `Un oscilador armónico se mueve según $x(t) = ${A}${tx(fn)}$ ($x$ en cm y $t$ en s). Escribí su ${ask === "v" ? "velocidad $v(t)$, en cm/s" : "aceleración $a(t)$, en cm/s²"}.`,
        lhs: ask === "v" ? "v(t) = " : "a(t) = ", answer: ask === "v" ? vP : aP, answerTex: ask === "v" ? vT : aT, vars: ["t"], domain: dom,
        traps: ask === "a" ? [{ expr: vP, msg: "Eso es la velocidad: para la aceleración hay que derivar una vez más." }] : [],
        solution: [
          `En el [[f1-mas|MAS]], $v = \\dfrac{dx}{dt}$ y $a = \\dfrac{dv}{dt}$. Por la regla de la cadena, cada derivada saca un factor $\\omega = ${w}$ rad/s.`,
          `$v(t) = ${vT}$ cm/s`,
          ...(ask === "a" ? [`$a(t) = ${aT} = -\\omega^{2}x(t)$ cm/s²`] : [])
        ],
        verify: { kind: "fnEq", g: t => (ask === "v" ? sim(t)[1] : -w * w * sim(t)[0]), dom, tol: 1e-4 }
      };
    }
  };

  /* ---------- paso a paso ---------- */
  T["f1-plano-multi"] = {
    type: "multi", concepts: ["f1-rozamiento"], difficulty: 2,
    generate(r) {
      const m = r.pick([2, 3, 4, 5, 8, 10]), th = r.pick([30, 37, 45, 53, 60]), mu = r.pick([0.1, 0.15, 0.2, 0.25, 0.3]);
      const s = Math.sin(rad(th)), c = Math.cos(rad(th));
      const N = m * g * c, f = mu * N, a = g * (s - mu * c);
      // verificación con vectores en ejes fijos: el plano sube con dirección û = (cos θ, sen θ) y su normal es n̂ = (−sen θ, cos θ)
      const W = [0, -m * g], u = [c, s], n = [-s, c], dot = (p, q) => p[0] * q[0] + p[1] * q[1];
      const Nv = -dot(W, n), Fx = W[0] + Nv * n[0] + mu * Nv * u[0], Fy = W[1] + Nv * n[1] + mu * Nv * u[1];
      return {
        prompt: `Un bloque de $${m}$ kg baja deslizando por un plano inclinado $${th}^\\circ$ sobre la horizontal, con coeficiente de rozamiento dinámico $\\mu_d = ${dec(mu)}$. ($g = 9{,}8$ m/s²)`,
        parts: [
          { q: "¿Cuánto vale la fuerza normal (en N)?", type: "numeric", answer: N,
            traps: [{ value: m * g, msg: "En un plano inclinado la normal no es el peso: equilibra solo la componente del peso perpendicular al plano, $N = mg\\cos\\theta$." }],
            verify: { kind: "value", fn: () => Nv } },
          { q: "¿Y la fuerza de rozamiento (en N)?", type: "numeric", answer: f,
            traps: [{ value: mu * m * g, msg: "El rozamiento es $\\mu_d N$, con la normal del plano inclinado, no con el peso." }],
            verify: { kind: "value", fn: () => mu * Nv } },
          { q: "¿Con qué aceleración baja (en m/s²)?", type: "numeric", answer: a,
            traps: [{ value: g * s, msg: "Te faltó el rozamiento: además de $mg\\sin\\theta$, a lo largo del plano actúa $f = \\mu_d N$ en contra del movimiento." },
              { value: g * (s + mu * c), msg: "El rozamiento se opone al movimiento: como el bloque baja, apunta hacia arriba del plano y se resta." }],
            verify: { kind: "ode", f: (_, y) => [y[2], y[3], Fx / m, Fy / m], y0: [0, 0, 0, 0], t1: 1, dt: 1e-3, out: (_, y) => 2 * Math.hypot(y[0], y[1]) } }
        ],
        solution: [
          `[[f1-rozamiento|Plano inclinado]]: se toman ejes a lo largo del plano y perpendicular a él. En la dirección perpendicular no hay aceleración, así que $N = mg\\cos\\theta = ${m}\\cdot 9{,}8\\cdot\\cos ${th}^\\circ \\approx ${H.num(N, 2)}$ N.`,
          `El rozamiento dinámico vale $f = \\mu_d N = ${dec(mu)}\\cdot ${H.num(N, 2)} \\approx ${H.num(f, 2)}$ N y apunta hacia arriba del plano, porque el bloque baja.`,
          `A lo largo del plano: $ma = mg\\sin\\theta - f$, así que $a = g(\\sin\\theta - \\mu_d\\cos\\theta) \\approx ${H.num(a, 2)}$ m/s².`
        ]
      };
    }
  };
  T["f1-tiro-multi"] = {
    type: "multi", concepts: ["f1-proyectiles"], difficulty: 2,
    generate(r) {
      const v0 = r.int(10, 30), th = r.pick([30, 37, 45, 53, 60]), s = Math.sin(rad(th)), c = Math.cos(rad(th));
      const Tv = 2 * v0 * s / g, R = v0 * v0 * Math.sin(2 * rad(th)) / g, Hm = (v0 * s) ** 2 / (2 * g);
      const fall = (_, y) => [y[2], y[3], 0, -g], y0 = [0, 0, v0 * c, v0 * s];
      const land = { kind: "ode", f: fall, y0, t1: 0, until: (_, y) => y[1] < 0, g: (_, y) => y[1], dt: 1e-3 };
      return {
        prompt: `Desde el suelo se lanza una pelota a $${v0}$ m/s, formando $${th}^\\circ$ con la horizontal. Despreciá el rozamiento con el aire. ($g = 9{,}8$ m/s²)`,
        parts: [
          { q: "¿Cuánto tiempo está en el aire (en s)?", type: "numeric", answer: Tv,
            traps: [{ value: Tv / 2, msg: "Ese es el tiempo hasta la altura máxima: el tiempo de vuelo es el doble, porque tarda lo mismo en subir que en bajar." }],
            verify: Object.assign({ out: t => t }, land) },
          { q: "¿A qué distancia del punto de lanzamiento cae (en m)?", type: "numeric", answer: R, verify: Object.assign({ out: (_, y) => y[0] }, land) },
          { q: "¿Qué altura máxima alcanza (en m)?", type: "numeric", answer: Hm,
            verify: { kind: "ode", f: fall, y0, t1: 0, until: (_, y) => y[3] <= 0, g: (_, y) => y[3], dt: 1e-3, out: (_, y) => y[1] } }
        ],
        solution: [
          `[[f1-proyectiles|Tiro oblicuo]]: $v_{0x} = v_0\\cos\\theta \\approx ${H.num(v0 * c, 2)}$ m/s y $v_{0y} = v_0\\sin\\theta \\approx ${H.num(v0 * s, 2)}$ m/s.`,
          `Vuelve al suelo cuando $y = v_{0y}t - \\frac12 g t^{2} = 0$, o sea en $t_v = \\dfrac{2v_{0y}}{g} \\approx ${H.num(Tv, 2)}$ s.`,
          `En horizontal la velocidad es constante: $x = v_{0x}\\,t_v \\approx ${H.num(R, 2)}$ m.`,
          `En la altura máxima $v_y = 0$: $h = \\dfrac{v_{0y}^{2}}{2g} \\approx ${H.num(Hm, 2)}$ m.`
        ]
      };
    }
  };
  T["f1-choque-multi"] = {
    type: "multi", concepts: ["f1-choques"], difficulty: 2,
    generate(r) {
      const m1 = r.int(1, 4), m2 = r.int(1, 5), v1 = r.int(3, 9), v2 = r.pick([0, 0, 1, 2, -1, -2]), mu = r.pick([0.1, 0.15, 0.2, 0.25]);
      const M = m1 + m2, P = m1 * v1 + m2 * v2;
      if (v1 <= v2 || P <= 0) return null;
      const V = P / M, lost = m1 * m2 / M * (v1 - v2) ** 2 / 2, Kf = M * V * V / 2, d = V * V / (2 * mu * g);
      // verificación: la velocidad del centro de masa, a partir de las posiciones de los carritos antes del choque
      const xcm = t => (m1 * v1 * t + m2 * (5 + v2 * t)) / M, Vcm = xcm(1) - xcm(0);
      const t2 = [];
      if (Math.abs(Kf - lost) > 0.02 * lost) t2.push({ value: Kf, msg: "Esa es la energía cinética que queda después del choque: la que se pierde es la diferencia entre la de antes y la de después." });
      const t1 = Math.abs((v1 + v2) / 2 - V) > 0.02 * V ? [{ value: (v1 + v2) / 2, msg: "La velocidad final no es el promedio de las dos: se conserva la cantidad de movimiento, $(m_1 + m_2)V = m_1v_1 + m_2v_2$." }] : [];
      return {
        prompt: `Un carrito de $${m1}$ kg que va a $${v1}$ m/s choca con otro de $${m2}$ kg que ${v2 === 0 ? "está quieto" : v2 > 0 ? `va a $${v2}$ m/s en el mismo sentido` : `viene a $${-v2}$ m/s en sentido contrario`}. Quedan enganchados y siguen juntos por un piso con $\\mu_d = ${dec(mu)}$. ($g = 9{,}8$ m/s²)`,
        parts: [
          { q: "¿Con qué velocidad salen juntos después del choque (en m/s)?", type: "numeric", answer: V, traps: t1, verify: { kind: "value", fn: () => Vcm } },
          { q: "¿Cuánta energía cinética se pierde en el choque (en J)?", type: "numeric", answer: lost, traps: t2,
            verify: { kind: "value", fn: () => (m1 * v1 * v1 + m2 * v2 * v2) / 2 - M * Vcm * Vcm / 2 } },
          { q: "¿Qué distancia recorren juntos hasta frenar (en m)?", type: "numeric", answer: d,
            verify: { kind: "ode", f: (_, y) => [y[1], -mu * g], y0: [0, V], t1: 0, until: (_, y) => y[1] <= 0, g: (_, y) => y[1], dt: 1e-3, out: (_, y) => y[0] } }
        ],
        solution: [
          `[[f1-choques|Choque plástico]]: se conserva la cantidad de movimiento. $(m_1 + m_2)V = m_1v_1 + m_2v_2$, así que $V = \\dfrac{${P}}{${M}} \\approx ${H.num(V, 3)}$ m/s.`,
          `La energía perdida es $K_i - K_f = \\frac12(${m1}\\cdot ${v1 * v1} + ${m2}\\cdot ${v2 * v2}) - \\frac12\\cdot ${M}\\cdot V^{2} \\approx ${H.num(lost, 2)}$ J.`,
          `Después, el rozamiento los frena con $a = -\\mu_d g$: $d = \\dfrac{V^{2}}{2\\mu_d g} \\approx ${H.num(d, 3)}$ m.`
        ]
      };
    }
  };

  E.addPractice("f101", {
    templates: T,
    lessons: { "f1-rectilineo": ["f1-cinem-expr"], "f1-mas": ["f1-mas-expr"], "f1-rozamiento": ["f1-plano-multi"], "f1-tiro": ["f1-tiro-multi"], "f1-choques": ["f1-choque-multi"] }
  });
})();
