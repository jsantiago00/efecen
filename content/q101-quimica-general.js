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
      title: "Mol, masa molar y número de Avogadro", aliases: ["masa molar", "número de Avogadro", "constante de Avogadro", "cantidad de sustancia", "unidad fórmula"], concepts: ["qg-mol"],
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
- **redox**: cambian números de oxidación ([[qg-redox|óxido-reducción]]).`],
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

/* =====================================================================
 *  UNIDAD 5 · SOLUCIONES (a) CONCENTRACIÓN, DILUCIÓN Y SOLUBILIDAD
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, Q = E.qg, nf = Q.nf, dn = Q.dn;
  const T = {};
  const tx = f => Q.tex(f);
  const mm2 = f => Object.entries(Q.count2(f)).reduce((s, [el, n]) => s + Q.A[el] * n, 0);
  const SOLUTES = ["NaCl", "KCl", "NaOH", "KNO3", "C6H12O6", "C12H22O11", "CuSO4", "H2SO4", "HCl", "Na2CO3", "CaCl2", "NH4Cl"];

  T["qg-molaridad-num"] = {
    type: "numeric", concepts: ["qg-concentracion"], difficulty: 1,
    generate(r) {
      const f = r.pick(SOLUTES), M = Q.mm(f), ask = r.pick(["M", "masa"]), V = r.pick([100, 250, 500, 1000, 2000]), c = r.pick([0.05, 0.1, 0.2, 0.25, 0.5, 1, 1.5, 2]);
      const m = +(c * V / 1000 * M).toFixed(2), ans = ask === "M" ? m / M / (V / 1000) : c * V / 1000 * M;
      return {
        prompt: ask === "M" ? `Se disuelven $${dn(m, 2)}$ g de $${tx(f)}$ en agua hasta completar $${V}$ mL de solución. ¿Cuál es la molaridad (mol/L)?` : `¿Cuántos gramos de $${tx(f)}$ hacen falta para preparar $${V}$ mL de solución $${dn(c, 2)}$ M?`,
        answer: ans, tolerance: 0.01,
        solution: [`[[qg-concentracion|Molaridad]]: $M = \\frac{n_{soluto}}{V_{\\text{solución}}\\ (\\mathrm L)}$. Masa molar: $${dn(M, 2)}$ g/mol.`,
          ask === "M" ? `$n = \\frac{${dn(m, 2)}}{${dn(M, 2)}} \\approx ${nf(m / M, 4)}$ mol en $${dn(V / 1000, 3)}$ L: $M \\approx ${dn(ans, 3)}$ mol/L.` : `$n = ${dn(c, 2)}\\cdot${dn(V / 1000, 3)} = ${nf(c * V / 1000, 4)}$ mol, que son $${dn(ans, 2)}$ g.`],
        traps: [{ value: ask === "M" ? m / M / V : c * V * M, msg: "El volumen va en litros: pasá los mililitros dividiendo por 1000." }],
        // verificación: se cuentan las unidades fórmula con el otro lector de fórmulas y se reparten en el volumen
        verify: { kind: "zero", tol: 1e-6, fn: x => {
          const per = mm2(f);
          return ask === "M" ? [(m / per * Q.NA) / (V * 1e-3) / Q.NA / x - 1] : [x / per / (V * 1e-3) / c - 1];
        } }
      };
    }
  };
  // soluciones comerciales: % m/m y densidad
  const COMM = [["H2SO4", 98, 1.84], ["HCl", 37, 1.19], ["HNO3", 65, 1.39], ["NaOH", 20, 1.22], ["NH3", 28, 0.90], ["C2H6O", 40, 0.94], ["NaCl", 10, 1.07], ["C6H12O6", 20, 1.08]];
  T["qg-conversion-num"] = {
    type: "numeric", concepts: ["qg-concentracion"], difficulty: 3,
    generate(r) {
      const [f, pct, d] = r.pick(COMM), M = Q.mm(f), ask = r.pick(["M", "m", "x", "mv"]);
      const Mol = pct * 10 * d / M, molal = (pct / M) / ((100 - pct) / 1000), x = (pct / M) / (pct / M + (100 - pct) / Q.mm("H2O")), mv = pct * d;
      const ans = { M: Mol, m: molal, x, mv }[ask];
      return {
        prompt: `Una solución acuosa de $${tx(f)}$ tiene $${pct}\\,\\%$ m/m y densidad $${dn(d, 2)}$ g/mL. ¿Cuál es su ${{ M: "molaridad (mol/L)", m: "molalidad (mol/kg de solvente)", x: "fracción molar de soluto", mv: "concentración en % m/V (g de soluto cada 100 mL de solución)" }[ask]}?`,
        answer: ans, tolerance: 0.01,
        solution: [`Base de cálculo: 100 g de solución, con $${pct}$ g de soluto ($${nf(pct / M, 4)}$ mol) y $${100 - pct}$ g de agua. Su volumen es $\\frac{100}{${dn(d, 2)}} \\approx ${dn(100 / d, 2)}$ mL.`,
          ask === "M" ? `[[qg-concentracion|Molaridad]]: $\\frac{${nf(pct / M, 4)}\\ \\mathrm{mol}}{${dn(0.1 / d, 5)}\\ \\mathrm L} \\approx ${dn(Mol, 3)}$ M.`
            : ask === "m" ? `[[qg-concentracion|Molalidad]]: $\\frac{${nf(pct / M, 4)}\\ \\mathrm{mol}}{${dn((100 - pct) / 1000, 3)}\\ \\mathrm{kg}} \\approx ${dn(molal, 3)}$ m.`
            : ask === "x" ? `Moles de agua: $\\frac{${100 - pct}}{18{,}02} \\approx ${nf((100 - pct) / Q.mm("H2O"), 4)}$. $x = \\frac{n_s}{n_s + n_{agua}} \\approx ${dn(x, 4)}$.`
            : `En $${dn(100 / d, 2)}$ mL hay $${pct}$ g: cada 100 mL, $${dn(mv, 2)}$ g. Es $${dn(mv, 1)}\\,\\%$ m/V.`],
        traps: ask === "M" ? [{ value: pct * 10 / M, msg: "Faltó la densidad: el % m/m da masas, y la molaridad pide volumen de solución." }] : ask === "m" ? [{ value: pct / M / 0.1, msg: "La molalidad se calcula por kilo de **solvente**, no de solución." }] : [],
        // verificación: se arma un litro de solución, se pesan soluto y solvente por separado y se recalcula
        verify: { kind: "zero", tol: 1e-6, fn: v => {
          const massSol = 1000 * d, ms = massSol * pct / 100, mw = massSol - ms, ns = ms / mm2(f), nw = mw / mm2("H2O");
          const got = { M: ns / 1, m: ns / (mw / 1000), x: ns / (ns + nw), mv: ms / 10 }[ask];
          return [got / v - 1];
        } }
      };
    }
  };
  T["qg-dilucion-num"] = {
    type: "numeric", concepts: ["qg-dilucion"], difficulty: 2,
    generate(r) {
      const kind = r.pick(["dil", "dil", "mezcla"]);
      if (kind === "dil") {
        const C1 = r.pick([0.5, 1, 2, 6, 12, 18]), C2 = r.pick([0.05, 0.1, 0.2, 0.25, 0.5]), V2 = r.pick([100, 250, 500, 1000]), ask = r.pick(["V1", "C2"]);
        if (C2 >= C1) return null;
        const V1 = C2 * V2 / C1, V1s = +V1.toFixed(1), c2 = C1 * V1s / V2;
        return {
          prompt: ask === "V1" ? `¿Qué volumen (mL) de una solución $${dn(C1, 1)}$ M hay que tomar para preparar $${V2}$ mL de solución $${dn(C2, 2)}$ M?` : `Se toman $${dn(V1s, 1)}$ mL de una solución $${dn(C1, 1)}$ M y se diluyen con agua hasta $${V2}$ mL. ¿Cuál es la nueva molaridad?`,
          answer: ask === "V1" ? V1 : c2, tolerance: 0.01,
          solution: [`Al [[qg-dilucion|diluir]] no cambia la cantidad de soluto: $C_1V_1 = C_2V_2$.`, ask === "V1" ? `$V_1 = \\frac{C_2V_2}{C_1} = \\frac{${dn(C2, 2)}\\cdot${V2}}{${dn(C1, 1)}} \\approx ${dn(V1, 2)}$ mL.` : `$C_2 = \\frac{C_1V_1}{V_2} = \\frac{${dn(C1, 1)}\\cdot${dn(V1s, 1)}}{${V2}} \\approx ${dn(c2, 4)}$ M.`],
          // verificación: se cuentan los moles que pasan de un recipiente al otro
          verify: { kind: "zero", tol: 1e-9, fn: x => ask === "V1" ? [(C1 * x / 1000) / (V2 / 1000) / C2 - 1] : [(C1 * V1s / 1000) / (V2 / 1000) / x - 1] }
        };
      }
      const Ca = r.pick([0.1, 0.2, 0.5, 1]), Va = r.pick([50, 100, 200, 300]), Cb = r.pick([0.05, 0.3, 0.8, 1.5, 2]), Vb = r.pick([25, 50, 150, 250]);
      const Cf = (Ca * Va + Cb * Vb) / (Va + Vb);
      return {
        prompt: `Se mezclan $${Va}$ mL de solución $${dn(Ca, 2)}$ M de NaCl con $${Vb}$ mL de solución $${dn(Cb, 2)}$ M de NaCl. Suponiendo volúmenes aditivos, ¿cuál es la molaridad final?`,
        answer: Cf, tolerance: 0.01,
        solution: [`Se suman los moles y los volúmenes ([[qg-dilucion|mezcla de soluciones]]): $n = ${dn(Ca, 2)}\\cdot${dn(Va / 1000, 3)} + ${dn(Cb, 2)}\\cdot${dn(Vb / 1000, 3)} = ${nf(Ca * Va / 1000 + Cb * Vb / 1000, 4)}$ mol.`, `$C = \\frac{n}{V_a + V_b} = \\frac{${nf(Ca * Va / 1000 + Cb * Vb / 1000, 4)}}{${dn((Va + Vb) / 1000, 3)}} \\approx ${dn(Cf, 4)}$ M.`],
        traps: [{ value: (Ca + Cb) / 2, msg: "El promedio simple solo vale si los volúmenes son iguales: hay que sumar moles." }].filter(t => Va !== Vb && Math.abs(t.value / Cf - 1) > 0.02),
        // verificación: se vierte de a 1 mL de cada solución en un vaso y se cuentan los moles
        verify: { kind: "zero", tol: 1e-9, fn: x => { let n = 0, V = 0; for (let i = 0; i < Va; i++) { n += Ca / 1000; V += 1; } for (let i = 0; i < Vb; i++) { n += Cb / 1000; V += 1; } return [n / (V / 1000) / x - 1]; } }
      };
    }
  };
  // constantes de Henry a 25 °C (mol/(L·atm)) y fracción en el aire
  const HENRY = { O2: [1.3e-3, 0.21], N2: [6.1e-4, 0.78], CO2: [3.4e-2, 0.0004] };
  T["qg-henry-num"] = {
    type: "numeric", concepts: ["qg-solubilidad"], difficulty: 2,
    generate(r) {
      const g = r.pick(Object.keys(HENRY)), [kH, frac] = HENRY[g], ask = r.pick(["aire", "puro"]), P = r.pick([1, 2, 2.5, 3, 4, 5]);
      const p = ask === "aire" ? frac * P : P, c = kH * p, mgL = c * Q.mm(g) * 1000;
      return {
        prompt: ask === "aire" ? `El aire tiene ${String(frac * 100).replace(".", ",")} % de $${tx(g)}$ en moles. ¿Cuántos mg de $${tx(g)}$ se disuelven por litro de agua a 25 °C en equilibrio con aire a $${P}$ atm? ($k_H = ${nf(kH, 2)}$ mol/(L·atm))`
          : `¿Cuántos mg de $${tx(g)}$ se disuelven por litro de agua a 25 °C bajo $${P}$ atm de $${tx(g)}$ puro? ($k_H = ${nf(kH, 2)}$ mol/(L·atm))`,
        answer: mgL, tolerance: 0.01,
        solution: [`[[qg-solubilidad|Ley de Henry]]: la solubilidad de un gas es proporcional a su **presión parcial**: $C = k_H\\,p$.`,
          ask === "aire" ? `$p = ${String(frac).replace(".", "{,}")}\\cdot${P} = ${nf(p, 3)}$ atm ([[qg-dalton|Dalton]]).` : `$p = ${P}$ atm.`,
          `$C = ${nf(kH, 2)}\\cdot${nf(p, 3)} \\approx ${nf(c, 3)}$ mol/L, o sea $${nf(mgL, 3)}$ mg/L.`],
        traps: ask === "aire" ? [{ value: kH * P * Q.mm(g) * 1000, msg: "Va la presión parcial del gas, no la presión total del aire." }] : [],
        // verificación: con la presión parcial en Pa y la constante pasada a mol/(m³·Pa)
        verify: { kind: "zero", tol: 1e-9, fn: x => { const kSI = kH * 1000 / 101325, pPa = (ask === "aire" ? frac : 1) * P * 101325; return [kSI * pPa / 1000 * Q.mm(g) * 1000 / x - 1]; } }
      };
    }
  };
  // solubilidad del KNO3 en agua (g cada 100 g de agua)
  const SOLKNO3 = { 0: 13.3, 10: 20.9, 20: 31.6, 30: 45.8, 40: 63.9, 50: 85.5, 60: 110, 70: 138, 80: 169 };
  T["qg-saturacion-mc"] = {
    type: "mc", concepts: ["qg-solubilidad"], difficulty: 2,
    generate(r) {
      const t = r.pick(Object.keys(SOLKNO3).map(Number)), s = SOLKNO3[t], w = r.pick([50, 100, 200]), kind = r.pick(["in", "sat", "cristal"]);
      const ms = kind === "in" ? +(s * w / 100 * r.pick([0.5, 0.7, 0.85])).toFixed(1) : kind === "sat" ? +(s * w / 100).toFixed(1) : +(s * w / 100 * r.pick([1.2, 1.5])).toFixed(1);
      const lab = kind === "in" ? "insaturada" : kind === "sat" ? "saturada" : "saturada, con sólido sin disolver en el fondo";
      const mcq = H.mc(r, lab, ["insaturada", "saturada", "saturada, con sólido sin disolver en el fondo", "sobresaturada (sin sólido)"].filter(x => x !== lab), { text: true });
      return {
        prompt: `La solubilidad del $${tx("KNO3")}$ a $${t}$ °C es de $${dn(s, 1)}$ g cada 100 g de agua. Si se agregan $${dn(ms, 1)}$ g de $${tx("KNO3")}$ a $${w}$ g de agua a esa temperatura y se agita, ¿qué se obtiene?`,
        options: mcq.options, correct: mcq.correct,
        solution: [`En $${w}$ g de agua se disuelven como máximo $${dn(s * w / 100, 1)}$ g ([[qg-solubilidad|solubilidad]]).`,
          kind === "in" ? `Se agregó menos: queda una solución **insaturada**.` : kind === "sat" ? `Se agregó justo eso: la solución queda **saturada**.` : `Se agregó más: se disuelven $${dn(s * w / 100, 1)}$ g, la solución queda **saturada** y sobran $${dn(ms - s * w / 100, 1)}$ g de sólido. (Una sobresaturada solo se obtiene enfriando con cuidado una saturada, y es inestable.)`],
        // verificación: se agrega el sólido de a 0,1 g y se disuelve mientras quepa
        verify: { kind: "truth", target: true, fn: () => {
          let dis = 0, left = 0;
          const cap = SOLKNO3[t] * w / 100 + 1e-9;
          for (let i = 0; i < Math.round(ms * 10); i++) { if (dis + 0.1 <= cap + 1e-6) dis += 0.1; else left += 0.1; }
          const k2 = left > 0.5 ? "saturada, con sólido sin disolver en el fondo" : cap - dis < 0.15 ? "saturada" : "insaturada";
          return k2 === lab;
        } }
      };
    }
  };

  const cards = {
    "qg-concentracion": {
      title: "Soluciones y unidades de concentración", aliases: ["molaridad", "molalidad", "porcentaje en masa", "% m/m", "% m/V", "partes por millón"], concepts: ["qg-concentracion"],
      summary: "Una solución es una mezcla homogénea de soluto en solvente. Molaridad M = mol de soluto / L de solución; molalidad m = mol de soluto / kg de solvente; % m/m = g de soluto cada 100 g de solución; % m/V = g cada 100 mL; fracción molar x = n_i / n_total.",
      def: [R`Una **solución** es una mezcla homogénea. El componente en mayor proporción (casi siempre el agua) es el **solvente**, y los otros, los **solutos**.`,
        R`Unidades de **concentración**:
