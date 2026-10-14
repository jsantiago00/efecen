/*
 * F102B · Física General II B — Lic. en Ciencias Básicas (FCEN, UNCuyo), Plan Ord. 77/15 C.S.
 * ==========================================================================================
 * Temario: programa oficial 2026 de Física General II B (F102B), 8 unidades:
 *   1 Temperatura y calor · 2 Propiedades térmicas de la materia · 3 Primera ley de la termodinámica
 *   4 Segunda ley de la termodinámica · 5 Ondas mecánicas y electromagnéticas · 6 Óptica geométrica
 *   7 Interferencia · 8 Difracción
 *
 * Constantes: R = 8,314 J/(mol K), k_B = 1,381e-23 J/K, N_A = 6,022e23, σ = 5,67e-8 W/(m² K⁴), c = 3e8 m/s.
 * Verificaciones independientes en los tests: simulaciones de intercambio de calor, ciclos de Carnot
 * armados con sus cuatro procesos, integrales de p dV y de dQ/T, trazado de rayos con matrices ABCD,
 * diferencias de camino óptico exactas, cuerdas vibrantes por diferencias finitas.
 * Ids con prefijo "f2b-". Todo el texto y los ejercicios son originales.
 */
(function () {
  window.Efecen.registerCourse({ id: "f102b", code: "F102B", title: "Física General II B", icon: "zap" });
})();

