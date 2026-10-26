/* ===== M104 · Evaluaciones: parciales y final simulados =====
   Estructura de los parciales y finales reales (ver docs/parciales/m104.md): ejercicios con puntaje,
   cálculos con justificación, V/F justificados y demostraciones. Enunciados propios y números sorteados.
   Los ejercicios con varios resultados (adjunta, Cramer, áreas) son de desarrollo (`self`): la resolución
   muestra todos los valores y uno se corrige con la rúbrica. */
(function () {
  const E = window.Efecen, R = String.raw;
  const SELF = {};
  const det2 = (a, b, c, d) => a * d - b * c;
  const det3 = M => M[0][0] * det2(M[1][1], M[1][2], M[2][1], M[2][2]) - M[0][1] * det2(M[1][0], M[1][2], M[2][0], M[2][2]) + M[0][2] * det2(M[1][0], M[1][1], M[2][0], M[2][1]);
  const minor = (M, i, j) => M.filter((_, a) => a !== i).map(row => row.filter((_, b) => b !== j));
  const cof = (M, i, j) => ((i + j) % 2 ? -1 : 1) * det2(...minor(M, i, j).flat());
  const pm = M => `\\begin{pmatrix} ${M.map(row => row.join(" & ")).join(R` \\ `)} \\end{pmatrix}`;
  const vec = v => `(${v.join(", ")})`;
  const nf = (H, x, d = 3) => H.num(x, d).replace(".", "{,}");
  const sq = (H, n) => (Number.isInteger(Math.sqrt(n)) ? String(Math.sqrt(n)) : `\\sqrt{${n}} \\approx ${nf(H, Math.sqrt(n))}`);

  // vectores: área y perímetro del paralelogramo y ángulo entre los lados
  SELF["al-ex-paralelogramo"] = {
    concepts: ["al-vectorial", "al-escalar"],
    generate(r, H) {
      const u = [r.int(-3, 4), r.int(-3, 4), r.int(-3, 4)], v = [r.int(-3, 5), r.int(-3, 5), r.int(-3, 5)];
      const w = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      const n2 = w.reduce((t, x) => t + x * x, 0), nu = u.reduce((t, x) => t + x * x, 0), nv = v.reduce((t, x) => t + x * x, 0);
      if (!n2 || !nu || !nv) return null;
      const dot = u[0] * v[0] + u[1] * v[1] + u[2] * v[2], ang = Math.acos(dot / Math.sqrt(nu * nv)) * 180 / Math.PI;
      const per = 2 * (Math.sqrt(nu) + Math.sqrt(nv));
      return {
        verify: { kind: "zero", tol: 1e-9, scale: 100, fn: () => [Math.sqrt(nu * nv) * Math.sin(ang * Math.PI / 180) - Math.sqrt(n2)] },
        prompt: `Sean $\\vec u = ${vec(u)}$ y $\\vec v = ${vec(v)}$ en $\\mathbb{R}^3$. Hallá: a) el área del paralelogramo determinado por $\\vec u$ y $\\vec v$; b) su perímetro; c) el ángulo entre $\\vec u$ y $\\vec v$.`,
        rubric: [
          { text: `a) $\\vec u\\times\\vec v = ${vec(w)}$ y el área es $\\|\\vec u\\times\\vec v\\| = ${sq(H, n2)}$.`, w: 4 },
          { text: `b) Perímetro $= 2(\\|\\vec u\\| + \\|\\vec v\\|) = 2(${sq(H, nu)} + ${sq(H, nv)}) \\approx ${nf(H, per)}$.`, w: 3 },
          { text: `c) $\\cos\\theta = \\frac{\\vec u\\cdot\\vec v}{\\|\\vec u\\|\\|\\vec v\\|} = \\frac{${dot}}{\\sqrt{${nu}}\\sqrt{${nv}}}$, así que $\\theta \\approx ${nf(H, ang, 1)}^\\circ$.`, w: 3 }
        ],
        solution: [
          `a) El área del paralelogramo es la norma del producto vectorial: $\\vec u\\times\\vec v = ${vec(w)}$, $\\|\\vec u\\times\\vec v\\| = \\sqrt{${n2}} ${Number.isInteger(Math.sqrt(n2)) ? `= ${Math.sqrt(n2)}` : `\\approx ${nf(H, Math.sqrt(n2))}`}$.`,
          `b) Los lados miden $\\|\\vec u\\| = \\sqrt{${nu}}$ y $\\|\\vec v\\| = \\sqrt{${nv}}$; el perímetro es $2(\\sqrt{${nu}} + \\sqrt{${nv}}) \\approx ${nf(H, per)}$.`,
          `c) $\\vec u\\cdot\\vec v = ${dot}$, así que $\\cos\\theta = \\frac{${dot}}{\\sqrt{${nu * nv}}} \\approx ${nf(H, dot / Math.sqrt(nu * nv))}$ y $\\theta \\approx ${nf(H, ang, 1)}^\\circ$.`
        ]
      };
    }
  };

  // determinante por cofactores, inversibilidad, inversa por la adjunta y det de la inversa
  SELF["al-ex-adjunta"] = {
    concepts: ["al-det", "al-inversa"],
    generate(r, H) {
      const A = [0, 1, 2].map(() => [r.int(-3, 4), r.int(-3, 4), r.int(-3, 4)]);
      const d = det3(A);
      if (!d || Math.abs(d) > 40) return null;
      const C = [0, 1, 2].map(i => [0, 1, 2].map(j => cof(A, i, j))), adj = [0, 1, 2].map(i => [0, 1, 2].map(j => C[j][i]));
      const inv = adj.map(row => row.map(x => H.frac(x, d)));
      return {
        verify: { kind: "all", list: [{ kind: "det", A, target: d }, { kind: "zero", tol: 1e-9, fn: () => [0, 1, 2].flatMap(i => [0, 1, 2].map(j => A[i].reduce((t, x, c) => t + x * adj[c][j] / d, 0) - (i === j ? 1 : 0))) }] },
        prompt: `Dada $A = ${pm(A)}$: a) calculá $\\det(A)$ desarrollando por la primera columna; b) indicá si $A$ tiene inversa y justificá; c) si es posible, hallá $A^{-1}$ con el método de la adjunta; d) calculá $\\det(A^{-1})$.`,
        rubric: [
          { text: `a) $\\det(A) = a_{11}C_{11} + a_{21}C_{21} + a_{31}C_{31} = ${d}$.`, w: 5 },
          { text: R`b) Es inversible porque $\det(A) \neq 0$.`, w: 2 },
          { text: `c) Cofactores y adjunta correctos: $\\operatorname{adj}(A) = ${pm(adj)}$.`, w: 6 },
          { text: `c) $A^{-1} = \\frac{1}{${d}}\\operatorname{adj}(A) = ${pm(inv)}$.`, w: 4 },
          { text: `d) $\\det(A^{-1}) = \\frac{1}{\\det A} = ${H.frac(1, d)}$.`, w: 3 }
        ],
        solution: [
          `a) Por la primera columna: $\\det A = ${A[0][0]}\\cdot(${C[0][0]}) + ${H.par(A[1][0])}\\cdot(${C[1][0]}) + ${H.par(A[2][0])}\\cdot(${C[2][0]}) = ${d}$, donde $C_{i1} = (-1)^{i+1}M_{i1}$.`,
          `b) Como $\\det A = ${d} \\neq 0$, $A$ es inversible.`,
          `c) La matriz de cofactores es $${pm(C)}$; su transpuesta es la adjunta, $\\operatorname{adj}(A) = ${pm(adj)}$.`,
          `$A^{-1} = \\frac{1}{\\det A}\\operatorname{adj}(A) = ${pm(inv)}$. (Chequeo: $A\\,A^{-1} = I$.)`,
          `d) Como $\\det(A)\\det(A^{-1}) = \\det(I) = 1$: $\\det(A^{-1}) = ${H.frac(1, d)}$.`
        ]
      };
    }
  };

  // sistema homogéneo con parámetro y regla de Cramer
  SELF["al-ex-sistema-k"] = {
    concepts: ["al-sistemas", "al-cramer"],
    generate(r, H) {
      const r1 = [r.nz(-3, 3), r.nz(-3, 4), r.int(-4, 6)], r3 = [r.nz(-3, 3), r.int(-3, 4), r.int(-3, 5)];
      const M = k => [r1, [0, 1, k], r3];
      const d0 = det3(M(0)), beta = det3(M(1)) - d0;
      if (!beta || d0 % beta) return null;               // queremos un k crítico entero
      const k0 = -d0 / beta;
      const kc = r.pick([-2, -1, 1, 2, 3].filter(k => k !== k0)), A = M(kc), D = det3(A);
      const b = [r.int(-4, 4), r.int(-3, 3), r.int(-4, 4)];
      if (!b.some(x => x)) return null;
      const col = j => A.map((row, i) => row.map((x, c) => (c === j ? b[i] : x)));
      const Dx = [0, 1, 2].map(j => det3(col(j))), sol = Dx.map(x => H.frac(x, D));
      const eq = row => H.poly([[row[0], "x"], [row[1], "y"], [row[2], "z"]]);
      return {
        verify: { kind: "all", list: [{ kind: "det", A: M(k0), target: 0 }, { kind: "det", A, target: D }, { kind: "zero", tol: 1e-9, fn: () => A.map((row, i) => row.reduce((t, x, c) => t + x * Dx[c] / D, 0) - b[i]) }] },
        prompt: `Dado el sistema homogéneo $$\\begin{cases} ${eq(r1)} = 0 \\\\ y + kz = 0 \\\\ ${eq(r3)} = 0 \\end{cases}$$ a) Escribí la matriz de coeficientes. b) Encontrá los valores de $k$ para los que el sistema admite **solo** la solución trivial. c) Con $k = ${kc}$ y $B = ${vec(b)}^T$, resolvé $A X = B$ por la regla de Cramer. d) Escribí el conjunto solución.`,
        rubric: [
          { text: `a) $A = ${pm(M("k"))}$.`, w: 2 },
          { text: `b) $\\det A = ${H.poly([[beta, "k"], [d0, ""]])}$; solo la trivial si $\\det A \\neq 0$, o sea $k \\neq ${k0}$.`, w: 4 },
          { text: `c) Con $k = ${kc}$, $\\det A = ${D}$ y los determinantes de Cramer $${Dx[0]}$, $${Dx[1]}$, $${Dx[2]}$.`, w: 4 },
          { text: `d) $S = \\left\\{\\left(${sol.join(", ")}\\right)\\right\\}$.`, w: 4 }
        ],
        solution: [
          `a) $A = ${pm(M("k"))}$.`,
          `b) Un sistema homogéneo cuadrado tiene solo la solución trivial si y solo si $\\det A \\neq 0$. Desarrollando: $\\det A = ${H.poly([[beta, "k"], [d0, ""]])}$, que se anula en $k = ${k0}$. Entonces: solo la trivial para todo $k \\neq ${k0}$.`,
          `c) Con $k = ${kc}$: $A = ${pm(A)}$ y $\\det A = ${D} \\neq 0$, así que se puede usar Cramer.`,
          `$x = \\frac{${Dx[0]}}{${D}} = ${sol[0]}$, $\\quad y = \\frac{${Dx[1]}}{${D}} = ${sol[1]}$, $\\quad z = \\frac{${Dx[2]}}{${D}} = ${sol[2]}$ (cada numerador es el determinante de $A$ con la columna correspondiente reemplazada por $B$).`,
          `d) El sistema es compatible determinado: $S = \\left\\{\\left(${sol.join(", ")}\\right)\\right\\}$.`
        ]
      };
    }
  };

  // subespacio de polinomios definido por dos condiciones lineales
  SELF["al-ex-subespacio"] = {
    concepts: ["al-subespacio", "al-base"],
    generate(r, H) {
      const al = r.nz(-4, 4), be = r.nz(-4, 4);
      const c1 = `b ${al < 0 ? "+" : "-"} ${Math.abs(al) === 1 ? "" : Math.abs(al)}a = 0`, c2 = `d ${be < 0 ? "+" : "-"} ${Math.abs(be) === 1 ? "" : Math.abs(be)}c = 0`;
      const p1 = H.poly([[1, "x^{3}"], [al, "x^{2}"]]), p2 = H.poly([[1, "x"], [be, ""]]);
      return {
        prompt: `Determiná si $M = \\{\\, p \\in P_3 : p(x) = ax^3 + bx^2 + cx + d,\\ ${c1},\\ ${c2} \\,\\}$ es un subespacio de $P_3$. En caso afirmativo, hallá una base y su dimensión.`,
        rubric: [
          { text: `Reescribe los elementos: $p(x) = a(${p1}) + c(${p2})$.`, w: 3 },
          { text: R`Verifica que el polinomio nulo está en $M$.`, w: 2 },
          { text: R`Verifica la clausura por la suma (con dos elementos genéricos).`, w: 4 },
          { text: R`Verifica la clausura por el producto por escalares.`, w: 4 },
          { text: `Da la base $\\{${p1},\\ ${p2}\\}$, prueba que es LI y concluye $\\dim M = 2$.`, w: 7 }
        ],
        solution: [
          `Las condiciones dicen $b = ${H.num(al)}a$ y $d = ${H.num(be)}c$, así que todo $p \\in M$ es $p(x) = ax^3 + ${H.par(al)}ax^2 + cx + ${H.par(be)}c = a(${p1}) + c(${p2})$.`,
          R`**Nulo:** con $a = b = c = d = 0$ se cumplen las dos condiciones: $0 \in M$.`,
          `**Suma:** si $p$ tiene coeficientes $(a, ${H.num(al)}a, c, ${H.num(be)}c)$ y $q$ tiene $(a', ${H.num(al)}a', c', ${H.num(be)}c')$, entonces $p + q$ tiene $(a + a', ${H.num(al)}(a + a'), c + c', ${H.num(be)}(c + c'))$: cumple las condiciones.`,
          `**Escalares:** $\\lambda p$ tiene coeficientes $(\\lambda a, ${H.num(al)}\\lambda a, \\lambda c, ${H.num(be)}\\lambda c)$: también está en $M$. Entonces $M$ es subespacio de $P_3$.`,
          `**Base:** $M = \\operatorname{gen}\\{${p1},\\ ${p2}\\}$. Son LI: si $\\alpha(${p1}) + \\beta(${p2}) = 0$, el coeficiente de $x^3$ da $\\alpha = 0$ y el de $x$ da $\\beta = 0$. Base de dos elementos: $\\dim M = 2$.`
        ]
      };
    }
  };

  // isomorfismo diagonal: matriz, inversa y autovalores
  SELF["al-ex-iso-diag"] = {
    concepts: ["al-tl", "al-matriz-tl", "al-autovalores"],
    generate(r, H) {
      const [p, q, s] = r.distinct(3, -5, 5);
      if (!p || !q || !s) return null;
      const A = [[p, 0, 0], [0, q, 0], [0, 0, s]], B = [[H.frac(1, p), 0, 0], [0, H.frac(1, q), 0], [0, 0, H.frac(1, s)]];
      return {
        prompt: `Sea $f: \\mathbb{R}^3 \\to \\mathbb{R}^3$, $f((a, b, c)) = (${H.kx(p, "a")}, ${H.kx(q, "b")}, ${H.kx(s, "c")})$. a) Determiná si $f$ es un isomorfismo. b) Con la base canónica en el dominio y el codominio, hallá la matriz $A$ asociada a $f$. c) Analizá si $A$ es inversible y, si lo es, calculá $B = A^{-1}$. d) Hallá los valores propios de $A$ y de $B$. e) ¿Los valores propios de $B$ son los inversos multiplicativos de los de $A$?`,
        rubric: [
          { text: R`a) Es lineal y $N(f) = \{\vec 0\}$ (inyectiva); por el teorema de la dimensión también es suryectiva: es un isomorfismo.`, w: 6 },
          { text: `b) $A = ${pm(A)}$ (columnas: las imágenes de la base canónica).`, w: 5 },
          { text: `c) $\\det A = ${p * q * s} \\neq 0$; $B = ${pm(B)}$.`, w: 7 },
          { text: `d) Autovalores de $A$: $${p}, ${q}, ${s}$; de $B$: $${H.frac(1, p)}, ${H.frac(1, q)}, ${H.frac(1, s)}$.`, w: 7 },
          { text: R`e) Sí: si $A\vec v = \lambda\vec v$, entonces $A^{-1}\vec v = \frac{1}{\lambda}\vec v$.`, w: 5 }
        ],
        solution: [
          `a) $f$ es lineal (cada componente es un múltiplo de una variable). $f((a, b, c)) = \\vec 0$ obliga a $a = b = c = 0$ (porque $${p}, ${q}, ${s} \\neq 0$): $N(f) = \\{\\vec 0\\}$ y $f$ es inyectiva. Por el teorema de la dimensión, $\\dim\\operatorname{Im} f = 3$: es suryectiva. Entonces es un isomorfismo.`,
          `b) $f(e_1) = (${p}, 0, 0)$, $f(e_2) = (0, ${q}, 0)$, $f(e_3) = (0, 0, ${s})$, así que $A = ${pm(A)}$.`,
          `c) $\\det A = ${p}\\cdot${H.par(q)}\\cdot${H.par(s)} = ${p * q * s} \\neq 0$: es inversible, y la inversa de una diagonal invierte cada elemento: $B = ${pm(B)}$.`,
          `d) Para una matriz diagonal, $\\det(A - \\lambda I) = (${p} - \\lambda)(${q} - \\lambda)(${s} - \\lambda)$: los autovalores son $${p}, ${q}, ${s}$. Los de $B$ son $${H.frac(1, p)}, ${H.frac(1, q)}, ${H.frac(1, s)}$.`,
          R`e) Sí, y vale en general: si $A\vec v = \lambda\vec v$ con $\lambda \neq 0$, multiplicando por $A^{-1}$ queda $\vec v = \lambda A^{-1}\vec v$, o sea $A^{-1}\vec v = \frac{1}{\lambda}\vec v$.`
        ]
      };
    }
  };

  // demostraciones
  SELF["al-ex-demo-nucleo"] = {
    concepts: ["al-nucleo"],
    generate() {
      return {
        prompt: R`Demostrá el teorema: si $V$ y $W$ son espacios vectoriales reales y $f: V \to W$ es una transformación lineal, entonces el núcleo $N(f) = \{\vec v \in V : f(\vec v) = \vec 0_W\}$ es un subespacio de $V$.`,
        rubric: [
          { text: R`Muestra que $N(f) \subseteq V$ y que $\vec 0_V \in N(f)$, usando $f(\vec 0_V) = \vec 0_W$ (y probando esa igualdad).`, w: 2 },
          { text: R`Clausura por la suma: si $f(\vec u) = f(\vec v) = \vec 0$, entonces $f(\vec u + \vec v) = f(\vec u) + f(\vec v) = \vec 0$.`, w: 2 },
          { text: R`Clausura por escalares: $f(\lambda\vec u) = \lambda f(\vec u) = \vec 0$.`, w: 2 }
        ],
        solution: [
          R`Por definición, $N(f) \subseteq V$.`,
          R`**El nulo está.** $f(\vec 0_V) = f(0\cdot\vec 0_V) = 0\cdot f(\vec 0_V) = \vec 0_W$, así que $\vec 0_V \in N(f)$ y el núcleo no es vacío.`,
          R`**Suma.** Si $\vec u, \vec v \in N(f)$: $f(\vec u + \vec v) = f(\vec u) + f(\vec v) = \vec 0_W + \vec 0_W = \vec 0_W$, así que $\vec u + \vec v \in N(f)$.`,
          R`**Producto por escalares.** Si $\vec u \in N(f)$ y $\lambda \in \mathbb{R}$: $f(\lambda\vec u) = \lambda f(\vec u) = \lambda\vec 0_W = \vec 0_W$, así que $\lambda\vec u \in N(f)$.`,
          R`Por el criterio del subespacio, $N(f)$ es un subespacio de $V$.`
        ]
      };
    }
  };
  SELF["al-ex-demo-ortog"] = {
    concepts: ["al-euclideo"],
    generate() {
      return {
        prompt: R`Demostrá que, en un espacio con producto interno, $\vec u$ y $\vec v$ son ortogonales si y solo si $\|\vec u + \vec v\| = \|\vec u - \vec v\|$.`,
        rubric: [
          { text: R`Desarrolla $\|\vec u + \vec v\|^2 = \|\vec u\|^2 + 2\,\vec u\cdot\vec v + \|\vec v\|^2$ (y lo mismo con $\vec u - \vec v$).`, w: 3 },
          { text: R`Resta: $\|\vec u + \vec v\|^2 - \|\vec u - \vec v\|^2 = 4\,\vec u\cdot\vec v$.`, w: 3 },
          { text: R`Concluye las dos implicaciones (las normas son no negativas, así que igualar normas equivale a igualar sus cuadrados).`, w: 4 }
        ],
        solution: [
          R`Por las propiedades del producto interno: $\|\vec u + \vec v\|^2 = (\vec u + \vec v)\cdot(\vec u + \vec v) = \|\vec u\|^2 + 2\,\vec u\cdot\vec v + \|\vec v\|^2$.`,
          R`Igual: $\|\vec u - \vec v\|^2 = \|\vec u\|^2 - 2\,\vec u\cdot\vec v + \|\vec v\|^2$.`,
          R`Restando: $\|\vec u + \vec v\|^2 - \|\vec u - \vec v\|^2 = 4\,\vec u\cdot\vec v$.`,
          R`($\Rightarrow$) Si son ortogonales, $\vec u\cdot\vec v = 0$ y los cuadrados de las normas son iguales; como las normas son $\ge 0$, son iguales. ($\Leftarrow$) Si las normas son iguales, sus cuadrados también, y entonces $4\,\vec u\cdot\vec v = 0$: son ortogonales.`
        ]
      };
    }
  };

  E.registerExams("m104", {
    self: SELF,
    // los ítems con `any` sortean entre ejercicios de distintos años (2018, 2019, 2024, 2026)
    exams: [
      { id: "p1", kind: "parcial", title: "1.er parcial", topics: "Vectores, matrices, determinantes y sistemas", minutes: 120, pass: 60,
        items: [
          { any: [
            { title: "Vectores en el espacio", parts: [{ self: "al-ex-paralelogramo", pts: 16 }, { tpl: "al-proy-num", pts: 6 }] },
            { title: "Un rombo en el plano", parts: [{ tpl: "al-ex-rombo", pts: 12 }, { pick: ["al-escalar-num", "al-dist-num"], pts: 10 }] }
          ] },
          { any: [
            { title: "Determinante e inversa", parts: [{ self: "al-ex-adjunta", pts: 20 }] },
            { title: "Ecuación matricial e inversa", parts: [{ tpl: "al-ex-matrices", pts: 8 }, { self: "al-ex-adjunta", pts: 12 }] }
          ] },
          { any: [
            { title: "Sistema con parámetro", parts: [{ self: "al-ex-sistema-k", pts: 14 }, { tpl: "al-param-num", pts: 10 }] },
            { title: "Rouché-Frobenius con parámetro", parts: [{ tpl: "al-ex-rouche-k", pts: 12 }, { tpl: "al-rouche-mc", pts: 12 }] }
          ] },
          { title: "Verdadero o falso (justificando)", parts: [{ tpl: "al-li-vf", pts: 6 }, { tpl: "al-matriz-vf", pts: 6 }, { tpl: "al-homog-vf", pts: 6 }, { tpl: "al-detprop-num", pts: 6 }] },
          { title: "Sistemas", parts: [{ pick: ["al-rouche-mc", "al-cramer-num", "al-sistema-num"], pts: 10 }] }
        ] },
      { id: "p2", kind: "parcial", title: "2.º parcial", topics: "Espacios vectoriales y transformaciones lineales", minutes: 120, pass: 60,
        items: [
          { title: "Subespacios", parts: [{ any: [{ self: "al-ex-subespacio" }, { self: "al-ex-subespacio-param" }], pts: 20 }] },
          { any: [
            { title: "Bases y coordenadas", parts: [{ tpl: "al-coord-num", pts: 10 }, { tpl: "al-dim-num", pts: 10 }] },
            { title: "Coordenadas en una base de matrices", parts: [{ tpl: "al-ex-coord-m2", pts: 20 }] }
          ] },
          { any: [
            { title: "Transformaciones lineales: núcleo e imagen", parts: [{ tpl: "al-tl-vf", pts: 8 }, { tpl: "al-nucleo-num", pts: 12 }, { tpl: "al-dimteo-mc", pts: 10 }] },
            { title: "Resta de transformaciones lineales", parts: [{ self: "al-ex-tl-resta", pts: 30 }] }
          ] },
          { title: "Matriz asociada y familias", parts: [{ tpl: "al-matriz-tl-num", pts: 10 }, { tpl: "al-base-vf", pts: 10 }, { tpl: "al-subesp-vf", pts: 10 }] }
        ] },
      { id: "final", kind: "final", title: "Final regular (parte escrita)", topics: "Toda la materia, con demostraciones. En el real se necesita el 60 % del escrito para pasar al oral.", minutes: 60, pass: 60,
        items: [
          { any: [
            { title: "Núcleo de una transformación lineal", parts: [{ self: "al-ex-demo-nucleo", pts: 15 }, { tpl: "al-dimteo-mc", pts: 10 }] },
            { title: "Propiedades de las transformaciones lineales", parts: [{ self: "al-ex-demo-tl-props", pts: 15 }, { tpl: "al-tl-vf", pts: 10 }] }
          ] },
          { any: [
            { title: "Isomorfismo, matriz asociada y autovalores", parts: [{ self: "al-ex-iso-diag", pts: 30 }] },
            { title: "Autovalores y diagonalización ortogonal", parts: [{ self: "al-ex-eigen-sim", pts: 30 }] }
          ] },
          { title: "Verdadero o falso (justificando)", parts: [{ tpl: "al-diag-vf", pts: 9 }, { tpl: "al-matriz-vf", pts: 8 }, { tpl: "al-homog-vf", pts: 8 }] },
          { title: "Demostración", parts: [{ any: [{ self: "al-ex-demo-ortog" }, { self: "al-ex-demo-autovec" }], pts: 20 }] }
        ] }
    ]
  });
})();

