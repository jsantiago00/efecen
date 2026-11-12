/*
 * M103 · Cálculo III (variable compleja) — Lic. en Ciencias Básicas (FCEN, UNCuyo), Plan Ord. 77/15 C.S.
 * ==========================================================================================
 * No hay programa publicado: el temario sale de los parciales de 2021 y 2022 y de los finales de 2020 y 2021
 * que están en Apunteca (ver docs/parciales/m103.md) y de un temario estándar de variable compleja, en 7 unidades:
 *   1 Números complejos · 2 Funciones analíticas · 3 Funciones elementales · 4 Integración compleja
 *   5 Series de Taylor y de Laurent · 6 Singularidades y residuos · 7 Aplicaciones de los residuos
 *
 * Biblioteca E.c3: aritmética compleja con pares [re, im], integrales de contorno numéricas, derivada numérica
 * y raíces de polinomios (Durand-Kerner). Las verificaciones usan esos caminos: potencias por multiplicación
 * repetida, derivadas por cocientes incrementales en dos direcciones, integrales sobre el contorno, etc.
 * Ids con prefijo "c3-". Todo el texto y los ejercicios son originales.
 */
(function () {
  const E = window.Efecen, H = E.H;
  E.registerCourse({ id: "m103", code: "M103", title: "Cálculo III", icon: "rotate-ccw" });
  const Z = E.c3 = {
    add: (a, b) => [a[0] + b[0], a[1] + b[1]],
    sub: (a, b) => [a[0] - b[0], a[1] - b[1]],
    mul: (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]],
    div: (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; },
    sc: (k, a) => [k * a[0], k * a[1]],
    conj: a => [a[0], -a[1]],
    abs: a => Math.hypot(a[0], a[1]),
    arg: a => Math.atan2(a[1], a[0]),
    polar: (rho, t) => [rho * Math.cos(t), rho * Math.sin(t)],
    exp: a => { const e = Math.exp(a[0]); return [e * Math.cos(a[1]), e * Math.sin(a[1])]; },
    log: a => [Math.log(Math.hypot(a[0], a[1])), Math.atan2(a[1], a[0])],   // rama principal
    sin: a => [Math.sin(a[0]) * Math.cosh(a[1]), Math.cos(a[0]) * Math.sinh(a[1])],
    cos: a => [Math.cos(a[0]) * Math.cosh(a[1]), -Math.sin(a[0]) * Math.sinh(a[1])],
    sinh: a => [Math.sinh(a[0]) * Math.cos(a[1]), Math.cosh(a[0]) * Math.sin(a[1])],
    cosh: a => [Math.cosh(a[0]) * Math.cos(a[1]), Math.sinh(a[0]) * Math.sin(a[1])]
  };
  Z.pow = (a, w) => Z.exp(Z.mul(w, Z.log(a)));                              // valor principal de a^w
  // potencia entera por multiplicación repetida (no usa la forma polar)
  Z.ipow = (a, n) => { let p = [1, 0]; for (let i = 0; i < Math.abs(n); i++) p = Z.mul(p, a); return n < 0 ? Z.div([1, 0], p) : p; };
  // exponencial por su serie (no usa seno ni coseno)
  Z.expS = a => { let s = [1, 0], t = [1, 0]; for (let n = 1; n < 80; n++) { t = Z.sc(1 / n, Z.mul(t, a)); s = Z.add(s, t); } return s; };
  // derivada numérica en la dirección h (por defecto, la real)
  Z.dz = (f, z, h = [1e-5, 0]) => Z.div(Z.sub(f(Z.add(z, h)), f(Z.sub(z, h))), Z.sc(2, h));
  // ∫ f(z) dz sobre la circunferencia |z − z0| = R, en sentido positivo (trapecios: converge muy rápido en curvas cerradas)
  Z.circ = (f, z0, R, n = 2000) => {
    let s = [0, 0];
    for (let k = 0; k < n; k++) { const t = 2 * Math.PI * k / n, e = Z.polar(R, t); s = Z.add(s, Z.mul(f(Z.add(z0, e)), Z.mul([0, 1], e))); }
    return Z.sc(2 * Math.PI / n, s);
  };
  // ∫ f(z) dz sobre una curva γ(t), t ∈ [a, b] (Simpson, con γ' numérica)
  Z.path = (f, g, a, b, n = 2000) => {
    const h = (b - a) / n, d = 1e-6;
    let s = [0, 0];
    for (let k = 0; k <= n; k++) {
      const t = a + k * h, gp = Z.sc(1 / (2 * d), Z.sub(g(t + d), g(t - d))), w = k === 0 || k === n ? 1 : k % 2 ? 4 : 2;
      s = Z.add(s, Z.sc(w, Z.mul(f(g(t)), gp)));
    }
    return Z.sc(h / 3, s);
  };
  // segmento de z1 a z2
  Z.seg = (f, z1, z2, n = 2000) => Z.path(f, t => Z.add(z1, Z.sc(t, Z.sub(z2, z1))), 0, 1, n);
  // raíces de un polinomio de coeficientes complejos (del grado mayor al menor), por Durand-Kerner
  Z.roots = c => {
    const n = c.length - 1, a = c.map(x => Z.div(x, c[0]));
    let rs = Array.from({ length: n }, (_, k) => Z.ipow([0.4, 0.9], k));
    for (let it = 0; it < 400; it++) rs = rs.map((x, i) => {
      let p = a[0], q = [1, 0];
      for (let j = 1; j <= n; j++) p = Z.add(Z.mul(p, x), a[j]);
      for (let j = 0; j < n; j++) if (j !== i) q = Z.mul(q, Z.sub(x, rs[j]));
      return Z.sub(x, Z.div(p, q));
    });
    return rs;
  };
  // número con coma para TeX
  Z.dn = (x, d = 3) => String(H.num(x, d)).replace(".", "{,}");
  // a + bi en TeX
  Z.tex = (z, d = 3) => {
    const re = +(+z[0]).toFixed(d) || 0, im = +(+z[1]).toFixed(d) || 0, a = Math.abs(im);
    const it = (a === 1 ? "" : Z.dn(a, d)) + "i";
    if (im === 0) return Z.dn(re, d);
    if (re === 0) return (im < 0 ? "-" : "") + it;
    return `${Z.dn(re, d)} ${im < 0 ? "-" : "+"} ${it}`;
  };
  // (a + bi)/den en TeX, con cada parte como fracción reducida
  Z.cfrac = (num, den = 1) => {
    const re = H.frac(num[0], den), ia = H.frac(Math.abs(num[1]), Math.abs(den)), neg = num[1] * den < 0, it = (ia === "1" ? "" : ia + (ia.includes("frac") ? "\\," : "")) + "i";
    if (num[1] === 0) return re;
    if (num[0] === 0) return (neg ? "-" : "") + it;
    return `${re} ${neg ? "-" : "+"} ${it}`;
  };
  // p·π/q en TeX
  Z.pif = (p, q = 1) => {
    if (p === 0) return "0";
    if (q < 0) { p = -p; q = -q; }
    const g = H.gcd(p, q); p /= g; q /= g;
    const s = p < 0 ? "-" : "", a = Math.abs(p), top = (a === 1 ? "" : a) + "\\pi";
    return q === 1 ? s + top : `${s}\\frac{${top}}{${q}}`;
  };
  // un complejo "lindo": módulo k, k√2 o 2k y argumento múltiplo de π/6 o de π/4. Devuelve el valor, su TeX y sus datos polares
  Z.nice = (r, kmax = 4, fams = ["eje", "45", "30", "60"]) => {
    const k = r.int(1, kmax), fam = r.pick(fams), sx = r.sign(), sy = r.sign(), s3 = Math.sqrt(3), K = k === 1 ? "" : String(k);
    if (fam === "eje") {
      const d = r.int(0, 3), z = [[k, 0], [0, k], [-k, 0], [0, -k]][d];
      return { z, tex: [`${k}`, `${K}i`, `-${k}`, `-${K}i`][d], mod: k, modTex: String(k), ap: [0, 1, 1, -1][d], aq: [1, 2, 1, 2][d] };
    }
    const q = fam === "45" ? 4 : fam === "30" ? 6 : 3;
    const reT = fam === "30" ? `${K}\\sqrt{3}` : String(k), imT = fam === "60" ? `${K}\\sqrt{3}\\,i` : `${K}i`;
    const re = sx * k * (fam === "30" ? s3 : 1), im = sy * k * (fam === "60" ? s3 : 1);
    return {
      z: [re, im], tex: `${sx < 0 ? "-" : ""}${reT} ${sy < 0 ? "-" : "+"} ${imT}`,
      mod: fam === "45" ? k * Math.SQRT2 : 2 * k, modTex: fam === "45" ? `${K}\\sqrt{2}` : String(2 * k),
      ap: (sy > 0 ? 1 : -1) * (sx > 0 ? 1 : q - 1), aq: q
    };
  };
})();

/* =====================================================================
 *  UNIDAD 1 · NÚMEROS COMPLEJOS: ÁLGEBRA, FORMA POLAR, RAÍCES Y REGIONES
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, Z = E.c3, dn = Z.dn, pif = Z.pif;
  const T = {};
  const far = (v, ans) => Math.abs(v - ans) > 0.03 * Math.max(1, Math.abs(ans));

  T["c3-algebra-cx"] = {
    type: "complex", concepts: ["c3-algebra"], difficulty: 1,
    generate(r) {
      const z = [r.nz(-5, 5), r.nz(-5, 5)], w = [r.nz(-4, 4), r.nz(-4, 4)], op = r.pick(["mul", "div"]);
      const n2 = w[0] * w[0] + w[1] * w[1], num = Z.mul(z, op === "mul" ? w : Z.conj(w));
      const res = op === "mul" ? num : [num[0] / n2, num[1] / n2];
      const tx = k => (op === "mul" ? String(num[k]) : H.frac(num[k], n2));
      // camino independiente: en forma polar los módulos se multiplican (o dividen) y los argumentos se suman (o restan)
      const pol = () => Z.polar(op === "mul" ? Z.abs(z) * Z.abs(w) : Z.abs(z) / Z.abs(w), Z.arg(z) + (op === "mul" ? 1 : -1) * Z.arg(w));
      const bad = op === "mul" ? z[0] * w[0] + z[1] * w[1] : num[0];
      return {
        prompt: `Sean $z = ${Z.tex(z)}$ y $w = ${Z.tex(w)}$. Calculá $${op === "mul" ? "z\\,w" : "\\dfrac{z}{w}"}$.`,
        answer: res, answerTex: Z.cfrac(num, op === "mul" ? 1 : n2),
        traps: [{ value: op === "mul" ? [bad, res[1]] : num, msg: op === "mul" ? "Ojo con $i^2 = -1$: el producto de las partes imaginarias entra **restando** en la parte real." : "Falta dividir por $|w|^2 = w\\,\\bar w$, que es lo que queda en el denominador." }].filter(t => Z.abs(Z.sub(t.value, res)) > 0.03 * Math.max(1, Z.abs(res))),
        // verificación: en forma polar los módulos se multiplican (o dividen) y los argumentos se suman (o restan)
        verify: { kind: "cvalue", fn: pol },
        solution: op === "mul" ? [
          `Se distribuye como con binomios y se usa $i^2 = -1$ ([[c3-complejos|álgebra de complejos]]): $(a + bi)(c + di) = (ac - bd) + (ad + bc)i$.`,
          `Parte real: $${H.par(z[0])}\\cdot${H.par(w[0])} - ${H.par(z[1])}\\cdot${H.par(w[1])} = ${num[0]}$. Parte imaginaria: $${H.par(z[0])}\\cdot${H.par(w[1])} + ${H.par(z[1])}\\cdot${H.par(w[0])} = ${num[1]}$.`,
          `$z\\,w = ${Z.tex(num)}$.`
        ] : [
          `Se multiplica arriba y abajo por el [[c3-complejos|conjugado]] del denominador: $\\dfrac zw = \\dfrac{z\\,\\bar w}{w\\,\\bar w} = \\dfrac{z\\,\\bar w}{|w|^2}$.`,
          `$z\\,\\bar w = (${Z.tex(z)})(${Z.tex(Z.conj(w))}) = ${Z.tex(num)}$ y $|w|^2 = ${w[0] * w[0]} + ${w[1] * w[1]} = ${n2}$.`,
          `$\\dfrac zw = ${tx(0)} ${num[1] < 0 ? "-" : "+"} ${H.frac(Math.abs(num[1]), n2)}\\,i$.`
        ]
      };
    }
  };

  T["c3-modarg-num"] = {
    type: "numeric", concepts: ["c3-polar"], difficulty: 1,
    generate(r) {
      const N = Z.nice(r), ask = r.pick(["mod", "arg", "arg"]), z = N.z;
      const ans = ask === "mod" ? N.mod : N.ap * Math.PI / N.aq;
      return {
        prompt: ask === "mod" ? `Calculá el módulo de $z = ${N.tex}$.` : `Calculá el argumento principal $\\operatorname{Arg} z$ de $z = ${N.tex}$ (en radianes, con $-\\pi < \\operatorname{Arg} z \\le \\pi$).`,
        answer: ans, answerTex: ask === "mod" ? N.modTex : pif(N.ap, N.aq),
        traps: ask === "arg" && z[0] < 0 && z[1] !== 0 ? [{ value: Math.atan(z[1] / z[0]), msg: "$\\arctan\\frac yx$ solo da el argumento si $x > 0$. Con $x < 0$ el punto está en el segundo o el tercer cuadrante: hay que sumar o restar $\\pi$." }] : [],
        solution: ask === "mod" ? [`$|z| = \\sqrt{x^2 + y^2} = \\sqrt{${dn(z[0] * z[0])} + ${dn(z[1] * z[1])}} = ${N.modTex}$ ([[c3-complejos|módulo]]).`]
          : [`Ubicá el punto $(${dn(z[0])};\\ ${dn(z[1])})$ en el plano: ${z[1] === 0 ? (z[0] > 0 ? "está sobre el semieje real positivo" : "está sobre el semieje real negativo") : z[0] === 0 ? "está sobre el eje imaginario" : `está en el ${z[0] > 0 ? (z[1] > 0 ? "primer" : "cuarto") : z[1] > 0 ? "segundo" : "tercer"} cuadrante`}.`,
            `El [[c3-polar|argumento principal]] es el ángulo que forma con el semieje real positivo, medido entre $-\\pi$ y $\\pi$: $\\operatorname{Arg} z = ${pif(N.ap, N.aq)}$.`],
        // verificación: al girar z en −Arg z tiene que quedar sobre el semieje real positivo; el módulo sale de z·z̄
        verify: ask === "mod" ? { kind: "value", fn: () => Math.sqrt(Z.mul(z, Z.conj(z))[0]) }
          : { kind: "zero", fn: a => { const w = Z.mul(z, Z.polar(1, -a)); return [w[1], Math.min(0, w[0]), Math.max(0, Math.abs(a) - Math.PI)]; } }
      };
    }
  };

  T["c3-moivre-num"] = {
    type: "numeric", concepts: ["c3-polar"], difficulty: 2,
    generate(r) {
      const N = Z.nice(r, 1, ["45", "30", "60"]), n = r.int(3, 10), ask = r.pick(["real", "imaginaria"]);
      const rho = N.mod ** n, ang = n * N.ap * Math.PI / N.aq, res = Z.polar(rho, ang), ans = ask === "real" ? res[0] : res[1];
      return {
        prompt: `Calculá la parte ${ask} de $\\left(${N.tex}\\right)^{${n}}$.`,
        answer: Math.abs(ans) < 1e-9 ? 0 : ans,
        traps: [{ value: ask === "real" ? N.z[0] ** n : N.z[1] ** n, msg: "No se eleva cada parte por separado: $(a + bi)^n \\ne a^n + b^n i$. Pasá a forma polar." }].filter(t => far(t.value, ans)),
        solution: [`En [[c3-polar|forma polar]]: $|z| = ${N.modTex}$ y $\\operatorname{Arg} z = ${pif(N.ap, N.aq)}$.`,
          `Fórmula de De Moivre: $z^n = |z|^n\\left(\\cos n\\theta + i\\sin n\\theta\\right)$. Acá $|z|^{${n}} = ${dn(rho)}$ y $n\\theta = ${pif(n * N.ap, N.aq)}$.`,
          `$z^{${n}} = ${dn(rho)}\\left(\\cos ${pif(n * N.ap, N.aq)} + i\\sin ${pif(n * N.ap, N.aq)}\\right) \\approx ${Z.tex(res)}$, así que la parte ${ask} es $${dn(ans)}$.`],
        // verificación: se multiplica z por sí mismo n veces en forma binómica
        verify: { kind: "value", tol: 1e-9, fn: () => Z.ipow(N.z, n)[ask === "real" ? 0 : 1] }
      };
    }
  };

  T["c3-raices-multi"] = {
    type: "multi", concepts: ["c3-raices"], difficulty: 2,
    generate(r) {
      const n = r.pick([2, 3, 4]), rho = r.int(1, 3), Rm = rho ** n, s3 = Math.sqrt(3);
      const fam = Rm % 2 === 0 ? r.pick(["eje", "eje", "60", "30"]) : "eje";
      let z0, tex, ap, aq;
      if (fam === "eje") {
        const d = r.int(0, 3), K = Rm === 1 ? "" : String(Rm);
        z0 = [[Rm, 0], [0, Rm], [-Rm, 0], [0, -Rm]][d]; tex = [`${Rm}`, `${K}i`, `-${Rm}`, `-${K}i`][d]; ap = [0, 1, 1, -1][d]; aq = [1, 2, 1, 2][d];
      } else {
        const a = Rm / 2, A = a === 1 ? "" : String(a), sx = r.sign(), sy = r.sign();
        aq = fam === "60" ? 3 : 6; ap = (sy > 0 ? 1 : -1) * (sx > 0 ? 1 : aq - 1);
        z0 = fam === "60" ? [sx * a, sy * a * s3] : [sx * a * s3, sy * a];
        tex = fam === "60" ? `${sx * a} ${sy < 0 ? "-" : "+"} ${A}\\sqrt{3}\\,i` : `${sx < 0 ? "-" : ""}${A}\\sqrt{3} ${sy < 0 ? "-" : "+"} ${A}i`;
      }
      const th = ap * Math.PI / aq, angs = Array.from({ length: n }, (_, k) => (th + 2 * Math.PI * k) / n);
      if (angs.some(a => Math.abs(Math.cos(a)) < 1e-9)) return null;
      const cnt = angs.filter(a => Math.cos(a) > 0).length;
      const names = { 2: "cuadradas", 3: "cúbicas", 4: "cuartas" };
      return {
        prompt: `Considerá las raíces ${names[n]} de $z_0 = ${tex}$, es decir, las soluciones de $w^{${n}} = z_0$.`,
        parts: [
          { q: "¿Qué módulo tienen todas ellas?", type: "numeric", answer: rho,
            traps: [{ value: Rm / n, msg: "El módulo no se divide por $n$: se le saca la raíz $n$-ésima. Lo que se divide por $n$ es el argumento." }].filter(t => far(t.value, rho)),
            verify: { kind: "zero", fn: m => [Z.abs(Z.ipow(Z.polar(m, 0.7), n)) - Rm] } },
          { q: "¿Cuál es el argumento de la raíz principal (la que sale de $\\operatorname{Arg} z_0$)? En radianes.", type: "numeric", answer: th / n, answerTex: pif(ap, aq * n),
            // verificación: esa raíz, multiplicada n veces por sí misma, tiene que dar z0
            verify: { kind: "zero", tol: 1e-8, scale: Rm, fn: a => { const w = Z.ipow(Z.polar(rho, a), n); return [w[0] - z0[0], w[1] - z0[1], Math.max(0, Math.abs(a) - Math.PI / n)]; } } },
          { q: `De las $${n}$ raíces, ¿cuántas tienen parte real positiva?`, type: "numeric", answer: cnt,
            // verificación: se buscan las raíces del polinomio wⁿ − z0 por Durand-Kerner y se cuentan
            verify: { kind: "value", fn: () => Z.roots([[1, 0], ...Array.from({ length: n - 1 }, () => [0, 0]), Z.sc(-1, z0)]).filter(w => w[0] > 0).length } }
        ],
        solution: [
          `$|z_0| = ${Rm}$ y $\\operatorname{Arg} z_0 = ${pif(ap, aq)}$. Las [[c3-raices|raíces n-ésimas]] son $w_k = \\sqrt[n]{|z_0|}\\;e^{i(\\theta + 2k\\pi)/n}$, con $k = 0, 1, \\dots, n - 1$.`,
          `Módulo: $\\sqrt[${n}]{${Rm}} = ${rho}$. La raíz principal ($k = 0$) tiene argumento $\\dfrac{\\theta}{${n}} = ${pif(ap, aq * n)}$.`,
          `Las demás se obtienen girando de a $\\dfrac{2\\pi}{${n}}$: sus argumentos son ${angs.map((a, k) => `$${pif(ap + 2 * k * aq, aq * n)}$`).join(", ")}. Son los vértices de un polígono regular de $${n}$ lados${n === 2 ? " (acá, dos puntos opuestos)" : ""}.`,
          `Tienen parte real positiva las que tienen coseno positivo: ${cnt === 0 ? "ninguna" : cnt === 1 ? "una sola" : `$${cnt}$`}.`
        ]
      };
    }
  };

  // conjuntos del plano: pertenencia, puntos de la frontera (para decidir si es abierto o cerrado) y texto
  const SETS = [
    r => { const a = r.int(-3, 3), b = r.nz(-3, 3), Rr = r.int(1, 4), z0 = Z.tex([a, b]); return { tex: `|z - (${z0})| < ${Rr}`, inS: (x, y) => Math.hypot(x - a, y - b) < Rr, bd: t => [a + Rr * Math.cos(t), b + Rr * Math.sin(t)], desc: `un disco sin su borde` }; },
    r => { const a = r.nz(-3, 3), b = r.int(-3, 3), Rr = r.int(1, 4), z0 = Z.tex([a, b]); return { tex: `|z - (${z0})| \\le ${Rr}`, inS: (x, y) => Math.hypot(x - a, y - b) <= Rr * (1 + 1e-12), bd: t => [a + Rr * Math.cos(t), b + Rr * Math.sin(t)], desc: `un disco con su borde` }; },
    r => { const a = r.int(-4, 4); return { tex: `\\operatorname{Re} z > ${a}`, inS: x => x > a, bd: t => [a, 5 * Math.tan(t / 2.1 - 0.7)], desc: `un semiplano sin la recta que lo limita` }; },
    r => { const a = r.int(-4, 4); return { tex: `\\operatorname{Im} z \\ge ${a}`, inS: (x, y) => y >= a, bd: t => [5 * Math.tan(t / 2.1 - 0.7), a], desc: `un semiplano con la recta que lo limita` }; },
    r => { const a = r.int(1, 3), b = a + r.int(1, 3); return { tex: `${a} < |z| \\le ${b}`, inS: (x, y) => Math.hypot(x, y) > a && Math.hypot(x, y) <= b * (1 + 1e-12), bd: t => (t < Math.PI ? [a * Math.cos(2 * t), a * Math.sin(2 * t)] : [b * Math.cos(2 * t), b * Math.sin(2 * t)]), desc: `un anillo que incluye la circunferencia de afuera pero no la de adentro` }; },
    r => { const a = r.int(1, 5); return { tex: `|z| > ${a}`, inS: (x, y) => Math.hypot(x, y) > a, bd: t => [a * Math.cos(t), a * Math.sin(t)], desc: `el exterior de un disco, sin la circunferencia` }; },
    r => { const a = r.int(1, 5); return { tex: `0 < |z| < ${a}`, inS: (x, y) => Math.hypot(x, y) > 0 && Math.hypot(x, y) < a, bd: t => (t < 0.5 ? [0, 0] : [a * Math.cos(t), a * Math.sin(t)]), desc: `un disco pinchado: sin su borde y sin el centro` }; }
  ];
  T["c3-conjunto-vf"] = {
    type: "tf", concepts: ["c3-regiones"], difficulty: 1,
    generate(r) {
      const S = r.pick(SETS)(r), prop = r.pick(["abierto", "cerrado", "acotado"]);
      const ts = Array.from({ length: 60 }, (_, k) => 0.05 + k * (2 * Math.PI - 0.1) / 59), bd = ts.map(S.bd);
      const far8 = ts.some(t => S.inS(1e3 * Math.cos(t), 1e3 * Math.sin(t)));
      const val = { abierto: bd.every(p => !S.inS(...p)), cerrado: bd.every(p => S.inS(...p)), acotado: !far8 }[prop];
      const why = { abierto: val ? "ningún punto de la frontera pertenece al conjunto" : "hay puntos de la frontera que pertenecen al conjunto, y ningún entorno de ellos queda adentro",
        cerrado: val ? "contiene a todos los puntos de su frontera" : "hay puntos de la frontera que no pertenecen al conjunto", acotado: val ? "entra en un disco $|z| < M$" : "tiene puntos tan lejos del origen como se quiera" }[prop];
      return {
        prompt: `<b>Verdadero o falso:</b> el conjunto de los $z$ que cumplen $${S.tex}$ es ${prop}.`,
        answer: val,
        explanation: `Es ${S.desc}. ${val ? "Sí" : "No"} es ${prop}: ${why} ([[c3-regiones|conjuntos del plano]]).`,
        solution: [`Un conjunto es abierto si no contiene ningún punto de su frontera, cerrado si los contiene a todos, y acotado si entra en algún disco.`],
        // verificación: se mira si entornos chicos de los puntos de la frontera quedan dentro o fuera, y si hay puntos lejanos
        verify: { kind: "truth", fn: () => {
          if (prop === "acotado") return ![50, 400, 3e4].some(M => ts.some(t => S.inS(M * Math.cos(t), M * Math.sin(t))));
          // un punto p de la frontera tiene, tan cerca como se quiera, puntos del conjunto y puntos de afuera
          const isBd = p => { let i = 0, o = 0; for (let k = 0; k < 16; k++) { const q = [p[0] + 1e-6 * Math.cos(k * 0.39 + 0.1), p[1] + 1e-6 * Math.sin(k * 0.39 + 0.1)]; S.inS(...q) ? i++ : o++; } return i > 0 && o > 0; };
          const pts = bd.filter(isBd);
          return prop === "abierto" ? pts.every(p => !S.inS(...p)) : pts.every(p => S.inS(...p));
        } }
      };
    }
  };

  T["c3-lugar-mc"] = {
    type: "mc", concepts: ["c3-regiones"], difficulty: 2,
    generate(r) {
      const z1 = [r.int(-4, 4), r.int(-4, 4)], kind = r.pick(["circ", "med", "circ"]);
      let z2 = [r.int(-4, 4), r.int(-4, 4)];
      if (z2[0] === z1[0] && z2[1] === z1[1]) z2 = [z1[0] + 2, z1[1] - 1];
      const Rr = r.int(1, 5), P = p => `$(${p[0]};\\ ${p[1]})$`;
      let ok, bads, test;
      if (kind === "circ") {
        ok = `La circunferencia de centro ${P(z1)} y radio $${Rr}$`;
        bads = [`La circunferencia de centro ${P(Z.sc(-1, z1))} y radio $${Rr}$`, `El disco de centro ${P(z1)} y radio $${Rr}$, con su interior`, `La circunferencia de centro ${P(z1)} y radio $${Rr * Rr}$`, `La recta que pasa por ${P(z1)} con pendiente $${Rr}$`];
        if (z1[0] === 0 && z1[1] === 0) bads.shift();
        if (Rr === 1) bads = bads.filter(b => !b.includes(`radio $${Rr * Rr}$`) || b.includes("disco") || b.includes(P(Z.sc(-1, z1))));
        test = () => [0.3, 1.7, 4].every(t => Math.abs(Z.abs(Z.sub(Z.add(z1, Z.polar(Rr, t)), z1)) - Rr) < 1e-12);
      } else {
        const mid = [(z1[0] + z2[0]) / 2, (z1[1] + z2[1]) / 2];
        ok = `La mediatriz del segmento que une ${P(z1)} con ${P(z2)}`;
        bads = [`La recta que pasa por ${P(z1)} y ${P(z2)}`, `La circunferencia que tiene a ${P(z1)} y ${P(z2)} como extremos de un diámetro`, `El punto medio entre ${P(z1)} y ${P(z2)}, solamente`];
        // puntos de la mediatriz: el punto medio más un múltiplo de la dirección perpendicular
        test = () => [-2, 0.5, 3].every(t => { const p = [mid[0] - t * (z2[1] - z1[1]), mid[1] + t * (z2[0] - z1[0])]; return Math.abs(Z.abs(Z.sub(p, z1)) - Z.abs(Z.sub(p, z2))) < 1e-9; });
      }
      return {
        prompt: kind === "circ" ? `¿Qué conjunto del plano describe la ecuación $|z - (${Z.tex(z1)})| = ${Rr}$?` : `¿Qué conjunto del plano describe la ecuación $|z - (${Z.tex(z1)})| = |z - (${Z.tex(z2)})|$?`,
        ...H.mc(r, ok, bads.slice(0, 3), { text: true }),
        solution: [`$|z - z_0|$ es la **distancia** entre $z$ y $z_0$ ([[c3-complejos|módulo]]).`,
          kind === "circ" ? `La ecuación pide los puntos que están a distancia $${Rr}$ de $z_0 = ${Z.tex(z1)}$: una circunferencia con ese centro y ese radio.` : `La ecuación pide los puntos que están a la misma distancia de $${Z.tex(z1)}$ que de $${Z.tex(z2)}$: la mediatriz del segmento que los une.`],
        // verificación: se toman puntos del lugar geométrico y se comprueba la ecuación con aritmética compleja
        verify: { kind: "truth", target: true, fn: test }
      };
    }
  };

  const cards = {
    "c3-complejos": {
      title: "Álgebra de los números complejos: conjugado y módulo", aliases: ["conjugado complejo", "módulo de un complejo", "unidad imaginaria", "desigualdad triangular compleja"], concepts: ["c3-algebra"],
      summary: "z = x + iy con i² = −1. El conjugado es z̄ = x − iy y el módulo |z| = √(x² + y²), con z·z̄ = |z|². Para dividir se multiplica por el conjugado del denominador. |z − w| es la distancia entre z y w.",
      def: [R`Un [[numeros-complejos|número complejo]] es $z = x + iy$, con $x = \operatorname{Re} z$, $y = \operatorname{Im} z$ reales e $i^2 = -1$. Se suma componente a componente y se multiplica distribuyendo: $$(a + bi)(c + di) = (ac - bd) + (ad + bc)\,i.$$`,
        R`El **conjugado** de $z$ es $\bar z = x - iy$ (su reflejo respecto del eje real) y el **módulo** es $|z| = \sqrt{x^2 + y^2}$ (su distancia al origen). Se relacionan por $$z\,\bar z = |z|^2.$$ Para **dividir** se multiplica arriba y abajo por el conjugado del denominador: $\dfrac zw = \dfrac{z\,\bar w}{|w|^2}$.`,
        R`**Propiedades.** $\overline{z + w} = \bar z + \bar w$, $\ \overline{zw} = \bar z\,\bar w$, $\ |zw| = |z|\,|w|$, $\ \operatorname{Re} z = \dfrac{z + \bar z}{2}$, $\ \operatorname{Im} z = \dfrac{z - \bar z}{2i}$, y la **desigualdad triangular**: $$\big|\,|z| - |w|\,\big| \le |z + w| \le |z| + |w|.$$`],
      idea: [R`Un complejo es un punto (o un vector) del plano. Sumar complejos es sumar vectores, y por eso vale la desigualdad triangular: un lado de un triángulo no supera la suma de los otros dos.`,
        R`$|z - w|$ es la **distancia** entre los puntos $z$ y $w$. Así, $|z - z_0| = R$ es una circunferencia y $|z - z_1| = |z - z_2|$ es una mediatriz, sin escribir ni una coordenada.`,
        R`A diferencia de los vectores, los complejos se pueden **multiplicar y dividir** entre sí: forman un cuerpo. Lo que se pierde es el orden: no tiene sentido decir que un complejo es mayor que otro.`],
      demo: [R`**Paso 1 ($z\bar z = |z|^2$).** $(x + iy)(x - iy) = x^2 - (iy)^2 = x^2 + y^2$, porque es una diferencia de cuadrados e $i^2 = -1$.`,
        R`**Paso 2 (el conjugado respeta el producto).** Con $z = a + bi$, $w = c + di$: $\bar z\,\bar w = (a - bi)(c - di) = (ac - bd) - (ad + bc)i$, que es justo el conjugado de $zw$.`,
        R`**Paso 3 ($|zw| = |z||w|$).** Por los pasos 1 y 2, $|zw|^2 = zw\,\overline{zw} = z\bar z\,w\bar w = |z|^2|w|^2$. Como los módulos no son negativos, se saca la raíz.`,
        R`**Paso 4 (desigualdad triangular).** $|z + w|^2 = (z + w)(\bar z + \bar w) = |z|^2 + |w|^2 + (z\bar w + \overline{z\bar w}) = |z|^2 + |w|^2 + 2\operatorname{Re}(z\bar w)$. La parte real de un número no supera su módulo, así que $2\operatorname{Re}(z\bar w) \le 2|z\bar w| = 2|z||w|$, y queda $|z + w|^2 \le (|z| + |w|)^2$.`,
        R`**Paso 5 (la cota de abajo).** Aplicando el paso 4 a $z = (z + w) + (-w)$: $|z| \le |z + w| + |w|$, o sea $|z| - |w| \le |z + w|$. Intercambiando los papeles de $z$ y $w$ sale la otra mitad. $\blacksquare$`],
      examples: [{ q: R`Escribí $\dfrac{3 + 2i}{1 - i}$ como $a + bi$.`, steps: [R`Se multiplica por el conjugado del denominador, $1 + i$: el numerador queda $(3 + 2i)(1 + i) = 3 + 3i + 2i + 2i^2 = 1 + 5i$.`, R`El denominador queda $|1 - i|^2 = 2$. Resultado: $\dfrac12 + \dfrac52\,i$.`] },
        { q: R`Acotá $|z^2 + 3|$ sobre la circunferencia $|z| = 2$.`, steps: [R`Por la desigualdad triangular, $|z^2 + 3| \le |z|^2 + 3 = 7$ y $|z^2 + 3| \ge \big||z|^2 - 3\big| = 1$.`] }],
      tips: [R`$|z|^2$ **no** es $z^2$: $z^2$ es un complejo y $|z|^2 = z\bar z$ es un real no negativo. Solo coinciden si $z$ es real.`, R`La parte imaginaria de $x + iy$ es $y$ (un número real), no $iy$.`],
      see: ["numeros-complejos", "c3-polar", "c3-regiones"]
    },
    "c3-polar": {
      title: "Forma polar y exponencial: argumento, Euler y De Moivre", aliases: ["forma exponencial", "argumento principal", "argumento de un complejo", "fórmula de De Moivre", "De Moivre"], concepts: ["c3-polar"],
      summary: "z = r(cos θ + i sen θ) = r e^(iθ), con r = |z| y θ un argumento. Arg z es el argumento en (−π, π]. Al multiplicar se multiplican los módulos y se suman los argumentos; por eso zⁿ = rⁿ e^(inθ).",
      def: [R`Todo $z \ne 0$ se escribe en **forma polar**: $$z = r(\cos\theta + i\sin\theta),\qquad r = |z|.$$ El ángulo $\theta$ es un **argumento** de $z$, y está definido salvo múltiplos de $2\pi$: $\arg z$ es el conjunto de todos ellos. El **argumento principal** $\operatorname{Arg} z$ es el único que cumple $-\pi < \theta \le \pi$.`,
        R`Con la notación $e^{i\theta} = \cos\theta + i\sin\theta$ (**fórmula de Euler**) queda la **forma exponencial** $z = r\,e^{i\theta}$.`,
        R`**Producto y cociente.** Si $z = r\,e^{i\theta}$ y $w = s\,e^{i\varphi}$, $$zw = rs\,e^{i(\theta + \varphi)},\qquad \frac zw = \frac rs\,e^{i(\theta - \varphi)}.$$ **Fórmula de De Moivre:** $z^n = r^n e^{in\theta}$ para todo entero $n$.`],
      idea: [R`Multiplicar por $w = s\,e^{i\varphi}$ es **estirar** en un factor $s$ y **girar** un ángulo $\varphi$. Por ejemplo, multiplicar por $i = e^{i\pi/2}$ es girar un cuarto de vuelta: por eso $i^2 = -1$ (media vuelta).`,
        R`Para potencias y raíces conviene la forma polar; para sumas y restas, la binómica.`,
        R`$\arg(zw) = \arg z + \arg w$ vale como igualdad **entre conjuntos**. Con el argumento principal puede fallar: $\operatorname{Arg}(-1) + \operatorname{Arg}(i) = \frac{3\pi}{2}$, pero $\operatorname{Arg}(-i) = -\frac{\pi}{2}$. Difieren en $2\pi$.`],
      demo: [R`**Paso 1 (producto).** Se multiplican las formas polares: $(\cos\theta + i\sin\theta)(\cos\varphi + i\sin\varphi) = (\cos\theta\cos\varphi - \sin\theta\sin\varphi) + i(\sin\theta\cos\varphi + \cos\theta\sin\varphi)$.`,
        R`**Paso 2 (identidades).** Por las fórmulas del coseno y el seno de una suma ([[identidades-trig|identidades trigonométricas]]), eso es $\cos(\theta + \varphi) + i\sin(\theta + \varphi)$. Los módulos se multiplican porque $|zw| = |z||w|$.`,
        R`**Paso 3 (De Moivre, $n \ge 0$).** Por inducción: para $n = 0$ es $1 = 1$. Si $z^n = r^n e^{in\theta}$, entonces por el paso 2, $z^{n+1} = z^n z = r^n r\,e^{i(n\theta + \theta)} = r^{n+1}e^{i(n+1)\theta}$.`,
        R`**Paso 4 (exponentes negativos).** $\dfrac1z = \dfrac{\bar z}{|z|^2} = \dfrac{r\,e^{-i\theta}}{r^2} = r^{-1}e^{-i\theta}$, porque conjugar cambia el signo del ángulo. Aplicando el paso 3 a $\frac1z$ sale $z^{-n} = r^{-n}e^{-in\theta}$. $\blacksquare$`],
      examples: [{ q: R`Calculá $(1 + i)^{10}$.`, steps: [R`$|1 + i| = \sqrt2$ y $\operatorname{Arg}(1 + i) = \frac\pi4$.`, R`$(1 + i)^{10} = (\sqrt2)^{10}e^{i10\pi/4} = 32\,e^{i5\pi/2} = 32\,e^{i\pi/2} = 32i$.`] }],
      tips: [R`$\arctan\frac yx$ da el argumento solo si $x > 0$. En el segundo y el tercer cuadrante hay que sumar o restar $\pi$: mirá siempre en qué cuadrante está el punto.`, R`El argumento de $0$ no está definido.`],
      see: ["numeros-complejos", "c3-complejos", "c3-raices", "identidades-trig"]
    },
    "c3-raices": {
      title: "Raíces n-ésimas de un complejo", aliases: ["raíces n-ésimas", "raíz n-ésima", "raíces de la unidad", "raíz principal"], concepts: ["c3-raices"],
      summary: "Todo z₀ ≠ 0 tiene exactamente n raíces n-ésimas: wₖ = ⁿ√r · e^(i(θ + 2kπ)/n), k = 0, …, n − 1. Son los vértices de un polígono regular de n lados centrado en el origen.",
      def: [R`Si $z_0 = r\,e^{i\theta} \ne 0$, las soluciones de $w^n = z_0$ son exactamente $n$: $$w_k = \sqrt[n]{r}\;e^{i(\theta + 2k\pi)/n},\qquad k = 0, 1, \dots, n - 1.$$ Con $\theta = \operatorname{Arg} z_0$ y $k = 0$ se obtiene la **raíz principal**.`,
        R`Las **raíces n-ésimas de la unidad** son $\omega^k$ con $\omega = e^{2\pi i/n}$. Si $w_0$ es una raíz de $z_0$, las demás son $w_0\,\omega^k$.`],
      idea: [R`Elevar a la $n$ multiplica el ángulo por $n$. Entonces hay $n$ ángulos distintos que, multiplicados por $n$, caen en el mismo lugar: los que difieren en $\frac{2\pi}{n}$. Por eso las raíces quedan repartidas en una circunferencia de radio $\sqrt[n]{r}$, formando un polígono regular.`,
        R`La suma de las $n$ raíces es cero (para $n \ge 2$): el centro del polígono es el origen.`],
      demo: [R`**Paso 1 (planteo en polares).** Se busca $w = \rho\,e^{i\varphi}$ con $w^n = z_0$. Por [[c3-polar|De Moivre]], $\rho^n e^{in\varphi} = r\,e^{i\theta}$.`,
        R`**Paso 2 (igualdad de complejos en polares).** Dos complejos no nulos son iguales si tienen el mismo módulo y sus argumentos difieren en un múltiplo de $2\pi$: $\rho^n = r$ y $n\varphi = \theta + 2k\pi$ con $k$ entero.`,
        R`**Paso 3 (despejar).** $\rho = \sqrt[n]{r}$ (la raíz real positiva, que es única) y $\varphi = \dfrac{\theta + 2k\pi}{n}$.`,
        R`**Paso 4 (cuántas hay).** Los valores $k = 0, \dots, n - 1$ dan ángulos distintos dentro de una misma vuelta, así que son $n$ puntos distintos. Con $k + n$ el ángulo aumenta en $2\pi$ y se repite el mismo punto. $\blacksquare$`],
      examples: [{ q: R`Hallá las raíces cúbicas de $-8$.`, steps: [R`$-8 = 8\,e^{i\pi}$. Módulo de las raíces: $\sqrt[3]8 = 2$. Argumentos: $\frac\pi3$, $\pi$ y $\frac{5\pi}3$.`, R`$w_0 = 2e^{i\pi/3} = 1 + \sqrt3\,i$, $\ w_1 = -2$, $\ w_2 = 1 - \sqrt3\,i$.`] }],
      tips: [R`El módulo lleva raíz $n$-ésima; el argumento se **divide** por $n$. No al revés.`, R`En los complejos, $\sqrt[n]{z}$ nombra $n$ valores. Si se quiere uno solo hay que decir cuál (por ejemplo, la raíz principal).`],
      see: ["c3-polar", "c3-complejos"]
    },
    "c3-regiones": {
      title: "Conjuntos del plano complejo: entornos, abiertos, cerrados y dominios", aliases: ["entorno", "conjunto abierto", "conjunto cerrado", "punto frontera", "dominio (plano complejo)", "conjunto conexo", "conjunto acotado"], concepts: ["c3-regiones"],
      summary: "Un entorno de z₀ es un disco |z − z₀| < ε. Abierto: no contiene puntos de su frontera. Cerrado: los contiene a todos. Dominio: abierto y conexo. Acotado: entra en un disco.",
      def: [R`Un **entorno** de $z_0$ es un disco abierto $|z - z_0| < \varepsilon$; el **entorno reducido** $0 < |z - z_0| < \varepsilon$ no incluye al centro.`,
        R`Respecto de un conjunto $S$, un punto $z_0$ es **interior** si algún entorno suyo está contenido en $S$; **exterior** si algún entorno no toca a $S$; y **frontera** en otro caso (todo entorno tiene puntos de $S$ y puntos de afuera).`,
        R`$S$ es **abierto** si no contiene ningún punto de su frontera (todos sus puntos son interiores); **cerrado** si contiene a toda su frontera; **acotado** si está dentro de algún disco $|z| < M$; **conexo** si dos puntos cualesquiera de $S$ se pueden unir con una poligonal contenida en $S$. Un **dominio** es un abierto conexo, y una **región** es un dominio con algunos, todos o ninguno de sus puntos frontera.`],
      idea: [R`Las definiciones de límite, continuidad y derivada compleja piden acercarse a $z_0$ **desde todas las direcciones**. Por eso las funciones se estudian en dominios: alrededor de cada punto hay lugar para moverse.`,
        R`«Abierto» y «cerrado» no son opuestos: el anillo $1 < |z| \le 2$ no es ninguna de las dos cosas, y el plano entero es las dos.`,
        R`Regla práctica: las desigualdades estrictas ($<$, $>$) sobre funciones continuas dan abiertos; las no estrictas ($\le$, $\ge$) y las igualdades dan cerrados.`],
      examples: [{ q: R`¿Es un dominio el conjunto $\operatorname{Re} z \ne 0$?`, steps: [R`Es abierto (es la unión de dos semiplanos abiertos), pero no es conexo: para ir de $-1$ a $1$ hay que cruzar el eje imaginario. No es un dominio.`] },
        { q: R`Clasificá $0 < |z| < 1$.`, steps: [R`Es abierto y conexo: es un dominio (el disco pinchado). Su frontera es la circunferencia $|z| = 1$ junto con el punto $0$; como no los contiene, no es cerrado. Es acotado.`] }],
      see: ["c3-complejos"]
    }
  };

  E.extendCourse("m103", {
    concepts: { "c3-algebra": { name: "Álgebra de complejos" }, "c3-polar": { name: "Forma polar y De Moivre" }, "c3-raices": { name: "Raíces n-ésimas" }, "c3-regiones": { name: "Conjuntos del plano" } },
    templates: T,
    units: [{
      id: "c3-complejos-u", order: 1, program: "Unidad 1", title: "Números complejos", icon: "rotate-ccw",
      diagnostic: ["c3-algebra-cx", "c3-moivre-num", "c3-raices-multi"],
      lessons: [
        { id: "c3-algebra", title: "Álgebra, conjugado y módulo", templates: ["c3-algebra-cx", "c3-lugar-mc"], theory: ["c3-complejos"],
          intro: R`$z\,\bar z = |z|^2$, y $|z - w|$ es la distancia entre $z$ y $w$. Para dividir, multiplicá por el conjugado del denominador.` },
        { id: "c3-polar", title: "Forma polar y De Moivre", templates: ["c3-modarg-num", "c3-moivre-num"], theory: ["c3-polar"],
          intro: R`$z = r\,e^{i\theta}$. Al multiplicar se multiplican los módulos y se suman los argumentos: $z^n = r^n e^{in\theta}$.` },
        { id: "c3-raices", title: "Raíces n-ésimas", templates: ["c3-raices-multi"], theory: ["c3-raices"],
          intro: R`$w^n = z_0$ tiene $n$ soluciones: módulo $\sqrt[n]{|z_0|}$ y argumentos $\frac{\theta + 2k\pi}{n}$.` },
        { id: "c3-regiones", title: "Conjuntos del plano", templates: ["c3-conjunto-vf"], theory: ["c3-regiones"],
          intro: R`Abierto: sin puntos de su frontera. Cerrado: con toda su frontera. Dominio: abierto y conexo.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 2 · FUNCIONES ANALÍTICAS: LÍMITES, DERIVADA, CAUCHY-RIEMANN Y ARMÓNICAS
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, Z = E.c3, dn = Z.dn;
  const T = {};
  const simpson = (f, a, b, n = 200) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3; };
  const dx = (f, x, y, h = 1e-5) => (f(x + h, y) - f(x - h, y)) / (2 * h), dy = (f, x, y, h = 1e-5) => (f(x, y + h) - f(x, y - h)) / (2 * h);

  T["c3-uv-multi"] = {
    type: "multi", concepts: ["c3-limite"], difficulty: 1,
    generate(r) {
      const a = r.nz(-4, 4), b = r.nz(-5, 5), form = r.int(0, 3);
      if (form === 2 && b === -1) return null;
      const x2 = { m: "x^2", t: "x^{2}" }, y2 = { m: "y^2", t: "y^{2}" }, xy = { m: "x*y", t: "xy" }, X = { m: "x", t: "x" }, Y = { m: "y", t: "y" };
      const F = [
        { tex: `${H.cf(a)}z^2 ${b < 0 ? "-" : "+"} ${H.cf(Math.abs(b))}\\bar z`, f: z => Z.add(Z.sc(a, Z.mul(z, z)), Z.sc(b, Z.conj(z))), u: [{ p: a, ...x2 }, { p: -a, ...y2 }, { p: b, ...X }], v: [{ p: 2 * a, ...xy }, { p: -b, ...Y }] },
        { tex: `\\bar z^{\\,2} ${b < 0 ? "-" : "+"} ${H.cf(Math.abs(b))}z`, f: z => Z.add(Z.mul(Z.conj(z), Z.conj(z)), Z.sc(b, z)), u: [{ p: 1, ...x2 }, { p: -1, ...y2 }, { p: b, ...X }], v: [{ p: -2, ...xy }, { p: b, ...Y }] },
        { tex: `${H.cf(a)}z\\,\\bar z ${b < 0 ? "-" : "+"} ${H.cf(Math.abs(b))}i\\,z`, f: z => Z.add(Z.sc(a, Z.mul(z, Z.conj(z))), Z.mul([0, b], z)), u: [{ p: a, ...x2 }, { p: a, ...y2 }, { p: -b, ...Y }], v: [{ p: b, ...X }] },
        { tex: `i\\,z^2 ${b < 0 ? "-" : "+"} ${H.cf(Math.abs(b))}\\bar z`, f: z => Z.add(Z.mul([0, 1], Z.mul(z, z)), Z.sc(b, Z.conj(z))), u: [{ p: -2, ...xy }, { p: b, ...X }], v: [{ p: 1, ...x2 }, { p: -1, ...y2 }, { p: -b, ...Y }] }
      ][form];
      const [um, ut] = H.terms(F.u), [vm, vt] = H.terms(F.v), dom = [[-2, 2], [-2, 2]];
      return {
        prompt: `Sea $f(z) = ${F.tex}$, con $z = x + iy$. Escribila como $f = u(x, y) + i\\,v(x, y)$.`,
        parts: [
          { q: "Escribí la parte real $u(x, y)$.", type: "expr", vars: ["x", "y"], domain: dom, lhs: "u(x, y) = ", answer: um, answerTex: ut,
            traps: [{ expr: vm, msg: "Esa es la parte imaginaria. La parte real junta los términos **sin** $i$." }],
            // verificación: se evalúa f con aritmética compleja y se toma la parte real
            verify: { kind: "fnEq", g: (x, y) => F.f([x, y])[0], dom } },
          { q: "Escribí la parte imaginaria $v(x, y)$ (sin la $i$).", type: "expr", vars: ["x", "y"], domain: dom, lhs: "v(x, y) = ", answer: vm, answerTex: vt,
            verify: { kind: "fnEq", g: (x, y) => F.f([x, y])[1], dom } }
        ],
        solution: [`Se reemplaza $z = x + iy$, $\\bar z = x - iy$ y se usa $z^2 = x^2 - y^2 + 2xy\\,i$, $\\ \\bar z^{\\,2} = x^2 - y^2 - 2xy\\,i$, $\\ z\\bar z = x^2 + y^2$ ([[c3-limite|funciones complejas]]).`,
          `Juntando los términos sin $i$: $u(x, y) = ${ut}$.`, `Y los que llevan $i$: $v(x, y) = ${vt}$.`]
      };
    }
  };

  const LIMS = [
    { tex: R`\dfrac{\bar z}{z}`, f: z => Z.div(Z.conj(z), z), ex: false, why: R`Por el eje real vale $1$ y por el eje imaginario vale $-1$.` },
    { tex: R`\dfrac{z^2}{|z|}`, f: z => Z.sc(1 / Z.abs(z), Z.mul(z, z)), ex: true, why: R`Su módulo es $\frac{|z|^2}{|z|} = |z| \to 0$, así que el límite es $0$.` },
    { tex: R`\dfrac{\operatorname{Re} z}{|z|}`, f: z => [z[0] / Z.abs(z), 0], ex: false, why: R`En polares vale $\cos\theta$: depende de la dirección por la que uno se acerca.` },
    { tex: R`\dfrac{|z|^2}{z}`, f: z => Z.div([Z.abs(z) ** 2, 0], z), ex: true, why: R`Como $|z|^2 = z\bar z$, la función es $\bar z$ (para $z \ne 0$), que tiende a $0$.` },
    { tex: R`\left(\dfrac{z}{\bar z}\right)^{2}`, f: z => Z.ipow(Z.div(z, Z.conj(z)), 2), ex: false, why: R`Por los dos ejes vale $1$, pero por la recta $y = x$ vale $\left(\frac{1 + i}{1 - i}\right)^2 = i^2 = -1$. Probar dos caminos no alcanza para afirmar que existe.` },
    { tex: R`\dfrac{z\operatorname{Re} z}{|z|}`, f: z => Z.sc(z[0] / Z.abs(z), z), ex: true, why: R`Su módulo es $|z|\,|\cos\theta| \le |z| \to 0$, así que el límite es $0$.` },
    { tex: R`\dfrac{(\operatorname{Re} z)(\operatorname{Im} z)}{|z|^2}`, f: z => [z[0] * z[1] / Z.abs(z) ** 2, 0], ex: false, why: R`En polares vale $\cos\theta\sin\theta$: por el eje real da $0$ y por $y = x$ da $\frac12$.` },
    { tex: R`\dfrac{(\operatorname{Im} z)^2}{|z|}`, f: z => [z[1] * z[1] / Z.abs(z), 0], ex: true, why: R`Vale $|z|\sin^2\theta$, que está entre $0$ y $|z|$: tiende a $0$.` }
  ];
  T["c3-limite-vf"] = {
    type: "tf", concepts: ["c3-limite"], difficulty: 2,
    generate(r) {
      const L = r.pick(LIMS), say = r.bool();
      return {
        prompt: `<b>Verdadero o falso:</b> el límite $\\displaystyle\\lim_{z\\to0} ${L.tex}$ ${say ? "existe" : "no existe"}.`,
        answer: say === L.ex,
        explanation: `${L.why} ${L.ex ? "El límite existe." : "El límite no existe."} En el plano, el [[c3-limite|límite]] tiene que dar lo mismo por **todos** los caminos.`,
        solution: [`Para ver que no existe alcanza con dos caminos que den distinto. Para ver que existe hay que acotar: por ejemplo, mostrar que $|f(z) - L| \\le |z|$.`],
        // verificación: se evalúa la función en 720 direcciones, a dos distancias chicas del origen, y se mira si los valores se juntan
        verify: { kind: "truth", fn: () => {
          const spread = rad => { const vs = Array.from({ length: 720 }, (_, k) => L.f(Z.polar(rad, 0.001 + k * Math.PI / 360))); return Math.max(...vs.map(v => Z.abs(Z.sub(v, vs[0])))); };
          return say === (spread(1e-4) < 1e-2 && spread(1e-7) < 1e-4);
        } }
      };
    }
  };

  T["c3-deriv-cx"] = {
    type: "complex", concepts: ["c3-derivada"], difficulty: 2,
    generate(r) {
      const form = r.pick(["pol3", "pol2", "inv"]), a = r.nz(-4, 4), b = r.nz(-4, 4);
      let z0 = [r.nz(-2, 2), r.nz(-2, 2)], tex, f, dTex, num, den = 1, steps;
      if (form === "pol3") {
        tex = `z^3 ${a < 0 ? "-" : "+"} ${H.cf(Math.abs(a))}i\\,z`; f = z => Z.add(Z.ipow(z, 3), Z.mul([0, a], z));
        dTex = `3z^2 ${a < 0 ? "-" : "+"} ${H.cf(Math.abs(a))}i`; num = Z.add(Z.sc(3, Z.mul(z0, z0)), [0, a]);
        steps = [`$z_0^2 = (${Z.tex(z0)})^2 = ${Z.tex(Z.mul(z0, z0))}$, así que $3z_0^2 = ${Z.tex(Z.sc(3, Z.mul(z0, z0)))}$.`];
      } else if (form === "pol2") {
        tex = `${H.cf(a)}z^2 ${b < 0 ? "-" : "+"} ${Math.abs(b)}z`; f = z => Z.add(Z.sc(a, Z.mul(z, z)), Z.sc(b, z));
        dTex = `${2 * a}z ${b < 0 ? "-" : "+"} ${Math.abs(b)}`; num = Z.add(Z.sc(2 * a, z0), [b, 0]);
        steps = [`$${2 * a}\\,z_0 = ${Z.tex(Z.sc(2 * a, z0))}$.`];
      } else {
        tex = `\\dfrac{${a}}{z}`; f = z => Z.div([a, 0], z); dTex = `-\\dfrac{${a}}{z^2}`.replace("--", "");
        const q = Z.mul(z0, z0); den = q[0] * q[0] + q[1] * q[1]; num = Z.sc(-a, Z.conj(q));
        steps = [`$z_0^2 = ${Z.tex(q)}$, y para dividir se multiplica por el conjugado: $\\dfrac{${-a}}{${Z.tex(q)}} = \\dfrac{${-a}\\,(${Z.tex(Z.conj(q))})}{${den}}$.`];
      }
      const res = [num[0] / den, num[1] / den];
      // verificación: cociente incremental numérico en la dirección imaginaria (la derivada no depende de la dirección)
      const nd = () => Z.dz(f, z0, [0, 1e-5]);
      return {
        prompt: `Sea $f(z) = ${tex}$. Calculá $f'(z_0)$ en $z_0 = ${Z.tex(z0)}$.`,
        lhs: "f'(z_0) = ", answer: res, answerTex: Z.cfrac(num, den),
        // verificación: cociente incremental numérico en la dirección imaginaria (la derivada no depende de la dirección)
        verify: { kind: "cvalue", tol: 1e-6, fn: nd },
        solution: [`Las reglas de derivación son las mismas que en variable real ([[c3-derivada|derivada compleja]]): $f'(z) = ${dTex}$.`, ...steps,
          `$f'(z_0) = ${H.frac(num[0], den)} ${num[1] < 0 ? "-" : "+"} ${H.frac(Math.abs(num[1]), den)}\\,i$.`]
      };
    }
  };

  T["c3-cr-donde-mc"] = {
    type: "mc", concepts: ["c3-derivada", "c3-analitica"], difficulty: 2,
    generate(r) {
      const fam = r.pick(["A", "A", "B", "C", "D"]), a = r.nz(-4, 4), b = r.nz(-4, 4);
      const oAll = "Derivable y analítica en todo el plano", oNone = "No es derivable en ningún punto", o0 = "Derivable solo en $z = 0$; analítica en ningún punto", o0bad = "Derivable y analítica solo en $z = 0$";
      let tex, u, v, ok, bads, why, claim;
      if (fam === "A") {
        const line = `$${H.kx(a, "x")} = ${H.kx(b, "y")}$`;
        tex = `${H.kx(a, "x^2")} ${b < 0 ? "-" : "+"} ${H.cf(Math.abs(b))}i\\,y^2`; u = x => a * x * x; v = (x, y) => b * y * y;
        ok = `Derivable solo sobre la recta ${line}; analítica en ningún punto`; bads = [`Derivable y analítica solo sobre la recta ${line}`, oAll, oNone];
        why = [`$u = ${H.kx(a, "x^2")}$, $v = ${H.kx(b, "y^2")}$. Cauchy-Riemann: $u_x = v_y$ da $${H.kx(2 * a, "x")} = ${H.kx(2 * b, "y")}$, y $u_y = -v_x$ da $0 = 0$.`,
          `Las parciales son continuas, así que $f$ es derivable exactamente en los puntos de la recta ${line}.`,
          `Para ser **analítica** en un punto tiene que ser derivable en todo un entorno, y una recta no contiene ningún disco: no es analítica en ningún punto.`];
        claim = (x, y) => Math.abs(a * x - b * y) < 1e-9;
      } else if (fam === "B") {
        tex = `${H.cf(a)}|z|^2 ${H.sg(b)}`; u = (x, y) => a * (x * x + y * y) + b; v = () => 0;
        ok = o0; bads = [o0bad, oAll, oNone];
        why = [`$u = ${H.cf(a)}(x^2 + y^2) ${H.sg(b)}$, $v = 0$. Cauchy-Riemann pide $${H.kx(2 * a, "x")} = 0$ y $${H.kx(2 * a, "y")} = 0$: solo se cumple en el origen.`,
          `Ahí es derivable (las parciales son continuas), pero no en un entorno: no es analítica en ningún punto.`];
        claim = (x, y) => Math.hypot(x, y) < 1e-9;
      } else if (fam === "C") {
        tex = `${H.kx(a, "\\bar z")} ${b < 0 ? "-" : "+"} ${H.cf(Math.abs(b))}z`; u = x => (a + b) * x; v = (x, y) => (b - a) * y;
        ok = oNone; bads = [oAll, o0, o0bad];
        why = [`$u = ${a + b === 0 ? "0" : H.kx(a + b, "x")}$, $v = ${b - a === 0 ? "0" : H.kx(b - a, "y")}$. Cauchy-Riemann pide $u_x = v_y$: $${a + b} = ${b - a}$, que es falso en todos los puntos.`,
          `El término con $\\bar z$ arruina la derivabilidad: $\\bar z$ no es derivable en ningún punto.`];
        claim = () => false;
      } else {
        tex = `(x^2 - y^2${H.term(a, "x", false)}) + i\\,(2xy${H.term(a, "y", false)})`; u = (x, y) => x * x - y * y + a * x; v = (x, y) => 2 * x * y + a * y;
        ok = oAll; bads = [oNone, o0, "Derivable solo sobre el eje real; analítica en ningún punto"];
        why = [`$u_x = 2x ${H.sg(a)} = v_y$ y $u_y = -2y = -v_x$: Cauchy-Riemann se cumple en todo el plano, con parciales continuas.`,
          `Es una función entera. De hecho es $f(z) = z^2 ${a < 0 ? "-" : "+"} ${H.cf(Math.abs(a))}z$.`];
        claim = () => true;
      }
      return {
        prompt: `¿Dónde es derivable y dónde es analítica la función $f(x + iy) = ${tex}$?`,
        ...H.mc(r, ok, bads, { text: true }),
        traps: fam === "A" || fam === "B" ? [{ option: bads[0], msg: "Derivable en un punto no alcanza: para ser analítica ahí tiene que ser derivable en **todo un entorno** del punto." }] : [],
        solution: [...why, `Ver [[c3-derivada|ecuaciones de Cauchy-Riemann]] y [[c3-analitica|funciones analíticas]].`],
        // verificación: se evalúan las ecuaciones de Cauchy-Riemann con derivadas numéricas en una grilla de puntos
        verify: { kind: "truth", target: true, fn: () => {
          const cr = (x, y) => Math.abs(dx(u, x, y) - dy(v, x, y)) + Math.abs(dy(u, x, y) + dx(v, x, y)) < 1e-6;
          const pts = [[0, 0], [1, 0.5], [-0.7, 1.3], [2, -1], [0.4, 0.4], [b, a], [-b / 2, -a / 2], [a, b], [0, 1.1], [1.6, 0]];
          return pts.every(([x, y]) => cr(x, y) === claim(x, y));
        } }
      };
    }
  };

  T["c3-armonica-num"] = {
    type: "numeric", concepts: ["c3-armonicas"], difficulty: 2,
    generate(r) {
      const p = r.nz(-4, 4), q = r.nz(-5, 5), form = r.int(0, 3), a = r.int(1, 3);
      const F = [
        { tex: `${H.kx(p, "x^2")} ${q < 0 ? "-" : "+"} ${H.kx(Math.abs(q), "xy")} + k\\,y^2`, u: k => (x, y) => p * x * x + q * x * y + k * y * y, k: -p, lap: `u_{xx} + u_{yy} = ${2 * p} + 2k`, extra: "" },
        { tex: `${H.kx(p, "x^3")} + k\\,xy^2 ${q < 0 ? "-" : "+"} ${H.kx(Math.abs(q), "y")}`, u: k => (x, y) => p * x ** 3 + k * x * y * y + q * y, k: -3 * p, lap: `u_{xx} + u_{yy} = ${6 * p}x + 2k\\,x`, extra: "" },
        { tex: `e^{${H.kx(a, "x")}}\\sin(k\\,y)`, u: k => (x, y) => Math.exp(a * x) * Math.sin(k * y), k: a, lap: `u_{xx} + u_{yy} = (${a * a} - k^2)\\,e^{${H.kx(a, "x")}}\\sin(k\\,y)`, extra: " positivo" },
        { tex: `k\\,x^2y ${p > 0 ? "-" : "+"} ${H.kx(Math.abs(p), "y^3")}`, u: k => (x, y) => k * x * x * y - p * y ** 3, k: 3 * p, lap: `u_{xx} + u_{yy} = 2k\\,y ${-6 * p < 0 ? "-" : "+"} ${Math.abs(6 * p)}y`, extra: "" }
      ][form];
      return {
        prompt: `¿Para qué valor${F.extra} de $k$ la función $u(x, y) = ${F.tex}$ es armónica en todo el plano?`,
        answer: F.k,
        solution: [`$u$ es [[c3-armonicas|armónica]] si cumple la ecuación de Laplace, $u_{xx} + u_{yy} = 0$.`, `Acá $${F.lap}$.`, `Se anula en todos los puntos solo si $k = ${F.k}$.`],
        // verificación: laplaciano numérico (esquema de 5 puntos) en varios puntos
        verify: { kind: "zero", tol: 1e-3, fn: k => { const u = F.u(k), h = 1e-3; return [[0.3, -0.4], [-0.6, 0.2], [0.1, 0.5]].map(([x, y]) => (u(x + h, y) + u(x - h, y) + u(x, y + h) + u(x, y - h) - 4 * u(x, y)) / (h * h)); } }
      };
    }
  };

  T["c3-conj-armonica-expr"] = {
    type: "expr", concepts: ["c3-armonicas"], difficulty: 3,
    generate(r) {
      const p = r.nz(-3, 3), q = r.int(-3, 3), a = r.int(-4, 4), b = r.int(-4, 4);
      // f(z) = (p + qi) z² + (a + bi) z
      const uT = H.poly([[p, "x^{2}"], [-p, "y^{2}"], [-2 * q, "xy"], [a, "x"], [-b, "y"]]);
      const [vm, vt] = H.terms([{ p: q, m: "x^2", t: "x^{2}" }, { p: -q, m: "y^2", t: "y^{2}" }, { p: 2 * p, m: "x*y", t: "xy" }, { p: b, m: "x", t: "x" }, { p: a, m: "y", t: "y" }]);
      const u = (x, y) => p * (x * x - y * y) - 2 * q * x * y + a * x - b * y, dom = [[-2, 2], [-2, 2]];
      return {
        prompt: `La función $u(x, y) = ${uT}$ es armónica. Hallá su conjugada armónica $v(x, y)$, la que cumple $v(0, 0) = 0$.`,
        vars: ["x", "y"], domain: dom, lhs: "v(x, y) = ", answer: vm, answerTex: vt,
        traps: [{ expr: `-(${vm})`, msg: "Revisá los signos de Cauchy-Riemann: $v_y = u_x$ y $v_x = -u_y$." }],
        solution: [`Se busca $v$ con $v_y = u_x$ y $v_x = -u_y$ ([[c3-armonicas|conjugada armónica]]). Acá $u_x = ${H.poly([[2 * p, "x"], [-2 * q, "y"], [a, ""]])}$ y $u_y = ${H.poly([[-2 * p, "y"], [-2 * q, "x"], [-b, ""]])}$.`,
          `Integrando $v_y = u_x$ respecto de $y$: $v = ${H.poly([[2 * p, "xy"], [-q, "y^{2}"], [a, "y"]])} + g(x)$.`,
          `Derivando respecto de $x$ e igualando a $-u_y$: $g'(x) = ${H.poly([[2 * q, "x"], [b, ""]])}$, así que $g(x) = ${H.poly([[q, "x^{2}"], [b, "x"]])} + C$. Con $v(0, 0) = 0$, $C = 0$.`,
          `$v(x, y) = ${vt}$. (Es $f(z) = (${Z.tex([p, q])})\\,z^2 ${a || b ? `+ (${Z.tex([a, b])})\\,z` : ""}$.)`],
        // verificación: v(x, y) = ∫ (−u_y dx + u_x dy) desde el origen, con derivadas numéricas y Simpson
        verify: { kind: "fnEq", dom, tol: 1e-5, g: (x, y) => simpson(t => -dy(u, t, 0), 0, x) + simpson(t => dx(u, x, t), 0, y) }
      };
    }
  };

  const cards = {
    "c3-limite": {
      title: "Funciones de variable compleja, límites y continuidad", aliases: ["función de variable compleja", "límite complejo", "parte real e imaginaria de una función"], concepts: ["c3-limite"],
      summary: "f(z) = u(x, y) + i v(x, y). El límite cuando z → z₀ existe si f(z) se acerca al mismo valor por todos los caminos; equivale a que existan los límites de u y de v.",
      def: [R`Una función $f$ de variable compleja asigna a cada $z = x + iy$ de un conjunto un complejo $w = f(z)$. Siempre se puede escribir $$f(z) = u(x, y) + i\,v(x, y),$$ con $u$ y $v$ funciones reales de dos variables.`,
        R`$\displaystyle\lim_{z\to z_0} f(z) = w_0$ significa: para todo $\varepsilon > 0$ existe $\delta > 0$ tal que $|f(z) - w_0| < \varepsilon$ siempre que $0 < |z - z_0| < \delta$.`,
        R`Con $z_0 = x_0 + iy_0$ y $w_0 = u_0 + iv_0$, eso equivale a $\displaystyle\lim_{(x,y)\to(x_0,y_0)} u = u_0$ y $\displaystyle\lim_{(x,y)\to(x_0,y_0)} v = v_0$. $f$ es **continua** en $z_0$ si $\lim_{z\to z_0} f(z) = f(z_0)$.`],
      idea: [R`Es el [[c2-limites-rigor|límite de dos variables]] de Cálculo II, escrito con módulos. $z$ puede acercarse a $z_0$ por cualquier camino del plano, y el resultado tiene que ser el mismo por todos.`,
        R`Para probar que **no existe** alcanza con dos caminos que den distinto. Para probar que **existe** hay que acotar $|f(z) - w_0|$ por algo que tienda a cero, por ejemplo usando polares: $z = r\,e^{i\theta}$.`,
        R`Una función compleja no se puede graficar como las reales (harían falta cuatro dimensiones). Se piensa como una **transformación** del plano $z$ en el plano $w$.`],
      demo: [R`**Paso 1 (de $f$ a $u$ y $v$).** La parte real y la imaginaria de un complejo no superan su módulo: $|u - u_0| \le |f(z) - w_0|$ y $|v - v_0| \le |f(z) - w_0|$. Si $|f(z) - w_0| < \varepsilon$, también lo son esas dos diferencias, con el mismo $\delta$.`,
        R`**Paso 2 (de $u$ y $v$ a $f$).** Por la desigualdad triangular, $|f(z) - w_0| \le |u - u_0| + |v - v_0|$. Si cada una es menor que $\frac\varepsilon2$ (con $\delta_1$ y $\delta_2$), tomando $\delta = \min(\delta_1, \delta_2)$ la suma es menor que $\varepsilon$. $\blacksquare$`],
      examples: [{ q: R`¿Existe $\lim_{z\to0}\dfrac{\bar z}{z}$?`, steps: [R`Por el eje real ($z = x$): $\frac xx = 1$. Por el eje imaginario ($z = iy$): $\frac{-iy}{iy} = -1$.`, R`Dos caminos dan distinto: el límite no existe.`] },
        { q: R`¿Existe $\lim_{z\to0}\dfrac{z^2}{|z|}$?`, steps: [R`$\left|\dfrac{z^2}{|z|}\right| = |z|$, que tiende a $0$. Dado $\varepsilon$, sirve $\delta = \varepsilon$: el límite es $0$.`] }],
      tips: [R`Que dos caminos coincidan no prueba nada: $\left(\frac{z}{\bar z}\right)^2$ vale $1$ por los dos ejes y $-1$ por la diagonal.`],
      see: ["c2-limites-rigor", "limite", "c3-regiones", "c3-derivada"]
    },
    "c3-derivada": {
      title: "Derivada compleja y ecuaciones de Cauchy-Riemann", aliases: ["derivada compleja", "ecuaciones de Cauchy-Riemann", "Cauchy-Riemann", "condiciones de Cauchy-Riemann"], concepts: ["c3-derivada"],
      summary: "f'(z₀) = lím [f(z₀ + Δz) − f(z₀)]/Δz, con Δz → 0 por cualquier dirección. Si existe, se cumple u_x = v_y y u_y = −v_x. Si esas ecuaciones valen en z₀ y las parciales son continuas, f es derivable ahí, con f' = u_x + i v_x.",
      def: [R`$f$ es **derivable** en $z_0$ si existe $$f'(z_0) = \lim_{\Delta z\to0}\frac{f(z_0 + \Delta z) - f(z_0)}{\Delta z}.$$ Valen las reglas de siempre (suma, [[regla-producto|producto]], [[regla-cociente|cociente]], [[regla-cadena|cadena]], $(z^n)' = nz^{n-1}$), con las mismas demostraciones.`,
        R`**Condición necesaria.** Si $f = u + iv$ es derivable en $z_0$, las parciales existen ahí y cumplen las **ecuaciones de Cauchy-Riemann**: $$u_x = v_y,\qquad u_y = -v_x,$$ y además $f'(z_0) = u_x + i\,v_x$.`,
        R`**Condición suficiente.** Si $u$ y $v$ tienen parciales en un entorno de $z_0$, **continuas** en $z_0$, y cumplen Cauchy-Riemann en $z_0$, entonces $f$ es derivable en $z_0$.`,
        R`**En polares** ($z = r\,e^{i\theta}$, $r > 0$): $r\,u_r = v_\theta$, $\ u_\theta = -r\,v_r$, y $f' = e^{-i\theta}(u_r + i\,v_r)$.`],
      idea: [R`La definición se parece a la de [[derivada|variable real]], pero $\Delta z$ puede tender a cero desde **cualquier dirección** del plano. Pedir que el cociente tenga el mismo límite por todas es muchísimo más exigente que pedir derivadas parciales.`,
        R`Cauchy-Riemann sale de comparar solo dos direcciones: la horizontal y la vertical. Por eso solas son necesarias, pero para que alcancen hace falta algo más (parciales continuas).`,
        R`Geométricamente: cerca de $z_0$, una función derivable con $f'(z_0) \ne 0$ actúa como multiplicar por $f'(z_0)$: gira y estira, sin deformar los ángulos.`,
        R`Regla rápida: si en la fórmula aparece $\bar z$, $|z|$, $\operatorname{Re} z$ o $\operatorname{Im} z$ de manera esencial, lo más probable es que la función **no** sea derivable salvo en puntos sueltos.`],
      demo: [R`**Paso 1 (acercarse en horizontal).** Con $\Delta z = h$ real, el cociente es $\frac{u(x_0 + h, y_0) - u(x_0, y_0)}{h} + i\,\frac{v(x_0 + h, y_0) - v(x_0, y_0)}{h}$. Como el límite existe, existen los de la parte real y la imaginaria ([[c3-limite|límite complejo]]): $f'(z_0) = u_x + i\,v_x$.`,
        R`**Paso 2 (acercarse en vertical).** Con $\Delta z = ih$, el cociente es $\frac{u(x_0, y_0 + h) - u(x_0, y_0)}{ih} + i\,\frac{v(x_0, y_0 + h) - v(x_0, y_0)}{ih}$. Como $\frac1i = -i$, el límite es $f'(z_0) = v_y - i\,u_y$.`,
        R`**Paso 3 (igualar).** Los dos resultados son el mismo número. Igualando partes reales, $u_x = v_y$; igualando las imaginarias, $v_x = -u_y$.`,
        R`**Paso 4 (suficiencia: aproximación lineal).** Si las parciales son continuas en $z_0$, $u$ y $v$ son [[c2-diferenciabilidad|diferenciables]] ahí: $\Delta u = u_x\Delta x + u_y\Delta y + \varepsilon_1|\Delta z|$ y $\Delta v = v_x\Delta x + v_y\Delta y + \varepsilon_2|\Delta z|$, con $\varepsilon_1, \varepsilon_2 \to 0$.`,
        R`**Paso 5 (usar Cauchy-Riemann).** Reemplazando $u_y = -v_x$ y $v_y = u_x$: $\Delta u + i\Delta v = (u_x + i\,v_x)(\Delta x + i\Delta y) + (\varepsilon_1 + i\varepsilon_2)|\Delta z|$.`,
        R`**Paso 6 (dividir).** Dividiendo por $\Delta z$: $\frac{\Delta f}{\Delta z} = u_x + i\,v_x + (\varepsilon_1 + i\varepsilon_2)\frac{|\Delta z|}{\Delta z}$. El último factor tiene módulo 1, así que ese término tiende a cero y el límite existe. $\blacksquare$`],
      examples: [{ q: R`¿Dónde es derivable $f(z) = |z|^2$?`, steps: [R`$u = x^2 + y^2$, $v = 0$. Cauchy-Riemann: $2x = 0$ y $2y = 0$. Solo en $z = 0$.`, R`Ahí las parciales son continuas, así que es derivable en $0$, con $f'(0) = u_x + iv_x = 0$. En ningún otro punto.`] },
        { q: R`Mostrá que $f(z) = \bar z$ no es derivable en ningún punto.`, steps: [R`$u = x$, $v = -y$: $u_x = 1 \ne -1 = v_y$ en todos los puntos.`] }],
      tips: [R`Cauchy-Riemann **solas** no alcanzan: hay funciones que las cumplen en un punto y no son derivables ahí. Mencioná siempre la continuidad de las parciales.`, R`Si Cauchy-Riemann **falla** en un punto, ahí seguro no es derivable: esa dirección sí es automática.`],
      see: ["derivada", "c2-parciales", "c2-diferenciabilidad", "c3-analitica", "c3-armonicas"]
    },
    "c3-analitica": {
      title: "Funciones analíticas, enteras y puntos singulares", aliases: ["función analítica", "funciones analíticas", "función holomorfa", "función entera", "punto singular"], concepts: ["c3-analitica"],
      summary: "f es analítica en z₀ si es derivable en todo un entorno de z₀. Entera: analítica en todo el plano. Punto singular: f no es analítica ahí, pero sí en puntos de todo entorno suyo. Si f' = 0 en un dominio, f es constante.",
      def: [R`$f$ es **analítica** (u holomorfa) en un punto $z_0$ si es derivable en **todos los puntos de algún entorno** de $z_0$. Es analítica en un conjunto abierto si es derivable en cada uno de sus puntos.`,
        R`Una función **entera** es analítica en todo el plano (los polinomios, $e^z$, $\sin z$). Un **punto singular** de $f$ es un $z_0$ donde $f$ no es analítica, pero tal que todo entorno suyo contiene puntos donde sí lo es (como $z = 0$ para $\frac1z$).`,
        R`**Propiedades.** Sumas, productos y composiciones de analíticas son analíticas; el cociente lo es donde no se anula el denominador. Si $f'(z) = 0$ en todo un **dominio**, $f$ es constante ahí.`],
      idea: [R`«Analítica» es una propiedad de **regiones**, no de puntos sueltos. $|z|^2$ es derivable en $0$ pero no es analítica en ningún lado: en un punto aislado la derivada no sirve para nada.`,
        R`Ser analítica es rigidísimo. Más adelante se ve que una función analítica tiene derivadas de todos los órdenes, se desarrolla en serie de potencias y queda determinada por sus valores en un pedacito de curva.`,
        R`Consecuencias de esa rigidez: una función analítica en un dominio que toma solo valores reales, o que tiene módulo constante, es constante.`],
      demo: [R`**Paso 1 (las parciales se anulan).** Si $f' = 0$ en el dominio $D$, como $f' = u_x + i\,v_x = v_y - i\,u_y$ ([[c3-derivada|Cauchy-Riemann]]), las cuatro parciales son cero en $D$.`,
        R`**Paso 2 (constante sobre segmentos).** Sobre un segmento contenido en $D$, la derivada de $u$ a lo largo del segmento es la [[c2-gradiente|derivada direccional]] $\nabla u\cdot\vec d = 0$. Por el teorema del valor medio, $u$ vale lo mismo en los dos extremos. Igual para $v$.`,
        R`**Paso 3 (usar que es conexo).** Dos puntos cualesquiera de un dominio se unen con una poligonal contenida en él ([[c3-regiones|dominio]]). Aplicando el paso 2 a cada tramo, $f$ vale lo mismo en los dos puntos. $\blacksquare$`,
        R`**Paso 4 (aplicación: valores reales).** Si $f$ es analítica en $D$ y $v = 0$, por Cauchy-Riemann $u_x = v_y = 0$ y $u_y = -v_x = 0$. Entonces $f' = 0$ y, por lo anterior, $f$ es constante.`],
      examples: [{ q: R`Hallá los puntos singulares de $f(z) = \dfrac{z + 1}{z^2 + 4}$.`, steps: [R`Es un cociente de polinomios: analítica salvo donde $z^2 + 4 = 0$. Puntos singulares: $z = 2i$ y $z = -2i$.`] },
        { q: R`$f(x + iy) = x^2 + iy^2$: ¿es analítica en algún punto?`, steps: [R`Cauchy-Riemann: $2x = 2y$ y $0 = 0$. Es derivable solo sobre la recta $y = x$.`, R`Ningún disco entra en una recta, así que no es analítica en ningún punto (y entonces tampoco tiene puntos singulares).`] }],
      tips: [R`«Derivable en $z_0$» y «analítica en $z_0$» no son sinónimos: la segunda pide un entorno entero.`],
      see: ["c3-derivada", "c3-regiones", "c3-armonicas"]
    },
    "c3-armonicas": {
      title: "Funciones armónicas y conjugada armónica", aliases: ["función armónica", "funciones armónicas", "conjugada armónica", "armónica conjugada", "ecuación de Laplace en el plano"], concepts: ["c3-armonicas"],
      summary: "u es armónica si u_xx + u_yy = 0. Las partes real e imaginaria de una función analítica son armónicas. v es conjugada armónica de u si u + iv es analítica: se halla integrando v_y = u_x y v_x = −u_y.",
      def: [R`Una función real $u(x, y)$ con derivadas segundas continuas es **armónica** en un dominio si cumple la **ecuación de Laplace**: $$u_{xx} + u_{yy} = 0.$$`,
        R`**Teorema.** Si $f = u + iv$ es [[c3-analitica|analítica]] en un dominio, $u$ y $v$ son armónicas ahí.`,
        R`$v$ es **conjugada armónica** de $u$ si $u$ y $v$ son armónicas y cumplen Cauchy-Riemann, es decir, si $f = u + iv$ es analítica. Queda determinada salvo una constante. En un dominio sin agujeros (simplemente conexo), toda armónica tiene conjugada.`],
      idea: [R`La ecuación de Laplace aparece en toda la física: el [[f2a-forma-diferencial|potencial electrostático]] sin cargas, la temperatura estacionaria, el flujo de un fluido ideal. Cada función analítica regala dos soluciones.`,
        R`Las curvas de nivel de $u$ y las de $v$ se cortan en ángulo recto (donde $f' \ne 0$): si $u$ es un potencial, las curvas de nivel de $v$ son las líneas de campo.`,
        R`El orden importa: si $v$ es conjugada de $u$, la conjugada de $v$ es $-u$ (porque $-if = v - iu$ es analítica), no $u$.`],
      demo: [R`**Paso 1 (derivar Cauchy-Riemann).** De $u_x = v_y$, derivando respecto de $x$: $u_{xx} = v_{yx}$. De $u_y = -v_x$, derivando respecto de $y$: $u_{yy} = -v_{xy}$. (Las derivadas segundas existen y son continuas porque una función analítica tiene derivadas de todos los órdenes, como se ve con la fórmula integral de Cauchy.)`,
        R`**Paso 2 (sumar).** $u_{xx} + u_{yy} = v_{yx} - v_{xy} = 0$, porque las derivadas cruzadas continuas son iguales ([[c2-parciales|teorema de Schwarz]]).`,
        R`**Paso 3 (lo mismo para $v$).** Derivando la primera ecuación respecto de $y$ y la segunda respecto de $x$: $v_{yy} = u_{xy}$ y $v_{xx} = -u_{yx}$, que suman cero. $\blacksquare$`,
        R`**Paso 4 (cómo hallar $v$).** Se integra $v_y = u_x$ respecto de $y$, lo que deja $v$ salvo una función $g(x)$. Se deriva respecto de $x$ y se iguala a $-u_y$ para despejar $g'(x)$. Que $g'$ quede solo en función de $x$ está garantizado justamente porque $u$ es armónica.`],
      examples: [{ q: R`Hallá una conjugada armónica de $u = x^2 - y^2 + 3x$.`, steps: [R`$v_y = u_x = 2x + 3$, así que $v = 2xy + 3y + g(x)$.`, R`$v_x = 2y + g'(x)$ tiene que ser $-u_y = 2y$: $g' = 0$.`, R`$v = 2xy + 3y + C$. Es $f(z) = z^2 + 3z + iC$.`] }],
      tips: [R`Antes de buscar la conjugada, verificá que $u$ sea armónica. Si no lo es, no existe ninguna $v$.`],
      see: ["c3-derivada", "c3-analitica", "c2-parciales", "f2a-forma-diferencial"]
    }
  };

  E.extendCourse("m103", {
    concepts: { "c3-limite": { name: "Funciones y límites" }, "c3-derivada": { name: "Derivada y Cauchy-Riemann" }, "c3-analitica": { name: "Funciones analíticas" }, "c3-armonicas": { name: "Funciones armónicas" } },
    templates: T,
    units: [{
      id: "c3-analiticas-u", order: 2, program: "Unidad 2", title: "Funciones analíticas", icon: "sparkles",
      diagnostic: ["c3-limite-vf", "c3-cr-donde-mc", "c3-armonica-num"],
      lessons: [
        { id: "c3-limite", title: "Funciones, límites y continuidad", templates: ["c3-uv-multi", "c3-limite-vf"], theory: ["c3-limite"],
          intro: R`$f = u + iv$. El límite tiene que dar lo mismo por todos los caminos del plano.` },
        { id: "c3-derivada", title: "Derivada y Cauchy-Riemann", templates: ["c3-deriv-cx", "c3-cr-donde-mc"], theory: ["c3-derivada", "c3-analitica"],
          intro: R`Si $f$ es derivable, $u_x = v_y$ y $u_y = -v_x$. Analítica en $z_0$: derivable en todo un entorno.` },
        { id: "c3-armonicas", title: "Funciones armónicas", templates: ["c3-armonica-num", "c3-conj-armonica-expr"], theory: ["c3-armonicas"],
          intro: R`$u_{xx} + u_{yy} = 0$. La conjugada armónica sale de $v_y = u_x$, $v_x = -u_y$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 3 · FUNCIONES ELEMENTALES: EXPONENCIAL, LOGARITMO, POTENCIAS Y TRIGONOMÉTRICAS
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, Z = E.c3, dn = Z.dn, pif = Z.pif;
  const T = {};
  const far = (v, ans) => Math.abs(v - ans) > 0.03 * Math.max(1, Math.abs(ans));
  // Log z como integral de 1/ζ desde 1: primero por el eje real hasta |z| y después por un arco hasta z (no cruza el corte)
  const logInt = z => { const rho = Z.abs(z), th = Z.arg(z), inv = w => Z.div([1, 0], w); return Z.add(Z.path(inv, t => [1 + t * (rho - 1), 0], 0, 1, 400), Z.path(inv, t => Z.polar(rho, t * th), 0, 1, 400)); };
  const ANG = [[1, 6], [1, 4], [1, 3], [1, 2], [2, 3], [3, 4], [5, 6], [1, 1], [-1, 6], [-1, 4], [-1, 3], [-1, 2], [-2, 3], [-3, 4], [3, 2], [5, 4]];
  const imTex = (p, q, first) => `${p < 0 ? "-" : first ? "" : "+"}${first ? "" : " "}${pif(Math.abs(p), q)}\\,i`;

  T["c3-exp-cx"] = {
    type: "complex", concepts: ["c3-exponencial"], difficulty: 1,
    generate(r) {
      const [p, q] = r.pick(ANG), k = r.int(2, 5), a0 = r.pick([0, 1, 2, -1, "ln", "ln"]), th = p * Math.PI / q;
      const a = a0 === "ln" ? Math.log(k) : a0, aT = a0 === "ln" ? `\\ln ${k}` : a0 === 0 ? "" : String(a0), eT = a0 === "ln" ? String(k) : a0 === 0 ? "1" : a0 === 1 ? "e" : `e^{${a0}}`;
      const res = Z.polar(Math.exp(a), th).map(x => (Math.abs(x) < 1e-12 ? 0 : x));
      return {
        prompt: `Calculá $e^{z}$ para $z = ${aT}${aT ? " " : ""}${imTex(p, q, !aT)}$.`,
        lhs: "e^z = ", answer: res,
        traps: [{ value: [Math.exp(a), 0], msg: "Ese es el módulo, $e^x$. Falta el factor $\\cos y + i\\sin y$." }, { value: [Math.exp(a) * Math.cos(th), 0], msg: "Esa es solo la parte real: falta $i\\,e^x\\sin y$." }].filter(t => Z.abs(Z.sub(t.value, res)) > 0.03 * Math.max(1, Z.abs(res))),
        // verificación: la exponencial sumada como serie de potencias (sin senos ni cosenos)
        verify: { kind: "cvalue", tol: 1e-9, fn: () => Z.expS([a, th]) },
        solution: [`[[c3-exponencial|Exponencial compleja]]: $e^{x + iy} = e^x(\\cos y + i\\sin y)$. El módulo es $e^x$ y el argumento es $y$.`,
          `Acá $e^x = ${eT}$ y $y = ${pif(p, q)}$: $\\cos y = ${dn(Math.cos(th), 4)}$, $\\sin y = ${dn(Math.sin(th), 4)}$.`,
          `$e^z \\approx ${Z.tex(res, 4)}$.`]
      };
    }
  };

  const FACTS = [
    { t: R`$e^{z + 2\pi i} = e^z$ para todo $z$`, why: R`$e^{2\pi i} = \cos 2\pi + i\sin 2\pi = 1$: la exponencial es periódica, de período $2\pi i$.`, test: P => P.every(z => Z.abs(Z.sub(Z.expS(Z.add(z, [0, 2 * Math.PI])), Z.expS(z))) < 1e-9 * (1 + Z.abs(Z.exp(z)))) },
    { t: R`$|\sin z| \le 1$ para todo complejo $z$`, why: R`Sobre el eje imaginario, $\sin(iy) = i\sinh y$, que crece sin límite. Por ejemplo, $|\sin(2i)| \approx 3{,}63$.`, test: P => P.every(z => Z.abs(Z.sin(z)) <= 1) },
    { t: R`$e^z$ nunca vale $0$`, why: R`$|e^z| = e^x > 0$ para todo $z = x + iy$.`, test: () => { for (let x = -20; x <= 20; x += 0.5) for (let y = -7; y <= 7; y += 0.5) if (!(Z.abs(Z.exp([x, y])) > 0)) return false; return true; } },
    { t: R`$\operatorname{Log}(z_1z_2) = \operatorname{Log} z_1 + \operatorname{Log} z_2$ para todo par de complejos no nulos`, why: R`Con $z_1 = -1$ y $z_2 = i$: $\operatorname{Log}(-i) = -\frac{\pi}{2}i$, pero $\operatorname{Log}(-1) + \operatorname{Log}(i) = \frac{3\pi}{2}i$. La igualdad vale para los conjuntos $\log$, no para la rama principal.`, test: P => P.every(z => P.every(w => Z.abs(Z.sub(Z.log(Z.mul(z, w)), Z.add(Z.log(z), Z.log(w)))) < 1e-9)) },
    { t: R`$e^{\operatorname{Log} z} = z$ para todo $z \ne 0$`, why: R`$e^{\ln|z| + i\operatorname{Arg} z} = |z|\,e^{i\operatorname{Arg} z} = z$: el logaritmo se define justamente para que esto valga.`, test: P => P.every(z => Z.abs(Z.sub(Z.expS(Z.log(z)), z)) < 1e-9) },
    { t: R`$\operatorname{Log}(e^z) = z$ para todo $z$`, why: R`Solo vale si $-\pi < \operatorname{Im} z \le \pi$. Por ejemplo, $\operatorname{Log}(e^{2\pi i}) = \operatorname{Log} 1 = 0 \ne 2\pi i$.`, test: P => P.every(z => Z.abs(Z.sub(Z.log(Z.exp(z)), z)) < 1e-9) },
    { t: R`$|e^z| = e^{\operatorname{Re} z}$ para todo $z$`, why: R`$e^z = e^x(\cos y + i\sin y)$ y el factor entre paréntesis tiene módulo 1.`, test: P => P.every(z => Math.abs(Z.abs(Z.expS(z)) - Math.exp(z[0])) < 1e-9 * (1 + Math.exp(z[0]))) },
    { t: R`$\overline{e^z} = e^{\bar z}$ para todo $z$`, why: R`$\overline{e^x(\cos y + i\sin y)} = e^x(\cos y - i\sin y) = e^x(\cos(-y) + i\sin(-y)) = e^{x - iy}$.`, test: P => P.every(z => Z.abs(Z.sub(Z.conj(Z.expS(z)), Z.expS(Z.conj(z)))) < 1e-9 * (1 + Math.exp(z[0]))) },
    { t: R`todos los ceros de $\sin z$ son reales`, why: R`$|\sin z|^2 = \sin^2x + \sinh^2y$ se anula solo si $y = 0$ y $\sin x = 0$: los ceros son $z = n\pi$, los mismos que en variable real.`, test: () => { for (let x = -4; x <= 4; x += 0.8) for (let y = -3; y <= 3; y += 0.6) { let z = [x, y]; for (let i = 0; i < 60; i++) { const c = Z.cos(z); if (Z.abs(c) < 1e-9) break; z = Z.sub(z, Z.div(Z.sin(z), c)); } if (Z.abs(Z.sin(z)) < 1e-10 && Math.abs(z[1]) > 1e-7) return false; } return true; } },
    { t: R`$\cosh(iz) = \cos z$ para todo $z$`, why: R`$\cosh(iz) = \frac{e^{iz} + e^{-iz}}{2}$, que es la definición de $\cos z$.`, test: P => P.every(z => Z.abs(Z.sub(Z.cosh(Z.mul([0, 1], z)), Z.cos(z))) < 1e-9 * (1 + Z.abs(Z.cos(z)))) },
    { t: R`$\sin(iz) = i\sinh z$ para todo $z$`, why: R`$\sin(iz) = \frac{e^{-z} - e^{z}}{2i} = i\,\frac{e^z - e^{-z}}{2}$, porque $\frac1i = -i$.`, test: P => P.every(z => Z.abs(Z.sub(Z.sin(Z.mul([0, 1], z)), Z.mul([0, 1], Z.sinh(z)))) < 1e-9 * (1 + Z.abs(Z.sinh(z)))) },
    { t: R`la ecuación $e^z = -1$ no tiene solución`, why: R`$e^{i\pi} = -1$. La exponencial compleja toma todos los valores salvo el $0$; las soluciones son $z = (2k + 1)\pi i$.`, test: () => !(Z.abs(Z.add(Z.expS([0, Math.PI]), [1, 0])) < 1e-9) },
    { t: R`$\cos^2z + \sin^2z = 1$ para todo complejo $z$`, why: R`Sale de las definiciones con exponenciales: los términos $e^{2iz}$ y $e^{-2iz}$ se cancelan y queda $\frac{2 + 2}{4} = 1$.`, test: P => P.every(z => Z.abs(Z.sub(Z.add(Z.ipow(Z.cos(z), 2), Z.ipow(Z.sin(z), 2)), [1, 0])) < 1e-8 * (1 + Z.abs(Z.cos(z)) ** 2)) },
    { t: R`$\operatorname{Log} z$ es continua en $z = -1$`, why: R`Justo arriba del semieje real negativo, $\operatorname{Arg} z \approx \pi$; justo abajo, $\approx -\pi$. Hay un salto de $2\pi i$ en todo el corte.`, test: () => Z.abs(Z.sub(Z.log([-1, 1e-9]), Z.log([-1, -1e-9]))) < 1e-3 }
  ];
  T["c3-elementales-vf"] = {
    type: "tf", concepts: ["c3-exponencial", "c3-logaritmo", "c3-trig"], difficulty: 2,
    generate(r) {
      const F = r.pick(FACTS);
      const P = [[0.3, 1.1], [-1.2, 2.5], [2, -0.7], [-0.5, -3], [1.5, 4], [-1, 0], [0, 1], [0, 2], [-2, 0.4], [0.2, -5]];
      const val = F.test(P);
      return {
        prompt: `<b>Verdadero o falso:</b> ${F.t}.`,
        answer: val,
        explanation: `${val ? "Verdadero" : "Falso"}. ${F.why}`,
        solution: [`Las funciones elementales complejas extienden a las reales, pero no todas las propiedades sobreviven: mirá las fichas de la [[c3-exponencial|exponencial]], el [[c3-logaritmo|logaritmo]] y las [[c3-trig|trigonométricas]].`],
        // verificación: cada afirmación se prueba numéricamente en puntos del plano, con otra muestra de puntos
        verify: { kind: "truth", fn: () => F.test([[0.7, -2.2], [-1, 0], [0, 1], [-0.3, 3.5], [1.1, 0.4], [0, 2], [-2.5, -1], [0.9, 6]]) }
      };
    }
  };

  T["c3-log-num"] = {
    type: "numeric", concepts: ["c3-logaritmo"], difficulty: 1,
    generate(r) {
      const N = Z.nice(r), ask = r.pick(["real", "imaginaria"]);
      if (N.mod === 1 && ask === "real" && r.bool(0.7)) return null;
      const ans = ask === "real" ? Math.log(N.mod) : N.ap * Math.PI / N.aq;
      return {
        prompt: `Calculá la parte ${ask} de $\\operatorname{Log}\\left(${N.tex}\\right)$, el logaritmo principal.`,
        answer: Math.abs(ans) < 1e-12 ? 0 : ans, ...(ask === "real" ? {} : { answerTex: pif(N.ap, N.aq) }),
        traps: ask === "real" ? [{ value: N.mod, msg: "La parte real no es el módulo, sino su logaritmo natural: $\\ln|z|$." }].filter(t => far(t.value, ans)) : [],
        solution: [`[[c3-logaritmo|Logaritmo principal]]: $\\operatorname{Log} z = \\ln|z| + i\\operatorname{Arg} z$.`,
          `$|z| = ${N.modTex}$ y $\\operatorname{Arg} z = ${pif(N.ap, N.aq)}$, así que $\\operatorname{Log} z = \\ln ${N.modTex} ${N.ap < 0 ? "-" : "+"} ${pif(Math.abs(N.ap), N.aq)}\\,i \\approx ${Z.tex([Math.log(N.mod), N.ap * Math.PI / N.aq], 4)}$.`],
        // verificación: Log z = ∫ dζ/ζ desde 1 hasta z, por un camino que no cruza el semieje real negativo
        verify: { kind: "value", tol: 1e-6, fn: () => logInt(N.z)[ask === "real" ? 0 : 1] }
      };
    }
  };

  T["c3-ecuacion-exp-multi"] = {
    type: "multi", concepts: ["c3-logaritmo"], difficulty: 2,
    generate(r) {
      const N = Z.nice(r), m = r.pick([1, 2, -1, -2]), re = Math.log(N.mod), im = (N.ap / N.aq + 2 * m) * Math.PI;
      if (N.mod === 1 && r.bool(0.6)) return null;
      const lo = pif(2 * m - 1), hi = pif(2 * m + 1);
      return {
        prompt: `Resolvé la ecuación $e^z = ${N.tex}$.`,
        parts: [
          { q: "Todas las soluciones tienen la misma parte real. ¿Cuál es?", type: "numeric", answer: re,
            verify: { kind: "zero", tol: 1e-9, fn: a => [Z.abs(Z.expS([a, 1.3])) - N.mod] } },
          { q: `¿Cuánto vale la parte imaginaria de la solución que cumple $${lo} < \\operatorname{Im} z \\le ${hi}$?`, type: "numeric", answer: im, answerTex: pif(N.ap + 2 * m * N.aq, N.aq),
            traps: [{ value: N.ap * Math.PI / N.aq, msg: "Esa es la solución principal. Las demás se obtienen sumando múltiplos de $2\\pi$: buscá la que cae en el intervalo pedido." }],
            // verificación: con esa parte imaginaria, la exponencial (por su serie) tiene que dar el número pedido
            verify: { kind: "zero", tol: 1e-8, scale: N.mod, fn: b => { const w = Z.expS([re, b]); return [w[0] - N.z[0], w[1] - N.z[1], Math.max(0, (2 * m - 1) * Math.PI - b, b - (2 * m + 1) * Math.PI)]; } } }
        ],
        solution: [`$e^z = w$ se resuelve con el [[c3-logaritmo|logaritmo complejo]]: $z = \\ln|w| + i(\\operatorname{Arg} w + 2k\\pi)$, con $k$ entero. Hay infinitas soluciones, una arriba de otra.`,
          `$|w| = ${N.modTex}$: la parte real es $\\ln ${N.modTex} \\approx ${dn(re, 4)}$.`,
          `$\\operatorname{Arg} w = ${pif(N.ap, N.aq)}$. Con $k = ${m}$ queda $${pif(N.ap + 2 * m * N.aq, N.aq)}$, que está en el intervalo pedido.`]
      };
    }
  };

  T["c3-rama-mc"] = {
    type: "mc", concepts: ["c3-logaritmo"], difficulty: 3,
    generate(r) {
      const k = r.nz(-3, 3), b = r.nz(-6, 6), imag = r.bool(0.4), a = imag ? [0, k] : [k, 0];
      const cN = imag ? [b, k] : [-b, k], c = cN[0] / cN[1], cT = H.frac(cN[0], cN[1]);
      const opts = [`Los $z$ reales con $x \\le ${cT}$`, `Los $z$ reales con $x \\ge ${cT}$`, `Los $z = iy$ del eje imaginario con $y \\ge ${cT}$`, `Los $z = iy$ del eje imaginario con $y \\le ${cT}$`];
      const idx = imag ? (k > 0 ? 2 : 3) : (k > 0 ? 0 : 1);
      const aT = imag ? `${H.cf(k)}i\\,z` : H.kx(k, "z");
      const F = z => Z.log(Z.add(Z.mul(a, z), [b, 0]))[1];
      return {
        prompt: `La función $f(z) = \\operatorname{Log}(${aT} ${b < 0 ? "-" : "+"} ${Math.abs(b)})$ es analítica en todo el plano salvo sobre una semirrecta. ¿Cuál?`,
        ...H.mc(r, opts[idx], opts.filter((_, i) => i !== idx), { text: true }),
        solution: [`$\\operatorname{Log} w$ es analítica salvo en el **corte**: los $w$ reales con $w \\le 0$ ([[c3-logaritmo|rama principal]]). Entonces $f$ falla donde $w = ${aT} ${b < 0 ? "-" : "+"} ${Math.abs(b)}$ es real y $\\le 0$.`,
          imag ? `Con $z = x + iy$: $w = (${b}${H.term(-k, "y", false)})${H.term(k, "x", false)}\\,i$. Es real si $x = 0$, y es $\\le 0$ si $${H.kx(k, "y")} \\ge ${b}$, o sea $y ${k > 0 ? "\\ge" : "\\le"} ${cT}$.`
            : `$w$ es real solo si $z$ es real ($y = 0$), y entonces $${H.kx(k, "x")} ${b < 0 ? "-" : "+"} ${Math.abs(b)} \\le 0$ da $x ${k > 0 ? "\\le" : "\\ge"} ${cT}$${k < 0 ? " (al dividir por un negativo se da vuelta la desigualdad)" : ""}.`,
          `El extremo de la semirrecta (${imag ? `$y = ${cT}$, sobre el eje imaginario` : `$x = ${cT}$`}) es el punto de ramificación: ahí $w = 0$.`],
        // verificación: se busca numéricamente en cuál de las cuatro semirrectas la parte imaginaria de f pega un salto
        verify: { kind: "truth", target: true, fn: () => {
          const rays = [[[c - 1.5, 0], [0, 1]], [[c + 1.5, 0], [0, 1]], [[0, c + 1.5], [1, 0]], [[0, c - 1.5], [1, 0]]];
          const jump = ([p, n]) => Math.abs(F([p[0] + 1e-7 * n[0], p[1] + 1e-7 * n[1]]) - F([p[0] - 1e-7 * n[0], p[1] - 1e-7 * n[1]])) > 1;
          return rays.every((ry, i) => jump(ry) === (i === idx));
        } }
      };
    }
  };

  const EXPO = [{ w: [0, 1], t: "i" }, { w: [0, -1], t: "-i" }, { w: [0, 2], t: "2i" }, { w: [1, 1], t: "1 + i" }, { w: [1, -1], t: "1 - i" }, { w: [2, 1], t: "2 + i" }, { w: [-1, 1], t: "-1 + i" }];
  T["c3-potencia-multi"] = {
    type: "multi", concepts: ["c3-potencias"], difficulty: 3,
    generate(r) {
      const N = Z.nice(r, 2), X = r.pick(EXPO), w = X.w;
      if (N.z[1] === 0 && N.z[0] > 0) return null;
      const L = [Math.log(N.mod), N.ap * Math.PI / N.aq], wL = Z.mul(w, L), mod = Math.exp(wL[0]);
      const base = /[+-]/.test(N.tex.slice(1)) ? `\\left(${N.tex}\\right)` : N.tex.startsWith("-") ? `(${N.tex})` : N.tex;
      return {
        prompt: `Considerá el valor principal de $${base}^{${X.t}}$, es decir, $e^{c\\operatorname{Log} z}$ con $z = ${N.tex}$ y $c = ${X.t}$.`,
        parts: [
          { q: "¿Cuánto vale la parte imaginaria de $c\\operatorname{Log} z$? (Es un argumento del resultado.)", type: "numeric", answer: wL[1],
            verify: { kind: "value", tol: 1e-6, fn: () => Z.mul(w, logInt(N.z))[1] } },
          { q: "¿Cuál es el módulo del valor principal?", type: "numeric", answer: mod,
            traps: [{ value: N.mod ** w[0], msg: "Con exponente complejo el módulo no es $|z|^{\\operatorname{Re} c}$: el argumento de $z$ también aporta, a través de $-\\operatorname{Im} c\\cdot\\operatorname{Arg} z$." }].filter(t => far(t.value, mod)),
            // verificación: Log z como integral de 1/ζ y la exponencial como serie
            verify: { kind: "value", tol: 1e-6, fn: () => Z.abs(Z.expS(Z.mul(w, logInt(N.z)))) } }
        ],
        solution: [`[[c3-potencias|Potencia compleja]]: $z^c = e^{c\\log z}$, y el valor principal usa $\\operatorname{Log} z = \\ln ${N.modTex} ${N.ap < 0 ? "-" : "+"} ${pif(Math.abs(N.ap), N.aq)}\\,i$.`,
          `$c\\operatorname{Log} z = (${X.t})\\left(${Z.tex(L, 4)}\\right) \\approx ${Z.tex(wL, 4)}$.`,
          `El módulo del resultado es $e$ elevado a la parte real, $e^{${dn(wL[0], 4)}} \\approx ${dn(mod, 4)}$, y un argumento es la parte imaginaria, $${dn(wL[1], 4)}$.`]
      };
    }
  };

  T["c3-trig-num"] = {
    type: "numeric", concepts: ["c3-trig"], difficulty: 2,
    generate(r) {
      const fn = r.pick(["sin", "cos", "sinh", "cosh"]), circ = fn === "sin" || fn === "cos", ask = r.pick(["real", "imaginaria"]);
      const [p, q] = r.pick([[0, 1], [1, 6], [1, 4], [1, 3], [1, 2], [2, 3], [1, 1], [-1, 6], [-1, 3], [-1, 2]]), k = r.int(2, 4), s = r.sign();
      const th = p * Math.PI / q, lk = s * Math.log(k), z = circ ? [th, lk] : [lk, th];
      const ch = (k + 1 / k) / 2, sh = s * (k - 1 / k) / 2;
      const zT = circ ? (p === 0 ? `${s < 0 ? "-" : ""}i\\ln ${k}` : `${pif(p, q)} ${s < 0 ? "-" : "+"} i\\ln ${k}`) : (p === 0 ? `${s < 0 ? "-" : ""}\\ln ${k}` : `${s < 0 ? "-" : ""}\\ln ${k} ${imTex(p, q, false)}`);
      const res = Z[fn](z), ans = res[ask === "real" ? 0 : 1];
      const formula = { sin: "\\sin(x + iy) = \\sin x\\cosh y + i\\cos x\\sinh y", cos: "\\cos(x + iy) = \\cos x\\cosh y - i\\sin x\\sinh y", sinh: "\\sinh(x + iy) = \\sinh x\\cos y + i\\cosh x\\sin y", cosh: "\\cosh(x + iy) = \\cosh x\\cos y + i\\sinh x\\sin y" }[fn];
      // verificación: con las definiciones por exponenciales, sumadas como series
      const viaExp = () => {
        const u = circ ? Z.mul([0, 1], z) : z, ep = Z.expS(u), em = Z.expS(Z.sc(-1, u));
        return fn === "sin" ? Z.div(Z.sub(ep, em), [0, 2]) : fn === "sinh" ? Z.sc(0.5, Z.sub(ep, em)) : Z.sc(0.5, Z.add(ep, em));
      };
      return {
        prompt: `Calculá la parte ${ask} de $\\${fn}\\left(${zT}\\right)$.`,
        answer: Math.abs(ans) < 1e-12 ? 0 : ans,
        solution: [`[[c3-trig|Funciones trigonométricas e hiperbólicas complejas]]: $${formula}$.`,
          `Con $t = \\ln ${k}$: $\\cosh t = \\dfrac{${k} + \\frac{1}{${k}}}{2} = ${dn(ch, 4)}$ y $\\sinh t = \\dfrac{${k} - \\frac{1}{${k}}}{2} = ${dn((k - 1 / k) / 2, 4)}$ (y $\\sinh(-t) = -\\sinh t$).`,
          `$\\${fn}\\left(${zT}\\right) \\approx ${Z.tex(res.map(x => (Math.abs(x) < 1e-12 ? 0 : x)), 4)}$: la parte ${ask} es $${dn(ans, 4)}$.`],
        verify: { kind: "value", tol: 1e-9, fn: () => viaExp()[ask === "real" ? 0 : 1] }
      };
    }
  };

  const cards = {
    "c3-exponencial": {
      title: "La exponencial compleja", aliases: ["exponencial compleja", "función exponencial compleja", "fórmula de Euler"], concepts: ["c3-exponencial"],
      summary: "e^z = e^x (cos y + i sen y). Es entera, con (e^z)' = e^z; |e^z| = e^x, nunca vale 0, cumple e^(z+w) = e^z e^w y es periódica de período 2πi.",
      def: [R`Para $z = x + iy$ se define $$e^z = e^x(\cos y + i\sin y).$$ Con $x = 0$ queda la **fórmula de Euler**, $e^{iy} = \cos y + i\sin y$, y con $y = 0$, la [[exp-log-func|exponencial real]].`,
        R`**Propiedades.** Es **entera** y $(e^z)' = e^z$. Además: $e^{z + w} = e^z e^w$; $\ |e^z| = e^x$ y $\arg e^z = y + 2k\pi$; $\ e^z \ne 0$ para todo $z$; y $e^{z + 2\pi i} = e^z$ (**período** $2\pi i$).`,
        R`$e^z = 1$ si y solo si $z = 2k\pi i$, con $k$ entero.`],
      idea: [R`La parte real de $z$ controla el **módulo** de $e^z$ y la parte imaginaria, el **ángulo**. Una recta vertical ($x$ fijo) se enrolla infinitas veces sobre una circunferencia de radio $e^x$; una horizontal ($y$ fijo) va a una semirrecta que sale del origen.`,
        R`Por eso $e^z$ repite sus valores cada $2\pi i$: toda la información está en una franja horizontal de ancho $2\pi$, por ejemplo $-\pi < y \le \pi$. Esa franja se transforma en todo el plano menos el origen.`,
        R`A diferencia de la real, la exponencial compleja toma valores negativos: $e^{i\pi} = -1$.`],
      demo: [R`**Paso 1 (es entera).** $u = e^x\cos y$, $v = e^x\sin y$. Entonces $u_x = e^x\cos y = v_y$ y $u_y = -e^x\sin y = -v_x$: se cumple [[c3-derivada|Cauchy-Riemann]] en todo el plano, con parciales continuas.`,
        R`**Paso 2 (su derivada).** $f' = u_x + i\,v_x = e^x\cos y + i\,e^x\sin y = e^z$.`,
        R`**Paso 3 (suma de exponentes).** Con $z = x + iy$, $w = s + it$: $e^ze^w = e^xe^s\,(\cos y + i\sin y)(\cos t + i\sin t)$. Por el producto en [[c3-polar|forma polar]], el último factor es $\cos(y + t) + i\sin(y + t)$, y queda $e^{x + s}\,[\cos(y + t) + i\sin(y + t)] = e^{z + w}$.`,
        R`**Paso 4 (nunca es cero y es periódica).** $|e^z| = e^x\sqrt{\cos^2y + \sin^2y} = e^x > 0$. Y por el paso 3, $e^{z + 2\pi i} = e^z e^{2\pi i} = e^z(\cos 2\pi + i\sin 2\pi) = e^z$. $\blacksquare$`],
      examples: [{ q: R`Calculá $e^{2 + i\pi/2}$ y $e^{\ln 3 + i\pi}$.`, steps: [R`$e^{2 + i\pi/2} = e^2(\cos\frac\pi2 + i\sin\frac\pi2) = e^2\,i$.`, R`$e^{\ln 3 + i\pi} = 3(\cos\pi + i\sin\pi) = -3$.`] }],
      tips: [R`$e^{\bar z} = \overline{e^z}$, así que $e^{\bar z}$ **no** es analítica: una función analítica no puede depender de $\bar z$.`],
      see: ["exp-log-func", "c3-polar", "c3-logaritmo", "c3-trig"]
    },
    "c3-logaritmo": {
      title: "El logaritmo complejo y sus ramas", aliases: ["logaritmo complejo", "logaritmo principal", "rama principal", "corte de rama", "punto de ramificación", "función multivaluada"], concepts: ["c3-logaritmo"],
      summary: "log z = ln|z| + i(Arg z + 2kπ): infinitos valores. El principal es Log z = ln|z| + i Arg z, analítico fuera del semieje real negativo, con derivada 1/z. Las identidades del logaritmo valen entre conjuntos.",
      def: [R`Para $z \ne 0$, las soluciones de $e^w = z$ son $$\log z = \ln|z| + i\,(\operatorname{Arg} z + 2k\pi),\qquad k \in \mathbb Z.$$ Es una función **multivaluada**: infinitos valores, uno arriba de otro, separados $2\pi i$.`,
        R`El **logaritmo principal** es $\operatorname{Log} z = \ln|z| + i\operatorname{Arg} z$, con $-\pi < \operatorname{Arg} z \le \pi$. Es analítico en el plano sin el semieje real negativo ni el origen, y ahí $$\frac{d}{dz}\operatorname{Log} z = \frac1z.$$`,
        R`Una **rama** del logaritmo se obtiene restringiendo el argumento a un intervalo $\alpha < \theta < \alpha + 2\pi$. La semirrecta $\theta = \alpha$ es el **corte de rama**, y el origen, común a todos los cortes, es el **punto de ramificación**.`,
        R`**Identidades (entre conjuntos).** $\log(z_1z_2) = \log z_1 + \log z_2$ y $\log\frac{z_1}{z_2} = \log z_1 - \log z_2$. Con $\operatorname{Log}$ pueden fallar por un múltiplo de $2\pi i$. Siempre vale $e^{\log z} = z$; en cambio $\operatorname{Log}(e^z) = z$ solo si $-\pi < \operatorname{Im} z \le \pi$.`],
      idea: [R`Como $e^w$ repite sus valores cada $2\pi i$, no tiene una inversa única: hay que elegir una franja. Elegir la franja $-\pi < \operatorname{Im} w \le \pi$ da el logaritmo principal.`,
        R`El corte es inevitable: al dar una vuelta completa alrededor del origen, el argumento aumenta $2\pi$ y el logaritmo no vuelve al valor de partida. Ninguna elección continua de $\log z$ funciona en un dominio que rodee al origen.`,
        R`Para $\operatorname{Log}(g(z))$, el corte está donde $g(z)$ es real y $\le 0$. Para ubicarlo se resuelve esa condición.`],
      demo: [R`**Paso 1 (resolver $e^w = z$).** Con $w = u + iv$ y $z = r\,e^{i\theta}$: $e^ue^{iv} = r\,e^{i\theta}$. Igualando módulos, $e^u = r$, o sea $u = \ln r$. Igualando argumentos (que coinciden salvo vueltas), $v = \theta + 2k\pi$.`,
        R`**Paso 2 (analítico: Cauchy-Riemann en polares).** $\operatorname{Log} z = \ln r + i\theta$, con $u = \ln r$, $v = \theta$. Entonces $r\,u_r = 1 = v_\theta$ y $u_\theta = 0 = -r\,v_r$: se cumplen las [[c3-derivada|ecuaciones en polares]], con parciales continuas mientras $\theta$ sea continua, es decir, fuera del corte.`,
        R`**Paso 3 (la derivada).** $f' = e^{-i\theta}(u_r + i\,v_r) = e^{-i\theta}\,\frac1r = \frac{1}{r\,e^{i\theta}} = \frac1z$.`,
        R`**Paso 4 (el producto, entre conjuntos).** $\ln|z_1z_2| = \ln|z_1| + \ln|z_2|$, y $\arg(z_1z_2) = \arg z_1 + \arg z_2$ como conjuntos ([[c3-polar|forma polar]]). Sumando, cada valor de $\log(z_1z_2)$ es suma de un valor de $\log z_1$ y uno de $\log z_2$, y al revés. $\blacksquare$`],
      examples: [{ q: R`Hallá $\log(-1 - i)$ y $\operatorname{Log}(-1 - i)$.`, steps: [R`$|-1 - i| = \sqrt2$ y $\operatorname{Arg}(-1 - i) = -\frac{3\pi}{4}$.`, R`$\operatorname{Log}(-1 - i) = \frac12\ln2 - \frac{3\pi}{4}i$, y $\log(-1 - i) = \frac12\ln 2 + i\left(-\frac{3\pi}{4} + 2k\pi\right)$.`] },
        { q: R`Resolvé $e^z = 1 - i$.`, steps: [R`$z = \log(1 - i) = \frac12\ln2 + i\left(-\frac\pi4 + 2k\pi\right)$, $k \in \mathbb Z$.`] }],
      tips: [R`$\operatorname{Log}$ está definido en el semieje real negativo ($\operatorname{Log}(-1) = \pi i$), pero ahí no es continuo, y por eso no es analítico.`, R`$\operatorname{Log}(z^2) \ne 2\operatorname{Log} z$ en general: probá con $z = -1$.`],
      see: ["exp-log-func", "c3-exponencial", "c3-polar", "c3-potencias"]
    },
    "c3-potencias": {
      title: "Potencias complejas", aliases: ["potencia compleja", "potencias complejas", "exponente complejo", "valor principal de una potencia"], concepts: ["c3-potencias"],
      summary: "z^c = e^(c log z): en general, infinitos valores. El valor principal usa Log z. Con c entero hay un solo valor; con c = p/q irreducible, q valores (las raíces); en otro caso, infinitos.",
      def: [R`Para $z \ne 0$ y $c$ complejo, $$z^c = e^{c\log z}.$$ Como $\log z$ tiene infinitos valores, $z^c$ en general también. El **valor principal** es $e^{c\operatorname{Log} z}$.`,
        R`**Cuántos valores hay.** Si $c$ es entero, uno solo (la potencia de siempre). Si $c = \frac pq$ es una fracción irreducible, exactamente $q$ (son las [[c3-raices|raíces q-ésimas]] de $z^p$). Si $c$ es irracional o no real, infinitos.`,
        R`Fijada una rama de $\log z$, la función $z^c$ es analítica en el dominio de esa rama y $\dfrac{d}{dz}z^c = c\,z^{c - 1}$. La **exponencial de base $c$** es $c^z = e^{z\log c}$; con $c = e$ y el valor principal se recupera $e^z$.`],
      idea: [R`Es la misma idea que en variable real, donde $a^b = e^{b\ln a}$; lo nuevo es que el logaritmo no es único.`,
        R`Resultado sorprendente: $i^i = e^{i\log i} = e^{i\cdot i(\pi/2 + 2k\pi)} = e^{-\pi/2 - 2k\pi}$. Todos los valores son **reales**; el principal es $e^{-\pi/2} \approx 0{,}208$.`,
        R`Las reglas $(z_1z_2)^c = z_1^c z_2^c$ y $(z^c)^d = z^{cd}$ pueden fallar con valores principales, por lo mismo que fallan las del logaritmo.`],
      demo: [R`**Paso 1 (todos los valores).** $z^c = e^{c[\operatorname{Log} z + 2k\pi i]} = e^{c\operatorname{Log} z}\cdot e^{2k\pi i\,c}$. Los distintos valores se obtienen multiplicando el principal por $e^{2k\pi i\,c}$, con $k$ entero.`,
        R`**Paso 2 ($c$ entero).** $2k\pi i\,c$ es múltiplo entero de $2\pi i$, así que $e^{2k\pi ic} = 1$ ([[c3-exponencial|período de la exponencial]]): hay un único valor.`,
        R`**Paso 3 ($c = p/q$ irreducible).** $e^{2\pi i\,kp/q}$ depende solo del resto de $kp$ al dividir por $q$. Como $p$ y $q$ no tienen factores comunes, al variar $k = 0, \dots, q - 1$ esos restos recorren los $q$ valores posibles: hay exactamente $q$ valores.`,
        R`**Paso 4 (los demás casos).** $e^{2k\pi ic} = e^{2m\pi ic}$ exige que $(k - m)c$ sea entero. Si $c$ no es racional (o no es real), eso solo pasa con $k = m$: todos los valores son distintos. $\blacksquare$`],
      examples: [{ q: R`Valor principal de $(1 + i)^i$.`, steps: [R`$\operatorname{Log}(1 + i) = \frac12\ln2 + \frac\pi4 i$. Entonces $i\operatorname{Log}(1 + i) = -\frac\pi4 + \frac{\ln 2}{2}i$.`, R`$(1 + i)^i = e^{-\pi/4}\left[\cos\frac{\ln 2}{2} + i\sin\frac{\ln 2}{2}\right] \approx 0{,}429 + 0{,}155\,i$.`] }],
      tips: [R`Con exponente no real, el módulo de $z^c$ **no** es $|z|^{\operatorname{Re} c}$: también entra el argumento de $z$.`],
      see: ["c3-logaritmo", "c3-raices", "c3-exponencial"]
    },
    "c3-trig": {
      title: "Funciones trigonométricas e hiperbólicas complejas", aliases: ["seno complejo", "coseno complejo", "seno hiperbólico complejo", "funciones trigonométricas complejas"], concepts: ["c3-trig"],
      summary: "sen z = (e^(iz) − e^(−iz))/2i, cos z = (e^(iz) + e^(−iz))/2. Son enteras, valen las identidades de siempre, y sus ceros son los reales; pero no están acotadas: |sen z|² = sen²x + senh²y.",
      def: [R`$$\sin z = \frac{e^{iz} - e^{-iz}}{2i},\qquad \cos z = \frac{e^{iz} + e^{-iz}}{2},\qquad \sinh z = \frac{e^z - e^{-z}}{2},\qquad \cosh z = \frac{e^z + e^{-z}}{2}.$$ Las cuatro son **enteras**, con las derivadas de siempre: $(\sin z)' = \cos z$, $(\cos z)' = -\sin z$, $(\sinh z)' = \cosh z$, $(\cosh z)' = \sinh z$.`,
        R`**Partes real e imaginaria.** $$\sin(x + iy) = \sin x\cosh y + i\cos x\sinh y,\qquad \cos(x + iy) = \cos x\cosh y - i\sin x\sinh y.$$`,
        R`**Relación entre ambas familias.** $\sin(iz) = i\sinh z$, $\ \cos(iz) = \cosh z$, $\ \sinh(iz) = i\sin z$, $\ \cosh(iz) = \cos z$.`,
        R`**Módulos y ceros.** $|\sin z|^2 = \sin^2x + \sinh^2y$ y $|\cos z|^2 = \cos^2x + \sinh^2y$. Los ceros de $\sin z$ son $z = n\pi$ y los de $\cos z$, $z = \frac\pi2 + n\pi$: todos reales. Los de $\sinh z$ son $z = n\pi i$.`],
      idea: [R`Las definiciones salen de despejar el seno y el coseno de la [[c3-exponencial|fórmula de Euler]] y dejar que el ángulo sea complejo.`,
        R`Las [[identidades-trig|identidades]] ($\sin^2z + \cos^2z = 1$, suma de ángulos, ángulo doble) siguen valiendo. Lo que se pierde es la cota: sobre el eje imaginario, $\cos(iy) = \cosh y$ crece como $\frac{e^{|y|}}{2}$. Por eso $\sin z = 2$ **tiene** solución.`,
        R`El seno y el seno hiperbólico son «la misma función» mirada en direcciones perpendiculares: girar la variable un cuarto de vuelta transforma una en la otra.`],
      demo: [R`**Paso 1 (son enteras).** $e^{iz}$ y $e^{-iz}$ son composiciones de funciones enteras, y las sumas y los múltiplos de enteras son enteras. Derivando con la regla de la cadena: $(\sin z)' = \frac{ie^{iz} + ie^{-iz}}{2i} = \cos z$.`,
        R`**Paso 2 (parte real e imaginaria del seno).** Con $z = x + iy$: $e^{iz} = e^{-y}(\cos x + i\sin x)$ y $e^{-iz} = e^{y}(\cos x - i\sin x)$. Restando y dividiendo por $2i$ (o sea, multiplicando por $-\frac i2$): $\sin z = \sin x\,\frac{e^y + e^{-y}}{2} + i\cos x\,\frac{e^y - e^{-y}}{2}$.`,
        R`**Paso 3 (el módulo).** $|\sin z|^2 = \sin^2x\cosh^2y + \cos^2x\sinh^2y$. Reemplazando $\cosh^2y = 1 + \sinh^2y$: $\sin^2x + \sinh^2y\,(\sin^2x + \cos^2x) = \sin^2x + \sinh^2y$.`,
        R`**Paso 4 (los ceros).** Una suma de cuadrados reales es cero solo si los dos lo son: $\sinh y = 0$ da $y = 0$, y $\sin x = 0$ da $x = n\pi$. Además, como $\sinh^2 y \to \infty$ cuando $|y| \to \infty$, $\sin z$ no está acotada. $\blacksquare$`],
      examples: [{ q: R`Calculá $\cos(i\ln 2)$.`, steps: [R`$\cos(iy) = \cosh y$, y $\cosh(\ln 2) = \frac{2 + \frac12}{2} = \frac54$. Un coseno mayor que 1.`] },
        { q: R`Resolvé $\sin z = 0$ y $\cosh z = 0$.`, steps: [R`$\sin z = 0$: $z = n\pi$.`, R`$\cosh z = \cos(iz) = 0$: $iz = \frac\pi2 + n\pi$, o sea $z = \left(\frac\pi2 + n\pi\right)i$ (después de renombrar $n$).`] }],
      tips: [R`$|\sin z| \le 1$ es falso en los complejos. Para acotar integrales usá $|\sin z|^2 = \sin^2x + \sinh^2y$.`],
      see: ["funciones-trig", "identidades-trig", "c3-exponencial"]
    }
  };

  E.extendCourse("m103", {
    concepts: { "c3-exponencial": { name: "Exponencial compleja" }, "c3-logaritmo": { name: "Logaritmo y ramas" }, "c3-potencias": { name: "Potencias complejas" }, "c3-trig": { name: "Trigonométricas e hiperbólicas" } },
    templates: T,
    units: [{
      id: "c3-elementales-u", order: 3, program: "Unidad 3", title: "Funciones elementales", icon: "zap",
      diagnostic: ["c3-exp-cx", "c3-ecuacion-exp-multi", "c3-trig-num"],
      lessons: [
        { id: "c3-exponencial", title: "La exponencial", templates: ["c3-exp-cx", "c3-elementales-vf"], theory: ["c3-exponencial"],
          intro: R`$e^{x + iy} = e^x(\cos y + i\sin y)$: módulo $e^x$, argumento $y$ y período $2\pi i$.` },
        { id: "c3-logaritmo", title: "El logaritmo y sus ramas", templates: ["c3-log-num", "c3-ecuacion-exp-multi", "c3-rama-mc"], theory: ["c3-logaritmo"],
          intro: R`$\log z = \ln|z| + i(\operatorname{Arg} z + 2k\pi)$. El principal, $\operatorname{Log}$, es analítico fuera del semieje real negativo.` },
        { id: "c3-potencias", title: "Potencias y funciones trigonométricas", templates: ["c3-potencia-multi", "c3-trig-num"], theory: ["c3-potencias", "c3-trig"],
          intro: R`$z^c = e^{c\log z}$. $\sin z$ y $\cos z$ se definen con exponenciales y no están acotadas.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 4 · INTEGRACIÓN COMPLEJA: CONTORNOS, CAUCHY-GOURSAT Y FÓRMULA INTEGRAL DE CAUCHY
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, Z = E.c3, dn = Z.dn, pif = Z.pif;
  const T = {};
  const far = (v, ans) => Math.abs(v - ans) > 0.03 * Math.max(1, Math.abs(ans));
  const clean = z => z.map(x => (Math.abs(x) < 1e-12 ? 0 : x));

  T["c3-linea-cx"] = {
    type: "complex", concepts: ["c3-contornos"], difficulty: 2,
    generate(r) {
      const fk = r.pick(["conj", "re", "im"]), pk = r.pick(["seg", "seg", "arc"]);
      const F = { conj: { tex: "\\bar z", f: Z.conj }, re: { tex: "\\operatorname{Re} z", f: z => [z[0], 0] }, im: { tex: "\\operatorname{Im} z", f: z => [z[1], 0] } }[fk];
      let res, g, t1, desc, steps;
      if (pk === "seg") {
        const z1 = [r.int(-2, 2), r.int(-2, 2)], d = [r.nz(-3, 3), r.nz(-3, 3)], z2 = Z.add(z1, d);
        const m = fk === "conj" ? Z.add(Z.conj(z1), Z.sc(0.5, Z.conj(d))) : fk === "re" ? [z1[0] + d[0] / 2, 0] : [z1[1] + d[1] / 2, 0];
        res = Z.mul(d, m); g = t => Z.add(z1, Z.sc(t, d)); t1 = 1;
        desc = `el segmento que va de $${Z.tex(z1)}$ a $${Z.tex(z2)}$`;
        steps = [`Parametrización: $z(t) = ${Z.tex(z1)} + t\\,(${Z.tex(d)})$, con $0 \\le t \\le 1$ y $z'(t) = ${Z.tex(d)}$.`,
          `Sobre el segmento, $${F.tex}$ es una función lineal de $t$, así que su integral entre $0$ y $1$ es su valor en $t = \\frac12$: $${Z.tex(m)}$.`,
          `$\\displaystyle\\int_C ${F.tex}\\,dz = (${Z.tex(m)})(${Z.tex(d)}) = ${Z.tex(res)}$.`];
      } else {
        const Rr = r.int(1, 3), [ap, aq, end] = r.pick([[1, 2, `${Rr === 1 ? "" : Rr}i`], [1, 1, `-${Rr}`], [2, 1, null]]), al = ap * Math.PI / aq, R2 = Rr * Rr, RT = Rr === 1 ? "" : String(Rr);
        const s2 = Math.sin(al) ** 2 / 2, c2 = al / 2 + Math.sin(2 * al) / 4, q2 = al / 2 - Math.sin(2 * al) / 4;
        res = clean(fk === "conj" ? [0, R2 * al] : fk === "re" ? [-R2 * s2, R2 * c2] : [-R2 * q2, R2 * s2]); g = t => Z.polar(Rr, t); t1 = al;
        desc = end ? `el arco de la circunferencia $|z| = ${Rr}$ que va de $${Rr}$ a $${end}$ en sentido antihorario` : `la circunferencia $|z| = ${Rr}$ recorrida una vez en sentido antihorario`;
        const integrand = fk === "conj" ? `${RT}e^{-it}\\cdot ${RT}i\\,e^{it} = ${R2 === 1 ? "" : R2}i` : fk === "re" ? `${RT}\\cos t\\cdot ${RT}i(\\cos t + i\\sin t) = ${R2 === 1 ? "" : R2}\\left(-\\sin t\\cos t + i\\cos^2t\\right)` : `${RT}\\sin t\\cdot ${RT}i(\\cos t + i\\sin t) = ${R2 === 1 ? "" : R2}\\left(-\\sin^2t + i\\sin t\\cos t\\right)`;
        steps = [`Parametrización: $z(t) = ${RT}e^{it}$, con $0 \\le t \\le ${pif(ap, aq)}$ y $z'(t) = ${RT}i\\,e^{it}$.`,
          `El integrando es $f(z(t))\\,z'(t) = ${integrand}$.`,
          `Integrando entre $0$ y $${pif(ap, aq)}$ ${fk === "conj" ? "" : "(con $\\cos^2t = \\frac{1 + \\cos 2t}{2}$, $\\sin^2t = \\frac{1 - \\cos 2t}{2}$) "}queda $\\displaystyle\\int_C ${F.tex}\\,dz \\approx ${Z.tex(res, 4)}$.`];
      }
      // verificación: la integral de contorno calculada numéricamente (Simpson sobre la parametrización, con z' numérica)
      const numI = () => Z.path(F.f, g, 0, t1, 2000);
      return {
        prompt: `Calculá $\\displaystyle\\int_C ${F.tex}\\,dz$, donde $C$ es ${desc}.`,
        answer: res, verify: { kind: "cvalue", tol: 1e-6, fn: numI },
        solution: [`$${F.tex}$ no es analítica, así que no hay primitiva: se calcula con la definición, $\\int_C f\\,dz = \\int_a^b f(z(t))\\,z'(t)\\,dt$ ([[c3-contornos|integral de contorno]]).`, ...steps]
      };
    }
  };

  T["c3-cota-ml-num"] = {
    type: "numeric", concepts: ["c3-contornos"], difficulty: 2,
    generate(r) {
      const form = r.int(0, 2), a = r.int(1, 5), b = r.int(1, 4), Rr = r.int(2, 5);
      const [aname, frac, Lt] = r.pick([["la semicircunferencia superior", 1, "\\pi"], ["el cuarto de circunferencia del primer cuadrante", 0.5, "\\frac{\\pi}{2}"], ["la circunferencia completa", 2, "2\\pi"]]);
      const pw = form === 2 ? 3 : 2;
      if (Rr ** pw - a < 1) return null;
      const numT = form === 0 ? "1" : form === 1 ? `z + ${b}` : `z^2 + ${b}`, denT = form === 2 ? `z^3 - ${a}` : `z^2 + ${a}`;
      const numM = form === 0 ? 1 : form === 1 ? Rr + b : Rr * Rr + b, denM = Rr ** pw - a, L = frac * Math.PI * Rr, ans = numM / denM * L;
      const num = z => (form === 0 ? [1, 0] : form === 1 ? Z.add(z, [b, 0]) : Z.add(Z.mul(z, z), [b, 0])), den = z => (form === 2 ? Z.sub(Z.ipow(z, 3), [a, 0]) : Z.add(Z.mul(z, z), [a, 0]));
      return {
        prompt: `Sea $C$ ${aname} de $|z| = ${Rr}$ (con centro en el origen). Acotando el numerador y el denominador con la desigualdad triangular, ¿qué cota $ML$ se obtiene para $\\left|\\displaystyle\\int_C \\frac{${numT}}{${denT}}\\,dz\\right|$?`,
        answer: ans,
        traps: [{ value: numM / (Rr ** pw + a) * L, msg: "Para acotar una fracción por arriba, el denominador tiene que ser lo más **chico** posible: $|z^n \\pm a| \\ge |z|^n - a$." },
          { value: numM / denM, msg: "Eso es solo $M$, la cota del integrando. Falta multiplicar por la longitud $L$ del contorno." }].filter(t => far(t.value, ans)),
        solution: [`[[c3-contornos|Cota ML]]: si $|f(z)| \\le M$ sobre $C$ y $C$ mide $L$, entonces $\\left|\\int_C f\\,dz\\right| \\le ML$.`,
          `Sobre $C$, $|z| = ${Rr}$. Numerador: ${form === 0 ? "vale $1$" : `$|${numT}| \\le ${form === 1 ? Rr : Rr * Rr} + ${b} = ${numM}$`}. Denominador: $|${denT}| \\ge ${Rr}^${pw} - ${a} = ${denM}$.`,
          `$M = ${H.frac(numM, denM)}$ y $L = ${Lt}\\cdot ${Rr}$${frac === 2 ? "" : ` (${frac === 1 ? "media" : "un cuarto de"} circunferencia)`}: $ML \\approx ${dn(ans, 4)}$.`],
        // verificación: el máximo del numerador y el mínimo del denominador se buscan numéricamente sobre el arco
        verify: { kind: "value", tol: 1e-6, fn: () => {
          let nM = 0, dM = Infinity;
          for (let k = 0; k <= 20000; k++) { const z = Z.polar(Rr, frac * Math.PI * k / 20000); nM = Math.max(nM, Z.abs(num(z))); dM = Math.min(dM, Z.abs(den(z))); }
          return nM / dM * L;
        } }
      };
    }
  };

  T["c3-primitiva-cx"] = {
    type: "complex", concepts: ["c3-primitivas"], difficulty: 1,
    generate(r) {
      const a = r.int(-3, 3), b = r.nz(-4, 4), form = r.pick(["cub", "cuar"]);
      const z1 = [r.int(-2, 2), r.int(-2, 2)], d = [r.nz(-2, 2), r.nz(-2, 2)], z2 = Z.add(z1, d);
      const fT = form === "cub" ? H.poly([[3, "z^{2}"], [2 * a, "z"], [b, ""]]) : H.poly([[4, "z^{3}"], [b, ""]]);
      const FT = form === "cub" ? H.poly([[1, "z^{3}"], [a, "z^{2}"], [b, "z"]]) : H.poly([[1, "z^{4}"], [b, "z"]]);
      const f = z => (form === "cub" ? Z.add(Z.add(Z.sc(3, Z.mul(z, z)), Z.sc(2 * a, z)), [b, 0]) : Z.add(Z.sc(4, Z.ipow(z, 3)), [b, 0]));
      const P = z => (form === "cub" ? Z.add(Z.add(Z.ipow(z, 3), Z.sc(a, Z.mul(z, z))), Z.sc(b, z)) : Z.add(Z.ipow(z, 4), Z.sc(b, z)));
      const res = Z.sub(P(z2), P(z1));
      // verificación: la integral numérica sobre un camino curvo cualquiera entre los dos puntos (no el segmento)
      const numI = () => Z.path(f, t => Z.add(Z.add(z1, Z.sc(t, d)), Z.mul([0, 0.7 * t * (1 - t)], d)), 0, 1, 2000);
      return {
        prompt: `Calculá $\\displaystyle\\int_C \\left(${fT}\\right)dz$, donde $C$ es cualquier contorno que va de $${Z.tex(z1)}$ a $${Z.tex(z2)}$.`,
        answer: res, verify: { kind: "cvalue", tol: 1e-6, fn: numI },
        solution: [`El integrando es un polinomio: es entero y tiene [[c3-primitivas|primitiva]] $F(z) = ${FT}$. Por eso la integral no depende del camino: vale $F(z_2) - F(z_1)$.`,
          `$F(${Z.tex(z2)}) = ${Z.tex(P(z2))}$ y $F(${Z.tex(z1)}) = ${Z.tex(P(z1))}$.`,
          `$\\displaystyle\\int_C f\\,dz = ${Z.tex(res)}$.`]
      };
    }
  };

  T["c3-cauchy-goursat-vf"] = {
    type: "tf", concepts: ["c3-cauchy-goursat"], difficulty: 2,
    generate(r) {
      const Rr = r.int(1, 3), kind = r.pick(["inv", "inv", "expq", "inv2", "conj", "ent", "log", "log"]);
      let a = r.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].filter(x => Math.abs(x) !== Rr));
      let tex, f, val, why;
      const sgn = a < 0 ? "+" : "-", A = Math.abs(a);
      if (kind === "inv") { tex = `\\dfrac{1}{z ${sgn} ${A}}`; f = z => Z.div([1, 0], Z.sub(z, [a, 0])); val = A > Rr; why = val ? `El único punto singular, $z = ${a}$, queda fuera del contorno: adentro el integrando es analítico y vale Cauchy-Goursat.` : `El punto singular $z = ${a}$ queda adentro. Por la fórmula integral de Cauchy (con $f = 1$), la integral vale $2\\pi i$.`; }
      else if (kind === "expq") { tex = `\\dfrac{e^z}{z ${sgn} ${A === 1 ? "" : A}i}`; f = z => Z.div(Z.exp(z), Z.sub(z, [0, a])); val = A > Rr; why = val ? `El punto singular $z = ${Z.tex([0, a])}$ está fuera del contorno ($|z| = ${A} > ${Rr}$): el integrando es analítico adentro.` : `El punto singular $z = ${Z.tex([0, a])}$ está adentro, y la integral vale $2\\pi i\\,e^{${Z.tex([0, a])}} \\ne 0$.`; }
      else if (kind === "inv2") { if (A > Rr) a = 0; tex = a === 0 ? `\\dfrac{1}{z^2}` : `\\dfrac{1}{(z ${sgn} ${A})^2}`; f = z => Z.div([1, 0], Z.ipow(Z.sub(z, [a, 0]), 2)); val = true; why = `El integrando no es analítico adentro, así que Cauchy-Goursat no se aplica. Pero tiene **primitiva**, $-\\dfrac{1}{${a === 0 ? "z" : `z ${sgn} ${A}`}}$, en un dominio que contiene al contorno, y la integral de una función con primitiva sobre una curva cerrada es $0$.`; }
      else if (kind === "conj") { tex = `\\bar z`; f = Z.conj; val = false; why = `$\\bar z$ no es analítica. Parametrizando, $\\oint \\bar z\\,dz = \\int_0^{2\\pi} ${Rr === 1 ? "" : Rr}e^{-it}\\,${Rr === 1 ? "" : Rr}i\\,e^{it}\\,dt = ${pif(2 * Rr * Rr)}\\,i$.`; }
      else if (kind === "ent") { tex = r.pick([`z^2e^{z}`, `z\\cos z`]); f = tex.includes("cos") ? z => Z.mul(z, Z.cos(z)) : z => Z.mul(Z.mul(z, z), Z.exp(z)); val = true; why = `El integrando es entero (producto de funciones enteras): por Cauchy-Goursat la integral sobre cualquier contorno cerrado es $0$.`; }
      else { a = A; tex = `\\operatorname{Log}(z + ${a})`; f = z => Z.log(Z.add(z, [a, 0])); val = a > Rr; why = val ? `El corte de $\\operatorname{Log}(z + ${a})$ es la semirrecta real $x \\le -${a}$, que no toca al disco $|z| \\le ${Rr}$: el integrando es analítico dentro y sobre el contorno.` : `El corte de $\\operatorname{Log}(z + ${a})$ es la semirrecta real $x \\le -${a}$, que **atraviesa** el contorno: el integrando ni siquiera es continuo sobre él, y la integral no da $0$.`; }
      return {
        prompt: `<b>Verdadero o falso:</b> $\\displaystyle\\oint_{|z| = ${Rr}} ${tex}\\,dz = 0$ (contorno recorrido en sentido positivo).`,
        answer: val,
        explanation: `${why} Ver [[c3-cauchy-goursat|teorema de Cauchy-Goursat]].`,
        solution: [`Lo primero es ubicar los puntos donde el integrando no es analítico y ver si quedan dentro del contorno.`],
        // verificación: la integral sobre la circunferencia, calculada numéricamente
        verify: { kind: "truth", fn: () => Z.abs(Z.circ(f, [0, 0], Rr, 6000)) < 1e-6 }
      };
    }
  };

  T["c3-cauchy-formula-num"] = {
    type: "numeric", concepts: ["c3-cauchy-formula"], difficulty: 2,
    generate(r) {
      const Rr = r.pick([1, 3]), a = r.pick(Rr === 1 ? [0, 0, 2, -2] : [0, 1, -1, 2, -2]), n = r.int(0, 2), kind = r.pick(["exp", "pol", "cos", "sin"]), k = r.pick([1, 2, -1]), b = r.nz(-3, 3);
      const D = {
        exp: { tex: `e^{${H.kx(k, "z")}}`, f: z => Z.exp(Z.sc(k, z)), d: [Math.exp(k * a), k * Math.exp(k * a), k * k * Math.exp(k * a)], dT: [`e^{${H.kx(k, "z")}}`, `${H.cf(k)}e^{${H.kx(k, "z")}}`, `${H.cf(k * k)}e^{${H.kx(k, "z")}}`] },
        pol: { tex: `z^4 ${b < 0 ? "-" : "+"} ${H.kx(Math.abs(b), "z^2")}`, f: z => Z.add(Z.ipow(z, 4), Z.sc(b, Z.mul(z, z))), d: [a ** 4 + b * a * a, 4 * a ** 3 + 2 * b * a, 12 * a * a + 2 * b], dT: [`z^4 ${b < 0 ? "-" : "+"} ${H.kx(Math.abs(b), "z^2")}`, H.poly([[4, "z^{3}"], [2 * b, "z"]]), H.poly([[12, "z^{2}"], [2 * b, ""]])] },
        cos: { tex: `\\cos z`, f: Z.cos, d: [Math.cos(a), -Math.sin(a), -Math.cos(a)], dT: [`\\cos z`, `-\\sin z`, `-\\cos z`] },
        sin: { tex: `\\sin z`, f: Z.sin, d: [Math.sin(a), Math.cos(a), -Math.sin(a)], dT: [`\\sin z`, `\\cos z`, `-\\sin z`] }
      }[kind];
      const inside = Math.abs(a) < Rr, fact = [1, 1, 2][n], K = inside ? D.d[n] / fact : 0;
      const zm = a === 0 ? "z" : `z ${a < 0 ? "+" : "-"} ${Math.abs(a)}`, denT = n === 0 ? zm : a === 0 ? `z^{${n + 1}}` : `(${zm})^{${n + 1}}`;
      return {
        prompt: `Calculá $\\displaystyle\\oint_{|z| = ${Rr}} \\frac{${D.tex}}{${denT}}\\,dz$ (sentido positivo). El resultado es $2\\pi i\\,K$, con $K$ real: ¿cuánto vale $K$?`,
        answer: Math.abs(K) < 1e-12 ? 0 : K,
        traps: [...(inside && n === 2 ? [{ value: D.d[2], msg: "Falta dividir por $n!$: la fórmula para las derivadas es $\\oint \\frac{f(z)}{(z - a)^{n+1}}dz = \\frac{2\\pi i}{n!}f^{(n)}(a)$." }] : []),
          ...(!inside ? [{ value: D.d[n] / fact, msg: `Fijate dónde está $z = ${a}$: queda **fuera** de la circunferencia $|z| = ${Rr}$.` }] : [])].filter(t => far(t.value, K)),
        solution: inside ? [`El punto $z = ${a}$ está dentro del contorno y $f(z) = ${D.tex}$ es entera. [[c3-cauchy-formula|Fórmula integral de Cauchy]]${n ? " para las derivadas" : ""}: $\\displaystyle\\oint \\frac{f(z)}{(z - a)^{n+1}}\\,dz = \\frac{2\\pi i}{n!}\\,f^{(n)}(a)$, con $n = ${n}$.`,
          `${n === 0 ? `$f(${a})` : n === 1 ? `$f'(z) = ${D.dT[1]}$, y $f'(${a})` : `$f''(z) = ${D.dT[2]}$, y $f''(${a})`} = ${dn(D.d[n], 4)}$.`,
          `$K = \\dfrac{f^{(${n})}(${a})}{${n}!} = ${dn(K, 4)}$.`]
          : [`El punto $z = ${a}$ está **fuera** de la circunferencia $|z| = ${Rr}$. Dentro y sobre el contorno el integrando es analítico.`, `Por [[c3-cauchy-goursat|Cauchy-Goursat]], la integral vale $0$: $K = 0$.`],
        // verificación: la integral sobre la circunferencia calculada numéricamente, dividida por 2πi
        verify: { kind: "value", tol: 1e-6, fn: () => Z.div(Z.circ(z => Z.div(D.f(z), Z.ipow(Z.sub(z, [a, 0]), n + 1)), [0, 0], Rr, 6000), [0, 2 * Math.PI])[0] }
      };
    }
  };

  const FS = [Z.exp, Z.sin, Z.cos, z => Z.mul(z, z), z => Z.add(Z.ipow(z, 3), [1, 2])];
  const ring = (rad, n = 720) => Array.from({ length: n }, (_, k) => Z.polar(rad, 2 * Math.PI * k / n));
  const THMS = [
    { t: R`toda función entera y acotada es constante`, v: true, why: R`Es el teorema de Liouville: por la desigualdad de Cauchy, $|f'(z_0)| \le \frac MR$ para todo $R$, así que $f' = 0$.`,
      test: () => FS.every(f => Math.max(...ring(40).map(z => Z.abs(f(z)))) > 1e3) },
    { t: R`$\sin z$ es una función entera y acotada`, v: false, why: R`Es entera, pero no acotada: $|\sin(iy)| = |\sinh y| \to \infty$. Si fuera acotada, por Liouville sería constante.`,
      test: () => Math.max(...ring(40).map(z => Z.abs(Z.sin(z)))) <= 1 },
    { t: R`si $f$ es analítica y no constante en el disco $|z| \le 1$, el máximo de $|f|$ se alcanza sobre la circunferencia $|z| = 1$`, v: true, why: R`Es el principio del módulo máximo: $|f|$ no puede tener un máximo en un punto interior, salvo que $f$ sea constante.`,
      test: () => FS.every(f => { const mb = Math.max(...ring(1).map(z => Z.abs(f(z)))); for (let x = -0.95; x < 1; x += 0.05) for (let y = -0.95; y < 1; y += 0.05) if (x * x + y * y < 0.95 && Z.abs(f([x, y])) > mb + 1e-9) return false; return true; }) },
    { t: R`el máximo de $|e^z|$ en el disco $|z| \le 2$ se alcanza en el centro, $z = 0$`, v: false, why: R`$|e^z| = e^x$, que es máximo donde $x$ es máximo: en $z = 2$, sobre el borde, como exige el principio del módulo máximo.`,
      test: () => ring(2).every(z => Z.abs(Z.exp(z)) <= 1 + 1e-9) },
    { t: R`todo polinomio de grado $n \ge 1$ con coeficientes complejos tiene al menos una raíz compleja`, v: true, why: R`Es el teorema fundamental del álgebra. Si $P$ no tuviera raíces, $\frac1P$ sería entera y acotada, y por Liouville, constante.`,
      test: () => [[[1, 0], [0, 2], [3, -1], [1, 1]], [[2, 1], [0, 0], [0, 0], [0, 0], [-1, 4]], [[1, 0], [-3, 0], [3, 0], [-1, 0.5]]].every(c => Z.roots(c).every(z => { let p = c[0]; for (let j = 1; j < c.length; j++) p = Z.add(Z.mul(p, z), c[j]); return Z.abs(p) < 1e-6; })) },
    { t: R`si $f$ es analítica dentro y sobre un contorno cerrado simple $C$, entonces $\oint_C f(z)\,dz = 0$`, v: true, why: R`Es el teorema de Cauchy-Goursat.`,
      test: () => FS.every(f => Z.abs(Z.circ(f, [0.3, -0.2], 1.5)) < 1e-8) },
    { t: R`si $\oint_C f(z)\,dz = 0$ para una circunferencia $C$, entonces $f$ es analítica en todo el interior de $C$`, v: false, why: R`Contraejemplo: $f(z) = \frac{1}{z^2}$ sobre $|z| = 1$. La integral da $0$ (tiene primitiva $-\frac1z$), pero $f$ no es analítica en $z = 0$. La recíproca de Cauchy-Goursat (Morera) pide que la integral se anule sobre **todos** los contornos cerrados del dominio.`,
      test: () => { const f = z => Z.div([1, 0], Z.mul(z, z)); return !(Z.abs(Z.circ(f, [0, 0], 1)) < 1e-9 && Z.abs(f([1e-4, 0])) > 1e6); } },
    { t: R`el valor de una función analítica en el centro de un círculo es el promedio de sus valores sobre la circunferencia`, v: true, why: R`Es la propiedad del valor medio de Gauss: sale de la fórmula integral de Cauchy con $z = z_0 + Re^{it}$.`,
      test: () => FS.every(f => { const z0 = [0.4, 0.7], vs = ring(1.3).map(e => f(Z.add(z0, e))); return Z.abs(Z.sub(Z.sc(1 / vs.length, vs.reduce(Z.add)), f(z0))) < 1e-9; }) },
    { t: R`$\oint_{|z| = 1} \bar z\,dz = 0$, porque la curva es cerrada`, v: false, why: R`Que la curva sea cerrada no alcanza: hace falta que el integrando sea analítico (o que tenga primitiva). Acá $\oint \bar z\,dz = 2\pi i$.`,
      test: () => Z.abs(Z.circ(Z.conj, [0, 0], 1)) < 1e-9 },
    { t: R`la integral $\int \frac{dz}{z}$ de $-i$ a $i$ vale lo mismo por la mitad derecha que por la mitad izquierda de la circunferencia $|z| = 1$`, v: false, why: R`Entre los dos caminos queda encerrado el punto singular $z = 0$. Por la derecha da $\pi i$ y por la izquierda, $-\pi i$: difieren en $2\pi i$.`,
      test: () => { const inv = z => Z.div([1, 0], z), a = Z.path(inv, t => Z.polar(1, -Math.PI / 2 + t), 0, Math.PI), b = Z.path(inv, t => Z.polar(1, -Math.PI / 2 - t), 0, Math.PI); return Z.abs(Z.sub(a, b)) < 1e-6; } },
    { t: R`si $f$ es analítica en un dominio, su derivada $f'$ también es analítica ahí`, v: true, why: R`Por la fórmula integral de Cauchy para las derivadas, una función analítica tiene derivadas de todos los órdenes, y todas son analíticas. No pasa nada parecido en variable real.`,
      test: () => FS.every(f => { const fp = z => Z.dz(f, z, [1e-4, 0]), z0 = [0.3, 0.5]; return Z.abs(Z.sub(Z.dz(fp, z0, [1e-3, 0]), Z.dz(fp, z0, [0, 1e-3]))) < 1e-4; }) },
    { t: R`los valores de una función analítica dentro de un contorno cerrado simple quedan determinados por sus valores sobre el contorno`, v: true, why: R`Es lo que dice la fórmula integral de Cauchy: $f(z_0) = \frac{1}{2\pi i}\oint_C \frac{f(z)}{z - z_0}\,dz$.`,
      test: () => FS.every(f => { const z0 = [0.5, -0.4]; return Z.abs(Z.sub(Z.div(Z.circ(z => Z.div(f(z), Z.sub(z, z0)), [0, 0], 2), [0, 2 * Math.PI]), f(z0))) < 1e-8; }) }
  ];
  T["c3-teoremas-vf"] = {
    type: "tf", concepts: ["c3-liouville", "c3-cauchy-formula"], difficulty: 2,
    generate(r) {
      const S = r.pick(THMS);
      return {
        prompt: `<b>Verdadero o falso:</b> ${S.t}.`,
        answer: S.v,
        explanation: `${S.v ? "Verdadero" : "Falso"}. ${S.why}`,
        solution: [`Repasá las consecuencias de la [[c3-cauchy-formula|fórmula integral de Cauchy]]: [[c3-liouville|Liouville, el teorema fundamental del álgebra y el módulo máximo]].`],
        // verificación: cada afirmación se pone a prueba con un experimento numérico (integrales, máximos sobre grillas, raíces)
        verify: { kind: "truth", fn: S.test }
      };
    }
  };

  const cards = {
    "c3-contornos": {
      title: "Integrales de contorno y cota ML", aliases: ["integral de contorno", "contorno", "cota ML", "desigualdad ML", "integral compleja"], concepts: ["c3-contornos"],
      summary: "∫_C f dz = ∫ f(z(t)) z'(t) dt sobre una parametrización del contorno. Cambia de signo al invertir el sentido y, si |f| ≤ M sobre C y C mide L, |∫_C f dz| ≤ ML.",
      def: [R`Un **contorno** $C$ es una curva $z(t)$, $a \le t \le b$, formada por un número finito de tramos suaves unidos por sus extremos. Es **cerrado simple** si termina donde empieza y no se corta a sí mismo; su sentido **positivo** es el antihorario.`,
        R`La **integral de contorno** de $f$ (continua sobre $C$) es $$\int_C f(z)\,dz = \int_a^b f(z(t))\,z'(t)\,dt.$$ No depende de la parametrización, pero sí del sentido: $\int_{-C} f\,dz = -\int_C f\,dz$. Es lineal y aditiva sobre contornos encadenados.`,
        R`La **longitud** del contorno es $L = \int_a^b |z'(t)|\,dt$. **Cota ML:** si $|f(z)| \le M$ para todo $z$ de $C$, $$\left|\int_C f(z)\,dz\right| \le ML.$$`],
      idea: [R`Es la [[c2-linea|integral de línea]] de Cálculo II con otro traje: escribiendo $f = u + iv$ y $dz = dx + i\,dy$, queda $\int_C (u\,dx - v\,dy) + i\int_C (v\,dx + u\,dy)$.`,
        R`En general el resultado **depende del camino**. La gran excepción son las funciones analíticas, y de eso trata el resto de la unidad.`,
        R`La cota ML se usa todo el tiempo para mostrar que una integral sobre un arco grande (o chico) tiende a cero. Para acotar una fracción: numerador lo más grande posible, $|z + a| \le |z| + |a|$, y denominador lo más chico, $|z + a| \ge \big||z| - |a|\big|$.`,
        R`Dos integrales para saber de memoria, sobre la circunferencia $|z - z_0| = R$ en sentido positivo: $\oint \frac{dz}{z - z_0} = 2\pi i$ y $\oint (z - z_0)^n\,dz = 0$ para todo entero $n \ne -1$.`],
      demo: [R`**Paso 1 (el caso real).** Para una función compleja $w(t)$ de variable real vale $\left|\int_a^b w(t)\,dt\right| \le \int_a^b |w(t)|\,dt$. En efecto, si la integral es $r_0e^{i\theta_0}$, entonces $r_0 = \int_a^b e^{-i\theta_0}w\,dt$, que es real, así que $r_0 = \int_a^b \operatorname{Re}(e^{-i\theta_0}w)\,dt \le \int_a^b |e^{-i\theta_0}w|\,dt = \int_a^b |w|\,dt$.`,
        R`**Paso 2 (aplicarlo al contorno).** Con $w(t) = f(z(t))\,z'(t)$: $\left|\int_C f\,dz\right| \le \int_a^b |f(z(t))|\,|z'(t)|\,dt$.`,
        R`**Paso 3 (acotar).** Como $|f(z(t))| \le M$, la última integral no supera $M\int_a^b |z'(t)|\,dt = ML$. $\blacksquare$`],
      examples: [{ q: R`Calculá $\oint_{|z| = 1} \frac{dz}{z}$.`, steps: [R`$z = e^{it}$, $0 \le t \le 2\pi$, $dz = ie^{it}\,dt$.`, R`$\int_0^{2\pi} e^{-it}\,ie^{it}\,dt = \int_0^{2\pi} i\,dt = 2\pi i$.`] },
        { q: R`Mostrá que $\left|\int_{C_R}\frac{dz}{z^2 + 1}\right| \to 0$ sobre la semicircunferencia superior de radio $R \to \infty$.`, steps: [R`$|z^2 + 1| \ge R^2 - 1$, así que $M = \frac{1}{R^2 - 1}$; $L = \pi R$.`, R`$ML = \frac{\pi R}{R^2 - 1} \to 0$.`] }],
      tips: [R`No te olvides de $z'(t)$: integrar $f(z(t))$ a secas es el error más común.`],
      see: ["c2-linea", "c3-primitivas", "c3-cauchy-goursat"]
    },
    "c3-primitivas": {
      title: "Primitivas e independencia del camino", aliases: ["primitiva compleja", "antiderivada compleja", "independencia del camino en el plano complejo"], concepts: ["c3-primitivas"],
      summary: "En un dominio D son equivalentes: f tiene primitiva F en D; las integrales de f no dependen del camino; la integral de f sobre todo contorno cerrado de D es 0. En ese caso ∫ f dz = F(z₂) − F(z₁).",
      def: [R`Sea $f$ continua en un dominio $D$. Son **equivalentes**: (a) $f$ tiene una **primitiva** $F$ en $D$ (analítica, con $F' = f$); (b) la integral de $f$ entre dos puntos de $D$ es la misma por todos los contornos contenidos en $D$; (c) la integral de $f$ sobre todo contorno cerrado contenido en $D$ vale $0$.`,
        R`Cuando se cumplen, $$\int_{z_1}^{z_2} f(z)\,dz = F(z_2) - F(z_1).$$`],
      idea: [R`Es el teorema fundamental del cálculo ([[tfc|regla de Barrow]]) y la teoría de [[c2-campos|campos conservativos]], todo junto.`,
        R`El dominio importa. $\frac1z$ tiene primitiva $\operatorname{Log} z$ en el plano cortado, pero **no** en el plano pinchado: por eso $\oint_{|z|=1}\frac{dz}{z} = 2\pi i \ne 0$. En cambio $\frac{1}{z^2}$ sí tiene primitiva en el plano pinchado, $-\frac1z$, y su integral sobre cualquier curva cerrada que no pase por $0$ es $0$.`],
      demo: [R`**Paso 1 ((a) ⇒ (b)).** Si $F' = f$, por la regla de la cadena $\frac{d}{dt}F(z(t)) = f(z(t))\,z'(t)$. Entonces $\int_C f\,dz = \int_a^b \frac{d}{dt}F(z(t))\,dt = F(z(b)) - F(z(a))$, que solo depende de los extremos.`,
        R`**Paso 2 ((b) ⇔ (c)).** Dos caminos $C_1$ y $C_2$ de $z_1$ a $z_2$ forman el contorno cerrado $C_1 - C_2$, y $\int_{C_1} - \int_{C_2} = \oint_{C_1 - C_2}$. Una cosa vale cero exactamente cuando la otra también.`,
        R`**Paso 3 ((b) ⇒ (a): construir $F$).** Se fija $z_0 \in D$ y se define $F(z) = \int_{z_0}^z f(s)\,ds$, que por (b) no depende del camino. Para $\Delta z$ chico, $F(z + \Delta z) - F(z) = \int_z^{z + \Delta z} f(s)\,ds$ sobre el segmento.`,
        R`**Paso 4 (derivar).** Como $\int_z^{z+\Delta z} ds = \Delta z$: $\frac{F(z + \Delta z) - F(z)}{\Delta z} - f(z) = \frac{1}{\Delta z}\int_z^{z+\Delta z}[f(s) - f(z)]\,ds$. Por la [[c3-contornos|cota ML]], su módulo no supera $\max|f(s) - f(z)|$ sobre el segmento, que tiende a $0$ porque $f$ es continua. Luego $F' = f$. $\blacksquare$`],
      examples: [{ q: R`$\int_0^{1+i} z^2\,dz$.`, steps: [R`$z^2$ es entera, con primitiva $\frac{z^3}{3}$: $\frac{(1 + i)^3}{3} = \frac{-2 + 2i}{3}$, por cualquier camino.`] }],
      see: ["tfc", "c2-campos", "c3-contornos", "c3-cauchy-goursat", "c3-logaritmo"]
    },
    "c3-cauchy-goursat": {
      title: "Teorema de Cauchy-Goursat y deformación de contornos", aliases: ["teorema de Cauchy-Goursat", "Cauchy-Goursat", "deformación de contornos", "dominio simplemente conexo", "dominio múltiplemente conexo"], concepts: ["c3-cauchy-goursat"],
      summary: "Si f es analítica dentro y sobre un contorno cerrado simple C, ∮ f dz = 0. Consecuencia: un contorno se puede deformar sin cambiar la integral, mientras no cruce puntos donde f no es analítica.",
      def: [R`**Teorema de Cauchy-Goursat.** Si $f$ es analítica en todos los puntos interiores a un contorno cerrado simple $C$ y sobre $C$, $$\oint_C f(z)\,dz = 0.$$`,
        R`Un dominio es **simplemente conexo** si todo contorno cerrado simple en él encierra solo puntos del dominio (no tiene agujeros). En un dominio así, toda función analítica tiene [[c3-primitivas|primitiva]].`,
        R`**Dominios con agujeros.** Si $C$ es un contorno cerrado simple positivo, $C_1, \dots, C_n$ son contornos cerrados simples positivos interiores a $C$, sin puntos comunes, y $f$ es analítica en la región entre ellos y sobre todos, entonces $$\oint_C f\,dz = \sum_{k=1}^n \oint_{C_k} f\,dz.$$ En particular (**deformación de contornos**), $\oint_{C} f = \oint_{C_1} f$ si $f$ es analítica entre $C$ y $C_1$.`],
      idea: [R`Es el teorema central de la materia. Dice que para funciones analíticas, lo único que importa de un contorno cerrado es **qué puntos singulares encierra**.`,
        R`Deformar contornos permite cambiar una curva complicada por circunferencias chiquitas alrededor de cada punto singular. De ahí salen la fórmula integral de Cauchy y el teorema de los residuos.`,
        R`Cauchy lo probó suponiendo $f'$ continua (con el teorema de Green); Goursat mostró que esa hipótesis sobra. Parece un detalle técnico, pero es lo que permite después demostrar que $f'$ es continua sin haberlo supuesto.`],
      demo: [R`**Paso 1 (separar en partes real e imaginaria).** Con $f = u + iv$: $\oint_C f\,dz = \oint_C (u\,dx - v\,dy) + i\oint_C (v\,dx + u\,dy)$.`,
        R`**Paso 2 (teorema de Green).** Suponiendo $f'$ continua, las parciales de $u$ y $v$ son continuas y vale el [[c2-green|teorema de Green]] en la región $R$ que encierra $C$: $\oint_C (u\,dx - v\,dy) = \iint_R (-v_x - u_y)\,dA$ y $\oint_C (v\,dx + u\,dy) = \iint_R (u_x - v_y)\,dA$.`,
        R`**Paso 3 (Cauchy-Riemann).** Por las [[c3-derivada|ecuaciones de Cauchy-Riemann]], $u_y = -v_x$ y $u_x = v_y$: los dos integrandos son cero en todo $R$, y la integral vale $0$. (La prueba de Goursat, sin suponer $f'$ continua, subdivide la región en cuadrados cada vez más chicos.)`,
        R`**Paso 4 (contornos interiores).** Se une $C$ con cada $C_k$ mediante un corte. El contorno que recorre $C$, baja por un corte, da la vuelta a $C_k$ **al revés** y vuelve por el mismo corte encierra una región sin agujeros donde $f$ es analítica: su integral es $0$. Las integrales sobre los cortes se cancelan (se recorren en los dos sentidos), y queda $\oint_C f - \sum\oint_{C_k} f = 0$. $\blacksquare$`],
      examples: [{ q: R`$\oint_{|z| = 2}\frac{e^z}{z^2 + 9}\,dz$.`, steps: [R`Los puntos singulares son $\pm3i$, fuera de $|z| = 2$. El integrando es analítico dentro y sobre el contorno: la integral vale $0$.`] },
        { q: R`$\oint_C \frac{dz}{z - 1}$ sobre el cuadrado de vértices $\pm3 \pm 3i$.`, steps: [R`Se deforma el cuadrado a una circunferencia chica centrada en $1$: la integral vale $2\pi i$.`] }],
      tips: [R`Antes de escribir «$= 0$», revisá que no haya puntos singulares **dentro** del contorno, y que el contorno no cruce ningún corte de rama.`],
      see: ["c2-green", "c3-derivada", "c3-primitivas", "c3-cauchy-formula"]
    },
    "c3-cauchy-formula": {
      title: "Fórmula integral de Cauchy", aliases: ["fórmula integral de Cauchy", "fórmula de Cauchy", "fórmula de Cauchy para las derivadas", "teorema de Morera"], concepts: ["c3-cauchy-formula"],
      summary: "Si f es analítica dentro y sobre C y z₀ está adentro: f(z₀) = (1/2πi) ∮ f(z)/(z − z₀) dz, y f⁽ⁿ⁾(z₀) = (n!/2πi) ∮ f(z)/(z − z₀)ⁿ⁺¹ dz. Una función analítica tiene derivadas de todos los órdenes.",
      def: [R`Sea $f$ analítica dentro y sobre un contorno cerrado simple $C$, recorrido en sentido positivo, y $z_0$ un punto interior a $C$. Entonces $$f(z_0) = \frac{1}{2\pi i}\oint_C \frac{f(z)}{z - z_0}\,dz.$$`,
        R`**Para las derivadas.** $f$ tiene derivadas de todos los órdenes en $z_0$, y $$f^{(n)}(z_0) = \frac{n!}{2\pi i}\oint_C \frac{f(z)}{(z - z_0)^{n+1}}\,dz.$$ En consecuencia, la derivada de una función analítica es analítica.`,
        R`**Para calcular integrales** se usa al revés: $\displaystyle\oint_C \frac{f(z)}{(z - z_0)^{n+1}}\,dz = \frac{2\pi i}{n!}\,f^{(n)}(z_0)$.`,
        R`**Teorema de Morera** (recíproco de Cauchy-Goursat): si $f$ es continua en un dominio $D$ y $\oint_C f\,dz = 0$ para todo contorno cerrado en $D$, entonces $f$ es analítica en $D$.`],
      idea: [R`Los valores de una función analítica sobre un contorno determinan **todos** sus valores adentro. Nada parecido pasa en variable real: conocer una función derivable en los extremos de un intervalo no dice nada del medio.`,
        R`Es la versión compleja de la propiedad del promedio de las [[c3-armonicas|funciones armónicas]]: con $C$ una circunferencia centrada en $z_0$, la fórmula dice que $f(z_0)$ es el promedio de $f$ sobre $C$.`,
        R`Para usarla: escribí el integrando como $\frac{f(z)}{(z - z_0)^{n+1}}$, con $f$ **analítica dentro del contorno**. Todo lo que no sea el factor singular va a $f$.`],
      demo: [R`**Paso 1 (achicar el contorno).** $\frac{f(z)}{z - z_0}$ es analítica dentro de $C$ salvo en $z_0$. Por [[c3-cauchy-goursat|deformación de contornos]], la integral sobre $C$ es igual a la integral sobre una circunferencia $C_\rho$: $|z - z_0| = \rho$, tan chica como se quiera.`,
        R`**Paso 2 (separar).** $\oint_{C_\rho}\frac{f(z)}{z - z_0}\,dz = f(z_0)\oint_{C_\rho}\frac{dz}{z - z_0} + \oint_{C_\rho}\frac{f(z) - f(z_0)}{z - z_0}\,dz$. La primera integral vale $2\pi i$ ([[c3-contornos|integral de contorno]]).`,
        R`**Paso 3 (el resto tiende a cero).** Como $f$ es continua en $z_0$, dado $\varepsilon$ existe $\rho$ con $|f(z) - f(z_0)| < \varepsilon$ sobre $C_\rho$. Por la cota ML, el módulo de la segunda integral es menor que $\frac{\varepsilon}{\rho}\cdot2\pi\rho = 2\pi\varepsilon$.`,
        R`**Paso 4 (conclusión).** La segunda integral no depende de $\rho$ (es la diferencia de dos cosas que no dependen) y es menor que cualquier $2\pi\varepsilon$: vale $0$. Queda $\oint_C \frac{f(z)}{z - z_0}\,dz = 2\pi i\,f(z_0)$.`,
        R`**Paso 5 (derivadas).** Se escribe $\frac{f(z_0 + h) - f(z_0)}{h}$ con la fórmula: da $\frac{1}{2\pi i}\oint_C \frac{f(z)}{(z - z_0 - h)(z - z_0)}\,dz$. Con la cota ML se muestra que cuando $h \to 0$ tiende a $\frac{1}{2\pi i}\oint_C \frac{f(z)}{(z - z_0)^2}\,dz$: se puede derivar bajo el signo integral. Repitiendo el argumento sale la fórmula para $f^{(n)}$. $\blacksquare$`],
      examples: [{ q: R`$\oint_{|z| = 2}\frac{e^z}{z - 1}\,dz$.`, steps: [R`$f(z) = e^z$ es entera y $z_0 = 1$ está adentro: $2\pi i\,e$.`] },
        { q: R`$\oint_{|z| = 1}\frac{\cos z}{z^3}\,dz$.`, steps: [R`$n = 2$, $z_0 = 0$: $\frac{2\pi i}{2!}\,f''(0)$ con $f'' = -\cos z$.`, R`Resultado: $-\pi i$.`] },
        { q: R`$\oint_{|z| = 2}\frac{dz}{(z - 1)(z + 3)}$.`, steps: [R`Adentro solo está $z = 1$. Con $f(z) = \frac{1}{z + 3}$ (analítica adentro): $2\pi i\,f(1) = \frac{\pi i}{2}$.`] }],
      tips: [R`En la fórmula para las derivadas, la potencia del denominador es $n + 1$, no $n$, y aparece $n!$.`, R`Si $z_0$ está **fuera** del contorno, no hay fórmula que aplicar: por Cauchy-Goursat la integral vale $0$.`],
      see: ["c3-cauchy-goursat", "c3-contornos", "c3-liouville", "c3-armonicas"]
    },
    "c3-liouville": {
      title: "Liouville, teorema fundamental del álgebra y módulo máximo", aliases: ["teorema de Liouville", "desigualdad de Cauchy", "teorema fundamental del álgebra", "principio del módulo máximo", "módulo máximo", "valor medio de Gauss"], concepts: ["c3-liouville"],
      summary: "Desigualdad de Cauchy: |f⁽ⁿ⁾(z₀)| ≤ n! M_R/Rⁿ. Liouville: entera y acotada ⇒ constante. De ahí, todo polinomio no constante tiene una raíz. Módulo máximo: |f| no tiene máximos interiores, salvo que f sea constante.",
      def: [R`**Desigualdad de Cauchy.** Si $f$ es analítica dentro y sobre la circunferencia $|z - z_0| = R$ y $|f| \le M_R$ sobre ella, $$\left|f^{(n)}(z_0)\right| \le \frac{n!\,M_R}{R^n}.$$`,
        R`**Teorema de Liouville.** Si $f$ es entera y acotada en todo el plano, $f$ es constante.`,
        R`**Teorema fundamental del álgebra.** Todo polinomio de grado $n \ge 1$ con coeficientes complejos tiene al menos una raíz compleja (y entonces exactamente $n$, contadas con su multiplicidad).`,
        R`**Principio del módulo máximo.** Si $f$ es analítica y no constante en un dominio $D$, $|f|$ no tiene máximo en $D$. Si además $f$ es continua en una región cerrada y acotada, el máximo de $|f|$ se alcanza **en la frontera**, nunca en el interior.`],
      idea: [R`Una función entera no puede «quedarse quieta»: si no es constante, en algún lugar del plano crece sin límite. Por eso $\sin z$ y $\cos z$, que son acotadas sobre el eje real, tienen que explotar en otra dirección.`,
        R`El teorema fundamental del álgebra, un enunciado puramente algebraico, sale en tres renglones del análisis complejo. Es el motivo por el que los números complejos «alcanzan» y no hace falta seguir ampliando.`,
        R`El módulo máximo es la propiedad del promedio: si $f(z_0)$ es el promedio de sus valores alrededor, $|f(z_0)|$ no puede superar a todos ellos.`],
      demo: [R`**Paso 1 (desigualdad de Cauchy).** Por la [[c3-cauchy-formula|fórmula para las derivadas]], $f^{(n)}(z_0) = \frac{n!}{2\pi i}\oint\frac{f(z)}{(z - z_0)^{n+1}}\,dz$. Sobre la circunferencia, el integrando tiene módulo $\le \frac{M_R}{R^{n+1}}$, y la longitud es $2\pi R$. Por la cota ML: $|f^{(n)}(z_0)| \le \frac{n!}{2\pi}\cdot\frac{M_R}{R^{n+1}}\cdot2\pi R = \frac{n!\,M_R}{R^n}$.`,
        R`**Paso 2 (Liouville).** Si $|f| \le M$ en todo el plano, la desigualdad con $n = 1$ vale para **todo** $R$: $|f'(z_0)| \le \frac MR$. Haciendo $R \to \infty$, $f'(z_0) = 0$ en todo punto, y una función con derivada nula en un dominio es constante ([[c3-analitica|funciones analíticas]]).`,
        R`**Paso 3 (teorema fundamental del álgebra).** Supongamos que $P$, de grado $n \ge 1$, no tiene raíces. Entonces $\frac1P$ es entera. Además $|P(z)| \to \infty$ cuando $|z| \to \infty$ (domina el término $a_nz^n$), así que $\frac1P$ es acotada fuera de un disco grande; y dentro del disco, por ser continua. Por Liouville, $\frac1P$ sería constante, y $P$ también: absurdo.`,
        R`**Paso 4 (módulo máximo, idea).** Por la fórmula de Cauchy sobre $z = z_0 + \rho e^{it}$: $f(z_0) = \frac{1}{2\pi}\int_0^{2\pi} f(z_0 + \rho e^{it})\,dt$, así que $|f(z_0)| \le \frac{1}{2\pi}\int_0^{2\pi}|f(z_0 + \rho e^{it})|\,dt$. Si $|f(z_0)|$ fuera máximo, el promedio de valores $\le |f(z_0)|$ solo puede igualarlo si todos son iguales: $|f|$ es constante cerca de $z_0$, y una analítica de módulo constante es constante. $\blacksquare$`],
      examples: [{ q: R`$f$ es entera y $|f(z)| \le 5$ para todo $z$, con $f(0) = 2i$. ¿Cuánto vale $f(7)$?`, steps: [R`Por Liouville, $f$ es constante: $f(7) = 2i$.`] },
        { q: R`Máximo de $|z^2 + 1|$ en $|z| \le 1$.`, steps: [R`Se alcanza en el borde: con $z = e^{it}$, $|e^{2it} + 1| = 2|\cos t|$, cuyo máximo es $2$ (en $z = \pm1$).`] }],
      tips: [R`Liouville pide acotada en **todo** el plano. Acotada sobre el eje real no alcanza.`],
      see: ["c3-cauchy-formula", "c3-analitica", "c3-trig"]
    }
  };

  E.extendCourse("m103", {
    concepts: { "c3-contornos": { name: "Integrales de contorno" }, "c3-primitivas": { name: "Primitivas" }, "c3-cauchy-goursat": { name: "Cauchy-Goursat" }, "c3-cauchy-formula": { name: "Fórmula integral de Cauchy" }, "c3-liouville": { name: "Liouville y módulo máximo" } },
    templates: T,
    units: [{
      id: "c3-integracion-u", order: 4, program: "Unidad 4", title: "Integración compleja", icon: "sigma",
      diagnostic: ["c3-linea-cx", "c3-cauchy-goursat-vf", "c3-cauchy-formula-num"],
      lessons: [
        { id: "c3-contornos", title: "Integrales de contorno", templates: ["c3-linea-cx", "c3-cota-ml-num"], theory: ["c3-contornos"],
          intro: R`$\int_C f\,dz = \int_a^b f(z(t))\,z'(t)\,dt$, y $\left|\int_C f\,dz\right| \le ML$.` },
        { id: "c3-cauchy-goursat", title: "Primitivas y Cauchy-Goursat", templates: ["c3-primitiva-cx", "c3-cauchy-goursat-vf"], theory: ["c3-primitivas", "c3-cauchy-goursat"],
          intro: R`Si $f$ es analítica dentro y sobre $C$, $\oint_C f\,dz = 0$. Con primitiva, la integral es $F(z_2) - F(z_1)$.` },
        { id: "c3-cauchy-formula", title: "Fórmula integral de Cauchy", templates: ["c3-cauchy-formula-num", "c3-teoremas-vf"], theory: ["c3-cauchy-formula", "c3-liouville"],
          intro: R`$\oint_C \frac{f(z)}{(z - z_0)^{n+1}}\,dz = \frac{2\pi i}{n!}f^{(n)}(z_0)$ si $z_0$ está dentro de $C$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 5 · SERIES DE TAYLOR Y DE LAURENT
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, Z = E.c3, dn = Z.dn;
  const T = {};
  const far = (v, ans) => Math.abs(v - ans) > 0.03 * Math.max(1, Math.abs(ans));
  const fact = n => { let p = 1; for (let i = 2; i <= n; i++) p *= i; return p; };
  const I2 = [0, 2 * Math.PI];
  // coeficiente c_n del desarrollo de f en potencias de (z − z0), por su fórmula integral sobre |z − z0| = rho
  const coef = (f, z0, rho, n, N = 2000) => Z.div(Z.circ(z => Z.mul(f(z), Z.ipow(Z.sub(z, z0), -n - 1)), z0, rho, N), I2);
  const rad = d2 => { const s = Math.round(Math.sqrt(d2)); return s * s === d2 ? String(s) : `\\sqrt{${d2}}`; };
  const zmin = z0 => (z0[0] === 0 && z0[1] === 0 ? "z" : z0[1] === 0 ? `z ${z0[0] < 0 ? "+" : "-"} ${Math.abs(z0[0])}` : z0[0] === 0 ? `z ${z0[1] < 0 ? "+" : "-"} ${Math.abs(z0[1]) === 1 ? "" : Math.abs(z0[1])}i` : `z - (${Z.tex(z0)})`);

  T["c3-radio-num"] = {
    type: "numeric", concepts: ["c3-taylor"], difficulty: 2, testN: 25,
    generate(r) {
      const form = r.int(0, 2), a = r.int(1, 4), b = r.nz(-4, 4), p = r.int(-2, 2), q = r.int(1, 3), z0 = [r.int(-3, 3), r.int(-3, 3)];
      const F = [
        { tex: `\\dfrac{1}{z^2 + ${a * a}}`, poles: [[0, a], [0, -a]], num: () => [1, 0] },
        { tex: `\\dfrac{z}{(z - ${a})(${zmin([0, b])})}`, poles: [[a, 0], [0, b]], num: z => z },
        { tex: `\\dfrac{e^z}{${H.poly([[1, "z^{2}"], [-2 * p, "z"], [p * p + q * q, ""]])}}`, poles: [[p, q], [p, -q]], num: Z.exp }
      ][form];
      const d2s = F.poles.map(s => (s[0] - z0[0]) ** 2 + (s[1] - z0[1]) ** 2), d2 = Math.min(...d2s);
      if (d2 === 0) return null;
      const near = F.poles[d2s.indexOf(d2)], Rr = Math.sqrt(d2);
      const f = z => Z.div(F.num(z), F.poles.reduce((m, s) => Z.mul(m, Z.sub(z, s)), [1, 0]));
      return {
        prompt: `¿Cuál es el radio de convergencia de la serie de Taylor de $f(z) = ${F.tex}$ alrededor de $z_0 = ${Z.tex(z0)}$?`,
        answer: Rr, answerTex: rad(d2),
        traps: [{ value: Math.sqrt(Math.max(...d2s)), msg: "Manda el punto singular **más cercano** a $z_0$, no el más lejano." }].filter(t => far(t.value, Rr)),
        solution: [`La [[c3-taylor|serie de Taylor]] converge en el mayor disco centrado en $z_0$ donde $f$ es analítica: el radio es la distancia de $z_0$ al punto singular más cercano.`,
          `Los puntos singulares son los ceros del denominador: ${F.poles.map(s => `$${Z.tex(s)}$`).join(" y ")}. Sus distancias a $z_0$ son ${d2s.map(x => `$${rad(x)}$`).join(" y ")}.`,
          `El más cercano es $${Z.tex(near)}$: $R = ${rad(d2)}${Number.isInteger(Rr) ? "" : ` \\approx ${dn(Rr, 3)}`}$.`],
        // verificación: se calculan coeficientes de Taylor altos con su fórmula integral y se estima el radio con el criterio de la raíz
        verify: { kind: "value", tol: 0.03, fn: () => {
          const big = n0 => Math.max(...Array.from({ length: 8 }, (_, k) => Z.abs(coef(f, z0, 0.9 * Rr, n0 + k, 1200))));
          return (big(60) / big(160)) ** (1 / 100);
        } }
      };
    }
  };

  T["c3-taylor-coef-num"] = {
    type: "numeric", concepts: ["c3-taylor"], difficulty: 2,
    generate(r) {
      const form = r.pick(["exp", "geo", "par", "sinc", "cuad"]), k = r.pick([1, 2, -1, 3]), a = r.pick([2, 3, -2, 4, -3]), c = r.pick([1, 2, 3, 4, -2]), m = r.int(0, 2);
      let n = r.int(0, 5), tex, f, rho, num, den = 1, steps;
      if (form === "exp") {
        n = m + r.int(0, 4); tex = `${m === 0 ? "" : m === 1 ? "z\\," : "z^2"}e^{${H.kx(k, "z")}}`; f = z => Z.mul(Z.ipow(z, m), Z.exp(Z.sc(k, z))); rho = 1; num = k ** (n - m); den = fact(n - m);
        steps = [`$e^w = \\sum \\frac{w^j}{j!}$ con $w = ${H.kx(k, "z")}$: $e^{${H.kx(k, "z")}} = \\sum \\frac{${k === 1 ? "" : `${H.par(k)}^j`}z^j}{j!}$.`, m ? `Al multiplicar por $z^{${m}}$, la potencia $z^{${n}}$ viene del término $j = ${n - m}$.` : `El coeficiente de $z^{${n}}$ es el término $j = ${n}$.`];
      } else if (form === "geo") {
        n = r.int(0, 4); tex = `\\dfrac{1}{${a} - z}`; f = z => Z.div([1, 0], Z.sub([a, 0], z)); rho = Math.abs(a) / 2; num = 1; den = a ** (n + 1);
        steps = [`Se saca factor común $${a}$ para llegar a la serie geométrica: $\\dfrac{1}{${a} - z} = \\dfrac{1}{${a}}\\cdot\\dfrac{1}{1 - \\frac{z}{${a}}} = \\sum \\dfrac{z^n}{${H.par(a)}^{n+1}}$, para $|z| < ${Math.abs(a)}$.`];
      } else if (form === "par") {
        n = r.int(0, 6); tex = `\\dfrac{1}{1 ${c < 0 ? "-" : "+"} ${H.kx(Math.abs(c), "z^2")}}`; f = z => Z.div([1, 0], Z.add([1, 0], Z.sc(c, Z.mul(z, z)))); rho = 0.5 / Math.sqrt(Math.abs(c)); num = n % 2 ? 0 : (-c) ** (n / 2);
        steps = [`Serie geométrica con razón $w = ${H.kx(-c, "z^2")}$: $\\dfrac{1}{1 - w} = \\sum w^j = \\sum ${H.par(-c)}^j z^{2j}$.`, n % 2 ? `Solo hay potencias pares: el coeficiente de $z^{${n}}$ es $0$.` : `$z^{${n}}$ corresponde a $j = ${n / 2}$.`];
      } else if (form === "sinc") {
        n = r.int(0, 5); tex = `\\dfrac{\\sin(${H.kx(Math.abs(k), "z")})}{z}`; const kk = Math.abs(k); f = z => Z.div(Z.sin(Z.sc(kk, z)), z); rho = 1; num = n % 2 ? 0 : (-1) ** (n / 2) * kk ** (n + 1); den = n % 2 ? 1 : fact(n + 1);
        steps = [`$\\sin w = \\sum \\frac{(-1)^j w^{2j+1}}{(2j+1)!}$ con $w = ${H.kx(kk, "z")}$, y se divide por $z$: quedan solo potencias pares, $\\sum \\frac{(-1)^j ${kk === 1 ? "" : `${kk}^{2j+1}`}z^{2j}}{(2j+1)!}$. (La singularidad en $0$ es evitable.)`, n % 2 ? `El coeficiente de una potencia impar es $0$.` : `$z^{${n}}$ corresponde a $j = ${n / 2}$.`];
      } else {
        n = r.int(0, 6); tex = `\\dfrac{1}{(1 - z)^2}`; f = z => Z.div([1, 0], Z.ipow(Z.sub([1, 0], z), 2)); rho = 0.5; num = n + 1;
        steps = [`Derivando término a término la serie geométrica $\\frac{1}{1 - z} = \\sum z^n$: $\\dfrac{1}{(1 - z)^2} = \\sum n\\,z^{n-1} = \\sum (n + 1)z^n$.`];
      }
      return {
        prompt: `¿Cuál es el coeficiente de $z^{${n}}$ en la serie de Maclaurin de $f(z) = ${tex}$?`,
        answer: num / den, answerTex: H.frac(num, den),
        solution: [`Conviene partir de un [[c3-taylor|desarrollo conocido]] en lugar de derivar $${n}$ veces.`, ...steps, `Coeficiente: $${H.frac(num, den)}$.`],
        // verificación: a_n = (1/2πi) ∮ f(z)/z^{n+1} dz, calculada numéricamente sobre una circunferencia chica
        verify: { kind: "value", tol: 1e-7, fn: () => coef(f, [0, 0], rho, n)[0] }
      };
    }
  };

  const SER = [
    { t: R`la serie de Maclaurin de $\frac{1}{1 + z^2}$ converge para todo $z$ real, porque la función es derivable en toda la recta`, v: false, why: R`Converge solo si $|z| < 1$: los puntos singulares $\pm i$ están a distancia $1$ del origen, aunque no se vean desde la recta real.`,
      test: () => { let s = 0; for (let n = 0; n < 200; n++) s += (-1) ** n * 1.5 ** (2 * n); return Math.abs(s) < 10; } },
    { t: R`la serie de Taylor de $e^z$ alrededor de cualquier punto converge en todo el plano`, v: true, why: R`$e^z$ es entera: no hay puntos singulares y el radio de convergencia es infinito.`,
      test: () => { const z = [8, -9]; let s = [0, 0], t = [1, 0]; for (let n = 1; n < 200; n++) { s = Z.add(s, t); t = Z.sc(1 / n, Z.mul(t, z)); } return Z.abs(Z.sub(s, Z.exp(z))) < 1e-6 * Z.abs(Z.exp(z)); } },
    { t: R`dentro de su círculo de convergencia, una serie de potencias se puede derivar término a término`, v: true, why: R`La serie derivada tiene el mismo radio de convergencia y representa a la derivada de la suma.`,
      test: () => { const z = [0.3, 0.4]; let s = [0, 0], p = [1, 0]; for (let n = 1; n < 400; n++) { s = Z.add(s, Z.sc(n, p)); p = Z.mul(p, z); } return Z.abs(Z.sub(s, Z.div([1, 0], Z.ipow(Z.sub([1, 0], z), 2)))) < 1e-9; } },
    { t: R`la serie geométrica $\sum z^n$ converge en todos los puntos de la circunferencia $|z| = 1$`, v: false, why: R`Sobre $|z| = 1$ el término general tiene módulo $1$: no tiende a cero, así que la serie diverge en todos esos puntos.`,
      test: () => Z.abs(Z.ipow(Z.polar(1, 1), 500)) < 0.5 },
    { t: R`el desarrollo de Laurent de una función en un anillo dado es único`, v: true, why: R`Cualquier serie de potencias positivas y negativas que converja a $f$ en el anillo tiene los coeficientes $c_n = \frac{1}{2\pi i}\oint \frac{f(z)}{(z - z_0)^{n+1}}dz$. Por eso vale cualquier método para hallarla.`,
      test: () => { const f = z => Z.div([1, 0], Z.mul(Z.sub(z, [1, 0]), Z.sub(z, [2, 0]))); return [-2, -1, 0, 1].every(n => Z.abs(Z.sub(coef(f, [0, 0], 1.2, n), coef(f, [0, 0], 1.8, n))) < 1e-8); } },
    { t: R`una misma función puede tener desarrollos de Laurent distintos, alrededor del mismo punto, en anillos distintos`, v: true, why: R`Por ejemplo, $\frac{1}{(z - 1)(z - 2)}$ tiene un desarrollo para $|z| < 1$, otro para $1 < |z| < 2$ y otro para $|z| > 2$. La unicidad vale dentro de cada anillo.`,
      test: () => { const f = z => Z.div([1, 0], Z.mul(Z.sub(z, [1, 0]), Z.sub(z, [2, 0]))); return [-1, 0].some(n => Z.abs(Z.sub(coef(f, [0, 0], 0.5, n), coef(f, [0, 0], 1.5, n))) > 1e-3); } },
    { t: R`si $f$ es analítica en el disco $|z - z_0| < R$, su serie de Taylor alrededor de $z_0$ converge a $f$ en todo ese disco`, v: true, why: R`Es el teorema de Taylor. En variable real no pasa: hay funciones infinitamente derivables cuya serie de Taylor no converge a la función.`,
      test: () => { const z = Z.polar(1.9, 1); let s = [0, 0], p = [1, 0]; for (let n = 0; n < 2000; n++) { s = Z.add(s, Z.sc(-0.5, p)); p = Z.mul(p, Z.sc(0.5, z)); } return Z.abs(Z.sub(s, Z.div([1, 0], Z.sub(z, [2, 0])))) < 1e-6; } },
    { t: R`si $\sum a_nz^n$ converge en $z = 3$, también converge en $z = -2 + 2i$`, v: true, why: R`Una serie de potencias que converge en un punto converge absolutamente en todo punto más cercano al centro, y $|-2 + 2i| = \sqrt8 < 3$.`,
      test: () => { const z = Z.sc(1 / 3, [-2, 2]); let s = [0, 0], p = z, prev = 0; for (let n = 1; n < 400; n++) { s = Z.add(s, Z.sc(1 / n, p)); p = Z.mul(p, z); if (n === 300) prev = s; } return Z.abs(Z.sub(s, prev)) < 1e-6; } },
    { t: R`si $\sum a_nz^n$ converge en $z = 3$, también converge en $z = -3$`, v: false, why: R`Sobre el borde del círculo de convergencia puede pasar cualquier cosa. Con $a_n = \frac{(-1)^n}{n\,3^n}$, en $z = 3$ queda la serie armónica alternada (converge) y en $z = -3$, la armónica (diverge).`,
      test: () => { let s3 = 0, sm3 = 0, mid = 0; for (let n = 1; n <= 1e5; n++) { s3 += (-1) ** n / n; sm3 += 1 / n; if (n === 1000) mid = sm3; } return Math.abs(s3 + Math.LN2) < 1e-4 && sm3 - mid < 0.5; } }
  ];
  T["c3-series-vf"] = {
    type: "tf", concepts: ["c3-series", "c3-taylor"], difficulty: 2,
    generate(r) {
      const S = r.pick(SER);
      return {
        prompt: `<b>Verdadero o falso:</b> ${S.t}.`,
        answer: S.v,
        explanation: `${S.v ? "Verdadero" : "Falso"}. ${S.why}`,
        solution: [`Ver [[c3-series-potencias|series de potencias complejas]], [[c3-taylor|teorema de Taylor]] y [[c3-laurent|series de Laurent]].`],
        // verificación: cada afirmación se pone a prueba sumando la serie o calculando coeficientes con integrales de contorno
        verify: { kind: "truth", fn: S.test }
      };
    }
  };

  T["c3-laurent-coef-num"] = {
    type: "numeric", concepts: ["c3-laurent"], difficulty: 3,
    generate(r) {
      const a = r.int(1, 2), b = a + r.int(1, 2), reg = r.pick(["in", "mid", "mid", "out"]), n = r.int(-3, 2), D = a - b, m = -n;
      const val = { in: n >= 0 ? [a ** (n + 1) - b ** (n + 1), D * (a * b) ** (n + 1)] : [0, 1], mid: n >= 0 ? [1, D * b ** (n + 1)] : [a ** (m - 1), D], out: n >= 0 ? [0, 1] : [a ** (m - 1) - b ** (m - 1), D] };
      const [num, den] = val[reg], ans = num / den;
      const regT = { in: `|z| < ${a}`, mid: `${a} < |z| < ${b}`, out: `|z| > ${b}` }[reg], rho = { in: a / 2, mid: (a + b) / 2, out: b + 1 }[reg];
      const f = z => Z.div([1, 0], Z.mul(Z.sub(z, [a, 0]), Z.sub(z, [b, 0])));
      const eA = reg === "in" ? `-\\sum_{k\\ge0} \\dfrac{z^k}{${a === 1 ? "1" : `${a}^{k+1}`}}` : `\\sum_{k\\ge0} \\dfrac{${a === 1 ? "1" : `${a}^k`}}{z^{k+1}}`, eB = reg === "out" ? `\\sum_{k\\ge0} \\dfrac{${b}^k}{z^{k+1}}` : `-\\sum_{k\\ge0} \\dfrac{z^k}{${b}^{k+1}}`;
      return {
        prompt: `Sea $f(z) = \\dfrac{1}{(z - ${a})(z - ${b})}$. En su desarrollo de Laurent en potencias de $z$, válido en la región $${regT}$, ¿cuál es el coeficiente de $z^{${n}}$?`,
        answer: ans, answerTex: H.frac(num, den),
        traps: Object.entries(val).filter(([k]) => k !== reg).map(([k, [p, q]]) => ({ value: p / q, msg: `Ese es el coeficiente del desarrollo válido en $${{ in: `|z| < ${a}`, mid: `${a} < |z| < ${b}`, out: `|z| > ${b}` }[k]}$. En cada región, cada fracción simple se desarrolla de la manera que converge ahí.` })).filter((t, i, arr) => far(t.value, ans) && arr.findIndex(u => Math.abs(u.value - t.value) < 1e-12) === i),
        solution: [`Fracciones simples: $f(z) = \\dfrac{1}{${D}}\\left(\\dfrac{1}{z - ${a}} - \\dfrac{1}{z - ${b}}\\right)$ ([[c3-laurent|serie de Laurent]]).`,
          `En $${regT}$: $\\dfrac{1}{z - ${a}} = ${eA}$ (porque $|z| ${reg === "in" ? "<" : ">"} ${a}$) y $\\dfrac{1}{z - ${b}} = ${eB}$ (porque $|z| ${reg === "out" ? ">" : "<"} ${b}$).`,
          `Juntando los términos con $z^{${n}}$ y multiplicando por $\\frac{1}{${D}}$: el coeficiente es $${H.frac(num, den)}$.`],
        // verificación: c_n = (1/2πi) ∮ f(z)/z^{n+1} dz sobre una circunferencia contenida en la región
        verify: { kind: "value", tol: 1e-7, fn: () => coef(f, [0, 0], rho, n)[0] }
      };
    }
  };

  T["c3-laurent-region-mc"] = {
    type: "mc", concepts: ["c3-laurent"], difficulty: 2, testN: 60,
    generate(r) {
      const [p1, p2] = r.distinct(2, -3, 4), z0 = r.pick([[0, 0], [p1, 0], [r.int(-3, 3), 0], [0, r.nz(-3, 3)], [p2, 0]]);
      const d2 = [p1, p2].map(p => (p - z0[0]) ** 2 + z0[1] ** 2).sort((x, y) => x - y);
      if (d2[0] === d2[1]) return null;
      const zc = `|${zmin(z0)}|`, [ra, rb] = d2.map(rad), atPole = d2[0] === 0;
      const three = (u, v) => `Tres: $${zc} < ${u}$, $\\ ${u} < ${zc} < ${v}\\ $ y $\\ ${zc} > ${v}$`, two = v => `Dos: $0 < ${zc} < ${v}\\ $ y $\\ ${zc} > ${v}$`;
      const ok = atPole ? two(rb) : three(ra, rb);
      const alt = [Math.abs(p1), Math.abs(p2)].sort((x, y) => x - y).map(String);
      const bads = [atPole ? three(Z.dn(Math.sqrt(d2[1]) / 2), rb) : two(rb), `Una sola, válida en todo el plano salvo los puntos singulares`, atPole ? `Dos: $${zc} < ${rb}\\ $ y $\\ ${zc} > ${rb}$` : `Dos: $${zc} < ${ra}\\ $ y $\\ ${zc} > ${rb}$`,
        ...(alt[0] !== alt[1] && alt[0] !== "0" && (alt[0] !== ra || alt[1] !== rb) ? [three(alt[0], alt[1])] : [])].filter(b => b !== ok);
      const f = z => Z.div([1, 0], Z.mul(Z.sub(z, [p1, 0]), Z.sub(z, [p2, 0])));
      const fT = `\\dfrac{1}{(${zmin([p1, 0])})(${zmin([p2, 0])})}`.replace("(z)", "z");
      return {
        prompt: `¿Cuántos desarrollos de Laurent distintos tiene $f(z) = ${fT}$ en potencias de $${zmin(z0) === "z" ? "z" : `(${zmin(z0)})`}$, y en qué regiones vale cada uno?`,
        ...H.mc(r, ok, r.shuffle(bads).slice(0, 3), { text: true }),
        solution: [`Los puntos singulares son $${p1}$ y $${p2}$. Las regiones son los anillos centrados en $z_0 = ${Z.tex(z0)}$ que no contienen puntos singulares: los límites son las circunferencias que pasan por ellos ([[c3-laurent|serie de Laurent]]).`,
          atPole ? `$z_0$ es uno de los puntos singulares. El otro está a distancia $${rb}$: hay un desarrollo en el disco pinchado $0 < ${zc} < ${rb}$ y otro en el exterior, $${zc} > ${rb}$.`
            : `Las distancias de $z_0$ a los puntos singulares son $${ra}$ y $${rb}$: hay un disco (ahí el desarrollo es una serie de Taylor), un anillo y un exterior.`],
        // verificación: los coeficientes de Laurent calculados con integrales de contorno coinciden a dos radios de una misma región y cambian al pasar a la siguiente
        verify: { kind: "truth", target: true, fn: () => {
          const s0 = Math.sqrt(d2[0]), s1 = Math.sqrt(d2[1]);
          const cs = rho => [-2, -1, 0, 1].map(n => coef(f, z0, rho, n, 3000)), same = (u, v) => u.every((c, i) => Z.abs(Z.sub(c, v[i])) < 1e-6);
          const rings = atPole ? [[0.3 * s1, 0.7 * s1], [1.4 * s1, 2.2 * s1]] : [[0.3 * s0, 0.7 * s0], [s0 + 0.3 * (s1 - s0), s0 + 0.7 * (s1 - s0)], [1.4 * s1, 2.2 * s1]];
          const C = rings.map(([u, v]) => [cs(u), cs(v)]);
          return C.every(([u, v]) => same(u, v)) && C.slice(1).every((c, i) => !same(c[0], C[i][0]));
        } }
      };
    }
  };

  const cards = {
    "c3-series-potencias": {
      title: "Series de potencias complejas", aliases: ["serie de potencias compleja", "círculo de convergencia", "convergencia absoluta de series complejas"], concepts: ["c3-series"],
      summary: "Σ aₙ(z − z₀)ⁿ converge absolutamente dentro de un círculo |z − z₀| < R y diverge afuera. Adentro, la suma es analítica y la serie se puede derivar e integrar término a término.",
      def: [R`Una serie de complejos $\sum z_n$ converge si convergen las series de sus partes reales e imaginarias. Si $\sum |z_n|$ converge (**convergencia absoluta**), $\sum z_n$ converge. Si converge, $z_n \to 0$.`,
        R`Una **serie de potencias** $\displaystyle\sum_{n=0}^\infty a_n(z - z_0)^n$ tiene un **radio de convergencia** $R$ (de $0$ a $\infty$): converge absolutamente si $|z - z_0| < R$ y diverge si $|z - z_0| > R$. Sobre la circunferencia $|z - z_0| = R$ puede pasar cualquier cosa.`,
        R`Dentro del **círculo de convergencia**, la suma $S(z)$ es una función analítica, y la serie se puede **derivar e integrar término a término**: $S'(z) = \sum n\,a_n(z - z_0)^{n-1}$, con el mismo radio.`,
        R`El radio se calcula como en variable real: $R = \lim\left|\dfrac{a_n}{a_{n+1}}\right|$ o $\dfrac1R = \lim\sqrt[n]{|a_n|}$, cuando esos límites existen.`],
      idea: [R`Es lo mismo que las [[c2-series-potencias|series de potencias]] de Cálculo II, pero ahora el «intervalo» de convergencia se ve como lo que realmente es: un **disco**. El intervalo real era la sombra de ese disco sobre la recta.`,
        R`La serie madre es la **geométrica**: $\dfrac{1}{1 - w} = \sum_{n\ge0} w^n$ para $|w| < 1$. Casi todos los desarrollos de la materia salen de ella, eligiendo bien $w$.`],
      demo: [R`**Paso 1 (si converge en un punto, converge más adentro).** Supongamos que $\sum a_n(z_1 - z_0)^n$ converge. Entonces sus términos tienden a cero y están acotados: $|a_n(z_1 - z_0)^n| \le M$.`,
        R`**Paso 2 (comparar con una geométrica).** Si $|z - z_0| < |z_1 - z_0|$, llamando $\rho = \frac{|z - z_0|}{|z_1 - z_0|} < 1$: $|a_n(z - z_0)^n| = |a_n(z_1 - z_0)^n|\,\rho^n \le M\rho^n$. Como $\sum M\rho^n$ converge ([[series|serie geométrica]]), por comparación la serie converge absolutamente en $z$.`,
        R`**Paso 3 (existe el radio).** Sea $R$ el supremo de los $|z_1 - z_0|$ en los que la serie converge. Por el paso 2, converge absolutamente en todo punto con $|z - z_0| < R$; y si convergiera en un punto con $|z - z_0| > R$, se contradiría la definición de $R$. $\blacksquare$`],
      examples: [{ q: R`Radio de convergencia de $\sum \dfrac{z^n}{n\,2^n}$.`, steps: [R`$\left|\dfrac{a_n}{a_{n+1}}\right| = \dfrac{(n + 1)2^{n+1}}{n\,2^n} \to 2$. Converge en $|z| < 2$.`] }],
      see: ["c2-series-potencias", "series", "criterios-series", "c3-taylor"]
    },
    "c3-taylor": {
      title: "Teorema de Taylor y desarrollos conocidos", aliases: ["teorema de Taylor complejo", "serie de Taylor compleja", "serie de Maclaurin compleja", "desarrollos de Maclaurin"], concepts: ["c3-taylor"],
      summary: "Si f es analítica en |z − z₀| < R₀, ahí f(z) = Σ f⁽ⁿ⁾(z₀)(z − z₀)ⁿ/n!. El radio de convergencia es la distancia de z₀ al punto singular más cercano. El desarrollo es único.",
      def: [R`**Teorema de Taylor.** Si $f$ es analítica en el disco $|z - z_0| < R_0$, entonces en todo ese disco $$f(z) = \sum_{n=0}^\infty a_n(z - z_0)^n,\qquad a_n = \frac{f^{(n)}(z_0)}{n!} = \frac{1}{2\pi i}\oint_C\frac{f(s)}{(s - z_0)^{n+1}}\,ds.$$ Con $z_0 = 0$ se llama **serie de Maclaurin**.`,
        R`El disco de convergencia llega hasta el **punto singular más cercano** a $z_0$. El desarrollo es **único**: cualquier serie de potencias de $(z - z_0)$ que converja a $f$ es su serie de Taylor.`,
        R`**Desarrollos para saber** (los tres primeros, para todo $z$; los otros, para $|z| < 1$): $$e^z = \sum_{n\ge0}\frac{z^n}{n!},\quad \sin z = \sum_{n\ge0}\frac{(-1)^nz^{2n+1}}{(2n+1)!},\quad \cos z = \sum_{n\ge0}\frac{(-1)^nz^{2n}}{(2n)!},\quad \frac{1}{1 - z} = \sum_{n\ge0}z^n,\quad \operatorname{Log}(1 + z) = \sum_{n\ge1}\frac{(-1)^{n+1}z^n}{n}.$$`],
      idea: [R`En variable real, la [[c2-taylor|serie de Taylor]] puede no converger a la función. En los complejos, ser derivable en un disco **garantiza** que la serie converge a $f$ en todo el disco. «Analítica» y «desarrollable en serie de potencias» son lo mismo.`,
        R`Esto explica un misterio de Cálculo II: $\frac{1}{1 + x^2}$ es suave en toda la recta, pero su serie solo converge para $|x| < 1$. El motivo está fuera de la recta: los puntos singulares $\pm i$.`,
        R`Como el desarrollo es único, para hallarlo vale cualquier truco: sustituir en un desarrollo conocido, multiplicar series, derivar o integrar término a término. Casi nunca conviene calcular $f^{(n)}(z_0)$.`],
      demo: [R`**Paso 1 (fórmula de Cauchy).** Sea $z$ con $|z - z_0| = r < R_0$ y $C$ la circunferencia $|s - z_0| = r_0$ con $r < r_0 < R_0$. Por la [[c3-cauchy-formula|fórmula integral de Cauchy]], $f(z) = \frac{1}{2\pi i}\oint_C \frac{f(s)}{s - z}\,ds$.`,
        R`**Paso 2 (serie geométrica en el núcleo).** $\dfrac{1}{s - z} = \dfrac{1}{s - z_0}\cdot\dfrac{1}{1 - \frac{z - z_0}{s - z_0}}$. Sobre $C$, la razón $w = \frac{z - z_0}{s - z_0}$ tiene módulo $\frac{r}{r_0} < 1$, así que $\dfrac{1}{s - z} = \sum_{n=0}^{N-1}\dfrac{(z - z_0)^n}{(s - z_0)^{n+1}} + \dfrac{w^N}{s - z}$ (suma geométrica finita con su resto).`,
        R`**Paso 3 (integrar).** Multiplicando por $\frac{f(s)}{2\pi i}$ e integrando sobre $C$: $f(z) = \sum_{n=0}^{N-1} a_n(z - z_0)^n + \rho_N$, donde $a_n = \frac{1}{2\pi i}\oint_C \frac{f(s)}{(s - z_0)^{n+1}}ds = \frac{f^{(n)}(z_0)}{n!}$ por la fórmula para las derivadas.`,
        R`**Paso 4 (el resto tiende a cero).** $\rho_N = \frac{1}{2\pi i}\oint_C \frac{f(s)\,w^N}{s - z}\,ds$. Sobre $C$, $|f| \le M$, $|w|^N = (r/r_0)^N$ y $|s - z| \ge r_0 - r$. Por la cota ML, $|\rho_N| \le \frac{M r_0}{r_0 - r}\left(\frac{r}{r_0}\right)^N \to 0$. $\blacksquare$`],
      examples: [{ q: R`Desarrollá $\dfrac{1}{z}$ alrededor de $z_0 = 1$.`, steps: [R`$\dfrac1z = \dfrac{1}{1 + (z - 1)} = \sum_{n\ge0}(-1)^n(z - 1)^n$, por la geométrica con $w = -(z - 1)$.`, R`Vale para $|z - 1| < 1$: el radio es la distancia de $1$ al punto singular $0$.`] },
        { q: R`Maclaurin de $z^2e^{3z}$.`, steps: [R`$e^{3z} = \sum\frac{3^nz^n}{n!}$, así que $z^2e^{3z} = \sum\frac{3^nz^{n+2}}{n!}$, para todo $z$.`] }],
      tips: [R`Para el radio no hace falta calcular ningún coeficiente: alcanza con ubicar los puntos singulares y medir distancias.`],
      see: ["c2-taylor", "c3-series-potencias", "c3-cauchy-formula", "c3-laurent"]
    },
    "c3-laurent": {
      title: "Series de Laurent", aliases: ["serie de Laurent", "series de Laurent", "desarrollo de Laurent", "teorema de Laurent"], concepts: ["c3-laurent"],
      summary: "Si f es analítica en el anillo R₁ < |z − z₀| < R₂, ahí f(z) = Σ cₙ(z − z₀)ⁿ con n de −∞ a ∞. Es único en cada anillo, pero cambia de un anillo a otro. Se obtiene con la geométrica, eligiendo en cada término la forma que converge.",
      def: [R`**Teorema de Laurent.** Si $f$ es analítica en el anillo $R_1 < |z - z_0| < R_2$, entonces ahí $$f(z) = \sum_{n=-\infty}^{\infty} c_n(z - z_0)^n,\qquad c_n = \frac{1}{2\pi i}\oint_C\frac{f(s)}{(s - z_0)^{n+1}}\,ds,$$ con $C$ cualquier contorno cerrado simple positivo, dentro del anillo, que rodee a $z_0$.`,
        R`El desarrollo es **único en cada anillo**. La parte con potencias negativas se llama **parte principal**. Si $f$ es analítica en todo el disco $|z - z_0| < R_2$, los $c_n$ con $n < 0$ se anulan y queda la serie de Taylor.`,
        R`**La geométrica, en sus dos formas.** Para un polo en $a$: $$\frac{1}{z - a} = -\sum_{k\ge0}\frac{z^k}{a^{k+1}}\ \ (|z| < |a|),\qquad \frac{1}{z - a} = \sum_{k\ge0}\frac{a^k}{z^{k+1}}\ \ (|z| > |a|).$$`],
      idea: [R`Taylor describe una función cerca de un punto donde es analítica. Laurent la describe **alrededor de un punto singular** o en un anillo que rodea singularidades, a costa de admitir potencias negativas.`,
        R`Los puntos singulares cortan el plano en anillos concéntricos alrededor de $z_0$, y en cada uno hay un desarrollo distinto. Antes de desarrollar, preguntate siempre: **¿en qué región?**`,
        R`El coeficiente $c_{-1}$ es especial: por la fórmula, $\oint_C f(z)\,dz = 2\pi i\,c_{-1}$. Ese coeficiente es la clave de la unidad que sigue: con él se calculan integrales sin integrar.`],
      demo: [R`**Paso 1 (fórmula de Cauchy en el anillo).** Sea $z$ en el anillo y $C_1$, $C_2$ dos circunferencias centradas en $z_0$, con radios $r_1 < |z - z_0| < r_2$, dentro del anillo. Por [[c3-cauchy-goursat|Cauchy-Goursat para dominios con agujeros]] y la fórmula de Cauchy: $f(z) = \frac{1}{2\pi i}\oint_{C_2}\frac{f(s)}{s - z}\,ds - \frac{1}{2\pi i}\oint_{C_1}\frac{f(s)}{s - z}\,ds$.`,
        R`**Paso 2 (sobre el círculo de afuera).** En $C_2$, $|z - z_0| < |s - z_0|$: se desarrolla $\frac{1}{s - z} = \sum_{n\ge0}\frac{(z - z_0)^n}{(s - z_0)^{n+1}}$, igual que en el [[c3-taylor|teorema de Taylor]]. Da las potencias $n \ge 0$.`,
        R`**Paso 3 (sobre el círculo de adentro).** En $C_1$, $|s - z_0| < |z - z_0|$: ahora se saca factor común al revés, $-\frac{1}{s - z} = \frac{1}{z - z_0}\cdot\frac{1}{1 - \frac{s - z_0}{z - z_0}} = \sum_{m\ge1}\frac{(s - z_0)^{m-1}}{(z - z_0)^m}$. Da las potencias negativas, con $c_{-m} = \frac{1}{2\pi i}\oint_{C_1} f(s)(s - z_0)^{m-1}ds$.`,
        R`**Paso 4 (un solo contorno).** Los integrandos de los coeficientes son analíticos en el anillo, así que por deformación de contornos $C_1$ y $C_2$ se pueden reemplazar por un mismo contorno $C$. Los restos tienden a cero por la cota ML, como en Taylor. $\blacksquare$`],
      examples: [{ q: R`Laurent de $\dfrac{1}{z(z - 1)}$ en $0 < |z| < 1$ y en $|z| > 1$.`, steps: [R`En $0 < |z| < 1$: $\dfrac1z\cdot\dfrac{-1}{1 - z} = -\dfrac1z - 1 - z - z^2 - \dots$`, R`En $|z| > 1$: $\dfrac{1}{z^2}\cdot\dfrac{1}{1 - \frac1z} = \dfrac{1}{z^2} + \dfrac{1}{z^3} + \dfrac{1}{z^4} + \dots$`] },
        { q: R`Laurent de $e^{1/z}$ alrededor de $0$.`, steps: [R`Se sustituye $w = \frac1z$ en la serie de $e^w$: $e^{1/z} = \sum_{n\ge0}\dfrac{1}{n!\,z^n}$, para $|z| > 0$. Infinitas potencias negativas.`] }],
      tips: [R`El desarrollo válido en $|z| > b$ **no** sirve para calcular el residuo en un punto singular: para eso hace falta el del disco pinchado alrededor de ese punto.`],
      see: ["c3-taylor", "c3-series-potencias", "c3-cauchy-goursat", "fracciones-simples"]
    }
  };

  E.extendCourse("m103", {
    concepts: { "c3-series": { name: "Series de potencias" }, "c3-taylor": { name: "Series de Taylor" }, "c3-laurent": { name: "Series de Laurent" } },
    templates: T,
    units: [{
      id: "c3-series-u", order: 5, program: "Unidad 5", title: "Series de Taylor y de Laurent", icon: "chart-column",
      diagnostic: ["c3-radio-num", "c3-taylor-coef-num", "c3-laurent-coef-num"],
      lessons: [
        { id: "c3-taylor", title: "Series de potencias y de Taylor", templates: ["c3-radio-num", "c3-taylor-coef-num", "c3-series-vf"], theory: ["c3-series-potencias", "c3-taylor"],
          intro: R`$f(z) = \sum \frac{f^{(n)}(z_0)}{n!}(z - z_0)^n$ hasta el punto singular más cercano.` },
        { id: "c3-laurent", title: "Series de Laurent", templates: ["c3-laurent-coef-num", "c3-laurent-region-mc"], theory: ["c3-laurent"],
          intro: R`En un anillo, $f(z) = \sum_{n=-\infty}^{\infty} c_n(z - z_0)^n$. Cada anillo tiene su desarrollo.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 6 · SINGULARIDADES AISLADAS, CEROS, POLOS Y RESIDUOS
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, Z = E.c3, dn = Z.dn, pif = Z.pif;
  const T = {};
  const far = (v, ans) => Math.abs(v - ans) > 0.03 * Math.max(1, Math.abs(ans));
  const fact = n => { let p = 1; for (let i = 2; i <= n; i++) p *= i; return p; };
  const one = [1, 0], I2 = [0, 2 * Math.PI];
  // residuo numérico: (1/2πi) ∮ f sobre una circunferencia chica alrededor del punto
  const resNum = (f, z0, rho = 0.3, N = 2000) => Z.div(Z.circ(f, z0, rho, N), I2);
  // máximo de |f| sobre |z − z0| = rad, y exponente con el que crece (o decrece) |f| al acercarse a z0
  const Mx = (f, z0, rad) => Math.max(...Array.from({ length: 64 }, (_, k) => Z.abs(f(Z.add(z0, Z.polar(rad, 0.05 + k * Math.PI / 32))))));
  const slope = (f, z0, r1, r2) => Math.log(Mx(f, z0, r2) / Mx(f, z0, r1)) / Math.log(r1 / r2);
  const zm = (a, v = "z") => (a === 0 ? v : `${v} ${a < 0 ? "+" : "-"} ${Math.abs(a)}`);
  const inv = z => Z.div(one, z);

  const NAMES = { 0: "Singularidad evitable", 1: "Polo simple", 2: "Polo de orden 2", 3: "Polo de orden 3", 99: "Singularidad esencial" };
  T["c3-clasificar-mc"] = {
    type: "mc", concepts: ["c3-singularidades"], difficulty: 2,
    generate(r) {
      const m = r.int(1, 4), a = r.nz(-3, 3), c = r.int(-3, 3);
      const pool = [
        () => ({ tex: `\\dfrac{\\sin z}{${m === 1 ? "z" : `z^{${m}}`}}`, z0: [0, 0], zt: "0", f: z => Z.div(Z.sin(z), Z.ipow(z, m)), kind: m - 1, why: `$\\sin z = z - \\frac{z^3}{6} + \\dots$ tiene un cero simple en $0$. Al dividir por $z^{${m}}$: $f(z) = \\dfrac{1}{z^{${m - 1}}} - \\dfrac{1}{6z^{${m - 3}}} + \\dots$` }),
        () => ({ tex: `\\dfrac{1 - \\cos z}{${m === 1 ? "z" : `z^{${m}}`}}`, z0: [0, 0], zt: "0", f: z => Z.div(Z.sub(one, Z.cos(z)), Z.ipow(z, m)), kind: Math.max(0, m - 2), why: `$1 - \\cos z = \\frac{z^2}{2} - \\frac{z^4}{24} + \\dots$ tiene un cero doble en $0$. Al dividir por $z^{${m}}$, la potencia más baja que queda es $z^{${2 - m}}$.` }),
        () => ({ tex: `\\dfrac{e^{z} - 1}{${m === 1 ? "z" : `z^{${m}}`}}`, z0: [0, 0], zt: "0", f: z => Z.div(Z.sub(Z.exp(z), one), Z.ipow(z, m)), kind: m - 1, why: `$e^z - 1 = z + \\frac{z^2}{2} + \\dots$ tiene un cero simple en $0$. Al dividir por $z^{${m}}$, la potencia más baja que queda es $z^{${1 - m}}$.` }),
        () => { const [tex, f] = r.pick([[`e^{1/z}`, z => Z.exp(inv(z))], [`\\sin\\dfrac{1}{z}`, z => Z.sin(inv(z))], [`z^{2}e^{1/z}`, z => Z.mul(Z.mul(z, z), Z.exp(inv(z)))], [`\\cos\\dfrac{1}{z}`, z => Z.cos(inv(z))], [`e^{-1/z^{2}}`, z => Z.exp(Z.sc(-1, inv(Z.mul(z, z))))]]); return { tex, z0: [0, 0], zt: "0", f, kind: 99, why: `Sustituyendo $w = \\frac1z$ (o $\\frac{1}{z^2}$) en la serie de Maclaurin, quedan **infinitas** potencias negativas de $z$.` }; },
        () => { const mm = r.int(1, 3), cc = c === -a ? c + 1 : c; return { tex: `\\dfrac{${zm(-cc)}}{${mm === 1 ? zm(a) : `(${zm(a)})^{${mm}}`}}`, z0: [a, 0], zt: String(a), f: z => Z.div(Z.add(z, [cc, 0]), Z.ipow(Z.sub(z, [a, 0]), mm)), kind: mm, why: `El numerador no se anula en $z = ${a}$ (vale $${a + cc}$) y el denominador tiene ahí un cero de orden $${mm}$.` }; },
        () => ({ tex: `\\dfrac{z^{2} - ${a * a}}{${zm(a)}}`, z0: [a, 0], zt: String(a), f: z => Z.div(Z.sub(Z.mul(z, z), [a * a, 0]), Z.sub(z, [a, 0])), kind: 0, why: `Factorizando, $z^2 - ${a * a} = (${zm(a)})(${zm(-a)})$: fuera de $z = ${a}$ la función es $${zm(-a)}$, que tiene límite.` }),
        () => r.pick([{ tex: `\\dfrac{1}{z\\sin z}`, f: z => inv(Z.mul(z, Z.sin(z))), kind: 2, why: `$z\\sin z = z^2 - \\frac{z^4}{6} + \\dots$ tiene un cero doble en $0$, así que $\\frac{1}{z\\sin z}$ tiene un polo doble.` },
          { tex: `\\dfrac{z}{\\sin z}`, f: z => Z.div(z, Z.sin(z)), kind: 0, why: `Numerador y denominador tienen un cero simple en $0$: se compensan, y $\\lim_{z\\to0}\\frac{z}{\\sin z} = 1$.` },
          { tex: `\\dfrac{1}{e^{z} - 1}`, f: z => inv(Z.sub(Z.exp(z), one)), kind: 1, why: `$e^z - 1 = z + \\frac{z^2}{2} + \\dots$ tiene un cero simple en $0$, así que su recíproca tiene un polo simple.` },
          { tex: `\\dfrac{1}{\\sin^{2}z}`, f: z => inv(Z.ipow(Z.sin(z), 2)), kind: 2, why: `$\\sin^2z$ tiene un cero doble en $0$, así que su recíproca tiene un polo doble.` }].map(o => ({ ...o, z0: [0, 0], zt: "0" }))),
        () => ({ tex: `\\dfrac{\\sin z}{(z - \\pi)^{2}}`, z0: [Math.PI, 0], zt: "\\pi", f: z => Z.div(Z.sin(z), Z.ipow(Z.sub(z, [Math.PI, 0]), 2)), kind: 1, why: `$\\sin z$ tiene un cero **simple** en $\\pi$, que cancela uno de los dos factores del denominador: queda un polo simple.` })
      ];
      const S = r.pick(pool)(), ok = NAMES[S.kind];
      return {
        prompt: `¿Qué tipo de singularidad tiene $f(z) = ${S.tex}$ en $z_0 = ${S.zt}$?`,
        ...H.mc(r, ok, r.shuffle(Object.values(NAMES).filter(n => n !== ok)).slice(0, 3), { text: true }),
        solution: [S.why, `La [[c3-singularidades|clasificación]] sale de la parte principal del desarrollo de Laurent: sin potencias negativas, evitable; con un número finito, polo (el orden es la potencia más negativa); con infinitas, esencial.`,
          `Respuesta: ${ok.toLowerCase()}.`],
        // verificación: se mide con qué potencia de 1/r crece el máximo de |f| sobre circunferencias cada vez más chicas
        verify: { kind: "truth", target: true, fn: () => { const s = slope(S.f, S.z0, 0.05, 0.025); return (s > 6 ? 99 : s < 0.4 ? 0 : Math.round(s)) === S.kind; } }
      };
    }
  };

  T["c3-ceros-num"] = {
    type: "numeric", concepts: ["c3-ceros-polos"], difficulty: 2,
    generate(r) {
      const a = r.nz(-3, 3), b0 = r.int(1, 4), b = 2 * a + b0 === 0 ? b0 + 1 : b0, n = r.int(1, 4), PI = [Math.PI, 0];
      const pool = [
        { tex: `z^{${n}}\\sin z`, z0: [0, 0], zt: "0", f: z => Z.mul(Z.ipow(z, n), Z.sin(z)), m: n + 1, why: `$\\sin z$ tiene un cero simple en $0$ y $z^{${n}}$, uno de orden $${n}$: los órdenes se suman.` },
        { tex: `z - \\sin z`, z0: [0, 0], zt: "0", f: z => Z.sub(z, Z.sin(z)), m: 3, why: `$z - \\sin z = z - \\left(z - \\frac{z^3}{6} + \\dots\\right) = \\frac{z^3}{6} - \\dots$` },
        { tex: `1 - \\cos z`, z0: [0, 0], zt: "0", f: z => Z.sub(one, Z.cos(z)), m: 2, why: `$1 - \\cos z = \\frac{z^2}{2} - \\frac{z^4}{24} + \\dots$` },
        { tex: `\\left(e^{z} - 1\\right)^{${n}}`, z0: [0, 0], zt: "0", f: z => Z.ipow(Z.sub(Z.exp(z), one), n), m: n, why: `$e^z - 1 = z + \\dots$ tiene un cero simple, y al elevar a la $${n}$ el orden se multiplica por $${n}$.` },
        { tex: `\\sin^{${n + 1}}z`, z0: PI, zt: "\\pi", f: z => Z.ipow(Z.sin(z), n + 1), m: n + 1, why: `$\\sin z$ tiene un cero simple en $\\pi$ (su derivada ahí es $\\cos\\pi = -1 \\ne 0$), y la potencia multiplica el orden.` },
        { tex: `e^{z} - 1 - z`, z0: [0, 0], zt: "0", f: z => Z.sub(Z.sub(Z.exp(z), one), z), m: 2, why: `$e^z - 1 - z = \\frac{z^2}{2} + \\frac{z^3}{6} + \\dots$` },
        { tex: `(${zm(a)})^{${n}}(${zm(-b - a)})`, z0: [a, 0], zt: String(a), f: z => Z.mul(Z.ipow(Z.sub(z, [a, 0]), n), Z.add(z, [-(-b - a), 0])), m: n, why: `El segundo factor no se anula en $z = ${a}$: el orden lo da el exponente del primero.` },
        { tex: `\\cos z - 1 + \\dfrac{z^{2}}{2}`, z0: [0, 0], zt: "0", f: z => Z.add(Z.sub(Z.cos(z), one), Z.sc(0.5, Z.mul(z, z))), m: 4, why: `$\\cos z = 1 - \\frac{z^2}{2} + \\frac{z^4}{24} - \\dots$: se cancelan los dos primeros términos y queda $\\frac{z^4}{24} - \\dots$` },
        { tex: `\\sin z - z\\cos z`, z0: [0, 0], zt: "0", f: z => Z.sub(Z.sin(z), Z.mul(z, Z.cos(z))), m: 3, why: `$\\sin z - z\\cos z = \\left(z - \\frac{z^3}{6}\\right) - \\left(z - \\frac{z^3}{2}\\right) + \\dots = \\frac{z^3}{3} + \\dots$` }
      ];
      const S = r.pick(pool), ask = r.bool(0.35);
      return {
        prompt: ask ? `¿De qué orden es el polo de $\\dfrac{1}{f(z)}$ en $z_0 = ${S.zt}$, si $f(z) = ${S.tex}$?` : `¿De qué orden es el cero de $f(z) = ${S.tex}$ en $z_0 = ${S.zt}$?`,
        answer: S.m,
        solution: [`El orden de un [[c3-ceros-polos|cero]] es la primera potencia de $(z - z_0)$ que aparece en la serie de Taylor (o la primera derivada que no se anula en $z_0$).`, S.why,
          ask ? `$f$ tiene un cero de orden $${S.m}$, así que $\\frac1f$ tiene un polo de orden $${S.m}$.` : `El cero es de orden $${S.m}$.`],
        // verificación: se mide con qué potencia de r decrece el máximo de |f| sobre circunferencias chicas
        verify: { kind: "value", tol: 0.03, fn: () => -slope(S.f, S.z0, 0.01, 0.005) }
      };
    }
  };

  const SING = [
    { t: R`si $z_0$ es un polo de $f$, entonces $|f(z)| \to \infty$ cuando $z \to z_0$`, v: true, why: R`Cerca de un polo de orden $m$, $f(z) = \frac{g(z)}{(z - z_0)^m}$ con $g(z_0) \ne 0$: el módulo crece como $\frac{1}{|z - z_0|^m}$ por todas las direcciones.`,
      test: () => { const f = z => Z.div(Z.exp(z), Z.ipow(Z.sub(z, [1, 2]), 2)); return [1e-2, 1e-3, 1e-4].every(rr => Array.from({ length: 32 }, (_, k) => Z.abs(f(Z.add([1, 2], Z.polar(rr, k * 0.2))))).every(v => v > 0.1 / (rr * rr))); } },
    { t: R`si $z_0$ es una singularidad esencial de $f$, entonces $|f(z)| \to \infty$ cuando $z \to z_0$`, v: false, why: R`Eso caracteriza a los polos. Cerca de una singularidad esencial $f$ no tiene límite, ni finito ni infinito: $e^{1/z}$ tiende a $\infty$ por la derecha y a $0$ por la izquierda (y, por Casorati-Weierstrass, se acerca a cualquier valor).`,
      test: () => [1e-1, 1e-2].every(rr => Array.from({ length: 32 }, (_, k) => Z.abs(Z.exp(inv(Z.polar(rr, k * 0.2))))).every(v => v > 100)) },
    { t: R`si $f$ es analítica y acotada en un entorno reducido de $z_0$, la singularidad en $z_0$ es evitable`, v: true, why: R`Es el teorema de Riemann: con $|f| \le M$, los coeficientes de las potencias negativas cumplen $|c_{-n}| \le M\rho^n$ para todo $\rho$ chico, así que valen $0$.`,
      test: () => [z => Z.div(Z.sin(z), z), z => Z.div(Z.sub(Z.exp(z), one), z)].every(f => [-1, -2, -3].every(n => Z.abs(Z.div(Z.circ(z => Z.mul(f(z), Z.ipow(z, -n - 1)), [0, 0], 0.5), I2)) < 1e-9)) },
    { t: R`el residuo de una función en una singularidad evitable es $0$`, v: true, why: R`El desarrollo de Laurent no tiene potencias negativas, y el residuo es el coeficiente de $(z - z_0)^{-1}$.`,
      test: () => [z => Z.div(Z.sin(z), z), z => Z.div(Z.sub(one, Z.cos(z)), Z.mul(z, z))].every(f => Z.abs(resNum(f, [0, 0])) < 1e-9) },
    { t: R`si el residuo de $f$ en una singularidad aislada $z_0$ es $0$, la singularidad es evitable`, v: false, why: R`$\frac{1}{z^2}$ tiene un polo doble en $0$ con residuo $0$: el residuo es solo el coeficiente de $\frac1z$, y puede haber otras potencias negativas.`,
      test: () => { const f = z => inv(Z.mul(z, z)); return !(Z.abs(resNum(f, [0, 0])) < 1e-9 && Mx(f, [0, 0], 1e-3) > 1e5); } },
    { t: R`$z = 0$ es una singularidad aislada de $f(z) = \dfrac{1}{\sin(1/z)}$`, v: false, why: R`$f$ tiene polos en $z = \frac{1}{n\pi}$, que se acumulan en $0$: todo entorno de $0$ contiene otras singularidades.`,
      test: () => ![1e-1, 1e-2, 1e-3].every(rr => { let n = Math.ceil(1 / (Math.PI * rr)) + 1; return Math.abs(Math.sin(n * Math.PI)) < 1e-9 && 1 / (n * Math.PI) < rr; }) },
    { t: R`$\operatorname{Log} z$ tiene una singularidad aislada en $z = 0$`, v: false, why: R`$\operatorname{Log} z$ no es analítica en ningún punto del semieje real negativo: todo entorno de $0$ contiene puntos del corte. $0$ es un punto de ramificación, no una singularidad aislada.`,
      test: () => ![1e-1, 1e-2, 1e-3].every(rr => Math.abs(Z.log([-rr, 1e-9])[1] - Z.log([-rr, -1e-9])[1]) > 1) },
    { t: R`si $f$ tiene un cero de orden $m$ en $z_0$, entonces $\frac1f$ tiene un polo de orden $m$ en $z_0$`, v: true, why: R`$f(z) = (z - z_0)^mg(z)$ con $g(z_0) \ne 0$, así que $\frac{1}{f(z)} = \frac{1/g(z)}{(z - z_0)^m}$, y $\frac1g$ es analítica y no nula en $z_0$.`,
      test: () => [[z => Z.sub(z, Z.sin(z)), 3], [z => Z.sub(one, Z.cos(z)), 2]].every(([f, m]) => Math.abs(slope(z => inv(f(z)), [0, 0], 0.02, 0.01) - m) < 0.05) },
    { t: R`en un polo simple $z_0$, el residuo es $\displaystyle\lim_{z\to z_0}(z - z_0)f(z)$`, v: true, why: R`Con $f(z) = \frac{c_{-1}}{z - z_0} + c_0 + c_1(z - z_0) + \dots$, al multiplicar por $(z - z_0)$ y tomar límite solo sobrevive $c_{-1}$.`,
      test: () => { const f = z => Z.div(Z.exp(z), Z.mul(Z.sub(z, [1, 0]), Z.add(z, [2, 0]))), h = [1e-6, 1e-6]; return Z.abs(Z.sub(Z.mul(h, f(Z.add([1, 0], h))), resNum(f, [1, 0]))) < 1e-5; } }
  ];
  T["c3-singularidades-vf"] = {
    type: "tf", concepts: ["c3-singularidades", "c3-residuo"], difficulty: 2,
    generate(r) {
      const S = r.pick(SING);
      return {
        prompt: `<b>Verdadero o falso:</b> ${S.t}.`,
        answer: S.v,
        explanation: `${S.v ? "Verdadero" : "Falso"}. ${S.why}`,
        solution: [`Ver [[c3-singularidades|singularidades aisladas]] y [[c3-residuo|residuos]].`],
        // verificación: un experimento numérico por afirmación (crecimiento de |f|, coeficientes de Laurent, residuos por integración)
        verify: { kind: "truth", fn: S.test }
      };
    }
  };

  T["c3-residuo-num"] = {
    type: "numeric", concepts: ["c3-residuo"], difficulty: 2,
    generate(r) {
      const form = r.pick(["A", "A", "B", "C", "D", "E"]), [a, b] = r.distinct(2, -3, 3, { nonzero: true }), c = r.int(-4, 4), k = r.pick([1, 2, -1]), s = r.sign(), ap = Math.abs(a), n = r.pick([0, 1, -1, 2]);
      let tex, z0, zt, f, num, den = 1, val = null, how;
      if (form === "A") {
        tex = `\\dfrac{${zm(-c)}}{(${zm(a)})(${zm(b)})}`; z0 = [a, 0]; zt = String(a); f = z => Z.div(Z.add(z, [c, 0]), Z.mul(Z.sub(z, [a, 0]), Z.sub(z, [b, 0]))); num = a + c; den = a - b;
        how = `$(${zm(a)})f(z) = \\dfrac{${zm(-c)}}{${zm(b)}}$, que en $z = ${a}$ vale $\\dfrac{${a + c}}{${a - b}}$.`;
      } else if (form === "B") {
        tex = `\\dfrac{e^{${H.kx(k, "z")}}}{z^{2} - ${ap * ap}}`; z0 = [s * ap, 0]; zt = String(s * ap); f = z => Z.div(Z.exp(Z.sc(k, z)), Z.sub(Z.mul(z, z), [ap * ap, 0])); val = Math.exp(k * s * ap) / (2 * s * ap);
        how = `Con $p(z) = e^{${H.kx(k, "z")}}$ y $q(z) = z^2 - ${ap * ap}$, $q'(z) = 2z$: $\\dfrac{p(z_0)}{q'(z_0)} = \\dfrac{e^{${k * s * ap}}}{${2 * s * ap}}$.`;
      } else if (form === "C") {
        tex = `\\dfrac{z ${c < 0 ? "-" : "+"} ${Math.abs(c) === 1 ? "" : Math.abs(c)}i}{z^{2} + ${ap * ap}}`; z0 = [0, ap]; zt = `${ap === 1 ? "" : ap}i`; f = z => Z.div(Z.add(z, [0, c]), Z.add(Z.mul(z, z), [ap * ap, 0])); num = ap + c; den = 2 * ap;
        if (c === 0) return null;
        how = `Con $p(z) = z ${c < 0 ? "-" : "+"} ${Math.abs(c) === 1 ? "" : Math.abs(c)}i$ y $q'(z) = 2z$: $\\dfrac{p(z_0)}{q'(z_0)} = \\dfrac{${ap + c}i}{${2 * ap}i}$.`;
      } else if (form === "D") {
        const withE = r.bool(); tex = withE ? `\\dfrac{e^{z}}{\\sin z}` : `\\dfrac{${c === 0 ? 1 : c}}{\\sin z}`; z0 = [n * Math.PI, 0]; zt = pif(n); const top = withE ? Math.exp(n * Math.PI) : (c === 0 ? 1 : c);
        f = z => Z.div(withE ? Z.exp(z) : [c === 0 ? 1 : c, 0], Z.sin(z)); val = top / Math.cos(n * Math.PI);
        how = `$q(z) = \\sin z$ tiene un cero simple en $${zt}$ y $q'(z) = \\cos z$: $\\dfrac{p(z_0)}{q'(z_0)} = \\dfrac{${withE ? `e^{${zt}}` : top}}{\\cos ${n === 0 ? "0" : zt}} = \\dfrac{${withE ? `e^{${zt}}` : top}}{${n % 2 ? -1 : 1}}$.`;
      } else {
        if (c === 0) return null;
        tex = `\\dfrac{z^{2} ${c < 0 ? "-" : "+"} ${Math.abs(c)}}{z\\,(${zm(a)})}`; z0 = [0, 0]; zt = "0"; f = z => Z.div(Z.add(Z.mul(z, z), [c, 0]), Z.mul(z, Z.sub(z, [a, 0]))); num = c; den = -a;
        how = `$z\\,f(z) = \\dfrac{z^2 ${c < 0 ? "-" : "+"} ${Math.abs(c)}}{${zm(a)}}$, que en $z = 0$ vale $\\dfrac{${c}}{${-a}}$.`;
      }
      const ans = val === null ? num / den : val;
      return {
        prompt: `Calculá el residuo de $f(z) = ${tex}$ en $z_0 = ${zt}$.`,
        answer: ans, ...(val === null ? { answerTex: H.frac(num, den) } : {}),
        solution: [`En un polo simple, $\\operatorname{Res} = \\lim_{z\\to z_0}(z - z_0)f(z)$; si $f = \\frac pq$ con $q(z_0) = 0$ y $q'(z_0) \\ne 0$, es $\\frac{p(z_0)}{q'(z_0)}$ ([[c3-residuo|residuos]]).`, how,
          `$\\operatorname{Res}_{z = ${zt}} f = ${val === null ? H.frac(num, den) : dn(val, 4)}$${val === null && num === 0 ? " (en realidad la singularidad es evitable: el numerador también se anula)" : ""}.`],
        // verificación: (1/2πi) ∮ f dz sobre una circunferencia chica alrededor del punto, calculada numéricamente
        verify: { kind: "value", tol: 1e-7, fn: () => resNum(f, z0)[0] }
      };
    }
  };

  T["c3-residuo-orden-num"] = {
    type: "numeric", concepts: ["c3-residuo"], difficulty: 3,
    generate(r) {
      const form = r.pick(["A", "A", "B", "C", "D", "E"]), a = r.nz(-2, 2), k = r.pick([1, 2, -1, 3]), m = r.pick([2, 3]);
      let tex, z0 = [a, 0], zt = String(a), f, val, num = null, den = 1, how, mm = m, trap = null;
      if (form === "A") {
        tex = `\\dfrac{e^{${H.kx(k, "z")}}}{(${zm(a)})^{${m}}}`; f = z => Z.div(Z.exp(Z.sc(k, z)), Z.ipow(Z.sub(z, [a, 0]), m)); val = k ** (m - 1) * Math.exp(k * a) / fact(m - 1);
        how = `$g(z) = (${zm(a)})^{${m}}f(z) = e^{${H.kx(k, "z")}}$, y $g^{(${m - 1})}(z) = ${H.cf(k ** (m - 1))}e^{${H.kx(k, "z")}}$. Entonces $\\operatorname{Res} = \\dfrac{${k ** (m - 1)}\\,e^{${k * a}}}{${m - 1}!}$.`;
        if (m === 3) trap = k * k * Math.exp(k * a);
      } else if (form === "B") {
        tex = `\\dfrac{1}{z^{${m}}(${zm(a)})}`; z0 = [0, 0]; zt = "0"; f = z => inv(Z.mul(Z.ipow(z, m), Z.sub(z, [a, 0]))); num = -1; den = a ** m;
        how = `$g(z) = z^{${m}}f(z) = \\dfrac{1}{${zm(a)}}$, con $g'(z) = -\\dfrac{1}{(${zm(a)})^2}$${m === 3 ? ` y $g''(z) = \\dfrac{2}{(${zm(a)})^3}$` : ""}. En $z = 0$: $\\dfrac{g^{(${m - 1})}(0)}{${m - 1}!} = ${H.frac(-1, a ** m)}$.`;
      } else if (form === "C") {
        const C = r.pick([{ t: `\\dfrac{\\cos z}{z^{3}}`, f: z => Z.div(Z.cos(z), Z.ipow(z, 3)), n: -1, d: 2, m: 3, h: `$\\cos z = 1 - \\frac{z^2}{2} + \\dots$, así que $f(z) = \\frac{1}{z^3} - \\frac{1}{2z} + \\dots$` },
          { t: `\\dfrac{\\sin z}{z^{4}}`, f: z => Z.div(Z.sin(z), Z.ipow(z, 4)), n: -1, d: 6, m: 3, h: `$\\sin z = z - \\frac{z^3}{6} + \\dots$, así que $f(z) = \\frac{1}{z^3} - \\frac{1}{6z} + \\dots$ (el polo es de orden 3, no 4).` },
          { t: `\\dfrac{e^{${H.kx(k, "z")}} - 1}{z^{3}}`, f: z => Z.div(Z.sub(Z.exp(Z.sc(k, z)), one), Z.ipow(z, 3)), n: k * k, d: 2, m: 2, h: `$e^{${H.kx(k, "z")}} - 1 = ${H.kx(k, "z")} + \\frac{${k * k}z^2}{2} + \\dots$, así que el coeficiente de $\\frac1z$ es $\\frac{${k * k}}{2}$.` }]);
        tex = C.t; f = C.f; z0 = [0, 0]; zt = "0"; num = C.n; den = C.d; mm = C.m; how = `Acá conviene el desarrollo de Laurent: ${C.h}`;
      } else if (form === "D") {
        tex = `\\dfrac{z\\,e^{z}}{(${zm(a)})^{2}}`; f = z => Z.div(Z.mul(z, Z.exp(z)), Z.ipow(Z.sub(z, [a, 0]), 2)); val = (1 + a) * Math.exp(a); mm = 2;
        how = `$g(z) = z\\,e^z$ y $g'(z) = (1 + z)e^z$: $\\operatorname{Res} = g'(${a}) = ${1 + a === 0 ? "0" : `${H.cf(1 + a)}e^{${a}}`}$.`;
      } else {
        tex = `\\dfrac{1}{z\\,(${zm(a)})^{2}}`; f = z => inv(Z.mul(z, Z.ipow(Z.sub(z, [a, 0]), 2))); num = -1; den = a * a; mm = 2;
        how = `$g(z) = (${zm(a)})^2f(z) = \\dfrac1z$ y $g'(z) = -\\dfrac{1}{z^2}$: $\\operatorname{Res} = g'(${a}) = ${H.frac(-1, a * a)}$.`;
      }
      const ans = num === null ? val : num / den;
      return {
        prompt: `Calculá el residuo de $f(z) = ${tex}$ en $z_0 = ${zt}$.`,
        answer: Math.abs(ans) < 1e-12 ? 0 : ans, ...(num === null ? {} : { answerTex: H.frac(num, den) }),
        traps: trap !== null && far(trap, ans) ? [{ value: trap, msg: "Falta dividir por $(m - 1)!$: en un polo de orden 3 es $\\frac{g''(z_0)}{2!}$." }] : [],
        solution: [`En un polo de orden $m$: $\\operatorname{Res} = \\dfrac{g^{(m-1)}(z_0)}{(m - 1)!}$, con $g(z) = (z - z_0)^mf(z)$ ([[c3-residuo|residuos]]). Acá el polo es de orden $${mm}$.`, how,
          `$\\operatorname{Res}_{z = ${zt}} f = ${num === null ? dn(val, 4) : H.frac(num, den)}$.`],
        verify: { kind: "value", tol: 1e-7, fn: () => resNum(f, z0, 0.4)[0] }
      };
    }
  };

  T["c3-teorema-residuos-num"] = {
    type: "numeric", concepts: ["c3-residuo"], difficulty: 3,
    generate(r) {
      const form = r.pick(["A", "A", "B", "C"]), Rr = r.pick([2, 3]), p = r.int(-3, 3), q = r.nz(-5, 5), k = r.pick([1, 2, -1, 3]), m = r.int(0, 3);
      let tex, f, num, den, steps, RR = Rr;
      if (form === "A") {
        const [a, b] = r.distinct(2, -5, 5, { nonzero: true, exclude: [Rr, -Rr] }), inA = Math.abs(a) < Rr, inB = Math.abs(b) < Rr;
        const top = H.poly([[p, "z"], [q, ""]]); tex = `\\dfrac{${top}}{(${zm(a)})(${zm(b)})}`; f = z => Z.div(Z.add(Z.sc(p, z), [q, 0]), Z.mul(Z.sub(z, [a, 0]), Z.sub(z, [b, 0])));
        num = (inA ? p * a + q : 0) - (inB ? p * b + q : 0); den = a - b;
        steps = [`Polos simples en $z = ${a}$ (${inA ? "adentro" : "afuera"}) y $z = ${b}$ (${inB ? "adentro" : "afuera"}) de $|z| = ${Rr}$.`,
          `$\\operatorname{Res}_{z=${a}} = \\dfrac{${p * a + q}}{${a - b}}$ y $\\operatorname{Res}_{z=${b}} = \\dfrac{${p * b + q}}{${b - a}}$. ${inA && inB ? "Se suman los dos." : inA || inB ? "Solo cuenta el de adentro." : "Ninguno queda adentro: la integral vale $0$ (Cauchy-Goursat)."}`];
      } else if (form === "B") {
        RR = 1; tex = `${m === 0 ? "" : m === 1 ? "z\\," : `z^{${m}}`}e^{${k === 1 ? "1" : k}/z}`; f = z => Z.mul(Z.ipow(z, m), Z.exp(Z.sc(k, inv(z)))); num = k ** (m + 1); den = fact(m + 1);
        steps = [`La única singularidad es $z = 0$, **esencial**: no hay fórmula de polos, hay que mirar el desarrollo de Laurent.`,
          `$e^{${k === 1 ? "1" : k}/z} = \\sum \\dfrac{${k === 1 ? "1" : `${H.par(k)}^n`}}{n!\\,z^n}$. Al multiplicar por $z^{${m}}$, el término con $\\frac1z$ es el de $n = ${m + 1}$: el residuo es $\\dfrac{${k ** (m + 1)}}{${m + 1}!}$.`];
      } else {
        const a = r.pick([1, -1, 4, -4, 5]), inside = Math.abs(a) < Rr; tex = `\\dfrac{1}{z\\,(${zm(a)})^{2}}`; f = z => inv(Z.mul(z, Z.ipow(Z.sub(z, [a, 0]), 2)));
        num = inside ? 0 : 1; den = a * a;
        steps = [`Polo simple en $0$, con residuo $\\dfrac{1}{(0 ${a < 0 ? "+" : "-"} ${Math.abs(a)})^2} = ${H.frac(1, a * a)}$, y polo doble en $z = ${a}$, con residuo $\\left.\\dfrac{d}{dz}\\dfrac1z\\right|_{z=${a}} = ${H.frac(-1, a * a)}$.`,
          inside ? `Los dos quedan dentro de $|z| = ${Rr}$ y se cancelan.` : `Solo $z = 0$ queda dentro de $|z| = ${Rr}$.`];
      }
      const K = num / den;
      return {
        prompt: `Calculá $\\displaystyle\\oint_{|z| = ${RR}} ${tex}\\,dz$ (sentido positivo). El resultado es $2\\pi i\\,K$, con $K$ real: ¿cuánto vale $K$?`,
        answer: K === 0 ? 0 : K, answerTex: H.frac(num, den),
        solution: [`[[c3-residuo|Teorema de los residuos]]: $\\oint_C f\\,dz = 2\\pi i\\sum\\operatorname{Res}$, sumando sobre los puntos singulares que quedan **dentro** de $C$.`, ...steps, `$K = ${H.frac(num, den)}$.`],
        // verificación: la integral sobre la circunferencia, calculada numéricamente y dividida por 2πi
        verify: { kind: "value", tol: 1e-6, fn: () => Z.div(Z.circ(f, [0, 0], RR, 6000), I2)[0] }
      };
    }
  };

  const cards = {
    "c3-singularidades": {
      title: "Singularidades aisladas: evitables, polos y esenciales", aliases: ["singularidad aislada", "singularidad evitable", "singularidad esencial", "polo de orden m", "parte principal", "teorema de Casorati-Weierstrass"], concepts: ["c3-singularidades"],
      summary: "z₀ es singularidad aislada si f es analítica en 0 < |z − z₀| < ε. Según la parte principal del Laurent: evitable (ninguna potencia negativa; f tiene límite), polo de orden m (hasta (z − z₀)⁻ᵐ; |f| → ∞) o esencial (infinitas; no hay límite).",
      def: [R`Un [[c3-analitica|punto singular]] $z_0$ es una **singularidad aislada** de $f$ si $f$ es analítica en algún entorno reducido $0 < |z - z_0| < \varepsilon$. Ahí vale un [[c3-laurent|desarrollo de Laurent]], y su **parte principal** $\sum_{n\ge1}\frac{c_{-n}}{(z - z_0)^n}$ clasifica la singularidad:`,
        R`**Evitable:** la parte principal es nula. Equivale a que exista $\lim_{z\to z_0}f(z)$ (finito), o a que $f$ esté acotada cerca de $z_0$ (teorema de Riemann). Definiendo $f(z_0)$ como ese límite, $f$ queda analítica.`,
        R`**Polo de orden $m$:** la parte principal termina en $\frac{c_{-m}}{(z - z_0)^m}$, con $c_{-m} \ne 0$. Equivale a $f(z) = \frac{g(z)}{(z - z_0)^m}$ con $g$ analítica y $g(z_0) \ne 0$, y a que $|f(z)| \to \infty$ cuando $z \to z_0$. Con $m = 1$ es un **polo simple**.`,
        R`**Esencial:** la parte principal tiene infinitos términos. $f$ no tiene límite, ni finito ni infinito: en todo entorno de $z_0$, $f$ se acerca tanto como se quiera a cualquier complejo (**teorema de Casorati-Weierstrass**).`],
      idea: [R`Las tres clases son tres comportamientos: la función se porta bien (evitable), se va a infinito de manera ordenada (polo) o hace cualquier cosa (esencial).`,
        R`No toda singularidad es aislada: $\operatorname{Log} z$ en $0$ no lo es (todo el corte es singular), ni $\frac{1}{\sin(1/z)}$ en $0$ (los polos $\frac{1}{n\pi}$ se acumulan). Para esas no hay desarrollo de Laurent ni residuo.`,
        R`En la práctica, para un cociente $\frac pq$ se comparan los órdenes de los ceros: si $p$ tiene un cero de orden $k$ y $q$ uno de orden $m$ en $z_0$, hay un polo de orden $m - k$ si $m > k$, y una singularidad evitable si $m \le k$.`],
      demo: [R`**Paso 1 (evitable ⇒ límite).** Sin parte principal, $f(z) = c_0 + c_1(z - z_0) + \dots$ en el entorno reducido. Una serie de potencias es continua en su círculo, así que $f(z) \to c_0$.`,
        R`**Paso 2 (acotada ⇒ evitable: Riemann).** Si $|f| \le M$ en $0 < |z - z_0| < \varepsilon$, por la fórmula de los coeficientes y la cota ML sobre $|z - z_0| = \rho$: $|c_{-n}| = \left|\frac{1}{2\pi i}\oint f(z)(z - z_0)^{n-1}dz\right| \le \frac{1}{2\pi}M\rho^{n-1}\,2\pi\rho = M\rho^n$. Vale para todo $\rho$ chico, así que $c_{-n} = 0$ para $n \ge 1$.`,
        R`**Paso 3 (polo ⇔ $g/(z - z_0)^m$).** Si la parte principal termina en $n = m$, sacando factor común $(z - z_0)^{-m}$ queda $f(z) = \frac{g(z)}{(z - z_0)^m}$ con $g(z) = c_{-m} + c_{-m+1}(z - z_0) + \dots$, una serie de potencias (analítica) con $g(z_0) = c_{-m} \ne 0$. El camino inverso es desarrollar $g$ en serie de Taylor y dividir.`,
        R`**Paso 4 (polo ⇒ infinito).** Como $g$ es continua y $g(z_0) \ne 0$, cerca de $z_0$ vale $|g(z)| > \frac{|g(z_0)|}{2}$, y entonces $|f(z)| > \frac{|g(z_0)|}{2|z - z_0|^m} \to \infty$. $\blacksquare$`],
      examples: [{ q: R`Clasificá la singularidad de $\dfrac{\sin z}{z^3}$ en $0$.`, steps: [R`$\dfrac{\sin z}{z^3} = \dfrac{1}{z^2} - \dfrac16 + \dfrac{z^2}{120} - \dots$: polo de orden 2 (no 3).`] },
        { q: R`¿Y la de $e^{1/z}$?`, steps: [R`$e^{1/z} = 1 + \dfrac1z + \dfrac{1}{2z^2} + \dots$: infinitas potencias negativas, esencial. Por la derecha tiende a $\infty$ y por la izquierda a $0$.`] }],
      tips: [R`El orden del polo **no** es siempre el exponente del denominador: si el numerador se anula en $z_0$, baja.`],
      see: ["c3-analitica", "c3-laurent", "c3-ceros-polos", "c3-residuo"]
    },
    "c3-ceros-polos": {
      title: "Ceros de una función analítica y su relación con los polos", aliases: ["cero de orden m", "orden de un cero", "cero simple", "ceros aislados", "principio de identidad"], concepts: ["c3-ceros-polos"],
      summary: "f tiene un cero de orden m en z₀ si f(z) = (z − z₀)ᵐ g(z) con g(z₀) ≠ 0; equivale a f(z₀) = … = f⁽ᵐ⁻¹⁾(z₀) = 0 y f⁽ᵐ⁾(z₀) ≠ 0. Los ceros de una analítica no nula son aislados. Un cero de orden m de f es un polo de orden m de 1/f.",
      def: [R`$f$, analítica en $z_0$, tiene un **cero de orden $m$** ahí si $$f(z_0) = f'(z_0) = \dots = f^{(m-1)}(z_0) = 0,\qquad f^{(m)}(z_0) \ne 0.$$ Equivale a $f(z) = (z - z_0)^mg(z)$ con $g$ analítica y $g(z_0) \ne 0$: la serie de Taylor empieza en la potencia $m$.`,
        R`**Los ceros son aislados.** Si $f$ es analítica en un dominio y no es idénticamente nula, cada cero tiene un entorno sin otros ceros. Consecuencia (**principio de identidad**): dos funciones analíticas en un dominio que coinciden sobre un segmento, o sobre una sucesión de puntos que se acumula dentro del dominio, coinciden en todo el dominio.`,
        R`**Ceros y polos.** Si $p$ y $q$ son analíticas en $z_0$, $p$ tiene un cero de orden $k \ge 0$ y $q$ uno de orden $m \ge 1$, entonces $\frac pq$ tiene en $z_0$ un polo de orden $m - k$ si $m > k$, y una singularidad evitable si $m \le k$. En particular, $\frac1q$ tiene un polo de orden $m$.`],
      idea: [R`Un cero de orden $m$ es un punto donde la función se anula «como $(z - z_0)^m$». Los órdenes se comportan como exponentes: se suman al multiplicar y se restan al dividir.`,
        R`El principio de identidad es otra muestra de la rigidez de las funciones analíticas. Por eso las identidades trigonométricas siguen valiendo en los complejos: las dos caras de la identidad son funciones enteras que coinciden sobre el eje real.`],
      demo: [R`**Paso 1 (factorizar).** Por el [[c3-taylor|teorema de Taylor]], $f(z) = \sum_{n\ge m} a_n(z - z_0)^n$ con $a_m = \frac{f^{(m)}(z_0)}{m!} \ne 0$ (los anteriores se anulan). Sacando factor común: $f(z) = (z - z_0)^mg(z)$, con $g(z) = a_m + a_{m+1}(z - z_0) + \dots$ analítica y $g(z_0) = a_m \ne 0$.`,
        R`**Paso 2 (los ceros son aislados).** $g$ es continua y $g(z_0) \ne 0$, así que $g(z) \ne 0$ en algún entorno de $z_0$. Ahí, $f(z) = (z - z_0)^mg(z)$ solo se anula en $z = z_0$. (Si todas las derivadas se anularan en $z_0$, la serie de Taylor sería nula y $f = 0$ en un disco; se muestra que entonces $f = 0$ en todo el dominio.)`,
        R`**Paso 3 (cociente).** Con $p = (z - z_0)^kP$ y $q = (z - z_0)^mQ$, donde $P(z_0) \ne 0 \ne Q(z_0)$: $\frac pq = \frac{P/Q}{(z - z_0)^{m - k}}$, y $\frac PQ$ es analítica y no nula en $z_0$. Si $m > k$, es la forma de un [[c3-singularidades|polo de orden m − k]]; si no, la función tiene límite. $\blacksquare$`],
      examples: [{ q: R`Orden del cero de $z - \sin z$ en $0$.`, steps: [R`$z - \sin z = \dfrac{z^3}{6} - \dfrac{z^5}{120} + \dots$: orden 3.`] },
        { q: R`Polos de $\dfrac{1}{\sin z}$.`, steps: [R`$\sin z$ se anula en $n\pi$, con derivada $\cos n\pi = \pm1 \ne 0$: ceros simples. Entonces $\frac{1}{\sin z}$ tiene polos simples en $z = n\pi$.`] }],
      see: ["c3-taylor", "c3-singularidades", "c3-residuo"]
    },
    "c3-residuo": {
      title: "Residuos y teorema de los residuos", aliases: ["teorema de los residuos", "residuo de una función", "residuo en un polo", "cálculo de residuos"], concepts: ["c3-residuo"],
      summary: "El residuo de f en una singularidad aislada z₀ es el coeficiente c₋₁ de su Laurent. Teorema: ∮ f dz = 2πi Σ Res, sobre las singularidades dentro de C. Polo simple: lím (z − z₀)f(z) = p(z₀)/q'(z₀). Polo de orden m: g⁽ᵐ⁻¹⁾(z₀)/(m − 1)!.",
      def: [R`Si $z_0$ es una [[c3-singularidades|singularidad aislada]] de $f$, su **residuo** es el coeficiente de $\frac{1}{z - z_0}$ en el desarrollo de Laurent válido en $0 < |z - z_0| < \varepsilon$: $$\operatorname*{Res}_{z = z_0} f = c_{-1} = \frac{1}{2\pi i}\oint_{|z - z_0| = \rho} f(z)\,dz.$$`,
        R`**Teorema de los residuos.** Si $f$ es analítica dentro y sobre un contorno cerrado simple positivo $C$, salvo en un número finito de puntos singulares $z_1, \dots, z_n$ interiores a $C$, $$\oint_C f(z)\,dz = 2\pi i\sum_{k=1}^n \operatorname*{Res}_{z = z_k} f.$$`,
        R`**Cómo calcularlos.** Polo simple: $\operatorname{Res} = \lim_{z\to z_0}(z - z_0)f(z)$. Si $f = \frac pq$ con $p(z_0) \ne 0$, $q(z_0) = 0$ y $q'(z_0) \ne 0$: $$\operatorname*{Res}_{z = z_0}\frac pq = \frac{p(z_0)}{q'(z_0)}.$$ Polo de orden $m$, con $g(z) = (z - z_0)^mf(z)$: $$\operatorname*{Res}_{z = z_0} f = \frac{g^{(m-1)}(z_0)}{(m - 1)!}.$$ Singularidad esencial (o cuando las derivadas son pesadas): se busca el coeficiente de $\frac{1}{z - z_0}$ directamente en el desarrollo de Laurent. Evitable: $0$.`],
      idea: [R`De todo el desarrollo de Laurent, lo único que sobrevive al integrar alrededor del punto es el término $\frac{c_{-1}}{z - z_0}$: las demás potencias tienen primitiva y su integral sobre una curva cerrada es cero. Lo que queda, el «residuo», es $2\pi i\,c_{-1}$.`,
        R`El teorema convierte integrales en cuentas algebraicas: en lugar de parametrizar y buscar primitivas, se ubican las singularidades de adentro y se suman sus residuos. La [[c3-cauchy-formula|fórmula integral de Cauchy]] es el caso particular de un solo polo.`,
        R`Esta palabra no tiene nada que ver con los residuos de la estadística (las diferencias entre los datos y un ajuste).`],
      demo: [R`**Paso 1 (un solo punto).** En $0 < |z - z_0| < \varepsilon$, $f(z) = \sum_{n=-\infty}^\infty c_n(z - z_0)^n$. La fórmula de los coeficientes de [[c3-laurent|Laurent]] con $n = -1$ es $c_{-1} = \frac{1}{2\pi i}\oint f(z)\,dz$: por eso las dos definiciones coinciden.`,
        R`**Paso 2 (teorema).** Se rodea cada $z_k$ con una circunferencia chica $C_k$, de modo que no se toquen y queden dentro de $C$. $f$ es analítica entre $C$ y las $C_k$, así que por [[c3-cauchy-goursat|Cauchy-Goursat para dominios con agujeros]], $\oint_C f\,dz = \sum_k\oint_{C_k} f\,dz = \sum_k 2\pi i\operatorname{Res}_{z_k}f$.`,
        R`**Paso 3 (polo de orden $m$).** $g(z) = (z - z_0)^mf(z) = c_{-m} + c_{-m+1}(z - z_0) + \dots + c_{-1}(z - z_0)^{m-1} + \dots$ es una serie de Taylor. Su coeficiente de $(z - z_0)^{m-1}$ es, por un lado, $c_{-1}$, y por otro, $\frac{g^{(m-1)}(z_0)}{(m-1)!}$.`,
        R`**Paso 4 (la fórmula $p/q'$).** Si $q$ tiene un cero simple, $q(z) = (z - z_0)Q(z)$ con $Q(z_0) = q'(z_0)$ (derivando el producto y evaluando en $z_0$). Entonces $(z - z_0)\frac pq = \frac pQ \to \frac{p(z_0)}{q'(z_0)}$. $\blacksquare$`],
      examples: [{ q: R`$\displaystyle\oint_{|z| = 2}\frac{5z - 2}{z(z - 1)}\,dz$.`, steps: [R`Polos simples en $0$ y $1$, los dos adentro. $\operatorname{Res}_0 = \frac{-2}{-1} = 2$ y $\operatorname{Res}_1 = \frac{3}{1} = 3$.`, R`La integral vale $2\pi i\,(2 + 3) = 10\pi i$.`] },
        { q: R`$\displaystyle\oint_{|z| = 1} z^2e^{1/z}\,dz$.`, steps: [R`$z^2e^{1/z} = z^2 + z + \frac12 + \frac{1}{6z} + \dots$: el residuo en $0$ es $\frac16$.`, R`La integral vale $\frac{\pi i}{3}$.`] }],
      tips: [R`Solo cuentan las singularidades **de adentro**. Dibujá el contorno y marcalas antes de calcular nada.`, R`Si usás la fórmula de un polo de orden mayor que el real, igual da bien (con más cuentas). Con un orden menor, da mal.`],
      see: ["c3-singularidades", "c3-laurent", "c3-cauchy-goursat", "c3-cauchy-formula", "c3-ceros-polos"]
    }
  };

  E.extendCourse("m103", {
    concepts: { "c3-singularidades": { name: "Singularidades aisladas" }, "c3-ceros-polos": { name: "Ceros y polos" }, "c3-residuo": { name: "Residuos" } },
    templates: T,
    units: [{
      id: "c3-residuos-u", order: 6, program: "Unidad 6", title: "Singularidades y residuos", icon: "target",
      diagnostic: ["c3-clasificar-mc", "c3-residuo-num", "c3-teorema-residuos-num"],
      lessons: [
        { id: "c3-singularidades", title: "Singularidades, ceros y polos", templates: ["c3-clasificar-mc", "c3-ceros-num", "c3-singularidades-vf"], theory: ["c3-singularidades", "c3-ceros-polos"],
          intro: R`Evitable, polo o esencial, según cuántas potencias negativas tenga el desarrollo de Laurent.` },
        { id: "c3-residuos", title: "Residuos y teorema de los residuos", templates: ["c3-residuo-num", "c3-residuo-orden-num", "c3-teorema-residuos-num"], theory: ["c3-residuo"],
          intro: R`$\oint_C f\,dz = 2\pi i\sum\operatorname{Res}$. En un polo simple, $\operatorname{Res}\frac pq = \frac{p(z_0)}{q'(z_0)}$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 7 · APLICACIONES DE LOS RESIDUOS: INTEGRALES REALES, SUMAS DE SERIES Y CONTEO DE CEROS
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, Z = E.c3, dn = Z.dn, pif = Z.pif;
  const T = {};
  const far = (v, ans) => Math.abs(v - ans) > 0.03 * Math.max(1, Math.abs(ans));
  const one = [1, 0], I2 = [0, 2 * Math.PI], inv = z => Z.div(one, z);
  const zm = (a, v = "z") => (a === 0 ? v : `${v} ${a < 0 ? "+" : "-"} ${Math.abs(a)}`);
  // ∫ f(x) dx sobre toda la recta (o sobre [0, ∞)) con x = tan u y la regla del punto medio: no usa residuos
  const realLine = (f, half = false, N = 40000) => { const lo = half ? 0 : -Math.PI / 2, h = (Math.PI / 2 - lo) / N; let s = 0; for (let k = 0; k < N; k++) { const u = lo + (k + 0.5) * h, c = Math.cos(u); s += f(Math.tan(u)) / (c * c); } return s * h; };
  const simpson = (f, a, b, n) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3; };

  T["c3-impropia-num"] = {
    type: "numeric", concepts: ["c3-impropias-res"], difficulty: 2, testN: 60,
    generate(r) {
      const form = r.pick(["A", "C", "D", "E", "F", "G"]), [a, b] = r.distinct(2, 1, 4), p = r.nz(-3, 3), q = r.int(1, 4), half = form !== "F" && r.bool(0.3), h = half ? 2 : 1, a2 = a * a, b2 = b * b;
      const D = {
        A: { tex: `\\dfrac{1}{x^{2} + ${a2}}`, f: x => 1 / (x * x + a2), val: Math.PI / a, aT: pif(1, a * h), how: [`Polo simple en $z = ${a === 1 ? "" : a}i$ (el otro, $-${a === 1 ? "" : a}i$, está abajo). $\\operatorname{Res} = \\dfrac{1}{2z}\\Big|_{z = ${a === 1 ? "" : a}i} = \\dfrac{1}{${2 * a}i}$.`, `$2\\pi i\\cdot\\dfrac{1}{${2 * a}i} = ${pif(1, a)}$.`] },
        C: { tex: `\\dfrac{1}{(x^{2} + ${a2})^{2}}`, f: x => 1 / (x * x + a2) ** 2, val: Math.PI / (2 * a ** 3), aT: pif(1, 2 * a ** 3 * h), how: [`Polo **doble** en $z = ${a === 1 ? "" : a}i$. Con $g(z) = \\dfrac{1}{(z + ${a === 1 ? "" : a}i)^2}$: $\\operatorname{Res} = g'(${a === 1 ? "" : a}i) = \\dfrac{-2}{(${2 * a}i)^3} = \\dfrac{1}{${4 * a ** 3}i}$.`, `$2\\pi i\\cdot\\dfrac{1}{${4 * a ** 3}i} = ${pif(1, 2 * a ** 3)}$.`] },
        D: { tex: `\\dfrac{x^{2}}{(x^{2} + ${a2})(x^{2} + ${b2})}`, f: x => x * x / ((x * x + a2) * (x * x + b2)), val: Math.PI / (a + b), aT: pif(1, (a + b) * h), how: [`Polos simples en $${a === 1 ? "" : a}i$ y $${b === 1 ? "" : b}i$. Con $\\frac{p}{q'}$: $\\operatorname{Res}_{${a === 1 ? "" : a}i} = \\dfrac{${-a2}}{${2 * a}i\\,(${b2 - a2})}$ y $\\operatorname{Res}_{${b === 1 ? "" : b}i} = \\dfrac{${-b2}}{${2 * b}i\\,(${a2 - b2})}$.`, `La suma es $\\dfrac{1}{${2 * (a + b)}i}$, y $2\\pi i\\cdot\\dfrac{1}{${2 * (a + b)}i} = ${pif(1, a + b)}$.`] },
        E: { tex: `\\dfrac{1}{x^{4} + ${a ** 4}}`, f: x => 1 / (x ** 4 + a ** 4), val: Math.PI / (Math.SQRT2 * a ** 3), aT: `\\frac{\\pi}{${a ** 3 * h === 1 ? "" : a ** 3 * h}\\sqrt{2}}`, how: [`$z^4 = -${a ** 4}$ tiene dos raíces arriba: $z_1 = ${a === 1 ? "" : a}e^{i\\pi/4}$ y $z_2 = ${a === 1 ? "" : a}e^{3i\\pi/4}$. En cada una, $\\operatorname{Res} = \\dfrac{1}{4z^3} = -\\dfrac{z}{${4 * a ** 4}}$ (porque $z^4 = -${a ** 4}$).`, `$z_1 + z_2 = ${a === 1 ? "" : a}\\sqrt2\\,i$, así que la suma es $-\\dfrac{\\sqrt2\\,i}{${4 * a ** 3}}$ y la integral, $2\\pi i$ por eso: $\\dfrac{\\pi\\sqrt2}{${2 * a ** 3}}$.`] },
        F: { tex: `\\dfrac{1}{${H.poly([[1, "x^{2}"], [2 * p, "x"], [p * p + q * q, ""]])}}`, f: x => 1 / ((x + p) ** 2 + q * q), val: Math.PI / q, aT: pif(1, q), how: [`Completando cuadrados, el denominador es $(z ${p < 0 ? "-" : "+"} ${Math.abs(p)})^2 + ${q * q}$: polos en $${-p} \\pm ${q === 1 ? "" : q}i$. Arriba queda $z_0 = ${Z.tex([-p, q])}$.`, `$\\operatorname{Res} = \\dfrac{1}{q'(z_0)} = \\dfrac{1}{2(z_0 ${p < 0 ? "-" : "+"} ${Math.abs(p)})} = \\dfrac{1}{${2 * q}i}$, y $2\\pi i\\cdot\\dfrac{1}{${2 * q}i} = ${pif(1, q)}$.`] },
        G: { tex: `\\dfrac{x^{2}}{(x^{2} + ${a2})^{2}}`, f: x => x * x / (x * x + a2) ** 2, val: Math.PI / (2 * a), aT: pif(1, 2 * a * h), how: [`Polo doble en $z = ${a === 1 ? "" : a}i$. Con $g(z) = \\dfrac{z^2}{(z + ${a === 1 ? "" : a}i)^2}$, $g'(z) = \\dfrac{${2 * a}i\\,z}{(z + ${a === 1 ? "" : a}i)^3}$ y $g'(${a === 1 ? "" : a}i) = \\dfrac{1}{${4 * a}i}$.`, `$2\\pi i\\cdot\\dfrac{1}{${4 * a}i} = ${pif(1, 2 * a)}$.`] }
      }[form];
      const ans = D.val / h;
      return {
        prompt: `Calculá $\\displaystyle\\int_{${half ? "0" : "-\\infty"}}^{\\infty} ${D.tex}\\,dx$.`,
        answer: ans, answerTex: D.aT,
        traps: half ? [{ value: D.val, msg: "Ese es el valor sobre toda la recta. Como el integrando es par, de $0$ a $\\infty$ es la mitad." }] : [],
        solution: [`El grado del denominador supera en 2 o más al del numerador y no hay polos reales: $\\int_{-\\infty}^{\\infty} f(x)\\,dx = 2\\pi i\\sum\\operatorname{Res}$ en los polos del **semiplano superior** ([[c3-impropias-residuos|integrales impropias por residuos]]).`, ...D.how,
          ...(half ? [`El integrando es par: de $0$ a $\\infty$ es la mitad, $${D.aT}$.`] : [])],
        // verificación: cuadratura numérica directa sobre la recta, con x = tan u
        verify: { kind: "value", tol: 1e-6, fn: () => realLine(D.f, half) }
      };
    }
  };

  T["c3-impropia-multi"] = {
    type: "multi", concepts: ["c3-impropias-res"], difficulty: 3, testN: 60,
    generate(r) {
      const form = r.int(0, 3), [a, b] = r.distinct(2, 1, 3).sort((x, y) => x - y), p = r.nz(-2, 2), q = r.int(1, 3), a2 = a * a, b2 = b * b;
      // denominador como polinomio (coeficientes reales, del grado mayor al menor) y polos del semiplano superior con su orden
      const F = [
        { tex: `\\dfrac{1}{(z^{2} + ${a2})(z^{2} + ${b2})}`, den: [1, 0, a2 + b2, 0, a2 * b2], up: 2, note: `Polos simples en $\\pm ${a === 1 ? "" : a}i$ y $\\pm ${b === 1 ? "" : b}i$; arriba quedan $${a === 1 ? "" : a}i$ y $${b === 1 ? "" : b}i$.` },
        { tex: `\\dfrac{1}{(z^{2} + ${a2})^{2}}`, den: [1, 0, 2 * a2, 0, a2 * a2], up: 1, note: `Polos dobles en $\\pm ${a === 1 ? "" : a}i$; arriba queda solo $${a === 1 ? "" : a}i$ (un punto, aunque el polo sea doble).` },
        { tex: `\\dfrac{1}{z^{4} + ${a ** 4}}`, den: [1, 0, 0, 0, a ** 4], up: 2, note: `Las cuatro raíces cuartas de $-${a ** 4}$ son $${a === 1 ? "" : a}e^{i\\pi/4}$, $${a === 1 ? "" : a}e^{3i\\pi/4}$, $${a === 1 ? "" : a}e^{5i\\pi/4}$ y $${a === 1 ? "" : a}e^{7i\\pi/4}$; arriba quedan las dos primeras.` },
        { tex: `\\dfrac{1}{(z^{2} + ${a2})(${H.poly([[1, "z^{2}"], [2 * p, "z"], [p * p + q * q, ""]])})}`, den: [1, 2 * p, p * p + q * q + a2, 2 * p * a2, a2 * (p * p + q * q)], up: 2, note: `Polos simples en $\\pm ${a === 1 ? "" : a}i$ y en $${-p} \\pm ${q === 1 ? "" : q}i$; arriba quedan $${a === 1 ? "" : a}i$ y $${Z.tex([-p, q])}$.` }
      ][form];
      const pol = z => F.den.reduce((s, c) => Z.add(Z.mul(s, z), [c, 0]), [0, 0]), f = z => inv(pol(z)), fx = x => 1 / F.den.reduce((s, c) => s * x + c, 0);
      // suma de residuos del semiplano superior: en cada raíz z_k (simple) es 1/q'(z_k); en la doble de la forma 1, 1/(4a³ i)
      const dpol = z => F.den.slice(0, -1).reduce((s, c, i) => Z.add(Z.mul(s, z), [c * (F.den.length - 1 - i), 0]), [0, 0]);
      const ups = form === 0 ? [[0, a], [0, b]] : form === 1 ? [[0, a]] : form === 2 ? [Z.polar(a, Math.PI / 4), Z.polar(a, 3 * Math.PI / 4)] : [[0, a], [-p, q]];
      const sum = form === 1 ? [0, -1 / (4 * a ** 3)] : ups.map(z => inv(dpol(z))).reduce(Z.add), S = -sum[1];
      return {
        prompt: `Para calcular $\\displaystyle\\int_{-\\infty}^{\\infty} ${F.tex.replace(/z/g, "x")}\\,dx$ por residuos, se integra $f(z) = ${F.tex}$ sobre el segmento $[-R, R]$ cerrado con la semicircunferencia superior de radio $R$.`,
        parts: [
          { q: "¿Cuántos puntos singulares de $f$ quedan dentro del contorno, cuando $R$ es grande?", type: "numeric", answer: F.up,
            // verificación: se buscan las raíces del denominador (Durand-Kerner) y se cuentan las distintas con parte imaginaria positiva
            verify: { kind: "value", fn: () => { const rs = Z.roots(F.den.map(c => [c, 0])).filter(z => z[1] > 0); return rs.filter((z, i) => rs.findIndex(w => Z.abs(Z.sub(w, z)) < 1e-3) === i).length; } } },
          { q: "La suma de los residuos en esos puntos es $-i\\,S$, con $S$ real. ¿Cuánto vale $S$?", type: "numeric", answer: S,
            traps: [{ value: 2 * Math.PI * S, msg: "Ese ya es el valor de la integral. Se pide solo la suma de los residuos, sin el $2\\pi i$." }],
            // verificación: (1/2πi) ∮ f sobre una circunferencia grande apoyada casi sobre el eje real, que rodea solo los polos de arriba
            verify: { kind: "value", tol: 1e-6, fn: () => -Z.div(Z.circ(f, [0, 6], 5.9, 8000), I2)[1] } },
          { q: "¿Cuánto vale la integral?", type: "numeric", answer: 2 * Math.PI * S,
            verify: { kind: "value", tol: 1e-6, fn: () => realLine(fx) } }
        ],
        solution: [F.note, `Sobre la semicircunferencia, $|f(z)| \\le \\dfrac{C}{R^4}$ y la longitud es $\\pi R$: por la [[c3-contornos|cota ML]] esa parte tiende a $0$, y queda $\\int_{-\\infty}^{\\infty} f(x)\\,dx = 2\\pi i\\sum\\operatorname{Res}$ ([[c3-impropias-residuos|integrales impropias por residuos]]).`,
          `Calculando cada [[c3-residuo|residuo]] y sumando: $\\sum\\operatorname{Res} \\approx ${Z.tex(sum, 5)}$, es decir, $S \\approx ${dn(S, 5)}$.`,
          `La integral vale $2\\pi i\\cdot(-iS) = 2\\pi S \\approx ${dn(2 * Math.PI * S, 5)}$. Tiene que dar un número real: si queda una parte imaginaria, hay un error de cuentas.`]
      };
    }
  };

  T["c3-fourier-num"] = {
    type: "numeric", concepts: ["c3-jordan"], difficulty: 3, testN: 40,
    generate(r) {
      const form = r.pick(["A", "B", "C", "D"]), k = r.int(1, 3), a = r.int(1, 3), b = a + r.int(1, 2), a2 = a * a, b2 = b * b, kx = H.kx(k, "x");
      if (k * a > 4) return null;
      const ea = Math.exp(-k * a), eb = Math.exp(-k * b);
      const D = {
        A: { tex: `\\dfrac{\\cos ${kx}}{x^{2} + ${a2}}`, f: x => Math.cos(k * x) / (x * x + a2), val: Math.PI * ea / a, sin: false, how: [`Se integra $\\dfrac{e^{${k === 1 ? "" : k}iz}}{z^2 + ${a2}}$. Arriba hay un polo simple en $${a === 1 ? "" : a}i$, con $\\operatorname{Res} = \\dfrac{e^{${k === 1 ? "" : k}i\\cdot ${a === 1 ? "" : a}i}}{${2 * a}i} = \\dfrac{e^{-${k * a}}}{${2 * a}i}$.`, `$2\\pi i\\cdot\\dfrac{e^{-${k * a}}}{${2 * a}i} = \\dfrac{\\pi e^{-${k * a}}}{${a}}$, que es real: es la integral del coseno (la del seno da $0$ por imparidad).`] },
        B: { tex: `\\dfrac{x\\sin ${kx}}{x^{2} + ${a2}}`, f: x => x * Math.sin(k * x) / (x * x + a2), val: Math.PI * ea, sin: true, how: [`Se integra $\\dfrac{z\\,e^{${k === 1 ? "" : k}iz}}{z^2 + ${a2}}$ (acá hace falta el lema de Jordan: el integrando decae solo como $\\frac1R$). $\\operatorname{Res}_{${a === 1 ? "" : a}i} = \\dfrac{${a === 1 ? "" : a}i\\,e^{-${k * a}}}{${2 * a}i} = \\dfrac{e^{-${k * a}}}{2}$.`, `$2\\pi i\\cdot\\dfrac{e^{-${k * a}}}{2} = \\pi i\\,e^{-${k * a}}$. La integral pedida es la **parte imaginaria**: $\\pi e^{-${k * a}}$.`] },
        C: { tex: `\\dfrac{\\cos ${kx}}{(x^{2} + ${a2})(x^{2} + ${b2})}`, f: x => Math.cos(k * x) / ((x * x + a2) * (x * x + b2)), val: Math.PI / (b2 - a2) * (ea / a - eb / b), sin: false, how: [`Se integra $\\dfrac{e^{${k === 1 ? "" : k}iz}}{(z^2 + ${a2})(z^2 + ${b2})}$. Residuos arriba: $\\dfrac{e^{-${k * a}}}{${2 * a}i\\,(${b2 - a2})}$ en $${a === 1 ? "" : a}i$ y $\\dfrac{e^{-${k * b}}}{${2 * b}i\\,(${a2 - b2})}$ en $${b}i$.`, `$2\\pi i$ por la suma: $\\dfrac{\\pi}{${b2 - a2}}\\left(\\dfrac{e^{-${k * a}}}{${a}} - \\dfrac{e^{-${k * b}}}{${b}}\\right)$.`] },
        D: { tex: `\\dfrac{\\cos ${kx}}{x^{2} + ${a2}}`, f: x => Math.cos(k * x) / (x * x + a2), val: Math.PI * ea / (2 * a), sin: false, half: true, how: [`Sobre toda la recta, integrando $\\dfrac{e^{${k === 1 ? "" : k}iz}}{z^2 + ${a2}}$: $2\\pi i\\cdot\\dfrac{e^{-${k * a}}}{${2 * a}i} = \\dfrac{\\pi e^{-${k * a}}}{${a}}$.`, `El integrando es par: de $0$ a $\\infty$ es la mitad.`] }
      }[form];
      return {
        prompt: `Calculá $\\displaystyle\\int_{${D.half ? "0" : "-\\infty"}}^{\\infty} ${D.tex}\\,dx$.`,
        answer: D.val,
        traps: [{ value: D.val * Math.exp(2 * k * a), msg: "Revisá el signo del exponente: en el semiplano superior, $e^{ikz}$ evaluado en $z = ai$ da $e^{-ka}$, que es chico." }].filter(t => far(t.value, D.val)),
        solution: [`Con senos o cosenos en el numerador se integra $f(z)\\,e^{ikz}$ (no $\\cos kz$, que crece en el semiplano superior) y al final se toma la parte real o la imaginaria ([[c3-jordan|integrales de Fourier y lema de Jordan]]).`, ...D.how, `Resultado: $\\approx ${dn(D.val, 5)}$.`],
        // verificación: Simpson sobre [0, X] (por dos, o no, según el caso), con X elegido para que el primer término de la cola se anule
        verify: { kind: "value", tol: 1e-3, fn: () => { const M = 200, X = (2 * Math.PI * M + (D.sin ? Math.PI / 2 : 0)) / k; return (D.half ? 1 : 2) * simpson(D.f, 0, X, M * 80); } }
      };
    }
  };

  const APP = [
    { t: R`para calcular $\int_{-\infty}^{\infty}\frac{p(x)}{q(x)}\,dx$ cerrando con una semicircunferencia, alcanza con que el grado de $q$ supere al de $p$ en $1$`, v: false, why: R`Hace falta que lo supere en $2$ o más: con diferencia $1$, el integrando decae como $\frac1R$ y la integral sobre el arco (de longitud $\pi R$) no tiende a cero. De hecho $\int_{-\infty}^{\infty}\frac{x}{x^2 + 1}dx$ ni siquiera converge.`,
      test: () => { const g = X => simpson(x => x / (x * x + 1), 0, X, 20000); return Math.abs(g(1e4) - g(1e2)) < 0.1; } },
    { t: R`$|e^{iz}| \le 1$ en todo el semiplano superior $\operatorname{Im} z \ge 0$`, v: true, why: R`$|e^{iz}| = |e^{ix}e^{-y}| = e^{-y} \le 1$ si $y \ge 0$. Por eso con $e^{ikz}$ ($k > 0$) se cierra el contorno por arriba.`,
      test: () => { for (let x = -30; x <= 30; x += 1.7) for (let y = 0; y <= 30; y += 0.9) if (Z.abs(Z.exp(Z.mul([0, 1], [x, y]))) > 1 + 1e-12) return false; return true; } },
    { t: R`$|\cos z| \le 1$ en todo el semiplano superior`, v: false, why: R`$\cos z = \frac{e^{iz} + e^{-iz}}{2}$ y $|e^{-iz}| = e^{y}$ crece sin límite hacia arriba. Por eso en las integrales de Fourier se usa $e^{iz}$ y no $\cos z$.`,
      test: () => { for (let y = 0; y <= 30; y += 0.9) if (Z.abs(Z.cos([0.3, y])) > 1 + 1e-12) return false; return true; } },
    { t: R`$\displaystyle\int_{-\infty}^{\infty}\frac{\sin x}{x}\,dx = \pi$`, v: true, why: R`Se integra $\frac{e^{iz}}{z}$ esquivando el polo simple del origen con una semicircunferencia chica, que aporta $-\pi i\operatorname{Res} = -\pi i$. Queda $\text{v.p.}\int\frac{e^{ix}}{x}dx = \pi i$, y su parte imaginaria es $\pi$.`,
      test: () => Math.abs(2 * simpson(x => (x === 0 ? 1 : Math.sin(x) / x), 0, (2 * Math.PI * 400 + Math.PI / 2), 400 * 80) - Math.PI) < 1e-3 },
    { t: R`si $|g(z)| < |f(z)|$ sobre un contorno cerrado simple $C$ (con $f$ y $g$ analíticas dentro y sobre $C$), entonces $f$ y $f + g$ tienen la misma cantidad de ceros dentro de $C$`, v: true, why: R`Es el teorema de Rouché: una perturbación más chica que $f$ sobre el borde no puede sacar ni meter ceros.`,
      test: () => [[[1, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 0], [1, 0]], [[1, 0], [0, 0], [0, 0], [-7, 0], [0, 0], [2, 0]]].every(c => { const n = c.length - 1, dom = c.findIndex((x, i) => i > 0 && Math.abs(x[0]) >= 5); return Z.roots(c).filter(z => Z.abs(z) < 1).length === n - dom; }) },
    { t: R`si $f$ es analítica y sin ceros sobre $C$, $\frac{1}{2\pi i}\oint_C\frac{f'(z)}{f(z)}\,dz$ es la cantidad de ceros de $f$ dentro de $C$, contados con su multiplicidad`, v: true, why: R`Es el principio del argumento (sin polos): en un cero de orden $m$, $\frac{f'}{f}$ tiene un polo simple con residuo $m$.`,
      test: () => { const f = z => Z.mul(Z.ipow(Z.sub(z, [0.5, 0]), 3), Z.mul(Z.add(z, [0, 0.4]), Z.sub(z, [4, 0]))); return Math.abs(Z.div(Z.circ(z => Z.div(Z.dz(f, z), f(z)), [0, 0], 2, 4000), I2)[0] - 4) < 1e-4; } },
    { t: R`el valor principal de $\displaystyle\int_{-1}^{1}\frac{dx}{x}$ es $0$, aunque la integral impropia no converge`, v: true, why: R`Sacando un intervalo **simétrico** $(-\varepsilon, \varepsilon)$, las dos mitades se cancelan por imparidad. Por separado, cada una diverge como $\ln\varepsilon$.`,
      test: () => [1e-2, 1e-4].every(e => Math.abs(simpson(x => 1 / x, -1, -e, 20000) + simpson(x => 1 / x, e, 1, 20000)) < 1e-6) && Math.abs(simpson(x => 1 / x, 1e-4, 1, 200000)) > 5 },
    { t: R`para calcular $\int_0^{2\pi}F(\cos\theta, \sin\theta)\,d\theta$ con $z = e^{i\theta}$ se suman los residuos de todos los polos del integrando en $z$`, v: false, why: R`Solo los que quedan **dentro** de la circunferencia unidad. En $\int_0^{2\pi}\frac{d\theta}{5 + 3\cos\theta}$ los polos son $z = -\frac13$ (adentro) y $z = -3$ (afuera): con los dos, daría $0$.`,
      test: () => { const g = z => Z.div([0, -2], Z.add(Z.add(Z.sc(3, Z.mul(z, z)), Z.sc(10, z)), [3, 0])), all = Z.circ(g, [0, 0], 10), real = simpson(t => 1 / (5 + 3 * Math.cos(t)), 0, 2 * Math.PI, 2000); return Z.abs(Z.sub(all, [real, 0])) < 1e-6; } }
  ];
  T["c3-aplicaciones-vf"] = {
    type: "tf", concepts: ["c3-impropias-res", "c3-jordan", "c3-argumento"], difficulty: 2,
    generate(r) {
      const S = r.pick(APP);
      return {
        prompt: `<b>Verdadero o falso:</b> ${S.t}.`,
        answer: S.v,
        explanation: `${S.v ? "Verdadero" : "Falso"}. ${S.why}`,
        solution: [`Ver [[c3-impropias-residuos|integrales impropias por residuos]], [[c3-jordan|lema de Jordan]] y [[c3-argumento|principio del argumento]].`],
        // verificación: un experimento numérico por afirmación (cuadraturas reales, raíces de polinomios, integrales de contorno)
        verify: { kind: "truth", fn: S.test }
      };
    }
  };

  T["c3-trig-integral-num"] = {
    type: "numeric", concepts: ["c3-trig-res"], difficulty: 2,
    generate(r) {
      const [a, b] = r.pick([[5, 3], [5, 4], [13, 5], [13, 12], [2, 1], [3, 1], [3, 2], [5, -3], [5, -4], [2, -1], [10, 6], [10, 8]]), form = r.pick(["A", "A", "B", "C", "D"]), s = Math.sqrt(a * a - b * b), B = Math.abs(b);
      const sT = Number.isInteger(s) ? String(s) : `\\sqrt{${a * a - b * b}}`, den = t => `${a} ${b < 0 ? "-" : "+"} ${B === 1 ? "" : B}\\${t}\\theta`;
      const D = {
        A: { tex: `\\dfrac{d\\theta}{${den("cos")}}`, f: t => 1 / (a + b * Math.cos(t)), val: 2 * Math.PI / s, vT: `\\dfrac{2\\pi}{${sT}}` },
        B: { tex: `\\dfrac{d\\theta}{${den("sin")}}`, f: t => 1 / (a + b * Math.sin(t)), val: 2 * Math.PI / s, vT: `\\dfrac{2\\pi}{${sT}}` },
        C: { tex: `\\dfrac{d\\theta}{(${den("cos")})^{2}}`, f: t => 1 / (a + b * Math.cos(t)) ** 2, val: 2 * Math.PI * a / s ** 3, vT: `\\dfrac{2\\pi\\cdot ${a}}{${Number.isInteger(s) ? `${s}^3` : `(${sT})^3`}}` },
        D: { tex: `\\dfrac{\\cos\\theta\\,d\\theta}{${den("cos")}}`, f: t => Math.cos(t) / (a + b * Math.cos(t)), val: 2 * Math.PI / b * (1 - a / s), vT: `\\dfrac{2\\pi}{${b}}\\left(1 - \\dfrac{${a}}{${sT}}\\right)` }
      }[form];
      const zin = (-a + s) / b;
      return {
        prompt: `Calculá $\\displaystyle\\int_0^{2\\pi} ${D.tex}$.`,
        answer: D.val,
        solution: [`Con $z = e^{i\\theta}$: $\\cos\\theta = \\dfrac{z + z^{-1}}{2}$, $\\sin\\theta = \\dfrac{z - z^{-1}}{2i}$ y $d\\theta = \\dfrac{dz}{iz}$. La integral pasa a ser una integral sobre $|z| = 1$ de una función racional ([[c3-trig-residuos|integrales trigonométricas]]).`,
          form === "B" ? `El denominador queda proporcional a $${B === 1 ? "" : B}z^2 ${b < 0 ? "-" : "+"} ${2 * a}i\\,z - ${B}$, con raíces imaginarias puras; dentro de la circunferencia queda solo una, la de módulo $\\frac{${a} - ${sT}}{${B}}$.`
            : `El denominador queda proporcional a $${B === 1 ? "" : B}z^2 ${b < 0 ? "-" : "+"} ${2 * a}z ${b < 0 ? "-" : "+"} ${B}$, con raíces $z = \\dfrac{-${a} \\pm ${sT}}{${b}}$. Su producto es $1$, así que una sola queda adentro: $z \\approx ${dn(zin, 4)}$.`,
          `Aplicando el teorema de los residuos${form === "C" ? " (acá el polo de adentro es doble)" : form === "D" ? " (también hay un polo simple en $z = 0$)" : ""}: $${D.vT} \\approx ${dn(D.val, 5)}$.`],
        // verificación: Simpson directo sobre [0, 2π]
        verify: { kind: "integral", f: D.f, a: 0, b: 2 * Math.PI, tol: 1e-7 }
      };
    }
  };

  T["c3-suma-serie-num"] = {
    type: "numeric", concepts: ["c3-sumas"], difficulty: 3, testN: 30,
    generate(r) {
      const form = r.pick(["A", "A", "B", "B", "C", "C", "D"]), [a, a2T] = r.pick([[1, "1"], [2, "4"], [3, "9"], [0.5, "\\frac{1}{4}"]]), a2 = a * a, pa = Math.PI * a, coth = 1 / Math.tanh(pa), aT = a === 0.5 ? "\\frac12" : String(a);
      const pw = r.pick([2, 4]);
      const D = {
        A: { tex: `\\displaystyle\\sum_{n=-\\infty}^{\\infty}\\frac{1}{n^{2} + ${a2T}}`, val: Math.PI * coth / a, term: n => 2 / (n * n + a2) + (n === 1 ? 1 / a2 : 0), vT: `\\dfrac{\\pi}{a}\\coth(\\pi a)`, how: `Los polos de $f(z) = \\frac{1}{z^2 + a^2}$ son $\\pm ai$. En cada uno, el residuo de $\\pi\\cot(\\pi z)f(z)$ es $\\dfrac{\\pi\\cot(\\pm\\pi ai)}{\\pm 2ai} = -\\dfrac{\\pi\\coth(\\pi a)}{2a}$ (porque $\\cot(iy) = -i\\coth y$).` },
        B: { tex: `\\displaystyle\\sum_{n=1}^{\\infty}\\frac{1}{n^{2} + ${a2T}}`, val: (pa * coth - 1) / (2 * a2), term: n => 1 / (n * n + a2), vT: `\\dfrac{\\pi a\\coth(\\pi a) - 1}{2a^2}`, how: `La suma sobre todos los enteros es $\\frac{\\pi}{a}\\coth(\\pi a)$. Los términos con $n$ y $-n$ son iguales, y el de $n = 0$ vale $\\frac{1}{a^2}$: $\\sum_{n\\ge1} = \\frac12\\left[\\frac{\\pi}{a}\\coth(\\pi a) - \\frac{1}{a^2}\\right]$.` },
        C: { tex: `\\displaystyle\\sum_{n=-\\infty}^{\\infty}\\frac{(-1)^n}{n^{2} + ${a2T}}`, val: Math.PI / (a * Math.sinh(pa)), term: n => 2 * (-1) ** n / (n * n + a2) + (n === 1 ? 1 / a2 : 0), vT: `\\dfrac{\\pi}{a\\sinh(\\pi a)}`, how: `Para series alternadas se usa $\\dfrac{\\pi}{\\sin(\\pi z)}$, cuyo residuo en cada entero $n$ es $(-1)^n$. En $\\pm ai$, el residuo de $\\frac{\\pi}{\\sin(\\pi z)}\\cdot\\frac{1}{z^2 + a^2}$ es $-\\dfrac{\\pi}{2a\\sinh(\\pi a)}$.` },
        D: { tex: `\\displaystyle\\sum_{n=1}^{\\infty}\\frac{1}{n^{${pw}}}`, val: pw === 2 ? Math.PI ** 2 / 6 : Math.PI ** 4 / 90, term: n => 1 / n ** pw, vT: pw === 2 ? `\\dfrac{\\pi^2}{6}` : `\\dfrac{\\pi^4}{90}`, how: `$f(z) = \\frac{1}{z^{${pw}}}$ tiene su único polo en $0$, que hay que tratar aparte. Con $\\pi\\cot(\\pi z) = \\frac1z - \\frac{\\pi^2z}{3} - \\frac{\\pi^4z^3}{45} - \\dots$, el residuo de $\\frac{\\pi\\cot(\\pi z)}{z^{${pw}}}$ en $0$ es $${pw === 2 ? "-\\frac{\\pi^2}{3}" : "-\\frac{\\pi^4}{45}"}$. La suma sobre $n \\ne 0$ es su opuesto, y la mitad corresponde a $n \\ge 1$.` }
      }[form];
      return {
        prompt: `Calculá $${D.tex}$${form === "D" ? "" : ` (es decir, con $a = ${aT}$ en $n^2 + a^2$)`}.`,
        answer: D.val,
        solution: [`[[c3-sumas-series|Suma de series por residuos]]: si $f$ decae al menos como $\\frac{1}{|z|^2}$, $\\displaystyle\\sum_{n=-\\infty}^{\\infty} f(n) = -\\sum\\operatorname{Res}\\big[\\pi\\cot(\\pi z)\\,f(z)\\big]$, sumando sobre los polos de $f$.`, D.how,
          `Resultado: $${D.vT}$${form === "D" ? "" : ` con $a = ${aT}$`}, o sea $\\approx ${dn(D.val, 5)}$.`],
        // verificación: suma parcial directa de 200.000 términos
        verify: { kind: "sum", from: 1, inf: true, N: 2e5, term: D.term, tol: 1e-4 }
      };
    }
  };

  T["c3-rouche-num"] = {
    type: "numeric", concepts: ["c3-argumento"], difficulty: 3,
    generate(r) {
      const n = r.int(4, 7), m = r.int(1, 3), mode = r.pick(["a", "a", "b", "R2", "ring"]);
      let a, b;
      if (mode === "b") { a = r.nz(-2, 2); b = r.sign() * (Math.abs(a) + r.int(2, 4)); } else { b = r.nz(-2, 2); a = r.sign() * (Math.abs(b) + r.int(2, 5)); }
      const big2 = 2 ** n > Math.abs(a) * 2 ** m + Math.abs(b);
      if ((mode === "R2" || mode === "ring") && !big2) return null;
      const pT = H.poly([[1, `z^{${n}}`], [a, m === 1 ? "z" : `z^{${m}}`], [b, ""]]), aT = `${H.cf(a)}z${m === 1 ? "" : `^{${m}}`}`;
      const [reg, ans, test] = { a: ["el disco $|z| < 1$", m, z => Z.abs(z) < 1], b: ["el disco $|z| < 1$", 0, z => Z.abs(z) < 1], R2: ["el disco $|z| < 2$", n, z => Z.abs(z) < 2], ring: ["el anillo $1 < |z| < 2$", n - m, z => Z.abs(z) > 1 && Z.abs(z) < 2] }[mode];
      const s1 = mode === "b" ? `Sobre $|z| = 1$ domina el término constante: $|${b}| = ${Math.abs(b)} > 1 + ${Math.abs(a)} \\ge |z^{${n}} ${a < 0 ? "-" : "+"} ${H.cf(Math.abs(a))}z${m === 1 ? "" : `^{${m}}`}|$. Una constante no nula no tiene ceros: $p$ tampoco tiene ninguno en $|z| < 1$.`
        : `Sobre $|z| = 1$ domina $${aT}$: $|${aT}| = ${Math.abs(a)} > 1 + ${Math.abs(b)} \\ge |z^{${n}} ${b < 0 ? "-" : "+"} ${Math.abs(b)}|$. Como $${aT}$ tiene $${m}$ cero${m === 1 ? "" : "s"} en $|z| < 1$ (el origen, con multiplicidad $${m}$), $p$ también.`;
      const s2 = `Sobre $|z| = 2$ domina $z^{${n}}$: $2^{${n}} = ${2 ** n} > ${Math.abs(a)}\\cdot ${2 ** m} + ${Math.abs(b)} = ${Math.abs(a) * 2 ** m + Math.abs(b)}$. Entonces $p$ tiene $${n}$ ceros en $|z| < 2$, todos.`;
      const c = Array.from({ length: n + 1 }, () => [0, 0]); c[0] = [1, 0]; c[n - m] = [a, 0]; c[n] = [b, 0];
      return {
        prompt: `¿Cuántos ceros, contados con su multiplicidad, tiene $p(z) = ${pT}$ en ${reg}?`,
        answer: ans,
        traps: mode === "ring" ? [{ value: n, msg: "Esos son los que hay en todo el disco $|z| < 2$. Falta restar los que están en $|z| < 1$." }] : [],
        solution: [`[[c3-argumento|Teorema de Rouché]]: si $|g| < |f|$ sobre $C$, entonces $f$ y $f + g$ tienen la misma cantidad de ceros dentro de $C$. Se elige como $f$ el término que domina sobre el borde.`,
          ...(mode === "R2" ? [s2] : mode === "ring" ? [s1, s2, `En el anillo quedan $${n} - ${m} = ${n - m}$ (sobre $|z| = 1$ no hay ceros, porque ahí $|p| > 0$).`] : [s1])],
        // verificación: se buscan todas las raíces del polinomio (Durand-Kerner) y se cuentan las de la región
        verify: { kind: "value", fn: () => Z.roots(c).filter(test).length }
      };
    }
  };

  T["c3-arg-principio-num"] = {
    type: "numeric", concepts: ["c3-argumento"], difficulty: 2, testN: 120,
    generate(r) {
      const Rr = r.pick([2, 3]), pts = r.distinct(3, -5, 5, { exclude: [Rr, -Rr] }), m1 = r.int(1, 3), m2 = r.int(1, 2), n1 = r.int(1, 3);
      const [z1, z2, p1] = pts, ins = x => Math.abs(x) < Rr, K = (ins(z1) ? m1 : 0) + (ins(z2) ? m2 : 0) - (ins(p1) ? n1 : 0);
      const pw = (a, e) => (e === 1 ? `(${zm(a)})` : `(${zm(a)})^{${e}}`).replace("(z)", "z");
      const f = z => Z.div(Z.mul(Z.ipow(Z.sub(z, [z1, 0]), m1), Z.ipow(Z.sub(z, [z2, 0]), m2)), Z.ipow(Z.sub(z, [p1, 0]), n1));
      const lst = [[z1, m1, "cero"], [z2, m2, "cero"], [p1, n1, "polo"]].map(([x, e, t]) => `${t} de orden $${e}$ en $z = ${x}$ (${ins(x) ? "adentro" : "afuera"})`).join("; ");
      return {
        prompt: `Sea $f(z) = \\dfrac{${pw(z1, m1)}${pw(z2, m2)}}{${pw(p1, n1)}}$. ¿Cuánto vale $\\dfrac{1}{2\\pi i}\\displaystyle\\oint_{|z| = ${Rr}}\\frac{f'(z)}{f(z)}\\,dz$?`,
        answer: K,
        traps: [{ value: (ins(z1) ? 1 : 0) + (ins(z2) ? 1 : 0) - (ins(p1) ? 1 : 0), msg: "Los ceros y los polos se cuentan con su **orden**: un cero doble vale 2." },
          { value: (ins(z1) ? m1 : 0) + (ins(z2) ? m2 : 0) + (ins(p1) ? n1 : 0), msg: "Los polos **restan**: la integral da $Z - P$." }].filter((t, i, arr) => far(t.value, K) && arr.findIndex(u => u.value === t.value) === i),
        solution: [`[[c3-argumento|Principio del argumento]]: $\\dfrac{1}{2\\pi i}\\oint_C\\dfrac{f'}{f}\\,dz = Z - P$, la cantidad de ceros menos la de polos dentro de $C$, contados con su orden.`,
          `Acá: ${lst}.`, `$Z - P = ${K}$.`],
        // verificación: la integral de f'/f sobre la circunferencia, con f' calculada numéricamente
        verify: { kind: "value", tol: 1e-5, fn: () => Z.div(Z.circ(z => Z.div(Z.dz(f, z), f(z)), [0, 0], Rr, 6000), I2)[0] }
      };
    }
  };

  const cards = {
    "c3-impropias-residuos": {
      title: "Integrales impropias de funciones racionales por residuos", aliases: ["integrales impropias por residuos", "integral por residuos", "cierre del contorno"], concepts: ["c3-impropias-res"],
      summary: "Si p/q es racional, sin polos reales y con grado q ≥ grado p + 2: ∫ de −∞ a ∞ de p/q = 2πi Σ Res en los polos del semiplano superior. Si el integrando es par, de 0 a ∞ es la mitad.",
      def: [R`Sea $f(x) = \dfrac{p(x)}{q(x)}$ racional, con $q$ sin raíces reales y $\operatorname{gr} q \ge \operatorname{gr} p + 2$. Entonces $$\int_{-\infty}^{\infty} f(x)\,dx = 2\pi i\sum_{\operatorname{Im} z_k > 0}\operatorname*{Res}_{z = z_k} f(z).$$`,
        R`Si $f$ es par, $\displaystyle\int_0^\infty f(x)\,dx = \frac12\int_{-\infty}^{\infty} f(x)\,dx$.`,
        R`**Valor principal.** $\text{v.p.}\displaystyle\int_{-\infty}^{\infty} f = \lim_{R\to\infty}\int_{-R}^{R} f$. Coincide con la [[impropias|integral impropia]] cuando esta converge, pero puede existir aunque no converja (por ejemplo, para funciones impares). El método de los residuos calcula siempre el valor principal.`],
      idea: [R`La integral sobre el eje real es difícil; la integral sobre una curva **cerrada** es fácil (residuos). Entonces se cierra el camino con una semicircunferencia grande y se muestra que ese agregado no aporta nada.`,
        R`También se puede cerrar por abajo: da lo mismo, con $-2\pi i\sum\operatorname{Res}$ en los polos del semiplano inferior (el sentido de recorrido queda horario).`,
        R`Control rápido: el resultado tiene que ser **real** (y positivo, si el integrando lo es). Los residuos son complejos, pero sus partes imaginarias sobrantes se cancelan.`],
      demo: [R`**Paso 1 (el contorno).** Sea $C_R$ la semicircunferencia superior $z = Re^{it}$, $0 \le t \le \pi$, con $R$ mayor que el módulo de todos los polos. El segmento $[-R, R]$ seguido de $C_R$ es un contorno cerrado simple positivo que encierra todos los polos del semiplano superior.`,
        R`**Paso 2 (residuos).** Por el [[c3-residuo|teorema de los residuos]]: $\int_{-R}^{R} f(x)\,dx + \int_{C_R} f(z)\,dz = 2\pi i\sum\operatorname{Res}$.`,
        R`**Paso 3 (el arco no aporta).** Como $\operatorname{gr} q \ge \operatorname{gr} p + 2$, para $|z| = R$ grande vale $|f(z)| \le \frac{K}{R^2}$. Por la [[c3-contornos|cota ML]], $\left|\int_{C_R} f\,dz\right| \le \frac{K}{R^2}\cdot\pi R = \frac{K\pi}{R} \to 0$.`,
        R`**Paso 4 (límite).** Haciendo $R \to \infty$ en el paso 2 queda la fórmula. La integral impropia converge (el integrando decae como $\frac{1}{x^2}$), así que coincide con su valor principal. $\blacksquare$`],
      examples: [{ q: R`$\displaystyle\int_{-\infty}^{\infty}\frac{dx}{x^2 + 1}$.`, steps: [R`Polo simple en $i$ (arriba): $\operatorname{Res} = \frac{1}{2i}$.`, R`$2\pi i\cdot\frac{1}{2i} = \pi$. (Coincide con $\arctan x\big|_{-\infty}^{\infty}$.)`] },
        { q: R`$\displaystyle\int_0^{\infty}\frac{dx}{(x^2 + 1)^2}$.`, steps: [R`Polo doble en $i$: $\operatorname{Res} = \frac{d}{dz}(z + i)^{-2}\big|_{i} = \frac{-2}{(2i)^3} = \frac{1}{4i}$.`, R`Sobre toda la recta: $2\pi i\cdot\frac{1}{4i} = \frac\pi2$. Por paridad, de $0$ a $\infty$: $\frac\pi4$.`] }],
      tips: [R`Solo los polos de **arriba**. Sumar los cuatro de $\frac{1}{x^4 + 1}$ da cero.`, R`Si la diferencia de grados es 1, este método no alcanza: ver el [[c3-jordan|lema de Jordan]].`],
      see: ["impropias", "c3-residuo", "c3-contornos", "c3-jordan"]
    },
    "c3-jordan": {
      title: "Integrales de Fourier, lema de Jordan y polos sobre el eje real", aliases: ["lema de Jordan", "integrales de Fourier por residuos", "desigualdad de Jordan", "contorno con indentación"], concepts: ["c3-jordan"],
      summary: "Para ∫ f(x) cos(kx) o sen(kx) dx (k > 0) se integra f(z)e^(ikz) cerrando por arriba y se toma la parte real o imaginaria. Lema de Jordan: alcanza con que f → 0. Un polo simple sobre el eje real, esquivado por arriba, aporta πi·Res.",
      def: [R`Para $k > 0$ y $f$ racional sin polos reales: $$\int_{-\infty}^{\infty} f(x)\,e^{ikx}\,dx = 2\pi i\sum_{\operatorname{Im} z_j > 0}\operatorname{Res}\big[f(z)\,e^{ikz}\big].$$ Las integrales con $\cos kx$ y $\sin kx$ son su parte real y su parte imaginaria (si $f$ es real sobre el eje).`,
        R`**Lema de Jordan.** Si $|f(z)| \le M_R$ sobre la semicircunferencia superior $C_R$, con $M_R \to 0$ cuando $R \to \infty$, y $k > 0$, entonces $\displaystyle\int_{C_R} f(z)\,e^{ikz}\,dz \to 0$. Alcanza con $\operatorname{gr} q \ge \operatorname{gr} p + 1$.`,
        R`**Polos sobre el eje real.** Si $f(z)e^{ikz}$ tiene un polo **simple** en $x_0$ real, se lo esquiva con una semicircunferencia chica por arriba. En el límite, ese polo aporta **la mitad**: $$\text{v.p.}\int_{-\infty}^{\infty} f(x)\,e^{ikx}\,dx = 2\pi i\sum_{\text{arriba}}\operatorname{Res} + \pi i\sum_{\text{eje}}\operatorname{Res}.$$`],
      idea: [R`Por qué $e^{ikz}$ y no $\cos kz$: en el semiplano superior $|e^{ikz}| = e^{-ky} \le 1$, pero $\cos kz$ contiene $e^{-ikz}$, que crece como $e^{ky}$. El coseno arruina el arco; la exponencial lo ayuda.`,
        R`Si $k < 0$, la exponencial decae hacia **abajo**: se cierra por el semiplano inferior.`,
        R`Un polo simple sobre el camino queda «cortado al medio»: medio giro a su alrededor aporta medio residuo. Así sale la integral de Dirichlet, $\int_{-\infty}^{\infty}\frac{\sin x}{x}dx = \pi$.`],
      demo: [R`**Paso 1 (parametrizar el arco).** Con $z = Re^{it}$: $|e^{ikz}| = e^{-kR\sin t}$ y $|dz| = R\,dt$. Entonces $\left|\int_{C_R} f\,e^{ikz}dz\right| \le M_RR\int_0^\pi e^{-kR\sin t}\,dt = 2M_RR\int_0^{\pi/2} e^{-kR\sin t}\,dt$, por la simetría de $\sin t$ respecto de $\frac\pi2$.`,
        R`**Paso 2 (desigualdad de Jordan).** En $[0, \frac\pi2]$ el seno es cóncavo, así que su gráfico queda por arriba de la cuerda: $\sin t \ge \frac{2t}{\pi}$. Entonces $e^{-kR\sin t} \le e^{-2kRt/\pi}$.`,
        R`**Paso 3 (integrar).** $\int_0^{\pi/2} e^{-2kRt/\pi}\,dt = \frac{\pi}{2kR}\left(1 - e^{-kR}\right) < \frac{\pi}{2kR}$. Queda $\left|\int_{C_R}\right| < 2M_RR\cdot\frac{\pi}{2kR} = \frac{\pi M_R}{k} \to 0$. El factor $R$ de la longitud se canceló: por eso alcanza con que $M_R \to 0$.`,
        R`**Paso 4 (medio residuo).** Cerca de un polo simple, $g(z) = \frac{B}{z - x_0} + h(z)$ con $h$ analítica. Sobre $z = x_0 + \rho e^{it}$, recorrida de $t = \pi$ a $t = 0$ (por arriba, en sentido horario): $\int\frac{B}{z - x_0}dz = B\int_\pi^0 i\,dt = -\pi iB$, y la parte de $h$ tiende a $0$ con $\rho$ (cota ML). Pasando ese $-\pi i B$ al otro lado de la igualdad queda el $+\pi i\operatorname{Res}$. $\blacksquare$`],
      examples: [{ q: R`$\displaystyle\int_{-\infty}^{\infty}\frac{\cos x}{x^2 + 1}\,dx$.`, steps: [R`Se integra $\frac{e^{iz}}{z^2 + 1}$: $\operatorname{Res}_{z = i} = \frac{e^{-1}}{2i}$.`, R`$2\pi i\cdot\frac{e^{-1}}{2i} = \frac\pi e$, real: es la integral pedida.`] },
        { q: R`$\displaystyle\int_{-\infty}^{\infty}\frac{\sin x}{x}\,dx$.`, steps: [R`$\frac{e^{iz}}{z}$ tiene un polo simple en $0$, sobre el eje, con residuo $1$, y ninguno arriba.`, R`$\text{v.p.}\int\frac{e^{ix}}{x}dx = \pi i$. Su parte imaginaria: $\pi$.`] }],
      tips: [R`Tomá la parte real o imaginaria **al final**, no antes de calcular los residuos.`],
      see: ["c3-impropias-residuos", "c3-residuo", "c3-trig", "c2-fourier"]
    },
    "c3-trig-residuos": {
      title: "Integrales trigonométricas entre 0 y 2π", aliases: ["integrales trigonométricas por residuos", "sustitución z = e^(iθ)"], concepts: ["c3-trig-res"],
      summary: "Con z = e^(iθ): cos θ = (z + 1/z)/2, sen θ = (z − 1/z)/2i, dθ = dz/(iz). La integral de 0 a 2π pasa a ser una integral sobre |z| = 1 de una función racional: 2πi por los residuos de adentro.",
      def: [R`Para $\displaystyle\int_0^{2\pi} F(\cos\theta, \sin\theta)\,d\theta$, con $F$ racional, se sustituye $z = e^{i\theta}$: $$\cos\theta = \frac{z + z^{-1}}{2},\qquad \sin\theta = \frac{z - z^{-1}}{2i},\qquad d\theta = \frac{dz}{iz}.$$ Cuando $\theta$ va de $0$ a $2\pi$, $z$ recorre la circunferencia $|z| = 1$ en sentido positivo, y la integral vale $2\pi i$ por la suma de los residuos **dentro** del círculo unidad.`,
        R`Resultado típico, para $a > |b|$: $$\int_0^{2\pi}\frac{d\theta}{a + b\cos\theta} = \int_0^{2\pi}\frac{d\theta}{a + b\sin\theta} = \frac{2\pi}{\sqrt{a^2 - b^2}}.$$`],
      idea: [R`Es recorrer el camino al revés: en lugar de parametrizar una integral de contorno, se reconoce que una integral en $\theta$ **ya es** una integral de contorno parametrizada.`,
        R`El denominador suele quedar cuadrático en $z$, con dos raíces de producto 1: una adentro y una afuera del círculo. Solo cuenta la de adentro.`],
      demo: [R`**Paso 1 (sustituir).** $\int_0^{2\pi}\frac{d\theta}{a + b\cos\theta} = \oint_{|z|=1}\frac{1}{a + \frac b2(z + z^{-1})}\cdot\frac{dz}{iz} = \oint_{|z|=1}\frac{2}{i\,(bz^2 + 2az + b)}\,dz$, multiplicando numerador y denominador por $2z$.`,
        R`**Paso 2 (polos).** $bz^2 + 2az + b = 0$ da $z_\pm = \frac{-a \pm\sqrt{a^2 - b^2}}{b}$, reales y distintos porque $a > |b|$. Su producto es $\frac bb = 1$, así que exactamente uno tiene módulo menor que 1: $z_+$.`,
        R`**Paso 3 (residuo).** Con $\frac{p}{q'}$: $\operatorname{Res}_{z_+} = \frac{2}{i\,(2bz_+ + 2a)} = \frac{2}{i\cdot2\sqrt{a^2 - b^2}} = \frac{1}{i\sqrt{a^2 - b^2}}$.`,
        R`**Paso 4 (resultado).** $2\pi i\cdot\frac{1}{i\sqrt{a^2 - b^2}} = \frac{2\pi}{\sqrt{a^2 - b^2}}$. Con el seno la cuenta es análoga (o se corre $\theta$ en $\frac\pi2$, lo que no cambia una integral sobre un período completo). $\blacksquare$`],
      examples: [{ q: R`$\displaystyle\int_0^{2\pi}\frac{d\theta}{5 + 4\cos\theta}$.`, steps: [R`Queda $\oint\frac{dz}{i(2z^2 + 5z + 2)}$, con polos en $-\frac12$ (adentro) y $-2$ (afuera).`, R`$\operatorname{Res}_{-1/2} = \frac{1}{i(4z + 5)}\Big|_{-1/2} = \frac{1}{3i}$. Integral: $\frac{2\pi}{3}$.`] }],
      tips: [R`Si los límites son $0$ y $\pi$, usá la paridad del integrando para llevarlos a $0$ y $2\pi$ antes de sustituir.`],
      see: ["c3-residuo", "c3-contornos", "integrales-trig"]
    },
    "c3-sumas-series": {
      title: "Suma de series con residuos", aliases: ["suma de series por residuos", "sumas con cotangente", "problema de Basilea"], concepts: ["c3-sumas"],
      summary: "π cot(πz) tiene un polo simple con residuo 1 en cada entero. Si f decae como 1/|z|², Σ f(n) (sobre todos los enteros que no son polos de f) = −Σ Res[π cot(πz) f(z)] en los polos de f. Para series alternadas, π/sen(πz).",
      def: [R`Sea $f$ analítica salvo en un número finito de polos $z_1, \dots, z_m$ (ninguno entero), con $|f(z)| \le \frac{K}{|z|^2}$ para $|z|$ grande. Entonces $$\sum_{n=-\infty}^{\infty} f(n) = -\sum_{j=1}^m\operatorname*{Res}_{z = z_j}\big[\pi\cot(\pi z)\,f(z)\big],\qquad \sum_{n=-\infty}^{\infty}(-1)^nf(n) = -\sum_{j=1}^m\operatorname*{Res}_{z = z_j}\left[\frac{\pi}{\sin(\pi z)}\,f(z)\right].$$`,
        R`Si $f$ tiene un polo en un entero (típicamente $n = 0$), ese entero se saca de la suma y su residuo pasa al lado derecho con los demás.`],
      idea: [R`$\pi\cot(\pi z) = \frac{\pi\cos(\pi z)}{\sin(\pi z)}$ es una «máquina de enteros»: tiene un polo simple con residuo exactamente 1 en cada entero. Al multiplicarla por $f$, el residuo en $n$ es $f(n)$: la suma de la serie es una suma de residuos.`,
        R`Se integra sobre cuadrados cada vez más grandes, que pasan entre los enteros. Sobre ellos la cotangente está acotada y $f$ decae: la integral tiende a cero. Entonces **todos** los residuos suman cero, y los de los enteros (la serie) son el opuesto de los demás.`,
        R`Así se obtiene $\sum\frac{1}{n^2} = \frac{\pi^2}{6}$ (el problema de Basilea) y fórmulas como $\sum_{n=-\infty}^\infty\frac{1}{(n - z)^2} = \frac{\pi^2}{\sin^2(\pi z)}$.`],
      demo: [R`**Paso 1 (residuo en los enteros).** $\sin(\pi z)$ tiene ceros simples en los enteros, con derivada $\pi\cos(\pi n)$. Por la fórmula $\frac{p}{q'}$: $\operatorname{Res}_{z = n}\pi\cot(\pi z)f(z) = \frac{\pi\cos(\pi n)f(n)}{\pi\cos(\pi n)} = f(n)$.`,
        R`**Paso 2 (el contorno).** Sea $C_N$ el cuadrado de lados $x = \pm(N + \frac12)$, $y = \pm(N + \frac12)$. Por el [[c3-residuo|teorema de los residuos]]: $\oint_{C_N}\pi\cot(\pi z)f(z)\,dz = 2\pi i\left[\sum_{n=-N}^{N} f(n) + \sum_j\operatorname{Res}_{z_j}\right]$.`,
        R`**Paso 3 (la cotangente está acotada).** Sobre los lados verticales, $|\cot(\pi z)| = |\tanh(\pi y)| \le 1$. Sobre los horizontales, $|\cot(\pi z)| \le \coth\left(\pi(N + \tfrac12)\right) \le \coth\frac\pi2$. Hay una constante $M$ que sirve para todos los $N$.`,
        R`**Paso 4 (la integral tiende a cero).** Sobre $C_N$, $|f| \le \frac{K}{N^2}$ y la longitud es $8N + 4$. Por la cota ML, el módulo de la integral no supera $\pi M\frac{K}{N^2}(8N + 4) \to 0$. Tomando límite en el paso 2: $\sum f(n) + \sum_j\operatorname{Res} = 0$. $\blacksquare$`],
      examples: [{ q: R`$\displaystyle\sum_{n=1}^{\infty}\frac{1}{n^2}$.`, steps: [R`$f(z) = \frac{1}{z^2}$ tiene su polo en $0$. Como $\pi\cot(\pi z) = \frac1z - \frac{\pi^2z}{3} - \dots$, el residuo de $\frac{\pi\cot(\pi z)}{z^2}$ en $0$ es $-\frac{\pi^2}{3}$.`, R`$\sum_{n\ne0}\frac{1}{n^2} = \frac{\pi^2}{3}$, y por simetría $\sum_{n\ge1}\frac{1}{n^2} = \frac{\pi^2}{6}$.`] }],
      see: ["c3-residuo", "series", "c3-trig", "c3-impropias-residuos"]
    },
    "c3-argumento": {
      title: "Principio del argumento y teorema de Rouché", aliases: ["principio del argumento", "teorema de Rouché", "derivada logarítmica", "función meromorfa"], concepts: ["c3-argumento"],
      summary: "Si f es analítica dentro y sobre C salvo polos adentro, y no se anula sobre C: (1/2πi)∮ f'/f dz = Z − P (ceros menos polos, con su orden). Rouché: si |g| < |f| sobre C, f y f + g tienen la misma cantidad de ceros dentro de C.",
      def: [R`Una función es **meromorfa** en un dominio si es analítica salvo polos. Sea $f$ meromorfa dentro de un contorno cerrado simple positivo $C$, analítica y no nula sobre $C$. **Principio del argumento:** $$\frac{1}{2\pi i}\oint_C\frac{f'(z)}{f(z)}\,dz = Z - P,$$ donde $Z$ y $P$ son las cantidades de ceros y de polos de $f$ dentro de $C$, contados con su orden. Ese número es también la cantidad de vueltas que da $f(z)$ alrededor del origen cuando $z$ recorre $C$: $\frac{1}{2\pi}\Delta_C\arg f(z)$.`,
        R`**Teorema de Rouché.** Si $f$ y $g$ son analíticas dentro y sobre $C$ y $|g(z)| < |f(z)|$ en todos los puntos de $C$, entonces $f$ y $f + g$ tienen la misma cantidad de ceros dentro de $C$ (contados con su multiplicidad).`],
      idea: [R`$\frac{f'}{f}$ es la derivada de $\log f$. Al dar una vuelta por $C$, el módulo de $f$ vuelve a su valor, pero el **argumento** puede haber aumentado en varias vueltas: una por cada cero rodeado y una menos por cada polo.`,
        R`Rouché es «el paseo del perro»: si alguien da vueltas a un árbol llevando un perro con una correa más corta que su distancia al árbol, el perro da la misma cantidad de vueltas. $f(z)$ es la persona, $f(z) + g(z)$ el perro, y el árbol es el origen.`,
        R`Uso típico: para contar los ceros de un polinomio en un disco, se elige como $f$ el término que **domina** sobre el borde, cuyos ceros son obvios.`],
      demo: [R`**Paso 1 (cerca de un cero).** Si $f(z) = (z - z_0)^mg(z)$ con $g(z_0) \ne 0$ ([[c3-ceros-polos|cero de orden m]]), derivando el producto y dividiendo: $\frac{f'}{f} = \frac{m}{z - z_0} + \frac{g'}{g}$. El segundo término es analítico en $z_0$: $\frac{f'}{f}$ tiene un polo simple con residuo $m$.`,
        R`**Paso 2 (cerca de un polo).** Si $f(z) = \frac{g(z)}{(z - z_0)^n}$, la misma cuenta da $\frac{f'}{f} = \frac{-n}{z - z_0} + \frac{g'}{g}$: residuo $-n$.`,
        R`**Paso 3 (sumar).** $\frac{f'}{f}$ es analítica en el resto del interior de $C$. Por el [[c3-residuo|teorema de los residuos]], $\oint_C\frac{f'}{f}dz = 2\pi i\,(\sum m_j - \sum n_k) = 2\pi i\,(Z - P)$.`,
        R`**Paso 4 (Rouché).** Sobre $C$, $|f| > |g| \ge 0$, así que $f \ne 0$, y $|f + g| \ge |f| - |g| > 0$. Sea $F = \frac{f + g}{f} = 1 + \frac gf$. Sobre $C$, $|F - 1| < 1$: los valores de $F$ quedan en el disco de centro $1$ y radio $1$, que no contiene al origen, así que $F$ no puede dar ninguna vuelta alrededor de él: $\Delta_C\arg F = 0$.`,
        R`**Paso 5 (concluir).** Como $f + g = fF$, $\Delta_C\arg(f + g) = \Delta_C\arg f + \Delta_C\arg F = \Delta_C\arg f$. Ninguna de las dos tiene polos, así que por el paso 3 tienen la misma cantidad de ceros. $\blacksquare$`],
      examples: [{ q: R`¿Cuántos ceros tiene $z^7 - 4z^3 + z - 1$ en $|z| < 1$?`, steps: [R`Sobre $|z| = 1$: $|-4z^3| = 4 > 3 \ge |z^7 + z - 1|$.`, R`$-4z^3$ tiene 3 ceros en el disco (el origen, triple): el polinomio también tiene 3.`] }],
      tips: [R`La desigualdad de Rouché tiene que ser **estricta** y valer en **todo** el contorno.`],
      see: ["c3-residuo", "c3-ceros-polos", "c3-liouville", "c3-logaritmo"]
    }
  };

  E.extendCourse("m103", {
    concepts: { "c3-impropias-res": { name: "Integrales impropias por residuos" }, "c3-jordan": { name: "Integrales de Fourier y lema de Jordan" }, "c3-trig-res": { name: "Integrales trigonométricas" }, "c3-sumas": { name: "Suma de series" }, "c3-argumento": { name: "Principio del argumento y Rouché" } },
    templates: T,
    units: [{
      id: "c3-aplicaciones-u", order: 7, program: "Unidad 7", title: "Aplicaciones de los residuos", icon: "flame",
      diagnostic: ["c3-impropia-num", "c3-trig-integral-num", "c3-rouche-num"],
      lessons: [
        { id: "c3-impropias", title: "Integrales impropias", templates: ["c3-impropia-num", "c3-impropia-multi", "c3-fourier-num", "c3-aplicaciones-vf"], theory: ["c3-impropias-residuos", "c3-jordan"],
          intro: R`$\int_{-\infty}^{\infty} f(x)\,dx = 2\pi i\sum\operatorname{Res}$ en los polos del semiplano superior. Con senos y cosenos, se integra $f(z)e^{ikz}$.` },
        { id: "c3-trig-series", title: "Integrales trigonométricas y sumas de series", templates: ["c3-trig-integral-num", "c3-suma-serie-num"], theory: ["c3-trig-residuos", "c3-sumas-series"],
          intro: R`Con $z = e^{i\theta}$, una integral entre $0$ y $2\pi$ es una integral sobre $|z| = 1$. Para sumar series: $\pi\cot(\pi z)$.` },
        { id: "c3-argumento", title: "Principio del argumento y Rouché", templates: ["c3-arg-principio-num", "c3-rouche-num"], theory: ["c3-argumento"],
          intro: R`$\frac{1}{2\pi i}\oint\frac{f'}{f}\,dz = Z - P$. Si $|g| < |f|$ sobre $C$, $f$ y $f + g$ tienen los mismos ceros adentro.` }
      ]
    }],
    cards
  });
})();
