/*
 * Q101 · Química General — Lic. en Ciencias Básicas (FCEN, UNCuyo), Plan Ord. 77/15 C.S.
 * ==========================================================================================
 * Temario del programa oficial 2025, en 9 unidades:
 *   1 Estructura atómica y tabla periódica · 2 Enlace y estructura molecular · 3 Sistemas materiales y estequiometría
 *   4 Estados de agregación · 5 Soluciones · 6 Cinética química · 7 Equilibrio químico · 8 Ácidos y bases · 9 Electroquímica
 * Es obligatoria en las cuatro orientaciones del plan.
 *
 * Biblioteca (E.qg): masas atómicas IUPAC redondeadas, lectura de fórmulas, balanceo por el núcleo de la matriz
 * de elementos, configuraciones electrónicas por la regla de Madelung y constantes.
 * Verificaciones independientes en los tests: configuraciones contra una tabla escrita a mano, electrones
 * desapareados llenando orbitales de a uno, niveles de Bohr con las constantes del SI, masas molares contando
 * átomos con otro lector, balances por eliminación de Gauss, reacciones simuladas paso a paso, leyes de velocidad
 * integradas con RK4, equilibrios resueltos por bisección del cociente de reacción y pH por balance de cargas.
 * Ids con prefijo "qg-". Todo el texto y los ejercicios son originales.
 */
(function () {
  const E = window.Efecen;
  E.registerCourse({ id: "q101", code: "Q101", title: "Química General", icon: "flask-conical" });
  // símbolos en orden de número atómico (del H al Kr) y algunos más pesados con su Z
  const SYM = "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr".split(" ");
  const HEAVY = { Rb: 37, Sr: 38, Ag: 47, Sn: 50, I: 53, Xe: 54, Cs: 55, Ba: 56, Pt: 78, Au: 79, Hg: 80, Pb: 82 };
  const Q = E.qg = {
    NA: 6.02214e23, R: 0.082057, Rsi: 8.314, F: 96485, h: 6.62607e-34, c: 2.99792458e8, e: 1.602177e-19,
    me: 9.10938e-31, mp: 1.672622e-27, e0: 8.854188e-12,
    // masas atómicas (g/mol)
    A: { H: 1.008, He: 4.003, Li: 6.94, Be: 9.012, B: 10.81, C: 12.011, N: 14.007, O: 15.999, F: 18.998, Ne: 20.180, Na: 22.990, Mg: 24.305,
      Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, Ar: 39.948, K: 39.098, Ca: 40.078, Ti: 47.867, Cr: 51.996, Mn: 54.938, Fe: 55.845,
      Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38, Br: 79.904, Rb: 85.468, Sr: 87.62, Ag: 107.87, Sn: 118.71, I: 126.90, Ba: 137.33, Pt: 195.08,
      Au: 196.97, Hg: 200.59, Pb: 207.2, Cs: 132.91, Kr: 83.798, Xe: 131.29, Ga: 69.723, Ge: 72.630, As: 74.922, Se: 78.971, Sc: 44.956, V: 50.942 },
    Z: Object.assign(Object.fromEntries(SYM.map((s, i) => [s, i + 1])), HEAVY),
    // período y grupo (1 a 18) de los representativos que se usan en las tendencias
    POS: {},
    // número con coma para TeX (con notación científica si hace falta)
    nf: (x, d = 3) => {
      if (x === 0 || !isFinite(x)) return "0";
      const a = Math.abs(x);
      if (a < 1e-3 || a >= 1e6) { const ex = Math.floor(Math.log10(a)), m = x / 10 ** ex; return `${String(+m.toFixed(d - 1)).replace(".", "{,}")} \\times 10^{${ex}}`; }
      return String(+x.toPrecision(d + 1)).replace(".", "{,}");
    },
    // número con coma, d decimales como mucho
    dn: (x, d = 2) => String(+(+x).toFixed(d)).replace(".", "{,}").replace("-", "−"),
    bisect: (f, a, b, it = 200) => { let fa = f(a); for (let i = 0; i < it; i++) { const m = (a + b) / 2, fm = f(m); if ((fm < 0) === (fa < 0)) { a = m; fa = fm; } else b = m; } return (a + b) / 2; }
  };
  for (const [s, p, g] of [["H", 1, 1], ["Li", 2, 1], ["Be", 2, 2], ["B", 2, 13], ["C", 2, 14], ["N", 2, 15], ["O", 2, 16], ["F", 2, 17],
    ["Na", 3, 1], ["Mg", 3, 2], ["Al", 3, 13], ["Si", 3, 14], ["P", 3, 15], ["S", 3, 16], ["Cl", 3, 17], ["K", 4, 1], ["Ca", 4, 2],
    ["Ga", 4, 13], ["Ge", 4, 14], ["As", 4, 15], ["Se", 4, 16], ["Br", 4, 17], ["Rb", 5, 1], ["Sr", 5, 2], ["I", 5, 17], ["Cs", 6, 1]]) Q.POS[s] = [p, g];

  // ---- fórmulas: "Ca(OH)2" → { Ca: 1, O: 2, H: 2 } ----
  Q.parse = f => {
    let i = 0;
    const group = () => {
      const out = {};
      while (i < f.length && f[i] !== ")") {
        let part;
        if (f[i] === "(") { i++; part = group(); i++; }
        else { const m = /^[A-Z][a-z]?/.exec(f.slice(i)); if (!m) throw new Error("fórmula: " + f); i += m[0].length; part = { [m[0]]: 1 }; }
        const n = /^\d+/.exec(f.slice(i)); let k = 1;
        if (n) { k = +n[0]; i += n[0].length; }
        for (const [el, c] of Object.entries(part)) out[el] = (out[el] || 0) + c * k;
      }
      return out;
    };
    return group();
  };
  Q.mm = f => Object.entries(Q.parse(f)).reduce((s, [el, n]) => s + Q.A[el] * n, 0);
  // otro lector, para verificar: expande los paréntesis repitiendo el texto y después cuenta símbolo por símbolo
  Q.count2 = f => {
    let s = f;
    for (let k = 0; k < 10 && s.includes("("); k++) s = s.replace(/\(([^()]*)\)(\d*)/g, (_, g, n) => g.repeat(+(n || 1)));
    const out = {};
    for (const m of s.matchAll(/([A-Z][a-z]?)(\d*)/g)) out[m[1]] = (out[m[1]] || 0) + +(m[2] || 1);
    return out;
  };
  // fórmula en TeX: "Ca(OH)2" → \mathrm{Ca(OH)_{2}}; carga opcional ("2-", "+")
  Q.tex = (f, q) => `\\mathrm{${f.replace(/(\d+)/g, "_{$1}").replace(/Na(?=N)/g, "Na{}")}${q ? `^{${q}}` : ""}}`;

  // ---- balanceo: coeficientes enteros mínimos por el núcleo de la matriz (elementos y carga) ----
  // species: [{ f, q (carga, número), side: -1 reactivo / +1 producto }]
  Q.balance = species => {
    const els = [...new Set(species.flatMap(s => Object.keys(Q.parse(s.f))))];
    const rows = els.map(el => species.map(s => (Q.parse(s.f)[el] || 0) * s.side));
    if (species.some(s => s.q)) rows.push(species.map(s => (s.q || 0) * s.side));
    // eliminación de Gauss con fracciones (numerador, denominador) para el núcleo de dimensión 1
    const n = species.length, M = rows.map(r => r.map(v => [v, 1]));
    const sub = (a, b) => norm([a[0] * b[1] - b[0] * a[1], a[1] * b[1]]), mul = (a, b) => norm([a[0] * b[0], a[1] * b[1]]), div = (a, b) => norm([a[0] * b[1], a[1] * b[0]]);
    function norm([p, q]) { if (q < 0) { p = -p; q = -q; } const g = gcd(Math.abs(p), q) || 1; return [p / g, q / g]; }
    function gcd(a, b) { while (b) [a, b] = [b, a % b]; return a; }
    const piv = [];
    let row = 0;
    for (let col = 0; col < n && row < M.length; col++) {
      const p = M.findIndex((r, k) => k >= row && r[col][0] !== 0);
      if (p < 0) continue;
      [M[row], M[p]] = [M[p], M[row]];
      const pv = M[row][col];
      M[row] = M[row].map(v => div(v, pv));
      for (let k = 0; k < M.length; k++) if (k !== row && M[k][col][0] !== 0) { const fct = M[k][col]; M[k] = M[k].map((v, j) => sub(v, mul(fct, M[row][j]))); }
      piv.push(col); row++;
    }
    const free = [...Array(n).keys()].filter(c => !piv.includes(c));
    if (free.length !== 1) return null;
    const x = Array(n).fill(null); x[free[0]] = [1, 1];
    piv.forEach((c, k) => { x[c] = norm([-M[k][free[0]][0], M[k][free[0]][1]]); });
    const L = x.reduce((l, [, q]) => l * q / gcd(l, q), 1);
    let ints = x.map(([p, q]) => p * L / q);
    const g = ints.reduce((a, b) => gcd(Math.abs(a), Math.abs(b)), 0);
    ints = ints.map(v => v / g);
    if (ints[0] < 0) ints = ints.map(v => -v);
    return ints.every(v => v > 0) ? ints : null;
  };

  // ---- configuraciones electrónicas (regla de Madelung, con las excepciones del Cr y el Cu) ----
  const L = "spdf";
  Q.SUB = [];
  for (let n = 1; n <= 7; n++) for (let l = 0; l < Math.min(n, 4); l++) Q.SUB.push([n, l]);
  Q.SUB.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]) || a[0] - b[0]);
  // lista de [n, l, electrones]
  Q.config = (Z, q = 0) => {
    let left = Z;
    const out = [];
    for (const [n, l] of Q.SUB) { if (left <= 0) break; const k = Math.min(left, 2 * (2 * l + 1)); out.push([n, l, k]); left -= k; }
    if ([24, 29, 42, 47, 79].includes(Z)) {          // un electrón del ns pasa al (n−1)d para completarlo o dejarlo a medio llenar
      const s = out.find(x => x[1] === 0 && x[0] === Math.max(...out.filter(y => y[1] === 0).map(y => y[0]))), d = out.find(x => x[1] === 2 && x[0] === s[0] - 1);
      s[2]--; d[2]++;
    }
    // cationes: salen primero los electrones de mayor n (y, a igual n, de mayor l); aniones: se agregan siguiendo el orden
    for (let k = 0; k < q; k++) {
      const occ = out.filter(x => x[2] > 0).sort((a, b) => b[0] - a[0] || b[1] - a[1])[0];
      occ[2]--;
    }
    if (q < 0) return Q.config(Z - q).map(x => x.slice());
    return out.filter(x => x[2] > 0);
  };
  const NOBLE = [[2, "He"], [10, "Ne"], [18, "Ar"], [36, "Kr"], [54, "Xe"]];
  // texto compacto: "[Ar] 3d6 4s2" (los subniveles ordenados por n y después por l)
  Q.confStr = cf => {
    const tot = cf.reduce((s, x) => s + x[2], 0);
    let core = null;
    for (const [z, s] of NOBLE) {
      // el carozo es el gas noble más grande cuyos subniveles están completos en la configuración
      const nc = Q.config(z);
      if (z < tot && nc.every(([n, l, k]) => (cf.find(x => x[0] === n && x[1] === l) || [0, 0, 0])[2] === k)) core = [z, s, nc];
    }
    const rest = cf.filter(x => !core || !core[2].some(y => y[0] === x[0] && y[1] === x[1])).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    return (core ? `[${core[1]}] ` : "") + rest.map(([n, l, k]) => `${n}${L[l]}${k}`).join(" ");
  };
  Q.confTex = str => str.replace(/\[(\w+)\]/, "[\\mathrm{$1}]").replace(/(\d)([spdf])(\d+)/g, "$1$2^{$3}").replace(/ /g, "\\,");
  // electrones desapareados (regla de Hund) a partir de la configuración
  Q.unpaired = cf => cf.reduce((s, [, l, k]) => s + Math.min(k, 2 * (2 * l + 1) - k), 0);
})();

