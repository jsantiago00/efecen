/*
 * M104 · Introducción al Álgebra Lineal — Lic. en Ciencias Básicas (FCEN, UNCuyo), Plan Ord. 77/15 C.S.
 * ======================================================================================================
 * Temario: programa de Introducción al Álgebra Lineal (M104), versión 2020 (la más reciente publicada):
 *   I Vectores geométricos del plano y del espacio · II Matrices y determinantes
 *   III Sistemas de ecuaciones lineales · IV Espacios vectoriales
 *   V Transformaciones lineales · VI Autovalores y autovectores
 *
 * Verificaciones (tests): los determinantes, rangos, sistemas, inversas y autovalores se recalculan
 * por eliminación de Gauss en tests/run-tests.mjs (kinds det, rank, solve, inv, eig, rouche, nullity).
 * Ids con prefijo "al-". Todo el texto y los ejercicios son originales.
 */
(function () {
  window.Efecen.registerCourse({ id: "m104", code: "M104", title: "Introducción al Álgebra Lineal", icon: "grid-3x3" });
})();

/* =====================================================================
 *  UNIDAD I · VECTORES GEOMÉTRICOS DEL PLANO Y DEL ESPACIO
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num, frac } = H;
  const T = {};
  const vec = v => `(${v.join(", ")})`;
  const dot = (u, v) => u.reduce((s, x, i) => s + x * v[i], 0);
  const norm = u => Math.sqrt(dot(u, u));
  const cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const sub = (u, v) => u.map((x, i) => x - v[i]);
  const add = (u, v) => u.map((x, i) => x + v[i]);
  const rv = (r, n = 3, lo = -4, hi = 4) => Array.from({ length: n }, () => r.int(lo, hi));
  const nonzero = u => u.some(x => x !== 0);

  T["al-escalar-num"] = {
    type: "numeric", concepts: ["al-escalar"], difficulty: 1,
    generate(r) {
      const u = rv(r), v = rv(r), ask = r.pick(["dot", "ang", "k"]);
      if (!nonzero(u) || !nonzero(v)) return null;
      if (ask === "k") {
        const a = r.int(-4, 4), b = r.int(-4, 4), c = r.int(-4, 4), d = r.int(-4, 4), e = r.nz(-4, 4);
        const k = -(a * c + b * d) / e;
        return { prompt: `¿Para qué valor de $k$ son ortogonales $\\vec u = ${vec([a, b, "k"])}$ y $\\vec v = ${vec([c, d, e])}$?`, answer: k, answerTex: frac(-(a * c + b * d), e),
          solution: [`Ortogonales $\\iff \\vec u\\cdot\\vec v = 0$ ([[al-producto-escalar]]).`, `$${H.par(a)}\\cdot${H.par(c)} + ${H.par(b)}\\cdot${H.par(d)} + ${H.par(e)}\\,k = 0 \\Rightarrow k = ${frac(-(a * c + b * d), e)}$.`],
          verify: { kind: "zero", fn: kk => [dot([a, b, kk], [c, d, e])] } };
      }
      const d = dot(u, v), ang = Math.acos(d / (norm(u) * norm(v))) * 180 / Math.PI;
      return {
        prompt: `Sean $\\vec u = ${vec(u)}$ y $\\vec v = ${vec(v)}$. Calculá ${ask === "dot" ? "$\\vec u\\cdot\\vec v$" : "el ángulo entre ellos, en grados"}.`,
        answer: ask === "dot" ? d : ang,
        solution: [`[[al-producto-escalar|Producto escalar]]: $\\vec u\\cdot\\vec v = \\sum u_iv_i = ${d}$.`, ask === "ang" ? `$\\cos\\theta = \\frac{\\vec u\\cdot\\vec v}{\\|\\vec u\\|\\|\\vec v\\|} = \\frac{${d}}{\\sqrt{${dot(u, u)}}\\sqrt{${dot(v, v)}}}$, así que $\\theta \\approx ${num(ang, 3)}^\\circ$.` : `Respuesta: $${d}$.`],
        // verificación: identidad de polarización / teorema del coseno (sin sumar productos de componentes)
        verify: { kind: "value", fn: () => { const p = norm(add(u, v)) ** 2, m = norm(sub(u, v)) ** 2, dd = (p - m) / 4; return ask === "dot" ? dd : Math.acos((norm(u) ** 2 + norm(v) ** 2 - m) / (2 * norm(u) * norm(v))) * 180 / Math.PI; } }
      };
    }
  };
  T["al-cruz-num"] = {
    type: "numeric", concepts: ["al-vectorial"], difficulty: 2,
    generate(r) {
      const u = rv(r), v = rv(r), w = cross(u, v), ask = r.pick([0, 1, 2, "area"]);
      if (!nonzero(w)) return null;
      const area = norm(w);
      return {
        prompt: ask === "area" ? `¿Cuál es el área del paralelogramo generado por $\\vec u = ${vec(u)}$ y $\\vec v = ${vec(v)}$?` : `Calculá la componente $${"xyz"[ask]}$ de $\\vec u\\times\\vec v$, con $\\vec u = ${vec(u)}$ y $\\vec v = ${vec(v)}$.`,
        answer: ask === "area" ? area : w[ask],
        solution: [`[[al-producto-vectorial|Producto vectorial]]: $\\vec u\\times\\vec v = \\begin{vmatrix} \\hat\\imath & \\hat\\jmath & \\hat k \\\\ ${u.join(" & ")} \\\\ ${v.join(" & ")} \\end{vmatrix} = ${vec(w)}$.`, ask === "area" ? `El área es su norma: $\\sqrt{${dot(w, w)}} \\approx ${num(area, 4)}$.` : `Componente $${"xyz"[ask]}$: $${w[ask]}$.`],
        // verificación: con la componente propuesta, el vector tiene que ser ortogonal a u y v y cumplir la identidad de Lagrange
        verify: ask === "area" ? { kind: "value", fn: () => Math.sqrt(dot(u, u) * dot(v, v) - dot(u, v) ** 2) }
          : { kind: "zero", fn: c => { const ww = w.slice(); ww[ask] = c; return [dot(ww, u), dot(ww, v), dot(ww, ww) - (dot(u, u) * dot(v, v) - dot(u, v) ** 2)]; } }
      };
    }
  };
  T["al-mixto-num"] = {
    type: "numeric", concepts: ["al-vectorial"], difficulty: 2,
    generate(r) {
      const u = rv(r, 3, -3, 3), v = rv(r, 3, -3, 3), w = rv(r, 3, -3, 3), d = dot(u, cross(v, w));
      if (d === 0) return null;
      return {
        prompt: `¿Cuál es el volumen del paralelepípedo determinado por $${vec(u)}$, $${vec(v)}$ y $${vec(w)}$?`,
        answer: Math.abs(d),
        solution: [`[[al-producto-vectorial|Producto mixto]]: $V = |\\vec u\\cdot(\\vec v\\times\\vec w)|$, que es el valor absoluto del determinante con esos vectores como filas.`, `$\\vec v\\times\\vec w = ${vec(cross(v, w))}$ y $\\vec u\\cdot(\\vec v\\times\\vec w) = ${d}$: $V = ${Math.abs(d)}$.`],
        verify: { kind: "det", A: [u, v, w], target: d }
      };
    }
  };
  T["al-li-vf"] = {
    type: "tf", concepts: ["al-vectores"], difficulty: 2,
    generate(r) {
      const u = rv(r, 3, -3, 3), v = rv(r, 3, -3, 3);
      if (!nonzero(cross(u, v))) return null;
      const dep = r.bool();
      const a = r.nz(-2, 2), b = r.nz(-2, 2), w = dep ? add(u.map(x => a * x), v.map(x => b * x)) : rv(r, 3, -3, 3);
      const indep = dot(u, cross(v, w)) !== 0;
      return {
        prompt: `<b>Verdadero o falso:</b> los vectores $${vec(u)}$, $${vec(v)}$ y $${vec(w)}$ son linealmente independientes.`,
        answer: indep,
        explanation: indep ? `El producto mixto (determinante) vale $${dot(u, cross(v, w))} \\neq 0$: no son coplanares, son LI.` : `El producto mixto da $0$: son coplanares${dep ? ` (de hecho el tercero es $${a}\\vec u ${b < 0 ? "-" : "+"} ${Math.abs(b)}\\vec v$)` : ""}, así que son LD.`,
        solution: [`Tres vectores de $\\mathbb{R}^3$ son [[al-vectores|LI]] si y solo si el determinante que forman es distinto de $0$.`],
        verify: { kind: "rank", A: [u, v, w], target: indep ? 3 : 2 }
      };
    }
  };
  T["al-proy-num"] = {
    type: "numeric", concepts: ["al-escalar"], difficulty: 2,
    generate(r) {
      const u = rv(r), v = rv(r), ask = r.pick(["comp", 0, 1, 2]);
      if (!nonzero(v) || !nonzero(u)) return null;
      const c = dot(u, v) / norm(v), p = v.map(x => x * dot(u, v) / dot(v, v));
      return {
        prompt: ask === "comp" ? `¿Cuál es la componente (proyección escalar) de $\\vec u = ${vec(u)}$ en la dirección de $\\vec v = ${vec(v)}$?` : `Calculá la componente $${"xyz"[ask]}$ de la proyección vectorial de $\\vec u = ${vec(u)}$ sobre $\\vec v = ${vec(v)}$.`,
        answer: ask === "comp" ? c : p[ask],
        solution: [`[[al-producto-escalar|Proyección]]: $\\text{comp}_{\\vec v}\\vec u = \\frac{\\vec u\\cdot\\vec v}{\\|\\vec v\\|}$ y $\\text{proy}_{\\vec v}\\vec u = \\frac{\\vec u\\cdot\\vec v}{\\vec v\\cdot\\vec v}\\vec v$.`, `$\\vec u\\cdot\\vec v = ${dot(u, v)}$, $\\vec v\\cdot\\vec v = ${dot(v, v)}$.`],
        // verificación: lo que sobra (u − proyección) tiene que ser perpendicular a v
        verify: ask === "comp" ? { kind: "zero", fn: cc => [dot(sub(u, v.map(x => x * cc / norm(v))), v)] }
          : { kind: "zero", fn: cc => { const pp = p.slice(); pp[ask] = cc; return [dot(sub(u, pp), v), pp[0] * v[1] - pp[1] * v[0], pp[1] * v[2] - pp[2] * v[1]]; } }
      };
    }
  };

  const cards = {
    "al-vectores": {
      title: "Vectores, combinaciones lineales e independencia", aliases: ["vector", "vectores", "combinación lineal", "linealmente independientes", "linealmente dependientes", "independencia lineal", "dependencia lineal"], concepts: ["al-vectores"],
      summary: "Los vectores se suman y se multiplican por escalares. Son LI si ninguno es combinación lineal de los otros.",
      def: [R`Un vector de $\mathbb{R}^n$ es una lista $(v_1, \dots, v_n)$; se suman componente a componente y se multiplican por escalares. Geométricamente, en $\mathbb{R}^2$ y $\mathbb{R}^3$ son flechas (clases de cuplas equipolentes).`,
        R`Una **combinación lineal** de $\vec v_1, \dots, \vec v_k$ es $\alpha_1\vec v_1 + \dots + \alpha_k\vec v_k$. Los vectores son **linealmente independientes (LI)** si la única combinación que da $\vec 0$ es la trivial ($\alpha_i = 0$); si no, son **LD**.`],
      idea: [R`LD significa que hay "redundancia": alguno se escribe con los otros. En $\mathbb{R}^3$: dos vectores son LD si son paralelos, y tres si son coplanares, que pasa si y solo si el [[al-determinante|determinante]] que forman es $0$.`],
      examples: [{ q: R`¿Son LI $(1, 2)$ y $(2, 4)$?`, steps: [R`$(2, 4) = 2(1, 2)$: son LD (paralelos).`] }],
      see: ["al-producto-escalar", "al-base", "al-determinante"]
    },
    "al-producto-escalar": {
      title: "Producto escalar, norma, ángulo y proyección", aliases: ["producto escalar", "producto punto", "producto interno", "norma", "ortogonales", "vectores ortogonales", "proyección escalar", "proyección vectorial"], concepts: ["al-escalar"],
      summary: "u·v = Σ uᵢvᵢ = ‖u‖‖v‖cos θ. Ortogonales ⟺ u·v = 0. proy_v u = (u·v / v·v) v.",
      def: [R`$\vec u\cdot\vec v = \sum u_iv_i$. **Norma:** $\|\vec u\| = \sqrt{\vec u\cdot\vec u}$. **Ángulo:** $\cos\theta = \frac{\vec u\cdot\vec v}{\|\vec u\|\|\vec v\|}$.`,
        R`$\vec u \perp \vec v \iff \vec u\cdot\vec v = 0$. **Proyección** de $\vec u$ sobre $\vec v$: $\text{proy}_{\vec v}\vec u = \frac{\vec u\cdot\vec v}{\vec v\cdot\vec v}\vec v$, y la componente escalar es $\frac{\vec u\cdot\vec v}{\|\vec v\|}$.`],
      idea: [R`El producto escalar mide "cuánto apunta uno en la dirección del otro". En física es el [[f1-trabajo|trabajo]]: $W = \vec F\cdot\Delta\vec r$. Un vector normado (de norma 1) se obtiene dividiendo por la norma.`],
      demo: [R`**Fórmula del ángulo.** Por el teorema del coseno en el triángulo de lados $\vec u$, $\vec v$ y $\vec u - \vec v$: $\|\vec u - \vec v\|^2 = \|\vec u\|^2 + \|\vec v\|^2 - 2\|\vec u\|\|\vec v\|\cos\theta$.`,
        R`Desarrollando el lado izquierdo como producto escalar: $\|\vec u\|^2 - 2\vec u\cdot\vec v + \|\vec v\|^2$. Comparando: $\vec u\cdot\vec v = \|\vec u\|\|\vec v\|\cos\theta$. $\blacksquare$`],
      examples: [{ q: R`Ángulo entre $(1, 0, 1)$ y $(0, 1, 1)$.`, steps: [R`$\cos\theta = \frac{1}{\sqrt2\sqrt2} = \frac12$, así que $\theta = 60^\circ$.`] }],
      see: ["al-vectores", "al-producto-vectorial", "al-euclideo"]
    },
    "al-producto-vectorial": {
      title: "Producto vectorial y producto mixto", aliases: ["producto vectorial", "producto cruz", "producto mixto", "identidad de Lagrange"], concepts: ["al-vectorial"],
      summary: "u × v es perpendicular a ambos, con módulo igual al área del paralelogramo. u·(v × w) es el volumen (con signo) del paralelepípedo.",
      def: [R`$$\vec u\times\vec v = \begin{vmatrix}\hat\imath & \hat\jmath & \hat k \\ u_1 & u_2 & u_3 \\ v_1 & v_2 & v_3\end{vmatrix} = (u_2v_3 - u_3v_2,\ u_3v_1 - u_1v_3,\ u_1v_2 - u_2v_1).$$`,
        R`Propiedades: es perpendicular a $\vec u$ y a $\vec v$, su sentido sigue la regla de la mano derecha, $\vec v\times\vec u = -\vec u\times\vec v$, y $\|\vec u\times\vec v\| = \|\vec u\|\|\vec v\|\sin\theta$.`,
        R`**Identidad de Lagrange:** $\|\vec u\times\vec v\|^2 = \|\vec u\|^2\|\vec v\|^2 - (\vec u\cdot\vec v)^2$. **Producto mixto:** $\vec u\cdot(\vec v\times\vec w) = \det\begin{pmatrix}\vec u\\ \vec v\\ \vec w\end{pmatrix}$.`],
      idea: [R`$\|\vec u\times\vec v\|$ es el área del paralelogramo, y $|\vec u\cdot(\vec v\times\vec w)|$ el volumen del paralelepípedo. Si el producto mixto da $0$, los tres vectores son coplanares (LD). En física: el [[f1-torque|torque]] $\vec r\times\vec F$ y el momento angular.`],
      demo: [R`**Lagrange.** Con $\|\vec u\times\vec v\| = \|\vec u\|\|\vec v\|\sin\theta$ y $\vec u\cdot\vec v = \|\vec u\|\|\vec v\|\cos\theta$: $\|\vec u\times\vec v\|^2 + (\vec u\cdot\vec v)^2 = \|\vec u\|^2\|\vec v\|^2(\sin^2\theta + \cos^2\theta)$. $\blacksquare$`],
      examples: [{ q: R`Calculá $(1, 0, 0)\times(0, 1, 0)$.`, steps: [R`$\hat\imath\times\hat\jmath = \hat k = (0, 0, 1)$.`] }],
      see: ["al-producto-escalar", "al-determinante"]
    }
  };

  E.extendCourse("m104", {
    concepts: { "al-vectores": { name: "Combinaciones lineales e independencia" }, "al-escalar": { name: "Producto escalar y proyección" }, "al-vectorial": { name: "Producto vectorial y mixto" } },
    templates: T,
    units: [{
      id: "al-vectores-u", order: 1, program: "Unidad I", title: "Vectores del plano y del espacio", icon: "zap",
      diagnostic: ["al-escalar-num", "al-cruz-num", "al-mixto-num"],
      lessons: [
        { id: "al-escalar", title: "Producto escalar y proyección", templates: ["al-escalar-num", "al-proy-num"], theory: ["al-producto-escalar", "al-vectores"],
          intro: R`$\vec u\cdot\vec v = \sum u_iv_i = \|\vec u\|\|\vec v\|\cos\theta$. Ortogonales si da $0$.` },
        { id: "al-vectorial", title: "Producto vectorial, mixto e independencia", templates: ["al-cruz-num", "al-mixto-num", "al-li-vf"], theory: ["al-producto-vectorial", "al-vectores"],
          intro: R`$\|\vec u\times\vec v\|$ es un área; $|\vec u\cdot(\vec v\times\vec w)|$, un volumen. Si el producto mixto da $0$, los vectores son LD.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD II · MATRICES Y DETERMINANTES
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num, frac } = H;
  const T = {};
  const M = A => `\\begin{pmatrix} ${A.map(r => r.join(" & ")).join(" \\\\ ")} \\end{pmatrix}`;
  const mm = (A, B) => A.map(row => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)));
  const rmat = (r, n, m, lo = -3, hi = 3) => Array.from({ length: n }, () => Array.from({ length: m }, () => r.int(lo, hi)));
  // determinante por desarrollo de Laplace (los tests lo comparan con eliminación de Gauss)
  const detL = A => A.length === 1 ? A[0][0] : A[0].reduce((s, a, j) => s + (j % 2 ? -1 : 1) * a * detL(A.slice(1).map(r => r.filter((_, k) => k !== j))), 0);
  const transpose = A => A[0].map((_, j) => A.map(r => r[j]));

  T["al-matmul-num"] = {
    type: "numeric", concepts: ["al-matrices"], difficulty: 1,
    generate(r) {
      const A = rmat(r, 2, 3), B = rmat(r, 3, 2), C = mm(A, B), i = r.int(0, 1), j = r.int(0, 1);
      return {
        prompt: `Sean $A = ${M(A)}$ y $B = ${M(B)}$. Calculá el elemento $(AB)_{${i + 1}${j + 1}}$.`,
        answer: C[i][j],
        solution: [`[[al-matrices|Producto de matrices]]: $(AB)_{ij}$ es la fila $i$ de $A$ por la columna $j$ de $B$.`, `$${A[i].map((a, k) => `${H.par(a)}\\cdot${H.par(B[k][j])}`).join(" + ")} = ${C[i][j]}$.`, `(El producto completo es $AB = ${M(C)}$.)`],
        verify: { kind: "matmul", A, B, C }
      };
    }
  };
  T["al-det-num"] = {
    type: "numeric", concepts: ["al-det"], difficulty: 2,
    generate(r) {
      const n = r.pick([2, 3, 3, 4]);
      let A = rmat(r, n, n, -4, 4);
      if (n === 4) A = A.map((row, i) => row.map((x, j) => (i > j + 1 ? 0 : x))); // casi triangular: se resuelve con pocas operaciones
      const d = detL(A);
      return {
        prompt: `Calculá el determinante de $${M(A)}$.`,
        answer: d,
        solution: [n === 2 ? `Orden 2: $ad - bc$ ([[al-determinante]]).` : n === 3 ? `Orden 3: regla de Sarrus o desarrollo por una fila ([[al-determinante]]).` : `Conviene triangular con operaciones de fila (sumar a una fila un múltiplo de otra no cambia el determinante) ([[al-determinante]]).`, `Resultado: $\\det = ${d}$.`],
        verify: { kind: "det", A }
      };
    }
  };
  T["al-inversa-num"] = {
    type: "numeric", concepts: ["al-inversa"], difficulty: 2,
    generate(r) {
      const a = r.int(-5, 5), b = r.int(-5, 5), c = r.int(-5, 5), d = r.int(-5, 5), D = a * d - b * c;
      if (D === 0) return null;
      const B = [[d / D, -b / D], [-c / D, a / D]], Bt = [[frac(d, D), frac(-b, D)], [frac(-c, D), frac(a, D)]];
      const i = r.int(0, 1), j = r.int(0, 1);
      return {
        prompt: `Sea $A = ${M([[a, b], [c, d]])}$. Calculá el elemento $(${i + 1}, ${j + 1})$ de $A^{-1}$.`,
        answer: B[i][j], answerTex: Bt[i][j],
        solution: [`$\\det A = ${D} \\neq 0$, así que existe la [[al-inversa|inversa]].`, `Para $2\\times2$: $A^{-1} = \\frac{1}{\\det A}${M([["d", "-b"], ["-c", "a"]])} = ${M(Bt)}$.`],
        verify: { kind: "inv", A: [[a, b], [c, d]], B }
      };
    }
  };
  T["al-detprop-num"] = {
    type: "numeric", concepts: ["al-det"], difficulty: 2,
    generate(r) {
      const n = r.int(2, 4), d = r.nz(-5, 5), k = r.pick([2, 3, -1, -2]), op = r.pick(["kA", "AT", "A2", "Ainv", "kAT"]);
      // una matriz concreta con ese determinante: triangular superior con diagonal (d, 1, ..., 1) y entradas arriba
      const A = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? (i === 0 ? d : 1) : j > i ? r.int(-2, 2) : 0)));
      const ans = { kA: k ** n * d, AT: d, A2: d * d, Ainv: 1 / d, kAT: k ** n * d }[op];
      const q = { kA: `${k}A`, AT: "A^{T}", A2: "A^{2}", Ainv: "A^{-1}", kAT: `${k}A^{T}` }[op];
      const target = op === "kA" ? A.map(r2 => r2.map(x => k * x)) : op === "AT" ? transpose(A) : op === "A2" ? mm(A, A) : op === "kAT" ? transpose(A).map(r2 => r2.map(x => k * x)) : null;
      return {
        prompt: `$A$ es una matriz de $${n}\\times${n}$ con $\\det A = ${d}$. Calculá $\\det(${q})$.`,
        answer: ans, answerTex: op === "Ainv" ? frac(1, d) : String(ans),
        solution: [`[[al-determinante|Propiedades]]: $\\det(kA) = k^n\\det A$, $\\det(A^T) = \\det A$, $\\det(AB) = \\det A\\det B$, $\\det(A^{-1}) = \\frac{1}{\\det A}$.`, `Con $n = ${n}$: $\\det(${q}) = ${op === "Ainv" ? frac(1, d) : ans}$.`],
        verify: op === "Ainv" ? { kind: "zero", fn: x => [x * d - 1] } : { kind: "det", A: target }
      };
    }
  };
  T["al-gj-order"] = {
    type: "order", concepts: ["al-inversa"], difficulty: 2,
    generate(r) {
      const a = r.int(1, 3), b = r.int(1, 4), c = a * r.int(1, 3);
      const m = c / a, d = b * m + r.pick([1, 2]); // fila 2 - m·fila 1 deja pivote d - mb ≠ 0
      const p = d - m * b, D = a * d - b * c;
      const B = [[d / D, -b / D], [-c / D, a / D]];
      return {
        prompt: `Ordená los pasos de Gauss-Jordan para invertir $A = ${M([[a, b], [c, d]])}$.`,
        steps: [
          `Armamos $[A \\mid I] = \\left(\\begin{array}{cc|cc} ${a} & ${b} & 1 & 0 \\\\ ${c} & ${d} & 0 & 1 \\end{array}\\right)$.`,
          `$F_2 \\to F_2 - ${m === 1 ? "" : m}F_1$: queda $\\left(\\begin{array}{cc|cc} ${a} & ${b} & 1 & 0 \\\\ 0 & ${p} & ${-m} & 1 \\end{array}\\right)$.`,
          `Hacemos $1$ los pivotes y $0$ arriba del segundo: $F_1 \\to F_1 - ${frac(b, p) === "1" ? "" : frac(b, p)}F_2$ y dividimos cada fila por su pivote.`,
          `Queda $[I \\mid A^{-1}]$ con $A^{-1} = ${M([[frac(d, D), frac(-b, D)], [frac(-c, D), frac(a, D)]])}$.`
        ],
        solution: [`[[al-inversa|Gauss-Jordan]]: las mismas operaciones de fila que llevan $A$ a $I$ llevan $I$ a $A^{-1}$.`],
        verify: { kind: "inv", A: [[a, b], [c, d]], B }
      };
    }
  };
  T["al-matriz-vf"] = {
    type: "tf", concepts: ["al-matrices"], difficulty: 1,
    generate(r) {
      const A = rmat(r, 2, 2), B = rmat(r, 2, 2);
      const add = (X, Y) => X.map((row, i) => row.map((x, j) => x + Y[i][j]));
      const same = (X, Y) => X.every((row, i) => row.every((x, j) => Math.abs(x - Y[i][j]) < 1e-9));
      const st = r.pick([
        { s: `$AB = BA$`, f: () => same(mm(A, B), mm(B, A)), why: `El producto de matrices **no es conmutativo** en general.` },
        { s: `$(AB)^T = B^TA^T$`, f: () => same(transpose(mm(A, B)), mm(transpose(B), transpose(A))), why: `Siempre vale: al trasponer un producto se invierte el orden.` },
        { s: `$\\det(A + B) = \\det A + \\det B$`, f: () => Math.abs(detL(add(A, B)) - detL(A) - detL(B)) < 1e-9, why: `El determinante **no** es aditivo (sí es multiplicativo: $\\det(AB) = \\det A\\det B$).` },
        { s: `$\\det(AB) = \\det A\\,\\det B$`, f: () => Math.abs(detL(mm(A, B)) - detL(A) * detL(B)) < 1e-9, why: `Siempre vale: el determinante es multiplicativo.` }
      ]);
      const truth = st.f();
      return {
        prompt: `Sean $A = ${M(A)}$ y $B = ${M(B)}$. <b>Verdadero o falso:</b> ${st.s}.`,
        answer: truth,
        explanation: `${st.why} Para estas matrices en particular, ${truth ? "se cumple" : "no se cumple"}.`,
        solution: [`Con [[al-matrices|matrices]] hay que tener cuidado con las propiedades "de los números" que no valen.`],
        verify: { kind: "truth", fn: () => { const X = mm(A, B), Y = mm(B, A); return st.s.startsWith("$AB = BA") ? X.every((row, i) => row.every((x, j) => x === Y[i][j])) : st.f(); } }
      };
    }
  };

  const cards = {
    "al-matrices": {
      title: "Matrices: tipos y operaciones", aliases: ["matriz", "matrices", "producto de matrices", "matriz transpuesta", "transpuesta", "matriz simétrica", "matriz diagonal", "matriz triangular"], concepts: ["al-matrices"],
      summary: "(AB)ᵢⱼ = fila i de A por columna j de B. El producto es asociativo pero no conmutativo.",
      def: [R`Una matriz $m\times n$ es un arreglo de $m$ filas y $n$ columnas. **Suma** y **producto por escalar**: elemento a elemento. **Producto** ($A$ de $m\times n$, $B$ de $n\times p$): $(AB)_{ij} = \sum_k a_{ik}b_{kj}$.`,
        R`**Tipos:** cuadrada, diagonal, triangular (superior o inferior), identidad $I$, **transpuesta** $A^T$ (filas por columnas), **simétrica** ($A^T = A$), escalonada y escalonada reducida.`],
      idea: [R`El producto es asociativo y distributivo, pero **no conmutativo**: en general $AB \neq BA$, y puede pasar que $AB = 0$ con $A, B \neq 0$. Vale $(AB)^T = B^TA^T$.`,
        R`$AB$ representa "hacer primero $B$ y después $A$" (composición de [[al-transformacion|transformaciones lineales]]).`],
      examples: [{ q: R`Calculá $\begin{pmatrix}1 & 2\\0 & 1\end{pmatrix}\begin{pmatrix}3\\4\end{pmatrix}$.`, steps: [R`$(1\cdot3 + 2\cdot4,\ 0\cdot3 + 1\cdot4) = (11, 4)$.`] }],
      see: ["al-determinante", "al-inversa", "al-sistemas"]
    },
    "al-determinante": {
      title: "Determinantes", aliases: ["determinante", "determinantes", "regla de Sarrus", "Sarrus", "desarrollo de Laplace"], concepts: ["al-det"],
      summary: "det A ≠ 0 ⟺ A es inversible. det(AB) = det A · det B; las operaciones de fila lo afectan de forma controlada.",
      def: [R`Orden 2: $\det\begin{pmatrix}a & b\\c & d\end{pmatrix} = ad - bc$. Orden 3: **regla de Sarrus** o **desarrollo de Laplace** por una fila: $\det A = \sum_j (-1)^{i+j}a_{ij}M_{ij}$, con $M_{ij}$ el menor que queda al borrar la fila $i$ y la columna $j$.`,
        R`**Propiedades:** intercambiar dos filas cambia el signo; multiplicar una fila por $k$ multiplica el determinante por $k$; sumar a una fila un múltiplo de otra no lo cambia. Por eso $\det(kA) = k^n\det A$. Además $\det(A^T) = \det A$, $\det(AB) = \det A\det B$, y el determinante de una triangular es el producto de su diagonal.`],
      idea: [R`$|\det A|$ es el factor por el que $A$ multiplica áreas (volúmenes en 3D), y el signo dice si invierte la orientación. Si $\det A = 0$, $A$ "aplasta" el espacio: sus filas son LD y no es inversible.`,
        R`**Cálculo por reducción:** se triangula con operaciones de fila llevando la cuenta de los cambios, y después se multiplica la diagonal. Es mucho más rápido que Laplace para $n \ge 4$.`],
      examples: [{ q: R`$\det\begin{pmatrix}2 & 1 & 0\\0 & 3 & 5\\0 & 0 & -1\end{pmatrix}$.`, steps: [R`Es triangular: $2\cdot 3\cdot(-1) = -6$.`] }],
      see: ["al-inversa", "al-cramer", "al-producto-vectorial"]
    },
    "al-inversa": {
      title: "Matriz inversa", aliases: ["matriz inversa", "inversible", "inversibles", "Gauss-Jordan", "matriz adjunta", "adjunta"], concepts: ["al-inversa"],
      summary: "A⁻¹ cumple AA⁻¹ = A⁻¹A = I; existe ⟺ det A ≠ 0. Se calcula con Gauss-Jordan sobre [A | I] o con la adjunta.",
      def: [R`$A$ ($n\times n$) es **inversible** si existe $A^{-1}$ con $AA^{-1} = A^{-1}A = I$, lo que pasa si y solo si $\det A \neq 0$.`,
        R`**Gauss-Jordan:** se reduce $[A \mid I]$ hasta $[I \mid A^{-1}]$. **Adjunta:** $A^{-1} = \frac{1}{\det A}\operatorname{adj}(A)$, con $\operatorname{adj}(A)$ la transpuesta de la matriz de cofactores. Para $2\times2$: $\begin{pmatrix}a & b\\c & d\end{pmatrix}^{-1} = \frac{1}{ad - bc}\begin{pmatrix}d & -b\\-c & a\end{pmatrix}$.`],
      idea: [R`¿Por qué funciona Gauss-Jordan? Cada operación de fila es multiplicar a izquierda por una matriz elemental $E_i$. Si $E_k\cdots E_1A = I$, ese producto es $A^{-1}$, y aplicado a $I$ da justamente $A^{-1}$.`,
        R`$(AB)^{-1} = B^{-1}A^{-1}$ (se invierte el orden) y $(A^T)^{-1} = (A^{-1})^T$.`],
      examples: [{ q: R`Inversa de $\begin{pmatrix}2 & 1\\5 & 3\end{pmatrix}$.`, steps: [R`$\det = 1$, así que $A^{-1} = \begin{pmatrix}3 & -1\\-5 & 2\end{pmatrix}$.`] }],
      see: ["al-determinante", "al-sistemas", "al-matrices"]
    }
  };

  E.extendCourse("m104", {
    concepts: { "al-matrices": { name: "Operaciones con matrices" }, "al-det": { name: "Determinantes" }, "al-inversa": { name: "Matriz inversa" } },
    templates: T,
    units: [{
      id: "al-matrices-u", order: 2, program: "Unidad II", title: "Matrices y determinantes", icon: "grid-3x3",
      diagnostic: ["al-matmul-num", "al-det-num", "al-inversa-num"],
      lessons: [
        { id: "al-matrices", title: "Operaciones con matrices", templates: ["al-matmul-num", "al-matriz-vf"], theory: ["al-matrices"],
          intro: R`$(AB)_{ij}$ = fila $i$ de $A$ por columna $j$ de $B$. En general $AB \neq BA$.` },
        { id: "al-det", title: "Determinantes", templates: ["al-det-num", "al-detprop-num"], theory: ["al-determinante"],
          intro: R`$\det(AB) = \det A\det B$, $\det(kA) = k^n\det A$, $\det A^T = \det A$. Triangular: producto de la diagonal.` },
        { id: "al-inversa", title: "Matriz inversa", templates: ["al-inversa-num", "al-gj-order"], theory: ["al-inversa", "al-determinante"],
          intro: R`Existe $A^{-1}$ si y solo si $\det A \neq 0$. Gauss-Jordan: $[A \mid I] \to [I \mid A^{-1}]$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD III · SISTEMAS DE ECUACIONES LINEALES
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num, frac } = H;
  const T = {};
  const M = A => `\\begin{pmatrix} ${A.map(r => r.join(" & ")).join(" \\\\ ")} \\end{pmatrix}`;
  const detL = A => A.length === 1 ? A[0][0] : A[0].reduce((s, a, j) => s + (j % 2 ? -1 : 1) * a * detL(A.slice(1).map(r => r.filter((_, k) => k !== j))), 0);
  const VARS = ["x", "y", "z"];
  const eqs = (A, b) => `\\begin{cases} ${A.map((row, i) => H.poly(row.map((a, j) => [a, VARS[j]])) + " = " + b[i]).join(" \\\\ ")} \\end{cases}`;

  T["al-sistema-num"] = {
    type: "numeric", concepts: ["al-sistemas"], difficulty: 2,
    generate(r) {
      const A = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => r.int(-3, 3)));
      if (detL(A) === 0) return null;
      const x = [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)], b = A.map(row => row.reduce((s, a, j) => s + a * x[j], 0)), k = r.int(0, 2);
      return {
        prompt: `Resolvé $$${eqs(A, b)}$$ ¿Cuánto vale $${VARS[k]}$?`,
        answer: x[k],
        solution: [`[[al-sistemas|Eliminación de Gauss]] sobre la matriz ampliada hasta forma escalonada, y sustitución hacia atrás.`, `(El determinante del sistema es $${detL(A)} \\neq 0$: hay solución única.)`, `Solución: $(x, y, z) = (${x.join(", ")})$.`],
        verify: { kind: "solve", A, b, x }
      };
    }
  };
  const CLS = ["Compatible determinado (solución única)", "Compatible indeterminado (infinitas soluciones)", "Incompatible (sin solución)"];
  T["al-rouche-mc"] = {
    type: "mc", concepts: ["al-rouche"], difficulty: 2,
    generate(r) {
      const kind = r.int(0, 2);
      const f1 = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)], f2 = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)];
      const b1 = r.int(-5, 5), b2 = r.int(-5, 5), a = r.nz(-2, 2), c = r.nz(-2, 2);
      let A, b;
      if (kind === 0) { A = [f1, f2, [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)]]; b = [b1, b2, r.int(-5, 5)]; if (detL(A) === 0) return null; }
      else {
        const f3 = f1.map((x, i) => a * x + c * f2[i]);
        A = [f1, f2, f3]; b = [b1, b2, a * b1 + c * b2 + (kind === 2 ? r.nz(-3, 3) : 0)];
        const cr = [f1[1] * f2[2] - f1[2] * f2[1], f1[2] * f2[0] - f1[0] * f2[2], f1[0] * f2[1] - f1[1] * f2[0]];
        if (cr.every(v => v === 0)) return null;
      }
      return {
        prompt: `¿Cómo es el sistema $$${eqs(A, b)}$$`,
        ...H.mc(r, CLS[kind], CLS.filter((_, i) => i !== kind).concat(["No se puede saber sin resolverlo"]), { text: true, keepOrder: true }),
        solution: [
          `[[al-rouche|Rouché-Frobenius]]: se comparan el rango de $A$ y el de la ampliada $[A \\mid b]$ (y el número de incógnitas, $3$).`,
          kind === 0 ? `$\\det A = ${detL(A)} \\neq 0$: $\\operatorname{rg}A = \\operatorname{rg}[A\\mid b] = 3$, compatible determinado.`
            : kind === 1 ? `La tercera ecuación es ${a}·(1.ª) ${c < 0 ? "−" : "+"} ${Math.abs(c)}·(2.ª), también en el término independiente: $\\operatorname{rg}A = \\operatorname{rg}[A\\mid b] = 2 < 3$, compatible indeterminado.`
            : `La tercera fila de $A$ es combinación de las dos primeras pero el término independiente no: $\\operatorname{rg}A = 2 < \\operatorname{rg}[A\\mid b] = 3$, incompatible.`
        ],
        verify: { kind: "rouche", A, b, target: kind }
      };
    }
  };
  T["al-param-num"] = {
    type: "numeric", concepts: ["al-rouche", "al-det"], difficulty: 3,
    generate(r) {
      const p = r.int(2, 5), q = r.int(-4, 4), s = r.int(-4, 4);
      const k = (q * s - q - s + p) / (p - 1);
      return {
        prompt: `¿Para qué valor de $k$ el sistema con matriz de coeficientes $${M([[1, 1, 1], [1, p, q], [1, s, "k"]])}$ **no** tiene solución única?`,
        answer: k, answerTex: frac(q * s - q - s + p, p - 1),
        solution: [`Un sistema cuadrado tiene solución única si y solo si $\\det A \\neq 0$ ([[al-cramer|Cramer]] / [[al-rouche|Rouché-Frobenius]]).`, `Desarrollando: $\\det A = ${p - 1}k ${H.sg(-q * s + q + s - p)}$, que se anula en $k = ${frac(q * s - q - s + p, p - 1)}$.`],
        verify: { kind: "det", A: kk => [[1, 1, 1], [1, p, q], [1, s, kk]], target: 0 }
      };
    }
  };
  T["al-cramer-num"] = {
    type: "numeric", concepts: ["al-cramer"], difficulty: 2,
    generate(r) {
      const a = r.int(-5, 5), b = r.int(-5, 5), c = r.int(-5, 5), d = r.int(-5, 5), D = a * d - b * c;
      if (D === 0) return null;
      const e = r.int(-9, 9), f = r.int(-9, 9), ask = r.pick(["x", "y"]);
      const x = (e * d - b * f) / D, y = (a * f - e * c) / D;
      return {
        prompt: `Usá la regla de Cramer para resolver $$${eqs([[a, b], [c, d]], [e, f])}$$ ¿Cuánto vale $${ask}$?`,
        answer: ask === "x" ? x : y, answerTex: ask === "x" ? frac(e * d - b * f, D) : frac(a * f - e * c, D),
        solution: [`[[al-cramer|Cramer]]: $${ask} = \\dfrac{\\det A_${ask}}{\\det A}$, reemplazando en $A$ la columna de $${ask}$ por los términos independientes.`, `$\\det A = ${D}$, $\\det A_${ask} = ${ask === "x" ? e * d - b * f : a * f - e * c}$, así que $${ask} = ${ask === "x" ? frac(e * d - b * f, D) : frac(a * f - e * c, D)}$.`],
        verify: { kind: "solve", A: [[a, b], [c, d]], b: [e, f], x: [x, y] }
      };
    }
  };
  T["al-homog-vf"] = {
    type: "tf", concepts: ["al-sistemas"], difficulty: 2,
    generate(r) {
      const f1 = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)], f2 = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)];
      const sing = r.bool(), a = r.nz(-2, 2), c = r.nz(-2, 2);
      const A = [f1, f2, sing ? f1.map((x, i) => a * x + c * f2[i]) : [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)]];
      const cr = [f1[1] * f2[2] - f1[2] * f2[1], f1[2] * f2[0] - f1[0] * f2[2], f1[0] * f2[1] - f1[1] * f2[0]];
      if (cr.every(v => v === 0)) return null;
      const d = detL(A);
      return {
        prompt: `<b>Verdadero o falso:</b> el sistema homogéneo $A\\vec x = \\vec 0$ con $A = ${M(A)}$ tiene soluciones distintas de la trivial.`,
        answer: d === 0,
        explanation: `Un sistema [[al-sistemas|homogéneo]] siempre tiene la solución $\\vec x = \\vec 0$; tiene otras si y solo si $\\det A = 0$. Acá $\\det A = ${d}$.`,
        solution: [`Si $\\det A \\neq 0$, la única solución es la trivial; si $\\det A = 0$, hay infinitas.`],
        verify: { kind: "rank", A, target: d === 0 ? 2 : 3 }
      };
    }
  };

  const cards = {
    "al-sistemas": {
      title: "Sistemas de ecuaciones lineales y eliminación de Gauss", aliases: ["sistema de ecuaciones", "sistemas de ecuaciones", "sistema lineal", "eliminación de Gauss", "matriz ampliada", "sistema homogéneo", "homogéneo", "forma escalonada"], concepts: ["al-sistemas"],
      summary: "A x = b. Con operaciones elementales de fila (que no cambian las soluciones) se lleva [A | b] a forma escalonada.",
      def: [R`Un sistema de $m$ ecuaciones lineales con $n$ incógnitas se escribe $A\vec x = \vec b$, con la **matriz ampliada** $[A \mid \vec b]$.`,
        R`**Operaciones elementales de fila:** intercambiar filas, multiplicar una fila por un escalar no nulo, sumar a una fila un múltiplo de otra. No cambian el conjunto de soluciones.`,
        R`**Gauss:** llevar a forma escalonada y resolver hacia atrás. **Gauss-Jordan:** seguir hasta la escalonada reducida (pivotes $1$ con ceros arriba y abajo).`],
      idea: [R`Un sistema **homogéneo** ($\vec b = \vec 0$) siempre tiene la solución trivial; tiene otras si y solo si las columnas de $A$ son LD (para $A$ cuadrada: $\det A = 0$).`,
        R`Geométricamente, en $\mathbb{R}^3$ cada ecuación es un plano: la solución es su intersección (un punto, una recta, un plano o vacía).`],
      examples: [{ q: R`Resolvé $x + y = 3$, $x - y = 1$.`, steps: [R`Restando: $2y = 2$, así que $y = 1$ y $x = 2$.`] }],
      see: ["al-rouche", "al-cramer", "al-inversa"]
    },
    "al-rouche": {
      title: "Rango y teorema de Rouché-Frobenius", aliases: ["Rouché-Frobenius", "Rouché", "rango", "rango de una matriz", "compatible determinado", "compatible indeterminado", "incompatible"], concepts: ["al-rouche"],
      summary: "Compatible ⟺ rg A = rg [A|b]; y si además ese rango es n, la solución es única.",
      def: [R`El **rango** de una matriz es la cantidad de filas no nulas en su forma escalonada (= máximo número de filas o de columnas LI).`,
        R`**Rouché-Frobenius** para $A\vec x = \vec b$ con $n$ incógnitas:<br>• Si $\operatorname{rg}A \neq \operatorname{rg}[A\mid b]$: **incompatible**.<br>• Si $\operatorname{rg}A = \operatorname{rg}[A\mid b] = n$: **compatible determinado**.<br>• Si $\operatorname{rg}A = \operatorname{rg}[A\mid b] < n$: **compatible indeterminado**, con $n - \operatorname{rg}A$ parámetros libres.`],
      idea: [R`Si al escalonar aparece una fila $(0\ 0\ \cdots\ 0 \mid c)$ con $c \neq 0$, eso dice "$0 = c$": imposible. Cada incógnita sin pivote es un parámetro libre.`],
      examples: [{ q: R`$x + y = 1$, $2x + 2y = 3$.`, steps: [R`Restando el doble de la primera: $0 = 1$.`, R`$\operatorname{rg}A = 1 < \operatorname{rg}[A\mid b] = 2$: incompatible (rectas paralelas).`] }],
      see: ["al-sistemas", "al-base", "al-nucleo-imagen"]
    },
    "al-cramer": {
      title: "Regla de Cramer", aliases: ["regla de Cramer", "Cramer"], concepts: ["al-cramer"],
      summary: "Si det A ≠ 0: xᵢ = det(Aᵢ)/det A, con Aᵢ la matriz A con la columna i reemplazada por b.",
      def: [R`Si $A$ es cuadrada con $\det A \neq 0$, la solución única de $A\vec x = \vec b$ es $$x_i = \frac{\det A_i}{\det A},$$ donde $A_i$ es $A$ con la columna $i$ reemplazada por $\vec b$.`],
      idea: [R`Es elegante y útil para sistemas chicos o para estudiar cómo depende la solución de un parámetro. Para sistemas grandes, Gauss es mucho más eficiente.`],
      demo: [R`Sea $\vec x$ la solución. Reemplazar la columna $i$ de $A$ por $\vec b = \sum_j x_j\vec a_j$ y usar la linealidad del determinante en esa columna da $\det A_i = \sum_j x_j\det(\dots, \vec a_j, \dots)$.`, R`Todos los términos con $j \neq i$ tienen dos columnas iguales (determinante $0$); queda $\det A_i = x_i\det A$. $\blacksquare$`],
      examples: [{ q: R`$2x + y = 5$, $x - y = 1$.`, steps: [R`$\det A = -3$, $\det A_x = -6$, $\det A_y = -3$.`, R`$x = 2$, $y = 1$.`] }],
      see: ["al-determinante", "al-sistemas"]
    }
  };

  E.extendCourse("m104", {
    concepts: { "al-sistemas": { name: "Sistemas y eliminación de Gauss" }, "al-rouche": { name: "Rango y Rouché-Frobenius" }, "al-cramer": { name: "Regla de Cramer" } },
    templates: T,
    units: [{
      id: "al-sistemas-u", order: 3, program: "Unidad III", title: "Sistemas de ecuaciones lineales", icon: "grid-3x3",
      diagnostic: ["al-sistema-num", "al-rouche-mc", "al-cramer-num"],
      lessons: [
        { id: "al-gauss", title: "Eliminación de Gauss", templates: ["al-sistema-num", "al-homog-vf"], theory: ["al-sistemas"],
          intro: R`Las operaciones elementales de fila no cambian las soluciones. Se escalona $[A\mid b]$ y se resuelve hacia atrás.` },
        { id: "al-rouche", title: "Rouché-Frobenius y Cramer", templates: ["al-rouche-mc", "al-param-num", "al-cramer-num"], theory: ["al-rouche", "al-cramer"],
          intro: R`Compatible $\iff \operatorname{rg}A = \operatorname{rg}[A\mid b]$; determinado si además es igual a $n$. Cramer: $x_i = \frac{\det A_i}{\det A}$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD IV · ESPACIOS VECTORIALES
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num, frac } = H;
  const T = {};
  const vec = v => `(${v.join(", ")})`;
  const dot = (u, v) => u.reduce((s, x, i) => s + x * v[i], 0);
  const detL = A => A.length === 1 ? A[0][0] : A[0].reduce((s, a, j) => s + (j % 2 ? -1 : 1) * a * detL(A.slice(1).map(r => r.filter((_, k) => k !== j))), 0);

  // filas LI por construcción: la fila i tiene ceros antes de la columna i y un pivote no nulo en i
  const echelonBasis = (r, rk, n) => Array.from({ length: rk }, (_, i) => Array.from({ length: n }, (_, j) => (j < i ? 0 : j === i ? r.nz(-2, 2) : r.int(-2, 2))));
  T["al-subesp-vf"] = {
    type: "tf", concepts: ["al-subespacio"], difficulty: 1,
    generate(r) {
      const a = r.nz(-3, 3), b = r.int(-3, 3), c = r.int(-3, 3), d = r.bool() ? 0 : r.nz(-5, 5);
      const truth = d === 0;
      return {
        prompt: `<b>Verdadero o falso:</b> $W = \\{(x, y, z) \\in \\mathbb{R}^3 : ${H.poly([[a, "x"], [b, "y"], [c, "z"]])} = ${d}\\}$ es un subespacio de $\\mathbb{R}^3$.`,
        answer: truth,
        explanation: truth ? `Es un plano que pasa por el origen: contiene al $\\vec 0$ y es cerrado para la suma y el producto por escalares.` : `No contiene al $\\vec 0$ (reemplazando da $0 \\neq ${d}$), así que no es [[al-espacio-vectorial|subespacio]].`,
        solution: [`$W$ es subespacio si $\\vec 0 \\in W$ y es cerrado para la suma y el producto por escalares.`],
        // verificación: chequeo numérico de clausura con dos elementos de W
        verify: { kind: "truth", fn: () => {
          const pt = (y, z) => [(d - b * y - c * z) / a, y, z], inW = p => Math.abs(a * p[0] + b * p[1] + c * p[2] - d) < 1e-9;
          const p1 = pt(1.3, -0.7), p2 = pt(-2.1, 0.4), s = p1.map((x, i) => x + p2[i]), m = p1.map(x => 2.5 * x);
          return inW(s) && inW(m) && inW([0, 0, 0]);
        } }
      };
    }
  };
  T["al-dim-num"] = {
    type: "numeric", concepts: ["al-base"], difficulty: 2,
    generate(r) {
      const n = r.pick([3, 4]), rk = r.int(1, Math.min(3, n)), k = r.int(rk, 4);
      const basis = echelonBasis(r, rk, n);
      const vs = basis.slice();
      while (vs.length < k) { const cs = basis.map(() => r.int(-2, 2)); vs.push(Array.from({ length: n }, (_, j) => basis.reduce((s, b, i) => s + cs[i] * b[j], 0))); }
      const sh = r.shuffle(vs);
      return {
        prompt: `¿Cuál es la dimensión del subespacio de $\\mathbb{R}^${n}$ generado por $${sh.map(vec).join(",\\ ")}$?`,
        answer: rk,
        solution: [`La [[al-base|dimensión]] del espacio generado es el rango de la matriz que tiene a esos vectores como filas.`, `Escalonando quedan $${rk}$ filas no nulas: dimensión $${rk}$.`],
        verify: { kind: "rank", A: sh }
      };
    }
  };
  T["al-coord-num"] = {
    type: "numeric", concepts: ["al-base"], difficulty: 2,
    generate(r) {
      const b1 = [r.int(-3, 3), r.int(-3, 3)], b2 = [r.int(-3, 3), r.int(-3, 3)];
      if (b1[0] * b2[1] - b1[1] * b2[0] === 0) return null;
      const c = [r.int(-4, 4), r.int(-4, 4)], v = [c[0] * b1[0] + c[1] * b2[0], c[0] * b1[1] + c[1] * b2[1]], k = r.int(0, 1);
      return {
        prompt: `En la base $B = \\{${vec(b1)}, ${vec(b2)}\\}$ de $\\mathbb{R}^2$, ¿cuál es la ${k === 0 ? "primera" : "segunda"} coordenada de $\\vec v = ${vec(v)}$?`,
        answer: c[k],
        solution: [`[[al-base|Coordenadas]]: buscamos $\\alpha, \\beta$ con $\\alpha${vec(b1)} + \\beta${vec(b2)} = ${vec(v)}$: un sistema de $2\\times2$.`, `Resolviendo: $(\\alpha, \\beta) = (${c.join(", ")})$.`],
        verify: { kind: "solve", A: [[b1[0], b2[0]], [b1[1], b2[1]]], b: v, x: c }
      };
    }
  };
  T["al-dist-num"] = {
    type: "numeric", concepts: ["al-euclideo"], difficulty: 1,
    generate(r) {
      const n = r.pick([2, 3, 4]), u = Array.from({ length: n }, () => r.int(-5, 5)), v = Array.from({ length: n }, () => r.int(-5, 5));
      const d = Math.sqrt(u.reduce((s, x, i) => s + (x - v[i]) ** 2, 0));
      if (d === 0) return null;
      return {
        prompt: `Calculá la distancia euclídea entre $${vec(u)}$ y $${vec(v)}$ en $\\mathbb{R}^${n}$.`,
        answer: d,
        solution: [`[[al-euclideo|Distancia]]: $d(\\vec u, \\vec v) = \\|\\vec u - \\vec v\\|$.`, `$= \\sqrt{${u.map((x, i) => `${H.par(x - v[i])}^2`).join(" + ")}} \\approx ${num(d, 4)}$.`],
        // verificación: ‖u − v‖² = ‖u‖² + ‖v‖² − 2 u·v
        verify: { kind: "value", fn: () => Math.sqrt(dot(u, u) + dot(v, v) - 2 * dot(u, v)) }
      };
    }
  };
  T["al-base-vf"] = {
    type: "tf", concepts: ["al-base"], difficulty: 1,
    generate(r) {
      const u = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)], v = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)];
      const dep = r.bool(), a = r.nz(-2, 2), c = r.nz(-2, 2);
      const w = dep ? u.map((x, i) => a * x + c * v[i]) : [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)];
      const cr = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      if (cr.every(x => x === 0)) return null;
      const d = detL([u, v, w]);
      return {
        prompt: `<b>Verdadero o falso:</b> $\\{${vec(u)}, ${vec(v)}, ${vec(w)}\\}$ es una base de $\\mathbb{R}^3$.`,
        answer: d !== 0,
        explanation: `Tres vectores de $\\mathbb{R}^3$ son [[al-base|base]] si y solo si son LI, o sea si el determinante que forman es distinto de $0$. Acá vale $${d}$.`,
        solution: [`En un espacio de dimensión $n$, $n$ vectores LI ya generan: son base.`],
        verify: { kind: "rank", A: [u, v, w], target: d !== 0 ? 3 : 2 }
      };
    }
  };

  const cards = {
    "al-espacio-vectorial": {
      title: "Espacios y subespacios vectoriales", aliases: ["espacio vectorial", "espacios vectoriales", "subespacio", "subespacios", "subespacio vectorial"], concepts: ["al-subespacio"],
      summary: "Un espacio vectorial es un conjunto donde se puede sumar y multiplicar por escalares con las propiedades usuales. W ⊆ V es subespacio si contiene a 0 y es cerrado.",
      def: [R`Un **espacio vectorial** real es un conjunto $V$ con una suma y un producto por escalares que cumplen los axiomas usuales (asociatividad, conmutatividad, neutro $\vec 0$, opuestos, distributivas, $1\cdot\vec v = \vec v$).`,
        R`$W \subseteq V$ es un **subespacio** si $\vec 0 \in W$, y $\vec u + \vec v \in W$ y $\alpha\vec u \in W$ para todo $\vec u, \vec v \in W$ y $\alpha \in \mathbb{R}$.`],
      idea: [R`Ejemplos: $\mathbb{R}^n$; las matrices $m\times n$; los polinomios de grado $\le n$; las funciones continuas en $[a,b]$. Lo que importa no es qué son los "vectores" sino que se puedan combinar linealmente.`,
        R`Los subespacios de $\mathbb{R}^3$ son: $\{\vec 0\}$, las rectas por el origen, los planos por el origen y todo $\mathbb{R}^3$. Un plano que **no** pasa por el origen no es subespacio.`],
      examples: [{ q: R`¿Es subespacio $\{(x, y) : y = x^2\}$?`, steps: [R`$(1, 1)$ está pero $2(1, 1) = (2, 2)$ no ($2 \neq 4$).`, R`No es cerrado para el producto por escalares: no es subespacio.`] }],
      see: ["al-base", "al-vectores"]
    },
    "al-base": {
      title: "Bases, dimensión y coordenadas", aliases: ["base de un espacio vectorial", "conjunto generador", "dimensión", "coordenadas en una base", "cambio de base", "base"], concepts: ["al-base"],
      summary: "Una base es un conjunto LI que genera. Todas las bases tienen la misma cantidad de vectores: la dimensión.",
      def: [R`$\{\vec v_1, \dots, \vec v_k\}$ **genera** $V$ si todo vector de $V$ es combinación lineal de ellos. Una **base** es un conjunto generador LI. Todas las bases de $V$ tienen la misma cantidad de elementos: la **dimensión** de $V$.`,
        R`**Coordenadas:** si $B = \{\vec b_1, \dots, \vec b_n\}$ es base, cada $\vec v$ se escribe de **una única** forma como $\vec v = \sum c_i\vec b_i$; los $c_i$ son sus coordenadas en $B$.`],
      idea: [R`La dimensión del espacio generado por unos vectores es el [[al-rouche|rango]] de la matriz que los tiene como filas: escalonando se ve cuántos son "realmente distintos".`,
        R`En un espacio de dimensión $n$: $n$ vectores LI ya son base; más de $n$ siempre son LD; menos de $n$ no generan. **Cambio de base:** pasar de coordenadas en una base a otra es multiplicar por una matriz inversible.`],
      examples: [{ q: R`Coordenadas de $(3, 1)$ en la base $\{(1, 1), (1, -1)\}$.`, steps: [R`$\alpha + \beta = 3$, $\alpha - \beta = 1$: $\alpha = 2$, $\beta = 1$.`] }],
      see: ["al-espacio-vectorial", "al-vectores", "al-rouche"]
    },
    "al-euclideo": {
      title: "Espacio euclídeo: Cauchy-Schwarz, Pitágoras y distancia", aliases: ["espacio euclídeo", "Cauchy-Schwarz", "desigualdad de Cauchy-Schwarz", "distancia euclídea", "base ortonormal", "teorema de Pitágoras generalizado"], concepts: ["al-euclideo"],
      summary: "Con un producto interno: |u·v| ≤ ‖u‖‖v‖, ‖u + v‖² = ‖u‖² + ‖v‖² si u ⊥ v, y d(u, v) = ‖u − v‖.",
      def: [R`Un **espacio euclídeo** es un espacio vectorial real con un producto interno (como el [[al-producto-escalar|producto escalar]] de $\mathbb{R}^n$).`,
        R`**Cauchy-Schwarz:** $|\vec u\cdot\vec v| \le \|\vec u\|\|\vec v\|$. **Pitágoras:** si $\vec u \perp \vec v$, $\|\vec u + \vec v\|^2 = \|\vec u\|^2 + \|\vec v\|^2$. **Distancia:** $d(\vec u, \vec v) = \|\vec u - \vec v\|$, que la vuelve un espacio métrico.`],
      idea: [R`Cauchy-Schwarz es lo que garantiza que $\frac{\vec u\cdot\vec v}{\|\vec u\|\|\vec v\|}$ esté entre $-1$ y $1$, así que el "ángulo" tiene sentido en cualquier dimensión. De ella sale la desigualdad triangular.`,
        R`Una **base ortonormal** (vectores de norma 1, ortogonales entre sí) hace todo fácil: las coordenadas son productos escalares, $c_i = \vec v\cdot\vec e_i$ (ver [[al-gram-schmidt]]).`],
      demo: [R`**Cauchy-Schwarz.** Para todo $t$: $0 \le \|\vec u + t\vec v\|^2 = \|\vec u\|^2 + 2t\,\vec u\cdot\vec v + t^2\|\vec v\|^2$.`, R`Una cuadrática en $t$ que nunca es negativa tiene discriminante $\le 0$: $4(\vec u\cdot\vec v)^2 - 4\|\vec u\|^2\|\vec v\|^2 \le 0$. $\blacksquare$`],
      examples: [{ q: R`Distancia entre $(1, 2, 3)$ y $(4, 6, 3)$.`, steps: [R`$\sqrt{9 + 16 + 0} = 5$.`] }],
      see: ["al-producto-escalar", "al-gram-schmidt"]
    }
  };

  E.extendCourse("m104", {
    concepts: { "al-subespacio": { name: "Subespacios" }, "al-base": { name: "Bases, dimensión y coordenadas" }, "al-euclideo": { name: "Espacio euclídeo" } },
    templates: T,
    units: [{
      id: "al-espacios-u", order: 4, program: "Unidad IV", title: "Espacios vectoriales", icon: "grid-3x3",
      diagnostic: ["al-subesp-vf", "al-dim-num", "al-coord-num"],
      lessons: [
        { id: "al-subespacios", title: "Subespacios", templates: ["al-subesp-vf", "al-base-vf"], theory: ["al-espacio-vectorial", "al-base"],
          intro: R`$W$ es subespacio si contiene a $\vec 0$ y es cerrado para la suma y el producto por escalares.` },
        { id: "al-bases", title: "Bases, dimensión y distancia", templates: ["al-dim-num", "al-coord-num", "al-dist-num"], theory: ["al-base", "al-euclideo"],
          intro: R`Base = LI + genera. Dimensión del espacio generado = rango. $d(\vec u, \vec v) = \|\vec u - \vec v\|$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD V · TRANSFORMACIONES LINEALES
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num, frac } = H;
  const T = {};
  const M = A => `\\begin{pmatrix} ${A.map(r => r.join(" & ")).join(" \\\\ ")} \\end{pmatrix}`;

  T["al-tl-vf"] = {
    type: "tf", concepts: ["al-tl"], difficulty: 1,
    generate(r) {
      const a = r.nz(-3, 3), b = r.int(-3, 3), c = r.int(-3, 3), d = r.nz(-3, 3), k = r.nz(-3, 3);
      const cases = [
        { t: `T(x, y) = (${H.poly([[a, "x"], [b, "y"]])},\\ ${H.poly([[c, "x"], [d, "y"]])})`, f: (x, y) => [a * x + b * y, c * x + d * y], lin: true },
        { t: `T(x, y) = (${H.poly([[a, "x"], [b, "y"]])},\\ ${H.poly([[c, "x"], [d, "y"], [k, ""]])})`, f: (x, y) => [a * x + b * y, c * x + d * y + k], lin: false },
        { t: `T(x, y) = (${H.term(a, "x^{2}", true)},\\ y)`, f: (x, y) => [a * x * x, y], lin: false },
        { t: `T(x, y) = (${H.term(a, "xy", true)},\\ ${H.term(d, "x", true)})`, f: (x, y) => [a * x * y, d * x], lin: false },
        { t: `T(x, y) = (${H.term(a, "y", true)},\\ ${H.poly([[k, "x"], [d, "y"]])})`, f: (x, y) => [a * y, k * x + d * y], lin: true }
      ];
      const c0 = r.pick(cases);
      return {
        prompt: `<b>Verdadero o falso:</b> $${c0.t}$ es una transformación lineal de $\\mathbb{R}^2$ en $\\mathbb{R}^2$.`,
        answer: c0.lin,
        explanation: c0.lin ? `Cada componente es una combinación lineal de $x$ e $y$ sin término constante: $T(\\vec u + \\vec v) = T(\\vec u) + T(\\vec v)$ y $T(\\alpha\\vec u) = \\alpha T(\\vec u)$.` : `No lo es: ${c0.t.includes("x^{2}") || c0.t.includes("xy") ? "hay términos no lineales (productos o potencias de las variables)" : `$T(0, 0) \\neq (0, 0)$ por el término constante`}.`,
        solution: [`[[al-transformacion|Lineal]] significa respetar sumas y productos por escalares. Atajo: $T(\\vec 0)$ tiene que ser $\\vec 0$, y no puede haber potencias ni productos de las variables.`],
        verify: { kind: "truth", fn: () => {
          const u = [1.3, -0.4], v = [-0.7, 2.2], s = 1.7;
          const T1 = c0.f(u[0] + v[0], u[1] + v[1]), T2 = c0.f(...u).map((x, i) => x + c0.f(...v)[i]), T3 = c0.f(s * u[0], s * u[1]), T4 = c0.f(...u).map(x => s * x);
          return T1.every((x, i) => Math.abs(x - T2[i]) < 1e-9) && T3.every((x, i) => Math.abs(x - T4[i]) < 1e-9);
        } }
      };
    }
  };
  const echelonBasis = (r, rk, n) => Array.from({ length: rk }, (_, i) => Array.from({ length: n }, (_, j) => (j < i ? 0 : j === i ? r.nz(-2, 2) : r.int(-2, 2))));
  T["al-nucleo-num"] = {
    type: "numeric", concepts: ["al-nucleo"], difficulty: 2,
    generate(r) {
      const m = r.pick([3, 4]), n = r.int(3, 5), rk = r.int(1, Math.min(m, n));
      const basis = echelonBasis(r, rk, n), rows = basis.slice();
      while (rows.length < m) { const cs = basis.map(() => r.int(-2, 2)); rows.push(Array.from({ length: n }, (_, j) => basis.reduce((s2, b2, i) => s2 + cs[i] * b2[j], 0))); }
      const A = r.shuffle(rows), ask = r.pick(["nuc", "img"]);
      return {
        prompt: `Sea $T: \\mathbb{R}^${n} \\to \\mathbb{R}^${m}$, $T(\\vec x) = A\\vec x$ con $A = ${M(A)}$. ¿Cuál es la dimensión ${ask === "nuc" ? "del núcleo" : "de la imagen"} de $T$?`,
        answer: ask === "nuc" ? n - rk : rk,
        solution: [
          `[[al-nucleo-imagen|Teorema de la dimensión]]: $\\dim N(T) + \\dim\\operatorname{Im}(T) = ${n}$ (dimensión del dominio).`,
          `$\\dim\\operatorname{Im}(T) = \\operatorname{rg}A = ${rk}$ (escalonando $A$).`,
          ask === "nuc" ? `$\\dim N(T) = ${n} - ${rk} = ${n - rk}$.` : `Respuesta: $${rk}$.`
        ],
        verify: ask === "nuc" ? { kind: "nullity", A } : { kind: "rank", A }
      };
    }
  };
  T["al-matriz-tl-num"] = {
    type: "numeric", concepts: ["al-matriz-tl"], difficulty: 2,
    generate(r) {
      const v = r.pick(["rot", "refl", "formula"]);
      let A, desc, f;
      if (v === "rot") { const th = r.pick([30, 45, 60, 90, 120, 180]), t = th * Math.PI / 180; A = [[Math.cos(t), -Math.sin(t)], [Math.sin(t), Math.cos(t)]]; desc = `la rotación de $${th}^\\circ$ en sentido antihorario`; f = (x, y) => { const rr = Math.hypot(x, y), a = Math.atan2(y, x) + t; return [rr * Math.cos(a), rr * Math.sin(a)]; }; }
      else if (v === "refl") { const k = r.pick(["x", "y", "yx"]); A = { x: [[1, 0], [0, -1]], y: [[-1, 0], [0, 1]], yx: [[0, 1], [1, 0]] }[k]; desc = { x: "la reflexión respecto del eje $x$", y: "la reflexión respecto del eje $y$", yx: "la reflexión respecto de la recta $y = x$" }[k]; f = { x: (x, y) => [x, -y], y: (x, y) => [-x, y], yx: (x, y) => [y, x] }[k]; }
      else { const a = r.int(-4, 4), b = r.int(-4, 4), c = r.int(-4, 4), d = r.int(-4, 4); A = [[a, b], [c, d]]; desc = `$T(x, y) = (${H.poly([[a, "x"], [b, "y"]])},\\ ${H.poly([[c, "x"], [d, "y"]])})$`; f = (x, y) => [a * x + b * y, c * x + d * y]; }
      const i = r.int(0, 1), j = r.int(0, 1);
      const ent = Math.abs(A[i][j]) < 1e-12 ? 0 : A[i][j];
      return {
        prompt: `Sea $T: \\mathbb{R}^2 \\to \\mathbb{R}^2$ ${desc}. ¿Cuál es el elemento $(${i + 1}, ${j + 1})$ de su matriz en la base canónica?`,
        answer: ent,
        solution: [`La [[al-matriz-asociada|matriz asociada]] tiene por columnas las imágenes de los vectores de la base: $T(1, 0)$ y $T(0, 1)$.`, `$T(1, 0) = (${num(A[0][0], 4)}, ${num(A[1][0], 4)})$ y $T(0, 1) = (${num(A[0][1], 4)}, ${num(A[1][1], 4)})$.`, `Elemento $(${i + 1}, ${j + 1})$: $${num(ent, 4)}$.`],
        // verificación: la columna j es la imagen del j-ésimo vector canónico calculada con la definición geométrica
        verify: { kind: "zero", fn: x => [x - f(j === 0 ? 1 : 0, j === 1 ? 1 : 0)[i]], tol: 1e-9 }
      };
    }
  };
  T["al-dimteo-mc"] = {
    type: "mc", concepts: ["al-nucleo"], difficulty: 1,
    generate(r) {
      const n = r.int(3, 6), m = r.int(2, 5), rk = r.int(1, Math.min(n, m));
      const A = Array.from({ length: m }, (_, i) => Array.from({ length: n }, (_, j) => (i < rk && i === j ? 1 : 0)));
      return {
        prompt: `$T: \\mathbb{R}^${n} \\to \\mathbb{R}^${m}$ es lineal y $\\dim\\operatorname{Im}(T) = ${rk}$. ¿Cuánto vale $\\dim N(T)$?`,
        ...H.mc(r, String(n - rk), [String(m - rk), String(rk), String(n), String(n + m - rk), String(Math.abs(n - m))], { fallback: ["0", "1", "2", "3", "4", "5", "6", "7"].filter(x => x !== String(n - rk)) }),
        solution: [`[[al-nucleo-imagen|Teorema de la dimensión]]: $\\dim N(T) + \\dim\\operatorname{Im}(T) = \\dim(\\text{dominio}) = ${n}$.`, `$\\dim N(T) = ${n} - ${rk} = ${n - rk}$.`],
        verify: { kind: "nullity", A, target: n - rk }
      };
    }
  };

  const cards = {
    "al-transformacion": {
      title: "Transformaciones lineales", aliases: ["transformación lineal", "transformaciones lineales", "aplicación lineal"], concepts: ["al-tl"],
      summary: "T es lineal si T(u + v) = T(u) + T(v) y T(αu) = αT(u). Toda T lineal entre ℝⁿ y ℝᵐ es multiplicar por una matriz.",
      def: [R`$T: V \to W$ es **lineal** si para todo $\vec u, \vec v$ y todo escalar $\alpha$: $$T(\vec u + \vec v) = T(\vec u) + T(\vec v), \qquad T(\alpha\vec u) = \alpha T(\vec u).$$ En particular $T(\vec 0) = \vec 0$.`],
      idea: [R`Una transformación lineal queda **determinada** por lo que les hace a los vectores de una base, porque todo lo demás es combinación lineal. Ejemplos: rotaciones, reflexiones, proyecciones, homotecias. También la [[derivada]] (en el espacio de polinomios) y la integral.`,
        R`$T$ es **inversible** si es biyectiva; su inversa también es lineal, y su matriz es la [[al-inversa|inversa]] de la matriz de $T$.`],
      examples: [{ q: R`¿Es lineal $T(x, y) = (x + 1, y)$?`, steps: [R`$T(0, 0) = (1, 0) \neq (0, 0)$: no es lineal (es una traslación).`] }],
      see: ["al-nucleo-imagen", "al-matriz-asociada"]
    },
    "al-nucleo-imagen": {
      title: "Núcleo, imagen y teorema de la dimensión", aliases: ["núcleo", "imagen de una transformación", "nulidad", "teorema de la dimensión"], concepts: ["al-nucleo"],
      summary: "N(T) = {v : T(v) = 0}, Im(T) = {T(v)}. dim N(T) + dim Im(T) = dim del dominio.",
      def: [R`**Núcleo:** $N(T) = \{\vec v : T(\vec v) = \vec 0\}$; su dimensión es la **nulidad**. **Imagen:** $\operatorname{Im}(T) = \{T(\vec v)\}$; su dimensión es el **rango** de $T$. Los dos son subespacios.`,
        R`**Teorema de la dimensión:** si $T: V \to W$ con $\dim V = n$, $$\dim N(T) + \dim\operatorname{Im}(T) = n.$$`],
      idea: [R`Con la matriz $A$ de $T$: la imagen está generada por las columnas de $A$ (dimensión $\operatorname{rg}A$) y el núcleo son las soluciones de $A\vec x = \vec 0$, con $n - \operatorname{rg}A$ parámetros libres ([[al-rouche|Rouché-Frobenius]]).`,
        R`$T$ es inyectiva si y solo si $N(T) = \{\vec 0\}$. Lo que "se pierde" en el núcleo es exactamente lo que le falta a la imagen para llenar las $n$ dimensiones.`],
      examples: [{ q: R`$T(x, y, z) = (x + y, y + z)$. ¿Dimensión del núcleo?`, steps: [R`$\operatorname{rg}\begin{pmatrix}1 & 1 & 0\\0 & 1 & 1\end{pmatrix} = 2$, así que $\dim\operatorname{Im} = 2$.`, R`$\dim N = 3 - 2 = 1$: es la recta generada por $(1, -1, 1)$.`] }],
      see: ["al-transformacion", "al-rouche", "al-base"]
    },
    "al-matriz-asociada": {
      title: "Matriz asociada y semejanza", aliases: ["matriz asociada", "matriz de una transformación", "matrices semejantes", "semejanza"], concepts: ["al-matriz-tl"],
      summary: "Las columnas de la matriz de T son las imágenes de los vectores de la base. Cambiar de base da una matriz semejante: P⁻¹AP.",
      def: [R`Si $B = \{\vec b_1, \dots, \vec b_n\}$ es base del dominio, la **matriz asociada** a $T$ tiene en la columna $j$ las coordenadas de $T(\vec b_j)$. Entonces $[T(\vec v)] = A[\vec v]$.`,
        R`Dos matrices son **semejantes** si $A' = P^{-1}AP$ con $P$ inversible: representan la misma transformación en bases distintas ($P$ es la matriz de cambio de base).`],
      idea: [R`Rotación de ángulo $\theta$: $\begin{pmatrix}\cos\theta & -\sin\theta\\\sin\theta & \cos\theta\end{pmatrix}$, porque $(1, 0) \mapsto (\cos\theta, \sin\theta)$ y $(0, 1) \mapsto (-\sin\theta, \cos\theta)$.`,
        R`Las matrices semejantes comparten determinante, traza y [[al-autovalores|autovalores]]: son propiedades de la transformación, no de la base. Elegir la base adecuada puede dejar una matriz diagonal ([[al-diagonalizacion]]).`],
      examples: [{ q: R`Matriz de la reflexión respecto de $y = x$.`, steps: [R`$(1, 0) \mapsto (0, 1)$ y $(0, 1) \mapsto (1, 0)$.`, R`$A = \begin{pmatrix}0 & 1\\1 & 0\end{pmatrix}$.`] }],
      see: ["al-transformacion", "al-diagonalizacion"]
    }
  };

  E.extendCourse("m104", {
    concepts: { "al-tl": { name: "Transformaciones lineales" }, "al-nucleo": { name: "Núcleo, imagen y dimensión" }, "al-matriz-tl": { name: "Matriz asociada" } },
    templates: T,
    units: [{
      id: "al-tl-u", order: 5, program: "Unidad V", title: "Transformaciones lineales", icon: "zap",
      diagnostic: ["al-tl-vf", "al-nucleo-num", "al-matriz-tl-num"],
      lessons: [
        { id: "al-tl", title: "Linealidad y matriz asociada", templates: ["al-tl-vf", "al-matriz-tl-num"], theory: ["al-transformacion", "al-matriz-asociada"],
          intro: R`$T$ lineal: respeta sumas y productos por escalares. La columna $j$ de su matriz es $T(\vec e_j)$.` },
        { id: "al-nucleo", title: "Núcleo, imagen y dimensión", templates: ["al-dimteo-mc", "al-nucleo-num"], theory: ["al-nucleo-imagen"],
          intro: R`$\dim N(T) + \dim\operatorname{Im}(T) = \dim(\text{dominio})$, y $\dim\operatorname{Im}(T) = \operatorname{rg}A$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD VI · AUTOVALORES Y AUTOVECTORES
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num, frac } = H;
  const T = {};
  const M = A => `\\begin{pmatrix} ${A.map(r => r.join(" & ")).join(" \\\\ ")} \\end{pmatrix}`;
  const vec = v => `(${v.join(", ")})`;
  const dot = (u, v) => u.reduce((s, x, i) => s + x * v[i], 0);
  // A = P D P^{-1} con P de determinante 1 (entradas enteras)
  function withEigen(r) {
    const [l1, l2] = r.distinct(2, -4, 5), p = r.int(-2, 2), q = r.int(-2, 2);
    const P = [[1, p], [q, 1 + p * q]], Pi = [[1 + p * q, -p], [-q, 1]];
    const PD = [[P[0][0] * l1, P[0][1] * l2], [P[1][0] * l1, P[1][1] * l2]];
    const A = [[PD[0][0] * Pi[0][0] + PD[0][1] * Pi[1][0], PD[0][0] * Pi[0][1] + PD[0][1] * Pi[1][1]], [PD[1][0] * Pi[0][0] + PD[1][1] * Pi[1][0], PD[1][0] * Pi[0][1] + PD[1][1] * Pi[1][1]]];
    return { A, l1, l2, v1: [P[0][0], P[1][0]], v2: [P[0][1], P[1][1]] };
  }

  T["al-eig-num"] = {
    type: "numeric", concepts: ["al-autovalores"], difficulty: 2,
    generate(r) {
      const { A, l1, l2 } = withEigen(r), ask = r.pick(["max", "min"]);
      const tr = A[0][0] + A[1][1], dt = A[0][0] * A[1][1] - A[0][1] * A[1][0];
      return {
        prompt: `¿Cuál es el autovalor **${ask === "max" ? "mayor" : "menor"}** de $A = ${M(A)}$?`,
        answer: ask === "max" ? Math.max(l1, l2) : Math.min(l1, l2),
        solution: [`[[al-autovalores|Polinomio característico]]: $\\det(A - \\lambda I) = \\lambda^2 - (\\operatorname{tr}A)\\lambda + \\det A = \\lambda^2 ${H.sg(-tr)}\\lambda ${H.sg(dt)}$.`, `Raíces: $\\lambda = ${l1}$ y $\\lambda = ${l2}$ (chequeo: suman la traza, $${tr}$, y multiplican el determinante, $${dt}$).`],
        verify: { kind: "eig", A, lambda: ask === "max" ? Math.max(l1, l2) : Math.min(l1, l2) }
      };
    }
  };
  T["al-eigvec-mc"] = {
    type: "mc", concepts: ["al-autovalores"], difficulty: 2,
    generate(r) {
      const { A, l1, v1, v2 } = withEigen(r);
      const isEig = w => { const Aw = [A[0][0] * w[0] + A[0][1] * w[1], A[1][0] * w[0] + A[1][1] * w[1]]; return Math.abs(Aw[0] * w[1] - Aw[1] * w[0]) < 1e-9; };
      const cands = [[1, 0], [0, 1], [1, 1], [1, -1], [2, 1], [1, 2], [-1, 2], [2, -1]].filter(w => !isEig(w)).map(vec);
      return {
        prompt: `¿Cuál de estos vectores es un **autovector** de $A = ${M(A)}$?`,
        ...H.mc(r, vec(v1), cands),
        solution: [`$\\vec v$ es [[al-autovalores|autovector]] si $A\\vec v = \\lambda\\vec v$ para algún $\\lambda$: o sea, si $A\\vec v$ es paralelo a $\\vec v$.`, `$A${vec(v1)} = ${vec([A[0][0] * v1[0] + A[0][1] * v1[1], A[1][0] * v1[0] + A[1][1] * v1[1]])} = ${l1}\\cdot${vec(v1)}$.`, `Los otros no cumplen eso.`],
        verify: { kind: "eig", A, lambda: l1, v: v1 }
      };
    }
  };
  T["al-diag-vf"] = {
    type: "tf", concepts: ["al-diagonalizacion"], difficulty: 2,
    generate(r) {
      const a = r.int(-4, 4), b = r.nz(-3, 3), v = r.pick(["distintos", "jordan", "simetrica", "escalar"]);
      let A, why, truth;
      if (v === "distintos") { const w = withEigen(r); A = w.A; truth = true; why = `Tiene dos autovalores distintos ($${w.l1}$ y $${w.l2}$): sus autovectores son LI y forman base.`; }
      else if (v === "jordan") { A = [[a, b], [0, a]]; truth = false; why = `Su único autovalor es $${a}$, pero $${a === 0 ? "A" : a < 0 ? `A + ${-a}I` : `A - ${a}I`}$ tiene rango $1$: solo hay una dirección de autovectores, no alcanza para una base.`; }
      else if (v === "simetrica") { A = [[a, b], [b, a + r.int(-2, 2)]]; truth = true; why = `Es **simétrica**: toda matriz simétrica real es diagonalizable (incluso con una base ortonormal).`; }
      else { A = [[a, 0], [0, a]]; truth = true; why = `Ya es diagonal.`; }
      return {
        prompt: `<b>Verdadero o falso:</b> $${M(A)}$ es diagonalizable.`,
        answer: truth, explanation: why,
        solution: [`$A$ ($n\\times n$) es [[al-diagonalizacion|diagonalizable]] si y solo si tiene $n$ autovectores LI.`],
        // verificación: cuenta de autovectores LI = suma de (n − rango(A − λI)) sobre los autovalores
        verify: { kind: "truth", fn: () => {
          const tr = A[0][0] + A[1][1], dt = A[0][0] * A[1][1] - A[0][1] * A[1][0], disc = tr * tr - 4 * dt;
          if (disc < -1e-12) return false;
          const ls = disc > 1e-12 ? [(tr + Math.sqrt(disc)) / 2, (tr - Math.sqrt(disc)) / 2] : [tr / 2];
          const rank2 = B => (B.every(row => row.every(x => Math.abs(x) < 1e-9)) ? 0 : Math.abs(B[0][0] * B[1][1] - B[0][1] * B[1][0]) < 1e-9 ? 1 : 2);
          return ls.reduce((s, l) => s + 2 - rank2([[A[0][0] - l, A[0][1]], [A[1][0], A[1][1] - l]]), 0) === 2;
        } }
      };
    }
  };
  T["al-gs-num"] = {
    type: "numeric", concepts: ["al-gram-schmidt"], difficulty: 2,
    generate(r) {
      const u1 = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)], u2 = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)], k = r.int(0, 2);
      const d11 = dot(u1, u1);
      if (d11 === 0) return null;
      const c = dot(u2, u1) / d11, w = u2.map((x, i) => x - c * u1[i]);
      if (w.every(x => Math.abs(x) < 1e-9)) return null;
      return {
        prompt: `Aplicando Gram-Schmidt a $\\vec u_1 = ${vec(u1)}$, $\\vec u_2 = ${vec(u2)}$ (sin normalizar), el segundo vector es $\\vec w_2 = \\vec u_2 - \\operatorname{proy}_{\\vec u_1}\\vec u_2$. ¿Cuánto vale su componente $${"xyz"[k]}$?`,
        answer: w[k], answerTex: frac(u2[k] * d11 - dot(u2, u1) * u1[k], d11),
        solution: [`[[al-gram-schmidt|Gram-Schmidt]]: $\\vec w_2 = \\vec u_2 - \\frac{\\vec u_2\\cdot\\vec u_1}{\\vec u_1\\cdot\\vec u_1}\\vec u_1 = \\vec u_2 ${dot(u2, u1) < 0 ? "+" : "-"} ${frac(Math.abs(dot(u2, u1)), d11)}\\,\\vec u_1$.`, `Componente $${"xyz"[k]}$: $${u2[k]} - \\left(${frac(dot(u2, u1), d11)}\\right)\\cdot${H.par(u1[k])} = ${frac(u2[k] * d11 - dot(u2, u1) * u1[k], d11)}$.`],
        // verificación: con esa componente, w₂ tiene que ser ortogonal a u₁ (y estar en el plano de u₁, u₂)
        verify: { kind: "zero", fn: x => { const ww = w.slice(); ww[k] = x; const n = [u1[1] * u2[2] - u1[2] * u2[1], u1[2] * u2[0] - u1[0] * u2[2], u1[0] * u2[1] - u1[1] * u2[0]]; return [dot(ww, u1), dot(ww, n)]; } }
      };
    }
  };

  const cards = {
    "al-autovalores": {
      title: "Autovalores y autovectores", aliases: ["autovalor", "autovalores", "autovector", "autovectores", "valor propio", "vector propio", "polinomio característico"], concepts: ["al-autovalores"],
      summary: "A v = λ v con v ≠ 0. Los autovalores son las raíces de det(A − λI) = 0.",
      def: [R`$\lambda$ es **autovalor** de $A$ si existe $\vec v \neq \vec 0$ con $A\vec v = \lambda\vec v$; ese $\vec v$ es un **autovector**. Los autovalores son las raíces del **polinomio característico** $p(\lambda) = \det(A - \lambda I)$.`,
        R`Para $2\times2$: $p(\lambda) = \lambda^2 - (\operatorname{tr}A)\lambda + \det A$. En general, la suma de los autovalores es la traza y el producto, el determinante.`],
      idea: [R`Un autovector es una dirección que $A$ no gira: solo la estira o encoge (por $\lambda$). Para encontrarlos: primero los $\lambda$ (raíces del polinomio característico) y después, para cada uno, el núcleo de $A - \lambda I$.`,
        R`Aparecen en todos lados: modos normales de oscilación, ejes principales de inercia, estados estacionarios, mecánica cuántica (los valores medibles son autovalores).`],
      examples: [{ q: R`Autovalores de $\begin{pmatrix}2 & 1\\1 & 2\end{pmatrix}$.`, steps: [R`$\lambda^2 - 4\lambda + 3 = 0$: $\lambda = 1$ y $\lambda = 3$.`, R`Autovectores: $(1, -1)$ para $1$ y $(1, 1)$ para $3$.`] }],
      see: ["al-diagonalizacion", "al-determinante", "al-nucleo-imagen"]
    },
    "al-diagonalizacion": {
      title: "Diagonalización", aliases: ["diagonalización", "diagonalizable", "diagonalizar", "diagonalización ortogonal"], concepts: ["al-diagonalizacion"],
      summary: "A = P D P⁻¹ (D diagonal) ⟺ A tiene n autovectores LI. Las simétricas siempre se diagonalizan con P ortogonal.",
      def: [R`$A$ es **diagonalizable** si existe $P$ inversible con $P^{-1}AP = D$ diagonal. Las columnas de $P$ son autovectores y la diagonal de $D$, los autovalores.`,
        R`Criterio: $A$ ($n\times n$) es diagonalizable $\iff$ tiene $n$ autovectores LI. Alcanza (no es necesario) con tener $n$ autovalores distintos.`,
        R`**Matrices simétricas** ($A^T = A$): sus autovalores son reales, autovectores de autovalores distintos son ortogonales, y se diagonalizan con una $P$ **ortogonal** ($P^{-1} = P^T$).`],
      idea: [R`Diagonalizar es elegir una base de autovectores, donde $A$ actúa por separado en cada eje. Así las potencias son fáciles: $A^k = PD^kP^{-1}$.`,
        R`Contraejemplo clásico: $\begin{pmatrix}a & 1\\0 & a\end{pmatrix}$ tiene un solo autovalor y una sola dirección de autovectores: no es diagonalizable.`],
      examples: [{ q: R`Calculá $A^{10}$ con $A = PDP^{-1}$ y $D = \operatorname{diag}(1, 2)$.`, steps: [R`$A^{10} = P\,\operatorname{diag}(1, 1024)\,P^{-1}$.`] }],
      see: ["al-autovalores", "al-matriz-asociada", "al-gram-schmidt"]
    },
    "al-gram-schmidt": {
      title: "Proyecciones ortogonales y Gram-Schmidt", aliases: ["Gram-Schmidt", "proceso de Gram-Schmidt", "proyección ortogonal", "proyecciones ortogonales", "ortonormalizar"], concepts: ["al-gram-schmidt"],
      summary: "A cada vector se le resta su proyección sobre los anteriores: wₖ = uₖ − Σ proy_{wᵢ} uₖ. Normalizando sale una base ortonormal.",
      def: [R`**Gram-Schmidt:** dada una base $\{\vec u_1, \dots, \vec u_k\}$: $$\vec w_1 = \vec u_1, \qquad \vec w_j = \vec u_j - \sum_{i<j}\frac{\vec u_j\cdot\vec w_i}{\vec w_i\cdot\vec w_i}\vec w_i.$$ Los $\vec w_j$ son ortogonales y generan lo mismo; dividiendo por sus normas, se obtiene una base ortonormal.`],
      idea: [R`Cada paso le saca al vector nuevo "la parte que ya estaba" en las direcciones anteriores (su [[al-producto-escalar|proyección]]), y queda solo lo perpendicular.`,
        R`La **proyección ortogonal** de $\vec v$ sobre un subespacio con base ortonormal $\{\vec e_i\}$ es $\sum(\vec v\cdot\vec e_i)\vec e_i$: el punto del subespacio más cercano a $\vec v$ (la base de los mínimos cuadrados).`],
      examples: [{ q: R`Ortogonalizá $(1, 1)$ y $(1, 0)$.`, steps: [R`$\vec w_2 = (1, 0) - \frac{1}{2}(1, 1) = \left(\frac12, -\frac12\right)$.`, R`Chequeo: $(1, 1)\cdot\left(\frac12, -\frac12\right) = 0$ ✓.`] }],
      see: ["al-euclideo", "al-producto-escalar", "al-diagonalizacion"]
    }
  };

  E.extendCourse("m104", {
    concepts: { "al-autovalores": { name: "Autovalores y autovectores" }, "al-diagonalizacion": { name: "Diagonalización" }, "al-gram-schmidt": { name: "Gram-Schmidt" } },
    templates: T,
    units: [{
      id: "al-autovalores-u", order: 6, program: "Unidad VI", title: "Autovalores y autovectores", icon: "sparkles",
      diagnostic: ["al-eig-num", "al-eigvec-mc", "al-gs-num"],
      lessons: [
        { id: "al-autovalores", title: "Autovalores y autovectores", templates: ["al-eig-num", "al-eigvec-mc"], theory: ["al-autovalores"],
          intro: R`$A\vec v = \lambda\vec v$. Los $\lambda$ son raíces de $\det(A - \lambda I) = 0$; en $2\times2$, $\lambda^2 - \operatorname{tr}A\,\lambda + \det A$.` },
        { id: "al-diagonalizacion", title: "Diagonalización y Gram-Schmidt", templates: ["al-diag-vf", "al-gs-num"], theory: ["al-diagonalizacion", "al-gram-schmidt"],
          intro: R`Diagonalizable si y solo si hay $n$ autovectores LI. Las simétricas siempre lo son, con base ortonormal (Gram-Schmidt).` }
      ]
    }],
    cards
  });
})();
