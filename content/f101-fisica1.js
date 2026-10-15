/*
 * F101 · Física General I — Licenciatura en Ciencias Básicas (FCEN, UNCuyo), Plan Ord. 77/15 C.S.
 * ==============================================================================================
 * Temario: programa de Física General I (F101), versión 2021 (la más reciente publicada):
 *   Unidad transversal: Magnitudes físicas, mediciones e incertezas
 *   1 Cinemática · 2 Dinámica · 3 Trabajo y energía · 4 Cantidad de movimiento, impulso y choques
 *   5 Mecánica de fluidos · 6 Cinemática rotacional · 7 Dinámica rotacional
 *   8 Equilibrio de cuerpos rígidos · 9 Gravitación · 10 Movimiento periódico
 *
 * Convención: g = 9,8 m/s² (se aclara en cada enunciado). Respuestas numéricas con ±1 %.
 * Verificaciones (tests): las de dinámica simulan las ecuaciones de movimiento con RK4
 * (kind "ode"); las de estática chequean los residuos de las condiciones de equilibrio.
 * Ids de lecciones y fichas con prefijo "f1-" para no chocar con otras materias.
 * Todo el texto y los ejercicios son originales.
 */
(function () {
  window.Efecen.registerCourse({ id: "f101", code: "F101", title: "Física General I", icon: "atom" });
})();

