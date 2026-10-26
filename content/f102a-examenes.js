/* ===== F102A · Evaluaciones: parciales y final simulados =====
   Estructura de los exámenes reales (ver docs/parciales/f102a.md): tres parciales de cinco problemas de 20 puntos
   (electrostática; circuitos y magnetostática; inducción y alterna) y un final de diez preguntas cortas.
   Enunciados propios y datos sorteados; los datos de las figuras van en el texto. g = 9,8 m/s². */
(function () {
  const E = window.Efecen, R = String.raw, F = E.f2a, nf = F.nf;
  const SELF = {}, T = {};
  const g0 = 9.8;
  const dec = v => String(v).replace(".", "{,}");
  const K = R`k = 8{,}99\times10^9\ \text{N m}^2/\text{C}^2`, MU = R`\mu_0 = 4\pi\times10^{-7}\ \text{T m/A}`;
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

  // ---------- parcial 1: electrostática ----------
  // capacitor cargado que, con una llave, pasa a alimentar dos capacitores en serie
  SELF["f2a-ex-llave"] = {
    concepts: ["f2a-capacitancia"],
    generate(r) {
      const C1 = r.int(1, 10) * 2, C2 = r.int(1, 10), C3 = r.int(1, 10), V = r.int(2, 20) * 10;
      const Q0 = C1 * V, Cs = C2 * C3 / (C2 + C3), Vf = Q0 / (C1 + Cs), Q1 = C1 * Vf, Qs = Cs * Vf, V2 = Qs / C2, V3 = Qs / C3;
      return {
        prompt: `Con la llave en la posición A, un capacitor $C_1 = ${C1}$ μF se carga con una batería de $${V}$ V. Los capacitores $C_2 = ${C2}$ μF y $C_3 = ${C3}$ μF, conectados en serie entre sí, están descargados. Se pasa la llave a la posición B: se desconecta la batería y $C_1$ queda conectado en paralelo con la serie de $C_2$ y $C_3$. Calculá la carga y la diferencia de potencial final de cada uno de los tres capacitores.`,
        rubric: [
          { text: `Carga inicial de $C_1$: $Q_0 = C_1V = ${Q0}$ μC, que se conserva al mover la llave.`, w: 2 },
          { text: `La serie equivale a $C_s = \\frac{C_2C_3}{C_2 + C_3} = ${nf(Cs)}$ μF, en paralelo con $C_1$: tensión final común $V_f = \\frac{Q_0}{C_1 + C_s} \\approx ${nf(Vf)}$ V.`, w: 3 },
          { text: `$Q_1 = C_1V_f \\approx ${nf(Q1)}$ μC; $C_2$ y $C_3$ tienen la misma carga, $C_sV_f \\approx ${nf(Qs)}$ μC.`, w: 3 },
          { text: `Tensiones: $V_1 \\approx ${nf(Vf)}$ V, $V_2 \\approx ${nf(V2)}$ V y $V_3 \\approx ${nf(V3)}$ V (con $V_2 + V_3 = V_1$).`, w: 2 }
        ],
        solution: [`Al pasar la llave a B la batería queda afuera: la carga $Q_0 = ${Q0}$ μC de $C_1$ se reparte, porque no tiene otro lugar adonde ir.`,
          `$C_2$ y $C_3$ en serie tienen la misma carga y equivalen a $C_s = ${nf(Cs)}$ μF. Esa rama queda en paralelo con $C_1$, así que las dos ramas terminan con la misma tensión $V_f$ y $Q_0 = (C_1 + C_s)V_f$: $V_f \\approx ${nf(Vf)}$ V.`,
          `Entonces $Q_1 \\approx ${nf(Q1)}$ μC, $Q_2 = Q_3 \\approx ${nf(Qs)}$ μC, $V_2 = \\frac{Q_2}{C_2} \\approx ${nf(V2)}$ V y $V_3 \\approx ${nf(V3)}$ V.`],
        // otro camino: sistema lineal con las incógnitas (Q₁, Q₂, Q₃): conservación de la carga, carga igual en la serie y ley de mallas
        verify: { kind: "zero", fn: () => { const [q1, q2, q3] = F.solve([[1, 1, 0], [0, 1, -1], [1 / C1, -1 / C2, -1 / C3]], [Q0, 0, 0]); return [(q1 - Q1) / Q0, (q2 - Qs) / Q0, (q3 / C3 - V3) / V]; } }
      };
    }
  };

  // esfera con densidad que decrece linealmente desde el centro
  SELF["f2a-ex-esfera-rho"] = {
    concepts: ["f2a-gauss"],
    generate(r) {
      const Qn = r.int(1, 20), Rc = r.int(5, 20), rc = r.int(1, Rc - 1), Q = Qn * 1e-9, Rm = Rc / 100, rm = rc / 100;
      const rho0 = 3 * Q / (Math.PI * Rm ** 3), qenc = Q * (4 * rm ** 3 / Rm ** 3 - 3 * rm ** 4 / Rm ** 4), Ein = F.k * Q * rm * (4 * Rm - 3 * rm) / Rm ** 4;
      return {
        prompt: `Una esfera aislante de radio $R = ${Rc}$ cm tiene carga total $Q = ${Qn}$ nC, con densidad $\\rho(r) = \\rho_0\\left(1 - \\frac rR\\right)$: decrece linealmente desde $\\rho_0$ en el centro hasta $0$ en el borde. a) Mostrá que $\\rho_0 = \\frac{3Q}{\\pi R^3}$ y calculalo. b) Mostrá que adentro $E = \\frac{kQr}{R^4}(4R - 3r)$ y calculalo a $${rc}$ cm del centro. c) Compará con el campo afuera de la esfera. ($${K}$)`,
        rubric: [
          { text: `a) $Q = \\int_0^R\\rho_0\\left(1 - \\frac rR\\right)4\\pi r^2dr = \\rho_0\\frac{\\pi R^3}{3}$, de donde $\\rho_0 = \\frac{3Q}{\\pi R^3} \\approx ${nf(rho0)}$ C/m³.`, w: 3 },
          { text: `b) Carga encerrada en $r$: $q(r) = Q\\left(\\frac{4r^3}{R^3} - \\frac{3r^4}{R^4}\\right) \\approx ${nf(qenc)}$ C.`, w: 3 },
          { text: `Gauss: $E\\cdot4\\pi r^2 = \\frac{q(r)}{\\varepsilon_0}$, así que $E = \\frac{kQr(4R - 3r)}{R^4} \\approx ${nf(Ein)}$ N/C.`, w: 2 },
          { text: `c) Afuera, $E = \\frac{kQ}{r^2}$, como una carga puntual; en $r = R$ las dos expresiones dan $\\frac{kQ}{R^2}$ (el campo es continuo).`, w: 2 }
        ],
        solution: [`a) Se integra la densidad en cáscaras de volumen $4\\pi r^2dr$: $\\int_0^R\\left(r^2 - \\frac{r^3}{R}\\right)dr = \\frac{R^3}{3} - \\frac{R^3}{4} = \\frac{R^3}{12}$, así que $Q = 4\\pi\\rho_0\\frac{R^3}{12} = \\frac{\\pi\\rho_0R^3}{3}$.`,
          `b) Con la misma integral hasta $r$: $q(r) = 4\\pi\\rho_0\\left(\\frac{r^3}{3} - \\frac{r^4}{4R}\\right) = Q\\left(\\frac{4r^3}{R^3} - \\frac{3r^4}{R^4}\\right)$. Por simetría, [[f2a-gauss|Gauss]] da $E = \\frac{kq(r)}{r^2} = \\frac{kQr(4R - 3r)}{R^4} \\approx ${nf(Ein)}$ N/C.`,
          `c) Afuera, toda la carga queda encerrada: $E = \\frac{kQ}{r^2}$. A diferencia de la esfera uniforme, el campo adentro no es lineal: es máximo en $r = \\frac23R$, adentro de la esfera.`],
        // otro camino: integrales numéricas de la carga y suma de Coulomb cáscara por cáscara (las de afuera no aportan)
        verify: { kind: "zero", fn: () => {
          const rho = s => rho0 * (1 - s / Rm), qn = F.simpson(s => rho(s) * 4 * Math.PI * s * s, 0, Rm, 400), qe = F.simpson(s => rho(s) * 4 * Math.PI * s * s, 0, rm, 400);
          return [(qn - Q) / Q, (qe - qenc) / Q, (F.k * qe / (rm * rm) - Ein) / Ein];
        } }
      };
    }
  };

  // barra semiinfinita: el campo en un punto frente a su extremo forma 45° con la barra
  SELF["f2a-ex-semiinf"] = {
    concepts: ["f2a-distribuciones"],
    generate(r) {
      const lam = r.nz(-9, 9), Rc = r.int(2, 30), l = lam * 1e-9, Rm = Rc / 100, Ec = F.k * Math.abs(l) / Rm;
      return {
        prompt: `Una barra aislante muy larga ocupa el semieje $x \\ge 0$ (empieza en el origen y se extiende indefinidamente), con densidad lineal $\\lambda = ${lam}$ nC/m. El punto $P$ está en $(0, R)$, con $R = ${Rc}$ cm: frente al extremo, sobre la perpendicular. a) Calculá las componentes del campo en $P$. b) Mostrá que forma $45°$ con la barra, sin importar $R$. ($${K}$)`,
        rubric: [
          { text: `Elemento $dq = \\lambda dx$ en $(x, 0)$, a distancia $\\sqrt{x^2 + R^2}$: $dE_x = -\\frac{k\\lambda x\\,dx}{(x^2 + R^2)^{3/2}}$, $dE_y = \\frac{k\\lambda R\\,dx}{(x^2 + R^2)^{3/2}}$.`, w: 3 },
          { text: `Integrando de $0$ a $\\infty$: $E_x = -\\frac{k\\lambda}{R}$ y $E_y = \\frac{k\\lambda}{R}$.`, w: 4 },
          { text: `$|E_x| = |E_y| = \\frac{k|\\lambda|}{R} \\approx ${nf(Ec)}$ N/C: el campo forma $45°$ con la barra para cualquier $R$.`, w: 3 }
        ],
        solution: [`El vector desde $dq$ hasta $P$ es $(-x, R)$. Las [[f2a-distribuciones|integrales]] son $\\int_0^\\infty\\frac{x\\,dx}{(x^2 + R^2)^{3/2}} = \\frac1R$ y $\\int_0^\\infty\\frac{R\\,dx}{(x^2 + R^2)^{3/2}} = \\frac1R$ (con $x = R\\tan u$).`,
          `Entonces $\\vec E = \\frac{k\\lambda}{R}(-1, 1)$, de módulo $\\sqrt2\\frac{k|\\lambda|}{R}$; cada componente vale $\\frac{k|\\lambda|}{R} \\approx ${nf(Ec)}$ N/C. Como las dos componentes son iguales en módulo, el ángulo con la barra es $45°$ para todo $R$.`],
        // otro camino: Coulomb sumado numéricamente sobre la barra (x = R·tan u)
        verify: { kind: "zero", fn: () => { const Ex = F.simpson(u => -F.k * l * Math.sin(u) / Rm, 0, Math.PI / 2, 400), Ey = F.simpson(u => F.k * l * Math.cos(u) / Rm, 0, Math.PI / 2, 400); return [(Math.abs(Ex) - Ec) / Ec, (Math.abs(Ey) - Ec) / Ec, Math.abs(Math.atan2(Math.abs(Ey), Math.abs(Ex)) - Math.PI / 4)]; } }
      };
    }
  };

  // esferita colgada frente a una lámina cargada
  T["f2a-ex-lamina-num"] = {
    type: "numeric", concepts: ["f2a-gauss"], difficulty: 3,
    generate(r) {
      const m = r.int(5, 50) / 10, q = r.int(5, 50), th = r.int(5, 40), mk = m * 1e-6, qc = q * 1e-9, t = th * Math.PI / 180;
      const sig = 2 * F.e0 * mk * g0 * Math.tan(t) / qc, ans = sig * 1e9;
      return {
        prompt: `Una esferita de $${dec(m)}$ mg con carga $${q}$ nC cuelga de un hilo de seda frente a una lámina vertical, grande, no conductora y con carga uniforme del mismo signo. En el equilibrio, el hilo forma un ángulo de $${th}°$ con la lámina. ¿Cuál es la densidad superficial de carga de la lámina (en nC/m²)? ($\\varepsilon_0 = 8{,}854\\times10^{-12}$ C²/(N m²), $g = 9{,}8$ m/s²)`,
        answer: ans,
        solution: [`La lámina produce un campo uniforme y horizontal, $E = \\frac{\\sigma}{2\\varepsilon_0}$ ([[f2a-gauss|Gauss]]), así que la fuerza eléctrica es $qE$, horizontal.`,
          `Equilibrio: $T\\cos\\theta = mg$ y $T\\sin\\theta = qE$. Dividiendo, $\\tan\\theta = \\frac{qE}{mg}$, y $\\sigma = \\frac{2\\varepsilon_0mg\\tan\\theta}{q} \\approx ${nf(ans)}$ nC/m².`],
        // otro camino: con esa σ (y el campo del plano como disco enorme), la suma de torques sobre el punto de suspensión es nula
        verify: { kind: "zero", fn: x => { const s = x * 1e-9, Ep = F.simpson(u => 2 * Math.PI * F.k * s * Math.sin(u), 0, Math.atan(1e9), 2000), L = 1; return (qc * Ep * L * Math.cos(t) - mk * g0 * L * Math.sin(t)) / (mk * g0); } }
      };
    }
  };

  // ---------- parcial 2: circuitos y magnetostática ----------
  // cilindro con una bobina, sobre un plano inclinado, en un campo vertical
  T["f2a-ex-cilindro-num"] = {
    type: "numeric", concepts: ["f2a-fuerza-corriente"], difficulty: 3,
    generate(r) {
      const m = r.int(10, 50) * 10, L = r.int(5, 30), N = r.int(5, 30), B = r.int(1, 10) / 10, th = r.int(10, 40);
      const I = m / 1000 * g0 / (2 * N * L / 100 * B);
      return {
        prompt: `Un cilindro de madera de $${m}$ g y $${L}$ cm de largo tiene $${N}$ vueltas de alambre enrolladas a lo largo, de modo que el plano de las espiras contiene el eje del cilindro. Está sobre un plano inclinado $${th}°$, con el plano de las espiras paralelo al plano inclinado, en un campo magnético vertical de $${dec(B)}$ T. ¿Qué corriente mínima (en A) tiene que circular por la bobina para que el cilindro no ruede? ($g = 9{,}8$ m/s²; suponé que no desliza)`,
        answer: I,
        solution: [`Tomando torques respecto del punto de contacto, el peso hace $mgR\\sin\\theta$ (con $R$ el radio).`,
          `La bobina tiene momento magnético $\\mu = NI(2RL)$, perpendicular al plano inclinado, que forma un ángulo $\\theta$ con el campo vertical: el [[f2a-torque-espira|torque magnético]] es $\\mu B\\sin\\theta = 2NIRLB\\sin\\theta$ (y la fuerza neta magnética es nula, así que no importa el punto).`,
          `Igualando, $\\sin\\theta$ y $R$ se cancelan: $I = \\frac{mg}{2NLB} \\approx ${nf(I)}$ A, para cualquier inclinación.`],
        // otro camino: con esa corriente, los torques de las fuerzas I L × B sobre los lados de la bobina compensan el del peso (radio cualquiera)
        verify: { kind: "zero", fn: x => {
          const Rr = 0.03, Lm = L / 100, t = th * Math.PI / 180, n = [-Math.sin(t), Math.cos(t), 0], along = [Math.cos(t), Math.sin(t), 0], z = [0, 0, 1], Bv = [0, B, 0];
          // lados largos (según z) a ±R del eje en la dirección del plano; el eje está a R del plano, sobre el contacto
          let tau = 0;
          for (const s of [1, -1]) { const pos = along.map((c, i) => s * Rr * c + Rr * n[i]), dl = z.map(c => s * Lm * c), Fm = cross(dl, Bv).map(c => N * x * c); tau += cross(pos, Fm)[2]; }
          const tg = cross(n.map(c => Rr * c), [0, -m / 1000 * g0, 0])[2];
          return Math.abs(Math.abs(tau) - Math.abs(tg)) / Math.abs(tg);
        } }
      };
    }
  };

  // dos arcos concéntricos unidos por tramos radiales
  T["f2a-ex-arcos-num"] = {
    type: "numeric", concepts: ["f2a-biot"], difficulty: 3,
    generate(r) {
      const a = r.int(2, 10), b = a + r.int(2, 15), th = r.pick([60, 90, 120, 180, 270]), I = r.int(1, 20), am = a / 100, bm = b / 100, t = th * Math.PI / 180;
      const B = F.mu0 * I * t / (4 * Math.PI) * (1 / am - 1 / bm), ans = B * 1e6;
      return {
        prompt: `Una espira cerrada está formada por dos arcos de circunferencia concéntricos de $${th}°$, de radios $a = ${a}$ cm y $b = ${b}$ cm, unidos por dos tramos rectos radiales. Lleva una corriente de $${I}$ A. ¿Cuánto vale el campo magnético en el centro común de los arcos (en μT)? ($${MU}$)`,
        answer: ans,
        solution: [`Los tramos radiales no aportan: ahí $d\\vec l$ es paralelo a $\\hat r$ ([[f2a-biot-savart|Biot-Savart]]).`,
          `Cada arco aporta $\\frac{\\mu_0I\\theta}{4\\pi\\rho}$; como la corriente los recorre en sentidos opuestos, sus campos se restan: $B = \\frac{\\mu_0I\\theta}{4\\pi}\\left(\\frac1a - \\frac1b\\right) \\approx ${nf(ans)}$ μT (domina el arco chico).`],
        // otro camino: Biot-Savart vectorial numérico sobre los cuatro tramos de la espira
        verify: { kind: "value", tol: 1e-7, fn: () => {
          const bs = (p, dp, s0, s1) => [0, 1, 2].map(j => F.simpson(s => { const q = p(s), rr = q.map(c => -c), d = Math.hypot(...rr); return F.mu0 * I / (4 * Math.PI) * cross(dp(s), rr)[j] / d ** 3; }, s0, s1, 800));
          const arc = rad => [s => [rad * Math.cos(s), rad * Math.sin(s), 0], s => [-rad * Math.sin(s), rad * Math.cos(s), 0]];
          const [pa, da] = arc(am), [pb, db] = arc(bm);
          const B1 = bs(pa, da, 0, t), B2 = bs(pb, s => db(s).map(c => -c), 0, t);
          const rad1 = bs(s => [s, 0, 0], () => [1, 0, 0], am, bm), rad2 = bs(s => [s * Math.cos(t), s * Math.sin(t), 0], () => [-Math.cos(t), -Math.sin(t), 0], am, bm);
          return Math.hypot(...[0, 1, 2].map(j => B1[j] + B2[j] + rad1[j] + rad2[j])) * 1e6;
        } }
      };
    }
  };

  // ---------- parcial 3: inducción y alterna ----------
  // espira rectangular que atraviesa una región con campo
  SELF["f2a-ex-espira-campo"] = {
    concepts: ["f2a-faraday"],
    generate(r) {
      const l = r.int(5, 20), w = r.int(5, 20), B = r.int(1, 10) / 10, v = r.int(1, 10), Rr = r.int(1, 10) / 2, x1 = +(r.int(1, 9) / 10 * w).toFixed(1), x2 = +(w + r.int(1, 19) / 10 * w).toFixed(1);
      const lm = l / 100, wm = w / 100;
      // región con campo: 0 ≤ x ≤ 3w; x es la posición del lado derecho de la espira (de ancho w)
      const inside = x => Math.max(0, Math.min(x, 3 * w) - Math.max(x - w, 0)), Phi = x => B * lm * inside(x) / 100;
      const emf = x => (x > 0 && x < w) || (x > 3 * w && x < 4 * w) ? B * lm * v : 0, e1 = emf(x1), e2 = emf(x2), Fm = B * lm * (e1 / Rr);
      return {
        prompt: `Una espira rectangular de $${l}$ cm (lado vertical) por $${w}$ cm (horizontal), con resistencia $${dec(Rr)}\\ \\Omega$, se mueve hacia la derecha con velocidad constante $${v}$ m/s. Atraviesa una región de campo magnético uniforme de $${dec(B)}$ T, que entra en la página y ocupa $0 \\le x \\le ${3 * w}$ cm. Sea $x$ la posición del lado derecho de la espira. a) Describí el flujo $\\Phi(x)$ entre $x = 0$ y $x = ${4 * w}$ cm. b) Calculá la fem inducida y la corriente para $x = ${dec(x1)}$ cm y para $x = ${dec(x2)}$ cm. c) ¿Qué fuerza externa hace falta en $x = ${dec(x1)}$ cm para mantener la velocidad?`,
        rubric: [
          { text: `a) $\\Phi$ crece linealmente de $0$ a $B\\ell w$ entre $x = 0$ y $x = ${w}$ cm, es constante hasta $x = ${3 * w}$ cm y baja a $0$ hasta $x = ${4 * w}$ cm.`, w: 3 },
          { text: `b) En $x = ${dec(x1)}$ cm la espira está entrando: $|\\varepsilon| = B\\ell v = ${nf(e1)}$ V e $I = ${nf(e1 / Rr)}$ A (antihoraria, por Lenz).`, w: 3 },
          { text: `En $x = ${dec(x2)}$ cm está toda adentro: el flujo no cambia, $\\varepsilon = 0$ e $I = 0$.`, w: 2 },
          { text: `c) $F = I\\ell B \\approx ${nf(Fm)}$ N, hacia la derecha (compensa la fuerza magnética que la frena).`, w: 2 }
        ],
        solution: [`[[f2a-faraday|Faraday]]: $\\varepsilon = -\\frac{d\\Phi}{dt} = -v\\frac{d\\Phi}{dx}$. El flujo es $B\\ell$ por el largo de espira que está dentro del campo.`,
          `Entrando ($0 < x < w$): $\\Phi = B\\ell x$ y $|\\varepsilon| = B\\ell v = ${nf(B * lm * v)}$ V; toda adentro ($w < x < 3w$): $\\Phi = B\\ell w$ constante y $\\varepsilon = 0$; saliendo ($3w < x < 4w$): $\\Phi$ baja y $|\\varepsilon| = B\\ell v$ con la corriente al revés.`,
          `En $x = ${dec(x1)}$ cm: $I = \\frac{\\varepsilon}{R} = ${nf(e1 / Rr)}$ A y la fuerza sobre el lado de adentro vale $I\\ell B \\approx ${nf(Fm)}$ N. En $x = ${dec(x2)}$ cm: $\\varepsilon = ${nf(e2)}$ V.`],
        // otro camino: fem como derivada numérica del flujo respecto de x (por v), y potencia mecánica = potencia disipada
        verify: { kind: "zero", fn: () => { const d = x => Math.abs(Phi(x + 1e-3) - Phi(x - 1e-3)) / (2e-3 / 100) * v; const i1 = d(x1) / Rr; return [d(x1) - e1, d(x2) - e2, Fm * v - i1 * i1 * Rr]; } }
      };
    }
  };

  // filtro RLC: dos frecuencias con la misma atenuación
  SELF["f2a-ex-filtro"] = {
    concepts: ["f2a-rlc"],
    generate(r) {
      const Rr = r.int(2, 20), f1 = r.pick([100, 200, 300, 500]), f2 = f1 * r.pick([4, 9, 16, 20]), Vin = r.pick([5, 10, 12]);
      const w1 = 2 * Math.PI * f1, w2 = 2 * Math.PI * f2, L = Math.sqrt(3) * Rr / (w2 - w1), C = 1 / (L * w1 * w2), f0 = Math.sqrt(f1 * f2), P1 = (Vin / 2) ** 2 / Rr;
      return {
        prompt: `En un circuito RLC serie se toma la salida sobre la resistencia, $R = ${Rr}\\ \\Omega$. Para $f_1 = ${f1}$ Hz y $f_2 = ${f2}$ Hz se cumple $\\frac{V_{out}}{V_{in}} = \\frac12$. a) Determiná $L$ y $C$. b) ¿Para qué frecuencia el cociente es máximo y cuánto vale? c) Con $V_{in} = ${Vin}$ V eficaces, ¿qué potencia media recibe la resistencia a $f_1$?`,
        rubric: [
          { text: `$\\frac{V_{out}}{V_{in}} = \\frac RZ = \\frac12$ implica $|X_L - X_C| = \\sqrt3R$; en $f_1$ domina el capacitor y en $f_2$ la bobina.`, w: 3 },
          { text: `a) Restando las dos condiciones y usando $\\omega_1\\omega_2 = \\frac1{LC}$: $L = \\frac{\\sqrt3R}{\\omega_2 - \\omega_1} \\approx ${nf(L * 1000)}$ mH y $C = \\frac{1}{L\\omega_1\\omega_2} \\approx ${nf(C * 1e6)}$ μF.`, w: 4 },
          { text: `b) Máximo en resonancia, $f_0 = \\sqrt{f_1f_2} = ${nf(f0)}$ Hz, donde el cociente vale $1$.`, w: 2 },
          { text: `c) $V_{out} = \\frac{V_{in}}{2}$ y $P = \\frac{V_{out}^2}{R} \\approx ${nf(P1)}$ W.`, w: 1 }
        ],
        solution: [`El cociente es $\\frac RZ = \\frac{R}{\\sqrt{R^2 + (X_L - X_C)^2}}$ ([[f2a-rlc]]). Que valga $\\frac12$ significa $Z = 2R$, o sea $(X_L - X_C)^2 = 3R^2$.`,
          `En $f_1$ (baja), $\\frac1{\\omega_1C} - \\omega_1L = \\sqrt3R$; en $f_2$ (alta), $\\omega_2L - \\frac1{\\omega_2C} = \\sqrt3R$. Igualando las dos y despejando sale $\\omega_1\\omega_2 = \\frac1{LC}$; sumándolas, $2L(\\omega_2 - \\omega_1) = 2\\sqrt3R$. Entonces $L \\approx ${nf(L * 1000)}$ mH y $C \\approx ${nf(C * 1e6)}$ μF.`,
          `b) El máximo está en la [[f2a-resonancia|resonancia]], $\\omega_0 = \\frac1{\\sqrt{LC}} = \\sqrt{\\omega_1\\omega_2}$: $f_0 = ${nf(f0)}$ Hz, con cociente $1$. c) $P = \\frac{(V_{in}/2)^2}{R} \\approx ${nf(P1)}$ W.`],
        // otro camino: con L y C hallados, el cociente en f₁ y f₂ (aritmética directa), y el máximo por sección áurea
        verify: { kind: "zero", fn: () => { const ratio = f => { const w = 2 * Math.PI * f; return Rr / Math.hypot(Rr, w * L - 1 / (w * C)); }, fm = Math.exp(F.golden(u => -ratio(Math.exp(u)), Math.log(f1 / 10), Math.log(f2 * 10))); return [ratio(f1) - 0.5, ratio(f2) - 0.5, (fm - f0) / f0 * 1e-2, (Vin * ratio(f1)) ** 2 / Rr - P1]; } }
      };
    }
  };

  E.registerExams("f102a", {
    self: SELF,
    templates: T,
    exams: [
      { id: "p1", kind: "parcial", title: "1.er parcial", topics: "Electrostática: capacitores, ley de Gauss, campo de distribuciones, energía de un sistema de cargas", minutes: 120, pass: 60,
        items: [
          { title: "Capacitores y una llave", parts: [{ self: "f2a-ex-llave", pts: 20 }] },
          { title: "Esfera con densidad variable", parts: [{ self: "f2a-ex-esfera-rho", pts: 20 }] },
          { any: [
            { title: "Barra semiinfinita", parts: [{ self: "f2a-ex-semiinf", pts: 20 }] },
            { title: "Campo de distribuciones", parts: [{ tpl: "f2a-linea-num", pts: 10 }, { tpl: "f2a-anillo-num", pts: 10 }] }
          ] },
          { title: "Esferita frente a una lámina", parts: [{ tpl: "f2a-ex-lamina-num", pts: 20 }] },
          { any: [
            { title: "Trabajo para armar un sistema de cargas", parts: [{ tpl: "f2a-energia-num", pts: 20 }] },
            { title: "Potencial y energía", parts: [{ tpl: "f2a-potencial-num", pts: 10 }, { tpl: "f2a-energia-num", pts: 10 }] }
          ] }
        ] },
      { id: "p2", kind: "parcial", title: "2.º parcial", topics: "Circuitos de continua y RC, fuerzas magnéticas, Biot-Savart y cables paralelos", minutes: 120, pass: 60,
        items: [
          { title: "Circuito de dos mallas", parts: [{ tpl: "f2a-kirchhoff-num", pts: 12 }, { tpl: "f2a-kirchhoff-order", pts: 8 }] },
          { title: "Carga y descarga de un capacitor", parts: [{ tpl: "f2a-rc-num", pts: 20 }] },
          { title: "Cilindro con una bobina en un plano inclinado", parts: [{ tpl: "f2a-ex-cilindro-num", pts: 20 }] },
          { any: [
            { title: "Arcos con corriente", parts: [{ tpl: "f2a-ex-arcos-num", pts: 20 }] },
            { title: "Espiras y arcos", parts: [{ tpl: "f2a-espira-num", pts: 20 }] }
          ] },
          { title: "Cables paralelos", parts: [{ tpl: "f2a-paralelos-num", pts: 20 }] }
        ] },
      { id: "p3", kind: "parcial", title: "3.er parcial", topics: "Inducción (barra, espira que atraviesa un campo), circuitos RL y corriente alterna", minutes: 120, pass: 60,
        items: [
          { title: "Barra que frena sobre rieles", parts: [{ tpl: "f2a-barra-num", pts: 20 }] },
          { title: "Espira que atraviesa un campo", parts: [{ self: "f2a-ex-espira-campo", pts: 20 }] },
          { title: "Circuito RL", parts: [{ tpl: "f2a-rl-num", pts: 10 }, { tpl: "f2a-rl-num", pts: 10 }] },
          { any: [
            { title: "Reactancias y fases", parts: [{ tpl: "f2a-reactancia-num", pts: 10 }, { tpl: "f2a-fase-mc", pts: 10 }] },
            { title: "Potencia y RLC paralelo", parts: [{ tpl: "f2a-potencia-ca-num", pts: 10 }, { tpl: "f2a-rlc-paralelo-num", pts: 10 }] }
          ] },
          { any: [
            { title: "Filtro RLC", parts: [{ self: "f2a-ex-filtro", pts: 20 }] },
            { title: "RLC y resonancia", parts: [{ tpl: "f2a-rlc-num", pts: 10 }, { tpl: "f2a-resonancia-num", pts: 10 }] }
          ] }
        ] },
      { id: "final", kind: "final", title: "Final (cuestionario)", topics: "Diez preguntas cortas de toda la materia, como el cuestionario del final: conceptos y cuentas breves.", minutes: 90, pass: 60,
        items: [
          { title: "Pregunta 1", parts: [{ pick: ["f2a-cero-tf", "f2a-medio-tf", "f2a-dipolo-num"], pts: 10 }] },
          { title: "Pregunta 2", parts: [{ pick: ["f2a-flujo-num", "f2a-gauss-num"], pts: 10 }] },
          { title: "Pregunta 3", parts: [{ pick: ["f2a-esfera-pot-num", "f2a-potencial-num"], pts: 10 }] },
          { title: "Pregunta 4", parts: [{ pick: ["f2a-bateria-tf", "f2a-dielectrico-num"], pts: 10 }] },
          { title: "Pregunta 5", parts: [{ pick: ["f2a-fem-num", "f2a-ohm-tf"], pts: 10 }] },
          { title: "Pregunta 6", parts: [{ pick: ["f2a-rc-tf", "f2a-rc-num"], pts: 10 }] },
          { title: "Pregunta 7", parts: [{ pick: ["f2a-mano-mc", "f2a-ciclotron-num"], pts: 10 }] },
          { title: "Pregunta 8", parts: [{ pick: ["f2a-cable-grueso-tf", "f2a-solenoide-num", "f2a-carga-movil-num"], pts: 10 }] },
          { title: "Pregunta 9", parts: [{ pick: ["f2a-lenz-mc", "f2a-rl-num", "f2a-maxwell-tf", "f2a-campo-inducido-num"], pts: 10 }] },
          { title: "Pregunta 10", parts: [{ pick: ["f2a-fase-mc", "f2a-eficaz-num", "f2a-potencia-ca-num"], pts: 10 }] }
        ] }
    ]
  });
})();

