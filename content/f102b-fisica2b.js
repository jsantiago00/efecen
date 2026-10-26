/*
 * F102B · Física General II B — Lic. en Ciencias Básicas (FCEN, UNCuyo), Plan Ord. 77/15 C.S.
 * ==========================================================================================
 * Temario: programa oficial 2026 de Física General II B (F102B), 8 unidades:
 *   1 Temperatura y calor · 2 Propiedades térmicas de la materia · 3 Primera ley de la termodinámica
 *   4 Segunda ley de la termodinámica · 5 Ondas mecánicas y electromagnéticas · 6 Óptica geométrica
 *   7 Interferencia · 8 Difracción
 * Extra UBA (temas de Física 2 de Cs. Físicas, FCEN-UBA, que no están en el programa de F102B):
 *   Oscilaciones acopladas y modos normales · Polarización · Reflexión entre medios, Fourier y dispersión
 *   Instrumentos ópticos y coherencia
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

  T["f2b-otto-num"] = {
    type: "numeric", concepts: ["f2b-segunda-ley"], difficulty: 3,
    generate(r) {
      const rc = r.pick([6, 7, 8, 9, 10, 11, 12]), gam = r.pick([1.4, 1.35, 1.3]), Qh = r.int(5, 40) * 100, ask = r.pick(["e", "W"]);
      const e = 1 - rc ** (1 - gam), ans = ask === "e" ? 100 * e : e * Qh;
      return {
        prompt: `Un motor de nafta se modela con un ciclo de Otto de relación de compresión $r = ${rc}$, con un gas de $\\gamma = ${String(gam).replace(".", "{,}")}$. ${ask === "e" ? "¿Cuál es su eficiencia teórica (en %)?" : `Si en cada ciclo recibe $${Qh}$ J en la combustión, ¿cuánto trabajo hace por ciclo (en J)?`}`,
        answer: ans,
        solution: [`[[f2b-motores|Ciclo de Otto]]: dos adiabáticas y dos isocóricas. Su eficiencia solo depende de la relación de compresión: $e = 1 - \\frac{1}{r^{\\gamma - 1}}$.`,
          `$e = 1 - ${rc}^{-${num(gam - 1, 2)}} \\approx ${num(100 * e, 4)}\\%$${ask === "W" ? `, así que $W = eQ_H \\approx ${num(ans, 4)}$ J` : ""}.`],
        // otro camino: se arma el ciclo con temperaturas (nR = 1) y se suman los calores de las isocóricas
        verify: { kind: "value", tol: 1e-9, fn: () => {
          const Ta = 300, Tb = Ta * rc ** (gam - 1), Tc = Tb * 3, Td = Tc / rc ** (gam - 1), Cv = 1 / (gam - 1);
          const Qin = Cv * (Tc - Tb), Qout = Cv * (Td - Ta), ee = 1 - Qout / Qin;
          return ask === "e" ? 100 * ee : ee * Qh;
        } }
      };
    }
  };

  T["f2b-refri-num"] = {
    type: "numeric", concepts: ["f2b-segunda-ley"], difficulty: 2,
    generate(r) {
      const bomba = r.bool(), W = r.int(2, 20) * 50, cop = r.int(20, 60) / 10, ask = r.pick(["Q", "COP"]);
      const Qc = bomba ? (cop - 1) * W : cop * W, Qh = Qc + W;
      return {
        prompt: bomba ? (ask === "Q" ? `Una bomba de calor con un COP de calefacción de $${String(cop).replace(".", "{,}")}$ consume $${W}$ J de trabajo eléctrico. ¿Cuánto calor (en J) entrega dentro de la casa?` : `Una bomba de calor entrega $${Qh}$ J dentro de una casa consumiendo $${W}$ J de trabajo. ¿Cuál es su COP de calefacción?`)
          : (ask === "Q" ? `Una heladera con un COP de $${String(cop).replace(".", "{,}")}$ consume $${W}$ J de trabajo. ¿Cuánto calor (en J) saca del interior?` : `Una heladera saca $${Qc}$ J del interior consumiendo $${W}$ J de trabajo. ¿Cuánto calor (en J) le entrega a la cocina?`),
        answer: bomba ? (ask === "Q" ? Qh : Qh / W) : (ask === "Q" ? Qc : Qh),
        solution: [`[[f2b-motores|Refrigeradores y bombas de calor]]: por la primera ley, el calor entregado al ambiente caliente es $Q_H = Q_C + W$.`,
          bomba ? `Para calefaccionar interesa $Q_H$: $\\text{COP}_{cal} = \\frac{Q_H}{W}$. ${ask === "Q" ? `$Q_H = ${String(cop).replace(".", "{,}")}\\cdot${W} = ${num(Qh, 4)}$ J.` : `$\\text{COP} = \\frac{${Qh}}{${W}} = ${num(Qh / W, 4)}$.`}`
            : (ask === "Q" ? `En una heladera interesa $Q_C$: $\\text{COP} = \\frac{Q_C}{W}$, así que $Q_C = ${num(Qc, 4)}$ J.` : `$Q_H = Q_C + W = ${Qc} + ${W} = ${Qh}$ J: la cocina recibe más calor del que se saca de adentro.`)],
        // otro camino: balance de energía del ciclo (la energía interna no cambia en un ciclo)
        verify: { kind: "zero", fn: x => { if (bomba) return ask === "Q" ? [(x - (Qc + W)) / W] : [(x * W - (Qc + W)) / W]; return ask === "Q" ? [(x - cop * W) / W] : [(x - Qc - W) / W]; } }
      };
    }
  };

  const cards = {
    "f2b-motores": {
      title: "Motores de combustión, refrigeradores y bombas de calor", aliases: ["ciclo de Otto", "motor de combustión interna", "bomba de calor", "relación de compresión"], concepts: ["f2b-segunda-ley"],
      summary: "Ciclo de Otto: e = 1 − 1/r^(γ−1), con r la relación de compresión. Refrigerador: COP = Q_C/W. Bomba de calor: COP = Q_H/W = 1 + Q_C/W, siempre mayor que 1.",
      def: [R`**Ciclo de Otto** (motor de nafta idealizado): compresión adiabática de $V_1$ a $V_2$, combustión a volumen constante, expansión adiabática y escape a volumen constante. Con $r = \frac{V_1}{V_2}$, la **relación de compresión**, la eficiencia es $e = 1 - \frac{1}{r^{\gamma - 1}}$.`,
        R`**Refrigerador:** con un trabajo $W$ saca $Q_C$ de lo frío y entrega $Q_H = Q_C + W$ a lo caliente; $\text{COP} = \frac{Q_C}{W}$. **Bomba de calor:** la misma máquina, usada para calentar; $\text{COP}_{cal} = \frac{Q_H}{W} = 1 + \frac{Q_C}{W}$.`],
      idea: [R`Una bomba de calor no «fabrica» calor: lo mueve desde afuera, que está frío, hacia adentro. Por eso entrega más energía térmica que la eléctrica que consume, y calefacciona mejor que una estufa eléctrica, que convierte $W$ en $W$ de calor.`],
      demo: [R`**Paso 1 (calores del Otto).** Solo hay intercambio de calor en las isocóricas: entra $Q_H = nC_V(T_c - T_b)$ en la combustión y sale $Q_C = nC_V(T_d - T_a)$ en el escape. En las adiabáticas $Q = 0$.`,
        R`**Paso 2.** En una adiabática del gas ideal, $TV^{\gamma - 1}$ es constante. La compresión ($a \to b$) y la expansión ($c \to d$) van entre los mismos volúmenes, así que $T_b = T_ar^{\gamma - 1}$ y $T_c = T_dr^{\gamma - 1}$.`,
        R`**Paso 3.** Restando, $T_c - T_b = r^{\gamma - 1}(T_d - T_a)$. Entonces $\frac{Q_C}{Q_H} = \frac{T_d - T_a}{T_c - T_b} = \frac{1}{r^{\gamma - 1}}$, y $e = 1 - \frac{Q_C}{Q_H} = 1 - \frac{1}{r^{\gamma - 1}}$.`,
        R`**Paso 4 (bomba de calor).** En un ciclo $\Delta U = 0$, así que por la primera ley $Q_H = Q_C + W$, y $\frac{Q_H}{W} = 1 + \frac{Q_C}{W} > 1$. $\blacksquare$`],
      examples: [{ q: R`Otto con $r = 8$ y $\gamma = 1{,}4$.`, steps: [R`$e = 1 - 8^{-0{,}4} \approx 0{,}56$. Los motores reales rinden bastante menos (rozamiento, combustión no instantánea, pérdidas de calor).`] }],
      tips: [R`Subir la relación de compresión mejora la eficiencia, pero el límite lo pone el autoencendido de la mezcla (el «pistoneo»); por eso los diésel, que no tienen ese problema, usan $r$ más altas.`],
      see: ["f2b-segunda-ley", "f2b-procesos", "f2b-primera-ley"]
    },
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
        { id: "f2b-motores", title: "Motores, heladeras y bombas de calor", templates: ["f2b-otto-num", "f2b-refri-num"], theory: ["f2b-motores"],
          intro: R`Otto: $e = 1 - r^{1 - \gamma}$. Refrigerador: $\text{COP} = \frac{Q_C}{W}$; bomba de calor: $\frac{Q_H}{W} = 1 + \text{COP}$.` },
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

  T["f2b-armonicos-num"] = {
    type: "numeric", concepts: ["f2b-ondas"], difficulty: 2,
    generate(r) {
      const kind = r.pick(["cuerda", "abierto", "cerrado"]), n0 = r.int(1, 4), v = kind === "cuerda" ? r.int(10, 60) * 10 : 344, L = r.int(20, 150) / 100;
      // en un tubo cerrado en un extremo solo existen los armónicos impares
      const n = kind === "cerrado" ? 2 * n0 - 1 : n0, f = kind === "cerrado" ? n * v / (4 * L) : n * v / (2 * L);
      const ord = ["fundamental", "segundo", "tercero", "cuarto", "quinto", "sexto", "séptimo"][n - 1];
      return {
        prompt: `${{ cuerda: `Una cuerda de $${String(L).replace(".", "{,}")}$ m, fija en los dos extremos, transmite ondas a $${v}$ m/s.`, abierto: `Un tubo de $${String(L).replace(".", "{,}")}$ m está abierto en los dos extremos (sonido a $344$ m/s).`, cerrado: `Un tubo de $${String(L).replace(".", "{,}")}$ m está cerrado en un extremo y abierto en el otro (sonido a $344$ m/s).` }[kind]} ¿Cuál es la frecuencia ${kind === "cerrado" ? (n0 === 1 ? "del modo fundamental" : `del ${["", "segundo", "tercer", "cuarto"][n0 - 1]} modo posible, contando el fundamental`) : n === 1 ? "del modo fundamental" : `del ${ord} armónico`} (en Hz)?`,
        answer: f,
        solution: [kind === "cerrado" ? `En un tubo cerrado en un extremo hay un nodo de desplazamiento en el extremo cerrado y un antinodo en el abierto: entran $\\frac14, \\frac34, \\frac54, \\ldots$ longitudes de onda. Solo hay armónicos impares: $f_n = \\frac{nv}{4L}$, $n = 1, 3, 5, \\ldots$ ([[f2b-ondas|ondas estacionarias]]).`
          : `Con ${kind === "cuerda" ? "nodos" : "antinodos de desplazamiento"} en los dos extremos entran $n$ medias longitudes de onda: $\\lambda_n = \\frac{2L}{n}$ y $f_n = \\frac{nv}{2L}$ ([[f2b-ondas|ondas estacionarias]]).`,
          `Con $n = ${n}$: $f = ${num(f, 5)}$ Hz.`],
        // otro camino: se busca numéricamente la frecuencia que cumple las condiciones de borde (raíces de sen o cos de kL)
        verify: { kind: "value", tol: 1e-9, fn: () => {
          const g = kind === "cerrado" ? kk => Math.cos(kk * L) : kk => Math.sin(kk * L), roots = [];
          for (let k = 1e-6, prev = g(k), h = 0.001; roots.length < n && k < 1e4; k += h) { const cur = g(k + h); if (prev * cur < 0) { let a = k, b = k + h; for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (g(a) * g(m) <= 0) b = m; else a = m; } roots.push((a + b) / 2); } prev = cur; }
          const kn = roots[kind === "cerrado" ? n0 - 1 : n - 1];
          return kn * v / (2 * Math.PI);
        } }
      };
    }
  };
  T["f2b-armonicos-num"].testN = 100;

  T["f2b-potencia-onda-num"] = {
    type: "numeric", concepts: ["f2b-ondas"], difficulty: 3,
    generate(r) {
      const mu = r.int(1, 20) / 1000, F = r.int(10, 200), A = r.int(1, 20) / 1000, f = r.int(10, 200), v = Math.sqrt(F / mu), w = 2 * Math.PI * f;
      const P = 0.5 * mu * w * w * A * A * v;
      return {
        prompt: `Una cuerda de densidad lineal $${mu * 1000}$ g/m está tensa con $${F}$ N. Por ella viaja una onda senoidal de amplitud $${A * 1000}$ mm y frecuencia $${f}$ Hz. ¿Qué potencia media transporta (en W)?`,
        answer: P,
        solution: [`Rapidez: $v = \\sqrt{\\frac F\\mu} \\approx ${num(v, 4)}$ m/s ([[f2b-ondas]]).`,
          `Potencia media: $\\bar P = \\frac12\\mu\\omega^2A^2v$, con $\\omega = 2\\pi f$: $\\bar P \\approx ${num(P, 4)}$ W. Crece con el cuadrado de la amplitud y de la frecuencia.`],
        // otro camino: promedio numérico de la potencia instantánea −F (∂y/∂x)(∂y/∂t) en un punto, durante un período
        verify: { kind: "value", tol: 1e-6, fn: () => { const k = w / v, Tp = 1 / f, pw = t => { const dydx = A * k * Math.cos(-w * t), dydt = -A * w * Math.cos(-w * t); return -F * dydx * dydt; }; let s = 0; const N = 2000; for (let i = 0; i < N; i++) s += pw((i + 0.5) * Tp / N); return s / N; } }
      };
    }
  };

  T["f2b-doppler-num"] = {
    type: "numeric", concepts: ["f2b-sonido"], difficulty: 2,
    generate(r) {
      const f0 = r.int(20, 100) * 10, vs = r.int(0, 40), vo = r.int(0, 30), acercaS = r.bool(), acercaO = r.bool(), v = 344;
      if (!vs && !vo) return null;
      const fo = f0 * (v + (acercaO ? vo : -vo)) / (v - (acercaS ? vs : -vs));
      const mov = (x, ac, quieto) => (x ? `se ${ac ? "acerca" : "aleja"} a $${x}$ m/s` : `está ${quieto}`);
      return {
        prompt: `Una fuente emite sonido de $${f0}$ Hz. La fuente ${mov(vs, acercaS, "quieta")} y el observador ${mov(vo, acercaO, "quieto")}, sobre la recta que los une (el aire está quieto; sonido a $344$ m/s). ¿Qué frecuencia percibe el observador (en Hz)?`,
        answer: fo,
        solution: [`[[f2b-doppler|Efecto Doppler]]: $f' = f\\,\\frac{v \\pm v_o}{v \\mp v_s}$, con los signos de arriba cuando se acercan.`,
          `$f' = ${f0}\\cdot\\frac{344 ${acercaO ? "+" : "-"} ${vo}}{344 ${acercaS ? "-" : "+"} ${vs}} \\approx ${num(fo, 5)}$ Hz (${fo > f0 ? "más agudo" : "más grave"}).`],
        // otro camino: se siguen dos crestas consecutivas y se mide cuánto tardan en llegar al observador
        verify: { kind: "value", tol: 1e-9, fn: () => {
          // fuente en x = 0 en t = 0; observador inicialmente en x = D; acercarse = moverse hacia el otro
          const D = 1000, us = acercaS ? vs : -vs, uo = acercaO ? -vo : vo, T0 = 1 / f0;
          const arrive = te => { const xs = us * te; return (D - xs + v * te) / (v - uo); }; // la cresta sale en te desde xs y alcanza al observador en x = D + uo·t
          return 1 / (arrive(T0) - arrive(0));
        } }
      };
    }
  };

  const cards = {
    "f2b-doppler": {
      title: "Efecto Doppler", aliases: ["efecto Doppler", "Doppler"], concepts: ["f2b-sonido"],
      summary: "Si la fuente y el observador se acercan, se oye más agudo; si se alejan, más grave: f' = f (v ± v_o)/(v ∓ v_s), con los signos de arriba al acercarse.",
      def: [R`**Efecto Doppler:** cambio de la frecuencia percibida por el movimiento relativo entre la fuente y el observador. Con el medio quieto y movimiento sobre la recta que los une: $$f' = f\,\frac{v \pm v_o}{v \mp v_s},$$ donde $v$ es la rapidez del sonido, $v_o$ la del observador y $v_s$ la de la fuente; los signos de arriba corresponden a acercarse.`],
      idea: [R`Una fuente que avanza «persigue» a sus propias crestas: las de adelante quedan más apretadas (longitud de onda menor) y las de atrás más separadas. Un observador que avanza hacia la fuente se encuentra con las crestas más seguido. Las dos cosas suben la frecuencia, pero por razones distintas, y por eso la fórmula no es simétrica.`],
      demo: [R`**Paso 1 (fuente en movimiento).** En un período $T$ la fuente emite una cresta y avanza $v_sT$ hacia el observador, mientras la cresta anterior avanzó $vT$. La distancia entre crestas delante de la fuente es $\lambda' = (v - v_s)T$.`,
        R`**Paso 2 (observador en movimiento).** Las crestas se mueven a $v$ y el observador va hacia ellas a $v_o$: respecto de él, se acercan a $v + v_o$. Las encuentra con frecuencia $f' = \frac{v + v_o}{\lambda'}$.`,
        R`**Paso 3.** Reemplazando $\lambda' = \frac{v - v_s}{f}$: $f' = f\,\frac{v + v_o}{v - v_s}$. Para alejarse se cambian los signos de $v_o$ y $v_s$. $\blacksquare$`],
      examples: [{ q: R`Una ambulancia con sirena de $700$ Hz se acerca a $25$ m/s a un peatón quieto.`, steps: [R`$f' = 700\cdot\frac{344}{344 - 25} \approx 755$ Hz; cuando ya pasó y se aleja, $700\cdot\frac{344}{369} \approx 653$ Hz.`] }],
      tips: [R`Para no confundirse con los signos: acercarse siempre sube la frecuencia. Elegí el signo de cada término para que pase eso.`],
      see: ["f2b-sonido", "f2b-ondas"]
    },
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
        { id: "f2b-estacionarias", title: "Ondas estacionarias, energía y Doppler", templates: ["f2b-armonicos-num", "f2b-potencia-onda-num", "f2b-doppler-num"], theory: ["f2b-ondas", "f2b-doppler"],
          intro: R`Cuerda o tubo abierto: $f_n = \frac{nv}{2L}$; cerrado en un extremo: $\frac{nv}{4L}$ con $n$ impar. Doppler: $f' = f\frac{v \pm v_o}{v \mp v_s}$.` },
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
        // error típico al despejar: sumar 1/f y 1/d_o en lugar de restarlos
        traps: ask === "di" && Math.abs(1 / (1 / f + 1 / dobj) - di) > 0.02 * Math.abs(di) ? [{ value: 1 / (1 / f + 1 / dobj), msg: "Revisá el despeje: $\\frac{1}{d_i} = \\frac1f - \\frac{1}{d_o}$, con resta." }] : [],
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

  T["f2b-dioptrio-num"] = {
    type: "numeric", concepts: ["f2b-lentes"], difficulty: 3,
    generate(r) {
      // superficie esférica entre n1 (objeto) y n2; R > 0 si el centro está del lado de la luz saliente
      const caso = r.pick(["pez", "varilla", "plano"]);
      let n1, n2, Rc, s;
      if (caso === "pez") { n1 = 1.33; n2 = 1; Rc = -r.int(10, 30); s = r.int(5, -Rc - 1); }        // pecera esférica: el objeto adentro
      else if (caso === "varilla") { n1 = 1; n2 = r.pick([1.5, 1.6]); Rc = r.int(2, 10); s = r.int(10, 60); } // extremo convexo de una varilla de vidrio
      else { n1 = 1.33; n2 = 1; Rc = Infinity; s = r.int(20, 200); }                                       // superficie plana del agua
      const sp = n2 / ((n2 - n1) / Rc - n1 / s), m = -(n1 * sp) / (n2 * s);
      if (!isFinite(sp) || Math.abs(sp) > 500) return null;   // objeto en el foco: imagen en el infinito
      const dec = x => String(x).replace(".", "{,}");
      return {
        prompt: { pez: `Un pez está a $${s}$ cm de la pared de una pecera esférica de radio $${-Rc}$ cm, sobre el diámetro que pasa por el ojo de un observador afuera ($n_{agua} = 1{,}33$; despreciá el vidrio). ¿A qué distancia de la pared ve el observador al pez (en cm, positivo si la imagen queda del lado del agua)?`,
          varilla: `El extremo de una varilla de vidrio ($n = ${dec(n2)}$) está pulido en forma de casquete convexo de radio $${Rc}$ cm. Un objeto en el aire está a $${s}$ cm del extremo, sobre el eje. ¿Dónde se forma la imagen (en cm, medida desde el extremo; positiva si es dentro del vidrio)?`,
          plano: `Una moneda está en el fondo de una pileta de $${s}$ cm de profundidad. Mirando casi verticalmente desde arriba, ¿a qué profundidad parece estar (en cm)? ($n_{agua} = 1{,}33$)` }[caso],
        answer: caso === "varilla" ? sp : -sp,
        solution: [`[[f2b-dioptrio|Refracción en una superficie esférica]]: $\\frac{n_1}{s} + \\frac{n_2}{s'} = \\frac{n_2 - n_1}{R}$, con $R > 0$ si el centro está del lado al que va la luz, y $s' > 0$ si la imagen es real (del lado de salida).`,
          caso === "plano" ? `Con $R \\to \\infty$: $s' = -\\frac{n_2}{n_1}s = -\\frac{${s}}{1{,}33} \\approx ${num(sp, 4)}$ cm. La imagen es virtual y está más arriba: la pileta parece menos profunda.`
            : `$\\frac{${dec(n1)}}{${s}} + \\frac{${dec(n2)}}{s'} = \\frac{${dec(n2)} - ${dec(n1)}}{${Rc}}$, de donde $s' \\approx ${num(sp, 4)}$ cm (${sp > 0 ? "imagen real" : "imagen virtual, del lado del objeto"}); aumento $m = -\\frac{n_1s'}{n_2s} \\approx ${num(m, 3)}$.`],
        // otro camino: se trazan dos rayos casi paraxiales con la ley de Snell exacta y se intersecan
        verify: { kind: "value", tol: 1e-4, fn: () => {
          // eje x, vértice de la superficie en x = 0, objeto en x = −s; superficie: círculo de centro (Rc, 0) (o plano x = 0)
          const trace = h => {
            const th = Math.atan(h / s), d = [Math.cos(th), Math.sin(th)];
            let P, nrm;
            if (!isFinite(Rc)) { const t = s / d[0]; P = [-s + t * d[0], t * d[1]]; nrm = [1, 0]; }
            else { const C = [Rc, 0], o = [-s - C[0], 0], b = o[0] * d[0] + o[1] * d[1], c0 = o[0] ** 2 + o[1] ** 2 - Rc * Rc, disc = Math.sqrt(b * b - c0), t = Rc > 0 ? -b - disc : -b + disc; P = [-s + t * d[0], t * d[1]]; const nn = [P[0] - C[0], P[1] - C[1]], L = Math.hypot(...nn); nrm = nn.map(x => (Rc > 0 ? -x : x) / L); }
            // Snell vectorial: n1 (d × n) = n2 (d' × n)
            const ci = -(d[0] * -nrm[0] + d[1] * -nrm[1]), eta = n1 / n2, nI = [-nrm[0], -nrm[1]], cosi = -(d[0] * nI[0] + d[1] * nI[1]), k = 1 - eta * eta * (1 - cosi * cosi), dp = d.map((x, i) => eta * x + (eta * cosi - Math.sqrt(k)) * nI[i]);
            void ci;
            return { P, dp };
          };
          const a = trace(1e-4), b = trace(2e-4);
          // intersección (real o virtual) de los dos rayos refractados
          const det = a.dp[0] * -b.dp[1] + a.dp[1] * b.dp[0], dx = b.P[0] - a.P[0], dy = b.P[1] - a.P[1], t = (dx * -b.dp[1] + dy * b.dp[0]) / det, X = a.P[0] + t * a.dp[0];
          return caso === "varilla" ? X : -X;
        } }
      };
    }
  };

  const cards = {
    "f2b-dioptrio": {
      title: "Refracción en una superficie esférica", aliases: ["dioptrio", "dioptrio esférico", "profundidad aparente", "superficie refractora"], concepts: ["f2b-lentes"],
      summary: "n₁/s + n₂/s' = (n₂ − n₁)/R para rayos cercanos al eje. Con una superficie plana (R → ∞), s' = −(n₂/n₁)s: el fondo de una pileta parece más cerca.",
      def: [R`**Dioptrio esférico:** superficie esférica de radio $R$ que separa dos medios de índices $n_1$ (donde está el objeto) y $n_2$. Para rayos paraxiales, $$\frac{n_1}{s} + \frac{n_2}{s'} = \frac{n_2 - n_1}{R}.$$ Convención: $s > 0$ si el objeto está del lado de entrada, $s' > 0$ si la imagen está del lado de salida (real), y $R > 0$ si el centro de curvatura está del lado de salida.`,
        R`**Aumento lateral:** $m = -\frac{n_1s'}{n_2s}$. **Superficie plana:** $s' = -\frac{n_2}{n_1}s$ (imagen virtual): es la **profundidad aparente**.`],
      idea: [R`Es el bloque con el que se arma todo lo demás: una lente delgada son dos dioptrios seguidos, y de ahí sale la fórmula del fabricante de lentes. El ojo también es, en buena parte, un dioptrio: la córnea hace casi todo el trabajo de enfocar.`],
      demo: [R`**Paso 1.** Un rayo sale del objeto $O$ (en el eje, a distancia $s$) con ángulo $\alpha$, llega a la superficie a una altura $h$ y, refractado, cruza el eje en $I$ (a distancia $s'$) con ángulo $\beta$. La normal en ese punto pasa por el centro $C$ y forma con el eje un ángulo $\phi$.`,
        R`**Paso 2.** Para rayos paraxiales los ángulos son chicos y se aproximan por sus tangentes: $\alpha \approx \frac hs$, $\beta \approx \frac h{s'}$, $\phi \approx \frac hR$.`,
        R`**Paso 3.** En el triángulo $O$-punto-$C$, el ángulo exterior en el punto de incidencia es el de incidencia: $\theta_1 = \alpha + \phi$. En el triángulo con $I$: $\phi = \theta_2 + \beta$, o sea $\theta_2 = \phi - \beta$.`,
        R`**Paso 4.** La [[f2b-optica|ley de Snell]] con ángulos chicos es $n_1\theta_1 = n_2\theta_2$: $n_1(\alpha + \phi) = n_2(\phi - \beta)$. Reemplazando las aproximaciones y dividiendo por $h$ (que se cancela: todos los rayos paraxiales van al mismo punto), $\frac{n_1}{s} + \frac{n_2}{s'} = \frac{n_2 - n_1}{R}$. $\blacksquare$`],
      examples: [{ q: R`Una moneda a $1$ m de profundidad en el agua, vista desde arriba.`, steps: [R`$s' = -\frac{1}{1{,}33}\cdot1 \approx -0{,}75$ m: parece estar a $75$ cm.`] }],
      tips: [R`Antes de reemplazar, dibujá hacia dónde va la luz: los signos de $s'$ y de $R$ se definen respecto de ese sentido.`],
      see: ["f2b-optica", "f2b-lentes"]
    },
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
        { id: "f2b-lentes", title: "Espejos y lentes", templates: ["f2b-optica-vf", "f2b-lente-num", "f2b-dioptrio-num"], theory: ["f2b-lentes", "f2b-dioptrio"],
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

  T["f2b-rayleigh-num"] = {
    type: "numeric", concepts: ["f2b-difraccion"], difficulty: 2,
    generate(r) {
      const kind = r.pick(["ojo", "telescopio", "rendija"]), lam = r.int(40, 70) * 10, ask = r.pick(["ang", "dist"]);
      const D = { ojo: r.int(2, 8) / 1000, telescopio: r.int(5, 100) / 100, rendija: r.int(10, 200) * 1e-6 }[kind], L = { ojo: r.int(5, 100), telescopio: r.int(1, 40) * 10, rendija: r.int(1, 5) }[kind];
      const k = kind === "rendija" ? 1 : 1.22, th = k * lam * 1e-9 / D, Lm = kind === "telescopio" ? L * 1e3 : L, dist = th * Lm, dshow = kind === "telescopio" ? dist : dist * 1000;
      const what = { ojo: `una pupila de $${D * 1000}$ mm`, telescopio: `un telescopio de $${Math.round(D * 100)}$ cm de diámetro`, rendija: `una rendija de $${Math.round(D * 1e6)}$ μm de ancho` }[kind];
      return {
        prompt: `Con luz de $${lam}$ nm y ${what}, ${ask === "ang" ? "¿cuál es la mínima separación angular entre dos fuentes puntuales para distinguirlas, según el criterio de Rayleigh (en μrad)?" : `¿a qué distancia mínima tienen que estar dos fuentes puntuales ubicadas a $${L}$ ${kind === "telescopio" ? "km" : "m"} para distinguirlas (en ${kind === "telescopio" ? "m" : "mm"})?`}`,
        answer: ask === "ang" ? th * 1e6 : dshow,
        solution: [`[[f2b-resolucion|Criterio de Rayleigh]]: dos imágenes se distinguen apenas cuando el máximo de una cae sobre el primer mínimo de la otra: $\\theta_{min} = ${kind === "rendija" ? "\\frac\\lambda a" : "1{,}22\\frac\\lambda D"}$${kind === "rendija" ? "" : " (abertura circular)"}.`,
          `$\\theta_{min} \\approx ${num(th * 1e6, 4)}$ μrad${ask === "dist" ? `, y la separación mínima es $\\theta_{min}L \\approx ${num(dshow, 4)}$ ${kind === "telescopio" ? "m" : "mm"}` : ""}.`],
        // otro camino: primer cero de la figura de difracción, buscado numéricamente (sen²(β)/β² para la rendija, [2J₁(x)/x]² para el círculo);
        // la tolerancia cubre el redondeo 1,22 del factor y la aproximación de ángulo chico
        verify: { kind: "value", tol: 2e-3, fn: () => {
          const simp = (f, a0, b0, n) => { const h = (b0 - a0) / n; let t = f(a0) + f(b0); for (let i = 1; i < n; i++) t += f(a0 + i * h) * (i % 2 ? 4 : 2); return t * h / 3; };
          const J1 = x => simp(t => Math.cos(t - x * Math.sin(t)), 0, Math.PI, 400) / Math.PI;
          const g = kind === "rendija" ? x => Math.sin(x) : x => J1(x);
          let a = 2.5, b = 4.5; for (let i = 0; i < 80; i++) { const m = (a + b) / 2; if (g(a) * g(m) <= 0) b = m; else a = m; }
          const x0 = (a + b) / 2, s = x0 * lam * 1e-9 / (Math.PI * D), t = Math.asin(s);
          return ask === "ang" ? t * 1e6 : t * Lm * (kind === "telescopio" ? 1 : 1000);
        } }
      };
    }
  };

  const cards = {
    "f2b-resolucion": {
      title: "Poder de resolución y criterio de Rayleigh", aliases: ["criterio de Rayleigh", "poder de resolución", "resolución angular"], concepts: ["f2b-difraccion"],
      summary: "Por la difracción, dos fuentes puntuales se distinguen solo si su separación angular supera θ = λ/a (rendija) o θ = 1,22 λ/D (abertura circular).",
      def: [R`**Criterio de Rayleigh:** dos fuentes puntuales están apenas resueltas cuando el máximo central de la imagen de una cae sobre el primer mínimo de la otra.`,
        R`**Rendija de ancho $a$:** $\theta_{min} \approx \frac{\lambda}{a}$. **Abertura circular de diámetro $D$** (ojo, telescopio, cámara): $\theta_{min} \approx 1{,}22\,\frac{\lambda}{D}$. A distancia $L$, la mínima separación distinguible es $\theta_{min}L$.`],
      idea: [R`Ningún instrumento forma imágenes puntuales: cada punto se vuelve una manchita de difracción, más chica cuanto más grande es la abertura y más corta la longitud de onda. Por eso los telescopios son enormes y los microscopios electrónicos (con $\lambda$ diminuta) ven mucho más detalle que los ópticos.`],
      demo: [R`**Paso 1 (rendija).** La [[f2b-difraccion|difracción de una rendija]] tiene su primer mínimo donde $a\sin\theta = \lambda$: los rayos de la mitad superior cancelan a los de la inferior de a pares.`,
        R`**Paso 2.** Si una segunda fuente está desplazada un ángulo $\Delta\theta$, su patrón es el mismo corrido $\Delta\theta$. Según Rayleigh, se distinguen cuando el máximo de una cae en el primer mínimo de la otra: $\Delta\theta = \theta_1$, con $\sin\theta_1 = \frac\lambda a$, y para ángulos chicos $\theta_{min} \approx \frac\lambda a$.`,
        R`**Paso 3 (abertura circular).** Para un círculo hay que sumar las contribuciones de toda la abertura, no de una franja; el resultado es la función de Bessel $J_1$, y el primer cero de la intensidad está en $\sin\theta = \frac{3{,}832}{\pi}\frac\lambda D \approx 1{,}22\frac\lambda D$. Ese número no sale con cuentas elementales: es el primer cero de $J_1$. $\blacksquare$`],
      examples: [{ q: R`Pupila de $5$ mm con luz de $550$ nm.`, steps: [R`$\theta_{min} = 1{,}22\cdot\frac{550\times10^{-9}}{5\times10^{-3}} \approx 1{,}3\times10^{-4}$ rad: a $10$ m se distinguen puntos separados $1{,}3$ mm.`] }],
      tips: [R`El criterio es una convención razonable, no una ley: con buen contraste se puede «resolver» un poco por debajo.`],
      see: ["f2b-difraccion", "f2b-lentes"]
    },
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
        { id: "f2b-rendija", title: "Rendija simple", templates: ["f2b-difr-vf", "f2b-rendija-num", "f2b-rayleigh-num"], theory: ["f2b-difraccion", "f2b-resolucion"],
          intro: R`Mínimos en $a\sin\theta = m\lambda$. Rendija más angosta, máximo central más ancho.` },
        { id: "f2b-redes", title: "Redes y rayos X", templates: ["f2b-red-num", "f2b-bragg-num"], theory: ["f2b-difraccion"],
          intro: R`Red: $d\sin\theta = m\lambda$. Bragg: $2d\sin\theta = m\lambda$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  EXTRA UBA · OSCILACIONES ACOPLADAS Y MODOS NORMALES
 *  Temas de Física 2 de la Lic. en Cs. Físicas (FCEN, UBA) que no figuran en el programa de F102B.
 *  Solo se tomó la lista de temas; el texto y los ejercicios son originales.
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {}, g = 9.8;
  const dn = (x, d = 3) => String(num(x, d)).replace(".", "{,}");
  // período simulado (RK4) de la coordenada y[0]: tiempo entre dos cruces sucesivos de 0 hacia arriba
  const simPeriod = (f, y0, Test) => {
    let y = y0.slice(), t = 0; const h = Test / 4000, cr = [];
    const add = (a, b, c) => a.map((v, i) => v + b[i] * c);
    while (cr.length < 2 && t < 6 * Test) {
      const k1 = f(y), k2 = f(add(y, k1, h / 2)), k3 = f(add(y, k2, h / 2)), k4 = f(add(y, k3, h));
      const yn = y.map((v, i) => v + h / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
      if (y[0] < 0 && yn[0] >= 0) cr.push(t + h * (-y[0]) / (yn[0] - y[0]));
      y = yn; t += h;
    }
    return cr[1] - cr[0];
  };
  // sistema de dos grados de libertad: ẍ₁ = −a x₁ − c(x₁ − x₂), ẍ₂ = −a x₂ − c(x₂ − x₁)
  const two = (a, c) => y => [y[2], y[3], -a * y[0] - c * (y[0] - y[1]), -a * y[1] - c * (y[1] - y[0])];

  T["f2b-2masas-num"] = {
    type: "numeric", concepts: ["f2b-acopladas"], difficulty: 2,
    generate(r) {
      const v = r.pick(["resortes", "pendulos"]), modo = r.pick(["fase", "contrafase"]), unit = r.pick(["w", "f"]);
      let a, c, prompt, sys;
      if (v === "resortes") {
        const m = r.int(1, 8) / 2, k = r.int(5, 40) * 10, kc = r.int(1, 20) * 10;
        a = k / m; c = kc / m;
        sys = `Dos carritos de $${dn(m, 1)}$ kg cada uno se mueven sin rozamiento sobre un riel. Cada uno está unido a su pared por un resorte de $k = ${k}$ N/m, y entre ellos hay otro resorte de $k' = ${kc}$ N/m.`;
      } else {
        const L = r.int(4, 20) / 10, m = r.int(2, 10) / 10, kc = r.int(1, 15) / 10;
        a = g / L; c = kc / m;
        sys = `Dos péndulos iguales de $${dn(L, 1)}$ m y $${dn(m, 1)}$ kg están unidos por un resorte liviano de $k = ${dn(kc, 1)}$ N/m, que está sin estirar cuando cuelgan verticales. Considerá oscilaciones chicas ($g = 9{,}8$ m/s²).`;
      }
      const w = modo === "fase" ? Math.sqrt(a) : Math.sqrt(a + 2 * c), ans = unit === "w" ? w : w / (2 * Math.PI);
      prompt = `${sys} ¿Cuál es ${unit === "w" ? "la frecuencia angular (rad/s)" : "la frecuencia (Hz)"} del modo normal en el que se mueven ${modo === "fase" ? "en fase (los dos para el mismo lado)" : "en contrafase (uno hacia cada lado)"}?`;
      return {
        prompt, answer: ans,
        solution: [
          `Un [[f2b-acopladas|modo normal]] es un movimiento en el que todo oscila con la misma frecuencia. Sumando y restando las ecuaciones de los dos cuerpos aparecen $q_1 = x_1 + x_2$ y $q_2 = x_1 - x_2$, que oscilan solas.`,
          modo === "fase" ? `En fase, el resorte del medio no se estira: es como si no estuviera, y $\\omega_1 = ${v === "resortes" ? "\\sqrt{k/m}" : "\\sqrt{g/L}"} = ${dn(Math.sqrt(a), 4)}$ rad/s.`
            : `En contrafase, el resorte del medio se estira el doble que lo que se mueve cada cuerpo: $\\omega_2 = \\sqrt{${v === "resortes" ? "\\frac km" : "\\frac gL"} + \\frac{2k'}{m}} = ${dn(Math.sqrt(a + 2 * c), 4)}$ rad/s.`.replace("k'", v === "resortes" ? "k'" : "k"),
          unit === "f" ? `$f = \\frac{\\omega}{2\\pi} \\approx ${dn(ans, 4)}$ Hz.` : `$\\omega \\approx ${dn(ans, 4)}$ rad/s.`
        ],
        // verificación: se simula el sistema arrancando en esa forma de modo y se mide el período
        verify: { kind: "value", tol: 1e-5, fn: () => { const Tp = simPeriod(two(a, c), modo === "fase" ? [0, 0, 1, 1] : [0, 0, 1, -1], 2 * Math.PI / w); return unit === "w" ? 2 * Math.PI / Tp : 1 / Tp; } }
      };
    }
  };
  T["f2b-batido-num"] = {
    type: "numeric", concepts: ["f2b-acopladas"], difficulty: 3,
    generate(r) {
      const L = r.int(5, 20) / 10, m = r.int(2, 10) / 10, kc = r.pick([0.02, 0.05, 0.1, 0.2, 0.3]), ask = r.pick(["transfer", "vuelta"]);
      const a = g / L, c = kc / m, w1 = Math.sqrt(a), w2 = Math.sqrt(a + 2 * c), Tb = 2 * Math.PI / (w2 - w1), ans = ask === "transfer" ? Tb / 2 : Tb;
      return {
        prompt: `Dos péndulos iguales ($L = ${dn(L, 1)}$ m, $m = ${dn(m, 1)}$ kg) están unidos por un resorte débil de $k = ${dn(kc, 2)}$ N/m. Se aparta uno de ellos y se suelta desde el reposo con el otro quieto. ¿${ask === "transfer" ? "Cuánto tarda (s) en pasar toda la oscilación al otro péndulo" : "Cada cuánto tiempo (s) la oscilación vuelve a estar toda en el primer péndulo"}? ($g = 9{,}8$ m/s²)`,
        answer: ans,
        solution: [
          `La condición inicial es la mitad del modo en fase más la mitad del modo en contrafase: $x_1 = \\frac A2(\\cos\\omega_1t + \\cos\\omega_2t) = A\\cos\\frac{(\\omega_2 - \\omega_1)t}{2}\\cos\\frac{(\\omega_1 + \\omega_2)t}{2}$ ([[f2b-acopladas|batidos]]).`,
          `$\\omega_1 = \\sqrt{g/L} = ${dn(w1, 4)}$ rad/s y $\\omega_2 = \\sqrt{g/L + 2k/m} = ${dn(w2, 4)}$ rad/s.`,
          `La envolvente de $x_1$ se anula cuando $\\frac{(\\omega_2 - \\omega_1)t}{2} = \\frac\\pi2$, o sea en $t = \\frac{\\pi}{\\omega_2 - \\omega_1} \\approx ${dn(Tb / 2, 2)}$ s; vuelve a estar entera en el primero cada $\\frac{2\\pi}{\\omega_2 - \\omega_1} \\approx ${dn(Tb, 2)}$ s.`
        ],
        // verificación: se miden por simulación los períodos de los dos modos y se arma la envolvente con ellos
        verify: { kind: "value", tol: 1e-4, fn: () => { const T1 = simPeriod(two(a, c), [0, 0, 1, 1], 2 * Math.PI / w1), T2 = simPeriod(two(a, c), [0, 0, 1, -1], 2 * Math.PI / w2);
          const tb = 1 / (1 / T2 - 1 / T1); return ask === "transfer" ? tb / 2 : tb; } }
      };
    }
  };
  T["f2b-modo-mc"] = {
    type: "mc", concepts: ["f2b-acopladas"], difficulty: 2,
    generate(r) {
      const [m1, m2] = r.distinct(2, 1, 9), k = r.int(2, 20) * 10, want = r.pick(["oscila", "oscila", "cero"]);
      const val = want === "cero" ? 1 : -m2 / m1, tex = want === "cero" ? "1" : H.frac(-m2, m1);
      const opts = [H.frac(-m1, m2), H.frac(m2, m1), H.frac(m1, m2), "-1", "1", tex].filter(x => x !== tex);
      const w2 = k * (1 / m1 + 1 / m2);
      return {
        prompt: `Dos cuerpos de $${m1}$ kg y $${m2}$ kg, apoyados sin rozamiento, están unidos por un resorte de $${k}$ N/m (no hay paredes). ¿Cuánto vale el cociente de amplitudes $A_1/A_2$ en el modo normal de frecuencia ${want === "cero" ? "**cero**" : "**no nula**"}?`,
        ...H.mc(r, `\\frac{A_1}{A_2} = ${tex}`, opts.map(x => `\\frac{A_1}{A_2} = ${x}`)),
        solution: [
          `Con $x_j = A_j\\cos\\omega t$: $-m_1\\omega^2A_1 = -k(A_1 - A_2)$ y $-m_2\\omega^2A_2 = -k(A_2 - A_1)$. Hay solución no nula si $\\omega = 0$ o $\\omega^2 = k\\left(\\frac{1}{m_1} + \\frac{1}{m_2}\\right) = ${dn(w2, 3)}$ s⁻² ([[f2b-acopladas|modos normales]]).`,
          want === "cero" ? `Con $\\omega = 0$ las ecuaciones dan $A_1 = A_2$: es una **traslación** rígida, sin estirar el resorte.`
            : `Sumando las ecuaciones: $m_1A_1 + m_2A_2 = 0$, así que $\\frac{A_1}{A_2} = -\\frac{m_2}{m_1} = ${tex}$. El centro de masa queda quieto y el más liviano se mueve más.`
        ],
        // verificación: el vector (A₁, A₂) propuesto tiene que ser autovector de M⁻¹K con autovalor ω²
        verify: { kind: "eig", A: [[k / m1, -k / m1], [-k / m2, k / m2]], lambda: want === "cero" ? 0 : w2, v: [val, 1] }
      };
    }
  };
  T["f2b-triatomica-num"] = {
    type: "numeric", concepts: ["f2b-cadena"], difficulty: 2,
    generate(r) {
      const v = r.pick(["cociente", "carritos"]);
      if (v === "cociente") {
        const [nm, m, M] = r.pick([["CO₂ (O = 16 u, C = 12 u)", 16, 12], ["CS₂ (S = 32 u, C = 12 u)", 32, 12], ["una molécula A–B–A con A = 1 u y B = 12 u", 1, 12], ["una molécula A–B–A con A = 35 u y B = 24 u", 35, 24]]);
        const ratio = Math.sqrt(1 + 2 * m / M);
        return { prompt: `Modelá ${nm} como tres masas en línea unidas por dos resortes iguales. ¿Cuánto vale el cociente entre la frecuencia del modo asimétrico y la del modo simétrico (estiramiento)?`, answer: ratio,
          solution: [`[[f2b-cadena|Molécula triatómica]]: hay tres modos longitudinales. Uno es la traslación ($\\omega = 0$).`,
            `Modo **simétrico**: el átomo central queda quieto y los extremos se mueven opuestos: $\\omega_s = \\sqrt{k/m}$.`,
            `Modo **asimétrico**: los extremos van juntos y el centro al revés (el centro de masa no se mueve): $\\omega_a = \\sqrt{\\frac km\\left(1 + \\frac{2m}{M}\\right)}$.`,
            `$\\frac{\\omega_a}{\\omega_s} = \\sqrt{1 + \\frac{2\\cdot${m}}{${M}}} \\approx ${dn(ratio, 4)}$.`],
          // verificación: ω² = cociente² tiene que anular det(M⁻¹K − ω²I) con k = m = 1 (Gauss)
          verify: { kind: "eig", A: [[1, -1, 0], [-m / M, 2 * m / M, -m / M], [0, -1, 1]], lambda: ratio * ratio } };
      }
      const m = r.int(1, 6) / 2, M = r.int(1, 8) / 2, k = r.int(5, 40) * 10, ask = r.pick(["s", "a"]);
      const w = ask === "s" ? Math.sqrt(k / m) : Math.sqrt(k / m * (1 + 2 * m / M)), f = w / (2 * Math.PI);
      if (m === M) return null;
      return { prompt: `Tres carritos en línea (de $${dn(m, 1)}$ kg, $${dn(M, 1)}$ kg y $${dn(m, 1)}$ kg) están unidos por dos resortes de $${k}$ N/m y se mueven sin rozamiento, sin paredes. ¿Cuál es la frecuencia (Hz) del modo ${ask === "s" ? "en el que el carrito del medio queda quieto" : "en el que los dos de los extremos se mueven juntos y el del medio al revés"}?`, answer: f,
        solution: [`Es el modelo de una [[f2b-cadena|molécula triatómica]]. ${ask === "s" ? "Con el del medio quieto, cada extremo oscila con su resorte: $\\omega = \\sqrt{k/m}$." : "Como el centro de masa no se mueve, $2mA_1 + MA_2 = 0$; reemplazando, $\\omega = \\sqrt{\\frac km\\left(1 + \\frac{2m}{M}\\right)}$."}`,
          `$\\omega \\approx ${dn(w, 4)}$ rad/s, $f = \\frac{\\omega}{2\\pi} \\approx ${dn(f, 4)}$ Hz.`],
        verify: { kind: "eig", A: [[k / m, -k / m, 0], [-k / M, 2 * k / M, -k / M], [0, -k / m, k / m]], lambda: (2 * Math.PI * f) ** 2 } };
    }
  };
  T["f2b-cadena-num"] = {
    type: "numeric", concepts: ["f2b-cadena"], difficulty: 3,
    generate(r) {
      const N = r.int(2, 6), n = r.int(1, N), m = r.int(1, 10) / 10, k = r.int(2, 30) * 10;
      const w = 2 * Math.sqrt(k / m) * Math.sin(n * Math.PI / (2 * (N + 1))), f = w / (2 * Math.PI);
      const A = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => (i === j ? 2 * k / m : Math.abs(i - j) === 1 ? -k / m : 0)));
      return {
        prompt: `Entre dos paredes hay $${N}$ masas de $${dn(m, 1)}$ kg en línea, unidas entre sí y a las paredes por $${N + 1}$ resortes iguales de $${k}$ N/m. Para oscilaciones longitudinales, ¿cuál es la frecuencia (Hz) del modo normal número $${n}$ (ordenados de menor a mayor frecuencia)?`,
        answer: f,
        solution: [
          `[[f2b-cadena|Cadena de osciladores]]: los modos son $x_j = A\\sin\\frac{jn\\pi}{N + 1}\\cos\\omega_nt$, con $$\\omega_n = 2\\sqrt{\\frac km}\\sin\\frac{n\\pi}{2(N + 1)}.$$`,
          `$\\omega_{${n}} = 2\\sqrt{\\frac{${k}}{${dn(m, 1)}}}\\sin\\frac{${n}\\pi}{${2 * (N + 1)}} \\approx ${dn(w, 4)}$ rad/s, así que $f \\approx ${dn(f, 4)}$ Hz.`,
          `Ninguna frecuencia supera $2\\sqrt{k/m}$: es la máxima que deja pasar la cadena.`
        ],
        // verificación: ω² tiene que ser autovalor de la matriz tridiagonal M⁻¹K (determinante por Gauss)
        verify: { kind: "eig", A, lambda: w * w }
      };
    }
  };

  const cards = {
    "f2b-acopladas": {
      title: "Oscilaciones acopladas, modos normales y batidos", aliases: ["oscilaciones acopladas", "osciladores acoplados", "péndulos acoplados", "modos normales", "modo normal", "frecuencias propias", "batidos", "pulsaciones"], concepts: ["f2b-acopladas"],
      summary: "Un sistema de N grados de libertad tiene N modos normales: movimientos en los que todo oscila con la misma frecuencia. Cualquier movimiento es una superposición de modos.",
      def: [R`Dos cuerpos de masa $m$ unidos a paredes por resortes $k$ y entre sí por un resorte $k'$ cumplen $$m\ddot x_1 = -kx_1 - k'(x_1 - x_2), \qquad m\ddot x_2 = -kx_2 - k'(x_2 - x_1).$$`,
        R`Un **modo normal** es una solución $x_j = A_j\cos(\omega t + \varphi)$ con la misma $\omega$ para todos. Reemplazando queda $(K - \omega^2M)\vec A = 0$, que tiene solución no nula solo si $\det(K - \omega^2M) = 0$: las $\omega$ son las **frecuencias propias** y los $\vec A$, las formas de los modos (ver [[al-autovalores|autovalores]]).`,
        R`En el caso simétrico: modo **en fase** ($A_1 = A_2$), con $\omega_1 = \sqrt{k/m}$; modo **en contrafase** ($A_1 = -A_2$), con $\omega_2 = \sqrt{(k + 2k')/m}$.`,
        R`**Batidos:** si se suelta uno solo, $x_1 = A\cos\frac{(\omega_2 - \omega_1)t}{2}\cos\frac{(\omega_1 + \omega_2)t}{2}$. Con acople débil, la oscilación pasa de un cuerpo al otro y vuelve cada $\frac{2\pi}{\omega_2 - \omega_1}$.`],
      idea: [R`En un modo normal el sistema se comporta como un único oscilador. Encontrar los modos es "desacoplar" el problema: en las coordenadas $q_1 = x_1 + x_2$ y $q_2 = x_1 - x_2$, cada una oscila sola.`,
        R`Los batidos se oyen al afinar una guitarra: dos cuerdas casi iguales suenan con un volumen que sube y baja a la frecuencia $|f_1 - f_2|$.`,
        { graph: { fns: [t => Math.cos(0.15 * t) * Math.cos(3 * t), t => Math.sin(0.15 * t) * Math.sin(3 * t)], xr: [0, 42], yr: [-1.2, 1.2] }, caption: R`Batidos en dos péndulos acoplados: la oscilación del primero (violeta) pasa al segundo (naranja) y vuelve.` }],
      demo: [R`**Paso 1 (coordenadas normales).** Sumamos las dos ecuaciones: $m(\ddot x_1 + \ddot x_2) = -k(x_1 + x_2)$, porque los términos de $k'$ se cancelan. Restándolas: $m(\ddot x_1 - \ddot x_2) = -(k + 2k')(x_1 - x_2)$.`,
        R`**Paso 2 (cada una oscila sola).** Con $q_1 = x_1 + x_2$ y $q_2 = x_1 - x_2$ quedan dos [[f1-mas|MAS]] independientes: $\ddot q_1 = -\frac km q_1$ y $\ddot q_2 = -\frac{k + 2k'}{m}q_2$, de frecuencias $\omega_1$ y $\omega_2$.`,
        R`**Paso 3 (soltar uno solo).** Con $x_1(0) = A$, $x_2(0) = 0$ y velocidades nulas: $q_1 = A\cos\omega_1t$ y $q_2 = A\cos\omega_2t$. Volviendo, $x_1 = \frac{q_1 + q_2}{2} = \frac A2(\cos\omega_1t + \cos\omega_2t)$.`,
        R`**Paso 4 (suma de cosenos).** Con $\cos a + \cos b = 2\cos\frac{a - b}{2}\cos\frac{a + b}{2}$ queda $x_1 = A\cos\frac{(\omega_2 - \omega_1)t}{2}\cos\frac{(\omega_1 + \omega_2)t}{2}$: una oscilación rápida con una envolvente lenta, que se anula por primera vez en $t = \frac{\pi}{\omega_2 - \omega_1}$. $\blacksquare$`],
      examples: [{ q: R`Dos péndulos de 1 m unidos por un resorte con $2k/m = 0{,}2$ s⁻². ¿Cuánto tarda en pasar la oscilación de uno al otro?`, steps: [R`$\omega_1 = \sqrt{9{,}8} \approx 3{,}130$ rad/s y $\omega_2 = \sqrt{10} \approx 3{,}162$ rad/s.`, R`$t = \frac{\pi}{\omega_2 - \omega_1} \approx \frac{\pi}{0{,}032} \approx 98$ s.`] }],
      see: ["f2b-cadena", "f1-mas", "al-autovalores"]
    },
    "f2b-cadena": {
      title: "Cadenas de osciladores y molécula triatómica", aliases: ["cadena de osciladores", "cadena de masas y resortes", "molécula triatómica", "relación de dispersión", "límite continuo"], concepts: ["f2b-cadena"],
      summary: "N masas iguales entre paredes: ω_n = 2√(k/m) sen(nπ/(2(N+1))). Hay una frecuencia máxima, y para N grande se recupera la ecuación de ondas.",
      def: [R`Con $N$ masas $m$ entre paredes y $N + 1$ resortes $k$: $m\ddot x_j = k(x_{j+1} - 2x_j + x_{j-1})$, con $x_0 = x_{N+1} = 0$.`,
        R`Los modos son $x_j = A\sin\frac{jn\pi}{N + 1}\cos\omega_nt$ ($n = 1, \dots, N$), con $$\omega_n = 2\sqrt{\frac km}\sin\frac{n\pi}{2(N + 1)}.$$`,
        R`**Relación de dispersión:** para una cadena larga con separación $a$, una onda $e^{i(qja - \omega t)}$ cumple $\omega = 2\sqrt{k/m}\,|\sin(qa/2)|$. Para longitudes de onda largas, $\omega \approx a\sqrt{k/m}\,q$: es una onda con rapidez $a\sqrt{k/m}$ (el [[f2b-sonido|sonido]] en un sólido).`,
        R`**Molécula triatómica** $A$–$B$–$A$ (masas $m$, $M$, $m$): una traslación ($\omega = 0$), el modo simétrico $\omega_s = \sqrt{k/m}$ (el centro quieto) y el asimétrico $\omega_a = \sqrt{\frac km\left(1 + \frac{2m}{M}\right)}$.`],
      idea: [R`Una cadena discreta no transmite cualquier frecuencia: por encima de $2\sqrt{k/m}$ no hay modos. Ondas más cortas que $2a$ no tienen sentido, porque no hay nada entre las masas.`,
        R`Las frecuencias de la molécula triatómica son las que absorbe en el infrarrojo: el modo asimétrico del CO₂ (unos 70 THz) es el que lo vuelve un gas de efecto invernadero.`,
        { graph: { fns: [q => 2 * Math.abs(Math.sin(q / 2)), q => Math.abs(q)], xr: [-3.3, 3.3], yr: [0, 2.6] }, caption: R`Relación de dispersión de la cadena (violeta) y la de una cuerda continua (naranja): coinciden para $qa$ chico.` }],
      demo: [R`**Paso 1 (proponer un modo).** Con $x_j = A_j\cos\omega t$, cada ecuación queda $-m\omega^2A_j = k(A_{j+1} - 2A_j + A_{j-1})$.`,
        R`**Paso 2 (probar con senos).** Proponemos $A_j = \sin(j\theta)$. Por la suma de senos, $A_{j+1} + A_{j-1} = \sin((j + 1)\theta) + \sin((j - 1)\theta) = 2\sin(j\theta)\cos\theta$.`,
        R`**Paso 3 (la frecuencia).** Reemplazando y dividiendo por $\sin(j\theta)$: $-m\omega^2 = k(2\cos\theta - 2)$, o sea $\omega^2 = \frac{2k}{m}(1 - \cos\theta) = \frac{4k}{m}\sin^2\frac\theta2$.`,
        R`**Paso 4 (las paredes).** $A_0 = \sin 0 = 0$ se cumple solo. Para $A_{N+1} = 0$ hace falta $\sin((N + 1)\theta) = 0$, o sea $\theta = \frac{n\pi}{N + 1}$, y queda $\omega_n = 2\sqrt{k/m}\sin\frac{n\pi}{2(N + 1)}$. $\blacksquare$`],
      examples: [{ q: R`Tres masas de 0,5 kg con cuatro resortes de 50 N/m. ¿Frecuencias propias?`, steps: [R`$2\sqrt{k/m} = 20$ rad/s. $\omega_n = 20\sin\frac{n\pi}{8}$: $7{,}65$, $14{,}1$ y $18{,}5$ rad/s.`] }],
      see: ["f2b-acopladas", "f2b-ondas"]
    }
  };

  E.extendCourse("f102b", {
    concepts: { "f2b-acopladas": { name: "Oscilaciones acopladas" }, "f2b-cadena": { name: "Cadenas y moléculas" } },
    templates: T,
    units: [{
      id: "f2b-acopladas-u", order: 9, program: "Extra UBA", title: "Oscilaciones acopladas y modos normales", icon: "rotate-ccw",
      diagnostic: ["f2b-2masas-num", "f2b-batido-num", "f2b-cadena-num"],
      lessons: [
        { id: "f2b-acopladas", title: "Dos osciladores acoplados", templates: ["f2b-2masas-num", "f2b-modo-mc", "f2b-batido-num"], theory: ["f2b-acopladas"],
          intro: R`Modos normales: todo oscila con la misma $\omega$, dada por $\det(K - \omega^2M) = 0$. Soltando uno solo hay batidos.` },
        { id: "f2b-cadena", title: "Cadenas y moléculas", templates: ["f2b-triatomica-num", "f2b-cadena-num"], theory: ["f2b-cadena", "f2b-acopladas"],
          intro: R`$N$ masas: $\omega_n = 2\sqrt{k/m}\sin\frac{n\pi}{2(N + 1)}$. Triatómica: $0$, $\sqrt{k/m}$ y $\sqrt{\frac km(1 + \frac{2m}{M})}$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  EXTRA UBA · POLARIZACIÓN
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {};
  const dn = (x, d = 3) => String(num(x, d)).replace(".", "{,}");
  const rad = d => d * Math.PI / 180, deg = x => x * 180 / Math.PI;
  // cálculo de Jones con números complejos [re, im]
  const cm = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]], ca = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const apply = (J, v) => [ca(cm(J[0][0], v[0]), cm(J[0][1], v[1])), ca(cm(J[1][0], v[0]), cm(J[1][1], v[1]))];
  const pol = th => { const c = Math.cos(rad(th)), s = Math.sin(rad(th)); return [[[c * c, 0], [c * s, 0]], [[c * s, 0], [s * s, 0]]]; };
  // lámina con eje rápido a α y retardo δ: R(−α)·diag(1, e^{iδ})·R(α)
  const plate = (al, dl) => { const c = Math.cos(rad(al)), s = Math.sin(rad(al)), e = [Math.cos(dl), Math.sin(dl)];
    return [[ca([c * c, 0], cm([s * s, 0], e)), ca([c * s, 0], cm([-c * s, 0], e))], [ca([c * s, 0], cm([-c * s, 0], e)), ca([s * s, 0], cm([c * c, 0], e))]]; };
  const inten = v => v[0][0] ** 2 + v[0][1] ** 2 + v[1][0] ** 2 + v[1][1] ** 2;
  // luz natural: promedio sobre 720 polarizaciones lineales de entrada
  const natural = els => { let s = 0; for (let i = 0; i < 720; i++) { const a = i * Math.PI / 720; let v = [[Math.cos(a), 0], [Math.sin(a), 0]]; for (const J of els) v = apply(J, v); s += inten(v); } return s / 720; };

  T["f2b-malus-num"] = {
    type: "numeric", concepts: ["f2b-polarizacion"], difficulty: 2,
    generate(r) {
      const v = r.pick(["dos", "tres", "angulo"]), I0 = r.int(2, 20) * 10;
      if (v === "dos") {
        const th = r.pick([15, 20, 30, 37, 45, 53, 60, 70]), I = I0 / 2 * Math.cos(rad(th)) ** 2;
        return { prompt: `Un haz de luz natural de $${I0}$ W/m² atraviesa dos polarizadores ideales cuyos ejes forman $${th}^\\circ$. ¿Qué intensidad (W/m²) sale?`, answer: I,
          solution: [`El primero deja pasar la mitad de la luz natural: $\\frac{I_0}{2} = ${dn(I0 / 2, 1)}$ W/m², linealmente polarizada según su eje.`, `El segundo cumple la [[f2b-polarizacion|ley de Malus]]: $I = \\frac{I_0}{2}\\cos^2 ${th}^\\circ \\approx ${dn(I, 3)}$ W/m².`],
          verify: { kind: "value", tol: 1e-6, fn: () => I0 * natural([pol(0), pol(th)]) } };
      }
      if (v === "tres") {
        const th = r.pick([15, 20, 30, 45, 60, 75]), I = I0 / 2 * (Math.cos(rad(th)) * Math.sin(rad(th))) ** 2;
        return { prompt: `Entre dos polarizadores cruzados (ejes a $90^\\circ$) se coloca un tercero, con su eje a $${th}^\\circ$ del primero. Si incide luz natural de $${I0}$ W/m², ¿qué intensidad (W/m²) sale?`, answer: I,
          solution: [`Sin el del medio no pasaría nada. Con él: $\\frac{I_0}{2}$ después del primero, $\\frac{I_0}{2}\\cos^2 ${th}^\\circ$ después del segundo y $\\frac{I_0}{2}\\cos^2 ${th}^\\circ\\cos^2 ${90 - th}^\\circ$ al final ([[f2b-polarizacion|Malus]]).`,
            `$I = \\frac{I_0}{8}\\sin^2(2\\cdot${th}^\\circ) \\approx ${dn(I, 3)}$ W/m². Agregar un filtro **aumenta** la luz que pasa.`],
          verify: { kind: "value", tol: 1e-6, fn: () => I0 * natural([pol(0), pol(th), pol(90)]) } };
      }
      const f = r.pick([0.1, 0.2, 0.25, 0.3, 0.375, 0.4]), th = deg(Math.acos(Math.sqrt(2 * f)));
      return { prompt: `Luz natural atraviesa dos polarizadores ideales y sale el $${dn(100 * f, 1)}\\,\\%$ de la intensidad incidente. ¿Qué ángulo (en grados, entre 0° y 90°) forman sus ejes?`, answer: th,
        solution: [`$\\frac{I}{I_0} = \\frac12\\cos^2\\theta$ ([[f2b-polarizacion|Malus]], con la mitad que se pierde en el primero).`, `$\\cos^2\\theta = 2\\cdot${dn(f, 3)} = ${dn(2 * f, 3)}$, así que $\\theta \\approx ${dn(th, 2)}^\\circ$.`],
        verify: { kind: "zero", fn: x => [natural([pol(0), pol(x)]) - f], tol: 1e-6 } };
    }
  };
  const PAIRS = [["aire", 1, "vidrio", 1.5], ["aire", 1, "agua", 1.33], ["agua", 1.33, "vidrio", 1.5], ["aire", 1, "diamante", 2.42], ["vidrio", 1.5, "aire", 1], ["aire", 1, "un plástico", 1.59]];
  // coeficiente de reflexión de Fresnel para la polarización paralela al plano de incidencia, con Snell
  const rp = (n1, n2, th) => { const st = n1 * Math.sin(th) / n2, ct = Math.sqrt(1 - st * st), ci = Math.cos(th); return (n2 * ci - n1 * ct) / (n2 * ci + n1 * ct); };
  T["f2b-brewster-num"] = {
    type: "numeric", concepts: ["f2b-brewster"], difficulty: 2,
    generate(r) {
      const [m1, n1, m2, n2] = r.pick(PAIRS), ask = r.pick(["B", "t"]), thB = deg(Math.atan(n2 / n1)), tht = 90 - thB;
      return {
        prompt: `Luz que viaja por ${m1} ($n = ${dn(n1, 2)}$) incide sobre ${m2} ($n = ${dn(n2, 2)}$). ¿${ask === "B" ? "Con qué ángulo de incidencia (grados) la luz reflejada sale totalmente polarizada" : "Qué ángulo (grados) forma con la normal el rayo refractado cuando se incide con el ángulo de Brewster"}?`,
        answer: ask === "B" ? thB : tht,
        solution: [`[[f2b-brewster|Ángulo de Brewster]]: la componente polarizada en el plano de incidencia no se refleja cuando el rayo reflejado y el refractado son perpendiculares.`,
          `Con Snell y $\\theta_B + \\theta_t = 90^\\circ$: $\\tan\\theta_B = \\frac{n_2}{n_1} = ${dn(n2 / n1, 4)}$, así que $\\theta_B \\approx ${dn(thB, 2)}^\\circ$.`,
          ask === "t" ? `El refractado forma $\\theta_t = 90^\\circ - \\theta_B \\approx ${dn(tht, 2)}^\\circ$.` : `La luz reflejada queda polarizada perpendicular al plano de incidencia: por eso los anteojos polarizados cortan los reflejos del agua.`],
        // verificación: el coeficiente de Fresnel r_p, calculado con Snell, se anula en ese ángulo
        verify: { kind: "zero", fn: x => [rp(n1, n2, rad(ask === "B" ? x : deg(Math.asin(n2 * Math.sin(rad(x)) / n1))))], tol: 1e-9 }
      };
    }
  };
  const MATS = [["cuarzo", 1.544, 1.553], ["calcita", 1.658, 1.486], ["rutilo", 2.616, 2.903], ["un plástico estirado", 1.5, 1.505]];
  T["f2b-lamina-num"] = {
    type: "numeric", concepts: ["f2b-laminas"], difficulty: 2,
    generate(r) {
      const [nm, no, ne] = r.pick(MATS), lam = r.pick([450, 500, 550, 589, 633, 700]), q = r.pick([4, 2]), dnI = Math.abs(ne - no);
      const d = lam * 1e-9 / (q * dnI);
      return {
        prompt: `¿Qué espesor mínimo (en μm) tiene que tener una lámina de ${nm} ($n_o = ${dn(no, 3)}$, $n_e = ${dn(ne, 3)}$) para funcionar como lámina de ${q === 4 ? "cuarto de" : "media"} onda con luz de $${lam}$ nm?`,
        answer: d * 1e6,
        solution: [`En una [[f2b-laminas|lámina retardadora]], las dos componentes viajan con índices distintos y salen desfasadas $\\delta = \\frac{2\\pi}{\\lambda}|n_e - n_o|\\,d$.`,
          `${q === 4 ? "Cuarto de onda: $\\delta = \\frac\\pi2$" : "Media onda: $\\delta = \\pi$"}, o sea $d = \\frac{\\lambda}{${q}|n_e - n_o|} = \\frac{${lam}\\ \\text{nm}}{${q}\\cdot${dn(dnI, 3)}} \\approx ${dn(d * 1e6, 3)}\\ \\mu\\text{m}$.`],
        // verificación: con luz lineal a 45° del eje, se sigue el vector campo a la salida durante un período:
        // con λ/4 tiene que dar módulo constante (circular); con λ/2, lineal a −45° (Ex + Ey ≡ 0)
        verify: { kind: "zero", fn: x => { const delta = 2 * Math.PI * dnI * x * 1e-6 / (lam * 1e-9); let mx = 0, mn = 9, s = 0;
          for (let i = 0; i < 360; i++) { const t = i * Math.PI / 180, ex = Math.cos(t), ey = Math.cos(t - delta), m = Math.hypot(ex, ey); mx = Math.max(mx, m); mn = Math.min(mn, m); s = Math.max(s, Math.abs(ex + ey)); }
          return [q === 4 ? mx - mn : s]; }, tol: 1e-6 }
      };
    }
  };
  const PHI = [[0, "0"], [Math.PI, "\\pi"], [Math.PI / 2, "\\frac{\\pi}{2}"], [-Math.PI / 2, "-\\frac{\\pi}{2}"], [Math.PI / 3, "\\frac{\\pi}{3}"], [Math.PI / 4, "\\frac{\\pi}{4}"], [3 * Math.PI / 4, "\\frac{3\\pi}{4}"]];
  const STATES = ["Lineal", "Circular", "Elíptica", "No polarizada"];
  T["f2b-polestado-mc"] = {
    type: "mc", concepts: ["f2b-polarizacion"], difficulty: 1,
    generate(r) {
      const [phi, ptex] = r.pick(PHI), A = r.int(1, 5), B = r.bool() ? A : r.int(1, 5);
      const correct = Math.abs(Math.sin(phi)) < 1e-12 ? "Lineal" : A === B && Math.abs(Math.abs(phi) - Math.PI / 2) < 1e-12 ? "Circular" : "Elíptica";
      const amp = a => (a === 1 ? "" : String(a)), ph = phi === 0 ? "" : ptex.startsWith("-") ? ` - ${ptex.slice(1)}` : ` + ${ptex}`;
      return {
        prompt: `Una onda luminosa que avanza en $z$ tiene campo eléctrico $E_x = ${amp(A)}\\cos(kz - \\omega t)$, $E_y = ${amp(B)}\\cos(kz - \\omega t${ph})$. ¿Qué [[f2b-polarizacion|polarización]] tiene?`,
        ...H.mc(r, correct, STATES.filter(s => s !== correct), { text: true, keepOrder: false }),
        solution: [`En un punto fijo, la punta de $\\vec E$ recorre una curva. Si el desfasaje es $0$ o $\\pi$, las componentes son proporcionales y $\\vec E$ oscila sobre una recta: **lineal**.`,
          `Si el desfasaje es $\\pm\\frac\\pi2$ y las amplitudes son iguales, $|\\vec E|$ es constante y gira: **circular**. Cualquier otro caso es **elíptica**. Acá: **${correct.toLowerCase()}**.`],
        // verificación: se sigue la punta de E durante un período: área barrida (fórmula del zapatero) y variación del módulo
        verify: { kind: "truth", target: true, fn: () => { let area = 0, mx = 0, mn = 99; const P = [];
          for (let i = 0; i < 720; i++) { const t = i * Math.PI / 360; P.push([A * Math.cos(-t), B * Math.cos(-t + phi)]); }
          P.forEach((p, i) => { const q = P[(i + 1) % P.length]; area += p[0] * q[1] - q[0] * p[1]; const m = Math.hypot(p[0], p[1]); mx = Math.max(mx, m); mn = Math.min(mn, m); });
          const cls = Math.abs(area) < 1e-9 ? "Lineal" : mx - mn < 1e-9 ? "Circular" : "Elíptica"; return cls === correct; } }
      };
    }
  };
  T["f2b-pol-vf"] = {
    type: "tf", concepts: ["f2b-laminas"], difficulty: 3,
    generate(r) {
      const q = r.pick([4, 2]), al = r.pick([45, 45, 30, 22.5, 0]), claim = r.pick([0, 0.125, 0.25, 0.5]);
      const Iout = natural([pol(0), plate(al, 2 * Math.PI / q), pol(90)]);
      return {
        prompt: `Luz natural de intensidad $I_0$ atraviesa un polarizador con eje horizontal, después una lámina de ${q === 4 ? "cuarto de" : "media"} onda con su eje a $${dn(al, 1)}^\\circ$ de la horizontal y por último un polarizador con eje vertical. <b>Verdadero o falso:</b> sale una intensidad de ${claim === 0 ? "cero" : `$${H.frac(Math.round(claim * 8), 8)}\\,I_0$`}.`,
        answer: Math.abs(Iout - claim) < 1e-9,
        explanation: `Después del primero queda $\\frac{I_0}{2}$, lineal horizontal. Una [[f2b-laminas|lámina de ${q === 4 ? "cuarto de" : "media"} onda]] con el eje a $\\alpha = ${dn(al, 1)}^\\circ$ ${q === 4 ? "la vuelve elíptica (circular si $\\alpha = 45^\\circ$), y el último polarizador deja pasar la parte vertical: $\\frac{I_0}{2}\\cdot\\frac{\\sin^2 2\\alpha}{2}$" : "la rota $2\\alpha$, y el último deja pasar $\\frac{I_0}{2}\\sin^2 2\\alpha$"}. Sale $${dn(Iout, 4)}\\,I_0$.`,
        solution: [`Sin la lámina, dos polarizadores cruzados no dejan pasar nada; la lámina cambia el estado de polarización en el medio.`],
        // verificación: matrices de Jones complejas, promediando sobre las polarizaciones de la luz natural
        verify: { kind: "truth", fn: () => { let s = 0; for (let i = 0; i < 360; i++) { const a = i * Math.PI / 360; let v = [[Math.cos(a), 0], [Math.sin(a), 0]];
          v = apply(pol(0), v); v = apply(plate(al, 2 * Math.PI / q), v); v = apply(pol(90), v); s += inten(v); } return Math.abs(s / 360 - claim) < 1e-6; } }
      };
    }
  };

  const cards = {
    "f2b-polarizacion": {
      title: "Polarización y ley de Malus", aliases: ["luz polarizada", "polarizador", "polarizadores", "ley de Malus", "Malus", "luz natural", "polarización lineal", "polarización circular", "polarización elíptica"], concepts: ["f2b-polarizacion"],
      summary: "La polarización es la dirección en la que oscila E. Un polarizador ideal deja pasar la componente sobre su eje: I = I₀cos²θ (Malus). La luz natural pierde la mitad.",
      def: [R`En una [[f2b-em|onda electromagnética]] que avanza en $z$, $\vec E = (E_x, E_y)$ con $E_x = A\cos(kz - \omega t)$ y $E_y = B\cos(kz - \omega t + \varphi)$. La curva que describe la punta de $\vec E$ define la **polarización**: **lineal** si $\varphi = 0$ o $\pi$; **circular** si $A = B$ y $\varphi = \pm\frac\pi2$; **elíptica** en los demás casos.`,
        R`La **luz natural** (de una lamparita o del Sol) cambia de polarización al azar millones de veces por segundo: en promedio no tiene dirección preferida.`,
        R`Un **polarizador** ideal deja pasar solo la componente de $\vec E$ sobre su eje de transmisión. **Ley de Malus:** si incide luz lineal a un ángulo $\theta$ del eje, sale $I = I_0\cos^2\theta$. Con luz natural sale $\frac{I_0}{2}$.`],
      idea: [R`Dos polarizadores cruzados no dejan pasar nada; poner un tercero **en el medio**, inclinado, hace que pase luz. El del medio no "agrega" luz: cambia la dirección de polarización para que el último tenga algo que dejar pasar.`,
        R`Las pantallas LCD funcionan así: una capa de cristal líquido entre polarizadores cruzados rota (o no) la polarización según el voltaje.`],
      demo: [R`**Paso 1 (descomponer).** Ponemos el eje $x$ sobre el eje del polarizador. La luz lineal que llega es $\vec E = E_0(\cos\theta, \sin\theta)\cos(kz - \omega t)$.`,
        R`**Paso 2 (filtrar).** El polarizador deja pasar solo la componente sobre su eje: sale $E_0\cos\theta\cos(kz - \omega t)$, polarizada según $x$.`,
        R`**Paso 3 (intensidad).** La intensidad es proporcional al cuadrado de la amplitud: $I = I_0\cos^2\theta$.`,
        R`**Paso 4 (luz natural).** Si $\theta$ cambia al azar, la intensidad que pasa es $I_0$ por el promedio de $\cos^2\theta$ sobre todos los ángulos, que vale $\frac12$ (porque $\cos^2\theta + \sin^2\theta = 1$ y en promedio los dos pesan igual). $\blacksquare$`],
      examples: [{ q: R`Luz natural atraviesa tres polarizadores a $0^\circ$, $45^\circ$ y $90^\circ$. ¿Qué fracción sale?`, steps: [R`$\frac12\cdot\cos^2 45^\circ\cdot\cos^2 45^\circ = \frac12\cdot\frac12\cdot\frac12 = \frac18$.`] }],
      see: ["f2b-brewster", "f2b-laminas", "f2b-em"]
    },
    "f2b-brewster": {
      title: "Polarización por reflexión: ángulo de Brewster", aliases: ["ángulo de Brewster", "Brewster", "ángulo de polarización", "polarización por reflexión"], concepts: ["f2b-brewster"],
      summary: "Con incidencia a θ_B, con tan θ_B = n₂/n₁, la luz reflejada sale totalmente polarizada perpendicular al plano de incidencia, y el rayo reflejado es perpendicular al refractado.",
      def: [R`Al reflejarse, las dos componentes de la luz (en el plano de incidencia, $p$, y perpendicular, $s$) se reflejan con coeficientes distintos. Para $p$, el coeficiente de Fresnel es $$r_p = \frac{n_2\cos\theta_i - n_1\cos\theta_t}{n_2\cos\theta_i + n_1\cos\theta_t}.$$`,
        R`**Ángulo de Brewster:** $r_p = 0$ cuando $\tan\theta_B = \frac{n_2}{n_1}$. A ese ángulo, la luz reflejada está polarizada linealmente, perpendicular al plano de incidencia, y $\theta_B + \theta_t = 90^\circ$.`],
      idea: [R`Por eso los reflejos en el agua o en una ruta están parcialmente polarizados (horizontal), y un anteojo polarizado con eje vertical los corta.`,
        R`Las ventanas de Brewster de los láseres de gas están inclinadas a $\theta_B$: la componente $p$ pasa sin perder nada al reflejarse, y el láser sale polarizado.`],
      demo: [R`**Paso 1 (quién emite el reflejo).** La luz reflejada la emiten los electrones del medio 2, que oscilan siguiendo el campo $\vec E$ de la onda refractada, perpendicular al rayo refractado.`,
        R`**Paso 2 (un dipolo no emite a lo largo de su eje).** Para la componente $p$, esos electrones oscilan en el plano de incidencia. Si la dirección del rayo reflejado coincide con la de su oscilación, no emiten nada en esa dirección y no hay reflejo $p$.`,
        R`**Paso 3 (condición geométrica).** Eso pasa cuando el reflejado es perpendicular al refractado: $\theta_B + \theta_t = 90^\circ$.`,
        R`**Paso 4 (con Snell).** $n_1\sin\theta_B = n_2\sin\theta_t = n_2\sin(90^\circ - \theta_B) = n_2\cos\theta_B$, así que $\tan\theta_B = \frac{n_2}{n_1}$. $\blacksquare$`],
      examples: [{ q: R`¿Ángulo de Brewster para luz del aire sobre agua?`, steps: [R`$\theta_B = \arctan 1{,}33 \approx 53{,}1^\circ$.`] }],
      see: ["f2b-polarizacion", "f2b-optica"]
    },
    "f2b-laminas": {
      title: "Birrefringencia y láminas retardadoras", aliases: ["birrefringencia", "material birrefringente", "lámina retardadora", "láminas retardadoras", "lámina de cuarto de onda", "lámina de media onda"], concepts: ["f2b-laminas"],
      summary: "Un cristal birrefringente tiene dos índices. Una lámina de espesor d desfasa las componentes δ = 2π|nₑ − n₀|d/λ: λ/4 vuelve circular la luz lineal a 45°; λ/2 refleja la polarización respecto del eje.",
      def: [R`En un material **birrefringente** (cuarzo, calcita, plásticos estirados), la luz polarizada a lo largo del eje óptico ve un índice $n_e$, y la perpendicular, otro índice $n_o$.`,
        R`Una **lámina retardadora** de espesor $d$ introduce un desfasaje $$\delta = \frac{2\pi}{\lambda}|n_e - n_o|\,d$$ entre las dos componentes.`,
        R`**Cuarto de onda** ($\delta = \frac\pi2$): luz lineal a $45^\circ$ del eje sale **circular** (y al revés). **Media onda** ($\delta = \pi$): luz lineal a un ángulo $\alpha$ del eje sale lineal a $-\alpha$; la polarización gira $2\alpha$.`],
      idea: [R`La lámina no absorbe luz: solo atrasa una componente respecto de la otra. Por eso cambia la polarización sin cambiar la intensidad.`,
        R`Entre polarizadores cruzados, un plástico estirado se ve de colores: el desfasaje depende de $\lambda$ y de la tensión, y así se ven las tensiones internas (fotoelasticidad).`],
      demo: [R`**Paso 1 (descomponer).** Ponemos $x$ sobre el eje rápido de la lámina. La luz lineal a $45^\circ$ tiene componentes iguales: $E_x = E_y = \frac{E_0}{\sqrt2}\cos(\omega t)$ a la entrada.`,
        R`**Paso 2 (cada componente con su índice).** Al atravesar el espesor $d$, cada una acumula la fase $\frac{2\pi}{\lambda}nd$ con su propio índice. Lo único que cambia la polarización es la diferencia, $\delta = \frac{2\pi}{\lambda}|n_e - n_o|d$.`,
        R`**Paso 3 (cuarto de onda).** Con $\delta = \frac\pi2$: $E_x \propto \cos\omega t$ y $E_y \propto \cos(\omega t - \frac\pi2) = \sin\omega t$. Como $E_x^2 + E_y^2$ es constante, la punta de $\vec E$ gira en un círculo: polarización circular.`,
        R`**Paso 4 (media onda).** Con $\delta = \pi$: $E_y \to -E_y$. La componente sobre el eje queda igual y la perpendicular cambia de signo: es la reflexión respecto del eje, que lleva el ángulo $\alpha$ a $-\alpha$. $\blacksquare$`],
      examples: [{ q: R`¿Espesor mínimo de una lámina λ/4 de cuarzo ($|n_e - n_o| = 0{,}009$) para 589 nm?`, steps: [R`$d = \frac{589\ \text{nm}}{4\cdot0{,}009} \approx 16{,}4\ \mu\text{m}$.`] }],
      see: ["f2b-polarizacion", "f2b-brewster"]
    }
  };

  E.extendCourse("f102b", {
    concepts: { "f2b-polarizacion": { name: "Polarización y Malus" }, "f2b-brewster": { name: "Ángulo de Brewster" }, "f2b-laminas": { name: "Láminas retardadoras" } },
    templates: T,
    units: [{
      id: "f2b-polarizacion-u", order: 10, program: "Extra UBA", title: "Polarización", icon: "lightbulb",
      diagnostic: ["f2b-malus-num", "f2b-brewster-num", "f2b-lamina-num"],
      lessons: [
        { id: "f2b-polarizacion", title: "Estados de polarización y Malus", templates: ["f2b-polestado-mc", "f2b-malus-num"], theory: ["f2b-polarizacion"],
          intro: R`Lineal, circular o elíptica, según el desfasaje entre $E_x$ y $E_y$. Malus: $I = I_0\cos^2\theta$; la luz natural pierde la mitad.` },
        { id: "f2b-brewster-laminas", title: "Brewster y láminas", templates: ["f2b-brewster-num", "f2b-lamina-num", "f2b-pol-vf"], theory: ["f2b-brewster", "f2b-laminas"],
          intro: R`$\tan\theta_B = n_2/n_1$. Láminas: $\delta = \frac{2\pi}{\lambda}|n_e - n_o|d$; λ/4 da circular, λ/2 rota $2\alpha$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  EXTRA UBA · REFLEXIÓN ENTRE MEDIOS, FOURIER Y DISPERSIÓN
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {}, g = 9.8;
  const dn = (x, d = 3) => String(num(x, d)).replace(".", "{,}");
  const rad = d => d * Math.PI / 180, deg = x => x * 180 / Math.PI;

  // cuerda con dos densidades simulada por diferencias finitas (salto leapfrog): un pulso gaussiano llega a la unión;
  // devuelve la amplitud (con signo) del reflejado y del transmitido, y la fracción de energía transmitida
  const junction = ratio => {
    const N = 1600, J = 800, c2 = 1 / Math.sqrt(ratio), dt = 0.5 / Math.max(1, c2), sg = 25, x0 = 400;
    const mu = i => (i < J ? 1 : ratio), G = x => Math.exp(-((x - x0) ** 2) / (2 * sg * sg));
    let u = new Float64Array(N), up = new Float64Array(N);
    for (let i = 0; i < N; i++) { u[i] = G(i); up[i] = G(i + dt); }
    const steps = Math.round(650 / dt);
    for (let s = 0; s < steps; s++) { const un = new Float64Array(N);
      for (let i = 1; i < N - 1; i++) un[i] = 2 * u[i] - up[i] + dt * dt / mu(i) * (u[i + 1] - 2 * u[i] + u[i - 1]);
      up = u; u = un; }
    let ar = 0, at = 0, er = 0, et = 0;
    for (let i = 1; i < N - 1; i++) { const v = (u[i] - up[i]) / dt, e = 0.5 * mu(i) * v * v + 0.5 * (u[i + 1] - u[i]) ** 2;
      if (i < J) { if (Math.abs(u[i]) > Math.abs(ar)) ar = u[i]; er += e; } else { if (Math.abs(u[i]) > Math.abs(at)) at = u[i]; et += e; } }
    return { r: ar, t: at, P: et / (er + et) };
  };
  T["f2b-union-num"] = {
    testN: 20, // simulación cara: menos instancias en los tests
    type: "numeric", concepts: ["f2b-impedancia"], difficulty: 3,
    generate(r) {
      const [m1, m2] = r.pick([[2, 8], [8, 2], [5, 20], [20, 5], [3, 12], [10, 40], [40, 10], [4, 9], [9, 4], [10, 2], [6, 30]]), A = r.int(1, 5), ask = r.pick(["r", "t", "P"]);
      const z1 = Math.sqrt(m1), z2 = Math.sqrt(m2), rr = (z1 - z2) / (z1 + z2), tt = 2 * z1 / (z1 + z2), P = 4 * z1 * z2 / (z1 + z2) ** 2;
      const ans = { r: rr * A, t: tt * A, P: 100 * P }[ask];
      return {
        prompt: `Una cuerda de $${m1}$ g/m está atada a otra de $${m2}$ g/m, con la misma tensión. Por la primera llega a la unión un pulso de $${A}$ cm de altura. ¿${{ r: "Qué altura (cm) tiene el pulso reflejado? (negativa si vuelve invertido)", t: "Qué altura (cm) tiene el pulso transmitido?", P: "Qué porcentaje de la energía del pulso pasa a la segunda cuerda?" }[ask]}`,
        answer: ans,
        solution: [
          `La [[f2b-impedancia|impedancia]] de cada cuerda es $Z = \\sqrt{T\\mu}$; con la misma tensión, el cociente es $\\frac{Z_2}{Z_1} = \\sqrt{\\frac{${m2}}{${m1}}} \\approx ${dn(z2 / z1, 4)}$.`,
          `$r = \\frac{Z_1 - Z_2}{Z_1 + Z_2} \\approx ${dn(rr, 4)}$ y $t = \\frac{2Z_1}{Z_1 + Z_2} \\approx ${dn(tt, 4)}$. ${rr < 0 ? "El reflejado vuelve **invertido**, como en un extremo fijo." : "El reflejado vuelve derecho, como en un extremo libre."}`,
          ask === "P" ? `Fracción de energía transmitida: $\\frac{Z_2}{Z_1}t^2 = \\frac{4Z_1Z_2}{(Z_1 + Z_2)^2} \\approx ${dn(P, 4)}$, o sea $${dn(100 * P, 2)}\\,\\%$.` : `Altura: $${ask === "r" ? "r" : "t"}\\cdot${A}$ cm $\\approx ${dn(ans, 3)}$ cm.`
        ],
        // verificación: simulación de la cuerda por diferencias finitas con el pulso real
        verify: { kind: "value", tol: 4e-3, fn: () => { const s = junction(m2 / m1); return { r: s.r * A, t: s.t * A, P: 100 * s.P }[ask]; } }
      };
    }
  };
  T["f2b-fourier-num"] = {
    type: "numeric", concepts: ["f2b-fourier-cuerda"], difficulty: 3,
    generate(r) {
      const [fr, ftex] = r.pick([[1 / 2, "en el medio"], [1 / 3, "a un tercio de un extremo"], [1 / 4, "a un cuarto de un extremo"], [1 / 5, "a un quinto de un extremo"], [2 / 5, "a dos quintos de un extremo"]]);
      const L = r.int(4, 10) / 10, h = r.int(2, 10), n = r.int(1, 3), a = fr * L, s = Math.sin(n * Math.PI * fr);
      if (Math.abs(s) < 1e-9) return null;
      const bn = 2 * h * L * L / (n * n * Math.PI * Math.PI * a * (L - a)) * s;
      return {
        prompt: `Una cuerda de $${dn(L, 1)}$ m con los extremos fijos se tira desde un punto ${ftex}, hasta formar un triángulo de $${h}$ mm de altura, y se suelta desde el reposo. ¿Cuánto vale (en mm) la amplitud $b_{${n}}$ del modo ${n === 1 ? "fundamental" : `número ${n}`} en el desarrollo $y(x, 0) = \\sum b_n\\sin\\frac{n\\pi x}{L}$?`,
        answer: bn,
        solution: [
          `Cada [[f2b-fourier-cuerda|modo]] evoluciona solo, y los coeficientes salen de la [[c2-fourier|serie de Fourier]] en senos: $b_n = \\frac2L\\int_0^Ly(x, 0)\\sin\\frac{n\\pi x}{L}\\,dx$.`,
          `Para un triángulo de altura $h$ con el vértice en $x = a$: $b_n = \\frac{2hL^2}{n^2\\pi^2a(L - a)}\\sin\\frac{n\\pi a}{L}$.`,
          `Con $a = ${dn(a, 3)}$ m: $b_{${n}} \\approx ${dn(bn, 3)}$ mm. Los modos con un nodo justo en el punto donde se tiró no se excitan.`
        ],
        // verificación: la integral de Fourier del triángulo, por Simpson
        verify: { kind: "integral", f: x => (2 / L) * (x < a ? h * x / a : h * (L - x) / (L - a)) * Math.sin(n * Math.PI * x / L), a: 0, b: L }
      };
    }
  };
  const DISP = [
    { id: "profunda", txt: "olas en aguas profundas", rel: "\\omega = \\sqrt{gk}", w: k => Math.sqrt(g * k) },
    { id: "capilar", txt: "ondas capilares en agua (tensión superficial $0{,}073$ N/m)", rel: "\\omega = \\sqrt{\\frac{\\sigma k^3}{\\rho}}", w: k => Math.sqrt(0.073 * k ** 3 / 1000) },
    { id: "plasma", txt: "ondas electromagnéticas en un plasma con $\\omega_p = 5\\times10^{7}$ rad/s", rel: "\\omega^2 = \\omega_p^2 + c^2k^2", w: k => Math.sqrt(2.5e15 + 9e16 * k * k) }
  ];
  T["f2b-grupo-num"] = {
    type: "numeric", concepts: ["f2b-dispersion"], difficulty: 2,
    generate(r) {
      const D = r.pick(DISP);
      const lam = D.id === "profunda" ? r.pick([1, 2, 5, 10, 20, 50, 100]) : D.id === "capilar" ? r.pick([2, 3, 5, 8, 10]) / 1000 : r.pick([5, 10, 20, 30, 50]);
      const k = 2 * Math.PI / lam, h = 1e-6 * k, vg = (D.w(k + h) - D.w(k - h)) / (2 * h);
      const vgx = D.id === "profunda" ? 0.5 * Math.sqrt(g / k) : D.id === "capilar" ? 1.5 * D.w(k) / k : 9e16 * k / D.w(k);
      return {
        prompt: `Para ${D.txt}, la relación de dispersión es $${D.rel}$. ¿Cuál es la velocidad de grupo (m/s) de un paquete con longitud de onda $${D.id === "capilar" ? `${dn(lam * 1000, 1)}$ mm` : `${lam}$ m`}${D.id === "plasma" ? " (respondé en unidades de $10^8$ m/s)" : ""}?`,
        answer: D.id === "plasma" ? vgx / 1e8 : vgx,
        solution: [
          `La [[f2b-dispersion|velocidad de grupo]] es $v_g = \\frac{d\\omega}{dk}$, y la de fase, $v_f = \\frac\\omega k$. Con $k = \\frac{2\\pi}{\\lambda} \\approx ${dn(k, 4)}$ m⁻¹:`,
          D.id === "profunda" ? `$v_g = \\frac12\\sqrt{\\frac gk} = \\frac{v_f}{2} \\approx ${dn(vgx, 4)}$ m/s: las crestas avanzan más rápido que el grupo, nacen atrás y mueren adelante.`
            : D.id === "capilar" ? `$v_g = \\frac32\\sqrt{\\frac{\\sigma k}{\\rho}} = \\frac32v_f \\approx ${dn(vgx, 4)}$ m/s: acá el grupo va más rápido que las crestas.`
            : `$v_g = \\frac{c^2k}{\\omega} \\approx ${dn(vgx / 1e8, 4)}\\times10^8$ m/s, menor que $c$ (y $v_fv_g = c^2$, así que la de fase supera a $c$ sin llevar información).`
        ],
        // verificación: derivada numérica de la relación de dispersión
        verify: { kind: "deriv", f: kk => D.w(kk) / (D.id === "plasma" ? 1e8 : 1), x0: k }
      };
    }
  };
  // desviación de un prisma de ángulo A trazando el rayo con Snell; mínimo por sección áurea
  const dev = (n, A, th) => { const t1 = Math.asin(Math.sin(th) / n), t2 = A - t1, s = n * Math.sin(t2); return Math.abs(s) >= 1 ? NaN : th + Math.asin(s) - A; };
  const minDev = (n, A) => { let a = 0.01, b = Math.PI / 2 - 0.001; const gr = (Math.sqrt(5) - 1) / 2; const f = x => { const d = dev(n, A, x); return isNaN(d) ? 99 : d; };
    for (let i = 0; i < 200; i++) { const c = b - gr * (b - a), d = a + gr * (b - a); if (f(c) < f(d)) b = d; else a = c; } return f((a + b) / 2); };
  T["f2b-prisma-num"] = {
    type: "numeric", concepts: ["f2b-dispersion"], difficulty: 2,
    generate(r) {
      const A = r.pick([30, 40, 45, 50, 60]), ask = r.pick(["dmin", "n", "disp"]);
      if (ask === "dmin") {
        const n = r.pick([1.45, 1.5, 1.52, 1.6, 1.65, 1.7]), d = 2 * deg(Math.asin(n * Math.sin(rad(A / 2)))) - A;
        return { prompt: `¿Cuál es la desviación mínima (en grados) de un prisma de ángulo $${A}^\\circ$ e índice $${dn(n, 2)}$ en aire?`, answer: d,
          solution: [`En la [[f2b-dispersion|desviación mínima]] el rayo atraviesa el prisma simétricamente: adentro forma $\\frac A2$ con cada cara.`, `$n = \\frac{\\sin\\frac{A + \\delta}{2}}{\\sin\\frac A2} \\Rightarrow \\delta = 2\\arcsin\\left(n\\sin\\frac A2\\right) - A \\approx ${dn(d, 2)}^\\circ$.`],
          verify: { kind: "value", tol: 1e-6, fn: () => deg(minDev(n, rad(A))) } };
      }
      if (ask === "n") {
        const d = r.pick([20, 25, 30, 35, 40]), n = Math.sin(rad((A + d) / 2)) / Math.sin(rad(A / 2));
        if (n > 1.9 || n < 1.2) return null;
        return { prompt: `Un prisma de $${A}^\\circ$ tiene, para cierta luz, una desviación mínima de $${d}^\\circ$. ¿Cuál es su índice de refracción?`, answer: n,
          solution: [`Con la fórmula de la [[f2b-dispersion|desviación mínima]]: $n = \\frac{\\sin\\frac{A + \\delta}{2}}{\\sin\\frac A2} = \\frac{\\sin ${dn((A + d) / 2, 1)}^\\circ}{\\sin ${dn(A / 2, 1)}^\\circ} \\approx ${dn(n, 4)}$.`, `Es la forma clásica de medir índices: se busca a mano el ángulo donde la desviación deja de bajar.`],
          verify: { kind: "zero", fn: x => [deg(minDev(x, rad(A))) - d], tol: 1e-6, scale: d } };
      }
      const nr = r.pick([1.51, 1.52, 1.61]), nv = nr + r.pick([0.01, 0.02, 0.03]), dr = 2 * deg(Math.asin(nr * Math.sin(rad(A / 2)))) - A, dv = 2 * deg(Math.asin(nv * Math.sin(rad(A / 2)))) - A;
      return { prompt: `Un prisma de $${A}^\\circ$ tiene índice $${dn(nr, 2)}$ para el rojo y $${dn(nv, 2)}$ para el violeta. Trabajando cerca de la desviación mínima, ¿cuántos grados separan los dos colores a la salida?`, answer: dv - dr,
        solution: [`La [[f2b-dispersion|dispersión de la luz]]: el índice depende de $\\lambda$, así que cada color tiene su desviación mínima, $\\delta = 2\\arcsin(n\\sin\\frac A2) - A$.`, `$\\delta_v - \\delta_r \\approx ${dn(dv, 3)}^\\circ - ${dn(dr, 3)}^\\circ = ${dn(dv - dr, 3)}^\\circ$. Así se separa la luz blanca en el arco iris.`],
        verify: { kind: "value", tol: 1e-5, fn: () => deg(minDev(nv, rad(A)) - minDev(nr, rad(A))) } };
    }
  };
  T["f2b-dispersion-vf"] = {
    type: "tf", concepts: ["f2b-dispersion"], difficulty: 2,
    generate(r) {
      const D = r.pick(DISP.concat([{ id: "vacio", txt: "la luz en el vacío", rel: "\\omega = ck", w: k => 3e8 * k }])), q = r.pick(["mayor", "menor", "igual"]);
      const truth = D.id === "vacio" ? q === "igual" : D.id === "capilar" ? q === "mayor" : q === "menor";
      return {
        prompt: `Para ${D.txt} ($${D.rel}$). <b>Verdadero o falso:</b> la velocidad de grupo es ${q === "igual" ? "igual a" : `${q} que`} la velocidad de fase.`,
        answer: truth,
        explanation: `Con $v_g = \\frac{d\\omega}{dk}$ y $v_f = \\frac\\omega k$ ([[f2b-dispersion]]): ${D.id === "profunda" ? "$v_g = \\frac{v_f}{2}$" : D.id === "capilar" ? "$v_g = \\frac32v_f$" : D.id === "vacio" ? "el medio no es dispersivo y $v_g = v_f = c$" : "$v_g = \\frac{c^2}{v_f} < c < v_f$"}.${D.id === "vacio" ? "" : " El medio es dispersivo: un paquete se deforma al avanzar."}`,
        solution: [`Si $\\omega$ es proporcional a $k$, las dos velocidades coinciden; si no, el medio es dispersivo.`],
        // verificación: se comparan la derivada numérica de ω(k) y ω/k en una longitud de onda típica
        verify: { kind: "truth", fn: () => { const k = D.id === "capilar" ? 1000 : D.id === "profunda" ? 1 : 0.5, h = 1e-6 * k, g2 = (D.w(k + h) - D.w(k - h)) / (2 * h), f2 = D.w(k) / k, rel = g2 / f2;
          return q === "igual" ? Math.abs(rel - 1) < 1e-6 : q === "mayor" ? rel > 1 + 1e-6 : rel < 1 - 1e-6; } }
      };
    }
  };

  const cards = {
    "f2b-impedancia": {
      title: "Reflexión y transmisión entre dos medios: impedancia", aliases: ["impedancia de una cuerda", "impedancia mecánica", "coeficiente de reflexión", "coeficiente de transmisión", "unión de dos cuerdas"], concepts: ["f2b-impedancia"],
      summary: "En la unión de dos cuerdas, r = (Z₁ − Z₂)/(Z₁ + Z₂) y t = 2Z₁/(Z₁ + Z₂), con Z = √(Tμ). Si Z₂ > Z₁ el reflejado se invierte.",
      def: [R`La **impedancia** de una cuerda es $Z = \sqrt{T\mu} = \frac Tv = \mu v$: mide cuánta fuerza hace falta para moverla transversalmente con cierta velocidad.`,
        R`Cuando una onda que viaja por un medio de impedancia $Z_1$ llega a otro de impedancia $Z_2$, se parte en una reflejada y una transmitida, con amplitudes $$r = \frac{Z_1 - Z_2}{Z_1 + Z_2}, \qquad t = \frac{2Z_1}{Z_1 + Z_2}.$$`,
        R`La energía se conserva: la fracción reflejada es $r^2$ y la transmitida, $\frac{Z_2}{Z_1}t^2 = \frac{4Z_1Z_2}{(Z_1 + Z_2)^2}$.`],
      idea: [R`Los casos extremos son conocidos: $Z_2 \to \infty$ es un extremo fijo ($r = -1$, el pulso vuelve invertido); $Z_2 \to 0$ es un extremo libre ($r = 1$). Si $Z_1 = Z_2$ no hay reflejo: por eso se "adaptan impedancias" en cables, parlantes y en el gel de las ecografías.`],
      demo: [R`**Paso 1 (las tres ondas).** Con la unión en $x = 0$: incidente $f(x - v_1t)$ y reflejada $g(x + v_1t)$ a la izquierda, transmitida $h(x - v_2t)$ a la derecha.`,
        R`**Paso 2 (la cuerda no se corta).** En $x = 0$ el desplazamiento es el mismo de los dos lados: $f + g = h$.`,
        R`**Paso 3 (el nudo no tiene masa).** Las fuerzas transversales sobre el punto de unión se equilibran: $T\frac{\partial y_1}{\partial x} = T\frac{\partial y_2}{\partial x}$ en $x = 0$.`,
        R`**Paso 4 (pasar a derivadas temporales).** Para una onda hacia la derecha $\frac{\partial y}{\partial x} = -\frac1v\frac{\partial y}{\partial t}$, y hacia la izquierda $+\frac1v\frac{\partial y}{\partial t}$. Integrando en el tiempo, el paso 3 queda $\frac{f - g}{v_1} = \frac{h}{v_2}$, o sea $Z_1(f - g) = Z_2h$ (con $Z = T/v$).`,
        R`**Paso 5 (resolver).** De $f + g = h$ y $Z_1(f - g) = Z_2h$: $g = \frac{Z_1 - Z_2}{Z_1 + Z_2}f$ y $h = \frac{2Z_1}{Z_1 + Z_2}f$. $\blacksquare$`],
      examples: [{ q: R`Una cuerda de 4 g/m unida a una de 16 g/m (misma tensión). ¿Coeficientes?`, steps: [R`$\frac{Z_2}{Z_1} = 2$: $r = \frac{1 - 2}{3} = -\frac13$ y $t = \frac23$.`, R`Se refleja $\frac19$ de la energía y pasa $\frac89$.`] }],
      see: ["f2b-ondas", "f2b-fourier-cuerda"]
    },
    "f2b-fourier-cuerda": {
      title: "Superposición de modos en una cuerda", aliases: ["cuerda pulsada", "superposición de modos", "desarrollo en modos normales"], concepts: ["f2b-fourier-cuerda"],
      summary: "Cualquier movimiento de una cuerda fija en los extremos es una suma de modos: y = Σ bₙ sen(nπx/L) cos(ωₙt), con bₙ = (2/L)∫ y(x, 0) sen(nπx/L) dx.",
      def: [R`Cada [[f2b-ondas|onda estacionaria]] $\sin\frac{n\pi x}{L}\cos\omega_nt$, con $\omega_n = \frac{n\pi v}{L}$, cumple la ecuación de ondas y las condiciones de borde. Como la ecuación es lineal, la suma también la cumple: $$y(x, t) = \sum_{n=1}^{\infty}b_n\sin\frac{n\pi x}{L}\cos\omega_nt$$ (si se suelta desde el reposo).`,
        R`Los coeficientes salen de la forma inicial, con la [[c2-fourier|serie de Fourier]] en senos: $b_n = \frac2L\int_0^Ly(x, 0)\sin\frac{n\pi x}{L}\,dx$.`,
        R`**Cuerda pulsada** en $x = a$ con altura $h$: $b_n = \frac{2hL^2}{n^2\pi^2a(L - a)}\sin\frac{n\pi a}{L}$. Los armónicos decaen como $\frac{1}{n^2}$, y los que tienen un nodo en $a$ no aparecen.`],
      idea: [R`El timbre de un instrumento es la mezcla de armónicos: pulsar una guitarra cerca del puente excita más armónicos altos (sonido brillante) que pulsarla en el medio (sonido redondo, sin armónicos pares).`],
      demo: [R`**Paso 1 (cada modo funciona).** $y_n = \sin\frac{n\pi x}{L}\cos\omega_nt$ se anula en $x = 0$ y $x = L$, y cumple $y_{tt} = v^2y_{xx}$ si $\omega_n = \frac{n\pi v}{L}$.`,
        R`**Paso 2 (superponer).** La ecuación es lineal, así que $\sum b_ny_n$ también es solución. En $t = 0$ vale $\sum b_n\sin\frac{n\pi x}{L}$, y su velocidad es cero.`,
        R`**Paso 3 (ortogonalidad).** $\int_0^L\sin\frac{n\pi x}{L}\sin\frac{m\pi x}{L}\,dx$ vale $\frac L2$ si $n = m$ y $0$ si no. Multiplicando la condición inicial por $\sin\frac{m\pi x}{L}$ e integrando, solo sobrevive $b_m\frac L2$: $b_m = \frac2L\int_0^Ly(x, 0)\sin\frac{m\pi x}{L}\,dx$.`,
        R`**Paso 4 (el triángulo).** Integrando por partes en $[0, a]$ y en $[a, L]$ (en cada tramo $y$ es lineal), los términos de borde se cancelan y queda $b_n = \frac{2hL^2}{n^2\pi^2a(L - a)}\sin\frac{n\pi a}{L}$. $\blacksquare$`],
      examples: [{ q: R`Cuerda pulsada en el medio con $h = 5$ mm. ¿$b_1$ y $b_2$?`, steps: [R`$b_1 = \frac{2\cdot5\cdot L^2}{\pi^2\cdot L^2/4} = \frac{40}{\pi^2} \approx 4{,}05$ mm.`, R`$b_2 = 0$: el medio es un nodo del segundo armónico.`] }],
      see: ["f2b-ondas", "c2-fourier", "f2b-impedancia"]
    },
    "f2b-dispersion": {
      title: "Dispersión: velocidad de fase y de grupo, prismas", aliases: ["velocidad de grupo", "velocidad de fase", "medio dispersivo", "medios dispersivos", "paquete de ondas", "desviación mínima", "dispersión de la luz"], concepts: ["f2b-dispersion"],
      summary: "Si ω no es proporcional a k, cada longitud de onda viaja a su velocidad: las crestas van a v_f = ω/k y la envolvente a v_g = dω/dk. En un prisma, la desviación mínima da n = sen((A+δ)/2)/sen(A/2).",
      def: [R`La **relación de dispersión** $\omega(k)$ dice con qué frecuencia oscila cada longitud de onda. Las crestas avanzan a la **velocidad de fase** $v_f = \frac\omega k$; un paquete (grupo de ondas), a la **velocidad de grupo** $v_g = \frac{d\omega}{dk}$.`,
        R`El medio es **dispersivo** si $v_f$ depende de $k$; ahí $v_g \ne v_f$ y los paquetes se deforman. Ejemplos: olas en aguas profundas ($\omega = \sqrt{gk}$, $v_g = \frac{v_f}{2}$), ondas capilares ($v_g = \frac32v_f$), la luz en el vidrio ($n$ depende de $\lambda$).`,
        R`**Prisma:** la desviación de un rayo depende del ángulo de incidencia y tiene un mínimo cuando lo atraviesa simétricamente: $$n = \frac{\sin\frac{A + \delta_{min}}{2}}{\sin\frac A2}.$$ Como $n$ depende del color, cada color sale con otro ángulo (**dispersión de la luz**).`],
      idea: [R`Tirá una piedra al agua: el anillo de olas avanza más lento que las crestas, que aparecen atrás del grupo, lo cruzan y desaparecen adelante. Es $v_g = \frac{v_f}{2}$ a la vista.`,
        R`La energía y la información viajan con el grupo. En un plasma la velocidad de fase supera a $c$, pero la de grupo no: no hay contradicción con la [[f1-relatividad|relatividad especial]].`],
      demo: [R`**Paso 1 (dos ondas).** Sumamos dos ondas de igual amplitud y números de onda cercanos: $\cos(k_1x - \omega_1t) + \cos(k_2x - \omega_2t) = 2\cos\left(\frac{\Delta k}{2}x - \frac{\Delta\omega}{2}t\right)\cos(\bar kx - \bar\omega t)$, por la suma de cosenos.`,
        R`**Paso 2 (la envolvente).** El primer factor es una envolvente lenta que avanza a $\frac{\Delta\omega}{\Delta k}$; el segundo, las crestas, a $\frac{\bar\omega}{\bar k}$. En el límite $\Delta k \to 0$, la envolvente va a $v_g = \frac{d\omega}{dk}$.`,
        R`**Paso 3 (prisma, simetría).** Si se invierte el rayo, la desviación es la misma. Entonces, si el mínimo fuera único y asimétrico, habría dos ángulos con la misma desviación mínima; por eso en el mínimo el recorrido es simétrico y el rayo forma adentro el mismo ángulo con las dos caras.`,
        R`**Paso 4 (prisma, geometría).** Los dos ángulos internos suman $A$, así que cada uno vale $\frac A2$. La desviación es $\delta = 2\theta_i - A$, de donde $\theta_i = \frac{A + \delta}{2}$, y con Snell, $\sin\frac{A + \delta}{2} = n\sin\frac A2$. $\blacksquare$`],
      examples: [{ q: R`Olas de 10 m de longitud de onda en alta mar. ¿$v_f$ y $v_g$?`, steps: [R`$k = 0{,}628$ m⁻¹, $v_f = \sqrt{g/k} \approx 3{,}95$ m/s y $v_g = \frac{v_f}{2} \approx 1{,}98$ m/s.`] }],
      see: ["f2b-ondas", "f2b-optica", "f2b-cadena"]
    }
  };

  E.extendCourse("f102b", {
    concepts: { "f2b-impedancia": { name: "Reflexión entre medios" }, "f2b-fourier-cuerda": { name: "Superposición de modos" }, "f2b-dispersion": { name: "Dispersión y grupo" } },
    templates: T,
    units: [{
      id: "f2b-ondas-extra-u", order: 11, program: "Extra UBA", title: "Reflexión entre medios, Fourier y dispersión", icon: "volume-2",
      diagnostic: ["f2b-fourier-num", "f2b-grupo-num", "f2b-prisma-num"],
      lessons: [
        { id: "f2b-impedancia", title: "Impedancia y modos de una cuerda", templates: ["f2b-union-num", "f2b-fourier-num"], theory: ["f2b-impedancia", "f2b-fourier-cuerda"],
          intro: R`$r = \frac{Z_1 - Z_2}{Z_1 + Z_2}$, $t = \frac{2Z_1}{Z_1 + Z_2}$ con $Z = \sqrt{T\mu}$. Modos: $b_n = \frac2L\int_0^Ly_0\sin\frac{n\pi x}{L}dx$.` },
        { id: "f2b-dispersion", title: "Dispersión y prismas", templates: ["f2b-grupo-num", "f2b-dispersion-vf", "f2b-prisma-num"], theory: ["f2b-dispersion"],
          intro: R`$v_f = \omega/k$, $v_g = d\omega/dk$. Prisma: $n = \frac{\sin\frac{A + \delta_{min}}{2}}{\sin\frac A2}$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  EXTRA UBA · INSTRUMENTOS ÓPTICOS Y COHERENCIA
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const { num } = H;
  const T = {};
  const dn = (x, d = 3) => String(num(x, d)).replace(".", "{,}");
  // matrices ABCD, como en la unidad 6 (otra copia: cada bloque es independiente)
  const mul = (P, Q) => [[P[0][0] * Q[0][0] + P[0][1] * Q[1][0], P[0][0] * Q[0][1] + P[0][1] * Q[1][1]], [P[1][0] * Q[0][0] + P[1][1] * Q[1][0], P[1][0] * Q[0][1] + P[1][1] * Q[1][1]]];
  const S = d => [[1, d], [0, 1]], L = f => [[1, 0], [-1 / f, 1]];
  const ray = (M, y, th) => [M[0][0] * y + M[0][1] * th, M[1][0] * y + M[1][1] * th];
  // visibilidad de las franjas de un Michelson con un espectro plano en λ (400 componentes) para una diferencia de caminos x;
  // la longitud de coherencia es el primer mínimo de la visibilidad, buscado barriendo x y afinando por sección áurea
  const vis = (lam, dlam, x) => { let c = 0, s = 0; const n = 400; for (let i = 0; i < n; i++) { const l = lam - dlam / 2 + dlam * (i + 0.5) / n, k = 2 * Math.PI / l; c += Math.cos(k * x); s += Math.sin(k * x); } return Math.hypot(c, s) / n; };
  const lcSim = (lam, dlam) => {
    const h = lam * lam / dlam / 300;
    let x = h, prev = vis(lam, dlam, 0), cur = vis(lam, dlam, h);
    while (true) { const nx = vis(lam, dlam, x + h); if (nx > cur && cur < prev) break; prev = cur; cur = nx; x += h; }
    let a = x - h, b = x + h; const phi = (Math.sqrt(5) - 1) / 2;
    for (let i = 0; i < 60; i++) { const c1 = b - phi * (b - a), c2 = a + phi * (b - a); if (vis(lam, dlam, c1) < vis(lam, dlam, c2)) b = c2; else a = c1; }
    return (a + b) / 2;
  };
  const FUENTES = [
    { n: "un LED rojo", lam: 640, dl: [15, 20, 25, 30] }, { n: "un LED verde", lam: 525, dl: [25, 30, 35] },
    { n: "luz blanca filtrada", lam: 550, dl: [5, 10, 20] }, { n: "una lámpara de sodio", lam: 589, dl: [0.5, 0.6, 1, 2] },
    { n: "un láser de diodo barato", lam: 650, dl: [0.1, 0.2, 0.5] }
  ];

  T["f2b-lupa-num"] = {
    type: "numeric", concepts: ["f2b-instrumentos"], difficulty: 2,
    generate(r) {
      const f = r.int(3, 15), modo = r.pick(["inf", "cerca"]), y = 0.2;
      const M = modo === "inf" ? 25 / f : 1 + 25 / f, d0 = modo === "inf" ? f : 25 * f / (25 + f);
      return {
        prompt: `Una lupa de distancia focal $${f}$ cm se usa pegada al ojo, ${modo === "inf" ? "con el objeto en el foco (la imagen queda en el infinito y el ojo mira relajado)" : "con la imagen formada en el punto próximo, a 25 cm"}. ¿Cuál es su aumento angular?`,
        answer: M,
        solution: [`El [[f2b-instrumentos|aumento angular]] compara el ángulo con que se ve la imagen con el que se vería el objeto a 25 cm a simple vista: $\\theta_0 = \\frac{y}{25}$.`,
          modo === "inf" ? `Con el objeto en el foco, $\\theta = \\frac yf$: $M = \\frac{25}{f} = \\frac{25}{${f}} \\approx ${dn(M, 3)}$.`
            : `Con la imagen a $-25$ cm, la [[f2b-lentes|ecuación de la lente]] da $d_o = \\frac{25f}{25 + f} = ${dn(d0, 3)}$ cm, y $\\theta = \\frac{y}{d_o}$: $M = \\frac{25}{d_o} = 1 + \\frac{25}{f} \\approx ${dn(M, 3)}$.`],
        // verificación: dos rayos desde la punta del objeto atraviesan la lente; se intersecan sus prolongaciones
        // (o, con la imagen en el infinito, se mide el ángulo de salida común) y se compara con y/25
        verify: { kind: "value", fn: () => {
          const M1 = mul(L(f), S(d0)), [y1, t1] = ray(M1, y, 0.01), [y2, t2] = ray(M1, y, -0.02);
          if (modo === "inf") return Math.abs(t1) / (y / 25);
          const z = -(y1 - y2) / (t1 - t2), Y = y1 + t1 * z;
          return Math.abs(z - (-25)) < 1e-6 ? (Y / Math.abs(z)) / (y / 25) : NaN;
        }, tol: 1e-6 }
      };
    }
  };
  T["f2b-microscopio-num"] = {
    type: "numeric", concepts: ["f2b-instrumentos"], difficulty: 3,
    generate(r) {
      const f1 = r.int(3, 10) / 10, f2 = r.int(15, 50) / 10, d = r.int(14, 22), ask = r.pick(["M", "do"]);
      const di = d - f2, d0 = 1 / (1 / f1 - 1 / di), M = (di / d0) * (25 / f2);
      return {
        prompt: `Un microscopio tiene un objetivo de $${dn(f1, 1)}$ cm de focal y un ocular de $${dn(f2, 1)}$ cm, separados $${d}$ cm. Se enfoca para que la imagen final quede en el infinito. ${ask === "M" ? "¿Cuál es el módulo de su aumento total?" : "¿A qué distancia (mm) del objetivo está el objeto?"}`,
        answer: ask === "M" ? M : d0 * 10,
        solution: [`Imagen final en el infinito: la imagen del objetivo tiene que caer en el foco del ocular, a $d - f_2 = ${dn(di, 1)}$ cm del objetivo ([[f2b-instrumentos|microscopio]]).`,
          `[[f2b-lentes|Ecuación de la lente]] para el objetivo: $d_o = \\left(\\frac1{${dn(f1, 1)}} - \\frac1{${dn(di, 1)}}\\right)^{-1} \\approx ${dn(d0, 4)}$ cm $= ${dn(d0 * 10, 4)}$ mm, apenas más que la focal.`,
          ...(ask === "M" ? [`Aumento del objetivo: $|m_1| = \\frac{${dn(di, 1)}}{${dn(d0, 4)}} \\approx ${dn(di / d0, 3)}$. El ocular trabaja como lupa: $\\frac{25}{${dn(f2, 1)}} = ${dn(25 / f2, 3)}$. Total: $|M| \\approx ${dn(M, 3)}$.`] : [])],
        // verificación: matriz ABCD de todo el microscopio; con la imagen en el infinito el elemento D es 0
        // y el ángulo de salida de la punta del objeto es C·y, que se compara con y/25
        verify: ask === "M"
          ? { kind: "value", fn: () => { const Mx = mul(L(f2), mul(S(d), mul(L(f1), S(d0)))); return Math.abs(Mx[1][1]) < 1e-9 ? Math.abs(Mx[1][0]) * 25 : NaN; }, tol: 1e-6 }
          : { kind: "zero", fn: a => { const Mx = mul(L(f2), mul(S(d), mul(L(f1), S(a / 10)))); return [Mx[1][1]]; }, tol: 1e-4 }
      };
    }
  };
  T["f2b-telescopio-num"] = {
    type: "numeric", concepts: ["f2b-instrumentos"], difficulty: 2,
    generate(r) {
      const f1 = r.int(4, 30) * 5, f2 = r.pick([0.6, 0.9, 1, 1.25, 1.8, 2, 2.5, 4]), ask = r.pick(["M", "L", "luna"]);
      const M = f1 / f2, moon = 0.52;
      const ans = ask === "M" ? M : ask === "L" ? f1 + f2 : moon * M;
      return {
        prompt: `Un telescopio astronómico tiene un objetivo de $${f1}$ cm de focal y un ocular de $${dn(f2, 2)}$ cm, ajustado para mirar relajado (imagen en el infinito). ${ask === "M" ? "¿Cuál es el módulo de su aumento angular?" : ask === "L" ? "¿Qué distancia (cm) separa las dos lentes?" : "La Luna se ve a simple vista con un diámetro angular de $0{,}52^\\circ$. ¿Con qué diámetro angular (en grados) se la ve por el telescopio?"}`,
        answer: ans,
        solution: [`El objetivo forma la imagen de un objeto lejano en su foco; para que el ocular la mande al infinito, ese punto tiene que ser también el foco del ocular: las lentes están a $f_1 + f_2 = ${dn(f1 + f2, 2)}$ cm ([[f2b-instrumentos|telescopio]]).`,
          `Un rayo que entra con ángulo $\\alpha$ por el centro del objetivo llega a la imagen a altura $f_1\\alpha$, y el ocular lo manda con ángulo $\\frac{f_1\\alpha}{f_2}$: $|M| = \\frac{f_1}{f_2} \\approx ${dn(M, 4)}$ (la imagen está invertida).`,
          ...(ask === "luna" ? [`$0{,}52^\\circ\\cdot${dn(M, 4)} \\approx ${dn(ans, 4)}^\\circ$ (en la aproximación de ángulos chicos).`] : [])],
        // verificación: matriz ABCD objetivo–tramo–ocular. La separación se busca anulando C (sistema afocal);
        // el aumento es |D| = ángulo de salida / ángulo de entrada
        verify: ask === "L"
          ? { kind: "zero", fn: a => [mul(L(f2), mul(S(a), L(f1)))[1][0] * f1], tol: 1e-6 }
          : { kind: "value", fn: () => Math.abs(mul(L(f2), mul(S(f1 + f2), L(f1)))[1][1]) * (ask === "luna" ? moon : 1), tol: 1e-6 }
      };
    }
  };
  T["f2b-coherencia-num"] = {
    testN: 80, // la simulación de la visibilidad es algo cara
    type: "numeric", concepts: ["f2b-coherencia"], difficulty: 2,
    generate(r) {
      const F = r.pick(FUENTES), dl = r.pick(F.dl), lc = F.lam * F.lam / dl, ask = r.pick(["lc", "espejo", "franjas"]);
      const u = lc >= 1e6 ? 1e6 : 1e3, un = u === 1e6 ? "mm" : "μm";
      const ans = ask === "lc" ? lc / u : ask === "espejo" ? lc / 2 / u : lc / F.lam;
      return {
        prompt: `La luz de ${F.n} tiene un espectro aproximadamente plano de $${dn(dl, 2)}$ nm de ancho alrededor de $${F.lam}$ nm. ${ask === "lc" ? `¿Cuál es su longitud de coherencia (en ${un})?` : ask === "espejo" ? `En un interferómetro de Michelson, partiendo de brazos iguales, ¿cuánto (en ${un}) hay que mover un espejo para que las franjas desaparezcan por primera vez?` : "En un interferómetro de Michelson, partiendo de brazos iguales, ¿cuántas franjas pasan hasta que el contraste desaparece por primera vez?"}`,
        answer: ans,
        solution: [`[[f2b-coherencia|Longitud de coherencia]]: $\\ell_c \\approx \\frac{\\lambda^2}{\\Delta\\lambda} = \\frac{${F.lam}^2}{${dn(dl, 2)}}$ nm $\\approx ${dn(lc / u, 4)}$ ${un}.`,
          ...(ask === "espejo" ? [`Mover el espejo una distancia $s$ cambia el camino en $2s$ (ida y vuelta): $s = \\frac{\\ell_c}{2} \\approx ${dn(ans, 4)}$ ${un}.`] : []),
          ...(ask === "franjas" ? [`Cada franja es una longitud de onda más de camino: $N = \\frac{\\ell_c}{\\lambda} = \\frac{\\lambda}{\\Delta\\lambda} \\approx ${dn(ans, 4)}$.`] : [])],
        // verificación: se suman 400 longitudes de onda del espectro con su fase y se busca el primer cero del contraste
        verify: { kind: "value", fn: () => { const x = lcSim(F.lam, dl); return ask === "lc" ? x / u : ask === "espejo" ? x / 2 / u : x / F.lam; }, tol: 3e-3 }
      };
    }
  };
  T["f2b-coherencia-vf"] = {
    testN: 50, // la simulación de la visibilidad es algo cara
    type: "tf", concepts: ["f2b-coherencia"], difficulty: 2,
    generate(r) {
      const kind = r.pick(["pelicula", "michelson"]), fac = r.pick([0.2, 0.3, 0.5, 2, 3, 6]);
      if (kind === "pelicula") {
        const lam = 550, dl = 300, lc = lam * lam / dl, n = 1.33, d = Math.round(fac * lc / (2 * n));
        return {
          prompt: `Una película de agua jabonosa ($n = 1{,}33$) de $${d}$ nm de espesor se ilumina con luz blanca (de 400 a 700 nm). <b>Verdadero o falso:</b> se ven colores por interferencia en la luz reflejada.`,
          answer: 2 * n * d < lc,
          explanation: `Las dos reflexiones interfieren solo si la diferencia de caminos, $2nd \\approx ${Math.round(2 * n * d)}$ nm, es menor que la [[f2b-coherencia|longitud de coherencia]] de la luz blanca, $\\frac{\\lambda^2}{\\Delta\\lambda} \\approx \\frac{550^2}{300} \\approx ${Math.round(lc)}$ nm. ${2 * n * d < lc ? "Acá lo es: se ven colores." : "Acá no: los colores se mezclan y la película se ve blanca (por eso un vidrio de ventana no muestra colores)."}`,
          solution: [`Cada color tiene su patrón de [[f2b-interferencia|interferencia]]; cuando el camino extra abarca muchas longitudes de onda, los máximos de unos caen sobre los mínimos de otros.`],
          // verificación: el primer cero del contraste se busca sumando el espectro, sin la fórmula λ²/Δλ
          verify: { kind: "truth", fn: () => 2 * n * d < lcSim(lam, dl) }
        };
      }
      const F = r.pick(FUENTES), dl = r.pick(F.dl), lc = F.lam * F.lam / dl, s = fac * lc / 2, u = lc >= 1e6 ? 1e6 : 1e3, un = u === 1e6 ? "mm" : "μm";
      return {
        prompt: `En un interferómetro de Michelson iluminado con ${F.n} ($${F.lam}$ nm, ancho espectral de $${dn(dl, 2)}$ nm), se parte de brazos iguales y se aleja un espejo $${dn(s / u, 3)}$ ${un}. <b>Verdadero o falso:</b> en todo ese recorrido las franjas siguen viéndose nítidas.`,
        answer: 2 * s < lc,
        explanation: `La diferencia de caminos llega a $2s \\approx ${dn(2 * s / u, 3)}$ ${un}, y la [[f2b-coherencia|longitud de coherencia]] es $\\frac{\\lambda^2}{\\Delta\\lambda} \\approx ${dn(lc / u, 3)}$ ${un}. ${2 * s < lc ? "Como es menor, las franjas se mantienen (pierden algo de contraste, pero no desaparecen)." : "Como la supera, en algún momento el contraste se anula."}`,
        solution: [`Cada longitud de onda del espectro da su propio sistema de franjas; con mucha diferencia de caminos se desfasan entre sí y se borran.`],
        // verificación: se busca el primer cero del contraste sumando el espectro
        verify: { kind: "truth", fn: () => 2 * s < lcSim(F.lam, dl) }
      };
    }
  };

  const cards = {
    "f2b-instrumentos": {
      title: "Instrumentos ópticos: lupa, microscopio y telescopio", aliases: ["instrumentos ópticos", "lupa", "microscopio", "telescopio", "aumento angular", "punto próximo", "ocular", "objetivo del telescopio"], concepts: ["f2b-instrumentos"],
      summary: "Aumento angular M = θ/θ₀ con θ₀ = y/25 cm. Lupa: 25/f (o 1 + 25/f). Microscopio: m_obj · 25/f_oc. Telescopio: f_obj/f_oc, con las lentes a f_obj + f_oc.",
      def: [R`El ojo ve más grande lo que subtiende más **ángulo**. El **aumento angular** es $M = \frac{\theta}{\theta_0}$, donde $\theta_0 = \frac{y}{25\ \text{cm}}$ es el ángulo del objeto a simple vista en el **punto próximo** (lo más cerca que el ojo enfoca).`,
        R`**Lupa** ([[f2b-lentes|lente convergente]] pegada al ojo): $M = \frac{25}{f}$ con la imagen en el infinito, y $M = 1 + \frac{25}{f}$ con la imagen en el punto próximo.`,
        R`**Microscopio:** el objetivo forma una imagen real aumentada $m_1 = -\frac{d_i}{d_o}$, y el ocular la mira como lupa: $M = m_1\cdot\frac{25}{f_{oc}}$.`,
        R`**Telescopio (Kepler):** objetivo y ocular con los focos coincidentes, separados $f_{ob} + f_{oc}$; $M = -\frac{f_{ob}}{f_{oc}}$.`],
      idea: [R`La lupa no "agranda" el objeto: deja acercarlo al ojo más que el punto próximo sin perder el foco. El microscopio hace eso dos veces: primero una imagen real ampliada, después una lupa sobre ella.`,
        R`El telescopio no puede acercar la Luna: lo que hace es **agrandar ángulos**. Un haz paralelo que entra inclinado $\alpha$ sale paralelo, inclinado $\frac{f_{ob}}{f_{oc}}\alpha$. Además junta luz con su objetivo grande, y su poder de resolución lo pone la [[f2b-resolucion|difracción]].`],
      demo: [R`**Paso 1 (lupa, imagen en el infinito).** Con el objeto en el foco, el rayo que pasa por el centro de la lente no se desvía y sale con ángulo $\theta = \frac yf$. Todos los rayos de la punta salen paralelos a ese, así que el ojo ve la punta en esa dirección. Dividiendo por $\theta_0 = \frac{y}{25}$: $M = \frac{25}{f}$.`,
        R`**Paso 2 (lupa, imagen en el punto próximo).** Con la imagen virtual a 25 cm, la [[f2b-lentes|ecuación de la lente]] con $d_i = -25$ da $\frac{1}{d_o} = \frac1f + \frac1{25}$. El rayo central sale con ángulo $\frac{y}{d_o}$, así que $M = \frac{25}{d_o} = \frac{25}{f} + 1$.`,
        R`**Paso 3 (microscopio).** El objetivo da una imagen real de tamaño $m_1y$. Si cae en el foco del ocular, el paso 1 aplicado a esa imagen da el ángulo $\frac{m_1y}{f_{oc}}$. Dividiendo por $\frac{y}{25}$: $M = m_1\frac{25}{f_{oc}}$.`,
        R`**Paso 4 (telescopio).** Un haz paralelo que llega con ángulo $\alpha$ converge en el plano focal del objetivo, a altura $-f_{ob}\alpha$ (el rayo por el centro no se desvía). Ese punto está también en el foco del ocular, y según el paso 1 el ocular lo manda al infinito con ángulo $\frac{-f_{ob}\alpha}{f_{oc}}$. Por eso $M = -\frac{f_{ob}}{f_{oc}}$, y las lentes quedan a $f_{ob} + f_{oc}$. $\blacksquare$`],
      examples: [{ q: R`Telescopio con objetivo de 100 cm y ocular de 2 cm.`, steps: [R`$|M| = \frac{100}{2} = 50$; largo $102$ cm.`, R`La Luna ($0{,}5^\circ$) se ve de unos $25^\circ$.`] }],
      tips: [R`El aumento angular no es el lateral de la [[f2b-lentes|ecuación de lentes]]: con la imagen en el infinito, el lateral ni siquiera está definido.`],
      see: ["f2b-lentes", "f2b-resolucion"]
    },
    "f2b-coherencia": {
      title: "Coherencia de la luz", aliases: ["coherencia", "longitud de coherencia", "tiempo de coherencia", "luz coherente", "ancho espectral"], concepts: ["f2b-coherencia"],
      summary: "Una fuente con ancho espectral Δλ alrededor de λ interfiere consigo misma solo si la diferencia de caminos es menor que ℓ_c ≈ λ²/Δλ (o c/Δν).",
      def: [R`Ninguna fuente es perfectamente monocromática: emite un **ancho espectral** $\Delta\lambda$ (o $\Delta\nu$) alrededor de $\lambda$. La **longitud de coherencia** es la diferencia de caminos máxima para la que todavía se ven franjas de [[f2b-interferencia|interferencia]]: $$\ell_c \approx \frac{\lambda^2}{\Delta\lambda} = \frac{c}{\Delta\nu}.$$ El **tiempo de coherencia** es $\tau_c = \frac{\ell_c}{c} = \frac{1}{\Delta\nu}$.`,
        R`Luz blanca: $\ell_c \sim 1$ μm. Un LED: unos 15 a 30 μm. Una lámpara de sodio: menos de un milímetro. Un láser estabilizado: metros o kilómetros.`],
      idea: [R`Cada longitud de onda del espectro forma su propio sistema de franjas. Con poca diferencia de caminos coinciden; al crecer la diferencia, unas se corren respecto de otras y los máximos de unas tapan los mínimos de otras: el contraste se pierde.`,
        R`Por eso las burbujas de jabón muestran colores y un vidrio de ventana no: en la burbuja el camino extra es de unos cientos de nanómetros; en el vidrio, de milímetros.`],
      demo: [R`**Paso 1 (en números de onda).** Escribimos $k = \frac{2\pi}{\lambda}$. Una diferencia de caminos $x$ desfasa cada componente en $kx$. Si el espectro ocupa de $k_0 - \frac{\Delta k}2$ a $k_0 + \frac{\Delta k}2$, los desfases van de $k_0x - \frac{\Delta k\,x}{2}$ a $k_0x + \frac{\Delta k\,x}{2}$.`,
        R`**Paso 2 (cuándo se borran).** Si esos desfases abarcan una vuelta entera, $\Delta k\,x = 2\pi$, para cada componente hay otra desfasada media vuelta que la cancela: el contraste se anula. Eso pasa en $x = \frac{2\pi}{\Delta k}$.`,
        R`**Paso 3 (pasar a λ).** Diferenciando $k = \frac{2\pi}{\lambda}$: $|\Delta k| \approx \frac{2\pi}{\lambda^2}\Delta\lambda$ (para $\Delta\lambda \ll \lambda$). Reemplazando: $\ell_c = \frac{\lambda^2}{\Delta\lambda}$.`,
        R`**Paso 4 (en frecuencia).** Con $\nu = \frac{c}{\lambda}$, $\Delta\nu \approx \frac{c}{\lambda^2}\Delta\lambda$, así que $\ell_c = \frac{c}{\Delta\nu}$. $\blacksquare$`],
      examples: [{ q: R`¿Cuántas franjas se ven con un LED de 600 nm y 20 nm de ancho?`, steps: [R`$\ell_c = \frac{600^2}{20} = 18\,000$ nm $= 18$ μm.`, R`$N = \frac{\ell_c}{\lambda} = \frac{\lambda}{\Delta\lambda} = 30$ franjas.`] }],
      see: ["f2b-interferencia", "f2b-dispersion"]
    }
  };

  E.extendCourse("f102b", {
    concepts: { "f2b-instrumentos": { name: "Instrumentos ópticos" }, "f2b-coherencia": { name: "Coherencia" } },
    templates: T,
    units: [{
      id: "f2b-instrumentos-u", order: 12, program: "Extra UBA", title: "Instrumentos ópticos y coherencia", icon: "search",
      diagnostic: ["f2b-lupa-num", "f2b-telescopio-num", "f2b-coherencia-num"],
      lessons: [
        { id: "f2b-instrumentos", title: "Lupa, microscopio y telescopio", templates: ["f2b-lupa-num", "f2b-microscopio-num", "f2b-telescopio-num"], theory: ["f2b-instrumentos"],
          intro: R`Aumento angular $M = \theta/\theta_0$, con $\theta_0 = y/25$ cm. Lupa: $\frac{25}{f}$. Telescopio: $\frac{f_{ob}}{f_{oc}}$.` },
        { id: "f2b-coherencia", title: "Coherencia", templates: ["f2b-coherencia-num", "f2b-coherencia-vf"], theory: ["f2b-coherencia"],
          intro: R`Hay franjas solo si la diferencia de caminos es menor que $\ell_c \approx \frac{\lambda^2}{\Delta\lambda}$.` }
      ]
    }],
    cards
  });
})();