/* =====================================================================
 *  UNIDAD TRANSVERSAL · MAGNITUDES, MEDICIONES E INCERTEZAS
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {};
  const dec = x => String(x).replace(".", "{,}");

  T["f1-unidades-num"] = {
    type: "numeric", concepts: ["f1-unidades"], difficulty: 1,
    generate(r) {
      const v = r.pick(["kmh-ms", "ms-kmh", "dens", "litros", "rpm", "cm2"]);
      if (v === "kmh-ms") { const x = r.int(2, 30) * 9; return { prompt: `Expresá $${x}\\ \\text{km/h}$ en $\\text{m/s}$.`, answer: x / 3.6, solution: [`$1\\ \\text{km/h} = \\frac{1000\\ \\text{m}}{3600\\ \\text{s}} = \\frac{1}{3{,}6}\\ \\text{m/s}$ ([[f1-medicion|unidades del SI]]).`, `$${x} / 3{,}6 = ${num(x / 3.6, 3)}\\ \\text{m/s}$.`], verify: { kind: "value", fn: () => x * 1000 / 3600 } }; }
      if (v === "ms-kmh") { const x = r.int(2, 40); return { prompt: `Expresá $${x}\\ \\text{m/s}$ en $\\text{km/h}$.`, answer: x * 3.6, solution: [`Multiplicamos por $3{,}6$ ([[f1-medicion]]).`, `$${x}\\cdot 3{,}6 = ${dec(num(x * 3.6, 2))}\\ \\text{km/h}$.`], verify: { kind: "value", fn: () => x / 1000 * 3600 } }; }
      if (v === "dens") { const x = r.int(5, 200) / 10; return { prompt: `Una densidad de $${dec(x)}\\ \\text{g/cm}^3$, ¿cuánto es en $\\text{kg/m}^3$?`, answer: x * 1000, solution: [`$1\\ \\text{g/cm}^3 = \\frac{10^{-3}\\ \\text{kg}}{10^{-6}\\ \\text{m}^3} = 1000\\ \\text{kg/m}^3$ ([[f1-medicion]]).`, `$${dec(x)}\\cdot 1000 = ${num(x * 1000)}\\ \\text{kg/m}^3$.`], verify: { kind: "value", fn: () => x * 1e-3 / 1e-6 } }; }
      if (v === "litros") { const x = r.int(1, 500); return { prompt: `¿Cuántos $\\text{m}^3$ son $${x}$ litros?`, answer: x / 1000, solution: [`$1\\ \\text{L} = 1\\ \\text{dm}^3 = (0{,}1\\ \\text{m})^3 = 10^{-3}\\ \\text{m}^3$ ([[f1-medicion]]).`, `$${x}\\cdot 10^{-3} = ${dec(num(x / 1000, 3))}\\ \\text{m}^3$.`], verify: { kind: "value", fn: () => x * 0.1 ** 3 } }; }
      if (v === "rpm") { const x = r.int(1, 30) * 30; return { prompt: `Un motor gira a $${x}$ rpm. ¿Cuál es su velocidad angular en $\\text{rad/s}$?`, answer: x * 2 * Math.PI / 60, solution: [`$1$ vuelta $= 2\\pi$ rad y $1$ min $= 60$ s ([[f1-medicion]]).`, `$\\omega = ${x}\\cdot\\frac{2\\pi}{60} \\approx ${num(x * 2 * Math.PI / 60, 3)}\\ \\text{rad/s}$.`], verify: { kind: "value", fn: () => x / 60 * 2 * Math.PI } }; }
      const x = r.int(10, 900); return { prompt: `¿Cuántos $\\text{m}^2$ son $${x}\\ \\text{cm}^2$?`, answer: x * 1e-4, solution: [`$1\\ \\text{cm}^2 = (10^{-2}\\ \\text{m})^2 = 10^{-4}\\ \\text{m}^2$ ([[f1-medicion]]): ¡el factor también se eleva al cuadrado!`, `$${x}\\cdot10^{-4} = ${dec(num(x * 1e-4, 4))}\\ \\text{m}^2$.`], verify: { kind: "value", fn: () => x * 0.01 * 0.01 } };
    }
  };
  // cuenta cifras significativas leyendo el texto (algoritmo independiente del generador)
  function countSig(str) {
    let s = str.replace(/\\times.*$/, "").replace(/[{}\s]/g, "").replace(",", ".");
    const hasDot = s.includes(".");
    s = s.replace(".", "").replace(/^0+/, "");
    if (!hasDot) s = s.replace(/0+$/, "");
    return s.length;
  }
  T["f1-cifras-mc"] = {
    type: "mc", concepts: ["f1-cifras"], difficulty: 1,
    generate(r) {
      const n = r.int(2, 5), digits = Array.from({ length: n }, (_, i) => (i === 0 ? r.int(1, 9) : r.int(0, 9)));
      const form = r.pick(["lead", "trail", "sci", "mid"]);
      let s;
      if (form === "lead") s = "0{,}" + "0".repeat(r.int(1, 3)) + digits.join("");
      else if (form === "trail") { digits[n - 1] = 0; s = digits[0] + "{,}" + digits.slice(1).join(""); }
      else if (form === "sci") s = digits[0] + (n > 1 ? "{,}" + digits.slice(1).join("") : "") + `\\times 10^{${r.nz(-6, 6)}}`;
      else { const k = r.int(1, n - 1); s = digits.slice(0, k).join("") + "{,}" + digits.slice(k).join(""); }
      return {
        prompt: `¿Cuántas **cifras significativas** tiene la medición $${s}$?`,
        ...H.mc(r, String(n), [1, 2, 3, 4, 5, 6].filter(x => x !== n).map(String), { text: true }),
        solution: [
          `Los ceros a la izquierda no cuentan (solo ubican la coma); los ceros a la derecha **después de la coma** sí cuentan ([[f1-cifras|cifras significativas]]).`,
          `En notación científica cuentan todas las cifras de la mantisa. Resultado: $${n}$.`
        ],
        verify: { kind: "value", target: n, fn: () => countSig(s) }
      };
    }
  };
  T["f1-propag-num"] = {
    type: "numeric", concepts: ["f1-errores"], difficulty: 2,
    generate(r) {
      if (r.bool()) {
        const L = r.int(200, 900) / 10, W = r.int(100, 600) / 10, dL = r.pick([0.1, 0.2, 0.5]), dW = r.pick([0.1, 0.2, 0.5]);
        const dA = L * dW + W * dL;
        return {
          prompt: `Se miden los lados de un rectángulo: $L = (${dec(L)} \\pm ${dec(dL)})$ cm y $W = (${dec(W)} \\pm ${dec(dW)})$ cm. ¿Cuál es el error absoluto del área (en cm²), propagando a primer orden?`,
          answer: dA,
          solution: [`Para un producto se suman los errores relativos ([[f1-errores|propagación de errores]]): $\\frac{\\Delta A}{A} = \\frac{\\Delta L}{L} + \\frac{\\Delta W}{W}$.`, `$\\Delta A = W\\,\\Delta L + L\\,\\Delta W = ${dec(W)}\\cdot${dec(dL)} + ${dec(L)}\\cdot${dec(dW)} = ${dec(num(dA, 2))}\\ \\text{cm}^2$.`],
          // verificación: semidiferencia entre los valores extremos del área
          verify: { kind: "value", fn: () => ((L + dL) * (W + dW) - (L - dL) * (W - dW)) / 2 }
        };
      }
      const m = r.int(50, 400), dm = r.pick([0.5, 1, 2]), V = r.int(20, 150), dV = r.pick([0.5, 1, 2]);
      const rho = m / V, drho = rho * (dm / m + dV / V);
      return {
        prompt: `Un cuerpo tiene masa $m = (${m} \\pm ${dec(dm)})$ g y volumen $V = (${V} \\pm ${dec(dV)})$ cm³. ¿Cuál es el error absoluto de su densidad (en g/cm³)?`,
        answer: drho,
        solution: [`$\\rho = \\frac{m}{V} \\approx ${num(rho, 4)}$ g/cm³. En un cociente también se suman los errores relativos ([[f1-errores]]).`, `$\\Delta\\rho = \\rho\\left(\\frac{${dec(dm)}}{${m}} + \\frac{${dec(dV)}}{${V}}\\right) \\approx ${num(drho, 4)}$ g/cm³.`],
        // verificación: propagación con derivadas parciales numéricas
        verify: { kind: "value", tol: 1e-5, fn: () => { const f = (mm, vv) => mm / vv, h = 1e-4; return Math.abs((f(m + h, V) - f(m - h, V)) / (2 * h)) * dm + Math.abs((f(m, V + h) - f(m, V - h)) / (2 * h)) * dV; } }
      };
    }
  };
  T["f1-estad-num"] = {
    type: "numeric", concepts: ["f1-estadistica"], difficulty: 2,
    generate(r) {
      const base = r.int(100, 300) / 10, xs = Array.from({ length: 5 }, () => Math.round((base + r.int(-4, 4) / 10) * 10) / 10);
      if (new Set(xs).size < 3) return null;
      const n = xs.length, mean = xs.reduce((a, b) => a + b) / n;
      const s = Math.sqrt(xs.reduce((a, x) => a + (x - mean) ** 2, 0) / (n - 1));
      const ask = r.pick(["mean", "s"]);
      return {
        prompt: `Se midió cinco veces un tiempo (en s): $${xs.map(dec).join(";\\ ")}$. Calculá ${ask === "mean" ? "el **valor medio**" : "la **desviación estándar muestral** $s$ (dividiendo por $n - 1$)"}.`,
        answer: ask === "mean" ? mean : s,
        solution: [`$\\bar x = \\frac{1}{n}\\sum x_i = ${num(mean, 4)}$ ([[f1-estadistica|estadística de errores]]).`, `$s = \\sqrt{\\frac{\\sum (x_i - \\bar x)^2}{n - 1}} \\approx ${num(s, 4)}$.`, ask === "s" ? `El error del promedio es $\\frac{s}{\\sqrt n} \\approx ${num(s / Math.sqrt(n), 3)}$.` : `Respuesta: $${num(mean, 4)}$ s.`],
        // verificación con el algoritmo de Welford (otro camino para media y varianza)
        verify: { kind: "value", fn: () => { let m = 0, M2 = 0; xs.forEach((x, i) => { const d = x - m; m += d / (i + 1); M2 += d * (x - m); }); return ask === "mean" ? m : Math.sqrt(M2 / (n - 1)); } }
      };
    }
  };
  T["f1-errel-vf"] = {
    type: "tf", concepts: ["f1-errores"], difficulty: 1,
    generate(r) {
      const a = r.int(10, 900), da = r.pick([0.1, 0.5, 1, 2]), b = r.int(10, 900), db = r.pick([0.1, 0.5, 1, 2]);
      if (Math.abs(da / a - db / b) < 1e-4) return null;
      const truth = da / a < db / b;
      return {
        prompt: `<b>Verdadero o falso:</b> la medición $A = (${a} \\pm ${dec(da)})$ m es más precisa que $B = (${b} \\pm ${dec(db)})$ m.`,
        answer: truth,
        explanation: `La precisión se compara con el **error relativo**: $\\frac{${dec(da)}}{${a}} \\approx ${num(100 * da / a, 3)}\\%$ contra $\\frac{${dec(db)}}{${b}} \\approx ${num(100 * db / b, 3)}\\%$.`,
        solution: [`Error relativo $= \\frac{\\Delta x}{x}$: no importa cuánto vale el error absoluto, sino cuánto es comparado con la medida ([[f1-errores]]).`],
        verify: { kind: "truth", fn: () => Math.log(da) - Math.log(a) < Math.log(db) - Math.log(b) }
      };
    }
  };

  const cards = {
    "f1-medicion": {
      title: "Magnitudes, unidades y notación científica", aliases: ["unidades del SI", "Sistema Internacional", "notación científica", "orden de magnitud", "órdenes de magnitud"], concepts: ["f1-unidades"],
      summary: "Toda medición es un número con unidad. En el SI las fundamentales de la mecánica son m, kg y s.",
      def: [R`Una **magnitud física** se expresa como un número por una unidad. En el **Sistema Internacional** las unidades de base de la mecánica son el metro (m), el kilogramo (kg) y el segundo (s); las demás se derivan: $\text{N} = \text{kg}\,\text{m/s}^2$, $\text{J} = \text{N}\,\text{m}$, $\text{W} = \text{J/s}$, $\text{Pa} = \text{N/m}^2$.`,
        R`**Notación científica:** $a \times 10^n$ con $1 \le |a| < 10$. El **orden de magnitud** es la potencia de 10 más cercana.`],
      idea: [R`Para convertir unidades se multiplica por **factores igual a 1**: $72\ \frac{\text{km}}{\text{h}}\cdot\frac{1000\ \text{m}}{1\ \text{km}}\cdot\frac{1\ \text{h}}{3600\ \text{s}} = 20\ \frac{\text{m}}{\text{s}}$. Si la unidad está al cuadrado o al cubo, el factor también: $1\ \text{cm}^3 = 10^{-6}\ \text{m}^3$.`,
        R`El **análisis dimensional** es un chequeo gratis: si una fórmula da "metros" para una velocidad, está mal.`],
      examples: [{ q: R`¿Cuántos segundos tiene un año, en orden de magnitud?`, steps: [R`$365\cdot 24\cdot 3600 \approx 3{,}15\times10^7$ s.`, R`Orden de magnitud: $10^7$ s (es una buena aproximación: $\pi\times10^7$ s).`] }],
      see: ["f1-cifras", "f1-errores"]
    },
    "f1-cifras": {
      title: "Cifras significativas", aliases: ["cifras significativas", "redondeo"], concepts: ["f1-cifras"],
      summary: "Las cifras que se informan dicen cuán precisa es la medición: los ceros a la izquierda no cuentan.",
      def: [R`Las **cifras significativas** de una medición son todas las cifras conocidas con certeza más la primera dudosa. Reglas: cuentan todas las cifras no nulas; los ceros **entre** cifras no nulas cuentan; los ceros **a la izquierda** no cuentan; los ceros **a la derecha** de la coma decimal sí cuentan.`],
      idea: [R`$0{,}00340$ tiene 3 cifras significativas (3, 4 y el último 0). Escrito como $3{,}40\times10^{-3}$ se ve mejor. Informar $12{,}30$ cm en vez de $12{,}3$ cm dice que se midió hasta la centésima.`,
        R`Al operar: en productos y cocientes, el resultado lleva tantas cifras como el factor con **menos** cifras; en sumas y restas, se redondea a la posición decimal menos precisa. Y el resultado se escribe con el mismo orden que su [[f1-errores|incerteza]]: $(9{,}81 \pm 0{,}02)$ m/s², no $(9{,}8134 \pm 0{,}02)$.`],
      examples: [{ q: R`¿Cuántas cifras significativas tiene $4{,}0500\times10^{3}$?`, steps: [R`Todas las de la mantisa: 4, 0, 5, 0, 0. Son 5.`] }],
      see: ["f1-medicion", "f1-errores"]
    },
    "f1-errores": {
      title: "Errores e incertezas: absoluto, relativo y propagación", aliases: ["error absoluto", "error relativo", "propagación de errores", "incerteza", "incertezas"], concepts: ["f1-errores"],
      summary: "x = x₀ ± Δx. Error relativo Δx/x. En productos y cocientes los errores relativos se suman.",
      def: [R`El resultado de una medición se informa como $x = x_0 \pm \Delta x$: $\Delta x$ es el **error absoluto** (incerteza) y $\frac{\Delta x}{x_0}$ el **error relativo**, que mide la precisión.`,
        R`**Propagación (a primer orden):** para $f(x, y)$, $$\Delta f = \left|\frac{\partial f}{\partial x}\right|\Delta x + \left|\frac{\partial f}{\partial y}\right|\Delta y.$$ Casos útiles: en sumas y restas se suman los errores **absolutos**; en productos y cocientes, los errores **relativos**; para $x^n$, el relativo se multiplica por $|n|$.`],
      idea: [R`**Precisión** (resultados repetidos parecidos entre sí) no es lo mismo que **exactitud** (cercanos al valor verdadero). Un instrumento mal calibrado puede ser muy preciso e inexacto: es un error **sistemático**, que no se reduce promediando. Los errores **aleatorios** sí se reducen (ver [[f1-estadistica]]).`],
      demo: [R`**Paso 1 (idea general).** Si medimos $x_0 \pm \Delta x$, el valor verdadero es $x_0 + \delta$ con $|\delta| \le \Delta x$. Como $\Delta x$ es chico, reemplazamos la función por su aproximación lineal (su [[recta-tangente|recta tangente]]): $$f(x_0 + \delta) \approx f(x_0) + f'(x_0)\,\delta.$$`,
        R`**Paso 2.** El apartamiento de $f$ es entonces $f'(x_0)\,\delta$, y en el peor caso, con $|\delta| = \Delta x$, vale $|f'(x_0)|\,\Delta x$. Con dos variables se hace lo mismo en cada una, y en el peor caso los dos apartamientos tienen el mismo signo y se suman: $$\Delta f = \left|\frac{\partial f}{\partial x}\right|\Delta x + \left|\frac{\partial f}{\partial y}\right|\Delta y.$$`,
        R`**Paso 3 (suma).** Para $f = x \pm y$ las dos derivadas parciales valen $\pm 1$, así que $\Delta f = \Delta x + \Delta y$: en sumas y restas se suman los errores absolutos (¡también en la resta!).`,
        R`**Paso 4 (producto).** Desarrollamos $(x + \Delta x)(y + \Delta y) = xy + x\,\Delta y + y\,\Delta x + \Delta x\,\Delta y$. El último término es producto de dos cantidades chicas (de segundo orden) y lo despreciamos, así que $\Delta(xy) = x\,\Delta y + y\,\Delta x$. Dividiendo por $xy$: $$\frac{\Delta(xy)}{xy} = \frac{\Delta x}{x} + \frac{\Delta y}{y}.$$`,
        R`**Paso 5 (potencia y cociente).** Para $f = x^n$, el paso 2 da $\Delta f = |n|\,x^{n-1}\Delta x$, y dividiendo por $x^n$, $\frac{\Delta f}{f} = |n|\,\frac{\Delta x}{x}$. El cociente $\frac xy = x\cdot y^{-1}$ es un producto con una potencia $n = -1$, así que sus errores relativos también se suman. $\blacksquare$`],
      examples: [{ q: R`$T = (2{,}00 \pm 0{,}02)$ s. ¿Error de $T^2$?`, steps: [R`Relativo de $T$: $1\%$. El de $T^2$ es el doble: $2\%$.`, R`$T^2 = (4{,}00 \pm 0{,}08)$ s².`] }],
      see: ["f1-estadistica", "f1-cifras"]
    },
    "f1-estadistica": {
      title: "Teoría estadística de errores", aliases: ["promedio", "desviación estándar", "distribución de Gauss", "histograma", "error del promedio"], concepts: ["f1-estadistica"],
      summary: "Con n mediciones: el mejor valor es el promedio y su error es s/√n.",
      def: [R`Con mediciones $x_1, \dots, x_n$: **valor medio** $\bar x = \frac1n\sum x_i$ y **desviación estándar muestral** $$s = \sqrt{\frac{1}{n-1}\sum_{i=1}^n (x_i - \bar x)^2}.$$ El **error del promedio** es $\sigma_{\bar x} = \frac{s}{\sqrt n}$.`],
      idea: [R`Si los errores son aleatorios, el **histograma** de muchas mediciones tiende a una campana de **Gauss** centrada en el valor verdadero, y alrededor del 68 % de las mediciones cae en $\bar x \pm s$.`,
        { graph: { fns: [x => 4 * Math.exp(-x * x / 2)], xr: [-4, 4], yr: [-0.5, 4.5] }, caption: R`La campana de Gauss: la mayoría de las mediciones caen cerca del promedio.` },
        R`Promediar reduce el error aleatorio como $\frac{1}{\sqrt n}$: para un error 10 veces menor hacen falta 100 veces más mediciones. Se divide por $n - 1$ porque $\bar x$ ya se calculó con los mismos datos.`],
      demo: [R`**Paso 1 (modelo).** Pensamos cada medición como $x_i = \mu + e_i$: el valor verdadero $\mu$ más un error aleatorio $e_i$. Suponemos que los errores son independientes, que en promedio dan $0$ y que el promedio de $e_i^2$ es $\sigma^2$ (eso es lo que mide la dispersión $\sigma$).`,
        R`**Paso 2.** Promediamos las $n$ mediciones. Como $\mu$ es el mismo en todas, $$\bar x = \mu + \frac1n\sum_{i=1}^n e_i,$$ así que el error del promedio es $\frac1n\sum e_i$.`,
        R`**Paso 3.** Para medir cuán grande es ese error, lo elevamos al cuadrado. El cuadrado de una suma tiene los términos $e_i^2$ y los productos cruzados: $$\Big(\frac1n\sum e_i\Big)^2 = \frac{1}{n^2}\Big(\sum_i e_i^2 + \sum_{i\neq j}e_ie_j\Big).$$`,
        R`**Paso 4.** Promediamos sobre muchas repeticiones del experimento. Cada $e_i^2$ da en promedio $\sigma^2$, y hay $n$. Los productos cruzados $e_ie_j$ dan $0$ en promedio: como los errores son independientes, $e_j$ es positivo o negativo con igual frecuencia sea cual sea $e_i$. Queda $$\frac{1}{n^2}\cdot n\sigma^2 = \frac{\sigma^2}{n}.$$`,
        R`**Paso 5.** La dispersión del promedio es la raíz: $\frac{\sigma}{\sqrt n}$. Como $\sigma$ no se conoce, se estima con la desviación muestral $s$ de los mismos datos, y queda $\sigma_{\bar x} = \frac{s}{\sqrt n}$.`],
      examples: [{ q: R`Mediciones: $5{,}1;\ 5{,}3;\ 5{,}2$. Promedio y $s$.`, steps: [R`$\bar x = 5{,}2$.`, R`$s = \sqrt{\frac{0{,}01 + 0{,}01 + 0}{2}} = 0{,}1$, y el error del promedio es $\frac{0{,}1}{\sqrt3} \approx 0{,}06$.`] }],
      see: ["f1-errores"]
    }
  };

  E.extendCourse("f101", {
    concepts: {
      "f1-unidades": { name: "Unidades y conversiones" },
      "f1-cifras": { name: "Cifras significativas" },
      "f1-errores": { name: "Errores y propagación" },
      "f1-estadistica": { name: "Estadística de errores" }
    },
    templates: T,
    units: [{
      id: "f1-mediciones", order: 0, program: "Unidad transversal", title: "Magnitudes físicas, mediciones e incertezas", icon: "target",
      diagnostic: ["f1-unidades-num", "f1-propag-num", "f1-estad-num"],
      lessons: [
        { id: "f1-unidades", title: "Unidades y cifras significativas", templates: ["f1-unidades-num", "f1-cifras-mc"], theory: ["f1-medicion", "f1-cifras"],
          intro: R`Convertir unidades es multiplicar por factores iguales a 1. Los ceros a la izquierda no son cifras significativas.` },
        { id: "f1-errores", title: "Errores y su propagación", templates: ["f1-errel-vf", "f1-propag-num", "f1-estad-num"], theory: ["f1-errores", "f1-estadistica"],
          intro: R`$x = x_0 \pm \Delta x$. En productos y cocientes se suman los errores relativos. El mejor valor de $n$ mediciones es el promedio, con error $\frac{s}{\sqrt n}$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 1 · CINEMÁTICA
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {}, g = 9.8;
  const dec = x => String(x).replace(".", "{,}");
  const rad = d => d * Math.PI / 180;

  T["f1-vec-num"] = {
    type: "numeric", concepts: ["f1-vectores"], difficulty: 2,
    generate(r) {
      const a = r.int(2, 9), b = r.int(2, 9), al = r.pick([0, 30, 45, 60, 90, 120]), be = r.pick([0, 30, 45, 60, 90, 135, 150, 180, 270]);
      if (al === be) return null;
      const Rx = a * Math.cos(rad(al)) + b * Math.cos(rad(be)), Ry = a * Math.sin(rad(al)) + b * Math.sin(rad(be));
      const mag = Math.hypot(Rx, Ry);
      if (mag < 0.5) return null;
      return {
        prompt: `$\\vec A$ mide $${a}$ unidades y forma $${al}^\\circ$ con el eje $x$; $\\vec B$ mide $${b}$ y forma $${be}^\\circ$. Calculá el módulo de $\\vec A + \\vec B$.`,
        answer: mag,
        solution: [
          `[[f1-vectores|Componentes]]: $A_x = ${a}\\cos ${al}^\\circ$, $A_y = ${a}\\sin ${al}^\\circ$, y lo mismo para $\\vec B$.`,
          `$R_x \\approx ${num(Rx, 3)}$, $\\;R_y \\approx ${num(Ry, 3)}$.`,
          `$|\\vec R| = \\sqrt{R_x^2 + R_y^2} \\approx ${num(mag, 3)}$.`
        ],
        // verificación con el teorema del coseno (sin componentes)
        verify: { kind: "value", fn: () => Math.sqrt(a * a + b * b + 2 * a * b * Math.cos(rad(be - al))) }
      };
    }
  };
  T["f1-mruv-num"] = {
    type: "numeric", concepts: ["f1-mruv"], difficulty: 1,
    generate(r) {
      const v0 = r.int(2, 30), a = r.pick([-4, -3, -2, -1.5, 1, 1.5, 2, 3]), ask = r.pick(["x", "v", "stop"]);
      if (ask === "stop" && a > 0) return null;
      const t = r.int(2, 8);
      if (ask !== "stop" && a < 0 && v0 + a * t < 0) return null;
      const ans = ask === "x" ? v0 * t + a * t * t / 2 : ask === "v" ? v0 + a * t : v0 * v0 / (2 * -a);
      return {
        prompt: ask === "stop" ? `Un auto va a $${v0}$ m/s y frena con aceleración constante de $${dec(-a)}$ m/s². ¿Qué distancia recorre hasta detenerse?`
          : `Un móvil parte con $v_0 = ${v0}$ m/s y aceleración constante $a = ${dec(a)}$ m/s². ¿${ask === "x" ? "Cuánto se desplazó" : "Qué velocidad tiene"} a los $${t}$ s?`,
        answer: ans,
        solution: ask === "stop"
          ? [`[[f1-mruv|MRUV]] sin tiempo: $v^2 = v_0^2 + 2a\\,\\Delta x$, con $v = 0$.`, `$\\Delta x = \\dfrac{v_0^2}{2|a|} = \\dfrac{${v0 * v0}}{${dec(2 * -a)}} \\approx ${num(ans, 3)}$ m.`]
          : ask === "x" ? [`[[f1-mruv|MRUV]]: $\\Delta x = v_0 t + \\frac12 a t^2$.`, `$= ${v0}\\cdot${t} + \\frac12(${dec(a)})(${t * t}) = ${num(ans, 3)}$ m.`]
          : [`[[f1-mruv|MRUV]]: $v = v_0 + a t$.`, `$= ${v0} + (${dec(a)})(${t}) = ${num(ans, 3)}$ m/s.`],
        verify: ask === "stop"
          ? { kind: "ode", f: (_, y) => [y[1], a], y0: [0, v0], t1: 0, until: (_, y) => y[1] <= 0, g: (_, y) => y[1], dt: 1e-3, out: (_, y) => y[0] }
          : { kind: "ode", f: (_, y) => [y[1], a], y0: [0, v0], t1: t, dt: 1e-3, out: (_, y) => (ask === "x" ? y[0] : y[1]) }
      };
    }
  };
  T["f1-caida-num"] = {
    type: "numeric", concepts: ["f1-mruv"], difficulty: 2,
    generate(r) {
      const v0 = r.int(0, 25), h0 = r.pick([0, 0, 5, 10, 20, 45]), ask = r.pick(["hmax", "tsuelo"]);
      if (ask === "hmax" && v0 === 0) return null;
      if (ask === "tsuelo" && h0 === 0 && v0 === 0) return null;
      const hmax = h0 + v0 * v0 / (2 * g), tsuelo = (v0 + Math.sqrt(v0 * v0 + 2 * g * h0)) / g;
      const ans = ask === "hmax" ? hmax : tsuelo;
      return {
        prompt: `Desde una altura de $${h0}$ m se lanza una piedra verticalmente hacia arriba con $${v0}$ m/s ($g = 9{,}8$ m/s², sin rozamiento). ¿${ask === "hmax" ? "Qué altura máxima (desde el suelo) alcanza" : "Cuánto tarda en llegar al suelo"}?`,
        answer: ans,
        solution: ask === "hmax"
          ? [`En el punto más alto $v = 0$ ([[f1-mruv|caída libre]]): $v_0^2 = 2g\\,\\Delta y$.`, `$\\Delta y = \\frac{${v0 * v0}}{19{,}6} \\approx ${num(v0 * v0 / (2 * g), 3)}$ m, y desde el suelo: $${num(hmax, 3)}$ m.`]
          : [`$y(t) = ${h0} + ${v0}t - 4{,}9t^2 = 0$ ([[f1-mruv|caída libre]]).`, `La raíz positiva: $t = \\dfrac{${v0} + \\sqrt{${v0 * v0} + 19{,}6\\cdot${h0}}}{9{,}8} \\approx ${num(tsuelo, 3)}$ s.`],
        verify: ask === "hmax"
          ? { kind: "ode", f: (_, y) => [y[1], -g], y0: [h0, v0], t1: 0, until: (_, y) => y[1] <= 0, g: (_, y) => y[1], dt: 1e-3, out: (_, y) => y[0] }
          : { kind: "ode", f: (_, y) => [y[1], -g], y0: [h0 + 1e-12, v0], t1: 0, until: (_, y) => y[0] < 0, g: (_, y) => y[0], dt: 1e-3, out: t => t }
      };
    }
  };
  T["f1-proyectil-num"] = {
    type: "numeric", concepts: ["f1-proyectiles"], difficulty: 2,
    generate(r) {
      const v0 = r.int(8, 40), th = r.pick([15, 30, 37, 45, 53, 60, 75]), h0 = r.pick([0, 0, 0, 10, 20]), ask = r.pick(["alcance", "hmax", "tvuelo"]);
      const vx = v0 * Math.cos(rad(th)), vy = v0 * Math.sin(rad(th));
      const tv = (vy + Math.sqrt(vy * vy + 2 * g * h0)) / g;
      const ans = ask === "alcance" ? vx * tv : ask === "hmax" ? h0 + vy * vy / (2 * g) : tv;
      return {
        prompt: `Se lanza un proyectil desde ${h0 ? `una altura de $${h0}$ m` : "el suelo"} con $v_0 = ${v0}$ m/s a $${th}^\\circ$ sobre la horizontal ($g = 9{,}8$ m/s²). ¿${ask === "alcance" ? "Cuál es su alcance horizontal" : ask === "hmax" ? "Qué altura máxima (desde el suelo) alcanza" : "Cuánto tiempo está en el aire"}?`,
        answer: ans,
        solution: [
          `Se separa en dos movimientos ([[f1-proyectiles|tiro oblicuo]]): horizontal uniforme con $v_x = ${v0}\\cos ${th}^\\circ \\approx ${num(vx, 3)}$ m/s y vertical con $v_{0y} \\approx ${num(vy, 3)}$ m/s y $a = -g$.`,
          ask === "hmax" ? `Arriba $v_y = 0$: $\\Delta y = \\frac{v_{0y}^2}{2g} \\approx ${num(vy * vy / (2 * g), 3)}$ m, y desde el suelo $${num(ans, 3)}$ m.`
            : `Tiempo de vuelo (cuando $y = 0$): $t \\approx ${num(tv, 3)}$ s${ask === "alcance" ? `; alcance $x = v_x\\,t \\approx ${num(ans, 3)}$ m` : ""}.`
        ],
        verify: ask === "hmax"
          ? { kind: "ode", f: (_, y) => [y[2], y[3], 0, -g], y0: [0, h0, vx, vy], t1: 0, until: (_, y) => y[3] <= 0, g: (_, y) => y[3], dt: 1e-3, out: (_, y) => y[1] }
          : { kind: "ode", f: (_, y) => [y[2], y[3], 0, -g], y0: [0, h0 + 1e-12, vx, vy], t1: 0, until: (_, y) => y[1] < 0, g: (_, y) => y[1], dt: 1e-3, out: (t, y) => (ask === "alcance" ? y[0] : t) }
      };
    }
  };
  T["f1-circular-num"] = {
    type: "numeric", concepts: ["f1-circular"], difficulty: 1,
    generate(r) {
      const v = r.pick(["ac", "T", "rpm"]);
      if (v === "ac") {
        const vel = r.int(5, 30), R0 = r.int(10, 200);
        return { prompt: `Un auto recorre una rotonda de radio $${R0}$ m a velocidad constante de $${vel}$ m/s. ¿Cuál es el módulo de su aceleración?`, answer: vel * vel / R0,
          solution: [`Aunque la rapidez es constante, la velocidad cambia de dirección: hay [[f1-circular|aceleración centrípeta]].`, `$a_c = \\frac{v^2}{R} = \\frac{${vel * vel}}{${R0}} \\approx ${num(vel * vel / R0, 3)}$ m/s².`],
          verify: { kind: "value", tol: 1e-5, fn: () => { const w = vel / R0, P = t => [R0 * Math.cos(w * t), R0 * Math.sin(w * t)], dt = 1e-3, [a, b, c] = [P(0.3 - dt), P(0.3), P(0.3 + dt)]; return Math.hypot(a[0] - 2 * b[0] + c[0], a[1] - 2 * b[1] + c[1]) / (dt * dt); } } };
      }
      if (v === "T") {
        const vel = r.int(2, 20), R0 = r.int(1, 30);
        return { prompt: `Un objeto gira en una circunferencia de radio $${R0}$ m con rapidez constante $${vel}$ m/s. ¿Cuál es el período del movimiento?`, answer: 2 * Math.PI * R0 / vel,
          solution: [`En una vuelta recorre $2\\pi R$ ([[f1-circular|MCU]]).`, `$T = \\frac{2\\pi R}{v} = \\frac{2\\pi\\cdot${R0}}{${vel}} \\approx ${num(2 * Math.PI * R0 / vel, 3)}$ s.`],
          verify: { kind: "ode", f: (_, y) => [y[2], y[3], -(y[2] * y[2] + y[3] * y[3]) / R0 * y[0] / R0, -(y[2] * y[2] + y[3] * y[3]) / R0 * y[1] / R0], y0: [R0, 0, 0, vel], t1: 0, until: (t, y) => t > 3.2 * R0 / vel && y[1] >= 0 && y[3] > 0, g: (_, y) => y[1], dt: 1e-4, out: t => t } };
      }
      const rpm = r.int(1, 12) * 100, d = r.pick([0.3, 0.5, 0.6, 0.8]);
      return { prompt: `Una rueda de $${dec(d)}$ m de diámetro gira a $${rpm}$ rpm. ¿A qué velocidad (m/s) se mueve un punto del borde?`, answer: rpm * 2 * Math.PI / 60 * d / 2,
        solution: [`$\\omega = ${rpm}\\cdot\\frac{2\\pi}{60} \\approx ${num(rpm * 2 * Math.PI / 60, 3)}$ rad/s ([[f1-circular]]).`, `$v = \\omega R = \\omega\\cdot${dec(d / 2)} \\approx ${num(rpm * Math.PI * d / 60, 3)}$ m/s.`],
        verify: { kind: "value", fn: () => Math.PI * d * rpm / 60 } };
    }
  };
  T["f1-relativo-num"] = {
    type: "numeric", concepts: ["f1-relativo"], difficulty: 2,
    generate(r) {
      const d = r.int(4, 30) * 10, vb = r.int(2, 6), vc = r.int(1, vb - 1), ask = r.pick(["deriva", "tiempo", "angulo"]);
      const ans = ask === "deriva" ? vc * d / vb : ask === "tiempo" ? d / vb : Math.asin(vc / vb) * 180 / Math.PI;
      return {
        prompt: ask === "angulo" ? `Un río de $${d}$ m de ancho corre a $${vc}$ m/s. Una lancha va a $${vb}$ m/s respecto del agua. ¿Qué ángulo (en grados, respecto de la perpendicular a la orilla) tiene que apuntar río arriba para cruzar en línea recta?`
          : `Un río de $${d}$ m de ancho corre a $${vc}$ m/s. Una lancha que va a $${vb}$ m/s respecto del agua apunta perpendicular a la orilla. ¿${ask === "deriva" ? "Cuántos metros río abajo llega a la otra orilla" : "Cuánto tarda en cruzar"}?`,
        answer: ans,
        solution: [
          `[[f1-relativo|Velocidad relativa]]: $\\vec v_{\\text{lancha/tierra}} = \\vec v_{\\text{lancha/agua}} + \\vec v_{\\text{agua/tierra}}$.`,
          ask === "angulo" ? `Para que la componente a lo largo del río se anule: $${vb}\\sin\\theta = ${vc}$, $\\theta = \\arcsin\\frac{${vc}}{${vb}} \\approx ${num(ans, 3)}^\\circ$.`
            : `Cruzar depende solo de la componente perpendicular: $t = \\frac{${d}}{${vb}} \\approx ${num(d / vb, 3)}$ s${ask === "deriva" ? `; mientras tanto la corriente la arrastra $${vc}\\cdot t \\approx ${num(ans, 3)}$ m` : ""}.`
        ],
        verify: ask === "angulo"
          ? { kind: "zero", fn: th => [vb * Math.sin(rad(th)) - vc] }
          : { kind: "ode", f: () => [vc, vb], y0: [0, 0], t1: 0, until: (_, y) => y[1] >= d, g: (_, y) => y[1] - d, dt: 1e-3, out: (t, y) => (ask === "deriva" ? y[0] : t) }
      };
    }
  };
  T["f1-caida-vf"] = {
    type: "tf", concepts: ["f1-proyectiles"], difficulty: 1,
    generate(r) {
      const h = r.int(2, 40), v = r.int(1, 20), q = r.pick(["igual", "mas"]);
      return {
        prompt: `Desde una altura de $${h}$ m se suelta una pelota y, en el mismo instante, se lanza otra **horizontalmente** a $${v}$ m/s. Sin rozamiento, <b>verdadero o falso:</b> ${q === "igual" ? "llegan al suelo al mismo tiempo" : "la lanzada tarda más en llegar al suelo"}.`,
        answer: q === "igual",
        explanation: `El movimiento vertical es el mismo para las dos ($v_{0y} = 0$, aceleración $g$): la velocidad horizontal no cambia el tiempo de caída, $t = \\sqrt{2h/g} \\approx ${num(Math.sqrt(2 * h / g), 3)}$ s ([[f1-proyectiles]]).`,
        solution: [`Los movimientos horizontal y vertical son independientes.`],
        verify: { kind: "truth", fn: () => {
          const fall = vx => { let x = 0, y = h, vy = 0; const dt = 1e-4; let t = 0; while (y > 0) { vy -= g * dt; y += vy * dt; x += vx * dt; t += dt; } return t; };
          const t1 = fall(0), t2 = fall(v);
          return q === "igual" ? Math.abs(t1 - t2) < 1e-3 : t2 > t1 + 1e-3;
        } }
      };
    }
  };

  const cards = {
    "f1-vectores": {
      title: "Vectores en física: componentes y suma", aliases: ["componentes de un vector", "descomposición en componentes", "suma de vectores"], concepts: ["f1-vectores"],
      summary: "Un vector tiene módulo y dirección; se suma componente a componente: Rx = Ax + Bx, Ry = Ay + By.",
      def: [R`Un **vector** en el plano tiene módulo y dirección. Si forma un ángulo $\theta$ con el eje $x$: $A_x = A\cos\theta$, $A_y = A\sin\theta$, y al revés $A = \sqrt{A_x^2 + A_y^2}$, $\tan\theta = \frac{A_y}{A_x}$ (ojo con el cuadrante).`,
        R`**Suma:** gráficamente, regla del paralelogramo o "punta con cola"; analíticamente, componente a componente.`],
      idea: [R`Casi todo problema de mecánica en 2D se resuelve igual: **elegir ejes, descomponer y trabajar cada eje por separado**. El teorema del coseno da el módulo de la suma sin componentes: $|\vec A + \vec B|^2 = A^2 + B^2 + 2AB\cos\varphi$, con $\varphi$ el ángulo entre ellos.`],
      demo: [R`**Paso 1 (componentes).** Dibujamos el vector desde el origen. Él, su proyección sobre el eje $x$ y el segmento vertical que baja desde su punta forman un triángulo rectángulo de hipotenusa $A$ y ángulo $\theta$ en el origen.`,
        R`**Paso 2.** Por definición de coseno y seno en un triángulo rectángulo (cateto adyacente sobre hipotenusa y opuesto sobre hipotenusa), los catetos miden $A_x = A\cos\theta$ y $A_y = A\sin\theta$. Por Pitágoras, $A^2 = A_x^2 + A_y^2$, y el cociente de los catetos da $\tan\theta = \frac{A_y}{A_x}$.`,
        R`**Paso 3 (sumar por componentes).** Poner la cola de $\vec B$ en la punta de $\vec A$ es hacer primero el desplazamiento $\vec A$ y después el $\vec B$. En $x$ avanzamos $A_x$ y después $B_x$; en $y$, $A_y$ y después $B_y$. Por eso la flecha suma es $(A_x + B_x,\ A_y + B_y)$.`,
        R`**Paso 4 (módulo de la suma).** El cuadrado del módulo es el producto escalar del vector consigo mismo. Distribuimos (el producto escalar es distributivo y conmutativo) y usamos $\vec A\cdot\vec B = AB\cos\varphi$: $$|\vec A + \vec B|^2 = \vec A\cdot\vec A + 2\,\vec A\cdot\vec B + \vec B\cdot\vec B = A^2 + B^2 + 2AB\cos\varphi.$$`],
      examples: [{ q: R`Caminás 3 km al este y 4 km al norte. ¿Desplazamiento?`, steps: [R`$\vec R = (3, 4)$ km, $|\vec R| = 5$ km.`, R`Dirección: $\arctan\frac43 \approx 53^\circ$ al norte del este.`] }],
      see: ["f1-mruv", "f1-proyectiles"]
    },
    "f1-mruv": {
      title: "Movimiento rectilíneo: velocidad, aceleración y caída libre", aliases: ["MRUV", "MRU", "caída libre", "aceleración constante", "velocidad media", "velocidad instantánea", "desplazamiento"], concepts: ["f1-mruv"],
      summary: "v = dx/dt, a = dv/dt. Con a constante: x = x₀ + v₀t + ½at² y v² = v₀² + 2aΔx.",
      def: [R`**Velocidad media:** $v_m = \frac{\Delta x}{\Delta t}$. **Instantánea:** $v = \frac{dx}{dt}$, la [[derivada]] de la posición. **Aceleración:** $a = \frac{dv}{dt}$.`,
        R`**Aceleración constante (MRUV):** $$v = v_0 + at, \qquad x = x_0 + v_0 t + \tfrac12 a t^2, \qquad v^2 = v_0^2 + 2a\,\Delta x.$$ **Caída libre:** es un MRUV con $a = -g$ (eje $y$ hacia arriba), $g \approx 9{,}8$ m/s².`],
      idea: [R`En el gráfico $x(t)$ la velocidad es la pendiente; en el $v(t)$, la aceleración es la pendiente y el **área** bajo la curva es el desplazamiento. Por eso las fórmulas del MRUV salen de [[antiderivada|integrar]] dos veces una aceleración constante.`],
      demo: [R`**Paso 1.** La aceleración es la derivada de la velocidad: $\frac{dv}{dt} = a$, con $a$ constante. Buscamos una [[antiderivada]] de la constante $a$: es $at$ más una constante. Evaluando en $t = 0$, esa constante es la velocidad inicial: $$v(t) = v_0 + at.$$`,
        R`**Paso 2.** La velocidad es la derivada de la posición: $\frac{dx}{dt} = v_0 + at$. Integramos otra vez: una antiderivada de $v_0$ es $v_0t$ y una de $at$ es $\frac12at^2$. La constante que aparece es la posición inicial $x_0$: $$x(t) = x_0 + v_0t + \tfrac12at^2.$$`,
        R`**Paso 3.** Para una fórmula sin el tiempo, despejamos $t$ de la primera (si $a \neq 0$): $t = \frac{v - v_0}{a}$. Reemplazamos en la segunda: $$x - x_0 = v_0\frac{v - v_0}{a} + \frac12a\frac{(v - v_0)^2}{a^2} = \frac{(v - v_0)(2v_0 + v - v_0)}{2a} = \frac{v^2 - v_0^2}{2a}.$$`,
        R`**Paso 4.** Multiplicando por $2a$ queda $v^2 = v_0^2 + 2a\,(x - x_0)$. $\blacksquare$`],
      examples: [{ q: R`Se suelta una piedra desde 20 m. ¿Con qué velocidad llega?`, steps: [R`$v^2 = 0 + 2\cdot 9{,}8\cdot 20 = 392$.`, R`$v \approx 19{,}8$ m/s.`] }],
      tips: [R`Elegí un eje y un sentido positivo y respetalo: si hacia arriba es positivo, $g$ entra como $-9{,}8$ m/s².`],
      see: ["f1-proyectiles", "f1-vectores", "derivada"]
    },
    "f1-proyectiles": {
      title: "Tiro oblicuo (proyectiles)", aliases: ["tiro oblicuo", "proyectil", "proyectiles", "tiro horizontal", "alcance"], concepts: ["f1-proyectiles"],
      summary: "Horizontal: velocidad constante. Vertical: caída libre. Los dos movimientos son independientes.",
      def: [R`Sin rozamiento, un proyectil lanzado con $v_0$ a un ángulo $\theta$: $$x = v_0\cos\theta\; t, \qquad y = y_0 + v_0\sin\theta\; t - \tfrac12 g t^2.$$ La trayectoria es una parábola.`],
      idea: [R`Lo importante es que **el movimiento vertical no se entera del horizontal**: una bala disparada horizontalmente y otra soltada desde la misma altura tocan el suelo a la vez.`,
        R`Desde el suelo, el alcance es $R = \frac{v_0^2\sin 2\theta}{g}$, máximo a $45^\circ$, y ángulos complementarios ($30^\circ$ y $60^\circ$) dan el mismo alcance.`,
        { graph: { fns: [x => x * Math.tan(Math.PI / 4) - 9.8 * x * x / (2 * 100 * 0.5), x => x * Math.tan(Math.PI / 6) - 9.8 * x * x / (2 * 100 * 0.75), x => x * Math.tan(Math.PI / 3) - 9.8 * x * x / (2 * 100 * 0.25)], xr: [0, 11], yr: [0, 5] }, caption: R`Con $v_0 = 10$ m/s: $45^\circ$ (violeta), $30^\circ$ (naranja) y $60^\circ$ (verde). Los dos últimos llegan al mismo lugar.` }],
      demo: [R`**Paso 1.** Despreciamos el rozamiento con el aire, así que la única fuerza es el peso, vertical. En $x$ no hay aceleración (velocidad constante $v_0\cos\theta$) y en $y$ hay caída libre con $a = -g$, con $g = 9{,}8$ m/s². Desde el suelo, $y_0 = 0$.`,
        R`**Paso 2.** El proyectil vuelve al suelo cuando $y = 0$: $$v_0\sin\theta\,t - \tfrac12gt^2 = t\left(v_0\sin\theta - \tfrac12gt\right) = 0.$$ La solución $t = 0$ es el lanzamiento; la otra es el tiempo de vuelo, $t_v = \frac{2v_0\sin\theta}{g}$.`,
        R`**Paso 3.** En ese tiempo, el movimiento horizontal (uniforme) avanzó $$R = v_0\cos\theta\cdot t_v = \frac{2v_0^2\sin\theta\cos\theta}{g}.$$`,
        R`**Paso 4.** Por la identidad del ángulo doble, $2\sin\theta\cos\theta = \sin 2\theta$, así que $R = \frac{v_0^2\sin 2\theta}{g}$. Es máximo cuando $\sin 2\theta = 1$, o sea $\theta = 45^\circ$; y como $\sin(180^\circ - 2\theta) = \sin 2\theta$, los ángulos $\theta$ y $90^\circ - \theta$ dan el mismo alcance. $\blacksquare$`],
      examples: [{ q: R`Una pelota sale a 20 m/s y $30^\circ$ desde el suelo. ¿Altura máxima?`, steps: [R`$v_{0y} = 10$ m/s.`, R`$h = \frac{v_{0y}^2}{2g} = \frac{100}{19{,}6} \approx 5{,}1$ m.`] }],
      see: ["f1-mruv", "f1-vectores"]
    },
    "f1-circular": {
      title: "Movimiento circular", aliases: ["movimiento circular", "MCU", "aceleración centrípeta", "velocidad angular"], concepts: ["f1-circular"],
      summary: "En el MCU la rapidez es constante pero hay aceleración hacia el centro: a = v²/R = ω²R.",
      def: [R`**MCU:** $v = \omega R$, período $T = \frac{2\pi}{\omega} = \frac{2\pi R}{v}$, frecuencia $f = \frac1T$. La **aceleración centrípeta** apunta al centro y vale $$a_c = \frac{v^2}{R} = \omega^2 R.$$`],
      idea: [R`La velocidad es un vector: aunque su módulo no cambie, cambia su dirección, y eso es aceleración. Si además la rapidez cambia, se suma una aceleración **tangencial** $a_t = \frac{dv}{dt}$. Lo que **produce** la aceleración centrípeta es alguna fuerza real: ver [[f1-dinamica-circular]].`],
      demo: [R`**Paso 1.** En un MCU de radio $R$ el ángulo crece uniformemente, $\theta = \omega t$, así que la posición es $$\vec r(t) = R\,(\cos\omega t,\ \sin\omega t).$$`,
        R`**Paso 2.** La velocidad es la derivada de la posición. Derivamos cada componente con la regla de la cadena (sale un factor $\omega$): $$\vec v(t) = R\omega\,(-\sin\omega t,\ \cos\omega t).$$ Su módulo es $R\omega$, porque $\sin^2 + \cos^2 = 1$: eso es $v = \omega R$.`,
        R`**Paso 3.** Derivamos otra vez para la aceleración: $$\vec a(t) = -R\omega^2\,(\cos\omega t,\ \sin\omega t) = -\omega^2\,\vec r(t).$$`,
        R`**Paso 4.** El signo menos dice que $\vec a$ apunta al revés que $\vec r$, es decir, hacia el centro. Su módulo es $\omega^2R$, y usando $\omega = \frac vR$ también es $\frac{v^2}{R}$. $\blacksquare$`],
      examples: [{ q: R`La Luna tarda 27,3 días en orbitar a $3{,}84\times10^8$ m. ¿Aceleración centrípeta?`, steps: [R`$\omega = \frac{2\pi}{27{,}3\cdot 86400} \approx 2{,}66\times10^{-6}$ rad/s.`, R`$a = \omega^2 R \approx 2{,}7\times10^{-3}$ m/s² (es la gravedad terrestre a esa distancia).`] }],
      see: ["f1-dinamica-circular", "f1-rot-cinematica"]
    },
    "f1-relativo": {
      title: "Movimiento relativo", aliases: ["movimiento relativo", "velocidad relativa", "sistema de referencia", "sistemas de referencia"], concepts: ["f1-relativo"],
      summary: "Las velocidades medidas desde distintos sistemas se suman: v(A/C) = v(A/B) + v(B/C).",
      def: [R`Si $B$ se mueve respecto de $C$: $$\vec v_{A/C} = \vec v_{A/B} + \vec v_{B/C}.$$ (Vale para velocidades mucho menores que la de la luz.)`],
      idea: [R`Una lancha en un río: su velocidad respecto de la tierra es la suya respecto del agua más la de la corriente. Para cruzar en el menor tiempo se apunta perpendicular a la orilla (y la corriente la arrastra); para cruzar en línea recta hay que apuntar río arriba.`,
        R`Un **sistema inercial** es uno donde vale la primera ley de Newton. Dos sistemas que se mueven con velocidad constante uno respecto del otro son ambos inerciales.`],
      demo: [R`**Paso 1.** Llamamos $\vec r_{A/C}$ a la posición de $A$ medida desde $C$, $\vec r_{A/B}$ a la de $A$ medida desde $B$, y $\vec r_{B/C}$ a la de $B$ medida desde $C$.`,
        R`**Paso 2.** La flecha de $C$ a $A$ es la suma de la flecha de $C$ a $B$ y la de $B$ a $A$ (punta con cola): $$\vec r_{A/C} = \vec r_{A/B} + \vec r_{B/C}.$$`,
        R`**Paso 3.** Derivamos respecto del tiempo. En mecánica clásica el tiempo es el mismo para los dos observadores, así que derivan respecto de la misma variable, y la derivada de una suma es la suma de las derivadas: $$\vec v_{A/C} = \vec v_{A/B} + \vec v_{B/C}.$$ Derivando otra vez, $\vec a_{A/C} = \vec a_{A/B} + \vec a_{B/C}$.`,
        R`**Paso 4.** Si $B$ se mueve respecto de $C$ con velocidad constante, $\vec a_{B/C} = 0$ y los dos miden la misma aceleración de $A$. Entonces ven el mismo $m\vec a$ y las mismas fuerzas: si en uno vale la [[f1-newton|primera ley]], en el otro también. Los dos son inerciales. $\blacksquare$`],
      examples: [{ q: R`Llueve vertical a 8 m/s y vas en auto a 6 m/s. ¿Cómo ves caer la lluvia?`, steps: [R`$\vec v_{\text{lluvia/auto}} = \vec v_{\text{lluvia/tierra}} - \vec v_{\text{auto/tierra}} = (-6, -8)$ m/s.`, R`Rapidez $10$ m/s, inclinada $\arctan\frac68 \approx 37^\circ$ respecto de la vertical.`] }],
      see: ["f1-vectores", "f1-newton"]
    }
  };

  E.extendCourse("f101", {
    concepts: {
      "f1-vectores": { name: "Vectores y componentes" },
      "f1-mruv": { name: "Movimiento rectilíneo y caída libre" },
      "f1-proyectiles": { name: "Tiro oblicuo" },
      "f1-circular": { name: "Movimiento circular" },
      "f1-relativo": { name: "Movimiento relativo" }
    },
    templates: T,
    units: [{
      id: "f1-cinematica", order: 1, program: "Unidad 1", title: "Cinemática", icon: "zap",
      diagnostic: ["f1-mruv-num", "f1-proyectil-num", "f1-circular-num"],
      lessons: [
        { id: "f1-vectores", title: "Vectores", templates: ["f1-vec-num"], theory: ["f1-vectores"],
          intro: R`$A_x = A\cos\theta$, $A_y = A\sin\theta$. Los vectores se suman componente a componente.` },
        { id: "f1-rectilineo", title: "Movimiento rectilíneo y caída libre", templates: ["f1-mruv-num", "f1-caida-num"], theory: ["f1-mruv"],
          intro: R`$v = v_0 + at$, $x = x_0 + v_0t + \frac12at^2$, $v^2 = v_0^2 + 2a\Delta x$. En caída libre, $a = -g$.` },
        { id: "f1-tiro", title: "Proyectiles", templates: ["f1-caida-vf", "f1-proyectil-num"], theory: ["f1-proyectiles", "f1-mruv"],
          intro: R`Horizontal con velocidad constante; vertical en caída libre. Los dos movimientos son independientes.` },
        { id: "f1-circular", title: "Circular y relativo", templates: ["f1-circular-num", "f1-relativo-num"], theory: ["f1-circular", "f1-relativo"],
          intro: R`$a_c = \frac{v^2}{R}$ hacia el centro. Velocidades relativas: $\vec v_{A/C} = \vec v_{A/B} + \vec v_{B/C}$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 2 · DINÁMICA. LEYES DE MOVIMIENTO
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {}, g = 9.8;
  const dec = x => String(x).replace(".", "{,}");
  const rad = d => d * Math.PI / 180;
  // suma de fuerzas como vectores (para verificar con descomposición propia)
  const vsum = fs => fs.reduce((a, f) => [a[0] + f[0], a[1] + f[1]], [0, 0]);

  T["f1-newton-num"] = {
    type: "numeric", concepts: ["f1-newton", "f1-rozamiento"], difficulty: 2,
    generate(r) {
      const m = r.int(2, 20), F = r.int(10, 120), th = r.pick([0, 20, 30, 37, 45]), mu = r.pick([0, 0.1, 0.2, 0.3, 0.4]);
      const N = m * g - F * Math.sin(rad(th));
      if (N <= 0) return null;
      const a = (F * Math.cos(rad(th)) - mu * N) / m;
      if (a <= 0.05) return null;
      return {
        prompt: `Se tira de un bloque de $${m}$ kg con una fuerza de $${F}$ N que forma $${th}^\\circ$ con la horizontal. El coeficiente de rozamiento dinámico con el piso es $${dec(mu)}$ ($g = 9{,}8$ m/s²). ¿Cuál es la aceleración del bloque?`,
        answer: a,
        solution: [
          `[[f1-newton|Diagrama de cuerpo libre]]: peso $${m}\\cdot 9{,}8$, normal $N$, la fuerza $F$ y el [[f1-rozamiento|rozamiento]] $\\mu N$ hacia atrás.`,
          `Eje vertical (sin aceleración): $N + F\\sin ${th}^\\circ = mg \\Rightarrow N \\approx ${num(N, 3)}$ N.`,
          `Eje horizontal: $F\\cos ${th}^\\circ - \\mu N = ma \\Rightarrow a \\approx ${num(a, 3)}$ m/s².`
        ],
        // verificación: simulamos 1 s de movimiento con la fuerza neta armada como suma de vectores
        verify: { kind: "ode", f: (_, y) => { const Nn = -vsum([[0, -m * g], [F * Math.cos(rad(th)), F * Math.sin(rad(th))]])[1]; const net = vsum([[F * Math.cos(rad(th)), 0], [-mu * Nn, 0]]); return [y[1], net[0] / m]; }, y0: [0, 0], t1: 1, dt: 1e-3, out: (_, y) => 2 * y[0] }
      };
    }
  };
  T["f1-plano-num"] = {
    type: "numeric", concepts: ["f1-rozamiento"], difficulty: 2,
    generate(r) {
      const th = r.pick([20, 25, 30, 37, 45, 53]), mu = r.pick([0, 0.1, 0.2, 0.3]), ask = r.pick(["a", "v", "mus"]);
      const a = g * (Math.sin(rad(th)) - mu * Math.cos(rad(th)));
      if (ask !== "mus" && a <= 0.1) return null;
      const d = r.int(1, 10);
      if (ask === "mus") return {
        prompt: `Un bloque está en reposo sobre un plano inclinado a $${th}^\\circ$. ¿Cuál es el **mínimo** coeficiente de rozamiento estático que lo mantiene quieto?`,
        answer: Math.tan(rad(th)),
        solution: [`En el límite, el [[f1-rozamiento|rozamiento estático]] máximo iguala la componente del peso a lo largo del plano.`, `$\\mu_s\\,mg\\cos\\theta = mg\\sin\\theta \\Rightarrow \\mu_s = \\tan ${th}^\\circ \\approx ${num(Math.tan(rad(th)), 3)}$.`],
        verify: { kind: "zero", fn: mus => [mus * Math.cos(rad(th)) - Math.sin(rad(th))] }
      };
      const ans = ask === "a" ? a : Math.sqrt(2 * a * d);
      return {
        prompt: `Un bloque se suelta en un plano inclinado a $${th}^\\circ$ con coeficiente de rozamiento dinámico $${dec(mu)}$ ($g = 9{,}8$ m/s²). ¿${ask === "a" ? "Cuál es su aceleración" : `Qué velocidad tiene después de deslizar $${d}$ m`}?`,
        answer: ans,
        solution: [
          `Ejes paralelo y perpendicular al [[f1-rozamiento|plano inclinado]]: $N = mg\\cos\\theta$ y $ma = mg\\sin\\theta - \\mu mg\\cos\\theta$.`,
          `$a = 9{,}8\\,(\\sin ${th}^\\circ - ${dec(mu)}\\cos ${th}^\\circ) \\approx ${num(a, 3)}$ m/s² (no depende de la masa).`,
          ask === "v" ? `$v = \\sqrt{2ad} \\approx ${num(ans, 3)}$ m/s.` : `Respuesta: $${num(a, 3)}$ m/s².`
        ],
        // verificación: proyectamos el vector peso sobre el plano y simulamos el deslizamiento
        verify: { kind: "ode", f: (_, y) => { const u = [Math.cos(rad(th)), -Math.sin(rad(th))], P = [0, -g], along = P[0] * u[0] + P[1] * u[1], perp = Math.abs(P[0] * u[1] - P[1] * u[0]); return [y[1], along - mu * perp]; },
          y0: [0, 0], t1: ask === "a" ? 1 : 0, until: ask === "v" ? ((_, y) => y[0] >= d) : undefined, g: (_, y) => y[0] - d, dt: 1e-4, out: (_, y) => (ask === "a" ? 2 * y[0] : y[1]) }
      };
    }
  };
  T["f1-atwood-num"] = {
    type: "numeric", concepts: ["f1-newton"], difficulty: 2,
    generate(r) {
      const [m2, m1] = r.distinct(2, 1, 9).sort((x, y) => x - y), ask = r.pick(["a", "T"]);
      const a = (m1 - m2) * g / (m1 + m2), Tn = 2 * m1 * m2 * g / (m1 + m2);
      return {
        prompt: `Máquina de Atwood: dos masas de $${m1}$ kg y $${m2}$ kg cuelgan de una soga ideal que pasa por una polea sin masa ni rozamiento ($g = 9{,}8$ m/s²). ¿${ask === "a" ? "Cuál es la aceleración del sistema" : "Cuál es la tensión de la soga"}?`,
        answer: ask === "a" ? a : Tn,
        solution: [
          `[[f1-newton|Segunda ley]] para cada masa (la de $${m1}$ kg baja): $${m1}g - T = ${m1}a$ y $T - ${m2}g = ${m2}a$.`,
          `Sumando: $a = \\dfrac{(${m1} - ${m2})g}{${m1} + ${m2}} \\approx ${num(a, 3)}$ m/s².`,
          `$T = ${m2}(g + a) \\approx ${num(Tn, 3)}$ N.`
        ],
        // verificación: la soga se modela como un resorte muy rígido (no usa la fórmula de Atwood)
        verify: ask === "a"
          ? { kind: "ode", f: (_, y) => { const k = 2e5, c = 2 * Math.sqrt(k * m1 * m2 / (m1 + m2)), Tt = Math.max(0, k * (y[0] - y[2]) + c * (y[1] - y[3])); return [y[1], g - Tt / m1, y[3], Tt / m2 - g]; },
              y0: [Tn / 2e5, 0, 0, 0], t1: 1, dt: 2e-5, out: (_, y) => 2 * y[0] }
          : { kind: "zero", fn: Tt => [m1 * g - Tt - m1 * a, Tt - m2 * g - m2 * a].map(x => x / (m1 * g)) }
      };
    }
  };
  T["f1-hooke-num"] = {
    type: "numeric", concepts: ["f1-hooke"], difficulty: 1,
    generate(r) {
      const k = r.int(5, 50) * 10, m = r.int(1, 20) / 2, ask = r.pick(["x", "k"]);
      const x = m * g / k;
      if (ask === "k") return {
        prompt: `Al colgar una masa de $${dec(m)}$ kg de un resorte, este se estira $${dec(num(x * 100, 3))}$ cm ($g = 9{,}8$ m/s²). ¿Cuál es la constante del resorte (N/m)?`,
        answer: k,
        solution: [`En equilibrio, la [[f1-hooke|fuerza elástica]] equilibra el peso: $kx = mg$.`, `$k = \\frac{mg}{x} = \\frac{${dec(m)}\\cdot 9{,}8}{${dec(num(x, 5))}} \\approx ${k}$ N/m.`],
        verify: { kind: "zero", fn: kk => [(kk * x - m * g) / (m * g)], tol: 1e-4 }
      };
      return {
        prompt: `Se cuelga una masa de $${dec(m)}$ kg de un resorte de constante $${k}$ N/m ($g = 9{,}8$ m/s²). ¿Cuánto se estira (en cm) en el equilibrio?`,
        answer: x * 100,
        solution: [`[[f1-hooke|Ley de Hooke]] en equilibrio: $kx = mg$.`, `$x = \\frac{${dec(m)}\\cdot 9{,}8}{${k}} \\approx ${num(x, 4)}$ m $= ${num(100 * x, 3)}$ cm.`],
        // verificación: oscilación amortiguada que termina en el equilibrio
        verify: { kind: "ode", f: (_, y) => [y[1], g - (k / m) * y[0] - 2 * Math.sqrt(k / m) * y[1]], y0: [0, 0], t1: 40 * Math.sqrt(m / k), dt: Math.sqrt(m / k) / 200, out: (_, y) => 100 * y[0], tol: 1e-4 }
      };
    }
  };
  T["f1-circdin-num"] = {
    type: "numeric", concepts: ["f1-dinamica-circular"], difficulty: 2,
    generate(r) {
      const v = r.pick(["curva", "loop", "cuerda"]);
      if (v === "curva") {
        const mu = r.pick([0.3, 0.4, 0.5, 0.6, 0.8]), R0 = r.int(2, 30) * 10, vmax = Math.sqrt(mu * g * R0);
        return { prompt: `¿Cuál es la máxima velocidad (m/s) con la que un auto puede tomar una curva plana de radio $${R0}$ m si el coeficiente de rozamiento estático es $${dec(mu)}$? ($g = 9{,}8$ m/s²)`, answer: vmax,
          solution: [`La fuerza centrípeta la da el [[f1-rozamiento|rozamiento]]: $\\frac{mv^2}{R} \\le \\mu_s mg$ ([[f1-dinamica-circular|dinámica circular]]).`, `$v_{\\max} = \\sqrt{\\mu_s g R} \\approx ${num(vmax, 3)}$ m/s (no depende de la masa).`],
          verify: { kind: "zero", fn: vv => [(vv * vv / R0 - mu * g) / g] } };
      }
      if (v === "loop") {
        const R0 = r.int(2, 20), vmin = Math.sqrt(g * R0);
        return { prompt: `Un carrito recorre un rulo vertical de radio $${R0}$ m. ¿Cuál es la mínima velocidad que tiene que tener **arriba** para no despegarse? ($g = 9{,}8$ m/s²)`, answer: vmin,
          solution: [`Arriba, el peso y la normal apuntan al centro: $mg + N = \\frac{mv^2}{R}$ ([[f1-dinamica-circular]]).`, `El caso límite es $N = 0$: $v_{\\min} = \\sqrt{gR} \\approx ${num(vmin, 3)}$ m/s.`],
          verify: { kind: "zero", fn: vv => [(vv * vv / R0 - g) / g] } };
      }
      const m = r.int(1, 5) / 2, L = r.pick([0.5, 0.8, 1, 1.2]), vel = r.int(2, 8), Tn = m * vel * vel / L + m * g;
      return { prompt: `Una piedra de $${dec(m)}$ kg atada a una cuerda de $${dec(L)}$ m gira en un círculo **vertical**. En el punto más bajo va a $${vel}$ m/s. ¿Cuál es la tensión de la cuerda en ese punto? ($g = 9{,}8$ m/s²)`, answer: Tn,
        solution: [`Abajo, la tensión apunta al centro (arriba) y el peso hacia afuera: $T - mg = \\frac{mv^2}{L}$ ([[f1-dinamica-circular]]).`, `$T = ${dec(m)}\\left(9{,}8 + \\frac{${vel * vel}}{${dec(L)}}\\right) \\approx ${num(Tn, 3)}$ N.`],
        verify: { kind: "zero", fn: Tt => [(Tt - m * g - m * vel * vel / L) / Tt] } };
    }
  };
  T["f1-dcl-mc"] = {
    type: "mc", concepts: ["f1-newton"], difficulty: 1,
    generate(r) {
      const m = r.int(2, 20), th = r.pick([20, 30, 37, 45, 53, 60]);
      const W = m * g, opts = [W * Math.cos(rad(th)), W * Math.sin(rad(th)), W, W / Math.cos(rad(th))].map(x => num(x, 3) + "\\ \\text{N}");
      if (new Set(opts).size < 4) return null;
      return {
        prompt: `Un bloque de $${m}$ kg está apoyado en un plano inclinado a $${th}^\\circ$ ($g = 9{,}8$ m/s²). ¿Cuánto vale la fuerza **normal**?`,
        ...H.mc(r, opts[0], opts.slice(1)),
        solution: [`En el [[f1-newton|diagrama de cuerpo libre]] se descompone el peso en ejes paralelo y perpendicular al plano.`, `No hay aceleración perpendicular: $N = mg\\cos ${th}^\\circ \\approx ${opts[0]}$. (Es menor que el peso: el plano "sostiene" solo una parte.)`],
        // verificación: proyección del vector peso sobre la normal al plano
        verify: { kind: "value", target: W * Math.cos(rad(th)), fn: () => { const n = [Math.sin(rad(th)), Math.cos(rad(th))], P = [0, -W]; return -(P[0] * n[0] + P[1] * n[1]); } }
      };
    }
  };
  T["f1-tercera-vf"] = {
    testN: 80, // simulación cara: menos instancias en los tests
    type: "tf", concepts: ["f1-newton"], difficulty: 1,
    generate(r) {
      const M = r.int(3, 20) * 1000, m = r.int(6, 15) * 100, q = r.pick(["fuerza", "acel"]);
      return {
        prompt: `Un camión de $${M}$ kg choca de frente con un auto de $${m}$ kg. <b>Verdadero o falso:</b> durante el choque, ${q === "fuerza" ? "la fuerza que el camión hace sobre el auto es mayor que la que el auto hace sobre el camión" : "el auto sufre una aceleración mayor que el camión"}.`,
        answer: q === "acel",
        explanation: q === "fuerza" ? `Falso: por la [[f1-newton|tercera ley]] las dos fuerzas son iguales en módulo y opuestas, en todo instante.` : `Verdadero: las fuerzas son iguales, pero $a = F/m$ y el auto tiene ${num(M / m, 2)} veces menos masa.`,
        solution: [`Acción y reacción: iguales y opuestas, aplicadas sobre cuerpos **distintos**.`],
        // verificación: choque simulado con un resorte de contacto; se comparan fuerzas y aceleraciones máximas
        verify: { kind: "truth", fn: () => {
          let x1 = 0, v1 = 10, x2 = 1, v2 = -10, dt = 1e-5, maxA1 = 0, maxA2 = 0, f12 = 0, f21 = 0;
          for (let i = 0; i < 4e4; i++) {
            const pen = Math.max(0, x1 - x2 + 0.5), F = 1e7 * pen;
            const a1 = -F / M, a2 = F / m;
            maxA1 = Math.max(maxA1, Math.abs(a1)); maxA2 = Math.max(maxA2, Math.abs(a2)); f12 = Math.max(f12, F); f21 = Math.max(f21, Math.abs(M * a1));
            v1 += a1 * dt; v2 += a2 * dt; x1 += v1 * dt; x2 += v2 * dt;
          }
          return q === "fuerza" ? f12 > f21 * (1 + 1e-9) : maxA2 > maxA1;
        } }
      };
    }
  };

  const cards = {
    "f1-newton": {
      title: "Leyes de Newton y diagrama de cuerpo libre", aliases: ["leyes de Newton", "primera ley de Newton", "segunda ley de Newton", "tercera ley de Newton", "segunda ley", "tercera ley", "principio de inercia", "acción y reacción", "diagrama de cuerpo libre", "masa y peso"], concepts: ["f1-newton"],
      summary: "1) Sin fuerza neta, velocidad constante. 2) ΣF = m a. 3) Acción y reacción: iguales y opuestas sobre cuerpos distintos.",
      def: [R`**1.ª ley (inercia):** si la fuerza neta sobre un cuerpo es nula, su velocidad es constante (en un sistema inercial).`,
        R`**2.ª ley:** $\sum\vec F = m\vec a$, o en general $\sum\vec F = \frac{d\vec p}{dt}$.`,
        R`**3.ª ley:** si $A$ ejerce $\vec F$ sobre $B$, entonces $B$ ejerce $-\vec F$ sobre $A$.`,
        R`**Peso:** $\vec P = m\vec g$, con $g \approx 9{,}8$ m/s² cerca de la superficie terrestre. La masa mide la inercia; el peso es una fuerza.`],
      idea: [R`**Receta del diagrama de cuerpo libre:** 1) aislá un cuerpo; 2) dibujá **solo** las fuerzas que actúan **sobre** él (peso, normales, tensiones, rozamientos, resortes); 3) elegí ejes convenientes (por ejemplo, a lo largo de la aceleración); 4) escribí $\sum F_x = ma_x$ y $\sum F_y = ma_y$.`,
        R`Las fuerzas de acción y reacción **nunca** se cancelan entre sí, porque actúan sobre cuerpos distintos. La normal y el peso de un libro sobre la mesa no son un par de acción y reacción (el par del peso es la atracción del libro sobre la Tierra).`],
      examples: [{ q: R`Un ascensor de 500 kg sube acelerando a 2 m/s². ¿Tensión del cable?`, steps: [R`$T - mg = ma$.`, R`$T = 500(9{,}8 + 2) = 5900$ N.`] }],
      see: ["f1-rozamiento", "f1-hooke", "f1-dinamica-circular"]
    },
    "f1-rozamiento": {
      title: "Rozamiento y plano inclinado", aliases: ["rozamiento", "fuerza de rozamiento", "coeficiente de rozamiento", "rozamiento estático", "rozamiento dinámico", "plano inclinado"], concepts: ["f1-rozamiento"],
      summary: "Estático: f ≤ μs N (lo que haga falta). Dinámico: f = μk N, opuesto al deslizamiento.",
      def: [R`**Rozamiento estático:** se ajusta para impedir el deslizamiento, hasta un máximo $f_s \le \mu_s N$. **Dinámico:** $f_k = \mu_k N$, opuesto a la velocidad relativa. En general $\mu_k < \mu_s$.`,
        R`**Plano inclinado** a un ángulo $\theta$: el peso se descompone en $mg\sin\theta$ (a lo largo del plano) y $mg\cos\theta$ (perpendicular). Si no hay otras fuerzas perpendiculares, $N = mg\cos\theta$.`],
      idea: [R`Sin rozamiento, un bloque baja con $a = g\sin\theta$; con rozamiento dinámico, $a = g(\sin\theta - \mu_k\cos\theta)$. La masa se cancela.`,
        R`Un bloque queda quieto si $\tan\theta \le \mu_s$: midiendo el ángulo al que empieza a deslizar se mide $\mu_s$.`],
      demo: [R`**Paso 1 (ejes).** Hacemos el diagrama de cuerpo libre del bloque: peso $mg$ vertical, normal $N$ perpendicular al plano y rozamiento a lo largo del plano. Tomamos el eje $x$ a lo largo del plano, hacia abajo, y el $y$ perpendicular. Así la aceleración queda solo en $x$.`,
        R`**Paso 2 (normal).** Descomponemos el peso: $mg\sin\theta$ a lo largo del plano y $mg\cos\theta$ contra él. En $y$ el bloque no se acelera (no se despega ni se hunde), así que por la segunda ley $N - mg\cos\theta = 0$, o sea $N = mg\cos\theta$.`,
        R`**Paso 3 (bajada).** En $x$, la componente del peso empuja hacia abajo y el rozamiento dinámico, $\mu_kN$, se opone al deslizamiento. La segunda ley da $mg\sin\theta - \mu_kN = ma$. Reemplazamos $N$ y dividimos por $m$: $$a = g\,(\sin\theta - \mu_k\cos\theta).$$ La masa se cancela; sin rozamiento ($\mu_k = 0$) queda $a = g\sin\theta$.`,
        R`**Paso 4 (cuándo queda quieto).** Quieto, el rozamiento estático tiene que equilibrar exactamente $mg\sin\theta$. Lo puede hacer mientras no supere su máximo: $mg\sin\theta \le \mu_sN = \mu_smg\cos\theta$. Dividiendo por $mg\cos\theta$ (positivo), $\tan\theta \le \mu_s$. $\blacksquare$`],
      examples: [{ q: R`¿Con qué aceleración baja un bloque por un plano a $30^\circ$ con $\mu_k = 0{,}2$?`, steps: [R`$a = 9{,}8(0{,}5 - 0{,}2\cdot 0{,}866) \approx 3{,}2$ m/s².`] }],
      tips: [R`El rozamiento estático **no** vale siempre $\mu_s N$: ese es solo su máximo. Un bloque quieto sobre una mesa sin otras fuerzas horizontales tiene rozamiento cero.`],
      see: ["f1-newton", "f1-dinamica-circular"]
    },
    "f1-hooke": {
      title: "Fuerza elástica: ley de Hooke", aliases: ["ley de Hooke", "fuerza elástica", "constante elástica", "constante del resorte"], concepts: ["f1-hooke"],
      summary: "Un resorte estirado o comprimido x hace una fuerza F = −kx, hacia su posición natural.",
      def: [R`$$F = -kx$$ donde $x$ es el estiramiento respecto de la longitud natural y $k$ la **constante elástica** (N/m). El signo menos indica que la fuerza se opone a la deformación (es restauradora).`],
      idea: [R`Vale para deformaciones chicas: casi todo material se comporta así cerca del equilibrio, y por eso los resortes aparecen en todos lados. La fuerza restauradora lineal es lo que produce el [[f1-mas|movimiento armónico simple]], y la energía guardada en el resorte es $\frac12kx^2$ (ver [[f1-energia]]).`],
      demo: [R`**Paso 1 (por qué es lineal).** Llamamos $F(x)$ a la fuerza que hace el material cuando lo deformamos $x$. En la posición natural no hace fuerza: $F(0) = 0$. Para $x$ chico reemplazamos $F$ por su [[recta-tangente|recta tangente]] en $0$: $$F(x) \approx F(0) + F'(0)\,x = F'(0)\,x.$$`,
        R`**Paso 2.** La fuerza es restauradora (si estirás, tira para atrás), así que $F'(0) < 0$. Llamando $k = -F'(0) > 0$, queda $F \approx -kx$. Vale mientras el término siguiente del desarrollo sea despreciable, o sea para deformaciones chicas.`,
        R`**Paso 3 (energía).** Para estirar el resorte despacio, sin acelerarlo, hay que hacer en cada posición $x'$ una fuerza $+kx'$, opuesta a la del resorte. Como la fuerza varía, el trabajo es una [[integral-definida]]: $$W = \int_0^x kx'\,dx' = \tfrac12kx^2.$$`,
        R`**Paso 4.** Ese trabajo no se pierde: el resorte lo devuelve al volver. Queda guardado como energía potencial elástica, $U = \frac12kx^2$.`],
      examples: [{ q: R`Un resorte se estira 5 cm con 2 kg colgados. ¿$k$?`, steps: [R`$k = \frac{mg}{x} = \frac{2\cdot 9{,}8}{0{,}05} = 392$ N/m.`] }],
      see: ["f1-newton", "f1-mas", "f1-energia"]
    },
    "f1-dinamica-circular": {
      title: "Dinámica del movimiento circular", aliases: ["fuerza centrípeta", "dinámica circular", "curva peraltada", "rulo"], concepts: ["f1-dinamica-circular"],
      summary: "La suma de fuerzas hacia el centro es m v²/R. La 'fuerza centrípeta' no es una fuerza nueva: la hace la tensión, la normal, el rozamiento o la gravedad.",
      def: [R`Para un cuerpo en movimiento circular, la componente radial de la segunda ley es $$\sum F_{\text{hacia el centro}} = m\frac{v^2}{R} = m\omega^2 R.$$`],
      idea: [R`Ejemplos: en una curva plana la fuerza hacia el centro es el [[f1-rozamiento|rozamiento]] ($v_{\max} = \sqrt{\mu_s g R}$); en una órbita, la [[f1-gravitacion|gravedad]]; en una piedra atada, la tensión. La "fuerza centrífuga" que sentís en un auto es la inercia vista desde un sistema no inercial.`,
        R`En un rulo vertical, arriba el peso alcanza para girar si $v^2 = gR$: es la velocidad mínima para no despegarse.`],
      demo: [R`**Paso 1 (la aceleración).** Por la cinemática del [[f1-circular|movimiento circular]], un cuerpo que gira con rapidez $v$ en un círculo de radio $R$ tiene una aceleración que apunta al centro y mide $\frac{v^2}{R} = \omega^2R$ (sale de derivar dos veces la posición).`,
        R`**Paso 2 (la ley).** Escribimos la [[f1-newton|segunda ley]] en la dirección radial, tomando positivo hacia el centro. La aceleración en esa dirección es la del paso 1, así que $$\sum F_{\text{hacia el centro}} = m\frac{v^2}{R}.$$ No aparece ninguna fuerza nueva: el lado izquierdo lo ponen la tensión, la normal, el rozamiento o el peso.`,
        R`**Paso 3 (curva plana).** En una curva horizontal, la única fuerza horizontal sobre el auto es el rozamiento estático (las ruedas no deslizan de costado), así que hace de fuerza centrípeta: $m\frac{v^2}{R} = f_s$. Como $f_s \le \mu_sN$ y $N = mg$, queda $\frac{v^2}{R} \le \mu_sg$, o sea $v \le \sqrt{\mu_sgR}$.`,
        R`**Paso 4 (arriba del rulo).** En el punto más alto, el peso y la normal de la pista apuntan los dos hacia abajo, que es hacia el centro: $mg + N = m\frac{v^2}{R}$. La pista solo puede empujar, así que $N \ge 0$, y entonces $v^2 \ge gR$. En el caso límite $v^2 = gR$ la normal se anula y el peso solo alcanza para curvar la trayectoria.`],
      examples: [{ q: R`Una piedra de 0,2 kg gira en un círculo horizontal de 0,5 m a 3 m/s. ¿Tensión?`, steps: [R`$T = \frac{mv^2}{R} = \frac{0{,}2\cdot 9}{0{,}5} = 3{,}6$ N (si el círculo es horizontal y despreciamos el peso).`] }],
      see: ["f1-circular", "f1-newton", "f1-gravitacion"]
    }
  };

  E.extendCourse("f101", {
    concepts: {
      "f1-newton": { name: "Leyes de Newton" },
      "f1-rozamiento": { name: "Rozamiento y plano inclinado" },
      "f1-hooke": { name: "Ley de Hooke" },
      "f1-dinamica-circular": { name: "Dinámica circular" }
    },
    templates: T,
    units: [{
      id: "f1-dinamica", order: 2, program: "Unidad 2", title: "Dinámica: leyes de movimiento", icon: "zap",
      diagnostic: ["f1-newton-num", "f1-atwood-num", "f1-circdin-num"],
      lessons: [
        { id: "f1-leyes", title: "Leyes de Newton", templates: ["f1-tercera-vf", "f1-dcl-mc", "f1-atwood-num"], theory: ["f1-newton"],
          intro: R`$\sum\vec F = m\vec a$. Acción y reacción actúan sobre cuerpos distintos. Primero, el diagrama de cuerpo libre.` },
        { id: "f1-rozamiento", title: "Rozamiento y plano inclinado", templates: ["f1-newton-num", "f1-plano-num"], theory: ["f1-rozamiento", "f1-newton"],
          intro: R`$f_k = \mu_k N$; el estático se ajusta hasta $\mu_s N$. En un plano: $N = mg\cos\theta$ y la componente del peso a lo largo es $mg\sin\theta$.` },
        { id: "f1-hooke-circular", title: "Resortes y dinámica circular", templates: ["f1-hooke-num", "f1-circdin-num"], theory: ["f1-hooke", "f1-dinamica-circular"],
          intro: R`$F = -kx$. En movimiento circular, la suma de fuerzas hacia el centro vale $\frac{mv^2}{R}$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 3 · TRABAJO Y ENERGÍA
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {}, g = 9.8;
  const dec = x => String(x).replace(".", "{,}");
  const rad = d => d * Math.PI / 180;

  T["f1-trabajo-num"] = {
    type: "numeric", concepts: ["f1-trabajo"], difficulty: 2,
    generate(r) {
      const v = r.pick(["const", "resorte", "variable"]);
      if (v === "const") {
        const F = r.int(10, 100), d = r.int(2, 20), th = r.pick([0, 30, 45, 60, 90, 120, 180]);
        const W = F * d * Math.cos(rad(th));
        return { prompt: `Una fuerza constante de $${F}$ N actúa sobre un cuerpo que se desplaza $${d}$ m en línea recta. La fuerza forma $${th}^\\circ$ con el desplazamiento. ¿Cuánto trabajo (J) hace?`, answer: Math.abs(W) < 1e-9 ? 0 : W,
          solution: [`[[f1-trabajo|Trabajo]] de una fuerza constante: $W = \\vec F\\cdot\\Delta\\vec r = Fd\\cos\\theta$.`, `$W = ${F}\\cdot${d}\\cos ${th}^\\circ \\approx ${num(W, 3)}$ J${th === 90 ? " (perpendicular: no trabaja)" : th > 90 ? " (negativo: frena)" : ""}.`],
          verify: { kind: "integral", f: () => F * Math.cos(rad(th)), a: 0, b: d } };
      }
      if (v === "resorte") {
        const k = r.int(5, 50) * 10, x1 = r.int(0, 5) / 100, x2 = x1 + r.int(2, 10) / 100;
        const W = k * (x2 * x2 - x1 * x1) / 2;
        return { prompt: `¿Cuánto trabajo (J) hay que hacer para estirar un resorte de $k = ${k}$ N/m desde $${dec(num(x1 * 100))}$ cm hasta $${dec(num(x2 * 100))}$ cm de su longitud natural?`, answer: W,
          solution: [`La fuerza necesaria varía: $F = kx$. El trabajo es la integral ([[f1-trabajo|trabajo de una fuerza variable]]): $W = \\int_{x_1}^{x_2} kx\\,dx = \\frac12k(x_2^2 - x_1^2)$.`, `$W = \\frac12\\cdot${k}\\,(${dec(num(x2, 3))}^2 - ${dec(num(x1, 3))}^2) \\approx ${num(W, 4)}$ J.`],
          verify: { kind: "integral", f: x => k * x, a: x1, b: x2 } };
      }
      const a = r.int(1, 6), b = r.int(0, 10), d = r.int(1, 4);
      return { prompt: `Una fuerza $F(x) = ${a}x^{2} + ${b}$ (N, con $x$ en m) empuja un objeto a lo largo del eje $x$ desde $0$ hasta $${d}$ m. ¿Cuánto trabajo (J) hace?`, answer: a * d ** 3 / 3 + b * d,
        solution: [`$W = \\int_0^{${d}} F(x)\\,dx$ ([[f1-trabajo]], [[tfc|Barrow]]).`, `$= \\left[\\frac{${a}x^3}{3} + ${b}x\\right]_0^{${d}} = ${num(a * d ** 3 / 3 + b * d, 4)}$ J.`],
        verify: { kind: "integral", f: x => a * x * x + b, a: 0, b: d } };
    }
  };
  T["f1-energia-num"] = {
    type: "numeric", concepts: ["f1-energia"], difficulty: 2,
    generate(r) {
      const v = r.pick(["caida", "friccion", "pendulo"]);
      if (v === "caida") {
        const h = r.int(1, 40), v0 = r.int(0, 10), ans = Math.sqrt(v0 * v0 + 2 * g * h);
        return { prompt: `Un carrito pasa por un punto de una montaña rusa a $${v0}$ m/s y baja $${h}$ m por una pista sin rozamiento. ¿Qué velocidad tiene abajo? ($g = 9{,}8$ m/s²)`, answer: ans,
          solution: [`Sin rozamiento la normal no trabaja y se [[f1-energia|conserva la energía mecánica]]: $\\frac12mv_0^2 + mgh = \\frac12mv^2$.`, `$v = \\sqrt{v_0^2 + 2gh} = \\sqrt{${v0 * v0} + 19{,}6\\cdot${h}} \\approx ${num(ans, 3)}$ m/s (no importa la forma de la pista).`],
          verify: { kind: "ode", f: (_, y) => [y[1], -g], y0: [h, -v0], t1: 0, until: (_, y) => y[0] <= 0, g: (_, y) => y[0], dt: 1e-4, out: (_, y) => Math.abs(y[1]) } };
      }
      if (v === "friccion") {
        const m = r.int(1, 10), h = r.int(2, 20), Wf = r.int(1, 8) * m * 2, E0 = m * g * h;
        if (Wf >= E0) return null;
        const ans = Math.sqrt(2 * (E0 - Wf) / m);
        return { prompt: `Un bloque de $${m}$ kg parte del reposo y baja $${h}$ m de altura por una rampa. El rozamiento hace $${-Wf}$ J de trabajo. ¿Con qué velocidad llega abajo? ($g = 9{,}8$ m/s²)`, answer: ans,
          solution: [`[[f1-energia|Teorema del trabajo y la energía]]: $\\Delta K = W_{\\text{peso}} + W_{\\text{roz}} = mgh - ${Wf}$.`, `$\\frac12\\cdot${m}\\,v^2 = ${num(E0, 4)} - ${Wf}$, así que $v \\approx ${num(ans, 3)}$ m/s.`],
          verify: { kind: "zero", fn: vv => [(0.5 * m * vv * vv - (m * g * h - Wf)) / E0] } };
      }
      const L = r.pick([0.5, 1, 1.5, 2]), th = r.pick([20, 30, 45, 60, 90]), ans = Math.sqrt(2 * g * L * (1 - Math.cos(rad(th))));
      return { prompt: `Un péndulo de $${dec(L)}$ m se suelta desde $${th}^\\circ$ respecto de la vertical. ¿Qué velocidad tiene al pasar por el punto más bajo? ($g = 9{,}8$ m/s²)`, answer: ans,
        solution: [`La tensión es perpendicular a la velocidad (no trabaja): se [[f1-energia|conserva la energía]]. Baja $h = L(1 - \\cos\\theta)$.`, `$v = \\sqrt{2gL(1 - \\cos ${th}^\\circ)} \\approx ${num(ans, 3)}$ m/s.`],
        // verificación: integramos la ecuación del péndulo hasta que pasa por la vertical
        verify: { kind: "ode", f: (_, y) => [y[1], -(g / L) * Math.sin(y[0])], y0: [rad(th), 0], t1: 0, until: (_, y) => y[0] <= 0, g: (_, y) => y[0], dt: 1e-4, out: (_, y) => Math.abs(y[1]) * L } };
    }
  };
  T["f1-resorte-num"] = {
    type: "numeric", concepts: ["f1-energia"], difficulty: 2,
    generate(r) {
      const m = r.int(1, 10) / 2, v0 = r.int(1, 8), k = r.int(5, 80) * 10, x = v0 * Math.sqrt(m / k);
      return {
        prompt: `Un bloque de $${dec(m)}$ kg se desliza sin rozamiento a $${v0}$ m/s y choca contra un resorte de $k = ${k}$ N/m. ¿Cuál es la compresión máxima (en cm)?`,
        answer: 100 * x,
        solution: [`Toda la energía cinética se guarda en el resorte ([[f1-energia]]): $\\frac12mv_0^2 = \\frac12kx^2$.`, `$x = v_0\\sqrt{\\frac{m}{k}} = ${v0}\\sqrt{\\frac{${dec(m)}}{${k}}} \\approx ${num(x, 4)}$ m $= ${num(100 * x, 3)}$ cm.`],
        verify: { kind: "ode", f: (_, y) => [y[1], -(k / m) * y[0]], y0: [0, v0], t1: 0, until: (_, y) => y[1] <= 0, g: (_, y) => y[1], dt: Math.sqrt(m / k) / 500, out: (_, y) => 100 * y[0] }
      };
    }
  };
  T["f1-potencia-num"] = {
    type: "numeric", concepts: ["f1-potencia"], difficulty: 1,
    generate(r) {
      if (r.bool()) {
        const m = r.int(5, 100) * 10, h = r.int(2, 30), t = r.int(5, 60), P = m * g * h / t;
        return { prompt: `Un motor sube una carga de $${m}$ kg a velocidad constante una altura de $${h}$ m en $${t}$ s. ¿Qué potencia media (W) desarrolla? ($g = 9{,}8$ m/s²)`, answer: P,
          solution: [`A velocidad constante, el motor hace un trabajo igual a la energía potencial ganada: $W = mgh$ ([[f1-potencia|potencia]]).`, `$P = \\frac{W}{t} = \\frac{${m}\\cdot 9{,}8\\cdot${h}}{${t}} \\approx ${num(P, 4)}$ W.`],
          verify: { kind: "value", fn: () => { const vel = h / t; return m * g * vel; } } };
      }
      const F = r.int(5, 50) * 100, vk = r.int(36, 144), P = F * vk / 3.6;
      return { prompt: `Un auto avanza a $${vk}$ km/h constante y el motor ejerce una fuerza de $${F}$ N (que compensa los rozamientos). ¿Qué potencia (kW) entrega?`, answer: P / 1000,
        solution: [`$P = \\vec F\\cdot\\vec v = Fv$ ([[f1-potencia|potencia]]), con $v = ${vk}/3{,}6 \\approx ${num(vk / 3.6, 3)}$ m/s.`, `$P \\approx ${num(P, 4)}$ W $\\approx ${num(P / 1000, 3)}$ kW.`],
        verify: { kind: "value", fn: () => F * (vk * 1000 / 3600) * 1e-3 } };
    }
  };
  T["f1-cons-vf"] = {
    type: "tf", concepts: ["f1-energia"], difficulty: 1,
    generate(r) {
      const m1 = r.int(1, 5), m2 = m1 * r.int(2, 5), L = r.pick([0.5, 1, 2]), th = r.pick([30, 45, 60]), q = r.pick(["igual", "pesado"]);
      return {
        prompt: `Dos péndulos de $${dec(L)}$ m, con masas de $${m1}$ kg y $${m2}$ kg, se sueltan desde $${th}^\\circ$. Sin rozamiento, <b>verdadero o falso:</b> ${q === "igual" ? "pasan por el punto más bajo con la misma velocidad" : "el más pesado pasa por abajo más rápido"}.`,
        answer: q === "igual",
        explanation: `Por [[f1-energia|conservación de la energía]], $mgh = \\frac12mv^2$: la masa se cancela y $v = \\sqrt{2gh}$ es la misma para los dos.`,
        solution: [`En un campo gravitatorio uniforme, sin rozamiento, la masa no importa para la velocidad.`],
        verify: { kind: "truth", fn: () => {
          const vb = m => { let a = rad(th), w = 0; const dt = 1e-4; while (a > 0) { w += -(m * g / (m * L)) * Math.sin(a) * dt; a += w * dt; } return Math.abs(w) * L; };
          const v1 = vb(m1), v2 = vb(m2);
          return q === "igual" ? Math.abs(v1 - v2) < 1e-9 : v2 > v1 + 1e-6;
        } }
      };
    }
  };

  const cards = {
    "f1-trabajo": {
      title: "Trabajo y producto escalar", aliases: ["trabajo de una fuerza", "trabajo de una fuerza variable", "trabajo"], concepts: ["f1-trabajo"],
      summary: "W = F·Δr = F d cos θ para una fuerza constante; W = ∫ F(x) dx si la fuerza varía.",
      def: [R`**Producto escalar:** $\vec A\cdot\vec B = AB\cos\theta = A_xB_x + A_yB_y + A_zB_z$.`,
        R`**Trabajo de una fuerza constante** en un desplazamiento recto: $W = \vec F\cdot\Delta\vec r = Fd\cos\theta$. **Fuerza variable** a lo largo de $x$: $$W = \int_{x_1}^{x_2} F(x)\,dx.$$ Se mide en joules: $1\ \text{J} = 1\ \text{N}\cdot\text{m}$.`],
      idea: [R`Solo trabaja la componente de la fuerza **a lo largo** del movimiento. Una fuerza perpendicular (la normal en un piso horizontal, la tensión en un péndulo, la fuerza centrípeta en un MCU) no hace trabajo. Si la fuerza se opone al movimiento, el trabajo es negativo (el rozamiento).`,
        R`Trabajo del resorte: $W = \int kx\,dx = \frac12kx^2$. Es el área bajo el gráfico $F(x)$, igual que en una [[integral-definida]].`],
      demo: [R`**Paso 1 (las dos fórmulas del producto escalar).** Calculamos $|\vec A - \vec B|^2$ de dos maneras. Con el teorema del coseno en el triángulo de lados $\vec A$, $\vec B$ y $\vec A - \vec B$: $$|\vec A - \vec B|^2 = A^2 + B^2 - 2AB\cos\theta.$$`,
        R`**Paso 2.** Por componentes, desarrollando cada cuadrado $(A_i - B_i)^2 = A_i^2 - 2A_iB_i + B_i^2$: $$|\vec A - \vec B|^2 = \sum(A_i - B_i)^2 = A^2 + B^2 - 2\sum A_iB_i.$$ Igualando con el paso 1, se cancelan $A^2$ y $B^2$ y queda $AB\cos\theta = A_xB_x + A_yB_y + A_zB_z$.`,
        R`**Paso 3 (fuerza variable).** Partimos el recorrido de $x_1$ a $x_2$ en tramos chicos $\Delta x$. En cada tramo la fuerza casi no cambia, así que podemos usar la fórmula de fuerza constante: el trabajo es casi $F(x_i)\,\Delta x$.`,
        R`**Paso 4.** Sumamos todos los tramos. Esa suma es una suma de Riemann, y cuando los tramos se achican tiende a la [[integral-definida]]: $$W = \int_{x_1}^{x_2}F(x)\,dx.$$`,
        R`**Paso 5 (resorte).** Cuando el resorte vuelve de $x$ a $0$, su fuerza es $-kx'$ y el desplazamiento va en el mismo sentido que ella, así que el trabajo es positivo: $$\int_x^0(-kx')\,dx' = \left[-\tfrac12kx'^2\right]_x^0 = \tfrac12kx^2.$$`],
      examples: [{ q: R`¿Trabajo del peso de un libro de 2 kg que cae 1,5 m?`, steps: [R`Fuerza y desplazamiento paralelos: $W = mgh = 2\cdot 9{,}8\cdot 1{,}5 = 29{,}4$ J.`] }],
      see: ["f1-energia", "f1-potencia"]
    },
    "f1-energia": {
      title: "Energía mecánica y su conservación", aliases: ["energía cinética", "energía potencial", "energía mecánica", "conservación de la energía", "conserva la energía", "teorema del trabajo y la energía", "fuerzas conservativas", "fuerza conservativa", "diagrama de energía"], concepts: ["f1-energia"],
      summary: "W_neto = ΔK. Con solo fuerzas conservativas, K + U se conserva; las no conservativas cambian la energía mecánica.",
      def: [R`**Energía cinética:** $K = \frac12mv^2$. **Teorema del trabajo y la energía:** $W_{\text{neto}} = \Delta K$.`,
        R`Una fuerza es **conservativa** si su trabajo no depende del camino: tiene asociada una **energía potencial** $U$ con $W = -\Delta U$. Gravitatoria cerca de la Tierra: $U = mgh$. Elástica: $U = \frac12kx^2$.`,
        R`**Conservación:** si solo trabajan fuerzas conservativas, $E = K + U$ es constante. En general, $\Delta E = W_{\text{no conservativas}}$ (por ejemplo, el rozamiento).`],
      idea: [R`La conservación permite calcular velocidades **sin conocer la trayectoria ni el tiempo**: un carrito que baja $h$ sin rozamiento llega con $v = \sqrt{2gh}$ por cualquier pista.`,
        R`**Diagramas de energía:** graficando $U(x)$ y la recta de la energía total $E$, el cuerpo solo puede estar donde $U(x) \le E$. Los mínimos de $U$ son equilibrios estables y la fuerza es $F = -\frac{dU}{dx}$.`],
      demo: [R`**Paso 1 (trabajo y energía, en 1D).** El trabajo de la fuerza neta es $W = \int F\,dx$. Por la [[f1-newton|segunda ley]], $F = m\frac{dv}{dt}$: $$W = \int m\frac{dv}{dt}\,dx.$$`,
        R`**Paso 2.** Cambiamos de variable de integración: en lugar de $x$, usamos $v$. Por la [[regla-cadena|regla de la cadena]], $\frac{dv}{dt} = \frac{dv}{dx}\frac{dx}{dt} = v\frac{dv}{dx}$, así que $\frac{dv}{dt}\,dx = v\,dv$: $$W = \int_{v_i}^{v_f} m\,v\,dv = \tfrac12mv_f^2 - \tfrac12mv_i^2 = \Delta K.$$`,
        R`**Paso 3 (conservación).** Separamos el trabajo en el de las fuerzas conservativas y el de las demás. Por definición de energía potencial, las conservativas hacen $W_c = -\Delta U$. El paso 2 dice entonces $-\Delta U + W_{nc} = \Delta K$, o sea $$\Delta(K + U) = W_{nc}.$$`,
        R`**Paso 4.** Si las fuerzas no conservativas no trabajan, $W_{nc} = 0$ y $E = K + U$ no cambia. $\blacksquare$`,
        R`**Paso 5 (fuerza y potencial).** En un desplazamiento chico $dx$, la fuerza conservativa hace $F\,dx = -dU$. Dividiendo por $dx$: $F = -\frac{dU}{dx}$. Por eso en un mínimo de $U$ la fuerza es cero y, a los costados, empuja hacia el mínimo: equilibrio estable.`],
      examples: [{ q: R`Se tira una pelota hacia arriba a 15 m/s. ¿Altura máxima?`, steps: [R`$\frac12mv^2 = mgh \Rightarrow h = \frac{v^2}{2g} = \frac{225}{19{,}6} \approx 11{,}5$ m.`] }],
      see: ["f1-trabajo", "f1-potencia", "f1-hooke", "f1-momento"]
    },
    "f1-potencia": {
      title: "Potencia", aliases: ["potencia mecánica", "potencia media", "watt"], concepts: ["f1-potencia"],
      summary: "Potencia es trabajo por unidad de tiempo: P = dW/dt = F·v. Se mide en watts (J/s).",
      def: [R`**Potencia media:** $P_m = \frac{W}{\Delta t}$. **Instantánea:** $P = \frac{dW}{dt} = \vec F\cdot\vec v$. Unidad: $1\ \text{W} = 1\ \text{J/s}$ ($1$ HP $\approx 746$ W).`],
      idea: [R`Dos motores pueden hacer el mismo trabajo; el más potente lo hace más rápido. Un auto a velocidad constante necesita potencia para compensar el rozamiento con el aire, que crece con la velocidad: por eso consume más en ruta rápida.`,
        R`La energía también se mide en kWh: $1\ \text{kWh} = 1000\ \text{W}\cdot 3600\ \text{s} = 3{,}6\times10^6$ J.`],
      demo: [R`**Paso 1.** En un intervalo chico $dt$ el cuerpo se desplaza $d\vec r$, y en ese tramo la fuerza es prácticamente constante. Su trabajo es el de una fuerza constante: $dW = \vec F\cdot d\vec r$.`,
        R`**Paso 2.** La potencia es el trabajo por unidad de tiempo. Dividimos por $dt$; como $\vec F$ no depende de $dt$, el cociente pasa al desplazamiento, y $\frac{d\vec r}{dt}$ es la velocidad: $$P = \frac{dW}{dt} = \vec F\cdot\frac{d\vec r}{dt} = \vec F\cdot\vec v.$$`,
        R`**Paso 3 (auto a velocidad constante).** Si la velocidad no cambia, la fuerza neta es cero: el motor empuja con una fuerza igual a la resistencia $f(v)$. Por el paso 2, el motor entrega $P = f(v)\,v$.`,
        R`**Paso 4.** La resistencia del aire crece aproximadamente como $v^2$, así que la potencia crece como $v^2\cdot v = v^3$: al doble de velocidad, $2^3 = 8$ veces más potencia.`],
      examples: [{ q: R`Subís una escalera de 3 m en 4 s y pesás 70 kg. ¿Potencia?`, steps: [R`$P = \frac{mgh}{t} = \frac{70\cdot 9{,}8\cdot 3}{4} \approx 515$ W.`] }],
      see: ["f1-trabajo", "f1-energia"]
    }
  };

  E.extendCourse("f101", {
    concepts: {
      "f1-trabajo": { name: "Trabajo" },
      "f1-energia": { name: "Energía y su conservación" },
      "f1-potencia": { name: "Potencia" }
    },
    templates: T,
    units: [{
      id: "f1-energia-u", order: 3, program: "Unidad 3", title: "Trabajo y energía", icon: "zap",
      diagnostic: ["f1-trabajo-num", "f1-energia-num", "f1-potencia-num"],
      lessons: [
        { id: "f1-trabajo", title: "Trabajo", templates: ["f1-trabajo-num", "f1-potencia-num"], theory: ["f1-trabajo", "f1-potencia"],
          intro: R`$W = Fd\cos\theta$ y, si la fuerza varía, $W = \int F\,dx$. Potencia: $P = \frac{W}{t} = Fv$.` },
        { id: "f1-energia", title: "Energía y su conservación", templates: ["f1-cons-vf", "f1-energia-num", "f1-resorte-num"], theory: ["f1-energia", "f1-trabajo"],
          intro: R`$W_{\text{neto}} = \Delta K$. Sin fuerzas no conservativas, $K + U$ es constante: $U = mgh$, $U = \frac12kx^2$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 4 · CANTIDAD DE MOVIMIENTO, IMPULSO Y CHOQUES
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {};
  const dec = x => String(x).replace(".", "{,}");
  // choque 1D simulado con un resorte de contacto (elástico) entre dos partículas
  function springCollision(m1, v1, m2, v2) {
    let x1 = -1, x2 = 0, dt = 1e-5;
    for (let i = 0; i < 2e6; i++) {
      const pen = Math.max(0, x1 - x2), F = 1e6 * pen;
      v1 += -F / m1 * dt; v2 += F / m2 * dt; x1 += v1 * dt; x2 += v2 * dt;
      if (pen === 0 && x1 < x2 && v1 <= v2 && i > 10) { if (x2 - x1 > 0.5) break; }
    }
    return [v1, v2];
  }

  T["f1-impulso-num"] = {
    type: "numeric", concepts: ["f1-momento"], difficulty: 2,
    generate(r) {
      const m = r.int(1, 10) / 2, F0 = r.int(10, 200), dt = r.pick([0.02, 0.05, 0.1, 0.2]), v0 = r.int(0, 5), ask = r.pick(["J", "v"]);
      const J = F0 * dt / 2;
      return {
        prompt: `Sobre un cuerpo de $${dec(m)}$ kg que se mueve a $${v0}$ m/s actúa, en la dirección del movimiento, una fuerza que crece linealmente de $0$ a $${F0}$ N y vuelve a $0$ en $${dec(dt)}$ s (forma de triángulo). ¿${ask === "J" ? "Cuál es el impulso (N·s)" : "Qué velocidad final tiene"}?`,
        answer: ask === "J" ? J : v0 + J / m,
        solution: [`El [[f1-momento|impulso]] es el área bajo $F(t)$: $J = \\int F\\,dt = \\frac12\\cdot${F0}\\cdot${dec(dt)} = ${num(J, 4)}$ N·s.`, `$J = \\Delta p \\Rightarrow v_f = v_0 + \\frac{J}{m} = ${v0} + \\frac{${num(J, 4)}}{${dec(m)}} \\approx ${num(v0 + J / m, 4)}$ m/s.`],
        verify: ask === "J"
          ? { kind: "integral", f: t => (t < dt / 2 ? 2 * F0 * t / dt : 2 * F0 * (dt - t) / dt), a: 0, b: dt, tol: 1e-3 }
          : { kind: "ode", f: (t, y) => [(t < dt / 2 ? 2 * F0 * t / dt : 2 * F0 * (dt - t) / dt) / m], y0: [v0], t1: dt, dt: dt / 2000, out: (_, y) => y[0] }
      };
    }
  };
  T["f1-choque-el-num"] = {
    type: "numeric", concepts: ["f1-choques"], difficulty: 3,
    generate(r) {
      const [m1, m2] = r.distinct(2, 1, 8), v1 = r.int(2, 10), ask = r.pick(["v1", "v2"]);
      const v1f = (m1 - m2) / (m1 + m2) * v1, v2f = 2 * m1 / (m1 + m2) * v1;
      return {
        prompt: `Una esfera de $${m1}$ kg a $${v1}$ m/s choca **elásticamente** y de frente con otra de $${m2}$ kg en reposo. ¿Qué velocidad tiene después la ${ask === "v1" ? "primera (con signo: positivo en el sentido inicial)" : "segunda"}?`,
        answer: ask === "v1" ? v1f : v2f, answerTex: ask === "v1" ? H.frac((m1 - m2) * v1, m1 + m2) : H.frac(2 * m1 * v1, m1 + m2),
        solution: [
          `En un [[f1-choques|choque elástico]] se conservan la cantidad de movimiento y la energía cinética.`,
          `Resolviendo: $v_1' = \\frac{m_1 - m_2}{m_1 + m_2}v_1 = ${num(v1f, 4)}$ m/s y $v_2' = \\frac{2m_1}{m_1 + m_2}v_1 = ${num(v2f, 4)}$ m/s.`,
          m1 < m2 ? `La primera rebota (velocidad negativa) porque es más liviana.` : `La primera sigue hacia adelante, más lenta.`
        ],
        verify: { kind: "value", tol: 1e-3, fn: () => springCollision(m1, v1, m2, 0)[ask === "v1" ? 0 : 1] }
      };
    }
  };
  T["f1-choque-inel-num"] = {
    type: "numeric", concepts: ["f1-choques"], difficulty: 2,
    generate(r) {
      const m1 = r.int(1, 10) * 100, m2 = r.int(1, 10) * 100, v1 = r.int(5, 25), v2 = r.int(-15, 10), ask = r.pick(["v", "dK"]);
      const vf = (m1 * v1 + m2 * v2) / (m1 + m2), dK = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2 - 0.5 * (m1 + m2) * vf * vf;
      return {
        prompt: `Un auto de $${m1}$ kg a $${v1}$ m/s choca con otro de $${m2}$ kg que va a $${v2}$ m/s (misma recta; signo positivo en el sentido del primero) y quedan **enganchados**. ¿${ask === "v" ? "Con qué velocidad se mueven juntos" : "Cuánta energía cinética (J) se pierde"}?`,
        answer: ask === "v" ? vf : dK,
        solution: [
          `[[f1-choques|Choque plástico]]: solo se conserva la cantidad de movimiento. $${m1}\\cdot${v1} + ${m2}\\cdot(${v2}) = ${m1 + m2}\\,v$.`,
          `$v = ${num(vf, 4)}$ m/s.`,
          `$\\Delta K = K_i - K_f \\approx ${num(dK, 5)}$ J (se va en deformación y calor).`
        ],
        verify: ask === "v" ? { kind: "zero", fn: vv => [(m1 * v1 + m2 * v2 - (m1 + m2) * vv) / (m1 * v1 + 1)] }
          : { kind: "value", tol: 1e-6, fn: () => { const mu = m1 * m2 / (m1 + m2); return 0.5 * mu * (v1 - v2) ** 2; } }
      };
    }
  };
  T["f1-cm-num"] = {
    type: "numeric", concepts: ["f1-cm"], difficulty: 1,
    generate(r) {
      const ms = [r.int(1, 9), r.int(1, 9), r.int(1, 9)], xs = r.distinct(3, -5, 8), ys = [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)], axis = r.pick(["x", "y"]);
      const M = ms[0] + ms[1] + ms[2], c = (axis === "x" ? xs : ys);
      const ans = (ms[0] * c[0] + ms[1] * c[1] + ms[2] * c[2]) / M;
      return {
        prompt: `Tres partículas: $${ms[0]}$ kg en $(${xs[0]}, ${ys[0]})$, $${ms[1]}$ kg en $(${xs[1]}, ${ys[1]})$ y $${ms[2]}$ kg en $(${xs[2]}, ${ys[2]})$ (en m). ¿Cuál es la coordenada $${axis}$ del centro de masa?`,
        answer: ans, answerTex: H.frac(ms[0] * c[0] + ms[1] * c[1] + ms[2] * c[2], M),
        solution: [`[[f1-cm|Centro de masa]]: $${axis}_{cm} = \\frac{\\sum m_i ${axis}_i}{\\sum m_i}$.`, `$= \\frac{${ms[0]}\\cdot${c[0]} + ${ms[1]}\\cdot${c[1]} + ${ms[2]}\\cdot${c[2]}}{${M}} = ${H.frac(ms[0] * c[0] + ms[1] * c[1] + ms[2] * c[2], M)}$ m.`],
        // verificación: momentos respecto de otro origen y corrimiento
        verify: { kind: "value", fn: () => { const o = 17.3; return ms.reduce((s, m, i) => s + m * (c[i] - o), 0) / M + o; } }
      };
    }
  };
  const CL = ["Elástico", "Inelástico (no plástico)", "Plástico (quedan unidos)", "Imposible: no conserva la cantidad de movimiento"];
  T["f1-choque-tipo-mc"] = {
    type: "mc", concepts: ["f1-choques"], difficulty: 2,
    generate(r) {
      const m1 = r.int(1, 5), m2 = r.int(1, 5), v1 = r.int(2, 8), kind = r.int(0, 3);
      let u1, u2;
      const P = m1 * v1;
      if (kind === 0) { u1 = (m1 - m2) / (m1 + m2) * v1; u2 = 2 * m1 / (m1 + m2) * v1; }
      else if (kind === 2) { u1 = u2 = P / (m1 + m2); }
      else if (kind === 1) { const e = 0.5; u2 = (P + m1 * e * v1) / (m1 + m2); u1 = u2 - e * v1; }
      else { u1 = 0; u2 = (P + m1) / m2; }
      const fx = x => num(x, 3);
      return {
        prompt: `Una esfera de $${m1}$ kg a $${v1}$ m/s choca de frente con otra de $${m2}$ kg en reposo. Después del choque las velocidades son $${fx(u1)}$ m/s y $${fx(u2)}$ m/s. ¿Qué tipo de choque fue?`,
        ...H.mc(r, CL[kind], CL.filter((_, i) => i !== kind), { text: true, keepOrder: true }),
        solution: [
          `Primero, [[f1-momento|cantidad de movimiento]]: antes $${P}$ kg·m/s; después $${fx(m1 * u1 + m2 * u2)}$ kg·m/s.`,
          `Energía cinética: antes $${fx(0.5 * m1 * v1 * v1)}$ J; después $${fx(0.5 * m1 * u1 * u1 + 0.5 * m2 * u2 * u2)}$ J.`,
          `Se conserva $p$ ${kind === 3 ? "**no**: es imposible sin fuerzas externas" : kind === 0 ? "y también $K$: [[f1-choques|elástico]]" : kind === 2 ? "y salen con la misma velocidad: plástico" : "pero se pierde $K$ y no quedan unidos: inelástico"}.`
        ],
        // verificación: se clasifica a partir de los números (conservación de p, de K y velocidades finales)
        verify: { kind: "value", target: kind, fn: () => {
          const pOk = Math.abs(m1 * u1 + m2 * u2 - P) < 1e-9 * P;
          if (!pOk) return 3;
          if (Math.abs(u1 - u2) < 1e-9) return 2;
          return Math.abs(0.5 * m1 * u1 * u1 + 0.5 * m2 * u2 * u2 - 0.5 * m1 * v1 * v1) < 1e-9 ? 0 : 1;
        } }
      };
    }
  };
  T["f1-retroceso-num"] = {
    type: "numeric", concepts: ["f1-momento"], difficulty: 1,
    generate(r) {
      const m1 = r.int(40, 90), m2 = r.int(20, 80), v1 = r.int(1, 6) / 2;
      return {
        prompt: `Dos patinadores de $${m1}$ kg y $${m2}$ kg están quietos sobre el hielo y se empujan. El de $${m1}$ kg sale a $${dec(v1)}$ m/s. ¿A qué velocidad sale el otro (en módulo)?`,
        answer: m1 * v1 / m2,
        solution: [`Sin fuerzas externas horizontales se [[f1-momento|conserva la cantidad de movimiento]]: antes era $0$, así que después $m_1v_1 + m_2v_2 = 0$.`, `$|v_2| = \\frac{${m1}\\cdot${dec(v1)}}{${m2}} \\approx ${num(m1 * v1 / m2, 3)}$ m/s, en sentido contrario.`],
        verify: { kind: "zero", fn: vv => [(m1 * v1 - m2 * vv) / (m1 * v1)] }
      };
    }
  };

  const cards = {
    "f1-momento": {
      title: "Cantidad de movimiento e impulso", aliases: ["cantidad de movimiento", "momento lineal", "impulso", "conservación de la cantidad de movimiento", "conserva la cantidad de movimiento"], concepts: ["f1-momento"],
      summary: "p = m v. El impulso J = ∫F dt cambia p. Sin fuerza externa neta, la p total se conserva.",
      def: [R`**Cantidad de movimiento:** $\vec p = m\vec v$. La segunda ley en general es $\sum\vec F = \frac{d\vec p}{dt}$.`, R`**Impulso:** $\vec J = \int\vec F\,dt = \Delta\vec p$.`,
        R`**Conservación:** si la fuerza externa neta sobre un sistema es nula, $\vec P_{\text{total}} = \sum m_i\vec v_i$ es constante.`],
      idea: [R`Las fuerzas internas aparecen de a pares de [[f1-newton|acción y reacción]] y se cancelan en la suma: por eso, en un choque o una explosión, la cantidad de movimiento total se conserva aunque las fuerzas internas sean enormes.`,
        R`El impulso explica los airbags: para el mismo $\Delta p$, si el choque dura más tiempo la fuerza media $\frac{\Delta p}{\Delta t}$ es menor.`],
      demo: [R`**Paso 1 (impulso).** La segunda ley en general es $\vec F = \frac{d\vec p}{dt}$. Integramos entre $t_i$ y $t_f$: a la izquierda queda el impulso, y a la derecha, por el [[tfc|teorema fundamental del cálculo]], el cambio de $\vec p$: $$\vec J = \int_{t_i}^{t_f}\vec F\,dt = \vec p_f - \vec p_i.$$`,
        R`**Paso 2 (conservación).** Tomamos dos cuerpos que solo interactúan entre sí (sin fuerza externa neta). Sobre el 1 actúa la fuerza $\vec F_{21}$ que le hace el 2, y sobre el 2, la $\vec F_{12}$ que le hace el 1: $$\frac{d\vec p_1}{dt} = \vec F_{21}, \qquad \frac{d\vec p_2}{dt} = \vec F_{12}.$$`,
        R`**Paso 3.** Por la [[f1-newton|tercera ley]], $\vec F_{12} = -\vec F_{21}$. Sumamos las dos ecuaciones y las fuerzas se cancelan: $$\frac{d}{dt}(\vec p_1 + \vec p_2) = 0.$$`,
        R`**Paso 4.** Una cantidad con derivada nula es constante: $\vec p_1 + \vec p_2$ se conserva. Con más cuerpos pasa lo mismo, porque las fuerzas internas siempre vienen de a pares opuestos. $\blacksquare$`],
      examples: [{ q: R`Una pelota de 0,15 kg llega a 30 m/s y sale en sentido contrario a 40 m/s. ¿Impulso?`, steps: [R`$J = m(v_f - v_i) = 0{,}15(40 - (-30)) = 10{,}5$ N·s.`] }],
      see: ["f1-choques", "f1-cm", "f1-newton"]
    },
    "f1-choques": {
      title: "Choques elásticos e inelásticos", aliases: ["choque elástico", "choque inelástico", "choque plástico", "choques", "coeficiente de restitución"], concepts: ["f1-choques"],
      summary: "En todo choque se conserva p. En el elástico también la energía cinética; en el plástico los cuerpos quedan unidos.",
      def: [R`En un choque se conserva la [[f1-momento|cantidad de movimiento]] total. **Elástico:** también se conserva $K$. **Inelástico:** se pierde energía cinética. **Plástico (perfectamente inelástico):** los cuerpos quedan unidos, $v_f = \frac{m_1v_1 + m_2v_2}{m_1 + m_2}$.`,
        R`**Elástico 1D con $m_2$ en reposo:** $$v_1' = \frac{m_1 - m_2}{m_1 + m_2}v_1, \qquad v_2' = \frac{2m_1}{m_1 + m_2}v_1.$$`],
      idea: [R`Casos límite: masas iguales intercambian velocidades (el péndulo de Newton); una pelota liviana contra una pared rebota con la misma rapidez; una masa grande contra una chica en reposo la manda al doble de su velocidad.`,
        R`En un choque elástico, la velocidad relativa se invierte: $v_2' - v_1' = -(v_2 - v_1)$.`],
      demo: [R`**Paso 1 (plástico).** Los cuerpos quedan unidos y salen con la misma velocidad $v_f$. Solo usamos la conservación de la cantidad de movimiento: $m_1v_1 + m_2v_2 = (m_1 + m_2)\,v_f$, de donde sale $v_f$ despejando.`,
        R`**Paso 2 (elástico, planteo).** Con $m_2$ en reposo, escribimos las dos conservaciones juntando a cada lado lo de cada cuerpo. Cantidad de movimiento: $m_1(v_1 - v_1') = m_2v_2'$. Energía cinética (simplificando el $\frac12$): $m_1(v_1^2 - v_1'^2) = m_2v_2'^2$.`,
        R`**Paso 3.** Factorizamos la diferencia de cuadrados: $v_1^2 - v_1'^2 = (v_1 - v_1')(v_1 + v_1')$. Dividimos la ecuación de la energía por la del momento (si hubo choque, $v_1' \neq v_1$, así que no dividimos por cero): $$v_1 + v_1' = v_2'.$$ Dice que la velocidad relativa se invierte.`,
        R`**Paso 4.** Reemplazamos $v_2' = v_1 + v_1'$ en la del momento: $m_1v_1 - m_1v_1' = m_2v_1 + m_2v_1'$. Juntando: $(m_1 + m_2)\,v_1' = (m_1 - m_2)\,v_1$, y entonces $$v_1' = \frac{m_1 - m_2}{m_1 + m_2}v_1, \qquad v_2' = v_1 + v_1' = \frac{2m_1}{m_1 + m_2}v_1. \quad\blacksquare$$`],
      examples: [{ q: R`Un auto de 1000 kg a 20 m/s choca y se engancha con otro de 1500 kg detenido. ¿Velocidad final?`, steps: [R`$v_f = \frac{1000\cdot 20}{2500} = 8$ m/s.`] }],
      see: ["f1-momento", "f1-energia"]
    },
    "f1-cm": {
      title: "Centro de masa", aliases: ["centro de masa", "centro de masas"], concepts: ["f1-cm"],
      summary: "x_cm = Σ mᵢxᵢ / Σ mᵢ. El centro de masa se mueve como si toda la masa y la fuerza externa estuvieran ahí.",
      def: [R`$$\vec r_{cm} = \frac{\sum m_i\vec r_i}{\sum m_i}$$ y para un cuerpo continuo $\vec r_{cm} = \frac{1}{M}\int\vec r\,dm$.`],
      idea: [R`**Teorema del centro de masa:** $M\vec a_{cm} = \sum\vec F_{\text{ext}}$. Un proyectil que explota en el aire: los pedazos vuelan para cualquier lado, pero su centro de masa sigue la misma parábola.`,
        R`Para un objeto simétrico y homogéneo, el centro de masa está en el centro de simetría. Con cuerpos compuestos se trata cada parte como una partícula ubicada en su propio centro de masa.`],
      demo: [R`**Paso 1.** Multiplicamos la definición por la masa total: $M\vec r_{cm} = \sum m_i\vec r_i$. Derivamos dos veces respecto del tiempo; las masas son constantes y salen de la derivada: $$M\vec a_{cm} = \sum m_i\vec a_i.$$`,
        R`**Paso 2.** Por la [[f1-newton|segunda ley]], cada $m_i\vec a_i$ es la fuerza total sobre la partícula $i$: las externas más las que le hacen las demás partículas del sistema, $\sum_{j\neq i}\vec F_{ji}$.`,
        R`**Paso 3.** Al sumar sobre todas las partículas, las fuerzas internas aparecen de a pares: la que $j$ hace sobre $i$ y la que $i$ hace sobre $j$. Por la tercera ley son opuestas y se cancelan. Queda $$M\vec a_{cm} = \sum\vec F_{\text{ext}}. \quad\blacksquare$$`,
        R`**Paso 4 (el proyectil que explota).** Las fuerzas de la explosión son internas, así que no cambian el lado derecho: la única fuerza externa sigue siendo el peso total $M\vec g$ (despreciando el aire). Entonces $\vec a_{cm} = \vec g$ y el centro de masa sigue la misma parábola.`],
      examples: [{ q: R`Masas de 2 kg en $x = 0$ y 6 kg en $x = 4$ m. ¿$x_{cm}$?`, steps: [R`$x_{cm} = \frac{2\cdot 0 + 6\cdot 4}{8} = 3$ m (más cerca de la masa grande).`] }],
      see: ["f1-momento", "f1-equilibrio"]
    }
  };

  E.extendCourse("f101", {
    concepts: {
      "f1-momento": { name: "Cantidad de movimiento e impulso" },
      "f1-choques": { name: "Choques" },
      "f1-cm": { name: "Centro de masa" }
    },
    templates: T,
    units: [{
      id: "f1-momento-u", order: 4, program: "Unidad 4", title: "Cantidad de movimiento, impulso y choques", icon: "zap",
      diagnostic: ["f1-impulso-num", "f1-choque-inel-num", "f1-cm-num"],
      lessons: [
        { id: "f1-impulso", title: "Impulso y conservación", templates: ["f1-impulso-num", "f1-retroceso-num"], theory: ["f1-momento"],
          intro: R`$\vec J = \int\vec F\,dt = \Delta\vec p$. Sin fuerza externa neta, $\sum m_i\vec v_i$ se conserva.` },
        { id: "f1-choques", title: "Choques y centro de masa", templates: ["f1-choque-tipo-mc", "f1-choque-inel-num", "f1-choque-el-num", "f1-cm-num"], theory: ["f1-choques", "f1-cm"],
          intro: R`Siempre se conserva $p$. Elástico: también $K$. Plástico: quedan unidos. $x_{cm} = \frac{\sum m_ix_i}{\sum m_i}$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 5 · MECÁNICA DE FLUIDOS
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {}, g = 9.8, p0 = 101300;
  const dec = x => String(x).replace(".", "{,}");
  const LIQ = [{ n: "agua", r: 1000 }, { n: "agua de mar", r: 1025 }, { n: "aceite", r: 920 }, { n: "glicerina", r: 1260 }, { n: "mercurio", r: 13600 }];

  T["f1-presion-num"] = {
    type: "numeric", concepts: ["f1-hidrostatica"], difficulty: 1,
    generate(r) {
      const L = r.pick(LIQ.slice(0, 4)), h = r.int(1, 40), abs = r.bool();
      const ans = (abs ? p0 : 0) + L.r * g * h;
      return {
        prompt: `¿Cuál es la presión ${abs ? "**absoluta**" : "**manométrica**"} (en kPa) a $${h}$ m de profundidad en ${L.n} ($\\rho = ${L.r}$ kg/m³, $g = 9{,}8$ m/s²${abs ? ", $p_{atm} = 101{,}3$ kPa" : ""})?`,
        answer: ans / 1000,
        solution: [`[[f1-hidrostatica|Presión hidrostática]]: $p = p_0 + \\rho g h$${abs ? "" : "; la manométrica es solo $\\rho g h$"}.`, `$\\rho g h = ${L.r}\\cdot 9{,}8\\cdot${h} = ${num(L.r * g * h)}$ Pa.`, `Respuesta: $\\approx ${num(ans / 1000, 4)}$ kPa.`],
        // verificación: integramos dp/dz = ρ g desde la superficie
        verify: { kind: "ode", f: () => [L.r * g / 1000], y0: [abs ? p0 / 1000 : 0], t1: h, dt: 0.01, out: (_, y) => y[0] }
      };
    }
  };
  T["f1-pascal-num"] = {
    type: "numeric", concepts: ["f1-hidrostatica"], difficulty: 1,
    generate(r) {
      const d1 = r.int(1, 5), d2 = d1 * r.int(3, 12), F1 = r.int(10, 300);
      const F2 = F1 * (d2 / d1) ** 2;
      return {
        prompt: `En una prensa hidráulica, el pistón chico tiene $${d1}$ cm de diámetro y el grande $${d2}$ cm. Si sobre el chico se hacen $${F1}$ N, ¿qué fuerza (N) aparece en el grande?`,
        answer: F2,
        solution: [`[[f1-hidrostatica|Principio de Pascal]]: la presión se transmite igual, $\\frac{F_1}{A_1} = \\frac{F_2}{A_2}$.`, `Las áreas van como el diámetro al cuadrado: $F_2 = F_1\\left(\\frac{${d2}}{${d1}}\\right)^2 = ${num(F2)}$ N.`],
        verify: { kind: "zero", fn: F => [(F1 / (Math.PI * (d1 / 200) ** 2) - F / (Math.PI * (d2 / 200) ** 2)) / (F1 / (Math.PI * (d1 / 200) ** 2))] }
      };
    }
  };
  T["f1-arquimedes-num"] = {
    type: "numeric", concepts: ["f1-arquimedes"], difficulty: 2,
    generate(r) {
      if (r.bool()) {
        const mats = [{ n: "un bloque de madera", r: r.int(4, 8) * 100 }, { n: "un cubo de hielo", r: 917 }, { n: "una boya de plástico", r: r.int(1, 6) * 100 }];
        const ob = r.pick(mats), L = r.pick([LIQ[0], LIQ[1]]), f = ob.r / L.r;
        return { prompt: `¿Qué porcentaje del volumen de ${ob.n} ($\\rho = ${ob.r}$ kg/m³) queda sumergido al flotar en ${L.n} ($\\rho = ${L.r}$ kg/m³)?`, answer: 100 * f,
          solution: [`Flotando, el [[f1-arquimedes|empuje]] iguala al peso: $\\rho_{\\ell}\\,g\\,V_{sum} = \\rho\\,g\\,V$.`, `$\\frac{V_{sum}}{V} = \\frac{\\rho}{\\rho_\\ell} = \\frac{${ob.r}}{${L.r}} \\approx ${num(100 * f, 3)}\\%$.`],
          // verificación: buscamos por bisección la profundidad de equilibrio de un cubo
          verify: { kind: "value", tol: 1e-6, fn: () => { let lo = 0, hi = 1; for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (L.r * mid < ob.r) lo = mid; else hi = mid; } return 100 * lo; } } };
      }
      const V = r.int(1, 20) / 10, rho = r.pick([2700, 7800, 8900, 11300]), L = r.pick(LIQ.slice(0, 4));
      const Vm = V / 1000, W = rho * Vm * g, Wap = W - L.r * Vm * g;
      return { prompt: `Una pieza metálica de $${dec(V)}$ L ($\\rho = ${rho}$ kg/m³) cuelga de un dinamómetro totalmente sumergida en ${L.n} ($\\rho = ${L.r}$ kg/m³). ¿Qué marca el dinamómetro (N)? ($g = 9{,}8$ m/s²)`, answer: Wap,
        solution: [`Peso: $\\rho V g \\approx ${num(W, 4)}$ N. [[f1-arquimedes|Empuje]]: $\\rho_\\ell V g \\approx ${num(L.r * Vm * g, 4)}$ N.`, `El dinamómetro marca la diferencia (peso aparente): $\\approx ${num(Wap, 4)}$ N.`],
        verify: { kind: "zero", fn: Tn => [(Tn + L.r * Vm * g - rho * Vm * g) / W] } };
    }
  };
  T["f1-continuidad-num"] = {
    type: "numeric", concepts: ["f1-hidrodinamica"], difficulty: 1,
    generate(r) {
      const d1 = r.int(2, 10), d2 = r.int(1, d1 - 1) || 1, v1 = r.int(1, 6) / 2;
      if (d2 === d1) return null;
      const v2 = v1 * (d1 / d2) ** 2;
      return {
        prompt: `Por un caño de $${d1}$ cm de diámetro circula agua a $${dec(v1)}$ m/s. El caño se angosta a $${d2}$ cm de diámetro. ¿Qué velocidad tiene el agua en la parte angosta?`,
        answer: v2,
        solution: [`[[f1-hidrodinamica|Ecuación de continuidad]] (fluido incompresible): $A_1v_1 = A_2v_2$.`, `$v_2 = v_1\\left(\\frac{d_1}{d_2}\\right)^2 = ${dec(v1)}\\cdot\\left(\\frac{${d1}}{${d2}}\\right)^2 \\approx ${num(v2, 4)}$ m/s.`],
        verify: { kind: "zero", fn: vv => [(Math.PI * (d1 / 2) ** 2 * v1 - Math.PI * (d2 / 2) ** 2 * vv) / (Math.PI * (d1 / 2) ** 2 * v1)] }
      };
    }
  };
  T["f1-bernoulli-num"] = {
    type: "numeric", concepts: ["f1-hidrodinamica"], difficulty: 2,
    generate(r) {
      if (r.bool()) {
        const h = r.int(1, 20) / 2, v = Math.sqrt(2 * g * h);
        return { prompt: `Un tanque abierto tiene un agujero chico a $${dec(h)}$ m por debajo de la superficie del agua. ¿A qué velocidad sale el chorro? ($g = 9{,}8$ m/s²)`, answer: v,
          solution: [`[[f1-hidrodinamica|Bernoulli]] entre la superficie (quieta, $p_{atm}$) y el agujero ($p_{atm}$): $\\rho g h = \\frac12\\rho v^2$.`, `Teorema de Torricelli: $v = \\sqrt{2gh} \\approx ${num(v, 3)}$ m/s, como una caída libre desde $h$.`],
          verify: { kind: "ode", f: (_, y) => [y[1], -g], y0: [h, 0], t1: 0, until: (_, y) => y[0] <= 0, g: (_, y) => y[0], dt: 1e-4, out: (_, y) => Math.abs(y[1]) } };
      }
      const v1 = r.int(1, 4), d1 = r.int(4, 10), d2 = r.int(2, d1 - 1), v2 = v1 * (d1 / d2) ** 2, dp = 0.5 * 1000 * (v2 * v2 - v1 * v1);
      return { prompt: `Por un caño horizontal circula agua a $${v1}$ m/s en una sección de $${d1}$ cm de diámetro, que después se angosta a $${d2}$ cm. ¿Cuánto **baja** la presión (en kPa) en la parte angosta? ($\\rho = 1000$ kg/m³)`, answer: dp / 1000,
        solution: [`Continuidad: $v_2 = ${v1}\\left(\\frac{${d1}}{${d2}}\\right)^2 \\approx ${num(v2, 4)}$ m/s.`, `[[f1-hidrodinamica|Bernoulli]] a la misma altura: $p_1 - p_2 = \\frac12\\rho(v_2^2 - v_1^2) \\approx ${num(dp, 4)}$ Pa $\\approx ${num(dp / 1000, 4)}$ kPa.`],
        verify: { kind: "zero", fn: d => [(d * 1000 + 0.5 * 1000 * v1 * v1 - 0.5 * 1000 * (v1 * (d1 / 2) ** 2 / (d2 / 2) ** 2) ** 2) / (dp || 1)] } };
    }
  };
  T["f1-capilar-num"] = {
    type: "numeric", concepts: ["f1-tension-sup"], difficulty: 2,
    generate(r) {
      const rmm = r.pick([0.1, 0.2, 0.25, 0.5, 1]), gam = 0.0728, rr = rmm / 1000, h = 2 * gam / (1000 * g * rr);
      return {
        prompt: `¿Cuánto sube el agua (en cm) en un tubo capilar de vidrio de $${dec(rmm)}$ mm de radio? (Tensión superficial $\\gamma = 0{,}0728$ N/m, ángulo de contacto $0^\\circ$, $\\rho = 1000$ kg/m³, $g = 9{,}8$ m/s²)`,
        answer: 100 * h,
        solution: [`La [[f1-tension-sup|tensión superficial]] tira hacia arriba a lo largo del borde, $2\\pi r\\gamma$, y sostiene el peso de la columna, $\\rho g\\pi r^2h$.`, `$h = \\frac{2\\gamma}{\\rho g r} \\approx ${num(h, 4)}$ m $= ${num(100 * h, 3)}$ cm (cuanto más fino el tubo, más sube).`],
        verify: { kind: "zero", fn: hc => [(2 * Math.PI * rr * gam - 1000 * g * Math.PI * rr * rr * hc / 100) / (2 * Math.PI * rr * gam)] }
      };
    }
  };
  T["f1-flota-vf"] = {
    type: "tf", concepts: ["f1-arquimedes"], difficulty: 1,
    generate(r) {
      const ob = r.pick([{ n: "un trozo de hierro", r: 7800 }, { n: "un corcho", r: 240 }, { n: "una piedra", r: 2600 }, { n: "un trozo de hielo", r: 917 }, { n: "un bloque de pino", r: 500 }]);
      const L = r.pick([LIQ[0], LIQ[4]]), truth = ob.r < L.r;
      return {
        prompt: `<b>Verdadero o falso:</b> ${ob.n} ($\\rho = ${ob.r}$ kg/m³) flota en ${L.n} ($\\rho = ${L.r}$ kg/m³).`,
        answer: truth,
        explanation: `Flota si su densidad es menor que la del líquido: así el [[f1-arquimedes|empuje]] puede igualar al peso con solo una parte sumergida. ${L.n === "mercurio" ? "¡En mercurio flota hasta el hierro!" : ""}`,
        solution: [`Totalmente sumergido, el empuje vale $\\rho_\\ell Vg$ y el peso $\\rho Vg$: gana el mayor.`],
        verify: { kind: "truth", fn: () => (L.r - ob.r) * 1e-3 * g > 0 }
      };
    }
  };

  const cards = {
    "f1-hidrostatica": {
      title: "Hidrostática: densidad, presión y Pascal", aliases: ["presión hidrostática", "presión", "densidad", "principio de Pascal", "prensa hidráulica", "presión manométrica", "presión absoluta"], concepts: ["f1-hidrostatica"],
      summary: "p = p₀ + ρ g h. La presión en un fluido en reposo solo depende de la profundidad y se transmite igual a todo el fluido (Pascal).",
      def: [R`**Densidad:** $\rho = \frac{m}{V}$ (agua: $1000$ kg/m³). **Presión:** fuerza perpendicular por unidad de área, $p = \frac{F}{A}$, en pascales ($1$ Pa $= 1$ N/m²; $p_{atm} \approx 101{,}3$ kPa).`,
        R`**Ley fundamental de la hidrostática:** en un fluido incompresible en reposo, $$p = p_0 + \rho g h,$$ con $h$ la profundidad. La **presión manométrica** es $p - p_{atm}$.`,
        R`**Principio de Pascal:** un aumento de presión en un fluido encerrado se transmite igual a todos sus puntos.`],
      idea: [R`Cada 10 m de agua, la presión sube aproximadamente 1 atmósfera. La forma del recipiente no importa: solo la profundidad (paradoja hidrostática).`,
        R`La **prensa hidráulica** multiplica fuerzas: $\frac{F_1}{A_1} = \frac{F_2}{A_2}$. La energía igual se conserva, porque el pistón grande se mueve mucho menos.`],
      demo: [R`**Paso 1.** Aislamos una columnita de fluido de sección $A$ y altura $dh$, con $h$ la profundidad medida hacia abajo. Las fuerzas verticales sobre ella son su peso, la presión de arriba, $p\,A$, que empuja hacia abajo, y la de abajo, $(p + dp)\,A$, que empuja hacia arriba. Las presiones de los costados son horizontales y se cancelan.`,
        R`**Paso 2.** Su masa es densidad por volumen, $\rho A\,dh$, así que su peso es $\rho gA\,dh$. El fluido está en reposo, así que la fuerza neta es cero: $$(p + dp)\,A - p\,A - \rho gA\,dh = 0 \quad\Longrightarrow\quad \frac{dp}{dh} = \rho g.$$`,
        R`**Paso 3.** Si el fluido es incompresible, $\rho$ es constante, y $g$ también. Integramos desde la superficie ($h = 0$, presión $p_0$) hasta la profundidad $h$: $$p = p_0 + \rho gh. \quad\blacksquare$$`,
        R`**Paso 4 (Pascal).** En la fórmula, la presión en cualquier punto es $p_0$ más algo que solo depende de la profundidad. Si aumentamos $p_0$ en $\Delta p$, la presión aumenta $\Delta p$ en todos los puntos del fluido.`],
      examples: [{ q: R`¿Qué altura de mercurio equilibra la presión atmosférica?`, steps: [R`$h = \frac{p_{atm}}{\rho g} = \frac{101300}{13600\cdot 9{,}8} \approx 0{,}76$ m: los 760 mm de Torricelli.`] }],
      see: ["f1-arquimedes", "f1-hidrodinamica"]
    },
    "f1-arquimedes": {
      title: "Principio de Arquímedes y flotación", aliases: ["principio de Arquímedes", "Arquímedes", "empuje", "flotación", "peso aparente"], concepts: ["f1-arquimedes"],
      summary: "Un cuerpo sumergido recibe un empuje hacia arriba igual al peso del fluido que desaloja: E = ρ_fluido g V_sumergido.",
      def: [R`$$E = \rho_{\text{fluido}}\,g\,V_{\text{sumergido}}$$ Un cuerpo flota si su densidad media es menor que la del fluido; flotando, la fracción sumergida es $\frac{\rho_{\text{cuerpo}}}{\rho_{\text{fluido}}}$.`],
      idea: [R`El empuje sale de la [[f1-hidrostatica|presión hidrostática]]: abajo del cuerpo la presión es mayor que arriba. Por eso no depende del material del cuerpo, solo del volumen sumergido.`,
        R`El hielo ($917$ kg/m³) flota en agua con un $92\%$ sumergido: lo que asoma de un iceberg es poquito. Un barco de acero flota porque su densidad **media** (acero más aire) es menor que la del agua.`],
      demo: [R`**Paso 1.** El empuje es la fuerza total que hace la presión del fluido sobre la superficie del cuerpo. Esa presión depende solo de la profundidad de cada punto ([[f1-hidrostatica|hidrostática]]), no de qué hay adentro de la superficie.`,
        R`**Paso 2.** Imaginamos que sacamos el cuerpo y llenamos el hueco con el mismo fluido. Ese pedazo de fluido está en reposo, igual que el resto, así que la fuerza neta sobre él es cero: la fuerza de presión sobre su superficie equilibra su peso, $\rho_fgV$, y apunta hacia arriba.`,
        R`**Paso 3.** El cuerpo tiene exactamente la misma superficie, en el mismo lugar, así que recibe las mismas presiones y la misma fuerza total: $E = \rho_fgV$, hacia arriba. Si está sumergido solo en parte, el razonamiento vale con el volumen sumergido. $\blacksquare$`,
        R`**Paso 4 (fracción sumergida).** Flotando en equilibrio, el empuje iguala al peso: $\rho_fgV_{\text{sum}} = \rho_cgV$. Dividiendo, $\frac{V_{\text{sum}}}{V} = \frac{\rho_c}{\rho_f}$.`],
      examples: [{ q: R`Una piedra pesa 30 N en el aire y 20 N sumergida en agua. ¿Volumen?`, steps: [R`Empuje $= 10$ N $= 1000\cdot 9{,}8\cdot V$.`, R`$V \approx 1{,}02\times10^{-3}$ m³ (un litro).`] }],
      see: ["f1-hidrostatica"]
    },
    "f1-tension-sup": {
      title: "Tensión superficial y capilaridad", aliases: ["tensión superficial", "capilaridad", "capilar"], concepts: ["f1-tension-sup"],
      summary: "La superficie de un líquido se comporta como una membrana tensa: γ es la fuerza por unidad de longitud. En un tubo fino el líquido sube h = 2γcosθ/(ρgr).",
      def: [R`La **tensión superficial** $\gamma$ es la fuerza por unidad de longitud que ejerce la superficie de un líquido (agua a $20^\circ$C: $\approx 0{,}073$ N/m). Equivale a la energía por unidad de área de la superficie.`,
        R`**Capilaridad (ley de Jurin):** en un tubo de radio $r$, $$h = \frac{2\gamma\cos\theta}{\rho g r},$$ con $\theta$ el ángulo de contacto.`],
      idea: [R`Las moléculas de la superficie tienen menos vecinas que las de adentro, y el líquido "prefiere" minimizar su superficie: por eso las gotas son esféricas y algunos insectos caminan sobre el agua.`,
        R`Si el líquido moja el tubo ($\theta < 90^\circ$, como el agua en vidrio) sube; si no lo moja ($\theta > 90^\circ$, como el mercurio) baja.`],
      demo: [R`**Paso 1 (ley de Jurin).** El líquido toca el tubo a lo largo de una circunferencia de largo $2\pi r$. La superficie tira de ese borde con una fuerza $\gamma$ por unidad de largo, inclinada un ángulo $\theta$ (el de contacto) respecto de la vertical.`,
        R`**Paso 2.** Las componentes horizontales apuntan hacia el centro desde todos lados y se cancelan. Queda la componente vertical: $\gamma\cos\theta$ por unidad de largo, en todo el borde: $$F = 2\pi r\,\gamma\cos\theta.$$`,
        R`**Paso 3.** El líquido deja de subir cuando esa fuerza sostiene el peso de la columna levantada. La columna es un cilindro de volumen $\pi r^2h$, así que su peso es $\rho\,\pi r^2h\,g$. Igualando y simplificando $\pi r$: $$2\pi r\gamma\cos\theta = \rho g\,\pi r^2h \quad\Longrightarrow\quad h = \frac{2\gamma\cos\theta}{\rho gr}.$$`,
        R`**Paso 4.** Si el líquido no moja ($\theta > 90^\circ$), $\cos\theta < 0$ y $h$ sale negativo: el nivel baja. $\blacksquare$`,
        R`**Paso 5 (fuerza o energía por área).** Tomamos una superficie de líquido de ancho $\ell$, sostenida por un alambre móvil, y la estiramos una distancia $\Delta x$ contra la fuerza $\gamma\ell$. El trabajo es $\gamma\ell\,\Delta x = \gamma\,\Delta A$, porque el área nueva es $\ell\,\Delta x$. Entonces $\gamma$ también es la energía por unidad de área de superficie.`],
      examples: [{ q: R`¿Cuánto sube el agua en un tubo de 1 mm de radio?`, steps: [R`$h = \frac{2\cdot 0{,}073}{1000\cdot 9{,}8\cdot 0{,}001} \approx 0{,}015$ m $= 1{,}5$ cm.`] }],
      see: ["f1-hidrostatica"]
    },
    "f1-hidrodinamica": {
      title: "Hidrodinámica: continuidad y Bernoulli", aliases: ["ecuación de continuidad", "caudal", "Bernoulli", "ecuación de Bernoulli", "Torricelli", "viscosidad", "fluido ideal"], concepts: ["f1-hidrodinamica"],
      summary: "Continuidad: A v = constante. Bernoulli: p + ½ρv² + ρgh = constante a lo largo de una línea de corriente.",
      def: [R`**Continuidad** (fluido incompresible): el caudal $Q = Av$ es el mismo en todas las secciones, $A_1v_1 = A_2v_2$.`,
        R`**Bernoulli** (fluido ideal: incompresible, sin viscosidad, flujo estacionario): $$p + \tfrac12\rho v^2 + \rho g h = \text{constante}.$$`],
      idea: [R`Bernoulli es la [[f1-energia|conservación de la energía]] por unidad de volumen: $\frac12\rho v^2$ es energía cinética y $\rho g h$ potencial. Donde el fluido va más rápido, la presión es menor: el principio del atomizador, del efecto Venturi y (en parte) de la sustentación de un ala.`,
        R`**Torricelli:** el chorro que sale de un agujero a profundidad $h$ tiene $v = \sqrt{2gh}$, igual que una caída libre.`,
        R`En fluidos reales la **viscosidad** disipa energía (la presión baja a lo largo de un caño) y a velocidades altas el flujo se vuelve **turbulento**.`],
      demo: [R`**Paso 1 (continuidad).** El fluido es incompresible y el flujo estacionario, así que no se acumula en ningún lado: el volumen que entra por la sección 1 en un tiempo $\Delta t$ es el que sale por la 2. En ese tiempo pasa un cilindro de base $A$ y largo $v\,\Delta t$, así que $A_1v_1\Delta t = A_2v_2\Delta t$, o sea $A_1v_1 = A_2v_2$.`,
        R`**Paso 2 (Bernoulli: trabajo de la presión).** Seguimos un pedazo de fluido entre las dos secciones. En $\Delta t$, por detrás lo empuja la presión $p_1$ sobre el área $A_1$ a lo largo de $v_1\Delta t$, y por delante lo frena $p_2$ sobre $A_2$ a lo largo de $v_2\Delta t$. Por continuidad, los dos volúmenes barridos son el mismo $V$: $$W = p_1V - p_2V = (p_1 - p_2)\,V.$$`,
        R`**Paso 3 (cambio de energía).** Como el flujo es estacionario, todo el tramo del medio queda igual. El único cambio es que un volumen $V$, de masa $\rho V$, pasó de la sección 1 a la 2: $$\Delta E = \tfrac12\rho V(v_2^2 - v_1^2) + \rho gV(h_2 - h_1).$$`,
        R`**Paso 4.** Sin viscosidad no hay pérdidas, así que el [[f1-energia|teorema del trabajo y la energía]] da $W = \Delta E$. Dividimos por $V$ y pasamos todo lo de la sección 1 a un lado: $$p_1 + \tfrac12\rho v_1^2 + \rho gh_1 = p_2 + \tfrac12\rho v_2^2 + \rho gh_2. \quad\blacksquare$$`,
        R`**Paso 5 (Torricelli).** Entre la superficie libre de un tanque grande (presión atmosférica, $v \approx 0$) y el agujero a profundidad $h$ (también presión atmosférica), las presiones se cancelan y queda $\rho gh = \frac12\rho v^2$, o sea $v = \sqrt{2gh}$.`],
      examples: [{ q: R`Una manguera de 2 cm de diámetro con agua a 1 m/s; le ponés una boquilla de 0,5 cm. ¿Velocidad?`, steps: [R`$v_2 = 1\cdot\left(\frac{2}{0{,}5}\right)^2 = 16$ m/s.`] }],
      see: ["f1-hidrostatica", "f1-energia"]
    }
  };

  E.extendCourse("f101", {
    concepts: {
      "f1-hidrostatica": { name: "Hidrostática y Pascal" },
      "f1-arquimedes": { name: "Arquímedes y flotación" },
      "f1-tension-sup": { name: "Tensión superficial y capilaridad" },
      "f1-hidrodinamica": { name: "Continuidad y Bernoulli" }
    },
    templates: T,
    units: [{
      id: "f1-fluidos", order: 5, program: "Unidad 5", title: "Mecánica de fluidos", icon: "target",
      diagnostic: ["f1-presion-num", "f1-arquimedes-num", "f1-bernoulli-num"],
      lessons: [
        { id: "f1-hidrostatica", title: "Presión y Pascal", templates: ["f1-presion-num", "f1-pascal-num"], theory: ["f1-hidrostatica"],
          intro: R`$p = p_0 + \rho g h$. La presión se transmite igual por todo el fluido (Pascal).` },
        { id: "f1-arquimedes", title: "Arquímedes y capilaridad", templates: ["f1-flota-vf", "f1-arquimedes-num", "f1-capilar-num"], theory: ["f1-arquimedes", "f1-tension-sup"],
          intro: R`Empuje $= \rho_\ell g V_{sum}$. Flota si $\rho < \rho_\ell$, con fracción sumergida $\frac{\rho}{\rho_\ell}$.` },
        { id: "f1-bernoulli", title: "Continuidad y Bernoulli", templates: ["f1-continuidad-num", "f1-bernoulli-num"], theory: ["f1-hidrodinamica"],
          intro: R`$A_1v_1 = A_2v_2$ y $p + \frac12\rho v^2 + \rho gh = $ constante. Donde va más rápido, la presión es menor.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 6 · CINEMÁTICA DEL MOVIMIENTO ROTACIONAL
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {};
  const dec = x => String(x).replace(".", "{,}");

  T["f1-rotcin-num"] = {
    type: "numeric", concepts: ["f1-rot-cinematica"], difficulty: 2,
    generate(r) {
      const v = r.pick(["vueltas", "omega", "frenado"]);
      if (v === "frenado") {
        const rpm = r.int(2, 30) * 100, tf = r.int(3, 30), w0 = rpm * 2 * Math.PI / 60, al = w0 / tf, rev = w0 * tf / 2 / (2 * Math.PI);
        return { prompt: `Un disco gira a $${rpm}$ rpm y frena uniformemente hasta detenerse en $${tf}$ s. ¿Cuántas vueltas da mientras frena?`, answer: rev,
          solution: [`$\\omega_0 = ${rpm}\\cdot\\frac{2\\pi}{60} \\approx ${num(w0, 4)}$ rad/s; [[f1-rot-cinematica|aceleración angular constante]] $\\alpha = -\\frac{\\omega_0}{t} \\approx ${num(-al, 4)}$ rad/s².`, `$\\Delta\\theta = \\frac{\\omega_0 t}{2} \\approx ${num(w0 * tf / 2, 4)}$ rad, o sea $\\approx ${num(rev, 4)}$ vueltas.`],
          verify: { kind: "ode", f: (_, y) => [y[1], -al], y0: [0, w0], t1: tf, dt: 1e-3, out: (_, y) => y[0] / (2 * Math.PI) } };
      }
      const w0 = r.int(0, 10), al = r.int(1, 6) / 2, t = r.int(2, 10);
      return { prompt: `Una rueda parte con $\\omega_0 = ${w0}$ rad/s y acelera a $\\alpha = ${dec(al)}$ rad/s². ¿${v === "vueltas" ? "Cuántos radianes gira" : "Qué velocidad angular (rad/s) tiene"} a los $${t}$ s?`, answer: v === "vueltas" ? w0 * t + al * t * t / 2 : w0 + al * t,
        solution: [`Mismas ecuaciones que el MRUV con $\\theta$, $\\omega$, $\\alpha$ ([[f1-rot-cinematica]]).`, v === "vueltas" ? `$\\Delta\\theta = \\omega_0 t + \\frac12\\alpha t^2 = ${num(w0 * t + al * t * t / 2, 4)}$ rad.` : `$\\omega = \\omega_0 + \\alpha t = ${num(w0 + al * t, 4)}$ rad/s.`],
        verify: { kind: "ode", f: (_, y) => [y[1], al], y0: [0, w0], t1: t, dt: 1e-3, out: (_, y) => (v === "vueltas" ? y[0] : y[1]) } };
    }
  };
  T["f1-linang-num"] = {
    type: "numeric", concepts: ["f1-rot-cinematica"], difficulty: 1,
    generate(r) {
      const Rr = r.int(5, 50) / 100, w = r.int(2, 30), al = r.int(1, 10), ask = r.pick(["v", "at", "ac"]);
      const ans = ask === "v" ? w * Rr : ask === "at" ? al * Rr : w * w * Rr;
      return {
        prompt: `Un punto está a $${dec(num(Rr))}$ m del eje de una rueda que, en cierto instante, gira con $\\omega = ${w}$ rad/s y $\\alpha = ${al}$ rad/s². Calculá ${ask === "v" ? "su rapidez (m/s)" : ask === "at" ? "su aceleración tangencial (m/s²)" : "su aceleración centrípeta (m/s²)"}.`,
        answer: ans,
        solution: [`[[f1-rot-cinematica|Relación lineal-angular]]: $v = \\omega R$, $a_t = \\alpha R$, $a_c = \\omega^2R$.`, `Respuesta: $${num(ans, 4)}$.`],
        // verificación: posición del punto r(t) = R(cos θ, sin θ) con θ = ωt + αt²/2 y derivadas numéricas
        verify: { kind: "value", tol: 1e-4, fn: () => {
          const P = t => { const th = w * t + al * t * t / 2; return [Rr * Math.cos(th), Rr * Math.sin(th)]; }, h = 1e-4;
          const [a, b, c] = [P(-h), P(0), P(h)], vx = (c[0] - a[0]) / (2 * h), vy = (c[1] - a[1]) / (2 * h);
          const ax = (a[0] - 2 * b[0] + c[0]) / (h * h), ay = (a[1] - 2 * b[1] + c[1]) / (h * h);
          if (ask === "v") return Math.hypot(vx, vy);
          const ux = -Math.sin(0), uy = Math.cos(0); // dirección tangencial en θ = 0
          return ask === "at" ? ax * ux + ay * uy : -(ax * Math.cos(0) + ay * Math.sin(0));
        } }
      };
    }
  };
  T["f1-inercia-num"] = {
    type: "numeric", concepts: ["f1-inercia"], difficulty: 2,
    generate(r) {
      const v = r.pick(["varilla-ext", "varilla-cen", "disco", "steiner", "puntual"]);
      const M = r.int(1, 10), L = r.int(5, 30) / 10;
      if (v === "varilla-ext") return { prompt: `¿Cuál es el momento de inercia (kg·m²) de una varilla delgada uniforme de $${M}$ kg y $${dec(L)}$ m respecto de un eje perpendicular que pasa por **un extremo**?`, answer: M * L * L / 3,
        solution: [`[[f1-inercia|Momento de inercia]]: $I = \\int x^2\\,dm = \\int_0^L x^2\\frac{M}{L}dx = \\frac{ML^2}{3}$.`, `$I = \\frac{${M}\\cdot${dec(L)}^2}{3} \\approx ${num(M * L * L / 3, 4)}$ kg·m².`],
        verify: { kind: "integral", f: x => (M / L) * x * x, a: 0, b: L } };
      if (v === "varilla-cen") return { prompt: `¿Cuál es el momento de inercia (kg·m²) de una varilla delgada uniforme de $${M}$ kg y $${dec(L)}$ m respecto de un eje perpendicular que pasa por su **centro**?`, answer: M * L * L / 12,
        solution: [`$I = \\int_{-L/2}^{L/2} x^2\\frac{M}{L}dx = \\frac{ML^2}{12}$ ([[f1-inercia]]).`, `$I \\approx ${num(M * L * L / 12, 4)}$ kg·m².`],
        verify: { kind: "integral", f: x => (M / L) * x * x, a: -L / 2, b: L / 2 } };
      if (v === "disco") { const Rr = L / 2; return { prompt: `¿Cuál es el momento de inercia (kg·m²) de un disco uniforme de $${M}$ kg y radio $${dec(num(Rr))}$ m respecto de su eje?`, answer: M * Rr * Rr / 2,
        solution: [`Sumando anillos de radio $r$: $I = \\int_0^R r^2\\,\\sigma\\,2\\pi r\\,dr = \\frac{MR^2}{2}$ ([[f1-inercia]]).`, `$I \\approx ${num(M * Rr * Rr / 2, 4)}$ kg·m².`],
        verify: { kind: "integral", f: rr => (M / (Math.PI * Rr * Rr)) * 2 * Math.PI * rr * rr * rr, a: 0, b: Rr } }; }
      if (v === "steiner") { const d = r.int(1, 10) / 10, Rr = L / 2; return { prompt: `Un disco uniforme de $${M}$ kg y radio $${dec(num(Rr))}$ m gira alrededor de un eje paralelo a su eje de simetría, a $${dec(d)}$ m del centro. ¿Momento de inercia (kg·m²)?`, answer: M * Rr * Rr / 2 + M * d * d,
        solution: [`[[f1-inercia|Teorema de Steiner]]: $I = I_{cm} + Md^2$.`, `$I = \\frac{${M}\\cdot${dec(num(Rr))}^2}{2} + ${M}\\cdot${dec(d)}^2 \\approx ${num(M * Rr * Rr / 2 + M * d * d, 4)}$ kg·m².`],
        // verificación: integramos r² dm sobre el disco corrido (en polares respecto de su centro)
        verify: { kind: "value", tol: 1e-4, fn: () => { let s = 0; const nr = 400, nt = 400, sig = M / (Math.PI * Rr * Rr); for (let i = 0; i < nr; i++) for (let j = 0; j < nt; j++) { const rr = (i + 0.5) * Rr / nr, t = (j + 0.5) * 2 * Math.PI / nt, x = rr * Math.cos(t) + d, y = rr * Math.sin(t); s += (x * x + y * y) * sig * rr * (Rr / nr) * (2 * Math.PI / nt); } return s; } } }; }
      const ms = [r.int(1, 5), r.int(1, 5), r.int(1, 5)], rs = [r.int(1, 10) / 10, r.int(1, 10) / 10, r.int(1, 10) / 10];
      const I = ms.reduce((s, m, i) => s + m * rs[i] ** 2, 0);
      return { prompt: `Tres masas puntuales de $${ms.join("$, $")}$ kg están a $${rs.map(x => dec(x)).join("$, $")}$ m de un eje, respectivamente. ¿Momento de inercia del sistema (kg·m²)?`, answer: I,
        solution: [`Para masas puntuales: $I = \\sum m_i r_i^2$ ([[f1-inercia]]).`, `$I = ${ms.map((m, i) => `${m}\\cdot${dec(rs[i])}^2`).join(" + ")} \\approx ${num(I, 4)}$ kg·m².`],
        verify: { kind: "value", fn: () => ms.map((m, i) => m * rs[i] * rs[i]).reduce((a, b) => a + b, 0) } };
    }
  };
  T["f1-erot-num"] = {
    type: "numeric", concepts: ["f1-inercia"], difficulty: 2,
    generate(r) {
      const M = r.int(2, 50), Rr = r.int(10, 60) / 100, rpm = r.int(3, 60) * 100, w = rpm * 2 * Math.PI / 60, K = 0.25 * M * Rr * Rr * w * w;
      return {
        prompt: `Un volante (disco uniforme) de $${M}$ kg y $${dec(num(Rr))}$ m de radio gira a $${rpm}$ rpm. ¿Cuánta energía cinética (kJ) almacena?`,
        answer: K / 1000,
        solution: [`[[f1-inercia|Energía rotacional]]: $K = \\frac12I\\omega^2$ con $I = \\frac12MR^2$.`, `$\\omega \\approx ${num(w, 4)}$ rad/s; $K = \\frac14MR^2\\omega^2 \\approx ${num(K, 5)}$ J.`],
        // verificación: suma de ½ dm v² sobre anillos
        verify: { kind: "integral", f: rr => 0.5 * (M / (Math.PI * Rr * Rr)) * 2 * Math.PI * rr * (w * rr) ** 2 / 1000, a: 0, b: Rr }
      };
    }
  };
  T["f1-rot-vf"] = {
    type: "tf", concepts: ["f1-inercia"], difficulty: 1,
    generate(r) {
      const M = r.int(1, 10), Rr = r.int(1, 5) / 10, q = r.pick(["aro-mas", "igual", "disco-mas"]);
      return {
        prompt: `Un aro y un disco tienen la misma masa ($${M}$ kg) y el mismo radio ($${dec(Rr)}$ m) y giran con la misma $\\omega$ alrededor de su eje. <b>Verdadero o falso:</b> ${q === "aro-mas" ? "el aro tiene más energía cinética" : q === "igual" ? "tienen la misma energía cinética" : "el disco tiene más energía cinética"}.`,
        answer: q === "aro-mas",
        explanation: `$I_{aro} = MR^2$ y $I_{disco} = \\frac12MR^2$: en el aro toda la masa está lejos del eje. Con la misma $\\omega$, el aro tiene el doble de energía ([[f1-inercia]]).`,
        solution: [`$K = \\frac12I\\omega^2$: importa cómo está distribuida la masa, no solo cuánta hay.`],
        verify: { kind: "truth", fn: () => {
          let Idisk = 0; const n = 1000; for (let i = 0; i < n; i++) { const rr = (i + 0.5) * Rr / n; Idisk += (M / (Math.PI * Rr * Rr)) * 2 * Math.PI * rr * (Rr / n) * rr * rr; }
          const Iaro = M * Rr * Rr;
          return q === "aro-mas" ? Iaro > Idisk * 1.01 : q === "igual" ? Math.abs(Iaro - Idisk) < 1e-6 : Idisk > Iaro * 1.01;
        } }
      };
    }
  };

  const cards = {
    "f1-rot-cinematica": {
      title: "Cinemática de la rotación", aliases: ["aceleración angular", "desplazamiento angular", "relación lineal-angular", "aceleración tangencial"], concepts: ["f1-rot-cinematica"],
      summary: "θ, ω = dθ/dt, α = dω/dt. Con α constante valen las ecuaciones del MRUV. v = ωR, a_t = αR, a_c = ω²R.",
      def: [R`Un cuerpo rígido que gira alrededor de un eje fijo queda descripto por el ángulo $\theta$ (en [[radian|radianes]]): $\omega = \frac{d\theta}{dt}$ y $\alpha = \frac{d\omega}{dt}$.`,
        R`**Con $\alpha$ constante:** $\omega = \omega_0 + \alpha t$, $\;\theta = \theta_0 + \omega_0 t + \frac12\alpha t^2$, $\;\omega^2 = \omega_0^2 + 2\alpha\Delta\theta$.`,
        R`**Relación con lo lineal** (punto a distancia $R$ del eje): $s = R\theta$, $v = \omega R$, $a_t = \alpha R$, $a_c = \omega^2 R$.`],
      idea: [R`Es exactamente el [[f1-mruv|MRUV]] traducido: $x \to \theta$, $v \to \omega$, $a \to \alpha$. Todos los puntos del rígido tienen la misma $\omega$, pero los más alejados del eje van más rápido.`,
        R`$\vec\omega$ se representa como un vector a lo largo del eje (regla de la mano derecha), y $\vec v = \vec\omega\times\vec r$ usa el **producto vectorial**: $|\vec A\times\vec B| = AB\sin\theta$, perpendicular a los dos.`],
      demo: [R`**Paso 1 (arco).** Un punto a distancia $R$ del eje describe una circunferencia. Si el ángulo $\theta$ está en [[radian|radianes]], el arco recorrido es $s = R\theta$: esa es justamente la definición de radián.`,
        R`**Paso 2 (velocidad y aceleración tangencial).** Derivamos respecto del tiempo; $R$ es constante porque el cuerpo es rígido: $v = \frac{ds}{dt} = R\,\omega$. Derivando otra vez, $a_t = R\,\alpha$.`,
        R`**Paso 3 (centrípeta).** Además, el punto hace un movimiento circular, así que tiene la aceleración centrípeta del [[f1-circular|movimiento circular]]: $\frac{v^2}{R} = \frac{(\omega R)^2}{R} = \omega^2R$.`,
        R`**Paso 4 (con $\alpha$ constante).** Las ecuaciones $\frac{d\omega}{dt} = \alpha$ y $\frac{d\theta}{dt} = \omega$ son las mismas que en el [[f1-mruv|MRUV]], cambiando $v$ por $\omega$ y $x$ por $\theta$. Integrando igual: $\omega = \omega_0 + \alpha t$ y $\theta = \theta_0 + \omega_0t + \frac12\alpha t^2$.`,
        R`**Paso 5.** Despejando $t = \frac{\omega - \omega_0}{\alpha}$ de la primera y reemplazando en la segunda, la misma cuenta que en el MRUV da $\omega^2 = \omega_0^2 + 2\alpha\,\Delta\theta$.`],
      examples: [{ q: R`Un CD gira a 500 rpm. ¿Rapidez de un punto a 6 cm del centro?`, steps: [R`$\omega = 500\cdot\frac{2\pi}{60} \approx 52{,}4$ rad/s.`, R`$v = \omega R \approx 3{,}1$ m/s.`] }],
      see: ["f1-inercia", "f1-circular", "f1-torque"]
    },
    "f1-inercia": {
      title: "Momento de inercia y energía rotacional", aliases: ["momento de inercia", "teorema de Steiner", "teorema de los ejes paralelos", "energía rotacional", "energía cinética de rotación"], concepts: ["f1-inercia"],
      summary: "I = Σ m r² = ∫ r² dm mide la inercia a girar. K = ½ I ω². Steiner: I = I_cm + M d².",
      def: [R`**Momento de inercia** respecto de un eje: $I = \sum m_ir_i^2$, o $I = \int r^2\,dm$ para un cuerpo continuo. **Energía cinética de rotación:** $K = \frac12I\omega^2$.`,
        R`**Teorema de Steiner (ejes paralelos):** $I = I_{cm} + Md^2$, con $d$ la distancia entre el eje y uno paralelo que pasa por el centro de masa.`,
        R`**Valores típicos:** varilla por el centro $\frac{ML^2}{12}$, por un extremo $\frac{ML^2}{3}$; aro $MR^2$; disco o cilindro $\frac12MR^2$; esfera maciza $\frac25MR^2$.`],
      idea: [R`$I$ juega el papel de la masa en la rotación, pero depende de **cómo** está distribuida la masa: la masa lejos del eje pesa mucho más ($r^2$). Por eso un patinador gira más rápido con los brazos cerrados (ver [[f1-momento-angular]]).`],
      demo: [R`**Paso 1 (energía de rotación).** Pensamos el rígido como muchas partículas $m_i$ a distancias $r_i$ del eje. Todas giran con la misma $\omega$, así que cada una va a $v_i = \omega r_i$. Sumamos sus energías cinéticas y sacamos $\omega^2$ de factor común: $$K = \sum\tfrac12m_i\omega^2r_i^2 = \tfrac12\Big(\sum m_ir_i^2\Big)\omega^2 = \tfrac12I\omega^2.$$`,
        R`**Paso 2 (varilla por un extremo).** Para un cuerpo continuo la suma pasa a ser una integral. Una varilla homogénea de largo $L$ tiene masa $\lambda = \frac ML$ por unidad de largo, así que el pedacito entre $x$ y $x + dx$ tiene $dm = \lambda\,dx$: $$I = \int_0^L x^2\lambda\,dx = \frac{\lambda L^3}{3} = \frac{ML^2}{3}.$$`,
        R`**Paso 3 (Steiner).** Ponemos el origen en el centro de masa y llamamos $\vec d$ al vector (perpendicular al eje) que va del eje que pasa por el centro de masa al eje paralelo. La distancia de cada partícula al nuevo eje es $|\vec\rho_i - \vec d|$, con $\vec\rho_i$ su posición medida desde el centro de masa, perpendicular al eje. Desarrollando el cuadrado: $$I = \sum m_i|\vec\rho_i - \vec d|^2 = \sum m_i\rho_i^2 - 2\,\vec d\cdot\sum m_i\vec\rho_i + Md^2.$$`,
        R`**Paso 4.** El primer término es $I_{cm}$. El del medio es cero, porque $\sum m_i\vec\rho_i = M\vec r_{cm}$ y, medido desde el centro de masa, $\vec r_{cm} = \vec 0$. Queda $I = I_{cm} + Md^2$. $\blacksquare$`,
        R`**Paso 5 (chequeo).** Para la varilla, el eje por un extremo está a $d = \frac L2$ del centro: $\frac{ML^2}{12} + M\frac{L^2}{4} = \frac{ML^2}{3}$, igual que en el paso 2.`],
      examples: [{ q: R`Dos masas de 1 kg en los extremos de una varilla sin masa de 2 m. ¿$I$ respecto del centro?`, steps: [R`$I = 1\cdot 1^2 + 1\cdot 1^2 = 2$ kg·m².`] }],
      see: ["f1-rot-cinematica", "f1-torque", "integral-definida"]
    }
  };

  E.extendCourse("f101", {
    concepts: { "f1-rot-cinematica": { name: "Cinemática rotacional" }, "f1-inercia": { name: "Momento de inercia" } },
    templates: T,
    units: [{
      id: "f1-rot-cin", order: 6, program: "Unidad 6", title: "Cinemática del movimiento rotacional", icon: "rotate-ccw",
      diagnostic: ["f1-rotcin-num", "f1-inercia-num", "f1-erot-num"],
      lessons: [
        { id: "f1-rotcin", title: "Velocidad y aceleración angulares", templates: ["f1-rotcin-num", "f1-linang-num"], theory: ["f1-rot-cinematica"],
          intro: R`$\omega = \frac{d\theta}{dt}$, $\alpha = \frac{d\omega}{dt}$. Con $\alpha$ constante, como el MRUV. $v = \omega R$, $a_c = \omega^2 R$.` },
        { id: "f1-inercia", title: "Momento de inercia y energía", templates: ["f1-rot-vf", "f1-inercia-num", "f1-erot-num"], theory: ["f1-inercia"],
          intro: R`$I = \int r^2dm$; $K = \frac12I\omega^2$; Steiner: $I = I_{cm} + Md^2$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 7 · DINÁMICA DEL MOVIMIENTO ROTACIONAL
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {}, g = 9.8;
  const dec = x => String(x).replace(".", "{,}");
  const rad = d => d * Math.PI / 180;

  T["f1-torque-num"] = {
    type: "numeric", concepts: ["f1-torque"], difficulty: 1,
    generate(r) {
      const F = r.int(5, 100), d = r.int(10, 80) / 100, th = r.pick([30, 45, 60, 90, 120, 150]);
      const tau = d * F * Math.sin(rad(th));
      return {
        prompt: `Se aplica una fuerza de $${F}$ N en el extremo de una llave de $${dec(num(d))}$ m, formando $${th}^\\circ$ con la llave. ¿Cuál es el módulo del torque (N·m) respecto del bulón?`,
        answer: tau,
        solution: [`[[f1-torque|Torque]]: $\\tau = rF\\sin\\theta$ (solo cuenta la componente perpendicular a la llave).`, `$\\tau = ${dec(num(d))}\\cdot${F}\\sin ${th}^\\circ \\approx ${num(tau, 4)}$ N·m.`],
        // verificación: producto vectorial en componentes, r × F
        verify: { kind: "value", fn: () => { const rv = [d, 0], Fv = [F * Math.cos(rad(th)), F * Math.sin(rad(th))]; return Math.abs(rv[0] * Fv[1] - rv[1] * Fv[0]); } }
      };
    }
  };
  T["f1-polea-num"] = {
    type: "numeric", concepts: ["f1-torque"], difficulty: 3,
    generate(r) {
      const m = r.int(1, 10), M = r.int(1, 10) * 2, Rr = r.int(5, 30) / 100, ask = r.pick(["a", "T"]);
      const a = m * g / (m + M / 2), Tn = m * (g - a);
      return {
        prompt: `Una masa de $${m}$ kg cuelga de una soga enrollada en una polea (disco uniforme) de $${M}$ kg y radio $${dec(num(Rr))}$ m que gira sin rozamiento. ¿${ask === "a" ? "Con qué aceleración baja la masa" : "Cuál es la tensión de la soga"}? ($g = 9{,}8$ m/s²)`,
        answer: ask === "a" ? a : Tn,
        solution: [
          `Masa: $mg - T = ma$. Polea: $TR = I\\alpha$ con $I = \\frac12MR^2$ y $\\alpha = \\frac aR$ ([[f1-torque|segunda ley para la rotación]]).`,
          `De la polea: $T = \\frac12Ma$. Reemplazando: $a = \\frac{mg}{m + M/2} \\approx ${num(a, 4)}$ m/s².`,
          `$T = m(g - a) \\approx ${num(Tn, 4)}$ N.`
        ],
        // verificación: soga como resorte rígido entre la masa y el borde de la polea
        verify: ask === "a"
          ? { kind: "ode", f: (_, y) => { const I = M * Rr * Rr / 2, k = 2e5, c = 2 * Math.sqrt(k * m), e = y[0] - Rr * y[2], ed = y[1] - Rr * y[3], Tt = Math.max(0, k * e + c * ed); return [y[1], g - Tt / m, y[3], Tt * Rr / I]; },
              y0: [Tn / 2e5, 0, 0, 0], t1: 1, dt: 2e-5, out: (_, y) => 2 * y[0] }
          : { kind: "zero", fn: Tt => [(m * g - Tt - m * a) / (m * g), (Tt * Rr - (M * Rr * Rr / 2) * (a / Rr)) / (m * g * Rr)] }
      };
    }
  };
  const SHAPES = [{ n: "una esfera maciza", b: 0.4, t: "\\frac25" }, { n: "un cilindro macizo", b: 0.5, t: "\\frac12" }, { n: "un aro", b: 1, t: "1" }, { n: "una esfera hueca", b: 2 / 3, t: "\\frac23" }];
  T["f1-rodadura-num"] = {
    type: "numeric", concepts: ["f1-rodadura"], difficulty: 3,
    generate(r) {
      const S = r.pick(SHAPES), h = r.int(1, 20) / 2, v = Math.sqrt(2 * g * h / (1 + S.b));
      return {
        prompt: `${S.n[0].toUpperCase() + S.n.slice(1)} parte del reposo y **rueda sin deslizar** bajando una altura de $${dec(h)}$ m. ¿Qué velocidad tiene su centro abajo? ($g = 9{,}8$ m/s², $I = ${S.t}MR^2$)`,
        answer: v,
        solution: [
          `[[f1-rodadura|Rodadura]]: $v = \\omega R$, y el rozamiento estático no hace trabajo, así que se conserva la energía: $Mgh = \\frac12Mv^2 + \\frac12I\\omega^2$.`,
          `$Mgh = \\frac12Mv^2\\left(1 + ${S.t}\\right) \\Rightarrow v = \\sqrt{\\dfrac{2gh}{1 + ${S.t}}} \\approx ${num(v, 4)}$ m/s.`,
          `Es menos que $\\sqrt{2gh}$: parte de la energía se va en hacerlo girar.`
        ],
        // verificación: simulamos la bajada por un plano de 30° con la ecuación de traslación + rotación acopladas por v = ωR
        verify: { kind: "ode", f: (_, y) => { const th = rad(30), s = y[1], fr = S.b * g * Math.sin(th) / (1 + S.b); return [s, g * Math.sin(th) - fr]; },
          y0: [0, 0], t1: 0, until: (_, y) => y[0] * Math.sin(rad(30)) >= h, g: (_, y) => y[0] * Math.sin(rad(30)) - h, dt: 1e-4, out: (_, y) => y[1] }
      };
    }
  };
  T["f1-patinadora-num"] = {
    type: "numeric", concepts: ["f1-momento-angular"], difficulty: 2,
    generate(r) {
      if (r.bool()) {
        const I1 = r.int(30, 60) / 10, I2 = r.int(8, 25) / 10, w1 = r.int(1, 5);
        return { prompt: `Una patinadora gira a $${w1}$ rev/s con los brazos abiertos ($I = ${dec(I1)}$ kg·m²). Al cerrarlos, su momento de inercia baja a $${dec(I2)}$ kg·m². ¿A cuántas rev/s gira ahora?`, answer: I1 * w1 / I2,
          solution: [`No hay torque externo: se [[f1-momento-angular|conserva el momento angular]], $I_1\\omega_1 = I_2\\omega_2$.`, `$\\omega_2 = \\frac{${dec(I1)}\\cdot${w1}}{${dec(I2)}} \\approx ${num(I1 * w1 / I2, 4)}$ rev/s.`],
          verify: { kind: "zero", fn: w2 => [(I1 * w1 - I2 * w2) / (I1 * w1)] } };
      }
      const M1 = r.int(1, 10), M2 = r.int(1, 10), Rr = r.int(10, 40) / 100, rpm = r.int(1, 10) * 30;
      const w2 = M1 * rpm / (M1 + M2);
      return { prompt: `Un disco de $${M1}$ kg gira a $${rpm}$ rpm. Sobre él se deja caer, centrado, otro disco de $${M2}$ kg del mismo radio, inicialmente quieto, y terminan girando juntos. ¿A cuántas rpm?`, answer: w2,
        solution: [`Choque rotacional: se [[f1-momento-angular|conserva el momento angular]] ($I \\propto M$ porque tienen el mismo radio).`, `$\\omega_f = \\frac{M_1}{M_1 + M_2}\\omega_0 = \\frac{${M1}}{${M1 + M2}}\\cdot${rpm} \\approx ${num(w2, 4)}$ rpm.`],
        verify: { kind: "zero", fn: wf => [(0.5 * M1 * Rr * Rr * rpm - 0.5 * (M1 + M2) * Rr * Rr * wf) / (0.5 * M1 * Rr * Rr * rpm)] } };
    }
  };
  T["f1-momang-vf"] = {
    type: "tf", concepts: ["f1-momento-angular"], difficulty: 2,
    generate(r) {
      const I1 = r.int(30, 60) / 10, I2 = r.int(8, 25) / 10, w1 = r.int(1, 5), q = r.pick(["L", "K", "Kmas"]);
      return {
        prompt: `Una patinadora pasa de $I = ${dec(I1)}$ kg·m² a $I = ${dec(I2)}$ kg·m² cerrando los brazos, sin torques externos. <b>Verdadero o falso:</b> ${q === "L" ? "su momento angular se conserva" : q === "K" ? "su energía cinética de rotación se conserva" : "su energía cinética de rotación aumenta"}.`,
        answer: q !== "K",
        explanation: `$L = I\\omega$ se conserva (no hay torque externo). Pero $K = \\frac{L^2}{2I}$ **aumenta** al bajar $I$: la energía extra sale del trabajo de sus músculos al tirar de los brazos hacia adentro ([[f1-momento-angular]]).`,
        solution: [`Que se conserve $L$ no implica que se conserve la energía.`],
        verify: { kind: "truth", fn: () => { const w2 = I1 * w1 / I2, K1 = 0.5 * I1 * w1 * w1, K2 = 0.5 * I2 * w2 * w2; return q === "L" ? Math.abs(I1 * w1 - I2 * w2) < 1e-9 : q === "K" ? Math.abs(K1 - K2) < 1e-9 : K2 > K1; } }
      };
    }
  };

  const cards = {
    "f1-torque": {
      title: "Torque y segunda ley para la rotación", aliases: ["torque", "momento de torsión", "momento de una fuerza", "segunda ley para la rotación"], concepts: ["f1-torque"],
      summary: "τ = r × F (módulo r F sen θ). Para un rígido con eje fijo: Σ τ = I α.",
      def: [R`**Torque** de una fuerza respecto de un punto: $\vec\tau = \vec r\times\vec F$, con módulo $\tau = rF\sin\theta = F\,d$, donde $d$ es el **brazo de palanca** (la distancia perpendicular del eje a la línea de acción de la fuerza).`,
        R`**Segunda ley para la rotación** (eje fijo): $$\sum\tau = I\alpha.$$`],
      idea: [R`El torque es a la rotación lo que la fuerza a la traslación, y el [[f1-inercia|momento de inercia]] hace de masa. Por eso las manijas de las puertas van lejos de las bisagras: con el mismo esfuerzo se logra más torque.`,
        R`**Trabajo y potencia en rotación:** $W = \int\tau\,d\theta$ y $P = \tau\omega$.`],
      demo: [R`**Paso 1.** Pensamos el rígido como muchas partículas $m_i$ a distancias $r_i$ del eje fijo. Todas giran con la misma $\alpha$, así que cada una tiene aceleración tangencial $a_i = r_i\alpha$ ([[f1-rot-cinematica|cinemática de la rotación]]).`,
        R`**Paso 2.** Escribimos la componente tangencial de la segunda ley para la partícula $i$: $F_{t,i} = m_ia_i = m_ir_i\alpha$, donde $F_{t,i}$ es la componente tangencial de la fuerza total sobre ella.`,
        R`**Paso 3.** Multiplicamos por $r_i$ para pasar a torques: $\tau_i = r_iF_{t,i} = m_ir_i^2\,\alpha$. Las componentes radiales no hacen torque porque apuntan hacia el eje (su brazo de palanca es cero).`,
        R`**Paso 4.** Sumamos sobre todas las partículas. Las fuerzas internas vienen de a pares opuestos sobre la recta que une cada par, así que sus torques se cancelan. Queda $$\sum\tau_{\text{ext}} = \Big(\sum m_ir_i^2\Big)\alpha = I\alpha. \quad\blacksquare$$`,
        R`**Paso 5 (brazo de palanca).** El módulo del producto vectorial es $|\vec r\times\vec F| = rF\sin\theta$. Agrupado como $F\cdot(r\sin\theta)$, el factor $r\sin\theta$ es el cateto opuesto del triángulo de hipotenusa $r$: la distancia perpendicular del eje a la recta de la fuerza.`,
        R`**Paso 6 (potencia).** Si el cuerpo gira un ángulo $d\theta$, el punto donde se aplica la fuerza recorre un arco $r\,d\theta$. Solo trabaja la componente tangencial, así que $dW = F_t\,r\,d\theta = \tau\,d\theta$. Dividiendo por $dt$: $P = \tau\omega$.`],
      examples: [{ q: R`Un disco de $I = 0{,}5$ kg·m² recibe un torque de 2 N·m. ¿$\alpha$?`, steps: [R`$\alpha = \frac{\tau}{I} = 4$ rad/s².`] }],
      see: ["f1-inercia", "f1-rodadura", "f1-equilibrio"]
    },
    "f1-rodadura": {
      title: "Rodadura sin deslizamiento", aliases: ["rodadura", "rueda sin deslizar", "rodar sin deslizar", "condición de rodadura"], concepts: ["f1-rodadura"],
      summary: "Rodar sin deslizar: v_cm = ωR. La energía cinética es ½Mv² + ½Iω², y el rozamiento estático no hace trabajo.",
      def: [R`**Condición de rodadura:** $v_{cm} = \omega R$ (el punto de contacto está instantáneamente quieto). La energía cinética total es $$K = \tfrac12Mv_{cm}^2 + \tfrac12I_{cm}\omega^2.$$`],
      idea: [R`Si $I = \beta MR^2$, al bajar una altura $h$: $v = \sqrt{\frac{2gh}{1 + \beta}}$. **Carrera en un plano inclinado:** gana la esfera maciza ($\beta = \frac25$), después el cilindro ($\frac12$), la esfera hueca ($\frac23$) y último el aro ($1$). No importan ni la masa ni el radio, solo la forma.`,
        R`El rozamiento estático es el que hace girar al cuerpo, pero no disipa energía porque el punto de contacto no desliza.`],
      demo: [R`**Paso 1 (condición de rodadura).** Si la rueda no desliza, cuando gira un ángulo $\theta$ el centro avanza exactamente el arco que se apoyó en el piso, que en [[radian|radianes]] es $R\theta$: $x_{cm} = R\theta$. Derivando respecto del tiempo, $v_{cm} = \omega R$.`,
        R`**Paso 2.** El punto de contacto tiene la velocidad del centro, $v_{cm}$ hacia adelante, más la de la rotación, $\omega R$ hacia atrás. Por el paso 1 se cancelan: el punto de contacto está instantáneamente quieto.`,
        R`**Paso 3 (energía cinética).** La velocidad de cada partícula es $\vec v_{cm} + \vec u_i$, con $\vec u_i$ la de su rotación alrededor del centro de masa. Desarrollando el cuadrado: $$K = \sum\tfrac12m_i|\vec v_{cm} + \vec u_i|^2 = \tfrac12Mv_{cm}^2 + \vec v_{cm}\cdot\sum m_i\vec u_i + \sum\tfrac12m_iu_i^2.$$ El término del medio es cero, porque $\sum m_i\vec u_i$ es $M$ por la velocidad del centro de masa medida desde él mismo. El último es la energía de rotación, $\frac12I_{cm}\omega^2$.`,
        R`**Paso 4 (bajada por el plano).** El rozamiento estático actúa en el punto de contacto, que está quieto (paso 2), así que no hace trabajo. La normal es perpendicular al movimiento. Solo trabaja el peso, y la energía mecánica se conserva: $Mgh = \frac12Mv^2 + \frac12I\omega^2$.`,
        R`**Paso 5.** Reemplazamos $I = \beta MR^2$ y $\omega = \frac vR$: $$Mgh = \tfrac12Mv^2 + \tfrac12\beta MR^2\frac{v^2}{R^2} = \tfrac12(1 + \beta)\,Mv^2.$$ Se cancelan $M$ y $R$, y despejando, $v = \sqrt{\frac{2gh}{1 + \beta}}$. $\blacksquare$`],
      examples: [{ q: R`Un cilindro baja 1 m rodando. ¿Velocidad?`, steps: [R`$v = \sqrt{\frac{2\cdot 9{,}8\cdot 1}{1{,}5}} \approx 3{,}6$ m/s (contra $4{,}4$ m/s si deslizara sin rozamiento).`] }],
      see: ["f1-torque", "f1-inercia", "f1-energia"]
    },
    "f1-momento-angular": {
      title: "Momento angular y su conservación", aliases: ["momento angular", "cantidad de movimiento angular", "conservación del momento angular", "conserva el momento angular", "giróscopo", "precesión"], concepts: ["f1-momento-angular"],
      summary: "L = I ω (eje fijo). Σ τ_ext = dL/dt: sin torque externo, L se conserva.",
      def: [R`**Momento angular** de una partícula: $\vec L = \vec r\times\vec p$. Para un rígido que gira alrededor de un eje de simetría: $\vec L = I\vec\omega$.`,
        R`$$\sum\vec\tau_{\text{ext}} = \frac{d\vec L}{dt}.$$ Si el torque externo es nulo, $\vec L$ se conserva.`],
      idea: [R`Patinadoras, clavadistas y gatos que caen de pie bajan su $I$ para girar más rápido. Una estrella que colapsa achica su radio y termina girando muchísimo más rápido (los púlsares).`,
        R`**Giróscopo y precesión:** si el torque es perpendicular a $\vec L$, cambia su dirección y no su módulo: el eje de un trompo gira lentamente alrededor de la vertical, en vez de caerse.`],
      demo: [R`**Paso 1 (una partícula).** Derivamos $\vec L = \vec r\times\vec p$ con la regla del producto, que vale también para el producto vectorial (respetando el orden): $$\frac{d\vec L}{dt} = \frac{d\vec r}{dt}\times\vec p + \vec r\times\frac{d\vec p}{dt}.$$`,
        R`**Paso 2.** El primer término es $\vec v\times m\vec v = \vec 0$, porque el producto vectorial de dos vectores paralelos es nulo. En el segundo, $\frac{d\vec p}{dt} = \vec F$ por la segunda ley. Queda $\frac{d\vec L}{dt} = \vec r\times\vec F = \vec\tau$.`,
        R`**Paso 3 (sistema).** Sumamos sobre todas las partículas. Las fuerzas internas vienen de a pares opuestos; si cada par está sobre la recta que une las dos partículas, sus torques son opuestos y se cancelan. Queda $\sum\vec\tau_{\text{ext}} = \frac{d\vec L}{dt}$, y si el torque externo es nulo, $\vec L$ es constante. $\blacksquare$`,
        R`**Paso 4 (rígido).** Para un rígido que gira alrededor de un eje, cada partícula va a $v_i = \omega r_i$ en un círculo de radio $r_i$, así que su momento angular respecto del eje es $m_ir_iv_i = m_ir_i^2\omega$. Sumando, $L = \big(\sum m_ir_i^2\big)\omega = I\omega$.`,
        R`**Paso 5 (la patinadora).** No hay torque externo vertical, así que $L = I\omega$ queda constante: si $I$ baja a la mitad, $\omega$ se duplica. Su energía, $K = \frac12I\omega^2 = \frac{L^2}{2I}$, aumenta al doble: la pone ella con el trabajo de los brazos al cerrarlos.`],
      examples: [{ q: R`Un disco a 60 rpm recibe otro disco igual, quieto, encima. ¿Velocidad final?`, steps: [R`$I\omega_0 = 2I\omega_f \Rightarrow \omega_f = 30$ rpm.`] }],
      see: ["f1-torque", "f1-momento", "f1-inercia"]
    }
  };

  E.extendCourse("f101", {
    concepts: { "f1-torque": { name: "Torque y τ = Iα" }, "f1-rodadura": { name: "Rodadura" }, "f1-momento-angular": { name: "Momento angular" } },
    templates: T,
    units: [{
      id: "f1-rot-din", order: 7, program: "Unidad 7", title: "Dinámica del movimiento rotacional", icon: "rotate-ccw",
      diagnostic: ["f1-torque-num", "f1-polea-num", "f1-patinadora-num"],
      lessons: [
        { id: "f1-torque", title: "Torque y τ = Iα", templates: ["f1-torque-num", "f1-polea-num"], theory: ["f1-torque", "f1-inercia"],
          intro: R`$\tau = rF\sin\theta$ y $\sum\tau = I\alpha$. En una polea con masa, la soga de cada lado tiene distinta tensión.` },
        { id: "f1-rodadura", title: "Rodadura y momento angular", templates: ["f1-momang-vf", "f1-rodadura-num", "f1-patinadora-num"], theory: ["f1-rodadura", "f1-momento-angular"],
          intro: R`Rodadura: $v = \omega R$ y $K = \frac12Mv^2 + \frac12I\omega^2$. Sin torque externo, $L = I\omega$ se conserva.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 8 · EQUILIBRIO DE CUERPOS RÍGIDOS
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {}, g = 9.8;
  const dec = x => String(x).replace(".", "{,}");
  const rad = d => d * Math.PI / 180;

  T["f1-palanca-num"] = {
    type: "numeric", concepts: ["f1-equilibrio"], difficulty: 1,
    generate(r) {
      const m1 = r.int(15, 50), m2 = r.int(15, 50), d1 = r.int(5, 20) / 10, d2 = m1 * d1 / m2;
      if (m1 === m2) return null;
      return {
        prompt: `En un subibaja (sin masa propia, apoyado en el centro) se sienta un chico de $${m1}$ kg a $${dec(d1)}$ m del apoyo. ¿A qué distancia (m) del otro lado tiene que sentarse uno de $${m2}$ kg para equilibrarlo?`,
        answer: d2,
        solution: [`[[f1-equilibrio|Equilibrio]] de torques respecto del apoyo: $m_1g\\,d_1 = m_2g\\,d_2$.`, `$d_2 = \\frac{${m1}\\cdot${dec(d1)}}{${m2}} \\approx ${num(d2, 4)}$ m.`],
        verify: { kind: "zero", fn: d => [(m1 * g * d1 - m2 * g * d) / (m1 * g * d1)] }
      };
    }
  };
  T["f1-viga-num"] = {
    type: "numeric", concepts: ["f1-equilibrio"], difficulty: 2,
    generate(r) {
      const L = r.int(2, 10), W = r.int(1, 10) * 100, P = r.int(1, 20) * 100, x = r.int(1, L * 2 - 1) / 2, ask = r.pick(["R1", "R2"]);
      const R1 = W / 2 + P * (L - x) / L, R2 = W + P - R1;
      return {
        prompt: `Una viga uniforme de $${L}$ m y $${W}$ N de peso está apoyada en sus dos extremos. Una carga de $${P}$ N está a $${dec(x)}$ m del extremo izquierdo. ¿Cuánto vale la reacción del apoyo ${ask === "R1" ? "izquierdo" : "derecho"} (N)?`,
        answer: ask === "R1" ? R1 : R2,
        solution: [
          `[[f1-equilibrio|Condiciones de equilibrio]]: $R_1 + R_2 = W + P$ y suma de torques nula.`,
          `Torques respecto del extremo izquierdo: $R_2L = W\\frac L2 + Px \\Rightarrow R_2 = ${num(R2, 4)}$ N.`,
          `$R_1 = W + P - R_2 = ${num(R1, 4)}$ N.`
        ],
        verify: { kind: "zero", fn: Rv => { const r1 = ask === "R1" ? Rv : W + P - Rv, r2 = W + P - r1; return [(r1 + r2 - W - P) / (W + P), (r2 * L - W * L / 2 - P * x) / ((W + P) * L), (-r1 * L + W * L / 2 + P * (L - x)) / ((W + P) * L)]; } }
      };
    }
  };
  T["f1-escalera-num"] = {
    type: "numeric", concepts: ["f1-equilibrio"], difficulty: 3,
    generate(r) {
      const th = r.pick([45, 50, 53, 60, 65, 70, 75]), mu = 1 / (2 * Math.tan(rad(th)));
      return {
        prompt: `Una escalera uniforme está apoyada en una pared **sin rozamiento**, formando $${th}^\\circ$ con el piso. ¿Cuál es el mínimo coeficiente de rozamiento estático con el piso para que no resbale?`,
        answer: mu,
        solution: [
          `Fuerzas: peso $W$ en el medio, normal del piso $N$, rozamiento $f$ y normal de la pared $N_p$ ([[f1-equilibrio]]).`,
          `Equilibrio: $N = W$, $f = N_p$. Torques respecto del pie: $N_p L\\sin\\theta = W\\frac L2\\cos\\theta \\Rightarrow f = \\frac{W}{2\\tan\\theta}$.`,
          `$\\mu_{\\min} = \\frac{f}{N} = \\frac{1}{2\\tan ${th}^\\circ} \\approx ${num(mu, 4)}$.`
        ],
        // verificación: con μ = respuesta, las tres ecuaciones de equilibrio se cumplen con el rozamiento al máximo
        verify: { kind: "zero", fn: m => { const W = 1, L = 1, N = W, f = m * N, Np = f; return [Np * L * Math.sin(rad(th)) - W * (L / 2) * Math.cos(rad(th))]; } }
      };
    }
  };
  T["f1-estab-vf"] = {
    type: "tf", concepts: ["f1-equilibrio"], difficulty: 2,
    generate(r) {
      const w = r.int(2, 8) * 10, h = r.int(3, 12) * 10, al = r.int(5, 60);
      const crit = Math.atan(w / h) * 180 / Math.PI;
      if (Math.abs(al - crit) < 1) return null;
      const vuelca = al > crit;
      return {
        prompt: `Una caja uniforme de $${w}$ cm de ancho y $${h}$ cm de alto se inclina $${al}^\\circ$ apoyada sobre una arista y se suelta. <b>Verdadero o falso:</b> vuelve a su posición (no vuelca).`,
        answer: !vuelca,
        explanation: `Vuelca si la vertical por el centro de gravedad pasa del otro lado de la arista de apoyo, o sea si el ángulo supera $\\arctan\\frac{${w}}{${h}} \\approx ${num(crit, 3)}^\\circ$ ([[f1-equilibrio|estabilidad]]).`,
        solution: [`Mientras el peso haga torque hacia la base, la caja vuelve: es un equilibrio estable para inclinaciones chicas.`],
        // verificación: posición horizontal del centro de gravedad respecto de la arista después de rotar la caja
        verify: { kind: "truth", fn: () => { const t = al * Math.PI / 180, cx = (w / 2) * Math.cos(t) - (h / 2) * Math.sin(t); return cx > 0; } }
      };
    }
  };
  T["f1-cg-num"] = {
    type: "numeric", concepts: ["f1-equilibrio"], difficulty: 2,
    generate(r) {
      // placa en L: rectángulo A (a x b) en el origen + rectángulo B (c x d) apoyado a la derecha
      const a = r.int(1, 4), b = r.int(3, 8), c = r.int(2, 6), d = r.int(1, 3);
      const A1 = a * b, A2 = c * d, xc = (A1 * a / 2 + A2 * (a + c / 2)) / (A1 + A2);
      return {
        prompt: `Una placa uniforme en forma de L está formada por un rectángulo de $${a}\\times${b}$ (ancho $\\times$ alto) con la esquina inferior izquierda en el origen y, pegado a su derecha sobre el piso, otro de $${c}\\times${d}$. ¿Cuál es la coordenada $x$ de su centro de gravedad?`,
        answer: xc, answerTex: H.frac(A1 * a + A2 * (2 * a + c), 2 * (A1 + A2)),
        solution: [`Cada rectángulo se reemplaza por su área en su centro ([[f1-equilibrio|centro de gravedad]]): $(${num(a / 2)}, \\cdot)$ con área $${A1}$ y $(${num(a + c / 2)}, \\cdot)$ con área $${A2}$.`, `$x_{cg} = \\frac{${A1}\\cdot${num(a / 2)} + ${A2}\\cdot${num(a + c / 2)}}{${A1 + A2}} \\approx ${num(xc, 4)}$.`],
        // verificación: integración en una grilla sobre la forma
        // (grilla de 40 celdas por unidad: los bordes de la placa caen justo entre celdas)
        verify: { kind: "value", tol: 1e-9, fn: () => { let sx = 0, s = 0; const X = a + c, Y = Math.max(b, d), nx = 40 * X, ny = 40 * Y; for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { const x = (i + 0.5) / 40, y = (j + 0.5) / 40; if ((x < a && y < b) || (x >= a && y < d)) { sx += x; s++; } } return sx / s; } }
      };
    }
  };

  const cards = {
    "f1-equilibrio": {
      title: "Equilibrio de cuerpos rígidos y centro de gravedad", aliases: ["equilibrio estático", "condiciones de equilibrio", "centro de gravedad", "brazo de palanca", "palanca", "estabilidad"], concepts: ["f1-equilibrio"],
      summary: "Un rígido está en equilibrio si Σ F = 0 y Σ τ = 0 respecto de cualquier punto.",
      def: [R`**Condiciones de equilibrio** de un cuerpo rígido: $$\sum\vec F = 0 \qquad\text{y}\qquad \sum\vec\tau = 0$$ (la segunda, respecto de **cualquier** punto si se cumple la primera).`,
        R`**Centro de gravedad:** el punto donde se puede considerar aplicado todo el peso. En un campo gravitatorio uniforme coincide con el [[f1-cm|centro de masa]].`],
      idea: [R`**Truco:** tomá torques respecto del punto donde hay más fuerzas desconocidas: esas fuerzas no hacen torque y se eliminan de la ecuación.`,
        R`**Estabilidad:** un equilibrio es estable si, al apartar un poco el cuerpo, el peso genera un torque que lo devuelve. Un objeto apoyado es estable mientras la vertical por su centro de gravedad caiga dentro de su base.`],
      demo: [R`**Paso 1 (las condiciones).** Un rígido quieto tiene $\vec a_{cm} = 0$ y no empieza a girar. Por el [[f1-cm|teorema del centro de masa]], lo primero pide $\sum\vec F = 0$; por la [[f1-momento-angular|ley del momento angular]], lo segundo pide $\sum\vec\tau = 0$.`,
        R`**Paso 2 (el punto no importa).** Tomamos torques respecto de otro punto $O'$, ubicado en $\vec d$. Las posiciones medidas desde $O'$ son $\vec r_i - \vec d$, y el producto vectorial es distributivo: $$\sum(\vec r_i - \vec d)\times\vec F_i = \sum\vec r_i\times\vec F_i - \vec d\times\sum\vec F_i.$$`,
        R`**Paso 3.** Si la fuerza neta es $\vec 0$, el último término se anula y el torque total es el mismo respecto de $O$ que de $O'$. Por eso, si se cumple la primera condición, la segunda se puede chequear desde cualquier punto. $\blacksquare$`,
        R`**Paso 4 (centro de gravedad).** El torque total del peso es $\sum\vec r_i\times m_i\vec g$. Si $\vec g$ es uniforme, es el mismo en todos los términos y sale de factor común: $$\sum\vec r_i\times m_i\vec g = \Big(\sum m_i\vec r_i\Big)\times\vec g = M\vec r_{cm}\times\vec g = \vec r_{cm}\times M\vec g.$$ Es el torque de todo el peso aplicado en el centro de masa.`],
      examples: [{ q: R`Una tabla de 4 m y 200 N apoyada en sus extremos. Un pintor de 600 N está a 1 m del apoyo izquierdo. ¿Reacciones?`, steps: [R`Torques respecto del izquierdo: $4R_2 = 200\cdot 2 + 600\cdot 1 \Rightarrow R_2 = 250$ N.`, R`$R_1 = 800 - 250 = 550$ N.`] }],
      see: ["f1-torque", "f1-cm", "f1-newton"]
    }
  };

  E.extendCourse("f101", {
    concepts: { "f1-equilibrio": { name: "Equilibrio del rígido" } },
    templates: T,
    units: [{
      id: "f1-equilibrio-u", order: 8, program: "Unidad 8", title: "Equilibrio de cuerpos rígidos", icon: "target",
      diagnostic: ["f1-palanca-num", "f1-viga-num", "f1-escalera-num"],
      lessons: [
        { id: "f1-equilibrio", title: "Condiciones de equilibrio", templates: ["f1-palanca-num", "f1-viga-num", "f1-escalera-num"], theory: ["f1-equilibrio", "f1-torque"],
          intro: R`$\sum\vec F = 0$ y $\sum\vec\tau = 0$. Tomá torques respecto del punto con más incógnitas.` },
        { id: "f1-cg", title: "Centro de gravedad", templates: ["f1-estab-vf", "f1-cg-num"], theory: ["f1-equilibrio", "f1-cm"],
          intro: R`En un campo uniforme, el centro de gravedad es el centro de masa: $x_{cg} = \frac{\sum m_ix_i}{\sum m_i}$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 9 · GRAVITACIÓN
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {};
  const G = 6.674e-11, MT = 5.97e24, RT = 6.371e6;
  const sci = x => { const e = Math.floor(Math.log10(Math.abs(x))), m = x / 10 ** e; return `${num(m, 3).replace(".", "{,}")}\\times10^{${e}}`; };
  const BODIES = [{ n: "la Tierra", M: MT, R: RT }, { n: "la Luna", M: 7.35e22, R: 1.737e6 }, { n: "Marte", M: 6.42e23, R: 3.39e6 },
    { n: "Venus", M: 4.87e24, R: 6.052e6 }, { n: "Mercurio", M: 3.30e23, R: 2.44e6 }, { n: "Júpiter", M: 1.898e27, R: 6.99e7 }];
  // órbita en el plano: estado [x, y, vx, vy]
  const orbitF = GM => (_, s) => { const r3 = Math.hypot(s[0], s[1]) ** 3; return [s[2], s[3], -GM * s[0] / r3, -GM * s[1] / r3]; };

  T["f1-grav-num"] = {
    type: "numeric", concepts: ["f1-gravitacion"], difficulty: 1,
    generate(r) {
      const v = r.pick(["altura", "planeta", "fuerza"]);
      if (v === "altura") {
        const h = r.pick([400, 1000, 2000, 6371, 20000, 36000]) * 1000, gh = G * MT / (RT + h) ** 2;
        return { prompt: `¿Cuánto vale la aceleración de la gravedad (m/s²) a $${num(h / 1000)}$ km de altura sobre la Tierra? ($G = 6{,}674\\times10^{-11}$, $M_T = 5{,}97\\times10^{24}$ kg, $R_T = 6371$ km)`, answer: gh,
          solution: [`[[f1-gravitacion|Ley de gravitación]]: $g(h) = \\frac{GM_T}{(R_T + h)^2}$.`, `$g \\approx ${num(gh, 4)}$ m/s².${h === 400000 ? " ¡En la estación espacial la gravedad es casi el 90 % de la de la superficie! Los astronautas flotan porque están en caída libre." : ""}`],
          verify: { kind: "value", fn: () => (G * MT / (RT * RT)) * (RT / (RT + h)) ** 2 } };
      }
      if (v === "planeta") {
        const fm = r.pick([0.1, 0.5, 2, 3, 5]), fr = r.pick([0.5, 0.8, 1.5, 2]), gp = 9.8 * fm / (fr * fr);
        return { prompt: `Un planeta tiene $${String(fm).replace(".", "{,}")}$ veces la masa de la Tierra y $${String(fr).replace(".", "{,}")}$ veces su radio. ¿Cuánto vale $g$ en su superficie? ($g_T = 9{,}8$ m/s²)`, answer: gp,
          solution: [`$g = \\frac{GM}{R^2}$ ([[f1-gravitacion]]), así que $\\frac{g_p}{g_T} = \\frac{M_p/M_T}{(R_p/R_T)^2}$.`, `$g_p = 9{,}8\\cdot\\frac{${String(fm).replace(".", "{,}")}}{${String(fr * fr).replace(".", "{,}")}} \\approx ${num(gp, 4)}$ m/s².`],
          verify: { kind: "value", fn: () => { const g0 = G * MT / RT ** 2; return 9.8 * (G * fm * MT / (fr * RT) ** 2) / g0; } } };
      }
      const m1 = r.int(1, 9) * 100, m2 = r.int(1, 9) * 100, d = r.int(1, 10) / 2, F = G * m1 * m2 / (d * d);
      return { prompt: `¿Con qué fuerza (en N) se atraen dos esferas de $${m1}$ kg y $${m2}$ kg cuyos centros están a $${String(d).replace(".", "{,}")}$ m? ($G = 6{,}674\\times10^{-11}$ N·m²/kg²)`, answer: F,
        solution: [`$F = \\frac{Gm_1m_2}{d^2}$ ([[f1-gravitacion]]).`, `$F \\approx ${sci(F)}$ N: diminuta. La gravedad es la más débil de las interacciones.`],
        verify: { kind: "value", fn: () => Math.exp(Math.log(G) + Math.log(m1) + Math.log(m2) - 2 * Math.log(d)) } };
    }
  };
  T["f1-orbita-num"] = {
    type: "numeric", concepts: ["f1-orbitas"], difficulty: 3,
    generate(r) {
      const h = r.pick([300, 400, 800, 2000, 10000, 20200, 35786]) * 1000, rr = RT + h, GM = G * MT, ask = r.pick(["v", "T"]);
      const v = Math.sqrt(GM / rr), Tp = 2 * Math.PI * Math.sqrt(rr ** 3 / GM);
      return {
        prompt: `Un satélite está en órbita circular a $${num(h / 1000)}$ km de altura. ¿${ask === "v" ? "Qué velocidad orbital (km/s) tiene" : "Cuál es su período (en horas)"}? ($GM_T = 3{,}986\\times10^{14}$ m³/s², $R_T = 6371$ km)`,
        answer: ask === "v" ? v / 1000 : Tp / 3600,
        solution: [
          `La gravedad hace de [[f1-dinamica-circular|fuerza centrípeta]]: $\\frac{GMm}{r^2} = \\frac{mv^2}{r} \\Rightarrow v = \\sqrt{\\frac{GM}{r}}$ ([[f1-orbitas]]).`,
          `$r = R_T + h = ${num(rr / 1000)}$ km: $v \\approx ${num(v / 1000, 4)}$ km/s.`,
          `$T = \\frac{2\\pi r}{v} \\approx ${num(Tp / 3600, 4)}$ h.${h === 35786000 ? " ¡Es un día: la órbita geoestacionaria!" : ""}`
        ],
        // verificación: integramos la órbita en 2D y medimos cuánto tarda en volver a cruzar el eje x hacia arriba
        verify: ask === "T"
          ? { kind: "ode", f: orbitF(GM), y0: [rr, 0, 0, v], t1: 0, until: (t, s) => t > 0.75 * Tp && s[1] >= 0, g: (_, s) => s[1], dt: Tp / 20000, tmax: 2 * Tp, out: t => t / 3600, tol: 1e-4 }
          : { kind: "zero", fn: vk => [(vk * 1000) ** 2 / rr / (GM / rr ** 2) - 1] }
      };
    }
  };
  T["f1-escape-num"] = {
    type: "numeric", concepts: ["f1-orbitas"], difficulty: 2,
    generate(r) {
      const B = r.pick(BODIES), ve = Math.sqrt(2 * G * B.M / B.R);
      return {
        prompt: `¿Cuál es la velocidad de escape (km/s) desde la superficie de ${B.n}? ($M = ${sci(B.M)}$ kg, $R = ${num(B.R / 1000)}$ km, $G = 6{,}674\\times10^{-11}$)`,
        answer: ve / 1000,
        solution: [`Para escapar, la energía total tiene que ser $\\ge 0$: $\\frac12mv^2 - \\frac{GMm}{R} = 0$ ([[f1-orbitas|velocidad de escape]]).`, `$v_e = \\sqrt{\\frac{2GM}{R}} \\approx ${num(ve / 1000, 4)}$ km/s.`],
        // verificación: lanzamiento radial con 0,999·v_e no escapa y con 1,001·v_e sí (simulación radial)
        verify: { kind: "zero", fn: vk => {
          const fly = v0 => { let rr = B.R, v = v0; const GM = G * B.M; for (let i = 0; i < 2e6; i++) { const dt = 1e-3 * rr / Math.max(Math.abs(v), 1); v += -GM / (rr * rr) * dt; rr += v * dt; if (v < 0) return false; if (rr > 1e3 * B.R) return true; } return true; };
          return [fly(vk * 1000 * 0.98) ? 1 : 0, fly(vk * 1000 * 1.02) ? 0 : 1];
        } }
      };
    }
  };
  T["f1-kepler-num"] = {
    type: "numeric", concepts: ["f1-orbitas"], difficulty: 2,
    generate(r) {
      const pl = r.pick([["Marte", 1.524], ["Júpiter", 5.203], ["Saturno", 9.537], ["Venus", 0.723], ["Mercurio", 0.387], ["un asteroide", 2.8]]);
      const Tp = pl[1] ** 1.5;
      return {
        prompt: `La Tierra orbita al Sol a $1$ UA en $1$ año. Si ${pl[0]} está a $${String(pl[1]).replace(".", "{,}")}$ UA, ¿cuántos años dura su órbita?`,
        answer: Tp,
        solution: [`[[f1-orbitas|Tercera ley de Kepler]]: $T^2 \\propto a^3$, así que $\\frac{T}{T_T} = \\left(\\frac{a}{a_T}\\right)^{3/2}$.`, `$T = ${String(pl[1]).replace(".", "{,}")}^{3/2} \\approx ${num(Tp, 4)}$ años.`],
        // verificación: período de órbitas circulares simuladas con GM del Sol en UA y años (GM = 4π²)
        verify: { kind: "ode", f: orbitF(4 * Math.PI * Math.PI), y0: [pl[1], 0, 0, 2 * Math.PI / Math.sqrt(pl[1])], t1: 0, until: (t, s) => t > 0.75 * Tp && s[1] >= 0, g: (_, s) => s[1], dt: Tp / 20000, tmax: 2 * Tp, out: t => t, tol: 1e-4 }
      };
    }
  };
  T["f1-grav-vf"] = {
    type: "tf", concepts: ["f1-gravitacion"], difficulty: 1,
    generate(r) {
      const h = r.pick([400, 1000, 3000]), q = r.pick(["casi-nula", "mayor-70"]);
      const ratio = (RT / (RT + h * 1000)) ** 2;
      return {
        prompt: `<b>Verdadero o falso:</b> a $${h}$ km de altura, ${q === "casi-nula" ? "la gravedad terrestre es casi nula (menos del 10 % de la de la superficie)" : "la gravedad terrestre es todavía más del 50 % de la de la superficie"}.`,
        answer: q === "mayor-70" ? ratio > 0.5 : ratio < 0.1,
        explanation: `$\\frac{g(h)}{g_0} = \\left(\\frac{R_T}{R_T + h}\\right)^2 \\approx ${num(100 * ratio, 3)}\\%$. Los astronautas flotan porque están en **caída libre** junto con la nave, no porque no haya gravedad ([[f1-gravitacion]]).`,
        solution: [`La gravedad decae como $\\frac{1}{r^2}$ desde el centro de la Tierra, no desde la superficie.`],
        verify: { kind: "truth", fn: () => { const g0 = G * MT / RT ** 2, gh = G * MT / (RT + h * 1000) ** 2; return q === "mayor-70" ? gh / g0 > 0.5 : gh / g0 < 0.1; } }
      };
    }
  };

  const cards = {
    "f1-gravitacion": {
      title: "Ley de gravitación universal", aliases: ["ley de gravitación", "gravitación universal", "constante de gravitación", "energía potencial gravitatoria"], concepts: ["f1-gravitacion"],
      summary: "F = G m₁m₂/r². En la superficie, g = GM/R². La energía potencial es U = −GMm/r.",
      def: [R`$$F = \frac{Gm_1m_2}{r^2}, \qquad G = 6{,}674\times10^{-11}\ \text{N m}^2/\text{kg}^2$$ atractiva, a lo largo de la recta que une los cuerpos. Una esfera homogénea atrae desde afuera como si toda su masa estuviera en el centro.`,
        R`**Gravedad en la superficie:** $g = \frac{GM}{R^2}$; a una altura $h$, $g(h) = \frac{GM}{(R + h)^2}$.`,
        R`**Energía potencial gravitatoria:** $U = -\frac{GMm}{r}$ (con $U = 0$ en el infinito). Cerca de la superficie se reduce a $\Delta U \approx mg\,\Delta h$.`],
      idea: [R`La misma ley que hace caer una manzana mantiene a la Luna en órbita: Newton comparó la aceleración de la Luna ($\approx 2{,}7\times10^{-3}$ m/s²) con $g$ y vio que la razón es $(R_T/r_{Luna})^2$.`,
        R`En una estación espacial la gravedad es casi el 90 % de la de la superficie: los astronautas "flotan" porque caen junto con la nave (están en órbita, que es una caída libre permanente).`],
      demo: [R`**Paso 1 (gravedad en la superficie).** El peso de un cuerpo en la superficie es la fuerza gravitatoria que le hace la Tierra. Como desde afuera una esfera atrae como si su masa estuviera en el centro, la distancia es el radio $R$: $mg = \frac{GMm}{R^2}$. Simplificamos $m$: $g = \frac{GM}{R^2}$.`,
        R`**Paso 2.** A una altura $h$ el razonamiento es el mismo, pero la distancia al centro es $R + h$: $g(h) = \frac{GM}{(R + h)^2}$.`,
        R`**Paso 3 (de $U$ a $mgh$).** Calculamos el cambio de energía potencial al subir de $R$ a $R + h$, con denominador común: $$\Delta U = -\frac{GMm}{R + h} + \frac{GMm}{R} = \frac{GMm\,h}{R\,(R + h)}.$$`,
        R`**Paso 4.** Si $h \ll R$, $R + h \approx R$ y queda $\Delta U \approx \frac{GMm}{R^2}\,h$. Por el paso 1, $\frac{GM}{R^2} = g$, así que $\Delta U \approx mgh$.`,
        R`**Paso 5 (la cuenta de Newton).** La Luna está a unos $60$ radios terrestres. Si la fuerza baja como $\frac{1}{r^2}$, su aceleración tiene que ser $\frac{g}{60^2} \approx 2{,}7\times10^{-3}$ m/s². Por otro lado, con su órbita ($r \approx 3{,}84\times10^8$ m, $T \approx 27{,}3$ días), su [[f1-circular|aceleración centrípeta]] $\frac{4\pi^2r}{T^2}$ da lo mismo.`],
      examples: [{ q: R`¿Cuánto pesarías en la Luna ($g \approx 1{,}62$ m/s²) si tu masa es 70 kg?`, steps: [R`$P = mg = 70\cdot 1{,}62 \approx 113$ N (un sexto de lo que pesás en la Tierra).`] }],
      see: ["f1-orbitas", "f1-dinamica-circular", "f1-energia"]
    },
    "f1-orbitas": {
      title: "Satélites, leyes de Kepler y velocidad de escape", aliases: ["leyes de Kepler", "tercera ley de Kepler", "velocidad de escape", "órbita", "órbitas", "satélite", "satélites", "órbita geoestacionaria", "colapso gravitacional"], concepts: ["f1-orbitas"],
      summary: "Órbita circular: v = √(GM/r), T² = 4π² r³/(GM). Escape: v = √(2GM/R).",
      def: [R`**Órbita circular:** la gravedad es la fuerza centrípeta, $\frac{GMm}{r^2} = \frac{mv^2}{r}$, así que $v = \sqrt{\frac{GM}{r}}$ y $T = 2\pi\sqrt{\frac{r^3}{GM}}$.`,
        R`**Leyes de Kepler:** 1) las órbitas son elipses con el Sol en un foco; 2) el radio vector barre áreas iguales en tiempos iguales (conservación del [[f1-momento-angular|momento angular]]); 3) $T^2 \propto a^3$.`,
        R`**Velocidad de escape:** la mínima para no volver nunca, con energía total cero: $v_e = \sqrt{\frac{2GM}{R}}$ (Tierra: $11{,}2$ km/s).`],
      idea: [R`La órbita geoestacionaria ($\approx 36\,000$ km de altura) tiene período de un día: el satélite queda siempre sobre el mismo punto del ecuador.`,
        R`**Colapso gravitacional:** si una nube de gas es suficientemente masiva, su propia gravedad le gana a la presión y se contrae. Así se forman las estrellas, y si la contracción no se detiene, estrellas de neutrones o agujeros negros (donde $v_e$ supera la velocidad de la luz).`],
      demo: [R`**Paso 1 (velocidad orbital).** En una órbita circular la gravedad es la única fuerza y hace de fuerza centrípeta: $\frac{GMm}{r^2} = \frac{mv^2}{r}$. Simplificando $m$ y un $r$: $v = \sqrt{\frac{GM}{r}}$.`,
        R`**Paso 2 (tercera ley de Kepler).** En un período el satélite recorre la circunferencia a rapidez constante: $T = \frac{2\pi r}{v}$. Elevamos al cuadrado y reemplazamos $v^2 = \frac{GM}{r}$: $$T^2 = \frac{4\pi^2r^2}{GM/r} = \frac{4\pi^2}{GM}\,r^3. \quad\blacksquare$$`,
        R`**Paso 3 (escape).** Fuera de la atmósfera solo actúa la gravedad, que es conservativa, así que la [[f1-energia|energía mecánica]] se conserva: $$E = \tfrac12mv^2 - \frac{GMm}{r} = \text{constante}.$$`,
        R`**Paso 4.** Para alejarse sin volver, el cuerpo tiene que llegar a $r \to \infty$, donde la energía potencial es $0$ y la cinética no puede ser negativa. Entonces hace falta $E \ge 0$. Con lo que vale $E$ en la superficie ($r = R$): $\frac12mv^2 \ge \frac{GMm}{R}$, o sea $v \ge \sqrt{\frac{2GM}{R}}$.`],
      examples: [{ q: R`¿Velocidad de la estación espacial a 400 km?`, steps: [R`$v = \sqrt{\frac{3{,}986\times10^{14}}{6{,}771\times10^6}} \approx 7{,}67$ km/s: da una vuelta cada 92 minutos.`] }],
      see: ["f1-gravitacion", "f1-dinamica-circular", "f1-momento-angular"]
    }
  };

  E.extendCourse("f101", {
    concepts: { "f1-gravitacion": { name: "Gravitación universal" }, "f1-orbitas": { name: "Órbitas, Kepler y escape" } },
    templates: T,
    units: [{
      id: "f1-gravitacion-u", order: 9, program: "Unidad 9", title: "Gravitación", icon: "sparkles",
      diagnostic: ["f1-grav-num", "f1-orbita-num", "f1-kepler-num"],
      lessons: [
        { id: "f1-gravitacion", title: "Ley de gravitación", templates: ["f1-grav-vf", "f1-grav-num"], theory: ["f1-gravitacion"],
          intro: R`$F = \frac{Gm_1m_2}{r^2}$ y $g = \frac{GM}{R^2}$, que decae como $\frac{1}{r^2}$ desde el centro.` },
        { id: "f1-orbitas", title: "Satélites y Kepler", templates: ["f1-orbita-num", "f1-kepler-num", "f1-escape-num"], theory: ["f1-orbitas", "f1-gravitacion"],
          intro: R`Órbita circular: $v = \sqrt{GM/r}$, $T^2 = \frac{4\pi^2}{GM}r^3$. Escape: $v_e = \sqrt{2GM/R}$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 10 · MOVIMIENTO PERIÓDICO
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {}, g = 9.8;
  const dec = x => String(x).replace(".", "{,}");
  // período medido en una simulación: tiempo entre dos cruces sucesivos de x = 0 hacia arriba
  const periodOf = (f, y0, Test) => ({ kind: "ode", f, y0, t1: 0, until: (t, y) => t > 0.75 * Test && y[0] >= 0 && y[1] > 0, g: (_, y) => y[0], dt: Test / 20000, out: t => t, tol: 1e-4 });

  T["f1-mas-num"] = {
    type: "numeric", concepts: ["f1-mas"], difficulty: 1,
    generate(r) {
      const m = r.int(1, 20) / 4, k = r.int(5, 100) * 10, A = r.int(2, 20) / 100, ask = r.pick(["T", "f", "vmax", "amax"]);
      const w = Math.sqrt(k / m), Tp = 2 * Math.PI / w;
      const ans = { T: Tp, f: 1 / Tp, vmax: A * w, amax: A * w * w }[ask];
      return {
        prompt: `Una masa de $${dec(m)}$ kg oscila sin rozamiento unida a un resorte de $k = ${k}$ N/m con amplitud $${dec(num(A))}$ m. Calculá ${{ T: "el período (s)", f: "la frecuencia (Hz)", vmax: "la velocidad máxima (m/s)", amax: "la aceleración máxima (m/s²)" }[ask]}.`,
        answer: ans,
        solution: [`[[f1-mas|MAS]]: $\\omega = \\sqrt{\\frac km} \\approx ${num(w, 4)}$ rad/s, $T = \\frac{2\\pi}{\\omega}$, $v_{\\max} = A\\omega$, $a_{\\max} = A\\omega^2$.`, `Respuesta: $\\approx ${num(ans, 4)}$.`],
        verify: ask === "T" || ask === "f"
          ? Object.assign(periodOf((_, y) => [y[1], -(k / m) * y[0]], [0, A * w], Tp), ask === "f" ? { out: t => 1 / t } : {})
          : { kind: "value", tol: 1e-4, fn: () => { let x = A, v = 0, vm = 0, am = 0; const dt = Tp / 40000; for (let i = 0; i < 40000; i++) { const a = -(k / m) * x; am = Math.max(am, Math.abs(a)); v += a * dt; x += v * dt; vm = Math.max(vm, Math.abs(v)); } return ask === "vmax" ? vm : am; } }
      };
    }
  };
  T["f1-pendulo-num"] = {
    type: "numeric", concepts: ["f1-pendulos"], difficulty: 2,
    generate(r) {
      const v = r.pick(["simple", "simple", "fisico", "luna"]);
      if (v === "fisico") {
        const L = r.int(5, 20) / 10, Tp = 2 * Math.PI * Math.sqrt(2 * L / (3 * g));
        return { prompt: `Una varilla uniforme de $${dec(L)}$ m oscila (con amplitud chica) colgada de un extremo. ¿Cuál es su período? ($g = 9{,}8$ m/s²)`, answer: Tp,
          solution: [`[[f1-pendulos|Péndulo físico]]: $T = 2\\pi\\sqrt{\\frac{I}{mgd}}$ con $I = \\frac{mL^2}{3}$ y $d = \\frac L2$.`, `$T = 2\\pi\\sqrt{\\frac{2L}{3g}} \\approx ${num(Tp, 4)}$ s (más corto que un péndulo simple de largo $L$).`],
          verify: periodOf((_, y) => [y[1], -(g * (L / 2) / (L * L / 3)) * Math.sin(y[0])], [0, 0.002], Tp) };
      }
      const L = r.int(2, 30) / 10, gg = v === "luna" ? 1.62 : g, Tp = 2 * Math.PI * Math.sqrt(L / gg);
      return { prompt: `¿Cuál es el período de un péndulo simple de $${dec(L)}$ m ${v === "luna" ? "en la Luna ($g = 1{,}62$ m/s²)" : "($g = 9{,}8$ m/s²)"} para amplitudes chicas?`, answer: Tp,
        solution: [`[[f1-pendulos|Péndulo simple]], ángulos chicos: $T = 2\\pi\\sqrt{\\frac{L}{g}}$ (no depende de la masa ni de la amplitud).`, `$T \\approx ${num(Tp, 4)}$ s.`],
        verify: periodOf((_, y) => [y[1], -(gg / L) * Math.sin(y[0])], [0, 0.002], Tp) };
    }
  };
  T["f1-mas-energia-num"] = {
    type: "numeric", concepts: ["f1-mas"], difficulty: 2,
    generate(r) {
      const m = r.int(1, 10) / 2, k = r.int(5, 60) * 10, A = r.int(5, 30) / 100, x = Math.round(A * r.pick([0.2, 0.4, 0.5, 0.6, 0.8]) * 1000) / 1000;
      const w = Math.sqrt(k / m), vx = w * Math.sqrt(A * A - x * x);
      return {
        prompt: `Un oscilador masa-resorte ($m = ${dec(m)}$ kg, $k = ${k}$ N/m) tiene amplitud $${dec(num(A))}$ m. ¿Qué rapidez (m/s) tiene cuando pasa por $x = ${dec(num(x))}$ m?`,
        answer: vx,
        solution: [`[[f1-mas|Energía en el MAS]]: $\\frac12kA^2 = \\frac12mv^2 + \\frac12kx^2$.`, `$v = \\omega\\sqrt{A^2 - x^2} = ${num(w, 4)}\\sqrt{${num(A * A, 5)} - ${num(x * x, 5)}} \\approx ${num(vx, 4)}$ m/s.`],
        verify: { kind: "ode", f: (_, y) => [y[1], -(k / m) * y[0]], y0: [A, 0], t1: 0, until: (_, y) => y[0] <= x, g: (_, y) => y[0] - x, dt: 2 * Math.PI / w / 40000, out: (_, y) => Math.abs(y[1]) }
      };
    }
  };
  T["f1-amort-num"] = {
    type: "numeric", concepts: ["f1-amortiguadas"], difficulty: 3,
    generate(r) {
      const m = r.int(1, 10) / 2, k = r.int(10, 100) * 10, b = r.int(1, 10) / 10, A0 = r.int(5, 20) / 100, t = r.int(2, 20);
      const At = A0 * Math.exp(-b * t / (2 * m));
      return {
        prompt: `Un oscilador ($m = ${dec(m)}$ kg, $k = ${k}$ N/m) tiene rozamiento viscoso $F = -bv$ con $b = ${dec(b)}$ kg/s y arranca con amplitud $${dec(num(A0))}$ m. ¿Cuál es la amplitud de la envolvente (cm) a los $${t}$ s?`,
        answer: 100 * At,
        solution: [`[[f1-amortiguadas|Oscilaciones amortiguadas]] (amortiguamiento débil): $x(t) = A_0e^{-\\frac{b}{2m}t}\\cos(\\omega' t)$.`, `$A(${t}) = ${dec(num(A0))}\\,e^{-${num(b / (2 * m), 4)}\\cdot${t}} \\approx ${num(At, 4)}$ m $= ${num(100 * At, 3)}$ cm.`],
        // verificación: simulamos el oscilador y reconstruimos la envolvente exacta a partir de x y v en el instante t
        verify: { kind: "ode", f: (_, y) => [y[1], -(k / m) * y[0] - (b / m) * y[1]], y0: [A0, -b / (2 * m) * A0], t1: t, dt: 1e-4,
          out: (_, y) => { const gam = b / (2 * m), wp = Math.sqrt(k / m - gam * gam); return 100 * Math.hypot(y[0], (y[1] + gam * y[0]) / wp); }, tol: 1e-4 }
      };
    }
  };
  T["f1-resonancia-vf"] = {
    testN: 25, // simulación cara: menos instancias en los tests
    type: "tf", concepts: ["f1-amortiguadas"], difficulty: 2,
    generate(r) {
      const m = 1, k = r.int(4, 25) ** 2, b = r.pick([0.2, 0.5, 1]), w0 = Math.sqrt(k / m), fac = r.pick([0.5, 2, 3]), q = r.pick(["mayor", "menor"]);
      return {
        prompt: `Un oscilador ($\\omega_0 = ${num(w0, 3)}$ rad/s, poco amortiguado) se fuerza con una fuerza periódica de amplitud fija. <b>Verdadero o falso:</b> la amplitud estacionaria es ${q} forzándolo a $\\omega = \\omega_0$ que forzándolo a $\\omega = ${num(fac, 2)}\\,\\omega_0$.`,
        answer: q === "mayor",
        explanation: `Es la [[f1-amortiguadas|resonancia]]: la amplitud es máxima cuando la frecuencia de la fuerza coincide (aproximadamente) con la natural del oscilador.`,
        solution: [`$A(\\omega) = \\frac{F_0/m}{\\sqrt{(\\omega_0^2 - \\omega^2)^2 + (b\\omega/m)^2}}$: en $\\omega = \\omega_0$ solo queda el término de amortiguamiento.`],
        // verificación: simulamos el oscilador forzado hasta el régimen estacionario y medimos la amplitud
        verify: { kind: "truth", fn: () => {
          const amp = w => { let x = 0, v = 0; const dt = 0.002 / w0, tEnd = 40 * m / b + 20 * 2 * Math.PI / w; let t = 0, mx = 0;
            while (t < tEnd) { const a = (Math.cos(w * t) - b * v - k * x) / m; v += a * dt; x += v * dt; t += dt; if (t > tEnd - 4 * 2 * Math.PI / w) mx = Math.max(mx, Math.abs(x)); } return mx; };
          const A1 = amp(w0), A2 = amp(fac * w0);
          return q === "mayor" ? A1 > A2 : A1 < A2;
        } }
      };
    }
  };

  const cards = {
    "f1-mas": {
      title: "Movimiento armónico simple", aliases: ["movimiento armónico simple", "MAS", "oscilador armónico", "sistema masa-resorte", "frecuencia angular"], concepts: ["f1-mas"],
      summary: "Con fuerza restauradora F = −kx: x(t) = A cos(ωt + φ), ω = √(k/m), T = 2π√(m/k).",
      def: [R`Si la fuerza es $F = -kx$ ([[f1-hooke|ley de Hooke]]), la segunda ley da $x'' = -\omega^2x$ con $\omega = \sqrt{k/m}$, cuya solución es $$x(t) = A\cos(\omega t + \varphi).$$ Período $T = \frac{2\pi}{\omega} = 2\pi\sqrt{\frac mk}$, frecuencia $f = \frac1T$.`,
        R`**Energía:** $E = \frac12kA^2 = \frac12mv^2 + \frac12kx^2$, así que $v = \omega\sqrt{A^2 - x^2}$, con $v_{\max} = A\omega$ y $a_{\max} = A\omega^2$.`],
      idea: [R`El período **no depende de la amplitud**: un resorte que oscila mucho tarda lo mismo que uno que oscila poco, porque va más rápido. Es la base de los relojes.`,
        R`El MAS es la [[f1-circular|proyección de un movimiento circular uniforme]] sobre un diámetro, y la solución de una [[edo|ecuación diferencial]] de segundo orden.`,
        { graph: { fns: [t => 2 * Math.cos(t), t => -2 * Math.sin(t)], xr: [0, 13], yr: [-3, 3] }, caption: R`Posición (violeta) y velocidad (naranja): la velocidad es máxima donde $x = 0$.` }],
      demo: [R`**Paso 1 (la ecuación).** Sobre la masa actúa solo la fuerza del resorte, $-kx$ (en un piso horizontal sin rozamiento). La segunda ley da $mx'' = -kx$, o sea $x'' = -\frac kmx$: buscamos una función cuya derivada segunda sea ella misma por una constante negativa.`,
        R`**Paso 2 (probamos la solución).** Derivamos $x = A\cos(\omega t + \varphi)$ dos veces con la regla de la cadena (cada derivada saca un $\omega$): $$x' = -A\omega\sin(\omega t + \varphi), \qquad x'' = -A\omega^2\cos(\omega t + \varphi) = -\omega^2x.$$`,
        R`**Paso 3.** Comparando con el paso 1, la ecuación se cumple si $\omega^2 = \frac km$. La solución tiene dos constantes libres ($A$ y $\varphi$), las que hacen falta para ajustar la posición y la velocidad iniciales, así que es la solución general. $\blacksquare$`,
        R`**Paso 4 (período).** El coseno se repite cuando su argumento avanza $2\pi$, o sea cuando $t$ avanza $T = \frac{2\pi}{\omega} = 2\pi\sqrt{\frac mk}$. No aparece $A$: el período no depende de la amplitud.`,
        R`**Paso 5 (energía).** Con el paso 2, $\frac12mx'^2 + \frac12kx^2 = \frac12mA^2\omega^2\sin^2 + \frac12kA^2\cos^2$. Como $m\omega^2 = k$, los dos términos tienen el mismo factor y $\sin^2 + \cos^2 = 1$: $E = \frac12kA^2$. Despejando $v$ de $\frac12mv^2 = \frac12k(A^2 - x^2)$ queda $v = \omega\sqrt{A^2 - x^2}$.`],
      examples: [{ q: R`Una masa de 0,5 kg con un resorte de 200 N/m. ¿Período?`, steps: [R`$\omega = \sqrt{400} = 20$ rad/s, $T = \frac{2\pi}{20} \approx 0{,}31$ s.`] }],
      see: ["f1-hooke", "f1-pendulos", "f1-amortiguadas"]
    },
    "f1-pendulos": {
      title: "Péndulos: simple, físico y de torsión", aliases: ["péndulo simple", "péndulo físico", "péndulo de torsión", "péndulo"], concepts: ["f1-pendulos"],
      summary: "Para ángulos chicos: simple T = 2π√(L/g), físico T = 2π√(I/(mgd)), torsión T = 2π√(I/κ).",
      def: [R`**Péndulo simple** (masa puntual en una cuerda de largo $L$): $\theta'' = -\frac gL\sin\theta \approx -\frac gL\theta$, así que $T = 2\pi\sqrt{\frac Lg}$.`,
        R`**Péndulo físico** (rígido que cuelga de un punto a distancia $d$ de su centro de masa): $T = 2\pi\sqrt{\frac{I}{mgd}}$, con $I$ respecto del eje de giro.`,
        R`**Péndulo de torsión** (disco colgado de un alambre que se retuerce con torque $-\kappa\theta$): $T = 2\pi\sqrt{\frac{I}{\kappa}}$.`],
      idea: [R`La aproximación $\sin\theta \approx \theta$ (ver [[lim-trig-notable]]) es lo que lo vuelve un [[f1-mas|MAS]]: vale bien hasta unos $15^\circ$. Para amplitudes grandes el período crece un poco.`,
        R`El período del péndulo simple no depende de la masa: midiendo $T$ y $L$ se mide $g$.`],
      demo: [R`**Paso 1 (péndulo simple).** La masa se mueve sobre un arco de radio $L$, así que su posición a lo largo del arco es $s = L\theta$ y su aceleración tangencial es $L\theta''$. La tensión es perpendicular al arco y no aporta; la componente tangencial del peso es $-mg\sin\theta$ (siempre hacia abajo del arco).`,
        R`**Paso 2.** La segunda ley en la dirección tangencial da $mL\theta'' = -mg\sin\theta$. Simplificamos $m$: $$\theta'' = -\frac gL\sin\theta.$$ La masa se cancela.`,
        R`**Paso 3.** Para ángulos chicos usamos $\sin\theta \approx \theta$ ([[lim-trig-notable]]): queda $\theta'' = -\omega^2\theta$ con $\omega^2 = \frac gL$. Es la ecuación del [[f1-mas|MAS]], así que $T = \frac{2\pi}{\omega} = 2\pi\sqrt{\frac Lg}$.`,
        R`**Paso 4 (péndulo físico).** Ahora es un rígido que gira alrededor del punto de suspensión. El peso actúa en el centro de masa, a distancia $d$ del eje, y su brazo de palanca es $d\sin\theta$: hace un torque $-mgd\sin\theta$. Con $\sum\tau = I\alpha$ ([[f1-torque]]): $$I\theta'' = -mgd\sin\theta \approx -mgd\,\theta,$$ así que $\omega^2 = \frac{mgd}{I}$ y $T = 2\pi\sqrt{\frac{I}{mgd}}$.`,
        R`**Paso 5 (chequeo).** Para una masa puntual a distancia $L$, $I = mL^2$ y $d = L$: $\frac{mgL}{mL^2} = \frac gL$, y vuelve el péndulo simple.`,
        R`**Paso 6 (torsión).** El alambre hace un torque $-\kappa\theta$, proporcional al ángulo sin ninguna aproximación. Con $\sum\tau = I\alpha$: $I\theta'' = -\kappa\theta$, un MAS exacto con $\omega^2 = \frac{\kappa}{I}$ y $T = 2\pi\sqrt{\frac I\kappa}$.`],
      examples: [{ q: R`¿Qué largo tiene un péndulo que "bate segundos" ($T = 2$ s)?`, steps: [R`$L = g\left(\frac{T}{2\pi}\right)^2 = 9{,}8\cdot\frac{1}{\pi^2} \approx 0{,}99$ m.`] }],
      see: ["f1-mas", "f1-inercia"]
    },
    "f1-amortiguadas": {
      title: "Oscilaciones amortiguadas, forzadas y resonancia", aliases: ["oscilaciones amortiguadas", "amortiguamiento", "oscilaciones forzadas", "resonancia"], concepts: ["f1-amortiguadas"],
      summary: "Con rozamiento viscoso la amplitud decae como e^(−bt/2m). Forzando cerca de ω₀, la amplitud se dispara: resonancia.",
      def: [R`**Amortiguada** ($F = -kx - bv$, amortiguamiento débil): $x(t) = Ae^{-\frac{b}{2m}t}\cos(\omega't + \varphi)$, con $\omega' = \sqrt{\omega_0^2 - \left(\frac{b}{2m}\right)^2}$.`,
        R`**Forzada** (con $F_0\cos\omega t$): después de un transitorio oscila a la frecuencia $\omega$ de la fuerza, con amplitud $$A(\omega) = \frac{F_0/m}{\sqrt{(\omega_0^2 - \omega^2)^2 + (b\omega/m)^2}}.$$`],
      idea: [R`**Resonancia:** si $\omega \approx \omega_0$ la amplitud es máxima, y cuanto menor el amortiguamiento, más alto y angosto es el pico. Columpios, copas que se rompen con una nota, puentes que oscilan con el viento o con gente marchando.`,
        { graph: { fns: [w => 1 / Math.sqrt((4 - w * w) ** 2 + (0.3 * w) ** 2), w => 1 / Math.sqrt((4 - w * w) ** 2 + (1 * w) ** 2)], xr: [0, 5], yr: [0, 4] }, caption: R`Amplitud según la frecuencia forzante ($\omega_0 = 2$): poco amortiguamiento (violeta) y más amortiguamiento (naranja).` }],
      demo: [R`**Paso 1 (amortiguada).** Las fuerzas son la del resorte, $-kx$, y el rozamiento viscoso, $-bv$. La segunda ley da $mx'' + bx' + kx = 0$, una [[edo|ecuación diferencial]] lineal con coeficientes constantes. Probamos $x = e^{\lambda t}$, porque cada derivada solo saca un factor $\lambda$: $$(m\lambda^2 + b\lambda + k)\,e^{\lambda t} = 0.$$`,
        R`**Paso 2.** Como la exponencial nunca se anula, hace falta $m\lambda^2 + b\lambda + k = 0$. Dividimos por $m$, llamamos $\omega_0^2 = \frac km$ y usamos la resolvente: $$\lambda = -\frac{b}{2m} \pm \sqrt{\Big(\frac{b}{2m}\Big)^2 - \omega_0^2}.$$`,
        R`**Paso 3.** Si el amortiguamiento es débil ($\frac{b}{2m} < \omega_0$), lo de adentro de la raíz es negativo y las raíces son [[numeros-complejos|complejas]]: $\lambda = -\frac{b}{2m} \pm i\omega'$. Por la fórmula de Euler, $e^{\lambda t} = e^{-\frac{b}{2m}t}\big(\cos\omega't \pm i\sin\omega't\big)$. Como la ecuación tiene coeficientes reales, las partes real e imaginaria también son soluciones, y combinándolas sale $$x(t) = Ae^{-\frac{b}{2m}t}\cos(\omega't + \varphi):$$ una oscilación cuya amplitud decae exponencialmente.`,
        R`**Paso 4 (forzada).** Agregamos la fuerza $F_0\cos\omega t$. Es más fácil resolver la ecuación con $F_0e^{i\omega t}$ y quedarnos con la parte real: como los coeficientes son reales, la parte real de la solución resuelve la ecuación con $F_0\cos\omega t$. Probamos $x = Ce^{i\omega t}$; cada derivada saca un $i\omega$: $$(-m\omega^2 + ib\omega + k)\,C = F_0 \quad\Longrightarrow\quad C = \frac{F_0/m}{(\omega_0^2 - \omega^2) + i\,\frac{b\omega}{m}}.$$`,
        R`**Paso 5.** La parte real de $Ce^{i\omega t}$ es una oscilación a la frecuencia $\omega$ de la fuerza, con amplitud igual al módulo de $C$: $$A(\omega) = |C| = \frac{F_0/m}{\sqrt{(\omega_0^2 - \omega^2)^2 + (b\omega/m)^2}}.$$`,
        R`**Paso 6.** La solución completa es esta más una solución de la ecuación sin fuerza (paso 3), que decae con el tiempo: es el transitorio. Lo que queda es la oscilación del paso 5. Si $b$ es chico, su denominador es mínimo cerca de $\omega = \omega_0$, donde se anula el primer término: la amplitud se dispara y eso es la resonancia.`],
      examples: [{ q: R`Si $b/2m = 0{,}1$ s⁻¹, ¿en cuánto tiempo la amplitud baja a la mitad?`, steps: [R`$e^{-0{,}1t} = \frac12 \Rightarrow t = 10\ln 2 \approx 6{,}9$ s.`] }],
      see: ["f1-mas", "edo"]
    }
  };

  E.extendCourse("f101", {
    concepts: { "f1-mas": { name: "Movimiento armónico simple" }, "f1-pendulos": { name: "Péndulos" }, "f1-amortiguadas": { name: "Amortiguadas, forzadas y resonancia" } },
    templates: T,
    units: [{
      id: "f1-periodico", order: 10, program: "Unidad 10", title: "Movimiento periódico", icon: "rotate-ccw",
      diagnostic: ["f1-mas-num", "f1-pendulo-num", "f1-mas-energia-num"],
      lessons: [
        { id: "f1-mas", title: "Movimiento armónico simple", templates: ["f1-mas-num", "f1-mas-energia-num"], theory: ["f1-mas", "f1-hooke"],
          intro: R`$x = A\cos(\omega t + \varphi)$, $\omega = \sqrt{k/m}$. Energía: $\frac12kA^2 = \frac12mv^2 + \frac12kx^2$.` },
        { id: "f1-pendulos", title: "Péndulos", templates: ["f1-pendulo-num"], theory: ["f1-pendulos"],
          intro: R`Simple: $T = 2\pi\sqrt{L/g}$. Físico: $T = 2\pi\sqrt{I/(mgd)}$. Con ángulos chicos, son MAS.` },
        { id: "f1-amortiguadas", title: "Amortiguadas y resonancia", templates: ["f1-amort-num", "f1-resonancia-vf"], theory: ["f1-amortiguadas"],
          intro: R`La amplitud decae como $e^{-bt/2m}$. Forzando cerca de $\omega_0$ hay resonancia.` }
      ]
    }],
    cards
  });
})();
