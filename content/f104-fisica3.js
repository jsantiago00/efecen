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

/* =====================================================================
 *  UNIDAD 4 · ONDAS DE MATERIA E INCERTEZA
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, F = E.f3, nf = F.nf;
  const T = {};
  const dn = (x, d = 3) => String(H.num(x, d)).replace(".", "{,}");
  // ħ²/(2m) del electrón en eV·nm², para las unidades 4 a 7
  F.k2e = F.hbar * F.hbar / (2 * F.me) / F.e * 1e18;
  // integra ψ″ = (V − E)ψ/κ desde a (ψ = 0, ψ′ = 1) hasta b con RK4 y devuelve [ψ(b), ψ′(b)] (disparo)
  F.shoot = (V, Ev, a, b, kap, n = 2000) => {
    const h = (b - a) / n, f = (x, y) => [y[1], (V(x) - Ev) * y[0] / kap];
    let y = [0, 1], x = a;
    for (let i = 0; i < n; i++) { const k1 = f(x, y), k2 = f(x + h / 2, [y[0] + h / 2 * k1[0], y[1] + h / 2 * k1[1]]), k3 = f(x + h / 2, [y[0] + h / 2 * k2[0], y[1] + h / 2 * k2[1]]), k4 = f(x + h, [y[0] + h * k3[0], y[1] + h * k3[1]]); y = [y[0] + h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), y[1] + h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])]; x += h; }
    return y;
  };
  // n-ésimo autovalor (n = 1, 2, …) del pozo [a, b] con potencial V: barrido de energías y bisección donde ψ(b) cambia de signo
  F.eigen = (V, a, b, kap, n, Emax, steps = 400) => {
    let cnt = 0, prevE = Math.min(...[0, 0.25, 0.5, 0.75, 1].map(t => V(a + t * (b - a)))), prev = F.shoot(V, prevE, a, b, kap)[0];
    for (let i = 1; i <= steps; i++) {
      const Ev = prevE + (Emax - prevE) * i / steps, cur = F.shoot(V, Ev, a, b, kap)[0];
      if ((cur < 0) !== (prev < 0)) { cnt++; if (cnt === n) return F.bisect(x => F.shoot(V, x, a, b, kap)[0], Ev - (Emax - prevE) / steps, Ev, 60); }
      prev = cur;
    }
    return NaN;
  };
  const PART = [{ n: "un electrón", m: F.me }, { n: "un protón", m: F.mp }];

  T["f3-debroglie-num"] = {
    type: "numeric", concepts: ["f3-de-broglie"], difficulty: 2,
    generate(r) {
      const P = r.pick(PART), V = r.pick([10, 50, 100, 150, 500, 1000, 5000, 20000, 100000]), mc2 = P.m * F.c * F.c / F.e;
      const pc = Math.sqrt(V * V + 2 * V * mc2), lam = F.hc / pc * 1000; // pm
      return {
        prompt: `${P.n === "un electrón" ? "Un electrón" : "Un protón"} parte del reposo y se acelera con una diferencia de potencial de $${V}$ V. ¿Qué longitud de onda de De Broglie (pm) tiene? ($hc = 1240$ eV·nm, $m${P.n === "un electrón" ? "_e" : "_p"}c^2 = ${P.n === "un electrón" ? "511" : "938\\,272"}$ keV)`,
        answer: lam,
        solution: [`Gana $K = eV = ${V}$ eV. [[f3-de-broglie|De Broglie]]: $\\lambda = \\frac hp$, y con la relación relativista $pc = \\sqrt{K^2 + 2Kmc^2} \\approx ${nf(pc, 4)}$ eV${V * 50 < mc2 ? " (acá casi igual a $\\sqrt{2Kmc^2}$, porque $K \\ll mc^2$)" : ""}.`,
          `$\\lambda = \\frac{hc}{pc} \\approx ${dn(lam, 4)}$ pm.`],
        // verificación: se simula la aceleración en un campo uniforme (dp/dt = eE, con la velocidad relativista) y λ = h/p al final
        verify: { kind: "ode", f: (_, y) => { const pcj = y[1] * F.c, Ej = Math.hypot(pcj, P.m * F.c * F.c); return [pcj * F.c / Ej, F.e * V / 0.01]; }, y0: [0, 0], t1: 0,
          until: (_, y) => y[0] >= 0.01, g: (_, y) => y[0] - 0.01, dt: 0.01 / Math.sqrt(2 * V * F.e / P.m) / 4000, tmax: 1, out: (_, y) => F.h / y[1] * 1e12, tol: 1e-4 }
      };
    }
  };
  T["f3-davisson-num"] = {
    testN: 120, // suma 200 ondas en cada paso de la búsqueda del máximo
    type: "numeric", concepts: ["f3-de-broglie"], difficulty: 2,
    generate(r) {
      const K = r.int(20, 200), d = r.pick([0.215, 0.25, 0.3, 0.35, 0.4]), lam = F.hc / Math.sqrt(2 * K * F.me * F.c * F.c / F.e);
      if (lam >= d) return null;
      const th = Math.asin(lam / d) * 180 / Math.PI;
      return {
        prompt: `Un haz de electrones de $${K}$ eV incide perpendicularmente sobre la superficie de un cristal cuyos átomos forman filas separadas $${dn(d, 3)}$ nm. ¿A qué ángulo (en grados, medido desde la normal) aparece el primer máximo de difracción? ($hc = 1240$ eV·nm, $m_ec^2 = 511$ keV)`,
        answer: th,
        solution: [`[[f3-de-broglie|Ondas de materia]]: $\\lambda = \\frac{hc}{\\sqrt{2Km_ec^2}} \\approx ${dn(lam, 4)}$ nm.`,
          `Las filas funcionan como una red: el primer máximo cumple $d\\sin\\theta = \\lambda$, así que $\\theta = \\arcsin\\frac{${dn(lam, 4)}}{${dn(d, 3)}} \\approx ${dn(th, 4)}^\\circ$ (como en el experimento de Davisson y Germer).`],
        // verificación: suma de las ondas dispersadas por 200 filas; el primer máximo del patrón se busca por sección áurea
        verify: { kind: "value", tol: 1e-5, fn: () => {
          const lj = F.h / Math.sqrt(2 * F.me * K * F.e) * 1e9, I = t => { let c = 0, s = 0; for (let j = 0; j < 200; j++) { const ph = 2 * Math.PI * j * d * Math.sin(t) / lj; c += Math.cos(ph); s += Math.sin(ph); } return c * c + s * s; };
          const t0 = Math.asin(lj / d); return F.golden(t => -I(t), t0 - 0.001, t0 + 0.001) * 180 / Math.PI;
        } }
      };
    }
  };
  T["f3-incerteza-num"] = {
    type: "numeric", concepts: ["f3-incerteza"], difficulty: 2,
    generate(r) {
      const v = r.pick([{ n: "un electrón en una región del tamaño de un átomo", m: F.me, dx: 0.1, u: "nm", s: 1e-9 }, { n: "un electrón en un punto cuántico", m: F.me, dx: r.pick([2, 5, 10]), u: "nm", s: 1e-9 },
        { n: "un protón dentro de un núcleo", m: F.mp, dx: r.pick([2, 5, 8]), u: "fm", s: 1e-15 }, { n: "un neutrón dentro de un núcleo", m: 1.674927e-27, dx: r.pick([3, 6]), u: "fm", s: 1e-15 }]);
      const ask = r.pick(["dv", "K"]), dp = F.hbar / (2 * v.dx * v.s), dvv = dp / v.m, K = dp * dp / (2 * v.m) / F.e;
      const Kshow = v.u === "fm" ? K / 1e6 : K, Ku = v.u === "fm" ? "MeV" : "eV";
      return {
        prompt: `Para ${v.n}, con una incerteza en la posición de $\\Delta x = ${v.dx}$ ${v.u}, ¿${ask === "dv" ? "cuál es la mínima incerteza en la velocidad (m/s)" : `qué energía cinética mínima (${Ku}) implica, estimándola como $\\frac{(\\Delta p)^2}{2m}$`}? ($\\hbar = 1{,}055\\times10^{-34}$ J·s)`,
        answer: ask === "dv" ? dvv : Kshow,
        solution: [`[[f3-incerteza|Principio de incerteza]]: $\\Delta x\\,\\Delta p \\ge \\frac\\hbar2$, así que $\\Delta p \\ge \\frac{\\hbar}{2\\Delta x} \\approx ${nf(dp)}$ kg·m/s.`,
          ask === "dv" ? `$\\Delta v = \\frac{\\Delta p}{m} \\approx ${nf(dvv)}$ m/s.` : `$K \\approx \\frac{(\\Delta p)^2}{2m} \\approx ${nf(Kshow)}$ ${Ku}: la partícula no puede estar quieta si está confinada.`],
        // verificación: paquete gaussiano de ancho Δx (el de mínima incerteza); ⟨p²⟩ = ħ²∫|ψ′|² se integra con Simpson
        verify: { kind: "value", tol: 1e-6, fn: () => {
          const sg = v.dx, psi = x => Math.exp(-x * x / (4 * sg * sg)) / Math.pow(2 * Math.PI * sg * sg, 0.25), h = sg * 1e-4, dpsi = x => (psi(x + h) - psi(x - h)) / (2 * h);
          const p2 = F.hbar * F.hbar * F.simpson(x => dpsi(x) ** 2, -12 * sg, 12 * sg, 4000) / (v.s * v.s), dpn = Math.sqrt(p2);
          return ask === "dv" ? dpn / v.m : dpn * dpn / (2 * v.m) / F.e / (v.u === "fm" ? 1e6 : 1);
        } }
      };
    }
  };
  T["f3-paquete-num"] = {
    type: "numeric", concepts: ["f3-incerteza"], difficulty: 3,
    generate(r) {
      const sg = r.pick([0.1, 0.2, 0.5, 1, 2]), k0 = r.int(0, 30) / 2, ask = r.pick(["C", "p", "K"]);
      const C = Math.pow(2 * Math.PI * sg * sg, -0.25), Kav = F.k2e * (k0 * k0 + 1 / (4 * sg * sg));
      const ans = { C, p: k0, K: Kav }[ask];
      return {
        prompt: `Un electrón está en el estado $\\psi(x) = C\\,e^{i${dn(k0, 3)}x}\\,e^{-x^2/(4\\cdot${dn(sg, 2)}^2)}$, con $x$ en nm. ¿${{ C: "Cuánto vale la constante de normalización $C$ (en nm$^{-1/2}$), tomada real y positiva", p: "Cuánto vale $\\frac{\\langle p\\rangle}{\\hbar}$ (en nm⁻¹)", K: "Cuánto vale la energía cinética media (eV)" }[ask]}? ($\\frac{\\hbar^2}{2m_e} = 0{,}0381$ eV·nm²)`,
        answer: ans,
        solution: [`$|\\psi|^2 = C^2e^{-x^2/(2\\sigma^2)}$ es una gaussiana de desvío $\\sigma = ${dn(sg, 2)}$ nm: $\\int|\\psi|^2 = C^2\\sqrt{2\\pi}\\sigma = 1$ da $C = (2\\pi\\sigma^2)^{-1/4} \\approx ${dn(C, 4)}$ nm$^{-1/2}$.`,
          `El factor $e^{ik_0x}$ corre el momento: $\\langle p\\rangle = \\hbar k_0$, con $k_0 = ${dn(k0, 3)}$ nm⁻¹, y la gaussiana da $\\Delta p = \\frac{\\hbar}{2\\sigma}$ ([[f3-incerteza|paquete de mínima incerteza]]).`,
          `$\\langle K\\rangle = \\frac{\\langle p^2\\rangle}{2m} = \\frac{\\hbar^2}{2m}\\left(k_0^2 + \\frac{1}{4\\sigma^2}\\right) \\approx ${dn(Kav, 4)}$ eV.`],
        // verificación: integrales numéricas con ψ complejo y derivadas por diferencias finitas
        verify: { kind: "zero", tol: 1e-5, fn: a => {
          const cc = ask === "C" ? a : C, re = x => cc * Math.cos(k0 * x) * Math.exp(-x * x / (4 * sg * sg)), im = x => cc * Math.sin(k0 * x) * Math.exp(-x * x / (4 * sg * sg)), h = sg * 1e-4, L = 12 * sg;
          const d = f => x => (f(x + h) - f(x - h)) / (2 * h), norm = F.simpson(x => re(x) ** 2 + im(x) ** 2, -L, L, 6000);
          if (ask === "C") return [norm - 1];
          const pav = F.simpson(x => re(x) * d(im)(x) - im(x) * d(re)(x), -L, L, 6000) / norm, k2av = F.simpson(x => d(re)(x) ** 2 + d(im)(x) ** 2, -L, L, 6000) / norm;
          return [ask === "p" ? (pav - a) / (1 + k0) : F.k2e * k2av / a - 1];
        } }
      };
    }
  };
  T["f3-ondas-vf"] = {
    type: "tf", concepts: ["f3-de-broglie"], difficulty: 2,
    generate(r) {
      const K = r.int(1, 100), lam = (m, KeV) => F.h / Math.sqrt(2 * m * KeV * F.e);
      const S = [
        { s: `un electrón y un protón con la misma energía cinética ($${K}$ eV) tienen la misma longitud de onda de De Broglie`, fn: () => Math.abs(lam(F.me, K) / lam(F.mp, K) - 1) < 1e-6 },
        { s: `un electrón y un protón con la misma velocidad tienen la misma longitud de onda de De Broglie`, fn: () => Math.abs((F.h / (F.me * 1e5)) / (F.h / (F.mp * 1e5)) - 1) < 1e-6 },
        { s: `si un electrón de $${K}$ eV pasa a tener $${4 * K}$ eV, su longitud de onda de De Broglie se reduce a la mitad`, fn: () => Math.abs(lam(F.me, 4 * K) / lam(F.me, K) - 0.5) < 1e-6 },
        { s: `si un electrón de $${K}$ eV pasa a tener $${2 * K}$ eV, su longitud de onda de De Broglie se reduce a la mitad`, fn: () => Math.abs(lam(F.me, 2 * K) / lam(F.me, K) - 0.5) < 1e-6 },
        { s: `con la misma energía cinética ($${K}$ eV), el protón tiene una longitud de onda más corta que el electrón`, fn: () => lam(F.mp, K) < lam(F.me, K) }
      ];
      const q = r.pick(S), truth = q.fn();
      return {
        prompt: `<b>Verdadero o falso</b> (sin efectos relativistas): ${q.s}.`,
        answer: truth,
        explanation: `[[f3-de-broglie|De Broglie]]: $\\lambda = \\frac hp = \\frac{h}{mv} = \\frac{h}{\\sqrt{2mK}}$. A igual energía manda la masa (λ ∝ $\\frac{1}{\\sqrt m}$); a igual velocidad, λ ∝ $\\frac1m$; y λ ∝ $\\frac{1}{\\sqrt K}$.`,
        solution: [truth ? "Es verdadero." : "Es falso."],
        // verificación: longitudes de onda calculadas en SI
        verify: { kind: "truth", fn: q.fn }
      };
    }
  };

  const cards = {
    "f3-de-broglie": {
      title: "Ondas de materia: De Broglie", aliases: ["De Broglie", "longitud de onda de De Broglie", "ondas de materia", "onda de materia", "Davisson y Germer", "dualidad onda-partícula"], concepts: ["f3-de-broglie"],
      summary: "Toda partícula con momento p tiene asociada una onda de longitud λ = h/p. Para K ≪ mc², λ = h/√(2mK); un electrón de 100 eV tiene λ ≈ 0,12 nm, como la separación entre átomos.",
      def: [R`**Hipótesis de De Broglie** (1924): una partícula de momento $p$ se comporta como una onda de longitud $$\lambda = \frac hp,$$ y su frecuencia es $f = \frac Eh$. Es la misma relación que vale para los [[f3-compton|fotones]], ahora para partículas con masa.`,
        R`Para una partícula acelerada desde el reposo con una tensión $V$: $K = eV$ y, sin relatividad, $\lambda = \frac{h}{\sqrt{2meV}}$. En general, $pc = \sqrt{K^2 + 2Kmc^2}$.`,
        R`**Davisson y Germer** (1927) vieron difracción de electrones en un cristal de níquel: los máximos cumplían $d\sin\theta = n\lambda$ con la λ de De Broglie.`],
      idea: [R`Para objetos macroscópicos λ es ridículamente chica (una pelota de 0,1 kg a 10 m/s tiene $\lambda \sim 10^{-33}$ m), y por eso no vemos su comportamiento ondulatorio. Para electrones de pocos eV, λ es del tamaño de los átomos, y la difracción es inevitable: así funciona el microscopio electrónico.`],
      demo: [R`**Paso 1 (el fotón).** Para la luz, $E = hf$ y $E = pc$ (partícula sin masa), así que $p = \frac{hf}{c} = \frac h\lambda$.`,
        R`**Paso 2 (la hipótesis).** De Broglie propuso que $\lambda = \frac hp$ vale para cualquier partícula.`,
        R`**Paso 3 (partícula acelerada).** Con $K = \frac{p^2}{2m} = eV$, $p = \sqrt{2meV}$ y $\lambda = \frac{h}{\sqrt{2meV}}$. Relativistamente, $(K + mc^2)^2 = (pc)^2 + (mc^2)^2$ da $pc = \sqrt{K^2 + 2Kmc^2}$. $\blacksquare$`],
      examples: [{ q: R`Electrón acelerado con 100 V.`, steps: [R`$pc = \sqrt{2\cdot100\cdot511\,000} \approx 10\,110$ eV.`, R`$\lambda = \frac{1240}{10\,110}$ nm $\approx 0{,}123$ nm.`] }],
      see: ["f3-incerteza", "f3-compton", "f2b-difraccion"]
    },
    "f3-incerteza": {
      title: "Principio de incerteza y paquetes de onda", aliases: ["principio de incerteza", "principio de incertidumbre", "relación de incerteza", "Heisenberg", "paquete de mínima incerteza", "paquete gaussiano"], concepts: ["f3-incerteza"],
      summary: "Δx Δp ≥ ħ/2. Un paquete localizado es una superposición de ondas con muchos k: cuanto más angosto en x, más ancho en k. La gaussiana es el caso de igualdad.",
      def: [R`**Relación de incerteza de Heisenberg:** para cualquier estado, los desvíos estándar de la posición y del momento cumplen $$\Delta x\,\Delta p \ge \frac\hbar2.$$`,
        R`Un **paquete de ondas** $\psi(x) = \frac{1}{\sqrt{2\pi}}\int\phi(k)e^{ikx}dk$ superpone ondas planas con distintos $k$ ($p = \hbar k$). El paquete gaussiano $\psi = Ce^{ik_0x}e^{-x^2/4\sigma^2}$, con $C = (2\pi\sigma^2)^{-1/4}$, tiene $\Delta x = \sigma$, $\langle p\rangle = \hbar k_0$ y $\Delta p = \frac{\hbar}{2\sigma}$: alcanza la igualdad.`],
      idea: [R`No es un problema de los aparatos: un estado con posición muy definida **es** una suma de muchísimos momentos. Por eso una partícula confinada no puede estar quieta: si $\Delta x$ es chico, $\Delta p$ es grande, y la energía cinética media es al menos del orden de $\frac{\hbar^2}{8m(\Delta x)^2}$. Explica que la energía del fundamental del [[f3-pozo-infinito|pozo]] no sea cero y que los átomos no colapsen.`],
      demo: [R`**Paso 1 (gaussiana).** $|\psi|^2 = C^2e^{-x^2/2\sigma^2}$ es una normal de desvío $\sigma$: $\Delta x = \sigma$ y $\int|\psi|^2 = C^2\sqrt{2\pi}\sigma = 1$.`,
        R`**Paso 2 (momento medio).** $\psi' = \left(ik_0 - \frac{x}{2\sigma^2}\right)\psi$. Con $\langle p\rangle = -i\hbar\int\overline\psi\psi'$, el término $-\frac{x}{2\sigma^2}|\psi|^2$ es impar y se anula: $\langle p\rangle = \hbar k_0$.`,
        R`**Paso 3 (momento cuadrático).** $\langle p^2\rangle = \hbar^2\int|\psi'|^2 = \hbar^2\int\left(k_0^2 + \frac{x^2}{4\sigma^4}\right)|\psi|^2 = \hbar^2\left(k_0^2 + \frac{\sigma^2}{4\sigma^4}\right)$, usando $\langle x^2\rangle = \sigma^2$.`,
        R`**Paso 4.** $(\Delta p)^2 = \langle p^2\rangle - \langle p\rangle^2 = \frac{\hbar^2}{4\sigma^2}$, así que $\Delta x\,\Delta p = \sigma\frac{\hbar}{2\sigma} = \frac\hbar2$. $\blacksquare$`],
      examples: [{ q: R`Electrón con $\Delta x = 0{,}1$ nm. ¿$\Delta v$ mínima?`, steps: [R`$\Delta p = \frac{1{,}055\times10^{-34}}{2\times10^{-10}} \approx 5{,}3\times10^{-25}$ kg·m/s.`, R`$\Delta v \approx 5{,}8\times10^5$ m/s.`] }],
      see: ["f3-de-broglie", "f3-pozo-infinito", "c2-gauss-integral"]
    }
  };

  E.extendCourse("f104", {
    concepts: { "f3-de-broglie": { name: "Ondas de materia" }, "f3-incerteza": { name: "Incerteza y paquetes" } },
    templates: T,
    units: [{
      id: "f3-ondas-u", order: 4, program: "Unidad 4", title: "Ondas de materia e incerteza", icon: "volume-2",
      diagnostic: ["f3-debroglie-num", "f3-incerteza-num", "f3-paquete-num"],
      lessons: [
        { id: "f3-de-broglie", title: "Ondas de materia", templates: ["f3-debroglie-num", "f3-ondas-vf", "f3-davisson-num"], theory: ["f3-de-broglie"],
          intro: R`$\lambda = \frac hp$; con $K \ll mc^2$, $\lambda = \frac{h}{\sqrt{2mK}}$.` },
        { id: "f3-incerteza", title: "Incerteza y paquetes de onda", templates: ["f3-incerteza-num", "f3-paquete-num"], theory: ["f3-incerteza"],
          intro: R`$\Delta x\,\Delta p \ge \frac\hbar2$; el paquete gaussiano tiene $\Delta p = \frac{\hbar}{2\sigma}$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 5 · ECUACIÓN DE SCHRÖDINGER Y POZO INFINITO
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, F = E.f3, nf = F.nf;
  const T = {};
  const dn = (x, d = 3) => String(H.num(x, d)).replace(".", "{,}");
  const phi = (n, L) => x => Math.sqrt(2 / L) * Math.sin(n * Math.PI * x / L); // pozo en [0, L]
  const En = (n, L, k2 = F.k2e) => k2 * (n * Math.PI / L) ** 2;

  T["f3-pozo-num"] = {
    testN: 120, // el disparo barre energías: algo caro
    type: "numeric", concepts: ["f3-pozo-infinito"], difficulty: 2,
    generate(r) {
      const L = r.pick([0.2, 0.3, 0.5, 0.8, 1, 1.5, 2]), ask = r.pick(["E", "lam", "E"]), n = r.int(1, 4), m = r.int(1, 3);
      if (ask === "lam" && m >= n) return null;
      const lam = F.hc / (En(n, L) - En(m, L));
      return {
        prompt: ask === "E" ? `Un electrón está en un pozo infinito de $${dn(L, 2)}$ nm de ancho. ¿Cuánto vale la energía (eV) del nivel $n = ${n}$? ($\\frac{\\hbar^2}{2m_e} = 0{,}0381$ eV·nm²)`
          : `Un electrón en un pozo infinito de $${dn(L, 2)}$ nm pasa del nivel $n = ${n}$ al $n = ${m}$. ¿Qué longitud de onda (nm) tiene el fotón emitido? ($\\frac{\\hbar^2}{2m_e} = 0{,}0381$ eV·nm², $hc = 1240$ eV·nm)`,
        answer: ask === "E" ? En(n, L) : lam,
        solution: [`[[f3-pozo-infinito|Pozo infinito]]: $E_n = \\frac{\\hbar^2}{2m}\\left(\\frac{n\\pi}{L}\\right)^2$; con $L = ${dn(L, 2)}$ nm, $E_1 \\approx ${dn(En(1, L), 4)}$ eV y $E_n = n^2E_1$.`,
          ask === "E" ? `$E_${n} = ${n * n}E_1 \\approx ${dn(En(n, L), 4)}$ eV.` : `$\\Delta E = (${n * n} - ${m * m})E_1 \\approx ${dn(En(n, L) - En(m, L), 4)}$ eV y $\\lambda = \\frac{hc}{\\Delta E} \\approx ${dn(lam, 4)}$ nm.`],
        // verificación: método del disparo (RK4 + bisección) para la ecuación de Schrödinger en el pozo
        verify: { kind: "value", tol: 1e-5, fn: () => {
          const e = j => F.eigen(() => 0, 0, L, F.k2e, j, En(j, L) * 1.3 + 0.01, 60 + 30 * j);
          return ask === "E" ? e(n) : F.hc / (e(n) - e(m));
        } }
      };
    }
  };
  T["f3-pozo-prob-num"] = {
    type: "numeric", concepts: ["f3-pozo-infinito"], difficulty: 2,
    generate(r) {
      const n = r.int(1, 4), [a, b] = r.pick([[0, 0.25], [0, 1 / 3], [1 / 3, 2 / 3], [0.25, 0.75], [0, 0.1], [0.4, 0.6]]);
      const P = (b - a) - (Math.sin(2 * Math.PI * n * b) - Math.sin(2 * Math.PI * n * a)) / (2 * Math.PI * n);
      const fr = x => ({ 0: "0", 0.25: "L/4", [1 / 3]: "L/3", [2 / 3]: "2L/3", 0.75: "3L/4", 0.1: "L/10", 0.4: "0{,}4L", 0.6: "0{,}6L" }[x]);
      return {
        prompt: `Una partícula está en el estado $n = ${n}$ de un pozo infinito entre $x = 0$ y $x = L$. ¿Cuál es la probabilidad de encontrarla entre $x = ${fr(a)}$ y $x = ${fr(b)}$?`,
        answer: P,
        solution: [`$\\varphi_${n} = \\sqrt{\\frac2L}\\sin\\frac{${n}\\pi x}{L}$ ([[f3-pozo-infinito|pozo infinito]]) y la probabilidad es $\\int|\\varphi_${n}|^2dx$ ([[f3-schrodinger|interpretación de Born]]).`,
          `Con $\\sin^2u = \\frac{1 - \\cos2u}{2}$: $P = \\left[\\frac xL - \\frac{\\sin(2${n}\\pi x/L)}{2${n}\\pi}\\right]_{${fr(a)}}^{${fr(b)}} \\approx ${dn(P, 4)}$${n > 1 ? "" : ""}.`],
        // verificación: Simpson sobre |φ|²
        verify: { kind: "value", tol: 1e-8, fn: () => F.simpson(x => phi(n, 1)(x) ** 2, a, b, 2000) }
      };
    }
  };
  T["f3-superpos-num"] = {
    testN: 120,
    type: "numeric", concepts: ["f3-superposicion"], difficulty: 3,
    generate(r) {
      const L = r.pick([0.5, 1, 2]), [i, j] = r.pick([[1, 2], [1, 3], [2, 3], [1, 2]]), [ca, cb] = r.pick([[1, 1], [1, 2], [2, 1], [1, 3], [3, 1]]), ask = r.pick(["E", "P", "T", "x"]);
      const nn = ca * ca + cb * cb, Pa = ca * ca / nn, Eav = (ca * ca * En(i, L) + cb * cb * En(j, L)) / nn, Tp = F.h / F.e / (En(j, L) - En(i, L)) * 1e15; // fs
      const xij = (i + j) % 2 === 1 ? -8 * L * i * j / (Math.PI * Math.PI * (i * i - j * j) ** 2) * (1) : 0; // ⟨i|x|j⟩ en [0, L]
      const xav = L / 2 + 2 * ca * cb / nn * xij;
      if ((ask === "x" || ask === "T") && xij === 0) return null;
      return {
        prompt: `Un electrón en un pozo infinito de $${dn(L, 1)}$ nm (entre $x = 0$ y $x = L$) está en el estado $\\psi = A\\left(${ca === 1 ? "" : ca}\\varphi_${i} + ${cb === 1 ? "" : cb}\\varphi_${j}\\right)$, con $A > 0$ y las $\\varphi_n$ normalizadas. ¿${{ E: "Cuánto vale el valor medio de la energía (eV)", P: `Qué probabilidad hay de medir la energía $E_${i}$`, T: "Con qué período (fs) oscila el valor medio de la posición", x: "Cuánto vale $\\langle x\\rangle$ (nm) en $t = 0$" }[ask]}? ($\\frac{\\hbar^2}{2m_e} = 0{,}0381$ eV·nm², $h = 4{,}136\\times10^{-15}$ eV·s)`,
        answer: { E: Eav, P: Pa, T: Tp, x: xav }[ask],
        solution: [`Normalización: $A^2(${ca * ca} + ${cb * cb}) = 1$, así que $|c_${i}|^2 = \\frac{${ca * ca}}{${nn}}$ y $|c_${j}|^2 = \\frac{${cb * cb}}{${nn}}$ son las probabilidades de medir $E_${i}$ y $E_${j}$ ([[f3-superposicion|superposición]]).`,
          { E: `$\\langle E\\rangle = |c_${i}|^2E_${i} + |c_${j}|^2E_${j} \\approx ${dn(Eav, 4)}$ eV, con $E_n = n^2\\cdot${dn(En(1, L), 4)}$ eV.`,
            P: `$P(E_${i}) = \\frac{${ca * ca}}{${nn}} \\approx ${dn(Pa, 4)}$.`,
            T: `Cada término evoluciona con $e^{-iE_nt/\\hbar}$; en $|\\psi|^2$ queda un término cruzado que oscila con $\\omega = \\frac{E_${j} - E_${i}}{\\hbar}$. Período: $T = \\frac{h}{E_${j} - E_${i}} \\approx ${dn(Tp, 4)}$ fs.`,
            x: `$\\langle x\\rangle = \\frac L2 + 2c_${i}c_${j}\\langle${i}|x|${j}\\rangle$, con $\\langle${i}|x|${j}\\rangle = -\\frac{8L\\cdot${i * j}}{\\pi^2(${i * i} - ${j * j})^2} \\approx ${dn(xij, 4)}$ nm: $\\langle x\\rangle \\approx ${dn(xav, 4)}$ nm.` }[ask]],
        // verificación: ψ armado en una grilla; normalización, ⟨H⟩ con la derivada segunda por diferencias finitas,
        // ⟨x⟩ con Simpson, y el período viendo que ⟨x⟩(t) vuelve a su valor en t = T y cambia en T/2
        verify: { kind: "zero", tol: 1e-5, fn: a => {
          const A = 1 / Math.sqrt(nn), ps = x => A * (ca * phi(i, L)(x) + cb * phi(j, L)(x)), h = L * 1e-4;
          const norm = F.simpson(x => ps(x) ** 2, 0, L, 4000);
          if (ask === "P") return [F.simpson(x => ps(x) * phi(i, L)(x), 0, L, 4000) ** 2 - a];
          if (ask === "E") return [-F.k2e * F.simpson(x => ps(x) * (ps(x + h) - 2 * ps(x) + ps(x - h)) / (h * h), 0, L, 4000) / norm / a - 1];
          const xt = t => { const w1 = En(i, L) * F.e / F.hbar, w2 = En(j, L) * F.e / F.hbar; return F.simpson(x => { const re = A * (ca * phi(i, L)(x) * Math.cos(w1 * t) + cb * phi(j, L)(x) * Math.cos(w2 * t)), im = -A * (ca * phi(i, L)(x) * Math.sin(w1 * t) + cb * phi(j, L)(x) * Math.sin(w2 * t)); return x * (re * re + im * im); }, 0, L, 4000); };
          if (ask === "x") return [(xt(0) - a) / L];
          const t1 = a * 1e-15; return [(xt(t1) - xt(0)) / L, Math.abs(xt(t1 / 2) - xt(0)) > 1e-3 * L ? 0 : 1];
        } }
      };
    }
  };
  T["f3-kets-num"] = {
    type: "numeric", concepts: ["f3-superposicion"], difficulty: 2,
    generate(r) {
      // coeficientes complejos de la forma (a + bi)/2 sobre |1⟩, |2⟩, |3⟩
      const c = [[r.int(0, 2), r.int(-2, 2)], [r.int(-2, 2), r.int(0, 2)], [r.int(0, 2), r.int(-2, 2)]];
      const p = c.map(([x, y]) => x * x + y * y), N2 = p.reduce((s, v) => s + v, 0), ask = r.pick(["norma", "P", "E"]), k = r.int(1, 3);
      if (N2 === 0 || p.filter(v => v > 0).length < 2) return null;
      const Eav = p.reduce((s, v, i) => s + v * (i + 1) ** 2, 0) / N2;
      const cx = ([x, y]) => (y === 0 ? `${x}` : x === 0 ? `${y === 1 ? "" : y === -1 ? "-" : y}i` : `(${x} ${y < 0 ? "-" : "+"} ${Math.abs(y) === 1 ? "" : Math.abs(y)}i)`);
      const ket = c.map((z, i) => (z[0] === 0 && z[1] === 0 ? "" : `${cx(z)}|${i + 1}\\rangle`)).filter(Boolean).join(" + ").replace(/\+ -/g, "- ");
      if (ask === "P" && p[k - 1] === 0 && r.bool()) return null;
      return {
        prompt: `Una partícula en un pozo infinito está en el estado $|\\psi\\rangle = ${ket}$, donde $|n\\rangle$ son los autoestados normalizados ($E_n = n^2E_1$). ¿${{ norma: "Cuánto vale $\\langle\\psi|\\psi\\rangle$", P: `Qué probabilidad hay de medir $E_${k}$ (después de normalizar el estado)`, E: "Cuánto vale $\\frac{\\langle H\\rangle}{E_1}$ (después de normalizar)" }[ask]}?`,
        answer: { norma: N2, P: p[k - 1] / N2, E: Eav }[ask],
        solution: [`Como los $|n\\rangle$ son ortonormales, $\\langle\\psi|\\psi\\rangle = \\sum|c_n|^2 = ${p.join(" + ")} = ${N2}$ ([[f3-superposicion|kets y productos escalares]]).`,
          ask === "norma" ? `Para normalizarlo, se divide por $\\sqrt{${N2}}$.` : ask === "P" ? `$P(E_${k}) = \\frac{|c_${k}|^2}{\\langle\\psi|\\psi\\rangle} = \\frac{${p[k - 1]}}{${N2}}$.` : `$\\frac{\\langle H\\rangle}{E_1} = \\frac{\\sum|c_n|^2n^2}{\\sum|c_n|^2} = \\frac{${p.map((v, i) => `${v}\\cdot${(i + 1) ** 2}`).join(" + ")}}{${N2}} \\approx ${dn(Eav, 4)}$.`],
        // verificación: el estado se arma como función en [0, 1] (parte real e imaginaria) y se integra con Simpson; ⟨H⟩ con la derivada segunda numérica
        verify: { kind: "zero", tol: 1e-6, fn: a => {
          const re = x => c.reduce((s, z, i) => s + z[0] * phi(i + 1, 1)(x), 0), im = x => c.reduce((s, z, i) => s + z[1] * phi(i + 1, 1)(x), 0);
          const nrm = F.simpson(x => re(x) ** 2 + im(x) ** 2, 0, 1, 4000);
          if (ask === "norma") return [nrm - a];
          if (ask === "P") { const pr = F.simpson(x => re(x) * phi(k, 1)(x), 0, 1, 4000), pi = F.simpson(x => im(x) * phi(k, 1)(x), 0, 1, 4000); return [(pr * pr + pi * pi) / nrm - a]; }
          const h = 1e-4, d2 = f => x => (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
          return [-F.simpson(x => re(x) * d2(re)(x) + im(x) * d2(im)(x), 0, 1, 4000) / nrm / Math.PI ** 2 / a - 1];
        } }
      };
    }
  };
  T["f3-pozo-vf"] = {
    testN: 30, // cada afirmación resuelve varios niveles por disparo
    type: "tf", concepts: ["f3-pozo-infinito"], difficulty: 2,
    generate(r) {
      const L = r.pick([0.5, 1, 2]), S = [
        { s: `si el ancho del pozo se duplica, la energía del fundamental se reduce a la cuarta parte`, fn: () => Math.abs(F.eigen(() => 0, 0, 2 * L, F.k2e, 1, 2 * En(1, L)) / F.eigen(() => 0, 0, L, F.k2e, 1, 2 * En(1, L)) - 0.25) < 1e-4 },
        { s: `si el ancho del pozo se duplica, la energía del fundamental se reduce a la mitad`, fn: () => Math.abs(F.eigen(() => 0, 0, 2 * L, F.k2e, 1, 2 * En(1, L)) / F.eigen(() => 0, 0, L, F.k2e, 1, 2 * En(1, L)) - 0.5) < 1e-4 },
        { s: `en el estado $n = 2$, la probabilidad de encontrar la partícula en el centro del pozo es máxima`, fn: () => { const p = x => phi(2, L)(x) ** 2; return p(L / 2) >= p(L / 4) - 1e-12; } },
        { s: `un protón en el mismo pozo tiene niveles de energía más bajos que un electrón`, fn: () => F.eigen(() => 0, 0, L, F.k2e * F.me / F.mp, 1, 2 * En(1, L) * F.me / F.mp) < F.eigen(() => 0, 0, L, F.k2e, 1, 2 * En(1, L)) },
        { s: `la diferencia entre niveles consecutivos crece con $n$`, fn: () => { const e = j => F.eigen(() => 0, 0, L, F.k2e, j, 1.3 * En(3, L)); return e(3) - e(2) > e(2) - e(1); } }
      ];
      const q = r.pick(S), truth = q.fn();
      return {
        prompt: `Un electrón está en un pozo de potencial infinito de $${dn(L, 1)}$ nm. <b>Verdadero o falso:</b> ${q.s}.`,
        answer: truth,
        explanation: `[[f3-pozo-infinito|Pozo infinito]]: $E_n = \\frac{n^2\\pi^2\\hbar^2}{2mL^2}$, que es $\\propto\\frac{n^2}{mL^2}$; la separación $E_{n+1} - E_n \\propto 2n + 1$ crece; y en $n = 2$ hay un nodo justo en el centro.`,
        solution: [truth ? "Es verdadero." : "Es falso."],
        // verificación: niveles por el método del disparo y la densidad |φ|² evaluada
        verify: { kind: "truth", fn: q.fn }
      };
    }
  };

  const cards = {
    "f3-schrodinger": {
      title: "Ecuación de Schrödinger y función de onda", aliases: ["ecuación de Schrödinger", "función de onda", "interpretación de Born", "estado estacionario", "estados estacionarios", "normalización de la función de onda"], concepts: ["f3-pozo-infinito"],
      summary: "iħ ∂ψ/∂t = Ĥψ, con Ĥ = −(ħ²/2m)∂²/∂x² + V. |ψ|² es una densidad de probabilidad y ∫|ψ|² = 1. Los estados estacionarios φ_n cumplen Ĥφ_n = E_nφ_n y evolucionan con e^{−iE_nt/ħ}.",
      def: [R`El estado de una partícula es una **función de onda** $\psi(x, t)$ que cumple la **ecuación de Schrödinger** $$i\hbar\frac{\partial\psi}{\partial t} = -\frac{\hbar^2}{2m}\frac{\partial^2\psi}{\partial x^2} + V(x)\psi = \hat H\psi.$$`,
        R`**Born:** $|\psi(x, t)|^2dx$ es la probabilidad de encontrar la partícula entre $x$ y $x + dx$, así que $\int|\psi|^2dx = 1$ (normalización). Los observables son operadores: posición $x$, momento $\hat p = -i\hbar\frac{\partial}{\partial x}$, energía $\hat H$; el valor medio es $\langle A\rangle = \int\overline\psi\,\hat A\psi\,dx$.`,
        R`**Estados estacionarios:** si $\hat H\varphi_n = E_n\varphi_n$ (ecuación independiente del tiempo), $\psi = \varphi_ne^{-iE_nt/\hbar}$ resuelve la ecuación y $|\psi|^2$ no cambia en el tiempo.`],
      idea: [R`La ecuación es lineal: cualquier combinación de soluciones es solución. Toda la física cuántica de una partícula en una dimensión sale de resolver $-\frac{\hbar^2}{2m}\varphi'' + V\varphi = E\varphi$ con las condiciones de borde que correspondan: de ahí salen niveles discretos.`],
      demo: [R`**Paso 1 (onda plana).** Para una partícula libre, De Broglie dice $\lambda = \frac hp$ y $f = \frac Eh$: la onda $e^{i(kx - \omega t)}$ con $p = \hbar k$ y $E = \hbar\omega$.`,
        R`**Paso 2 (operadores).** Derivando la onda plana: $-i\hbar\partial_x$ da $\hbar k = p$, e $i\hbar\partial_t$ da $\hbar\omega = E$. La relación $E = \frac{p^2}{2m} + V$ se convierte en $i\hbar\partial_t\psi = -\frac{\hbar^2}{2m}\partial_x^2\psi + V\psi$.`,
        R`**Paso 3 (separación).** Probando $\psi = \varphi(x)e^{-iEt/\hbar}$: el lado izquierdo da $E\varphi e^{-iEt/\hbar}$, así que $\varphi$ cumple $\hat H\varphi = E\varphi$, y $|\psi|^2 = |\varphi|^2$ no depende de $t$. $\blacksquare$`],
      examples: [{ q: R`¿Es $\psi = \sqrt2\sin(\pi x)$ (en $[0, 1]$) normalizada?`, steps: [R`$\int_0^12\sin^2(\pi x)dx = 2\cdot\frac12 = 1$: sí.`] }],
      see: ["f3-pozo-infinito", "f3-superposicion", "f3-de-broglie"]
    },
    "f3-pozo-infinito": {
      title: "Pozo de potencial infinito", aliases: ["pozo infinito", "pozo de potencial infinito", "partícula en una caja", "energía del punto cero", "punto cuántico"], concepts: ["f3-pozo-infinito"],
      summary: "Entre 0 y L con paredes infinitas: φ_n = √(2/L) sen(nπx/L) y E_n = n²π²ħ²/(2mL²), n = 1, 2, … El fundamental tiene energía positiva por la incerteza.",
      def: [R`Una partícula de masa $m$ confinada en $0 < x < L$ con $V = 0$ adentro y paredes infinitas: $\varphi$ se anula en los bordes. Los estados estacionarios son $$\varphi_n(x) = \sqrt{\frac2L}\sin\frac{n\pi x}{L},\qquad E_n = \frac{\hbar^2}{2m}\left(\frac{n\pi}{L}\right)^2 = n^2E_1,$$ con $n = 1, 2, 3, \dots$ El estado $n$ tiene $n - 1$ nodos adentro.`],
      idea: [R`Es una cuerda vibrante: entran medias longitudes de onda enteras, $L = n\frac\lambda2$, y con $\lambda = \frac hp$ la energía queda cuantizada (como los [[f2b-ondas|armónicos]] de una cuerda).`,
        R`$E_1 > 0$: la partícula nunca está quieta. Es la [[f3-incerteza|incerteza]] en acción: $\Delta x \sim L$ obliga a $\Delta p \gtrsim \frac{\hbar}{L}$. Los puntos cuánticos de las pantallas cambian de color cambiando el tamaño $L$.`],
      demo: [R`**Paso 1 (adentro).** Con $V = 0$, $-\frac{\hbar^2}{2m}\varphi'' = E\varphi$, o sea $\varphi'' = -k^2\varphi$ con $k = \frac{\sqrt{2mE}}{\hbar}$. La solución general es $A\sin kx + B\cos kx$.`,
        R`**Paso 2 (bordes).** $\varphi(0) = 0$ obliga a $B = 0$. $\varphi(L) = A\sin kL = 0$ con $A \ne 0$ obliga a $kL = n\pi$.`,
        R`**Paso 3 (energías).** $E = \frac{\hbar^2k^2}{2m} = \frac{\hbar^2n^2\pi^2}{2mL^2}$. $n = 0$ daría $\varphi = 0$ y los negativos repiten los mismos estados.`,
        R`**Paso 4 (normalización).** $\int_0^LA^2\sin^2\frac{n\pi x}{L}dx = A^2\frac L2 = 1$, así que $A = \sqrt{\frac2L}$. $\blacksquare$`],
      examples: [{ q: R`Electrón en un pozo de 1 nm.`, steps: [R`$E_1 = 0{,}0381\cdot\pi^2 \approx 0{,}376$ eV; $E_2 \approx 1{,}50$ eV.`] }],
      see: ["f3-schrodinger", "f3-superposicion", "f3-incerteza"]
    },
    "f3-superposicion": {
      title: "Superposición, kets y evolución temporal", aliases: ["superposición de estados", "kets", "notación de Dirac", "valor medio de la energía", "evolución temporal"], concepts: ["f3-superposicion"],
      summary: "|ψ⟩ = Σ c_n|n⟩: al medir la energía se obtiene E_n con probabilidad |c_n|²/⟨ψ|ψ⟩. ⟨H⟩ = Σ|c_n|²E_n. Cada término gira con e^{−iE_nt/ħ}, y los valores medios oscilan con las diferencias de energía.",
      def: [R`En notación de Dirac, un estado es un **ket** $|\psi\rangle$ y los autoestados de la energía forman una base ortonormal: $\langle m|n\rangle = \delta_{mn}$. Todo estado es $|\psi\rangle = \sum c_n|n\rangle$, con $c_n = \langle n|\psi\rangle$ y $\langle\psi|\psi\rangle = \sum|c_n|^2$ ([[al-pi-complejo|producto interno complejo]]).`,
        R`**Medición:** si el estado está normalizado, se obtiene $E_n$ con probabilidad $|c_n|^2$, y $\langle H\rangle = \sum|c_n|^2E_n$. **Evolución:** $|\psi(t)\rangle = \sum c_ne^{-iE_nt/\hbar}|n\rangle$.`],
      idea: [R`Una superposición **no** es un estado de energía definida, aunque su valor medio esté entre los dos: si se mide, sale $E_1$ o $E_2$, nunca el promedio. Y como los términos giran a distinto ritmo, la densidad $|\psi|^2$ se mueve: en el pozo, $\langle x\rangle$ va y viene con período $\frac{h}{E_2 - E_1}$.`],
      demo: [R`**Paso 1 (norma).** $\langle\psi|\psi\rangle = \sum_{m,n}\overline{c_m}c_n\langle m|n\rangle = \sum_n|c_n|^2$, porque solo sobreviven los términos con $m = n$.`,
        R`**Paso 2 (valor medio).** $\hat H|\psi\rangle = \sum c_nE_n|n\rangle$, así que $\langle\psi|\hat H|\psi\rangle = \sum|c_n|^2E_n$.`,
        R`**Paso 3 (evolución).** Cada $|n\rangle e^{-iE_nt/\hbar}$ cumple la [[f3-schrodinger|ecuación de Schrödinger]], y por linealidad también la suma, que en $t = 0$ vale $|\psi\rangle$.`,
        R`**Paso 4 (oscilación).** Con dos términos reales $\varphi_1$, $\varphi_2$: $|\psi|^2 = c_1^2\varphi_1^2 + c_2^2\varphi_2^2 + 2c_1c_2\varphi_1\varphi_2\cos\frac{(E_2 - E_1)t}{\hbar}$. El último término hace oscilar $\langle x\rangle$ con período $T = \frac{2\pi\hbar}{E_2 - E_1} = \frac{h}{E_2 - E_1}$. $\blacksquare$`],
      examples: [{ q: R`$|\psi\rangle = |1\rangle + i|2\rangle$ en el pozo.`, steps: [R`$\langle\psi|\psi\rangle = 1 + 1 = 2$; normalizado, cada energía tiene probabilidad $\frac12$.`, R`$\langle H\rangle = \frac{E_1 + 4E_1}{2} = 2{,}5E_1$.`] }],
      see: ["f3-schrodinger", "f3-pozo-infinito", "al-pi-complejo"]
    }
  };

  E.extendCourse("f104", {
    concepts: { "f3-pozo-infinito": { name: "Pozo infinito" }, "f3-superposicion": { name: "Superposición y evolución" } },
    templates: T,
    units: [{
      id: "f3-schrodinger-u", order: 5, program: "Unidad 5", title: "Ecuación de Schrödinger y pozo infinito", icon: "grid-3x3",
      diagnostic: ["f3-pozo-num", "f3-pozo-prob-num", "f3-kets-num"],
      lessons: [
        { id: "f3-pozo-infinito", title: "Pozo infinito", templates: ["f3-pozo-num", "f3-pozo-prob-num", "f3-pozo-vf"], theory: ["f3-schrodinger", "f3-pozo-infinito"],
          intro: R`$\varphi_n = \sqrt{\frac2L}\sin\frac{n\pi x}{L}$, $E_n = n^2\frac{\pi^2\hbar^2}{2mL^2}$.` },
        { id: "f3-superposicion", title: "Superposiciones y kets", templates: ["f3-kets-num", "f3-superpos-num"], theory: ["f3-superposicion"],
          intro: R`$|\psi\rangle = \sum c_n|n\rangle$: $P(E_n) = |c_n|^2$, $\langle H\rangle = \sum|c_n|^2E_n$, y cada término gira con $e^{-iE_nt/\hbar}$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 6 · OSCILADOR ARMÓNICO, ESCALÓN, BARRERA Y POZO FINITO
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, F = E.f3, nf = F.nf;
  const T = {};
  const dn = (x, d = 3) => String(H.num(x, d)).replace(".", "{,}");
  // transmisión y reflexión de una onda que viene de la izquierda: se integra ψ″ = (V − E)ψ/κ (ψ complejo, RK4)
  // desde la derecha, donde solo hay onda transmitida e^{ikx}, hasta la izquierda, y ahí se separa en incidente y reflejada.
  // `cuts` son los puntos donde V salta: se integra por tramos para no cruzar una discontinuidad dentro de un paso.
  F.transmit = (V, Ev, xL, xR, kap, cuts = [], n = 4000) => {
    const kR = Math.sqrt((Ev - V(xR + 1e-12)) / kap), kL = Math.sqrt((Ev - V(xL - 1e-12)) / kap);
    let y = [Math.cos(kR * xR), Math.sin(kR * xR), -kR * Math.sin(kR * xR), kR * Math.cos(kR * xR)];
    const pts = [xR, ...cuts.slice().sort((a, b) => b - a), xL];
    for (let s = 0; s < pts.length - 1; s++) {
      const a = pts[s], b = pts[s + 1], m = Math.max(50, Math.round(n * (a - b) / (xR - xL))), h = (b - a) / m, mid = (a + b) / 2, Vs = V(mid);
      const f = yy => [yy[2], yy[3], (Vs - Ev) * yy[0] / kap, (Vs - Ev) * yy[1] / kap];
      for (let i = 0; i < m; i++) { const k1 = f(y), k2 = f(y.map((v, j) => v + h / 2 * k1[j])), k3 = f(y.map((v, j) => v + h / 2 * k2[j])), k4 = f(y.map((v, j) => v + h * k3[j])); y = y.map((v, j) => v + h / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])); }
    }
    // ψ = A e^{ikx} + B e^{−ikx}: A = (ψ + ψ′/(ik))/2 · e^{−ikx}
    const [pr, pi, dr, di] = y, qr = di / kL, qi = -dr / kL; // ψ′/(ik) = −iψ′/k
    const Ar = (pr + qr) / 2, Ai = (pi + qi) / 2, Br = (pr - qr) / 2, Bi = (pi - qi) / 2, A2 = Ar * Ar + Ai * Ai;
    return { T: kR / kL / A2, R: (Br * Br + Bi * Bi) / A2 };
  };
  const MOL = [{ n: "HCl", k: 516, mu: 1.627e-27 }, { n: "CO", k: 1902, mu: 1.139e-26 }, { n: "H₂", k: 575, mu: 8.37e-28 }, { n: "NO", k: 1595, mu: 1.240e-26 }, { n: "HF", k: 966, mu: 1.589e-27 }];
  // oscilador adimensional: −ψ″ + ξ²ψ = εψ, autovalores por disparo en [−7, 7]
  const oscEps = j => F.eigen(x => x * x, -7, 7, 1, j, 2 * j + 1.5, 120 * j);

  T["f3-oscilador-num"] = {
    testN: 60, // autovalores por disparo
    type: "numeric", concepts: ["f3-oscilador"], difficulty: 2,
    generate(r) {
      const M = r.pick(MOL), ask = r.pick(["E0", "En", "lam"]), n = r.int(1, 3), w = Math.sqrt(M.k / M.mu), hw = F.hbar * w / F.e;
      const ans = { E0: hw / 2, En: (n + 0.5) * hw, lam: F.hc / hw / 1000 }[ask];
      return {
        prompt: `La vibración de la molécula de ${M.n} se modela como un oscilador armónico con constante $k = ${M.k}$ N/m y masa reducida $\\mu = ${nf(M.mu, 4)}$ kg. ¿${{ E0: "Cuánto vale la energía del punto cero (eV)", En: `Cuánto vale la energía (eV) del nivel $n = ${n}$`, lam: "Qué longitud de onda (μm) tiene el fotón que emite al bajar un nivel" }[ask]}? ($\\hbar = 1{,}0546\\times10^{-34}$ J·s, $hc = 1240$ eV·nm)`,
        answer: ans,
        solution: [`$\\omega = \\sqrt{\\frac k\\mu} \\approx ${nf(w, 4)}$ rad/s y $\\hbar\\omega \\approx ${dn(hw, 4)}$ eV.`,
          `[[f3-oscilador|Oscilador cuántico]]: $E_n = \\left(n + \\frac12\\right)\\hbar\\omega$, con niveles equiespaciados.`,
          { E0: `$E_0 = \\frac12\\hbar\\omega \\approx ${dn(ans, 4)}$ eV: aun en el fundamental, la molécula vibra.`, En: `$E_${n} = ${n}{,}5\\,\\hbar\\omega \\approx ${dn(ans, 4)}$ eV.`, lam: `Todo salto de un nivel emite $\\hbar\\omega$: $\\lambda = \\frac{hc}{\\hbar\\omega} \\approx ${dn(ans, 4)}$ μm (infrarrojo).` }[ask]],
        // verificación: autovalores del oscilador en unidades adimensionales por el método del disparo (E = ε ħω/2)
        verify: { kind: "value", tol: 1e-4, fn: () => { const e = j => oscEps(j) * hw / 2; return { E0: e(1), En: e(n + 1), lam: F.hc / (e(2) - e(1)) / 1000 }[ask]; } }
      };
    }
  };
  T["f3-osc-incerteza-num"] = {
    type: "numeric", concepts: ["f3-oscilador"], difficulty: 2,
    generate(r) {
      const M = r.pick(MOL), ask = r.pick(["dx", "dp", "prod"]), w = Math.sqrt(M.k / M.mu), dx = Math.sqrt(F.hbar / (2 * M.mu * w)), dp = Math.sqrt(M.mu * F.hbar * w / 2);
      return {
        prompt: `Para la molécula de ${M.n} modelada como un oscilador armónico ($k = ${M.k}$ N/m, $\\mu = ${nf(M.mu, 4)}$ kg) en su estado fundamental, ¿${{ dx: "cuánto vale la incerteza $\\Delta x$ en la separación de los átomos (pm)", dp: "cuánto vale $\\Delta p$ (en $10^{-24}$ kg·m/s)", prod: "cuánto vale $\\frac{\\Delta x\\,\\Delta p}{\\hbar}$" }[ask]}? ($\\hbar = 1{,}0546\\times10^{-34}$ J·s)`,
        answer: { dx: dx * 1e12, dp: dp * 1e24, prod: 0.5 }[ask],
        solution: [`El fundamental es la gaussiana $\\varphi_0 \\propto e^{-x^2/(2x_0^2)}$ con $x_0 = \\sqrt{\\frac{\\hbar}{\\mu\\omega}}$ ([[f3-oscilador|oscilador cuántico]]).`,
          `$\\Delta x = \\frac{x_0}{\\sqrt2} = \\sqrt{\\frac{\\hbar}{2\\mu\\omega}} \\approx ${dn(dx * 1e12, 4)}$ pm y $\\Delta p = \\frac{\\hbar}{2\\Delta x} \\approx ${dn(dp * 1e24, 4)}\\times10^{-24}$ kg·m/s: el producto es justo $\\frac\\hbar2$, el mínimo de [[f3-incerteza|Heisenberg]].`],
        // verificación: ⟨x²⟩ y ⟨p²⟩ = ħ²∫|φ′|² con Simpson y derivadas numéricas sobre la gaussiana normalizada numéricamente
        verify: { kind: "value", tol: 1e-6, fn: () => {
          const x0 = Math.sqrt(F.hbar / (M.mu * w)), g = u => Math.exp(-u * u / 2), L = 10, h = 1e-4;
          const N = F.simpson(u => g(u) ** 2, -L, L, 4000), x2 = F.simpson(u => u * u * g(u) ** 2, -L, L, 4000) / N, d2 = F.simpson(u => ((g(u + h) - g(u - h)) / (2 * h)) ** 2, -L, L, 4000) / N;
          const DX = Math.sqrt(x2) * x0, DP = F.hbar * Math.sqrt(d2) / x0;
          return { dx: DX * 1e12, dp: DP * 1e24, prod: DX * DP / F.hbar }[ask];
        } }
      };
    }
  };
  T["f3-escalon-num"] = {
    type: "numeric", concepts: ["f3-barrera"], difficulty: 2,
    generate(r) {
      const V0 = r.int(2, 20), above = r.bool(), Ev = above ? Math.round(V0 * r.pick([1.2, 1.5, 2, 3, 5]) * 10) / 10 : Math.round(V0 * r.pick([0.2, 0.5, 0.8, 0.9]) * 10) / 10;
      const ask = above ? r.pick(["R", "T"]) : "d";
      const k1 = Math.sqrt(Ev / F.k2e), k2 = above ? Math.sqrt((Ev - V0) / F.k2e) : 0, Rr = ((k1 - k2) / (k1 + k2)) ** 2, d = Math.sqrt(F.k2e / (V0 - Ev || 1));
      return {
        prompt: `Un electrón de $${dn(Ev, 3)}$ eV viaja hacia la derecha y llega a un escalón de potencial de $${V0}$ eV en $x = 0$. ${ask === "d" ? "¿A qué distancia (nm) del escalón la densidad de probabilidad cae en un factor $e^2$ respecto de su valor en el borde?" : `¿Qué probabilidad hay de que ${ask === "R" ? "se refleje" : "pase"}?`} ($\\frac{\\hbar^2}{2m_e} = 0{,}0381$ eV·nm²)`,
        answer: { R: Rr, T: 1 - Rr, d }[ask],
        solution: ask === "d"
          ? [`Con $E < V_0$, del otro lado del [[f3-barrera|escalón]] $\\psi \\propto e^{-\\kappa x}$ con $\\kappa = \\sqrt{\\frac{2m(V_0 - E)}{\\hbar^2}}$: la onda penetra aunque clásicamente esté prohibido.`, `$|\\psi|^2 \\propto e^{-2\\kappa x}$ cae en $e^2$ a la **longitud de penetración** $\\delta = \\frac1\\kappa = \\sqrt{\\frac{0{,}0381}{${dn(V0 - Ev, 3)}}} \\approx ${dn(d, 4)}$ nm.`]
          : [`Con $E > V_0$: $k_1 = \\sqrt{\\frac{E}{0{,}0381}} \\approx ${dn(k1, 4)}$ nm⁻¹ y $k_2 = \\sqrt{\\frac{E - V_0}{0{,}0381}} \\approx ${dn(k2, 4)}$ nm⁻¹ ([[f3-barrera|escalón de potencial]]).`, `Pegando $\\psi$ y $\\psi'$ en $x = 0$: $R = \\left(\\frac{k_1 - k_2}{k_1 + k_2}\\right)^2 \\approx ${dn(Rr, 4)}$ y $T = 1 - R \\approx ${dn(1 - Rr, 4)}$. Clásicamente pasaría siempre.`],
        // verificación: ecuación de Schrödinger integrada numéricamente (desde la derecha, por tramos); para δ, se integra
        // hacia el escalón desde adentro de la zona prohibida, donde solo sobrevive la solución que decae, y se mide su caída
        verify: { kind: "zero", tol: 1e-5, fn: a => {
          if (ask !== "d") { const t = F.transmit(x => (x > 0 ? V0 : 0), Ev, -2, 2, F.k2e, [0], 8000); return [(ask === "R" ? t.R : t.T) - a, t.R + t.T - 1]; }
          const X = 30 * d, m = 20000, h = -X / m, kk = (V0 - Ev) / F.k2e; let y = [1e-30, 0], x = X; const pts = [];
          for (let i = 0; i < m; i++) { const f = yy => [yy[1], kk * yy[0]], k1 = f(y), k2 = f([y[0] + h / 2 * k1[0], y[1] + h / 2 * k1[1]]), k3 = f([y[0] + h / 2 * k2[0], y[1] + h / 2 * k2[1]]), k4 = f([y[0] + h * k3[0], y[1] + h * k3[1]]); y = [y[0] + h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), y[1] + h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])]; x += h; pts.push([x, y[0]]); }
          const at = xx => { const j = (X - xx) / -h - 1, j0 = Math.max(0, Math.min(pts.length - 2, Math.floor(j))), t = j - j0; return pts[j0][1] * (1 - t) + pts[j0 + 1][1] * t; };
          return [Math.log(at(0) / at(a)) / 1 - 1];
        } }
      };
    }
  };
  T["f3-tunel-num"] = {
    type: "numeric", concepts: ["f3-barrera"], difficulty: 3,
    generate(r) {
      const V0 = r.int(3, 12), Ev = Math.round(V0 * r.pick([0.2, 0.4, 0.5, 0.6, 0.8]) * 10) / 10, a = r.pick([0.1, 0.2, 0.3, 0.5, 0.8]);
      const kap = Math.sqrt((V0 - Ev) / F.k2e), Tt = 1 / (1 + V0 * V0 * Math.sinh(kap * a) ** 2 / (4 * Ev * (V0 - Ev)));
      if (Tt < 1e-6) return null;
      return {
        prompt: `Un electrón de $${dn(Ev, 3)}$ eV incide sobre una barrera de $${V0}$ eV de alto y $${dn(a, 2)}$ nm de ancho. ¿Qué probabilidad (en %) tiene de atravesarla? ($\\frac{\\hbar^2}{2m_e} = 0{,}0381$ eV·nm²)`,
        answer: Tt * 100,
        solution: [`Adentro de la barrera $\\psi$ es combinación de $e^{\\pm\\kappa x}$ con $\\kappa = \\sqrt{\\frac{V_0 - E}{0{,}0381}} \\approx ${dn(kap, 4)}$ nm⁻¹, y $\\kappa a \\approx ${dn(kap * a, 3)}$ ([[f3-barrera|efecto túnel]]).`,
          `Pegando $\\psi$ y $\\psi'$ en los dos bordes: $T = \\left[1 + \\frac{V_0^2\\sinh^2(\\kappa a)}{4E(V_0 - E)}\\right]^{-1} \\approx ${nf(Tt, 4)}$, o sea $\\approx ${nf(Tt * 100, 4)}$ %.`,
          `${kap * a > 1 ? `Como $\\kappa a > 1$, vale $T \\approx 16\\frac EV\\left(1 - \\frac EV\\right)e^{-2\\kappa a}$: crece muy rápido al achicar la barrera.` : `La barrera es delgada ($\\kappa a < 1$), así que la aproximación exponencial no sirve.`}`],
        // verificación: integración numérica de la ecuación de Schrödinger a través de la barrera
        verify: { kind: "value", tol: 1e-5, fn: () => F.transmit(x => (x > 0 && x < a ? V0 : 0), Ev, -1, a + 1, F.k2e, [0, a], 8000).T * 100 }
      };
    }
  };
  T["f3-tunel-vf"] = {
    type: "tf", concepts: ["f3-barrera"], difficulty: 2,
    generate(r) {
      const V0 = r.int(4, 10), Ev = V0 / 2, a = r.pick([0.2, 0.3, 0.4]);
      const Tn = (e, w, kap = F.k2e) => F.transmit(x => (x > 0 && x < w ? V0 : 0), e, -1, w + 1, kap, [0, w], 6000).T;
      const S = [
        { s: `si el ancho de la barrera se duplica, la probabilidad de atravesarla se reduce a la mitad`, fn: () => Math.abs(Tn(Ev, 2 * a) / Tn(Ev, a) - 0.5) < 0.01 },
        { s: `si el ancho de la barrera se duplica, la probabilidad de atravesarla se reduce a menos de la mitad`, fn: () => Tn(Ev, 2 * a) / Tn(Ev, a) < 0.5 },
        { s: `un protón con la misma energía atraviesa la barrera con más facilidad que el electrón`, fn: () => Tn(Ev, a, F.k2e * F.me / F.mp) > Tn(Ev, a) },
        { s: `si la energía del electrón sube (sin pasar el alto de la barrera), la probabilidad de atravesarla aumenta`, fn: () => Tn(0.8 * V0, a) > Tn(Ev, a) },
        { s: `la probabilidad de reflejarse más la de atravesarla da 1`, fn: () => { const t = F.transmit(x => (x > 0 && x < a ? V0 : 0), Ev, -1, a + 1, F.k2e, [0, a], 6000); return Math.abs(t.T + t.R - 1) < 1e-6; } }
      ];
      const q = r.pick(S), truth = q.fn();
      return {
        prompt: `Un electrón de $${dn(Ev, 2)}$ eV incide sobre una barrera de $${V0}$ eV y $${dn(a, 1)}$ nm de ancho. <b>Verdadero o falso:</b> ${q.s}.`,
        answer: truth,
        explanation: `En el [[f3-barrera|efecto túnel]], $T \\approx 16\\frac EV\\left(1 - \\frac EV\\right)e^{-2\\kappa a}$ con $\\kappa = \\frac{\\sqrt{2m(V_0 - E)}}{\\hbar}$: depende **exponencialmente** del ancho y de $\\sqrt m$, y crece con $E$. Además, la probabilidad se conserva: $R + T = 1$.`,
        solution: [truth ? "Es verdadero." : "Es falso."],
        // verificación: transmisión calculada integrando la ecuación de Schrödinger
        verify: { kind: "truth", fn: q.fn }
      };
    }
  };
  T["f3-pozo-finito-num"] = {
    type: "numeric", concepts: ["f3-pozo-finito"], difficulty: 3,
    generate(r) {
      const V0 = r.int(1, 30), L = r.pick([0.2, 0.3, 0.5, 0.8, 1, 1.5]), z = L * Math.sqrt(V0 / F.k2e) / Math.PI;
      if (Math.abs(z - Math.round(z)) < 0.12) return null;
      const N = Math.ceil(z);
      return {
        prompt: `Un electrón está en un pozo finito de $${dn(L, 2)}$ nm de ancho y $${V0}$ eV de profundidad. ¿Cuántos estados ligados tiene? ($\\frac{\\hbar^2}{2m_e} = 0{,}0381$ eV·nm²)`,
        answer: N,
        solution: [`En el [[f3-pozo-finito|pozo finito]] siempre hay al menos un estado ligado, y aparece uno nuevo cada vez que $\\frac{L}{\\pi}\\sqrt{\\frac{2mV_0}{\\hbar^2}}$ pasa un entero.`,
          `Acá $\\frac{L}{\\pi}\\sqrt{\\frac{V_0}{0{,}0381}} \\approx ${dn(z, 4)}$, así que hay $${N}$ estados ligados.`],
        // verificación: teorema de oscilación de Sturm. En E = V₀ la solución que viene de la izquierda es plana afuera;
        // se integra a través del pozo contando nodos, y afuera sigue en línea recta (un nodo más si apunta hacia el eje)
        verify: { kind: "value", tol: 1e-9, fn: () => {
          const q = V0 / F.k2e, m = 20000, h = L / m; let y = [1, 0], cnt = 0;
          for (let i = 0; i < m; i++) { const f = yy => [yy[1], -q * yy[0]], k1 = f(y), k2 = f([y[0] + h / 2 * k1[0], y[1] + h / 2 * k1[1]]), k3 = f([y[0] + h / 2 * k2[0], y[1] + h / 2 * k2[1]]), k4 = f([y[0] + h * k3[0], y[1] + h * k3[1]]); const yn = [y[0] + h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), y[1] + h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])]; if ((yn[0] < 0) !== (y[0] < 0)) cnt++; y = yn; }
          return cnt + (y[0] * y[1] < 0 ? 1 : 0);
        } }
      };
    }
  };

  const cards = {
    "f3-oscilador": {
      title: "Oscilador armónico cuántico", aliases: ["oscilador armónico cuántico", "oscilador cuántico", "energía de punto cero", "vibración molecular"], concepts: ["f3-oscilador"],
      summary: "Con V = ½mω²x²: E_n = (n + ½)ħω, niveles equiespaciados. El fundamental es una gaussiana con Δx = √(ħ/2mω) y Δx Δp = ħ/2.",
      def: [R`Para $V(x) = \frac12m\omega^2x^2$, la ecuación de Schrödinger tiene solución normalizable solo si $$E_n = \left(n + \frac12\right)\hbar\omega,\quad n = 0, 1, 2, \dots$$ El fundamental es $\varphi_0(x) = \left(\frac{m\omega}{\pi\hbar}\right)^{1/4}e^{-m\omega x^2/2\hbar}$, con $\Delta x = \sqrt{\frac{\hbar}{2m\omega}}$ y $\Delta p = \sqrt{\frac{m\hbar\omega}{2}}$.`],
      idea: [R`A diferencia del [[f3-pozo-infinito|pozo]], los niveles están igualmente espaciados: por eso una molécula que vibra emite y absorbe siempre la misma frecuencia (las bandas del infrarrojo). La energía del punto cero $\frac12\hbar\omega$ es la [[f3-incerteza|incerteza]] otra vez: el fundamental es justo el estado de mínima incerteza.`,
        R`Casi cualquier sistema cerca de un mínimo de energía es un oscilador ([[f1-estabilidad|pequeñas oscilaciones]]), así que este resultado aparece en todos lados: moléculas, sólidos, el campo electromagnético.`],
      demo: [R`**Paso 1 (variable adimensional).** Con $\xi = \frac{x}{x_0}$ y $x_0 = \sqrt{\frac{\hbar}{m\omega}}$, la ecuación queda $-\varphi'' + \xi^2\varphi = \varepsilon\varphi$ con $\varepsilon = \frac{2E}{\hbar\omega}$.`,
        R`**Paso 2 (el fundamental).** Probamos $\varphi = e^{-\xi^2/2}$: $\varphi'' = (\xi^2 - 1)\varphi$, así que $-\varphi'' + \xi^2\varphi = \varphi$: es solución con $\varepsilon = 1$, o sea $E_0 = \frac12\hbar\omega$.`,
        R`**Paso 3 (los demás).** Probando $\varphi = H(\xi)e^{-\xi^2/2}$ queda $H'' - 2\xi H' + (\varepsilon - 1)H = 0$. Una serie de potencias para $H$ solo da una función que decae si se corta en un polinomio de grado $n$, y eso pasa cuando $\varepsilon = 2n + 1$: $E_n = \left(n + \frac12\right)\hbar\omega$.`,
        R`**Paso 4 (incertezas).** $|\varphi_0|^2 \propto e^{-x^2/x_0^2}$ es una normal con varianza $\frac{x_0^2}{2}$: $\Delta x = \frac{x_0}{\sqrt2}$. Es un [[f3-incerteza|paquete gaussiano]], así que $\Delta p = \frac{\hbar}{2\Delta x}$. $\blacksquare$`],
      examples: [{ q: R`HCl: $k = 516$ N/m, $\mu = 1{,}63\times10^{-27}$ kg.`, steps: [R`$\omega \approx 5{,}63\times10^{14}$ rad/s, $\hbar\omega \approx 0{,}37$ eV.`, R`$\lambda = \frac{1240}{0{,}37}$ nm $\approx 3{,}35$ μm.`] }],
      see: ["f3-incerteza", "f3-pozo-infinito", "f1-mas"]
    },
    "f3-barrera": {
      title: "Escalón, barrera y efecto túnel", aliases: ["efecto túnel", "barrera de potencial", "escalón de potencial", "longitud de penetración"], concepts: ["f3-barrera"],
      summary: "En un escalón con E > V₀ hay reflexión aunque clásicamente no la haya: R = ((k₁ − k₂)/(k₁ + k₂))². Con E < V₀ la onda penetra una distancia 1/κ, y una barrera finita se atraviesa con T ≈ 16(E/V)(1 − E/V)e^{−2κa}.",
      def: [R`**Escalón** ($V = V_0$ para $x > 0$). Si $E > V_0$: $R = \left(\frac{k_1 - k_2}{k_1 + k_2}\right)^2$ y $T = 1 - R$, con $k = \frac{\sqrt{2m(E - V)}}{\hbar}$. Si $E < V_0$: se refleja todo, pero del otro lado $\psi \propto e^{-\kappa x}$, con $\kappa = \frac{\sqrt{2m(V_0 - E)}}{\hbar}$ y **longitud de penetración** $\frac1\kappa$.`,
        R`**Barrera** de alto $V_0$ y ancho $a$, con $E < V_0$: $$T = \left[1 + \frac{V_0^2\sinh^2(\kappa a)}{4E(V_0 - E)}\right]^{-1} \approx 16\frac{E}{V_0}\left(1 - \frac{E}{V_0}\right)e^{-2\kappa a}\ \text{ si } \kappa a \gg 1.$$ Es el **efecto túnel**.`],
      idea: [R`Una partícula clásica sin energía suficiente rebota siempre. La onda, en cambio, entra un poco en la zona prohibida, y si la barrera es angosta llega al otro lado con amplitud no nula. Por el factor $e^{-2\kappa a}$, $T$ es muy sensible al ancho: así funcionan el microscopio de efecto túnel, el decaimiento alfa y las memorias flash.`],
      demo: [R`**Paso 1 (escalón, E > V₀).** A la izquierda $\psi = e^{ik_1x} + Be^{-ik_1x}$, a la derecha $\psi = Ce^{ik_2x}$. Continuidad de $\psi$ y $\psi'$ en 0: $1 + B = C$ e $ik_1(1 - B) = ik_2C$.`,
        R`**Paso 2.** Despejando, $B = \frac{k_1 - k_2}{k_1 + k_2}$ y $R = |B|^2$. La corriente de probabilidad es proporcional a $k|\psi|^2$, así que $T = \frac{k_2}{k_1}|C|^2 = 1 - R$.`,
        R`**Paso 3 (penetración).** Si $E < V_0$, a la derecha $\psi'' = \kappa^2\psi$; la solución que no explota es $e^{-\kappa x}$, y $|\psi|^2 \propto e^{-2\kappa x}$.`,
        R`**Paso 4 (barrera ancha).** En la barrera, $\psi$ combina $e^{\pm\kappa x}$. Pegando en los dos bordes (cuatro condiciones) sale la fórmula exacta. Si $\kappa a \gg 1$, $\sinh(\kappa a) \approx \frac12e^{\kappa a}$ y $T \approx \frac{16E(V_0 - E)}{V_0^2}e^{-2\kappa a}$. $\blacksquare$`],
      examples: [{ q: R`Electrón de 5 eV, barrera de 10 eV y 0,5 nm.`, steps: [R`$\kappa = \sqrt{\frac{5}{0{,}0381}} \approx 11{,}5$ nm⁻¹, $\kappa a \approx 5{,}7$.`, R`$T \approx 4\,e^{-11{,}5} \approx 4\times10^{-5}$.`] }],
      see: ["f3-pozo-finito", "f3-schrodinger"]
    },
    "f3-pozo-finito": {
      title: "Pozo de potencial finito", aliases: ["pozo finito", "pozo de potencial finito", "estados ligados"], concepts: ["f3-pozo-finito"],
      summary: "Con paredes de altura V₀, la función de onda entra en las paredes y los niveles quedan más bajos que en el pozo infinito. Hay ⌈(L/π)√(2mV₀)/ħ⌉ estados ligados, y siempre al menos uno.",
      def: [R`Un pozo de ancho $L$ y profundidad $V_0$: adentro $V = 0$, afuera $V = V_0$. Para $0 < E < V_0$ hay **estados ligados**: oscilan adentro y decaen como $e^{-\kappa|x|}$ afuera.`,
        R`Las energías salen de ecuaciones trascendentes ($k\tan\frac{kL}2 = \kappa$ para los pares). El número de estados ligados es $N = \left\lceil\frac L\pi\sqrt{\frac{2mV_0}{\hbar^2}}\right\rceil$.`],
      idea: [R`Como la onda "se derrama" en las paredes, es como un pozo un poco más ancho: los niveles quedan **por debajo** de los del [[f3-pozo-infinito|pozo infinito]] del mismo ancho. En una dimensión, cualquier pozo, por chico que sea, tiene al menos un estado ligado.`],
      demo: [R`**Paso 1 (contar nodos).** El estado ligado número $j$ tiene $j - 1$ nodos. Cuando $E$ se acerca a $V_0$, afuera $\kappa \to 0$ y la función se aplana en las paredes: adentro alcanza a hacer, a lo sumo, una oscilación con $k_{max} = \sqrt{\frac{2mV_0}{\hbar^2}}$.`,
        R`**Paso 2.** Con pendiente nula en los bordes, entre ellos entran medias longitudes de onda: un estado nuevo aparece en el borde cuando $k_{max}L = (N - 1)\pi$.`,
        R`**Paso 3.** Así, $N - 1 < \frac{k_{max}L}{\pi}$ y la cantidad de estados es el primer entero mayor o igual que $\frac{k_{max}L}{\pi}$. Con $V_0 > 0$, ese número es al menos 1. $\blacksquare$`],
      examples: [{ q: R`Electrón, $L = 1$ nm, $V_0 = 1$ eV.`, steps: [R`$\frac1\pi\sqrt{\frac{1}{0{,}0381}} \approx 1{,}63$: hay 2 estados ligados.`] }],
      see: ["f3-pozo-infinito", "f3-barrera"]
    }
  };

  E.extendCourse("f104", {
    concepts: { "f3-oscilador": { name: "Oscilador cuántico" }, "f3-barrera": { name: "Escalón y efecto túnel" }, "f3-pozo-finito": { name: "Pozo finito" } },
    templates: T,
    units: [{
      id: "f3-potenciales-u", order: 6, program: "Unidad 6", title: "Oscilador, escalón, barrera y pozo finito", icon: "zap",
      diagnostic: ["f3-oscilador-num", "f3-escalon-num", "f3-tunel-num"],
      lessons: [
        { id: "f3-oscilador", title: "Oscilador armónico cuántico", templates: ["f3-oscilador-num", "f3-osc-incerteza-num"], theory: ["f3-oscilador"],
          intro: R`$E_n = \left(n + \frac12\right)\hbar\omega$; el fundamental es una gaussiana de mínima incerteza.` },
        { id: "f3-barrera", title: "Escalón y efecto túnel", templates: ["f3-escalon-num", "f3-tunel-num", "f3-tunel-vf"], theory: ["f3-barrera"],
          intro: R`$\kappa = \frac{\sqrt{2m(V_0 - E)}}{\hbar}$; a través de una barrera, $T \approx 16\frac EV\left(1 - \frac EV\right)e^{-2\kappa a}$.` },
        { id: "f3-pozo-finito", title: "Pozo finito", templates: ["f3-pozo-finito-num"], theory: ["f3-pozo-finito"],
          intro: R`$N = \left\lceil\frac L\pi\sqrt{\frac{2mV_0}{\hbar^2}}\right\rceil$ estados ligados, siempre al menos uno.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 7 · ÁTOMO DE HIDRÓGENO
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, F = E.f3, nf = F.nf;
  const T = {};
  const dn = (x, d = 3) => String(H.num(x, d)).replace(".", "{,}");
  // funciones radiales R_nl (en unidades de a₀) hasta n = 3
  const RAD = {
    "1,0": r => 2 * Math.exp(-r), "2,0": r => (1 - r / 2) * Math.exp(-r / 2) / Math.SQRT2, "2,1": r => r * Math.exp(-r / 2) / Math.sqrt(24),
    "3,0": r => 2 / Math.sqrt(27) * (1 - 2 * r / 3 + 2 * r * r / 27) * Math.exp(-r / 3), "3,1": r => 8 / (27 * Math.sqrt(6)) * r * (1 - r / 6) * Math.exp(-r / 3), "3,2": r => 4 / (81 * Math.sqrt(30)) * r * r * Math.exp(-r / 3)
  };
  const L = ["s", "p", "d", "f"];
  const radInt = (n, l, g) => F.simpson(r => g(r) * RAD[`${n},${l}`](r) ** 2 * r * r, 0, 60, 6000);

  T["f3-radial-num"] = {
    type: "numeric", concepts: ["f3-hidrogeno"], difficulty: 2,
    generate(r) {
      const ask = r.pick(["media", "probable", "dentro"]), n = r.int(1, 3), l = ask === "probable" ? n - 1 : r.int(0, n - 1), x = r.pick([0.5, 1, 1.5, 2, 3]);
      const ans = { media: (3 * n * n - l * (l + 1)) / 2, probable: n * n, dentro: 1 - Math.exp(-2 * x) * (1 + 2 * x + 2 * x * x) }[ask];
      const st = ask === "dentro" ? "1s" : `${n}${L[l]}`;
      return {
        prompt: `Para el electrón de un átomo de hidrógeno en el estado ${st}, ¿${{ media: "cuánto vale $\\langle r\\rangle$ (en unidades de $a_0$)", probable: "cuál es el radio más probable (en unidades de $a_0$)", dentro: `qué probabilidad hay de encontrarlo a menos de $${dn(x, 2)}\\,a_0$ del núcleo` }[ask]}?`,
        answer: ans,
        solution: [`La [[f3-hidrogeno|densidad radial]] es $P(r) = r^2|R_{nl}(r)|^2$: la probabilidad de estar entre $r$ y $r + dr$.`,
          { media: `$\\langle r\\rangle = \\int_0^\\infty r\\,P(r)\\,dr = \\frac{3n^2 - l(l + 1)}{2}a_0 = ${dn(ans, 3)}\\,a_0$.`,
            probable: `Para $l = n - 1$, $P(r) \\propto r^{2n}e^{-2r/na_0}$, que es máxima en $r = n^2a_0 = ${n * n}\\,a_0$: el radio de Bohr del nivel.`,
            dentro: `Con $R_{10} = 2e^{-r/a_0}$: $\\int_0^{x}4r^2e^{-2r}dr = 1 - e^{-2x}(1 + 2x + 2x^2) \\approx ${dn(ans, 4)}$ (con $r$ en $a_0$).` }[ask]],
        // verificación: integrales con las funciones radiales explícitas (Simpson) y el máximo por sección áurea
        verify: { kind: "value", tol: 1e-6, fn: () => ({ media: () => radInt(n, l, rr => rr), probable: () => F.golden(rr => -((rr * RAD[`${n},${l}`](rr)) ** 2), 0.05, 30), dentro: () => F.simpson(rr => (rr * RAD["1,0"](rr)) ** 2, 0, x, 2000) })[ask]() }
      };
    }
  };
  T["f3-virial-num"] = {
    type: "numeric", concepts: ["f3-hidrogeno"], difficulty: 3,
    generate(r) {
      const n = r.int(1, 3), l = r.int(0, n - 1), ask = r.pick(["V", "T"]), Eh = 2 * F.Ry; // hartree en eV
      const ans = ask === "V" ? -Eh / (n * n) : F.Ry / (n * n);
      return {
        prompt: `Para el electrón del hidrógeno en el estado ${n}${L[l]} (con $E_${n} = -\\frac{13{,}6}{${n * n}}$ eV), ¿cuánto vale el valor medio de ${ask === "V" ? "la energía potencial" : "la energía cinética"} (eV)?`,
        answer: ans,
        solution: [`Para el potencial de Coulomb, $\\left\\langle\\frac1r\\right\\rangle = \\frac{1}{n^2a_0}$, así que $\\langle V\\rangle = -\\frac{e^2}{4\\pi\\varepsilon_0}\\left\\langle\\frac1r\\right\\rangle = -\\frac{27{,}2}{n^2}$ eV = $2E_n$ ([[f3-hidrogeno|teorema del virial]]).`,
          ask === "V" ? `$\\langle V\\rangle = -\\frac{27{,}2}{${n * n}} \\approx ${dn(ans, 4)}$ eV.` : `Como $\\langle T\\rangle + \\langle V\\rangle = E_n$: $\\langle T\\rangle = E_n - 2E_n = -E_n \\approx ${dn(ans, 4)}$ eV.`],
        // verificación: ⟨1/r⟩ y ⟨T⟩ = ½∫(R′² + l(l+1)R²/r²) r² dr (en hartrees) con Simpson y derivadas numéricas
        verify: { kind: "value", tol: 1e-5, fn: () => {
          if (ask === "V") return -Eh * radInt(n, l, rr => 1 / Math.max(rr, 1e-12));
          const f = RAD[`${n},${l}`], h = 1e-5, d = rr => (f(rr + h) - f(rr - h)) / (2 * h);
          return Eh / 2 * F.simpson(rr => (d(rr) ** 2 + (rr > 0 ? l * (l + 1) * f(rr) ** 2 / (rr * rr) : 0)) * rr * rr, 1e-6, 60, 6000);
        } }
      };
    }
  };
  T["f3-degeneracion-num"] = {
    type: "numeric", concepts: ["f3-hidrogeno"], difficulty: 1,
    generate(r) {
      const n = r.int(2, 6), l = r.int(0, n - 1), m0 = r.int(0, n - 1), ask = r.pick(["nivel", "nivelspin", "l", "m"]);
      const ans = { nivel: n * n, nivelspin: 2 * n * n, l: 2 * l + 1, m: n - m0 }[ask];
      return {
        prompt: { nivel: `¿Cuántos estados $(l, m)$ distintos tiene el nivel $n = ${n}$ del hidrógeno, sin contar el espín?`, nivelspin: `¿Cuántos estados tiene el nivel $n = ${n}$ del hidrógeno, contando el espín?`, l: `En el nivel $n = ${n}$ del hidrógeno, ¿cuántos estados tienen $l = ${l}$ (sin contar el espín)?`, m: `En el nivel $n = ${n}$ del hidrógeno, ¿cuántos estados tienen $m = ${m0}$ (sin contar el espín)?` }[ask],
        answer: ans,
        solution: [`[[f3-hidrogeno|Números cuánticos]]: $l = 0, \\dots, n - 1$ y, para cada $l$, $m = -l, \\dots, l$ ($2l + 1$ valores). La energía solo depende de $n$.`,
          { nivel: `$\\sum_{l=0}^{n-1}(2l + 1) = n^2 = ${ans}$.`, nivelspin: `$2n^2 = ${ans}$ (cada estado, con espín arriba o abajo).`, l: `$2l + 1 = ${ans}$.`, m: `Hace falta $l \\ge |m| = ${m0}$: $l = ${m0}, \\dots, ${n - 1}$, o sea $${ans}$ estados.` }[ask]],
        // verificación: se enumeran todos los (l, m, s) permitidos y se cuentan
        verify: { kind: "value", tol: 1e-12, fn: () => { let c = 0; for (let ll = 0; ll < n; ll++) for (let mm = -ll; mm <= ll; mm++) for (const s of [-1, 1]) { if (ask === "nivel" && s === 1) c++; if (ask === "nivelspin") c++; if (ask === "l" && ll === l && s === 1) c++; if (ask === "m" && mm === m0 && s === 1) c++; } return c; } }
      };
    }
  };
  T["f3-cuanticos-mc"] = {
    type: "mc", concepts: ["f3-hidrogeno"], difficulty: 1,
    generate(r) {
      const ok3 = (n, l, m) => n >= 1 && l >= 0 && l < n && Math.abs(m) <= l;
      const n = r.int(1, 4), l = r.int(0, n - 1), m = r.int(-l, l), good = [n, l, m];
      const bads = [[n, n, 0], [n, l, l + 1], [n, -1, 0], [0, 0, 0], [n, l + n, m], [n + 1, n + 1, 1], [n, l, -(l + 1)]].filter(t => !ok3(...t));
      const txt = t => `$(n, l, m) = (${t.join(", ")})$`, names = [...new Set(bads.map(txt))];
      if (names.length < 3) return null;
      return {
        prompt: `¿Cuál de estas ternas de números cuánticos corresponde a un estado posible del electrón en el átomo de hidrógeno?`,
        ...H.mc(r, txt(good), r.sample(names, 3), { text: true }),
        solution: [`Reglas ([[f3-hidrogeno|números cuánticos]]): $n \\ge 1$, $0 \\le l \\le n - 1$ y $-l \\le m \\le l$.`, `Solo $${good.join(", ")}$ las cumple: es un estado ${n}${L[l]}.`],
        verify: { kind: "truth", target: true, fn: () => ok3(...good) && bads.every(t => !ok3(...t)) }
      };
    }
  };
  T["f3-momento-num"] = {
    type: "numeric", concepts: ["f3-momento-angular"], difficulty: 2,
    generate(r) {
      const l = r.int(1, 4), ask = r.pick(["L", "ang", "angm"]), m = r.int(-l, l), Lm = Math.sqrt(l * (l + 1));
      const ans = { L: Lm, ang: Math.acos(l / Lm) * 180 / Math.PI, angm: Math.acos(m / Lm) * 180 / Math.PI }[ask];
      return {
        prompt: { L: `¿Cuánto vale $|\\vec L|$, en unidades de $\\hbar$, para un electrón con $l = ${l}$?`, ang: `Para un electrón con $l = ${l}$, ¿cuál es el menor ángulo (en grados) que puede formar $\\vec L$ con el eje $z$?`, angm: `Para un electrón con $l = ${l}$ y $m = ${m}$, ¿qué ángulo (en grados) forma $\\vec L$ con el eje $z$, según el modelo vectorial?` }[ask],
        answer: ans,
        solution: [`[[f3-momento-angular|Momento angular]]: $|\\vec L| = \\sqrt{l(l + 1)}\\hbar = \\sqrt{${l * (l + 1)}}\\hbar \\approx ${dn(Lm, 4)}\\hbar$ y $L_z = m\\hbar$, con $m = -l, \\dots, l$.`,
          ask === "L" ? `$|\\vec L| \\approx ${dn(Lm, 4)}\\hbar$.` : `$\\cos\\theta = \\frac{${ask === "ang" ? l : m}}{\\sqrt{${l * (l + 1)}}}$, así que $\\theta \\approx ${dn(ans, 4)}^\\circ$.${ask === "ang" ? " Nunca es cero: $\\vec L$ no puede apuntar justo sobre el eje." : ""}`],
        // verificación: se arman las matrices de L_z y L± para ese l, se calcula L² = L_z² + (L₊L₋ + L₋L₊)/2 y se toma su autovalor
        verify: { kind: "value", tol: 1e-9, fn: () => {
          const d = 2 * l + 1, ms = Array.from({ length: d }, (_, i) => l - i), Z = () => Array.from({ length: d }, () => new Array(d).fill(0));
          const Lz = Z(), Lp = Z(), Lmn = Z();
          ms.forEach((mm, i) => { Lz[i][i] = mm; if (i > 0) Lp[i - 1][i] = Math.sqrt(l * (l + 1) - mm * (mm + 1)); if (i < d - 1) Lmn[i + 1][i] = Math.sqrt(l * (l + 1) - mm * (mm - 1)); });
          const mul = (A, B) => A.map(row => B[0].map((_, j) => row.reduce((s, v, k) => s + v * B[k][j], 0)));
          const L2 = mul(Lz, Lz).map((row, i) => row.map((v, j) => v + (mul(Lp, Lmn)[i][j] + mul(Lmn, Lp)[i][j]) / 2)), lam = L2[0][0];
          return { L: Math.sqrt(lam), ang: Math.acos(Lz[0][0] / Math.sqrt(lam)) * 180 / Math.PI, angm: Math.acos(m / Math.sqrt(L2[l - m][l - m])) * 180 / Math.PI }[ask];
        } }
      };
    }
  };

  const cards = {
    "f3-hidrogeno": {
      title: "Átomo de hidrógeno: números cuánticos y funciones radiales", aliases: ["átomo de hidrógeno", "números cuánticos", "número cuántico principal", "número cuántico orbital", "número cuántico magnético", "densidad radial", "orbital", "orbitales", "teorema del virial"], concepts: ["f3-hidrogeno"],
      summary: "ψ_nlm = R_nl(r)Y_lm(θ, φ). E_n = −13,6/n² eV solo depende de n: n² estados (2n² con espín). ⟨r⟩ = (3n² − l(l+1))a₀/2, y ⟨V⟩ = 2E_n, ⟨T⟩ = −E_n.",
      def: [R`Resolviendo la ecuación de Schrödinger en 3D con el potencial de Coulomb, los estados ligados se rotulan con tres **números cuánticos**: principal $n = 1, 2, \dots$; orbital $l = 0, \dots, n - 1$ (letras s, p, d, f); magnético $m = -l, \dots, l$. Las energías son las de [[f3-bohr|Bohr]], $E_n = -\frac{13{,}6}{n^2}$ eV, y solo dependen de $n$: el nivel $n$ tiene $n^2$ estados ($2n^2$ con el espín).`,
        R`$\psi_{nlm} = R_{nl}(r)Y_{lm}(\theta, \varphi)$. La **densidad radial** $P(r) = r^2R_{nl}^2$ da la probabilidad de estar a distancia $r$. Ejemplos ($r$ en $a_0$): $R_{10} = 2e^{-r}$, $R_{21} = \frac{1}{\sqrt{24}}re^{-r/2}$. Valores medios: $\langle r\rangle = \frac{3n^2 - l(l+1)}{2}a_0$ y $\left\langle\frac1r\right\rangle = \frac{1}{n^2a_0}$.`,
        R`**Teorema del virial** (Coulomb): $\langle V\rangle = 2E_n$ y $\langle T\rangle = -E_n$.`],
      idea: [R`No hay órbitas: el electrón 1s tiene su radio más probable en $a_0$ (como en Bohr), pero su $\langle r\rangle = 1{,}5a_0$ y hay probabilidad de encontrarlo en cualquier lado. Los estados con $l = n - 1$ son los "más parecidos a una órbita", con el máximo de $P(r)$ en $n^2a_0$.`,
        R`La tabla periódica sale de llenar estos estados respetando el principio de exclusión: $2n^2$ da los largos 2, 8, 18, 32 de los períodos.`],
      demo: [R`**Paso 1 (degeneración).** Para cada $l$ hay $2l + 1$ valores de $m$. Sumando: $\sum_{l=0}^{n-1}(2l + 1) = 2\frac{(n - 1)n}{2} + n = n^2$.`,
        R`**Paso 2 (normalización del 1s).** $\int_0^\infty4e^{-2r}r^2dr = 4\cdot\frac{2!}{2^3} = 1$, usando $\int_0^\infty r^ke^{-ar}dr = \frac{k!}{a^{k+1}}$.`,
        R`**Paso 3 (⟨r⟩ del 1s).** $\int_0^\infty r\cdot4r^2e^{-2r}dr = 4\cdot\frac{3!}{2^4} = \frac32$ (en $a_0$). Y el máximo de $r^2e^{-2r}$ está donde su derivada $2re^{-2r}(1 - r)$ se anula: $r = a_0$.`,
        R`**Paso 4 (virial).** $\left\langle\frac1r\right\rangle_{1s} = 4\int_0^\infty re^{-2r}dr = 1$ (en $\frac1{a_0}$), así que $\langle V\rangle = -\frac{e^2}{4\pi\varepsilon_0a_0} = -27{,}2$ eV $= 2E_1$, y $\langle T\rangle = E_1 - \langle V\rangle = 13{,}6$ eV $= -E_1$. $\blacksquare$`],
      examples: [{ q: R`¿Cuántos estados tiene el nivel $n = 3$?`, steps: [R`$l = 0, 1, 2$ con $1 + 3 + 5 = 9$ estados ($n^2$); con espín, 18.`] }],
      see: ["f3-bohr", "f3-momento-angular", "f3-schrodinger"]
    },
    "f3-momento-angular": {
      title: "Momento angular cuántico", aliases: ["momento angular cuántico", "cuantización espacial", "modelo vectorial", "espín"], concepts: ["f3-momento-angular"],
      summary: "|L| = √(l(l+1)) ħ y L_z = mħ con m = −l, …, l. Como |m| ≤ l < √(l(l+1)), L nunca apunta exactamente sobre z. El espín del electrón es un momento angular intrínseco con s = ½.",
      def: [R`El cuadrado del momento angular y su componente $z$ se pueden medir a la vez, con valores $$L^2 = l(l + 1)\hbar^2,\qquad L_z = m\hbar,\quad m = -l, -l + 1, \dots, l.$$ Las otras componentes no quedan definidas (no conmutan con $L_z$).`,
        R`**Modelo vectorial:** $\vec L$ forma con $z$ un ángulo $\cos\theta = \frac{m}{\sqrt{l(l+1)}}$, y "precesa" alrededor del eje. El **espín** del electrón es un momento angular propio con $s = \frac12$ y $m_s = \pm\frac12$.`],
      idea: [R`Como $l < \sqrt{l(l+1)}$, el vector nunca está alineado con el eje: si lo estuviera, $L_x$ y $L_y$ valdrían cero junto con $L_z$ definido, y eso violaría la [[f3-incerteza|incerteza]] entre componentes. El experimento de Stern-Gerlach ve justamente esos $2l + 1$ (o 2, para el espín) valores discretos.`],
      demo: [R`**Paso 1 (escalera).** Con $L_\pm = L_x \pm iL_y$ se cumple $L_zL_\pm = L_\pm(L_z \pm \hbar)$: $L_+$ sube $m$ en 1 y $L_-$ lo baja.`,
        R`**Paso 2 (tope).** $L^2 - L_z^2 = L_x^2 + L_y^2 \ge 0$ acota $m$; llamemos $l$ al máximo. Ahí $L_+$ da cero.`,
        R`**Paso 3 (el valor de L²).** $L^2 = L_-L_+ + L_z^2 + \hbar L_z$. Aplicado al estado con $m = l$, el primer término da 0: $L^2 = l^2\hbar^2 + l\hbar^2 = l(l + 1)\hbar^2$.`,
        R`**Paso 4 (simetría).** Bajando con $L_-$ se llega a $m = -l$, y el número de pasos ($2l$) tiene que ser entero. $\blacksquare$`],
      examples: [{ q: R`$l = 2$: valores de $L_z$ y ángulo mínimo.`, steps: [R`$m = -2, \dots, 2$; $|\vec L| = \sqrt6\hbar$.`, R`$\cos\theta = \frac{2}{\sqrt6}$, $\theta \approx 35{,}3^\circ$.`] }],
      see: ["f3-hidrogeno", "f1-momento-angular"]
    }
  };

  E.extendCourse("f104", {
    concepts: { "f3-hidrogeno": { name: "Átomo de hidrógeno" }, "f3-momento-angular": { name: "Momento angular cuántico" } },
    templates: T,
    units: [{
      id: "f3-hidrogeno-u", order: 7, program: "Unidad 7", title: "Átomo de hidrógeno", icon: "atom",
      diagnostic: ["f3-degeneracion-num", "f3-radial-num", "f3-momento-num"],
      lessons: [
        { id: "f3-hidrogeno", title: "Números cuánticos y orbitales", templates: ["f3-cuanticos-mc", "f3-degeneracion-num", "f3-radial-num", "f3-virial-num"], theory: ["f3-hidrogeno"],
          intro: R`$n \ge 1$, $0 \le l < n$, $|m| \le l$: $n^2$ estados por nivel. $\langle r\rangle = \frac{3n^2 - l(l+1)}{2}a_0$.` },
        { id: "f3-momento-angular", title: "Momento angular", templates: ["f3-momento-num"], theory: ["f3-momento-angular"],
          intro: R`$|\vec L| = \sqrt{l(l+1)}\hbar$, $L_z = m\hbar$.` }
      ]
    }],
    cards
  });
})();