/* ===== M104 · Evaluaciones: más variantes (parciales 2018 y 2019, final regular parte II) ===== */
(function () {
  const E = window.Efecen, R = String.raw;
  const T = {}, SELF = {};
  const pm = M => `\\begin{pmatrix} ${M.map(row => row.join(" & ")).join(R` \\ `)} \\end{pmatrix}`;
  const vec = v => `(${v.join(", ")})`;
  const nf = (H, x, d = 3) => H.num(x, d).replace(".", "{,}");
  // rango por eliminación gaussiana (para los verify)
  const rank = A0 => {
    const A = A0.map(r => r.slice()), m = A.length, n = A[0].length;
    let rk = 0;
    for (let c = 0; c < n && rk < m; c++) {
      let p = rk;
      for (let i = rk + 1; i < m; i++) if (Math.abs(A[i][c]) > Math.abs(A[p][c])) p = i;
      if (Math.abs(A[p][c]) < 1e-9) continue;
      [A[rk], A[p]] = [A[p], A[rk]];
      for (let i = 0; i < m; i++) if (i !== rk) { const f = A[i][c] / A[rk][c]; for (let j = c; j < n; j++) A[i][j] -= f * A[rk][j]; }
      rk++;
    }
    return rk;
  };

  // sistema 3×3 con parámetro: ¿para qué k hay infinitas soluciones o ninguna?
  T["al-ex-rouche-k"] = {
    type: "numeric", concepts: ["al-rouche"], difficulty: 3,
    generate(r, H) {
      const r1 = [1, r.nz(-3, 3), r.int(-3, 3)], r2 = [r.nz(-2, 3), r.nz(-3, 3), r.int(-3, 3)];
      if (r1[0] * r2[1] - r1[1] * r2[0] === 0) return null;
      const [k0, k1] = r.distinct(2, -3, 3), b1 = r.int(-4, 4), b2 = r.int(-4, 4);
      const A = k => [r1, r2, [r1[0] + r2[0], r1[1] + r2[1], r1[2] + r2[2] + (k - k0) * (k - k1)]], b = k => [b1, b2, b1 + b2 + (k - k0)];
      const ask = r.pick(["inf", "none"]), ans = ask === "inf" ? k0 : k1;
      const c3 = H.poly([[1, "k^{2}"], [-(k0 + k1), "k"], [k0 * k1 + r1[2] + r2[2], ""]]), b3 = H.poly([[1, "k"], [b1 + b2 - k0, ""]]);
      const eq = (row, bb) => `${H.poly([[row[0], "x"], [row[1], "y"], [row[2], "z"]])} = ${bb}`;
      return {
        prompt: `Dado el sistema $$\\begin{cases} ${eq(r1, b1)} \\\\ ${eq(r2, b2)} \\\\ ${H.poly([[r1[0] + r2[0], "x"], [r1[1] + r2[1], "y"]])} + (${c3})z = ${b3} \\end{cases}$$ ¿para qué valor de $k$ el sistema ${ask === "inf" ? "tiene **infinitas** soluciones" : "**no** tiene solución"}?`,
        answer: ans,
        solution: [
          `Restando a la tercera ecuación la suma de las dos primeras queda $(k - ${H.par(k0)})(k - ${H.par(k1)})\\,z = k - ${H.par(k0)}$ (después de simplificar).`,
          `Si $k \\neq ${k0}$ y $k \\neq ${k1}$: $\\operatorname{rg}A = \\operatorname{rg}[A|b] = 3$, compatible determinado.`,
          `Si $k = ${k0}$: la tercera fila queda nula en la ampliada, $\\operatorname{rg}A = \\operatorname{rg}[A|b] = 2 < 3$: **infinitas** soluciones.`,
          `Si $k = ${k1}$: queda $0 = ${k1 - k0}$, $\\operatorname{rg}A = 2 \\neq \\operatorname{rg}[A|b] = 3$: **sin solución**.`
        ],
        verify: { kind: "truth", target: true, fn: () => { const ra = rank(A(ans)), rb = rank(A(ans).map((row, i) => row.concat(b(ans)[i]))); return ask === "inf" ? ra === 2 && rb === 2 : ra === 2 && rb === 3; } }
      };
    }
  };

  // sistema de dos ecuaciones matriciales: A − B = M y 2A + B = N
  T["al-ex-matrices"] = {
    type: "numeric", concepts: ["al-matrices"], difficulty: 2,
    generate(r, H) {
      const A = [0, 1, 2].map(() => [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)]), B = [0, 1, 2].map(() => [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)]);
      const M = A.map((row, i) => row.map((x, j) => x - B[i][j])), N = A.map((row, i) => row.map((x, j) => 2 * x + B[i][j]));
      const which = r.pick(["A", "B"]), i = r.int(0, 2), j = r.int(0, 2), ans = (which === "A" ? A : B)[i][j];
      return {
        prompt: `Las matrices $A$ y $B$ de orden 3 cumplen $$A - B = ${pm(M)} \\quad\\text{y}\\quad 2A + B = ${pm(N)}.$$ ¿Cuánto vale el elemento $(${i + 1}, ${j + 1})$ de $${which}$?`,
        answer: ans,
        solution: [R`Sumando las dos ecuaciones: $3A = (A - B) + (2A + B)$, así que $A = \frac13\left[(A - B) + (2A + B)\right]$.`,
          `$A = ${pm(A)}$ y $B = A - (A - B) = ${pm(B)}$.`, `El elemento $(${i + 1}, ${j + 1})$ de $${which}$ es $${ans}$.`],
        verify: { kind: "zero", fn: x => { const a = which === "A" ? x : A[i][j], b2 = which === "B" ? x : B[i][j]; return [a - b2 - M[i][j], 2 * a + b2 - N[i][j]]; } }
      };
    }
  };

  // rombo: diagonales perpendiculares y área
  T["al-ex-rombo"] = {
    type: "numeric", concepts: ["al-escalar", "al-vectores"], difficulty: 2,
    generate(r, H) {
      const C = [r.int(-3, 5), r.int(-3, 5)], u = [r.nz(-3, 3), r.int(-3, 3)], t = r.pick([1, 2]), v = [-u[1] * t, u[0] * t];
      const P = [[C[0] + u[0], C[1] + u[1]], [C[0] + v[0], C[1] + v[1]], [C[0] - u[0], C[1] - u[1]], [C[0] - v[0], C[1] - v[1]]];
      const area = 2 * t * (u[0] ** 2 + u[1] ** 2);
      return {
        prompt: `Sean $a = ${vec(P[0])}$, $b = ${vec(P[1])}$, $c = ${vec(P[2])}$ y $d = ${vec(P[3])}$ en $\\mathbb{R}^2$. Comprobá que las diagonales del cuadrilátero $abcd$ son perpendiculares y calculá su área.`,
        answer: area,
        solution: [`Diagonales: $\\overrightarrow{ac} = ${vec([P[2][0] - P[0][0], P[2][1] - P[0][1]])}$ y $\\overrightarrow{bd} = ${vec([P[3][0] - P[1][0], P[3][1] - P[1][1]])}$; su producto escalar es $0$: son perpendiculares (y se cortan en su punto medio: es un rombo).`,
          `Área de un rombo: $\\frac{\\|\\overrightarrow{ac}\\|\\,\\|\\overrightarrow{bd}\\|}{2} = ${area}$.`],
        // otro camino: fórmula del zapatero con los cuatro vértices
        verify: { kind: "value", fn: () => Math.abs(P.reduce((s, p, k) => s + p[0] * P[(k + 1) % 4][1] - P[(k + 1) % 4][0] * p[1], 0)) / 2 }
      };
    }
  };

  // coordenadas de una matriz en una base de M2x2
  T["al-ex-coord-m2"] = {
    type: "numeric", concepts: ["al-base"], difficulty: 3,
    generate(r, H) {
      const Bs = [0, 1, 2, 3].map(() => [[r.int(-2, 3), r.int(-2, 3)], [r.int(-2, 3), r.int(-2, 3)]]);
      if (rank(Bs.map(b => b.flat())) < 4) return null;
      const c = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)], k = r.int(0, 3);
      const D = [[0, 0], [0, 0]].map((row, i) => row.map((_, j) => c.reduce((s, ci, q) => s + ci * Bs[q][i][j], 0)));
      return {
        prompt: `En $M_{2\\times2}(\\mathbb{R})$ se tiene la base $B = \\left\\{ ${Bs.map(pm).join(",\\ ")} \\right\\}$. Si $D = ${pm(D)}$ en la base canónica, ¿cuál es la ${["primera", "segunda", "tercera", "cuarta"][k]} componente de $D$ en la base $B$?`,
        answer: c[k],
        solution: [R`Buscamos $\alpha_1, \dots, \alpha_4$ con $D = \alpha_1 B_1 + \alpha_2 B_2 + \alpha_3 B_3 + \alpha_4 B_4$: igualando los cuatro elementos queda un sistema de $4\times4$.`,
          `Resolviéndolo: $[D]_B = (${c.join(", ")})$. La componente pedida es $${c[k]}$.`],
        verify: { kind: "zero", fn: x => { const cc = c.slice(); cc[k] = x; return [0, 1].flatMap(i => [0, 1].map(j => cc.reduce((s, ci, q) => s + ci * Bs[q][i][j], 0) - D[i][j])); } }
      };
    }
  };

  // ---------- desarrollo ----------
  // subespacio de P3 dado como combinación de dos parámetros
  SELF["al-ex-subespacio-param"] = {
    concepts: ["al-subespacio", "al-base"],
    generate(r, H) {
      const p = [r.int(-2, 2), r.int(-2, 2), r.int(-2, 2), r.int(-2, 2)], q = [r.int(-2, 3), r.int(-2, 3), r.int(-2, 3), r.int(-2, 3)];
      if (rank([p, q]) < 2 || p[0] === 0 && q[0] === 0) return null;
      const coef = i => H.poly([[p[i], "a"], [q[i], "b"]]);
      const pol = c => H.poly([[c[0], "x^{3}"], [c[1], "x^{2}"], [c[2], "x"], [c[3], ""]]);
      const terms = ["x^3", "x^2", "x", ""].map((m, i) => `(${coef(i)})${m}`).join(" + ");
      return {
        prompt: `Sea $F$ el conjunto de los polinomios de la forma $p(x) = ${terms}$, con $a, b \\in \\mathbb{R}$. a) Determiná si $F$ es un subespacio de $P_3$. b) En caso afirmativo, hallá una base y la dimensión de $F$.`,
        rubric: [
          { text: `Reescribe $p = a(${pol(p)}) + b(${pol(q)})$: $F$ es el conjunto generado por esos dos polinomios.`, w: 3 },
          { text: R`Prueba que es subespacio: contiene al $0$ ($a = b = 0$) y es cerrado por suma y por producto por escalares (o porque todo conjunto generado lo es).`, w: 4 },
          { text: R`Prueba que los dos polinomios son LI y concluye $\dim F = 2$.`, w: 3 }
        ],
        solution: [
          `Agrupando por $a$ y por $b$: $p(x) = a(${pol(p)}) + b(${pol(q)})$. Entonces $F = \\operatorname{gen}\\{${pol(p)},\\ ${pol(q)}\\}$.`,
          R`Todo conjunto generado es un subespacio: con $a = b = 0$ sale el polinomio nulo, y sumar dos elementos o multiplicar por un escalar da otra combinación de los mismos dos polinomios.`,
          `Son LI porque no son múltiplo uno del otro (sus coeficientes no son proporcionales). Base $\\{${pol(p)},\\ ${pol(q)}\\}$: $\\dim F = 2$.`
        ],
        verify: { kind: "truth", target: true, fn: () => rank([p, q]) === 2 }
      };
    }
  };

  // h = f − g: matriz, linealidad, nulidad, rango y epimorfismo
  SELF["al-ex-tl-resta"] = {
    concepts: ["al-tl", "al-nucleo", "al-matriz-tl"],
    generate(r, H) {
      const F = [0, 1, 2].map(() => [r.int(-2, 3), r.int(-2, 3), r.int(-2, 3), r.int(-2, 3)]), G = [0, 1, 2].map(() => [r.int(-2, 3), r.int(-2, 3), r.int(-2, 3), r.int(-2, 3)]);
      const Hm = F.map((row, i) => row.map((x, j) => x - G[i][j])), rk = rank(Hm);
      if (rk < 2) return null;
      const comp = row => H.poly(row.map((c, j) => [c, `x_{${j + 1}}`]));
      const fx = M => `(${M.map(comp).join(",\\ ")})`;
      return {
        prompt: `Sean $f, g: \\mathbb{R}^4 \\to \\mathbb{R}^3$ las transformaciones lineales $f(x_1, x_2, x_3, x_4) = ${fx(F)}$ y $g(x_1, x_2, x_3, x_4) = ${fx(G)}$. a) Determiná si $h = f - g$ es una transformación lineal. b) En caso afirmativo, hallá su nulidad y su rango. c) Hallá la matriz de $h$ en las bases canónicas. d) ¿Es $h$ un epimorfismo?`,
        rubric: [
          { text: R`a) La resta de lineales es lineal (verifica aditividad y homogeneidad).`, w: 2 },
          { text: `c) $[h] = ${pm(Hm)}$.`, w: 2 },
          { text: `b) Rango $= ${rk}$ (escalonando la matriz) y nulidad $= 4 - ${rk} = ${4 - rk}$ (teorema de la dimensión).`, w: 4 },
          { text: `d) ${rk === 3 ? "Sí: el rango es 3 = dim del codominio." : `No: el rango es ${rk} < 3.`}`, w: 2 }
        ],
        solution: [
          R`a) $h(\vec u + \vec v) = f(\vec u + \vec v) - g(\vec u + \vec v) = f(\vec u) + f(\vec v) - g(\vec u) - g(\vec v) = h(\vec u) + h(\vec v)$, y lo mismo con $\lambda\vec u$: es lineal.`,
          `c) $h(x) = ${fx(Hm)}$, así que $[h] = ${pm(Hm)}$.`,
          `b) Escalonando, la matriz tiene rango $${rk}$: $\\dim\\operatorname{Im} h = ${rk}$. Por el teorema de la dimensión, $\\dim N(h) = 4 - ${rk} = ${4 - rk}$.`,
          `d) ${rk === 3 ? "Como $\\dim\\operatorname{Im} h = 3 = \\dim\\mathbb{R}^3$, $h$ es suryectiva: es un epimorfismo." : `Como $\\dim\\operatorname{Im} h = ${rk} < 3$, $h$ no es suryectiva: no es un epimorfismo.`}`
        ],
        verify: { kind: "rank", A: Hm, target: rk }
      };
    }
  };

  // autovalores y diagonalización ortogonal de una matriz simétrica 2×2
  SELF["al-ex-eigen-sim"] = {
    concepts: ["al-autovalores", "al-diagonalizacion"],
    generate(r, H) {
      // A = P D P^T con autovectores enteros (p, q) y (−q, p)
      const p = r.nz(-2, 2), q = r.nz(-2, 2), n2 = p * p + q * q, l1 = r.int(-4, 5), l2 = l1 + r.pick([-1, 1]) * n2;
      const a = (l1 * p * p + l2 * q * q), b = (l1 - l2) * p * q, c = (l1 * q * q + l2 * p * p);
      if (a % n2 || b % n2 || c % n2) return null;
      const A = [[a / n2, b / n2], [b / n2, c / n2]], tr = l1 + l2, de = l1 * l2;
      return {
        prompt: `Sea $A = ${pm(A)}$. a) Hallá el polinomio y la ecuación característica. b) Hallá los valores propios, los vectores propios y los subespacios propios. c) Indicá la multiplicidad algebraica y geométrica de cada valor propio. d) ¿Es $A$ diagonalizable ortogonalmente? Si lo es, hallá $P$ ortogonal y $D$ diagonal con $P^TAP = D$.`,
        rubric: [
          { text: `a) $p(\\lambda) = \\lambda^2 ${H.sg(-tr)}\\lambda ${H.sg(de)}$; ecuación $p(\\lambda) = 0$.`, w: 2 },
          { text: `b) $\\lambda = ${l1}$ con $S_{${l1}} = \\operatorname{gen}\\{(${p}, ${q})\\}$ y $\\lambda = ${l2}$ con $S_{${l2}} = \\operatorname{gen}\\{(${-q}, ${p})\\}$.`, w: 4 },
          { text: R`c) Cada valor propio tiene multiplicidad algebraica y geométrica $1$.`, w: 1 },
          { text: `d) Sí, por ser simétrica: $P = \\frac{1}{\\sqrt{${n2}}}${pm([[p, -q], [q, p]])}$ y $D = ${pm([[l1, 0], [0, l2]])}$.`, w: 3 }
        ],
        solution: [
          `a) $\\det(A - \\lambda I) = \\lambda^2 - (\\operatorname{tr}A)\\lambda + \\det A = \\lambda^2 ${H.sg(-tr)}\\lambda ${H.sg(de)}$.`,
          `b) Las raíces son $\\lambda_1 = ${l1}$ y $\\lambda_2 = ${l2}$. Resolviendo $(A - \\lambda I)\\vec v = \\vec 0$: para $${l1}$, $\\vec v = (${p}, ${q})$; para $${l2}$, $\\vec v = (${-q}, ${p})$.`,
          R`c) Son raíces simples (multiplicidad algebraica 1) y cada subespacio propio es una recta (multiplicidad geométrica 1).`,
          `d) $A$ es simétrica: sus autovectores de autovalores distintos son ortogonales (acá $(${p}, ${q})\\cdot(${-q}, ${p}) = 0$). Normalizándolos: $P = \\frac{1}{\\sqrt{${n2}}}${pm([[p, -q], [q, p]])}$, $P^TAP = ${pm([[l1, 0], [0, l2]])}$.`
        ],
        verify: { kind: "zero", tol: 1e-9, fn: () => [[p, q, l1], [-q, p, l2]].flatMap(([x, y, l]) => [A[0][0] * x + A[0][1] * y - l * x, A[1][0] * x + A[1][1] * y - l * y]) }
      };
    }
  };

  // demostraciones del final
  SELF["al-ex-demo-tl-props"] = {
    concepts: ["al-tl"],
    generate() {
      return {
        prompt: R`Sean $V$ y $W$ espacios vectoriales reales y $f: V \to W$ una transformación lineal. Demostrá que: a) $f(\vec 0) = \vec 0$; b) $f(-\vec v) = -f(\vec v)$ para todo $\vec v \in V$; c) $f(\vec v - \vec w) = f(\vec v) - f(\vec w)$ para todos $\vec v, \vec w \in V$.`,
        rubric: [
          { text: R`a) $f(\vec 0) = f(0\cdot\vec 0) = 0\cdot f(\vec 0) = \vec 0$ (o con $f(\vec 0) = f(\vec 0 + \vec 0) = 2f(\vec 0)$).`, w: 1 },
          { text: R`b) $f(-\vec v) = f((-1)\vec v) = (-1)f(\vec v) = -f(\vec v)$.`, w: 1 },
          { text: R`c) $f(\vec v - \vec w) = f(\vec v + (-\vec w)) = f(\vec v) + f(-\vec w) = f(\vec v) - f(\vec w)$, usando b).`, w: 1 }
        ],
        solution: [R`a) Por la homogeneidad con $\lambda = 0$: $f(\vec 0) = f(0\,\vec 0) = 0\,f(\vec 0) = \vec 0_W$.`,
          R`b) $-\vec v = (-1)\vec v$, y por homogeneidad $f(-\vec v) = (-1)f(\vec v) = -f(\vec v)$.`,
          R`c) $\vec v - \vec w = \vec v + (-\vec w)$. Por aditividad y por b): $f(\vec v - \vec w) = f(\vec v) + f(-\vec w) = f(\vec v) - f(\vec w)$.`]
      };
    }
  };
  SELF["al-ex-demo-autovec"] = {
    concepts: ["al-autovalores"],
    generate() {
      return {
        prompt: R`Sea $f$ un endomorfismo de un espacio vectorial $V$ y sea $\vec u$ un vector propio de $f$ asociado al valor propio $\lambda$. Demostrá que todo vector no nulo linealmente dependiente de $\vec u$ es también un vector propio de $f$ asociado a $\lambda$.`,
        rubric: [
          { text: R`Escribe el vector como $\vec v = \alpha\vec u$ con $\alpha \neq 0$ (para que $\vec v \neq \vec 0$).`, w: 1 },
          { text: R`Calcula $f(\vec v) = f(\alpha\vec u) = \alpha f(\vec u) = \alpha\lambda\vec u = \lambda(\alpha\vec u) = \lambda\vec v$.`, w: 2 },
          { text: R`Concluye que $\vec v$ es vector propio de $\lambda$ (es no nulo y cumple la definición).`, w: 1 }
        ],
        solution: [R`Si $\vec v$ es LD con $\vec u$ (y no nulo), entonces $\vec v = \alpha\vec u$ con $\alpha \neq 0$.`,
          R`Por la linealidad de $f$: $f(\vec v) = f(\alpha\vec u) = \alpha f(\vec u) = \alpha(\lambda\vec u) = \lambda(\alpha\vec u) = \lambda\vec v$.`,
          R`Como $\vec v \neq \vec 0$ y $f(\vec v) = \lambda\vec v$, $\vec v$ es un vector propio asociado a $\lambda$.`]
      };
    }
  };

  E.registerExams("m104", { self: SELF, templates: T });
})();

