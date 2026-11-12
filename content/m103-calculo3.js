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
