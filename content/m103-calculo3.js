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

  T["c3-algebra-multi"] = {
    type: "multi", concepts: ["c3-algebra"], difficulty: 1,
    generate(r) {
      const z = [r.nz(-5, 5), r.nz(-5, 5)], w = [r.nz(-4, 4), r.nz(-4, 4)], op = r.pick(["mul", "div"]);
      const n2 = w[0] * w[0] + w[1] * w[1], num = Z.mul(z, op === "mul" ? w : Z.conj(w));
      const res = op === "mul" ? num : [num[0] / n2, num[1] / n2];
      const tx = k => (op === "mul" ? String(num[k]) : H.frac(num[k], n2));
      // camino independiente: en forma polar los módulos se multiplican (o dividen) y los argumentos se suman (o restan)
      const pol = () => Z.polar(op === "mul" ? Z.abs(z) * Z.abs(w) : Z.abs(z) / Z.abs(w), Z.arg(z) + (op === "mul" ? 1 : -1) * Z.arg(w));
      const bad = op === "mul" ? z[0] * w[0] + z[1] * w[1] : num[0];
      return {
        prompt: `Sean $z = ${Z.tex(z)}$ y $w = ${Z.tex(w)}$. Calculá $${op === "mul" ? "z\\,w" : "\\dfrac{z}{w}"}$ y escribilo como $a + bi$.`,
        parts: [
          { q: "¿Cuánto vale la parte real $a$?", type: "numeric", answer: res[0], answerTex: tx(0),
            traps: [{ value: bad, msg: op === "mul" ? "Ojo con $i^2 = -1$: el producto de las partes imaginarias entra **restando** en la parte real." : "Falta dividir por $|w|^2 = w\\,\\bar w$, que es lo que queda en el denominador." }].filter(t => far(t.value, res[0])),
            verify: { kind: "value", fn: () => pol()[0] } },
          { q: "¿Y la parte imaginaria $b$?", type: "numeric", answer: res[1], answerTex: tx(1), verify: { kind: "value", fn: () => pol()[1] } }
        ],
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
      summary: "z = r(cos θ + i sen θ) = r e^{iθ}, con r = |z| y θ un argumento. Arg z es el argumento en (−π, π]. Al multiplicar se multiplican los módulos y se suman los argumentos; por eso zⁿ = rⁿ e^{inθ}.",
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
      summary: "Todo z₀ ≠ 0 tiene exactamente n raíces n-ésimas: w_k = ⁿ√r · e^{i(θ + 2kπ)/n}, k = 0, …, n − 1. Son los vértices de un polígono regular de n lados centrado en el origen.",
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
      diagnostic: ["c3-algebra-multi", "c3-moivre-num", "c3-raices-multi"],
      lessons: [
        { id: "c3-algebra", title: "Álgebra, conjugado y módulo", templates: ["c3-algebra-multi", "c3-lugar-mc"], theory: ["c3-complejos"],
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

  T["c3-deriv-multi"] = {
    type: "multi", concepts: ["c3-derivada"], difficulty: 2,
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
        prompt: `Sea $f(z) = ${tex}$. Calculá $f'(z_0)$ en $z_0 = ${Z.tex(z0)}$ y escribilo como $a + bi$.`,
        parts: [
          { q: "¿Cuánto vale la parte real de $f'(z_0)$?", type: "numeric", answer: res[0], answerTex: H.frac(num[0], den), verify: { kind: "value", tol: 1e-6, fn: () => nd()[0] } },
          { q: "¿Y la parte imaginaria?", type: "numeric", answer: res[1], answerTex: H.frac(num[1], den), verify: { kind: "value", tol: 1e-6, fn: () => nd()[1] } }
        ],
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
        { id: "c3-derivada", title: "Derivada y Cauchy-Riemann", templates: ["c3-deriv-multi", "c3-cr-donde-mc"], theory: ["c3-derivada", "c3-analitica"],
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

  T["c3-exp-multi"] = {
    type: "multi", concepts: ["c3-exponencial"], difficulty: 1,
    generate(r) {
      const [p, q] = r.pick(ANG), k = r.int(2, 5), a0 = r.pick([0, 1, 2, -1, "ln", "ln"]), th = p * Math.PI / q;
      const a = a0 === "ln" ? Math.log(k) : a0, aT = a0 === "ln" ? `\\ln ${k}` : a0 === 0 ? "" : String(a0), eT = a0 === "ln" ? String(k) : a0 === 0 ? "1" : a0 === 1 ? "e" : `e^{${a0}}`;
      const res = Z.polar(Math.exp(a), th).map(x => (Math.abs(x) < 1e-12 ? 0 : x));
      return {
        prompt: `Escribí $e^{z}$ como $a + bi$, para $z = ${aT}${aT ? " " : ""}${imTex(p, q, !aT)}$.`,
        parts: [
          { q: "¿Cuánto vale la parte real?", type: "numeric", answer: res[0],
            traps: [{ value: Math.exp(a), msg: "Ese es el módulo, $e^x$. Falta multiplicar por $\\cos y$." }].filter(t => far(t.value, res[0])),
            // verificación: la exponencial sumada como serie de potencias (sin senos ni cosenos)
            verify: { kind: "value", tol: 1e-9, fn: () => Z.expS([a, th])[0] } },
          { q: "¿Y la parte imaginaria?", type: "numeric", answer: res[1], verify: { kind: "value", tol: 1e-9, fn: () => Z.expS([a, th])[1] } }
        ],
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
      summary: "e^z = e^x (cos y + i sen y). Es entera, con (e^z)' = e^z; |e^z| = e^x, nunca vale 0, cumple e^{z+w} = e^z e^w y es periódica de período 2πi.",
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
      summary: "z^c = e^{c log z}: en general, infinitos valores. El valor principal usa Log z. Con c entero hay un solo valor; con c = p/q irreducible, q valores (las raíces); en otro caso, infinitos.",
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
      summary: "sen z = (e^{iz} − e^{−iz})/2i, cos z = (e^{iz} + e^{−iz})/2. Son enteras, valen las identidades de siempre, y sus ceros son los reales; pero no están acotadas: |sen z|² = sen²x + senh²y.",
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
      diagnostic: ["c3-exp-multi", "c3-ecuacion-exp-multi", "c3-trig-num"],
      lessons: [
        { id: "c3-exponencial", title: "La exponencial", templates: ["c3-exp-multi", "c3-elementales-vf"], theory: ["c3-exponencial"],
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

  T["c3-linea-multi"] = {
    type: "multi", concepts: ["c3-contornos"], difficulty: 2,
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
        parts: [
          { q: "¿Cuánto vale la parte real de la integral?", type: "numeric", answer: res[0], verify: { kind: "value", tol: 1e-6, fn: () => numI()[0] } },
          { q: "¿Y la parte imaginaria?", type: "numeric", answer: res[1], verify: { kind: "value", tol: 1e-6, fn: () => numI()[1] } }
        ],
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

  T["c3-primitiva-multi"] = {
    type: "multi", concepts: ["c3-primitivas"], difficulty: 1,
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
        parts: [
          { q: "¿Cuánto vale la parte real de la integral?", type: "numeric", answer: res[0], verify: { kind: "value", tol: 1e-6, fn: () => numI()[0] } },
          { q: "¿Y la parte imaginaria?", type: "numeric", answer: res[1], verify: { kind: "value", tol: 1e-6, fn: () => numI()[1] } }
        ],
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
      summary: "Si f es analítica dentro y sobre un contorno cerrado simple C, ∮_C f dz = 0. Consecuencia: un contorno se puede deformar sin cambiar la integral, mientras no cruce puntos donde f no es analítica.",
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
      diagnostic: ["c3-linea-multi", "c3-cauchy-goursat-vf", "c3-cauchy-formula-num"],
      lessons: [
        { id: "c3-contornos", title: "Integrales de contorno", templates: ["c3-linea-multi", "c3-cota-ml-num"], theory: ["c3-contornos"],
          intro: R`$\int_C f\,dz = \int_a^b f(z(t))\,z'(t)\,dt$, y $\left|\int_C f\,dz\right| \le ML$.` },
        { id: "c3-cauchy-goursat", title: "Primitivas y Cauchy-Goursat", templates: ["c3-primitiva-multi", "c3-cauchy-goursat-vf"], theory: ["c3-primitivas", "c3-cauchy-goursat"],
          intro: R`Si $f$ es analítica dentro y sobre $C$, $\oint_C f\,dz = 0$. Con primitiva, la integral es $F(z_2) - F(z_1)$.` },
        { id: "c3-cauchy-formula", title: "Fórmula integral de Cauchy", templates: ["c3-cauchy-formula-num", "c3-teoremas-vf"], theory: ["c3-cauchy-formula", "c3-liouville"],
          intro: R`$\oint_C \frac{f(z)}{(z - z_0)^{n+1}}\,dz = \frac{2\pi i}{n!}f^{(n)}(z_0)$ si $z_0$ está dentro de $C$.` }
      ]
    }],
    cards
  });
})();