- **físicas:** % m/m (g de soluto en 100 g de solución), % m/V (g en 100 mL de solución), % V/V, ppm (mg por kg o por L);
- **químicas:** **molaridad** $M = \frac{n_{soluto}}{V_{\text{solución}}\ (\mathrm L)}$; **molalidad** $m = \frac{n_{soluto}}{m_{solvente}\ (\mathrm{kg})}$; **fracción molar** $x_i = \frac{n_i}{n_{tot}}$.`,
        R`Para pasar de unas a otras hace falta la **densidad** de la solución, que vincula su masa con su volumen. Conviene tomar una base de cálculo: 100 g de solución si el dato es un % m/m, o 1 L si es una molaridad.`],
      idea: [R`La molaridad es la más práctica en el laboratorio (se mide un volumen), pero cambia con la temperatura porque el volumen se dilata. La molalidad usa masas y no cambia: por eso es la que aparece en las [[qg-coligativas|propiedades coligativas]].`],
      demo: [R`**Paso 1 (base 100 g).** Con un % m/m $p$: en 100 g de solución hay $p$ g de soluto ($\frac pM$ mol) y $100 - p$ g de solvente.`,
        R`**Paso 2 (volumen).** Esos 100 g ocupan $\frac{100}{d}$ mL $= \frac{0{,}1}{d}$ L.`,
        R`**Paso 3 (molaridad).** $M = \frac{p/M_s}{0{,}1/d} = \frac{10\,p\,d}{M_s}$ (con $d$ en g/mL). **Molalidad:** $m = \frac{p/M_s}{(100 - p)/1000}$. $\blacksquare$`],
      examples: [{ q: R`H₂SO₄ 98 % m/m, $d = 1{,}84$ g/mL.`, steps: [R`$M = \frac{10\cdot98\cdot1{,}84}{98{,}08} \approx 18{,}4$ M.`] }],
      see: ["qg-dilucion", "qg-mol", "qg-coligativas"]
    },
    "qg-dilucion": {
      title: "Dilución y mezcla de soluciones", aliases: ["dilución", "C1V1 = C2V2", "mezcla de soluciones", "solución madre"], concepts: ["qg-dilucion"],
      summary: "Al diluir, la cantidad de soluto no cambia: C₁V₁ = C₂V₂. Al mezclar soluciones del mismo soluto se suman los moles y (aproximadamente) los volúmenes: C = (C₁V₁ + C₂V₂)/(V₁ + V₂).",
      def: [R`**Dilución:** se agrega solvente a una solución. Como los moles de soluto se conservan, $C_1V_1 = C_2V_2$ (con cualquier unidad de volumen, la misma de los dos lados).`,
        R`**Mezcla:** $C_f = \frac{C_1V_1 + C_2V_2}{V_1 + V_2}$, suponiendo volúmenes aditivos (en soluciones diluidas es una buena aproximación).`],
      idea: [R`Diluir no saca soluto: lo reparte en más volumen. Por eso la concentración baja en la misma proporción en que sube el volumen. En el laboratorio se prepara una **solución madre** concentrada y se diluye según lo que haga falta.`],
      demo: [R`**Paso 1.** Los moles de soluto en la solución inicial son $n = C_1V_1$.`, R`**Paso 2.** Al agregar agua, $n$ no cambia y el volumen pasa a $V_2$: $C_2 = \frac{n}{V_2} = \frac{C_1V_1}{V_2}$. $\blacksquare$`, R`**Paso 3 (mezcla).** Los moles totales son $C_1V_1 + C_2V_2$ y el volumen $V_1 + V_2$; dividiendo sale $C_f$.`],
      examples: [{ q: R`¿Cuánto HCl 12 M para 500 mL de HCl 0,1 M?`, steps: [R`$V_1 = \frac{0{,}1\cdot500}{12} \approx 4{,}17$ mL, completando con agua hasta 500 mL.`] }],
      tips: [R`Con ácidos concentrados: siempre el ácido sobre el agua, nunca al revés (el calor de dilución puede hacer hervir y salpicar).`],
      see: ["qg-concentracion"]
    },
    "qg-solubilidad": {
      title: "Solubilidad, saturación y ley de Henry", aliases: ["solubilidad", "solución saturada", "solución insaturada", "solución sobresaturada", "curva de solubilidad", "ley de Henry"], concepts: ["qg-solubilidad"],
      summary: "La solubilidad es la máxima cantidad de soluto que se disuelve a una temperatura. Por debajo, la solución es insaturada; en el máximo, saturada; por encima (inestable), sobresaturada. Los gases se disuelven en proporción a su presión parcial: C = k_H·p (Henry), y menos cuanto más caliente.",
      def: [R`La **solubilidad** es la concentración de una solución **saturada**, en equilibrio con el soluto sin disolver. Una solución con menos soluto es **insaturada**; una con más, **sobresaturada** (se logra enfriando con cuidado una saturada, y cristaliza al menor golpe).`,
        R`Factores: la naturaleza de soluto y solvente ("lo similar disuelve lo similar": polares en polares), la temperatura (la mayoría de los sólidos son más solubles en caliente; las **curvas de solubilidad** lo muestran) y, para gases, la presión.`,
        R`**Ley de Henry:** la concentración de un gas disuelto es proporcional a su presión parcial sobre el líquido: $C = k_H\,p$. Los gases son menos solubles en caliente.`],
      idea: [R`Una gaseosa cerrada tiene CO₂ a varias atmósferas: al abrirla, la presión parcial baja a la del aire y el gas sale en burbujas. Los buzos que suben rápido sufren lo mismo con el N₂ de la sangre. Y los peces sufren en el agua caliente: tiene menos oxígeno disuelto.`],
      examples: [{ q: R`O₂ disuelto en agua con aire a 1 atm (21 % O₂, $k_H = 1{,}3\times10^{-3}$ mol/(L·atm)).`, steps: [R`$C = 1{,}3\times10^{-3}\cdot0{,}21 \approx 2{,}7\times10^{-4}$ M, unos 8,7 mg/L.`] }],
      see: ["qg-concentracion", "qg-dalton", "qg-fuerzas"]
    }
  };

  E.extendCourse("q101", {
    concepts: { "qg-concentracion": { name: "Concentración" }, "qg-dilucion": { name: "Dilución" }, "qg-solubilidad": { name: "Solubilidad y Henry" } },
    templates: T,
    units: [{
      id: "qg-soluciones-u", order: 6, program: "Unidad 5", title: "Soluciones y concentración", icon: "flask-conical",
      diagnostic: ["qg-molaridad-num", "qg-dilucion-num", "qg-saturacion-mc"],
      lessons: [
        { id: "qg-l-molaridad", title: "Molaridad", templates: ["qg-molaridad-num"], theory: ["qg-concentracion"],
          intro: R`$M = \frac{n_{soluto}}{V\ (\mathrm L)}$.` },
        { id: "qg-l-conversion", title: "Unidades de concentración", templates: ["qg-conversion-num"], theory: ["qg-concentracion"],
          intro: R`Con % m/m y densidad: base de 100 g de solución. Molalidad: por kg de **solvente**.` },
        { id: "qg-l-dilucion", title: "Diluciones y mezclas", templates: ["qg-dilucion-num"], theory: ["qg-dilucion"],
          intro: R`$C_1V_1 = C_2V_2$.` },
        { id: "qg-l-solubilidad", title: "Solubilidad y gases disueltos", templates: ["qg-saturacion-mc", "qg-henry-num"], theory: ["qg-solubilidad"],
          intro: R`Saturada: en el máximo. Henry: $C = k_H\,p$, con la presión parcial.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 5 · SOLUCIONES (b) PROPIEDADES COLIGATIVAS Y COLOIDES
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, Q = E.qg, nf = Q.nf, dn = Q.dn;
  const T = {};
  const tx = f => Q.tex(f);
  // solventes: Kf, Kb (°C·kg/mol), punto de fusión y ebullición (°C), masa molar y entalpías de fusión y vaporización (kJ/mol)
  const SOLV = {
    agua: { Kf: 1.86, Kb: 0.512, tf: 0, tb: 100, M: 18.015, Hf: 6.01, Hv: 40.65 },
    benceno: { Kf: 5.12, Kb: 2.53, tf: 5.5, tb: 80.1, M: 78.11, Hf: 9.87, Hv: 30.72 }
  };
  // la constante a partir de la termodinámica: K = R·T²·M / ΔH (otra forma de obtenerla, para verificar)
  const Kthermo = (s, kind) => { const S = SOLV[s], Tk = (kind === "f" ? S.tf : S.tb) + 273.15; return Q.Rsi * Tk * Tk * (S.M / 1000) / ((kind === "f" ? S.Hf : S.Hv) * 1000); };
  const SOLU = [["C6H12O6", 1, "glucosa"], ["C12H22O11", 1, "sacarosa"], ["CH4N2O", 1, "urea"], ["NaCl", 2, "cloruro de sodio"], ["KNO3", 2, "nitrato de potasio"], ["CaCl2", 3, "cloruro de calcio"], ["MgSO4", 2, "sulfato de magnesio"], ["Na2SO4", 3, "sulfato de sodio"], ["AlCl3", 4, "cloruro de aluminio"]];
  T["qg-crioscopia-num"] = {
    type: "numeric", concepts: ["qg-coligativas"], difficulty: 2,
    generate(r) {
      const [f, i, nm] = r.pick(SOLU), sv = i > 1 ? "agua" : r.pick(["agua", "benceno"]), S = SOLV[sv], ask = r.pick(["Tf", "Tb", "M"]);
      const ms = r.int(5, 60), mw = r.pick([100, 200, 250, 500]), m = ms / Q.mm(f) / (mw / 1000);
      if ((ask === "M" && i > 1) || (sv === "benceno" && ask === "Tb") || m > 2) return null;
      const dTf = i * S.Kf * m, dTb = i * S.Kb * m;
      const dShow = +dTf.toFixed(3), Mx = S.Kf * ms / (mw / 1000) / dShow;
      const ans = ask === "Tf" ? S.tf - dTf : ask === "Tb" ? dTb : Mx;
      return {
        prompt: ask === "M" ? `Se disuelven $${ms}$ g de un compuesto molecular desconocido (no electrolito) en $${mw}$ g de ${sv}, y el punto de congelación baja $${dn(dShow, 3)}$ °C. ¿Cuál es su masa molar (g/mol)? ($K_f = ${dn(S.Kf, 2)}$ °C·kg/mol)`
          : `¿${ask === "Tf" ? "A qué temperatura (°C) congela" : "Cuántos grados (°C) más alto que el solvente puro hierve, a 1 atm,"} una solución de $${ms}$ g de ${nm} ($${tx(f)}$) en $${mw}$ g de ${sv}? ($${ask === "Tf" ? `K_f = ${dn(S.Kf, 2)}` : `K_b = ${dn(S.Kb, 3)}`}$ °C·kg/mol; ${sv === "agua" ? "" : `el benceno ${ask === "Tf" ? "funde a 5,5 °C" : "hierve a 80,1 °C"}; `}${i > 1 ? `suponé disociación completa` : "no es electrolito"})`,
        answer: ans, tolerance: ask === "M" ? 0.01 : 2e-3,
        solution: [`[[qg-coligativas|Propiedades coligativas]]: $\\Delta T = i\\,K\\,m$, con $m$ la molalidad y $i$ el factor de van 't Hoff (las partículas que da cada unidad: ${i}).`,
          ask === "M" ? `$m = \\frac{\\Delta T}{K_f} = \\frac{${dn(dShow, 3)}}{${dn(S.Kf, 2)}} \\approx ${nf(dShow / S.Kf, 4)}$ mol/kg; en $${mw / 1000}$ kg hay $${nf(dShow / S.Kf * mw / 1000, 4)}$ mol, así que $M = \\frac{${ms}}{${nf(dShow / S.Kf * mw / 1000, 4)}} \\approx ${dn(Mx, 1)}$ g/mol.`
            : `$m = \\frac{${ms}/${dn(Q.mm(f), 2)}}{${mw / 1000}} \\approx ${nf(m, 4)}$ mol/kg. $\\Delta T = ${i}\\cdot${ask === "Tf" ? dn(S.Kf, 2) : dn(S.Kb, 3)}\\cdot${nf(m, 4)} \\approx ${dn(ask === "Tf" ? dTf : dTb, 3)}$ °C.`,
          ask === "Tf" ? `Congela a $${dn(S.tf, 1)} - ${dn(dTf, 3)} \\approx ${dn(ans, 3)}$ °C.` : ask === "Tb" ? `Hierve $${dn(dTb, 3)}$ °C más alto: a $${dn(S.tb + dTb, 3)}$ °C.` : ``].filter(Boolean),
        traps: i > 1 && ask !== "M" ? [{ value: ask === "Tf" ? S.tf - S.Kf * m : S.Kb * m, msg: `Faltó el factor de van 't Hoff: cada unidad de $${tx(f)}$ da ${i} partículas en solución.` }] : [],
        // verificación: la constante se recalcula con la termodinámica del solvente, K = R·T²·M/ΔH
        verify: { kind: "zero", tol: 3e-3, fn: x => {
          const Kf = Kthermo(sv, "f"), Kb = Kthermo(sv, "b");
          if (ask === "Tf") return [(S.tf - x) / (i * Kf * m) - 1];
          if (ask === "Tb") return [x / (i * Kb * m) - 1];
          return [(Kf * ms / (mw / 1000) / dShow) / x - 1];
        } }
      };
    }
  };
  T["qg-osmotica-num"] = {
    type: "numeric", concepts: ["qg-coligativas"], difficulty: 2,
    generate(r) {
      const [f, i, nm] = r.pick(SOLU), tC = r.pick([20, 25, 27, 37]), TK = tC + 273.15, c = r.pick([0.005, 0.01, 0.02, 0.05, 0.1]), ask = r.pick(["pi", "c"]);
      const pi = i * c * Q.R * TK, piShow = +pi.toFixed(3), cAns = piShow / (i * Q.R * TK);
      return {
        prompt: ask === "pi" ? `¿Cuál es la presión osmótica (atm) de una solución $${dn(c, 3)}$ M de ${nm} a $${tC}$ °C?${i > 1 ? " (disociación completa)" : ""}` : `Una solución acuosa de ${nm} tiene una presión osmótica de $${dn(piShow, 3)}$ atm a $${tC}$ °C. ¿Cuál es su molaridad?${i > 1 ? " (disociación completa)" : ""}`,
        answer: ask === "pi" ? pi : cAns, tolerance: 0.01,
        solution: [`[[qg-coligativas|Presión osmótica]] (van 't Hoff): $\\pi = i\\,M\\,RT$, con $i = ${i}$.`,
          ask === "pi" ? `$\\pi = ${i}\\cdot${dn(c, 3)}\\cdot0{,}082\\cdot${dn(TK, 2)} \\approx ${dn(pi, 3)}$ atm.` : `$M = \\frac{\\pi}{iRT} = \\frac{${dn(piShow, 3)}}{${i}\\cdot0{,}082\\cdot${dn(TK, 2)}} \\approx ${nf(cAns, 4)}$ M.`],
        traps: i > 1 ? [{ value: ask === "pi" ? pi / i : cAns * i, msg: "Faltó el factor de van 't Hoff (cuántas partículas da cada unidad)." }] : [],
        // verificación: por el potencial químico del agua, π = −(RT/V̄) ln x_agua (sin aproximar la solución diluida)
        verify: { kind: "zero", tol: 1e-2, fn: v => {
          const cc = ask === "pi" ? c : v, nw = 1000 / 18.015, ns = i * cc, Vm = 0.018068;   // ~1 L de agua; volumen molar del agua (L/mol)
          const piT = -Q.R * TK / Vm * Math.log(nw / (nw + ns));
          return ask === "pi" ? [piT / v - 1] : [piT / piShow - 1];
        } }
      };
    }
  };
  T["qg-raoult-num"] = {
    type: "numeric", concepts: ["qg-raoult"], difficulty: 2,
    generate(r) {
      const kind = r.pick(["novolatil", "ideal"]);
      if (kind === "novolatil") {
        const [f, , nm] = r.pick(SOLU.filter(s => s[1] === 1)), ms = r.int(20, 150), mw = r.pick([100, 200, 250]), tC = r.pick([20, 25, 30]), p0 = { 20: 17.54, 25: 23.76, 30: 31.82 }[tC];
        const ns = ms / Q.mm(f), nw = mw / Q.mm("H2O"), p = p0 * nw / (nw + ns);
        return {
          prompt: `¿Cuál es la presión de vapor (mmHg) a $${tC}$ °C de una solución de $${ms}$ g de ${nm} ($${tx(f)}$) en $${mw}$ g de agua? (Presión de vapor del agua pura: $${dn(p0, 2)}$ mmHg)`,
          answer: p, tolerance: 2e-3,
          solution: [`[[qg-raoult|Ley de Raoult]]: $p = x_{agua}\\,p^\\circ$. Moles: soluto $${nf(ns, 4)}$, agua $${nf(nw, 4)}$; $x_{agua} \\approx ${dn(nw / (nw + ns), 4)}$.`, `$p \\approx ${dn(nw / (nw + ns), 4)}\\cdot${dn(p0, 2)} \\approx ${dn(p, 2)}$ mmHg.`],
          traps: [{ value: p0 * ns / (nw + ns), msg: "Esa es la fracción molar del soluto: en Raoult va la del solvente." }],
          // verificación: contando moléculas (en unidades de N_A) de cada especie
          verify: { kind: "zero", tol: 1e-9, fn: x => { const N1 = ms / Object.entries(Q.count2(f)).reduce((s, [e, k]) => s + Q.A[e] * k, 0), N2 = mw / (2 * Q.A.H + Q.A.O); return [p0 * N2 / (N1 + N2) / x - 1]; } }
        };
      }
      const pB = 95.1, pT = 28.4, nB = r.int(1, 9) / 10, ask = r.pick(["P", "yB"]);
      const P = nB * pB + (1 - nB) * pT, yB = nB * pB / P;
      return {
        prompt: `Una mezcla líquida de benceno y tolueno, que se comporta como solución ideal, tiene fracción molar de benceno $${dn(nB, 1)}$. A 25 °C las presiones de vapor puras son $${dn(pB, 1)}$ mmHg (benceno) y $${dn(pT, 1)}$ mmHg (tolueno). ${ask === "P" ? "¿Cuál es la presión de vapor total (mmHg)?" : "¿Cuál es la fracción molar de benceno en el vapor?"}`,
        answer: ask === "P" ? P : yB, tolerance: 0.01,
        solution: [`[[qg-raoult|Raoult]] para cada componente: $p_B = x_Bp_B^\\circ = ${dn(nB * pB, 2)}$ mmHg y $p_T = x_Tp_T^\\circ = ${dn((1 - nB) * pT, 2)}$ mmHg.`,
          ask === "P" ? `Por [[qg-dalton|Dalton]], $P = p_B + p_T \\approx ${dn(P, 2)}$ mmHg.` : `En el vapor, $y_B = \\frac{p_B}{P} = \\frac{${dn(nB * pB, 2)}}{${dn(P, 2)}} \\approx ${dn(yB, 3)}$: el vapor es más rico en el componente más volátil (base de la destilación).`],
        traps: ask === "yB" ? [{ value: nB, msg: "Esa es la fracción en el líquido: el vapor se enriquece en el más volátil." }] : [],
        // verificación: se cuentan las moléculas de cada especie en el vapor como gases ideales en 1 L a 25 °C
        verify: { kind: "zero", tol: 1e-9, fn: x => {
          const nBv = nB * pB / 760 * 1 / (Q.R * 298.15), nTv = (1 - nB) * pT / 760 * 1 / (Q.R * 298.15);
          return ask === "P" ? [(nBv + nTv) * Q.R * 298.15 * 760 / x - 1] : [nBv / (nBv + nTv) / x - 1];
        } }
      };
    }
  };
  T["qg-coligativas-order"] = {
    type: "order", concepts: ["qg-coligativas"], difficulty: 2,
    generate(r) {
      const opts = r.sample([[0.1, "C6H12O6"], [0.1, "NaCl"], [0.1, "CaCl2"], [0.15, "C12H22O11"], [0.05, "Na2SO4"], [0.08, "KNO3"], [0.2, "CH4N2O"], [0.04, "AlCl3"], [0.06, "MgSO4"]], 4);
      const iOf = f => SOLU.find(s => s[0] === f)[1], part = ([c, f]) => c * iOf(f);
      if (new Set(opts.map(o => +part(o).toFixed(6))).size < 4) return null;
      // de mayor a menor punto de congelación = de menos a más partículas
      const sorted = opts.slice().sort((a, b) => part(a) - part(b));
      return {
        prompt: `Ordená estas soluciones acuosas de **mayor a menor punto de congelación** (disociación completa de las sales): ${opts.map(([c, f]) => `$${dn(c, 2)}$ m de $${tx(f)}$`).join(", ")}.`,
        steps: sorted.map(([c, f]) => `$${dn(c, 2)}$ m de $${tx(f)}$ ($i\\,m = ${dn(c * iOf(f), 2)}$)`),
        solution: [`El descenso del punto de congelación es $\\Delta T_f = i\\,K_f\\,m$: depende de la concentración de **partículas** $i\\,m$, no de qué partículas son ([[qg-coligativas|propiedad coligativa]]).`, `Menos partículas → menor descenso → congela a mayor temperatura.`],
        // verificación: con K_f del agua calculada por la termodinámica, se calculan los puntos de congelación y se ordenan
        verify: { kind: "truth", target: true, fn: () => {
          const K = Kthermo("agua", "f"), tf = o => 0 - iOf(o[1]) * K * o[0];
          return opts.slice().sort((a, b) => tf(b) - tf(a)).map(o => o[1]).join() === sorted.map(o => o[1]).join();
        } }
      };
    }
  };
  T["qg-coloides-vf"] = {
    type: "tf", concepts: ["qg-coligativas"], difficulty: 1,
    generate(r) {
      // tamaño de partícula (nm) de distintos sistemas: solución < 1 nm, coloide 1–1000 nm, suspensión > 1000 nm
      const SYS = [["agua salada", 0.3], ["leche", 400], ["niebla", 800], ["agua con arena", 50000], ["gelatina", 30], ["humo", 200], ["agua azucarada", 0.8], ["sangre (plasma con proteínas)", 8], ["agua barrosa", 20000], ["mayonesa", 600]];
      const [sys, d] = r.pick(SYS), kind = d < 1 ? "solución" : d <= 1000 ? "coloide" : "suspensión", claim = r.pick(["solución", "coloide", "suspensión"]);
      return {
        prompt: `<b>Verdadero o falso:</b> ${sys} es ${claim === "coloide" ? "un sistema coloidal" : claim === "solución" ? "una solución verdadera" : "una suspensión"}.`,
        answer: kind === claim,
        explanation: `Sus partículas dispersas miden del orden de ${dn(d, 1).replace("{,}", ",")} nm: es ${kind === "coloide" ? "un **coloide** (entre 1 y 1000 nm: dispersa la luz, efecto Tyndall, y no sedimenta)" : kind === "solución" ? "una **solución** (partículas de menos de 1 nm: no dispersa la luz)" : "una **suspensión** (partículas de más de 1 μm: sedimenta y se puede filtrar)"}.`,
        solution: [`La diferencia entre solución, [[qg-coligativas|coloide]] y suspensión es el tamaño de las partículas dispersas.`],
        // verificación: clasificación por el tamaño, con los límites expresados en metros
        verify: { kind: "truth", fn: () => { const m = d * 1e-9, k2 = m < 1e-9 ? "solución" : m <= 1e-6 ? "coloide" : "suspensión"; return k2 === claim; } }
      };
    }
  };

  const cards = {
    "qg-raoult": {
      title: "Presión de vapor de soluciones: ley de Raoult", aliases: ["ley de Raoult", "descenso de la presión de vapor", "solución ideal", "destilación fraccionada"], concepts: ["qg-raoult"],
      summary: "En una solución ideal, cada componente volátil aporta p_i = x_i·p_i° (Raoult). Un soluto no volátil baja la presión de vapor del solvente en proporción a su fracción molar. El vapor es más rico en el componente más volátil.",
      def: [R`**Ley de Raoult:** en una solución ideal, la presión parcial de vapor de cada componente es su fracción molar en el líquido por su presión de vapor puro: $p_i = x_i\,p_i^\circ$ (ver [[qg-liquidos|presión de vapor]]).`,
        R`Con un soluto **no volátil**, solo el solvente aporta vapor: $p = x_{solv}\,p^\circ$, y el **descenso** es $\Delta p = x_{soluto}\,p^\circ$.`,
        R`Con dos componentes volátiles, la presión total es $P = x_Ap_A^\circ + x_Bp_B^\circ$ ([[qg-dalton|Dalton]]) y la fracción en el vapor es $y_A = \frac{x_Ap_A^\circ}{P}$: el vapor se enriquece en el más volátil, lo que permite separarlos por **destilación fraccionada**.`],
      idea: [R`Las moléculas de soluto ocupan parte de la superficie y "le quitan lugar" al solvente para escaparse. Por eso la presión de vapor baja en proporción a cuántas moléculas de soluto hay, sin importar cuáles son: es el origen de todas las [[qg-coligativas|propiedades coligativas]].`],
      demo: [R`**Paso 1 (equilibrio dinámico).** En equilibrio, las moléculas de solvente que se evaporan por unidad de tiempo igualan a las que se condensan. La evaporación es proporcional a cuántas moléculas de solvente hay en la superficie, o sea a $x_{solv}$; la condensación, a la presión del vapor $p$.`,
        R`**Paso 2 (solvente puro).** Con $x_{solv} = 1$, el equilibrio se da a $p^\circ$: $k_{ev}\cdot1 = k_{cond}\,p^\circ$.`,
        R`**Paso 3 (solución).** Con soluto, $k_{ev}\,x_{solv} = k_{cond}\,p$. Dividiendo por la igualdad del paso 2: $p = x_{solv}\,p^\circ$. $\blacksquare$`],
      examples: [{ q: R`50 g de glucosa en 200 g de agua a 25 °C ($p^\circ = 23{,}76$ mmHg).`, steps: [R`$n_{gluc} = 0{,}2775$; $n_{agua} = 11{,}10$; $x_{agua} = 0{,}9756$.`, R`$p \approx 23{,}18$ mmHg.`] }],
      see: ["qg-liquidos", "qg-coligativas", "qg-dalton"]
    },
    "qg-coligativas": {
      title: "Propiedades coligativas y coloides", aliases: ["propiedades coligativas", "propiedad coligativa", "descenso crioscópico", "ascenso ebulloscópico", "presión osmótica", "ósmosis", "factor de van 't Hoff", "constante crioscópica", "coloide", "coloides", "efecto Tyndall"], concepts: ["qg-coligativas"],
      summary: "Dependen solo de la concentración de partículas de soluto: descenso crioscópico ΔT_f = i·K_f·m, ascenso ebulloscópico ΔT_b = i·K_b·m y presión osmótica π = i·M·R·T. Sirven para medir masas molares. Un coloide tiene partículas de 1 a 1000 nm y dispersa la luz (Tyndall).",
      def: [R`Las **propiedades coligativas** de una solución diluida dependen de cuántas partículas de soluto hay, no de cuáles:
- **descenso de la presión de vapor** ([[qg-raoult|Raoult]]);
- **descenso crioscópico:** $\Delta T_f = i\,K_f\,m$ (para el agua, $K_f = 1{,}86$ °C·kg/mol);
- **ascenso ebulloscópico:** $\Delta T_b = i\,K_b\,m$ (agua: $K_b = 0{,}512$);
- **presión osmótica:** $\pi = i\,M\,RT$ (ecuación de van 't Hoff), la presión que hay que aplicar para frenar el paso de solvente a través de una membrana semipermeable (**ósmosis**).`,
        R`El **factor de van 't Hoff** $i$ es la cantidad de partículas que da cada unidad de soluto: 1 para no electrolitos (glucosa), 2 para NaCl, 3 para CaCl₂ (en la práctica algo menor, por los pares iónicos).`,
        R`**Coloides:** sistemas con partículas dispersas de 1 a 1000 nm (leche, gelatina, niebla, humo). No sedimentan ni se filtran con papel, pero dispersan la luz (**efecto Tyndall**). Son **hidrofílicos** si la fase dispersa tiene afinidad por el agua (proteínas) o **hidrofóbicos** si no (y se estabilizan con cargas adsorbidas).`],
      idea: [R`Todo sale de que el soluto "diluye" al solvente y le baja la tendencia a escapar (su potencial químico). Para que el líquido vuelva a estar en equilibrio con el sólido o con el vapor, hay que bajar la temperatura de congelación o subir la de ebullición. Por eso se echa sal en las rutas heladas, y por eso un glóbulo rojo revienta en agua pura.`,
        R`La presión osmótica es enorme: una solución 0,1 M a 25 °C tiene $\pi \approx 2{,}4$ atm. Por eso se usa para medir masas molares de proteínas, que dan descensos crioscópicos ínfimos.`],
      demo: [R`**Paso 1 (de dónde sale $K_b$).** Por [[qg-raoult|Raoult]], el soluto baja la presión de vapor en $\Delta p \approx x_s\,p^\circ$. Para volver a hervir, hay que subir $T$ hasta recuperar esa presión, siguiendo la curva de [[qg-liquidos|Clausius-Clapeyron]]: $\frac{\Delta p}{p^\circ} \approx \frac{\Delta H_{vap}}{RT_b^2}\Delta T_b$.`,
        R`**Paso 2 (despejar).** $\Delta T_b \approx \frac{RT_b^2}{\Delta H_{vap}}x_s$. En una solución diluida, $x_s \approx \frac{n_s}{n_{solv}} = m\,M_{solv}$ (con $M_{solv}$ en kg/mol).`,
        R`**Paso 3 (la constante).** Queda $\Delta T_b = K_b\,m$ con $K_b = \frac{RT_b^2M_{solv}}{\Delta H_{vap}}$. Para el agua: $\frac{8{,}314\cdot373{,}15^2\cdot0{,}018}{40\,650} \approx 0{,}512$. Lo mismo con la fusión da $K_f = 1{,}86$. Con $i$ partículas por unidad, se multiplica por $i$. $\blacksquare$`],
      examples: [{ q: R`¿Dónde congela el agua con 58,4 g de NaCl por kg?`, steps: [R`$m = 1$; $i = 2$: $\Delta T_f = 2\cdot1{,}86\cdot1 = 3{,}72$ °C.`, R`Congela a −3,72 °C.`] }],
      see: ["qg-raoult", "qg-concentracion", "qg-liquidos"]
    }
  };

  E.extendCourse("q101", {
    concepts: { "qg-raoult": { name: "Ley de Raoult" }, "qg-coligativas": { name: "Propiedades coligativas" } },
    templates: T,
    units: [{
      id: "qg-coligativas-u", order: 7, program: "Unidad 5", title: "Propiedades coligativas", icon: "flask-conical",
      diagnostic: ["qg-raoult-num", "qg-crioscopia-num", "qg-osmotica-num"],
      lessons: [
        { id: "qg-l-raoult", title: "Ley de Raoult", templates: ["qg-raoult-num"], theory: ["qg-raoult"],
          intro: R`$p_i = x_i\,p_i^\circ$. Un soluto no volátil baja la presión de vapor.` },
        { id: "qg-l-crioscopia", title: "Crioscopía y ebulloscopía", templates: ["qg-crioscopia-num", "qg-coligativas-order"], theory: ["qg-coligativas"],
          intro: R`$\Delta T = i\,K\,m$: cuentan las partículas.` },
        { id: "qg-l-osmosis", title: "Presión osmótica y coloides", templates: ["qg-osmotica-num", "qg-coloides-vf"], theory: ["qg-coligativas"],
          intro: R`$\pi = i\,M\,RT$. Coloide: partículas de 1 a 1000 nm, efecto Tyndall.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 6 · CINÉTICA QUÍMICA
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, Q = E.qg, nf = Q.nf, dn = Q.dn;
  const T = {};
  const tx = f => Q.tex(f);
  // RK4 de una ecuación escalar, devuelve y(t1)
  const rk4 = (f, y, a, b, n = 4000) => { const h = (b - a) / n; let t = a; for (let i = 0; i < n; i++) { const k1 = f(t, y), k2 = f(t + h / 2, y + h * k1 / 2), k3 = f(t + h / 2, y + h * k2 / 2), k4 = f(t + h, y + h * k3); y += h * (k1 + 2 * k2 + 2 * k3 + k4) / 6; t += h; } return y; };
  Q.rk4 = rk4;

  const RXV = [
    { tex: R`2\,\mathrm{N_2O_5} \to 4\,\mathrm{NO_2} + \mathrm{O_2}`, sp: [["N_2O_5", -2], ["NO_2", 4], ["O_2", 1]] },
    { tex: R`\mathrm{N_2} + 3\,\mathrm{H_2} \to 2\,\mathrm{NH_3}`, sp: [["N_2", -1], ["H_2", -3], ["NH_3", 2]] },
    { tex: R`2\,\mathrm{NO} + \mathrm{O_2} \to 2\,\mathrm{NO_2}`, sp: [["NO", -2], ["O_2", -1], ["NO_2", 2]] },
    { tex: R`4\,\mathrm{NH_3} + 5\,\mathrm{O_2} \to 4\,\mathrm{NO} + 6\,\mathrm{H_2O}`, sp: [["NH_3", -4], ["O_2", -5], ["NO", 4], ["H_2O", 6]] },
    { tex: R`2\,\mathrm{H_2O_2} \to 2\,\mathrm{H_2O} + \mathrm{O_2}`, sp: [["H_2O_2", -2], ["H_2O", 2], ["O_2", 1]] }
  ];
  T["qg-velocidad-relativa-num"] = {
    type: "numeric", concepts: ["qg-velocidad"], difficulty: 1,
    generate(r) {
      const x = r.pick(RXV), [a, b] = r.sample(x.sp, 2), v = r.pick([12, 25, 40, 60, 150, 300]);   // en mM/s
      const ans = v * Math.abs(b[1]) / Math.abs(a[1]);
      const verb = s => (s[1] < 0 ? "se consume" : "se forma");
      return {
        prompt: `En la reacción $${x.tex}$, en cierto instante el $\\mathrm{${a[0]}}$ ${verb(a)} a $${dn(v, 3)}$ mM/s. ¿A qué velocidad (mM/s) ${verb(b)} el $\\mathrm{${b[0]}}$?`,
        answer: ans, tolerance: 0.01,
        solution: [`La [[qg-velocidad|velocidad de reacción]] es la misma para todas las especies si se divide por el coeficiente: $v = \\frac{1}{|\\nu_i|}\\left|\\frac{d[i]}{dt}\\right|$.`,
          `$\\frac{${dn(v, 3)}}{${Math.abs(a[1])}} = ${nf(v / Math.abs(a[1]), 4)}$ mM/s; para el $\\mathrm{${b[0]}}$: $${Math.abs(b[1])}\\cdot${nf(v / Math.abs(a[1]), 4)} = ${nf(ans, 4)}$ mM/s.`],
        traps: Math.abs(a[1]) !== Math.abs(b[1]) ? [{ value: v * Math.abs(a[1]) / Math.abs(b[1]), msg: "Invertiste la proporción: la especie con coeficiente mayor cambia más rápido." }] : [],
        // verificación: la reacción avanza en pasitos de un "mol de reacción" y se miden los cambios de cada especie
        verify: { kind: "zero", tol: 1e-9, fn: y => {
          const c = Object.fromEntries(x.sp.map(([s]) => [s, 1])), dt = 1e-3, xi = v / Math.abs(a[1]) * dt;
          for (const [s, nu] of x.sp) c[s] += nu * xi;
          return [Math.abs(c[b[0]] - 1) / dt / y - 1];
        } }
      };
    }
  };
  T["qg-orden-inicial-num"] = {
    type: "numeric", concepts: ["qg-velocidad"], difficulty: 3,
    generate(r) {
      const m = r.int(0, 2), n = r.int(1, 2), k = r.pick([0.02, 0.15, 0.5, 1.2, 3.4, 8]), ask = r.pick(["m", "n", "k"]);
      const A = [0.1, 0.2, 0.1], B = [0.1, 0.1, 0.3];
      const v = A.map((a, i) => k * a ** m * B[i] ** n);
      const vs = v.map(x => +x.toPrecision(3));
      const kAns = vs[0] / (A[0] ** m * B[0] ** n);
      return {
        prompt: `Para $\\mathrm{A} + \\mathrm{B} \\to$ productos se midieron las velocidades iniciales: ${A.map((a, i) => `exp. ${i + 1}: $[\\mathrm A]_0 = ${dn(a, 2)}$ M, $[\\mathrm B]_0 = ${dn(B[i], 2)}$ M, $v_0 = ${nf(vs[i], 3)}$ M/s`).join("; ")}. ${ask === "m" ? "¿Cuál es el orden respecto de A?" : ask === "n" ? "¿Cuál es el orden respecto de B?" : `Sabiendo que la ley es $v = k[\\mathrm A]^{${m}}[\\mathrm B]^{${n}}$, ¿cuánto vale $k$?`}`,
        answer: ask === "m" ? m : ask === "n" ? n : kAns, tolerance: 0.01,
        solution: [`[[qg-velocidad|Método de las velocidades iniciales]]: se comparan experimentos donde cambia una sola concentración.`,
          `Exp. 1 y 2: $[\\mathrm A]$ se duplica y $v$ se multiplica por $${dn(vs[1] / vs[0], 2)} = 2^{${m}}$: orden ${m} en A. Exp. 1 y 3: $[\\mathrm B]$ se triplica y $v$ se multiplica por $${dn(vs[2] / vs[0], 2)} = 3^{${n}}$: orden ${n} en B.`,
          ask === "k" ? `$k = \\frac{v_1}{[\\mathrm A]^{${m}}[\\mathrm B]^{${n}}} = \\frac{${nf(vs[0], 3)}}{${dn(A[0], 2)}^{${m}}\\cdot${dn(B[0], 2)}^{${n}}} \\approx ${nf(kAns, 3)}$ (unidades de $\\mathrm{M^{${1 - m - n}}\\,s^{-1}}$).` : `La ley es $v = k[\\mathrm A]^{${m}}[\\mathrm B]^{${n}}$.`],
        // verificación: ajuste por mínimos cuadrados de ln v = ln k + m ln[A] + n ln[B] con los tres experimentos (sistema 3×3 por Gauss)
        verify: { kind: "zero", tol: 1e-2, fn: y => {
          const M3 = A.map((a, i) => [1, Math.log(a), Math.log(B[i]), Math.log(vs[i])]);
          for (let c = 0; c < 3; c++) { const p = M3.reduce((bi, row, j) => (j >= c && Math.abs(row[c]) > Math.abs(M3[bi][c]) ? j : bi), c); [M3[c], M3[p]] = [M3[p], M3[c]]; for (let j = 0; j < 3; j++) if (j !== c) { const f = M3[j][c] / M3[c][c]; for (let q = c; q < 4; q++) M3[j][q] -= f * M3[c][q]; } }
          const sol = M3.map((row, i) => row[3] / row[i]), mi = Math.round(sol[1]), ni = Math.round(sol[2]);
          const kfit = Math.exp(A.reduce((t, a, i) => t + Math.log(vs[i]) - mi * Math.log(a) - ni * Math.log(B[i]), 0) / 3);
          const got = ask === "m" ? sol[1] : ask === "n" ? sol[2] : kfit;
          return [ask === "k" ? got / y - 1 : got - y];
        } }
      };
    }
  };
  T["qg-integrada-num"] = {
    type: "numeric", concepts: ["qg-integradas"], difficulty: 2,
    generate(r) {
      const ord = r.int(0, 2), A0 = r.pick([0.2, 0.5, 0.8, 1, 1.5, 2]), ask = r.pick(["C", "t"]);
      const k = ord === 0 ? r.pick([0.002, 0.005, 0.01]) : ord === 1 ? r.pick([0.0025, 0.01, 0.035, 0.12]) : r.pick([0.01, 0.05, 0.2, 0.6]);
      const C = t => (ord === 0 ? A0 - k * t : ord === 1 ? A0 * Math.exp(-k * t) : A0 / (1 + k * A0 * t));
      const tq = r.pick([10, 20, 30, 60, 100]), frac = r.pick([0.25, 0.4, 0.6, 0.75]), Cf = frac * A0;
      const tAns = ord === 0 ? (A0 - Cf) / k : ord === 1 ? Math.log(A0 / Cf) / k : (1 / Cf - 1 / A0) / k;
      if (ask === "C" && C(tq) <= 0.02 * A0) return null;
      const unitK = ord === 0 ? "M/s" : ord === 1 ? "s^{-1}" : "M^{-1}\\,s^{-1}";
      return {
        prompt: ask === "C" ? `Una reacción $\\mathrm A \\to$ productos es de orden ${ord} con $k = ${nf(k, 3)}\\ \\mathrm{${unitK}}$. Si $[\\mathrm A]_0 = ${dn(A0, 2)}$ M, ¿cuánto vale $[\\mathrm A]$ (M) a los $${tq}$ s?`
          : `Una reacción $\\mathrm A \\to$ productos es de orden ${ord} con $k = ${nf(k, 3)}\\ \\mathrm{${unitK}}$ y $[\\mathrm A]_0 = ${dn(A0, 2)}$ M. ¿Cuántos segundos tarda en quedar el $${dn(frac * 100, 0)}\\,\\%$ de A?`,
        answer: ask === "C" ? C(tq) : tAns, tolerance: 0.01,
        solution: [`[[qg-integradas|Ley integrada]] de orden ${ord}: ${ord === 0 ? "$[\\mathrm A] = [\\mathrm A]_0 - kt$" : ord === 1 ? "$\\ln[\\mathrm A] = \\ln[\\mathrm A]_0 - kt$" : "$\\frac1{[\\mathrm A]} = \\frac1{[\\mathrm A]_0} + kt$"}.`,
          ask === "C" ? `$[\\mathrm A] \\approx ${nf(C(tq), 4)}$ M.` : `Con $[\\mathrm A] = ${nf(Cf, 3)}$ M: $t \\approx ${dn(tAns, 1)}$ s.`],
        traps: ord !== 1 && ask === "t" ? [{ value: Math.log(1 / frac) / k, msg: "Esa es la fórmula de primer orden; la reacción es de otro orden." }].filter(t => Math.abs(t.value / tAns - 1) > 0.02) : [],
        // verificación: se integra d[A]/dt = −k[A]^n con RK4 (hasta el tiempo dado, o hasta que [A] llegue al valor pedido)
        verify: ask === "C"
          ? { kind: "ode", f: (t, y) => [-k * Math.max(y[0], 0) ** ord], y0: [A0], t1: tq, dt: tq / 4000, out: (t, y) => y[0] }
          : { kind: "ode", f: (t, y) => [-k * Math.max(y[0], 0) ** ord], y0: [A0], t1: 0, dt: tAns / 4000, until: (t, y) => y[0] <= Cf, g: (t, y) => y[0] - Cf, tmax: 10 * tAns, out: t => t }
      };
    }
  };
  T["qg-vida-media-num"] = {
    type: "numeric", concepts: ["qg-integradas"], difficulty: 2,
    generate(r) {
      const ask = r.pick(["thalf", "k", "resto"]), k = r.pick([0.0069, 0.0231, 0.0462, 0.1155, 0.3466]), th = Math.log(2) / k;
      const thShow = +th.toFixed(1), nHalf = r.int(2, 5), m0 = r.pick([80, 100, 160, 200]);
      const ans = ask === "thalf" ? th : ask === "k" ? Math.log(2) / thShow : m0 * 0.5 ** nHalf;
      return {
        prompt: ask === "thalf" ? `Una reacción de primer orden tiene $k = ${dn(k, 4)}\\ \\mathrm{min^{-1}}$. ¿Cuál es su vida media (min)?`
          : ask === "k" ? `Una reacción de primer orden tiene vida media de $${dn(thShow, 1)}$ min. ¿Cuánto vale $k$ ($\\mathrm{min^{-1}}$)?`
          : `Un reactivo se descompone con cinética de primer orden y vida media de $${dn(thShow, 1)}$ min. Si al principio hay $${m0}$ mg, ¿cuántos mg quedan a los $${dn(nHalf * thShow, 1)}$ min?`,
        answer: ans, tolerance: 0.01,
        solution: [`En primer orden, la [[qg-integradas|vida media]] no depende de la concentración: $t_{1/2} = \\frac{\\ln 2}{k}$.`,
          ask === "thalf" ? `$t_{1/2} = \\frac{0{,}693}{${dn(k, 4)}} \\approx ${dn(th, 1)}$ min.` : ask === "k" ? `$k = \\frac{0{,}693}{${dn(thShow, 1)}} \\approx ${dn(ans, 4)}\\ \\mathrm{min^{-1}}$.` : `Pasaron ${nHalf} vidas medias: queda $${m0}\\cdot\\left(\\frac12\\right)^{${nHalf}} = ${dn(ans, 2)}$ mg.`],
        traps: ask === "resto" ? [{ value: m0 / (2 * nHalf), msg: "Cada vida media se reduce a la **mitad** lo que había: es $(\\frac12)^n$, no $\\frac1{2n}$." }].filter(t => Math.abs(t.value / ans - 1) > 0.02) : [],
        // verificación: integración de dm/dt = −km con RK4 (para la vida media: hasta que quede la mitad)
        verify: ask === "resto" ? { kind: "ode", f: (t, y) => [-Math.log(2) / thShow * y[0]], y0: [m0], t1: nHalf * thShow, dt: 0.01, out: (t, y) => y[0] }
          : ask === "thalf" ? { kind: "ode", f: (t, y) => [-k * y[0]], y0: [1], t1: 0, dt: th / 4000, until: (t, y) => y[0] <= 0.5, g: (t, y) => y[0] - 0.5, tmax: 10 * th, out: t => t }
          : { kind: "zero", tol: 1e-6, fn: x => [rk4((t, y) => -x * y, 1, 0, thShow) - 0.5] }
      };
    }
  };
  T["qg-arrhenius-num"] = {
    type: "numeric", concepts: ["qg-arrhenius"], difficulty: 3,
    generate(r) {
      const Ea = r.pick([40, 50, 75, 90, 120]), T1 = r.pick([290, 298, 300, 310]), T2 = T1 + r.pick([10, 20, 30, 50]), k1 = r.pick([0.002, 0.015, 0.08, 1.4]), ask = r.pick(["k2", "Ea", "factor"]);
      const k2 = k1 * Math.exp(-Ea * 1000 / Q.Rsi * (1 / T2 - 1 / T1)), k2s = +k2.toPrecision(3);
      const EaAns = Q.Rsi * Math.log(k2s / k1) / (1 / T1 - 1 / T2) / 1000;
      return {
        prompt: ask === "k2" ? `Una reacción tiene $E_a = ${Ea}$ kJ/mol y $k = ${nf(k1, 3)}\\ \\mathrm{s^{-1}}$ a $${T1}$ K. ¿Cuánto vale $k$ ($\\mathrm{s^{-1}}$) a $${T2}$ K?`
          : ask === "Ea" ? `La constante de velocidad de una reacción vale $${nf(k1, 3)}\\ \\mathrm{s^{-1}}$ a $${T1}$ K y $${nf(k2s, 3)}\\ \\mathrm{s^{-1}}$ a $${T2}$ K. ¿Cuál es la energía de activación (kJ/mol)?`
          : `Una reacción tiene $E_a = ${Ea}$ kJ/mol. ¿Por cuánto se multiplica su velocidad al pasar de $${T1}$ K a $${T2}$ K?`,
        answer: ask === "k2" ? k2 : ask === "Ea" ? EaAns : k2 / k1, tolerance: 0.01,
        solution: [`[[qg-arrhenius|Arrhenius]]: $k = A\\,e^{-E_a/RT}$, así que $\\ln\\frac{k_2}{k_1} = -\\frac{E_a}{R}\\left(\\frac1{T_2} - \\frac1{T_1}\\right)$, con $R = 8{,}314$ J/(mol·K).`,
          ask === "Ea" ? `$E_a = \\frac{R\\ln(k_2/k_1)}{\\frac1{T_1} - \\frac1{T_2}} = \\frac{8{,}314\\cdot${dn(Math.log(k2s / k1), 4)}}{${nf(1 / T1 - 1 / T2, 4)}} \\approx ${dn(EaAns, 1)}$ kJ/mol.`
            : `$\\ln\\frac{k_2}{k_1} = -\\frac{${Ea * 1000}}{8{,}314}\\left(\\frac1{${T2}} - \\frac1{${T1}}\\right) \\approx ${dn(Math.log(k2 / k1), 4)}$: $\\frac{k_2}{k_1} \\approx ${dn(k2 / k1, 3)}$${ask === "k2" ? `, $k_2 \\approx ${nf(k2, 3)}\\ \\mathrm{s^{-1}}$` : ""}.`],
        traps: ask === "Ea" ? [{ value: EaAns * 1000, msg: "Eso está en J/mol: pasalo a kJ/mol." }] : [],
        // verificación: se integra d(ln k)/dT = Ea/(RT²) con RK4 entre las dos temperaturas
        verify: { kind: "zero", tol: 1e-6, fn: x => {
          const ea = (ask === "Ea" ? x : Ea) * 1000, lnk2 = rk4((t, y) => ea / (Q.Rsi * t * t), Math.log(k1), T1, T2);
          return ask === "k2" ? [lnk2 - Math.log(x)] : ask === "Ea" ? [lnk2 - Math.log(k2s)] : [lnk2 - Math.log(k1 * x)];
        } }
      };
    }
  };
  T["qg-grafico-mc"] = {
    type: "mc", concepts: ["qg-integradas"], difficulty: 2,
    generate(r) {
      const ord = r.int(0, 2), PLOT = ["[A] en función de t", "ln[A] en función de t", "1/[A] en función de t", "[A]² en función de t"], inverse = r.bool();
      const ORD = ["orden 0", "orden 1", "orden 2", "orden 3"];
      const ok = inverse ? ORD[ord] : PLOT[ord], mcq = H.mc(r, ok, (inverse ? ORD : PLOT).filter(p => p !== ok), { text: true });
      return {
        prompt: inverse ? `En una reacción $\\mathrm A \\to$ productos, el gráfico de ${PLOT[ord]} da una recta. ¿De qué orden es la reacción?` : `Para una reacción $\\mathrm A \\to$ productos de orden ${ord}, ¿qué gráfico da una recta?`,
        options: mcq.options, correct: mcq.correct,
        solution: [`Las [[qg-integradas|leyes integradas]] son rectas: orden 0, $[\\mathrm A] = [\\mathrm A]_0 - kt$; orden 1, $\\ln[\\mathrm A] = \\ln[\\mathrm A]_0 - kt$; orden 2, $\\frac1{[\\mathrm A]} = \\frac1{[\\mathrm A]_0} + kt$.`, `Para orden ${ord}: **${PLOT[ord]}**, con pendiente ${ord === 2 ? "$k$" : "$-k$"}. Así se determina el orden con datos de concentración y tiempo.`],
        // verificación: se simulan los datos con RK4 y se mide la linealidad (R²) de cada gráfico
        verify: { kind: "truth", target: true, fn: () => {
          const k = 0.04, A0 = 1, ts = [0, 4, 8, 12, 16, 20], cs = ts.map(t => rk4((s, y) => -k * Math.max(y, 0) ** ord, A0, 0, t || 1e-9, 400));
          const tr = [c => c, c => Math.log(c), c => 1 / c, c => c * c];
          const r2 = f => { const y = cs.map(f), mx = ts.reduce((a, b) => a + b) / 6, my = y.reduce((a, b) => a + b) / 6;
            let sxy = 0, sxx = 0, syy = 0; ts.forEach((t, i) => { sxy += (t - mx) * (y[i] - my); sxx += (t - mx) ** 2; syy += (y[i] - my) ** 2; }); return sxy * sxy / (sxx * syy); };
          const best = tr.map(r2).reduce((bi, v, i, arr) => (v > arr[bi] ? i : bi), 0);
          return best === ord && r2(tr[ord]) > 1 - 1e-9;
        } }
      };
    }
  };

  const cards = {
    "qg-velocidad": {
      title: "Velocidad de reacción y ley de velocidad", aliases: ["velocidad de reacción", "ley de velocidad", "orden de reacción", "constante de velocidad", "método de las velocidades iniciales", "cinética química"], concepts: ["qg-velocidad"],
      summary: "Para aA + bB → cC, v = −(1/a)d[A]/dt = (1/c)d[C]/dt. La ley de velocidad v = k[A]^m[B]^n se determina experimentalmente: los órdenes m y n no tienen por qué coincidir con los coeficientes. Con velocidades iniciales se comparan experimentos donde cambia una sola concentración.",
      def: [R`La **velocidad de reacción** mide cuánto cambian las concentraciones por unidad de tiempo, dividido por los coeficientes para que dé lo mismo con cualquier especie: para $a\mathrm A + b\mathrm B \to c\mathrm C$, $v = -\frac1a\frac{d[\mathrm A]}{dt} = -\frac1b\frac{d[\mathrm B]}{dt} = \frac1c\frac{d[\mathrm C]}{dt}$.`,
        R`**Ley de velocidad:** $v = k[\mathrm A]^m[\mathrm B]^n$. Los **órdenes** $m$ y $n$ se miden; el orden global es $m + n$. La **constante de velocidad** $k$ depende de la temperatura, y sus unidades dependen del orden ($\mathrm{M^{1 - (m+n)}\,s^{-1}}$).`,
        R`**Método de las velocidades iniciales:** se mide $v_0$ con distintas concentraciones iniciales. Si al multiplicar $[\mathrm A]$ por $f$ (con $[\mathrm B]$ fijo) la velocidad se multiplica por $f^m$, el orden en A es $m$.`,
        R`Factores que afectan la velocidad: concentración, temperatura ([[qg-arrhenius|Arrhenius]]), superficie de contacto (en sólidos), naturaleza de los reactivos y catalizadores.`],
      idea: [R`Los órdenes no se leen de la ecuación balanceada porque la reacción global suele ocurrir en varios pasos (el **mecanismo**), y la velocidad la fija el más lento. Solo para un paso elemental el orden coincide con el coeficiente.`],
      demo: [R`**Paso 1 (dos experimentos).** Con $[\mathrm B]$ igual: $\frac{v_2}{v_1} = \frac{k[\mathrm A]_2^m[\mathrm B]^n}{k[\mathrm A]_1^m[\mathrm B]^n} = \left(\frac{[\mathrm A]_2}{[\mathrm A]_1}\right)^m$.`,
        R`**Paso 2 (despejar).** Tomando logaritmos: $m = \frac{\ln(v_2/v_1)}{\ln([\mathrm A]_2/[\mathrm A]_1)}$. Si se duplicó $[\mathrm A]$ y $v$ se cuadruplicó, $m = 2$. $\blacksquare$`],
      examples: [{ q: R`Al duplicar [A] la velocidad se duplica; al triplicar [B], se multiplica por 9.`, steps: [R`Orden 1 en A, orden 2 en B: $v = k[\mathrm A][\mathrm B]^2$, orden global 3.`] }],
      see: ["qg-integradas", "qg-arrhenius"]
    },
    "qg-integradas": {
      title: "Leyes integradas y vida media", aliases: ["ley de velocidad integrada", "leyes integradas", "tiempo de vida media", "reacción de primer orden", "reacción de segundo orden"], concepts: ["qg-integradas"],
      summary: "Orden 0: [A] = [A]₀ − kt. Orden 1: ln[A] = ln[A]₀ − kt, con t½ = ln2/k (constante). Orden 2: 1/[A] = 1/[A]₀ + kt, con t½ = 1/(k[A]₀). El gráfico que da recta indica el orden.",
      def: [R`Para $\mathrm A \to$ productos con $v = -\frac{d[\mathrm A]}{dt} = k[\mathrm A]^n$:
- **orden 0:** $[\mathrm A] = [\mathrm A]_0 - kt$, $t_{1/2} = \frac{[\mathrm A]_0}{2k}$;
- **orden 1:** $[\mathrm A] = [\mathrm A]_0e^{-kt}$, o sea $\ln[\mathrm A] = \ln[\mathrm A]_0 - kt$, $t_{1/2} = \frac{\ln 2}k$;
- **orden 2:** $\frac1{[\mathrm A]} = \frac1{[\mathrm A]_0} + kt$, $t_{1/2} = \frac1{k[\mathrm A]_0}$.`,
        R`La **vida media** $t_{1/2}$ es el tiempo en que la concentración baja a la mitad. Solo en primer orden es constante: después de $n$ vidas medias queda $(\frac12)^n$ (como en la desintegración radiactiva).`],
      idea: [R`Graficando los datos de tres formas ($[\mathrm A]$, $\ln[\mathrm A]$ y $\frac1{[\mathrm A]}$ contra $t$), la que da una recta revela el orden, y la pendiente da $k$.`],
      demo: [R`**Paso 1 (orden 1).** $\frac{d[\mathrm A]}{dt} = -k[\mathrm A]$. Separando: $\frac{d[\mathrm A]}{[\mathrm A]} = -k\,dt$; integrando desde 0: $\ln\frac{[\mathrm A]}{[\mathrm A]_0} = -kt$.`,
        R`**Paso 2 (vida media).** Con $[\mathrm A] = \frac{[\mathrm A]_0}2$: $\ln\frac12 = -kt_{1/2}$, así que $t_{1/2} = \frac{\ln2}{k}$, sin $[\mathrm A]_0$.`,
        R`**Paso 3 (orden 2).** $\frac{d[\mathrm A]}{[\mathrm A]^2} = -k\,dt$; integrando, $-\frac1{[\mathrm A]} + \frac1{[\mathrm A]_0} = -kt$, o sea $\frac1{[\mathrm A]} = \frac1{[\mathrm A]_0} + kt$. Con la mitad: $\frac2{[\mathrm A]_0} - \frac1{[\mathrm A]_0} = kt_{1/2}$. $\blacksquare$`],
      examples: [{ q: R`Primer orden con $t_{1/2} = 20$ min. ¿Qué fracción queda a la hora?`, steps: [R`Son 3 vidas medias: $(\frac12)^3 = \frac18$.`] }],
      see: ["qg-velocidad", "edo", "c2-edo-modelos"]
    },
    "qg-arrhenius": {
      title: "Energía de activación, Arrhenius y catálisis", aliases: ["ecuación de Arrhenius", "energía de activación", "factor de frecuencia", "teoría de las colisiones", "estado de transición", "complejo activado", "catalizador", "catálisis"], concepts: ["qg-arrhenius"],
      summary: "k = A·e^(−Ea/RT): la constante crece exponencialmente con la temperatura. Con dos temperaturas, ln(k₂/k₁) = −(Ea/R)(1/T₂ − 1/T₁). Un catalizador ofrece un camino con menor Ea, sin consumirse y sin cambiar el equilibrio.",
      def: [R`**Ecuación de Arrhenius:** $k = A\,e^{-E_a/RT}$. $E_a$ es la **energía de activación**, la barrera que hay que superar, y $A$ el **factor de frecuencia** (relacionado con cuántos choques ocurren y con qué orientación).`,
        R`**Teoría de las colisiones:** reaccionan solo los choques con energía mayor que $E_a$ y con la orientación correcta; la fracción de choques con suficiente energía es $e^{-E_a/RT}$. **Teoría del estado de transición:** en el máximo de energía se forma un **complejo activado** inestable que puede seguir a productos o volver.`,
        R`Un **catalizador** abre un mecanismo alternativo de menor $E_a$: acelera la reacción directa y la inversa por igual, no se consume y no cambia la constante de equilibrio. Es **homogéneo** si está en la misma fase que los reactivos y **heterogéneo** si no (el convertidor catalítico de un auto, las enzimas sobre su sustrato).`],
      idea: [R`Como la temperatura aparece en un exponente, un aumento chico tiene un efecto grande: con $E_a \approx 50$ kJ/mol, subir 10 °C cerca de la temperatura ambiente casi duplica la velocidad. Por eso la heladera conserva los alimentos.`],
      demo: [R`**Paso 1 (dos temperaturas).** $\ln k_1 = \ln A - \frac{E_a}{RT_1}$ y $\ln k_2 = \ln A - \frac{E_a}{RT_2}$.`,
        R`**Paso 2 (restar).** $\ln\frac{k_2}{k_1} = -\frac{E_a}{R}\left(\frac1{T_2} - \frac1{T_1}\right)$: se elimina $A$. $\blacksquare$`,
        R`**Paso 3 (gráfico).** $\ln k = \ln A - \frac{E_a}R\cdot\frac1T$ es una recta en función de $\frac1T$ con pendiente $-\frac{E_a}R$: así se mide $E_a$.`],
      examples: [{ q: R`$E_a = 50$ kJ/mol: ¿cuánto acelera de 298 K a 308 K?`, steps: [R`$\ln\frac{k_2}{k_1} = \frac{50\,000}{8{,}314}\left(\frac1{298} - \frac1{308}\right) \approx 0{,}655$: casi el doble (1,93 veces).`] }],
      see: ["qg-velocidad", "qg-equilibrio"]
    }
  };

  E.extendCourse("q101", {
    concepts: { "qg-velocidad": { name: "Ley de velocidad" }, "qg-integradas": { name: "Leyes integradas" }, "qg-arrhenius": { name: "Arrhenius y catálisis" } },
    templates: T,
    units: [{
      id: "qg-cinetica-u", order: 8, program: "Unidad 6", title: "Cinética química", icon: "timer",
      diagnostic: ["qg-velocidad-relativa-num", "qg-integrada-num", "qg-arrhenius-num"],
      lessons: [
        { id: "qg-l-velocidad", title: "Velocidad y ley de velocidad", templates: ["qg-velocidad-relativa-num", "qg-orden-inicial-num"], theory: ["qg-velocidad"],
          intro: R`$v = -\frac1a\frac{d[\mathrm A]}{dt}$; $v = k[\mathrm A]^m[\mathrm B]^n$ con órdenes medidos.` },
        { id: "qg-l-integradas", title: "Leyes integradas y vida media", templates: ["qg-grafico-mc", "qg-integrada-num", "qg-vida-media-num"], theory: ["qg-integradas"],
          intro: R`Orden 1: $\ln[\mathrm A] = \ln[\mathrm A]_0 - kt$ y $t_{1/2} = \frac{\ln2}k$.` },
        { id: "qg-l-arrhenius", title: "Temperatura y catálisis", templates: ["qg-arrhenius-num"], theory: ["qg-arrhenius"],
          intro: R`$\ln\frac{k_2}{k_1} = -\frac{E_a}R\left(\frac1{T_2} - \frac1{T_1}\right)$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 7 · EQUILIBRIO QUÍMICO
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, Q = E.qg, nf = Q.nf, dn = Q.dn;
  const T = {};
  // reacciones en fase gaseosa: especies con coeficiente (−reactivo, +producto), ΔH° (kJ/mol)
  const EQ = {
    nh3: { tex: R`\mathrm{N_2(g)} + 3\,\mathrm{H_2(g)} \rightleftharpoons 2\,\mathrm{NH_3(g)}`, sp: [["N_2", -1], ["H_2", -3], ["NH_3", 2]], dH: -92 },
    hi: { tex: R`\mathrm{H_2(g)} + \mathrm{I_2(g)} \rightleftharpoons 2\,\mathrm{HI(g)}`, sp: [["H_2", -1], ["I_2", -1], ["HI", 2]], dH: -9.5 },
    n2o4: { tex: R`\mathrm{N_2O_4(g)} \rightleftharpoons 2\,\mathrm{NO_2(g)}`, sp: [["N_2O_4", -1], ["NO_2", 2]], dH: 57 },
    so3: { tex: R`2\,\mathrm{SO_2(g)} + \mathrm{O_2(g)} \rightleftharpoons 2\,\mathrm{SO_3(g)}`, sp: [["SO_2", -2], ["O_2", -1], ["SO_3", 2]], dH: -198 },
    pcl5: { tex: R`\mathrm{PCl_5(g)} \rightleftharpoons \mathrm{PCl_3(g)} + \mathrm{Cl_2(g)}`, sp: [["PCl_5", -1], ["PCl_3", 1], ["Cl_2", 1]], dH: 88 },
    wgs: { tex: R`\mathrm{CO(g)} + \mathrm{H_2O(g)} \rightleftharpoons \mathrm{CO_2(g)} + \mathrm{H_2(g)}`, sp: [["CO", -1], ["H_2O", -1], ["CO_2", 1], ["H_2", 1]], dH: -41 },
    no: { tex: R`\mathrm{N_2(g)} + \mathrm{O_2(g)} \rightleftharpoons 2\,\mathrm{NO(g)}`, sp: [["N_2", -1], ["O_2", -1], ["NO", 2]], dH: 181 }
  };
  const Qc = (x, c) => x.sp.reduce((q, [s, nu]) => q * Math.max(c[s], 1e-300) ** nu, 1);
  const dn_gas = x => x.sp.reduce((s, [, nu]) => s + nu, 0);
  // simulación cinética: v = kf·Π[R]^ν − kr·Π[P]^ν con kf/kr = K, hasta el equilibrio (RK4 en el avance por litro)
  const simulate = (x, c0, K, tEnd = 400) => {
    const kf = 1, kr = 1 / K, conc = xi => Object.fromEntries(x.sp.map(([s, nu]) => [s, c0[s] + nu * xi]));
    const rate = xi => { const c = conc(xi); let f = kf, b = kr; for (const [s, nu] of x.sp) { if (nu < 0) f *= Math.max(c[s], 0) ** -nu; else b *= Math.max(c[s], 0) ** nu; } return f - b; };
    let xi = 0; const h = 0.01;
    for (let t = 0; t < tEnd; t += h) { const k1 = rate(xi); if (Math.abs(k1) < 1e-14) break; const k2 = rate(xi + h * k1 / 2), k3 = rate(xi + h * k2 / 2), k4 = rate(xi + h * k3); xi += h * (k1 + 2 * k2 + 2 * k3 + k4) / 6; }
    return conc(xi);
  };
  Q.eqSimulate = simulate;

  T["qg-kc-num"] = {
    type: "numeric", concepts: ["qg-equilibrio"], difficulty: 2, testN: 60,
    generate(r) {
      const key = r.pick(["pcl5", "n2o4", "hi", "wgs", "nh3"]), x = EQ[key], c0 = {}, react = x.sp.filter(s => s[1] < 0);
      for (const [s, nu] of x.sp) c0[s] = nu < 0 ? r.pick([0.5, 1, 1.5, 2]) : 0;
      const lim = Math.min(...react.map(([s, nu]) => c0[s] / -nu)), xi = +(lim * r.pick([0.2, 0.3, 0.45, 0.6, 0.75])).toFixed(3);
      const ceq = Object.fromEntries(x.sp.map(([s, nu]) => [s, c0[s] + nu * xi])), prod = x.sp.find(s => s[1] > 0), K = Qc(x, ceq);
      return {
        prompt: `En un recipiente de 1 L se colocan ${react.map(([s]) => `$${dn(c0[s], 1)}$ mol de $\\mathrm{${s}}$`).join(" y ")}, y se alcanza el equilibrio $${x.tex}$ con $${dn(ceq[prod[0]], 3)}$ mol de $\\mathrm{${prod[0]}}$. ¿Cuánto vale $K_c$?`,
        answer: K, tolerance: 0.01,
        solution: [`Tabla de [[qg-equilibrio|equilibrio]] (inicial, cambio, equilibrio): si reaccionan $x$ "moles de reacción", cada especie cambia $\\nu x$. Del dato, $x = ${dn(xi, 3)}$.`,
          `En el equilibrio: ${x.sp.map(([s]) => `$[\\mathrm{${s}}] = ${dn(ceq[s], 3)}$`).join(", ")}.`,
          `$K_c = \\frac{${x.sp.filter(s => s[1] > 0).map(([s, nu]) => `[\\mathrm{${s}}]${nu > 1 ? `^{${nu}}` : ""}`).join("")}}{${react.map(([s, nu]) => `[\\mathrm{${s}}]${-nu > 1 ? `^{${-nu}}` : ""}`).join("")}} \\approx ${nf(K, 4)}$.`],
        traps: [{ value: 1 / K, msg: "Invertiste el cociente: en $K_c$ van los productos arriba." }].filter(t => Math.abs(t.value / K - 1) > 0.05),
        // verificación: con ese K se simula la reacción directa e inversa (kf/kr = K) desde el estado inicial hasta el equilibrio
        verify: { kind: "zero", tol: 1e-3, fn: Kx => { const c = simulate(x, c0, Kx, 300); return [c[prod[0]] / ceq[prod[0]] - 1]; } }
      };
    }
  };
  T["qg-ice-num"] = {
    type: "numeric", concepts: ["qg-equilibrio"], difficulty: 3, testN: 60,
    generate(r) {
      const key = r.pick(["pcl5", "n2o4", "hi", "wgs"]), x = EQ[key], c = r.pick([0.2, 0.5, 1, 2]), K = r.pick([0.04, 0.1, 0.5, 1.6, 4, 9, 25, 49]);
      // solución por la fórmula de cada caso
      let xi;
      if (key === "pcl5") xi = (-K + Math.sqrt(K * K + 4 * K * c)) / 2;               // x²/(c − x) = K
      else if (key === "n2o4") xi = (-K + Math.sqrt(K * K + 16 * K * c)) / 8;         // 4x²/(c − x) = K
      else if (key === "hi") xi = Math.sqrt(K) * c / (2 + Math.sqrt(K));              // (2x)²/(c − x)² = K
      else xi = Math.sqrt(K) * c / (1 + Math.sqrt(K));                                // x²/(c − x)² = K
      const prod = x.sp.find(s => s[1] > 0), ans = prod[1] * xi;
      const c0 = Object.fromEntries(x.sp.map(([s, nu]) => [s, nu < 0 ? c : 0]));
      return {
        prompt: `Para $${x.tex}$, $K_c = ${dn(K, 2)}$ a cierta temperatura. Si se parte de ${x.sp.filter(s => s[1] < 0).map(([s]) => `$${dn(c, 1)}$ M de $\\mathrm{${s}}$`).join(" y ")} (sin productos), ¿cuál es la concentración de $\\mathrm{${prod[0]}}$ (M) en el equilibrio?`,
        answer: ans, tolerance: 0.01,
        solution: [`Tabla de [[qg-equilibrio|equilibrio]]: ${x.sp.map(([s, nu]) => `$[\\mathrm{${s}}] = ${nu < 0 ? `${dn(c, 1)} - ${-nu === 1 ? "" : -nu}x` : `${nu === 1 ? "" : nu}x`}$`).join(", ")}.`,
          key === "pcl5" ? `$\\frac{x^2}{${dn(c, 1)} - x} = ${dn(K, 2)}$: cuadrática, $x \\approx ${nf(xi, 4)}$.` : key === "n2o4" ? `$\\frac{4x^2}{${dn(c, 1)} - x} = ${dn(K, 2)}$: cuadrática, $x \\approx ${nf(xi, 4)}$.` : `Es un cuadrado perfecto: sacando raíz, $\\frac{${key === "hi" ? "2x" : "x"}}{${dn(c, 1)} - x} = \\sqrt{${dn(K, 2)}}$, $x \\approx ${nf(xi, 4)}$.`,
          `$[\\mathrm{${prod[0]}}] = ${prod[1] === 1 ? "" : prod[1]}x \\approx ${nf(ans, 4)}$ M.`],
        traps: prod[1] === 2 ? [{ value: xi, msg: "Ese es $x$; el producto tiene coeficiente 2, así que su concentración es $2x$." }] : [],
        // verificación: simulación cinética (kf = 1, kr = 1/K) desde las concentraciones iniciales hasta el equilibrio
        verify: { kind: "zero", tol: 1e-3, fn: v => [simulate(x, c0, K, 400)[prod[0]] / v - 1] }
      };
    }
  };
  T["qg-kp-num"] = {
    type: "numeric", concepts: ["qg-equilibrio"], difficulty: 2,
    generate(r) {
      const key = r.pick(["nh3", "n2o4", "so3", "pcl5", "hi"]), x = EQ[key], TK = r.pick([400, 500, 600, 700, 800]), Kc = r.pick([0.05, 0.5, 2.4, 15, 280]), ask = r.pick(["Kp", "Kc"]);
      const d = dn_gas(x), Kp = Kc * (Q.R * TK) ** d, KpS = +Kp.toPrecision(3);
      const ans = ask === "Kp" ? Kp : KpS / (Q.R * TK) ** d;
      return {
        prompt: ask === "Kp" ? `Para $${x.tex}$, $K_c = ${nf(Kc, 3)}$ a $${TK}$ K. ¿Cuánto vale $K_p$ (presiones en atm)?` : `Para $${x.tex}$, $K_p = ${nf(KpS, 3)}$ (presiones en atm) a $${TK}$ K. ¿Cuánto vale $K_c$?`,
        answer: ans, tolerance: 0.01,
        solution: [`Con $p_i = [i]RT$: $K_p = K_c(RT)^{\\Delta n}$, donde $\\Delta n = ${d}$ son los moles gaseosos de productos menos los de reactivos ([[qg-equilibrio|Kp y Kc]]).`,
          `$(RT)^{\\Delta n} = (0{,}082\\cdot${TK})^{${d}} \\approx ${nf((Q.R * TK) ** d, 4)}$, así que $${ask === "Kp" ? `K_p \\approx ${nf(Kp, 4)}` : `K_c \\approx ${nf(ans, 4)}`}$.`],
        traps: d !== 0 ? [{ value: ask === "Kp" ? Kc * (Q.R * TK) ** -d : KpS * (Q.R * TK) ** d, msg: "El exponente es Δn = (moles gaseosos de productos) − (de reactivos): revisá el signo." }] : [],
        // verificación: se arma un estado de equilibrio con concentraciones que cumplen Kc, se pasan a presiones (p = cRT) y se calcula Kp
        verify: { kind: "zero", tol: 1e-9, fn: v => {
          const kc = ask === "Kp" ? Kc : v, c = {}, react = x.sp.filter(s => s[1] < 0), prods = x.sp.filter(s => s[1] > 0);
          for (const [s] of react) c[s] = 0.37;
          const rest = prods.slice(1);
          for (const [s] of rest) c[s] = 0.21;
          const need = kc * react.reduce((q, [s, nu]) => q * c[s] ** -nu, 1) / rest.reduce((q, [s, nu]) => q * c[s] ** nu, 1);
          c[prods[0][0]] = need ** (1 / prods[0][1]);
          const kp = x.sp.reduce((q, [s, nu]) => q * (c[s] * Q.R * TK) ** nu, 1);
          return ask === "Kp" ? [kp / v - 1] : [kp / KpS - 1];
        } }
      };
    }
  };
  T["qg-cociente-mc"] = {
    type: "mc", concepts: ["qg-equilibrio"], difficulty: 2,
    generate(r) {
      const key = r.pick(Object.keys(EQ)), x = EQ[key], K = r.pick([0.01, 0.2, 1.5, 8, 60]), c = Object.fromEntries(x.sp.map(([s]) => [s, r.pick([0.05, 0.1, 0.2, 0.5, 1, 2])]));
      const q = Qc(x, c), dir = Math.abs(q / K - 1) < 0.02 ? null : q < K ? "hacia los productos (a la derecha)" : "hacia los reactivos (a la izquierda)";
      if (!dir) return null;
      const mcq = H.mc(r, dir, ["hacia los productos (a la derecha)", "hacia los reactivos (a la izquierda)", "no avanza: ya está en equilibrio"].filter(o => o !== dir), { text: true, fallback: ["no avanza: K cambia hasta valer Q"] });
      return {
        prompt: `Para $${x.tex}$, $K_c = ${nf(K, 2)}$. En un instante, ${x.sp.map(([s]) => `$[\\mathrm{${s}}] = ${dn(c[s], 2)}$ M`).join(", ")}. ¿Hacia dónde evoluciona el sistema?`,
        options: mcq.options, correct: mcq.correct,
        solution: [`Se calcula el [[qg-equilibrio|cociente de reacción]] $Q$ con las concentraciones del momento: $Q \\approx ${nf(q, 3)}$.`, `$Q ${q < K ? "<" : ">"} K$: ${q < K ? "faltan productos, la reacción avanza a la derecha" : "sobran productos, retrocede a la izquierda"}.`],
        // verificación: signo de la velocidad neta con kf = 1 y kr = 1/K en ese instante
        verify: { kind: "truth", target: true, fn: () => {
          let f = 1, b = 1 / K;
          for (const [s, nu] of x.sp) { if (nu < 0) f *= c[s] ** -nu; else b *= c[s] ** nu; }
          return (f - b > 0) === dir.startsWith("hacia los productos");
        } }
      };
    }
  };
  const PERT = ["agregar", "quitar", "comprimir", "calentar", "catalizador", "inerte"];
  T["qg-lechatelier-mc"] = {
    type: "mc", concepts: ["qg-le-chatelier"], difficulty: 2,
    generate(r) {
      const key = r.pick(Object.keys(EQ)), x = EQ[key], p = r.pick(PERT), sp = r.pick(x.sp), d = dn_gas(x);
      let desc, shift;
      const RIGHT = "se desplaza hacia los productos", LEFT = "se desplaza hacia los reactivos", NONE = "no se desplaza";
      if (p === "agregar") { desc = `se agrega $\\mathrm{${sp[0]}}$`; shift = sp[1] < 0 ? RIGHT : LEFT; }
      else if (p === "quitar") { desc = `se retira parte del $\\mathrm{${sp[0]}}$`; shift = sp[1] < 0 ? LEFT : RIGHT; }
      else if (p === "comprimir") { desc = "se reduce el volumen a la mitad (a temperatura constante)"; shift = d < 0 ? RIGHT : d > 0 ? LEFT : NONE; }
      else if (p === "calentar") { desc = `se aumenta la temperatura ($\\Delta H^\\circ = ${x.dH}$ kJ/mol)`; shift = x.dH > 0 ? RIGHT : LEFT; }
      else if (p === "catalizador") { desc = "se agrega un catalizador"; shift = NONE; }
      else { desc = "se agrega argón a volumen constante"; shift = NONE; }
      const mcq = H.mc(r, shift, [RIGHT, LEFT, NONE].filter(o => o !== shift), { text: true, fallback: ["se detiene la reacción"] });
      return {
        prompt: `El sistema $${x.tex}$ está en equilibrio. Si ${desc}, el equilibrio…`,
        options: mcq.options, correct: mcq.correct,
        solution: [`[[qg-le-chatelier|Le Chatelier]]: el sistema se desplaza en el sentido que contrarresta la perturbación.`,
          p === "agregar" || p === "quitar" ? `Cambia una concentración: $Q$ ${shift === RIGHT ? "queda menor que $K$" : "queda mayor que $K$"} y el sistema ${shift}.`
            : p === "comprimir" ? (d === 0 ? `Hay los mismos moles gaseosos de cada lado ($\\Delta n = 0$): la presión no lo desplaza.` : `Al comprimir, se favorece el lado con menos moles gaseosos ($\\Delta n = ${d}$): ${shift}.`)
            : p === "calentar" ? `Calentar favorece el sentido **endotérmico**, que absorbe el calor. Como $\\Delta H^\\circ ${x.dH > 0 ? "> 0" : "< 0"}$, ${shift}. (Además cambia el valor de $K$.)`
            : p === "catalizador" ? `El catalizador acelera por igual la reacción directa y la inversa: se llega antes al equilibrio, pero $K$ y las concentraciones no cambian.`
            : `Un gas inerte a volumen constante no cambia las concentraciones (ni las presiones parciales) de los que reaccionan: $Q$ sigue igual a $K$.`],
        // verificación: se calcula Q justo después de la perturbación (o el nuevo K, por van 't Hoff, si se calienta) y se compara
        verify: { kind: "truth", target: true, fn: () => {
          const K = 2, c = {};
          // un equilibrio cualquiera: todas las especies menos una a 0,5 M, y la última ajustada para que Q = K
          x.sp.forEach(([s]) => (c[s] = 0.5));
          const [ls, lnu] = x.sp[x.sp.length - 1]; c[ls] = (K / Qc(x, Object.assign({}, c, { [ls]: 1 }))) ** (1 / lnu);
          let c2 = Object.assign({}, c), K2 = K;
          if (p === "agregar") c2[sp[0]] *= 1.5;
          if (p === "quitar") c2[sp[0]] *= 0.5;
          if (p === "comprimir") for (const s in c2) c2[s] *= 2;
          if (p === "calentar") K2 = K * Math.exp(-x.dH * 1000 / Q.Rsi * (1 / 330 - 1 / 300));
          const q = Qc(x, c2), got = Math.abs(q / K2 - 1) < 1e-9 ? NONE : q < K2 ? RIGHT : LEFT;
          return got === shift;
        } }
      };
    }
  };
  T["qg-expresion-k-mc"] = {
    type: "mc", concepts: ["qg-equilibrio"], difficulty: 1,
    generate(r) {
      const HET = [
        { tex: R`\mathrm{CaCO_3(s)} \rightleftharpoons \mathrm{CaO(s)} + \mathrm{CO_2(g)}`, ok: R`K_c = [\mathrm{CO_2}]`, bad: [R`K_c = \frac{[\mathrm{CaO}][\mathrm{CO_2}]}{[\mathrm{CaCO_3}]}`, R`K_c = \frac{1}{[\mathrm{CO_2}]}`, R`K_c = [\mathrm{CaO}][\mathrm{CO_2}]`], gas: { CO2: 1 } },
        { tex: R`\mathrm{C(s)} + \mathrm{CO_2(g)} \rightleftharpoons 2\,\mathrm{CO(g)}`, ok: R`K_c = \frac{[\mathrm{CO}]^2}{[\mathrm{CO_2}]}`, bad: [R`K_c = \frac{[\mathrm{CO}]^2}{[\mathrm{C}][\mathrm{CO_2}]}`, R`K_c = \frac{2[\mathrm{CO}]}{[\mathrm{CO_2}]}`, R`K_c = \frac{[\mathrm{CO_2}]}{[\mathrm{CO}]^2}`], gas: { CO: 2, CO2: -1 } },
        { tex: R`\mathrm{NH_4Cl(s)} \rightleftharpoons \mathrm{NH_3(g)} + \mathrm{HCl(g)}`, ok: R`K_c = [\mathrm{NH_3}][\mathrm{HCl}]`, bad: [R`K_c = \frac{[\mathrm{NH_3}][\mathrm{HCl}]}{[\mathrm{NH_4Cl}]}`, R`K_c = [\mathrm{NH_3}] + [\mathrm{HCl}]`, R`K_c = \frac{1}{[\mathrm{NH_3}][\mathrm{HCl}]}`], gas: { NH3: 1, HCl: 1 } },
        { tex: R`2\,\mathrm{SO_2(g)} + \mathrm{O_2(g)} \rightleftharpoons 2\,\mathrm{SO_3(g)}`, ok: R`K_c = \frac{[\mathrm{SO_3}]^2}{[\mathrm{SO_2}]^2[\mathrm{O_2}]}`, bad: [R`K_c = \frac{2[\mathrm{SO_3}]}{2[\mathrm{SO_2}][\mathrm{O_2}]}`, R`K_c = \frac{[\mathrm{SO_2}]^2[\mathrm{O_2}]}{[\mathrm{SO_3}]^2}`, R`K_c = \frac{[\mathrm{SO_3}]}{[\mathrm{SO_2}][\mathrm{O_2}]}`], gas: { SO3: 2, SO2: -2, O2: -1 } },
        { tex: R`\mathrm{N_2(g)} + 3\,\mathrm{H_2(g)} \rightleftharpoons 2\,\mathrm{NH_3(g)}`, ok: R`K_c = \frac{[\mathrm{NH_3}]^2}{[\mathrm{N_2}][\mathrm{H_2}]^3}`, bad: [R`K_c = \frac{[\mathrm{NH_3}]}{[\mathrm{N_2}][\mathrm{H_2}]}`, R`K_c = \frac{[\mathrm{N_2}][\mathrm{H_2}]^3}{[\mathrm{NH_3}]^2}`, R`K_c = \frac{2[\mathrm{NH_3}]}{[\mathrm{N_2}]\,3[\mathrm{H_2}]}`], gas: { NH3: 2, N2: -1, H2: -3 } }
      ];
      const h = r.pick(HET), mcq = H.mc(r, h.ok, h.bad);
      return {
        prompt: `¿Cuál es la expresión de $K_c$ para $${h.tex}$?`,
        options: mcq.options, correct: mcq.correct,
        solution: [`En la [[qg-equilibrio|constante de equilibrio]] van los productos sobre los reactivos, cada concentración elevada a su coeficiente. Los sólidos y los líquidos puros no aparecen (su "concentración" es constante y queda dentro de $K$).`, `Queda $${h.ok}$.`],
        // verificación: con concentraciones de prueba, la expresión correcta coincide con Π[gas]^ν (sin sólidos)
        verify: { kind: "truth", target: true, fn: () => {
          const c = { CO2: 0.3, CO: 0.7, NH3: 0.2, HCl: 0.45, SO3: 0.6, SO2: 0.25, O2: 0.15, N2: 0.4, H2: 0.9 };
          const want = Object.entries(h.gas).reduce((q, [s, nu]) => q * c[s] ** nu, 1);
          const prodOf = part => (part.match(/\[\\mathrm\{\w+\}\](\^\d)?/g) || []).reduce((q, t) => { const [, sp, e] = /\[\\mathrm\{(\w+)\}\](?:\^(\d))?/.exec(t); return q * c[sp.replace(/_/g, "")] ** +(e || 1); }, 1);
          const fr = /\\frac\{(.*)\}\{(.*)\}$/.exec(h.ok.replace(/^K_c = /, ""));
          const got = fr ? prodOf(fr[1]) / prodOf(fr[2]) : prodOf(h.ok);
          return Math.abs(got / want - 1) < 1e-12;
        } }
      };
    }
  };

  const cards = {
    "qg-equilibrio": {
      title: "Equilibrio químico, K y cociente de reacción", aliases: ["equilibrio químico", "constante de equilibrio", "cociente de reacción", "ley de acción de masas", "tabla de equilibrio", "equilibrio heterogéneo"], concepts: ["qg-equilibrio"],
      summary: "En el equilibrio las reacciones directa e inversa ocurren a la misma velocidad y las concentraciones quedan fijas. Para aA + bB ⇌ cC + dD, K_c = [C]^c[D]^d/([A]^a[B]^b) (sin sólidos ni líquidos puros). Q tiene la misma forma con concentraciones cualesquiera: si Q < K avanza a productos. K_p = K_c(RT)^Δn.",
      def: [R`El **equilibrio químico** es dinámico: la reacción directa y la inversa siguen ocurriendo, a la misma velocidad, y las concentraciones ya no cambian.`,
        R`**Ley de acción de masas:** para $a\mathrm A + b\mathrm B \rightleftharpoons c\mathrm C + d\mathrm D$, en el equilibrio $K_c = \frac{[\mathrm C]^c[\mathrm D]^d}{[\mathrm A]^a[\mathrm B]^b}$, que solo depende de la temperatura. En los **equilibrios heterogéneos** los sólidos y líquidos puros no aparecen.`,
        R`Con presiones parciales (en atm), $K_p = K_c(RT)^{\Delta n}$, con $\Delta n$ los moles gaseosos de productos menos los de reactivos.`,
        R`El **cociente de reacción** $Q$ tiene la misma expresión con las concentraciones de cualquier momento: si $Q < K$ el sistema avanza hacia los productos; si $Q > K$, hacia los reactivos; si $Q = K$, está en equilibrio.`,
        R`**Tabla de equilibrio:** se anotan las concentraciones iniciales, el cambio ($\nu_i\,x$ para cada especie, con el signo de su lado) y las de equilibrio; se reemplazan en $K$ y se despeja $x$.`],
      idea: [R`$K$ grande ($\gg 1$) significa que en el equilibrio dominan los productos; $K$ chico, los reactivos. $K$ no dice nada de cuán rápido se llega: eso es [[qg-velocidad|cinética]]. Un catalizador hace llegar antes, pero al mismo lugar.`],
      demo: [R`**Paso 1 (pasos elementales).** Para una reacción elemental, la velocidad directa es $v_d = k_d[\mathrm A]^a[\mathrm B]^b$ y la inversa $v_i = k_i[\mathrm C]^c[\mathrm D]^d$.`,
        R`**Paso 2 (equilibrio dinámico).** En el equilibrio, $v_d = v_i$: $k_d[\mathrm A]^a[\mathrm B]^b = k_i[\mathrm C]^c[\mathrm D]^d$.`,
        R`**Paso 3 (la constante).** Reordenando, $\frac{[\mathrm C]^c[\mathrm D]^d}{[\mathrm A]^a[\mathrm B]^b} = \frac{k_d}{k_i} = K_c$, una constante a $T$ fija. (Para reacciones de varios pasos se llega a lo mismo multiplicando las constantes de cada paso, y la termodinámica lo garantiza en general.)`,
        R`**Paso 4 ($K_p$).** Con $p_i = [i]RT$: $K_p = \prod(p_i)^{\nu_i} = \prod([i]RT)^{\nu_i} = K_c(RT)^{\sum\nu_i}$, y $\sum\nu_i = \Delta n$. $\blacksquare$`],
      examples: [{ q: R`$\mathrm{PCl_5} \rightleftharpoons \mathrm{PCl_3} + \mathrm{Cl_2}$, $K_c = 0{,}5$, con 1 M de PCl₅.`, steps: [R`$\frac{x^2}{1 - x} = 0{,}5$: $x^2 + 0{,}5x - 0{,}5 = 0$, $x \approx 0{,}5$.`, R`$[\mathrm{PCl_3}] = [\mathrm{Cl_2}] \approx 0{,}5$ M y $[\mathrm{PCl_5}] \approx 0{,}5$ M.`] }],
      see: ["qg-le-chatelier", "qg-velocidad", "qg-acido-base"]
    },
    "qg-le-chatelier": {
      title: "Principio de Le Chatelier", aliases: ["principio de Le Chatelier", "Le Chatelier", "desplazamiento del equilibrio", "ecuación de van 't Hoff"], concepts: ["qg-le-chatelier"],
      summary: "Si se perturba un equilibrio, el sistema se desplaza en el sentido que contrarresta la perturbación: agregar un reactivo lo lleva a productos; comprimir favorece el lado con menos moles gaseosos; calentar favorece el sentido endotérmico (y cambia K). Un catalizador o un gas inerte a volumen constante no lo desplazan.",
      def: [R`**Principio de Le Chatelier:** si un sistema en equilibrio se perturba, evoluciona en el sentido que contrarresta la perturbación, hasta un nuevo equilibrio.`,
        R`- **Concentración:** agregar un reactivo o quitar un producto desplaza hacia los productos (baja $Q$ por debajo de $K$).
- **Presión (cambiando el volumen):** al comprimir se favorece el lado con menos moles gaseosos; si $\Delta n = 0$, no hay desplazamiento.
- **Temperatura:** calentar favorece el sentido endotérmico. Es la única perturbación que cambia $K$: $\ln\frac{K_2}{K_1} = -\frac{\Delta H^\circ}{R}\left(\frac1{T_2} - \frac1{T_1}\right)$ (**van 't Hoff**).
- **Catalizador** o **gas inerte a volumen constante:** no lo desplazan.`],
      idea: [R`La síntesis del amoníaco (Haber) es exotérmica y reduce los moles de gas: conviene alta presión y, para el equilibrio, baja temperatura. Pero a baja temperatura es lentísima, así que se trabaja a unos 450 °C con catalizador de hierro y a 200 atm, y se va retirando el NH₃: un compromiso entre equilibrio y cinética.`],
      demo: [R`**Paso 1 (concentración).** Al agregar un reactivo, crece el denominador de $Q$: $Q < K$, y para recuperar $Q = K$ la reacción tiene que avanzar.`,
        R`**Paso 2 (volumen).** Si el volumen se reduce a la mitad, todas las concentraciones se duplican y $Q' = 2^{\Delta n}Q = 2^{\Delta n}K$. Con $\Delta n < 0$, $Q' < K$: avanza a productos (el lado con menos moles de gas). Con $\Delta n = 0$, $Q' = K$.`,
        R`**Paso 3 (temperatura).** Por van 't Hoff, si $\Delta H^\circ > 0$, $K$ crece con $T$: el $Q$ del equilibrio viejo queda por debajo del nuevo $K$ y avanza a productos. Si $\Delta H^\circ < 0$, al revés. $\blacksquare$`],
      examples: [{ q: R`$\mathrm{N_2O_4} \rightleftharpoons 2\,\mathrm{NO_2}$ ($\Delta H > 0$): ¿qué pasa al calentar?`, steps: [R`Se favorece el sentido endotérmico: más NO₂ (marrón). La mezcla se oscurece.`] }],
      see: ["qg-equilibrio", "qg-arrhenius"]
    }
  };

  E.extendCourse("q101", {
    concepts: { "qg-equilibrio": { name: "Constante de equilibrio" }, "qg-le-chatelier": { name: "Le Chatelier" } },
    templates: T,
    units: [{
      id: "qg-equilibrio-u", order: 9, program: "Unidad 7", title: "Equilibrio químico", icon: "target",
      diagnostic: ["qg-expresion-k-mc", "qg-ice-num", "qg-lechatelier-mc"],
      lessons: [
        { id: "qg-l-k", title: "Constante de equilibrio", templates: ["qg-expresion-k-mc", "qg-kc-num", "qg-kp-num"], theory: ["qg-equilibrio"],
          intro: R`$K_c = \frac{[\mathrm C]^c[\mathrm D]^d}{[\mathrm A]^a[\mathrm B]^b}$, sin sólidos ni líquidos puros. $K_p = K_c(RT)^{\Delta n}$.` },
        { id: "qg-l-ice", title: "Cálculos de equilibrio", templates: ["qg-ice-num", "qg-cociente-mc"], theory: ["qg-equilibrio"],
          intro: R`Tabla de equilibrio: inicial, cambio ($\nu x$) y equilibrio. $Q < K$: avanza a productos.` },
        { id: "qg-l-lechatelier", title: "Le Chatelier", templates: ["qg-lechatelier-mc"], theory: ["qg-le-chatelier"],
          intro: R`El sistema contrarresta la perturbación. Solo la temperatura cambia $K$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 8 · ÁCIDOS Y BASES
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, Q = E.qg, nf = Q.nf, dn = Q.dn;
  const T = {};
  const tx = (f, q) => Q.tex(f, q);
  const KW = 1e-14;
  // [H⁺] por balance de cargas (bisección en log[H⁺]); `neg(h)` da la suma de las cargas negativas menos las positivas que no son H⁺
  const solveH = neg => { const f = lh => { const h = 10 ** lh; return h - KW / h - neg(h); }; return 10 ** Q.bisect(f, -15, 1, 200); };
  Q.solveH = solveH;
  const pH = h => -Math.log10(h);
  const WEAK = [["CH3COOH", 1.8e-5, "ácido acético"], ["HF", 6.8e-4, "ácido fluorhídrico"], ["HCN", 4.9e-10, "ácido cianhídrico"], ["HNO2", 4.5e-4, "ácido nitroso"], ["C6H5COOH", 6.3e-5, "ácido benzoico"], ["HClO", 3.0e-8, "ácido hipocloroso"]];
  const WBASE = [["NH3", 1.8e-5, "amoníaco"], ["CH3NH2", 4.4e-4, "metilamina"], ["C5H5N", 1.7e-9, "piridina"]];

  T["qg-ph-fuerte-num"] = {
    type: "numeric", concepts: ["qg-acido-base"], difficulty: 1,
    generate(r) {
      const [f, n, kind, nm] = r.pick([["HCl", 1, "a", "ácido clorhídrico"], ["HNO3", 1, "a", "ácido nítrico"], ["HClO4", 1, "a", "ácido perclórico"], ["NaOH", 1, "b", "hidróxido de sodio"], ["KOH", 1, "b", "hidróxido de potasio"], ["Ba(OH)2", 2, "b", "hidróxido de bario"], ["Ca(OH)2", 2, "b", "hidróxido de calcio"]]);
      const C = r.pick([1e-4, 5e-4, 1e-3, 2.5e-3, 0.01, 0.02, 0.05, 0.1, 0.5]), ask = r.pick(["pH", "pH", "pOH"]);
      const h = kind === "a" ? n * C : KW / (n * C), p = ask === "pH" ? pH(h) : 14 - pH(h);
      return {
        prompt: `¿Cuál es el ${ask} de una solución $${nf(C, 2)}$ M de ${nm} ($${tx(f)}$) a 25 °C?`,
        answer: p, tolerance: 0.005,
        solution: [`Es ${kind === "a" ? "un ácido" : "una base"} [[qg-acido-base|fuerte]]: se disocia por completo${n > 1 ? ` y cada unidad libera ${n} OH⁻` : ""}. ${kind === "a" ? `$[\\mathrm{H^+}] = ${nf(n * C, 3)}$ M.` : `$[\\mathrm{OH^-}] = ${nf(n * C, 3)}$ M, $\\mathrm{pOH} = ${dn(pH(n * C), 2)}$.`}`,
          `${kind === "a" ? `$\\mathrm{pH} = -\\log[\\mathrm{H^+}] = ${dn(pH(h), 2)}$` : `$\\mathrm{pH} = 14 - \\mathrm{pOH} = ${dn(pH(h), 2)}$`}${ask === "pOH" ? `, y $\\mathrm{pOH} = 14 - \\mathrm{pH} = ${dn(p, 2)}$` : ""}.`],
        traps: [{ value: 14 - p, msg: ask === "pH" ? "Ese es el pOH: pH + pOH = 14." : "Ese es el pH: pOH = 14 − pH." }, ...(n > 1 ? [{ value: ask === "pH" ? 14 - pH(C) : pH(C), msg: `Cada unidad de $${tx(f)}$ libera ${n} OH⁻.` }] : [])].filter(t => Math.abs(t.value - p) > 0.05),
        // verificación: balance de cargas con la autoionización del agua, [H⁺] + [catión] = [anión] + [OH⁻]
        verify: { kind: "zero", tol: 1e-4, fn: x => { const hh = solveH(h0 => (kind === "a" ? n * C : -n * C)); return [(ask === "pH" ? pH(hh) : 14 - pH(hh)) - x]; } }
      };
    }
  };
  T["qg-ph-debil-num"] = {
    type: "numeric", concepts: ["qg-ph-debil"], difficulty: 2,
    generate(r) {
      const base = r.bool() && r.bool(), [f, K, nm] = base ? r.pick(WBASE) : r.pick(WEAK), C = r.pick([0.001, 0.01, 0.05, 0.1, 0.2, 0.5, 1]), ask = r.pick(["pH", "pH", "ion"]);
      const x = (-K + Math.sqrt(K * K + 4 * K * C)) / 2;        // [H⁺] (o [OH⁻]) sin el agua
      if (x < 1e-6) return null;
      const p = base ? 14 - pH(x) : pH(x), ion = 100 * x / C;
      return {
        prompt: ask === "pH" ? `¿Cuál es el pH de una solución $${dn(C, 3)}$ M de ${nm} ($${tx(f)}$, $K_${base ? "b" : "a"} = ${nf(K, 2)}$) a 25 °C?` : `¿Qué porcentaje de las moléculas de ${nm} está ${base ? "protonado" : "ionizado"} en una solución $${dn(C, 3)}$ M? ($K_${base ? "b" : "a"} = ${nf(K, 2)}$)`,
        answer: ask === "pH" ? p : ion, tolerance: ask === "pH" ? 0.005 : 0.01,
        solution: [`${base ? "Base" : "Ácido"} [[qg-ph-debil|débil]]: ${base ? `$\\mathrm B + \\mathrm{H_2O} \\rightleftharpoons \\mathrm{BH^+} + \\mathrm{OH^-}$` : `$\\mathrm{HA} \\rightleftharpoons \\mathrm{H^+} + \\mathrm{A^-}$`}. Con $x = [${base ? "\\mathrm{OH^-}" : "\\mathrm{H^+}"}]$: $\\frac{x^2}{${dn(C, 3)} - x} = ${nf(K, 2)}$.`,
          `Resolviendo la cuadrática: $x \\approx ${nf(x, 3)}$ M.${x / C < 0.05 ? ` (Como $x \\ll C$, también sirve $x \\approx \\sqrt{K C}$.)` : ""}`,
          ask === "pH" ? (base ? `$\\mathrm{pOH} = ${dn(pH(x), 2)}$ y $\\mathrm{pH} = ${dn(p, 2)}$.` : `$\\mathrm{pH} = ${dn(p, 2)}$.`) : `Porcentaje: $\\frac{x}{C}\\cdot100 \\approx ${dn(ion, 2)}\\,\\%$.`],
        traps: ask === "pH" ? [{ value: base ? 14 - pH(C) : pH(C), msg: "Así sería si fuera fuerte: un débil se disocia solo en parte." }, ...(base ? [{ value: pH(x), msg: "Ese es el pOH." }] : [])].filter(t => Math.abs(t.value - p) > 0.05) : [],
        // verificación: balance de cargas exacto con la disociación parcial y la del agua
        verify: { kind: "zero", tol: 2e-3, fn: v => {
          let hh;
          if (!base) hh = solveH(h => C * K / (K + h));                                   // [A⁻]
          else hh = solveH(h => { const oh = KW / h; return -C * K / (K + oh); });         // −[BH⁺]
          const got = ask === "pH" ? pH(hh) : 100 * (base ? (KW / hh) : hh) / C;
          return [ask === "pH" ? got - v : got / v - 1];
        } }
      };
    }
  };
  T["qg-ka-desde-ph-num"] = {
    type: "numeric", concepts: ["qg-ph-debil"], difficulty: 3,
    generate(r) {
      const [, K0] = r.pick(WEAK.filter(w => w[1] > 1e-8)), C = r.pick([0.01, 0.05, 0.1, 0.25]), x = (-K0 + Math.sqrt(K0 * K0 + 4 * K0 * C)) / 2, p = +pH(x).toFixed(2), h = 10 ** -p;
      const Ka = h * h / (C - h);
      return {
        prompt: `Una solución $${dn(C, 2)}$ M de un ácido débil monoprótico HA tiene pH $${dn(p, 2)}$. ¿Cuánto vale $K_a$?`,
        answer: Ka, tolerance: 0.01,
        solution: [`$[\\mathrm{H^+}] = 10^{-${dn(p, 2)}} \\approx ${nf(h, 3)}$ M, y por la estequiometría $[\\mathrm{A^-}] = [\\mathrm{H^+}]$ y $[\\mathrm{HA}] = ${dn(C, 2)} - ${nf(h, 3)}$.`,
          `$K_a = \\frac{[\\mathrm{H^+}][\\mathrm{A^-}]}{[\\mathrm{HA}]} \\approx ${nf(Ka, 3)}$ ([[qg-ph-debil|ácido débil]]).`],
        traps: [{ value: h * h / C, msg: "Aproximaste [HA] ≈ C; acá el ácido se disocia bastante y conviene restar." }].filter(t => Math.abs(t.value / Ka - 1) > 0.02),
        // verificación: con ese Ka se resuelve el balance de cargas y tiene que dar el pH del dato
        verify: { kind: "zero", tol: 2e-3, fn: v => [pH(solveH(hh => C * v / (v + hh))) - p] }
      };
    }
  };
  T["qg-neutralizacion-num"] = {
    type: "numeric", concepts: ["qg-neutralizacion"], difficulty: 2,
    generate(r) {
      const kind = r.pick(["vol", "vol", "ph"]);
      if (kind === "vol") {
        const [f, n, nm] = r.pick([["HCl", 1, "ácido clorhídrico"], ["H2SO4", 2, "ácido sulfúrico"], ["CH3COOH", 1, "ácido acético"], ["H3PO4", 3, "ácido fosfórico"], ["HNO3", 1, "ácido nítrico"]]);
        const Va = r.pick([10, 20, 25, 50]), Ca = r.pick([0.05, 0.1, 0.2, 0.5]), Cb = r.pick([0.1, 0.2, 0.25, 0.5, 1]);
        const Vb = n * Ca * Va / Cb;
        return {
          prompt: `¿Qué volumen (mL) de NaOH $${dn(Cb, 2)}$ M hace falta para neutralizar por completo $${Va}$ mL de ${nm} ($${tx(f)}$) $${dn(Ca, 2)}$ M?`,
          answer: Vb, tolerance: 0.01,
          solution: [`En la [[qg-neutralizacion|neutralización]] completa, cada H⁺ ácido reacciona con un OH⁻. El ${nm} aporta ${n} H⁺ por molécula: $${n}\\cdot${dn(Ca, 2)}\\cdot${Va} = ${dn(n * Ca * Va, 2)}$ mmol de H⁺.`,
            `$V_b = \\frac{${dn(n * Ca * Va, 2)}\\ \\mathrm{mmol}}{${dn(Cb, 2)}\\ \\mathrm M} \\approx ${dn(Vb, 2)}$ mL.${f === "CH3COOH" ? " Aunque el ácido es débil, la estequiometría es la misma: el OH⁻ va arrastrando el equilibrio." : ""}`],
          traps: n > 1 ? [{ value: Ca * Va / Cb, msg: `El $${tx(f)}$ tiene ${n} hidrógenos ácidos: hacen falta ${n} OH⁻ por molécula.` }] : [],
          // verificación: se agrega la base de a 0,01 mL hasta que los OH⁻ alcanzan a los H⁺ (interpolando el último paso)
          verify: { kind: "zero", tol: 1e-6, fn: x => {
            const need = n * Ca * Va; let v = 0, oh = 0;
            while (oh + Cb * 0.01 < need) { v += 0.01; oh += Cb * 0.01; }
            v += (need - oh) / Cb;
            return [v / x - 1];
          } }
        };
      }
      const Ca = r.pick([0.1, 0.2]), Va = r.pick([25, 50]), Cb = r.pick([0.1, 0.2]), Vb = r.pick([10, 20, 24, 26, 30, 40, 60]);
      const na = Ca * Va, nb = Cb * Vb, Vt = (Va + Vb) / 1000;
      if (Math.abs(na - nb) < 1e-9) return null;
      const h = na > nb ? (na - nb) / 1000 / Vt : KW / ((nb - na) / 1000 / Vt), p = pH(h);
      return {
        prompt: `Se mezclan $${Va}$ mL de HCl $${dn(Ca, 2)}$ M con $${Vb}$ mL de NaOH $${dn(Cb, 2)}$ M. ¿Cuál es el pH de la mezcla?`,
        answer: p, tolerance: 0.005,
        solution: [`Milimoles: H⁺ $= ${dn(na, 2)}$; OH⁻ $= ${dn(nb, 2)}$. [[qg-neutralizacion|Neutralizan]] entre sí y sobra ${na > nb ? `ácido: $${dn(na - nb, 2)}$ mmol de H⁺` : `base: $${dn(nb - na, 2)}$ mmol de OH⁻`} en $${Va + Vb}$ mL.`,
          na > nb ? `$[\\mathrm{H^+}] \\approx ${nf(h, 3)}$ M, $\\mathrm{pH} \\approx ${dn(p, 2)}$.` : `$[\\mathrm{OH^-}] \\approx ${nf(KW / h, 3)}$ M, $\\mathrm{pOH} \\approx ${dn(14 - p, 2)}$ y $\\mathrm{pH} \\approx ${dn(p, 2)}$.`],
        traps: [{ value: na > nb ? pH((na - nb) / 1000 / (Va / 1000)) : 14 - pH((nb - na) / 1000 / (Va / 1000)), msg: "Al mezclar, el volumen es la suma de los dos." }].filter(t => Math.abs(t.value - p) > 0.03),
        // verificación: balance de cargas en la mezcla, [H⁺] + [Na⁺] = [Cl⁻] + [OH⁻]
        verify: { kind: "zero", tol: 1e-4, fn: x => [pH(solveH(() => (na - nb) / 1000 / Vt)) - x] }
      };
    }
  };
  // sales: catión y anión con su comportamiento (Ka del catión ácido o Kb del anión básico)
  const SALTS = [["NaCl", "neutra", 0, 0], ["KNO3", "neutra", 0, 0], ["NH4Cl", "ácida", 5.6e-10, 0], ["NH4NO3", "ácida", 5.6e-10, 0], ["NaCH3COO", "básica", 0, KW / 1.8e-5], ["NaF", "básica", 0, KW / 6.8e-4],
    ["KCN", "básica", 0, KW / 4.9e-10], ["Na2CO3", "básica", 0, KW / 4.7e-11], ["NaNO2", "básica", 0, KW / 4.5e-4], ["KBr", "neutra", 0, 0], ["NaClO4", "neutra", 0, 0], ["NaClO", "básica", 0, KW / 3.0e-8]];
  T["qg-hidrolisis-mc"] = {
    type: "mc", concepts: ["qg-neutralizacion"], difficulty: 2,
    generate(r) {
      const [f, kind, Ka, Kb] = r.pick(SALTS), C = 0.1, mcq = H.mc(r, kind, ["ácida", "neutra", "básica"].filter(k => k !== kind), { text: true, fallback: ["depende del volumen de la solución"] });
      return {
        prompt: `Una solución $0{,}1$ M de $${tx(f)}$ en agua, ¿es ácida, neutra o básica?`,
        options: mcq.options, correct: mcq.correct,
        solution: [`[[qg-neutralizacion|Hidrólisis]]: los iones que vienen de ácidos o bases **fuertes** (Na⁺, K⁺, Cl⁻, NO₃⁻, Br⁻, ClO₄⁻) no reaccionan con el agua. Los que vienen de débiles sí.`,
          kind === "ácida" ? `El NH₄⁺ es el ácido conjugado del NH₃ (base débil): cede H⁺ al agua, **ácida**.` : kind === "básica" ? `El anión es la base conjugada de un ácido débil: toma H⁺ del agua y libera OH⁻, **básica**.` : `Ningún ion reacciona con el agua: **neutra**, pH 7.`],
        // verificación: pH por balance de cargas con la hidrólisis del ion correspondiente
        verify: { kind: "truth", target: true, fn: () => {
          const h = Ka ? solveH(hh => C * Ka / (Ka + hh)) : Kb ? solveH(hh => -C * Kb / (Kb + KW / hh)) : solveH(() => 0);
          const p = pH(h), k2 = p < 6.9 ? "ácida" : p > 7.1 ? "básica" : "neutra";
          return k2 === kind;
        } }
      };
    }
  };
  // pares conjugados (Brønsted-Lowry)
  const PAIRS = [["HCl", 0, "Cl", -1], ["H2O", 0, "OH", -1], ["H3O", 1, "H2O", 0], ["NH4", 1, "NH3", 0], ["NH3", 0, "NH2", -1], ["H2SO4", 0, "HSO4", -1], ["HSO4", -1, "SO4", -2], ["H2CO3", 0, "HCO3", -1],
    ["HCO3", -1, "CO3", -2], ["H3PO4", 0, "H2PO4", -1], ["H2PO4", -1, "HPO4", -2], ["CH3COOH", 0, "CH3COO", -1], ["HF", 0, "F", -1], ["HCN", 0, "CN", -1]];
  const qs = q => (q === 0 ? "" : (Math.abs(q) === 1 ? "" : Math.abs(q)) + (q > 0 ? "+" : "-"));
  T["qg-conjugado-mc"] = {
    type: "mc", concepts: ["qg-acido-base"], difficulty: 1,
    generate(r) {
      const [a, qa, b, qb] = r.pick(PAIRS), askBase = r.bool();
      const ok = askBase ? tx(b, qs(qb)) : tx(a, qs(qa));
      // distractores: con un H de más o de menos y la carga mal
      const addH = (f, k) => { const c = Q.count2(f); c.H = (c.H || 0) + k; return c.H < 0 ? null : f; };
      const ds = askBase ? [tx(a, qs(qa - 1)), tx(b, qs(qb + 1)), tx(a, qs(qa + 1))] : [tx(b, qs(qb + 1)), tx(a, qs(qa - 1)), tx(b, qs(qb - 1))];
      const mcq = H.mc(r, ok, ds.filter(d => d !== ok && addH));
      return {
        prompt: askBase ? `¿Cuál es la base conjugada de $${tx(a, qs(qa))}$?` : `¿Cuál es el ácido conjugado de $${tx(b, qs(qb))}$?`,
        options: mcq.options, correct: mcq.correct,
        solution: [`[[qg-acido-base|Brønsted-Lowry]]: un ácido cede un H⁺ y queda su base conjugada; una base acepta un H⁺ y queda su ácido conjugado. Difieren en un H y en una unidad de carga.`,
          askBase ? `$${tx(a, qs(qa))} \\to ${tx(b, qs(qb))} + \\mathrm{H^+}$.` : `$${tx(b, qs(qb))} + \\mathrm{H^+} \\to ${tx(a, qs(qa))}$.`],
        // verificación: contando átomos con el lector de fórmulas: mismos elementos, un H menos y una carga negativa más
        verify: { kind: "truth", target: true, fn: () => {
          const ca = Q.count2(a), cb = Q.count2(b), keys = new Set([...Object.keys(ca), ...Object.keys(cb)]);
          return [...keys].every(k => (ca[k] || 0) - (cb[k] || 0) === (k === "H" ? 1 : 0)) && qa - qb === 1;
        } }
      };
    }
  };

  const cards = {
    "qg-acido-base": {
      title: "Ácidos y bases: Arrhenius, Brønsted-Lowry y pH", aliases: ["teoría de Arrhenius", "teoría de Brønsted-Lowry", "par conjugado", "pares conjugados", "producto iónico del agua", "ácido fuerte", "base fuerte"], concepts: ["qg-acido-base"],
      summary: "Arrhenius: un ácido libera H⁺ en agua y una base, OH⁻. Brønsted-Lowry: un ácido cede H⁺ y una base lo acepta; cada ácido tiene su base conjugada. El agua se autoioniza: Kw = [H⁺][OH⁻] = 10⁻¹⁴ a 25 °C. pH = −log[H⁺], pH + pOH = 14. Los fuertes se disocian por completo.",
      def: [R`**Arrhenius:** un ácido libera $\mathrm{H^+}$ en agua (HCl) y una base libera $\mathrm{OH^-}$ (NaOH). **Brønsted-Lowry:** un ácido **cede** un protón y una base lo **acepta**; así el NH₃ es base aunque no tenga OH. Al ceder el H⁺, el ácido queda convertido en su **base conjugada**: $\mathrm{HA}/\mathrm{A^-}$ es un **par conjugado**. (Lewis lo generaliza: un ácido acepta un par de electrones.)`,
        R`El agua es anfótera y se **autoioniza**: $\mathrm{H_2O} \rightleftharpoons \mathrm{H^+} + \mathrm{OH^-}$, con $K_w = [\mathrm{H^+}][\mathrm{OH^-}] = 1{,}0\times10^{-14}$ a 25 °C. En agua pura, $[\mathrm{H^+}] = 10^{-7}$ M.`,
        R`$\mathrm{pH} = -\log[\mathrm{H^+}]$ y $\mathrm{pOH} = -\log[\mathrm{OH^-}]$, con $\mathrm{pH} + \mathrm{pOH} = 14$. Ácida: pH < 7; neutra: pH = 7; básica: pH > 7 (a 25 °C).`,
        R`Los **ácidos y bases fuertes** (HCl, HNO₃, HClO₄, H₂SO₄ en su primera disociación; NaOH, KOH, Ba(OH)₂) se disocian por completo: $[\mathrm{H^+}]$ es directamente la concentración (por la cantidad de H⁺ que aporta cada unidad). Los **débiles** se disocian en parte ([[qg-ph-debil|Ka y Kb]]).`],
      idea: [R`El pH es una escala logarítmica: cada unidad es un factor 10 en $[\mathrm{H^+}]$. El jugo de limón (pH 2) tiene diez mil veces más H⁺ que el agua pura. Por eso un ácido fuerte muy diluido no puede dar pH mayor que 7: cuando aporta menos H⁺ que el agua, manda el agua.`],
      demo: [R`**Paso 1 ($K_w$).** El equilibrio del agua es $K = \frac{[\mathrm{H^+}][\mathrm{OH^-}]}{[\mathrm{H_2O}]}$; como el agua es el solvente (líquido puro) no entra en la constante: $K_w = [\mathrm{H^+}][\mathrm{OH^-}]$.`,
        R`**Paso 2 (logaritmos).** Tomando $-\log$: $-\log[\mathrm{H^+}] - \log[\mathrm{OH^-}] = -\log K_w = 14$, o sea $\mathrm{pH} + \mathrm{pOH} = 14$. $\blacksquare$`],
      examples: [{ q: R`pH de Ba(OH)₂ 0,005 M.`, steps: [R`$[\mathrm{OH^-}] = 2\cdot0{,}005 = 0{,}01$ M, pOH = 2.`, R`pH = 12.`] }],
      see: ["qg-ph-debil", "qg-neutralizacion", "qg-equilibrio"]
    },
    "qg-ph-debil": {
      title: "Ácidos y bases débiles: Ka y Kb", aliases: ["ácido débil", "base débil", "constante de acidez", "constante de basicidad", "grado de disociación", "porcentaje de ionización"], concepts: ["qg-ph-debil"],
      summary: "Un ácido débil HA ⇌ H⁺ + A⁻ tiene Ka = [H⁺][A⁻]/[HA]; con concentración C, [H⁺] sale de x²/(C − x) = Ka (≈ √(Ka·C) si x ≪ C). Igual para bases con Kb y OH⁻. Para un par conjugado, Ka·Kb = Kw.",
      def: [R`Para un **ácido débil**, $\mathrm{HA} \rightleftharpoons \mathrm{H^+} + \mathrm{A^-}$, con $K_a = \frac{[\mathrm{H^+}][\mathrm{A^-}]}{[\mathrm{HA}]}$. Para una **base débil**, $\mathrm B + \mathrm{H_2O} \rightleftharpoons \mathrm{BH^+} + \mathrm{OH^-}$, con $K_b = \frac{[\mathrm{BH^+}][\mathrm{OH^-}]}{[\mathrm B]}$. A mayor $K_a$ (menor $pK_a = -\log K_a$), más fuerte el ácido.`,
        R`Con concentración inicial $C$ y $x = [\mathrm{H^+}]$: $\frac{x^2}{C - x} = K_a$, una cuadrática ([[qg-equilibrio|tabla de equilibrio]]). Si $x \ll C$ (menos del 5 %), $x \approx \sqrt{K_aC}$. El **porcentaje de ionización** es $\frac xC\cdot100$, y crece al diluir.`,
        R`Para un par conjugado: $K_a\cdot K_b = K_w$. Cuanto más débil el ácido, más fuerte su base conjugada.`],
      idea: [R`Un ácido débil es como alguien que suelta el H⁺ "a regañadientes": en una solución 0,1 M de ácido acético, solo una de cada 75 moléculas está disociada. Diluir lo empuja a disociarse más (Le Chatelier: del lado de las partículas sueltas).`],
      demo: [R`**Paso 1 (tabla).** Inicial: $[\mathrm{HA}] = C$, $[\mathrm{H^+}] = [\mathrm{A^-}] \approx 0$ (despreciando el agua). Equilibrio: $C - x$, $x$, $x$.`,
        R`**Paso 2 (cuadrática).** $K_a = \frac{x^2}{C - x}$, o sea $x^2 + K_ax - K_aC = 0$, y la raíz positiva es $x = \frac{-K_a + \sqrt{K_a^2 + 4K_aC}}{2}$.`,
        R`**Paso 3 (aproximación).** Si $x \ll C$, $C - x \approx C$ y $x \approx \sqrt{K_aC}$.`,
        R`**Paso 4 ($K_aK_b$).** Para $\mathrm A^- + \mathrm{H_2O} \rightleftharpoons \mathrm{HA} + \mathrm{OH^-}$: $K_aK_b = \frac{[\mathrm{H^+}][\mathrm{A^-}]}{[\mathrm{HA}]}\cdot\frac{[\mathrm{HA}][\mathrm{OH^-}]}{[\mathrm{A^-}]} = [\mathrm{H^+}][\mathrm{OH^-}] = K_w$. $\blacksquare$`],
      examples: [{ q: R`pH de ácido acético 0,1 M ($K_a = 1{,}8\times10^{-5}$).`, steps: [R`$x \approx \sqrt{1{,}8\times10^{-6}} \approx 1{,}34\times10^{-3}$ M (1,3 %: la aproximación vale).`, R`pH ≈ 2,87.`] }],
      see: ["qg-acido-base", "qg-equilibrio", "qg-neutralizacion"]
    },
    "qg-neutralizacion": {
      title: "Neutralización, titulación e hidrólisis de sales", aliases: ["neutralización", "titulación", "valoración ácido-base", "punto de equivalencia", "hidrólisis", "hidrólisis de sales", "sal ácida", "sal básica", "indicador ácido-base"], concepts: ["qg-neutralizacion"],
      summary: "Un ácido y una base reaccionan: H⁺ + OH⁻ → H₂O. En una titulación se agrega base de concentración conocida hasta el punto de equivalencia (moles de OH⁻ = moles de H⁺ ácidos). Las sales de ácido débil con base fuerte dan soluciones básicas; las de base débil con ácido fuerte, ácidas; las de fuerte con fuerte, neutras.",
      def: [R`**Neutralización:** ácido + base → sal + agua; en forma iónica, $\mathrm{H^+} + \mathrm{OH^-} \to \mathrm{H_2O}$. En el **punto de equivalencia**, los moles de OH⁻ agregados igualan a los de H⁺ ácidos: $n_{H}\,C_aV_a = n_{OH}\,C_bV_b$ (con $n$ los H⁺ u OH⁻ por unidad).`,
        R`En una **titulación** (valoración) se agrega una solución de concentración conocida con una bureta y se detecta la equivalencia con un **indicador** que cambia de color (fenolftaleína, de incolora a rosa cerca de pH 8-10) o con un pHmetro. La **curva de titulación** muestra el salto de pH cerca de la equivalencia.`,
        R`**Hidrólisis:** los iones de una sal pueden reaccionar con el agua. Los que vienen de ácidos o bases fuertes no lo hacen (Na⁺, K⁺, Cl⁻, NO₃⁻). El anión de un ácido débil (CH₃COO⁻, F⁻, CO₃²⁻) es básico; el catión de una base débil (NH₄⁺) es ácido. Por eso en la titulación de un ácido débil con base fuerte la equivalencia está en pH > 7.`],
      idea: [R`En la equivalencia "se neutralizaron" los moles, pero no necesariamente el pH: si el ácido era débil, en la solución queda su base conjugada, que hidroliza y la vuelve básica. Por eso hay que elegir un indicador que vire cerca del pH de equivalencia.`],
      demo: [R`**Paso 1 (moles).** El ácido aporta $n_H C_aV_a$ moles de H⁺ (cada molécula, $n_H$ protones ácidos).`,
        R`**Paso 2 (reacción 1:1).** Cada OH⁻ consume un H⁺, así que en la equivalencia $n_{OH}C_bV_b = n_HC_aV_a$.`,
        R`**Paso 3 (despejar).** $V_b = \frac{n_HC_aV_a}{n_{OH}C_b}$ (con los volúmenes en la misma unidad). $\blacksquare$`],
      examples: [{ q: R`25 mL de H₂SO₄ 0,1 M con NaOH 0,2 M.`, steps: [R`H⁺: $2\cdot0{,}1\cdot25 = 5$ mmol. $V_b = \frac{5}{0{,}2} = 25$ mL.`] }],
      see: ["qg-acido-base", "qg-ph-debil", "qg-estequiometria"]
    }
  };

  E.extendCourse("q101", {
    concepts: { "qg-acido-base": { name: "pH y ácidos fuertes" }, "qg-ph-debil": { name: "Ácidos y bases débiles" }, "qg-neutralizacion": { name: "Neutralización e hidrólisis" } },
    templates: T,
    units: [{
      id: "qg-acidos-u", order: 10, program: "Unidad 8", title: "Ácidos y bases", icon: "flask-conical",
      diagnostic: ["qg-ph-fuerte-num", "qg-ph-debil-num", "qg-neutralizacion-num"],
      lessons: [
        { id: "qg-l-ph", title: "pH de ácidos y bases fuertes", templates: ["qg-conjugado-mc", "qg-ph-fuerte-num"], theory: ["qg-acido-base"],
          intro: R`$\mathrm{pH} = -\log[\mathrm{H^+}]$, $\mathrm{pH} + \mathrm{pOH} = 14$. Fuertes: disociación completa.` },
        { id: "qg-l-debiles", title: "Ácidos y bases débiles", templates: ["qg-ph-debil-num", "qg-ka-desde-ph-num"], theory: ["qg-ph-debil"],
          intro: R`$\frac{x^2}{C - x} = K_a$; si $x \ll C$, $x \approx \sqrt{K_aC}$.` },
        { id: "qg-l-neutralizacion", title: "Neutralización e hidrólisis", templates: ["qg-neutralizacion-num", "qg-hidrolisis-mc"], theory: ["qg-neutralizacion"],
          intro: R`Equivalencia: moles de OH⁻ = moles de H⁺. Sal de ácido débil: básica; de base débil: ácida.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 9 · ELECTROQUÍMICA
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, Q = E.qg, nf = Q.nf, dn = Q.dn;
  const T = {};
  const tx = (f, q) => Q.tex(f, q);
  const qs = q => (q === 0 ? "" : (Math.abs(q) === 1 ? "" : Math.abs(q)) + (q > 0 ? "+" : "-"));

  // ---- números de oxidación (tabla escrita a mano) ----
  const OX = [["MnO4", -1, "Mn", 7], ["Cr2O7", -2, "Cr", 6], ["SO4", -2, "S", 6], ["SO3", -2, "S", 4], ["S2O3", -2, "S", 2], ["NO3", -1, "N", 5], ["NO2", -1, "N", 3], ["NH4", 1, "N", -3],
    ["H2O2", 0, "O", -1], ["ClO3", -1, "Cl", 5], ["ClO4", -1, "Cl", 7], ["ClO", -1, "Cl", 1], ["PO4", -3, "P", 5], ["CrO4", -2, "Cr", 6], ["K2MnO4", 0, "Mn", 6], ["Fe2O3", 0, "Fe", 3], ["H2S", 0, "S", -2], ["N2O", 0, "N", 1], ["C2O4", -2, "C", 3], ["CH4", 0, "C", -4]];
  T["qg-oxidacion-num"] = {
    type: "numeric", concepts: ["qg-redox"], difficulty: 1,
    generate(r) {
      const [f, q, el, st] = r.pick(OX);
      return {
        prompt: `¿Cuál es el número de oxidación del ${el} en $${tx(f, qs(q))}$?`,
        answer: st,
        solution: [`Con O = −2 (salvo en peróxidos, donde es −1), H = +1 y K = +1, la suma de los [[qg-redox|números de oxidación]] tiene que dar la carga, ${q}.`,
          `Despejando, el ${el} queda en ${st > 0 ? "+" : ""}${st}.`],
        traps: [{ value: -st, msg: "Revisá el signo: el oxígeno aporta cargas negativas y el elemento central compensa." }].filter(t => t.value !== st),
        // verificación: se reparten las cargas átomo por átomo con los valores fijos y se despeja el que falta
        verify: { kind: "value", fn: () => {
          const c = Q.count2(f), fixed = { O: f === "H2O2" ? null : -2, H: f === "H2O2" ? 1 : 1, K: 1 };
          if (f === "H2O2") return (q - 2 * 1) / 2;
          let rest = q;
          for (const [e, k] of Object.entries(c)) if (e !== el) rest -= (fixed[e] ?? 0) * k;
          return rest / c[el];
        } }
      };
    }
  };
  // ---- balanceo por ion-electrón (medio ácido): [fórmula, carga, coeficiente], reactivos y productos ----
  const IONE = [
    { r: [["MnO4", -1, 1], ["Fe", 2, 5], ["H", 1, 8]], p: [["Mn", 2, 1], ["Fe", 3, 5], ["H2O", 0, 4]] },
    { r: [["Cr2O7", -2, 1], ["Fe", 2, 6], ["H", 1, 14]], p: [["Cr", 3, 2], ["Fe", 3, 6], ["H2O", 0, 7]] },
    { r: [["MnO4", -1, 2], ["H2C2O4", 0, 5], ["H", 1, 6]], p: [["Mn", 2, 2], ["CO2", 0, 10], ["H2O", 0, 8]] },
    { r: [["Cu", 0, 1], ["H", 1, 4], ["NO3", -1, 2]], p: [["Cu", 2, 1], ["NO2", 0, 2], ["H2O", 0, 2]] },
    { r: [["Cu", 0, 3], ["H", 1, 8], ["NO3", -1, 2]], p: [["Cu", 2, 3], ["NO", 0, 2], ["H2O", 0, 4]] },
    { r: [["Cr2O7", -2, 1], ["SO3", -2, 3], ["H", 1, 8]], p: [["Cr", 3, 2], ["SO4", -2, 3], ["H2O", 0, 4]] },
    { r: [["MnO4", -1, 2], ["SO3", -2, 5], ["H", 1, 6]], p: [["Mn", 2, 2], ["SO4", -2, 5], ["H2O", 0, 3]] },
    { r: [["H2O2", 0, 1], ["Fe", 2, 2], ["H", 1, 2]], p: [["Fe", 3, 2], ["H2O", 0, 2]] },
    { r: [["I", -1, 2], ["H2O2", 0, 1], ["H", 1, 2]], p: [["I2", 0, 1], ["H2O", 0, 2]] },
    { r: [["MnO4", -1, 2], ["Cl", -1, 10], ["H", 1, 16]], p: [["Mn", 2, 2], ["Cl2", 0, 5], ["H2O", 0, 8]] }
  ];
  const spTex = ([f, q, c], show) => `${show && c > 1 ? c : ""}${tx(f, qs(q))}`;
  const ionTex = (x, show) => `${x.r.map(s => spTex(s, show)).join(" + ")} \\to ${x.p.map(s => spTex(s, show)).join(" + ")}`;
  T["qg-ion-electron-num"] = {
    type: "numeric", concepts: ["qg-redox"], difficulty: 3,
    generate(r) {
      const x = r.pick(IONE), all = [...x.r, ...x.p], k = r.int(0, all.length - 1), [f, q, c] = all[k];
      return {
        prompt: `Balanceá en medio ácido, con coeficientes enteros mínimos: $${ionTex(x, false)}$. ¿Qué coeficiente lleva $${tx(f, qs(q))}$?`,
        answer: c,
        solution: [`Método del [[qg-redox|ion-electrón]]: se separan las hemirreacciones, se balancea cada una (primero el elemento que cambia, después O con H₂O, H con H⁺ y la carga con electrones) y se multiplican para que los electrones se cancelen.`,
          `Queda $${ionTex(x, true)}$: el coeficiente de $${tx(f, qs(q))}$ es ${c}.`],
        // verificación: núcleo de la matriz de elementos y carga, por eliminación de Gauss
        verify: { kind: "value", fn: () => Q.balance([...x.r.map(([f2, q2]) => ({ f: f2, q: q2, side: -1 })), ...x.p.map(([f2, q2]) => ({ f: f2, q: q2, side: 1 }))])[k] }
      };
    }
  };
  // ---- pilas: potenciales estándar de reducción (V) y electrones ----
  const EH = { Li: [-3.04, 1, "Li^+"], K: [-2.93, 1, "K^+"], Mg: [-2.37, 2, "Mg^{2+}"], Al: [-1.66, 3, "Al^{3+}"], Zn: [-0.76, 2, "Zn^{2+}"], Cr: [-0.74, 3, "Cr^{3+}"], Fe: [-0.44, 2, "Fe^{2+}"], Ni: [-0.25, 2, "Ni^{2+}"],
    Sn: [-0.14, 2, "Sn^{2+}"], Pb: [-0.13, 2, "Pb^{2+}"], Cu: [0.34, 2, "Cu^{2+}"], Ag: [0.80, 1, "Ag^+"], Au: [1.50, 3, "Au^{3+}"] };
  const METALS = Object.keys(EH);
  // ΔG° (kJ) de la reducción M^n+ + n e⁻ → M, por mol de metal
  const dGred = m => -EH[m][1] * Q.F * EH[m][0] / 1000;
  T["qg-pila-num"] = {
    type: "numeric", concepts: ["qg-pilas"], difficulty: 2,
    generate(r) {
      const [a, b] = r.sample(METALS.filter(m => !["Li", "K"].includes(m)), 2), ask = r.pick(["E", "E", "G"]);
      const [cat, an] = EH[a][0] > EH[b][0] ? [a, b] : [b, a], Ec = EH[cat][0] - EH[an][0];
      const nc = EH[cat][1], na = EH[an][1], L = nc * na / H.gcd(nc, na), n = L;
      const G = -n * Q.F * Ec / 1000;
      return {
        prompt: ask === "E" ? `Se arma una pila con un electrodo de ${an} en solución de $\\mathrm{${EH[an][2]}}$ 1 M y otro de ${cat} en $\\mathrm{${EH[cat][2]}}$ 1 M. ¿Cuál es su fem estándar (V)? ($E^\\circ$: ${an} $${dn(EH[an][0], 2)}$ V; ${cat} $${dn(EH[cat][0], 2)}$ V)`
          : `Para la pila estándar de ${an} y ${cat} ($E^\\circ$: ${an} $${dn(EH[an][0], 2)}$ V; ${cat} $${dn(EH[cat][0], 2)}$ V), ¿cuánto vale $\\Delta G^\\circ$ (kJ) para la reacción balanceada con los coeficientes mínimos? ($F = 96\\,485$ C/mol)`,
        answer: ask === "E" ? Ec : G, tolerance: 0.01,
        solution: [`En una [[qg-pilas|pila]] se reduce el de mayor $E^\\circ$ (cátodo: ${cat}) y se oxida el otro (ánodo: ${an}). $E^\\circ_{pila} = E^\\circ_{\\text{cát}} - E^\\circ_{\\text{án}} = ${dn(EH[cat][0], 2)} - (${dn(EH[an][0], 2)}) = ${dn(Ec, 2)}$ V.`,
          ask === "G" ? `Reacción: $${L / nc > 1 ? L / nc : ""}\\,\\mathrm{${EH[cat][2]}} + ${L / na > 1 ? L / na : ""}\\,\\mathrm{${an}} \\to ${L / nc > 1 ? L / nc : ""}\\,\\mathrm{${cat}} + ${L / na > 1 ? L / na : ""}\\,\\mathrm{${EH[an][2]}}$, con $n = ${n}$ electrones. $\\Delta G^\\circ = -nFE^\\circ = -${n}\\cdot96\\,485\\cdot${dn(Ec, 2)} \\approx ${dn(G, 1)}$ kJ.` : `Es positiva: la reacción es espontánea.`],
        traps: ask === "E" ? [{ value: EH[cat][0] + EH[an][0], msg: "Se restan: $E^\\circ_{\\text{cátodo}} - E^\\circ_{\\text{ánodo}}$ (los dos como potenciales de reducción)." }].filter(t => Math.abs(t.value - Ec) > 0.02) : (n > 1 ? [{ value: -Q.F * Ec / 1000, msg: "Revisá n: son los electrones que se transfieren en la reacción balanceada, no uno." }] : []),
        // verificación: por Hess con energías libres: ΔG° = (L/nc)·ΔG°red(cátodo) − (L/na)·ΔG°red(ánodo), y E = −ΔG/(nF)
        verify: { kind: "zero", tol: 1e-9, fn: v => {
          const dG = (L / nc) * dGred(cat) - (L / na) * dGred(an);
          return ask === "E" ? [-dG * 1000 / (n * Q.F) / v - 1] : [dG / v - 1];
        } }
      };
    }
  };
  T["qg-espontanea-vf"] = {
    type: "tf", concepts: ["qg-pilas"], difficulty: 1,
    generate(r) {
      const [m, ion] = r.sample(METALS, 2), spont = EH[ion][0] > EH[m][0];
      return {
        prompt: `<b>Verdadero o falso:</b> una lámina de ${m} sumergida en una solución de $\\mathrm{${EH[ion][2]}}$ 1 M se recubre de ${ion} (el ${m} reduce al ion). ($E^\\circ$: ${m} $${dn(EH[m][0], 2)}$ V; ${ion} $${dn(EH[ion][0], 2)}$ V)`,
        answer: spont,
        explanation: `La reacción es $\\mathrm{${m}} + \\mathrm{${EH[ion][2]}} \\to \\mathrm{${EH[m][2]}} + \\mathrm{${ion}}$ (sin balancear), con $E^\\circ = ${dn(EH[ion][0], 2)} - (${dn(EH[m][0], 2)}) = ${dn(EH[ion][0] - EH[m][0], 2)}$ V. ${spont ? "Es positiva: ocurre sola. Un metal desplaza de sus sales a los que están más arriba en la [[qg-pilas|serie electromotriz]]." : "Es negativa: no ocurre (ocurriría la inversa)."}`,
        solution: [`Espontánea si $E^\\circ = E^\\circ_{red}(\\text{el que se reduce}) - E^\\circ_{red}(\\text{el que se oxida}) > 0$, o sea $\\Delta G^\\circ < 0$.`],
        // verificación: ΔG° por mol de electrones con las energías libres de reducción
        verify: { kind: "truth", fn: () => dGred(ion) / EH[ion][1] - dGred(m) / EH[m][1] < 0 }
      };
    }
  };
  T["qg-anodo-mc"] = {
    type: "mc", concepts: ["qg-pilas"], difficulty: 2,
    generate(r) {
      const [a, b] = r.sample(METALS.filter(m => !["Li", "K"].includes(m)), 2), [cat, an] = EH[a][0] > EH[b][0] ? [a, b] : [b, a], ask = r.pick(["anodo", "catodo", "electrones", "masa"]);
      const ok = ask === "anodo" ? `el de ${an}` : ask === "catodo" ? `el de ${cat}` : ask === "electrones" ? `del ${an} al ${cat}` : `el de ${an} pierde masa y el de ${cat} gana`;
      const ds = ask === "anodo" ? [`el de ${cat}`, "los dos, alternadamente", "depende de las masas de los electrodos"] : ask === "catodo" ? [`el de ${an}`, "los dos, alternadamente", "depende de las masas de los electrodos"]
        : ask === "electrones" ? [`del ${cat} al ${an}`, "no circulan electrones por el cable", "por el puente salino, de un vaso al otro"] : [`el de ${cat} pierde masa y el de ${an} gana`, "ninguno cambia de masa", "los dos pierden masa"];
      const mcq = H.mc(r, ok, ds, { text: true });
      return {
        prompt: `En la pila $\\mathrm{${a}}|\\mathrm{${EH[a][2]}}\\ (1\\ \\mathrm M)$ y $\\mathrm{${b}}|\\mathrm{${EH[b][2]}}\\ (1\\ \\mathrm M)$ ($E^\\circ$: ${a} $${dn(EH[a][0], 2)}$ V; ${b} $${dn(EH[b][0], 2)}$ V), ${ask === "anodo" ? "¿cuál electrodo es el ánodo?" : ask === "catodo" ? "¿cuál electrodo es el cátodo?" : ask === "electrones" ? "¿en qué sentido van los electrones por el cable?" : "¿qué pasa con las masas de los electrodos?"}`,
        options: mcq.options, correct: mcq.correct,
        solution: [`Se reduce el de mayor potencial de reducción (${cat}, $${dn(EH[cat][0], 2)}$ V): es el **cátodo**. El ${an} se oxida: es el **ánodo** ([[qg-pilas|pila galvánica]]).`,
          `Los electrones salen del ánodo y van por el cable al cátodo. El ${an} se disuelve como iones (pierde masa) y en el cátodo se deposita ${cat} (gana masa).`],
        // verificación: se calcula ΔG° para las dos direcciones posibles y se elige la espontánea
        verify: { kind: "truth", target: true, fn: () => {
          const dir1 = dGred(a) / EH[a][1] - dGred(b) / EH[b][1];      // a se reduce y b se oxida (por electrón)
          const reduced = dir1 < 0 ? a : b;
          return reduced === cat;
        } }
      };
    }
  };
  T["qg-nernst-num"] = {
    type: "numeric", concepts: ["qg-pilas"], difficulty: 3,
    generate(r) {
      const pairs = [["Zn", "Cu"], ["Ni", "Ag"], ["Fe", "Cu"], ["Zn", "Ag"], ["Mg", "Cu"], ["Pb", "Ag"]], [an, cat] = r.pick(pairs);
      const ca = r.pick([0.001, 0.01, 0.1, 0.5, 1, 2]), cc = r.pick([0.001, 0.01, 0.1, 0.5, 1, 2]);
      const na = EH[an][1], nc = EH[cat][1], n = na * nc / H.gcd(na, nc), E0 = EH[cat][0] - EH[an][0];
      const Qr = ca ** (n / na) / cc ** (n / nc), Ecell = E0 - 0.0592 / n * Math.log10(Qr);
      return {
        prompt: `Calculá la fem (V) a 25 °C de la pila $\\mathrm{${an}}|\\mathrm{${EH[an][2]}}\\ (${dn(ca, 3)}\\ \\mathrm M)\\,||\\,\\mathrm{${EH[cat][2]}}\\ (${dn(cc, 3)}\\ \\mathrm M)|\\mathrm{${cat}}$. ($E^\\circ$: ${an} $${dn(EH[an][0], 2)}$ V; ${cat} $${dn(EH[cat][0], 2)}$ V)`,
        answer: Ecell, tolerance: 0.005,
        solution: [`$E^\\circ = ${dn(EH[cat][0], 2)} - (${dn(EH[an][0], 2)}) = ${dn(E0, 2)}$ V, con $n = ${n}$ electrones.`,
          `[[qg-pilas|Ecuación de Nernst]]: $E = E^\\circ - \\frac{0{,}0592}{n}\\log Q$, con $Q = \\frac{[\\mathrm{${EH[an][2]}}]${n / na > 1 ? `^{${n / na}}` : ""}}{[\\mathrm{${EH[cat][2]}}]${n / nc > 1 ? `^{${n / nc}}` : ""}} \\approx ${nf(Qr, 3)}$ (los metales sólidos no entran).`,
          `$E \\approx ${dn(E0, 2)} - \\frac{0{,}0592}{${n}}\\log(${nf(Qr, 3)}) \\approx ${dn(Ecell, 3)}$ V.`],
        traps: [{ value: E0, msg: "Esa es la fem estándar: con concentraciones distintas de 1 M hay que corregir con Nernst." }].filter(t => Math.abs(t.value - Ecell) > 0.01),
        // verificación: E = E° − (RT/nF)·ln Q con R, T y F (sin el 0,0592 redondeado)
        verify: { kind: "zero", tol: 2e-4, fn: v => [(E0 - Q.Rsi * 298.15 / (n * Q.F) * Math.log(Qr)) - v] }
      };
    }
  };
  T["qg-faraday-num"] = {
    type: "numeric", concepts: ["qg-electrolisis"], difficulty: 2,
    generate(r) {
      const m = r.pick(["Cu", "Ag", "Zn", "Ni", "Au", "Al"]), [, n] = EH[m], M = Q.A[m], ask = r.pick(["masa", "tiempo", "I"]);
      const I = r.pick([0.5, 1, 1.5, 2, 2.5, 5, 10]), tmin = r.pick([10, 15, 30, 45, 60, 90, 120]), t = tmin * 60;
      const mass = I * t / (n * Q.F) * M, ms = +mass.toFixed(3);
      const ans = ask === "masa" ? mass : ask === "tiempo" ? ms * n * Q.F / (M * I) / 60 : ms * n * Q.F / (M * t);
      return {
        prompt: ask === "masa" ? `¿Cuántos gramos de ${m} se depositan en el cátodo al electrolizar una solución de $\\mathrm{${EH[m][2]}}$ con $${dn(I, 1)}$ A durante $${tmin}$ min? ($F = 96\\,485$ C/mol)`
          : ask === "tiempo" ? `¿Cuántos minutos hay que electrolizar una solución de $\\mathrm{${EH[m][2]}}$ con $${dn(I, 1)}$ A para depositar $${dn(ms, 3)}$ g de ${m}? ($F = 96\\,485$ C/mol)`
          : `¿Qué corriente (A) deposita $${dn(ms, 3)}$ g de ${m} desde una solución de $\\mathrm{${EH[m][2]}}$ en $${tmin}$ min? ($F = 96\\,485$ C/mol)`,
        answer: ans, tolerance: 0.01,
        solution: [`[[qg-electrolisis|Leyes de Faraday]]: la carga es $q = It$ y cada mol de electrones transporta $F = 96\\,485$ C. Para depositar un mol de ${m} hacen falta ${n} mol de electrones ($\\mathrm{${EH[m][2]}} + ${n}e^- \\to \\mathrm{${m}}$).`,
          ask === "masa" ? `$q = ${dn(I, 1)}\\cdot${t} = ${I * t}$ C; $n_{e} = \\frac{${I * t}}{96\\,485} \\approx ${nf(I * t / Q.F, 4)}$ mol; $m = \\frac{n_e}{${n}}\\cdot${dn(M, 2)} \\approx ${dn(mass, 3)}$ g.`
            : `$n_{e} = ${n}\\cdot\\frac{${dn(ms, 3)}}{${dn(M, 2)}} \\approx ${nf(n * ms / M, 4)}$ mol, o sea $q \\approx ${dn(n * ms / M * Q.F, 0)}$ C. ${ask === "tiempo" ? `$t = \\frac qI \\approx ${dn(ans * 60, 0)}$ s $\\approx ${dn(ans, 1)}$ min.` : `$I = \\frac qt \\approx ${dn(ans, 2)}$ A.`}`],
        traps: n > 1 ? [{ value: ask === "masa" ? mass * n : ask === "tiempo" ? ans / n : ans / n, msg: `Cada ion $\\mathrm{${EH[m][2]}}$ necesita ${n} electrones para depositarse.` }] : [],
        // verificación: contando electrones uno por uno (carga / e) y átomos (electrones / n), y pasando a gramos con N_A
        verify: { kind: "zero", tol: 1e-4, fn: v => {
          const charge = ask === "I" ? v * t : ask === "tiempo" ? I * v * 60 : I * t;
          const atoms = charge / Q.e / n, grams = atoms / Q.NA * M;
          return [grams / (ask === "masa" ? v : ms) - 1];
        } }
      };
    }
  };

  const cards = {
    "qg-redox": {
      title: "Óxido-reducción y método del ion-electrón", aliases: ["óxido-reducción", "reacción redox", "reacciones redox", "agente oxidante", "agente reductor", "método del ion-electrón", "hemirreacción"], concepts: ["qg-redox"],
      summary: "Oxidación: pérdida de electrones (sube el número de oxidación). Reducción: ganancia (baja). El oxidante se reduce y el reductor se oxida. Ion-electrón: se balancea cada hemirreacción (elemento, O con H₂O, H con H⁺, carga con e⁻) y se iguala la cantidad de electrones.",
      def: [R`En una reacción **redox** se transfieren electrones. **Oxidación:** pérdida de electrones (el [[qg-sistemas|número de oxidación]] sube). **Reducción:** ganancia (baja). El **agente oxidante** es el que se reduce (le saca electrones al otro) y el **reductor**, el que se oxida.`,
        R`**Método del ion-electrón** (en medio ácido):
1. Se escriben las dos **hemirreacciones** (oxidación y reducción).
2. En cada una se balancea el elemento que cambia, después el O agregando H₂O, el H agregando H⁺ y la carga agregando electrones.
3. Se multiplican para que los electrones ganados y perdidos sean iguales, y se suman.
En medio básico, al final se neutralizan los H⁺ agregando OH⁻ a los dos lados.`],
      idea: [R`Los electrones no se crean ni se destruyen: los que pierde el reductor son exactamente los que gana el oxidante. Ese conteo es lo que hace funcionar el método, y es también lo que aprovecha una [[qg-pilas|pila]]: separar las dos mitades y hacer pasar los electrones por un cable.`],
      demo: [R`**Paso 1 (hemirreacción del permanganato).** $\mathrm{MnO_4^-} \to \mathrm{Mn^{2+}}$: el Mn ya está balanceado. Faltan 4 O a la derecha: $+4\,\mathrm{H_2O}$. Eso suma 8 H: $+8\,\mathrm{H^+}$ a la izquierda. Carga: izquierda $-1 + 8 = +7$, derecha $+2$: se agregan 5 e⁻ a la izquierda. $\mathrm{MnO_4^-} + 8\mathrm{H^+} + 5e^- \to \mathrm{Mn^{2+}} + 4\mathrm{H_2O}$.`,
        R`**Paso 2 (la otra).** $\mathrm{Fe^{2+}} \to \mathrm{Fe^{3+}} + e^-$.`,
        R`**Paso 3 (igualar electrones).** Multiplicando la segunda por 5 y sumando, los 5 e⁻ se cancelan: $\mathrm{MnO_4^-} + 5\mathrm{Fe^{2+}} + 8\mathrm{H^+} \to \mathrm{Mn^{2+}} + 5\mathrm{Fe^{3+}} + 4\mathrm{H_2O}$. Masa y carga ($+17$ a cada lado) quedan balanceadas. $\blacksquare$`],
      examples: [{ q: R`Número de oxidación del Cr en $\mathrm{Cr_2O_7^{2-}}$.`, steps: [R`$2x + 7(-2) = -2$: $x = +6$.`] }],
      see: ["qg-sistemas", "qg-balanceo", "qg-pilas"]
    },
    "qg-pilas": {
      title: "Pilas galvánicas, potenciales y ecuación de Nernst", aliases: ["pila galvánica", "celda galvánica", "celda voltaica", "ánodo", "cátodo", "puente salino", "potencial estándar de reducción", "serie electromotriz", "electrodo normal de hidrógeno", "ecuación de Nernst", "celda de combustible"], concepts: ["qg-pilas"],
      summary: "En una pila, la oxidación ocurre en el ánodo y la reducción en el cátodo; los electrones van por el cable del ánodo al cátodo y el puente salino cierra el circuito. E°pila = E°cátodo − E°ánodo (potenciales de reducción, medidos contra el electrodo de hidrógeno). ΔG° = −nFE°. Nernst: E = E° − (0,0592/n)·log Q a 25 °C.",
      def: [R`Una **pila galvánica** separa una reacción redox espontánea en dos **hemiceldas**: en el **ánodo** ocurre la oxidación y en el **cátodo** la reducción. Los electrones circulan por el conductor externo del ánodo al cátodo, y un **puente salino** permite el paso de iones para mantener la neutralidad. Notación: $\mathrm{Zn}|\mathrm{Zn^{2+}}\,||\,\mathrm{Cu^{2+}}|\mathrm{Cu}$ (ánodo a la izquierda).`,
        R`El **potencial estándar de reducción** $E^\circ$ de cada hemicelda se mide contra el **electrodo normal de hidrógeno** ($\mathrm{2H^+} + 2e^- \to \mathrm{H_2}$, $E^\circ = 0$). Ordenados forman la **serie electromotriz**. La fem de la pila es $E^\circ_{pila} = E^\circ_{\text{cátodo}} - E^\circ_{\text{ánodo}}$: se reduce el de mayor $E^\circ$.`,
        R`**Energía libre:** $\Delta G^\circ = -nFE^\circ$, con $n$ los electrones transferidos y $F = 96\,485$ C/mol. Si $E > 0$, la reacción es espontánea.`,
        R`**Ecuación de Nernst:** $E = E^\circ - \frac{RT}{nF}\ln Q$, que a 25 °C es $E = E^\circ - \frac{0{,}0592}{n}\log Q$. En el equilibrio $E = 0$ y $Q = K$.`,
        R`Una **celda de combustible** es una pila alimentada continuamente: $\mathrm{2H_2} + \mathrm{O_2} \to \mathrm{2H_2O}$ da 1,23 V sin combustión.`],
      idea: [R`Multiplicar una hemirreacción por 2 no cambia su potencial: $E^\circ$ es una "presión" de electrones (energía por carga), no una cantidad. Lo que sí se multiplica es $\Delta G$. Por eso, para combinar potenciales en pasos que no son una pila, hay que pasar por $\Delta G$.`],
      demo: [R`**Paso 1 (trabajo eléctrico).** Al pasar $n$ moles de electrones por una diferencia de potencial $E$, la carga es $nF$ y el trabajo eléctrico máximo que puede hacer la pila es $nFE$.`,
        R`**Paso 2 (energía libre).** Ese trabajo máximo es la disminución de la energía libre: $\Delta G = -nFE$, y en condiciones estándar $\Delta G^\circ = -nFE^\circ$.`,
        R`**Paso 3 (Nernst).** Como $\Delta G = \Delta G^\circ + RT\ln Q$, dividiendo por $-nF$: $E = E^\circ - \frac{RT}{nF}\ln Q$. A 298 K, $\frac{RT}F\ln 10 = 0{,}0592$ V. $\blacksquare$`],
      examples: [{ q: R`Pila de Daniell: Zn (−0,76 V) y Cu (+0,34 V).`, steps: [R`$E^\circ = 0{,}34 - (-0{,}76) = 1{,}10$ V; $n = 2$.`, R`$\Delta G^\circ = -2\cdot96\,485\cdot1{,}10 \approx -212$ kJ.`] }],
      see: ["qg-redox", "qg-electrolisis", "qg-equilibrio"]
    },
    "qg-electrolisis": {
      title: "Electrólisis y leyes de Faraday", aliases: ["electrólisis", "celda electrolítica", "leyes de Faraday", "constante de Faraday", "galvanoplastia"], concepts: ["qg-electrolisis"],
      summary: "En la electrólisis una fuente externa fuerza una reacción redox no espontánea. Faraday: la masa transformada es proporcional a la carga, m = (I·t / nF)·M, con n los electrones por unidad y F = 96 485 C/mol.",
      def: [R`En una **celda electrolítica** una fuente de corriente continua obliga a ocurrir una reacción no espontánea: en el cátodo (conectado al polo negativo) hay reducción y en el ánodo (positivo) oxidación. Así se obtienen Al, Na y Cl₂, se refina el cobre y se recubren piezas metálicas (**galvanoplastia**).`,
        R`**Leyes de Faraday:** la cantidad de sustancia que reacciona en un electrodo es proporcional a la carga que pasa: $n_{sust} = \frac{q}{nF}$, con $q = It$ y $n$ los electrones por unidad (2 para $\mathrm{Cu^{2+}} \to \mathrm{Cu}$). La masa es $m = \frac{It}{nF}M$.`],
      idea: [R`$F$ es la carga de un mol de electrones: $F = N_A\,e = 6{,}022\times10^{23}\cdot1{,}602\times10^{-19} \approx 96\,485$ C/mol. Así, la electrólisis permite "contar" átomos midiendo corriente y tiempo.`],
      demo: [R`**Paso 1 (carga).** Una corriente $I$ durante $t$ transporta $q = It$ coulombs, o sea $\frac{q}{e}$ electrones, que son $\frac{q}{N_Ae} = \frac qF$ moles de electrones.`,
        R`**Paso 2 (átomos).** Cada ion $\mathrm{M^{n+}}$ necesita $n$ electrones para depositarse: se depositan $\frac{q}{nF}$ moles de M.`,
        R`**Paso 3 (masa).** Multiplicando por la masa molar: $m = \frac{It}{nF}M$. $\blacksquare$`],
      examples: [{ q: R`2 A durante 1 h sobre Cu²⁺.`, steps: [R`$q = 7200$ C; $\frac{7200}{2\cdot96\,485} \approx 0{,}0373$ mol de Cu.`, R`$m \approx 2{,}37$ g.`] }],
      see: ["qg-pilas", "qg-mol"]
    }
  };

  E.extendCourse("q101", {
    concepts: { "qg-redox": { name: "Redox e ion-electrón" }, "qg-pilas": { name: "Pilas y potenciales" }, "qg-electrolisis": { name: "Electrólisis" } },
    templates: T,
    units: [{
      id: "qg-electroquimica-u", order: 11, program: "Unidad 9", title: "Electroquímica", icon: "zap",
      diagnostic: ["qg-oxidacion-num", "qg-pila-num", "qg-faraday-num"],
      lessons: [
        { id: "qg-l-redox", title: "Óxido-reducción", templates: ["qg-oxidacion-num", "qg-ion-electron-num"], theory: ["qg-redox"],
          intro: R`Oxidación: pierde electrones; reducción: gana. Ion-electrón: O con H₂O, H con H⁺, carga con e⁻.` },
        { id: "qg-l-pilas", title: "Pilas", templates: ["qg-espontanea-vf", "qg-anodo-mc", "qg-pila-num"], theory: ["qg-pilas"],
          intro: R`$E^\circ_{pila} = E^\circ_{\text{cát}} - E^\circ_{\text{án}}$; $\Delta G^\circ = -nFE^\circ$.` },
        { id: "qg-l-nernst", title: "Ecuación de Nernst", templates: ["qg-nernst-num"], theory: ["qg-pilas"],
          intro: R`$E = E^\circ - \frac{0{,}0592}{n}\log Q$ a 25 °C.` },
        { id: "qg-l-electrolisis", title: "Electrólisis", templates: ["qg-faraday-num"], theory: ["qg-electrolisis"],
          intro: R`$m = \frac{It}{nF}M$.` }
      ]
    }],
    cards
  });
})();
