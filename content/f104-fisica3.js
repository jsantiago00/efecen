/*
 * F104 · Física General III — Lic. en Ciencias Básicas (FCEN, UNCuyo), Plan Ord. 77/15 C.S.
 * ==========================================================================================
 * No se encontró el programa oficial: el temario sale de los parciales y finales de 2021 que están en
 * Apunteca (ver docs/parciales/f104.md) y de un temario estándar de física moderna, en 7 unidades:
 *   1 Relatividad especial · 2 Radiación y fotones · 3 Modelo de Bohr · 4 Ondas de materia e incerteza
 *   5 Ecuación de Schrödinger y pozo infinito · 6 Oscilador, escalón, barrera y pozo finito · 7 Átomo de hidrógeno
 * La relatividad de F101 (dilatación, contracción, Lorentz, energía) se da por vista y se enlaza.
 *
 * Constantes (E.f3): las del CODATA redondeadas; la constante de Rydberg y el radio de Bohr se calculan con ellas.
 * Verificaciones independientes en los tests: boosts armados con la rapidez, emisión y llegada de pulsos simulada,
 * cuadrimomentos y bisección sobre la conservación, maximización e integración numérica del espectro de Planck,
 * frenado del fotoelectrón simulado con RK4, y la órbita de Bohr resuelta por bisección en unidades SI.
 * Ids con prefijo "f3-". Todo el texto y los ejercicios son originales.
 */
(function () {
  const E = window.Efecen;
  E.registerCourse({ id: "f104", code: "F104", title: "Física General III", icon: "atom" });
  // constantes y ayudas compartidas por las unidades (E.f3)
  const F = E.f3 = {
    h: 6.62607e-34, c: 2.99792458e8, e: 1.602177e-19, me: 9.10938e-31, mp: 1.672622e-27, e0: 8.854188e-12, kB: 1.380649e-23, sigma: 5.6704e-8,
    // energías en reposo (MeV)
    M: { e: 0.511, p: 938.272, n: 939.565, pi0: 134.977, pic: 139.570, mu: 105.658, K: 493.677, K0: 497.611, L: 1115.683 },
    simpson: (f, a, b, n = 1000) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3; },
    bisect: (f, a, b, it = 200) => { let fa = f(a); for (let i = 0; i < it; i++) { const m = (a + b) / 2, fm = f(m); if ((fm < 0) === (fa < 0)) { a = m; fa = fm; } else b = m; } return (a + b) / 2; },
    golden: (f, a, b, it = 200) => { const g = (Math.sqrt(5) - 1) / 2; for (let i = 0; i < it; i++) { const x1 = b - g * (b - a), x2 = a + g * (b - a); if (f(x1) < f(x2)) b = x2; else a = x1; } return (a + b) / 2; },
    // número con coma para TeX (con notación científica si hace falta)
    nf: (x, d = 3) => {
      if (x === 0 || !isFinite(x)) return "0";
      const a = Math.abs(x);
      if (a < 1e-3 || a >= 1e6) { const ex = Math.floor(Math.log10(a)), m = x / 10 ** ex; return `${String(+m.toFixed(d - 1)).replace(".", "{,}")} \\times 10^{${ex}}`; }
      return String(+x.toPrecision(d + 1)).replace(".", "{,}");
    }
  };
  F.hbar = F.h / (2 * Math.PI);
  F.hc = F.h * F.c / F.e * 1e9; // eV·nm
  F.Ry = F.me * F.e ** 4 / (8 * F.e0 ** 2 * F.h ** 2) / F.e; // eV
  F.a0 = F.e0 * F.h ** 2 / (Math.PI * F.me * F.e ** 2) * 1e9; // nm
  // boost a lo largo de x con rapidez φ (c = 1): (t, x) → (t', x')
  F.boost = (phi, t, x) => [Math.cosh(phi) * t - Math.sinh(phi) * x, -Math.sinh(phi) * t + Math.cosh(phi) * x];
})();

