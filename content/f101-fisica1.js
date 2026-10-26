/*
 * F101 · Física General I — Licenciatura en Ciencias Básicas (FCEN, UNCuyo), Plan Ord. 77/15 C.S.
 * ==============================================================================================
 * Temario: programa de Física General I (F101), versión 2021 (la más reciente publicada):
 *   Unidad transversal: Magnitudes físicas, mediciones e incertezas
 *   1 Cinemática · 2 Dinámica · 3 Trabajo y energía · 4 Cantidad de movimiento, impulso y choques
 *   5 Mecánica de fluidos · 6 Cinemática rotacional · 7 Dinámica rotacional
 *   8 Equilibrio de cuerpos rígidos · 9 Gravitación · 10 Movimiento periódico
 * Extra UBA (temas de Física 1 de Cs. Físicas, FCEN-UBA, que no están en el programa de F101):
 *   Sistemas no inerciales · Estabilidad y potencial efectivo · Relatividad especial · Masa variable
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
    testN: 100, // simulación cara: menos instancias en los tests
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
    testN: 100, // simulación cara: menos instancias en los tests
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
    testN: 100, // simulación cara: menos instancias en los tests
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
    testN: 100, // simulación cara: menos instancias en los tests
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
    testN: 100, // simulación cara: menos instancias en los tests
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
    testN: 100, // simulación cara: menos instancias en los tests
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
    testN: 12, // simulación cara: menos instancias en los tests
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

/* =====================================================================
 *  EXTRA UBA · SISTEMAS NO INERCIALES
 *  Temas de Física 1 de la Lic. en Cs. Físicas (FCEN, UBA) que no figuran en el programa de F101.
 *  Solo se tomó la lista de temas; el texto y los ejercicios son originales.
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {}, g = 9.8;
  const dn = (x, d = 3) => String(num(x, d)).replace(".", "{,}");
  const rad = d => d * Math.PI / 180, deg = x => x * 180 / Math.PI;
  // segunda derivada numérica de una trayectoria (vector) en t
  const acc = (pos, t, h = 1e-3) => pos(t + h).map((p, i) => (p - 2 * pos(t)[i] + pos(t - h)[i]) / (h * h));

  T["f1-ascensor-num"] = {
    type: "numeric", concepts: ["f1-noinercial"], difficulty: 1,
    generate(r) {
      const m = r.int(40, 100), a = r.int(5, 30) / 10;
      const cases = [["sube y acelera", a], ["sube y frena", -a], ["baja y acelera", -a], ["baja y frena", a]];
      const [txt, ay] = r.pick(cases), ask = r.pick(["kg", "N"]);
      const N = m * (g + ay), ans = ask === "kg" ? N / g : N;
      return {
        prompt: `Una persona de $${m}$ kg está parada sobre una balanza dentro de un ascensor que ${txt} con aceleración de módulo $${dn(a, 1)}$ m/s². ¿${ask === "kg" ? "Cuántos kg marca la balanza (calibrada con $g = 9{,}8$ m/s²)" : "Qué fuerza normal (N) hace la balanza sobre la persona"}? ($g = 9{,}8$ m/s²)`,
        answer: ans,
        solution: [
          `En el sistema del ascensor (no inercial) aparece la [[f1-noinercial|fuerza de inercia]] $-m\\vec a_{asc}$. Con el eje hacia arriba, la aceleración del ascensor es $a_y = ${dn(ay, 1)}$ m/s² (${ay > 0 ? "hacia arriba" : "hacia abajo"}).`,
          `La persona está en reposo respecto del ascensor: $N - mg - ma_y = 0 \\Rightarrow N = m(g + a_y) = ${dn(N, 2)}$ N.`,
          ask === "kg" ? `La balanza "traduce" la fuerza a kg dividiendo por $g$: marca $${dn(N / g, 2)}$ kg (${ay > 0 ? "más" : "menos"} que los $${m}$ kg reales).` : `Es el **peso aparente**: ${ay > 0 ? "mayor" : "menor"} que el peso $mg = ${dn(m * g, 1)}$ N.`
        ],
        // verificación: en el sistema inercial, la persona sobre un resorte rígido y amortiguado cuyo apoyo sube con y = a t²/2;
        // pasado el transitorio, la fuerza del resorte es lo que mide la balanza
        verify: (() => {
          const k = 2000 * m, b = 2 * Math.sqrt(k * m);
          return { kind: "ode", f: (t, y) => [y[1], (k * (ay * t * t / 2 - y[0]) + b * (ay * t - y[1])) / m - g], y0: [-m * g / k, 0], t1: 3, dt: 1e-3,
            out: (t, y) => { const F = k * (ay * t * t / 2 - y[0]); return ask === "kg" ? F / g : F; }, tol: 1e-4 };
        })()
      };
    }
  };
  T["f1-plomada-num"] = {
    type: "numeric", concepts: ["f1-noinercial"], difficulty: 2,
    generate(r) {
      const ask = r.pick(["angulo", "acel", "periodo"]);
      // péndulo en el sistema inercial: masa unida al punto de suspensión (que acelera) por un hilo muy rígido y amortiguado
      const inertialAngle = a => {
        const k = 1e4, b = 6, L = 1;
        const f = (t, s) => { const dx = s[0] - a * t * t / 2, dy = s[1], d = Math.hypot(dx, dy), F = -k * (d - L) / d;
          return [s[2], s[3], F * dx - b * (s[2] - a * t), F * dy - b * s[3] - g]; };
        let s = [0, -L - g / k, 0, 0], t = 0; const h = 2e-3;
        const add = (u, v, c) => u.map((x, i) => x + v[i] * c);
        for (let n = 0; n < 6000; n++) { const k1 = f(t, s), k2 = f(t + h / 2, add(s, k1, h / 2)), k3 = f(t + h / 2, add(s, k2, h / 2)), k4 = f(t + h, add(s, k3, h));
          s = s.map((x, i) => x + h / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])); t += h; }
        return deg(Math.atan2(a * t * t / 2 - s[0], -s[1]));
      };
      if (ask === "angulo") {
        const a = r.int(5, 60) / 10, th = deg(Math.atan(a / g));
        return { prompt: `Un vagón acelera hacia adelante con $a = ${dn(a, 1)}$ m/s² por una vía horizontal. Del techo cuelga una plomada en reposo respecto del vagón. ¿Qué ángulo (en grados) forma el hilo con la vertical? ($g = 9{,}8$ m/s²)`, answer: th,
          solution: [`En el vagón, sobre la plomada actúan el peso, la tensión y la [[f1-noinercial|fuerza de inercia]] $-m\\vec a$, que apunta hacia atrás.`,
            `Todo pasa como si hubiera una **gravedad efectiva** $\\vec g_{ef} = \\vec g - \\vec a$: el hilo se alinea con ella, inclinado hacia atrás.`,
            `$\\tan\\theta = \\frac{a}{g} \\Rightarrow \\theta = \\arctan\\frac{${dn(a, 1)}}{9{,}8} \\approx ${dn(th, 2)}^\\circ$.`],
          verify: { kind: "value", fn: () => inertialAngle(a), tol: 1e-4 } };
      }
      if (ask === "acel") {
        const th = r.pick([3, 5, 8, 10, 12, 15, 20, 25]), a = g * Math.tan(rad(th));
        return { prompt: `En un vagón que acelera por una vía horizontal, un péndulo en reposo respecto del vagón forma $${th}^\\circ$ con la vertical. ¿Qué aceleración (m/s²) tiene el vagón? ($g = 9{,}8$ m/s²)`, answer: a,
          solution: [`En el sistema del vagón el péndulo está en equilibrio con la [[f1-noinercial|fuerza de inercia]] $-m\\vec a$: $T\\sin\\theta = ma$, $T\\cos\\theta = mg$.`,
            `Dividiendo: $a = g\\tan\\theta = 9{,}8\\tan ${th}^\\circ \\approx ${dn(a, 3)}$ m/s². El péndulo funciona como **acelerómetro**.`],
          verify: { kind: "zero", fn: ans => [inertialAngle(ans) - th], tol: 1e-3, scale: th } };
      }
      const a = r.int(10, 60) / 10, L = r.int(5, 20) / 10, ge = Math.hypot(g, a), Tp = 2 * Math.PI * Math.sqrt(L / ge), the = Math.atan(a / g);
      return { prompt: `Un péndulo simple de $${dn(L, 1)}$ m cuelga dentro de un vagón que acelera horizontalmente con $a = ${dn(a, 1)}$ m/s². ¿Cuál es su período (s) para oscilaciones chicas alrededor de su posición de equilibrio? ($g = 9{,}8$ m/s²)`, answer: Tp,
        solution: [`En el vagón, el péndulo siente la **gravedad efectiva** $\\vec g_{ef} = \\vec g - \\vec a$ ([[f1-noinercial]]), de módulo $\\sqrt{g^2 + a^2} \\approx ${dn(ge, 3)}$ m/s².`,
          `Oscila alrededor de la dirección de $\\vec g_{ef}$ como un [[f1-pendulos|péndulo simple]] con esa gravedad: $T = 2\\pi\\sqrt{\\frac{L}{g_{ef}}} \\approx ${dn(Tp, 3)}$ s, un poco menos que en reposo.`],
        // verificación: ecuación angular completa en el vagón, L θ'' = −g sen θ − a cos θ, simulada alrededor del equilibrio
        verify: { kind: "ode", f: (_, y) => { const th = y[0] - the; return [y[1], -(g * Math.sin(th) + a * Math.cos(th)) / L]; }, y0: [0, 1e-3],
          t1: 0, until: (t, y) => t > 0.75 * Tp && y[0] >= 0 && y[1] > 0, g: (_, y) => y[0], dt: Tp / 20000, out: t => t, tol: 1e-4 } };
    }
  };
  const SIT = [
    { txt: "un colectivo que arranca hacia adelante", pos: t => [t * t, 0, 0] },
    { txt: "un colectivo que, yendo hacia adelante, frena", pos: t => [10 * t - t * t, 0, 0] },
    { txt: "un auto que dobla hacia la izquierda con rapidez constante", pos: t => [20 * Math.sin(t / 2), 20 * (1 - Math.cos(t / 2)), 0] },
    { txt: "un auto que dobla hacia la derecha con rapidez constante", pos: t => [20 * Math.sin(t / 2), -20 * (1 - Math.cos(t / 2)), 0] },
    { txt: "un ascensor que arranca subiendo", pos: t => [0, 0, t * t] },
    { txt: "un ascensor que, mientras baja, frena", pos: t => [0, 0, -3 * t + t * t] },
    { txt: "un ascensor que arranca bajando", pos: t => [0, 0, -t * t] }
  ];
  const DIRS = ["hacia adelante", "hacia atrás", "hacia la izquierda", "hacia la derecha", "hacia arriba", "hacia abajo"];
  // dirección dominante de un vector (x adelante, y izquierda, z arriba)
  const dirOf = v => { const i = [0, 1, 2].reduce((b, j) => (Math.abs(v[j]) > Math.abs(v[b]) ? j : b), 0); return DIRS[2 * i + (v[i] > 0 ? 0 : 1)]; };
  T["f1-pseudo-mc"] = {
    type: "mc", concepts: ["f1-noinercial"], difficulty: 1,
    generate(r) {
      const k = r.int(0, SIT.length - 1), s = SIT[k];
      const correct = ["hacia atrás", "hacia adelante", "hacia la derecha", "hacia la izquierda", "hacia abajo", "hacia abajo", "hacia arriba"][k];
      const m = r.int(40, 90);
      return {
        prompt: `Un pasajero de $${m}$ kg viaja en ${s.txt}. En el sistema de referencia del vehículo, ¿hacia dónde apunta la fuerza de inercia que siente?`,
        ...H.mc(r, correct, r.shuffle(DIRS.filter(d => d !== correct)), { text: true }),
        solution: [`La [[f1-noinercial|fuerza de inercia]] es $-m\\vec a_O$: opuesta a la aceleración del vehículo (no a su velocidad).`,
          `Acá la aceleración del vehículo apunta ${dirOf(acc(s.pos, 0))}, así que la fuerza de inercia apunta **${correct}**. Por eso ${k < 2 ? "el cuerpo \"se va\" en ese sentido" : k < 4 ? "en una curva uno se siente empujado hacia afuera" : "uno se siente más pesado o más liviano"}.`],
        // verificación: aceleración del vehículo por diferencias finitas sobre su trayectoria, y dirección de −a
        verify: { kind: "truth", target: true, fn: () => dirOf(acc(s.pos, 0).map(x => -x)) === correct }
      };
    }
  };
  T["f1-desliza-vf"] = {
    type: "tf", concepts: ["f1-rotante"], difficulty: 2,
    generate(r) {
      const v = r.pick(["plataforma", "colectivo"]);
      if (v === "plataforma") {
        const l = r.int(5, 30) / 10, rpm = r.int(10, 60), mu = r.int(2, 8) / 10, w = rpm * 2 * Math.PI / 60;
        if (Math.abs(w * w * l / (mu * g) - 1) < 0.1) return null;
        return { prompt: `Un paquete está apoyado a $${dn(l, 1)}$ m del centro de una plataforma horizontal que gira a $${rpm}$ rpm. El coeficiente de rozamiento estático es $\\mu_e = ${dn(mu, 1)}$. <b>Verdadero o falso:</b> el paquete desliza. ($g = 9{,}8$ m/s²)`,
          answer: w * w * l > mu * g,
          explanation: `En el sistema de la plataforma, el rozamiento tiene que equilibrar la [[f1-rotante|fuerza centrífuga]] $m\\omega^2 l$, y como mucho vale $\\mu_e mg$. Con $\\omega = ${dn(w, 3)}$ rad/s: $\\omega^2 l = ${dn(w * w * l, 2)}$ m/s² frente a $\\mu_e g = ${dn(mu * g, 2)}$ m/s², así que ${w * w * l > mu * g ? "**desliza**" : "**no desliza**"}.`,
          solution: [`Condición para no deslizar: $\\omega^2 l \\le \\mu_e g$. Desde afuera es lo mismo: el rozamiento es la [[f1-dinamica-circular|fuerza centrípeta]].`],
          // verificación: aceleración del paquete (si acompaña a la plataforma) por diferencias finitas sobre la circunferencia
          verify: { kind: "truth", fn: () => Math.hypot(...acc(t => [l * Math.cos(w * t), l * Math.sin(w * t), 0], 0.3, 1e-4)) > mu * g } };
      }
      const a = r.int(5, 60) / 10, mu = r.int(1, 6) / 10;
      if (Math.abs(a / (mu * g) - 1) < 0.1) return null;
      return { prompt: `Un paquete está apoyado en el piso de un colectivo que arranca con aceleración $${dn(a, 1)}$ m/s². El rozamiento estático paquete-piso es $\\mu_e = ${dn(mu, 1)}$. <b>Verdadero o falso:</b> el paquete desliza respecto del piso. ($g = 9{,}8$ m/s²)`,
        answer: a > mu * g,
        explanation: `En el colectivo, el rozamiento tiene que compensar la [[f1-noinercial|fuerza de inercia]] $ma$, y como mucho da $\\mu_e mg$: $a = ${dn(a, 1)}$ frente a $\\mu_e g = ${dn(mu * g, 2)}$ m/s². ${a > mu * g ? "**Desliza** hacia atrás." : "**No desliza**."}`,
        solution: [`El paquete acompaña al colectivo solo si $a \\le \\mu_e g$.`],
        verify: { kind: "truth", fn: () => Math.abs(acc(t => [a * t * t / 2, 0, 0], 1)[0]) > mu * g } };
    }
  };
  T["f1-silla-num"] = {
    type: "numeric", concepts: ["f1-rotante"], difficulty: 3,
    generate(r) {
      const Rd = r.int(3, 8), L = r.int(3, 8), th = r.pick([20, 25, 30, 35, 40, 45, 50]), ask = r.pick(["w", "rpm"]);
      const rr = Rd + L * Math.sin(rad(th)), w = Math.sqrt(g * Math.tan(rad(th)) / rr), ans = ask === "w" ? w : w * 60 / (2 * Math.PI);
      return {
        prompt: `En unas sillas voladoras, cada silla cuelga de un cable de $${L}$ m atado al borde de un disco de radio $${Rd}$ m que gira con velocidad angular constante. Si los cables forman $${th}^\\circ$ con la vertical, ¿${ask === "w" ? "cuál es la velocidad angular (rad/s)" : "a cuántas vueltas por minuto gira el disco"}? ($g = 9{,}8$ m/s²)`,
        answer: ans,
        solution: [
          `En el sistema que gira con el disco, la silla está en equilibrio bajo el peso, la tensión y la [[f1-rotante|fuerza centrífuga]] $m\\omega^2 r$, con $r = R + L\\sin\\theta = ${dn(rr, 3)}$ m.`,
          `$T\\cos\\theta = mg$ y $T\\sin\\theta = m\\omega^2 r$, así que $\\tan\\theta = \\frac{\\omega^2 r}{g}$.`,
          `$\\omega = \\sqrt{\\frac{g\\tan\\theta}{r}} \\approx ${dn(w, 4)}$ rad/s${ask === "rpm" ? ` $\\approx ${dn(ans, 3)}$ rpm` : ""}. No depende de la masa: todas las sillas quedan con el mismo ángulo.`
        ],
        // verificación: en el sistema inercial, la resultante (tensión + peso) tiene que ser la fuerza centrípeta, con m = 1
        verify: { kind: "zero", fn: x => { const ww = ask === "w" ? x : x * 2 * Math.PI / 60, Tn = g / Math.cos(rad(th)); return [(Tn * Math.sin(rad(th)) - ww * ww * rr) / g]; }, tol: 1e-9 }
      };
    }
  };
  T["f1-coriolis-num"] = {
    type: "numeric", concepts: ["f1-rotante"], difficulty: 3,
    generate(r) {
      const Om = 7.292e-5, lat = r.pick([["Mendoza", -32.9], ["Buenos Aires", -34.6], ["Quito", -0.2], ["Madrid", 40.4], ["Ushuaia", -54.8], ["Ciudad de México", 19.4]]);
      const ask = r.pick(["desvio", "desvio", "fuerza"]);
      if (ask === "desvio") {
        const h = r.pick([50, 80, 100, 150, 200, 300, 450]), t = Math.sqrt(2 * h / g), d = Om * g * t ** 3 * Math.cos(rad(lat[1])) / 3;
        return { prompt: `En ${lat[0]} (latitud $${dn(Math.abs(lat[1]), 1)}^\\circ$ ${lat[1] < 0 ? "S" : "N"}) se deja caer una piedra desde $${h}$ m de altura, sin rozamiento. Por la rotación de la Tierra ($\\Omega = 7{,}292\\times10^{-5}$ rad/s), ¿cuántos centímetros se desvía hacia el este al llegar al suelo? ($g = 9{,}8$ m/s²)`, answer: 100 * d,
          solution: [`En la Tierra (sistema rotante) aparece la [[f1-rotante|fuerza de Coriolis]] $-2m\\vec\\Omega\\times\\vec v$. Para un cuerpo que cae, apunta hacia el **este** con módulo $2m\\Omega v\\cos\\lambda$.`,
            `Con $v = gt$: $a_E = 2\\Omega g t\\cos\\lambda$. Integrando dos veces, $x_E = \\frac13\\Omega g t^3\\cos\\lambda$, con $t = \\sqrt{2h/g} \\approx ${dn(t, 3)}$ s.`,
            `$x_E \\approx ${dn(100 * d, 3)}$ cm: chico, pero medible (lo midieron en el siglo XIX tirando cosas por pozos de mina).`],
          // verificación: caída simulada en 3D en el sistema local (x este, y norte, z arriba) con la fuerza de Coriolis completa
          verify: (() => { const c = Math.cos(rad(lat[1])), s = Math.sin(rad(lat[1])), W = [0, Om * c, Om * s];
            return { kind: "ode", f: (_, u) => { const v = u.slice(3), cx = [W[1] * v[2] - W[2] * v[1], W[2] * v[0] - W[0] * v[2], W[0] * v[1] - W[1] * v[0]];
              return [v[0], v[1], v[2], -2 * cx[0], -2 * cx[1], -g - 2 * cx[2]]; }, y0: [0, 0, h, 0, 0, 0], t1: 0, until: (_, u) => u[2] <= 0, g: (_, u) => u[2], dt: t / 20000, tmax: 2 * t, out: (_, u) => 100 * u[0], tol: 2e-3 }; })() };
      }
      const m = r.int(8, 20) * 100, vk = r.pick([60, 80, 100, 120]), v = vk / 3.6, F = 2 * m * Om * v * Math.abs(Math.sin(rad(lat[1])));
      if (Math.abs(lat[1]) < 5) return null;
      return { prompt: `Un auto de $${m}$ kg va hacia el norte a $${vk}$ km/h en ${lat[0]} (latitud $${dn(Math.abs(lat[1]), 1)}^\\circ$ ${lat[1] < 0 ? "S" : "N"}). ¿Cuánto vale la componente horizontal de la fuerza de Coriolis sobre el auto (en N)? ($\\Omega = 7{,}292\\times10^{-5}$ rad/s)`, answer: F,
        solution: [`[[f1-rotante|Fuerza de Coriolis]]: $\\vec F = -2m\\vec\\Omega\\times\\vec v$. Para movimiento horizontal, la parte horizontal vale $2m\\Omega v|\\sin\\lambda|$ y empuja hacia la ${lat[1] < 0 ? "izquierda (hemisferio sur)" : "derecha (hemisferio norte)"}.`,
          `$F = 2\\cdot${m}\\cdot7{,}292\\times10^{-5}\\cdot${dn(v, 2)}\\cdot|\\sin ${dn(lat[1], 1)}^\\circ| \\approx ${dn(F, 3)}$ N: casi nada frente al peso. En un huracán, que dura días y abarca cientos de km, sí decide el sentido de giro.`],
        // verificación: producto vectorial componente a componente en el sistema local y proyección horizontal
        verify: { kind: "value", tol: 1e-6, fn: () => { const W = [0, Om * Math.cos(rad(lat[1])), Om * Math.sin(rad(lat[1]))], vv = [0, v, 0];
          const cx = [W[1] * vv[2] - W[2] * vv[1], W[2] * vv[0] - W[0] * vv[2], W[0] * vv[1] - W[1] * vv[0]]; return 2 * m * Math.hypot(cx[0], cx[1]); } } };
    }
  };

  const cards = {
    "f1-noinercial": {
      title: "Sistemas no inerciales y fuerzas de inercia", aliases: ["sistema no inercial", "sistemas no inerciales", "fuerza de inercia", "fuerzas de inercia", "pseudofuerza", "pseudofuerzas", "gravedad efectiva", "peso aparente en un ascensor"], concepts: ["f1-noinercial"],
      summary: "En un sistema que acelera con a_O, las leyes de Newton valen si se agrega la fuerza de inercia −m a_O, que no tiene par de reacción.",
      def: [R`Un [[f1-relativo|sistema de referencia]] es **inercial** si en él vale la [[f1-newton|primera ley de Newton]]. Un sistema cuyo origen acelera con $\vec a_O$ respecto de uno inercial (sin rotar) es **no inercial**.`,
        R`Como $\vec a = \vec a' + \vec a_O$, la segunda ley vista desde el sistema acelerado queda $$m\vec a' = \sum\vec F - m\vec a_O.$$ El término $-m\vec a_O$ es la **fuerza de inercia** (o pseudofuerza): no la ejerce ningún cuerpo y **no tiene par de acción y reacción**.`,
        R`**Gravedad efectiva:** en el sistema acelerado, peso y fuerza de inercia se suman como si hubiera una gravedad $\vec g_{ef} = \vec g - \vec a_O$. Una plomada se alinea con $\vec g_{ef}$, y un péndulo oscila con $T = 2\pi\sqrt{L/g_{ef}}$.`],
      idea: [R`La fuerza de inercia es la forma de "contabilizar" desde adentro que el sistema acelera. Desde afuera (sistema inercial) no hay ninguna fuerza nueva: el pasajero que "se va para atrás" cuando arranca el colectivo, en realidad se queda donde estaba mientras el colectivo avanza.`,
        R`**Principio de equivalencia:** dentro de una caja cerrada, ningún experimento mecánico distingue una gravedad $g$ de una aceleración $g$ hacia arriba. En un ascensor en caída libre ($\vec a_O = \vec g$) la gravedad efectiva es cero: todo flota. Es el punto de partida de la relatividad general.`],
      demo: [R`**Paso 1 (posiciones).** Llamamos $O'$ al origen del sistema que acelera. Como sus ejes no giran, la posición del cuerpo vista desde el sistema inercial es la del origen $O'$ más la posición vista desde adentro: $\vec r = \vec R_O + \vec r\,'$.`,
        R`**Paso 2 (derivar dos veces).** En mecánica clásica el tiempo es el mismo para los dos observadores, así que podemos derivar término a término: $\vec v = \vec V_O + \vec v\,'$ y $\vec a = \vec a_O + \vec a\,'$.`,
        R`**Paso 3 (Newton donde vale).** La segunda ley solo vale en el sistema inercial: $\sum\vec F = m\vec a$. Reemplazamos $\vec a$ por lo del paso 2: $\sum\vec F = m\vec a_O + m\vec a\,'$.`,
        R`**Paso 4 (despejar).** $m\vec a\,' = \sum\vec F - m\vec a_O$. Desde adentro el cuerpo acelera como si, además de las fuerzas reales, actuara $-m\vec a_O$: esa es la fuerza de inercia. $\blacksquare$`],
      examples: [{ q: R`Una persona de 70 kg en un ascensor que sube acelerando a 2 m/s². ¿Qué marca la balanza (en N)?`, steps: [R`En el ascensor: $N - mg - ma = 0$, así que $N = m(g + a) = 70\cdot 11{,}8 = 826$ N.`, R`Se siente más pesada. Si el ascensor cayera libremente, $N = 0$.`] }],
      tips: [R`La fuerza de inercia apunta **opuesta a la aceleración** del sistema, no a su velocidad: en un colectivo que frena (va hacia adelante y acelera hacia atrás), apunta hacia adelante.`,
        R`Elegí un sistema y mantenelo: o resolvés todo desde afuera (sin fuerzas de inercia) o desde adentro (con ellas). Mezclar los dos es el error más común.`],
      see: ["f1-rotante", "f1-newton", "f1-relativo"]
    },
    "f1-rotante": {
      title: "Sistemas en rotación: fuerza centrífuga y de Coriolis", aliases: ["fuerza centrífuga", "fuerza de Coriolis", "Coriolis", "sistema rotante", "sistemas rotantes"], concepts: ["f1-rotante"],
      summary: "En un sistema que gira con Ω constante aparecen la fuerza centrífuga mΩ²r (hacia afuera del eje) y la de Coriolis −2m Ω×v′ (solo si el cuerpo se mueve respecto del sistema).",
      def: [R`Si el sistema gira con velocidad angular constante $\vec\Omega$ alrededor de un eje fijo, la segunda ley vista desde adentro es $$m\vec a\,' = \sum\vec F - m\vec\Omega\times(\vec\Omega\times\vec r\,') - 2m\vec\Omega\times\vec v\,'.$$`,
        R`**Fuerza centrífuga:** $-m\vec\Omega\times(\vec\Omega\times\vec r\,')$, de módulo $m\Omega^2\rho$ ($\rho$: distancia al eje), apunta hacia afuera del eje. Actúa aunque el cuerpo esté quieto en el sistema.`,
        R`**Fuerza de Coriolis:** $-2m\vec\Omega\times\vec v\,'$. Solo actúa sobre cuerpos que se mueven respecto del sistema rotante; es perpendicular a $\vec v\,'$, así que **no hace trabajo**.`],
      idea: [R`La centrífuga no es "la reacción de la centrípeta": la [[f1-dinamica-circular|fuerza centrípeta]] es una fuerza real (tensión, rozamiento, normal…) vista desde afuera; la centrífuga es una fuerza de inercia que aparece solo en el sistema que gira.`,
        R`En la Tierra ($\Omega = 7{,}29\times10^{-5}$ rad/s) la centrífuga hace que $g$ sea un poco menor en el ecuador y aplana el planeta; Coriolis desvía los vientos (hacia la izquierda en el hemisferio sur, hacia la derecha en el norte), hace girar los huracanes y el péndulo de Foucault.`,
        R`**Coriolis en una plataforma.** Una bolita que se aleja del centro pasa a zonas donde el piso se mueve más rápido ($\Omega r$). Vista desde la plataforma, se queda atrás y su camino se curva en sentido contrario al giro: esa curvatura es la fuerza de Coriolis.`],
      demo: [R`**Paso 1 (vectores que giran).** Un vector $\vec u$ fijo en el sistema que gira con $\vec\Omega$, visto desde el sistema inercial, cambia como $\frac{d\vec u}{dt} = \vec\Omega\times\vec u$: su punta describe una circunferencia con esa velocidad.`,
        R`**Paso 2 (regla de derivación).** Un vector cualquiera es $\vec A = \sum A_i'\,\hat e_i'$, con los versores del sistema que gira. Al derivar desde afuera cambian las componentes y también los versores (paso 1), así que $\left(\frac{d\vec A}{dt}\right)_{in} = \left(\frac{d\vec A}{dt}\right)_{rot} + \vec\Omega\times\vec A$.`,
        R`**Paso 3 (velocidad).** Aplicando la regla a la posición: $\vec v = \vec v\,' + \vec\Omega\times\vec r$.`,
        R`**Paso 4 (aceleración).** Aplicándola otra vez a $\vec v$, con $\vec\Omega$ constante: $\vec a = \vec a\,' + \vec\Omega\times\vec v\,' + \vec\Omega\times(\vec v\,' + \vec\Omega\times\vec r) = \vec a\,' + 2\vec\Omega\times\vec v\,' + \vec\Omega\times(\vec\Omega\times\vec r)$. El término de Coriolis aparece dos veces: una por la derivada de $\vec v\,'$ y otra por la de $\vec\Omega\times\vec r$.`,
        R`**Paso 5 (Newton).** Con $\sum\vec F = m\vec a$ y despejando: $m\vec a\,' = \sum\vec F - m\vec\Omega\times(\vec\Omega\times\vec r) - 2m\vec\Omega\times\vec v\,'$. El segundo término es la centrífuga y el tercero, Coriolis. $\blacksquare$`],
      examples: [{ q: R`Una moneda a 20 cm del centro de un disco que gira a 45 rpm. ¿Qué $\mu_e$ mínimo necesita para no deslizar?`, steps: [R`$\omega = 45\cdot\frac{2\pi}{60} \approx 4{,}71$ rad/s. En el disco, el rozamiento equilibra la centrífuga: $\mu_e mg \ge m\omega^2 r$.`, R`$\mu_e \ge \frac{\omega^2 r}{g} = \frac{22{,}2\cdot0{,}2}{9{,}8} \approx 0{,}45$.`] }],
      see: ["f1-noinercial", "f1-dinamica-circular", "f1-circular"]
    }
  };

  E.extendCourse("f101", {
    concepts: { "f1-noinercial": { name: "Sistemas no inerciales" }, "f1-rotante": { name: "Centrífuga y Coriolis" } },
    templates: T,
    units: [{
      id: "f1-noinercial-u", order: 11, program: "Extra UBA", title: "Sistemas no inerciales", icon: "rotate-ccw",
      diagnostic: ["f1-ascensor-num", "f1-plomada-num", "f1-silla-num"],
      lessons: [
        { id: "f1-noinercial", title: "Fuerzas de inercia", templates: ["f1-pseudo-mc", "f1-ascensor-num", "f1-plomada-num"], theory: ["f1-noinercial"],
          intro: R`En un sistema que acelera con $\vec a_O$ se agrega la fuerza de inercia $-m\vec a_O$. Gravedad efectiva: $\vec g_{ef} = \vec g - \vec a_O$.` },
        { id: "f1-rotante", title: "Centrífuga y Coriolis", templates: ["f1-desliza-vf", "f1-silla-num", "f1-coriolis-num"], theory: ["f1-rotante", "f1-noinercial"],
          intro: R`Girando con $\Omega$: centrífuga $m\Omega^2\rho$ hacia afuera y Coriolis $-2m\vec\Omega\times\vec v\,'$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  EXTRA UBA · ESTABILIDAD, PEQUEÑAS OSCILACIONES Y POTENCIAL EFECTIVO
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {}, g = 9.8;
  const dn = (x, d = 3) => String(num(x, d)).replace(".", "{,}");
  const periodOf = (f, y0, Test) => ({ kind: "ode", f, y0, t1: 0, until: (t, y) => t > 0.75 * Test && y[0] >= 0 && y[1] > 0, g: (_, y) => y[0], dt: Test / 20000, out: t => t, tol: 1e-4 });
  const dU = (U, x, h = 1e-6) => (U(x + h) - U(x - h)) / (2 * h);

  T["f1-peqosc-num"] = {
    type: "numeric", concepts: ["f1-estabilidad"], difficulty: 2,
    generate(r) {
      const v = r.pick(["doble", "coseno", "pozo"]), m = r.int(1, 8) / 2, U0 = r.int(1, 20), a = r.int(2, 10) / 10;
      let U, x0, k, tex, eq;
      if (v === "doble") { U = x => U0 * ((x / a) ** 4 - 2 * (x / a) ** 2); x0 = a; k = 8 * U0 / (a * a); tex = `U(x) = ${U0}\\left[\\left(\\frac{x}{${dn(a, 1)}}\\right)^4 - 2\\left(\\frac{x}{${dn(a, 1)}}\\right)^2\\right]`; eq = `x_0 = ${dn(a, 1)}`; }
      else if (v === "coseno") { U = x => -U0 * Math.cos(x / a); x0 = 0; k = U0 / (a * a); tex = `U(x) = -${U0}\\cos\\frac{x}{${dn(a, 1)}}`; eq = `x_0 = 0`; }
      else { U = x => -U0 / Math.cosh(x / a) ** 2; x0 = 0; k = 2 * U0 / (a * a); tex = `U(x) = -\\frac{${U0}}{\\cosh^2(x/${dn(a, 1)})}`; eq = `x_0 = 0`; }
      const w = Math.sqrt(k / m), Tp = 2 * Math.PI / w;
      return {
        prompt: `Una partícula de $${dn(m, 1)}$ kg se mueve en una dimensión con energía potencial $${tex}$ (U en J, x en m). ¿Cuál es el período (s) de las oscilaciones chicas alrededor del equilibrio estable${v === "doble" ? " con $x > 0$" : ""}?`,
        answer: Tp,
        solution: [
          `El equilibrio estable es un **mínimo** de $U$: $U'(x_0) = 0$, $U''(x_0) > 0$. Acá $${eq}$ ([[f1-estabilidad|estabilidad del equilibrio]]).`,
          `Cerca del mínimo, $U(x) \\approx U(x_0) + \\frac12U''(x_0)(x - x_0)^2$: es un [[f1-mas|oscilador armónico]] con $k_{ef} = U''(x_0) = ${dn(k, 3)}$ N/m.`,
          `$T = 2\\pi\\sqrt{\\frac{m}{k_{ef}}} \\approx ${dn(Tp, 4)}$ s.`
        ],
        // verificación: movimiento simulado con la fuerza −U′ calculada por diferencias finitas, con amplitud muy chica
        verify: periodOf((_, y) => [y[1], -dU(U, x0 + y[0]) / m], [0, 1e-4 * a * w], Tp)
      };
    }
  };
  T["f1-eqtipo-mc"] = {
    testN: 120, // simulación algo cara: menos instancias en los tests
    type: "mc", concepts: ["f1-estabilidad"], difficulty: 2,
    generate(r) {
      const [p, q] = r.distinct(2, -4, 5).sort((x, y) => x - y), kk = r.pick([1, 2, -1, -2]), want = r.pick(["estable", "inestable"]);
      const c = 6 * kk, U = x => c * (x ** 3 / 3 - (p + q) * x * x / 2 + p * q * x);
      // U'' = c(2x − p − q): en q (> p) vale c(q − p), positivo si c > 0
      const stable = kk > 0 ? q : p, unstable = kk > 0 ? p : q, ans = want === "estable" ? stable : unstable;
      if (p === 0 || q === 0) return null;
      const opts = [ans, want === "estable" ? unstable : stable, (p + q) / 2, 0, p + q, -ans];
      return {
        prompt: `Una partícula se mueve sobre el eje $x$ con energía potencial $U(x) = ${H.poly([[2 * kk, "x^{3}"], [-3 * kk * (p + q), "x^{2}"], [6 * kk * p * q, "x"]])}$ (en J, con x en m). ¿Dónde está su equilibrio **${want}**?`,
        ...H.mc(r, `x = ${dn(ans, 1)}`, opts.slice(1).map(x => `x = ${dn(x, 1)}`), { fallback: ["x = 10", "x = -10"] }),
        solution: [
          `Equilibrios: $U'(x) = ${6 * kk}(x${H.sg(-p)})(x${H.sg(-q)}) = 0$, o sea $x = ${p}$ y $x = ${q}$.`,
          `[[f1-estabilidad|Estabilidad]]: $U''(x) = ${6 * kk}(2x${p + q === 0 ? "" : H.sg(-(p + q))})$. Es estable donde $U'' > 0$ (mínimo de $U$) e inestable donde $U'' < 0$ (máximo).`,
          `$U''(${stable}) > 0$: estable en $x = ${stable}$; inestable en $x = ${unstable}$.`
        ],
        // verificación: se suelta la partícula (m = 1 kg) muy cerca de cada equilibrio y se ve si se queda cerca o se escapa
        verify: { kind: "truth", target: true, fn: () => {
          const stays = x0 => { let x = x0 + 1e-4, v = 0; const dt = 1e-4; for (let i = 0; i < 40000; i++) { v += -dU(U, x, 1e-5) * dt; x += v * dt; if (Math.abs(x - x0) > 1e-2) return false; } return true; };
          return want === "estable" ? stays(ans) && !stays(want === "estable" ? unstable : stable) : !stays(ans) && stays(stable);
        } }
      };
    }
  };
  T["f1-aro-vf"] = {
    testN: 40, // simulación algo cara: menos instancias en los tests
    type: "tf", concepts: ["f1-estabilidad"], difficulty: 3,
    generate(r) {
      const Rr = r.int(2, 10) / 10, fac = r.pick([0.5, 0.7, 0.85, 1.2, 1.5, 2]), w0 = Math.sqrt(g / Rr), w = fac * w0, q = r.pick(["fondo", "otro"]);
      const truth = q === "fondo" ? fac < 1 : fac > 1;
      return {
        prompt: `Una bolita está enhebrada sin rozamiento en un aro vertical de radio $${dn(Rr, 1)}$ m que gira alrededor de su diámetro vertical a $\\omega = ${dn(w, 2)}$ rad/s. <b>Verdadero o falso:</b> ${q === "fondo" ? "el punto más bajo del aro es un equilibrio estable" : "existe una posición de equilibrio estable fuera del punto más bajo"}. ($g = 9{,}8$ m/s²)`,
        answer: truth,
        explanation: `En el sistema del aro, con $\\theta$ medido desde abajo: $R\\theta'' = \\sin\\theta\\,(\\omega^2R\\cos\\theta - g)$. El fondo es estable solo si $\\omega^2 < \\frac gR$ (acá $\\frac gR = ${dn(w0 * w0, 2)}$ s⁻² y $\\omega^2 = ${dn(w * w, 2)}$ s⁻²). Si $\\omega^2 > \\frac gR$, el fondo se vuelve inestable y aparecen dos equilibrios estables en $\\cos\\theta = \\frac{g}{\\omega^2R}$ ([[f1-estabilidad]], [[f1-rotante|fuerza centrífuga]]).`,
        solution: [`Es una **bifurcación**: al pasar $\\omega$ por $\\sqrt{g/R}$, el mínimo del potencial efectivo se parte en dos.`],
        // verificación: se suelta la bolita casi en el fondo y se mide cuánto se aleja; si se aleja, se busca dónde termina oscilando
        verify: { kind: "truth", fn: () => {
          let th = 1e-3, v = 0, mx = 0; const dt = 2e-4 / w0;
          for (let i = 0; i < 2e5; i++) { v += Math.sin(th) * (w * w * Math.cos(th) - g / Rr) * dt; th += v * dt; mx = Math.max(mx, Math.abs(th)); }
          const bottomStable = mx < 1e-2;
          return q === "fondo" ? bottomStable : !bottomStable && mx < Math.PI - 0.1;
        } }
      };
    }
  };
  T["f1-apogeo-num"] = {
    testN: 120, // simulación algo cara: menos instancias en los tests
    type: "numeric", concepts: ["f1-potencial-efectivo"], difficulty: 3,
    generate(r) {
      const GM = 3.986e14, RT = 6.371e6, hp = r.pick([200, 300, 500, 800, 1000]) * 1000, rp = RT + hp, fac = r.pick([1.03, 1.05, 1.1, 1.15, 1.2, 1.3]);
      const vp = Math.round(fac * Math.sqrt(GM / rp)), ra = rp / (2 * GM / (rp * vp * vp) - 1), va = vp * rp / ra, ask = r.pick(["h", "v"]);
      const a = (rp + ra) / 2, Tp = 2 * Math.PI * Math.sqrt(a ** 3 / GM);
      return {
        prompt: `Un satélite pasa por el perigeo de su órbita a $${hp / 1000}$ km de altura con velocidad $${dn(vp / 1000, 3)}$ km/s. ¿${ask === "h" ? "A qué altura (km) está su apogeo" : "Qué velocidad (km/s) tiene en el apogeo"}? ($GM_T = 3{,}986\\times10^{14}$ m³/s², $R_T = 6371$ km)`,
        answer: ask === "h" ? (ra - RT) / 1000 : va / 1000,
        solution: [
          `Se conservan la energía y el [[f1-momento-angular|momento angular]]. En perigeo y apogeo la velocidad es perpendicular al radio: $r_pv_p = r_av_a$ ([[f1-potencial-efectivo|potencial efectivo]]).`,
          `$\\frac12v_p^2 - \\frac{GM}{r_p} = \\frac12v_a^2 - \\frac{GM}{r_a}$ con $v_a = \\frac{r_pv_p}{r_a}$ da $r_a = \\frac{r_p}{\\frac{2GM}{r_pv_p^2} - 1} \\approx ${dn(ra / 1000, 0)}$ km (desde el centro).`,
          ask === "h" ? `Altura del apogeo: $r_a - R_T \\approx ${dn((ra - RT) / 1000, 1)}$ km.` : `$v_a = \\frac{r_pv_p}{r_a} \\approx ${dn(va / 1000, 4)}$ km/s.`
        ],
        // verificación: se integra la órbita desde el perigeo hasta que la velocidad radial cambia de signo (apogeo)
        verify: { kind: "ode", f: (_, s) => { const r3 = Math.hypot(s[0], s[1]) ** 3; return [s[2], s[3], -GM * s[0] / r3, -GM * s[1] / r3]; }, y0: [rp, 0, 0, vp],
          t1: 0, until: (t, s) => t > 0.1 * Tp && s[0] * s[2] + s[1] * s[3] <= 0, g: (_, s) => s[0] * s[2] + s[1] * s[3], dt: Tp / 40000, tmax: Tp,
          out: (_, s) => (ask === "h" ? (Math.hypot(s[0], s[1]) - RT) / 1000 : Math.hypot(s[2], s[3]) / 1000), tol: 1e-4 }
      };
    }
  };

  const cards = {
    "f1-estabilidad": {
      title: "Estabilidad del equilibrio y pequeñas oscilaciones", aliases: ["equilibrio estable", "equilibrio inestable", "pequeñas oscilaciones", "curva de energía potencial", "bifurcación"], concepts: ["f1-estabilidad"],
      summary: "Con F = −U′(x): los equilibrios son los puntos con U′ = 0; son estables si U″ > 0. Cerca de un mínimo se oscila con ω = √(U″(x₀)/m).",
      def: [R`Si la fuerza es conservativa, $F(x) = -U'(x)$ ([[f1-energia|energía potencial]]). Un punto $x_0$ es de **equilibrio** si $U'(x_0) = 0$.`,
        R`Es **estable** si al apartarlo un poco la fuerza lo devuelve: $U''(x_0) > 0$ (mínimo de $U$). Es **inestable** si $U''(x_0) < 0$ (máximo). Si $U'' = 0$ hay que mirar términos de orden superior.`,
        R`**Pequeñas oscilaciones:** con el [[c2-taylor|desarrollo de Taylor]] $U(x) \approx U(x_0) + \frac12U''(x_0)(x - x_0)^2$, el movimiento cerca de un mínimo es un [[f1-mas|MAS]] con $$\omega = \sqrt{\frac{U''(x_0)}{m}}.$$`],
      idea: [R`Pensalo como una bolita en un paisaje con la forma de $U(x)$: se queda en los valles (estable) y se cae de las lomas (inestable). Con energía $E$, solo puede estar donde $U(x) \le E$; los puntos con $U = E$ son los **puntos de retorno**.`,
        { graph: { fns: [x => x ** 4 - 2 * x * x], xr: [-1.8, 1.8], yr: [-1.5, 2] }, caption: R`Doble pozo $U = x^4 - 2x^2$: mínimos estables en $x = \pm1$ y máximo inestable en $x = 0$.` },
        R`Casi todo sistema cerca de un equilibrio estable oscila armónicamente: por eso el [[f1-mas|oscilador armónico]] está en todos lados (moléculas, circuitos, estructuras).`],
      demo: [R`**Paso 1 (fuerza cerca del equilibrio).** Desarrollamos $U'$ alrededor de $x_0$ con Taylor a primer orden: $U'(x) \approx U'(x_0) + U''(x_0)(x - x_0)$. Como $x_0$ es equilibrio, $U'(x_0) = 0$, así que $F(x) = -U'(x) \approx -U''(x_0)(x - x_0)$.`,
        R`**Paso 2 (si U″ > 0).** La fuerza es proporcional al apartamiento y de signo contrario: es una fuerza de [[f1-hooke|Hooke]] con $k = U''(x_0)$. La ecuación $m\ddot x = -k(x - x_0)$ es la de un MAS con $\omega = \sqrt{k/m}$, y la partícula se queda cerca de $x_0$: equilibrio estable.`,
        R`**Paso 3 (si U″ < 0).** Con $\kappa = -U''(x_0) > 0$ queda $m\ddot x = \kappa(x - x_0)$, cuyas soluciones contienen $e^{\sqrt{\kappa/m}\,t}$: cualquier apartamiento, por chico que sea, crece exponencialmente. Equilibrio inestable. $\blacksquare$`],
      examples: [{ q: R`Una partícula de 2 kg con $U(x) = 3x^2 - x^3$ (J). ¿Período cerca del equilibrio estable?`, steps: [R`$U' = 6x - 3x^2 = 0$ en $x = 0$ y $x = 2$. $U'' = 6 - 6x$: $U''(0) = 6 > 0$ (estable), $U''(2) = -6$ (inestable).`, R`$\omega = \sqrt{6/2} = \sqrt3$ rad/s, $T = \frac{2\pi}{\sqrt3} \approx 3{,}63$ s.`] }],
      see: ["f1-mas", "f1-energia", "f1-potencial-efectivo", "f1-equilibrio"]
    },
    "f1-potencial-efectivo": {
      title: "Fuerzas centrales y potencial efectivo", aliases: ["potencial efectivo", "fuerza central", "fuerzas centrales", "perigeo", "apogeo", "órbita elíptica"], concepts: ["f1-potencial-efectivo"],
      summary: "Con fuerza central se conservan E y L. El movimiento radial es 1D con U_ef(r) = U(r) + L²/(2mr²): las órbitas circulares están en sus mínimos.",
      def: [R`Una **fuerza central** apunta siempre hacia (o desde) un centro fijo y depende solo de $r$. Su torque respecto del centro es nulo, así que se conserva el [[f1-momento-angular|momento angular]] $L = mr^2\dot\theta$ y el movimiento es plano.`,
        R`La energía se escribe $E = \frac12m\dot r^2 + U_{ef}(r)$ con el **potencial efectivo** $$U_{ef}(r) = U(r) + \frac{L^2}{2mr^2}.$$ El segundo término es la "barrera centrífuga": el radio se mueve como una partícula en 1D con ese potencial.`,
        R`**Gravitación:** $U = -\frac{GMm}{r}$. Si $E < 0$ la órbita es una elipse acotada entre el **perigeo** $r_p$ y el **apogeo** $r_a$, que son los puntos de retorno ($U_{ef} = E$). Si $E \ge 0$, la partícula escapa.`],
      idea: [R`En perigeo y apogeo la velocidad es perpendicular al radio, así que $L = mr_pv_p = mr_av_a$: el satélite va más rápido cuando está más cerca (es la segunda [[f1-orbitas|ley de Kepler]]).`,
        { graph: { fns: [r => -2 / r + 1 / (r * r)], xr: [0.25, 6], yr: [-1.3, 1.5] }, caption: R`$U_{ef}(r) = -\frac{2}{r} + \frac{1}{r^2}$: el mínimo es la órbita circular; con más energía, el radio oscila entre dos puntos de retorno.` }],
      demo: [R`**Paso 1 (velocidad en polares).** La velocidad tiene una parte radial $\dot r$ y una perpendicular $r\dot\theta$. Son perpendiculares, así que por Pitágoras $v^2 = \dot r^2 + r^2\dot\theta^2$.`,
        R`**Paso 2 (usar el momento angular).** La fuerza central no hace torque respecto del centro, así que $L = mr^2\dot\theta$ es constante. Despejamos $\dot\theta = \frac{L}{mr^2}$.`,
        R`**Paso 3 (reemplazar).** $\frac12mv^2 = \frac12m\dot r^2 + \frac12mr^2\frac{L^2}{m^2r^4} = \frac12m\dot r^2 + \frac{L^2}{2mr^2}$.`,
        R`**Paso 4 (energía).** Sumando $U(r)$: $E = \frac12m\dot r^2 + U_{ef}(r)$. Es la energía de una partícula en una dimensión (la coordenada $r$) con potencial $U_{ef}$, y por eso sus puntos de retorno son los $r$ con $U_{ef}(r) = E$. $\blacksquare$`],
      examples: [{ q: R`Un satélite en perigeo a $r_p = 7000$ km con $v_p = 8$ km/s. ¿$r_a$?`, steps: [R`$\frac{2GM}{r_pv_p^2} = \frac{7{,}972\times10^{14}}{7\times10^6\cdot6{,}4\times10^7} \approx 1{,}78$.`, R`$r_a = \frac{r_p}{1{,}78 - 1} \approx 8980$ km desde el centro.`] }],
      see: ["f1-orbitas", "f1-momento-angular", "f1-estabilidad"]
    }
  };

  E.extendCourse("f101", {
    concepts: { "f1-estabilidad": { name: "Estabilidad y pequeñas oscilaciones" }, "f1-potencial-efectivo": { name: "Fuerzas centrales y potencial efectivo" } },
    templates: T,
    units: [{
      id: "f1-estabilidad-u", order: 12, program: "Extra UBA", title: "Estabilidad y potencial efectivo", icon: "target",
      diagnostic: ["f1-peqosc-num", "f1-eqtipo-mc", "f1-apogeo-num"],
      lessons: [
        { id: "f1-estabilidad", title: "Equilibrio y pequeñas oscilaciones", templates: ["f1-eqtipo-mc", "f1-peqosc-num", "f1-aro-vf"], theory: ["f1-estabilidad"],
          intro: R`Equilibrio: $U'(x_0) = 0$. Estable si $U''(x_0) > 0$, y ahí $\omega = \sqrt{U''(x_0)/m}$.` },
        { id: "f1-potencial-efectivo", title: "Fuerzas centrales", templates: ["f1-apogeo-num"], theory: ["f1-potencial-efectivo"],
          intro: R`Se conservan $E$ y $L$. Radialmente: $U_{ef} = U(r) + \frac{L^2}{2mr^2}$. En perigeo y apogeo, $r_pv_p = r_av_a$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  EXTRA UBA · RELATIVIDAD ESPECIAL
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {};
  const dn = (x, d = 3) => String(num(x, d)).replace(".", "{,}");
  const gam = b => 1 / Math.sqrt(1 - b * b);
  // boost de Lorentz en coordenadas (ct, x) construido como exponencial de la rapidez (serie de Taylor de la matriz),
  // sin usar γ: sirve de camino independiente para verificar. toS(β) pasa de S′ (que se mueve a +β) a S.
  const expK = phi => { let M = [[1, 0], [0, 1]], P = [[1, 0], [0, 1]];
    for (let n = 1; n < 80; n++) { P = [[P[0][1] * phi / n, P[0][0] * phi / n], [P[1][1] * phi / n, P[1][0] * phi / n]]; M = [[M[0][0] + P[0][0], M[0][1] + P[0][1]], [M[1][0] + P[1][0], M[1][1] + P[1][1]]]; }
    return M; };
  const toS = b => expK(Math.atanh(b)), toP = b => expK(-Math.atanh(b));
  const app = (M, ev) => [M[0][0] * ev[0] + M[0][1] * ev[1], M[1][0] * ev[0] + M[1][1] * ev[1]];
  const BETAS = [0.5, 0.6, 0.8, 0.9, 0.95, 0.99, 0.995, 0.999];

  T["f1-dilatacion-num"] = {
    type: "numeric", concepts: ["f1-relatividad"], difficulty: 2,
    generate(r) {
      const v = r.pick(["particula", "viaje", "ritmo"]);
      if (v === "particula") {
        const [nm, tau, unit] = r.pick([["piones", 26e-9, "26\\ \\text{ns}"], ["muones", 2.2e-6, "2{,}2\\ \\mu\\text{s}"], ["kaones", 12.4e-9, "12{,}4\\ \\text{ns}"]]), b = r.pick(BETAS), c = 3e8, d = gam(b) * b * c * tau;
        return { prompt: `La vida media de los ${nm} en reposo es $${unit}$. ¿Qué distancia (m) recorren en promedio, medida en el laboratorio, si se mueven a $${dn(b, 3)}c$? ($c = 3\\times10^8$ m/s)`, answer: d,
          solution: [`La vida media es un [[f1-relatividad|tiempo propio]]: en el laboratorio se dilata a $\\gamma\\tau_0$, con $\\gamma = \\frac{1}{\\sqrt{1 - \\beta^2}} \\approx ${dn(gam(b), 3)}$.`,
            `$d = v\\,\\gamma\\tau_0 = ${dn(b, 3)}\\cdot3\\times10^8\\cdot${dn(gam(b), 3)}\\cdot\\tau_0 \\approx ${dn(d, 1)}$ m${b > 0.9 ? `, unas $${dn(gam(b), 1)}$ veces más de lo que daría la física clásica` : ""}.`],
          // verificación: el evento "decae" en el sistema de la partícula (ct′ = cτ, x′ = 0) llevado al laboratorio con el boost
          verify: { kind: "value", tol: 1e-6, fn: () => app(toS(b), [c * tau, 0])[1] } };
      }
      if (v === "viaje") {
        const D = r.pick([4.2, 8.6, 10, 25, 100]), b = r.pick(BETAS), tp = D / (b * gam(b));
        return { prompt: `Una nave viaja a $${dn(b, 3)}c$ hasta una estrella que está a $${dn(D, 1)}$ años luz de la Tierra (en el sistema de la Tierra). ¿Cuántos años pasan para los tripulantes durante el viaje?`, answer: tp,
          solution: [`Para la Tierra el viaje dura $\\frac{D}{v} = ${dn(D / b, 3)}$ años. Partida y llegada ocurren en el mismo lugar de la nave: los tripulantes miden el [[f1-relatividad|tiempo propio]].`,
            `$\\tau = \\frac{D/v}{\\gamma} = \\frac{${dn(D / b, 3)}}{${dn(gam(b), 3)}} \\approx ${dn(tp, 3)}$ años. (Para ellos la distancia está contraída en el mismo factor.)`],
          // verificación: el evento llegada (ct = D/β, x = D) llevado al sistema de la nave
          verify: { kind: "value", tol: 1e-6, fn: () => app(toP(b), [D / b, D])[0] } };
      }
      const f = r.pick([0.5, 0.25, 0.6, 0.8, 0.9, 0.1]), b = Math.sqrt(1 - f * f);
      return { prompt: `¿A qué velocidad (en unidades de $c$) tiene que moverse un reloj para que, visto desde la Tierra, avance a $${dn(f, 2)}$ veces el ritmo de los relojes terrestres?`, answer: b,
        solution: [`[[f1-relatividad|Dilatación del tiempo]]: el reloj en movimiento marca $\\Delta\\tau = \\frac{\\Delta t}{\\gamma}$, así que hace falta $\\frac1\\gamma = ${dn(f, 2)}$.`,
          `$\\sqrt{1 - \\beta^2} = ${dn(f, 2)} \\Rightarrow \\beta = \\sqrt{1 - ${dn(f * f, 4)}} \\approx ${dn(b, 4)}$.`],
        // verificación: un tic del reloj (ct′ = 1, x′ = 0) visto desde la Tierra tiene que durar 1/f
        verify: { kind: "zero", fn: bb => [1 / app(toS(bb), [1, 0])[0] - f], tol: 1e-6 } };
    }
  };
  T["f1-contraccion-num"] = {
    type: "numeric", concepts: ["f1-relatividad"], difficulty: 2,
    generate(r) {
      const v = r.pick(["L", "L", "beta"]);
      // largo en S de una regla de largo propio L0 en reposo en S′: posiciones de sus extremos en un mismo instante t = 0 de S
      const lengthInS = (L0, b) => { const M = toS(b), ctp = -M[0][1] * L0 / M[0][0]; return app(M, [ctp, L0])[1] - app(M, [0, 0])[1]; };
      if (v === "L") {
        const L0 = r.pick([20, 50, 100, 150, 300]), b = r.pick(BETAS), L = L0 / gam(b), obj = r.pick(["un tren", "una nave", "un colectivo"]);
        return { prompt: `${obj[0].toUpperCase() + obj.slice(1)} de largo propio $${L0}$ m pasa a $${dn(b, 3)}c$ frente a un observador. ¿Qué largo (m) le mide ese observador?`, answer: L,
          solution: [`[[f1-relatividad|Contracción de la longitud]]: el largo medido en el sistema donde el objeto se mueve es $L = \\frac{L_0}{\\gamma} = L_0\\sqrt{1 - \\beta^2}$.`,
            `$L = ${L0}\\sqrt{1 - ${dn(b * b, 6)}} \\approx ${dn(L, 3)}$ m. Solo se contrae en la dirección del movimiento.`],
          verify: { kind: "value", tol: 1e-6, fn: () => lengthInS(L0, b) } };
      }
      const f = r.pick([0.5, 0.25, 0.6, 0.8, 0.9]), b = Math.sqrt(1 - f * f);
      return { prompt: `¿A qué velocidad (en unidades de $c$) tiene que pasar una regla para que su largo medido sea $${dn(f, 2)}$ veces su largo propio?`, answer: b,
        solution: [`$\\frac{L}{L_0} = \\frac1\\gamma = \\sqrt{1 - \\beta^2} = ${dn(f, 2)}$ ([[f1-relatividad|contracción de la longitud]]).`, `$\\beta = \\sqrt{1 - ${dn(f * f, 4)}} \\approx ${dn(b, 4)}$.`],
        verify: { kind: "zero", fn: bb => [lengthInS(1, bb) - f], tol: 1e-6 } };
    }
  };
  T["f1-velrel-num"] = {
    type: "numeric", concepts: ["f1-lorentz"], difficulty: 2,
    generate(r) {
      const v = r.pick(["sonda", "naves"]);
      if (v === "sonda") {
        const V = r.pick([0.5, 0.6, 0.8, 0.9]), up = r.pick([0.3, 0.5, 0.7, 0.9, -0.5, -0.8]), u = (up + V) / (1 + up * V);
        if (Math.abs(u) < 0.05) return null;
        return { prompt: `Una nave se aleja de la Tierra a $${dn(V, 1)}c$ y lanza una sonda ${up > 0 ? "hacia adelante" : "hacia atrás"} a $${dn(Math.abs(up), 1)}c$ respecto de la nave. ¿Cuál es la velocidad de la sonda respecto de la Tierra, en unidades de $c$ (positiva si se aleja de la Tierra)?`, answer: u,
          solution: [`[[f1-lorentz|Suma relativista de velocidades]]: $u = \\frac{u' + V}{1 + u'V/c^2}$, con $u' = ${dn(up, 1)}c$ y $V = ${dn(V, 1)}c$.`,
            `$u = \\frac{${dn(up + V, 2)}}{1 ${up * V < 0 ? "-" : "+"} ${dn(Math.abs(up * V), 2)}}c \\approx ${dn(u, 4)}c$. ${up > 0 ? "Nunca supera $c$, aunque la suma clásica daría $" + dn(up + V, 1) + "c$." : ""}`],
          // verificación: dos eventos de la línea de universo de la sonda en S′, llevados a S con el boost
          verify: { kind: "value", tol: 1e-6, fn: () => { const a = app(toS(V), [0, 0]), b2 = app(toS(V), [1, up]); return (b2[1] - a[1]) / (b2[0] - a[0]); } } };
      }
      const b1 = r.pick([0.5, 0.6, 0.7, 0.8, 0.9, 0.95]), b2 = r.pick([0.5, 0.6, 0.7, 0.8, 0.9, 0.95]), u = (b1 + b2) / (1 + b1 * b2);
      return { prompt: `Dos naves se acercan de frente: respecto de la Tierra, una va a $${dn(b1, 2)}c$ hacia la derecha y la otra a $${dn(b2, 2)}c$ hacia la izquierda. ¿A qué velocidad (en unidades de $c$) ve acercarse a la otra cada tripulación?`, answer: u,
        solution: [`Desde la primera nave, la Tierra se aleja a $${dn(b1, 2)}c$ hacia la izquierda, y la otra nave va a $${dn(b2, 2)}c$ hacia la izquierda respecto de la Tierra: hay que componer esas dos velocidades con la [[f1-lorentz|suma relativista de velocidades]].`,
          `$u = \\frac{${dn(b1, 2)} + ${dn(b2, 2)}}{1 + ${dn(b1, 2)}\\cdot${dn(b2, 2)}}c \\approx ${dn(u, 4)}c$, menor que $c$ (la suma clásica daría $${dn(b1 + b2, 2)}c$).`],
        // verificación: la línea de universo de la segunda nave (x = −β₂ ct en la Tierra) vista desde la primera
        verify: { kind: "value", tol: 1e-6, fn: () => { const M = toP(b1), a = app(M, [0, 0]), q = app(M, [1, -b2]); return -(q[1] - a[1]) / (q[0] - a[0]); } } };
    }
  };
  T["f1-simult-vf"] = {
    type: "tf", concepts: ["f1-lorentz"], difficulty: 3,
    generate(r) {
      const v = r.pick(["rayos", "causal"]);
      if (v === "rayos") {
        const L = r.pick([100, 200, 500, 1000]), b = r.pick([0.3, 0.5, 0.8, 0.9]), q = r.pick(["B", "A", "simult"]);
        return { prompt: `Caen dos rayos a la vez (según el andén) en los extremos A y B de un andén de $${L}$ m. Un tren pasa a $${dn(b, 1)}c$ yendo de A hacia B. <b>Verdadero o falso:</b> para los pasajeros del tren, ${q === "B" ? "el rayo en B cae antes que el rayo en A" : q === "A" ? "el rayo en A cae antes que el rayo en B" : "los dos rayos también son simultáneos"}.`,
          answer: q === "B",
          explanation: `[[f1-relatividad|Relatividad de la simultaneidad]]: con las [[f1-lorentz|transformaciones de Lorentz]], $\\Delta t' = \\gamma\\left(\\Delta t - \\frac{V\\Delta x}{c^2}\\right)$. Con $\\Delta t = 0$ y $\\Delta x = x_B - x_A > 0$, queda $t'_B - t'_A < 0$: para el tren **B ocurre primero**, por $\\frac{\\gamma V L}{c^2} \\approx ${dn(gam(b) * b * L / 3e8 * 1e9, 1)}$ ns.`,
          solution: [`Eventos simultáneos en un sistema y separados en el espacio no son simultáneos en otro sistema que se mueve en esa dirección: el de adelante pasa primero.`],
          // verificación: los dos eventos (en metros: ct = 0, x = 0 y x = L) llevados al sistema del tren con el boost
          verify: { kind: "truth", fn: () => { const tA = app(toP(b), [0, 0])[0], tB = app(toP(b), [0, L])[0]; return q === "B" ? tB < tA - 1e-9 : q === "A" ? tA < tB - 1e-9 : Math.abs(tA - tB) < 1e-9; } } };
      }
      const dt = r.int(1, 10), dx = r.int(1, 20) / 2, unit = r.pick(["años luz y años", "segundos luz y segundos"]);
      if (Math.abs(dx - dt) < 0.4) return null;
      const [ul, ut] = unit === "años luz y años" ? ["años luz", "años"] : ["segundos luz", "s"];
      return { prompt: `Un evento B ocurre $${dt}$ ${ut} después que un evento A y a $${dn(dx, 1)}$ ${ul} de distancia (en el sistema de la Tierra). <b>Verdadero o falso:</b> algún observador inercial ve que B ocurre antes que A.`,
        answer: dx > dt,
        explanation: `Depende del [[f1-lorentz|intervalo espaciotemporal]] $s^2 = (c\\Delta t)^2 - \\Delta x^2 = ${dn(dt * dt - dx * dx, 2)}$ (en ${ul}²). ${dx > dt ? "Es negativo (separación **espacial**): la luz no llega de A a B, no puede haber relación causal y el orden temporal depende del observador. Basta moverse a $V > c\\,\\Delta t/\\Delta x$." : "Es positivo (separación **temporal**): A puede causar B y **todos** los observadores los ven en el mismo orden."}`,
        solution: [`El orden de dos eventos solo puede invertirse si $|\\Delta x| > c|\\Delta t|$.`],
        // verificación: se prueban muchos boosts entre −0,999c y 0,999c y se mira si alguno invierte el orden
        verify: { kind: "truth", fn: () => { for (let k = -999; k <= 999; k += 3) { const M = toP(k / 1000), tA = app(M, [0, 0])[0], tB = app(M, [dt, dx])[0]; if (tB < tA) return true; } return false; } } };
    }
  };
  T["f1-erel-num"] = {
    testN: 120, // simulación algo cara: menos instancias en los tests
    type: "numeric", concepts: ["f1-dinamica-rel"], difficulty: 2,
    generate(r) {
      const [nm, mc2] = r.pick([["un electrón", 0.511], ["un protón", 938.3]]), b = r.pick(BETAS.concat([0.1, 0.3])), ask = r.pick(["K", "p", "E"]);
      const G = gam(b), ans = { K: (G - 1) * mc2, p: G * b * mc2, E: G * mc2 }[ask];
      return {
        prompt: `${nm[0].toUpperCase() + nm.slice(1)} ($mc^2 = ${dn(mc2, 3)}$ MeV) se mueve a $${dn(b, 3)}c$. ¿Cuánto vale su ${{ K: "energía cinética (MeV)", p: "cantidad de movimiento (en MeV/c)", E: "energía total (MeV)" }[ask]}?`,
        answer: ans,
        solution: [
          `[[f1-dinamica-rel|Dinámica relativista]]: $\\gamma = \\frac{1}{\\sqrt{1 - \\beta^2}} \\approx ${dn(G, 4)}$, $E = \\gamma mc^2$, $p = \\gamma mv$, $K = (\\gamma - 1)mc^2$.`,
          `$${{ K: "K", p: "pc", E: "E" }[ask]} \\approx ${dn(ans, 4)}$ MeV.${ask === "K" && b <= 0.3 ? ` (La fórmula clásica $\\frac12mv^2$ daría $${dn(0.5 * b * b * mc2, 4)}$ MeV: a baja velocidad casi coinciden.)` : ""}`
        ],
        // verificación: se acelera la partícula desde el reposo con fuerza constante (dp/dt = F), con v = p/√(m² + p²/c²),
        // hasta que llega a β; el trabajo F·x es la energía cinética. Unidades: c = 1, m = 1, F = 1.
        verify: { kind: "ode", f: (_, y) => [1, y[0] / Math.sqrt(1 + y[0] * y[0])], y0: [0, 0], t1: 0,
          until: (_, y) => y[0] / Math.sqrt(1 + y[0] * y[0]) >= b, g: (_, y) => y[0] / Math.sqrt(1 + y[0] * y[0]) - b, dt: b * G / 40000, tmax: 1e3,
          out: (_, y) => ({ K: y[1], p: y[0], E: y[1] + 1 }[ask]) * mc2, tol: 1e-4 }
      };
    }
  };

  const cards = {
    "f1-relatividad": {
      title: "Relatividad especial: postulados, tiempo y longitud", aliases: ["relatividad especial", "dilatación del tiempo", "contracción de la longitud", "factor de Lorentz", "tiempo propio", "longitud propia", "relatividad de la simultaneidad"], concepts: ["f1-relatividad"],
      summary: "Las leyes de la física y c son iguales en todo sistema inercial. Consecuencia: los relojes en movimiento atrasan (Δt = γΔτ) y las longitudes se contraen (L = L₀/γ).",
      def: [R`**Postulados (Einstein, 1905):** 1) las leyes de la física son las mismas en todos los sistemas inerciales; 2) la velocidad de la luz en el vacío, $c \approx 3\times10^8$ m/s, es la misma para todos, sin importar el movimiento de la fuente.`,
        R`**Factor de Lorentz:** $\gamma = \frac{1}{\sqrt{1 - v^2/c^2}} \ge 1$.`,
        R`**Dilatación del tiempo:** el **tiempo propio** $\Delta\tau$ es el que mide un reloj presente en los dos eventos (que ocurren en el mismo lugar para él). Cualquier otro observador inercial mide $\Delta t = \gamma\Delta\tau$, más largo.`,
        R`**Contracción de la longitud:** la **longitud propia** $L_0$ se mide en el sistema donde el objeto está quieto. Moviéndose a $v$ en la dirección de su largo, se mide $L = \frac{L_0}{\gamma}$.`,
        R`**Simultaneidad:** dos eventos simultáneos en un sistema y separados en la dirección del movimiento no son simultáneos en otro.`],
      idea: [R`**Reloj de luz:** un pulso rebota entre dos espejos a distancia $d$. Quieto, cada tic dura $2d/c$. Visto moverse, el pulso recorre diagonales más largas a la misma velocidad $c$: cada tic dura más. Esa es toda la dilatación del tiempo.`,
        R`**Muones:** se crean a unos 15 km de altura y viven $2{,}2\ \mu$s en reposo: a $0{,}999c$ recorrerían clásicamente 660 m. Llegan al suelo porque, para nosotros, su reloj atrasa ($\gamma \approx 22$); para ellos, la atmósfera está contraída. Es la confirmación experimental más clásica.`,
        R`Para $v \ll c$, $\gamma \approx 1 + \frac{v^2}{2c^2}$: todo se reduce a la mecánica de Newton y la [[f1-relativo|velocidad relativa]] de Galileo.`],
      demo: [R`**Paso 1 (reloj en reposo).** En el sistema del reloj, el pulso de luz sube y baja entre espejos separados por $d$: cada tic dura $\Delta\tau = \frac{2d}{c}$.`,
        R`**Paso 2 (visto en movimiento).** Para quien ve el reloj moverse a $v$, durante medio tic $\frac{\Delta t}{2}$ los espejos avanzan $\frac{v\Delta t}{2}$, y el pulso recorre la hipotenusa de un triángulo de catetos $d$ y $\frac{v\Delta t}{2}$. La distancia $d$ es perpendicular al movimiento y no cambia.`,
        R`**Paso 3 (segundo postulado).** La luz va a $c$ también en este sistema, así que la hipotenusa mide $\frac{c\Delta t}{2}$: $\left(\frac{c\Delta t}{2}\right)^2 = d^2 + \left(\frac{v\Delta t}{2}\right)^2$.`,
        R`**Paso 4 (despejar).** $\Delta t^2(c^2 - v^2) = 4d^2$, así que $\Delta t = \frac{2d/c}{\sqrt{1 - v^2/c^2}} = \gamma\Delta\tau$.`,
        R`**Paso 5 (contracción).** Una regla de largo propio $L_0$ pasa a velocidad $v$ frente a un reloj quieto en $S$. Ese reloj está en los dos eventos (pasa la punta, pasa la cola) y mide el tiempo propio $\Delta\tau = \frac{L}{v}$, donde $L$ es el largo en $S$. Para la regla, el reloj recorre $L_0$ en $\Delta t' = \frac{L_0}{v}$, que por el paso 4 vale $\gamma\Delta\tau$. Igualando: $\frac{L_0}{v} = \gamma\frac{L}{v}$, o sea $L = \frac{L_0}{\gamma}$. $\blacksquare$`],
      examples: [{ q: R`Un reloj atrasa 1 s por día respecto de uno terrestre. ¿A qué velocidad viaja?`, steps: [R`$1 - \frac1\gamma = \frac{1}{86400}$. Como $v \ll c$: $\frac{v^2}{2c^2} \approx 1{,}16\times10^{-5}$.`, R`$\frac vc \approx 4{,}8\times10^{-3}$, o sea $v \approx 1440$ km/s.`] }],
      tips: [R`Antes de usar $\gamma$, preguntate **quién mide el tiempo propio** (el que está en los dos eventos) y **quién la longitud propia** (el que ve el objeto quieto). Ahí se decide si multiplicar o dividir.`],
      see: ["f1-lorentz", "f1-dinamica-rel", "f1-relativo"]
    },
    "f1-lorentz": {
      title: "Transformaciones de Lorentz e intervalo", aliases: ["transformaciones de Lorentz", "transformación de Lorentz", "suma relativista de velocidades", "intervalo espaciotemporal", "cono de luz", "diagrama de Minkowski"], concepts: ["f1-lorentz"],
      summary: "x′ = γ(x − Vt), t′ = γ(t − Vx/c²). Las velocidades se componen como u = (u′ + V)/(1 + u′V/c²). El intervalo s² = c²Δt² − Δx² es el mismo para todos.",
      def: [R`Si $S'$ se mueve a velocidad $V$ en la dirección $x$ respecto de $S$ (con orígenes coincidentes en $t = t' = 0$): $$x' = \gamma(x - Vt), \qquad t' = \gamma\left(t - \frac{Vx}{c^2}\right), \qquad y' = y,\ z' = z.$$ La inversa se obtiene cambiando $V$ por $-V$.`,
        R`**Suma de velocidades:** si un cuerpo se mueve a $u'$ en $S'$, en $S$ se mueve a $$u = \frac{u' + V}{1 + u'V/c^2}.$$ Si $u' = c$, da $u = c$: nada material supera a la luz.`,
        R`**Intervalo:** $s^2 = (c\Delta t)^2 - \Delta x^2 - \Delta y^2 - \Delta z^2$ vale lo mismo en todo sistema inercial. Si $s^2 > 0$ (separación **temporal**) los eventos pueden estar causalmente conectados y su orden es el mismo para todos; si $s^2 < 0$ (separación **espacial**), el orden depende del observador.`],
      idea: [R`Una transformación de Lorentz es una "rotación hiperbólica" del espacio-tiempo: con la rapidez $\varphi$ definida por $\tanh\varphi = V/c$, queda $ct' = ct\cosh\varphi - x\sinh\varphi$ y $x' = -ct\sinh\varphi + x\cosh\varphi$. Las rapideces se **suman** al componer boosts, y por eso las velocidades se componen con la fórmula de arriba.`,
        R`En un **diagrama de Minkowski** ($ct$ vertical, $x$ horizontal) la luz va a $45^\circ$. Lo que está dentro del **cono de luz** de un evento es su pasado o futuro causal.`],
      demo: [R`**Paso 1 (la partícula en S′).** Si se mueve a $u'$ y pasa por el origen en $t' = 0$, todos sus eventos cumplen $x' = u't'$.`,
        R`**Paso 2 (llevarla a S).** Usamos la transformación inversa (la misma con $V$ cambiado por $-V$): $x = \gamma(x' + Vt') = \gamma t'(u' + V)$ y $t = \gamma\left(t' + \frac{Vx'}{c^2}\right) = \gamma t'\left(1 + \frac{u'V}{c^2}\right)$.`,
        R`**Paso 3 (dividir).** La velocidad en $S$ es $u = \frac xt$; el factor $\gamma t'$ se simplifica y queda $u = \frac{u' + V}{1 + u'V/c^2}$.`,
        R`**Paso 4 (la luz).** Si $u' = c$: $u = \frac{c + V}{1 + V/c} = c$. La luz va a $c$ en los dos sistemas, como pide el segundo postulado. $\blacksquare$`],
      examples: [{ q: R`Dos naves se acercan, cada una a $0{,}8c$ respecto de la Tierra. ¿Velocidad relativa?`, steps: [R`$u = \frac{0{,}8 + 0{,}8}{1 + 0{,}64}c = \frac{1{,}6}{1{,}64}c \approx 0{,}976c$.`] }],
      see: ["f1-relatividad", "f1-dinamica-rel"]
    },
    "f1-dinamica-rel": {
      title: "Energía y cantidad de movimiento relativistas", aliases: ["energía relativista", "energía en reposo", "momento relativista", "equivalencia masa-energía"], concepts: ["f1-dinamica-rel"],
      summary: "p = γmv, E = γmc², K = (γ − 1)mc² y E² = (pc)² + (mc²)². En reposo, E = mc².",
      def: [R`Para que la [[f1-momento|cantidad de movimiento]] se conserve en todos los sistemas inerciales, hay que definir $\vec p = \gamma m\vec v$. La segunda ley queda $\vec F = \frac{d\vec p}{dt}$.`,
        R`**Energía:** $E = \gamma mc^2$. En reposo vale $E_0 = mc^2$ (**energía en reposo**). La energía cinética es $K = E - mc^2 = (\gamma - 1)mc^2$.`,
        R`**Relación energía-momento:** $E^2 = (pc)^2 + (mc^2)^2$. Para la luz ($m = 0$), $E = pc$.`],
      idea: [R`Para $v \ll c$: $K = (\gamma - 1)mc^2 \approx \frac12mv^2 + \frac38\frac{mv^4}{c^2} + \dots$; el primer término es la energía cinética de Newton.`,
        R`Una fuerza constante no lleva un cuerpo a $c$: $p = Ft$ crece sin límite, pero $v = \frac{pc}{\sqrt{(mc)^2 + p^2}}$ se acerca a $c$ sin alcanzarla.`,
        R`$E = mc^2$ explica la energía de las estrellas y de los reactores: en la fusión o la fisión, los productos tienen un poco menos de masa que los reactivos, y esa diferencia sale como energía.`],
      demo: [R`**Paso 1 (restar cuadrados).** Con $E = \gamma mc^2$ y $p = \gamma mv$: $E^2 - (pc)^2 = \gamma^2m^2c^4 - \gamma^2m^2v^2c^2 = \gamma^2m^2c^4\left(1 - \frac{v^2}{c^2}\right)$.`,
        R`**Paso 2 (definición de γ).** $\gamma^2\left(1 - \frac{v^2}{c^2}\right) = 1$, así que $E^2 - (pc)^2 = (mc^2)^2$, que no depende de la velocidad.`,
        R`**Paso 3 (cuánto cambia E con p).** Derivando $E = \sqrt{(pc)^2 + (mc^2)^2}$: $\frac{dE}{dp} = \frac{pc^2}{E} = \frac{\gamma mvc^2}{\gamma mc^2} = v$.`,
        R`**Paso 4 (trabajo).** Con $\vec F = \frac{d\vec p}{dt}$, el trabajo en un tramo $dx = v\,dt$ es $F\,dx = \frac{dp}{dt}v\,dt = v\,dp = dE$ (paso 3). El trabajo de la fuerza va todo a $E$.`,
        R`**Paso 5 (energía cinética).** Partiendo del reposo, donde $E = mc^2$, el trabajo total es $K = E - mc^2 = (\gamma - 1)mc^2$. $\blacksquare$`],
      examples: [{ q: R`¿Qué energía cinética tiene un electrón ($mc^2 = 0{,}511$ MeV) a $0{,}99c$?`, steps: [R`$\gamma = \frac{1}{\sqrt{1 - 0{,}9801}} \approx 7{,}09$.`, R`$K = (7{,}09 - 1)\cdot0{,}511 \approx 3{,}11$ MeV.`] }],
      see: ["f1-relatividad", "f1-momento", "f1-energia"]
    }
  };

  E.extendCourse("f101", {
    concepts: { "f1-relatividad": { name: "Dilatación y contracción" }, "f1-lorentz": { name: "Transformaciones de Lorentz" }, "f1-dinamica-rel": { name: "Dinámica relativista" } },
    templates: T,
    units: [{
      id: "f1-relatividad-u", order: 13, program: "Extra UBA", title: "Relatividad especial", icon: "clock",
      diagnostic: ["f1-dilatacion-num", "f1-velrel-num", "f1-erel-num"],
      lessons: [
        { id: "f1-relatividad", title: "Tiempo propio y longitud propia", templates: ["f1-dilatacion-num", "f1-contraccion-num"], theory: ["f1-relatividad"],
          intro: R`$\gamma = \frac{1}{\sqrt{1 - v^2/c^2}}$. Dilatación: $\Delta t = \gamma\Delta\tau$. Contracción: $L = L_0/\gamma$.` },
        { id: "f1-lorentz", title: "Lorentz y simultaneidad", templates: ["f1-velrel-num", "f1-simult-vf"], theory: ["f1-lorentz", "f1-relatividad"],
          intro: R`$t' = \gamma(t - Vx/c^2)$: la simultaneidad es relativa. Velocidades: $u = \frac{u' + V}{1 + u'V/c^2}$.` },
        { id: "f1-dinamica-rel", title: "Energía relativista", templates: ["f1-erel-num"], theory: ["f1-dinamica-rel"],
          intro: R`$E = \gamma mc^2$, $p = \gamma mv$, $K = (\gamma - 1)mc^2$, $E^2 = (pc)^2 + (mc^2)^2$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  EXTRA UBA · SISTEMAS DE MASA VARIABLE (COHETE, CINTA Y CADENA)
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {}, g = 9.8;
  const dn = (x, d = 3) => String(num(x, d)).replace(".", "{,}");
  // cohete con RK4 propio (para los V/F): estado [v, m]; devuelve la velocidad al agotar el combustible
  const burn = (m0, mf, u, mu, gg) => {
    const tb = (m0 - mf) / mu, n = 4000, h = tb / n, f = y => [u * mu / y[1] - gg, -mu];
    let y = [0, m0];
    for (let i = 0; i < n; i++) {
      const k1 = f(y), k2 = f(y.map((v, j) => v + k1[j] * h / 2)), k3 = f(y.map((v, j) => v + k2[j] * h / 2)), k4 = f(y.map((v, j) => v + k3[j] * h));
      y = y.map((v, j) => v + h / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
    }
    return y[0];
  };

  T["f1-cohete-num"] = {
    type: "numeric", concepts: ["f1-cohete"], difficulty: 2,
    generate(r) {
      const v = r.pick(["dv", "comb", "u"]), mf = r.int(2, 30) * 100, frac = r.pick([0.5, 0.6, 0.7, 0.75, 0.8, 0.85, 0.9]);
      const m0 = Math.round(mf / (1 - frac) / 100) * 100, u = r.int(15, 45) * 100, dv = u * Math.log(m0 / mf);
      if (v === "dv") return {
        prompt: `Un cohete en el espacio, lejos de todo, parte del reposo con una masa total de $${m0}$ kg, de la que $${m0 - mf}$ kg son combustible. Los gases salen a $${u}$ m/s respecto del cohete. ¿Qué velocidad (m/s) tiene cuando se termina el combustible?`,
        answer: dv,
        solution: [`Sin fuerzas externas vale la [[f1-cohete|ecuación del cohete]]: $\\Delta v = u\\ln\\frac{m_0}{m_f}$, que no depende de cuán rápido se queme el combustible.`,
          `$m_f = ${m0} - ${m0 - mf} = ${mf}$ kg, así que $\\Delta v = ${u}\\ln\\frac{${m0}}{${mf}} \\approx ${dn(dv, 1)}$ m/s.`],
        // verificación: se integra m dv/dt = u·μ con un caudal arbitrario hasta quemar todo
        verify: { kind: "ode", f: (_, y) => [u * 3 / y[1], -3], y0: [0, m0], t1: (m0 - mf) / 3, dt: (m0 - mf) / 3 / 4000, out: (_, y) => y[0], tol: 1e-5 }
      };
      const target = Math.round(dv / 10) * 10, burned = m0 * (1 - Math.exp(-target / u));
      if (v === "comb") return {
        prompt: `Una sonda de $${m0}$ kg en total (con el combustible incluido) quiere cambiar su velocidad en $${target}$ m/s en el espacio. Sus gases salen a $${u}$ m/s respecto de la sonda. ¿Cuántos kg de combustible tiene que quemar?`,
        answer: burned,
        solution: [`De $\\Delta v = u\\ln\\frac{m_0}{m_f}$ ([[f1-cohete|ecuación del cohete]]): $m_f = m_0e^{-\\Delta v/u} = ${m0}\\,e^{-${target}/${u}} \\approx ${dn(m0 - burned, 1)}$ kg.`,
          `Combustible: $m_0 - m_f \\approx ${dn(burned, 1)}$ kg.`],
        // verificación: se quema combustible a caudal fijo hasta que la velocidad llega al Δv pedido
        verify: { kind: "ode", f: (_, y) => [u * 2 / y[1], -2], y0: [0, m0], t1: 0, until: (_, y) => y[0] >= target, g: (_, y) => y[0] - target, dt: m0 / 2 / 40000, tmax: m0, out: (_, y) => m0 - y[1], tol: 1e-4 }
      };
      return {
        prompt: `En una prueba en el espacio, un cohete de $${m0}$ kg quema $${m0 - mf}$ kg de combustible y su velocidad aumenta $${dn(dv, 1)}$ m/s. ¿A qué velocidad (m/s) salen los gases respecto del cohete?`,
        answer: u,
        solution: [`De la [[f1-cohete|ecuación del cohete]]: $u = \\frac{\\Delta v}{\\ln(m_0/m_f)} = \\frac{${dn(dv, 1)}}{\\ln(${m0}/${mf})} \\approx ${u}$ m/s.`],
        // verificación: se prueba esa velocidad de escape en la ecuación de movimiento y se compara el Δv
        verify: { kind: "zero", fn: a => { const t1 = (m0 - mf) / 5, n = 4000, h = t1 / n; let vv = 0, m = m0; for (let i = 0; i < n; i++) { const mm = m - 5 * h / 2; vv += h / 6 * (a * 5 / m + 4 * a * 5 / mm + a * 5 / (m - 5 * h)); m -= 5 * h; } return (vv - dv) / dv; }, tol: 1e-3 }
      };
    }
  };
  T["f1-cohete-grav-num"] = {
    type: "numeric", concepts: ["f1-cohete"], difficulty: 3,
    generate(r) {
      const m0 = r.int(4, 30) * 100, frac = r.pick([0.5, 0.6, 0.7, 0.8]), u = r.int(18, 35) * 100, tb = r.int(4, 16) * 5, ask = r.pick(["v", "h", "a"]);
      const mfuel = frac * m0, mf = m0 - mfuel, mu = mfuel / tb;
      if (u * mu < 1.3 * m0 * g) return null;
      const vb = u * Math.log(m0 / mf) - g * tb, hb = u * (tb - mf / mu * Math.log(m0 / mf)) - g * tb * tb / 2, a0 = u * mu / m0 - g;
      const ans = ask === "v" ? vb : ask === "h" ? hb : a0;
      return {
        prompt: `Un cohete de $${m0}$ kg despega verticalmente desde el reposo. Lleva $${dn(mfuel, 0)}$ kg de combustible, que quema a ritmo constante en $${tb}$ s, y los gases salen a $${u}$ m/s respecto del cohete. Despreciando el aire, ${ask === "v" ? "¿qué velocidad (m/s) tiene al apagarse los motores?" : ask === "h" ? "¿a qué altura (m) está al apagarse los motores?" : "¿qué aceleración (m/s²) tiene al despegar?"} ($g = 9{,}8$ m/s²)`,
        answer: ans,
        solution: [`Caudal: $\\mu = \\frac{${dn(mfuel, 0)}}{${tb}} = ${dn(mu, 2)}$ kg/s. Empuje: $u\\mu = ${dn(u * mu, 0)}$ N ([[f1-cohete|ecuación del cohete]] con gravedad): $m\\frac{dv}{dt} = u\\mu - mg$.`,
          ask === "a" ? `Al despegar $m = ${m0}$ kg: $a_0 = \\frac{u\\mu}{m_0} - g = ${dn(u * mu / m0, 3)} - 9{,}8 \\approx ${dn(a0, 3)}$ m/s².`
            : `Integrando con $m(t) = m_0 - \\mu t$: $v(t) = u\\ln\\frac{m_0}{m_0 - \\mu t} - gt$. Al apagar ($m_f = ${dn(mf, 0)}$ kg): $v = ${u}\\ln\\frac{${m0}}{${dn(mf, 0)}} - 9{,}8\\cdot${tb} \\approx ${dn(vb, 1)}$ m/s.`,
          ...(ask === "h" ? [`Integrando otra vez: $h = u\\left[t_b - \\frac{m_f}{\\mu}\\ln\\frac{m_0}{m_f}\\right] - \\frac12gt_b^2 \\approx ${dn(hb, 0)}$ m.`] : [])],
        // verificación: se integra (h, v, m) con RK4; la aceleración inicial sale de un paso muy corto
        verify: ask === "a"
          ? { kind: "ode", f: (_, y) => [y[1], u * mu / y[2] - g, -mu], y0: [0, 0, m0], t1: 1e-3, dt: 1e-5, out: (t, y) => y[1] / t, tol: 1e-3 }
          : { kind: "ode", f: (_, y) => [y[1], u * mu / y[2] - g, -mu], y0: [0, 0, m0], t1: tb, dt: tb / 4000, out: (_, y) => ask === "v" ? y[1] : y[0], tol: 1e-5 }
      };
    }
  };
  T["f1-cohete-vf"] = {
    type: "tf", concepts: ["f1-cohete"], difficulty: 2,
    generate(r) {
      const m0 = r.int(5, 20) * 100, mf = m0 * r.pick([0.2, 0.25, 0.3, 0.4]), u = r.int(20, 40) * 100;
      const S = [
        { s: "en el espacio libre, la velocidad final del cohete no depende de lo rápido que se queme el combustible", why: R`$\Delta v = u\ln\frac{m_0}{m_f}$ solo depende de las masas inicial y final y de $u$.`,
          fn: () => Math.abs(burn(m0, mf, u, (m0 - mf) / 10, 0) - burn(m0, mf, u, (m0 - mf) / 100, 0)) < 1e-6 * u },
        { s: "despegando desde la Tierra, quemar el mismo combustible más rápido deja al cohete con más velocidad al apagar los motores", why: R`Con gravedad, $v_f = u\ln\frac{m_0}{m_f} - gt_b$: cuanto más corto el encendido, menos velocidad se pierde contra la gravedad (siempre que el empuje supere al peso).`,
          fn: () => burn(m0, mf, u, (m0 - mf) / 20, g) > burn(m0, mf, u, (m0 - mf) / 60, g) },
        { s: "si se duplica la masa de combustible (con la misma estructura), la velocidad final en el espacio se duplica", why: R`$\Delta v$ crece con el **logaritmo** de $m_0/m_f$: duplicar el combustible da bastante menos que el doble.`,
          fn: () => Math.abs(burn(mf + 2 * (m0 - mf), mf, u, 5, 0) / burn(m0, mf, u, 5, 0) - 2) < 1e-6 },
        { s: "si los gases salen al doble de velocidad, la velocidad final en el espacio se duplica", why: R`$\Delta v = u\ln\frac{m_0}{m_f}$ es proporcional a $u$.`,
          fn: () => Math.abs(burn(m0, mf, 2 * u, 5, 0) / burn(m0, mf, u, 5, 0) - 2) < 1e-6 },
        { s: "con empuje constante en el espacio, la aceleración del cohete se mantiene constante", why: R`$a = \frac{u\mu}{m}$: el empuje es constante pero la masa baja, así que la aceleración **crece**.`,
          fn: () => { const mu = (m0 - mf) / 50, a1 = burn(m0, m0 - mu * 0.01, u, mu, 0) / 0.01, a2 = (burn(m0, mf, u, mu, 0) - burn(m0, mf + mu * 0.01, u, mu, 0)) / 0.01; return Math.abs(a2 / a1 - 1) < 1e-3; } }
      ];
      const k = r.pick(S), truth = k.fn();
      return {
        prompt: `Un cohete de $${m0}$ kg, con $${dn(m0 - mf, 0)}$ kg de combustible, expulsa los gases a $${u}$ m/s respecto de sí mismo. <b>Verdadero o falso:</b> ${k.s}.`,
        answer: truth,
        explanation: `${k.why} ([[f1-cohete]])`,
        solution: [`Todo sale de $m\\frac{dv}{dt} = u\\mu + F_{ext}$, con $\\mu = -\\frac{dm}{dt}$.`],
        // verificación: cada afirmación se chequea integrando la ecuación del cohete con RK4
        verify: { kind: "truth", fn: k.fn }
      };
    }
  };
  T["f1-cinta-num"] = {
    type: "numeric", concepts: ["f1-masa-variable"], difficulty: 2,
    generate(r) {
      const lam = r.int(2, 40) / 2, v = r.int(5, 40) / 10, ask = r.pick(["F", "P", "Q"]);
      const ans = ask === "F" ? lam * v : ask === "P" ? lam * v * v : lam * v * v / 2;
      return {
        prompt: `Sobre una cinta transportadora horizontal que avanza a $${dn(v, 1)}$ m/s cae arena verticalmente, a razón de $${dn(lam, 1)}$ kg/s. ${ask === "F" ? "¿Qué fuerza horizontal (N) hay que hacer sobre la cinta para que mantenga su velocidad?" : ask === "P" ? "¿Qué potencia (W) tiene que entregar el motor?" : "¿Cuánta energía por segundo (W) se disipa en el roce entre la arena y la cinta?"}`,
        answer: ans,
        solution: [`La arena llega sin velocidad horizontal y termina a $v$: por segundo hay que darle una [[f1-momento|cantidad de movimiento]] $\\lambda v$. Fuerza: $F = \\lambda v = ${dn(lam * v, 3)}$ N ([[f1-masa-variable|sistema de masa variable]]).`,
          ...(ask === "F" ? [] : [`Potencia del motor: $P = Fv = \\lambda v^2 = ${dn(lam * v * v, 3)}$ W.`]),
          ...(ask === "Q" ? [`La energía cinética de la arena crece $\\frac12\\lambda v^2$ por segundo: solo la mitad. La otra mitad, $\\frac12\\lambda v^2 = ${dn(ans, 3)}$ W, se disipa en el roce mientras la arena patina.`] : [])],
        // verificación: se simula un granito que patina sobre la cinta con roce μ = 0,4 hasta alcanzarla;
        // impulso, trabajo de la cinta y calor por kilo, multiplicados por el caudal
        verify: { kind: "value", fn: () => {
          const a = 0.4 * g, dt = 1e-5; let vp = 0, J = 0, W = 0;
          while (vp < v) { const h = Math.min(dt, (v - vp) / a); J += a * h; W += a * v * h; vp += a * h; }
          return lam * (ask === "F" ? J : ask === "P" ? W : W - vp * vp / 2);
        }, tol: 1e-6 }
      };
    }
  };
  T["f1-cadena-num"] = {
    type: "numeric", concepts: ["f1-masa-variable"], difficulty: 3,
    generate(r) {
      const L = r.int(4, 30) / 10, lam = r.int(2, 30) / 10, x = Math.round(L * r.pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.75]) * 100) / 100, ask = r.pick(["N", "fac"]);
      const N = 3 * lam * g * x;
      return {
        prompt: `Una cadena flexible de $${dn(L, 1)}$ m y $${dn(lam, 1)}$ kg/m cuelga vertical con su extremo inferior tocando una balanza, y se la suelta. ${ask === "N" ? `¿Qué fuerza (N) marca la balanza cuando ya cayeron $${dn(x, 2)}$ m de cadena sobre ella?` : `Cuando ya cayeron $${dn(x, 2)}$ m de cadena, ¿cuántas veces el peso de la cadena que está sobre la balanza marca la balanza?`} ($g = 9{,}8$ m/s²)`,
        answer: ask === "N" ? N : 3,
        solution: [`La parte que todavía cae está en caída libre: después de caer $x$ tiene $v^2 = 2gx$.`,
          `Por segundo llega a la balanza una masa $\\lambda v$ con velocidad $v$, que se frena: eso suma una fuerza $\\lambda v^2 = 2\\lambda gx$ ([[f1-masa-variable|sistema de masa variable]]).`,
          `Más el peso de lo que ya está apoyado, $\\lambda gx$: $N = 3\\lambda gx${ask === "N" ? ` = ${dn(N, 3)}$ N` : "$, el triple de ese peso"}.`],
        // verificación: impulso total sobre la cadena entera, N − λLg = dP/dt, con P(t) = −λ(L − x)·gt derivado numéricamente
        verify: { kind: "value", fn: () => {
          const ts = Math.sqrt(2 * x / g), P = t => -lam * (L - g * t * t / 2) * g * t, h = 1e-5;
          const Nn = lam * L * g + (P(ts + h) - P(ts - h)) / (2 * h);
          return ask === "N" ? Nn : Nn / (lam * g * x);
        }, tol: 1e-6 }
      };
    }
  };

  const cards = {
    "f1-cohete": {
      title: "Ecuación del cohete", aliases: ["ecuación del cohete", "cohete", "Tsiolkovsky", "empuje del cohete"], concepts: ["f1-cohete"],
      summary: "Un cohete que expulsa gases a velocidad u respecto de sí mismo gana Δv = u ln(m₀/m_f) en el espacio. Con gravedad: m dv/dt = uμ − mg.",
      def: [R`Un cohete expulsa masa a un ritmo $\mu = -\frac{dm}{dt}$, con velocidad $u$ **respecto del cohete**. El **empuje** es $u\mu$, y la ecuación de movimiento es $$m\frac{dv}{dt} = u\mu + F_{ext}.$$`,
        R`Sin fuerzas externas, integrando: $$\Delta v = u\ln\frac{m_0}{m_f}.$$ Con gravedad y $\mu$ constante, a la velocidad se le resta $gt$: $v(t) = u\ln\frac{m_0}{m_0 - \mu t} - gt$.`],
      idea: [R`El cohete no "empuja contra el aire": se impulsa por conservación de la [[f1-momento|cantidad de movimiento]], tirando masa para atrás. Por eso anda en el vacío.`,
        R`El logaritmo es la mala noticia: para duplicar $\Delta v$ hay que **elevar al cuadrado** la razón de masas. Por eso los cohetes son casi todo combustible y se hacen en etapas, que van soltando los tanques vacíos.`],
      demo: [R`**Paso 1 (antes).** En el instante $t$, el cohete con su combustible tiene masa $m$ y velocidad $v$: cantidad de movimiento $mv$.`,
        R`**Paso 2 (después de dt).** Expulsó una masa $dm_e = -dm > 0$ que sale a $v - u$ (velocidad $u$ hacia atrás respecto del cohete), y el cohete quedó con masa $m + dm$ y velocidad $v + dv$. Total: $(m + dm)(v + dv) + (-dm)(v - u)$.`,
        R`**Paso 3 (conservación).** Sin fuerzas externas, las dos cantidades son iguales. Desarrollando y tachando $mv$: $m\,dv + v\,dm + dm\,dv - v\,dm + u\,dm = 0$. El producto $dm\,dv$ es de segundo orden y se descarta: $m\,dv = -u\,dm$.`,
        R`**Paso 4 (integrar).** $dv = -u\frac{dm}{m}$, y entre $m_0$ y $m_f$: $\Delta v = -u(\ln m_f - \ln m_0) = u\ln\frac{m_0}{m_f}$.`,
        R`**Paso 5 (con fuerza externa).** Si actúa $F_{ext}$, el cambio de cantidad de movimiento en $dt$ es $F_{ext}dt$ en lugar de cero: $m\,dv = -u\,dm + F_{ext}dt$, o sea $m\frac{dv}{dt} = u\mu + F_{ext}$. $\blacksquare$`],
      examples: [{ q: R`Un cohete de 1000 kg con 800 kg de combustible y $u = 2500$ m/s, en el espacio. ¿$\Delta v$?`, steps: [R`$m_f = 200$ kg, $\frac{m_0}{m_f} = 5$.`, R`$\Delta v = 2500\ln5 \approx 4024$ m/s.`] }],
      tips: [R`$u$ es relativa al cohete, no al suelo. Y $m_f$ es la masa **final** (estructura y carga), no la del combustible.`],
      see: ["f1-momento", "f1-masa-variable", "f1-newton"]
    },
    "f1-masa-variable": {
      title: "Sistemas de masa variable", aliases: ["masa variable", "sistema de masa variable", "cinta transportadora", "cadena que cae"], concepts: ["f1-masa-variable"],
      summary: "Si a un cuerpo se le agrega masa que llega con velocidad w, F_ext = m dv/dt + (v − w) dm/dt. Cinta: F = λv y P = λv², la mitad se disipa. Cadena sobre balanza: N = 3λgx.",
      def: [R`Un **sistema de masa variable** gana o pierde masa con el tiempo. La [[f1-newton|segunda ley]] $F = ma$ no vale tal cual, porque la masa que entra o sale trae su propia [[f1-momento|cantidad de movimiento]].`,
        R`Si al cuerpo (velocidad $v$) se le pega masa que llega con velocidad $w$ a ritmo $\frac{dm}{dt}$: $$F_{ext} = m\frac{dv}{dt} + (v - w)\frac{dm}{dt}.$$ El [[f1-cohete|cohete]] es el caso en que la masa sale, con $v - w = u$.`,
        R`**Cinta transportadora** a $v$ constante, con arena que cae a $\lambda$ kg/s: $F = \lambda v$ y $P = \lambda v^2$. **Cadena que cae** sobre una balanza: con $x$ metros ya apoyados, la balanza marca $N = 3\lambda gx$.`],
      idea: [R`En la cinta, el motor entrega $\lambda v^2$ pero la arena solo gana $\frac12\lambda v^2$ de energía cinética: la otra mitad se va en calor mientras la arena patina. Es la misma mitad que se pierde en un [[f1-choques|choque plástico]], porque eso es: cada grano choca plásticamente con la cinta.`,
        R`En la cadena, la balanza tiene que sostener lo que ya está apoyado **y además frenar** lo que llega: eso suma el doble del peso apoyado.`],
      demo: [R`**Paso 1 (balance en dt).** Antes: cuerpo $mv$ más la masa $dm$ que llega, $w\,dm$. Después: todo junto, $(m + dm)(v + dv)$. El impulso externo es la diferencia: $F_{ext}dt = (m + dm)(v + dv) - mv - w\,dm \approx m\,dv + (v - w)\,dm$, descartando $dm\,dv$.`,
        R`**Paso 2 (cinta).** La cinta va a $v$ constante ($dv = 0$) y la arena llega con $w = 0$ horizontal: $F = v\frac{dm}{dt} = \lambda v$. La potencia es $Fv = \lambda v^2$.`,
        R`**Paso 3 (dónde va la energía).** Por segundo, la arena gana $\frac12\lambda v^2$ de energía cinética. La diferencia, $\lambda v^2 - \frac12\lambda v^2 = \frac12\lambda v^2$, la disipa el roce mientras cada grano patina hasta alcanzar a la cinta.`,
        R`**Paso 4 (cadena).** La parte que cae está en caída libre (la cadena es flexible y no hay tensión). Al caer $x$, su velocidad cumple $v^2 = 2gx$. Por segundo llega a la balanza la masa $\lambda v$, que se frena desde $v$ a 0: la balanza le hace la fuerza extra $\lambda v\cdot v = \lambda v^2 = 2\lambda gx$ (paso 1 con $v = 0$ para lo apoyado).`,
        R`**Paso 5 (sumar).** Además sostiene el peso de lo apoyado, $\lambda gx$: $N = 2\lambda gx + \lambda gx = 3\lambda gx$. $\blacksquare$`],
      examples: [{ q: R`Una cinta a 2 m/s recibe 5 kg/s de grava. ¿Fuerza y potencia?`, steps: [R`$F = \lambda v = 10$ N.`, R`$P = \lambda v^2 = 20$ W, de los que 10 W se disipan.`] }],
      see: ["f1-cohete", "f1-momento", "f1-choques"]
    }
  };

  E.extendCourse("f101", {
    concepts: { "f1-cohete": { name: "Ecuación del cohete" }, "f1-masa-variable": { name: "Sistemas de masa variable" } },
    templates: T,
    units: [{
      id: "f1-masavar-u", order: 14, program: "Extra UBA", title: "Sistemas de masa variable", icon: "flame",
      diagnostic: ["f1-cohete-num", "f1-cohete-grav-num", "f1-cinta-num"],
      lessons: [
        { id: "f1-cohete", title: "El cohete", templates: ["f1-cohete-num", "f1-cohete-vf", "f1-cohete-grav-num"], theory: ["f1-cohete"],
          intro: R`$m\frac{dv}{dt} = u\mu + F_{ext}$. En el espacio: $\Delta v = u\ln\frac{m_0}{m_f}$.` },
        { id: "f1-masa-variable", title: "Cintas y cadenas", templates: ["f1-cinta-num", "f1-cadena-num"], theory: ["f1-masa-variable"],
          intro: R`$F_{ext} = m\frac{dv}{dt} + (v - w)\frac{dm}{dt}$. Cinta: $F = \lambda v$. Cadena sobre balanza: $N = 3\lambda gx$.` }
      ]
    }],
    cards
  });
})();
