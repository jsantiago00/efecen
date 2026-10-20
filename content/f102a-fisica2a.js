/*
 * F102A · Física General II A — Lic. en Ciencias Básicas (FCEN, UNCuyo), Plan Ord. 77/15 C.S.
 * ==========================================================================================
 * Temario: programa oficial 2026 (prof. Rubén Santos), 9 unidades:
 *   1 Carga y campo eléctrico · 2 Potencial eléctrico · 3 Capacitancia y dieléctricos
 *   4 Corriente, resistencia y fem · 5 Circuitos de corriente continua · 6 Campo magnético
 *   7 Fuentes de campo magnético · 8 Inducción electromagnética · 9 Corriente alterna
 * Ids con prefijo "f2a-". Todo el texto y los ejercicios son originales.
 */
(function () {
  const E = window.Efecen;
  E.registerCourse({ id: "f102a", code: "F102A", title: "Física General II A", icon: "zap" });
  // constantes y ayudas compartidas por las unidades (E.f2a)
  const F = E.f2a = {
    // k = 1/(4πε₀) exacto, para que las fórmulas con k y con ε₀ coincidan
    k: 1 / (4 * Math.PI * 8.854e-12), e0: 8.854e-12, mu0: 4 * Math.PI * 1e-7, qe: 1.602e-19, me: 9.109e-31, mp: 1.673e-27,
    // número con coma para TeX; notación científica si es muy chico o muy grande
    nf: (x, d = 3) => {
      if (x === 0 || !isFinite(x)) return "0";
      const a = Math.abs(x);
      if (a < 1e-2 || a >= 1e5) { const ex = Math.floor(Math.log10(a)), m = x / 10 ** ex; return `${String(+m.toFixed(d - 1)).replace(".", "{,}")} \\times 10^{${ex}}`; }
      return String(+x.toPrecision(d + 1)).replace(".", "{,}");
    },
    simpson: (f, a, b, n = 1000) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3; },
    // RK4 para sistemas: f(t, y) → dy/dt; devuelve el estado en t1
    rk4: (f, y0, t1, dt) => { let y = y0.slice(), t = 0; const n = Math.ceil(t1 / dt), h = t1 / n; for (let i = 0; i < n; i++) { const k1 = f(t, y), k2 = f(t + h / 2, y.map((v, j) => v + h / 2 * k1[j])), k3 = f(t + h / 2, y.map((v, j) => v + h / 2 * k2[j])), k4 = f(t + h, y.map((v, j) => v + h * k3[j])); y = y.map((v, j) => v + h / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])); t += h; } return y; },
    // eliminación de Gauss con pivoteo
    solve: (A0, b0) => { const n = A0.length, A = A0.map((r, i) => r.concat([b0[i]])); for (let c = 0; c < n; c++) { let p = c; for (let i = c + 1; i < n; i++) if (Math.abs(A[i][c]) > Math.abs(A[p][c])) p = i; [A[c], A[p]] = [A[p], A[c]]; for (let i = 0; i < n; i++) if (i !== c) { const f = A[i][c] / A[c][c]; for (let j = c; j <= n; j++) A[i][j] -= f * A[c][j]; } } return A.map((r, i) => r[n] / r[i]); },
    golden: (f, a, b) => { const g = (Math.sqrt(5) - 1) / 2; let x1 = b - g * (b - a), x2 = a + g * (b - a), f1 = f(x1), f2 = f(x2); for (let i = 0; i < 200; i++) { if (f1 < f2) { b = x2; x2 = x1; f2 = f1; x1 = b - g * (b - a); f1 = f(x1); } else { a = x1; x1 = x2; f1 = f2; x2 = a + g * (b - a); f2 = f(x2); } } return (a + b) / 2; },
    // campo y potencial de cargas puntuales en el plano: cargas [[q, x, y], …] (SI)
    field: (Q, x, y) => Q.reduce((s, [q, a, b]) => { const dx = x - a, dy = y - b, r = Math.hypot(dx, dy); return [s[0] + F.k * q * dx / r ** 3, s[1] + F.k * q * dy / r ** 3]; }, [0, 0]),
    pot: (Q, x, y) => Q.reduce((s, [q, a, b]) => s + F.k * q / Math.hypot(x - a, y - b), 0)
  };
  F.uC = q => `${q < 0 ? "-" : ""}${Math.abs(q)}\\ \\mu\\text{C}`;
})();

