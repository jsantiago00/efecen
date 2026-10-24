/*
 * M105 · Probabilidad y Estadística — Lic. en Ciencias Básicas (FCEN, UNCuyo), Plan Ord. 77/15 C.S.
 * ==========================================================================================
 * No se encontró el programa oficial: se usa un temario estándar de un primer curso, en 8 unidades,
 * contrastado con los temas del final 2021 que está en Apunteca (muestreo, descriptiva, intervalos,
 * correlación, regresión y ANOVA):
 *   1 Estadística descriptiva · 2 Probabilidad · 3 Variables aleatorias discretas
 *   4 Variables aleatorias continuas · 5 Variables conjuntas y distribuciones muestrales
 *   6 Estimación · 7 Pruebas de hipótesis · 8 Regresión y correlación
 * Ids con prefijo "pe-". Todo el texto y los ejercicios son originales.
 */
(function () {
  const E = window.Efecen;
  E.registerCourse({ id: "m105", code: "M105", title: "Probabilidad y Estadística", icon: "chart-column" });

  // ---------- biblioteca estadística compartida por las unidades (E.pye) ----------
  const S = E.pye = {};
  // log Γ(x) por Lanczos (g = 7)
  const LC = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  S.lgamma = x => {
    if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - S.lgamma(1 - x);
    x -= 1;
    let a = LC[0];
    const t = x + 7.5;
    for (let i = 1; i < 9; i++) a += LC[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  };
  S.phi = z => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
  // Φ(z) por la serie de Taylor de la integral (converge para todo z)
  S.Phi = z => {
    if (z < -9) return 0;
    if (z > 9) return 1;
    let term = z, sum = z;
    for (let n = 1; n < 500 && Math.abs(term) > 1e-17 * Math.abs(sum); n++) { term *= z * z / (2 * n + 1); sum += term; }
    return 0.5 + S.phi(z) * sum;
  };
  // gamma incompleta regularizada P(a, x): serie o fracción continua
  S.gammaP = (a, x) => {
    if (x <= 0) return 0;
    const gl = S.lgamma(a);
    if (x < a + 1) {
      let ap = a, sum = 1 / a, del = sum;
      for (let n = 0; n < 1000; n++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-16) break; }
      return sum * Math.exp(-x + a * Math.log(x) - gl);
    }
    let b = x + 1 - a, c = 1e300, d = 1 / b, h = d;
    for (let i = 1; i < 1000; i++) {
      const an = -i * (i - a); b += 2;
      d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
      c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d; const del = d * c; h *= del;
      if (Math.abs(del - 1) < 1e-16) break;
    }
    return 1 - Math.exp(-x + a * Math.log(x) - gl) * h;
  };
  // beta incompleta regularizada I_x(a, b) por fracción continua
  const betacf = (a, b, x) => {
    const qab = a + b, qap = a + 1, qam = a - 1;
    let c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < 1e-300) d = 1e-300;
    d = 1 / d; let h = d;
    for (let m = 1; m < 1000; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300; c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300; c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d;
      const del = d * c; h *= del;
      if (Math.abs(del - 1) < 1e-16) break;
    }
    return h;
  };
  S.betaI = (a, b, x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const bt = Math.exp(S.lgamma(a + b) - S.lgamma(a) - S.lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
  };
  S.chi2cdf = (x, k) => S.gammaP(k / 2, x / 2);
  S.tcdf = (t, v) => { const p = 0.5 * S.betaI(v / 2, 0.5, v / (v + t * t)); return t > 0 ? 1 - p : p; };
  S.Fcdf = (x, d1, d2) => (x <= 0 ? 0 : S.betaI(d1 / 2, d2 / 2, d1 * x / (d1 * x + d2)));
  // cuantil por bisección sobre una función de distribución creciente
  S.quantile = (cdf, p, lo, hi, it = 200) => { for (let i = 0; i < it; i++) { const m = (lo + hi) / 2; if (cdf(m) < p) lo = m; else hi = m; } return (lo + hi) / 2; };
  S.zq = p => S.quantile(S.Phi, p, -10, 10);
  S.tq = (p, v) => S.quantile(t => S.tcdf(t, v), p, -1e3, 1e3);
  S.chi2q = (p, k) => S.quantile(x => S.chi2cdf(x, k), p, 0, 2000);
  S.Fq = (p, d1, d2) => S.quantile(x => S.Fcdf(x, d1, d2), p, 0, 1e4);
  // densidades (para recalcular por integración numérica, sin las funciones incompletas)
  S.tpdf = (t, v) => Math.exp(S.lgamma((v + 1) / 2) - S.lgamma(v / 2) - 0.5 * Math.log(v * Math.PI) - (v + 1) / 2 * Math.log(1 + t * t / v));
  S.chi2pdf = (x, k) => (x <= 0 ? 0 : Math.exp((k / 2 - 1) * Math.log(x) - x / 2 - (k / 2) * Math.LN2 - S.lgamma(k / 2)));
  S.simpson = (f, a, b, n = 2000) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3; };
  // P(χ²_k ≤ q) integrando la densidad con x = u² (así no hay singularidad en 0)
  // (con la constante de normalización calculada una sola vez)
  S.chi2cdfNum = (q, k) => { const c = -(k / 2) * Math.LN2 - S.lgamma(k / 2); return S.simpson(u => (k === 1 ? 2 * Math.exp(c - u * u / 2) : 2 * Math.exp(c + (k - 1) * Math.log(u || 1e-300) - u * u / 2)), 0, Math.sqrt(q), 1200); };
  S.tcdfNum = (t, v) => { const c = S.lgamma((v + 1) / 2) - S.lgamma(v / 2) - 0.5 * Math.log(v * Math.PI); return 0.5 + S.simpson(x => Math.exp(c - (v + 1) / 2 * Math.log(1 + x * x / v)), 0, t, 1200); };
  S.PhiNum = z => 0.5 + S.simpson(S.phi, 0, z, 1200);
  // combinatoria y distribuciones discretas
  S.choose = (n, k) => { if (k < 0 || k > n) return 0; let c = 1; for (let i = 1; i <= k; i++) c = c * (n - k + i) / i; return Math.round(c); };
  S.binpmf = (k, n, p) => S.choose(n, k) * p ** k * (1 - p) ** (n - k);
  S.poispmf = (k, l) => Math.exp(k * Math.log(l) - l - S.lgamma(k + 1));
  // estadísticos de una muestra
  S.sorted = a => a.slice().sort((x, y) => x - y);
  S.mean = a => a.reduce((s, x) => s + x, 0) / a.length;
  S.median = a => { const b = S.sorted(a), n = b.length; return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; };
  S.var = a => { const m = S.mean(a); return a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1); };
  // m es una mediana de a si a lo sumo la mitad de los datos queda de cada lado
  S.isMedian = (a, m) => a.filter(x => x < m - 1e-12).length <= a.length / 2 && a.filter(x => x > m + 1e-12).length <= a.length / 2;
  // mínimo de una función unimodal (sección áurea)
  S.golden = (f, a, b) => { const g = (Math.sqrt(5) - 1) / 2; let x1 = b - g * (b - a), x2 = a + g * (b - a), f1 = f(x1), f2 = f(x2); for (let i = 0; i < 300; i++) { if (f1 < f2) { b = x2; x2 = x1; f2 = f1; x1 = b - g * (b - a); f1 = f(x1); } else { a = x1; x1 = x2; f1 = f2; x2 = a + g * (b - a); f2 = f(x2); } } return (a + b) / 2; };
  // formato: decimales con coma y listas de datos separadas por punto y coma
  S.nf = (x, d = 4) => E.H.num(x, d).replace(".", "{,}");
  // lo mismo para texto común (fuera de TeX)
  S.nt = (x, d = 4) => E.H.num(x, d).replace(".", ",");
  S.list = a => a.map(x => S.nf(x, 3)).join(";\\ ");
})();

