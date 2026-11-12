/*
 * M203 · Álgebra Lineal — Lic. en Ciencias Básicas (FCEN, UNCuyo), Plan Ord. 77/15 C.S.
 * ==========================================================================================
 * Es la continuación abstracta de M104 (Introducción al Álgebra Lineal). Temario del programa 2025-2026
 * (ver docs/orientaciones.md) y de los parciales y finales de 2020 y 2021 de Apunteca (docs/parciales/m203.md):
 *   1 Espacios vectoriales y subespacios · 2 Transformaciones lineales · 3 Espacio dual
 *   4 Diagonalización y polinomio minimal · 5 Producto interno y operadores · 6 Formas canónicas · 7 Formas bilineales
 * Lo que ya está en M104 (autovalores, Gram-Schmidt, teorema espectral, Jordan, Cayley-Hamilton) se enlaza y no se repite.
 *
 * Biblioteca E.a2: rango, núcleo, determinante y sistemas por eliminación de Gauss, productos y formato de matrices.
 * Ids con prefijo "a2-". Todo el texto y los ejercicios son originales.
 */
(function () {
  const E = window.Efecen, H = E.H;
  E.registerCourse({ id: "m203", code: "M203", title: "Álgebra Lineal", icon: "grid-3x3" });
  const A = E.a2 = {};
  const clone = M => M.map(r => r.slice());
  // forma escalonada reducida por filas: devuelve { R, piv } (las columnas pivote)
  A.rref = M0 => {
    const M = clone(M0), rows = M.length, cols = M[0].length, piv = [];
    let r = 0;
    for (let c = 0; c < cols && r < rows; c++) {
      let p = r;
      for (let i = r + 1; i < rows; i++) if (Math.abs(M[i][c]) > Math.abs(M[p][c])) p = i;
      if (Math.abs(M[p][c]) < 1e-9) continue;
      [M[p], M[r]] = [M[r], M[p]];
      const d = M[r][c];
      for (let k = 0; k < cols; k++) M[r][k] /= d;
      for (let i = 0; i < rows; i++) if (i !== r) { const f = M[i][c]; if (f) for (let k = 0; k < cols; k++) M[i][k] -= f * M[r][k]; }
      piv.push(c); r++;
    }
    return { R: M, piv };
  };
  A.rank = M => A.rref(M).piv.length;
  // base del núcleo de M (vectores columna, como filas de la salida)
  A.kernel = M => {
    const { R, piv } = A.rref(M), n = M[0].length, free = [];
    for (let c = 0; c < n; c++) if (!piv.includes(c)) free.push(c);
    return free.map(f => { const v = Array(n).fill(0); v[f] = 1; piv.forEach((c, i) => { v[c] = -R[i][f]; }); return v; });
  };
  A.det = M0 => {
    const M = clone(M0), n = M.length;
    let d = 1;
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let i = c + 1; i < n; i++) if (Math.abs(M[i][c]) > Math.abs(M[p][c])) p = i;
      if (Math.abs(M[p][c]) < 1e-12) return 0;
      if (p !== c) { [M[p], M[c]] = [M[c], M[p]]; d = -d; }
      d *= M[c][c];
      for (let i = c + 1; i < n; i++) { const f = M[i][c] / M[c][c]; for (let k = c; k < n; k++) M[i][k] -= f * M[c][k]; }
    }
    return d;
  };
  // determinante por desarrollo de Laplace (otro camino que la eliminación; para matrices chicas de enteros)
  A.detL = M => (M.length === 1 ? M[0][0] : M[0].reduce((s, x, j) => s + (j % 2 ? -1 : 1) * x * A.detL(M.slice(1).map(r => r.filter((_, k) => k !== j))), 0));
  A.mul = (P, Q) => P.map(row => Q[0].map((_, j) => row.reduce((s, a, k) => s + a * Q[k][j], 0)));
  A.vec = (M, x) => M.map(row => row.reduce((s, a, k) => s + a * x[k], 0));
  A.T = M => M[0].map((_, j) => M.map(r => r[j]));
  A.eye = n => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  // solución de M x = b (M cuadrada inversible)
  A.solve = (M, b) => { const { R } = A.rref(M.map((r, i) => r.concat([b[i]]))); return R.map(r => r[r.length - 1]); };
  A.inv = M => { const n = M.length, { R } = A.rref(M.map((r, i) => r.concat(A.eye(n)[i]))); return R.map(r => r.slice(n)); };
  // formato
  A.dn = (x, d = 3) => String(H.num(x, d)).replace(".", "{,}");
  A.v = a => `(${a.map(x => A.dn(x)).join(",\\ ")})`;
  A.pm = M => `\\begin{pmatrix} ${M.map(r => r.map(x => (typeof x === "string" ? x : A.dn(x))).join(" & ")).join(" \\\\ ")} \\end{pmatrix}`;
  // polinomio a + bx + cx² + … (coeficientes de menor a mayor grado) en TeX
  A.pol = (c, v = "x") => H.poly(c.map((k, i) => [k, i === 0 ? "" : i === 1 ? v : `${v}^{${i}}`]).reverse());
  // matriz de enteros inversible (determinante ±1 o chico) de n × n, armada con operaciones elementales
  A.unimod = (r, n, steps = 4) => {
    const M = A.eye(n);
    for (let s = 0; s < steps; s++) { const [i, j] = r.distinct(2, 0, n - 1), k = r.nz(-2, 2); for (let c = 0; c < n; c++) M[i][c] += k * M[j][c]; }
    return M;
  };
})();