/* =====================================================================
 *  UNIDAD 1 · RELATIVIDAD ESPECIAL: INTERVALO, DOPPLER Y CUADRIMOMENTO
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, F = E.f3, nf = F.nf;
  const T = {};
  const dn = (x, d = 3) => String(H.num(x, d)).replace(".", "{,}");
  const C = 2.99792458e5; // km/s

  T["f3-intervalo-num"] = {
    type: "numeric", concepts: ["f3-intervalo"], difficulty: 2,
    generate(r) {
      const dt = r.int(2, 60), b = r.pick([0.2, 0.35, 0.5, 0.6, 0.75, 0.8, 0.9, 1.25, 1.5, 2, 3]), dx = Math.round(b * C * dt * 1e-6 * 10) / 10;
      const ctdt = C * dt * 1e-6, s2 = ctdt * ctdt - dx * dx, timelike = s2 > 0;
      const ans = timelike ? Math.sqrt(s2) / C * 1e6 : Math.sqrt(-s2);
      return {
        prompt: `Para un observador, dos eventos ocurren separados $${dt}$ μs en el tiempo y $${dn(dx, 4)}$ km en el espacio (sobre una misma recta). ${timelike ? "¿Cuánto tiempo (μs) separa a los eventos para un observador que los ve ocurrir en el mismo lugar?" : "¿Qué distancia (km) separa a los eventos para un observador que los ve simultáneos?"} ($c = 3\\times10^5$ km/s)`,
        answer: ans,
        solution: [`El [[f3-intervalo|intervalo]] $s^2 = (c\\Delta t)^2 - \\Delta x^2$ es el mismo para todos los observadores inerciales. Acá $c\\Delta t \\approx ${dn(ctdt, 4)}$ km, así que $s^2 \\approx ${dn(s2, 4)}$ km²: ${timelike ? "es **temporal**" : "es **espacial**"}.`,
          timelike ? `Donde ocurren en el mismo lugar, $\\Delta x' = 0$ y $s^2 = (c\\Delta\\tau)^2$: $\\Delta\\tau = \\frac{\\sqrt{s^2}}{c} \\approx ${dn(ans, 4)}$ μs (el **tiempo propio**, menor que $${dt}$ μs).`
            : `Donde son simultáneos, $\\Delta t' = 0$ y $s^2 = -\\Delta x'^2$: $\\Delta x' = \\sqrt{-s^2} \\approx ${dn(ans, 4)}$ km (la **distancia propia**).`],
        // verificación: se arma el boost (con la rapidez) que lleva a ese sistema y se transforman los eventos
        verify: { kind: "value", tol: 1e-6, fn: () => {
          const beta = timelike ? dx / ctdt : ctdt / dx, [t2, x2] = F.boost(Math.atanh(beta), ctdt, dx);
          return timelike ? t2 / C * 1e6 : x2;
        } }
      };
    }
  };
  T["f3-causal-vf"] = {
    type: "tf", concepts: ["f3-intervalo"], difficulty: 2,
    generate(r) {
      const dt = r.int(1, 30), b = r.pick([0.3, 0.5, 0.7, 0.9, 1.1, 1.4, 2, 3]), dx = Math.round(b * 300 * dt) / 1000, q = r.pick(["orden", "causa"]);
      const space = dx > 0.3 * dt;
      return {
        prompt: `Un evento A ocurre en $x = 0$, $t = 0$, y un evento B en $x = ${dn(dx, 4)}$ km, $t = ${dt}$ μs, según un observador. ($c = 3\\times10^5$ km/s) <b>Verdadero o falso:</b> ${q === "orden" ? "existe un observador inercial para el que B ocurre antes que A" : "A pudo haber causado B (una señal que salió de A pudo llegar a B)"}.`,
        answer: q === "orden" ? space : !space,
        explanation: `En $${dt}$ μs la luz recorre $${dn(0.3 * dt, 3)}$ km. B está ${space ? "más lejos: el intervalo es **espacial**" : "más cerca: el intervalo es **temporal**"} ([[f3-intervalo|intervalo]]). ${space ? "Con intervalo espacial el orden temporal depende del observador y ninguna señal puede unirlos." : "Con intervalo temporal todos los observadores ven A antes que B, y una señal más lenta que la luz puede unirlos."}`,
        solution: [`El orden de dos eventos solo es absoluto si uno está dentro del cono de luz del otro.`],
        // verificación: se barren boosts con β entre −0,999 y 0,999 buscando uno que invierta el signo de Δt'
        verify: { kind: "truth", fn: () => {
          let flips = false;
          for (let i = -999; i <= 999; i += 3) { const [t2] = F.boost(Math.atanh(i / 1000), 0.3 * dt, dx); if (t2 < 0) flips = true; }
          return q === "orden" ? flips : !flips;
        } }
      };
    }
  };
  T["f3-doppler-num"] = {
    type: "numeric", concepts: ["f3-doppler-rel"], difficulty: 2,
    generate(r) {
      const lam0 = r.pick([121.6, 410.2, 434.0, 486.1, 656.3, 589.0]), sense = r.pick(["aleja", "acerca"]), beta = r.pick([0.05, 0.1, 0.2, 0.3, 0.5, 0.6, 0.8]), ask = r.pick(["lam", "beta"]);
      const k = Math.sqrt((1 + beta) / (1 - beta)), lam = sense === "aleja" ? lam0 * k : lam0 / k;
      const lamShow = Math.round(lam * 10) / 10, kk = sense === "aleja" ? lamShow / lam0 : lam0 / lamShow, bAns = (kk * kk - 1) / (kk * kk + 1);
      return {
        prompt: ask === "lam" ? `Una galaxia se ${sense} de nosotros a $${dn(beta, 2)}c$. Una línea que en el laboratorio tiene $${dn(lam0, 4)}$ nm, ¿con qué longitud de onda (nm) la recibimos?`
          : `Una línea que en el laboratorio tiene $${dn(lam0, 4)}$ nm llega desde una fuente que se ${sense} de nosotros con $${dn(lamShow, 4)}$ nm. ¿A qué fracción de $c$ se ${sense}?`,
        answer: ask === "lam" ? lam : bAns,
        solution: [`[[f3-doppler-rel|Doppler relativista]] sobre la línea de visión: $\\lambda = \\lambda_0\\sqrt{\\frac{1 + \\beta}{1 - \\beta}}$ si se aleja (y la inversa si se acerca).`,
          ask === "lam" ? `$\\sqrt{\\frac{1 + ${dn(beta, 2)}}{1 - ${dn(beta, 2)}}} \\approx ${dn(k, 4)}$, así que $\\lambda \\approx ${dn(lam, 4)}$ nm.`
            : `Con $k = ${sense === "aleja" ? "\\frac{\\lambda}{\\lambda_0}" : "\\frac{\\lambda_0}{\\lambda}"} \\approx ${dn(kk, 5)}$: $\\beta = \\frac{k^2 - 1}{k^2 + 1} \\approx ${dn(bAns, 4)}$.`],
        // verificación: la fuente emite crestas cada T₀ en su sistema; se transforman los eventos de emisión
        // al sistema del observador (boost con la rapidez) y se mide el intervalo entre llegadas
        verify: { kind: "zero", tol: 1e-6, fn: a => {
          const b = ask === "lam" ? beta : a, s = sense === "aleja" ? 1 : -1, phi = Math.atanh(b), L = 1000, arr = [];
          for (let kq = 0; kq < 2; kq++) { const [t, x] = F.boost(-phi * s, kq, 0); arr.push(t + (L + x)); }
          const ratio = arr[1] - arr[0]; // período observado / período propio (el observador está en x = −L)
          return [lam0 * ratio / (ask === "lam" ? a : lamShow) - 1];
        } }
      };
    }
  };
  const REAC = [
    { tex: R`p + p \to p + p + \pi^0`, mi: [F.M.p, F.M.p], mf: [F.M.p, F.M.p, F.M.pi0], proj: "un protón", targ: "un protón en reposo" },
    { tex: R`p + p \to p + p + p + \bar p`, mi: [F.M.p, F.M.p], mf: [F.M.p, F.M.p, F.M.p, F.M.p], proj: "un protón", targ: "un protón en reposo" },
    { tex: R`\pi^- + p \to K^0 + \Lambda`, mi: [F.M.pic, F.M.p], mf: [F.M.K0, F.M.L], proj: "un pion", targ: "un protón en reposo" },
    { tex: R`\gamma + p \to p + \pi^0`, mi: [0, F.M.p], mf: [F.M.p, F.M.pi0], proj: "un fotón", targ: "un protón en reposo" },
    { tex: R`\gamma + e^- \to e^- + e^- + e^+`, mi: [0, F.M.e], mf: [F.M.e, F.M.e, F.M.e], proj: "un fotón", targ: "un electrón en reposo" }
  ];
  T["f3-umbral-num"] = {
    type: "numeric", concepts: ["f3-cuadrimomento"], difficulty: 3,
    generate(r) {
      const Rx = r.pick(REAC), [m1, m2] = Rx.mi, Mf = Rx.mf.reduce((s, m) => s + m, 0), K = (Mf * Mf - (m1 + m2) ** 2) / (2 * m2);
      return {
        prompt: `¿Cuál es la energía cinética mínima (MeV) que tiene que tener ${Rx.proj} para producir la reacción $${Rx.tex}$ al chocar con ${Rx.targ}? (Energías en reposo, en MeV: ${[...new Set([...Rx.mi, ...Rx.mf].filter(m => m > 0))].map(m => `$${dn(m, 6)}$`).join(", ")})`,
        answer: K,
        solution: [`La [[f3-cuadrimomento|masa invariante]] $\\sqrt s$ del estado inicial es la misma en todo sistema. En el umbral, en el sistema centro de masa los productos quedan quietos: $\\sqrt s = \\sum m_f = ${dn(Mf, 6)}$ MeV.`,
          `En el laboratorio (con $c = 1$): $s = (E_1 + m_2)^2 - p_1^2 = m_1^2 + m_2^2 + 2E_1m_2$. Igualando, $E_1 = \\frac{(\\sum m_f)^2 - m_1^2 - m_2^2}{2m_2}$.`,
          `$K = E_1 - m_1 = \\frac{(\\sum m_f)^2 - (m_1 + m_2)^2}{2m_2} \\approx ${dn(K, 5)}$ MeV.`],
        // verificación: con esa K se arma el cuadrimomento total y se calcula su masa invariante
        verify: { kind: "zero", tol: 1e-9, fn: k => { const E1 = k + m1, p1 = Math.sqrt(E1 * E1 - m1 * m1), Et = E1 + m2; return [Math.sqrt(Et * Et - p1 * p1) / Mf - 1]; } }
      };
    }
  };
  const DEC = [
    { tex: R`\pi^+ \to \mu^+ + \nu_\mu`, M: F.M.pic, m1: F.M.mu, m2: 0, n1: R`\mu^+` },
    { tex: R`K^+ \to \mu^+ + \nu_\mu`, M: F.M.K, m1: F.M.mu, m2: 0, n1: R`\mu^+` },
    { tex: R`\Lambda \to p + \pi^-`, M: F.M.L, m1: F.M.p, m2: F.M.pic, n1: "p" },
    { tex: R`K^0 \to \pi^+ + \pi^-`, M: F.M.K0, m1: F.M.pic, m2: F.M.pic, n1: R`\pi^+` },
    { tex: R`K^+ \to \pi^+ + \pi^0`, M: F.M.K, m1: F.M.pic, m2: F.M.pi0, n1: R`\pi^+` }
  ];
  T["f3-decay-num"] = {
    type: "numeric", concepts: ["f3-cuadrimomento"], difficulty: 2,
    generate(r) {
      const D = r.pick(DEC), ask = r.pick(["p", "K"]), { M, m1, m2 } = D;
      const p = Math.sqrt((M * M - (m1 + m2) ** 2) * (M * M - (m1 - m2) ** 2)) / (2 * M), K1 = Math.sqrt(p * p + m1 * m1) - m1;
      return {
        prompt: `Una partícula en reposo decae según $${D.tex}$. ¿${ask === "p" ? "Qué momento (MeV/c)" : "Qué energía cinética (MeV)"} tiene el $${D.n1}$? (Energías en reposo, en MeV: $${dn(M, 6)}$, $${dn(m1, 6)}$${m2 ? ` y $${dn(m2, 6)}$` : "; el neutrino, prácticamente sin masa"})`,
        answer: ask === "p" ? p : K1,
        solution: [`Por conservación del [[f3-cuadrimomento|cuadrimomento]], los dos productos salen en sentidos opuestos con el mismo $|p|$, y $\\sqrt{p^2 + m_1^2} + \\sqrt{p^2 + m_2^2} = M$ (con $c = 1$).`,
          `Despejando: $p = \\frac{\\sqrt{[M^2 - (m_1 + m_2)^2][M^2 - (m_1 - m_2)^2]}}{2M} \\approx ${dn(p, 5)}$ MeV/c.`,
          ...(ask === "K" ? [`$K_1 = \\sqrt{p^2 + m_1^2} - m_1 \\approx ${dn(K1, 5)}$ MeV.`] : [])],
        // verificación: se busca por bisección el p que conserva la energía
        verify: { kind: "value", tol: 1e-7, fn: () => { const pp = F.bisect(q => Math.sqrt(q * q + m1 * m1) + Math.sqrt(q * q + m2 * m2) - M, 0, M); return ask === "p" ? pp : Math.sqrt(pp * pp + m1 * m1) - m1; } }
      };
    }
  };

  const cards = {
    "f3-intervalo": {
      title: "Intervalo, cono de luz y diagramas de Minkowski", aliases: ["intervalo invariante", "intervalo temporal", "intervalo espacial", "causalidad relativista"], concepts: ["f3-intervalo"],
      summary: "s² = (cΔt)² − Δx² es igual para todos los observadores inerciales. Si s² > 0, hay un sistema donde los eventos ocurren en el mismo lugar (Δτ = s/c); si s² < 0, uno donde son simultáneos.",
      def: [R`Para dos eventos separados $\Delta t$ y $\Delta x$ (y $\Delta y$, $\Delta z$), el **intervalo** es $$s^2 = (c\Delta t)^2 - \Delta x^2 - \Delta y^2 - \Delta z^2,$$ y vale lo mismo para todos los observadores inerciales ([[f1-lorentz|transformaciones de Lorentz]]).`,
        R`**Temporal** ($s^2 > 0$): un observador ve los eventos en el mismo lugar, y el tiempo entre ellos es el **tiempo propio** $\Delta\tau = \frac sc$. Todos coinciden en cuál es primero y uno pudo causar el otro. **Espacial** ($s^2 < 0$): un observador los ve simultáneos, a la distancia propia $\sqrt{-s^2}$, y el orden temporal depende del observador. **Luminoso** ($s^2 = 0$): los une un rayo de luz.`,
        R`En un **diagrama de Minkowski** se grafica $ct$ contra $x$. La luz va a $45^\circ$, y esas rectas forman el **cono de luz** de cada evento. Los ejes $ct'$ y $x'$ de otro observador se inclinan hacia la diagonal, simétricos respecto de ella.`],
      idea: [R`El intervalo es la "distancia" del espaciotiempo, con un signo menos que lo cambia todo: en lugar de círculos, los puntos a "igual distancia" del origen forman hipérbolas. Un boost es una "rotación hiperbólica" que mueve los eventos sobre esas hipérbolas, y por eso no puede llevar un evento de adentro del cono de luz a afuera.`,
        R`El reloj que va en línea recta entre dos eventos marca el **mayor** tiempo propio: con el signo menos, "dar un rodeo" acorta el tiempo. Es la paradoja de los gemelos.`],
      demo: [R`**Paso 1 (Lorentz con rapidez).** Con $c = 1$ y la rapidez $\phi = \operatorname{arctanh}\beta$, la transformación es $t' = t\cosh\phi - x\sinh\phi$, $x' = -t\sinh\phi + x\cosh\phi$ (porque $\gamma = \cosh\phi$ y $\gamma\beta = \sinh\phi$).`,
        R`**Paso 2 (invariancia).** $t'^2 - x'^2 = (t\cosh\phi - x\sinh\phi)^2 - (x\cosh\phi - t\sinh\phi)^2$. Los productos cruzados se cancelan, y queda $(t^2 - x^2)(\cosh^2\phi - \sinh^2\phi) = t^2 - x^2$.`,
        R`**Paso 3 (temporal).** Si $t^2 > x^2$, con $\tanh\phi = \frac xt$ (que tiene módulo menor que 1, así que es una velocidad posible) queda $x' = 0$, y entonces $t'^2 = s^2$.`,
        R`**Paso 4 (orden).** En el caso temporal, $t' = t\cosh\phi - x\sinh\phi = \cosh\phi\,(t - x\tanh\phi)$, y como $|x\tanh\phi| < |t|$, $t'$ tiene el signo de $t$ para todo $\phi$. En el caso espacial, eligiendo $\tanh\phi$ entre $\frac tx$ y $\pm1$ se invierte el signo. $\blacksquare$`],
      examples: [{ q: R`Eventos separados 10 μs y 2,4 km. ¿Tiempo propio?`, steps: [R`$c\Delta t = 3$ km, $s^2 = 9 - 5{,}76 = 3{,}24$ km², $s = 1{,}8$ km.`, R`$\Delta\tau = \frac{1{,}8}{3\times10^5}$ s $= 6$ μs.`] }],
      see: ["f1-lorentz", "f1-relatividad", "f3-cuadrimomento"]
    },
    "f3-doppler-rel": {
      title: "Efecto Doppler relativista", aliases: ["Doppler relativista", "efecto Doppler relativista", "corrimiento al rojo", "corrimiento al azul"], concepts: ["f3-doppler-rel"],
      summary: "Para una fuente que se aleja con velocidad βc sobre la línea de visión, λ = λ₀√((1 + β)/(1 − β)). Si se acerca, la inversa. Aparece aunque no haya medio.",
      def: [R`Una fuente emite con longitud de onda $\lambda_0$ en su sistema. Si se **aleja** del observador con velocidad $\beta c$ sobre la línea que los une, se recibe $$\lambda = \lambda_0\sqrt{\frac{1 + \beta}{1 - \beta}}$$ (**corrimiento al rojo**); si se **acerca**, $\lambda = \lambda_0\sqrt{\frac{1 - \beta}{1 + \beta}}$ (al azul). Despejando, $\beta = \frac{k^2 - 1}{k^2 + 1}$ con $k = \frac{\lambda}{\lambda_0}$.`],
      idea: [R`A diferencia del [[f2b-doppler|Doppler del sonido]], solo importa la velocidad **relativa**: no hay aire respecto del cual moverse. La fórmula combina el efecto clásico (las crestas se emiten cada vez más lejos) con la [[f1-relatividad|dilatación del tiempo]] del reloj de la fuente.`,
        R`Así se midió que el universo se expande: las líneas de las galaxias lejanas llegan corridas al rojo, tanto más cuanto más lejos están.`],
      demo: [R`**Paso 1 (emisión).** En su sistema, la fuente emite una cresta cada $T_0$. Para el observador, ese reloj atrasa: las emisiones están separadas $\gamma T_0$, y entre una y otra la fuente se alejó $\beta c\gamma T_0$.`,
        R`**Paso 2 (llegada).** La segunda cresta tiene que recorrer esa distancia extra, que le lleva $\beta\gamma T_0$ más. El tiempo entre llegadas es $T = \gamma T_0(1 + \beta)$.`,
        R`**Paso 3 (simplificar).** $\gamma(1 + \beta) = \frac{1 + \beta}{\sqrt{(1 - \beta)(1 + \beta)}} = \sqrt{\frac{1 + \beta}{1 - \beta}}$. Como $\lambda = cT$, queda la fórmula. Acercándose, $\beta \to -\beta$. $\blacksquare$`],
      examples: [{ q: R`La línea de 656,3 nm llega a 721,9 nm. ¿Velocidad?`, steps: [R`$k = 1{,}1$, $k^2 = 1{,}21$: $\beta = \frac{0{,}21}{2{,}21} \approx 0{,}095$, se aleja.`] }],
      see: ["f2b-doppler", "f1-relatividad", "f3-intervalo"]
    },
    "f3-cuadrimomento": {
      title: "Cuadrimomento, masa invariante, umbrales y decaimientos", aliases: ["cuadrimomento", "cuadrivector energía-momento", "masa invariante", "energía umbral", "umbral de una reacción", "decaimiento en dos cuerpos"], concepts: ["f3-cuadrimomento"],
      summary: "(E, pc) forma un cuadrivector: E² − (pc)² = (mc²)² para cada partícula y, sumando, s = (ΣE)² − (Σpc)² es la masa invariante del sistema. En el umbral, los productos quedan quietos en el centro de masa.",
      def: [R`El **cuadrimomento** de una partícula es $(E/c, \vec p)$. Su "módulo" es la masa: $E^2 - (pc)^2 = (mc^2)^2$ ([[f1-dinamica-rel|energía relativista]]). Se conserva en todo choque o decaimiento.`,
        R`Para un sistema, $s = \left(\sum E\right)^2 - \left(\sum\vec pc\right)^2$ es invariante; $\sqrt s$ es la **masa invariante**, la energía total en el sistema centro de masa.`,
        R`**Umbral** (proyectil $m_1$ contra blanco $m_2$ en reposo, con $c = 1$): $K_{min} = \frac{(\sum m_f)^2 - (m_1 + m_2)^2}{2m_2}$. **Decaimiento en dos cuerpos** de $M$ en reposo: $p = \frac{\sqrt{[M^2 - (m_1 + m_2)^2][M^2 - (m_1 - m_2)^2]}}{2M}$.`],
      idea: [R`Para crear partículas no alcanza con tener energía: parte de ella se la lleva el movimiento del centro de masa, que no se puede gastar. Por eso los aceleradores modernos hacen chocar dos haces de frente: con blanco fijo, la energía útil crece como la raíz de la del haz.`],
      demo: [R`**Paso 1 (en el laboratorio).** Con el blanco quieto: $\sum E = E_1 + m_2$ y $\sum\vec p = \vec p_1$. Entonces $s = (E_1 + m_2)^2 - p_1^2 = E_1^2 - p_1^2 + 2E_1m_2 + m_2^2 = m_1^2 + m_2^2 + 2E_1m_2$.`,
        R`**Paso 2 (en el umbral).** En el centro de masa el momento total es cero. Con la energía justa, los productos se crean en reposo ahí, así que $\sqrt s = \sum m_f$.`,
        R`**Paso 3 (despejar).** $m_1^2 + m_2^2 + 2E_1m_2 = (\sum m_f)^2$ da $E_1$, y $K = E_1 - m_1 = \frac{(\sum m_f)^2 - (m_1 + m_2)^2}{2m_2}$.`,
        R`**Paso 4 (decaimiento).** Con $M$ en reposo, los productos tienen momentos opuestos de igual módulo $p$: $E_1 + E_2 = M$ y $E_1^2 - E_2^2 = m_1^2 - m_2^2$. Dividiendo, $E_1 - E_2 = \frac{m_1^2 - m_2^2}{M}$, así que $E_1 = \frac{M^2 + m_1^2 - m_2^2}{2M}$ y $p^2 = E_1^2 - m_1^2$ da la fórmula. $\blacksquare$`],
      examples: [{ q: R`$\pi^+ \to \mu^+\nu$ en reposo. ¿Momento del muon?`, steps: [R`$p = \frac{139{,}57^2 - 105{,}66^2}{2\cdot139{,}57} \approx 29{,}8$ MeV/c.`] }],
      see: ["f1-dinamica-rel", "f3-intervalo", "f1-momento"]
    }
  };

  E.extendCourse("f104", {
    concepts: { "f3-intervalo": { name: "Intervalo y causalidad" }, "f3-doppler-rel": { name: "Doppler relativista" }, "f3-cuadrimomento": { name: "Cuadrimomento" } },
    templates: T,
    units: [{
      id: "f3-relatividad-u", order: 1, program: "Unidad 1", title: "Relatividad especial", icon: "clock",
      diagnostic: ["f3-intervalo-num", "f3-doppler-num", "f3-decay-num"],
      lessons: [
        { id: "f3-intervalo", title: "Intervalo y cono de luz", templates: ["f3-intervalo-num", "f3-causal-vf"], theory: ["f3-intervalo"],
          intro: R`$s^2 = (c\Delta t)^2 - \Delta x^2$ es invariante. Temporal: tiempo propio $s/c$. Espacial: el orden depende del observador.` },
        { id: "f3-doppler-rel", title: "Doppler relativista", templates: ["f3-doppler-num"], theory: ["f3-doppler-rel"],
          intro: R`Alejándose: $\lambda = \lambda_0\sqrt{\frac{1 + \beta}{1 - \beta}}$.` },
        { id: "f3-cuadrimomento", title: "Umbrales y decaimientos", templates: ["f3-decay-num", "f3-umbral-num"], theory: ["f3-cuadrimomento"],
          intro: R`$E^2 - (pc)^2 = (mc^2)^2$; la masa invariante $\sqrt s$ del sistema es la misma en todo sistema de referencia.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 2 · RADIACIÓN Y FOTONES: CUERPO NEGRO, FOTOELÉCTRICO Y COMPTON
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, F = E.f3, nf = F.nf;
  const T = {};
  const dn = (x, d = 3) => String(H.num(x, d)).replace(".", "{,}");
  const B = 2.8978e-3; // constante de Wien (m·K)
  // espectro de Planck por unidad de longitud de onda, sin las constantes de adelante (sirve para buscar el máximo)
  const planck = (lam, T0) => 1 / (lam ** 5 * Math.expm1(F.h * F.c / (lam * F.kB * T0)));
  const lamMax = T0 => F.golden(l => -planck(l, T0) * 1e-30 * (B / T0) ** 5, 0.2 * B / T0, 5 * B / T0);
  // σ a partir de la integral de Planck: σ = 2π k⁴/(h³c²) ∫ x³/(eˣ − 1) dx
  const sigmaNum = () => 2 * Math.PI * F.kB ** 4 / (F.h ** 3 * F.c ** 2) * F.simpson(x => (x < 1e-9 ? 0 : x ** 3 / Math.expm1(x)), 0, 60, 20000);
  const CUERPOS = [{ n: "el filamento de una lámpara", T: 2800 }, { n: "la superficie del Sol", T: 5800 }, { n: "la piel humana", T: 310 }, { n: "la radiación cósmica de fondo", T: 2.725 }, { n: "una estrella azul", T: 12000 }, { n: "una brasa", T: 1100 }, { n: "una enana roja", T: 3200 }];
  const METALES = [{ n: "sodio", w: 2.28 }, { n: "potasio", w: 2.30 }, { n: "cesio", w: 2.14 }, { n: "calcio", w: 2.87 }, { n: "zinc", w: 4.33 }, { n: "cobre", w: 4.70 }, { n: "aluminio", w: 4.08 }];

  T["f3-wien-num"] = {
    type: "numeric", concepts: ["f3-cuerpo-negro"], difficulty: 1,
    generate(r) {
      const C0 = r.pick(CUERPOS), ask = r.pick(["lam", "T"]), lm = B / C0.T;
      const um = lm * 1e6, show = Math.round(um * (um < 1 ? 1000 : 100)) / (um < 1 ? 1000 : 100);
      return {
        prompt: ask === "lam" ? `Tratando a ${C0.n} como un cuerpo negro a $${dn(C0.T, 4)}$ K, ¿en qué longitud de onda (μm) emite con más intensidad? ($b = 2{,}898\\times10^{-3}$ m·K)`
          : `El espectro de ${C0.n} tiene su máximo en $${dn(show, 4)}$ μm. Tratándolo como un cuerpo negro, ¿a qué temperatura (K) está? ($b = 2{,}898\\times10^{-3}$ m·K)`,
        answer: ask === "lam" ? um : B / (show * 1e-6),
        solution: [`[[f3-cuerpo-negro|Ley de Wien]]: $\\lambda_{max}T = b$.`,
          ask === "lam" ? `$\\lambda_{max} = \\frac{2{,}898\\times10^{-3}}{${dn(C0.T, 4)}}$ m $\\approx ${dn(um, 4)}$ μm${um < 0.4 ? " (ultravioleta)" : um < 0.7 ? " (visible)" : " (infrarrojo o más largo)"}.` : `$T = \\frac{b}{\\lambda_{max}} \\approx ${dn(B / (show * 1e-6), 4)}$ K.`],
        // verificación: se busca el máximo del espectro de Planck por sección áurea
        verify: { kind: "zero", tol: 1e-5, fn: a => [ask === "lam" ? lamMax(C0.T) * 1e6 / a - 1 : lamMax(a) * 1e6 / show - 1] }
      };
    }
  };
  T["f3-stefan-num"] = {
    type: "numeric", concepts: ["f3-cuerpo-negro"], difficulty: 2,
    generate(r) {
      const Rr = r.pick([0.5, 1, 2, 5, 10]), T0 = r.int(3, 30) * 100, ask = r.pick(["P", "T"]), A = 4 * Math.PI * (Rr / 100) ** 2, P = F.sigma * A * T0 ** 4;
      const Pshow = +P.toPrecision(3);
      return {
        prompt: ask === "P" ? `Una esfera de $${dn(Rr, 2)}$ cm de radio, que se comporta como un cuerpo negro, está a $${T0}$ K. ¿Qué potencia (W) radia? ($\\sigma = 5{,}67\\times10^{-8}$ W/(m² K⁴))`
          : `Una esfera de $${dn(Rr, 2)}$ cm de radio, que se comporta como un cuerpo negro, radia $${nf(Pshow, 3)}$ W. ¿A qué temperatura (K) está? ($\\sigma = 5{,}67\\times10^{-8}$ W/(m² K⁴))`,
        answer: ask === "P" ? P : (Pshow / (F.sigma * A)) ** 0.25,
        solution: [`[[f3-cuerpo-negro|Ley de Stefan-Boltzmann]]: $P = \\sigma AT^4$, con $A = 4\\pi R^2 \\approx ${nf(A, 4)}$ m².`,
          ask === "P" ? `$P \\approx ${nf(P, 4)}$ W.` : `$T = \\left(\\frac{P}{\\sigma A}\\right)^{1/4} \\approx ${dn((Pshow / (F.sigma * A)) ** 0.25, 4)}$ K.`],
        // verificación: σ se recalcula integrando el espectro de Planck (Simpson en x = hν/kT)
        verify: { kind: "zero", tol: 2e-4, fn: a => [ask === "P" ? sigmaNum() * A * T0 ** 4 / a - 1 : sigmaNum() * A * a ** 4 / Pshow - 1] }
      };
    }
  };
  T["f3-fotoelectrico-num"] = {
    type: "numeric", concepts: ["f3-fotoelectrico"], difficulty: 2,
    generate(r) {
      const M = r.pick(METALES), lam = r.int(15, 55) * 10, Ef = F.hc / lam, ask = r.pick(["K", "V", "umbral", "v"]);
      if (ask !== "umbral" && Ef < M.w + 0.15) return null;
      const K = Ef - M.w, v = Math.sqrt(2 * K * F.e / F.me), lu = F.hc / M.w;
      const ans = { K, V: K, umbral: lu, v: v / 1000 }[ask];
      return {
        prompt: ask === "umbral" ? `La función trabajo del ${M.n} es $${dn(M.w, 3)}$ eV. ¿Cuál es la longitud de onda (nm) más larga que arranca electrones de su superficie? ($hc = 1240$ eV·nm)`
          : `Sobre una placa de ${M.n} (función trabajo $${dn(M.w, 3)}$ eV) incide luz de $${lam}$ nm. ¿${{ K: "Qué energía cinética máxima (eV) tienen los electrones arrancados", V: "Qué potencial de frenado (V) detiene a todos los electrones", v: "Qué velocidad máxima (km/s) tienen los electrones arrancados" }[ask]}? ($hc = 1240$ eV·nm${ask === "v" ? ", $m_e = 9{,}11\\times10^{-31}$ kg" : ""})`,
        answer: ans,
        solution: ask === "umbral" ? [`[[f3-fotoelectrico|Efecto fotoeléctrico]]: hace falta $hf \\ge \\phi$. El umbral es $\\lambda_0 = \\frac{hc}{\\phi} = \\frac{1240}{${dn(M.w, 3)}} \\approx ${dn(lu, 4)}$ nm.`]
          : [`Cada fotón tiene $E = \\frac{hc}{\\lambda} = \\frac{1240}{${lam}} \\approx ${dn(Ef, 4)}$ eV.`, `[[f3-fotoelectrico|Ecuación de Einstein]]: $K_{max} = E - \\phi \\approx ${dn(K, 4)}$ eV${ask === "V" ? `, y el potencial de frenado es $V_0 = \\frac{K_{max}}{e} \\approx ${dn(K, 4)}$ V` : ""}.`,
            ...(ask === "v" ? [`$v = \\sqrt{\\frac{2K}{m_e}} \\approx ${dn(v / 1000, 4)}$ km/s.`] : [])],
        // verificación: el electrón sale con la velocidad de la respuesta (o con la que da el balance en SI) y se lo frena
        // con un campo uniforme de V₀/d simulado con RK4; tiene que detenerse justo en d
        verify: { kind: "zero", tol: 1e-4, fn: a => {
          if (ask === "umbral") return [F.h * F.c / (a * 1e-9) / F.e / M.w - 1];
          const Kj = (F.h * F.c / (lam * 1e-9)) - M.w * F.e, d = 0.01;
          const V0 = ask === "V" ? a : Kj / F.e, v0 = ask === "v" ? a * 1000 : Math.sqrt(2 * (ask === "K" ? a * F.e : Kj) / F.me), acc = F.e * V0 / d / F.me;
          let x = 0, vv = v0; const tstop = v0 / acc, n = 2000, h = tstop / n;
          for (let i = 0; i < n; i++) { x += vv * h - acc * h * h / 2; vv -= acc * h; }
          return [x / d - 1];
        } }
      };
    }
  };
  T["f3-compton-num"] = {
    type: "numeric", concepts: ["f3-compton"], difficulty: 2,
    generate(r) {
      const lam = r.pick([2, 5, 10, 20, 50, 71]), th = r.pick([30, 45, 60, 90, 120, 135, 180]), ask = r.pick(["lam2", "dl", "K"]);
      const lc = 2.426, dl = lc * (1 - Math.cos(th * Math.PI / 180)), lam2 = lam + dl;
      const Kk = F.hc * (1 / lam - 1 / lam2); // keV, porque hc = 1239,8 eV·nm = 1239,8 keV·pm
      return {
        prompt: `Rayos X de $${lam}$ pm se dispersan en electrones libres, en reposo. Para el fotón que sale a $${th}^\\circ$, ¿${{ lam2: "qué longitud de onda (pm) tiene", dl: "cuánto (pm) aumentó su longitud de onda", K: "qué energía cinética (keV) se lleva el electrón" }[ask]}? ($\\frac{h}{m_ec} = 2{,}426$ pm, $hc = 1240$ keV·pm)`,
        answer: { lam2, dl, K: Kk }[ask],
        solution: [`[[f3-compton|Efecto Compton]]: $\\Delta\\lambda = \\frac{h}{m_ec}(1 - \\cos\\theta) = 2{,}426(1 - \\cos${th}^\\circ) \\approx ${dn(dl, 4)}$ pm.`,
          `$\\lambda' = ${lam} + ${dn(dl, 4)} \\approx ${dn(lam2, 4)}$ pm.`,
          ...(ask === "K" ? [`El electrón se lleva la diferencia de energía: $K = hc\\left(\\frac1\\lambda - \\frac1{\\lambda'}\\right) \\approx ${dn(Kk, 4)}$ keV.`] : [])],
        // verificación: conservación del cuadrimomento (fotón + electrón) resuelta por bisección en la energía del fotón dispersado
        verify: { kind: "value", tol: 2e-4, fn: () => {
          const m = 510.999, E1 = F.hc / lam, c = Math.cos(th * Math.PI / 180), s = Math.sin(th * Math.PI / 180);
          const E2 = F.bisect(e2 => { const Ee = E1 - e2 + m, px = E1 - e2 * c, py = -e2 * s; return Ee * Ee - px * px - py * py - m * m; }, 1e-6, E1);
          const l2 = F.hc / E2; return { lam2: l2, dl: l2 - lam, K: E1 - E2 }[ask];
        } }
      };
    }
  };
  T["f3-foton-vf"] = {
    type: "tf", concepts: ["f3-fotoelectrico"], difficulty: 2,
    generate(r) {
      const M = r.pick(METALES), l0 = F.hc / M.w, lA = Math.round(l0 * r.pick([0.6, 0.8, 1.2, 1.5])), lB = Math.round(l0 * r.pick([0.5, 0.7, 0.9, 1.3, 1.8])), q = r.pick(["rapidos", "corriente"]);
      if (lA === lB) return null;
      const EA = F.hc / lA, EB = F.hc / lB;
      const truth = q === "rapidos" ? EB > M.w && EB > Math.max(EA, M.w) : EB > M.w && EA < M.w;
      return {
        prompt: `Se ilumina una placa de ${M.n} (función trabajo $${dn(M.w, 3)}$ eV) con una luz A de $${lA}$ nm, muy intensa, y con una luz B de $${lB}$ nm, débil. <b>Verdadero o falso:</b> ${q === "rapidos" ? "la luz B arranca electrones, y más rápidos que los que pueda arrancar la A" : "la luz B produce corriente fotoeléctrica y la A no"}. ($hc = 1240$ eV·nm)`,
        answer: truth,
        explanation: `Lo que decide es la energía de **cada fotón**, no la intensidad ([[f3-fotoelectrico|efecto fotoeléctrico]]): $E_A = \\frac{1240}{${lA}} \\approx ${dn(EA, 3)}$ eV y $E_B \\approx ${dn(EB, 3)}$ eV, contra $\\phi = ${dn(M.w, 3)}$ eV. ${EA > M.w ? "A arranca electrones" : "A no arranca ninguno, por intensa que sea"}; ${EB > M.w ? "B sí arranca" : "B no arranca"}.`,
        solution: [`La intensidad cambia cuántos electrones salen, no su energía máxima.`],
        // verificación: energías de los fotones en joules (con h y c en SI) comparadas con la función trabajo
        verify: { kind: "truth", fn: () => { const eA = F.h * F.c / (lA * 1e-9) / F.e, eB = F.h * F.c / (lB * 1e-9) / F.e; return q === "rapidos" ? eB > M.w && eB > Math.max(eA, M.w) : eB > M.w && eA < M.w; } }
      };
    }
  };

  const cards = {
    "f3-cuerpo-negro": {
      title: "Radiación de cuerpo negro: Planck, Wien y Stefan-Boltzmann", aliases: ["cuerpo negro", "radiación de cuerpo negro", "ley de Planck", "ley de Wien", "ley de Stefan-Boltzmann", "catástrofe ultravioleta"], concepts: ["f3-cuerpo-negro"],
      summary: "Un cuerpo negro a temperatura T emite el espectro de Planck. Su máximo cumple λ_max T = 2,898×10⁻³ m·K (Wien) y la potencia total por área es σT⁴ (Stefan-Boltzmann).",
      def: [R`Un **cuerpo negro** absorbe toda la radiación que le llega; en equilibrio, emite un espectro que solo depende de su temperatura. **Planck** (1900) lo explicó suponiendo que la energía de cada modo de frecuencia $\nu$ solo puede cambiar de a **cuantos** $h\nu$: $$u(\nu, T) = \frac{8\pi h\nu^3}{c^3}\frac{1}{e^{h\nu/k_BT} - 1}.$$`,
        R`**Wien:** el máximo del espectro (por unidad de longitud de onda) está en $\lambda_{max}T = b = 2{,}898\times10^{-3}$ m·K. **Stefan-Boltzmann:** la potencia emitida por unidad de área es $\sigma T^4$, con $\sigma = 5{,}67\times10^{-8}$ W/(m² K⁴).`],
      idea: [R`La física clásica (Rayleigh-Jeans) le daba a cada modo la energía $k_BT$, y como hay infinitos modos de frecuencia alta, la energía total daba infinito: la **catástrofe ultravioleta**. Con cuantos, los modos con $h\nu \gg k_BT$ casi no se excitan, y el espectro cae a frecuencias altas.`,
        R`Por Wien, el Sol (unos 5800 K) emite más en el visible, nosotros (310 K) en el infrarrojo lejano, y el fondo cósmico (2,7 K) en microondas.`],
      demo: [R`**Paso 1 (en longitud de onda).** Pasando a $\lambda$, el espectro es proporcional a $\frac{1}{\lambda^5(e^{x} - 1)}$ con $x = \frac{hc}{\lambda k_BT}$.`,
        R`**Paso 2 (el máximo).** Derivando respecto de $\lambda$ e igualando a cero, $-5(e^x - 1) + xe^x = 0$, o sea $x = 5(1 - e^{-x})$. Su raíz no nula es $x \approx 4{,}965$: $\lambda_{max}T = \frac{hc}{4{,}965\,k_B} = b$.`,
        R`**Paso 3 (potencia total).** Integrando en $\nu$ y cambiando a $x = \frac{h\nu}{k_BT}$: $\int u\,d\nu \propto T^4\int_0^\infty\frac{x^3}{e^x - 1}dx = T^4\frac{\pi^4}{15}$. Por eso la potencia es $\sigma T^4$, con $\sigma = \frac{2\pi^5k_B^4}{15h^3c^2}$. $\blacksquare$`],
      examples: [{ q: R`¿Dónde emite más una persona (310 K)?`, steps: [R`$\lambda_{max} = \frac{2{,}898\times10^{-3}}{310} \approx 9{,}3$ μm: infrarrojo.`] }],
      see: ["f3-fotoelectrico", "f2b-transferencia"]
    },
    "f3-fotoelectrico": {
      title: "Efecto fotoeléctrico", aliases: ["efecto fotoeléctrico", "fotoeléctrico", "función trabajo", "potencial de frenado", "frecuencia umbral", "fotón", "fotones"], concepts: ["f3-fotoelectrico"],
      summary: "La luz llega en fotones de energía hf. Un fotón arranca un electrón si hf ≥ φ, y K_max = hf − φ = eV₀. La intensidad cambia cuántos electrones salen, no su energía.",
      def: [R`La luz está formada por **fotones** de energía $E = hf = \frac{hc}{\lambda}$ (con $hc \approx 1240$ eV·nm). Cada electrón absorbe un fotón entero.`,
        R`**Ecuación de Einstein:** $K_{max} = hf - \phi$, donde la **función trabajo** $\phi$ es la energía mínima para sacar un electrón del metal. Por debajo de la **frecuencia umbral** $f_0 = \frac\phi h$ no sale ninguno. El **potencial de frenado** $V_0$ que anula la corriente cumple $eV_0 = K_{max}$.`],
      idea: [R`Con ondas clásicas, más intensidad significaría más energía para cada electrón, y con luz débil habría que esperar a que el electrón "junte" energía. Nada de eso pasa: con luz roja no sale ningún electrón aunque sea intensísima, y con luz UV salen al instante aunque sea débil. Es lo que convenció a Einstein de que la luz viene en paquetes.`,
        R`El gráfico de $V_0$ contra $f$ es una recta de pendiente $\frac he$, igual para todos los metales: así midió Millikan la constante de Planck.`],
      demo: [R`**Paso 1 (un fotón, un electrón).** El electrón absorbe la energía $hf$ de un fotón. Para salir, gasta al menos $\phi$; los que estaban más adentro gastan más.`,
        R`**Paso 2 (balance).** Por conservación de la energía, los más rápidos salen con $K_{max} = hf - \phi$.`,
        R`**Paso 3 (frenado).** Si el colector está a un potencial $-V$ respecto de la placa, un electrón que sale con $K$ llega solo si $K > eV$. La corriente se anula cuando ni los más rápidos llegan: $eV_0 = K_{max} = hf - \phi$. $\blacksquare$`],
      examples: [{ q: R`Luz de 300 nm sobre sodio ($\phi = 2{,}28$ eV).`, steps: [R`$E = \frac{1240}{300} \approx 4{,}13$ eV.`, R`$K_{max} \approx 1{,}85$ eV y $V_0 \approx 1{,}85$ V.`] }],
      see: ["f3-cuerpo-negro", "f3-compton"]
    },
    "f3-compton": {
      title: "Efecto Compton", aliases: ["efecto Compton", "dispersión Compton", "longitud de onda de Compton"], concepts: ["f3-compton"],
      summary: "Un fotón que choca con un electrón libre sale con más longitud de onda: Δλ = (h/m_ec)(1 − cos θ), con h/m_ec = 2,426 pm. Se trata como un choque entre partículas.",
      def: [R`Un fotón de longitud de onda $\lambda$ choca con un electrón libre en reposo y sale desviado un ángulo $\theta$, con $$\lambda' - \lambda = \frac{h}{m_ec}(1 - \cos\theta).$$ La **longitud de onda de Compton** del electrón es $\frac{h}{m_ec} = 2{,}426$ pm. El electrón se lleva la energía $hc\left(\frac1\lambda - \frac1{\lambda'}\right)$.`],
      idea: [R`El fotón se comporta como una partícula con momento $p = \frac h\lambda$ ([[f3-cuadrimomento|cuadrimomento]] de masa nula). El corrimiento no depende de $\lambda$, así que solo se nota con longitudes de onda chicas: rayos X o gamma.`],
      demo: [R`**Paso 1 (cuadrimomentos, c = 1).** Fotón incidente $p_1 = (E, \vec E)$ con $|\vec E| = E$; electrón $(m, 0)$; fotón saliente $p_2 = (E', \vec E')$; electrón final $p_e$. Conservación: $p_e = p_1 + (m, 0) - p_2$.`,
        R`**Paso 2 (cuadrado).** $p_e^2 = m^2$ y $p_1^2 = p_2^2 = 0$. Desarrollando: $m^2 = m^2 + 2m(E - E') - 2(EE' - \vec E\cdot\vec E')$, o sea $m(E - E') = EE'(1 - \cos\theta)$.`,
        R`**Paso 3.** Dividiendo por $mEE'$: $\frac{1}{E'} - \frac1E = \frac{1 - \cos\theta}{m}$. Con $E = \frac{hc}{\lambda}$ (y restituyendo $c$): $\lambda' - \lambda = \frac{h}{m_ec}(1 - \cos\theta)$. $\blacksquare$`],
      examples: [{ q: R`Rayos X de 20 pm dispersados a 90°.`, steps: [R`$\Delta\lambda = 2{,}426$ pm, $\lambda' \approx 22{,}4$ pm.`] }],
      see: ["f3-fotoelectrico", "f3-cuadrimomento"]
    }
  };

  E.extendCourse("f104", {
    concepts: { "f3-cuerpo-negro": { name: "Cuerpo negro" }, "f3-fotoelectrico": { name: "Efecto fotoeléctrico" }, "f3-compton": { name: "Efecto Compton" } },
    templates: T,
    units: [{
      id: "f3-fotones-u", order: 2, program: "Unidad 2", title: "Radiación y fotones", icon: "sparkles",
      diagnostic: ["f3-wien-num", "f3-fotoelectrico-num", "f3-compton-num"],
      lessons: [
        { id: "f3-cuerpo-negro", title: "Cuerpo negro", templates: ["f3-wien-num", "f3-stefan-num"], theory: ["f3-cuerpo-negro"],
          intro: R`Wien: $\lambda_{max}T = 2{,}898\times10^{-3}$ m·K. Stefan-Boltzmann: $P = \sigma AT^4$.` },
        { id: "f3-fotoelectrico", title: "Efecto fotoeléctrico", templates: ["f3-fotoelectrico-num", "f3-foton-vf"], theory: ["f3-fotoelectrico"],
          intro: R`$K_{max} = hf - \phi = eV_0$; $hc \approx 1240$ eV·nm.` },
        { id: "f3-compton", title: "Efecto Compton", templates: ["f3-compton-num"], theory: ["f3-compton"],
          intro: R`$\Delta\lambda = \frac{h}{m_ec}(1 - \cos\theta)$, con $\frac{h}{m_ec} = 2{,}426$ pm.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 3 · MODELO DE BOHR Y ESPECTROS ATÓMICOS
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, F = E.f3, nf = F.nf;
  const T = {};
  const dn = (x, d = 3) => String(H.num(x, d)).replace(".", "{,}");
  const k = 1 / (4 * Math.PI * F.e0);
  // órbita de Bohr en SI: radio por bisección de k Z e² μ r = n² ħ² (fuerza central + cuantización de L)
  const orbit = (n, Z, mu = F.me) => {
    const r = F.bisect(x => k * Z * F.e * F.e * mu * x - n * n * F.hbar * F.hbar, 1e-14, 1e-7, 300);
    return { r, v: n * F.hbar / (mu * r), E: -k * Z * F.e * F.e / (2 * r) / F.e };
  };
  const SERIES = { 1: "Lyman", 2: "Balmer", 3: "Paschen" };
  const lamT = (ni, nf0) => F.hc / (F.Ry * (1 / (nf0 * nf0) - 1 / (ni * ni)));

  T["f3-bohr-num"] = {
    type: "numeric", concepts: ["f3-bohr"], difficulty: 2,
    generate(r) {
      const Z = r.pick([1, 1, 2, 3]), n = r.int(1, 5), ask = r.pick(["E", "r", "v"]);
      const En = -F.Ry * Z * Z / (n * n), rn = F.a0 * n * n / Z, vn = Z / n * F.e * F.e / (4 * Math.PI * F.e0 * F.hbar) / 1000;
      const ion = { 1: "el átomo de hidrógeno", 2: "el ion $\\text{He}^+$", 3: "el ion $\\text{Li}^{2+}$" }[Z];
      return {
        prompt: `Según el modelo de Bohr, para el electrón de ${ion} en el nivel $n = ${n}$, ¿${{ E: "cuál es la energía (eV)", r: "cuál es el radio de la órbita (nm)", v: "con qué rapidez (km/s) se mueve" }[ask]}? ($13{,}6$ eV, $a_0 = 0{,}0529$ nm, $\\alpha c \\approx 2188$ km/s)`,
        answer: { E: En, r: rn, v: vn }[ask],
        solution: [`[[f3-bohr|Modelo de Bohr]] para un átomo con un solo electrón y carga nuclear $Z = ${Z}$: $E_n = -\\frac{13{,}6\\,Z^2}{n^2}$ eV, $r_n = \\frac{n^2a_0}{Z}$ y $v_n = \\frac{Z}{n}\\alpha c$.`,
          { E: `$E_${n} = -\\frac{13{,}6\\cdot${Z * Z}}{${n * n}} \\approx ${dn(En, 4)}$ eV.`, r: `$r_${n} = \\frac{${n * n}\\cdot0{,}0529}{${Z}} \\approx ${dn(rn, 4)}$ nm.`, v: `$v_${n} = \\frac{${Z}}{${n}}\\cdot2188 \\approx ${dn(vn, 4)}$ km/s.` }[ask]],
        // verificación: la órbita se resuelve en SI por bisección (fuerza de Coulomb = centrípeta y L = nħ)
        verify: { kind: "value", tol: 1e-4, fn: () => { const o = orbit(n, Z); return { E: o.E, r: o.r * 1e9, v: o.v / 1000 }[ask]; } }
      };
    }
  };
  T["f3-transicion-num"] = {
    type: "numeric", concepts: ["f3-espectros"], difficulty: 2,
    generate(r) {
      const nf0 = r.int(1, 3), ni = r.int(nf0 + 1, nf0 + 4), ask = r.pick(["lam", "E"]), lam = lamT(ni, nf0), Eph = F.hc / lam;
      return {
        prompt: `En el átomo de hidrógeno, el electrón pasa del nivel $n = ${ni}$ al $n = ${nf0}$. ¿${ask === "lam" ? "Qué longitud de onda (nm) tiene el fotón emitido" : "Qué energía (eV) tiene el fotón emitido"}? ($13{,}6$ eV, $hc = 1240$ eV·nm)`,
        answer: ask === "lam" ? lam : Eph,
        solution: [`El fotón se lleva la diferencia de energía ([[f3-espectros|espectro del hidrógeno]]): $E = 13{,}6\\left(\\frac{1}{${nf0}^2} - \\frac{1}{${ni}^2}\\right) \\approx ${dn(Eph, 4)}$ eV.`,
          `$\\lambda = \\frac{hc}{E} \\approx ${dn(lam, 4)}$ nm, de la serie de ${SERIES[nf0]}${nf0 === 1 ? " (ultravioleta)" : nf0 === 2 ? (lam < 400 ? " (ultravioleta cercano)" : " (visible)") : " (infrarrojo)"}.`],
        // verificación: energías de los dos niveles con la órbita de Bohr resuelta en SI
        verify: { kind: "value", tol: 1e-4, fn: () => { const dE = orbit(ni, 1).E - orbit(nf0, 1).E; return ask === "lam" ? F.h * F.c / (dE * F.e) * 1e9 : dE; } }
      };
    }
  };
  T["f3-serie-mc"] = {
    type: "mc", concepts: ["f3-espectros"], difficulty: 2,
    generate(r) {
      const nf0 = r.int(1, 3), ni = r.int(nf0 + 1, nf0 + 3), lam = lamT(ni, nf0), show = Math.round(lam * 10) / 10;
      const ok = `$n = ${ni} \\to n = ${nf0}$`, cand = [];
      for (let b = 1; b <= 4; b++) for (let a = b + 1; a <= 7; a++) if (!(a === ni && b === nf0)) cand.push([a, b]);
      const near = cand.sort((p, q) => Math.abs(lamT(...p) - lam) - Math.abs(lamT(...q) - lam)).slice(0, 6);
      return {
        prompt: `En el espectro del hidrógeno aparece una línea de $${dn(show, 5)}$ nm. ¿Qué transición la produce? ($13{,}6$ eV, $hc = 1240$ eV·nm)`,
        ...H.mc(r, ok, r.sample(near, 3).map(([a, b]) => `$n = ${a} \\to n = ${b}$`), { text: true }),
        solution: [`La energía del fotón es $\\frac{1240}{${dn(show, 5)}} \\approx ${dn(F.hc / show, 4)}$ eV ([[f3-espectros|espectro del hidrógeno]]).`,
          `Con $E = 13{,}6\\left(\\frac{1}{n_f^2} - \\frac{1}{n_i^2}\\right)$ solo $n_i = ${ni}$, $n_f = ${nf0}$ da ese valor: es de la serie de ${SERIES[nf0]}.`],
        // verificación: se recorren las transiciones con energías calculadas por la órbita en SI y se busca la más cercana
        verify: { kind: "truth", target: true, fn: () => {
          let best = null, err = Infinity;
          for (let b = 1; b <= 6; b++) for (let a = b + 1; a <= 9; a++) { const l = F.h * F.c / ((orbit(a, 1).E - orbit(b, 1).E) * F.e) * 1e9, d = Math.abs(l - show); if (d < err) { err = d; best = [a, b]; } }
          return best[0] === ni && best[1] === nf0;
        } }
      };
    }
  };
  T["f3-isotopo-num"] = {
    type: "numeric", concepts: ["f3-espectros"], difficulty: 3,
    generate(r) {
      const v = r.pick(["ion", "deuterio"]);
      if (v === "ion") {
        const Z = r.pick([2, 3, 4]), n = r.int(1, 3), Ei = F.Ry * Z * Z / (n * n);
        const nm = { 2: "$\\text{He}^+$", 3: "$\\text{Li}^{2+}$", 4: "$\\text{Be}^{3+}$" }[Z];
        return {
          prompt: `¿Cuánta energía (eV) hace falta para arrancar el único electrón del ion ${nm} si está en el nivel $n = ${n}$? ($13{,}6$ eV)`,
          answer: Ei,
          solution: [`Para un ion con un solo electrón ([[f3-bohr|átomo hidrogenoide]]), $E_n = -\\frac{13{,}6\\,Z^2}{n^2}$ eV. Arrancarlo es llevarlo a $E = 0$.`,
            `$E_{ion} = \\frac{13{,}6\\cdot${Z * Z}}{${n * n}} \\approx ${dn(Ei, 4)}$ eV.`],
          verify: { kind: "value", tol: 1e-4, fn: () => -orbit(n, Z).E }
        };
      }
      const ni = r.pick([3, 4, 5]), mH = F.mp, mD = 2.01355 * 1.660539e-27 - F.me, muH = F.me * mH / (F.me + mH), muD = F.me * mD / (F.me + mD);
      const lH = lamT(ni, 2) * F.me / muH, lD = lamT(ni, 2) * F.me / muD, dl = (lH - lD) * 1000;
      return {
        prompt: `La línea $n = ${ni} \\to 2$ del hidrógeno y la misma línea del deuterio (núcleo con un protón y un neutrón) están levemente separadas porque el núcleo no es infinitamente pesado. Usando la masa reducida, ¿cuánto (pm) más corta es la línea del deuterio? (Masas: $m_e = 9{,}109\\times10^{-31}$ kg, protón $1{,}6726\\times10^{-27}$ kg, deuterón $3{,}3436\\times10^{-27}$ kg)`,
        answer: dl,
        solution: [`El electrón y el núcleo giran alrededor del centro de masa; todo vale con la **masa reducida** $\\mu = \\frac{m_eM}{m_e + M}$ en lugar de $m_e$ ([[f3-espectros|corrección por masa reducida]]). Las energías escalan con $\\mu$ y las longitudes de onda con $\\frac1\\mu$.`,
          `Con núcleo infinito, $\\lambda_\\infty \\approx ${dn(lamT(ni, 2), 5)}$ nm. Hidrógeno: $\\lambda_H = \\lambda_\\infty\\frac{m_e}{\\mu_H} \\approx ${dn(lH, 6)}$ nm; deuterio: $\\lambda_D \\approx ${dn(lD, 6)}$ nm.`,
          `Diferencia: $\\approx ${dn(dl, 4)}$ pm. Así se descubrió el deuterio en 1931.`],
        // verificación: las dos órbitas se resuelven en SI con su masa reducida
        verify: { kind: "value", tol: 5e-4, fn: () => { const l = mu => F.h * F.c / ((orbit(ni, 1, mu).E - orbit(2, 1, mu).E) * F.e) * 1e12; return l(muH) - l(muD); } }
      };
    }
  };
  T["f3-bohr-vf"] = {
    type: "tf", concepts: ["f3-bohr"], difficulty: 2,
    generate(r) {
      const n = r.int(1, 4), S = [
        { s: `al pasar del nivel $n = ${n}$ al $n = ${2 * n}$, el radio de la órbita se cuadruplica`, fn: () => Math.abs(orbit(2 * n, 1).r / orbit(n, 1).r - 4) < 1e-6 },
        { s: `al pasar del nivel $n = ${n}$ al $n = ${2 * n}$, la velocidad del electrón se reduce a la mitad`, fn: () => Math.abs(orbit(2 * n, 1).v / orbit(n, 1).v - 0.5) < 1e-6 },
        { s: `la energía de ionización del $\\text{He}^+$ desde $n = ${n}$ es el doble que la del hidrógeno desde el mismo nivel`, fn: () => Math.abs(orbit(n, 2).E / orbit(n, 1).E - 2) < 1e-6 },
        { s: `el período de la órbita crece como $n^2$`, fn: () => { const P = m => 2 * Math.PI * orbit(m, 1).r / orbit(m, 1).v; return Math.abs(P(2 * n) / P(n) - 4) < 1e-6; } },
        { s: `en el nivel $n = ${n}$, la energía cinética del electrón es igual a menos su energía total`, fn: () => { const o = orbit(n, 1); return Math.abs(0.5 * F.me * o.v * o.v / F.e + o.E) < 1e-6 * Math.abs(o.E); } }
      ];
      const q = r.pick(S), truth = q.fn();
      return {
        prompt: `En el modelo de Bohr del hidrógeno, <b>verdadero o falso:</b> ${q.s}.`,
        answer: truth,
        explanation: `En el [[f3-bohr|modelo de Bohr]]: $r_n \\propto \\frac{n^2}{Z}$, $v_n \\propto \\frac Zn$, $E_n \\propto -\\frac{Z^2}{n^2}$ y el período $\\frac{2\\pi r}{v} \\propto \\frac{n^3}{Z^2}$. Además $K = -E$ (teorema del virial para Coulomb).`,
        solution: [truth ? "Es verdadero." : "Es falso: revisá cómo escala cada magnitud con $n$ y con $Z$."],
        // verificación: las órbitas se resuelven en SI y se comparan los cocientes
        verify: { kind: "truth", fn: q.fn }
      };
    }
  };

  const cards = {
    "f3-bohr": {
      title: "Modelo de Bohr", aliases: ["modelo de Bohr", "átomo de Bohr", "radio de Bohr", "átomo hidrogenoide", "cuantización del momento angular"], concepts: ["f3-bohr"],
      summary: "El electrón gira en órbitas circulares con L = nħ, sin radiar. Para un átomo hidrogenoide: r_n = n²a₀/Z, v_n = Zαc/n, E_n = −13,6 Z²/n² eV.",
      def: [R`**Postulados de Bohr** (1913): (1) el electrón gira en órbitas circulares por la atracción de Coulomb; (2) solo se permiten las órbitas con momento angular $L = mvr = n\hbar$, $n = 1, 2, 3, \dots$; (3) en esas órbitas no radia; (4) al saltar de una a otra emite o absorbe un fotón con $hf = |E_i - E_f|$.`,
        R`Resultado, para un núcleo de carga $Ze$: $$r_n = \frac{n^2}{Z}a_0,\quad v_n = \frac Zn\alpha c,\quad E_n = -\frac{Z^2}{n^2}\,13{,}6\ \text{eV},$$ con el **radio de Bohr** $a_0 = \frac{4\pi\varepsilon_0\hbar^2}{m_ee^2} \approx 0{,}0529$ nm y la constante de estructura fina $\alpha = \frac{e^2}{4\pi\varepsilon_0\hbar c} \approx \frac{1}{137}$.`],
      idea: [R`Un electrón clásico que gira debería radiar y caer al núcleo en una fracción de nanosegundo. Bohr simplemente prohibió eso y cuantizó el momento angular. El modelo es incorrecto en los detalles (las órbitas no existen, como se ve con la ecuación de Schrödinger), pero acierta las energías del hidrógeno.`,
        R`La cuantización tiene una lectura con ondas de materia: $L = n\hbar$ equivale a que en la circunferencia entren justo $n$ longitudes de onda de De Broglie.`],
      demo: [R`**Paso 1 (fuerza).** La atracción de Coulomb es la fuerza centrípeta: $\frac{kZe^2}{r^2} = \frac{mv^2}{r}$, o sea $mv^2r = kZe^2$.`,
        R`**Paso 2 (cuantización).** $mvr = n\hbar$ da $v = \frac{n\hbar}{mr}$. Reemplazando en el paso 1: $\frac{n^2\hbar^2}{mr} = kZe^2$, así que $r_n = \frac{n^2\hbar^2}{mkZe^2} = \frac{n^2}{Z}a_0$.`,
        R`**Paso 3 (velocidad).** $v_n = \frac{n\hbar}{mr_n} = \frac{kZe^2}{n\hbar} = \frac Zn\alpha c$.`,
        R`**Paso 4 (energía).** Del paso 1, $K = \frac12mv^2 = \frac{kZe^2}{2r}$, y $U = -\frac{kZe^2}{r}$. Así $E = K + U = -\frac{kZe^2}{2r_n} = -\frac{Z^2}{n^2}\frac{mk^2e^4}{2\hbar^2}$, y $\frac{mk^2e^4}{2\hbar^2} \approx 13{,}6$ eV. Notá que $K = -E$. $\blacksquare$`],
      examples: [{ q: R`$\text{He}^+$ en $n = 2$.`, steps: [R`$E = -\frac{13{,}6\cdot4}{4} = -13{,}6$ eV; $r = \frac{4\cdot0{,}0529}{2} \approx 0{,}106$ nm.`] }],
      see: ["f3-espectros", "f1-orbitas", "f2a-coulomb"]
    },
    "f3-espectros": {
      title: "Espectros atómicos y series del hidrógeno", aliases: ["espectro del hidrógeno", "serie de Balmer", "serie de Lyman", "serie de Paschen", "fórmula de Rydberg", "constante de Rydberg", "corrección por masa reducida"], concepts: ["f3-espectros"],
      summary: "1/λ = R_H(1/n_f² − 1/n_i²). Las líneas que terminan en n_f = 1 son la serie de Lyman (UV), en 2 la de Balmer (visible) y en 3 la de Paschen (IR). Con núcleo finito, se usa la masa reducida.",
      def: [R`Al saltar de $n_i$ a $n_f < n_i$, el átomo emite un fotón con $$\frac1\lambda = R_H\left(\frac{1}{n_f^2} - \frac{1}{n_i^2}\right),$$ donde $R_H = \frac{13{,}6\ \text{eV}}{hc} \approx 1{,}097\times10^7$ m⁻¹ (**fórmula de Rydberg**). En absorción, el mismo salto al revés.`,
        R`**Series:** $n_f = 1$, **Lyman** (ultravioleta, de 91 a 122 nm); $n_f = 2$, **Balmer** (visible, de 365 a 656 nm); $n_f = 3$, **Paschen** (infrarrojo).`,
        R`**Masa reducida:** el núcleo también se mueve. Todo vale reemplazando $m_e$ por $\mu = \frac{m_eM}{m_e + M}$, así que las energías se multiplican por $\frac{\mu}{m_e}$ y las longitudes de onda se dividen.`],
      idea: [R`Cada elemento tiene su "código de barras" de líneas: así se sabe de qué están hechas las estrellas. La fórmula de Rydberg era empírica (Balmer la encontró en 1885 tanteando números); el [[f3-bohr|modelo de Bohr]] la explicó.`],
      demo: [R`**Paso 1.** Con $E_n = -\frac{13{,}6\text{ eV}}{n^2}$, el fotón se lleva $E_i - E_f = 13{,}6\left(\frac1{n_f^2} - \frac1{n_i^2}\right)$ eV.`,
        R`**Paso 2.** Como $E = \frac{hc}{\lambda}$, dividiendo por $hc$ sale la fórmula de Rydberg con $R_H = \frac{13{,}6\text{ eV}}{hc}$.`,
        R`**Paso 3 (límites de serie).** Con $n_i \to \infty$, $\frac1\lambda \to \frac{R_H}{n_f^2}$: es la línea más corta de la serie (91,2 nm para Lyman, 364,6 nm para Balmer). $\blacksquare$`],
      examples: [{ q: R`Línea roja de Balmer ($3 \to 2$).`, steps: [R`$E = 13{,}6\left(\frac14 - \frac19\right) \approx 1{,}89$ eV.`, R`$\lambda = \frac{1240}{1{,}89} \approx 656$ nm.`] }],
      see: ["f3-bohr", "f3-fotoelectrico"]
    }
  };

  E.extendCourse("f104", {
    concepts: { "f3-bohr": { name: "Modelo de Bohr" }, "f3-espectros": { name: "Espectros atómicos" } },
    templates: T,
    units: [{
      id: "f3-bohr-u", order: 3, program: "Unidad 3", title: "Modelo de Bohr y espectros", icon: "target",
      diagnostic: ["f3-bohr-num", "f3-transicion-num", "f3-serie-mc"],
      lessons: [
        { id: "f3-bohr", title: "El modelo de Bohr", templates: ["f3-bohr-num", "f3-bohr-vf"], theory: ["f3-bohr"],
          intro: R`$L = n\hbar$: $r_n = \frac{n^2}{Z}a_0$, $E_n = -\frac{13{,}6Z^2}{n^2}$ eV.` },
        { id: "f3-espectros", title: "Espectros y series", templates: ["f3-transicion-num", "f3-serie-mc", "f3-isotopo-num"], theory: ["f3-espectros"],
          intro: R`$\frac1\lambda = R_H\left(\frac1{n_f^2} - \frac1{n_i^2}\right)$. Lyman, Balmer y Paschen terminan en $n_f = 1, 2, 3$.` }
      ]
    }],
    cards
  });
})();
