/* ===== M101 · Evaluaciones: parciales y final simulados =====
   Armados a partir de la estructura de los parciales y finales reales de la cátedra (temas, tipo de
   ejercicios y puntajes; ver docs/parciales/m101.md), pero con enunciados propios y números sorteados:
   cada intento es distinto. Las partes con `tpl` o `pick` usan las plantillas de la materia y se corrigen
   solas; las de `self` son de desarrollo (demostraciones, enunciados, bosquejos): al entregar se muestra
   la resolución y uno se corrige con los criterios de la rúbrica. */
(function () {
  const E = window.Efecen, R = String.raw;
  const SELF = {};

  // demostración de un límite por definición (ε-δ), con interpretación gráfica
  SELF["ex-epsdelta"] = {
    concepts: ["lim-sustitucion"],
    generate(r, H) {
      const a = r.nz(-3, 3), b = r.int(-4, 4), c = r.int(-5, 5), L = a * a + b * a + c;
      const f = H.poly([[1, "x^{2}"], [b, "x"], [c, ""]]), M = 1 + Math.abs(2 * a + b);
      const other = H.xm(-(a + b)), d05 = Math.min(1, 0.5 / M);
      return {
        verify: { kind: "zero", fn: () => [0.5, 0.1, 0.01, 2].flatMap(eps => { const dl = Math.min(1, eps / M); return [-0.999, -0.5, 0.3, 0.999].map(t => { const x = a + t * dl; return Math.max(0, Math.abs(x * x + b * x + c - L) - eps); }); }) },
        prompt: `Demostrá por definición que $$\\lim_{x\\to ${a}} \\left(${f}\\right) = ${L}.$$ Después interpretá gráficamente tu demostración para $\\varepsilon = 0{,}5$: ¿qué $\\delta$ obtenés?`,
        rubric: [
          { text: R`Escribe bien la definición: para todo $\varepsilon > 0$ existe $\delta > 0$ tal que $0 < |x - a| < \delta \Rightarrow |f(x) - L| < \varepsilon$.`, w: 3 },
          { text: R`Factoriza $|f(x) - L|$ y aparece el factor $|x - a|$.`, w: 3 },
          { text: R`Acota el otro factor (por ejemplo, pidiendo $\delta \le 1$).`, w: 4 },
          { text: R`Elige $\delta$ en función de $\varepsilon$ y verifica que cumple la definición.`, w: 4 },
          { text: R`Interpreta gráficamente con $\varepsilon = 0{,}5$ (banda horizontal y entorno de $a$).`, w: 1 }
        ],
        solution: [
          `Hay que ver que, para todo $\\varepsilon > 0$, existe $\\delta > 0$ tal que $0 < |${H.xm(a)}| < \\delta \\Rightarrow |${f} - ${H.par(L)}| < \\varepsilon$.`,
          `**Cálculo auxiliar.** $|${f} - ${H.par(L)}| = |(${H.xm(a)})(${other})| = |${H.xm(a)}|\\,|${other}|$.`,
          `Si pedimos $\\delta \\le 1$, entonces $|${H.xm(a)}| < 1$ y $|${other}| = |(${H.xm(a)}) + ${H.par(2 * a + b)}| \\le |${H.xm(a)}| + ${Math.abs(2 * a + b)} < ${M}$.`,
          `Así, $|f(x) - ${H.par(L)}| < ${M}\\,|${H.xm(a)}|$, y alcanza con $|${H.xm(a)}| < \\frac{\\varepsilon}{${M}}$.`,
          `**Demostración.** Dado $\\varepsilon > 0$, tomamos $\\delta = \\min\\left\\{1, \\frac{\\varepsilon}{${M}}\\right\\}$. Si $0 < |${H.xm(a)}| < \\delta$, entonces $|${other}| < ${M}$ y $|f(x) - ${H.par(L)}| < ${M}\\cdot\\frac{\\varepsilon}{${M}} = \\varepsilon$.`,
          `**Interpretación.** Con $\\varepsilon = 0{,}5$: $\\delta = \\min\\{1, \\frac{0{,}5}{${M}}\\} \\approx ${H.num(d05, 3).replace(".", "{,}")}$. Para todo $x$ a menos de $\\delta$ de $${a}$ (salvo $x = ${a}$), el gráfico queda dentro de la banda $${H.num(L - 0.5).replace(".", "{,}")} < y < ${H.num(L + 0.5).replace(".", "{,}")}$.`
        ]
      };
    }
  };

  // función a trozos: condiciones de continuidad y clasificación de discontinuidades
  SELF["ex-cont-trozos"] = {
    concepts: ["continuidad"],
    generate(r, H) {
      const p = r.int(-4, -1), s = r.int(1, 4), m = r.int(2, 5);
      const num = H.poly([[1, "x^{2}"], [-(p + s), "x"], [p * s, ""]]);
      return {
        verify: { kind: "zero", tol: 1e-5, fn: () => { const f1 = x => (x * x - (p + s) * x + p * s) / (x - p); return [f1(p + 1e-7) - (p - s), f1(p - 1e-7) - (p - s), f1(-1e-9) + s, 1 / (m - 1e-12) - 1 / m]; } },
        prompt: `Sea $$f(x) = \\begin{cases} \\dfrac{${num}}{${H.xm(p)}} & \\text{si } -5 \\le x < 0 \\\\[6pt] \\dfrac{1}{${m} - x} & \\text{si } 0 \\le x \\le 6 \\end{cases}$$ a) Escribí las tres condiciones para que una función sea continua en $x = a$. b) Encontrá los puntos de discontinuidad de $f$ en $[-5, 6]$, justificá con los límites que correspondan y clasificalos. c) Si alguna es evitable, redefiní $f$ para que sea continua ahí.`,
        rubric: [
          { text: R`a) Las tres condiciones: $f(a)$ existe, $\lim_{x\to a} f(x)$ existe y son iguales.`, w: 3 },
          { text: `b) En $x = ${p}$: $f$ no está definida, el límite existe y vale $${p - s}$: discontinuidad evitable.`, w: 5 },
          { text: `b) En $x = 0$: los laterales valen $${-s}$ y $${H.frac(1, m)}$, distintos: salto finito.`, w: 5 },
          { text: `b) En $x = ${m}$: los laterales son infinitos: discontinuidad infinita (asíntota vertical).`, w: 4 },
          { text: `c) Redefine $f(${p}) = ${p - s}$ (o simplifica el cociente a $${H.xm(s)}$).`, w: 3 }
        ],
        solution: [
          R`a) $f$ es continua en $a$ si: 1) $f(a)$ está definida; 2) $\lim_{x\to a} f(x)$ existe (los dos laterales son iguales); 3) $\lim_{x\to a} f(x) = f(a)$.`,
          `b) En $[-5, 0)$ el numerador se factoriza: $${num} = (${H.xm(p)})(${H.xm(s)})$, así que $f(x) = ${H.xm(s)}$ para $x \\neq ${p}$.`,
          `**En $x = ${p}$:** $f(${p})$ no existe (se anula el denominador), pero $\\lim_{x\\to ${p}} f(x) = ${p} - ${s} = ${p - s}$. Falla la condición 1 y vale la 2: **evitable**.`,
          `**En $x = 0$:** $\\lim_{x\\to 0^-} f(x) = 0 - ${s} = ${-s}$ y $\\lim_{x\\to 0^+} f(x) = \\frac{1}{${m}} = f(0)$. Los laterales son distintos: **salto finito** (inevitable).`,
          `**En $x = ${m}$:** $f(${m})$ no existe y $\\lim_{x\\to ${m}^-} \\frac{1}{${m} - x} = +\\infty$, $\\lim_{x\\to ${m}^+} \\frac{1}{${m} - x} = -\\infty$: **infinita**, con asíntota vertical $x = ${m}$.`,
          `En el resto de $[-5, 6]$, $f$ es un cociente de polinomios con denominador no nulo: es continua.`,
          `c) Definiendo $f(${p}) = ${p - s}$ (o directamente $f(x) = ${H.xm(s)}$ en $[-5, 0)$) se elimina la discontinuidad evitable.`
        ]
      };
    }
  };

  // existencia y unicidad de una raíz: Bolzano + Rolle (o monotonía)
  SELF["ex-bolzano-unica"] = {
    concepts: ["bolzano", "valor-medio"],
    generate(r, H) {
      const p = r.int(1, 5), k = r.int(-3, 2);
      const lo = -((k + 1) ** 3) - p * (k + 1), hi = -(k ** 3) - p * k;
      const q = r.int(lo + 1, hi - 1);
      const f = H.poly([[1, "x^{3}"], [p, "x"], [q, ""]]), fk = k ** 3 + p * k + q, fk1 = (k + 1) ** 3 + p * (k + 1) + q;
      return {
        verify: { kind: "truth", target: true, fn: () => { const F = x => x ** 3 + p * x + q; let n = 0; for (let i = 0; i < 2000; i++) { const x0 = k + i / 2000, x1 = k + (i + 1) / 2000; if (F(x0) * F(x1) < 0) n++; } return F(k) < 0 && F(k + 1) > 0 && n === 1; } },
        prompt: `Demostrá que $f(x) = ${f}$ tiene **una y solo una** raíz en el intervalo $[${k}, ${k + 1}]$. Para cada teorema que uses, enunciá sus hipótesis y su tesis y explicá cómo se cumplen.`,
        rubric: [
          { text: R`Justifica que $f$ es continua en el intervalo (y derivable, si usa Rolle).`, w: 2 },
          { text: `Calcula $f(${k}) = ${fk}$ y $f(${k + 1}) = ${fk1}$: tienen signos opuestos.`, w: 3 },
          { text: R`Enuncia Bolzano (o el teorema del valor intermedio) y concluye que hay al menos una raíz.`, w: 5 },
          { text: R`Prueba la unicidad: con Rolle (dos raíces darían $f'(c) = 0$) o porque $f' > 0$ y $f$ es estrictamente creciente.`, w: 6 },
          { text: R`Concluye con claridad: existe una única raíz en el intervalo.`, w: 2 }
        ],
        solution: [
          `$f$ es un polinomio: es continua y derivable en todo $\\mathbb{R}$, en particular en $[${k}, ${k + 1}]$.`,
          `$f(${k}) = ${H.psub([1, 0, p, q], k)} = ${fk} < 0$ y $f(${k + 1}) = ${H.psub([1, 0, p, q], k + 1)} = ${fk1} > 0$.`,
          `**Existencia (Bolzano).** Hipótesis: $f$ continua en $[a, b]$ y $f(a)\\,f(b) < 0$. Tesis: existe $c \\in (a, b)$ con $f(c) = 0$. Se cumplen las hipótesis, así que hay al menos una raíz en $(${k}, ${k + 1})$.`,
          `**Unicidad (Rolle).** Supongamos dos raíces $x_1 < x_2$ en el intervalo. Rolle (hipótesis: $f$ continua en $[x_1, x_2]$, derivable en $(x_1, x_2)$ y $f(x_1) = f(x_2)$; tesis: existe $c$ con $f'(c) = 0$) daría un $c$ con $f'(c) = 0$.`,
          `Pero $f'(x) = 3x^2 + ${p} \\ge ${p} > 0$ para todo $x$: nunca se anula. Absurdo. (Otra forma: como $f' > 0$, $f$ es estrictamente creciente y no puede anularse dos veces.)`,
          `Además $f(${k}) \\neq 0$ y $f(${k + 1}) \\neq 0$, así que hay **exactamente una** raíz en $[${k}, ${k + 1}]$.`
        ]
      };
    }
  };

  // análisis completo de una cúbica: crecimiento, extremos, concavidad y bosquejo
  SELF["ex-analisis"] = {
    concepts: ["extremos", "concavidad", "der-grafica"],
    generate(r, H) {
      const m = r.int(1, 2), d = r.int(-4, 4), b = 2 * m + 1;
      const f = H.poly([[1, "x^{3}"], [-3 * m, "x^{2}"], [d, ""]]), F = x => x ** 3 - 3 * m * x * x + d;
      const vals = [[-1, F(-1)], [0, F(0)], [2 * m, F(2 * m)], [b, F(b)]];
      const mx = Math.max(...vals.map(v => v[1])), mn = Math.min(...vals.map(v => v[1]));
      const at = y => vals.filter(v => v[1] === y).map(v => `x = ${v[0]}`).join(" y ");
      return {
        verify: { kind: "zero", tol: 1e-4, scale: 100, fn: () => { const h = 1e-4, D = x => (F(x + h) - F(x - h)) / (2 * h), D2 = x => (F(x + h) - 2 * F(x) + F(x - h)) / (h * h); let hi = -Infinity, lo = Infinity; for (let i = 0; i <= 4000; i++) { const y = F(-1 + (b + 1) * i / 4000); hi = Math.max(hi, y); lo = Math.min(lo, y); } return [D(0), D(2 * m), D2(m) / 100, hi - mx, lo - mn]; } },
        prompt: `Dada $f(x) = ${f}$, determiná: a) dominio y puntos críticos; b) intervalos de crecimiento y de decrecimiento; c) extremos relativos, y extremos absolutos en $[-1, ${b}]$; d) intervalos de concavidad y puntos de inflexión; e) con esa información, bosquejá a mano los gráficos de $f$ y de $f'$, marcando los puntos importantes.`,
        rubric: [
          { text: `a) Dominio $\\mathbb{R}$; $f'(x) = 3x^2 - ${6 * m}x$; puntos críticos $x = 0$ y $x = ${2 * m}$.`, w: 2 },
          { text: `b) Crece en $(-\\infty, 0)$ y en $(${2 * m}, \\infty)$; decrece en $(0, ${2 * m})$, justificado con el signo de $f'$.`, w: 3 },
          { text: `c) Máximo relativo $(0, ${d})$ y mínimo relativo $(${2 * m}, ${F(2 * m)})$; en $[-1, ${b}]$: máximo absoluto ${mx}, mínimo absoluto ${mn}, comparando con los bordes.`, w: 4 },
          { text: `d) $f''(x) = 6x - ${6 * m}$: cóncava hacia abajo en $(-\\infty, ${m})$, hacia arriba en $(${m}, \\infty)$; inflexión en $(${m}, ${F(m)})$.`, w: 3 },
          { text: R`e) Bosquejos de $f$ y $f'$ coherentes con lo anterior (la parábola $f'$ corta el eje en los puntos críticos).`, w: 3 }
        ],
        solution: [
          `a) Es un polinomio: $\\operatorname{Dom} f = \\mathbb{R}$. $f'(x) = 3x^2 - ${6 * m}x = 3x(x - ${2 * m})$ existe siempre y se anula en $x = 0$ y $x = ${2 * m}$.`,
          `b) $f' > 0$ en $(-\\infty, 0)$ y en $(${2 * m}, \\infty)$: ahí $f$ crece. $f' < 0$ en $(0, ${2 * m})$: ahí decrece.`,
          `c) $f'$ pasa de $+$ a $-$ en $0$: máximo relativo $f(0) = ${d}$. Pasa de $-$ a $+$ en $${2 * m}$: mínimo relativo $f(${2 * m}) = ${F(2 * m)}$.`,
          `En $[-1, ${b}]$ ($f$ continua, teorema del valor extremo) comparamos: ${vals.map(v => `$f(${v[0]}) = ${v[1]}$`).join(", ")}. Máximo absoluto $${mx}$ en ${at(mx)}; mínimo absoluto $${mn}$ en ${at(mn)}.`,
          `d) $f''(x) = 6x - ${6 * m}$, que se anula en $x = ${m}$ y cambia de signo: $f'' < 0$ (cóncava hacia abajo) en $(-\\infty, ${m})$ y $f'' > 0$ (hacia arriba) en $(${m}, \\infty)$. Punto de inflexión $(${m}, ${F(m)})$.`,
          `e) $f'$ es una parábola que abre hacia arriba, con raíces $0$ y $${2 * m}$ y vértice en $x = ${m}$ (el punto de inflexión de $f$). $f$ sube hasta $(0, ${d})$, baja hasta $(${2 * m}, ${F(2 * m)})$ y vuelve a subir, cambiando la concavidad en $x = ${m}$.`
        ]
      };
    }
  };

  // derivada de una integral con límites variables
  SELF["ex-leibniz"] = {
    concepts: ["tfc"],
    generate() {
      return {
        prompt: R`Sea $f$ continua y sean $u$ y $v$ derivables. Demostrá que $$\frac{d}{dx}\int_{u(x)}^{v(x)} f(t)\,dt = f(v(x))\,v'(x) - f(u(x))\,u'(x).$$ Enunciá los teoremas que uses.`,
        rubric: [
          { text: R`Escribe la integral con una primitiva: $\int_{u(x)}^{v(x)} f(t)\,dt = F(v(x)) - F(u(x))$, con $F' = f$ (TFC, parte 2).`, w: 2 },
          { text: R`Justifica que $F$ existe y es derivable con $F' = f$ porque $f$ es continua (TFC, parte 1).`, w: 2 },
          { text: R`Deriva con la regla de la cadena y llega a la fórmula.`, w: 2 }
        ],
        solution: [
          R`Como $f$ es continua, por el TFC (parte 1) $F(x) = \int_a^x f(t)\,dt$ es derivable y $F'(x) = f(x)$: es una primitiva de $f$.`,
          R`Por el TFC (parte 2), $\int_{u(x)}^{v(x)} f(t)\,dt = F(v(x)) - F(u(x))$.`,
          R`Por la regla de la cadena (hipótesis: $F$, $u$ y $v$ derivables), $\frac{d}{dx}F(v(x)) = F'(v(x))\,v'(x) = f(v(x))\,v'(x)$, y lo mismo con $u$.`,
          R`Restando: $\frac{d}{dx}\int_{u(x)}^{v(x)} f(t)\,dt = f(v(x))\,v'(x) - f(u(x))\,u'(x)$.`
        ]
      };
    }
  };

  // enunciados de teoremas: hipótesis y tesis
  const TEO = {
    bolzano: { name: "Bolzano", hip: R`$f$ es continua en $[a, b]$ y $f(a)$ y $f(b)$ tienen signos opuestos ($f(a)\,f(b) < 0$).`, tes: R`Existe al menos un $c \in (a, b)$ con $f(c) = 0$.` },
    rolle: { name: "Rolle", hip: R`$f$ es continua en $[a, b]$, derivable en $(a, b)$ y $f(a) = f(b)$.`, tes: R`Existe al menos un $c \in (a, b)$ con $f'(c) = 0$.` },
    lagrange: { name: "valor medio (Lagrange)", hip: R`$f$ es continua en $[a, b]$ y derivable en $(a, b)$.`, tes: R`Existe al menos un $c \in (a, b)$ con $f'(c) = \frac{f(b) - f(a)}{b - a}$.` },
    lhopital: { name: "L'Hôpital", hip: R`$f$ y $g$ son derivables cerca de $a$ (salvo quizás en $a$), $g'(x) \neq 0$ cerca de $a$, $\lim_{x\to a}\frac{f(x)}{g(x)}$ es de la forma $\frac00$ o $\frac{\infty}{\infty}$, y existe $\lim_{x\to a}\frac{f'(x)}{g'(x)}$ (finito o infinito).`, tes: R`$\lim_{x\to a}\frac{f(x)}{g(x)} = \lim_{x\to a}\frac{f'(x)}{g'(x)}$.` },
    tfc: { name: "fundamental del cálculo", hip: R`$f$ es continua en $[a, b]$.`, tes: R`1) $g(x) = \int_a^x f(t)\,dt$ es continua en $[a, b]$, derivable en $(a, b)$ y $g'(x) = f(x)$. 2) $\int_a^b f(x)\,dx = F(b) - F(a)$ para cualquier primitiva $F$ de $f$.` },
    "valor-medio-int": { name: "valor medio para integrales", hip: R`$f$ es continua en $[a, b]$.`, tes: R`Existe $c \in [a, b]$ con $f(c) = \frac{1}{b - a}\int_a^b f(x)\,dx$ (el valor promedio de $f$).` },
    cociente: { name: "criterio del cociente (D'Alembert)", hip: R`$a_n > 0$ (o se toma $|a_n|$) y existe $L = \lim_{n\to\infty}\frac{a_{n+1}}{a_n}$.`, tes: R`Si $L < 1$, $\sum a_n$ converge; si $L > 1$ (o $L = \infty$), diverge; si $L = 1$, el criterio no decide.` },
    comparacion: { name: "criterio de comparación", hip: R`$0 \le a_n \le b_n$ para todo $n$ a partir de cierto $n_0$.`, tes: R`Si $\sum b_n$ converge, $\sum a_n$ converge; si $\sum a_n$ diverge, $\sum b_n$ diverge.` }
  };
  SELF["ex-teorema"] = {
    concepts: ["valor-medio"],
    generate(r, H, args) {
      const t = TEO[r.pick(args && args.length ? args : Object.keys(TEO))];
      return {
        prompt: `Enunciá el **teorema de ${t.name}**: escribí con precisión sus hipótesis y su tesis.`,
        rubric: [{ text: `Hipótesis completas: ${t.hip}`, w: 3 }, { text: `Tesis correcta: ${t.tes}`, w: 2 }],
        solution: [`**Hipótesis:** ${t.hip}`, `**Tesis:** ${t.tes}`]
      };
    }
  };

  E.registerExams("m101", {
    self: SELF,
    // cada parte con `any` sortea entre ejercicios que aparecieron en distintos años (2018, 2019, 2021, 2025);
    // los ítems con `any` cambian el ejercicio entero
    exams: [
      { id: "p1", kind: "parcial", title: "1.er parcial", topics: "Funciones, límites y continuidad", minutes: 120, pass: 60,
        items: [
          { any: [
            { title: "Composición e inversa", parts: [{ tpl: "comp-eval-num", pts: 5 }, { tpl: "inverse-num", pts: 10 }] },
            { title: "Inversa y transformaciones", parts: [{ self: "ex-inversa-raiz", pts: 9 }, { self: "ex-transform", pts: 6 }] }
          ] },
          { title: "Límites", parts: [
            { pick: ["lim-1cos-num", "lim-sin-num"], pts: 12 },
            { any: [{ pick: ["lim-conj-num", "lim-factor-num"] }, { tpl: "ex-lim-raiz-inf" }], pts: 12 },
            { any: [{ tpl: "lim-inf-cociente-num" }, { tpl: "ex-sandwich-abs" }], pts: 11 }] },
          { title: "Límite por definición", parts: [{ self: "ex-epsdelta", pts: 15 }] },
          { any: [
            { title: "Continuidad", parts: [{ self: "ex-cont-trozos", pts: 20 }] },
            { title: "Análisis de una función racional", parts: [{ self: "ex-racional-oblicua", pts: 20 }] }
          ] },
          { title: "Discontinuidades y asíntotas", parts: [{ tpl: "cont-tipo-mc", pts: 5 }, { tpl: "lim-asintota-mc", pts: 5 }, { pick: ["cont-param-num", "lim-lateral-num"], pts: 5 }] }
        ] },
      { id: "p2", kind: "parcial", title: "2.º parcial", topics: "Derivadas y sus aplicaciones", minutes: 120, pass: 60,
        items: [
          { title: "Análisis de una función", parts: [{ tpl: "abs-ext-num", pts: 8 }, { tpl: "inflex-num", pts: 7 }, { self: "ex-analisis", pts: 15 }] },
          { title: "Reglas de derivación", parts: [{ any: [{ tpl: "der-cadena-num" }, { self: "ex-derlog" }], pts: 8 }, { pick: ["der-coc-num", "der-prod-num"], pts: 7 }] },
          { title: "Derivación implícita y recta tangente", parts: [{ tpl: "der-implicita-num", pts: 8 }, { tpl: "der-tangente-num", pts: 7 }] },
          { any: [
            { title: "Existencia y unicidad de raíces", parts: [{ self: "ex-bolzano-unica", pts: 20 }] },
            { title: "Curvas ortogonales", parts: [{ self: "ex-ortogonales", pts: 20 }] },
            { title: "Optimización", parts: [{ pick: ["ex-cisterna", "optim-geo-num"], pts: 20 }] }
          ] },
          { title: "Regla de L'Hôpital", parts: [{ any: [{ tpl: "lhop-num" }, { tpl: "ex-lhop-1inf" }], pts: 12 }, { self: "ex-teorema", args: ["lhopital", "rolle", "lagrange"], pts: 8 }] }
        ] },
      { id: "p3", kind: "parcial", title: "3.er parcial", topics: "Optimización, teorema fundamental e integrales", minutes: 120, pass: 60,
        items: [
          { title: "Optimización", parts: [{ pick: ["optim-geo-num", "optim-caja-num", "ex-cisterna", "ex-botes"], pts: 20 }] },
          { title: "Teorema fundamental del cálculo", parts: [{ self: "ex-leibniz", pts: 6 }, { tpl: "tfc-deriv-num", pts: 9 }] },
          { title: "Integral definida e impropia", parts: [{ pick: ["tfc-num", "impropia-num"], pts: 10 }] },
          { title: "Técnicas de integración", parts: [{ pick: ["partes-num", "sust-num"], pts: 18 }, { pick: ["trigint-num", "fracs-num", "racional-num"], pts: 17 }] },
          { title: "Área y teoría", parts: [{ tpl: "area-num", pts: 12 }, { any: [{ self: "ex-teorema", args: ["tfc", "valor-medio-int"] }, { self: "ex-vf-teoria" }], pts: 8 }] }
        ] },
      { id: "final", kind: "final", title: "Final (parte práctica)", topics: "Toda la materia: optimización, aplicaciones de la integral, ecuaciones diferenciales y series", minutes: 180, pass: 60,
        items: [
          { title: "Optimización", parts: [{ pick: ["optim-geo-num", "optim-caja-num", "ex-cisterna", "ex-botes"], pts: 20 }] },
          { any: [
            { title: "Áreas, volúmenes y longitud de arco", parts: [{ tpl: "area-num", pts: 12 }, { tpl: "volumen-num", pts: 10 }, { tpl: "arco-num", pts: 8 }] },
            { title: "Área respecto de los dos ejes, volumen y arco (planteos)", parts: [{ self: "ex-area-xy", pts: 30 }] }
          ] },
          { any: [
            { title: "Ecuaciones diferenciales", parts: [{ tpl: "edo-sep-num", pts: 15 }, { tpl: "edo-verif-mc", pts: 10 }] },
            { title: "Modelo logístico", parts: [{ tpl: "ex-logistica", pts: 15 }, { self: "ex-edo-familia", pts: 10 }] }
          ] },
          { title: "Series", parts: [{ self: "ex-teorema", args: ["cociente", "comparacion"], pts: 8 }, { any: [{ tpl: "ratio-num" }, { tpl: "ex-serie-factorial" }], pts: 9 }, { tpl: "criterio-mc", pts: 8 }] }
        ] }
    ]
  });
})();

