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
    k: 8.988e9, e0: 8.854e-12, mu0: 4 * Math.PI * 1e-7, qe: 1.602e-19, me: 9.109e-31, mp: 1.673e-27,
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
