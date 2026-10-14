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
      demo: [R`**Pendiente.** Si $x'(t_0) \neq 0$, cerca de $t_0$ se puede despejar $t$ en función de $x$ y $y = y(t(x))$. Por la [[regla-cadena|regla de la cadena]], $\frac{dy}{dx} = y'(t)\frac{dt}{dx} = \frac{y'(t)}{x'(t)}$. $\blacksquare$`],
      examples: [{ q: R`Pendiente de $x = t^2$, $y = t^3$ en $t = 2$.`, steps: [R`$\frac{dy}{dx} = \frac{3t^2}{2t} = \frac{3t}{2} = 3$.`] }],
      tips: [R`$\frac{dy}{dx}$ no es $\frac{dx}{dt}$ ni $\frac{dy}{dt}$: es su cociente.`],
      see: ["c2-polares"]
    },
    "c2-polares": {
      title: "Coordenadas polares", aliases: ["coordenadas polares", "polares", "cardioide", "rosa polar", "área en polares", "curvas polares"], concepts: ["c2-polares"],
      summary: "Un punto se describe por su distancia r al origen y su ángulo θ. x = r cos θ, y = r sen θ. Área: ½∫r² dθ.",
      def: [R`**Coordenadas polares** $(r, \theta)$: $x = r\cos\theta$, $y = r\sin\theta$; al revés, $r = \sqrt{x^2 + y^2}$ y $\tan\theta = \frac yx$ (cuidando el cuadrante).`,
        R`**Área** de la región barrida por $r = f(\theta)$ entre $\alpha$ y $\beta$: $A = \frac12\int_\alpha^\beta f(\theta)^2\,d\theta$.`,
        R`**Cónicas en polares** (foco en el origen): $r = \frac{ed}{1 + e\cos\theta}$; $e$ es la excentricidad.`],
      idea: [R`La fórmula del área sale de sumar sectores circulares finitos: un sector de radio $r$ y ángulo $d\theta$ tiene área $\frac12r^2\,d\theta$.`,
        R`Las curvas típicas: circunferencias $r = a$ y $r = 2a\sin\theta$, cardioides $r = a(1 \pm \cos\theta)$, rosas $r = a\cos(n\theta)$ (con $n$ pétalos si $n$ es impar y $2n$ si es par) y espirales $r = a\theta$.`],
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
      examples: [{ q: R`¿Qué es $x^2 - y^2 + z^2 = 1$?`, steps: [R`Un signo menos, igualado a $1$: hiperboloide de una hoja con eje $y$.`] }],
      see: ["c2-conicas", "c2-rectas-planos", "c2-coord-espacio"]
    },
    "c2-coord-espacio": {
      title: "Coordenadas cilíndricas y esféricas", aliases: ["coordenadas cilíndricas", "coordenadas esféricas", "cilíndricas", "esféricas"], concepts: ["c2-coord-espacio"],
      summary: "Cilíndricas: (r, θ, z), polares en el plano xy más la altura. Esféricas: (ρ, φ, θ), con ρ distancia al origen y φ ángulo desde el eje z.",
      def: [R`**Cilíndricas** $(r, \theta, z)$: $x = r\cos\theta$, $y = r\sin\theta$, $z = z$.`,
        R`**Esféricas** $(\rho, \varphi, \theta)$: $x = \rho\sin\varphi\cos\theta$, $y = \rho\sin\varphi\sin\theta$, $z = \rho\cos\varphi$, con $\rho \ge 0$, $0 \le \varphi \le \pi$.`],
      idea: [R`Se elige el sistema según la simetría: cilindros y conos con eje $z$ se escriben fácil en cilíndricas ($r = 2$ es un cilindro); esferas en esféricas ($\rho = 3$). Simplifican mucho las integrales triples.`],
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
              : `El cociente tiende a ${v === "np/kn" ? `$\\frac{|x - x_0|}{${k}}$: $R = ${k}$` : `$${k}|x - x_0|$: $R = ${H.frac(1, k)}$`} ${p > 0 ? ` (la potencia $n^{${p}}$ no cambia el radio)` : ""}.`,
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
      demo: [R`**Coeficientes.** Si $f(x) = \sum c_n(x - a)^n$ con radio positivo, derivando $k$ veces término a término y evaluando en $a$, sobrevive solo el término $n = k$: $f^{(k)}(a) = k!\,c_k$. Así que los coeficientes son forzosamente $c_k = \frac{f^{(k)}(a)}{k!}$. $\blacksquare$`],
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