/* =====================================================================
 *  UNIDAD 1 · ESTRUCTURA ATÓMICA Y TABLA PERIÓDICA
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, Q = E.qg, nf = Q.nf, dn = Q.dn;
  const T = {};
  const SYM_ORDER = "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr".split(" ");
  const NAMES = { H: "hidrógeno", He: "helio", Li: "litio", Be: "berilio", B: "boro", C: "carbono", N: "nitrógeno", O: "oxígeno", F: "flúor", Ne: "neón",
    Na: "sodio", Mg: "magnesio", Al: "aluminio", Si: "silicio", P: "fósforo", S: "azufre", Cl: "cloro", Ar: "argón", K: "potasio", Ca: "calcio",
    Sc: "escandio", Ti: "titanio", V: "vanadio", Cr: "cromo", Mn: "manganeso", Fe: "hierro", Co: "cobalto", Ni: "níquel", Cu: "cobre", Zn: "cinc",
    Ga: "galio", Ge: "germanio", As: "arsénico", Se: "selenio", Br: "bromo", Kr: "kriptón", Rb: "rubidio", Sr: "estroncio", I: "yodo", Cs: "cesio" };
  Q.NAMES = NAMES;

  // ---- partículas de un átomo o un ion ----
  const NUCLIDES = [["C", 12], ["C", 14], ["N", 15], ["O", 18], ["Na", 23], ["Mg", 24], ["Al", 27], ["P", 31], ["S", 32], ["Cl", 35], ["Cl", 37], ["K", 39], ["Ca", 40],
    ["Fe", 56], ["Cu", 63], ["Zn", 65], ["Br", 81], ["Se", 79], ["Mn", 55], ["Co", 59], ["Ni", 58]];
  const CHARGES = { C: [0], N: [0, -3], O: [0, -2], Na: [0, 1], Mg: [0, 2], Al: [0, 3], P: [0, -3], S: [0, -2], Cl: [0, -1], K: [0, 1], Ca: [0, 2], Fe: [0, 2, 3], Cu: [0, 1, 2], Zn: [0, 2], Br: [0, -1], Se: [0, -2], Mn: [0, 2, 7], Co: [0, 2, 3], Ni: [0, 2] };
  const qstr = q => (q === 0 ? "" : (Math.abs(q) === 1 ? "" : Math.abs(q)) + (q > 0 ? "+" : "-"));
  T["qg-particulas-num"] = {
    type: "numeric", concepts: ["qg-atomo"], difficulty: 1,
    generate(r) {
      const [s, A] = r.pick(NUCLIDES), q = r.pick(CHARGES[s]), Z = Q.Z[s], ask = r.pick(["n", "e", "p"]);
      const ans = ask === "n" ? A - Z : ask === "e" ? Z - q : Z;
      return {
        prompt: `¿Cuántos ${ask === "n" ? "neutrones" : ask === "e" ? "electrones" : "protones"} tiene $^{${A}}${Q.tex(s, qstr(q))}$? (Z del ${NAMES[s]} = ${Z})`,
        answer: ans,
        solution: [`El [[qg-atomo|número atómico]] $Z = ${Z}$ cuenta los protones; el número másico $A = ${A}$ cuenta protones más neutrones.`,
          ask === "n" ? `Neutrones: $A - Z = ${A} - ${Z} = ${ans}$.` : ask === "e" ? `La carga ${q === 0 ? "es cero: hay tantos electrones como protones" : `es ${q > 0 ? "+" : "−"}${Math.abs(q)}: ${q > 0 ? "perdió" : "ganó"} ${Math.abs(q)} electrón${Math.abs(q) > 1 ? "es" : ""}`}. Electrones: $Z - (${q}) = ${ans}$.` : `Protones: $Z = ${Z}$, sin importar la carga ni el isótopo.`],
        traps: ask === "n" ? [{ value: A, msg: "Eso es el número másico: cuenta protones y neutrones juntos. Restale Z." }] : ask === "e" && q !== 0 ? [{ value: Z + q, msg: "Al revés: un ion positivo perdió electrones (tiene menos que protones) y uno negativo ganó." }] : [],
        // verificación: Z sale de la posición en la tabla y se arma el átomo partícula por partícula
        verify: { kind: "value", fn: () => {
          const z = SYM_ORDER.indexOf(s) + 1, atom = { p: [], n: [], e: [] };
          for (let i = 0; i < z; i++) atom.p.push(1);
          while (atom.p.length + atom.n.length < A) atom.n.push(0);
          for (let i = 0; i < z - q; i++) atom.e.push(-1);
          return ask === "n" ? atom.n.length : ask === "e" ? atom.e.length : atom.p.length;
        } }
      };
    }
  };

  // ---- masa atómica promedio ----
  const ISO = [
    { s: "Cl", m: [34.969, 36.966], a: 75.78 }, { s: "Cu", m: [62.930, 64.928], a: 69.15 }, { s: "B", m: [10.013, 11.009], a: 19.9 },
    { s: "Br", m: [78.918, 80.916], a: 50.69 }, { s: "Ga", m: [68.926, 70.925], a: 60.11 }, { s: "Li", m: [6.015, 7.016], a: 7.59 },
    { s: "Ag", m: [106.905, 108.905], a: 51.84 }, { s: "Rb", m: [84.912, 86.909], a: 72.17 }
  ];
  T["qg-masa-promedio-num"] = {
    type: "numeric", concepts: ["qg-atomo"], difficulty: 2,
    generate(r) {
      const I = r.pick(ISO), a = +(I.a + r.int(-30, 30) / 10).toFixed(1), ask = r.pick(["masa", "abund"]);
      const avg = I.m[0] * a / 100 + I.m[1] * (100 - a) / 100, avgShow = +avg.toFixed(3);
      const aAns = 100 * (avgShow - I.m[1]) / (I.m[0] - I.m[1]);
      const nm = NAMES[I.s] || I.s;
      return {
        prompt: ask === "masa"
          ? `El ${nm} natural tiene dos isótopos: uno de masa $${dn(I.m[0], 3)}$ u (abundancia $${dn(a, 1)}\\,\\%$) y otro de $${dn(I.m[1], 3)}$ u. ¿Cuál es la masa atómica promedio (u)?`
          : `El ${nm} tiene dos isótopos, de $${dn(I.m[0], 3)}$ u y $${dn(I.m[1], 3)}$ u, y su masa atómica promedio es $${dn(avgShow, 3)}$ u. ¿Qué porcentaje del isótopo liviano hay?`,
        answer: ask === "masa" ? avg : aAns, tolerance: ask === "masa" ? 5e-4 : 0.01,
        solution: [`La [[qg-atomo|masa atómica]] es el promedio de las masas de los isótopos pesado por su abundancia: $\\bar m = x\\,m_1 + (1 - x)\\,m_2$.`,
          ask === "masa" ? `$\\bar m = ${dn(a / 100, 4)}\\cdot${dn(I.m[0], 3)} + ${dn(1 - a / 100, 4)}\\cdot${dn(I.m[1], 3)} \\approx ${dn(avg, 3)}$ u.`
            : `Despejando: $x = \\frac{\\bar m - m_2}{m_1 - m_2} = \\frac{${dn(avgShow, 3)} - ${dn(I.m[1], 3)}}{${dn(I.m[0], 3)} - ${dn(I.m[1], 3)}} \\approx ${dn(aAns / 100, 4)}$, o sea $${dn(aAns, 2)}\\,\\%$.`],
        traps: ask === "masa" ? (Math.abs((I.m[0] + I.m[1]) / 2 / avg - 1) > 3e-3 ? [{ value: (I.m[0] + I.m[1]) / 2, msg: "Ese es el promedio simple. Cada isótopo pesa según su abundancia." }] : [])
          : (Math.abs((100 - aAns) / aAns - 1) > 0.05 ? [{ value: 100 - aAns, msg: "Ese es el porcentaje del isótopo pesado." }] : []),
        // verificación: una muestra de 10⁶ átomos con esa composición, contando la masa total
        verify: { kind: "zero", tol: 1e-6, fn: x => {
          const pct = ask === "masa" ? a : x, N = 1e6, n1 = N * pct / 100, mass = n1 * I.m[0] + (N - n1) * I.m[1];
          return [(mass / N) / (ask === "masa" ? x : avgShow) - 1];
        } }
      };
    }
  };

  // ---- espectro del hidrógeno ----
  const RH = 1.09678e7; // m⁻¹
  const SERIES = { 1: "Lyman (ultravioleta)", 2: "Balmer (visible)", 3: "Paschen (infrarrojo)" };
  T["qg-espectro-num"] = {
    type: "numeric", concepts: ["qg-espectro"], difficulty: 2,
    generate(r) {
      const n1 = r.pick([1, 2, 2, 3]), n2 = n1 + r.int(1, 4), ask = r.pick(["lam", "E", "nu"]);
      const inv = RH * (1 / (n1 * n1) - 1 / (n2 * n2)), lam = 1e9 / inv, Ej = Q.h * Q.c * inv, nu = Q.c * inv;
      const ans = ask === "lam" ? lam : ask === "E" ? Ej * 1e19 : nu / 1e14;
      return {
        prompt: `Un electrón del átomo de hidrógeno pasa del nivel $n = ${n2}$ al $n = ${n1}$ y emite un fotón. ${ask === "lam" ? "¿Cuál es su longitud de onda (nm)?" : ask === "E" ? "¿Cuál es su energía, en unidades de $10^{-19}$ J?" : "¿Cuál es su frecuencia, en unidades de $10^{14}$ Hz?"} ($R_H = 1{,}0968\\times10^7\\ \\mathrm{m^{-1}}$, $h = 6{,}626\\times10^{-34}$ J·s, $c = 3{,}00\\times10^8$ m/s)`,
        answer: ans, tolerance: 0.01,
        solution: [`Por la [[qg-espectro|fórmula de Rydberg]]: $\\frac1\\lambda = R_H\\left(\\frac1{${n1}^2} - \\frac1{${n2}^2}\\right) \\approx ${nf(inv, 4)}\\ \\mathrm{m^{-1}}$ (serie de ${SERIES[n1]}).`,
          ask === "lam" ? `$\\lambda \\approx ${dn(lam, 1)}$ nm.` : ask === "E" ? `$E = \\frac{hc}{\\lambda} = hc\\cdot\\frac1\\lambda \\approx ${nf(Ej, 4)}$ J.` : `$\\nu = \\frac c\\lambda \\approx ${nf(nu, 4)}$ Hz.`],
        // verificación: niveles de Bohr con las constantes del SI (masa reducida del protón y el electrón) y E = hν
        verify: { kind: "zero", tol: 2e-3, fn: x => {
          const mu = Q.me * Q.mp / (Q.me + Q.mp), En = n => -mu * Q.e ** 4 / (8 * Q.e0 ** 2 * Q.h ** 2 * n * n), dE = En(n2) - En(n1);
          const got = ask === "lam" ? Q.h * Q.c / dE * 1e9 : ask === "E" ? dE * 1e19 : dE / Q.h / 1e14;
          return [got / x - 1];
        } }
      };
    }
  };

  // ---- números cuánticos ----
  T["qg-cuanticos-vf"] = {
    type: "tf", concepts: ["qg-cuanticos"], difficulty: 1,
    generate(r) {
      const n = r.int(1, 4), kind = r.pick(["ok", "l", "ml", "ms"]);
      let l = r.int(0, n - 1), ml = r.int(-l, l), ms = r.pick([0.5, -0.5]);
      if (kind === "l") l = n + r.int(0, 1);
      if (kind === "ml") { if (l === 0 && n > 1) l = 1; ml = r.pick([l + 1, -(l + 1)]); }
      if (kind === "ms") ms = r.pick([1, 0, -1]);
      const valid = l >= 0 && l < n && Math.abs(ml) <= l && Math.abs(ms) === 0.5;
      const msT = ms === 0.5 ? "+\\frac12" : ms === -0.5 ? "-\\frac12" : String(ms);
      return {
        prompt: `<b>Verdadero o falso:</b> el conjunto de números cuánticos $(n, \\ell, m_\\ell, m_s) = (${n}, ${l}, ${ml}, ${msT})$ describe un electrón posible en un átomo.`,
        answer: valid,
        explanation: valid ? `Cumple todas las reglas: $0 \\le \\ell \\le n - 1$, $|m_\\ell| \\le \\ell$ y $m_s = \\pm\\frac12$. Es un electrón ${n}${"spdf"[l]}.`
          : kind === "l" ? `$\\ell$ va de 0 a $n - 1 = ${n - 1}$: con $n = ${n}$ no puede valer ${l}.` : kind === "ml" ? `$m_\\ell$ va de $-\\ell$ a $\\ell$: con $\\ell = ${l}$ no puede valer ${ml}.` : `El espín solo puede ser $+\\frac12$ o $-\\frac12$.`,
        solution: [`Reglas de los [[qg-cuanticos|números cuánticos]]: $n \\ge 1$; $\\ell = 0, …, n - 1$; $m_\\ell = -\\ell, …, \\ell$; $m_s = \\pm\\frac12$.`],
        // verificación: se enumeran todos los estados permitidos hasta n = 6 y se busca el conjunto
        verify: { kind: "truth", fn: () => {
          const all = new Set();
          for (let a = 1; a <= 6; a++) for (let b = 0; b < a; b++) for (let c = -b; c <= b; c++) for (const d of [0.5, -0.5]) all.add([a, b, c, d].join());
          return all.has([n, l, ml, ms].join());
        } }
      };
    }
  };
  T["qg-capacidad-num"] = {
    type: "numeric", concepts: ["qg-cuanticos"], difficulty: 1,
    generate(r) {
      const n = r.int(1, 5), kind = r.pick(["nivel", "sub", "orb"]), l = r.int(0, Math.min(n - 1, 3));
      const ans = kind === "nivel" ? 2 * n * n : kind === "sub" ? 2 * (2 * l + 1) : n * n;
      return {
        prompt: kind === "nivel" ? `¿Cuántos electrones caben, como máximo, en el nivel $n = ${n}$?` : kind === "sub" ? `¿Cuántos electrones caben, como máximo, en el subnivel ${n}${"spdf"[l]}?` : `¿Cuántos orbitales hay en el nivel $n = ${n}$?`,
        answer: ans,
        solution: [`Cada [[qg-cuanticos|subnivel]] $\\ell$ tiene $2\\ell + 1$ orbitales (los valores de $m_\\ell$), y cada orbital aloja dos electrones (principio de Pauli).`,
          kind === "sub" ? `Subnivel ${"spdf"[l]} ($\\ell = ${l}$): $2(2\\cdot${l} + 1) = ${ans}$.` : kind === "nivel" ? `Sumando $\\ell = 0, …, ${n - 1}$: $\\sum (2\\ell + 1) = n^2$ orbitales, o sea $2n^2 = ${ans}$ electrones.` : `$\\sum_{\\ell=0}^{${n - 1}} (2\\ell + 1) = n^2 = ${ans}$.`],
        traps: kind === "nivel" ? [{ value: n * n, msg: "Esos son los orbitales; cada uno aloja dos electrones." }] : kind === "orb" ? [{ value: 2 * n * n, msg: "Esos son los electrones; pedían orbitales." }] : [],
        // verificación: contando las cuaternas (n, ℓ, mℓ, ms) permitidas
        verify: { kind: "value", fn: () => {
          let c = 0;
          for (let b = 0; b < n; b++) for (let m = -b; m <= b; m++) for (const s of kind === "orb" ? [0] : [0.5, -0.5]) if (kind !== "sub" || b === l) c++;
          return c;
        } }
      };
    }
  };

  // ---- configuración electrónica ----
  // tabla escrita a mano (átomos neutros del H al Kr), para verificar el algoritmo
  const CONF_TABLE = ["1s1", "1s2", "[He] 2s1", "[He] 2s2", "[He] 2s2 2p1", "[He] 2s2 2p2", "[He] 2s2 2p3", "[He] 2s2 2p4", "[He] 2s2 2p5", "[He] 2s2 2p6",
    "[Ne] 3s1", "[Ne] 3s2", "[Ne] 3s2 3p1", "[Ne] 3s2 3p2", "[Ne] 3s2 3p3", "[Ne] 3s2 3p4", "[Ne] 3s2 3p5", "[Ne] 3s2 3p6",
    "[Ar] 4s1", "[Ar] 4s2", "[Ar] 3d1 4s2", "[Ar] 3d2 4s2", "[Ar] 3d3 4s2", "[Ar] 3d5 4s1", "[Ar] 3d5 4s2", "[Ar] 3d6 4s2", "[Ar] 3d7 4s2", "[Ar] 3d8 4s2",
    "[Ar] 3d10 4s1", "[Ar] 3d10 4s2", "[Ar] 3d10 4s2 4p1", "[Ar] 3d10 4s2 4p2", "[Ar] 3d10 4s2 4p3", "[Ar] 3d10 4s2 4p4", "[Ar] 3d10 4s2 4p5", "[Ar] 3d10 4s2 4p6"];
  // quita electrones del texto de la tabla: primero del subnivel de mayor n (y a igual n, el de mayor ℓ)
  const removeFromStr = (str, q) => {
    const m = /^(\[\w+\] )?(.*)$/.exec(str), parts = m[2].split(" ").map(t => { const [, n, l, k] = /(\d)([spdf])(\d+)/.exec(t); return [+n, "spdf".indexOf(l), +k]; });
    for (let i = 0; i < q; i++) { const o = parts.filter(x => x[2] > 0).sort((a, b) => b[0] - a[0] || b[1] - a[1])[0]; o[2]--; }
    const rest = parts.filter(x => x[2] > 0);
    return ((m[1] || "") + rest.map(([n, l, k]) => `${n}${"spdf"[l]}${k}`).join(" ")).trim();
  };
  // configuración completa (sin carozo) a partir del texto, usando solo la tabla
  const expandList = str => {
    const m = /^(?:\[(\w+)\] ?)?(.*)$/.exec(str.trim()), core = m[1] ? expandList(CONF_TABLE[SYM_ORDER.indexOf(m[1])]) : [];
    return core.concat(m[2] ? m[2].split(" ").filter(Boolean) : []);
  };
  const expand = str => expandList(str).sort().join(" ");
  const CONF_SPECIES = [[6, 0], [7, 0], [8, 0], [11, 0], [15, 0], [16, 0], [17, 0], [19, 0], [20, 0], [21, 0], [22, 0], [23, 0], [24, 0], [25, 0], [26, 0], [27, 0], [28, 0], [29, 0], [30, 0], [33, 0], [35, 0],
    [26, 2], [26, 3], [29, 1], [29, 2], [25, 2], [24, 3], [30, 2], [27, 2], [28, 2], [11, 1], [20, 2], [13, 3], [8, -2], [17, -1], [16, -2], [7, -3], [35, -1]];
  T["qg-config-mc"] = {
    type: "mc", concepts: ["qg-configuracion"], difficulty: 2,
    generate(r) {
      const [Z, q] = r.pick(CONF_SPECIES), s = SYM_ORDER[Z - 1], cf = Q.config(Z, q), ok = Q.confStr(cf);
      // distractores: sin la excepción, sacando electrones del d en lugar del s, o con un electrón de más o de menos
      const plain = [];
      { let left = Z - Math.max(q, 0) + Math.max(-q, 0); for (const [n, l] of Q.SUB) { if (left <= 0) break; const k = Math.min(left, 2 * (2 * l + 1)); plain.push([n, l, k]); left -= k; } }
      const dFirst = Q.config(Z).map(x => x.slice());
      for (let k = 0; k < q; k++) { const d = dFirst.filter(x => x[2] > 0 && x[1] === 2).sort((a, b) => b[0] - a[0])[0] || dFirst.filter(x => x[2] > 0).sort((a, b) => b[0] - a[0] || b[1] - a[1])[0]; d[2]--; }
      const neutral = Q.confStr(Q.config(Z)), plus = Q.confStr(Q.config(Z + 1)), minus = Q.confStr(Q.config(Z - 1));
      const ds = [Q.confStr(plain.filter(x => x[2] > 0)), Q.confStr(dFirst.filter(x => x[2] > 0)), q !== 0 ? neutral : plus, minus, plus].filter(x => x !== ok);
      const extra = [Q.confStr(Q.config(Z + 2)), Z > 2 ? Q.confStr(Q.config(Z - 2)) : null, Q.confStr(Q.config(Z + 3))];
      const m = H.mc(r, ok, ds, { text: true, fallback: extra });
      return {
        prompt: `¿Cuál es la configuración electrónica de $${Q.tex(s, qstr(q))}$ ($Z = ${Z}$)?`,
        options: m.options.map(x => `$${Q.confTex(x)}$`), correct: m.correct,
        solution: [`Se llenan los subniveles en el orden de [[qg-configuracion|Madelung]] (menor $n + \\ell$ primero; a igualdad, menor $n$): 1s 2s 2p 3s 3p 4s 3d 4p…`,
          [24, 29].includes(Z) ? `El ${NAMES[s]} es una excepción: un electrón del 4s pasa al 3d, que queda ${Z === 24 ? "a medio llenar (3d⁵)" : "completo (3d¹⁰)"}, más estable.` : `El átomo neutro tiene ${Z} electrones${q !== 0 ? ` y el ion ${Z - q}` : ""}.`,
          q > 0 && Z > 20 ? `En los cationes de transición se van **primero los 4s** (los de mayor $n$), aunque se hayan llenado antes que los 3d.` : q !== 0 ? `${q > 0 ? "Se quitan" : "Se agregan"} ${Math.abs(q)} electrón${Math.abs(q) > 1 ? "es" : ""} ${q > 0 ? "del subnivel más externo" : "en el siguiente lugar libre"}.` : `Queda $${Q.confTex(ok)}$.`],
        traps: [],
        // verificación: contra la tabla escrita a mano (los iones, sacando o agregando electrones sobre el texto)
        verify: { kind: "truth", target: true, fn: () => {
          const want = q > 0 ? removeFromStr(CONF_TABLE[Z - 1], q) : CONF_TABLE[Z - q - 1];
          return expand(want) === expand(ok) && m.options.filter(x => expand(x) === expand(ok)).length === 1;
        } }
      };
    }
  };
  T["qg-desapareados-num"] = {
    type: "numeric", concepts: ["qg-configuracion"], difficulty: 2,
    generate(r) {
      const [Z, q] = r.pick(CONF_SPECIES), s = SYM_ORDER[Z - 1], cf = Q.config(Z, q), ans = Q.unpaired(cf);
      const open = cf.filter(([, l, k]) => k < 2 * (2 * l + 1) && k > 0);
      return {
        prompt: `¿Cuántos electrones desapareados tiene $${Q.tex(s, qstr(q))}$ en su estado fundamental? ($Z = ${Z}$)`,
        answer: ans,
        solution: [`Configuración: $${Q.confTex(Q.confStr(cf))}$.`,
          open.length ? `Por la [[qg-configuracion|regla de Hund]], en ${open.map(([n, l, k]) => `${n}${"spdf"[l]}^{${k}}`).map(x => `$${x}$`).join(" y ")} los electrones ocupan primero orbitales vacíos con espines paralelos, y recién después se aparean.` : `Todos los subniveles están completos.`,
          `Electrones desapareados: ${ans}.${ans ? " La especie es **paramagnética**." : " La especie es **diamagnética**."}`],
        traps: [],
        // verificación: se llenan los orbitales "cajita por cajita" (uno en cada uno, después el segundo) y se cuentan los solos
        verify: { kind: "value", fn: () => {
          let solos = 0;
          for (const [, l, k] of cf) {
            const box = Array(2 * l + 1).fill(0);
            for (let e = 0; e < k; e++) box[e % box.length]++;
            solos += box.filter(b => b === 1).length;
          }
          return solos;
        } }
      };
    }
  };

  // ---- tendencias periódicas ----
  const DATA = {
    radio: { Li: 152, Be: 112, B: 85, C: 77, N: 75, O: 73, F: 72, Na: 186, Mg: 160, Al: 143, Si: 118, P: 110, S: 103, Cl: 99, K: 227, Ca: 197, Ga: 135, Ge: 122, As: 120, Se: 119, Br: 114, Rb: 248, Sr: 215, I: 133, Cs: 265 },
    ei: { Li: 520, Be: 899, B: 801, C: 1086, N: 1402, O: 1314, F: 1681, Na: 496, Mg: 738, Al: 578, Si: 787, P: 1012, S: 1000, Cl: 1251, K: 419, Ca: 590, Ga: 579, Ge: 762, As: 947, Se: 941, Br: 1140, Rb: 403, Sr: 550, I: 1008, Cs: 376 },
    en: { Li: 0.98, Be: 1.57, B: 2.04, C: 2.55, N: 3.04, O: 3.44, F: 3.98, Na: 0.93, Mg: 1.31, Al: 1.61, Si: 1.90, P: 2.19, S: 2.58, Cl: 3.16, K: 0.82, Ca: 1.00, Ga: 1.81, Ge: 2.01, As: 2.18, Se: 2.55, Br: 2.96, Rb: 0.82, Sr: 0.95, I: 2.66, Cs: 0.79 }
  };
  const PROP = { radio: "radio atómico", ei: "primera energía de ionización", en: "electronegatividad" };
  const GROUPS = [["Li", "Na", "K", "Rb", "Cs"], ["Be", "Mg", "Ca", "Sr"], ["N", "P", "As"], ["O", "S", "Se"], ["F", "Cl", "Br", "I"],
    ["Li", "Be", "B", "C", "N", "O", "F"], ["Na", "Mg", "Al", "Si", "P", "S", "Cl"], ["K", "Ca", "Ga", "Ge", "As", "Se", "Br"]];
  T["qg-tendencia-order"] = {
    type: "order", concepts: ["qg-periodicidad"], difficulty: 2,
    generate(r) {
      const g = r.pick(GROUPS), prop = r.pick(["radio", "ei", "en"]), els = r.sample(g.filter(s => DATA[prop][s] != null), Math.min(4, g.length));
      const sorted = els.slice().sort((a, b) => DATA[prop][a] - DATA[prop][b]);
      if (new Set(sorted.map(s => DATA[prop][s])).size < sorted.length) return null;
      // regla de las tendencias: el radio crece hacia abajo y hacia la izquierda; la EI y la EN, al revés
      const score = s => { const [p, gr] = Q.POS[s]; return prop === "radio" ? p * 100 - gr : -p * 100 + gr; };
      const byRule = els.slice().sort((a, b) => score(a) - score(b));
      if (byRule.join() !== sorted.join()) return null;   // se descartan las excepciones (Be/B, N/O, Mg/Al, P/S…)
      return {
        prompt: `Ordená de **menor a mayor** ${PROP[prop]}: ${els.map(s => `$\\mathrm{${s}}$`).join(", ")}.`,
        steps: sorted.map(s => `$\\mathrm{${s}}$ (${NAMES[s]})`),
        solution: [`Los elementos ${Q.POS[els[0]][0] === Q.POS[els[1]][0] ? "están en el mismo período" : "están en el mismo grupo"}. ${prop === "radio" ? "El [[qg-periodicidad|radio]] crece al bajar en un grupo (se agregan niveles) y decrece hacia la derecha en un período (crece la carga nuclear efectiva)." : `La ${PROP[prop]} [[qg-periodicidad|crece]] hacia la derecha en un período (más carga nuclear efectiva) y decrece al bajar en un grupo (los electrones externos están más lejos).`}`,
          `Valores: ${sorted.map(s => `${s}: ${String(DATA[prop][s]).replace(".", ",")}${prop === "radio" ? " pm" : prop === "ei" ? " kJ/mol" : ""}`).join("; ")}.`],
        // verificación: el orden de los datos tabulados coincide con el que predice la posición en la tabla
        verify: { kind: "truth", target: true, fn: () => byRule.join() === els.slice().sort((a, b) => DATA[prop][a] - DATA[prop][b]).join() }
      };
    }
  };
  T["qg-tendencia-vf"] = {
    type: "tf", concepts: ["qg-periodicidad"], difficulty: 2,
    generate(r) {
      const pick = r.pick([["Be", "B", "ei"], ["N", "O", "ei"], ["Mg", "Al", "ei"], ["P", "S", "ei"], ["Na", "Mg", "ei"], ["C", "N", "ei"], ["Na", "Cl", "radio"], ["K", "Na", "radio"], ["F", "Cl", "en"], ["O", "S", "en"], ["Li", "F", "en"], ["Mg", "Ca", "radio"]]);
      const [a, b, prop] = r.bool() ? pick : [pick[1], pick[0], pick[2]];
      const truth = DATA[prop][a] > DATA[prop][b];
      const anomaly = prop === "ei" && ["Be,B", "N,O", "Mg,Al", "P,S"].includes([a, b].sort((x, y) => Q.Z[x] - Q.Z[y]).join());
      return {
        prompt: `<b>Verdadero o falso:</b> el ${NAMES[a]} tiene mayor ${PROP[prop]} que el ${NAMES[b]}.`,
        answer: truth,
        explanation: `${a}: ${String(DATA[prop][a]).replace(".", ",")}; ${b}: ${String(DATA[prop][b]).replace(".", ",")}${prop === "radio" ? " pm" : prop === "ei" ? " kJ/mol" : ""}. ${anomaly ? "Es una de las [[qg-periodicidad|excepciones]] de la energía de ionización: es más fácil sacar un electrón de un subnivel que recién empieza (2p¹, 3p¹) o el que se aparea primero en un p⁴, que uno de un subnivel completo o a medio llenar." : "Sigue la [[qg-periodicidad|tendencia]] general."}`,
        solution: [`Radio: crece hacia abajo y a la izquierda. Energía de ionización y electronegatividad: crecen hacia arriba y a la derecha (con excepciones en la EI).`],
        // verificación: comparando con una segunda fuente, la carga nuclear efectiva de Slater de la capa externa,
        // solo cuando no es una excepción (la EI excepcional se chequea con la regla de subnivel lleno o semilleno)
        verify: { kind: "truth", fn: () => {
          if (anomaly) {
            const cfA = Q.config(Q.Z[a]), cfB = Q.config(Q.Z[b]), last = cf => cf[cf.length - 1], stable = cf => { const [, l, k] = last(cf); return k === 2 * (2 * l + 1) || (l === 1 && k === 3); };
            return stable(cfA) && !stable(cfB);
          }
          const zeff = s => { const cf = Q.config(Q.Z[s]), nmax = Math.max(...cf.map(x => x[0])); let sh = 0;
            for (const [n, , k] of cf) sh += n === nmax ? 0.35 * k : n === nmax - 1 ? 0.85 * k : k;
            return Q.Z[s] - (sh - 0.35); };
          const nOut = s => Math.max(...Q.config(Q.Z[s]).map(x => x[0]));
          const sizeA = nOut(a) ** 2 / zeff(a), sizeB = nOut(b) ** 2 / zeff(b);
          return prop === "radio" ? sizeA > sizeB : sizeA < sizeB;
        } }
      };
    }
  };

  const cards = {
    "qg-atomo": {
      title: "El átomo: protones, neutrones, electrones e isótopos", aliases: ["número atómico", "número másico", "isótopo", "isótopos", "masa atómica promedio", "catión", "anión", "unidad de masa atómica"], concepts: ["qg-atomo"],
      summary: "Z = protones (define el elemento); A = protones + neutrones; los electrones son Z − carga. Los isótopos tienen el mismo Z y distinto A, y la masa atómica de la tabla es su promedio pesado por la abundancia.",
      def: [R`El átomo tiene un **núcleo** con protones (carga $+e$) y neutrones (sin carga), y alrededor, electrones (carga $-e$). El **número atómico** $Z$ es la cantidad de protones y define el elemento; el **número másico** $A$ es protones más neutrones. Se escribe $^{A}_{Z}\mathrm{X}$.`,
        R`Un **ion** tiene distinta cantidad de electrones que de protones: un **catión** perdió electrones (carga positiva) y un **anión** ganó (carga negativa). Electrones $= Z - q$.`,
        R`Los **isótopos** de un elemento tienen el mismo $Z$ y distinto número de neutrones. La **masa atómica** que figura en la tabla es el promedio de las masas de los isótopos, pesado por su abundancia natural: $\bar m = \sum_i x_i m_i$. Se mide en unidades de masa atómica (u), $\frac1{12}$ de la masa de un átomo de $^{12}\mathrm C$.`],
      idea: [R`Casi toda la masa está en el núcleo, que ocupa una parte ínfima del volumen: si el átomo fuera una cancha de fútbol, el núcleo sería una hormiga en el centro. Por eso los electrones son los que deciden cómo se une el átomo con otros: la química es, sobre todo, la física de los electrones externos.`,
        R`El cloro de la tabla pesa 35,45 u y no hay ningún átomo de cloro que pese eso: hay de 35 y de 37, en proporción 3 a 1.`],
      demo: [R`**Paso 1 (contar una muestra).** Tomamos $N$ átomos del elemento. De cada isótopo hay $x_iN$, y cada uno pesa $m_i$.`,
        R`**Paso 2 (masa total).** Sumando: $M = \sum_i (x_iN)\,m_i$.`,
        R`**Paso 3 (por átomo).** La masa promedio es $\frac MN = \sum_i x_i m_i$, que no depende de $N$: es un promedio pesado por la abundancia. $\blacksquare$`],
      examples: [{ q: R`$^{56}\mathrm{Fe^{3+}}$ ($Z = 26$). ¿Neutrones y electrones?`, steps: [R`Neutrones: $56 - 26 = 30$.`, R`Electrones: $26 - 3 = 23$.`] },
        { q: R`Cloro: 75,8 % de $^{35}$Cl (34,969 u) y el resto de $^{37}$Cl (36,966 u).`, steps: [R`$0{,}758\cdot34{,}969 + 0{,}242\cdot36{,}966 \approx 35{,}45$ u.`] }],
      tips: [R`El número de protones nunca cambia en una reacción química: si cambia $Z$, cambió el elemento (eso es una reacción nuclear).`],
      see: ["qg-configuracion", "qg-mol"]
    },
    "qg-espectro": {
      title: "Radiación electromagnética y espectros atómicos", aliases: ["espectro de emisión", "espectro de absorción", "espectro de líneas", "radiación electromagnética", "ecuación de Planck"], concepts: ["qg-espectro"],
      summary: "La luz viaja en fotones de energía E = hν = hc/λ. Un átomo solo emite o absorbe fotones cuya energía es la diferencia entre dos de sus niveles: por eso su espectro tiene líneas. En el hidrógeno, 1/λ = R_H(1/n₁² − 1/n₂²).",
      def: [R`La **radiación electromagnética** es una onda con longitud de onda $\lambda$ y frecuencia $\nu$, que cumplen $\lambda\nu = c$. Se intercambia con la materia de a paquetes, los **fotones**, cada uno con energía $E = h\nu = \frac{hc}{\lambda}$ ($h = 6{,}626\times10^{-34}$ J·s).`,
        R`Los electrones de un átomo solo pueden tener ciertas energías (**niveles**). Al pasar de un nivel $E_2$ a otro menor $E_1$, el átomo emite un fotón con $h\nu = E_2 - E_1$; al absorber ese fotón, sube. El **espectro de emisión** es el conjunto de líneas brillantes que resulta, y el de **absorción**, las líneas oscuras en las mismas posiciones.`,
        R`En el hidrógeno, $E_n = -\frac{13{,}6\ \mathrm{eV}}{n^2}$ ([[f3-bohr|modelo de Bohr]]) y las líneas siguen la fórmula de Rydberg, $\frac1\lambda = R_H\left(\frac1{n_1^2} - \frac1{n_2^2}\right)$ con $R_H = 1{,}0968\times10^7\ \mathrm{m^{-1}}$. Las que terminan en $n_1 = 1$ forman la serie de Lyman (UV), en $n_1 = 2$ la de Balmer (visible) y en $n_1 = 3$ la de Paschen (IR).`],
      idea: [R`Cada elemento tiene su "código de barras" de líneas, porque sus niveles son propios. Así se descubrió el helio: primero en el espectro del Sol y recién después en la Tierra. Y así se sabe de qué están hechas las estrellas sin ir a buscarlas.`,
        R`Hay más detalle (la ecuación de Schrödinger, los orbitales) en [[f3-espectros|Física General III]].`],
      demo: [R`**Paso 1 (niveles).** En el modelo de Bohr, la energía del nivel $n$ del hidrógeno es $E_n = -\frac{hcR_H}{n^2}$ (con $hcR_H \approx 13{,}6$ eV).`,
        R`**Paso 2 (conservación de la energía).** Al pasar de $n_2$ a $n_1 < n_2$, el fotón se lleva la diferencia: $h\nu = E_{n_2} - E_{n_1} = hcR_H\left(\frac1{n_1^2} - \frac1{n_2^2}\right)$.`,
        R`**Paso 3 (pasar a λ).** Como $h\nu = \frac{hc}\lambda$, dividiendo por $hc$ queda $\frac1\lambda = R_H\left(\frac1{n_1^2} - \frac1{n_2^2}\right)$. $\blacksquare$`],
      examples: [{ q: R`Línea de $n = 3$ a $n = 2$.`, steps: [R`$\frac1\lambda = 1{,}0968\times10^7\left(\frac14 - \frac19\right) \approx 1{,}523\times10^6\ \mathrm{m^{-1}}$.`, R`$\lambda \approx 656$ nm: la línea roja de Balmer.`] }],
      see: ["f3-bohr", "f3-espectros", "qg-cuanticos"]
    },
    "qg-cuanticos": {
      title: "Números cuánticos y orbitales", aliases: ["orbital atómico", "orbitales atómicos", "subnivel", "subniveles", "principio de exclusión de Pauli", "número cuántico de espín"], concepts: ["qg-cuanticos"],
      summary: "Cada electrón de un átomo queda descripto por (n, ℓ, mℓ, ms): n ≥ 1; ℓ de 0 a n − 1 (s, p, d, f); mℓ de −ℓ a ℓ; ms = ±½. Pauli: no hay dos electrones con los cuatro iguales, así que cada orbital aloja dos.",
      def: [R`La ecuación de Schrödinger del átomo da **orbitales**: regiones donde es probable encontrar al electrón. Cada uno se identifica con tres números cuánticos ([[f3-hidrogeno|átomo de hidrógeno]]):`,
        R`- **Principal** $n = 1, 2, 3, …$: el nivel; fija sobre todo el tamaño y la energía.
- **Azimutal** $\ell = 0, 1, …, n - 1$: el subnivel y la forma (s, p, d, f para $\ell = 0, 1, 2, 3$).
- **Magnético** $m_\ell = -\ell, …, \ell$: la orientación. Un subnivel tiene $2\ell + 1$ orbitales.`,
        R`El electrón tiene además **espín**, $m_s = \pm\frac12$. **Principio de exclusión de Pauli:** dos electrones de un átomo no pueden tener los cuatro números iguales; por eso cada orbital aloja como mucho dos, con espines opuestos.`],
      idea: [R`Los números cuánticos son la "dirección" del electrón: nivel, subnivel, orbital y espín. Pauli dice que no hay dos inquilinos con la misma dirección. Esa regla es la que arma la tabla periódica: si todos los electrones pudieran amontonarse en el 1s, todos los elementos se parecerían.`],
      demo: [R`**Paso 1 (un subnivel).** Para un $\ell$ dado, $m_\ell$ toma los enteros de $-\ell$ a $\ell$: son $2\ell + 1$ valores, o sea $2\ell + 1$ orbitales. Con dos espines, caben $2(2\ell + 1)$ electrones: 2 en s, 6 en p, 10 en d, 14 en f.`,
        R`**Paso 2 (un nivel).** Sumando sobre $\ell = 0, …, n - 1$: $\sum_{\ell=0}^{n-1}(2\ell + 1) = 2\cdot\frac{(n-1)n}{2} + n = n^2$ orbitales.`,
        R`**Paso 3 (electrones).** Con dos por orbital, el nivel $n$ aloja $2n^2$ electrones: 2, 8, 18, 32. $\blacksquare$`],
      examples: [{ q: R`¿Es posible $(3, 2, -3, \frac12)$?`, steps: [R`Con $\ell = 2$, $m_\ell$ va de $-2$ a $2$: $-3$ no está permitido. No es posible.`] }],
      see: ["f3-hidrogeno", "qg-configuracion", "f3-momento-angular"]
    },
    "qg-configuracion": {
      title: "Configuración electrónica: Aufbau, Pauli y Hund", aliases: ["configuración electrónica", "configuraciones electrónicas", "principio de Aufbau", "regla de Madelung", "regla de Hund", "electrones desapareados", "paramagnético", "diamagnético"], concepts: ["qg-configuracion"],
      summary: "Los electrones llenan los subniveles en orden de energía creciente (regla de Madelung: menor n + ℓ, y a igualdad, menor n). En un subnivel, primero uno por orbital con espines paralelos (Hund). Excepciones: Cr y Cu. En los cationes de transición se van primero los ns.",
      def: [R`**Principio de construcción (Aufbau):** en el estado fundamental, los electrones ocupan los subniveles de menor energía disponibles. El orden aproximado lo da la **regla de Madelung**: menor $n + \ell$ primero y, a igual $n + \ell$, menor $n$. Queda 1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p 6s 4f 5d 6p…`,
        R`**Regla de Hund:** dentro de un subnivel, los electrones ocupan primero orbitales distintos con espines paralelos, y recién después se aparean. Una especie con electrones desapareados es **paramagnética** (la atrae un imán); sin ellos, **diamagnética**.`,
        R`Se abrevia con el gas noble anterior entre corchetes: $\mathrm{Fe}$: $[\mathrm{Ar}]\,3d^6\,4s^2$. **Excepciones:** $\mathrm{Cr}$: $[\mathrm{Ar}]\,3d^5\,4s^1$ y $\mathrm{Cu}$: $[\mathrm{Ar}]\,3d^{10}\,4s^1$ (subnivel d a medio llenar o lleno). **Iones:** en los cationes de transición salen primero los electrones $4s$: $\mathrm{Fe^{3+}}$: $[\mathrm{Ar}]\,3d^5$.`],
      idea: [R`El 4s se llena antes que el 3d porque, en el átomo neutro, su electrón "penetra" cerca del núcleo y queda menos apantallado. Pero una vez que hay electrones en el 3d, el 4s queda más afuera y por eso es el primero en irse al formar un catión.`,
        R`La configuración de la capa externa explica la tabla periódica: los elementos de un mismo grupo tienen la misma configuración externa ($ns^1$ los alcalinos, $ns^2np^5$ los halógenos) y por eso se parecen químicamente.`],
      examples: [{ q: R`$\mathrm{Mn^{2+}}$ ($Z = 25$)`, steps: [R`Mn: $[\mathrm{Ar}]\,3d^5\,4s^2$. Se van los dos 4s: $[\mathrm{Ar}]\,3d^5$.`, R`Cinco orbitales d con un electrón cada uno: 5 desapareados, paramagnético.`] }],
      tips: [R`Para contar desapareados alcanza con mirar los subniveles incompletos: en $p^4$ hay 2 (tres orbitales: dos con uno y uno con dos), en $d^7$ hay 3.`],
      see: ["qg-cuanticos", "qg-periodicidad", "qg-atomo"]
    },
    "qg-periodicidad": {
      title: "Tabla periódica y propiedades periódicas", aliases: ["tabla periódica", "ley periódica", "radio atómico", "energía de ionización", "afinidad electrónica", "electronegatividad", "carga nuclear efectiva", "propiedades periódicas"], concepts: ["qg-periodicidad"],
      summary: "En la tabla, los elementos se ordenan por Z en períodos (filas) y grupos (columnas con la misma configuración externa). El radio crece hacia abajo y a la izquierda; la energía de ionización y la electronegatividad, hacia arriba y a la derecha. La clave es la carga nuclear efectiva.",
      def: [R`La **tabla periódica** ordena los elementos por número atómico. Los **períodos** son las filas (el $n$ de la capa externa) y los **grupos** las columnas (misma configuración externa). Bloques: s (grupos 1-2), p (13-18), d (transición) y f (transición interna). Los del grupo 18 son los **gases nobles**.`,
        R`- **Radio atómico:** la mitad de la distancia entre núcleos de átomos iguales unidos.
- **Energía de ionización (EI):** la energía para sacar el electrón más externo de un átomo gaseoso: $\mathrm{X(g)} \to \mathrm{X^+(g)} + e^-$.
- **Afinidad electrónica:** la energía en juego al agregar un electrón a un átomo gaseoso.
- **Electronegatividad:** la tendencia de un átomo a atraer los electrones de un enlace (escala de Pauling: del Cs, 0,79, al F, 3,98).`,
        R`Los **radios iónicos**: un catión es más chico que su átomo (perdió electrones y a veces una capa) y un anión más grande (más repulsión entre electrones).`],
      idea: [R`Todo sale de la **carga nuclear efectiva** $Z_{ef} = Z - S$: la carga que "siente" un electrón externo, descontando el apantallamiento $S$ de los internos. Al avanzar en un período, se agregan protones y electrones en la misma capa, que se apantallan poco entre sí: $Z_{ef}$ crece, el átomo se achica y retiene más sus electrones. Al bajar en un grupo, se agrega una capa más lejana y el radio crece.`,
        R`La EI tiene excepciones: el B tiene menos que el Be (su electrón 2p está más alto que el 2s) y el O menos que el N (el cuarto electrón 2p se aparea y lo empuja la repulsión).`],
      demo: [R`**Paso 1 (fuerza sobre el electrón externo).** Lo atrae el núcleo con carga $Z$, pero los electrones internos se interponen y "tapan" parte de esa carga. Un modelo simple: siente una carga $Z_{ef} = Z - S$ a una distancia $r$ que crece con $n$.`,
        R`**Paso 2 (en un período).** $n$ es el mismo y $Z$ aumenta de a uno; el electrón agregado en la misma capa apantalla poco (las reglas de Slater le asignan 0,35). Entonces $Z_{ef}$ aumenta unas 0,65 por elemento: la atracción crece, el radio baja y la EI sube.`,
        R`**Paso 3 (en un grupo).** Al bajar se agrega una capa: $n$ crece, y como el tamaño de un orbital crece como $n^2/Z_{ef}$ y $Z_{ef}$ de la capa externa cambia poco, el radio aumenta y el electrón queda menos atado: la EI baja.`,
        R`**Paso 4 (electronegatividad).** Mide lo mismo que la EI pero dentro de un enlace: un átomo chico y con $Z_{ef}$ grande atrae más los electrones compartidos, así que sigue la misma tendencia. $\blacksquare$`],
      examples: [{ q: R`Ordená por radio creciente: Mg, Na, Cl, S.`, steps: [R`Mismo período (el 3): el radio baja hacia la derecha.`, R`Cl < S < Mg < Na.`] }],
      see: ["qg-configuracion", "qg-enlace-polaridad"]
    }
  };

  E.extendCourse("q101", {
    concepts: { "qg-atomo": { name: "Átomo e isótopos" }, "qg-espectro": { name: "Espectros atómicos" }, "qg-cuanticos": { name: "Números cuánticos" },
      "qg-configuracion": { name: "Configuración electrónica" }, "qg-periodicidad": { name: "Propiedades periódicas" } },
    templates: T,
    units: [{
      id: "qg-atomo-u", order: 1, program: "Unidad 1", title: "Estructura atómica y tabla periódica", icon: "atom",
      diagnostic: ["qg-particulas-num", "qg-config-mc", "qg-tendencia-order"],
      lessons: [
        { id: "qg-l-atomo", title: "Partículas e isótopos", templates: ["qg-particulas-num", "qg-masa-promedio-num"], theory: ["qg-atomo"],
          intro: R`$Z$ protones, $A - Z$ neutrones, $Z - q$ electrones. La masa atómica es el promedio de los isótopos pesado por su abundancia.` },
        { id: "qg-l-espectro", title: "Espectros y fotones", templates: ["qg-espectro-num"], theory: ["qg-espectro"],
          intro: R`$E = h\nu = \frac{hc}\lambda$. En el hidrógeno, $\frac1\lambda = R_H\left(\frac1{n_1^2} - \frac1{n_2^2}\right)$.` },
        { id: "qg-l-cuanticos", title: "Números cuánticos", templates: ["qg-cuanticos-vf", "qg-capacidad-num"], theory: ["qg-cuanticos"],
          intro: R`$n \ge 1$, $0 \le \ell \le n - 1$, $|m_\ell| \le \ell$, $m_s = \pm\frac12$. Un subnivel aloja $2(2\ell + 1)$ electrones.` },
        { id: "qg-l-config", title: "Configuración electrónica", templates: ["qg-config-mc", "qg-desapareados-num"], theory: ["qg-configuracion"],
          intro: R`Orden de llenado: 1s 2s 2p 3s 3p 4s 3d 4p. Hund: primero uno por orbital. Excepciones: Cr y Cu.` },
        { id: "qg-l-periodicidad", title: "Propiedades periódicas", templates: ["qg-tendencia-order", "qg-tendencia-vf"], theory: ["qg-periodicidad"],
          intro: R`Radio: crece hacia abajo y a la izquierda. EI y electronegatividad: hacia arriba y a la derecha.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 2 · ENLACE QUÍMICO Y ESTRUCTURA MOLECULAR
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, Q = E.qg, dn = Q.dn;
  const T = {};
  // electrones de valencia de los representativos (grupo 1-2: el grupo; 13-18: grupo − 10)
  const VAL = { H: 1, Li: 1, Na: 1, K: 1, Be: 2, Mg: 2, Ca: 2, B: 3, Al: 3, C: 4, Si: 4, N: 5, P: 5, As: 5, O: 6, S: 6, Se: 6, F: 7, Cl: 7, Br: 7, I: 7, Xe: 8 };
  Q.VAL = VAL;
  // otra forma: los electrones de la capa de mayor n en la configuración
  const valByConfig = el => { const cf = Q.config(Q.Z[el]), n = Math.max(...cf.map(x => x[0])); return cf.filter(x => x[0] === n).reduce((s, x) => s + x[2], 0); };
  const EN = { H: 2.20, B: 2.04, C: 2.55, N: 3.04, O: 3.44, F: 3.98, Na: 0.93, Mg: 1.31, Al: 1.61, Si: 1.90, P: 2.19, S: 2.58, Cl: 3.16, K: 0.82, Ca: 1.00, Br: 2.96, I: 2.66, Li: 0.98, Be: 1.57, Xe: 2.60, Cs: 0.79, Ba: 0.89, Cu: 1.90, Fe: 1.83 };
  Q.EN = EN;

  // ---- moléculas para Lewis y geometría: átomo central, ligandos (con los electrones que usa cada uno) y carga ----
  // e: electrones del central que usa el ligando (1 si es enlace simple con H o halógeno, 2 si es doble con O o S)
  const MOL = [
    { f: "CH4", c: "C", L: ["H", "H", "H", "H"], q: 0, geo: "tetraédrica" }, { f: "NH3", c: "N", L: ["H", "H", "H"], q: 0, geo: "piramidal trigonal" },
    { f: "H2O", c: "O", L: ["H", "H"], q: 0, geo: "angular" }, { f: "CO2", c: "C", L: ["O", "O"], q: 0, geo: "lineal" },
    { f: "BF3", c: "B", L: ["F", "F", "F"], q: 0, geo: "trigonal plana" }, { f: "SO2", c: "S", L: ["O", "O"], q: 0, geo: "angular" },
    { f: "SO3", c: "S", L: ["O", "O", "O"], q: 0, geo: "trigonal plana" }, { f: "PCl5", c: "P", L: ["Cl", "Cl", "Cl", "Cl", "Cl"], q: 0, geo: "bipiramidal trigonal" },
    { f: "SF6", c: "S", L: Array(6).fill("F"), q: 0, geo: "octaédrica" }, { f: "SF4", c: "S", L: ["F", "F", "F", "F"], q: 0, geo: "balancín" },
    { f: "ClF3", c: "Cl", L: ["F", "F", "F"], q: 0, geo: "forma de T" }, { f: "XeF2", c: "Xe", L: ["F", "F"], q: 0, geo: "lineal" },
    { f: "XeF4", c: "Xe", L: ["F", "F", "F", "F"], q: 0, geo: "plana cuadrada" }, { f: "BrF5", c: "Br", L: Array(5).fill("F"), q: 0, geo: "piramidal cuadrada" },
    { f: "NH4", c: "N", L: ["H", "H", "H", "H"], q: 1, geo: "tetraédrica" }, { f: "H3O", c: "O", L: ["H", "H", "H"], q: 1, geo: "piramidal trigonal" },
    { f: "CO3", c: "C", L: ["O", "O", "O"], q: -2, geo: "trigonal plana" }, { f: "NO2", c: "N", L: ["O", "O"], q: -1, geo: "angular" },
    { f: "I3", c: "I", L: ["I", "I"], q: -1, geo: "lineal" }, { f: "ClO3", c: "Cl", L: ["O", "O", "O"], q: -1, geo: "piramidal trigonal" },
    { f: "PCl3", c: "P", L: ["Cl", "Cl", "Cl"], q: 0, geo: "piramidal trigonal" }, { f: "BeCl2", c: "Be", L: ["Cl", "Cl"], q: 0, geo: "lineal" },
    { f: "CCl4", c: "C", L: ["Cl", "Cl", "Cl", "Cl"], q: 0, geo: "tetraédrica" }, { f: "SiH4", c: "Si", L: ["H", "H", "H", "H"], q: 0, geo: "tetraédrica" },
    { f: "H2S", c: "S", L: ["H", "H"], q: 0, geo: "angular" }, { f: "ICl4", c: "I", L: ["Cl", "Cl", "Cl", "Cl"], q: -1, geo: "plana cuadrada" }
  ];
  const qs = q => (q === 0 ? "" : (Math.abs(q) === 1 ? "" : Math.abs(q)) + (q > 0 ? "+" : "-"));
  const usedBy = el => (el === "O" || el === "S" ? 2 : 1);
  // número estérico y pares libres del central (TRPECV)
  const vsepr = m => { const lp = (VAL[m.c] - m.q - m.L.reduce((s, x) => s + usedBy(x), 0)) / 2; return { sn: m.L.length + lp, lp }; };
  const GEO = { "2,0": "lineal", "3,0": "trigonal plana", "3,1": "angular", "4,0": "tetraédrica", "4,1": "piramidal trigonal", "4,2": "angular",
    "5,0": "bipiramidal trigonal", "5,1": "balancín", "5,2": "forma de T", "5,3": "lineal", "6,0": "octaédrica", "6,1": "piramidal cuadrada", "6,2": "plana cuadrada" };
  const ELEC = { 2: "lineal", 3: "trigonal plana", 4: "tetraédrica", 5: "bipiramidal trigonal", 6: "octaédrica" };
  const ANG = { "lineal": "180°", "trigonal plana": "120°", "angular": "menor que 120° o que 109,5°", "tetraédrica": "109,5°", "piramidal trigonal": "algo menor que 109,5°",
    "bipiramidal trigonal": "90° y 120°", "balancín": "cerca de 90° y 120°", "forma de T": "cerca de 90°", "octaédrica": "90°", "piramidal cuadrada": "cerca de 90°", "plana cuadrada": "90°" };

  T["qg-valencia-num"] = {
    type: "numeric", concepts: ["qg-lewis"], difficulty: 1,
    generate(r) {
      const m = r.pick(MOL), atoms = [m.c, ...m.L], tot = atoms.reduce((s, a) => s + VAL[a], 0) - m.q;
      const counts = {};
      for (const a of atoms) counts[a] = (counts[a] || 0) + 1;
      return {
        prompt: `¿Cuántos electrones de valencia en total hay que repartir en la estructura de Lewis de $${Q.tex(m.f, qs(m.q))}$?`,
        answer: tot,
        solution: [`Se suman los [[qg-lewis|electrones de valencia]] de cada átomo: ${Object.entries(counts).map(([a, n]) => `${n > 1 ? n + "·" : ""}${VAL[a]} (${a})`).join(" + ")} $= ${tot + m.q}$.`,
          m.q === 0 ? `La molécula es neutra: ${tot} electrones.` : `La carga ${m.q > 0 ? "positiva resta" : "negativa suma"} ${Math.abs(m.q)}: ${tot} electrones.`],
        traps: m.q !== 0 ? [{ value: tot + 2 * m.q, msg: "Revisá el signo de la carga: un anión tiene electrones de más, un catión de menos." }] : [],
        // verificación: los electrones de valencia salen de la configuración electrónica (la capa de mayor n)
        verify: { kind: "value", fn: () => atoms.reduce((s, a) => s + valByConfig(a), 0) - m.q }
      };
    }
  };

  // ---- carga formal: estructuras con sus enlaces (aristas) y pares libres ----
  // átomos: [símbolo, pares libres]; enlaces: [i, j, orden]
  const LEWIS = [
    { f: "CO", q: 0, at: [["C", 1], ["O", 1]], b: [[0, 1, 3]] },
    { f: "NH4", q: 1, at: [["N", 0], ["H", 0], ["H", 0], ["H", 0], ["H", 0]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] },
    { f: "CO3", q: -2, at: [["C", 0], ["O", 2], ["O", 3], ["O", 3]], b: [[0, 1, 2], [0, 2, 1], [0, 3, 1]] },
    { f: "NO3", q: -1, at: [["N", 0], ["O", 2], ["O", 3], ["O", 3]], b: [[0, 1, 2], [0, 2, 1], [0, 3, 1]] },
    { f: "O3", q: 0, at: [["O", 1], ["O", 2], ["O", 3]], b: [[0, 1, 2], [0, 2, 1]] },
    { f: "CN", q: -1, at: [["C", 1], ["N", 1]], b: [[0, 1, 3]] },
    { f: "H3O", q: 1, at: [["O", 1], ["H", 0], ["H", 0], ["H", 0]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] },
    { f: "NO2", q: 1, at: [["N", 0], ["O", 2], ["O", 2]], b: [[0, 1, 2], [0, 2, 2]] },
    { f: "BF4", q: -1, at: [["B", 0], ["F", 3], ["F", 3], ["F", 3], ["F", 3]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] },
    { f: "SO4", q: -2, at: [["S", 0], ["O", 3], ["O", 3], ["O", 3], ["O", 3]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] },
    { f: "SO4", q: -2, at: [["S", 0], ["O", 2], ["O", 2], ["O", 3], ["O", 3]], b: [[0, 1, 2], [0, 2, 2], [0, 3, 1], [0, 4, 1]] },
    { f: "HCN", q: 0, at: [["C", 0], ["H", 0], ["N", 1]], b: [[0, 1, 1], [0, 2, 3]] },
    { f: "N2O", q: 0, at: [["N", 1], ["N", 0], ["O", 3]], b: [[0, 1, 3], [1, 2, 1]] },
    { f: "OH", q: -1, at: [["O", 3], ["H", 0]], b: [[0, 1, 1]] },
    { f: "ClO4", q: -1, at: [["Cl", 0], ["O", 3], ["O", 3], ["O", 3], ["O", 3]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] }
  ];
  // cuántos enlaces (sumando órdenes) tiene cada átomo, guardado en la estructura
  for (const s of LEWIS) s.nb = s.at.map((_, i) => s.b.filter(x => x[0] === i || x[1] === i).reduce((t, x) => t + x[2], 0));
  const BOND = { 1: "-", 2: "=", 3: "\\equiv" };
  const desc = s => s.b.map(([i, j, o]) => `\\mathrm{${s.at[i][0]}}${BOND[o]}\\mathrm{${s.at[j][0]}}`).join(",\\ ");
  T["qg-carga-formal-num"] = {
    type: "numeric", concepts: ["qg-lewis"], difficulty: 2,
    generate(r) {
      const s = r.pick(LEWIS), i = r.int(0, s.at.length - 1), [el, lp] = s.at[i];
      const fc = VAL[el] - 2 * lp - s.nb[i];
      const same = s.at.filter(([e, l], k) => e === el && (l !== lp || s.nb[k] !== s.nb[i])).length > 0;
      const which = same ? `el ${el} que tiene ${s.nb[i]} enlace${s.nb[i] > 1 ? "s" : ""} (sumando los órdenes) y ${lp} par${lp === 1 ? "" : "es"} libre${lp === 1 ? "" : "s"}` : `el ${el}`;
      return {
        prompt: `En esta estructura de Lewis de $${Q.tex(s.f, qs(s.q))}$ los enlaces son $${desc(s)}$ y los pares libres: ${s.at.map(([e, l]) => `${e}: ${l}`).join("; ")}. ¿Cuál es la carga formal de ${which}?`,
        answer: fc,
        solution: [`[[qg-lewis|Carga formal]] = electrones de valencia − electrones de los pares libres − enlaces: $CF = V - 2P - B$.`,
          `Para el ${el}: $${VAL[el]} - 2\\cdot${lp} - ${s.nb[i]} = ${fc}$. (La suma de las cargas formales da la carga total, ${s.q}.)`],
        traps: fc !== 0 ? [{ value: -fc, msg: "Revisá el signo: si el átomo «tiene» menos electrones que sus electrones de valencia, la carga formal es positiva." }] : [],
        // verificación: se reparten los electrones (los de pares libres son del átomo; los de enlace, mitad y mitad)
        // recorriendo la lista de enlaces, y se comprueba además que todas las cargas formales sumen la carga del ion
        verify: { kind: "all", list: [
          { kind: "value", fn: () => { let own = 2 * lp; for (const [a, b, o] of s.b) if (a === i || b === i) own += o; return VAL[el] - own; } },
          { kind: "truth", target: true, fn: () => s.at.reduce((t, [e, l], k) => { let own = 2 * l; for (const [a, b, o] of s.b) if (a === k || b === k) own += o; return t + VAL[e] - own; }, 0) === s.q }
        ] }
      };
    }
  };

  // ---- geometría (TRPECV) ----
  T["qg-geometria-mc"] = {
    type: "mc", concepts: ["qg-trpecv"], difficulty: 2,
    generate(r) {
      const m = r.pick(MOL), { sn, lp } = vsepr(m);
      const all = ["lineal", "angular", "trigonal plana", "piramidal trigonal", "tetraédrica", "bipiramidal trigonal", "balancín", "forma de T", "octaédrica", "piramidal cuadrada", "plana cuadrada"];
      const near = { "angular": ["lineal", "trigonal plana", "piramidal trigonal"], "piramidal trigonal": ["trigonal plana", "tetraédrica", "forma de T"], "trigonal plana": ["piramidal trigonal", "forma de T", "angular"],
        "tetraédrica": ["plana cuadrada", "piramidal trigonal", "balancín"], "lineal": ["angular", "forma de T", "trigonal plana"], "plana cuadrada": ["tetraédrica", "octaédrica", "balancín"] };
      const mcq = H.mc(r, m.geo, near[m.geo] || r.sample(all.filter(g => g !== m.geo), 3), { text: true, fallback: all });
      return {
        prompt: `¿Qué geometría molecular tiene $${Q.tex(m.f, qs(m.q))}$?`,
        options: mcq.options, correct: mcq.correct,
        solution: [`Alrededor del ${m.c} hay ${m.L.length} átomo${m.L.length > 1 ? "s" : ""} unido${m.L.length > 1 ? "s" : ""} y ${lp} par${lp === 1 ? "" : "es"} libre${lp === 1 ? "" : "s"}: ${sn} dominios de electrones, que se acomodan en forma ${ELEC[sn]} ([[qg-trpecv|TRPECV]]).`,
          `Los pares libres ${lp ? "ocupan lugares pero no se «ven» en la forma" : "no hay"}: la geometría molecular es **${m.geo}**, con ángulos de ${ANG[m.geo]}.`],
        // verificación: se cuentan los pares libres del central (electrones de valencia ± carga − los que usan los ligandos)
        // y se busca la forma en la tabla de TRPECV
        verify: { kind: "truth", target: true, fn: () => GEO[`${sn},${lp}`] === m.geo && Number.isInteger(lp) }
      };
    }
  };

  // ---- polaridad de moléculas ----
  // direcciones ideales de los ligandos para cada forma (los pares libres ocupan los lugares que faltan)
  const t = Math.acos(-1 / 3), DIRS = {
    "lineal": [[1, 0, 0], [-1, 0, 0]], "trigonal plana": [0, 1, 2].map(k => [Math.cos(2 * Math.PI * k / 3), Math.sin(2 * Math.PI * k / 3), 0]),
    "tetraédrica": [[0, 0, 1], ...[0, 1, 2].map(k => [Math.sin(t) * Math.cos(2 * Math.PI * k / 3), Math.sin(t) * Math.sin(2 * Math.PI * k / 3), Math.cos(t)])],
    "piramidal trigonal": [0, 1, 2].map(k => [Math.sin(t) * Math.cos(2 * Math.PI * k / 3), Math.sin(t) * Math.sin(2 * Math.PI * k / 3), Math.cos(t)]),
    "angular": [[Math.sin(t), 0, Math.cos(t)], [-Math.sin(t) / 2, Math.sin(t) * Math.sqrt(3) / 2, Math.cos(t)]],
    "bipiramidal trigonal": [[0, 0, 1], [0, 0, -1], ...[0, 1, 2].map(k => [Math.cos(2 * Math.PI * k / 3), Math.sin(2 * Math.PI * k / 3), 0])],
    "balancín": [[0, 0, 1], [0, 0, -1], [1, 0, 0], [Math.cos(2 * Math.PI / 3), Math.sin(2 * Math.PI / 3), 0]],
    "forma de T": [[0, 0, 1], [0, 0, -1], [1, 0, 0]],
    "octaédrica": [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]],
    "piramidal cuadrada": [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1]],
    "plana cuadrada": [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]]
  };
  const POLAR = [
    { f: "CO2", c: "C", L: ["O", "O"], geo: "lineal", p: false }, { f: "H2O", c: "O", L: ["H", "H"], geo: "angular", p: true },
    { f: "NH3", c: "N", L: ["H", "H", "H"], geo: "piramidal trigonal", p: true }, { f: "CH4", c: "C", L: ["H", "H", "H", "H"], geo: "tetraédrica", p: false },
    { f: "CCl4", c: "C", L: ["Cl", "Cl", "Cl", "Cl"], geo: "tetraédrica", p: false }, { f: "CHCl3", c: "C", L: ["H", "Cl", "Cl", "Cl"], geo: "tetraédrica", p: true },
    { f: "CH2Cl2", c: "C", L: ["H", "H", "Cl", "Cl"], geo: "tetraédrica", p: true }, { f: "BF3", c: "B", L: ["F", "F", "F"], geo: "trigonal plana", p: false },
    { f: "SO2", c: "S", L: ["O", "O"], geo: "angular", p: true }, { f: "SO3", c: "S", L: ["O", "O", "O"], geo: "trigonal plana", p: false },
    { f: "PCl5", c: "P", L: Array(5).fill("Cl"), geo: "bipiramidal trigonal", p: false }, { f: "SF6", c: "S", L: Array(6).fill("F"), geo: "octaédrica", p: false },
    { f: "SF4", c: "S", L: ["F", "F", "F", "F"], geo: "balancín", p: true }, { f: "XeF4", c: "Xe", L: ["F", "F", "F", "F"], geo: "plana cuadrada", p: false },
    { f: "ClF3", c: "Cl", L: ["F", "F", "F"], geo: "forma de T", p: true }, { f: "PCl3", c: "P", L: ["Cl", "Cl", "Cl"], geo: "piramidal trigonal", p: true },
    { f: "HCN", c: "C", L: ["H", "N"], geo: "lineal", p: true }, { f: "BeCl2", c: "Be", L: ["Cl", "Cl"], geo: "lineal", p: false },
    { f: "H2S", c: "S", L: ["H", "H"], geo: "angular", p: true }, { f: "CH3Cl", c: "C", L: ["H", "H", "H", "Cl"], geo: "tetraédrica", p: true },
    { f: "BrF5", c: "Br", L: Array(5).fill("F"), geo: "piramidal cuadrada", p: true }, { f: "XeF2", c: "Xe", L: ["F", "F"], geo: "lineal", p: false }
  ];
  T["qg-polaridad-vf"] = {
    type: "tf", concepts: ["qg-enlace-polaridad", "qg-trpecv"], difficulty: 2,
    generate(r) {
      const m = r.pick(POLAR), ask = r.bool();
      return {
        prompt: `<b>Verdadero o falso:</b> la molécula $${Q.tex(m.f)}$ (geometría ${m.geo}) es ${ask ? "polar" : "no polar"}.`,
        answer: ask === m.p,
        explanation: m.p ? `Los dipolos de enlace no se cancelan: ${new Set(m.L).size > 1 ? "los ligandos son distintos" : "la forma no es simétrica"}, así que hay un momento dipolar neto: es **polar**.`
          : `Los enlaces son polares pero la forma es simétrica: los [[qg-enlace-polaridad|dipolos de enlace]] se cancelan y la molécula es **no polar**.`,
        solution: [`Una molécula es polar si la suma vectorial de los dipolos de sus enlaces no es cero. Depende de la polaridad de cada enlace y de la [[qg-trpecv|geometría]].`],
        // verificación: suma vectorial de los dipolos de enlace (diferencia de electronegatividad en la dirección de cada ligando)
        verify: { kind: "truth", fn: () => {
          const d = DIRS[m.geo], s = [0, 0, 0];
          m.L.forEach((x, k) => { const w = EN[x] - EN[m.c]; for (let j = 0; j < 3; j++) s[j] += w * d[k][j]; });
          return ask === (Math.hypot(...s) > 1e-6);
        } }
      };
    }
  };

  // ---- tipo de enlace ----
  const PAIRS = [["Na", "Cl", "NaCl"], ["K", "F", "KF"], ["Mg", "O", "MgO"], ["Ca", "O", "CaO"], ["Li", "F", "LiF"], ["Cs", "Cl", "CsCl"], ["Ba", "O", "BaO"],
    ["H", "Cl", "HCl"], ["H", "O", "H2O"], ["N", "H", "NH3"], ["C", "O", "CO"], ["P", "Cl", "PCl3"], ["S", "O", "SO2"],
    ["Cl", "Cl", "Cl2"], ["O", "O", "O2"], ["N", "N", "N2"], ["H", "H", "H2"], ["Cu", "Cu", "Cu"], ["Fe", "Fe", "Fe"], ["Na", "Na", "Na"], ["Mg", "Mg", "Mg"]];
  const METAL = new Set(["Na", "K", "Mg", "Ca", "Li", "Cs", "Ba", "Cu", "Fe", "Al"]);
  T["qg-tipo-enlace-mc"] = {
    type: "mc", concepts: ["qg-enlace-polaridad"], difficulty: 1,
    generate(r) {
      const [a, b, f] = r.pick(PAIRS), d = Math.abs(EN[a] - EN[b]);
      const kind = METAL.has(a) && METAL.has(b) ? "metálico" : METAL.has(a) !== METAL.has(b) ? "iónico" : d === 0 ? "covalente no polar" : "covalente polar";
      const mcq = H.mc(r, kind, ["iónico", "covalente polar", "covalente no polar", "metálico"].filter(k => k !== kind), { text: true, keepOrder: false });
      return {
        prompt: `¿Qué tipo de enlace une los átomos en $${Q.tex(f)}$${a === b && METAL.has(a) ? " (el metal sólido)" : ""}?`,
        options: mcq.options, correct: mcq.correct,
        solution: [`Electronegatividades: ${a} $${dn(EN[a])}$${a !== b ? `, ${b} $${dn(EN[b])}$` : ""}; diferencia $\\Delta\\chi = ${dn(d)}$.`,
          kind === "metálico" ? `Entre átomos metálicos: **enlace metálico** (cationes en un «mar» de electrones deslocalizados).` : kind === "iónico" ? `Metal con no metal y $\\Delta\\chi$ grande (mayor que 1,7): el electrón pasa casi por completo, **enlace iónico**.` : kind === "covalente no polar" ? `Átomos iguales: comparten los electrones por igual, **covalente no polar**.` : `No metales con $\\Delta\\chi$ entre 0,4 y 1,7: comparten los electrones de forma desigual, **[[qg-enlace-polaridad|covalente polar]]**.`],
        // verificación: carácter iónico de Pauling, 1 − e^(−Δχ²/4): más de la mitad es iónico; nulo es no polar; y metálico entre metales
        verify: { kind: "truth", target: true, fn: () => {
          const ion = 1 - Math.exp(-d * d / 4);
          const k2 = METAL.has(a) && METAL.has(b) ? "metálico" : ion > 0.5 ? "iónico" : ion === 0 ? "covalente no polar" : "covalente polar";
          return k2 === kind;
        } }
      };
    }
  };

  // ---- orbitales moleculares de diatómicas del segundo período ----
  const DIAT = [["H2", 2, 1], ["H2", 1, 0.5, "+"], ["He2", 3, 0.5, "+"], ["Li2", 6, 1], ["B2", 10, 1], ["C2", 12, 2], ["N2", 14, 3], ["N2", 13, 2.5, "+"],
    ["O2", 16, 2], ["O2", 15, 2.5, "+"], ["O2", 17, 1.5, "-"], ["O2", 18, 1, "2-"], ["F2", 18, 1], ["NO", 15, 2.5], ["CO", 14, 3], ["CN", 14, 3, "-"], ["NO", 14, 3, "+"], ["Ne2", 20, 0]];
  const PARA = { "H2+": true, "He2+": true, "B2": true, "N2+": true, "O2": true, "O2+": true, "O2-": true, "NO": true };
  // llenado del diagrama de OM: σ1s σ*1s σ2s σ*2s, después π2p y σ2p (en ese orden hasta 14 electrones, al revés desde 15)
  const fillMO = n => {
    const lv = [["s", 1, 1], ["s*", 1, -1], ["s", 1, 1], ["s*", 1, -1]].concat(n <= 14 ? [["p", 2, 1], ["sp", 1, 1]] : [["sp", 1, 1], ["p", 2, 1]]).concat([["p*", 2, -1], ["sp*", 1, -1]]);
    let left = n, bond = 0, unp = 0;
    for (const [, deg, sgn] of lv) {
      const k = Math.min(left, 2 * deg); left -= k; bond += sgn * k;
      const box = Array(deg).fill(0); for (let e = 0; e < k; e++) box[e % deg]++;
      unp += box.filter(x => x === 1).length;
    }
    return { bo: bond / 2, unp };
  };
  T["qg-orden-enlace-num"] = {
    type: "numeric", concepts: ["qg-tom"], difficulty: 3,
    generate(r) {
      const [f, n, bo, q] = r.pick(DIAT);
      return {
        prompt: `Según la teoría de orbitales moleculares, ¿cuál es el orden de enlace de $${Q.tex(f, q)}$? (tiene ${n} electrones en total)`,
        answer: bo,
        solution: [`Se llenan los [[qg-tom|orbitales moleculares]] en orden: $\\sigma_{1s}, \\sigma^*_{1s}, \\sigma_{2s}, \\sigma^*_{2s}$, ${n <= 14 ? "$\\pi_{2p}, \\sigma_{2p}$ (hasta el N₂ el π queda más abajo)" : "$\\sigma_{2p}, \\pi_{2p}$ (del O₂ en adelante)"}, $\\pi^*_{2p}, \\sigma^*_{2p}$.`,
          `Orden de enlace $= \\frac{\\text{enlazantes} - \\text{antienlazantes}}{2} = ${String(bo).replace(".", ",")}$.${bo === 0 ? " Con orden cero, la molécula no es estable." : ""}`],
        // verificación: llenando el diagrama electrón por electrón
        verify: { kind: "value", fn: () => fillMO(n).bo }
      };
    }
  };
  T["qg-magnetismo-vf"] = {
    type: "tf", concepts: ["qg-tom"], difficulty: 2,
    generate(r) {
      const [f, n, , q] = r.pick(DIAT.filter(d => d[2] > 0)), key = f + (q || ""), para = !!PARA[key], ask = r.bool();
      return {
        prompt: `<b>Verdadero o falso:</b> $${Q.tex(f, q)}$ es ${ask ? "paramagnética" : "diamagnética"} (${n} electrones).`,
        answer: ask === para,
        explanation: `${para ? "Le quedan electrones desapareados" : "Todos sus electrones están apareados"} en los [[qg-tom|orbitales moleculares]], así que es **${para ? "paramagnética" : "diamagnética"}**.${f === "O2" && !q ? " El O₂ líquido queda colgado entre los polos de un imán: la estructura de Lewis, con todos los electrones apareados, no lo explica; la TOM sí (dos electrones solos en los π*)." : ""}`,
        solution: [`Paramagnética: tiene electrones desapareados (la atrae un imán). Diamagnética: todos apareados.`],
        // verificación: llenando el diagrama con la regla de Hund en los orbitales degenerados
        verify: { kind: "truth", fn: () => ask === (fillMO(n).unp > 0) }
      };
    }
  };

  const cards = {
    "qg-lewis": {
      title: "Estructuras de Lewis, octeto y carga formal", aliases: ["estructura de Lewis", "estructuras de Lewis", "regla del octeto", "carga formal", "electrones de valencia", "par libre", "pares libres", "estructuras resonantes", "octeto expandido"], concepts: ["qg-lewis"],
      summary: "Se reparten los electrones de valencia en enlaces y pares libres para que cada átomo llegue al octeto (el H, a dos). Carga formal = V − 2P − B. La mejor estructura tiene las cargas formales más chicas, y las negativas en los átomos más electronegativos.",
      def: [R`Los **electrones de valencia** son los de la capa externa: el número de grupo en los grupos 1 y 2, y el grupo menos 10 en los del 13 al 18. En una **estructura de Lewis** se reparten entre **enlaces** (pares compartidos: simple, doble o triple) y **pares libres**.`,
        R`**Regla del octeto:** cada átomo tiende a quedar rodeado de ocho electrones (el H, de dos). Excepciones: octeto incompleto (B, Be), número impar de electrones (NO), y **octeto expandido** en átomos del período 3 en adelante (P en PCl₅, S en SF₆), que pueden usar más orbitales.`,
        R`**Carga formal:** $CF = V - 2P - B$, con $V$ los electrones de valencia del átomo, $P$ sus pares libres y $B$ sus enlaces (sumando órdenes). La suma de las cargas formales es la carga de la especie.`,
        R`Cuando hay varias estructuras igual de buenas que solo difieren en dónde está un doble enlace (CO₃²⁻, O₃), la real es un promedio de todas: se llaman **estructuras resonantes**, y los enlaces quedan todos iguales, intermedios.`],
      idea: [R`La carga formal es una contabilidad: hace de cuenta que cada enlace se reparte mitad y mitad, aunque en realidad el más electronegativo se lleva más. No es la carga real del átomo, pero sirve para elegir entre estructuras: la naturaleza prefiere separar poca carga.`],
      demo: [R`**Paso 1 (qué electrones son del átomo).** En la contabilidad de Lewis, los pares libres son enteros del átomo ($2P$ electrones) y de cada enlace se queda con uno de los dos electrones de cada par compartido ($B$ electrones).`,
        R`**Paso 2 (comparar).** Aislado, el átomo tenía $V$ electrones de valencia y era neutro. Si en la estructura "tiene" $2P + B$, le faltan $V - (2P + B)$ electrones: esa es su carga, $CF = V - 2P - B$.`,
        R`**Paso 3 (la suma).** Sumando sobre todos los átomos: $\sum V - \sum(2P + B)$. El primer término son todos los electrones de valencia de los átomos neutros; el segundo, los electrones de la estructura (cada enlace contado una vez por cada extremo da los dos electrones del par). La diferencia es la carga de la especie. $\blacksquare$`],
      examples: [{ q: R`$\mathrm{CO}$: C≡O, un par libre en cada átomo.`, steps: [R`C: $4 - 2 - 3 = -1$. O: $6 - 2 - 3 = +1$. Suma 0, como debe.`] }],
      see: ["qg-trpecv", "qg-enlace-polaridad"]
    },
    "qg-enlace-polaridad": {
      title: "Tipos de enlace y polaridad", aliases: ["enlace iónico", "enlace covalente", "enlace metálico", "enlace covalente polar", "carácter iónico parcial", "molécula polar", "molécula no polar", "dipolo de enlace"], concepts: ["qg-enlace-polaridad"],
      summary: "Iónico: un metal le cede electrones a un no metal (Δχ > 1,7). Covalente: se comparten; es polar si Δχ ≠ 0. Metálico: cationes en un mar de electrones. Una molécula es polar si la suma de sus dipolos de enlace no se anula, y eso depende de la geometría.",
      def: [R`- **Enlace iónico:** un átomo de baja energía de ionización (metal) cede electrones a uno de alta afinidad (no metal); los iones se atraen. Forma redes cristalinas de alto punto de fusión, que conducen fundidas o disueltas.
- **Enlace covalente:** dos no metales comparten pares de electrones. Si la diferencia de electronegatividad $\Delta\chi$ es nula, es **no polar**; si no, **polar**, con una carga parcial $\delta^-$ en el más electronegativo.
- **Enlace metálico:** los átomos de un metal ceden sus electrones de valencia a un "mar" común; explica la conductividad y el brillo.`,
        R`Como guía: $\Delta\chi > 1{,}7$ iónico, entre 0,4 y 1,7 covalente polar, menos de 0,4 prácticamente no polar. Pauling estimó el **carácter iónico parcial** como $1 - e^{-\Delta\chi^2/4}$.`,
        R`Cada enlace polar es un pequeño **dipolo**. La molécula es **polar** si la suma vectorial de esos dipolos no es cero (momento dipolar, ver [[f2a-campo-electrico|dipolos]]): CO₂ es lineal y sus dipolos se cancelan; H₂O es angular y no.`],
      idea: [R`No hay una frontera tajante: entre el enlace covalente puro (H₂) y el iónico (CsF) hay un continuo, según cuánto se corran los electrones hacia un lado. La polaridad de la molécula es lo que decide si se disuelve en agua, si tiene punto de ebullición alto o si la desvía una varilla cargada.`],
      examples: [{ q: R`¿CCl₄ es polar?`, steps: [R`Cada C–Cl es polar ($\Delta\chi = 0{,}61$), pero los cuatro apuntan a los vértices de un tetraedro y se cancelan: no polar.`] }],
      see: ["qg-periodicidad", "qg-trpecv", "qg-lewis"]
    },
    "qg-trpecv": {
      title: "Geometría molecular: TRPECV", aliases: ["TRPECV", "VSEPR", "geometría molecular", "repulsión de pares electrónicos", "número estérico", "dominios electrónicos"], concepts: ["qg-trpecv"],
      summary: "Los pares de electrones alrededor del átomo central (enlaces y pares libres) se alejan lo más posible: 2 lineal, 3 trigonal plana, 4 tetraédrica, 5 bipiramidal trigonal, 6 octaédrica. La forma de la molécula se nombra solo por los átomos.",
      def: [R`**Teoría de repulsión de pares de electrones de la capa de valencia (TRPECV):** se cuentan los **dominios** del átomo central: cada átomo unido (con enlace simple, doble o triple) es uno, y cada par libre es otro. El número de dominios fija la distribución: 2 lineal (180°), 3 trigonal plana (120°), 4 tetraédrica (109,5°), 5 bipiramidal trigonal (90° y 120°), 6 octaédrica (90°).`,
        R`La **geometría molecular** se describe por la posición de los átomos. Con pares libres cambia el nombre: 4 dominios con 1 par libre es **piramidal trigonal** (NH₃) y con 2, **angular** (H₂O); con 5 dominios: balancín (1 libre), forma de T (2), lineal (3); con 6: piramidal cuadrada (1) y plana cuadrada (2).`,
        R`Los pares libres repelen más que los enlaces: cierran los ángulos (104,5° en el agua) y, en la bipirámide, se ubican en el ecuador.`],
      idea: [R`Es una regla de "cada uno en su rincón": los grupos de electrones se repelen y se reparten la esfera alrededor del central lo más lejos posible. Con dos, quedan en polos opuestos; con tres, en un triángulo; con cuatro, en los vértices de un tetraedro (no en un cuadrado, que deja ángulos de 90°).`],
      demo: [R`**Paso 1 (dos y tres dominios).** Si dos direcciones se repelen, el ángulo entre ellas tiene que ser el mayor posible: 180°. Con tres en un plano, repartir 360° en partes iguales da 120°.`,
        R`**Paso 2 (cuatro dominios).** En un cuadrado los ángulos serían de 90°. En el tetraedro los cuatro vectores unitarios suman cero (por simetría), así que $1 + 3\cos\theta = 0$ multiplicando la suma por uno de ellos: $\cos\theta = -\frac13$ y $\theta \approx 109{,}5°$, mayor que 90°.`,
        R`**Paso 3 (pares libres).** Un par libre está atado a un solo núcleo y ocupa más lugar cerca del central: empuja a los enlaces y achica sus ángulos. Por eso NH₃ tiene 107° y H₂O 104,5°, menos que 109,5°. $\blacksquare$`],
      examples: [{ q: R`$\mathrm{SF_4}$`, steps: [R`S: 6 electrones de valencia, 4 los usan los F: queda 1 par libre. Dominios: 5.`, R`Bipirámide trigonal con el par libre en el ecuador: forma de **balancín**.`] }],
      see: ["qg-lewis", "qg-enlace-polaridad", "qg-tom"]
    },
    "qg-tom": {
      title: "Enlace de valencia, hibridación y orbitales moleculares", aliases: ["teoría del enlace de valencia", "hibridación", "orbitales híbridos", "teoría de orbitales moleculares", "orden de enlace", "enlace sigma", "enlace pi", "orbital antienlazante"], concepts: ["qg-tom"],
      summary: "TEV: el enlace es el solapamiento de orbitales atómicos (σ de frente, π de costado); para explicar las geometrías se mezclan en híbridos sp, sp², sp³. TOM: los orbitales atómicos forman orbitales moleculares enlazantes y antienlazantes; orden de enlace = (enlazantes − antienlazantes)/2.",
      def: [R`**Teoría del enlace de valencia (TEV):** un enlace covalente es el solapamiento de dos orbitales, cada uno con un electrón. De frente da un enlace **σ**; de costado (entre orbitales p paralelos), un enlace **π**. Un enlace doble es σ + π, y uno triple, σ + 2π.`,
        R`**Hibridación:** para explicar geometrías como la del CH₄, se combinan orbitales del átomo central en **híbridos** equivalentes: $sp$ (2, lineal), $sp^2$ (3, trigonal plana), $sp^3$ (4, tetraédrica). La hibridación acompaña al número de dominios de la [[qg-trpecv|TRPECV]].`,
        R`**Teoría de orbitales moleculares (TOM):** los orbitales atómicos se combinan en orbitales de toda la molécula: **enlazantes** (de menor energía) y **antienlazantes** (de mayor energía, con asterisco). Se llenan con las mismas reglas que en el átomo (Pauli y Hund). En las diatómicas del segundo período el orden es $\sigma_{1s}\,\sigma^*_{1s}\,\sigma_{2s}\,\sigma^*_{2s}$, después $\pi_{2p}$ y $\sigma_{2p}$ (invertidos del O₂ en adelante), y al final $\pi^*_{2p}\,\sigma^*_{2p}$. **Orden de enlace** $= \frac{\text{enlazantes} - \text{antienlazantes}}{2}$.`],
      idea: [R`La TEV es intuitiva y alcanza para las geometrías; la TOM es más precisa y explica cosas que Lewis no puede: que el O₂ es paramagnético (le quedan dos electrones solos en los π*), que existe el H₂⁺ con un solo electrón, o que el He₂ no existe (orden de enlace cero).`,
        R`A más orden de enlace, enlace más corto y más fuerte: N₂ (triple) es de las moléculas más difíciles de romper.`],
      examples: [{ q: R`$\mathrm{O_2^-}$ (17 electrones)`, steps: [R`Enlazantes: 2 + 2 + 2 + 4 = 10; antienlazantes: 2 + 2 + 3 = 7.`, R`Orden $= \frac{10 - 7}{2} = 1{,}5$, con un electrón desapareado.`] }],
      see: ["qg-trpecv", "qg-configuracion", "qg-lewis"]
    }
  };

  E.extendCourse("q101", {
    concepts: { "qg-lewis": { name: "Lewis y carga formal" }, "qg-enlace-polaridad": { name: "Tipos de enlace y polaridad" }, "qg-trpecv": { name: "Geometría (TRPECV)" }, "qg-tom": { name: "Orbitales moleculares" } },
    templates: T,
    units: [{
      id: "qg-enlace-u", order: 2, program: "Unidad 2", title: "Enlace químico y estructura molecular", icon: "atom",
      diagnostic: ["qg-valencia-num", "qg-geometria-mc", "qg-tipo-enlace-mc"],
      lessons: [
        { id: "qg-l-lewis", title: "Estructuras de Lewis", templates: ["qg-valencia-num", "qg-carga-formal-num"], theory: ["qg-lewis"],
          intro: R`Se reparten los electrones de valencia en enlaces y pares libres. $CF = V - 2P - B$.` },
        { id: "qg-l-tipo-enlace", title: "Tipos de enlace", templates: ["qg-tipo-enlace-mc"], theory: ["qg-enlace-polaridad"],
          intro: R`Iónico: metal y no metal. Covalente: no metales, polar si $\Delta\chi \neq 0$. Metálico: entre metales.` },
        { id: "qg-l-trpecv", title: "Geometría y polaridad", templates: ["qg-geometria-mc", "qg-polaridad-vf"], theory: ["qg-trpecv"],
          intro: R`Dominios = átomos unidos + pares libres: 2 lineal, 3 trigonal, 4 tetraédrica, 5 bipirámide, 6 octaedro.` },
        { id: "qg-l-tom", title: "Orbitales moleculares", templates: ["qg-orden-enlace-num", "qg-magnetismo-vf"], theory: ["qg-tom"],
          intro: R`Orden de enlace $= \frac{\text{enlazantes} - \text{antienlazantes}}{2}$. Con electrones desapareados, paramagnética.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 3 · SISTEMAS MATERIALES, REACCIONES QUÍMICAS Y ESTEQUIOMETRÍA
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, Q = E.qg, nf = Q.nf, dn = Q.dn;
  const T = {};
  const tx = f => Q.tex(f);
  const mmTex = f => dn(Q.mm(f), 2);
  // masa molar por el otro lector de fórmulas
  const mm2 = f => Object.entries(Q.count2(f)).reduce((s, [el, n]) => s + Q.A[el] * n, 0);

  // ---- reacciones balanceadas a mano: [fórmula, coeficiente] de reactivos y productos, y tipo ----
  const RX = [
    { r: [["CH4", 1], ["O2", 2]], p: [["CO2", 1], ["H2O", 2]], t: "combustión" },
    { r: [["C3H8", 1], ["O2", 5]], p: [["CO2", 3], ["H2O", 4]], t: "combustión" },
    { r: [["C2H6", 2], ["O2", 7]], p: [["CO2", 4], ["H2O", 6]], t: "combustión" },
    { r: [["C6H12O6", 1], ["O2", 6]], p: [["CO2", 6], ["H2O", 6]], t: "combustión" },
    { r: [["C2H6O", 1], ["O2", 3]], p: [["CO2", 2], ["H2O", 3]], t: "combustión" },
    { r: [["N2", 1], ["H2", 3]], p: [["NH3", 2]], t: "síntesis" },
    { r: [["H2", 2], ["O2", 1]], p: [["H2O", 2]], t: "síntesis" },
    { r: [["Fe", 4], ["O2", 3]], p: [["Fe2O3", 2]], t: "síntesis" },
    { r: [["Na", 2], ["Cl2", 1]], p: [["NaCl", 2]], t: "síntesis" },
    { r: [["Mg", 2], ["O2", 1]], p: [["MgO", 2]], t: "síntesis" },
    { r: [["P4", 1], ["O2", 5]], p: [["P4O10", 1]], t: "síntesis" },
    { r: [["CaCO3", 1]], p: [["CaO", 1], ["CO2", 1]], t: "descomposición" },
    { r: [["KClO3", 2]], p: [["KCl", 2], ["O2", 3]], t: "descomposición" },
    { r: [["H2O2", 2]], p: [["H2O", 2], ["O2", 1]], t: "descomposición" },
    { r: [["Al", 2], ["HCl", 6]], p: [["AlCl3", 2], ["H2", 3]], t: "sustitución simple" },
    { r: [["Zn", 1], ["HCl", 2]], p: [["ZnCl2", 1], ["H2", 1]], t: "sustitución simple" },
    { r: [["Mg", 1], ["HCl", 2]], p: [["MgCl2", 1], ["H2", 1]], t: "sustitución simple" },
    { r: [["Al", 2], ["Fe2O3", 1]], p: [["Al2O3", 1], ["Fe", 2]], t: "sustitución simple" },
    { r: [["NaOH", 2], ["H2SO4", 1]], p: [["Na2SO4", 1], ["H2O", 2]], t: "doble sustitución" },
    { r: [["AgNO3", 1], ["NaCl", 1]], p: [["AgCl", 1], ["NaNO3", 1]], t: "doble sustitución" },
    { r: [["Ca(OH)2", 1], ["HCl", 2]], p: [["CaCl2", 1], ["H2O", 2]], t: "doble sustitución" },
    { r: [["Pb(NO3)2", 1], ["KI", 2]], p: [["PbI2", 1], ["KNO3", 2]], t: "doble sustitución" },
    { r: [["BaCl2", 1], ["Na2SO4", 1]], p: [["BaSO4", 1], ["NaCl", 2]], t: "doble sustitución" },
    { r: [["Fe2O3", 1], ["CO", 3]], p: [["Fe", 2], ["CO2", 3]], t: "redox" },
    { r: [["NH3", 4], ["O2", 5]], p: [["NO", 4], ["H2O", 6]], t: "redox" },
    { r: [["Cu", 3], ["HNO3", 8]], p: [["Cu(NO3)2", 3], ["NO", 2], ["H2O", 4]], t: "redox" }
  ];
  Q.RX = RX;
  const side = (list, show) => list.map(([f, c]) => `${show && c > 1 ? c : ""}${tx(f)}`).join(" + ");
  const eqTex = (x, show = true) => `${side(x.r, show)} \\to ${side(x.p, show)}`;
  const balanced = x => Q.balance([...x.r.map(([f]) => ({ f, side: -1 })), ...x.p.map(([f]) => ({ f, side: 1 }))]);

  T["qg-masa-molar-num"] = {
    type: "numeric", concepts: ["qg-mol"], difficulty: 1,
    generate(r) {
      const f = r.pick(["H2O", "CO2", "NaCl", "H2SO4", "Ca(OH)2", "C6H12O6", "Fe2O3", "Al2(SO4)3", "Ca3(PO4)2", "KMnO4", "NH4NO3", "CuSO4", "Mg(OH)2", "Na2CO3", "C2H6O", "HNO3", "Pb(NO3)2", "(NH4)2SO4", "K2Cr2O7", "CaCO3"]);
      const c = Q.parse(f), ans = Q.mm(f);
      return {
        prompt: `¿Cuál es la masa molar (g/mol) de $${tx(f)}$? (Masas atómicas: ${Object.keys(c).map(el => `${el} $${dn(Q.A[el], 3)}$`).join(", ")})`,
        answer: ans, tolerance: 2e-3,
        solution: [`La [[qg-mol|masa molar]] es la suma de las masas atómicas, cada una por la cantidad de átomos de ese elemento en la fórmula (ojo con los subíndices que multiplican un paréntesis).`,
          `${Object.entries(c).map(([el, n]) => `${n > 1 ? n + "\\cdot" : ""}${dn(Q.A[el], 3)}`).map(x => `$${x}$`).join(" + ")} $\\approx ${dn(ans, 2)}$ g/mol.`],
        traps: f.includes("(") ? [{ value: Object.entries(Q.count2(f.replace(/\)(\d+)/, ")"))).reduce((s, [el, n]) => s + Q.A[el] * n, 0), msg: "El subíndice que está afuera del paréntesis multiplica a todo lo de adentro." }] : [],
        // verificación: contando los átomos con otro lector de fórmulas (que expande los paréntesis como texto)
        verify: { kind: "value", tol: 1e-9, fn: () => mm2(f) }
      };
    }
  };
  T["qg-mol-num"] = {
    type: "numeric", concepts: ["qg-mol"], difficulty: 2,
    generate(r) {
      const f = r.pick(["H2O", "CO2", "NH3", "CH4", "C6H12O6", "NaCl", "H2SO4", "O2", "C2H6O", "CaCO3"]), m = r.pick([1.5, 4.4, 9, 18, 25, 36, 50, 100, 2.5, 12]);
      const c = Q.parse(f), els = Object.keys(c), el = r.pick(els), ask = r.pick(["mol", "moleculas", "atomos"]);
      const n = m / Q.mm(f), ans = ask === "mol" ? n : ask === "moleculas" ? n * Q.NA / 1e23 : n * c[el] * Q.NA / 1e23;
      const unit = ask === "mol" ? "" : " (en unidades de $10^{23}$)";
      return {
        prompt: `Tenés $${dn(m, 1)}$ g de $${tx(f)}$. ¿Cuántos ${ask === "mol" ? "moles son" : ask === "moleculas" ? (f === "NaCl" || f === "CaCO3" ? "unidades fórmula" : "moléculas") + " hay" : `átomos de ${el} hay`}${unit}? ($N_A = 6{,}022\\times10^{23}$; masa molar $${mmTex(f)}$ g/mol)`,
        answer: ans, tolerance: 0.01,
        solution: [`Moles: $n = \\frac{m}{M} = \\frac{${dn(m, 1)}}{${mmTex(f)}} \\approx ${nf(n, 4)}$ mol.`,
          ask === "mol" ? `Son $${nf(n, 4)}$ mol.` : ask === "moleculas" ? `Partículas: $n\\,N_A \\approx ${nf(n * Q.NA, 4)}$.` : `Cada unidad tiene ${c[el]} átomo${c[el] > 1 ? "s" : ""} de ${el}: $${c[el]}\\,n\\,N_A \\approx ${nf(n * c[el] * Q.NA, 4)}$.`,
          `El [[qg-mol|mol]] es un "paquete" de $N_A$ partículas; la masa molar es lo que pesa ese paquete.`],
        traps: ask === "atomos" && c[el] > 1 ? [{ value: n * Q.NA / 1e23, msg: `Esas son las unidades de $${tx(f)}$; cada una tiene ${c[el]} átomos de ${el}.` }] : [],
        // verificación: se arma la muestra como una lista de "unidades" de 10²⁰ partículas, con la masa de cada una en uma
        verify: { kind: "zero", tol: 1e-4, fn: x => {
          const uma = 1.66054e-24, massOne = mm2(f) * uma, units = m / massOne;   // partículas
          const got = ask === "mol" ? units / Q.NA : ask === "moleculas" ? units / 1e23 : units * Q.count2(f)[el] / 1e23;
          return [got / x - 1];
        }, scale: 1 }
      };
    }
  };

  T["qg-balanceo-num"] = {
    type: "numeric", concepts: ["qg-balanceo"], difficulty: 2,
    generate(r) {
      const x = r.pick(RX), all = [...x.r, ...x.p], k = r.int(0, all.length - 1), [f, c] = all[k];
      if (all.every(([, cc]) => cc === 1)) return null;
      return {
        prompt: `Balanceá con los coeficientes enteros más chicos: $${eqTex(x, false)}$. ¿Qué coeficiente lleva $${tx(f)}$?`,
        answer: c,
        solution: [`Se [[qg-balanceo|balancea]] por tanteo, empezando por los elementos que aparecen en una sola sustancia de cada lado y dejando para el final los que están solos (O₂, H₂, metales).`,
          `Queda $${eqTex(x)}$: el coeficiente de $${tx(f)}$ es ${c}.`],
        // verificación: el núcleo de la matriz de elementos, por eliminación de Gauss con fracciones
        verify: { kind: "value", fn: () => balanced(x)[k] }
      };
    }
  };
  T["qg-tipo-reaccion-mc"] = {
    type: "mc", concepts: ["qg-balanceo"], difficulty: 1,
    generate(r) {
      const x = r.pick(RX.filter(y => y.t !== "redox")), mcq = H.mc(r, x.t, ["síntesis", "descomposición", "sustitución simple", "doble sustitución", "combustión"].filter(t => t !== x.t), { text: true });
      return {
        prompt: `¿Qué tipo de reacción es $${eqTex(x)}$?`,
        options: mcq.options, correct: mcq.correct,
        solution: [`[[qg-balanceo|Tipos de reacción]]: síntesis (A + B → AB), descomposición (AB → A + B), sustitución simple (A + BC → AC + B), doble sustitución (AB + CD → AD + CB) y combustión (con O₂, da CO₂ y H₂O).`,
          `Esta es de **${x.t}**.`],
        // verificación: se clasifica mirando cuántas sustancias hay de cada lado y cuáles son elementos
        verify: { kind: "truth", target: true, fn: () => {
          const isEl = f => Object.keys(Q.count2(f)).length === 1, R0 = x.r.map(y => y[0]), P0 = x.p.map(y => y[0]);
          let t;
          if (R0.includes("O2") && P0.includes("CO2") && P0.includes("H2O")) t = "combustión";
          else if (P0.length === 1 && R0.length >= 2) t = "síntesis";
          else if (R0.length === 1 && P0.length >= 2) t = "descomposición";
          else if (R0.some(isEl) && P0.some(isEl)) t = "sustitución simple";
          else if (R0.length === 2 && P0.length === 2 && !R0.some(isEl) && !P0.some(isEl)) t = "doble sustitución";
          return t === x.t;
        } }
      };
    }
  };

  // ---- reactivo limitante ----
  T["qg-limitante-num"] = {
    type: "numeric", concepts: ["qg-estequiometria"], difficulty: 3,
    generate(r) {
      const x = r.pick(RX.filter(y => y.r.length === 2)), [[fa, ca], [fb, cb]] = x.r, k = r.int(0, x.p.length - 1), [fp, cp] = x.p[k];
      const ma = +(r.int(10, 200) / 5).toFixed(1), ratio = r.pick([0.5, 0.7, 0.85, 1.2, 1.5, 2]);
      const na0 = ma / Q.mm(fa), mb = +((na0 * cb / ca) * ratio * Q.mm(fb)).toFixed(1), nb0 = mb / Q.mm(fb);
      const xi = Math.min(na0 / ca, nb0 / cb), lim = na0 / ca < nb0 / cb ? fa : fb, exc = lim === fa ? fb : fa, ask = r.pick(["prod", "exceso"]);
      const prod = xi * cp * Q.mm(fp), left = (lim === fa ? nb0 - xi * cb : na0 - xi * ca) * Q.mm(exc);
      return {
        prompt: `Se mezclan $${dn(ma, 1)}$ g de $${tx(fa)}$ con $${dn(mb, 1)}$ g de $${tx(fb)}$, que reaccionan según $${eqTex(x)}$. ${ask === "prod" ? `¿Cuántos gramos de $${tx(fp)}$ se forman como máximo?` : `¿Cuántos gramos del reactivo en exceso sobran?`} (Masas molares en g/mol: ${[fa, fb, fp].filter((v, i, a) => a.indexOf(v) === i).map(f => `$${tx(f)}$: $${dn(Q.mm(f), 2)}$`).join(", ")})`,
        answer: ask === "prod" ? prod : left, tolerance: 0.01,
        solution: [`Moles: $${tx(fa)}$: $${nf(na0, 4)}$; $${tx(fb)}$: $${nf(nb0, 4)}$.`,
          `Dividiendo por los coeficientes: $\\frac{${nf(na0, 4)}}{${ca}} \\approx ${nf(na0 / ca, 4)}$ y $\\frac{${nf(nb0, 4)}}{${cb}} \\approx ${nf(nb0 / cb, 4)}$. El menor marca el [[qg-estequiometria|reactivo limitante]]: $${tx(lim)}$.`,
          ask === "prod" ? `Se forman $${cp}\\cdot${nf(xi, 4)} \\approx ${nf(xi * cp, 4)}$ mol de $${tx(fp)}$, o sea $${dn(prod, 2)}$ g.` : `Del $${tx(exc)}$ se gastan $${nf(xi * (exc === fa ? ca : cb), 4)}$ mol y sobran $${nf(left / Q.mm(exc), 4)}$ mol: $${dn(left, 2)}$ g.`],
        traps: ask === "prod" ? [{ value: (lim === fa ? nb0 / cb : na0 / ca) * cp * Q.mm(fp), msg: "Calculaste con el reactivo en exceso: el que limita es el que se termina primero." }] : [],
        // verificación: la reacción se simula en 200 000 pasitos, hasta que se acaba uno de los reactivos
        verify: { kind: "zero", tol: 1e-4, fn: v => {
          let a = na0, b = nb0, p = 0;
          const N = 200000, d = Math.max(na0 / ca, nb0 / cb) / N;
          for (let i = 0; i < N && a > 1e-15 && b > 1e-15; i++) { const s = Math.min(d, a / ca, b / cb); a -= s * ca; b -= s * cb; p += s * cp; }
          const got = ask === "prod" ? p * Q.mm(fp) : (lim === fa ? b * Q.mm(fb) : a * Q.mm(fa));
          return [(got - v) / Math.max(v, 1e-9)];
        } }
      };
    }
  };
  T["qg-rendimiento-num"] = {
    type: "numeric", concepts: ["qg-estequiometria"], difficulty: 2,
    generate(r) {
      const x = r.pick(RX.filter(y => y.t !== "combustión")), [fa, ca] = x.r[0], [fp, cp] = x.p[0], ask = r.pick(["rend", "real", "pureza"]);
      const ma = r.int(20, 300), yld = r.int(55, 95), pur = r.int(60, 98);
      const teo = ma / Q.mm(fa) / ca * cp * Q.mm(fp), real = +(teo * yld / 100).toFixed(2);
      const ans = ask === "rend" ? 100 * real / teo : ask === "real" ? teo * yld / 100 : pur;
      const mImpure = +(ma / (pur / 100)).toFixed(1), mFromImp = mImpure * pur / 100 / Q.mm(fa) / ca * cp * Q.mm(fp);
      return {
        prompt: ask === "rend" ? `En la reacción $${eqTex(x)}$, a partir de $${ma}$ g de $${tx(fa)}$ (con el resto de los reactivos en exceso) se obtuvieron $${dn(real, 2)}$ g de $${tx(fp)}$. ¿Cuál fue el rendimiento (%)?`
          : ask === "real" ? `En la reacción $${eqTex(x)}$, se parte de $${ma}$ g de $${tx(fa)}$ (lo demás en exceso) y el rendimiento es del $${yld}\\,\\%$. ¿Cuántos gramos de $${tx(fp)}$ se obtienen?`
          : `Una muestra de $${dn(mImpure, 1)}$ g que contiene $${tx(fa)}$ (las impurezas no reaccionan) da, por $${eqTex(x)}$ con rendimiento total, $${dn(mFromImp, 2)}$ g de $${tx(fp)}$. ¿Qué pureza (% en masa) tiene la muestra?`,
        answer: ask === "pureza" ? 100 * (mFromImp / Q.mm(fp) / cp * ca * Q.mm(fa)) / mImpure : ans, tolerance: 0.01,
        solution: [`Masa teórica: $${ma}$ g de $${tx(fa)}$ son $${nf(ma / Q.mm(fa), 4)}$ mol; por la [[qg-estequiometria|estequiometría]] ${ca}:${cp} dan $${nf(ma / Q.mm(fa) / ca * cp, 4)}$ mol de $${tx(fp)}$, o sea $${dn(teo, 2)}$ g.`,
          ask === "rend" ? `Rendimiento $= \\frac{\\text{real}}{\\text{teórico}}\\cdot100 = \\frac{${dn(real, 2)}}{${dn(teo, 2)}}\\cdot100 \\approx ${dn(ans, 1)}\\,\\%$.` : ask === "real" ? `Real $= ${dn(teo, 2)}\\cdot${dn(yld / 100, 2)} \\approx ${dn(ans, 2)}$ g.`
            : `Al revés: de $${dn(mFromImp, 2)}$ g de producto salen los gramos de $${tx(fa)}$ puro que había; dividido por los $${dn(mImpure, 1)}$ g de muestra da la pureza.`],
        // verificación: con la respuesta se rearma la cuenta en el otro sentido (de producto a reactivo) y tiene que cerrar
        verify: { kind: "zero", tol: 1e-6, fn: v => {
          const back = mp => mp / Q.mm(fp) / cp * ca * Q.mm(fa);   // gramos de reactivo para obtener mp de producto
          if (ask === "rend") return [back(real) / (ma * v / 100) - 1];
          if (ask === "real") return [back(v) / (ma * yld / 100) - 1];
          return [back(mFromImp) / (mImpure * v / 100) - 1];
        } }
      };
    }
  };

  // ---- fórmula empírica y molecular ----
  const EMP = [["CH2O", "C6H12O6"], ["CH", "C6H6"], ["CH2", "C4H8"], ["NO2", "N2O4"], ["P2O5", "P4O10"], ["C2H5", "C4H10"], ["CH3", "C2H6"], ["C3H4O3", "C6H8O6"], ["HO", "H2O2"], ["CH4N2O", "CH4N2O"], ["C2H3O", "C4H6O2"], ["C5H4", "C10H8"]];
  T["qg-empirica-num"] = {
    type: "numeric", concepts: ["qg-formula"], difficulty: 3,
    generate(r) {
      const [emp, mol] = r.pick(EMP), c = Q.parse(mol), els = Object.keys(c), el = r.pick(els), M = Q.mm(mol), ask = r.pick(["emp", "mol"]);
      const pct = els.map(e => [e, 100 * c[e] * Q.A[e] / M]);
      const ans = ask === "emp" ? Q.parse(emp)[el] : c[el];
      const ratio = els.map(e => (100 * c[e] * Q.A[e] / M) / Q.A[e]), mn = Math.min(...ratio);
      return {
        prompt: `Un compuesto tiene ${pct.map(([e, p]) => `$${dn(p, 2)}\\,\\%$ de ${e}`).join(", ")}${ask === "mol" ? ` y su masa molar es $${dn(M, 1)}$ g/mol` : ""}. ¿Cuántos átomos de ${el} hay en su fórmula ${ask === "emp" ? "empírica" : "molecular"}? (Masas atómicas: ${els.map(e => `${e} $${dn(Q.A[e], 3)}$`).join(", ")})`,
        answer: ans,
        solution: [`En 100 g hay ${pct.map(([e, p]) => `$${dn(p, 2)}$ g de ${e}`).join(", ")}. En moles: ${els.map((e, i) => `${e}: $${dn(ratio[i], 3)}$`).join(", ")}.`,
          `Dividiendo por el menor ($${dn(mn, 3)}$): ${els.map((e, i) => `${e}: $${dn(ratio[i] / mn, 2)}$`).join(", ")}. Llevando a enteros, la [[qg-formula|fórmula empírica]] es $${tx(emp)}$.`,
          ask === "mol" ? `Su masa es $${dn(Q.mm(emp), 2)}$ g/mol; $\\frac{${dn(M, 1)}}{${dn(Q.mm(emp), 2)}} = ${Math.round(M / Q.mm(emp))}$, así que la molecular es $${tx(mol)}$: ${ans} átomos de ${el}.` : `Tiene ${ans} átomo${ans > 1 ? "s" : ""} de ${el}.`],
        // verificación: la fórmula de la respuesta tiene que reproducir los porcentajes (y la masa molar, si se pidió la molecular)
        verify: { kind: "truth", target: true, fn: () => {
          const f = ask === "emp" ? emp : mol, cc = Q.count2(f), M2 = mm2(f);
          const okPct = els.every(e => Math.abs(100 * cc[e] * Q.A[e] / M2 - 100 * c[e] * Q.A[e] / M) < 1e-6);
          // la empírica es la más chica: sus subíndices no tienen divisor común
          const g = Object.values(Q.count2(emp)).reduce((a, b) => { while (b) [a, b] = [b, a % b]; return a; });
          return okPct && cc[el] === ans && g === 1 && (ask === "emp" || Math.abs(M2 - M) < 1e-9);
        } }
      };
    }
  };

  // ---- sistemas materiales: sustancia simple o compuesta ----
  T["qg-sustancia-vf"] = {
    type: "tf", concepts: ["qg-sistemas"], difficulty: 1,
    generate(r) {
      const f = r.pick(["O2", "O3", "H2O", "N2", "NaCl", "Fe", "CO2", "P4", "S8", "CH4", "Cl2", "C", "H2O2", "Cu", "NH3"]), simple = Object.keys(Q.parse(f)).length === 1, ask = r.bool();
      return {
        prompt: `<b>Verdadero o falso:</b> $${tx(f)}$ es una sustancia ${ask ? "simple" : "compuesta"}.`,
        answer: ask === simple,
        explanation: simple ? `Está formada por un solo elemento: es una **sustancia simple**${["O3", "P4", "S8"].includes(f) ? " (una de las formas alotrópicas de ese elemento)" : ""}.` : `Tiene más de un elemento combinado en proporción fija: es una **sustancia compuesta**.`,
        solution: [`[[qg-sistemas|Sustancia simple]]: un solo elemento (aunque forme moléculas, como O₂). Compuesta: dos o más elementos combinados químicamente.`],
        // verificación: cuántos elementos distintos cuenta el otro lector de fórmulas
        verify: { kind: "truth", fn: () => ask === (Object.keys(Q.count2(f)).length === 1) }
      };
    }
  };

  // ---- nomenclatura ----
  const NOM = [
    ["Na2O", "óxido de sodio"], ["CaO", "óxido de calcio"], ["Fe2O3", "óxido de hierro(III)"], ["FeO", "óxido de hierro(II)"], ["Cu2O", "óxido de cobre(I)"], ["CuO", "óxido de cobre(II)"],
    ["CO2", "dióxido de carbono"], ["SO3", "trióxido de azufre"], ["SO2", "dióxido de azufre"], ["NaOH", "hidróxido de sodio"], ["Ca(OH)2", "hidróxido de calcio"],
    ["Fe(OH)3", "hidróxido de hierro(III)"], ["Al(OH)3", "hidróxido de aluminio"], ["HCl", "ácido clorhídrico"], ["H2SO4", "ácido sulfúrico"], ["H2SO3", "ácido sulfuroso"],
    ["HNO3", "ácido nítrico"], ["HNO2", "ácido nitroso"], ["H3PO4", "ácido fosfórico"], ["H2CO3", "ácido carbónico"], ["HClO4", "ácido perclórico"], ["HClO", "ácido hipocloroso"],
    ["NaCl", "cloruro de sodio"], ["KNO3", "nitrato de potasio"], ["CaCO3", "carbonato de calcio"], ["Na2SO4", "sulfato de sodio"], ["CuSO4", "sulfato de cobre(II)"],
    ["FeCl3", "cloruro de hierro(III)"], ["NaNO2", "nitrito de sodio"], ["K2SO3", "sulfito de potasio"], ["KClO3", "clorato de potasio"], ["Mg3(PO4)2", "fosfato de magnesio"]
  ];
  const FIXED = { Na: 1, K: 1, Ca: 2, Mg: 2, Al: 3, H: 1, O: -2 };
  // estado de oxidación del elemento "característico" según el nombre (sufijo o numeral) y según la fórmula
  const ROM = { I: 1, II: 2, III: 3, IV: 4 };
  const SUF = { S: { oso: 4, ico: 6, ito: 4, ato: 6 }, N: { oso: 3, ico: 5, ito: 3, ato: 5 }, P: { ico: 5, ato: 5 }, C: { ico: 4, ato: 4 }, Cl: { hipo: 1, oso: 3, ico: 5, per: 7, ito: 3, ato: 5, uro: -1, hídrico: -1 } };
  const checkName = (f, name) => {
    const c = Q.count2(f), els = Object.keys(c), st = {};
    const rom = /\((I{1,3}|IV)\)/.exec(name);
    for (const el of els) if (FIXED[el] != null) st[el] = FIXED[el];
    const metal = els.find(el => ["Fe", "Cu"].includes(el));
    if (metal) { if (!rom) return false; st[metal] = ROM[rom[1]]; }
    const unk = els.filter(el => st[el] == null);
    if (unk.length > 1) return false;
    if (unk.length === 1) st[unk[0]] = -els.filter(el => el !== unk[0]).reduce((s, el) => s + st[el] * c[el], 0) / c[unk[0]];
    if (els.reduce((s, el) => s + st[el] * c[el], 0) !== 0) return false;
    const cen = unk[0];
    if (!cen || cen === "O") return true;
    const map = SUF[cen];
    if (!map) return true;
    const key = /per/.test(name) ? "per" : /hipo/.test(name) ? "hipo" : /hídrico|uro\b/.test(name) ? (name.includes("hídrico") ? "hídrico" : "uro") : /(oso|ito)\b/.test(name) ? "oso" : /(ico|ato)\b/.test(name) ? "ico" : null;
    if (/dióxido|trióxido|monóxido/.test(name)) { const pref = { mon: 1, di: 2, tri: 3 }[/^(mon|di|tri)/.exec(name)[1]]; return c.O === pref; }
    return key != null && map[key] === st[cen];
  };
  T["qg-nomenclatura-match"] = {
    type: "match", concepts: ["qg-sistemas"], difficulty: 2,
    generate(r) {
      const ps = r.sample(NOM, 4);
      return {
        prompt: `Uní cada fórmula con su nombre.`,
        pairs: ps.map(([f, n]) => [{ tex: tx(f) }, { tex: `\\text{${n}}` }]),
        solution: [`[[qg-sistemas|Nomenclatura]]: los óxidos y los hidróxidos llevan el nombre del metal (con el número de oxidación entre paréntesis si tiene más de uno). En los oxoácidos, -oso es el estado menor y -ico el mayor; sus sales terminan en -ito y -ato.`,
          ...ps.map(([f, n]) => `$${tx(f)}$: ${n}.`)],
        // verificación: el número de oxidación que sale de la fórmula (con O −2, H +1 y los metales de valencia fija)
        // coincide con el que indica el nombre (sufijo, prefijo o numeral romano)
        verify: { kind: "truth", target: true, fn: () => ps.every(([f, n]) => checkName(f, n)) }
      };
    }
  };

  const cards = {
    "qg-sistemas": {
      title: "Sistemas materiales, sustancias y nomenclatura", aliases: ["sistema material", "sistemas materiales", "sustancia simple", "sustancia compuesta", "mezcla homogénea", "mezcla heterogénea", "nomenclatura", "número de oxidación", "oxoácido", "hidróxido"], concepts: ["qg-sistemas"],
      summary: "Un sistema homogéneo tiene una sola fase; uno heterogéneo, varias. Las sustancias puras pueden ser simples (un elemento) o compuestas. En nomenclatura, el número de oxidación se lee de la fórmula: la suma da la carga, con O −2 y H +1.",
      def: [R`Un **sistema material** es la porción de materia que se estudia. Es **homogéneo** si tiene las mismas propiedades en todos sus puntos (una sola **fase**) y **heterogéneo** si tiene varias fases separadas por superficies. Cada sustancia distinta es un **componente**.`,
        R`Una **sustancia pura** tiene composición fija: **simple** si tiene un solo elemento (O₂, Fe, O₃) y **compuesta** si combina varios (H₂O, NaCl). Una **mezcla** tiene composición variable y se separa por métodos físicos (filtración, decantación, destilación); un compuesto solo se separa en sus elementos por métodos químicos.`,
        R`**Número de oxidación:** la carga que tendría cada átomo si los enlaces fueran iónicos. Reglas: O es −2 (salvo en peróxidos), H es +1 (salvo en hidruros metálicos), los alcalinos +1 y los alcalinotérreos +2; la suma da la carga de la especie.`,
        R`**Nomenclatura** (más usada en el curso):
- óxidos e hidróxidos: «óxido de hierro(III)», «hidróxido de calcio»; los de no metales con prefijos («dióxido de carbono»);
- hidrácidos: «ácido clorhídrico»; oxoácidos: -oso (menor número de oxidación) e -ico (mayor), con hipo- y per- en los halógenos;
- sales: el anión del ácido cambia -hídrico → -uro, -oso → -ito, -ico → -ato («sulfato de cobre(II)»).`],
      idea: [R`La clave para nombrar es encontrar el número de oxidación del elemento central: con O = −2 y H = +1, sale de que la suma dé cero. En HNO₃: $1 + x - 6 = 0$, así que N es +5, el mayor del nitrógeno: ácido nítr**ico**, y su sal es nitr**ato**.`],
      examples: [{ q: R`Nombrá $\mathrm{KClO_3}$.`, steps: [R`$1 + x - 6 = 0$: Cl es +5. En el cloro: +1 hipo-oso, +3 -oso, +5 -ico, +7 per-ico.`, R`Ácido clórico → sal: **clorato de potasio**.`] }],
      see: ["qg-balanceo", "qg-mol"]
    },
    "qg-mol": {
      title: "Mol, masa molar y número de Avogadro", aliases: ["mol", "moles", "masa molar", "número de Avogadro", "constante de Avogadro", "cantidad de sustancia", "unidad fórmula"], concepts: ["qg-mol"],
      summary: "Un mol son N_A = 6,022 × 10²³ partículas. La masa molar M (g/mol) es la masa de un mol y numéricamente igual a la masa de la fórmula en u. n = m/M; partículas = n·N_A.",
      def: [R`El **mol** es la unidad de cantidad de sustancia: contiene $N_A = 6{,}022\times10^{23}$ entidades (átomos, moléculas, iones o unidades fórmula). $N_A$ es el **número de Avogadro**.`,
        R`La **masa molar** $M$ es la masa de un mol, en g/mol. Se calcula sumando las [[qg-atomo|masas atómicas]] de la fórmula: $M(\mathrm{H_2O}) = 2\cdot1{,}008 + 15{,}999 = 18{,}015$ g/mol.`,
        R`Conversiones: $n = \frac mM$, $N = n\,N_A$. Para contar átomos de un elemento, se multiplica por su subíndice en la fórmula.`],
      idea: [R`El mol es una "docena" gigante, elegida para que la masa en gramos coincida con la masa atómica en u. Así se puede contar moléculas pesando: 18 g de agua tienen un mol de moléculas, $6\times10^{23}$, aunque nadie las pueda contar de a una.`],
      demo: [R`**Paso 1 (definición de u).** $1$ u $= \frac1{12}$ de la masa de un átomo de $^{12}$C, y $N_A$ es la cantidad de átomos en 12 g de $^{12}$C. Entonces $N_A$ átomos de masa 12 u pesan 12 g: $N_A\cdot1\ \mathrm u = 1$ g.`,
        R`**Paso 2 (una molécula cualquiera).** Si una molécula pesa $m_0 = M_r$ u (la suma de las masas atómicas), un mol de ellas pesa $N_A\,M_r$ u $= M_r$ g.`,
        R`**Paso 3 (conclusión).** La masa molar en g/mol tiene el mismo número que la masa de la fórmula en u, y $n = \frac{m}{M}$ cuenta los moles en una masa $m$. $\blacksquare$`],
      examples: [{ q: R`¿Cuántos átomos de H hay en 9 g de agua?`, steps: [R`$n = \frac9{18{,}015} \approx 0{,}4996$ mol de H₂O.`, R`Átomos de H: $2\cdot0{,}4996\cdot6{,}022\times10^{23} \approx 6{,}02\times10^{23}$.`] }],
      see: ["qg-atomo", "qg-estequiometria", "qg-formula"]
    },
    "qg-balanceo": {
      title: "Ecuaciones químicas, balanceo y tipos de reacción", aliases: ["ecuación química", "balanceo", "balancear una ecuación", "coeficientes estequiométricos", "reacción de combustión", "reacción de síntesis", "reacción de descomposición", "ley de conservación de la masa"], concepts: ["qg-balanceo"],
      summary: "En una reacción los átomos se reacomodan pero no se crean ni se destruyen: la ecuación se balancea con coeficientes que igualan cada elemento a los dos lados. Tipos: síntesis, descomposición, sustitución simple y doble, combustión y redox.",
      def: [R`Una **ecuación química** escribe los reactivos a la izquierda y los productos a la derecha. Los **coeficientes estequiométricos** dicen en qué proporción de moles reaccionan y se forman. Se **balancea** eligiendo coeficientes enteros, lo más chicos posible, para que cada elemento (y la carga, si hay iones) quede igual a los dos lados (**ley de conservación de la masa**, Lavoisier).`,
        R`Tipos más comunes:
- **síntesis** (A + B → AB), **descomposición** (AB → A + B);
- **sustitución simple** (A + BC → AC + B), **doble sustitución** (AB + CD → AD + CB, como las neutralizaciones y las precipitaciones);
- **combustión** (un combustible con O₂ da CO₂ y H₂O);
- **redox**: cambian números de oxidación (óxido-reducción).`],
      idea: [R`Balancear es plantear un sistema lineal: una ecuación por elemento, una incógnita por sustancia. Siempre hay una incógnita más que ecuaciones independientes, porque si multiplicás todos los coeficientes por 2 la ecuación sigue balanceada: por eso se elige la solución entera más chica.`],
      demo: [R`**Paso 1 (el sistema).** Para $a\,\mathrm{CH_4} + b\,\mathrm{O_2} \to c\,\mathrm{CO_2} + d\,\mathrm{H_2O}$: carbono $a = c$; hidrógeno $4a = 2d$; oxígeno $2b = 2c + d$.`,
        R`**Paso 2 (una libre).** Son 3 ecuaciones y 4 incógnitas. Fijando $a = 1$: $c = 1$, $d = 2$, y $2b = 2 + 2$, $b = 2$.`,
        R`**Paso 3 (enteros mínimos).** Si algún coeficiente sale fraccionario, se multiplica todo por el denominador común. Queda $\mathrm{CH_4} + 2\,\mathrm{O_2} \to \mathrm{CO_2} + 2\,\mathrm{H_2O}$. $\blacksquare$`],
      examples: [{ q: R`$\mathrm{C_2H_6} + \mathrm{O_2} \to \mathrm{CO_2} + \mathrm{H_2O}$`, steps: [R`C: 2 CO₂; H: 3 H₂O. Oxígenos a la derecha: $4 + 3 = 7$, así que $\frac72\,\mathrm{O_2}$.`, R`Por 2: $2\,\mathrm{C_2H_6} + 7\,\mathrm{O_2} \to 4\,\mathrm{CO_2} + 6\,\mathrm{H_2O}$.`] }],
      see: ["qg-estequiometria", "qg-mol"]
    },
    "qg-estequiometria": {
      title: "Estequiometría: reactivo limitante, rendimiento y pureza", aliases: ["estequiometría", "reactivo limitante", "reactivo en exceso", "rendimiento de una reacción", "rendimiento porcentual", "pureza de un reactivo", "cálculos estequiométricos"], concepts: ["qg-estequiometria"],
      summary: "Los coeficientes dan la proporción en moles. El reactivo limitante es el que tiene menor n/coeficiente: se acaba primero y fija cuánto producto se forma. Rendimiento = real/teórico × 100; pureza = masa útil/masa de la muestra × 100.",
      def: [R`**Estequiometría:** los cálculos de cantidades en una reacción. Se pasa todo a moles, se usa la proporción de los coeficientes y se vuelve a la unidad pedida.`,
        R`**Reactivo limitante:** con cantidades $n_A$ y $n_B$ y coeficientes $a$ y $b$, se comparan $\frac{n_A}a$ y $\frac{n_B}b$: el menor indica el que se termina primero. El avance de la reacción es $\xi = \min\left(\frac{n_A}a, \frac{n_B}b\right)$, y de un producto con coeficiente $p$ se forman $p\,\xi$ moles. Del otro reactivo sobra $n_B - b\,\xi$.`,
        R`**Rendimiento:** $\frac{\text{masa obtenida}}{\text{masa teórica}}\cdot100$. **Pureza** de una muestra: $\frac{\text{masa de la sustancia que reacciona}}{\text{masa de la muestra}}\cdot100$.`],
      idea: [R`Es como armar sándwiches con 10 panes y 3 fetas de jamón, si cada sándwich lleva 2 panes y 1 feta: alcanzan 5 por el pan y 3 por el jamón. Manda el jamón (el limitante), salen 3 y sobran 4 panes. Comparar moles sin dividir por el coeficiente es como comparar 10 panes con 3 fetas: engaña.`],
      demo: [R`**Paso 1 (avance).** Si la reacción avanza $\xi$ moles "de reacción", se consumen $a\xi$ de A y $b\xi$ de B, y se forman $p\xi$ de P. Las cantidades que quedan son $n_A - a\xi$ y $n_B - b\xi$.`,
        R`**Paso 2 (ninguna negativa).** Hace falta $n_A - a\xi \ge 0$ y $n_B - b\xi \ge 0$, o sea $\xi \le \frac{n_A}a$ y $\xi \le \frac{n_B}b$.`,
        R`**Paso 3 (el máximo).** La reacción completa llega al mayor $\xi$ posible: $\xi = \min\left(\frac{n_A}a, \frac{n_B}b\right)$. El reactivo que da el mínimo se agota (es el limitante) y el producto es $p\,\xi$. $\blacksquare$`],
      examples: [{ q: R`10 g de H₂ con 64 g de O₂ ($2\,\mathrm{H_2} + \mathrm{O_2} \to 2\,\mathrm{H_2O}$)`, steps: [R`H₂: 4,96 mol → $\frac{4{,}96}2 = 2{,}48$. O₂: 2,00 mol → $\frac{2}1 = 2$.`, R`Limita el O₂: se forman $2\cdot2 = 4$ mol de agua, 72 g. Sobran $4{,}96 - 4 = 0{,}96$ mol de H₂.`] }],
      see: ["qg-mol", "qg-balanceo"]
    },
    "qg-formula": {
      title: "Composición centesimal, fórmula empírica y molecular", aliases: ["composición centesimal", "fórmula empírica", "fórmula molecular", "fórmula mínima", "análisis elemental"], concepts: ["qg-formula"],
      summary: "Con los porcentajes en masa: se toman 100 g, se pasa cada elemento a moles y se divide por el menor; llevando a enteros sale la fórmula empírica. La molecular es un múltiplo entero: n = M / M(empírica).",
      def: [R`La **composición centesimal** da el porcentaje en masa de cada elemento: $\%X = \frac{(\text{átomos de X})\cdot A_X}{M}\cdot100$.`,
        R`La **fórmula empírica** (o mínima) da la proporción entera más simple entre los átomos; la **molecular**, la cantidad real en cada molécula. La molecular es la empírica multiplicada por $k = \frac{M}{M_{emp}}$, un entero.`],
      idea: [R`El análisis elemental solo da proporciones en masa. Al dividir por las masas atómicas se pasa a proporciones de átomos. CH₂O (formaldehído) y C₆H₁₂O₆ (glucosa) tienen la misma composición y la misma empírica: para distinguirlos hace falta la masa molar.`],
      demo: [R`**Paso 1 (moles en 100 g).** En 100 g del compuesto hay $\%X$ gramos de X, o sea $n_X = \frac{\%X}{A_X}$ moles de átomos de X.`,
        R`**Paso 2 (proporción).** La fórmula pide números de átomos proporcionales a $n_X$. Dividir todos por el menor no cambia la proporción y deja al menor en 1.`,
        R`**Paso 3 (enteros).** Si quedan decimales como 1,5 o 1,33, se multiplica todo por 2 o por 3. El resultado, sin divisores comunes, es la fórmula empírica. $\blacksquare$`],
      examples: [{ q: R`40,0 % C, 6,7 % H, 53,3 % O; $M = 180$ g/mol`, steps: [R`Moles: C 3,33; H 6,65; O 3,33. Dividiendo por 3,33: 1 : 2 : 1, CH₂O.`, R`$M_{emp} = 30$: $k = 6$, C₆H₁₂O₆.`] }],
      see: ["qg-mol", "qg-atomo"]
    }
  };

  E.extendCourse("q101", {
    concepts: { "qg-sistemas": { name: "Sistemas y nomenclatura" }, "qg-mol": { name: "Mol y masa molar" }, "qg-balanceo": { name: "Balanceo" },
      "qg-estequiometria": { name: "Estequiometría" }, "qg-formula": { name: "Fórmula empírica" } },
    templates: T,
    units: [{
      id: "qg-esteq-u", order: 3, program: "Unidad 3", title: "Sistemas materiales y estequiometría", icon: "flask-conical",
      diagnostic: ["qg-masa-molar-num", "qg-balanceo-num", "qg-limitante-num"],
      lessons: [
        { id: "qg-l-sistemas", title: "Sustancias y nomenclatura", templates: ["qg-sustancia-vf", "qg-nomenclatura-match"], theory: ["qg-sistemas"],
          intro: R`Simple: un elemento; compuesta: varios. Número de oxidación: O −2, H +1, la suma da la carga.` },
        { id: "qg-l-mol", title: "Mol y masa molar", templates: ["qg-masa-molar-num", "qg-mol-num"], theory: ["qg-mol"],
          intro: R`$n = \frac mM$; partículas $= n\,N_A$, con $N_A = 6{,}022\times10^{23}$.` },
        { id: "qg-l-balanceo", title: "Balanceo y tipos de reacción", templates: ["qg-balanceo-num", "qg-tipo-reaccion-mc"], theory: ["qg-balanceo"],
          intro: R`Cada elemento tiene que quedar igual a los dos lados, con los coeficientes enteros más chicos.` },
        { id: "qg-l-limitante", title: "Reactivo limitante y rendimiento", templates: ["qg-limitante-num", "qg-rendimiento-num"], theory: ["qg-estequiometria"],
          intro: R`Limitante: el de menor $\frac{n}{\text{coeficiente}}$. Rendimiento $= \frac{\text{real}}{\text{teórico}}\cdot100$.` },
        { id: "qg-l-formula", title: "Fórmula empírica y molecular", templates: ["qg-empirica-num"], theory: ["qg-formula"],
          intro: R`En 100 g: moles de cada elemento, divididos por el menor. Molecular $=$ empírica $\times\frac{M}{M_{emp}}$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 4 · ESTADOS DE AGREGACIÓN (a) GASES
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, Q = E.qg, nf = Q.nf, dn = Q.dn;
  const T = {};
  const tx = f => Q.tex(f);
  const ATM = 101325, KB = 1.380649e-23;
  // estado de un gas en el SI: p (Pa), V (m³), T (K) → n
  const nSI = (pAtm, VL, TK) => pAtm * ATM * VL * 1e-3 / (Q.Rsi * TK);
  const GASES = ["He", "Ne", "Ar", "N2", "O2", "CO2", "CH4", "NH3", "H2", "Cl2", "SO2", "C3H8"];

  T["qg-gas-ideal-num"] = {
    type: "numeric", concepts: ["qg-gases"], difficulty: 2,
    generate(r) {
      const g = r.pick(GASES), M = Q.mm(g), ask = r.pick(["V", "P", "T", "m"]);
      const P = r.pick([0.5, 0.8, 1, 1.5, 2, 2.5, 3, 5]), V = r.pick([0.5, 1, 2, 2.5, 5, 10, 22.4, 50]), tC = r.pick([-20, 0, 15, 25, 37, 100, 150, 250]), TK = tC + 273.15;
      const n = P * V / (Q.R * TK), m = +(n * M).toFixed(2);
      const ans = ask === "V" ? (m / M) * Q.R * TK / P : ask === "P" ? (m / M) * Q.R * TK / V : ask === "T" ? P * V / (Q.R * m / M) - 273.15 : n * M;
      return {
        prompt: ask === "V" ? `¿Qué volumen (L) ocupan $${dn(m, 2)}$ g de $${tx(g)}$ a $${tC}$ °C y $${dn(P, 1)}$ atm?`
          : ask === "P" ? `$${dn(m, 2)}$ g de $${tx(g)}$ están en un recipiente de $${dn(V, 1)}$ L a $${tC}$ °C. ¿Qué presión (atm) ejercen?`
          : ask === "T" ? `$${dn(m, 2)}$ g de $${tx(g)}$ ocupan $${dn(V, 1)}$ L a $${dn(P, 1)}$ atm. ¿A qué temperatura (°C) están?`
          : `¿Cuántos gramos de $${tx(g)}$ hay en un tubo de $${dn(V, 1)}$ L a $${tC}$ °C y $${dn(P, 1)}$ atm?`,
        answer: ans, tolerance: 0.01,
        solution: [`[[qg-gases|Gas ideal]]: $PV = nRT$, con $R = 0{,}082\\ \\mathrm{\\frac{atm\\,L}{mol\\,K}}$ y $T$ en kelvin ($T = t + 273{,}15$).`,
          ask === "m" ? `$n = \\frac{PV}{RT} = \\frac{${dn(P, 1)}\\cdot${dn(V, 1)}}{0{,}082\\cdot${dn(TK, 2)}} \\approx ${nf(n, 4)}$ mol; $m = nM \\approx ${nf(n, 4)}\\cdot${dn(M, 2)} \\approx ${dn(ans, 2)}$ g.`
            : `$n = \\frac mM = \\frac{${dn(m, 2)}}{${dn(M, 2)}} \\approx ${nf(m / M, 4)}$ mol. ${ask === "V" ? `$V = \\frac{nRT}{P} \\approx ${dn(ans, 2)}$ L.` : ask === "P" ? `$P = \\frac{nRT}{V} \\approx ${dn(ans, 3)}$ atm.` : `$T = \\frac{PV}{nR} \\approx ${dn(ans + 273.15, 1)}$ K, o sea $${dn(ans, 1)}$ °C.`}`],
        traps: ask === "T" ? [{ value: ans + 273.15, msg: "Eso está en kelvin: pasalo a grados Celsius." }] : ask === "V" || ask === "P" ? [{ value: ans * tC / TK, msg: "Usaste la temperatura en °C: en $PV = nRT$ va en kelvin." }].filter(t => tC !== 0 && Math.abs(t.value / ans - 1) > 0.05) : [],
        // verificación: todo en el SI (Pa, m³, J/(mol·K))
        verify: { kind: "zero", tol: 5e-4, fn: x => {
          const nn = (ask === "m" ? x : m) / M;
          if (ask === "V") return [nn * Q.Rsi * TK / (P * ATM) * 1e3 / x - 1];
          if (ask === "P") return [nn * Q.Rsi * TK / (V * 1e-3) / ATM / x - 1];
          if (ask === "T") return [P * ATM * V * 1e-3 / (nn * Q.Rsi) / (x + 273.15) - 1];
          return [nSI(P, V, TK) / nn - 1];
        } }
      };
    }
  };
  T["qg-gas-proporcion-mc"] = {
    type: "mc", concepts: ["qg-gases"], difficulty: 1,
    generate(r) {
      // se cambia una variable por un factor, con otra fija; ¿qué le pasa a la tercera?
      const cases = [["T", "P", "V"], ["P", "T", "V"], ["V", "T", "P"], ["T", "V", "P"], ["n", "T", "V"], ["n", "P", "V"]];
      const [chg, fix, out] = r.pick(cases), f = r.pick([2, 3, 4, 0.5]);
      const NAME = { T: "la temperatura absoluta", P: "la presión", V: "el volumen", n: "la cantidad de gas (moles)" };
      // con PV = nRT: la variable de salida es proporcional o inversamente proporcional a la que cambia
      const inv = (out === "V" && chg === "P") || (out === "P" && chg === "V");
      const k = inv ? 1 / f : f;
      const word = x => (x === 1 ? "no cambia" : x > 1 ? `se multiplica por ${String(x).replace(".", ",")}` : `se divide por ${String(1 / x).replace(".", ",")}`);
      const mcq = H.mc(r, word(k), [word(1 / k), word(1), word(k * k), word(Math.sqrt(k))], { text: true });
      return {
        prompt: `Si ${NAME[chg]} de un gas ideal se ${f > 1 ? `multiplica por ${f}` : "reduce a la mitad"} manteniendo constantes ${NAME[fix]}${chg === "n" ? "" : " y la cantidad de gas"}, ¿qué le pasa a ${NAME[out]}?`,
        options: mcq.options, correct: mcq.correct,
        solution: [`De $PV = nRT$ ([[qg-gases|gas ideal]]), con ${NAME[fix]}${chg === "n" ? "" : " y $n$"} fijos, ${NAME[out]} es ${inv ? "inversamente proporcional" : "proporcional"} a ${NAME[chg]}.`, `Entonces ${NAME[out]} ${word(k)}.`],
        // verificación: dos estados calculados en el SI y el cociente de la variable pedida
        verify: { kind: "truth", target: true, fn: () => {
          const s1 = { n: 1, T: 300, P: 101325, V: null }, s2 = Object.assign({}, s1);
          s2[chg] = s1[chg] * f;
          const solve = st => { const o = Object.assign({}, st); if (out === "V") o.V = o.n * Q.Rsi * o.T / o.P; else o.P = o.n * Q.Rsi * o.T / o.V; return o; };
          if (out === "P") { s1.V = 0.0246; s2.V = chg === "V" ? 0.0246 * f : 0.0246; s1.P = null; s2.P = null; }
          const a = solve(s1), b = solve(s2), ratio = b[out] / a[out];
          return Math.abs(ratio - k) < 1e-12 * Math.max(1, k);
        } }
      };
    }
  };
  T["qg-gas-cambio-num"] = {
    type: "numeric", concepts: ["qg-gases"], difficulty: 2,
    generate(r) {
      const P1 = r.pick([1, 1.2, 2, 3, 0.9]), V1 = r.pick([2, 5, 10, 12, 20]), t1 = r.pick([0, 20, 25, 27, 50]), k = r.pick(["V", "P", "T"]);
      const P2 = k === "P" ? null : r.pick([0.5, 1.5, 2.5, 4]), V2 = k === "V" ? null : r.pick([1, 3, 8, 15, 25]), t2 = k === "T" ? null : r.pick([-10, 80, 100, 127, 200]);
      const T1 = t1 + 273.15, c = P1 * V1 / T1;
      const ans = k === "V" ? c * (t2 + 273.15) / P2 : k === "P" ? c * (t2 + 273.15) / V2 : P2 * V2 / c - 273.15;
      return {
        prompt: `Una cantidad fija de gas ocupa $${V1}$ L a $${dn(P1, 1)}$ atm y $${t1}$ °C. ${k === "V" ? `¿Qué volumen (L) ocupa a $${dn(P2, 1)}$ atm y $${t2}$ °C?` : k === "P" ? `Si se lo lleva a $${V2}$ L y $${t2}$ °C, ¿qué presión (atm) tiene?` : `¿A qué temperatura (°C) ocupa $${V2}$ L a $${dn(P2, 1)}$ atm?`}`,
        answer: ans, tolerance: 0.01,
        solution: [`Con $n$ fijo, $\\frac{PV}{T}$ es constante ([[qg-gases|ecuación general]]): $\\frac{P_1V_1}{T_1} = \\frac{P_2V_2}{T_2}$, con las temperaturas en kelvin.`,
          `$\\frac{P_1V_1}{T_1} = \\frac{${dn(P1, 1)}\\cdot${V1}}{${dn(T1, 2)}} \\approx ${nf(c, 4)}$. Despejando: ${k === "T" ? `$T_2 = \\frac{P_2V_2}{${nf(c, 4)}} \\approx ${dn(ans + 273.15, 1)}$ K $= ${dn(ans, 1)}$ °C.` : `$${k}_2 \\approx ${dn(ans, 3)}$.`}`],
        traps: k === "T" ? [{ value: ans + 273.15, msg: "Eso está en kelvin: pasalo a grados Celsius." }] : [],
        // verificación: se calculan los moles en el SI con el estado 1 y se usa $PV = nRT$ en el estado 2
        verify: { kind: "zero", tol: 1e-6, fn: x => {
          const n = nSI(P1, V1, T1);
          if (k === "V") return [n * Q.Rsi * (t2 + 273.15) / (P2 * ATM) * 1e3 / x - 1];
          if (k === "P") return [n * Q.Rsi * (t2 + 273.15) / (V2 * 1e-3) / ATM / x - 1];
          return [P2 * ATM * V2 * 1e-3 / (n * Q.Rsi) / (x + 273.15) - 1];
        } }
      };
    }
  };
  T["qg-gas-densidad-num"] = {
    type: "numeric", concepts: ["qg-gases"], difficulty: 2,
    generate(r) {
      const g = r.pick(GASES), M = Q.mm(g), P = r.pick([0.8, 1, 1.5, 2, 3]), tC = r.pick([0, 25, 50, 100, 200]), TK = tC + 273.15, ask = r.pick(["d", "M"]);
      const d = P * M / (Q.R * TK), dShow = +d.toFixed(3);
      const ans = ask === "d" ? d : dShow * Q.R * TK / P;
      return {
        prompt: ask === "d" ? `¿Cuál es la densidad (g/L) del $${tx(g)}$ a $${dn(P, 1)}$ atm y $${tC}$ °C?` : `Un gas desconocido tiene una densidad de $${dn(dShow, 3)}$ g/L a $${dn(P, 1)}$ atm y $${tC}$ °C. ¿Cuál es su masa molar (g/mol)?`,
        answer: ans, tolerance: 0.01,
        solution: [`De $PV = \\frac mM RT$: $d = \\frac mV = \\frac{PM}{RT}$ ([[qg-gases|densidad de un gas]]).`,
          ask === "d" ? `$d = \\frac{${dn(P, 1)}\\cdot${dn(M, 2)}}{0{,}082\\cdot${dn(TK, 2)}} \\approx ${dn(d, 3)}$ g/L.` : `$M = \\frac{dRT}{P} = \\frac{${dn(dShow, 3)}\\cdot0{,}082\\cdot${dn(TK, 2)}}{${dn(P, 1)}} \\approx ${dn(ans, 1)}$ g/mol (${g === "C3H8" ? "propano" : "es el " + g}).`],
        // verificación: un litro del gas en el SI, contando moles y pesándolos
        verify: { kind: "zero", tol: 5e-4, fn: x => {
          const n1 = nSI(P, 1, TK);
          return ask === "d" ? [n1 * M / x - 1] : [dShow / n1 / x - 1];
        } }
      };
    }
  };
  T["qg-dalton-num"] = {
    type: "numeric", concepts: ["qg-dalton"], difficulty: 2,
    generate(r) {
      const [g1, g2] = r.sample(["N2", "O2", "He", "Ar", "CO2", "CH4", "H2"], 2), m1 = r.int(2, 30), m2 = r.int(2, 30), V = r.pick([5, 10, 20, 25]), tC = r.pick([0, 25, 27, 50]), TK = tC + 273.15;
      const n1 = m1 / Q.mm(g1), n2 = m2 / Q.mm(g2), ask = r.pick(["p1", "tot", "x"]);
      const p1 = n1 * Q.R * TK / V, pt = (n1 + n2) * Q.R * TK / V, x1 = n1 / (n1 + n2);
      const ans = ask === "p1" ? p1 : ask === "tot" ? pt : x1;
      return {
        prompt: `En un recipiente de $${V}$ L a $${tC}$ °C hay $${m1}$ g de $${tx(g1)}$ y $${m2}$ g de $${tx(g2)}$. ${ask === "p1" ? `¿Cuál es la presión parcial (atm) del $${tx(g1)}$?` : ask === "tot" ? "¿Cuál es la presión total (atm)?" : `¿Cuál es la fracción molar del $${tx(g1)}$?`}`,
        answer: ans, tolerance: 0.01,
        solution: [`Moles: $${tx(g1)}$: $${nf(n1, 4)}$; $${tx(g2)}$: $${nf(n2, 4)}$.`,
          `[[qg-dalton|Ley de Dalton]]: cada gas ejerce la presión que tendría solo, $p_i = \\frac{n_iRT}{V}$, y la total es la suma. ${ask === "x" ? `La fracción molar es $x_1 = \\frac{n_1}{n_1 + n_2} \\approx ${dn(x1, 4)}$.` : ask === "p1" ? `$p_1 \\approx ${dn(p1, 3)}$ atm.` : `$P = \\frac{(n_1 + n_2)RT}{V} \\approx ${dn(pt, 3)}$ atm.`}`],
        traps: ask === "x" ? [{ value: m1 / (m1 + m2), msg: "Esa es la fracción en masa; la fracción molar se calcula con moles." }].filter(t => Math.abs(t.value / x1 - 1) > 0.03) : [],
        // verificación: presiones de cada gas por separado en el SI; la fracción molar como cociente de presiones
        verify: { kind: "zero", tol: 5e-4, fn: x => {
          const pa = n1 * Q.Rsi * TK / (V * 1e-3) / ATM, pb = n2 * Q.Rsi * TK / (V * 1e-3) / ATM;
          return [(ask === "p1" ? pa : ask === "tot" ? pa + pb : pa / (pa + pb)) / x - 1];
        } }
      };
    }
  };
  T["qg-sobre-agua-num"] = {
    type: "numeric", concepts: ["qg-dalton"], difficulty: 3,
    generate(r) {
      const tC = r.pick([20, 22, 25, 28, 30]), pv = { 20: 17.5, 22: 19.8, 25: 23.8, 28: 28.3, 30: 31.8 }[tC], Ptot = r.int(735, 770), VmL = r.int(120, 480), TK = tC + 273.15;
      const g = r.pick(["H2", "O2", "N2"]), pg = (Ptot - pv) / 760, n = pg * VmL / 1000 / (Q.R * TK), ans = n * Q.mm(g) * 1000;
      return {
        prompt: `Se recogen $${VmL}$ mL de $${tx(g)}$ sobre agua a $${tC}$ °C, con una presión total de $${Ptot}$ mmHg. La presión de vapor del agua a esa temperatura es $${dn(pv, 1)}$ mmHg. ¿Cuántos miligramos de $${tx(g)}$ se recogieron?`,
        answer: ans, tolerance: 0.01,
        solution: [`El gas recogido está mezclado con vapor de agua: por la [[qg-dalton|ley de Dalton]], $p_{${g}} = P - p_{\\mathrm{H_2O}} = ${Ptot} - ${dn(pv, 1)} = ${dn(Ptot - pv, 1)}$ mmHg $\\approx ${dn(pg, 4)}$ atm.`,
          `$n = \\frac{pV}{RT} \\approx ${nf(n, 4)}$ mol, que son $${dn(ans, 2)}$ mg.`],
        traps: [{ value: Ptot / 760 * VmL / 1000 / (Q.R * TK) * Q.mm(g) * 1000, msg: "Faltó restar la presión de vapor del agua: el gas recogido está húmedo." }],
        // verificación: en el SI, con la presión en pascales (760 mmHg = 101 325 Pa)
        verify: { kind: "zero", tol: 5e-4, fn: x => [((Ptot - pv) * ATM / 760) * VmL * 1e-6 / (Q.Rsi * TK) * Q.mm(g) * 1000 / x - 1] }
      };
    }
  };
  // velocidades moleculares: distribución de Maxwell (para verificar con integrales numéricas)
  const maxwell = (v, Mkg, TK) => { const a = Mkg / (2 * Q.Rsi * TK); return 4 * Math.PI * (a / Math.PI) ** 1.5 * v * v * Math.exp(-a * v * v); };
  const simpson = (f, a, b, n = 4000) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3; };
  T["qg-graham-num"] = {
    type: "numeric", concepts: ["qg-graham"], difficulty: 2,
    generate(r) {
      const [g1, g2] = r.sample(["He", "H2", "N2", "O2", "CO2", "Cl2", "CH4", "SO2", "Ar"], 2), M1 = Q.mm(g1), M2 = Q.mm(g2), ask = r.pick(["ratio", "time", "M"]);
      const ratio = Math.sqrt(M2 / M1), t2 = r.int(30, 200), t1 = t2 / ratio;
      const tShow = +t1.toFixed(1), Mx = M2 * (tShow / t2) ** 2;
      return {
        prompt: ask === "ratio" ? `¿Cuántas veces más rápido efunde el $${tx(g1)}$ que el $${tx(g2)}$ a la misma temperatura?`
          : ask === "time" ? `Por un orificio se escapa cierta cantidad de $${tx(g2)}$ en $${t2}$ s. ¿Cuántos segundos tarda en escaparse la misma cantidad (en moles) de $${tx(g1)}$, en iguales condiciones?`
          : `Un gas desconocido tarda $${dn(tShow, 1)}$ s en efundir, y la misma cantidad de $${tx(g2)}$ tarda $${t2}$ s en iguales condiciones. ¿Cuál es la masa molar (g/mol) del gas desconocido?`,
        answer: ask === "ratio" ? ratio : ask === "time" ? t1 : Mx, tolerance: 0.01,
        solution: [`[[qg-graham|Ley de Graham]]: a igual temperatura, la velocidad de efusión es inversamente proporcional a la raíz de la masa molar: $\\frac{v_1}{v_2} = \\sqrt{\\frac{M_2}{M_1}}$, y los tiempos al revés.`,
          ask === "ratio" ? `$\\sqrt{\\frac{${dn(M2, 2)}}{${dn(M1, 2)}}} \\approx ${dn(ratio, 3)}$.` : ask === "time" ? `$t_1 = t_2\\sqrt{\\frac{M_1}{M_2}} = ${t2}\\sqrt{\\frac{${dn(M1, 2)}}{${dn(M2, 2)}}} \\approx ${dn(t1, 1)}$ s.` : `$M_x = M_2\\left(\\frac{t_x}{t_2}\\right)^2 = ${dn(M2, 2)}\\left(\\frac{${dn(tShow, 1)}}{${t2}}\\right)^2 \\approx ${dn(Mx, 1)}$ g/mol.`],
        traps: ask === "ratio" ? [{ value: M2 / M1, msg: "Faltó la raíz: la velocidad va como $1/\\sqrt M$." }] : [],
        // verificación: la velocidad media de cada gas, integrando numéricamente la distribución de Maxwell
        verify: { kind: "zero", tol: 1e-4, fn: x => {
          const TK = 300, mean = M => simpson(v => v * maxwell(v, M / 1000, TK), 0, 6000 * Math.sqrt(4 / M));
          const vr = mean(M1) / mean(M2);
          return ask === "ratio" ? [vr / x - 1] : ask === "time" ? [t2 / vr / x - 1] : [mean(x) / mean(M2) * tShow / t2 - 1];
        } }
      };
    }
  };
  T["qg-vrms-num"] = {
    type: "numeric", concepts: ["qg-graham"], difficulty: 2,
    generate(r) {
      const g = r.pick(["He", "H2", "N2", "O2", "CO2", "Ar", "CH4"]), M = Q.mm(g), tC = r.pick([-73, 0, 25, 27, 100, 227, 500]), TK = tC + 273.15;
      const v = Math.sqrt(3 * Q.Rsi * TK / (M / 1000));
      return {
        prompt: `¿Cuál es la velocidad cuadrática media (m/s) de las moléculas de $${tx(g)}$ a $${tC}$ °C? ($R = 8{,}314$ J/(mol·K))`,
        answer: v, tolerance: 0.01,
        solution: [`Por la [[f2b-cinetica|teoría cinética]], $\\frac12 M v_{rms}^2 = \\frac32 RT$ por mol: $v_{rms} = \\sqrt{\\frac{3RT}{M}}$, con $M$ en kg/mol ([[qg-graham|velocidades moleculares]]).`,
          `$v_{rms} = \\sqrt{\\frac{3\\cdot8{,}314\\cdot${dn(TK, 2)}}{${nf(M / 1000, 4)}}} \\approx ${dn(v, 0)}$ m/s.`],
        traps: [{ value: Math.sqrt(3 * Q.Rsi * TK / M), msg: "La masa molar tiene que ir en kg/mol para que salga en m/s." }],
        // verificación: ⟨v²⟩ integrando la distribución de Maxwell
        verify: { kind: "zero", tol: 1e-4, fn: x => [Math.sqrt(simpson(u => u * u * maxwell(u, M / 1000, TK), 0, 8 * v)) / x - 1] }
      };
    }
  };
  const VDW = { CO2: [3.64, 0.04267], NH3: [4.225, 0.0371], CH4: [2.283, 0.04278], N2: [1.370, 0.0387], O2: [1.382, 0.03186], Cl2: [6.579, 0.05622], SO2: [6.803, 0.05636], H2O: [5.537, 0.03049] };
  T["qg-vdw-num"] = {
    type: "numeric", concepts: ["qg-gas-real"], difficulty: 3,
    generate(r) {
      const g = r.pick(Object.keys(VDW)), [a, b] = VDW[g], n = r.pick([1, 2, 5, 10]), V = r.pick([0.5, 1, 2, 5]), tC = r.pick([25, 100, 200, 300]), TK = tC + 273.15, ask = r.pick(["P", "Z"]);
      // solo por encima de la temperatura crítica (8a/27Rb): ahí la ecuación tiene un único volumen para cada presión
      if (n / V > 6 || TK < 1.1 * 8 * a / (27 * Q.R * b)) return null;
      const P = n * Q.R * TK / (V - n * b) - a * n * n / (V * V), Pid = n * Q.R * TK / V;
      const ans = ask === "P" ? P : P / Pid;
      return {
        prompt: `$${n}$ mol de $${tx(g)}$ ocupan $${dn(V, 1)}$ L a $${tC}$ °C. Con la ecuación de van der Waals ($a = ${dn(a, 3)}\\ \\mathrm{atm\\,L^2/mol^2}$, $b = ${dn(b, 5)}$ L/mol), ${ask === "P" ? "¿qué presión (atm) ejercen?" : "¿cuánto vale el factor de compresibilidad $Z = \\frac{PV}{nRT}$?"}`,
        answer: ans, tolerance: 0.01,
        solution: [`[[qg-gas-real|Van der Waals]]: $\\left(P + \\frac{an^2}{V^2}\\right)(V - nb) = nRT$, así que $P = \\frac{nRT}{V - nb} - \\frac{an^2}{V^2}$.`,
          `$P = \\frac{${n}\\cdot0{,}082\\cdot${dn(TK, 2)}}{${dn(V, 1)} - ${dn(n * b, 4)}} - \\frac{${dn(a, 3)}\\cdot${n * n}}{${dn(V * V, 2)}} \\approx ${dn(P, 2)}$ atm${ask === "Z" ? `; ideal: $${dn(Pid, 2)}$ atm, así que $Z \\approx ${dn(ans, 3)}$` : ""}.`,
          `${P < Pid ? "Da menos que el gas ideal: a esta densidad pesan más las atracciones (el término $a$)." : "Da más que el gas ideal: pesa más el volumen propio de las moléculas (el término $b$)."}`],
        traps: [{ value: ask === "P" ? Pid : 1, msg: "Ese es el resultado del gas ideal: faltan las correcciones de van der Waals." }].filter(t => Math.abs(t.value / ans - 1) > 0.02),
        // verificación: con esa presión se busca el volumen por bisección en la ecuación de van der Waals y tiene que dar el dato
        verify: { kind: "zero", tol: 1e-6, fn: x => {
          const p = ask === "P" ? x : x * Pid;
          const Vb = Q.bisect(v => (p + a * n * n / (v * v)) * (v - n * b) - n * Q.R * TK, n * b * 1.0001 + 0.3 * (V - n * b), 50 * V);
          return [Vb / V - 1];
        } }
      };
    }
  };

  const cards = {
    "qg-gases": {
      title: "Leyes de los gases y gas ideal", aliases: ["ley de Boyle", "ley de Charles", "ley de Gay-Lussac", "ecuación general de los gases", "volumen molar", "CNPT", "densidad de un gas", "hipótesis de Avogadro"], concepts: ["qg-gases"],
      summary: "Boyle (PV constante a T fija), Charles (V/T constante a P fija) y Gay-Lussac (P/T constante a V fija) se resumen en PV = nRT, con T en kelvin y R = 0,082 atm·L/(mol·K). En CNPT (0 °C, 1 atm) un mol ocupa 22,4 L. La densidad es d = PM/RT.",
      def: [R`Para una cantidad fija de gas:
- **Boyle-Mariotte:** a $T$ constante, $PV$ es constante.
- **Charles:** a $P$ constante, $\frac VT$ es constante.
- **Gay-Lussac:** a $V$ constante, $\frac PT$ es constante.
Las tres juntas: $\frac{P_1V_1}{T_1} = \frac{P_2V_2}{T_2}$, siempre con la **temperatura absoluta** $T = t + 273{,}15$.`,
        R`**Hipótesis de Avogadro:** volúmenes iguales de gases a igual $P$ y $T$ tienen el mismo número de moléculas. Con ella sale la **ecuación de estado del gas ideal** $PV = nRT$ ([[f2b-gas-ideal|gas ideal]]), con $R = 0{,}082\ \frac{\mathrm{atm\,L}}{\mathrm{mol\,K}} = 8{,}314\ \frac{\mathrm J}{\mathrm{mol\,K}}$.`,
        R`En **CNPT** (0 °C y 1 atm), un mol de cualquier gas ideal ocupa el **volumen molar** de 22,4 L. La **densidad** de un gas es $d = \frac{PM}{RT}$, y midiéndola se obtiene su masa molar.`],
      idea: [R`Un gas ideal es casi todo vacío: las moléculas son puntos que no se atraen. Por eso su comportamiento no depende de qué gas es, solo de cuántas moléculas hay. El cero absoluto aparece al extrapolar Charles: el volumen se anularía a −273,15 °C.`],
      demo: [R`**Paso 1 (Boyle y Charles juntas).** Llevamos el gas de $(P_1, V_1, T_1)$ a $(P_2, V_2, T_2)$ en dos etapas: primero a $T_1$ constante hasta $P_2$ (Boyle: $V' = \frac{P_1V_1}{P_2}$), y después a $P_2$ constante hasta $T_2$ (Charles: $V_2 = V'\frac{T_2}{T_1}$).`,
        R`**Paso 2 (combinar).** Reemplazando: $V_2 = \frac{P_1V_1}{P_2}\frac{T_2}{T_1}$, o sea $\frac{P_1V_1}{T_1} = \frac{P_2V_2}{T_2}$: $\frac{PV}T$ depende solo de la cantidad de gas.`,
        R`**Paso 3 (Avogadro).** Esa constante es proporcional a $n$ (a igual $P$ y $T$, el volumen es proporcional a los moles), así que $\frac{PV}{T} = nR$ con $R$ universal. $\blacksquare$`,
        R`**Paso 4 (densidad).** Con $n = \frac mM$: $PV = \frac mM RT$, y dividiendo por $V$, $d = \frac mV = \frac{PM}{RT}$.`],
      examples: [{ q: R`¿Cuánto ocupan 16 g de O₂ a 27 °C y 2 atm?`, steps: [R`$n = 0{,}5$ mol; $V = \frac{0{,}5\cdot0{,}082\cdot300}{2} \approx 6{,}15$ L.`] }],
      tips: [R`El error más común es usar la temperatura en °C. Otro: mezclar unidades de $R$ (con atm y L va 0,082; con Pa y m³, 8,314).`],
      see: ["f2b-gas-ideal", "qg-dalton", "qg-gas-real"]
    },
    "qg-dalton": {
      title: "Mezclas de gases: ley de Dalton", aliases: ["ley de Dalton", "presión parcial", "presiones parciales", "fracción molar", "gas recogido sobre agua"], concepts: ["qg-dalton"],
      summary: "En una mezcla de gases ideales, cada uno ejerce la presión que tendría solo (presión parcial) y la total es la suma. p_i = x_i·P, con x_i = n_i/n_total la fracción molar.",
      def: [R`La **presión parcial** $p_i$ de un gas en una mezcla es la que ejercería si ocupara solo todo el recipiente: $p_i = \frac{n_iRT}{V}$. **Ley de Dalton:** $P = \sum_i p_i$.`,
        R`La **fracción molar** es $x_i = \frac{n_i}{n_{tot}}$ (las fracciones suman 1), y $p_i = x_i P$.`,
        R`**Gas recogido sobre agua:** el gas sale húmedo, mezclado con vapor de agua a su presión de vapor: $p_{gas} = P_{atm} - p_{\mathrm{H_2O}}(T)$.`],
      idea: [R`En un gas ideal las moléculas no se ven entre sí: cada especie golpea las paredes como si estuviera sola. Por eso las presiones se suman. El aire es ~78 % de N₂ en moles, así que a 1 atm el nitrógeno aporta ~0,78 atm.`],
      demo: [R`**Paso 1 (cada gas).** Cada componente cumple $p_iV = n_iRT$ en el mismo $V$ y $T$.`,
        R`**Paso 2 (sumar).** $\sum_i p_i\,V = \left(\sum_i n_i\right)RT = n_{tot}RT = PV$, así que $P = \sum p_i$.`,
        R`**Paso 3 (fracción).** Dividiendo $p_iV = n_iRT$ por $PV = n_{tot}RT$: $\frac{p_i}P = \frac{n_i}{n_{tot}} = x_i$. $\blacksquare$`],
      examples: [{ q: R`4 g de He y 32 g de O₂ en 10 L a 0 °C.`, steps: [R`1 mol de cada uno: $p_{He} = p_{O_2} = \frac{1\cdot0{,}082\cdot273}{10} \approx 2{,}24$ atm; total 4,48 atm.`] }],
      see: ["qg-gases", "qg-graham"]
    },
    "qg-graham": {
      title: "Teoría cinética, difusión y efusión: ley de Graham", aliases: ["ley de Graham", "efusión", "difusión gaseosa", "velocidad media molecular", "teoría cinético-molecular"], concepts: ["qg-graham"],
      summary: "La energía cinética media de las moléculas depende solo de T: (3/2)RT por mol. Por eso v_rms = √(3RT/M) y, a igual T, las moléculas livianas son más rápidas: v₁/v₂ = √(M₂/M₁) (Graham).",
      def: [R`**Teoría cinético-molecular:** un gas son moléculas puntuales en movimiento al azar, con choques elásticos y sin fuerzas entre ellas. La presión sale de los choques contra las paredes, y la energía cinética media por mol es $\frac32RT$ ([[f2b-cinetica|teoría cinética]]).`,
        R`**Velocidad cuadrática media:** $v_{rms} = \sqrt{\frac{3RT}{M}}$ ($M$ en kg/mol). Las velocidades siguen la distribución de Maxwell, y la media y la más probable son algo menores que $v_{rms}$, pero todas son proporcionales a $\sqrt{T/M}$.`,
        R`**Difusión:** un gas se mezcla con otro. **Efusión:** escapa por un orificio pequeño. **Ley de Graham:** a igual $T$ y $P$, $\frac{v_1}{v_2} = \sqrt{\frac{M_2}{M_1}}$; los tiempos para efundir la misma cantidad cumplen la relación inversa.`],
      idea: [R`A la misma temperatura, todas las moléculas tienen en promedio la misma energía cinética. Una molécula pesada, para tener la misma energía, tiene que ir más despacio. Así se separó el uranio-235 del 238: como hexafluoruros, que efunden a velocidades que difieren en 0,4 %.`],
      demo: [R`**Paso 1 (misma energía).** Para dos gases a la misma $T$: $\frac12 M_1 v_{1,rms}^2 = \frac32RT = \frac12 M_2 v_{2,rms}^2$.`,
        R`**Paso 2 (cociente).** $\frac{v_1^2}{v_2^2} = \frac{M_2}{M_1}$, así que $\frac{v_1}{v_2} = \sqrt{\frac{M_2}{M_1}}$.`,
        R`**Paso 3 (efusión).** El flujo por el orificio es proporcional a la velocidad media de las moléculas (que también va como $\sqrt{T/M}$): la misma relación vale para las velocidades de efusión. El tiempo para que salga una misma cantidad es inversamente proporcional al flujo. $\blacksquare$`],
      examples: [{ q: R`¿Cuántas veces más rápido efunde el H₂ que el O₂?`, steps: [R`$\sqrt{\frac{32}{2{,}016}} \approx 3{,}98$: casi 4 veces.`] }],
      see: ["f2b-cinetica", "qg-gases"]
    },
    "qg-gas-real": {
      title: "Gases reales: ecuación de van der Waals", aliases: ["gas real", "gases reales", "ecuación de van der Waals", "factor de compresibilidad", "constantes de van der Waals"], concepts: ["qg-gas-real"],
      summary: "Los gases reales se apartan del ideal a alta presión y baja temperatura. Van der Waals corrige el volumen propio (b) y la atracción entre moléculas (a): (P + an²/V²)(V − nb) = nRT. Z = PV/nRT mide el apartamiento.",
      def: [R`**Ecuación de van der Waals:** $\left(P + \frac{an^2}{V^2}\right)(V - nb) = nRT$.
- $b$: el volumen que ocupan las propias moléculas, por mol; el espacio libre es $V - nb$.
- $a$: la atracción entre moléculas, que frena a las que van a chocar con la pared y baja la presión en $\frac{an^2}{V^2}$.`,
        R`El **factor de compresibilidad** $Z = \frac{PV}{nRT}$ vale 1 para el gas ideal. $Z < 1$: dominan las atracciones; $Z > 1$: domina el volumen propio. Los gases son casi ideales a baja presión y alta temperatura.`],
      idea: [R`Las dos correcciones van en sentidos opuestos. Por eso a presiones moderadas $Z$ baja de 1 (las moléculas se atraen y el gas se deja comprimir más) y a presiones muy altas sube (ya no hay lugar). Los gases con $a$ grande (NH₃, H₂O) son los más fáciles de licuar.`],
      demo: [R`**Paso 1 (volumen propio).** Si cada mol de moléculas ocupa $b$, el volumen disponible para moverse es $V - nb$, y la ecuación ideal pasa a $P_{ideal}(V - nb) = nRT$.`,
        R`**Paso 2 (atracción).** Una molécula que llega a la pared es tirada hacia adentro por las demás. El efecto es proporcional a cuántas la tiran ($\propto n/V$) y a cuántas chocan ($\propto n/V$): la presión medida es $P = P_{ideal} - a\frac{n^2}{V^2}$.`,
        R`**Paso 3 (juntar).** Despejando $P_{ideal} = P + \frac{an^2}{V^2}$ y reemplazando en el paso 1 queda la ecuación de van der Waals. $\blacksquare$`],
      examples: [{ q: R`1 mol de CO₂ en 1 L a 25 °C.`, steps: [R`Ideal: 24,4 atm. Van der Waals: $\frac{24{,}45}{1 - 0{,}0427} - 3{,}64 \approx 21{,}9$ atm: $Z \approx 0{,}9$.`] }],
      see: ["qg-gases", "qg-fuerzas"]
    }
  };

  E.extendCourse("q101", {
    concepts: { "qg-gases": { name: "Leyes de los gases" }, "qg-dalton": { name: "Mezclas de gases" }, "qg-graham": { name: "Teoría cinética y Graham" }, "qg-gas-real": { name: "Gases reales" } },
    templates: T,
    units: [{
      id: "qg-gases-u", order: 4, program: "Unidad 4", title: "Estado gaseoso", icon: "sparkles",
      diagnostic: ["qg-gas-ideal-num", "qg-dalton-num", "qg-graham-num"],
      lessons: [
        { id: "qg-l-gas-ideal", title: "Gas ideal", templates: ["qg-gas-proporcion-mc", "qg-gas-ideal-num", "qg-gas-cambio-num", "qg-gas-densidad-num"], theory: ["qg-gases"],
          intro: R`$PV = nRT$ con $T$ en kelvin y $R = 0{,}082$ atm·L/(mol·K). Densidad: $d = \frac{PM}{RT}$.` },
        { id: "qg-l-dalton", title: "Mezclas de gases", templates: ["qg-dalton-num", "qg-sobre-agua-num"], theory: ["qg-dalton"],
          intro: R`$P = \sum p_i$, $p_i = x_iP$. Sobre agua: hay que restar la presión de vapor.` },
        { id: "qg-l-graham", title: "Velocidades moleculares", templates: ["qg-vrms-num", "qg-graham-num"], theory: ["qg-graham"],
          intro: R`$v_{rms} = \sqrt{\frac{3RT}M}$ y $\frac{v_1}{v_2} = \sqrt{\frac{M_2}{M_1}}$.` },
        { id: "qg-l-gas-real", title: "Gases reales", templates: ["qg-vdw-num"], theory: ["qg-gas-real"],
          intro: R`$\left(P + \frac{an^2}{V^2}\right)(V - nb) = nRT$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 4 · ESTADOS DE AGREGACIÓN (b) LÍQUIDOS Y SÓLIDOS
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, Q = E.qg, nf = Q.nf, dn = Q.dn;
  const T = {};
  const tx = f => Q.tex(f);
  // RK4 de una ecuación escalar (para verificar Clausius-Clapeyron integrando dlnP/dT)
  const rk4 = (f, y, a, b, n = 2000) => { const h = (b - a) / n; let t = a; for (let i = 0; i < n; i++) { const k1 = f(t, y), k2 = f(t + h / 2, y + h * k1 / 2), k3 = f(t + h / 2, y + h * k2 / 2), k4 = f(t + h, y + h * k3); y += h * (k1 + 2 * k2 + 2 * k3 + k4) / 6; t += h; } return y; };
  const LIQ = { "agua": [40.7, 100, "H2O"], "etanol": [38.6, 78.4, "C2H6O"], "benceno": [30.8, 80.1, "C6H6"], "acetona": [29.1, 56.1, "C3H6O"], "metanol": [35.2, 64.7, "CH4O"], "hexano": [28.9, 68.7, "C6H14"] };
  T["qg-clausius-num"] = {
    type: "numeric", concepts: ["qg-liquidos"], difficulty: 3,
    generate(r) {
      const name = r.pick(Object.keys(LIQ)), [dH, tb] = LIQ[name], Tb = tb + 273.15, ask = r.pick(["P", "T"]);
      const tC = r.pick([20, 25, 30, 40, 50, 60]), T2 = tC + 273.15, Pmm = r.pick([200, 300, 400, 500, 600]);
      if (tC >= tb) return null;
      const lnP = (Tk) => -dH * 1000 / Q.Rsi * (1 / Tk - 1 / Tb);   // ln(P/760)
      const ans = ask === "P" ? 760 * Math.exp(lnP(T2)) : 1 / (1 / Tb - Q.Rsi * Math.log(Pmm / 760) / (dH * 1000)) - 273.15;
      return {
        prompt: ask === "P" ? `El ${name} hierve a $${dn(tb, 1)}$ °C a 760 mmHg, y su entalpía de vaporización es $${dn(dH, 1)}$ kJ/mol. ¿Cuál es su presión de vapor (mmHg) a $${tC}$ °C?`
          : `El ${name} hierve a $${dn(tb, 1)}$ °C a 760 mmHg ($\\Delta H_{vap} = ${dn(dH, 1)}$ kJ/mol). ¿A qué temperatura (°C) hierve donde la presión es de $${Pmm}$ mmHg?`,
        answer: ans, tolerance: 0.01,
        solution: [`[[qg-liquidos|Clausius-Clapeyron]]: $\\ln\\frac{P_2}{P_1} = -\\frac{\\Delta H_{vap}}{R}\\left(\\frac1{T_2} - \\frac1{T_1}\\right)$, con $R = 8{,}314$ J/(mol·K) y temperaturas en kelvin. El punto de ebullición normal da $P_1 = 760$ mmHg a $T_1 = ${dn(Tb, 2)}$ K.`,
          ask === "P" ? `$\\ln\\frac{P}{760} = -\\frac{${dn(dH * 1000, 0)}}{8{,}314}\\left(\\frac1{${dn(T2, 2)}} - \\frac1{${dn(Tb, 2)}}\\right) \\approx ${dn(lnP(T2), 4)}$, así que $P \\approx ${dn(ans, 1)}$ mmHg.`
            : `$\\frac1{T_2} = \\frac1{${dn(Tb, 2)}} - \\frac{8{,}314}{${dn(dH * 1000, 0)}}\\ln\\frac{${Pmm}}{760}$, así que $T_2 \\approx ${dn(ans + 273.15, 1)}$ K $= ${dn(ans, 1)}$ °C. Hierve antes: la presión externa es menor.`],
        traps: ask === "T" ? [{ value: ans + 273.15, msg: "Eso está en kelvin: pasalo a grados Celsius." }] : [],
        // verificación: se integra d(ln P)/dT = ΔH/(RT²) con RK4 desde el punto de ebullición normal
        verify: { kind: "zero", tol: 1e-6, fn: x => {
          const f = (t, y) => dH * 1000 / (Q.Rsi * t * t);
          if (ask === "P") return [rk4(f, Math.log(760), Tb, T2) - Math.log(x)];
          return [rk4(f, Math.log(760), Tb, x + 273.15) - Math.log(Pmm)];
        } }
      };
    }
  };
  // curva de calentamiento del agua
  T["qg-calentamiento-num"] = {
    type: "numeric", concepts: ["qg-liquidos"], difficulty: 2,
    generate(r) {
      const m = r.pick([10, 18, 25, 50, 100]), t0 = r.pick([-30, -20, -10, -5]), t1 = r.pick([105, 110, 120, 130]), ask = r.pick(["total", "hielo-agua"]);
      const ch = 2.09, cl = 4.18, cv = 2.01, Lf = 334, Lv = 2257; // J/g
      const qa = m * ch * (0 - t0), qb = m * Lf, qc = m * cl * 100, qd = m * Lv, qe = m * cv * (t1 - 100);
      const ans = (ask === "total" ? qa + qb + qc + qd + qe : qa + qb + m * cl * 25) / 1000;
      return {
        prompt: ask === "total" ? `¿Cuánta energía (kJ) hace falta para llevar $${m}$ g de hielo a $${t0}$ °C hasta vapor a $${t1}$ °C, a 1 atm? ($c_{hielo} = 2{,}09$, $c_{agua} = 4{,}18$, $c_{vapor} = 2{,}01$ J/(g·°C); $L_f = 334$ J/g; $L_v = 2257$ J/g)`
          : `¿Cuánta energía (kJ) hace falta para llevar $${m}$ g de hielo a $${t0}$ °C hasta agua líquida a 25 °C? ($c_{hielo} = 2{,}09$, $c_{agua} = 4{,}18$ J/(g·°C); $L_f = 334$ J/g)`,
        answer: ans, tolerance: 0.01,
        solution: [`En la [[qg-liquidos|curva de calentamiento]], la temperatura sube en cada fase ($Q = mc\\Delta T$) y queda fija en los cambios de fase ($Q = mL$).`,
          ask === "total" ? `Hielo: $${dn(qa, 0)}$ J; fusión: $${dn(qb, 0)}$ J; agua de 0 a 100 °C: $${dn(qc, 0)}$ J; ebullición: $${dn(qd, 0)}$ J; vapor: $${dn(qe, 0)}$ J. Total $\\approx ${dn(ans, 2)}$ kJ.`
            : `Hielo: $${dn(qa, 0)}$ J; fusión: $${dn(qb, 0)}$ J; agua de 0 a 25 °C: $${dn(m * cl * 25, 0)}$ J. Total $\\approx ${dn(ans, 2)}$ kJ.`,
          ask === "total" ? `Casi todo se va en la vaporización: separar las moléculas del líquido cuesta mucho más que calentarlo.` : ``].filter(Boolean),
        traps: ask === "total" ? [{ value: (qa + qc + qe) / 1000, msg: "Faltan los calores latentes: en la fusión y la ebullición se absorbe energía sin que cambie la temperatura." }] : [{ value: (qa + m * cl * 25) / 1000, msg: "Falta el calor de fusión del hielo." }],
        // verificación: se calienta la muestra de a 0,5 J y se lleva la cuenta de la fase y la temperatura
        verify: { kind: "zero", tol: 2e-4, fn: x => {
          const goal = ask === "total" ? t1 : 25, dq = 0.5;
          let t = t0, melted = 0, boiled = 0, q = 0;
          while (true) {
            if (t < 0) { t += dq / (m * ch); q += dq; if (t > 0) { q -= (t - 0) * m * ch; t = 0; } }
            else if (t === 0 && melted < m * Lf) { melted += dq; q += dq; if (melted > m * Lf) { q -= melted - m * Lf; melted = m * Lf; } }
            else if (t < 100 && t < goal) { t += dq / (m * cl); q += dq; if (t > Math.min(100, goal)) { q -= (t - Math.min(100, goal)) * m * cl; t = Math.min(100, goal); } }
            else if (t === 100 && goal > 100 && boiled < m * Lv) { boiled += dq; q += dq; if (boiled >= m * Lv) { q -= boiled - m * Lv; boiled = m * Lv; t = 100.0000001; } }
            else if (t > 100 && t < goal) { t += dq / (m * cv); q += dq; if (t > goal) { q -= (t - goal) * m * cv; t = goal; } }
            else break;
          }
          return [q / 1000 / x - 1];
        } }
      };
    }
  };
  // fuerzas intermoleculares: enlaces H–X presentes y momento dipolar (D)
  const IMF = [
    { f: "H2O", hx: ["O"], mu: 1.85, k: "puente de hidrógeno" }, { f: "NH3", hx: ["N"], mu: 1.47, k: "puente de hidrógeno" }, { f: "HF", hx: ["F"], mu: 1.82, k: "puente de hidrógeno" },
    { f: "CH3OH", hx: ["O", "C"], mu: 1.70, k: "puente de hidrógeno" }, { f: "CH4", hx: ["C"], mu: 0, k: "London (dispersión)" }, { f: "CO2", hx: [], mu: 0, k: "London (dispersión)" },
    { f: "Cl2", hx: [], mu: 0, k: "London (dispersión)" }, { f: "I2", hx: [], mu: 0, k: "London (dispersión)" }, { f: "CCl4", hx: [], mu: 0, k: "London (dispersión)" },
    { f: "HCl", hx: ["Cl"], mu: 1.08, k: "dipolo-dipolo" }, { f: "H2S", hx: ["S"], mu: 0.97, k: "dipolo-dipolo" }, { f: "SO2", hx: [], mu: 1.63, k: "dipolo-dipolo" },
    { f: "CH2O", hx: ["C"], mu: 2.33, k: "dipolo-dipolo" }, { f: "CHCl3", hx: ["C"], mu: 1.04, k: "dipolo-dipolo" }, { f: "C3H6O", hx: ["C"], mu: 2.88, k: "dipolo-dipolo" }, { f: "N2", hx: [], mu: 0, k: "London (dispersión)" }
  ];
  T["qg-fuerzas-mc"] = {
    type: "mc", concepts: ["qg-fuerzas"], difficulty: 2,
    generate(r) {
      const s = r.pick(IMF), mcq = H.mc(r, s.k, ["London (dispersión)", "dipolo-dipolo", "puente de hidrógeno", "enlace iónico"].filter(x => x !== s.k), { text: true });
      return {
        prompt: `¿Cuál es la fuerza intermolecular más importante entre moléculas de $${tx(s.f)}$${s.f === "C3H6O" ? " (acetona)" : s.f === "CH2O" ? " (formaldehído)" : ""}?`,
        options: mcq.options, correct: mcq.correct,
        solution: [`[[qg-fuerzas|Fuerzas intermoleculares]]: puente de hidrógeno si hay H unido a N, O o F; dipolo-dipolo si la molécula es polar; si no, solo fuerzas de London (que están siempre).`,
          `$${tx(s.f)}$: ${s.k === "puente de hidrógeno" ? `tiene H unido a ${s.hx.filter(x => "NOF".includes(x)).join(" y ")}: **puente de hidrógeno**.` : s.k === "dipolo-dipolo" ? `es polar (momento dipolar de $${dn(s.mu, 2)}$ D) pero no tiene H unido a N, O o F: **dipolo-dipolo**.` : `es no polar: solo **fuerzas de London**.`}`],
        // verificación: la regla aplicada a los datos de la molécula (enlaces H–X y momento dipolar medido)
        verify: { kind: "truth", target: true, fn: () => (s.hx.some(x => ["N", "O", "F"].includes(x)) ? "puente de hidrógeno" : s.mu > 0.1 ? "dipolo-dipolo" : "London (dispersión)") === s.k }
      };
    }
  };
  const SOL = [["NaCl", "iónico"], ["MgO", "iónico"], ["CaF2", "iónico"], ["KBr", "iónico"], ["Cu", "metálico"], ["Fe", "metálico"], ["Al", "metálico"], ["Na", "metálico"],
    ["C", "covalente (reticular)"], ["SiO2", "covalente (reticular)"], ["Si", "covalente (reticular)"], ["H2O", "molecular"], ["CO2", "molecular"], ["I2", "molecular"], ["C6H12O6", "molecular"], ["S8", "molecular"]];
  const METALS = new Set(["Na", "K", "Mg", "Ca", "Cu", "Fe", "Al", "Ag", "Zn"]);
  T["qg-solidos-mc"] = {
    type: "mc", concepts: ["qg-fuerzas"], difficulty: 1,
    generate(r) {
      const [f, k] = r.pick(SOL), mcq = H.mc(r, k, ["iónico", "metálico", "covalente (reticular)", "molecular"].filter(x => x !== k), { text: true });
      return {
        prompt: `¿Qué tipo de sólido es $${tx(f)}$${f === "C" ? " (diamante)" : f === "SiO2" ? " (cuarzo)" : f === "H2O" ? " (hielo)" : f === "CO2" ? " (hielo seco)" : ""}?`,
        options: mcq.options, correct: mcq.correct,
        solution: [`[[qg-fuerzas|Tipos de sólidos]]: iónico (iones de metal y no metal), metálico (un metal), covalente reticular (átomos unidos por enlaces covalentes en toda la red: C, Si, SiO₂) y molecular (moléculas unidas por fuerzas intermoleculares).`,
          `$${tx(f)}$ es un sólido **${k}**.`],
        // verificación: se clasifica por la composición (solo metal, metal con no metal, red covalente conocida o moléculas)
        verify: { kind: "truth", target: true, fn: () => {
          const els = Object.keys(Q.count2(f)), allM = els.every(e => METALS.has(e)), someM = els.some(e => METALS.has(e));
          const k2 = allM ? "metálico" : someM ? "iónico" : ["C", "Si", "SiO2"].includes(f) ? "covalente (reticular)" : "molecular";
          return k2 === k;
        } }
      };
    }
  };
  // ¿quién hierve a mayor temperatura?
  const BP = [["H2O", 100, "puente de hidrógeno"], ["H2S", -60, "dipolo-dipolo"], ["CH4", -161.5, "London"], ["C2H6", -89, "London"], ["C3H8", -42, "London"], ["C4H10", -0.5, "London"],
    ["HF", 19.5, "puente de hidrógeno"], ["HCl", -85, "dipolo-dipolo"], ["NH3", -33, "puente de hidrógeno"], ["PH3", -88, "dipolo-dipolo"], ["F2", -188, "London"], ["Cl2", -34, "London"], ["Br2", 59, "London"], ["I2", 184, "London"], ["C2H5OH", 78.4, "puente de hidrógeno"]];
  const RANK = { "London": 0, "dipolo-dipolo": 1, "puente de hidrógeno": 2 };
  T["qg-ebullicion-vf"] = {
    type: "tf", concepts: ["qg-fuerzas"], difficulty: 2,
    generate(r) {
      const [a, b] = r.sample(BP, 2);
      // solo pares que la regla (tipo de fuerza y, a igual tipo, masa molar) decide bien
      const rule = RANK[a[2]] !== RANK[b[2]] ? RANK[a[2]] > RANK[b[2]] : Q.mm(a[0]) > Q.mm(b[0]);
      if (rule !== (a[1] > b[1])) return null;
      if (RANK[a[2]] !== RANK[b[2]] && Math.abs(Q.mm(a[0]) - Q.mm(b[0])) > 40) return null;
      return {
        prompt: `<b>Verdadero o falso:</b> el $${tx(a[0])}$ tiene un punto de ebullición más alto que el $${tx(b[0])}$.`,
        answer: a[1] > b[1],
        explanation: `$${tx(a[0])}$: ${a[2]}${a[2] === "London" ? "" : " (además de London)"}; $${tx(b[0])}$: ${b[2]}. ${RANK[a[2]] !== RANK[b[2]] ? "Gana el de [[qg-fuerzas|fuerzas intermoleculares]] más intensas." : "Con el mismo tipo de fuerza, hierve más alto el de mayor masa molar (más electrones, más polarizable)."} Puntos de ebullición: ${dn(a[1], 1).replace("{,}", ",")} °C y ${dn(b[1], 1).replace("{,}", ",")} °C.`,
        solution: [`Cuanto más intensas las fuerzas entre moléculas, más energía hace falta para separarlas y más alto el punto de ebullición.`],
        // verificación: comparando los puntos de ebullición medidos
        verify: { kind: "truth", fn: () => rule }
      };
    }
  };

  const cards = {
    "qg-liquidos": {
      title: "Líquidos: presión de vapor, ebullición y cambios de fase", aliases: ["presión de vapor", "punto de ebullición", "punto de ebullición normal", "ecuación de Clausius-Clapeyron", "entalpía de vaporización", "curva de calentamiento", "temperatura crítica"], concepts: ["qg-liquidos"],
      summary: "La presión de vapor de un líquido crece con T: ln(P₂/P₁) = −(ΔH_vap/R)(1/T₂ − 1/T₁). Hierve cuando su presión de vapor iguala la externa. En la curva de calentamiento, la temperatura queda fija mientras cambia la fase. Sobre el punto crítico no hay líquido.",
      def: [R`En un recipiente cerrado, un líquido se evapora hasta que el vapor alcanza la **presión de vapor** $P_v(T)$, en equilibrio con el líquido. Crece rápido con la temperatura según **Clausius-Clapeyron**: $\ln\frac{P_2}{P_1} = -\frac{\Delta H_{vap}}{R}\left(\frac1{T_2} - \frac1{T_1}\right)$.`,
        R`El líquido **hierve** cuando $P_v$ iguala la presión externa; el **punto de ebullición normal** es a 1 atm. En la montaña la presión es menor y el agua hierve a menos de 100 °C; en una olla a presión, a más.`,
        R`En la **curva de calentamiento**, dentro de cada fase $Q = mc\Delta T$, y en cada cambio de fase la temperatura queda fija mientras se absorbe el **calor latente** $Q = mL$ ([[f2b-calor|calor]]). El **diagrama de fases** muestra qué fase es estable para cada $(P, T)$; la curva líquido-vapor termina en el **punto crítico**, por encima del cual no se puede licuar el gas por compresión.`,
        R`Otras propiedades de los líquidos: la [[f1-tension-sup|tensión superficial]] (energía para aumentar la superficie) y la [[f1-hidrodinamica|viscosidad]] (resistencia a fluir); las dos crecen con las fuerzas intermoleculares.`],
      idea: [R`La presión de vapor mide cuántas moléculas tienen energía suficiente para escaparse del líquido, y esa fracción crece como $e^{-\Delta H_{vap}/RT}$: por eso crece tan rápido con $T$. Un líquido volátil (acetona) tiene fuerzas intermoleculares débiles y presión de vapor alta.`],
      demo: [R`**Paso 1 (Clapeyron).** En el equilibrio líquido-vapor, la pendiente de la curva de presión de vapor es $\frac{dP}{dT} = \frac{\Delta H_{vap}}{T\,\Delta V}$ (sale de igualar la energía libre de las dos fases a lo largo de la curva).`,
        R`**Paso 2 (aproximaciones).** El volumen del vapor es mucho mayor que el del líquido: $\Delta V \approx V_{vapor} = \frac{RT}{P}$ por mol (gas ideal).`,
        R`**Paso 3 (separar e integrar).** $\frac{dP}{dT} = \frac{\Delta H_{vap}P}{RT^2}$, o sea $\frac{d\ln P}{dT} = \frac{\Delta H_{vap}}{RT^2}$. Integrando entre $T_1$ y $T_2$ con $\Delta H_{vap}$ constante: $\ln\frac{P_2}{P_1} = -\frac{\Delta H_{vap}}{R}\left(\frac1{T_2} - \frac1{T_1}\right)$. $\blacksquare$`],
      examples: [{ q: R`¿A qué temperatura hierve el agua a 500 mmHg? ($\Delta H_{vap} = 40{,}7$ kJ/mol)`, steps: [R`$\frac1{T_2} = \frac1{373{,}15} - \frac{8{,}314}{40\,700}\ln\frac{500}{760} \approx 0{,}0027653$.`, R`$T_2 \approx 361{,}6$ K, unos 88,5 °C.`] }],
      see: ["f2b-calor", "f2b-cinetica", "qg-fuerzas"]
    },
    "qg-fuerzas": {
      title: "Fuerzas intermoleculares y tipos de sólidos", aliases: ["fuerzas intermoleculares", "puente de hidrógeno", "puentes de hidrógeno", "fuerzas de London", "fuerzas de dispersión", "fuerzas dipolo-dipolo", "sólido iónico", "sólido molecular", "sólido covalente", "sólido metálico"], concepts: ["qg-fuerzas"],
      summary: "Entre moléculas actúan fuerzas de London (siempre; crecen con el tamaño), dipolo-dipolo (moléculas polares) y puentes de hidrógeno (H unido a N, O o F). Deciden los puntos de fusión y ebullición. Los sólidos pueden ser iónicos, metálicos, covalentes reticulares o moleculares.",
      def: [R`- **Fuerzas de London (dispersión):** dipolos instantáneos que inducen otros; están en todas las moléculas y crecen con la cantidad de electrones (con la masa molar).
- **Dipolo-dipolo:** entre moléculas [[qg-enlace-polaridad|polares]].
- **Puente de hidrógeno:** un H unido a N, O o F (muy electronegativos y chicos) es atraído por un par libre de otra molécula. Es la más intensa de las tres.
- **Ion-dipolo:** entre iones y moléculas polares (en la disolución de sales en agua).`,
        R`**Tipos de sólidos:**
- **iónicos** (NaCl): red de iones; duros, frágiles, alto punto de fusión;
- **metálicos** (Cu): cationes en un mar de electrones; conductores, maleables;
- **covalentes reticulares** (diamante, SiO₂): toda la red unida por enlaces covalentes; durísimos;
- **moleculares** (hielo, I₂): moléculas unidas por fuerzas intermoleculares; blandos, bajo punto de fusión.`],
      idea: [R`El agua hierve a 100 °C mientras el H₂S, más pesado, hierve a −60 °C: la diferencia son los puentes de hidrógeno. Sin ellos, el agua sería un gas a temperatura ambiente y no habría océanos. Los puentes de hidrógeno también sostienen la doble hélice del ADN.`],
      examples: [{ q: R`¿Por qué el I₂ es sólido y el F₂ es gas?`, steps: [R`Los dos son no polares: solo London. El I₂ tiene muchos más electrones y es mucho más polarizable, así que se atrae más.`] }],
      see: ["qg-enlace-polaridad", "qg-liquidos", "qg-gas-real"]
    }
  };

  E.extendCourse("q101", {
    concepts: { "qg-liquidos": { name: "Líquidos y cambios de fase" }, "qg-fuerzas": { name: "Fuerzas intermoleculares" } },
    templates: T,
    units: [{
      id: "qg-liquidos-u", order: 5, program: "Unidad 4", title: "Líquidos y sólidos", icon: "flask-conical",
      diagnostic: ["qg-fuerzas-mc", "qg-clausius-num", "qg-solidos-mc"],
      lessons: [
        { id: "qg-l-fuerzas", title: "Fuerzas intermoleculares", templates: ["qg-fuerzas-mc", "qg-ebullicion-vf"], theory: ["qg-fuerzas"],
          intro: R`London siempre; dipolo-dipolo si es polar; puente de hidrógeno si hay H unido a N, O o F.` },
        { id: "qg-l-solidos", title: "Tipos de sólidos", templates: ["qg-solidos-mc"], theory: ["qg-fuerzas"],
          intro: R`Iónicos, metálicos, covalentes reticulares y moleculares.` },
        { id: "qg-l-vapor", title: "Presión de vapor y cambios de fase", templates: ["qg-clausius-num", "qg-calentamiento-num"], theory: ["qg-liquidos"],
          intro: R`$\ln\frac{P_2}{P_1} = -\frac{\Delta H_{vap}}{R}\left(\frac1{T_2} - \frac1{T_1}\right)$. En los cambios de fase, $Q = mL$ a $T$ fija.` }
      ]
    }],
    cards
  });
})();