/* =====================================================================
 *  UNIDAD 1 · ESPACIOS VECTORIALES, SUBESPACIOS, SUMA DIRECTA Y COORDENADAS
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, A = E.a2;
  const T = {};

  // subconjuntos de R³ (o de polinomios y matrices, vistos por sus coeficientes): ¿son subespacios?
  const SUBS = [
    r => { const [a, b, c] = [r.nz(-3, 3), r.nz(-3, 3), r.nz(-3, 3)]; return { ok: true, t: `$\\{(x, y, z) \\in \\mathbb R^3 : ${H.poly([[a, "x"], [b, "y"], [c, "z"]])} = 0\\}$`, in: v => Math.abs(a * v[0] + b * v[1] + c * v[2]) < 1e-9, gen: [[b, -a, 0], [c, 0, -a], [0, c, -b]], why: "es el núcleo de una ecuación lineal homogénea" }; },
    r => { const [a, b] = [r.nz(-3, 3), r.nz(-3, 3)], k = r.nz(-4, 4); return { ok: false, t: `$\\{(x, y, z) \\in \\mathbb R^3 : ${H.poly([[a, "x"], [b, "y"]])} = ${k}\\}$`, in: v => Math.abs(a * v[0] + b * v[1] - k) < 1e-9, gen: [[k / a, 0, 1], [0, k / b, 2]], why: "no contiene al vector nulo (la ecuación no es homogénea)" }; },
    () => ({ ok: false, t: `$\\{(x, y, z) \\in \\mathbb R^3 : xy = 0\\}$`, in: v => Math.abs(v[0] * v[1]) < 1e-9, gen: [[1, 0, 2], [0, 1, -1]], why: "$(1, 0, 0)$ y $(0, 1, 0)$ están, pero su suma no" }),
    () => ({ ok: false, t: `$\\{(x, y, z) \\in \\mathbb R^3 : x \\ge 0\\}$`, in: v => v[0] >= -1e-12, gen: [[1, 2, 0], [3, -1, 1]], why: "no es cerrado por escalares negativos: $(1, 0, 0)$ está y $-(1, 0, 0)$ no" }),
    r => { const a = r.nz(-2, 3); return { ok: true, t: `$\\{p \\in \\mathbb R_2[x] : p(${a}) = 0\\}$`, in: v => Math.abs(v[0] + a * v[1] + a * a * v[2]) < 1e-9, gen: [[-a, 1, 0], [-a * a, 0, 1]], why: "evaluar en un punto es lineal, y la condición es homogénea" }; },
    r => { const a = r.int(-2, 2), k = r.nz(-3, 3); return { ok: false, t: `$\\{p \\in \\mathbb R_2[x] : p(${a}) = ${k}\\}$`, in: v => Math.abs(v[0] + a * v[1] + a * a * v[2] - k) < 1e-9, gen: [[k, 0, 0], [k - a, 1, 0]], why: "el polinomio nulo no cumple la condición" }; },
    () => ({ ok: true, t: `$\\{p \\in \\mathbb R_2[x] : p'(0) = p(0)\\}$`, in: v => Math.abs(v[1] - v[0]) < 1e-9, gen: [[1, 1, 0], [0, 0, 1]], why: "es una condición lineal homogénea sobre los coeficientes ($b = a$)" }),
    () => ({ ok: false, t: `$\\{p \\in \\mathbb R_2[x] : p \\text{ tiene grado exactamente } 2\\}$`, in: v => Math.abs(v[2]) > 1e-9, gen: [[0, 1, 1], [1, 0, -1]], why: "$x^2 + x$ y $-x^2 + 1$ tienen grado 2 y su suma no (y además falta el polinomio nulo)" }),
    () => ({ ok: true, t: `las matrices $\\begin{pmatrix} a & b \\\\ b & c \\end{pmatrix}$ (simétricas de $2\\times2$)`, in: () => true, gen: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], why: "sumas y múltiplos de simétricas son simétricas" }),
    () => ({ ok: false, t: `las matrices simétricas $\\begin{pmatrix} a & b \\\\ b & c \\end{pmatrix}$ con determinante $0$`, in: v => Math.abs(v[0] * v[2] - v[1] * v[1]) < 1e-9, gen: [[1, 0, 0], [0, 0, 1]], why: "$\\begin{pmatrix} 1 & 0 \\\\ 0 & 0 \\end{pmatrix}$ y $\\begin{pmatrix} 0 & 0 \\\\ 0 & 1 \\end{pmatrix}$ tienen determinante 0 y su suma es la identidad" }),
    () => ({ ok: true, t: `$\\{(x, y, z) \\in \\mathbb R^3 : x = 2y \\text{ y } z = 0\\}$`, in: v => Math.abs(v[0] - 2 * v[1]) < 1e-9 && Math.abs(v[2]) < 1e-9, gen: [[2, 1, 0]], why: "es la intersección de dos subespacios (dos ecuaciones homogéneas)" }),
    () => ({ ok: false, t: `$\\{(x, y, z) \\in \\mathbb R^3 : x^2 + y^2 = z^2\\}$`, in: v => Math.abs(v[0] * v[0] + v[1] * v[1] - v[2] * v[2]) < 1e-9, gen: [[1, 0, 1], [0, 1, 1]], why: "es un cono: $(1, 0, 1)$ y $(0, 1, 1)$ están, pero su suma $(1, 1, 2)$ no" })
  ];
  // ¿el conjunto generado por las muestras es cerrado por sumas y por múltiplos, y tiene al cero?
  const closed = S => {
    if (!S.in([0, 0, 0])) return false;
    for (const u of S.gen) { if (!S.in(u)) return null; for (const k of [-1, 2.5]) if (!S.in(u.map(x => k * x))) return false; for (const w of S.gen) if (!S.in(u.map((x, i) => x + w[i]))) return false; }
    return true;
  };
  T["a2-subespacio-mc"] = {
    type: "mc", concepts: ["a2-espacio"], difficulty: 1,
    generate(r) {
      const all = r.shuffle(SUBS).map(f => f(r)), yes = all.find(s => s.ok), nos = all.filter(s => !s.ok).slice(0, 3);
      return {
        prompt: `¿Cuál de estos conjuntos es un subespacio vectorial (con las operaciones usuales)?`,
        ...H.mc(r, yes.t, nos.map(s => s.t), { text: true }),
        solution: [`Un subconjunto es [[a2-espacio|subespacio]] si contiene al vector nulo y es cerrado por sumas y por múltiplos escalares.`,
          `El que cumple: ${yes.t}, porque ${yes.why}.`, ...nos.map(s => `No lo es ${s.t}: ${s.why}.`)],
        // verificación: se prueban el cero, las sumas y los múltiplos sobre elementos concretos de cada conjunto
        verify: { kind: "truth", target: true, fn: () => closed(yes) === true && nos.every(s => closed(s) === false) }
      };
    }
  };

  T["a2-dim-num"] = {
    type: "numeric", concepts: ["a2-base"], difficulty: 2,
    generate(r) {
      const n = r.int(2, 4), k = r.int(1, 2), deg = r.int(2, 5), form = r.int(0, 6);
      const idx = (i, j) => i * n + j, N = n * n;
      // cada caso: el espacio ambiente R^N y las ecuaciones lineales (filas) que definen el subespacio
      const F = [
        () => ({ t: `el espacio de las matrices **simétricas** de $${n}\\times${n}$`, N, eqs: (() => { const e = []; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const row = Array(N).fill(0); row[idx(i, j)] = 1; row[idx(j, i)] = -1; e.push(row); } return e; })(), d: n * (n + 1) / 2, why: `quedan libres la diagonal ($${n}$) y lo de arriba de ella ($${n * (n - 1) / 2}$)` }),
        () => ({ t: `el espacio de las matrices **antisimétricas** de $${n}\\times${n}$ ($A^t = -A$)`, N, eqs: (() => { const e = []; for (let i = 0; i < n; i++) for (let j = i; j < n; j++) { const row = Array(N).fill(0); row[idx(i, j)] += 1; row[idx(j, i)] += 1; e.push(row); } return e; })(), d: n * (n - 1) / 2, why: `la diagonal es nula y lo de abajo queda determinado por lo de arriba: $${n * (n - 1) / 2}$ entradas libres` }),
        () => ({ t: `el espacio de las matrices de $${n}\\times${n}$ con **traza nula**`, N, eqs: [Array.from({ length: N }, (_, q) => (q % (n + 1) === 0 ? 1 : 0))], d: N - 1, why: `es una sola ecuación lineal sobre $${N}$ entradas` }),
        () => ({ t: `el espacio de las matrices **triangulares superiores** de $${n}\\times${n}$`, N, eqs: (() => { const e = []; for (let i = 0; i < n; i++) for (let j = 0; j < i; j++) { const row = Array(N).fill(0); row[idx(i, j)] = 1; e.push(row); } return e; })(), d: n * (n + 1) / 2, why: `quedan libres la diagonal y lo de arriba` }),
        () => { const a = r.int(-2, 2); return { t: `el subespacio de $\\mathbb R_{${deg}}[x]$ (polinomios de grado $\\le ${deg}$) formado por los $p$ con $p(${a}) = 0$`, N: deg + 1, eqs: [Array.from({ length: deg + 1 }, (_, i) => a ** i)], d: deg, why: `$\\mathbb R_{${deg}}[x]$ tiene dimensión $${deg + 1}$ y se impone una ecuación` }; },
        () => ({ t: `el subespacio de $\\mathbb R_{${deg}}[x]$ formado por los polinomios **pares** ($p(-x) = p(x)$)`, N: deg + 1, eqs: Array.from({ length: deg + 1 }, (_, i) => i).filter(i => i % 2).map(i => { const row = Array(deg + 1).fill(0); row[i] = 1; return row; }), d: Math.floor(deg / 2) + 1, why: `solo sobreviven las potencias pares: $1, x^2, \\dots$` }),
        () => { const m = n + 2, rows = Array.from({ length: k + 1 }, () => Array.from({ length: m }, () => r.int(-3, 3))); rows.push(rows[0].map((x, i) => x + 2 * rows[1][i])); return { t: `el conjunto de soluciones en $\\mathbb R^{${m}}$ del sistema homogéneo cuya matriz es $${A.pm(rows)}$`, N: m, eqs: rows, d: null, why: `la última fila es combinación de las dos primeras, así que no agrega nada` }; }
      ][form]();
      const d = F.d === null ? F.N - A.rank(F.eqs) : F.d;
      return {
        prompt: `¿Cuál es la dimensión de ${F.t}?`,
        answer: d,
        solution: [`La [[a2-base|dimensión]] es la cantidad de parámetros libres: la del espacio ambiente menos la cantidad de ecuaciones independientes.`, `Acá, ${F.why}.`, `Dimensión: $${d}$.`],
        // verificación: se escriben las ecuaciones como una matriz y se calcula su nulidad por eliminación
        verify: { kind: "nullity", A: F.eqs }
      };
    }
  };

  T["a2-grassmann-num"] = {
    type: "numeric", concepts: ["a2-suma"], difficulty: 2,
    generate(r) {
      const n = 4, rv = () => Array.from({ length: n }, () => r.int(-2, 3)), ask = r.pick(["int", "int", "sum"]);
      const u1 = rv(), u2 = rv(), U = [u1, u2];
      // W se arma para que la intersección tenga dimensión 0, 1 o 2
      const mode = r.int(0, 2), comb = () => u1.map((x, i) => r.nz(-2, 2) * x + r.int(-1, 2) * u2[i]);
      const W = mode === 0 ? [rv(), rv()] : mode === 1 ? [comb(), rv()] : [comb(), u1.map((x, i) => x - u2[i])];
      const dU = A.rank(U), dW = A.rank(W), dS = A.rank([...U, ...W]), dI = dU + dW - dS;
      if (dU !== 2 || dW !== 2) return null;
      return {
        prompt: `En $\\mathbb R^4$, sean $U = \\langle ${U.map(A.v).join(",\\ ")}\\rangle$ y $W = \\langle ${W.map(A.v).join(",\\ ")}\\rangle$. ¿Cuál es la dimensión de $${ask === "int" ? "U \\cap W" : "U + W"}$?`,
        answer: ask === "int" ? dI : dS,
        traps: ask === "int" ? [{ value: dS, msg: "Esa es la dimensión de la suma $U + W$. Para la intersección falta usar la fórmula de Grassmann." }].filter(t => t.value !== dI) : [{ value: 4, msg: "No siempre es todo el espacio: fijate si entre los cuatro generadores hay alguno que sea combinación de los otros." }].filter(t => t.value !== dS),
        solution: [`$U + W$ está generado por los cuatro vectores juntos. Escalonando la matriz que los tiene por filas, el rango es $${dS}$: $\\dim(U + W) = ${dS}$.`,
          `Cada subespacio tiene dimensión 2 (sus generadores no son múltiplos). [[a2-suma|Fórmula de Grassmann]]: $\\dim(U \\cap W) = \\dim U + \\dim W - \\dim(U + W) = 2 + 2 - ${dS} = ${dI}$.`],
        // verificación: U ∩ W son los vectores a·u1 + b·u2 = c·w1 + d·w2: la dimensión es la nulidad de la matriz [u1 u2 −w1 −w2]
        verify: ask === "int" ? { kind: "nullity", A: A.T([...U, ...W.map(w => w.map(x => -x))]) } : { kind: "value", fn: () => 4 - A.kernel([...U, ...W]).length }
      };
    }
  };

  T["a2-directa-vf"] = {
    type: "tf", concepts: ["a2-suma"], difficulty: 2,
    generate(r) {
      const dep = r.bool(), n = 3, rv = () => Array.from({ length: n }, () => r.int(-2, 3)), u1 = rv(), u2 = rv();
      const w = dep ? u1.map((x, i) => r.nz(-2, 2) * x + r.nz(-2, 2) * u2[i]) : rv();
      if (A.rank([u1, u2]) !== 2 || w.every(x => x === 0)) return null;
      const d = A.detL([u1, u2, w]), val = d !== 0;
      return {
        prompt: `En $\\mathbb R^3$, sean $U = \\langle ${A.v(u1)},\\ ${A.v(u2)}\\rangle$ y $W = \\langle ${A.v(w)}\\rangle$. <b>Verdadero o falso:</b> $\\mathbb R^3 = U \\oplus W$.`,
        answer: val,
        explanation: `$U$ es un plano y $W$ una recta, y $2 + 1 = 3$. La suma es directa exactamente cuando la recta no está contenida en el plano, es decir, cuando los tres vectores son linealmente independientes. Su determinante es $${d}$: ${val ? "son independientes y $\\mathbb R^3 = U \\oplus W$" : "son dependientes, así que $W \\subseteq U$ y $U + W = U \\ne \\mathbb R^3$"} ([[a2-suma|suma directa]]).`,
        solution: [`$V = U \\oplus W$ si $V = U + W$ y $U \\cap W = \\{0\\}$; en dimensión finita alcanza con que $\\dim U + \\dim W = \\dim V$ y $U \\cap W = \\{0\\}$.`],
        // verificación: el rango de los tres vectores por eliminación (la respuesta usó el determinante por Laplace)
        verify: { kind: "truth", fn: () => A.rank([u1, u2, w]) === 3 }
      };
    }
  };

  T["a2-coordenadas-num"] = {
    type: "numeric", concepts: ["a2-coordenadas"], difficulty: 2,
    generate(r) {
      const P = A.unimod(r, 3, 4), x = [r.nz(-4, 4), r.int(-4, 4), r.nz(-4, 4)], k = r.int(0, 2), kind = r.pick(["pol", "sim"]);
      // las columnas de P son los vectores de la base, en coordenadas canónicas; b = P x
      const cols = A.T(P), b = A.vec(P, x);
      const show = kind === "pol" ? v => A.pol(v) : v => A.pm([[v[0], v[1]], [v[1], v[2]]]);
      const name = kind === "pol" ? ["p", "p_1", "p_2", "p_3"] : ["M", "S_1", "S_2", "S_3"];
      return {
        prompt: kind === "pol" ? `En $\\mathbb R_2[x]$ se considera la base $B = \\{p_1, p_2, p_3\\}$, con $p_1 = ${show(cols[0])}$, $p_2 = ${show(cols[1])}$ y $p_3 = ${show(cols[2])}$. ¿Cuánto vale la ${["primera", "segunda", "tercera"][k]} coordenada de $p = ${show(b)}$ en la base $B$?`
          : `En el espacio de las matrices simétricas de $2\\times2$ se considera la base $B = \\{S_1, S_2, S_3\\}$, con $S_1 = ${show(cols[0])}$, $S_2 = ${show(cols[1])}$ y $S_3 = ${show(cols[2])}$. ¿Cuánto vale la ${["primera", "segunda", "tercera"][k]} coordenada de $M = ${show(b)}$ en la base $B$?`,
        answer: x[k],
        solution: [`Se buscan $c_1, c_2, c_3$ con $${name[0]} = c_1${name[1]} + c_2${name[2]} + c_3${name[3]}$ ([[a2-coordenadas|coordenadas]]). Igualando ${kind === "pol" ? "los coeficientes de $1$, $x$ y $x^2$" : "las entradas $a$, $b$ y $c$"} queda el sistema $${A.pm(P)}\\begin{pmatrix} c_1 \\\\ c_2 \\\\ c_3 \\end{pmatrix} = \\begin{pmatrix} ${b.join(" \\\\ ")} \\end{pmatrix}$.`,
          `Resolviéndolo (por Gauss): $[${name[0]}]_B = ${A.v(x)}$. La ${["primera", "segunda", "tercera"][k]} coordenada es $${x[k]}$.`],
        // verificación: con esas coordenadas, la combinación lineal de la base tiene que dar el vector
        verify: { kind: "solve", A: P, b, x }
      };
    }
  };

  const cards = {
    "a2-espacio": {
      title: "Espacios vectoriales sobre un cuerpo y subespacios", aliases: ["espacio vectorial sobre un cuerpo", "cuerpo de escalares", "subespacio generado", "axiomas de espacio vectorial"], concepts: ["a2-espacio"],
      summary: "Un espacio vectorial sobre un cuerpo F es un conjunto con una suma y un producto por escalares de F que cumplen ocho axiomas. Un subconjunto es subespacio si contiene al 0 y es cerrado por sumas y por múltiplos.",
      def: [R`Un **cuerpo** $F$ es un conjunto con suma y producto que se comportan como los de $\mathbb Q$, $\mathbb R$ o $\mathbb C$ (todo elemento no nulo tiene inverso). Un **espacio vectorial sobre $F$** es un conjunto $V$ con una suma $V\times V \to V$ y un producto por escalares $F\times V \to V$ tales que: la suma es asociativa y conmutativa, tiene neutro $0$ y opuestos; y $\lambda(u + v) = \lambda u + \lambda v$, $\ (\lambda + \mu)v = \lambda v + \mu v$, $\ (\lambda\mu)v = \lambda(\mu v)$, $\ 1v = v$.`,
        R`**Ejemplos.** $F^n$; las matrices $F^{m\times n}$; los polinomios $F[x]$ y los de grado acotado $F_n[x]$; las funciones de un conjunto en $F$; las soluciones de una ecuación diferencial lineal homogénea. Es la versión general del [[al-espacio-vectorial|espacio vectorial]] de Introducción al Álgebra Lineal.`,
        R`$S \subseteq V$ es un **subespacio** si $0 \in S$ y, para $u, v \in S$ y $\lambda \in F$, también $u + v \in S$ y $\lambda v \in S$. El **subespacio generado** $\langle v_1, \dots, v_k\rangle$ es el conjunto de las combinaciones lineales de esos vectores: el menor subespacio que los contiene.`,
        R`La intersección de subespacios es un subespacio. La unión, en general, no.`],
      idea: [R`Los axiomas son la lista mínima de reglas que hacen falta para «hacer álgebra lineal». Todo lo que se demuestre usando solo esas reglas vale a la vez para flechas, polinomios, matrices, funciones y sucesiones.`,
        R`Las operaciones pueden ser raras. En $V = \{(x, y) : x > 0, y > 0\}$ con $(x, y)\oplus(x', y') = (xx', yy')$ y $\lambda\odot(x, y) = (x^\lambda, y^\lambda)$ se cumplen los ocho axiomas: el «vector nulo» es $(1, 1)$ y el opuesto de $(x, y)$ es $(\frac1x, \frac1y)$. (Es $\mathbb R^2$ disfrazado por la exponencial.)`,
        R`Para probar que algo es un espacio vectorial conviene, cuando se puede, mostrar que es un **subespacio** de uno conocido: son tres chequeos en lugar de ocho.`],
      demo: [R`**Paso 1 ($0\cdot v = 0$).** Por la distributiva, $0v = (0 + 0)v = 0v + 0v$. Sumando el opuesto de $0v$ a los dos lados queda $0 = 0v$.`,
        R`**Paso 2 ($(-1)v = -v$).** $v + (-1)v = 1v + (-1)v = (1 - 1)v = 0v = 0$ por el paso 1. Como el opuesto es único, $(-1)v = -v$.`,
        R`**Paso 3 (un subespacio es un espacio).** Si $S$ es cerrado por sumas y múltiplos, las operaciones de $V$ se restringen a $S$. Los axiomas que son igualdades (asociativa, conmutativa, distributivas) valen en $S$ porque valen en $V$. El neutro está por hipótesis, y el opuesto de $v \in S$ es $(-1)v \in S$ por el paso 2. $\blacksquare$`,
        R`**Paso 4 (la intersección).** Si $u, v \in S\cap T$, entonces $u + v$ está en $S$ (porque $S$ es subespacio) y en $T$ (porque $T$ lo es); igual con $\lambda v$ y con el $0$.`],
      examples: [{ q: R`¿Es subespacio de $\mathbb R^{2\times2}$ el conjunto de las matrices con $\det A = 0$?`, steps: [R`Contiene a la nula y es cerrado por múltiplos, pero no por sumas: $\begin{pmatrix} 1 & 0 \\ 0 & 0\end{pmatrix} + \begin{pmatrix} 0 & 0 \\ 0 & 1\end{pmatrix} = I$. No es subespacio.`] },
        { q: R`¿Y $\{p \in \mathbb R[x] : p(1) = 0\}$?`, steps: [R`El polinomio nulo está; si $p(1) = q(1) = 0$ entonces $(p + q)(1) = 0$ y $(\lambda p)(1) = 0$. Sí.`] }],
      tips: [R`Chequeo rápido: si el vector nulo no está, no es subespacio. Las condiciones del tipo «$= 1$», «$\ge 0$», «$xy = 0$» o «grado exactamente $n$» casi nunca dan subespacios.`],
      see: ["al-espacio-vectorial", "a2-base", "a2-suma"]
    },
    "a2-base": {
      title: "Independencia lineal, bases y dimensión", aliases: ["dimensión de un espacio vectorial", "lema de intercambio", "extensión a una base"], concepts: ["a2-base"],
      summary: "Una base es un conjunto generador linealmente independiente. Todas las bases de un espacio de dimensión finita tienen la misma cantidad de elementos: la dimensión. Todo conjunto independiente se extiende a una base y de todo generador se extrae una.",
      def: [R`$\{v_1, \dots, v_k\}$ es **linealmente independiente** si $\lambda_1v_1 + \dots + \lambda_kv_k = 0$ solo con todos los $\lambda_i = 0$; es **generador** de $V$ si $\langle v_1, \dots, v_k\rangle = V$. Una **base** es un generador independiente ([[al-base|base y dimensión]]).`,
        R`**Teorema.** Si $V$ tiene un generador finito, todas sus bases tienen la misma cantidad $n$ de elementos: $n = \dim V$. Además: todo conjunto independiente tiene a lo sumo $n$ elementos y se puede **extender** a una base; de todo generador se puede **extraer** una base; y $n$ vectores independientes (o $n$ generadores) ya forman una base.`,
        R`Si $S$ es un subespacio de $V$, $\dim S \le \dim V$, con igualdad solo si $S = V$.`,
        R`**Dimensiones para saber.** $\dim F^n = n$; $\ \dim F^{m\times n} = mn$; $\ \dim F_n[x] = n + 1$; simétricas de $n\times n$: $\frac{n(n+1)}{2}$; antisimétricas: $\frac{n(n-1)}{2}$; soluciones de un sistema homogéneo de rango $r$ con $n$ incógnitas: $n - r$.`],
      idea: [R`La dimensión cuenta **grados de libertad**: cuántos números hacen falta para elegir un elemento. Cada ecuación lineal independiente que se impone resta uno.`,
        R`Que todas las bases tengan el mismo tamaño no es obvio: es un teorema, y es lo que hace que «dimensión» tenga sentido.`],
      demo: [R`**Paso 1 (lema de intercambio).** Sea $\{w_1, \dots, w_m\}$ un generador de $V$ y $\{v_1, \dots, v_k\}$ independiente. Como los $w$ generan, $v_1 = \sum a_iw_i$, con algún $a_i \ne 0$ (porque $v_1 \ne 0$); reordenando, $a_1 \ne 0$. Entonces $w_1$ se despeja en función de $v_1, w_2, \dots, w_m$, y $\{v_1, w_2, \dots, w_m\}$ sigue generando.`,
        R`**Paso 2 (repetir).** Ahora $v_2 = b_1v_1 + \sum_{i\ge2}b_iw_i$. No pueden ser nulos todos los $b_i$ con $i \ge 2$, porque entonces $v_2 = b_1v_1$ y los $v$ serían dependientes. Se intercambia $v_2$ por ese $w_i$. Así se van reemplazando $w$ por $v$, uno por vez.`,
        R`**Paso 3 ($k \le m$).** Si fuera $k > m$, después de $m$ pasos se habrían agotado los $w$: $\{v_1, \dots, v_m\}$ generaría $V$, y $v_{m+1}$ sería combinación de ellos, contra la independencia. Luego un conjunto independiente nunca tiene más elementos que un generador.`,
        R`**Paso 4 (todas las bases miden lo mismo).** Si $B$ y $B'$ son bases con $n$ y $n'$ elementos: $B$ es independiente y $B'$ genera, así que $n \le n'$; y al revés, $n' \le n$. $\blacksquare$`],
      examples: [{ q: R`Dimensión de las matrices de $3\times3$ simétricas con traza nula.`, steps: [R`Simétricas de $3\times3$: $6$. La traza nula es una ecuación más, independiente: $5$.`] }],
      see: ["al-base", "a2-espacio", "a2-coordenadas", "a2-suma"]
    },
    "a2-suma": {
      title: "Suma e intersección de subespacios, Grassmann y suma directa", aliases: ["suma de subespacios", "suma directa", "fórmula de Grassmann", "teorema de la dimensión para subespacios", "subespacios suplementarios", "complemento de un subespacio"], concepts: ["a2-suma"],
      summary: "U + W = {u + w}. Grassmann: dim(U + W) = dim U + dim W − dim(U ∩ W). La suma es directa (U ⊕ W) si U ∩ W = {0}; entonces cada vector se escribe de una sola manera como u + w.",
      def: [R`La **suma** de dos subespacios es $U + W = \{u + w : u \in U,\ w \in W\}$: el menor subespacio que contiene a los dos. Si $U = \langle u_i\rangle$ y $W = \langle w_j\rangle$, entonces $U + W = \langle u_i, w_j\rangle$.`,
        R`**Fórmula de Grassmann.** En dimensión finita, $$\dim(U + W) = \dim U + \dim W - \dim(U\cap W).$$`,
        R`La suma es **directa**, $U \oplus W$, si $U \cap W = \{0\}$. Equivale a que cada vector de $U + W$ se escriba de **una sola** manera como $u + w$, y a que $\dim(U + W) = \dim U + \dim W$. Si $V = U \oplus W$, $W$ es un **suplemento** de $U$; todo subespacio tiene suplementos (muchos).`],
      idea: [R`Grassmann es la versión lineal de «la cantidad de elementos de una unión es la suma menos la intersección». Dos planos por el origen en $\mathbb R^3$: $2 + 2 - \dim(\cap) \le 3$ obliga a que se corten al menos en una recta.`,
        R`$V = U \oplus W$ significa que $V$ se «descompone» en dos partes que no se pisan. Ejemplos: toda matriz es, de una sola manera, simétrica más antisimétrica; toda función es par más impar.`,
        R`En la práctica: para $U + W$ se juntan los generadores y se escalona; para $U \cap W$, o se resuelven juntas las ecuaciones de ambos, o se usa Grassmann para saber la dimensión de antemano.`],
      demo: [R`**Paso 1 (empezar por la intersección).** Sea $\{z_1, \dots, z_r\}$ una base de $U \cap W$. Como es independiente, se [[a2-base|extiende]] a una base $\{z_1, \dots, z_r, u_1, \dots, u_s\}$ de $U$ y a una base $\{z_1, \dots, z_r, w_1, \dots, w_t\}$ de $W$.`,
        R`**Paso 2 (generan la suma).** Todo elemento de $U + W$ es suma de una combinación de los $z, u$ y otra de los $z, w$: los $r + s + t$ vectores $z_i, u_j, w_k$ generan $U + W$.`,
        R`**Paso 3 (son independientes).** Supongamos $\sum a_iz_i + \sum b_ju_j + \sum c_kw_k = 0$. Entonces $x = \sum c_kw_k = -\sum a_iz_i - \sum b_ju_j$ está en $W$ y en $U$: está en $U\cap W$, y es combinación de los $z$. Eso da una relación entre los $z$ y los $w$, que son independientes: todos los $c_k = 0$. Queda $\sum a_iz_i + \sum b_ju_j = 0$, y por la independencia de la base de $U$, todo es cero.`,
        R`**Paso 4 (contar).** $\dim(U + W) = r + s + t = (r + s) + (r + t) - r = \dim U + \dim W - \dim(U\cap W)$. $\blacksquare$`,
        R`**Paso 5 (unicidad en la suma directa).** Si $u + w = u' + w'$, entonces $u - u' = w' - w$ está en $U \cap W = \{0\}$: $u = u'$ y $w = w'$.`],
      examples: [{ q: R`$U = \{x_1 + x_2 = 0\}$ y $W = \{x_3 = x_4 = 0\}$ en $\mathbb R^4$. Dimensión de $U\cap W$ y de $U + W$.`, steps: [R`$U \cap W$: tres ecuaciones independientes, dimensión $1$.`, R`$\dim(U + W) = 3 + 2 - 1 = 4$: $U + W = \mathbb R^4$, pero la suma no es directa.`] },
        { q: R`Si $j\circ j = \operatorname{id}$, probá que $V = S \oplus A$ con $S = \{j(v) = v\}$ y $A = \{j(v) = -v\}$ (en un cuerpo donde $2 \ne 0$).`, steps: [R`$v = \frac{v + j(v)}{2} + \frac{v - j(v)}{2}$: el primero está en $S$ y el segundo en $A$ (aplicando $j$).`, R`Si $v \in S\cap A$, $v = j(v) = -v$, así que $2v = 0$ y $v = 0$.`] }],
      tips: [R`$\dim U + \dim W = \dim V$ **no** alcanza para que la suma sea directa: falta ver que $U \cap W = \{0\}$ (o que $U + W = V$).`],
      see: ["a2-base", "a2-espacio", "al-rouche"]
    },
    "a2-coordenadas": {
      title: "Coordenadas y cambio de base", aliases: ["vector de coordenadas", "matriz de cambio de base", "isomorfismo de coordenadas"], concepts: ["a2-coordenadas"],
      summary: "Fijada una base B = {v₁, …, vₙ}, cada vector se escribe de una sola manera como Σ cᵢvᵢ: [v]_B = (c₁, …, cₙ). Así V se identifica con Fⁿ. Las coordenadas en dos bases se relacionan por una matriz inversible.",
      def: [R`Si $B = \{v_1, \dots, v_n\}$ es una base ordenada de $V$, cada $v \in V$ se escribe de **una sola** manera como $v = c_1v_1 + \dots + c_nv_n$. El vector $[v]_B = (c_1, \dots, c_n) \in F^n$ son sus **coordenadas** en $B$.`,
        R`La aplicación $v \mapsto [v]_B$ es un **isomorfismo** de $V$ en $F^n$: respeta sumas y múltiplos y es biyectiva. Por eso todo espacio de dimensión $n$ sobre $F$ «es» $F^n$, una vez elegida una base.`,
        R`**Cambio de base.** Si $B'$ es otra base, la matriz $C_{B'\to B}$ cuyas columnas son las coordenadas en $B$ de los vectores de $B'$ cumple $[v]_B = C_{B'\to B}\,[v]_{B'}$. Es inversible, y su inversa es $C_{B\to B'}$.`],
      idea: [R`Las coordenadas convierten un problema abstracto (polinomios, matrices, funciones) en uno de columnas de números, donde se puede escalonar. Para hallar las coordenadas de un vector se plantea la combinación lineal y se resuelve un sistema.`,
        R`El isomorfismo depende de la base: no hay una manera «natural» de identificar $V$ con $F^n$. Esa diferencia se vuelve importante en el espacio dual.`],
      demo: [R`**Paso 1 (existen).** Como $B$ genera $V$, todo $v$ es combinación lineal de los $v_i$.`,
        R`**Paso 2 (son únicas).** Si $v = \sum c_iv_i = \sum d_iv_i$, restando: $\sum (c_i - d_i)v_i = 0$. Como $B$ es independiente, $c_i = d_i$ para todo $i$.`,
        R`**Paso 3 (es lineal).** Si $u = \sum a_iv_i$ y $v = \sum c_iv_i$, entonces $u + \lambda v = \sum (a_i + \lambda c_i)v_i$: por la unicidad del paso 2, $[u + \lambda v]_B = [u]_B + \lambda[v]_B$.`,
        R`**Paso 4 (cambio de base).** Si $v = \sum c'_jv'_j$ y cada $v'_j = \sum_i C_{ij}v_i$, reemplazando: $v = \sum_i\left(\sum_j C_{ij}c'_j\right)v_i$. Por la unicidad, la coordenada $i$ en $B$ es $\sum_j C_{ij}c'_j$: el producto de $C$ por $[v]_{B'}$. $\blacksquare$`],
      examples: [{ q: R`Coordenadas de $p = 3 + 2x$ en la base $\{1 + x,\ 1 - x\}$ de $\mathbb R_1[x]$.`, steps: [R`$c_1(1 + x) + c_2(1 - x) = 3 + 2x$ da $c_1 + c_2 = 3$ y $c_1 - c_2 = 2$.`, R`$[p]_B = \left(\frac52, \frac12\right)$.`] }],
      see: ["al-base", "a2-base"]
    }
  };

  E.extendCourse("m203", {
    concepts: { "a2-espacio": { name: "Espacios y subespacios" }, "a2-base": { name: "Bases y dimensión" }, "a2-suma": { name: "Suma y suma directa" }, "a2-coordenadas": { name: "Coordenadas" } },
    templates: T,
    units: [{
      id: "a2-espacios-u", order: 1, program: "Unidad 1", title: "Espacios vectoriales y subespacios", icon: "grid-3x3",
      diagnostic: ["a2-subespacio-mc", "a2-grassmann-num", "a2-coordenadas-num"],
      lessons: [
        { id: "a2-espacio", title: "Espacios, subespacios y dimensión", templates: ["a2-subespacio-mc", "a2-dim-num"], theory: ["a2-espacio", "a2-base"],
          intro: R`Subespacio: contiene al $0$ y es cerrado por sumas y múltiplos. La dimensión cuenta los parámetros libres.` },
        { id: "a2-suma", title: "Suma, intersección y suma directa", templates: ["a2-grassmann-num", "a2-directa-vf"], theory: ["a2-suma"],
          intro: R`$\dim(U + W) = \dim U + \dim W - \dim(U\cap W)$. La suma es directa si $U\cap W = \{0\}$.` },
        { id: "a2-coordenadas", title: "Coordenadas en una base", templates: ["a2-coordenadas-num"], theory: ["a2-coordenadas"],
          intro: R`$[v]_B$ son los coeficientes de $v$ en la base $B$: se hallan resolviendo un sistema.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 2 · TRANSFORMACIONES LINEALES: NÚCLEO, IMAGEN, MATRICES, PROYECTORES Y NILPOTENTES
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, A = E.a2;
  const T = {};
  const VN = ["x", "y", "z", "w"];
  const lin = row => H.poly(row.map((c, i) => [c, VN[i]]));

  T["a2-nucleo-imagen-multi"] = {
    type: "multi", concepts: ["a2-tl"], difficulty: 2,
    generate(r) {
      const n = r.pick([3, 3, 4]), m = r.pick([2, 3, 3]), rows = Array.from({ length: m }, () => Array.from({ length: n }, () => r.int(-2, 3)));
      // a veces se fuerza una dependencia entre filas para que el rango no sea máximo
      if (m === 3 && r.bool(0.6)) rows[2] = rows[0].map((x, i) => x + r.pick([1, -1, 2]) * rows[1][i]);
      if (rows.some(rw => rw.every(x => x === 0))) return null;
      const rk = A.rank(rows), nul = n - rk, ker = A.kernel(rows);
      return {
        prompt: `Sea $T: \\mathbb R^{${n}} \\to \\mathbb R^{${m}}$ la transformación lineal $T(${VN.slice(0, n).join(", ")}) = \\left(${rows.map(lin).join(",\\ ")}\\right)$.`,
        parts: [
          { q: "¿Cuál es la dimensión de la imagen de $T$?", type: "numeric", answer: rk,
            // verificación: el rango por columnas (de la traspuesta), que coincide con el rango por filas
            verify: { kind: "rank", A: A.T(rows) } },
          { q: "¿Cuál es la dimensión del núcleo de $T$?", type: "numeric", answer: nul,
            traps: [{ value: m - rk, msg: "El teorema de la dimensión usa la dimensión del espacio de **salida** (el dominio): $\\dim\\operatorname{Nu} = n - \\dim\\operatorname{Im}$." }].filter(t => t.value !== nul),
            verify: { kind: "nullity", A: rows } }
        ],
        solution: [`La matriz de $T$ en las bases canónicas es $${A.pm(rows)}$. La imagen está generada por sus columnas, así que $\\dim\\operatorname{Im}(T)$ es el rango: escalonando, $${rk}$.`,
          `[[a2-tl|Teorema de la dimensión]]: $\\dim\\operatorname{Nu}(T) + \\dim\\operatorname{Im}(T) = \\dim\\mathbb R^{${n}} = ${n}$, así que $\\dim\\operatorname{Nu}(T) = ${nul}$.`,
          nul ? `Una base del núcleo: $\\{${ker.map(v => A.v(v.map(x => +x.toFixed(3)))).join(",\\ ")}\\}$.` : `El núcleo es $\\{0\\}$: $T$ es inyectiva.`]
      };
    }
  };

  T["a2-iso-vf"] = {
    type: "tf", concepts: ["a2-tl"], difficulty: 2,
    generate(r) {
      const [m, n] = r.pick([[2, 3], [3, 2], [3, 3], [3, 3], [2, 2], [3, 4]]), M = Array.from({ length: m }, () => Array.from({ length: n }, () => r.int(-2, 3)));
      if (m === n && r.bool(0.5)) M[m - 1] = M[0].map((x, i) => x - (m > 2 ? M[1][i] : 0) * 2 + (m === 2 ? x : 0));
      const prop = r.pick(["inyectiva", "sobreyectiva", "un isomorfismo"]), nul = A.kernel(M).length, rk = n - nul;
      const val = prop === "inyectiva" ? nul === 0 : prop === "sobreyectiva" ? rk === m : nul === 0 && rk === m;
      return {
        prompt: `Sea $T: \\mathbb R^{${n}} \\to \\mathbb R^{${m}}$ la transformación lineal de matriz $${A.pm(M)}$ (en las bases canónicas). <b>Verdadero o falso:</b> $T$ es ${prop}.`,
        answer: val,
        explanation: `El rango de la matriz es $${rk}$, así que $\\dim\\operatorname{Im}(T) = ${rk}$ y $\\dim\\operatorname{Nu}(T) = ${n} - ${rk} = ${nul}$. ${nul === 0 ? "Es inyectiva (núcleo nulo)" : "No es inyectiva (el núcleo no es nulo)"} y ${rk === m ? `es sobreyectiva (la imagen es todo $\\mathbb R^{${m}}$)` : `no es sobreyectiva (la imagen tiene dimensión $${rk} < ${m}$)`}${n > m ? `. De $\\mathbb R^{${n}}$ a $\\mathbb R^{${m}}$ nunca puede ser inyectiva` : n < m ? `. De $\\mathbb R^{${n}}$ a $\\mathbb R^{${m}}$ nunca puede ser sobreyectiva` : ""} ([[a2-tl|núcleo e imagen]]).`,
        solution: [`$T$ es inyectiva si y solo si $\\operatorname{Nu}(T) = \\{0\\}$, y sobreyectiva si y solo si $\\dim\\operatorname{Im}(T)$ es la dimensión del espacio de llegada.`],
        // verificación: el rango de la traspuesta por eliminación (la respuesta salió de una base del núcleo)
        verify: { kind: "truth", fn: () => { const k = A.rank(A.T(M)); return prop === "inyectiva" ? k === n : prop === "sobreyectiva" ? k === m : k === n && k === m; } }
      };
    }
  };

  T["a2-definir-tl-num"] = {
    type: "numeric", concepts: ["a2-tl"], difficulty: 2,
    generate(r) {
      const P = A.unimod(r, 2, 3), v1 = [P[0][0], P[1][0]], v2 = [P[0][1], P[1][1]], w1 = [r.int(-4, 4), r.int(-4, 4), r.int(-3, 3)], w2 = [r.int(-4, 4), r.int(-4, 4), r.int(-3, 3)];
      const a = r.nz(-3, 3), b = r.nz(-3, 3), v = [a * v1[0] + b * v2[0], a * v1[1] + b * v2[1]], Tv = w1.map((x, i) => a * x + b * w2[i]), k = r.int(0, 2);
      return {
        prompt: `Sea $T: \\mathbb R^2 \\to \\mathbb R^3$ la transformación lineal que cumple $T${A.v(v1)} = ${A.v(w1)}$ y $T${A.v(v2)} = ${A.v(w2)}$. ¿Cuánto vale la ${["primera", "segunda", "tercera"][k]} componente de $T${A.v(v)}$?`,
        answer: Tv[k],
        solution: [`Una transformación lineal queda determinada por sus valores en una **base** ([[a2-tl|transformaciones lineales]]). Primero se escribe $${A.v(v)}$ en la base $\\{${A.v(v1)}, ${A.v(v2)}\\}$: resolviendo el sistema, $${A.v(v)} = ${a}\\,${A.v(v1)} ${b < 0 ? "-" : "+"} ${Math.abs(b)}\\,${A.v(v2)}$.`,
          `Por linealidad, $T${A.v(v)} = ${a}\\,${A.v(w1)} ${b < 0 ? "-" : "+"} ${Math.abs(b)}\\,${A.v(w2)} = ${A.v(Tv)}$.`],
        // verificación: la matriz de T en la base canónica es [w1 w2]·[v1 v2]⁻¹; se la aplica al vector
        verify: { kind: "value", fn: () => A.vec(A.mul(A.T([w1, w2]), A.inv(P)), v)[k] }
      };
    }
  };

  // operadores sobre polinomios de grado ≤ 2, dados por lo que le hacen a los coeficientes (a, b, c) de a + bx + cx² y como operadores sobre funciones
  T["a2-matriz-tl-num"] = {
    type: "numeric", concepts: ["a2-matriz-tl"], difficulty: 3,
    generate(r) {
      const a = r.nz(-3, 3), c = r.pick([1, -1, 2]), d1 = (f, x, h = 1e-4) => (f(x + h) - f(x - h)) / (2 * h), d2 = (f, x, h = 1e-3) => (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
      const OPS = [
        { t: `T(p) = p' ${a < 0 ? "-" : "+"} ${H.cf(Math.abs(a))}p`, co: ([p, q, s]) => [q + a * p, 2 * s + a * q, a * s], fn: f => x => d1(f, x) + a * f(x) },
        { t: `T(p) = x\\,p'`, co: ([p, q, s]) => [0, q, 2 * s], fn: f => x => x * d1(f, x) },
        { t: `T(p)(x) = p(x ${c < 0 ? "-" : "+"} ${Math.abs(c)})`, co: ([p, q, s]) => [p + c * q + c * c * s, q + 2 * c * s, s], fn: f => x => f(x + c) },
        { t: `T(p) = p + p' + p''`, co: ([p, q, s]) => [p + q + 2 * s, q + 2 * s, s], fn: f => x => f(x) + d1(f, x) + d2(f, x) }
      ];
      const O = r.pick(OPS), base = r.pick([[[1, 0, 0], [1, 1, 0], [1, 1, 1]], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[1, 0, 0], [-1, 1, 0], [1, -2, 1]], [[1, 1, 0], [0, 1, 1], [0, 0, 1]]]);
      // columnas de P: los vectores de la base en la canónica; [T]_B = P⁻¹ · [T]_E · P
      const P = A.T(base), TE = A.T([[1, 0, 0], [0, 1, 0], [0, 0, 1]].map(O.co)), M = A.mul(A.inv(P), A.mul(TE, P)).map(row => row.map(x => Math.round(x * 1e6) / 1e6));
      const i = r.int(0, 2), j = r.int(0, 2), ev = (co, x) => co[0] + co[1] * x + co[2] * x * x;
      return {
        prompt: `Sea $T: \\mathbb R_2[x] \\to \\mathbb R_2[x]$, $${O.t}$, y $B = \\{${base.map(b => A.pol(b)).join(",\\ ")}\\}$ una base de $\\mathbb R_2[x]$. ¿Cuánto vale la entrada de la fila $${i + 1}$ y la columna $${j + 1}$ de la matriz $[T]_B$?`,
        answer: M[i][j],
        solution: [`La columna $j$ de $[T]_B$ son las coordenadas en $B$ de $T$ aplicada al $j$-ésimo vector de la base ([[a2-matriz-tl|matriz de una transformación lineal]]).`,
          `$T(${A.pol(base[j])}) = ${A.pol(O.co(base[j]))}$. Escribiéndolo en la base $B$, sus coordenadas son $${A.v(M.map(row => row[j]))}$.`,
          `La matriz completa es $[T]_B = ${A.pm(M)}$, y la entrada pedida vale $${A.dn(M[i][j])}$.`],
        // verificación: T aplicada (como operador sobre funciones, con derivadas numéricas) a cada vector de la base tiene que coincidir con la combinación que dice la matriz
        verify: { kind: "zero", tol: 1e-4, fn: () => { const out = []; for (let jj = 0; jj < 3; jj++) for (const x of [-1.3, 0.4, 2.1]) out.push(O.fn(t => ev(base[jj], t))(x) - M.reduce((s, row, ii) => s + row[jj] * ev(base[ii], x), 0)); return out; } }
      };
    }
  };

  T["a2-nilpotente-num"] = {
    type: "numeric", concepts: ["a2-nilpotente"], difficulty: 3,
    generate(r) {
      const blocks = r.pick([[3], [2, 1], [2, 2], [3, 1], [4], [2, 1, 1], [1, 1, 1]]), n = blocks.reduce((s, b) => s + b, 0), J = Array.from({ length: n }, () => Array(n).fill(0));
      let o = 0; for (const b of blocks) { for (let k = 0; k < b - 1; k++) J[o + k][o + k + 1] = 1; o += b; }
      const P = A.unimod(r, n, n + 1), N = A.mul(A.mul(P, J), A.inv(P)).map(row => row.map(x => Math.round(x))), ask = r.pick(["ind", "ind", "ker"]);
      const idx = Math.max(...blocks), ans = ask === "ind" ? idx : blocks.length;
      return {
        prompt: ask === "ind" ? `La matriz $N = ${A.pm(N)}$ es nilpotente. ¿Cuál es su índice de nilpotencia, es decir, el menor $k$ con $N^k = 0$?` : `La matriz $N = ${A.pm(N)}$ es nilpotente. ¿Cuál es la dimensión de su núcleo?`,
        answer: ans,
        solution: ask === "ind" ? [`Se calculan las potencias hasta llegar a la matriz nula ([[a2-nilpotente|operadores nilpotentes]]). ${idx === 1 ? "Acá $N$ ya es la matriz nula." : `Acá $N^{${idx - 1}} \\ne 0$ y $N^{${idx}} = 0$.`}`,
          `También se puede seguir la cadena de núcleos: sus dimensiones crecen de manera estricta hasta llegar a $${n}$, y eso pasa en el paso $${idx}$. El índice nunca supera el tamaño de la matriz.`]
          : [`El núcleo son las soluciones de $N\\vec x = 0$: su dimensión es $${n} - \\operatorname{rg}(N) = ${n} - ${n - blocks.length} = ${blocks.length}$ ([[a2-nilpotente|operadores nilpotentes]]).`, `(Es la cantidad de bloques de su forma de Jordan.)`],
        // verificación: potencias sucesivas de N (o el rango por eliminación)
        verify: ask === "ind" ? { kind: "value", fn: () => { let Pw = A.eye(n); for (let k = 1; k <= n + 1; k++) { Pw = A.mul(Pw, N); if (Pw.every(row => row.every(x => Math.abs(x) < 1e-9))) return k; } return -1; } } : { kind: "nullity", A: N }
      };
    }
  };

  const cards = {
    "a2-tl": {
      title: "Transformaciones lineales: núcleo, imagen y teorema de la dimensión", aliases: ["monomorfismo", "epimorfismo", "isomorfismo de espacios vectoriales", "espacios isomorfos", "preimagen de un subespacio"], concepts: ["a2-tl"],
      summary: "T: V → W es lineal si respeta sumas y múltiplos. Queda determinada por sus valores en una base. dim Nu(T) + dim Im(T) = dim V. Inyectiva ⇔ Nu(T) = {0}. Dos espacios de dimensión finita son isomorfos ⇔ tienen la misma dimensión.",
      def: [R`$T: V \to W$ (espacios sobre el mismo cuerpo $F$) es una **transformación lineal** si $T(u + v) = T(u) + T(v)$ y $T(\lambda v) = \lambda T(v)$ ([[al-transformacion|transformaciones lineales]]). Su **núcleo** es $\operatorname{Nu}(T) = \{v : T(v) = 0\}$ y su **imagen**, $\operatorname{Im}(T) = \{T(v) : v \in V\}$: son subespacios de $V$ y de $W$.`,
        R`**Existencia y unicidad.** Si $\{v_1, \dots, v_n\}$ es una base de $V$ y $w_1, \dots, w_n$ son vectores cualesquiera de $W$, existe una única transformación lineal con $T(v_i) = w_i$.`,
        R`**Teorema de la dimensión.** Si $\dim V$ es finita, $$\dim\operatorname{Nu}(T) + \dim\operatorname{Im}(T) = \dim V.$$`,
        R`$T$ es **monomorfismo** (inyectiva) si y solo si $\operatorname{Nu}(T) = \{0\}$; **epimorfismo** si $\operatorname{Im}(T) = W$; **isomorfismo** si es las dos cosas. Si $\dim V = \dim W$ (finita), las tres condiciones son equivalentes. $V$ y $W$ son isomorfos si y solo si $\dim V = \dim W$.`,
        R`La imagen de un subespacio y la **preimagen** de un subespacio por una transformación lineal son subespacios.`],
      idea: [R`El teorema de la dimensión es un balance: de las $\dim V$ direcciones del dominio, las del núcleo se «aplastan» y las demás sobreviven en la imagen. No se crea dimensión de la nada.`,
        R`Por eso no hay inyectivas de $\mathbb R^3$ en $\mathbb R^2$ (algo se tiene que aplastar) ni sobreyectivas de $\mathbb R^2$ en $\mathbb R^3$ (no alcanza).`,
        R`Para **definir** una transformación con cierto núcleo e imagen: se elige una base del núcleo, se la extiende a una base del dominio y se manda cada vector agregado a un generador de la imagen.`],
      demo: [R`**Paso 1 (base adaptada).** Sea $\{u_1, \dots, u_k\}$ una base de $\operatorname{Nu}(T)$. Se [[a2-base|extiende]] a una base $\{u_1, \dots, u_k, v_1, \dots, v_r\}$ de $V$, con $k + r = \dim V$.`,
        R`**Paso 2 (los $T(v_j)$ generan la imagen).** Si $w = T(v)$ con $v = \sum a_iu_i + \sum b_jv_j$, entonces $w = \sum b_jT(v_j)$, porque $T(u_i) = 0$.`,
        R`**Paso 3 (son independientes).** Si $\sum b_jT(v_j) = 0$, entonces $T\left(\sum b_jv_j\right) = 0$: $\sum b_jv_j$ está en el núcleo y es combinación de los $u_i$. Eso es una relación lineal entre vectores de la base de $V$, así que todos los coeficientes son cero.`,
        R`**Paso 4 (contar).** $\{T(v_1), \dots, T(v_r)\}$ es una base de $\operatorname{Im}(T)$: $\dim\operatorname{Im}(T) = r = \dim V - k$. $\blacksquare$`,
        R`**Paso 5 (inyectiva ⇔ núcleo nulo).** Si $T(u) = T(v)$, entonces $T(u - v) = 0$. Con núcleo nulo, $u = v$. Recíprocamente, si $T$ es inyectiva, $T(v) = 0 = T(0)$ obliga a $v = 0$.`],
      examples: [{ q: R`$T: \mathbb R_2[x] \to \mathbb R^3$, $T(p) = (p(0), p(1), p(2))$. Núcleo e imagen.`, steps: [R`Si $T(p) = 0$, $p$ tiene tres raíces y grado $\le 2$: $p = 0$. Núcleo nulo.`, R`$\dim\operatorname{Im} = 3 - 0 = 3$: $T$ es un isomorfismo (por cada terna de valores hay un único polinomio interpolador).`] },
        { q: R`¿Es inversible $T(p) = p + p' + p''$ en $\mathbb R_3[x]$?`, steps: [R`Si $p \ne 0$ tiene grado $d$, $p + p' + p''$ también tiene grado $d$ (las derivadas bajan el grado): no puede ser $0$. Núcleo nulo y mismo espacio de salida y llegada: es un isomorfismo.`] }],
      tips: [R`En el teorema de la dimensión, lo que va a la derecha es la dimensión del **dominio**, no la del espacio de llegada.`],
      see: ["al-transformacion", "al-nucleo-imagen", "a2-base", "a2-matriz-tl"]
    },
    "a2-matriz-tl": {
      title: "Matriz de una transformación lineal y semejanza", aliases: ["matriz de una transformación en dos bases", "semejanza de matrices", "espacio de transformaciones lineales"], concepts: ["a2-matriz-tl"],
      summary: "La columna j de [T]_{BB'} son las coordenadas en B' de T(vⱼ). Así [T(v)]_{B'} = [T]_{BB'} [v]_B, y componer es multiplicar. Al cambiar de base, la matriz de un operador pasa a P⁻¹AP: matrices semejantes.",
      def: [R`Sean $B = \{v_1, \dots, v_n\}$ base de $V$ y $B' = \{w_1, \dots, w_m\}$ base de $W$. La **matriz de $T$** en esas bases, $[T]_{BB'} \in F^{m\times n}$, tiene por columna $j$ las [[a2-coordenadas|coordenadas]] en $B'$ de $T(v_j)$. Cumple $$[T(v)]_{B'} = [T]_{BB'}\,[v]_B.$$`,
        R`**Composición e inversa.** $[S\circ T]_{BB''} = [S]_{B'B''}\,[T]_{BB'}$, y $T$ es un isomorfismo si y solo si su matriz es inversible, con $[T^{-1}] = [T]^{-1}$ ([[al-composicion|composición e isomorfismos]]).`,
        R`El conjunto $L(V, W)$ de las transformaciones lineales es un espacio vectorial, y $T \mapsto [T]_{BB'}$ es un isomorfismo con $F^{m\times n}$: $\dim L(V, W) = \dim V\cdot\dim W$.`,
        R`**Semejanza.** Si $T: V \to V$ es un operador y $P$ es la matriz de cambio de la base $B'$ a la base $B$, $$[T]_{B'} = P^{-1}\,[T]_B\,P.$$ Dos matrices $A$ y $A'$ son **semejantes** si $A' = P^{-1}AP$ para alguna $P$ inversible: representan al mismo operador en bases distintas. Tienen el mismo determinante, la misma traza, el mismo rango y el mismo polinomio característico.`],
      idea: [R`Una vez elegidas las bases, toda transformación lineal «es» una matriz, y todo el cálculo (núcleo, imagen, inversa) se hace escalonando.`,
        R`La pregunta de fondo de la materia: **¿en qué base la matriz de un operador es lo más simple posible?** Diagonalizar, triangular y la forma de Jordan son respuestas a eso.`],
      demo: [R`**Paso 1 (la fórmula).** Si $v = \sum_j c_jv_j$, por linealidad $T(v) = \sum_j c_jT(v_j)$. Tomando coordenadas en $B'$ (que es lineal): $[T(v)]_{B'} = \sum_j c_j[T(v_j)]_{B'}$, que es la combinación de las columnas de $[T]_{BB'}$ con coeficientes $c_j$: el producto $[T]_{BB'}[v]_B$.`,
        R`**Paso 2 (composición).** Para todo $v$: $[S(T(v))]_{B''} = [S]\,[T(v)]_{B'} = [S][T][v]_B$. Como una matriz queda determinada por lo que le hace a todas las columnas, $[S\circ T] = [S][T]$.`,
        R`**Paso 3 (cambio de base).** Con $[v]_B = P[v]_{B'}$: $[T(v)]_{B'} = P^{-1}[T(v)]_B = P^{-1}[T]_B[v]_B = P^{-1}[T]_BP\,[v]_{B'}$. $\blacksquare$`,
        R`**Paso 4 (invariantes).** $\det(P^{-1}AP) = \det(P)^{-1}\det(A)\det(P) = \det A$. Para la traza se usa $\operatorname{tr}(XY) = \operatorname{tr}(YX)$: $\operatorname{tr}(P^{-1}AP) = \operatorname{tr}(APP^{-1}) = \operatorname{tr}A$.`],
      examples: [{ q: R`Matriz de $D(p) = p'$ en la base $\{1, x, x^2\}$ de $\mathbb R_2[x]$.`, steps: [R`$D(1) = 0$, $D(x) = 1$, $D(x^2) = 2x$: columnas $(0,0,0)$, $(1,0,0)$, $(0,2,0)$.`, R`$[D] = \begin{pmatrix} 0 & 1 & 0 \\ 0 & 0 & 2 \\ 0 & 0 & 0\end{pmatrix}$, que es nilpotente: derivar tres veces anula todo.`] }],
      tips: [R`Las coordenadas de $T(v_j)$ van en **columna**. Ponerlas en fila da la traspuesta.`],
      see: ["al-matriz-asociada", "al-composicion", "a2-coordenadas", "a2-tl"]
    },
    "a2-nilpotente": {
      title: "Proyectores, involuciones y operadores nilpotentes", aliases: ["operador nilpotente", "matriz nilpotente", "índice de nilpotencia", "proyector", "operador idempotente", "involución lineal"], concepts: ["a2-nilpotente"],
      summary: "Proyector: p² = p; entonces V = Nu(p) ⊕ Im(p). Involución: j² = id; V es suma directa de los fijos y los anti-fijos. Nilpotente: f^s = 0 para algún s; en dimensión n, f^n = 0, y f no es ni inyectiva ni sobreyectiva.",
      def: [R`Un operador $p: V \to V$ es un **proyector** si $p\circ p = p$. Entonces $V = \operatorname{Nu}(p) \oplus \operatorname{Im}(p)$, y $p$ es la proyección sobre $\operatorname{Im}(p)$ en la dirección de $\operatorname{Nu}(p)$. Recíprocamente, toda descomposición $V = U \oplus W$ define un proyector.`,
        R`Una **involución** es un operador con $j\circ j = \operatorname{id}$. Si en el cuerpo $2 \ne 0$, $V = S \oplus A$ con $S = \{v : j(v) = v\}$ y $A = \{v : j(v) = -v\}$.`,
        R`$f$ es **nilpotente** si $f^s = 0$ para algún $s \ge 1$; el menor $s$ es su **índice de nilpotencia**. Si $\dim V = n$: $f$ es nilpotente si y solo si $f^n = 0$; un nilpotente (con $V \ne \{0\}$) no es monomorfismo ni epimorfismo; y su único [[al-autovalores|autovalor]] es $0$.`],
      idea: [R`Son los tres tipos de operador más simples después de los múltiplos de la identidad, y cada uno satisface un polinomio: $x^2 - x$, $x^2 - 1$ y $x^s$. Ese polinomio decide casi todo sobre el operador (su polinomio minimal, que se ve más adelante).`,
        R`Ejemplos de involuciones: trasponer matrices ($S$ son las simétricas y $A$ las antisimétricas), o $f(x) \mapsto f(-x)$ (pares e impares).`,
        R`El nilpotente típico es **derivar** en $\mathbb R_n[x]$: cada aplicación baja el grado, y después de $n + 1$ no queda nada. En una base adecuada, un nilpotente «corre» los vectores: $v_1 \mapsto v_2 \mapsto \dots \mapsto v_n \mapsto 0$.`],
      demo: [R`**Paso 1 (proyector: se descompone).** Para todo $v$: $v = (v - p(v)) + p(v)$. El segundo está en la imagen; el primero en el núcleo, porque $p(v - p(v)) = p(v) - p^2(v) = 0$.`,
        R`**Paso 2 (proyector: la suma es directa).** Si $v \in \operatorname{Nu}(p)\cap\operatorname{Im}(p)$, entonces $v = p(u)$ y $0 = p(v) = p^2(u) = p(u) = v$.`,
        R`**Paso 3 (nilpotente: no es inyectiva).** Sea $s$ el índice, así que $f^{s-1} \ne 0$: existe $v$ con $w = f^{s-1}(v) \ne 0$. Pero $f(w) = f^s(v) = 0$: el núcleo no es nulo. En dimensión finita tampoco es sobreyectiva (teorema de la dimensión); en general, si lo fuera, $f^s$ también lo sería, y $f^s = 0$.`,
        R`**Paso 4 (la cadena de núcleos).** Siempre $\operatorname{Nu}(f^i) \subseteq \operatorname{Nu}(f^{i+1})$. Si en algún paso hay igualdad, $\operatorname{Nu}(f^i) = \operatorname{Nu}(f^{i+1})$, la hay en todos los siguientes: si $f^{i+2}(v) = 0$, entonces $f(v) \in \operatorname{Nu}(f^{i+1}) = \operatorname{Nu}(f^i)$, o sea $f^{i+1}(v) = 0$.`,
        R`**Paso 5 ($f^n = 0$).** Mientras la cadena crece, la dimensión sube al menos $1$ por paso, y no puede pasar de $n$: se estabiliza a lo sumo en el paso $n$. Como $f^s = 0$, el valor estable es todo $V$. Entonces $\operatorname{Nu}(f^n) = V$, es decir, $f^n = 0$. $\blacksquare$`],
      examples: [{ q: R`Si $N$ es de $2\times2$ con $N^2 = 0$ y $N \ne 0$, mostrá que es semejante a $\begin{pmatrix} 0 & 0 \\ 1 & 0\end{pmatrix}$.`, steps: [R`Sea $v$ con $Nv \ne 0$. $\{v, Nv\}$ es independiente: si $av + bNv = 0$, aplicando $N$ queda $aNv = 0$, así que $a = 0$ y luego $b = 0$.`, R`En esa base, $N(v) = Nv$ (segundo vector) y $N(Nv) = 0$: la matriz es $\begin{pmatrix} 0 & 0 \\ 1 & 0\end{pmatrix}$.`] }],
      see: ["a2-tl", "a2-suma", "al-jordan", "al-autovalores"]
    }
  };

  E.extendCourse("m203", {
    concepts: { "a2-tl": { name: "Núcleo, imagen e isomorfismos" }, "a2-matriz-tl": { name: "Matriz de una transformación" }, "a2-nilpotente": { name: "Proyectores y nilpotentes" } },
    templates: T,
    units: [{
      id: "a2-tl-u", order: 2, program: "Unidad 2", title: "Transformaciones lineales", icon: "zap",
      diagnostic: ["a2-nucleo-imagen-multi", "a2-definir-tl-num", "a2-nilpotente-num"],
      lessons: [
        { id: "a2-tl", title: "Núcleo, imagen e isomorfismos", templates: ["a2-nucleo-imagen-multi", "a2-iso-vf", "a2-definir-tl-num"], theory: ["a2-tl"],
          intro: R`$\dim\operatorname{Nu}(T) + \dim\operatorname{Im}(T) = \dim V$. Inyectiva si y solo si el núcleo es nulo.` },
        { id: "a2-matriz-tl", title: "Matriz en una base y nilpotentes", templates: ["a2-matriz-tl-num", "a2-nilpotente-num"], theory: ["a2-matriz-tl", "a2-nilpotente"],
          intro: R`La columna $j$ de $[T]_B$ son las coordenadas de $T(v_j)$. Al cambiar de base: $P^{-1}AP$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 3 · ESPACIO DUAL: FUNCIONALES, BASE DUAL, ANULADOR, TRASPUESTA Y BIDUAL
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, A = E.a2;
  const T = {};
  const VN = ["x", "y", "z"];
  const simpson = (f, a, b, n = 200) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3; };
  const ORD = ["primer", "segundo", "tercer"];

  T["a2-base-dual-num"] = {
    type: "numeric", concepts: ["a2-dual"], difficulty: 2,
    generate(r) {
      const n = r.pick([2, 3, 3]), P = A.unimod(r, n, n + 1), Q = A.inv(P).map(row => row.map(x => Math.round(x))), base = A.T(P), i = r.int(0, n - 1), ask = r.pick(["coef", "val"]);
      const j = r.int(0, n - 1), v = Array.from({ length: n }, () => r.int(-3, 3)), val = Q[i].reduce((s, c, k) => s + c * v[k], 0);
      const phiT = H.poly(Q[i].map((c, k) => [c, VN[k]]));
      return {
        prompt: `Sea $B = \\{${base.map(A.v).join(",\\ ")}\\}$ una base de $\\mathbb R^{${n}}$ y $B^* = \\{\\varphi_1, ${n === 3 ? "\\varphi_2, \\varphi_3" : "\\varphi_2"}\\}$ su base dual. ${ask === "coef" ? `Si $\\varphi_${i + 1}(${VN.slice(0, n).join(", ")}) = ${VN.slice(0, n).map((x, k) => `c_${k + 1}${x}`).join(" + ")}$, ¿cuánto vale $c_${j + 1}$?` : `¿Cuánto vale $\\varphi_${i + 1}${A.v(v)}$?`}`,
        answer: ask === "coef" ? Q[i][j] : val,
        solution: [`La [[a2-dual|base dual]] está definida por $\\varphi_i(v_j) = \\delta_{ij}$: $\\varphi_i$ le asigna a cada vector su $i$-ésima coordenada en la base $B$.`,
          `Si $P$ es la matriz que tiene a los vectores de $B$ como columnas, las filas de $P^{-1}$ son los coeficientes de los funcionales: $P^{-1} = ${A.pm(Q)}$.`,
          `$\\varphi_${i + 1}(${VN.slice(0, n).join(", ")}) = ${phiT}$${ask === "val" ? `, y $\\varphi_${i + 1}${A.v(v)} = ${val}$` : `: $c_${j + 1} = ${Q[i][j]}$`}.`],
        // verificación: el funcional hallado vale 1 en su vector de la base y 0 en los demás (y, si se pide un valor, se recalcula con las coordenadas de v)
        verify: ask === "coef" ? { kind: "zero", fn: () => base.map((b, k) => Q[i].reduce((s, c, q) => s + c * b[q], 0) - (k === i ? 1 : 0)) } : { kind: "value", fn: () => A.solve(P, v)[i] }
      };
    }
  };

  T["a2-dual-funcionales-num"] = {
    type: "numeric", concepts: ["a2-dual"], difficulty: 3,
    generate(r) {
      const [a, b] = r.distinct(2, 1, 4), kind = r.pick(["int", "int", "eval", "mix"]);
      // dos funcionales sobre R₁[t] (polinomios α + βt), dados como operadores sobre funciones
      const F = {
        int: { t: [`\\varphi_1(p) = \\displaystyle\\int_0^{${a}} p(t)\\,dt`, `\\varphi_2(p) = \\displaystyle\\int_0^{${b}} p(t)\\,dt`], f: [p => simpson(p, 0, a), p => simpson(p, 0, b)], M: [[a, a * a / 2], [b, b * b / 2]] },
        eval: { t: [`\\varphi_1(p) = p(${a})`, `\\varphi_2(p) = p(${b})`], f: [p => p(a), p => p(b)], M: [[1, a], [1, b]] },
        mix: { t: [`\\varphi_1(p) = p(${a})`, `\\varphi_2(p) = \\displaystyle\\int_0^{${b}} p(t)\\,dt`], f: [p => p(a), p => simpson(p, 0, b)], M: [[1, a], [b, b * b / 2]] }
      }[kind];
      const det = F.M[0][0] * F.M[1][1] - F.M[0][1] * F.M[1][0];
      if (Math.abs(det) < 1e-9) return null;
      // v_k = α + βt con φ_i(v_k) = δ_ik: las columnas de M⁻¹
      const Mi = [[F.M[1][1] / det, -F.M[0][1] / det], [-F.M[1][0] / det, F.M[0][0] / det]], k = r.int(0, 1), which = r.int(0, 1), ans = Mi[which][k];
      const fr = x => { for (let q = 1; q <= 48; q++) if (Math.abs(x * q - Math.round(x * q)) < 1e-9) return H.frac(Math.round(x * q), q); return A.dn(x, 4); };
      return {
        prompt: `En $V = \\mathbb R_1[t] = \\{\\alpha + \\beta t\\}$ se consideran los funcionales $${F.t[0]}$ y $${F.t[1]}$, que forman una base de $V^*$. Sea $\\{v_1, v_2\\}$ la base de $V$ de la que son base dual. Si $v_${k + 1} = \\alpha + \\beta t$, ¿cuánto vale $${which ? "\\beta" : "\\alpha"}$?`,
        answer: ans, answerTex: fr(ans),
        solution: [`Se busca $v_${k + 1} = \\alpha + \\beta t$ con $\\varphi_${k + 1}(v_${k + 1}) = 1$ y $\\varphi_${2 - k}(v_${k + 1}) = 0$ ([[a2-dual|base dual]]).`,
          `Aplicando los funcionales a $\\alpha + \\beta t$: $\\varphi_1 = ${fr(F.M[0][0])}\\,\\alpha + ${fr(F.M[0][1])}\\,\\beta$ y $\\varphi_2 = ${fr(F.M[1][0])}\\,\\alpha + ${fr(F.M[1][1])}\\,\\beta$. El determinante de ese sistema es $${fr(det)} \\ne 0$: por eso los funcionales son independientes.`,
          `Resolviendo: $v_${k + 1} = ${fr(Mi[0][k])} ${Mi[1][k] < 0 ? "-" : "+"} ${fr(Math.abs(Mi[1][k]))}\\,t$.`],
        // verificación: los funcionales (integrales por Simpson o evaluaciones) aplicados al polinomio hallado dan 1 y 0
        verify: { kind: "zero", tol: 1e-8, fn: () => { const p = t => Mi[0][k] + Mi[1][k] * t; return [F.f[k](p) - 1, F.f[1 - k](p)]; } }
      };
    }
  };

  T["a2-anulador-num"] = {
    type: "numeric", concepts: ["a2-anulador"], difficulty: 2,
    generate(r) {
      const n = r.pick([3, 4, 4, 5]), k = r.int(1, 3), gens = Array.from({ length: k }, () => Array.from({ length: n }, () => r.int(-2, 3)));
      if (k >= 2 && r.bool(0.4)) gens.push(gens[0].map((x, i) => x + gens[1][i]));
      const d = A.rank(gens);
      if (d === 0 || d >= n) return null;
      return {
        prompt: `En $\\mathbb R^{${n}}$, sea $S = \\langle ${gens.map(A.v).join(",\\ ")}\\rangle$. ¿Cuál es la dimensión de su anulador $S^\\circ \\subseteq (\\mathbb R^{${n}})^*$?`,
        answer: n - d,
        traps: [{ value: d, msg: "Esa es la dimensión de $S$. La del anulador es lo que falta para llegar a la del espacio." }].filter(t => t.value !== n - d),
        solution: [`El [[a2-anulador|anulador]] de $S$ son los funcionales que se anulan en todo $S$, y $\\dim S^\\circ = \\dim V - \\dim S$.`,
          `Escalonando los generadores, $\\dim S = ${d}$${gens.length > d ? " (hay un generador que es combinación de los otros)" : ""}. Entonces $\\dim S^\\circ = ${n} - ${d} = ${n - d}$.`,
          `Dicho de otro modo: hacen falta $${n - d}$ ecuaciones lineales independientes para describir a $S$.`],
        // verificación: un funcional (c₁, …, cₙ) está en el anulador si se anula en cada generador: es el núcleo de la matriz de generadores
        verify: { kind: "nullity", A: gens }
      };
    }
  };

  T["a2-traza-num"] = {
    type: "numeric", concepts: ["a2-dual"], difficulty: 3,
    generate(r) {
      const c = [[r.int(-5, 5), r.nz(-5, 5)], [r.nz(-5, 5), r.int(-5, 5)]], i = r.int(0, 1), j = r.int(0, 1);
      if (c[0][1] === c[1][0]) return null;
      // tr(aX) = Σ a_ij x_ji: el coeficiente de x_ij es a_ji
      const a = A.T(c), terms = [[c[0][0], "x_{11}"], [c[0][1], "x_{12}"], [c[1][0], "x_{21}"], [c[1][1], "x_{22}"]];
      return {
        prompt: `Todo funcional lineal sobre $\\mathbb R^{2\\times2}$ es de la forma $f_a(X) = \\operatorname{tr}(aX)$ para una única matriz $a$. Si $f(X) = ${H.poly(terms)}$, ¿cuánto vale la entrada $a_{${i + 1}${j + 1}}$ de esa matriz?`,
        answer: a[i][j],
        traps: [{ value: c[i][j], msg: "Ojo con el orden de los índices: en $\\operatorname{tr}(aX) = \\sum a_{ij}x_{ji}$, la entrada $a_{ij}$ acompaña a $x_{ji}$, no a $x_{ij}$." }].filter(t => t.value !== a[i][j]),
        solution: [`$\\operatorname{tr}(aX) = \\sum_i (aX)_{ii} = \\sum_{i,j} a_{ij}\\,x_{ji}$: el coeficiente de $x_{ji}$ es $a_{ij}$ ([[a2-dual|funcionales lineales]]).`,
          `Leyendo los coeficientes de $f$ y trasponiendo: $a = ${A.pm(a)}$.`, `$a_{${i + 1}${j + 1}} = ${a[i][j]}$ (el coeficiente de $x_{${j + 1}${i + 1}}$).`],
        // verificación: tr(a·E_pq) calculada con el producto de matrices tiene que dar el coeficiente de x_pq
        verify: { kind: "zero", fn: () => { const out = []; for (let p = 0; p < 2; p++) for (let q = 0; q < 2; q++) { const Epq = [[0, 0], [0, 0]]; Epq[p][q] = 1; const M = A.mul(a, Epq); out.push(M[0][0] + M[1][1] - c[p][q]); } return out; } }
      };
    }
  };

  const rnd = (r, m, n) => Array.from({ length: m }, () => Array.from({ length: n }, () => r.int(-3, 3)));
  const DUAL = [
    { t: R`si $\dim V = n$ es finita, $\dim V^* = n$`, v: true, why: R`La base dual de una base de $V$ tiene $n$ elementos y es una base de $V^*$.`,
      test: r => [2, 3, 4].every(n => { const P = A.unimod(r, n, n + 1); return A.rank(A.inv(P)) === n; }) },
    { t: R`el núcleo de un funcional lineal no nulo sobre un espacio de dimensión $n$ tiene dimensión $n - 1$`, v: true, why: R`Un funcional no nulo es sobreyectivo (su imagen es un subespacio no nulo de $F$, que tiene dimensión 1). Por el teorema de la dimensión, el núcleo tiene dimensión $n - 1$: es un hiperplano.`,
      test: r => [3, 4, 5].every(n => { const f = [Array.from({ length: n }, (_, i) => (i === 0 ? r.nz(-3, 3) : r.int(-3, 3)))]; return A.kernel(f).length === n - 1; }) },
    { t: R`$n$ funcionales cualesquiera, distintos y no nulos, sobre un espacio de dimensión $n$ forman una base de $V^*$`, v: false, why: R`Tienen que ser linealmente independientes. En $\mathbb R^2$, $\varphi_1(x, y) = x$ y $\varphi_2(x, y) = 2x$ son distintos y no nulos, pero uno es múltiplo del otro.`,
      test: () => A.rank([[1, 0], [2, 0]]) === 2 },
    { t: R`una transformación lineal y su traspuesta tienen el mismo rango`, v: true, why: R`$\operatorname{Im}(T^t) = (\operatorname{Nu} T)^\circ$, cuya dimensión es $\dim V - \dim\operatorname{Nu}T = \operatorname{rg}T$. En matrices: el rango por filas es igual al rango por columnas.`,
      test: r => [[2, 4], [3, 3], [4, 2], [3, 5]].every(([m, n]) => { const M = rnd(r, m, n); M[m - 1] = M[0].map(x => 2 * x); return A.rank(M) === A.rank(A.T(M)); }) },
    { t: R`si $S \subseteq T$ son subespacios de $V$, entonces $S^\circ \subseteq T^\circ$`, v: false, why: R`Es al revés: $T^\circ \subseteq S^\circ$. Anularse en un conjunto más grande es más difícil, así que hay menos funcionales que lo logran.`,
      test: () => { const S = [[1, 0, 0]], Tt = [[1, 0, 0], [0, 1, 0]], aS = A.kernel(S), aT = A.kernel(Tt); return aS.every(f => A.rank([...aT, f]) === aT.length); } },
    { t: R`en dimensión finita, $\dim S + \dim S^\circ = \dim V$`, v: true, why: R`Extendiendo una base de $S$ a una de $V$, los funcionales de la base dual que corresponden a los vectores agregados forman una base de $S^\circ$.`,
      test: r => [3, 4, 5].every(n => { const G = rnd(r, 2, n); return A.rank(G) + A.kernel(G).length === n; }) },
    { t: R`la base dual de la base canónica de $\mathbb R^n$ está formada por las funciones coordenadas $\varphi_i(x_1, \dots, x_n) = x_i$`, v: true, why: R`$\varphi_i(e_j)$ es la coordenada $i$ de $e_j$: vale $1$ si $i = j$ y $0$ si no.`,
      test: () => [2, 3, 4].every(n => A.inv(A.eye(n)).every((row, i) => row.every((x, j) => Math.abs(x - (i === j ? 1 : 0)) < 1e-12))) },
    { t: R`si $\varphi$ y $\psi$ son funcionales sobre $V$ con el mismo núcleo, entonces $\psi = \lambda\varphi$ para algún escalar $\lambda$`, v: true, why: R`Si son no nulos, se elige $v_0$ fuera del núcleo y $\lambda = \frac{\psi(v_0)}{\varphi(v_0)}$: $\psi - \lambda\varphi$ se anula en el núcleo y en $v_0$, que juntos generan $V$. (Si uno es nulo, el núcleo es todo $V$ y el otro también es nulo.)`,
      test: r => [3, 4].every(n => { const f = Array.from({ length: n }, () => r.nz(-3, 3)), K = A.kernel([f]); return A.kernel(K).length === 1; }) },
    { t: R`la identificación de $V$ con su bidual $V^{**}$, $v \mapsto L_v$ con $L_v(\varphi) = \varphi(v)$, necesita que se elija una base de $V$`, v: false, why: R`Esa aplicación se define sin mencionar ninguna base: es un isomorfismo **canónico**. En cambio, para identificar $V$ con $V^*$ sí hay que elegir una base (o un producto interno).`,
      test: () => false }
  ];
  T["a2-dual-vf"] = {
    type: "tf", concepts: ["a2-dual", "a2-anulador", "a2-traspuesta"], difficulty: 2,
    generate(r) {
      const S = r.pick(DUAL);
      return {
        prompt: `<b>Verdadero o falso:</b> ${S.t}.`,
        answer: S.v,
        explanation: `${S.v ? "Verdadero" : "Falso"}. ${S.why}`,
        solution: [`Ver [[a2-dual|espacio dual]], [[a2-anulador|anulador]] y [[a2-traspuesta|traspuesta y bidual]].`],
        // verificación: cada afirmación se pone a prueba con matrices concretas (rangos y núcleos por eliminación)
        verify: { kind: "truth", fn: () => S.test(E.rng(77)) }
      };
    }
  };

  const cards = {
    "a2-dual": {
      title: "Espacio dual, funcionales lineales y base dual", aliases: ["espacio dual", "funcional lineal", "funcionales lineales", "base dual", "forma lineal", "covector"], concepts: ["a2-dual"],
      summary: "Un funcional lineal es una transformación lineal φ: V → F. Forman el espacio dual V*, con dim V* = dim V. La base dual de {v₁, …, vₙ} es {φ₁, …, φₙ} con φᵢ(vⱼ) = δᵢⱼ: φᵢ da la i-ésima coordenada.",
      def: [R`Un **funcional lineal** sobre $V$ es una [[a2-tl|transformación lineal]] $\varphi: V \to F$. El conjunto de todos, $V^* = L(V, F)$, es el **espacio dual** de $V$.`,
        R`**Ejemplos.** En $F^n$: $\varphi(x) = c_1x_1 + \dots + c_nx_n$ (y son todos). En polinomios: evaluar en un punto, $p \mapsto p(a)$, o integrar, $p \mapsto \int_a^b p$. En matrices: la traza, y más en general $X \mapsto \operatorname{tr}(aX)$.`,
        R`**Base dual.** Si $B = \{v_1, \dots, v_n\}$ es una base de $V$, existen funcionales únicos $\varphi_1, \dots, \varphi_n$ con $$\varphi_i(v_j) = \delta_{ij} = \begin{cases} 1 & i = j \\ 0 & i \ne j\end{cases}$$ y $B^* = \{\varphi_1, \dots, \varphi_n\}$ es una base de $V^*$. En particular $\dim V^* = \dim V$. Además, para todo $v \in V$ y $\varphi \in V^*$: $$v = \sum_i \varphi_i(v)\,v_i,\qquad \varphi = \sum_i \varphi(v_i)\,\varphi_i.$$`],
      idea: [R`Un funcional es una «medición» lineal: le asigna un número a cada vector. $\varphi_i$ es la medición «¿cuál es tu $i$-ésima coordenada en la base $B$?».`,
        R`En $\mathbb R^n$ con columnas, un funcional es una **fila**: $\varphi(x) = (c_1\ \cdots\ c_n)\,x$. Si los vectores de $B$ son las columnas de $P$, los funcionales de la base dual son las filas de $P^{-1}$, porque $P^{-1}P = I$ dice justamente $\varphi_i(v_j) = \delta_{ij}$.`,
        R`Cada $\varphi_i$ depende de **toda** la base, no solo de $v_i$: si se cambia otro vector de la base, $\varphi_i$ cambia.`,
        R`El problema inverso (dados los funcionales, hallar la base de la que son duales) es un sistema: se pide $\varphi_i(v_j) = \delta_{ij}$ para un $v_j$ genérico.`],
      demo: [R`**Paso 1 (existen).** Una transformación lineal queda determinada por sus valores en una base, y esos valores se eligen libremente ([[a2-tl|existencia y unicidad]]). Se define $\varphi_i$ por $\varphi_i(v_j) = \delta_{ij}$.`,
        R`**Paso 2 (son independientes).** Si $\sum_i c_i\varphi_i = 0$ (el funcional nulo), evaluando en $v_j$: $0 = \sum_i c_i\delta_{ij} = c_j$. Todos los coeficientes son cero.`,
        R`**Paso 3 (generan).** Dado $\varphi \in V^*$, sea $\psi = \sum_i \varphi(v_i)\,\varphi_i$. Entonces $\psi(v_j) = \varphi(v_j)$ para todo $j$: $\psi$ y $\varphi$ coinciden en una base, así que son iguales.`,
        R`**Paso 4 (la fórmula para $v$).** Si $v = \sum_j c_jv_j$, aplicando $\varphi_i$: $\varphi_i(v) = \sum_j c_j\delta_{ij} = c_i$. $\blacksquare$`],
      examples: [{ q: R`Base dual de $B = \{(1, 1), (1, 2)\}$ en $\mathbb R^2$.`, steps: [R`$P = \begin{pmatrix} 1 & 1 \\ 1 & 2\end{pmatrix}$, $P^{-1} = \begin{pmatrix} 2 & -1 \\ -1 & 1\end{pmatrix}$.`, R`$\varphi_1(x, y) = 2x - y$ y $\varphi_2(x, y) = -x + y$. Control: $\varphi_1(1, 1) = 1$, $\varphi_1(1, 2) = 0$.`] },
        { q: R`En $\mathbb R_1[t]$, $\varphi_1(p) = \int_0^1 p$ y $\varphi_2(p) = \int_0^2 p$. Hallá $\{v_1, v_2\}$ con base dual $\{\varphi_1, \varphi_2\}$.`, steps: [R`Para $p = \alpha + \beta t$: $\varphi_1 = \alpha + \frac\beta2$ y $\varphi_2 = 2\alpha + 2\beta$.`, R`$v_1$: $\alpha + \frac\beta2 = 1$, $2\alpha + 2\beta = 0$ da $v_1 = 2 - 2t$. $v_2$: $\alpha + \frac\beta2 = 0$, $2\alpha + 2\beta = 1$ da $v_2 = -\frac12 + t$.`] }],
      tips: [R`Para probar que $n$ funcionales son base de $V^*$ (con $\dim V = n$) alcanza con ver que son independientes: por ejemplo, que la matriz de sus valores en una base tenga determinante no nulo.`],
      see: ["a2-tl", "a2-coordenadas", "a2-anulador", "a2-traspuesta"]
    },
    "a2-anulador": {
      title: "Anulador de un subespacio", aliases: ["anulador", "anulador de un subespacio", "hiperplano", "subespacio aniquilador"], concepts: ["a2-anulador"],
      summary: "S° = {φ ∈ V* : φ(s) = 0 para todo s ∈ S}. Es un subespacio de V*, con dim S° = dim V − dim S. Describe a S por ecuaciones: S es la intersección de los núcleos de los funcionales de S°.",
      def: [R`El **anulador** de un subconjunto $S \subseteq V$ es $$S^\circ = \{\varphi \in V^* : \varphi(s) = 0 \text{ para todo } s \in S\}.$$ Es un subespacio de $V^*$. Si $S$ es un subespacio y $\dim V$ es finita, $$\dim S + \dim S^\circ = \dim V.$$`,
        R`**Propiedades.** Si $S \subseteq T$, entonces $T^\circ \subseteq S^\circ$. $(S + T)^\circ = S^\circ \cap T^\circ$ y $(S \cap T)^\circ = S^\circ + T^\circ$. Identificando $V$ con su bidual, $(S^\circ)^\circ = S$.`,
        R`Un **hiperplano** es un subespacio de dimensión $n - 1$: es el núcleo de un funcional no nulo. Todo subespacio de dimensión $k$ es intersección de $n - k$ hiperplanos.`],
      idea: [R`Un subespacio se puede dar de dos maneras: por **generadores** (una base de $S$) o por **ecuaciones** (una base de $S^\circ$). El anulador es el puente entre las dos descripciones.`,
        R`Cuantos más vectores tiene $S$, más difícil es anularse en todos: el anulador se achica. Por eso las inclusiones se dan vuelta.`,
        R`En $\mathbb R^n$ con el producto escalar, el anulador de $S$ se identifica con el complemento ortogonal $S^\perp$. Pero el anulador no necesita ningún producto interno: existe sobre cualquier cuerpo.`],
      demo: [R`**Paso 1 (base adaptada).** Sea $\{v_1, \dots, v_k\}$ una base de $S$, extendida a una base $\{v_1, \dots, v_n\}$ de $V$, y $\{\varphi_1, \dots, \varphi_n\}$ su [[a2-dual|base dual]].`,
        R`**Paso 2 (los últimos están en el anulador).** Para $i > k$ y $j \le k$: $\varphi_i(v_j) = 0$. Como $\varphi_i$ se anula en una base de $S$, se anula en todo $S$.`,
        R`**Paso 3 (generan el anulador).** Si $\varphi \in S^\circ$, por la fórmula de la base dual $\varphi = \sum_{i=1}^n \varphi(v_i)\varphi_i$, y $\varphi(v_i) = 0$ para $i \le k$. Queda $\varphi = \sum_{i>k}\varphi(v_i)\varphi_i$.`,
        R`**Paso 4 (contar).** $\{\varphi_{k+1}, \dots, \varphi_n\}$ es independiente (es parte de una base) y genera $S^\circ$: $\dim S^\circ = n - k$. $\blacksquare$`],
      examples: [{ q: R`Anulador de $S = \langle(1, 0, -1, 1), (2, 3, -1, 2)\rangle$ en $\mathbb R^4$.`, steps: [R`$\varphi = (c_1, c_2, c_3, c_4)$ está en $S^\circ$ si $c_1 - c_3 + c_4 = 0$ y $2c_1 + 3c_2 - c_3 + 2c_4 = 0$.`, R`Es un sistema de rango 2 con 4 incógnitas: $\dim S^\circ = 2$. Cada solución da una ecuación de $S$.`] }],
      see: ["a2-dual", "a2-suma", "a2-traspuesta"]
    },
    "a2-traspuesta": {
      title: "Traspuesta de una transformación y bidual", aliases: ["traspuesta de una transformación lineal", "transformación traspuesta", "bidual", "doble dual", "isomorfismo canónico"], concepts: ["a2-traspuesta"],
      summary: "Tᵗ: W* → V*, Tᵗ(ψ) = ψ ∘ T. En bases duales, su matriz es la traspuesta de la de T. Nu(Tᵗ) = (Im T)° e Im(Tᵗ) = (Nu T)°, así que rg Tᵗ = rg T. V es canónicamente isomorfo a su bidual V**.",
      def: [R`Si $T: V \to W$ es lineal, su **traspuesta** es $T^t: W^* \to V^*$, $$T^t(\psi) = \psi\circ T.$$ Es lineal, y si $B$, $B'$ son bases de $V$ y $W$, la matriz de $T^t$ en las bases duales es la traspuesta de la de $T$: $[T^t]_{B'^*B^*} = \left([T]_{BB'}\right)^t$.`,
        R`**Núcleo e imagen.** $\operatorname{Nu}(T^t) = (\operatorname{Im}T)^\circ$ y, en dimensión finita, $\operatorname{Im}(T^t) = (\operatorname{Nu}T)^\circ$. En consecuencia $\operatorname{rg}(T^t) = \operatorname{rg}(T)$: el rango por filas de una matriz es igual a su rango por columnas.`,
        R`**Bidual.** $V^{**} = (V^*)^*$. Cada $v \in V$ define $L_v \in V^{**}$ por $L_v(\varphi) = \varphi(v)$. Si $\dim V$ es finita, $v \mapsto L_v$ es un **isomorfismo** de $V$ en $V^{**}$, que no depende de ninguna elección (es **canónico**).`],
      idea: [R`Si $T$ lleva vectores de $V$ a $W$, la traspuesta lleva mediciones en sentido contrario: para medir $v$ con una medición $\psi$ de $W$, primero se lo manda a $W$ con $T$ y después se mide.`,
        R`$V$ y $V^*$ tienen la misma dimensión, así que son isomorfos; pero cualquier isomorfismo concreto depende de una base. Con $V$ y $V^{**}$ es distinto: «evaluar en $v$» es una regla que no elige nada. Por eso se puede pensar a los vectores como funcionales sobre los funcionales.`,
        R`Ejemplo: en $V = F^{n\times n}$, sea $T(A) = AB - BA$ y $f = \operatorname{tr}$. Entonces $T^t(f)(A) = \operatorname{tr}(AB - BA) = 0$: $T^tf$ es el funcional nulo.`],
      demo: [R`**Paso 1 ($\operatorname{Nu}T^t = (\operatorname{Im}T)^\circ$).** $\psi \in \operatorname{Nu}(T^t)$ significa $\psi\circ T = 0$, es decir, $\psi(T(v)) = 0$ para todo $v$: $\psi$ se anula en $\operatorname{Im}(T)$.`,
        R`**Paso 2 (rangos).** Con $\dim W = m$: $\operatorname{rg}(T^t) = \dim W^* - \dim\operatorname{Nu}(T^t) = m - \dim(\operatorname{Im}T)^\circ = m - (m - \operatorname{rg}T) = \operatorname{rg}T$, usando el teorema de la dimensión y la dimensión del [[a2-anulador|anulador]].`,
        R`**Paso 3 (la matriz).** Sea $A = [T]_{BB'}$, así que $T(v_j) = \sum_i A_{ij}w_i$. La coordenada $j$ de $T^t(\psi_i)$ en $B^*$ es su valor en $v_j$: $T^t(\psi_i)(v_j) = \psi_i(T(v_j)) = A_{ij}$. O sea, la columna $i$ de $[T^t]$ es la fila $i$ de $A$.`,
        R`**Paso 4 (bidual: inyectiva).** $v \mapsto L_v$ es lineal. Si $L_v = 0$, entonces $\varphi(v) = 0$ para todo funcional. Pero si $v \ne 0$ se lo extiende a una base y el primer funcional de la base dual vale $1$ en $v$. Luego $v = 0$.`,
        R`**Paso 5 (bidual: isomorfismo).** $\dim V^{**} = \dim V^* = \dim V$, y una transformación lineal inyectiva entre espacios de la misma dimensión finita es un isomorfismo. $\blacksquare$`],
      examples: [{ q: R`Sea $T: \mathbb R^2 \to \mathbb R^2$, $T(x, y) = (x + 2y, 3y)$ y $\psi(u, v) = u - v$. Calculá $T^t\psi$.`, steps: [R`$T^t\psi(x, y) = \psi(x + 2y, 3y) = x + 2y - 3y = x - y$.`, R`Con matrices: $(1\ \ {-1})\begin{pmatrix} 1 & 2 \\ 0 & 3\end{pmatrix} = (1\ \ {-1})$.`] }],
      tips: [R`En dimensión infinita, $V \to V^{**}$ sigue siendo inyectiva pero ya no es sobreyectiva.`],
      see: ["a2-dual", "a2-anulador", "a2-matriz-tl"]
    }
  };

  E.extendCourse("m203", {
    concepts: { "a2-dual": { name: "Espacio dual y base dual" }, "a2-anulador": { name: "Anulador" }, "a2-traspuesta": { name: "Traspuesta y bidual" } },
    templates: T,
    units: [{
      id: "a2-dual-u", order: 3, program: "Unidad 3", title: "Espacio dual", icon: "rotate-ccw",
      diagnostic: ["a2-base-dual-num", "a2-anulador-num", "a2-dual-vf"],
      lessons: [
        { id: "a2-dual", title: "Funcionales y base dual", templates: ["a2-base-dual-num", "a2-dual-funcionales-num", "a2-traza-num"], theory: ["a2-dual"],
          intro: R`$\varphi_i(v_j) = \delta_{ij}$: el funcional $\varphi_i$ da la $i$-ésima coordenada. Son las filas de $P^{-1}$.` },
        { id: "a2-anulador", title: "Anulador, traspuesta y bidual", templates: ["a2-anulador-num", "a2-dual-vf"], theory: ["a2-anulador", "a2-traspuesta"],
          intro: R`$\dim S + \dim S^\circ = \dim V$, y $T^t(\psi) = \psi\circ T$ tiene el mismo rango que $T$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 4 · DIAGONALIZACIÓN, POLINOMIO MINIMAL, CAYLEY-HAMILTON Y SUBESPACIOS INVARIANTES
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, A = E.a2;
  const T = {};
  // matriz en bloques de Jordan: spec = [[autovalor, tamaño], …]
  const jordan = spec => { const n = spec.reduce((s, b) => s + b[1], 0), J = Array.from({ length: n }, () => Array(n).fill(0)); let o = 0; for (const [l, k] of spec) { for (let i = 0; i < k; i++) { J[o + i][o + i] = l; if (i < k - 1) J[o + i][o + i + 1] = 1; } o += k; } return J; };
  const conj = (r, J) => { const n = J.length, P = A.unimod(r, n, n + 1); return A.mul(A.mul(P, J), A.inv(P)).map(row => row.map(x => Math.round(x))); };
  // grado del minimal: suma, sobre los autovalores distintos, del bloque más grande
  const minDeg = spec => { const m = {}; for (const [l, k] of spec) m[l] = Math.max(m[l] || 0, k); return Object.values(m).reduce((s, x) => s + x, 0); };
  const SPECS = r => { const [a, b, c] = r.distinct(3, -3, 4); return r.pick([[[a, 1], [b, 1], [c, 1]], [[a, 1], [a, 1], [b, 1]], [[a, 2], [b, 1]], [[a, 3]], [[a, 2], [a, 1]], [[a, 1], [a, 1], [a, 1]], [[a, 2], [b, 2]], [[a, 2], [b, 1], [b, 1]], [[a, 1], [a, 1], [b, 1], [b, 1]], [[a, 3], [b, 1]]]); };
  const add = (P, Q, k = 1) => P.map((row, i) => row.map((x, j) => x + k * Q[i][j]));
  const isZero = M => M.every(row => row.every(x => Math.abs(x) < 1e-7));
  // p(M) para p = Π (x − l)^e
  const evalFac = (M, fac) => { const n = M.length; let Pw = A.eye(n); for (const [l, e] of fac) for (let k = 0; k < e; k++) Pw = A.mul(Pw, add(M, A.eye(n), -l)); return Pw; };
  const facTex = fac => fac.map(([l, e]) => { const b = l === 0 ? "x" : `(x ${l < 0 ? "+" : "-"} ${Math.abs(l)})`; return e === 1 ? b : `${b}^{${e}}`; }).join("");

  T["a2-minimal-num"] = {
    type: "numeric", concepts: ["a2-minimal"], difficulty: 3,
    generate(r) {
      const spec = SPECS(r), M = conj(r, jordan(spec)), n = M.length, d = minDeg(spec);
      const eig = {}; for (const [l, k] of spec) (eig[l] = eig[l] || []).push(k);
      const chi = Object.entries(eig).map(([l, ks]) => [+l, ks.reduce((s, x) => s + x, 0)]), mn = Object.entries(eig).map(([l, ks]) => [+l, Math.max(...ks)]);
      return {
        prompt: `El polinomio característico de $A = ${A.pm(M)}$ es $\\chi_A(x) = ${facTex(chi)}$. ¿Cuál es el grado de su polinomio minimal?`,
        answer: d,
        traps: [{ value: n, msg: "Ese es el grado del característico. El minimal lo divide, pero puede tener grado menor: hay que probar con exponentes más chicos." }, { value: chi.length, msg: "Con cada factor a la primera potencia solo alcanza si $A$ es diagonalizable. Verificá si ese producto realmente anula a $A$." }].filter(t => t.value !== d),
        solution: [`El [[a2-minimal|polinomio minimal]] divide al característico y tiene las mismas raíces: es $${chi.map(([l], i) => `${l === 0 ? "x" : `(x ${l < 0 ? "+" : "-"} ${Math.abs(l)})`}^{e_{${i + 1}}}`).join("")}$ con $1 \\le ${chi.map((c, i) => `e_{${i + 1}} \\le ${c[1]}`).join(",\\ ")}$.`,
          `Se prueban los candidatos de menor a mayor grado, evaluándolos en $A$. El primero que da la matriz nula es $m_A(x) = ${facTex(mn)}$.`,
          `Grado: $${d}$. ${d === chi.length ? "Como todas sus raíces son simples, $A$ es diagonalizable." : "Como tiene una raíz múltiple, $A$ no es diagonalizable."}`],
        // verificación: el grado del minimal es el menor d para el que I, A, …, A^d son linealmente dependientes (rango de las potencias, vistas como vectores)
        verify: { kind: "value", fn: () => { const pw = [A.eye(n)]; for (let k = 1; k <= n; k++) { pw.push(A.mul(pw[k - 1], M)); if (A.rank(pw.map(P => P.flat())) <= k) return k; } return -1; } }
      };
    }
  };

  T["a2-minimal-mc"] = {
    type: "mc", concepts: ["a2-minimal"], difficulty: 2,
    generate(r) {
      const [a, b] = r.distinct(2, -3, 4), spec = r.pick([[[a, 2], [b, 1]], [[a, 1], [a, 1], [b, 1]], [[a, 2], [a, 1], [b, 1]], [[a, 2], [b, 2]], [[a, 1], [a, 1], [b, 2]], [[a, 3], [b, 1]], [[a, 2], [a, 2]], [[a, 1], [a, 1], [b, 1], [b, 1]]]);
      const J = jordan(spec), n = J.length, eig = {}; for (const [l, k] of spec) (eig[l] = eig[l] || []).push(k);
      const ls = Object.keys(eig).map(Number), mn = ls.map(l => [l, Math.max(...eig[l])]), chi = ls.map(l => [l, eig[l].reduce((s, x) => s + x, 0)]);
      const cands = [];
      const rec = (i, cur) => { if (i === ls.length) { cands.push(cur); return; } for (let e = 1; e <= chi[i][1] + 1; e++) rec(i + 1, [...cur, [ls[i], e]]); };
      rec(0, []);
      const ok = `$${facTex(mn)}$`, bads = r.shuffle(cands.map(c => `$${facTex(c)}$`).filter(t => t !== ok));
      if (bads.length < 3) return null;
      return {
        prompt: `¿Cuál es el polinomio minimal de $A = ${A.pm(J)}$?`,
        ...H.mc(r, ok, bads.slice(0, 3), { text: true }),
        solution: [`$A$ está en bloques: ${spec.map(([l, k]) => `un bloque de tamaño $${k}$ con $${l}$ en la diagonal`).join(", ")}.`,
          `En el [[a2-minimal|polinomio minimal]], el exponente de $(x - \\lambda)$ es el tamaño del **bloque más grande** con ese autovalor: un bloque de tamaño $k$ necesita $(x - \\lambda)^k$ para anularse.`,
          `$m_A(x) = ${facTex(mn)}$ (el característico es $${facTex(chi)}$).`],
        // verificación: el elegido anula a A y, bajando en uno cualquiera de sus exponentes, deja de anularla
        verify: { kind: "truth", target: true, fn: () => isZero(evalFac(J, mn)) && mn.every((f, i) => f[1] === 1 ? !isZero(evalFac(J, mn.filter((_, k) => k !== i))) : !isZero(evalFac(J, mn.map((g, k) => (k === i ? [g[0], g[1] - 1] : g))))) }
      };
    }
  };

  T["a2-diagonalizable-vf"] = {
    type: "tf", concepts: ["a2-minimal"], difficulty: 2,
    generate(r) {
      const kind = r.pick(["jordan", "jordan", "jordan", "rot"]);
      let M, val, why, eigs;
      if (kind === "rot") {
        const a = r.int(-2, 3), b = r.nz(-3, 3), c = r.int(-3, 3), J = [[a, -b, 0], [b, a, 0], [0, 0, c]];
        M = conj(r, J); val = false; eigs = [c];
        why = `Su polinomio característico es $(x ${c < 0 ? "+" : "-"} ${Math.abs(c)})\\left[(x ${a < 0 ? "+" : "-"} ${Math.abs(a)})^2 + ${b * b}\\right]$, y el segundo factor no tiene raíces reales: sobre $\\mathbb R$ no hay suficientes autovalores. (Sobre $\\mathbb C$ sí sería diagonalizable, con autovalores $${a} \\pm ${Math.abs(b)}i$.)`;
      } else {
        const spec = SPECS(r); M = conj(r, jordan(spec)); val = spec.every(b => b[1] === 1); eigs = [...new Set(spec.map(b => b[0]))];
        const eig = {}; for (const [l, k] of spec) (eig[l] = eig[l] || []).push(k);
        why = `Autovalores: ${Object.entries(eig).map(([l, ks]) => `$${l}$ (multiplicidad algebraica $${ks.reduce((s, x) => s + x, 0)}$, geométrica $${ks.length}$)`).join("; ")}. ${val ? "Las multiplicidades coinciden en todos" : "En alguno la geométrica es menor que la algebraica"}.`;
      }
      const n = M.length;
      return {
        prompt: `<b>Verdadero o falso:</b> la matriz $A = ${A.pm(M)}$ es diagonalizable sobre $\\mathbb R$.`,
        answer: val,
        explanation: `${why} ${val ? "Es diagonalizable." : "No es diagonalizable sobre $\\mathbb R$."} Ver [[al-diagonalizacion|diagonalización]] y [[a2-minimal|polinomio minimal]].`,
        solution: [`$A$ es diagonalizable sobre $F$ si y solo si su polinomio característico se factoriza en $F$ en factores lineales y, para cada autovalor, la multiplicidad geométrica es igual a la algebraica. Equivale a que el minimal sea un producto de factores lineales **distintos**.`],
        // verificación: se suman las dimensiones de los autoespacios reales (núcleos de A − λI por eliminación) y se compara con n
        verify: { kind: "truth", fn: () => eigs.reduce((s, l) => s + A.kernel(add(M, A.eye(n), -l)).length, 0) === n }
      };
    }
  };

  T["a2-cayley-num"] = {
    type: "numeric", concepts: ["a2-minimal"], difficulty: 2,
    generate(r) {
      const M = [[r.int(-3, 4), r.nz(-3, 3)], [r.nz(-3, 3), r.int(-3, 4)]], t = M[0][0] + M[1][1], d = M[0][0] * M[1][1] - M[0][1] * M[1][0], ask = r.pick(["inv", "cubo"]), which = r.int(0, 1);
      if (d === 0 || (ask === "cubo" && t === 0)) return null;
      // A² = tA − dI.  A⁻¹ = −(1/d)A + (t/d)I.  A³ = (t² − d)A − t d I
      const [al, be] = ask === "inv" ? [-1 / d, t / d] : [t * t - d, -t * d], ans = which ? be : al;
      return {
        prompt: `Sea $A = ${A.pm(M)}$. Por el teorema de Cayley-Hamilton, $${ask === "inv" ? "A^{-1}" : "A^3"} = \\alpha A + \\beta I$. ¿Cuánto vale $${which ? "\\beta" : "\\alpha"}$?`,
        answer: ans, ...(ask === "inv" ? { answerTex: which ? H.frac(t, d) : H.frac(-1, d) } : {}),
        solution: [`El polinomio característico de una matriz de $2\\times2$ es $x^2 - \\operatorname{tr}(A)\\,x + \\det A = x^2 ${-t < 0 ? "-" : "+"} ${Math.abs(t)}x ${d < 0 ? "-" : "+"} ${Math.abs(d)}$. Por [[al-cayley|Cayley-Hamilton]], $A^2 = ${t}A ${-d < 0 ? "-" : "+"} ${Math.abs(d)}I$.`,
          ask === "inv" ? `Multiplicando por $A^{-1}$: $A = ${t}I ${-d < 0 ? "-" : "+"} ${Math.abs(d)}A^{-1}$, así que $A^{-1} = ${H.frac(-1, d)}\\,A ${t / d < 0 ? "-" : "+"} ${H.frac(Math.abs(t), Math.abs(d))}\\,I$.`
            : `Multiplicando por $A$ y volviendo a reemplazar $A^2$: $A^3 = ${t}A^2 ${-d < 0 ? "-" : "+"} ${Math.abs(d)}A = ${t}(${t}A ${-d < 0 ? "-" : "+"} ${Math.abs(d)}I) ${-d < 0 ? "-" : "+"} ${Math.abs(d)}A = ${t * t - d}A ${-t * d < 0 ? "-" : "+"} ${Math.abs(t * d)}I$.`],
        // verificación: la igualdad de matrices, con la inversa o el cubo calculados directamente
        verify: { kind: "zero", tol: 1e-9, scale: Math.abs(t * t * t) + 10, fn: () => { const L = ask === "inv" ? A.inv(M) : A.mul(M, A.mul(M, M)), Rr = add(M.map(row => row.map(x => al * x)), A.eye(2), be); return L.flatMap((row, i) => row.map((x, j) => x - Rr[i][j])); } }
      };
    }
  };

  T["a2-invariante-vf"] = {
    type: "tf", concepts: ["a2-invariante"], difficulty: 2,
    generate(r) {
      const [a, b, c] = r.distinct(3, -2, 3), P = A.unimod(r, 3, 4), M = A.mul(A.mul(P, [[a, 1, 0], [0, a, 0], [0, 0, c]]), A.inv(P)).map(row => row.map(x => Math.round(x))), cols = A.T(P);
      // con J = bloque 2×2 de a y un 1×1 de c: ⟨p1⟩, ⟨p3⟩, ⟨p1, p2⟩ y ⟨p1, p3⟩ son invariantes; ⟨p2⟩ y ⟨p2, p3⟩ no
      const pick = r.pick([[[0], true], [[2], true], [[0, 1], true], [[0, 2], true], [[1], false], [[1, 2], false], [[1], false], [[1, 2], false]]);
      const S = pick[0].map(i => cols[i]), img = S.map(s => A.vec(M, s));
      return {
        prompt: `Sea $A = ${A.pm(M)}$ y $S = \\langle ${S.map(A.v).join(",\\ ")}\\rangle \\subseteq \\mathbb R^3$. <b>Verdadero o falso:</b> $S$ es un subespacio invariante por $A$.`,
        answer: pick[1],
        explanation: `Se aplica $A$ a cada generador: ${S.map((s, i) => `$A${A.v(s)} = ${A.v(img[i])}$`).join(" y ")}. ${pick[1] ? "Los resultados vuelven a caer en $S$" : "Algún resultado se sale de $S$"}: se ve agregándolos a los generadores y mirando si el rango aumenta ([[a2-invariante|subespacios invariantes]]).`,
        solution: [`$S$ es invariante por $A$ si $A(S) \\subseteq S$; alcanza con chequearlo en un conjunto de generadores. Un subespacio de dimensión 1 es invariante exactamente cuando su generador es un autovector.`],
        // verificación: el rango de los generadores junto con sus imágenes es igual al de los generadores solos
        verify: { kind: "truth", fn: () => A.rank([...S, ...img]) === A.rank(S) }
      };
    }
  };

  const cards = {
    "a2-minimal": {
      title: "Polinomio minimal y criterio de diagonalización", aliases: ["polinomio mínimo", "polinomio anulador", "criterio de diagonalización por el minimal"], concepts: ["a2-minimal"],
      summary: "El minimal m_A es el polinomio mónico de menor grado con m_A(A) = 0. Divide a todo polinomio que anule a A (en particular al característico) y tiene sus mismas raíces. A es diagonalizable ⇔ m_A es producto de factores lineales distintos.",
      def: [R`Un polinomio $p$ **anula** a $A$ si $p(A) = 0$. El **polinomio minimal** $m_A$ es el polinomio mónico de menor grado que anula a $A$. Existe y es único.`,
        R`**Propiedades.** (1) $m_A$ divide a todo polinomio que anule a $A$. (2) Por [[al-cayley|Cayley-Hamilton]], $m_A$ divide al característico $\chi_A$. (3) $m_A$ y $\chi_A$ tienen las mismas raíces: los autovalores. (4) Matrices [[a2-matriz-tl|semejantes]] tienen el mismo minimal.`,
        R`**Criterio de diagonalización.** $A$ es diagonalizable sobre $F$ si y solo si $$m_A(x) = (x - \lambda_1)(x - \lambda_2)\cdots(x - \lambda_r)$$ con los $\lambda_i \in F$ **distintos**.`,
        R`En la [[al-jordan|forma de Jordan]], el exponente de $(x - \lambda)$ en $m_A$ es el tamaño del bloque más grande con autovalor $\lambda$; en $\chi_A$, la suma de los tamaños.`],
      idea: [R`El característico dice **qué** autovalores hay y cuántas veces; el minimal dice **qué tan lejos** está la matriz de ser diagonal. Si es diagonalizable, alcanza con un factor por autovalor.`,
        R`Para hallarlo: se factoriza $\chi_A$ y se prueban, de menor a mayor grado, los productos con las mismas raíces y exponentes entre $1$ y los de $\chi_A$.`,
        R`Ejemplos rápidos: un proyector ($p^2 = p$) tiene minimal que divide a $x(x - 1)$, así que es diagonalizable con autovalores $0$ y $1$. Una involución ($j^2 = \operatorname{id}$) es diagonalizable con autovalores $\pm1$. Un [[a2-nilpotente|nilpotente]] no nulo tiene minimal $x^s$ con $s \ge 2$: nunca es diagonalizable.`],
      demo: [R`**Paso 1 (existe).** Las $n^2 + 1$ matrices $I, A, A^2, \dots, A^{n^2}$ son linealmente dependientes en $F^{n\times n}$, que tiene dimensión $n^2$. Una relación de dependencia es un polinomio no nulo que anula a $A$. Entre todos los que la anulan se toma uno de grado mínimo y se lo hace mónico.`,
        R`**Paso 2 (divide a todo anulador).** Si $p(A) = 0$, se divide: $p = q\,m_A + r$ con $\operatorname{gr}r < \operatorname{gr}m_A$. Evaluando en $A$: $r(A) = p(A) - q(A)m_A(A) = 0$. Por la minimalidad del grado, $r = 0$. (De acá sale también la unicidad: dos minimales se dividen mutuamente y son mónicos.)`,
        R`**Paso 3 (los autovalores son raíces).** Si $Av = \lambda v$ con $v \ne 0$, entonces $p(A)v = p(\lambda)v$ para todo polinomio. Con $p = m_A$: $0 = m_A(\lambda)v$, así que $m_A(\lambda) = 0$. Y como $m_A$ divide a $\chi_A$, no tiene otras raíces.`,
        R`**Paso 4 (diagonalizable ⇒ factores simples).** Si $A$ es diagonalizable con autovalores distintos $\lambda_1, \dots, \lambda_r$, el producto $\prod(A - \lambda_iI)$ anula a cada vector de una base de autovectores (el factor que le corresponde lo mata, y los factores conmutan). Luego ese producto es $0$, y $m_A$ lo divide.`,
        R`**Paso 5 (factores simples ⇒ diagonalizable, idea).** Si $m_A = \prod(x - \lambda_i)$ con raíces distintas, los polinomios $q_i = \prod_{j\ne i}(x - \lambda_j)$ no tienen raíz común, así que hay polinomios $h_i$ con $\sum h_iq_i = 1$. Evaluando en $A$: $v = \sum h_i(A)q_i(A)v$, y cada sumando es un autovector de $\lambda_i$, porque $(A - \lambda_iI)q_i(A) = m_A(A) = 0$. Todo vector es suma de autovectores. $\blacksquare$`],
      examples: [{ q: R`Minimal de $A = \begin{pmatrix} 2 & 1 & 0 \\ 0 & 2 & 0 \\ 0 & 0 & 2\end{pmatrix}$.`, steps: [R`$\chi_A = (x - 2)^3$. Candidatos: $(x - 2)$, $(x - 2)^2$, $(x - 2)^3$.`, R`$A - 2I \ne 0$ pero $(A - 2I)^2 = 0$: $m_A = (x - 2)^2$. No es diagonalizable.`] }],
      tips: [R`Que el característico tenga raíces múltiples **no** impide diagonalizar (la identidad tiene $\chi = (x - 1)^n$). Lo que lo impide es una raíz múltiple en el **minimal**.`],
      see: ["al-cayley", "al-diagonalizacion", "al-multiplicidades", "al-jordan", "a2-invariante"]
    },
    "a2-invariante": {
      title: "Subespacios invariantes y triangulación", aliases: ["subespacio invariante", "subespacios invariantes", "operador triangulable", "triangulación de un operador"], concepts: ["a2-invariante"],
      summary: "S es invariante por T si T(S) ⊆ S. En una base adaptada, la matriz queda triangular por bloques. Los autoespacios, el núcleo y la imagen son invariantes. Sobre ℂ, todo operador es triangulable.",
      def: [R`Un subespacio $S$ es **invariante** por el operador $T: V \to V$ si $T(S) \subseteq S$. Alcanza con verificarlo en un conjunto de generadores de $S$.`,
        R`Si se extiende una base de $S$ a una base de $V$, la matriz de $T$ queda **triangular por bloques**: $\begin{pmatrix} A_1 & * \\ 0 & A_2\end{pmatrix}$, donde $A_1$ es la matriz de $T$ restringida a $S$. Si además $V = S \oplus S'$ con $S'$ también invariante, queda **diagonal por bloques**. En los dos casos $\chi_T = \chi_{A_1}\chi_{A_2}$.`,
        R`**Ejemplos.** $\{0\}$ y $V$; $\operatorname{Nu}(T)$ e $\operatorname{Im}(T)$; cada [[al-autovalores|autoespacio]]; $\operatorname{Nu}(p(T))$ para cualquier polinomio $p$. Una recta $\langle v\rangle$ es invariante si y solo si $v$ es un autovector.`,
        R`$T$ es **triangulable** (tiene matriz triangular superior en alguna base) si y solo si $\chi_T$ se factoriza en factores lineales en $F$. En particular, sobre $\mathbb C$ todo operador es triangulable.`],
      idea: [R`Un subespacio invariante es un pedazo del espacio donde el operador «vive por su cuenta». Encontrar subespacios invariantes que sumen todo $V$ es partir el problema en problemas más chicos: diagonalizar es partir $V$ en rectas invariantes.`,
        R`Cuando no hay suficientes rectas invariantes, lo mejor que se puede hacer es una cadena $S_1 \subset S_2 \subset \dots \subset S_n = V$ de invariantes con $\dim S_k = k$: eso es triangular.`],
      demo: [R`**Paso 1 (la forma en bloques).** Sea $\{v_1, \dots, v_k\}$ base de $S$, extendida a $\{v_1, \dots, v_n\}$. Para $j \le k$, $T(v_j) \in S$, así que sus coordenadas en $v_{k+1}, \dots, v_n$ son cero: las primeras $k$ columnas de la matriz tienen ceros debajo de la fila $k$.`,
        R`**Paso 2 (triangulación, por inducción).** Si $\chi_T$ se factoriza, tiene una raíz $\lambda_1$ y un autovector $v_1$. Con $S = \langle v_1\rangle$ y una base que empieza en $v_1$, la matriz es $\begin{pmatrix} \lambda_1 & * \\ 0 & A_2\end{pmatrix}$ y $\chi_T = (x - \lambda_1)\chi_{A_2}$.`,
        R`**Paso 3 (el paso inductivo).** $\chi_{A_2}$ también se factoriza, y $A_2$ es de tamaño $n - 1$: por hipótesis inductiva hay $Q$ con $Q^{-1}A_2Q$ triangular. Conjugando con $\begin{pmatrix} 1 & 0 \\ 0 & Q\end{pmatrix}$, toda la matriz queda triangular. $\blacksquare$`,
        R`**Paso 4 (recíproca).** Si la matriz es triangular con diagonal $\lambda_1, \dots, \lambda_n$, su característico es $\prod(x - \lambda_i)$, que es un producto de factores lineales.`],
      examples: [{ q: R`Para $D(p) = p'$ en $\mathbb R_3[x]$, ¿es invariante $\mathbb R_1[x]$?`, steps: [R`Sí: derivar un polinomio de grado $\le 1$ da una constante. De hecho todos los $\mathbb R_k[x]$ son invariantes: forman una cadena, y por eso la matriz de $D$ en $\{1, x, x^2, x^3\}$ es triangular.`] }],
      see: ["al-autovalores", "a2-minimal", "a2-matriz-tl", "a2-suma"]
    }
  };

  E.extendCourse("m203", {
    concepts: { "a2-minimal": { name: "Polinomio minimal y diagonalización" }, "a2-invariante": { name: "Subespacios invariantes" } },
    templates: T,
    units: [{
      id: "a2-diag-u", order: 4, program: "Unidad 4", title: "Diagonalización y polinomio minimal", icon: "sparkles",
      diagnostic: ["a2-minimal-mc", "a2-diagonalizable-vf", "a2-cayley-num"],
      lessons: [
        { id: "a2-minimal", title: "Polinomio minimal", templates: ["a2-minimal-mc", "a2-minimal-num", "a2-cayley-num"], theory: ["a2-minimal"],
          intro: R`$m_A$ divide a $\chi_A$ y tiene sus mismas raíces. $A$ es diagonalizable si y solo si $m_A$ no tiene raíces múltiples.` },
        { id: "a2-invariante", title: "Diagonalizables e invariantes", templates: ["a2-diagonalizable-vf", "a2-invariante-vf"], theory: ["a2-invariante"],
          intro: R`$S$ es invariante si $T(S) \subseteq S$. Con una base adaptada, la matriz queda triangular por bloques.` }
      ]
    }],
    cards
  });
})();
