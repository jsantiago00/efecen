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
      see: ["c2-polares", "c2-curvas-vectoriales"]
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
      examples: [{ q: R`$f = x^2 - y^2$ en $(0, 0)$.`, steps: [R`$f_{xx} = 2$, $f_{yy} = -2$, $f_{xy} = 0$: $D = -4 < 0$, punto silla.`] }],
      see: ["c2-lagrange", "extremos", "c2-gradiente"]
    },
    "c2-lagrange": {
      title: "Multiplicadores de Lagrange", aliases: ["multiplicadores de Lagrange", "multiplicador de Lagrange", "extremos condicionados", "extremos con restricciones"], concepts: ["c2-lagrange"],
      summary: "Para optimizar f con la restricción g = c, se resuelve ∇f = λ∇g junto con g = c.",
      def: [R`Los extremos de $f(x, y)$ sobre la curva $g(x, y) = c$ (con $\nabla g \ne \vec 0$) están entre las soluciones de $$\nabla f = \lambda\nabla g, \qquad g(x, y) = c.$$`],
      idea: [R`En el óptimo, la curva de nivel de $f$ es **tangente** a la restricción: si la cortara, moviéndose sobre la restricción se podría subir o bajar $f$. Curvas tangentes tienen [[c2-gradiente|gradientes]] paralelos, y eso dice $\nabla f = \lambda\nabla g$.`,
        R`Es la versión con restricción de la [[optimizacion|optimización]] de una variable: en lugar de despejar, se agrega una incógnita $\lambda$.`],
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
