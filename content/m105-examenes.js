/* ===== M105 · Evaluaciones: parciales y final práctico simulados =====
   Estructura tomada del informe de parcial de 2020 y del final de 2021 (ver docs/parciales/m105.md): análisis de
   datos con interpretación. En la app los datos son chicos, para poder hacer las cuentas a mano; se sortean en
   cada intento. */
(function () {
  const E = window.Efecen, R = String.raw, S = E.pye, nf = S.nf;
  const SELF = {};
  const data = (r, n, lo, hi) => Array.from({ length: n }, () => r.int(lo, hi));
  // densidad F y su cuantil por integración numérica (para los verify)
  const Fpdf = (x, a, b) => (x <= 0 ? 0 : Math.exp(S.lgamma((a + b) / 2) - S.lgamma(a / 2) - S.lgamma(b / 2) + (a / 2) * Math.log(a / b) + (a / 2 - 1) * Math.log(x) - ((a + b) / 2) * Math.log(1 + a * x / b)));
  // con x = u² para que el integrando sea suave en 0
  const FqNum = (p, a, b) => S.quantile(q => S.simpson(u => 2 * u * Fpdf(u * u, a, b), 0, Math.sqrt(q), 1500), p, 0, 30, 60);
  const pairVar = a => { let s = 0; for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) s += (a[i] - a[j]) ** 2; return s / (a.length * (a.length - 1)); };

  // ---------- 1.er parcial ----------
  // análisis descriptivo completo de una muestra
  SELF["pe-ex-descriptiva"] = {
    concepts: ["pe-centralizacion", "pe-dispersion", "pe-posicion-forma"],
    generate(r) {
      const n = r.int(12, 15), a = data(r, n - 1, 40, 70).concat(r.bool() ? [r.int(85, 110)] : [r.int(41, 69)]), b = S.sorted(a), h = Math.floor(n / 2);
      const m = S.mean(a), med = S.median(a), q1 = S.median(b.slice(0, h)), q3 = S.median(b.slice(n - h)), iqr = q3 - q1, s = Math.sqrt(S.var(a)), cv = 100 * s / m;
      const m3 = S.mean(a.map(x => (x - m) ** 3)), g1 = m3 / s ** 3, lo = q1 - 1.5 * iqr, hi = q3 + 1.5 * iqr, out = b.filter(x => x < lo || x > hi), k = Math.round(1 + 3.322 * Math.log10(n));
      const forma = g1 > 0.3 ? "asimétrica a la derecha" : g1 < -0.3 ? "asimétrica a la izquierda" : "aproximadamente simétrica";
      return {
        prompt: `Se registró el diámetro (en mm) de ${n} frutos de una parcela: $${S.list(a)}$. a) Calculá la media, la mediana y los cuartiles ($Q_1$ y $Q_3$ como medianas de cada mitad). b) Calculá el desvío estándar y el coeficiente de variación. c) Calculá el coeficiente de asimetría y describí la forma de la distribución. d) Indicá si hay valores atípicos y describí el diagrama de caja. e) ¿Cuántas clases usarías para el histograma según la regla de Sturges? Interpretá los resultados.`,
        rubric: [
          { text: `a) $\\bar x \\approx ${nf(m, 2)}$ mm, mediana $${nf(med, 2)}$ mm, $Q_1 = ${nf(q1, 2)}$ y $Q_3 = ${nf(q3, 2)}$ mm.`, w: 3 },
          { text: `b) $s \\approx ${nf(s, 2)}$ mm y $CV \\approx ${nf(cv, 1)}\\,\\%$.`, w: 2 },
          { text: `c) $g_1 \\approx ${nf(g1, 2)}$: ${forma}.`, w: 2 },
          { text: `d) Bigotes hasta $[${nf(lo, 2)};\\ ${nf(hi, 2)}]$; ${out.length ? `atípico(s): $${S.list(out)}$` : "no hay atípicos"}.`, w: 2 },
          { text: `e) $k = 1 + 3{,}322\\log_{10} ${n} \\approx ${k}$ clases, e interpretación de los resultados con sus unidades.`, w: 1 }
        ],
        solution: [
          `Ordenados: $${S.list(b)}$.`,
          `a) [[pe-centralizacion|Media]] $\\bar x = \\frac{${a.reduce((x, y) => x + y, 0)}}{${n}} \\approx ${nf(m, 2)}$ mm; mediana $${nf(med, 2)}$ mm. Mitad inferior $${S.list(b.slice(0, h))}$ y superior $${S.list(b.slice(n - h))}$: $Q_1 = ${nf(q1, 2)}$ mm y $Q_3 = ${nf(q3, 2)}$ mm.`,
          `b) [[pe-dispersion|Desvío]] $s = \\sqrt{\\frac{\\sum (x_i - \\bar x)^2}{n - 1}} \\approx ${nf(s, 2)}$ mm; $CV = \\frac{s}{\\bar x} \\approx ${nf(cv, 1)}\\,\\%$: ${cv < 15 ? "una dispersión baja respecto de la media" : "una dispersión moderada"}.`,
          `c) $g_1 = \\frac{\\frac1n\\sum (x_i - \\bar x)^3}{s^3} \\approx ${nf(g1, 2)}$: la distribución es ${forma}${Math.abs(m - med) > 0.5 ? ` (la media ${m > med ? "supera" : "queda por debajo de"} la mediana)` : ""}.`,
          `d) $RIC = ${nf(iqr, 2)}$; los límites para atípicos son $Q_1 - 1{,}5\\,RIC = ${nf(lo, 2)}$ y $Q_3 + 1{,}5\\,RIC = ${nf(hi, 2)}$. ${out.length ? `Es atípico $${S.list(out)}$: en el diagrama de caja se marca aparte, y el bigote llega hasta el mayor dato no atípico.` : "No hay atípicos: los bigotes llegan hasta el mínimo y el máximo."} La caja va de $${nf(q1, 2)}$ a $${nf(q3, 2)}$, con la mediana en $${nf(med, 2)}$.`,
          `e) [[pe-tablas-frecuencia|Regla de Sturges]]: $k = 1 + 3{,}322\\log_{10} n = 1 + 3{,}322\\log_{10}${n} \\approx ${k}$ clases.`
        ],
        // otro camino: varianza con la fórmula de pares, cuartiles por conteo y g₁ con los momentos crudos
        verify: { kind: "zero", tol: 1e-9, scale: 10, fn: () => {
          const v = pairVar(a), e2 = S.mean(a.map(x => x * x)), e3 = S.mean(a.map(x => x ** 3)), m3b = e3 - 3 * m * e2 + 2 * m ** 3;
          return [Math.sqrt(v) - s, m3b / s ** 3 - g1, S.isMedian(a, med) ? 0 : 1, S.isMedian(b.slice(0, h), q1) ? 0 : 1, S.isMedian(b.slice(n - h), q3) ? 0 : 1];
        } }
      };
    }
  };

  // muestreo estratificado con asignación proporcional y sistemático dentro de cada estrato
  SELF["pe-ex-estratificado"] = {
    concepts: ["pe-centralizacion"],
    generate(r) {
      const kS = r.int(3, 4), Nh = Array.from({ length: kS }, () => r.int(5, 60) * 10), N = Nh.reduce((x, y) => x + y, 0), n = r.pick([40, 50, 60, 80]);
      // asignación proporcional redondeada con el método del mayor resto
      const raw = Nh.map(x => n * x / N), nh = raw.map(Math.floor);
      raw.map((x, i) => [x - Math.floor(x), i]).sort((p, q) => q[0] - p[0]).slice(0, n - nh.reduce((x, y) => x + y, 0)).forEach(([, i]) => nh[i]++);
      if (nh.some(x => x < 2)) return null;
      const step = Nh.map((x, i) => Math.floor(x / nh[i]));
      return {
        prompt: `Una finca tiene ${kS} zonas con ${Nh.join(", ")} plantas (en total ${N}). Se quiere una muestra estratificada de ${n} plantas, con asignación proporcional al tamaño de cada zona. a) ¿Cuántas plantas se toman de cada zona? b) Si dentro de cada zona se usa un muestreo sistemático sobre la lista de plantas, ¿cada cuántas se elige una? c) ¿Por qué conviene estratificar en este caso?`,
        rubric: [
          { text: `a) $n_h = n\\frac{N_h}{N}$: ${raw.map((x, i) => `zona ${i + 1}: $${nf(x, 2)} \\to ${nh[i]}$`).join("; ")} (suman ${n}).`, w: 4 },
          { text: `b) Paso $k_h = \\left\\lfloor\\frac{N_h}{n_h}\\right\\rfloor$: ${step.map((x, i) => `zona ${i + 1}, cada ${x}`).join("; ")}, empezando en una planta elegida al azar entre las primeras $k_h$.`, w: 3 },
          { text: R`c) Las zonas pueden diferir entre sí; estratificar asegura que todas estén representadas en su proporción y reduce la variabilidad de las estimaciones.`, w: 3 }
        ],
        solution: [
          `a) En la [[pe-muestreo|asignación proporcional]] cada zona aporta a la muestra la misma fracción que tiene en la población: $n_h = ${n}\\cdot\\frac{N_h}{${N}}$. Da ${raw.map(x => `$${nf(x, 2)}$`).join(", ")}; redondeando de modo que sumen ${n} (se les suma uno a los de mayor parte decimal): ${nh.join(", ")}.`,
          `b) Para elegir $n_h$ plantas de una lista de $N_h$, se toma una cada $k_h = ${step.map((x, i) => `\\lfloor ${Nh[i]}/${nh[i]}\\rfloor = ${x}`).join(",\\ ")}$, con un arranque aleatorio entre $1$ y $k_h$. Conviene mezclar antes la lista si puede tener un orden que coincida con el paso.`,
          R`c) Si las zonas son distintas (suelo, riego, exposición), una muestra aleatoria simple podría quedar con pocas plantas de alguna. Estratificando, cada zona está representada en su proporción y la estimación general es más precisa.`
        ],
        verify: { kind: "zero", tol: 1e-12, fn: () => [nh.reduce((x, y) => x + y, 0) - n, ...nh.map((x, i) => (Math.abs(x - n * Nh[i] / N) < 1 ? 0 : 1)), ...step.map((k, i) => (k * nh[i] <= Nh[i] && (k + 1) * nh[i] > Nh[i] ? 0 : 1))] }
      };
    }
  };

  // ---------- final práctico ----------
  // intervalo unilateral derecho del 95 % para la varianza, a partir de datos
  SELF["pe-ex-ic-varianza"] = {
    concepts: ["pe-ic-proporcion-varianza"],
    generate(r) {
      const n = r.int(10, 14), a = data(r, n, 10, 35), s2 = S.var(a), k = n - 1, chi = S.chi2q(0.95, k), lo = k * s2 / chi;
      return {
        prompt: `Se midió la temperatura media (°C) de ${n} días elegidos al azar: $${S.list(a)}$. Suponiendo que la temperatura es normal, calculá el intervalo de confianza unilateral derecho del 95 % para la varianza, e interpretalo.`,
        rubric: [
          { text: `$\\bar x \\approx ${nf(S.mean(a), 2)}$ °C y $s^2 \\approx ${nf(s2, 3)}$ °C².`, w: 2 },
          { text: `Pivote $\\frac{(n - 1)S^2}{\\sigma^2} \\sim \\chi^2_{${k}}$ y valor $\\chi^2_{0{,}05;\\,${k}} \\approx ${nf(chi, 3)}$.`, w: 3 },
          { text: `Intervalo $\\left(\\frac{${k}\\cdot${nf(s2, 3)}}{${nf(chi, 3)}};\\ \\infty\\right) \\approx (${nf(lo, 3)};\\ \\infty)$ °C².`, w: 3 },
          { text: R`Interpretación: con 95 % de confianza la varianza de la temperatura es mayor que esa cota (y el desvío, mayor que su raíz).`, w: 2 }
        ],
        solution: [`$s^2 = \\frac{\\sum (x_i - \\bar x)^2}{n - 1} \\approx ${nf(s2, 3)}$ °C².`,
          `Unilateral derecho quiere decir de la forma $(c, \\infty)$: se usa $P\\left(\\frac{(n - 1)S^2}{\\sigma^2} < \\chi^2_{0{,}05;\\,${k}}\\right) = 0{,}95$ ([[pe-ic-proporcion-varianza]]), y despejando, $\\sigma^2 > \\frac{(n - 1)s^2}{\\chi^2_{0{,}05;\\,${k}}}$.`,
          `$\\chi^2_{0{,}05;\\,${k}} \\approx ${nf(chi, 3)}$, así que $\\sigma^2 \\in (${nf(lo, 3)};\\ \\infty)$ °C², o $\\sigma > ${nf(Math.sqrt(lo), 3)}$ °C.`,
          R`Con un 95 % de confianza, la variabilidad de la temperatura diaria es al menos esa: el método produce intervalos que contienen a $\sigma^2$ en el 95 % de las muestras.`],
        verify: { kind: "zero", tol: 1e-6, fn: () => [S.chi2cdfNum(k * s2 / lo, k) - 0.95, pairVar(a) - s2] }
      };
    }
  };

  // intervalo bilateral del 95 % para la media, a partir de datos
  SELF["pe-ex-ic-media"] = {
    concepts: ["pe-ic-media"],
    generate(r) {
      const n = r.int(8, 12), a = data(r, n, 40, 90), m = S.mean(a), s = Math.sqrt(S.var(a)), t = S.tq(0.975, n - 1), e = t * s / Math.sqrt(n);
      return {
        prompt: `La humedad relativa (%) de ${n} días al azar fue: $${S.list(a)}$. Suponiendo normalidad, calculá el intervalo de confianza bilateral del 95 % para la humedad media, e interpretalo.`,
        rubric: [
          { text: `$\\bar x \\approx ${nf(m, 2)}\\,\\%$ y $s \\approx ${nf(s, 3)}\\,\\%$.`, w: 2 },
          { text: `$\\sigma$ desconocida: $t_{0{,}025;\\,${n - 1}} \\approx ${nf(t, 3)}$ y margen $${nf(t, 3)}\\cdot\\frac{${nf(s, 3)}}{\\sqrt{${n}}} \\approx ${nf(e, 3)}$.`, w: 4 },
          { text: `Intervalo $(${nf(m - e, 2)};\\ ${nf(m + e, 2)})$ % e interpretación correcta del nivel de confianza.`, w: 4 }
        ],
        solution: [`$\\bar x = ${nf(m, 3)}$ y $s = ${nf(s, 3)}$.`,
          `Con $\\sigma$ desconocida y $n$ chico, el pivote es $t_{${n - 1}}$ ([[pe-ic-media]]): $\\bar x \\pm t_{0{,}025;\\,${n - 1}}\\frac{s}{\\sqrt n}$, con $t \\approx ${nf(t, 3)}$.`,
          `Margen $\\approx ${nf(e, 3)}$: el intervalo es $(${nf(m - e, 2)};\\ ${nf(m + e, 2)})$ %.`,
          R`Con un 95 % de confianza, la humedad media de la población de días está en ese intervalo: el procedimiento acierta en el 95 % de las muestras posibles.`],
        verify: { kind: "zero", tol: 1e-6, fn: () => [S.tcdfNum(e * Math.sqrt(n) / s, n - 1) - 0.975, Math.sqrt(pairVar(a)) - s] }
      };
    }
  };

  // correlación y regresión con interpretación
  SELF["pe-ex-regresion"] = {
    concepts: ["pe-regresion", "pe-correlacion"],
    generate(r) {
      const n = 8, b1t = r.pick([-1.5, -0.8, 0.6, 1.2, 2]), xs = r.distinct(n, 5, 30).sort((x, y) => x - y), ys = xs.map(x => Math.round(20 + b1t * x + r.int(-6, 6)));
      const mx = S.mean(xs), my = S.mean(ys), Sxx = xs.reduce((s, x) => s + (x - mx) ** 2, 0), Syy = ys.reduce((s, y) => s + (y - my) ** 2, 0), Sxy = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0);
      if (Syy === 0) return null;
      const b1 = Sxy / Sxx, b0 = my - b1 * mx, rr = Sxy / Math.sqrt(Sxx * Syy), cov = Sxy / (n - 1), R2 = rr * rr;
      const fuerza = Math.abs(rr) > 0.8 ? "fuerte" : Math.abs(rr) > 0.5 ? "moderada" : "débil";
      const tab = `\\begin{array}{c|${"c".repeat(n)}} x & ${xs.join(" & ")} \\\\ \\hline y & ${ys.join(" & ")} \\end{array}`;
      return {
        prompt: `Se registraron la radiación solar media $x$ (en cientos de W/m²) y la evaporación $y$ (en décimas de mm) de ${n} días: $$${tab}$$ a) Calculá la covarianza y el coeficiente de correlación de Pearson, e interpretalos. b) Ajustá la recta de regresión de $y$ sobre $x$. c) Calculá $R^2$ y comentá la bondad del ajuste.`,
        rubric: [
          { text: `a) $Cov = \\frac{S_{xy}}{n - 1} \\approx ${nf(cov, 3)}$ y $r \\approx ${nf(rr, 3)}$: relación lineal ${rr > 0 ? "positiva" : "negativa"} ${fuerza}.`, w: 4 },
          { text: `b) $b_1 = \\frac{S_{xy}}{S_{xx}} \\approx ${nf(b1, 3)}$, $b_0 = \\bar y - b_1\\bar x \\approx ${nf(b0, 3)}$: $\\hat y = ${nf(b0, 3)} ${b1 < 0 ? "-" : "+"} ${nf(Math.abs(b1), 3)}x$.`, w: 3 },
          { text: `c) $R^2 = r^2 \\approx ${nf(R2, 3)}$: la recta explica el ${S.nt(100 * R2, 1)} % de la variación de $y$.`, w: 3 }
        ],
        solution: [`$\\bar x = ${nf(mx, 3)}$, $\\bar y = ${nf(my, 3)}$, $S_{xx} = ${nf(Sxx, 3)}$, $S_{yy} = ${nf(Syy, 3)}$ y $S_{xy} = ${nf(Sxy, 3)}$.`,
          `a) [[pe-conjuntas|Covarianza]] muestral $\\frac{S_{xy}}{n - 1} \\approx ${nf(cov, 3)}$: ${cov > 0 ? "las dos variables tienden a crecer juntas" : "cuando una crece, la otra tiende a bajar"}. Su valor depende de las unidades; la [[pe-correlacion|correlación]] no: $r = \\frac{S_{xy}}{\\sqrt{S_{xx}S_{yy}}} \\approx ${nf(rr, 3)}$, una relación lineal ${fuerza}.`,
          `b) [[pe-regresion|Mínimos cuadrados]]: $\\hat y = ${nf(b0, 3)} ${b1 < 0 ? "-" : "+"} ${nf(Math.abs(b1), 3)}x$. La pendiente dice que por cada unidad más de $x$ la evaporación ${b1 > 0 ? "aumenta" : "baja"} en promedio $${nf(Math.abs(b1), 3)}$ décimas de mm.`,
          `c) $R^2 \\approx ${nf(R2, 3)}$: ${R2 > 0.7 ? "un buen ajuste" : R2 > 0.4 ? "un ajuste moderado" : "un ajuste pobre; la recta explica poco"}. (Correlación no implica causalidad, aunque acá hay una razón física para la relación.)`],
        // otro camino: la pendiente minimizando la suma de cuadrados y R² con los residuos
        verify: { kind: "zero", tol: 1e-6, fn: () => {
          const sse = b => { const c0 = S.mean(ys.map((y, i) => y - b * xs[i])); return ys.reduce((s, y, i) => s + (y - c0 - b * xs[i]) ** 2, 0); };
          const bb = S.golden(sse, -20, 20);
          return [bb - b1, (1 - sse(b1) / Syy) - R2];
        } }
      };
    }
  };

  // ANOVA de un factor: ¿influye la estación del año?
  SELF["pe-ex-anova"] = {
    concepts: ["pe-anova"],
    generate(r) {
      const base = r.int(10, 20), eff = [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)], g = eff.map(e => data(r, r.int(3, 4), base + e - 3, base + e + 3));
      const N = g.reduce((s, x) => s + x.length, 0), k = 4, mg = S.mean(g.flat()), ms = g.map(S.mean);
      const SSB = g.reduce((s, x, i) => s + x.length * (ms[i] - mg) ** 2, 0), SSW = g.reduce((s, x, i) => s + x.reduce((t, v) => t + (v - ms[i]) ** 2, 0), 0);
      if (SSW === 0) return null;
      const F = SSB / (k - 1) / (SSW / (N - k)), Fc = S.Fq(0.95, k - 1, N - k), rej = F > Fc, est = ["Verano", "Otoño", "Invierno", "Primavera"];
      return {
        prompt: `Se midió la velocidad media del viento (km/h) en días de cada estación: ${g.map((x, i) => `${est[i]}: $${S.list(x)}$`).join("; ")}. Con un ANOVA de un factor y $\\alpha = 0{,}05$, ¿hay evidencia de que la estación influye en la velocidad media? Armá la tabla del ANOVA e interpretá.`,
        rubric: [
          { text: `Hipótesis: $H_0: \\mu_V = \\mu_O = \\mu_I = \\mu_P$ contra $H_1$: alguna media difiere (supuestos: normalidad y varianzas iguales).`, w: 2 },
          { text: `$SC_E \\approx ${nf(SSB, 3)}$ (3 g.l.) y $SC_D \\approx ${nf(SSW, 3)}$ (${N - k} g.l.).`, w: 3 },
          { text: `$F = \\frac{SC_E/3}{SC_D/${N - k}} \\approx ${nf(F, 3)}$ y $F_{0{,}05;\\,3,\\,${N - k}} \\approx ${nf(Fc, 3)}$.`, w: 3 },
          { text: `${rej ? "Se rechaza $H_0$: la estación influye en la velocidad media." : "No se rechaza $H_0$: no hay evidencia de que la estación influya."}`, w: 2 }
        ],
        solution: [`Medias: ${ms.map((x, i) => `${est[i]} $${nf(x, 3)}$`).join(", ")}; media general $${nf(mg, 3)}$.`,
          `[[pe-anova|Sumas de cuadrados]]: entre estaciones $SC_E = \\sum n_i(\\bar x_i - \\bar x)^2 \\approx ${nf(SSB, 3)}$, dentro $SC_D \\approx ${nf(SSW, 3)}$.`,
          `$$\\begin{array}{lccc} \\text{Fuente} & SC & \\text{g.l.} & CM \\\\ \\hline \\text{Entre} & ${nf(SSB, 2)} & 3 & ${nf(SSB / 3, 2)} \\\\ \\text{Dentro} & ${nf(SSW, 2)} & ${N - k} & ${nf(SSW / (N - k), 2)} \\end{array}$$`,
          `$F \\approx ${nf(F, 3)}$; el valor crítico de la [[pe-muestrales|F]] con $(3, ${N - k})$ grados al 5 % es $\\approx ${nf(Fc, 3)}$. ${rej ? "Como $F$ lo supera, se rechaza $H_0$: al menos una estación tiene una velocidad media distinta." : "Como $F$ no lo supera, no se rechaza $H_0$: las diferencias entre estaciones son compatibles con la variación al azar."}`],
        // otro camino: SC_E = SC_total − SC_D y el valor crítico integrando la densidad F
        verify: { kind: "zero", tol: 1e-6, fn: () => {
          const all = g.flat(), SST = all.reduce((s, v) => s + (v - mg) ** 2, 0), sb = SST - g.reduce((s, x) => s + S.var(x) * (x.length - 1), 0);
          return [(sb - SSB) / Math.max(1, SSB), (FqNum(0.95, k - 1, N - k) - Fc) / Fc];
        } }
      };
    }
  };

  E.registerExams("m105", {
    self: SELF,
    exams: [
      { id: "p1", kind: "parcial", title: "1.er parcial", topics: "Estadística descriptiva, muestreo y probabilidad", minutes: 120, pass: 60,
        items: [
          { title: "Análisis descriptivo de una muestra", parts: [{ self: "pe-ex-descriptiva", pts: 30 }] },
          { title: "Muestreo estratificado", parts: [{ self: "pe-ex-estratificado", pts: 20 }] },
          { any: [
            { title: "Probabilidad condicional y Bayes", parts: [{ tpl: "pe-bayes-num", pts: 13 }, { tpl: "pe-condicional-num", pts: 12 }] },
            { title: "Conteo y probabilidad", parts: [{ tpl: "pe-comb-num", pts: 13 }, { tpl: "pe-dados-num", pts: 12 }] }
          ] },
          { any: [
            { title: "Binomial y normal", parts: [{ tpl: "pe-binomial-num", pts: 13 }, { tpl: "pe-normal-num", pts: 12 }] },
            { title: "Poisson y exponencial", parts: [{ tpl: "pe-poisson-num", pts: 13 }, { tpl: "pe-exponencial-num", pts: 12 }] }
          ] }
        ] },
      { id: "p2", kind: "parcial", title: "2.º parcial", topics: "Estimación, pruebas de hipótesis, χ², ANOVA y regresión", minutes: 120, pass: 60,
        items: [
          { any: [
            { title: "Intervalos de confianza", parts: [{ tpl: "pe-ic-media-num", pts: 13 }, { tpl: "pe-tamano-num", pts: 12 }] },
            { title: "Intervalos para proporción y varianza", parts: [{ tpl: "pe-ic-prop-num", pts: 13 }, { tpl: "pe-ic-var-num", pts: 12 }] }
          ] },
          { any: [
            { title: "Prueba para la media", parts: [{ tpl: "pe-test-media-num", pts: 13 }, { tpl: "pe-decision-mc", pts: 12 }] },
            { title: "Prueba para una proporción y errores", parts: [{ tpl: "pe-test-prop-num", pts: 13 }, { tpl: "pe-errores-tf", pts: 12 }] }
          ] },
          { title: "χ² y ANOVA", parts: [{ tpl: "pe-chi2-num", pts: 13 }, { tpl: "pe-anova-num", pts: 12 }] },
          { title: "Regresión y correlación", parts: [{ tpl: "pe-regresion-num", pts: 13 }, { tpl: "pe-correlacion-num", pts: 12 }] }
        ] },
      { id: "final", kind: "final", title: "Final práctico", topics: "Análisis de datos: intervalos para la varianza y la media, correlación, regresión y ANOVA, siempre con interpretación.", minutes: 150, pass: 60,
        items: [
          { title: "Intervalo para la varianza", parts: [{ self: "pe-ex-ic-varianza", pts: 20 }] },
          { title: "Intervalo para la media", parts: [{ self: "pe-ex-ic-media", pts: 20 }] },
          { title: "Correlación y regresión", parts: [{ self: "pe-ex-regresion", pts: 30 }] },
          { title: "¿Influye la estación del año?", parts: [{ self: "pe-ex-anova", pts: 30 }] }
        ] }
    ]
  });
})();