/* ===== M101 · Evaluaciones: más variantes (parciales 2018 y 2019, final 2025) =====
   Plantillas de nivel examen (corrección automática, con verify) y más ejercicios de desarrollo, para que
   cada intento pueda traer ejercicios distintos, como cambian de un año a otro. */
(function () {
  const E = window.Efecen, R = String.raw;
  const T = {}, SELF = {};
  const nf = (H, x, d = 2) => H.num(x, d).replace(".", "{,}");

  // ∞ − ∞ con raíz y valor absoluto, x → −∞
  T["ex-lim-raiz-inf"] = {
    type: "numeric", concepts: ["lim-infinito"], difficulty: 3,
    generate(r, H) {
      const a = r.pick([2, 3, 4]), b = r.nz(-8, 8), c = r.int(-5, 5), sgn = r.pick([1, -1]);
      const inner = H.poly([[a * a, "x^{2}"], [b, "x"], [c, ""]]), rad = `\\sqrt{${inner}}`;
      const ans = sgn * (-b / (2 * a));
      const expr = sgn === 1 ? `${rad} - |${a}x|` : `|${a}x| - ${rad}`;
      const f = x => sgn * (Math.sqrt(a * a * x * x + b * x + c) - Math.abs(a * x));
      return {
        prompt: `Calculá $$\\lim_{x\\to -\\infty} \\left(${expr}\\right)$$ (sin usar L'Hôpital).`,
        answer: ans, answerTex: H.frac(-sgn * b, 2 * a),
        solution: [
          `Es una indeterminación $\\infty - \\infty$. Multiplicamos y dividimos por el conjugado: el numerador queda $${sgn === 1 ? "" : "-"}\\left((${inner}) - ${a * a}x^2\\right) = ${sgn === 1 ? "" : "-"}(${H.poly([[b, "x"], [c, ""]])})$.`,
          `El denominador es $${rad} + |${a}x|$. Como $x \\to -\\infty$, $|${a}x| = -${a}x$ y $\\sqrt{${a * a}x^2 + \\dots} = |${a}x|\\sqrt{1 + \\dots} = -${a}x\\sqrt{1 + \\dots}$.`,
          `Dividiendo arriba y abajo por $-x > 0$: el límite es $\\frac{${sgn === 1 ? "" : "-"}(-${H.par(b)})}{${a} + ${a}} = ${H.frac(-sgn * b, 2 * a)}$.`
        ],
        verify: { kind: "liminf", f, x: -1e6 }
      };
    }
  };

  // teorema del sándwich con valor absoluto
  T["ex-sandwich-abs"] = {
    type: "numeric", concepts: ["lim-sustitucion"], difficulty: 1,
    generate(r, H) {
      const a = r.int(-4, 4), L = r.nz(-6, 6), k = r.pick([1, 2, 3]);
      const lo = `${L} - ${k === 1 ? "" : k}|${H.xm(a)}|`, hi = `${L} + ${k === 1 ? "" : k}|${H.xm(a)}|`;
      return {
        prompt: `Una función $f$ cumple, para todo $x$: $$${lo} \\le f(x) \\le ${hi}.$$ Calculá $\\displaystyle\\lim_{x\\to ${a}} f(x)$.`,
        answer: L,
        solution: [`Las cotas tienden a $${L}$ cuando $x \\to ${a}$ (sustitución directa: $|${H.xm(a)}| \\to 0$).`, `Por el teorema del sándwich, $\\lim_{x\\to ${a}} f(x) = ${L}$.`],
        verify: { kind: "zero", fn: ans => [1e-7, -1e-7].flatMap(h => [L - k * Math.abs(h) - ans, L + k * Math.abs(h) - ans].map(v => (Math.abs(v) < 1e-6 ? 0 : v))) }
      };
    }
  };

  // optimización: cisterna de base cuadrada con tapa más cara
  T["ex-cisterna"] = {
    type: "numeric", concepts: ["optimizacion"], difficulty: 3,
    generate(r, H) {
      const V = r.pick([2, 3, 4, 5, 6]), k = r.pick([2, 3, 4]);
      const C = x => (1 + k) * x * x + 4 * V / x, x0 = Math.cbrt(2 * V / (1 + k));
      return {
        prompt: `Se va a construir una cisterna de base cuadrada, sin divisiones, para $${V}$ m³ de agua. La tapa metálica cuesta, por m², ${k === 2 ? "el doble" : k === 3 ? "el triple" : "el cuádruple"} que los lados y la base de concreto. ¿Cuánto tiene que medir el lado de la base (en m) para que el costo sea mínimo?`,
        answer: x0, tolerance: 0.01,
        solution: [
          `Lado $x$, altura $y$: $V = x^2y = ${V}$, así que $y = \\frac{${V}}{x^2}$.`,
          `Costo (en unidades del precio del concreto por m²): base $x^2$, lados $4xy$, tapa $${k}x^2$: $C(x) = ${1 + k}x^2 + \\frac{${4 * V}}{x}$.`,
          `$C'(x) = ${2 * (1 + k)}x - \\frac{${4 * V}}{x^2} = 0 \\Rightarrow x^3 = \\frac{${4 * V}}{${2 * (1 + k)}} \\Rightarrow x = \\sqrt[3]{${H.frac(2 * V, 1 + k)}} \\approx ${nf(H, x0)}$ m.`,
          `$C''(x) = ${2 * (1 + k)} + \\frac{${8 * V}}{x^3} > 0$: es un mínimo.`
        ],
        verify: { kind: "value", tol: 1e-6, fn: () => { let lo = 0.01, hi = 20; for (let i = 0; i < 200; i++) { const m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3; if (C(m1) < C(m2)) hi = m2; else lo = m1; } return (lo + hi) / 2; } }
      };
    }
  };

  // optimización: distancia mínima entre dos botes
  T["ex-botes"] = {
    type: "numeric", concepts: ["optimizacion"], difficulty: 3,
    generate(r, H) {
      const va = r.pick([12, 16, 20, 24]), vb = r.pick([10, 15, 18, 21]);
      const D = t => Math.hypot(va * t, vb * (1 - t)), t0 = vb * vb / (va * va + vb * vb), dmin = D(t0);
      return {
        prompt: `A las 14:00 un bote sale de un muelle hacia el norte a $${va}$ km/h. Otro bote se acerca al muelle desde el este a $${vb}$ km/h y llega a las 15:00. ¿Cuál es la menor distancia (en km) entre los dos botes?`,
        answer: dmin, tolerance: 0.01,
        solution: [
          `Con $t$ en horas desde las 14:00: el primero está a $${va}t$ al norte y el segundo a $${vb}(1 - t)$ al este del muelle.`,
          `$d(t)^2 = (${va}t)^2 + (${vb}(1 - t))^2$. Minimizamos $d^2$ (tiene el mínimo en el mismo $t$): $2\\cdot${va * va}t - 2\\cdot${vb * vb}(1 - t) = 0$, o sea $t = \\frac{${vb * vb}}{${va * va + vb * vb}} \\approx ${nf(H, t0, 3)}$ h.`,
          `La segunda derivada de $d^2$ es positiva (mínimo). $d_{min} = d(${nf(H, t0, 3)}) \\approx ${nf(H, dmin)}$ km.`
        ],
        verify: { kind: "value", tol: 1e-5, fn: () => { let m = Infinity; for (let i = 0; i <= 200000; i++) m = Math.min(m, D(i / 200000)); return m; } }
      };
    }
  };

  // modelo logístico: epidemia
  T["ex-logistica"] = {
    type: "numeric", concepts: ["edo"], difficulty: 3,
    generate(r, H) {
      const P = r.pick([5000, 8000, 10000]), I0 = r.pick([20, 40, 50]), m = r.pick([3, 4, 5]), t1 = r.pick([2, 3, 4]), t2 = r.pick([6, 8, 10]);
      const I1 = I0 * m, A = (P - I0) / I0, kP = Math.log(A * I1 / (P - I1)) / t1, I = t => P / (1 + A * Math.exp(-kP * t));
      if (I1 >= P / 2) return null;
      const k = kP / P, ans = I(t2);
      return {
        prompt: `En una población de $${P}$ habitantes, la cantidad de infectados $I(t)$ ($t$ en días) cumple $I' = k\\,I\\,(${P} - I)$. Al principio hay $${I0}$ infectados y a los $${t1}$ días hay $${I1}$. ¿Cuántos infectados hay a los $${t2}$ días?`,
        answer: ans, tolerance: 0.01,
        solution: [
          `Es separable: $\\int\\frac{dI}{I(${P} - I)} = \\int k\\,dt$. Por fracciones simples, $\\frac{1}{I(P - I)} = \\frac1P\\left(\\frac1I + \\frac{1}{P - I}\\right)$.`,
          `Integrando: $\\ln\\frac{I}{P - I} = kPt + C$, o sea $I(t) = \\frac{P}{1 + A e^{-kPt}}$ con $A = \\frac{P - I_0}{I_0} = ${nf(H, A)}$.`,
          `Con $I(${t1}) = ${I1}$: $e^{-${t1}kP} = \\frac{P - ${I1}}{A\\cdot${I1}}$, así que $kP = \\frac{1}{${t1}}\\ln\\frac{A\\cdot ${I1}}{${P} - ${I1}} \\approx ${nf(H, kP, 4)}$ por día.`,
          `$I(${t2}) = \\frac{${P}}{1 + ${nf(H, A)}\\,e^{-${nf(H, kP, 4)}\\cdot ${t2}}} \\approx ${nf(H, ans, 0)}$ infectados.`
        ],
        verify: { kind: "all", list: [
          { kind: "ode", f: (t, y) => [k * y[0] * (P - y[0])], y0: [I0], t1: t1, dt: 1e-3, out: (t, y) => y[0], target: I1, tol: 1e-6 },
          { kind: "ode", f: (t, y) => [k * y[0] * (P - y[0])], y0: [I0], t1: t2, dt: 1e-3, out: (t, y) => y[0], tol: 1e-6 }
        ] }
      };
    }
  };

  // L'Hôpital con una indeterminación 1^∞
  T["ex-lhop-1inf"] = {
    type: "numeric", concepts: ["lhopital"], difficulty: 3,
    generate(r, H) {
      const a = r.nz(-4, 4), b = r.pick([1, 2, 3, 4, 5]);
      if (Math.abs(a / b) > 2.5) return null;
      return {
        prompt: `Calculá $$\\lim_{x\\to 0^+} \\left(1 + \\tan(${H.kx(a)})\\right)^{1/\\sin(${H.kx(b)})}$$ Indicá la indeterminación.`,
        answer: Math.exp(a / b), answerTex: `e^{${H.frac(a, b)}}`,
        solution: [
          R`Es de la forma $1^\infty$. Tomamos logaritmo: $\ln y = \frac{\ln(1 + \tan(ax))}{\sin(bx)}$, que es $\frac00$.`,
          `Por L'Hôpital: $\\lim_{x\\to 0^+} \\frac{\\frac{${a}\\sec^2(${H.kx(a)})}{1 + \\tan(${H.kx(a)})}}{${b}\\cos(${H.kx(b)})} = \\frac{${a}}{${b}}$.`,
          `Entonces el límite es $e^{${H.frac(a, b)}} \\approx ${nf(H, Math.exp(a / b), 4)}$.`
        ],
        verify: { kind: "limit", side: "+", a: 0, h: 1e-7, f: x => Math.exp(Math.log1p(Math.tan(a * x)) / Math.sin(b * x)) }
      };
    }
  };

  // criterio del cociente con factoriales
  T["ex-serie-factorial"] = {
    type: "mc", concepts: ["criterios-conv"], difficulty: 3,
    generate(r, H) {
      const c = r.pick([1, 2, 3, 4]);
      // a_n = c^n n! / n^n: L = c/e
      const L = c / Math.E, conv = L < 1;
      return {
        prompt: `Usando el criterio del cociente, ¿qué pasa con $\\displaystyle\\sum_{n=1}^{\\infty} \\frac{${c === 1 ? "" : c + "^n\\,"}n!}{n^n}$?`,
        ...H.mc(r, conv ? `Converge, porque $L = ${c === 1 ? "" : c}e^{-1} < 1$` : `Diverge, porque $L = ${c}e^{-1} > 1$`,
          [conv ? `Diverge, porque $L = ${c === 1 ? "" : c}e^{-1} > 1$` : `Converge, porque $L = ${c}e^{-1} < 1$`, `El criterio no decide, porque $L = 1$`, conv ? `Converge, porque $L = 0$` : `Diverge, porque $L = \\infty$`], { text: true }),
        solution: [
          `$\\frac{a_{n+1}}{a_n} = \\frac{${c === 1 ? "" : c + "^{n+1}"}(n+1)!}{(n+1)^{n+1}}\\cdot\\frac{n^n}{${c === 1 ? "" : c + "^n"}n!} = ${c === 1 ? "" : c}\\left(\\frac{n}{n+1}\\right)^n$.`,
          `$\\left(\\frac{n}{n+1}\\right)^n = \\frac{1}{(1 + 1/n)^n} \\to \\frac1e$, así que $L = ${c === 1 ? "" : c}e^{-1} \\approx ${nf(H, L, 3)}$.`,
          conv ? R`Como $L < 1$, la serie converge.` : R`Como $L > 1$, la serie diverge.`
        ],
        verify: { kind: "truth", target: true, fn: () => { const n = 2000, ratio = c * Math.exp(n * Math.log(n / (n + 1))); return (ratio < 1) === conv && Math.abs(ratio - L) < 1e-3; } }
      };
    }
  };

  // ---------- ejercicios de desarrollo ----------
  // inversa de una función con raíz, verificada por composición
  SELF["ex-inversa-raiz"] = {
    concepts: ["inversa", "composicion"],
    generate(r, H) {
      const a = r.int(-5, 5), b = r.int(-4, 5), s = r.pick([1, -1]);
      const f = `${s < 0 ? "-" : ""}\\sqrt{${H.xm(-a)}} ${H.sg(b)}`.replace("+ 0", "").replace("- 0", "");
      const sa = a ? H.sg(-a) : "", sb = b ? H.sg(-b) : "";
      const inv = s < 0 ? `(${b} - x)^2${sa}` : `(x${sb})^2${sa}`;
      const dom = s < 0 ? `x \\le ${b}` : `x \\ge ${b}`;
      return {
        prompt: `Sea $f(x) = ${f}$. Determiná si tiene inversa (justificá), hallá $f^{-1}$ con su dominio y verificá el resultado con la composición.`,
        rubric: [
          { text: `Justifica que es uno a uno (la raíz es ${s < 0 ? "creciente y con el signo menos queda decreciente" : "creciente"}) y da $\\operatorname{Dom} f = [${-a}, \\infty)$, $\\operatorname{Im} f = ${s < 0 ? `(-\\infty, ${b}]` : `[${b}, \\infty)`}$.`, w: 2 },
          { text: `Despeja e intercambia: $f^{-1}(x) = ${inv}$, con $${dom}$.`, w: 3 },
          { text: `Verifica $(f\\circ f^{-1})(x) = x$ (o $f^{-1}\\circ f$), usando el valor absoluto con el signo correcto.`, w: 3 }
        ],
        solution: [
          `$\\operatorname{Dom} f$: $${H.xm(-a)} \\ge 0$, o sea $x \\ge ${-a}$. La raíz es estrictamente creciente, así que $f$ es ${s < 0 ? "estrictamente decreciente" : "estrictamente creciente"}: es inyectiva y tiene inversa. $\\operatorname{Im} f = ${s < 0 ? `(-\\infty, ${b}]` : `[${b}, \\infty)`}$.`,
          `Despejamos de $y = ${f.replace(/x/g, "x")}$: $${s < 0 ? `${b} - y` : `y${sb}`} = \\sqrt{${H.xm(-a)}}$, así que $x = ${inv.replace(/x/g, "y")}$.`,
          `Intercambiando: $f^{-1}(x) = ${inv}$, con $\\operatorname{Dom} f^{-1} = \\operatorname{Im} f$: $${dom}$.`,
          `Verificación: $f(f^{-1}(x)) = ${s < 0 ? "-" : ""}\\sqrt{(${s < 0 ? `${b} - x` : `x${sb}`})^2}${b ? H.sg(b) : ""} = ${s < 0 ? "-" : ""}|${s < 0 ? `${b} - x` : `x${sb}`}|${b ? H.sg(b) : ""} = x$, porque con $${dom}$ lo de adentro del valor absoluto es $\\ge 0$.`
        ],
        verify: { kind: "zero", tol: 1e-9, fn: () => { const F = x => s * Math.sqrt(x + a) + b, Fi = x => (s < 0 ? (b - x) ** 2 : (x - b) ** 2) - a; return [0.5, 2, 7].map(t => { const x = b + s * t; return F(Fi(x)) - x; }); } }
      };
    }
  };

  // transformaciones encadenadas de una función
  SELF["ex-transform"] = {
    concepts: ["transformaciones"],
    generate(r, H) {
      const bases = [
        { tex: a => `e^{${a}}`, f: Math.exp, name: "e^{x}" },
        { tex: a => `\\ln\\left(${a}\\right)`, f: Math.log, name: "\\ln x" },
        { tex: a => `\\sqrt{${a}}`, f: Math.sqrt, name: "\\sqrt{x}" }
      ];
      const bs = r.pick(bases), K = r.pick([2, 3]), h = r.nz(-3, 3), v = r.nz(-4, 4);
      const ops = r.sample([
        { d: "una reflexión respecto del eje $x$", ap: g => x => -g(x), tr: s => ({ ...s, A: -s.A, D: -s.D }) },
        { d: "una reflexión respecto del eje $y$", ap: g => x => g(-x), tr: s => ({ ...s, B: -s.B }) },
        { d: `un alargamiento horizontal en un factor de $${K}$`, ap: g => x => g(x / K), tr: s => ({ ...s, B: s.B / K }) },
        { d: `${h > 0 ? "un desplazamiento horizontal" : "un desplazamiento horizontal"} de $${Math.abs(h)}$ unidades hacia la ${h > 0 ? "derecha" : "izquierda"}`, ap: g => x => g(x - h), tr: s => ({ ...s, C: s.C - s.B * h }) },
        { d: `un desplazamiento vertical de $${Math.abs(v)}$ unidades hacia ${v > 0 ? "arriba" : "abajo"}`, ap: g => x => g(x) + v, tr: s => ({ ...s, D: s.D + v }) }
      ], 3);
      // la función queda A·base(Bx + C) + D
      let st = { A: 1, B: 1, C: 0, D: 0 }, g = bs.f;
      for (const o of ops) { st = o.tr(st); g = o.ap(g); }
      const fr = x => { const k = Math.round(x * K * K); return H.frac(k, K * K); };
      const arg = `${st.B === 1 ? "" : st.B === -1 ? "-" : fr(st.B)}x${st.C ? (st.C > 0 ? " + " + fr(st.C) : " - " + fr(-st.C)) : ""}`;
      const res = `${st.A === -1 ? "-" : ""}${bs.tex(arg)}${st.D ? H.sg(st.D) : ""}`;
      return {
        prompt: `Dada $f(x) = ${bs.name}$, obtené la expresión de la función $g$ que resulta de aplicarle, en este orden: ${ops.map(o => o.d).join(", ")}.`,
        rubric: ops.map((o, i) => ({ text: `Paso ${i + 1}: ${o.d}, aplicado bien sobre la expresión anterior.`, w: 1 })).concat([{ text: `Resultado: $g(x) = ${res}$.`, w: 1 }]),
        solution: [`Cada transformación se aplica sobre la función que dejó la anterior. Lo de afuera (reflexión en $x$, desplazamiento vertical) cambia los valores; lo de adentro (reflexión en $y$, alargamiento y desplazamiento horizontal) cambia la $x$.`,
          ...ops.map((o, i) => `${i + 1}. ${o.d[0].toUpperCase() + o.d.slice(1)}.`), `Queda $g(x) = ${res}$.`],
        verify: { kind: "zero", tol: 1e-9, fn: () => { const G = x => st.A * bs.f(st.B * x + st.C) + st.D; const xs = [-8.3, -5.1, -2.3, -0.7, 0.4, 1.9, 3.3, 6.1, 9.2].filter(x => Number.isFinite(g(x)) && Number.isFinite(G(x))); return xs.length ? xs.map(x => g(x) - G(x)) : [1]; } }
      };
    }
  };

  // análisis de una función racional con asíntota oblicua
  SELF["ex-racional-oblicua"] = {
    concepts: ["lim-asintotas", "graficos"],
    generate(r, H) {
      const a = r.pick([1, 2, 3]), s = r.pick([1, -1]);
      const f = `${s < 0 ? "-" : ""}\\dfrac{x^3}{x^2 - ${a * a}}`;
      return {
        prompt: `Dada $f(x) = ${f}$, determiná: a) dominio; b) paridad; c) intersecciones con los ejes; d) asíntotas verticales, horizontales y oblicuas, justificando con los límites; e) un gráfico aproximado; f) la imagen, a partir del gráfico.`,
        rubric: [
          { text: `a) $\\operatorname{Dom} f = \\mathbb{R} - \\{-${a}, ${a}\\}$.`, w: 2 },
          { text: R`b) $f(-x) = -f(x)$: es impar (simétrica respecto del origen).`, w: 2 },
          { text: R`c) Corta los ejes solo en $(0, 0)$.`, w: 2 },
          { text: `d) Asíntotas verticales $x = \\pm${a}$, con los laterales infinitos y sus signos.`, w: 3 },
          { text: `d) No hay horizontal; oblicua $y = ${s < 0 ? "-" : ""}x$, porque $f(x) - (${s < 0 ? "-" : ""}x) = ${s < 0 ? "-" : ""}\\frac{${a * a}x}{x^2 - ${a * a}} \\to 0$.`, w: 4 },
          { text: R`e) y f) Gráfico coherente; la imagen es $\mathbb{R}$.`, w: 4 }
        ],
        solution: [
          `a) El denominador se anula en $x = \\pm${a}$: $\\operatorname{Dom} f = \\mathbb{R} - \\{-${a}, ${a}\\}$.`,
          `b) $f(-x) = ${s < 0 ? "-" : ""}\\frac{(-x)^3}{x^2 - ${a * a}} = -f(x)$: impar.`,
          R`c) $f(0) = 0$ y $f(x) = 0$ solo si $x = 0$: el único corte es el origen.`,
          `d) Cerca de $x = ${a}$ el numerador vale $${s * a ** 3}$ y el denominador $(x - ${a})(x + ${a}) \\to 0^{\\pm}$: $\\lim_{x\\to ${a}^-} f(x) = ${s < 0 ? "+" : "-"}\\infty$ y $\\lim_{x\\to ${a}^+} f(x) = ${s < 0 ? "-" : "+"}\\infty$. Por la imparidad, en $x = -${a}$ pasa lo mismo con los signos invertidos.`,
          `$\\lim_{x\\to\\pm\\infty} f(x) = ${s < 0 ? "\\mp" : "\\pm"}\\infty$: no hay asíntota horizontal. Dividiendo, $f(x) = ${s < 0 ? "-" : ""}x ${s < 0 ? "-" : "+"} \\frac{${a * a}x}{x^2 - ${a * a}}$, y la fracción tiende a $0$: la oblicua es $y = ${s < 0 ? "-" : ""}x$.`,
          R`f) Las ramas cercanas a las asíntotas verticales toman todos los valores reales: $\operatorname{Im} f = \mathbb{R}$.`
        ],
        verify: { kind: "zero", tol: 1e-5, fn: () => { const F = x => s * x ** 3 / (x * x - a * a); return [F(2.7) + F(-2.7), F(1e7) - s * 1e7, Math.sign(F(a - 1e-6)) + (s < 0 ? -1 : 1), Math.sign(F(a + 1e-6)) - (s < 0 ? -1 : 1)]; } }
      };
    }
  };

  // curvas ortogonales por derivación implícita
  SELF["ex-ortogonales"] = {
    concepts: ["der-implicita"],
    generate(r, H) {
      const q = r.pick([1, 2, 3]), c = q * q, k = 2 + 3 * c;
      return {
        prompt: `Dadas las curvas $y^2 = ${c === 1 ? "" : c}x^3$ y $2x^2 + 3y^2 = ${k}$, demostrá usando derivación implícita que son ortogonales en al menos un punto.`,
        rubric: [
          { text: `Encuentra un punto de intersección, por ejemplo $(1, ${q})$.`, w: 4 },
          { text: `Curva 1: $2yy' = ${3 * c}x^2$, así que $m_1 = \\frac{${3 * c}}{2\\cdot ${q}} = ${H.frac(3 * c, 2 * q)}$ en ese punto.`, w: 6 },
          { text: `Curva 2: $4x + 6yy' = 0$, así que $m_2 = -\\frac{2x}{3y} = ${H.frac(-2, 3 * q)}$.`, w: 6 },
          { text: R`Concluye: $m_1 m_2 = -1$, las tangentes son perpendiculares y las curvas son ortogonales ahí.`, w: 4 }
        ],
        solution: [
          `Intersección: con $x = 1$, la primera da $y^2 = ${c}$ y la segunda $3y^2 = ${k} - 2 = ${3 * c}$, o sea $y^2 = ${c}$. Así $(1, ${q})$ (y también $(1, -${q})$) está en las dos.`,
          `Curva 1, derivando: $2y\\,y' = ${3 * c}x^2$, así que $y' = \\frac{${3 * c}x^2}{2y}$; en $(1, ${q})$: $m_1 = ${H.frac(3 * c, 2 * q)}$.`,
          `Curva 2: $4x + 6y\\,y' = 0$, así que $y' = -\\frac{2x}{3y}$; en $(1, ${q})$: $m_2 = ${H.frac(-2, 3 * q)}$.`,
          `$m_1\\cdot m_2 = ${H.frac(3 * c, 2 * q)}\\cdot\\left(${H.frac(-2, 3 * q)}\\right) = -1$: las rectas tangentes son perpendiculares, así que las curvas son ortogonales en $(1, ${q})$.`
        ],
        verify: { kind: "zero", tol: 1e-6, fn: () => { const h = 1e-6, y1 = x => Math.sqrt(c * x ** 3), y2 = x => Math.sqrt((k - 2 * x * x) / 3); const m1 = (y1(1 + h) - y1(1 - h)) / (2 * h), m2 = (y2(1 + h) - y2(1 - h)) / (2 * h); return [y1(1) - y2(1), m1 * m2 + 1]; } }
      };
    }
  };

  // derivación logarítmica
  SELF["ex-derlog"] = {
    concepts: ["der-explog", "der-cadena"],
    generate(r, H) {
      const a = r.pick([1, 2, 3]), b = r.pick([2, 3]);
      const y = `\\left(x^2 + ${a}\\right)^{\\sin(${b}x)}`;
      const F = x => Math.pow(x * x + a, Math.sin(b * x)), dF = x => F(x) * (b * Math.cos(b * x) * Math.log(x * x + a) + Math.sin(b * x) * 2 * x / (x * x + a));
      return {
        prompt: `Calculá la derivada de $y = ${y}$ y expresala en función de $x$.`,
        rubric: [
          { text: `Toma logaritmo: $\\ln y = \\sin(${b}x)\\,\\ln(x^2 + ${a})$.`, w: 3 },
          { text: R`Deriva los dos lados (regla del producto y de la cadena), con $\frac{y'}{y}$ a la izquierda.`, w: 4 },
          { text: `Despeja: $y' = ${y}\\left[${b}\\cos(${b}x)\\ln(x^2 + ${a}) + \\frac{2x\\sin(${b}x)}{x^2 + ${a}}\\right]$.`, w: 3 }
        ],
        solution: [
          `Como la base y el exponente dependen de $x$, tomamos logaritmo: $\\ln y = \\sin(${b}x)\\ln(x^2 + ${a})$.`,
          `Derivando: $\\frac{y'}{y} = ${b}\\cos(${b}x)\\ln(x^2 + ${a}) + \\sin(${b}x)\\cdot\\frac{2x}{x^2 + ${a}}$.`,
          `$y' = ${y}\\left[${b}\\cos(${b}x)\\ln(x^2 + ${a}) + \\frac{2x\\sin(${b}x)}{x^2 + ${a}}\\right]$.`
        ],
        verify: { kind: "zero", tol: 1e-5, fn: () => [0.3, 0.9, 1.7].map(x => { const h = 1e-6; return ((F(x + h) - F(x - h)) / (2 * h) - dF(x)) / Math.max(1, Math.abs(dF(x))); }) }
      };
    }
  };

  // V/F de teoría: límites, integrales y sumas de Riemann
  const VF = [
    { s: R`Si $\lim f = 0$ y $\lim g = 0$, entonces $\lim f^g = 0$.`, v: false, j: R`Falso: $0^0$ es una forma indeterminada (por ejemplo, $x^x \to 1$ cuando $x \to 0^+$).` },
    { s: R`$1^\infty$ y $0\cdot\infty$ son formas indeterminadas.`, v: true, j: R`Verdadero: el resultado depende de las funciones.` },
    { s: R`$0^\infty$ es una forma indeterminada.`, v: false, j: R`Falso: si la base tiende a $0^+$ y el exponente a $+\infty$, el límite es $0$.` },
    { s: R`Si $f \ge 0$ es creciente y se usan los extremos derechos, la suma de Riemann aproxima el área por exceso.`, v: true, j: R`Verdadero: en cada subintervalo el extremo derecho es el valor más alto.` },
    { s: R`Si $f$ es continua en $[a, b]$, el área entre su gráfico y el eje $x$ es siempre $\int_a^b f(x)\,dx$.`, v: false, j: R`Falso: hace falta $f \ge 0$; si no, la integral resta las partes de abajo del eje.` },
    { s: R`Si $f$ es impar, $\int_{-\infty}^{\infty} f(x)\,dx = 0$.`, v: false, j: R`Falso: la integral impropia puede no existir (por ejemplo, $f(x) = x$); la propiedad vale en $[-a, a]$.` },
    { s: R`Si $f$ es continua en $[a, b]$, o tiene un número finito de discontinuidades de salto, es integrable en $[a, b]$.`, v: true, j: R`Verdadero: es un teorema de integrabilidad.` },
    { s: R`Por el teorema del valor medio para integrales, existe $c$ con $f'(c) = \frac{1}{b - a}\int_a^b f$.`, v: false, j: R`Falso: el teorema dice $f(c) = \frac{1}{b - a}\int_a^b f$, sin derivada.` },
    { s: R`Si $f$ es derivable en $a$, entonces es continua en $a$.`, v: true, j: R`Verdadero: $f(a + h) - f(a) = \frac{f(a + h) - f(a)}{h}\,h \to f'(a)\cdot 0 = 0$.` },
    { s: R`Si $f$ es continua en $a$, entonces es derivable en $a$.`, v: false, j: R`Falso: $|x|$ es continua en $0$ y no es derivable ahí.` }
  ];
  SELF["ex-vf-teoria"] = {
    concepts: ["integral-definida", "lhopital"],
    generate(r) {
      const qs = r.sample(VF, 4);
      return {
        prompt: `Indicá Verdadero o Falso y justificá (las falsas, con un contraejemplo o la versión correcta): ${qs.map((q, i) => `**${"abcd"[i]})** ${q.s}`).join(" ")}`,
        rubric: qs.map((q, i) => ({ text: `${"abcd"[i]}) ${q.v ? "V" : "F"}. ${q.j}`, w: 1 })),
        solution: qs.map((q, i) => `${"abcd"[i]}) **${q.v ? "Verdadero" : "Falso"}**. ${q.j.replace(/^(Verdadero|Falso): /, "")}`)
      };
    }
  };

  // área entre una parábola en y y una recta, volumen y longitud de arco (planteos)
  SELF["ex-area-xy"] = {
    concepts: ["area-curvas", "volumen-revolucion"],
    generate(r, H) {
      const y1 = r.int(1, 3), w = r.pick([3, 4, 5]), y2 = y1 + w, c2 = y1 + y2 + 1;
      if (c2 % 2) return null;
      const c = c2 / 2, d = r.int(-2, 2), L = c * c + d - y1 * y2;            // (y−c)² + d = L − y en y1, y2
      // comprobamos que y1, y2 son las raíces de y² − (2c − 1)y + c² + d − L = 0
      if (y1 + y2 !== 2 * c - 1 || y1 * y2 !== c * c + d - L) return null;
      const area = w ** 3 / 6;
      const par = `x = (y ${H.sg(-c)})^2 ${H.sg(d)}`.replace(" + 0", "").replace(" - 0", ""), lin = `x = ${L} - y`;
      return {
        prompt: `Graficá la región limitada por las curvas $${par}$ y $${lin}$. a) Planteá el área como integral respecto de $y$ y respecto de $x$; elegí una y calculá el área. b) Planteá (sin resolver) el volumen del sólido que se genera al girar la región alrededor de la recta $y = ${y1 - 1}$, indicando el método. c) Planteá la longitud de la parábola entre los puntos de corte.`,
        rubric: [
          { text: `Puntos de corte: $y = ${y1}$ e $y = ${y2}$, o sea $(${L - y1}, ${y1})$ y $(${L - y2}, ${y2})$.`, w: 2 },
          { text: `a) Respecto de $y$: $A = \\int_{${y1}}^{${y2}}\\left[(${L} - y) - ((y ${H.sg(-c)})^2 ${H.sg(d)})\\right]dy$ (derecha menos izquierda).`, w: 2 },
          { text: R`a) Respecto de $x$: dos integrales, partiendo en el vértice de la parábola.`, w: 1 },
          { text: `a) Resultado: $A = ${H.frac(w ** 3, 6)} \\approx ${nf(H, area)}$.`, w: 2 },
          { text: `b) Cáscaras: $V = 2\\pi\\int_{${y1}}^{${y2}} (y - ${y1 - 1})\\left[(${L} - y) - ((y ${H.sg(-c)})^2 ${H.sg(d)})\\right]dy$.`, w: 2 },
          { text: `c) $\\ell = \\int_{${y1}}^{${y2}}\\sqrt{1 + \\left(\\frac{dx}{dy}\\right)^2}\\,dy = \\int_{${y1}}^{${y2}}\\sqrt{1 + 4(y ${H.sg(-c)})^2}\\,dy$.`, w: 1 }
        ],
        solution: [
          `Igualamos: $(y ${H.sg(-c)})^2 ${H.sg(d)} = ${L} - y$, que da $y^2 - ${2 * c - 1}y + ${y1 * y2} = 0$: $y = ${y1}$ e $y = ${y2}$.`,
          `Entre esos valores, la recta queda a la derecha de la parábola. Respecto de $y$: $A = \\int_{${y1}}^{${y2}} \\left[-y^2 + ${2 * c - 1}y - ${y1 * y2}\\right]dy = ${H.frac(w ** 3, 6)}$.`,
          `Respecto de $x$ hay que partir: la parábola tiene vértice en $x = ${d}$ y la región se describe con dos fórmulas distintas para el borde inferior; por eso conviene integrar en $y$.`,
          `b) Con cáscaras horizontales (radio $y - ${y1 - 1}$, largo derecha menos izquierda, espesor $dy$): $V = 2\\pi\\int_{${y1}}^{${y2}} (y - ${y1 - 1})\\left[(${L} - y) - ((y ${H.sg(-c)})^2 ${H.sg(d)})\\right]dy$.`,
          `c) Con la parábola escrita como $x(y)$: $\\frac{dx}{dy} = 2(y ${H.sg(-c)})$, y $\\ell = \\int_{${y1}}^{${y2}}\\sqrt{1 + 4(y ${H.sg(-c)})^2}\\,dy$.`
        ],
        verify: { kind: "zero", tol: 1e-8, fn: () => { const n = 2000, h = w / n; let A = 0; for (let i = 0; i < n; i++) { const y = y1 + (i + 0.5) * h; A += ((L - y) - ((y - c) ** 2 + d)) * h; } return [(A - area) / area, ((y1 - c) ** 2 + d) - (L - y1), ((y2 - c) ** 2 + d) - (L - y2)].map(v => (Math.abs(v) < 1e-6 ? 0 : v)); } }
      };
    }
  };

  // verificar que una familia de funciones resuelve una ecuación diferencial
  SELF["ex-edo-familia"] = {
    concepts: ["edo"],
    generate(r, H) {
      const fam = r.pick([
        { y: R`y = \frac{\ln x + C}{x}`, eq: R`x^2 y' + x y = 1`, Y: (x, C) => (Math.log(x) + C) / x, res: (x, y, yp) => x * x * yp + x * y - 1, d: R`y' = \frac{1 - \ln x - C}{x^2}` },
        { y: R`y = C e^{-x} + x - 1`, eq: R`y' + y = x`, Y: (x, C) => C * Math.exp(-x) + x - 1, res: (x, y, yp) => yp + y - x, d: R`y' = -C e^{-x} + 1` },
        { y: R`y = C x^2 + x`, eq: R`x y' - 2y = -x`, Y: (x, C) => C * x * x + x, res: (x, y, yp) => x * yp - 2 * y + x, d: R`y' = 2Cx + 1` },
        { y: R`y = \frac{1}{C - x}`, eq: R`y' = y^2`, Y: (x, C) => 1 / (C - x), res: (x, y, yp) => yp - y * y, d: R`y' = \frac{1}{(C - x)^2}` }
      ]);
      return {
        prompt: `Demostrá que cualquier función de la familia $${fam.y}$ es solución de la ecuación diferencial $${fam.eq}$.`,
        rubric: [{ text: `Deriva correctamente: $${fam.d}$.`, w: 2 }, { text: R`Reemplaza $y$ e $y'$ en la ecuación.`, w: 2 }, { text: R`Simplifica y llega a una identidad que vale para todo $C$.`, w: 1 }],
        solution: [`Derivamos: $${fam.d}$.`, `Reemplazando en $${fam.eq}$ y simplificando, los términos con $C$ se cancelan y queda una identidad: la igualdad vale para todo $x$ del dominio y todo $C$.`, R`Por eso toda la familia es solución (y la constante $C$ se fija con una condición inicial).`],
        verify: { kind: "zero", tol: 1e-5, fn: () => [-1.5, 0.7, 3.2].flatMap(C => [0.4, 1.3].map(x => { const h = 1e-6, y = fam.Y(x, C), yp = (fam.Y(x + h, C) - fam.Y(x - h, C)) / (2 * h); return Number.isFinite(y) ? fam.res(x, y, yp) : 0; })) }
      };
    }
  };

  E.registerExams("m101", { self: SELF, templates: T });
})();