/* =====================================================================
 *  UNIDAD 1 · CARGA ELÉCTRICA Y CAMPO ELÉCTRICO
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, F = E.f2a, nf = F.nf;
  const T = {};
  const K = R`k = 8{,}99\times10^9\ \text{N m}^2/\text{C}^2`;

  T["f2a-coulomb-num"] = {
    type: "numeric", concepts: ["f2a-coulomb"], difficulty: 2,
    generate(r) {
      const q = [r.nz(-9, 9), r.nz(-9, 9), r.nz(-9, 9)], d = r.int(10, 40), x3 = r.pick([-1, 1, 2]) === 1 ? d * r.pick([0.25, 0.5, 0.75]) : r.pick([-1, 2]) === -1 ? -r.int(5, 20) : d + r.int(5, 20);
      const xs = [0, d, x3].map(v => v / 100), Q = q.map(v => v * 1e-6);
      const Fx = [0, 1].reduce((s, i) => s + F.k * Q[2] * Q[i] * Math.sign(xs[2] - xs[i]) / (xs[2] - xs[i]) ** 2, 0);
      return {
        prompt: `Sobre el eje $x$ hay tres cargas: $q_1 = ${F.uC(q[0])}$ en $x = 0$, $q_2 = ${F.uC(q[1])}$ en $x = ${d}$ cm y $q_3 = ${F.uC(q[2])}$ en $x = ${String(x3).replace(".", "{,}")}$ cm. ¿Cuál es la fuerza neta sobre $q_3$ (en N, positiva hacia $+x$)? ($${K}$)`,
        answer: Fx,
        solution: [`[[f2a-coulomb|Ley de Coulomb]]: cada carga ejerce $F = k\\frac{|q_iq_3|}{r^2}$, repulsiva si tienen el mismo signo. Por superposición se suman con su signo.`,
          ...[0, 1].map(i => { const f = F.k * Q[2] * Q[i] * Math.sign(xs[2] - xs[i]) / (xs[2] - xs[i]) ** 2; return `De $q_${i + 1}$: $r = ${nf(Math.abs(xs[2] - xs[i]))}$ m, $F_{${i + 1}} = ${nf(f)}$ N (${f > 0 ? "hacia $+x$" : "hacia $-x$"}).`; }),
          `Neta: $F = ${nf(Fx)}$ N.`],
        // otro camino: F = −dU/dx con la energía potencial de q₃
        verify: { kind: "value", tol: 1e-5, fn: () => { const U = x => [0, 1].reduce((s, i) => s + F.k * Q[2] * Q[i] / Math.abs(x - xs[i]), 0), h = 1e-7; return -(U(xs[2] + h) - U(xs[2] - h)) / (2 * h); } }
      };
    }
  };

  T["f2a-campo-num"] = {
    type: "numeric", concepts: ["f2a-campo-electrico"], difficulty: 2,
    generate(r) {
      const q = [r.nz(-8, 8), r.nz(-8, 8)], A = [0, 0], B = [r.int(2, 8), 0], P = [r.int(-3, 8), r.nz(2, 6)], ask = r.pick(["mod", "x", "y"]);
      const Q = [[q[0] * 1e-9, A[0] / 100, A[1] / 100], [q[1] * 1e-9, B[0] / 100, B[1] / 100]], Ev = F.field(Q, P[0] / 100, P[1] / 100), ans = { mod: Math.hypot(...Ev), x: Ev[0], y: Ev[1] }[ask];
      return {
        prompt: `Una carga $q_1 = ${q[0]}$ nC está en el origen y otra, $q_2 = ${q[1]}$ nC, en $(${B[0]}, 0)$ cm. En el punto $P = (${P[0]}, ${P[1]})$ cm, calculá ${{ mod: "el módulo del campo eléctrico", x: "la componente $x$ del campo eléctrico", y: "la componente $y$ del campo eléctrico" }[ask]} (en N/C). ($${K}$)`,
        answer: ans,
        solution: [`El [[f2a-campo-electrico|campo]] de cada carga es $\\vec E_i = k\\frac{q_i}{r_i^2}\\hat r_i$, con $\\hat r_i$ apuntando desde la carga hacia $P$; el total es la suma vectorial.`,
          `Sumando las componentes: $\\vec E \\approx (${nf(Ev[0])},\\ ${nf(Ev[1])})$ N/C${ask === "mod" ? `, de módulo $${nf(ans)}$ N/C` : ""}.`],
        // otro camino: E = −∇V con derivadas numéricas del potencial
        verify: { kind: "value", tol: 1e-5, fn: () => { const h = 1e-7, x = P[0] / 100, y = P[1] / 100; const ex = -(F.pot(Q, x + h, y) - F.pot(Q, x - h, y)) / (2 * h), ey = -(F.pot(Q, x, y + h) - F.pot(Q, x, y - h)) / (2 * h); return { mod: Math.hypot(ex, ey), x: ex, y: ey }[ask]; } }
      };
    }
  };

  T["f2a-cero-tf"] = {
    type: "tf", concepts: ["f2a-campo-electrico"], difficulty: 2,
    generate(r) {
      const q1 = r.int(1, 9), q2 = r.int(1, 9) * r.pick([1, 4]), d = r.int(10, 60), truth = r.bool();
      const x0 = d / (1 + Math.sqrt(q2 / q1)), claim = truth ? x0 : r.pick([d / 2, d * q1 / (q1 + q2)]);
      if ((!truth && Math.abs(claim - x0) < 0.05) || q1 === q2) return null;
      return {
        prompt: `<b>Verdadero o falso:</b> dos cargas positivas, $${q1}$ μC en $x = 0$ y $${q2}$ μC en $x = ${d}$ cm, producen un campo eléctrico nulo en $x \\approx ${nf(claim)}$ cm.`,
        answer: truth,
        explanation: `Entre las dos cargas los campos se oponen; se anulan donde $\\frac{q_1}{x^2} = \\frac{q_2}{(d - x)^2}$, o sea $\\frac{d - x}{x} = \\sqrt{\\frac{q_2}{q_1}}$: $x = \\frac{d}{1 + \\sqrt{q_2/q_1}} \\approx ${nf(x0)}$ cm (más cerca de la carga más chica). Es ${truth ? "verdadero" : "falso"}.`,
        solution: [R`Ver [[f2a-campo-electrico|campo eléctrico]]: el punto de campo nulo queda más cerca de la carga menor, no en el medio.`],
        // otro camino: se evalúa el campo total en el punto afirmado
        verify: { kind: "truth", fn: () => { const Q = [[q1 * 1e-6, 0, 0], [q2 * 1e-6, d / 100, 0]], Ex = F.field(Q, claim / 100, 0)[0], scale = F.k * q1 * 1e-6 / (claim / 100) ** 2; return Math.abs(Ex) < 1e-6 * scale; } }
      };
    }
  };

  T["f2a-linea-num"] = {
    type: "numeric", concepts: ["f2a-distribuciones"], difficulty: 3,
    generate(r) {
      const lam = r.nz(-9, 9), L = r.int(5, 50), d = r.int(2, 30), inf = r.bool();
      const l = lam * 1e-9, Lm = L / 100, dm = d / 100, ans = inf ? 2 * F.k * l / dm : 2 * F.k * l * Lm / (dm * Math.sqrt(dm * dm + Lm * Lm));
      return {
        prompt: inf ? `Un hilo recto muy largo tiene densidad lineal de carga $\\lambda = ${lam}$ nC/m. ¿Cuánto vale el campo eléctrico a $${d}$ cm del hilo (en N/C, positivo si apunta hacia afuera)? ($${K}$)`
          : `Una varilla recta de $${2 * L}$ cm tiene una carga uniforme de densidad $\\lambda = ${lam}$ nC/m. ¿Cuánto vale el campo eléctrico en un punto de su mediatriz a $${d}$ cm de la varilla (en N/C, positivo si se aleja de la varilla)? ($${K}$)`,
        answer: ans,
        solution: [`Cada elemento $dq = \\lambda\\,dx$ aporta $dE = k\\frac{\\lambda\\,dx}{x^2 + d^2}$; por simetría, las componentes paralelas a la varilla se cancelan y queda la perpendicular, $dE_\\perp = k\\frac{\\lambda d\\,dx}{(x^2 + d^2)^{3/2}}$ ([[f2a-distribuciones]]).`,
          inf ? `Integrando de $-\\infty$ a $\\infty$: $E = \\frac{2k\\lambda}{d} \\approx ${nf(ans)}$ N/C.` : `Integrando de $-L$ a $L$: $E = \\frac{2k\\lambda L}{d\\sqrt{d^2 + L^2}} \\approx ${nf(ans)}$ N/C.`],
        // otro camino: integración numérica de la componente perpendicular (con x = d·tan u si es infinita)
        verify: { kind: "value", tol: 1e-6, fn: () => inf ? F.simpson(u => F.k * l / dm * Math.cos(u), -Math.PI / 2, Math.PI / 2, 2000) : F.simpson(x => F.k * l * dm / (x * x + dm * dm) ** 1.5, -Lm, Lm, 4000) }
      };
    }
  };

  T["f2a-anillo-num"] = {
    type: "numeric", concepts: ["f2a-distribuciones"], difficulty: 3,
    generate(r) {
      const Q = r.nz(-9, 9), Rr = r.int(2, 15), x = r.int(1, 20), ask = r.pick(["E", "E", "max"]);
      const q = Q * 1e-9, Rm = Rr / 100, xm = x / 100, ans = ask === "E" ? F.k * q * xm / (xm * xm + Rm * Rm) ** 1.5 : Rr / Math.SQRT2;
      return {
        prompt: ask === "E" ? `Un anillo de radio $${Rr}$ cm tiene una carga $Q = ${Q}$ nC repartida uniformemente. ¿Cuánto vale el campo eléctrico sobre su eje a $${x}$ cm del centro (en N/C, positivo si se aleja del anillo)? ($${K}$)`
          : `Un anillo de radio $${Rr}$ cm está cargado uniformemente. ¿A qué distancia del centro (en cm), sobre el eje, el campo eléctrico es máximo?`,
        answer: ans,
        solution: [`Cada elemento $dq$ está a $\\sqrt{x^2 + R^2}$ del punto; por simetría solo sobrevive la componente axial: $E = \\frac{kQx}{(x^2 + R^2)^{3/2}}$ ([[f2a-distribuciones]]).`,
          ask === "E" ? `$E = \\frac{${nf(F.k)}\\cdot${Q}\\times10^{-9}\\cdot${nf(xm)}}{(${nf(xm)}^2 + ${nf(Rm)}^2)^{3/2}} \\approx ${nf(ans)}$ N/C.` : `Derivando e igualando a cero: $(x^2 + R^2) - 3x^2 = 0$, así que $x = \\frac{R}{\\sqrt2} \\approx ${nf(ans)}$ cm.`],
        // otro camino: se suma el campo de 2000 cargas puntuales repartidas en el anillo; el máximo, con sección áurea
        verify: { kind: "value", tol: 1e-6, fn: () => {
          const ring = xx => { let ex = 0; const N = 2000; for (let i = 0; i < N; i++) { const a = 2 * Math.PI * i / N, py = Rm * Math.cos(a), pz = Rm * Math.sin(a), d = Math.hypot(xx, py, pz); ex += F.k * (q / N) * xx / d ** 3; } return ex; };
          return ask === "E" ? ring(xm) : 100 * F.golden(xx => -Math.abs(ring(xx)), 0.0001, 3 * Rm);
        } }
      };
    }
  };

  T["f2a-flujo-num"] = {
    type: "numeric", concepts: ["f2a-gauss"], difficulty: 2, testN: 40,
    generate(r) {
      const a = r.int(10, 30) / 100, ins = r.int(1, 2), q = Array.from({ length: 3 }, () => r.nz(-9, 9));
      // las de adentro cerca del centro; la de afuera, lejos de las caras
      const pos = [[0.1, -0.15, 0.05], [-0.2, 0.1, -0.1], [0.9, 0.2, -0.3]].map((p, i) => p.map(c => c * a * (i < 2 ? 1 : 1.2)));
      const inside = q.slice(0, ins), qin = inside.reduce((s, x) => s + x, 0) * 1e-9, ans = qin / F.e0;
      if (qin === 0) return null;
      const used = q.slice(0, ins).concat([q[2]]);
      return {
        prompt: `Un cubo de $${nf(a * 100)}$ cm de arista tiene adentro ${ins === 1 ? `una carga de $${q[0]}$ nC` : `cargas de $${q[0]}$ nC y $${q[1]}$ nC`}, y afuera, cerca de una cara, otra de $${q[2]}$ nC. ¿Cuál es el flujo eléctrico total a través de la superficie del cubo (en N m²/C)? ($\\varepsilon_0 = 8{,}854\\times10^{-12}$ C²/(N m²))`,
        answer: ans,
        solution: [`[[f2a-gauss|Ley de Gauss]]: el flujo por una superficie cerrada depende solo de la carga encerrada, $\\Phi = \\frac{q_{enc}}{\\varepsilon_0}$; la carga de afuera aporta flujo que entra y sale, y su neto es cero.`,
          `$q_{enc} = ${qin * 1e9}$ nC, así que $\\Phi = \\frac{${qin * 1e9}\\times10^{-9}}{8{,}854\\times10^{-12}} \\approx ${nf(ans)}$ N m²/C.`],
        // otro camino: integral de superficie numérica del campo de las tres cargas sobre las seis caras
        verify: { kind: "value", tol: 2e-3, fn: () => {
          const ch = used.map((qq, i) => [qq * 1e-9, ...(i < ins ? pos[i] : pos[2])]), h = a / 2, n = 120;
          const E3 = (x, y, z) => ch.reduce((s, [qq, px, py, pz]) => { const dx = x - px, dy = y - py, dz = z - pz, rr = Math.hypot(dx, dy, dz) ** 3; return [s[0] + F.k * qq * dx / rr, s[1] + F.k * qq * dy / rr, s[2] + F.k * qq * dz / rr]; }, [0, 0, 0]);
          let flux = 0;
          for (let ax = 0; ax < 3; ax++) for (const sg of [-1, 1]) {
            const face = (u, v) => { const p = [0, 0, 0]; p[ax] = sg * h; p[(ax + 1) % 3] = u; p[(ax + 2) % 3] = v; return sg * E3(...p)[ax]; };
            flux += F.simpson(u => F.simpson(v => face(u, v), -h, h, n), -h, h, n);
          }
          return flux;
        } }
      };
    }
  };

  T["f2a-gauss-num"] = {
    type: "numeric", concepts: ["f2a-gauss"], difficulty: 3,
    generate(r) {
      const kind = r.pick(["esfera-in", "esfera-out", "plano"]);
      if (kind === "plano") {
        const s = r.nz(-9, 9), sg = s * 1e-9, ans = sg / (2 * F.e0);
        return {
          prompt: `Un plano muy grande tiene una densidad superficial de carga uniforme $\\sigma = ${s}$ nC/m². ¿Cuánto vale el campo eléctrico cerca del plano (en N/C, positivo si se aleja del plano)? ($\\varepsilon_0 = 8{,}854\\times10^{-12}$)`,
          answer: ans,
          solution: [`Por simetría, $\\vec E$ es perpendicular al plano y tiene el mismo módulo a los dos lados. Con una [[f2a-gauss|superficie gaussiana]] cilíndrica que atraviesa el plano (tapas de área $A$): $2EA = \\frac{\\sigma A}{\\varepsilon_0}$.`, `$E = \\frac{\\sigma}{2\\varepsilon_0} \\approx ${nf(ans)}$ N/C, sin importar la distancia (mientras el plano parezca infinito).`],
          // otro camino: disco enorme, sumando anillos (con s = z·tan u para que el integrando sea suave)
          verify: { kind: "value", tol: 1e-4, fn: () => { const z = 0.01, umax = Math.atan(1e5); return F.simpson(u => 2 * Math.PI * F.k * sg * Math.sin(u), 0, umax, 2000); } }
        };
      }
      const Q = r.nz(-9, 9), Rr = r.int(5, 20), rr = kind === "esfera-in" ? r.int(1, Rr - 1) : Rr + r.int(1, 30), q = Q * 1e-9, Rm = Rr / 100, rm = rr / 100;
      const ans = kind === "esfera-in" ? F.k * q * rm / Rm ** 3 : F.k * q / rm ** 2;
      return {
        prompt: `Una esfera aislante de radio $${Rr}$ cm tiene una carga $Q = ${Q}$ nC repartida uniformemente en su volumen. ¿Cuánto vale el campo eléctrico a $${rr}$ cm del centro (en N/C, positivo si apunta hacia afuera)? ($${K}$)`,
        answer: ans,
        solution: [`Por simetría esférica, $\\vec E$ es radial y depende solo de $r$. Con una [[f2a-gauss|esfera gaussiana]] de radio $r$: $E\\cdot 4\\pi r^2 = \\frac{q_{enc}}{\\varepsilon_0}$.`,
          kind === "esfera-in" ? `Adentro, $q_{enc} = Q\\frac{r^3}{R^3}$, así que $E = \\frac{kQr}{R^3} \\approx ${nf(ans)}$ N/C: crece linealmente con $r$.` : `Afuera, $q_{enc} = Q$ y $E = \\frac{kQ}{r^2} \\approx ${nf(ans)}$ N/C, como si toda la carga estuviera en el centro.`],
        // otro camino: se integra el campo de Coulomb de toda la esfera, cáscara por cáscara (en esféricas, con simetría axial).
        // El ángulo va como t = πv² para resolver el pico cerca de t = 0, y la integral radial se parte en r (punto medio, sin evaluar s = r).
        verify: { kind: "value", tol: 1e-4, fn: () => {
          const rho = q / (4 / 3 * Math.PI * Rm ** 3);
          const shell = s => F.simpson(v => { const t = Math.PI * v * v, d2 = rm * rm + s * s - 2 * rm * s * Math.cos(t); return 2 * Math.PI * v * Math.sin(t) * (rm - s * Math.cos(t)) / d2 ** 1.5; }, 0, 1, 600);
          const g = s => F.k * rho * 2 * Math.PI * s * s * shell(s);
          const mid = (a, b, n) => { let t = 0; for (let i = 0; i < n; i++) t += g(a + (i + 0.5) * (b - a) / n); return t * (b - a) / n; };
          return mid(0, Math.min(rm, Rm), 200) + (rm < Rm ? mid(rm, Rm, 200) : 0);
        } }
      };
    }
  };
  T["f2a-gauss-num"].testN = 60;

  const cards = {
    "f2a-carga": {
      title: "Carga eléctrica, conductores y aisladores", aliases: ["carga eléctrica", "cuantización de la carga", "conservación de la carga", "conductor eléctrico", "aislante eléctrico", "inducción electrostática"], concepts: ["f2a-coulomb"],
      summary: "La carga viene en múltiplos de e = 1,602 × 10⁻¹⁹ C, se conserva y puede ser positiva o negativa. En los conductores hay cargas libres; en los aisladores, no.",
      def: [R`**Carga eléctrica:** propiedad de la materia que produce fuerzas eléctricas. Hay dos tipos (positiva y negativa): las del mismo signo se repelen y las de signo contrario se atraen. Unidad: el coulomb (C).`,
        R`**Cuantización:** toda carga es un múltiplo entero de la carga elemental $e = 1{,}602\times10^{-19}$ C (la del protón; la del electrón es $-e$). **Conservación:** en un sistema aislado la carga total no cambia.`,
        R`**Conductores:** tienen cargas que se mueven libremente (electrones en los metales). **Aisladores:** sus cargas no pueden desplazarse. **Inducción:** al acercar un cuerpo cargado a un conductor, sus cargas libres se reacomodan; si se lo conecta a tierra, puede quedar cargado sin tocarlo.`],
      idea: [R`Frotar un globo no «crea» carga: le pasa electrones de un cuerpo a otro. El globo queda con exceso de electrones y el pelo con el mismo defecto, y la suma sigue siendo cero.`],
      tips: [R`Un cuerpo neutro también puede ser atraído por uno cargado: sus cargas se reacomodan (se polariza) y las de signo opuesto quedan más cerca.`],
      see: ["f2a-coulomb", "f2a-conductores"]
    },
    "f2a-coulomb": {
      title: "Ley de Coulomb y superposición", aliases: ["ley de Coulomb", "fuerza eléctrica", "constante de Coulomb", "principio de superposición"], concepts: ["f2a-coulomb"],
      summary: "F = k|q₁q₂|/r², con k = 1/(4πε₀) ≈ 8,99 × 10⁹ N m²/C², sobre la recta que une las cargas. Con varias cargas, las fuerzas se suman como vectores.",
      def: [R`**Ley de Coulomb:** dos cargas puntuales $q_1$ y $q_2$ a distancia $r$ se ejercen fuerzas iguales y opuestas, sobre la recta que las une, de módulo $$F = k\frac{|q_1q_2|}{r^2},\qquad k = \frac{1}{4\pi\varepsilon_0} \approx 8{,}99\times10^9\ \tfrac{\text{N m}^2}{\text{C}^2},$$ repulsivas si las cargas tienen el mismo signo y atractivas si no. $\varepsilon_0 = 8{,}854\times10^{-12}$ C²/(N m²) es la permitividad del vacío.`,
        R`**Superposición:** la fuerza sobre una carga debida a varias otras es la suma [[f1-vectores|vectorial]] de las fuerzas que cada una le haría sola.`,
        R`En forma vectorial: la fuerza de $q_1$ sobre $q_2$ es $\vec F_{12} = k\frac{q_1q_2}{r^2}\hat r_{12}$, con $\hat r_{12}$ el versor de $q_1$ hacia $q_2$.`],
      idea: [R`Tiene la misma forma que la [[f1-gravitacion|gravitación de Newton]] (inversa del cuadrado), pero es muchísimo más fuerte y puede ser repulsiva. Entre un protón y un electrón, la fuerza eléctrica es unas $10^{39}$ veces la gravitatoria.`,
        R`La inversa del cuadrado tiene una lectura geométrica: el «efecto» de la carga se reparte sobre esferas cuya área crece como $r^2$. Eso es lo que expresa la [[f2a-gauss|ley de Gauss]].`],
      examples: [{ q: R`Dos cargas de $2$ μC y $-3$ μC a $10$ cm.`, steps: [R`$F = 8{,}99\times10^9\cdot\frac{2\times10^{-6}\cdot3\times10^{-6}}{0{,}1^2} \approx 5{,}4$ N, atractiva.`] }],
      tips: [R`Usá metros y coulombs (1 μC = $10^{-6}$ C, 1 nC = $10^{-9}$ C). Los signos se manejan mejor con componentes que «a ojo».`],
      see: ["f2a-carga", "f2a-campo-electrico", "f1-vectores"]
    },
    "f2a-campo-electrico": {
      title: "Campo eléctrico, líneas de campo y dipolos", aliases: ["campo eléctrico", "líneas de campo eléctrico", "dipolo eléctrico", "momento dipolar"], concepts: ["f2a-campo-electrico"],
      summary: "E⃗ = F⃗/q₀: la fuerza por unidad de carga. Una carga puntual produce E = kq/r², radial. Las líneas de campo salen de las cargas positivas y entran en las negativas. Un dipolo tiene momento p = qd y en un campo siente un torque τ⃗ = p⃗ × E⃗.",
      def: [R`**Campo eléctrico:** $\vec E = \frac{\vec F}{q_0}$, la fuerza que sentiría una carga de prueba $q_0$ positiva, por unidad de carga. Unidad: N/C (o V/m). Una carga $q$ en ese punto siente $\vec F = q\vec E$.`,
        R`**Carga puntual:** $\vec E = k\frac{q}{r^2}\hat r$, hacia afuera si $q > 0$ y hacia adentro si $q < 0$. Con varias cargas, los campos se superponen.`,
        R`**Líneas de campo:** tangentes a $\vec E$ en cada punto, más juntas donde el campo es más intenso; salen de las cargas positivas, terminan en las negativas y nunca se cruzan.`,
        R`**Dipolo:** cargas $+q$ y $-q$ separadas $d$; momento dipolar $\vec p = q\vec d$ (de la negativa a la positiva). En un campo uniforme: torque $\vec\tau = \vec p\times\vec E$ y energía $U = -\vec p\cdot\vec E$.`],
      idea: [R`El campo separa el problema en dos: unas cargas crean el campo en todo el espacio, y después cualquier otra carga reacciona al campo que hay donde ella está. No hace falta saber quién lo creó.`],
      demo: [R`**Paso 1 (dipolo sobre su eje).** En un punto del eje a distancia $x$ del centro (con $x \gg d$), las cargas están a $x - \frac d2$ y $x + \frac d2$: $E = kq\left[\frac{1}{(x - d/2)^2} - \frac{1}{(x + d/2)^2}\right]$.`,
        R`**Paso 2.** Con denominador común, el corchete es $\frac{2xd}{(x^2 - d^2/4)^2}$, que para $x \gg d$ es $\approx \frac{2d}{x^3}$. Entonces $E \approx \frac{2kqd}{x^3} = \frac{2kp}{x^3}$: lejos, el campo de un dipolo cae como $\frac1{x^3}$, más rápido que el de una carga.`,
        R`**Paso 3 (torque).** En un campo uniforme las fuerzas sobre $+q$ y $-q$ son $\pm q\vec E$: la neta es cero, pero forman un par. Su torque respecto del centro es $2\cdot\frac d2\,qE\sin\theta = pE\sin\theta$, que es el módulo de $\vec p\times\vec E$. $\blacksquare$`],
      examples: [{ q: R`Campo de una carga de $5$ nC a $30$ cm.`, steps: [R`$E = 8{,}99\times10^9\cdot\frac{5\times10^{-9}}{0{,}09} \approx 500$ N/C, hacia afuera.`] }],
      tips: [R`El campo en un punto no depende de la carga que se ponga ahí: es una propiedad del lugar.`],
      see: ["f2a-coulomb", "f2a-distribuciones", "f2a-potencial"]
    },
    "f2a-distribuciones": {
      title: "Campo de distribuciones continuas de carga", aliases: ["distribución continua de carga", "densidad lineal de carga", "densidad superficial de carga", "anillo cargado", "hilo cargado"], concepts: ["f2a-distribuciones"],
      summary: "Se suma el campo de cada dq: E⃗ = ∫ k dq r̂/r². Hilo infinito: E = 2kλ/d. Anillo, sobre el eje: E = kQx/(x² + R²)^(3/2). Plano infinito: E = σ/(2ε₀).",
      def: [R`Con una carga repartida, se divide en elementos $dq$ ($\lambda\,dl$, $\sigma\,dA$ o $\rho\,dV$) y se integra: $\vec E = \int k\frac{dq}{r^2}\hat r$. Casi siempre conviene usar la simetría para ver qué componentes se cancelan.`,
        R`**Resultados:** varilla de largo $2L$, en su mediatriz a distancia $d$: $E = \frac{2k\lambda L}{d\sqrt{d^2 + L^2}}$ (hilo infinito: $\frac{2k\lambda}{d}$). Anillo de radio $R$, sobre el eje: $E = \frac{kQx}{(x^2 + R^2)^{3/2}}$. Plano infinito: $E = \frac{\sigma}{2\varepsilon_0}$.`],
      idea: [R`Lejos de cualquier distribución, el campo se parece al de una carga puntual con toda la carga: en el anillo, con $x \gg R$, $E \to \frac{kQ}{x^2}$. Cerca, la forma importa.`],
      demo: [R`**Paso 1 (anillo).** Todos los $dq$ están a la misma distancia $\sqrt{x^2 + R^2}$ del punto del eje, y su campo forma con el eje un ángulo de coseno $\frac{x}{\sqrt{x^2 + R^2}}$.`,
        R`**Paso 2.** Las componentes perpendiculares al eje se cancelan de a pares (cada $dq$ tiene otro diametralmente opuesto). La axial de cada uno es $k\frac{dq}{x^2 + R^2}\cdot\frac{x}{\sqrt{x^2 + R^2}}$, igual para todos, así que sumando: $E = \frac{kQx}{(x^2 + R^2)^{3/2}}$.`,
        R`**Paso 3 (varilla).** En la mediatriz, $dE_\perp = k\frac{\lambda d\,dx}{(x^2 + d^2)^{3/2}}$. Con $x = d\tan u$, $dx = d\sec^2u\,du$ y $(x^2 + d^2)^{3/2} = d^3\sec^3u$: queda $\frac{k\lambda}{d}\cos u\,du$, cuya integral es $\frac{k\lambda}{d}\sin u$.`,
        R`**Paso 4.** Entre $x = -L$ y $L$, $\sin u$ va de $-\frac{L}{\sqrt{L^2 + d^2}}$ a $\frac{L}{\sqrt{L^2 + d^2}}$: $E = \frac{2k\lambda L}{d\sqrt{d^2 + L^2}}$. Con $L \to \infty$, el cociente tiende a $1$ y queda $\frac{2k\lambda}{d}$. $\blacksquare$`],
      examples: [{ q: R`Hilo infinito con $\lambda = 2$ nC/m, a $5$ cm.`, steps: [R`$E = \frac{2\cdot8{,}99\times10^9\cdot2\times10^{-9}}{0{,}05} \approx 719$ N/C.`] }],
      tips: [R`Antes de integrar, dibujá dos elementos simétricos y fijate qué componente sobrevive.`],
      see: ["f2a-campo-electrico", "f2a-gauss"]
    },
    "f2a-gauss": {
      title: "Flujo eléctrico y ley de Gauss", aliases: ["ley de Gauss", "flujo eléctrico", "superficie gaussiana", "carga encerrada"], concepts: ["f2a-gauss"],
      summary: "Φ = ∮ E⃗·dA⃗ = q_enc/ε₀ por cualquier superficie cerrada. Con simetría permite calcular E: esfera cargada (afuera kQ/r², adentro kQr/R³), plano (σ/2ε₀), hilo (λ/2πε₀r).",
      def: [R`**Flujo eléctrico** por una superficie: $\Phi = \int \vec E\cdot d\vec A$ (para $\vec E$ uniforme y una superficie plana, $EA\cos\theta$). Cuenta cuántas líneas de campo la atraviesan.`,
        R`**Ley de Gauss:** para toda superficie cerrada, $\oint \vec E\cdot d\vec A = \frac{q_{enc}}{\varepsilon_0}$, donde $q_{enc}$ es la carga neta encerrada. Es equivalente a la ley de Coulomb, y es la versión integral del [[c2-flujo|teorema de la divergencia]] aplicado al campo.`,
        R`**Aplicaciones** (con la simetría): esfera de carga $Q$ uniforme en volumen, radio $R$: $E = \frac{kQ}{r^2}$ afuera y $\frac{kQr}{R^3}$ adentro. Plano infinito: $\frac{\sigma}{2\varepsilon_0}$. Hilo infinito: $\frac{\lambda}{2\pi\varepsilon_0r}$.`],
      idea: [R`Las líneas de campo nacen en las cargas positivas y mueren en las negativas. Contar las que salen de una superficie cerrada es contar la carga de adentro; una carga de afuera manda líneas que entran y vuelven a salir, y no suma nada.`],
      demo: [R`**Paso 1 (carga puntual en una esfera).** Sobre una esfera de radio $r$ centrada en $q$, $\vec E$ es radial y vale $\frac{kq}{r^2}$ en todos lados, paralelo a $d\vec A$. El flujo es $\frac{kq}{r^2}\cdot4\pi r^2 = 4\pi kq = \frac{q}{\varepsilon_0}$, sin importar $r$.`,
        R`**Paso 2 (cualquier superficie).** Para una superficie cerrada arbitraria alrededor de $q$, el flujo por cada pedacito es $\frac{q}{4\pi\varepsilon_0}d\Omega$, donde $d\Omega$ es el ángulo sólido que el pedacito ve desde la carga. Sumando todo el ángulo sólido ($4\pi$) vuelve a dar $\frac{q}{\varepsilon_0}$. Si la carga está afuera, cada cono corta la superficie dos veces (entra y sale) y los aportes se cancelan.`,
        R`**Paso 3.** Por superposición vale para cualquier conjunto de cargas: solo cuentan las de adentro.`,
        R`**Paso 4 (esfera maciza).** Por simetría, $E$ es radial y depende de $r$: $\oint\vec E\cdot d\vec A = E\cdot4\pi r^2$. Adentro, la carga encerrada es la fracción de volumen $Q\frac{r^3}{R^3}$; igualando, $E = \frac{Qr}{4\pi\varepsilon_0R^3} = \frac{kQr}{R^3}$. Afuera, $q_{enc} = Q$ y queda $\frac{kQ}{r^2}$. $\blacksquare$`],
      examples: [{ q: R`Esfera de radio $10$ cm con $Q = 4$ nC; campo a $5$ cm del centro.`, steps: [R`$E = \frac{8{,}99\times10^9\cdot4\times10^{-9}\cdot0{,}05}{0{,}001} \approx 1800$ N/C.`] }],
      tips: [R`La ley de Gauss vale siempre, pero solo sirve para calcular $E$ cuando la simetría permite sacarlo de la integral.`],
      see: ["f2a-campo-electrico", "f2a-conductores", "c2-flujo"]
    },
    "f2a-conductores": {
      title: "Conductores en equilibrio electrostático", aliases: ["equilibrio electrostático", "jaula de Faraday", "conductores en equilibrio"], concepts: ["f2a-gauss"],
      summary: "En equilibrio, el campo dentro de un conductor es cero, toda la carga neta está en la superficie y el campo justo afuera es perpendicular a ella y vale σ/ε₀.",
      def: [R`**Equilibrio electrostático:** las cargas libres del conductor ya no se mueven. Entonces: (1) $\vec E = \vec 0$ en el interior; (2) la carga neta está en la superficie; (3) justo afuera, $\vec E$ es perpendicular a la superficie y vale $\frac{\sigma}{\varepsilon_0}$; (4) todo el conductor está al mismo [[f2a-potencial|potencial]].`,
        R`**Cavidad vacía** dentro de un conductor: el campo adentro es cero aunque haya campos afuera (jaula de Faraday).`],
      idea: [R`Si adentro hubiera campo, las cargas libres se moverían y no estaríamos en equilibrio. Las cargas se reacomodan justo lo necesario para anular el campo interior.`],
      demo: [R`**Paso 1 (campo nulo).** Si $\vec E \neq \vec 0$ en algún punto interior, los electrones libres sentirían una fuerza y se moverían: contradice el equilibrio.`,
        R`**Paso 2 (carga en la superficie).** Tomemos una superficie gaussiana cualquiera dentro del material. Como $\vec E = \vec 0$ en todos sus puntos, el flujo es cero, y por la [[f2a-gauss|ley de Gauss]] la carga encerrada es cero. Como vale para superficies tan cerca del borde como queramos, la carga neta solo puede estar en la superficie.`,
        R`**Paso 3 (campo afuera).** Si $\vec E$ tuviera componente tangente a la superficie, movería las cargas superficiales: tiene que ser perpendicular. Con un cilindrito gaussiano que atraviesa la superficie (tapa de área $A$ afuera, la de adentro con campo nulo): $EA = \frac{\sigma A}{\varepsilon_0}$, así que $E = \frac{\sigma}{\varepsilon_0}$. $\blacksquare$`],
      examples: [{ q: R`Una esfera conductora tiene $Q = 3$ nC. ¿Dónde está la carga y cuánto vale el campo adentro?`, steps: [R`Toda la carga está en la superficie y $E = 0$ adentro; afuera es $\frac{kQ}{r^2}$.`] }],
      tips: [R`Afuera de un conductor el campo es $\frac{\sigma}{\varepsilon_0}$, el doble que el de un plano aislado ($\frac{\sigma}{2\varepsilon_0}$): las líneas salen solo hacia un lado.`],
      see: ["f2a-gauss", "f2a-carga", "f2a-potencial"]
    }
  };

  E.extendCourse("f102a", {
    concepts: { "f2a-coulomb": { name: "Ley de Coulomb" }, "f2a-campo-electrico": { name: "Campo eléctrico" }, "f2a-distribuciones": { name: "Distribuciones continuas" }, "f2a-gauss": { name: "Ley de Gauss" } },
    templates: T,
    units: [{
      id: "f2a-campo-u", order: 1, program: "Unidad 1", title: "Carga eléctrica y campo eléctrico", icon: "zap",
      diagnostic: ["f2a-coulomb-num", "f2a-campo-num", "f2a-gauss-num"],
      lessons: [
        { id: "f2a-campo-l1", title: "Coulomb y el campo eléctrico", templates: ["f2a-coulomb-num", "f2a-campo-num", "f2a-cero-tf"], theory: ["f2a-carga", "f2a-coulomb", "f2a-campo-electrico"],
          intro: R`$F = k\frac{|q_1q_2|}{r^2}$ y $\vec E = \frac{\vec F}{q_0}$: cada carga suma su parte.` },
        { id: "f2a-campo-l2", title: "Distribuciones continuas", templates: ["f2a-linea-num", "f2a-anillo-num"], theory: ["f2a-distribuciones"],
          intro: R`Se suma el campo de cada $dq$, y la simetría dice qué se cancela.` },
        { id: "f2a-campo-l3", title: "Ley de Gauss", templates: ["f2a-flujo-num", "f2a-gauss-num"], theory: ["f2a-gauss", "f2a-conductores"],
          intro: R`$\oint\vec E\cdot d\vec A = \frac{q_{enc}}{\varepsilon_0}$: el flujo cuenta la carga de adentro.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 2 · POTENCIAL ELÉCTRICO
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, F = E.f2a, nf = F.nf;
  const T = {};
  const K = R`k = 8{,}99\times10^9\ \text{N m}^2/\text{C}^2`;
  const cm = v => String(v).replace(".", "{,}");
  // potencial por otro camino: V(P) = ∫ E·dl desde P hasta el infinito, por una semirrecta vertical hacia arriba (u = tan w)
  const lineV = (Q, x, y) => F.simpson(w => { const c = Math.cos(w); return F.field(Q, x, y + Math.tan(w))[1] / (c * c); }, 0, Math.PI / 2 * (1 - 1e-9), 2000);
  // potencial de una cáscara esférica de radio s y carga unitaria por área, sumando 1/d (θ = πv² para resolver el pico cerca de θ = 0)
  const shellV = (s, r) => F.simpson(v => { const t = Math.PI * v * v; return 2 * Math.PI * v * 2 * Math.PI * s * s * Math.sin(t) / Math.sqrt(r * r + s * s - 2 * r * s * Math.cos(t)); }, 0, 1, 600);

  T["f2a-potencial-num"] = {
    type: "numeric", concepts: ["f2a-potencial"], difficulty: 2,
    generate(r) {
      const n = r.pick([2, 3]), xs = r.distinct(n, -6, 6), q = xs.map(() => r.nz(-9, 9)), P = [r.int(-6, 6), r.int(2, 8)];
      const Q = q.map((v, i) => [v * 1e-9, xs[i] / 100, 0]), V = F.pot(Q, P[0] / 100, P[1] / 100);
      const lst = q.map((v, i) => `$q_${i + 1} = ${v}$ nC en $(${xs[i]}, 0)$ cm`);
      return {
        prompt: `Hay ${n} cargas puntuales: ${lst.slice(0, -1).join(", ")} y ${lst[n - 1]}. ¿Cuánto vale el potencial eléctrico en $P = (${P[0]}, ${P[1]})$ cm (en V, tomando $V = 0$ en el infinito)? ($${K}$)`,
        answer: V,
        solution: [`El [[f2a-potencial|potencial]] es un escalar: se suman los $V_i = \\frac{kq_i}{r_i}$, cada uno con el signo de su carga, sin componentes.`,
          ...q.map((v, i) => { const d = Math.hypot(P[0] - xs[i], P[1]) / 100; return `$r_${i + 1} = ${nf(d)}$ m, $V_${i + 1} = ${nf(F.k * v * 1e-9 / d)}$ V.`; }),
          `Total: $V \\approx ${nf(V)}$ V.`],
        // otro camino: integral de línea del campo desde P hasta el infinito
        verify: { kind: "value", tol: 1e-5, fn: () => lineV(Q, P[0] / 100, P[1] / 100) }
      };
    }
  };
  T["f2a-potencial-num"].testN = 100;

  T["f2a-energia-num"] = {
    type: "numeric", concepts: ["f2a-energia-el"], difficulty: 3,
    generate(r) {
      const q = [r.nz(-6, 6), r.nz(-6, 6), r.nz(-6, 6)], a = r.int(2, 10), C = [r.int(-4, 12), r.int(2, 10)], ask = r.pick(["U", "W3"]);
      const P = [[0, 0], [a, 0], C].map(([x, y]) => [x / 100, y / 100]), Q = q.map((v, i) => [v * 1e-6, ...P[i]]);
      const d = (i, j) => Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]), U = (i, j) => F.k * Q[i][0] * Q[j][0] / d(i, j);
      const ans = ask === "U" ? U(0, 1) + U(0, 2) + U(1, 2) : U(0, 2) + U(1, 2);
      return {
        prompt: `Tres cargas puntuales: $q_1 = ${F.uC(q[0])}$ en $(0, 0)$, $q_2 = ${F.uC(q[1])}$ en $(${a}, 0)$ cm y $q_3 = ${F.uC(q[2])}$ en $(${C[0]}, ${C[1]})$ cm. ${ask === "U" ? "¿Cuál es la energía potencial eléctrica del sistema (en J), es decir, el trabajo necesario para armarlo trayendo las cargas desde el infinito?" : "Con $q_1$ y $q_2$ fijas, ¿qué trabajo (en J) hay que hacer para traer $q_3$ desde el infinito hasta su lugar, sin cambiar su energía cinética?"} ($${K}$)`,
        answer: ans,
        solution: [`La [[f2a-energia-potencial|energía potencial]] de un par es $U_{ij} = \\frac{kq_iq_j}{r_{ij}}$, con su signo. Distancias: $r_{12} = ${nf(d(0, 1))}$ m, $r_{13} = ${nf(d(0, 2))}$ m, $r_{23} = ${nf(d(1, 2))}$ m.`,
          ask === "U" ? `Se suman los tres pares: $U = ${nf(U(0, 1))} ${U(0, 2) < 0 ? "-" : "+"} ${nf(Math.abs(U(0, 2)))} ${U(1, 2) < 0 ? "-" : "+"} ${nf(Math.abs(U(1, 2)))} \\approx ${nf(ans)}$ J.`
            : `Solo cambian los pares en los que está $q_3$: $W = q_3V_{12}(P_3) = U_{13} + U_{23} = ${nf(U(0, 2))} ${U(1, 2) < 0 ? "-" : "+"} ${nf(Math.abs(U(1, 2)))} \\approx ${nf(ans)}$ J.`,
          ans < 0 ? `Sale negativo: el sistema se arma solo y hay que frenar las cargas.` : `Sale positivo: hay que empujar contra la repulsión neta.`],
        // otro camino: se arma el sistema de a una carga, integrando el campo de las anteriores hasta el infinito
        verify: { kind: "value", tol: 1e-5, fn: () => { const w2 = Q[1][0] * lineV([Q[0]], ...P[1]), w3 = Q[2][0] * lineV([Q[0], Q[1]], ...P[2]); return ask === "U" ? w2 + w3 : w3; } }
      };
    }
  };
  T["f2a-energia-num"].testN = 100;

  T["f2a-acelera-num"] = {
    type: "numeric", concepts: ["f2a-energia-el"], difficulty: 3,
    generate(r) {
      if (r.bool()) {
        const p = r.pick([{ n: "un protón", q: F.qe, m: F.mp }, { n: "un electrón", q: -F.qe, m: F.me }]), dV = r.int(1, 50) * 10, dmm = r.int(2, 20), dm = dmm / 1000;
        const v = Math.sqrt(2 * F.qe * dV / p.m), Ef = dV / dm;
        return {
          prompt: `Entre dos placas paralelas separadas $${dmm}$ mm hay una diferencia de potencial de $${dV}$ V. Se suelta ${p.n} en reposo junto a ${p.q > 0 ? "la placa positiva" : "la placa negativa"}. ¿Con qué rapidez llega a la otra placa (en m/s)? ($e = 1{,}602\\times10^{-19}$ C, $m_${p.q > 0 ? "p" : "e"} = ${p.q > 0 ? "1{,}673\\times10^{-27}" : "9{,}109\\times10^{-31}"}$ kg)`,
          answer: v,
          solution: [`La fuerza eléctrica es conservativa: la [[f2a-energia-potencial|energía potencial]] que pierde la partícula, $|q|\\Delta V$, se vuelve cinética.`,
            `$\\frac12mv^2 = e\\,\\Delta V \\Rightarrow v = \\sqrt{\\frac{2e\\,\\Delta V}{m}} \\approx ${nf(v)}$ m/s. La separación entre placas no importa: solo la diferencia de potencial.`],
          // otro camino: movimiento con aceleración constante qE/m (RK4) hasta recorrer la separación
          verify: { kind: "ode", f: (_, y) => [y[1], F.qe * Ef / p.m], y0: [0, 0], t1: 0, until: (_, y) => y[0] >= dm, g: (_, y) => y[0] - dm, dt: dm / v / 4000, out: (_, y) => y[1] }
        };
      }
      const Qf = r.int(1, 9), q = r.int(1, 5), sg = r.pick([1, -1]), m = r.int(1, 20), r0 = r.int(20, 100), v0 = r.int(2, 20);
      const kqQ = F.k * Qf * q * 1e-12, mk = m / 1000, R0 = r0 / 100, rmin = kqQ / (0.5 * mk * v0 * v0 + kqQ / R0);
      return {
        prompt: `Una carga $Q = ${sg * Qf}$ μC está fija. Una esferita de $${m}$ g con carga $q = ${sg * q}$ μC se lanza directo hacia ella desde $${r0}$ cm de distancia, con rapidez $${v0}$ m/s. ¿A qué distancia mínima de $Q$ llega (en cm)? ($${K}$; sin gravedad)`,
        answer: rmin * 100,
        solution: [`Las cargas tienen el mismo signo y se repelen: la esferita frena hasta detenerse en $r_{min}$. Se conserva la energía, con la [[f2a-energia-potencial|energía potencial]] $U = \\frac{kqQ}{r}$.`,
          `$\\frac12mv_0^2 + \\frac{kqQ}{r_0} = \\frac{kqQ}{r_{min}}$: $${nf(0.5 * mk * v0 * v0)} + ${nf(kqQ / R0)} = \\frac{${nf(kqQ)}}{r_{min}}$, así que $r_{min} \\approx ${nf(rmin)}$ m $\\approx ${nf(rmin * 100)}$ cm.`],
        // otro camino: se integra el movimiento (RK4) hasta que la velocidad radial se anula
        verify: { kind: "ode", f: (_, y) => [y[1], kqQ / (mk * y[0] * y[0])], y0: [R0, -v0], t1: 0, until: (_, y) => y[1] >= 0, g: (_, y) => y[1], dt: Math.min(R0, 5 * rmin) / v0 / 3000, out: (_, y) => y[0] * 100 }
      };
    }
  };
  T["f2a-acelera-num"].testN = 100;

  T["f2a-gradiente-num"] = {
    type: "numeric", concepts: ["f2a-potencial"], difficulty: 2,
    generate(r) {
      const a = r.nz(-9, 9), b = r.nz(-9, 9), c = r.nz(-9, 9), P = [r.nz(-3, 3), r.nz(-3, 3), r.nz(-3, 3)], ask = r.pick([0, 1, 2]);
      const V = (x, y, z) => a * x * x * y + b * y * z + c * z * z;
      const g = [2 * a * P[0] * P[1], a * P[0] * P[0] + b * P[2], b * P[1] + 2 * c * P[2]], ans = -g[ask], nm = ["x", "y", "z"][ask];
      return {
        prompt: `En cierta región el potencial eléctrico es $V(x, y, z) = ${H.poly([[a, "x^{2}y"], [b, "yz"], [c, "z^{2}"]])}$ (en V, con las coordenadas en m). ¿Cuánto vale la componente $E_${nm}$ del campo eléctrico en el punto $(${P.join(", ")})$ (en V/m)?`,
        answer: ans,
        solution: [`El campo es menos el [[f2a-gradiente-potencial|gradiente del potencial]]: $E_${nm} = -\\frac{\\partial V}{\\partial ${nm}}$.`,
          `$\\frac{\\partial V}{\\partial ${nm}} = ${[`${2 * a}xy`, H.poly([[a, "x^{2}"], [b, "z"]]), H.poly([[b, "y"], [2 * c, "z"]])][ask]}$; en el punto vale $${g[ask]}$, así que $E_${nm} = ${ans}$ V/m.`],
        // otro camino: derivada numérica del potencial
        verify: { kind: "value", tol: 1e-6, fn: () => { const h = 1e-5, e = [0, 0, 0]; e[ask] = h; const p1 = P.map((v, i) => v + e[i]), p0 = P.map((v, i) => v - e[i]); return -(V(...p1) - V(...p0)) / (2 * h); } }
      };
    }
  };

  T["f2a-esfera-pot-num"] = {
    type: "numeric", concepts: ["f2a-potencial"], difficulty: 3,
    generate(r) {
      const cond = r.bool(), Qn = r.nz(-9, 9), Rr = r.int(5, 20), inside = r.bool(), rr = inside ? r.int(0, Rr - 1) : Rr + r.int(1, 30);
      const Q = Qn * 1e-9, Rm = Rr / 100, rm = rr / 100;
      const ans = !inside ? F.k * Q / rm : cond ? F.k * Q / Rm : F.k * Q * (3 * Rm * Rm - rm * rm) / (2 * Rm ** 3);
      return {
        prompt: `${cond ? "Una esfera conductora" : "Una esfera aislante con la carga repartida uniformemente en su volumen"}, de radio $${Rr}$ cm, tiene carga $Q = ${Qn}$ nC. ¿Cuánto vale el potencial ${rr === 0 ? "en el centro" : `a $${rr}$ cm del centro`} (en V, con $V = 0$ en el infinito)? ($${K}$)`,
        answer: ans,
        solution: [`Se integra el campo desde el infinito: $V(r) = \\int_r^\\infty E\\,dr'$, usando el campo que da la [[f2a-gauss|ley de Gauss]] en cada zona.`,
          !inside ? `Afuera, $E = \\frac{kQ}{r^2}$ y queda $V = \\frac{kQ}{r} \\approx ${nf(ans)}$ V, como para una carga puntual.`
            : cond ? `Afuera el potencial en la superficie es $\\frac{kQ}{R}$, y adentro de un conductor $E = 0$: el potencial no cambia. $V = \\frac{kQ}{R} \\approx ${nf(ans)}$ V en todo el interior.`
              : `Hasta la superficie se acumula $\\frac{kQ}{R}$; adentro $E = \\frac{kQr}{R^3}$ y se suma $\\int_r^R \\frac{kQr'}{R^3}dr' = \\frac{kQ(R^2 - r^2)}{2R^3}$. Total: $V = \\frac{kQ(3R^2 - r^2)}{2R^3} \\approx ${nf(ans)}$ V.`],
        // otro camino: suma directa de k·dq/d sobre la carga (cáscaras esféricas; la integral radial se parte en r)
        verify: { kind: "value", tol: 1e-4, fn: () => {
          if (cond) return F.k * Q / (4 * Math.PI * Rm * Rm) * shellV(Rm, rm);
          const rho = Q / (4 / 3 * Math.PI * Rm ** 3), g = s => F.k * rho * shellV(s, rm);
          const mid = (a, b, n) => { let t = 0; for (let i = 0; i < n; i++) t += g(a + (i + 0.5) * (b - a) / n); return t * (b - a) / n; };
          return mid(0, Math.min(rm, Rm), 200) + (rm < Rm ? mid(rm, Rm, 200) : 0);
        } }
      };
    }
  };
  T["f2a-esfera-pot-num"].testN = 60;

  T["f2a-medio-tf"] = {
    type: "tf", concepts: ["f2a-potencial"], difficulty: 2,
    generate(r) {
      const a = r.int(1, 9), b = r.pick([a, -a, r.nz(-9, 9)]), d = r.int(2, 20), what = r.pick(["V", "E"]);
      const truth = what === "V" ? a + b === 0 : a === b;
      return {
        prompt: `<b>Verdadero o falso:</b> dos cargas puntuales, $q_1 = ${a}$ nC y $q_2 = ${b}$ nC, están separadas $${d}$ cm. En el punto medio entre ellas, ${what === "V" ? "el potencial eléctrico es cero (con $V = 0$ en el infinito)" : "el campo eléctrico es cero"}.`,
        answer: truth,
        explanation: what === "V" ? `En el punto medio $V = \\frac{k(q_1 + q_2)}{d/2}$: es cero solo si las cargas son opuestas. ${truth ? "Acá lo son" : "Acá no lo son"}, así que es ${truth ? "verdadero" : "falso"}. (Aunque $V$ sea cero, el campo no lo es: los dos campos apuntan hacia la negativa.)`
          : `En el punto medio los campos de las dos cargas tienen sentidos opuestos si las cargas tienen el mismo signo, y se anulan solo si además son iguales. ${truth ? "Acá son iguales" : "Acá no son iguales"}: es ${truth ? "verdadero" : "falso"}.${truth ? " (El potencial, en cambio, no es cero.)" : ""}`,
        solution: [R`Ver [[f2a-gradiente-potencial|campo y potencial]]: que $V$ sea cero en un punto no dice nada de $\vec E$ ahí, y al revés.`],
        // otro camino: se evalúan V y E con la superposición numérica
        verify: { kind: "truth", fn: () => { const Q = [[a * 1e-9, 0, 0], [b * 1e-9, d / 100, 0]], x = d / 200, sc = F.k * a * 1e-9 / x; return what === "V" ? Math.abs(F.pot(Q, x, 0)) < 1e-9 * sc : Math.hypot(...F.field(Q, x, 0)) < 1e-9 * sc / x; } }
      };
    }
  };

  const cards = {
    "f2a-energia-potencial": {
      title: "Energía potencial eléctrica", aliases: ["energía potencial eléctrica", "energía de un sistema de cargas", "electrón-volt"], concepts: ["f2a-energia-el"],
      summary: "La fuerza eléctrica es conservativa. Dos cargas tienen U = kq₁q₂/r (cero en el infinito); un sistema, la suma sobre todos los pares. 1 eV = 1,602 × 10⁻¹⁹ J.",
      def: [R`**Energía potencial de dos cargas:** $U = \frac{kq_1q_2}{r}$, tomando $U = 0$ cuando están infinitamente separadas. Es positiva si se repelen y negativa si se atraen.`,
        R`**Sistema de cargas:** $U = \sum_{i<j}\frac{kq_iq_j}{r_{ij}}$, una vez por cada par. Es el trabajo que hay que hacer para armar el sistema trayendo las cargas desde el infinito, de a una y sin darles energía cinética.`,
        R`**Electrón-volt:** la energía que gana una carga $e$ al atravesar una diferencia de potencial de $1$ V: $1\ \text{eV} = 1{,}602\times10^{-19}$ J.`],
      idea: [R`Es la misma historia que la [[f1-energia|energía potencial]] de la mecánica: como el trabajo de la fuerza eléctrica no depende del camino, se puede guardar en una función de la posición. Si las cargas se atraen, separarlas cuesta trabajo; si se repelen, juntarlas.`],
      demo: [R`**Paso 1 (el trabajo no depende del camino).** La fuerza de $q$ sobre $q_0$ es radial: $\vec F = \frac{kqq_0}{r^2}\hat r$. En un desplazamiento $d\vec l$, solo cuenta la parte radial, porque $\hat r\cdot d\vec l = dr$. Entonces $dW = \frac{kqq_0}{r^2}dr$.`,
        R`**Paso 2.** Integrando entre los radios inicial y final: $W_{A\to B} = kqq_0\left(\frac1{r_A} - \frac1{r_B}\right)$. Solo depende de las distancias de partida y llegada, así que la fuerza es [[f1-trabajo|conservativa]].`,
        R`**Paso 3.** Se define $U$ con $W_{A\to B} = U_A - U_B$. Mirando el paso 2, $U = \frac{kqq_0}{r}$ cumple eso, y vale cero en el infinito.`,
        R`**Paso 4 (sistema).** Al traer la primera carga no se hace trabajo. La segunda cuesta $U_{12}$; la tercera, $U_{13} + U_{23}$ (por superposición, el trabajo contra cada carga se suma), y así. El total es la suma sobre los pares. $\blacksquare$`],
      examples: [{ q: R`Un protón y un electrón a $0{,}053$ nm (el átomo de hidrógeno).`, steps: [R`$U = -\frac{8{,}99\times10^9\,(1{,}602\times10^{-19})^2}{5{,}3\times10^{-11}} \approx -4{,}35\times10^{-18}$ J $\approx -27{,}2$ eV.`] }],
      tips: [R`Cada par se cuenta una sola vez. Si sumás $q_iV_i$ sobre todas las cargas, contás cada par dos veces: $U = \frac12\sum q_iV_i$.`],
      see: ["f2a-potencial", "f1-energia", "f2a-coulomb"]
    },
    "f2a-potencial": {
      title: "Potencial eléctrico", aliases: ["potencial eléctrico", "diferencia de potencial", "tensión eléctrica", "voltaje"], concepts: ["f2a-potencial"],
      summary: "V = U/q₀, en volts (J/C). Carga puntual: V = kq/r. Se suma como escalar. ΔV = −∫E⃗·dl⃗. Esfera conductora: kQ/R adentro; afuera, kQ/r.",
      def: [R`**Potencial eléctrico:** $V = \frac{U}{q_0}$, la energía potencial por unidad de carga de prueba. Unidad: el volt, $1\ \text{V} = 1$ J/C. Una carga $q$ en un punto de potencial $V$ tiene energía $qV$.`,
        R`**Diferencia de potencial:** $V_B - V_A = -\int_A^B \vec E\cdot d\vec l$, por cualquier camino. Las cargas positivas, libres, van hacia donde el potencial baja; las negativas, hacia donde sube.`,
        R`**Carga puntual:** $V = \frac{kq}{r}$. **Varias cargas:** $V = \sum\frac{kq_i}{r_i}$, una suma de escalares con signo. **Distribución continua:** $V = \int\frac{k\,dq}{r}$.`,
        R`**Esferas** de radio $R$ y carga $Q$: afuera, siempre $\frac{kQ}{r}$. Adentro de una conductora, $\frac{kQ}{R}$ constante; adentro de una aislante con carga uniforme, $\frac{kQ(3R^2 - r^2)}{2R^3}$.`],
      idea: [R`El potencial es como la altura de un terreno y el campo, la pendiente: las cargas positivas «caen» hacia potenciales más bajos. Por eso es más cómodo que el campo: es un solo número por punto y se suma sin componentes.`],
      demo: [R`**Paso 1 (definición por el trabajo).** Si $q_0$ va de $A$ a $B$, la fuerza eléctrica hace $W = \int_A^B q_0\vec E\cdot d\vec l$, y por definición de [[f2a-energia-potencial|energía potencial]] $U_B - U_A = -W$. Dividiendo por $q_0$: $V_B - V_A = -\int_A^B\vec E\cdot d\vec l$.`,
        R`**Paso 2 (carga puntual).** Con $\vec E = \frac{kq}{r^2}\hat r$ y $\hat r\cdot d\vec l = dr$: $V(r) - V(\infty) = -\int_\infty^r\frac{kq}{r'^2}dr' = \frac{kq}{r}$, y con $V(\infty) = 0$ queda $V = \frac{kq}{r}$.`,
        R`**Paso 3 (superposición).** El campo total es la suma de los campos, y la integral de una suma es la suma de las integrales: los potenciales también se suman.`,
        R`**Paso 4 (esfera aislante, adentro).** Afuera $E = \frac{kQ}{r^2}$, así que en la superficie $V(R) = \frac{kQ}{R}$. Adentro la [[f2a-gauss|ley de Gauss]] da $E = \frac{kQr}{R^3}$, y $V(r) = V(R) + \int_r^R\frac{kQr'}{R^3}dr' = \frac{kQ}{R} + \frac{kQ(R^2 - r^2)}{2R^3} = \frac{kQ(3R^2 - r^2)}{2R^3}$.`,
        R`**Paso 5 (esfera conductora).** Adentro de un [[f2a-conductores|conductor]] en equilibrio $E = 0$, así que la integral del paso 4 es cero y el potencial queda igual al de la superficie, $\frac{kQ}{R}$. $\blacksquare$`],
      examples: [{ q: R`Potencial a $20$ cm de una carga de $4$ nC.`, steps: [R`$V = \frac{8{,}99\times10^9\cdot4\times10^{-9}}{0{,}2} \approx 180$ V.`] }],
      tips: [R`Solo importan las diferencias de potencial: el cero se elige (en el infinito para cargas localizadas, o en la «tierra» de un circuito).`],
      see: ["f2a-energia-potencial", "f2a-gradiente-potencial", "f2a-equipotenciales", "f2a-campo-electrico"]
    },
    "f2a-gradiente-potencial": {
      title: "El campo como gradiente del potencial", aliases: ["gradiente del potencial", "campo y potencial"], concepts: ["f2a-potencial"],
      summary: "E⃗ = −∇V: E_x = −∂V/∂x, etc. El campo apunta hacia donde V baja más rápido, y su módulo es esa pendiente. En un campo uniforme, E = ΔV/d.",
      def: [R`**Campo a partir del potencial:** $\vec E = -\nabla V$, o sea $E_x = -\frac{\partial V}{\partial x}$, $E_y = -\frac{\partial V}{\partial y}$, $E_z = -\frac{\partial V}{\partial z}$. Con simetría esférica, $E_r = -\frac{dV}{dr}$.`,
        R`**Campo uniforme** (por ejemplo, entre placas paralelas separadas $d$): $E = \frac{\Delta V}{d}$. Por eso el campo también se mide en V/m.`],
      idea: [R`El [[c2-gradiente|gradiente]] apunta hacia donde la función crece más rápido; el signo menos hace que el campo apunte cuesta abajo. Conocer $V$ en todos lados alcanza para saber $\vec E$, y es más fácil de calcular porque es un escalar.`],
      demo: [R`**Paso 1.** Por la definición de potencial, en un desplazamiento chico $d\vec l$ el cambio es $dV = -\vec E\cdot d\vec l = -(E_x\,dx + E_y\,dy + E_z\,dz)$.`,
        R`**Paso 2.** Por otro lado, como $V$ es una función de $(x, y, z)$, su diferencial es $dV = \frac{\partial V}{\partial x}dx + \frac{\partial V}{\partial y}dy + \frac{\partial V}{\partial z}dz$.`,
        R`**Paso 3.** Las dos expresiones valen para cualquier $(dx, dy, dz)$; tomando de a un desplazamiento por eje, los coeficientes tienen que coincidir: $E_x = -\frac{\partial V}{\partial x}$ y lo mismo con $y$ y $z$. $\blacksquare$`],
      examples: [{ q: R`$V = 3x^2y$ (V, m). Campo en $(1, 2, 0)$.`, steps: [R`$E_x = -6xy = -12$ V/m, $E_y = -3x^2 = -3$ V/m, $E_z = 0$.`] }],
      tips: [R`Donde $V = 0$ el campo puede no ser cero, y donde $\vec E = \vec 0$ el potencial puede no ser cero: uno depende de la pendiente del otro, no de su valor.`],
      see: ["f2a-potencial", "f2a-equipotenciales", "c2-gradiente"]
    },
    "f2a-equipotenciales": {
      title: "Superficies equipotenciales", aliases: ["superficie equipotencial", "superficies equipotenciales"], concepts: ["f2a-potencial"],
      summary: "Son las superficies de V constante. Las líneas de campo las cruzan perpendicularmente, y moverse sobre ellas no cuesta trabajo. Un conductor en equilibrio es una equipotencial.",
      def: [R`**Superficie equipotencial:** el conjunto de puntos con el mismo potencial. Para una carga puntual son esferas centradas en ella; para un campo uniforme, planos perpendiculares al campo.`,
        R`**Propiedades:** el campo es perpendicular a ellas en cada punto; mover una carga sobre una equipotencial no requiere trabajo; dibujadas a intervalos iguales de $V$, están más juntas donde el campo es más intenso. La superficie de un [[f2a-conductores|conductor]] en equilibrio es equipotencial.`],
      idea: [R`Son las curvas de nivel de un mapa topográfico: las líneas de campo son el camino de máxima pendiente, que siempre corta las curvas de nivel en ángulo recto.`],
      demo: [R`**Paso 1.** Si $d\vec l$ es un desplazamiento chico sobre la superficie, el potencial no cambia: $dV = 0$.`,
        R`**Paso 2.** Pero $dV = -\vec E\cdot d\vec l$ (ver [[f2a-gradiente-potencial]]), así que $\vec E\cdot d\vec l = 0$ para todo desplazamiento tangente: $\vec E$ es perpendicular a la superficie.`,
        R`**Paso 3 (trabajo).** El trabajo de la fuerza eléctrica entre dos puntos de la superficie es $-q\,\Delta V = 0$.`,
        R`**Paso 4 (conductor).** Dentro de un conductor en equilibrio $\vec E = \vec 0$, así que entre dos puntos cualesquiera del conductor $\Delta V = -\int\vec E\cdot d\vec l = 0$. $\blacksquare$`],
      tips: [R`En un conductor con puntas, la carga se acumula en las zonas más curvas y ahí el campo es más intenso (por eso funcionan los pararrayos).`],
      see: ["f2a-potencial", "f2a-gradiente-potencial", "f2a-conductores"]
    }
  };

  E.extendCourse("f102a", {
    concepts: { "f2a-energia-el": { name: "Energía potencial eléctrica" }, "f2a-potencial": { name: "Potencial eléctrico" } },
    templates: T,
    units: [{
      id: "f2a-potencial-u", order: 2, program: "Unidad 2", title: "Potencial eléctrico", icon: "map",
      diagnostic: ["f2a-potencial-num", "f2a-energia-num", "f2a-gradiente-num"],
      lessons: [
        { id: "f2a-potencial-l1", title: "Energía potencial y potencial", templates: ["f2a-potencial-num", "f2a-energia-num", "f2a-acelera-num"], theory: ["f2a-energia-potencial", "f2a-potencial"],
          intro: R`$U = \frac{kq_1q_2}{r}$ y $V = \frac{kq}{r}$: escalares, que se suman con su signo.` },
        { id: "f2a-potencial-l2", title: "Del potencial al campo", templates: ["f2a-gradiente-num", "f2a-esfera-pot-num", "f2a-medio-tf"], theory: ["f2a-gradiente-potencial", "f2a-equipotenciales"],
          intro: R`$\vec E = -\nabla V$: el campo apunta cuesta abajo en el potencial.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 3 · CAPACITANCIA Y DIELÉCTRICOS
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, F = E.f2a, nf = F.nf;
  const T = {};
  const EPS = R`\varepsilon_0 = 8{,}854\times10^{-12}\ \text{F/m}`;
  const dec = v => String(v).replace(".", "{,}");
  // campo de un plano «infinito» por otro camino: disco enorme sumando anillos (s = z·tan u)
  const planeE = sg => F.simpson(u => 2 * Math.PI * F.k * sg * Math.sin(u), 0, Math.atan(1e6), 2000);

  T["f2a-placas-num"] = {
    type: "numeric", concepts: ["f2a-capacitancia"], difficulty: 2,
    generate(r) {
      const A = r.int(2, 40) * 10, dmm = r.pick([0.5, 1, 1.5, 2, 3, 4, 5]), V = r.int(1, 30) * 10, ask = r.pick(["C", "Q", "E"]);
      const Am = A * 1e-4, d = dmm / 1000, C = F.e0 * Am / d, Q = C * V;
      const ans = { C: C * 1e12, Q: Q * 1e9, E: V / d }[ask];
      return {
        prompt: `Un capacitor de placas paralelas tiene placas de $${A}$ cm² separadas $${dec(dmm)}$ mm, con aire entre ellas, y se conecta a una batería de $${V}$ V. ${{ C: "¿Cuál es su capacitancia (en pF)?", Q: "¿Qué carga adquiere cada placa (en nC, en valor absoluto)?", E: "¿Cuánto vale el campo eléctrico entre las placas (en V/m)?" }[ask]} ($${EPS}$)`,
        answer: ans,
        solution: [`Para placas paralelas, la [[f2a-capacitancia|capacitancia]] es $C = \\frac{\\varepsilon_0A}{d} = \\frac{8{,}854\\times10^{-12}\\cdot${nf(Am)}}{${nf(d)}} \\approx ${nf(C * 1e12)}$ pF.`,
          { C: `Listo: $C \\approx ${nf(ans)}$ pF.`, Q: `$Q = CV \\approx ${nf(C * 1e12)}\\ \\text{pF}\\cdot${V}\\ \\text{V} \\approx ${nf(ans)}$ nC.`, E: `El campo es uniforme: $E = \\frac{V}{d} = \\frac{${V}}{${nf(d)}} \\approx ${nf(ans)}$ V/m (no depende del área).` }[ask]],
        // otro camino: Q = CV con C a partir del campo de dos planos, cada uno sumado numéricamente como un disco enorme
        verify: { kind: "value", tol: 1e-5, fn: () => { const e1 = planeE(1), Cn = Am / (2 * e1 * d); return { C: Cn * 1e12, Q: Cn * V * 1e9, E: 2 * e1 * Cn * V / Am }[ask]; } }
      };
    }
  };

  T["f2a-red-num"] = {
    type: "numeric", concepts: ["f2a-capacitancia"], difficulty: 3,
    generate(r) {
      const c = [r.int(1, 12), r.int(1, 12), r.int(1, 12)], V = r.int(2, 24), cfg = r.pick(["s-p", "p-s"]), ask = r.pick(["Ceq", "Q1", "V2", "Q3"]);
      // s-p: C1 en serie con (C2 ∥ C3); p-s: (C1 en serie con C2) ∥ C3
      let Ceq, q, v;
      if (cfg === "s-p") { const p = c[1] + c[2]; Ceq = c[0] * p / (c[0] + p); const Q = Ceq * V, Vp = Q / p; q = [Q, c[1] * Vp, c[2] * Vp]; v = [Q / c[0], Vp, Vp]; }
      else { const s = c[0] * c[1] / (c[0] + c[1]); Ceq = s + c[2]; const Qs = s * V; q = [Qs, Qs, c[2] * V]; v = [Qs / c[0], Qs / c[1], V]; }
      const ans = { Ceq, Q1: q[0], V2: v[1], Q3: q[2] }[ask];
      return {
        prompt: `Tres capacitores, $C_1 = ${c[0]}$ μF, $C_2 = ${c[1]}$ μF y $C_3 = ${c[2]}$ μF, se conectan ${cfg === "s-p" ? "así: $C_2$ y $C_3$ en paralelo, y ese par en serie con $C_1$" : "así: $C_1$ y $C_2$ en serie, y ese par en paralelo con $C_3$"}. El conjunto se conecta a una batería de $${V}$ V. ${{ Ceq: "¿Cuál es la capacitancia equivalente (en μF)?", Q1: "¿Qué carga tiene $C_1$ (en μC)?", V2: "¿Qué diferencia de potencial hay en $C_2$ (en V)?", Q3: "¿Qué carga tiene $C_3$ (en μC)?" }[ask]}`,
        answer: ans,
        solution: [`En [[f2a-asociacion-capacitores|paralelo]] las capacitancias se suman; en serie se suman las inversas.`,
          cfg === "s-p" ? `$C_{23} = ${c[1] + c[2]}$ μF y $C_{eq} = \\frac{C_1C_{23}}{C_1 + C_{23}} = ${H.frac(c[0] * (c[1] + c[2]), c[0] + c[1] + c[2])} \\approx ${nf(Ceq)}$ μF. La carga total, $Q = C_{eq}V \\approx ${nf(Ceq * V)}$ μC, es la de $C_1$, y el par en paralelo queda a $\\frac{Q}{C_{23}} \\approx ${nf(v[1])}$ V.`
            : `$C_{12} = \\frac{C_1C_2}{C_1 + C_2} = ${H.frac(c[0] * c[1], c[0] + c[1])}$ μF y $C_{eq} = C_{12} + C_3 \\approx ${nf(Ceq)}$ μF. La rama en serie tiene carga $C_{12}V \\approx ${nf(q[0])}$ μC (la misma en $C_1$ y $C_2$), y $C_3$ está a $${V}$ V.`,
          `Resultado: $${nf(ans)}$ ${ask === "Ceq" ? "μF" : ask === "V2" ? "V" : "μC"}.`],
        // otro camino: potencial del nodo intermedio por conservación de la carga (sistema lineal), sin fórmulas de serie y paralelo
        verify: { kind: "value", tol: 1e-9, fn: () => {
          if (cfg === "s-p") {
            const [vn] = F.solve([[c[0] + c[1] + c[2]]], [c[0] * V]), Q1 = c[0] * (V - vn), Qt = Q1;
            return { Ceq: Qt / V, Q1, V2: vn, Q3: c[2] * vn }[ask];
          }
          const [vn] = F.solve([[c[0] + c[1]]], [c[0] * V]), Q1 = c[0] * (V - vn), Q3 = c[2] * V;
          return { Ceq: (Q1 + Q3) / V, Q1, V2: vn, Q3 }[ask];
        } }
      };
    }
  };

  T["f2a-geometria-num"] = {
    type: "numeric", concepts: ["f2a-capacitancia"], difficulty: 3,
    generate(r) {
      const sph = r.bool(), a = r.int(1, 10), b = a + r.int(1, 10), L = r.int(1, 20) * 10, V = r.int(1, 20) * 10, ask = r.pick(["C", "U"]);
      const am = a / 100, bm = b / 100, C = sph ? 4 * Math.PI * F.e0 * am * bm / (bm - am) : 2 * Math.PI * F.e0 * (L / 100) / Math.log(bm / am), U = C * V * V / 2;
      return {
        prompt: `${sph ? `Un capacitor esférico está formado por dos cáscaras conductoras concéntricas de radios $${a}$ cm y $${b}$ cm` : `Un capacitor cilíndrico de $${L}$ cm de largo está formado por un conductor de radio $${a}$ cm rodeado por una cáscara coaxial de radio $${b}$ cm`}, con vacío entre ellas, y se conecta a $${V}$ V. ${ask === "C" ? "¿Cuál es su capacitancia (en pF)?" : "¿Cuánta energía almacena (en J)?"} ($${EPS}$${sph ? "" : "; despreciá los efectos de borde"})`,
        answer: ask === "C" ? C * 1e12 : U,
        solution: [sph ? `Con carga $Q$, entre las cáscaras $E = \\frac{kQ}{r^2}$ y $V = kQ\\left(\\frac1a - \\frac1b\\right)$, así que $C = \\frac{Q}{V} = \\frac{4\\pi\\varepsilon_0ab}{b - a}$ ([[f2a-capacitancia]]).`
          : `Con carga $\\lambda$ por unidad de largo, entre los conductores $E = \\frac{\\lambda}{2\\pi\\varepsilon_0r}$ y $V = \\frac{\\lambda}{2\\pi\\varepsilon_0}\\ln\\frac ba$, así que $C = \\frac{2\\pi\\varepsilon_0L}{\\ln(b/a)}$ ([[f2a-capacitancia]]).`,
          `$C \\approx ${nf(C * 1e12)}$ pF.`, ...(ask === "U" ? [`[[f2a-energia-capacitor|Energía]]: $U = \\frac12CV^2 \\approx ${nf(U)}$ J.`] : [])],
        // otro camino: V por integración numérica del campo de Gauss con carga unitaria; U integrando la densidad de energía
        verify: { kind: "value", tol: 1e-6, fn: () => {
          const Ef = sph ? s => F.k / (s * s) : s => 2 * F.k / (L / 100) / s, Vn = F.simpson(Ef, am, bm, 2000), Cn = 1 / Vn, Q = Cn * V;
          if (ask === "C") return Cn * 1e12;
          return F.simpson(s => 0.5 * F.e0 * (Q * Ef(s)) ** 2 * (sph ? 4 * Math.PI * s * s : 2 * Math.PI * s * L / 100), am, bm, 2000);
        } }
      };
    }
  };

  T["f2a-dielectrico-num"] = {
    type: "numeric", concepts: ["f2a-dielectricos"], difficulty: 3,
    generate(r) {
      const C0 = r.int(2, 50), V0 = r.int(1, 30) * 10, kap = r.pick([1.5, 2, 2.5, 3, 3.5, 4, 5, 6]), conn = r.bool(), ask = r.pick(["Q", "V", "U"]);
      const C = kap * C0, Q = conn ? C * V0 : C0 * V0, Vf = conn ? V0 : V0 / kap, U = 0.5 * C * Vf * Vf;
      const ans = { Q, V: Vf, U: U * 1e-3 }[ask];   // C en pF → Q en pC; U en pJ → nJ
      return {
        prompt: `Un capacitor de placas paralelas de $${C0}$ pF, con aire, se carga con una batería de $${V0}$ V. ${conn ? "Sin desconectar la batería" : "Se desconecta la batería y después"} se llena el espacio entre las placas con un dieléctrico de constante $\\kappa = ${dec(kap)}$. ${{ Q: "¿Qué carga tienen las placas al final (en pC)?", V: "¿Qué diferencia de potencial hay entre las placas al final (en V)?", U: "¿Cuánta energía almacena al final (en nJ)?" }[ask]}`,
        answer: ans,
        solution: [`El [[f2a-dielectricos|dieléctrico]] multiplica la capacitancia: $C = \\kappa C_0 = ${nf(C)}$ pF.`,
          conn ? `Con la batería conectada se mantiene $V = ${V0}$ V, así que la carga aumenta: $Q = CV \\approx ${nf(Q)}$ pC.` : `Desconectada, la carga no tiene a dónde ir: $Q = C_0V_0 = ${nf(Q)}$ pC, y la tensión baja a $V = \\frac{Q}{C} \\approx ${nf(Vf)}$ V.`,
          ...(ask === "U" ? [`$U = \\frac12CV^2 \\approx ${nf(U)}$ pJ $\\approx ${nf(U * 1e-3)}$ nJ (${conn ? "aumenta: la batería entrega más carga" : "disminuye: el campo tira del dieléctrico hacia adentro y hace trabajo"}).`] : [])],
        // otro camino: con el campo y la carga de polarización (σ_p = σ(1 − 1/κ)) en un capacitor de geometría equivalente
        verify: { kind: "value", tol: 1e-9, fn: () => {
          const d = 1e-3, A = C0 * 1e-12 * d / F.e0;      // placas con C0 = ε0A/d
          let sig;
          if (conn) { const Ein = V0 / d; sig = Ein * F.e0 / (1 / kap); } // E = (σ − σp)/ε0 = σ/(κε0)
          else sig = C0 * 1e-12 * V0 / A;
          const sp = sig * (1 - 1 / kap), Ein = (sig - sp) / F.e0, Vn = Ein * d, Qn = sig * A, Un = F.simpson(() => 0.5 * kap * F.e0 * Ein * Ein * A, 0, d, 2);
          return { Q: Qn * 1e12, V: Vn, U: Un * 1e9 }[ask];
        } }
      };
    }
  };

  T["f2a-bateria-tf"] = {
    type: "tf", concepts: ["f2a-dielectricos"], difficulty: 2,
    generate(r) {
      const conn = r.bool(), qty = r.pick(["Q", "V", "U", "E"]), claim = r.pick(["aumenta", "disminuye", "no cambia"]), kap = r.pick([2, 3, 4, 5]);
      const C0 = 10, V0 = 100, d = 1e-3;
      const before = { Q: C0 * V0, V: V0, U: C0 * V0 * V0 / 2, E: V0 / d };
      const Vf = conn ? V0 : V0 / kap, after = { Q: kap * C0 * Vf, V: Vf, U: kap * C0 * Vf * Vf / 2, E: Vf / d };
      const rel = Math.abs(after[qty] / before[qty] - 1) < 1e-12 ? "no cambia" : after[qty] > before[qty] ? "aumenta" : "disminuye";
      const nm = { Q: "la carga de las placas", V: "la diferencia de potencial entre las placas", U: "la energía almacenada", E: "el campo eléctrico entre las placas" }[qty];
      return {
        prompt: `<b>Verdadero o falso:</b> un capacitor cargado ${conn ? "sigue conectado a la batería" : "se desconecta de la batería"} y se le introduce un dieléctrico que llena el espacio entre las placas. Entonces ${nm} ${claim}.`,
        answer: rel === claim,
        explanation: `La capacitancia pasa a $\\kappa C_0$. ${conn ? "Conectado, $V$ queda fijo; $Q = \\kappa C_0V$ crece, $E = V/d$ no cambia y $U = \\frac12\\kappa C_0V^2$ crece." : "Desconectado, $Q$ queda fija; $V = Q/(\\kappa C_0)$ baja, $E = V/d$ baja y $U = \\frac{Q^2}{2\\kappa C_0}$ baja."} Así que ${nm} ${rel}: es ${rel === claim ? "verdadero" : "falso"}.`,
        solution: [R`Ver [[f2a-dielectricos|dieléctricos]]: lo primero es ver qué queda fijo, la carga o la tensión.`],
        // otro camino: con el campo de las cargas libres y de polarización (U como integral de la densidad de energía)
        verify: { kind: "truth", target: rel === claim, fn: () => {
          const A = C0 * d / F.e0, sig0 = C0 * V0 / A, sig = conn ? kap * F.e0 * V0 / d : sig0;
          const Ein = (sig - sig * (1 - 1 / kap)) / F.e0, b = { Q: sig0 * A, V: sig0 / F.e0 * d, U: 0.5 * F.e0 * (sig0 / F.e0) ** 2 * A * d, E: sig0 / F.e0 };
          const a = { Q: sig * A, V: Ein * d, U: 0.5 * kap * F.e0 * Ein * Ein * A * d, E: Ein };
          const rl = Math.abs(a[qty] / b[qty] - 1) < 1e-9 ? "no cambia" : a[qty] > b[qty] ? "aumenta" : "disminuye";
          return rl === claim;
        } }
      };
    }
  };

  const cards = {
    "f2a-capacitancia": {
      title: "Capacitores y capacitancia", aliases: ["capacitancia", "capacitor", "condensador", "capacitor de placas paralelas", "faradio"], concepts: ["f2a-capacitancia"],
      summary: "C = Q/V, en faradios. Placas paralelas: ε₀A/d. Esférico: 4πε₀ab/(b − a). Cilíndrico: 2πε₀L/ln(b/a). Solo depende de la geometría (y del material entre los conductores).",
      def: [R`**Capacitor:** dos conductores con cargas $+Q$ y $-Q$. **Capacitancia:** $C = \frac{Q}{V}$, con $V$ la diferencia de potencial entre ellos. Unidad: el faradio, $1$ F $= 1$ C/V (se usan μF, nF y pF).`,
        R`**Placas paralelas** de área $A$ a distancia $d$: $C = \frac{\varepsilon_0A}{d}$. **Esférico** (radios $a < b$): $C = \frac{4\pi\varepsilon_0ab}{b - a}$. **Cilíndrico** de largo $L$: $C = \frac{2\pi\varepsilon_0L}{\ln(b/a)}$.`],
      idea: [R`La capacitancia mide cuánta carga «entra» por cada volt. Placas grandes y muy juntas guardan mucha carga con poca tensión: el campo de una placa casi se cancela con el de la otra afuera y queda concentrado en el hueco.`],
      demo: [R`**Paso 1 (receta).** Se le da carga $\pm Q$ a los conductores, se calcula el campo entre ellos (casi siempre con la [[f2a-gauss|ley de Gauss]]), se integra para obtener $V$ y se divide: $C = Q/V$. $Q$ se cancela siempre, porque $V$ es proporcional a $Q$.`,
        R`**Paso 2 (placas).** Entre las placas, los campos de las dos ($\frac{\sigma}{2\varepsilon_0}$ cada una) se suman: $E = \frac{\sigma}{\varepsilon_0} = \frac{Q}{\varepsilon_0A}$; afuera se restan y dan cero. Como es uniforme, $V = Ed = \frac{Qd}{\varepsilon_0A}$, y $C = \frac{\varepsilon_0A}{d}$.`,
        R`**Paso 3 (esférico).** Entre las cáscaras, Gauss da $E = \frac{kQ}{r^2}$ (solo encierra la de adentro). Entonces $V = \int_a^b\frac{kQ}{r^2}dr = kQ\frac{b - a}{ab}$ y $C = \frac{ab}{k(b - a)} = \frac{4\pi\varepsilon_0ab}{b - a}$.`,
        R`**Paso 4 (cilíndrico).** Con un cilindro gaussiano de radio $r$ y largo $L$: $E\cdot2\pi rL = \frac{Q}{\varepsilon_0}$. Integrando, $V = \frac{Q}{2\pi\varepsilon_0L}\ln\frac ba$, y $C = \frac{2\pi\varepsilon_0L}{\ln(b/a)}$. $\blacksquare$`],
      examples: [{ q: R`Placas de $100$ cm² a $1$ mm.`, steps: [R`$C = \frac{8{,}854\times10^{-12}\cdot0{,}01}{0{,}001} \approx 88{,}5$ pF. Un faradio es enorme: con $d = 1$ mm harían falta placas de unos $10$ km de lado.`] }],
      tips: [R`$C$ no depende de $Q$ ni de $V$: si se duplica la tensión, se duplica la carga y el cociente queda igual.`],
      see: ["f2a-asociacion-capacitores", "f2a-energia-capacitor", "f2a-dielectricos"]
    },
    "f2a-asociacion-capacitores": {
      title: "Capacitores en serie y en paralelo", aliases: ["capacitores en serie", "capacitores en paralelo", "capacitancia equivalente"], concepts: ["f2a-capacitancia"],
      summary: "En paralelo (misma tensión) se suman: C = C₁ + C₂. En serie (misma carga) se suman las inversas: 1/C = 1/C₁ + 1/C₂.",
      def: [R`**Paralelo:** todos los capacitores tienen la misma diferencia de potencial; $C_{eq} = C_1 + C_2 + \cdots$`,
        R`**Serie:** todos tienen la misma carga; $\frac{1}{C_{eq}} = \frac1{C_1} + \frac1{C_2} + \cdots$ (para dos, $C_{eq} = \frac{C_1C_2}{C_1 + C_2}$). La equivalente en serie es menor que la más chica.`],
      idea: [R`En paralelo es como agrandar el área de las placas; en serie, como separarlas más. Por eso las reglas son al revés que las de las resistencias.`],
      demo: [R`**Paso 1 (paralelo).** Las placas de un lado están unidas por un conductor y quedan al mismo potencial; lo mismo las del otro: todos tienen la misma $V$. Las cargas son $Q_i = C_iV$, y la total es $Q = (C_1 + C_2 + \cdots)V$. Dividiendo por $V$: $C_{eq} = \sum C_i$.`,
        R`**Paso 2 (serie).** El tramo de conductor entre dos capacitores está aislado y empieza neutro: si una placa toma $-Q$, la otra queda con $+Q$. Así todos tienen la misma carga.`,
        R`**Paso 3.** Las tensiones se suman a lo largo del camino: $V = \frac{Q}{C_1} + \frac{Q}{C_2} + \cdots$. Dividiendo por $Q$: $\frac{1}{C_{eq}} = \sum\frac1{C_i}$. $\blacksquare$`],
      examples: [{ q: R`$3$ μF y $6$ μF en serie, a $12$ V.`, steps: [R`$C_{eq} = \frac{18}{9} = 2$ μF y $Q = 24$ μC en cada uno; $V_1 = 8$ V y $V_2 = 4$ V: el más chico se lleva más tensión.`] }],
      tips: [R`En una red, reducí de adentro hacia afuera y después volvé: la carga total con $C_{eq}$, y de ahí las tensiones y cargas de cada uno.`],
      see: ["f2a-capacitancia", "f2a-energia-capacitor"]
    },
    "f2a-energia-capacitor": {
      title: "Energía en un capacitor", aliases: ["energía de un capacitor", "densidad de energía eléctrica"], concepts: ["f2a-capacitancia"],
      summary: "U = Q²/(2C) = ½CV² = ½QV. La energía está en el campo, con densidad u = ½ε₀E².",
      def: [R`**Energía almacenada:** $U = \frac{Q^2}{2C} = \frac12CV^2 = \frac12QV$: el trabajo que hizo falta para cargarlo.`,
        R`**Densidad de energía** del campo eléctrico (en el vacío): $u = \frac12\varepsilon_0E^2$, en J/m³. Integrada sobre el volumen donde hay campo da $U$. Con un dieléctrico, $u = \frac12\kappa\varepsilon_0E^2$.`],
      idea: [R`Cargar un capacitor es subir carga por una cuesta cada vez más empinada: la primera pasa gratis y la última tiene que vencer toda la tensión $V$. En promedio, cada carga sube $\frac V2$: de ahí el $\frac12$.`],
      demo: [R`**Paso 1.** Con carga $q$ ya puesta, la tensión es $\frac{q}{C}$. Pasar un $dq$ más de una placa a la otra cuesta $dW = \frac{q}{C}dq$.`,
        R`**Paso 2.** Sumando desde $0$ hasta $Q$: $U = \int_0^Q\frac{q}{C}dq = \frac{Q^2}{2C}$. Con $Q = CV$ salen las otras dos formas.`,
        R`**Paso 3 (densidad).** En las placas paralelas, $C = \frac{\varepsilon_0A}{d}$ y $V = Ed$: $U = \frac12\frac{\varepsilon_0A}{d}E^2d^2 = \frac12\varepsilon_0E^2\cdot(Ad)$. Como $Ad$ es el volumen donde hay campo, la energía por unidad de volumen es $\frac12\varepsilon_0E^2$. $\blacksquare$`],
      examples: [{ q: R`$100$ μF a $50$ V.`, steps: [R`$U = \frac12\cdot10^{-4}\cdot2500 = 0{,}125$ J.`] }],
      tips: [R`$U = \frac12QV$, no $QV$: la batería entrega $QV$, y la otra mitad se disipa en los cables al cargar.`],
      see: ["f2a-capacitancia", "f2a-energia-potencial", "f2a-dielectricos"]
    },
    "f2a-dielectricos": {
      title: "Dieléctricos", aliases: ["dieléctrico", "constante dieléctrica", "carga de polarización", "rigidez dieléctrica"], concepts: ["f2a-dielectricos"],
      summary: "Un dieléctrico entre las placas multiplica la capacitancia por κ > 1, porque se polariza y debilita el campo. Con la batería conectada, V queda fija y Q crece; desconectada, Q queda fija y V baja.",
      def: [R`**Dieléctrico:** un aislante entre las placas. Si lo llena, $C = \kappa C_0$, con $\kappa \ge 1$ la **constante dieléctrica** ($\kappa = 1$ en el vacío, $\approx 1{,}0006$ en el aire, $\approx 80$ en el agua). Con carga libre fija, el campo adentro baja a $E = \frac{E_0}{\kappa}$.`,
        R`**Polarización:** el campo alinea (o induce) dipolos en el material, y en sus caras aparecen **cargas de polarización** $\sigma_p = \sigma\left(1 - \frac1\kappa\right)$, de signo opuesto a las de la placa vecina.`,
        R`**Batería conectada:** $V$ fijo, $Q$ y $U$ crecen en un factor $\kappa$. **Desconectada:** $Q$ fija, $V$ y $E$ bajan en un factor $\kappa$, y $U$ también baja. **Rigidez dieléctrica:** el campo máximo que soporta el material sin romperse (en el aire seco, unos $3\times10^6$ V/m).`],
      idea: [R`Las cargas de polarización tapan en parte a las de las placas: el campo neto es más débil, la tensión para la misma carga es menor, y entonces entra más carga por volt.`],
      demo: [R`**Paso 1.** Con densidad libre $\sigma$ en las placas y $\sigma_p$ de polarización en las caras del dieléctrico, el campo adentro (como en dos pares de planos) es $E = \frac{\sigma - \sigma_p}{\varepsilon_0}$.`,
        R`**Paso 2.** Se define $\kappa$ como el factor en que el material reduce el campo: $E = \frac{\sigma}{\kappa\varepsilon_0}$. Igualando con el paso 1 sale $\sigma_p = \sigma\left(1 - \frac1\kappa\right)$.`,
        R`**Paso 3.** La tensión es $V = Ed = \frac{\sigma d}{\kappa\varepsilon_0} = \frac{Qd}{\kappa\varepsilon_0A}$, así que $C = \frac QV = \kappa\frac{\varepsilon_0A}{d} = \kappa C_0$.`,
        R`**Paso 4 (energía, desconectado).** Con $Q$ fija, $U = \frac{Q^2}{2\kappa C_0} = \frac{U_0}{\kappa}$: baja. La diferencia es el trabajo que hace el campo al tirar del dieléctrico hacia adentro. $\blacksquare$`],
      examples: [{ q: R`Un capacitor de $20$ pF cargado a $100$ V se desconecta y se le pone un dieléctrico con $\kappa = 4$.`, steps: [R`$Q = 2$ nC queda fija; $C = 80$ pF y $V = 25$ V. La energía baja de $100$ nJ a $25$ nJ.`] }],
      tips: [R`Lo primero en estos problemas: ¿qué queda fijo, la carga (desconectado) o la tensión (conectado)? Todo lo demás sale de $C = \kappa C_0$.`],
      see: ["f2a-capacitancia", "f2a-energia-capacitor", "f2a-campo-electrico"]
    }
  };

  E.extendCourse("f102a", {
    concepts: { "f2a-capacitancia": { name: "Capacitancia" }, "f2a-dielectricos": { name: "Dieléctricos" } },
    templates: T,
    units: [{
      id: "f2a-capacitancia-u", order: 3, program: "Unidad 3", title: "Capacitancia y dieléctricos", icon: "grid-3x3",
      diagnostic: ["f2a-placas-num", "f2a-red-num", "f2a-dielectrico-num"],
      lessons: [
        { id: "f2a-capacitancia-l1", title: "Capacitores y redes", templates: ["f2a-placas-num", "f2a-geometria-num", "f2a-red-num"], theory: ["f2a-capacitancia", "f2a-asociacion-capacitores"],
          intro: R`$C = \frac QV$; placas: $\frac{\varepsilon_0A}{d}$. En paralelo se suman, en serie se suman las inversas.` },
        { id: "f2a-capacitancia-l2", title: "Energía y dieléctricos", templates: ["f2a-dielectrico-num", "f2a-bateria-tf"], theory: ["f2a-energia-capacitor", "f2a-dielectricos"],
          intro: R`$U = \frac12CV^2$, y un dieléctrico multiplica $C$ por $\kappa$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 4 · CORRIENTE, RESISTENCIA Y FUERZA ELECTROMOTRIZ
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, F = E.f2a, nf = F.nf;
  const T = {};
  const dec = v => String(v).replace(".", "{,}");
  const MAT = [
    { n: "cobre", rho: 1.72e-8, a: 3.9e-3, t: R`1{,}72\times10^{-8}`, ta: R`3{,}9\times10^{-3}` },
    { n: "aluminio", rho: 2.75e-8, a: 3.9e-3, t: R`2{,}75\times10^{-8}`, ta: R`3{,}9\times10^{-3}` },
    { n: "tungsteno", rho: 5.25e-8, a: 4.5e-3, t: R`5{,}25\times10^{-8}`, ta: R`4{,}5\times10^{-3}` },
    { n: "nicromo", rho: 1.0e-6, a: 4e-4, t: R`1{,}0\times10^{-6}`, ta: R`4\times10^{-4}` }
  ];
  // resistencia por otro camino: el alambre como muchos tubos finos en paralelo (G = ∫ dA/(ρL))
  const Rshells = (rho, L, rad) => 1 / F.simpson(s => 2 * Math.PI * s / (rho * L), 0, rad, 200);

  T["f2a-deriva-num"] = {
    type: "numeric", concepts: ["f2a-corriente"], difficulty: 2,
    generate(r) {
      const I = r.int(1, 30), dmm = r.pick([0.5, 0.8, 1, 1.2, 1.5, 2, 2.5, 3]), ask = r.pick(["v", "J"]), n = 8.5e28;
      const A = Math.PI * (dmm / 2000) ** 2, J = I / A, v = J / (n * F.qe);
      const ans = ask === "v" ? v * 1000 : J / 1e6;
      return {
        prompt: `Por un alambre de cobre de $${dec(dmm)}$ mm de diámetro circula una corriente de $${I}$ A. ${ask === "v" ? "Con $n = 8{,}5\\times10^{28}$ electrones libres por m³, ¿cuál es la velocidad de deriva de los electrones (en mm/s)? ($e = 1{,}602\\times10^{-19}$ C)" : "¿Cuánto vale la densidad de corriente (en A/mm²)?"}`,
        answer: ans,
        solution: [`El área es $A = \\pi r^2 \\approx ${nf(A)}$ m², y la [[f2a-corriente|densidad de corriente]] $J = \\frac IA \\approx ${nf(J)}$ A/m² $= ${nf(J / 1e6)}$ A/mm².`,
          ...(ask === "v" ? [`De $I = nqv_dA$: $v_d = \\frac{J}{ne} \\approx ${nf(v)}$ m/s $\\approx ${nf(ans)}$ mm/s. Los electrones avanzan muy despacio; lo que viaja rápido es la señal.`] : [])],
        // otro camino: se cuenta la carga que cruza una sección en un segundo con esa velocidad (o esa densidad)
        verify: { kind: "zero", fn: x => ask === "v" ? (n * F.qe * (x / 1000) * A - I) / I : (x * 1e6 * A - I) / I }
      };
    }
  };

  T["f2a-resistencia-num"] = {
    type: "numeric", concepts: ["f2a-corriente"], difficulty: 2,
    generate(r) {
      const m = r.pick(MAT), L = r.int(1, 50), dmm = r.pick([0.2, 0.3, 0.5, 0.8, 1, 1.5, 2]), kind = r.pick(["R", "T", "estira"]), Tc = r.int(4, 30) * 10, nst = r.int(2, 4);
      const A = Math.PI * (dmm / 2000) ** 2, R0 = m.rho * L / A, ans = kind === "R" ? R0 : kind === "T" ? R0 * (1 + m.a * (Tc - 20)) : R0 * nst * nst;
      return {
        prompt: `Un alambre de ${m.n} ($\\rho = ${m.t}\\ \\Omega\\,$m a 20 °C${kind === "T" ? `, $\\alpha = ${m.ta}$ °C⁻¹` : ""}) mide $${L}$ m y tiene $${dec(dmm)}$ mm de diámetro. ${{ R: "¿Cuál es su resistencia a 20 °C (en Ω)?", T: `¿Cuál es su resistencia a $${Tc}$ °C (en Ω)?`, estira: `Se lo estira (sin cambiar su volumen) hasta que mide $${nst}$ veces más. ¿Cuál es su nueva resistencia a 20 °C (en Ω)?` }[kind]}`,
        answer: ans,
        solution: [`[[f2a-resistencia|Resistencia]] de un conductor uniforme: $R = \\frac{\\rho L}{A}$, con $A = \\pi r^2 \\approx ${nf(A)}$ m². A 20 °C: $R_0 \\approx ${nf(R0)}\\ \\Omega$.`,
          ...(kind === "T" ? [`Con la temperatura, $R = R_0[1 + \\alpha(T - 20)] \\approx ${nf(R0)}\\cdot${nf(1 + m.a * (Tc - 20))} \\approx ${nf(ans)}\\ \\Omega$.`] : []),
          ...(kind === "estira" ? [`Si el largo se multiplica por $${nst}$ con el volumen fijo, el área se divide por $${nst}$: $R$ se multiplica por $${nst}^2 = ${nst * nst}$ y queda $\\approx ${nf(ans)}\\ \\Omega$.`] : [])],
        // otro camino: el alambre como tubos finos en paralelo, con su geometría final y ρ(T)
        verify: { kind: "value", tol: 1e-8, fn: () => {
          const rad = dmm / 2000;
          if (kind === "R") return Rshells(m.rho, L, rad);
          if (kind === "T") return Rshells(m.rho * (1 + m.a * (Tc - 20)), L, rad);
          return Rshells(m.rho, L * nst, Math.sqrt(rad * rad * L / (L * nst)));
        } }
      };
    }
  };

  T["f2a-fem-num"] = {
    type: "numeric", concepts: ["f2a-fem"], difficulty: 2,
    generate(r) {
      const em = r.int(3, 24), ri = r.pick([0.1, 0.2, 0.25, 0.5, 0.8, 1, 1.5, 2]), Rx = r.int(1, 40), ask = r.pick(["I", "V", "P", "Pr"]);
      const I = em / (Rx + ri), V = I * Rx, ans = { I, V, P: I * I * Rx, Pr: I * I * ri }[ask];
      return {
        prompt: `Una batería de fem $${em}$ V y resistencia interna $${dec(ri)}\\ \\Omega$ se conecta a una resistencia de $${Rx}\\ \\Omega$. ${{ I: "¿Qué corriente circula (en A)?", V: "¿Cuál es la tensión entre los bornes de la batería (en V)?", P: "¿Qué potencia se disipa en la resistencia externa (en W)?", Pr: "¿Qué potencia se disipa dentro de la batería (en W)?" }[ask]}`,
        answer: ans,
        solution: [`La [[f2a-fem|fem]] se reparte entre la resistencia interna y la externa: $I = \\frac{\\varepsilon}{R + r} = \\frac{${em}}{${nf(Rx + ri)}} \\approx ${nf(I)}$ A.`,
          { I: `Listo: $I \\approx ${nf(I)}$ A.`, V: `En bornes: $V = \\varepsilon - Ir = IR \\approx ${nf(V)}$ V, un poco menos que la fem.`, P: `[[f2a-potencia-electrica|Potencia]]: $P = I^2R \\approx ${nf(ans)}$ W.`, Pr: `Adentro: $P = I^2r \\approx ${nf(ans)}$ W, que calienta la batería.` }[ask]],
        // otro camino: sistema lineal en (I, V) con la ley de Ohm afuera y el balance de la batería
        verify: { kind: "value", tol: 1e-9, fn: () => { const [i, v] = F.solve([[Rx, -1], [ri, 1]], [0, em]); return { I: i, V: v, P: v * i, Pr: (em - v) * i }[ask]; } }
      };
    }
  };

  T["f2a-potencia-num"] = {
    type: "numeric", concepts: ["f2a-fem"], difficulty: 3,
    generate(r) {
      if (r.bool()) {
        const em = r.int(3, 24), ri = r.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 5]), ask = r.pick(["R", "P"]);
        const ans = ask === "R" ? ri : em * em / (4 * ri);
        return {
          prompt: `Una fuente de fem $${em}$ V tiene resistencia interna $${dec(ri)}\\ \\Omega$. ${ask === "R" ? "¿Qué resistencia externa hay que conectarle para que la potencia que recibe sea máxima (en Ω)?" : "¿Cuál es la máxima potencia que puede entregarle a una resistencia externa (en W)?"}`,
          answer: ans,
          solution: [`La potencia en la carga es $P(R) = \\frac{\\varepsilon^2R}{(R + r)^2}$. Derivando e igualando a cero, el máximo está en $R = r$ ([[f2a-potencia-electrica|máxima transferencia de potencia]]).`,
            ask === "R" ? `$R = r = ${dec(ri)}\\ \\Omega$.` : `Con $R = r$: $P_{max} = \\frac{\\varepsilon^2}{4r} = \\frac{${em * em}}{${nf(4 * ri)}} \\approx ${nf(ans)}$ W.`],
          // otro camino: búsqueda numérica del máximo (sección áurea)
          verify: { kind: "value", tol: 1e-6, fn: () => { const P = R => em * em * R / (R + ri) ** 2, Ro = F.golden(R => -P(R), 0, 100 * ri); return ask === "R" ? Ro : P(Ro); } }
        };
      }
      const P = r.pick([500, 750, 1000, 1200, 1500, 2000, 2200]), V = 220, h = r.int(1, 8), ask = r.pick(["I", "R", "E"]);
      const I = P / V, Rr = V * V / P, ans = { I, R: Rr, E: P * h / 1000 }[ask];
      return {
        prompt: `Una estufa eléctrica de $${P}$ W funciona conectada a $220$ V. ${{ I: "¿Qué corriente consume (en A)?", R: "¿Cuál es la resistencia de su elemento calefactor encendido (en Ω)?", E: `¿Cuánta energía consume en $${h}$ h (en kWh)?` }[ask]}`,
        answer: ans,
        solution: [`[[f2a-potencia-electrica|Potencia eléctrica]]: $P = VI = \\frac{V^2}{R}$.`,
          { I: `$I = \\frac PV = \\frac{${P}}{220} \\approx ${nf(I)}$ A.`, R: `$R = \\frac{V^2}{P} = \\frac{48400}{${P}} \\approx ${nf(Rr)}\\ \\Omega$.`, E: `$E = Pt = ${nf(P / 1000)}\\ \\text{kW}\\cdot${h}\\ \\text{h} = ${nf(ans)}$ kWh.` }[ask]],
        // otro camino: energía sumando P = V·I instante a instante (Simpson en el tiempo) e I y R desde la ley de Ohm
        verify: { kind: "value", tol: 1e-9, fn: () => { const i = P / V; return { I: i, R: V / i, E: F.simpson(() => V * i, 0, h * 3600, 2) / 3.6e6 }[ask]; } }
      };
    }
  };

  T["f2a-ohm-tf"] = {
    type: "tf", concepts: ["f2a-corriente"], difficulty: 2,
    generate(r) {
      const what = r.pick(["largo", "diámetro"]), n = r.pick([2, 3]), true_f = what === "largo" ? n : 1 / (n * n), claim = r.pick([n, 1 / n, n * n, 1 / (n * n)]);
      const say = f => f >= 1 ? `se multiplica por $${f}$` : `se divide por $${Math.round(1 / f)}$`;
      return {
        prompt: `<b>Verdadero o falso:</b> si a un alambre se le ${what === "largo" ? "multiplica el largo" : "multiplica el diámetro"} por $${n}$, sin cambiar ${what === "largo" ? "su sección" : "su largo"} ni el material, su resistencia ${say(claim)}.`,
        answer: Math.abs(claim - true_f) < 1e-12,
        explanation: `$R = \\frac{\\rho L}{A}$ y $A = \\frac{\\pi D^2}{4}$. ${what === "largo" ? `$R$ es proporcional al largo: ${say(true_f)}.` : `El área crece como $D^2$, es decir $${n * n}$ veces, y $R$ ${say(true_f)}.`} Es ${Math.abs(claim - true_f) < 1e-12 ? "verdadero" : "falso"}.`,
        solution: [R`Ver [[f2a-resistencia|resistencia]].`],
        // otro camino: cociente de resistencias calculadas como tubos en paralelo
        verify: { kind: "truth", fn: () => { const R1 = Rshells(1e-8, 1, 1e-3), R2 = what === "largo" ? Rshells(1e-8, n, 1e-3) : Rshells(1e-8, 1, n * 1e-3); return Math.abs(R2 / R1 / claim - 1) < 1e-9; } }
      };
    }
  };

  const cards = {
    "f2a-corriente": {
      title: "Corriente eléctrica y velocidad de deriva", aliases: ["corriente eléctrica", "densidad de corriente", "velocidad de deriva", "ampere"], concepts: ["f2a-corriente"],
      summary: "I = dQ/dt, en amperes. En un conductor, I = nqv_dA y J = I/A = nqv_d. Los electrones avanzan a fracciones de mm/s.",
      def: [R`**Corriente:** $I = \frac{dQ}{dt}$, la carga que atraviesa una sección por unidad de tiempo. Unidad: el ampere, $1$ A $= 1$ C/s. Por convención, su sentido es el del movimiento de las cargas positivas.`,
        R`**Densidad de corriente:** $\vec J = nq\vec v_d$, con $n$ los portadores por unidad de volumen y $\vec v_d$ su **velocidad de deriva** (el promedio de su movimiento, superpuesto a la agitación térmica). Para un alambre uniforme, $I = JA = nqv_dA$.`],
      idea: [R`Los electrones de un metal se mueven a cientos de km/s, pero en todas las direcciones. Al aplicar un campo, se agrega un avance lento de conjunto, la deriva: la luz se prende enseguida porque el campo se establece en todo el cable a la vez, no porque los electrones lleguen rápido.`],
      demo: [R`**Paso 1.** En un tiempo $dt$, cada portador avanza $v_d\,dt$. Atraviesan una sección dada los que estaban a menos de esa distancia: los de un cilindro de volumen $A\,v_d\,dt$.`,
        R`**Paso 2.** En ese cilindro hay $nAv_d\,dt$ portadores, con carga total $dQ = nqAv_d\,dt$.`,
        R`**Paso 3.** Dividiendo por $dt$: $I = nqv_dA$, y $J = \frac IA = nqv_d$. $\blacksquare$`],
      examples: [{ q: R`$10$ A por un cable de cobre de $2$ mm de diámetro.`, steps: [R`$A \approx 3{,}14\times10^{-6}$ m² y $v_d = \frac{10}{8{,}5\times10^{28}\cdot1{,}602\times10^{-19}\cdot3{,}14\times10^{-6}} \approx 0{,}23$ mm/s.`] }],
      tips: [R`Los electrones se mueven al revés que la corriente convencional: el signo lo pone $q$ en $\vec J = nq\vec v_d$.`],
      see: ["f2a-resistencia", "f2a-fem"]
    },
    "f2a-resistencia": {
      title: "Resistencia, resistividad y ley de Ohm", aliases: ["ley de Ohm", "resistencia eléctrica", "resistividad", "conductividad eléctrica", "coeficiente de temperatura"], concepts: ["f2a-corriente"],
      summary: "V = IR. Para un conductor uniforme, R = ρL/A. En los metales, ρ crece con la temperatura: ρ = ρ₀[1 + α(T − T₀)].",
      def: [R`**Ley de Ohm:** en muchos materiales (los óhmicos), la densidad de corriente es proporcional al campo: $\vec J = \sigma\vec E = \frac{\vec E}{\rho}$, con $\rho$ la **resistividad** y $\sigma = \frac1\rho$ la conductividad. Para un conductor, $V = IR$, con $R$ constante.`,
        R`**Resistencia** de un conductor uniforme de largo $L$ y sección $A$: $R = \frac{\rho L}{A}$, en ohms ($1\ \Omega = 1$ V/A).`,
        R`**Temperatura:** $\rho(T) = \rho_0[1 + \alpha(T - T_0)]$, con $\alpha$ el **coeficiente de temperatura** (en los metales, $\approx 4\times10^{-3}$ °C⁻¹).`],
      idea: [R`La resistencia viene de los choques de los electrones con la red de iones: un cable más largo tiene más choques en el camino, y uno más grueso ofrece más carriles en paralelo. Al calentarlo, los iones vibran más y los choques son más frecuentes.`],
      demo: [R`**Paso 1.** En un conductor uniforme de largo $L$ con una diferencia de potencial $V$ entre sus extremos, el campo es uniforme: $E = \frac VL$.`,
        R`**Paso 2.** Por la ley de Ohm local, $J = \frac{E}{\rho} = \frac{V}{\rho L}$, y la corriente es $I = JA = \frac{VA}{\rho L}$.`,
        R`**Paso 3.** Despejando, $V = I\frac{\rho L}{A}$: es la forma $V = IR$ con $R = \frac{\rho L}{A}$. $\blacksquare$`],
      examples: [{ q: R`$10$ m de cobre de $1$ mm de diámetro.`, steps: [R`$R = \frac{1{,}72\times10^{-8}\cdot10}{7{,}85\times10^{-7}} \approx 0{,}22\ \Omega$.`] }],
      tips: [R`Duplicar el diámetro divide la resistencia por $4$, no por $2$: el área crece con el cuadrado.`],
      see: ["f2a-corriente", "f2a-fem", "f2a-potencia-electrica"]
    },
    "f2a-fem": {
      title: "Fuerza electromotriz y resistencia interna", aliases: ["fuerza electromotriz", "resistencia interna", "tensión en bornes"], concepts: ["f2a-fem"],
      summary: "Una fuente de fem ε mueve cargas hacia potenciales más altos. Con resistencia interna r, la tensión en bornes es V = ε − Ir, y en un circuito simple I = ε/(R + r).",
      def: [R`**Fuerza electromotriz** $\varepsilon$: el trabajo por unidad de carga que hace una fuente (química, en una pila) para llevar carga desde el borne negativo al positivo. Se mide en volts, aunque no es una fuerza.`,
        R`**Resistencia interna** $r$: la de los materiales de la propia fuente. Con corriente $I$, la **tensión en bornes** es $V = \varepsilon - Ir$, y solo coincide con la fem en circuito abierto.`,
        R`**Circuito simple:** una fuente con una resistencia externa $R$ da $I = \frac{\varepsilon}{R + r}$.`],
      idea: [R`La fuente es como una bomba que sube el agua (la carga) a un tanque más alto, y el circuito, la cañería por donde baja. Parte de la altura se pierde dentro de la misma bomba: eso es la caída $Ir$.`],
      demo: [R`**Paso 1.** Recorriendo el circuito, el potencial sube $\varepsilon$ al atravesar la fuente y baja $Ir$ en su resistencia interna y $IR$ en la externa.`,
        R`**Paso 2.** Al volver al punto de partida, el potencial es el mismo (el campo electrostático es conservativo): $\varepsilon - Ir - IR = 0$.`,
        R`**Paso 3.** Despejando, $I = \frac{\varepsilon}{R + r}$, y la tensión en bornes es $V = IR = \varepsilon - Ir$. $\blacksquare$`],
      examples: [{ q: R`Una pila de $9$ V con $r = 1\ \Omega$ y una carga de $17\ \Omega$.`, steps: [R`$I = 0{,}5$ A y $V = 9 - 0{,}5 = 8{,}5$ V.`] }],
      tips: [R`Si al encender algo la tensión de la batería cae mucho, su resistencia interna es grande (pasa con las pilas gastadas).`],
      see: ["f2a-resistencia", "f2a-potencia-electrica", "f2a-potencial"]
    },
    "f2a-potencia-electrica": {
      title: "Potencia eléctrica y efecto Joule", aliases: ["potencia eléctrica", "efecto Joule", "máxima transferencia de potencia", "kilowatt hora"], concepts: ["f2a-fem"],
      summary: "P = VI. En una resistencia, P = I²R = V²/R, que se disipa como calor. Una fuente le entrega la máxima potencia a una carga R = r, y vale ε²/(4r).",
      def: [R`**Potencia eléctrica:** la energía que entrega o recibe un elemento por unidad de tiempo, $P = VI$. En una resistencia se convierte en calor (**efecto Joule**): $P = I^2R = \frac{V^2}{R}$.`,
        R`**Máxima transferencia de potencia:** una fuente de fem $\varepsilon$ y resistencia interna $r$ le entrega la máxima potencia a una carga $R = r$, y esa potencia es $\frac{\varepsilon^2}{4r}$.`,
        R`**Energía consumida:** $E = Pt$. En las facturas se mide en kilowatt hora: $1$ kWh $= 3{,}6\times10^6$ J.`],
      idea: [R`Si la carga es muy chica, circula mucha corriente pero casi toda la potencia se queda en la fuente; si es muy grande, casi no circula corriente. El óptimo está en el medio, cuando las dos resistencias son iguales.`],
      demo: [R`**Paso 1 ($P = VI$).** Una carga $dq$ que atraviesa un elemento con tensión $V$ pierde energía $V\,dq$. Por unidad de tiempo, $P = V\frac{dq}{dt} = VI$. Con $V = IR$ salen $I^2R$ y $\frac{V^2}{R}$.`,
        R`**Paso 2 (potencia en la carga).** Con $I = \frac{\varepsilon}{R + r}$, la potencia en $R$ es $P(R) = \frac{\varepsilon^2R}{(R + r)^2}$.`,
        R`**Paso 3.** Derivando con la regla del cociente: $P'(R) = \varepsilon^2\frac{(R + r) - 2R}{(R + r)^3} = \varepsilon^2\frac{r - R}{(R + r)^3}$. Es positiva si $R < r$ y negativa si $R > r$: el máximo está en $R = r$.`,
        R`**Paso 4.** Reemplazando, $P_{max} = \frac{\varepsilon^2r}{4r^2} = \frac{\varepsilon^2}{4r}$. $\blacksquare$`],
      examples: [{ q: R`Un calefactor de $2000$ W a $220$ V.`, steps: [R`$I \approx 9{,}1$ A y $R = \frac{220^2}{2000} \approx 24{,}2\ \Omega$; en $3$ h consume $6$ kWh.`] }],
      tips: [R`Con tensión fija (la de la red), menos resistencia significa **más** potencia: $P = \frac{V^2}{R}$.`],
      see: ["f2a-fem", "f2a-resistencia", "f1-potencia"]
    }
  };

  E.extendCourse("f102a", {
    concepts: { "f2a-corriente": { name: "Corriente y resistencia" }, "f2a-fem": { name: "Fem y potencia" } },
    templates: T,
    units: [{
      id: "f2a-corriente-u", order: 4, program: "Unidad 4", title: "Corriente, resistencia y fuerza electromotriz", icon: "zap",
      diagnostic: ["f2a-resistencia-num", "f2a-fem-num", "f2a-potencia-num"],
      lessons: [
        { id: "f2a-corriente-l1", title: "Corriente y resistencia", templates: ["f2a-deriva-num", "f2a-resistencia-num", "f2a-ohm-tf"], theory: ["f2a-corriente", "f2a-resistencia"],
          intro: R`$I = nqv_dA$ y $R = \frac{\rho L}{A}$.` },
        { id: "f2a-corriente-l2", title: "Fem y potencia", templates: ["f2a-fem-num", "f2a-potencia-num"], theory: ["f2a-fem", "f2a-potencia-electrica"],
          intro: R`$I = \frac{\varepsilon}{R + r}$ y $P = VI = I^2R$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 5 · CIRCUITOS DE CORRIENTE CONTINUA
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, F = E.f2a, nf = F.nf;
  const T = {};
  const dec = v => String(v).replace(".", "{,}");
  const par = (a, b) => a * b / (a + b);
  // análisis nodal: resistencias [[a, b, R]], nodo 0 a tierra y nodo 1 a tensión V; devuelve los potenciales de los nodos
  const nodal = (edges, n, V) => {
    const free = [...Array(n).keys()].filter(i => i > 1), idx = new Map(free.map((v, i) => [v, i]));
    const A = free.map(() => free.map(() => 0)), b = free.map(() => 0);
    for (const [p, q, Rr] of edges) for (const [u, w] of [[p, q], [q, p]]) {
      if (!idx.has(u)) continue;
      const i = idx.get(u);
      A[i][i] += 1 / Rr;
      if (idx.has(w)) A[i][idx.get(w)] -= 1 / Rr; else b[i] += (w === 1 ? V : 0) / Rr;
    }
    const x = free.length ? F.solve(A, b) : [], pot = [0, V];
    free.forEach((v, i) => { pot[v] = x[i]; });
    return pot;
  };
  const reqNodal = (edges, n) => { const pot = nodal(edges, n, 1); let I = 0; for (const [p, q, Rr] of edges) { if (p === 1) I += (1 - pot[q]) / Rr; if (q === 1) I += (1 - pot[p]) / Rr; } return 1 / I; };
  // circuito de tres ramas entre los nodos A (arriba) y B (abajo): ε₁ con R₁, ε₂ con R₂ (signos s₁, s₂: +1 si el borne + mira a A) y R₃ sola
  const branches = (e1, e2, r1, r2, r3) => {
    // mallas: Ia (izquierda) e Ib (derecha), en sentido horario
    const [Ia, Ib] = F.solve([[r1 + r3, -r3], [-r3, r2 + r3]], [e1, -e2]);
    return { I1: Ia, I2: -Ib, I3: Ia - Ib, VAB: (Ia - Ib) * r3 };
  };

  T["f2a-req-num"] = {
    type: "numeric", concepts: ["f2a-circuitos"], difficulty: 2,
    generate(r) {
      const Rs = [r.int(1, 12), r.int(1, 12), r.int(1, 12), r.int(1, 12)].map(x => x * r.pick([1, 10])), cfg = r.pick(["a", "b", "c"]);
      const [a, b, c, d] = Rs;
      const Req = { a: a + par(b, c), b: par(a + b, c), c: par(a, b) + par(c, d) }[cfg];
      // nodos: 1 = entrada, 0 = salida
      const edges = { a: [[1, 2, a], [2, 0, b], [2, 0, c]], b: [[1, 2, a], [2, 0, b], [1, 0, c]], c: [[1, 2, a], [1, 2, b], [2, 0, c], [2, 0, d]] }[cfg];
      const desc = { a: `$R_1 = ${a}\\ \\Omega$ en serie con el paralelo de $R_2 = ${b}\\ \\Omega$ y $R_3 = ${c}\\ \\Omega$`, b: `$R_1 = ${a}\\ \\Omega$ y $R_2 = ${b}\\ \\Omega$ en serie, y ese par en paralelo con $R_3 = ${c}\\ \\Omega$`, c: `el paralelo de $R_1 = ${a}\\ \\Omega$ y $R_2 = ${b}\\ \\Omega$, en serie con el paralelo de $R_3 = ${c}\\ \\Omega$ y $R_4 = ${d}\\ \\Omega$` }[cfg];
      return {
        prompt: `¿Cuál es la resistencia equivalente (en Ω) de este arreglo: ${desc}?`,
        answer: Req,
        solution: [`En [[f2a-resistores|serie]] se suman las resistencias; en paralelo, las inversas (para dos, $\\frac{R_aR_b}{R_a + R_b}$).`,
          { a: `$R_{23} = ${nf(par(b, c))}\\ \\Omega$ y $R_{eq} = R_1 + R_{23} \\approx ${nf(Req)}\\ \\Omega$.`, b: `$R_{12} = ${a + b}\\ \\Omega$ y $R_{eq} = \\frac{${a + b}\\cdot${c}}{${a + b + c}} \\approx ${nf(Req)}\\ \\Omega$.`, c: `$R_{12} = ${nf(par(a, b))}\\ \\Omega$, $R_{34} = ${nf(par(c, d))}\\ \\Omega$ y $R_{eq} \\approx ${nf(Req)}\\ \\Omega$.` }[cfg]],
        // otro camino: análisis nodal con 1 V aplicado; R = V/I
        verify: { kind: "value", tol: 1e-9, fn: () => reqNodal(edges, 3) }
      };
    }
  };

  T["f2a-kirchhoff-num"] = {
    type: "numeric", concepts: ["f2a-kirchhoff"], difficulty: 3,
    generate(r) {
      const e1 = r.int(2, 24), e2 = r.int(2, 24) * r.pick([1, -1]), r1 = r.int(1, 10), r2 = r.int(1, 10), r3 = r.int(1, 20), ask = r.pick(["I3", "I1", "VAB"]);
      const s = branches(e1, e2, r1, r2, r3), ans = s[ask];
      if (Math.abs(ans) < 1e-3) return null;
      return {
        prompt: `Entre dos nodos $A$ (arriba) y $B$ (abajo) hay tres ramas en paralelo: la rama 1 tiene una batería de $${e1}$ V, con el borne positivo hacia $A$, en serie con $R_1 = ${r1}\\ \\Omega$; la rama 2, una batería de $${Math.abs(e2)}$ V con el borne positivo hacia ${e2 > 0 ? "$A$" : "$B$"}, en serie con $R_2 = ${r2}\\ \\Omega$; y la rama 3, solo $R_3 = ${r3}\\ \\Omega$. ${{ I3: "¿Qué corriente circula por $R_3$ (en A, positiva si va de $A$ hacia $B$)?", I1: "¿Qué corriente circula por la rama 1 (en A, positiva si va de $B$ hacia $A$, es decir, si sale por el borne positivo de su batería)?", VAB: "¿Cuánto vale $V_A - V_B$ (en V)?" }[ask]} (Baterías ideales.)`,
        answer: ans,
        solution: [`[[f2a-kirchhoff|Leyes de Kirchhoff]] con corrientes de malla $I_a$ (izquierda) e $I_b$ (derecha), las dos en sentido horario.`,
          `Malla izquierda: $${e1} - ${r1}I_a - ${r3}(I_a - I_b) = 0$. Malla derecha: $-${r3}(I_b - I_a) - ${r2}I_b ${e2 > 0 ? "-" : "+"} ${Math.abs(e2)} = 0$.`,
          `Resolviendo: $I_a \\approx ${nf(s.I1)}$ A e $I_b \\approx ${nf(-s.I2)}$ A. Por $R_3$ pasa $I_a - I_b \\approx ${nf(s.I3)}$ A, y $V_A - V_B = R_3(I_a - I_b) \\approx ${nf(s.VAB)}$ V.`,
          `Pedido: $${nf(ans)}$ ${ask === "VAB" ? "V" : "A"}${ans < 0 ? " (el signo negativo dice que va al revés del sentido supuesto)" : ""}.`],
        // otro camino: método de nodos, con una sola incógnita V_A (ley de nodos en A)
        verify: { kind: "value", tol: 1e-9, fn: () => { const VA = (e1 / r1 + e2 / r2) / (1 / r1 + 1 / r2 + 1 / r3); return { I3: VA / r3, I1: (e1 - VA) / r1, VAB: VA }[ask]; } }
      };
    }
  };

  T["f2a-kirchhoff-order"] = {
    type: "order", concepts: ["f2a-kirchhoff"], difficulty: 2,
    generate(r) {
      const e1 = r.int(2, 24), e2 = r.int(2, 24), r1 = r.int(1, 10), r2 = r.int(1, 10), r3 = r.int(1, 20), s = branches(e1, e2, r1, r2, r3);
      return {
        prompt: `Una batería de $${e1}$ V con $R_1 = ${r1}\\ \\Omega$ y otra de $${e2}$ V con $R_2 = ${r2}\\ \\Omega$ alimentan en paralelo una resistencia $R_3 = ${r3}\\ \\Omega$ (las dos con el borne positivo hacia el mismo nodo $A$). Ordená los pasos para hallar la corriente en $R_3$ por el método de nodos.`,
        steps: [`Elegir un nodo de referencia ($V_B = 0$) y tomar como incógnita el potencial $V_A$ del otro.`,
          `Escribir la corriente de cada rama en función de $V_A$: $\\frac{${e1} - V_A}{${r1}}$, $\\frac{${e2} - V_A}{${r2}}$ y $\\frac{V_A}{${r3}}$.`,
          `[[f2a-kirchhoff|Ley de nodos]] en $A$: lo que entra por las ramas 1 y 2 sale por la 3.`,
          `Despejar: $V_A \\approx ${nf(s.VAB)}$ V, y la corriente en $R_3$ es $\\frac{V_A}{R_3} \\approx ${nf(s.I3)}$ A.`],
        solution: [`Primero la referencia y la incógnita, después cada corriente en función de ella, la ley de nodos y al final el despeje.`],
        // verificación: el resultado de los nodos coincide con el de las mallas
        verify: { kind: "truth", target: true, fn: () => { const VA = (e1 / r1 + e2 / r2) / (1 / r1 + 1 / r2 + 1 / r3); return Math.abs(VA - s.VAB) < 1e-9 * Math.max(1, Math.abs(VA)); } }
      };
    }
  };

  T["f2a-rc-num"] = {
    type: "numeric", concepts: ["f2a-rc"], difficulty: 3,
    generate(r) {
      const Rk = r.int(1, 100), Cu = r.int(1, 100), em = r.int(3, 24), charge = r.bool(), ask = r.pick(["q", "I", "t"]), tau = Rk * Cu; // kΩ·μF = ms
      const t = r.int(1, 30) / 10 * tau, frac = r.pick([0.25, 0.5, 0.75, 0.9, 0.95]);
      const Q0 = Cu * em; // μC
      const q = charge ? Q0 * (1 - Math.exp(-t / tau)) : Q0 * Math.exp(-t / tau), I = em / Rk * Math.exp(-t / tau); // mA
      const tf = charge ? -tau * Math.log(1 - frac) : -tau * Math.log(frac);
      const ans = { q, I, t: tf }[ask];
      const tt = nf(+t.toPrecision(4));
      return {
        prompt: `${charge ? `Un capacitor de $${Cu}$ μF, descargado, se conecta en $t = 0$ a una batería de $${em}$ V a través de una resistencia de $${Rk}$ kΩ.` : `Un capacitor de $${Cu}$ μF, cargado a $${em}$ V, se descarga en $t = 0$ a través de una resistencia de $${Rk}$ kΩ.`} ${{ q: `¿Qué carga tiene el capacitor en $t = ${tt}$ ms (en μC)?`, I: `¿Qué corriente circula en $t = ${tt}$ ms (en mA, en valor absoluto)?`, t: `¿En qué instante su carga llega al $${100 * frac}\\,\\%$ de la ${charge ? "carga final" : "carga inicial"} (en ms)?` }[ask]}`,
        answer: ans,
        solution: [`[[f2a-rc|Circuito RC]]: la constante de tiempo es $\\tau = RC = ${Rk}\\ \\text{k}\\Omega\\cdot${Cu}\\ \\mu\\text{F} = ${tau}$ ms.`,
          charge ? `Carga: $q(t) = C\\varepsilon\\left(1 - e^{-t/\\tau}\\right)$, con $C\\varepsilon = ${Q0}$ μC, e $I(t) = \\frac{\\varepsilon}{R}e^{-t/\\tau}$.` : `Descarga: $q(t) = Q_0e^{-t/\\tau}$, con $Q_0 = C\\varepsilon = ${Q0}$ μC, y $|I(t)| = \\frac{Q_0}{RC}e^{-t/\\tau}$.`,
          { q: `$q \\approx ${nf(q)}$ μC.`, I: `$|I| \\approx ${nf(I)}$ mA.`, t: charge ? `$1 - e^{-t/\\tau} = ${dec(frac)} \\Rightarrow t = -\\tau\\ln(${dec(+(1 - frac).toFixed(2))}) \\approx ${nf(tf)}$ ms.` : `$e^{-t/\\tau} = ${dec(frac)} \\Rightarrow t = -\\tau\\ln(${dec(frac)}) \\approx ${nf(tf)}$ ms.` }[ask]],
        // otro camino: se integra R dq/dt = ε − q/C (o −q/C) con RK4, en ms, μC y mA
        verify: ask === "t"
          ? { kind: "ode", f: (_, y) => [charge ? (Q0 - y[0]) / tau : -y[0] / tau], y0: [charge ? 0 : Q0], t1: 0, until: (_, y) => (charge ? y[0] >= frac * Q0 : y[0] <= frac * Q0), g: (_, y) => y[0] - frac * Q0, dt: tau / 2000, tmax: 20 * tau, out: tt2 => tt2, tol: 1e-4 }
          : { kind: "ode", f: (_, y) => [charge ? (Q0 - y[0]) / tau : -y[0] / tau], y0: [charge ? 0 : Q0], t1: t, dt: tau / 2000, out: (_, y) => ask === "q" ? y[0] : Math.abs(charge ? (Q0 - y[0]) / tau : -y[0] / tau), tol: 1e-6 }
      };
    }
  };
  T["f2a-rc-num"].testN = 100;

  T["f2a-rc-tf"] = {
    type: "tf", concepts: ["f2a-rc"], difficulty: 2,
    generate(r) {
      const m = r.pick([{ t: R`\tau`, v: 1 }, { t: R`2\tau`, v: 2 }, { t: R`3\tau`, v: 3 }, { t: R`\tau\ln 2`, v: Math.LN2 }]), truth = r.bool();
      const real = 100 * (1 - Math.exp(-m.v)), claim = truth ? Math.round(real) : r.pick([Math.round(100 * Math.exp(-m.v)), Math.round(100 * m.v / 3), Math.round(real) + r.pick([-12, 12])]);
      if (!truth && Math.abs(claim - real) < 3) return null;
      return {
        prompt: `<b>Verdadero o falso:</b> un capacitor descargado se carga a través de una resistencia con una batería. En $t = ${m.t}$ (con $\\tau = RC$) ya tiene aproximadamente el $${claim}\\,\\%$ de su carga final.`,
        answer: Math.abs(claim - real) < 1,
        explanation: `La fracción cargada es $1 - e^{-t/\\tau} = 1 - e^{-${m.v === Math.LN2 ? "\\ln 2" : m.v}} \\approx ${nf(real / 100)}$, o sea el $${nf(real)}\\,\\%$. Es ${Math.abs(claim - real) < 1 ? "verdadero" : "falso"}.`,
        solution: [R`Ver [[f2a-rc|circuito RC]]: en $\tau$ se completa el $63\,\%$, en $2\tau$ el $86\,\%$, en $3\tau$ el $95\,\%$, y en $\tau\ln2$ la mitad.`],
        // otro camino: simulación RK4 de la carga
        verify: { kind: "truth", fn: () => { let q = 0; const h = m.v / 4000; for (let i = 0; i < 4000; i++) { const f = x => 1 - x, k1 = f(q), k2 = f(q + h / 2 * k1), k3 = f(q + h / 2 * k2), k4 = f(q + h * k3); q += h / 6 * (k1 + 2 * k2 + 2 * k3 + k4); } return Math.abs(claim - 100 * q) < 1; } }
      };
    }
  };

  T["f2a-instrumentos-num"] = {
    type: "numeric", concepts: ["f2a-circuitos"], difficulty: 2,
    generate(r) {
      const Ig = r.pick([50, 100, 200, 500, 1000]), Rg = r.int(2, 20) * 10, amp = r.bool(), Imax = r.pick([0.1, 0.5, 1, 2, 5, 10]), Vmax = r.pick([1, 5, 10, 20, 50, 100]);
      const ig = Ig * 1e-6, ans = amp ? ig * Rg / (Imax - ig) : Vmax / ig - Rg;
      return {
        prompt: `Un galvanómetro tiene resistencia interna $${Rg}\\ \\Omega$ y llega a fondo de escala con $${Ig}$ μA. ${amp ? `Para usarlo como amperímetro de $${dec(Imax)}$ A a fondo de escala, ¿qué resistencia (en Ω) hay que conectarle en paralelo?` : `Para usarlo como voltímetro de $${Vmax}$ V a fondo de escala, ¿qué resistencia (en Ω) hay que conectarle en serie?`}`,
        answer: ans,
        solution: amp ? [`[[f2a-instrumentos|Amperímetro]]: la resistencia en paralelo (shunt) desvía todo lo que el galvanómetro no puede llevar, $I - I_g$, con la misma tensión $I_gR_g$.`, `$R_s = \\frac{I_gR_g}{I - I_g} \\approx ${nf(ans)}\\ \\Omega$: muy chica, para que el amperímetro casi no perturbe el circuito.`]
          : [`[[f2a-instrumentos|Voltímetro]]: con $V$ aplicado, la corriente tiene que ser $I_g$: $I_g(R_g + R_m) = V$.`, `$R_m = \\frac{V}{I_g} - R_g \\approx ${nf(ans)}\\ \\Omega$: muy grande, para que el voltímetro casi no tome corriente.`],
        // otro camino: con la resistencia hallada, la corriente que pasa por el galvanómetro (divisor de corriente, o ley de Ohm en serie) es justo I_g
        verify: { kind: "zero", fn: x => amp ? (Imax * x / (x + Rg) - ig) / ig : (Vmax / (Rg + x) - ig) / ig }
      };
    }
  };

  const cards = {
    "f2a-resistores": {
      title: "Resistencias en serie y en paralelo", aliases: ["resistencias en serie", "resistencias en paralelo", "resistencia equivalente", "divisor de tensión"], concepts: ["f2a-circuitos"],
      summary: "En serie (misma corriente) se suman: R = R₁ + R₂. En paralelo (misma tensión) se suman las inversas: 1/R = 1/R₁ + 1/R₂.",
      def: [R`**Serie:** la misma corriente pasa por todas; $R_{eq} = R_1 + R_2 + \cdots$. La tensión se reparte en proporción a cada resistencia (divisor de tensión: $V_1 = V\frac{R_1}{R_1 + R_2}$).`,
        R`**Paralelo:** todas tienen la misma tensión; $\frac1{R_{eq}} = \frac1{R_1} + \frac1{R_2} + \cdots$ (para dos, $\frac{R_1R_2}{R_1 + R_2}$). La equivalente es menor que la más chica.`],
      idea: [R`En serie, un camino más largo; en paralelo, más caminos a la vez. Es al revés que con los [[f2a-asociacion-capacitores|capacitores]].`],
      demo: [R`**Paso 1 (serie).** La carga no se acumula en los cables: la corriente $I$ es la misma en todas. Las caídas se suman a lo largo del camino: $V = IR_1 + IR_2 + \cdots = I(R_1 + R_2 + \cdots)$, y $R_{eq} = \frac VI = \sum R_i$.`,
        R`**Paso 2 (paralelo).** Los extremos de todas están unidos, así que tienen la misma $V$. Por la ley de nodos, la corriente total es la suma: $I = \frac V{R_1} + \frac V{R_2} + \cdots$. Dividiendo por $V$: $\frac1{R_{eq}} = \sum\frac1{R_i}$. $\blacksquare$`],
      examples: [{ q: R`$6\ \Omega$ y $3\ \Omega$ en paralelo, en serie con $4\ \Omega$.`, steps: [R`$\frac{18}{9} = 2\ \Omega$, y $R_{eq} = 6\ \Omega$.`] }],
      tips: [R`Para reducir una red, buscá pares que estén claramente en serie (sin nada que salga del medio) o en paralelo (mismos dos nodos). Si no hay, usá [[f2a-kirchhoff|Kirchhoff]].`],
      see: ["f2a-kirchhoff", "f2a-resistencia", "f2a-instrumentos"]
    },
    "f2a-kirchhoff": {
      title: "Leyes de Kirchhoff", aliases: ["leyes de Kirchhoff", "ley de nodos", "ley de mallas", "corrientes de malla", "método de nodos"], concepts: ["f2a-kirchhoff"],
      summary: "Nodos: la suma de corrientes que entran es igual a la de las que salen. Mallas: la suma de subidas y bajadas de potencial en un recorrido cerrado es cero.",
      def: [R`**Ley de nodos:** en cada nodo, $\sum I_{entran} = \sum I_{salen}$.`,
        R`**Ley de mallas:** en todo recorrido cerrado, $\sum\Delta V = 0$. Convención: al atravesar una resistencia en el sentido de la corriente, el potencial baja $IR$; al atravesar una fuente de $-$ a $+$, sube $\varepsilon$.`,
        R`**Métodos:** con corrientes de malla, una incógnita por malla y una ecuación de mallas por cada una; con potenciales de nodo, una incógnita por nodo (salvo el de referencia) y la ley de nodos en cada uno. Las dos dan un sistema lineal.`],
      idea: [R`Son dos leyes de conservación: la de la carga (no se acumula en los nodos) y la de la energía (una carga que da la vuelta completa vuelve al mismo potencial).`],
      demo: [R`**Paso 1 (nodos).** En un estado estacionario la carga de un nodo no cambia: $\frac{dQ}{dt} = \sum I_{entran} - \sum I_{salen} = 0$. Es la [[f2a-carga|conservación de la carga]].`,
        R`**Paso 2 (mallas).** El potencial es una función del punto: al recorrer un camino cerrado y volver al inicio, $V_{final} - V_{inicial} = 0$. Esa diferencia es la suma de los saltos en cada elemento, así que suman cero. Es la conservatividad del [[f2a-potencial|potencial]]. $\blacksquare$`],
      examples: [{ q: R`Dos ramas con $12$ V y $2\ \Omega$ y con $6$ V y $2\ \Omega$ alimentan una de $4\ \Omega$.`, steps: [R`Nodos: $\frac{12 - V}{2} + \frac{6 - V}{2} = \frac V4$, así que $V = 7{,}2$ V y por la de $4\ \Omega$ pasan $1{,}8$ A.`] }],
      tips: [R`Elegí los sentidos de las corrientes al azar si hace falta: si alguna sale negativa, circula al revés. Lo que no se puede es cambiar el sentido a mitad de las cuentas.`],
      see: ["f2a-resistores", "f2a-fem", "al-sistemas"]
    },
    "f2a-rc": {
      title: "Circuitos RC", aliases: ["circuito RC", "constante de tiempo RC", "carga de un capacitor", "descarga de un capacitor"], concepts: ["f2a-rc"],
      summary: "Al cargar: q = Cε(1 − e^(−t/RC)) e I = (ε/R)e^(−t/RC). Al descargar: q = Q₀e^(−t/RC). τ = RC es el tiempo en que se completa el 63 %.",
      def: [R`**Carga** (capacitor descargado, batería $\varepsilon$, resistencia $R$): $q(t) = C\varepsilon\left(1 - e^{-t/RC}\right)$ e $I(t) = \frac{\varepsilon}{R}e^{-t/RC}$.`,
        R`**Descarga** (carga inicial $Q_0$, a través de $R$): $q(t) = Q_0e^{-t/RC}$ e $|I(t)| = \frac{Q_0}{RC}e^{-t/RC}$.`,
        R`**Constante de tiempo:** $\tau = RC$ (con $R$ en Ω y $C$ en F, da segundos; con kΩ y μF, milisegundos). En $\tau$ la carga completa el $63\,\%$; en $5\tau$, más del $99\,\%$.`],
      idea: [R`Al principio el capacitor vacío no se opone y la corriente es la máxima, $\frac\varepsilon R$. A medida que se carga, su tensión se resta de la de la batería y la corriente se apaga: cuanto menos le falta, más despacio se llena, y eso es una exponencial.`],
      demo: [R`**Paso 1.** Ley de mallas durante la carga: $\varepsilon - IR - \frac qC = 0$, con $I = \frac{dq}{dt}$. Queda la [[c2-edo-lineal|ecuación lineal]] $R\frac{dq}{dt} = \varepsilon - \frac qC$.`,
        R`**Paso 2.** Con $u = C\varepsilon - q$ (lo que falta cargar), $\frac{du}{dt} = -\frac{dq}{dt} = -\frac{u}{RC}$: la derivada es proporcional a la función, así que $u = u_0e^{-t/RC}$.`,
        R`**Paso 3.** Como $q(0) = 0$, $u_0 = C\varepsilon$ y $q = C\varepsilon\left(1 - e^{-t/RC}\right)$. Derivando, $I = \frac\varepsilon Re^{-t/RC}$.`,
        R`**Paso 4 (descarga).** Sin batería, $-IR - \frac qC = 0$, es decir $\frac{dq}{dt} = -\frac{q}{RC}$, y $q = Q_0e^{-t/RC}$. $\blacksquare$`],
      examples: [{ q: R`$R = 10$ kΩ, $C = 100$ μF, $\varepsilon = 12$ V.`, steps: [R`$\tau = 1$ s; en $t = 1$ s, $q \approx 0{,}632\cdot1200 \approx 759$ μC.`] }],
      tips: [R`Para saber cuándo se llega a una fracción $f$ de la carga final, $t = -\tau\ln(1 - f)$; para la mitad, $\tau\ln2 \approx 0{,}69\,\tau$.`],
      see: ["f2a-kirchhoff", "f2a-capacitancia", "c2-edo-lineal"]
    },
    "f2a-instrumentos": {
      title: "Amperímetros y voltímetros", aliases: ["amperímetro", "voltímetro", "galvanómetro", "resistencia shunt"], concepts: ["f2a-circuitos"],
      summary: "El amperímetro va en serie y tiene resistencia muy chica (galvanómetro con un shunt en paralelo); el voltímetro va en paralelo y tiene resistencia muy grande (galvanómetro con una resistencia en serie).",
      def: [R`**Galvanómetro:** instrumento de bobina móvil que llega a fondo de escala con una corriente chica $I_g$ y tiene resistencia $R_g$.`,
        R`**Amperímetro** de fondo de escala $I$: galvanómetro con una resistencia **en paralelo** (shunt) $R_s = \frac{I_gR_g}{I - I_g}$. Se conecta en serie con el elemento.`,
        R`**Voltímetro** de fondo de escala $V$: galvanómetro con una resistencia **en serie** $R_m = \frac{V}{I_g} - R_g$. Se conecta en paralelo con el elemento.`],
      idea: [R`Un instrumento ideal no cambia lo que mide: el amperímetro no debería agregar resistencia en el camino, y el voltímetro no debería robarle corriente al circuito. Por eso uno es casi un cable y el otro casi un circuito abierto.`],
      demo: [R`**Paso 1 (shunt).** A fondo de escala pasan $I_g$ por el galvanómetro e $I - I_g$ por el shunt. Como están en paralelo, tienen la misma tensión: $I_gR_g = (I - I_g)R_s$, de donde $R_s = \frac{I_gR_g}{I - I_g}$.`,
        R`**Paso 2 (multiplicador).** En serie la corriente es la misma, $I_g$, y la tensión total es $V = I_g(R_g + R_m)$. Despejando, $R_m = \frac V{I_g} - R_g$. $\blacksquare$`],
      examples: [{ q: R`Galvanómetro de $100$ μA y $50\ \Omega$, como amperímetro de $1$ A.`, steps: [R`$R_s = \frac{10^{-4}\cdot50}{0{,}9999} \approx 0{,}005\ \Omega$.`] }],
      tips: [R`Un amperímetro conectado en paralelo hace un cortocircuito (y se quema); un voltímetro en serie corta casi toda la corriente.`],
      see: ["f2a-resistores", "f2a-kirchhoff"]
    }
  };

  E.extendCourse("f102a", {
    concepts: { "f2a-circuitos": { name: "Redes de resistencias" }, "f2a-kirchhoff": { name: "Leyes de Kirchhoff" }, "f2a-rc": { name: "Circuitos RC" } },
    templates: T,
    units: [{
      id: "f2a-circuitos-u", order: 5, program: "Unidad 5", title: "Circuitos de corriente continua", icon: "grid-3x3",
      diagnostic: ["f2a-req-num", "f2a-kirchhoff-num", "f2a-rc-num"],
      lessons: [
        { id: "f2a-circuitos-l1", title: "Redes e instrumentos", templates: ["f2a-req-num", "f2a-instrumentos-num"], theory: ["f2a-resistores", "f2a-instrumentos"],
          intro: R`En serie se suman las resistencias; en paralelo, las inversas.` },
        { id: "f2a-circuitos-l2", title: "Kirchhoff", templates: ["f2a-kirchhoff-num", "f2a-kirchhoff-order"], theory: ["f2a-kirchhoff"],
          intro: R`Nodos: lo que entra sale. Mallas: en una vuelta completa, $\sum\Delta V = 0$.` },
        { id: "f2a-circuitos-l3", title: "Circuitos RC", templates: ["f2a-rc-num", "f2a-rc-tf"], theory: ["f2a-rc"],
          intro: R`$q = C\varepsilon\left(1 - e^{-t/RC}\right)$: en $\tau = RC$ se completa el $63\,\%$.` }
      ]
    }],
    cards
  });
})();
