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
      demo: [R`**Paso 1 (conversión a Fahrenheit).** Las dos escalas son lineales, así que se relacionan por una recta, $T_F = aT_C + b$. Para encontrar $a$ y $b$ alcanzan dos puntos fijos. En la congelación del agua, $0\,^\circ$C $= 32\,^\circ$F, así que $b = 32$. En la ebullición, $100\,^\circ$C $= 212\,^\circ$F, así que $$a = \frac{212 - 32}{100 - 0} = \frac95, \qquad T_F = \frac95T_C + 32.$$`,
        R`**Paso 2 ($\beta \approx 3\alpha$: el planteo).** Tomamos un cubo de lado $L_0$ de un sólido que se dilata igual en todas las direcciones. Cada arista cumple la dilatación lineal por separado, así que pasa a medir $L_0(1 + \alpha\Delta T)$.`,
        R`**Paso 3.** El volumen nuevo es el cubo de la arista. Desarrollamos el binomio: $$V = L_0^3(1 + \alpha\Delta T)^3 = V_0\left(1 + 3\alpha\Delta T + 3\alpha^2\Delta T^2 + \alpha^3\Delta T^3\right).$$`,
        R`**Paso 4 (qué se desprecia).** En los sólidos $\alpha \sim 10^{-5}$ K$^{-1}$, así que aun con $\Delta T = 100$ K, $\alpha\Delta T \sim 10^{-3}$. Su cuadrado es del orden de $10^{-6}$, mil veces menor, y su cubo, todavía menos. Quedándonos con el término de primer orden, $\Delta V = V - V_0 \approx 3\alpha V_0\Delta T$, o sea $\beta \approx 3\alpha$. Un cuerpo de cualquier forma se puede pensar como muchos cubitos, y en cada uno vale lo mismo.`],
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
      demo: [R`**Paso 1 (hipótesis).** Mezclamos una masa $m_1$ (calor específico $c_1$, a temperatura $T_1$) con una $m_2$ ($c_2$, a $T_2$), dentro de un recipiente aislado: no entra ni sale calor. Suponemos que no hay cambios de fase y que los $c$ no dependen de la temperatura. Por la ley cero, al final las dos quedan a una misma temperatura $T_f$.`,
        R`**Paso 2 (conservación de la energía).** Cada cuerpo recibe $Q_i = m_ic_i(T_f - T_i)$: positivo si se calienta, negativo si se enfría. Como el sistema está aislado, lo que uno cede lo gana el otro, y la suma es cero: $$m_1c_1(T_f - T_1) + m_2c_2(T_f - T_2) = 0.$$`,
        R`**Paso 3.** Distribuimos, juntamos los términos con $T_f$ y sacamos factor común: $T_f(m_1c_1 + m_2c_2) = m_1c_1T_1 + m_2c_2T_2$. Despejando, $$T_f = \frac{m_1c_1T_1 + m_2c_2T_2}{m_1c_1 + m_2c_2}.$$`,
        R`**Paso 4 (cómo leerlo).** Es un promedio de $T_1$ y $T_2$ pesado por las capacidades caloríficas $m_ic_i$. Por eso $T_f$ queda entre las dos temperaturas iniciales, y más cerca de la del cuerpo con mayor $mc$: es el que más cuesta cambiarle la temperatura.`,
        R`**Paso 5 (con cambio de fase).** Durante un cambio de fase la temperatura no cambia, así que ese calor va en un término aparte, $mL$, que se suma a los de calentamiento. Va con signo $+$ si la sustancia absorbe calor (funde o se evapora) y con $-$ si lo cede (se solidifica o se condensa). La ecuación sigue siendo $\sum Q = 0$.`],
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
      demo: [R`**Paso 1 (régimen estacionario).** Las temperaturas ya no cambian con el tiempo. Entonces ninguna capa acumula energía: el calor por segundo que entra a cada capa es igual al que sale. Por lo tanto, el mismo $H$ atraviesa todas las capas.`,
        R`**Paso 2 (Fourier en cada capa).** En la capa $i$, de espesor $L_i$ y conductividad $k_i$, la ley de Fourier dice $H = \frac{k_iA\,\Delta T_i}{L_i}$. Despejamos la caída de temperatura: $$\Delta T_i = H\,\frac{L_i}{k_iA} = H\,R_i.$$`,
        R`**Paso 3.** La caída total, de $T_H$ a $T_C$, es la suma de las caídas en cada capa (las temperaturas de las interfaces intermedias se cancelan). Como $H$ es el mismo en todas, sale de factor común: $$T_H - T_C = \sum_i\Delta T_i = H\,(R_1 + R_2 + \cdots).$$`,
        R`**Paso 4.** Despejando, $H = \dfrac{T_H - T_C}{R_1 + R_2 + \cdots}$. Es la misma cuenta que la de resistencias eléctricas en serie, con la diferencia de temperatura en el papel de la tensión y $H$ en el de la corriente.`,
        R`**Paso 5 (el factor 16).** Por Stefan-Boltzmann, con $e$, $\sigma$ y $A$ fijos, la potencia irradiada es proporcional a $T^4$. Si la temperatura absoluta se duplica, $(2T)^4 = 2^4T^4 = 16\,T^4$. Ojo: tiene que ser en kelvin; pasar de $20$ a $40\,^\circ$C no es duplicar $T$.`],
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
      demo: [R`**Paso 1.** Para una cantidad fija de gas, $n$ y $R$ son constantes. Escribimos la ecuación de estado como $$\frac{pV}{T} = nR = \text{constante}.$$`,
        R`**Paso 2 (las tres leyes clásicas).** Fijando una variable más, sale cada una. Si $T$ es constante, $pV = nRT$ es constante (Boyle). Si $p$ es constante, $\frac VT = \frac{nR}{p}$ es constante (Charles). Si $V$ es constante, $\frac pT = \frac{nR}{V}$ es constante (Gay-Lussac).`,
        R`**Paso 3 (dos estados).** Si el mismo gas pasa de un estado a otro, en los dos el cociente vale $nR$. Igualando: $$\frac{p_1V_1}{T_1} = \frac{p_2V_2}{T_2}.$$`,
        R`**Paso 4 (por molécula).** El número de moléculas es $N = nN_A$, o sea $n = \frac{N}{N_A}$. Reemplazando, $nR = N\,\frac{R}{N_A} = Nk$, con $$k = \frac{R}{N_A} = \frac{8{,}314}{6{,}022\times10^{23}} \approx 1{,}381\times10^{-23}\ \text{J/K}.$$ Así, $pV = NkT$.`],
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
      demo: [R`**Paso 1 (modelo).** Tomamos $N$ moléculas de masa $m$ en una caja cúbica de lado $L$. Suponemos que son puntuales, que no interactúan entre sí y que chocan elásticamente con las paredes. Miramos una molécula que choca con la pared perpendicular a $x$: en el choque elástico su $v_x$ cambia de signo, así que su impulso cambia en $-2mv_x$. Por la tercera ley de Newton, la pared recibe $+2mv_x$.`,
        R`**Paso 2 (fuerza media de una molécula).** Para volver a la misma pared tiene que ir a la opuesta y volver: recorre $2L$ en la dirección $x$, a rapidez $|v_x|$ (los choques con las otras paredes no cambian $v_x$). Tarda $\frac{2L}{|v_x|}$. La fuerza media es el impulso dividido por ese tiempo: $$\bar F = \frac{2m|v_x|}{2L/|v_x|} = \frac{mv_x^2}{L}.$$`,
        R`**Paso 3 (presión).** Sumamos sobre las $N$ moléculas: $F = \frac{m}{L}\sum v_x^2 = \frac{Nm\langle v_x^2\rangle}{L}$. La presión es fuerza sobre área, $L^2$, y $L^3 = V$: $$p = \frac{Nm\langle v_x^2\rangle}{V}.$$`,
        R`**Paso 4 (ninguna dirección es especial).** Como $v^2 = v_x^2 + v_y^2 + v_z^2$ y los tres promedios son iguales, $\langle v_x^2\rangle = \frac13\langle v^2\rangle$. Queda $$pV = \frac13Nm\langle v^2\rangle = \frac23N\Big\langle\frac12mv^2\Big\rangle.$$`,
        R`**Paso 5 (temperatura y energía cinética).** Comparamos con la ecuación de estado $pV = NkT$ ([[f2b-gas-ideal]]): $\frac23N\langle\frac12mv^2\rangle = NkT$, así que $\langle\frac12mv^2\rangle = \frac32kT$. Despejando, $v_{rms} = \sqrt{\langle v^2\rangle} = \sqrt{\frac{3kT}{m}}$. Multiplicando arriba y abajo por $N_A$, con $kN_A = R$ y $mN_A = M$ (la masa molar), queda $\sqrt{\frac{3RT}{M}}$. $\blacksquare$`,
        R`**Paso 6 ($C_V$ del monoatómico).** En un gas monoatómico ideal toda la energía interna es cinética de traslación: $U = N\cdot\frac32kT = \frac32nRT$. El calor específico molar a volumen constante es cuánto sube $U$ por mol y por kelvin: $C_V = \frac1n\frac{dU}{dT} = \frac32R$.`,
        R`**Paso 7 ($C_p = C_V + R$).** A presión constante, por la [[f2b-primera-ley|primera ley]], el calor es $Q = \Delta U + W$. La energía interna depende solo de $T$, así que $\Delta U = nC_V\Delta T$ igual que a volumen constante. El trabajo es $p\,\Delta V$, y de $pV = nRT$ con $p$ fija, $p\,\Delta V = nR\,\Delta T$. Entonces $nC_p\Delta T = nC_V\Delta T + nR\,\Delta T$; dividiendo por $n\,\Delta T$, $C_p = C_V + R$. $\blacksquare$`],
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
      demo: [R`**Paso 1 (el trabajo de un gas).** El gas empuja un pistón de área $A$; como la presión es fuerza por unidad de área, la fuerza es $pA$. Si el pistón avanza $dx$, el trabajo es fuerza por desplazamiento, $pA\,dx$. Y $A\,dx$ es justo lo que aumentó el volumen: $dW = p\,dV$.`,
        R`**Paso 2.** Sumando todos los tramitos del proceso, $W = \int_{V_1}^{V_2}p\,dV$. En el diagrama $pV$ es el área bajo la curva: positiva si el gas se expande, negativa si se comprime.`,
        R`**Paso 3 ($W$ depende del camino).** Vamos de $(p_1, V_1)$ a $(p_2, V_2)$, con $V_2 > V_1$ y $p_1 > p_2$, por dos caminos. **Camino 1:** primero expandimos a presión $p_1$ hasta $V_2$ y después enfriamos a volumen constante hasta $p_2$. **Camino 2:** primero enfriamos a volumen $V_1$ hasta $p_2$ y después expandimos a presión $p_2$. A volumen constante no hay trabajo, así que $$W_1 = p_1(V_2 - V_1), \qquad W_2 = p_2(V_2 - V_1).$$ Son distintos porque $p_1 \neq p_2$.`,
        R`**Paso 4 ($Q$ también).** $U$ es función de estado: los dos caminos empiezan y terminan en los mismos estados, así que tienen el mismo $\Delta U$. De la primera ley, $Q = \Delta U + W$; como los $W$ son distintos, los $Q$ también. Lo que se conserva entre caminos es $Q - W$.`,
        R`**Paso 5 (gas ideal: a volumen constante).** Si $V$ no cambia, $W = 0$ y la primera ley da $\Delta U = Q$. Y ese calor es, por definición del calor específico molar a volumen constante, $Q = nC_V\Delta T$. Entonces $\Delta U = nC_V\Delta T$ en un proceso isocórico.`,
        R`**Paso 6 (en cualquier proceso).** En un gas ideal las moléculas no interactúan, así que $U$ es solo energía cinética y depende solo de $T$ ([[f2b-cinetica]]). Dos procesos que van de $T_1$ a $T_2$ tienen el mismo $\Delta U = U(T_2) - U(T_1)$, y ya lo calculamos con uno isocórico: $\Delta U = nC_V\Delta T$ siempre. $\blacksquare$`],
      examples: [{ q: R`Un gas recibe 500 J y se expande haciendo 200 J de trabajo. ¿$\Delta U$?`, steps: [R`$\Delta U = 500 - 200 = 300$ J: se calienta.`] }],
      see: ["f2b-procesos", "f2b-gas-ideal", "f2b-segunda-ley"]
    },
    "f2b-procesos": {
      title: "Procesos termodinámicos del gas ideal", aliases: ["proceso isotérmico", "proceso isobárico", "proceso isocórico", "proceso adiabático", "isotérmico", "isobárico", "isocórico", "adiabático", "adiabáticamente"], concepts: ["f2b-procesos"],
      summary: "Isotérmico: ΔU = 0, W = nRT ln(V₂/V₁). Isobárico: W = pΔV. Isocórico: W = 0. Adiabático: Q = 0, pV^γ constante.",
      def: [R`• **Isocórico** ($V$ constante): $W = 0$, $Q = \Delta U = nC_V\Delta T$.<br>• **Isobárico** ($p$ constante): $W = p\Delta V$, $Q = nC_p\Delta T$.<br>• **Isotérmico** ($T$ constante): $\Delta U = 0$, $Q = W = nRT\ln\frac{V_2}{V_1}$.<br>• **Adiabático** ($Q = 0$): $\Delta U = -W$, y si es reversible, $pV^\gamma$ y $TV^{\gamma-1}$ son constantes, con $\gamma = \frac{C_p}{C_V}$.`],
      idea: [R`En el diagrama $pV$, una adiabática cae más empinada que una isoterma: al expandirse sin recibir calor, el gas paga el trabajo con su energía interna y se enfría. Por eso el aire que sube en la atmósfera se enfría y se forman nubes.`],
      demo: [R`**Paso 1 (isotérmico).** En un gas ideal $U$ depende solo de $T$; si $T$ no cambia, $\Delta U = 0$ y la primera ley da $Q = W$. Para el trabajo usamos $p = \frac{nRT}{V}$; como $T$ es constante, sale de la integral: $$W = \int_{V_1}^{V_2}\frac{nRT}{V}\,dV = nRT\ln\frac{V_2}{V_1}.$$`,
        R`**Paso 2 (isobárico).** Con $p$ constante, sale de la integral: $W = p\,\Delta V$. Por la primera ley, $Q = \Delta U + W = nC_V\Delta T + nR\,\Delta T$ (porque $p\,\Delta V = nR\,\Delta T$ a $p$ fija). Con $C_p = C_V + R$, queda $Q = nC_p\Delta T$.`,
        R`**Paso 3 (adiabático: el planteo).** Con $Q = 0$, la primera ley en un tramito queda $dU = -p\,dV$. Si el proceso es reversible, el gas pasa por estados de equilibrio y en cada instante vale $p = \frac{nRT}{V}$. Con $dU = nC_V\,dT$: $$nC_V\,dT = -\frac{nRT}{V}\,dV.$$`,
        R`**Paso 4 (separar variables).** Dividimos por $nC_VT$: $\frac{dT}{T} = -\frac{R}{C_V}\frac{dV}{V}$. Como $R = C_p - C_V$, el cociente es $\frac{R}{C_V} = \frac{C_p}{C_V} - 1 = \gamma - 1$: $$\frac{dT}{T} = -(\gamma - 1)\frac{dV}{V}.$$`,
        R`**Paso 5 (integrar).** Integrando los dos lados, $\ln T = -(\gamma - 1)\ln V + C$. Pasamos el término a la izquierda y usamos que $a\ln V = \ln V^a$: $\ln\big(TV^{\gamma-1}\big) = C$, así que $TV^{\gamma-1}$ es constante.`,
        R`**Paso 6 ($pV^\gamma$).** Reemplazamos $T = \frac{pV}{nR}$: $\frac{pV}{nR}V^{\gamma-1} = \frac{pV^\gamma}{nR}$ es constante, y como $nR$ también lo es, $pV^\gamma$ es constante. $\blacksquare$`,
        R`**Paso 7 (por qué la adiabática es más empinada).** Derivando $pV^\gamma = $ cte, la pendiente en el diagrama $pV$ es $\frac{dp}{dV} = -\gamma\frac pV$. En la isoterma, de $pV = $ cte, es $-\frac pV$. Como $\gamma > 1$, por el mismo punto la adiabática cae más rápido.`],
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
      demo: [R`**Paso 1 (el ciclo de Carnot con gas ideal).** Tiene cuatro tramos reversibles: $1\to2$, expansión isotérmica a $T_H$ (absorbe $Q_H$); $2\to3$, expansión adiabática, en la que el gas se enfría hasta $T_C$; $3\to4$, compresión isotérmica a $T_C$ (cede $Q_C$); y $4\to1$, compresión adiabática, que lo vuelve a $T_H$.`,
        R`**Paso 2 (las isotermas).** En una isoterma de gas ideal $\Delta U = 0$, así que el calor es igual al trabajo, $nRT\ln\frac{V_f}{V_i}$ ([[f2b-procesos]]). Tomando valores positivos: $$Q_H = nRT_H\ln\frac{V_2}{V_1}, \qquad Q_C = nRT_C\ln\frac{V_3}{V_4}.$$`,
        R`**Paso 3 (las adiabáticas).** En cada adiabática $TV^{\gamma-1}$ es constante: $T_HV_2^{\gamma-1} = T_CV_3^{\gamma-1}$ y $T_HV_1^{\gamma-1} = T_CV_4^{\gamma-1}$. Dividiendo la primera por la segunda, las temperaturas se cancelan: $\left(\frac{V_2}{V_1}\right)^{\gamma-1} = \left(\frac{V_3}{V_4}\right)^{\gamma-1}$, así que $\frac{V_3}{V_4} = \frac{V_2}{V_1}$.`,
        R`**Paso 4.** Entonces los dos logaritmos del paso 2 son iguales y se cancelan en el cociente: $\frac{Q_C}{Q_H} = \frac{T_C}{T_H}$.`,
        R`**Paso 5 (eficiencia).** Por la primera ley en un ciclo completo ($\Delta U = 0$), $W = Q_H - Q_C$. Entonces $$e = \frac{W}{Q_H} = 1 - \frac{Q_C}{Q_H} = 1 - \frac{T_C}{T_H}. \quad\blacksquare$$`,
        R`**Paso 6 (refrigerador).** Al ser reversible, el ciclo se puede recorrer al revés con los mismos calores, ahora sacando $Q_C$ de lo frío. Su COP es $\frac{Q_C}{W} = \frac{Q_C}{Q_H - Q_C}$; dividiendo arriba y abajo por $Q_H$ y usando el paso 4, queda $\frac{T_C}{T_H - T_C}$. $\blacksquare$`,
        R`**Paso 7 (por qué nadie supera a Carnot).** Supongamos una máquina $X$ con $e_X > e_C$ entre las mismas fuentes. Con el trabajo $W$ que produce hacemos andar un Carnot al revés. $X$ toma $\frac{W}{e_X}$ de la fuente caliente, y el Carnot le devuelve $\frac{W}{e_C}$, que es más. El trabajo neto es cero y la fuente caliente gana calor neto, que sale de la fría: el calor pasaría solo de lo frío a lo caliente, y eso contradice el enunciado de Clausius. $\blacksquare$`],
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
      demo: [R`**Paso 1 (expansión isotérmica: el planteo).** La entropía es función de estado, así que podemos calcular $\Delta S$ por un camino reversible cualquiera entre los dos estados: elegimos la isoterma reversible. Ahí $\Delta U = 0$ (gas ideal a $T$ fija), así que por la primera ley $dQ = p\,dV = \frac{nRT}{V}\,dV$.`,
        R`**Paso 2.** Dividimos por $T$, que es constante, y se simplifica: $$\Delta S = \int\frac{dQ}{T} = nR\int_{V_1}^{V_2}\frac{dV}{V} = nR\ln\frac{V_2}{V_1}.$$ Es positiva si el gas se expande.`,
        R`**Paso 3 (calentar un cuerpo).** Lo calentamos de forma reversible, poniéndolo en contacto con fuentes cada vez un poquito más calientes. En cada tramito recibe $dQ = mc\,dT$ a temperatura $T$. Con $c$ constante: $$\Delta S = \int_{T_1}^{T_2}\frac{mc\,dT}{T} = mc\ln\frac{T_2}{T_1}.$$`,
        R`**Paso 4 (a temperatura constante).** Si $T$ no cambia, como en un cambio de fase, sale de la integral: $\Delta S = \frac1T\int dQ = \frac QT$.`,
        R`**Paso 5 (el calor va de lo caliente a lo frío).** Pasa un calor $Q > 0$ de un cuerpo grande a $T_H$ a otro grande a $T_C$, tan grandes que sus temperaturas casi no cambian. Por el paso 4, el primero pierde $\frac{Q}{T_H}$ de entropía y el segundo gana $\frac{Q}{T_C}$. El cambio total del sistema aislado es $$\Delta S = Q\left(\frac{1}{T_C} - \frac{1}{T_H}\right).$$`,
        R`**Paso 6.** Eso es positivo justo cuando $T_H > T_C$. Si el calor fuera de lo frío a lo caliente daría $\Delta S < 0$, y la segunda ley lo prohíbe para un sistema aislado. Así, el enunciado con entropía contiene el de Clausius. $\blacksquare$`],
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

/* =====================================================================
 *  UNIDAD 5 · ONDAS MECÁNICAS Y ELECTROMAGNÉTICAS
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {};
  const dec = x => String(x).replace(".", "{,}");
  const c = 3e8;
  // cuerda fija en los extremos simulada por diferencias finitas: período del modo n medido en un antinodo
  function stringPeriod(L, v, n) {
    const N = 60, h = L / N, dt = 0.5 * h / v, r2 = (v * dt / h) ** 2;
    let prev = Array.from({ length: N + 1 }, (_, i) => Math.sin(n * Math.PI * i / N)), cur = prev.slice();
    // primer paso con velocidad inicial nula
    for (let i = 1; i < N; i++) cur[i] = prev[i] + 0.5 * r2 * (prev[i + 1] - 2 * prev[i] + prev[i - 1]);
    const j = Math.round(N / (2 * n)); let t = dt, crossings = [];
    let last = cur[j];
    for (let step = 0; step < 20000 && crossings.length < 3; step++) {
      const next = cur.map((u, i) => (i === 0 || i === N ? 0 : 2 * u - prev[i] + r2 * (cur[i + 1] - 2 * u + cur[i - 1])));
      prev = cur; cur = next; t += dt;
      if (Math.sign(cur[j]) !== Math.sign(last) && cur[j] !== 0) { const s = last / (last - cur[j]); crossings.push(t - dt + s * dt); }
      last = cur[j];
    }
    return crossings[2] - crossings[0];
  }

  T["f2b-onda-num"] = {
    type: "numeric", concepts: ["f2b-ondas"], difficulty: 2,
    generate(r) {
      const A = r.int(1, 10) / 100, k = r.int(1, 20) / 2, w = r.int(2, 60), ask = r.pick(["lambda", "f", "v", "T"]);
      const ans = { lambda: 2 * Math.PI / k, f: w / (2 * Math.PI), v: w / k, T: 2 * Math.PI / w }[ask];
      return {
        prompt: `Una onda en una cuerda es $y(x, t) = ${dec(A)}\\sin(${dec(k)}x - ${w}t)$ (SI). Calculá ${{ lambda: "la longitud de onda (m)", f: "la frecuencia (Hz)", v: "la rapidez de propagación (m/s)", T: "el período (s)" }[ask]}.`,
        answer: ans,
        solution: [`[[f2b-ondas|Onda armónica]] $y = A\\sin(kx - \\omega t)$: $\\lambda = \\frac{2\\pi}{k}$, $f = \\frac{\\omega}{2\\pi}$, $v = \\frac{\\omega}{k} = \\lambda f$.`, `Respuesta: $\\approx ${num(ans, 4)}$.`],
        // verificación: se sigue una cresta en el tiempo (o se miden distancias entre crestas) resolviendo la fase numéricamente
        verify: { kind: "value", tol: 1e-6, fn: () => {
          const crest = t => { let lo = (Math.PI / 2 + w * t) / k - 1e-3, hi = lo + 2e-3; for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (k * mid - w * t < Math.PI / 2) lo = mid; else hi = mid; } return lo; };
          if (ask === "v") return (crest(0.01) - crest(0)) / 0.01;
          if (ask === "lambda") { const x0 = crest(0); return ((5 * Math.PI / 2) / k) - x0; }
          const Tp = 2 * Math.PI / w; // período: tiempo para que la cresta avance una longitud de onda
          return ask === "T" ? (2 * Math.PI / k) / ((crest(0.01) - crest(0)) / 0.01) : 1 / ((2 * Math.PI / k) / ((crest(0.01) - crest(0)) / 0.01)) + 0 * Tp;
        } }
      };
    }
  };
  T["f2b-cuerda-num"] = {
    type: "numeric", concepts: ["f2b-ondas"], difficulty: 3,
    testN: 60,
    generate(r) {
      const L = r.int(3, 15) / 10, m = r.int(1, 20) / 1000, F = r.int(20, 200), n = r.int(1, 3);
      const mu = m / L, v = Math.sqrt(F / mu), fn = n * v / (2 * L);
      return {
        prompt: `Una cuerda de $${dec(L)}$ m y $${num(m * 1000)}$ g, fija en los dos extremos, está tensa con $${F}$ N. ¿Cuál es la frecuencia (Hz) de su ${n === 1 ? "modo fundamental" : n === 2 ? "segundo armónico" : "tercer armónico"}?`,
        answer: fn,
        solution: [`[[f2b-ondas|Rapidez en una cuerda]]: $v = \\sqrt{\\frac{F}{\\mu}}$ con $\\mu = \\frac mL = ${num(mu, 4)}$ kg/m: $v \\approx ${num(v, 4)}$ m/s.`, `[[f2b-ondas|Ondas estacionarias]] con extremos fijos: $\\lambda_n = \\frac{2L}{n}$, así que $f_n = \\frac{nv}{2L} \\approx ${num(fn, 4)}$ Hz.`],
        verify: { kind: "value", tol: 3e-3, fn: () => 1 / stringPeriod(L, v, n) }
      };
    }
  };
  T["f2b-sonido-num"] = {
    type: "numeric", concepts: ["f2b-sonido"], difficulty: 2,
    generate(r) {
      if (r.bool()) {
        const Tc = r.int(-20, 40), v = 331.3 * Math.sqrt((Tc + 273.15) / 273.15);
        return { prompt: `¿Cuál es la rapidez del sonido en el aire a $${Tc}\\,^\\circ$C? (A $0\\,^\\circ$C vale $331{,}3$ m/s.)`, answer: v,
          solution: [`En un gas, $v = \\sqrt{\\frac{\\gamma RT}{M}}$: crece como $\\sqrt T$ ([[f2b-sonido|sonido]]).`, `$v = 331{,}3\\sqrt{\\frac{${num(Tc + 273.15, 5)}}{273{,}15}} \\approx ${num(v, 4)}$ m/s.`],
          verify: { kind: "value", tol: 2e-3, fn: () => Math.sqrt(1.4 * 8.314 * (Tc + 273.15) / 0.02897) } };
      }
      const P = r.int(1, 100) / 10, rr = r.int(1, 50), I = P / (4 * Math.PI * rr * rr), beta = 10 * Math.log10(I / 1e-12);
      return { prompt: `Un parlante emite $${dec(P)}$ W en todas direcciones. ¿Cuál es el nivel de intensidad (dB) a $${rr}$ m? ($I_0 = 10^{-12}$ W/m²)`, answer: beta,
        solution: [`La potencia se reparte en una esfera: $I = \\frac{P}{4\\pi r^2} \\approx ${num(I, 4)}$ W/m².`, `[[f2b-sonido|Nivel de intensidad]]: $\\beta = 10\\log_{10}\\frac{I}{I_0} \\approx ${num(beta, 4)}$ dB.`],
        verify: { kind: "value", tol: 1e-6, fn: () => 10 * (Math.log(P) - Math.log(4 * Math.PI) - 2 * Math.log(rr) + 12 * Math.LN10) / Math.LN10 } };
    }
  };
  T["f2b-em-num"] = {
    type: "numeric", concepts: ["f2b-em"], difficulty: 1,
    generate(r) {
      const v = r.pick(["fm", "luz", "E0"]);
      if (v === "fm") { const f = r.int(88, 108) * 1e6 + r.int(0, 9) * 1e5; return { prompt: `¿Cuál es la longitud de onda (m) de una radio FM que transmite en $${num(f / 1e6, 4).replace(".", "{,}")}$ MHz?`, answer: c / f,
        solution: [`[[f2b-em|Ondas electromagnéticas]]: $c = \\lambda f$ con $c = 3\\times10^8$ m/s.`, `$\\lambda = \\frac{3\\times10^8}{${num(f / 1e6, 4).replace(".", "{,}")}\\times10^6} \\approx ${num(c / f, 4)}$ m.`],
        verify: { kind: "value", fn: () => 1 / (f / c) } }; }
      if (v === "luz") { const lam = r.int(400, 700); return { prompt: `¿Cuál es la frecuencia (en $10^{14}$ Hz) de una luz de $${lam}$ nm?`, answer: c / (lam * 1e-9) / 1e14,
        solution: [`$f = \\frac c\\lambda$ ([[f2b-em]]).`, `$f = \\frac{3\\times10^8}{${lam}\\times10^{-9}} \\approx ${num(c / (lam * 1e-9) / 1e14, 4)}\\times10^{14}$ Hz.`],
        verify: { kind: "value", fn: () => 3e17 / lam / 1e14 } }; }
      const I = r.int(1, 100) * 10, eps0 = 8.854e-12, E0 = Math.sqrt(2 * I / (c * eps0));
      return { prompt: `Una onda electromagnética plana tiene intensidad $${I}$ W/m². ¿Cuál es la amplitud de su campo eléctrico (V/m)? ($\\varepsilon_0 = 8{,}854\\times10^{-12}$)`, answer: E0,
        solution: [`[[f2b-em|Intensidad]] de una onda EM: $I = \\frac12c\\varepsilon_0E_0^2$.`, `$E_0 = \\sqrt{\\frac{2I}{c\\varepsilon_0}} \\approx ${num(E0, 4)}$ V/m.`],
        verify: { kind: "zero", fn: e => [(0.5 * c * eps0 * e * e - I) / I] } };
    }
  };
  T["f2b-ondas-vf"] = {
    type: "tf", concepts: ["f2b-ondas", "f2b-sonido"], difficulty: 1,
    generate(r) {
      const v = r.pick(["temp", "tension", "frecuencia"]);
      if (v === "temp") {
        const [t1, t2] = r.distinct(2, -20, 40).sort((a, b) => a - b);
        return { prompt: `<b>Verdadero o falso:</b> el sonido viaja más rápido en el aire a $${t2}\\,^\\circ$C que a $${t1}\\,^\\circ$C.`, answer: true,
          explanation: `En un gas $v = \\sqrt{\\gamma RT/M}$: a mayor temperatura absoluta, mayor rapidez ([[f2b-sonido]]).`, solution: [`$v \\propto \\sqrt T$.`],
          verify: { kind: "truth", fn: () => Math.sqrt(t2 + 273.15) > Math.sqrt(t1 + 273.15) } };
      }
      if (v === "tension") {
        const k = r.pick([2, 3, 4]);
        return { prompt: `<b>Verdadero o falso:</b> si se multiplica por $${k}$ la tensión de una cuerda, la rapidez de las ondas en ella también se multiplica por $${k}$.`, answer: false,
          explanation: `$v = \\sqrt{F/\\mu}$: la rapidez se multiplica por $\\sqrt{${k}} \\approx ${num(Math.sqrt(k), 3)}$ ([[f2b-ondas]]).`, solution: [`Para duplicar la rapidez hay que cuadruplicar la tensión.`],
          verify: { kind: "truth", fn: () => Math.abs(Math.sqrt(k * 100 / 0.01) / Math.sqrt(100 / 0.01) - k) < 1e-9 } };
      }
      const n1 = 1, n2 = r.pick([1.33, 1.5, 2.4]);
      return { prompt: `<b>Verdadero o falso:</b> cuando la luz pasa del aire a un medio con $n = ${dec(n2)}$, su frecuencia cambia.`, answer: false,
        explanation: `La frecuencia la impone la fuente y no cambia; lo que cambian son la rapidez ($v = c/n$) y la longitud de onda ($\\lambda/n$) ([[f2b-em]]).`, solution: [`$v = \\lambda f$: si $v$ baja con $f$ fija, baja $\\lambda$.`],
        verify: { kind: "truth", fn: () => { const f = 5e14, v2 = 3e8 / n2, lam2 = (3e8 / f) / n2; return Math.abs(v2 / lam2 - f) > 1; } } };
    }
  };

  const cards = {
    "f2b-ondas": {
      title: "Ondas mecánicas", aliases: ["onda", "ondas", "longitud de onda", "número de onda", "ondas transversales", "ondas longitudinales", "rapidez de una onda", "ondas estacionarias", "armónicos", "modo fundamental", "onda armónica"], concepts: ["f2b-ondas"],
      summary: "Una onda transporta energía sin transportar materia. y = A sen(kx − ωt), con v = ω/k = λf. En una cuerda, v = √(F/μ).",
      def: [R`Una **onda mecánica** es una perturbación que se propaga en un medio. **Transversal:** el medio oscila perpendicular a la propagación (cuerda). **Longitudinal:** oscila a lo largo (sonido).`,
        R`**Onda armónica:** $y(x, t) = A\sin(kx - \omega t)$, con $k = \frac{2\pi}{\lambda}$ (número de onda), $\omega = 2\pi f$, y rapidez $v = \frac{\omega}{k} = \lambda f$. Cumple la **ecuación de onda** $\frac{\partial^2y}{\partial t^2} = v^2\frac{\partial^2y}{\partial x^2}$.`,
        R`**Rapidez en una cuerda:** $v = \sqrt{F/\mu}$ ($F$: tensión, $\mu$: masa por unidad de longitud).`],
      idea: [R`Lo que viaja es la **forma**, no la materia: cada punto de la cuerda solo sube y baja (un [[f1-mas|MAS]]). La rapidez depende del medio, no de la amplitud ni de la frecuencia.`,
        R`**Ondas estacionarias** en una cuerda con extremos fijos: solo entran longitudes de onda $\lambda_n = \frac{2L}{n}$, y las frecuencias permitidas son $f_n = \frac{nv}{2L}$ (los **armónicos**). Así funcionan las guitarras.`,
        { graph: { fns: [x => Math.sin(x), x => Math.sin(x - 1)], xr: [0, 13], yr: [-2, 2] }, caption: R`Una onda en $t = 0$ (violeta) y un rato después (naranja): la forma se corrió hacia la derecha.` }],
      demo: [R`**Paso 1 (derivadas de la onda armónica).** Derivamos $y = A\sin(kx - \omega t)$ dos veces respecto de cada variable, con la regla de la cadena. Cada derivada respecto de $t$ saca un factor $-\omega$ (o $\omega$) y cada una respecto de $x$, un factor $k$; dos veces seguidas vuelve al seno con signo menos: $$\frac{\partial^2y}{\partial t^2} = -\omega^2y, \qquad \frac{\partial^2y}{\partial x^2} = -k^2y.$$`,
        R`**Paso 2.** Despejando $y$ de la segunda y reemplazando en la primera: $\frac{\partial^2y}{\partial t^2} = \frac{\omega^2}{k^2}\frac{\partial^2y}{\partial x^2}$. Es la ecuación de onda con $v = \frac\omega k$.`,
        R`**Paso 3 ($v = \lambda f$).** Seguimos un punto de la forma con fase constante, por ejemplo una cresta: $kx - \omega t = $ cte, o sea $x = \frac\omega kt + $ cte. Ese punto avanza a rapidez $\frac\omega k$. Con $\omega = 2\pi f$ y $k = \frac{2\pi}{\lambda}$: $\frac\omega k = \lambda f$. Dicho de otro modo: en un período la forma avanza una longitud de onda.`,
        R`**Paso 4 (estacionarias: sumar dos ondas).** Sumamos dos ondas iguales que viajan en sentidos opuestos. Usamos $\sin a + \sin b = 2\sin\frac{a+b}{2}\cos\frac{a-b}{2}$, que sale de la [[identidades-trig|fórmula del seno de una suma]]. Con $a = kx - \omega t$ y $b = kx + \omega t$, y como el coseno es par: $$A\sin(kx - \omega t) + A\sin(kx + \omega t) = 2A\sin(kx)\cos(\omega t).$$`,
        R`**Paso 5 (extremos fijos).** Cada punto $x$ oscila con amplitud $2A\sin(kx)$: la forma ya no viaja. En $x = 0$ siempre es $0$. Para que $x = L$ también quede quieto hace falta $\sin(kL) = 0$, o sea $kL = n\pi$. Entonces $\lambda_n = \frac{2\pi}{k} = \frac{2L}{n}$ y $f_n = \frac{v}{\lambda_n} = \frac{nv}{2L}$.`,
        R`**Paso 6 (rapidez en la cuerda: fuerzas).** Tomamos un tramo chico de largo $\Delta x$ y masa $\mu\Delta x$, con amplitudes chicas y despreciando el peso. La tensión tira de cada extremo con módulo $\approx F$, tangente a la cuerda. Las componentes horizontales se cancelan. La vertical en cada extremo es $F\sin\theta \approx F\tan\theta = F\frac{\partial y}{\partial x}$, con signos opuestos en los dos extremos: $$F_y \approx F\left(\frac{\partial y}{\partial x}(x + \Delta x) - \frac{\partial y}{\partial x}(x)\right) \approx F\frac{\partial^2y}{\partial x^2}\,\Delta x.$$`,
        R`**Paso 7 (Newton).** Igualamos a masa por aceleración vertical: $\mu\Delta x\,\frac{\partial^2y}{\partial t^2} = F\frac{\partial^2y}{\partial x^2}\Delta x$. Dividiendo por $\mu\Delta x$ queda la ecuación de onda con $v^2 = \frac F\mu$, o sea $v = \sqrt{F/\mu}$. $\blacksquare$`],
      examples: [{ q: R`Cuerda de guitarra: $L = 0{,}65$ m, $v = 286$ m/s. ¿Fundamental?`, steps: [R`$f_1 = \frac{v}{2L} = \frac{286}{1{,}3} = 220$ Hz (un La).`] }],
      see: ["f2b-sonido", "f2b-em", "f1-mas"]
    },
    "f2b-sonido": {
      title: "Sonido: rapidez, intensidad y decibeles", aliases: ["sonido", "ondas sonoras", "nivel de intensidad", "decibeles", "decibel", "intensidad sonora", "rapidez del sonido"], concepts: ["f2b-sonido"],
      summary: "El sonido es una onda longitudinal de presión. En un gas v = √(γRT/M). Nivel: β = 10 log(I/I₀) dB.",
      def: [R`El **sonido** es una onda longitudinal de presión. En un gas: $v = \sqrt{\frac{\gamma RT}{M}}$ (aire a $20\,^\circ$C: $\approx 343$ m/s).`,
        R`**Intensidad:** potencia por unidad de área; para una fuente puntual, $I = \frac{P}{4\pi r^2}$. **Nivel de intensidad:** $\beta = 10\log_{10}\frac{I}{I_0}$ dB, con $I_0 = 10^{-12}$ W/m² (umbral de audición).`],
      idea: [R`El oído responde de forma logarítmica: cada $10$ dB más es $10$ veces más intensidad. Duplicar la distancia a una fuente puntual baja la intensidad a la cuarta parte, unos $6$ dB.`],
      demo: [R`**Paso 1 (fuente puntual).** La fuente emite una potencia $P$ igual en todas las direcciones, y el medio no absorbe energía. Por conservación de la energía, la energía por segundo que atraviesa cualquier esfera centrada en la fuente es $P$.`,
        R`**Paso 2.** Esa potencia se reparte sobre el área de la esfera, $4\pi r^2$. La intensidad es potencia por unidad de área: $I = \frac{P}{4\pi r^2}$. Si duplicamos $r$, el área se cuadruplica y la intensidad baja a la cuarta parte.`,
        R`**Paso 3 (en decibeles).** Restamos los niveles de dos intensidades y usamos que la resta de logaritmos es el logaritmo del cociente; el $I_0$ se cancela: $$\beta_2 - \beta_1 = 10\log_{10}\frac{I_2}{I_0} - 10\log_{10}\frac{I_1}{I_0} = 10\log_{10}\frac{I_2}{I_1}.$$ Si la intensidad se multiplica por $10$, son $10$ dB más; si se divide por $4$, $10\log_{10}\frac14 \approx -6{,}0$ dB.`,
        R`**Paso 4 (rapidez en un gas: el planteo).** Para una onda de presión en un fluido, $v = \sqrt{B/\rho}$, con $B = -V\frac{dp}{dV}$ el módulo de compresibilidad: igual que $\sqrt{F/\mu}$ en la cuerda, es «rigidez sobre inercia». Las compresiones del sonido son tan rápidas que no da el tiempo para intercambiar calor: son adiabáticas.`,
        R`**Paso 5.** En una adiabática $pV^\gamma$ es constante ([[f2b-procesos]]); derivando, $\frac{dp}{dV} = -\gamma\frac pV$, así que $B = \gamma p$. La densidad sale de $pV = nRT$ con masa $nM$: $\rho = \frac{nM}{V} = \frac{pM}{RT}$. Entonces $$v = \sqrt{\frac{\gamma p}{pM/(RT)}} = \sqrt{\frac{\gamma RT}{M}}.$$ Con $\gamma = 1{,}4$, $M = 0{,}029$ kg/mol y $T = 293$ K da $\approx 343$ m/s.`,
        R`**Paso 6 (comparación).** Es parecida a la $v_{rms} = \sqrt{3RT/M}$ de las moléculas ([[f2b-cinetica]]), un poco menor ($\sqrt{1{,}4/3} \approx 0{,}68$ veces): el sonido lo transportan las moléculas con sus choques. Las dos crecen con $\sqrt T$ y bajan con la masa molar.`],
      examples: [{ q: R`¿Cuántos dB más hay si la intensidad se multiplica por 100?`, steps: [R`$10\log_{10}100 = 20$ dB.`] }],
      see: ["f2b-ondas", "exp-log-func"]
    },
    "f2b-em": {
      title: "Ondas electromagnéticas", aliases: ["ondas electromagnéticas", "onda electromagnética", "espectro electromagnético", "ecuaciones de Maxwell", "velocidad de la luz", "rapidez de la luz"], concepts: ["f2b-em"],
      summary: "Campos E y B que oscilan perpendiculares entre sí y a la propagación, a c = 1/√(μ₀ε₀) ≈ 3×10⁸ m/s en el vacío.",
      def: [R`Las **ecuaciones de Maxwell** predicen ondas de campos $\vec E$ y $\vec B$ perpendiculares entre sí y a la dirección de propagación, que viajan en el vacío a $c = \frac{1}{\sqrt{\mu_0\varepsilon_0}} \approx 3\times10^8$ m/s, con $E = cB$ y $c = \lambda f$.`,
        R`**Intensidad** de una onda senoidal: $I = \frac12c\varepsilon_0E_0^2$. No necesitan un medio para propagarse.`],
      idea: [R`El **espectro electromagnético** va de las ondas de radio (metros o más) a los rayos gamma, pasando por microondas, infrarrojo, visible ($400$–$700$ nm), ultravioleta y rayos X: es todo lo mismo, cambia solo la frecuencia.`,
        R`Que la luz sea una onda electromagnética fue una de las grandes unificaciones de la física: óptica y electromagnetismo son la misma teoría.`],
      demo: [R`**Paso 1 (planteo).** En el vacío (sin cargas ni corrientes), una onda que viaja en $x$, con $\vec E$ en la dirección $y$ y $\vec B$ en la $z$. Los dos campos dependen solo de $x$ y de $t$.`,
        R`**Paso 2 (Faraday).** Aplicamos la ley de Faraday a un rectángulo chico en el plano $xy$, de ancho $dx$ y alto $h$. La circulación de $\vec E$ solo tiene aporte de los lados verticales: $\big(E(x + dx) - E(x)\big)h = \frac{\partial E}{\partial x}\,dx\,h$. El flujo de $\vec B$ es $B\,h\,dx$, y Faraday dice que la circulación es menos la derivada del flujo. Dividiendo por $h\,dx$: $$\frac{\partial E}{\partial x} = -\frac{\partial B}{\partial t}.$$`,
        R`**Paso 3 ($E = cB$).** Reemplazamos $E = E_0\sin(kx - \omega t)$ y $B = B_0\sin(kx - \omega t)$. Queda $kE_0\cos(\cdot) = \omega B_0\cos(\cdot)$, así que $E_0 = \frac\omega k B_0 = vB_0$.`,
        R`**Paso 4 (Ampère-Maxwell).** Sin corrientes, solo queda el término de la corriente de desplazamiento. Con un rectángulo en el plano $xz$ sale, del mismo modo, $\frac{\partial B}{\partial x} = -\mu_0\varepsilon_0\frac{\partial E}{\partial t}$. Con la onda: $kB_0 = \mu_0\varepsilon_0\,\omega E_0$.`,
        R`**Paso 5 (de dónde sale $c$).** Multiplicamos las relaciones de los pasos 3 y 4, $kE_0 = \omega B_0$ y $kB_0 = \mu_0\varepsilon_0\omega E_0$: $k^2E_0B_0 = \mu_0\varepsilon_0\omega^2E_0B_0$. Simplificando, $\left(\frac\omega k\right)^2 = \frac{1}{\mu_0\varepsilon_0}$. La rapidez es $c = \frac{1}{\sqrt{\mu_0\varepsilon_0}} \approx 3\times10^8$ m/s, y $E = cB$. $\blacksquare$`,
        R`**Paso 6 (energía).** La energía por unidad de volumen del campo eléctrico es $\frac12\varepsilon_0E^2$ y la del magnético, $\frac{B^2}{2\mu_0}$. Con $B = \frac Ec$ y $c^2 = \frac{1}{\mu_0\varepsilon_0}$, la magnética es $\frac{E^2}{2\mu_0c^2} = \frac12\varepsilon_0E^2$: las dos son iguales, y en total $u = \varepsilon_0E^2$.`,
        R`**Paso 7 (intensidad).** En un tiempo $dt$ cruza un área $A$ la energía de un cilindro de largo $c\,dt$: $u\,A\,c\,dt$. Por unidad de área y de tiempo, $I = cu = c\varepsilon_0E^2$. Promediando en un período, $\langle\sin^2\rangle = \frac12$, así que $I = \frac12c\varepsilon_0E_0^2$. $\blacksquare$`],
      examples: [{ q: R`¿Longitud de onda de un microondas de 2,45 GHz?`, steps: [R`$\lambda = \frac{3\times10^8}{2{,}45\times10^9} \approx 12$ cm.`] }],
      see: ["f2b-ondas", "f2b-optica"]
    }
  };

  E.extendCourse("f102b", {
    concepts: { "f2b-ondas": { name: "Ondas mecánicas" }, "f2b-sonido": { name: "Sonido" }, "f2b-em": { name: "Ondas electromagnéticas" } },
    templates: T,
    units: [{
      id: "f2b-ondas-u", order: 5, program: "Unidad 5", title: "Ondas mecánicas y electromagnéticas", icon: "volume-2",
      diagnostic: ["f2b-onda-num", "f2b-sonido-num", "f2b-em-num"],
      lessons: [
        { id: "f2b-ondas", title: "Ondas en cuerdas", templates: ["f2b-onda-num", "f2b-cuerda-num", "f2b-ondas-vf"], theory: ["f2b-ondas"],
          intro: R`$y = A\sin(kx - \omega t)$, $v = \lambda f$. En una cuerda, $v = \sqrt{F/\mu}$ y $f_n = \frac{nv}{2L}$.` },
        { id: "f2b-sonido-em", title: "Sonido y ondas electromagnéticas", templates: ["f2b-sonido-num", "f2b-em-num"], theory: ["f2b-sonido", "f2b-em"],
          intro: R`Sonido: $\beta = 10\log\frac{I}{I_0}$. Luz: $c = \lambda f$ e $I = \frac12c\varepsilon_0E_0^2$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 6 · ÓPTICA GEOMÉTRICA
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {};
  const dec = x => String(x).replace(".", "{,}");
  const rad = d => d * Math.PI / 180, deg = x => x * 180 / Math.PI;
  // matrices ABCD (óptica paraxial): espacio libre y lente delgada; la imagen está donde B = 0
  const mul = (P, Q) => [[P[0][0] * Q[0][0] + P[0][1] * Q[1][0], P[0][0] * Q[0][1] + P[0][1] * Q[1][1]], [P[1][0] * Q[0][0] + P[1][1] * Q[1][0], P[1][0] * Q[0][1] + P[1][1] * Q[1][1]]];
  const S = d => [[1, d], [0, 1]], L = f => [[1, 0], [-1 / f, 1]];
  const MEDIOS = [{ n: "agua", v: 1.33 }, { n: "vidrio", v: 1.5 }, { n: "diamante", v: 2.42 }, { n: "acrílico", v: 1.49 }];

  T["f2b-snell-num"] = {
    type: "numeric", concepts: ["f2b-optica"], difficulty: 1,
    generate(r) {
      const m = r.pick(MEDIOS), th1 = r.int(10, 80), ans = deg(Math.asin(Math.sin(rad(th1)) / m.v));
      return {
        prompt: `Un rayo de luz pasa del aire ($n = 1$) al ${m.n} ($n = ${dec(m.v)}$) con un ángulo de incidencia de $${th1}^\\circ$. ¿Cuál es el ángulo de refracción (en grados)?`,
        answer: ans,
        solution: [`[[f2b-optica|Ley de Snell]]: $n_1\\sin\\theta_1 = n_2\\sin\\theta_2$.`, `$\\sin\\theta_2 = \\frac{\\sin ${th1}^\\circ}{${dec(m.v)}} \\Rightarrow \\theta_2 \\approx ${num(ans, 4)}^\\circ$ (se acerca a la normal).`],
        verify: { kind: "zero", fn: a => [Math.sin(rad(th1)) - m.v * Math.sin(rad(a))] }
      };
    }
  };
  T["f2b-critico-num"] = {
    type: "numeric", concepts: ["f2b-optica"], difficulty: 2,
    generate(r) {
      const m = r.pick(MEDIOS), out = r.pick([{ n: "aire", v: 1 }, { n: "agua", v: 1.33 }]);
      if (out.v >= m.v) return null;
      const ans = deg(Math.asin(out.v / m.v));
      return {
        prompt: `¿Cuál es el ángulo crítico (en grados) para la reflexión total interna de la luz que va del ${m.n} ($n = ${dec(m.v)}$) al ${out.n} ($n = ${dec(out.v)}$)?`,
        answer: ans,
        solution: [`[[f2b-optica|Reflexión total interna]]: el ángulo crítico es el que da refracción a $90^\\circ$: $n_1\\sin\\theta_c = n_2$.`, `$\\theta_c = \\arcsin\\frac{${dec(out.v)}}{${dec(m.v)}} \\approx ${num(ans, 4)}^\\circ$. Para ángulos mayores, toda la luz se refleja.`],
        verify: { kind: "zero", fn: a => [m.v * Math.sin(rad(a)) - out.v * Math.sin(Math.PI / 2)] }
      };
    }
  };
  T["f2b-lente-num"] = {
    type: "numeric", concepts: ["f2b-lentes"], difficulty: 2,
    generate(r) {
      const tipo = r.pick(["convergente", "divergente", "espejo"]), f0 = r.int(5, 40), f = tipo === "divergente" ? -f0 : f0, dobj = r.int(5, 100), ask = r.pick(["di", "m"]);
      if (Math.abs(dobj - f) < 2) return null;
      const di = 1 / (1 / f - 1 / dobj), mag = -di / dobj;
      const desc = tipo === "espejo" ? `Un espejo cóncavo de distancia focal $${f0}$ cm` : `Una lente ${tipo} de distancia focal $${f > 0 ? "" : "-"}${f0}$ cm`;
      return {
        prompt: `${desc} tiene un objeto a $${dobj}$ cm. ¿Cuál es ${ask === "di" ? "la distancia de la imagen (cm, positiva si es real)" : "el aumento lateral"}?`,
        answer: ask === "di" ? di : mag,
        solution: [`[[f2b-lentes|Ecuación de lentes y espejos]]: $\\frac{1}{d_o} + \\frac{1}{d_i} = \\frac1f$ y $m = -\\frac{d_i}{d_o}$.`, `$d_i = \\left(\\frac{1}{${f}} - \\frac{1}{${dobj}}\\right)^{-1} \\approx ${num(di, 4)}$ cm (${di > 0 ? "imagen real" : "imagen virtual"}); $m \\approx ${num(mag, 4)}$ (${mag < 0 ? "invertida" : "derecha"}, ${Math.abs(mag) > 1 ? "aumentada" : "reducida"}).`],
        // verificación: trazado de rayos con matrices ABCD; el plano imagen es donde B = 0 y el aumento es A
        verify: ask === "di"
          ? { kind: "zero", fn: d => [mul(S(d), mul(L(f), S(dobj)))[0][1] / dobj] }
          : { kind: "zero", fn: mm => { let lo = -1e4, hi = 1e4; const B = d => mul(S(d), mul(L(f), S(dobj)))[0][1]; for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (Math.sign(B(mid)) === Math.sign(B(lo))) lo = mid; else hi = mid; } const Mx = mul(S(lo), mul(L(f), S(dobj))); return [mm - Mx[0][0]]; }, tol: 1e-6 }
      };
    }
  };
  T["f2b-optica-vf"] = {
    type: "tf", concepts: ["f2b-lentes"], difficulty: 1,
    generate(r) {
      const f = -r.int(5, 40), d = r.int(5, 100), q = r.pick(["divergente", "plano"]);
      if (q === "plano") return { prompt: `<b>Verdadero o falso:</b> la imagen de un objeto a $${d}$ cm de un espejo plano está $${d}$ cm detrás del espejo y es virtual.`, answer: true,
        explanation: `Un espejo plano es el caso $f \\to \\infty$: $d_i = -d_o$ (virtual, detrás del espejo) y $m = 1$ ([[f2b-lentes]]).`, solution: [`Por eso el espejo "duplica" la distancia aparente.`],
        verify: { kind: "truth", fn: () => { const di = 1 / (1 / 1e12 - 1 / d); return Math.abs(di + d) < 1e-6; } } };
      return { prompt: `<b>Verdadero o falso:</b> una lente divergente ($f = ${f}$ cm) con un objeto real a $${d}$ cm forma una imagen real.`, answer: false,
        explanation: `Con $f < 0$ y $d_o > 0$, $\\frac{1}{d_i} = \\frac1f - \\frac{1}{d_o} < 0$ siempre: la imagen es virtual, derecha y reducida ([[f2b-lentes]]).`, solution: [`Las lentes divergentes de un objeto real siempre dan imágenes virtuales.`],
        verify: { kind: "truth", fn: () => 1 / (1 / f - 1 / d) > 0 } };
    }
  };

  const cards = {
    "f2b-optica": {
      title: "Reflexión, refracción y ley de Snell", aliases: ["ley de Snell", "Snell", "refracción", "índice de refracción", "reflexión total interna", "ángulo crítico", "reflexión de la luz"], concepts: ["f2b-optica"],
      summary: "Reflexión: ángulo de incidencia = de reflexión. Refracción: n₁ sen θ₁ = n₂ sen θ₂. Si n₁ > n₂ y θ₁ > θc, reflexión total.",
      def: [R`**Índice de refracción:** $n = \frac cv$. **Reflexión:** $\theta_r = \theta_i$. **Refracción (Snell):** $n_1\sin\theta_1 = n_2\sin\theta_2$, con ángulos medidos desde la normal.`,
        R`**Reflexión total interna:** si la luz va a un medio de menor índice ($n_1 > n_2$) con un ángulo mayor que el **crítico**, $\sin\theta_c = \frac{n_2}{n_1}$, no hay refracción y toda la luz se refleja.`],
      idea: [R`Al entrar a un medio más denso, la luz se frena y se **acerca** a la normal. La reflexión total es lo que hace funcionar la fibra óptica y el brillo de los diamantes ($\theta_c \approx 24^\circ$).`,
        R`La **óptica geométrica** trata a la luz como rayos: vale cuando todo es mucho más grande que la longitud de onda. Si no, aparecen la [[f2b-interferencia|interferencia]] y la [[f2b-difraccion|difracción]].`],
      demo: [R`**Paso 1 (principio de Fermat).** La luz va de un punto a otro por el camino que tarda menos. Ponemos $A$ a altura $a$ sobre la superficie y $B$ a profundidad $b$, a distancia horizontal $d$, y llamamos $x$ al punto donde el rayo cruza. En cada medio el tiempo es distancia sobre rapidez: $$t(x) = \frac{\sqrt{a^2 + x^2}}{v_1} + \frac{\sqrt{b^2 + (d - x)^2}}{v_2}.$$`,
        R`**Paso 2 (el mínimo).** En el mínimo la derivada se anula. Derivando cada raíz con la regla de la cadena (la segunda da un signo menos por el $d - x$): $$t'(x) = \frac{x}{v_1\sqrt{a^2 + x^2}} - \frac{d - x}{v_2\sqrt{b^2 + (d - x)^2}} = 0.$$`,
        R`**Paso 3 (geometría).** $\frac{x}{\sqrt{a^2 + x^2}}$ es cateto opuesto sobre hipotenusa en el triángulo del primer tramo, con el ángulo medido desde la normal: es $\sin\theta_1$. Igual, la otra fracción es $\sin\theta_2$. Queda $\frac{\sin\theta_1}{v_1} = \frac{\sin\theta_2}{v_2}$.`,
        R`**Paso 4.** Multiplicamos por $c$ y usamos $n = \frac cv$: $n_1\sin\theta_1 = n_2\sin\theta_2$. $\blacksquare$`,
        R`**Paso 5 (ángulo crítico).** Si $n_1 > n_2$, $\sin\theta_2 = \frac{n_1}{n_2}\sin\theta_1$ es mayor que $\sin\theta_1$, y llega a $1$ (rayo rasante, $\theta_2 = 90^\circ$) cuando $\sin\theta_1 = \frac{n_2}{n_1}$. Para ángulos mayores haría falta $\sin\theta_2 > 1$, que es imposible: no hay rayo refractado y toda la luz se refleja.`,
        R`**Paso 6 (reflexión).** Ahora $A$ y $B$ están del mismo lado, a alturas $a$ y $b$, y la rapidez es la misma en todo el camino: minimizar el tiempo es minimizar el largo $\sqrt{a^2 + x^2} + \sqrt{b^2 + (d - x)^2}$. La misma derivada da $\sin\theta_i = \sin\theta_r$, y como los dos ángulos están entre $0^\circ$ y $90^\circ$, $\theta_r = \theta_i$. $\blacksquare$`],
      examples: [{ q: R`Ángulo crítico vidrio–aire ($n = 1{,}5$).`, steps: [R`$\theta_c = \arcsin\frac{1}{1{,}5} \approx 41{,}8^\circ$.`] }],
      see: ["f2b-lentes", "f2b-em"]
    },
    "f2b-lentes": {
      title: "Espejos y lentes delgadas", aliases: ["lente delgada", "lentes delgadas", "lente convergente", "lente divergente", "espejo cóncavo", "espejo convexo", "espejo plano", "distancia focal", "imagen virtual", "imagen real", "aumento lateral"], concepts: ["f2b-lentes"],
      summary: "1/d_o + 1/d_i = 1/f y m = −d_i/d_o. d_i > 0: imagen real; d_i < 0: virtual.",
      def: [R`Para espejos esféricos ($f = \frac R2$) y lentes delgadas: $$\frac{1}{d_o} + \frac{1}{d_i} = \frac1f, \qquad m = -\frac{d_i}{d_o}.$$ Convención: $f > 0$ para espejos cóncavos y lentes convergentes; $d_i > 0$ es imagen **real** (se puede proyectar), $d_i < 0$ es **virtual**; $m < 0$ es imagen invertida.`],
      idea: [R`**Método gráfico:** un rayo paralelo al eje sale pasando por el foco; uno que pasa por el centro de la lente sigue derecho; donde se cruzan está la imagen.`,
        R`Una lupa es una lente convergente con el objeto **dentro** de la distancia focal: da una imagen virtual, derecha y aumentada. Una lente divergente siempre da, de un objeto real, una imagen virtual y reducida.`],
      demo: [R`**Paso 1 (aproximación paraxial).** Trabajamos con rayos cerca del eje y poco inclinados, así que $\tan\theta \approx \theta$. Cada rayo queda descripto por su altura $y$ y su ángulo $\theta$ con el eje.`,
        R`**Paso 2 (avanzar).** Al recorrer una distancia $d$ en línea recta, la altura cambia en $d\tan\theta \approx d\theta$ y el ángulo no cambia: $(y, \theta) \to (y + d\theta,\ \theta)$.`,
        R`**Paso 3 (cruzar la lente).** Como la lente es delgada, la altura no cambia. Un rayo paralelo al eje ($\theta = 0$) a altura $y$ sale apuntando al foco, a distancia $f$: su ángulo pasa a $-\frac yf$. Un rayo por el centro ($y = 0$) no se desvía. En la aproximación paraxial el desvío es proporcional a $y$, así que en general $(y, \theta) \to \left(y,\ \theta - \frac yf\right)$.`,
        R`**Paso 4 (componer).** Sale un rayo del objeto, a altura $y_0$ y con ángulo $\theta_0$. Avanza $d_o$, cruza la lente y avanza $d_i$. Aplicando los pasos 2, 3 y 2: $$y_{\text{final}} = y_0\left(1 - \frac{d_i}{f}\right) + \theta_0\left(d_o + d_i - \frac{d_od_i}{f}\right).$$`,
        R`**Paso 5 (la ecuación).** Hay imagen si **todos** los rayos que salen del punto, con cualquier $\theta_0$, llegan a la misma altura. Para eso el coeficiente de $\theta_0$ tiene que ser $0$: $d_o + d_i = \frac{d_od_i}{f}$. Dividiendo por $d_od_i$: $$\frac{1}{d_o} + \frac{1}{d_i} = \frac1f. \quad\blacksquare$$`,
        R`**Paso 6 (aumento).** Con esa condición, $y_{\text{final}} = y_0\left(1 - \frac{d_i}{f}\right)$. Multiplicando la ecuación de la lente por $d_i$, $\frac{d_i}{f} = \frac{d_i}{d_o} + 1$, así que $m = \frac{y_{\text{final}}}{y_0} = -\frac{d_i}{d_o}$. $\blacksquare$`,
        R`**Paso 7 (espejo: $f = \frac R2$).** Un rayo paralelo al eje pega en el espejo en un punto $P$; la normal ahí es el radio que va al centro $C$. Por la ley de reflexión, el rayo reflejado forma con $CP$ el mismo ángulo $\theta$ que el incidente, y el incidente, por ser paralelo al eje, forma $\theta$ con el eje en $C$ (ángulos alternos). Así, el triángulo $C$, $P$, $F$ (con $F$ donde el rayo cruza el eje) es isósceles, con base $CP = R$: $CF = \frac{R}{2\cos\theta} \approx \frac R2$ para $\theta$ chico. Como $C$ está a distancia $R$ del espejo, el foco queda a $R - \frac R2 = \frac R2$ de él.`],
      examples: [{ q: R`Lente de $f = 10$ cm, objeto a 30 cm.`, steps: [R`$\frac1{d_i} = \frac1{10} - \frac1{30} = \frac{1}{15}$: $d_i = 15$ cm, real.`, R`$m = -\frac{15}{30} = -0{,}5$: invertida y de la mitad del tamaño.`] }],
      see: ["f2b-optica"]
    }
  };

  E.extendCourse("f102b", {
    concepts: { "f2b-optica": { name: "Reflexión y refracción" }, "f2b-lentes": { name: "Espejos y lentes" } },
    templates: T,
    units: [{
      id: "f2b-optica-u", order: 6, program: "Unidad 6", title: "Óptica geométrica", icon: "lightbulb",
      diagnostic: ["f2b-snell-num", "f2b-critico-num", "f2b-lente-num"],
      lessons: [
        { id: "f2b-snell", title: "Reflexión y refracción", templates: ["f2b-snell-num", "f2b-critico-num"], theory: ["f2b-optica"],
          intro: R`$n_1\sin\theta_1 = n_2\sin\theta_2$. Reflexión total si $\sin\theta_1 > \frac{n_2}{n_1}$.` },
        { id: "f2b-lentes", title: "Espejos y lentes", templates: ["f2b-optica-vf", "f2b-lente-num"], theory: ["f2b-lentes"],
          intro: R`$\frac1{d_o} + \frac1{d_i} = \frac1f$ y $m = -\frac{d_i}{d_o}$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 7 · INTERFERENCIA
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {};
  const dec = x => String(x).replace(".", "{,}");

  T["f2b-young-num"] = {
    type: "numeric", concepts: ["f2b-interferencia"], difficulty: 2,
    generate(r) {
      const lam = r.int(400, 700) * 1e-9, d = r.int(1, 10) / 10 * 1e-3, Lp = r.int(1, 5), m = r.int(1, 4), ask = r.pick(["y", "sep"]);
      const y = m * lam * Lp / d;
      return {
        prompt: ask === "y" ? `En un experimento de doble rendija, $\\lambda = ${num(lam * 1e9)}$ nm, la separación entre rendijas es $${dec(num(d * 1000, 3))}$ mm y la pantalla está a $${Lp}$ m. ¿A qué distancia (mm) del centro está la franja brillante de orden $${m}$?`
          : `En un experimento de doble rendija, $\\lambda = ${num(lam * 1e9)}$ nm, $d = ${dec(num(d * 1000, 3))}$ mm y la pantalla está a $${Lp}$ m. ¿Cuál es la separación (mm) entre franjas brillantes consecutivas?`,
        answer: ask === "y" ? y * 1000 : lam * Lp / d * 1000,
        solution: [`[[f2b-interferencia|Doble rendija]]: hay máximo cuando la diferencia de camino es un número entero de longitudes de onda, $d\\sin\\theta = m\\lambda$.`, `Para ángulos chicos, $y_m \\approx \\frac{m\\lambda L}{d}$; separación entre franjas $\\frac{\\lambda L}{d} \\approx ${num(lam * Lp / d * 1000, 4)}$ mm.`],
        // verificación: posición exacta donde la diferencia de caminos a las dos rendijas vale mλ (bisección)
        verify: { kind: "value", tol: 2e-3, fn: () => {
          const pos = mm2 => { let lo = 0, hi = 0.5; for (let i = 0; i < 100; i++) { const yy = (lo + hi) / 2, dd = Math.hypot(Lp, yy + d / 2) - Math.hypot(Lp, yy - d / 2); if (dd < mm2 * lam) lo = yy; else hi = yy; } return lo; };
          return ask === "y" ? pos(m) * 1000 : (pos(2) - pos(1)) * 1000;
        } }
      };
    }
  };
  T["f2b-pelicula-num"] = {
    type: "numeric", concepts: ["f2b-interferencia"], difficulty: 3,
    generate(r) {
      const v = r.pick(["jabon", "antirreflejo"]), lam = r.int(400, 700), m = r.int(0, 2);
      if (v === "jabon") {
        const n = r.pick([1.33, 1.35, 1.4]), t = (m + 0.5) * lam / (2 * n);
        return { prompt: `Una película de jabón ($n = ${dec(n)}$) en el aire se ve brillante por reflexión para $\\lambda = ${lam}$ nm. ¿Cuál es el ${["menor", "segundo", "tercer"][m]} espesor posible (nm)?`, answer: t,
          solution: [`Las reflexiones en las dos caras: la de arriba (aire→jabón) tiene un desfase de media longitud de onda y la de abajo no ([[f2b-interferencia|películas delgadas]]).`, `Constructiva: $2nt = \\left(m + \\frac12\\right)\\lambda \\Rightarrow t = \\frac{(m + 1/2)\\lambda}{2n} \\approx ${num(t, 4)}$ nm.`],
          // verificación: desfase total entre los dos rayos reflejados (camino + medio ciclo por reflexión en medio más denso) = múltiplo de 2π
          verify: { kind: "zero", fn: tt => [Math.cos(2 * Math.PI * 2 * n * tt / lam + Math.PI) - 1, Math.round((2 * n * tt / lam + 0.5)) - (m + 1) === 0 ? 0 : 1], tol: 1e-6 } };
      }
      const nc = r.pick([1.25, 1.38]), ng = 1.5, t = (2 * m + 1) * lam / (4 * nc);
      return { prompt: `Una capa antirreflejo ($n = ${dec(nc)}$) sobre vidrio ($n = 1{,}5$) debe anular la reflexión de $\\lambda = ${lam}$ nm. ¿Cuál es el ${["menor", "segundo", "tercer"][m]} espesor posible (nm)?`, answer: t,
        solution: [`Las dos reflexiones (aire→capa y capa→vidrio) tienen desfase de media onda, así que se compensan ([[f2b-interferencia|películas delgadas]]).`, `Destructiva: $2nt = \\left(m + \\frac12\\right)\\lambda \\Rightarrow t = \\frac{(2m + 1)\\lambda}{4n} \\approx ${num(t, 4)}$ nm.`],
        verify: { kind: "zero", fn: tt => [Math.cos(2 * Math.PI * 2 * nc * tt / lam + Math.PI - Math.PI) + 1], tol: 1e-6 } };
    }
  };
  T["f2b-interf-vf"] = {
    type: "tf", concepts: ["f2b-interferencia"], difficulty: 1,
    generate(r) {
      const lam = r.int(400, 700), d = r.int(1, 10) / 10, k = r.pick([2, 3]), q = r.pick(["d", "lam"]);
      const claim = q === "d" ? `si se multiplica por $${k}$ la separación entre las rendijas, las franjas quedan $${k}$ veces más separadas`
        : `si se cambia la luz de $${lam}$ nm por una de $${k * lam}$ nm, las franjas quedan $${k}$ veces más separadas`;
      const ans = q === "lam";
      return {
        prompt: `<b>Verdadero o falso:</b> en un experimento de doble rendija ($d = ${dec(d)}$ mm), ${claim}.`,
        answer: ans,
        explanation: `La separación entre franjas es $\\Delta y = \\frac{\\lambda L}{d}$: proporcional a $\\lambda$ e inversamente proporcional a $d$ ([[f2b-interferencia]]).`,
        solution: [q === "d" ? `Con $${k}d$ las franjas quedan $${k}$ veces más **juntas**.` : `Con $${k}\\lambda$ las franjas quedan $${k}$ veces más separadas.`],
        // verificación: separación exacta entre los dos primeros máximos calculada con la diferencia de caminos
        verify: { kind: "truth", fn: () => {
          const sep = (ll, dd) => { const pos = m => { let lo = 0, hi = 0.5; for (let i = 0; i < 100; i++) { const y = (lo + hi) / 2; if (Math.hypot(1, y + dd / 2) - Math.hypot(1, y - dd / 2) < m * ll) lo = y; else hi = y; } return lo; }; return pos(2) - pos(1); };
          const base = sep(lam * 1e-9, d * 1e-3), nuevo = q === "d" ? sep(lam * 1e-9, k * d * 1e-3) : sep(k * lam * 1e-9, d * 1e-3);
          return Math.abs(nuevo / base - k) < 1e-2;
        } }
      };
    }
  };
  T["f2b-michelson-num"] = {
    type: "numeric", concepts: ["f2b-interferencia"], difficulty: 2,
    generate(r) {
      const lam = r.int(400, 700), N = r.int(10, 500), ask = r.pick(["d", "N"]), d = N * lam / 2;
      return {
        prompt: ask === "d" ? `En un interferómetro de Michelson con luz de $${lam}$ nm se cuentan $${N}$ franjas que pasan al mover un espejo. ¿Cuánto se movió el espejo (μm)?`
          : `En un interferómetro de Michelson con luz de $${lam}$ nm, un espejo se mueve $${num(d / 1000, 4).replace(".", "{,}")}$ μm. ¿Cuántas franjas pasan?`,
        answer: ask === "d" ? d / 1000 : N,
        solution: [`Mover el espejo $\\Delta d$ cambia el camino del brazo en $2\\Delta d$ (ida y vuelta) ([[f2b-interferencia|Michelson]]).`, `Cada franja corresponde a un cambio de camino de $\\lambda$: $N = \\frac{2\\Delta d}{\\lambda}$.`],
        verify: { kind: "zero", fn: x => [ask === "d" ? (2 * x * 1000) / lam - N : x - 2 * d / lam] }
      };
    }
  };

  const cards = {
    "f2b-interferencia": {
      title: "Interferencia de la luz", aliases: ["interferencia", "doble rendija", "experimento de Young", "fuentes coherentes", "películas delgadas", "película delgada", "interferómetro de Michelson", "Michelson", "diferencia de camino"], concepts: ["f2b-interferencia"],
      summary: "Dos ondas coherentes se suman: diferencia de camino mλ da máximo, (m + ½)λ da mínimo. Doble rendija: y_m ≈ mλL/d.",
      def: [R`Dos fuentes **coherentes** (con diferencia de fase constante) interfieren: **constructivamente** donde la diferencia de camino es $m\lambda$ y **destructivamente** donde es $(m + \frac12)\lambda$.`,
        R`**Doble rendija (Young):** máximos en $d\sin\theta = m\lambda$; en la pantalla, $y_m \approx \frac{m\lambda L}{d}$. La intensidad varía como $I = I_0\cos^2\left(\frac{\pi d\sin\theta}{\lambda}\right)$.`,
        R`**Películas delgadas:** la reflexión en un medio de mayor índice agrega un desfase de media onda. Comparando $2nt$ con $\lambda$ (y contando esos desfases) se ve si la reflexión es constructiva o destructiva.`],
      idea: [R`La interferencia es la prueba de que la luz es una onda. Los colores de las burbujas de jabón y de las manchas de aceite son interferencia en películas delgadas; las capas antirreflejo de los anteojos usan interferencia destructiva.`,
        R`El **interferómetro de Michelson** divide un haz en dos brazos y los recombina: cada franja que pasa corresponde a un cambio de camino de una longitud de onda, así que mide distancias del orden de los nanómetros (hoy detecta ondas gravitacionales).`],
      demo: [R`**Paso 1 (rayos casi paralelos).** Con la pantalla lejos ($L \gg d$), los rayos que van de las dos rendijas a un mismo punto son casi paralelos, y forman un ángulo $\theta$ con la normal.`,
        R`**Paso 2 (diferencia de caminos).** Desde una rendija trazamos la perpendicular al rayo de la otra. Queda un triángulo rectángulo de hipotenusa $d$ (la separación) con ángulo $\theta$, y el tramo extra que recorre un rayo es el cateto opuesto: $\Delta = d\sin\theta$.`,
        R`**Paso 3 (máximos).** Si $\Delta$ es un número entero de longitudes de onda, las crestas llegan juntas y se suman: interferencia constructiva. Los máximos están en $d\sin\theta = m\lambda$.`,
        R`**Paso 4 (en la pantalla).** A distancia $L$, la altura del punto es $y = L\tan\theta$. Para ángulos chicos $\tan\theta \approx \sin\theta = \frac{m\lambda}{d}$, así que $y_m \approx \frac{m\lambda L}{d}$.`,
        R`**Paso 5 (intensidad: sumar las ondas).** Cada longitud de onda de diferencia de camino es una vuelta de fase, $2\pi$, así que el desfase es $\phi = \frac{2\pi d\sin\theta}{\lambda}$. Sumamos las dos ondas con $\sin a + \sin b = 2\sin\frac{a+b}{2}\cos\frac{a-b}{2}$: $$E_0\sin(\omega t) + E_0\sin(\omega t + \phi) = 2E_0\cos\frac\phi2\,\sin\left(\omega t + \frac\phi2\right).$$ Es una onda de la misma frecuencia con amplitud $2E_0\cos\frac\phi2$.`,
        R`**Paso 6.** La intensidad es proporcional al cuadrado de la amplitud: $4E_0^2\cos^2\frac\phi2$. Llamando $I_0$ al máximo, $I = I_0\cos^2\frac\phi2 = I_0\cos^2\left(\frac{\pi d\sin\theta}{\lambda}\right)$. $\blacksquare$`],
      examples: [{ q: R`Rendijas a 0,2 mm, luz de 500 nm, pantalla a 2 m. ¿Separación entre franjas?`, steps: [R`$\frac{\lambda L}{d} = \frac{5\times10^{-7}\cdot 2}{2\times10^{-4}} = 5$ mm.`] }],
      see: ["f2b-difraccion", "f2b-ondas"]
    }
  };

  E.extendCourse("f102b", {
    concepts: { "f2b-interferencia": { name: "Interferencia" } },
    templates: T,
    units: [{
      id: "f2b-interferencia-u", order: 7, program: "Unidad 7", title: "Interferencia", icon: "sparkles",
      diagnostic: ["f2b-young-num", "f2b-pelicula-num", "f2b-michelson-num"],
      lessons: [
        { id: "f2b-young", title: "Doble rendija", templates: ["f2b-young-num", "f2b-michelson-num"], theory: ["f2b-interferencia"],
          intro: R`Máximos donde la diferencia de camino es $m\lambda$: $d\sin\theta = m\lambda$, $y_m \approx \frac{m\lambda L}{d}$.` },
        { id: "f2b-peliculas", title: "Películas delgadas", templates: ["f2b-pelicula-num", "f2b-interf-vf"], theory: ["f2b-interferencia"],
          intro: R`Compará $2nt$ con $\lambda$ y sumá medio ciclo por cada reflexión en un medio de mayor índice.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 8 · DIFRACCIÓN
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {};
  const dec = x => String(x).replace(".", "{,}");
  const rad = d => d * Math.PI / 180, deg = x => x * 180 / Math.PI;

  T["f2b-rendija-num"] = {
    type: "numeric", concepts: ["f2b-difraccion"], difficulty: 2,
    generate(r) {
      const lam = r.int(400, 700) * 1e-9, a = r.int(5, 100) * 1e-6, Lp = r.int(1, 4), ask = r.pick(["ang", "ancho"]);
      const th = Math.asin(lam / a), w = 2 * Lp * Math.tan(th);
      return {
        prompt: ask === "ang" ? `Luz de $${num(lam * 1e9)}$ nm pasa por una rendija de $${num(a * 1e6)}$ μm. ¿A qué ángulo (grados) está el primer mínimo de difracción?`
          : `Luz de $${num(lam * 1e9)}$ nm pasa por una rendija de $${num(a * 1e6)}$ μm y se observa en una pantalla a $${Lp}$ m. ¿Cuál es el ancho (mm) del máximo central?`,
        answer: ask === "ang" ? deg(th) : w * 1000,
        solution: [`[[f2b-difraccion|Rendija simple]]: mínimos en $a\\sin\\theta = m\\lambda$ ($m = \\pm1, \\pm2, \\dots$).`, `$\\theta_1 = \\arcsin\\frac{\\lambda}{a} \\approx ${num(deg(th), 4)}^\\circ$; el máximo central va de $-\\theta_1$ a $\\theta_1$: ancho $2L\\tan\\theta_1 \\approx ${num(w * 1000, 4)}$ mm.`],
        // verificación: el primer cero de la intensidad (sen β / β)² buscado numéricamente
        verify: { kind: "value", tol: 1e-6, fn: () => { const I = t => { const b = Math.PI * a * Math.sin(t) / lam; return Math.sin(b) / b; }; let lo = 1e-9, hi = Math.min(Math.PI / 2, 1.5 * lam / a < 1 ? Math.asin(Math.min(1, 1.5 * lam / a)) : Math.PI / 2); for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (I(mid) > 0) lo = mid; else hi = mid; } return ask === "ang" ? deg(lo) : 2 * Lp * Math.tan(lo) * 1000; } }
      };
    }
  };
  T["f2b-red-num"] = {
    type: "numeric", concepts: ["f2b-difraccion"], difficulty: 2,
    generate(r) {
      const N = r.pick([100, 300, 500, 600, 1000, 1200]), lam = r.int(400, 700) * 1e-9, d = 1e-3 / N, m = r.int(1, 3), ask = r.pick(["ang", "max"]);
      if (ask === "ang" && m * lam / d >= 1) return null;
      // si d/λ es entero, ese orden saldría a 90° (no se observa): se evita el caso límite
      if (ask === "max" && Math.abs(d / lam - Math.round(d / lam)) < 1e-6) return null;
      const ans = ask === "ang" ? deg(Math.asin(m * lam / d)) : Math.floor(d / lam - 1e-12);
      return {
        prompt: ask === "ang" ? `Una red de difracción tiene $${N}$ líneas por mm. ¿A qué ángulo (grados) aparece el máximo de orden $${m}$ para luz de $${num(lam * 1e9)}$ nm?`
          : `Una red de difracción tiene $${N}$ líneas por mm. Con luz de $${num(lam * 1e9)}$ nm, ¿cuál es el máximo orden que se puede observar?`,
        answer: ans,
        solution: [`[[f2b-difraccion|Red de difracción]]: $d = \\frac{1}{${N}}$ mm $\\approx ${num(d * 1e9)}$ nm y máximos en $d\\sin\\theta = m\\lambda$.`, ask === "ang" ? `$\\theta = \\arcsin\\frac{${m}\\lambda}{d} \\approx ${num(ans, 4)}^\\circ$.` : `Como $\\sin\\theta \\le 1$: $m \\le \\frac{d}{\\lambda} \\approx ${num(d / lam, 3)}$, así que el máximo orden es $${ans}$.`],
        verify: ask === "ang" ? { kind: "zero", fn: a => [d * Math.sin(rad(a)) - m * lam].map(x => x / lam) } : { kind: "zero", fn: mm => [mm * lam < d ? 0 : 1, (mm + 1) * lam > d ? 0 : 1, Math.abs(mm - Math.round(mm))] }
      };
    }
  };
  T["f2b-bragg-num"] = {
    type: "numeric", concepts: ["f2b-difraccion"], difficulty: 2,
    generate(r) {
      const d = r.int(20, 40) / 100, lam = r.int(5, 20) / 100, m = r.int(1, 2);
      if (m * lam / (2 * d) >= 1) return null;
      const th = deg(Math.asin(m * lam / (2 * d)));
      return {
        prompt: `Rayos X de $${dec(lam)}$ nm inciden sobre un cristal con planos separados $${dec(d)}$ nm. ¿A qué ángulo (grados, medido desde los planos) aparece la reflexión de Bragg de orden $${m}$?`,
        answer: th,
        solution: [`[[f2b-difraccion|Ley de Bragg]]: las reflexiones en planos sucesivos se suman en fase si $2d\\sin\\theta = m\\lambda$.`, `$\\theta = \\arcsin\\frac{${m}\\cdot${dec(lam)}}{2\\cdot${dec(d)}} \\approx ${num(th, 4)}^\\circ$.`],
        verify: { kind: "zero", fn: a => [(2 * d * Math.sin(rad(a)) - m * lam) / lam] }
      };
    }
  };
  T["f2b-difr-vf"] = {
    type: "tf", concepts: ["f2b-difraccion"], difficulty: 1,
    generate(r) {
      const lam = r.int(400, 700) * 1e-9, [a1, a2] = r.distinct(2, 5, 80).sort((x, y) => x - y), q = r.pick(["angosta", "ancha"]);
      return {
        prompt: `<b>Verdadero o falso:</b> con la misma luz, una rendija de $${q === "angosta" ? a1 : a2}$ μm produce un máximo central de difracción **más ancho** que una de $${q === "angosta" ? a2 : a1}$ μm.`,
        answer: q === "angosta",
        explanation: `El primer mínimo está en $\\sin\\theta = \\frac{\\lambda}{a}$: cuanto más angosta la rendija, más se abre la luz ([[f2b-difraccion]]).`,
        solution: [`La difracción es notable cuando la abertura es comparable con la longitud de onda.`],
        verify: { kind: "truth", fn: () => { const w = a => Math.asin(Math.min(1, lam / (a * 1e-6))); return q === "angosta" ? w(a1) > w(a2) : w(a2) > w(a1); } }
      };
    }
  };

  const cards = {
    "f2b-difraccion": {
      title: "Difracción: rendija, red y rayos X", aliases: ["difracción", "rendija simple", "red de difracción", "ley de Bragg", "Bragg", "difracción de Fraunhofer", "difracción de Fresnel"], concepts: ["f2b-difraccion"],
      summary: "Rendija de ancho a: mínimos en a sen θ = mλ. Red: máximos en d sen θ = mλ. Cristales: 2d sen θ = mλ (Bragg).",
      def: [R`**Difracción:** la luz se abre al pasar por una abertura o borde. **Fraunhofer** (pantalla lejos, rayos casi paralelos) y **Fresnel** (cerca).`,
        R`**Rendija simple de ancho $a$:** mínimos en $a\sin\theta = m\lambda$ ($m \neq 0$); intensidad $I = I_0\left(\frac{\sin\beta}{\beta}\right)^2$ con $\beta = \frac{\pi a\sin\theta}{\lambda}$.`,
        R`**Red de difracción** (muchas rendijas separadas $d$): máximos muy finos en $d\sin\theta = m\lambda$. **Bragg** (planos de un cristal separados $d$): $2d\sin\theta = m\lambda$.`],
      idea: [R`Cuanto más angosta la rendija, más ancho el máximo central: la difracción importa cuando la abertura es comparable con $\lambda$. Por eso el sonido (de longitud de onda grande) dobla las esquinas y la luz casi no.`,
        R`Las redes separan los colores con muchísima precisión (espectroscopía), y la difracción de rayos X por cristales permitió medir estructuras atómicas, como la del ADN.`],
      demo: [R`**Paso 1 (Huygens).** Cada punto de la rendija se comporta como una fuente de ondas, y todas salen en fase porque les llega el mismo frente de onda. Con la pantalla lejos, los rayos hacia un punto de la pantalla son paralelos, con ángulo $\theta$.`,
        R`**Paso 2 (primer mínimo).** Partimos la rendija en dos mitades de ancho $\frac a2$. A cada punto de la mitad de arriba le asignamos el que está $\frac a2$ más abajo. Como en la [[f2b-interferencia|doble rendija]], la diferencia de camino del par es $\frac a2\sin\theta$.`,
        R`**Paso 3.** Si esa diferencia es $\frac\lambda2$, las dos ondas del par llegan en contrafase y se cancelan. Como todos los puntos quedan emparejados, no llega luz: el primer mínimo está en $\frac a2\sin\theta = \frac\lambda2$, o sea $a\sin\theta = \lambda$.`,
        R`**Paso 4 (los demás mínimos).** Partiendo la rendija en $2m$ franjas de ancho $\frac{a}{2m}$, las franjas vecinas se cancelan de a pares cuando $\frac{a}{2m}\sin\theta = \frac\lambda2$, o sea $a\sin\theta = m\lambda$. Con $m = 0$ no hay mínimo: todas las fuentes llegan en fase y es el máximo central.`,
        R`**Paso 5 (Bragg).** Los rayos se reflejan en planos del cristal separados $d$, con $\theta$ medido desde los planos. El que se refleja en el segundo plano recorre de más $d\sin\theta$ al bajar y otro $d\sin\theta$ al subir (se ve trazando perpendiculares desde el punto de reflexión del primero). La diferencia total es $2d\sin\theta$, y hay refuerzo cuando es un número entero de longitudes de onda: $2d\sin\theta = m\lambda$.`,
        R`**Paso 6 (red: los máximos).** Entre rendijas vecinas la diferencia de camino es $d\sin\theta$, como en la doble rendija. Si es $m\lambda$, **todas** las $N$ ondas llegan en fase y se suman: amplitud $N$ veces la de una e intensidad $N^2$ veces.`,
        R`**Paso 7 (por qué son tan finos).** Si nos corremos un poco del máximo, entre rendijas vecinas aparece un desfase extra $\delta$, y entre la primera y la última, $N\delta$. Cuando $N\delta = 2\pi$, las $N$ contribuciones (pensadas como flechitas que se van girando) dan una vuelta completa y suman cero. Ese primer cero está en $\delta = \frac{2\pi}{N}$: cuantas más rendijas, más cerca del máximo, y por eso los máximos son mucho más finos que con dos.`],
      examples: [{ q: R`Red de 500 líneas/mm con luz de 600 nm. ¿Ángulo del primer orden?`, steps: [R`$d = 2000$ nm; $\sin\theta = \frac{600}{2000} = 0{,}3$, así que $\theta \approx 17{,}5^\circ$.`] }],
      see: ["f2b-interferencia", "f2b-optica"]
    }
  };

  E.extendCourse("f102b", {
    concepts: { "f2b-difraccion": { name: "Difracción" } },
    templates: T,
    units: [{
      id: "f2b-difraccion-u", order: 8, program: "Unidad 8", title: "Difracción", icon: "sparkles",
      diagnostic: ["f2b-rendija-num", "f2b-red-num", "f2b-bragg-num"],
      lessons: [
        { id: "f2b-rendija", title: "Rendija simple", templates: ["f2b-difr-vf", "f2b-rendija-num"], theory: ["f2b-difraccion"],
          intro: R`Mínimos en $a\sin\theta = m\lambda$. Rendija más angosta, máximo central más ancho.` },
        { id: "f2b-redes", title: "Redes y rayos X", templates: ["f2b-red-num", "f2b-bragg-num"], theory: ["f2b-difraccion"],
          intro: R`Red: $d\sin\theta = m\lambda$. Bragg: $2d\sin\theta = m\lambda$.` }
      ]
    }],
    cards
  });
})();
