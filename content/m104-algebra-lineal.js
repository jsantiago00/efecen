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
      demo: [R`**Paso 1 (LD implica que alguno es combinación de los otros).** Si los vectores son LD, por definición hay una combinación $\alpha_1\vec v_1 + \dots + \alpha_k\vec v_k = \vec 0$ con algún coeficiente distinto de $0$. Renumerando los vectores, podemos suponer que ese coeficiente es $\alpha_1$.`,
        R`**Paso 2.** Dejamos $\alpha_1\vec v_1$ solo de un lado, pasando los demás términos al otro, y dividimos por $\alpha_1$, cosa que se puede porque $\alpha_1 \neq 0$: $$\vec v_1 = -\frac{\alpha_2}{\alpha_1}\vec v_2 - \dots - \frac{\alpha_k}{\alpha_1}\vec v_k.$$ Así, $\vec v_1$ es combinación lineal de los otros.`,
        R`**Paso 3 (la recíproca).** Supongamos ahora que $\vec v_1 = \beta_2\vec v_2 + \dots + \beta_k\vec v_k$. Restamos $\vec v_1$ de los dos lados y queda $$1\cdot\vec v_1 - \beta_2\vec v_2 - \dots - \beta_k\vec v_k = \vec 0.$$ Es una combinación que da $\vec 0$ y **no es trivial**, porque el coeficiente de $\vec v_1$ es $1$. Entonces los vectores son LD. $\blacksquare$`,
        R`**Paso 4 (dos vectores).** Con $k = 2$, «alguno es combinación de los otros» quiere decir $\vec u = \beta\vec v$ o $\vec v = \beta\vec u$: uno es múltiplo del otro. Eso es ser paralelos. El caso en que alguno es $\vec 0$ entra acá, porque $\vec 0 = 0\cdot\vec v$.`],
      examples: [{ q: R`¿Son LI $(1, 2)$ y $(2, 4)$?`, steps: [R`$(2, 4) = 2(1, 2)$: son LD (paralelos).`] }],
      see: ["al-producto-escalar", "al-base", "al-determinante"]
    },
    "al-producto-escalar": {
      title: "Producto escalar, norma, ángulo y proyección", aliases: ["producto escalar", "producto punto", "producto interno", "norma", "ortogonales", "vectores ortogonales", "proyección escalar", "proyección vectorial"], concepts: ["al-escalar"],
      summary: "u·v = Σ uᵢvᵢ = ‖u‖‖v‖cos θ. Ortogonales ⟺ u·v = 0. proy_v u = (u·v / v·v) v.",
      def: [R`$\vec u\cdot\vec v = \sum u_iv_i$. **Norma:** $\|\vec u\| = \sqrt{\vec u\cdot\vec u}$. **Ángulo:** $\cos\theta = \frac{\vec u\cdot\vec v}{\|\vec u\|\|\vec v\|}$.`,
        R`$\vec u \perp \vec v \iff \vec u\cdot\vec v = 0$. **Proyección** de $\vec u$ sobre $\vec v$: $\text{proy}_{\vec v}\vec u = \frac{\vec u\cdot\vec v}{\vec v\cdot\vec v}\vec v$, y la componente escalar es $\frac{\vec u\cdot\vec v}{\|\vec v\|}$.`],
      idea: [R`El producto escalar mide "cuánto apunta uno en la dirección del otro". En física es el [[f1-trabajo|trabajo]]: $W = \vec F\cdot\Delta\vec r$. Un vector normado (de norma 1) se obtiene dividiendo por la norma.`],
      demo: [R`**Paso 1 (el triángulo).** Dibujamos $\vec u$ y $\vec v$ saliendo del mismo punto, con un ángulo $\theta$ entre ellos. El tercer lado del triángulo va de la punta de $\vec v$ a la punta de $\vec u$, así que es el vector $\vec u - \vec v$.`,
        R`**Paso 2 (geometría).** El teorema del coseno relaciona los tres lados con el ángulo $\theta$: $$\|\vec u - \vec v\|^2 = \|\vec u\|^2 + \|\vec v\|^2 - 2\|\vec u\|\|\vec v\|\cos\theta.$$`,
        R`**Paso 3 (álgebra).** Calculamos el mismo lado de otra forma. La norma al cuadrado es el producto escalar de un vector consigo mismo, y el producto escalar es distributivo y simétrico ($\vec u\cdot\vec v = \vec v\cdot\vec u$): $$\|\vec u - \vec v\|^2 = (\vec u - \vec v)\cdot(\vec u - \vec v) = \|\vec u\|^2 - 2\,\vec u\cdot\vec v + \|\vec v\|^2.$$`,
        R`**Paso 4.** Igualamos las dos expresiones. Los términos $\|\vec u\|^2$ y $\|\vec v\|^2$ aparecen en las dos y se cancelan; queda $-2\,\vec u\cdot\vec v = -2\|\vec u\|\|\vec v\|\cos\theta$. Dividiendo por $-2$: $$\vec u\cdot\vec v = \|\vec u\|\|\vec v\|\cos\theta. \quad\blacksquare$$`,
        R`**Paso 5 (proyección).** Buscamos el múltiplo $c\,\vec v$ que hace que lo que sobra, $\vec u - c\,\vec v$, sea perpendicular a $\vec v$. Pedimos que el producto escalar dé $0$ y usamos la distributividad: $(\vec u - c\,\vec v)\cdot\vec v = \vec u\cdot\vec v - c\,\vec v\cdot\vec v = 0$. Despejando, $c = \frac{\vec u\cdot\vec v}{\vec v\cdot\vec v}$, que es el coeficiente de la fórmula de la proyección.`],
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
      demo: [R`**Paso 1 (producto mixto).** Desarrollamos el determinante de filas $\vec u$, $\vec v$, $\vec w$ por la primera fila (Laplace): $$u_1(v_2w_3 - v_3w_2) - u_2(v_1w_3 - v_3w_1) + u_3(v_1w_2 - v_2w_1).$$ Los tres paréntesis, con sus signos, son justamente las componentes de $\vec v\times\vec w$. Así que la suma es $\vec u\cdot(\vec v\times\vec w)$.`,
        R`**Paso 2 (perpendicular a los dos).** Por el paso anterior, $\vec u\cdot(\vec u\times\vec v)$ es un determinante con dos filas iguales ($\vec u$, $\vec u$, $\vec v$), y eso vale $0$. Lo mismo $\vec v\cdot(\vec u\times\vec v)$, con filas $\vec v$, $\vec u$, $\vec v$. Producto escalar $0$ es ser perpendiculares. Y como intercambiar dos filas cambia el signo del determinante, también sale $\vec v\times\vec u = -\vec u\times\vec v$.`,
        R`**Paso 3 (Lagrange, el lado derecho).** Multiplicamos $\|\vec u\|^2\|\vec v\|^2 = \sum_i u_i^2\sum_j v_j^2$, que tiene todos los términos $u_i^2v_j^2$. A eso le restamos $(\vec u\cdot\vec v)^2 = \sum_i u_i^2v_i^2 + 2\sum_{i<j}u_iv_iu_jv_j$. Los términos con $i = j$ se cancelan, y agrupando los pares $i < j$ queda $$\|\vec u\|^2\|\vec v\|^2 - (\vec u\cdot\vec v)^2 = \sum_{i<j}\big(u_i^2v_j^2 + u_j^2v_i^2 - 2u_iv_ju_jv_i\big) = \sum_{i<j}(u_iv_j - u_jv_i)^2.$$`,
        R`**Paso 4 (Lagrange, el lado izquierdo).** Los tres cuadrados $(u_1v_2 - u_2v_1)^2$, $(u_1v_3 - u_3v_1)^2$ y $(u_2v_3 - u_3v_2)^2$ son, salvo el signo de adentro, las tres componentes de $\vec u\times\vec v$ al cuadrado. Su suma es $\|\vec u\times\vec v\|^2$. Eso prueba la identidad de Lagrange. $\blacksquare$`,
        R`**Paso 5 (módulo y área).** En Lagrange reemplazamos $\vec u\cdot\vec v = \|\vec u\|\|\vec v\|\cos\theta$ ([[al-producto-escalar]]): $$\|\vec u\times\vec v\|^2 = \|\vec u\|^2\|\vec v\|^2(1 - \cos^2\theta) = \|\vec u\|^2\|\vec v\|^2\sin^2\theta.$$ Como $\theta \in [0, \pi]$, $\sin\theta \ge 0$ y podemos sacar la raíz: $\|\vec u\times\vec v\| = \|\vec u\|\|\vec v\|\sin\theta$. Es base por altura del paralelogramo: base $\|\vec u\|$, altura $\|\vec v\|\sin\theta$. $\blacksquare$`],
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
      demo: [R`**Paso 1 (transpuesta del producto, lado izquierdo).** La transpuesta intercambia filas y columnas: el elemento $(i, j)$ de $M^T$ es el $(j, i)$ de $M$. Con la definición del producto: $$\big((AB)^T\big)_{ij} = (AB)_{ji} = \sum_k a_{jk}b_{ki}.$$`,
        R`**Paso 2 (lado derecho).** Aplicamos la definición del producto a $B^T$ por $A^T$ y después la de transpuesta en cada factor: $$(B^TA^T)_{ij} = \sum_k (B^T)_{ik}(A^T)_{kj} = \sum_k b_{ki}a_{jk}.$$`,
        R`**Paso 3.** Como los números conmutan, $b_{ki}a_{jk} = a_{jk}b_{ki}$: las dos sumas son iguales término a término, para todo $i$ y $j$. Entonces $(AB)^T = B^TA^T$. $\blacksquare$`,
        R`**Paso 4 (asociatividad).** Aplicamos dos veces la definición del producto. Para $(AB)C$ primero armamos $AB$ y después multiplicamos por $C$; para $A(BC)$, al revés: $$\big((AB)C\big)_{ij} = \sum_l\Big(\sum_k a_{ik}b_{kl}\Big)c_{lj}, \qquad \big(A(BC)\big)_{ij} = \sum_k a_{ik}\Big(\sum_l b_{kl}c_{lj}\Big).$$`,
        R`**Paso 5.** Distribuyendo, las dos son la suma de $a_{ik}b_{kl}c_{lj}$ sobre todos los pares $(k, l)$. Las sumas son finitas, así que el orden en que se suma no importa. Por eso $(AB)C = A(BC)$. $\blacksquare$`,
        R`**Paso 6 (no conmuta).** Para ver que una propiedad **no** vale en general alcanza con un contraejemplo. Con $A = \begin{pmatrix}0 & 1\\0 & 0\end{pmatrix}$ y $B = \begin{pmatrix}0 & 0\\1 & 0\end{pmatrix}$ queda $AB = \begin{pmatrix}1 & 0\\0 & 0\end{pmatrix}$ pero $BA = \begin{pmatrix}0 & 0\\0 & 1\end{pmatrix}$. Y además $A\cdot A = 0$ aunque $A \neq 0$.`],
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
      demo: [R`**Paso 1 ($\det(kA) = k^n\det A$).** Si desarrollamos por Laplace por una fila, cada término tiene exactamente un factor de esa fila. Por eso multiplicar una fila por $k$ multiplica el determinante por $k$. La matriz $kA$ es $A$ con **cada una** de sus $n$ filas multiplicada por $k$: aplicando eso $n$ veces, el determinante queda multiplicado por $k^n$.`,
        R`**Paso 2 (triangular).** Si $A$ es triangular superior, su primera columna es $(a_{11}, 0, \dots, 0)$. Desarrollando por esa columna, solo sobrevive el término de $a_{11}$: $\det A = a_{11}\det A'$, donde $A'$ es lo que queda al borrar la primera fila y la primera columna. $A'$ es triangular de orden $n - 1$, así que repetimos hasta llegar a $1\times1$: $\det A = a_{11}a_{22}\cdots a_{nn}$.`,
        R`**Paso 3 (fila repetida).** Si las filas $i$ y $j$ son iguales, intercambiarlas deja la matriz igual. Pero intercambiar dos filas cambia el signo del determinante. Entonces $\det A = -\det A$, o sea $2\det A = 0$, y $\det A = 0$.`,
        R`**Paso 4 (sumar un múltiplo de otra fila).** El determinante es lineal en cada fila: si la fila $i$ es una suma, el determinante se parte en dos (se ve desarrollando por esa fila). Si cambiamos la fila $\vec f_i$ por $\vec f_i + k\vec f_j$, queda el determinante original más $k$ veces el de una matriz que tiene $\vec f_j$ en las filas $i$ y $j$. Ese segundo vale $0$ por el paso 3, así que el determinante no cambia.`,
        R`**Paso 5 (área en el plano).** El paralelogramo de lados $(a, b)$ y $(c, d)$ tiene el mismo área si pensamos los vectores en $\mathbb{R}^3$ con tercera coordenada $0$. Ahí el área es la norma del [[al-producto-vectorial|producto vectorial]]: $(a, b, 0)\times(c, d, 0) = (0, 0, ad - bc)$. Su norma es $|ad - bc| = |\det A|$.`],
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
      demo: [R`**Paso 1 (fórmula $2\times2$).** Multiplicamos $A$ por la matriz candidata, sin el factor: $$\begin{pmatrix}a & b\\c & d\end{pmatrix}\begin{pmatrix}d & -b\\-c & a\end{pmatrix} = \begin{pmatrix}ad - bc & 0\\0 & ad - bc\end{pmatrix} = (ad - bc)\,I.$$ En el otro orden la cuenta da lo mismo. Dividiendo por $ad - bc \neq 0$ obtenemos $I$, así que esa es la inversa.`,
        R`**Paso 2 (si $A$ es inversible, $\det A \neq 0$).** Tomamos determinante en $AA^{-1} = I$ y usamos que el determinante de un producto es el producto de los determinantes: $\det A\cdot\det A^{-1} = \det I = 1$. Un producto que da $1$ no puede tener un factor $0$. De paso, $\det A^{-1} = \frac{1}{\det A}$.`,
        R`**Paso 3 (si $\det A \neq 0$, la adjunta da la inversa).** El elemento $(i, k)$ de $A\operatorname{adj}(A)$ es $\sum_j a_{ij}C_{kj}$, con $C_{kj}$ los cofactores (la adjunta es la transpuesta de los cofactores). Si $i = k$, es el desarrollo de Laplace de $\det A$ por la fila $i$. Si $i \neq k$, es el desarrollo por la fila $k$ de la matriz que tiene la fila $i$ de $A$ copiada en el lugar de la $k$: tiene dos filas iguales y vale $0$. Así que $A\operatorname{adj}(A) = (\det A)\,I$, y dividiendo por $\det A$ sale $A^{-1} = \frac{1}{\det A}\operatorname{adj}(A)$.`,
        R`**Paso 4 ($(AB)^{-1} = B^{-1}A^{-1}$).** Para ver que una matriz es la inversa alcanza con multiplicar y obtener $I$. Usamos la asociatividad para agrupar los del medio: $$(AB)(B^{-1}A^{-1}) = A(BB^{-1})A^{-1} = AIA^{-1} = AA^{-1} = I,$$ y en el otro orden es igual. Intuitivamente: para deshacer «primero $B$, después $A$» hay que deshacer primero $A$.`,
        R`**Paso 5 ($(A^T)^{-1} = (A^{-1})^T$).** Transponemos $AA^{-1} = I$ usando $(XY)^T = Y^TX^T$ ([[al-matrices]]) y que $I^T = I$: queda $(A^{-1})^TA^T = I$. Transponiendo $A^{-1}A = I$ sale $A^T(A^{-1})^T = I$. Así, $(A^{-1})^T$ es la inversa de $A^T$. $\blacksquare$`],
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
      demo: [R`**Paso 1 (no se pierden soluciones).** Si $\vec x$ cumple todas las ecuaciones, también cumple las nuevas. Intercambiar dos ecuaciones no cambia cuáles son. Multiplicar la igualdad $E_1$ por $k$ da otra igualdad verdadera. Y sumar dos igualdades verdaderas, $E_2$ y $kE_1$, da otra verdadera.`,
        R`**Paso 2 (no aparecen soluciones nuevas).** Cada operación se deshace con otra del mismo tipo: volver a intercambiar, multiplicar por $\frac1k$ (por eso se pide $k \neq 0$) o restar $kE_1$. Aplicando el paso 1 a la operación inversa, toda solución del sistema nuevo es solución del viejo. Los conjuntos de soluciones son iguales. $\blacksquare$`,
        R`**Paso 3 (homogéneo, mirado por columnas).** Si $\vec a_1, \dots, \vec a_n$ son las columnas de $A$, la componente $i$ de $A\vec x$ es $a_{i1}x_1 + \dots + a_{in}x_n$, que es la componente $i$ de $x_1\vec a_1 + \dots + x_n\vec a_n$. Entonces $$A\vec x = x_1\vec a_1 + \dots + x_n\vec a_n.$$`,
        R`**Paso 4.** $\vec x = \vec 0$ siempre es solución de $A\vec x = \vec 0$. Una solución $\vec x \neq \vec 0$ es, por el paso 3, una combinación lineal **no trivial** de las columnas que da $\vec 0$. Eso es exactamente que las columnas sean LD.`,
        R`**Paso 5.** Si $A$ es cuadrada, que sus columnas sean LD equivale a $\det A = 0$ (ver [[al-determinante]]; las columnas de $A$ son las filas de $A^T$, y $\det A^T = \det A$).`],
      examples: [{ q: R`Resolvé $x + y = 3$, $x - y = 1$.`, steps: [R`Restando: $2y = 2$, así que $y = 1$ y $x = 2$.`] }],
      see: ["al-rouche", "al-cramer", "al-inversa"]
    },
    "al-rouche": {
      title: "Rango y teorema de Rouché-Frobenius", aliases: ["Rouché-Frobenius", "Rouché", "rango", "rango de una matriz", "compatible determinado", "compatible indeterminado", "incompatible"], concepts: ["al-rouche"],
      summary: "Compatible ⟺ rg A = rg [A|b]; y si además ese rango es n, la solución es única.",
      def: [R`El **rango** de una matriz es la cantidad de filas no nulas en su forma escalonada (= máximo número de filas o de columnas LI).`,
        R`**Rouché-Frobenius** para $A\vec x = \vec b$ con $n$ incógnitas:<br>• Si $\operatorname{rg}A \neq \operatorname{rg}[A\mid b]$: **incompatible**.<br>• Si $\operatorname{rg}A = \operatorname{rg}[A\mid b] = n$: **compatible determinado**.<br>• Si $\operatorname{rg}A = \operatorname{rg}[A\mid b] < n$: **compatible indeterminado**, con $n - \operatorname{rg}A$ parámetros libres.`],
      idea: [R`Si al escalonar aparece una fila $(0\ 0\ \cdots\ 0 \mid c)$ con $c \neq 0$, eso dice "$0 = c$": imposible. Cada incógnita sin pivote es un parámetro libre.`],
      demo: [R`**Paso 1 (mirar por columnas).** Escribimos $A\vec x = x_1\vec a_1 + \dots + x_n\vec a_n$, con $\vec a_j$ las columnas de $A$. Resolver el sistema es buscar coeficientes que armen $\vec b$ con las columnas. Hay solución si y solo si $\vec b$ es combinación lineal de las columnas.`,
        R`**Paso 2 (compatibilidad).** El rango cuenta cuántas columnas LI hay, o sea, la dimensión del espacio que generan. Si $\vec b$ es combinación de las columnas, agregarla no amplía ese espacio, así que $\operatorname{rg}[A\mid b] = \operatorname{rg}A$. Si no lo es, aporta una dirección nueva y $\operatorname{rg}[A\mid b] = \operatorname{rg}A + 1$. Por lo tanto: compatible $\iff \operatorname{rg}A = \operatorname{rg}[A\mid b]$.`,
        R`**Paso 3 (contar parámetros).** Supongamos que es compatible y escalonamos. Hay $r = \operatorname{rg}A$ filas no nulas, cada una con su pivote. Las $n - r$ incógnitas sin pivote se pueden elegir libremente: ninguna ecuación las fija.`,
        R`**Paso 4.** Elegidas esas, resolvemos hacia atrás: cada fila no nula despeja su incógnita pivote en función de las que están a su derecha, que ya conocemos. Así cada elección de los parámetros da exactamente una solución.`,
        R`**Paso 5.** Si $r = n$, no hay parámetros y la solución es única (compatible determinado). Si $r < n$, hay al menos un parámetro, que puede tomar infinitos valores: infinitas soluciones (compatible indeterminado), con $n - r$ parámetros. $\blacksquare$`],
      examples: [{ q: R`$x + y = 1$, $2x + 2y = 3$.`, steps: [R`Restando el doble de la primera: $0 = 1$.`, R`$\operatorname{rg}A = 1 < \operatorname{rg}[A\mid b] = 2$: incompatible (rectas paralelas).`] }],
      see: ["al-sistemas", "al-base", "al-nucleo-imagen"]
    },
    "al-cramer": {
      title: "Regla de Cramer", aliases: ["regla de Cramer", "Cramer"], concepts: ["al-cramer"],
      summary: "Si det A ≠ 0: xᵢ = det(Aᵢ)/det A, con Aᵢ la matriz A con la columna i reemplazada por b.",
      def: [R`Si $A$ es cuadrada con $\det A \neq 0$, la solución única de $A\vec x = \vec b$ es $$x_i = \frac{\det A_i}{\det A},$$ donde $A_i$ es $A$ con la columna $i$ reemplazada por $\vec b$.`],
      idea: [R`Es elegante y útil para sistemas chicos o para estudiar cómo depende la solución de un parámetro. Para sistemas grandes, Gauss es mucho más eficiente.`],
      demo: [R`**Paso 1.** Como $\det A \neq 0$, $A$ es inversible y el sistema tiene una única solución $\vec x$. Mirando $A\vec x$ por columnas ([[al-sistemas]]), eso dice que $$\vec b = x_1\vec a_1 + \dots + x_n\vec a_n.$$`,
        R`**Paso 2.** $A_i$ es $A$ con $\vec b$ en la columna $i$. El determinante es lineal en cada columna (igual que en cada fila, porque $\det A^T = \det A$). Reemplazamos $\vec b$ por la suma del paso 1 y la abrimos: $$\det A_i = \sum_j x_j\det(\vec a_1, \dots, \underbrace{\vec a_j}_{\text{lugar } i}, \dots, \vec a_n).$$`,
        R`**Paso 3.** Si $j \neq i$, esa matriz tiene la columna $\vec a_j$ dos veces (en el lugar $i$ y en el $j$), así que su determinante es $0$. Solo sobrevive el término $j = i$, que es la matriz $A$ original: $\det A_i = x_i\det A$.`,
        R`**Paso 4.** Dividimos por $\det A \neq 0$: $x_i = \dfrac{\det A_i}{\det A}$. $\blacksquare$`],
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
      demo: [R`**Paso 1 (en cualquier espacio, $0\cdot\vec u = \vec 0$).** Como $0 = 0 + 0$, por la distributiva $0\cdot\vec u = (0 + 0)\vec u = 0\cdot\vec u + 0\cdot\vec u$. Sumando el opuesto de $0\cdot\vec u$ a los dos lados queda $\vec 0 = 0\cdot\vec u$.`,
        R`**Paso 2 (el $\vec 0$ tiene que estar).** Si $W$ tiene algún vector $\vec u$ y es cerrado por producto por escalares, contiene a $0\cdot\vec u$, que por el paso 1 es $\vec 0$. Por eso el plano $x + y + z = 1$ no es subespacio: $(0, 0, 0)$ no cumple la ecuación.`,
        R`**Paso 3 (por qué alcanzan esas condiciones).** Los demás axiomas (asociatividad, conmutatividad, distributivas…) valen para todos los vectores de $V$, así que en particular valen dentro de $W$. Y el opuesto de $\vec u$ es $(-1)\vec u$, que está en $W$ por ser cerrado. Lo único que hay que chequear es que las operaciones no se salgan de $W$.`,
        R`**Paso 4 (un plano por el origen sí es subespacio).** Sea $W = \{(x, y, z) : ax + by + cz = 0\}$. El $\vec 0$ cumple la ecuación. Si $\vec u$ y $\vec v$ la cumplen, $\vec u + \vec v$ también, porque el lado izquierdo se reparte: $a(u_1 + v_1) + b(u_2 + v_2) + c(u_3 + v_3) = 0 + 0 = 0$. Y para $\alpha\vec u$ el lado izquierdo queda multiplicado por $\alpha$: $\alpha\cdot 0 = 0$.`,
        R`**Paso 5 (una recta por el origen).** Es $\{t\,\vec d : t \in \mathbb{R}\}$. Sumar dos de sus puntos da $s\vec d + t\vec d = (s + t)\vec d$, y multiplicar por $\alpha$ da $(\alpha t)\vec d$: siguen siendo múltiplos de $\vec d$, así que siguen en la recta.`],
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
      demo: [R`**Paso 1 (las coordenadas son únicas).** Si $\vec v = \sum c_i\vec b_i = \sum c_i'\vec b_i$, restamos las dos expresiones: $\sum(c_i - c_i')\vec b_i = \vec 0$. Como la base es LI, la única combinación que da $\vec 0$ es la trivial, así que $c_i - c_i' = 0$ para todo $i$.`,
        R`**Paso 2 (más de $n$ vectores son LD).** Sean $\vec v_1, \dots, \vec v_k$ en $\mathbb{R}^n$ con $k > n$. Buscar $\alpha_i$ con $\sum\alpha_i\vec v_i = \vec 0$ es un sistema homogéneo: $n$ ecuaciones (una por componente) y $k$ incógnitas. Tiene a lo sumo $n$ pivotes, así que quedan al menos $k - n \ge 1$ parámetros libres y hay soluciones no triviales ([[al-rouche]]). En un espacio cualquiera de dimensión $n$ se hace lo mismo con las coordenadas en una base.`,
        R`**Paso 3 (agregar un vector de afuera mantiene la independencia).** Si $\vec v_1, \dots, \vec v_m$ son LI y $\vec w$ no es combinación de ellos, supongamos $\sum\alpha_i\vec v_i + \beta\vec w = \vec 0$. Si fuera $\beta \neq 0$, podríamos despejar $\vec w$ como combinación de los $\vec v_i$, y no se puede. Entonces $\beta = 0$, y por ser LI los $\vec v_i$, todos los $\alpha_i$ son $0$.`,
        R`**Paso 4 ($n$ vectores LI generan).** Si no generaran, habría un $\vec w$ que no es combinación de ellos, y por el paso 3 los $n + 1$ vectores $\vec v_1, \dots, \vec v_n, \vec w$ serían LI. Eso contradice el paso 2.`,
        R`**Paso 5 (menos de $n$ no generan).** Supongamos que $k < n$ vectores $\vec g_1, \dots, \vec g_k$ generan $V$. Cada vector de una base de $n$ elementos se escribe $\vec b_i = \sum_j m_{ji}\vec g_j$. Para que $\sum_i\alpha_i\vec b_i = \vec 0$ alcanza con que el coeficiente de cada $\vec g_j$ sea $0$: $k$ ecuaciones con $n$ incógnitas, que tiene solución no trivial como en el paso 2. Entonces la base sería LD, lo cual es absurdo. De acá sale también que todas las bases tienen la misma cantidad de vectores. $\blacksquare$`],
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
      demo: [R`**Paso 1 (Cauchy-Schwarz: armar una cuadrática).** Si $\vec v = \vec 0$, los dos lados valen $0$. Si no, miramos $\|\vec u + t\vec v\|^2$, que es $\ge 0$ para todo número real $t$ porque es una norma al cuadrado. Lo desarrollamos con la distributividad y la simetría del producto interno: $$0 \le \|\vec u + t\vec v\|^2 = \|\vec u\|^2 + 2t\,\vec u\cdot\vec v + t^2\|\vec v\|^2.$$`,
        R`**Paso 2.** Es una cuadrática en $t$ con coeficiente principal $\|\vec v\|^2 > 0$, y nunca es negativa. Entonces no puede tener dos raíces reales distintas (entre ellas sería negativa), así que su discriminante es $\le 0$: $$4(\vec u\cdot\vec v)^2 - 4\|\vec u\|^2\|\vec v\|^2 \le 0.$$`,
        R`**Paso 3.** Dividiendo por $4$, $(\vec u\cdot\vec v)^2 \le \|\vec u\|^2\|\vec v\|^2$. Los dos lados son $\ge 0$, así que podemos sacar raíz: $|\vec u\cdot\vec v| \le \|\vec u\|\|\vec v\|$. $\blacksquare$`,
        R`**Paso 4 (Pitágoras).** Desarrollando igual que en el paso 1, con $t = 1$: $\|\vec u + \vec v\|^2 = \|\vec u\|^2 + 2\,\vec u\cdot\vec v + \|\vec v\|^2$. Si $\vec u \perp \vec v$, el término del medio es $0$ y queda $\|\vec u\|^2 + \|\vec v\|^2$. $\blacksquare$`,
        R`**Paso 5 (desigualdad triangular).** En la misma expansión acotamos el término del medio con Cauchy-Schwarz, $\vec u\cdot\vec v \le \|\vec u\|\|\vec v\|$: $$\|\vec u + \vec v\|^2 \le \|\vec u\|^2 + 2\|\vec u\|\|\vec v\| + \|\vec v\|^2 = \big(\|\vec u\| + \|\vec v\|\big)^2.$$ Sacando raíz, $\|\vec u + \vec v\| \le \|\vec u\| + \|\vec v\|$. Para la distancia, escribimos $\vec u - \vec w = (\vec u - \vec v) + (\vec v - \vec w)$ y sale $d(\vec u, \vec w) \le d(\vec u, \vec v) + d(\vec v, \vec w)$. $\blacksquare$`],
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
      demo: [R`**Paso 1 ($T(\vec 0) = \vec 0$).** Escribimos $\vec 0 = 0\cdot\vec 0$ y usamos la segunda condición con $\alpha = 0$: $T(\vec 0) = T(0\cdot\vec 0) = 0\cdot T(\vec 0) = \vec 0$, porque cero por cualquier vector es el vector nulo. Por eso una traslación $T(\vec v) = \vec v + \vec c$ con $\vec c \neq \vec 0$ no es lineal: manda $\vec 0$ a $\vec c$.`,
        R`**Paso 2 (queda determinada por una base).** Si $\{\vec b_1, \dots, \vec b_n\}$ es base, todo $\vec v$ se escribe $\vec v = \sum c_i\vec b_i$. Usando la primera condición para separar la suma y la segunda para sacar cada escalar: $$T(\vec v) = T\Big(\sum c_i\vec b_i\Big) = \sum c_i\,T(\vec b_i).$$`,
        R`**Paso 3.** El lado derecho solo usa los $T(\vec b_i)$ y las coordenadas de $\vec v$. Así que si dos transformaciones lineales coinciden en los vectores de una base, coinciden en todos los vectores.`,
        R`**Paso 4 (la inversa respeta la suma).** Si $T$ es biyectiva, sean $\vec u = T(\vec x)$ y $\vec v = T(\vec y)$, o sea $\vec x = T^{-1}(\vec u)$ e $\vec y = T^{-1}(\vec v)$. Por linealidad de $T$, $T(\vec x + \vec y) = \vec u + \vec v$, y aplicando $T^{-1}$: $$T^{-1}(\vec u + \vec v) = \vec x + \vec y = T^{-1}(\vec u) + T^{-1}(\vec v).$$`,
        R`**Paso 5 (y los escalares).** Igual, $T(\alpha\vec x) = \alpha\vec u$, así que $T^{-1}(\alpha\vec u) = \alpha\vec x = \alpha\,T^{-1}(\vec u)$. Entonces $T^{-1}$ es lineal. $\blacksquare$`],
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
      demo: [R`**Paso 1 (el núcleo es un subespacio).** Como $T(\vec 0) = \vec 0$, el $\vec 0$ está en $N(T)$. Si $T(\vec u) = T(\vec v) = \vec 0$, por linealidad $T(\vec u + \vec v) = \vec 0 + \vec 0 = \vec 0$ y $T(\alpha\vec u) = \alpha\vec 0 = \vec 0$: la suma y los múltiplos siguen en el núcleo.`,
        R`**Paso 2 (la imagen también).** $\vec 0 = T(\vec 0)$ está en la imagen. Si dos vectores de $W$ son $T(\vec x)$ y $T(\vec y)$, su suma es $T(\vec x + \vec y)$ y $\alpha T(\vec x) = T(\alpha\vec x)$: siguen siendo imágenes de algo.`,
        R`**Paso 3 (inyectiva $\iff N(T) = \{\vec 0\}$).** Si $T(\vec u) = T(\vec v)$, restando y usando linealidad, $T(\vec u - \vec v) = \vec 0$, o sea $\vec u - \vec v \in N(T)$. Si el núcleo es solo $\vec 0$, sale $\vec u = \vec v$: $T$ es inyectiva. Al revés, si $T$ es inyectiva, como $T(\vec 0) = \vec 0$, ningún otro vector puede ir a $\vec 0$.`,
        R`**Paso 4 (teorema de la dimensión: el armado).** Tomamos una base $\{\vec k_1, \dots, \vec k_r\}$ de $N(T)$ y la completamos a una base de $V$ con $\vec u_1, \dots, \vec u_s$, donde $r + s = n$. Se puede: mientras no generen $V$, agregamos un vector de afuera, y siguen siendo LI ([[al-base]]). Vamos a ver que $T(\vec u_1), \dots, T(\vec u_s)$ es base de la imagen.`,
        R`**Paso 5 (generan la imagen).** Todo $\vec v$ se escribe $\vec v = \sum a_i\vec k_i + \sum b_j\vec u_j$. Aplicamos $T$: los $T(\vec k_i)$ son $\vec 0$ porque están en el núcleo, y queda $T(\vec v) = \sum b_j T(\vec u_j)$.`,
        R`**Paso 6 (son LI).** Si $\sum b_j T(\vec u_j) = \vec 0$, por linealidad $T\big(\sum b_j\vec u_j\big) = \vec 0$, así que $\sum b_j\vec u_j$ está en el núcleo y se escribe $\sum a_i\vec k_i$. Pasando todo a un lado, $\sum a_i\vec k_i - \sum b_j\vec u_j = \vec 0$. Como la base completa de $V$ es LI, todos los coeficientes son $0$; en particular los $b_j$.`,
        R`**Paso 7.** La imagen tiene una base de $s$ vectores, así que $\dim\operatorname{Im}(T) = s = n - r = n - \dim N(T)$. $\blacksquare$`],
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
      demo: [R`**Paso 1 ($[T(\vec v)] = A[\vec v]$).** Escribimos $\vec v = \sum c_j\vec b_j$, así que $[\vec v] = (c_1, \dots, c_n)$. Por linealidad, $T(\vec v) = \sum c_j T(\vec b_j)$.`,
        R`**Paso 2.** Tomar coordenadas también es lineal: las coordenadas de una suma son la suma de las coordenadas (por la unicidad de las coordenadas, [[al-base]]). Entonces $[T(\vec v)] = \sum c_j\,[T(\vec b_j)]$, y $[T(\vec b_j)]$ es, por definición, la columna $j$ de $A$.`,
        R`**Paso 3.** Multiplicar una matriz por un vector es combinar sus columnas con las componentes del vector como coeficientes ([[al-sistemas]]). Así que $\sum c_j\cdot(\text{columna } j) = A[\vec v]$. $\blacksquare$`,
        R`**Paso 4 (cambio de base).** Sea $P$ la matriz cuyas columnas son las coordenadas de la base nueva en la vieja; entonces $[\vec v]_{\text{vieja}} = P[\vec v]_{\text{nueva}}$, y $P$ es inversible. Para calcular $T$ en la base nueva, pasamos a la vieja, aplicamos $A$ y volvemos: $$[T(\vec v)]_{\text{nueva}} = P^{-1}A\,P\,[\vec v]_{\text{nueva}}.$$ La matriz de $T$ en la base nueva es $P^{-1}AP$.`,
        R`**Paso 5 (mismo determinante).** Usamos que el determinante de un producto es el producto de los determinantes, y que $\det P^{-1} = \frac{1}{\det P}$: $$\det(P^{-1}AP) = \frac{1}{\det P}\,\det A\,\det P = \det A.$$`,
        R`**Paso 6 (mismo polinomio característico).** Como $I = P^{-1}IP$, podemos meter $\lambda I$ adentro: $P^{-1}AP - \lambda I = P^{-1}(A - \lambda I)P$. Por el paso 5 aplicado a $A - \lambda I$, $\det(P^{-1}AP - \lambda I) = \det(A - \lambda I)$. Mismo polinomio, mismas raíces: mismos autovalores y misma traza. $\blacksquare$`],
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
      demo: [R`**Paso 1 (pasar a un sistema homogéneo).** Escribimos $\lambda\vec v = \lambda I\vec v$ y pasamos todo a un lado: $A\vec v = \lambda\vec v$ es lo mismo que $$(A - \lambda I)\vec v = \vec 0.$$`,
        R`**Paso 2.** Buscamos $\vec v \neq \vec 0$, o sea una solución no trivial de ese sistema homogéneo. Para una matriz cuadrada eso pasa si y solo si $\det(A - \lambda I) = 0$ ([[al-sistemas]]). Por eso los autovalores son las raíces del polinomio característico.`,
        R`**Paso 3 (el caso $2\times2$).** Calculamos el determinante y ordenamos por potencias de $\lambda$: $$\det\begin{pmatrix}a - \lambda & b\\c & d - \lambda\end{pmatrix} = (a - \lambda)(d - \lambda) - bc = \lambda^2 - (a + d)\lambda + (ad - bc).$$ El coeficiente de $\lambda$ es $-\operatorname{tr}A$ y el término independiente, $\det A$.`,
        R`**Paso 4 (suma y producto).** Si las raíces son $\lambda_1$ y $\lambda_2$ (reales o complejas), el polinomio mónico se factoriza $(\lambda - \lambda_1)(\lambda - \lambda_2) = \lambda^2 - (\lambda_1 + \lambda_2)\lambda + \lambda_1\lambda_2$. Comparando coeficientes con el paso 3: $\lambda_1 + \lambda_2 = \operatorname{tr}A$ y $\lambda_1\lambda_2 = \det A$.`,
        R`**Paso 5 (en general).** Para $n\times n$, $p(\lambda) = (-1)^n(\lambda - \lambda_1)\cdots(\lambda - \lambda_n)$. Evaluando en $\lambda = 0$: $p(0) = \det A = \lambda_1\cdots\lambda_n$. Y $\lambda^{n-1}$ solo aparece en el producto de la diagonal (los otros términos del determinante usan a lo sumo $n - 2$ elementos de la diagonal); comparando ese coeficiente, $\lambda_1 + \dots + \lambda_n = \operatorname{tr}A$. $\blacksquare$`],
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
      demo: [R`**Paso 1.** Multiplicando por $P$ a izquierda, $P^{-1}AP = D$ equivale a $AP = PD$. Comparamos columna por columna.`,
        R`**Paso 2 (las columnas de $P$ son autovectores).** La columna $j$ de $AP$ es $A\vec p_j$. Multiplicar por la diagonal $D$ a derecha multiplica cada columna de $P$ por su elemento: la columna $j$ de $PD$ es $d_j\vec p_j$. Entonces $A\vec p_j = d_j\vec p_j$, y $\vec p_j \neq \vec 0$ porque $P$ es inversible. Al revés, si hay $n$ autovectores LI, los ponemos como columnas: $P$ es inversible (columnas LI) y $AP = PD$. Eso prueba el criterio.`,
        R`**Paso 3 (potencias).** De $A = PDP^{-1}$: $A^2 = PD\,(P^{-1}P)\,DP^{-1} = PD^2P^{-1}$, porque el $P^{-1}P$ del medio es $I$. Lo mismo pasa con cada factor que se agrega: $A^k = PD^kP^{-1}$. Y $D^k$ es elevar cada elemento de la diagonal a la $k$.`,
        R`**Paso 4 (autovalores distintos dan autovectores LI).** Sean $A\vec u = \lambda\vec u$, $A\vec v = \mu\vec v$ con $\lambda \neq \mu$, y supongamos $\alpha\vec u + \beta\vec v = \vec 0$. Aplicando $A$: $\alpha\lambda\vec u + \beta\mu\vec v = \vec 0$. Multiplicando la original por $\lambda$: $\alpha\lambda\vec u + \beta\lambda\vec v = \vec 0$. Restando queda $\beta(\mu - \lambda)\vec v = \vec 0$; como $\mu \neq \lambda$ y $\vec v \neq \vec 0$, $\beta = 0$, y entonces $\alpha\vec u = \vec 0$ da $\alpha = 0$. Con más autovectores se repite el argumento por inducción.`,
        R`**Paso 5 (simétricas: autovectores ortogonales).** Escribiendo el producto escalar como $\vec x\cdot\vec y = \vec x^T\vec y$ y usando $(A\vec u)^T = \vec u^TA^T$ con $A^T = A$: $(A\vec u)\cdot\vec v = \vec u^TA\vec v = \vec u\cdot(A\vec v)$. Si $\vec u$ y $\vec v$ son autovectores de $\lambda \neq \mu$, eso da $\lambda\,\vec u\cdot\vec v = \mu\,\vec u\cdot\vec v$, o sea $(\lambda - \mu)\,\vec u\cdot\vec v = 0$, y por lo tanto $\vec u\cdot\vec v = 0$. $\blacksquare$ (Que los autovalores sean reales y que siempre alcance una $P$ ortogonal es el teorema espectral, que necesita más herramientas.)`],
      examples: [{ q: R`Calculá $A^{10}$ con $A = PDP^{-1}$ y $D = \operatorname{diag}(1, 2)$.`, steps: [R`$A^{10} = P\,\operatorname{diag}(1, 1024)\,P^{-1}$.`] }],
      see: ["al-autovalores", "al-matriz-asociada", "al-gram-schmidt"]
    },
    "al-gram-schmidt": {
      title: "Proyecciones ortogonales y Gram-Schmidt", aliases: ["Gram-Schmidt", "proceso de Gram-Schmidt", "proyección ortogonal", "proyecciones ortogonales", "ortonormalizar"], concepts: ["al-gram-schmidt"],
      summary: "A cada vector se le resta su proyección sobre los anteriores: wₖ = uₖ − Σ proy_{wᵢ} uₖ. Normalizando sale una base ortonormal.",
      def: [R`**Gram-Schmidt:** dada una base $\{\vec u_1, \dots, \vec u_k\}$: $$\vec w_1 = \vec u_1, \qquad \vec w_j = \vec u_j - \sum_{i<j}\frac{\vec u_j\cdot\vec w_i}{\vec w_i\cdot\vec w_i}\vec w_i.$$ Los $\vec w_j$ son ortogonales y generan lo mismo; dividiendo por sus normas, se obtiene una base ortonormal.`],
      idea: [R`Cada paso le saca al vector nuevo "la parte que ya estaba" en las direcciones anteriores (su [[al-producto-escalar|proyección]]), y queda solo lo perpendicular.`,
        R`La **proyección ortogonal** de $\vec v$ sobre un subespacio con base ortonormal $\{\vec e_i\}$ es $\sum(\vec v\cdot\vec e_i)\vec e_i$: el punto del subespacio más cercano a $\vec v$ (la base de los mínimos cuadrados).`],
      demo: [R`**Paso 1 (ortogonalidad: planteo).** Lo probamos por inducción: supongamos que $\vec w_1, \dots, \vec w_{j-1}$ ya son ortogonales entre sí, y veamos que $\vec w_j$ es ortogonal a cada uno. Tomamos $l < j$ y hacemos el producto escalar de la fórmula de $\vec w_j$ con $\vec w_l$, repartiéndolo en cada término de la suma.`,
        R`**Paso 2.** En la suma, los términos con $i \neq l$ tienen el factor $\vec w_i\cdot\vec w_l = 0$, por la hipótesis inductiva. Solo sobrevive $i = l$, y se simplifica: $$\vec w_j\cdot\vec w_l = \vec u_j\cdot\vec w_l - \frac{\vec u_j\cdot\vec w_l}{\vec w_l\cdot\vec w_l}\,\vec w_l\cdot\vec w_l = \vec u_j\cdot\vec w_l - \vec u_j\cdot\vec w_l = 0.$$`,
        R`**Paso 3 (generan lo mismo).** Cada $\vec w_j$ es $\vec u_j$ menos una combinación de $\vec w_1, \dots, \vec w_{j-1}$, que a su vez son combinaciones de $\vec u_1, \dots, \vec u_{j-1}$. Y al revés, $\vec u_j$ es $\vec w_j$ más esa combinación. Así, los primeros $j$ vectores de cada lista generan el mismo subespacio.`,
        R`**Paso 4 (ningún $\vec w_j$ es $\vec 0$).** Si lo fuera, $\vec u_j$ sería igual a una combinación de los $\vec w$ anteriores, o sea de los $\vec u$ anteriores, y la base no sería LI. Esto garantiza que nunca dividimos por $\vec w_l\cdot\vec w_l = 0$ y que podemos normalizar. $\blacksquare$`,
        R`**Paso 5 (la proyección deja un resto perpendicular).** Sea $\vec p = \sum_i(\vec v\cdot\vec e_i)\vec e_i$. Para cada $k$, como $\vec e_i\cdot\vec e_k$ vale $1$ si $i = k$ y $0$ si no, $$(\vec v - \vec p)\cdot\vec e_k = \vec v\cdot\vec e_k - \vec v\cdot\vec e_k = 0.$$ Siendo ortogonal a cada $\vec e_k$, $\vec v - \vec p$ es ortogonal a todo el subespacio.`,
        R`**Paso 6 (es el punto más cercano).** Si $\vec q$ es otro punto del subespacio, escribimos $\vec v - \vec q = (\vec v - \vec p) + (\vec p - \vec q)$. El segundo sumando está en el subespacio, así que es perpendicular al primero, y por [[al-euclideo|Pitágoras]] $$\|\vec v - \vec q\|^2 = \|\vec v - \vec p\|^2 + \|\vec p - \vec q\|^2 \ge \|\vec v - \vec p\|^2.$$ $\blacksquare$`],
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
