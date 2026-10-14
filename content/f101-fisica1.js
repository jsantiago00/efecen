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
      demo: [R`**Producto.** $(x + \Delta x)(y + \Delta y) = xy + x\Delta y + y\Delta x + \Delta x\Delta y$.`, R`Despreciando el término de segundo orden, $\Delta(xy) = x\Delta y + y\Delta x$, y dividiendo por $xy$: $\frac{\Delta(xy)}{xy} = \frac{\Delta x}{x} + \frac{\Delta y}{y}$. $\blacksquare$`],
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
      examples: [{ q: R`Caminás 3 km al este y 4 km al norte. ¿Desplazamiento?`, steps: [R`$\vec R = (3, 4)$ km, $|\vec R| = 5$ km.`, R`Dirección: $\arctan\frac43 \approx 53^\circ$ al norte del este.`] }],
      see: ["f1-mruv", "f1-proyectiles"]
    },
    "f1-mruv": {
      title: "Movimiento rectilíneo: velocidad, aceleración y caída libre", aliases: ["MRUV", "MRU", "caída libre", "aceleración constante", "velocidad media", "velocidad instantánea", "desplazamiento"], concepts: ["f1-mruv"],
      summary: "v = dx/dt, a = dv/dt. Con a constante: x = x₀ + v₀t + ½at² y v² = v₀² + 2aΔx.",
      def: [R`**Velocidad media:** $v_m = \frac{\Delta x}{\Delta t}$. **Instantánea:** $v = \frac{dx}{dt}$, la [[derivada]] de la posición. **Aceleración:** $a = \frac{dv}{dt}$.`,
        R`**Aceleración constante (MRUV):** $$v = v_0 + at, \qquad x = x_0 + v_0 t + \tfrac12 a t^2, \qquad v^2 = v_0^2 + 2a\,\Delta x.$$ **Caída libre:** es un MRUV con $a = -g$ (eje $y$ hacia arriba), $g \approx 9{,}8$ m/s².`],
      idea: [R`En el gráfico $x(t)$ la velocidad es la pendiente; en el $v(t)$, la aceleración es la pendiente y el **área** bajo la curva es el desplazamiento. Por eso las fórmulas del MRUV salen de [[antiderivada|integrar]] dos veces una aceleración constante.`],
      demo: [R`De $\frac{dv}{dt} = a$ constante: $v(t) = v_0 + at$. Integrando de nuevo: $x(t) = x_0 + v_0 t + \frac12 a t^2$.`, R`Despejando $t = \frac{v - v_0}{a}$ y reemplazando sale $v^2 = v_0^2 + 2a(x - x_0)$. $\blacksquare$`],
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
      demo: [R`**Alcance desde el suelo.** $y = 0$ en $t = \frac{2v_0\sin\theta}{g}$. Entonces $R = v_0\cos\theta\cdot\frac{2v_0\sin\theta}{g} = \frac{v_0^2\sin 2\theta}{g}$ (con $\sin 2\theta = 2\sin\theta\cos\theta$). $\blacksquare$`],
      examples: [{ q: R`Una pelota sale a 20 m/s y $30^\circ$ desde el suelo. ¿Altura máxima?`, steps: [R`$v_{0y} = 10$ m/s.`, R`$h = \frac{v_{0y}^2}{2g} = \frac{100}{19{,}6} \approx 5{,}1$ m.`] }],
      see: ["f1-mruv", "f1-vectores"]
    },
    "f1-circular": {
      title: "Movimiento circular", aliases: ["movimiento circular", "MCU", "aceleración centrípeta", "velocidad angular"], concepts: ["f1-circular"],
      summary: "En el MCU la rapidez es constante pero hay aceleración hacia el centro: a = v²/R = ω²R.",
      def: [R`**MCU:** $v = \omega R$, período $T = \frac{2\pi}{\omega} = \frac{2\pi R}{v}$, frecuencia $f = \frac1T$. La **aceleración centrípeta** apunta al centro y vale $$a_c = \frac{v^2}{R} = \omega^2 R.$$`],
      idea: [R`La velocidad es un vector: aunque su módulo no cambie, cambia su dirección, y eso es aceleración. Si además la rapidez cambia, se suma una aceleración **tangencial** $a_t = \frac{dv}{dt}$. Lo que **produce** la aceleración centrípeta es alguna fuerza real: ver [[f1-dinamica-circular]].`],
      demo: [R`Con $\vec r(t) = R(\cos\omega t, \sin\omega t)$: $\vec v = R\omega(-\sin\omega t, \cos\omega t)$ y $\vec a = -R\omega^2(\cos\omega t, \sin\omega t) = -\omega^2\vec r$.`, R`Apunta al centro y su módulo es $\omega^2 R = \frac{v^2}{R}$. $\blacksquare$`],
      examples: [{ q: R`La Luna tarda 27,3 días en orbitar a $3{,}84\times10^8$ m. ¿Aceleración centrípeta?`, steps: [R`$\omega = \frac{2\pi}{27{,}3\cdot 86400} \approx 2{,}66\times10^{-6}$ rad/s.`, R`$a = \omega^2 R \approx 2{,}7\times10^{-3}$ m/s² (es la gravedad terrestre a esa distancia).`] }],
      see: ["f1-dinamica-circular"]
    },
    "f1-relativo": {
      title: "Movimiento relativo", aliases: ["movimiento relativo", "velocidad relativa", "sistema de referencia", "sistemas de referencia"], concepts: ["f1-relativo"],
      summary: "Las velocidades medidas desde distintos sistemas se suman: v(A/C) = v(A/B) + v(B/C).",
      def: [R`Si $B$ se mueve respecto de $C$: $$\vec v_{A/C} = \vec v_{A/B} + \vec v_{B/C}.$$ (Vale para velocidades mucho menores que la de la luz.)`],
      idea: [R`Una lancha en un río: su velocidad respecto de la tierra es la suya respecto del agua más la de la corriente. Para cruzar en el menor tiempo se apunta perpendicular a la orilla (y la corriente la arrastra); para cruzar en línea recta hay que apuntar río arriba.`,
        R`Un **sistema inercial** es uno donde vale la primera ley de Newton. Dos sistemas que se mueven con velocidad constante uno respecto del otro son ambos inerciales.`],
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
      examples: [{ q: R`¿Con qué aceleración baja un bloque por un plano a $30^\circ$ con $\mu_k = 0{,}2$?`, steps: [R`$a = 9{,}8(0{,}5 - 0{,}2\cdot 0{,}866) \approx 3{,}2$ m/s².`] }],
      tips: [R`El rozamiento estático **no** vale siempre $\mu_s N$: ese es solo su máximo. Un bloque quieto sobre una mesa sin otras fuerzas horizontales tiene rozamiento cero.`],
      see: ["f1-newton", "f1-dinamica-circular"]
    },
    "f1-hooke": {
      title: "Fuerza elástica: ley de Hooke", aliases: ["ley de Hooke", "fuerza elástica", "constante elástica", "constante del resorte"], concepts: ["f1-hooke"],
      summary: "Un resorte estirado o comprimido x hace una fuerza F = −kx, hacia su posición natural.",
      def: [R`$$F = -kx$$ donde $x$ es el estiramiento respecto de la longitud natural y $k$ la **constante elástica** (N/m). El signo menos indica que la fuerza se opone a la deformación (es restauradora).`],
      idea: [R`Vale para deformaciones chicas: casi todo material se comporta así cerca del equilibrio, y por eso los resortes aparecen en todos lados. La fuerza restauradora lineal es lo que produce el movimiento armónico simple, y la energía guardada en el resorte es $\frac12kx^2$ (ver energía).`],
      examples: [{ q: R`Un resorte se estira 5 cm con 2 kg colgados. ¿$k$?`, steps: [R`$k = \frac{mg}{x} = \frac{2\cdot 9{,}8}{0{,}05} = 392$ N/m.`] }],
      see: ["f1-newton"]
    },
    "f1-dinamica-circular": {
      title: "Dinámica del movimiento circular", aliases: ["fuerza centrípeta", "dinámica circular", "curva peraltada", "rulo"], concepts: ["f1-dinamica-circular"],
      summary: "La suma de fuerzas hacia el centro es m v²/R. La 'fuerza centrípeta' no es una fuerza nueva: la hace la tensión, la normal, el rozamiento o la gravedad.",
      def: [R`Para un cuerpo en movimiento circular, la componente radial de la segunda ley es $$\sum F_{\text{hacia el centro}} = m\frac{v^2}{R} = m\omega^2 R.$$`],
      idea: [R`Ejemplos: en una curva plana la fuerza hacia el centro es el [[f1-rozamiento|rozamiento]] ($v_{\max} = \sqrt{\mu_s g R}$); en una órbita, la gravedad; en una piedra atada, la tensión. La "fuerza centrífuga" que sentís en un auto es la inercia vista desde un sistema no inercial.`,
        R`En un rulo vertical, arriba el peso alcanza para girar si $v^2 = gR$: es la velocidad mínima para no despegarse.`],
      examples: [{ q: R`Una piedra de 0,2 kg gira en un círculo horizontal de 0,5 m a 3 m/s. ¿Tensión?`, steps: [R`$T = \frac{mv^2}{R} = \frac{0{,}2\cdot 9}{0{,}5} = 3{,}6$ N (si el círculo es horizontal y despreciamos el peso).`] }],
      see: ["f1-circular", "f1-newton"]
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
