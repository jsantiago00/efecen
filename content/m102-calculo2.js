/*
 * M102 · Cálculo II — Lic. en Ciencias Básicas (FCEN, UNCuyo), Plan Ord. 77/15 C.S.
 * ==========================================================================================
 * Temario: programa oficial 2026 de Cálculo II (prof. Fernanda Massut), 8 unidades:
 *   1 Cónicas, ecuaciones paramétricas y coordenadas polares · 2 Vectores y geometría del espacio
 *   3 Series de potencias, Taylor y Fourier · 4 Funciones vectoriales · 5 Funciones de varias variables
 *   6 Integración múltiple · 7 Análisis vectorial · 8 Ecuaciones diferenciales
 *
 * Verificaciones independientes en los tests: clasificación de cónicas y cuádricas evaluando la
 * ecuación lejos del origen, longitudes de curvas por poligonales, áreas polares por la fórmula del
 * zapatero, distancias minimizando con ecuaciones normales, coeficientes de Taylor con la fórmula
 * integral de Cauchy (en el plano complejo), coeficientes de Fourier por Simpson.
 * Ids con prefijo "c2-". Todo el texto y los ejercicios son originales.
 */
(function () {
  window.Efecen.registerCourse({ id: "m102", code: "M102", title: "Cálculo II", icon: "sigma" });
})();