/* ===== M104 · Examen Extra UBA =====
   Temas de Matemática 2 de la Lic. en Cs. Físicas (FCEN, UBA) que no están en el programa de M104: producto interno
   general, teorema espectral, Jordan y exponencial de matrices, espacios complejos. Enunciados propios y datos sorteados. */
(function () {
  const E = window.Efecen, H = E.H;
  const SELF = {};
  const nd = (x, d = 4) => String(H.num(x, d)).replace(".", "{,}");
  const mat = M => `\\begin{pmatrix} ${M.map(r => r.join(" & ")).join(" \\\\ ")} \\end{pmatrix}`;
  // arregla los signos dobles que quedan al reemplazar números negativos ("- -3" → "+ 3")
  const tidy = o => { const f = t => t.replace(/\+ -/g, "- ").replace(/- -/g, "+ "); o.prompt = f(o.prompt); o.solution = o.solution.map(f); o.rubric.forEach(q => { q.text = f(q.text); }); return o; };
  const cx = (a, b) => (b === 0 ? String(a) : `${a === 0 ? "" : a}${a === 0 ? (b < 0 ? "-" : "") : b < 0 ? " - " : " + "}${Math.abs(b) === 1 ? "" : Math.abs(b)}i`);

  SELF["al-ex-hermitica"] = {
    concepts: ["al-unitarias"],
    generate(r) {
      const a = r.int(-3, 4), d = r.int(-3, 4), b = r.int(-3, 3), c = r.nz(-3, 3);
      const m = (a + d) / 2, rad = Math.sqrt(((a - d) / 2) ** 2 + b * b + c * c), l1 = m + rad, l2 = m - rad;
      // autovector de λ: (z, λ − a), con z = b + ci
      const n1 = Math.sqrt(b * b + c * c + (l1 - a) ** 2);
      return tidy({
        prompt: `Sea $H = ${mat([[a, cx(b, c)], [cx(b, -c), d]])}$.<br>a) Verificá que $H$ es hermítica y calculá sus autovalores.<br>b) Encontrá un autovector para cada autovalor y comprobá que son ortogonales con el producto interno de $\\mathbb C^2$.<br>c) Encontrá una matriz unitaria $U$ con $U^*HU$ diagonal.`,
        rubric: [
          { text: `a) $H^* = \\overline{H}^T = H$: es [[al-unitarias|hermítica]]. $\\det(H - \\lambda I) = \\lambda^2 - ${a + d}\\lambda + ${a * d - b * b - c * c} = 0$ da $\\lambda_1 \\approx ${nd(l1)}$ y $\\lambda_2 \\approx ${nd(l2)}$, reales.`, w: 3 },
          { text: `b) De la primera fila, $v = (${cx(b, c)},\\ \\lambda - ${a})$ es autovector. Con $\\lambda_1$ y $\\lambda_2$: $\\langle v_1, v_2\\rangle = |z|^2 + (\\lambda_1 - ${a})(\\lambda_2 - ${a}) = ${b * b + c * c} + (${nd(l1 - a)})(${nd(l2 - a)}) = 0$.`, w: 4 },
          { text: `c) Normalizando, $\\|v_1\\| \\approx ${nd(n1)}$, y poniendo $\\frac{v_1}{\\|v_1\\|}$ y $\\frac{v_2}{\\|v_2\\|}$ como columnas, $U$ es unitaria y $U^*HU = \\text{diag}(${nd(l1)},\\ ${nd(l2)})$ ([[al-pi-complejo|producto interno complejo]]).`, w: 3 }
        ],
        solution: [`Para una hermítica, los autovalores son reales y los autovectores de autovalores distintos son ortogonales: por eso alcanza con normalizarlos.`,
          `Con $a = ${a}$: $(\\lambda_1 - a)(\\lambda_2 - a) = \\lambda_1\\lambda_2 - a(\\lambda_1 + \\lambda_2) + a^2 = -|z|^2$, que cancela $|z|^2$.`],
        // otro camino: iteración de potencias (con corrimiento) sobre H en aritmética compleja para el mayor autovalor,
        // y el producto interno complejo de los dos autovectores
        verify: { kind: "zero", tol: 1e-6, fn: () => {
          const sh = Math.abs(a) + Math.abs(d) + Math.abs(b) + Math.abs(c) + 1, Hm = (x) => [[(a + sh) * x[0][0] + b * x[1][0] - c * x[1][1], (a + sh) * x[0][1] + b * x[1][1] + c * x[1][0]], [b * x[0][0] + c * x[0][1] + (d + sh) * x[1][0], b * x[0][1] - c * x[0][0] + (d + sh) * x[1][1]]];
          let x = [[1, 0.3], [0.7, -0.2]], lam = 0;
          for (let i = 0; i < 3000; i++) { const y = Hm(x), nn = Math.hypot(...y[0], ...y[1]); lam = nn / Math.hypot(...x[0], ...x[1]); x = y.map(z => z.map(v => v / nn)); }
          const v1 = [[b, c], [l1 - a, 0]], v2 = [[b, c], [l2 - a, 0]], ip = v1.reduce((s, z, k) => s + z[0] * v2[k][0] + z[1] * v2[k][1], 0);
          return [(lam - sh) - l1, ip / (1 + b * b + c * c)];
        } }
      });
    }
  };

  SELF["al-ex-jordan-ode"] = {
    concepts: ["al-jordan", "al-exponencial"],
    generate(r) {
      const lam = r.pick([-2, -1, 1]), p = r.int(-2, 2), q = r.int(-2, 2), x0 = [r.nz(-3, 3), r.int(-3, 3)];
      const P = [[1, p], [q, 1 + p * q]], Pi = [[1 + p * q, -p], [-q, 1]];
      const J = [[lam, 1], [0, lam]], mm = (X, Y) => X.map(row => Y[0].map((_, j) => row.reduce((s, v, k) => s + v * Y[k][j], 0)));
      const A = mm(mm(P, J), Pi);
      const eAt = t => mm(mm(P, [[Math.exp(lam * t), t * Math.exp(lam * t)], [0, Math.exp(lam * t)]]), Pi), x1 = eAt(1).map(row => row[0] * x0[0] + row[1] * x0[1]);
      const v = [P[0][0], P[1][0]], w = [P[0][1], P[1][1]];
      return tidy({
        prompt: `Sea $A = ${mat(A)}$.<br>a) Calculá sus autovalores y autovectores. ¿Es diagonalizable?<br>b) Encontrá su forma de Jordan $J$ y una matriz $P$ con $A = PJP^{-1}$.<br>c) Resolvé $\\vec x\\,' = A\\vec x$ con $\\vec x(0) = (${x0.join(", ")})$ y calculá $\\vec x(1)$.`,
        rubric: [
          { text: `a) $\\chi(\\lambda) = (\\lambda ${lam > 0 ? "-" : "+"} ${Math.abs(lam)})^2$: autovalor doble $${lam}$. $A - (${lam})I$ tiene rango 1, así que hay un solo autovector independiente, $(${v.join(", ")})$: no es diagonalizable.`, w: 3 },
          { text: `b) Un [[al-jordan|autovector generalizado]] $w$ con $(A - ${lam}I)w = v$ es $w = (${w.join(", ")})$. Con $P = ${mat(P)}$, $J = ${mat(J)}$.`, w: 3 },
          { text: `c) [[al-exponencial|Exponencial]]: $e^{Jt} = e^{${lam}t}${mat([["1", "t"], ["0", "1"]])}$ y $\\vec x(t) = Pe^{Jt}P^{-1}\\vec x(0)$.`, w: 2 },
          { text: `$\\vec x(1) \\approx (${nd(x1[0])},\\ ${nd(x1[1])})$.`, w: 2 }
        ],
        solution: [`Como $J = \\lambda I + N$ con $N^2 = 0$ y las dos partes conmutan, $e^{Jt} = e^{\\lambda t}(I + Nt)$: aparece el término $te^{\\lambda t}$ típico de las raíces dobles.`,
          `$P^{-1} = ${mat(Pi)}$ y $\\vec x(1) \\approx (${nd(x1[0])},\\ ${nd(x1[1])})$.`],
        // otro camino: se integra el sistema con RK4 y se comprueba que w es autovector generalizado
        verify: { kind: "zero", tol: 1e-6, fn: () => {
          const f = y => [A[0][0] * y[0] + A[0][1] * y[1], A[1][0] * y[0] + A[1][1] * y[1]], n = 4000, h = 1 / n; let y = x0.slice();
          for (let i = 0; i < n; i++) { const k1 = f(y), k2 = f(y.map((s, j) => s + h / 2 * k1[j])), k3 = f(y.map((s, j) => s + h / 2 * k2[j])), k4 = f(y.map((s, j) => s + h * k3[j])); y = y.map((s, j) => s + h / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])); }
          const Aw = [A[0][0] * w[0] + A[0][1] * w[1] - lam * w[0], A[1][0] * w[0] + A[1][1] * w[1] - lam * w[1]];
          return [(y[0] - x1[0]) / (1 + Math.abs(x1[0])), (y[1] - x1[1]) / (1 + Math.abs(x1[1])), Aw[0] - v[0], Aw[1] - v[1]];
        } }
      });
    }
  };

  E.registerExams("m104", {
    self: SELF,
    exams: [
      { id: "uba", kind: "parcial", title: "Examen Extra UBA", topics: "Temas de Matemática 2 de la UBA que no están en el programa: producto interno general y cuadrados mínimos, teorema espectral, forma de Jordan y exponencial, espacios complejos.", minutes: 180, pass: 60,
        items: [
          { title: "Matriz hermítica", parts: [{ self: "al-ex-hermitica", pts: 20 }] },
          { title: "Jordan y sistemas de ecuaciones diferenciales", parts: [{ self: "al-ex-jordan-ode", pts: 20 }] },
          { any: [
            { title: "Producto interno y proyección", parts: [{ tpl: "al-pi-polinomios-num", pts: 12 }, { tpl: "al-cuadratica-mc", pts: 8 }] },
            { title: "Cuadrados mínimos y teorema espectral", parts: [{ tpl: "al-cuadmin-num", pts: 12 }, { tpl: "al-espectral-num", pts: 8 }] },
            { title: "Proyección ortogonal", parts: [{ tpl: "al-proyeccion-num", pts: 12 }, { tpl: "al-cuadratica-mc", pts: 8 }] }
          ] },
          { any: [
            { title: "Jordan y Cayley-Hamilton", parts: [{ tpl: "al-jordan-mc", pts: 12 }, { tpl: "al-jordan-vf", pts: 8 }] },
            { title: "Cayley-Hamilton y recurrencias", parts: [{ tpl: "al-cayley-num", pts: 12 }, { tpl: "al-recurrencia-num", pts: 8 }] },
            { title: "Exponencial de una matriz", parts: [{ tpl: "al-exp-num", pts: 12 }, { tpl: "al-jordan-vf", pts: 8 }] }
          ] },
          { any: [
            { title: "Espacios complejos", parts: [{ tpl: "al-proy-complejo-num", pts: 12 }, { tpl: "al-pi-complejo-vf", pts: 8 }] },
            { title: "Unitarias y hermíticas", parts: [{ tpl: "al-hermitica-num", pts: 12 }, { tpl: "al-unitaria-vf", pts: 8 }] }
          ] }
        ] }
    ]
  });
})();