/* =====================================================================
 *  UNIDAD 1 · TEMPERATURA Y CALOR
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {};
  const dec = x => String(x).replace(".", "{,}");
  const C_AGUA = 4186, C_HIELO = 2100, LF = 3.34e5, LV = 2.26e6, SIGMA = 5.67e-8;

  T["f2b-escala-num"] = {
    type: "numeric", concepts: ["f2b-temperatura"], difficulty: 1,
    generate(r) {
      const v = r.pick(["c-f", "f-c", "c-k", "k-c"]);
      if (v === "c-f") { const c = r.int(-40, 120); return { prompt: `Expresá $${c}\\,^\\circ$C en grados Fahrenheit.`, answer: 1.8 * c + 32, solution: [`$T_F = \\frac95T_C + 32$ ([[f2b-temperatura|escalas de temperatura]]).`, `$= 1{,}8\\cdot${H.par(c)} + 32 = ${num(1.8 * c + 32, 3)}\\,^\\circ$F.`],
        verify: { kind: "value", fn: () => 32 + (212 - 32) * (c - 0) / (100 - 0) } }; }
      if (v === "f-c") { const f = r.int(-40, 220); return { prompt: `Expresá $${f}\\,^\\circ$F en grados Celsius.`, answer: (f - 32) / 1.8, solution: [`$T_C = \\frac59(T_F - 32)$ ([[f2b-temperatura]]).`, `$= \\frac59(${f} - 32) \\approx ${num((f - 32) / 1.8, 3)}\\,^\\circ$C.`],
        verify: { kind: "value", fn: () => 100 * (f - 32) / (212 - 32) } }; }
      if (v === "c-k") { const c = r.int(-200, 400); return { prompt: `Expresá $${c}\\,^\\circ$C en kelvin.`, answer: c + 273.15, solution: [`$T_K = T_C + 273{,}15$ ([[f2b-temperatura|escala Kelvin]]).`, `$${num(c + 273.15, 2)}$ K.`],
        verify: { kind: "value", fn: () => (c - -273.15) } }; }
      const k = r.int(10, 700); return { prompt: `Expresá $${k}$ K en grados Celsius.`, answer: k - 273.15, solution: [`$T_C = T_K - 273{,}15$ ([[f2b-temperatura]]).`, `$${num(k - 273.15, 2)}\\,^\\circ$C.`],
        verify: { kind: "value", fn: () => k + -273.15 } };
    }
  };
  T["f2b-dilatacion-num"] = {
    type: "numeric", concepts: ["f2b-temperatura"], difficulty: 1,
    generate(r) {
      const mats = [{ n: "acero", a: 12e-6 }, { n: "aluminio", a: 24e-6 }, { n: "cobre", a: 17e-6 }, { n: "vidrio común", a: 9e-6 }];
      const m = r.pick(mats), L0 = r.int(1, 50), dT = r.int(10, 80), vol = r.bool(0.3);
      const ans = vol ? 3 * m.a * dT * L0 * 1000 : m.a * L0 * dT * 1000;
      return {
        prompt: vol ? `Un recipiente de ${m.n} ($\\alpha = ${num(m.a * 1e6)}\\times10^{-6}$ K⁻¹) tiene un volumen de $${L0}$ L. ¿Cuántos mL aumenta su volumen si se calienta $${dT}$ K?`
          : `Una barra de ${m.n} ($\\alpha = ${num(m.a * 1e6)}\\times10^{-6}$ K⁻¹) mide $${L0}$ m. ¿Cuántos mm se alarga si su temperatura sube $${dT}$ K?`,
        answer: ans,
        solution: vol ? [`[[f2b-temperatura|Dilatación volumétrica]]: $\\Delta V = \\beta V_0\\Delta T$ con $\\beta \\approx 3\\alpha$.`, `$\\Delta V = 3\\cdot${num(m.a * 1e6)}\\times10^{-6}\\cdot${L0}\\cdot${dT} \\approx ${num(ans / 1000, 5)}$ L $= ${num(ans, 3)}$ mL.`]
          : [`[[f2b-temperatura|Dilatación lineal]]: $\\Delta L = \\alpha L_0\\Delta T$.`, `$\\Delta L = ${num(m.a * 1e6)}\\times10^{-6}\\cdot${L0}\\cdot${dT} \\approx ${num(ans / 1000, 5)}$ m $= ${num(ans, 3)}$ mm.`],
        // verificación: integramos dL/dT = α L₀ (definición del coeficiente) y restamos el valor inicial
        verify: { kind: "ode", f: () => [(vol ? 3 : 1) * m.a * L0], y0: [L0], t1: dT, dt: 0.5, out: (_, y) => (y[0] - L0) * 1000, tol: 1e-6 }
      };
    }
  };
  T["f2b-calorim-num"] = {
    type: "numeric", concepts: ["f2b-calor"], difficulty: 2,
    generate(r) {
      const mats = [{ n: "aluminio", c: 900 }, { n: "cobre", c: 385 }, { n: "hierro", c: 450 }, { n: "plomo", c: 128 }];
      const mt = r.pick(mats), m1 = r.int(1, 10) / 10, T1 = r.int(80, 300), m2 = r.int(2, 20) / 10, T2 = r.int(5, 30);
      const Tf = (m1 * mt.c * T1 + m2 * C_AGUA * T2) / (m1 * mt.c + m2 * C_AGUA);
      return {
        prompt: `Un bloque de ${mt.n} de $${dec(m1)}$ kg ($c = ${mt.c}$ J/(kg K)) a $${T1}\\,^\\circ$C se sumerge en $${dec(m2)}$ kg de agua a $${T2}\\,^\\circ$C ($c = 4186$ J/(kg K)). Sin pérdidas, ¿cuál es la temperatura final (°C)?`,
        answer: Tf,
        solution: [`[[f2b-calor|Calorimetría]]: el calor que pierde el metal lo gana el agua, $m_1c_1(T_1 - T_f) = m_2c_2(T_f - T_2)$.`, `$T_f = \\dfrac{m_1c_1T_1 + m_2c_2T_2}{m_1c_1 + m_2c_2} \\approx ${num(Tf, 4)}\\,^\\circ$C.`],
        // verificación: los dos cuerpos intercambian calor a un ritmo proporcional a la diferencia, hasta equilibrarse
        verify: { kind: "ode", f: (_, y) => { const P = 50 * (y[0] - y[1]); return [-P / (m1 * mt.c), P / (m2 * C_AGUA)]; }, y0: [T1, T2], t1: 40 * m1 * mt.c / 50, dt: m1 * mt.c / 50 / 20, out: (_, y) => y[1], tol: 1e-5 }
      };
    }
  };
  T["f2b-fase-num"] = {
    type: "numeric", concepts: ["f2b-calor"], difficulty: 2,
    generate(r) {
      const m = r.int(1, 20) / 10, Ti = r.int(-30, -1), Tf = r.int(1, 90);
      const Q = m * C_HIELO * (0 - Ti) + m * LF + m * C_AGUA * Tf;
      return {
        prompt: `¿Cuánto calor (kJ) hace falta para llevar $${dec(m)}$ kg de hielo a $${Ti}\\,^\\circ$C hasta agua líquida a $${Tf}\\,^\\circ$C? ($c_{hielo} = 2100$, $c_{agua} = 4186$ J/(kg K), $L_f = 3{,}34\\times10^5$ J/kg)`,
        answer: Q / 1000,
        solution: [`Tres etapas ([[f2b-calor|cambios de fase]]): calentar el hielo hasta $0\\,^\\circ$C, fundirlo, calentar el agua.`, `$Q = ${dec(m)}\\cdot2100\\cdot${-Ti} + ${dec(m)}\\cdot3{,}34\\times10^5 + ${dec(m)}\\cdot4186\\cdot${Tf} \\approx ${num(Q, 5)}$ J.`, `Mientras se funde, la temperatura no cambia: todo el calor va a romper la estructura del sólido.`],
        // verificación: se entrega calor de a poco siguiendo el estado (sólido, fusión, líquido) hasta llegar a Tf
        verify: { kind: "value", tol: 1e-4, fn: () => { let Tt = Ti, melted = 0, Qs = 0; const dQ = 1; while (true) { if (Tt < 0) Tt += dQ / (m * C_HIELO); else if (melted < m) { melted += dQ / LF; Tt = 0; } else { if (Tt >= Tf) break; Tt += dQ / (m * C_AGUA); } Qs += dQ; } return Qs / 1000; } }
      };
    }
  };
  T["f2b-conduccion-num"] = {
    type: "numeric", concepts: ["f2b-transferencia"], difficulty: 3,
    generate(r) {
      const k1 = r.pick([0.04, 0.1, 0.8, 1.0]), k2 = r.pick([0.04, 0.17, 0.6, 1.2]), L1 = r.int(1, 20) / 100, L2 = r.int(1, 20) / 100, A = r.int(1, 20), Th = r.int(15, 30), Tc = r.int(-10, 10);
      const Hf = (Th - Tc) / (L1 / (k1 * A) + L2 / (k2 * A));
      return {
        prompt: `Una pared de $${A}$ m² tiene dos capas: $${dec(num(L1 * 100))}$ cm con $k = ${dec(k1)}$ W/(m K) y $${dec(num(L2 * 100))}$ cm con $k = ${dec(k2)}$ W/(m K). Adentro hay $${Th}\\,^\\circ$C y afuera $${Tc}\\,^\\circ$C. ¿Cuántos watts pasan por conducción en régimen estacionario?`,
        answer: Hf,
        solution: [`[[f2b-transferencia|Conducción]]: $H = \\frac{kA\\,\\Delta T}{L}$. Con capas en serie se suman las resistencias térmicas $R = \\frac{L}{kA}$.`, `$H = \\dfrac{${Th - Tc}}{\\frac{${dec(num(L1))}}{${dec(k1)}\\cdot${A}} + \\frac{${dec(num(L2))}}{${dec(k2)}\\cdot${A}}} \\approx ${num(Hf, 4)}$ W.`],
        // verificación: buscamos por bisección la temperatura de la interfaz donde los dos flujos coinciden
        verify: { kind: "value", tol: 1e-6, fn: () => { let lo = Tc, hi = Th; for (let i = 0; i < 80; i++) { const Ti = (lo + hi) / 2, h1 = k1 * A * (Th - Ti) / L1, h2 = k2 * A * (Ti - Tc) / L2; if (h1 > h2) lo = Ti; else hi = Ti; } return k1 * A * (Th - lo) / L1; } }
      };
    }
  };
  T["f2b-radiacion-vf"] = {
    type: "tf", concepts: ["f2b-transferencia"], difficulty: 1,
    generate(r) {
      const v = r.pick(["doble-k", "doble-c", "dieciseis"]);
      const T1 = r.int(200, 800);
      if (v === "doble-c") {
        const c1 = r.int(10, 60);
        return { prompt: `<b>Verdadero o falso:</b> si un cuerpo pasa de $${c1}\\,^\\circ$C a $${2 * c1}\\,^\\circ$C, la potencia que irradia se multiplica por $2^4 = 16$.`, answer: false,
          explanation: `La ley de Stefan-Boltzmann usa la temperatura **absoluta**: $\\frac{P_2}{P_1} = \\left(\\frac{${2 * c1} + 273}{${c1} + 273}\\right)^4 \\approx ${num(((2 * c1 + 273.15) / (c1 + 273.15)) ** 4, 3)}$, no $16$ ([[f2b-transferencia]]).`,
          solution: [`$P = e\\sigma AT^4$ con $T$ en kelvin.`],
          verify: { kind: "truth", fn: () => Math.abs((SIGMA * (2 * c1 + 273.15) ** 4) / (SIGMA * (c1 + 273.15) ** 4) - 16) < 1e-6 } };
      }
      const q = v === "dieciseis";
      return { prompt: `<b>Verdadero o falso:</b> si la temperatura absoluta de un cuerpo pasa de $${T1}$ K a $${2 * T1}$ K, la potencia que irradia se multiplica por ${q ? "$16$" : "$2$"}.`, answer: q,
        explanation: `Stefan-Boltzmann: $P \\propto T^4$, así que duplicar $T$ (en kelvin) multiplica la potencia por $2^4 = 16$ ([[f2b-transferencia]]).`,
        solution: [`$P = e\\sigma AT^4$.`],
        verify: { kind: "truth", fn: () => Math.abs((SIGMA * (2 * T1) ** 4) / (SIGMA * T1 ** 4) - (q ? 16 : 2)) < 1e-9 } };
    }
  };

  const cards = {
    "f2b-temperatura": {
      title: "Temperatura, escalas y dilatación", aliases: ["escalas de temperatura", "escala Kelvin", "equilibrio térmico", "ley cero", "dilatación térmica", "dilatación lineal", "dilatación volumétrica", "coeficiente de dilatación"], concepts: ["f2b-temperatura"],
      summary: "La temperatura es lo que se iguala en el equilibrio térmico. T(K) = T(°C) + 273,15. ΔL = α L₀ ΔT.",
      def: [R`**Ley cero:** si $A$ y $B$ están cada uno en equilibrio térmico con $C$, están en equilibrio entre sí. La **temperatura** es la propiedad que comparten los cuerpos en equilibrio térmico.`,
        R`**Escalas:** $T_K = T_C + 273{,}15$ y $T_F = \frac95T_C + 32$. La escala Kelvin es absoluta: su cero es el límite al que tiende la presión de un gas a volumen constante (termómetro de gas).`,
        R`**Dilatación:** $\Delta L = \alpha L_0\Delta T$ (lineal), $\Delta V = \beta V_0\Delta T$ con $\beta \approx 3\alpha$ para sólidos.`],
      idea: [R`Un grado Celsius y un kelvin son del mismo tamaño: las **diferencias** de temperatura son iguales en las dos escalas. Pero en las leyes de los gases y de radiación hay que usar kelvin.`,
        R`El agua es una excepción: entre $0$ y $4\,^\circ$C se **contrae** al calentarse. Por eso los lagos se congelan de arriba hacia abajo.`],
      examples: [{ q: R`Un riel de acero de 12 m ($\alpha = 1{,}2\times10^{-5}$ K⁻¹) pasa de $0$ a $40\,^\circ$C. ¿Cuánto se alarga?`, steps: [R`$\Delta L = 1{,}2\times10^{-5}\cdot 12\cdot 40 \approx 5{,}8$ mm: por eso se dejan juntas de dilatación.`] }],
      see: ["f2b-calor", "f2b-gas-ideal"]
    },
    "f2b-calor": {
      title: "Calor, calorimetría y cambios de fase", aliases: ["calor específico", "calorimetría", "calor latente", "cambios de fase", "cambio de fase", "capacidad calorífica"], concepts: ["f2b-calor"],
      summary: "Q = m c ΔT para cambiar la temperatura; Q = m L para cambiar de fase (sin cambio de temperatura).",
      def: [R`El **calor** es energía que se transfiere por una diferencia de temperatura. Para calentar sin cambio de fase: $Q = mc\,\Delta T$, con $c$ el **calor específico** (agua: $4186$ J/(kg K)).`,
        R`**Cambio de fase:** $Q = mL$, con $L$ el **calor latente** (agua: $L_f = 3{,}34\times10^5$ J/kg, $L_v = 2{,}26\times10^6$ J/kg). Durante el cambio de fase la temperatura no cambia.`,
        R`**Calorimetría:** en un sistema aislado, $\sum Q_i = 0$: lo que unos pierden, otros lo ganan.`],
      idea: [R`El agua tiene un calor específico enorme: por eso modera el clima de las costas y se usa para refrigerar. Y evaporar agua cuesta mucha energía, que es por qué transpirar enfría.`],
      examples: [{ q: R`¿Cuánto calor hace falta para hervir (evaporar) 1 L de agua que ya está a $100\,^\circ$C?`, steps: [R`$Q = mL_v = 1\cdot 2{,}26\times10^6 = 2{,}26$ MJ: más de cinco veces lo que costó calentarla desde $0\,^\circ$C.`] }],
      see: ["f2b-temperatura", "f2b-transferencia", "f2b-primera-ley"]
    },
    "f2b-transferencia": {
      title: "Transferencia de calor: conducción, convección y radiación", aliases: ["conducción", "convección", "radiación térmica", "conductividad térmica", "Stefan-Boltzmann", "resistencia térmica"], concepts: ["f2b-transferencia"],
      summary: "Conducción: H = kAΔT/L. Convección: transporte por el fluido. Radiación: P = eσAT⁴ (T en kelvin).",
      def: [R`**Conducción** (ley de Fourier, régimen estacionario): $H = \frac{kA(T_H - T_C)}{L}$, con $k$ la conductividad térmica. Las capas en serie suman **resistencias térmicas** $R = \frac{L}{kA}$.`,
        R`**Convección:** el calor viaja con el movimiento del fluido (corrientes en el aire o el agua).`,
        R`**Radiación** (Stefan-Boltzmann): $P = e\sigma AT^4$, con $\sigma = 5{,}67\times10^{-8}$ W/(m² K⁴) y $T$ en kelvin. La potencia neta intercambiada con el entorno es $e\sigma A(T^4 - T_{amb}^4)$.`],
      idea: [R`El aire quieto es muy mal conductor ($k \approx 0{,}024$): por eso abrigan la lana, el telgopor y las ventanas de doble vidrio, que atrapan aire.`,
        R`La radiación no necesita medio: así nos llega el calor del Sol. Como depende de $T^4$, duplicar la temperatura absoluta multiplica por 16 la potencia irradiada.`],
      examples: [{ q: R`Un vidrio de 1 m², 4 mm, $k = 0{,}8$ W/(m K), con $20\,^\circ$C adentro y $0\,^\circ$C afuera.`, steps: [R`$H = \frac{0{,}8\cdot 1\cdot 20}{0{,}004} = 4000$ W (en la práctica es menos, porque las capas de aire pegadas al vidrio también aíslan).`] }],
      see: ["f2b-calor"]
    }
  };

  E.extendCourse("f102b", {
    concepts: { "f2b-temperatura": { name: "Temperatura y dilatación" }, "f2b-calor": { name: "Calorimetría y cambios de fase" }, "f2b-transferencia": { name: "Transferencia de calor" } },
    templates: T,
    units: [{
      id: "f2b-calor-u", order: 1, program: "Unidad 1", title: "Temperatura y calor", icon: "flame",
      diagnostic: ["f2b-escala-num", "f2b-calorim-num", "f2b-fase-num"],
      lessons: [
        { id: "f2b-temperatura", title: "Temperatura y dilatación", templates: ["f2b-escala-num", "f2b-dilatacion-num"], theory: ["f2b-temperatura"],
          intro: R`$T_K = T_C + 273{,}15$, $T_F = \frac95T_C + 32$. Dilatación: $\Delta L = \alpha L_0\Delta T$.` },
        { id: "f2b-calorimetria", title: "Calorimetría y cambios de fase", templates: ["f2b-calorim-num", "f2b-fase-num"], theory: ["f2b-calor"],
          intro: R`$Q = mc\Delta T$ y $Q = mL$. En un sistema aislado, el calor que pierden unos lo ganan otros.` },
        { id: "f2b-transferencia", title: "Transferencia de calor", templates: ["f2b-radiacion-vf", "f2b-conduccion-num"], theory: ["f2b-transferencia"],
          intro: R`Conducción: $H = \frac{kA\Delta T}{L}$. Radiación: $P = e\sigma AT^4$, con $T$ en kelvin.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 2 · PROPIEDADES TÉRMICAS DE LA MATERIA
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {};
  const dec = x => String(x).replace(".", "{,}");
  const Rg = 8.314, kB = 1.381e-23, NA = 6.022e23;

  T["f2b-gasideal-num"] = {
    type: "numeric", concepts: ["f2b-gas-ideal"], difficulty: 1,
    generate(r) {
      if (r.bool()) {
        const n = r.int(1, 10) / 2, Tk = r.int(250, 500), V = r.int(5, 100) / 1000, p = n * Rg * Tk / V;
        return { prompt: `¿Qué presión (kPa) ejercen $${dec(n)}$ mol de un gas ideal a $${Tk}$ K en un recipiente de $${num(V * 1000)}$ L? ($R = 8{,}314$ J/(mol K))`, answer: p / 1000,
          solution: [`[[f2b-gas-ideal|Gas ideal]]: $pV = nRT$, con $V$ en m³.`, `$p = \\frac{${dec(n)}\\cdot 8{,}314\\cdot${Tk}}{${dec(num(V, 3))}} \\approx ${num(p / 1000, 4)}$ kPa.`],
          verify: { kind: "zero", fn: pk => [(pk * 1000 * V - n * Rg * Tk) / (n * Rg * Tk)] } };
      }
      const p1 = r.int(100, 300), V1 = r.int(1, 10), T1 = r.int(250, 400), p2 = r.int(100, 400), V2 = r.int(1, 10);
      const T2 = T1 * p2 * V2 / (p1 * V1);
      return { prompt: `Un gas ideal pasa de $p_1 = ${p1}$ kPa, $V_1 = ${V1}$ L, $T_1 = ${T1}$ K a $p_2 = ${p2}$ kPa y $V_2 = ${V2}$ L (sin perder gas). ¿Cuál es $T_2$ (K)?`, answer: T2,
        solution: [`Con $n$ fijo, $\\frac{pV}{T}$ es constante ([[f2b-gas-ideal]]).`, `$T_2 = T_1\\frac{p_2V_2}{p_1V_1} = ${T1}\\cdot\\frac{${p2}\\cdot${V2}}{${p1}\\cdot${V1}} \\approx ${num(T2, 4)}$ K.`],
        verify: { kind: "zero", fn: t2 => [(p1 * V1 / T1 - p2 * V2 / t2) / (p1 * V1 / T1)] } };
    }
  };
  const GASES = [{ n: "helio", M: 0.004 }, { n: "nitrógeno ($\\text{N}_2$)", M: 0.028 }, { n: "oxígeno ($\\text{O}_2$)", M: 0.032 }, { n: "hidrógeno ($\\text{H}_2$)", M: 0.002 }, { n: "argón", M: 0.040 }];
  T["f2b-vrms-num"] = {
    type: "numeric", concepts: ["f2b-cinetica"], difficulty: 2,
    generate(r) {
      const g = r.pick(GASES), Tk = r.int(200, 600), v = Math.sqrt(3 * Rg * Tk / g.M);
      return {
        prompt: `¿Cuál es la velocidad cuadrática media (m/s) de las moléculas de ${g.n} ($M = ${dec(g.M)}$ kg/mol) a $${Tk}$ K?`,
        answer: v,
        solution: [`[[f2b-cinetica|Teoría cinética]]: la energía cinética media de traslación es $\\frac32kT$, así que $v_{rms} = \\sqrt{\\frac{3RT}{M}}$.`, `$v_{rms} = \\sqrt{\\frac{3\\cdot 8{,}314\\cdot${Tk}}{${dec(g.M)}}} \\approx ${num(v, 4)}$ m/s.`],
        // verificación: por molécula, ½ m v² = (3/2) k T con m = M / N_A
        verify: { kind: "value", tol: 1e-3, fn: () => Math.sqrt(3 * kB * Tk / (g.M / NA)) }
      };
    }
  };
  T["f2b-cv-num"] = {
    type: "numeric", concepts: ["f2b-cinetica"], difficulty: 2,
    generate(r) {
      const mono = r.bool(), n = r.int(1, 10) / 2, dT = r.int(10, 100), isoP = r.bool();
      const Cv = (mono ? 1.5 : 2.5) * Rg, Q = n * (isoP ? Cv + Rg : Cv) * dT;
      return {
        prompt: `¿Cuánto calor (J) hay que darle a $${dec(n)}$ mol de un gas ideal ${mono ? "monoatómico" : "diatómico"} para subir su temperatura $${dT}$ K a ${isoP ? "presión" : "volumen"} constante? ($R = 8{,}314$ J/(mol K))`,
        answer: Q,
        solution: [`[[f2b-cinetica|Capacidades caloríficas]] del gas ideal: $C_V = ${mono ? "\\frac32" : "\\frac52"}R$ y $C_p = C_V + R$.`, `$Q = nC_${isoP ? "p" : "V"}\\Delta T = ${dec(n)}\\cdot${num(isoP ? Cv + Rg : Cv, 4)}\\cdot${dT} \\approx ${num(Q, 4)}$ J.`],
        // verificación: primera ley con U = (f/2) nRT y, a presión constante, el trabajo nRΔT
        verify: { kind: "value", fn: () => { const f = mono ? 3 : 5, dU = (f / 2) * n * Rg * dT; return dU + (isoP ? n * Rg * dT : 0); } }
      };
    }
  };
  T["f2b-fases-vf"] = {
    type: "tf", concepts: ["f2b-cinetica"], difficulty: 1,
    generate(r) {
      const p = r.pick([50, 60, 70, 80, 120, 150, 200]); // kPa
      // ecuación de Antoine para el agua (p en mmHg, T en °C)
      const Teb = pk => 1730.63 / (8.07131 - Math.log10(pk * 7.50062)) - 233.426;
      const q = r.pick(["menor", "mayor"]);
      const truth = q === "menor" ? Teb(p) < 100 : Teb(p) > 100;
      return {
        prompt: `<b>Verdadero o falso:</b> a una presión de $${p}$ kPa, el agua hierve a una temperatura ${q} que $100\\,^\\circ$C.`,
        answer: truth,
        explanation: `La temperatura de ebullición sube con la presión (es el punto de la curva de vaporización del [[f2b-cinetica|diagrama de fases]]). A $101{,}3$ kPa es $100\\,^\\circ$C; a $${p}$ kPa es aproximadamente $${num(Teb(p), 3)}\\,^\\circ$C. Por eso las ollas a presión cocinan más rápido y en la montaña el agua hierve antes.`,
        solution: [`Hervir es que la presión de vapor iguale a la presión exterior.`],
        verify: { kind: "truth", fn: () => (q === "menor" ? p < 101.325 : p > 101.325) }
      };
    }
  };

  const cards = {
    "f2b-gas-ideal": {
      title: "Ecuación de estado del gas ideal", aliases: ["gas ideal", "ecuación de estado", "ley de los gases", "pV = nRT"], concepts: ["f2b-gas-ideal"],
      summary: "pV = nRT (con T en kelvin). Con n fijo, pV/T es constante.",
      def: [R`$$pV = nRT, \qquad R = 8{,}314\ \text{J/(mol K)}$$ o, por molécula, $pV = NkT$ con $k = \frac{R}{N_A} = 1{,}381\times10^{-23}$ J/K.`],
      idea: [R`Vale para gases a baja densidad, donde las moléculas casi no interactúan. Contiene las leyes de Boyle ($pV$ constante a $T$ fija), Charles y Gay-Lussac. Para gases reales a alta presión se corrige, por ejemplo con la ecuación de van der Waals.`,
        R`Siempre con $T$ en **kelvin**, $p$ en Pa y $V$ en m³ (1 L $= 10^{-3}$ m³).`],
      examples: [{ q: R`¿Volumen de 1 mol a $0\,^\circ$C y 1 atm?`, steps: [R`$V = \frac{1\cdot 8{,}314\cdot 273}{101325} \approx 22{,}4$ L.`] }],
      see: ["f2b-cinetica", "f2b-primera-ley"]
    },
    "f2b-cinetica": {
      title: "Modelo cinético, capacidades caloríficas y fases", aliases: ["teoría cinética", "modelo cinético", "velocidad cuadrática media", "equipartición", "capacidad calorífica molar", "diagrama de fases", "punto triple"], concepts: ["f2b-cinetica"],
      summary: "La temperatura mide la energía cinética media: ⟨½mv²⟩ = (3/2)kT. Gas monoatómico: C_V = 3R/2; diatómico: 5R/2; C_p = C_V + R.",
      def: [R`**Modelo cinético-molecular:** la presión es el efecto de los choques de las moléculas contra las paredes. Resultado: $\langle\frac12mv^2\rangle = \frac32kT$, así que $v_{rms} = \sqrt{\frac{3kT}{m}} = \sqrt{\frac{3RT}{M}}$.`,
        R`**Equipartición:** cada grado de libertad cuadrático aporta $\frac12kT$. Monoatómico (3 traslaciones): $U = \frac32nRT$, $C_V = \frac32R$. Diatómico a temperatura ambiente (más 2 rotaciones): $C_V = \frac52R$. Siempre $C_p = C_V + R$.`,
        R`**Diagrama de fases** ($p$ vs $T$): curvas de fusión, vaporización y sublimación, que se encuentran en el **punto triple**. La curva de vaporización termina en el **punto crítico**.`],
      idea: [R`A la misma temperatura, todas las moléculas tienen la misma energía cinética media: las livianas (como el hidrógeno) van mucho más rápido. Por eso la Tierra perdió casi todo su hidrógeno y su helio.`],
      examples: [{ q: R`$v_{rms}$ del $\text{N}_2$ a 300 K.`, steps: [R`$\sqrt{\frac{3\cdot 8{,}314\cdot 300}{0{,}028}} \approx 517$ m/s.`] }],
      see: ["f2b-gas-ideal", "f2b-primera-ley"]
    }
  };

  E.extendCourse("f102b", {
    concepts: { "f2b-gas-ideal": { name: "Gas ideal" }, "f2b-cinetica": { name: "Teoría cinética, capacidades y fases" } },
    templates: T,
    units: [{
      id: "f2b-materia-u", order: 2, program: "Unidad 2", title: "Propiedades térmicas de la materia", icon: "atom",
      diagnostic: ["f2b-gasideal-num", "f2b-vrms-num", "f2b-cv-num"],
      lessons: [
        { id: "f2b-gas-ideal", title: "Gas ideal", templates: ["f2b-gasideal-num", "f2b-fases-vf"], theory: ["f2b-gas-ideal", "f2b-cinetica"],
          intro: R`$pV = nRT$, con $T$ en kelvin. Con $n$ fijo, $\frac{pV}{T}$ se conserva.` },
        { id: "f2b-cinetica", title: "Modelo cinético y capacidades", templates: ["f2b-vrms-num", "f2b-cv-num"], theory: ["f2b-cinetica"],
          intro: R`$\frac12m\langle v^2\rangle = \frac32kT$. $C_V = \frac32R$ (monoatómico) o $\frac52R$ (diatómico); $C_p = C_V + R$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 3 · PRIMERA LEY DE LA TERMODINÁMICA
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {};
  const dec = x => String(x).replace(".", "{,}");
  const Rg = 8.314;

  T["f2b-trabajo-gas-num"] = {
    type: "numeric", concepts: ["f2b-primera-ley"], difficulty: 2,
    generate(r) {
      const n = r.int(1, 6) / 2, Tk = r.int(250, 500), V1 = r.int(1, 10), V2 = r.int(1, 20);
      if (V1 === V2) return null;
      if (r.bool()) {
        const p = r.int(50, 300) * 1000, W = p * (V2 - V1) / 1000;
        return { prompt: `Un gas se ${V2 > V1 ? "expande" : "comprime"} a presión constante de $${p / 1000}$ kPa desde $${V1}$ L hasta $${V2}$ L. ¿Qué trabajo (J) **hace el gas**?`, answer: W,
          solution: [`[[f2b-primera-ley|Trabajo del gas]]: $W = \\int p\\,dV$; a presión constante, $W = p\\,\\Delta V$.`, `$W = ${p}\\cdot(${V2} - ${V1})\\times10^{-3} = ${num(W, 4)}$ J${W < 0 ? " (negativo: el entorno trabaja sobre el gas)" : ""}.`],
          verify: { kind: "integral", f: () => p / 1000, a: V1, b: V2 } };
      }
      const W = n * Rg * Tk * Math.log(V2 / V1);
      return { prompt: `$${dec(n)}$ mol de gas ideal se ${V2 > V1 ? "expanden" : "comprimen"} **isotérmicamente** a $${Tk}$ K desde $${V1}$ L hasta $${V2}$ L. ¿Qué trabajo (J) hace el gas?`, answer: W,
        solution: [`Isotérmico: $p = \\frac{nRT}{V}$, así que $W = \\int_{V_1}^{V_2}\\frac{nRT}{V}dV = nRT\\ln\\frac{V_2}{V_1}$ ([[f2b-primera-ley]]).`, `$W = ${dec(n)}\\cdot 8{,}314\\cdot${Tk}\\ln\\frac{${V2}}{${V1}} \\approx ${num(W, 4)}$ J.`],
        verify: { kind: "integral", f: V => n * Rg * Tk / V, a: V1, b: V2 } };
    }
  };
  T["f2b-primera-num"] = {
    type: "numeric", concepts: ["f2b-primera-ley"], difficulty: 1,
    generate(r) {
      const Q = r.int(-500, 1500), W = r.int(-500, 1500), ask = r.pick(["dU", "Q", "W"]);
      const dU = Q - W;
      const known = { dU: [Q, W], Q: [dU, W], W: [Q, dU] }[ask];
      const txt = { dU: `El sistema recibe $Q = ${Q}$ J de calor y hace un trabajo $W = ${W}$ J. ¿Cuánto vale $\\Delta U$ (J)?`,
        Q: `La energía interna de un sistema cambia en $\\Delta U = ${dU}$ J mientras hace un trabajo $W = ${W}$ J. ¿Cuánto calor $Q$ (J) recibió?`,
        W: `Un sistema recibe $Q = ${Q}$ J y su energía interna cambia $\\Delta U = ${dU}$ J. ¿Qué trabajo $W$ (J) hizo?` }[ask];
      return {
        prompt: txt + ` (Convención: $Q > 0$ si entra calor, $W > 0$ si el sistema hace trabajo.)`,
        answer: { dU, Q, W }[ask],
        solution: [`[[f2b-primera-ley|Primera ley]]: $\\Delta U = Q - W$.`, `Despejando: $${ask === "dU" ? "\\Delta U" : ask} = ${{ dU, Q, W }[ask]}$ J.`],
        verify: { kind: "zero", fn: x => { const v = { dU: [Q, W, x], Q: [x, W, dU], W: [Q, x, dU] }[ask]; return [v[2] - (v[0] - v[1])]; } }
      };
    }
  };
  T["f2b-adiabatico-num"] = {
    type: "numeric", concepts: ["f2b-procesos"], difficulty: 3,
    generate(r) {
      const mono = r.bool(), g = mono ? 5 / 3 : 7 / 5, T1 = r.int(250, 400), V1 = r.int(2, 20), V2 = r.int(1, 20), p1 = r.int(100, 300), ask = r.pick(["T", "p"]);
      if (V1 === V2) return null;
      const T2 = T1 * (V1 / V2) ** (g - 1), p2 = p1 * (V1 / V2) ** g;
      return {
        prompt: `Un gas ideal ${mono ? "monoatómico ($\\gamma = \\frac53$)" : "diatómico ($\\gamma = \\frac75$)"} a $${T1}$ K y $${p1}$ kPa se ${V2 < V1 ? "comprime" : "expande"} **adiabáticamente** (y en forma reversible) de $${V1}$ L a $${V2}$ L. ¿Cuál es su ${ask === "T" ? "temperatura final (K)" : "presión final (kPa)"}?`,
        answer: ask === "T" ? T2 : p2,
        solution: [`[[f2b-procesos|Adiabático]] ($Q = 0$): $TV^{\\gamma - 1}$ y $pV^\\gamma$ son constantes.`, ask === "T" ? `$T_2 = T_1\\left(\\frac{V_1}{V_2}\\right)^{\\gamma - 1} \\approx ${num(T2, 4)}$ K.` : `$p_2 = p_1\\left(\\frac{V_1}{V_2}\\right)^{\\gamma} \\approx ${num(p2, 4)}$ kPa.`, V2 < V1 ? `Al comprimir sin dejar salir calor, el gas se calienta (como un inflador).` : `Al expandirse sin recibir calor, el gas se enfría.`],
        // verificación: integramos la primera ley con Q = 0, n C_V dT = -p dV = -nRT dV / V, desde V1 hasta V2
        verify: { kind: "ode", f: (s, y) => { const V = V1 + Math.sign(V2 - V1) * s; return [-Math.sign(V2 - V1) * (g - 1) * y[0] / V]; }, y0: [T1], t1: Math.abs(V2 - V1), dt: 1e-3,
          out: (_, y) => (ask === "T" ? y[0] : p1 * (y[0] / T1) * (V1 / V2)), tol: 1e-5 }
      };
    }
  };
  const PROC = ["Isotérmico", "Isobárico", "Isocórico", "Adiabático"];
  T["f2b-proceso-mc"] = {
    type: "mc", concepts: ["f2b-procesos"], difficulty: 1,
    generate(r) {
      const k = r.int(0, 3), n = 1, Rv = 8.314;
      const T1 = 300, V1 = 10, p1 = n * Rv * T1 / (V1 / 1000) / 1000; // p en kPa, V en L
      let T2, V2, p2, Q;
      const pOf = (TT, VV) => n * Rv * TT / (VV / 1000) / 1000;
      if (k === 0) { V2 = r.int(12, 30); T2 = T1; p2 = pOf(T2, V2); Q = n * Rv * T1 * Math.log(V2 / V1); }
      else if (k === 1) { V2 = r.int(12, 30); p2 = p1; T2 = T1 * V2 / V1; Q = n * 2.5 * Rv * (T2 - T1); }
      else if (k === 2) { V2 = V1; T2 = r.int(320, 500); p2 = pOf(T2, V2); Q = n * 1.5 * Rv * (T2 - T1); }
      else { V2 = r.int(12, 30); T2 = T1 * (V1 / V2) ** (2 / 3); p2 = pOf(T2, V2); Q = 0; }
      const f = x => num(x, 3);
      return {
        prompt: `1 mol de gas ideal monoatómico pasa de $p = ${f(p1)}$ kPa, $V = ${V1}$ L, $T = ${T1}$ K a $p = ${f(p2)}$ kPa, $V = ${V2}$ L, $T = ${f(T2)}$ K, intercambiando $Q = ${f(Q)}$ J. ¿Qué tipo de proceso es?`,
        ...H.mc(r, PROC[k], PROC.filter((_, i) => i !== k), { text: true, keepOrder: true }),
        solution: [`Se mira qué se mantuvo constante ([[f2b-procesos|procesos termodinámicos]]): $T$ (isotérmico), $p$ (isobárico), $V$ (isocórico) o $Q = 0$ (adiabático).`, `Acá ${["la temperatura no cambió", "la presión no cambió", "el volumen no cambió", "no hubo intercambio de calor"][k]}.`],
        // verificación: se clasifica por la magnitud que quedó fija en los números del enunciado
        verify: { kind: "value", target: k, fn: () => Math.abs(T2 - T1) < 1e-9 ? 0 : Math.abs(p2 - p1) < 1e-9 * p1 ? 1 : V1 === V2 ? 2 : Math.abs(Q) < 1e-9 ? 3 : -1 }
      };
    }
  };

  const cards = {
    "f2b-primera-ley": {
      title: "Primera ley de la termodinámica", aliases: ["primera ley de la termodinámica", "primera ley", "energía interna", "trabajo del gas", "sistema termodinámico"], concepts: ["f2b-primera-ley"],
      summary: "ΔU = Q − W: la energía interna cambia por el calor que entra menos el trabajo que hace el sistema. W = ∫ p dV.",
      def: [R`$$\Delta U = Q - W$$ con $Q > 0$ si el sistema **recibe** calor y $W > 0$ si el sistema **hace** trabajo. $U$ es una **función de estado** (solo depende del estado); $Q$ y $W$ dependen del camino.`,
        R`**Trabajo al cambiar el volumen:** $W = \int_{V_1}^{V_2} p\,dV$: el área bajo la curva en el diagrama $pV$.`],
      idea: [R`Es la [[f1-energia|conservación de la energía]] incluyendo el calor. Entre dos estados se puede ir por caminos distintos con distinto $W$ y distinto $Q$, pero $Q - W$ siempre da lo mismo.`,
        R`Para un gas ideal, $U$ depende solo de $T$: $\Delta U = nC_V\Delta T$ en **cualquier** proceso.`],
      examples: [{ q: R`Un gas recibe 500 J y se expande haciendo 200 J de trabajo. ¿$\Delta U$?`, steps: [R`$\Delta U = 500 - 200 = 300$ J: se calienta.`] }],
      see: ["f2b-procesos", "f2b-gas-ideal", "f2b-segunda-ley"]
    },
    "f2b-procesos": {
      title: "Procesos termodinámicos del gas ideal", aliases: ["proceso isotérmico", "proceso isobárico", "proceso isocórico", "proceso adiabático", "isotérmico", "isobárico", "isocórico", "adiabático", "adiabáticamente"], concepts: ["f2b-procesos"],
      summary: "Isotérmico: ΔU = 0, W = nRT ln(V₂/V₁). Isobárico: W = pΔV. Isocórico: W = 0. Adiabático: Q = 0, pV^γ constante.",
      def: [R`• **Isocórico** ($V$ constante): $W = 0$, $Q = \Delta U = nC_V\Delta T$.<br>• **Isobárico** ($p$ constante): $W = p\Delta V$, $Q = nC_p\Delta T$.<br>• **Isotérmico** ($T$ constante): $\Delta U = 0$, $Q = W = nRT\ln\frac{V_2}{V_1}$.<br>• **Adiabático** ($Q = 0$): $\Delta U = -W$, y si es reversible, $pV^\gamma$ y $TV^{\gamma-1}$ son constantes, con $\gamma = \frac{C_p}{C_V}$.`],
      idea: [R`En el diagrama $pV$, una adiabática cae más empinada que una isoterma: al expandirse sin recibir calor, el gas paga el trabajo con su energía interna y se enfría. Por eso el aire que sube en la atmósfera se enfría y se forman nubes.`],
      demo: [R`**Adiabática.** Con $Q = 0$: $nC_VdT = -p\,dV = -\frac{nRT}{V}dV$. Separando variables: $\frac{dT}{T} = -\frac{R}{C_V}\frac{dV}{V} = -(\gamma - 1)\frac{dV}{V}$ (usando $C_p - C_V = R$).`, R`Integrando: $\ln T + (\gamma - 1)\ln V = $ constante, o sea $TV^{\gamma-1} = $ constante. $\blacksquare$`],
      examples: [{ q: R`Aire ($\gamma = 1{,}4$) a 300 K se comprime adiabáticamente a la décima parte del volumen.`, steps: [R`$T_2 = 300\cdot 10^{0{,}4} \approx 754$ K: así enciende el combustible un motor diésel.`] }],
      see: ["f2b-primera-ley", "f2b-segunda-ley", "edo"]
    }
  };

  E.extendCourse("f102b", {
    concepts: { "f2b-primera-ley": { name: "Primera ley" }, "f2b-procesos": { name: "Procesos del gas ideal" } },
    templates: T,
    units: [{
      id: "f2b-primera-u", order: 3, program: "Unidad 3", title: "Primera ley de la termodinámica", icon: "zap",
      diagnostic: ["f2b-primera-num", "f2b-trabajo-gas-num", "f2b-adiabatico-num"],
      lessons: [
        { id: "f2b-primera", title: "Calor, trabajo y energía interna", templates: ["f2b-primera-num", "f2b-trabajo-gas-num"], theory: ["f2b-primera-ley"],
          intro: R`$\Delta U = Q - W$ y $W = \int p\,dV$. $U$ es función de estado; $Q$ y $W$ dependen del camino.` },
        { id: "f2b-procesos", title: "Procesos del gas ideal", templates: ["f2b-proceso-mc", "f2b-adiabatico-num"], theory: ["f2b-procesos"],
          intro: R`Isotérmico, isobárico, isocórico y adiabático ($pV^\gamma$ constante).` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 4 · SEGUNDA LEY DE LA TERMODINÁMICA
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {};
  const dec = x => String(x).replace(".", "{,}");
  const Rg = 8.314;
  // eficiencia de un ciclo de Carnot armado proceso por proceso (gas ideal monoatómico)
  function carnotEff(Th, Tc) {
    const g = 5 / 3, V1 = 1e-3, V2 = 3e-3, V3 = V2 * (Th / Tc) ** (1 / (g - 1)), V4 = V1 * (Th / Tc) ** (1 / (g - 1));
    const Qh = Rg * Th * Math.log(V2 / V1), Qc = Rg * Tc * Math.log(V3 / V4);
    return 1 - Qc / Qh;
  }

  T["f2b-carnot-num"] = {
    type: "numeric", concepts: ["f2b-segunda-ley"], difficulty: 2,
    generate(r) {
      const Thc = r.int(100, 600), Tcc = r.int(-20, 60), refr = r.bool(0.3);
      const Th = Thc + 273.15, Tc = Tcc + 273.15;
      if (refr) {
        const tc = r.int(-25, 5), th = r.int(20, 40), Tcr = tc + 273.15, Thr = th + 273.15, cop = Tcr / (Thr - Tcr);
        return { prompt: `¿Cuál es el máximo coeficiente de rendimiento (COP) de una heladera que mantiene el interior a $${tc}\\,^\\circ$C en una cocina a $${th}\\,^\\circ$C?`, answer: cop,
          solution: [`Refrigerador de [[f2b-segunda-ley|Carnot]]: $\\text{COP} = \\frac{Q_C}{W} = \\frac{T_C}{T_H - T_C}$ (en kelvin).`, `$\\text{COP} = \\frac{${num(Tcr, 5)}}{${th - tc}} \\approx ${num(cop, 4)}$.`],
          verify: { kind: "value", fn: () => { const e = carnotEff(Thr, Tcr); return (1 - e) / e; } } };
      }
      const e = 1 - Tc / Th;
      return { prompt: `¿Cuál es la máxima eficiencia (en %) de una máquina térmica que trabaja entre $${Thc}\\,^\\circ$C y $${Tcc}\\,^\\circ$C?`, answer: 100 * e,
        solution: [`El máximo es el de [[f2b-segunda-ley|Carnot]]: $e = 1 - \\frac{T_C}{T_H}$, con temperaturas en **kelvin**.`, `$e = 1 - \\frac{${num(Tc, 5)}}{${num(Th, 5)}} \\approx ${num(100 * e, 4)}\\%$.`],
        // verificación: ciclo de Carnot armado con sus dos isotermas y dos adiabáticas
        verify: { kind: "value", fn: () => 100 * carnotEff(Th, Tc) } };
    }
  };
  T["f2b-maquina-num"] = {
    type: "numeric", concepts: ["f2b-segunda-ley"], difficulty: 1,
    generate(r) {
      const Qh = r.int(10, 100) * 100, e = r.int(10, 45) / 100, W = Qh * e, ask = r.pick(["W", "Qc", "e"]);
      const Qc = Qh - W;
      const prompt = { W: `Una máquina térmica absorbe $${Qh}$ J por ciclo y tiene una eficiencia del $${num(100 * e)}\\%$. ¿Cuánto trabajo (J) hace por ciclo?`,
        Qc: `Una máquina térmica absorbe $${Qh}$ J por ciclo y hace $${num(W)}$ J de trabajo. ¿Cuánto calor (J) entrega a la fuente fría?`,
        e: `Una máquina térmica absorbe $${Qh}$ J por ciclo y entrega $${num(Qc)}$ J a la fuente fría. ¿Cuál es su eficiencia (en %)?` }[ask];
      const ans = { W, Qc, e: 100 * e }[ask];
      return {
        prompt, answer: ans,
        solution: [`En un ciclo $\\Delta U = 0$, así que $W = Q_H - Q_C$; la [[f2b-segunda-ley|eficiencia]] es $e = \\frac{W}{Q_H}$.`, `Respuesta: $${num(ans, 4)}$.`],
        verify: { kind: "zero", fn: x => { const v = { W: [x, Qh - x], Qc: [Qh - x, x], e: [x / 100 * Qh, Qh - x / 100 * Qh] }[ask]; return [(Qh - v[0] - v[1]) / Qh, ask === "e" ? (v[1] - Qc) / Qh : ask === "W" ? (v[0] - e * Qh) / Qh : (v[0] - W) / Qh]; } }
      };
    }
  };
  T["f2b-entropia-num"] = {
    type: "numeric", concepts: ["f2b-entropia"], difficulty: 2,
    generate(r) {
      const v = r.pick(["calentar", "fundir", "iso"]);
      if (v === "calentar") {
        const m = r.int(1, 10) / 2, T1 = r.int(5, 40) + 273.15, T2 = r.int(50, 95) + 273.15, c = 4186, dS = m * c * Math.log(T2 / T1);
        return { prompt: `¿Cuánto cambia la entropía (J/K) de $${dec(m)}$ kg de agua que se calienta de $${num(T1 - 273.15)}\\,^\\circ$C a $${num(T2 - 273.15)}\\,^\\circ$C? ($c = 4186$ J/(kg K))`, answer: dS,
          solution: [`[[f2b-entropia|Entropía]]: $\\Delta S = \\int\\frac{dQ}{T} = \\int_{T_1}^{T_2}\\frac{mc\\,dT}{T} = mc\\ln\\frac{T_2}{T_1}$ (en kelvin).`, `$\\Delta S = ${dec(m)}\\cdot4186\\ln\\frac{${num(T2, 5)}}{${num(T1, 5)}} \\approx ${num(dS, 4)}$ J/K.`],
          verify: { kind: "integral", f: Tt => m * c / Tt, a: T1, b: T2 } };
      }
      if (v === "fundir") {
        const m = r.int(1, 20) / 10, dS = m * 3.34e5 / 273.15;
        return { prompt: `¿Cuánto aumenta la entropía (J/K) de $${dec(m)}$ kg de hielo que se funde a $0\\,^\\circ$C? ($L_f = 3{,}34\\times10^5$ J/kg)`, answer: dS,
          solution: [`A temperatura constante: $\\Delta S = \\frac{Q}{T} = \\frac{mL_f}{T}$ ([[f2b-entropia]]).`, `$\\Delta S = \\frac{${dec(m)}\\cdot3{,}34\\times10^5}{273{,}15} \\approx ${num(dS, 4)}$ J/K.`],
          verify: { kind: "integral", f: () => m * 3.34e5 / 273.15 / 1, a: 0, b: 1 } };
      }
      const n = r.int(1, 6) / 2, V1 = r.int(1, 10), V2 = r.int(11, 40), dS = n * Rg * Math.log(V2 / V1);
      return { prompt: `$${dec(n)}$ mol de gas ideal se expanden isotérmicamente de $${V1}$ L a $${V2}$ L. ¿Cuánto cambia su entropía (J/K)?`, answer: dS,
        solution: [`Isotérmico: $Q = W = nRT\\ln\\frac{V_2}{V_1}$, así que $\\Delta S = \\frac QT = nR\\ln\\frac{V_2}{V_1}$ ([[f2b-entropia]]).`, `$\\Delta S \\approx ${num(dS, 4)}$ J/K (positivo: el gas ocupa más espacio, hay más microestados).`],
        verify: { kind: "integral", f: V => n * Rg / V, a: V1, b: V2 } };
    }
  };
  T["f2b-segunda-vf"] = {
    type: "tf", concepts: ["f2b-segunda-ley"], difficulty: 2,
    generate(r) {
      const Thc = r.int(150, 500), Tcc = r.int(0, 50), Th = Thc + 273.15, Tc = Tcc + 273.15, ec = 1 - Tc / Th;
      const claim = Math.round(100 * (ec + r.pick([-0.15, -0.05, 0.05, 0.12])));
      if (claim <= 0 || claim >= 100 || Math.abs(claim / 100 - ec) < 0.01) return null;
      const truth = claim / 100 <= ec;
      return {
        prompt: `Un inventor dice que su motor trabaja entre $${Thc}\\,^\\circ$C y $${Tcc}\\,^\\circ$C con una eficiencia del $${claim}\\%$. <b>Verdadero o falso:</b> eso es posible según la segunda ley.`,
        answer: truth,
        explanation: `La eficiencia máxima entre esas temperaturas es la de Carnot: $1 - \\frac{${num(Tc, 5)}}{${num(Th, 5)}} \\approx ${num(100 * ec, 3)}\\%$. ${truth ? "El valor declarado está por debajo: es posible." : "El valor declarado la supera: es imposible ([[f2b-segunda-ley|segunda ley]])."}`,
        solution: [`Ninguna máquina que trabaje entre dos temperaturas puede superar la eficiencia de Carnot.`],
        verify: { kind: "truth", fn: () => claim / 100 <= carnotEff(Th, Tc) }
      };
    }
  };

  const cards = {
    "f2b-segunda-ley": {
      title: "Segunda ley: máquinas térmicas, refrigeradores y Carnot", aliases: ["segunda ley de la termodinámica", "máquina térmica", "máquinas térmicas", "ciclo de Carnot", "Carnot", "refrigerador", "eficiencia térmica", "coeficiente de rendimiento"], concepts: ["f2b-segunda-ley"],
      summary: "No se puede convertir todo el calor en trabajo. Entre T_H y T_C: e ≤ 1 − T_C/T_H (Carnot).",
      def: [R`**Máquina térmica:** toma $Q_H$ de la fuente caliente, hace un trabajo $W$ y entrega $Q_C$ a la fría: $W = Q_H - Q_C$ y $e = \frac{W}{Q_H}$. **Refrigerador:** usa $W$ para sacar $Q_C$ de lo frío, con $\text{COP} = \frac{Q_C}{W}$.`,
        R`**Segunda ley** (Kelvin-Planck): es imposible un ciclo que convierta todo el calor de una fuente en trabajo. (Clausius, equivalente: el calor no pasa solo de lo frío a lo caliente.)`,
        R`**Carnot:** la máxima eficiencia entre $T_H$ y $T_C$ es $e_C = 1 - \frac{T_C}{T_H}$, y el máximo COP es $\frac{T_C}{T_H - T_C}$ (temperaturas en kelvin).`],
      idea: [R`El ciclo de Carnot (dos isotermas y dos adiabáticas, todo reversible) es el ideal. Los motores reales (Otto, diésel) están por debajo por las irreversibilidades. Para mejorar la eficiencia conviene que la fuente caliente esté lo más caliente posible.`],
      demo: [R`**Eficiencia de Carnot con gas ideal.** En las isotermas: $Q_H = nRT_H\ln\frac{V_2}{V_1}$ y $Q_C = nRT_C\ln\frac{V_3}{V_4}$.`, R`Las adiabáticas cumplen $T_HV_2^{\gamma-1} = T_CV_3^{\gamma-1}$ y $T_HV_1^{\gamma-1} = T_CV_4^{\gamma-1}$, así que $\frac{V_3}{V_4} = \frac{V_2}{V_1}$.`, R`Entonces $\frac{Q_C}{Q_H} = \frac{T_C}{T_H}$ y $e = 1 - \frac{T_C}{T_H}$. $\blacksquare$`],
      examples: [{ q: R`Una central entre 500 °C y 30 °C.`, steps: [R`$e_C = 1 - \frac{303}{773} \approx 61\%$. Las reales andan cerca del 40 %.`] }],
      see: ["f2b-entropia", "f2b-procesos"]
    },
    "f2b-entropia": {
      title: "Entropía", aliases: ["entropía", "procesos irreversibles", "proceso reversible"], concepts: ["f2b-entropia"],
      summary: "dS = dQ_rev/T. En un sistema aislado la entropía nunca disminuye: ΔS ≥ 0.",
      def: [R`$$\Delta S = \int\frac{dQ_{\text{rev}}}{T}$$ calculada por un camino **reversible** entre los dos estados (la entropía es función de estado). Unidades: J/K.`,
        R`**Segunda ley en términos de entropía:** en un sistema aislado, $\Delta S \ge 0$; vale el igual solo para procesos reversibles.`],
      idea: [R`La entropía mide el número de microestados compatibles con el estado macroscópico ($S = k\ln\Omega$): mezclar, expandir y calentar la aumentan. Es la "flecha del tiempo": los procesos espontáneos van hacia mayor entropía total.`,
        R`Casos útiles: a temperatura constante, $\Delta S = \frac{Q}{T}$; al calentar, $\Delta S = mc\ln\frac{T_2}{T_1}$; en una expansión isotérmica de gas ideal, $nR\ln\frac{V_2}{V_1}$.`],
      examples: [{ q: R`Pasan 1000 J de un cuerpo a 400 K a otro a 300 K. ¿Cambio total de entropía?`, steps: [R`$\Delta S = -\frac{1000}{400} + \frac{1000}{300} \approx +0{,}83$ J/K $> 0$: es espontáneo.`] }],
      see: ["f2b-segunda-ley", "integral-definida"]
    }
  };

  E.extendCourse("f102b", {
    concepts: { "f2b-segunda-ley": { name: "Máquinas, refrigeradores y Carnot" }, "f2b-entropia": { name: "Entropía" } },
    templates: T,
    units: [{
      id: "f2b-segunda-u", order: 4, program: "Unidad 4", title: "Segunda ley de la termodinámica", icon: "flame",
      diagnostic: ["f2b-maquina-num", "f2b-carnot-num", "f2b-entropia-num"],
      lessons: [
        { id: "f2b-maquinas", title: "Máquinas térmicas y Carnot", templates: ["f2b-maquina-num", "f2b-carnot-num", "f2b-segunda-vf"], theory: ["f2b-segunda-ley"],
          intro: R`$e = \frac{W}{Q_H} \le 1 - \frac{T_C}{T_H}$, con temperaturas en kelvin.` },
        { id: "f2b-entropia", title: "Entropía", templates: ["f2b-entropia-num"], theory: ["f2b-entropia", "f2b-segunda-ley"],
          intro: R`$\Delta S = \int\frac{dQ_{rev}}{T}$. En un sistema aislado, la entropía no disminuye.` }
      ]
    }],
    cards
  });
})();
