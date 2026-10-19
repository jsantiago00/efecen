/* ===== M106 · Evaluaciones: parciales y examen de promoción / final simulados =====
   Estructura de los exámenes reales (ver docs/parciales/m106.md): ejercicios de varios incisos, con ecuaciones
   vectoriales paramétricas, gráficos con todos los elementos y deducciones. Enunciados propios y números
   sorteados. Los ejercicios largos son de desarrollo (`self`): la resolución muestra los valores y se corrige
   con la rúbrica. */
(function () {
  const E = window.Efecen, R = String.raw;
  const SELF = {}, T = {};
  const nf = (H, x, d = 3) => H.num(x, d).replace(".", "{,}");
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const lcm = (a, b) => a / gcd(a, b) * b;
  const dot = (u, v) => u.reduce((s, x, i) => s + x * v[i], 0);
  const norm = u => Math.sqrt(dot(u, u));
  const cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const tup = xs => `\\left(${xs.join(",\\ ")}\\right)`;
  const pm = M => `\\begin{pmatrix} ${M.map(row => row.join(" & ")).join(R` \\ `)} \\end{pmatrix}`;
  // mínimo de una función convexa en [a, b] (búsqueda ternaria), para recalcular distancias
  const tmin = (f, a, b) => { for (let i = 0; i < 200; i++) { const m1 = a + (b - a) / 3, m2 = b - (b - a) / 3; if (f(m1) < f(m2)) b = m2; else a = m1; } return f((a + b) / 2); };
  // √n exacta si es un cuadrado perfecto
  const sq = n => (Number.isInteger(Math.sqrt(n)) ? String(Math.sqrt(n)) : `\\sqrt{${n}}`);
  // a·√n como texto (con a entero)
  // (x − h)² o x² si h = 0
  const sqt = (H, h, v) => (h === 0 ? `${v}^2` : `(${H.xm(h, v)})^2`);
  const ksq = (k, n) => { let a = k, m = n; for (let f = 2; f * f <= m; f++) while (m % (f * f) === 0) { m /= f * f; a *= f; } return m === 1 ? String(a) : `${a === 1 ? "" : a === -1 ? "-" : a}\\sqrt{${m}}`; };

  // ---------- 1.er parcial ----------
  // completar una base ortonormal, matriz ortogonal, coordenadas y proyección
  SELF["ga-ex-base-on"] = {
    concepts: ["ga-cosenos-directores", "ga-proyeccion-eje"],
    generate(r, H) {
      const [a0, b0, c] = r.pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [8, 15, 17], [15, 8, 17]]);
      const a = a0 * r.pick([-1, 1]), b = b0 * r.pick([-1, 1]);
      const cB = [r.nz(-3, 3), r.nz(-3, 3), r.nz(-3, 3)], u = [r.nz(-6, 6), r.int(-6, 6), r.nz(-4, 4)];
      const fr = n => H.frac(n, c);
      const v1 = [a / c, b / c, 0], v2 = [0, 0, 1], v3 = [b / c, -a / c, 0];
      const w = [0, 1, 2].map(i => cB[0] * v1[i] + cB[1] * v2[i] + cB[2] * v3[i]);
      const wT = [fr(cB[0] * a + cB[2] * b), fr(cB[0] * b - cB[2] * a), String(cB[1])];
      const s = (u[0] * a + u[1] * b), proj = [s * a, s * b];
      if (s === 0) return null;
      const Q = [[fr(a), "0", fr(b)], [fr(b), "0", fr(-a)], ["0", "1", "0"]];
      return {
        prompt: `Sean $\\vec v_1 = ${tup([fr(a), fr(b), "0"])}$ y $\\vec v_2 = (0, 0, 1)$. a) Hallá las componentes de $\\vec v_3$ para que $B = \\{\\vec v_1, \\vec v_2, \\vec v_3\\}$ sea una base ortonormal de $\\mathbb{R}^3$ con orientación positiva ($\\det = 1$). Justificá. b) Armá la matriz $Q$ que tiene por columnas los vectores de $B$ y demostrá que es ortogonal. c) Si $(\\vec w)_B = (${cB.join(", ")})$, hallá las componentes de $\\vec w$ en la base canónica. d) Calculá la proyección de $\\vec u = (${u.join(", ")})$ en la dirección de $\\vec v_1$ e interpretala geométricamente.`,
        rubric: [
          { text: `a) $\\vec v_3 = \\vec v_1 \\times \\vec v_2 = ${tup([fr(b), fr(-a), "0"])}$: es unitario y perpendicular a los otros dos (tres vectores ortonormales son LI y generan $\\mathbb{R}^3$).`, w: 4 },
          { text: `b) $Q = ${pm(Q)}$ cumple $Q^TQ = I$ (columnas ortonormales); además $\\det Q = 1$.`, w: 4 },
          { text: `c) $\\vec w = ${cB[0]}\\,\\vec v_1 ${H.sg(cB[1])}\\,\\vec v_2 ${H.sg(cB[2])}\\,\\vec v_3 = ${tup(wT)}$.`, w: 4 },
          { text: `d) $\\operatorname{proy}_{\\vec v_1}\\vec u = (\\vec u\\cdot\\vec v_1)\\,\\vec v_1 = ${fr(s)}\\,\\vec v_1 = ${tup([H.frac(proj[0], c * c), H.frac(proj[1], c * c), "0"])}$: es la «sombra» de $\\vec u$ sobre la recta de $\\vec v_1$.`, w: 4 }
        ],
        solution: [
          `a) $\\|\\vec v_1\\|^2 = \\frac{${a * a} + ${b * b}}{${c * c}} = 1$ y $\\vec v_1\\cdot\\vec v_2 = 0$. El tercero tiene que ser unitario y perpendicular a los dos: el producto vectorial lo es, y con ese orden la base queda con orientación positiva: $\\vec v_3 = \\vec v_1\\times\\vec v_2 = ${tup([fr(b), fr(-a), "0"])}$. (Con $-\\vec v_3$ también es ortonormal, pero con $\\det = -1$.)`,
          R`Tres vectores no nulos y ortogonales dos a dos son linealmente independientes; en $\mathbb{R}^3$ eso alcanza para ser base.`,
          `b) $Q = ${pm(Q)}$. Cada elemento de $Q^TQ$ es un producto escalar $\\vec v_i\\cdot\\vec v_j$: vale $1$ si $i = j$ y $0$ si no, así que $Q^TQ = I$ y $Q^{-1} = Q^T$. Desarrollando por la tercera fila (su único elemento no nulo es el $1$ de la posición $(3, 2)$, con signo $-$): $\\det Q = -\\left(-\\frac{${a * a}}{${c * c}} - \\frac{${b * b}}{${c * c}}\\right) = 1$.`,
          `c) $\\vec w = Q\\,(\\vec w)_B = ${cB[0]}\\,\\vec v_1 ${H.sg(cB[1])}\\,\\vec v_2 ${H.sg(cB[2])}\\,\\vec v_3 = ${tup(wT)}$. (Chequeo: $\\vec w\\cdot\\vec v_i$ devuelve cada coordenada.)`,
          `d) Como $\\vec v_1$ es unitario, $\\operatorname{proy}_{\\vec v_1}\\vec u = (\\vec u\\cdot\\vec v_1)\\vec v_1$, con $\\vec u\\cdot\\vec v_1 = ${fr(s)}$: queda $${tup([H.frac(proj[0], c * c), H.frac(proj[1], c * c), "0"])}$. Es el vector sobre la recta de $\\vec v_1$ que se obtiene bajando una perpendicular desde el extremo de $\\vec u$; $\\vec u - \\operatorname{proy}$ es perpendicular a $\\vec v_1$.`
        ],
        verify: { kind: "zero", tol: 1e-9, fn: () => {
          const cols = [v1, v2, v3], QtQ = [0, 1, 2].flatMap(i => [0, 1, 2].map(j => dot(cols[i], cols[j]) - (i === j ? 1 : 0)));
          const det = dot(v1, cross(v2, v3)) - 1, coords = cols.map((v, i) => dot(w, v) - cB[i]);
          const pv = [proj[0] / (c * c), proj[1] / (c * c), 0], perp = dot(u.map((x, i) => x - pv[i]), v1);
          // las componentes que se muestran de w, contra las calculadas con la combinación lineal
          return [...QtQ, det, ...coords, perp, w[0] - (cB[0] * a + cB[2] * b) / c, w[1] - (cB[0] * b - cB[2] * a) / c, w[2] - cB[1]];
        } }
      };
    }
  };

  // haz de planos por una recta, trazas, distancias entre rectas alabeadas y ángulo recta-plano
  SELF["ga-ex-haz-trazas"] = {
    concepts: ["ga-haz-planos", "ga-distancias", "ga-angulos"],
    generate(r, H) {
      const b = r.int(3, 12), c = r.int(2, 9), k = r.int(3, 20);
      if (b === c) return null;
      const L = lcm(lcm(k, b), c), L2 = lcm(b, c);
      const d1 = k * c / Math.sqrt(k * k + c * c), d2 = b * c / Math.sqrt(b * b + c * c), ang = Math.atan(c / b) * 180 / Math.PI;
      const plane = H.poly([[L / k, "x"], [L / b, "y"], [L / c, "z"]]) + ` = ${L}`, plane3 = H.poly([[L2 / b, "y"], [L2 / c, "z"]]) + ` = ${L2}`;
      return {
        prompt: `Sean $C(0, 0, ${c})$ y $B(0, ${b}, 0)$. a) Escribí la ecuación de la familia de planos cuya traza común es la recta que pasa por $C$ y $B$, usando como parámetro $k$ la abscisa al origen de cada plano, y representá dos planos de la familia. b) Hallá el plano $\\pi_2$ de la familia con $k = ${k}$ y una ecuación vectorial paramétrica de su traza en el plano $xz$. c) Calculá la distancia entre esa traza y el eje $y$. d) Hallá el plano $\\pi_3$, perpendicular al plano $yz$, cuya traza en ese plano pasa por $C$ y $B$. e) Calculá la distancia entre el eje $x$ y $\\pi_3$. f) Calculá el ángulo que forma la recta $CB$ con el plano $xy$.`,
        rubric: [
          { text: `a) $\\frac{x}{k} + \\frac{y}{${b}} + \\frac{z}{${c}} = 1$ (todos contienen a $B$ y a $C$); dos planos dibujados con sus trazas.`, w: 4 },
          { text: `b) $\\pi_2: ${plane}$; traza en $xz$: $(x, y, z) = (${k}, 0, 0) + t(${-k}, 0, ${c})$, $t \\in \\mathbb{R}$.`, w: 4 },
          { text: `c) Son alabeadas: $d = \\frac{|\\overrightarrow{OA}\\cdot(\\vec d_1\\times\\vec d_2)|}{\\|\\vec d_1\\times\\vec d_2\\|} = \\frac{${k * c}}{\\sqrt{${k * k + c * c}}} \\approx ${nf(H, d1)}$.`, w: 5 },
          { text: `d) $\\pi_3: ${plane3}$ (no depende de $x$: su normal es paralela al plano $yz$).`, w: 4 },
          { text: `e) $\\pi_3$ es paralelo al eje $x$: $d = d(O, \\pi_3) = \\frac{${b * c}}{\\sqrt{${b * b + c * c}}} \\approx ${nf(H, d2)}$.`, w: 4 },
          { text: `f) $\\operatorname{sen}\\varphi = \\frac{|\\vec d\\cdot\\vec k|}{\\|\\vec d\\|} = \\frac{${c}}{\\sqrt{${b * b + c * c}}}$: $\\varphi \\approx ${nf(H, ang, 2)}^\\circ$.`, w: 4 }
        ],
        solution: [
          `a) Un plano que corta a los ejes en $(k, 0, 0)$, $(0, ${b}, 0)$ y $(0, 0, ${c})$ tiene ecuación segmentaria $\\frac{x}{k} + \\frac{y}{${b}} + \\frac{z}{${c}} = 1$. Para cualquier $k \\neq 0$ contiene a $B$ y a $C$, así que contiene a la recta $BC$: es el haz de planos por esa recta (le falta solo el plano $x = 0$, el que se obtiene con $k \\to 0$).`,
          `b) Con $k = ${k}$: $\\frac{x}{${k}} + \\frac{y}{${b}} + \\frac{z}{${c}} = 1$; multiplicando por $${L}$: $${plane}$. Su traza en $xz$ ($y = 0$) pasa por $A(${k}, 0, 0)$ y por $C(0, 0, ${c})$: $(x, y, z) = (${k}, 0, 0) + t\\,\\overrightarrow{AC} = (${k}, 0, 0) + t(${-k}, 0, ${c})$.`,
          `c) La traza y el eje $y$ (por $O$, dirección $(0, 1, 0)$) no se cortan y no son paralelas: son alabeadas. $\\vec d_1\\times\\vec d_2 = (${-k}, 0, ${c})\\times(0, 1, 0) = (${-c}, 0, ${-k})$ y $\\overrightarrow{OA} = (${k}, 0, 0)$, así que $d = \\frac{|${-k * c}|}{\\sqrt{${c * c} + ${k * k}}} \\approx ${nf(H, d1)}$. (Es la distancia de $O$ a la traza dentro del plano $xz$.)`,
          `d) «Perpendicular al plano $yz$» quiere decir que su normal no tiene componente en $x$: el plano es paralelo al eje $x$. Como su traza en $yz$ pasa por $B$ y $C$: $\\frac{y}{${b}} + \\frac{z}{${c}} = 1$, o sea $${plane3}$. (Es el miembro del haz con $k \\to \\infty$.)`,
          `e) La recta y el plano son paralelos, así que la distancia es la de cualquier punto del eje, por ejemplo $O$: $d = \\frac{|0 + 0 - ${L2}|}{\\sqrt{${(L2 / b) ** 2} + ${(L2 / c) ** 2}}} = \\frac{${b * c}}{\\sqrt{${b * b + c * c}}} \\approx ${nf(H, d2)}$.`,
          `f) La recta $CB$ tiene dirección $\\vec d = (0, ${b}, ${-c})$ y el plano $xy$ tiene normal $\\vec k$. El ángulo recta-plano es el complemento del ángulo con la normal: $\\operatorname{sen}\\varphi = \\frac{${c}}{\\sqrt{${b * b + c * c}}}$, $\\varphi \\approx ${nf(H, ang, 2)}^\\circ$.`
        ],
        verify: { kind: "zero", tol: 1e-6, fn: () => [
          // c) punto de la traza (k − kt, 0, ct) más cercano al eje y
          tmin(t => Math.hypot(k - k * t, c * t), -5, 5) - d1,
          // e) puntos de π3 en x = 0: (0, b(1 − s), cs); su distancia al eje x
          tmin(s => Math.hypot(b * (1 - s), c * s), -5, 5) - d2,
          // f) ángulo entre la recta y su proyección sobre el plano xy
          Math.acos(b / Math.hypot(b, c)) * 180 / Math.PI - ang,
          // π2 contiene a A, B y C
          (L / k) * k - L, (L / b) * b - L, (L / c) * c - L
        ] }
      };
    }
  };

  // dos circunferencias secantes: recta de los centros, eje radical y un punto de la paramétrica
  SELF["ga-ex-circ-radical"] = {
    concepts: ["ga-circunferencia", "ga-recta-plano-xy"],
    generate(r, H) {
      const h1 = r.int(-5, 5), k1 = r.int(-5, 5), h2 = r.int(-5, 5), k2 = r.int(-5, 5), r1 = r.int(2, 6), r2 = r.int(2, 7);
      const D = Math.hypot(h2 - h1, k2 - k1);
      if (D < 1 || D >= r1 + r2 - 0.3 || D <= Math.abs(r1 - r2) + 0.3) return null;
      const A = 2 * (h2 - h1), B = 2 * (k2 - k1), C0 = (h1 * h1 + k1 * k1 - r1 * r1) - (h2 * h2 + k2 * k2 - r2 * r2);
      const g = gcd(gcd(A, B), C0), g2 = gcd(h2 - h1, k2 - k1);
      const dir = [-(k2 - k1) / g2, (h2 - h1) / g2];
      const [th, cs, sn] = r.pick([[30, R`\frac{\sqrt3}{2}`, R`\frac12`], [45, R`\frac{\sqrt2}{2}`, R`\frac{\sqrt2}{2}`], [60, R`\frac12`, R`\frac{\sqrt3}{2}`], [120, R`-\frac12`, R`\frac{\sqrt3}{2}`], [135, R`-\frac{\sqrt2}{2}`, R`\frac{\sqrt2}{2}`], [150, R`-\frac{\sqrt3}{2}`, R`\frac12`], [225, R`-\frac{\sqrt2}{2}`, R`-\frac{\sqrt2}{2}`], [300, R`\frac12`, R`-\frac{\sqrt3}{2}`]]);
      const P = [h1 + r1 * Math.cos(th * Math.PI / 180), k1 + r1 * Math.sin(th * Math.PI / 180)];
      const circ = (h, k, rr) => `${sqt(H, h, "x")} + ${sqt(H, k, "y")} = ${rr * rr}`;
      const axis = `${H.poly([[A / g, "x"], [B / g, "y"], [C0 / g, ""]])} = 0`;
      return {
        prompt: `Dadas $C_1: ${circ(h1, k1, r1)}$ y $C_2: ${circ(h2, k2, r2)}$: a) hallá una ecuación vectorial paramétrica de la recta que une los centros; b) hallá, justificando, un vector director del eje radical de la familia de circunferencias que pasan por la intersección de $C_1$ y $C_2$; c) a partir de una ecuación vectorial paramétrica de $C_1$, indicá las coordenadas del punto $R$ que corresponde a $\\theta = ${th}^\\circ$.`,
        rubric: [
          { text: `a) $(x, y) = (${h1}, ${k1}) + t(${h2 - h1}, ${k2 - k1})$, $t \\in \\mathbb{R}$.`, w: 2 },
          { text: `b) El eje radical ($${axis}$) es perpendicular a la recta de los centros: un director es $(${dir[0]}, ${dir[1]})$.`, w: 2 },
          { text: `c) $C_1: (x, y) = (${h1}, ${k1}) + ${r1}(\\cos\\theta, \\operatorname{sen}\\theta)$ y $R \\approx (${nf(H, P[0])}, ${nf(H, P[1])})$.`, w: 2 }
        ],
        solution: [
          `a) Los centros son $(${h1}, ${k1})$ y $(${h2}, ${k2})$: $(x, y) = (${h1}, ${k1}) + t(${h2 - h1}, ${k2 - k1})$, $t \\in \\mathbb{R}$.`,
          `b) Restando las ecuaciones desarrolladas, los términos $x^2 + y^2$ se cancelan y queda una recta: el eje radical, $${axis}$. Sus puntos tienen la misma potencia respecto de las dos circunferencias, y contiene a los dos puntos de intersección, que son simétricos respecto de la recta de los centros. Su normal es $(${A / g}, ${B / g})$, paralela a la recta de los centros, así que un director es $(${dir[0]}, ${dir[1]})$.`,
          `c) $C_1$ tiene centro $(${h1}, ${k1})$ y radio $${r1}$: $(x, y) = (${h1}, ${k1}) + ${r1}(\\cos\\theta, \\operatorname{sen}\\theta)$, $\\theta \\in [0, 2\\pi)$. Con $\\theta = ${th}^\\circ$: $R = \\left(${h1} + ${r1}\\cdot${cs},\\ ${k1} + ${r1}\\cdot${sn}\\right) \\approx (${nf(H, P[0])}, ${nf(H, P[1])})$.`
        ],
        verify: { kind: "zero", tol: 1e-9, scale: 100, fn: () => {
          // los dos puntos de corte, calculados con la geometría del triángulo de los centros
          const e = [(h2 - h1) / D, (k2 - k1) / D], a = (r1 * r1 - r2 * r2 + D * D) / (2 * D), hh = Math.sqrt(r1 * r1 - a * a);
          const Pp = [h1 + a * e[0] - hh * e[1], k1 + a * e[1] + hh * e[0]], Pm = [h1 + a * e[0] + hh * e[1], k1 + a * e[1] - hh * e[0]];
          const ax = p => A * p[0] + B * p[1] + C0;
          return [ax(Pp), ax(Pm), (Pp[0] - Pm[0]) * dir[1] - (Pp[1] - Pm[1]) * dir[0], (P[0] - h1) ** 2 + (P[1] - k1) ** 2 - r1 * r1];
        } }
      };
    }
  };

  // ---------- 2.º parcial ----------
  // elipse: tangentes en los extremos del lado recto y ángulo entre ellas
  SELF["ga-ex-elipse-lr"] = {
    concepts: ["ga-elipse", "ga-tangente-conica"],
    generate(r, H) {
      const [a, b, c] = r.pick([[5, 3, 4], [5, 4, 3], [10, 6, 8], [10, 8, 6], [13, 5, 12], [13, 12, 5], [15, 9, 12], [15, 12, 9]]);
      const h = r.int(-4, 4), k = r.int(-4, 4), l = b * b / a;
      const ang = Math.acos(Math.abs(c * c - a * a) / (a * a + c * c)) * 180 / Math.PI;
      const pr = (z, v) => (z === 0 ? v : `(${H.xm(z, v)})`);
      const x1 = H.frac(h * a + b * b, a), x2 = H.frac(h * a - b * b, a);
      return {
        prompt: `Sea la elipse de centro $C(${h}, ${k})$, eje focal paralelo al eje $y$ y semiejes $${a}$ y $${b}$. a) Hallá ecuaciones vectoriales paramétricas de las rectas tangentes a la elipse en los extremos del lado recto asociado al foco de mayor ordenada. b) A partir de esas ecuaciones, calculá el ángulo entre las dos rectas. c) Representá la elipse con sus elementos y las tangentes, y verificá gráficamente lo anterior.`,
        rubric: [
          { text: `a) $\\frac{${sqt(H, h, "x")}}{${b * b}} + \\frac{${sqt(H, k, "y")}}{${a * a}} = 1$, $c = ${c}$, foco $F(${h}, ${k + c})$ y extremos $\\left(${x1}, ${k + c}\\right)$ y $\\left(${x2}, ${k + c}\\right)$.`, w: 3 },
          { text: `a) Tangentes: $(x, y) = \\left(${x1}, ${k + c}\\right) + t(${c}, ${-a})$ y $(x, y) = \\left(${x2}, ${k + c}\\right) + t(${c}, ${a})$.`, w: 3 },
          { text: `b) $\\cos\\theta = \\frac{|${c * c} - ${a * a}|}{${c * c} + ${a * a}}$: $\\theta \\approx ${nf(H, ang, 2)}^\\circ$ (o su suplemento, $${nf(H, 180 - ang, 2)}^\\circ$).`, w: 2 },
          { text: `c) Gráfico con centro, vértices, focos, lado recto y las tangentes, que se cortan sobre el eje focal en $(${h}, ${H.frac(k * c + a * a, c)})$.`, w: 4 }
        ],
        solution: [
          `El eje focal es vertical, así que el semieje mayor $a = ${a}$ va en $y$: $\\frac{${sqt(H, h, "x")}}{${b * b}} + \\frac{${sqt(H, k, "y")}}{${a * a}} = 1$. Además $c = \\sqrt{a^2 - b^2} = ${c}$, y los focos son $(${h}, ${k + c})$ y $(${h}, ${k - c})$.`,
          `a) El lado recto del foco superior es la cuerda horizontal $y = ${k + c}$. Reemplazando: $${sqt(H, h, "x")} = ${b * b}\\left(1 - \\frac{${c * c}}{${a * a}}\\right) = \\frac{${b ** 4}}{${a * a}}$, así que $x = ${h} \\pm ${H.frac(b * b, a)}$: los extremos son $\\left(${x1}, ${k + c}\\right)$ y $\\left(${x2}, ${k + c}\\right)$.`,
          `La tangente en $(x_0, y_0)$ es $\\frac{${pr(h, "x")}${pr(h, "x_0")}}{${b * b}} + \\frac{${pr(k, "y")}${pr(k, "y_0")}}{${a * a}} = 1$; su normal es $\\left(\\frac{${H.xm(h, "x_0")}}{${b * b}}, \\frac{${H.xm(k, "y_0")}}{${a * a}}\\right) = \\left(\\pm\\frac{1}{${a}}, \\frac{${c}}{${a * a}}\\right) \\parallel (\\pm ${a}, ${c})$. Un director es perpendicular a esa normal:`,
          `$L_1: (x, y) = \\left(${x1}, ${k + c}\\right) + t(${c}, ${-a})$ y $L_2: (x, y) = \\left(${x2}, ${k + c}\\right) + t(${c}, ${a})$, $t \\in \\mathbb{R}$.`,
          `b) $\\cos\\theta = \\frac{|\\vec d_1\\cdot\\vec d_2|}{\\|\\vec d_1\\|\\|\\vec d_2\\|} = \\frac{|${c * c} - ${a * a}|}{${c * c + a * a}}$, así que $\\theta \\approx ${nf(H, ang, 2)}^\\circ$ (el ángulo entre los directores tal como están es $${nf(H, (c * c < a * a ? 180 - ang : ang), 2)}^\\circ$).`,
          `c) Por simetría, las dos tangentes se cortan sobre el eje focal, en $y = ${k} + \\frac{a^2}{c} = ${H.frac(k * c + a * a, c)}$: justo sobre la directriz del foco superior.`
        ],
        verify: { kind: "zero", tol: 1e-6, fn: () => {
          // con la paramétrica (h + b cos s, k + a sen s): la velocidad en cada extremo es paralela al director
          const res = [];
          for (const [sx, d] of [[1, [c, -a]], [-1, [c, a]]]) {
            const s0 = Math.atan2(c / a, sx * b / a), vel = [-b * Math.sin(s0), a * Math.cos(s0)];
            res.push(vel[0] * d[1] - vel[1] * d[0], h + b * Math.cos(s0) - (h + sx * l), k + a * Math.sin(s0) - (k + c));
          }
          // ángulo entre las rectas con atan2 y punto de corte
          let t = Math.abs(Math.atan2(-a, c) - Math.atan2(a, c)) * 180 / Math.PI;
          if (t > 90) t = 180 - t;
          // L1(t) = L2(u): de las ordenadas u = −t, y de las abscisas t = −l/c
          const t1 = -l / c;
          res.push(t - ang, (h + l + t1 * c) - h, (k + c - a * t1) - (k + a * a / c));
          return res;
        } }
      };
    }
  };

  // parábola en un plano coordenado, paraboloide de revolución y curva de intersección
  SELF["ga-ex-paraboloide"] = {
    concepts: ["ga-parabola", "ga-sup-revolucion"],
    generate(r, H) {
      const p = r.nz(-4, 4), m = r.int(1, 3), z0 = p * m * m, rho = 2 * Math.abs(p) * m, xR = r.int(-6, 6), yR = r.int(-6, 6);
      return {
        prompt: `a) En $\\mathbb{R}^3$, hallá la ecuación de la parábola del plano $xz$ con vértice en el origen, parámetro $p = ${p}$ y eje focal sobre el eje $z$ (usá la forma $x^2 = 4pz$). Representala. b) Hallá la ecuación del paraboloide de revolución que tiene a esa parábola como generatriz y al eje $z$ como eje de rotación. Representalo. c) Hallá una ecuación vectorial paramétrica de la curva de intersección del paraboloide con el plano paralelo al plano $xy$ que pasa por $R(${xR}, ${yR}, ${z0})$.`,
        rubric: [
          { text: `a) $x^2 = ${4 * p}z$, $y = 0$; foco $(0, 0, ${p})$ y directriz $z = ${-p}$ en el plano $xz$; abre hacia ${p > 0 ? "arriba" : "abajo"}.`, w: 3 },
          { text: `b) Se reemplaza $x$ por $\\sqrt{x^2 + y^2}$: $x^2 + y^2 = ${4 * p}z$.`, w: 3 },
          { text: `c) En $z = ${z0}$: $x^2 + y^2 = ${rho * rho}$, circunferencia de radio $${rho}$: $(x, y, z) = (${rho}\\cos\\theta, ${rho}\\operatorname{sen}\\theta, ${z0})$, $\\theta \\in [0, 2\\pi)$.`, w: 3 }
        ],
        solution: [
          `a) Con vértice en el origen y eje $z$, en el plano $xz$: $x^2 = 4pz = ${4 * p}z$, junto con $y = 0$. El foco está a distancia $|p| = ${Math.abs(p)}$ del vértice sobre el eje: $F(0, 0, ${p})$; la directriz es $z = ${-p}$. Como $p ${p > 0 ? "> 0" : "< 0"}$, abre hacia ${p > 0 ? "arriba" : "abajo"}.`,
          R`b) Al girar alrededor del eje $z$, cada punto de la parábola describe una circunferencia horizontal de radio $|x|$. La distancia al eje de un punto $(x, y, z)$ es $\sqrt{x^2 + y^2}$, así que se reemplaza $x^2$ por $x^2 + y^2$: ` + `$x^2 + y^2 = ${4 * p}z$.`,
          `c) El plano paralelo a $xy$ por $R$ es $z = ${z0}$. Reemplazando: $x^2 + y^2 = ${4 * p}\\cdot${H.par(z0)} = ${rho * rho}$: una circunferencia de centro $(0, 0, ${z0})$ y radio $${rho}$ (las secciones perpendiculares al eje de rotación son circunferencias). $(x, y, z) = (${rho}\\cos\\theta,\\ ${rho}\\operatorname{sen}\\theta,\\ ${z0})$, $\\theta \\in [0, 2\\pi)$.`
        ],
        verify: { kind: "zero", tol: 1e-9, scale: 100, fn: () => {
          const res = [];
          // la parábola equidista del foco y de la directriz
          for (const x of [-3, -1, 0.5, 2, 4]) { const z = x * x / (4 * p); res.push(Math.hypot(x, z - p) - Math.abs(z + p)); }
          // los puntos de la curva están en el paraboloide
          for (const t of [0, 1, 2.5, 4]) { const x = rho * Math.cos(t), y = rho * Math.sin(t); res.push(x * x + y * y - 4 * p * z0); }
          return res;
        } }
      };
    }
  };

  // superficie cilíndrica con directriz hiperbólica (hipérbola equilátera)
  SELF["ga-ex-cilindrica"] = {
    concepts: ["ga-sup-cilindrica", "ga-hiperbola"],
    generate(r, H) {
      const h = r.int(-8, 8), a = r.int(2, 6), v = [r.int(-3, 3), r.int(-3, 3), r.nz(1, 5)];
      if (!v[0] && !v[1]) return null;
      const sh = (vn, coord, cst) => `${coord}${v[vn] ? (v[vn] * v[2] > 0 ? " - " : " + ") + (Math.abs(v[vn]) === Math.abs(v[2]) ? "" : H.frac(Math.abs(v[vn]), Math.abs(v[2]))) + "z" : ""}${cst ? H.sg(-cst) : ""}`;
      const X = sh(0, "x", h), Y = sh(1, "y", 0);
      const lamT = v[2] === 1 ? "-z" : v[2] === -1 ? "z" : v[2] > 0 ? `-\\frac{z}{${v[2]}}` : `\\frac{z}{${-v[2]}}`;
      const surf = (x, y, z) => (y - v[1] / v[2] * z) ** 2 - (x - v[0] / v[2] * z - h) ** 2 - a * a;
      return {
        prompt: `a) Hallá la ecuación cartesiana de la hipérbola equilátera del plano $xy$ con centro $C(${h}, 0, 0)$, eje focal paralelo al eje $y$ y semieje real $${a}$. b) Hallá la ecuación de la superficie cilíndrica que tiene a esa hipérbola como directriz y generatrices paralelas a $\\vec v = (${v.join(", ")})$ (sin desarrollar los cuadrados). c) Hallá una ecuación vectorial paramétrica de la generatriz que pasa por el vértice real de ordenada positiva. d) Hacé un gráfico cualitativo de la superficie con la directriz (centro y vértices) y la generatriz de c).`,
        rubric: [
          { text: `a) Equilátera: $a = b = ${a}$. $\\frac{y^2}{${a * a}} - \\frac{${sqt(H, h, "x")}}{${a * a}} = 1$, $z = 0$.`, w: 2 },
          { text: `b) Un punto $P(x, y, z)$ está en la superficie si la generatriz por $P$ corta a la directriz en $P' = P + \\lambda\\vec v$ con $\\lambda = ${lamT}$ (para que $z' = 0$).`, w: 3 },
          { text: `b) $\\left(${Y}\\right)^2 - \\left(${X}\\right)^2 = ${a * a}$.`, w: 2 },
          { text: `c) Vértice $(${h}, ${a}, 0)$: $(x, y, z) = (${h}, ${a}, 0) + t(${v.join(", ")})$, $t \\in \\mathbb{R}$.`, w: 1 },
          { text: R`d) Gráfico con la hipérbola en $z = 0$ (centro, vértices, asíntotas) y las generatrices paralelas a $\vec v$.`, w: 2 }
        ],
        solution: [
          `a) Equilátera significa semiejes iguales: $a = b = ${a}$. Con eje focal paralelo a $y$ y centro $(${h}, 0)$: $\\frac{y^2}{${a * a}} - \\frac{${sqt(H, h, "x")}}{${a * a}} = 1$, o sea $y^2 - ${sqt(H, h, "x")} = ${a * a}$, con $z = 0$. Vértices $(${h}, \\pm ${a}, 0)$ y asíntotas $y = \\pm(${H.xm(h, "x")})$.`,
          `b) Sea $P(x, y, z)$ un punto de la superficie. La generatriz por $P$ es $P + \\lambda\\vec v$, y corta al plano $z = 0$ cuando $z ${v[2] > 0 ? "+" : "-"} ${H.cf(Math.abs(v[2]))}\\lambda = 0$, o sea $\\lambda = ${lamT}$. Ese punto, $P' = \\left(${X === "x" ? "x" : sh(0, "x", 0)},\\ ${Y},\\ 0\\right)$, tiene que estar en la directriz:`,
          `$\\left(${Y}\\right)^2 - \\left(${X}\\right)^2 = ${a * a}$.`,
          `c) El vértice real de ordenada positiva es $V(${h}, ${a}, 0)$: $G_1: (x, y, z) = (${h}, ${a}, 0) + t(${v.join(", ")})$, $t \\in \\mathbb{R}$.`,
          R`d) Se dibuja la hipérbola en el plano $xy$ y, por varios de sus puntos, rectas paralelas a $\vec v$: la superficie son dos «hojas» cilíndricas inclinadas, una por cada rama.`
        ],
        verify: { kind: "zero", tol: 1e-7, scale: 100, fn: () => {
          const res = [];
          // puntos de la directriz (por la paramétrica hiperbólica) desplazados a lo largo de las generatrices
          for (const [s, br, t] of [[0, 1, 0.7], [0.8, 1, -1.3], [-0.5, -1, 2], [1.2, -1, 0.4]]) {
            const q = [h + a * Math.sinh(s), br * a * Math.cosh(s), 0];
            res.push(surf(q[0] + t * v[0], q[1] + t * v[1], q[2] + t * v[2]));
          }
          for (const t of [-2, 0.5, 3]) res.push(surf(h + t * v[0], a + t * v[1], t * v[2]));
          return res;
        } }
      };
    }
  };

  // esfera: ecuación, traza en un plano coordenado y plano tangente
  SELF["ga-ex-esfera"] = {
    concepts: ["ga-esfera"],
    generate(r, H) {
      const [w0, rad] = r.pick([[[1, 2, 2], 3], [[2, 3, 6], 7], [[1, 4, 8], 9], [[4, 4, 7], 9], [[2, 6, 9], 11], [[0, 3, 4], 5], [[0, 6, 8], 10], [[0, 0, 10], 10], [[3, 4, 12], 13]]);
      const w = r.shuffle(w0.slice()).map(x => x * r.pick([-1, 1])), C = [r.int(-6, 6), r.int(-4, 4), r.int(-6, 6)];
      if (Math.abs(C[1]) >= rad) return null;
      const A = C.map((x, i) => x + w[i]), rr = rad * rad - C[1] * C[1], rT = ksq(1, rr), g = gcd(gcd(w[0], w[1]), w[2]), n = w.map(x => x / g);
      const D = -dot(n, A);
      return {
        prompt: `Completá para que resulten verdaderas, dejando indicado el desarrollo: a) La ecuación cartesiana de la esfera de centro $C(${C.join(", ")})$ y radio $${rad}$ es … b) Una ecuación vectorial paramétrica de la traza de esa esfera en el plano $xz$ es … c) Una ecuación del plano tangente a la esfera en $A(${A.join(", ")})$ es …`,
        rubric: [
          { text: `a) $${sqt(H, C[0], "x")} + ${sqt(H, C[1], "y")} + ${sqt(H, C[2], "z")} = ${rad * rad}$.`, w: 2 },
          { text: `b) Con $y = 0$: $${sqt(H, C[0], "x")} + ${sqt(H, C[2], "z")} = ${rr}$; $(x, y, z) = (${C[0]} + ${rT}\\cos\\theta,\\ 0,\\ ${C[2]} + ${rT}\\operatorname{sen}\\theta)$, $\\theta \\in [0, 2\\pi)$.`, w: 4 },
          { text: `c) Normal $\\overrightarrow{CA} = (${w.join(", ")})$: $${H.poly([[n[0], "x"], [n[1], "y"], [n[2], "z"], [D, ""]])} = 0$.`, w: 3 }
        ],
        solution: [
          `a) Todos los puntos a distancia $${rad}$ de $C$: $${sqt(H, C[0], "x")} + ${sqt(H, C[1], "y")} + ${sqt(H, C[2], "z")} = ${rad * rad}$.`,
          `b) La traza en el plano $xz$ es la intersección con $y = 0$: $${sqt(H, C[0], "x")} + ${C[1] * C[1]} + ${sqt(H, C[2], "z")} = ${rad * rad}$, o sea $${sqt(H, C[0], "x")} + ${sqt(H, C[2], "z")} = ${rr}$: una circunferencia de centro $(${C[0]}, 0, ${C[2]})$ y radio $${rT}$. Paramétrica: $(x, y, z) = (${C[0]} + ${rT}\\cos\\theta,\\ 0,\\ ${C[2]} + ${rT}\\operatorname{sen}\\theta)$, $\\theta \\in [0, 2\\pi)$.`,
          `c) $A$ está en la esfera porque $\\|\\overrightarrow{CA}\\| = \\|(${w.join(", ")})\\| = ${rad}$. El plano tangente pasa por $A$ y es perpendicular al radio $\\overrightarrow{CA}$, así que $\\overrightarrow{CA}\\cdot(X - A) = 0$: $${H.poly([[n[0], "x"], [n[1], "y"], [n[2], "z"], [D, ""]])} = 0$.`
        ],
        verify: { kind: "zero", tol: 1e-9, scale: 100, fn: () => {
          const S = (x, y, z) => (x - C[0]) ** 2 + (y - C[1]) ** 2 + (z - C[2]) ** 2 - rad * rad, e = 1e-5;
          const grad = [0, 1, 2].map(i => { const p = A.slice(), m = A.slice(); p[i] += e; m[i] -= e; return (S(...p) - S(...m)) / (2 * e); });
          const cr = cross(grad, n), res = [S(...A), dot(n, A) + D, ...cr.map(x => x / 100)];
          for (const t of [0, 1, 2, 4]) res.push(S(C[0] + Math.sqrt(rr) * Math.cos(t), 0, C[2] + Math.sqrt(rr) * Math.sin(t)));
          return res;
        } }
      };
    }
  };

  // ---------- examen de promoción / final ----------
  // cónica en coordenadas polares: deducción, ecuación por un punto y elementos
  SELF["ga-ex-conica-polar"] = {
    concepts: ["ga-conica-polar", "ga-conica-def"],
    generate(r, H) {
      const pos = r.pick(["der", "izq", "arr", "aba"]), e = r.pick([0.5, 0.6, 0.8, 1, 1.25, 1.5, 2]);
      const trig = pos === "der" || pos === "izq" ? "cos" : "sin", s = pos === "der" || pos === "arr" ? 1 : -1;
      const fn = trig === "cos" ? Math.cos : Math.sin;
      const th0 = r.pick(trig === "cos" ? [0, Math.PI / 2, Math.PI] : [0, Math.PI / 2, 3 * Math.PI / 2]);
      const r0 = r.pick([2, 2.4, 3, 3.6, 4, 4.6, 5, 6]), den0 = 1 + s * e * Math.round(fn(th0));
      if (den0 <= 1e-9) return null;
      const ed = r0 * den0, d = ed / e;
      if (Math.abs(ed * 1000 - Math.round(ed * 1000)) > 1e-6) return null;
      const thTex = { 0: "0", [Math.PI / 2]: R`\frac{\pi}{2}`, [Math.PI]: R`\pi`, [3 * Math.PI / 2]: R`\frac{3\pi}{2}` };
      const tname = trig === "cos" ? R`\cos\theta` : R`\operatorname{sen}\theta`, sgn = s > 0 ? "+" : "-";
      const where = { der: `perpendicular al eje polar, a la derecha del polo`, izq: `perpendicular al eje polar, a la izquierda del polo`, arr: `paralela al eje polar, por encima del polo`, aba: `paralela al eje polar, por debajo del polo` }[pos];
      const whereGen = { der: "perpendicular al eje polar, a $p$ unidades a la derecha del polo", izq: "perpendicular al eje polar, a $p$ unidades a la izquierda del polo", arr: "paralela al eje polar, a $p$ unidades por encima del polo", aba: "paralela al eje polar, a $p$ unidades por debajo del polo" }[pos];
      const distD = { der: R`p - r\cos\theta`, izq: R`p + r\cos\theta`, arr: R`p - r\operatorname{sen}\theta`, aba: R`p + r\operatorname{sen}\theta` }[pos];
      const tipo = e < 1 ? "una elipse" : e === 1 ? "una parábola" : "una hipérbola";
      const eT = nf(H, e), edT = nf(H, ed);
      // vértices sobre el eje focal
      const angs = trig === "cos" ? [0, Math.PI] : [Math.PI / 2, 3 * Math.PI / 2];
      const verts = angs.map(t => { const dd = 1 + s * e * Math.round(fn(t)); return dd > 1e-9 ? ed / dd : dd < -1e-9 ? ed / dd : null; });
      const vTex = verts.map((rv, i) => (rv === null ? null : rv > 0 ? `(${nf(H, rv)},\\ ${thTex[angs[i]]})` : `(${nf(H, -rv)},\\ ${thTex[angs[1 - i]]})`)).filter(Boolean);
      const r90 = ed;  // el lado recto: r en la dirección perpendicular al eje focal
      return {
        prompt: `a) Deducí la ecuación en coordenadas polares de una sección cónica con un foco en el polo y la directriz ${whereGen}, con el gráfico asociado. b) Hallá la ecuación en polares de la cónica de excentricidad $e = ${eT}$ que pasa por el punto $(${nf(H, r0)},\\ ${thTex[th0]})$, con la directriz ${where}. c) Representala, indicando las coordenadas polares de sus elementos.`,
        rubric: [
          { text: `a) Definición $|PF| = e\\,d(P, \\text{directriz})$, con $|PF| = r$ y $d = ${distD}$ (justificado en el gráfico).`, w: 3 },
          { text: `a) Despejando: $r = e(${distD})$, $r(1 ${sgn} e${tname}) = ep$, así que $r = \\frac{ep}{1 ${sgn} e${tname}}$.`, w: 3 },
          { text: `b) Con el punto: $ep = ${nf(H, r0)}\\,(1 ${sgn} ${eT}\\cdot${H.par(Math.round(fn(th0)))}) = ${edT}$, y $r = \\frac{${edT}}{1 ${sgn} ${eT}${tname}}$ (directriz a $p = ${nf(H, d)}$ del polo): es ${tipo}.`, w: 5 },
          { text: `c) Foco en el polo, vértices ${vTex.map(x => `$${x}$`).join(" y ")}, extremos del lado recto a $r = ${edT}$ (perpendiculares al eje focal); gráfico.`, w: 5 }
        ],
        solution: [
          `a) Sea $P = (r, \\theta)$ un punto de la cónica, con el foco $F$ en el polo, así que $|PF| = r$. La directriz es ${whereGen}; la distancia de $P$ a ella es $${distD}$ (para los puntos del lado del foco).`,
          `Por la definición de cónica, $|PF| = e\\cdot d(P, \\text{directriz})$: $r = e(${distD})$. Pasando el término con $r$ a la izquierda: $r(1 ${sgn} e${tname}) = ep$, de donde $r = \\dfrac{ep}{1 ${sgn} e${tname}}$.`,
          `b) Reemplazando $e = ${eT}$ y el punto $(${nf(H, r0)}, ${thTex[th0]})$, donde $${tname} = ${Math.round(fn(th0))}$: $${nf(H, r0)} = \\frac{ep}{1 ${sgn} ${eT}\\cdot ${H.par(Math.round(fn(th0)))}}$, así que $ep = ${edT}$ y $p = \\frac{${edT}}{${eT}} = ${nf(H, d)}$.`,
          `$$r = \\frac{${edT}}{1 ${sgn} ${eT}\\,${tname}}$$ Como $e ${e < 1 ? "< 1" : e === 1 ? "= 1" : "> 1"}$, es ${tipo}.`,
          `c) El eje focal es ${trig === "cos" ? "el eje polar" : "la recta $\\theta = \\frac{\\pi}{2}$"}. Vértices: ${vTex.map(x => `$${x}$`).join(" y ")}.${e === 1 ? " (En la otra dirección el denominador se anula: la parábola se abre hacia ese lado.)" : ""} Con $${tname} = 0$, $r = ${edT}$: son los extremos del lado recto, que mide $${nf(H, 2 * r90)}$.${e < 1 ? ` Semieje mayor $a = \\frac{r_{\\min} + r_{\\max}}{2} = ${nf(H, (verts[0] + verts[1]) / 2)}$ y $c = ae = ${nf(H, (verts[0] + verts[1]) / 2 * e)}$.` : ""}`
        ],
        verify: { kind: "zero", tol: 1e-9, scale: 10, fn: () => {
          // punto por punto: distancia al foco / distancia a la directriz = e
          const dirDist = { der: (x, y) => d - x, izq: (x, y) => d + x, arr: (x, y) => d - y, aba: (x, y) => d + y }[pos];
          const res = [];
          for (const t of [0.3, 1.1, 2, 2.7, 4, 5.5]) {
            const den = 1 + s * e * fn(t);
            if (den < 0.05) continue;
            const rv = ed / den, x = rv * Math.cos(t), y = rv * Math.sin(t);
            res.push(Math.hypot(x, y) / dirDist(x, y) - e);
          }
          res.push(r0 * (1 + s * e * fn(th0)) - ed);
          return res;
        } }
      };
    }
  };

  // cónica rotada: ecuación en x e y a partir de sus vértices, y un foco
  SELF["ga-ex-conica-rotada"] = {
    concepts: ["ga-rotacion-ejes", "ga-ejes-principales"],
    generate(r, H) {
      const [p, q] = r.pick([[3, 4], [4, 3], [-3, 4], [-4, 3]]), ell = r.bool();
      const A5 = r.int(1, 4), B5 = r.int(1, 4);
      if (A5 === B5 || (ell && A5 < B5)) return null;
      const a = 5 * A5, b = 5 * B5, sg = ell ? 1 : -1;
      // (p x + q y)²/a² ± (−q x + p y)²/b² = 25, multiplicado por a²b²
      let cA = p * p * b * b + sg * q * q * a * a, cB = 2 * p * q * (b * b - sg * a * a), cC = q * q * b * b + sg * p * p * a * a, cF = 25 * a * a * b * b;
      const g = gcd(gcd(gcd(cA, cB), cC), cF); cA /= g; cB /= g; cC /= g; cF /= g;
      const c2 = A5 * A5 - sg * B5 * B5, F = [p, q];  // foco = √(A² ∓ B²)·(p, q)
      const V = [A5 * p, A5 * q], W = [-B5 * q, B5 * p];
      const eq = `${H.poly([[cA, "x^{2}"], [cB, "xy"], [cC, "y^{2}"]])} = ${cF}`;
      const lr = 2 * b * b / a;
      return {
        prompt: `Una ${ell ? "elipse" : "hipérbola"} tiene centro en el origen y su eje focal pasa por el vértice $V_1 = (${V.join(", ")})$. El ${ell ? "eje menor" : "eje conjugado"} tiene un extremo en $V_2 = (${W.join(", ")})$. a) Hallá la ecuación de la cónica en las variables $x$ e $y$. b) Hallá las coordenadas, en el sistema $xy$, del foco que está del lado de $V_1$, y la longitud del lado recto. c) Hacé el gráfico con los dos sistemas de ejes.`,
        rubric: [
          { text: `a) Semiejes $a = \\|V_1\\| = ${a}$ y $b = \\|V_2\\| = ${b}$; ejes $x'$ en la dirección $\\left(${H.frac(p, 5)}, ${H.frac(q, 5)}\\right)$ e $y'$ en la de $\\left(${H.frac(-q, 5)}, ${H.frac(p, 5)}\\right)$.`, w: 3 },
          { text: `a) En el sistema rotado: $\\frac{x'^2}{${a * a}} ${ell ? "+" : "-"} \\frac{y'^2}{${b * b}} = 1$, con $x' = \\frac{${H.poly([[p, "x"], [q, "y"]])}}{5}$ e $y' = \\frac{${H.poly([[-q, "x"], [p, "y"]])}}{5}$.`, w: 4 },
          { text: `a) $${eq}$.`, w: 4 },
          { text: `b) $c = \\sqrt{a^2 ${ell ? "-" : "+"} b^2} = ${ksq(5, c2)}$ y $F = c\\left(${H.frac(p, 5)}, ${H.frac(q, 5)}\\right) = (${ksq(p, c2)}, ${ksq(q, c2)})$; lado recto $\\frac{2b^2}{a} = ${H.frac(2 * b * b, a)}$.`, w: 4 },
          { text: R`c) Gráfico con los ejes $xy$ y $x'y'$, vértices, focos ` + (ell ? "y extremos del eje menor." : "y asíntotas."), w: 2 }
        ],
        solution: [
          `a) El centro es el origen, así que $a = \\|V_1\\| = \\sqrt{${V[0] ** 2} + ${V[1] ** 2}} = ${a}$ y $b = \\|V_2\\| = ${b}$. El eje $x'$ va en la dirección de $V_1$: $\\vec u_1 = \\left(${H.frac(p, 5)}, ${H.frac(q, 5)}\\right)$; el eje $y'$ es perpendicular: $\\vec u_2 = \\left(${H.frac(-q, 5)}, ${H.frac(p, 5)}\\right)$ (y $V_2$ está sobre él).`,
          `Las coordenadas nuevas son las proyecciones sobre esos versores: $x' = \\vec X\\cdot\\vec u_1 = \\frac{${H.poly([[p, "x"], [q, "y"]])}}{5}$ e $y' = \\vec X\\cdot\\vec u_2 = \\frac{${H.poly([[-q, "x"], [p, "y"]])}}{5}$ (es $X' = P^TX$ con $P = [\\vec u_1\\ \\vec u_2]$).`,
          `En el sistema $x'y'$ la cónica está en posición normal: $\\frac{x'^2}{${a * a}} ${ell ? "+" : "-"} \\frac{y'^2}{${b * b}} = 1$. Reemplazando y multiplicando por $25\\cdot${a * a}\\cdot${b * b}$ (y simplificando): $$${eq}$$`,
          `b) $c^2 = a^2 ${ell ? "-" : "+"} b^2 = ${a * a} ${ell ? "-" : "+"} ${b * b} = ${25 * c2}$, $c = ${ksq(5, c2)}$. El foco del lado de $V_1$ está en $x' = c$, $y' = 0$; volviendo a $xy$: $F = c\\,\\vec u_1 = (${ksq(p, c2)}, ${ksq(q, c2)}) \\approx (${nf(H, p * Math.sqrt(c2), 2)}, ${nf(H, q * Math.sqrt(c2), 2)})$.`,
          `El lado recto mide $\\frac{2b^2}{a} = ${H.frac(2 * b * b, a)}${Number.isInteger(lr) ? "" : ` \\approx ${nf(H, lr, 2)}`}$.`,
          R`c) Se dibujan los ejes $x'$ e $y'$ girados (por $V_1$ y por $V_2$) y la cónica en posición normal respecto de ellos.`
        ],
        verify: { kind: "zero", tol: 1e-7, fn: () => {
          // puntos de la curva sacados de la ecuación en x e y, y la propiedad focal
          const f = Math.sqrt(c2), F1 = [f * p, f * q], F2 = [-f * p, -f * q], res = [];
          const onCurve = (x, y) => (cA * x * x + cB * x * y + cC * y * y - cF) / cF;
          res.push(onCurve(...V));
          if (ell) res.push(onCurve(...W));
          // se despeja y (o x, si el coeficiente de y² se anula) de la ecuación cuadrática
          const swap = Math.abs(cC) < 1e-12, qa = swap ? cA : cC, qq = swap ? cC : cA;
          let used = 0;
          for (let t = -2 * a; t <= 2 * a && used < 6; t += a / 3.7) {
            const disc = (cB * t) ** 2 - 4 * qa * (qq * t * t - cF);
            if (disc < 0) continue;
            for (const sgn of [1, -1]) {
              const u = (-cB * t + sgn * Math.sqrt(disc)) / (2 * qa), [x, y] = swap ? [u, t] : [t, u];
              const d1 = Math.hypot(x - F1[0], y - F1[1]), d2 = Math.hypot(x - F2[0], y - F2[1]);
              res.push(((ell ? d1 + d2 : Math.abs(d1 - d2)) - 2 * a) / a);
              used++;
            }
          }
          if (used < 2) res.push(1);
          return res;
        } }
      };
    }
  };

  // hiperboloide de revolución: curva de intersección y ecuación en cilíndricas o esféricas
  SELF["ga-ex-hiperboloide"] = {
    concepts: ["ga-cuadricas-tipos", "ga-cilindricas-esfericas", "ga-sup-revolucion"],
    generate(r, H) {
      const axis = r.int(0, 2), one = r.bool(), a = r.int(2, 6), c = r.int(2, 8), sys = r.pick(["cil", "esf"]);
      if (a === c) return null;
      const names = ["x", "y", "z"], ax = names[axis], others = names.filter((_, i) => i !== axis);
      const Q = [r.int(-5, 5), r.int(-5, 5), r.int(-5, 5)], s0 = r.int(1, 12) * r.pick([-1, 1]);
      Q[axis] = s0;
      const R2 = one ? a * a * (1 + s0 * s0 / (c * c)) : a * a * (s0 * s0 / (c * c) - 1);
      if (R2 <= 0) return null;
      const Rr = Math.sqrt(R2), Rn = a * a * Math.abs(c * c + (one ? 1 : -1) * s0 * s0), Rd = c * c;  // R² = Rn / Rd
      const eqCart = one ? `\\frac{${others[0]}^2 + ${others[1]}^2}{${a * a}} - \\frac{${ax}^2}{${c * c}} = 1` : `\\frac{${ax}^2}{${c * c}} - \\frac{${others[0]}^2 + ${others[1]}^2}{${a * a}} = 1`;
      // cada coordenada al cuadrado en el sistema pedido
      const sqr = sys === "cil" ? { x: R`\rho^2\cos^2\theta`, y: R`\rho^2\operatorname{sen}^2\theta`, z: "z^2" } : { x: R`\rho^2\operatorname{sen}^2\varphi\cos^2\theta`, y: R`\rho^2\operatorname{sen}^2\varphi\operatorname{sen}^2\theta`, z: R`\rho^2\cos^2\varphi` };
      const pair = axis === 2 ? (sys === "cil" ? R`\rho^2` : R`\rho^2\operatorname{sen}^2\varphi`) : `${sqr[others[0]]} + ${sqr[others[1]]}`;
      const eqNew = one ? `\\frac{${pair}}{${a * a}} - \\frac{${sqr[ax]}}{${c * c}} = 1` : `\\frac{${sqr[ax]}}{${c * c}} - \\frac{${pair}}{${a * a}} = 1`;
      const trans = sys === "cil" ? R`x = \rho\cos\theta,\ y = \rho\operatorname{sen}\theta,\ z = z` : R`x = \rho\operatorname{sen}\varphi\cos\theta,\ y = \rho\operatorname{sen}\varphi\operatorname{sen}\theta,\ z = \rho\cos\varphi`;
      const ranges = sys === "cil" ? R`\rho \ge 0,\ \theta \in [0, 2\pi)` : R`\rho \ge 0,\ \theta \in [0, 2\pi),\ \varphi \in [0, \pi]`;
      // R = a√N / c, con la raíz y la fracción simplificadas
      let kR = a, mR = Rn / (a * a);
      for (let f = 2; f * f <= mR; f++) while (mR % (f * f) === 0) { mR /= f * f; kR *= f; }
      const gR = gcd(kR, c), num = `${kR / gR === 1 && mR !== 1 ? "" : kR / gR}${mR === 1 ? "" : `\\sqrt{${mR}}`}`;
      const Rtex = c / gR === 1 ? num : `\\frac{${num}}{${c / gR}}`, oi = [0, 1, 2].filter(j => j !== axis);
      const comp = ["", "", ""];
      comp[axis] = String(s0); comp[oi[0]] = `${Rtex}\\cos t`; comp[oi[1]] = `${Rtex}\\operatorname{sen} t`;
      const curveP = i => comp[i];
      const cyl = sys === "cil" ? "cilíndricas" : "esféricas";
      return {
        prompt: `a) Indicá la ecuación de un hiperboloide de ${one ? "una hoja" : "dos hojas"} de revolución con eje de revolución el eje $${ax}$, centro en el origen, semieje $${a}$ en las direcciones perpendiculares al eje y semieje $${c}$ en la dirección del eje. b) Indicá una ecuación vectorial paramétrica de la curva de intersección del hiperboloide con el plano perpendicular al eje $${ax}$ que pasa por $Q(${Q.join(", ")})$. c) Indicá las ecuaciones de transformación de coordenadas rectangulares a coordenadas ${cyl}, justificando con un gráfico. d) Indicá la ecuación de la superficie de a) en coordenadas ${cyl}.`,
        rubric: [
          { text: `a) $${eqCart}$ (las secciones perpendiculares al eje $${ax}$ son circunferencias).`, w: 3 },
          { text: `b) En $${ax} = ${s0}$: $${others[0]}^2 + ${others[1]}^2 = ${H.frac(Rn, Rd)}$, circunferencia de radio $${Rtex} \\approx ${nf(H, Rr)}$: $(x, y, z) = (${[0, 1, 2].map(curveP).join(",\\ ")})$, $t \\in [0, 2\\pi)$.`, w: 4 },
          { text: `c) $${trans}$, con $${ranges}$ (gráfico con $\\rho$, $\\theta${sys === "esf" ? R`$ y $\varphi` : ""}$).`, w: 3 },
          { text: `d) $${eqNew}$.`, w: 3 }
        ],
        solution: [
          `a) Un hiperboloide de revolución alrededor del eje $${ax}$ depende de $${others[0]}$ y $${others[1]}$ solo a través de la distancia al eje, $\\sqrt{${others[0]}^2 + ${others[1]}^2}$. ${one ? "El de una hoja tiene un solo signo menos, en la variable del eje" : "El de dos hojas tiene dos signos menos: la variable del eje va con signo más"}: $$${eqCart}$$`,
          `b) El plano perpendicular al eje $${ax}$ por $Q$ es $${ax} = ${s0}$. Reemplazando: $${others[0]}^2 + ${others[1]}^2 = ${a * a}\\left(${one ? `1 + \\frac{${s0 * s0}}{${c * c}}` : `\\frac{${s0 * s0}}{${c * c}} - 1`}\\right) = ${H.frac(Rn, Rd)}$, una circunferencia de radio $${Rtex}$ centrada en el eje. Paramétrica: $(x, y, z) = (${[0, 1, 2].map(curveP).join(",\\ ")})$, $t \\in [0, 2\\pi)$.`,
          sys === "cil"
            ? R`c) Un punto $P$ se proyecta sobre el plano $xy$ en $P'$; $\rho = \|OP'\|$ y $\theta$ es el ángulo de $OP'$ con el eje $x$, y la altura $z$ no cambia. En el triángulo rectángulo $OP'$ con el eje $x$: $x = \rho\cos\theta$, $y = \rho\operatorname{sen}\theta$, $z = z$.`
            : R`c) $\rho = \|OP\|$, $\varphi$ es el ángulo de $OP$ con el eje $z$ y $\theta$ el de su proyección $OP'$ con el eje $x$. En el triángulo $OPP'$: $z = \rho\cos\varphi$ y $\|OP'\| = \rho\operatorname{sen}\varphi$; proyectando $OP'$ sobre los ejes, $x = \rho\operatorname{sen}\varphi\cos\theta$ e $y = \rho\operatorname{sen}\varphi\operatorname{sen}\theta$.`,
          `d) Reemplazando cada coordenada${axis === 2 ? ` (y usando $\\cos^2\\theta + \\operatorname{sen}^2\\theta = 1$)` : ""}: $$${eqNew}$$`
        ],
        verify: { kind: "zero", tol: 1e-9, scale: 10, fn: () => {
          const cart = v => { const s = v[axis], o = v.filter((_, i) => i !== axis); const rr = o[0] * o[0] + o[1] * o[1]; return one ? rr / (a * a) - s * s / (c * c) - 1 : s * s / (c * c) - rr / (a * a) - 1; };
          const res = [];
          for (const t of [0, 0.9, 2.2, 4.1]) { const v = [0, 0, 0], o = [0, 1, 2].filter(j => j !== axis); v[axis] = s0; v[o[0]] = Rr * Math.cos(t); v[o[1]] = Rr * Math.sin(t); res.push(cart(v)); }
          res.push(Rn / Rd - R2);
          // la transformación lleva puntos de la superficie a la ecuación nueva (con los cuadrados del sistema pedido)
          for (const [rho, th, ph] of [[3, 0.7, 1.1], [5, 2.5, 0.4]]) {
            const v = sys === "cil" ? [rho * Math.cos(th), rho * Math.sin(th), ph * 4] : [rho * Math.sin(ph) * Math.cos(th), rho * Math.sin(ph) * Math.sin(th), rho * Math.cos(ph)];
            const sqv = sys === "cil" ? { x: rho * rho * Math.cos(th) ** 2, y: rho * rho * Math.sin(th) ** 2, z: (ph * 4) ** 2 } : { x: (rho * Math.sin(ph) * Math.cos(th)) ** 2, y: (rho * Math.sin(ph) * Math.sin(th)) ** 2, z: (rho * Math.cos(ph)) ** 2 };
            const pr = sqv[others[0]] + sqv[others[1]], newEq = one ? pr / (a * a) - sqv[ax] / (c * c) - 1 : sqv[ax] / (c * c) - pr / (a * a) - 1;
            res.push(newEq - cart(v));
          }
          return res;
        } }
      };
    }
  };

  // ¿qué matriz sirve para pasar a la posición normal? (columnas ortonormales y det = 1)
  T["ga-ex-matriz-p"] = {
    type: "mc", concepts: ["ga-ejes-principales"], difficulty: 2,
    generate(r, H) {
      const [cn, sn] = r.pick([[3, 4], [4, 3]]), axis = r.int(0, 2), sgn = r.pick([-1, 1]);
      // rotación alrededor de un eje coordenado, en quintos
      const rot = () => { const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], o = [0, 1, 2].filter(j => j !== axis); M[axis][axis] = 5; M[o[0]][o[0]] = cn; M[o[1]][o[1]] = cn; M[o[0]][o[1]] = -sgn * sn; M[o[1]][o[0]] = sgn * sn; return M; };
      const good = rot();
      const swap = good.map(row => [row[1], row[0], row[2]]);  // det = −1
      const unnorm = good.map(row => row.map(x => (x === 5 ? 10 : x)));  // una columna de norma 2
      const skew = good.map(row => row.slice()); { const o = [0, 1, 2].filter(j => j !== axis); skew[o[0]][o[1]] = sgn * sn; }  // columnas no ortogonales
      const tex = M => `$${pm(M.map(row => row.map(x => H.frac(x, 5))))}$`;
      // matriz de la forma cuadrática A = P D Pᵀ, con autovalores distintos
      const lam = r.distinct(3, -6, 9);
      if (lam.includes(0)) return null;
      const A25 = [0, 1, 2].map(i => [0, 1, 2].map(j => [0, 1, 2].reduce((s, k) => s + good[i][k] * lam[k] * good[j][k], 0)));  // = 25·A
      const cands = [good, swap, unnorm, skew], { options, correct } = H.mc(r, tex(good), [tex(swap), tex(unnorm), tex(skew)], { text: true });
      const orth = M => [0, 1, 2].every(i => [0, 1, 2].every(j => Math.abs(M.reduce((s, row) => s + row[i] * row[j], 0) / 25 - (i === j ? 1 : 0)) < 1e-12));
      const det3 = M => (M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0])) / 125;
      return {
        prompt: `La cuádrica $X^TAX = 1$ tiene matriz $A = ${pm(A25.map(row => row.map(x => H.frac(x, 25))))}$. ¿Cuál de estas matrices es correcta para la transformación ortogonal de coordenadas $X = PX'$ que la lleva a su posición normal (una rotación de ejes)?`,
        options, correct,
        solution: [R`Hace falta que las columnas de $P$ sean una base ortonormal ($P^TP = I$) y que $\det P = 1$, para que sea una rotación y no una simetría.`,
          `La correcta es ${tex(good)}: sus columnas son autovectores unitarios y ortogonales de $A$, y su determinante es $1$. Con ella, $P^TAP = \\operatorname{diag}(${lam.join(", ")})$ y la cuádrica queda $${H.poly([[lam[0], "x'^{2}"], [lam[1], "y'^{2}"], [lam[2], "z'^{2}"]])} = 1$.`,
          `${tex(swap)} es ortogonal pero tiene $\\det = -1$ (intercambia dos ejes: invierte la orientación); en ${tex(unnorm)} una columna tiene norma $2$; en ${tex(skew)} dos columnas no son ortogonales.`],
        verify: { kind: "truth", target: true, fn: () => {
          // PᵀAP tiene que dar la diagonal de autovalores
          const PtAP = [0, 1, 2].map(i => [0, 1, 2].map(j => [0, 1, 2].reduce((s, k) => s + [0, 1, 2].reduce((t, l) => t + good[k][i] * A25[k][l] * good[l][j], 0), 0) / 625));
          const diag = PtAP.every((row, i) => row.every((x, j) => Math.abs(x - (i === j ? lam[i] : 0)) < 1e-9));
          return diag && orth(good) && Math.abs(det3(good) - 1) < 1e-12 && cands.slice(1).every(M => !orth(M) || Math.abs(det3(M) - 1) > 1e-9);
        } }
      };
    }
  };

  E.registerExams("m106", {
    self: SELF,
    templates: T,
    // los ítems con `any` alternan el ejercicio de los exámenes reales con uno armado con plantillas de la materia
    exams: [
      { id: "p1", kind: "parcial", title: "1.er parcial", topics: "Vectores, bases ortonormales, planos, rectas y circunferencia", minutes: 120, pass: 60,
        items: [
          { any: [
            { title: "Base ortonormal y proyección", parts: [{ self: "ga-ex-base-on", pts: 32 }] },
            { title: "Vectores: base, proyección y cosenos directores", parts: [{ tpl: "ga-base-num", pts: 12 }, { tpl: "ga-proy-num", pts: 10 }, { tpl: "ga-cosdir-num", pts: 10 }] }
          ] },
          { any: [
            { title: "Haz de planos, trazas y distancias", parts: [{ self: "ga-ex-haz-trazas", pts: 50 }] },
            { title: "Planos y rectas en el espacio", parts: [{ tpl: "ga-haz-num", pts: 12 }, { tpl: "ga-dist-rectas-num", pts: 14 }, { tpl: "ga-angulo-num", pts: 12 }, { tpl: "ga-dist-planos-num", pts: 12 }] }
          ] },
          { title: "Circunferencias y eje radical", parts: [{ self: "ga-ex-circ-radical", pts: 18 }] }
        ] },
      { id: "p2", kind: "parcial", title: "2.º parcial", topics: "Cónicas, superficies cilíndricas y de revolución, esfera", minutes: 120, pass: 60,
        items: [
          { any: [
            { title: "Elipse: tangentes en el lado recto", parts: [{ self: "ga-ex-elipse-lr", pts: 30 }] },
            { title: "Cónicas: elementos y tangentes", parts: [{ tpl: "ga-elipse-num", pts: 10 }, { tpl: "ga-tangente-num", pts: 10 }, { tpl: "ga-hiperbola-num", pts: 10 }] }
          ] },
          { title: "Parábola y paraboloide de revolución", parts: [{ self: "ga-ex-paraboloide", pts: 22 }] },
          { any: [
            { title: "Superficie cilíndrica", parts: [{ self: "ga-ex-cilindrica", pts: 30 }] },
            { title: "Superficies cilíndricas, cónicas y de revolución", parts: [{ tpl: "ga-sup-conica-num", pts: 12 }, { tpl: "ga-sup-cil-tf", pts: 8 }, { tpl: "ga-revolucion-mc", pts: 10 }] }
          ] },
          { any: [
            { title: "Esfera (completar)", parts: [{ self: "ga-ex-esfera", pts: 18 }] },
            { title: "Esfera", parts: [{ tpl: "ga-esfera-num", pts: 6 }, { tpl: "ga-esfera-tg-num", pts: 6 }, { tpl: "ga-esfera-plano-num", pts: 6 }] }
          ] }
        ] },
      { id: "final", kind: "final", title: "Examen de promoción / final", topics: "Cónicas en polares, cónicas rotadas, cuádricas de revolución en cilíndricas y esféricas, y transformaciones ortogonales. El final regular tiene la misma estructura.", minutes: 150, pass: 60,
        items: [
          { title: "Cónica en coordenadas polares", parts: [{ self: "ga-ex-conica-polar", pts: 32 }] },
          { any: [
            { title: "Cónica rotada", parts: [{ self: "ga-ex-conica-rotada", pts: 32 }] },
            { title: "Ecuación general de segundo grado", parts: [{ tpl: "ga-rotacion-num", pts: 10 }, { tpl: "ga-semiejes-num", pts: 12 }, { tpl: "ga-identificar-conica-mc", pts: 10 }] }
          ] },
          { title: "Hiperboloide de revolución", parts: [{ self: "ga-ex-hiperboloide", pts: 26 }] },
          { title: "Transformación ortogonal", parts: [{ tpl: "ga-ex-matriz-p", pts: 10 }] }
        ] }
    ]
  });
})();
