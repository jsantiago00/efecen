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
    exams: [
      { id: "p1", kind: "parcial", title: "1.er parcial", topics: "Funciones, límites y continuidad", minutes: 120, pass: 60,
        items: [
          { title: "Composición e inversa", parts: [{ tpl: "comp-eval-num", pts: 5 }, { tpl: "inverse-num", pts: 10 }] },
          { title: "Límites", parts: [{ pick: ["lim-1cos-num", "lim-sin-num"], pts: 12 }, { pick: ["lim-conj-num", "lim-factor-num"], pts: 12 }, { tpl: "lim-inf-cociente-num", pts: 11 }] },
          { title: "Límite por definición", parts: [{ self: "ex-epsdelta", pts: 15 }] },
          { title: "Continuidad", parts: [{ self: "ex-cont-trozos", pts: 20 }] },
          { title: "Discontinuidades y asíntotas", parts: [{ tpl: "cont-tipo-mc", pts: 5 }, { tpl: "lim-asintota-mc", pts: 5 }, { tpl: "cont-param-num", pts: 5 }] }
        ] },
      { id: "p2", kind: "parcial", title: "2.º parcial", topics: "Derivadas y sus aplicaciones", minutes: 120, pass: 60,
        items: [
          { title: "Análisis de una función", parts: [{ tpl: "abs-ext-num", pts: 8 }, { tpl: "inflex-num", pts: 7 }, { self: "ex-analisis", pts: 15 }] },
          { title: "Reglas de derivación", parts: [{ tpl: "der-cadena-num", pts: 8 }, { tpl: "der-coc-num", pts: 7 }] },
          { title: "Derivación implícita y recta tangente", parts: [{ tpl: "der-implicita-num", pts: 8 }, { tpl: "der-tangente-num", pts: 7 }] },
          { title: "Existencia y unicidad de raíces", parts: [{ self: "ex-bolzano-unica", pts: 20 }] },
          { title: "Regla de L'Hôpital", parts: [{ tpl: "lhop-num", pts: 12 }, { self: "ex-teorema", args: ["lhopital"], pts: 8 }] }
        ] },
      { id: "p3", kind: "parcial", title: "3.er parcial", topics: "Optimización, teorema fundamental e integrales", minutes: 120, pass: 60,
        items: [
          { title: "Optimización", parts: [{ pick: ["optim-geo-num", "optim-caja-num"], pts: 20 }] },
          { title: "Teorema fundamental del cálculo", parts: [{ self: "ex-leibniz", pts: 6 }, { tpl: "tfc-deriv-num", pts: 9 }] },
          { title: "Integral definida", parts: [{ tpl: "tfc-num", pts: 10 }] },
          { title: "Técnicas de integración", parts: [{ pick: ["partes-num", "sust-num"], pts: 18 }, { pick: ["trigint-num", "fracs-num"], pts: 17 }] },
          { title: "Área y teoremas", parts: [{ tpl: "area-num", pts: 12 }, { self: "ex-teorema", args: ["tfc", "valor-medio-int"], pts: 8 }] }
        ] },
      { id: "final", kind: "final", title: "Final (parte práctica)", topics: "Toda la materia: optimización, aplicaciones de la integral, ecuaciones diferenciales y series", minutes: 180, pass: 60,
        items: [
          { title: "Optimización", parts: [{ pick: ["optim-geo-num", "optim-caja-num"], pts: 20 }] },
          { title: "Áreas, volúmenes y longitud de arco", parts: [{ tpl: "area-num", pts: 12 }, { tpl: "volumen-num", pts: 10 }, { tpl: "arco-num", pts: 8 }] },
          { title: "Ecuaciones diferenciales", parts: [{ tpl: "edo-sep-num", pts: 15 }, { tpl: "edo-verif-mc", pts: 10 }] },
          { title: "Series", parts: [{ self: "ex-teorema", args: ["cociente", "comparacion"], pts: 8 }, { tpl: "ratio-num", pts: 9 }, { tpl: "criterio-mc", pts: 8 }] }
        ] }
    ]
  });
})();