/* ===== F102A · Examen Extra UBA =====
   Temas de Física 3 de la Lic. en Cs. Físicas (FCEN, UBA) que no están en el programa de F102A: electrostática en forma
   diferencial, imágenes y multipolos, medios materiales, Thévenin y filtros, ondas, Poynting y potencial vector.
   Enunciados propios y datos sorteados. */
(function () {
  const E = window.Efecen, F = E.f2a, nf = F.nf;
  const SELF = {};

  SELF["f2a-ex-poynting-cap"] = {
    concepts: ["f2a-ondas-maxwell", "f2a-maxwell"],
    generate(r) {
      const a = r.int(2, 10), d = r.int(1, 5), I = r.int(1, 20) / 10, t = r.int(1, 50);
      const am = a / 100, dm = d / 1000, ts = t * 1e-6, Ef = I * ts / (F.e0 * Math.PI * am * am), B = F.mu0 * I / (2 * Math.PI * am), S = Ef * B / F.mu0, P = S * 2 * Math.PI * am * dm;
      return {
        prompt: `Un capacitor de placas circulares de radio $${a}$ cm, separadas $${d}$ mm, se carga desde cero con una corriente constante de $${String(I).replace(".", "{,}")}$ A. Despreciá los efectos de borde.<br>a) ¿Cuánto vale el campo eléctrico entre las placas a los $${t}$ μs?<br>b) ¿Cuánto vale el campo magnético en el borde de las placas en ese instante?<br>c) Calculá el vector de Poynting en la superficie lateral del volumen entre placas (módulo y sentido) y mostrá que su flujo es el ritmo al que crece la energía eléctrica guardada.`,
        rubric: [
          { text: `a) $Q = It$ y $E = \\frac{Q}{\\varepsilon_0\\pi a^2} \\approx ${nf(Ef)}$ V/m.`, w: 2 },
          { text: `b) [[f2a-maxwell|Ampère-Maxwell]] en el borde: toda la corriente de desplazamiento $\\varepsilon_0\\frac{d\\Phi_E}{dt} = I$ queda encerrada, así que $B = \\frac{\\mu_0I}{2\\pi a} \\approx ${nf(B)}$ T.`, w: 3 },
          { text: `c) $\\vec S = \\frac{\\vec E\\times\\vec B}{\\mu_0}$ apunta **hacia adentro**, radial, con $S = \\frac{EB}{\\mu_0} \\approx ${nf(S)}$ W/m² ([[f2a-ondas-maxwell|vector de Poynting]]).`, w: 2 },
          { text: `Flujo entrante: $S\\cdot2\\pi ad \\approx ${nf(P)}$ W, igual a $\\frac{d}{dt}\\left(\\frac12\\varepsilon_0E^2\\pi a^2d\\right) = EId$.`, w: 3 }
        ],
        solution: [`El campo crece linealmente: $E = \\frac{It}{\\varepsilon_0\\pi a^2}$. El campo magnético da vueltas alrededor del eje y en el borde vale $\\frac{\\mu_0I}{2\\pi a}$.`,
          `$S\\cdot2\\pi ad = \\frac{E}{\\mu_0}\\frac{\\mu_0I}{2\\pi a}2\\pi ad = EId$, y $\\frac{dU}{dt} = \\varepsilon_0E\\dot E\\pi a^2d = EId$ porque $\\dot E = \\frac{I}{\\varepsilon_0\\pi a^2}$: la energía entra por los costados.`],
        // otro camino: B integrando la densidad de corriente de desplazamiento sobre el disco (Simpson en polares)
        // y dU/dt derivando numéricamente la energía guardada
        verify: { kind: "zero", tol: 1e-6, fn: () => {
          const jd = I / (Math.PI * am * am), Id = F.simpson(s => jd * 2 * Math.PI * s, 0, am, 400), Bn = F.mu0 * Id / (2 * Math.PI * am);
          const U = tt => 0.5 * F.e0 * (I * tt / (F.e0 * Math.PI * am * am)) ** 2 * Math.PI * am * am * dm, h = ts * 1e-4, dU = (U(ts + h) - U(ts - h)) / (2 * h);
          return [(Bn - B) / B, (Ef * Bn / F.mu0 * 2 * Math.PI * am * dm - dU) / dU, (P - dU) / dU];
        } }
      };
    }
  };

  SELF["f2a-ex-coaxial"] = {
    concepts: ["f2a-medios-electricos"],
    generate(r) {
      const a = r.int(1, 5), b = a * r.pick([2, 3, 4, 5]), er = r.pick([2, 2.25, 3, 4, 5]), lam = r.int(1, 20);
      const am = a / 1000, bm = b / 1000, lm = lam * 1e-9, eps = er * F.e0;
      const C = 2 * Math.PI * eps / Math.log(b / a), V = lm / C, Ea = lm / (2 * Math.PI * eps * am), sb = -(1 - 1 / er) * lm / (2 * Math.PI * am);
      return {
        prompt: `Un cable coaxial tiene un conductor interior de radio $${a}$ mm y uno exterior de radio interno $${b}$ mm. Entre ellos hay un dieléctrico lineal con $\\varepsilon_r = ${String(er).replace(".", "{,}")}$. El conductor interior tiene $${lam}$ nC por metro y el exterior, la carga opuesta.<br>a) Hallá $\\vec D$, $\\vec E$ y $\\vec P$ entre los conductores.<br>b) ¿Cuánto vale la diferencia de potencial y la capacidad por unidad de longitud?<br>c) ¿Qué densidad de carga de polarización aparece en la superficie del dieléctrico que toca al conductor interior?`,
        rubric: [
          { text: `a) [[f2a-medios-electricos|Gauss para D]] en un cilindro de radio $r$: $D = \\frac{\\lambda}{2\\pi r}$, $E = \\frac{D}{\\varepsilon_r\\varepsilon_0} = \\frac{\\lambda}{2\\pi\\varepsilon r}$ y $P = \\left(1 - \\frac{1}{\\varepsilon_r}\\right)D$, todos radiales.`, w: 3 },
          { text: `b) $\\Delta V = \\int_a^bE\\,dr = \\frac{\\lambda}{2\\pi\\varepsilon}\\ln\\frac ba \\approx ${nf(V)}$ V y $C' = \\frac{\\lambda}{\\Delta V} = \\frac{2\\pi\\varepsilon}{\\ln(b/a)} \\approx ${nf(C * 1e12)}$ pF/m.`, w: 4 },
          { text: `c) $\\sigma_b = \\vec P\\cdot\\hat n$ con $\\hat n$ hacia el eje: $\\sigma_b = -\\left(1 - \\frac1{\\varepsilon_r}\\right)\\frac{\\lambda}{2\\pi a} \\approx ${nf(sb * 1e9)}$ nC/m², de signo opuesto a la carga del conductor (por eso el campo se debilita).`, w: 3 }
        ],
        solution: [`La carga libre fija $\\vec D$ por simetría; el dieléctrico divide a $E$ por $\\varepsilon_r$ y la capacidad queda multiplicada por $\\varepsilon_r$.`,
          `Cerca del conductor interior, $E(a) \\approx ${nf(Ea)}$ V/m.`],
        // otro camino: se resuelve d/dr(r ε dV/dr) = 0 por diferencias finitas con V(a) = 1 y V(b) = 0, y la carga sale del flujo de D en r = a
        verify: { kind: "zero", tol: 1e-3, fn: () => {
          const N = 2000, h = (bm - am) / N, rr = i => am + i * h, lo = [], di = [], up = [], rhs = [];
          for (let i = 1; i < N; i++) { const rp = rr(i) + h / 2, rmn = rr(i) - h / 2; lo.push(rmn); di.push(-(rp + rmn)); up.push(rp); rhs.push(i === 1 ? -rmn * 1 : 0); }
          for (let i = 1; i < di.length; i++) { const m = lo[i] / di[i - 1]; di[i] -= m * up[i - 1]; rhs[i] -= m * rhs[i - 1]; }
          const Vv = new Array(di.length); Vv[di.length - 1] = rhs[di.length - 1] / di[di.length - 1];
          for (let i = di.length - 2; i >= 0; i--) Vv[i] = (rhs[i] - up[i] * Vv[i + 1]) / di[i];
          const flux = -(Vv[0] - 1) / h * (am + h / 2), Cn = 2 * Math.PI * eps * flux; // carga por voltio y por metro
          const Pa = (1 - 1 / er) * eps * (lm / Cn) * flux / am; // P = ε₀χE en r = a, con E·r constante
          return [Cn / C - 1, -Pa / sb - 1];
        } }
      };
    }
  };

  E.registerExams("f102a", {
    self: SELF,
    exams: [
      { id: "uba", kind: "parcial", title: "Examen Extra UBA", topics: "Temas de Física 3 de la UBA que no están en el programa: forma diferencial, imágenes y multipolos, medios materiales, Thévenin y filtros, ondas desde Maxwell, Poynting y potencial vector.", minutes: 180, pass: 60,
        items: [
          { title: "Poynting en un capacitor que se carga", parts: [{ self: "f2a-ex-poynting-cap", pts: 20 }] },
          { title: "Coaxial con dieléctrico", parts: [{ self: "f2a-ex-coaxial", pts: 20 }] },
          { any: [
            { title: "Electrostática en forma diferencial", parts: [{ tpl: "f2a-poisson-num", pts: 12 }, { tpl: "f2a-laplace-vf", pts: 8 }] },
            { title: "Imágenes y multipolos", parts: [{ tpl: "f2a-imagen-num", pts: 12 }, { tpl: "f2a-multipolo-num", pts: 8 }] }
          ] },
          { any: [
            { title: "Circuito magnético", parts: [{ tpl: "f2a-entrehierro-num", pts: 12 }, { tpl: "f2a-polsup-mc", pts: 8 }] },
            { title: "Thévenin y puentes", parts: [{ tpl: "f2a-thevenin-num", pts: 12 }, { tpl: "f2a-wheatstone-num", pts: 8 }] },
            { title: "Filtros", parts: [{ tpl: "f2a-pasabanda-num", pts: 12 }, { tpl: "f2a-filtro-vf", pts: 8 }] }
          ] },
          { any: [
            { title: "Potencial vector", parts: [{ tpl: "f2a-solenoideA-num", pts: 12 }, { tpl: "f2a-potA-vf", pts: 8 }] },
            { title: "Ondas y potencial vector", parts: [{ tpl: "f2a-ondamedio-num", pts: 12 }, { tpl: "f2a-rotA-num", pts: 8 }] }
          ] }
        ] }
    ]
  });
})();