/* =====================================================================
 *  UNIDAD 1 · ESTADÍSTICA DESCRIPTIVA
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, S = E.pye, nf = S.nf;
  const T = {};
  // datos enteros con una moda única
  const dataset = (r, n, lo = 1, hi = 30) => {
    const a = Array.from({ length: n - 2 }, () => r.int(lo, hi)), m = r.pick(a);
    a.push(m, m);
    return r.shuffle(a);
  };
  const freq = a => { const f = new Map(); for (const x of a) f.set(x, (f.get(x) || 0) + 1); return f; };

  T["pe-centro-num"] = {
    type: "numeric", concepts: ["pe-centralizacion"], difficulty: 1,
    generate(r) {
      const n = r.int(7, 12), a = dataset(r, n), ask = r.pick(["media", "mediana", "moda"]), b = S.sorted(a), f = freq(a);
      const top = Math.max(...f.values()), modes = [...f.keys()].filter(k => f.get(k) === top);
      if (ask === "moda" && modes.length > 1) return null;
      const ans = ask === "media" ? S.mean(a) : ask === "mediana" ? S.median(a) : modes[0];
      const sol = ask === "media" ? [`La [[pe-centralizacion|media]] es la suma dividida por la cantidad de datos: $\\bar x = \\frac{${a.reduce((s, x) => s + x, 0)}}{${n}} \\approx ${nf(ans)}$.`]
        : ask === "mediana" ? [`Ordenados: $${S.list(b)}$.`, n % 2 ? `Con $n = ${n}$ impar, la [[pe-centralizacion|mediana]] es el dato del medio (el ${(n + 1) / 2}.º): $${nf(ans)}$.` : `Con $n = ${n}$ par, la [[pe-centralizacion|mediana]] es el promedio de los dos centrales: $\\frac{${b[n / 2 - 1]} + ${b[n / 2]}}{2} = ${nf(ans)}$.`]
          : [`La [[pe-centralizacion|moda]] es el valor más frecuente: $${ans}$ aparece ${top} veces.`];
      return {
        prompt: `Para los datos $${S.list(a)}$, calculá la ${ask}.`,
        answer: ans, solution: sol,
        verify: ask === "media" ? { kind: "value", tol: 1e-6, fn: () => S.golden(m => a.reduce((s, x) => s + (x - m) ** 2, 0), 0, 40) }   // minimiza Σ(x − m)²
          : ask === "mediana" ? { kind: "truth", target: true, fn: () => S.isMedian(a, ans) && (n % 2 === 0 || a.includes(ans)) }
            : { kind: "truth", target: true, fn: () => a.filter(x => x === ans).length > Math.max(...a.filter(x => x !== ans).map(y => a.filter(z => z === y).length)) }
      };
    }
  };

  T["pe-dispersion-num"] = {
    type: "numeric", concepts: ["pe-dispersion"], difficulty: 2,
    generate(r) {
      const n = r.int(5, 9), a = dataset(r, n, 2, 25), ask = r.pick(["var", "sd", "cv", "rango"]), m = S.mean(a), v = S.var(a), sd = Math.sqrt(v);
      const ans = ask === "var" ? v : ask === "sd" ? sd : ask === "cv" ? 100 * sd / m : Math.max(...a) - Math.min(...a);
      const name = { var: "la varianza muestral $s^2$", sd: "el desvío estándar muestral $s$", cv: "el coeficiente de variación (en %)", rango: "el recorrido (máximo menos mínimo)" }[ask];
      const ssq = a.reduce((s, x) => s + (x - m) ** 2, 0);
      return {
        prompt: `Para los datos $${S.list(a)}$, calculá ${name}.`,
        answer: ans,
        solution: ask === "rango" ? [`Recorrido: $${Math.max(...a)} - ${Math.min(...a)} = ${ans}$.`] : [
          `Media: $\\bar x = ${nf(m)}$. Suma de los cuadrados de los desvíos: $\\sum (x_i - \\bar x)^2 \\approx ${nf(ssq)}$.`,
          `[[pe-dispersion|Varianza muestral]]: $s^2 = \\frac{${nf(ssq)}}{${n} - 1} \\approx ${nf(v)}$${ask === "var" ? "" : `, y $s = \\sqrt{s^2} \\approx ${nf(sd)}$`}.`,
          ...(ask === "cv" ? [`$CV = \\frac{s}{\\bar x}\\cdot 100 \\approx ${nf(ans, 2)}\\,\\%$.`] : [])],
        // otro camino: la varianza como promedio de las diferencias al cuadrado entre todos los pares
        verify: { kind: "value", tol: 1e-9, fn: () => {
          let pp = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pp += (a[i] - a[j]) ** 2;
          const vv = pp / (n * (n - 1));
          return ask === "var" ? vv : ask === "sd" ? Math.sqrt(vv) : ask === "cv" ? 100 * Math.sqrt(vv) / (a.reduce((s, x) => s + x, 0) / n) : S.sorted(a)[n - 1] - S.sorted(a)[0];
        } }
      };
    }
  };

  T["pe-cuartiles-num"] = {
    type: "numeric", concepts: ["pe-posicion-forma"], difficulty: 2,
    generate(r) {
      const n = r.int(8, 13), a = dataset(r, n, 1, 40), b = S.sorted(a), h = Math.floor(n / 2);
      const lo = b.slice(0, h), hi = b.slice(n - h), q1 = S.median(lo), q3 = S.median(hi), iqr = q3 - q1;
      const ask = r.pick(["q1", "q3", "iqr", "bigote"]), ans = { q1, q3, iqr, bigote: q3 + 1.5 * iqr }[ask];
      const name = { q1: "el primer cuartil $Q_1$", q3: "el tercer cuartil $Q_3$", iqr: "el rango intercuartílico", bigote: "el límite $Q_3 + 1{,}5\\,RIC$ a partir del cual un dato es atípico" }[ask];
      return {
        prompt: `Para los datos $${S.list(a)}$, calculá ${name}. (Usá $Q_1$ = mediana de la mitad inferior y $Q_3$ = mediana de la mitad superior, sin incluir la mediana cuando $n$ es impar.)`,
        answer: ans,
        solution: [`Ordenados: $${S.list(b)}$ ($n = ${n}$).`,
          `Mitad inferior: $${S.list(lo)}$, con mediana $Q_1 = ${nf(q1)}$. Mitad superior: $${S.list(hi)}$, con mediana $Q_3 = ${nf(q3)}$.`,
          `[[pe-posicion-forma|Rango intercuartílico]]: $RIC = Q_3 - Q_1 = ${nf(iqr)}$${ask === "bigote" ? `, y el límite es $${nf(q3)} + 1{,}5\\cdot${nf(iqr)} = ${nf(ans)}$` : ""}.`],
        // otro camino: cada cuartil cumple la condición de mediana sobre su mitad (cuenta de datos a cada lado)
        verify: { kind: "truth", target: true, fn: () => {
          const srt = S.sorted(a), low = srt.filter((_, i) => i < h), up = srt.filter((_, i) => i >= n - h);
          return S.isMedian(low, q1) && S.isMedian(up, q3) && Math.abs(ans - { q1, q3, iqr: q3 - q1, bigote: q3 + 1.5 * (q3 - q1) }[ask]) < 1e-12;
        } }
      };
    }
  };

  T["pe-tabla-num"] = {
    type: "numeric", concepts: ["pe-tablas-frecuencia"], difficulty: 2,
    generate(r) {
      const k = r.int(4, 5), a0 = r.pick([0, 10, 20, 100]), w = r.pick([5, 10, 20]), f = Array.from({ length: k }, () => r.int(2, 15));
      const marks = f.map((_, i) => a0 + w * i + w / 2), N = f.reduce((s, x) => s + x, 0), ask = r.pick(["media", "acum"]), j = r.int(1, k - 2);
      const mean = marks.reduce((s, x, i) => s + x * f[i], 0) / N, acum = 100 * f.slice(0, j + 1).reduce((s, x) => s + x, 0) / N;
      const rows = f.map((x, i) => `[${a0 + w * i}, ${a0 + w * (i + 1)})\\colon ${x}`).join(R`;\ \ `);
      return {
        prompt: `Una variable se agrupó en intervalos de clase con estas frecuencias: $${rows}$. ${ask === "media" ? "Estimá la media usando las marcas de clase." : `¿Qué porcentaje de los datos es menor que $${a0 + w * (j + 1)}$ (frecuencia relativa acumulada)?`}`,
        answer: ask === "media" ? mean : acum,
        solution: ask === "media" ? [`Marcas de clase (puntos medios): $${marks.map(x => nf(x)).join(";\\ ")}$; total $N = ${N}$.`, `[[pe-tablas-frecuencia|Media de datos agrupados]]: $\\bar x \\approx \\frac{\\sum m_i f_i}{N} = \\frac{${nf(marks.reduce((s, x, i) => s + x * f[i], 0))}}{${N}} \\approx ${nf(mean)}$.`]
          : [`Datos por debajo de $${a0 + w * (j + 1)}$: los de las primeras ${j + 1} clases, $${f.slice(0, j + 1).join(" + ")} = ${f.slice(0, j + 1).reduce((s, x) => s + x, 0)}$ de $${N}$.`, `[[pe-tablas-frecuencia|Frecuencia relativa acumulada]]: $\\frac{${f.slice(0, j + 1).reduce((s, x) => s + x, 0)}}{${N}}\\cdot 100 \\approx ${nf(acum, 2)}\\,\\%$.`],
        // otro camino: se reconstruye la lista de datos (cada marca repetida f veces) y se calcula directo
        verify: { kind: "value", tol: 1e-9, fn: () => {
          const list = marks.flatMap((m, i) => Array(f[i]).fill(m));
          return ask === "media" ? S.mean(list) : 100 * list.filter(x => x < a0 + w * (j + 1)).length / list.length;
        } }
      };
    }
  };

  T["pe-transf-tf"] = {
    type: "tf", concepts: ["pe-dispersion"], difficulty: 2,
    generate(r) {
      const m = r.int(10, 60), s = r.int(2, 9), a = r.pick([2, 3, -2, 0.5, 10]), b = r.int(-20, 20), what = r.pick(["media", "desvío", "varianza"]), truth = r.bool();
      const real = { media: a * m + b, "desvío": Math.abs(a) * s, varianza: a * a * s * s }[what];
      const wrong = { media: a * m, "desvío": Math.abs(a) * s + b, varianza: a * s * s }[what];
      if (Math.abs(wrong - real) < 1e-9) return null;
      const claim = truth ? real : wrong, sym = { media: R`\bar y`, "desvío": "s_y", varianza: "s_y^2" }[what];
      return {
        prompt: `<b>Verdadero o falso:</b> si un conjunto de datos tiene media $${m}$ y desvío estándar $${s}$, y se transforma con $y = ${nf(a)}x${H.sg(b)}$, entonces $${sym} = ${nf(claim)}$.`,
        answer: truth,
        explanation: `Con una transformación lineal $y = ax + b$: $\\bar y = a\\bar x + b$, $s_y = |a|\\,s_x$ y $s_y^2 = a^2 s_x^2$ (sumar $b$ corre todos los datos y no cambia la dispersión). Acá $${sym} = ${nf(real)}$, así que es ${truth ? "verdadero" : "falso"}.`,
        solution: [R`Ver [[pe-dispersion|medidas de dispersión]]: la media se transforma igual que los datos; el desvío solo se multiplica por $|a|$.`],
        // otro camino: datos concretos con esa media y ese desvío, transformados uno por uno
        verify: { kind: "truth", fn: () => {
          const base = [-1.2, 0.3, 0.9, -0.4, 1.7, -1.3], mb = S.mean(base), sb = Math.sqrt(S.var(base)), xs = base.map(x => m + s * (x - mb) / sb), ys = xs.map(x => a * x + b);
          const got = { media: S.mean(ys), "desvío": Math.sqrt(S.var(ys)), varianza: S.var(ys) }[what];
          return Math.abs(got - claim) < 1e-9;
        } }
      };
    }
  };

  T["pe-forma-mc"] = {
    type: "mc", concepts: ["pe-posicion-forma"], difficulty: 2,
    generate(r) {
      const shape = r.pick(["der", "izq", "sim"]), c = r.int(20, 40), base = [0, -1, 1, -2, 2, -3, 3];
      let a = base.map(d => c + d);
      if (shape === "der") a = a.concat([c + r.int(8, 14), c + r.int(15, 25)]);
      else if (shape === "izq") a = a.concat([c - r.int(8, 14), c - r.int(15, 25)]);
      else { const d = r.int(5, 12); a = a.concat([c - d, c + d]); }
      a = r.shuffle(a);
      const opts = { der: "asimétrica a la derecha (asimetría positiva)", izq: "asimétrica a la izquierda (asimetría negativa)", sim: "simétrica (asimetría nula)" };
      const { options, correct } = H.mc(r, opts[shape], [...Object.values(opts).filter(o => o !== opts[shape]), "no se puede saber sin conocer la población"], { text: true });
      const m = S.mean(a), md = S.median(a);
      return {
        prompt: `¿Cómo es la forma de la distribución de los datos $${S.list(S.sorted(a))}$?`,
        options, correct,
        solution: [`Media $\\approx ${nf(m, 2)}$ y mediana $= ${nf(md, 2)}$. ${shape === "sim" ? "Los datos son simétricos respecto del centro: media y mediana coinciden." : shape === "der" ? "Hay valores alejados hacia arriba que tiran de la media: la cola larga está a la derecha." : "Hay valores alejados hacia abajo que tiran de la media: la cola larga está a la izquierda."}`,
          R`El signo del [[pe-posicion-forma|coeficiente de asimetría]] $g_1 = \frac{\frac1n\sum(x_i - \bar x)^3}{s^3}$ lo confirma.`],
        // otro camino: el tercer momento central con los momentos crudos, E[x³] − 3μE[x²] + 2μ³
        verify: { kind: "truth", target: true, fn: () => {
          const mu = S.mean(a), e2 = S.mean(a.map(x => x * x)), e3 = S.mean(a.map(x => x ** 3)), m3 = e3 - 3 * mu * e2 + 2 * mu ** 3;
          return shape === "sim" ? Math.abs(m3) < 1e-6 : shape === "der" ? m3 > 1 : m3 < -1;
        } }
      };
    }
  };

  T["pe-muestreo-num"] = {
    type: "numeric", concepts: ["pe-muestreo"], difficulty: 1,
    generate(r) {
      if (r.bool()) {
        // estratos de tamaño múltiplo de k = N/n: la asignación proporcional da enteros
        const kS = r.int(3, 4), k = r.pick([5, 8, 10, 20, 25]), c = Array.from({ length: kS }, () => r.int(2, 12)), Nh = c.map(x => x * k), N = Nh.reduce((s, x) => s + x, 0), n = N / k, h = r.int(0, kS - 1), Z = "ABCD";
        return {
          prompt: `Una finca de ${N} plantas está dividida en ${kS} zonas: ${Nh.map((x, i) => `${Z[i]} con ${x}`).join(", ")}. Se toma una muestra estratificada de ${n} plantas con asignación proporcional. ¿Cuántas plantas se eligen de la zona ${Z[h]}?`,
          answer: c[h],
          solution: [`En la [[pe-muestreo|asignación proporcional]] cada estrato aporta la misma fracción que tiene en la población: $n_h = n\\frac{N_h}{N}$.`,
            `Zona ${Z[h]}: $n_h = ${n}\\cdot\\frac{${Nh[h]}}{${N}} = ${c[h]}$ plantas (la fracción de muestreo es $\\frac{${n}}{${N}} = \\frac{1}{${k}}$ en todas las zonas).`],
          // otro camino: un sistemático de paso N/n sobre la lista ordenada por zona elige N_h/k de cada una
          verify: { kind: "value", tol: 0, fn: () => {
            const lo = Nh.slice(0, h).reduce((s, x) => s + x, 0), s0 = k - 1;
            let cnt = 0; for (let i = 0; i < N; i++) if ((i - s0) % k === 0 && i >= s0 && i >= lo && i < lo + Nh[h]) cnt++;
            return cnt;
          } }
        };
      }
      const n = r.int(8, 40), k = r.int(4, 15), N = n * k, s = r.int(1, k), j = r.int(2, n), ask = r.pick(["pos", "pos", "paso"]);
      const ans = ask === "paso" ? k : s + (j - 1) * k;
      return {
        prompt: ask === "paso" ? `Se numeran de 1 a ${N} las fichas de una lista y se quiere una muestra sistemática de ${n}. ¿Cada cuántas fichas se elige una?`
          : `Se numeran de 1 a ${N} las fichas de una lista y se toma una muestra sistemática de ${n}, con el arranque sorteado en la ficha ${s}. ¿Qué número tiene la ${j}.ª ficha elegida?`,
        answer: ans,
        solution: [`En el [[pe-muestreo|muestreo sistemático]] el paso es $k = \\frac{N}{n} = \\frac{${N}}{${n}} = ${k}$.`,
          ...(ask === "paso" ? [`Se elige una ficha cada ${k}, empezando en una sorteada entre la 1 y la ${k}.`] : [`Las elegidas son $${s},\\ ${s + k},\\ ${s + 2 * k},\\ \\dots$: la $j$-ésima es $${s} + (j - 1)\\cdot ${k}$, y con $j = ${j}$ da $${ans}$.`])],
        // otro camino: se recorre la lista contando las fichas elegidas
        verify: { kind: "value", tol: 0, fn: () => {
          // el paso más chico con el que, arrancando en la 1, se eligen a lo sumo n fichas
          if (ask === "paso") { for (let t = 1; t <= N; t++) { let cnt = 0; for (let i = 1; i <= N; i += t) cnt++; if (cnt <= n) return t; } return NaN; }
          let cnt = 0; for (let i = 1; i <= N; i++) if (i >= s && (i - s) % k === 0 && ++cnt === j) return i;
          return NaN;
        } }
      };
    }
  };

  T["pe-sturges-num"] = {
    type: "numeric", concepts: ["pe-tablas-frecuencia"], difficulty: 1,
    generate(r) {
      const n = r.int(20, 600), kf = 1 + 3.322 * Math.log10(n);
      if (Math.abs(kf - Math.floor(kf) - 0.5) < 0.03) return null;
      const k = Math.round(kf), lo = r.int(0, 50) * r.pick([1, 10]), rg = r.int(10, 90) * r.pick([1, 2, 5]) / 2, ask = r.pick(["k", "w"]), w = rg / k;
      return {
        prompt: ask === "k" ? `Se van a agrupar ${n} datos en un histograma. ¿Cuántas clases recomienda la regla de Sturges?`
          : `Se van a agrupar ${n} datos, que van de $${nf(lo)}$ a $${nf(lo + rg)}$, en clases del mismo ancho. Con la cantidad de clases de la regla de Sturges, ¿qué ancho tiene cada clase?`,
        answer: ask === "k" ? k : w,
        solution: [`[[pe-tablas-frecuencia|Regla de Sturges]]: $k = 1 + \\log_2 n = 1 + 3{,}322\\log_{10} n = 1 + 3{,}322\\log_{10} ${n} \\approx ${nf(kf, 2)}$, que se redondea a $${k}$ clases.`,
          ...(ask === "w" ? [`Recorrido: $${nf(lo + rg)} - ${nf(lo)} = ${nf(rg)}$; ancho $\\frac{${nf(rg)}}{${k}} \\approx ${nf(w)}$ (en la práctica se redondea hacia arriba para que entren todos los datos).`] : [])],
        // otro camino: k es el entero con 2^(k − 1,5) ≤ n < 2^(k − 0,5), o sea, el más cercano a 1 + log₂ n
        verify: { kind: "value", tol: 1e-9, fn: () => { let kk = 1; while (!(2 ** (kk - 1.5) <= n && n < 2 ** (kk - 0.5))) kk++; return ask === "k" ? kk : rg / kk; } }
      };
    }
  };

  T["pe-asimetria-num"] = {
    type: "numeric", concepts: ["pe-posicion-forma"], difficulty: 3,
    generate(r) {
      const n = r.int(5, 7), a = Array.from({ length: n }, () => r.int(0, 15)), ask = r.pick(["g1", "g2"]);
      const m = S.mean(a), s = Math.sqrt(S.var(a));
      if (s === 0) return null;
      const d = a.map(x => x - m), m3 = S.mean(d.map(x => x ** 3)), m4 = S.mean(d.map(x => x ** 4)), g1 = m3 / s ** 3, g2 = m4 / s ** 4 - 3, ans = ask === "g1" ? g1 : g2;
      if (ask === "g1" && Math.abs(g1) < 0.05) return null;
      return {
        prompt: `Para los datos $${S.list(a)}$, calculá ${ask === "g1" ? "el coeficiente de asimetría $g_1 = \\frac{\\frac1n\\sum(x_i - \\bar x)^3}{s^3}$" : "la curtosis $g_2 = \\frac{\\frac1n\\sum(x_i - \\bar x)^4}{s^4} - 3$"}, con $s$ el desvío estándar muestral.`,
        answer: ans,
        solution: [`$\\bar x = ${nf(m)}$ y $s = \\sqrt{\\frac{\\sum(x_i - \\bar x)^2}{n - 1}} \\approx ${nf(s)}$.`,
          ask === "g1" ? `Tercer momento central: $\\frac1n\\sum(x_i - \\bar x)^3 \\approx ${nf(m3)}$. [[pe-posicion-forma|Asimetría]]: $g_1 \\approx \\frac{${nf(m3)}}{${nf(s ** 3)}} \\approx ${nf(g1)}$, ${g1 > 0 ? "positiva: la cola larga está a la derecha" : "negativa: la cola larga está a la izquierda"}.`
            : `Cuarto momento central: $\\frac1n\\sum(x_i - \\bar x)^4 \\approx ${nf(m4)}$. [[pe-posicion-forma|Curtosis]]: $g_2 \\approx \\frac{${nf(m4)}}{${nf(s ** 4)}} - 3 \\approx ${nf(g2)}$, ${g2 > 0 ? "positiva: colas más pesadas que las de la normal" : "negativa: colas más livianas que las de la normal"}.`],
        // otro camino: los momentos centrales a partir de los crudos y la varianza con la fórmula de pares
        verify: { kind: "value", tol: 1e-8, fn: () => {
          let pp = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pp += (a[i] - a[j]) ** 2;
          const sd = Math.sqrt(pp / (n * (n - 1))), e = p => S.mean(a.map(x => x ** p)), mu = e(1);
          return ask === "g1" ? (e(3) - 3 * mu * e(2) + 2 * mu ** 3) / sd ** 3 : (e(4) - 4 * mu * e(3) + 6 * mu * mu * e(2) - 3 * mu ** 4) / sd ** 4 - 3;
        } }
      };
    }
  };

  const cards = {
    "pe-muestreo": {
      title: "Población, muestra y muestreo", aliases: ["población estadística", "muestra aleatoria", "muestreo aleatorio simple", "muestreo estratificado", "muestreo sistemático", "asignación proporcional", "variable cuantitativa", "variable cualitativa"], concepts: ["pe-muestreo"],
      summary: "La población es el conjunto completo que interesa; la muestra, la parte que se observa. Una muestra aleatoria simple da a cada subconjunto del mismo tamaño la misma probabilidad de salir. Estratificado proporcional: nₕ = n·Nₕ/N; sistemático: uno cada k = N/n.",
      def: [R`**Población:** el conjunto de todos los individuos (o mediciones) que interesan. **Muestra:** el subconjunto que efectivamente se observa. Un **parámetro** describe a la población (por ejemplo $\mu$); un **estadístico** se calcula con la muestra (por ejemplo $\bar x$).`,
        R`**Variables:** cualitativas (categorías, como el color) o cuantitativas, que pueden ser discretas (se cuentan) o continuas (se miden).`,
        R`**Muestreo aleatorio simple:** todos los subconjuntos de tamaño $n$ tienen la misma probabilidad de ser la muestra. **Estratificado:** la población se divide en grupos homogéneos (estratos, como los meses del año) y se toma una muestra aleatoria de cada uno. **Sistemático:** se elige un individuo cada $k$ de una lista, empezando al azar.`,
        R`**Asignación proporcional:** si el estrato $h$ tiene $N_h$ individuos de un total de $N$, se toman $n_h = n\frac{N_h}{N}$ de él (redondeando de modo que sumen $n$). **Paso del sistemático:** $k = \frac{N}{n}$; con el arranque $s$ sorteado entre $1$ y $k$, se eligen los individuos $s,\ s + k,\ s + 2k,\ \dots$`],
      idea: [R`Se mira una muestra porque casi nunca se puede mirar a toda la población. El azar en la elección es lo que permite, después, medir cuánto nos podemos equivocar al pasar de la muestra a la población ([[pe-ic-media|intervalos de confianza]]).`,
        R`El estratificado conviene cuando los estratos son distintos entre sí: asegura que todos estén representados (por ejemplo, días de todos los meses en datos meteorológicos).`],
      demo: [R`**Paso 1 (lo que se busca).** La asignación proporcional se elige para que la muestra estratificada no favorezca a nadie: cada individuo de la población tiene que tener la misma probabilidad de quedar en la muestra.`,
        R`**Paso 2.** Dentro del estrato $h$ se sortean $n_h$ de sus $N_h$ individuos al azar, así que cada uno de ellos queda elegido con probabilidad $\frac{n_h}{N_h}$ (hay $\binom{N_h - 1}{n_h - 1}$ muestras que lo contienen, de $\binom{N_h}{n_h}$ posibles).`,
        R`**Paso 3.** Con $n_h = n\frac{N_h}{N}$, esa probabilidad es $\frac{nN_h/N}{N_h} = \frac nN$, la misma en todos los estratos: la muestra es una «foto a escala» de la población.`,
        R`**Paso 4 (sistemático).** Con paso $k = \frac Nn$ y el arranque sorteado entre $1$ y $k$, cada individuo de la lista queda elegido para exactamente uno de los $k$ arranques posibles, así que también tiene probabilidad $\frac1k = \frac nN$. $\blacksquare$`],
      examples: [{ q: R`Se quiere estudiar la temperatura diaria de un año con 120 días. ¿Cómo se arma una muestra estratificada por mes?`, steps: [R`Cada mes es un estrato. De cada uno se sortean 10 días al azar (sin reposición): $12\cdot 10 = 120$ días.`] },
        { q: R`Tres zonas con 200, 300 y 500 plantas; muestra de 50 con asignación proporcional.`, steps: [R`$n_h = 50\cdot\frac{N_h}{1000}$: 10, 15 y 25 plantas.`, R`Dentro de la zona de 500, un sistemático toma una cada $\frac{500}{25} = 20$ plantas.`] }],
      tips: [R`Una muestra grande pero sesgada (por ejemplo, solo voluntarios) no se arregla agrandándola: el problema es cómo se eligió.`, R`En el sistemático, cuidado si la lista tiene un ciclo que coincide con el paso (por ejemplo, un dato por día y $k = 7$: saldrían siempre los mismos días de la semana).`],
      see: ["pe-centralizacion", "pe-ic-media"]
    },
    "pe-centralizacion": {
      title: "Medidas de tendencia central", aliases: ["media aritmética", "media muestral", "mediana", "moda", "medidas de tendencia central"], concepts: ["pe-centralizacion"],
      summary: "Media: suma sobre n; mediana: el dato del medio de los datos ordenados; moda: el valor más frecuente. La media minimiza la suma de los cuadrados de los desvíos y la mediana, la suma de los valores absolutos.",
      def: [R`**Media:** $\bar x = \frac1n\sum_{i=1}^n x_i$. Es el [[f1-estadistica|promedio]] de siempre.`,
        R`**Mediana:** con los datos ordenados, el del medio si $n$ es impar, o el promedio de los dos centrales si $n$ es par. Deja la mitad de los datos de cada lado.`,
        R`**Moda:** el valor que más se repite (puede haber más de una, o ninguna).`],
      idea: [R`La media es el «centro de masa» de los datos: si cada dato fuera una pesa sobre una regla, la regla se equilibra en $\bar x$. Por eso un solo dato muy grande la mueve mucho.`,
        R`La mediana solo mira el orden, así que es **robusta**: si el dato más grande se multiplica por mil, la mediana no se entera. Con distribuciones asimétricas (sueldos, por ejemplo) describe mejor el «valor típico».`],
      demo: [R`**Paso 1 (los desvíos suman cero).** $\sum (x_i - \bar x) = \sum x_i - n\bar x = n\bar x - n\bar x = 0$, por la definición de $\bar x$.`,
        R`**Paso 2 (la media minimiza los cuadrados).** Sea $g(m) = \sum (x_i - m)^2$. Es una parábola en $m$ que abre hacia arriba; su derivada es $g'(m) = -2\sum (x_i - m)$, que se anula cuando $\sum x_i = nm$, o sea en $m = \bar x$. Ahí está el mínimo.`,
        R`**Paso 3 (la mediana minimiza los absolutos).** Sea $h(m) = \sum |x_i - m|$. Si corremos $m$ un poquito hacia la derecha, cada dato que está a la izquierda de $m$ suma ese poquito y cada dato a la derecha lo resta. Mientras haya más datos a la derecha que a la izquierda, $h$ baja; cuando hay más a la izquierda, sube.`,
        R`**Paso 4.** Entonces $h$ es mínima justo donde quedan tantos datos a la izquierda como a la derecha: en la mediana (si $n$ es par, en cualquier punto entre los dos centrales). $\blacksquare$`],
      examples: [{ q: R`Datos: $3;\ 5;\ 5;\ 8;\ 29$.`, steps: [R`Media: $\frac{50}{5} = 10$. Mediana: $5$ (el tercero). Moda: $5$.`, R`La media queda por encima de casi todos los datos por el $29$: la mediana describe mejor el valor típico.`] }],
      tips: [R`Para la mediana, primero hay que **ordenar** los datos.`, R`Con datos agrupados en clases, la media se aproxima con las marcas de clase ([[pe-tablas-frecuencia]]).`],
      see: ["pe-dispersion", "pe-posicion-forma", "pe-tablas-frecuencia"]
    },
    "pe-dispersion": {
      title: "Medidas de dispersión", aliases: ["varianza muestral", "desvío estándar", "desvío estándar muestral", "coeficiente de variación", "medidas de dispersión", "recorrido"], concepts: ["pe-dispersion"],
      summary: "s² = Σ(xᵢ − x̄)²/(n − 1), s = √s², CV = s/x̄. Con y = ax + b: ȳ = ax̄ + b y s_y = |a|s_x.",
      def: [R`**Varianza muestral:** $s^2 = \frac{1}{n - 1}\sum_{i=1}^n (x_i - \bar x)^2$. **Desvío estándar:** $s = \sqrt{s^2}$, en las mismas unidades que los datos.`,
        R`**Recorrido:** máximo menos mínimo. **Coeficiente de variación:** $CV = \frac{s}{\bar x}$ (sin unidades; sirve para comparar dispersiones de variables distintas).`,
        R`**Fórmula de cálculo:** $\sum (x_i - \bar x)^2 = \sum x_i^2 - n\bar x^2$.`],
      idea: [R`La varianza es «el cuadrado típico de lo que se aleja cada dato de la media». Se elevan al cuadrado porque los desvíos con signo siempre suman cero.`,
        R`Se divide por $n - 1$ y no por $n$ porque los desvíos se miden respecto de $\bar x$, que está calculada con los mismos datos y queda «demasiado cerca» de ellos: con $n - 1$ el estimador es insesgado ([[pe-estimadores]]).`],
      demo: [R`**Paso 1 (fórmula de cálculo).** Desarrollando el cuadrado, $\sum (x_i - \bar x)^2 = \sum x_i^2 - 2\bar x\sum x_i + n\bar x^2$.`,
        R`**Paso 2.** Como $\sum x_i = n\bar x$, el término del medio es $-2n\bar x^2$, y queda $\sum x_i^2 - n\bar x^2$.`,
        R`**Paso 3 (transformación lineal).** Si $y_i = ax_i + b$, la media es $\bar y = \frac1n\sum (ax_i + b) = a\bar x + b$, por la linealidad de la suma.`,
        R`**Paso 4.** Entonces $y_i - \bar y = a(x_i - \bar x)$: la $b$ se cancela. Elevando al cuadrado y sumando, $s_y^2 = a^2s_x^2$, y sacando la raíz, $s_y = |a|\,s_x$. $\blacksquare$`],
      examples: [{ q: R`Datos: $2;\ 4;\ 6$.`, steps: [R`$\bar x = 4$; desvíos $-2, 0, 2$; suma de cuadrados $8$.`, R`$s^2 = \frac{8}{2} = 4$ y $s = 2$.`] }],
      tips: [R`Cambiar de unidades (por ejemplo, de °C a °F) multiplica el desvío por el factor de escala, pero sumar una constante no lo cambia.`],
      see: ["pe-centralizacion", "pe-posicion-forma", "pe-estimadores"]
    },
    "pe-posicion-forma": {
      title: "Cuartiles, diagrama de caja y forma", aliases: ["cuartiles", "primer cuartil", "tercer cuartil", "rango intercuartílico", "diagrama de caja", "boxplot", "valor atípico", "valores atípicos", "coeficiente de asimetría", "curtosis"], concepts: ["pe-posicion-forma"],
      summary: "Q₁ y Q₃ dejan un cuarto de los datos por debajo y por encima. RIC = Q₃ − Q₁; un dato es atípico si está a más de 1,5·RIC de la caja. La asimetría mira hacia qué lado está la cola larga.",
      def: [R`**Cuartiles:** $Q_1$, $Q_2$ (la mediana) y $Q_3$ dividen los datos ordenados en cuatro partes con la misma cantidad. Una convención simple: $Q_1$ es la mediana de la mitad inferior y $Q_3$, la de la superior.`,
        R`**Rango intercuartílico:** $RIC = Q_3 - Q_1$, el ancho de la mitad central. **Atípicos:** los datos por debajo de $Q_1 - 1{,}5\,RIC$ o por encima de $Q_3 + 1{,}5\,RIC$.`,
        R`**Diagrama de caja:** una caja de $Q_1$ a $Q_3$ con una línea en la mediana, y «bigotes» hasta el dato más extremo que no es atípico; los atípicos se marcan aparte.`,
        R`**Coeficiente de asimetría:** $g_1 = \frac{\frac1n\sum(x_i - \bar x)^3}{s^3}$: positivo si la cola larga está a la derecha, negativo si está a la izquierda. **Curtosis:** $g_2 = \frac{\frac1n\sum(x_i - \bar x)^4}{s^4} - 3$, que compara qué tan pesadas son las colas con las de la [[pe-normal|distribución normal]].`],
      idea: [R`El diagrama de caja resume cinco números (mínimo, $Q_1$, mediana, $Q_3$, máximo) y deja ver de un vistazo el centro, la dispersión, la asimetría y los atípicos.`,
        R`Con asimetría positiva la media queda a la derecha de la mediana, porque los valores grandes de la cola la arrastran; con asimetría negativa, a la izquierda.`],
      examples: [{ q: R`Datos ordenados: $1;\ 3;\ 4;\ 6;\ 7;\ 9;\ 30$.`, steps: [R`Mediana $6$; mitad inferior $1;\ 3;\ 4$ y superior $7;\ 9;\ 30$: $Q_1 = 3$, $Q_3 = 9$, $RIC = 6$.`, R`$Q_3 + 1{,}5\cdot 6 = 18$: el $30$ es atípico.`] }],
      tips: [R`Hay varias convenciones para los cuartiles (los programas de computadora interpolan); con pocos datos pueden dar valores un poco distintos. Lo importante es aclarar cuál se usa.`],
      see: ["pe-centralizacion", "pe-dispersion"]
    },
    "pe-tablas-frecuencia": {
      title: "Tablas de frecuencias y datos agrupados", aliases: ["tabla de frecuencias", "frecuencia absoluta", "frecuencia relativa", "frecuencia acumulada", "marca de clase", "datos agrupados", "intervalo de clase", "regla de Sturges"], concepts: ["pe-tablas-frecuencia"],
      summary: "Cada clase tiene frecuencia absoluta f, relativa f/N y acumulada. Con datos agrupados, la media se aproxima con las marcas de clase: x̄ ≈ Σ mᵢfᵢ / N. Regla de Sturges: k = 1 + log₂ n ≈ 1 + 3,322 log₁₀ n clases.",
      def: [R`**Frecuencia absoluta** $f_i$: cuántos datos caen en la clase $i$. **Relativa:** $\frac{f_i}{N}$. **Acumulada:** la suma de las frecuencias hasta esa clase inclusive.`,
        R`**Marca de clase:** el punto medio del intervalo, $m_i$. **Media de datos agrupados:** $\bar x \approx \frac{1}{N}\sum m_if_i$. El histograma dibuja un rectángulo por clase con área proporcional a $f_i$.`,
        R`**Regla de Sturges:** para $n$ datos se usan $k = 1 + \log_2 n = 1 + 3{,}322\log_{10} n$ clases, redondeando al entero más cercano. El ancho de cada clase es el recorrido dividido por $k$, redondeado hacia arriba.`],
      idea: [R`Agrupar pierde información: ya no se sabe dónde está cada dato dentro de su intervalo. La marca de clase es la mejor apuesta si los datos se reparten parejo dentro de cada clase.`],
      demo: [R`**Paso 1.** Los datos de la clase $i$ están entre $a_i$ y $a_i + w$. Si se reparten parejo, su promedio es el punto medio $m_i$, así que su suma es aproximadamente $f_im_i$.`,
        R`**Paso 2.** La suma de todos los datos es la suma de las sumas de cada clase, $\approx \sum f_im_i$; dividiendo por $N$ queda la fórmula. El error de cada clase está acotado por $\frac w2$ por dato, así que la media agrupada difiere de la real en menos de $\frac w2$. $\blacksquare$`,
        R`**Paso 3 (de dónde sale Sturges).** Sturges pensó en datos con forma de campana ideal: con $k$ clases, las frecuencias proporcionales a los números combinatorios $\binom{k - 1}{0}, \binom{k - 1}{1}, \dots, \binom{k - 1}{k - 1}$ (la [[pe-binomial|binomial]] con $p = \frac12$, que se parece a la normal).`,
        R`**Paso 4.** Esos números suman $2^{k - 1}$, por el binomio de Newton con $(1 + 1)^{k - 1}$. Si esa es la cantidad de datos, $n = 2^{k - 1}$, y despejando, $k = 1 + \log_2 n$. Como $\log_2 n = \frac{\log_{10} n}{\log_{10} 2}$ y $\frac1{\log_{10} 2} \approx 3{,}322$, queda la otra forma. $\blacksquare$`],
      examples: [{ q: R`Clases $[0, 10)$: 3 datos, $[10, 20)$: 5 datos, $[20, 30)$: 2 datos.`, steps: [R`Marcas: $5$, $15$ y $25$; $\bar x \approx \frac{5\cdot3 + 15\cdot5 + 25\cdot2}{10} = 14$.`, R`Frecuencia relativa acumulada hasta $[10, 20)$: $\frac{8}{10} = 80\,\%$.`] }],
      tips: [R`Los intervalos se escriben cerrados a la izquierda y abiertos a la derecha, $[a, b)$, para que cada dato caiga en una sola clase.`, R`Sturges es una guía, no una ley: con muchos datos o distribuciones muy asimétricas da pocas clases.`],
      see: ["pe-centralizacion", "pe-muestreo"]
    }
  };

  E.extendCourse("m105", {
    concepts: { "pe-muestreo": { name: "Muestreo" }, "pe-centralizacion": { name: "Tendencia central" }, "pe-dispersion": { name: "Dispersión" }, "pe-posicion-forma": { name: "Cuartiles y forma" }, "pe-tablas-frecuencia": { name: "Tablas de frecuencias" } },
    templates: T,
    units: [{
      id: "pe-descriptiva-u", order: 1, program: "Unidad 1", title: "Estadística descriptiva", icon: "chart-column",
      diagnostic: ["pe-centro-num", "pe-dispersion-num", "pe-cuartiles-num"],
      lessons: [
        { id: "pe-desc-l1", title: "Muestras y tendencia central", templates: ["pe-centro-num", "pe-tabla-num", "pe-muestreo-num", "pe-sturges-num"], theory: ["pe-muestreo", "pe-centralizacion", "pe-tablas-frecuencia"],
          intro: R`Cómo se elige la muestra, cómo se agrupan los datos y tres maneras de decir «el valor típico».` },
        { id: "pe-desc-l2", title: "Dispersión", templates: ["pe-dispersion-num", "pe-transf-tf"], theory: ["pe-dispersion"],
          intro: R`$s^2 = \frac{1}{n - 1}\sum (x_i - \bar x)^2$: cuánto se alejan los datos de la media.` },
        { id: "pe-desc-l3", title: "Cuartiles y forma de la distribución", templates: ["pe-cuartiles-num", "pe-forma-mc", "pe-asimetria-num"], theory: ["pe-posicion-forma"],
          intro: R`La caja va de $Q_1$ a $Q_3$; la cola larga dice hacia dónde es asimétrica.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 2 · PROBABILIDAD
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, S = E.pye, nf = S.nf;
  const T = {};
  const fact = n => (n <= 1 ? 1 : n * fact(n - 1));
  // todas las tiradas de n dados (para recalcular por enumeración)
  const allRolls = n => { let out = [[]]; for (let i = 0; i < n; i++) out = out.flatMap(o => [1, 2, 3, 4, 5, 6].map(d => o.concat(d))); return out; };

  T["pe-comb-num"] = {
    type: "numeric", concepts: ["pe-combinatoria"], difficulty: 2,
    generate(r) {
      const kind = r.pick(["comite", "podio", "anagrama", "almenos"]);
      if (kind === "comite" || kind === "almenos") {
        const n = r.int(6, 11), k = r.int(2, 4), m = r.int(2, n - 2), h = n - m;
        if (kind === "almenos" && h < k) return null;
        const ans = kind === "comite" ? S.choose(n, k) : S.choose(n, k) - S.choose(h, k);
        return {
          prompt: kind === "comite" ? `¿De cuántas maneras se puede elegir una comisión de ${k} personas entre ${n}?` : `En un grupo hay ${m} mujeres y ${h} varones. ¿Cuántas comisiones de ${k} personas tienen al menos una mujer?`,
          answer: ans,
          solution: kind === "comite" ? [`El orden no importa y no se repite: son [[pe-combinatoria|combinaciones]], $\\binom{${n}}{${k}} = \\frac{${n}!}{${k}!\\,${n - k}!} = ${ans}$.`]
            : [`Conviene contar el complemento: todas las comisiones menos las que no tienen mujeres.`, `$\\binom{${n}}{${k}} - \\binom{${h}}{${k}} = ${S.choose(n, k)} - ${S.choose(h, k)} = ${ans}$.`],
          // otro camino: se recorren todos los subconjuntos (máscaras de bits) y se cuentan los que sirven
          verify: { kind: "value", fn: () => { let c = 0; for (let mask = 0; mask < 1 << n; mask++) { let bits = 0, wom = 0; for (let i = 0; i < n; i++) if (mask >> i & 1) { bits++; if (i < m) wom++; } if (bits === k && (kind === "comite" || wom > 0)) c++; } return c; } }
        };
      }
      if (kind === "podio") {
        const n = r.int(5, 10), k = r.int(2, 4), ans = fact(n) / fact(n - k);
        return {
          prompt: `En una carrera corren ${n} atletas. ¿De cuántas maneras pueden quedar ocupados los primeros ${k} puestos?`,
          answer: ans,
          solution: [`Importa el orden y no se repite: [[pe-combinatoria|variaciones]], $V_{${n},${k}} = \\frac{${n}!}{${n - k}!} = ${Array.from({ length: k }, (_, i) => n - i).join("\\cdot")} = ${ans}$.`],
          verify: { kind: "value", fn: () => { let c = 0; const rec = (used, d) => { if (d === k) { c++; return; } for (let i = 0; i < n; i++) if (!used.includes(i)) rec(used.concat(i), d + 1); }; rec([], 0); return c; } }
        };
      }
      const word = r.pick(["CASA", "ANANA", "PAPAS", "TETERA", "BANANA", "RADAR", "COCO", "MAMÁ", "ARROZ", "PERRO"]).replace("Á", "A");
      const cnt = {}; for (const ch of word) cnt[ch] = (cnt[ch] || 0) + 1;
      const ans = fact(word.length) / Object.values(cnt).reduce((p, x) => p * fact(x), 1);
      return {
        prompt: `¿Cuántas palabras distintas (con o sin sentido) se pueden formar reordenando todas las letras de ${word}?`,
        answer: ans,
        solution: [`Son [[pe-combinatoria|permutaciones con repetición]]: $\\frac{${word.length}!}{${Object.values(cnt).filter(x => x > 1).map(x => `${x}!`).join("\\,") || "1"}} = ${ans}$ (se divide por los reordenamientos de las letras repetidas, que dan la misma palabra).`],
        // otro camino: se generan todas las permutaciones y se cuentan las distintas
        verify: { kind: "value", fn: () => { const set = new Set(); const rec = (pre, rest) => { if (!rest.length) { set.add(pre); return; } rest.forEach((ch, i) => rec(pre + ch, rest.filter((_, j) => j !== i))); }; rec("", [...word]); return set.size; } }
      };
    }
  };

  T["pe-dados-num"] = {
    type: "numeric", concepts: ["pe-axiomas"], difficulty: 2,
    generate(r) {
      const kind = r.pick(["suma", "almenos", "max"]);
      if (kind === "suma") {
        const s = r.int(2, 12), ways = 6 - Math.abs(7 - s);
        return { prompt: `Se tiran dos dados equilibrados. ¿Cuál es la probabilidad de que la suma sea ${s}?`, answer: ways / 36,
          solution: [`Hay $36$ resultados igualmente probables (regla de Laplace). Los que suman ${s} son ${ways}.`, `$P = \\frac{${ways}}{36} = ${H.frac(ways, 36)} \\approx ${nf(ways / 36)}$.`],
          verify: { kind: "value", tol: 1e-12, fn: () => allRolls(2).filter(t => t[0] + t[1] === s).length / 36 } };
      }
      const n = r.int(2, 5);
      if (kind === "almenos") {
        const ans = 1 - (5 / 6) ** n;
        return { prompt: `Se tira un dado ${n} veces. ¿Cuál es la probabilidad de sacar al menos un 6?`, answer: ans,
          solution: [`Por el [[pe-axiomas|complemento]]: $P(\\text{al menos un 6}) = 1 - P(\\text{ningún 6})$.`, `Las tiradas son independientes: $P(\\text{ningún 6}) = \\left(\\frac56\\right)^{${n}}$, así que $P = 1 - \\left(\\frac56\\right)^{${n}} \\approx ${nf(ans)}$.`],
          verify: { kind: "value", tol: 1e-12, fn: () => allRolls(n).filter(t => t.includes(6)).length / 6 ** n } };
      }
      const m = r.int(2, 5), ans = (m / 6) ** n - ((m - 1) / 6) ** n;
      return { prompt: `Se tiran ${n} dados. ¿Cuál es la probabilidad de que el mayor valor obtenido sea exactamente ${m}?`, answer: ans,
        solution: [`«El máximo es a lo sumo $m$» quiere decir que todos los dados son $\\le m$: $P(\\max \\le ${m}) = \\left(\\frac{${m}}{6}\\right)^{${n}}$.`, `$P(\\max = ${m}) = P(\\max \\le ${m}) - P(\\max \\le ${m - 1}) = \\left(\\frac{${m}}{6}\\right)^{${n}} - \\left(\\frac{${m - 1}}{6}\\right)^{${n}} \\approx ${nf(ans)}$.`],
        verify: { kind: "value", tol: 1e-12, fn: () => allRolls(n).filter(t => Math.max(...t) === m).length / 6 ** n } };
    }
  };

  T["pe-condicional-num"] = {
    type: "numeric", concepts: ["pe-condicional"], difficulty: 2,
    generate(r) {
      // cada contexto: quiénes, y A y B en plural, en indicativo y en subjuntivo (más los complementos en plural)
      const C = r.pick([
        { who: "estudiantes de un curso", A: ["aprobaron", "aprobó", "haya aprobado"], nA: "no aprobaron", B: ["asistieron a las consultas", "asistió a las consultas", "haya asistido a las consultas"], nB: "no asistieron" },
        { who: "personas encuestadas", A: ["fuman", "fuma", "fume"], nA: "no fuman", B: ["hacen deporte", "hace deporte", "haga deporte"], nB: "no hacen deporte" },
        { who: "piezas revisadas", A: ["son defectuosas", "es defectuosa", "sea defectuosa"], nA: "no son defectuosas", B: ["salieron de la máquina 1", "salió de la máquina 1", "haya salido de la máquina 1"], nB: "salieron de la máquina 2" }]);
      const a = r.int(5, 40), b = r.int(5, 40), c = r.int(5, 40), d = r.int(5, 40), N = a + b + c + d;  // filas: B, no B; columnas: A, no A
      const ask = r.pick(["AdadoB", "BdadoA", "inter", "union"]);
      const ans = { AdadoB: a / (a + b), BdadoA: a / (a + c), inter: a / N, union: (a + b + c) / N }[ask];
      const q = { AdadoB: `la probabilidad de que ${C.A[2]}, sabiendo que ${C.B[1]}`, BdadoA: `la probabilidad de que ${C.B[2]}, sabiendo que ${C.A[1]}`, inter: `la probabilidad de que ${C.A[2]} y ${C.A[2].startsWith("haya ") ? C.B[2].replace(/^haya /, "") : C.B[2]}`, union: `la probabilidad de que ${C.A[2]} o ${C.B[2]}` }[ask];
      return {
        prompt: `De ${N} ${C.who}, ${a} ${C.A[0]} y ${C.B[0]}; ${b} ${C.nA} y ${C.B[0]}; ${c} ${C.A[0]} y ${C.nB}, y ${d} ${C.nA} y ${C.nB}. Se elige una al azar. Calculá ${q}.`.replace("Se elige una al azar", C.who.startsWith("estudiantes") ? "Se elige uno al azar" : "Se elige una al azar"),
        answer: ans,
        solution: [ask === "AdadoB" ? `[[pe-condicional|Probabilidad condicional]]: $P(A \\mid B) = \\frac{P(A\\cap B)}{P(B)} = \\frac{${a}}{${a} + ${b}} \\approx ${nf(ans)}$ (se mira solo la fila de $B$).`
          : ask === "BdadoA" ? `[[pe-condicional|Probabilidad condicional]]: $P(B \\mid A) = \\frac{P(A\\cap B)}{P(A)} = \\frac{${a}}{${a} + ${c}} \\approx ${nf(ans)}$ (se mira solo la columna de $A$).`
            : ask === "inter" ? `$P(A\\cap B) = \\frac{${a}}{${N}} \\approx ${nf(ans)}$.`
              : `Por [[pe-axiomas|inclusión-exclusión]]: $P(A\\cup B) = P(A) + P(B) - P(A\\cap B) = \\frac{${a + c} + ${a + b} - ${a}}{${N}} \\approx ${nf(ans)}$.`],
        // otro camino: se arma la lista de individuos y se cuenta con filtros
        verify: { kind: "value", tol: 1e-12, fn: () => {
          const pop = [...Array(a).fill([1, 1]), ...Array(b).fill([0, 1]), ...Array(c).fill([1, 0]), ...Array(d).fill([0, 0])];   // [A, B]
          const cnt = f => pop.filter(f).length;
          return { AdadoB: cnt(p => p[0] && p[1]) / cnt(p => p[1]), BdadoA: cnt(p => p[0] && p[1]) / cnt(p => p[0]), inter: cnt(p => p[0] && p[1]) / pop.length, union: cnt(p => p[0] || p[1]) / pop.length }[ask];
        } }
      };
    }
  };

  T["pe-bayes-num"] = {
    type: "numeric", concepts: ["pe-bayes"], difficulty: 3,
    generate(r) {
      const prev = r.pick([0.001, 0.005, 0.01, 0.02, 0.05, 0.1]), sens = r.pick([0.9, 0.95, 0.98, 0.99]), spec = r.pick([0.9, 0.95, 0.97, 0.99]), ask = r.pick(["vpp", "vpn", "pos"]);
      const pos = sens * prev + (1 - spec) * (1 - prev), vpp = sens * prev / pos, vpn = spec * (1 - prev) / (1 - pos);
      const ans = { vpp, vpn, pos }[ask];
      return {
        prompt: `Una enfermedad afecta al ${S.nt(prev * 100, 1)} % de la población. Un test da positivo en el ${S.nt(sens * 100, 0)} % de los enfermos (sensibilidad) y negativo en el ${S.nt(spec * 100, 0)} % de los sanos (especificidad). ${ask === "vpp" ? "Si una persona da positivo, ¿cuál es la probabilidad de que esté enferma?" : ask === "vpn" ? "Si una persona da negativo, ¿cuál es la probabilidad de que esté sana?" : "¿Cuál es la probabilidad de que una persona al azar dé positivo?"}`,
        answer: ans,
        solution: [`[[pe-bayes|Probabilidad total]]: $P(+) = P(+\\mid E)P(E) + P(+\\mid S)P(S) = ${nf(sens)}\\cdot${nf(prev)} + ${nf(1 - spec)}\\cdot${nf(1 - prev)} \\approx ${nf(pos, 5)}$.`,
          ...(ask === "pos" ? [] : ask === "vpp" ? [`[[pe-bayes|Bayes]]: $P(E\\mid +) = \\frac{P(+\\mid E)P(E)}{P(+)} \\approx ${nf(vpp)}$.${vpp < 0.5 ? " Aunque el test es bueno, la mayoría de los positivos son falsos: la enfermedad es rara." : ""}`] : [`[[pe-bayes|Bayes]]: $P(S\\mid -) = \\frac{P(-\\mid S)P(S)}{1 - P(+)} \\approx ${nf(vpn)}$.`])],
        // otro camino: forma de chances (odds) de Bayes y una población de un millón
        verify: { kind: "value", tol: 1e-9, fn: () => {
          if (ask === "pos") { const N = 1e6, sick = N * prev; return (sick * sens + (N - sick) * (1 - spec)) / N; }
          if (ask === "vpp") { const o = prev / (1 - prev) * sens / (1 - spec); return o / (1 + o); }
          const o = (1 - prev) / prev * spec / (1 - sens); return o / (1 + o);
        } }
      };
    }
  };

  T["pe-indep-tf"] = {
    type: "tf", concepts: ["pe-condicional"], difficulty: 2,
    generate(r) {
      const pa = r.int(1, 9) / 10, pb = r.int(1, 9) / 10, indep = r.bool(), pab0 = indep ? pa * pb : Math.round((pa * pb + r.pick([-1, 1]) * 0.05) * 100) / 100;
      const pab = Math.round(pab0 * 10000) / 10000, claim = r.pick(["indep", "excl"]);
      if (pab <= 0 || pab > Math.min(pa, pb) || pa + pb - pab > 1) return null;
      const isIndep = Math.abs(pab - pa * pb) < 1e-12, truth = claim === "indep" ? isIndep : pab === 0;
      return {
        prompt: `<b>Verdadero o falso:</b> si $P(A) = ${nf(pa)}$, $P(B) = ${nf(pb)}$ y $P(A\\cap B) = ${nf(pab)}$, entonces $A$ y $B$ son ${claim === "indep" ? "independientes" : "mutuamente excluyentes"}.`,
        answer: truth,
        explanation: claim === "indep" ? `Son [[pe-condicional|independientes]] si $P(A\\cap B) = P(A)P(B)$. Acá $P(A)P(B) = ${nf(pa * pb)} ${isIndep ? "=" : "\\neq"} ${nf(pab)}$: ${isIndep ? "son independientes" : "no lo son"}.` : `Mutuamente excluyentes quiere decir $P(A\\cap B) = 0$; acá es $${nf(pab)}$, así que no lo son (pueden pasar a la vez).`,
        solution: [R`Independencia y exclusión son cosas distintas: dos eventos excluyentes con probabilidad positiva nunca son independientes (si pasa uno, el otro seguro no).`],
        // otro camino: comparar P(A | B) con P(A)
        verify: { kind: "truth", fn: () => (claim === "indep" ? Math.abs(pab / pb - pa) < 1e-12 : pab === 0) }
      };
    }
  };

  T["pe-bayes-order"] = {
    type: "order", concepts: ["pe-bayes"], difficulty: 2,
    generate(r) {
      const p = [r.int(2, 5), r.int(2, 5), r.int(2, 5)], tot = p[0] + p[1] + p[2], d = [r.int(1, 6), r.int(1, 6), r.int(1, 6)], k = r.int(0, 2);
      const P = p.map(x => x / tot), D = d.map(x => x / 100), pd = P.reduce((s, x, i) => s + x * D[i], 0), post = P[k] * D[k] / pd;
      return {
        prompt: `Tres máquinas fabrican el ${p.map(x => S.nt(100 * x / tot, 1) + " %").join(", ")} de las piezas, con ${d.map(x => x + " %").join(", ")} de defectuosas. Ordená los pasos para calcular la probabilidad de que una pieza defectuosa venga de la máquina ${k + 1}.`,
        steps: [
          `Definir los eventos: $M_i$ = «viene de la máquina $i$» (forman una partición) y $D$ = «es defectuosa».`,
          `Anotar los datos: $P(M_i)$ y $P(D \\mid M_i)$ para cada máquina.`,
          `[[pe-bayes|Probabilidad total]]: $P(D) = \\sum_i P(D\\mid M_i)P(M_i) \\approx ${nf(pd, 5)}$.`,
          `Bayes: $P(M_${k + 1}\\mid D) = \\frac{P(D\\mid M_${k + 1})P(M_${k + 1})}{P(D)} \\approx ${nf(post)}$.`
        ],
        solution: [`Primero los eventos y los datos; después el denominador con la probabilidad total, y al final Bayes.`],
        // verificación: contando piezas en un lote de 10⁶
        verify: { kind: "truth", target: true, fn: () => { const N = 1e6, def = P.map((x, i) => N * x * D[i]); return Math.abs(def[k] / def.reduce((s, x) => s + x, 0) - post) < 1e-12; } }
      };
    }
  };

  const cards = {
    "pe-axiomas": {
      title: "Espacio muestral y axiomas de probabilidad", aliases: ["espacio muestral", "axiomas de Kolmogorov", "regla de Laplace", "probabilidad clásica", "inclusión-exclusión", "evento complementario"], concepts: ["pe-axiomas"],
      summary: "P(A) ≥ 0, P(Ω) = 1 y P de una unión disjunta es la suma. De ahí salen P(Aᶜ) = 1 − P(A) y P(A ∪ B) = P(A) + P(B) − P(A ∩ B). Con resultados equiprobables, P(A) = casos favorables / casos posibles.",
      def: [R`**Espacio muestral** $\Omega$: el conjunto de todos los resultados posibles de un experimento. **Evento:** un subconjunto de $\Omega$.`,
        R`**Axiomas de Kolmogorov:** (1) $P(A) \ge 0$; (2) $P(\Omega) = 1$; (3) si $A_1, A_2, \dots$ son disjuntos dos a dos, $P\left(\bigcup A_i\right) = \sum P(A_i)$.`,
        R`**Regla de Laplace:** si los $N$ resultados de $\Omega$ son igualmente probables, $P(A) = \frac{\#A}{N}$ (casos favorables sobre casos posibles).`],
      idea: [R`La probabilidad se comporta como un área o una masa repartida sobre $\Omega$, con masa total $1$. Todas las reglas salen de esa imagen: lo que no está en $A$ tiene la masa que falta, y al juntar dos regiones que se superponen no hay que contar dos veces la parte común.`],
      demo: [R`**Paso 1 (vacío).** $\Omega$ y $\varnothing$ son disjuntos y $\Omega \cup \varnothing = \Omega$. Por el axioma 3, $P(\Omega) = P(\Omega) + P(\varnothing)$, así que $P(\varnothing) = 0$.`,
        R`**Paso 2 (complemento).** $A$ y $A^c$ son disjuntos y su unión es $\Omega$: $P(A) + P(A^c) = 1$, de donde $P(A^c) = 1 - P(A)$.`,
        R`**Paso 3 (monotonía).** Si $A \subseteq B$, $B$ es la unión disjunta de $A$ y $B \setminus A$; como $P(B \setminus A) \ge 0$, queda $P(A) \le P(B)$. En particular, $P(A) \le 1$.`,
        R`**Paso 4 (inclusión-exclusión).** $A \cup B$ es la unión disjunta de $A$ y $B \setminus A$, y $B$ es la unión disjunta de $B \setminus A$ y $A \cap B$. Entonces $P(A\cup B) = P(A) + P(B\setminus A)$ y $P(B\setminus A) = P(B) - P(A \cap B)$.`,
        R`**Paso 5.** Reemplazando: $P(A \cup B) = P(A) + P(B) - P(A\cap B)$. $\blacksquare$`],
      examples: [{ q: R`Se tiran dos dados. ¿Cuál es la probabilidad de que la suma sea $7$?`, steps: [R`$\Omega$ tiene $36$ pares equiprobables; suman $7$: $(1,6), (2,5), \dots, (6,1)$, o sea $6$.`, R`$P = \frac{6}{36} = \frac16$.`] }],
      tips: [R`«Al menos uno» casi siempre se resuelve más fácil por el complemento: $1 - P(\text{ninguno})$.`],
      see: ["pe-combinatoria", "pe-condicional"]
    },
    "pe-combinatoria": {
      title: "Combinatoria: variaciones, permutaciones y combinaciones", aliases: ["combinatoria", "variaciones", "permutaciones", "combinaciones", "permutaciones con repetición", "coeficiente binomial"], concepts: ["pe-combinatoria"],
      summary: "Elegir k de n con orden: n!/(n − k)!. Sin orden: C(n, k) = n!/(k!(n − k)!). Ordenar n objetos con grupos repetidos: n!/(n₁!·n₂!·…).",
      def: [R`**Principio multiplicativo:** si una tarea se hace en $k$ etapas con $m_1, m_2, \dots, m_k$ opciones cada una, hay $m_1m_2\cdots m_k$ maneras.`,
        R`**Variaciones** (importa el orden, sin repetición): $V_{n,k} = \frac{n!}{(n - k)!}$. **Permutaciones:** $P_n = n!$.`,
        R`**Combinaciones** (no importa el orden): $\binom nk = \frac{n!}{k!\,(n - k)!}$. **Permutaciones con repetición:** $\frac{n!}{n_1!\,n_2!\cdots n_r!}$ si hay $n_i$ objetos iguales de cada tipo.`],
      idea: [R`Casi todo es el principio multiplicativo más una pregunta: ¿cuántas veces conté cada caso? Si cada caso aparece repetido $r$ veces, se divide por $r$.`],
      demo: [R`**Paso 1 (variaciones).** El primer lugar se llena de $n$ maneras, el segundo de $n - 1$ (ya se usó uno), …, el $k$-ésimo de $n - k + 1$. Por el principio multiplicativo, $n(n - 1)\cdots(n - k + 1) = \frac{n!}{(n - k)!}$.`,
        R`**Paso 2 (combinaciones).** Cada subconjunto de $k$ elementos se puede ordenar de $k!$ maneras, y cada orden es una variación distinta. Entonces $V_{n,k} = \binom nk\cdot k!$, y despejando, $\binom nk = \frac{n!}{k!\,(n - k)!}$.`,
        R`**Paso 3 (con repetición).** Si los $n$ objetos fueran todos distintos habría $n!$ órdenes. Al permutar entre sí los $n_1$ objetos iguales del tipo 1 no cambia la palabra, así que cada palabra se contó $n_1!$ veces por ese tipo, $n_2!$ por el tipo 2, etc.`,
        R`**Paso 4.** Dividiendo por todas esas repeticiones: $\frac{n!}{n_1!\,n_2!\cdots n_r!}$. $\blacksquare$`],
      examples: [{ q: R`¿Cuántas palabras se forman con las letras de ANANA?`, steps: [R`$5$ letras: tres A y dos N.`, R`$\frac{5!}{3!\,2!} = 10$.`] }],
      tips: [R`Preguntate siempre: ¿importa el orden? ¿se puede repetir? Con esas dos respuestas se elige la fórmula.`],
      see: ["pe-axiomas", "pe-binomial"]
    },
    "pe-condicional": {
      title: "Probabilidad condicional e independencia", aliases: ["probabilidad condicional", "regla de la multiplicación", "eventos independientes", "independencia de eventos", "mutuamente excluyentes"], concepts: ["pe-condicional"],
      summary: "P(A | B) = P(A ∩ B)/P(B). Regla del producto: P(A ∩ B) = P(A | B)P(B). A y B son independientes si P(A ∩ B) = P(A)P(B), o sea, si saber que pasó B no cambia la probabilidad de A.",
      def: [R`**Probabilidad condicional** (con $P(B) > 0$): $P(A\mid B) = \frac{P(A\cap B)}{P(B)}$. Es la probabilidad de $A$ cuando ya se sabe que ocurrió $B$.`,
        R`**Regla del producto:** $P(A\cap B) = P(A\mid B)\,P(B) = P(B\mid A)\,P(A)$.`,
        R`**Independencia:** $A$ y $B$ son independientes si $P(A\cap B) = P(A)\,P(B)$. **Mutuamente excluyentes:** $A \cap B = \varnothing$ (no pueden pasar a la vez).`],
      idea: [R`Saber que pasó $B$ achica el espacio muestral a $B$: dentro de ese mundo nuevo, la parte de $A$ que queda es $A\cap B$, y se reescala para que $B$ tenga probabilidad $1$.`,
        R`Independiente no es lo mismo que excluyente: si $A$ y $B$ se excluyen, saber que pasó $B$ asegura que $A$ no pasó, ¡es lo contrario de no dar información!`],
      demo: [R`**Paso 1 (producto).** Multiplicando la definición de $P(A\mid B)$ por $P(B)$ queda $P(A\cap B) = P(A\mid B)P(B)$; con los papeles cambiados, lo mismo para $P(B\mid A)P(A)$.`,
        R`**Paso 2 (independencia como «no informa»).** Si $P(B) > 0$, $P(A\mid B) = P(A)$ es equivalente a $\frac{P(A\cap B)}{P(B)} = P(A)$, y multiplicando por $P(B)$, a $P(A\cap B) = P(A)P(B)$.`,
        R`**Paso 3 (excluyentes no son independientes).** Si $A\cap B = \varnothing$, $P(A\cap B) = 0$; si además $P(A) > 0$ y $P(B) > 0$, el producto $P(A)P(B)$ es positivo y no puede ser igual a $0$. $\blacksquare$`],
      examples: [{ q: R`En un curso, el 60 % aprobó el parcial; de los que aprobaron, el 80 % aprobó el final. ¿Qué proporción aprobó los dos?`, steps: [R`Regla del producto: $P(F \cap Pa) = P(F\mid Pa)\,P(Pa) = 0{,}8\cdot0{,}6 = 0{,}48$.`] }],
      tips: [R`En una tabla de doble entrada, condicionar a $B$ es quedarse con la fila (o columna) de $B$ y dividir por su total.`],
      see: ["pe-axiomas", "pe-bayes", "pe-conjuntas"]
    },
    "pe-bayes": {
      title: "Probabilidad total y teorema de Bayes", aliases: ["teorema de Bayes", "fórmula de Bayes", "probabilidad total", "teorema de la probabilidad total", "partición del espacio muestral", "sensibilidad", "especificidad", "valor predictivo positivo"], concepts: ["pe-bayes"],
      summary: "Si B₁, …, Bₙ son una partición: P(A) = Σ P(A | Bᵢ)P(Bᵢ) y P(Bₖ | A) = P(A | Bₖ)P(Bₖ)/P(A).",
      def: [R`**Partición:** eventos $B_1, \dots, B_n$ disjuntos dos a dos cuya unión es $\Omega$ (cada resultado cae en exactamente uno).`,
        R`**Probabilidad total:** $P(A) = \sum_{i=1}^n P(A\mid B_i)\,P(B_i)$.`,
        R`**Bayes:** $P(B_k\mid A) = \frac{P(A\mid B_k)\,P(B_k)}{\sum_i P(A\mid B_i)\,P(B_i)}$. En un test diagnóstico: sensibilidad $P(+\mid E)$, especificidad $P(-\mid S)$ y valor predictivo positivo $P(E\mid +)$.`],
      idea: [R`Bayes «da vuelta» la condición: de $P(\text{síntoma}\mid\text{causa})$, que es lo que se conoce, pasa a $P(\text{causa}\mid\text{síntoma})$, que es lo que interesa. El resultado depende mucho de qué tan común es cada causa: con una enfermedad rara, hasta un test muy bueno da mayoría de falsos positivos.`],
      demo: [R`**Paso 1.** Como los $B_i$ son una partición, $A$ es la unión disjunta de los $A\cap B_i$. Por el axioma de la suma ([[pe-axiomas]]), $P(A) = \sum P(A\cap B_i)$.`,
        R`**Paso 2.** Por la [[pe-condicional|regla del producto]], cada término es $P(A\mid B_i)P(B_i)$: eso es la probabilidad total.`,
        R`**Paso 3 (Bayes).** Por la definición de probabilidad condicional, $P(B_k\mid A) = \frac{P(A\cap B_k)}{P(A)}$. El numerador, otra vez por la regla del producto, es $P(A\mid B_k)P(B_k)$, y el denominador es la probabilidad total del paso 2. $\blacksquare$`],
      examples: [{ q: R`Prevalencia 1 %, sensibilidad 99 %, especificidad 95 %. Si da positivo, ¿qué probabilidad hay de estar enfermo?`, steps: [R`$P(+) = 0{,}99\cdot0{,}01 + 0{,}05\cdot0{,}99 = 0{,}0594$.`, R`$P(E\mid +) = \frac{0{,}0099}{0{,}0594} \approx 0{,}167$: solo uno de cada seis positivos está enfermo.`] }],
      tips: [R`Un árbol de probabilidades ayuda: primero se ramifica por la causa ($B_i$) y después por el efecto ($A$). Bayes es «la rama que me interesa sobre todas las ramas que terminan en $A$».`],
      see: ["pe-condicional", "pe-axiomas"]
    }
  };

  E.extendCourse("m105", {
    concepts: { "pe-axiomas": { name: "Axiomas y reglas de probabilidad" }, "pe-combinatoria": { name: "Combinatoria" }, "pe-condicional": { name: "Condicional e independencia" }, "pe-bayes": { name: "Probabilidad total y Bayes" } },
    templates: T,
    units: [{
      id: "pe-probabilidad-u", order: 2, program: "Unidad 2", title: "Probabilidad", icon: "sparkles",
      diagnostic: ["pe-dados-num", "pe-condicional-num", "pe-bayes-num"],
      lessons: [
        { id: "pe-prob-l1", title: "Axiomas y conteo", templates: ["pe-dados-num", "pe-comb-num"], theory: ["pe-axiomas", "pe-combinatoria"],
          intro: R`Casos favorables sobre casos posibles, y para contarlos: ¿importa el orden?` },
        { id: "pe-prob-l2", title: "Probabilidad condicional", templates: ["pe-condicional-num", "pe-indep-tf"], theory: ["pe-condicional"],
          intro: R`$P(A\mid B) = \frac{P(A\cap B)}{P(B)}$: saber que pasó $B$ cambia el mundo.` },
        { id: "pe-prob-l3", title: "Probabilidad total y Bayes", templates: ["pe-bayes-num", "pe-bayes-order"], theory: ["pe-bayes"],
          intro: R`De $P(+\mid E)$ a $P(E\mid +)$: Bayes da vuelta la condición.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 3 · VARIABLES ALEATORIAS DISCRETAS
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, S = E.pye, nf = S.nf;
  const T = {};
  // probabilidades en vigésimos que suman 1
  const probs = (r, k) => { for (;;) { const c = Array.from({ length: k }, () => r.int(1, 8)); const s = c.reduce((a, b) => a + b, 0); if (s === 20) return c.map(x => x / 20); } };
  // binomial por convolución de n Bernoulli (programación dinámica)
  const binDP = (n, p) => { let d = [1]; for (let i = 0; i < n; i++) { const e = Array(d.length + 1).fill(0); d.forEach((v, j) => { e[j] += v * (1 - p); e[j + 1] += v * p; }); d = e; } return d; };

  T["pe-esperanza-num"] = {
    type: "numeric", concepts: ["pe-va-discreta"], difficulty: 2,
    generate(r) {
      const k = r.int(3, 5), xs = r.distinct(k, 0, 6).sort((a, b) => a - b), ps = probs(r, k), ask = r.pick(["E", "Var", "sd", "lin", "acum"]);
      const mu = xs.reduce((s, x, i) => s + x * ps[i], 0), e2 = xs.reduce((s, x, i) => s + x * x * ps[i], 0), v = e2 - mu * mu;
      const a = r.pick([2, 3, -2, 5]), b = r.int(-5, 5), c = xs[r.int(0, k - 2)];
      const ans = { E: mu, Var: v, sd: Math.sqrt(v), lin: a * mu + b, acum: xs.reduce((s, x, i) => s + (x <= c ? ps[i] : 0), 0) }[ask];
      const q = { E: "E(X)", Var: "Var(X)", sd: "el desvío estándar de X", lin: `E(${a}X ${b < 0 ? "-" : "+"} ${Math.abs(b)})`, acum: `F(${c}) = P(X \\le ${c})` }[ask];
      return {
        prompt: `La variable $X$ toma los valores $${xs.join(";\\ ")}$ con probabilidades $${ps.map(p => nf(p, 2)).join(";\\ ")}$. Calculá ${ask === "sd" ? q : `$${q}$`}.`,
        answer: ans,
        solution: [`[[pe-va-discreta|Esperanza]]: $E(X) = \\sum x_ip_i = ${nf(mu)}$.`,
          ...(ask === "Var" || ask === "sd" ? [`$E(X^2) = \\sum x_i^2p_i = ${nf(e2)}$, así que $Var(X) = E(X^2) - E(X)^2 = ${nf(v)}$${ask === "sd" ? ` y $\\sigma = ${nf(Math.sqrt(v))}$` : ""}.`] : []),
          ...(ask === "lin" ? [`Por linealidad, $E(${a}X ${b < 0 ? "-" : "+"} ${Math.abs(b)}) = ${a}E(X)${H.sg(b)} = ${nf(ans)}$.`] : []),
          ...(ask === "acum" ? [`$F(${c})$ suma las probabilidades de los valores $\\le ${c}$: $${nf(ans, 2)}$.`] : [])],
        // otro camino: E(X) = Σ P(X > k) para X entera no negativa, y la varianza con E[(X − μ)²]
        verify: { kind: "value", tol: 1e-9, fn: () => {
          const tail = kk => xs.reduce((s, x, i) => s + (x > kk ? ps[i] : 0), 0), m2 = [0, 1, 2, 3, 4, 5].reduce((s, kk) => s + tail(kk), 0);
          const vv = xs.reduce((s, x, i) => s + (x - m2) ** 2 * ps[i], 0);
          return { E: m2, Var: vv, sd: Math.sqrt(vv), lin: a * m2 + b, acum: 1 - tail(c) }[ask];
        } }
      };
    }
  };

  T["pe-binomial-num"] = {
    type: "numeric", concepts: ["pe-binomial"], difficulty: 2,
    generate(r) {
      const n = r.int(5, 15), p = r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]), k = r.int(1, n - 1), ask = r.pick(["eq", "le", "ge"]);
      const pmf = j => S.binpmf(j, n, p), ans = ask === "eq" ? pmf(k) : ask === "le" ? Array.from({ length: k + 1 }, (_, j) => pmf(j)).reduce((s, x) => s + x, 0) : 1 - Array.from({ length: k }, (_, j) => pmf(j)).reduce((s, x) => s + x, 0);
      const ctx = r.pick([[`Un tirador acierta con probabilidad $${nf(p)}$ y tira ${n} veces, en forma independiente.`, "aciertos"], [`El ${nf(100 * p, 0)} % de las semillas germina. Se siembran ${n}.`, "semillas que germinan"], [`Cada pieza sale defectuosa con probabilidad $${nf(p)}$, independientemente. Se revisan ${n}.`, "piezas defectuosas"]]);
      const ev = { eq: `exactamente ${k}`, le: `a lo sumo ${k}`, ge: `al menos ${k}` }[ask];
      return {
        prompt: `${ctx[0]} ¿Cuál es la probabilidad de que haya ${ev} ${ctx[1]}?`,
        answer: ans,
        solution: [`$X$ = cantidad de ${ctx[1]} es [[pe-binomial|binomial]] con $n = ${n}$ y $p = ${nf(p)}$: $P(X = j) = \\binom{${n}}{j}${nf(p)}^j\\,${nf(1 - p)}^{${n} - j}$.`,
          ask === "eq" ? `$P(X = ${k}) = \\binom{${n}}{${k}}${nf(p)}^{${k}}${nf(1 - p)}^{${n - k}} \\approx ${nf(ans)}$.` : ask === "le" ? `$P(X \\le ${k}) = \\sum_{j=0}^{${k}} P(X = j) \\approx ${nf(ans)}$.` : `$P(X \\ge ${k}) = 1 - P(X \\le ${k - 1}) \\approx ${nf(ans)}$.`],
        verify: { kind: "value", tol: 1e-9, fn: () => { const d = binDP(n, p); return ask === "eq" ? d[k] : ask === "le" ? d.slice(0, k + 1).reduce((s, x) => s + x, 0) : d.slice(k).reduce((s, x) => s + x, 0); } }
      };
    }
  };

  T["pe-poisson-num"] = {
    type: "numeric", concepts: ["pe-poisson"], difficulty: 2,
    generate(r) {
      const rate = r.pick([0.5, 1, 1.5, 2, 3, 4]), t = r.pick([1, 2, 3, 0.5]), lam = rate * t, k = r.int(0, 5), ask = r.pick(["eq", "le", "alguno"]);
      if (lam > 9) return null;
      const pmf = j => S.poispmf(j, lam), le = Array.from({ length: k + 1 }, (_, j) => pmf(j)).reduce((s, x) => s + x, 0);
      const ans = ask === "eq" ? pmf(k) : ask === "le" ? le : 1 - pmf(0);
      const [what, unit] = r.pick([["llamadas", "hora"], ["autos", "minuto"], ["errores de tipeo", "página"], ["partículas detectadas", "segundo"]]);
      const tt = t === 1 ? `una ${unit}` : t === 0.5 ? `media ${unit}` : `${S.nt(t)} ${unit}s`;
      return {
        prompt: `Llegan en promedio ${S.nt(rate)} ${what} por ${unit}, al azar (proceso de Poisson). ¿Cuál es la probabilidad de que en ${tt} ${ask === "eq" ? `lleguen exactamente ${k}` : ask === "le" ? `lleguen a lo sumo ${k}` : "llegue al menos una"}?`,
        answer: ans,
        solution: [`En ${tt} la cantidad es [[pe-poisson|Poisson]] con $\\lambda = ${nf(rate)}\\cdot${nf(t)} = ${nf(lam)}$: $P(X = j) = \\frac{e^{-\\lambda}\\lambda^j}{j!}$.`,
          ask === "eq" ? `$P(X = ${k}) = \\frac{e^{-${nf(lam)}}${nf(lam)}^{${k}}}{${k}!} \\approx ${nf(ans)}$.` : ask === "le" ? `$P(X \\le ${k}) = \\sum_{j=0}^{${k}} \\frac{e^{-\\lambda}\\lambda^j}{j!} \\approx ${nf(ans)}$.` : `$P(X \\ge 1) = 1 - P(X = 0) = 1 - e^{-${nf(lam)}} \\approx ${nf(ans)}$.`],
        // otro camino: P(X ≤ k) = 1 − P(Γ(k + 1) ≤ λ), con la gamma incompleta (tiempo hasta la llegada k + 1)
        verify: { kind: "value", tol: 1e-9, fn: () => {
          const cdf = kk => (kk < 0 ? 0 : 1 - S.gammaP(kk + 1, lam));
          return ask === "eq" ? cdf(k) - cdf(k - 1) : ask === "le" ? cdf(k) : 1 - cdf(0);
        } }
      };
    }
  };

  T["pe-hiper-num"] = {
    type: "numeric", concepts: ["pe-otras-discretas"], difficulty: 3,
    generate(r) {
      const N = r.int(8, 14), K = r.int(2, N - 3), n = r.int(2, Math.min(5, N - 1)), k = r.int(0, Math.min(K, n));
      if (n - k > N - K) return null;
      const ans = S.choose(K, k) * S.choose(N - K, n - k) / S.choose(N, n);
      return {
        prompt: `En una caja hay ${N} lámparas, de las cuales ${K} son defectuosas. Se sacan ${n} al azar, sin reposición. ¿Cuál es la probabilidad de que ${k === 0 ? "ninguna sea defectuosa" : k === 1 ? "exactamente una sea defectuosa" : `exactamente ${k} sean defectuosas`}?`,
        answer: ans,
        solution: [`Sin reposición, la cantidad de defectuosas es [[pe-otras-discretas|hipergeométrica]]: $P(X = k) = \\frac{\\binom{K}{k}\\binom{N - K}{n - k}}{\\binom{N}{n}}$.`,
          `$P(X = ${k}) = \\frac{\\binom{${K}}{${k}}\\binom{${N - K}}{${n - k}}}{\\binom{${N}}{${n}}} = \\frac{${S.choose(K, k)}\\cdot${S.choose(N - K, n - k)}}{${S.choose(N, n)}} \\approx ${nf(ans)}$.`],
        // otro camino: se recorren todas las extracciones posibles (subconjuntos de tamaño n)
        verify: { kind: "value", tol: 1e-12, fn: () => { let tot = 0, fav = 0; for (let m = 0; m < 1 << N; m++) { let c = 0, d = 0; for (let i = 0; i < N; i++) if (m >> i & 1) { c++; if (i < K) d++; } if (c === n) { tot++; if (d === k) fav++; } } return fav / tot; } }
      };
    }
  };

  T["pe-dist-match"] = {
    type: "match", concepts: ["pe-binomial", "pe-poisson", "pe-otras-discretas"], difficulty: 2,
    generate(r) {
      const n = r.int(4, 12), p = r.pick([0.2, 0.25, 0.4, 0.5]), lam = r.pick([1.5, 2.5, 3.5, 7]), pg = r.pick([0.1, 0.2, 0.25, 0.5]), N = r.int(10, 20), K = r.int(2, N - 2), m = r.int(2, 6);
      const vals = [n * p, lam, 1 / pg, m * K / N];
      for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) if (Math.abs(vals[i] - vals[j]) < 1e-9) return null;
      const left = [`X \\sim \\text{Bin}(${n};\\ ${nf(p)})`, `X \\sim \\text{Poisson}(${nf(lam)})`, `X = \\text{intentos hasta el primer éxito},\\ p = ${nf(pg)}`, `X \\sim \\text{Hiper}(N = ${N},\\ K = ${K},\\ n = ${m})`];
      return {
        prompt: R`Uní cada variable aleatoria con su esperanza.`,
        pairs: [0, 1, 2, 3].map(i => [{ tex: left[i] }, { tex: `E(X) = ${nf(vals[i])}` }]),
        solution: [`[[pe-binomial|Binomial]]: $np = ${nf(vals[0])}$. [[pe-poisson|Poisson]]: $\\lambda = ${nf(lam)}$.`, `[[pe-otras-discretas|Geométrica]]: $\\frac1p = ${nf(vals[2])}$. Hipergeométrica: $n\\frac KN = ${nf(vals[3])}$.`],
        // otro camino: cada esperanza sumando x·P(X = x) sobre la función de probabilidad
        verify: { kind: "truth", target: true, fn: () => {
          const eB = Array.from({ length: n + 1 }, (_, j) => j * S.binpmf(j, n, p)).reduce((s, x) => s + x, 0);
          let eP = 0; for (let j = 0; j < 200; j++) eP += j * S.poispmf(j, lam);
          let eG = 0; for (let j = 1; j < 5000; j++) eG += j * (1 - pg) ** (j - 1) * pg;
          let eH = 0; for (let j = 0; j <= m; j++) eH += j * S.choose(K, j) * S.choose(N - K, m - j) / S.choose(N, m);
          return [eB, eP, eG, eH].every((x, i) => Math.abs(x - vals[i]) < 1e-8);
        } }
      };
    }
  };

  T["pe-momentos-tf"] = {
    type: "tf", concepts: ["pe-binomial", "pe-poisson"], difficulty: 2,
    generate(r) {
      const kind = r.pick(["binvar", "poisvar", "geomE", "binE"]), truth = r.bool(), n = r.int(5, 20), p = r.pick([0.1, 0.2, 0.3, 0.5]), lam = r.pick([2, 3, 4, 5]), pg = r.pick([0.2, 0.25, 0.5]);
      const real = { binvar: n * p * (1 - p), poisvar: lam, geomE: 1 / pg, binE: n * p }[kind], wrong = { binvar: n * p, poisvar: lam * lam, geomE: (1 - pg) / pg + 2, binE: n * (1 - p) }[kind];
      if (Math.abs(real - wrong) < 1e-9) return null;
      const claim = truth ? real : wrong;
      const txt = { binvar: `si $X \\sim \\text{Bin}(${n};\\ ${nf(p)})$, entonces $Var(X) = ${nf(claim)}$`, poisvar: `si $X \\sim \\text{Poisson}(${lam})$, entonces $Var(X) = ${nf(claim)}$`, geomE: `si $X$ es la cantidad de intentos hasta el primer éxito, con $p = ${nf(pg)}$, entonces $E(X) = ${nf(claim)}$`, binE: `si $X \\sim \\text{Bin}(${n};\\ ${nf(p)})$, entonces $E(X) = ${nf(claim)}$` }[kind];
      return {
        prompt: `<b>Verdadero o falso:</b> ${txt}.`,
        answer: truth,
        explanation: `${{ binvar: `En la [[pe-binomial|binomial]], $Var(X) = np(1 - p) = ${nf(real)}$`, poisvar: `En la [[pe-poisson|Poisson]], la media y la varianza valen $\\lambda = ${lam}$`, geomE: `En la [[pe-otras-discretas|geométrica]], $E(X) = \\frac1p = ${nf(real)}$`, binE: `En la [[pe-binomial|binomial]], $E(X) = np = ${nf(real)}$` }[kind]}: es ${truth ? "verdadero" : "falso"}.`,
        solution: [R`Ver las fórmulas de esperanza y varianza de cada distribución.`],
        verify: { kind: "truth", fn: () => {
          let m1 = 0, m2 = 0;
          const add = (x, q) => { m1 += x * q; m2 += x * x * q; };
          if (kind === "binvar" || kind === "binE") for (let j = 0; j <= n; j++) add(j, S.binpmf(j, n, p));
          else if (kind === "poisvar") for (let j = 0; j < 200; j++) add(j, S.poispmf(j, lam));
          else for (let j = 1; j < 5000; j++) add(j, (1 - pg) ** (j - 1) * pg);
          const got = kind === "binvar" || kind === "poisvar" ? m2 - m1 * m1 : m1;
          return Math.abs(got - claim) < 1e-8;
        } }
      };
    }
  };

  const cards = {
    "pe-va-discreta": {
      title: "Variables aleatorias discretas", aliases: ["variable aleatoria", "variable aleatoria discreta", "función de probabilidad", "función de distribución acumulada", "esperanza matemática", "valor esperado", "varianza de una variable aleatoria"], concepts: ["pe-va-discreta"],
      summary: "Una variable aleatoria asigna un número a cada resultado. Si toma valores aislados xᵢ con probabilidades pᵢ: E(X) = Σ xᵢpᵢ y Var(X) = E(X²) − E(X)². Además E(aX + b) = aE(X) + b y Var(aX + b) = a²Var(X).",
      def: [R`**Variable aleatoria:** una función $X: \Omega \to \mathbb{R}$. Es **discreta** si toma una cantidad finita o numerable de valores $x_1, x_2, \dots$`,
        R`**Función de probabilidad:** $p(x_i) = P(X = x_i)$, con $p(x_i) \ge 0$ y $\sum p(x_i) = 1$. **Función de distribución:** $F(x) = P(X \le x)$, escalonada y no decreciente.`,
        R`**Esperanza:** $E(X) = \mu = \sum x_i\,p(x_i)$. **Varianza:** $Var(X) = \sigma^2 = E\big[(X - \mu)^2\big] = \sum (x_i - \mu)^2p(x_i)$. **Desvío:** $\sigma = \sqrt{Var(X)}$.`],
      idea: [R`$E(X)$ es el promedio a la larga: si el experimento se repite muchísimas veces, el promedio de los valores observados se acerca a $E(X)$ (ley de los grandes números). Es la versión «poblacional» de la [[pe-centralizacion|media]] de los datos.`],
      demo: [R`**Paso 1 (linealidad).** $E(aX + b) = \sum (ax_i + b)p_i = a\sum x_ip_i + b\sum p_i = aE(X) + b$, porque las probabilidades suman $1$.`,
        R`**Paso 2 (fórmula de cálculo).** Desarrollando el cuadrado, $E[(X - \mu)^2] = E[X^2 - 2\mu X + \mu^2] = E(X^2) - 2\mu E(X) + \mu^2$ por la linealidad, y como $E(X) = \mu$, queda $E(X^2) - \mu^2$.`,
        R`**Paso 3 (varianza de aX + b).** Por el paso 1, $aX + b$ tiene media $a\mu + b$, así que su desvío respecto de la media es $(aX + b) - (a\mu + b) = a(X - \mu)$. Elevando al cuadrado y tomando esperanza: $Var(aX + b) = a^2Var(X)$. $\blacksquare$`],
      examples: [{ q: R`$X$ vale $0$, $1$ o $2$ con probabilidades $0{,}25$, $0{,}5$ y $0{,}25$.`, steps: [R`$E(X) = 0 + 0{,}5 + 0{,}5 = 1$.`, R`$E(X^2) = 0 + 0{,}5 + 1 = 1{,}5$, así que $Var(X) = 1{,}5 - 1 = 0{,}5$.`] }],
      tips: [R`Sumar una constante no cambia la varianza; multiplicar por $a$ la multiplica por $a^2$ (y al desvío por $|a|$).`],
      see: ["pe-binomial", "pe-poisson", "pe-va-continua"]
    },
    "pe-binomial": {
      title: "Distribución binomial", aliases: ["distribución binomial", "binomial", "ensayos de Bernoulli", "variable de Bernoulli"], concepts: ["pe-binomial"],
      summary: "Cantidad de éxitos en n ensayos independientes con probabilidad p: P(X = k) = C(n, k)pᵏ(1 − p)ⁿ⁻ᵏ, E(X) = np y Var(X) = np(1 − p).",
      def: [R`**Ensayo de Bernoulli:** un experimento con dos resultados, éxito (probabilidad $p$) o fracaso ($1 - p$).`,
        R`**Binomial** $X \sim \text{Bin}(n, p)$: cantidad de éxitos en $n$ ensayos de Bernoulli independientes con la misma $p$. $$P(X = k) = \binom nk p^k(1 - p)^{n - k},\qquad k = 0, 1, \dots, n.$$`,
        R`**Momentos:** $E(X) = np$ y $Var(X) = np(1 - p)$.`],
      idea: [R`Cada secuencia con $k$ éxitos tiene la misma probabilidad, $p^k(1-p)^{n-k}$; lo único que hay que contar es cuántas secuencias hay, y eso es elegir en qué $k$ lugares van los éxitos ([[pe-combinatoria|combinaciones]]).`],
      demo: [R`**Paso 1 (cada secuencia).** Una secuencia concreta con $k$ éxitos y $n - k$ fracasos, por ejemplo $\text{ÉÉF}\dots$, tiene probabilidad $p^k(1 - p)^{n - k}$, porque los ensayos son independientes y las probabilidades se multiplican.`,
        R`**Paso 2 (cuántas).** Hay tantas secuencias con $k$ éxitos como maneras de elegir los $k$ lugares de los éxitos entre $n$: $\binom nk$. Son eventos disjuntos, así que se suman: $P(X = k) = \binom nk p^k(1 - p)^{n - k}$.`,
        R`**Paso 3 (esperanza).** $X = X_1 + \dots + X_n$, donde $X_i$ vale $1$ si el ensayo $i$ es éxito y $0$ si no. Cada $X_i$ tiene $E(X_i) = p$, y la esperanza de una suma es la suma de las esperanzas: $E(X) = np$.`,
        R`**Paso 4 (varianza).** $Var(X_i) = E(X_i^2) - p^2 = p - p^2 = p(1 - p)$, porque $X_i^2 = X_i$. Como los ensayos son independientes, la varianza de la suma es la suma de las varianzas ([[pe-conjuntas]]): $Var(X) = np(1 - p)$. $\blacksquare$`],
      examples: [{ q: R`Se tira una moneda 4 veces. ¿Cuál es la probabilidad de 2 caras?`, steps: [R`$\binom42\left(\frac12\right)^4 = \frac{6}{16} = 0{,}375$.`] }],
      tips: [R`Si se saca **sin reposición** de una población chica, los ensayos no son independientes: la distribución es [[pe-otras-discretas|hipergeométrica]].`],
      see: ["pe-va-discreta", "pe-poisson", "pe-aprox-normal"]
    },
    "pe-poisson": {
      title: "Distribución de Poisson", aliases: ["distribución de Poisson", "proceso de Poisson"], concepts: ["pe-poisson"],
      summary: "Cantidad de eventos raros en un intervalo, con media λ: P(X = k) = e^(−λ)λᵏ/k!, E(X) = Var(X) = λ. Es el límite de la binomial con n grande y np = λ.",
      def: [R`$X \sim \text{Poisson}(\lambda)$ si $P(X = k) = \frac{e^{-\lambda}\lambda^k}{k!}$, $k = 0, 1, 2, \dots$ Modela cuántas veces ocurre algo en un intervalo (de tiempo, de longitud, de área) cuando los eventos llegan al azar, de a uno, con tasa constante.`,
        R`Si llegan en promedio $r$ eventos por unidad, en un intervalo de largo $t$ la cantidad es Poisson con $\lambda = rt$. **Momentos:** $E(X) = Var(X) = \lambda$.`],
      idea: [R`Partí el intervalo en $n$ pedacitos muy chicos: en cada uno ocurre un evento con probabilidad $\frac{\lambda}{n}$, independientemente. La cantidad total es binomial con $n$ enorme y $p$ diminuta, y en el límite queda la Poisson.`],
      demo: [R`**Paso 1.** Con $X_n \sim \text{Bin}(n, \frac\lambda n)$: $P(X_n = k) = \frac{n(n-1)\cdots(n-k+1)}{k!}\frac{\lambda^k}{n^k}\left(1 - \frac\lambda n\right)^{n - k}$.`,
        R`**Paso 2.** Para $k$ fijo y $n \to \infty$: $\frac{n(n-1)\cdots(n-k+1)}{n^k} \to 1$ (son $k$ factores que tienden a $1$), $\left(1 - \frac\lambda n\right)^n \to e^{-\lambda}$ (límite notable) y $\left(1 - \frac\lambda n\right)^{-k} \to 1$.`,
        R`**Paso 3.** Queda $P(X_n = k) \to \frac{\lambda^k}{k!}e^{-\lambda}$, que es la función de probabilidad de Poisson.`,
        R`**Paso 4 (esperanza).** $E(X) = \sum_{k\ge1} k\frac{e^{-\lambda}\lambda^k}{k!} = \lambda e^{-\lambda}\sum_{k\ge1}\frac{\lambda^{k-1}}{(k-1)!} = \lambda e^{-\lambda}e^{\lambda} = \lambda$, usando la serie de la exponencial. $\blacksquare$`],
      examples: [{ q: R`Llegan 2 mails por hora en promedio. ¿Probabilidad de que en una hora no llegue ninguno?`, steps: [R`$P(X = 0) = e^{-2} \approx 0{,}135$.`] }],
      tips: [R`Una binomial con $n \ge 50$ y $np \le 5$ se aproxima bien por una Poisson con $\lambda = np$.`],
      see: ["pe-binomial", "pe-uniforme-exponencial"]
    },
    "pe-otras-discretas": {
      title: "Distribuciones hipergeométrica y geométrica", aliases: ["distribución hipergeométrica", "hipergeométrica", "distribución geométrica", "geométrica"], concepts: ["pe-otras-discretas"],
      summary: "Hipergeométrica: k éxitos al sacar n sin reposición de N con K éxitos, P = C(K, k)C(N − K, n − k)/C(N, n), media nK/N. Geométrica: intentos hasta el primer éxito, P(X = k) = (1 − p)ᵏ⁻¹p, media 1/p.",
      def: [R`**Hipergeométrica:** de una población de $N$ con $K$ «éxitos» se sacan $n$ **sin reposición**; $X$ = éxitos en la muestra: $$P(X = k) = \frac{\binom Kk\binom{N - K}{n - k}}{\binom Nn},\qquad E(X) = n\frac KN.$$`,
        R`**Geométrica:** cantidad de ensayos de Bernoulli hasta el primer éxito: $P(X = k) = (1 - p)^{k - 1}p$, $k = 1, 2, \dots$, con $E(X) = \frac1p$ y $Var(X) = \frac{1 - p}{p^2}$.`],
      idea: [R`La hipergeométrica es la binomial «sin devolver»: cada extracción cambia la composición de la caja. Si $N$ es mucho más grande que $n$, casi no se nota y se parece a una $\text{Bin}(n, \frac KN)$.`,
        R`Si el éxito tiene probabilidad $\frac15$, en promedio hay que esperar $5$ intentos: eso dice $E(X) = \frac1p$.`],
      demo: [R`**Paso 1 (hipergeométrica).** Todas las muestras de $n$ elementos son igualmente probables: hay $\binom Nn$. Las que tienen exactamente $k$ éxitos se arman eligiendo $k$ de los $K$ éxitos y $n - k$ de los $N - K$ fracasos: $\binom Kk\binom{N-K}{n-k}$ (principio multiplicativo). Laplace da la fórmula.`,
        R`**Paso 2 (geométrica).** $X = k$ quiere decir $k - 1$ fracasos seguidos de un éxito; por independencia, $(1 - p)^{k-1}p$.`,
        R`**Paso 3 (media de la geométrica).** Con $q = 1 - p$: $E(X) = p\sum_{k\ge1} kq^{k-1}$. Derivando la serie geométrica $\sum_{k\ge0}q^k = \frac{1}{1 - q}$ término a término, $\sum_{k\ge1}kq^{k-1} = \frac{1}{(1 - q)^2} = \frac{1}{p^2}$.`,
        R`**Paso 4.** Entonces $E(X) = p\cdot\frac{1}{p^2} = \frac1p$. $\blacksquare$`],
      examples: [{ q: R`De 10 lámparas, 3 están quemadas; se sacan 2. ¿Probabilidad de que ninguna esté quemada?`, steps: [R`$\frac{\binom30\binom72}{\binom{10}2} = \frac{21}{45} \approx 0{,}467$.`] }],
      tips: [R`La geométrica «no tiene memoria»: si ya fallaste 10 veces, la cantidad de intentos que faltan tiene la misma distribución que al principio (igual que la [[pe-uniforme-exponencial|exponencial]]).`],
      see: ["pe-binomial", "pe-combinatoria"]
    }
  };

  E.extendCourse("m105", {
    concepts: { "pe-va-discreta": { name: "Variables discretas, esperanza y varianza" }, "pe-binomial": { name: "Binomial" }, "pe-poisson": { name: "Poisson" }, "pe-otras-discretas": { name: "Hipergeométrica y geométrica" } },
    templates: T,
    units: [{
      id: "pe-discretas-u", order: 3, program: "Unidad 3", title: "Variables aleatorias discretas", icon: "sigma",
      diagnostic: ["pe-esperanza-num", "pe-binomial-num", "pe-poisson-num"],
      lessons: [
        { id: "pe-disc-l1", title: "Esperanza y varianza", templates: ["pe-esperanza-num", "pe-momentos-tf"], theory: ["pe-va-discreta"],
          intro: R`$E(X) = \sum x_ip_i$: el promedio a la larga.` },
        { id: "pe-disc-l2", title: "Binomial y Poisson", templates: ["pe-binomial-num", "pe-poisson-num"], theory: ["pe-binomial", "pe-poisson"],
          intro: R`$n$ ensayos independientes, o eventos raros en un intervalo.` },
        { id: "pe-disc-l3", title: "Sin reposición y hasta el primer éxito", templates: ["pe-hiper-num", "pe-dist-match"], theory: ["pe-otras-discretas"],
          intro: R`La hipergeométrica es la binomial sin devolver; la geométrica cuenta la espera.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 4 · VARIABLES ALEATORIAS CONTINUAS
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, S = E.pye, nf = S.nf;
  const T = {};
  const npdf = (x, mu, sg) => Math.exp(-(((x - mu) / sg) ** 2) / 2) / (sg * Math.sqrt(2 * Math.PI));

  T["pe-densidad-num"] = {
    type: "numeric", concepts: ["pe-va-continua"], difficulty: 2,
    generate(r) {
      const k = r.int(1, 3), a = r.int(1, 4), ask = r.pick(["c", "prob", "media", "mediana"]), b = a * r.pick([0.25, 0.5, 0.75]);
      const c = (k + 1) / a ** (k + 1), F = x => (x / a) ** (k + 1);
      const ans = { c, prob: F(b), media: (k + 1) * a / (k + 2), mediana: a * 2 ** (-1 / (k + 1)) }[ask];
      const xk = k === 1 ? "x" : `x^${k}`;
      return {
        prompt: `La variable $X$ tiene densidad $f(x) = c\\,${xk}$ para $0 \\le x \\le ${a}$ (y $0$ fuera de ese intervalo). ${{ c: "¿Cuánto vale $c$?", prob: `Calculá $P(X \\le ${nf(b)})$.`, media: "Calculá $E(X)$.", mediana: "Calculá la mediana de $X$." }[ask]}`,
        answer: ans,
        solution: [`Para que sea una [[pe-va-continua|densidad]], el área total es $1$: $\\int_0^{${a}} c\\,${xk}\\,dx = c\\frac{${a}^{${k + 1}}}{${k + 1}} = 1$, así que $c = ${H.frac(k + 1, a ** (k + 1))}$.`,
          ...(ask === "prob" ? [`$P(X \\le ${nf(b)}) = \\int_0^{${nf(b)}} f = \\left(\\frac{${nf(b)}}{${a}}\\right)^{${k + 1}} \\approx ${nf(ans)}$.`] : []),
          ...(ask === "media" ? [`$E(X) = \\int_0^{${a}} x f(x)\\,dx = c\\frac{${a}^{${k + 2}}}{${k + 2}} = \\frac{${k + 1}\\cdot${a}}{${k + 2}} \\approx ${nf(ans)}$.`] : []),
          ...(ask === "mediana" ? [`$F(x) = \\left(\\frac x{${a}}\\right)^{${k + 1}}$; la mediana cumple $F(m) = \\frac12$: $m = ${a}\\cdot 2^{-1/${k + 1}} \\approx ${nf(ans)}$.`] : [])],
        // otro camino: integración numérica de la densidad (Simpson)
        verify: { kind: "zero", tol: 1e-8, fn: x => {
          const f = t => (ask === "c" ? x : c) * t ** k;
          if (ask === "c") return [S.simpson(f, 0, a) - 1];
          if (ask === "prob") return [S.simpson(f, 0, b) - x];
          if (ask === "media") return [S.simpson(t => t * f(t), 0, a) - x];
          return [S.simpson(f, 0, x) - 0.5];
        } }
      };
    }
  };

  T["pe-exponencial-num"] = {
    type: "numeric", concepts: ["pe-uniforme-exponencial"], difficulty: 2,
    generate(r) {
      const mean = r.pick([2, 4, 5, 8, 10, 20]), lam = 1 / mean, ask = r.pick(["mayor", "entre", "mediana", "memoria"]), t = r.pick([1, 2, 3, 5]) * mean / 2, s = r.pick([1, 2, 4]) * mean / 2;
      const ans = { mayor: Math.exp(-lam * t), entre: Math.exp(-lam * s) - Math.exp(-lam * (s + t)), mediana: Math.log(2) * mean, memoria: Math.exp(-lam * t) }[ask];
      const q = { mayor: `que dure más de $${nf(t)}$ años`, entre: `que dure entre $${nf(s)}$ y $${nf(s + t)}$ años`, mediana: "", memoria: `que dure más de $${nf(s + t)}$ años, sabiendo que ya duró $${nf(s)}$` }[ask];
      return {
        prompt: `La duración (en años) de un componente es exponencial con media $${mean}$ años. ${ask === "mediana" ? "¿Cuál es la mediana de la duración?" : `¿Cuál es la probabilidad de ${q}?`}`,
        answer: ans,
        solution: [`[[pe-uniforme-exponencial|Exponencial]] con $\\lambda = \\frac{1}{${mean}}$: $P(X > x) = e^{-\\lambda x}$.`,
          { mayor: `$P(X > ${nf(t)}) = e^{-${nf(t)}/${mean}} \\approx ${nf(ans)}$.`, entre: `$P(${nf(s)} < X < ${nf(s + t)}) = e^{-${nf(s)}/${mean}} - e^{-${nf(s + t)}/${mean}} \\approx ${nf(ans)}$.`, mediana: `$P(X > m) = \\frac12 \\Rightarrow m = ${mean}\\ln 2 \\approx ${nf(ans)}$ años (menor que la media: la distribución es asimétrica a la derecha).`, memoria: `Por la falta de memoria, $P(X > ${nf(s + t)} \\mid X > ${nf(s)}) = P(X > ${nf(t)}) = e^{-${nf(t)}/${mean}} \\approx ${nf(ans)}$.` }[ask]],
        // otro camino: integración numérica de la densidad λe^(−λx)
        verify: { kind: "zero", tol: 1e-8, fn: x => {
          const f = u => lam * Math.exp(-lam * u), tail = a0 => S.simpson(f, a0, a0 + 60 * mean, 6000);
          if (ask === "mayor") return [tail(t) - x];
          if (ask === "entre") return [S.simpson(f, s, s + t) - x];
          if (ask === "mediana") return [S.simpson(f, 0, x) - 0.5];
          return [tail(s + t) / tail(s) - x];
        } }
      };
    }
  };

  T["pe-normal-num"] = {
    type: "numeric", concepts: ["pe-normal"], difficulty: 2,
    generate(r) {
      const [mu, sg, unit, what] = r.pick([[170, 8, "cm", "La altura de los adultos"], [500, 100, "puntos", "El puntaje de un examen"], [12, 0.5, "mm", "El diámetro de unas piezas"], [75, 10, "kg", "El peso de unas bolsas"]]);
      const ask = r.pick(["menor", "mayor", "entre", "percentil"]), z1 = r.pick([-1.5, -1, -0.5, 0.25, 0.8, 1.2, 2]), z2 = z1 + r.pick([0.5, 1, 1.5, 2]), p = r.pick([0.9, 0.95, 0.75, 0.1, 0.25, 0.99]);
      const x1 = mu + z1 * sg, x2 = mu + z2 * sg;
      const ans = { menor: S.Phi(z1), mayor: 1 - S.Phi(z1), entre: S.Phi(z2) - S.Phi(z1), percentil: mu + sg * S.zq(p) }[ask];
      const q = { menor: `¿qué proporción está por debajo de $${nf(x1)}$ ${unit}?`, mayor: `¿qué proporción supera $${nf(x1)}$ ${unit}?`, entre: `¿qué proporción está entre $${nf(x1)}$ y $${nf(x2)}$ ${unit}?`, percentil: `¿qué valor deja por debajo al ${nf(100 * p, 0)} % (el percentil ${nf(100 * p, 0)})?` }[ask];
      return {
        prompt: `${what} es normal con media $${nf(mu)}$ ${unit} y desvío $${nf(sg)}$ ${unit}: ${q}`,
        answer: ans,
        solution: ask === "percentil" ? [`Se busca $z$ con $\\Phi(z) = ${nf(p)}$: $z \\approx ${nf(S.zq(p), 3)}$.`, `[[pe-normal|Desestandarizando]]: $x = \\mu + z\\sigma = ${nf(mu)} ${S.zq(p) < 0 ? "-" : "+"} ${nf(Math.abs(S.zq(p)), 3)}\\cdot${nf(sg)} \\approx ${nf(ans)}$ ${unit}.`]
          : [`[[pe-normal|Estandarizamos]]: $z = \\frac{x - \\mu}{\\sigma}$. $z_1 = \\frac{${nf(x1)} - ${nf(mu)}}{${nf(sg)}} = ${nf(z1)}$${ask === "entre" ? ` y $z_2 = ${nf(z2)}$` : ""}.`,
            { menor: `$P(Z < ${nf(z1)}) = \\Phi(${nf(z1)}) \\approx ${nf(ans)}$.`, mayor: `$P(Z > ${nf(z1)}) = 1 - \\Phi(${nf(z1)}) \\approx ${nf(ans)}$.`, entre: `$\\Phi(${nf(z2)}) - \\Phi(${nf(z1)}) \\approx ${nf(ans)}$.` }[ask]],
        // otro camino: integración numérica de la densidad normal sin estandarizar
        verify: { kind: "zero", tol: 1e-7, fn: x => {
          const cdf = v => 0.5 + S.simpson(u => npdf(u, mu, sg), mu, v, 4000);
          return [ask === "percentil" ? cdf(x) - p : { menor: cdf(x1), mayor: 1 - cdf(x1), entre: cdf(x2) - cdf(x1) }[ask] - x];
        } }
      };
    }
  };

  T["pe-aprox-binomial-num"] = {
    type: "numeric", concepts: ["pe-aprox-normal"], difficulty: 3,
    generate(r) {
      const n = r.pick([40, 50, 60, 80, 100, 150, 200]), p = r.pick([0.3, 0.4, 0.5, 0.6]), mu = n * p, sg = Math.sqrt(n * p * (1 - p)), k = Math.round(mu + r.pick([-1.5, -1, -0.5, 0.5, 1, 1.5]) * sg), ask = r.pick(["le", "ge"]);
      const z = ask === "le" ? (k + 0.5 - mu) / sg : (k - 0.5 - mu) / sg, ans = ask === "le" ? S.Phi(z) : 1 - S.Phi(z);
      return {
        prompt: `Se tira ${n} veces una moneda cargada que sale cara con probabilidad $${nf(p)}$. Usando la aproximación normal con corrección por continuidad, estimá la probabilidad de obtener ${ask === "le" ? "a lo sumo" : "al menos"} ${k} caras.`,
        answer: ans,
        solution: [`$X \\sim \\text{Bin}(${n}, ${nf(p)})$: $\\mu = np = ${nf(mu)}$ y $\\sigma = \\sqrt{np(1-p)} \\approx ${nf(sg)}$. Como $np$ y $n(1-p)$ son grandes, $X$ es [[pe-aprox-normal|aproximadamente normal]].`,
          `Corrección por continuidad: $P(X ${ask === "le" ? `\\le ${k}` : `\\ge ${k}`}) \\approx P\\left(Z ${ask === "le" ? "\\le" : "\\ge"} \\frac{${nf(ask === "le" ? k + 0.5 : k - 0.5)} - ${nf(mu)}}{${nf(sg)}}\\right) = ${ask === "le" ? "" : "1 - "}\\Phi(${nf(z, 3)}) \\approx ${nf(ans)}$.`],
        // otro camino: integración de la densidad normal; además la aproximación queda cerca de la binomial exacta
        verify: { kind: "zero", tol: 1e-7, fn: x => {
          const cdf = v => 0.5 + S.simpson(u => npdf(u, mu, sg), mu, v, 4000), approx = ask === "le" ? cdf(k + 0.5) : 1 - cdf(k - 0.5);
          let exact = 0; for (let j = 0; j <= n; j++) if (ask === "le" ? j <= k : j >= k) exact += S.binpmf(j, n, p);
          return [approx - x, Math.abs(exact - x) < 0.02 ? 0 : 1];
        } }
      };
    }
  };

  T["pe-uniforme-tf"] = {
    type: "tf", concepts: ["pe-uniforme-exponencial"], difficulty: 2,
    generate(r) {
      const a = r.int(0, 10), b = a + r.int(2, 12), kind = r.pick(["media", "var", "prob"]), truth = r.bool(), c = a + (b - a) / 4, d = a + 3 * (b - a) / 4;
      const real = { media: (a + b) / 2, var: (b - a) ** 2 / 12, prob: (d - c) / (b - a) }[kind], wrong = { media: (b - a) / 2, var: (b - a) / 12, prob: (d - c) / (b + a || 1) }[kind];
      if (Math.abs(real - wrong) < 1e-9) return null;
      const claim = truth ? real : wrong;
      const txt = { media: `$E(X) = ${nf(claim)}$`, var: `$Var(X) = ${nf(claim)}$`, prob: `$P(${nf(c)} < X < ${nf(d)}) = ${nf(claim)}$` }[kind];
      return {
        prompt: `<b>Verdadero o falso:</b> si $X$ es uniforme en $[${a}, ${b}]$, entonces ${txt}.`,
        answer: truth,
        explanation: `En la [[pe-uniforme-exponencial|uniforme]] en $[a, b]$: $E(X) = \\frac{a + b}{2}$, $Var(X) = \\frac{(b - a)^2}{12}$ y la probabilidad de un subintervalo es su largo sobre $b - a$. El valor correcto es $${nf(real)}$: es ${truth ? "verdadero" : "falso"}.`,
        solution: [R`La densidad de la uniforme es constante, $\frac{1}{b - a}$, en $[a, b]$.`],
        // otro camino: integración numérica con la densidad constante
        verify: { kind: "truth", fn: () => {
          const f = () => 1 / (b - a), m1 = S.simpson(x => x * f(x), a, b), m2 = S.simpson(x => x * x * f(x), a, b);
          const got = { media: m1, var: m2 - m1 * m1, prob: S.simpson(f, c, d) }[kind];
          return Math.abs(got - claim) < 1e-9;
        } }
      };
    }
  };

  T["pe-normal-order"] = {
    type: "order", concepts: ["pe-normal"], difficulty: 1,
    generate(r) {
      const mu = r.pick([50, 60, 100, 20]), sg = r.pick([4, 5, 10, 2]), z1 = r.pick([-2, -1.5, -1, -0.5]), z2 = r.pick([0.5, 1, 1.5, 2]), x1 = mu + z1 * sg, x2 = mu + z2 * sg, ans = S.Phi(z2) - S.Phi(z1);
      return {
        prompt: `Ordená los pasos para calcular $P(${nf(x1)} < X < ${nf(x2)})$ si $X \\sim N(${mu}, ${sg}^2)$.`,
        steps: [`[[pe-normal|Estandarizar]] los extremos: $z_1 = \\frac{${nf(x1)} - ${mu}}{${sg}} = ${nf(z1)}$ y $z_2 = \\frac{${nf(x2)} - ${mu}}{${sg}} = ${nf(z2)}$.`,
          `Escribir la probabilidad con $Z \\sim N(0, 1)$: $P(${nf(z1)} < Z < ${nf(z2)})$.`,
          `Buscar en la tabla $\\Phi(${nf(z2)}) \\approx ${nf(S.Phi(z2))}$ y $\\Phi(${nf(z1)}) = 1 - \\Phi(${nf(-z1)}) \\approx ${nf(S.Phi(z1))}$ (por simetría).`,
          `Restar: $\\Phi(${nf(z2)}) - \\Phi(${nf(z1)}) \\approx ${nf(ans)}$.`],
        solution: [R`La tabla solo tiene la normal estándar, así que primero se estandariza; después se usa $P(a < Z < b) = \Phi(b) - \Phi(a)$.`],
        verify: { kind: "truth", target: true, fn: () => Math.abs(S.PhiNum(z2) - S.PhiNum(z1) - ans) < 1e-9 }
      };
    }
  };

  T["pe-memoria-num"] = {
    type: "numeric", concepts: ["pe-uniforme-exponencial"], difficulty: 2,
    generate(r) {
      const ask = r.pick(["mediana", "percentil", "memoria", "uniforme"]);
      if (ask === "uniforme") {
        const a = r.int(0, 20), b = a + r.int(10, 60), d = r.int(a + 1, b - 4), c = r.int(d + 1, b - 1), ans = (b - c) / (b - d);
        return {
          prompt: `Un colectivo pasa en un momento uniforme entre los minutos ${a} y ${b}. Si a los ${d} minutos todavía no pasó, ¿cuál es la probabilidad de que pase después del minuto ${c}?`,
          answer: ans,
          solution: [`$P(X > ${c} \\mid X > ${d}) = \\frac{P(X > ${c})}{P(X > ${d})}$, porque $\\{X > ${c}\\} \\subseteq \\{X > ${d}\\}$ ([[pe-condicional|condicional]]).`,
            `Con la [[pe-uniforme-exponencial|uniforme]], $P(X > t) = \\frac{${b} - t}{${b - a}}$: queda $\\frac{${b - c}}{${b - d}} \\approx ${nf(ans)}$. Dado que no pasó, el tiempo que falta es uniforme en el tramo que queda: la uniforme sí «recuerda».`],
          // otro camino: las colas integrando la densidad con Simpson
          verify: { kind: "value", tol: 1e-9, fn: () => S.simpson(() => 1 / (b - a), c, b, 200) / S.simpson(() => 1 / (b - a), d, b, 200) }
        };
      }
      const mu = r.pick([2, 4, 5, 8, 10, 20, 50, 100, 1000]), lam = 1 / mu, unit = mu >= 50 ? "horas" : "minutos", p = r.pick([0.1, 0.25, 0.75, 0.9, 0.95]), s = Math.round(mu * r.pick([0.5, 1, 2, 3])), t = Math.round(mu * r.pick([0.5, 1, 1.5, 2]));
      const ans = ask === "mediana" ? mu * Math.LN2 : ask === "percentil" ? -mu * Math.log(1 - p) : Math.exp(-t / mu);
      const what = unit === "horas" ? "La duración de un componente" : "El tiempo hasta el próximo llamado a una central";
      return {
        prompt: ask === "mediana" ? `${what} es exponencial con media ${mu} ${unit}. Calculá su mediana (en ${unit}).`
          : ask === "percentil" ? `${what} es exponencial con media ${mu} ${unit}. ¿Qué valor (en ${unit}) deja por debajo el ${nf(100 * p, 0)} % de los casos?`
            : unit === "horas" ? `${what} es exponencial con media ${mu} horas. Si ya funcionó ${s} horas, ¿cuál es la probabilidad de que dure más de ${s + t} horas en total?`
              : `${what} es exponencial con media ${mu} minutos. Si ya pasaron ${s} minutos sin llamados, ¿cuál es la probabilidad de tener que esperar más de ${s + t} minutos en total?`,
        answer: ans,
        solution: ask === "memoria" ? [`$\\lambda = \\frac1{${mu}}$. Por la [[pe-uniforme-exponencial|falta de memoria]], $P(X > ${s} + ${t} \\mid X > ${s}) = P(X > ${t}) = e^{-${t}/${mu}} \\approx ${nf(ans)}$: lo que ya pasó no cambia nada.`]
          : [`La [[pe-uniforme-exponencial|exponencial]] tiene $P(X \\le x) = 1 - e^{-\\lambda x}$, con $\\lambda = \\frac1{${mu}}$.`,
            ask === "mediana" ? `La mediana cumple $1 - e^{-\\lambda m} = \\frac12$: $m = \\frac{\\ln 2}{\\lambda} = ${mu}\\ln 2 \\approx ${nf(ans)}$ ${unit}, menor que la media.`
              : `Se despeja $1 - e^{-\\lambda x} = ${nf(p)}$: $x = -\\frac{\\ln(1 - ${nf(p)})}{\\lambda} = -${mu}\\ln ${nf(1 - p)} \\approx ${nf(ans)}$ ${unit}.`],
        // otro camino: la función de distribución integrando la densidad con Simpson (y el cuantil por bisección)
        verify: { kind: "value", tol: 1e-6, fn: () => {
          const F = x => S.simpson(u => lam * Math.exp(-lam * u), 0, x, 400);
          if (ask === "memoria") return (1 - F(s + t)) / (1 - F(s));
          return S.quantile(F, ask === "mediana" ? 0.5 : p, 0, 10 * mu, 80);
        } }
      };
    }
  };

  const cards = {
    "pe-va-continua": {
      title: "Variables aleatorias continuas", aliases: ["variable aleatoria continua", "función de densidad", "densidad de probabilidad", "percentil", "cuantil"], concepts: ["pe-va-continua"],
      summary: "Una variable continua tiene densidad f ≥ 0 con área total 1: P(a < X < b) = ∫ₐᵇ f. F(x) = P(X ≤ x) y F′ = f. E(X) = ∫ x f(x) dx; Var(X) = E(X²) − E(X)².",
      def: [R`$X$ es **continua** si existe una **densidad** $f \ge 0$ con $\int_{-\infty}^{\infty} f = 1$ y $P(a \le X \le b) = \int_a^b f(x)\,dx$ para todo $a \le b$.`,
        R`**Distribución:** $F(x) = P(X \le x) = \int_{-\infty}^x f(t)\,dt$. **Esperanza:** $E(X) = \int x f(x)\,dx$; **varianza:** $Var(X) = \int (x - \mu)^2f(x)\,dx = E(X^2) - \mu^2$ (las mismas propiedades que en el caso [[pe-va-discreta|discreto]]).`,
        R`**Percentil $p$:** el valor $x_p$ con $F(x_p) = p$. La mediana es el percentil $0{,}5$.`],
      idea: [R`La densidad no es una probabilidad: es «probabilidad por unidad de longitud». La probabilidad es el área bajo la curva, como la masa de una varilla con densidad variable.`],
      demo: [R`**Paso 1 (un punto no tiene probabilidad).** $P(X = a) \le P(a \le X \le a + h) = \int_a^{a + h} f$ para todo $h > 0$, y esa integral tiende a $0$ cuando $h \to 0$. Por eso, en las continuas, da lo mismo $<$ que $\le$.`,
        R`**Paso 2 (con F).** $\{X \le b\}$ es la unión disjunta de $\{X \le a\}$ y $\{a < X \le b\}$, así que $P(a < X \le b) = F(b) - F(a)$.`,
        R`**Paso 3 (F′ = f).** Como $F(x) = \int_{-\infty}^x f$, por el teorema fundamental del cálculo $F'(x) = f(x)$ donde $f$ es continua. $\blacksquare$`],
      examples: [{ q: R`$f(x) = 2x$ en $[0, 1]$. ¿$P(X \le 0{,}5)$ y $E(X)$?`, steps: [R`$F(x) = x^2$, así que $P(X \le 0{,}5) = 0{,}25$.`, R`$E(X) = \int_0^1 2x^2\,dx = \frac23$.`] }],
      tips: [R`Para hallar la constante de una densidad, se impone que el área total sea $1$.`],
      see: ["pe-va-discreta", "pe-uniforme-exponencial", "pe-normal"]
    },
    "pe-uniforme-exponencial": {
      title: "Distribuciones uniforme y exponencial", aliases: ["distribución uniforme", "uniforme continua", "distribución exponencial", "falta de memoria"], concepts: ["pe-uniforme-exponencial"],
      summary: "Uniforme en [a, b]: f = 1/(b − a), E = (a + b)/2, Var = (b − a)²/12. Exponencial(λ): f = λe^(−λx), P(X > x) = e^(−λx), E = 1/λ, sin memoria.",
      def: [R`**Uniforme** en $[a, b]$: $f(x) = \frac{1}{b - a}$ en $[a, b]$. $E(X) = \frac{a + b}{2}$, $Var(X) = \frac{(b - a)^2}{12}$.`,
        R`**Exponencial** de parámetro $\lambda > 0$: $f(x) = \lambda e^{-\lambda x}$ para $x \ge 0$. $P(X > x) = e^{-\lambda x}$, $E(X) = \frac1\lambda$, $Var(X) = \frac1{\lambda^2}$. Modela tiempos de espera en un [[pe-poisson|proceso de Poisson]].`,
        R`**Falta de memoria:** $P(X > s + t \mid X > s) = P(X > t)$.`],
      idea: [R`La exponencial es el tiempo hasta el próximo evento cuando los eventos llegan al azar con tasa $\lambda$. Como la tasa es la misma en todo momento, haber esperado ya no cambia nada: el componente «no envejece».`],
      demo: [R`**Paso 1 (uniforme).** $E(X) = \int_a^b \frac{x}{b - a}dx = \frac{b^2 - a^2}{2(b - a)} = \frac{a + b}{2}$. Además $E(X^2) = \frac{b^3 - a^3}{3(b - a)} = \frac{a^2 + ab + b^2}{3}$, y restando $\left(\frac{a + b}{2}\right)^2$ queda $\frac{(b - a)^2}{12}$.`,
        R`**Paso 2 (cola de la exponencial).** $P(X > x) = \int_x^\infty \lambda e^{-\lambda t}dt = \left[-e^{-\lambda t}\right]_x^\infty = e^{-\lambda x}$.`,
        R`**Paso 3 (sin memoria).** $P(X > s + t\mid X > s) = \frac{P(X > s + t)}{P(X > s)}$, porque $\{X > s + t\} \subseteq \{X > s\}$. Eso es $\frac{e^{-\lambda(s + t)}}{e^{-\lambda s}} = e^{-\lambda t} = P(X > t)$.`,
        R`**Paso 4 (media).** Por partes, $E(X) = \int_0^\infty x\lambda e^{-\lambda x}dx = \left[-xe^{-\lambda x}\right]_0^\infty + \int_0^\infty e^{-\lambda x}dx = 0 + \frac1\lambda$. $\blacksquare$`],
      examples: [{ q: R`Una lámpara dura en promedio 1000 h (exponencial). ¿Probabilidad de que dure más de 2000 h?`, steps: [R`$\lambda = \frac{1}{1000}$; $P(X > 2000) = e^{-2} \approx 0{,}135$.`] }],
      tips: [R`En la exponencial la mediana, $\frac{\ln 2}{\lambda}$, es menor que la media: la distribución tiene una cola larga a la derecha.`],
      see: ["pe-va-continua", "pe-poisson"]
    },
    "pe-normal": {
      title: "Distribución normal", aliases: ["distribución normal", "normal estándar", "estandarización", "estandarizar", "puntaje z", "regla 68-95-99,7"], concepts: ["pe-normal"],
      summary: "N(μ, σ²) tiene la campana f(x) = e^(−(x − μ)²/(2σ²))/(σ√(2π)). Si X ~ N(μ, σ²), Z = (X − μ)/σ ~ N(0, 1) y P(X ≤ x) = Φ((x − μ)/σ). Φ(−z) = 1 − Φ(z).",
      def: [R`$X \sim N(\mu, \sigma^2)$ si su densidad es $$f(x) = \frac{1}{\sigma\sqrt{2\pi}}e^{-\frac{(x - \mu)^2}{2\sigma^2}}.$$ Es la [[f1-estadistica|campana de Gauss]], simétrica respecto de $\mu$, con puntos de inflexión en $\mu \pm \sigma$.`,
        R`**Normal estándar:** $Z \sim N(0, 1)$, con distribución $\Phi(z) = P(Z \le z)$, que está tabulada.`,
        R`**Estandarización:** $Z = \frac{X - \mu}{\sigma}$. **Regla 68-95-99,7:** entre $\mu \pm \sigma$ cae cerca del $68\,\%$; entre $\mu \pm 2\sigma$, del $95\,\%$; entre $\mu \pm 3\sigma$, del $99{,}7\,\%$.`],
      idea: [R`La normal aparece cada vez que algo es la suma de muchos efectos chicos e independientes (errores de medición, alturas): es lo que dice el [[pe-tcl|teorema central del límite]].`,
        R`Todas las normales son la misma curva, corrida y estirada: por eso alcanza con una sola tabla, la de $Z$.`],
      demo: [R`**Paso 1.** Sea $Z = \frac{X - \mu}{\sigma}$, con $\sigma > 0$. Entonces $P(Z \le z) = P(X \le \mu + \sigma z) = \int_{-\infty}^{\mu + \sigma z}\frac{1}{\sigma\sqrt{2\pi}}e^{-\frac{(x - \mu)^2}{2\sigma^2}}dx$.`,
        R`**Paso 2.** Con el cambio de variable $u = \frac{x - \mu}{\sigma}$, $dx = \sigma\,du$, y los límites pasan a $-\infty$ y $z$: la integral queda $\int_{-\infty}^{z}\frac{1}{\sqrt{2\pi}}e^{-u^2/2}du = \Phi(z)$. Entonces $Z \sim N(0, 1)$.`,
        R`**Paso 3 (simetría).** La densidad de $Z$ es par, así que el área a la izquierda de $-z$ es igual al área a la derecha de $z$: $\Phi(-z) = 1 - \Phi(z)$. $\blacksquare$`],
      examples: [{ q: R`Alturas $N(170, 8^2)$. ¿Proporción por encima de 186 cm?`, steps: [R`$z = \frac{186 - 170}{8} = 2$.`, R`$P(Z > 2) = 1 - \Phi(2) \approx 0{,}0228$.`] }],
      tips: [R`Ojo: $N(\mu, \sigma^2)$ lleva la **varianza**. Para estandarizar se divide por el desvío $\sigma$, no por $\sigma^2$.`],
      see: ["pe-va-continua", "pe-aprox-normal", "pe-tcl"]
    },
    "pe-aprox-normal": {
      title: "Aproximación normal a la binomial", aliases: ["aproximación normal a la binomial", "aproximación normal", "corrección por continuidad"], concepts: ["pe-aprox-normal"],
      summary: "Si np y n(1 − p) son mayores que 5, Bin(n, p) ≈ N(np, np(1 − p)). Con corrección por continuidad: P(X ≤ k) ≈ Φ((k + 0,5 − np)/√(np(1 − p))).",
      def: [R`Si $X \sim \text{Bin}(n, p)$ con $np \ge 5$ y $n(1 - p) \ge 5$ (regla práctica), $X$ es aproximadamente $N\big(np,\ np(1 - p)\big)$.`,
        R`**Corrección por continuidad:** cada valor entero $k$ se reemplaza por el intervalo $[k - 0{,}5,\ k + 0{,}5]$. Así $P(X \le k) \approx \Phi\left(\frac{k + 0{,}5 - np}{\sqrt{np(1 - p)}}\right)$ y $P(X \ge k) \approx 1 - \Phi\left(\frac{k - 0{,}5 - np}{\sqrt{np(1 - p)}}\right)$.`],
      idea: [R`La binomial es una suma de $n$ Bernoulli independientes; por el [[pe-tcl|teorema central del límite]], con $n$ grande la suma tiene forma de campana. La corrección por continuidad aparece porque la binomial tiene «barras» de ancho $1$ centradas en los enteros, y la normal reparte el área de cada barra en ese intervalo.`],
      demo: [R`**Paso 1 (de dónde sale).** $X = X_1 + \dots + X_n$ con $X_i$ Bernoulli independientes, cada una con media $p$ y varianza $p(1 - p)$ ([[pe-binomial]]). Por el TCL, $\frac{X - np}{\sqrt{np(1-p)}}$ es aproximadamente $N(0, 1)$ cuando $n$ es grande.`,
        R`**Paso 2 (la corrección).** El histograma de la binomial tiene un rectángulo de base $[k - \frac12, k + \frac12]$ y altura $P(X = k)$ por cada entero $k$. Entonces $P(X \le k)$ es el área de los rectángulos hasta el que termina en $k + \frac12$, y la curva normal que los aproxima hay que integrarla hasta $k + \frac12$, no hasta $k$.`,
        R`**Paso 3.** Estandarizando ese extremo queda la fórmula. La condición $np, n(1-p) \ge 5$ asegura que la campana no quede pegada a $0$ o a $n$, donde la binomial es muy asimétrica. $\blacksquare$`],
      examples: [{ q: R`100 tiradas de una moneda: ¿probabilidad de a lo sumo 55 caras?`, steps: [R`$\mu = 50$, $\sigma = 5$; $z = \frac{55{,}5 - 50}{5} = 1{,}1$.`, R`$\Phi(1{,}1) \approx 0{,}864$ (la binomial exacta da $0{,}8644$).`] }],
      tips: [R`«Menos de $k$» es $X \le k - 1$: el extremo corregido es $k - 0{,}5$.`],
      see: ["pe-binomial", "pe-normal", "pe-tcl"]
    }
  };

  E.extendCourse("m105", {
    concepts: { "pe-va-continua": { name: "Variables continuas y densidades" }, "pe-uniforme-exponencial": { name: "Uniforme y exponencial" }, "pe-normal": { name: "Normal" }, "pe-aprox-normal": { name: "Aproximación normal" } },
    templates: T,
    units: [{
      id: "pe-continuas-u", order: 4, program: "Unidad 4", title: "Variables aleatorias continuas", icon: "target",
      diagnostic: ["pe-densidad-num", "pe-exponencial-num", "pe-normal-num"],
      lessons: [
        { id: "pe-cont-l1", title: "Densidades", templates: ["pe-densidad-num", "pe-uniforme-tf"], theory: ["pe-va-continua"],
          intro: R`La probabilidad es un área: $P(a < X < b) = \int_a^b f$.` },
        { id: "pe-cont-l2", title: "Uniforme y exponencial", templates: ["pe-exponencial-num", "pe-memoria-num"], theory: ["pe-uniforme-exponencial"],
          intro: R`La exponencial no tiene memoria: $P(X > s + t\mid X > s) = P(X > t)$.` },
        { id: "pe-cont-l3", title: "La normal", templates: ["pe-normal-num", "pe-normal-order", "pe-aprox-binomial-num"], theory: ["pe-normal", "pe-aprox-normal"],
          intro: R`Estandarizar: $Z = \frac{X - \mu}{\sigma}$, y todas las normales son la misma.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 5 · VARIABLES CONJUNTAS Y DISTRIBUCIONES MUESTRALES
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, S = E.pye, nf = S.nf;
  const T = {};
  // tabla conjunta en vigésimos: filas = valores de X, columnas = valores de Y
  const jointTable = r => { for (;;) { const c = [0, 1].map(() => [0, 1, 2].map(() => r.int(0, 6))); if (c.flat().reduce((a, b) => a + b, 0) === 20 && c.flat().filter(x => x > 0).length >= 4) return c.map(row => row.map(x => x / 20)); } };
  const tabTex = (xs, ys, P) => `\\begin{array}{c|ccc} & ${ys.map(y => `Y = ${y}`).join(" & ")} \\\\ \\hline ${P.map((row, i) => `X = ${xs[i]} & ${row.map(p => nf(p, 2)).join(" & ")}`).join(R` \\ `)} \\end{array}`;

  T["pe-conjunta-num"] = {
    type: "numeric", concepts: ["pe-conjuntas"], difficulty: 3,
    generate(r) {
      const xs = r.distinct(2, 0, 3).sort((a, b) => a - b), ys = r.distinct(3, 0, 4).sort((a, b) => a - b), P = jointTable(r), ask = r.pick(["marg", "EXY", "cov", "varsum"]);
      const px = P.map(row => row.reduce((a, b) => a + b, 0)), py = [0, 1, 2].map(j => P[0][j] + P[1][j]);
      const EX = xs.reduce((s, x, i) => s + x * px[i], 0), EY = ys.reduce((s, y, j) => s + y * py[j], 0);
      const EXY = P.reduce((s, row, i) => s + row.reduce((t, p, j) => t + xs[i] * ys[j] * p, 0), 0), cov = EXY - EX * EY;
      const VX = xs.reduce((s, x, i) => s + x * x * px[i], 0) - EX * EX, VY = ys.reduce((s, y, j) => s + y * y * py[j], 0) - EY * EY;
      const jy = r.int(0, 2), ans = { marg: py[jy], EXY, cov, varsum: VX + VY + 2 * cov }[ask];
      const q = { marg: `P(Y = ${ys[jy]})`, EXY: "E(XY)", cov: "Cov(X, Y)", varsum: "Var(X + Y)" }[ask];
      return {
        prompt: `La distribución conjunta de $X$ e $Y$ es $$${tabTex(xs, ys, P)}$$ Calculá $${q}$.`,
        answer: ans,
        solution: [`Marginales: $P(X = ${xs[0]}) = ${nf(px[0], 2)}$, $P(X = ${xs[1]}) = ${nf(px[1], 2)}$; $P(Y = y)$: $${py.map(p => nf(p, 2)).join(";\\ ")}$ (se suma cada columna).`,
          ...(ask === "marg" ? [] : [`$E(X) = ${nf(EX)}$, $E(Y) = ${nf(EY)}$ y $E(XY) = \\sum x_iy_jp_{ij} = ${nf(EXY)}$.`]),
          ...(ask === "cov" || ask === "varsum" ? [`[[pe-conjuntas|Covarianza]]: $Cov(X, Y) = E(XY) - E(X)E(Y) = ${nf(cov)}$.`] : []),
          ...(ask === "varsum" ? [`$Var(X) = ${nf(VX)}$, $Var(Y) = ${nf(VY)}$ y $Var(X + Y) = Var(X) + Var(Y) + 2Cov(X, Y) = ${nf(ans)}$.`] : [])],
        // otro camino: la distribución de X + Y celda por celda y la covarianza con E[(X − μX)(Y − μY)]
        verify: { kind: "value", tol: 1e-9, fn: () => {
          const cells = []; P.forEach((row, i) => row.forEach((p, j) => cells.push([xs[i], ys[j], p])));
          const mx = cells.reduce((s, c) => s + c[0] * c[2], 0), my = cells.reduce((s, c) => s + c[1] * c[2], 0);
          if (ask === "marg") return cells.filter(c => c[1] === ys[jy]).reduce((s, c) => s + c[2], 0);
          if (ask === "EXY") return cells.reduce((s, c) => s + c[0] * c[1] * c[2], 0);
          if (ask === "cov") return cells.reduce((s, c) => s + (c[0] - mx) * (c[1] - my) * c[2], 0);
          const ms = mx + my; return cells.reduce((s, c) => s + (c[0] + c[1] - ms) ** 2 * c[2], 0);
        } }
      };
    }
  };

  T["pe-indep-va-tf"] = {
    type: "tf", concepts: ["pe-conjuntas"], difficulty: 2,
    generate(r) {
      const xs = [0, 1], ys = [0, 1, 2], indep = r.bool();
      let P;
      if (indep) { const px = r.pick([[0.5, 0.5], [0.4, 0.6], [0.2, 0.8], [0.25, 0.75]]), py = r.pick([[0.2, 0.3, 0.5], [0.1, 0.4, 0.5], [0.25, 0.25, 0.5], [0.4, 0.4, 0.2]]); P = px.map(a => py.map(b => Math.round(a * b * 1000) / 1000)); }
      else P = jointTable(r);
      const px = P.map(row => row.reduce((a, b) => a + b, 0)), py = [0, 1, 2].map(j => P[0][j] + P[1][j]), truth = P.every((row, i) => row.every((p, j) => Math.abs(p - px[i] * py[j]) < 1e-9));
      if (!indep && truth) return null;
      return {
        prompt: `<b>Verdadero o falso:</b> con la distribución conjunta $$${tabTex(xs, ys, P)}$$ las variables $X$ e $Y$ son independientes.`,
        answer: truth,
        explanation: `Son [[pe-conjuntas|independientes]] si $p_{ij} = P(X = x_i)P(Y = y_j)$ en **todas** las celdas. Marginales: $P(X) = (${px.map(p => nf(p, 3)).join(";\\ ")})$ y $P(Y) = (${py.map(p => nf(p, 3)).join(";\\ ")})$. ${truth ? "Todas las celdas cumplen el producto: son independientes." : `Por ejemplo, $p_{11} = ${nf(P[0][0], 3)}$ y $P(X = 0)P(Y = 0) = ${nf(px[0] * py[0], 4)}$: no son independientes.`}`,
        solution: [R`Alcanza con una celda donde no se cumpla el producto para que no sean independientes.`],
        // otro camino: la distribución condicional de Y dado X es la misma para los dos valores de X
        verify: { kind: "truth", fn: () => [0, 1, 2].every(j => Math.abs(P[0][j] / px[0] - P[1][j] / px[1]) < 1e-9) }
      };
    }
  };

  T["pe-tcl-num"] = {
    type: "numeric", concepts: ["pe-tcl"], difficulty: 2,
    generate(r) {
      const [mu, sg, what, unit] = r.pick([[50, 12, "el tiempo de atención de un cliente", "s"], [2, 0.5, "el peso de un paquete", "kg"], [120, 30, "el consumo diario de un hogar", "kWh"], [7, 2, "la nota de un examen", "puntos"]]);
      const n = r.pick([30, 36, 40, 49, 64, 100]), kind = r.pick(["media", "suma"]), z0 = r.pick([-1.5, -1, -0.5, 0.5, 1, 1.5, 2]), se = sg / Math.sqrt(n), up = r.bool();
      // el umbral se redondea y z se recalcula con él
      const cM = kind === "media" ? Math.round((mu + z0 * se) * 100) / 100 : Math.round(n * (mu + z0 * se)) / n, cS = n * cM, z = (cM - mu) / se, ans = up ? 1 - S.Phi(z) : S.Phi(z);
      return {
        prompt: `En una población, ${what} tiene media $${nf(mu)}$ ${unit} y desvío $${nf(sg)}$ ${unit}. Se toma una muestra de ${n}. ¿Cuál es, aproximadamente, la probabilidad de que ${kind === "media" ? `el promedio de la muestra sea ${up ? "mayor" : "menor"} que $${nf(cM)}$ ${unit}` : `el total de la muestra sea ${up ? "mayor" : "menor"} que $${nf(cS)}$ ${unit}`}?`,
        answer: ans,
        solution: [kind === "media" ? `Por el [[pe-tcl|teorema central del límite]], $\\bar X \\approx N\\left(${nf(mu)},\\ \\frac{${nf(sg)}^2}{${n}}\\right)$: su desvío es $\\frac{${nf(sg)}}{\\sqrt{${n}}} = ${nf(se)}$.` : `Por el [[pe-tcl|TCL]], la suma es aproximadamente $N(n\\mu, n\\sigma^2)$: media $${nf(n * mu)}$ y desvío $\\sqrt{${n}}\\cdot${nf(sg)} = ${nf(Math.sqrt(n) * sg)}$.`,
          `$z = ${kind === "media" ? `\\frac{${nf(cM)} - ${nf(mu)}}{${nf(se)}}` : `\\frac{${nf(cS)} - ${nf(n * mu)}}{${nf(Math.sqrt(n) * sg)}}`} \\approx ${nf(z, 3)}$, así que $P \\approx ${up ? "1 - " : ""}\\Phi(${nf(z, 3)}) \\approx ${nf(ans)}$.`],
        // otro camino: integración numérica de la normal con media nμ y desvío √n·σ (o μ y σ/√n)
        verify: { kind: "value", tol: 1e-7, fn: () => {
          const m0 = kind === "media" ? mu : n * mu, s0 = kind === "media" ? se : Math.sqrt(n) * sg, c0 = kind === "media" ? cM : cS;
          const cdf = 0.5 + S.simpson(u => Math.exp(-(((u - m0) / s0) ** 2) / 2) / (s0 * Math.sqrt(2 * Math.PI)), m0, c0, 4000);
          return up ? 1 - cdf : cdf;
        } }
      };
    }
  };

  T["pe-cuantil-num"] = {
    type: "numeric", concepts: ["pe-muestrales"], difficulty: 2,
    generate(r) {
      const dist = r.pick(["z", "t", "chi"]), a = r.pick([0.1, 0.05, 0.025, 0.01, 0.005]), v = r.int(2, 30), low = dist === "chi" && r.bool();
      const ans = dist === "z" ? S.zq(1 - a) : dist === "t" ? S.tq(1 - a, v) : S.chi2q(low ? a : 1 - a, v);
      const name = dist === "z" ? `z_{${nf(a, 3)}}` : dist === "t" ? `t_{${nf(a, 3)};\\,${v}}` : low ? `\\chi^2_{${nf(1 - a, 3)};\\,${v}}` : `\\chi^2_{${nf(a, 3)};\\,${v}}`;
      const desc = dist === "z" ? `la normal estándar` : dist === "t" ? `la $t$ de Student con ${v} grados de libertad` : `la $\\chi^2$ con ${v} grados de libertad`;
      return {
        prompt: `Hallá el valor $${name}$ de ${desc}, es decir, el que deja un área de $${nf(low ? 1 - a : a, 3)}$ a su derecha.`,
        answer: ans,
        solution: [`Se busca $c$ con $P(${dist === "z" ? "Z" : dist === "t" ? "T" : "\\chi^2"} > c) = ${nf(low ? 1 - a : a, 3)}$ (en la tabla o con la función de distribución).`, `$c \\approx ${nf(ans, 3)}$.${dist === "t" ? ` Es un poco mayor que $z_{${nf(a, 3)}} \\approx ${nf(S.zq(1 - a), 3)}$, porque la [[pe-muestrales|t de Student]] tiene colas más pesadas.` : ""}`],
        // otro camino: el área a la izquierda se calcula integrando la densidad (Simpson)
        verify: { kind: "zero", tol: 1e-6, fn: c => [(dist === "z" ? S.PhiNum(c) : dist === "t" ? S.tcdfNum(c, v) : S.chi2cdfNum(c, v)) - (low ? a : 1 - a)] }
      };
    }
  };

  T["pe-media-dados-tf"] = {
    type: "tf", concepts: ["pe-tcl"], difficulty: 2,
    generate(r) {
      const n = r.int(2, 4), kind = r.pick(["var", "media"]), truth = r.bool(), s2 = 35 / 12;
      const real = kind === "var" ? s2 / n : 3.5, wrong = kind === "var" ? r.pick([s2, s2 / (n * n)]) : 3.5 * n;
      const claim = truth ? real : wrong;
      return {
        prompt: `<b>Verdadero o falso:</b> si se tiran ${n} dados y $\\bar X$ es el promedio de los valores, entonces $${kind === "var" ? "Var" : "E"}(\\bar X) = ${nf(claim)}$. (Para un dado, $\\mu = 3{,}5$ y $\\sigma^2 = \\frac{35}{12}$.)`,
        answer: truth,
        explanation: `Para el promedio de $n$ variables independientes con la misma distribución, $E(\\bar X) = \\mu$ y $Var(\\bar X) = \\frac{\\sigma^2}{n}$ ([[pe-tcl]]). Acá ${kind === "var" ? `$Var(\\bar X) = \\frac{35/12}{${n}} \\approx ${nf(real)}$` : "$E(\\bar X) = 3{,}5$"}: es ${truth ? "verdadero" : "falso"}.`,
        solution: [R`Promediar no cambia la media, pero divide la varianza por $n$: por eso los promedios fluctúan menos que los datos.`],
        // otro camino: se recorren las 6ⁿ tiradas y se calcula la media y la varianza del promedio
        verify: { kind: "truth", fn: () => {
          let outs = [[]]; for (let i = 0; i < n; i++) outs = outs.flatMap(o => [1, 2, 3, 4, 5, 6].map(d => o.concat(d)));
          const means = outs.map(o => o.reduce((a, b) => a + b, 0) / n), m = S.mean(means), v = S.mean(means.map(x => (x - m) ** 2));
          return Math.abs((kind === "var" ? v : m) - claim) < 1e-9;
        } }
      };
    }
  };

  T["pe-suma-normales-num"] = {
    type: "numeric", concepts: ["pe-conjuntas"], difficulty: 3,
    generate(r) {
      const kind = r.pick(["encastre", "suma", "desvio"]);
      let mx, sx, my, sy, a, b, c, ctx, wt = "Y - X";
      if (kind === "encastre") {
        // eje X y buje Y: entra si Y − X > 0
        mx = r.int(195, 205) / 10; my = mx + r.int(1, 8) / 10; sx = r.pick([0.1, 0.2, 0.3]); sy = r.pick([0.1, 0.2, 0.3]); a = -1; b = 1; c = 0;
        ctx = `El diámetro de un eje es $X \\sim N(${nf(mx)};\\ ${nf(sx)}^2)$ mm y el del buje donde va es $Y \\sim N(${nf(my)};\\ ${nf(sy)}^2)$ mm, independientes. ¿Cuál es la probabilidad de que el eje entre en el buje ($Y > X$)?`;
      } else {
        mx = r.int(20, 80); sx = r.int(2, 9); my = r.int(20, 80); sy = r.int(2, 9); a = r.pick([1, 2, 3]); b = r.pick([1, -1, 2, -2]);
        const m = a * mx + b * my, sd = Math.sqrt(a * a * sx * sx + b * b * sy * sy);
        wt = `${a === 1 ? "" : a}X ${b < 0 ? "-" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}Y`;
        c = Math.round(m + r.pick([-1.5, -1, -0.5, 0.5, 1, 1.5, 2]) * sd);
        ctx = kind === "desvio" ? `Si $X \\sim N(${mx};\\ ${sx}^2)$ e $Y \\sim N(${my};\\ ${sy}^2)$ son independientes, ¿cuál es el desvío estándar de $W = ${wt}$?`
          : `Si $X \\sim N(${mx};\\ ${sx}^2)$ e $Y \\sim N(${my};\\ ${sy}^2)$ son independientes, calculá $P(${wt} > ${c})$.`;
      }
      const m = a * mx + b * my, v = a * a * sx * sx + b * b * sy * sy, sd = Math.sqrt(v), z = (c - m) / sd, ans = kind === "desvio" ? sd : 1 - S.Phi(z);
      return {
        prompt: ctx,
        answer: ans,
        solution: [`Una [[pe-conjuntas|combinación lineal de normales independientes]] es normal: $W = ${wt}$ tiene media $${kind === "encastre" ? `${nf(my)} - ${nf(mx)}` : `${a === 1 ? "" : `${a}\\cdot`}${mx} ${b < 0 ? "-" : "+"} ${Math.abs(b) === 1 ? "" : `${Math.abs(b)}\\cdot`}${my}`} = ${nf(m)}$ y varianza $${kind === "encastre" ? `${nf(sx)}^2 + ${nf(sy)}^2` : `${a === 1 ? "" : `${a * a}\\cdot`}${sx}^2 + ${b * b === 1 ? "" : `${b * b}\\cdot`}${sy}^2`} = ${nf(v)}$${b < 0 || kind === "encastre" ? " (las varianzas se suman aunque se reste)" : ""}.`,
          kind === "desvio" ? `Desvío: $\\sqrt{${nf(v)}} \\approx ${nf(sd)}$.` : `[[pe-normal|Estandarizando]]: $P(W > ${nf(c)}) = P\\left(Z > \\frac{${nf(c)} ${m < 0 ? "+" : "-"} ${nf(Math.abs(m))}}{${nf(sd)}}\\right) = 1 - \\Phi(${nf(z, 3)}) \\approx ${nf(ans)}$.`],
        // otro camino: convolución, integrando la densidad de X por la probabilidad condicional de Y (Simpson);
        // el desvío, con E(W²) − E(W)² integrando las densidades
        verify: { kind: "value", tol: 1e-6, fn: () => {
          const fx = x => Math.exp(-(((x - mx) / sx) ** 2) / 2) / (sx * Math.sqrt(2 * Math.PI)), fy = y => Math.exp(-(((y - my) / sy) ** 2) / 2) / (sy * Math.sqrt(2 * Math.PI));
          const E1 = (f, mu, s, g) => S.simpson(x => g(x) * f(x), mu - 12 * s, mu + 12 * s, 1200);
          if (kind === "desvio") {
            const ex = E1(fx, mx, sx, x => x), ey = E1(fy, my, sy, y => y), ex2 = E1(fx, mx, sx, x => x * x), ey2 = E1(fy, my, sy, y => y * y);
            return Math.sqrt(a * a * (ex2 - ex * ex) + b * b * (ey2 - ey * ey));
          }
          // P(bY > c − aX) dado X = x: cola de la normal de Y por encima o por debajo de (c − ax)/b
          return E1(fx, mx, sx, x => { const u = (c - a * x) / b; return b > 0 ? 1 - S.Phi((u - my) / sy) : S.Phi((u - my) / sy); });
        } }
      };
    },
    testN: 60
  };

  T["pe-var-muestral-num"] = {
    type: "numeric", concepts: ["pe-muestrales"], difficulty: 3,
    generate(r) {
      const n = r.int(6, 25), sg = r.int(2, 12), f = r.pick([0.5, 0.6, 0.75, 1.25, 1.5, 1.8, 2]), c = Math.round(f * sg * sg * 10) / 10, up = r.bool();
      const q = (n - 1) * c / (sg * sg), F = S.chi2cdf(q, n - 1), ans = up ? 1 - F : F;
      return {
        prompt: `Se toma una muestra de ${n} datos de una población normal con $\\sigma = ${sg}$. ¿Cuál es la probabilidad de que la varianza muestral $S^2$ sea ${up ? "mayor" : "menor"} que $${nf(c)}$?`,
        answer: ans,
        solution: [`En [[pe-muestrales|muestras normales]], $\\frac{(n - 1)S^2}{\\sigma^2} \\sim \\chi^2_{n-1}$.`,
          `$P(S^2 ${up ? ">" : "<"} ${nf(c)}) = P\\left(\\chi^2_{${n - 1}} ${up ? ">" : "<"} \\frac{${n - 1}\\cdot ${nf(c)}}{${sg * sg}}\\right) = P(\\chi^2_{${n - 1}} ${up ? ">" : "<"} ${nf(q, 3)}) \\approx ${nf(ans)}$.`],
        // otro camino: la χ² integrando su densidad con Simpson
        verify: { kind: "value", tol: 1e-6, fn: () => { const G = S.chi2cdfNum(q, n - 1); return up ? 1 - G : G; } }
      };
    }
  };

  const cards = {
    "pe-conjuntas": {
      title: "Variables conjuntas, covarianza e independencia", aliases: ["distribución conjunta", "distribución marginal", "covarianza", "variables independientes", "independencia de variables aleatorias"], concepts: ["pe-conjuntas"],
      summary: "Con la tabla p(x, y): las marginales salen sumando filas o columnas. Cov(X, Y) = E(XY) − E(X)E(Y); Var(X + Y) = Var(X) + Var(Y) + 2Cov(X, Y). Independientes: p(x, y) = p(x)p(y), y entonces Cov = 0.",
      def: [R`**Distribución conjunta** (discreta): $p(x, y) = P(X = x, Y = y)$. **Marginales:** $p_X(x) = \sum_y p(x, y)$ y $p_Y(y) = \sum_x p(x, y)$.`,
        R`**Independencia:** $X$ e $Y$ son independientes si $p(x, y) = p_X(x)\,p_Y(y)$ para todos los pares (en el caso continuo, con las densidades).`,
        R`**Covarianza:** $Cov(X, Y) = E\big[(X - \mu_X)(Y - \mu_Y)\big] = E(XY) - E(X)E(Y)$. **Correlación:** $\rho = \frac{Cov(X, Y)}{\sigma_X\sigma_Y}$, entre $-1$ y $1$ ([[pe-correlacion]]).`,
        R`**Combinaciones de normales:** si $X \sim N(\mu_X, \sigma_X^2)$ e $Y \sim N(\mu_Y, \sigma_Y^2)$ son independientes, $aX + bY \sim N(a\mu_X + b\mu_Y,\ a^2\sigma_X^2 + b^2\sigma_Y^2)$. En particular, la suma de $n$ normales independientes iguales es $N(n\mu, n\sigma^2)$.`],
      idea: [R`La covarianza mide si $X$ e $Y$ tienden a estar a la vez por encima (o por debajo) de sus medias: positiva si suben juntas, negativa si una sube cuando la otra baja.`,
        R`Independencia implica covarianza nula, pero no al revés: $Y = X^2$ con $X$ simétrica tiene $Cov = 0$ aunque $Y$ depende completamente de $X$. La covarianza solo detecta relaciones lineales.`],
      demo: [R`**Paso 1 (fórmula de cálculo).** Desarrollando el producto, $E[(X - \mu_X)(Y - \mu_Y)] = E(XY) - \mu_YE(X) - \mu_XE(Y) + \mu_X\mu_Y$ por linealidad, y como $E(X) = \mu_X$ y $E(Y) = \mu_Y$, queda $E(XY) - \mu_X\mu_Y$.`,
        R`**Paso 2 (varianza de la suma).** $(X + Y) - (\mu_X + \mu_Y) = (X - \mu_X) + (Y - \mu_Y)$. Elevando al cuadrado y tomando esperanza: $Var(X + Y) = Var(X) + Var(Y) + 2Cov(X, Y)$.`,
        R`**Paso 3 (independientes ⇒ covarianza nula).** Si son independientes, $E(XY) = \sum_{x,y} xy\,p_X(x)p_Y(y) = \left(\sum_x xp_X(x)\right)\left(\sum_y yp_Y(y)\right) = E(X)E(Y)$, así que $Cov = 0$ y $Var(X + Y) = Var(X) + Var(Y)$.`,
        R`**Paso 4 (combinación de normales: media y varianza).** Por linealidad, $E(aX + bY) = a\mu_X + b\mu_Y$; por el paso 3 y porque $Var(aX) = a^2Var(X)$, $Var(aX + bY) = a^2\sigma_X^2 + b^2\sigma_Y^2$.`,
        R`**Paso 5 (sigue siendo normal).** Se usa la función generadora de momentos $M_X(t) = E(e^{tX})$, que para la normal vale $e^{\mu t + \sigma^2t^2/2}$ y determina la distribución. Por independencia, $M_{aX + bY}(t) = E(e^{atX})E(e^{btY}) = M_X(at)M_Y(bt)$.`,
        R`**Paso 6.** Multiplicando las dos exponenciales, los exponentes se suman: $M_{aX + bY}(t) = e^{(a\mu_X + b\mu_Y)t + (a^2\sigma_X^2 + b^2\sigma_Y^2)t^2/2}$, que es la de una normal con la media y la varianza del paso 4. $\blacksquare$`],
      examples: [{ q: R`$X$, $Y$ independientes con $Var(X) = 4$ y $Var(Y) = 9$. ¿$Var(2X - Y)$?`, steps: [R`$Var(2X - Y) = 4Var(X) + Var(Y) = 16 + 9 = 25$ (las varianzas siempre se **suman**, aunque se reste).`] },
        { q: R`Un eje mide $X \sim N(20;\ 0{,}2^2)$ mm y su buje $Y \sim N(20{,}5;\ 0{,}3^2)$ mm, independientes. ¿$P(Y > X)$?`, steps: [R`$Y - X \sim N(0{,}5;\ 0{,}04 + 0{,}09)$, con desvío $\sqrt{0{,}13} \approx 0{,}361$.`, R`$P(Y - X > 0) = 1 - \Phi\left(\frac{-0{,}5}{0{,}361}\right) = \Phi(1{,}39) \approx 0{,}917$.`] }],
      tips: [R`$Var(aX + bY) = a^2Var(X) + b^2Var(Y) + 2abCov(X, Y)$.`],
      see: ["pe-va-discreta", "pe-tcl", "pe-correlacion"]
    },
    "pe-tcl": {
      title: "Media muestral y teorema central del límite", aliases: ["teorema central del límite", "TCL", "distribución de la media muestral", "error estándar", "ley de los grandes números"], concepts: ["pe-tcl"],
      summary: "Con n observaciones independientes de media μ y desvío σ: E(X̄) = μ y Var(X̄) = σ²/n. TCL: para n grande, X̄ ≈ N(μ, σ²/n) y la suma ≈ N(nμ, nσ²), sea cual sea la distribución original.",
      def: [R`**Media muestral:** $\bar X = \frac1n(X_1 + \dots + X_n)$, con las $X_i$ independientes y con la misma distribución (media $\mu$, desvío $\sigma$). **Error estándar:** $\frac{\sigma}{\sqrt n}$, el desvío de $\bar X$.`,
        R`**Teorema central del límite:** $\frac{\bar X - \mu}{\sigma/\sqrt n}$ tiende en distribución a $N(0, 1)$ cuando $n \to \infty$. En la práctica, con $n \ge 30$ se usa $\bar X \approx N\left(\mu, \frac{\sigma^2}{n}\right)$. Si la población ya es [[pe-normal|normal]], vale exacto para todo $n$.`,
        R`**Ley de los grandes números:** $\bar X \to \mu$ cuando $n \to \infty$.`],
      idea: [R`Al promediar, los errores para arriba y para abajo se compensan: el promedio se concentra cerca de $\mu$, con un ancho que baja como $\frac{1}{\sqrt n}$ (para la mitad de error hacen falta cuatro veces más datos).`,
        R`Lo sorprendente del TCL es la **forma**: aunque cada dato venga de una distribución rara (un dado, una exponencial), el promedio tiene forma de campana.`],
      demo: [R`**Paso 1 (media).** Por linealidad de la esperanza, $E(\bar X) = \frac1n\sum E(X_i) = \frac1n\cdot n\mu = \mu$.`,
        R`**Paso 2 (varianza).** Las $X_i$ son independientes, así que la varianza de la suma es la suma de las varianzas ([[pe-conjuntas]]): $Var(\sum X_i) = n\sigma^2$.`,
        R`**Paso 3.** Al multiplicar por $\frac1n$, la varianza se multiplica por $\frac1{n^2}$ ([[pe-va-discreta]]): $Var(\bar X) = \frac{n\sigma^2}{n^2} = \frac{\sigma^2}{n}$.`,
        R`**Paso 4 (la forma).** Que la distribución límite sea normal es el contenido del TCL; su prueba usa funciones características y excede el curso. Los pasos 1 a 3 dicen qué normal es: la de media $\mu$ y varianza $\frac{\sigma^2}{n}$. $\blacksquare$`],
      examples: [{ q: R`Tiempos con $\mu = 50$ s y $\sigma = 12$ s; muestra de 36. ¿$P(\bar X > 54)$?`, steps: [R`Error estándar: $\frac{12}{6} = 2$; $z = \frac{54 - 50}{2} = 2$.`, R`$P \approx 1 - \Phi(2) \approx 0{,}023$.`] }],
      tips: [R`No confundas $\sigma$ (desvío de cada dato) con $\frac{\sigma}{\sqrt n}$ (desvío del promedio).`],
      see: ["pe-normal", "pe-aprox-normal", "pe-ic-media"]
    },
    "pe-muestrales": {
      title: "Distribuciones χ², t de Student y F", aliases: ["distribución chi cuadrado", "chi cuadrado", "t de Student", "distribución t", "distribución F", "grados de libertad", "distribuciones muestrales"], concepts: ["pe-muestrales"],
      summary: "χ²ₖ: suma de k normales estándar al cuadrado (media k). t: Z/√(χ²ₖ/k), con colas más pesadas que la normal. F: cociente de χ² divididas por sus grados. En muestras normales, (n − 1)S²/σ² ~ χ²ₙ₋₁ y (X̄ − μ)/(S/√n) ~ tₙ₋₁.",
      def: [R`**Chi cuadrado** con $k$ grados de libertad: $\chi^2_k = Z_1^2 + \dots + Z_k^2$, con $Z_i \sim N(0, 1)$ independientes. Es positiva y asimétrica a la derecha.`,
        R`**t de Student:** $T = \frac{Z}{\sqrt{\chi^2_k/k}}$, con $Z$ y $\chi^2_k$ independientes. Es simétrica, con colas más pesadas que $N(0, 1)$, y se parece cada vez más a ella al crecer $k$.`,
        R`**F de Snedecor:** $F = \frac{\chi^2_{k_1}/k_1}{\chi^2_{k_2}/k_2}$, con las dos independientes.`,
        R`**Teorema (muestras normales):** si $X_1, \dots, X_n$ son $N(\mu, \sigma^2)$ independientes, $\frac{(n - 1)S^2}{\sigma^2} \sim \chi^2_{n-1}$, $\bar X$ y $S^2$ son independientes, y $\frac{\bar X - \mu}{S/\sqrt n} \sim t_{n-1}$. **Notación de tabla:** $t_{\alpha;\,k}$ deja un área $\alpha$ a su derecha.`],
      idea: [R`Cuando no se conoce $\sigma$ hay que estimarla con $S$, y eso agrega incertidumbre: la $t$ es «una normal más ancha», tanto más cuanto menos datos hay.`,
        R`Los grados de libertad cuentan los datos que quedan «libres»: al calcular $S^2$ con los desvíos respecto de $\bar X$ se pierde uno, porque esos desvíos suman cero.`],
      demo: [R`**Paso 1 (media de la χ²).** Si $Z \sim N(0, 1)$, $E(Z^2) = Var(Z) + E(Z)^2 = 1$. Por linealidad, $E(\chi^2_k) = k$.`,
        R`**Paso 2 (de dónde sale la t).** $\frac{\bar X - \mu}{S/\sqrt n} = \frac{(\bar X - \mu)/(\sigma/\sqrt n)}{\sqrt{S^2/\sigma^2}}$. El numerador es $N(0, 1)$ ([[pe-tcl]]) y, por el teorema, $\frac{S^2}{\sigma^2} = \frac{\chi^2_{n-1}}{n - 1}$, independiente del numerador.`,
        R`**Paso 3.** Eso es exactamente la definición de una $t$ con $n - 1$ grados de libertad. (La parte del teorema sobre $S^2$ se prueba con una rotación ortogonal de los datos y se toma como dada.) $\blacksquare$`],
      examples: [{ q: R`Con $n = 10$ y confianza del 95 %, ¿qué valor $t$ se usa?`, steps: [R`$t_{0{,}025;\,9} \approx 2{,}262$ (contra $1{,}96$ de la normal).`] }],
      tips: [R`En la tabla de la $\chi^2$ hay que mirar las dos colas por separado: no es simétrica.`],
      see: ["pe-tcl", "pe-ic-media", "pe-ic-proporcion-varianza"]
    }
  };

  E.extendCourse("m105", {
    concepts: { "pe-conjuntas": { name: "Conjuntas y covarianza" }, "pe-tcl": { name: "Teorema central del límite" }, "pe-muestrales": { name: "χ², t y F" } },
    templates: T,
    units: [{
      id: "pe-muestrales-u", order: 5, program: "Unidad 5", title: "Variables conjuntas y distribuciones muestrales", icon: "grid-3x3",
      diagnostic: ["pe-conjunta-num", "pe-tcl-num", "pe-cuantil-num"],
      lessons: [
        { id: "pe-mues-l1", title: "Distribuciones conjuntas", templates: ["pe-conjunta-num", "pe-indep-va-tf", "pe-suma-normales-num"], theory: ["pe-conjuntas"],
          intro: R`$Var(X + Y) = Var(X) + Var(Y) + 2Cov(X, Y)$.` },
        { id: "pe-mues-l2", title: "Teorema central del límite", templates: ["pe-tcl-num", "pe-media-dados-tf"], theory: ["pe-tcl"],
          intro: R`El promedio de $n$ datos tiene desvío $\frac{\sigma}{\sqrt n}$ y forma de campana.` },
        { id: "pe-mues-l3", title: "χ², t y F", templates: ["pe-cuantil-num", "pe-var-muestral-num"], theory: ["pe-muestrales"],
          intro: R`Sin $\sigma$, la normal se ensancha y pasa a ser una $t$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 6 · ESTIMACIÓN
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, S = E.pye, nf = S.nf;
  const T = {};
  // cuantiles recalculados integrando las densidades (para los verify)
  const zNum = p => S.quantile(S.PhiNum, p, -8, 8, 60), tNum = (p, v) => S.quantile(x => S.tcdfNum(x, v), p, -60, 60, 60), chiNum = (p, k) => S.quantile(x => S.chi2cdfNum(x, k), p, 0, 300, 60);
  const CONF = [0.9, 0.95, 0.99];

  T["pe-ic-media-num"] = {
    type: "numeric", concepts: ["pe-ic-media"], difficulty: 2,
    generate(r) {
      const known = r.bool(), n = known ? r.pick([16, 25, 36, 50, 64]) : r.int(6, 25), conf = r.pick(CONF), a = 1 - conf, xb = r.int(20, 80) + r.int(0, 9) / 10, s = r.int(2, 12) + r.int(0, 9) / 10, ask = r.pick(["inf", "sup", "margen"]);
      const crit = known ? S.zq(1 - a / 2) : S.tq(1 - a / 2, n - 1), E0 = crit * s / Math.sqrt(n), ans = { inf: xb - E0, sup: xb + E0, margen: E0 }[ask];
      const ct = known ? `z_{${nf(a / 2, 3)}}` : `t_{${nf(a / 2, 3)};\\,${n - 1}}`;
      return {
        prompt: `En una muestra de ${n} mediciones se obtuvo $\\bar x = ${nf(xb)}$ ${known ? `y se sabe que la población es normal con $\\sigma = ${nf(s)}$` : `y $s = ${nf(s)}$, de una población normal`}. Para el intervalo de confianza del ${nf(100 * conf, 0)} % para $\\mu$, calculá ${{ inf: "el límite inferior", sup: "el límite superior", margen: "el margen de error (la mitad del ancho)" }[ask]}.`,
        answer: ans,
        solution: [known ? `Con $\\sigma$ conocida, el [[pe-ic-media|intervalo]] es $\\bar x \\pm z_{\\alpha/2}\\frac{\\sigma}{\\sqrt n}$, con $z_{${nf(a / 2, 3)}} \\approx ${nf(crit, 3)}$.` : `Con $\\sigma$ desconocida, se usa la [[pe-muestrales|t de Student]]: $\\bar x \\pm t_{\\alpha/2;\\,n-1}\\frac{s}{\\sqrt n}$, con $${ct} \\approx ${nf(crit, 3)}$.`,
          `Margen: $${nf(crit, 3)}\\cdot\\frac{${nf(s)}}{\\sqrt{${n}}} \\approx ${nf(E0)}$. Intervalo: $(${nf(xb - E0)};\\ ${nf(xb + E0)})$.`],
        // otro camino: el valor crítico integrando la densidad (Simpson) y buscando el cuantil por bisección
        verify: { kind: "value", tol: 1e-6, fn: () => { const c = known ? zNum(1 - a / 2) : tNum(1 - a / 2, n - 1), e = c * s / Math.sqrt(n); return { inf: xb - e, sup: xb + e, margen: e }[ask]; } }
      };
    }
  };

  T["pe-ic-prop-num"] = {
    type: "numeric", concepts: ["pe-ic-proporcion-varianza"], difficulty: 2,
    generate(r) {
      const n = r.pick([100, 150, 200, 300, 400, 500, 1000]), x = Math.round(n * r.pick([0.12, 0.2, 0.35, 0.45, 0.6, 0.72])), conf = r.pick(CONF), a = 1 - conf, ask = r.pick(["inf", "sup", "margen"]);
      const p = x / n, z = S.zq(1 - a / 2), E0 = z * Math.sqrt(p * (1 - p) / n), ans = { inf: p - E0, sup: p + E0, margen: E0 }[ask];
      return {
        prompt: `En una encuesta a ${n} personas, ${x} dijeron que usan bicicleta. Para el intervalo de confianza del ${nf(100 * conf, 0)} % para la proporción poblacional, calculá ${{ inf: "el límite inferior", sup: "el límite superior", margen: "el margen de error" }[ask]}.`,
        answer: ans,
        solution: [`$\\hat p = \\frac{${x}}{${n}} = ${nf(p)}$. Con $n$ grande, $\\hat p$ es aproximadamente normal ([[pe-tcl]]): el [[pe-ic-proporcion-varianza|intervalo]] es $\\hat p \\pm z_{\\alpha/2}\\sqrt{\\frac{\\hat p(1 - \\hat p)}{n}}$.`,
          `$z_{${nf(a / 2, 3)}} \\approx ${nf(z, 3)}$ y el margen es $${nf(z, 3)}\\sqrt{\\frac{${nf(p)}\\cdot${nf(1 - p)}}{${n}}} \\approx ${nf(E0)}$: intervalo $(${nf(p - E0)};\\ ${nf(p + E0)})$.`],
        verify: { kind: "value", tol: 1e-6, fn: () => { const e = zNum(1 - a / 2) * Math.sqrt(p * (1 - p) / n); return { inf: p - e, sup: p + e, margen: e }[ask]; } }
      };
    }
  };

  T["pe-ic-var-num"] = {
    type: "numeric", concepts: ["pe-ic-proporcion-varianza"], difficulty: 3,
    generate(r) {
      const n = r.int(8, 25), s2 = r.int(4, 40) + r.pick([0, 0.5]), conf = r.pick([0.9, 0.95]), a = 1 - conf, kind = r.pick(["bilat-inf", "bilat-sup", "unil", "sigma"]);
      const k = n - 1, chiR = S.chi2q(1 - a / 2, k), chiL = S.chi2q(a / 2, k);
      const ans = { "bilat-inf": k * s2 / chiR, "bilat-sup": k * s2 / chiL, unil: k * s2 / S.chi2q(1 - a, k), sigma: Math.sqrt(k * s2 / chiL) }[kind];
      const q = { "bilat-inf": `el límite inferior del intervalo bilateral del ${nf(100 * conf, 0)} % para $\\sigma^2$`, "bilat-sup": `el límite superior del intervalo bilateral del ${nf(100 * conf, 0)} % para $\\sigma^2$`, unil: `la cota inferior del intervalo unilateral (derecho) del ${nf(100 * conf, 0)} % para $\\sigma^2$, de la forma $(c, \\infty)$`, sigma: `el límite superior del intervalo bilateral del ${nf(100 * conf, 0)} % para el desvío $\\sigma$` }[kind];
      return {
        prompt: `Una muestra de ${n} datos de una población normal tiene varianza $s^2 = ${nf(s2)}$. Calculá ${q}.`,
        answer: ans,
        solution: [`El pivote es $\\frac{(n - 1)S^2}{\\sigma^2} \\sim \\chi^2_{${k}}$ ([[pe-muestrales]]). Despejando $\\sigma^2$ de $\\chi^2_{\\text{izq}} < \\frac{(n-1)s^2}{\\sigma^2} < \\chi^2_{\\text{der}}$ queda el [[pe-ic-proporcion-varianza|intervalo]] $\\left(\\frac{(n-1)s^2}{\\chi^2_{\\text{der}}},\\ \\frac{(n-1)s^2}{\\chi^2_{\\text{izq}}}\\right)$.`,
          kind === "unil" ? `Unilateral derecho: se usa solo la cola derecha, $\\chi^2_{${nf(a, 3)};\\,${k}} \\approx ${nf(S.chi2q(1 - a, k), 3)}$, y la cota es $\\frac{${k}\\cdot${nf(s2)}}{${nf(S.chi2q(1 - a, k), 3)}} \\approx ${nf(ans)}$.`
            : `$\\chi^2_{${nf(a / 2, 3)};\\,${k}} \\approx ${nf(chiR, 3)}$ y $\\chi^2_{${nf(1 - a / 2, 3)};\\,${k}} \\approx ${nf(chiL, 3)}$: $\\sigma^2 \\in (${nf(k * s2 / chiR)};\\ ${nf(k * s2 / chiL)})$${kind === "sigma" ? `, y sacando la raíz, $\\sigma < ${nf(ans)}$` : ""}.`],
        // otro camino: los cuantiles de la χ² integrando su densidad
        verify: { kind: "value", tol: 1e-6, fn: () => ({ "bilat-inf": k * s2 / chiNum(1 - a / 2, k), "bilat-sup": k * s2 / chiNum(a / 2, k), unil: k * s2 / chiNum(1 - a, k), sigma: Math.sqrt(k * s2 / chiNum(a / 2, k)) })[kind] }
      };
    }
  };
  T["pe-ic-var-num"].testN = 80;

  T["pe-tamano-num"] = {
    type: "numeric", concepts: ["pe-ic-media"], difficulty: 2, testN: 80,
    generate(r) {
      const kind = r.pick(["media", "prop"]), conf = r.pick(CONF), a = 1 - conf, z = S.zq(1 - a / 2);
      if (kind === "media") {
        const sg = r.int(3, 20), Em = r.pick([0.5, 1, 1.5, 2, 3]), n = Math.ceil((z * sg / Em) ** 2);
        return { prompt: `Se quiere estimar una media con un error de a lo sumo $${nf(Em)}$ unidades y confianza del ${nf(100 * conf, 0)} %. Si $\\sigma = ${sg}$, ¿cuál es el tamaño mínimo de muestra?`, answer: n,
          solution: [`El [[pe-ic-media|margen]] es $z_{\\alpha/2}\\frac{\\sigma}{\\sqrt n} \\le E$, así que $n \\ge \\left(\\frac{z_{\\alpha/2}\\sigma}{E}\\right)^2 = \\left(\\frac{${nf(z, 3)}\\cdot${sg}}{${nf(Em)}}\\right)^2 \\approx ${nf((z * sg / Em) ** 2, 2)}$.`, `Se redondea **hacia arriba**: $n = ${n}$.`],
          verify: { kind: "truth", target: true, fn: () => { const zz = zNum(1 - a / 2), m = k => zz * sg / Math.sqrt(k); return m(n) <= Em + 1e-9 && m(n - 1) > Em - 1e-9; } } };
      }
      const Ep = r.pick([0.02, 0.03, 0.04, 0.05]), p0 = r.pick([0.5, 0.2, 0.3]), n = Math.ceil(z * z * p0 * (1 - p0) / (Ep * Ep));
      return { prompt: `Se quiere estimar una proporción con un error de a lo sumo $${nf(Ep)}$ y confianza del ${nf(100 * conf, 0)} %${p0 === 0.5 ? ", sin información previa sobre ella" : `, sabiendo por un estudio piloto que está cerca de $${nf(p0)}$`}. ¿Cuál es el tamaño mínimo de muestra?`, answer: n,
        solution: [`$n \\ge \\frac{z_{\\alpha/2}^2\\,p(1 - p)}{E^2}$${p0 === 0.5 ? ", con $p = 0{,}5$, que es el caso más desfavorable (maximiza $p(1-p)$)" : ""}: $\\frac{${nf(z, 3)}^2\\cdot${nf(p0)}\\cdot${nf(1 - p0)}}{${nf(Ep)}^2} \\approx ${nf(z * z * p0 * (1 - p0) / (Ep * Ep), 2)}$.`, `Redondeando hacia arriba, $n = ${n}$ ([[pe-ic-proporcion-varianza]]).`],
        verify: { kind: "truth", target: true, fn: () => { const zz = zNum(1 - a / 2), m = k => zz * Math.sqrt(p0 * (1 - p0) / k); return m(n) <= Ep + 1e-12 && m(n - 1) > Ep - 1e-12; } } };
    }
  };

  T["pe-mv-num"] = {
    type: "numeric", concepts: ["pe-max-verosimilitud"], difficulty: 3,
    generate(r) {
      const kind = r.pick(["expo", "pois", "bern", "var"]);
      let data, ans, ll, lo, hi, txt, sol;
      if (kind === "expo") { data = Array.from({ length: r.int(5, 8) }, () => r.int(1, 20) / 2); ans = 1 / S.mean(data); ll = l => data.reduce((s, x) => s + Math.log(l) - l * x, 0); lo = 1e-4; hi = 10; txt = "exponencial de parámetro $\\lambda$ (tiempos de espera, en minutos)"; sol = `$\\ln L(\\lambda) = n\\ln\\lambda - \\lambda\\sum x_i$; derivando e igualando a cero, $\\hat\\lambda = \\frac{n}{\\sum x_i} = \\frac{1}{\\bar x} = \\frac{1}{${nf(S.mean(data))}} \\approx ${nf(ans)}$.`; }
      else if (kind === "pois") { data = Array.from({ length: r.int(6, 10) }, () => r.int(0, 7)); ans = S.mean(data); if (ans === 0) return null; ll = l => data.reduce((s, x) => s + x * Math.log(l) - l, 0); lo = 1e-4; hi = 20; txt = "Poisson de parámetro $\\lambda$ (llamadas por hora)"; sol = `$\\ln L(\\lambda) = \\left(\\sum x_i\\right)\\ln\\lambda - n\\lambda + \\text{cte}$; derivando, $\\frac{\\sum x_i}{\\lambda} - n = 0$, así que $\\hat\\lambda = \\bar x = ${nf(ans)}$.`; }
      else if (kind === "bern") { data = Array.from({ length: r.int(8, 14) }, () => (r.bool() ? 1 : 0)); ans = S.mean(data); if (ans === 0 || ans === 1) return null; ll = p => data.reduce((s, x) => s + x * Math.log(p) + (1 - x) * Math.log(1 - p), 0); lo = 1e-6; hi = 1 - 1e-6; txt = "Bernoulli de parámetro $p$ (1 = éxito)"; sol = `$\\ln L(p) = k\\ln p + (n - k)\\ln(1 - p)$, con $k = ${data.reduce((a, b) => a + b, 0)}$ éxitos; derivando, $\\frac kp = \\frac{n - k}{1 - p}$, así que $\\hat p = \\frac kn = ${nf(ans)}$.`; }
      else { data = Array.from({ length: r.int(5, 8) }, () => r.int(1, 20)); const m = S.mean(data); ans = data.reduce((s, x) => s + (x - m) ** 2, 0) / data.length; if (ans === 0) return null; ll = v => data.reduce((s, x) => s - 0.5 * Math.log(v) - (x - m) ** 2 / (2 * v), 0); lo = 1e-4; hi = 500; txt = "normal; estimá $\\sigma^2$ por máxima verosimilitud"; sol = `Con $\\hat\\mu = \\bar x = ${nf(m)}$, $\\ln L(\\sigma^2) = -\\frac n2\\ln\\sigma^2 - \\frac{\\sum(x_i - \\bar x)^2}{2\\sigma^2} + \\text{cte}$; derivando, $\\hat\\sigma^2 = \\frac1n\\sum(x_i - \\bar x)^2 \\approx ${nf(ans)}$ (dividido por $n$, no por $n - 1$).`; }
      return {
        prompt: `Los datos $${S.list(data)}$ vienen de una distribución ${txt}. ${kind === "var" ? "" : "¿Cuál es el estimador de máxima verosimilitud del parámetro?"}`,
        answer: ans,
        solution: [`[[pe-max-verosimilitud|Máxima verosimilitud]]: se elige el valor del parámetro que hace más probables los datos observados, maximizando $\\ln L$.`, sol],
        // otro camino: se maximiza numéricamente la log-verosimilitud (sección áurea)
        verify: { kind: "value", tol: 1e-5, fn: () => S.golden(t => -ll(t), lo, hi) }
      };
    }
  };

  T["pe-sesgo-tf"] = {
    type: "tf", concepts: ["pe-estimadores"], difficulty: 2,
    generate(r) {
      const pop = r.distinct(3, 1, 9), div = r.pick(["n-1", "n"]), n = r.pick([2, 3]);
      const mu = S.mean(pop), s2pop = S.mean(pop.map(x => (x - mu) ** 2)), truth = div === "n-1";
      return {
        prompt: `<b>Verdadero o falso:</b> si se toman muestras de tamaño ${n}, con reposición, de la población $\\{${pop.join(",\\ ")}\\}$, el estadístico $\\frac{1}{${div === "n" ? "n" : "n - 1"}}\\sum(X_i - \\bar X)^2$ es un estimador insesgado de la varianza poblacional $\\sigma^2 = ${nf(s2pop)}$.`,
        answer: truth,
        explanation: `Un [[pe-estimadores|estimador es insesgado]] si su esperanza es el parámetro. Se sabe que $E(S^2) = \\sigma^2$ cuando se divide por $n - 1$; dividiendo por $n$ la esperanza es $\\frac{n - 1}{n}\\sigma^2 = ${nf((n - 1) / n * s2pop)}$, que subestima a $\\sigma^2$. Es ${truth ? "verdadero" : "falso"}.`,
        solution: [R`Se puede comprobar listando todas las muestras posibles, que son equiprobables, y promediando el estadístico.`],
        // otro camino: se recorren las 3ⁿ muestras equiprobables y se promedia el estadístico
        verify: { kind: "truth", fn: () => {
          let samples = [[]]; for (let i = 0; i < n; i++) samples = samples.flatMap(s => pop.map(x => s.concat(x)));
          const stat = s => { const m = S.mean(s); return s.reduce((t, x) => t + (x - m) ** 2, 0) / (div === "n" ? n : n - 1); };
          return Math.abs(S.mean(samples.map(stat)) - s2pop) < 1e-9;
        } }
      };
    }
  };

  const cards = {
    "pe-estimadores": {
      title: "Estimadores puntuales y sus propiedades", aliases: ["estimador", "estimador puntual", "estimador insesgado", "sesgo", "error cuadrático medio", "estimador consistente"], concepts: ["pe-estimadores"],
      summary: "Un estimador es un estadístico que se usa para aproximar un parámetro. Es insesgado si su esperanza es el parámetro: X̄ lo es para μ y S² (con n − 1) para σ². Entre dos insesgados se prefiere el de menor varianza.",
      def: [R`**Estimador** de un parámetro $\theta$: un estadístico $\hat\theta = g(X_1, \dots, X_n)$. Su valor en una muestra concreta es la **estimación**.`,
        R`**Sesgo:** $E(\hat\theta) - \theta$; **insesgado** si es $0$. **Error cuadrático medio:** $ECM = E[(\hat\theta - \theta)^2] = Var(\hat\theta) + \text{sesgo}^2$. **Consistente:** si $\hat\theta \to \theta$ cuando $n \to \infty$.`,
        R`**Resultados:** $E(\bar X) = \mu$ y $E(S^2) = \sigma^2$, con $S^2 = \frac{1}{n - 1}\sum (X_i - \bar X)^2$.`],
      idea: [R`Un estimador es una «receta» que se aplica a cualquier muestra. Como la muestra es aleatoria, el resultado también lo es: tiene su propia distribución, y lo que se pide es que esté centrada en el valor verdadero (insesgado) y que sea angosta (poca varianza).`],
      demo: [R`**Paso 1.** Por la [[pe-dispersion|fórmula de cálculo]], $\sum (X_i - \bar X)^2 = \sum X_i^2 - n\bar X^2$.`,
        R`**Paso 2.** Para cada $X_i$, $E(X_i^2) = Var(X_i) + E(X_i)^2 = \sigma^2 + \mu^2$. Para la media, $E(\bar X^2) = Var(\bar X) + \mu^2 = \frac{\sigma^2}{n} + \mu^2$ ([[pe-tcl]]).`,
        R`**Paso 3.** Tomando esperanza en el paso 1: $E\left[\sum (X_i - \bar X)^2\right] = n(\sigma^2 + \mu^2) - n\left(\frac{\sigma^2}{n} + \mu^2\right) = (n - 1)\sigma^2$.`,
        R`**Paso 4.** Dividiendo por $n - 1$, $E(S^2) = \sigma^2$: insesgado. Si se divide por $n$, la esperanza es $\frac{n - 1}{n}\sigma^2$, un poco menor: ese estimador subestima la varianza. $\blacksquare$`],
      examples: [{ q: R`Dos estimadores de $\mu$: $\bar X$ y $X_1$ (solo el primer dato). ¿Cuál conviene?`, steps: [R`Los dos son insesgados, pero $Var(\bar X) = \frac{\sigma^2}{n}$ y $Var(X_1) = \sigma^2$: $\bar X$ es mucho más preciso.`] }],
      tips: [R`El estimador de máxima verosimilitud de $\sigma^2$ en la normal divide por $n$: es sesgado, aunque el sesgo desaparece al crecer $n$.`],
      see: ["pe-max-verosimilitud", "pe-ic-media", "pe-dispersion"]
    },
    "pe-max-verosimilitud": {
      title: "Máxima verosimilitud", aliases: ["máxima verosimilitud", "función de verosimilitud", "estimador de máxima verosimilitud", "log-verosimilitud"], concepts: ["pe-max-verosimilitud"],
      summary: "L(θ) = Π f(xᵢ; θ) mide qué tan probables son los datos con cada θ. El estimador de máxima verosimilitud maximiza L (o ln L). Ejemplos: Poisson y Bernoulli dan x̄, la exponencial da 1/x̄.",
      def: [R`**Verosimilitud** de una muestra $x_1, \dots, x_n$: $L(\theta) = \prod_{i=1}^n f(x_i;\theta)$, la probabilidad (o densidad) conjunta de los datos vista como función del parámetro.`,
        R`**Estimador de máxima verosimilitud (EMV):** el $\hat\theta$ que maximiza $L$. Como el logaritmo es creciente, se maximiza $\ln L$, que convierte el producto en suma: se resuelve $\frac{d}{d\theta}\ln L = 0$.`],
      idea: [R`Entre todos los valores posibles del parámetro, se elige el que mejor «explica» lo que se observó. Si en 10 tiradas salieron 7 caras, $p = 0{,}7$ hace esos datos más probables que $p = 0{,}5$.`],
      demo: [R`**Paso 1 (Poisson).** $\ln L(\lambda) = \sum (x_i\ln\lambda - \lambda - \ln x_i!) = \left(\sum x_i\right)\ln\lambda - n\lambda + C$.`,
        R`**Paso 2.** Derivando: $\frac{\sum x_i}{\lambda} - n = 0$, de donde $\hat\lambda = \bar x$. La derivada segunda, $-\frac{\sum x_i}{\lambda^2}$, es negativa: es un máximo.`,
        R`**Paso 3 (exponencial).** $\ln L(\lambda) = \sum (\ln\lambda - \lambda x_i) = n\ln\lambda - \lambda\sum x_i$; la derivada $\frac n\lambda - \sum x_i$ se anula en $\hat\lambda = \frac{1}{\bar x}$, y la segunda derivada $-\frac{n}{\lambda^2}$ es negativa. $\blacksquare$`],
      examples: [{ q: R`Bernoulli con datos $1, 0, 1, 1, 0$.`, steps: [R`$\ln L = 3\ln p + 2\ln(1 - p)$; $\frac3p = \frac2{1-p}$, así que $\hat p = \frac35$.`] }],
      tips: [R`Si el parámetro está restringido (por ejemplo $0 < p < 1$) y la derivada no se anula adentro, el máximo puede estar en el borde.`],
      see: ["pe-estimadores", "pe-binomial", "pe-poisson"]
    },
    "pe-ic-media": {
      title: "Intervalo de confianza para la media", aliases: ["intervalo de confianza", "intervalos de confianza", "nivel de confianza", "margen de error", "tamaño de muestra"], concepts: ["pe-ic-media"],
      summary: "Con σ conocida: x̄ ± z_(α/2)·σ/√n. Con σ desconocida y población normal: x̄ ± t_(α/2; n−1)·s/√n. Tamaño para un error E: n ≥ (z_(α/2)σ/E)².",
      def: [R`**Intervalo de confianza** del $(1 - \alpha)\cdot100\,\%$ para $\theta$: un intervalo aleatorio que contiene a $\theta$ con probabilidad $1 - \alpha$, antes de tomar la muestra.`,
        R`**Para $\mu$ con $\sigma$ conocida** (población normal, o $n$ grande): $\bar x \pm z_{\alpha/2}\frac{\sigma}{\sqrt n}$.`,
        R`**Para $\mu$ con $\sigma$ desconocida** (población normal): $\bar x \pm t_{\alpha/2;\,n-1}\frac{s}{\sqrt n}$. **Tamaño de muestra:** $n \ge \left(\frac{z_{\alpha/2}\sigma}{E}\right)^2$, redondeado hacia arriba.`],
      idea: [R`El «95 %» se refiere al método, no a un intervalo ya calculado: si se repitiera la muestra muchas veces, el 95 % de los intervalos construidos así atraparía a $\mu$.`,
        R`Más confianza o menos datos dan un intervalo más ancho: no se puede tener a la vez certeza y precisión gratis.`],
      demo: [R`**Paso 1 (pivote).** Con $\sigma$ conocida, $Z = \frac{\bar X - \mu}{\sigma/\sqrt n} \sim N(0, 1)$ ([[pe-tcl]]). Su distribución no depende de $\mu$: es un «pivote».`,
        R`**Paso 2.** Por definición del cuantil, $P(-z_{\alpha/2} < Z < z_{\alpha/2}) = 1 - \alpha$.`,
        R`**Paso 3.** Multiplicando la desigualdad por $\frac{\sigma}{\sqrt n} > 0$ y despejando $\mu$ (al restar $\bar X$ y cambiar de signo, se invierten las desigualdades): $P\left(\bar X - z_{\alpha/2}\frac{\sigma}{\sqrt n} < \mu < \bar X + z_{\alpha/2}\frac{\sigma}{\sqrt n}\right) = 1 - \alpha$.`,
        R`**Paso 4.** Con $\sigma$ desconocida se hace lo mismo con el pivote $\frac{\bar X - \mu}{S/\sqrt n} \sim t_{n-1}$ ([[pe-muestrales]]). **Tamaño:** se pide que el margen $z_{\alpha/2}\frac{\sigma}{\sqrt n}$ sea $\le E$ y se despeja $n$. $\blacksquare$`],
      examples: [{ q: R`$n = 25$, $\bar x = 40$, $s = 5$, confianza del 95 %.`, steps: [R`$t_{0{,}025;\,24} \approx 2{,}064$; margen $2{,}064\cdot\frac{5}{5} = 2{,}064$.`, R`Intervalo: $(37{,}94;\ 42{,}06)$.`] }],
      tips: [R`Si la consigna da $s$ (calculado con la muestra), es la $t$; si da $\sigma$ (conocida de antes), es la $z$.`],
      see: ["pe-ic-proporcion-varianza", "pe-tcl", "pe-test-media"]
    },
    "pe-ic-proporcion-varianza": {
      title: "Intervalos para una proporción y para la varianza", aliases: ["intervalo para una proporción", "intervalo para la varianza", "proporción muestral"], concepts: ["pe-ic-proporcion-varianza"],
      summary: "Proporción (n grande): p̂ ± z_(α/2)√(p̂(1 − p̂)/n). Varianza (población normal): ((n − 1)s²/χ²_(α/2), (n − 1)s²/χ²_(1−α/2)), con la χ² de n − 1 grados.",
      def: [R`**Proporción:** con $\hat p = \frac xn$ y $n$ grande, $\hat p \pm z_{\alpha/2}\sqrt{\frac{\hat p(1 - \hat p)}{n}}$. Tamaño para un error $E$: $n \ge \frac{z_{\alpha/2}^2p(1 - p)}{E^2}$, con $p = 0{,}5$ si no se sabe nada.`,
        R`**Varianza** (población normal): $\left(\frac{(n - 1)s^2}{\chi^2_{\alpha/2;\,n-1}},\ \frac{(n - 1)s^2}{\chi^2_{1-\alpha/2;\,n-1}}\right)$, donde $\chi^2_{q;\,k}$ deja un área $q$ a su derecha. Para el desvío, se saca la raíz de los dos extremos.`,
        R`**Unilateral derecho** para $\sigma^2$ (una cota inferior): $\left(\frac{(n - 1)s^2}{\chi^2_{\alpha;\,n-1}},\ \infty\right)$.`],
      idea: [R`El intervalo de la varianza no es simétrico alrededor de $s^2$: la χ² es asimétrica, y además $\sigma^2$ aparece dividiendo.`],
      demo: [R`**Paso 1 (proporción).** $\hat p$ es el promedio de $n$ Bernoulli de media $p$ y varianza $p(1-p)$; por el [[pe-tcl|TCL]], $\frac{\hat p - p}{\sqrt{p(1-p)/n}} \approx N(0, 1)$. Reemplazando $p$ por $\hat p$ en el desvío y despejando como en [[pe-ic-media]] sale el intervalo.`,
        R`**Paso 2 (varianza).** El pivote es $\frac{(n - 1)S^2}{\sigma^2} \sim \chi^2_{n-1}$ ([[pe-muestrales]]): $P\left(\chi^2_{1-\alpha/2} < \frac{(n - 1)S^2}{\sigma^2} < \chi^2_{\alpha/2}\right) = 1 - \alpha$.`,
        R`**Paso 3.** Tomando inversos (todo es positivo, así que las desigualdades se dan vuelta) y multiplicando por $(n - 1)S^2$: $\frac{(n - 1)S^2}{\chi^2_{\alpha/2}} < \sigma^2 < \frac{(n - 1)S^2}{\chi^2_{1-\alpha/2}}$. $\blacksquare$`],
      examples: [{ q: R`En 400 encuestados, 120 dicen que sí. Intervalo del 95 %.`, steps: [R`$\hat p = 0{,}3$; margen $1{,}96\sqrt{\frac{0{,}3\cdot0{,}7}{400}} \approx 0{,}045$.`, R`$(0{,}255;\ 0{,}345)$.`] }],
      tips: [R`El intervalo para la varianza es muy sensible a que la población sea normal; el de la media, mucho menos.`],
      see: ["pe-ic-media", "pe-muestrales", "pe-test-prop-var"]
    }
  };

  E.extendCourse("m105", {
    concepts: { "pe-estimadores": { name: "Estimadores" }, "pe-max-verosimilitud": { name: "Máxima verosimilitud" }, "pe-ic-media": { name: "Intervalo para la media" }, "pe-ic-proporcion-varianza": { name: "Intervalos para proporción y varianza" } },
    templates: T,
    units: [{
      id: "pe-estimacion-u", order: 6, program: "Unidad 6", title: "Estimación", icon: "search",
      diagnostic: ["pe-ic-media-num", "pe-ic-prop-num", "pe-mv-num"],
      lessons: [
        { id: "pe-est-l1", title: "Estimadores y máxima verosimilitud", templates: ["pe-sesgo-tf", "pe-mv-num"], theory: ["pe-estimadores", "pe-max-verosimilitud"],
          intro: R`Un buen estimador está centrado en el parámetro y varía poco.` },
        { id: "pe-est-l2", title: "Intervalo para la media", templates: ["pe-ic-media-num", "pe-tamano-num"], theory: ["pe-ic-media"],
          intro: R`$\bar x \pm$ (valor crítico) $\times$ (error estándar).` },
        { id: "pe-est-l3", title: "Proporciones y varianzas", templates: ["pe-ic-prop-num", "pe-ic-var-num"], theory: ["pe-ic-proporcion-varianza"],
          intro: R`Para la varianza el pivote es una $\chi^2$, y el intervalo no es simétrico.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 7 · PRUEBAS DE HIPÓTESIS
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, S = E.pye, nf = S.nf;
  const T = {};
  // valor p a partir del estadístico y del tipo de alternativa, con la distribución que se pase
  const pval = (cdf, st, alt) => (alt === ">" ? 1 - cdf(st) : alt === "<" ? cdf(st) : 2 * Math.min(cdf(st), 1 - cdf(st)));
  const altTex = (alt, sym, v) => `H_1: ${sym} ${alt === ">" ? ">" : alt === "<" ? "<" : "\\neq"} ${v}`;

  T["pe-test-media-num"] = {
    type: "numeric", concepts: ["pe-test-media"], difficulty: 3,
    generate(r) {
      const known = r.bool(), n = known ? r.pick([25, 36, 49, 64, 100]) : r.int(8, 25), mu0 = r.int(20, 80), s = r.int(3, 12), alt = r.pick([">", "<", "≠"]);
      const st = r.pick([0.6, 1.1, 1.4, 1.8, 2.2, 2.7]) * (alt === "<" ? -1 : alt === ">" ? 1 : r.pick([-1, 1])), xb = Math.round((mu0 + st * s / Math.sqrt(n)) * 100) / 100;
      const stat = (xb - mu0) / (s / Math.sqrt(n)), cdf = known ? S.Phi : x => S.tcdf(x, n - 1), ans = pval(cdf, stat, alt);
      return {
        prompt: `Se quiere probar $H_0: \\mu = ${mu0}$ contra $${altTex(alt, "\\mu", mu0)}$. Una muestra de ${n} datos de una población normal dio $\\bar x = ${nf(xb, 2)}$ ${known ? `(con $\\sigma = ${s}$ conocido)` : `y $s = ${s}$`}. ¿Cuál es el valor p de la prueba?`,
        answer: ans,
        solution: [`Estadístico de [[pe-test-media|prueba]]: $${known ? "z" : "t"} = \\frac{\\bar x - \\mu_0}{${known ? "\\sigma" : "s"}/\\sqrt n} = \\frac{${nf(xb, 2)} - ${mu0}}{${s}/\\sqrt{${n}}} \\approx ${nf(stat, 3)}$${known ? "" : `, con una $t$ de ${n - 1} grados de libertad`}.`,
          `Valor p (${alt === "≠" ? "bilateral: el doble de la cola" : "una cola"}): $${alt === ">" ? `P(${known ? "Z" : "T"} > ${nf(stat, 3)})` : alt === "<" ? `P(${known ? "Z" : "T"} < ${nf(stat, 3)})` : `2P(${known ? "Z" : "T"} > ${nf(Math.abs(stat), 3)})`} \\approx ${nf(ans)}$. ${ans < 0.05 ? "Con $\\alpha = 0{,}05$ se rechaza $H_0$." : "Con $\\alpha = 0{,}05$ no se rechaza $H_0$."}`],
        // otro camino: las colas integrando la densidad (normal o t) con Simpson
        verify: { kind: "value", tol: 1e-6, fn: () => pval(known ? S.PhiNum : x => S.tcdfNum(x, n - 1), stat, alt) }
      };
    }
  };

  T["pe-decision-mc"] = {
    type: "mc", concepts: ["pe-hipotesis"], difficulty: 2,
    generate(r) {
      const alt = r.pick([">", "<", "≠"]), a = r.pick([0.01, 0.05, 0.1]), z = Math.round(r.pick([0.8, 1.3, 1.5, 1.7, 1.9, 2.1, 2.4, 2.8]) * (alt === "<" ? -1 : alt === ">" ? 1 : r.pick([-1, 1])) * 100) / 100;
      const p = pval(S.Phi, z, alt), rej = p < a;
      const ok = rej ? `Se rechaza $H_0$ al nivel $${nf(a, 2)}$` : `No se rechaza $H_0$ al nivel $${nf(a, 2)}$`, other = rej ? `No se rechaza $H_0$ al nivel $${nf(a, 2)}$` : `Se rechaza $H_0$ al nivel $${nf(a, 2)}$`;
      const { options, correct } = H.mc(r, ok, [other, R`Queda demostrado que $H_0$ es verdadera`, R`Queda demostrado que $H_1$ es verdadera con probabilidad $1$`], { text: true });
      return {
        prompt: `En una prueba sobre una media con $${altTex(alt, "\\mu", "\\mu_0")}$, el estadístico $z$ (normal estándar bajo $H_0$) vale $${nf(z, 2)}$. Con $\\alpha = ${nf(a, 2)}$, ¿qué se concluye?`,
        options, correct,
        solution: [`Valor p: $${alt === ">" ? `P(Z > ${nf(z, 2)})` : alt === "<" ? `P(Z < ${nf(z, 2)})` : `2P(Z > ${nf(Math.abs(z), 2)})`} \\approx ${nf(p)}$, ${rej ? "menor" : "mayor"} que $\\alpha$.`,
          `${rej ? "Se rechaza $H_0$" : "No se rechaza $H_0$"}. Una [[pe-hipotesis|prueba]] nunca demuestra que $H_0$ es cierta: a lo sumo, los datos no alcanzan para descartarla.`],
        verify: { kind: "truth", target: true, fn: () => (pval(S.PhiNum, z, alt) < a) === rej }
      };
    }
  };

  T["pe-test-prop-num"] = {
    type: "numeric", concepts: ["pe-test-prop-var"], difficulty: 2,
    generate(r) {
      const p0 = r.pick([0.1, 0.2, 0.3, 0.5, 0.6]), n = r.pick([100, 150, 200, 400]), alt = r.pick([">", "<", "≠"]), d = r.pick([1, 1.5, 2, 2.5]) * (alt === "<" ? -1 : alt === ">" ? 1 : r.pick([-1, 1]));
      const x = Math.round(n * p0 + d * Math.sqrt(n * p0 * (1 - p0))), ph = x / n, z = (ph - p0) / Math.sqrt(p0 * (1 - p0) / n), ans = pval(S.Phi, z, alt);
      return {
        prompt: `Un fabricante dice que el ${nf(100 * p0, 0)} % de sus piezas tiene una falla menor. En una muestra de ${n} piezas, ${x} la tienen. Calculá el valor p de la prueba de $H_0: p = ${nf(p0)}$ contra $${altTex(alt, "p", nf(p0))}$.`,
        answer: ans,
        solution: [`$\\hat p = ${nf(ph)}$. Bajo $H_0$, $\\hat p \\approx N\\left(p_0, \\frac{p_0(1 - p_0)}{n}\\right)$: el [[pe-test-prop-var|estadístico]] es $z = \\frac{\\hat p - p_0}{\\sqrt{p_0(1 - p_0)/n}} \\approx ${nf(z, 3)}$ (se usa $p_0$, no $\\hat p$, en el desvío).`,
          `Valor p: $\\approx ${nf(ans)}$.`],
        verify: { kind: "value", tol: 1e-6, fn: () => pval(S.PhiNum, z, alt) }
      };
    }
  };

  T["pe-errores-tf"] = {
    type: "tf", concepts: ["pe-hipotesis"], difficulty: 3, testN: 80,
    generate(r) {
      const mu0 = r.int(50, 100), sg = r.pick([5, 8, 10, 12]), n = r.pick([16, 25, 36]), se = sg / Math.sqrt(n), mu1 = Math.round((mu0 + r.pick([0.5, 1, 1.5, 2, 2.5]) * se) * 10) / 10, a = r.pick([0.05, 0.1, 0.01]);
      const c = mu0 + S.zq(1 - a) * se, beta = S.Phi((c - mu1) / se), truth = r.bool(), claim = truth ? beta : 1 - a;
      if (Math.abs(beta - (1 - a)) < 0.01) return null;
      return {
        prompt: `<b>Verdadero o falso:</b> en la prueba de $H_0: \\mu = ${mu0}$ contra $H_1: \\mu > ${mu0}$, con $\\sigma = ${sg}$, $n = ${n}$ y $\\alpha = ${nf(a, 2)}$, la probabilidad de cometer un error de tipo II si en realidad $\\mu = ${mu1}$ es $\\beta \\approx ${nf(claim, 3)}$.`,
        answer: truth,
        explanation: `Se rechaza $H_0$ si $\\bar x > c = ${mu0} + z_{${nf(a, 2)}}\\frac{${sg}}{\\sqrt{${n}}} \\approx ${nf(c, 3)}$. El [[pe-hipotesis|error de tipo II]] es no rechazar cuando $\\mu = ${mu1}$: $\\beta = P(\\bar X \\le c \\mid \\mu = ${mu1}) = \\Phi\\left(\\frac{${nf(c, 3)} - ${mu1}}{${nf(se, 3)}}\\right) \\approx ${nf(beta, 3)}$. ${truth ? "Es verdadero." : "Es falso: $\\beta$ no es $1 - \\alpha$; depende del valor verdadero de $\\mu$."}`,
        solution: [R`$\alpha$ y $\beta$ se calculan con distribuciones distintas: $\alpha$ suponiendo $H_0$, $\beta$ suponiendo un valor concreto de $H_1$.`],
        // otro camino: se integra la densidad de X̄ bajo μ₁ sobre la región donde no se rechaza
        verify: { kind: "truth", fn: () => {
          const cc = mu0 + S.quantile(S.PhiNum, 1 - a, -8, 8, 60) * se, b = 0.5 + S.simpson(u => Math.exp(-(((u - mu1) / se) ** 2) / 2) / (se * Math.sqrt(2 * Math.PI)), mu1, cc, 2000);
          return Math.abs(b - claim) < 1e-3;
        } }
      };
    }
  };

  T["pe-chi2-num"] = {
    type: "numeric", concepts: ["pe-chi-cuadrado"], difficulty: 3,
    generate(r) {
      if (r.bool()) {
        const a = r.int(10, 60), b = r.int(10, 60), c = r.int(10, 60), d = r.int(10, 60), N = a + b + c + d, O = [[a, b], [c, d]];
        const rs = [a + b, c + d], cs = [a + c, b + d], Ex = rs.map(x => cs.map(y => x * y / N)), chi = O.reduce((s, row, i) => s + row.reduce((t, o, j) => t + (o - Ex[i][j]) ** 2 / Ex[i][j], 0), 0);
        return {
          prompt: `En una encuesta, de ${rs[0]} estudiantes de la mañana ${a} prefieren clases presenciales y ${b} virtuales; de ${rs[1]} de la tarde, ${c} y ${d}. Calculá el estadístico $\\chi^2$ de la prueba de independencia entre turno y preferencia (sin corrección de Yates).`,
          answer: chi,
          solution: [`[[pe-chi-cuadrado|Frecuencias esperadas]] bajo independencia: $E_{ij} = \\frac{(\\text{total fila})(\\text{total columna})}{N}$: $${Ex.flat().map(x => nf(x, 2)).join(";\\ ")}$.`,
            `$\\chi^2 = \\sum \\frac{(O - E)^2}{E} \\approx ${nf(chi, 3)}$, con $(2 - 1)(2 - 1) = 1$ grado de libertad (el valor crítico al 5 % es $3{,}841$).`],
          // otro camino: la fórmula abreviada para tablas 2×2
          verify: { kind: "value", tol: 1e-9, fn: () => N * (a * d - b * c) ** 2 / (rs[0] * rs[1] * cs[0] * cs[1]) }
        };
      }
      const n = r.pick([60, 120, 180]), O = (() => { for (;;) { const o = Array.from({ length: 5 }, () => n / 6 + r.int(-8, 8)); const last = n - o.reduce((s, x) => s + x, 0); if (last > 0) return o.concat(last); } })();
      const e = n / 6, chi = O.reduce((s, o) => s + (o - e) ** 2 / e, 0);
      return {
        prompt: `Se tiró un dado ${n} veces y se obtuvieron estas frecuencias para las caras 1 a 6: $${O.join(";\\ ")}$. Calculá el estadístico $\\chi^2$ de la prueba de bondad de ajuste para la hipótesis de que el dado es equilibrado.`,
        answer: chi,
        solution: [`Bajo $H_0$ cada cara se espera $E = \\frac{${n}}{6} = ${nf(e)}$ veces.`, `[[pe-chi-cuadrado|Estadístico]]: $\\chi^2 = \\sum\\frac{(O_i - E)^2}{E} \\approx ${nf(chi, 3)}$, con $6 - 1 = 5$ grados de libertad (crítico al 5 %: $11{,}07$).`],
        // otro camino: Σ O²/E − n
        verify: { kind: "value", tol: 1e-9, fn: () => O.reduce((s, o) => s + o * o / e, 0) - n }
      };
    }
  };

  T["pe-anova-num"] = {
    type: "numeric", concepts: ["pe-anova"], difficulty: 3,
    generate(r) {
      const k = 3, g = [0, 1, 2].map(() => Array.from({ length: r.int(3, 5) }, () => r.int(5, 25))), N = g.reduce((s, x) => s + x.length, 0), ask = r.pick(["F", "SSB", "SSW"]);
      const mg = S.mean(g.flat()), ms = g.map(S.mean), SSB = g.reduce((s, x, i) => s + x.length * (ms[i] - mg) ** 2, 0), SSW = g.reduce((s, x, i) => s + x.reduce((t, v) => t + (v - ms[i]) ** 2, 0), 0);
      if (SSW === 0) return null;
      const F = SSB / (k - 1) / (SSW / (N - k)), ans = { F, SSB, SSW }[ask];
      return {
        prompt: `Se midió el rendimiento de tres fertilizantes: A: $${S.list(g[0])}$; B: $${S.list(g[1])}$; C: $${S.list(g[2])}$. En el ANOVA de un factor, calculá ${{ F: "el estadístico $F$", SSB: "la suma de cuadrados entre grupos", SSW: "la suma de cuadrados dentro de los grupos" }[ask]}.`,
        answer: ans,
        solution: [`Medias: $\\bar x_A = ${nf(ms[0])}$, $\\bar x_B = ${nf(ms[1])}$, $\\bar x_C = ${nf(ms[2])}$; media general $\\bar x = ${nf(mg)}$.`,
          `[[pe-anova|Entre grupos]]: $SC_E = \\sum n_i(\\bar x_i - \\bar x)^2 \\approx ${nf(SSB)}$. Dentro: $SC_D = \\sum\\sum (x_{ij} - \\bar x_i)^2 \\approx ${nf(SSW)}$.`,
          `$F = \\frac{SC_E/(k - 1)}{SC_D/(N - k)} = \\frac{${nf(SSB)}/2}{${nf(SSW)}/${N - k}} \\approx ${nf(F)}$, con $(2, ${N - k})$ grados de libertad.`],
        // otro camino: SC_E = SC_total − SC_D, con la suma de cuadrados total respecto de la media general
        verify: { kind: "value", tol: 1e-8, fn: () => {
          const all = g.flat(), mm = S.mean(all), SST = all.reduce((s, v) => s + (v - mm) ** 2, 0);
          const sw = g.reduce((s, x) => s + S.var(x) * (x.length - 1), 0), sb = SST - sw;
          return { F: sb / 2 / (sw / (N - k)), SSB: sb, SSW: sw }[ask];
        } }
      };
    }
  };

  T["pe-hipotesis-order"] = {
    type: "order", concepts: ["pe-hipotesis"], difficulty: 1,
    generate(r) {
      const mu0 = r.int(10, 50), n = r.pick([16, 25, 36]), sg = r.int(2, 8), xb = mu0 + r.pick([1, 2, 3]) * sg / Math.sqrt(n) * r.pick([0.6, 0.9]), z = (xb - mu0) / (sg / Math.sqrt(n)), p = 1 - S.Phi(z);
      return {
        prompt: `Ordená los pasos de la prueba de $H_0: \\mu = ${mu0}$ contra $H_1: \\mu > ${mu0}$ con $\\bar x = ${nf(xb, 3)}$, $\\sigma = ${sg}$, $n = ${n}$ y $\\alpha = 0{,}05$.`,
        steps: [`Plantear las [[pe-hipotesis|hipótesis]] y el nivel de significación $\\alpha = 0{,}05$.`,
          `Elegir el estadístico y su distribución bajo $H_0$: $Z = \\frac{\\bar X - ${mu0}}{\\sigma/\\sqrt n} \\sim N(0, 1)$.`,
          `Calcularlo con los datos: $z = \\frac{${nf(xb, 3)} - ${mu0}}{${sg}/${Math.sqrt(n)}} \\approx ${nf(z, 3)}$.`,
          `Calcular el valor p: $P(Z > ${nf(z, 3)}) \\approx ${nf(p)}$.`,
          `Decidir: ${p < 0.05 ? "como $p < 0{,}05$, se rechaza $H_0$" : "como $p \\ge 0{,}05$, no se rechaza $H_0$"}.`],
        solution: [R`Las hipótesis y $\alpha$ se fijan **antes** de mirar los datos; después se calcula el estadístico, el valor p y se decide.`],
        verify: { kind: "truth", target: true, fn: () => Math.abs(1 - S.PhiNum(z) - p) < 1e-9 }
      };
    }
  };

  // cuantil de la t integrando la densidad (Simpson) y bisección, para los verify
  const tqNum = (p, v) => S.quantile(x => S.tcdfNum(x, v), p, -50, 50, 60);
  // datos con media y desvío muestral exactos (para recalcular a partir de datos concretos)
  const withStats = (n, m, s) => { const b = Array.from({ length: n }, (_, i) => (i * 7919) % 13 + i * 0.37), mb = S.mean(b), sb = Math.sqrt(S.var(b)); return b.map(x => m + s * (x - mb) / sb); };

  T["pe-dos-medias-num"] = {
    type: "numeric", concepts: ["pe-dos-muestras"], difficulty: 3, testN: 120,
    generate(r) {
      const n1 = r.int(6, 15), n2 = r.int(6, 15), s1 = r.int(2, 8), s2 = r.int(2, 8), x1 = r.int(30, 70) + r.int(0, 9) / 10, x2 = Math.round((x1 + r.pick([-1, 1]) * r.int(5, 60) / 10) * 10) / 10;
      if (Math.max(s1, s2) > 2 * Math.min(s1, s2)) return null;
      const conf = r.pick([0.9, 0.95, 0.99]), a = 1 - conf, df = n1 + n2 - 2, ask = r.pick(["sp", "t", "margen"]);
      const sp = Math.sqrt(((n1 - 1) * s1 * s1 + (n2 - 1) * s2 * s2) / df), se = sp * Math.sqrt(1 / n1 + 1 / n2), t = (x1 - x2) / se, crit = S.tq(1 - a / 2, df), E0 = crit * se;
      const ans = { sp, t, margen: E0 }[ask];
      return {
        prompt: `Se compararon dos métodos de secado midiendo la humedad final (en %). Método A: $n_1 = ${n1}$, $\\bar x_1 = ${nf(x1)}$, $s_1 = ${s1}$. Método B: $n_2 = ${n2}$, $\\bar x_2 = ${nf(x2)}$, $s_2 = ${s2}$. Suponiendo poblaciones normales con la misma varianza, calculá ${{ sp: "el desvío combinado $s_p$", t: "el estadístico $t$ de la prueba de $H_0: \\mu_1 = \\mu_2$", margen: `el margen de error del intervalo del ${nf(100 * conf, 0)} % para $\\mu_1 - \\mu_2$` }[ask]}.`,
        answer: ans,
        solution: [`[[pe-dos-muestras|Varianza combinada]]: $s_p^2 = \\frac{(n_1 - 1)s_1^2 + (n_2 - 1)s_2^2}{n_1 + n_2 - 2} = \\frac{${n1 - 1}\\cdot ${s1 * s1} + ${n2 - 1}\\cdot ${s2 * s2}}{${df}} \\approx ${nf(sp * sp)}$, así que $s_p \\approx ${nf(sp)}$.`,
          ...(ask === "sp" ? [] : [`Error estándar de la diferencia: $s_p\\sqrt{\\frac1{n_1} + \\frac1{n_2}} = ${nf(sp)}\\sqrt{\\frac1{${n1}} + \\frac1{${n2}}} \\approx ${nf(se)}$.`]),
          ...(ask === "t" ? [`$t = \\frac{\\bar x_1 - \\bar x_2}{${nf(se)}} = \\frac{${nf(x1)} - ${nf(x2)}}{${nf(se)}} \\approx ${nf(t)}$, con ${df} grados de libertad. ${Math.abs(t) > S.tq(0.975, df) ? `Como $|t| > t_{0{,}025;\\,${df}} \\approx ${nf(S.tq(0.975, df), 3)}$, se rechaza $H_0$ al 5 %.` : `Como $|t| < t_{0{,}025;\\,${df}} \\approx ${nf(S.tq(0.975, df), 3)}$, no se rechaza $H_0$ al 5 %.`}`] : []),
          ...(ask === "margen" ? [`Margen: $t_{${nf(a / 2, 3)};\\,${df}}\\cdot ${nf(se)} \\approx ${nf(crit, 3)}\\cdot ${nf(se)} \\approx ${nf(E0)}$. Intervalo: $${nf(x1 - x2)} \\pm ${nf(E0)}$.`] : [])],
        // otro camino: datos concretos con esas medias y desvíos, y un ANOVA de dos grupos (F = t²);
        // el valor crítico, integrando la densidad t
        verify: { kind: "value", tol: 1e-6, fn: () => {
          const g1 = withStats(n1, x1, s1), g2 = withStats(n2, x2, s2), all = g1.concat(g2), mm = S.mean(all);
          const SST = all.reduce((s, v) => s + (v - mm) ** 2, 0), SSW = [g1, g2].reduce((s, g) => { const mg = S.mean(g); return s + g.reduce((u, v) => u + (v - mg) ** 2, 0); }, 0);
          const F = (SST - SSW) / (SSW / df), spv = Math.sqrt(SSW / df);
          return { sp: spv, t: Math.sign(x1 - x2) * Math.sqrt(F), margen: tqNum(1 - a / 2, df) * spv * Math.sqrt(1 / n1 + 1 / n2) }[ask];
        } }
      };
    }
  };

  T["pe-pareadas-num"] = {
    type: "numeric", concepts: ["pe-dos-muestras"], difficulty: 3,
    generate(r) {
      const n = r.int(5, 8), shift = r.int(-4, 6), x = Array.from({ length: n }, () => r.int(20, 60)), y = x.map(v => v + shift + r.int(-4, 4)), d = y.map((v, i) => v - x[i]), ask = r.pick(["dbar", "sd", "t"]);
      const db = S.mean(d), sd = Math.sqrt(S.var(d));
      if (sd === 0 || db === 0) return null;
      const t = db / (sd / Math.sqrt(n)), ans = { dbar: db, sd, t }[ask];
      return {
        prompt: `Se midió el tiempo (en s) que tardan ${n} operarios en armar una pieza, antes y después de una capacitación: $$\\begin{array}{c|${"c".repeat(n)}} \\text{antes} & ${x.join(" & ")} \\\\ \\hline \\text{después} & ${y.join(" & ")} \\end{array}$$ Con las diferencias $d = \\text{después} - \\text{antes}$, calculá ${{ dbar: "la diferencia media $\\bar d$", sd: "el desvío estándar $s_d$ de las diferencias", t: "el estadístico $t$ de la prueba de $H_0: \\mu_d = 0$" }[ask]}.`,
        answer: ans,
        solution: [`Son [[pe-dos-muestras|datos pareados]]: los mismos operarios medidos dos veces. Diferencias: $${S.list(d)}$.`,
          `$\\bar d = ${nf(db)}$ y $s_d = \\sqrt{\\frac{\\sum (d_i - \\bar d)^2}{n - 1}} \\approx ${nf(sd)}$.`,
          ...(ask === "t" ? [`$t = \\frac{\\bar d}{s_d/\\sqrt n} = \\frac{${nf(db)}}{${nf(sd)}/\\sqrt{${n}}} \\approx ${nf(t)}$, con ${n - 1} grados de libertad (una prueba para una media sobre las diferencias).`] : [])],
        // otro camino: con las dos columnas, Var(Y − X) = s_x² + s_y² − 2 cov(x, y)
        verify: { kind: "value", tol: 1e-9, fn: () => {
          const mx = S.mean(x), my = S.mean(y), cov = x.reduce((s, v, i) => s + (v - mx) * (y[i] - my), 0) / (n - 1), s2 = S.var(x) + S.var(y) - 2 * cov;
          return { dbar: my - mx, sd: Math.sqrt(s2), t: (my - mx) / Math.sqrt(s2 / n) }[ask];
        } }
      };
    }
  };

  const cards = {
    "pe-hipotesis": {
      title: "Pruebas de hipótesis: ideas y errores", aliases: ["prueba de hipótesis", "pruebas de hipótesis", "hipótesis nula", "hipótesis alternativa", "nivel de significación", "valor p", "error de tipo I", "error de tipo II", "potencia de una prueba", "región crítica"], concepts: ["pe-hipotesis"],
      summary: "Se contrasta H₀ contra H₁ con un estadístico de distribución conocida bajo H₀. Valor p: la probabilidad, si H₀ es cierta, de un resultado al menos tan extremo como el observado. Se rechaza H₀ si p < α. α = P(error I) y β = P(error II); la potencia es 1 − β.",
      def: [R`**Hipótesis nula** $H_0$ (la que se pone a prueba, por ejemplo $\mu = \mu_0$) y **alternativa** $H_1$ ($\mu > \mu_0$, $\mu < \mu_0$ o $\mu \neq \mu_0$).`,
        R`**Error de tipo I:** rechazar $H_0$ siendo cierta; su probabilidad máxima es el **nivel de significación** $\alpha$. **Error de tipo II:** no rechazar $H_0$ siendo falsa; su probabilidad es $\beta$, que depende del valor verdadero. **Potencia:** $1 - \beta$.`,
        R`**Valor p:** la probabilidad, calculada suponiendo $H_0$, de obtener un estadístico al menos tan extremo como el observado (en la dirección de $H_1$). **Regla:** se rechaza $H_0$ si $p < \alpha$; equivalentemente, si el estadístico cae en la **región crítica**.`],
      idea: [R`Es un juicio: $H_0$ es «inocente» hasta que los datos muestren algo muy improbable bajo ella. No rechazar no prueba la inocencia; solo dice que no hay pruebas suficientes.`,
        R`Con $n$ fijo, bajar $\alpha$ (ser más exigente para condenar) agranda $\beta$ (se escapan más culpables). La única manera de bajar los dos es juntar más datos.`],
      demo: [R`**Paso 1 (por qué funciona la regla).** Si $H_0$ es cierta, el valor p es una variable aleatoria uniforme en $[0, 1]$ (para estadísticos continuos): $P(p < \alpha) = \alpha$.`,
        R`**Paso 2.** Por eso la regla «rechazar si $p < \alpha$» comete el error de tipo I con probabilidad exactamente $\alpha$.`,
        R`**Paso 3 (el porqué del paso 1).** Si $T$ es el estadístico, con distribución continua $F$ bajo $H_0$, y la alternativa es «$T$ grande», $p = 1 - F(T)$. Entonces $P(p < \alpha) = P(F(T) > 1 - \alpha) = P(T > F^{-1}(1 - \alpha)) = \alpha$. $\blacksquare$`],
      examples: [{ q: R`$z = 2{,}1$ en una prueba unilateral derecha.`, steps: [R`$p = P(Z > 2{,}1) \approx 0{,}018$.`, R`Se rechaza $H_0$ al $5\,\%$, pero no al $1\,\%$.`] }],
      tips: [R`En una prueba bilateral, el valor p es el **doble** de la cola.`],
      see: ["pe-test-media", "pe-test-prop-var", "pe-ic-media"]
    },
    "pe-test-media": {
      title: "Prueba para la media", aliases: ["prueba z", "prueba t", "test de la media", "estadístico de prueba"], concepts: ["pe-test-media"],
      summary: "H₀: μ = μ₀. Con σ conocida: z = (x̄ − μ₀)/(σ/√n) ~ N(0, 1). Con σ desconocida (población normal): t = (x̄ − μ₀)/(s/√n) ~ tₙ₋₁. Se rechaza si el valor p es menor que α.",
      def: [R`**Con $\sigma$ conocida** (población normal o $n$ grande): $Z = \frac{\bar X - \mu_0}{\sigma/\sqrt n} \sim N(0, 1)$ bajo $H_0$.`,
        R`**Con $\sigma$ desconocida** (población normal): $T = \frac{\bar X - \mu_0}{S/\sqrt n} \sim t_{n-1}$ bajo $H_0$.`,
        R`**Región crítica** para $H_1: \mu > \mu_0$: $z > z_\alpha$; para $\mu < \mu_0$: $z < -z_\alpha$; para $\mu \neq \mu_0$: $|z| > z_{\alpha/2}$ (con $t$, los mismos con los cuantiles de $t_{n-1}$).`],
      idea: [R`El estadístico mide «a cuántos errores estándar» quedó $\bar x$ del valor que dice $H_0$. Dos o tres errores estándar es mucho; medio, nada.`,
        R`La prueba bilateral al nivel $\alpha$ rechaza exactamente cuando $\mu_0$ queda **fuera** del [[pe-ic-media|intervalo de confianza]] del $(1 - \alpha)\,100\,\%$.`],
      demo: [R`**Paso 1.** Si $H_0$ es cierta, $\bar X$ tiene media $\mu_0$ y desvío $\frac{\sigma}{\sqrt n}$ ([[pe-tcl]]), así que $Z$ es $N(0, 1)$: su distribución es conocida sin saber nada más.`,
        R`**Paso 2.** Para $H_1: \mu > \mu_0$, los valores de $\bar X$ grandes son evidencia contra $H_0$; se rechaza si $Z > z_\alpha$, y eso pasa con probabilidad $\alpha$ cuando $H_0$ es cierta.`,
        R`**Paso 3 (dualidad con el intervalo).** $|Z| \le z_{\alpha/2}$ es lo mismo que $\bar X - z_{\alpha/2}\frac{\sigma}{\sqrt n} \le \mu_0 \le \bar X + z_{\alpha/2}\frac{\sigma}{\sqrt n}$, despejando como en el intervalo. No rechazar es que $\mu_0$ esté dentro. $\blacksquare$`],
      examples: [{ q: R`$H_0: \mu = 50$, $H_1: \mu \neq 50$; $n = 16$, $\bar x = 53$, $s = 6$.`, steps: [R`$t = \frac{3}{6/4} = 2$, con 15 grados de libertad.`, R`$p = 2P(T > 2) \approx 0{,}064$: no se rechaza al $5\,\%$.`] }],
      tips: [R`Elegí la alternativa por la pregunta, no por los datos: si te preguntan «¿supera…?», es unilateral derecha.`],
      see: ["pe-hipotesis", "pe-ic-media", "pe-muestrales"]
    },
    "pe-test-prop-var": {
      title: "Pruebas para una proporción y para la varianza", aliases: ["prueba para una proporción", "prueba para la varianza"], concepts: ["pe-test-prop-var"],
      summary: "Proporción: z = (p̂ − p₀)/√(p₀(1 − p₀)/n) ~ N(0, 1) aproximadamente. Varianza (población normal): χ² = (n − 1)s²/σ₀² ~ χ²ₙ₋₁.",
      def: [R`**Proporción** ($n$ grande): bajo $H_0: p = p_0$, $Z = \frac{\hat p - p_0}{\sqrt{p_0(1 - p_0)/n}} \approx N(0, 1)$. En el desvío va $p_0$, porque se calcula suponiendo $H_0$.`,
        R`**Varianza** (población normal): bajo $H_0: \sigma^2 = \sigma_0^2$, $\chi^2 = \frac{(n - 1)S^2}{\sigma_0^2} \sim \chi^2_{n-1}$ ([[pe-muestrales]]). Valores grandes son evidencia de $\sigma^2 > \sigma_0^2$.`],
      idea: [R`Son la misma receta de la [[pe-test-media|prueba para la media]] con otro pivote: un estadístico cuya distribución se conoce si $H_0$ es cierta.`],
      demo: [R`**Paso 1 (proporción).** $\hat p$ es el promedio de $n$ Bernoulli. Si $H_0$ es cierta, su media es $p_0$ y su varianza $\frac{p_0(1 - p_0)}{n}$ ([[pe-binomial]]); por el TCL, la estandarización es aproximadamente $N(0, 1)$.`,
        R`**Paso 2 (varianza).** Si la población es normal y $\sigma^2 = \sigma_0^2$, el teorema de las muestras normales da $\frac{(n - 1)S^2}{\sigma_0^2} \sim \chi^2_{n-1}$; la región crítica se toma en la cola que indica $H_1$. $\blacksquare$`],
      examples: [{ q: R`$H_0: p = 0{,}2$; en $n = 200$ hay 52 éxitos.`, steps: [R`$\hat p = 0{,}26$; $z = \frac{0{,}06}{\sqrt{0{,}2\cdot0{,}8/200}} \approx 2{,}12$.`, R`Unilateral derecha: $p \approx 0{,}017$.`] }],
      tips: [R`En el intervalo para $p$ se usa $\hat p$ en el desvío; en la prueba, $p_0$.`],
      see: ["pe-hipotesis", "pe-ic-proporcion-varianza"]
    },
    "pe-chi-cuadrado": {
      title: "Pruebas χ² de bondad de ajuste e independencia", aliases: ["prueba chi cuadrado", "bondad de ajuste", "prueba de independencia", "tabla de contingencia", "frecuencias esperadas"], concepts: ["pe-chi-cuadrado"],
      summary: "χ² = Σ (O − E)²/E. Bondad de ajuste con k categorías: k − 1 grados (menos los parámetros estimados). Independencia en una tabla r × c: Eᵢⱼ = (fila)(columna)/N, con (r − 1)(c − 1) grados.",
      def: [R`**Estadístico:** $\chi^2 = \sum \frac{(O - E)^2}{E}$, con $O$ las frecuencias observadas y $E$ las esperadas bajo $H_0$. Con todas las $E \ge 5$, es aproximadamente $\chi^2$ ([[pe-muestrales]]).`,
        R`**Bondad de ajuste:** $H_0$ dice qué probabilidad tiene cada una de las $k$ categorías; $E_i = np_i$ y hay $k - 1$ grados de libertad (uno menos por cada parámetro estimado con los datos).`,
        R`**Independencia** en una tabla de $r\times c$: $E_{ij} = \frac{(\text{total fila } i)(\text{total columna } j)}{N}$, con $(r - 1)(c - 1)$ grados. Se rechaza $H_0$ si $\chi^2$ supera el valor crítico.`],
      idea: [R`Cada término compara lo que pasó con lo que se esperaba, en escala relativa: diez de diferencia sobre cien esperados es poco; sobre cinco, muchísimo.`],
      demo: [R`**Paso 1 (frecuencias esperadas).** Bajo independencia, $P(\text{fila } i \text{ y columna } j) = P(\text{fila } i)P(\text{columna } j)$ ([[pe-condicional]]). Estimando cada probabilidad por su proporción en la muestra, $\frac{f_i}{N}\cdot\frac{c_j}{N}$.`,
        R`**Paso 2.** La frecuencia esperada es $N$ por esa probabilidad: $E_{ij} = \frac{f_ic_j}{N}$.`,
        R`**Paso 3 (grados de libertad).** En una tabla de $r\times c$ con los totales fijos, se pueden elegir libremente $(r - 1)(c - 1)$ celdas: las de la última fila y la última columna quedan determinadas por los totales. $\blacksquare$`],
      examples: [{ q: R`Dado tirado 60 veces: $8;\ 12;\ 9;\ 11;\ 6;\ 14$.`, steps: [R`$E = 10$; $\chi^2 = \frac{4 + 4 + 1 + 1 + 16 + 16}{10} = 4{,}2$.`, R`Con 5 grados el crítico al 5 % es $11{,}07$: no hay evidencia de que esté cargado.`] }],
      tips: [R`Si alguna frecuencia esperada es menor que 5, conviene juntar categorías.`],
      see: ["pe-hipotesis", "pe-muestrales", "pe-anova"]
    },
    "pe-dos-muestras": {
      title: "Comparación de dos medias", aliases: ["dos muestras independientes", "varianza combinada", "desvío combinado", "datos pareados", "muestras pareadas", "prueba t para dos muestras", "diferencia de medias"], concepts: ["pe-dos-muestras"],
      summary: "Muestras independientes con la misma varianza: s²ₚ = ((n₁ − 1)s₁² + (n₂ − 1)s₂²)/(n₁ + n₂ − 2) y t = (x̄₁ − x̄₂)/(sₚ√(1/n₁ + 1/n₂)) con n₁ + n₂ − 2 grados. Datos pareados: se trabaja con las diferencias, t = d̄/(s_d/√n) con n − 1 grados.",
      def: [R`**Muestras independientes, varianzas conocidas:** $Z = \frac{(\bar X_1 - \bar X_2) - (\mu_1 - \mu_2)}{\sqrt{\sigma_1^2/n_1 + \sigma_2^2/n_2}} \sim N(0, 1)$.`,
        R`**Muestras independientes, varianzas desconocidas pero iguales** (poblaciones normales): la **varianza combinada** es $s_p^2 = \frac{(n_1 - 1)s_1^2 + (n_2 - 1)s_2^2}{n_1 + n_2 - 2}$, y $T = \frac{(\bar X_1 - \bar X_2) - (\mu_1 - \mu_2)}{s_p\sqrt{1/n_1 + 1/n_2}} \sim t_{n_1 + n_2 - 2}$. El intervalo para $\mu_1 - \mu_2$ es $\bar x_1 - \bar x_2 \pm t_{\alpha/2;\,n_1 + n_2 - 2}\,s_p\sqrt{\frac1{n_1} + \frac1{n_2}}$.`,
        R`**Datos pareados:** cuando cada dato de una muestra va con uno de la otra (la misma persona antes y después, la misma parcela con dos tratamientos), se calculan las diferencias $d_i$ y se hace una [[pe-test-media|prueba t]] para una media: $T = \frac{\bar d - \mu_d}{s_d/\sqrt n} \sim t_{n-1}$.`],
      idea: [R`La pregunta es si la diferencia entre los dos promedios es más grande que lo que explicaría el azar. El error estándar de la diferencia junta la incertidumbre de los dos promedios.`,
        R`Parear saca del medio la variación entre individuos: si un operario es lento antes, también lo es después, y al restar esa lentitud se cancela. Por eso, con los mismos datos, la prueba pareada suele detectar diferencias que la de muestras independientes no ve. Pero solo vale si los datos realmente vienen de a pares.`],
      demo: [R`**Paso 1 (varianza de la diferencia).** $\bar X_1$ y $\bar X_2$ son independientes, así que las varianzas se suman ([[pe-conjuntas]]): $Var(\bar X_1 - \bar X_2) = \frac{\sigma_1^2}{n_1} + \frac{\sigma_2^2}{n_2}$, usando $Var(\bar X) = \frac{\sigma^2}{n}$ ([[pe-tcl]]). Con poblaciones normales, la diferencia es normal, y estandarizando sale la $Z$.`,
        R`**Paso 2 (la varianza combinada).** Si $\sigma_1 = \sigma_2 = \sigma$, cada $S_i^2$ estima $\sigma^2$, y $\frac{(n_i - 1)S_i^2}{\sigma^2} \sim \chi^2_{n_i - 1}$ ([[pe-muestrales]]). La suma de las dos, independientes, es $\chi^2_{n_1 + n_2 - 2}$: los grados de libertad se suman.`,
        R`**Paso 3.** Esa suma es $\frac{(n_1 + n_2 - 2)S_p^2}{\sigma^2}$. Como $E(\chi^2_k) = k$, $E(S_p^2) = \sigma^2$: es un estimador insesgado que pesa cada muestra por sus grados de libertad.`,
        R`**Paso 4 (la t).** Dividiendo la $Z$ del paso 1 (con $\sigma_1 = \sigma_2 = \sigma$) por $\sqrt{S_p^2/\sigma^2}$, la $\sigma$ se cancela y queda $T$. Es una normal estándar sobre la raíz de una $\chi^2$ dividida por sus grados, independiente de ella: una $t_{n_1 + n_2 - 2}$.`,
        R`**Paso 5 (pareados).** Las diferencias $d_i$ son independientes entre sí (cada par es un individuo distinto) y tienen media $\mu_d = \mu_1 - \mu_2$, así que forman una muestra de una sola variable, y vale la prueba de una media con $n - 1$ grados. $\blacksquare$`],
      examples: [{ q: R`$n_1 = 8$, $\bar x_1 = 52$, $s_1 = 4$; $n_2 = 10$, $\bar x_2 = 48$, $s_2 = 5$.`, steps: [R`$s_p^2 = \frac{7\cdot16 + 9\cdot25}{16} = \frac{337}{16} \approx 21{,}06$, $s_p \approx 4{,}59$.`, R`Error estándar: $4{,}59\sqrt{\frac18 + \frac1{10}} \approx 2{,}18$; $t = \frac{4}{2{,}18} \approx 1{,}84$, con 16 grados. El crítico bilateral al 5 % es $2{,}12$: no se rechaza $H_0$.`] }],
      tips: [R`Si las varianzas son muy distintas (una más del doble que la otra), no se combinan: se usa $\sqrt{s_1^2/n_1 + s_2^2/n_2}$ con los grados de libertad de Welch.`, R`Antes de elegir la prueba, preguntate si los datos vienen de a pares.`],
      see: ["pe-test-media", "pe-ic-media", "pe-anova"]
    },
    "pe-anova": {
      title: "Análisis de la varianza de un factor", aliases: ["ANOVA", "análisis de la varianza", "suma de cuadrados entre grupos", "suma de cuadrados dentro de los grupos"], concepts: ["pe-anova"],
      summary: "Para comparar k medias: SC total = SC entre + SC dentro. F = (SC_E/(k − 1)) / (SC_D/(N − k)) ~ F con (k − 1, N − k) grados bajo H₀: todas las medias iguales.",
      def: [R`**Modelo:** $k$ grupos normales con la misma varianza; $H_0: \mu_1 = \dots = \mu_k$ contra $H_1$: alguna es distinta.`,
        R`**Sumas de cuadrados:** $SC_T = \sum_{i,j} (x_{ij} - \bar x)^2$, $SC_E = \sum_i n_i(\bar x_i - \bar x)^2$ (entre grupos) y $SC_D = \sum_{i,j} (x_{ij} - \bar x_i)^2$ (dentro). Se cumple $SC_T = SC_E + SC_D$.`,
        R`**Estadístico:** $F = \frac{SC_E/(k - 1)}{SC_D/(N - k)}$, que bajo $H_0$ tiene distribución [[pe-muestrales|F]] con $(k - 1, N - k)$ grados. Se rechaza si $F$ es grande.`],
      idea: [R`Si las medias son iguales, la variación entre los promedios de los grupos tiene que ser del mismo orden que la variación dentro de cada grupo. Un $F$ mucho mayor que $1$ dice que los grupos están más separados de lo que explica el ruido.`],
      demo: [R`**Paso 1.** Para cada dato, $x_{ij} - \bar x = (x_{ij} - \bar x_i) + (\bar x_i - \bar x)$. Elevando al cuadrado y sumando sobre todos los datos aparecen tres sumas.`,
        R`**Paso 2.** El término cruzado es $2\sum_i (\bar x_i - \bar x)\sum_j (x_{ij} - \bar x_i)$, y la suma interior es cero porque los desvíos de cada grupo respecto de su media suman cero ([[pe-centralizacion]]).`,
        R`**Paso 3.** Quedan $\sum_{i,j}(x_{ij} - \bar x_i)^2 = SC_D$ y $\sum_{i,j}(\bar x_i - \bar x)^2 = \sum_i n_i(\bar x_i - \bar x)^2 = SC_E$, porque el término no depende de $j$. Así, $SC_T = SC_E + SC_D$. $\blacksquare$`],
      examples: [{ q: R`Grupos con medias 10, 12 y 14, de 4 datos cada uno, y $SC_D = 36$.`, steps: [R`$\bar x = 12$; $SC_E = 4(4 + 0 + 4) = 32$.`, R`$F = \frac{32/2}{36/9} = 4$, con $(2, 9)$ grados: el crítico al 5 % es $4{,}26$, así que no se rechaza (por poco).`] }],
      tips: [R`Con dos grupos, el ANOVA es equivalente a la prueba $t$ para dos medias con varianzas iguales: $F = t^2$.`],
      see: ["pe-chi-cuadrado", "pe-test-media", "pe-muestrales"]
    }
  };

  E.extendCourse("m105", {
    concepts: { "pe-hipotesis": { name: "Pruebas de hipótesis" }, "pe-test-media": { name: "Prueba para la media" }, "pe-test-prop-var": { name: "Pruebas para proporción y varianza" }, "pe-chi-cuadrado": { name: "Pruebas χ²" }, "pe-anova": { name: "ANOVA" }, "pe-dos-muestras": { name: "Dos medias" } },
    templates: T,
    units: [{
      id: "pe-hipotesis-u", order: 7, program: "Unidad 7", title: "Pruebas de hipótesis", icon: "flag",
      diagnostic: ["pe-test-media-num", "pe-decision-mc", "pe-chi2-num"],
      lessons: [
        { id: "pe-hip-l1", title: "Hipótesis, errores y valor p", templates: ["pe-hipotesis-order", "pe-decision-mc", "pe-errores-tf"], theory: ["pe-hipotesis"],
          intro: R`Se rechaza $H_0$ cuando lo observado sería muy improbable si $H_0$ fuera cierta.` },
        { id: "pe-hip-l2", title: "Pruebas para la media y la proporción", templates: ["pe-test-media-num", "pe-test-prop-num"], theory: ["pe-test-media", "pe-test-prop-var"],
          intro: R`¿A cuántos errores estándar quedó el dato del valor de $H_0$?` },
        { id: "pe-hip-l3", title: "χ² y ANOVA", templates: ["pe-chi2-num", "pe-anova-num"], theory: ["pe-chi-cuadrado", "pe-anova"],
          intro: R`Observado contra esperado, y la variación entre grupos contra la de adentro.` },
        { id: "pe-hip-l4", title: "Comparación de dos medias", templates: ["pe-dos-medias-num", "pe-pareadas-num"], theory: ["pe-dos-muestras"],
          intro: R`Dos grupos independientes o los mismos individuos dos veces: no es la misma prueba.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 8 · REGRESIÓN Y CORRELACIÓN
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, S = E.pye, nf = S.nf;
  const T = {};
  // datos con una tendencia lineal y ruido entero
  const pairs = r => {
    const n = r.int(5, 7), b1 = r.pick([-3, -2, -1.5, -1, 0.5, 1, 1.5, 2, 3]), b0 = r.int(-5, 10), xs = r.distinct(n, 0, 12).sort((a, b) => a - b);
    return xs.map(x => [x, Math.round(b0 + b1 * x + r.int(-3, 3))]);
  };
  const fit = P => {
    const n = P.length, mx = S.mean(P.map(p => p[0])), my = S.mean(P.map(p => p[1]));
    const Sxx = P.reduce((s, p) => s + (p[0] - mx) ** 2, 0), Syy = P.reduce((s, p) => s + (p[1] - my) ** 2, 0), Sxy = P.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0);
    const b1 = Sxy / Sxx, b0 = my - b1 * mx;
    return { n, mx, my, Sxx, Syy, Sxy, b1, b0, r: Sxy / Math.sqrt(Sxx * Syy) };
  };
  const tab = P => `\\begin{array}{c|${"c".repeat(P.length)}} x & ${P.map(p => p[0]).join(" & ")} \\\\ \\hline y & ${P.map(p => p[1]).join(" & ")} \\end{array}`;
  // mínimos cuadrados por otro camino: para cada pendiente, la mejor ordenada; se minimiza la suma de cuadrados en la pendiente
  const sse = (P, b1) => { const b0 = S.mean(P.map(p => p[1] - b1 * p[0])); return P.reduce((s, p) => s + (p[1] - b0 - b1 * p[0]) ** 2, 0); };

  T["pe-regresion-num"] = {
    type: "numeric", concepts: ["pe-regresion"], difficulty: 2,
    generate(r) {
      const P = pairs(r), f = fit(P), ask = r.pick(["b1", "b0", "pred"]), x0 = r.int(1, 14);
      if (f.Syy === 0) return null;
      const ans = { b1: f.b1, b0: f.b0, pred: f.b0 + f.b1 * x0 }[ask];
      return {
        prompt: `Con los datos $$${tab(P)}$$ ajustá la recta de regresión de $y$ sobre $x$ por mínimos cuadrados y calculá ${{ b1: "la pendiente", b0: "la ordenada al origen", pred: `el valor predicho para $x = ${x0}$` }[ask]}.`,
        answer: ans,
        solution: [`$\\bar x = ${nf(f.mx)}$, $\\bar y = ${nf(f.my)}$, $S_{xx} = \\sum(x_i - \\bar x)^2 = ${nf(f.Sxx)}$ y $S_{xy} = \\sum(x_i - \\bar x)(y_i - \\bar y) = ${nf(f.Sxy)}$.`,
          `[[pe-regresion|Mínimos cuadrados]]: $b_1 = \\frac{S_{xy}}{S_{xx}} \\approx ${nf(f.b1)}$ y $b_0 = \\bar y - b_1\\bar x \\approx ${nf(f.b0)}$.`,
          ...(ask === "pred" ? [`$\\hat y(${x0}) = ${nf(f.b0)} ${f.b1 < 0 ? "-" : "+"} ${nf(Math.abs(f.b1))}\\cdot${x0} \\approx ${nf(ans)}$.${x0 > Math.max(...P.map(p => p[0])) ? " (Ojo: está fuera del rango de los datos, es una extrapolación.)" : ""}`] : [])],
        verify: { kind: "value", tol: 1e-6, fn: () => { const b1 = S.golden(b => sse(P, b), -50, 50), b0 = S.mean(P.map(p => p[1] - b1 * p[0])); return { b1, b0, pred: b0 + b1 * x0 }[ask]; } }
      };
    }
  };

  T["pe-correlacion-num"] = {
    type: "numeric", concepts: ["pe-correlacion"], difficulty: 2,
    generate(r) {
      const P = pairs(r), f = fit(P), ask = r.pick(["r", "r2"]);
      if (f.Syy === 0 || f.Sxy === 0) return null;
      const ans = ask === "r" ? f.r : f.r * f.r;
      return {
        prompt: `Con los datos $$${tab(P)}$$ calculá ${ask === "r" ? "el coeficiente de correlación lineal $r$" : "el coeficiente de determinación $R^2$ de la recta de regresión"}.`,
        answer: ans,
        solution: [`$S_{xx} = ${nf(f.Sxx)}$, $S_{yy} = ${nf(f.Syy)}$ y $S_{xy} = ${nf(f.Sxy)}$.`,
          `[[pe-correlacion|Correlación]]: $r = \\frac{S_{xy}}{\\sqrt{S_{xx}S_{yy}}} \\approx ${nf(f.r)}$${ask === "r2" ? `, y $R^2 = r^2 \\approx ${nf(ans)}$: la recta explica el ${S.nt(100 * ans, 1)} % de la variación de $y$` : ""}.`],
        // otro camino: R² = 1 − SC_residual/SC_total con la recta ajustada (el signo de r es el de la pendiente)
        verify: { kind: "value", tol: 1e-8, fn: () => { const R2 = 1 - P.reduce((s, p) => s + (p[1] - f.b0 - f.b1 * p[0]) ** 2, 0) / f.Syy; return ask === "r2" ? R2 : Math.sign(f.b1) * Math.sqrt(R2); } }
      };
    }
  };

  T["pe-r-tf"] = {
    type: "tf", concepts: ["pe-correlacion"], difficulty: 2,
    generate(r) {
      const P = pairs(r), f = fit(P), kind = r.pick(["escala", "signo", "pendiente", "suma"]), c = r.pick([2, 3, 10, 0.5]), d = r.int(-20, 20);
      if (f.Syy === 0 || Math.abs(f.r) < 0.05 || Math.abs(Math.abs(f.b1) - Math.abs(f.r)) < 0.05) return null;
      const txt = { escala: [`si se reemplaza $x$ por $${nf(c)}x${H.sg(d)}$ (por ejemplo, un cambio de unidades), el coeficiente $r$ no cambia`, true], signo: [`si se reemplaza $y$ por $-y$, el coeficiente $r$ cambia de signo pero no de valor absoluto`, true], pendiente: [`el coeficiente $r$ coincide con la pendiente de la recta de regresión ($r \\approx ${nf(f.b1, 3)}$)`, false], suma: [`si se suma $${Math.abs(d) || 5}$ a todos los valores de $y$, el coeficiente $r$ aumenta`, false] }[kind];
      return {
        prompt: `<b>Verdadero o falso:</b> para los datos $$${tab(P)}$$ (con $r \\approx ${nf(f.r, 3)}$), ${txt[0]}.`,
        answer: txt[1],
        explanation: `${{ escala: "La [[pe-correlacion|correlación]] no tiene unidades: no cambia si se suma una constante o se multiplica por un número positivo", signo: "Al cambiar el signo de $y$, $S_{xy}$ cambia de signo y $S_{yy}$ no", pendiente: `La pendiente es $b_1 = r\\frac{s_y}{s_x} \\approx ${nf(f.b1, 3)}$; coincide con $r$ solo si $s_x = s_y$`, suma: "Sumar una constante a $y$ corre los datos pero no cambia los desvíos respecto de la media: $r$ queda igual" }[kind]}. Es ${txt[1] ? "verdadero" : "falso"}.`,
        solution: [R`$r$ depende solo de los desvíos estandarizados, $\frac{x_i - \bar x}{s_x}$ y $\frac{y_i - \bar y}{s_y}$.`],
        // otro camino: se transforman los datos y se recalcula r
        verify: { kind: "truth", fn: () => {
          const r0 = fit(P).r;
          if (kind === "escala") return Math.abs(fit(P.map(p => [c * p[0] + d, p[1]])).r - r0) < 1e-12;
          if (kind === "signo") return Math.abs(fit(P.map(p => [p[0], -p[1]])).r + r0) < 1e-12;
          if (kind === "pendiente") return Math.abs(fit(P).b1 - r0) < 1e-9;
          return fit(P.map(p => [p[0], p[1] + (Math.abs(d) || 5)])).r > r0 + 1e-12;
        } }
      };
    }
  };

  T["pe-regresion-error"] = {
    type: "error", concepts: ["pe-regresion"], difficulty: 2,
    generate(r) {
      const P = pairs(r), f = fit(P);
      if (f.Syy === 0 || Math.abs(f.Syy - f.Sxx) < 1) return null;
      const ok = [`Medias: $\\bar x = ${nf(f.mx)}$ y $\\bar y = ${nf(f.my)}$.`, `$S_{xx} = ${nf(f.Sxx)}$, $S_{yy} = ${nf(f.Syy)}$ y $S_{xy} = ${nf(f.Sxy)}$.`, `Pendiente: $b_1 = \\frac{S_{xy}}{S_{xx}} \\approx ${nf(f.b1)}$.`, `Ordenada: $b_0 = \\bar y - b_1\\bar x \\approx ${nf(f.b0)}$.`];
      const steps = ok.slice(), kind = r.pick(["syy", "orden"]);
      let wrongIndex, fix;
      if (kind === "syy") { wrongIndex = 2; const w = f.Sxy / f.Syy; steps[2] = `Pendiente: $b_1 = \\frac{S_{xy}}{S_{yy}} \\approx ${nf(w)}$.`; steps[3] = `Ordenada: $b_0 = \\bar y - b_1\\bar x \\approx ${nf(f.my - w * f.mx)}$.`; fix = `La pendiente de $y$ sobre $x$ divide por $S_{xx}$: $b_1 = ${nf(f.b1)}$ (dividir por $S_{yy}$ da la recta de $x$ sobre $y$, invertida).`; }
      else { wrongIndex = 3; steps[3] = `Ordenada: $b_0 = \\bar x - b_1\\bar y \\approx ${nf(f.mx - f.b1 * f.my)}$.`; fix = `La recta pasa por $(\\bar x, \\bar y)$: $\\bar y = b_0 + b_1\\bar x$, así que $b_0 = \\bar y - b_1\\bar x \\approx ${nf(f.b0)}$.`; }
      return {
        prompt: `Alguien ajustó así la [[pe-regresion|recta de regresión]] de $y$ sobre $x$ para los datos $$${tab(P)}$$ <b>Tocá el primer paso incorrecto.</b>`,
        steps, wrongIndex, fix, solution: ok,
        verify: { kind: "truth", target: true, fn: () => Math.abs(S.golden(b => sse(P, b), -50, 50) - f.b1) < 1e-6 }
      };
    }
  };

  T["pe-pendiente-num"] = {
    type: "numeric", concepts: ["pe-regresion-inferencia"], difficulty: 3,
    generate(r) {
      const P = pairs(r), f = fit(P), n = f.n, ask = r.pick(["se", "seb1", "t", "ic"]);
      const SCE = f.Syy - f.b1 * f.Sxy;
      if (f.Syy === 0 || SCE < 0.5) return null;
      const se = Math.sqrt(SCE / (n - 2)), seb = se / Math.sqrt(f.Sxx), t = f.b1 / seb, crit = S.tq(0.975, n - 2), ans = { se, seb1: seb, t, ic: f.b1 + crit * seb }[ask];
      return {
        prompt: `Con los datos $$${tab(P)}$$ se ajustó la recta de regresión de $y$ sobre $x$. Calculá ${{ se: "el error estándar de la estimación $s_e$", seb1: "el error estándar de la pendiente", t: "el estadístico $t$ de la prueba de $H_0: \\beta_1 = 0$", ic: "el límite superior del intervalo del 95 % para la pendiente $\\beta_1$" }[ask]}.`,
        answer: ans,
        solution: [`$S_{xx} = ${nf(f.Sxx)}$, $S_{yy} = ${nf(f.Syy)}$, $S_{xy} = ${nf(f.Sxy)}$ y $b_1 = \\frac{S_{xy}}{S_{xx}} \\approx ${nf(f.b1)}$.`,
          `[[pe-regresion-inferencia|Suma de cuadrados residual]]: $SC_E = S_{yy} - b_1S_{xy} \\approx ${nf(SCE)}$, y $s_e = \\sqrt{\\frac{SC_E}{n - 2}} = \\sqrt{\\frac{${nf(SCE)}}{${n - 2}}} \\approx ${nf(se)}$.`,
          ...(ask === "se" ? [] : [`Error estándar de la pendiente: $\\frac{s_e}{\\sqrt{S_{xx}}} \\approx \\frac{${nf(se)}}{${nf(Math.sqrt(f.Sxx))}} \\approx ${nf(seb)}$.`]),
          ...(ask === "t" ? [`$t = \\frac{b_1}{s_e/\\sqrt{S_{xx}}} \\approx ${nf(t)}$, con $n - 2 = ${n - 2}$ grados de libertad. ${Math.abs(t) > crit ? `Como $|t| > t_{0{,}025;\\,${n - 2}} \\approx ${nf(crit, 3)}$, la pendiente es significativa al 5 %.` : `Como $|t| < t_{0{,}025;\\,${n - 2}} \\approx ${nf(crit, 3)}$, no hay evidencia al 5 % de que la pendiente sea distinta de cero.`}`] : []),
          ...(ask === "ic" ? [`Intervalo: $b_1 \\pm t_{0{,}025;\\,${n - 2}}\\frac{s_e}{\\sqrt{S_{xx}}} = ${nf(f.b1)} \\pm ${nf(crit, 3)}\\cdot ${nf(seb)}$; el límite superior es $\\approx ${nf(ans)}$.`] : [])],
        // otro camino: los residuos uno por uno, la descomposición SC_T = SC_R + SC_E (t² = SC_R/(SC_E/(n − 2))) y el cuantil integrando la densidad t
        verify: { kind: "value", tol: 1e-6, fn: () => {
          const my = S.mean(P.map(p => p[1])), yh = P.map(p => f.b0 + f.b1 * p[0]), sce = P.reduce((s, p, i) => s + (p[1] - yh[i]) ** 2, 0), scr = yh.reduce((s, v) => s + (v - my) ** 2, 0);
          const sev = Math.sqrt(sce / (n - 2)), tv = Math.sign(f.b1) * Math.sqrt(scr / (sce / (n - 2))), sb = Math.abs(f.b1 / tv);
          const cv = S.quantile(x => S.tcdfNum(x, n - 2), 0.975, -50, 50, 60);
          return { se: sev, seb1: sb, t: tv, ic: f.b1 + cv * sb }[ask];
        } }
      };
    }
  };

  T["pe-residuos-tf"] = {
    type: "tf", concepts: ["pe-regresion-inferencia"], difficulty: 2,
    generate(r) {
      const P = pairs(r), f = fit(P), kind = r.pick(["suma", "xe", "medio", "otra", "sumab0", "sce"]);
      if (f.Syy === 0 || Math.abs(f.b0) < 0.5 || Math.abs(f.b1 - 1) < 0.1 || Math.abs(f.b1) < 0.1) return null;
      const sceOk = f.Syy - f.b1 * f.Sxy, sceBad = f.Syy - f.b1 * f.Sxx, sceTrue = r.bool();
      if (Math.abs(sceOk - sceBad) < 0.5) return null;
      const txt = {
        suma: [`la suma de los residuos $e_i = y_i - \\hat y_i$ es cero`, true],
        xe: [`$\\sum x_ie_i = 0$, con $e_i = y_i - \\hat y_i$ los residuos`, true],
        medio: [`si se agrega a los datos el punto $(\\bar x, \\bar y) = (${nf(f.mx)};\\ ${nf(f.my)})$, la recta de mínimos cuadrados no cambia`, true],
        otra: [`la recta que pasa por $(\\bar x, \\bar y)$ con pendiente $${nf(f.b1 + 0.1, 4)}$ deja una suma de residuos al cuadrado menor que la recta de mínimos cuadrados`, false],
        sumab0: [`la suma de los residuos es igual a la ordenada al origen $b_0 \\approx ${nf(f.b0)}$`, false],
        sce: [`la suma de los residuos al cuadrado vale $${nf(sceTrue ? sceOk : sceBad)}$`, sceTrue]
      }[kind];
      return {
        prompt: `<b>Verdadero o falso:</b> para los datos $$${tab(P)}$$ con la recta de mínimos cuadrados $\\hat y = ${nf(f.b0)} ${f.b1 < 0 ? "-" : "+"} ${nf(Math.abs(f.b1))}x$, ${txt[0]}.`,
        answer: txt[1],
        explanation: `${{ suma: "Es la ecuación normal de la ordenada: derivar $\\sum e_i^2$ respecto de $b_0$ e igualar a cero da $\\sum e_i = 0$", xe: "Es la ecuación normal de la pendiente: derivar $\\sum e_i^2$ respecto de $b_1$ e igualar a cero da $\\sum x_ie_i = 0$", medio: "La recta pasa por $(\\bar x, \\bar y)$, así que ese punto tiene residuo cero; agregarlo no cambia $\\bar x$, $\\bar y$, $S_{xx}$ ni $S_{xy}$", otra: "La recta de mínimos cuadrados es justamente la que hace mínima esa suma: cualquier otra da una suma mayor", sumab0: "Los residuos de la recta de mínimos cuadrados suman cero, sea cual sea $b_0$", sce: `$SC_E = S_{yy} - b_1S_{xy} \\approx ${nf(sceOk)}$ (no $S_{yy} - b_1S_{xx}$)` }[kind]} ([[pe-regresion-inferencia]]). Es ${txt[1] ? "verdadero" : "falso"}.`,
        solution: [R`Los residuos de mínimos cuadrados cumplen $\sum e_i = 0$ y $\sum x_ie_i = 0$, y $SC_E = S_{yy} - b_1S_{xy}$.`],
        // otro camino: se calculan los residuos (o se reajusta la recta) con los datos
        verify: { kind: "truth", fn: () => {
          const e = P.map(p => p[1] - f.b0 - f.b1 * p[0]), sum = e.reduce((s, v) => s + v, 0);
          if (kind === "suma") return Math.abs(sum) < 1e-9;
          if (kind === "xe") return Math.abs(P.reduce((s, p, i) => s + p[0] * e[i], 0)) < 1e-9;
          if (kind === "medio") { const g = fit(P.concat([[f.mx, f.my]])); return Math.abs(g.b1 - f.b1) < 1e-9 && Math.abs(g.b0 - f.b0) < 1e-9; }
          if (kind === "otra") { const b = f.b1 + 0.1, b0 = f.my - b * f.mx; return P.reduce((s, p) => s + (p[1] - b0 - b * p[0]) ** 2, 0) < e.reduce((s, v) => s + v * v, 0); }
          if (kind === "sumab0") return Math.abs(sum - f.b0) < 1e-9;
          return Math.abs(e.reduce((s, v) => s + v * v, 0) - (sceTrue ? sceOk : sceBad)) < 1e-6;
        } }
      };
    }
  };

  const cards = {
    "pe-regresion": {
      title: "Regresión lineal por mínimos cuadrados", aliases: ["regresión lineal", "recta de regresión", "mínimos cuadrados", "método de mínimos cuadrados", "residuo", "residuos"], concepts: ["pe-regresion"],
      summary: "La recta ŷ = b₀ + b₁x que minimiza la suma de los residuos al cuadrado tiene b₁ = Sxy/Sxx y b₀ = ȳ − b₁x̄; pasa por (x̄, ȳ).",
      def: [R`**Modelo:** $y = \beta_0 + \beta_1x + \varepsilon$, con un error aleatorio $\varepsilon$ de media $0$. Se estiman $\beta_0$ y $\beta_1$ con los datos $(x_i, y_i)$.`,
        R`**Mínimos cuadrados:** se eligen $b_0$, $b_1$ que minimizan $\sum (y_i - b_0 - b_1x_i)^2$. Resultado: $b_1 = \frac{S_{xy}}{S_{xx}}$ y $b_0 = \bar y - b_1\bar x$, con $S_{xx} = \sum (x_i - \bar x)^2$ y $S_{xy} = \sum (x_i - \bar x)(y_i - \bar y)$.`,
        R`**Residuo:** $e_i = y_i - \hat y_i$. Los residuos suman cero. **Predicción:** $\hat y(x_0) = b_0 + b_1x_0$; fuera del rango de los $x$ observados es una extrapolación arriesgada.`],
      idea: [R`Se busca la recta que pasa «más cerca» de los puntos, midiendo la distancia en vertical, porque lo que se quiere predecir es $y$. Elevar al cuadrado castiga los errores grandes y hace que el problema tenga una solución con fórmula.`],
      demo: [R`**Paso 1 (la ordenada).** Para una pendiente $b_1$ fija, $\sum (y_i - b_1x_i - b_0)^2$ es la suma de cuadrados de los datos $z_i = y_i - b_1x_i$ respecto de $b_0$; la minimiza la media de los $z_i$ ([[pe-centralizacion]]): $b_0 = \bar y - b_1\bar x$. La recta pasa por $(\bar x, \bar y)$.`,
        R`**Paso 2.** Reemplazando, queda minimizar $g(b_1) = \sum \big((y_i - \bar y) - b_1(x_i - \bar x)\big)^2 = S_{yy} - 2b_1S_{xy} + b_1^2S_{xx}$, desarrollando el cuadrado.`,
        R`**Paso 3.** Es una parábola en $b_1$ que abre hacia arriba (porque $S_{xx} > 0$); su derivada $-2S_{xy} + 2b_1S_{xx}$ se anula en $b_1 = \frac{S_{xy}}{S_{xx}}$. $\blacksquare$`],
      examples: [{ q: R`Datos $(1, 2), (2, 4), (3, 5)$.`, steps: [R`$\bar x = 2$, $\bar y = \frac{11}{3}$; $S_{xx} = 2$, $S_{xy} = 3$.`, R`$b_1 = 1{,}5$ y $b_0 = \frac{11}{3} - 3 = \frac23$.`] }],
      tips: [R`La recta de $x$ sobre $y$ no es la misma recta despejada: minimiza las distancias horizontales.`],
      see: ["pe-correlacion", "pe-centralizacion"]
    },
    "pe-regresion-inferencia": {
      title: "Inferencia en la regresión: residuos y pendiente", aliases: ["error estándar de la estimación", "error estándar de la pendiente", "suma de cuadrados residual", "suma de cuadrados de la regresión", "prueba para la pendiente", "ecuaciones normales"], concepts: ["pe-regresion-inferencia"],
      summary: "Los residuos cumplen Σeᵢ = 0 y Σxᵢeᵢ = 0. SC_T = SC_R + SC_E, con SC_E = S_yy − b₁S_xy. s_e = √(SC_E/(n − 2)); el error estándar de b₁ es s_e/√S_xx, y t = b₁/(s_e/√S_xx) ~ tₙ₋₂ bajo H₀: β₁ = 0.",
      def: [R`**Ecuaciones normales:** los $b_0$, $b_1$ de [[pe-regresion|mínimos cuadrados]] cumplen $\sum e_i = 0$ y $\sum x_ie_i = 0$, con $e_i = y_i - \hat y_i$.`,
        R`**Sumas de cuadrados:** total $SC_T = S_{yy} = \sum (y_i - \bar y)^2$; de la regresión $SC_R = \sum (\hat y_i - \bar y)^2 = b_1S_{xy}$; residual $SC_E = \sum e_i^2 = S_{yy} - b_1S_{xy}$. Se cumple $SC_T = SC_R + SC_E$, y $R^2 = \frac{SC_R}{SC_T}$ ([[pe-correlacion]]).`,
        R`**Error estándar de la estimación:** $s_e = \sqrt{\frac{SC_E}{n - 2}}$, que estima el desvío $\sigma$ del error $\varepsilon$ del modelo.`,
        R`**Inferencia para la pendiente** (errores normales, independientes y con la misma varianza): $\frac{b_1 - \beta_1}{s_e/\sqrt{S_{xx}}} \sim t_{n-2}$. Para $H_0: \beta_1 = 0$ (que $x$ no sirve para predecir $y$), $t = \frac{b_1}{s_e/\sqrt{S_{xx}}}$; el intervalo es $b_1 \pm t_{\alpha/2;\,n-2}\frac{s_e}{\sqrt{S_{xx}}}$.`],
      idea: [R`Aunque $x$ e $y$ no tengan nada que ver, los datos casi nunca dan $b_1 = 0$ justo: la pendiente estimada cambia de muestra en muestra. La prueba pregunta si la $b_1$ observada es más grande que lo que daría el puro ruido.`,
        R`La pendiente es más precisa cuanto menos ruido hay ($s_e$ chico) y cuanto más separados están los $x$ ($S_{xx}$ grande): una recta apoyada en puntos muy juntos «baila» mucho.`],
      demo: [R`**Paso 1 (ecuaciones normales).** $b_0$ y $b_1$ minimizan $Q = \sum (y_i - b_0 - b_1x_i)^2$, así que las dos derivadas parciales se anulan: $\frac{\partial Q}{\partial b_0} = -2\sum e_i = 0$ y $\frac{\partial Q}{\partial b_1} = -2\sum x_ie_i = 0$.`,
        R`**Paso 2 (descomposición).** $y_i - \bar y = e_i + (\hat y_i - \bar y)$. Al elevar al cuadrado y sumar, el término cruzado es $2\sum e_i(\hat y_i - \bar y) = 2\sum e_i(b_0 + b_1x_i - \bar y)$, que se anula por las dos ecuaciones del paso 1. Queda $SC_T = SC_E + SC_R$.`,
        R`**Paso 3 ($SC_R$).** $\hat y_i - \bar y = b_1(x_i - \bar x)$, porque la recta pasa por $(\bar x, \bar y)$. Entonces $SC_R = b_1^2S_{xx} = b_1S_{xy}$, usando $b_1S_{xx} = S_{xy}$; y por el paso 2, $SC_E = S_{yy} - b_1S_{xy}$.`,
        R`**Paso 4 (varianza de la pendiente).** $b_1 = \frac{S_{xy}}{S_{xx}} = \sum c_iy_i$ con $c_i = \frac{x_i - \bar x}{S_{xx}}$ (el término con $\bar y$ desaparece porque $\sum (x_i - \bar x) = 0$). Los $y_i$ son independientes con varianza $\sigma^2$, así que $Var(b_1) = \sigma^2\sum c_i^2 = \sigma^2\frac{S_{xx}}{S_{xx}^2} = \frac{\sigma^2}{S_{xx}}$ ([[pe-conjuntas]]).`,
        R`**Paso 5 (la t).** Con errores normales, $b_1$ es normal, $\frac{(n - 2)s_e^2}{\sigma^2} \sim \chi^2_{n-2}$ (se pierden dos grados por estimar $b_0$ y $b_1$) y es independiente de $b_1$. Estandarizando con $s_e$ en lugar de $\sigma$ queda una $t_{n-2}$, como en [[pe-muestrales]]. $\blacksquare$`],
      examples: [{ q: R`$n = 6$, $S_{xx} = 17{,}5$, $S_{yy} = 60$, $S_{xy} = 31{,}5$.`, steps: [R`$b_1 = 1{,}8$; $SC_E = 60 - 1{,}8\cdot31{,}5 = 3{,}3$; $s_e = \sqrt{3{,}3/4} \approx 0{,}908$.`, R`Error estándar de $b_1$: $\frac{0{,}908}{\sqrt{17{,}5}} \approx 0{,}217$; $t \approx 8{,}29$, con 4 grados: la pendiente es claramente significativa.`] }],
      tips: [R`Mirá el gráfico de residuos contra $x$: si tiene forma (una curva, un embudo), el modelo lineal o la varianza constante no valen, aunque $R^2$ sea alto.`, R`En la regresión simple, la prueba $t$ de la pendiente y la de $\rho = 0$ son la misma: $t^2 = \frac{SC_R}{SC_E/(n - 2)}$.`],
      see: ["pe-regresion", "pe-correlacion", "pe-test-media"]
    },
    "pe-correlacion": {
      title: "Correlación y coeficiente de determinación", aliases: ["coeficiente de correlación", "correlación lineal", "coeficiente de determinación", "coeficiente de Pearson"], concepts: ["pe-correlacion"],
      summary: "r = Sxy/√(SxxSyy), entre −1 y 1, mide la fuerza de la relación lineal. R² = r² es la fracción de la variación de y que explica la recta: R² = 1 − SC_res/SC_total.",
      def: [R`**Coeficiente de correlación:** $r = \frac{S_{xy}}{\sqrt{S_{xx}S_{yy}}}$. Vale $\pm1$ solo si los puntos están exactamente sobre una recta, y su signo es el de la pendiente. Es la versión muestral de la $\rho$ de la [[pe-conjuntas|covarianza]].`,
        R`**Coeficiente de determinación:** $R^2 = 1 - \frac{\sum (y_i - \hat y_i)^2}{\sum (y_i - \bar y)^2}$; en la regresión lineal simple, $R^2 = r^2$.`],
      idea: [R`$r$ no tiene unidades: no cambia al cambiar de escala. Mide qué tan alineados están los puntos, no qué tan empinada es la recta.`,
        R`Correlación no es causalidad: dos variables pueden estar muy correlacionadas porque las dos dependen de una tercera.`],
      demo: [R`**Paso 1 ($|r| \le 1$).** Por la desigualdad de [[al-euclideo|Cauchy-Schwarz]] aplicada a los vectores de desvíos $(x_i - \bar x)$ e $(y_i - \bar y)$: $|S_{xy}| \le \sqrt{S_{xx}}\sqrt{S_{yy}}$, así que $|r| \le 1$, con igualdad solo si los vectores son proporcionales (los puntos están sobre una recta).`,
        R`**Paso 2 ($R^2 = r^2$).** Con la recta de [[pe-regresion|mínimos cuadrados]], la suma de residuos al cuadrado es el mínimo de la parábola del paso 2 de esa ficha: $S_{yy} - 2b_1S_{xy} + b_1^2S_{xx}$ con $b_1 = \frac{S_{xy}}{S_{xx}}$, que da $S_{yy} - \frac{S_{xy}^2}{S_{xx}}$.`,
        R`**Paso 3.** Entonces $R^2 = 1 - \frac{S_{yy} - S_{xy}^2/S_{xx}}{S_{yy}} = \frac{S_{xy}^2}{S_{xx}S_{yy}} = r^2$. $\blacksquare$`],
      examples: [{ q: R`$S_{xx} = 10$, $S_{yy} = 40$, $S_{xy} = 18$.`, steps: [R`$r = \frac{18}{\sqrt{400}} = 0{,}9$ y $R^2 = 0{,}81$: la recta explica el 81 % de la variación de $y$.`] }],
      tips: [R`Un $r$ cercano a cero no quiere decir que no haya relación: puede haber una relación curva (por ejemplo, una parábola).`],
      see: ["pe-regresion", "pe-conjuntas"]
    }
  };

  E.extendCourse("m105", {
    concepts: { "pe-regresion": { name: "Regresión lineal" }, "pe-correlacion": { name: "Correlación" }, "pe-regresion-inferencia": { name: "Inferencia en la regresión" } },
    templates: T,
    units: [{
      id: "pe-regresion-u", order: 8, program: "Unidad 8", title: "Regresión y correlación", icon: "zap",
      diagnostic: ["pe-regresion-num", "pe-correlacion-num", "pe-r-tf"],
      lessons: [
        { id: "pe-reg-l1", title: "La recta de mínimos cuadrados", templates: ["pe-regresion-num", "pe-regresion-error"], theory: ["pe-regresion"],
          intro: R`$b_1 = \frac{S_{xy}}{S_{xx}}$, y la recta pasa por $(\bar x, \bar y)$.` },
        { id: "pe-reg-l2", title: "Correlación", templates: ["pe-correlacion-num", "pe-r-tf"], theory: ["pe-correlacion"],
          intro: R`$r$ mide qué tan alineados están los puntos; $R^2$, cuánto explica la recta.` },
        { id: "pe-reg-l3", title: "Residuos e inferencia para la pendiente", templates: ["pe-pendiente-num", "pe-residuos-tf"], theory: ["pe-regresion-inferencia"],
          intro: R`¿La pendiente observada es más grande que lo que daría el puro ruido?` }
      ]
    }],
    cards
  });
})();
