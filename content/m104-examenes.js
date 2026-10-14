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
    exams: [
      { id: "p1", kind: "parcial", title: "1.er parcial", topics: "Vectores, matrices, determinantes y sistemas", minutes: 120, pass: 60,
        items: [
          { title: "Vectores en el espacio", parts: [{ self: "al-ex-paralelogramo", pts: 16 }, { tpl: "al-proy-num", pts: 6 }] },
          { title: "Determinante e inversa", parts: [{ self: "al-ex-adjunta", pts: 20 }] },
          { title: "Sistema con parámetro", parts: [{ self: "al-ex-sistema-k", pts: 14 }, { tpl: "al-param-num", pts: 10 }] },
          { title: "Verdadero o falso (justificando)", parts: [{ tpl: "al-li-vf", pts: 6 }, { tpl: "al-matriz-vf", pts: 6 }, { tpl: "al-homog-vf", pts: 6 }, { tpl: "al-detprop-num", pts: 6 }] },
          { title: "Rouché-Frobenius", parts: [{ tpl: "al-rouche-mc", pts: 10 }] }
        ] },
      { id: "p2", kind: "parcial", title: "2.º parcial", topics: "Espacios vectoriales y transformaciones lineales", minutes: 120, pass: 60,
        items: [
          { title: "Subespacios", parts: [{ self: "al-ex-subespacio", pts: 20 }] },
          { title: "Bases y coordenadas", parts: [{ tpl: "al-coord-num", pts: 10 }, { tpl: "al-dim-num", pts: 10 }] },
          { title: "Transformaciones lineales: núcleo e imagen", parts: [{ tpl: "al-tl-vf", pts: 8 }, { tpl: "al-nucleo-num", pts: 12 }, { tpl: "al-dimteo-mc", pts: 10 }] },
          { title: "Matriz asociada y familias", parts: [{ tpl: "al-matriz-tl-num", pts: 10 }, { tpl: "al-base-vf", pts: 10 }, { tpl: "al-subesp-vf", pts: 10 }] }
        ] },
      { id: "final", kind: "final", title: "Final regular (parte escrita)", topics: "Toda la materia, con demostraciones. En el real se necesita el 60 % del escrito para pasar al oral.", minutes: 60, pass: 60,
        items: [
          { title: "Núcleo de una transformación lineal", parts: [{ self: "al-ex-demo-nucleo", pts: 15 }, { tpl: "al-dimteo-mc", pts: 10 }] },
          { title: "Isomorfismo, matriz asociada y autovalores", parts: [{ self: "al-ex-iso-diag", pts: 30 }] },
          { title: "Verdadero o falso (justificando)", parts: [{ tpl: "al-diag-vf", pts: 9 }, { tpl: "al-matriz-vf", pts: 8 }, { tpl: "al-homog-vf", pts: 8 }] },
          { title: "Ortogonalidad", parts: [{ self: "al-ex-demo-ortog", pts: 20 }] }
        ] }
    ]
  });
})();
