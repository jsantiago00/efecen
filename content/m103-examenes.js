/* ===== M103 · Evaluaciones: parciales y final simulados =====
   Estructura de los exámenes reales (ver docs/parciales/m103.md): el 1.er parcial tiene dos ejercicios largos (dónde es
   derivable y analítica una función dada por u y v; un contorno, su longitud y una cota para una integral) o varios cortos
   (potencias, logaritmos, ecuaciones); el 2.º, singularidades con su parte principal y residuos, y los valores posibles de
   una integral según el contorno; el final, tres ejercicios de desarrollo (sumas e integrales por residuos, funciones
   enteras, principio del argumento). Enunciados propios y datos sorteados. */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, Z = E.c3, dn = Z.dn;
  const SELF = {};
  const one = [1, 0], I2 = [0, 2 * Math.PI], inv = z => Z.div(one, z);
  const zm = (a, v = "z") => (a === 0 ? v : `${v} ${a < 0 ? "+" : "-"} ${Math.abs(a)}`);
  const fact = n => { let p = 1; for (let i = 2; i <= n; i++) p *= i; return p; };
  const simpson = (f, a, b, n) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3; };

  // ---------- 1.er parcial ----------
  SELF["c3-ex-cr"] = {
    concepts: ["c3-derivada", "c3-analitica"],
    generate(r) {
      const a = r.nz(-3, 3), b = r.nz(-6, 6), line = r.bool(0.4), c = line ? 2 * a : 2 * a + r.nz(-3, 3), y0 = -b / c, y0T = H.frac(-b, c);
      if (c === 0) return null;
      const u = (x, y) => a * x * x + b * y, v = (x, y) => c * x * y;
      const where = line ? `en todos los puntos de la recta horizontal $y = ${y0T}$` : `solo en el punto $z_0 = ${y0T === "0" ? "0" : `${y0T}\\,i`}$`;
      return {
        prompt: `Sea $f(x + iy) = u + iv$, con $u(x, y) = ${H.poly([[a, "x^{2}"], [b, "y"]])}$ y $v(x, y) = ${H.kx(c, "xy")}$.<br>a) Justificá que $f$ es continua en todo el plano.<br>b) Hallá el conjunto donde $f$ es derivable.<br>c) Hallá el conjunto donde $f$ es analítica y sus puntos singulares.<br>d) Calculá $f'$ en los puntos donde existe.`,
        rubric: [
          { text: `a) $u$ y $v$ son polinomios en $x$ e $y$, continuos en todo el plano, y $f$ es continua donde lo son sus partes real e imaginaria ([[c3-limite|límites y continuidad]]).`, w: 2 },
          { text: `b) $u_x = ${H.kx(2 * a, "x")}$, $u_y = ${b}$, $v_x = ${H.kx(c, "y")}$, $v_y = ${H.kx(c, "x")}$. [[c3-derivada|Cauchy-Riemann]]: $${H.kx(2 * a, "x")} = ${H.kx(c, "x")}$ y $${b} = ${H.kx(-c, "y")}$. ${line ? "La primera vale siempre" : "La primera da $x = 0$"} y la segunda da $y = ${y0T}$. Como las parciales son continuas, $f$ es derivable ${where}.`, w: 4 },
          { text: `c) Ese conjunto no contiene ningún disco: $f$ no es [[c3-analitica|analítica]] en ningún punto. Por lo tanto tampoco tiene puntos singulares (un punto singular necesita puntos de analiticidad en todo entorno).`, w: 2 },
          { text: `d) $f' = u_x + i\\,v_x = ${H.kx(2 * a, "x")} ${c * y0 < 0 ? "-" : "+"} ${H.frac(Math.abs(b), 1)}\\,i$ en esos puntos (ahí $v_x = ${H.kx(c, "y")} = ${-b}$)${line ? "" : `: $f'(z_0) = ${-b === 1 ? "" : -b === -1 ? "-" : -b}i$`}.`, w: 2 }
        ],
        solution: [`Cauchy-Riemann son necesarias; con parciales continuas pasan a ser suficientes. La trampa del ejercicio es el inciso c): derivable sobre una recta (o en un punto) no es analítica.`],
        // otro camino: Cauchy-Riemann con derivadas numéricas, sobre el conjunto hallado y fuera de él
        verify: { kind: "zero", tol: 1e-6, fn: () => {
          const h = 1e-5, cr = (x, y) => Math.abs((u(x + h, y) - u(x - h, y)) / (2 * h) - (v(x, y + h) - v(x, y - h)) / (2 * h)) + Math.abs((u(x, y + h) - u(x, y - h)) / (2 * h) + (v(x + h, y) - v(x - h, y)) / (2 * h));
          const on = line ? [[-1.3, y0], [0, y0], [2.1, y0]] : [[0, y0]], off = [[0.7, y0 + 0.9], [-1.1, y0 - 0.6], [1.4, y0 + 0.3], ...(line ? [] : [[1.2, y0]])];
          return [...on.map(p => cr(...p)), ...off.map(p => (cr(...p) > 1e-3 ? 0 : 1))];
        } }
      };
    }
  };
  SELF["c3-ex-ml"] = {
    concepts: ["c3-contornos", "c3-logaritmo"],
    generate(r) {
      const a = r.int(1, 3), Rr = a + r.int(1, 3), a2 = a * a, M = (Math.log(Rr) + Math.PI) / (Rr * Rr - a2), L = Math.PI * Rr;
      const f = z => Z.div(Z.log(z), Z.add(Z.mul(z, z), [a2, 0]));
      return {
        prompt: `Sea $f(z) = \\dfrac{\\operatorname{Log} z}{z^2 + ${a2}}$ y $\\gamma(t) = ${Rr}\\,e^{it}$, con $0 \\le t \\le \\pi$.<br>a) Justificá que $\\gamma$ es un contorno y que existe $\\int_\\gamma f(z)\\,dz$.<br>b) Calculá la longitud de $\\gamma$ por definición.<br>c) Hallá una cota superior para $\\left|\\int_\\gamma f(z)\\,dz\\right|$.<br>d) ¿Qué pasa con esa cota si el radio $${Rr}$ se reemplaza por $R \\to \\infty$?`,
        rubric: [
          { text: `a) $\\gamma$ es derivable con $\\gamma'(t) = ${Rr}i\\,e^{it}$ continua y no nula: es un arco suave ([[c3-contornos|contorno]]). $f$ es continua sobre $\\gamma$ salvo en el extremo $t = \\pi$ ($z = -${Rr}$, sobre el corte de $\\operatorname{Log}$), donde $f(\\gamma(t))$ tiene límite lateral: el integrando es continuo a trozos y la integral existe. Los ceros del denominador, $\\pm ${a === 1 ? "" : a}i$, no están sobre $\\gamma$ porque $${a} \\ne ${Rr}$.`, w: 3 },
          { text: `b) $L = \\int_0^\\pi |\\gamma'(t)|\\,dt = \\int_0^\\pi ${Rr}\\,dt = ${Rr}\\pi$.`, w: 2 },
          { text: `c) Sobre $\\gamma$: $|\\operatorname{Log} z| = |\\ln ${Rr} + it| \\le \\ln ${Rr} + \\pi$ y $|z^2 + ${a2}| \\ge ${Rr * Rr} - ${a2} = ${Rr * Rr - a2}$. Entonces $M = \\dfrac{\\ln ${Rr} + \\pi}{${Rr * Rr - a2}}$ y $\\left|\\int_\\gamma f\\right| \\le ML = \\dfrac{${Rr}\\pi(\\ln ${Rr} + \\pi)}{${Rr * Rr - a2}} \\approx ${dn(M * L, 4)}$.`, w: 3 },
          { text: `d) $ML = \\dfrac{\\pi R(\\ln R + \\pi)}{R^2 - ${a2}} \\to 0$, porque $\\frac{\\ln R}{R} \\to 0$: la integral sobre la semicircunferencia tiende a cero. (Así se calculan integrales reales con logaritmos.)`, w: 2 }
        ],
        solution: [`Para la cota del logaritmo se usa $|x + iy| \\le |x| + |y|$; la cota más fina es $\\sqrt{\\ln^2R + \\pi^2}$, pero no hace falta.`],
        // otro camino: la longitud con una poligonal, y la integral y el máximo de |f| calculados numéricamente (tienen que respetar la cota)
        verify: { kind: "zero", tol: 1e-6, fn: () => {
          let len = 0, mx = 0; const N = 20000;
          for (let k = 0; k < N; k++) { const p = Z.polar(Rr, Math.PI * k / N), q = Z.polar(Rr, Math.PI * (k + 1) / N); len += Z.abs(Z.sub(q, p)); mx = Math.max(mx, Z.abs(f(Z.polar(Rr, Math.PI * (k + 0.5) / N)))); }
          const I = Z.abs(Z.path(f, t => Z.polar(Rr, t), 0, Math.PI - 1e-9, 4000));
          return [len / L - 1, Math.max(0, mx - M), Math.max(0, I - M * L)];
        } }
      };
    }
  };

  // ---------- 2.º parcial ----------
  SELF["c3-ex-singular"] = {
    concepts: ["c3-singularidades", "c3-residuo"],
    generate(r) {
      const m = r.pick([2, 3]), a = r.pick([1, 2, -1, -2]), Rr = Math.abs(a) + 1;
      const f = z => Z.div(Z.sub(Z.exp(z), one), Z.mul(Z.ipow(z, m), Z.sub(z, [a, 0])));
      const resA = (Math.exp(a) - 1) / a ** m, terms = Array.from({ length: m - 1 }, (_, i) => [i + 1, -1 / (fact(i + 1) * a ** (m - 1 - i))]);
      const res0 = terms.reduce((s, t) => s + t[1], 0);
      // parte principal en 0: coeficientes de z^{-j}, j = 1..m−1
      const pp = j => { let s = 0; for (let k = 1; k <= m - j; k++) s += -1 / (fact(k) * a ** (m - j - k + 1)); return s; };
      const ppT = Array.from({ length: m - 1 }, (_, i) => m - 1 - i).map(j => `\\dfrac{${dn(pp(j), 4)}}{${j === 1 ? "z" : `z^{${j}}`}}`).join(" + ").replace(/\+ \\dfrac\{-/g, "- \\dfrac{");
      return {
        prompt: `Sea $f(z) = \\dfrac{e^{z} - 1}{z^{${m}}\\,(${zm(a)})}$.<br>a) Hallá sus singularidades aisladas y clasificalas.<br>b) Hallá la parte principal de $f$ en $z = 0$.<br>c) Calculá el residuo en cada singularidad.<br>d) Calculá $\\oint_{|z| = ${Rr}} f(z)\\,dz$ (sentido positivo).`,
        rubric: [
          { text: `a) Singularidades en $z = 0$ y $z = ${a}$. En $0$, el numerador $e^z - 1 = z + \\frac{z^2}{2} + \\dots$ tiene un cero simple y el denominador uno de orden $${m}$: [[c3-singularidades|polo de orden]] $${m - 1}$ (no $${m}$). En $z = ${a}$: polo simple, porque el numerador vale $e^{${a}} - 1 \\ne 0$.`, w: 3 },
          { text: `b) Multiplicando $\\dfrac{e^z - 1}{z^{${m}}} = ${Array.from({ length: m }, (_, i) => `\\dfrac{1}{${fact(i + 1) === 1 ? "" : fact(i + 1)}${m - 1 - i === 0 ? (fact(i + 1) === 1 ? "1" : "") : m - 1 - i === 1 ? "z" : `z^{${m - 1 - i}}`}}`).join(" + ")} + \\dots$ por $\\dfrac{1}{${zm(a)}} = -\\dfrac{1}{${a}} - \\dfrac{z}{${a * a}} - \\dots$ y quedándose con las potencias negativas: parte principal $\\approx ${ppT}$.`, w: 3 },
          { text: `c) $\\operatorname{Res}_{z=0} f$ es el coeficiente de $\\frac1z$: $\\approx ${dn(res0, 4)}$. $\\operatorname{Res}_{z=${a}} f = \\dfrac{e^{${a}} - 1}{${H.par(a)}^{${m}}} \\approx ${dn(resA, 4)}$ ([[c3-residuo|residuos]]).`, w: 2 },
          { text: `d) Las dos singularidades quedan dentro de $|z| = ${Rr}$: la integral vale $2\\pi i\\,(${dn(res0, 4)} ${resA < 0 ? "-" : "+"} ${dn(Math.abs(resA), 4)}) \\approx ${dn(2 * Math.PI * (res0 + resA), 4)}\\,i$.`, w: 2 }
        ],
        solution: [`La clave es no confiarse del exponente del denominador: hay que mirar también los ceros del numerador.`],
        // otro camino: coeficientes de Laurent y residuos calculados con integrales de contorno numéricas
        verify: { kind: "zero", tol: 1e-6, fn: () => {
          const c = n => Z.div(Z.circ(z => Z.mul(f(z), Z.ipow(z, -n - 1)), [0, 0], 0.5), I2)[0];
          const out = [c(-1) - res0, c(-m), Z.div(Z.circ(f, [a, 0], 0.4), I2)[0] - resA, Z.div(Z.circ(f, [0, 0], Rr, 4000), I2)[0] - (res0 + resA)];
          for (let j = 1; j <= m - 1; j++) out.push(c(-j) - pp(j));
          return out;
        } }
      };
    }
  };
  SELF["c3-ex-contornos"] = {
    concepts: ["c3-residuo", "c3-cauchy-goursat"],
    generate(r) {
      const a = r.int(1, 4), b = r.int(1, 4), c = r.nz(-4, 4), d2 = (a + b) ** 2;
      const f = z => Z.div(Z.add(z, [0, c]), Z.mul(Z.add(z, [a, 0]), Z.ipow(Z.sub(z, [b, 0]), 2)));
      const resA = [-a / d2, c / d2], ci = `${Math.abs(c) === 1 ? "" : Math.abs(c)}i`;
      return {
        prompt: `Sea $\\gamma$ un contorno cerrado simple, recorrido en sentido positivo. ¿Qué valores puede tomar $\\displaystyle\\oint_\\gamma\\frac{z ${c < 0 ? "-" : "+"} ${ci}}{(z + ${a})(z - ${b})^2}\\,dz$, en los casos en que existe? Justificá.`,
        rubric: [
          { text: `El integrando es analítico salvo en $z = -${a}$ (polo simple) y $z = ${b}$ (polo doble). La integral existe si $\\gamma$ no pasa por ellos, y por el [[c3-residuo|teorema de los residuos]] solo depende de cuáles encierra.`, w: 2 },
          { text: `$\\operatorname{Res}_{z=-${a}} = \\dfrac{-${a} ${c < 0 ? "-" : "+"} ${ci}}{(${-a} - ${b})^2} = \\dfrac{-${a} ${c < 0 ? "-" : "+"} ${ci}}{${d2}}$.`, w: 2 },
          { text: `$\\operatorname{Res}_{z=${b}} = \\dfrac{d}{dz}\\left[\\dfrac{z ${c < 0 ? "-" : "+"} ${ci}}{z + ${a}}\\right]_{z=${b}} = \\dfrac{${a} ${c < 0 ? "+" : "-"} ${ci}}{${d2}}$: es el opuesto del anterior.`, w: 3 },
          { text: `Valores posibles: $0$ si $\\gamma$ no encierra ninguno o encierra los dos (los residuos se cancelan); $2\\pi i\\,\\dfrac{-${a} ${c < 0 ? "-" : "+"} ${ci}}{${d2}}$ si solo encierra a $-${a}$; y el opuesto si solo encierra a $${b}$. Son tres valores.`, w: 3 }
        ],
        solution: [`Que los residuos sumen cero no es casualidad: el integrando decae como $\\frac{1}{|z|^2}$, así que la integral sobre una circunferencia enorme tiende a cero, y esa integral es $2\\pi i$ por la suma de todos los residuos.`],
        // otro camino: las integrales sobre circunferencias que rodean cada polo y las dos, calculadas numéricamente
        verify: { kind: "zero", tol: 1e-7, fn: () => {
          const rA = Z.div(Z.circ(f, [-a, 0], 0.5), I2), rB = Z.div(Z.circ(f, [b, 0], 0.5), I2), all = Z.div(Z.circ(f, [0, 0], 12, 4000), I2);
          return [rA[0] - resA[0], rA[1] - resA[1], rB[0] + resA[0], rB[1] + resA[1], all[0], all[1]];
        } }
      };
    }
  };

  // ---------- final ----------
  SELF["c3-ex-fourier"] = {
    concepts: ["c3-jordan", "c3-impropias-res"],
    generate(r) {
      const k = r.int(1, 2), a = r.int(1, 2), val = Math.PI * Math.exp(-k * a), kT = k === 1 ? "" : String(k), aT = a === 1 ? "" : String(a);
      return {
        prompt: `Demostrá, usando residuos, que $\\displaystyle\\int_{-\\infty}^{\\infty}\\frac{x\\sin(${kT}x)}{x^2 + ${a * a}}\\,dx = \\pi e^{-${k * a}}$. Indicá el contorno, justificá qué pasa con cada tramo y calculá los residuos necesarios.`,
        rubric: [
          { text: `Se integra $g(z) = \\dfrac{z\\,e^{${kT}iz}}{z^2 + ${a * a}}$ sobre el segmento $[-R, R]$ más la semicircunferencia superior $C_R$, con $R > ${a}$. Se usa $e^{${kT}iz}$ (y no el seno) porque está acotada en el semiplano superior.`, w: 2 },
          { text: `Dentro del contorno hay un solo polo, simple, en $z = ${aT}i$: $\\operatorname{Res} = \\dfrac{${aT}i\\,e^{${kT}i\\cdot ${aT}i}}{2\\cdot ${aT}i} = \\dfrac{e^{-${k * a}}}{2}$ ([[c3-residuo|residuos]]).`, w: 3 },
          { text: `Sobre $C_R$, $\\left|\\dfrac{z}{z^2 + ${a * a}}\\right| \\le \\dfrac{R}{R^2 - ${a * a}} \\to 0$. La cota ML no alcanza (da una constante), pero por el [[c3-jordan|lema de Jordan]] la integral sobre $C_R$ tiende a $0$.`, w: 3 },
          { text: `Con $R \\to \\infty$: $\\int_{-\\infty}^{\\infty}\\dfrac{x\\,e^{${kT}ix}}{x^2 + ${a * a}}dx = 2\\pi i\\cdot\\dfrac{e^{-${k * a}}}{2} = \\pi i\\,e^{-${k * a}}$. Tomando parte imaginaria sale el resultado, $\\approx ${dn(val, 4)}$ (y la parte real da $\\int\\frac{x\\cos}{\\dots} = 0$, como corresponde a un integrando impar).`, w: 2 }
        ],
        solution: [`Es el caso típico en que hace falta Jordan: el integrando racional decae solo como $\\frac1R$.`],
        // otro camino: cuadratura directa hasta un X donde cos(kX) = 0, para que el primer término de la cola se anule
        verify: { kind: "zero", tol: 1e-3, fn: () => { const M = 300, X = (2 * Math.PI * M + Math.PI / 2) / k; return [2 * simpson(x => x * Math.sin(k * x) / (x * x + a * a), 0, X, M * 80) / val - 1]; } }
      };
    }
  };
  SELF["c3-ex-suma-cot"] = {
    concepts: ["c3-sumas"],
    generate(r) {
      const a = r.int(1, 3), val = Math.PI / (a * Math.tanh(Math.PI * a)), aT = a === 1 ? "" : String(a);
      return {
        prompt: `Demostrá que $\\displaystyle\\sum_{n=-\\infty}^{\\infty}\\frac{1}{n^2 + ${a * a}} = \\frac{\\pi}{${a}}\\coth(${aT}\\pi)$. Sugerencia: integrá $\\dfrac{\\pi\\cot(\\pi z)}{z^2 + ${a * a}}$ sobre los cuadrados $C_N$ de lados $x = \\pm(N + \\frac12)$, $y = \\pm(N + \\frac12)$. Podés usar que $|\\cot(\\pi z)| \\le M$ sobre todos ellos.`,
        rubric: [
          { text: `Polos del integrando dentro de $C_N$: los enteros $n$ con $|n| \\le N$ (ceros simples de $\\sin\\pi z$) y $z = \\pm ${aT}i$.`, w: 2 },
          { text: `En cada entero, $\\operatorname{Res} = \\dfrac{\\pi\\cos(\\pi n)}{\\pi\\cos(\\pi n)}\\cdot\\dfrac{1}{n^2 + ${a * a}} = \\dfrac{1}{n^2 + ${a * a}}$ ([[c3-sumas-series|suma de series por residuos]]).`, w: 2 },
          { text: `En $z = \\pm ${aT}i$: $\\operatorname{Res} = \\dfrac{\\pi\\cot(\\pm ${aT}\\pi i)}{\\pm ${2 * a}i} = -\\dfrac{\\pi\\coth(${aT}\\pi)}{${2 * a}}$ cada uno, porque $\\cot(iy) = -i\\coth y$.`, w: 3 },
          { text: `Sobre $C_N$, el integrando tiene módulo $\\le \\dfrac{\\pi M}{N^2 - ${a * a}}$ y la longitud es $8N + 4$: por la cota ML la integral tiende a $0$. Entonces la suma de todos los residuos es $0$: $\\sum\\dfrac{1}{n^2 + ${a * a}} = \\dfrac{\\pi}{${a}}\\coth(${aT}\\pi) \\approx ${dn(val, 5)}$.`, w: 3 }
        ],
        solution: [`$\\pi\\cot(\\pi z)$ tiene residuo 1 en cada entero: convierte una serie en una suma de residuos.`],
        // otro camino: suma parcial directa, y el residuo en ai por integración numérica
        verify: { kind: "zero", tol: 1e-4, fn: () => {
          let s = 1 / (a * a); for (let n = 1; n <= 2e5; n++) s += 2 / (n * n + a * a);
          const g = z => Z.div(Z.sc(Math.PI, Z.div(Z.cos(Z.sc(Math.PI, z)), Z.sin(Z.sc(Math.PI, z)))), Z.add(Z.mul(z, z), [a * a, 0]));
          return [s / val - 1, Z.div(Z.circ(g, [0, a], 0.3), I2)[0] + val / 2];
        } }
      };
    }
  };
  SELF["c3-ex-identidad"] = {
    concepts: ["c3-ceros-polos", "c3-liouville"],
    generate(r) {
      const a = r.nz(-4, 4), b = r.nz(-5, 5), c = [r.nz(-2, 2), r.nz(-2, 2)], val = Z.add(Z.sc(a, Z.mul(c, c)), [b, 0]);
      return {
        prompt: `Sea $f$ una función entera tal que $f\\!\\left(\\frac1n\\right) = \\dfrac{${a}}{n^2} ${b < 0 ? "-" : "+"} ${Math.abs(b)}$ para todo $n \\in \\mathbb N$.<br>a) Demostrá que $f(z) = ${H.poly([[a, "z^{2}"], [b, ""]])}$ para todo $z$.<br>b) Calculá $f(${Z.tex(c)})$.<br>c) ¿Sigue valiendo la conclusión si solo se sabe que $f$ es analítica en $\\mathbb C\\setminus\\{0\\}$? Justificá.`,
        rubric: [
          { text: `a) Sea $g(z) = f(z) - (${H.poly([[a, "z^{2}"], [b, ""]])})$, entera. Se anula en todos los puntos $\\frac1n$, que se acumulan en $0$; por continuidad, $g(0) = 0$.`, w: 3 },
          { text: `Si $g$ no fuera idénticamente nula, su cero en $0$ sería aislado ([[c3-ceros-polos|los ceros de una analítica son aislados]]), pero todo entorno de $0$ contiene otros ceros $\\frac1n$. Entonces $g = 0$ en un disco y, por el principio de identidad, en todo el plano.`, w: 3 },
          { text: `b) $f(${Z.tex(c)}) = ${a}\\,(${Z.tex(c)})^2 ${b < 0 ? "-" : "+"} ${Math.abs(b)} = ${a}\\,(${Z.tex(Z.mul(c, c))}) ${b < 0 ? "-" : "+"} ${Math.abs(b)} = ${Z.tex(val)}$.`, w: 2 },
          { text: `c) No: el punto de acumulación tiene que estar **dentro** del dominio. Por ejemplo, $f(z) = ${H.poly([[a, "z^{2}"], [b, ""]])} + \\sin\\frac{\\pi}{z}$ cumple la condición (porque $\\sin n\\pi = 0$) y es otra función.`, w: 2 }
        ],
        solution: [`Una función analítica queda determinada por sus valores en una sucesión que se acumula dentro del dominio.`],
        // otro camino: el polinomio que interpola los datos en 1, 1/2 y 1/3 (Lagrange, en aritmética compleja), evaluado en el punto; y el contraejemplo de c)
        verify: { kind: "zero", tol: 1e-9, fn: () => {
          const xs = [1, 1 / 2, 1 / 3], ys = xs.map(x => a * x * x + b);
          let p = [0, 0];
          xs.forEach((xi, i) => { let t = [ys[i], 0]; xs.forEach((xj, j) => { if (j !== i) t = Z.mul(t, Z.sc(1 / (xi - xj), Z.sub(c, [xj, 0]))); }); p = Z.add(p, t); });
          return [p[0] - val[0], p[1] - val[1], ...[4, 7, 15].map(n => Math.sin(Math.PI * n))];
        } }
      };
    }
  };
  SELF["c3-ex-arg"] = {
    concepts: ["c3-argumento"],
    generate(r) {
      const rs = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)], p = -(rs[0] + rs[1] + rs[2]), q = rs[0] * rs[1] + rs[0] * rs[2] + rs[1] * rs[2], s = -rs[0] * rs[1] * rs[2], sum = -p;
      const f = z => Z.add(Z.add(Z.add(Z.ipow(z, 3), Z.sc(p, Z.mul(z, z))), Z.sc(q, z)), [s, 0]), fp = z => Z.add(Z.add(Z.sc(3, Z.mul(z, z)), Z.sc(2 * p, z)), [q, 0]);
      return {
        prompt: `Sea $f$ un polinomio y $C$ un contorno cerrado simple positivo que encierra todos sus ceros.<br>a) Demostrá que $\\dfrac{1}{2\\pi i}\\displaystyle\\oint_C\\frac{z\\,f'(z)}{f(z)}\\,dz$ es la suma de los ceros de $f$, cada uno contado con su multiplicidad.<br>b) Calculá esa integral para $f(z) = ${H.poly([[1, "z^{3}"], [p, "z^{2}"], [q, "z"], [s, ""]])}$, sin hallar las raíces.`,
        rubric: [
          { text: `a) Cerca de un cero $z_k$ de orden $m_k$: $f(z) = (z - z_k)^{m_k}g(z)$ con $g(z_k) \\ne 0$, y $\\dfrac{f'}{f} = \\dfrac{m_k}{z - z_k} + \\dfrac{g'}{g}$ ([[c3-argumento|principio del argumento]]).`, w: 3 },
          { text: `Entonces $\\dfrac{z\\,f'}{f}$ tiene en $z_k$ un polo simple (o una singularidad evitable, si $z_k = 0$) con residuo $\\lim (z - z_k)\\dfrac{z\\,f'}{f} = m_kz_k$. No hay otros puntos singulares, porque $f$ es un polinomio.`, w: 3 },
          { text: `Por el [[c3-residuo|teorema de los residuos]], $\\dfrac{1}{2\\pi i}\\oint_C\\dfrac{z\\,f'}{f}dz = \\sum_k m_kz_k$.`, w: 2 },
          { text: `b) La suma de las raíces de $z^3 + pz^2 + \\dots$ es $-p$ (relaciones de Vieta): acá, $${sum}$.`, w: 2 }
        ],
        solution: [`Con $z^n$ en lugar de $z$ se obtiene la suma de las potencias $n$-ésimas de los ceros.`],
        // otro camino: la integral calculada numéricamente sobre una circunferencia grande
        verify: { kind: "zero", tol: 1e-6, fn: () => { const I = Z.div(Z.circ(z => Z.div(Z.mul(z, fp(z)), f(z)), [0, 0], 7, 4000), I2); return [I[0] - sum, I[1]]; } }
      };
    }
  };

  E.registerExams("m103", {
    self: SELF,
    exams: [
      { id: "p1", kind: "parcial", title: "1.er parcial", topics: "Números complejos, funciones analíticas (Cauchy-Riemann), funciones elementales (logaritmo, potencias, ecuaciones) e integrales de contorno con su cota.", minutes: 180, pass: 60,
        items: [
          { title: "Ejercicio 1: derivabilidad y analiticidad", parts: [{ self: "c3-ex-cr", pts: 30 }] },
          { title: "Ejercicio 2: un contorno y una cota", parts: [{ self: "c3-ex-ml", pts: 30 }] },
          { title: "Ejercicio 3: potencias", parts: [{ pick: ["c3-potencia-multi", "c3-moivre-num", "c3-raices-multi"], pts: 10 }] },
          { title: "Ejercicio 4: ecuaciones y logaritmos", parts: [{ pick: ["c3-ecuacion-exp-multi", "c3-log-num", "c3-rama-mc"], pts: 10 }] },
          { title: "Ejercicio 5: límites y funciones", parts: [{ pick: ["c3-limite-vf", "c3-elementales-vf", "c3-conj-armonica-expr"], pts: 10 }] },
          { title: "Ejercicio 6: una integral de contorno", parts: [{ pick: ["c3-linea-cx", "c3-primitiva-cx"], pts: 10 }] }
        ] },
      { id: "p2", kind: "parcial", title: "2.º parcial", topics: "Fórmula integral de Cauchy, series de Taylor y de Laurent, singularidades aisladas, residuos y teorema de los residuos.", minutes: 180, pass: 60,
        items: [
          { title: "Ejercicio 1: singularidades, parte principal y residuos", parts: [{ self: "c3-ex-singular", pts: 35 }] },
          { title: "Ejercicio 2: valores posibles de una integral", parts: [{ self: "c3-ex-contornos", pts: 35 }] },
          { title: "Ejercicio 3: series", parts: [{ pick: ["c3-taylor-coef-num", "c3-laurent-coef-num", "c3-radio-num"], pts: 10 }] },
          { title: "Ejercicio 4: clasificación", parts: [{ pick: ["c3-clasificar-mc", "c3-ceros-num"], pts: 10 }] },
          { title: "Ejercicio 5: una integral", parts: [{ pick: ["c3-cauchy-formula-num", "c3-teorema-residuos-num", "c3-residuo-orden-num"], pts: 10 }] }
        ] },
      { id: "final", kind: "final", title: "Final (parte escrita)", topics: "Tres ejercicios de desarrollo, como en los finales: una integral o una suma por residuos, una función entera y el principio del argumento.", minutes: 180, pass: 60,
        items: [
          { any: [
            { title: "Ejercicio 1: una integral por residuos", parts: [{ self: "c3-ex-fourier", pts: 35 }] },
            { title: "Ejercicio 1: una suma por residuos", parts: [{ self: "c3-ex-suma-cot", pts: 35 }] }
          ] },
          { title: "Ejercicio 2: una función entera", parts: [{ self: "c3-ex-identidad", pts: 30 }] },
          { title: "Ejercicio 3: ceros de un polinomio", parts: [{ self: "c3-ex-arg", pts: 35 }] }
        ] }
    ]
  });
})();