/* =====================================================================
 *  UNIDAD 1 · CÓNICAS, ECUACIONES PARAMÉTRICAS Y COORDENADAS POLARES
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {};
  const nd = (x, d = 4) => num(x, d).replace(".", "{,}");
  const sq = (v, h) => (h === 0 ? `${v}^2` : `(${H.xm(h, v)})^2`);
  const over = (top, q) => (q === 1 ? top : `\\frac{${top}}{${q}}`);
  const CONICAS = ["Circunferencia", "Elipse", "Parábola", "Hipérbola"];
  // clasifica Ax² + Cy² + Dx + Ey + F = 0 mirando el signo de la ecuación muy lejos del origen, en todas las direcciones
  function classifyConic(F) {
    const Rr = 1e6, gs = [];
    for (let i = 0; i < 360; i++) { const t = (i + 0.5) * Math.PI / 180; gs.push(F(Rr * Math.cos(t), Rr * Math.sin(t)) / (Rr * Rr)); }
    const mx = Math.max(...gs), mn = Math.min(...gs), small = Math.min(...gs.map(Math.abs));
    if (mn < -1e-3 && mx > 1e-3) return 3;
    if (small < 1e-3) return 2;
    return mx - mn < 1e-3 * Math.abs(mx) ? 0 : 1;
  }

  T["c2-conica-mc"] = {
    type: "mc", concepts: ["c2-conicas"], difficulty: 2,
    generate(r) {
      const kind = r.int(0, 3), h = r.int(-4, 4), k = r.int(-4, 4);
      let A, C, D, Ee, F;
      if (kind === 0) { const a = r.int(1, 5); [A, C, D, Ee, F] = [1, 1, -2 * h, -2 * k, h * h + k * k - a * a]; }
      else if (kind === 1) { const [a, b] = r.distinct(2, 1, 5); [A, C, D, Ee, F] = [b * b, a * a, -2 * h * b * b, -2 * k * a * a, b * b * h * h + a * a * k * k - a * a * b * b]; }
      else if (kind === 2) {
        const p = r.nz(-3, 3);
        if (r.bool()) [A, C, D, Ee, F] = [0, 1, -4 * p, -2 * k, k * k + 4 * p * h];
        else [A, C, D, Ee, F] = [1, 0, -2 * h, -4 * p, h * h + 4 * p * k];
      } else { const a = r.int(1, 4), b = r.int(1, 4), s = r.pick([1, -1]); [A, C, D, Ee, F] = [b * b, -a * a, -2 * h * b * b, 2 * k * a * a, b * b * h * h - a * a * k * k - s * a * a * b * b]; }
      const eq = H.poly([[A, "x^{2}"], [C, "y^{2}"], [D, "x"], [Ee, "y"], [F, ""]]) + " = 0";
      return {
        prompt: `¿Qué cónica es $${eq}$?`,
        ...H.mc(r, CONICAS[kind], CONICAS.filter((_, i) => i !== kind), { text: true }),
        solution: [
          `Mirá los términos cuadráticos ([[c2-conicas|cónicas]]): ${A === 0 || C === 0 ? "falta uno de los dos cuadrados, así que es una parábola" : A === C ? "$x^2$ e $y^2$ tienen el mismo coeficiente: circunferencia" : A * C > 0 ? "$x^2$ e $y^2$ tienen coeficientes distintos del mismo signo: elipse" : "$x^2$ e $y^2$ tienen coeficientes de signo opuesto: hipérbola"}.`,
          `Completando cuadrados se llega a la forma canónica${kind === 2 ? "" : ` con centro $(${h}, ${k})$`}.`
        ],
        verify: { kind: "truth", target: true, fn: () => classifyConic((x, y) => A * x * x + C * y * y + D * x + Ee * y + F) === kind }
      };
    }
  };
  T["c2-conica-num"] = {
    type: "numeric", concepts: ["c2-conicas"], difficulty: 2,
    generate(r) {
      const h = r.int(-3, 3), k = r.int(-3, 3);
      if (r.bool()) {
        const a = r.int(3, 9), b = r.int(1, a - 1), c = Math.sqrt(a * a - b * b), ask = r.pick(["c", "e"]);
        return {
          prompt: `Para la elipse $${over(sq("x", h), a * a)} + ${over(sq("y", k), b * b)} = 1$, calculá ${ask === "c" ? "la distancia del centro a cada foco" : "la excentricidad"}.`,
          answer: ask === "c" ? c : c / a,
          solution: [`[[c2-conicas|Elipse]] con semiejes $a = ${a}$ (horizontal, el mayor) y $b = ${b}$: $c^2 = a^2 - b^2 = ${a * a - b * b}$.`, ask === "c" ? `$c = \\sqrt{${a * a - b * b}} \\approx ${nd(c)}$.` : `$e = \\frac ca = \\frac{\\sqrt{${a * a - b * b}}}{${a}} \\approx ${nd(c / a)}$ (siempre entre $0$ y $1$).`],
          // verificación: desde un punto de la elipse, la suma de distancias a los focos tiene que dar 2a
          verify: { kind: "zero", fn: x => { const cc = ask === "c" ? x : x * a, P = [h, k + b]; return [(Math.hypot(P[0] - h - cc, P[1] - k) + Math.hypot(P[0] - h + cc, P[1] - k) - 2 * a) / a]; } }
        };
      }
      const a = r.int(1, 6), b = r.int(1, 6), c = Math.sqrt(a * a + b * b), ask = r.pick(["c", "m"]);
      return {
        prompt: `Para la hipérbola $${over(sq("x", h), a * a)} - ${over(sq("y", k), b * b)} = 1$, calculá ${ask === "c" ? "la distancia del centro a cada foco" : "la pendiente positiva de sus asíntotas"}.`,
        answer: ask === "c" ? c : b / a,
        solution: [`[[c2-conicas|Hipérbola]] con $a = ${a}$, $b = ${b}$: los focos están a $c = \\sqrt{a^2 + b^2}$ del centro y las asíntotas tienen pendiente $\\pm\\frac ba$.`, ask === "c" ? `$c = \\sqrt{${a * a + b * b}} \\approx ${nd(c)}$.` : `Pendiente $\\frac{${b}}{${a}} \\approx ${nd(b / a)}$.`],
        verify: ask === "c"
          // desde un punto de la hipérbola, la diferencia de distancias a los focos vale 2a
          ? { kind: "zero", fn: cc => { const P = [h + 2 * a, k + b * Math.sqrt(3)]; return [(Math.abs(Math.hypot(P[0] - h - cc, P[1] - k) - Math.hypot(P[0] - h + cc, P[1] - k)) - 2 * a) / a]; } }
          // pendiente: y/x sobre la rama, muy lejos del centro
          : { kind: "value", tol: 1e-6, fn: () => { const X = 1e7; return b * Math.sqrt(X * X / (a * a) - 1) / X; } }
      };
    }
  };
  const ANG = [[Math.PI / 6, "\\frac{\\pi}{6}"], [Math.PI / 4, "\\frac{\\pi}{4}"], [Math.PI / 3, "\\frac{\\pi}{3}"], [2 * Math.PI / 3, "\\frac{2\\pi}{3}"]];
  T["c2-param-num"] = {
    type: "numeric", concepts: ["c2-parametricas"], difficulty: 2,
    generate(r) {
      let x, y, t0, curve, tt, dydx, why;
      if (r.bool()) {
        const a = r.nz(-3, 3), b = r.int(-4, 4), c = r.nz(-2, 2), d = r.int(-4, 4); t0 = r.nz(-2, 2);
        if (2 * a * t0 + b === 0) return null;
        x = t => a * t * t + b * t; y = t => c * t ** 3 + d * t; tt = String(t0);
        curve = `x = ${H.poly([[a, "t^{2}"], [b, "t"]])},\\quad y = ${H.poly([[c, "t^{3}"], [d, "t"]])}`;
        dydx = (3 * c * t0 * t0 + d) / (2 * a * t0 + b); why = `$\\frac{dy}{dt} = ${H.poly([[3 * c, "t^{2}"], [d, ""]])}$ y $\\frac{dx}{dt} = ${H.poly([[2 * a, "t"], [b, ""]])}$; en $t = ${t0}$: $\\frac{${3 * c * t0 * t0 + d}}{${2 * a * t0 + b}}$.`;
      } else {
        const a = r.int(1, 5), b = r.int(1, 5), [th, tex] = r.pick(ANG); t0 = th; tt = tex;
        x = t => a * Math.cos(t); y = t => b * Math.sin(t);
        curve = `x = ${a === 1 ? "" : a}\\cos t,\\quad y = ${b === 1 ? "" : b}\\sin t`;
        dydx = -(b * Math.cos(th)) / (a * Math.sin(th)); why = `$\\frac{dy}{dx} = \\frac{${b}\\cos t}{-${a}\\sin t}$ evaluado en $t = ${tex}$.`;
      }
      return {
        prompt: `Para la curva $${curve}$, calculá la pendiente $\\frac{dy}{dx}$ de la recta tangente en $t = ${tt}$.`,
        answer: dydx,
        solution: [`[[c2-parametricas|Derivada de una curva paramétrica]]: $\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt}$.`, why, `Pendiente $\\approx ${nd(dydx)}$.`],
        // verificación: pendiente de una secante muy corta entre dos puntos de la curva
        verify: { kind: "value", tol: 1e-5, fn: () => { const hh = 1e-4; return (y(t0 + hh) - y(t0 - hh)) / (x(t0 + hh) - x(t0 - hh)); } }
      };
    }
  };
  T["c2-longitud-num"] = {
    type: "numeric", concepts: ["c2-parametricas"], difficulty: 3,
    generate(r) {
      const v = r.pick(["cubica", "cicloide", "astroide"]);
      let x, y, t1, prompt, ans, sol;
      if (v === "cubica") {
        const k = r.int(1, 4), Tt = r.int(1, 3);
        x = t => k * t * t; y = t => 2 * k / 3 * t ** 3; t1 = Tt;
        ans = 2 * k / 3 * ((1 + Tt * Tt) ** 1.5 - 1);
        prompt = `$x = ${k === 1 ? "" : k}t^2,\\ y = ${H.frac(2 * k, 3)}t^3$ para $0 \\le t \\le ${Tt}$`;
        sol = `$\\sqrt{x'^2 + y'^2} = \\sqrt{${4 * k * k}t^2 + ${4 * k * k}t^4} = ${2 * k}t\\sqrt{1 + t^2}$, y $\\int_0^{${Tt}} ${2 * k}t\\sqrt{1 + t^2}\\,dt = ${H.frac(2 * k, 3)}\\left[(1 + t^2)^{3/2}\\right]_0^{${Tt}} \\approx ${nd(ans)}$.`;
      } else if (v === "cicloide") {
        const a = r.int(1, 6);
        x = t => a * (t - Math.sin(t)); y = t => a * (1 - Math.cos(t)); t1 = 2 * Math.PI; ans = 8 * a;
        prompt = `un arco de la cicloide $x = ${a === 1 ? "" : a}(t - \\sin t),\\ y = ${a === 1 ? "" : a}(1 - \\cos t)$, $0 \\le t \\le 2\\pi$`;
        sol = `$x'^2 + y'^2 = ${a * a}(2 - 2\\cos t) = ${4 * a * a}\\sin^2\\frac t2$, así que $L = \\int_0^{2\\pi} ${2 * a}\\sin\\frac t2\\,dt = ${8 * a}$.`;
      } else {
        const a = r.int(1, 6);
        x = t => a * Math.cos(t) ** 3; y = t => a * Math.sin(t) ** 3; t1 = 2 * Math.PI; ans = 6 * a;
        prompt = `la astroide completa $x = ${a === 1 ? "" : a}\\cos^3 t,\\ y = ${a === 1 ? "" : a}\\sin^3 t$, $0 \\le t \\le 2\\pi$`;
        sol = `$\\sqrt{x'^2 + y'^2} = ${3 * a}|\\sin t\\cos t|$; por simetría, $L = 4\\int_0^{\\pi/2} ${3 * a}\\sin t\\cos t\\,dt = 4\\cdot${H.frac(3 * a, 2)} = ${6 * a}$.`;
      }
      return {
        prompt: `Calculá la longitud de ${prompt}.`,
        answer: ans,
        solution: [`[[c2-parametricas|Longitud de arco]]: $L = \\int_a^b \\sqrt{x'(t)^2 + y'(t)^2}\\,dt$.`, sol],
        // verificación: longitud de una poligonal inscripta con muchos lados
        verify: { kind: "value", tol: 1e-6, fn: () => { const N = 40000; let L = 0, px = x(0), py = y(0); for (let i = 1; i <= N; i++) { const t = t1 * i / N, qx = x(t), qy = y(t); L += Math.hypot(qx - px, qy - py); px = qx; py = qy; } return L; } }
      };
    }
  };
  T["c2-polar-num"] = {
    type: "numeric", concepts: ["c2-polares"], difficulty: 2,
    generate(r) {
      const v = r.pick(["cardioide", "rosa", "espiral", "circulo"]), a = r.int(1, 5);
      let f, th0, th1, ans, curve, sol;
      if (v === "cardioide") {
        const s = r.pick([["\\cos", Math.cos], ["\\sin", Math.sin]]), sg = r.pick([1, -1]);
        f = t => a * (1 + sg * s[1](t)); th0 = 0; th1 = 2 * Math.PI; ans = 1.5 * Math.PI * a * a;
        curve = `la cardioide $r = ${a === 1 ? "" : a}(1 ${sg > 0 ? "+" : "-"} ${s[0]}\\theta)$`;
        sol = `$\\frac12\\int_0^{2\\pi} ${a * a}(1 ${sg > 0 ? "+" : "-"} ${s[0]}\\theta)^2\\,d\\theta = \\frac{${a * a}}{2}\\left(2\\pi + \\pi\\right) = \\frac{${3 * a * a}\\pi}{2} \\approx ${nd(ans)}$ (el término cruzado integra $0$).`;
      } else if (v === "rosa") {
        const n = r.int(2, 5); f = t => a * Math.cos(n * t); th0 = 0; th1 = n % 2 ? Math.PI : 2 * Math.PI;
        ans = (n % 2 ? 0.25 : 0.5) * Math.PI * a * a;
        curve = `todos los pétalos de la rosa $r = ${a === 1 ? "" : a}\\cos(${n}\\theta)$`;
        sol = `Tiene ${n % 2 ? n : 2 * n} pétalos y se recorre entera con $\\theta \\in [0, ${n % 2 ? "\\pi" : "2\\pi"}]$: $\\frac12\\int ${a * a}\\cos^2(${n}\\theta)\\,d\\theta = \\frac{${a * a}}{4}\\cdot${n % 2 ? "\\pi" : "2\\pi"} \\approx ${nd(ans)}$.`;
      } else if (v === "espiral") {
        const [b, tex] = r.pick([[Math.PI / 2, "\\frac{\\pi}{2}"], [Math.PI, "\\pi"], [2 * Math.PI, "2\\pi"]]);
        f = t => a * t; th0 = 0; th1 = b; ans = a * a * b ** 3 / 6;
        curve = `la región barrida por la espiral $r = ${a === 1 ? "" : a}\\theta$ para $0 \\le \\theta \\le ${tex}$`;
        sol = `$\\frac12\\int_0^{${tex}} ${a * a}\\theta^2\\,d\\theta = \\frac{${a * a}}{6}\\left(${tex}\\right)^3 \\approx ${nd(ans)}$.`;
      } else {
        f = t => 2 * a * Math.sin(t); th0 = 0; th1 = Math.PI; ans = Math.PI * a * a;
        curve = `la curva $r = ${2 * a}\\sin\\theta$`;
        sol = `Es una circunferencia de radio $${a}$ (pasa por el origen) y se recorre una vez con $\\theta \\in [0, \\pi]$: $\\frac12\\int_0^\\pi ${4 * a * a}\\sin^2\\theta\\,d\\theta = ${a * a}\\pi$.`;
      }
      return {
        prompt: `Calculá el área encerrada por ${curve}.`,
        answer: ans,
        solution: [`[[c2-polares|Área en polares]]: $A = \\frac12\\int_\\alpha^\\beta r(\\theta)^2\\,d\\theta$.`, sol],
        // verificación: área del polígono que recorre la curva (fórmula del zapatero)
        verify: { kind: "value", tol: 1e-5, fn: () => { const N = 40000; let A = 0, px = 0, py = 0, first = true, x0, y0; for (let i = 0; i <= N; i++) { const t = th0 + (th1 - th0) * i / N, rr = f(t), qx = rr * Math.cos(t), qy = rr * Math.sin(t); if (first) { x0 = qx; y0 = qy; first = false; } else A += px * qy - qx * py; px = qx; py = qy; } A += px * y0 - x0 * py; return Math.abs(A) / 2; } }
      };
    }
  };
  T["c2-polar-conv-num"] = {
    type: "numeric", concepts: ["c2-polares"], difficulty: 1,
    generate(r) {
      if (r.bool()) {
        const rr = r.int(1, 8), [th, tex] = r.pick([[Math.PI / 6, "\\frac{\\pi}{6}"], [Math.PI / 4, "\\frac{\\pi}{4}"], [Math.PI / 3, "\\frac{\\pi}{3}"], [2 * Math.PI / 3, "\\frac{2\\pi}{3}"], [5 * Math.PI / 4, "\\frac{5\\pi}{4}"], [11 * Math.PI / 6, "\\frac{11\\pi}{6}"]]), ask = r.pick(["x", "y"]);
        const ans = ask === "x" ? rr * Math.cos(th) : rr * Math.sin(th);
        return { prompt: `El punto tiene coordenadas polares $(r, \\theta) = \\left(${rr}, ${tex}\\right)$. ¿Cuánto vale su coordenada $${ask}$?`, answer: ans,
          solution: [`[[c2-polares|De polares a cartesianas]]: $x = r\\cos\\theta$, $y = r\\sin\\theta$.`, `$${ask} = ${rr}\\${ask === "x" ? "cos" : "sin"}\\left(${tex}\\right) \\approx ${nd(ans)}$.`],
          // verificación: el punto (x, y) reconstruido tiene que estar a distancia r del origen y en la dirección θ
          verify: { kind: "zero", fn: v => { const other = ask === "x" ? rr * Math.sin(th) : rr * Math.cos(th); const [X, Y] = ask === "x" ? [v, other] : [other, v]; return [Math.hypot(X, Y) - rr, Math.atan2(Y, X) - Math.atan2(Math.sin(th), Math.cos(th))]; } } };
      }
      const x = r.nz(-6, 6), y = r.nz(-6, 6), ask = r.pick(["r", "theta"]);
      let th = Math.atan2(y, x); if (th < 0) th += 2 * Math.PI;
      const ans = ask === "r" ? Math.hypot(x, y) : th * 180 / Math.PI;
      return { prompt: `Pasá el punto $(${x}, ${y})$ a polares. ¿Cuánto vale ${ask === "r" ? "$r$" : "$\\theta$, en grados entre $0$ y $360$"}?`, answer: ans,
        solution: [`[[c2-polares]]: $r = \\sqrt{x^2 + y^2}$ y $\\tan\\theta = \\frac yx$, eligiendo el cuadrante correcto (el punto está en el ${x > 0 ? (y > 0 ? "primero" : "cuarto") : (y > 0 ? "segundo" : "tercero")}).`, ask === "r" ? `$r = \\sqrt{${x * x + y * y}} \\approx ${nd(ans)}$.` : `$\\theta \\approx ${nd(ans)}^\\circ$.`],
        verify: { kind: "zero", fn: v => ask === "r" ? [v * v - (x * x + y * y)] : [Math.cos(v * Math.PI / 180) * Math.hypot(x, y) - x, Math.sin(v * Math.PI / 180) * Math.hypot(x, y) - y, v >= 0 && v < 360 ? 0 : 1] } };
    }
  };
  T["c2-conica-polar-vf"] = {
    type: "tf", concepts: ["c2-polares", "c2-conicas"], difficulty: 2,
    generate(r) {
      const e = r.pick([0.25, 0.5, 0.8, 1.5, 2, 3]), k = r.int(1, 6), claim = r.pick(["elipse", "hipérbola"]);
      const ans = claim === "elipse" ? e < 1 : e > 1;
      return {
        prompt: `<b>Verdadero o falso:</b> la curva $r = \\dfrac{${k}}{1 + ${String(e).replace(".", "{,}")}\\cos\\theta}$ es una ${claim}.`,
        answer: ans,
        explanation: `Es una [[c2-conicas|cónica]] con un foco en el origen y excentricidad $e = ${String(e).replace(".", "{,}")}$: ${e < 1 ? "como $e < 1$, es una elipse" : "como $e > 1$, es una hipérbola"} ([[c2-polares|cónicas en polares]]).`,
        solution: [`$r = \\frac{ed}{1 + e\\cos\\theta}$: elipse si $e < 1$, parábola si $e = 1$, hipérbola si $e > 1$.`],
        // verificación: la elipse es la única acotada; con e > 1 el denominador se anula y r se va a infinito
        verify: { kind: "truth", fn: () => { let bounded = true; for (let i = 0; i < 3600; i++) { const den = 1 + e * Math.cos(i * Math.PI / 1800); if (den <= 1e-9) bounded = false; } return claim === "elipse" ? bounded : !bounded; } }
      };
    }
  };

  const cards = {
    "c2-conicas": {
      title: "Cónicas: elipse, parábola e hipérbola", aliases: ["cónica", "cónicas", "elipse", "hipérbola", "parábola", "excentricidad", "focos", "asíntotas de la hipérbola", "secciones cónicas"], concepts: ["c2-conicas"],
      summary: "Curvas de segundo grado. Elipse: suma de distancias a los focos constante; hipérbola: diferencia constante; parábola: equidistante de un foco y una recta.",
      def: [R`Las **cónicas** son los cortes de un cono con un plano. En forma canónica (centro en $(h, k)$):`,
        R`**Elipse:** $\frac{(x-h)^2}{a^2} + \frac{(y-k)^2}{b^2} = 1$. Con $a > b$, los focos están a $c = \sqrt{a^2 - b^2}$ del centro y $PF_1 + PF_2 = 2a$. **Excentricidad** $e = \frac ca < 1$.`,
        R`**Hipérbola:** $\frac{(x-h)^2}{a^2} - \frac{(y-k)^2}{b^2} = 1$, con $c = \sqrt{a^2 + b^2}$, $|PF_1 - PF_2| = 2a$ y asíntotas $y - k = \pm\frac ba(x - h)$; $e > 1$.`,
        R`**Parábola:** $(y - k)^2 = 4p(x - h)$ (o con $x$ e $y$ cambiadas): cada punto está a la misma distancia del foco que de la directriz; $e = 1$.`],
      idea: [R`Para reconocerla en la forma $Ax^2 + Cy^2 + Dx + Ey + F = 0$ alcanza con mirar los cuadrados: si falta uno, **parábola**; si tienen el mismo signo, **elipse** (circunferencia si $A = C$); si tienen signo opuesto, **hipérbola**. Para el centro y los semiejes, se completan cuadrados.`,
        R`La excentricidad mide cuánto se aleja de una circunferencia ($e = 0$). Las órbitas de los planetas son elipses con el Sol en un foco ([[f1-gravitacion]]).`],
      demo: [R`**Paso 1 (elipse: planteo).** Ponemos los focos en $(\pm c, 0)$ y pedimos que la suma de las distancias a los focos valga $2a$, con $a > c$ (si no, no hay curva): $$\sqrt{(x + c)^2 + y^2} + \sqrt{(x - c)^2 + y^2} = 2a.$$`,
        R`**Paso 2.** Para sacarnos las raíces de a una, pasamos la segunda al otro lado y elevamos al cuadrado: $$(x + c)^2 + y^2 = 4a^2 - 4a\sqrt{(x - c)^2 + y^2} + (x - c)^2 + y^2.$$ Desarrollando los binomios, $x^2$, $y^2$ y $c^2$ se cancelan de los dos lados y queda $4cx = 4a^2 - 4a\sqrt{(x - c)^2 + y^2}$, o sea $$a\sqrt{(x - c)^2 + y^2} = a^2 - cx.$$`,
        R`**Paso 3.** Elevamos otra vez al cuadrado para eliminar la raíz que quedó: $a^2(x^2 - 2cx + c^2 + y^2) = a^4 - 2a^2cx + c^2x^2$. Los términos $-2a^2cx$ se cancelan, y agrupando: $$(a^2 - c^2)\,x^2 + a^2y^2 = a^2(a^2 - c^2).$$`,
        R`**Paso 4.** Como $a > c$, el número $a^2 - c^2$ es positivo y lo podemos llamar $b^2$. Dividiendo todo por $a^2b^2$ sale $\frac{x^2}{a^2} + \frac{y^2}{b^2} = 1$, y de paso $c^2 = a^2 - b^2$. (Al elevar al cuadrado no se agregan puntos: se puede chequear que todo punto de esta ecuación cumple $a^2 - cx > 0$ y por lo tanto la ecuación original).`,
        R`**Paso 5 (hipérbola).** Si en lugar de la suma pedimos que la **diferencia** de distancias valga $\pm 2a$, ahora con $a < c$, las mismas dos elevaciones al cuadrado llevan a la misma ecuación del Paso 3. La diferencia es que $a^2 - c^2$ es negativo: lo escribimos como $-b^2$, con $b^2 = c^2 - a^2$, y queda $\frac{x^2}{a^2} - \frac{y^2}{b^2} = 1$.`,
        R`**Paso 6 (parábola).** Con foco $(p, 0)$ y directriz $x = -p$, la distancia de $(x, y)$ al foco es $\sqrt{(x - p)^2 + y^2}$ y a la directriz es $x + p$. Igualándolas y elevando al cuadrado: $x^2 - 2px + p^2 + y^2 = x^2 + 2px + p^2$. Se cancelan $x^2$ y $p^2$, y queda $y^2 = 4px$.`,
        R`**Paso 7 (asíntotas).** Despejamos $y$ de la hipérbola y sacamos $x^2$ de la raíz: $$y = \pm\frac ba\sqrt{x^2 - a^2} = \pm\frac ba\,x\sqrt{1 - \frac{a^2}{x^2}}.$$ Cuando $|x|$ crece, $\frac{a^2}{x^2} \to 0$ y la raíz tiende a $1$, así que la curva se pega a las rectas $y = \pm\frac ba\,x$. $\blacksquare$`],
      examples: [{ q: R`Clasificá $4x^2 + 9y^2 - 16x + 18y - 11 = 0$.`, steps: [R`$4(x - 2)^2 + 9(y + 1)^2 = 11 + 16 + 9 = 36$.`, R`$\frac{(x-2)^2}{9} + \frac{(y+1)^2}{4} = 1$: elipse de centro $(2, -1)$, $a = 3$, $b = 2$, $c = \sqrt5$.`] }],
      tips: [R`En la elipse $c^2 = a^2 - b^2$, pero en la hipérbola $c^2 = a^2 + b^2$: no se mezclan.`],
      see: ["c2-polares", "cuadratica"]
    },
    "c2-parametricas": {
      title: "Curvas paramétricas", aliases: ["ecuaciones paramétricas", "curva paramétrica", "curvas paramétricas", "parametrización", "cicloide"], concepts: ["c2-parametricas"],
      summary: "Una curva descripta por x = f(t), y = g(t). Pendiente dy/dx = (dy/dt)/(dx/dt); longitud ∫√(x'² + y'²) dt.",
      def: [R`Una **curva paramétrica** es $(x(t), y(t))$ con $t$ en un intervalo: el parámetro dice dónde está el punto en cada "instante".`,
        R`**Pendiente:** $\frac{dy}{dx} = \frac{dy/dt}{dx/dt}$ (si $\frac{dx}{dt} \ne 0$). **Longitud de arco:** $L = \int_a^b\sqrt{x'(t)^2 + y'(t)^2}\,dt$.`],
      idea: [R`Muchas curvas no son gráficos de funciones (una circunferencia, un rulo), pero se parametrizan fácil: $x = \cos t$, $y = \sin t$.`,
        R`La longitud sale de sumar pedacitos $\sqrt{dx^2 + dy^2}$ (Pitágoras) y pasar al límite: es la [[integral-definida|integral]] de la rapidez $|\vec r\,'(t)|$.`,
        R`La **cicloide** es la curva que traza un punto de una rueda que rueda sin deslizar: $x = a(t - \sin t)$, $y = a(1 - \cos t)$. Un arco mide $8a$.`],
      demo: [R`**Paso 1 (pendiente).** Suponemos $x'(t_0) \neq 0$, por ejemplo positiva. Como $x'$ es continua, sigue siendo positiva cerca de $t_0$, así que $x(t)$ es estrictamente creciente ahí y tiene [[funcion-inversa|inversa]]: podemos escribir $t = t(x)$.`,
        R`**Paso 2.** Entonces, cerca de ese punto, la curva es el gráfico de una función: $y = y(t(x))$. Lo derivamos respecto de $x$ con la [[regla-cadena|regla de la cadena]]: $$\frac{dy}{dx} = y'(t)\,\frac{dt}{dx}.$$`,
        R`**Paso 3.** La derivada de la inversa es la recíproca de la derivada: $\frac{dt}{dx} = \frac{1}{x'(t)}$. Reemplazando, $$\frac{dy}{dx} = \frac{y'(t)}{x'(t)}.$$`,
        R`**Paso 4 (longitud).** Partimos $[a, b]$ en pasos $\Delta t$ y unimos los puntos de la curva con segmentos. Por Pitágoras, cada segmento mide $\sqrt{\Delta x^2 + \Delta y^2}$, y por el [[valor-medio|teorema del valor medio]], $\Delta x \approx x'(t_i)\,\Delta t$ y $\Delta y \approx y'(t_i)\,\Delta t$.`,
        R`**Paso 5.** Sacando $\Delta t$ de la raíz, la poligonal mide $\sum\sqrt{x'(t_i)^2 + y'(t_i)^2}\,\Delta t$, que es una suma de Riemann. Cuando $\Delta t \to 0$ tiende a $L = \int_a^b\sqrt{x'(t)^2 + y'(t)^2}\,dt$. $\blacksquare$`],
      examples: [{ q: R`Pendiente de $x = t^2$, $y = t^3$ en $t = 2$.`, steps: [R`$\frac{dy}{dx} = \frac{3t^2}{2t} = \frac{3t}{2} = 3$.`] }],
      tips: [R`$\frac{dy}{dx}$ no es $\frac{dx}{dt}$ ni $\frac{dy}{dt}$: es su cociente.`],
      see: ["c2-polares", "c2-curvas-vectoriales"]
    },
    "c2-polares": {
      title: "Coordenadas polares", aliases: ["coordenadas polares", "polares", "cardioide", "rosa polar", "área en polares", "curvas polares"], concepts: ["c2-polares"],
      summary: "Un punto se describe por su distancia r al origen y su ángulo θ. x = r cos θ, y = r sen θ. Área: ½∫r² dθ.",
      def: [R`**Coordenadas polares** $(r, \theta)$: $x = r\cos\theta$, $y = r\sin\theta$; al revés, $r = \sqrt{x^2 + y^2}$ y $\tan\theta = \frac yx$ (cuidando el cuadrante).`,
        R`**Área** de la región barrida por $r = f(\theta)$ entre $\alpha$ y $\beta$: $A = \frac12\int_\alpha^\beta f(\theta)^2\,d\theta$.`,
        R`**Cónicas en polares** (foco en el origen): $r = \frac{ed}{1 + e\cos\theta}$; $e$ es la excentricidad.`],
      idea: [R`En polares, el área se piensa como un abanico: cada tajada fina de ángulo $d\theta$ es casi un triangulito con dos lados de largo $r$, de área $\frac12r^2\,d\theta$. Chequeo rápido: la circunferencia $r = a$ da $\frac12\int_0^{2\pi}a^2\,d\theta = \pi a^2$, el área del círculo.`,
        R`Las curvas típicas: circunferencias $r = a$ y $r = 2a\sin\theta$, cardioides $r = a(1 \pm \cos\theta)$, rosas $r = a\cos(n\theta)$ (con $n$ pétalos si $n$ es impar y $2n$ si es par) y espirales $r = a\theta$.`],
      demo: [R`**Paso 1 (cambio de coordenadas).** El punto $(x, y)$, el origen y el pie de la perpendicular al eje $x$ forman un triángulo rectángulo de hipotenusa $r$ y ángulo $\theta$ en el origen. Por la definición de coseno y seno, los catetos son $x = r\cos\theta$ e $y = r\sin\theta$.`,
        R`**Paso 2.** Para volver, Pitágoras: $x^2 + y^2 = r^2(\cos^2\theta + \sin^2\theta) = r^2$, así que $r = \sqrt{x^2 + y^2}$. Y dividiendo, $\frac yx = \frac{\sin\theta}{\cos\theta} = \tan\theta$; como la tangente se repite cada $\pi$, el cuadrante decide cuál de los dos ángulos es.`,
        R`**Paso 3 (área: un sector).** Un sector circular de radio $R$ y ángulo $\Delta\theta$ es la fracción $\frac{\Delta\theta}{2\pi}$ del círculo, así que su área es $\frac{\Delta\theta}{2\pi}\,\pi R^2 = \frac12R^2\,\Delta\theta$.`,
        R`**Paso 4.** Partimos $[\alpha, \beta]$ en ángulos chicos $\Delta\theta$. En cada uno, $f$ casi no cambia, así que la tajada de la región es casi un sector de radio $f(\theta_i)$. Sumando: $$A \approx \sum\frac12f(\theta_i)^2\,\Delta\theta,$$ que es una suma de Riemann. Al achicar $\Delta\theta$ tiende a $\frac12\int_\alpha^\beta f(\theta)^2\,d\theta$.`,
        R`**Paso 5 (cónicas con foco en el origen).** Usamos la definición por foco y directriz: un punto está en la cónica si su distancia al foco es $e$ veces su distancia a la directriz. Con el foco en el origen, la distancia al foco es $r$. Si la directriz es la recta $x = d$, el punto $(r\cos\theta, r\sin\theta)$ (del lado del foco) está a distancia $d - r\cos\theta$ de ella.`,
        R`**Paso 6.** La condición queda $r = e\,(d - r\cos\theta)$. Pasamos el término con $r$ a la izquierda y sacamos factor común: $r(1 + e\cos\theta) = ed$, o sea $$r = \frac{ed}{1 + e\cos\theta}.$$ $\blacksquare$`],
      examples: [{ q: R`Área de un pétalo de $r = \cos(2\theta)$.`, steps: [R`Un pétalo va de $-\frac\pi4$ a $\frac\pi4$.`, R`$\frac12\int_{-\pi/4}^{\pi/4}\cos^2(2\theta)\,d\theta = \frac\pi8$.`] }],
      tips: [R`$\arctan\frac yx$ solo da ángulos del primer y cuarto cuadrante: si $x < 0$ hay que sumar $\pi$.`, R`Para el área, el intervalo de $\theta$ tiene que recorrer la curva **una sola vez**.`],
      see: ["c2-conicas", "c2-parametricas", "numeros-complejos"]
    }
  };

  E.extendCourse("m102", {
    concepts: { "c2-conicas": { name: "Cónicas" }, "c2-parametricas": { name: "Curvas paramétricas" }, "c2-polares": { name: "Coordenadas polares" } },
    templates: T,
    units: [{
      id: "c2-curvas-u", order: 1, program: "Unidad 1", title: "Cónicas, paramétricas y polares", icon: "target",
      diagnostic: ["c2-conica-mc", "c2-param-num", "c2-polar-num"],
      lessons: [
        { id: "c2-conicas", title: "Cónicas", templates: ["c2-conica-mc", "c2-conica-num"], theory: ["c2-conicas"],
          intro: R`Elipse, parábola e hipérbola: se reconocen por los cuadrados y se analizan completando cuadrados.` },
        { id: "c2-parametricas", title: "Curvas paramétricas", templates: ["c2-param-num", "c2-longitud-num"], theory: ["c2-parametricas"],
          intro: R`$\frac{dy}{dx} = \frac{y'(t)}{x'(t)}$ y $L = \int\sqrt{x'^2 + y'^2}\,dt$.` },
        { id: "c2-polares", title: "Coordenadas polares", templates: ["c2-polar-conv-num", "c2-polar-num", "c2-conica-polar-vf"], theory: ["c2-polares"],
          intro: R`$x = r\cos\theta$, $y = r\sin\theta$. Área: $\frac12\int r^2\,d\theta$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 2 · VECTORES Y LA GEOMETRÍA DEL ESPACIO
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {};
  const nd = (x, d = 4) => num(x, d).replace(".", "{,}");
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const sub = (a, b) => a.map((x, i) => x - b[i]);
  const vec = r => [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)];
  const pt = p => `(${p.join(", ")})`;
  const plane = (n, d) => `${H.poly([[n[0], "x"], [n[1], "y"], [n[2], "z"]])} = ${d}`;
  const lineTex = (P, u, t) => `(x, y, z) = ${pt(P)} + ${t}\\,${pt(u)}`;

  T["c2-dist-plano-num"] = {
    type: "numeric", concepts: ["c2-rectas-planos"], difficulty: 2,
    generate(r) {
      const n = vec(r), P = vec(r), d = r.int(-8, 8);
      if (n.every(v => v === 0)) return null;
      const val = dot(n, P) - d, nn = Math.sqrt(dot(n, n)), ans = Math.abs(val) / nn;
      return {
        prompt: `Calculá la distancia del punto $P = ${pt(P)}$ al plano $${plane(n, d)}$.`,
        answer: ans,
        solution: [`[[c2-rectas-planos|Distancia punto–plano]]: $D = \\frac{|ax_0 + by_0 + cz_0 - d|}{\\sqrt{a^2 + b^2 + c^2}}$ (es la [[al-producto-escalar|proyección]] de un vector que va del plano a $P$ sobre la normal).`, `$D = \\frac{|${val}|}{\\sqrt{${dot(n, n)}}} \\approx ${nd(ans)}$.`],
        // verificación: se arma una base del plano y se resta a P−Q su proyección sobre el plano (Gram-Schmidt)
        verify: { kind: "value", tol: 1e-9, fn: () => {
          const i = n.findIndex(v => v !== 0), Q = [0, 0, 0]; Q[i] = d / n[i];
          const axes = [[1, 0, 0], [0, 1, 0], [0, 0, 1]].filter((_, j) => j !== i);
          const basis = [];
          for (const ax of axes) { let w = ax.map((v, j) => v - (j === i ? dot(n, ax) / n[i] : 0)); for (const b of basis) { const c = dot(w, b); w = w.map((v, j) => v - c * b[j]); } const L = Math.sqrt(dot(w, w)); basis.push(w.map(v => v / L)); }
          let w = sub(P, Q); for (const b of basis) { const c = dot(w, b); w = w.map((v, j) => v - c * b[j]); }
          return Math.sqrt(dot(w, w));
        } }
      };
    }
  };
  T["c2-plano-num"] = {
    type: "numeric", concepts: ["c2-rectas-planos"], difficulty: 2,
    generate(r) {
      const P1 = vec(r), P2 = vec(r), P3 = vec(r), u = sub(P2, P1), v = sub(P3, P1), n = cross(u, v);
      if (n[2] === 0) return null;
      const x0 = r.int(-3, 3), y0 = r.int(-3, 3), d = dot(n, P1), z = (d - n[0] * x0 - n[1] * y0) / n[2];
      return {
        prompt: `El plano que pasa por $${pt(P1)}$, $${pt(P2)}$ y $${pt(P3)}$, ¿a qué altura $z$ pasa sobre el punto $(x, y) = (${x0}, ${y0})$?`,
        answer: z,
        solution: [`Una normal es el [[al-producto-vectorial|producto vectorial]] de dos vectores del plano: $\\vec n = ${pt(u)} \\times ${pt(v)} = ${pt(n)}$.`, `[[c2-rectas-planos|Ecuación del plano]]: $${plane(n, d)}$.`, `Con $x = ${x0}$, $y = ${y0}$: $z = ${H.frac(d - n[0] * x0 - n[1] * y0, n[2])} \\approx ${nd(z)}$.`],
        // verificación: se escribe el punto como P1 + s·u + t·v resolviendo las dos ecuaciones de x e y
        verify: { kind: "value", tol: 1e-9, fn: () => { const det = u[0] * v[1] - v[0] * u[1], bx = x0 - P1[0], by = y0 - P1[1], s = (bx * v[1] - v[0] * by) / det, t = (u[0] * by - bx * u[1]) / det; return P1[2] + s * u[2] + t * v[2]; } }
      };
    }
  };
  const POS = ["Paralelas (distintas)", "Se cortan en un punto", "Se cruzan (son alabeadas)"];
  T["c2-rectas-mc"] = {
    type: "mc", concepts: ["c2-rectas-planos"], difficulty: 2,
    generate(r) {
      const kind = r.int(0, 2), P = vec(r), u = vec(r);
      if (u.every(x => x === 0)) return null;
      let Q, v;
      if (kind === 0) { const m = r.pick([1, 2, -1]); v = u.map(x => x * m); Q = P.map((x, i) => x + [1, 2, -1][i] * r.nz(-2, 2)); if (cross(sub(Q, P), u).every(x => x === 0)) return null; }
      else {
        v = vec(r); if (cross(u, v).every(x => x === 0)) return null;
        const t0 = r.int(-2, 2), s0 = r.int(-2, 2), X = P.map((x, i) => x + t0 * u[i]);
        Q = X.map((x, i) => x - s0 * v[i] + (kind === 2 ? cross(u, v)[i] : 0));
      }
      return {
        prompt: `¿Cómo son las rectas $L_1: ${lineTex(P, u, "t")}$ y $L_2: ${lineTex(Q, v, "s")}$?`,
        ...H.mc(r, POS[kind], POS.filter((_, i) => i !== kind).concat(["Coinciden"]), { text: true }),
        solution: [
          `[[c2-rectas-planos|Posiciones de dos rectas]]: primero se mira si los directores son paralelos (${kind === 0 ? "lo son" : "no lo son"}).`,
          kind === 0 ? `Como $Q = ${pt(Q)}$ no está en $L_1$, son paralelas distintas.`
            : `Si no son paralelos, se cortan si y solo si $\\overrightarrow{PQ}\\cdot(\\vec u\\times\\vec v) = 0$ ([[al-producto-vectorial|producto mixto]]): acá da $${dot(sub(Q, P), cross(u, v))}$, así que ${kind === 1 ? "se cortan" : "se cruzan sin tocarse"}.`
        ],
        // verificación: se minimiza la distancia entre puntos de las dos rectas (ecuaciones normales en t y s)
        verify: { kind: "truth", target: true, fn: () => {
          const w = sub(P, Q), a = dot(u, u), b = dot(u, v), c = dot(v, v), det = a * c - b * b;
          if (Math.abs(det) < 1e-9) { const t = -dot(w, u) / a, D = w.map((x, i) => x + t * u[i]); return kind === 0 && Math.sqrt(dot(D, D)) > 1e-6; }
          const t = (b * dot(w, v) - c * dot(w, u)) / det, s = (a * dot(w, v) - b * dot(w, u)) / det;
          const D = P.map((x, i) => x + t * u[i] - Q[i] - s * v[i]), dist = Math.sqrt(dot(D, D));
          return kind === 1 ? dist < 1e-9 : kind === 2 && dist > 1e-6;
        } }
      };
    }
  };
  const QUAD = ["Elipsoide", "Hiperboloide de una hoja", "Hiperboloide de dos hojas", "Cono", "Paraboloide elíptico", "Paraboloide hiperbólico"];
  // clasificación evaluando la ecuación F(x, y, z) = 0 en muchos puntos (sin mirar los signos de la fórmula)
  function classifyQuadric(F) {
    const rnd = (() => { let s = 12345; return () => ((s = (s * 16807) % 2147483647) / 2147483647) * 2 - 1; })();
    const pts = Array.from({ length: 40 }, () => [rnd(), rnd(), rnd()]);
    const e = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    const add = (p, q, k = 1) => p.map((x, i) => x + k * q[i]);
    // ¿hay una variable que aparece solo en forma lineal?
    const lin = e.findIndex(ej => { const d0 = F(add(pts[0], ej)) - F(pts[0]); return pts.every(p => Math.abs(F(add(p, ej)) - F(p) - d0) < 1e-9) && Math.abs(d0) > 1e-9; });
    if (lin >= 0) {
      const vals = []; for (let i = 0; i < 360; i++) { const t = i * Math.PI / 180, ax = e.filter((_, j) => j !== lin), p = add(ax[0].map(x => x * 1e4 * Math.cos(t)), ax[1].map(x => x * 1e4 * Math.sin(t))); vals.push(F(p) - F([0, 0, 0]) - (F(add([0, 0, 0], e[lin])) - F([0, 0, 0])) * 0); }
      return vals.every(v => v > 0) || vals.every(v => v < 0) ? 4 : 5;
    }
    if (Math.abs(F([0, 0, 0])) < 1e-12 && pts.every(p => Math.abs(F(p.map(x => 2 * x)) - 4 * F(p)) < 1e-9)) return 3;
    const sg = e.map(ej => Math.sign(F(ej.map(x => x * 1e4))));
    if (sg.every(s => s > 0)) return 0;
    const odd = sg.findIndex(s => sg.filter(t => t === s).length === 1);
    const ax = e.filter((_, j) => j !== odd);
    let pos = false, neg = false;
    for (let i = 0; i < 60; i++) for (let j = 0; j < 60; j++) { const v = F(add(ax[0].map(x => x * (i - 30) / 3), ax[1].map(x => x * (j - 30) / 3))); if (v > 0) pos = true; if (v < 0) neg = true; }
    return pos && neg ? 1 : 2;
  }
  T["c2-cuadrica-mc"] = {
    type: "mc", concepts: ["c2-cuadricas"], difficulty: 2,
    generate(r) {
      const kind = r.int(0, 5), q = [r.pick([1, 4, 9]), r.pick([1, 4, 9, 16]), r.pick([1, 4, 9])], perm = r.shuffle([0, 1, 2]), V = ["x", "y", "z"];
      const signs = [[1, 1, 1], [1, 1, -1], [-1, -1, 1], [1, 1, -1], [1, 1, 0], [1, -1, 0]][kind];
      const rhs = [1, 1, 1, 0, null, null][kind];
      // la variable perm[2] lleva el signo "distinto" (o es la lineal en los paraboloides)
      const term = (s, i) => { const v = V[perm[i]], top = `${v}^2`; return { s, tex: q[i] === 1 ? top : `\\frac{${top}}{${q[i]}}` }; };
      const parts = [0, 1, 2].filter(i => signs[i] !== 0).map(i => term(signs[i], i));
      let lhs = ""; parts.forEach((p, j) => { lhs += (j === 0 ? (p.s < 0 ? "-" : "") : (p.s < 0 ? " - " : " + ")) + p.tex; });
      const cz = r.int(1, 3), right = rhs === null ? (cz === 1 ? V[perm[2]] : `\\frac{${V[perm[2]]}}{${cz}}`) : String(rhs);
      const F = p => { let s = 0; for (let i = 0; i < 3; i++) if (signs[i]) s += signs[i] * p[perm[i]] ** 2 / q[i]; return rhs === null ? s - p[perm[2]] / cz : s - rhs; };
      return {
        prompt: `¿Qué superficie es $${lhs} = ${right}$?`,
        ...H.mc(r, QUAD[kind], r.shuffle(QUAD.filter((_, i) => i !== kind)), { text: true }),
        solution: [
          `[[c2-cuadricas|Cuádricas]]: ${rhs === null ? `una variable aparece lineal, así que es un paraboloide; los cuadrados ${kind === 4 ? "tienen el mismo signo (elíptico, forma de copa)" : "tienen signos opuestos (hiperbólico, forma de silla de montar)"}` : rhs === 0 ? "igualado a $0$ y con un signo distinto: cono" : kind === 0 ? "tres cuadrados positivos igualados a $1$: elipsoide" : kind === 1 ? "un solo signo menos: hiperboloide de una hoja" : "dos signos menos: hiperboloide de dos hojas"}.`,
          `Las **trazas** (cortes con planos paralelos a los coordenados) lo confirman: ${["todas son elipses acotadas", "los cortes perpendiculares al eje del signo menos son elipses que nunca se vacían", "cerca del centro los cortes perpendiculares al eje están vacíos: hay dos piezas", "los cortes por el vértice son rectas", "los cortes perpendiculares al eje son elipses y los otros, parábolas", "los cortes son hipérbolas y parábolas"][kind]}.`
        ],
        verify: { kind: "truth", target: true, fn: () => classifyQuadric(F) === kind }
      };
    }
  };
  T["c2-coord-num"] = {
    type: "numeric", concepts: ["c2-coord-espacio"], difficulty: 2,
    generate(r) {
      const x = r.int(-5, 5), y = r.int(-5, 5), z = r.int(-5, 5), ask = r.pick(["rho", "phi", "rcil", "theta"]);
      if (x === 0 && y === 0) return null;
      const rho = Math.sqrt(x * x + y * y + z * z), rc = Math.hypot(x, y); let th = Math.atan2(y, x); if (th < 0) th += 2 * Math.PI;
      const phi = Math.acos(z / rho);
      const ans = { rho, phi: phi * 180 / Math.PI, rcil: rc, theta: th * 180 / Math.PI }[ask];
      return {
        prompt: `Para el punto $(${x}, ${y}, ${z})$, calculá ${{ rho: "la coordenada esférica $\\rho$ (distancia al origen)", phi: "el ángulo esférico $\\varphi$ (medido desde el eje $z$ positivo, en grados)", rcil: "la coordenada cilíndrica $r$", theta: "el ángulo $\\theta$ (cilíndrico o esférico, en grados entre $0$ y $360$)" }[ask]}.`,
        answer: ans,
        solution: [`[[c2-coord-espacio|Coordenadas cilíndricas y esféricas]]: $r = \\sqrt{x^2 + y^2}$, $\\theta$ como en polares; $\\rho = \\sqrt{x^2 + y^2 + z^2}$ y $\\cos\\varphi = \\frac z\\rho$.`, `Resultado: $\\approx ${nd(ans)}$.`],
        // verificación: se reconstruye (x, y, z) con las fórmulas inversas y la respuesta
        verify: { kind: "zero", fn: a => {
          const R2 = ask === "rho" ? a : rho, PH = ask === "phi" ? a * Math.PI / 180 : phi, TH = ask === "theta" ? a * Math.PI / 180 : th, RC = ask === "rcil" ? a : rc;
          return [R2 * Math.sin(PH) * Math.cos(TH) - x, R2 * Math.sin(PH) * Math.sin(TH) - y, R2 * Math.cos(PH) - z, RC - R2 * Math.sin(PH)].map(v => v / 10);
        } }
      };
    }
  };

  const cards = {
    "c2-rectas-planos": {
      title: "Rectas y planos en el espacio", aliases: ["rectas en el espacio", "recta en el espacio", "planos en el espacio", "ecuación del plano", "vector normal", "rectas alabeadas", "distancia de un punto a un plano", "ecuaciones paramétricas de la recta"], concepts: ["c2-rectas-planos"],
      summary: "Recta: P + t·u. Plano: n·(X − P) = 0, o ax + by + cz = d con normal (a, b, c). Distancia punto–plano: |ax₀ + by₀ + cz₀ − d|/|n|.",
      def: [R`**Recta** por $P$ con dirección $\vec u$: $(x, y, z) = P + t\vec u$, $t \in \mathbb R$.`,
        R`**Plano** por $P$ con normal $\vec n = (a, b, c)$: $\vec n\cdot(X - P) = 0$, o sea $ax + by + cz = d$. Por tres puntos: $\vec n = \overrightarrow{P_1P_2}\times\overrightarrow{P_1P_3}$ ([[al-producto-vectorial]]).`,
        R`**Distancia de $P_0$ al plano:** $D = \frac{|ax_0 + by_0 + cz_0 - d|}{\sqrt{a^2 + b^2 + c^2}}$.`],
      idea: [R`En el espacio, dos rectas pueden ser paralelas, cortarse, o **cruzarse** sin tocarse (alabeadas), algo que en el plano no pasa. Si los directores no son paralelos, se cortan exactamente cuando $\overrightarrow{PQ}$, $\vec u$ y $\vec v$ son coplanares: el producto mixto da $0$.`,
        R`La distancia al plano es la longitud de la [[al-producto-escalar|proyección]] de $\overrightarrow{QP_0}$ (con $Q$ en el plano) sobre la normal.`],
      demo: [R`**Paso 1 (ecuación del plano).** Un punto $X$ está en el plano que pasa por $P$ con normal $\vec n$ exactamente cuando el vector $\overrightarrow{PX} = X - P$ queda acostado en el plano, o sea, cuando es perpendicular a $\vec n$. Con el [[al-producto-escalar|producto escalar]], eso es $$\vec n\cdot(X - P) = 0.$$`,
        R`**Paso 2.** Escribimos $\vec n = (a, b, c)$, $X = (x, y, z)$ y $P = (x_0, y_0, z_0)$ y desarrollamos: $a(x - x_0) + b(y - y_0) + c(z - z_0) = 0$. Pasando las constantes a la derecha queda $ax + by + cz = d$, con $d = ax_0 + by_0 + cz_0$.`,
        R`**Paso 3 (normal por tres puntos).** Los vectores $\overrightarrow{P_1P_2}$ y $\overrightarrow{P_1P_3}$ están en el plano. Su [[al-producto-vectorial|producto vectorial]] es perpendicular a los dos, así que es perpendicular al plano: es una normal. Si los tres puntos están alineados, los dos vectores son paralelos y el producto da $\vec 0$: en ese caso no determinan un plano.`,
        R`**Paso 4 (distancia de un punto a un plano).** Tomamos un punto $Q$ cualquiera del plano. La distancia de $P_0$ al plano se mide en la dirección perpendicular, o sea, en la de $\vec n$: es el largo de la proyección de $\overrightarrow{QP_0}$ sobre $\vec n$, $$D = \frac{|\vec n\cdot(P_0 - Q)|}{|\vec n|}.$$`,
        R`**Paso 5.** Desarrollamos el numerador: $\vec n\cdot(P_0 - Q) = (ax_0 + by_0 + cz_0) - (ax_Q + by_Q + cz_Q)$. Como $Q$ está en el plano, $ax_Q + by_Q + cz_Q = d$, y queda $$D = \frac{|ax_0 + by_0 + cz_0 - d|}{\sqrt{a^2 + b^2 + c^2}}.$$ No depende de qué $Q$ elegimos, como tenía que ser. $\blacksquare$`],
      examples: [{ q: R`Plano por $(1, 0, 0)$, $(0, 1, 0)$, $(0, 0, 1)$.`, steps: [R`$\vec n = (-1, 1, 0)\times(-1, 0, 1) = (1, 1, 1)$.`, R`$x + y + z = 1$.`] }],
      tips: [R`El vector $(a, b, c)$ de $ax + by + cz = d$ es **normal** al plano, no paralelo a él.`],
      see: ["al-producto-vectorial", "al-producto-escalar", "c2-cuadricas"]
    },
    "c2-cuadricas": {
      title: "Superficies cuádricas", aliases: ["cuádrica", "cuádricas", "superficies cuádricas", "elipsoide", "hiperboloide", "paraboloide", "paraboloide hiperbólico", "cono elíptico", "trazas"], concepts: ["c2-cuadricas"],
      summary: "Superficies de segundo grado en x, y, z: elipsoide, hiperboloides de una y dos hojas, cono, paraboloides elíptico e hiperbólico.",
      def: [R`Formas canónicas (con $a, b, c > 0$):`,
        R`**Elipsoide** $\frac{x^2}{a^2} + \frac{y^2}{b^2} + \frac{z^2}{c^2} = 1$; **hiperboloide de una hoja** $\frac{x^2}{a^2} + \frac{y^2}{b^2} - \frac{z^2}{c^2} = 1$; **de dos hojas** $-\frac{x^2}{a^2} - \frac{y^2}{b^2} + \frac{z^2}{c^2} = 1$; **cono** $\frac{x^2}{a^2} + \frac{y^2}{b^2} - \frac{z^2}{c^2} = 0$.`,
        R`**Paraboloide elíptico** $\frac{x^2}{a^2} + \frac{y^2}{b^2} = \frac zc$; **paraboloide hiperbólico** $\frac{x^2}{a^2} - \frac{y^2}{b^2} = \frac zc$ (la silla de montar).`],
      idea: [R`Para reconocerlas se miran las **trazas**: los cortes con planos $z = k$, $x = k$, $y = k$ son [[c2-conicas|cónicas]]. Por ejemplo, en el hiperboloide de dos hojas el corte $z = 0$ es vacío: por eso tiene dos piezas.`,
        R`Regla rápida: una variable lineal es paraboloide; igualado a $0$ es cono; igualado a $1$, el número de signos menos dice si es elipsoide (0), una hoja (1) o dos hojas (2).`],
      demo: [R`**Paso 1 (el método).** Para entender la forma de una superficie la cortamos con planos $z = k$ (y también $x = k$, $y = k$). Al fijar una variable, la ecuación queda de segundo grado en las otras dos: cada corte es una [[c2-conicas|cónica]], y apilando los cortes vemos la superficie.`,
        R`**Paso 2 (hiperboloide de dos hojas).** En $-\frac{x^2}{a^2} - \frac{y^2}{b^2} + \frac{z^2}{c^2} = 1$ fijamos $z = k$ y pasamos el término en $z$ al otro lado, cambiando el signo de todo: $$\frac{x^2}{a^2} + \frac{y^2}{b^2} = \frac{k^2}{c^2} - 1.$$`,
        R`**Paso 3.** El lado izquierdo es una suma de cuadrados, nunca negativa. Si $|k| < c$, el derecho es negativo y no hay puntos; si $|k| = c$, es $0$ y el corte es un solo punto; si $|k| > c$, es positivo y el corte es una elipse. La franja $|z| < c$ queda vacía: la superficie tiene dos piezas.`,
        R`**Paso 4 (hiperboloide de una hoja).** En $\frac{x^2}{a^2} + \frac{y^2}{b^2} - \frac{z^2}{c^2} = 1$, el corte $z = k$ es $\frac{x^2}{a^2} + \frac{y^2}{b^2} = 1 + \frac{k^2}{c^2}$. El lado derecho es siempre positivo: hay una elipse para **todo** $k$, más chica en $k = 0$, así que la superficie es una sola pieza. El corte $x = 0$ es la hipérbola $\frac{y^2}{b^2} - \frac{z^2}{c^2} = 1$, que da el perfil.`,
        R`**Paso 5 (la silla).** En $\frac{x^2}{a^2} - \frac{y^2}{b^2} = \frac zc$, el corte $y = 0$ es la parábola $z = \frac{c}{a^2}x^2$, que abre hacia arriba, y el corte $x = 0$ es $z = -\frac{c}{b^2}y^2$, que abre hacia abajo. En el origen, yendo por el eje $x$ la altura sube y yendo por el eje $y$ baja: un mínimo en una dirección y un máximo en la otra, que es la forma de una silla.`],
      examples: [{ q: R`¿Qué es $x^2 - y^2 + z^2 = 1$?`, steps: [R`Un signo menos, igualado a $1$: hiperboloide de una hoja con eje $y$.`] }],
      see: ["c2-conicas", "c2-rectas-planos", "c2-coord-espacio"]
    },
    "c2-coord-espacio": {
      title: "Coordenadas cilíndricas y esféricas", aliases: ["coordenadas cilíndricas", "coordenadas esféricas", "cilíndricas", "esféricas"], concepts: ["c2-coord-espacio"],
      summary: "Cilíndricas: (r, θ, z), polares en el plano xy más la altura. Esféricas: (ρ, φ, θ), con ρ distancia al origen y φ ángulo desde el eje z.",
      def: [R`**Cilíndricas** $(r, \theta, z)$: $x = r\cos\theta$, $y = r\sin\theta$, $z = z$.`,
        R`**Esféricas** $(\rho, \varphi, \theta)$: $x = \rho\sin\varphi\cos\theta$, $y = \rho\sin\varphi\sin\theta$, $z = \rho\cos\varphi$, con $\rho \ge 0$, $0 \le \varphi \le \pi$.`],
      idea: [R`Se elige el sistema según la simetría: cilindros y conos con eje $z$ se escriben fácil en cilíndricas ($r = 2$ es un cilindro); esferas en esféricas ($\rho = 3$). Simplifican mucho las [[c2-triples|integrales triples]].`],
      demo: [R`**Paso 1 (cilíndricas).** Proyectamos el punto sobre el plano $xy$ y describimos esa sombra en [[c2-polares|polares]]: $x = r\cos\theta$, $y = r\sin\theta$. La altura no cambia, así que $z = z$. Por eso $r$ es la distancia al eje $z$, y $r = 2$ es un cilindro.`,
        R`**Paso 2 (esféricas: la altura).** El punto está a distancia $\rho$ del origen, y $\varphi$ es el ángulo entre el segmento que lo une al origen y el eje $z$. Ese segmento es la hipotenusa de un triángulo rectángulo con un cateto sobre el eje $z$ y el otro horizontal. El cateto vertical, adyacente a $\varphi$, es $z = \rho\cos\varphi$; el horizontal, opuesto, es la distancia al eje: $r = \rho\sin\varphi$.`,
        R`**Paso 3.** Esa distancia al eje es justamente la $r$ de cilíndricas, así que en el plano $xy$ seguimos teniendo $x = r\cos\theta$ e $y = r\sin\theta$. Reemplazamos $r = \rho\sin\varphi$: $$x = \rho\sin\varphi\cos\theta, \qquad y = \rho\sin\varphi\sin\theta, \qquad z = \rho\cos\varphi.$$`,
        R`**Paso 4 (chequeo).** Si las fórmulas están bien, la distancia al origen tiene que dar $\rho$. Sacando factor común y usando $\cos^2 + \sin^2 = 1$ dos veces: $$x^2 + y^2 + z^2 = \rho^2\sin^2\varphi\,(\cos^2\theta + \sin^2\theta) + \rho^2\cos^2\varphi = \rho^2.$$ El rango $0 \le \varphi \le \pi$ alcanza porque con $\theta$ ya damos toda la vuelta.`],
      examples: [{ q: R`Pasá $(1, 1, \sqrt2)$ a esféricas.`, steps: [R`$\rho = \sqrt{1 + 1 + 2} = 2$; $\cos\varphi = \frac{\sqrt2}{2}$, $\varphi = \frac\pi4$; $\theta = \frac\pi4$.`] }],
      tips: [R`En algunos libros $\varphi$ y $\theta$ están intercambiados: fijate cuál se mide desde el eje $z$.`],
      see: ["c2-polares", "c2-cuadricas"]
    }
  };

  E.extendCourse("m102", {
    concepts: { "c2-rectas-planos": { name: "Rectas y planos" }, "c2-cuadricas": { name: "Superficies cuádricas" }, "c2-coord-espacio": { name: "Cilíndricas y esféricas" } },
    templates: T,
    units: [{
      id: "c2-espacio-u", order: 2, program: "Unidad 2", title: "Vectores y geometría del espacio", icon: "grid-3x3",
      diagnostic: ["c2-dist-plano-num", "c2-rectas-mc", "c2-cuadrica-mc"],
      lessons: [
        { id: "c2-rectas-planos", title: "Rectas y planos", templates: ["c2-plano-num", "c2-dist-plano-num", "c2-rectas-mc"], theory: ["c2-rectas-planos"],
          intro: R`Recta: $P + t\vec u$. Plano: $ax + by + cz = d$, con normal $(a, b, c)$.` },
        { id: "c2-superficies", title: "Cuádricas y coordenadas", templates: ["c2-cuadrica-mc", "c2-coord-num"], theory: ["c2-cuadricas", "c2-coord-espacio"],
          intro: R`Las cuádricas se reconocen por sus trazas. Cilíndricas y esféricas aprovechan la simetría.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 3 · SERIES DE POTENCIAS, TAYLOR Y FOURIER
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {};
  const nd = (x, d = 4) => num(x, d).replace(".", "{,}");
  const fact = n => (n <= 1 ? 1 : n * fact(n - 1));
  // aritmética compleja mínima para la fórmula integral de Cauchy
  const cx = {
    mul: (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]],
    div: (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; },
    exp: z => [Math.exp(z[0]) * Math.cos(z[1]), Math.exp(z[0]) * Math.sin(z[1])],
    sin: z => [Math.sin(z[0]) * Math.cosh(z[1]), Math.cos(z[0]) * Math.sinh(z[1])],
    cos: z => [Math.cos(z[0]) * Math.cosh(z[1]), -Math.sin(z[0]) * Math.sinh(z[1])],
    log: z => [Math.log(Math.hypot(z[0], z[1])), Math.atan2(z[1], z[0])]
  };
  // c_n = (1/2π) ∮ f(z) z^{-n-1} dz sobre |z| = ρ (regla del trapecio: converge exponencialmente)
  const cauchyCoef = (f, n, rho) => { const N = 256; let s = 0; for (let j = 0; j < N; j++) { const t = 2 * Math.PI * j / N, fz = f([rho * Math.cos(t), rho * Math.sin(t)]); s += fz[0] * Math.cos(n * t) + fz[1] * Math.sin(n * t); } return s / N / rho ** n; };
  // familias: función compleja, coeficiente exacto como fracción [num, den], tex
  const ax = a => (a === 1 ? "x" : a === -1 ? "-x" : a + "x");
  const FAMS = {
    exp: a => ({ f: z => cx.exp([a * z[0], a * z[1]]), tex: `e^{${ax(a)}}`, c: n => [a ** n, fact(n)], rule: `$e^{u} = \\sum \\frac{u^n}{n!}$ con $u = ${ax(a)}$` }),
    sin: a => ({ f: z => cx.sin([a * z[0], a * z[1]]), tex: `\\sin(${ax(a)})`, c: n => (n % 2 ? [(-1) ** ((n - 1) / 2) * a ** n, fact(n)] : [0, 1]), rule: `$\\sin u = \\sum \\frac{(-1)^k u^{2k+1}}{(2k+1)!}$` }),
    cos: a => ({ f: z => cx.cos([a * z[0], a * z[1]]), tex: `\\cos(${ax(a)})`, c: n => (n % 2 ? [0, 1] : [(-1) ** (n / 2) * a ** n, fact(n)]), rule: `$\\cos u = \\sum \\frac{(-1)^k u^{2k}}{(2k)!}$` }),
    geo: a => ({ f: z => cx.div([1, 0], [1 - a * z[0], -a * z[1]]), tex: `\\frac{1}{1 ${a < 0 ? "+" : "-"} ${Math.abs(a) === 1 ? "" : Math.abs(a)}x}`, c: n => [a ** n, 1], rule: `$\\frac{1}{1 - u} = \\sum u^n$ (serie geométrica)`, rho: 0.5 / Math.abs(a) }),
    log: a => ({ f: z => cx.log([1 + a * z[0], a * z[1]]), tex: `\\ln(1 ${a < 0 ? "-" : "+"} ${Math.abs(a) === 1 ? "" : Math.abs(a)}x)`, c: n => [(-1) ** (n + 1) * a ** n, n], rule: `$\\ln(1 + u) = \\sum_{n \\ge 1} \\frac{(-1)^{n+1}u^n}{n}$`, rho: 0.5 / Math.abs(a) })
  };
  const famFor = (key, a) => { const F = FAMS[key](a); F.rho = F.rho || 0.5; return F; };

  T["c2-radio-num"] = {
    type: "numeric", concepts: ["c2-series-potencias"], difficulty: 2,
    generate(r) {
      const v = r.pick(["np/kn", "kn/np", "x2n", "fact"]), x0 = r.int(-3, 3), ask = r.pick(["R", "der"]), p = r.int(0, 3);
      const xx = x0 === 0 ? "x" : `(${H.xm(x0)})`;
      let k, Rr, logc, m = 1, series;
      if (v === "np/kn") { k = r.int(2, 6); Rr = k; logc = n => p * Math.log(n) - n * Math.log(k); series = `\\sum_{n=1}^\\infty \\frac{${p === 0 ? "1" : p === 1 ? "n" : `n^{${p}}`}}{${k}^n}${xx}^n`; }
      else if (v === "kn/np") { k = r.int(2, 6); Rr = 1 / k; logc = n => n * Math.log(k) - p * Math.log(n); series = `\\sum_{n=1}^\\infty \\frac{${k}^n}{${p === 0 ? "1" : p === 1 ? "n" : `n^{${p}}`}}${xx}^n`; }
      else if (v === "x2n") { k = r.pick([2, 3, 4, 9, 16]); Rr = Math.sqrt(k); m = 2; logc = n => -n * Math.log(k) - p * Math.log(n); series = `\\sum_{n=1}^\\infty \\frac{${xx}^{2n}}{${p === 0 ? "" : p === 1 ? "n\\cdot " : `n^{${p}}\\cdot `}${k}^n}`; }
      else { Rr = Math.E; logc = n => (n * Math.log(n) - n + 0.5 * Math.log(2 * Math.PI * n) + 1 / (12 * n) - 1 / (360 * n ** 3)) - n * Math.log(n); series = `\\sum_{n=1}^\\infty \\frac{n!}{n^n}${xx}^n`; }
      const ans = ask === "R" ? Rr : x0 + Rr;
      return {
        prompt: `Para la serie $${series}$, ¿cuánto vale ${ask === "R" ? "el radio de convergencia $R$" : "el extremo derecho del intervalo de convergencia"}?`,
        answer: ans,
        solution: [`[[c2-series-potencias|Radio de convergencia]] por el [[criterios-series|criterio del cociente]]: la serie converge si $\\lim\\left|\\frac{a_{n+1}}{a_n}\\right| < 1$.`,
          v === "fact" ? `$\\frac{(n+1)!/(n+1)^{n+1}}{n!/n^n}|x - x_0| = \\left(\\frac{n}{n+1}\\right)^n|x - x_0| \\to \\frac{|x - x_0|}{e}$: $R = e$.`
            : v === "x2n" ? `El cociente tiende a $\\frac{|x - x_0|^2}{${k}}$, que es menor que $1$ si $|x - x_0| < \\sqrt{${k}}$: $R = ${nd(Rr)}$.`
              : `El cociente tiende a ${v === "np/kn" ? `$\\frac{|x - x_0|}{${k}}$: $R = ${k}$` : `$${k}|x - x_0|$: $R = ${H.frac(1, k)}$`}${p > 0 ? ` (la potencia $n^{${p}}$ no cambia el radio)` : ""}.`,
          ask === "R" ? `$R \\approx ${nd(Rr)}$.` : `El centro es $${x0}$: el intervalo va de $${x0} - R$ a $${x0} + R \\approx ${nd(ans)}$ (los extremos se estudian aparte).`],
        // verificación: cociente de coeficientes consecutivos calculado numéricamente con n muy grande
        verify: { kind: "value", tol: 1e-5, fn: () => { const n = 1e6, Rn = Math.exp((logc(n) - logc(n + 1)) / m); return ask === "R" ? Rn : x0 + Rn; } }
      };
    }
  };
  T["c2-taylor-num"] = {
    type: "numeric", concepts: ["c2-taylor"], difficulty: 2,
    generate(r) {
      const key = r.pick(["exp", "sin", "cos", "geo", "log"]), a = key === "geo" || key === "log" ? r.pick([1, 2, 3, -1, -2]) : r.pick([1, 2, 3, -1, -2]);
      let n = r.int(2, 5);
      if (key === "sin" && n % 2 === 0) n++;
      if (key === "cos" && n % 2) n++;
      const F = famFor(key, a), [p, q] = F.c(n), ans = p / q;
      return {
        prompt: `¿Cuál es el coeficiente de $x^{${n}}$ en la serie de Maclaurin de $f(x) = ${F.tex}$?`,
        answer: ans,
        solution: [`[[c2-taylor|Series de Maclaurin conocidas]]: ${F.rule}.`, `Reemplazando y mirando el término de grado $${n}$: el coeficiente es $${H.frac(p, q)} \\approx ${nd(ans, 5)}$ (también es $\\frac{f^{(${n})}(0)}{${n}!}$).`],
        // verificación: fórmula integral de Cauchy, c_n = (1/2πi)∮ f(z)/z^{n+1} dz, en el plano complejo
        verify: { kind: "value", tol: 1e-8, fn: () => cauchyCoef(F.f, n, F.rho) }
      };
    }
  };
  T["c2-taylor-aprox-num"] = {
    type: "numeric", concepts: ["c2-taylor"], difficulty: 2,
    generate(r) {
      const key = r.pick(["exp", "sin", "cos", "log"]), deg = r.int(2, 4), x0 = r.pick([0.1, 0.2, 0.3, 0.5, -0.2, -0.4]);
      const F = famFor(key, 1), coefs = Array.from({ length: deg + 1 }, (_, k) => { const [p, q] = k === 0 ? [key === "exp" || key === "cos" ? 1 : 0, 1] : F.c(k); return p / q; });
      const ans = coefs.reduce((s, c, k) => s + c * x0 ** k, 0);
      let polyTex = "";
      for (let k = 0; k <= deg; k++) {
        const [p, q] = k === 0 ? [key === "exp" || key === "cos" ? 1 : 0, 1] : F.c(k);
        if (p === 0) continue;
        const mag = H.frac(Math.abs(p), q), mono = k === 0 ? "" : k === 1 ? "x" : `x^{${k}}`;
        polyTex += (polyTex ? (p < 0 ? " - " : " + ") : (p < 0 ? "-" : "")) + (mono && mag === "1" ? "" : mag) + mono;
      }
      const name = { exp: "e^{x}", sin: "\\sin x", cos: "\\cos x", log: "\\ln(1 + x)" }[key];
      return {
        prompt: `Usá el polinomio de Taylor de grado $${deg}$ de $f(x) = ${name}$ alrededor de $0$ para aproximar $f(${String(x0).replace(".", "{,}")})$.`,
        answer: ans,
        solution: [`[[c2-taylor|Polinomio de Taylor]]: $P_${deg}(x) = \\sum_{k=0}^{${deg}}\\frac{f^{(k)}(0)}{k!}x^k = ${polyTex}$.`, `$P_${deg}(${String(x0).replace(".", "{,}")}) \\approx ${nd(ans, 6)}$; el error es del orden del primer término omitido.`],
        verify: { kind: "value", tol: 1e-8, fn: () => { let s = key === "exp" || key === "cos" ? 1 : 0; for (let k = 1; k <= deg; k++) s += cauchyCoef(F.f, k, 0.5) * x0 ** k; return s; } }
      };
    }
  };
  const SER = [
    { f: "e^{x}", s: "\\sum_{n=0}^\\infty \\frac{x^n}{n!}", fn: Math.exp, t: (n, x) => x ** n / fact(n) },
    { f: "e^{-x}", s: "\\sum_{n=0}^\\infty \\frac{(-1)^n x^n}{n!}", fn: x => Math.exp(-x), t: (n, x) => (-x) ** n / fact(n) },
    { f: "\\sin x", s: "\\sum_{n=0}^\\infty \\frac{(-1)^n x^{2n+1}}{(2n+1)!}", fn: Math.sin, t: (n, x) => (-1) ** n * x ** (2 * n + 1) / fact(2 * n + 1) },
    { f: "\\cos x", s: "\\sum_{n=0}^\\infty \\frac{(-1)^n x^{2n}}{(2n)!}", fn: Math.cos, t: (n, x) => (-1) ** n * x ** (2 * n) / fact(2 * n) },
    { f: "\\frac{1}{1 - x}", s: "\\sum_{n=0}^\\infty x^n", fn: x => 1 / (1 - x), t: (n, x) => x ** n },
    { f: "\\frac{1}{1 + x^2}", s: "\\sum_{n=0}^\\infty (-1)^n x^{2n}", fn: x => 1 / (1 + x * x), t: (n, x) => (-1) ** n * x ** (2 * n) },
    { f: "\\ln(1 + x)", s: "\\sum_{n=1}^\\infty \\frac{(-1)^{n+1}x^n}{n}", fn: Math.log1p, t: (n, x) => (n === 0 ? 0 : (-1) ** (n + 1) * x ** n / n) },
    { f: "\\arctan x", s: "\\sum_{n=0}^\\infty \\frac{(-1)^n x^{2n+1}}{2n+1}", fn: Math.atan, t: (n, x) => (-1) ** n * x ** (2 * n + 1) / (2 * n + 1) }
  ];
  T["c2-series-match"] = {
    type: "match", concepts: ["c2-taylor"], difficulty: 2,
    generate(r) {
      const pick = r.sample(SER, 4);
      return {
        prompt: `Uní cada función con su serie de Maclaurin.`,
        pairs: pick.map(p => [{ tex: p.f }, { tex: p.s }]),
        solution: [`[[c2-taylor|Las series que conviene saber]]: $e^x$ tiene todos los $\\frac{1}{n!}$; $\\sin$ y $\\cos$ alternan con potencias impares y pares; $\\frac{1}{1 - x}$ es la geométrica; $\\ln(1 + x)$ y $\\arctan x$ salen de integrar geométricas.`],
        // verificación: cada serie, sumada hasta 60 términos en x = 0,3, coincide con su función
        verify: { kind: "truth", target: true, fn: () => pick.every(p => { let s = 0; for (let n = 0; n < 60; n++) s += p.t(n, 0.3); return Math.abs(s - p.fn(0.3)) < 1e-12; }) }
      };
    }
  };
  T["c2-fourier-num"] = {
    type: "numeric", concepts: ["c2-fourier"], difficulty: 3,
    generate(r) {
      const v = r.pick(["x", "cuadrada", "x2", "abs"]), A = r.int(1, 4);
      let f, ask, n, ans, ftex, sol;
      if (v === "x") { n = r.int(1, 6); f = x => A * x; ask = "b"; ans = 2 * A * (-1) ** (n + 1) / n; ftex = `f(x) = ${A === 1 ? "" : A}x`; sol = `Es impar: solo hay senos. $b_n = \\frac1\\pi\\int_{-\\pi}^{\\pi}${A === 1 ? "" : A}x\\sin(nx)\\,dx = \\frac{${2 * A}(-1)^{n+1}}{n}$ (por partes).`; }
      else if (v === "cuadrada") { n = r.pick([1, 3, 5, 7]); f = x => A * Math.sign(x); ask = "b"; ans = 4 * A / (n * Math.PI); ftex = `f(x) = ${A}` + ` \\text{ si } 0 < x < \\pi,\\ f(x) = -${A} \\text{ si } -\\pi < x < 0`; sol = `Es impar: $b_n = \\frac2\\pi\\int_0^\\pi ${A}\\sin(nx)\\,dx = \\frac{${2 * A}}{n\\pi}(1 - (-1)^n)$, que vale $\\frac{${4 * A}}{n\\pi}$ para $n$ impar.`; }
      else if (v === "x2") { n = r.int(0, 5); f = x => A * x * x; ask = n === 0 ? "a0" : "a"; ans = n === 0 ? A * Math.PI ** 2 / 3 : 4 * A * (-1) ** n / (n * n); ftex = `f(x) = ${A === 1 ? "" : A}x^2`; sol = `Es par: solo cosenos. ${n === 0 ? `El término constante es el promedio: $\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}${A === 1 ? "" : A}x^2\\,dx = \\frac{${A}\\pi^2}{3}$.` : `$a_n = \\frac1\\pi\\int_{-\\pi}^{\\pi}${A === 1 ? "" : A}x^2\\cos(nx)\\,dx = \\frac{${4 * A}(-1)^n}{n^2}$ (por partes dos veces).`}`; }
      else { n = r.pick([0, 1, 3, 5]); f = x => A * Math.abs(x); ask = n === 0 ? "a0" : "a"; ans = n === 0 ? A * Math.PI / 2 : -4 * A / (Math.PI * n * n); ftex = `f(x) = ${A === 1 ? "" : A}|x|`; sol = `Es par. ${n === 0 ? `El término constante es el promedio, $\\frac{${A}\\pi}{2}$.` : `$a_n = \\frac2\\pi\\int_0^\\pi ${A === 1 ? "" : A}x\\cos(nx)\\,dx = \\frac{${2 * A}((-1)^n - 1)}{\\pi n^2}$, que para $n$ impar vale $-\\frac{${4 * A}}{\\pi n^2}$.`}`; }
      return {
        prompt: `En la serie de Fourier de $${ftex}$ en $[-\\pi, \\pi]$, ¿cuánto vale ${ask === "a0" ? "el término constante $\\frac{a_0}{2}$" : ask === "a" ? `el coeficiente $a_{${n}}$ de $\\cos(${n}x)$` : `el coeficiente $b_{${n}}$ de $\\sin(${n === 1 ? "" : n}x)$`}?`,
        answer: ans,
        solution: [`[[c2-fourier|Coeficientes de Fourier]]: $a_n = \\frac1\\pi\\int_{-\\pi}^{\\pi}f(x)\\cos(nx)\\,dx$, $b_n = \\frac1\\pi\\int_{-\\pi}^{\\pi}f(x)\\sin(nx)\\,dx$.`, sol, `Valor: $\\approx ${nd(ans)}$.`],
        verify: { kind: "integral", tol: 1e-7, a: -Math.PI, b: Math.PI, f: ask === "a0" ? x => f(x) / (2 * Math.PI) : ask === "a" ? x => f(x) * Math.cos(n * x) / Math.PI : x => f(x) * Math.sin(n * x) / Math.PI }
      };
    }
  };
  T["c2-series-vf"] = {
    type: "tf", concepts: ["c2-series-potencias"], difficulty: 2,
    generate(r) {
      const k = r.int(2, 6), x = r.pick([-k - 1, -k + 1, k - 1, k + 1, Math.round(k / 2), -Math.round(k / 2), k + 2].filter(v => Math.abs(v) !== k));
      const ans = Math.abs(x) < k;
      return {
        prompt: `<b>Verdadero o falso:</b> la serie $\\sum_{n=0}^\\infty \\frac{x^n}{${k}^n}$ converge en $x = ${x}$.`,
        answer: ans,
        explanation: `Es una [[series|serie geométrica]] de razón $\\frac{x}{${k}}$: converge si $|x| < ${k}$, o sea [[c2-series-potencias|radio de convergencia]] $R = ${k}$. En $x = ${x}$ la razón es $${H.frac(x, k)}$, ${ans ? "de módulo menor que 1" : "de módulo mayor que 1"}.`,
        solution: [`Dentro del radio converge (absolutamente); fuera diverge porque los términos no tienden a $0$.`],
        // verificación: sumas parciales; si convergen, las de 400 y 800 términos coinciden
        verify: { kind: "truth", fn: () => { let s = 0, s400 = 0; for (let n = 0; n <= 800; n++) { s += (x / k) ** n; if (n === 400) s400 = s; } return Number.isFinite(s) && Math.abs(s - s400) < 1e-9; } }
      };
    }
  };

  const cards = {
    "c2-series-potencias": {
      title: "Series de potencias", aliases: ["serie de potencias", "series de potencias", "radio de convergencia", "intervalo de convergencia"], concepts: ["c2-series-potencias"],
      summary: "Σ cₙ(x − a)ⁿ converge en un intervalo centrado en a de radio R (y diverge afuera). R sale del criterio del cociente o de la raíz.",
      def: [R`Una **serie de potencias** centrada en $a$ es $\sum_{n=0}^\infty c_n(x - a)^n$. Existe $R \in [0, \infty]$, el **radio de convergencia**, tal que converge absolutamente si $|x - a| < R$ y diverge si $|x - a| > R$.`,
        R`Si existe, $R = \lim\left|\frac{c_n}{c_{n+1}}\right|$ ([[criterios-series|criterio del cociente]]). En los extremos $x = a \pm R$ hay que estudiar cada [[series|serie]] por separado.`],
      idea: [R`Una serie de potencias es un "polinomio infinito": dentro del radio se puede derivar e integrar término a término, y el radio no cambia.`,
        R`Un factor como $n^p$ no cambia el radio (porque $\left(\frac{n+1}{n}\right)^p \to 1$), pero sí puede cambiar qué pasa en los extremos.`],
      demo: [R`**Paso 1 (si converge en un punto, converge más cerca).** Supongamos que la serie converge en un $x_0 \neq a$. Entonces sus términos tienden a $0$ (condición necesaria de toda [[series|serie]]), y una sucesión que tiende a $0$ está acotada: existe $M$ con $|c_n(x_0 - a)^n| \le M$ para todo $n$.`,
        R`**Paso 2.** Tomamos un $x$ más cerca del centro: $|x - a| < |x_0 - a|$. Llamamos $q = \frac{|x - a|}{|x_0 - a|}$, que es menor que $1$, y reescribimos cada término comparándolo con el de $x_0$: $$|c_n(x - a)^n| = |c_n(x_0 - a)^n|\,q^n \le M q^n.$$`,
        R`**Paso 3.** La geométrica $\sum Mq^n$ converge porque $q < 1$. Por comparación, $\sum|c_n(x - a)^n|$ converge: la serie converge absolutamente en $x$.`,
        R`**Paso 4 (aparece el radio).** Sea $R$ el supremo de las distancias $|x_0 - a|$ de los puntos donde la serie converge. Si $|x - a| < R$, hay un punto de convergencia más lejos que $x$, y por el Paso 3 converge absolutamente en $x$. Si $|x - a| > R$, no puede converger: $R$ no sería el supremo. Los extremos $|x - a| = R$ quedan sin decidir.`,
        R`**Paso 5 (el radio por el cociente).** Aplicamos el [[criterios-series|criterio del cociente]] a $\sum|c_n(x - a)^n|$, con $x \neq a$: $$\frac{|c_{n+1}|\,|x - a|^{n+1}}{|c_n|\,|x - a|^n} = \left|\frac{c_{n+1}}{c_n}\right||x - a| \to \frac{|x - a|}{L}, \qquad L = \lim\left|\frac{c_n}{c_{n+1}}\right|.$$`,
        R`**Paso 6.** El criterio dice que converge si ese límite es menor que $1$, o sea si $|x - a| < L$, y que diverge (los términos no tienden a $0$) si es mayor que $1$, o sea si $|x - a| > L$. Esa es exactamente la propiedad que define el radio: $R = L$. $\blacksquare$`],
      examples: [{ q: R`Radio de $\sum \frac{(x-1)^n}{3^n n}$.`, steps: [R`$\left|\frac{c_n}{c_{n+1}}\right| = \frac{3^{n+1}(n+1)}{3^n n} \to 3$.`, R`$R = 3$: converge en $(-2, 4)$; en $x = 4$ es la armónica (diverge) y en $x = -2$, la armónica alternada (converge).`] }],
      tips: [R`El intervalo está centrado en $a$, no en $0$: con $(x - 1)^n$ y $R = 3$ va de $-2$ a $4$.`],
      see: ["c2-taylor", "series", "criterios-series"]
    },
    "c2-taylor": {
      title: "Series de Taylor y Maclaurin", aliases: ["serie de Taylor", "series de Taylor", "polinomio de Taylor", "polinomios de Taylor", "serie de Maclaurin", "series de Maclaurin", "Maclaurin"], concepts: ["c2-taylor"],
      summary: "f(x) = Σ f⁽ⁿ⁾(a)/n! · (x − a)ⁿ cuando la serie converge a f. Con a = 0 se llama de Maclaurin.",
      def: [R`La **serie de Taylor** de $f$ en $a$ es $\sum_{n=0}^\infty\frac{f^{(n)}(a)}{n!}(x - a)^n$; con $a = 0$, **de Maclaurin**. El **polinomio de Taylor** de grado $n$, $P_n$, es la suma hasta $n$.`,
        R`**Resto de Lagrange:** $f(x) - P_n(x) = \frac{f^{(n+1)}(\xi)}{(n+1)!}(x - a)^{n+1}$ para algún $\xi$ entre $a$ y $x$.`],
      idea: [R`$P_n$ es el polinomio que mejor imita a $f$ cerca de $a$: coincide con ella en el valor y en las primeras $n$ [[derivadas-sucesivas|derivadas]]. $P_1$ es la [[recta-tangente|recta tangente]].`,
        R`Las series que conviene saber: $e^x = \sum\frac{x^n}{n!}$, $\sin x = \sum\frac{(-1)^nx^{2n+1}}{(2n+1)!}$, $\cos x = \sum\frac{(-1)^nx^{2n}}{(2n)!}$, $\frac{1}{1-x} = \sum x^n$, $\ln(1+x) = \sum_{n\ge1}\frac{(-1)^{n+1}x^n}{n}$. Las demás se obtienen sustituyendo, derivando o integrando.`],
      demo: [R`**Paso 1 (los coeficientes están forzados).** Supongamos que $f(x) = \sum_{n\ge0} c_n(x - a)^n$ con radio positivo. Adentro del radio, la serie se puede derivar término a término (ver [[c2-series-potencias]]). Derivando $k$ veces, los términos con $n < k$ desaparecen (son polinomios de grado menor que $k$), y el de $n = k$ queda $k!\,c_k$.`,
        R`**Paso 2.** Evaluamos en $x = a$. Los términos con $n > k$ todavía tienen un factor $(x - a)^{n-k}$, que vale $0$. Sobrevive solo $k!\,c_k$: $$f^{(k)}(a) = k!\,c_k \quad\Longrightarrow\quad c_k = \frac{f^{(k)}(a)}{k!}.$$ Así que, si $f$ es una serie de potencias, es su serie de Taylor.`,
        R`**Paso 3 (resto: una función auxiliar).** Fijamos $x$ y queremos medir el error $f(x) - P_n(x)$. Para $t$ entre $a$ y $x$ definimos $$g(t) = f(x) - \sum_{k=0}^n\frac{f^{(k)}(t)}{k!}(x - t)^k - K\,\frac{(x - t)^{n+1}}{(n+1)!},$$ y elegimos la constante $K$ para que $g(a) = 0$. Además $g(x) = 0$, porque en $t = x$ la suma se reduce a $f(x)$ y el último término se anula.`,
        R`**Paso 4.** Como $g$ vale $0$ en $a$ y en $x$, por el teorema de [[valor-medio|Rolle]] hay un $\xi$ entre los dos con $g'(\xi) = 0$.`,
        R`**Paso 5.** Calculamos $g'(t)$. Al derivar cada término de la suma con la [[regla-producto|regla del producto]] salen dos pedazos, y los pedazos de términos vecinos se cancelan en cadena (suma telescópica). Sobrevive solo el último: $$g'(t) = -\frac{f^{(n+1)}(t)}{n!}(x - t)^n + K\,\frac{(x - t)^n}{n!}.$$`,
        R`**Paso 6.** Igualando a $0$ en $t = \xi$ (donde $x - \xi \neq 0$), sale $K = f^{(n+1)}(\xi)$. Y como $g(a) = 0$ significa justamente $f(x) - P_n(x) = K\frac{(x - a)^{n+1}}{(n+1)!}$, queda $$f(x) - P_n(x) = \frac{f^{(n+1)}(\xi)}{(n+1)!}(x - a)^{n+1}.$$ $\blacksquare$`],
      examples: [{ q: R`Coeficiente de $x^4$ en $\cos(2x)$.`, steps: [R`$\cos u = 1 - \frac{u^2}{2} + \frac{u^4}{24} - \dots$ con $u = 2x$.`, R`$\frac{(2x)^4}{24} = \frac{16}{24}x^4$: el coeficiente es $\frac23$.`] }],
      tips: [R`Sustituir $u = 2x$ cambia **todo** el término: $(2x)^4 = 16x^4$, no $2x^4$.`],
      see: ["c2-series-potencias", "derivadas-sucesivas", "c2-fourier"]
    },
    "c2-fourier": {
      title: "Series de Fourier", aliases: ["serie de Fourier", "series de Fourier", "coeficientes de Fourier"], concepts: ["c2-fourier"],
      summary: "Una función 2π-periódica se escribe como a₀/2 + Σ(aₙ cos nx + bₙ sen nx), con aₙ = (1/π)∫f cos nx y bₙ = (1/π)∫f sen nx.",
      def: [R`La **serie de Fourier** de $f$ en $[-\pi, \pi]$ es $\frac{a_0}{2} + \sum_{n=1}^\infty\left(a_n\cos nx + b_n\sin nx\right)$, con $$a_n = \frac1\pi\int_{-\pi}^{\pi}f(x)\cos(nx)\,dx, \qquad b_n = \frac1\pi\int_{-\pi}^{\pi}f(x)\sin(nx)\,dx.$$`],
      idea: [R`Taylor aproxima cerca de un punto; Fourier aproxima en todo un período y admite saltos. Los coeficientes salen de que $\cos(nx)$ y $\sin(mx)$ son **ortogonales**: la integral de su producto en un período es $0$ si no son la misma función, igual que una [[al-gram-schmidt|base ortogonal]].`,
        R`**Paridad:** si $f$ es par, todos los $b_n$ son $0$ (solo cosenos); si es impar, todos los $a_n$ son $0$ (solo senos). En un salto, la serie converge al promedio de los dos lados.`],
      demo: [R`**Paso 1 (ortogonalidad de los cosenos).** Usamos la fórmula de producto a suma, que sale de sumar las de [[identidades-trig|suma y resta de ángulos]]: $$\begin{aligned}&\cos(nx)\cos(mx) \\ &\quad= \frac12\big[\cos((n - m)x) + \cos((n + m)x)\big].\end{aligned}$$`,
        R`**Paso 2.** Integramos en $[-\pi, \pi]$. Para un entero $j \neq 0$, $\int_{-\pi}^{\pi}\cos(jx)\,dx = \frac{\sin(j\pi) - \sin(-j\pi)}{j} = 0$, porque el seno se anula en múltiplos de $\pi$. Si $n \neq m$, las dos frecuencias $n - m$ y $n + m$ son enteros no nulos y la integral da $0$. Si $n = m \ge 1$, el primer coseno es $\cos 0 = 1$ y queda $\int_{-\pi}^{\pi}\frac12\,dx = \pi$.`,
        R`**Paso 3 (los demás productos).** Con $\sin(nx)\sin(mx) = \frac12[\cos((n - m)x) - \cos((n + m)x)]$ sale, igual, $0$ si $n \neq m$ y $\pi$ si $n = m$. Y $\sin(nx)\cos(mx)$ es impar (impar por par), así que su integral en un intervalo simétrico es siempre $0$.`,
        R`**Paso 4 (los coeficientes).** Suponemos $f(x) = \frac{a_0}{2} + \sum_k(a_k\cos kx + b_k\sin kx)$ y multiplicamos los dos lados por $\cos(nx)$, con $n \ge 1$. Integramos en $[-\pi, \pi]$ término a término. Por los Pasos 2 y 3, todos los productos dan $0$ salvo $a_n\cos(nx)\cos(nx)$, que da $a_n\pi$: $$\int_{-\pi}^{\pi}f(x)\cos(nx)\,dx = a_n\pi.$$ Despejando sale la fórmula de $a_n$. Con $\sin(nx)$ en lugar del coseno sale $b_n$.`,
        R`**Paso 5 (el término constante).** Para $n = 0$ multiplicamos por $1 = \cos(0x)$: el único término que no se anula es $\frac{a_0}{2}$, que integrado da $\frac{a_0}{2}\cdot2\pi = a_0\pi$. Por eso la fórmula de $a_n$ vale también con $n = 0$, y es para eso que se escribe $\frac{a_0}{2}$.`,
        R`**Paso 6 (paridad).** Si $f$ es par, $f(x)\sin(nx)$ es par por impar, o sea impar, y su integral en $[-\pi, \pi]$ es $0$: todos los $b_n$ se anulan. Si $f$ es impar, el que es impar es $f(x)\cos(nx)$, y se anulan los $a_n$ (ver [[integral-definida]]). $\blacksquare$`],
      examples: [{ q: R`Serie de $f(x) = x$ en $[-\pi, \pi]$.`, steps: [R`Impar: $a_n = 0$. Por partes, $b_n = \frac{2(-1)^{n+1}}{n}$.`, R`$x = 2\left(\sin x - \frac{\sin 2x}{2} + \frac{\sin 3x}{3} - \dots\right)$.`] }],
      tips: [R`$\frac{a_0}{2}$ es el promedio de $f$: no te olvides del $\frac12$.`],
      see: ["c2-taylor", "al-gram-schmidt"]
    }
  };

  E.extendCourse("m102", {
    concepts: { "c2-series-potencias": { name: "Series de potencias" }, "c2-taylor": { name: "Taylor y Maclaurin" }, "c2-fourier": { name: "Series de Fourier" } },
    templates: T,
    units: [{
      id: "c2-series-u", order: 3, program: "Unidad 3", title: "Series de potencias, Taylor y Fourier", icon: "sigma",
      diagnostic: ["c2-radio-num", "c2-taylor-num", "c2-fourier-num"],
      lessons: [
        { id: "c2-potencias", title: "Series de potencias", templates: ["c2-series-vf", "c2-radio-num"], theory: ["c2-series-potencias"],
          intro: R`Convergen en un intervalo de radio $R = \lim\left|\frac{c_n}{c_{n+1}}\right|$ centrado en $a$.` },
        { id: "c2-taylor", title: "Taylor y Maclaurin", templates: ["c2-series-match", "c2-taylor-num", "c2-taylor-aprox-num"], theory: ["c2-taylor"],
          intro: R`$f(x) = \sum\frac{f^{(n)}(a)}{n!}(x - a)^n$. Conviene saber de memoria las de $e^x$, $\sin$, $\cos$, $\frac{1}{1-x}$ y $\ln(1+x)$.` },
        { id: "c2-fourier", title: "Series de Fourier", templates: ["c2-fourier-num"], theory: ["c2-fourier"],
          intro: R`$a_n = \frac1\pi\int f\cos nx$, $b_n = \frac1\pi\int f\sin nx$. Par: solo cosenos; impar: solo senos.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 4 · FUNCIONES VECTORIALES
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {};
  const nd = (x, d = 4) => num(x, d).replace(".", "{,}");
  const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
  const norm = a => Math.sqrt(dot(a, a));
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const sub = (a, b) => a.map((x, i) => x - b[i]);
  // curvatura geométrica: 1/radio de la circunferencia que pasa por tres puntos muy cercanos de la curva
  const kappa3 = (r, t, h = 1e-3) => { const A = r(t - h), B = r(t), C = r(t + h), a = norm(sub(B, C)), b = norm(sub(A, C)), c = norm(sub(A, B)), area2 = norm(cross(sub(B, A), sub(C, A))); return 2 * area2 / (a * b * c); };
  const mono = (c, s) => (c === 0 ? "0" : c === 1 ? s : c === -1 ? "-" + s : c + s);
  // familias de curvas: r(t), r'(t), r''(t) y su tex
  function curve(r) {
    if (r.bool()) {
      const a = r.int(1, 5), b = r.int(1, 5);
      return { tex: `\\vec r(t) = \\left(${mono(a, "\\cos t")},\\ ${mono(a, "\\sin t")},\\ ${mono(b, "t")}\\right)`, r: t => [a * Math.cos(t), a * Math.sin(t), b * t], d1: t => [-a * Math.sin(t), a * Math.cos(t), b], d2: t => [-a * Math.cos(t), -a * Math.sin(t), 0], helix: [a, b] };
    }
    const p = r.nz(-3, 3), q = r.nz(-3, 3), s = r.nz(-2, 2);
    return { tex: `\\vec r(t) = \\left(${mono(q, "t")},\\ ${mono(p, "t^2")},\\ ${mono(s, "t^3")}\\right)`, r: t => [q * t, p * t * t, s * t ** 3], d1: t => [q, 2 * p * t, 3 * s * t * t], d2: t => [0, 2 * p, 6 * s * t] };
  }

  T["c2-vel-num"] = {
    type: "numeric", concepts: ["c2-curvas-vectoriales"], difficulty: 1,
    generate(r) {
      const C = curve(r), t0 = r.int(-2, 2), v = C.d1(t0), sp = norm(v);
      return {
        prompt: `Una partícula recorre $${C.tex}$. ¿Cuál es su rapidez en $t = ${t0}$?`,
        answer: sp,
        solution: [`[[c2-curvas-vectoriales|Velocidad]]: $\\vec v = \\vec r\\,'(t)$, derivando componente a componente; la rapidez es $|\\vec v|$.`, `$\\vec r\\,'(${t0}) \\approx (${v.map(x => nd(x)).join(",\\ ")})$, así que $|\\vec v| \\approx ${nd(sp)}$.`],
        // verificación: distancia entre dos posiciones muy cercanas dividida por el tiempo
        verify: { kind: "value", tol: 1e-6, fn: () => { const h = 1e-5; return norm(sub(C.r(t0 + h), C.r(t0 - h))) / (2 * h); } }
      };
    }
  };
  T["c2-integral-vect-num"] = {
    type: "numeric", concepts: ["c2-curvas-vectoriales"], difficulty: 2,
    generate(r) {
      const a = r.nz(-4, 4), b = r.nz(-4, 4), c = r.nz(-3, 3), P = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)], t1 = r.int(1, 3), k = r.int(0, 2);
      const sol = [P[0] + a * t1, P[1] + b * t1 * t1 / 2, P[2] + c * t1 ** 3 / 3];
      return {
        prompt: `Una partícula tiene velocidad $\\vec v(t) = \\left(${a},\\ ${mono(b, "t")},\\ ${mono(c, "t^2")}\\right)$ y en $t = 0$ está en $(${P.join(", ")})$. ¿Cuánto vale su coordenada $${"xyz"[k]}$ en $t = ${t1}$?`,
        answer: sol[k],
        solution: [`[[c2-curvas-vectoriales|Integral de una función vectorial]]: se integra componente a componente y la constante sale de la posición inicial.`, `$\\vec r(t) = \\left(${P[0]} ${a < 0 ? "-" : "+"} ${Math.abs(a)}t,\\ ${P[1]} ${b < 0 ? "-" : "+"} ${H.frac(Math.abs(b), 2)}t^2,\\ ${P[2]} ${c < 0 ? "-" : "+"} ${H.frac(Math.abs(c), 3)}t^3\\right)$.`, `En $t = ${t1}$: $${"xyz"[k]} = ${nd(sol[k])}$.`],
        verify: { kind: "ode", f: t => [a, b * t, c * t * t], y0: P.slice(), t1, dt: 1e-3, out: (_, y) => y[k], tol: 1e-8 }
      };
    }
  };
  T["c2-curvatura-num"] = {
    type: "numeric", concepts: ["c2-curvatura"], difficulty: 3,
    generate(r) {
      if (r.bool()) {
        const c = r.nz(-3, 3), d = r.int(-3, 3), x0 = r.int(-2, 2), fp = 2 * c * x0 + d, k = Math.abs(2 * c) / (1 + fp * fp) ** 1.5;
        return {
          prompt: `Calculá la curvatura de $y = ${H.poly([[c, "x^{2}"], [d, "x"]])}$ en $x = ${x0}$.`,
          answer: k,
          solution: [`[[c2-curvatura|Curvatura de un gráfico]]: $\\kappa = \\frac{|y''|}{(1 + y'^2)^{3/2}}$.`, `$y' = ${2 * c}x ${d < 0 ? "-" : "+"} ${Math.abs(d)}$ vale $${fp}$ en $x = ${x0}$; $y'' = ${2 * c}$.`, `$\\kappa = \\frac{${Math.abs(2 * c)}}{(1 + ${fp * fp})^{3/2}} \\approx ${nd(k, 5)}$.`],
          verify: { kind: "value", tol: 1e-4, fn: () => kappa3(t => [t, c * t * t + d * t, 0], x0) }
        };
      }
      const C = curve(r), t0 = C.helix ? r.int(0, 3) : r.int(-1, 1), v = C.d1(t0), a = C.d2(t0), k = norm(cross(v, a)) / norm(v) ** 3;
      return {
        prompt: `Calculá la curvatura de $${C.tex}$ en $t = ${t0}$.`,
        answer: k,
        solution: [`[[c2-curvatura|Curvatura]]: $\\kappa = \\frac{|\\vec r\\,' \\times \\vec r\\,''|}{|\\vec r\\,'|^3}$.`, C.helix ? `Para la hélice, $|\\vec r\\,'\\times\\vec r\\,''| = ${C.helix[0]}\\sqrt{${C.helix[0] ** 2 + C.helix[1] ** 2}}$ y $|\\vec r\\,'| = \\sqrt{${C.helix[0] ** 2 + C.helix[1] ** 2}}$: $\\kappa = \\frac{${C.helix[0]}}{${C.helix[0] ** 2 + C.helix[1] ** 2}}$, la misma en todos los puntos.` : `$\\vec r\\,'(${t0}) = (${v.join(", ")})$, $\\vec r\\,''(${t0}) = (${a.join(", ")})$.`, `$\\kappa \\approx ${nd(k, 5)}$.`],
        verify: { kind: "value", tol: 1e-4, fn: () => kappa3(C.r, t0) }
      };
    }
  };
  T["c2-aceleracion-num"] = {
    type: "numeric", concepts: ["c2-curvatura"], difficulty: 3,
    generate(r) {
      const p = r.nz(-3, 3), q = r.nz(-2, 2), t0 = r.int(-2, 2), ask = r.pick(["T", "N"]);
      const rr = t => [t, p * t * t, q * t ** 3], v = [1, 2 * p * t0, 3 * q * t0 * t0], a = [0, 2 * p, 6 * q * t0];
      const aT = dot(v, a) / norm(v), aN = norm(cross(v, a)) / norm(v);
      return {
        prompt: `Para $\\vec r(t) = \\left(t,\\ ${mono(p, "t^2")},\\ ${mono(q, "t^3")}\\right)$, calculá la componente ${ask === "T" ? "tangencial" : "normal"} de la aceleración en $t = ${t0}$.`,
        answer: ask === "T" ? aT : aN,
        solution: [`[[c2-curvatura|Componentes de la aceleración]]: $a_T = \\frac{\\vec v\\cdot\\vec a}{|\\vec v|}$ (cambio de rapidez) y $a_N = \\frac{|\\vec v\\times\\vec a|}{|\\vec v|}$ (cambio de dirección).`, `$\\vec v = (${v.join(", ")})$, $\\vec a = (${a.join(", ")})$.`, `$a_${ask} \\approx ${nd(ask === "T" ? aT : aN)}$.`],
        // verificación: a_T es la derivada de la rapidez, y a_N² = |a|² − a_T² (todo con diferencias finitas sobre la posición)
        verify: { kind: "value", tol: 1e-4, fn: () => {
          const speed = t => { const h = 1e-5; return norm(sub(rr(t + h), rr(t - h))) / (2 * h); };
          const H2 = 1e-3, at = (speed(t0 + H2) - speed(t0 - H2)) / (2 * H2);
          if (ask === "T") return at;
          const acc = rr(t0 + H2).map((x, i) => (x - 2 * rr(t0)[i] + rr(t0 - H2)[i]) / (H2 * H2));
          return Math.sqrt(Math.max(0, dot(acc, acc) - at * at));
        } }
      };
    }
  };
  T["c2-helice-vf"] = {
    type: "tf", concepts: ["c2-curvatura"], difficulty: 2,
    generate(r) {
      const [a, b] = r.distinct(2, 1, 5), v = r.pick(["ok", "1/a", "b"]);
      const X = { ok: [a, a * a + b * b], "1/a": [1, a], b: [b, a * a + b * b] }[v];
      return {
        prompt: `<b>Verdadero o falso:</b> la hélice $\\vec r(t) = (${mono(a, "\\cos t")},\\ ${mono(a, "\\sin t")},\\ ${mono(b, "t")})$ tiene curvatura constante igual a $${H.frac(X[0], X[1])}$.`,
        answer: v === "ok",
        explanation: `Para la hélice, $\\kappa = \\frac{a}{a^2 + b^2} = ${H.frac(a, a * a + b * b)}$ en todos los puntos ([[c2-curvatura]]). ${v === "1/a" ? "Sería $\\frac1a$ si no subiera ($b = 0$): sería una circunferencia." : ""}`,
        solution: [`$|\\vec r\\,'\\times\\vec r\\,''| = a\\sqrt{a^2 + b^2}$ y $|\\vec r\\,'|^3 = (a^2 + b^2)^{3/2}$.`],
        verify: { kind: "truth", fn: () => [0.3, 1.7].every(t => Math.abs(kappa3(tt => [a * Math.cos(tt), a * Math.sin(tt), b * tt], t) - X[0] / X[1]) < 1e-4 * (X[0] / X[1])) }
      };
    }
  };

  const cards = {
    "c2-curvas-vectoriales": {
      title: "Funciones vectoriales y curvas en el espacio", aliases: ["función vectorial", "funciones vectoriales", "curva en el espacio", "curvas en el espacio", "hélice"], concepts: ["c2-curvas-vectoriales"],
      summary: "r(t) = (x(t), y(t), z(t)). Se deriva e integra componente a componente: r' es la velocidad (tangente a la curva) y |r'| la rapidez.",
      def: [R`Una **función vectorial** asigna a cada $t$ un vector $\vec r(t) = (x(t), y(t), z(t))$; su imagen es una curva en el espacio.`,
        R`**Límites, derivadas e integrales** se hacen componente a componente: $\vec r\,'(t) = (x'(t), y'(t), z'(t))$ y $\int\vec r(t)\,dt = \left(\int x, \int y, \int z\right) + \vec C$.`],
      idea: [R`Si $\vec r$ es la posición de una partícula, $\vec r\,'$ es la **velocidad** (tangente a la trayectoria) y $\vec r\,''$ la **aceleración**, como en [[f1-mruv|cinemática]]. Longitud de arco: $\int_a^b|\vec r\,'(t)|\,dt$, igual que en las [[c2-parametricas|curvas paramétricas]].`,
        R`La **hélice** $(a\cos t, a\sin t, bt)$ gira alrededor del eje $z$ mientras sube: es una circunferencia "estirada".`],
      demo: [R`**Paso 1 (componente a componente).** Para un vector $\vec v = (v_x, v_y, v_z)$ valen $|v_i| \le |\vec v|$ (un cateto no supera a la hipotenusa) y $|\vec v| \le |v_x| + |v_y| + |v_z|$ (desigualdad triangular). Entonces $|\vec r(t) - \vec L| \to 0$ si y solo si cada componente de $\vec r(t) - \vec L$ tiende a $0$.`,
        R`**Paso 2.** Así, el límite de una función vectorial es el vector de los límites. Como la derivada y la integral se definen con límites (de cocientes y de sumas de Riemann), también se calculan por componentes: $\vec r\,'(t) = (x'(t), y'(t), z'(t))$.`,
        R`**Paso 3 (la derivada es tangente).** El vector $\vec r(t + h) - \vec r(t)$ va de un punto de la curva a otro: apunta en la dirección de la secante. Dividirlo por $h$ no cambia la dirección (si $h > 0$). Cuando $h \to 0$, la secante tiende a la tangente, y el cociente tiende a $\vec r\,'(t)$: la derivada apunta en la dirección tangente.`,
        R`**Paso 4 (longitud).** Partimos $[a, b]$ en pasos $\Delta t$ y unimos los puntos $\vec r(t_i)$ con una poligonal. Cada lado mide $|\vec r(t_{i+1}) - \vec r(t_i)| \approx |\vec r\,'(t_i)|\,\Delta t$, porque el cociente incremental se parece a la derivada.`,
        R`**Paso 5.** La suma $\sum|\vec r\,'(t_i)|\,\Delta t$ es una suma de Riemann, y al achicar $\Delta t$ tiende a $\int_a^b|\vec r\,'(t)|\,dt$. Para la hélice, $\vec r\,' = (-a\sin t, a\cos t, b)$ y $|\vec r\,'| = \sqrt{a^2 + b^2}$ es constante: una vuelta mide $2\pi\sqrt{a^2 + b^2}$.`],
      examples: [{ q: R`Si $\vec v(t) = (1, 2t, 3t^2)$ y $\vec r(0) = (0, 0, 0)$, ¿dónde está en $t = 1$?`, steps: [R`$\vec r(t) = (t, t^2, t^3)$: en $t = 1$, $(1, 1, 1)$.`] }],
      tips: [R`La constante de integración es un **vector**: se determina con la condición inicial completa.`],
      see: ["c2-curvatura", "c2-parametricas"]
    },
    "c2-curvatura": {
      title: "Tangente, normal y curvatura", aliases: ["curvatura", "radio de curvatura", "vector tangente unitario", "vector normal unitario", "componente tangencial", "componente normal"], concepts: ["c2-curvatura"],
      summary: "T = r'/|r'|; κ = |r' × r''|/|r'|³ mide cuánto se dobla la curva. a = a_T T + a_N N, con a_T = d|v|/dt y a_N = κ|v|².",
      def: [R`**Tangente unitario** $\vec T = \frac{\vec r\,'}{|\vec r\,'|}$; **normal unitario** $\vec N = \frac{\vec T\,'}{|\vec T\,'|}$.`,
        R`**Curvatura:** $\kappa = \left|\frac{d\vec T}{ds}\right| = \frac{|\vec r\,'\times\vec r\,''|}{|\vec r\,'|^3}$. Para un gráfico $y = f(x)$: $\kappa = \frac{|f''|}{(1 + f'^2)^{3/2}}$. El **radio de curvatura** es $\frac1\kappa$.`,
        R`**Componentes de la aceleración:** $\vec a = a_T\vec T + a_N\vec N$, con $a_T = \frac{\vec v\cdot\vec a}{|\vec v|}$ y $a_N = \frac{|\vec v\times\vec a|}{|\vec v|} = \kappa|\vec v|^2$.`],
      idea: [R`$\frac1\kappa$ es el radio de la circunferencia que mejor se pega a la curva en ese punto: una recta tiene $\kappa = 0$ y una circunferencia de radio $R$, $\kappa = \frac1R$.`,
        R`$a_T$ cambia la rapidez y $a_N$ cambia la dirección: en una curva a velocidad constante solo hay $a_N$, la [[f1-circular|aceleración centrípeta]].`],
      demo: [R`**Paso 1 (por qué $\vec N$ es perpendicular a $\vec T$).** Como $\vec T$ es unitario, $\vec T\cdot\vec T = 1$ para todo $t$. Derivando con la regla del producto, $2\,\vec T\cdot\vec T\,' = 0$: el vector $\vec T\,'$ es perpendicular a $\vec T$, y por lo tanto también $\vec N$, que es $\vec T\,'$ normalizado.`,
        R`**Paso 2 (descomponer la aceleración).** Sea $v = |\vec r\,'|$ la rapidez, que es $\frac{ds}{dt}$ ($s$ es la longitud de arco). Por la definición de $\vec T$, $\vec r\,' = v\vec T$. Derivamos con la regla del producto: $$\vec r\,'' = v'\,\vec T + v\,\vec T\,'.$$`,
        R`**Paso 3.** Por la regla de la cadena, $\vec T\,' = \frac{d\vec T}{ds}\frac{ds}{dt} = \frac{d\vec T}{ds}\,v$. El vector $\frac{d\vec T}{ds}$ tiene módulo $\kappa$ (es la definición) y la dirección de $\vec T\,'$, que es $\vec N$: entonces $\vec T\,' = \kappa v\,\vec N$. Reemplazando, $$\vec r\,'' = v'\,\vec T + \kappa v^2\,\vec N.$$`,
        R`**Paso 4 (fórmula con el producto vectorial).** Multiplicamos vectorialmente $\vec r\,' = v\vec T$ por esa expresión. El término con $\vec T\times\vec T$ es $\vec 0$, así que $\vec r\,'\times\vec r\,'' = \kappa v^3\,(\vec T\times\vec N)$. Como $\vec T$ y $\vec N$ son unitarios y perpendiculares, $|\vec T\times\vec N| = 1$, y despejando: $$\kappa = \frac{|\vec r\,'\times\vec r\,''|}{v^3}.$$`,
        R`**Paso 5 (para un gráfico).** La curva $y = f(x)$ es $\vec r(x) = (x, f(x), 0)$, con $\vec r\,' = (1, f', 0)$ y $\vec r\,'' = (0, f'', 0)$. El producto vectorial es $(0, 0, f'')$ y $v = \sqrt{1 + f'^2}$, así que $\kappa = \frac{|f''|}{(1 + f'^2)^{3/2}}$.`,
        R`**Paso 6 (componentes de la aceleración).** El Paso 3 ya dice $\vec a = v'\vec T + \kappa v^2\vec N$: $a_T = v'$ y $a_N = \kappa v^2$. Para las fórmulas sin derivar $v$: multiplicando escalarmente por $\vec v = v\vec T$, $\vec v\cdot\vec a = v\,v'$, de donde $a_T = \frac{\vec v\cdot\vec a}{v}$; y por el Paso 4, $|\vec v\times\vec a| = \kappa v^3$, de donde $a_N = \frac{|\vec v\times\vec a|}{v}$. $\blacksquare$`],
      examples: [{ q: R`Curvatura de $y = x^2$ en el origen.`, steps: [R`$y' = 0$, $y'' = 2$: $\kappa = 2$; el radio de curvatura es $\frac12$.`] }],
      tips: [R`No confundas $\kappa$ con $|\vec r\,''|$: la curvatura no depende de la rapidez con que se recorre la curva.`],
      see: ["c2-curvas-vectoriales", "al-producto-vectorial"]
    }
  };

  E.extendCourse("m102", {
    concepts: { "c2-curvas-vectoriales": { name: "Funciones vectoriales" }, "c2-curvatura": { name: "Tangente, normal y curvatura" } },
    templates: T,
    units: [{
      id: "c2-vectoriales-u", order: 4, program: "Unidad 4", title: "Funciones vectoriales", icon: "rotate-ccw",
      diagnostic: ["c2-vel-num", "c2-integral-vect-num", "c2-curvatura-num"],
      lessons: [
        { id: "c2-curvas-vect", title: "Derivar e integrar curvas", templates: ["c2-vel-num", "c2-integral-vect-num"], theory: ["c2-curvas-vectoriales"],
          intro: R`Todo componente a componente: $\vec r\,'$ es la velocidad y $|\vec r\,'|$ la rapidez.` },
        { id: "c2-curvatura", title: "Curvatura y aceleración", templates: ["c2-curvatura-num", "c2-aceleracion-num", "c2-helice-vf"], theory: ["c2-curvatura"],
          intro: R`$\kappa = \frac{|\vec r\,'\times\vec r\,''|}{|\vec r\,'|^3}$, $a_T = \frac{\vec v\cdot\vec a}{|\vec v|}$, $a_N = \frac{|\vec v\times\vec a|}{|\vec v|}$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 5 · FUNCIONES DE VARIAS VARIABLES
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {};
  const nd = (x, d = 4) => num(x, d).replace(".", "{,}");
  // polinomios en x, y como listas de términos [c, i, j] = c·x^i·y^j
  const mon = (i, j) => (i ? (i === 1 ? "x" : `x^{${i}}`) : "") + (j ? (j === 1 ? "y" : `y^{${j}}`) : "");
  const ptex = P => H.poly(P.map(([c, i, j]) => [c, mon(i, j)]));
  const pev = (P, x, y) => P.reduce((s, [c, i, j]) => s + c * x ** i * y ** j, 0);
  const dx = P => P.filter(([, i]) => i > 0).map(([c, i, j]) => [c * i, i - 1, j]);
  const dy = P => P.filter(([, , j]) => j > 0).map(([c, i, j]) => [c * j, i, j - 1]);
  function randPoly(r, n = 3) {
    const seen = new Set(), P = [];
    while (P.length < n) { const i = r.int(0, 3), j = r.int(0, 3); if (i + j < 1 || i + j > 4 || seen.has(i + "," + j)) continue; seen.add(i + "," + j); P.push([r.nz(-4, 4), i, j]); }
    return P;
  }
  // familia de funciones: polinomio o x^p·e^{ay}
  function func(r) {
    if (r.int(0, 2) > 0) { const P = randPoly(r); return { tex: ptex(P), f: (x, y) => pev(P, x, y), fx: (x, y) => pev(dx(P), x, y), fy: (x, y) => pev(dy(P), x, y), dtex: [ptex(dx(P)), ptex(dy(P))] }; }
    const p = r.int(1, 3), a = r.nz(-2, 2), ey = `e^{${a === 1 ? "" : a === -1 ? "-" : a}y}`;
    return { tex: `${mon(p, 0)}${ey}`, f: (x, y) => x ** p * Math.exp(a * y), fx: (x, y) => p * x ** (p - 1) * Math.exp(a * y), fy: (x, y) => a * x ** p * Math.exp(a * y),
      dtex: [`${p === 1 ? "" : p}${mon(p - 1, 0)}${ey}`, `${a === 1 ? "" : a === -1 ? "-" : a}${mon(p, 0)}${ey}`] };
  }
  const gss = (g, lo, hi, it = 200) => { const k = (Math.sqrt(5) - 1) / 2; let a = lo, b = hi; for (let i = 0; i < it; i++) { const c = b - k * (b - a), d = a + k * (b - a); if (g(c) > g(d)) b = d; else a = c; } return g((a + b) / 2); };

  T["c2-parcial-num"] = {
    type: "numeric", concepts: ["c2-parciales"], difficulty: 1,
    generate(r) {
      const F = func(r), x0 = r.int(-2, 2), y0 = r.int(-1, 1), w = r.pick(["x", "y"]);
      const ans = w === "x" ? F.fx(x0, y0) : F.fy(x0, y0);
      return {
        prompt: `Si $f(x, y) = ${F.tex}$, calculá $\\frac{\\partial f}{\\partial ${w}}(${x0}, ${y0})$.`,
        answer: ans,
        solution: [`[[c2-parciales|Derivada parcial]] respecto de $${w}$: se deriva tratando ${w === "x" ? "$y$" : "$x$"} como constante.`, `$f_${w} = ${F.dtex[w === "x" ? 0 : 1]}$; en $(${x0}, ${y0})$ vale $${nd(ans)}$.`],
        verify: { kind: "deriv", f: t => (w === "x" ? F.f(t, y0) : F.f(x0, t)), x0: w === "x" ? x0 : y0 }
      };
    }
  };
  T["c2-cadena-num"] = {
    type: "numeric", concepts: ["c2-parciales"], difficulty: 2,
    generate(r) {
      const P = randPoly(r, 2), a = r.nz(-3, 3), b = r.int(-2, 2), c = r.nz(-2, 2), t0 = r.int(-2, 2);
      const X = t => a * t + b, Y = t => c * t * t, x0 = X(t0), y0 = Y(t0);
      const ans = pev(dx(P), x0, y0) * a + pev(dy(P), x0, y0) * 2 * c * t0;
      return {
        prompt: `Si $z = ${ptex(P)}$ con $x = ${H.poly([[a, "t"], [b, ""]])}$ e $y = ${H.poly([[c, "t^{2}"]])}$, calculá $\\frac{dz}{dt}$ en $t = ${t0}$.`,
        answer: ans,
        solution: [`[[c2-parciales|Regla de la cadena]]: $\\frac{dz}{dt} = \\frac{\\partial z}{\\partial x}\\frac{dx}{dt} + \\frac{\\partial z}{\\partial y}\\frac{dy}{dt}$.`, `En $t = ${t0}$: $(x, y) = (${x0}, ${y0})$, $z_x = ${pev(dx(P), x0, y0)}$, $z_y = ${pev(dy(P), x0, y0)}$, $x' = ${a}$, $y' = ${2 * c * t0}$.`, `$\\frac{dz}{dt} = ${nd(ans)}$.`],
        verify: { kind: "deriv", f: t => pev(P, X(t), Y(t)), x0: t0 }
      };
    }
  };
  T["c2-limite-vf"] = {
    type: "tf", concepts: ["c2-varias"], difficulty: 2,
    generate(r) {
      const k = r.nz(-3, 3), v = r.pick(["xy", "x2y", "dif", "cubos"]);
      const fam = {
        xy: { tex: `\\frac{${k === 1 ? "" : k === -1 ? "-" : k}xy}{x^2 + y^2}`, f: (x, y) => k * x * y / (x * x + y * y), ex: false, why: `Por la recta $y = mx$ da $\\frac{${k}m}{1 + m^2}$, que depende de $m$.` },
        x2y: { tex: `\\frac{${k === 1 ? "" : k === -1 ? "-" : k}x^2y}{x^2 + y^2}`, f: (x, y) => k * x * x * y / (x * x + y * y), ex: true, why: `$\\left|\\frac{x^2y}{x^2 + y^2}\\right| \\le |y| \\to 0$: el límite es $0$ (por [[sandwich|sándwich]]).` },
        dif: { tex: `\\frac{x^2 - y^2}{x^2 + y^2}`, f: (x, y) => (x * x - y * y) / (x * x + y * y), ex: false, why: `Por el eje $x$ da $1$ y por el eje $y$ da $-1$.` },
        cubos: { tex: `\\frac{x^3 ${k < 0 ? "-" : "+"} ${Math.abs(k) === 1 ? "" : Math.abs(k)}y^3}{x^2 + y^2}`, f: (x, y) => (x ** 3 + k * y ** 3) / (x * x + y * y), ex: true, why: `En polares queda $r(\\cos^3\\theta ${k < 0 ? "-" : "+"} ${Math.abs(k) === 1 ? "" : Math.abs(k)}\\sin^3\\theta) \\to 0$.` }
      }[v];
      return {
        prompt: `<b>Verdadero o falso:</b> existe $\\displaystyle\\lim_{(x,y)\\to(0,0)} ${fam.tex}$.`,
        answer: fam.ex,
        explanation: `${fam.why} ([[c2-varias|límites dobles]])`,
        solution: [`Si por dos caminos distintos el límite da distinto, no existe. Para probar que existe hay que acotar (por ejemplo, en polares).`],
        // verificación: oscilación de f en una circunferencia muy chica alrededor del origen
        verify: { kind: "truth", fn: () => { const rho = 1e-6, vals = Array.from({ length: 720 }, (_, i) => fam.f(rho * Math.cos(i * Math.PI / 360 + 0.001), rho * Math.sin(i * Math.PI / 360 + 0.001))); return Math.max(...vals) - Math.min(...vals) < 1e-3; } }
      };
    }
  };
  T["c2-direccional-num"] = {
    type: "numeric", concepts: ["c2-gradiente"], difficulty: 2,
    generate(r) {
      const F = func(r), x0 = r.int(-2, 2), y0 = r.int(-1, 1), [v1, v2] = r.pick([[3, 4], [1, 1], [1, -1], [-3, 4], [0, 1], [1, 0], [5, 12], [-1, 2], [2, -1]]);
      const L = Math.hypot(v1, v2), u = [v1 / L, v2 / L], g = [F.fx(x0, y0), F.fy(x0, y0)], ans = g[0] * u[0] + g[1] * u[1];
      return {
        prompt: `Si $f(x, y) = ${F.tex}$, calculá la derivada direccional de $f$ en $(${x0}, ${y0})$ en la dirección del vector $(${v1}, ${v2})$.`,
        answer: ans,
        solution: [`[[c2-gradiente|Derivada direccional]]: $D_{\\vec u}f = \\nabla f\\cdot\\vec u$ con $\\vec u$ **unitario**: $\\vec u = \\frac{(${v1}, ${v2})}{${nd(L)}}$.`, `$\\nabla f(${x0}, ${y0}) = (${nd(g[0])}, ${nd(g[1])})$, así que $D_{\\vec u}f \\approx ${nd(ans)}$.`],
        verify: { kind: "deriv", f: t => F.f(x0 + t * u[0], y0 + t * u[1]), x0: 0 }
      };
    }
  };
  T["c2-gradiente-num"] = {
    type: "numeric", concepts: ["c2-gradiente"], difficulty: 2,
    generate(r) {
      const F = func(r), x0 = r.int(-2, 2), y0 = r.int(-1, 1), g = [F.fx(x0, y0), F.fy(x0, y0)], ans = Math.hypot(g[0], g[1]);
      if (ans === 0) return null;
      return {
        prompt: `Si $f(x, y) = ${F.tex}$, ¿cuál es la máxima tasa de crecimiento de $f$ en $(${x0}, ${y0})$ (la mayor derivada direccional)?`,
        answer: ans,
        solution: [`[[c2-gradiente|Gradiente]]: $f$ crece más rápido en la dirección de $\\nabla f$, y esa tasa es $|\\nabla f|$.`, `$\\nabla f(${x0}, ${y0}) = (${nd(g[0])}, ${nd(g[1])})$; $|\\nabla f| \\approx ${nd(ans)}$.`],
        // verificación: se prueban todas las direcciones con derivadas numéricas y se toma la mayor
        verify: { kind: "value", tol: 1e-5, fn: () => { const D = th => { const h = 1e-6, c = Math.cos(th), s = Math.sin(th); return (F.f(x0 + h * c, y0 + h * s) - F.f(x0 - h * c, y0 - h * s)) / (2 * h); }; let best = 0, bt = 0; for (let i = 0; i < 720; i++) { const th = i * Math.PI / 360, d = D(th); if (d > best) { best = d; bt = th; } } return gss(D, bt - 0.01, bt + 0.01); } }
      };
    }
  };
  T["c2-plano-tangente-num"] = {
    type: "numeric", concepts: ["c2-gradiente"], difficulty: 2,
    generate(r) {
      const F = func(r), a = r.int(-2, 2), b = r.int(-1, 1), [hx, hy] = [r.pick([0.1, -0.1, 0.2, -0.2]), r.pick([0.1, -0.1, 0.05, -0.3])];
      const f0 = F.f(a, b), fx = F.fx(a, b), fy = F.fy(a, b), ans = f0 + fx * hx + fy * hy;
      return {
        prompt: `Usá el plano tangente a $z = ${F.tex}$ en $(${a}, ${b})$ para aproximar $f(${nd(a + hx, 2)}, ${nd(b + hy, 2)})$.`,
        answer: ans,
        solution: [`[[c2-gradiente|Plano tangente (linealización)]]: $L(x, y) = f(a, b) + f_x(a, b)(x - a) + f_y(a, b)(y - b)$.`, `$f(${a}, ${b}) = ${nd(f0)}$, $f_x = ${nd(fx)}$, $f_y = ${nd(fy)}$.`, `$L \\approx ${nd(f0)} + ${H.par(+fx.toFixed(4))}(${nd(hx, 2)}) + ${H.par(+fy.toFixed(4))}(${nd(hy, 2)}) \\approx ${nd(ans)}$.`],
        // verificación: pendientes del plano estimadas con diferencias centradas de la propia f
        verify: { kind: "value", tol: 1e-6, fn: () => { const h = 1e-5, px = (F.f(a + h, b) - F.f(a - h, b)) / (2 * h), py = (F.f(a, b + h) - F.f(a, b - h)) / (2 * h); return F.f(a, b) + px * hx + py * hy; } }
      };
    }
  };
  const EXT = ["Mínimo local", "Máximo local", "Punto silla", "El criterio no decide"];
  T["c2-extremos-mc"] = {
    type: "mc", concepts: ["c2-extremos"], difficulty: 2,
    generate(r) {
      const a = r.nz(-3, 3), b = r.int(-4, 4), c = r.nz(-3, 3), h = r.int(-2, 2), k = r.int(-2, 2), e = r.int(-3, 3), D = 4 * a * c - b * b;
      if (D === 0) return null;
      const kind = D < 0 ? 2 : a > 0 ? 0 : 1;
      const P = [[a, 2, 0], [b, 1, 1], [c, 0, 2], [-2 * a * h - b * k, 1, 0], [-b * h - 2 * c * k, 0, 1], [a * h * h + b * h * k + c * k * k + e, 0, 0]];
      const f = (x, y) => pev(P, x, y);
      return {
        prompt: `$f(x, y) = ${ptex(P)}$ tiene un punto crítico en $(${h}, ${k})$. ¿Qué es?`,
        ...H.mc(r, EXT[kind], EXT.filter((_, i) => i !== kind), { text: true }),
        solution: [`[[c2-extremos|Criterio de las segundas derivadas]]: $D = f_{xx}f_{yy} - f_{xy}^2$.`, `$f_{xx} = ${2 * a}$, $f_{yy} = ${2 * c}$, $f_{xy} = ${b}$: $D = ${D}$.`, D < 0 ? `$D < 0$: punto silla.` : `$D > 0$ y $f_{xx} ${a > 0 ? "> 0" : "< 0"}$: ${a > 0 ? "mínimo" : "máximo"} local.`],
        // verificación: se compara f en el punto con f en una circunferencia chica a su alrededor
        verify: { kind: "truth", target: true, fn: () => { const f0 = f(h, k), d = Array.from({ length: 360 }, (_, i) => f(h + 1e-3 * Math.cos(i * Math.PI / 180 + 0.01), k + 1e-3 * Math.sin(i * Math.PI / 180 + 0.01)) - f0); const up = d.every(x => x > 0), down = d.every(x => x < 0); return kind === 0 ? up : kind === 1 ? down : !up && !down; } }
      };
    }
  };
  T["c2-lagrange-num"] = {
    type: "numeric", concepts: ["c2-lagrange"], difficulty: 3,
    generate(r) {
      const v = r.pick(["xy", "lineal", "dist"]), a = r.int(1, 4), b = r.int(1, 4);
      if (v === "xy") {
        const c = r.int(4, 20), ans = c * c / (4 * a * b);
        return { prompt: `Hallá el valor máximo de $f(x, y) = xy$ sobre la recta $${H.poly([[a, "x"], [b, "y"]])} = ${c}$ con $x, y > 0$.`, answer: ans,
          solution: [`[[c2-lagrange|Multiplicadores de Lagrange]]: $\\nabla f = \\lambda\\nabla g$ da $y = ${a}\\lambda$, $x = ${b}\\lambda$.`, `En la restricción: $${2 * a * b}\\lambda = ${c}$, $\\lambda = ${H.frac(c, 2 * a * b)}$; $x = ${H.frac(c, 2 * a)}$, $y = ${H.frac(c, 2 * b)}$.`, `Máximo: $xy = ${H.frac(c * c, 4 * a * b)} \\approx ${nd(ans)}$.`],
          verify: { kind: "value", tol: 1e-8, fn: () => gss(x => x * (c - a * x) / b, 0, c / a) } };
      }
      if (v === "lineal") {
        const rr = r.int(1, 5), ans = rr * Math.hypot(a, b);
        return { prompt: `Hallá el valor máximo de $f(x, y) = ${H.poly([[a, "x"], [b, "y"]])}$ sobre la circunferencia $x^2 + y^2 = ${rr * rr}$.`, answer: ans,
          solution: [`[[c2-lagrange|Lagrange]]: $(${a}, ${b}) = \\lambda(2x, 2y)$, así que $(x, y)$ es paralelo a $(${a}, ${b})$.`, `$(x, y) = \\frac{${rr}}{\\sqrt{${a * a + b * b}}}(${a}, ${b})$, y el máximo es $${rr}\\sqrt{${a * a + b * b}} \\approx ${nd(ans)}$.`],
          verify: { kind: "value", tol: 1e-8, fn: () => { let best = -Infinity, bt = 0; for (let i = 0; i < 720; i++) { const t = i * Math.PI / 360, val = a * rr * Math.cos(t) + b * rr * Math.sin(t); if (val > best) { best = val; bt = t; } } return gss(t => a * rr * Math.cos(t) + b * rr * Math.sin(t), bt - 0.01, bt + 0.01); } } };
      }
      const c = r.nz(-8, 8), ans = c * c / (a * a + b * b);
      return { prompt: `Hallá el valor mínimo de $f(x, y) = x^2 + y^2$ sobre la recta $${H.poly([[a, "x"], [b, "y"]])} = ${c}$.`, answer: ans,
        solution: [`[[c2-lagrange|Lagrange]]: $(2x, 2y) = \\lambda(${a}, ${b})$: el punto más cercano al origen está en la dirección de la normal.`, `$(x, y) = t(${a}, ${b})$ con $${a * a + b * b}t = ${c}$; $f = ${H.frac(c * c, a * a + b * b)} \\approx ${nd(ans)}$ (el cuadrado de la distancia al origen).`],
        verify: { kind: "value", tol: 1e-8, fn: () => -gss(x => -(x * x + ((c - a * x) / b) ** 2), -50, 50) } };
    }
  };

  const cards = {
    "c2-varias": {
      title: "Funciones de varias variables: límites y continuidad", aliases: ["funciones de varias variables", "función de varias variables", "función de dos variables", "curvas de nivel", "curva de nivel", "límite doble", "límites dobles"], concepts: ["c2-varias"],
      summary: "f(x, y) asigna un número a cada punto del plano. El límite existe si f se acerca al mismo valor por todos los caminos.",
      def: [R`Una **función de dos variables** $f: D \subseteq \mathbb R^2 \to \mathbb R$; su gráfico es una superficie $z = f(x, y)$, y sus **curvas de nivel** son $f(x, y) = k$ (como en un mapa topográfico).`,
        R`$\lim_{(x,y)\to(a,b)}f(x, y) = L$ si $f$ se acerca a $L$ cuando $(x, y)$ se acerca a $(a, b)$ **por cualquier camino**. $f$ es **continua** en $(a, b)$ si el límite existe y vale $f(a, b)$.`],
      idea: [R`En una variable hay dos caminos (izquierda y derecha, los [[limites-laterales|laterales]]); en el plano hay infinitos. Para mostrar que **no** existe alcanza con dos caminos que den distinto (rectas $y = mx$, ejes, parábolas). Para mostrar que **sí** existe hay que acotar, por ejemplo en polares: si $|f - L| \le g(r)$ con $g(r) \to 0$, listo.`],
      demo: [R`**Paso 1 (la herramienta para negar).** Si el límite existiera y valiera $L$, $f$ tendría que acercarse a $L$ por **cualquier** camino. Así que si encontramos dos caminos hacia el punto por los que $f$ tiende a valores distintos, el límite no existe.`,
        R`**Paso 2 (un límite que no existe).** Tomamos $f(x, y) = \frac{xy}{x^2 + y^2}$ y nos acercamos a $(0, 0)$ por la recta $y = mx$. Reemplazando y sacando $x^2$ de factor común: $$f(x, mx) = \frac{mx^2}{x^2(1 + m^2)} = \frac{m}{1 + m^2},$$ que es constante sobre cada recta pero cambia con $m$: por $y = 0$ da $0$ y por $y = x$ da $\frac12$. Por el Paso 1, no existe.`,
        R`**Paso 3 (las rectas no alcanzan).** Con $h = \frac{x^2y}{x^4 + y^2}$, por $y = mx$ queda $\frac{mx^3}{x^4 + m^2x^2} = \frac{mx}{x^2 + m^2} \to 0$ (y por el eje $y$ vale $0$). Pero por la parábola $y = x^2$ vale $\frac{x^4}{2x^4} = \frac12$. Dos caminos distintos, dos valores: no existe, aunque todas las rectas coincidan.`,
        R`**Paso 4 (la herramienta para afirmar).** Para probar que **sí** existe no alcanza con probar caminos (son infinitos). Hay que acotar: pasamos a polares, $x = r\cos\theta$, $y = r\sin\theta$, donde acercarse al origen es exactamente $r \to 0$, sin importar cómo varíe $\theta$.`,
        R`**Paso 5 (un límite que sí existe).** Con $g(x, y) = \frac{x^2y}{x^2 + y^2}$: $g = \frac{r^3\cos^2\theta\sin\theta}{r^2} = r\cos^2\theta\sin\theta$. Como $|\cos^2\theta\sin\theta| \le 1$, vale $|g| \le r$ para todo $\theta$. Cuando $r \to 0$, la cota tiende a $0$ y, por el [[sandwich|teorema del sándwich]], $g \to 0$ por cualquier camino. $\blacksquare$`],
      examples: [{ q: R`¿Existe $\lim\frac{xy}{x^2 + y^2}$ en el origen?`, steps: [R`Por $y = mx$: $\frac{m}{1 + m^2}$, que cambia con $m$.`, R`No existe.`] }],
      tips: [R`Que el límite dé lo mismo por todas las rectas **no** alcanza: puede fallar por una parábola.`],
      see: ["c2-parciales", "limite"]
    },
    "c2-parciales": {
      title: "Derivadas parciales y regla de la cadena", aliases: ["derivada parcial", "derivadas parciales", "derivadas cruzadas", "teorema de Schwarz", "regla de la cadena en varias variables"], concepts: ["c2-parciales"],
      summary: "f_x es la derivada de f respecto de x con y fija. Regla de la cadena: dz/dt = z_x x' + z_y y'.",
      def: [R`$\frac{\partial f}{\partial x}(a, b) = \lim_{h\to0}\frac{f(a + h, b) - f(a, b)}{h}$: se deriva respecto de $x$ tratando $y$ como constante (y al revés para $f_y$).`,
        R`**Regla de la cadena:** si $z = f(x, y)$ con $x = x(t)$, $y = y(t)$: $\frac{dz}{dt} = \frac{\partial f}{\partial x}\frac{dx}{dt} + \frac{\partial f}{\partial y}\frac{dy}{dt}$.`,
        R`**Schwarz:** si las segundas derivadas son continuas, $f_{xy} = f_{yx}$.`],
      idea: [R`$f_x$ es la pendiente de la superficie cortada por el plano $y = b$: es una [[derivada]] común de una función de una variable.`,
        R`La regla de la cadena suma las contribuciones de cada camino por el que $t$ afecta a $z$, igual que la [[regla-cadena|regla de la cadena]] de una variable pero con varias "ramas".`],
      demo: [R`**Paso 1 (regla de la cadena: la aproximación lineal).** Que $f$ sea diferenciable significa que cerca de $(x, y)$ se parece a su [[c2-gradiente|plano tangente]]: $$\Delta f = f_x\,\Delta x + f_y\,\Delta y + \varepsilon\sqrt{\Delta x^2 + \Delta y^2},$$ donde $\varepsilon \to 0$ cuando $(\Delta x, \Delta y) \to (0, 0)$ (y ponemos $\varepsilon = 0$ si $\Delta x = \Delta y = 0$).`,
        R`**Paso 2.** Ahora $x = x(t)$ e $y = y(t)$. Un cambio $\Delta t$ produce cambios $\Delta x$, $\Delta y$ y, con ellos, $\Delta z$. Dividimos la igualdad anterior por $\Delta t$ (metiendo $|\Delta t|$ adentro de la raíz): $$\frac{\Delta z}{\Delta t} = f_x\frac{\Delta x}{\Delta t} + f_y\frac{\Delta y}{\Delta t} \pm \varepsilon\sqrt{\left(\frac{\Delta x}{\Delta t}\right)^2 + \left(\frac{\Delta y}{\Delta t}\right)^2}.$$`,
        R`**Paso 3.** Hacemos $\Delta t \to 0$. Los cocientes tienden a $x'(t)$ e $y'(t)$, así que la raíz queda acotada. Además $x$ e $y$ son continuas, entonces $\Delta x, \Delta y \to 0$ y $\varepsilon \to 0$: el último término desaparece. Queda $\frac{dz}{dt} = f_x\,x' + f_y\,y'$.`,
        R`**Paso 4 (Schwarz: una diferencia doble).** Para comparar $f_{xy}$ y $f_{yx}$ miramos $\Delta = f(a + h, b + k) - f(a + h, b) - f(a, b + k) + f(a, b)$, que es simétrica en el papel de $x$ y de $y$. Con $u(x) = f(x, b + k) - f(x, b)$ resulta $\Delta = u(a + h) - u(a)$.`,
        R`**Paso 5.** Aplicamos el [[valor-medio|teorema del valor medio]] a $u$: $\Delta = h\,u'(\xi) = h\big(f_x(\xi, b + k) - f_x(\xi, b)\big)$ con $\xi$ entre $a$ y $a + h$. Lo aplicamos otra vez, ahora a $f_x(\xi, \cdot)$ en la variable $y$: $\Delta = hk\,f_{xy}(\xi, \eta)$, con $\eta$ entre $b$ y $b + k$.`,
        R`**Paso 6.** Si empezamos agrupando al revés (primero en $y$, después en $x$), la misma cuenta da $\Delta = hk\,f_{yx}(\xi', \eta')$ en otro punto cercano. Igualamos, dividimos por $hk$ y hacemos $h, k \to 0$: los dos puntos tienden a $(a, b)$ y, como las segundas derivadas son continuas, $f_{xy}(a, b) = f_{yx}(a, b)$. $\blacksquare$`],
      examples: [{ q: R`$f = x^2y^3$. Calculá $f_x$ y $f_y$.`, steps: [R`$f_x = 2xy^3$ y $f_y = 3x^2y^2$.`] }],
      see: ["c2-gradiente", "regla-cadena", "derivada"]
    },
    "c2-gradiente": {
      title: "Gradiente, derivada direccional y plano tangente", aliases: ["gradiente", "derivada direccional", "derivadas direccionales", "plano tangente", "linealización", "diferencial total"], concepts: ["c2-gradiente"],
      summary: "∇f = (f_x, f_y). D_u f = ∇f·u. f crece más rápido en la dirección de ∇f, a tasa |∇f|. Plano tangente: z = f(a,b) + f_x(x − a) + f_y(y − b).",
      def: [R`**Gradiente:** $\nabla f = (f_x, f_y)$. **Derivada direccional** en la dirección del vector unitario $\vec u$: $D_{\vec u}f = \nabla f\cdot\vec u$.`,
        R`**Plano tangente** a $z = f(x, y)$ en $(a, b)$: $z = f(a, b) + f_x(a, b)(x - a) + f_y(a, b)(y - b)$. Es la mejor aproximación lineal (**linealización**); el **diferencial total** es $dz = f_x\,dx + f_y\,dy$.`],
      idea: [R`Como $D_{\vec u}f = |\nabla f|\cos\theta$ ([[al-producto-escalar|producto escalar]]), el máximo se da para $\theta = 0$: el gradiente apunta hacia donde $f$ crece más rápido, y $|\nabla f|$ es esa tasa. Además es perpendicular a las curvas de nivel.`,
        R`El plano tangente generaliza la [[recta-tangente|recta tangente]]: cerca del punto, la superficie y el plano casi no se distinguen.`],
      demo: [R`**Paso 1 (derivada direccional).** Por definición, $D_{\vec u}f$ es la derivada de $f$ cuando nos movemos sobre la recta que sale de $(a, b)$ en la dirección $\vec u$. Es decir, es $g'(0)$ con $g(t) = f(a + tu_1, b + tu_2)$.`,
        R`**Paso 2.** La función $g$ es una composición: $x(t) = a + tu_1$, $y(t) = b + tu_2$, con $x' = u_1$ e $y' = u_2$. Por la [[c2-parciales|regla de la cadena]], $$g'(0) = f_x\,u_1 + f_y\,u_2 = \nabla f\cdot\vec u.$$`,
        R`**Paso 3 (dirección de máximo crecimiento).** Con la forma geométrica del [[al-producto-escalar|producto escalar]], y como $|\vec u| = 1$: $D_{\vec u}f = |\nabla f|\cos\theta$, donde $\theta$ es el ángulo entre $\vec u$ y $\nabla f$. El coseno es máximo ($1$) con $\theta = 0$: la tasa máxima es $|\nabla f|$, en la dirección de $\nabla f$. Con $\theta = \pi$ es la mínima, $-|\nabla f|$, y con $\theta = \frac\pi2$ es $0$.`,
        R`**Paso 4 (perpendicular a las curvas de nivel).** Si $\vec r(t)$ recorre la curva de nivel $f = k$, entonces $f(\vec r(t)) = k$ para todo $t$: es constante. Derivando con la regla de la cadena, $\nabla f\cdot\vec r\,'(t) = 0$. Como $\vec r\,'$ es tangente a la curva de nivel, el gradiente es perpendicular a ella.`,
        R`**Paso 5 (plano tangente).** Un plano no vertical que pasa por $(a, b, f(a, b))$ se escribe $z = f(a, b) + m(x - a) + n(y - b)$, donde $m$ y $n$ son sus pendientes en las direcciones $x$ e $y$. Para que sea tangente, esas pendientes tienen que coincidir con las de la superficie, $f_x(a, b)$ y $f_y(a, b)$. Queda $z = f(a, b) + f_x(x - a) + f_y(y - b)$. $\blacksquare$`],
      examples: [{ q: R`$f = x^2 + y^2$ en $(1, 2)$: ¿dirección de máximo crecimiento?`, steps: [R`$\nabla f = (2x, 2y) = (2, 4)$, y la tasa máxima es $|\nabla f| = \sqrt{20}$.`] }],
      tips: [R`La dirección tiene que ser un vector **unitario**: si te dan $(3, 4)$, dividí por $5$.`],
      see: ["c2-parciales", "c2-extremos", "al-producto-escalar"]
    },
    "c2-extremos": {
      title: "Extremos de funciones de dos variables", aliases: ["punto silla", "puntos silla", "criterio del hessiano", "hessiano", "matriz hessiana", "criterio de las segundas derivadas"], concepts: ["c2-extremos"],
      summary: "Los extremos locales están donde ∇f = 0. Con D = f_xx f_yy − f_xy²: D > 0 y f_xx > 0 es mínimo; D > 0 y f_xx < 0, máximo; D < 0, silla.",
      def: [R`Si $f$ tiene un extremo local en $(a, b)$ y es diferenciable, $\nabla f(a, b) = \vec 0$: es un **punto crítico**.`,
        R`**Criterio de las segundas derivadas:** $D = f_{xx}f_{yy} - f_{xy}^2$ (el determinante de la **matriz hessiana**). Si $D > 0$ y $f_{xx} > 0$: mínimo local; si $D > 0$ y $f_{xx} < 0$: máximo local; si $D < 0$: **punto silla**; si $D = 0$, el criterio no decide.`],
      idea: [R`Cerca de un punto crítico, $f$ se parece a una forma cuadrática: si curva para arriba en todas las direcciones es un mínimo (copa), si para abajo un máximo, y si en unas sube y en otras baja es una silla de montar, como el [[c2-cuadricas|paraboloide hiperbólico]].`,
        R`Es la versión en dos variables del criterio de la derivada segunda de los [[extremos]] de una variable.`],
      demo: [R`**Paso 1 (en un extremo, el gradiente se anula).** Si $(a, b)$ es un máximo local de $f$, en particular lo es cuando nos movemos solo en $x$: $x = a$ es un máximo local de la función de una variable $x \mapsto f(x, b)$. Por el criterio de los [[extremos]] de una variable, su derivada se anula: $f_x(a, b) = 0$. Con $y$ pasa lo mismo, así que $\nabla f(a, b) = \vec 0$ (y si es mínimo, igual).`,
        R`**Paso 2 (cerca de un punto crítico).** Por Taylor de orden 2, como el gradiente es nulo no hay término lineal: $$f(a + h, b + k) - f(a, b) = \tfrac12\,Q(h, k) + \text{(algo chico frente a } h^2 + k^2),$$ con $Q = Ah^2 + 2Bhk + Ck^2$, $A = f_{xx}$, $B = f_{xy}$, $C = f_{yy}$ evaluadas en $(a, b)$. Así que el signo de $f(a + h, b + k) - f(a, b)$ lo decide $Q$, siempre que $Q$ no sea degenerada.`,
        R`**Paso 3 (completar cuadrados).** Si $A \neq 0$, sacamos $A$ de factor común y completamos el cuadrado en $h$: $$Q = A\left(h + \frac BA\,k\right)^2 + \frac{AC - B^2}{A}\,k^2.$$`,
        R`**Paso 4 ($D > 0$).** Con $D = AC - B^2 > 0$ (lo que obliga a $A \neq 0$), los dos términos tienen el signo de $A$ y no se anulan a la vez salvo en $h = k = 0$. Si $A > 0$, $Q > 0$ en toda dirección: $f$ sube para todos lados y es un mínimo. Si $A < 0$, $Q < 0$: es un máximo.`,
        R`**Paso 5 ($D < 0$).** Si $A \neq 0$, los dos términos tienen signos opuestos: con $k = 0$, $Q$ tiene el signo de $A$, y sobre la recta $h = -\frac BAk$ tiene el contrario. Si $A = 0$, entonces $B \neq 0$ (porque $D = -B^2 < 0$) y con $k$ chico frente a $h$, $Q \approx 2Bhk$ cambia de signo con $h$. En cualquier caso $f$ sube en unas direcciones y baja en otras: es un punto silla.`,
        R`**Paso 6 ($D = 0$ no decide).** $x^4 + y^4$ (mínimo), $-x^4 - y^4$ (máximo) y $x^4 - y^4$ (silla) tienen, las tres, todas las segundas derivadas nulas en el origen, así que $D = 0$ en los tres casos y el criterio no puede distinguirlas. $\blacksquare$`],
      examples: [{ q: R`$f = x^2 - y^2$ en $(0, 0)$.`, steps: [R`$f_{xx} = 2$, $f_{yy} = -2$, $f_{xy} = 0$: $D = -4 < 0$, punto silla.`] }],
      see: ["c2-lagrange", "extremos", "c2-gradiente"]
    },
    "c2-lagrange": {
      title: "Multiplicadores de Lagrange", aliases: ["multiplicadores de Lagrange", "multiplicador de Lagrange", "extremos condicionados", "extremos con restricciones"], concepts: ["c2-lagrange"],
      summary: "Para optimizar f con la restricción g = c, se resuelve ∇f = λ∇g junto con g = c.",
      def: [R`Los extremos de $f(x, y)$ sobre la curva $g(x, y) = c$ (con $\nabla g \ne \vec 0$) están entre las soluciones de $$\nabla f = \lambda\nabla g, \qquad g(x, y) = c.$$`],
      idea: [R`En el óptimo, la curva de nivel de $f$ es **tangente** a la restricción: si la cortara, moviéndose sobre la restricción se podría subir o bajar $f$. Curvas tangentes tienen [[c2-gradiente|gradientes]] paralelos, y eso dice $\nabla f = \lambda\nabla g$.`,
        R`Es la versión con restricción de la [[optimizacion|optimización]] de una variable: en lugar de despejar, se agrega una incógnita $\lambda$.`],
      demo: [R`**Paso 1 (recorrer la restricción).** Como $\nabla g \neq \vec 0$ en el punto óptimo, cerca de él la curva $g(x, y) = c$ es una curva suave (teorema de la función implícita) y la podemos parametrizar con $\vec r(t)$, con $\vec r(0)$ en el punto óptimo y $\vec r\,'(0) \neq \vec 0$.`,
        R`**Paso 2 ($\nabla g$ es perpendicular a la curva).** Sobre la curva, $g(\vec r(t)) = c$ para todo $t$. Derivamos con la [[c2-parciales|regla de la cadena]]: $\nabla g\cdot\vec r\,'(0) = 0$.`,
        R`**Paso 3 ($\nabla f$ también).** La función de una variable $h(t) = f(\vec r(t))$ es $f$ restringida a la curva, y tiene un extremo en $t = 0$. Entonces su derivada se anula: $h'(0) = \nabla f\cdot\vec r\,'(0) = 0$.`,
        R`**Paso 4.** En el plano, los vectores perpendiculares a un vector no nulo $\vec r\,'(0)$ forman una sola recta. Los dos gradientes están en esa recta, así que son paralelos. Como $\nabla g \neq \vec 0$, $\nabla f$ es un múltiplo de él: existe $\lambda$ con $$\nabla f = \lambda\nabla g.$$ Junto con $g = c$, que el punto tiene que cumplir, quedan las ecuaciones del método. $\blacksquare$`],
      examples: [{ q: R`Máximo de $xy$ con $x + y = 10$.`, steps: [R`$(y, x) = \lambda(1, 1)$: $x = y = 5$.`, R`Máximo $25$.`] }],
      see: ["c2-extremos", "c2-gradiente", "optimizacion"]
    }
  };

  E.extendCourse("m102", {
    concepts: { "c2-varias": { name: "Límites en varias variables" }, "c2-parciales": { name: "Derivadas parciales" }, "c2-gradiente": { name: "Gradiente y plano tangente" }, "c2-extremos": { name: "Extremos en dos variables" }, "c2-lagrange": { name: "Multiplicadores de Lagrange" } },
    templates: T,
    units: [{
      id: "c2-varias-u", order: 5, program: "Unidad 5", title: "Funciones de varias variables", icon: "grid-3x3",
      diagnostic: ["c2-parcial-num", "c2-direccional-num", "c2-extremos-mc"],
      lessons: [
        { id: "c2-parciales", title: "Límites y derivadas parciales", templates: ["c2-limite-vf", "c2-parcial-num", "c2-cadena-num"], theory: ["c2-varias", "c2-parciales"],
          intro: R`$f_x$: derivar con $y$ fija. Regla de la cadena: $\frac{dz}{dt} = z_xx' + z_yy'$.` },
        { id: "c2-gradiente", title: "Gradiente y plano tangente", templates: ["c2-direccional-num", "c2-gradiente-num", "c2-plano-tangente-num"], theory: ["c2-gradiente"],
          intro: R`$D_{\vec u}f = \nabla f\cdot\vec u$; el máximo crecimiento es $|\nabla f|$.` },
        { id: "c2-extremos", title: "Extremos y Lagrange", templates: ["c2-extremos-mc", "c2-lagrange-num"], theory: ["c2-extremos", "c2-lagrange"],
          intro: R`Puntos críticos con $\nabla f = \vec 0$ y el criterio $D = f_{xx}f_{yy} - f_{xy}^2$. Con restricción: $\nabla f = \lambda\nabla g$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 6 · INTEGRACIÓN MÚLTIPLE
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {};
  const nd = (x, d = 4) => num(x, d).replace(".", "{,}");
  const simp = (f, a, b, n = 200) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3; };
  // integral de f sobre el disco de radio R en cartesianas, con x = R sen u e y = s·√(R² − x²) para que todo quede suave
  const diskCart = (f, Rr, n = 300) => simp(u => { const x = Rr * Math.sin(u), w = Rr * Math.cos(u); return w * w * simp(s => f(x, s * w), -1, 1, n); }, -Math.PI / 2, Math.PI / 2, n);
  const mon = (i, j) => (i ? (i === 1 ? "x" : `x^{${i}}`) : "") + (j ? (j === 1 ? "y" : `y^{${j}}`) : "");
  const ptex = P => H.poly(P.map(([c, i, j]) => [c, mon(i, j)]));
  const pev = (P, x, y) => P.reduce((s, [c, i, j]) => s + c * x ** i * y ** j, 0);

  T["c2-iterada-num"] = {
    type: "numeric", concepts: ["c2-dobles"], difficulty: 1,
    generate(r) {
      const x0 = r.int(-1, 1), x1 = x0 + r.int(1, 3), y0 = r.int(-1, 1), y1 = y0 + r.int(1, 2);
      const seen = new Set(), P = [];
      while (P.length < 2) { const i = r.int(0, 2), j = r.int(0, 2); if (seen.has(i + "," + j)) continue; seen.add(i + "," + j); P.push([r.nz(-3, 3), i, j]); }
      const I1 = (a, b, k) => (b ** (k + 1) - a ** (k + 1)) / (k + 1);
      const ans = P.reduce((s, [c, i, j]) => s + c * I1(x0, x1, i) * I1(y0, y1, j), 0);
      return {
        prompt: `Calculá $\\displaystyle\\int_{${y0}}^{${y1}}\\int_{${x0}}^{${x1}} \\left(${ptex(P)}\\right)dx\\,dy$.`,
        answer: ans,
        solution: [`[[c2-dobles|Integral iterada]]: primero se integra respecto de $x$ con $y$ fija, después respecto de $y$. Sobre un rectángulo, cada término $x^iy^j$ se separa en $\\int x^i\\,dx\\cdot\\int y^j\\,dy$.`, `Resultado: $\\approx ${nd(ans)}$.`],
        verify: { kind: "value", tol: 1e-9, fn: () => simp(y => simp(x => pev(P, x, y), x0, x1, 20), y0, y1, 20) }
      };
    }
  };
  T["c2-region-num"] = {
    type: "numeric", concepts: ["c2-dobles"], difficulty: 2,
    generate(r) {
      const k = r.int(1, 3), g = r.pick(["1", "x", "y", "xy"]);
      const ans = { 1: k ** 3 / 6, x: k ** 4 / 12, y: k ** 5 / 15, xy: k ** 6 / 24 }[g], f = { 1: () => 1, x: x => x, y: (x, y) => y, xy: (x, y) => x * y }[g];
      const kx = k === 1 ? "x" : `${k}x`;
      return {
        prompt: `Sea $D$ la región entre la parábola $y = x^2$ y la recta $y = ${kx}$. Calculá $\\displaystyle\\iint_D ${g === "1" ? "1" : g}\\,dA$${g === "1" ? " (el área de $D$)" : ""}.`,
        answer: ans,
        solution: [`Las curvas se cortan en $x = 0$ y $x = ${k}$; en ese tramo la recta va arriba. Como [[c2-dobles|región de tipo I]]: $\\int_0^{${k}}\\int_{x^2}^{${kx}} ${g === "1" ? "1" : g}\\,dy\\,dx$.`, `Resultado: $${H.frac({ 1: k ** 3, x: k ** 4, y: k ** 5, xy: k ** 6 }[g], { 1: 6, x: 12, y: 15, xy: 24 }[g])} \\approx ${nd(ans)}$.`],
        // verificación: en el otro orden (Fubini), como región de tipo II, con y = s² para evitar la raíz
        verify: { kind: "value", tol: 1e-8, fn: () => simp(s => 2 * s * simp(x => f(x, s * s), s * s / k, s, 20), 0, k, 400) }
      };
    }
  };
  T["c2-polar-int-num"] = {
    type: "numeric", concepts: ["c2-dobles"], difficulty: 2,
    testN: 60,
    generate(r) {
      const v = r.pick(["r2", "gauss", "r", "anillo"]), Rr = r.int(1, 3);
      let f, ans, tex, sol, verifyFn;
      if (v === "r2") { f = (x, y) => x * x + y * y; ans = Math.PI * Rr ** 4 / 2; tex = `\\iint_D (x^2 + y^2)\\,dA`; sol = `$\\int_0^{2\\pi}\\int_0^{${Rr}} r^2\\cdot r\\,dr\\,d\\theta = 2\\pi\\cdot\\frac{${Rr ** 4}}{4}$`; }
      else if (v === "gauss") { f = (x, y) => Math.exp(-(x * x + y * y)); ans = Math.PI * (1 - Math.exp(-Rr * Rr)); tex = `\\iint_D e^{-(x^2 + y^2)}\\,dA`; sol = `$\\int_0^{2\\pi}\\int_0^{${Rr}} e^{-r^2}r\\,dr\\,d\\theta = 2\\pi\\cdot\\frac{1 - e^{-${Rr * Rr}}}{2}$`; }
      else if (v === "r") { f = (x, y) => Math.hypot(x, y); ans = 2 * Math.PI * Rr ** 3 / 3; tex = `\\iint_D \\sqrt{x^2 + y^2}\\,dA`; sol = `$\\int_0^{2\\pi}\\int_0^{${Rr}} r\\cdot r\\,dr\\,d\\theta = 2\\pi\\cdot\\frac{${Rr ** 3}}{3}$`; }
      else { const a = Rr, b = Rr + r.int(1, 2); f = (x) => x * x; ans = Math.PI * (b ** 4 - a ** 4) / 4; tex = `\\iint_D x^2\\,dA`; sol = `$\\int_0^{2\\pi}\\int_{${a}}^{${b}} r^2\\cos^2\\theta\\cdot r\\,dr\\,d\\theta = \\pi\\cdot\\frac{${b ** 4} - ${a ** 4}}{4}$`;
        verifyFn = () => diskCart(f, b) - diskCart(f, a);
        return { prompt: `Sea $D$ el anillo $${a * a} \\le x^2 + y^2 \\le ${b * b}$. Calculá $\\displaystyle ${tex}$.`, answer: ans,
          solution: [`[[c2-jacobiano|En polares]] $dA = r\\,dr\\,d\\theta$ y el anillo es $${a} \\le r \\le ${b}$.`, `${sol.slice(0, -1)} \\approx ${nd(ans)}$.`], verify: { kind: "value", tol: 1e-5, fn: verifyFn } };
      }
      return {
        prompt: `Sea $D$ el disco $x^2 + y^2 \\le ${Rr * Rr}$. Calculá $\\displaystyle ${tex}$.`,
        answer: ans,
        solution: [`[[c2-jacobiano|En polares]] el disco es $0 \\le r \\le ${Rr}$, $0 \\le \\theta \\le 2\\pi$, y $dA = r\\,dr\\,d\\theta$ (¡no te olvides la $r$!).`, `${sol.slice(0, -1)} \\approx ${nd(ans)}$.`],
        // verificación: la misma integral en cartesianas
        verify: { kind: "value", tol: v === "r" ? 1e-4 : 1e-5, fn: () => diskCart(f, Rr) }
      };
    }
  };
  T["c2-triple-num"] = {
    type: "numeric", concepts: ["c2-triples"], difficulty: 3,
    testN: 60,
    generate(r) {
      const v = r.pick(["masa", "paraboloide", "momento", "cono"]), Rr = r.int(1, 3);
      if (v === "masa") {
        const k = r.int(1, 5), ans = 4 * Math.PI * k * Rr ** 5 / 5;
        return { prompt: `Una esfera maciza de radio $${Rr}$ tiene densidad $\\delta = ${k === 1 ? "" : k}(x^2 + y^2 + z^2)$. ¿Cuál es su masa?`, answer: ans,
          solution: [`En [[c2-triples|esféricas]], $\\delta = ${k === 1 ? "" : k}\\rho^2$ y $dV = \\rho^2\\sin\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta$.`, `$\\int_0^{2\\pi}\\int_0^\\pi\\int_0^{${Rr}} ${k === 1 ? "" : k}\\rho^4\\sin\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta = ${k === 1 ? "" : k}\\cdot\\frac{${Rr ** 5}}{5}\\cdot2\\cdot2\\pi \\approx ${nd(ans)}$.`],
          // verificación: en cilíndricas (r, z), con r = R sen u
          verify: { kind: "value", tol: 1e-6, fn: () => simp(u => { const rr = Rr * Math.sin(u), w = Rr * Math.cos(u); return 2 * Math.PI * rr * Rr * Math.cos(u) * simp(z => k * (rr * rr + z * z), -w, w, 20); }, 0, Math.PI / 2, 400) } };
      }
      if (v === "paraboloide") {
        const h = r.int(1, 6), ans = Math.PI * h * h / 2;
        return { prompt: `Calculá el volumen del sólido limitado por el paraboloide $z = ${h} - x^2 - y^2$ y el plano $z = 0$.`, answer: ans,
          solution: [`En [[c2-triples|cilíndricas]]: $0 \\le z \\le ${h} - r^2$, con $0 \\le r \\le \\sqrt{${h}}$.`, `$\\int_0^{2\\pi}\\int_0^{\\sqrt{${h}}}(${h} - r^2)r\\,dr\\,d\\theta = 2\\pi\\left(\\frac{${h * h}}{2} - \\frac{${h * h}}{4}\\right) = \\frac{${h * h}\\pi}{2} \\approx ${nd(ans)}$.`],
          verify: { kind: "value", tol: 1e-6, fn: () => diskCart((x, y) => h - x * x - y * y, Math.sqrt(h)) } };
      }
      if (v === "momento") {
        const ans = Math.PI * Rr ** 4 / 4;
        return { prompt: `Calculá $\\displaystyle\\iiint_W z\\,dV$, donde $W$ es la semiesfera $x^2 + y^2 + z^2 \\le ${Rr * Rr}$, $z \\ge 0$.`, answer: ans,
          solution: [`En [[c2-triples|esféricas]]: $z = \\rho\\cos\\varphi$, $0 \\le \\varphi \\le \\frac\\pi2$.`, `$\\int_0^{2\\pi}\\int_0^{\\pi/2}\\int_0^{${Rr}}\\rho^3\\cos\\varphi\\sin\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta = 2\\pi\\cdot\\frac12\\cdot\\frac{${Rr ** 4}}{4} \\approx ${nd(ans)}$.`],
          verify: { kind: "value", tol: 1e-6, fn: () => simp(u => { const rr = Rr * Math.sin(u), w = Rr * Math.cos(u); return 2 * Math.PI * rr * Rr * Math.cos(u) * (w * w / 2); }, 0, Math.PI / 2, 400) } };
      }
      const a = Rr, h = r.int(1, 6), ans = Math.PI * a * a * h / 3;
      return { prompt: `Calculá el volumen del sólido entre el cono $z = ${H.frac(h, a)}\\sqrt{x^2 + y^2}$ y el plano $z = ${h}$.`, answer: ans,
        solution: [`En [[c2-triples|cilíndricas]]: $${H.frac(h, a)}r \\le z \\le ${h}$, con $0 \\le r \\le ${a}$.`, `$\\int_0^{2\\pi}\\int_0^{${a}}\\left(${h} - ${H.frac(h, a)}r\\right)r\\,dr\\,d\\theta = \\frac{\\pi\\cdot${a * a}\\cdot${h}}{3} \\approx ${nd(ans)}$ (el volumen del cono, $\\frac13$ base por altura).`],
        verify: { kind: "value", tol: 1e-4, fn: () => diskCart((x, y) => h - (h / a) * Math.hypot(x, y), a) } };
    }
  };
  T["c2-jacobiano-num"] = {
    type: "numeric", concepts: ["c2-jacobiano"], difficulty: 2,
    generate(r) {
      const v = r.pick(["lin", "cuad", "polar"]);
      let X, ans, prompt, sol, u0, v0;
      if (v === "lin") {
        const a = r.int(-3, 3), b = r.int(-3, 3), c = r.int(-3, 3), d = r.int(-3, 3), p = r.int(1, 3), q = r.int(1, 3), J = a * d - b * c;
        if (J === 0) return null;
        X = (u, w) => [a * u + b * w, c * u + d * w]; ans = Math.abs(J) * p * q;
        prompt = `La transformación $x = ${H.poly([[a, "u"], [b, "v"]])}$, $y = ${H.poly([[c, "u"], [d, "v"]])}$ lleva el rectángulo $[0, ${p}]\\times[0, ${q}]$ del plano $uv$ a un paralelogramo. ¿Cuál es su área?`;
        sol = `$\\frac{\\partial(x, y)}{\\partial(u, v)} = \\det\\begin{pmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{pmatrix} = ${J}$; el área es $|J|\\cdot${p * q} = ${ans}$.`;
        return { prompt, answer: ans, solution: [`[[c2-jacobiano|Jacobiano]]: las áreas se multiplican por $|J|$.`, sol],
          // verificación: área del paralelogramo imagen con la fórmula del zapatero
          verify: { kind: "value", tol: 1e-9, fn: () => { const V = [[0, 0], [p, 0], [p, q], [0, q]].map(([u, w]) => X(u, w)); let A = 0; for (let i = 0; i < 4; i++) { const [x1, y1] = V[i], [x2, y2] = V[(i + 1) % 4]; A += x1 * y2 - x2 * y1; } return Math.abs(A) / 2; } } };
      }
      if (v === "cuad") { u0 = r.int(-3, 3); v0 = r.int(1, 3); X = (u, w) => [u * u - w * w, 2 * u * w]; ans = 4 * (u0 * u0 + v0 * v0); prompt = `Calculá el jacobiano $\\left|\\frac{\\partial(x, y)}{\\partial(u, v)}\\right|$ de $x = u^2 - v^2$, $y = 2uv$ en $(u, v) = (${u0}, ${v0})$.`; sol = `$\\det\\begin{pmatrix} 2u & -2v \\\\ 2v & 2u \\end{pmatrix} = 4u^2 + 4v^2 = ${ans}$.`; }
      else { u0 = r.int(1, 6); v0 = r.pick([0.5, 1, 2]); X = (rr, t) => [rr * Math.cos(t), rr * Math.sin(t)]; ans = u0; prompt = `Calculá el jacobiano $\\frac{\\partial(x, y)}{\\partial(r, \\theta)}$ de las coordenadas polares en $r = ${u0}$.`; sol = `$\\det\\begin{pmatrix} \\cos\\theta & -r\\sin\\theta \\\\ \\sin\\theta & r\\cos\\theta \\end{pmatrix} = r = ${u0}$: por eso $dA = r\\,dr\\,d\\theta$.`; }
      return { prompt, answer: ans, solution: [`[[c2-jacobiano|Jacobiano]]: el determinante de la matriz de derivadas parciales; mide cuánto se estiran las áreas.`, sol],
        // verificación: área de la imagen de un cuadradito alrededor del punto, dividida por el área del cuadradito
        verify: { kind: "value", tol: 1e-5, fn: () => { const h = 1e-3, pts = []; const N = 200; for (let s = 0; s < 4; s++) for (let i = 0; i < N; i++) { const t = i / N, [du, dv] = [[t, 0], [1, t], [1 - t, 1], [0, 1 - t]][s]; pts.push(X(u0 - h / 2 + du * h, v0 - h / 2 + dv * h)); } let A = 0; for (let i = 0; i < pts.length; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length]; A += x1 * y2 - x2 * y1; } return Math.abs(A) / 2 / (h * h); } } };
    }
  };
  T["c2-orden-vf"] = {
    type: "tf", concepts: ["c2-dobles"], difficulty: 2,
    generate(r) {
      const a = r.int(1, 4), v = r.pick(["tri", "par"]), ok = r.bool();
      const g = (x, y) => 1 + x + 2 * y + x * y * Math.exp(x / 4);
      let lhs, rhs, L, Rv;
      if (v === "tri") {
        lhs = `\\int_0^{${a}}\\int_x^{${a}} f\\,dy\\,dx`; L = () => simp(x => simp(y => g(x, y), x, a, 40), 0, a, 400);
        rhs = ok ? `\\int_0^{${a}}\\int_0^{y} f\\,dx\\,dy` : `\\int_0^{${a}}\\int_y^{${a}} f\\,dx\\,dy`;
        Rv = ok ? () => simp(y => simp(x => g(x, y), 0, y, 40), 0, a, 400) : () => simp(y => simp(x => g(x, y), y, a, 40), 0, a, 400);
      } else {
        lhs = `\\int_0^{${a}}\\int_0^{x^2} f\\,dy\\,dx`; L = () => simp(x => simp(y => g(x, y), 0, x * x, 40), 0, a, 400);
        rhs = ok ? `\\int_0^{${a * a}}\\int_{\\sqrt y}^{${a}} f\\,dx\\,dy` : `\\int_0^{${a * a}}\\int_0^{\\sqrt y} f\\,dx\\,dy`;
        Rv = ok ? () => simp(s => 2 * s * simp(x => g(x, s * s), s, a, 40), 0, a, 400) : () => simp(s => 2 * s * simp(x => g(x, s * s), 0, s, 40), 0, a, 400);
      }
      return {
        prompt: `<b>Verdadero o falso:</b> para toda $f$ continua, $\\displaystyle ${lhs} = ${rhs}$.`,
        answer: ok,
        explanation: `${v === "tri" ? `La región es el triángulo $0 \\le x \\le y \\le ${a}$: para cada $y$, $x$ va de $0$ a $y$.` : `La región está debajo de $y = x^2$: para cada $y$ entre $0$ y $${a * a}$, $x$ va de $\\sqrt y$ a $${a}$.`} ([[c2-dobles|cambio del orden de integración]])`,
        solution: [`Para cambiar el orden hay que dibujar la región y describirla de nuevo: los límites no se intercambian sin más.`],
        // verificación: se integra numéricamente una función de prueba con los dos órdenes
        verify: { kind: "truth", fn: () => { const A = L(), B = Rv(); return Math.abs(A - B) < 1e-6 * Math.abs(A); } }
      };
    }
  };

  const cards = {
    "c2-dobles": {
      title: "Integrales dobles", aliases: ["integral doble", "integrales dobles", "integral iterada", "integrales iteradas", "teorema de Fubini", "Fubini", "cambio del orden de integración", "región de tipo I", "región de tipo II"], concepts: ["c2-dobles"],
      summary: "∬_D f dA suma f sobre una región plana. Se calcula como dos integrales simples (Fubini), con límites que describen la región.",
      def: [R`La **integral doble** $\iint_D f\,dA$ es el límite de sumas de Riemann sobre una grilla; si $f \ge 0$, es el volumen bajo la superficie $z = f(x, y)$, y $\iint_D 1\,dA$ es el área de $D$.`,
        R`**Fubini:** se calcula como una **integral iterada**. **Tipo I:** $D = \{a \le x \le b,\ g_1(x) \le y \le g_2(x)\}$ da $\int_a^b\int_{g_1(x)}^{g_2(x)}f\,dy\,dx$. **Tipo II:** al revés, con $x$ entre dos funciones de $y$.`],
      idea: [R`Es la [[integral-definida|integral definida]] en dos dimensiones: se corta en tajadas (con $x$ fijo), se integra cada tajada y se suman.`,
        R`Para **cambiar el orden** hay que dibujar la región y describirla de nuevo: a veces una integral imposible en un orden es fácil en el otro.`],
      demo: [R`**Paso 1 (Fubini en un rectángulo, por volumen).** Sea $f \ge 0$ en $[a, b]\times[c, d]$. La integral doble es el volumen bajo la superficie. Cortamos ese sólido con un plano $x$ = constante: la tajada es la región bajo la curva $y \mapsto f(x, y)$, de área $$A(x) = \int_c^d f(x, y)\,dy.$$`,
        R`**Paso 2.** El volumen de un sólido es la integral del área de sus secciones, como en el cálculo de volúmenes de una variable: sumamos tajadas de área $A(x)$ y espesor $dx$. Entonces $$\iint f\,dA = \int_a^b A(x)\,dx = \int_a^b\int_c^d f(x, y)\,dy\,dx.$$`,
        R`**Paso 3 (el otro orden).** Si cortamos con planos $y$ = constante, la misma idea da $\int_c^d\int_a^b f\,dx\,dy$. Las dos iteradas calculan el mismo volumen, así que son iguales: el orden se puede cambiar.`,
        R`**Paso 4 (regiones tipo I).** Si para cada $x$ los puntos de $D$ tienen $y$ entre $g_1(x)$ y $g_2(x)$, la tajada en $x$ no recorre todo $[c, d]$ sino solo de $g_1(x)$ a $g_2(x)$: esos son los límites de la integral de adentro. Para el tipo II se intercambian los papeles de $x$ e $y$.`,
        R`**Paso 5 (chequeo).** Con $f = 1$ en una región tipo I, la integral de adentro da $g_2(x) - g_1(x)$, y queda $\int_a^b(g_2 - g_1)\,dx$: el [[area-curvas|área entre dos curvas]] de siempre. $\blacksquare$`],
      examples: [{ q: R`Área entre $y = x^2$ e $y = x$.`, steps: [R`Se cortan en $0$ y $1$, con $x \ge x^2$ ahí.`, R`$\int_0^1\int_{x^2}^{x}dy\,dx = \int_0^1(x - x^2)\,dx = \frac16$.`] }],
      tips: [R`Los límites de la integral de adentro pueden depender de la variable de afuera, nunca al revés.`],
      see: ["c2-jacobiano", "c2-triples", "integral-definida"]
    },
    "c2-triples": {
      title: "Integrales triples", aliases: ["integral triple", "integrales triples"], concepts: ["c2-triples"],
      summary: "∭_W f dV. En cilíndricas dV = r dr dθ dz; en esféricas dV = ρ² sen φ dρ dφ dθ.",
      def: [R`$\iiint_W f\,dV$ se calcula como tres integrales iteradas. $\iiint_W 1\,dV$ es el volumen de $W$; con $f$ = densidad, da la masa.`,
        R`**Cilíndricas:** $dV = r\,dr\,d\theta\,dz$. **Esféricas:** $dV = \rho^2\sin\varphi\,d\rho\,d\varphi\,d\theta$ (los factores son los [[c2-jacobiano|jacobianos]]).`],
      idea: [R`Se elige el sistema por la forma del sólido: cilindros, conos y paraboloides con eje $z$ en [[c2-coord-espacio|cilíndricas]]; esferas en esféricas. Así los límites quedan constantes o simples.`,
        R`Aplicaciones: masa, centro de masa ([[f1-cm]]) y momentos de inercia ([[f1-inercia]]).`],
      demo: [R`**Paso 1 (la idea).** Al cambiar a otras coordenadas, la grilla ya no está hecha de cubitos $dx\,dy\,dz$ sino de "cajitas curvas". Hay que calcular el volumen de una de esas cajitas cuando cada coordenada varía un poquito; ese volumen es el $dV$.`,
        R`**Paso 2 (cilíndricas).** Variar $r$ en $dr$ mueve el punto $dr$ en la dirección radial. Variar $z$ en $dz$ lo sube $dz$. Variar $\theta$ en $d\theta$ lo mueve sobre un arco de circunferencia de radio $r$, de largo $r\,d\theta$ (largo de arco = radio por ángulo). Las tres direcciones son perpendiculares entre sí, así que la cajita es casi un prisma recto: $$dV = dr\cdot r\,d\theta\cdot dz = r\,dr\,d\theta\,dz.$$`,
        R`**Paso 3 (esféricas).** Variar $\rho$ mueve el punto $d\rho$ hacia afuera. Variar $\varphi$ lo mueve sobre un meridiano, que es una circunferencia de radio $\rho$: un arco de largo $\rho\,d\varphi$. Variar $\theta$ lo mueve sobre un paralelo, una circunferencia horizontal cuyo radio es la distancia al eje $z$, $\rho\sin\varphi$: un arco de largo $\rho\sin\varphi\,d\theta$.`,
        R`**Paso 4.** De nuevo las tres direcciones son perpendiculares, y multiplicando los tres lados: $$dV = d\rho\cdot\rho\,d\varphi\cdot\rho\sin\varphi\,d\theta = \rho^2\sin\varphi\,d\rho\,d\varphi\,d\theta.$$ Es el valor absoluto del [[c2-jacobiano|jacobiano]] del cambio de coordenadas.`,
        R`**Paso 5 (chequeo: la esfera).** Como los límites son constantes, la integral se separa en tres: $\int_0^R\rho^2\,d\rho = \frac{R^3}{3}$, $\int_0^\pi\sin\varphi\,d\varphi = 2$ y $\int_0^{2\pi}d\theta = 2\pi$. El producto es $\frac43\pi R^3$, el volumen conocido de la esfera.`],
      examples: [{ q: R`Volumen de la esfera de radio $R$.`, steps: [R`$\int_0^{2\pi}\int_0^\pi\int_0^R\rho^2\sin\varphi\,d\rho\,d\varphi\,d\theta = \frac{R^3}{3}\cdot2\cdot2\pi = \frac43\pi R^3$.`] }],
      tips: [R`El $\rho^2\sin\varphi$ de esféricas y la $r$ de cilíndricas no son opcionales.`],
      see: ["c2-coord-espacio", "c2-jacobiano", "c2-dobles"]
    },
    "c2-jacobiano": {
      title: "Cambio de variables y jacobiano", aliases: ["jacobiano", "jacobianos", "determinante jacobiano", "cambio de variables en integrales múltiples", "integrales en polares"], concepts: ["c2-jacobiano"],
      summary: "Con x = x(u, v), y = y(u, v): dA = |∂(x,y)/∂(u,v)| du dv. En polares, dA = r dr dθ.",
      def: [R`El **jacobiano** de $(u, v) \mapsto (x, y)$ es $\frac{\partial(x, y)}{\partial(u, v)} = \det\begin{pmatrix} x_u & x_v \\ y_u & y_v \end{pmatrix}$, y $$\iint_D f\,dx\,dy = \iint_{D'} f(x(u,v), y(u,v))\left|\frac{\partial(x, y)}{\partial(u, v)}\right|du\,dv.$$`],
      idea: [R`Un rectangulito $du\times dv$ se transforma en (casi) un paralelogramo de lados $\vec r_u\,du$ y $\vec r_v\,dv$, cuya área es $|\det|\,du\,dv$ ([[al-determinante|el determinante mide áreas]]).`,
        R`En [[c2-polares|polares]], $J = r$: los sectores lejos del origen son más grandes. Es el análogo de la [[int-sustitucion|sustitución]] de una variable, donde $dx = g'(u)\,du$.`],
      demo: [R`**Paso 1 (un rectangulito se deforma).** La transformación $\vec r(u, v) = (x(u, v), y(u, v))$ lleva el rectangulito de vértice $(u, v)$ y lados $du$, $dv$ a una figura con vértice $\vec r(u, v)$. Sus lados son $\vec r(u + du, v) - \vec r(u, v)$ y $\vec r(u, v + dv) - \vec r(u, v)$.`,
        R`**Paso 2.** Como $\vec r$ es derivable, cada uno de esos lados se aproxima con la derivada parcial: $\vec r_u\,du$ y $\vec r_v\,dv$, con $\vec r_u = (x_u, y_u)$ y $\vec r_v = (x_v, y_v)$. Lados casi rectos y casi paralelos de a pares: la figura es casi un paralelogramo.`,
        R`**Paso 3.** El área del paralelogramo generado por $(p, q)$ y $(s, t)$ es $|pt - qs|$, el valor absoluto del [[al-determinante|determinante]]. Con nuestros lados: $$dA = |x_u\,y_v - x_v\,y_u|\,du\,dv = |J|\,du\,dv.$$`,
        R`**Paso 4.** La integral en $x, y$ es la suma de $f$ por el área de cada pedacito. Si los pedacitos son las imágenes de los rectangulitos de la grilla en $u, v$, la suma se vuelve $\sum f(x(u,v), y(u,v))\,|J|\,du\,dv$, una suma de Riemann en $D'$. En el límite sale la fórmula.`,
        R`**Paso 5 (polares).** Con $x = r\cos\theta$ e $y = r\sin\theta$ calculamos las cuatro derivadas y el determinante, y usamos $\cos^2 + \sin^2 = 1$: $$J = \det\begin{pmatrix}\cos\theta & -r\sin\theta\\ \sin\theta & r\cos\theta\end{pmatrix} = r\cos^2\theta + r\sin^2\theta = r.$$ $\blacksquare$`],
      examples: [{ q: R`Área del disco de radio $R$ en polares.`, steps: [R`$\int_0^{2\pi}\int_0^R r\,dr\,d\theta = \pi R^2$.`] }],
      see: ["c2-dobles", "al-determinante", "int-sustitucion"]
    }
  };

  E.extendCourse("m102", {
    concepts: { "c2-dobles": { name: "Integrales dobles" }, "c2-triples": { name: "Integrales triples" }, "c2-jacobiano": { name: "Cambio de variables" } },
    templates: T,
    units: [{
      id: "c2-multiple-u", order: 6, program: "Unidad 6", title: "Integración múltiple", icon: "grid-3x3",
      diagnostic: ["c2-iterada-num", "c2-polar-int-num", "c2-triple-num"],
      lessons: [
        { id: "c2-dobles", title: "Integrales dobles", templates: ["c2-iterada-num", "c2-region-num", "c2-orden-vf"], theory: ["c2-dobles"],
          intro: R`Fubini: dos integrales simples, con límites que describen la región.` },
        { id: "c2-cambio-var", title: "Polares, triples y jacobianos", templates: ["c2-jacobiano-num", "c2-polar-int-num", "c2-triple-num"], theory: ["c2-jacobiano", "c2-triples"],
          intro: R`$dA = r\,dr\,d\theta$; $dV = r\,dr\,d\theta\,dz$ o $\rho^2\sin\varphi\,d\rho\,d\varphi\,d\theta$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 7 · ANÁLISIS VECTORIAL
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {};
  const nd = (x, d = 4) => num(x, d).replace(".", "{,}");
  const simp = (f, a, b, n = 200) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3; };
  const mon = (i, j) => (i ? (i === 1 ? "x" : `x^{${i}}`) : "") + (j ? (j === 1 ? "y" : `y^{${j}}`) : "");
  const ptex = P => H.poly(P.map(([c, i, j]) => [c, mon(i, j)]));
  const pev = (P, x, y) => P.reduce((s, [c, i, j]) => s + c * x ** i * y ** j, 0);
  const dx = P => P.filter(([, i]) => i > 0).map(([c, i, j]) => [c * i, i - 1, j]);
  const dy = P => P.filter(([, , j]) => j > 0).map(([c, i, j]) => [c * j, i, j - 1]);
  function randPoly(r, n, maxDeg = 3) {
    const seen = new Set(), P = [];
    while (P.length < n) { const i = r.int(0, maxDeg), j = r.int(0, maxDeg); if (i + j < 1 || i + j > maxDeg || seen.has(i + "," + j)) continue; seen.add(i + "," + j); P.push([r.nz(-3, 3), i, j]); }
    return P;
  }
  // integral de línea ∫ P dx + Q dy por una poligonal muy fina (regla del punto medio)
  const lineInt = (Pf, Qf, curve, N = 20000) => { let s = 0, [px, py] = curve(0); for (let i = 1; i <= N; i++) { const [qx, qy] = curve(i / N), mx = (px + qx) / 2, my = (py + qy) / 2; s += Pf(mx, my) * (qx - px) + Qf(mx, my) * (qy - py); px = qx; py = qy; } return s; };
  const field = (P, Q) => `\\vec F(x, y) = \\left(${ptex(P)},\\ ${ptex(Q)}\\right)`;

  T["c2-trabajo-num"] = {
    type: "numeric", concepts: ["c2-linea"], difficulty: 2,
    generate(r) {
      const P = randPoly(r, 2, 2), Q = randPoly(r, 2, 2), a = r.nz(-2, 2), b = r.nz(-2, 2), m = r.pick([1, 2]);
      // x = a t, y = b t^m, 0 ≤ t ≤ 1: cada término c·x^i·y^j·x' (o y') es un monomio en t
      let ans = 0;
      for (const [c, i, j] of P) ans += c * a ** i * b ** j * a / (i + m * j + 1);
      for (const [c, i, j] of Q) ans += c * a ** i * b ** j * m * b / (i + m * j + m);
      const path = m === 1 ? `el segmento de $(0, 0)$ a $(${a}, ${b})$` : `la parábola $y = ${H.frac(b, a * a) === "1" ? "" : H.frac(b, a * a) === "-1" ? "-" : H.frac(b, a * a)}x^2$ de $(0, 0)$ a $(${a}, ${b})$`;
      return {
        prompt: `Calculá el trabajo de $${field(P, Q)}$ a lo largo de ${path}.`,
        answer: ans,
        solution: [`[[c2-linea|Integral de línea]]: con $\\vec r(t)$, $0 \\le t \\le 1$, $W = \\int_0^1\\vec F(\\vec r(t))\\cdot\\vec r\\,'(t)\\,dt$.`, `Parametrización: $\\vec r(t) = (${a === 1 ? "" : a === -1 ? "-" : a}t,\\ ${b === 1 ? "" : b === -1 ? "-" : b}t${m === 2 ? "^2" : ""})$. Queda un polinomio en $t$; integrándolo, $W \\approx ${nd(ans)}$.`],
        verify: { kind: "value", tol: 1e-7, fn: () => lineInt((x, y) => pev(P, x, y), (x, y) => pev(Q, x, y), t => [a * t, b * t ** m]) }
      };
    }
  };
  T["c2-potencial-num"] = {
    type: "numeric", concepts: ["c2-campos"], difficulty: 2,
    generate(r) {
      const phi = randPoly(r, 3), A = [r.int(-2, 2), r.int(-2, 2)], B = [r.int(-2, 2), r.int(-2, 2)];
      if (A[0] === B[0] && A[1] === B[1]) return null;
      const P = dx(phi), Q = dy(phi), ans = pev(phi, B[0], B[1]) - pev(phi, A[0], A[1]);
      return {
        prompt: `Calculá $\\int_C \\vec F\\cdot d\\vec r$ para $${field(P, Q)}$, donde $C$ es la curva $\\vec r(t) = \\left(${H.poly([[A[0], ""], [B[0] - A[0], "t"], [1, "\\sin(\\pi t)"]])},\\ ${H.poly([[A[1], ""], [B[1] - A[1], "t"], [1, "t(1 - t)"]])}\\right)$, $0 \\le t \\le 1$.`,
        answer: ans,
        solution: [`Antes de parametrizar, conviene ver si $\\vec F$ es [[c2-campos|conservativo]]: $P_y = Q_x$ ($${ptex(dy(P))}$ en los dos casos), así que tiene potencial.`, `$\\varphi(x, y) = ${ptex(phi)}$ cumple $\\nabla\\varphi = \\vec F$. La curva va de $(${A.join(", ")})$ a $(${B.join(", ")})$.`, `[[c2-campos|Teorema fundamental para integrales de línea]]: $\\varphi(B) - \\varphi(A) = ${ans}$.`],
        verify: { kind: "value", tol: 1e-7, fn: () => lineInt((x, y) => pev(P, x, y), (x, y) => pev(Q, x, y), t => [A[0] + (B[0] - A[0]) * t + Math.sin(Math.PI * t), A[1] + (B[1] - A[1]) * t + t * (1 - t)]) }
      };
    }
  };
  T["c2-conservativo-vf"] = {
    type: "tf", concepts: ["c2-campos"], difficulty: 2,
    generate(r) {
      const phi = randPoly(r, 3), ok = r.bool(), k = r.nz(-3, 3);
      const P = dx(phi), Q = ok ? dy(phi) : dy(phi).concat([[k, 1, 0]]);
      if (!ok && Q.length === 0) return null;
      // juntamos términos iguales para mostrarlo prolijo
      const merge = L => { const m = new Map(); for (const [c, i, j] of L) m.set(i + "," + j, (m.get(i + "," + j) || 0) + c); return [...m].filter(([, c]) => c !== 0).map(([key, c]) => [c, ...key.split(",").map(Number)]); };
      const Qm = merge(Q);
      return {
        prompt: `<b>Verdadero o falso:</b> el campo $${field(P, Qm)}$ es conservativo.`,
        answer: ok,
        explanation: `[[c2-campos|Criterio]]: en todo el plano, $\\vec F$ es conservativo si y solo si $\\frac{\\partial P}{\\partial y} = \\frac{\\partial Q}{\\partial x}$. Acá $P_y = ${ptex(dy(P))}$ y $Q_x = ${ptex(dx(Qm))}$.`,
        solution: [ok ? `Son iguales: tiene potencial $\\varphi = ${ptex(phi)}$.` : `Difieren en $${k}$: la circulación por cualquier curva cerrada que encierre área $A$ es $${k}A \\ne 0$.`],
        // verificación: circulación por varias circunferencias; si el campo es conservativo, todas dan 0
        verify: { kind: "truth", fn: () => [[0.3, 0.7], [-1.2, 0.4], [1.5, -1]].every(([cx0, cy0]) => Math.abs(lineInt((x, y) => pev(P, x, y), (x, y) => pev(Qm, x, y), t => [cx0 + 0.5 * Math.cos(2 * Math.PI * t), cy0 + 0.5 * Math.sin(2 * Math.PI * t)], 4000)) < 1e-6) }
      };
    }
  };
  T["c2-green-num"] = {
    type: "numeric", concepts: ["c2-green"], difficulty: 2,
    generate(r) {
      const P = randPoly(r, 2, 2), Q = randPoly(r, 2, 2), a = r.int(1, 3), b = r.int(1, 3);
      const m0 = new Map(); for (const [c, i, j] of dx(Q).concat(dy(P).map(([c, i, j]) => [-c, i, j]))) m0.set(i + "," + j, (m0.get(i + "," + j) || 0) + c);
      const curl = [...m0].filter(([, c]) => c !== 0).map(([key, c]) => [c, ...key.split(",").map(Number)]);
      const ans = curl.reduce((s, [c, i, j]) => s + c * a ** (i + 1) / (i + 1) * b ** (j + 1) / (j + 1), 0);
      return {
        prompt: `Calculá la circulación $\\oint_C \\vec F\\cdot d\\vec r$ de $${field(P, Q)}$ alrededor del borde del rectángulo $[0, ${a}]\\times[0, ${b}]$, recorrido en sentido antihorario.`,
        answer: ans,
        solution: [`[[c2-green|Teorema de Green]]: $\\oint_C P\\,dx + Q\\,dy = \\iint_D\\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right)dA$.`, `$Q_x - P_y = ${ptex(curl.length ? curl : [[0, 0, 0]])}$; integrándolo en el rectángulo, la circulación es $\\approx ${nd(ans)}$.`],
        // verificación: la integral de línea directa por los cuatro lados
        verify: { kind: "value", tol: 1e-7, fn: () => lineInt((x, y) => pev(P, x, y), (x, y) => pev(Q, x, y), t => { const s = 4 * t; return s <= 1 ? [a * s, 0] : s <= 2 ? [a, b * (s - 1)] : s <= 3 ? [a * (3 - s), b] : [0, b * (4 - s)]; }, 40000) }
      };
    }
  };
  T["c2-divergencia-num"] = {
    type: "numeric", concepts: ["c2-flujo"], difficulty: 3,
    testN: 80,
    generate(r) {
      const a = r.int(-3, 3), b = r.int(-3, 3), c = r.int(-3, 3), k = [r.int(-2, 2), r.int(-2, 2), r.int(-2, 2)], sph = r.bool();
      if (a + b + c === 0) return null;
      const F = (x, y, z) => [a * x + k[0] * y * z, b * y + k[1] * x * z, c * z + k[2] * x * y];
      const comp = (co, v, kk, uv) => H.poly([[co, v], [kk, uv]]);
      const Ftex = `\\vec F = \\left(${comp(a, "x", k[0], "yz")},\\ ${comp(b, "y", k[1], "xz")},\\ ${comp(c, "z", k[2], "xy")}\\right)`;
      let ans, region, verifyFn;
      if (sph) {
        const Rr = r.int(1, 3); ans = (a + b + c) * 4 / 3 * Math.PI * Rr ** 3; region = `la esfera $x^2 + y^2 + z^2 = ${Rr * Rr}$`;
        verifyFn = () => simp(ph => simp(th => { const n = [Math.sin(ph) * Math.cos(th), Math.sin(ph) * Math.sin(th), Math.cos(ph)], f = F(Rr * n[0], Rr * n[1], Rr * n[2]); return (f[0] * n[0] + f[1] * n[1] + f[2] * n[2]) * Rr * Rr * Math.sin(ph); }, 0, 2 * Math.PI, 60), 0, Math.PI, 120);
      } else {
        const p = r.int(1, 3), q = r.int(1, 3), s = r.int(1, 3); ans = (a + b + c) * p * q * s; region = `la superficie de la caja $[0, ${p}]\\times[0, ${q}]\\times[0, ${s}]$`;
        verifyFn = () => simp(y => simp(z => F(p, y, z)[0] - F(0, y, z)[0], 0, s, 20), 0, q, 20) + simp(x => simp(z => F(x, q, z)[1] - F(x, 0, z)[1], 0, s, 20), 0, p, 20) + simp(x => simp(y => F(x, y, s)[2] - F(x, y, 0)[2], 0, q, 20), 0, p, 20);
      }
      return {
        prompt: `Calculá el flujo de $${Ftex}$ hacia afuera de ${region}.`,
        answer: ans,
        solution: [`[[c2-flujo|Teorema de la divergencia]]: el flujo saliente por una superficie cerrada es $\\iiint_W \\nabla\\cdot\\vec F\\,dV$.`, `$\\nabla\\cdot\\vec F = ${a} ${b < 0 ? "-" : "+"} ${Math.abs(b)} ${c < 0 ? "-" : "+"} ${Math.abs(c)} = ${a + b + c}$ (los términos $yz$, $xz$, $xy$ no aportan), constante: flujo $= ${a + b + c}\\cdot\\text{volumen} \\approx ${nd(ans)}$.`],
        // verificación: integral de superficie directa, cara por cara o con la parametrización esférica
        verify: { kind: "value", tol: 1e-6, fn: verifyFn }
      };
    }
  };
  T["c2-rot-num"] = {
    type: "numeric", concepts: ["c2-flujo"], difficulty: 2,
    generate(r) {
      const cs = Array.from({ length: 3 }, () => [r.nz(-3, 3), r.int(0, 2), r.int(0, 2), r.int(0, 2)]);
      // F_i = c·x^p·y^q·z^s (un término por componente)
      const ev = ([c, p, q, s], x, y, z) => c * x ** p * y ** q * z ** s;
      const ttex = ([c, p, q, s]) => { const m = (p ? (p === 1 ? "x" : `x^{${p}}`) : "") + (q ? (q === 1 ? "y" : `y^{${q}}`) : "") + (s ? (s === 1 ? "z" : `z^{${s}}`) : ""); return m ? (c === 1 ? "" : c === -1 ? "-" : c) + m : String(c); };
      const pt = [r.int(-2, 2), r.int(-2, 2), r.int(-2, 2)], ask = r.pick(["div", "rotz", "rotx"]);
      const d = (k, v) => { const t = cs[k], e = [t[1], t[2], t[3]]; if (!e[v]) return 0; const e2 = e.slice(); e2[v]--; return t[0] * e[v] * pt[0] ** e2[0] * pt[1] ** e2[1] * pt[2] ** e2[2]; };
      const ans = ask === "div" ? d(0, 0) + d(1, 1) + d(2, 2) : ask === "rotz" ? d(1, 0) - d(0, 1) : d(2, 1) - d(1, 2);
      return {
        prompt: `Para $\\vec F = \\left(${cs.map(ttex).join(",\\ ")}\\right)$, calculá ${ask === "div" ? "la divergencia $\\nabla\\cdot\\vec F$" : `la componente $${ask === "rotz" ? "z" : "x"}$ del rotor $\\nabla\\times\\vec F$`} en $(${pt.join(", ")})$.`,
        answer: ans,
        solution: [`[[c2-flujo|Divergencia y rotor]]: $\\nabla\\cdot\\vec F = P_x + Q_y + R_z$; $\\nabla\\times\\vec F = (R_y - Q_z,\\ P_z - R_x,\\ Q_x - P_y)$.`, `${ask === "div" ? "$P_x + Q_y + R_z$" : ask === "rotz" ? "$Q_x - P_y$" : "$R_y - Q_z$"} en el punto vale $${ans}$.`],
        // verificación: derivadas parciales por diferencias centradas
        verify: { kind: "value", tol: 1e-6, fn: () => { const h = 1e-5, D = (k, v) => { const p1 = pt.slice(), p2 = pt.slice(); p1[v] += h; p2[v] -= h; return (ev(cs[k], ...p1) - ev(cs[k], ...p2)) / (2 * h); }; return ask === "div" ? D(0, 0) + D(1, 1) + D(2, 2) : ask === "rotz" ? D(1, 0) - D(0, 1) : D(2, 1) - D(1, 2); } }
      };
    }
  };

  const cards = {
    "c2-campos": {
      title: "Campos vectoriales y campos conservativos", aliases: ["campo vectorial", "campos vectoriales", "campo conservativo", "campos conservativos", "función potencial", "independencia de la trayectoria", "teorema fundamental para integrales de línea"], concepts: ["c2-campos"],
      summary: "F es conservativo si F = ∇φ. Entonces ∫_C F·dr = φ(B) − φ(A), sin importar el camino. En el plano (sin agujeros): conservativo ⟺ P_y = Q_x.",
      def: [R`Un **campo vectorial** asigna un vector a cada punto: $\vec F(x, y) = (P, Q)$. Es **conservativo** si existe una **función potencial** $\varphi$ con $\nabla\varphi = \vec F$.`,
        R`**Teorema fundamental:** si $\vec F = \nabla\varphi$, entonces $\int_C\vec F\cdot d\vec r = \varphi(B) - \varphi(A)$ para cualquier curva de $A$ a $B$; en curvas cerradas da $0$.`,
        R`**Criterio** (en una región sin agujeros): $\vec F = (P, Q)$ es conservativo $\iff \frac{\partial P}{\partial y} = \frac{\partial Q}{\partial x}$.`],
      idea: [R`Es la versión vectorial del [[tfc|teorema fundamental del cálculo]]. En física, las fuerzas conservativas (gravedad, resortes) tienen [[f1-energia|energía potencial]]: el trabajo solo depende de dónde empezás y dónde terminás.`,
        R`Para hallar $\varphi$: se integra $P$ respecto de $x$ y se ajusta la "constante" (una función de $y$) para que la derivada respecto de $y$ dé $Q$.`],
      demo: [R`**Paso 1 (teorema fundamental).** Sea $\vec F = \nabla\varphi$ y $\vec r(t)$, $a \le t \le b$, una curva de $A$ a $B$. La función de una variable $\varphi(\vec r(t))$ se deriva con la [[c2-parciales|regla de la cadena]]: $$\frac{d}{dt}\varphi(\vec r(t)) = \nabla\varphi(\vec r(t))\cdot\vec r\,'(t) = \vec F(\vec r(t))\cdot\vec r\,'(t).$$`,
        R`**Paso 2.** Ese es justo el integrando de la integral de línea. Así que la integral es la de una derivada, y por el [[tfc|teorema fundamental del cálculo]]: $$\int_C\vec F\cdot d\vec r = \int_a^b\frac{d}{dt}\varphi(\vec r(t))\,dt = \varphi(\vec r(b)) - \varphi(\vec r(a)) = \varphi(B) - \varphi(A).$$ Si la curva es cerrada, $A = B$ y da $0$.`,
        R`**Paso 3 (el criterio es necesario).** Si $\vec F = \nabla\varphi$, entonces $P = \varphi_x$ y $Q = \varphi_y$. Derivando, $P_y = \varphi_{xy}$ y $Q_x = \varphi_{yx}$, que son iguales por el teorema de Schwarz ([[c2-parciales]]).`,
        R`**Paso 4 (sin agujeros, alcanza).** Si $P_y = Q_x$ en una región sin agujeros, toda curva cerrada simple encierra una región $D$ contenida en ella, y por [[c2-green|Green]] su circulación es $\iint_D(Q_x - P_y)\,dA = 0$. Dos caminos de $A$ a $X$ forman, juntos (uno de ida y otro de vuelta), una curva cerrada: las dos integrales coinciden.`,
        R`**Paso 5.** Entonces $\varphi(X) = \int_A^X\vec F\cdot d\vec r$ está bien definida. Para ver que es un potencial, llegamos a $X + (h, 0)$ por $X$ y después en línea recta horizontal: $\varphi(X + (h, 0)) - \varphi(X) = \int_0^h P(x + s, y)\,ds$. Dividiendo por $h$ y haciendo $h \to 0$, $\varphi_x = P$. Igual, $\varphi_y = Q$.`,
        R`**Paso 6 (con un agujero falla).** $\vec F = \left(\frac{-y}{x^2 + y^2}, \frac{x}{x^2 + y^2}\right)$ cumple $P_y = Q_x$ fuera del origen. Pero en la circunferencia unidad, $\vec r = (\cos t, \sin t)$, el integrando es $\sin^2 t + \cos^2 t = 1$ y la circulación vale $2\pi \neq 0$. Green no se puede usar porque el origen, donde $\vec F$ no está definido, queda adentro. $\blacksquare$`],
      examples: [{ q: R`¿$\vec F = (2xy, x^2)$ es conservativo?`, steps: [R`$P_y = 2x = Q_x$: sí, con $\varphi = x^2y$.`] }],
      tips: [R`Si $P_y \neq Q_x$ en un solo punto, ya no es conservativo; pero que valga $P_y = Q_x$ no alcanza si la región tiene agujeros.`],
      see: ["c2-linea", "c2-gradiente", "c2-green"]
    },
    "c2-linea": {
      title: "Integrales de línea", aliases: ["integral de línea", "integrales de línea", "circulación", "integral curvilínea"], concepts: ["c2-linea"],
      summary: "∫_C F·dr = ∫ F(r(t))·r'(t) dt: el trabajo de F a lo largo de C. Depende de la orientación de la curva.",
      def: [R`Con $C$ parametrizada por $\vec r(t)$, $a \le t \le b$: $$\int_C\vec F\cdot d\vec r = \int_a^b\vec F(\vec r(t))\cdot\vec r\,'(t)\,dt = \int_C P\,dx + Q\,dy.$$ Si la curva es cerrada se escribe $\oint_C$ y se llama **circulación**.`],
      idea: [R`Es el [[f1-trabajo|trabajo]] de una fuerza variable a lo largo de un camino: se suma $\vec F\cdot d\vec r$, la componente de la fuerza en la dirección del movimiento por el desplazamiento.`,
        R`No depende de cómo se parametrice la curva, pero sí del sentido: recorrerla al revés cambia el signo.`],
      demo: [R`**Paso 1 (de dónde sale la fórmula).** En un tramo chico de la curva, entre $t$ y $t + dt$, el desplazamiento es $d\vec r \approx \vec r\,'(t)\,dt$ y la fuerza es casi constante, $\vec F(\vec r(t))$. El [[f1-trabajo|trabajo]] de una fuerza constante es fuerza escalar desplazamiento: $\vec F(\vec r(t))\cdot\vec r\,'(t)\,dt$. Sumando los tramos sale la integral.`,
        R`**Paso 2 (otra parametrización).** Cambiamos el parámetro con $t = \phi(u)$, $\phi$ creciente, de $u = c$ a $u = d$ con $\phi(c) = a$ y $\phi(d) = b$. La curva $\vec R(u) = \vec r(\phi(u))$ es la misma, recorrida a otro ritmo, y por la regla de la cadena $\vec R\,'(u) = \vec r\,'(\phi(u))\,\phi'(u)$.`,
        R`**Paso 3.** Reemplazamos en la integral con la nueva parametrización: $$\begin{aligned}&\int_c^d\vec F(\vec R(u))\cdot\vec R\,'(u)\,du \\ &\quad= \int_c^d\vec F(\vec r(\phi(u)))\cdot\vec r\,'(\phi(u))\,\phi'(u)\,du.\end{aligned}$$ Es exactamente lo que da la [[int-sustitucion|sustitución]] $t = \phi(u)$, $dt = \phi'(u)\,du$, en la integral original: valen lo mismo.`,
        R`**Paso 4 (al revés cambia el signo).** Si $\phi$ es decreciente, la curva se recorre en sentido contrario: ahora $\phi(c) = b$ y $\phi(d) = a$. La misma sustitución da $\int_b^a$ en lugar de $\int_a^b$, y dar vuelta los límites cambia el signo de una integral. $\blacksquare$`],
      examples: [{ q: R`$\int_C y\,dx + x\,dy$ por $\vec r(t) = (t, t^2)$, $0 \le t \le 1$.`, steps: [R`$\int_0^1(t^2\cdot1 + t\cdot2t)\,dt = \int_0^1 3t^2\,dt = 1$.`] }],
      see: ["c2-campos", "c2-green", "c2-curvas-vectoriales"]
    },
    "c2-green": {
      title: "Teorema de Green", aliases: ["teorema de Green", "Green"], concepts: ["c2-green"],
      summary: "∮_C P dx + Q dy = ∬_D (Q_x − P_y) dA, con C el borde de D recorrido en sentido antihorario.",
      def: [R`Si $C$ es una curva cerrada simple, recorrida en sentido antihorario, que encierra la región $D$: $$\oint_C P\,dx + Q\,dy = \iint_D\left(\frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y}\right)dA.$$`],
      idea: [R`$Q_x - P_y$ mide cuánto "gira" el campo en cada punto (la componente $z$ del [[c2-flujo|rotor]]). Green dice que el giro total en el borde es la suma de los giros de adentro: las circulaciones de los cuadraditos interiores se cancelan de a pares.`,
        R`Con $\vec F = (-y, x)/2$ sale una fórmula para el área: $A = \frac12\oint_C x\,dy - y\,dx$. Así funcionan los planímetros.`],
      demo: [R`**Paso 1 (separar en dos partes).** La fórmula tiene una parte con $P$ y otra con $Q$, que no se mezclan: alcanza con probar $\oint_C P\,dx = -\iint_D P_y\,dA$ y $\oint_C Q\,dy = \iint_D Q_x\,dA$ por separado. Lo hacemos primero en un rectángulo $D = [a, b]\times[c, d]$.`,
        R`**Paso 2 (lado de la región).** Integramos $P_y$ primero en $y$. Por el [[tfc|teorema fundamental del cálculo]], la integral de una derivada es la diferencia de los valores en los extremos: $$-\iint_D P_y\,dA = -\int_a^b\big(P(x, d) - P(x, c)\big)\,dx.$$`,
        R`**Paso 3 (lado de la curva).** En $\oint P\,dx$, los lados verticales no aportan, porque ahí $x$ no cambia ($dx = 0$). En sentido antihorario, el lado de abajo se recorre hacia la derecha a $y = c$ y da $\int_a^b P(x, c)\,dx$; el de arriba se recorre hacia la izquierda a $y = d$ y da $-\int_a^b P(x, d)\,dx$. La suma es lo mismo que en el Paso 2.`,
        R`**Paso 4.** Con $Q$ se repite la cuenta, intercambiando los papeles: ahora aportan solo los lados verticales y se integra $Q_x$ primero en $x$. Sale $\oint_C Q\,dy = \iint_D Q_x\,dA$ (el signo queda $+$ porque el lado derecho se sube y el izquierdo se baja).`,
        R`**Paso 5 (una región general).** Partimos la región en rectangulitos y sumamos Green en todos. Del lado de las integrales dobles, se suman y dan la integral sobre $D$. Del lado de las curvas, cada lado interior lo comparten dos rectangulitos que lo recorren en sentidos opuestos, así que se cancela: queda solo el borde exterior.`,
        R`**Paso 6 (fórmula del área).** Elegimos $P = -\frac y2$ y $Q = \frac x2$, para que $Q_x - P_y = \frac12 + \frac12 = 1$. Green dice entonces $\frac12\oint_C(x\,dy - y\,dx) = \iint_D 1\,dA$, que es el área de $D$. $\blacksquare$`],
      examples: [{ q: R`$\oint_C -y\,dx + x\,dy$ por la circunferencia unitaria.`, steps: [R`$Q_x - P_y = 1 + 1 = 2$; $\iint_D 2\,dA = 2\pi$.`] }],
      see: ["c2-linea", "c2-flujo", "c2-campos"]
    },
    "c2-flujo": {
      title: "Divergencia, rotor, flujo y teoremas de Gauss y Stokes", aliases: ["divergencia", "rotor", "rotacional", "flujo de un campo", "integral de superficie", "integrales de superficie", "teorema de la divergencia", "teorema de Stokes", "Stokes"], concepts: ["c2-flujo"],
      summary: "div F = ∇·F; rot F = ∇×F. Gauss: el flujo saliente por una superficie cerrada es ∭ div F dV. Stokes: ∮ F·dr = ∬ (rot F)·n dS.",
      def: [R`**Divergencia:** $\nabla\cdot\vec F = P_x + Q_y + R_z$. **Rotor:** $\nabla\times\vec F = (R_y - Q_z,\ P_z - R_x,\ Q_x - P_y)$.`,
        R`**Flujo** de $\vec F$ por una superficie $S$ con normal $\vec n$: $\iint_S\vec F\cdot\vec n\,dS$.`,
        R`**Teorema de la divergencia (Gauss):** $\oiint_S\vec F\cdot\vec n\,dS = \iiint_W\nabla\cdot\vec F\,dV$, con $S$ el borde de $W$ y $\vec n$ hacia afuera. **Stokes:** $\oint_{\partial S}\vec F\cdot d\vec r = \iint_S(\nabla\times\vec F)\cdot\vec n\,dS$.`],
      idea: [R`La divergencia mide cuánto "sale" por unidad de volumen (fuentes y sumideros); el rotor, cuánto gira el campo. Gauss y Stokes son primos de [[c2-green|Green]] y del [[tfc|teorema fundamental]]: lo que pasa en el borde se calcula con lo de adentro.`,
        R`En electromagnetismo aparecen por todos lados: la ley de Gauss es el teorema de la divergencia aplicado al campo eléctrico.`],
      demo: [R`**Paso 1 (Gauss en una cajita).** Tomamos una caja $[x, x + dx]\times[y, y + dy]\times[z, z + dz]$. Por la cara de la derecha (normal $+\vec i$) sale el flujo $P(x + dx, y, z)\,dy\,dz$; por la de la izquierda (normal $-\vec i$), $-P(x, y, z)\,dy\,dz$. Juntas dan $\big(P(x + dx) - P(x)\big)\,dy\,dz \approx P_x\,dx\,dy\,dz$, por la definición de derivada.`,
        R`**Paso 2.** Las caras perpendiculares a $y$ y a $z$ dan, igual, $Q_y\,dV$ y $R_z\,dV$. El flujo saliente total de la cajita es $(P_x + Q_y + R_z)\,dV = \nabla\cdot\vec F\,dV$: por eso la divergencia es "flujo saliente por unidad de volumen".`,
        R`**Paso 3.** Un sólido cualquiera se parte en cajitas. Cada cara interior la comparten dos cajitas con normales opuestas: lo que sale de una entra en la otra, y esos flujos se cancelan. Al sumar sobrevive solo el flujo por la superficie exterior, y sumando el Paso 2: $$\oiint_S\vec F\cdot\vec n\,dS = \iiint_W\nabla\cdot\vec F\,dV.$$`,
        R`**Paso 4 (Stokes).** Es la misma idea que [[c2-green|Green]], sobre una superficie curva. Partimos $S$ en pedacitos casi planos. En cada uno vale Green, con la componente del rotor en la dirección normal, $(\nabla\times\vec F)\cdot\vec n$, en lugar de $Q_x - P_y$. Las circulaciones por los bordes interiores se recorren dos veces en sentidos opuestos y se cancelan: queda $\oint_{\partial S}\vec F\cdot d\vec r = \iint_S(\nabla\times\vec F)\cdot\vec n\,dS$.`,
        R`**Paso 5 (Green es un caso de Stokes).** Si $S$ está en el plano $xy$ con $\vec n = \vec k$, la tercera componente del rotor es $(\nabla\times\vec F)\cdot\vec k = Q_x - P_y$, y Stokes se reduce exactamente a Green.`,
        R`**Paso 6 (una identidad).** Calculamos la divergencia del rotor: $$\nabla\cdot(\nabla\times\vec F) = (R_y - Q_z)_x + (P_z - R_x)_y + (Q_x - P_y)_z = R_{yx} - Q_{zx} + P_{zy} - R_{xy} + Q_{xz} - P_{yz}.$$ Por Schwarz las derivadas cruzadas son iguales y se cancelan de a pares: da $0$. $\blacksquare$`],
      examples: [{ q: R`Flujo de $\vec F = (x, y, z)$ por la esfera de radio $R$.`, steps: [R`$\nabla\cdot\vec F = 3$: flujo $= 3\cdot\frac43\pi R^3 = 4\pi R^3$.`] }],
      tips: [R`El teorema de la divergencia necesita una superficie **cerrada**; si falta una tapa, hay que agregarla y restarla.`],
      see: ["c2-green", "c2-campos", "c2-triples"]
    }
  };

  E.extendCourse("m102", {
    concepts: { "c2-campos": { name: "Campos conservativos" }, "c2-linea": { name: "Integrales de línea" }, "c2-green": { name: "Teorema de Green" }, "c2-flujo": { name: "Divergencia, rotor y flujo" } },
    templates: T,
    units: [{
      id: "c2-vectorial-u", order: 7, program: "Unidad 7", title: "Análisis vectorial", icon: "zap",
      diagnostic: ["c2-trabajo-num", "c2-green-num", "c2-divergencia-num"],
      lessons: [
        { id: "c2-linea", title: "Integrales de línea y campos conservativos", templates: ["c2-trabajo-num", "c2-conservativo-vf", "c2-potencial-num"], theory: ["c2-linea", "c2-campos"],
          intro: R`$\int_C\vec F\cdot d\vec r = \int\vec F(\vec r(t))\cdot\vec r\,'(t)\,dt$. Si $\vec F = \nabla\varphi$, da $\varphi(B) - \varphi(A)$.` },
        { id: "c2-teoremas", title: "Green, Gauss y Stokes", templates: ["c2-green-num", "c2-rot-num", "c2-divergencia-num"], theory: ["c2-green", "c2-flujo"],
          intro: R`Green: $\oint P\,dx + Q\,dy = \iint(Q_x - P_y)\,dA$. Gauss: flujo saliente $= \iiint\nabla\cdot\vec F\,dV$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 8 · ECUACIONES DIFERENCIALES
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {};
  const nd = (x, d = 4) => num(x, d).replace(".", "{,}");
  const dec = x => String(x).replace(".", "{,}");

  T["c2-lineal-num"] = {
    type: "numeric", concepts: ["c2-edo-lineal"], difficulty: 2,
    generate(r) {
      if (r.bool()) {
        const a = r.pick([0.5, 1, 2, 3]), b = r.int(-6, 6), y0 = r.int(-5, 5), t1 = r.pick([1, 2]), eq = b / a, ans = eq + (y0 - eq) * Math.exp(-a * t1);
        if (y0 === eq) return null;
        return { prompt: `Resolvé $y' + ${a === 1 ? "" : dec(a)}y = ${b}$ con $y(0) = ${y0}$. ¿Cuánto vale $y(${t1})$?`, answer: ans,
          solution: [`[[c2-edo-lineal|Lineal de primer orden]], factor integrante $e^{${dec(a)}t}$: $(e^{${dec(a)}t}y)' = ${b}e^{${dec(a)}t}$.`, `$y = ${nd(eq)} + C e^{-${dec(a)}t}$ con $C = ${nd(y0 - eq)}$.`, `$y(${t1}) \\approx ${nd(ans)}$.`],
          verify: { kind: "ode", f: (t, y) => [b - a * y[0]], y0: [y0], t1, dt: 1e-3, out: (_, y) => y[0], tol: 1e-8 } };
      }
      const k = r.int(1, 3), y0 = r.int(-3, 4), x1 = r.pick([2, 3]), C = y0 - 1 / (k + 2), ans = x1 * x1 / (k + 2) + C / x1 ** k;
      return { prompt: `Resolvé $y' + \\frac{${k}}{x}y = x$ para $x > 0$, con $y(1) = ${y0}$. ¿Cuánto vale $y(${x1})$?`, answer: ans,
        solution: [`[[c2-edo-lineal|Factor integrante]] $\\mu = e^{\\int ${k}/x\\,dx} = x^{${k}}$: $(x^{${k}}y)' = x^{${k + 1}}$.`, `$x^{${k}}y = \\frac{x^{${k + 2}}}{${k + 2}} + C$, con $C = ${y0} - \\frac{1}{${k + 2}}$.`, `$y(${x1}) = \\frac{${x1 * x1}}{${k + 2}} + \\frac{C}{${x1 ** k}} \\approx ${nd(ans)}$.`],
        verify: { kind: "ode", f: (s, y) => [(s + 1) - k * y[0] / (s + 1)], y0: [y0], t1: x1 - 1, dt: 1e-3, out: (_, y) => y[0], tol: 1e-8 } };
    }
  };
  T["c2-separable-num"] = {
    type: "numeric", concepts: ["c2-edo-lineal"], difficulty: 2,
    generate(r) {
      const v = r.pick(["kxy", "xsobrey", "y2"]), y0 = r.int(1, 4);
      if (v === "kxy") { const k = r.pick([-2, -1, 1, 2]) / 2, x1 = r.pick([1, 2]), ans = y0 * Math.exp(k * x1 * x1 / 2);
        return { prompt: `Resolvé $y' = ${k === 1 ? "" : k === -1 ? "-" : dec(k) + "\\,"}xy$ con $y(0) = ${y0}$. ¿Cuánto vale $y(${x1})$?`, answer: ans,
          solution: [`[[edo|Separable]]: $\\frac{dy}{y} = ${dec(k)}x\\,dx$, así que $\\ln|y| = ${dec(k / 2)}x^2 + C$.`, `$y = ${y0}e^{${dec(k / 2)}x^2}$; en $x = ${x1}$, $\\approx ${nd(ans)}$.`],
          verify: { kind: "ode", f: (x, y) => [k * x * y[0]], y0: [y0], t1: x1, dt: 1e-3, out: (_, y) => y[0], tol: 1e-8 } }; }
      if (v === "xsobrey") { const x1 = r.int(1, 4), ans = Math.sqrt(y0 * y0 + x1 * x1);
        return { prompt: `Resolvé $y' = \\frac{x}{y}$ con $y(0) = ${y0}$. ¿Cuánto vale $y(${x1})$?`, answer: ans,
          solution: [`[[edo|Separable]]: $y\\,dy = x\\,dx$, así que $y^2 = x^2 + C$ con $C = ${y0 * y0}$.`, `$y = \\sqrt{x^2 + ${y0 * y0}}$ (la rama positiva, por la condición inicial): $y(${x1}) = \\sqrt{${x1 * x1 + y0 * y0}} \\approx ${nd(ans)}$.`],
          verify: { kind: "ode", f: (x, y) => [x / y[0]], y0: [y0], t1: x1, dt: 1e-3, out: (_, y) => y[0], tol: 1e-8 } }; }
      const x1 = r.pick([0.1, 0.2, 0.25]); if (y0 * x1 >= 0.9) return null;
      const ans = y0 / (1 - y0 * x1);
      return { prompt: `Resolvé $y' = y^2$ con $y(0) = ${y0}$. ¿Cuánto vale $y(${dec(x1)})$?`, answer: ans,
        solution: [`[[edo|Separable]]: $\\frac{dy}{y^2} = dx$, así que $-\\frac1y = x + C$ con $C = -\\frac{1}{${y0}}$.`, `$y = \\frac{${y0}}{1 - ${y0}x}$ (explota en $x = ${H.frac(1, y0)}$); $y(${dec(x1)}) \\approx ${nd(ans)}$.`],
        verify: { kind: "ode", f: (x, y) => [y[0] * y[0]], y0: [y0], t1: x1, dt: 1e-4, out: (_, y) => y[0], tol: 1e-7 } };
    }
  };
  T["c2-logistica-num"] = {
    type: "numeric", concepts: ["c2-edo-modelos"], difficulty: 3,
    generate(r) {
      const K = r.pick([100, 500, 1000, 2000]), P0 = K * r.pick([0.05, 0.1, 0.2, 0.25]), k = r.pick([0.1, 0.2, 0.3, 0.5]), A = (K - P0) / P0, ask = r.pick(["P", "t"]);
      if (ask === "t") {
        const ans = Math.log(A) / k;
        return { prompt: `Una población sigue $P' = ${dec(k)}P\\left(1 - \\frac{P}{${K}}\\right)$ con $P(0) = ${num(P0)}$. ¿En cuánto tiempo llega a la mitad de la capacidad de carga?`, answer: ans,
          solution: [`[[c2-edo-modelos|Logística]]: $P(t) = \\frac{K}{1 + Ae^{-kt}}$ con $A = \\frac{K - P_0}{P_0} = ${nd(A)}$.`, `$P = \\frac K2$ cuando $Ae^{-kt} = 1$: $t = \\frac{\\ln A}{k} \\approx ${nd(ans)}$.`],
          verify: { kind: "ode", f: (t, y) => [k * y[0] * (1 - y[0] / K)], y0: [P0], t1: 1e9, dt: 1e-2, until: (t, y) => y[0] >= K / 2, g: (t, y) => y[0] - K / 2, out: t => t, tol: 1e-6 } };
      }
      const t1 = r.int(5, 30), ans = K / (1 + A * Math.exp(-k * t1));
      return { prompt: `Una población sigue $P' = ${dec(k)}P\\left(1 - \\frac{P}{${K}}\\right)$ con $P(0) = ${num(P0)}$. ¿Cuánto vale $P(${t1})$?`, answer: ans,
        solution: [`[[c2-edo-modelos|Logística]]: $P(t) = \\frac{K}{1 + Ae^{-kt}}$ con $K = ${K}$ y $A = \\frac{K - P_0}{P_0} = ${nd(A)}$.`, `$P(${t1}) = \\frac{${K}}{1 + ${nd(A)}e^{-${nd(k * t1)}}} \\approx ${nd(ans)}$.`],
        verify: { kind: "ode", f: (t, y) => [k * y[0] * (1 - y[0] / K)], y0: [P0], t1, dt: 1e-2, out: (_, y) => y[0], tol: 1e-7 } };
    }
  };
  T["c2-mezcla-num"] = {
    type: "numeric", concepts: ["c2-edo-modelos"], difficulty: 2,
    generate(r) {
      const V = r.pick([100, 200, 500, 1000]), S0 = r.int(0, 20), c = r.pick([0.05, 0.1, 0.2, 0.5]), q = r.pick([2, 5, 10, 20]), t1 = r.pick([10, 20, 30, 60]);
      const Seq = V * c, ans = Seq + (S0 - Seq) * Math.exp(-q * t1 / V);
      if (S0 === Seq) return null;
      return {
        prompt: `Un tanque tiene $${V}$ L de agua con $${S0}$ kg de sal. Entra salmuera con $${dec(c)}$ kg/L a $${q}$ L/min y sale la mezcla (bien revuelta) al mismo ritmo. ¿Cuántos kg de sal hay a los $${t1}$ minutos?`,
        answer: ans,
        solution: [`[[c2-edo-modelos|Problema de mezcla]]: $S' = (\\text{entra}) - (\\text{sale}) = ${dec(c)}\\cdot${q} - \\frac{S}{${V}}\\cdot${q}$.`, `Es [[c2-edo-lineal|lineal]]: $S(t) = ${num(Seq)} + (${S0} - ${num(Seq)})e^{-${H.frac(q, V)}t}$.`, `$S(${t1}) \\approx ${nd(ans)}$ kg.`],
        verify: { kind: "ode", f: (t, y) => [c * q - y[0] * q / V], y0: [S0], t1, dt: 1e-2, out: (_, y) => y[0], tol: 1e-8 }
      };
    }
  };
  T["c2-solucion-vf"] = {
    type: "tf", concepts: ["c2-edo-lineal"], difficulty: 1,
    generate(r) {
      const v = r.pick(["exp", "x", "osc"]), ok = r.bool();
      let prompt, f, F, why;
      if (v === "exp") { const k = r.nz(-3, 3), m = r.nz(-4, 4); prompt = `$y = Ce^{${k === 1 ? "" : k === -1 ? "-" : k}x} ${ok === (m / k < 0) ? "+" : "-"} ${H.frac(Math.abs(m), Math.abs(k))}$ es solución de $y' = ${k === 1 ? "" : k === -1 ? "-" : k}y ${m < 0 ? "-" : "+"} ${Math.abs(m)}$ para todo $C$`;
        const s = ok ? -m / k : m / k; f = (x, C) => C * Math.exp(k * x) + s; F = (x, y) => k * y + m; why = `La solución general es $y = Ce^{${k === 1 ? "" : k === -1 ? "-" : k}x} ${-m / k < 0 ? "-" : "+"} ${H.frac(Math.abs(m), Math.abs(k))}$: la constante es el equilibrio, donde $y' = 0$.`; }
      else if (v === "x") { const a = r.int(1, 3); prompt = `$y = ${ok ? "" : "x^2 + "}${H.frac(2, a + 1) === "1" ? "" : H.frac(2, a + 1)}x + \\frac{C}{x^{${a}}}$ es solución de $y' + \\frac{${a}}{x}y = 2$ (con $x > 0$) para todo $C$`;
        f = (x, C) => (ok ? 0 : x * x) + 2 / (a + 1) * x + C / x ** a; F = (x, y) => 2 - a * y / x; why = `Con el factor integrante $x^{${a}}$: $(x^{${a}}y)' = 2x^{${a}}$, así que $y = \\frac{2}{${a + 1}}x + \\frac{C}{x^{${a}}}$.`; }
      else { const w = r.int(2, 5); prompt = `$y = C\\cos(${ok ? w : "x/" + w}x)$`.replace("x/" + w + "x", `\\frac{x}{${w}}`) + ` es solución de $y'' + ${w * w}y = 0$ para todo $C$`;
        f = (x, C) => C * Math.cos(ok ? w * x : x / w); F = null; why = `$y = \\cos(\\omega x)$ cumple $y'' = -\\omega^2y$, así que hace falta $\\omega^2 = ${w * w}$.`; }
      return {
        prompt: `<b>Verdadero o falso:</b> ${prompt}.`,
        answer: ok,
        explanation: `${why} ([[c2-edo-lineal|verificar una solución]]: se reemplaza en la ecuación).`,
        solution: [`Para chequear una solución no hace falta resolver: se deriva y se reemplaza.`],
        // verificación: residuo de la ecuación con derivadas numéricas, en varios puntos y para dos valores de C
        verify: { kind: "truth", fn: () => [0.7, 1.3, 2.1].every(x => [1.7, -0.6].every(C => { const h = 1e-4, d1 = (f(x + h, C) - f(x - h, C)) / (2 * h); if (F) return Math.abs(d1 - F(x, f(x, C))) < 1e-6 * Math.max(1, Math.abs(d1)); const d2 = (f(x + h, C) - 2 * f(x, C) + f(x - h, C)) / (h * h); const w2 = v === "osc" ? Number(/y'' \+ (\d+)y/.exec(prompt)[1]) : 0; return Math.abs(d2 + w2 * f(x, C)) < 1e-3; })) }
      };
    }
  };

  const cards = {
    "c2-edo-lineal": {
      title: "Ecuaciones lineales de primer orden", aliases: ["ecuación lineal de primer orden", "ecuaciones lineales de primer orden", "factor integrante", "ecuación diferencial lineal", "condición inicial", "problema de valor inicial"], concepts: ["c2-edo-lineal"],
      summary: "y' + p(x)y = q(x). Se multiplica por μ = e^{∫p}: (μy)' = μq, y se integra.",
      def: [R`Una **ecuación diferencial ordinaria** de primer orden relaciona $x$, $y$ e $y'$. Es **lineal** si se puede escribir $y' + p(x)y = q(x)$.`,
        R`**Factor integrante:** con $\mu(x) = e^{\int p(x)\,dx}$, la ecuación queda $(\mu y)' = \mu q$, y $y = \frac{1}{\mu}\left(\int\mu q\,dx + C\right)$. La constante sale de la **condición inicial**.`],
      idea: [R`El factor integrante convierte el lado izquierdo en la derivada de un producto ([[regla-producto|regla del producto]] al revés), y entonces se integra directo.`,
        R`Las [[edo|separables]] $y' = g(x)h(y)$ se resuelven separando; algunas ecuaciones son de los dos tipos (por ejemplo $y' = ky$).`,
        R`Para **verificar** una solución no hace falta resolver: se deriva y se reemplaza en la ecuación.`],
      demo: [R`**Paso 1 (qué cumple el factor integrante).** Con $\mu = e^{\int p\,dx}$, por la [[regla-cadena|regla de la cadena]] (la derivada de $e^u$ es $e^u u'$, y la de $\int p$ es $p$), resulta $\mu' = p\,\mu$. Además $\mu > 0$, así que nunca se anula.`,
        R`**Paso 2 (aparece la derivada de un producto).** Derivamos $\mu y$ con la [[regla-producto|regla del producto]] y usamos el Paso 1: $$(\mu y)' = \mu' y + \mu y' = p\mu\,y + \mu\,y' = \mu\,(y' + py).$$`,
        R`**Paso 3.** Si $y$ es solución, $y' + py = q$, así que $(\mu y)' = \mu q$. Ahora la ecuación dice que $\mu y$ es una primitiva de $\mu q$: integrando, $\mu y = \int\mu q\,dx + C$.`,
        R`**Paso 4.** Como $\mu \neq 0$, despejamos $y = \frac1\mu\left(\int\mu q\,dx + C\right)$. Los pasos se pueden recorrer al revés, así que toda función de esta forma es solución, y no hay otras. La condición inicial elige el $C$. $\blacksquare$`],
      examples: [{ q: R`$y' + 2y = 4$, $y(0) = 0$.`, steps: [R`$\mu = e^{2x}$: $(e^{2x}y)' = 4e^{2x}$, $e^{2x}y = 2e^{2x} + C$.`, R`$y = 2 + Ce^{-2x}$ con $C = -2$: $y = 2 - 2e^{-2x}$.`] }],
      tips: [R`Antes de calcular $\mu$, el coeficiente de $y'$ tiene que ser $1$: dividí si hace falta.`],
      see: ["edo", "c2-edo-modelos", "regla-producto"]
    },
    "c2-edo-modelos": {
      title: "Modelos: logística y mezclas", aliases: ["ecuación logística", "modelo logístico", "crecimiento logístico", "capacidad de carga", "problema de mezcla", "problemas de mezcla"], concepts: ["c2-edo-modelos"],
      summary: "Logística: P' = kP(1 − P/K), con P = K/(1 + Ae^{−kt}). Mezcla: S' = (entra) − (sale), una lineal.",
      def: [R`**Logística:** $P' = kP\left(1 - \frac PK\right)$. Es [[edo|separable]], con solución $P(t) = \frac{K}{1 + Ae^{-kt}}$, $A = \frac{K - P_0}{P_0}$. $K$ es la **capacidad de carga**.`,
        R`**Mezclas:** si $S(t)$ es la cantidad de soluto, $S' = c_\text{in}q_\text{in} - \frac{S}{V}q_\text{out}$. Con $q_\text{in} = q_\text{out}$ el volumen es constante y queda [[c2-edo-lineal|lineal]].`],
      idea: [R`La logística empieza creciendo casi [[modelos|exponencial]] y frena al acercarse a $K$: crece más rápido justo en $P = \frac K2$ (el punto de inflexión).`,
        R`En una mezcla, la cantidad tiende al equilibrio $Vc_\text{in}$, el que tendría el tanque lleno de la solución que entra, y se acerca exponencialmente.`],
      demo: [R`**Paso 1 (logística: separar).** Las soluciones constantes $P = 0$ y $P = K$ salen a simple vista. Para las demás, dividimos por $P(1 - P/K)$ y separamos variables, como en las [[edo|ecuaciones separables]]: $$\int\frac{dP}{P\,(1 - P/K)} = \int k\,dt.$$`,
        R`**Paso 2 (fracciones simples).** Multiplicando arriba y abajo por $K$, el integrando es $\frac{K}{P(K - P)}$, que por [[fracciones-simples]] se separa en $\frac1P + \frac{1}{K - P}$ (sumándolas se verifica). Integrando, $\ln|P| - \ln|K - P| = kt + C$, porque la primitiva de $\frac{1}{K - P}$ es $-\ln|K - P|$.`,
        R`**Paso 3 (despejar).** Juntamos los logaritmos y tomamos exponencial: $\frac{P}{K - P} = Be^{kt}$. Invertimos: $\frac{K - P}{P} = \frac KP - 1 = Ae^{-kt}$, con $A = \frac1B$. Despejando, $$P = \frac{K}{1 + Ae^{-kt}}.$$ En $t = 0$ queda $P_0 = \frac{K}{1 + A}$, o sea $A = \frac{K - P_0}{P_0}$.`,
        R`**Paso 4 (crece más rápido en la mitad).** La velocidad de crecimiento es $P' = kP - \frac kKP^2$, una parábola en $P$ que se anula en $0$ y en $K$: su máximo está en el vértice, a mitad de camino, $P = \frac K2$. Derivando respecto de $t$ con la regla de la cadena, $P'' = \left(k - \frac{2k}{K}P\right)P'$, que cambia de signo justo en $P = \frac K2$: es el punto de inflexión.`,
        R`**Paso 5 (mezclas: el balance).** La cantidad de soluto cambia por lo que entra menos lo que sale. Entra $c_{in}\,q$ por unidad de tiempo. Sale líquido a caudal $q$ con la concentración del tanque, $\frac SV$ (suponemos que se mezcla al instante). Con $q_{in} = q_{out} = q$ el volumen $V$ no cambia y $S' = c_{in}q - \frac qVS$.`,
        R`**Paso 6.** El equilibrio ($S' = 0$) es $S = Vc_{in}$. Restándolo, $u = S - Vc_{in}$ cumple $u' = S' = -\frac qV\,u$, que es la ecuación del decaimiento exponencial: $u = u_0e^{-qt/V}$. La diferencia con el equilibrio se achica exponencialmente. $\blacksquare$`],
      examples: [{ q: R`$P' = 0{,}5P(1 - P/100)$, $P(0) = 10$. ¿Cuándo llega a 50?`, steps: [R`$A = 9$; $9e^{-0{,}5t} = 1$, así que $t = 2\ln 9 \approx 4{,}39$.`] }],
      see: ["c2-edo-lineal", "edo", "modelos"]
    }
  };

  E.extendCourse("m102", {
    concepts: { "c2-edo-lineal": { name: "EDO lineales de primer orden" }, "c2-edo-modelos": { name: "Modelos con EDO" } },
    templates: T,
    units: [{
      id: "c2-edo-u", order: 8, program: "Unidad 8", title: "Ecuaciones diferenciales", icon: "zap",
      diagnostic: ["c2-lineal-num", "c2-separable-num", "c2-mezcla-num"],
      lessons: [
        { id: "c2-edo-primer-orden", title: "Separables y lineales", templates: ["c2-solucion-vf", "c2-separable-num", "c2-lineal-num"], theory: ["c2-edo-lineal"],
          intro: R`Separables: $\frac{dy}{h(y)} = g(x)\,dx$. Lineales: factor integrante $\mu = e^{\int p}$.` },
        { id: "c2-edo-modelos", title: "Modelos", templates: ["c2-mezcla-num", "c2-logistica-num"], theory: ["c2-edo-modelos"],
          intro: R`Logística $P' = kP(1 - P/K)$ y mezclas $S' = \text{entra} - \text{sale}$.` }
      ]
    }],
    cards
  });
})();
