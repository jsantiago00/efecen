/*
 * F102A · Física General II A — Lic. en Ciencias Básicas (FCEN, UNCuyo), Plan Ord. 77/15 C.S.
 * ==========================================================================================
 * Temario: programa oficial 2026 (prof. Rubén Santos), 9 unidades:
 *   1 Carga y campo eléctrico · 2 Potencial eléctrico · 3 Capacitancia y dieléctricos
 *   4 Corriente, resistencia y fem · 5 Circuitos de corriente continua · 6 Campo magnético
 *   7 Fuentes de campo magnético · 8 Inducción electromagnética · 9 Corriente alterna
 * Extra UBA (temas de Física 3 de Cs. Físicas, FCEN-UBA, que no están en el programa de F102A):
 *   Electrostática avanzada · Medios materiales · Thévenin, puentes y filtros · Ondas desde Maxwell y potencial vector
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
      // error típico: dividir por r en lugar de r²
      const Fr = [0, 1].reduce((s, i) => s + F.k * Q[2] * Q[i] * Math.sign(xs[2] - xs[i]) / Math.abs(xs[2] - xs[i]), 0);
      return {
        traps: Math.abs(Fr - Fx) > 0.02 * Math.abs(Fx) ? [{ value: Fr, msg: "La fuerza de Coulomb va con $1/r^2$: te faltó elevar la distancia al cuadrado." }] : [],
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

  T["f2a-dipolo-num"] = {
    type: "numeric", concepts: ["f2a-campo-electrico"], difficulty: 2,
    generate(r) {
      const q = r.int(1, 20), d = r.int(1, 20), E0 = r.int(1, 10) * 10, th = r.pick([30, 45, 60, 90, 120, 135, 150]), th2 = r.pick([0, 90, 180]), ask = r.pick(["tau", "U", "W"]);
      if ((ask === "W" && th === th2) || (ask === "U" && th === 90)) return null;
      const p = q * 1e-9 * d * 1e-3, Ev = E0 * 1e3, t1 = th * Math.PI / 180, t2 = th2 * Math.PI / 180;
      const val = { tau: p * Ev * Math.sin(t1), U: -p * Ev * Math.cos(t1), W: p * Ev * (Math.cos(t1) - Math.cos(t2)) }[ask], ans = val * 1e6;
      return {
        prompt: `Un dipolo eléctrico está formado por cargas de $\\pm${q}$ nC separadas $${d}$ mm, en un campo eléctrico uniforme de $${E0}$ kN/C. Su momento dipolar forma un ángulo de $${th}°$ con el campo. ${{ tau: "¿Cuánto vale el módulo del torque que le hace el campo (en μN·m)?", U: "¿Cuánto vale su energía potencial $U = -\\vec p\\cdot\\vec E$ (en μJ)?", W: `¿Cuánto trabajo hay que hacer para girarlo lentamente hasta que forme $${th2}°$ con el campo (en μJ)?` }[ask]}`,
        answer: ans,
        solution: [`[[f2a-campo-electrico|Momento dipolar]]: $p = qd = ${nf(q * 1e-9)}\\cdot${nf(d * 1e-3)} = ${nf(p)}$ C m, y $pE = ${nf(p * Ev)}$ J.`,
          { tau: `$\\tau = pE\\sin\\theta = ${nf(p * Ev)}\\cdot\\sin${th}° \\approx ${nf(ans)}$ μN·m. Tiende a alinear $\\vec p$ con $\\vec E$.`,
            U: `$U = -pE\\cos\\theta = -${nf(p * Ev)}\\cdot\\cos${th}° \\approx ${nf(ans)}$ μJ.`,
            W: `Girándolo lentamente, el trabajo externo es el aumento de energía: $W = U_2 - U_1 = pE(\\cos${th}° - \\cos${th2}°) \\approx ${nf(ans)}$ μJ${ans < 0 ? " (negativo: el campo lo hace girar solo, y hay que frenarlo)" : ""}.` }[ask]],
        // otro camino: las dos cargas por separado (torque de cada fuerza, energía qV con V = −Ex) y el trabajo como ∫τ dθ con Simpson
        verify: { kind: "value", tol: 1e-6, fn: () => {
          const Q = q * 1e-9, h = d * 1e-3 / 2;
          const torque = t => [[Q, 1], [-Q, -1]].reduce((s, [qq, sg]) => { const x = sg * h * Math.cos(t), y = sg * h * Math.sin(t); return s + (x * 0 - y * qq * Ev); }, 0);
          if (ask === "tau") return Math.abs(torque(t1)) * 1e6;
          if (ask === "U") return [[Q, 1], [-Q, -1]].reduce((s, [qq, sg]) => s + qq * (-Ev * sg * h * Math.cos(t1)), 0) * 1e6;
          return F.simpson(t => -torque(t), t1, t2, 400) * 1e6;
        } }
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
  T["f2a-anillo-num"].testN = 100;

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
        R`**Paso 3 (torque).** En un campo uniforme las fuerzas sobre $+q$ y $-q$ son $\pm q\vec E$: la neta es cero, pero forman un par. Su torque respecto del centro es $2\cdot\frac d2\,qE\sin\theta = pE\sin\theta$, que es el módulo de $\vec p\times\vec E$.`,
        R`**Paso 4 (energía).** Para girar el dipolo lentamente hay que hacer un torque igual y opuesto al del campo, y el trabajo externo es $\int pE\sin\theta\,d\theta$. Tomando $U = 0$ en $\theta = 90°$, queda $U(\theta) = \int_{90°}^{\theta} pE\sin\theta'\,d\theta' = -pE\cos\theta = -\vec p\cdot\vec E$: mínima cuando $\vec p$ apunta como $\vec E$. $\blacksquare$`],
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
        { id: "f2a-campo-l1", title: "Coulomb y el campo eléctrico", templates: ["f2a-coulomb-num", "f2a-campo-num", "f2a-cero-tf", "f2a-dipolo-num"], theory: ["f2a-carga", "f2a-coulomb", "f2a-campo-electrico"],
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
      // error típico: combinarlos como resistencias (en serie se suman, en paralelo, las inversas)
      const asR = cfg === "s-p" ? c[0] + c[1] * c[2] / (c[1] + c[2]) : (c[0] + c[1]) * c[2] / (c[0] + c[1] + c[2]);
      return {
        traps: ask === "Ceq" && Math.abs(asR - Ceq) > 0.02 * Ceq ? [{ value: asR, msg: "Los capacitores se combinan al revés que las resistencias: en paralelo se suman y en serie se suman las inversas." }] : [],
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
        traps: [{ value: Rs.slice(0, cfg === "c" ? 4 : 3).reduce((s, x) => s + x, 0), msg: "Sumaste todas como si estuvieran en serie: en paralelo se suman las inversas, y el equivalente queda menor que cada una." }],
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

/* =====================================================================
 *  UNIDAD 6 · CAMPO MAGNÉTICO Y FUERZAS MAGNÉTICAS
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, F = E.f2a, nf = F.nf;
  const T = {};
  const dec = v => String(v).replace(".", "{,}");
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const U = 1.6605e-27;
  // movimiento en un campo B uniforme según z (y opcionalmente E según y): estado [x, y, vx, vy]
  const lorentz = (qm, B, Ey = 0) => (_, s) => [s[2], s[3], qm * s[3] * B, qm * (Ey - s[2] * B)];

  T["f2a-ciclotron-num"] = {
    type: "numeric", concepts: ["f2a-lorentz"], difficulty: 3,
    generate(r) {
      const kind = r.pick(["r", "T", "espectro"]), B = r.int(1, 20) / 10;
      if (kind === "espectro") {
        const A = r.pick([12, 14, 16, 20, 23, 35, 39, 40]), dV = r.int(1, 20) * 100, m = A * U, v = Math.sqrt(2 * F.qe * dV / m), rad = m * v / (F.qe * B);
        return {
          prompt: `En un espectrómetro de masas, un ion con carga $+e$ y masa $${A}$ u se acelera desde el reposo con $${dV}$ V y entra perpendicular a un campo magnético de $${dec(B)}$ T. ¿Cuál es el radio de su trayectoria (en cm)? ($e = 1{,}602\\times10^{-19}$ C, $1\\ \\text{u} = 1{,}6605\\times10^{-27}$ kg)`,
          answer: rad * 100,
          solution: [`La energía que gana al acelerarse da su rapidez: $\\frac12mv^2 = e\\,\\Delta V$, así que $v = \\sqrt{\\frac{2e\\Delta V}{m}} \\approx ${nf(v)}$ m/s.`,
            `En el campo describe una circunferencia ([[f2a-movimiento-carga|movimiento de una carga en B]]) con $r = \\frac{mv}{eB} \\approx ${nf(rad)}$ m $\\approx ${nf(rad * 100)}$ cm. Iones más pesados describen círculos más grandes: así se separan.`],
          // otro camino: se integra la fuerza de Lorentz con RK4 hasta el cuarto de vuelta (vx = 0), donde |y| = r
          verify: { kind: "ode", f: lorentz(F.qe / m, B), y0: [0, 0, v, 0], t1: 0, until: (_, s) => s[2] <= 0, g: (_, s) => s[2], dt: 2 * Math.PI * m / (F.qe * B) / 8000, out: (_, s) => Math.abs(s[1]) * 100, tol: 1e-5 }
        };
      }
      const p = r.pick([{ n: "un protón", q: F.qe, m: F.mp, mt: R`m_p = 1{,}673\times10^{-27}` }, { n: "un electrón", q: -F.qe, m: F.me, mt: R`m_e = 9{,}109\times10^{-31}` }]), v = r.int(1, 50) * 1e5;
      const rad = p.m * v / (F.qe * B), Tp = 2 * Math.PI * p.m / (F.qe * B);
      return {
        prompt: `${p.n[0].toUpperCase() + p.n.slice(1)} entra con rapidez $${nf(v)}$ m/s perpendicular a un campo magnético uniforme de $${dec(B)}$ T. ${kind === "r" ? "¿Cuál es el radio de su trayectoria (en m)?" : "¿Cuánto tarda en dar una vuelta completa (en s)?"} ($e = 1{,}602\\times10^{-19}$ C, $${p.mt}$ kg)`,
        answer: kind === "r" ? rad : Tp,
        solution: [`La [[f2a-campo-magnetico|fuerza magnética]] es perpendicular a la velocidad: hace de fuerza centrípeta. $|q|vB = \\frac{mv^2}{r}$.`,
          kind === "r" ? `$r = \\frac{mv}{|q|B} \\approx ${nf(rad)}$ m.` : `$T = \\frac{2\\pi r}{v} = \\frac{2\\pi m}{|q|B} \\approx ${nf(Tp)}$ s, que no depende de la rapidez (la base del ciclotrón).`],
        // otro camino: RK4 de la fuerza de Lorentz hasta el cuarto de vuelta
        verify: { kind: "ode", f: lorentz(p.q / p.m, B), y0: [0, 0, v, 0], t1: 0, until: (_, s) => s[2] <= 0, g: (_, s) => s[2], dt: Tp / 8000, out: (t, s) => kind === "r" ? Math.abs(s[1]) : 4 * t, tol: 1e-5 }
      };
    }
  };

  T["f2a-selector-num"] = {
    type: "numeric", concepts: ["f2a-lorentz"], difficulty: 2,
    generate(r) {
      const Ek = r.int(1, 50), Bm = r.int(5, 200), ask = r.pick(["v", "E"]), v = Ek * 1e3 / (Bm * 1e-3);
      const vg = r.int(2, 30) * 1e5, Eneed = vg * Bm * 1e-3;
      const ans = ask === "v" ? v : Eneed / 1e3;
      return {
        prompt: ask === "v" ? `En un selector de velocidades hay un campo eléctrico de $${Ek}$ kV/m perpendicular a un campo magnético de $${Bm}$ mT, y los dos perpendiculares al haz. ¿Con qué rapidez (en m/s) tienen que entrar las partículas para pasar sin desviarse?`
          : `Se quiere armar un selector de velocidades con un campo magnético de $${Bm}$ mT para dejar pasar sin desviarse partículas de $${nf(vg)}$ m/s. ¿Qué campo eléctrico hace falta (en kV/m)?`,
        answer: ans,
        solution: [`En el [[f2a-movimiento-carga|selector de velocidades]], la fuerza eléctrica $qE$ y la magnética $qvB$ son opuestas. Pasan derecho las partículas para las que se equilibran: $qE = qvB$.`,
          ask === "v" ? `$v = \\frac EB = \\frac{${Ek}\\times10^3}{${Bm}\\times10^{-3}} \\approx ${nf(v)}$ m/s, sin importar la carga ni la masa.` : `$E = vB \\approx ${nf(Eneed)}$ V/m $\\approx ${nf(ans)}$ kV/m.`],
        // otro camino: se simula un protón con esa rapidez (o con ese campo) a lo largo de 10 cm y se mide su desvío
        verify: { kind: "zero", fn: x => {
          const qm = F.qe / F.mp, B = Bm * 1e-3, Ey = ask === "v" ? Ek * 1e3 : x * 1e3, v0 = ask === "v" ? x : vg, L = 0.1, f = lorentz(qm, B, Ey);
          let s = [0, 0, v0, 0]; const h = L / v0 / 2000;
          for (let i = 0; i < 2000; i++) { const k1 = f(0, s), k2 = f(0, s.map((u, j) => u + h / 2 * k1[j])), k3 = f(0, s.map((u, j) => u + h / 2 * k2[j])), k4 = f(0, s.map((u, j) => u + h * k3[j])); s = s.map((u, j) => u + h / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])); }
          return s[1] / L * 1e3;
        } }
      };
    }
  };

  T["f2a-fuerza-cable-num"] = {
    type: "numeric", concepts: ["f2a-fuerza-corriente"], difficulty: 2,
    generate(r) {
      const I = r.int(1, 20), B = r.int(1, 15) / 10;
      if (r.bool()) {
        const L = r.int(5, 100), th = r.pick([30, 45, 60, 90, 120, 150]), ans = I * L / 100 * B * Math.sin(th * Math.PI / 180);
        return {
          prompt: `Un tramo recto de cable de $${L}$ cm lleva una corriente de $${I}$ A y forma un ángulo de $${th}°$ con un campo magnético uniforme de $${dec(B)}$ T. ¿Cuál es el módulo de la fuerza magnética sobre el tramo (en N)?`,
          answer: ans,
          solution: [`[[f2a-fuerza-conductor|Fuerza sobre un conductor]]: $\\vec F = I\\vec L\\times\\vec B$, de módulo $ILB\\sin\\theta$.`, `$F = ${I}\\cdot${nf(L / 100)}\\cdot${dec(B)}\\cdot\\sin ${th}° \\approx ${nf(ans)}$ N.`],
          // otro camino: suma de los dF = I dl × B a lo largo del tramo (Simpson por componentes)
          verify: { kind: "value", tol: 1e-9, fn: () => { const t = th * Math.PI / 180, dl = [Math.cos(t), 0, Math.sin(t)], Bv = [B, 0, 0]; const c = cross(dl, Bv).map(cmp => F.simpson(() => I * cmp, 0, L / 100, 10)); return Math.hypot(...c); } }
        };
      }
      const Rc = r.int(2, 30), ans = 2 * I * Rc / 100 * B;
      return {
        prompt: `Un cable doblado en forma de semicircunferencia de radio $${Rc}$ cm lleva una corriente de $${I}$ A. Está en un plano perpendicular a un campo magnético uniforme de $${dec(B)}$ T. ¿Cuál es el módulo de la fuerza magnética total sobre la semicircunferencia (en N)?`,
        answer: ans,
        solution: [`Cada tramo $d\\vec l$ siente $dF = I\\,dl\\,B$, perpendicular a él ([[f2a-fuerza-conductor]]). Por simetría, las componentes paralelas al diámetro se cancelan.`,
          `Sumando, la fuerza es la misma que sobre el diámetro recto que une los extremos: $F = I(2R)B \\approx ${nf(ans)}$ N. (En un campo uniforme, solo importan los extremos del cable.)`],
        // otro camino: integración numérica de I dl × B sobre el arco
        verify: { kind: "value", tol: 1e-8, fn: () => { const Rm = Rc / 100, Bv = [0, 0, B]; const c = [0, 1, 2].map(j => F.simpson(p => I * cross([-Rm * Math.sin(p), Rm * Math.cos(p), 0], Bv)[j], 0, Math.PI, 400)); return Math.hypot(...c); } }
      };
    }
  };

  T["f2a-torque-num"] = {
    type: "numeric", concepts: ["f2a-fuerza-corriente"], difficulty: 3,
    generate(r) {
      const N = r.pick([1, 10, 20, 50, 100, 200]), a = r.int(2, 20), b = r.int(2, 20), I = r.int(1, 50) / 10, B = r.int(1, 10) / 10, ph = r.pick([0, 30, 45, 60, 90, 120, 150, 180]), ask = r.pick(["tau", "mu", "U"]);
      const A = a * b / 1e4, mu = N * I * A, tau = mu * B * Math.sin(ph * Math.PI / 180), Uu = -mu * B * Math.cos(ph * Math.PI / 180);
      const ans = { tau, mu, U: Uu }[ask];
      if (ask === "tau" && Math.abs(tau) < 1e-12) return null;
      return {
        prompt: `Una bobina rectangular de $${N}$ ${N === 1 ? "vuelta" : "vueltas"}, de $${a}$ cm × $${b}$ cm, lleva una corriente de $${dec(I)}$ A. Está en un campo magnético uniforme de $${dec(B)}$ T, y la normal a su plano forma un ángulo de $${ph}°$ con el campo. ${{ tau: "¿Cuál es el módulo del torque magnético sobre la bobina (en N m)?", mu: "¿Cuál es el módulo de su momento magnético (en A m²)?", U: "¿Cuánto vale su energía potencial magnética $U = -\\vec\\mu\\cdot\\vec B$ (en J)?" }[ask]}`,
        answer: ans,
        solution: [`[[f2a-torque-espira|Momento magnético]]: $\\mu = NIA = ${N}\\cdot${dec(I)}\\cdot${nf(A)} \\approx ${nf(mu)}$ A m².`,
          { tau: `$\\tau = \\mu B\\sin\\phi \\approx ${nf(tau)}$ N m: tiende a alinear $\\vec\\mu$ con $\\vec B$.`, mu: `Listo: $\\mu \\approx ${nf(mu)}$ A m².`, U: `$U = -\\mu B\\cos\\phi \\approx ${nf(Uu)}$ J (mínima con $\\vec\\mu$ alineado con $\\vec B$).` }[ask]],
        // otro camino: fuerzas I L × B sobre los cuatro lados y suma de r × F; U integrando el torque desde 90°
        verify: { kind: "value", tol: 1e-9, fn: () => {
          const tq = phd => {
            const p = phd * Math.PI / 180, u = [-Math.sin(p), 0, Math.cos(p)], y = [0, 1, 0], Bv = [B, 0, 0], am = a / 100, bm = b / 100;
            const P = [[-1, -1], [-1, 1], [1, 1], [1, -1]].map(([s1, s2]) => u.map((c, j) => s1 * bm / 2 * c + s2 * am / 2 * y[j]));
            let t = [0, 0, 0];
            for (let i = 0; i < 4; i++) { const p1 = P[i], p2 = P[(i + 1) % 4], L = p2.map((c, j) => c - p1[j]), mid = p1.map((c, j) => (c + p2[j]) / 2), Fv = cross(L, Bv).map(c => N * I * c), ti = cross(mid, Fv); t = t.map((c, j) => c + ti[j]); }
            return Math.hypot(...t);
          };
          if (ask === "tau") return tq(ph);
          if (ask === "mu") return tq(90) / B;
          // U(φ) − U(90°) = ∫ τ dφ' desde 90° (el torque se opone al giro que aleja μ de B)
          return F.simpson(p => tq(p), 90, ph, 400) * Math.PI / 180;
        } }
      };
    }
  };

  T["f2a-hall-num"] = {
    type: "numeric", concepts: ["f2a-fuerza-corriente"], difficulty: 3,
    generate(r) {
      const mat = r.pick([{ n: "cobre", nn: 8.5e28, t: R`8{,}5\times10^{28}` }, { n: "plata", nn: 5.9e28, t: R`5{,}9\times10^{28}` }, { n: "un semiconductor", nn: 1e22, t: R`10^{22}` }]);
      const semi = mat.nn < 1e25, I = r.int(1, 20) * (semi ? 1e-3 : 1), B = r.int(1, 20) / 10, tmm = r.pick([0.1, 0.2, 0.5, 1]), w = r.int(5, 30);
      const VH = I * B / (mat.nn * F.qe * tmm / 1000), sc = semi ? 1e3 : 1e6, un = semi ? "mV" : "μV", ans = VH * sc;
      return {
        prompt: `Una cinta de ${mat.n} ($n = ${mat.t}$ portadores/m³) de $${w}$ mm de ancho y $${dec(tmm)}$ mm de espesor lleva una corriente de $${semi ? Math.round(I * 1e3) : I}$ ${semi ? "mA" : "A"} a lo largo. Un campo magnético de $${dec(B)}$ T la atraviesa perpendicular a su cara ancha. ¿Cuál es la tensión de Hall entre sus bordes (en ${un})? ($e = 1{,}602\\times10^{-19}$ C)`,
        answer: ans,
        solution: [`[[f2a-hall|Efecto Hall]]: los portadores se desvían hacia un borde hasta que el campo eléctrico que forman equilibra la fuerza magnética, $eE_H = ev_dB$.`,
          `Con $v_d = \\frac{I}{neA}$ y $V_H = E_Hw$, el ancho se cancela: $V_H = \\frac{IB}{net} \\approx ${nf(VH)}$ V $\\approx ${nf(ans)}$ ${un}.`],
        // otro camino: con esa tensión, la fuerza eléctrica sobre un portador equilibra la magnética (v_d desde I = n e v_d w t)
        verify: { kind: "zero", fn: x => { const wm = w / 1000, tm = tmm / 1000, vd = I / (mat.nn * F.qe * wm * tm), EH = x / sc / wm; return (F.qe * EH - F.qe * vd * B) / (F.qe * vd * B); } }
      };
    }
  };

  T["f2a-mano-mc"] = {
    type: "mc", concepts: ["f2a-lorentz"], difficulty: 2,
    generate(r) {
      const ax = [[1, 0, 0], [0, 1, 0], [0, 0, 1]], nm = ["x", "y", "z"], i = r.int(0, 2), par = r.int(0, 5) === 0, j = par ? i : r.pick([0, 1, 2].filter(k => k !== i));
      const sv = r.pick([1, -1]), sb = r.pick([1, -1]), sq = r.pick([1, -1]);
      const v = ax[i].map(c => c * sv), B = ax[j].map(c => c * sb), Fv = cross(v, B).map(c => c * sq);
      const lab = (k, s) => `$${s > 0 ? "+" : "-"}\\hat{${nm[k]}}$`;
      const dirs = [0, 1, 2].flatMap(k => [lab(k, 1), lab(k, -1)]);
      const k = Fv.findIndex(c => c !== 0), correct = k < 0 ? "La fuerza es nula" : lab(k, Fv[k]);
      const wrong = r.shuffle([...dirs, "La fuerza es nula"].filter(o => o !== correct));
      return {
        prompt: `Una partícula con carga ${sq > 0 ? "positiva" : "negativa"} se mueve en la dirección ${lab(i, sv)} dentro de un campo magnético en la dirección ${lab(j, sb)}. ¿Hacia dónde apunta la fuerza magnética sobre ella?`,
        ...H.mc(r, correct, [k < 0 ? null : lab(k, -Fv[k]), ...wrong], { text: true }),
        solution: [`[[f2a-campo-magnetico|Fuerza de Lorentz]]: $\\vec F = q\\vec v\\times\\vec B$.`,
          par ? `La velocidad es paralela (o antiparalela) al campo: el producto vectorial es cero.` : `$(${lab(i, sv).slice(1, -1)})\\times(${lab(j, sb).slice(1, -1)}) = ${lab(k, Fv[k] * sq).slice(1, -1)}$ (regla de la mano derecha${sq < 0 ? `), y como la carga es negativa, se invierte: ${correct}` : `): ${correct}`}.`],
        // verificación: producto vectorial por componentes y comparación con la opción marcada como correcta
        verify: { kind: "truth", target: true, fn: () => { const f = [v[1] * B[2] - v[2] * B[1], v[2] * B[0] - v[0] * B[2], v[0] * B[1] - v[1] * B[0]].map(c => sq * c), n = Math.hypot(...f); if (!n) return correct === "La fuerza es nula"; const kk = f.findIndex(c => Math.abs(c) > 0.5); return correct === lab(kk, f[kk]); } }
      };
    }
  };

  const cards = {
    "f2a-campo-magnetico": {
      title: "Campo magnético y fuerza de Lorentz", aliases: ["campo magnético", "fuerza de Lorentz", "fuerza magnética", "tesla", "líneas de campo magnético"], concepts: ["f2a-lorentz"],
      summary: "Una carga que se mueve en un campo magnético siente F⃗ = qv⃗ × B⃗: perpendicular a la velocidad y al campo, de módulo |q|vB sen θ. No hace trabajo. B se mide en teslas.",
      def: [R`**Fuerza magnética** sobre una carga $q$ con velocidad $\vec v$: $\vec F = q\vec v\times\vec B$, de módulo $|q|vB\sin\theta$. Es nula si la carga está quieta o se mueve paralela al campo. Con campo eléctrico, la **fuerza de Lorentz** total es $\vec F = q(\vec E + \vec v\times\vec B)$.`,
        R`**Unidad:** el tesla, $1$ T $= 1$ N/(A m). El campo terrestre es de unos $5\times10^{-5}$ T, y un imán de heladera, de unos $5$ mT.`,
        R`**Líneas de campo magnético:** son cerradas (salen del polo norte de un imán y entran por el sur). No hay cargas magnéticas aisladas, así que el flujo de $\vec B$ por cualquier superficie cerrada es cero.`],
      idea: [R`Como la fuerza es siempre perpendicular a la velocidad, puede doblar la trayectoria pero no acelerar ni frenar la partícula: no cambia su energía cinética.`],
      demo: [R`**Paso 1 (no hace trabajo).** La potencia de una fuerza es $\vec F\cdot\vec v$. Acá $\vec F = q\vec v\times\vec B$ es perpendicular a $\vec v$ por ser un [[al-producto-vectorial|producto vectorial]], así que $\vec F\cdot\vec v = 0$.`,
        R`**Paso 2.** Con potencia nula en todo instante, la energía cinética no cambia (teorema del trabajo y la energía): el módulo de la velocidad es constante. $\blacksquare$`],
      examples: [{ q: R`Un protón a $10^6$ m/s, perpendicular a $0{,}5$ T.`, steps: [R`$F = 1{,}602\times10^{-19}\cdot10^6\cdot0{,}5 \approx 8\times10^{-14}$ N.`] }],
      tips: [R`Regla de la mano derecha: los dedos en $\vec v$, se doblan hacia $\vec B$, y el pulgar da $\vec v\times\vec B$. Si la carga es negativa, la fuerza va al revés.`],
      see: ["f2a-movimiento-carga", "f2a-fuerza-conductor", "al-producto-vectorial"]
    },
    "f2a-movimiento-carga": {
      title: "Cargas en movimiento en un campo magnético", aliases: ["radio de giro", "frecuencia de ciclotrón", "ciclotrón", "selector de velocidades", "espectrómetro de masas"], concepts: ["f2a-lorentz"],
      summary: "En un B uniforme, una carga con v perpendicular describe una circunferencia de radio r = mv/(|q|B) y período T = 2πm/(|q|B), independiente de v. Un selector deja pasar v = E/B.",
      def: [R`**Movimiento circular:** con $\vec v\perp\vec B$ uniforme, $r = \frac{mv}{|q|B}$, $\omega = \frac{|q|B}{m}$ (frecuencia de ciclotrón) y $T = \frac{2\pi m}{|q|B}$. Si $\vec v$ tiene una componente paralela a $\vec B$, la trayectoria es una hélice.`,
        R`**Selector de velocidades:** $\vec E$ y $\vec B$ perpendiculares entre sí y al haz; pasan sin desviarse las partículas con $v = \frac EB$.`,
        R`**Espectrómetro de masas:** iones acelerados con una tensión $\Delta V$ entran en un campo $B$: $r = \frac1B\sqrt{\frac{2m\Delta V}{q}}$, así que cada masa cae en un lugar distinto.`],
      idea: [R`Una partícula más rápida describe un círculo más grande, pero tarda lo mismo en recorrerlo: el período no depende de la rapidez. Por eso en un ciclotrón se puede acelerar con una tensión alterna de frecuencia fija.`],
      demo: [R`**Paso 1.** La [[f2a-campo-magnetico|fuerza magnética]] tiene módulo constante $|q|vB$ (porque $v$ no cambia) y siempre es perpendicular a la velocidad, en el plano perpendicular a $\vec B$: es una fuerza centrípeta, y el movimiento es [[f1-circular|circular uniforme]].`,
        R`**Paso 2.** Igualando con la segunda ley de Newton: $|q|vB = \frac{mv^2}{r}$, de donde $r = \frac{mv}{|q|B}$.`,
        R`**Paso 3.** El período es $T = \frac{2\pi r}{v} = \frac{2\pi m}{|q|B}$: la $v$ se cancela.`,
        R`**Paso 4 (selector).** La fuerza total es $q(\vec E + \vec v\times\vec B)$. Con los campos orientados para que las dos se opongan, es nula si $qE = qvB$, es decir, $v = \frac EB$. $\blacksquare$`],
      examples: [{ q: R`Un electrón a $2\times10^6$ m/s en $1$ mT.`, steps: [R`$r = \frac{9{,}109\times10^{-31}\cdot2\times10^6}{1{,}602\times10^{-19}\cdot10^{-3}} \approx 1{,}14$ cm.`] }],
      tips: [R`El sentido de giro depende del signo de la carga: protones y electrones en el mismo campo giran al revés.`],
      see: ["f2a-campo-magnetico", "f1-circular", "f2a-energia-potencial"]
    },
    "f2a-fuerza-conductor": {
      title: "Fuerza sobre un conductor con corriente", aliases: ["fuerza sobre un conductor", "fuerza sobre un cable"], concepts: ["f2a-fuerza-corriente"],
      summary: "Un tramo recto de cable con corriente I en un B uniforme siente F⃗ = IL⃗ × B⃗. Para un cable cualquiera, dF⃗ = I dl⃗ × B⃗; en un campo uniforme solo importa el segmento que une sus extremos.",
      def: [R`**Tramo recto:** $\vec F = I\vec L\times\vec B$, con $\vec L$ en el sentido de la corriente; de módulo $ILB\sin\theta$.`,
        R`**Cable cualquiera:** $\vec F = I\int d\vec l\times\vec B$. Si $\vec B$ es uniforme, sale de la integral y $\int d\vec l$ es el vector que va de un extremo al otro: un cable curvo siente lo mismo que el recto que une sus extremos. Una espira cerrada, en un campo uniforme, tiene fuerza neta cero.`],
      idea: [R`La corriente son cargas en movimiento, y cada una siente $q\vec v_d\times\vec B$. La fuerza sobre el cable es la suma de esas fuerzas, que los electrones le transmiten a la red.`],
      demo: [R`**Paso 1.** En un tramo $dl$ de sección $A$ hay $nA\,dl$ portadores, cada uno con fuerza $q\vec v_d\times\vec B$.`,
        R`**Paso 2.** La fuerza total sobre el tramo es $nA\,dl\,q\vec v_d\times\vec B$. Como $I = nqv_dA$ ([[f2a-corriente|corriente]]) y $\vec v_d$ apunta como la corriente, $nqA\,dl\,\vec v_d = I\,d\vec l$.`,
        R`**Paso 3.** Queda $d\vec F = I\,d\vec l\times\vec B$, y para un tramo recto en un campo uniforme, $\vec F = I\vec L\times\vec B$. $\blacksquare$`],
      examples: [{ q: R`$50$ cm de cable con $10$ A, perpendicular a $0{,}2$ T.`, steps: [R`$F = 10\cdot0{,}5\cdot0{,}2 = 1$ N.`] }],
      tips: [R`Es la base de los parlantes y de los motores: una bobina con corriente en el campo de un imán.`],
      see: ["f2a-campo-magnetico", "f2a-torque-espira", "f2a-corriente"]
    },
    "f2a-torque-espira": {
      title: "Torque sobre una espira y momento magnético", aliases: ["momento magnético", "torque sobre una espira", "motor eléctrico", "dipolo magnético"], concepts: ["f2a-fuerza-corriente"],
      summary: "Una espira de área A con corriente I tiene momento magnético μ = NIA (normal a su plano). En un campo uniforme siente τ⃗ = μ⃗ × B⃗ y tiene energía U = −μ⃗·B⃗.",
      def: [R`**Momento magnético** de una bobina plana de $N$ vueltas: $\vec\mu = NIA\,\hat n$, con $\hat n$ normal al plano según la regla de la mano derecha con la corriente.`,
        R`**En un campo uniforme:** fuerza neta nula, torque $\vec\tau = \vec\mu\times\vec B$ (módulo $\mu B\sin\phi$) y energía potencial $U = -\vec\mu\cdot\vec B = -\mu B\cos\phi$. El equilibrio estable es con $\vec\mu$ alineado con $\vec B$.`],
      idea: [R`La espira se comporta como una brújula: tiende a girar hasta que su momento magnético apunte como el campo. Un motor de corriente continua invierte la corriente cada media vuelta para que nunca llegue al equilibrio y siga girando.`],
      demo: [R`**Paso 1.** Espira rectangular de lados $a$ (paralelos al eje de giro) y $b$, con $\vec B$ perpendicular al eje y $\phi$ el ángulo entre $\hat n$ y $\vec B$. Sobre los lados $b$ las [[f2a-fuerza-conductor|fuerzas]] son iguales y opuestas sobre la misma recta: no hacen torque.`,
        R`**Paso 2.** Sobre los lados $a$ las fuerzas valen $IaB$, opuestas, y forman un par. Su brazo, medido perpendicular a $\vec B$, es $b\sin\phi$.`,
        R`**Paso 3.** El torque es $IaB\cdot b\sin\phi = IAB\sin\phi$, y con $N$ vueltas, $NIAB\sin\phi = \mu B\sin\phi$, que es el módulo de $\vec\mu\times\vec B$.`,
        R`**Paso 4 (energía).** El trabajo para girarla desde $90°$ hasta $\phi$ contra el torque es $\int_{90°}^{\phi}\mu B\sin\phi'\,d\phi' = -\mu B\cos\phi$. Con $U(90°) = 0$, $U = -\vec\mu\cdot\vec B$. $\blacksquare$`],
      examples: [{ q: R`Bobina de $100$ vueltas de $5\times4$ cm con $2$ A, en $0{,}5$ T a $90°$.`, steps: [R`$\mu = 100\cdot2\cdot0{,}002 = 0{,}4$ A m² y $\tau = 0{,}2$ N m.`] }],
      tips: [R`Es la misma estructura que el [[f2a-campo-electrico|dipolo eléctrico]]: $\vec\tau = \vec p\times\vec E$ y $U = -\vec p\cdot\vec E$.`],
      see: ["f2a-fuerza-conductor", "f2a-campo-electrico", "f1-torque"]
    },
    "f2a-hall": {
      title: "Efecto Hall", aliases: ["efecto Hall", "tensión de Hall"], concepts: ["f2a-fuerza-corriente"],
      summary: "En una cinta con corriente dentro de un campo B, los portadores se desvían hacia un borde y aparece una tensión V_H = IB/(nqt). Su signo dice el de los portadores, y su valor, cuántos hay.",
      def: [R`**Efecto Hall:** en un conductor con corriente $I$ perpendicular a $\vec B$, aparece una diferencia de potencial transversal $V_H = \frac{IB}{nqt}$, donde $t$ es el espesor en la dirección de $\vec B$ y $n$ la densidad de portadores.`,
        R`Sirve para medir campos magnéticos (sondas Hall) y para averiguar el signo y la densidad de los portadores de un material.`],
      idea: [R`La fuerza magnética empuja los portadores hacia un costado; ahí se acumulan y crean un campo eléctrico que empuja al revés. Se llega al equilibrio cuando las dos fuerzas se compensan, como en un [[f2a-movimiento-carga|selector de velocidades]].`],
      demo: [R`**Paso 1.** En el equilibrio, la fuerza eléctrica transversal compensa la magnética: $qE_H = qv_dB$, así que $E_H = v_dB$.`,
        R`**Paso 2.** El campo es uniforme a lo ancho $w$ de la cinta: $V_H = E_Hw = v_dBw$.`,
        R`**Paso 3.** Por la [[f2a-corriente|corriente]], $v_d = \frac{I}{nq\,wt}$. Reemplazando, el ancho se cancela: $V_H = \frac{IB}{nqt}$. $\blacksquare$`],
      examples: [{ q: R`Cinta de cobre de $0{,}1$ mm de espesor, $10$ A y $1$ T.`, steps: [R`$V_H = \frac{10\cdot1}{8{,}5\times10^{28}\cdot1{,}602\times10^{-19}\cdot10^{-4}} \approx 7{,}3$ μV.`] }],
      tips: [R`En los metales la tensión de Hall es diminuta porque $n$ es enorme; en los semiconductores es mucho mayor, y por eso las sondas se hacen con ellos.`],
      see: ["f2a-fuerza-conductor", "f2a-movimiento-carga", "f2a-corriente"]
    }
  };

  E.extendCourse("f102a", {
    concepts: { "f2a-lorentz": { name: "Fuerza magnética sobre cargas" }, "f2a-fuerza-corriente": { name: "Fuerzas sobre corrientes" } },
    templates: T,
    units: [{
      id: "f2a-magnetico-u", order: 6, program: "Unidad 6", title: "Campo magnético", icon: "target",
      diagnostic: ["f2a-ciclotron-num", "f2a-fuerza-cable-num", "f2a-torque-num"],
      lessons: [
        { id: "f2a-magnetico-l1", title: "Cargas en un campo magnético", templates: ["f2a-mano-mc", "f2a-ciclotron-num", "f2a-selector-num"], theory: ["f2a-campo-magnetico", "f2a-movimiento-carga"],
          intro: R`$\vec F = q\vec v\times\vec B$: dobla la trayectoria sin cambiar la rapidez.` },
        { id: "f2a-magnetico-l2", title: "Corrientes en un campo magnético", templates: ["f2a-fuerza-cable-num", "f2a-torque-num", "f2a-hall-num"], theory: ["f2a-fuerza-conductor", "f2a-torque-espira", "f2a-hall"],
          intro: R`$\vec F = I\vec L\times\vec B$ y $\vec\tau = \vec\mu\times\vec B$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 7 · FUENTES DE CAMPO MAGNÉTICO
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, F = E.f2a, nf = F.nf;
  const T = {};
  const dec = v => String(v).replace(".", "{,}");
  const MU = R`\mu_0 = 4\pi\times10^{-7}\ \text{T m/A}`;
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  // Biot-Savart numérico para una curva p(t), t ∈ [a, b]: B en el punto P (vector)
  const biot = (I, p, dp, a, b, P, n = 400) => [0, 1, 2].map(j => F.simpson(t => { const q = p(t), rr = P.map((c, i) => c - q[i]), d = Math.hypot(...rr); return F.mu0 * I / (4 * Math.PI) * cross(dp(t), rr)[j] / d ** 3; }, a, b, n));
  // hilo recto infinito sobre el eje z, por x = d·tan u (sin truncar)
  const wireB = (I, d) => F.simpson(u => F.mu0 * I / (4 * Math.PI) * Math.cos(u) / d, -Math.PI / 2, Math.PI / 2, 400);

  T["f2a-hilo-num"] = {
    type: "numeric", concepts: ["f2a-biot"], difficulty: 3,
    generate(r) {
      const I = r.int(1, 30), d = r.int(1, 20), inf = r.bool(), L = r.int(2, 40) * 2;
      const dm = d / 100, Lm = L / 100, ans = (inf ? F.mu0 * I / (2 * Math.PI * dm) : F.mu0 * I / (4 * Math.PI * dm) * 2 * (Lm / 2) / Math.hypot(Lm / 2, dm)) * 1e6;
      return {
        prompt: inf ? `Un cable recto muy largo lleva una corriente de $${I}$ A. ¿Cuánto vale el campo magnético a $${d}$ cm del cable (en μT)? ($${MU}$)`
          : `Un tramo recto de cable de $${L}$ cm lleva una corriente de $${I}$ A. ¿Cuánto vale el campo magnético que produce en un punto de su mediatriz a $${d}$ cm del tramo (en μT)? ($${MU}$; ignorá el resto del circuito)`,
        answer: ans,
        solution: [`[[f2a-biot-savart|Biot-Savart]]: cada tramo aporta $dB = \\frac{\\mu_0I}{4\\pi}\\frac{dl\\sin\\theta}{r^2}$, todos en el mismo sentido (alrededor del cable).`,
          inf ? `Integrando a lo largo de todo el cable, $B = \\frac{\\mu_0I}{2\\pi d} \\approx ${nf(ans)}$ μT.` : `Integrando entre los extremos, $B = \\frac{\\mu_0I}{4\\pi d}(\\sin\\theta_2 - \\sin\\theta_1)$ con $\\sin\\theta_2 = -\\sin\\theta_1 = \\frac{L/2}{\\sqrt{(L/2)^2 + d^2}}$: $B \\approx ${nf(ans)}$ μT.`],
        // otro camino: Biot-Savart vectorial numérico (para el infinito, con x = d·tan u)
        verify: { kind: "value", tol: 1e-7, fn: () => (inf ? wireB(I, dm) : Math.hypot(...biot(I, t => [0, 0, t], () => [0, 0, 1], -Lm / 2, Lm / 2, [dm, 0, 0], 2000))) * 1e6 }
      };
    }
  };

  T["f2a-espira-num"] = {
    type: "numeric", concepts: ["f2a-biot"], difficulty: 3,
    generate(r) {
      const I = r.int(1, 20), Rc = r.int(2, 20), N = r.pick([1, 1, 5, 10, 50, 100]), kind = r.pick(["centro", "eje", "arco"]), x = r.int(1, 30), th = r.pick([60, 90, 120, 180, 270]);
      const Rm = Rc / 100, xm = x / 100, t = th * Math.PI / 180;
      const B = { centro: F.mu0 * N * I / (2 * Rm), eje: F.mu0 * N * I * Rm * Rm / (2 * (Rm * Rm + xm * xm) ** 1.5), arco: F.mu0 * I * t / (4 * Math.PI * Rm) }[kind], ans = B * 1e6;
      const coil = N === 1 ? "Una espira circular" : `Una bobina plana de $${N}$ vueltas`;
      return {
        prompt: kind === "arco" ? `Un cable forma un arco de circunferencia de $${th}°$ y radio $${Rc}$ cm, por el que circulan $${I}$ A; los tramos que llegan y salen del arco son radiales. ¿Cuánto vale el campo magnético en el centro del arco (en μT)? ($${MU}$)`
          : `${coil} de radio $${Rc}$ cm lleva una corriente de $${I}$ A. ¿Cuánto vale el campo magnético ${kind === "centro" ? "en su centro" : `sobre su eje, a $${x}$ cm del centro`} (en μT)? ($${MU}$)`,
        answer: ans,
        solution: [`[[f2a-biot-savart|Biot-Savart]]: en el centro todos los elementos están a la distancia $R$ y perpendiculares al radio, así que $dB = \\frac{\\mu_0I}{4\\pi}\\frac{dl}{R^2}$${kind === "eje" ? "; sobre el eje, las componentes perpendiculares se cancelan y queda la axial" : ""}.`,
          { centro: `Sumando toda la circunferencia ($2\\pi R$) y las $N$ vueltas: $B = \\frac{\\mu_0NI}{2R} \\approx ${nf(ans)}$ μT.`, eje: `$B = \\frac{\\mu_0NIR^2}{2(R^2 + x^2)^{3/2}} \\approx ${nf(ans)}$ μT.`, arco: `Los tramos radiales no aportan (en ellos $d\\vec l$ es paralelo a $\\vec r$). El arco tiene largo $R\\theta$: $B = \\frac{\\mu_0I\\theta}{4\\pi R} \\approx ${nf(ans)}$ μT.` }[kind]],
        // otro camino: Biot-Savart vectorial numérico sobre la curva
        verify: { kind: "value", tol: 1e-7, fn: () => {
          const P = kind === "eje" ? [0, 0, xm] : [0, 0, 0], tmax = kind === "arco" ? t : 2 * Math.PI;
          const Bv = biot(I, s => [Rm * Math.cos(s), Rm * Math.sin(s), 0], s => [-Rm * Math.sin(s), Rm * Math.cos(s), 0], 0, tmax, P, 800);
          return Math.hypot(...Bv) * (kind === "arco" ? 1 : N) * 1e6;
        } }
      };
    }
  };

  T["f2a-carga-movil-num"] = {
    type: "numeric", concepts: ["f2a-biot"], difficulty: 2,
    generate(r) {
      const part = r.pick([{ n: "Un protón", q: F.qe }, { n: "Un electrón", q: -F.qe }, { n: "Una partícula alfa (de carga $2e$)", q: 2 * F.qe }]);
      const v = r.int(1, 99) / 10, d = r.int(1, 50) / 10, th = r.pick([30, 45, 60, 90, 120, 150]);
      const vm = v * 1e6, dm = d * 1e-9, B = F.mu0 / (4 * Math.PI) * Math.abs(part.q) * vm * Math.sin(th * Math.PI / 180) / (dm * dm), ans = B * 1e3;
      return {
        prompt: `${part.n} pasa con una rapidez de $${dec(v)}\\times10^6$ m/s. En ese instante, ¿cuánto vale el campo magnético que produce en un punto a $${dec(d)}$ nm de la partícula, sobre una recta que forma $${th}°$ con su velocidad (en mT)? ($${MU}$, $e = 1{,}602\\times10^{-19}$ C)`,
        answer: ans,
        solution: [`[[f2a-biot-savart|Campo de una carga en movimiento]]: es Biot-Savart con $q\\vec v$ en lugar de $I\\,d\\vec l$, $B = \\frac{\\mu_0}{4\\pi}\\frac{|q|v\\sin\\theta}{r^2}$.`,
          `$B = 10^{-7}\\cdot\\frac{${nf(Math.abs(part.q))}\\cdot${nf(vm)}\\cdot\\sin${th}°}{(${nf(dm)})^2} \\approx ${nf(B)}$ T $\\approx ${nf(ans)}$ mT, perpendicular al plano de $\\vec v$ y $\\vec r$.`],
        // otro camino: B⃗ = v⃗ × E⃗ / c², con el campo de Coulomb de la carga y c² = 1/(μ₀ε₀)
        verify: { kind: "value", tol: 1e-9, fn: () => {
          const t = th * Math.PI / 180, rh = [Math.cos(t), Math.sin(t), 0], Ec = F.k * part.q / (dm * dm), Ev = rh.map(c => Ec * c);
          return Math.hypot(...cross([vm, 0, 0], Ev)) * F.mu0 * F.e0 * 1e3;
        } }
      };
    }
  };

  T["f2a-paralelos-num"] = {
    type: "numeric", concepts: ["f2a-ampere"], difficulty: 3,
    generate(r) {
      const I1 = r.int(1, 30), I2 = r.int(1, 30), same = r.bool(), d = r.int(2, 30), ask = r.pick(["F", "Bmid", "Bout"]), dm = d / 100, x = r.int(1, 10);
      const s2 = same ? 1 : -1;
      // campo según +y en puntos del eje x; cable 1 en x = 0 y cable 2 en x = d, corrientes según ±z
      const By = X => F.mu0 / (2 * Math.PI) * (I1 / X + s2 * I2 / (X - dm));
      const ans = { F: F.mu0 * I1 * I2 / (2 * Math.PI * dm) * 1e6, Bmid: Math.abs(By(dm / 2)) * 1e6, Bout: Math.abs(By(dm + x / 100)) * 1e6 }[ask];
      if (ans < 1e-6) return null;
      return {
        prompt: `Dos cables rectos, largos y paralelos, separados $${d}$ cm, llevan corrientes de $${I1}$ A y $${I2}$ A en ${same ? "el mismo sentido" : "sentidos opuestos"}. ${{ F: "¿Cuál es el módulo de la fuerza por unidad de largo entre ellos (en μN/m)?", Bmid: "¿Cuánto vale el campo magnético en el punto medio entre ellos (en μT)?", Bout: `¿Cuánto vale el campo magnético en un punto del plano de los cables, del lado del segundo, a $${x}$ cm de él (en μT)?` }[ask]} ($${MU}$)`,
        answer: ans,
        solution: [`Cada cable produce $B = \\frac{\\mu_0I}{2\\pi r}$ ([[f2a-biot-savart|hilo infinito]]), en círculos a su alrededor.`,
          ask === "F" ? `[[f2a-fuerza-paralelos|Fuerza entre cables]]: $\\frac FL = \\frac{\\mu_0I_1I_2}{2\\pi d} \\approx ${nf(ans)}$ μN/m; ${same ? "se atraen (corrientes en el mismo sentido)" : "se repelen (sentidos opuestos)"}.`
            : ask === "Bmid" ? `En el punto medio los campos de los dos valen $\\frac{\\mu_0I_i}{2\\pi(d/2)}$ y ${same ? "tienen sentidos opuestos: se restan" : "tienen el mismo sentido: se suman"}. $B \\approx ${nf(ans)}$ μT.`
              : `Afuera, a $${x}$ cm del segundo y $${d + x}$ cm del primero, los campos ${same ? "tienen el mismo sentido y se suman" : "tienen sentidos opuestos y se restan"}: $B \\approx ${nf(ans)}$ μT.`],
        // otro camino: Biot-Savart numérico de cada cable (con x = d·tan u) y fuerza como I₂·L·B₁
        verify: { kind: "value", tol: 1e-7, fn: () => {
          if (ask === "F") return I2 * wireB(I1, dm) * 1e6;
          const X = ask === "Bmid" ? dm / 2 : dm + x / 100, b1 = wireB(I1, X), b2 = wireB(I2, Math.abs(X - dm)) * Math.sign(X - dm) * s2;
          return Math.abs(b1 + b2) * 1e6;
        } }
      };
    }
  };

  T["f2a-solenoide-num"] = {
    type: "numeric", concepts: ["f2a-ampere"], difficulty: 3,
    generate(r) {
      const I = r.int(1, 50) / 10, tor = r.bool(), N = r.int(tor ? 10 : 1, 20) * 50;
      if (tor) {
        const Rt = r.int(10, 30), a = r.pick([1, 1.5, 2]), ans = F.mu0 * N * I / (2 * Math.PI * Rt / 100) * 1e3;
        return {
          prompt: `Un toroide tiene $${N}$ vueltas de alambre, radio medio $${Rt}$ cm y una sección circular de $${dec(a)}$ cm de radio. Por el alambre circulan $${dec(I)}$ A. ¿Cuánto vale el campo magnético en el centro de su sección, a $${Rt}$ cm del eje (en mT)? ($${MU}$)`,
          answer: ans,
          solution: [`[[f2a-ampere|Ley de Ampère]] con una circunferencia de radio $r$ dentro del toroide: $B\\cdot2\\pi r = \\mu_0NI$, porque la atraviesan las $N$ vueltas.`, `$B = \\frac{\\mu_0NI}{2\\pi r} \\approx ${nf(ans)}$ mT. Afuera del toroide el campo es nulo.`],
          // otro camino: suma de Biot-Savart de las N espiras, una por una
          verify: { kind: "value", tol: 1e-3, fn: () => {
            const R0 = Rt / 100, am = a / 100, P = [R0, 0, 0], Bt = [0, 0, 0], M = 120;
            for (let k = 0; k < N; k++) {
              const ph = 2 * Math.PI * (k + 0.5) / N, c = [R0 * Math.cos(ph), R0 * Math.sin(ph), 0], e1 = [Math.cos(ph), Math.sin(ph), 0], e2 = [0, 0, 1];
              for (let m = 0; m < M; m++) {
                const s = 2 * Math.PI * (m + 0.5) / M, q = c.map((v, i) => v + am * (Math.cos(s) * e1[i] + Math.sin(s) * e2[i])), dl = e1.map((v, i) => am * 2 * Math.PI / M * (-Math.sin(s) * v + Math.cos(s) * e2[i])), rr = P.map((v, i) => v - q[i]), d = Math.hypot(...rr), cr = cross(dl, rr);
                for (let i = 0; i < 3; i++) Bt[i] += F.mu0 * I / (4 * Math.PI) * cr[i] / d ** 3;
              }
            }
            return Math.hypot(...Bt) * 1e3;
          } }
        };
      }
      const L = r.int(10, 100), ans = F.mu0 * N / (L / 100) * I * 1e3;
      return {
        prompt: `Un solenoide largo de $${L}$ cm tiene $${N}$ vueltas y lleva una corriente de $${dec(I)}$ A. ¿Cuánto vale el campo magnético en su interior, lejos de los extremos (en mT)? ($${MU}$)`,
        answer: ans,
        solution: [`[[f2a-ampere|Ley de Ampère]] con un rectángulo que tiene un lado de largo $\\ell$ adentro y otro afuera: solo aporta el de adentro, $B\\ell = \\mu_0(n\\ell)I$.`, `Con $n = \\frac NL = ${nf(N / (L / 100))}$ vueltas/m: $B = \\mu_0nI \\approx ${nf(ans)}$ mT.`],
        // otro camino: suma de los campos axiales de las espiras (solenoide infinito, con z = R·tan u)
        verify: { kind: "value", tol: 1e-7, fn: () => { const n = N / (L / 100), Rs = 0.02; return F.simpson(u => { const z = Rs * Math.tan(u), dz = Rs / Math.cos(u) ** 2; return n * F.mu0 * I * Rs * Rs / (2 * (Rs * Rs + z * z) ** 1.5) * dz; }, -Math.PI / 2 * (1 - 1e-9), Math.PI / 2 * (1 - 1e-9), 400) * 1e3; } }
      };
    }
  };
  T["f2a-solenoide-num"].testN = 60;

  T["f2a-cable-grueso-tf"] = {
    type: "tf", concepts: ["f2a-ampere"], difficulty: 2,
    generate(r) {
      const f = r.pick([2, 3, 4]), inside = r.bool(), claim = r.pick(inside ? [1 / f, f, 1 / (f * f)] : [1 / f, 1 / (f * f), f]);
      const real = 1 / f; // adentro a R/f: B = B(R)/f; afuera a f·R: B = B(R)/f
      const say = c => c >= 1 ? `$${c}$ veces el` : `$\\frac1{${Math.round(1 / c)}}$ del`;
      return {
        prompt: `<b>Verdadero o falso:</b> un cable recto y largo de radio $R$ lleva una corriente repartida uniformemente en su sección. ${inside ? `A una distancia $\\frac R${f}$ del eje (adentro)` : `A una distancia $${f}R$ del eje (afuera)`}, el campo magnético vale ${say(claim)} valor en la superficie.`,
        answer: Math.abs(claim - real) < 1e-12,
        explanation: inside ? `Adentro, la [[f2a-ampere|ley de Ampère]] encierra solo la fracción $\\frac{r^2}{R^2}$ de la corriente: $B = \\frac{\\mu_0Ir}{2\\pi R^2}$, que crece linealmente. A $\\frac R${f}$ vale $\\frac1${f}$ del de la superficie. Es ${Math.abs(claim - real) < 1e-12 ? "verdadero" : "falso"}.`
          : `Afuera, $B = \\frac{\\mu_0I}{2\\pi r}$, que cae como $\\frac1r$: a $${f}R$ vale $\\frac1${f}$ del de la superficie. Es ${Math.abs(claim - real) < 1e-12 ? "verdadero" : "falso"}.`,
        solution: [R`Ver [[f2a-ampere|ley de Ampère]]: adentro crece como $r$, afuera cae como $\frac1r$.`],
        // otro camino: se suma el campo de muchos hilos finos que forman la sección (grilla polar, punto medio)
        verify: { kind: "truth", fn: () => {
          const Bat = rr => { let b = 0; const ns = 120, np = 240, Rr = 1; for (let i = 0; i < ns; i++) { const s = (i + 0.5) * Rr / ns; for (let j = 0; j < np; j++) { const p = 2 * Math.PI * (j + 0.5) / np, dx = rr - s * Math.cos(p), dy = -s * Math.sin(p), d2 = dx * dx + dy * dy, dI = s / ns * 2 * Math.PI / np / Math.PI; b += dI * dx / d2; } } return b / (2 * Math.PI); };
          const ratio = Bat(inside ? 1 / f : f) / Bat(1);
          return Math.abs(ratio - claim) < 0.05 * claim;
        } }
      };
    }
  };
  T["f2a-cable-grueso-tf"].testN = 40;

  const cards = {
    "f2a-biot-savart": {
      title: "Ley de Biot-Savart", aliases: ["ley de Biot-Savart", "Biot-Savart", "campo de un hilo recto", "espira circular", "campo de una carga en movimiento"], concepts: ["f2a-biot"],
      summary: "dB⃗ = (μ₀/4π) I dl⃗ × r̂ / r². Hilo infinito: B = μ₀I/(2πd), en círculos. Espira en su centro: μ₀I/(2R); sobre el eje: μ₀IR²/[2(R² + x²)^(3/2)].",
      def: [R`**Biot-Savart:** un tramo $d\vec l$ con corriente $I$ produce, en un punto a distancia $r$, $d\vec B = \frac{\mu_0}{4\pi}\frac{I\,d\vec l\times\hat r}{r^2}$, con $\mu_0 = 4\pi\times10^{-7}$ T m/A la permeabilidad del vacío. El campo total es la suma (integral) sobre el circuito.`,
        R`**Hilo recto:** un tramo visto desde una distancia $d$, con ángulos $\theta_1$ y $\theta_2$ a sus extremos: $B = \frac{\mu_0I}{4\pi d}(\sin\theta_2 - \sin\theta_1)$. Si es infinito, $B = \frac{\mu_0I}{2\pi d}$, con líneas de campo circulares (regla de la mano derecha: pulgar en la corriente).`,
        R`**Espira circular** de radio $R$: en el centro, $B = \frac{\mu_0I}{2R}$; sobre el eje a distancia $x$, $B = \frac{\mu_0IR^2}{2(R^2 + x^2)^{3/2}}$. Un arco de ángulo $\theta$, en su centro: $\frac{\mu_0I\theta}{4\pi R}$.`,
        R`**Carga puntual en movimiento** (con $v \ll c$): $\vec B = \frac{\mu_0}{4\pi}\frac{q\,\vec v\times\hat r}{r^2}$, perpendicular a la velocidad y a la recta que une la carga con el punto.`],
      idea: [R`Es el análogo magnético de la ley de [[f2a-coulomb|Coulomb]]: cada pedacito de corriente aporta un campo que cae como $\frac1{r^2}$. La diferencia es el producto vectorial: el campo da vueltas alrededor de la corriente, en lugar de salir de ella.`],
      demo: [R`**Paso 1 (hilo).** Con el hilo sobre el eje $x$ y el punto a distancia $d$: $|d\vec l\times\hat r| = dx\sin\alpha = dx\frac{d}{r}$, con $r = \sqrt{x^2 + d^2}$. Todos los aportes tienen la misma dirección, así que $B = \frac{\mu_0I}{4\pi}\int\frac{d\,dx}{(x^2 + d^2)^{3/2}}$.`,
        R`**Paso 2.** Con $x = d\tan u$ (la misma sustitución que para el [[f2a-distribuciones|campo de una varilla]]), el integrando queda $\frac{\cos u}{d}du$, y $B = \frac{\mu_0I}{4\pi d}(\sin\theta_2 - \sin\theta_1)$. Para el hilo infinito los ángulos van de $-90°$ a $90°$: $B = \frac{\mu_0I}{2\pi d}$.`,
        R`**Paso 3 (centro de la espira).** Todos los elementos están a distancia $R$ y son perpendiculares al radio: $dB = \frac{\mu_0I\,dl}{4\pi R^2}$, todos según el eje. Sumando $\int dl = 2\pi R$: $B = \frac{\mu_0I}{2R}$ (y para un arco, $R\theta$ en lugar de $2\pi R$).`,
        R`**Paso 4 (eje).** A distancia $x$, cada elemento está a $\sqrt{R^2 + x^2}$ y sigue siendo perpendicular a $\vec r$. Las componentes perpendiculares al eje se cancelan de a pares, y la axial es una fracción $\frac{R}{\sqrt{R^2 + x^2}}$ de cada aporte: $B = \frac{\mu_0I}{4\pi}\frac{2\pi R}{R^2 + x^2}\frac{R}{\sqrt{R^2 + x^2}} = \frac{\mu_0IR^2}{2(R^2 + x^2)^{3/2}}$.`,
        R`**Paso 5 (una carga).** En un tramo $dl$ de sección $A$ hay $nA\,dl$ portadores de carga $q$ y velocidad $\vec v$, y $I\,d\vec l = nqA\,dl\,\vec v$. Dividiendo el aporte del tramo por la cantidad de portadores, cada uno produce $\frac{\mu_0}{4\pi}\frac{q\vec v\times\hat r}{r^2}$. $\blacksquare$`],
      examples: [{ q: R`Un cable con $10$ A, a $5$ cm.`, steps: [R`$B = \frac{4\pi\times10^{-7}\cdot10}{2\pi\cdot0{,}05} = 40$ μT, del orden del campo terrestre.`] }],
      tips: [R`Los tramos rectos que apuntan hacia el punto (radiales) no aportan nada: ahí $d\vec l$ es paralelo a $\hat r$.`],
      see: ["f2a-ampere", "f2a-fuerza-paralelos", "f2a-campo-magnetico"]
    },
    "f2a-fuerza-paralelos": {
      title: "Fuerza entre conductores paralelos", aliases: ["fuerza entre conductores paralelos", "cables paralelos", "definición del ampere"], concepts: ["f2a-ampere"],
      summary: "Dos cables paralelos se atraen si las corrientes van en el mismo sentido y se repelen si van en sentidos opuestos, con F/L = μ₀I₁I₂/(2πd).",
      def: [R`**Fuerza por unidad de largo** entre dos cables rectos, largos y paralelos a distancia $d$: $\frac FL = \frac{\mu_0I_1I_2}{2\pi d}$. Atractiva si las corrientes tienen el mismo sentido, repulsiva si son opuestas.`,
        R`**El ampere** se definió así: la corriente que, en dos cables paralelos a $1$ m, produce una fuerza de $2\times10^{-7}$ N por metro. (Desde 2019 se define fijando el valor de la carga elemental.)`],
      idea: [R`Al revés que con las cargas: corrientes «iguales» se atraen. Cada cable está en el campo del otro, y la fuerza $I\vec L\times\vec B$ apunta hacia el otro cable cuando las corrientes van juntas.`],
      demo: [R`**Paso 1.** El cable 1 produce, donde está el 2, un campo $B_1 = \frac{\mu_0I_1}{2\pi d}$ ([[f2a-biot-savart|hilo infinito]]), perpendicular al cable 2.`,
        R`**Paso 2.** Un tramo $L$ del cable 2 siente $F = I_2LB_1$ ([[f2a-fuerza-conductor|fuerza sobre un conductor]]), así que $\frac FL = \frac{\mu_0I_1I_2}{2\pi d}$.`,
        R`**Paso 3 (sentido).** Con el cable 1 sobre el eje $z$ (corriente $+z$) y el 2 en $x = d$, el campo del 1 en el 2 es $+\hat y$. Si $I_2$ también va según $+z$: $\hat z\times\hat y = -\hat x$, hacia el cable 1: se atraen. Con $I_2$ al revés, la fuerza cambia de signo. $\blacksquare$`],
      examples: [{ q: R`$20$ A y $30$ A a $10$ cm, en el mismo sentido.`, steps: [R`$\frac FL = \frac{4\pi\times10^{-7}\cdot600}{2\pi\cdot0{,}1} = 1{,}2$ mN/m, atractiva.`] }],
      tips: [R`Para sumar campos de varios cables, dibujá las circunferencias alrededor de cada uno con la regla de la mano derecha y fijate el sentido en el punto, antes de sumar.`],
      see: ["f2a-biot-savart", "f2a-fuerza-conductor"]
    },
    "f2a-ampere": {
      title: "Ley de Ampère: cable grueso, solenoide y toroide", aliases: ["ley de Ampère", "solenoide", "toroide", "permeabilidad del vacío"], concepts: ["f2a-ampere"],
      summary: "∮B⃗·dl⃗ = μ₀I_enc. Con simetría da B: cable de radio R (μ₀Ir/2πR² adentro, μ₀I/2πr afuera), solenoide (μ₀nI), toroide (μ₀NI/2πr).",
      def: [R`**Ley de Ampère:** para toda curva cerrada, $\oint\vec B\cdot d\vec l = \mu_0I_{enc}$, donde $I_{enc}$ es la corriente neta que atraviesa una superficie apoyada en la curva (con el signo de la regla de la mano derecha). Vale para corrientes estacionarias.`,
        R`**Cable de radio $R$** con corriente uniforme: $B = \frac{\mu_0Ir}{2\pi R^2}$ adentro y $\frac{\mu_0I}{2\pi r}$ afuera. **Solenoide largo** con $n$ vueltas por metro: $B = \mu_0nI$ adentro (uniforme) y casi cero afuera. **Toroide** de $N$ vueltas: $B = \frac{\mu_0NI}{2\pi r}$ adentro y cero afuera.`,
        R`**Gauss para el magnetismo:** $\oint\vec B\cdot d\vec A = 0$ por toda superficie cerrada: no hay cargas magnéticas.`],
      idea: [R`Es al campo magnético lo que la [[f2a-gauss|ley de Gauss]] al eléctrico: vale siempre, pero sirve para calcular solo cuando la simetría permite sacar $B$ de la integral. En lugar de flujo y carga encerrada, circulación y corriente encerrada.`],
      demo: [R`**Paso 1 (cable, afuera).** Por simetría, $\vec B$ es tangente a las circunferencias centradas en el eje y depende solo de $r$. Con una de ellas: $B\cdot2\pi r = \mu_0I$, así que $B = \frac{\mu_0I}{2\pi r}$, igual que con [[f2a-biot-savart|Biot-Savart]].`,
        R`**Paso 2 (cable, adentro).** La circunferencia de radio $r < R$ encierra la fracción $\frac{\pi r^2}{\pi R^2}$ de la corriente: $B\cdot2\pi r = \mu_0I\frac{r^2}{R^2}$, y $B = \frac{\mu_0Ir}{2\pi R^2}$.`,
        R`**Paso 3 (solenoide).** Se toma un rectángulo con un lado de largo $\ell$ adentro, paralelo al eje, y el otro afuera. Afuera el campo es despreciable, y en los lados perpendiculares $\vec B\perp d\vec l$: solo aporta el lado de adentro, $B\ell$. Lo atraviesan $n\ell$ vueltas, así que $B\ell = \mu_0n\ell I$ y $B = \mu_0nI$.`,
        R`**Paso 4 (toroide).** Con una circunferencia de radio $r$ dentro del toroide, por simetría $B$ es tangente y constante: $B\cdot2\pi r = \mu_0NI$. Una circunferencia afuera encierra corriente neta cero (cada vuelta la cruza dos veces, en sentidos opuestos): $B = 0$. $\blacksquare$`],
      examples: [{ q: R`Solenoide de $1000$ vueltas en $50$ cm con $2$ A.`, steps: [R`$n = 2000$ /m y $B = 4\pi\times10^{-7}\cdot2000\cdot2 \approx 5{,}0$ mT.`] }],
      tips: [R`El campo de un solenoide no depende de su radio, solo de las vueltas por metro y la corriente.`],
      see: ["f2a-biot-savart", "f2a-gauss", "f2a-materiales-magneticos"]
    },
    "f2a-materiales-magneticos": {
      title: "Materiales magnéticos", aliases: ["ferromagnetismo", "paramagnetismo", "diamagnetismo", "permeabilidad magnética", "histéresis"], concepts: ["f2a-ampere"],
      summary: "Dentro de un material, B = κ_m μ₀nI. Diamagnéticos: κ_m apenas menor que 1. Paramagnéticos: apenas mayor. Ferromagnéticos (hierro, níquel, cobalto): de cientos a miles, con histéresis.",
      def: [R`**Permeabilidad relativa** $\kappa_m$: el factor en que un material que llena un solenoide multiplica su campo, $B = \kappa_m\mu_0nI = \mu nI$ (con $\mu = \kappa_m\mu_0$ la permeabilidad). Se escribe $\kappa_m = 1 + \chi_m$, con $\chi_m$ la susceptibilidad.`,
        R`**Diamagnéticos** ($\chi_m < 0$, del orden de $-10^{-5}$: cobre, agua, bismuto): el campo induce dipolos opuestos y son levemente repelidos. **Paramagnéticos** ($\chi_m > 0$, chico: aluminio, oxígeno): sus dipolos atómicos se alinean un poco con el campo y son levemente atraídos.`,
        R`**Ferromagnéticos** (hierro, níquel, cobalto): sus dipolos se alinean en dominios y $\kappa_m$ llega a miles. La relación entre $B$ y la corriente no es lineal y depende de la historia (**histéresis**): por eso existen los imanes permanentes. Arriba de la temperatura de Curie se vuelven paramagnéticos.`],
      idea: [R`Los electrones de los átomos son pequeñas espiras de corriente. En casi todos los materiales sus efectos se cancelan o se alinean muy poco; en los ferromagnéticos, la interacción entre vecinos los alinea en bloques, y el material entero se vuelve un imán.`],
      tips: [R`Por eso los electroimanes y los transformadores llevan núcleo de hierro: con la misma corriente, el campo es cientos o miles de veces mayor.`],
      see: ["f2a-ampere", "f2a-torque-espira"]
    }
  };

  E.extendCourse("f102a", {
    concepts: { "f2a-biot": { name: "Biot-Savart" }, "f2a-ampere": { name: "Ley de Ampère" } },
    templates: T,
    units: [{
      id: "f2a-fuentes-u", order: 7, program: "Unidad 7", title: "Fuentes de campo magnético", icon: "rotate-ccw",
      diagnostic: ["f2a-hilo-num", "f2a-espira-num", "f2a-solenoide-num"],
      lessons: [
        { id: "f2a-fuentes-l1", title: "Biot-Savart", templates: ["f2a-hilo-num", "f2a-espira-num", "f2a-carga-movil-num", "f2a-paralelos-num"], theory: ["f2a-biot-savart", "f2a-fuerza-paralelos"],
          intro: R`$d\vec B = \frac{\mu_0}{4\pi}\frac{I\,d\vec l\times\hat r}{r^2}$; hilo infinito: $\frac{\mu_0I}{2\pi d}$.` },
        { id: "f2a-fuentes-l2", title: "Ley de Ampère", templates: ["f2a-solenoide-num", "f2a-cable-grueso-tf"], theory: ["f2a-ampere", "f2a-materiales-magneticos"],
          intro: R`$\oint\vec B\cdot d\vec l = \mu_0I_{enc}$; solenoide: $B = \mu_0nI$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 8 · INDUCCIÓN ELECTROMAGNÉTICA E INDUCTANCIA
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, F = E.f2a, nf = F.nf;
  const T = {};
  const dec = v => String(v).replace(".", "{,}");
  const MU = R`\mu_0 = 4\pi\times10^{-7}\ \text{T m/A}`;
  // derivada numérica centrada, con extrapolación de Richardson
  const dnum = (f, t, h) => { const d = k => (f(t + k) - f(t - k)) / (2 * k); return (4 * d(h / 2) - d(h)) / 3; };

  T["f2a-faraday-num"] = {
    type: "numeric", concepts: ["f2a-faraday"], difficulty: 2,
    generate(r) {
      const N = r.pick([1, 10, 20, 50, 100, 200, 500]), a = r.int(2, 20), kind = r.pick(["lineal", "seno", "giro"]), Rr = r.int(1, 50), ask = r.pick(["fem", "I"]);
      const A = (a / 100) ** 2;
      let Phi, t0, emf, desc, step, h;
      if (kind === "lineal") {
        const B0 = r.int(0, 10) / 10, b = r.nz(-20, 20) / 10;
        t0 = r.int(1, 5); h = 1e-3; Phi = t => N * (B0 + b * t) * A; emf = -N * A * b;
        desc = `un campo magnético perpendicular a su plano que varía como $B(t) = ${dec(B0)} ${b < 0 ? "-" : "+"} ${dec(Math.abs(b))}\\,t$ (T, con $t$ en s)`;
        step = `$\\frac{d\\Phi}{dt} = NA\\frac{dB}{dt} = ${N}\\cdot${nf(A)}\\cdot${b < 0 ? `(${dec(b)})` : dec(b)}$, constante.`;
      } else if (kind === "seno") {
        const B0 = r.int(1, 10) / 100, f = r.pick([50, 60, 100]), tm = r.int(1, 9), w = 2 * Math.PI * f;
        t0 = tm / 1000; h = 1e-6; Phi = t => N * B0 * Math.sin(w * t) * A; emf = -N * A * B0 * w * Math.cos(w * t0);
        desc = `un campo magnético perpendicular a su plano que oscila como $B(t) = ${dec(B0)}\\sin(2\\pi\\cdot${f}\\,t)$ (T, con $t$ en s)`;
        step = `$\\frac{d\\Phi}{dt} = NAB_0\\,2\\pi f\\cos(2\\pi ft)$, evaluado en $t = ${tm}$ ms.`;
      } else {
        const B = r.int(1, 10) / 10, w = r.int(1, 20) * 10, tm = r.int(1, 30);
        t0 = tm / 1000; h = 1e-6; Phi = t => N * B * A * Math.cos(w * t); emf = N * B * A * w * Math.sin(w * t0);
        desc = `un campo uniforme de $${dec(B)}$ T y gira con velocidad angular $${w}$ rad/s alrededor de un eje de su plano perpendicular al campo (en $t = 0$ su normal es paralela al campo)`;
        step = `$\\Phi = NBA\\cos\\omega t$, así que $-\\frac{d\\Phi}{dt} = NBA\\omega\\sin\\omega t$, evaluado en $t = ${tm}$ ms (con $\\omega t$ en radianes).`;
      }
      if (Math.abs(emf) < 1e-6) return null;
      const tq = kind === "lineal" ? `$t = ${t0}$ s` : `$t = ${Math.round(t0 * 1000)}$ ms`;
      const ans0 = ask === "fem" ? emf : emf / Rr, sc = Math.abs(ans0) >= 1 ? 1 : 1000, un = ask === "fem" ? (sc === 1 ? "V" : "mV") : (sc === 1 ? "A" : "mA"), ans = ans0 * sc;
      return {
        prompt: `Una bobina cuadrada de $${N}$ ${N === 1 ? "vuelta" : "vueltas"} y $${a}$ cm de lado está en ${desc}. ${ask === "fem" ? `¿Cuánto vale la fem inducida en ${tq} (en ${un})?` : `La bobina tiene una resistencia total de $${Rr}\\ \\Omega$. ¿Qué corriente se induce en ${tq} (en ${un})?`} (Tomá la fem como $-\\frac{d\\Phi}{dt}$, con el signo incluido.)`,
        answer: ans,
        solution: [`[[f2a-faraday|Ley de Faraday]]: $\\varepsilon = -\\frac{d\\Phi_B}{dt}$, con $\\Phi_B = NBA$ el flujo por las $N$ vueltas y $A = ${nf(A)}$ m².`,
          step, `$\\varepsilon \\approx ${nf(emf)}$ V${ask === "I" ? `, e $I = \\frac{\\varepsilon}{R} \\approx ${nf(ans)}$ ${un}` : ""}.`],
        // otro camino: derivada numérica del flujo (Richardson)
        verify: { kind: "value", tol: 1e-6, fn: () => { const e = -dnum(Phi, t0, h); return (ask === "fem" ? e : e / Rr) * sc; } }
      };
    }
  };

  T["f2a-barra-num"] = {
    type: "numeric", concepts: ["f2a-faraday"], difficulty: 3,
    generate(r) {
      const B = r.int(1, 15) / 10, L = r.int(10, 100), Rr = r.int(1, 20) / 10, Lm = L / 100;
      if (r.bool()) {
        const v = r.int(1, 20), ask = r.pick(["fem", "I", "F", "P"]);
        const emf = B * Lm * v, I = emf / Rr, Fm = I * Lm * B, ans = { fem: emf, I, F: Fm, P: Fm * v }[ask];
        return {
          prompt: `Una barra conductora de $${L}$ cm se desliza con rapidez constante de $${v}$ m/s sobre dos rieles paralelos unidos por una resistencia de $${dec(Rr)}\\ \\Omega$ (la barra y los rieles no tienen resistencia). Un campo magnético de $${dec(B)}$ T es perpendicular al plano de los rieles. ${{ fem: "¿Cuánto vale la fem inducida (en V)?", I: "¿Qué corriente circula (en A)?", F: "¿Qué fuerza hay que hacer sobre la barra para mantener su rapidez (en N)?", P: "¿Qué potencia entrega esa fuerza (en W)?" }[ask]}`,
          answer: ans,
          solution: [`[[f2a-fem-movimiento|Fem de movimiento]]: $\\varepsilon = BLv = ${dec(B)}\\cdot${nf(Lm)}\\cdot${v} \\approx ${nf(emf)}$ V, e $I = \\frac\\varepsilon R \\approx ${nf(I)}$ A.`,
            ...(ask === "F" || ask === "P" ? [`La corriente en la barra siente $F = ILB \\approx ${nf(Fm)}$ N, que la frena ([[f2a-lenz|Lenz]]); hay que compensarla.${ask === "P" ? ` Potencia: $Fv \\approx ${nf(Fm * v)}$ W, igual a la que se disipa en la resistencia, $I^2R$.` : ""}`] : [])],
          // otro camino: fem como −dΦ/dt del área barrida (derivada numérica) y potencia como I²R
          verify: { kind: "value", tol: 1e-7, fn: () => { const Phi = t => B * Lm * (0.3 + v * t), e = Math.abs(dnum(Phi, 1, 1e-3)), i = e / Rr; return { fem: e, I: i, F: i * i * Rr / v, P: i * i * Rr }[ask]; } }
        };
      }
      const m = r.int(1, 20) * 10, v0 = r.int(1, 10), ask = r.pick(["v", "x"]), mk = m / 1000, tau = mk * Rr / (B * B * Lm * Lm), t = +(r.int(1, 20) / 10 * tau).toPrecision(2);
      const ans = ask === "v" ? v0 * Math.exp(-t / tau) : v0 * tau;
      return {
        prompt: `Una barra conductora de $${m}$ g y $${L}$ cm se desliza sin rozamiento sobre dos rieles horizontales paralelos unidos por una resistencia de $${dec(Rr)}\\ \\Omega$, en un campo magnético vertical de $${dec(B)}$ T. Se la lanza con $${v0}$ m/s y se la deja libre. ${ask === "v" ? `¿Qué rapidez tiene a los $${nf(t)}$ s (en m/s)?` : "¿Qué distancia recorre hasta detenerse (en m)?"}`,
        answer: ans,
        solution: [`La fuerza magnética sobre la barra es $ILB = \\frac{B^2L^2}{R}v$ y la frena: $m\\frac{dv}{dt} = -\\frac{B^2L^2}{R}v$ ([[f2a-fem-movimiento|fem de movimiento]] y [[f2a-lenz|Lenz]]).`,
          `La rapidez decae exponencialmente, $v = v_0e^{-t/\\tau}$, con $\\tau = \\frac{mR}{B^2L^2} \\approx ${nf(tau)}$ s.`,
          ask === "v" ? `$v \\approx ${nf(ans)}$ m/s.` : `La distancia total es $\\int_0^\\infty v\\,dt = v_0\\tau \\approx ${nf(ans)}$ m (nunca se detiene del todo, pero se acerca a ese punto).`],
        // otro camino: RK4 de la ecuación de movimiento (para la distancia, hasta 40 τ)
        verify: { kind: "ode", f: (_, y) => [y[1], -B * B * Lm * Lm / (Rr * mk) * y[1]], y0: [0, v0], t1: ask === "v" ? t : 40 * tau, dt: tau / 400, out: (_, y) => ask === "v" ? y[1] : y[0], tol: 1e-6 }
      };
    }
  };

  T["f2a-inductancia-num"] = {
    type: "numeric", concepts: ["f2a-inductancia"], difficulty: 3,
    generate(r) {
      const N = r.int(1, 20) * 50, ell = r.int(10, 50), rad = r.int(1, 5), I = r.int(1, 50) / 10, kind = r.pick(["L", "U", "fem", "M"]), N2 = r.int(1, 10) * 10, didt = r.int(1, 50) * 10;
      const A = Math.PI * (rad / 100) ** 2, l = ell / 100, Lh = F.mu0 * N * N * A / l, M = F.mu0 * N * N2 * A / l;
      const ans = { L: Lh * 1e3, U: 0.5 * Lh * I * I * 1e3, fem: Lh * didt, M: M * 1e3 }[kind];
      return {
        prompt: `Un solenoide de $${ell}$ cm de largo y $${rad}$ cm de radio tiene $${N}$ vueltas (consideralo largo). ${{ L: "¿Cuál es su autoinductancia (en mH)?", U: `Si lleva $${dec(I)}$ A, ¿cuánta energía hay en su campo magnético (en mJ)?`, fem: `Si la corriente cambia a razón de $${didt}$ A/s, ¿cuánto vale el módulo de la fem autoinducida (en V)?`, M: `Sobre su parte central se enrolla una segunda bobina de $${N2}$ vueltas. ¿Cuál es la inductancia mutua entre las dos (en mH)?` }[kind]} ($${MU}$)`,
        answer: ans,
        solution: [`Adentro, $B = \\mu_0\\frac{N}{\\ell}I$, y el flujo por cada vuelta es $BA$, con $A = \\pi r^2 \\approx ${nf(A)}$ m².`,
          kind === "M" ? `[[f2a-inductancia|Inductancia mutua]]: $M = \\frac{N_2\\Phi_1}{I_1} = \\frac{\\mu_0N_1N_2A}{\\ell} \\approx ${nf(ans)}$ mH.` : `[[f2a-inductancia|Autoinductancia]]: $L = \\frac{N\\Phi}{I} = \\frac{\\mu_0N^2A}{\\ell} \\approx ${nf(Lh * 1e3)}$ mH.`,
          ...({ U: [`Energía: $U = \\frac12LI^2 \\approx ${nf(ans)}$ mJ.`], fem: [`$|\\varepsilon| = L\\left|\\frac{dI}{dt}\\right| \\approx ${nf(ans)}$ V.`] }[kind] || [])],
        // otro camino: la energía como integral de B²/(2μ₀) en el volumen (L = 2U/I²), y la fem de la mutua por el flujo enlazado
        verify: { kind: "value", tol: 1e-9, fn: () => {
          const i0 = kind === "U" ? I : 1, B = F.mu0 * N / l * i0, Uf = F.simpson(s => B * B / (2 * F.mu0) * 2 * Math.PI * s * l, 0, rad / 100, 20), Ln = 2 * Uf / (i0 * i0);
          return { L: Ln * 1e3, U: Uf * 1e3, fem: Ln * didt, M: N2 * B * A / i0 * 1e3 }[kind];
        } }
      };
    }
  };

  T["f2a-rl-num"] = {
    type: "numeric", concepts: ["f2a-inductancia"], difficulty: 3,
    generate(r) {
      const Lm = r.int(1, 50) * 10, Rr = r.int(1, 50), em = r.int(3, 24), ask = r.pick(["I", "t", "U"]), tau = Lm / Rr; // mH/Ω = ms
      const t = +(r.int(1, 30) / 10 * tau).toPrecision(3), frac = r.pick([0.25, 0.5, 0.75, 0.9]), I0 = em / Rr;
      const I = I0 * (1 - Math.exp(-t / tau)), tf = -tau * Math.log(1 - frac);
      const ans = { I: I * 1000, t: tf, U: 0.5 * Lm * 1e-3 * I * I * 1e3 }[ask];
      return {
        prompt: `En $t = 0$ se conecta una batería de $${em}$ V a una bobina de $${Lm}$ mH en serie con una resistencia de $${Rr}\\ \\Omega$. ${{ I: `¿Qué corriente circula en $t = ${nf(t)}$ ms (en mA)?`, t: `¿En qué instante la corriente llega al $${100 * frac}\\,\\%$ de su valor final (en ms)?`, U: `¿Cuánta energía hay en la bobina en $t = ${nf(t)}$ ms (en mJ)?` }[ask]}`,
        answer: ans,
        solution: [`[[f2a-rl|Circuito RL]]: $I(t) = \\frac{\\varepsilon}{R}\\left(1 - e^{-t/\\tau}\\right)$, con $\\tau = \\frac LR = ${nf(tau)}$ ms y corriente final $\\frac\\varepsilon R \\approx ${nf(I0 * 1000)}$ mA.`,
          { I: `$I \\approx ${nf(I * 1000)}$ mA.`, t: `$1 - e^{-t/\\tau} = ${dec(frac)} \\Rightarrow t = -\\tau\\ln(${dec(+(1 - frac).toFixed(2))}) \\approx ${nf(tf)}$ ms.`, U: `Con $I \\approx ${nf(I * 1000)}$ mA, $U = \\frac12LI^2 \\approx ${nf(ans)}$ mJ.` }[ask]],
        // otro camino: RK4 de L dI/dt = ε − RI (tiempo en ms, corriente en A)
        verify: ask === "t"
          ? { kind: "ode", f: (_, y) => [(em - Rr * y[0]) / Lm], y0: [0], t1: 0, until: (_, y) => y[0] >= frac * I0, g: (_, y) => y[0] - frac * I0, dt: tau / 2000, tmax: 20 * tau, out: tt => tt, tol: 1e-4 }
          : { kind: "ode", f: (_, y) => [(em - Rr * y[0]) / Lm], y0: [0], t1: t, dt: tau / 2000, out: (_, y) => ask === "I" ? y[0] * 1000 : 0.5 * Lm * 1e-3 * y[0] * y[0] * 1e3, tol: 1e-6 }
      };
    }
  };
  T["f2a-rl-num"].testN = 100;

  T["f2a-lenz-mc"] = {
    type: "mc", concepts: ["f2a-faraday"], difficulty: 2,
    generate(r) {
      // B según z (positivo hacia arriba); la espira está en el plano xy y se la mira desde arriba (+z)
      const cases = [
        // el campo de un polo norte apunta alejándose de él: con el imán arriba, hacia abajo en la espira
        { t: "Se acerca a la espira, desde arriba, el polo norte de un imán", B: t => -(1 + t) },
        { t: "Se aleja hacia arriba el polo norte de un imán que estaba sobre la espira", B: t => -(2 - t) },
        { t: "Se acerca a la espira, desde arriba, el polo sur de un imán", B: t => 1 + t },
        { t: "Se aleja hacia arriba el polo sur de un imán que estaba sobre la espira", B: t => 2 - t },
        { t: "Un campo magnético vertical hacia arriba aumenta", B: t => 1 + t },
        { t: "Un campo magnético vertical hacia arriba disminuye", B: t => 2 - t },
        { t: "Un campo magnético vertical hacia abajo aumenta", B: t => -(1 + t) },
        { t: "Un campo magnético vertical hacia arriba se mantiene constante mientras la espira se traslada dentro de él", B: () => 1 }
      ];
      const c = r.pick(cases);
      const dB = (c.B(0.6) - c.B(0.4)) / 0.2, correct = Math.abs(dB) < 1e-12 ? "No se induce corriente" : dB > 0 ? "Horario" : "Antihorario";
      return {
        prompt: `Una espira horizontal se mira desde arriba. ${c.t}. ¿En qué sentido circula la corriente inducida?`,
        ...H.mc(r, correct, ["Horario", "Antihorario", "No se induce corriente", "Va cambiando de sentido mientras dura el movimiento"].filter(o => o !== correct), { text: true }),
        solution: [`[[f2a-lenz|Ley de Lenz]]: la corriente inducida produce un campo que se opone al **cambio** de flujo.`,
          correct === "No se induce corriente" ? `El flujo por la espira no cambia: no hay fem inducida.` : `El flujo hacia ${dB > 0 ? "arriba aumenta (o el de hacia abajo disminuye)" : "arriba disminuye (o el de hacia abajo aumenta)"}, así que la corriente crea un campo hacia ${dB > 0 ? "abajo" : "arriba"} adentro de la espira: vista desde arriba, circula en sentido ${correct.toLowerCase()} (regla de la mano derecha).`],
        // verificación: fem = −dΦ/dt con la normal hacia arriba (positiva = antihoraria vista desde arriba), por derivada numérica
        verify: { kind: "truth", target: true, fn: () => { const h = 1e-4, emf = -(c.B(0.5 + h) - c.B(0.5 - h)) / (2 * h); const got = Math.abs(emf) < 1e-9 ? "No se induce corriente" : emf > 0 ? "Antihorario" : "Horario"; return got === correct; } }
      };
    }
  };

  // fuente uniforme sobre un disco de radio a (por unidad de densidad): campo a distancia s del centro, como el de una carga
  // en el plano; con polares centradas en el punto, es (1/2π)|∮ û·L(α) dα|, con L el largo de la cuerda del disco en la dirección û.
  // Faraday (∮E·dl = −dΦ/dt, ∇·E = 0) y Ampère-Maxwell tienen la forma de Biot-Savart en 2D: el campo azimutal tiene ese módulo
  const disk2d = (a, s, N = 2000) => {
    let g = 0;
    if (s < a) for (let j = 0; j < N; j++) { const ux = Math.cos(2 * Math.PI * (j + 0.5) / N), pu = s * ux; g += ux * (-pu + Math.sqrt(pu * pu - s * s + a * a)) * 2 * Math.PI / N; }
    else { const b0 = Math.asin(a / s); for (let j = 0; j < N; j++) { const u = Math.PI * ((j + 0.5) / N - 0.5), b = b0 * Math.sin(u); g += Math.cos(b) * 2 * Math.sqrt(Math.max(0, a * a - (s * Math.sin(b)) ** 2)) * b0 * Math.cos(u) * Math.PI / N; } }
    return Math.abs(g) / (2 * Math.PI);
  };

  T["f2a-campo-inducido-num"] = {
    type: "numeric", concepts: ["f2a-maxwell"], difficulty: 3,
    generate(r) {
      const Rc = r.int(2, 10), s = r.int(1, 30), b = r.int(1, 50) / 10, ask = r.pick(["E", "E", "fem"]);
      if (s === Rc) return null;
      const Rm = Rc / 100, sm = s / 100, E0 = b * Math.min(sm, Rm) ** 2 / (2 * sm), fem = b * Math.PI * Math.min(sm, Rm) ** 2;
      const ans = (ask === "E" ? E0 : fem) * 1000, inside = s < Rc;
      return {
        prompt: `Un solenoide largo de $${Rc}$ cm de radio tiene adentro un campo magnético uniforme que aumenta a razón de $${dec(b)}$ T/s; afuera, el campo magnético es prácticamente nulo. ${ask === "E" ? `¿Cuánto vale el campo eléctrico inducido a $${s}$ cm del eje (en mV/m)?` : `¿Qué fem se induce en una espira circular de $${s}$ cm de radio, coaxial con el solenoide (en mV)?`}`,
        answer: ans,
        solution: [`[[f2a-campo-inducido|Campo eléctrico inducido]]: por simetría, sus líneas son circunferencias alrededor del eje, y en una de radio $r$, $\\oint\\vec E\\cdot d\\vec l = E\\cdot2\\pi r = \\left|\\frac{d\\Phi_B}{dt}\\right|$.`,
          inside ? `Como $r = ${s}$ cm es menor que el radio, el flujo es el de un círculo de radio $r$: $\\frac{d\\Phi_B}{dt} = \\pi r^2\\frac{dB}{dt} = \\pi\\cdot${nf(sm)}^2\\cdot${dec(b)} \\approx ${nf(fem)}$ V.`
            : `Como $r = ${s}$ cm es mayor que el radio, el campo solo atraviesa el círculo del solenoide: $\\frac{d\\Phi_B}{dt} = \\pi R^2\\frac{dB}{dt} = \\pi\\cdot${nf(Rm)}^2\\cdot${dec(b)} \\approx ${nf(fem)}$ V, aunque en la espira misma no haya campo magnético.`,
          ask === "E" ? `$E = \\frac{1}{2\\pi r}\\frac{d\\Phi_B}{dt} = ${inside ? "\\frac r2\\frac{dB}{dt}" : "\\frac{R^2}{2r}\\frac{dB}{dt}"} \\approx ${nf(ans)}$ mV/m.` : `[[f2a-faraday|Faraday]]: $|\\varepsilon| = \\frac{d\\Phi_B}{dt} \\approx ${nf(ans)}$ mV.`],
        // otro camino: el campo inducido como un Biot-Savart en el plano (cuerdas del disco, ver disk2d); la fem, como su circulación
        verify: { kind: "value", tol: 1e-7, fn: () => { const e = b * disk2d(Rm, sm); return (ask === "E" ? e : 2 * Math.PI * sm * e) * 1000; } }
      };
    }
  };

  T["f2a-desplazamiento-num"] = {
    type: "numeric", concepts: ["f2a-maxwell"], difficulty: 3,
    generate(r) {
      const Rc = r.int(2, 15), d = r.int(1, 5), ask = r.pick(["id", "B", "B"]);
      const Rm = Rc / 100, A = Math.PI * Rm * Rm, dm = d / 1000;
      if (ask === "id") {
        const k = r.int(1, 50), dVdt = k * 1e6, id = F.e0 * A / dm * dVdt, ans = id * 1e6;
        return {
          prompt: `Un capacitor de placas circulares de $${Rc}$ cm de radio, separadas $${d}$ mm, se está cargando: la tensión entre las placas aumenta a razón de $${k}\\times10^6$ V/s. ¿Cuánto vale la corriente de desplazamiento entre las placas (en μA)? ($\\varepsilon_0 = 8{,}854\\times10^{-12}$ C²/(N m²))`,
          answer: ans,
          solution: [`[[f2a-maxwell|Corriente de desplazamiento]]: $i_d = \\varepsilon_0\\frac{d\\Phi_E}{dt}$. Entre las placas, $E = \\frac Vd$ es uniforme y $\\Phi_E = EA = \\frac{VA}{d}$.`,
            `$i_d = \\frac{\\varepsilon_0A}{d}\\frac{dV}{dt} = \\frac{${nf(F.e0)}\\cdot${nf(A)}}{${nf(dm)}}\\cdot${nf(dVdt)} \\approx ${nf(id)}$ A $\\approx ${nf(ans)}$ μA. Es la misma corriente que llega por los cables, $C\\frac{dV}{dt}$.`],
          // otro camino: flujo eléctrico integrado en polares (Simpson) en dos instantes y derivada numérica
          verify: { kind: "value", tol: 1e-6, fn: () => { const Phi = t => F.simpson(rho => (100 + dVdt * t) / dm * 2 * Math.PI * rho, 0, Rm, 200), h = 1e-6; return F.e0 * (Phi(h) - Phi(-h)) / (2 * h) * 1e6; } }
        };
      }
      const I = r.int(1, 50) / 10, s = r.int(1, 30);
      if (s === Rc) return null;
      const sm = s / 100, B = s < Rc ? F.mu0 * I * sm / (2 * Math.PI * Rm * Rm) : F.mu0 * I / (2 * Math.PI * sm), ans = B * 1e6;
      return {
        prompt: `Un capacitor de placas circulares de $${Rc}$ cm de radio se carga con una corriente de $${dec(I)}$ A. ¿Cuánto vale el campo magnético en el espacio entre las placas, a $${s}$ cm del eje (en μT)? ($${MU}$; despreciá los efectos de borde)`,
        answer: ans,
        solution: [`Entre las placas no pasa carga, pero el campo eléctrico crece: hay una [[f2a-maxwell|corriente de desplazamiento]] $i_d = \\varepsilon_0\\frac{d\\Phi_E}{dt}$ igual a la de los cables, repartida uniformemente en el área de las placas.`,
          `Ley de Ampère-Maxwell en una circunferencia de radio $r$ coaxial: $B\\cdot2\\pi r = \\mu_0 i_{d,enc}$.`,
          s < Rc ? `Adentro, la corriente encerrada es la fracción $\\frac{r^2}{R^2}$: $B = \\frac{\\mu_0Ir}{2\\pi R^2} \\approx ${nf(ans)}$ μT.` : `Afuera de las placas se encierra toda: $B = \\frac{\\mu_0I}{2\\pi r} \\approx ${nf(ans)}$ μT, como el de un cable.`],
        // otro camino: Biot-Savart en el plano de la densidad de corriente de desplazamiento uniforme (cuerdas del disco)
        verify: { kind: "value", tol: 1e-7, fn: () => F.mu0 * I / (Math.PI * Rm * Rm) * disk2d(Rm, sm) * 1e6 }
      };
    }
  };

  T["f2a-maxwell-tf"] = {
    type: "tf", concepts: ["f2a-maxwell"], difficulty: 2,
    generate(r) {
      // dipolo magnético ideal m ẑ en el origen (unidades arbitrarias): flujo por una esfera de radio 1 centrada en (0, 0, 0,4)
      const dipFlux = () => {
        const c = 0.4, Bf = (x, y, z) => { const r2 = x * x + y * y + z * z, rr = Math.sqrt(r2), mr = z; return [3 * mr * x / rr ** 5, 3 * mr * y / rr ** 5, 3 * mr * z / rr ** 5 - 1 / rr ** 3]; };
        const integ = g => F.simpson(th => F.simpson(ph => { const n = [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)], B = Bf(n[0], n[1], n[2] + c); return g(B[0] * n[0] + B[1] * n[1] + B[2] * n[2]) * Math.sin(th); }, 0, 2 * Math.PI, 40), 0, Math.PI, 200);
        const flux = integ(x => x), up = integ(Math.abs);
        return Math.abs(flux) / up;
      };
      // capacitor de placas de 10 cm de radio separadas 1 mm, cargado con ε = 12 V a través de R = 1 MΩ (RK4)
      const rc = () => {
        const C = F.e0 * Math.PI * 0.01 / 1e-3, Rr = 1e6, tau = Rr * C, f = (_, y) => [(12 - y[0] / C) / Rr], t = tau, h = tau * 1e-3;
        // E = Q/(ε₀A) entre las placas, Φ_E = EA, i_d = ε₀ dΦ_E/dt por derivada numérica
        const A = Math.PI * 0.01, Q = tt => F.rk4(f, [0], tt, tau / 400)[0], PhiE = tt => Q(tt) / (F.e0 * A) * A;
        const icond = (12 - Q(t) / C) / Rr, idisp = F.e0 * (PhiE(t + h) - PhiE(t - h)) / (2 * h);
        return { icond, idisp };
      };
      const items = [
        { t: "El flujo magnético a través de cualquier superficie cerrada es cero, aunque la superficie encierre uno de los polos de un imán.", v: true, chk: () => dipFlux() < 1e-6,
          e: "Es la ley de Gauss para el magnetismo: no hay cargas magnéticas sueltas (monopolos), y las líneas de $\\vec B$ son cerradas: todas las que entran a la superficie vuelven a salir." },
        { t: "El flujo magnético a través de una superficie cerrada que encierra el polo norte de un imán es positivo, igual que el flujo eléctrico alrededor de una carga positiva.", v: false, chk: () => dipFlux() > 1e-3,
          e: "Por la ley de Gauss para el magnetismo, el flujo de $\\vec B$ por cualquier superficie cerrada es cero: no hay monopolos, y del polo norte salen tantas líneas como las que entran por adentro del imán." },
        { t: "Entre las placas de un capacitor que se está cargando no hay campo magnético, porque entre ellas no pasa carga.", v: false, chk: () => disk2d(0.1, 0.05) === 0,
          e: "Entre las placas el flujo eléctrico cambia, y eso es una corriente de desplazamiento $\\varepsilon_0\\frac{d\\Phi_E}{dt}$ que produce campo magnético igual que una corriente (ley de Ampère-Maxwell)." },
        { t: "Mientras un capacitor se carga, la corriente de desplazamiento entre sus placas es igual a la corriente que llega por los cables.", v: true, chk: () => { const { icond, idisp } = rc(); return Math.abs(idisp - icond) < 1e-5 * icond; },
          e: "Por la ley de Gauss, la carga de la placa es $Q = \\varepsilon_0\\Phi_E$; derivando, $i = \\frac{dQ}{dt} = \\varepsilon_0\\frac{d\\Phi_E}{dt} = i_d$. Así la corriente «continúa» a través del capacitor." },
        { t: "El campo eléctrico inducido por un campo magnético variable es conservativo, como el de las cargas en reposo.", v: false, chk: () => 2 * Math.PI * 0.05 * disk2d(0.1, 0.05) === 0,
          e: "Su circulación por una curva cerrada es $-\\frac{d\\Phi_B}{dt} \\neq 0$ (ley de Faraday): sus líneas son cerradas y no se puede definir un potencial." },
        { t: "Afuera de un solenoide largo, donde el campo magnético es prácticamente nulo, igual hay campo eléctrico inducido mientras cambia la corriente del solenoide.", v: true, chk: () => disk2d(0.02, 0.05) > 0,
          e: "El campo eléctrico inducido depende del flujo encerrado por la curva, no del campo en la curva: afuera vale $\\frac{R^2}{2r}\\frac{dB}{dt}$." }
      ];
      const it = r.pick(items);
      return {
        prompt: `<b>Verdadero o falso:</b> ${it.t}`,
        answer: it.v,
        explanation: `${it.e} Es ${it.v ? "verdadero" : "falso"}.`,
        solution: [R`Ver [[f2a-maxwell|ecuaciones de Maxwell]] y [[f2a-campo-inducido|campo eléctrico inducido]].`],
        // otro camino: flujo numérico del campo de un dipolo, RC simulado con RK4 y el campo de la fuente uniforme en un disco
        verify: { kind: "truth", fn: it.chk }
      };
    }
  };
  T["f2a-maxwell-tf"].testN = 60;

  const cards = {
    "f2a-faraday": {
      title: "Flujo magnético y ley de Faraday", aliases: ["ley de Faraday", "flujo magnético", "fem inducida", "inducción electromagnética", "weber"], concepts: ["f2a-faraday"],
      summary: "Φ_B = ∫B⃗·dA⃗ (en webers). Cuando el flujo por un circuito cambia, aparece una fem ε = −dΦ_B/dt (por N vueltas, −N dΦ/dt).",
      def: [R`**Flujo magnético** por una superficie: $\Phi_B = \int\vec B\cdot d\vec A$; para $\vec B$ uniforme y una espira plana, $BA\cos\phi$. Unidad: el weber, $1$ Wb $= 1$ T m².`,
        R`**Ley de Faraday:** la fem inducida en un circuito es $\varepsilon = -\frac{d\Phi_B}{dt}$; con $N$ vueltas iguales, $-N\frac{d\Phi_B}{dt}$. El flujo puede cambiar porque cambia $B$, el área o la orientación.`,
        R`**Campo eléctrico inducido:** $\oint\vec E\cdot d\vec l = -\frac{d\Phi_B}{dt}$. Un campo magnético variable crea un campo eléctrico con líneas cerradas, que no es conservativo.`],
      idea: [R`Lo que induce corriente no es el campo magnético sino su **cambio**: un imán quieto al lado de una espira no hace nada, pero acercarlo o alejarlo sí. El signo menos es la [[f2a-lenz|ley de Lenz]].`],
      demo: [R`**Paso 1 (un caso: la barra).** Una barra de largo $L$ se mueve con velocidad $v$ sobre rieles, en un campo $B$ perpendicular. Sus cargas sienten $q\vec v\times\vec B$, de módulo $qvB$, a lo largo de la barra.`,
        R`**Paso 2.** El trabajo por unidad de carga al recorrer la barra es $vBL$: esa es la fem ([[f2a-fem-movimiento|fem de movimiento]]).`,
        R`**Paso 3.** El área del circuito crece a razón de $\frac{dA}{dt} = Lv$, así que $\frac{d\Phi_B}{dt} = BLv$: la fem coincide con el ritmo de cambio del flujo. Faraday generaliza esto a cualquier cambio de flujo (también cuando nada se mueve y cambia $B$), que se comprueba experimentalmente. $\blacksquare$`],
      examples: [{ q: R`Bobina de $100$ vueltas de $10$ cm² en un campo que crece $0{,}5$ T/s.`, steps: [R`$|\varepsilon| = 100\cdot10^{-3}\cdot0{,}5 = 50$ mV.`] }],
      tips: [R`Para el sentido de la corriente, no uses el signo de la fórmula: usá la [[f2a-lenz|ley de Lenz]], que es más directa.`],
      see: ["f2a-lenz", "f2a-fem-movimiento", "f2a-inductancia"]
    },
    "f2a-lenz": {
      title: "Ley de Lenz", aliases: ["ley de Lenz", "corrientes de Foucault", "corrientes parásitas"], concepts: ["f2a-faraday"],
      summary: "La corriente inducida circula en el sentido que se opone al cambio de flujo que la produce. Es una consecuencia de la conservación de la energía.",
      def: [R`**Ley de Lenz:** la corriente inducida produce un campo magnético propio que se opone al **cambio** del flujo: si el flujo aumenta, su campo apunta al revés; si disminuye, en el mismo sentido.`,
        R`**Corrientes de Foucault (parásitas):** las que se inducen en una pieza metálica maciza que se mueve en un campo, o en la que el campo cambia. Frenan el movimiento y calientan el metal (frenos magnéticos, hornos de inducción), y por eso los núcleos de los transformadores se hacen de chapas aisladas.`],
      idea: [R`El sistema «se resiste» a cambiar: al acercar un imán, la espira lo repele; al alejarlo, lo atrae. Si fuera al revés, el imán se aceleraría solo y sacaríamos energía de la nada.`],
      demo: [R`**Paso 1.** En la barra sobre rieles, supongamos que la corriente inducida circulara al revés de lo que dice Lenz. La fuerza $ILB$ sobre la barra apuntaría hacia adelante, en el sentido del movimiento.`,
        R`**Paso 2.** Entonces la barra se aceleraría sola, la fem crecería, la corriente también, y la barra se aceleraría más: la energía cinética y el calor en la resistencia crecerían sin que nadie haga trabajo.`,
        R`**Paso 3.** Eso viola la conservación de la energía. Con el sentido de Lenz, la fuerza frena la barra, y el trabajo que hay que hacer para moverla es justo el calor que se disipa. $\blacksquare$`],
      examples: [{ q: R`Se acerca el polo norte de un imán a una espira, desde arriba.`, steps: [R`El flujo hacia abajo aumenta; la espira crea campo hacia arriba: vista desde arriba, la corriente es antihoraria, y la espira repele al imán.`] }],
      tips: [R`Receta: (1) ¿hacia dónde apunta el campo? (2) ¿el flujo crece o decrece? (3) el campo inducido va al revés del cambio; (4) mano derecha para el sentido de la corriente.`],
      see: ["f2a-faraday", "f2a-fem-movimiento"]
    },
    "f2a-fem-movimiento": {
      title: "Fem de movimiento y generadores", aliases: ["fem de movimiento", "generador eléctrico", "alternador"], concepts: ["f2a-faraday"],
      summary: "Una barra de largo L que se mueve con v en un B perpendicular tiene fem BLv. Una bobina que gira con ω en un B uniforme genera ε = NBAω sen ωt.",
      def: [R`**Fem de movimiento:** un conductor que se mueve en un campo magnético tiene una fem $\varepsilon = \oint(\vec v\times\vec B)\cdot d\vec l$; para una barra de largo $L$ perpendicular a $\vec B$ y a $\vec v$, $\varepsilon = BLv$.`,
        R`**Generador (alternador):** una bobina de $N$ vueltas y área $A$ que gira con velocidad angular $\omega$ en un campo uniforme tiene $\Phi = NBA\cos\omega t$ y genera $\varepsilon = NBA\omega\sin\omega t$, una tensión alterna de amplitud $NBA\omega$.`],
      idea: [R`El generador es un motor al revés: en el motor la corriente produce el giro; en el generador el giro produce la corriente. En los dos casos hay un torque que se opone, y eso es lo que convierte energía mecánica en eléctrica.`],
      demo: [R`**Paso 1 (barra).** Cada carga de la barra tiene velocidad $\vec v$ y siente $q\vec v\times\vec B$, a lo largo de la barra, de módulo $qvB$. El trabajo por unidad de carga a lo largo de $L$ es $\varepsilon = vBL$.`,
        R`**Paso 2 (generador).** Si la normal de la bobina forma un ángulo $\omega t$ con $\vec B$, el flujo por las $N$ vueltas es $NBA\cos\omega t$.`,
        R`**Paso 3.** Por la [[f2a-faraday|ley de Faraday]], $\varepsilon = -\frac{d}{dt}(NBA\cos\omega t) = NBA\omega\sin\omega t$. $\blacksquare$`],
      examples: [{ q: R`Barra de $50$ cm a $4$ m/s en $0{,}5$ T, con $R = 2\ \Omega$.`, steps: [R`$\varepsilon = 1$ V, $I = 0{,}5$ A, fuerza de frenado $0{,}125$ N y potencia $0{,}5$ W.`] }],
      tips: [R`Una barra lanzada y suelta sobre rieles con resistencia frena exponencialmente, con $\tau = \frac{mR}{B^2L^2}$: la fuerza magnética es proporcional a la velocidad, como un rozamiento viscoso.`],
      see: ["f2a-faraday", "f2a-lenz", "f2a-torque-espira"]
    },
    "f2a-inductancia": {
      title: "Inductancia y energía magnética", aliases: ["inductancia", "autoinductancia", "inductancia mutua", "fem autoinducida", "densidad de energía magnética"], concepts: ["f2a-inductancia"],
      summary: "L = NΦ/I (en henrios); fem autoinducida −L dI/dt. Solenoide: L = μ₀N²A/ℓ. Mutua: M = N₂Φ₁/I₁. Energía: ½LI², con densidad B²/(2μ₀).",
      def: [R`**Autoinductancia:** $L = \frac{N\Phi_B}{I}$, el flujo propio por unidad de corriente. Unidad: el henrio, $1$ H $= 1$ Wb/A. Si la corriente cambia, aparece una **fem autoinducida** $\varepsilon = -L\frac{dI}{dt}$ que se opone al cambio.`,
        R`**Solenoide** de $N$ vueltas, sección $A$ y largo $\ell$: $L = \frac{\mu_0N^2A}{\ell}$. **Inductancia mutua** entre dos bobinas: $M = \frac{N_2\Phi_{21}}{I_1}$, y la fem en la segunda es $-M\frac{dI_1}{dt}$; para una bobina de $N_2$ vueltas sobre el solenoide, $M = \frac{\mu_0N_1N_2A}{\ell}$.`,
        R`**Energía** en un inductor: $U = \frac12LI^2$. Está en el campo, con **densidad de energía magnética** $u = \frac{B^2}{2\mu_0}$.`],
      idea: [R`Un inductor es la inercia de los circuitos: no deja que la corriente cambie de golpe. Así como el capacitor guarda energía en su campo eléctrico, el inductor la guarda en su campo magnético.`],
      demo: [R`**Paso 1 (solenoide).** Adentro, $B = \mu_0\frac N\ell I$ ([[f2a-ampere|Ampère]]). El flujo por cada vuelta es $BA$, y por las $N$: $N\Phi = \frac{\mu_0N^2A}{\ell}I$. Dividiendo por $I$: $L = \frac{\mu_0N^2A}{\ell}$.`,
        R`**Paso 2 (energía).** Para aumentar la corriente hay que vencer la fem autoinducida: la fuente entrega $P = LI\frac{dI}{dt}$. Integrando desde $0$ hasta $I$: $U = \int_0^I LI'\,dI' = \frac12LI^2$.`,
        R`**Paso 3 (densidad).** En el solenoide, $\frac12LI^2 = \frac12\frac{\mu_0N^2A}{\ell}I^2 = \frac{B^2}{2\mu_0}\cdot(A\ell)$, usando $I = \frac{B\ell}{\mu_0N}$. Como $A\ell$ es el volumen con campo, $u = \frac{B^2}{2\mu_0}$. $\blacksquare$`],
      examples: [{ q: R`Solenoide de $500$ vueltas, $20$ cm de largo y $2$ cm de radio.`, steps: [R`$L = \frac{4\pi\times10^{-7}\cdot250000\cdot1{,}26\times10^{-3}}{0{,}2} \approx 1{,}97$ mH.`] }],
      tips: [R`$L$ crece con el cuadrado de las vueltas: duplicar $N$ (con el mismo largo) cuadruplica la inductancia.`],
      see: ["f2a-faraday", "f2a-rl", "f2a-energia-capacitor"]
    },
    "f2a-rl": {
      title: "Circuitos RL", aliases: ["circuito RL", "constante de tiempo RL"], concepts: ["f2a-inductancia"],
      summary: "Al conectar una fem: I = (ε/R)(1 − e^(−t/τ)), con τ = L/R. Al desconectarla (cerrando el circuito sobre R): I = I₀e^(−t/τ).",
      def: [R`**Establecimiento** (fem $\varepsilon$, inductancia $L$, resistencia $R$, desde $I = 0$): $I(t) = \frac\varepsilon R\left(1 - e^{-t/\tau}\right)$, con $\tau = \frac LR$ (con mH y Ω, da ms).`,
        R`**Decaimiento** (sin fem, desde $I_0$): $I(t) = I_0e^{-t/\tau}$.`],
      idea: [R`Es el mismo comportamiento que el [[f2a-rc|circuito RC]], con la corriente en el lugar de la carga: el inductor frena los cambios al principio, y cuando la corriente ya no cambia es como un cable.`],
      demo: [R`**Paso 1.** Ley de mallas: $\varepsilon - IR - L\frac{dI}{dt} = 0$ (la fem autoinducida se opone al aumento de la corriente).`,
        R`**Paso 2.** Con $u = \frac\varepsilon R - I$ (lo que falta), $\frac{du}{dt} = -\frac{dI}{dt} = -\frac RLu$: [[c2-edo-lineal|ecuación lineal]] con solución $u = u_0e^{-Rt/L}$.`,
        R`**Paso 3.** Como $I(0) = 0$, $u_0 = \frac\varepsilon R$, e $I = \frac\varepsilon R\left(1 - e^{-t/\tau}\right)$. Sin fem queda $L\frac{dI}{dt} = -IR$, e $I = I_0e^{-t/\tau}$. $\blacksquare$`],
      examples: [{ q: R`$L = 200$ mH, $R = 10\ \Omega$, $\varepsilon = 12$ V.`, steps: [R`$\tau = 20$ ms y la corriente final es $1{,}2$ A; en $20$ ms vale $0{,}63\cdot1{,}2 \approx 0{,}76$ A.`] }],
      tips: [R`Cortar de golpe la corriente de una bobina produce una fem enorme ($L\frac{dI}{dt}$ con $dt$ chiquito): por eso saltan chispas en las llaves de motores.`],
      see: ["f2a-inductancia", "f2a-rc", "c2-edo-lineal"]
    },
    "f2a-campo-inducido": {
      title: "Campo eléctrico inducido", aliases: ["campo eléctrico inducido", "campo eléctrico no conservativo"], concepts: ["f2a-maxwell"],
      summary: "Un campo magnético que cambia crea un campo eléctrico de líneas cerradas: ∮E⃗·dl⃗ = −dΦ_B/dt. En un solenoide de radio R: E = (r/2) dB/dt adentro y (R²/2r) dB/dt afuera.",
      def: [R`**Campo eléctrico inducido:** donde el flujo magnético cambia aparece un campo eléctrico $\vec E$ que cumple $\oint\vec E\cdot d\vec l = -\frac{d\Phi_B}{dt}$ en cualquier curva cerrada, haya o no un conductor. Es la [[f2a-faraday|ley de Faraday]] escrita con el campo.`,
        R`Sus líneas son **cerradas** y su circulación no es cero: **no es conservativo** y no tiene potencial. Por eso en un circuito con inducción no se puede hablar de «la diferencia de potencial» entre dos puntos sin aclarar el camino.`,
        R`**Solenoide** de radio $R$ con campo uniforme que cambia: $E = \frac r2\frac{dB}{dt}$ a distancia $r < R$ del eje, y $E = \frac{R^2}{2r}\frac{dB}{dt}$ afuera, en circunferencias alrededor del eje.`],
      idea: [R`En una espira quieta la fem no puede venir de la fuerza magnética, porque las cargas no se mueven. Lo que las empuja es un campo eléctrico nuevo, creado por el cambio de $\vec B$, que da vueltas alrededor de la región donde cambia el flujo, como $\vec B$ da vueltas alrededor de una corriente.`,
        R`Afuera del solenoide no hay campo magnético, y sin embargo hay campo eléctrico: lo que importa es el flujo que encierra la curva, no el campo sobre la curva.`],
      demo: [R`**Paso 1 (simetría).** El solenoide es simétrico respecto de giros alrededor de su eje, así que $\vec E$ tiene el mismo módulo en toda una circunferencia de radio $r$ coaxial. Además es tangente a ella: una componente radial daría flujo eléctrico neto por un cilindro sin carga adentro, contra la [[f2a-gauss|ley de Gauss]].`,
        R`**Paso 2.** Entonces la circulación sobre esa circunferencia es $E\cdot2\pi r$.`,
        R`**Paso 3 (adentro).** Si $r < R$, el flujo encerrado es $B\pi r^2$. Por Faraday, $E\cdot2\pi r = \pi r^2\frac{dB}{dt}$ (en módulo), y $E = \frac r2\frac{dB}{dt}$.`,
        R`**Paso 4 (afuera).** Si $r > R$, el campo solo atraviesa el círculo de radio $R$: el flujo es $B\pi R^2$, y $E = \frac{R^2}{2r}\frac{dB}{dt}$. $\blacksquare$`],
      examples: [{ q: R`Solenoide de $5$ cm de radio, con $B$ que crece $2$ T/s. Campo eléctrico a $10$ cm del eje.`, steps: [R`Está afuera: $E = \frac{0{,}05^2}{2\cdot0{,}1}\cdot2 = 0{,}025$ V/m $= 25$ mV/m.`] }],
      tips: [R`El sentido sale de la [[f2a-lenz|ley de Lenz]]: es el de la corriente que circularía en una espira puesta sobre esa línea de campo.`],
      see: ["f2a-faraday", "f2a-maxwell", "f2a-lenz"]
    },
    "f2a-maxwell": {
      title: "Corriente de desplazamiento y ecuaciones de Maxwell", aliases: ["corriente de desplazamiento", "ley de Ampère-Maxwell", "ley de Gauss para el magnetismo"], concepts: ["f2a-maxwell"],
      summary: "Un flujo eléctrico que cambia produce campo magnético como una corriente: i_d = ε₀ dΦ_E/dt. Con ese término, las cuatro ecuaciones de Maxwell resumen todo el electromagnetismo.",
      def: [R`**Corriente de desplazamiento:** $i_d = \varepsilon_0\frac{d\Phi_E}{dt}$. **Ley de Ampère-Maxwell:** $\oint\vec B\cdot d\vec l = \mu_0\left(i_{enc} + \varepsilon_0\frac{d\Phi_E}{dt}\right)$.`,
        R`**Ecuaciones de Maxwell** (forma integral, en el vacío): (1) Gauss: $\oint\vec E\cdot d\vec A = \frac{q_{enc}}{\varepsilon_0}$; (2) Gauss para el magnetismo: $\oint\vec B\cdot d\vec A = 0$ (no hay monopolos); (3) Faraday: $\oint\vec E\cdot d\vec l = -\frac{d\Phi_B}{dt}$; (4) Ampère-Maxwell.`,
        R`Juntas, predicen que los campos se propagan como [[f2b-em|ondas electromagnéticas]] a $c = \frac{1}{\sqrt{\mu_0\varepsilon_0}}$.`],
      idea: [R`Faraday dice que un $\vec B$ variable crea $\vec E$; Maxwell agregó lo simétrico: un $\vec E$ variable crea $\vec B$. Esa simetría es la que permite que un campo «empuje» al otro y la perturbación viaje sola por el vacío: eso es la luz.`],
      demo: [R`**Paso 1 (el problema).** Mientras un capacitor se carga, tomemos una curva alrededor del cable. La [[f2a-ampere|ley de Ampère]] usa la corriente que atraviesa una superficie apoyada en la curva: un disco que corta el cable encierra $i$, pero una «bolsa» que pasa entre las placas no encierra ninguna. Las dos no pueden tener razón.`,
        R`**Paso 2.** Entre las placas, por la [[f2a-gauss|ley de Gauss]], $\Phi_E = \frac{Q}{\varepsilon_0}$ (todo el campo de la placa pasa por la bolsa). Derivando: $\varepsilon_0\frac{d\Phi_E}{dt} = \frac{dQ}{dt} = i$.`,
        R`**Paso 3.** Sumando $\varepsilon_0\frac{d\Phi_E}{dt}$ a la corriente encerrada, las dos superficies dan lo mismo: el disco tiene $i$ y flujo eléctrico nulo, la bolsa tiene corriente nula e $i_d = i$.`,
        R`**Paso 4 (campo entre placas circulares de radio $R$).** $i_d$ se reparte uniforme en el área. En una circunferencia de radio $r < R$ se encierra la fracción $\frac{r^2}{R^2}$: $B\cdot2\pi r = \mu_0i\frac{r^2}{R^2}$, y $B = \frac{\mu_0ir}{2\pi R^2}$. $\blacksquare$`],
      examples: [{ q: R`Placas de $10$ cm de radio, cargadas con $2$ A. Campo magnético a $5$ cm del eje, entre las placas.`, steps: [R`$B = \frac{4\pi\times10^{-7}\cdot2\cdot0{,}05}{2\pi\cdot0{,}01} = 2$ μT.`] }],
      tips: [R`La corriente de desplazamiento no es un movimiento de cargas: es el ritmo de cambio del flujo eléctrico, que produce campo magnético igual que una corriente.`],
      see: ["f2a-campo-inducido", "f2a-ampere", "f2b-em"]
    }
  };

  E.extendCourse("f102a", {
    concepts: { "f2a-faraday": { name: "Ley de Faraday" }, "f2a-inductancia": { name: "Inductancia" }, "f2a-maxwell": { name: "Campos inducidos y Maxwell" } },
    templates: T,
    units: [{
      id: "f2a-induccion-u", order: 8, program: "Unidad 8", title: "Inducción electromagnética", icon: "sparkles",
      diagnostic: ["f2a-faraday-num", "f2a-barra-num", "f2a-inductancia-num"],
      lessons: [
        { id: "f2a-induccion-l1", title: "Faraday y Lenz", templates: ["f2a-lenz-mc", "f2a-faraday-num", "f2a-barra-num"], theory: ["f2a-faraday", "f2a-lenz", "f2a-fem-movimiento"],
          intro: R`$\varepsilon = -\frac{d\Phi_B}{dt}$, y la corriente inducida se opone al cambio.` },
        { id: "f2a-induccion-l2", title: "Inductancia y circuitos RL", templates: ["f2a-inductancia-num", "f2a-rl-num"], theory: ["f2a-inductancia", "f2a-rl"],
          intro: R`$\varepsilon = -L\frac{dI}{dt}$, $U = \frac12LI^2$ y $\tau = \frac LR$.` },
        { id: "f2a-induccion-l3", title: "Campos inducidos y ecuaciones de Maxwell", templates: ["f2a-campo-inducido-num", "f2a-desplazamiento-num", "f2a-maxwell-tf"], theory: ["f2a-campo-inducido", "f2a-maxwell"],
          intro: R`Un $\vec B$ variable crea $\vec E$ ($\oint\vec E\cdot d\vec l = -\frac{d\Phi_B}{dt}$), y un $\vec E$ variable crea $\vec B$ ($i_d = \varepsilon_0\frac{d\Phi_E}{dt}$).` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 9 · CORRIENTE ALTERNA
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, F = E.f2a, nf = F.nf;
  const T = {};
  const dec = v => String(v).replace(".", "{,}");
  // valor medio de f en un período (Simpson)
  const mean = (f, Tp, n = 2000) => F.simpson(f, 0, Tp, n) / Tp;
  // RLC serie con v = V·sen(ωt): se integra L di/dt = v − Ri − q/C con RK4 hasta pasar el transitorio, y se mide el último período
  const rlcSim = (V, w, Rr, L, C) => {
    // el transitorio decae con la raíz más lenta de Ls² + Rs + 1/C (si es sobreamortiguado, puede ser mucho más lenta que 2L/R)
    const a = Rr / (2 * L), b = 1 / (L * C), slow = a * a > b ? a - Math.sqrt(a * a - b) : a;
    const Tp = 2 * Math.PI / w, nT = Math.max(6, Math.ceil(14 / slow / Tp)), M = 400, h = Tp / M;
    const f = (t, y) => [y[1], (V * Math.sin(w * t) - Rr * y[1] - y[0] / C) / L];
    let y = [0, 0], t = 0, imax = 0, P = 0, i0 = 0;
    for (let k = 0; k < nT * M; k++) {
      const last = k >= (nT - 1) * M;
      if (last) { if (k === (nT - 1) * M) i0 = y[1]; imax = Math.max(imax, Math.abs(y[1])); P += V * Math.sin(w * t) * y[1] / M; }
      const k1 = f(t, y), k2 = f(t + h / 2, y.map((v, j) => v + h / 2 * k1[j])), k3 = f(t + h / 2, y.map((v, j) => v + h / 2 * k2[j])), k4 = f(t + h, y.map((v, j) => v + h * k3[j]));
      y = y.map((v, j) => v + h / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])); t += h;
    }
    // i = I·sen(ωt − φ): en el comienzo de un período, i = −I·sen φ; y P = ½VI cos φ
    return { I: imax, P, phi: Math.atan2(-i0 / imax, 2 * P / (V * imax)) };
  };

  T["f2a-eficaz-num"] = {
    type: "numeric", concepts: ["f2a-alterna"], difficulty: 2,
    generate(r) {
      const Vp = r.int(1, 40) * 10, f = r.pick([50, 60, 100, 400]), Rr = r.int(1, 20) * 10, wave = r.pick(["seno", "seno", "cuadrada", "triangular", "media onda", "onda completa"]);
      const rect = wave === "media onda" || wave === "onda completa", ask = r.pick(rect ? ["rms", "P", "media"] : ["rms", "P"]);
      const k = { seno: Math.SQRT1_2, cuadrada: 1, triangular: 1 / Math.sqrt(3), "media onda": 0.5, "onda completa": Math.SQRT1_2 }[wave], Vr = Vp * k;
      const avg = wave === "media onda" ? Vp / Math.PI : 2 * Vp / Math.PI, ans = { rms: Vr, P: Vr * Vr / Rr, media: avg }[ask];
      const Tp = 1 / f, wf = { seno: t => Vp * Math.sin(2 * Math.PI * f * t), cuadrada: t => (t % Tp < Tp / 2 ? Vp : -Vp), triangular: t => { const u = (t % Tp) / Tp; return Vp * (u < 0.25 ? 4 * u : u < 0.75 ? 2 - 4 * u : 4 * u - 4); }, "media onda": t => Math.max(0, Vp * Math.sin(2 * Math.PI * f * t)), "onda completa": t => Math.abs(Vp * Math.sin(2 * Math.PI * f * t)) }[wave];
      const nm = { seno: "senoidal", cuadrada: "cuadrada (que vale $+V_p$ medio período y $-V_p$ el otro)", triangular: "triangular simétrica", "media onda": "senoidal rectificada de media onda (se anula la mitad negativa)", "onda completa": "senoidal rectificada de onda completa (la mitad negativa se invierte)" }[wave];
      return {
        prompt: `Una tensión ${nm} de amplitud $${Vp}$ V y $${f}$ Hz ${{ rms: "se aplica a un circuito. ¿Cuál es su valor eficaz (en V)?", P: `se aplica a una resistencia de $${Rr}\\ \\Omega$. ¿Qué potencia media se disipa (en W)?`, media: "se aplica a un circuito. ¿Cuál es su valor medio, el que marcaría un voltímetro de continua (en V)?" }[ask]}`,
        answer: ans,
        solution: ask === "media"
          ? [`El [[f2a-ca|valor medio]] es el promedio de $v$ en un período. Un medio ciclo de la senoidal tiene área $\\int_0^{T/2}V_p\\sin\\omega t\\,dt = \\frac{V_pT}{\\pi}$.`,
            wave === "media onda" ? `En un período hay un solo medio ciclo y el resto es cero: $\\overline v = \\frac{V_p}{\\pi} \\approx ${nf(ans)}$ V.` : `En un período hay dos medios ciclos positivos: $\\overline v = \\frac{2V_p}{\\pi} \\approx ${nf(ans)}$ V.`]
          : [`El [[f2a-ca|valor eficaz]] es la raíz del valor medio del cuadrado: $V_{ef} = \\sqrt{\\overline{v^2}}$.`,
          { seno: `Para una senoidal, $\\overline{\\sin^2} = \\frac12$: $V_{ef} = \\frac{V_p}{\\sqrt2} \\approx ${nf(Vr)}$ V.`, cuadrada: `El cuadrado vale siempre $V_p^2$: $V_{ef} = V_p = ${Vp}$ V.`, triangular: `Para una rampa, $\\overline{u^2} = \\frac13$: $V_{ef} = \\frac{V_p}{\\sqrt3} \\approx ${nf(Vr)}$ V.`, "media onda": `El cuadrado es el de la senoidal la mitad del tiempo y cero la otra mitad: $\\overline{v^2} = \\frac{V_p^2}{4}$ y $V_{ef} = \\frac{V_p}{2} = ${nf(Vr)}$ V.`, "onda completa": `Invertir la mitad negativa no cambia el cuadrado: $V_{ef} = \\frac{V_p}{\\sqrt2} \\approx ${nf(Vr)}$ V, como la senoidal.` }[wave],
          ...(ask === "P" ? [`[[f2a-potencia-ca|Potencia media]]: $P = \\frac{V_{ef}^2}{R} \\approx ${nf(ans)}$ W.`] : [])],
        // otro camino: promedios numéricos de v y de v² (y de v²/R) en un período
        verify: { kind: "value", tol: 1e-5, fn: () => { if (ask === "media") return mean(wf, Tp, 4000); const m2 = mean(t => wf(t) ** 2, Tp, 4000); return ask === "rms" ? Math.sqrt(m2) : m2 / Rr; } }
      };
    }
  };

  T["f2a-reactancia-num"] = {
    type: "numeric", concepts: ["f2a-alterna"], difficulty: 2,
    generate(r) {
      const ind = r.bool(), Vr = r.pick([12, 24, 110, 220]), f = r.pick([50, 60, 100, 500, 1000]), L = r.int(1, 50) * 10, C = r.int(1, 50), ask = r.pick(["X", "I"]);
      const w = 2 * Math.PI * f, X = ind ? w * L / 1000 : 1 / (w * C * 1e-6), Ir = Vr / X;
      const ans = ask === "X" ? X : Ir * 1000;
      return {
        prompt: `${ind ? `Una bobina ideal de $${L}$ mH` : `Un capacitor de $${C}$ μF`} se conecta a una fuente alterna de $${Vr}$ V eficaces y $${f}$ Hz. ${ask === "X" ? "¿Cuál es su reactancia (en Ω)?" : "¿Qué corriente eficaz circula (en mA)?"}`,
        answer: ans,
        solution: [ind ? `[[f2a-reactancia|Reactancia inductiva]]: $X_L = \\omega L = 2\\pi\\cdot${f}\\cdot${nf(L / 1000)} \\approx ${nf(X)}\\ \\Omega$.` : `[[f2a-reactancia|Reactancia capacitiva]]: $X_C = \\frac1{\\omega C} = \\frac{1}{2\\pi\\cdot${f}\\cdot${nf(C * 1e-6)}} \\approx ${nf(X)}\\ \\Omega$.`,
          ...(ask === "I" ? [`$I_{ef} = \\frac{V_{ef}}{X} \\approx ${nf(ans)}$ mA, ${ind ? "atrasada" : "adelantada"} $90°$ respecto de la tensión.`] : [])],
        // otro camino: con v = V√2·sen ωt, la corriente es C·dv/dt (derivada numérica) o (1/L)∫v dt (Simpson), y se mide su amplitud
        verify: { kind: "value", tol: 1e-6, fn: () => {
          const Vp = Vr * Math.SQRT2, v = t => Vp * Math.sin(w * t), Tp = 2 * Math.PI / w;
          const amp = ind ? Math.abs(F.simpson(v, 0, Tp / 2, 2000)) / (L / 1000) / 2 : (C * 1e-6) * Math.abs(v(1e-9 * Tp) - v(-1e-9 * Tp)) / (2e-9 * Tp);
          const Ief = amp / Math.SQRT2;
          return ask === "X" ? Vr / Ief : Ief * 1000;
        } }
      };
    }
  };

  T["f2a-rlc-num"] = {
    type: "numeric", concepts: ["f2a-rlc"], difficulty: 3,
    generate(r) {
      const Rr = r.int(1, 10) * 10, L = r.int(1, 50) * 10, C = r.int(1, 50), Vr = r.pick([12, 24, 50, 110, 220]), f = r.pick([50, 60, 100, 200, 500]), ask = r.pick(["Z", "I", "phi", "P", "VL"]);
      const w = 2 * Math.PI * f, XL = w * L / 1000, XC = 1 / (w * C * 1e-6), Z = Math.hypot(Rr, XL - XC), I = Vr / Z, phi = Math.atan((XL - XC) / Rr);
      const ans = { Z, I, phi: phi * 180 / Math.PI, P: I * I * Rr, VL: I * XL }[ask];
      return {
        prompt: `Un circuito RLC serie con $R = ${Rr}\\ \\Omega$, $L = ${L}$ mH y $C = ${C}$ μF se conecta a una fuente de $${Vr}$ V eficaces y $${f}$ Hz. ${{ Z: "¿Cuál es su impedancia (en Ω)?", I: "¿Qué corriente eficaz circula (en A)?", phi: "¿Cuál es el ángulo de fase $\\phi$ de la tensión respecto de la corriente (en grados, positivo si la corriente atrasa)?", P: "¿Qué potencia media consume (en W)?", VL: "¿Cuál es la tensión eficaz sobre la bobina (en V)?" }[ask]}`,
        answer: ans,
        solution: [`Reactancias: $X_L = \\omega L \\approx ${nf(XL)}\\ \\Omega$ y $X_C = \\frac1{\\omega C} \\approx ${nf(XC)}\\ \\Omega$.`,
          `[[f2a-rlc|Impedancia]]: $Z = \\sqrt{R^2 + (X_L - X_C)^2} \\approx ${nf(Z)}\\ \\Omega$; $I_{ef} = \\frac{V_{ef}}{Z} \\approx ${nf(I)}$ A y $\\tan\\phi = \\frac{X_L - X_C}{R}$, $\\phi \\approx ${nf(phi * 180 / Math.PI)}°$ (${XL > XC ? "inductivo: la corriente atrasa" : "capacitivo: la corriente adelanta"}).`,
          { Z: `Listo: $Z \\approx ${nf(Z)}\\ \\Omega$.`, I: `Listo: $I_{ef} \\approx ${nf(I)}$ A.`, phi: `Listo: $\\phi \\approx ${nf(ans)}°$.`, P: `[[f2a-potencia-ca|Potencia media]]: solo disipa la resistencia, $P = I_{ef}^2R = V_{ef}I_{ef}\\cos\\phi \\approx ${nf(ans)}$ W.`, VL: `$V_L = I_{ef}X_L \\approx ${nf(ans)}$ V (puede ser mayor que la de la fuente: las tensiones de $L$ y $C$ se restan).` }[ask]],
        // otro camino: simulación del circuito en el tiempo (RK4) hasta el régimen, midiendo amplitud, potencia media y desfase
        verify: { kind: "value", tol: 2e-3, fn: () => { const s = rlcSim(Vr * Math.SQRT2, w, Rr, L / 1000, C * 1e-6), Ie = s.I / Math.SQRT2; return { Z: Vr / Ie, I: Ie, phi: s.phi * 180 / Math.PI, P: s.P, VL: Ie * w * L / 1000 }[ask]; } }
      };
    }
  };
  T["f2a-rlc-num"].testN = 60;

  T["f2a-resonancia-num"] = {
    type: "numeric", concepts: ["f2a-rlc"], difficulty: 3,
    generate(r) {
      const Rr = r.int(1, 20) * 5, L = r.int(1, 50) * 10, C = r.int(1, 100) / 10, Vr = r.pick([5, 10, 12, 24]), ask = r.pick(["f0", "I0", "Q"]);
      const Lh = L / 1000, Cf = C * 1e-6, w0 = 1 / Math.sqrt(Lh * Cf), Q = w0 * Lh / Rr;
      const ans = { f0: w0 / (2 * Math.PI), I0: Vr / Rr, Q }[ask];
      return {
        prompt: `Un circuito RLC serie tiene $R = ${Rr}\\ \\Omega$, $L = ${L}$ mH y $C = ${dec(C)}$ μF, y se alimenta con $${Vr}$ V eficaces de frecuencia variable. ${{ f0: "¿A qué frecuencia la corriente es máxima (en Hz)?", I0: "¿Cuál es esa corriente eficaz máxima (en A)?", Q: "¿Cuál es su factor de calidad $Q = \\frac{\\omega_0L}{R}$?" }[ask]}`,
        answer: ans,
        solution: [`[[f2a-resonancia|Resonancia]]: la impedancia $\\sqrt{R^2 + (\\omega L - \\frac1{\\omega C})^2}$ es mínima cuando las reactancias se cancelan, $\\omega_0 = \\frac1{\\sqrt{LC}} \\approx ${nf(w0)}$ rad/s, o sea $f_0 \\approx ${nf(w0 / (2 * Math.PI))}$ Hz.`,
          { f0: `Listo: $f_0 \\approx ${nf(ans)}$ Hz.`, I0: `Ahí $Z = R$ y $I_{ef} = \\frac{V_{ef}}{R} \\approx ${nf(ans)}$ A.`, Q: `$Q = \\frac{\\omega_0L}{R} \\approx ${nf(Q)}$: cuanto más grande, más angosto el pico (el ancho a media potencia es $\\frac{\\omega_0}{Q}$).` }[ask]],
        // otro camino: máximo numérico de la corriente (sección áurea, con aritmética compleja) y Q como ω₀/Δω entre los puntos de media potencia
        verify: { kind: "value", tol: 1e-5, fn: () => {
          const Iw = x => Vr / Math.hypot(Rr, x * Lh - 1 / (x * Cf)), lo = 1, hi = 1e6;
          const lw = F.golden(u => -Iw(Math.exp(u)), Math.log(lo), Math.log(hi)), wm = Math.exp(lw), Im = Iw(wm);
          if (ask === "f0") return wm / (2 * Math.PI);
          if (ask === "I0") return Im;
          const half = (a, b) => { const up = Iw(a) < Iw(b); for (let i = 0; i < 200; i++) { const m = (a + b) / 2; if ((Iw(m) ** 2 < Im * Im / 2) === up) a = m; else b = m; } return (a + b) / 2; };
          return wm / (half(wm, hi) - half(lo, wm));
        } }
      };
    }
  };

  T["f2a-transformador-num"] = {
    type: "numeric", concepts: ["f2a-rlc"], difficulty: 2,
    generate(r) {
      const N1 = r.int(1, 20) * 100, N2 = r.int(1, 40) * 10, V1 = r.pick([220, 380, 110, 13200]), Rc = r.int(1, 50) * 2, ask = r.pick(["V2", "I2", "I1"]);
      const V2 = V1 * N2 / N1, I2 = V2 / Rc, I1 = I2 * N2 / N1, ans = { V2, I2, I1: I1 * 1000 }[ask];
      if (V2 > 5000 || V2 < 1) return null;
      return {
        prompt: `Un transformador ideal tiene $${N1}$ vueltas en el primario y $${N2}$ en el secundario. El primario se conecta a $${V1}$ V eficaces, y el secundario alimenta una resistencia de $${Rc}\\ \\Omega$. ${{ V2: "¿Qué tensión eficaz hay en el secundario (en V)?", I2: "¿Qué corriente eficaz circula por el secundario (en A)?", I1: "¿Qué corriente eficaz toma el primario (en mA)?" }[ask]}`,
        answer: ans,
        solution: [`[[f2a-transformador|Transformador ideal]]: el mismo flujo atraviesa las dos bobinas, así que $\\frac{V_2}{V_1} = \\frac{N_2}{N_1}$: $V_2 = ${nf(V2)}$ V.`,
          ...(ask !== "V2" ? [`$I_2 = \\frac{V_2}{R} \\approx ${nf(I2)}$ A.`] : []),
          ...(ask === "I1" ? [`Sin pérdidas, $V_1I_1 = V_2I_2$: $I_1 = I_2\\frac{N_2}{N_1} \\approx ${nf(I1)}$ A $\\approx ${nf(I1 * 1000)}$ mA.`] : [])],
        // otro camino: con la respuesta, la fem por vuelta tiene que ser la misma en las dos bobinas y la potencia tiene que conservarse
        verify: { kind: "zero", fn: x => {
          if (ask === "V2") return (x / N2 - V1 / N1) / (V1 / N1);
          const v2 = V1 / N1 * N2;
          if (ask === "I2") return (x * Rc - v2) / v2;
          return (V1 * x / 1000 - v2 * v2 / Rc) / (v2 * v2 / Rc);
        } }
      };
    }
  };

  // carga RL serie con v = Vp·sen ωt: RK4 hasta el régimen (16 τ) y muestras de v e i a lo largo de un período
  const rlSamples = (Vp, w, Rr, L, M = 400) => {
    const Tp = 2 * Math.PI / w, h = Tp / M, f = (t, i) => (Vp * Math.sin(w * t) - Rr * i) / L, nT = Math.ceil(16 * L / Rr / Tp) + 2;
    let i = 0, t = 0; const vs = [], is = [];
    for (let k = 0; k < (nT + 1) * M; k++) {
      if (k >= nT * M) { vs.push(Vp * Math.sin(w * t)); is.push(i); }
      const k1 = f(t, i), k2 = f(t + h / 2, i + h / 2 * k1), k3 = f(t + h / 2, i + h / 2 * k2), k4 = f(t + h, i + h * k3);
      i += h / 6 * (k1 + 2 * k2 + 2 * k3 + k4); t += h;
    }
    return { vs, is, t0: nT * Tp };
  };
  const avgOf = a => a.reduce((s, x) => s + x, 0) / a.length;

  T["f2a-potencia-ca-num"] = {
    type: "numeric", concepts: ["f2a-rlc"], difficulty: 3,
    generate(r) {
      const Vr = r.pick([110, 220, 380]), f = r.pick([50, 60]), Rr = r.int(2, 40) * 5, L = r.int(1, 40) * 10, ask = r.pick(["P", "Q", "S", "fp", "C"]), target = r.pick([0.9, 0.95, 1]);
      const w = 2 * Math.PI * f, XL = w * L / 1000, Z = Math.hypot(Rr, XL), I = Vr / Z, P = I * I * Rr, Q = I * I * XL, S = Vr * I, fp = Rr / Z;
      if (ask === "C" && fp > target - 0.03) return null;
      const Cn = P * (XL / Rr - Math.tan(Math.acos(target))) / (w * Vr * Vr), ans = { P, Q, S, fp, C: Cn * 1e6 }[ask];
      return {
        prompt: `Un motor se modela como una resistencia de $${Rr}\\ \\Omega$ en serie con una bobina de $${L}$ mH, y se conecta a $${Vr}$ V eficaces de $${f}$ Hz. ${{ P: "¿Qué potencia activa consume (en W)?", Q: "¿Cuánta potencia reactiva toma (en var)?", S: "¿Cuál es su potencia aparente (en VA)?", fp: "¿Cuál es su factor de potencia?", C: `¿Qué capacitor hay que conectar en paralelo con el motor para llevar el factor de potencia a $${String(target).replace(".", "{,}")}$ (en μF)?` }[ask]}`,
        answer: ans,
        solution: [`$X_L = \\omega L \\approx ${nf(XL)}\\ \\Omega$, $Z = \\sqrt{R^2 + X_L^2} \\approx ${nf(Z)}\\ \\Omega$ e $I_{ef} = \\frac{V_{ef}}{Z} \\approx ${nf(I)}$ A.`,
          { P: `[[f2a-potencia-ca|Potencia activa]]: solo consume la resistencia, $P = I_{ef}^2R \\approx ${nf(P)}$ W.`,
            Q: `[[f2a-potencia-ca|Potencia reactiva]]: la que va y viene en la bobina, $Q = I_{ef}^2X_L \\approx ${nf(Q)}$ var.`,
            S: `[[f2a-potencia-ca|Potencia aparente]]: $S = V_{ef}I_{ef} \\approx ${nf(S)}$ VA (y $S^2 = P^2 + Q^2$).`,
            fp: `[[f2a-potencia-ca|Factor de potencia]]: $\\cos\\phi = \\frac RZ = \\frac PS \\approx ${nf(fp)}$.`,
            C: `[[f2a-potencia-ca|Corrección del factor de potencia]]: el capacitor no cambia $P \\approx ${nf(P)}$ W y aporta una reactiva $-\\omega CV_{ef}^2$. La reactiva tiene que bajar de $Q_1 = P\\tan\\phi_1 \\approx ${nf(Q)}$ var a $Q_2 = P\\tan\\phi_2 \\approx ${nf(P * Math.tan(Math.acos(target)))}$ var: $C = \\frac{Q_1 - Q_2}{\\omega V_{ef}^2} \\approx ${nf(ans)}$ μF.` }[ask]],
        // otro camino: corriente del motor simulada con RK4; P = ⟨v·i⟩, Q = ⟨v(t)·i(t + T/4)⟩, valores eficaces numéricos, y el capacitor sumando C·dv/dt
        verify: { kind: "value", tol: 1e-4, fn: () => {
          const M = 400, sm = rlSamples(Vr * Math.SQRT2, w, Rr, L / 1000, M), sh = k => (k + M / 4) % M;
          const Pn = avgOf(sm.vs.map((v, k) => v * sm.is[k])), Qn = avgOf(sm.vs.map((v, k) => v * sm.is[sh(k)])), Sn = Math.sqrt(avgOf(sm.vs.map(v => v * v)) * avgOf(sm.is.map(i => i * i)));
          if (ask !== "C") return { P: Pn, Q: Qn, S: Sn, fp: Pn / Sn }[ask];
          // dv/dt por diferencias centradas; la reactiva es lineal en C: Q(C) = Qn + C·q1
          const dt = 2 * Math.PI / w / M, dv = k => (Vr * Math.SQRT2) * (Math.sin(w * (sm.t0 + k * dt + 1e-7)) - Math.sin(w * (sm.t0 + k * dt - 1e-7))) / 2e-7;
          const q1 = avgOf(sm.vs.map((v, k) => v * dv(sh(k))));
          return (Pn * Math.tan(Math.acos(target)) - Qn) / q1 * 1e6;
        } }
      };
    }
  };
  T["f2a-potencia-ca-num"].testN = 60;

  T["f2a-rlc-paralelo-num"] = {
    type: "numeric", concepts: ["f2a-rlc"], difficulty: 3,
    generate(r) {
      const Rr = r.int(2, 20) * 10, L = r.int(1, 50) * 10, C = r.int(1, 50), Vr = r.pick([12, 24, 50, 110, 220]), f = r.pick([50, 60, 100, 200, 500]), ask = r.pick(["I", "Z", "phi"]);
      const w = 2 * Math.PI * f, IR = Vr / Rr, IL = Vr / (w * L / 1000), IC = Vr * w * C * 1e-6, I = Math.hypot(IR, IC - IL), phi = Math.atan((IC - IL) / IR) * 180 / Math.PI;
      if (ask === "phi" && Math.abs(phi) < 1) return null;
      const ans = { I, Z: Vr / I, phi }[ask];
      return {
        prompt: `Una resistencia de $${Rr}\\ \\Omega$, una bobina de $${L}$ mH y un capacitor de $${C}$ μF se conectan en paralelo a una fuente de $${Vr}$ V eficaces y $${f}$ Hz. ${{ I: "¿Qué corriente eficaz entrega la fuente (en A)?", Z: "¿Cuál es la impedancia del conjunto (en Ω)?", phi: "¿Qué ángulo forma la corriente total con la tensión (en grados, positivo si la corriente adelanta)?" }[ask]}`,
        answer: ans,
        solution: [`En [[f2a-rlc|paralelo]] la tensión es común y se suman las corrientes de cada rama como fasores: $I_R = \\frac VR \\approx ${nf(IR)}$ A en fase, $I_L = \\frac{V}{X_L} \\approx ${nf(IL)}$ A atrasada $90°$ e $I_C = \\frac{V}{X_C} \\approx ${nf(IC)}$ A adelantada $90°$.`,
          `$I_L$ e $I_C$ son opuestas: $I = \\sqrt{I_R^2 + (I_C - I_L)^2} \\approx ${nf(I)}$ A.`,
          { I: `Listo: $I \\approx ${nf(I)}$ A.`, Z: `$Z = \\frac VI \\approx ${nf(ans)}\\ \\Omega$.`, phi: `$\\tan\\phi = \\frac{I_C - I_L}{I_R}$: $\\phi \\approx ${nf(phi)}°$ (${phi > 0 ? "capacitivo: la corriente adelanta" : "inductivo: la corriente atrasa"}).` }[ask]],
        // otro camino: corrientes de cada rama en el tiempo (i_L integrando v con Simpson, i_C derivando v numéricamente), suma y proyección de Fourier
        verify: { kind: "value", tol: 1e-5, fn: () => {
          const Vp = Vr * Math.SQRT2, Tp = 1 / f, M = 200, v = t => Vp * Math.sin(w * t), Lh = L / 1000, Cf = C * 1e-6;
          const ts = Array.from({ length: M }, (_, k) => k * Tp / M), iLraw = ts.map(t => F.simpson(v, 0, t, 200) / Lh), mL = avgOf(iLraw);
          const it = ts.map((t, k) => v(t) / Rr + (iLraw[k] - mL) + Cf * (v(t + 1e-8) - v(t - 1e-8)) / 2e-8);
          const a = 2 * avgOf(it.map((x, k) => x * Math.sin(w * ts[k]))), b = 2 * avgOf(it.map((x, k) => x * Math.cos(w * ts[k]))), Ie = Math.sqrt(avgOf(it.map(x => x * x)));
          return { I: Ie, Z: Vr / Ie, phi: Math.atan2(b, a) * 180 / Math.PI }[ask];
        } }
      };
    }
  };
  T["f2a-rlc-paralelo-num"].testN = 100;

  T["f2a-fase-mc"] = {
    type: "mc", concepts: ["f2a-alterna"], difficulty: 2,
    generate(r) {
      const el = r.pick([{ n: "una resistencia", k: "R" }, { n: "una bobina ideal", k: "L" }, { n: "un capacitor", k: "C" }, { n: "un circuito RLC serie con $X_L > X_C$", k: "RLind" }, { n: "un circuito RLC serie con $X_L < X_C$", k: "RLcap" }, { n: "un circuito RLC serie en resonancia", k: "R0" }]);
      const lab = { R: "En fase con la tensión", R0: "En fase con la tensión", L: "Atrasada 90° respecto de la tensión", C: "Adelantada 90° respecto de la tensión", RLind: "Atrasada un ángulo entre 0° y 90°", RLcap: "Adelantada un ángulo entre 0° y 90°" };
      const correct = lab[el.k], all = ["En fase con la tensión", "Atrasada 90° respecto de la tensión", "Adelantada 90° respecto de la tensión", "Atrasada un ángulo entre 0° y 90°", "Adelantada un ángulo entre 0° y 90°"];
      return {
        prompt: `Se aplica una tensión senoidal a ${el.n}. ¿Cómo es la corriente?`,
        ...H.mc(r, correct, r.shuffle(all.filter(o => o !== correct)), { text: true }),
        solution: [`[[f2a-reactancia|Fasores]]: en una resistencia, $v$ e $i$ están en fase; en una bobina, $v = L\\frac{di}{dt}$ y la corriente atrasa $90°$; en un capacitor, $i = C\\frac{dv}{dt}$ y la corriente adelanta $90°$. En un [[f2a-rlc|RLC]], el ángulo es $\\arctan\\frac{X_L - X_C}{R}$.`],
        // verificación: desfase medido numéricamente (corriente simulada o derivada/integral numérica de la tensión)
        verify: { kind: "truth", target: true, fn: () => {
          const w = 2 * Math.PI * 50; let phi;
          if (el.k === "R") phi = 0;
          else if (el.k === "L") { const i = t => F.simpson(s => Math.sin(w * s), 0, t, 200) - 1 / w; phi = Math.atan2(-i(0), i(Math.PI / (2 * w))); }
          else if (el.k === "C") { const i = t => (Math.sin(w * (t + 1e-7)) - Math.sin(w * (t - 1e-7))) / 2e-7; phi = Math.atan2(-i(0), i(Math.PI / (2 * w))); }
          else { const L = 0.1, C = el.k === "R0" ? 1 / (w * w * L) : el.k === "RLind" ? 1e-3 : 1e-5; phi = rlcSim(1, w, 20, L, C).phi; }
          const d = phi * 180 / Math.PI, got = Math.abs(d) < 0.5 ? "En fase con la tensión" : Math.abs(Math.abs(d) - 90) < 0.5 ? (d > 0 ? lab.L : lab.C) : d > 0 ? lab.RLind : lab.RLcap;
          return got === correct;
        } }
      };
    }
  };
  T["f2a-fase-mc"].testN = 60;

  const cards = {
    "f2a-ca": {
      title: "Corriente alterna y valores eficaces", aliases: ["corriente alterna", "valor eficaz", "valor rms", "tensión eficaz"], concepts: ["f2a-alterna"],
      summary: "v = V_p sen ωt, con ω = 2πf. El valor eficaz es √(promedio de v²): para una senoidal, V_p/√2. Los 220 V de la red son eficaces (picos de 311 V).",
      def: [R`**Tensión alterna senoidal:** $v(t) = V_p\sin\omega t$, con amplitud $V_p$, frecuencia $f$ y $\omega = 2\pi f$ (en la Argentina, $f = 50$ Hz).`,
        R`**Valor eficaz (rms):** $V_{ef} = \sqrt{\overline{v^2}}$, el valor de una tensión continua que disiparía la misma potencia media en una resistencia. Para una senoidal, $V_{ef} = \frac{V_p}{\sqrt2}$; para una cuadrada, $V_p$; para una triangular, $\frac{V_p}{\sqrt3}$.`,
        R`**Corriente alterna rectificada:** un rectificador de **media onda** (un diodo) deja pasar solo los semiciclos positivos; uno de **onda completa** (un puente de diodos) invierte los negativos. Su **valor medio** ya no es cero: $\frac{V_p}{\pi}$ y $\frac{2V_p}{\pi}$; sus valores eficaces son $\frac{V_p}2$ y $\frac{V_p}{\sqrt2}$.`],
      idea: [R`Una corriente que va y viene tiene promedio cero, pero calienta igual: lo que importa para la potencia es el cuadrado. El valor eficaz es la «corriente continua equivalente».`],
      demo: [R`**Paso 1.** En una resistencia, $p(t) = \frac{v^2}{R}$, y la potencia media es $\frac{\overline{v^2}}{R}$. Para que una tensión continua $V_{ef}$ dé lo mismo, $V_{ef}^2 = \overline{v^2}$.`,
        R`**Paso 2 (senoidal).** Por la identidad $\sin^2x = \frac{1 - \cos2x}{2}$, el promedio de $\sin^2\omega t$ en un período es $\frac12$ (el coseno promedia cero).`,
        R`**Paso 3.** Entonces $\overline{v^2} = \frac{V_p^2}{2}$ y $V_{ef} = \frac{V_p}{\sqrt2}$.`,
        R`**Paso 4 (rectificada).** Un semiciclo tiene área $\int_0^{T/2}V_p\sin\omega t\,dt = \frac{V_p}{\omega}[-\cos\omega t]_0^{T/2} = \frac{2V_p}{\omega} = \frac{V_pT}{\pi}$. En media onda hay uno por período y $\overline v = \frac{V_p}{\pi}$; en onda completa hay dos y $\overline v = \frac{2V_p}{\pi}$. Para el eficaz: en onda completa $v^2$ es el mismo que el de la senoidal, y en media onda es la mitad del tiempo, así que $\overline{v^2} = \frac{V_p^2}{4}$. $\blacksquare$`],
      examples: [{ q: R`La red de $220$ V.`, steps: [R`$V_p = 220\sqrt2 \approx 311$ V: la tensión oscila entre $-311$ y $311$ V, $50$ veces por segundo.`] }],
      tips: [R`Salvo que se diga otra cosa, los voltímetros y amperímetros de alterna miden valores eficaces.`],
      see: ["f2a-reactancia", "f2a-potencia-ca", "f2a-fem-movimiento"]
    },
    "f2a-reactancia": {
      title: "Resistencia, bobina y capacitor en alterna", aliases: ["reactancia inductiva", "reactancia capacitiva", "reactancia", "fasores"], concepts: ["f2a-alterna"],
      summary: "R: V = IR, en fase. Bobina: V = IX_L con X_L = ωL, la corriente atrasa 90°. Capacitor: V = IX_C con X_C = 1/(ωC), la corriente adelanta 90°.",
      def: [R`**Resistencia:** $V = IR$ (amplitudes o eficaces), con $v$ e $i$ en fase.`,
        R`**Bobina:** $V = IX_L$, con **reactancia inductiva** $X_L = \omega L$; la corriente atrasa $90°$ respecto de la tensión. **Capacitor:** $V = IX_C$, con **reactancia capacitiva** $X_C = \frac1{\omega C}$; la corriente adelanta $90°$.`,
        R`**Fasores:** cada magnitud senoidal se representa con un vector que gira con velocidad angular $\omega$; su proyección es el valor instantáneo. Sumar tensiones en serie es sumar fasores.`],
      idea: [R`A frecuencias altas, la bobina se opone mucho (la corriente tiene que cambiar muy rápido) y el capacitor casi nada (no llega a cargarse). A frecuencias bajas pasa al revés: en continua, la bobina es un cable y el capacitor, un circuito abierto.`],
      demo: [R`**Paso 1 (bobina).** Con $i = I\sin\omega t$, la tensión es $v = L\frac{di}{dt} = \omega LI\cos\omega t = \omega LI\sin(\omega t + 90°)$: amplitud $\omega LI$ y la tensión adelanta $90°$ (la corriente atrasa).`,
        R`**Paso 2 (capacitor).** Con $v = V\sin\omega t$, la carga es $q = Cv$ y $i = \frac{dq}{dt} = \omega CV\cos\omega t$: amplitud $\omega CV$, es decir $V = \frac{I}{\omega C}$, y la corriente adelanta $90°$. $\blacksquare$`],
      examples: [{ q: R`Capacitor de $10$ μF a $50$ Hz.`, steps: [R`$X_C = \frac{1}{2\pi\cdot50\cdot10^{-5}} \approx 318\ \Omega$.`] }],
      tips: [R`Regla para recordar: en la bobina (L) la tensión va primero, «ELI»; en el capacitor (C) la corriente va primero, «ICE».`],
      see: ["f2a-ca", "f2a-rlc", "f2a-inductancia", "f2a-capacitancia"]
    },
    "f2a-rlc": {
      title: "Circuitos RLC serie y paralelo e impedancia", aliases: ["circuito RLC", "impedancia", "ángulo de fase", "RLC paralelo"], concepts: ["f2a-rlc"],
      summary: "Z = √(R² + (X_L − X_C)²), I = V/Z y tan φ = (X_L − X_C)/R. Si X_L > X_C el circuito es inductivo (la corriente atrasa); si X_L < X_C, capacitivo. En paralelo se suman las corrientes: I = √(I_R² + (I_C − I_L)²).",
      def: [R`**Impedancia** del RLC serie: $Z = \sqrt{R^2 + (X_L - X_C)^2}$, y $V = IZ$ (amplitudes o eficaces).`,
        R`**Ángulo de fase** de la tensión respecto de la corriente: $\tan\phi = \frac{X_L - X_C}{R}$. Positivo: inductivo, la corriente atrasa. Negativo: capacitivo, la corriente adelanta.`,
        R`Las tensiones sobre $R$, $L$ y $C$ no se suman como números: $V_L$ y $V_C$ están en oposición, y cada una puede ser mayor que la de la fuente.`,
        R`**RLC paralelo:** la tensión es común y las corrientes de las ramas se suman como fasores: $I = \sqrt{I_R^2 + (I_C - I_L)^2}$, con $I_R = \frac VR$, $I_L = \frac{V}{X_L}$ e $I_C = \frac{V}{X_C}$; $Z = \frac VI$ y $\tan\phi = \frac{I_C - I_L}{I_R}$ (la corriente adelanta si domina el capacitor).`],
      idea: [R`La bobina y el capacitor tiran la fase para lados opuestos y se compensan en parte. Lo que queda de esa diferencia, $X_L - X_C$, se combina «en ángulo recto» con la resistencia, como los catetos de un triángulo.`],
      demo: [R`**Paso 1.** En serie la corriente es común: $i = I\sin\omega t$. Las tensiones son $v_R = IR\sin\omega t$, $v_L = IX_L\sin(\omega t + 90°)$ y $v_C = IX_C\sin(\omega t - 90°)$ ([[f2a-reactancia]]).`,
        R`**Paso 2.** En el diagrama de fasores, $V_R$ va sobre el eje de la corriente y $V_L$, $V_C$ sobre la perpendicular, en sentidos opuestos: su suma es $I(X_L - X_C)$ en esa dirección.`,
        R`**Paso 3.** La tensión total es la suma vectorial de dos fasores perpendiculares, $IR$ e $I(X_L - X_C)$: por Pitágoras, $V = I\sqrt{R^2 + (X_L - X_C)^2} = IZ$, y el ángulo cumple $\tan\phi = \frac{X_L - X_C}{R}$.`,
        R`**Paso 4 (paralelo).** Ahora lo común es la tensión: $I_R$ va en fase con ella, $I_L$ atrasada $90°$ e $I_C$ adelantada $90°$. Las dos últimas están sobre la misma recta en sentidos opuestos y suman $I_C - I_L$; por Pitágoras con $I_R$, $I = \sqrt{I_R^2 + (I_C - I_L)^2}$. $\blacksquare$`],
      examples: [{ q: R`$R = 40\ \Omega$, $X_L = 80\ \Omega$, $X_C = 50\ \Omega$, $100$ V.`, steps: [R`$Z = 50\ \Omega$, $I = 2$ A y $\phi = \arctan0{,}75 \approx 36{,}9°$ (inductivo).`] }],
      tips: [R`Con números complejos es más rápido: $Z = R + j(X_L - X_C)$, y la impedancia y la fase son el módulo y el argumento.`],
      see: ["f2a-reactancia", "f2a-resonancia", "f2a-potencia-ca"]
    },
    "f2a-resonancia": {
      title: "Resonancia en un circuito RLC", aliases: ["resonancia eléctrica", "frecuencia de resonancia", "factor de calidad"], concepts: ["f2a-rlc"],
      summary: "La corriente es máxima cuando X_L = X_C, en ω₀ = 1/√(LC). Ahí Z = R y la corriente está en fase. El factor de calidad Q = ω₀L/R mide lo agudo del pico.",
      def: [R`**Resonancia:** en $\omega_0 = \frac{1}{\sqrt{LC}}$ las reactancias se igualan, $Z = R$ es mínima, la corriente es máxima ($\frac VR$) y está en fase con la tensión.`,
        R`**Factor de calidad:** $Q = \frac{\omega_0L}{R}$. El ancho del pico de potencia, entre las frecuencias donde la potencia cae a la mitad, es $\Delta\omega = \frac{\omega_0}{Q} = \frac RL$.`],
      idea: [R`Es el mismo fenómeno que un [[f1-amortiguadas|oscilador forzado]]: el circuito LC oscila solo con frecuencia $\omega_0$, y si se lo excita justo a esa frecuencia, responde con todo. Así se sintoniza una radio: se varía $C$ hasta que $\omega_0$ coincida con la de la emisora.`],
      demo: [R`**Paso 1.** $I = \frac{V}{\sqrt{R^2 + (\omega L - \frac1{\omega C})^2}}$ es máxima cuando el denominador es mínimo, y como $R^2$ no depende de $\omega$, cuando $\omega L - \frac1{\omega C} = 0$.`,
        R`**Paso 2.** Despejando, $\omega^2 = \frac1{LC}$, o sea $\omega_0 = \frac1{\sqrt{LC}}$. Ahí $Z = R$ y $\tan\phi = 0$.`,
        R`**Paso 3 (ancho).** La potencia cae a la mitad cuando $(\omega L - \frac1{\omega C})^2 = R^2$. Las dos soluciones positivas cumplen $\omega L - \frac{1}{\omega C} = \pm R$; restándolas y usando que su producto es $\omega_0^2$, sale $\omega_2 - \omega_1 = \frac RL = \frac{\omega_0}{Q}$. $\blacksquare$`],
      examples: [{ q: R`$L = 100$ mH, $C = 10$ μF, $R = 10\ \Omega$.`, steps: [R`$\omega_0 = 1000$ rad/s ($f_0 \approx 159$ Hz) y $Q = \frac{1000\cdot0{,}1}{10} = 10$.`] }],
      tips: [R`En resonancia, $V_L = V_C = QV$: con $Q$ grande, sobre la bobina y el capacitor puede haber tensiones mucho mayores que la de la fuente.`],
      see: ["f2a-rlc", "f1-amortiguadas", "f2a-potencia-ca"]
    },
    "f2a-potencia-ca": {
      title: "Potencia en corriente alterna", aliases: ["factor de potencia", "potencia activa", "potencia en alterna", "potencia reactiva", "potencia aparente", "corrección del factor de potencia"], concepts: ["f2a-rlc"],
      summary: "Activa P = V_ef I_ef cos φ (W), reactiva Q = V_ef I_ef sen φ (var) y aparente S = V_ef I_ef (VA), con S² = P² + Q². Solo las resistencias consumen energía en promedio. cos φ es el factor de potencia.",
      def: [R`**Potencia media:** $P = V_{ef}I_{ef}\cos\phi$, con $\cos\phi$ el **factor de potencia**. En un RLC serie, $P = I_{ef}^2R$: la bobina y el capacitor, en promedio, no consumen.`,
        R`**Potencia reactiva:** $Q = V_{ef}I_{ef}\sin\phi$, en volt-amperes reactivos (var): la que va y viene entre la fuente y las bobinas o capacitores. Positiva en una carga inductiva ($Q = I_{ef}^2X_L$), negativa en una capacitiva. **Potencia aparente:** $S = V_{ef}I_{ef}$, en VA. Forman el **triángulo de potencias**: $S^2 = P^2 + Q^2$ y $\cos\phi = \frac PS$.`,
        R`Una carga con factor de potencia bajo necesita más corriente para la misma potencia, y eso aumenta las pérdidas en los cables. **Corrección:** se conecta un capacitor en paralelo, que aporta una reactiva $-\omega CV_{ef}^2$ sin cambiar $P$; para pasar de $\phi_1$ a $\phi_2$, $C = \frac{P(\tan\phi_1 - \tan\phi_2)}{\omega V_{ef}^2}$.`],
      idea: [R`En una bobina o un capacitor, la energía entra durante un cuarto de ciclo y sale en el siguiente: va y viene sin quedarse. Solo la componente de la corriente en fase con la tensión hace trabajo neto.`],
      demo: [R`**Paso 1.** Con $v = V_p\sin\omega t$ e $i = I_p\sin(\omega t - \phi)$, la potencia instantánea es $p = V_pI_p\sin\omega t\sin(\omega t - \phi)$.`,
        R`**Paso 2.** Por la identidad $\sin a\sin b = \frac12[\cos(a - b) - \cos(a + b)]$: $p = \frac{V_pI_p}{2}[\cos\phi - \cos(2\omega t - \phi)]$.`,
        R`**Paso 3.** El segundo término promedia cero en un período: $P = \frac{V_pI_p}{2}\cos\phi = V_{ef}I_{ef}\cos\phi$. En el RLC, $\cos\phi = \frac RZ$ y $V_{ef} = I_{ef}Z$, así que $P = I_{ef}^2R$.`,
        R`**Paso 4 (triángulo).** Descomponiendo el fasor de la corriente en una parte en fase con la tensión, $I\cos\phi$, y otra a $90°$, $I\sin\phi$: la primera da $P$, y la segunda, que solo intercambia energía, da $Q = V_{ef}I_{ef}\sin\phi$. Como $\cos^2\phi + \sin^2\phi = 1$, $P^2 + Q^2 = (V_{ef}I_{ef})^2 = S^2$.`,
        R`**Paso 5 (corrección).** En paralelo, el motor sigue con la misma tensión y la misma corriente, así que $P$ y su $Q_1 = P\tan\phi_1$ no cambian. El capacitor toma $I_C = \omega CV_{ef}$ adelantada $90°$, o sea una reactiva $-\omega CV_{ef}^2$. Para quedar con $Q_2 = P\tan\phi_2$ hace falta $\omega CV_{ef}^2 = P(\tan\phi_1 - \tan\phi_2)$. $\blacksquare$`],
      examples: [{ q: R`$220$ V, $5$ A y $\cos\phi = 0{,}8$.`, steps: [R`$P = 220\cdot5\cdot0{,}8 = 880$ W.`] }],
      tips: [R`No mezcles unidades: $P$ en W, $Q$ en var y $S$ en VA. Las compañías eléctricas dimensionan cables y transformadores por $S$, no por $P$.`],
      see: ["f2a-rlc", "f2a-ca", "f2a-potencia-electrica"]
    },
    "f2a-transformador": {
      title: "Transformador", aliases: ["transformador", "relación de transformación"], concepts: ["f2a-rlc"],
      summary: "Dos bobinas en un mismo núcleo: V₂/V₁ = N₂/N₁. Si es ideal, la potencia se conserva: V₁I₁ = V₂I₂, así que las corrientes van al revés: I₂/I₁ = N₁/N₂.",
      def: [R`**Transformador ideal:** dos bobinas de $N_1$ y $N_2$ vueltas en un núcleo de hierro que conduce todo el flujo, sin pérdidas. $\frac{V_2}{V_1} = \frac{N_2}{N_1}$ y $\frac{I_2}{I_1} = \frac{N_1}{N_2}$.`,
        R`Solo funciona con corriente alterna: con continua el flujo no cambia y no hay fem inducida. Se usa para elevar la tensión antes del transporte (menos corriente, menos pérdidas $I^2R$ en las líneas) y bajarla para el consumo.`],
      idea: [R`El flujo variable es el mismo en las dos bobinas, así que la fem por vuelta también: cada bobina tiene una tensión proporcional a sus vueltas. Lo que se gana en tensión se pierde en corriente.`],
      demo: [R`**Paso 1.** El núcleo hace que el flujo $\Phi$ por cada vuelta sea el mismo en las dos bobinas. Por la [[f2a-faraday|ley de Faraday]], $v_1 = N_1\frac{d\Phi}{dt}$ y $v_2 = N_2\frac{d\Phi}{dt}$.`,
        R`**Paso 2.** Dividiendo, $\frac{v_2}{v_1} = \frac{N_2}{N_1}$ en todo instante, y lo mismo para los valores eficaces.`,
        R`**Paso 3.** Sin pérdidas, la potencia que entra es la que sale: $V_1I_1 = V_2I_2$, de donde $\frac{I_2}{I_1} = \frac{V_1}{V_2} = \frac{N_1}{N_2}$. $\blacksquare$`],
      examples: [{ q: R`De $220$ V a $12$ V con $1100$ vueltas en el primario.`, steps: [R`$N_2 = 1100\cdot\frac{12}{220} = 60$ vueltas.`] }],
      tips: [R`Desde el primario, una carga $R$ en el secundario «se ve» como $R\left(\frac{N_1}{N_2}\right)^2$: los transformadores también sirven para adaptar impedancias.`],
      see: ["f2a-faraday", "f2a-inductancia", "f2a-potencia-ca"]
    }
  };

  E.extendCourse("f102a", {
    concepts: { "f2a-alterna": { name: "Corriente alterna" }, "f2a-rlc": { name: "Circuitos RLC" } },
    templates: T,
    units: [{
      id: "f2a-alterna-u", order: 9, program: "Unidad 9", title: "Corriente alterna", icon: "volume-2",
      diagnostic: ["f2a-eficaz-num", "f2a-reactancia-num", "f2a-rlc-num"],
      lessons: [
        { id: "f2a-alterna-l1", title: "Valores eficaces y reactancias", templates: ["f2a-eficaz-num", "f2a-reactancia-num", "f2a-fase-mc"], theory: ["f2a-ca", "f2a-reactancia"],
          intro: R`$V_{ef} = \frac{V_p}{\sqrt2}$, $X_L = \omega L$ y $X_C = \frac1{\omega C}$.` },
        { id: "f2a-alterna-l2", title: "RLC, resonancia y transformadores", templates: ["f2a-rlc-num", "f2a-resonancia-num", "f2a-transformador-num"], theory: ["f2a-rlc", "f2a-resonancia", "f2a-transformador"],
          intro: R`$Z = \sqrt{R^2 + (X_L - X_C)^2}$, resonancia en $\omega_0 = \frac1{\sqrt{LC}}$ y $\frac{V_2}{V_1} = \frac{N_2}{N_1}$.` },
        { id: "f2a-alterna-l3", title: "Potencia y circuitos en paralelo", templates: ["f2a-potencia-ca-num", "f2a-rlc-paralelo-num"], theory: ["f2a-potencia-ca", "f2a-rlc"],
          intro: R`$P = V_{ef}I_{ef}\cos\phi$, $Q = V_{ef}I_{ef}\sin\phi$ y $S^2 = P^2 + Q^2$; en paralelo se suman las corrientes como fasores.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  EXTRA UBA · ELECTROSTÁTICA AVANZADA: FORMA DIFERENCIAL, IMÁGENES Y MULTIPOLOS
 *  Temas de Física 3 de la Lic. en Cs. Físicas (FCEN, UBA) que no figuran en el programa de F102A.
 *  Solo se tomó la lista de temas; el texto y los ejercicios son originales.
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, F = E.f2a, nf = F.nf;
  const T = {};
  const K = R`k = 8{,}99\times10^9\ \text{N m}^2/\text{C}^2`;
  // laplaciano y divergencia por diferencias finitas
  const lap = (V, p, h = 1e-3) => [0, 1, 2].reduce((s, i) => { const a = p.slice(), b = p.slice(); a[i] += h; b[i] -= h; return s + (V(a) - 2 * V(p) + V(b)) / (h * h); }, 0);
  const div = (Fv, p, h = 1e-4) => [0, 1, 2].reduce((s, i) => { const a = p.slice(), b = p.slice(); a[i] += h; b[i] -= h; return s + (Fv(a)[i] - Fv(b)[i]) / (2 * h); }, 0);
  const curl = (Fv, p, h = 1e-4) => { const d = (i, j) => { const a = p.slice(), b = p.slice(); a[j] += h; b[j] -= h; return (Fv(a)[i] - Fv(b)[i]) / (2 * h); }; return [d(2, 1) - d(1, 2), d(0, 2) - d(2, 0), d(1, 0) - d(0, 1)]; };
  const P0 = [0.37, -0.81, 0.53];

  T["f2a-poisson-num"] = {
    type: "numeric", concepts: ["f2a-forma-diferencial"], difficulty: 2,
    generate(r) {
      const [a, b, c] = [r.nz(-9, 9) * 5, r.nz(-9, 9) * 5, r.nz(-9, 9) * 5], v = r.pick(["V", "E"]);
      if (a + b + c === 0) return null;
      const terms = H.poly([[a, "x^{2}"], [b, "y^{2}"], [c, "z^{2}"]]), Eterms = `(${a}x,\\ ${b}y,\\ ${c}z)`;
      // en kV y metros: ρ = −ε₀∇²V o ρ = ε₀∇·E, pasado a nC/m³
      const rho = v === "V" ? -F.e0 * 2 * (a + b + c) * 1e3 * 1e9 : F.e0 * (a + b + c) * 1e3 * 1e9;
      return {
        prompt: v === "V" ? `En una región, el potencial electrostático es $V = ${terms}$ (en kV, con $x, y, z$ en metros). ¿Cuánto vale la densidad de carga (en nC/m³)? ($\\varepsilon_0 = 8{,}854\\times10^{-12}$ F/m)`
          : `En una región, el campo eléctrico es $\\vec E = ${Eterms}$ (en kV/m, con $x, y, z$ en metros). ¿Cuánto vale la densidad de carga (en nC/m³)? ($\\varepsilon_0 = 8{,}854\\times10^{-12}$ F/m)`,
        answer: rho,
        solution: v === "V"
          ? [`[[f2a-forma-diferencial|Ecuación de Poisson]]: $\\nabla^2V = -\\frac{\\rho}{\\varepsilon_0}$.`, `$\\nabla^2V = 2(${a}) + 2(${b}) + 2(${c}) = ${2 * (a + b + c)}$ kV/m².`, `$\\rho = -\\varepsilon_0\\nabla^2V = -8{,}854\\times10^{-12}\\cdot${2 * (a + b + c)}\\times10^3 \\approx ${nf(rho)}$ nC/m³.`]
          : [`[[f2a-forma-diferencial|Ley de Gauss en forma diferencial]]: $\\nabla\\cdot\\vec E = \\frac{\\rho}{\\varepsilon_0}$.`, `$\\nabla\\cdot\\vec E = ${a} + ${b} + ${c} = ${a + b + c}$ kV/m².`.replace(/\+ -/g, "- "), `$\\rho = \\varepsilon_0\\nabla\\cdot\\vec E \\approx ${nf(rho)}$ nC/m³.`],
        // verificación: laplaciano o divergencia por diferencias finitas en un punto cualquiera
        verify: { kind: "value", tol: 1e-5, fn: () => (v === "V" ? -F.e0 * lap(p => 1e3 * (a * p[0] ** 2 + b * p[1] ** 2 + c * p[2] ** 2), P0) : F.e0 * div(p => [1e3 * a * p[0], 1e3 * b * p[1], 1e3 * c * p[2]], P0)) * 1e9 }
      };
    }
  };
  T["f2a-laplace-vf"] = {
    type: "tf", concepts: ["f2a-forma-diferencial"], difficulty: 2,
    generate(r) {
      const zero = r.bool(), a = r.nz(-6, 6), b = r.nz(-6, 6), c = zero ? -(a + b) : r.nz(-6, 6), d = r.int(-4, 4);
      if (!zero && a + b + c === 0) return null;
      if (c === 0) return null;
      return {
        prompt: `En cierta región el potencial es $V = ${H.poly([[a, "x^{2}"], [b, "y^{2}"], [c, "z^{2}"], [d, "xy"]])}$ (en V, con las coordenadas en metros). <b>Verdadero o falso:</b> en esa región no hay carga.`,
        answer: zero,
        explanation: `Sin carga, el potencial cumple la [[f2a-forma-diferencial|ecuación de Laplace]] $\\nabla^2V = 0$. Acá $\\nabla^2V = 2(${a}) + 2(${b}) + 2(${c}) = ${2 * (a + b + c)}$ V/m² (el término en $xy$ no aporta). ${zero ? "Da cero: no hay carga." : `No da cero: hay una densidad $\\rho = -\\varepsilon_0\\nabla^2V$.`}`,
        solution: [`Un potencial con $\\nabla^2V = 0$ no puede tener máximos ni mínimos dentro de la región: siempre "sube" en alguna dirección y "baja" en otra.`],
        verify: { kind: "truth", fn: () => Math.abs(lap(p => a * p[0] ** 2 + b * p[1] ** 2 + c * p[2] ** 2 + d * p[0] * p[1], P0)) < 1e-4 }
      };
    }
  };
  T["f2a-conservativo-mc"] = {
    type: "mc", concepts: ["f2a-forma-diferencial"], difficulty: 2,
    generate(r) {
      const a = r.nz(1, 5), s = r.pick(["", "-"]);
      const A = s === "-" ? -a : a, ta = `${s}${a === 1 ? "" : a}`;
      const good = [
        [`(2${ta === "-" ? "-" : ta}xy,\\ ${ta}x^2,\\ 0)`.replace("2-", "-2"), p => [2 * A * p[0] * p[1], A * p[0] ** 2, 0]],
        [`(${ta}yz,\\ ${ta}xz,\\ ${ta}xy)`, p => [A * p[1] * p[2], A * p[0] * p[2], A * p[0] * p[1]]],
        [`(${ta}y,\\ ${ta}x,\\ 0)`, p => [A * p[1], A * p[0], 0]]
      ];
      const bad = [
        [`(${ta}y,\\ ${s === "-" ? "" : "-"}${a === 1 ? "" : a}x,\\ 0)`, p => [A * p[1], -A * p[0], 0]],
        [`(${ta}xy,\\ ${ta}xy,\\ 0)`, p => [A * p[0] * p[1], A * p[0] * p[1], 0]],
        [`(${ta}y^2,\\ ${ta}x^2,\\ 0)`, p => [A * p[1] ** 2, A * p[0] ** 2, 0]],
        [`(${ta}z,\\ 0,\\ ${s === "-" ? "" : "-"}${a === 1 ? "" : a}x)`, p => [A * p[2], 0, -A * p[0]]]
      ];
      const g = r.pick(good), bs = r.sample(bad, 3);
      return {
        prompt: `¿Cuál de estos campos (con constantes en unidades del SI) **puede** ser un campo electrostático?`,
        ...H.mc(r, `\\vec E = ${g[0]}`, bs.map(b => `\\vec E = ${b[0]}`)),
        solution: [`Un campo electrostático es conservativo: $\\vec E = -\\nabla V$, así que su [[f2a-forma-diferencial|rotor]] es nulo, $\\nabla\\times\\vec E = 0$.`,
          `Solo $${g[0]}$ tiene rotor nulo en todo punto (es el gradiente de un potencial). Los otros tienen alguna componente del rotor distinta de cero.`],
        // verificación: rotor por diferencias finitas en varios puntos, nulo para la correcta y no nulo para las otras
        verify: { kind: "truth", target: true, fn: () => { const pts = [P0, [1.1, 0.4, -0.6], [-0.7, 1.3, 0.9]], n = f => Math.max(...pts.map(p => Math.hypot(...curl(f, p))));
          return n(g[1]) < 1e-6 && bs.every(b => n(b[1]) > 1e-3); } }
      };
    }
  };
  T["f2a-imagen-num"] = {
    type: "numeric", concepts: ["f2a-imagenes"], difficulty: 3,
    generate(r) {
      const v = r.pick(["plano-F", "plano-W", "esfera-q", "esfera-F"]), q = r.int(1, 20), Q = q * 1e-9;
      if (v.startsWith("plano")) {
        const d = r.int(1, 10) / 100, Fz = F.k * Q * Q / (4 * d * d), W = F.k * Q * Q / (4 * d);
        return { prompt: `Una carga de $${q}$ nC está a $${dn2(d * 100)}$ cm de un plano conductor infinito conectado a tierra. ¿${v === "plano-F" ? "Con qué fuerza (N) la atrae el plano" : "Qué trabajo (J) hay que hacer para alejarla hasta el infinito"}? ($${K}$)`, answer: v === "plano-F" ? Fz : W,
          solution: [`[[f2a-imagenes|Método de imágenes]]: el potencial en la región de la carga es el de la carga más una **carga imagen** $-q$ a la misma distancia del otro lado del plano. Así $V = 0$ sobre el plano y se cumple Poisson afuera.`,
            v === "plano-F" ? `La fuerza es la de la imagen, a distancia $2d$: $F = \\frac{kq^2}{(2d)^2} \\approx ${nf(Fz)}$ N.` : `La fuerza a distancia $x$ es $\\frac{kq^2}{4x^2}$; integrando de $d$ a $\\infty$: $W = \\frac{kq^2}{4d} \\approx ${nf(W)}$ J. Es la **mitad** de la energía de dos cargas reales a $2d$: la imagen no es una carga real y se mueve con ella.`],
          // verificación: se integra la atracción de la carga inducida sobre el plano, σ(r) = −qd/(2π(r² + d²)^{3/2}), anillo por anillo
          verify: v === "plano-F"
            ? { kind: "integral", f: rr => F.k * Q * (Q * d / (2 * Math.PI * (rr * rr + d * d) ** 1.5)) * 2 * Math.PI * rr * d / (rr * rr + d * d) ** 1.5, a: 0, inf: true, tol: 1e-5 }
            // trabajo = −½ q V_inducido en la posición de la carga, con V_inducido sumando kσ dA/distancia sobre el plano
            : { kind: "integral", f: rr => 0.5 * F.k * Q * (Q * d / (2 * Math.PI * (rr * rr + d * d) ** 1.5)) * 2 * Math.PI * rr / Math.sqrt(rr * rr + d * d), a: 0, inf: true, tol: 1e-5 } };
      }
      const a = r.int(2, 10) / 100, D = a * r.pick([1.5, 2, 2.5, 3, 4]), qi = -Q * a / D, b = a * a / D, Fz = F.k * Q * Q * a * D / (D * D - a * a) ** 2;
      return { prompt: `Una carga de $${q}$ nC está a $${dn2(D * 100)}$ cm del centro de una esfera conductora de radio $${dn2(a * 100)}$ cm conectada a tierra. ¿${v === "esfera-q" ? "Cuánto vale (en nC) la carga imagen que reemplaza a la esfera" : "Con qué fuerza (N) la esfera atrae a la carga"}? ($${K}$)`, answer: v === "esfera-q" ? qi * 1e9 : Fz,
        solution: [`[[f2a-imagenes|Imagen en una esfera a tierra]]: una carga $q' = -q\\frac aD$ en el punto a $b = \\frac{a^2}{D}$ del centro (sobre la recta que va hacia $q$) hace $V = 0$ en toda la superficie.`,
          `$q' = -${q}\\cdot\\frac{${dn2(a * 100)}}{${dn2(D * 100)}} \\approx ${nf(qi * 1e9)}$ nC, en $b \\approx ${dn2(b * 100)}$ cm.`,
          v === "esfera-F" ? `$F = \\frac{k|qq'|}{(D - b)^2} = \\frac{kq^2aD}{(D^2 - a^2)^2} \\approx ${nf(Fz)}$ N.` : `La carga total inducida en la esfera es $q'$ (no $-q$: parte de las líneas de campo se van al infinito).`],
        verify: v === "esfera-q"
          // verificación: con la imagen propuesta, el potencial se anula en puntos de la superficie de la esfera
          ? { kind: "zero", fn: ans => [0.3, 1.1, 2, 2.9].map(t => (F.k * Q / Math.hypot(a * Math.cos(t) - D, a * Math.sin(t)) + F.k * ans * 1e-9 / Math.hypot(a * Math.cos(t) - b, a * Math.sin(t))) / (F.k * Q / a)), tol: 1e-9 }
          // verificación: la fuerza como −dU/dD, con la energía de interacción U = ½ q V_inducido
          : { kind: "value", tol: 1e-5, fn: () => { const U = x => -0.5 * F.k * Q * Q * a / (x * x - a * a), h = 1e-7; return (U(D + h) - U(D - h)) / (2 * h); } } };
    }
  };
  const dn2 = x => String(+x.toFixed(2)).replace(".", "{,}");
  T["f2a-multipolo-num"] = {
    type: "numeric", concepts: ["f2a-multipolos"], difficulty: 2,
    generate(r) {
      const v = r.pick(["dipolo", "lejos", "cuadrupolo"]);
      if (v === "dipolo") {
        const z = r.distinct(3, -5, 5), q1 = r.nz(-5, 5), q2 = r.nz(-5, 5), q3 = -(q1 + q2);
        if (q3 === 0) return null;
        const p = q1 * z[0] + q2 * z[1] + q3 * z[2];
        if (p === 0) return null;
        return { prompt: `Sobre el eje $z$ hay tres cargas: $${q1}$ nC en $z = ${z[0]}$ cm, $${q2}$ nC en $z = ${z[1]}$ cm y $${q3}$ nC en $z = ${z[2]}$ cm. ¿Cuánto vale su momento dipolar $p_z$ (en nC·cm)?`, answer: p,
          solution: [`La carga total es $0$, así que lejos domina el término **dipolar** del [[f2a-multipolos|desarrollo multipolar]], y $\\vec p = \\sum q_i\\vec r_i$ no depende del origen.`,
            `$p_z = ${q1}\\cdot${z[0]} + ${q2}\\cdot${z[1]} + ${q3}\\cdot${z[2]} = ${p}$ nC·cm.`.replace(/\+ -/g, "+ (-").replace(/\(-(\d+)\\cdot/g, "(-$1)\\cdot")],
          // verificación: potencial exacto lejos sobre el eje, en +r y en −r; la semidiferencia por r²/k cancela el cuadrupolo
          verify: { kind: "value", tol: 1e-5, fn: () => { const rr = 1e5, V = s => [[q1, z[0]], [q2, z[1]], [q3, z[2]]].reduce((acc, [q, zz]) => acc + q / Math.abs(s * rr - zz), 0); return (V(1) - V(-1)) / 2 * rr * rr; } } };
      }
      if (v === "lejos") {
        const q1 = r.nz(-5, 5), q2 = r.nz(-5, 5), d = r.int(2, 10), rr = r.pick([10, 20, 50, 100]), Q = (q1 + q2) * 1e-9, p = (q1 - q2) * 1e-9 * d / 100;
        if (q1 + q2 === 0) return null;
        const Vap = F.k * Q / rr + F.k * p / (rr * rr);
        return { prompt: `Hay $${q1}$ nC en $z = ${d}$ cm y $${q2}$ nC en $z = -${d}$ cm. Usando los términos monopolar y dipolar, ¿cuánto vale el potencial (V) en el punto $z = ${rr}$ m del eje? ($${K}$)`, answer: Vap,
          solution: [`[[f2a-multipolos|Desarrollo multipolar]] lejos: $V \\approx \\frac{kQ}{r} + \\frac{kp\\cos\\theta}{r^2}$, con $Q = ${q1 + q2}$ nC y $p = \\sum q_iz_i = ${nf((q1 - q2) * d)}$ nC·cm.`,
            `Sobre el eje ($\\theta = 0$): $V \\approx ${nf(F.k * Q / rr)} + ${nf(F.k * p / (rr * rr))} \\approx ${nf(Vap)}$ V.`.replace("+ -", "- ")],
          // verificación: potencial exacto de las dos cargas (la diferencia es del orden del cuadrupolo, (d/r)²)
          verify: { kind: "value", tol: 5e-4, fn: () => F.k * (q1 * 1e-9 / (rr - d / 100) + q2 * 1e-9 / (rr + d / 100)) } };
      }
      const q = r.nz(1, 9), d = r.int(1, 5), rr = r.pick([1, 2, 5, 10]), Vq = 2 * F.k * q * 1e-9 * (d / 100) ** 2 / rr ** 3;
      return { prompt: `Un cuadrupolo lineal tiene $${q}$ nC en $z = \\pm${d}$ cm y $-${2 * q}$ nC en el origen. ¿Cuánto vale aproximadamente el potencial (V) en el punto $z = ${rr}$ m del eje? ($${K}$)`, answer: Vq,
        solution: [`Carga total y momento dipolar son nulos: el primer término que sobrevive es el **cuadrupolar** ([[f2a-multipolos]]), que cae como $\\frac{1}{r^3}$.`,
          `Sobre el eje: $V \\approx \\frac{2kqd^2}{r^3} = \\frac{2\\cdot8{,}99\\times10^9\\cdot${q}\\times10^{-9}\\cdot(${dn2(d / 100)})^2}{${rr}^3} \\approx ${nf(Vq)}$ V.`],
        verify: { kind: "value", tol: 1e-3, fn: () => F.k * q * 1e-9 * (1 / (rr - d / 100) + 1 / (rr + d / 100) - 2 / rr) } };
    }
  };

  const cards = {
    "f2a-forma-diferencial": {
      title: "Forma diferencial: divergencia, rotor, Poisson y Laplace", aliases: ["ecuación de Poisson", "ecuación de Laplace", "ley de Gauss en forma diferencial", "forma diferencial de las ecuaciones de Maxwell", "teorema de Earnshaw"], concepts: ["f2a-forma-diferencial"],
      summary: "∇·E = ρ/ε₀ y ∇×E = 0 en electrostática. Con E = −∇V: ∇²V = −ρ/ε₀ (Poisson); sin carga, ∇²V = 0 (Laplace).",
      def: [R`**Ley de Gauss en forma diferencial:** $\nabla\cdot\vec E = \frac{\rho}{\varepsilon_0}$. Vale punto a punto; integrándola en un volumen y usando el teorema de la divergencia se recupera la [[f2a-gauss|ley de Gauss]].`,
        R`**Campo conservativo:** en electrostática $\nabla\times\vec E = 0$, que es equivalente a que exista un potencial con $\vec E = -\nabla V$.`,
        R`**Ecuación de Poisson:** reemplazando, $\nabla^2V = -\frac{\rho}{\varepsilon_0}$, con $\nabla^2V = \frac{\partial^2V}{\partial x^2} + \frac{\partial^2V}{\partial y^2} + \frac{\partial^2V}{\partial z^2}$. Sin carga queda la **ecuación de Laplace**, $\nabla^2V = 0$.`,
        R`**Las cuatro ecuaciones de Maxwell en forma diferencial:** $\nabla\cdot\vec E = \frac{\rho}{\varepsilon_0}$, $\nabla\cdot\vec B = 0$, $\nabla\times\vec E = -\frac{\partial\vec B}{\partial t}$, $\nabla\times\vec B = \mu_0\vec J + \mu_0\varepsilon_0\frac{\partial\vec E}{\partial t}$.`],
      idea: [R`La divergencia mide cuánto "sale" el campo de un punto (fuentes y sumideros: las cargas); el rotor, cuánto "gira" alrededor. Un campo electrostático sale de las cargas positivas y no gira nunca.`,
        R`**Earnshaw:** una solución de Laplace no tiene máximos ni mínimos en el interior (cada punto es el promedio de su entorno). Por eso no se puede atrapar una carga en equilibrio estable solo con campos electrostáticos.`,
        R`Con Poisson y las condiciones de borde, el potencial queda **determinado de forma única** (teorema de unicidad). Eso es lo que justifica el [[f2a-imagenes|método de imágenes]].`],
      demo: [R`**Paso 1 (Gauss en un cubito).** Aplicamos la ley de Gauss a un cubito de lados $dx, dy, dz$. Por las dos caras perpendiculares a $x$ el flujo neto es $[E_x(x + dx) - E_x(x)]\,dy\,dz \approx \frac{\partial E_x}{\partial x}dx\,dy\,dz$.`,
        R`**Paso 2 (sumar las tres direcciones).** El flujo total es $\left(\frac{\partial E_x}{\partial x} + \frac{\partial E_y}{\partial y} + \frac{\partial E_z}{\partial z}\right)dV = (\nabla\cdot\vec E)\,dV$, y la carga encerrada es $\rho\,dV$.`,
        R`**Paso 3 (Gauss).** Igualando flujo y $\frac{q_{enc}}{\varepsilon_0}$ y dividiendo por $dV$: $\nabla\cdot\vec E = \frac{\rho}{\varepsilon_0}$.`,
        R`**Paso 4 (Poisson).** Con $\vec E = -\nabla V$, la divergencia del gradiente es el laplaciano: $\nabla\cdot(-\nabla V) = -\nabla^2V = \frac{\rho}{\varepsilon_0}$. $\blacksquare$`],
      examples: [{ q: R`¿Qué densidad de carga produce $V = 3x^2$ kV (x en m)?`, steps: [R`$\nabla^2V = 6$ kV/m², así que $\rho = -\varepsilon_0\cdot6000 \approx -5{,}3\times10^{-8}$ C/m³.`] }],
      see: ["f2a-gauss", "f2a-gradiente-potencial", "f2a-imagenes", "f2a-maxwell"]
    },
    "f2a-imagenes": {
      title: "Método de imágenes", aliases: ["método de imágenes", "carga imagen", "cargas imagen"], concepts: ["f2a-imagenes"],
      summary: "Se reemplaza un conductor por cargas ficticias fuera de la región que reproducen sus condiciones de borde. Plano a tierra: imagen −q simétrica. Esfera a tierra: −qa/D en a²/D.",
      def: [R`Por el teorema de unicidad, si encontramos un potencial que cumple Poisson en una región y las condiciones de borde, es **el** potencial. El método de imágenes lo arma con cargas puntuales ficticias ubicadas **fuera** de la región.`,
        R`**Plano conductor a tierra:** una carga $q$ a distancia $d$ ve el mismo campo que si el plano se reemplazara por una carga $-q$ en el punto simétrico. La carga inducida en el plano es $\sigma(r) = -\frac{qd}{2\pi(r^2 + d^2)^{3/2}}$, que suma $-q$, y la fuerza es $\frac{kq^2}{4d^2}$.`,
        R`**Esfera conductora a tierra** de radio $a$, con $q$ a distancia $D$ del centro: la imagen es $q' = -q\frac aD$, a distancia $b = \frac{a^2}{D}$ del centro.`],
      idea: [R`La carga imagen no existe: es un truco para obtener el campo en la región física. Del lado del conductor, el campo real es otro (adentro de un conductor es cero).`,
        R`La energía para alejar una carga de un plano es la **mitad** de la de dos cargas reales a distancia $2d$, porque la imagen se mueve junto con la carga y el campo solo existe de un lado.`],
      demo: [R`**Paso 1 (plano: proponer).** Ponemos $q$ en $(0, 0, d)$ y una imagen $-q$ en $(0, 0, -d)$. Para $z > 0$ el potencial $V = \frac{kq}{|\vec r - d\hat z|} - \frac{kq}{|\vec r + d\hat z|}$ cumple Poisson, porque la imagen está fuera de esa región.`,
        R`**Paso 2 (plano: borde).** En $z = 0$ las dos distancias son iguales y $V = 0$, como el plano a tierra. Por unicidad, es el potencial correcto.`,
        R`**Paso 3 (esfera).** Para la esfera, pedimos que $\frac{q}{|\vec r - D\hat z|} + \frac{q'}{|\vec r - b\hat z|} = 0$ en $|\vec r| = a$. En los dos puntos del eje ($z = \pm a$): $\frac{q}{D - a} = -\frac{q'}{a - b}$ y $\frac{q}{D + a} = -\frac{q'}{a + b}$.`,
        R`**Paso 4 (resolver).** Dividiendo las dos ecuaciones: $\frac{D + a}{D - a} = \frac{a + b}{a - b}$, de donde $b = \frac{a^2}{D}$; y reemplazando, $q' = -q\frac aD$. Se comprueba que con esos valores $V = 0$ en toda la esfera. $\blacksquare$`],
      examples: [{ q: R`Una carga de 10 nC a 5 cm de un plano a tierra. ¿Fuerza?`, steps: [R`$F = \frac{kq^2}{(2d)^2} = \frac{8{,}99\times10^9\cdot10^{-16}}{0{,}01} \approx 9\times10^{-5}$ N.`] }],
      see: ["f2a-conductores", "f2a-forma-diferencial"]
    },
    "f2a-multipolos": {
      title: "Desarrollo multipolar", aliases: ["desarrollo multipolar", "cuadrupolo", "momento cuadrupolar", "potencial lejano"], concepts: ["f2a-multipolos"],
      summary: "Lejos de una distribución: V ≈ kQ/r + kp cos θ/r² + … El primer término no nulo domina: monopolo (1/r), dipolo (1/r²), cuadrupolo (1/r³).",
      def: [R`Para una distribución de cargas cerca del origen, a distancias $r$ mucho mayores que su tamaño: $$V(\vec r) \approx \frac{kQ}{r} + \frac{k\,\vec p\cdot\hat r}{r^2} + \frac{k\,Q_{zz}(3\cos^2\theta - 1)}{4r^3} + \dots$$`,
        R`**Monopolo:** $Q = \sum q_i$. **Momento dipolar:** $\vec p = \sum q_i\vec r_i$; no depende del origen si $Q = 0$. **Cuadrupolo** (eje $z$): $Q_{zz} = \sum q_i(3z_i^2 - r_i^2)$.`,
        R`Lejos, manda el primer término no nulo: si $Q \ne 0$, todo se ve como una carga puntual; si $Q = 0$ y $\vec p \ne 0$, como un dipolo; si los dos se anulan, como un cuadrupolo.`],
      idea: [R`Un átomo neutro no atrae con $\frac{1}{r^2}$, pero si se polariza aparece un dipolo, y por eso las moléculas neutras se atraen con fuerzas de corto alcance (van der Waals).`,
        R`El núcleo de muchos átomos es un cuadrupolo eléctrico (no es una esfera perfecta), y eso se mide en los corrimientos de las líneas espectrales.`],
      demo: [R`**Paso 1 (distancia a una carga).** Para una carga en $\vec r_i$, $|\vec r - \vec r_i| = r\sqrt{1 - 2\frac{\vec r_i\cdot\hat r}{r} + \frac{r_i^2}{r^2}}$.`,
        R`**Paso 2 (desarrollar).** Con $(1 + \varepsilon)^{-1/2} \approx 1 - \frac\varepsilon2 + \frac38\varepsilon^2$ y quedándonos con los términos hasta $\frac{1}{r^2}$: $\frac{1}{|\vec r - \vec r_i|} \approx \frac1r + \frac{\vec r_i\cdot\hat r}{r^2} + O\left(\frac{1}{r^3}\right)$.`,
        R`**Paso 3 (sumar).** Multiplicando por $kq_i$ y sumando: $V \approx \frac{k\sum q_i}{r} + \frac{k(\sum q_i\vec r_i)\cdot\hat r}{r^2} = \frac{kQ}{r} + \frac{k\,\vec p\cdot\hat r}{r^2}$.`,
        R`**Paso 4 (el cuadrupolo lineal).** Con $q$ en $\pm d$ y $-2q$ en el origen, $Q = 0$ y $p = 0$. Sobre el eje, $V = kq\left(\frac{1}{r - d} + \frac{1}{r + d} - \frac2r\right) = \frac{2kqd^2}{r(r^2 - d^2)} \approx \frac{2kqd^2}{r^3}$. $\blacksquare$`],
      examples: [{ q: R`Dos cargas $+q$ y $-q$ separadas 2 mm. ¿Cómo cae el potencial lejos?`, steps: [R`$Q = 0$, $p = q\cdot2$ mm: $V \approx \frac{kp\cos\theta}{r^2}$, como $\frac{1}{r^2}$.`] }],
      see: ["f2a-campo-electrico", "f2a-potencial"]
    }
  };

  E.extendCourse("f102a", {
    concepts: { "f2a-forma-diferencial": { name: "Forma diferencial y Poisson" }, "f2a-imagenes": { name: "Método de imágenes" }, "f2a-multipolos": { name: "Desarrollo multipolar" } },
    templates: T,
    units: [{
      id: "f2a-electrostatica-ext-u", order: 10, program: "Extra UBA", title: "Electrostática avanzada", icon: "zap",
      diagnostic: ["f2a-poisson-num", "f2a-imagen-num", "f2a-multipolo-num"],
      lessons: [
        { id: "f2a-forma-diferencial", title: "Divergencia, rotor y Poisson", templates: ["f2a-poisson-num", "f2a-laplace-vf", "f2a-conservativo-mc"], theory: ["f2a-forma-diferencial"],
          intro: R`$\nabla\cdot\vec E = \rho/\varepsilon_0$, $\nabla\times\vec E = 0$, y con $\vec E = -\nabla V$: $\nabla^2V = -\rho/\varepsilon_0$.` },
        { id: "f2a-imagenes-multipolos", title: "Imágenes y multipolos", templates: ["f2a-imagen-num", "f2a-multipolo-num"], theory: ["f2a-imagenes", "f2a-multipolos"],
          intro: R`Plano a tierra: imagen $-q$ simétrica. Lejos: $V \approx \frac{kQ}{r} + \frac{kp\cos\theta}{r^2} + \dots$` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  EXTRA UBA · MEDIOS MATERIALES: P, D, M Y H
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, F = E.f2a, nf = F.nf;
  const T = {};
  const dn = (x, d = 3) => String(+x.toFixed(d)).replace(".", "{,}");

  // capacitor plano con dos dieléctricos en serie: se resuelve ∇·(ε∇V) = 0 en 1D por diferencias finitas (Thomas)
  const fd1d = (d1, d2, k1, k2, V0) => {
    const n1 = 400, n2 = 400, N = n1 + n2, h = i => (i < n1 ? d1 / n1 : d2 / n2), eps = i => (i < n1 ? k1 : k2); // celda i entre los nodos i e i+1
    const a = [], b = [], c = [], rhs = [];
    for (let j = 1; j < N; j++) { const gl = eps(j - 1) / h(j - 1), gr = eps(j) / h(j); a.push(-gl); b.push(gl + gr); c.push(-gr); rhs.push(j === 1 ? gl * V0 : 0); }
    for (let i = 1; i < b.length; i++) { const m = a[i] / b[i - 1]; b[i] -= m * c[i - 1]; rhs[i] -= m * rhs[i - 1]; }
    const V = new Array(N + 1).fill(0); V[0] = V0;
    for (let i = b.length - 1; i >= 0; i--) V[i + 1] = (rhs[i] - (i + 1 < b.length ? c[i] * V[i + 2] : 0)) / b[i];
    return { E1: (V[0] - V[n1]) / d1, E2: (V[n1] - V[N]) / d2 };
  };
  T["f2a-dielserie-num"] = {
    type: "numeric", concepts: ["f2a-medios-electricos"], difficulty: 2,
    generate(r) {
      const A = r.int(5, 50) * 10, d1 = r.int(1, 5), d2 = r.int(1, 5), k1 = r.pick([2, 3, 4, 5, 6]), k2 = r.pick([1, 2, 3, 4, 8]), V0 = r.pick([50, 100, 200, 500]), ask = r.pick(["C", "E1", "sb"]);
      if (k1 === k2) return null;
      const D = V0 / (d1 / k1 + d2 / k2) * 1e3 * F.e0, E1 = D / (F.e0 * k1), C = F.e0 * A * 1e-4 / ((d1 / k1 + d2 / k2) * 1e-3), sb = F.e0 * (k1 - 1) * E1;
      const ans = { C: C * 1e12, E1: E1 / 1e3, sb: sb * 1e9 }[ask];
      return {
        prompt: `Un capacitor plano de $${A}$ cm² tiene entre sus placas dos láminas dieléctricas apiladas: una de $${d1}$ mm con $\\kappa_1 = ${k1}$ y otra de $${d2}$ mm con $\\kappa_2 = ${k2}$. Se conecta a $${V0}$ V. ¿${{ C: "Cuál es su capacidad (pF)", E1: "Cuánto vale el campo eléctrico (kV/m) dentro de la primera lámina", sb: "Cuánto vale la densidad de carga de polarización (nC/m²) en la cara de la primera lámina que toca a la placa" }[ask]}? ($\\varepsilon_0 = 8{,}854\\times10^{-12}$ F/m)`,
        answer: ans,
        solution: [
          `[[f2a-medios-electricos|Ley de Gauss en medios]]: $\\vec D$ solo depende de la carga libre, así que vale lo mismo en las dos láminas: $D = \\sigma_{libre}$. En cada una, $E_i = \\frac{D}{\\kappa_i\\varepsilon_0}$.`,
          `La tensión es la suma: $V = E_1d_1 + E_2d_2 = \\frac{D}{\\varepsilon_0}\\left(\\frac{d_1}{\\kappa_1} + \\frac{d_2}{\\kappa_2}\\right)$, así que $D \\approx ${nf(D)}$ C/m².`,
          { C: `$C = \\frac{\\varepsilon_0A}{d_1/\\kappa_1 + d_2/\\kappa_2} \\approx ${nf(C * 1e12)}$ pF (dos capacitores en serie).`, E1: `$E_1 = \\frac{D}{\\kappa_1\\varepsilon_0} \\approx ${nf(E1 / 1e3)}$ kV/m.`, sb: `$P_1 = \\varepsilon_0(\\kappa_1 - 1)E_1$ y $\\sigma_b = \\vec P\\cdot\\hat n$: en esa cara $|\\sigma_b| = P_1 \\approx ${nf(sb * 1e9)}$ nC/m², de signo opuesto a la carga de la placa.` }[ask]
        ],
        // verificación: ecuación de Laplace en el medio, ∇·(ε∇V) = 0, resuelta numéricamente en 1D
        verify: { kind: "value", tol: 1e-6, fn: () => { const s = fd1d(d1 * 1e-3, d2 * 1e-3, k1, k2, V0); return { C: F.e0 * k1 * s.E1 * A * 1e-4 / V0 * 1e12, E1: s.E1 / 1e3, sb: F.e0 * (k1 - 1) * s.E1 * 1e9 }[ask]; } }
      };
    }
  };
  const ANG = [[0, "en el polo hacia donde apunta $\\vec P$"], [60, "a $60^\\circ$ de la dirección de $\\vec P$ (medido desde el centro)"], [90, "en el ecuador"], [120, "a $120^\\circ$ de la dirección de $\\vec P$ (medido desde el centro)"], [180, "en el polo opuesto a $\\vec P$"]];
  const SV = { 1: "P", 0.5: "\\frac P2", 0: "0", "-0.5": "-\\frac P2", "-1": "-P" };
  T["f2a-polsup-mc"] = {
    type: "mc", concepts: ["f2a-medios-electricos"], difficulty: 1,
    generate(r) {
      const [th, txt] = r.pick(ANG), cs = Math.round(Math.cos(th * Math.PI / 180) * 2) / 2, correct = SV[String(cs)];
      return {
        prompt: `Una esfera dieléctrica está polarizada uniformemente, con $\\vec P$ constante. ¿Cuánto vale la densidad superficial de carga de polarización ${txt}?`,
        ...H.mc(r, `\\sigma_b = ${correct}`, Object.values(SV).filter(s => s !== correct).map(s => `\\sigma_b = ${s}`)),
        solution: [`[[f2a-medios-electricos|Cargas de polarización]]: $\\sigma_b = \\vec P\\cdot\\hat n$ en la superficie y $\\rho_b = -\\nabla\\cdot\\vec P$ adentro (acá cero, porque $\\vec P$ es uniforme).`,
          `En la esfera $\\hat n$ es radial: $\\sigma_b = P\\cos\\theta$, con $\\theta = ${th}^\\circ$: $\\sigma_b = ${correct}$.`],
        // verificación: producto escalar de P con la normal exterior en ese punto
        verify: { kind: "truth", target: true, fn: () => { const t = th * Math.PI / 180, v = [Math.sin(t), 0, Math.cos(t)].reduce((s, x, i) => s + x * [0, 0, 1][i], 0); return SV[String(Math.round(v * 2) / 2)] === correct; } }
      };
    }
  };
  T["f2a-entrehierro-num"] = {
    type: "numeric", concepts: ["f2a-medios-magneticos"], difficulty: 3,
    generate(r) {
      const N = r.int(2, 10) * 100, I = r.int(1, 10) / 2, L = r.int(20, 60) / 100, g = r.int(1, 6) / 2000, mur = r.pick([500, 1000, 2000, 4000]), ask = r.pick(["B", "Hg", "I"]);
      const B = F.mu0 * N * I / ((L - g) / mur + g), Hg = B / F.mu0;
      if (ask === "I") {
        const Bt = r.pick([0.3, 0.5, 0.8, 1, 1.2]), It = Bt * ((L - g) / mur + g) / (F.mu0 * N);
        return { prompt: `Un toroide de hierro ($\\mu_r = ${mur}$) de $${dn(L * 100, 1)}$ cm de circunferencia media tiene un entrehierro de $${dn(g * 1000, 1)}$ mm y $${N}$ vueltas. ¿Qué corriente (A) hace falta para tener $B = ${dn(Bt, 1)}$ T en el entrehierro? ($\\mu_0 = 4\\pi\\times10^{-7}$ T m/A)`, answer: It,
          solution: [`[[f2a-medios-magneticos|Circuito magnético]]: $B$ es el mismo en el hierro y en el entrehierro (las líneas de $\\vec B$ no se cortan). Por Ampère con $\\vec H$: $H_{Fe}(L - g) + H_gg = NI$.`, `Con $H_{Fe} = \\frac{B}{\\mu_0\\mu_r}$ y $H_g = \\frac{B}{\\mu_0}$: $I = \\frac{B}{\\mu_0N}\\left(\\frac{L - g}{\\mu_r} + g\\right) \\approx ${nf(It)}$ A.`],
          verify: { kind: "zero", fn: x => { let s = 0; const n = 1000; for (let i = 0; i < n; i++) s += (Bt / (F.mu0 * mur)) * (L - g) / n; for (let i = 0; i < 50; i++) s += (Bt / F.mu0) * g / 50; return [(s - N * x) / (N * x)]; }, tol: 1e-9 } };
      }
      return { prompt: `Un toroide de hierro ($\\mu_r = ${mur}$) de $${dn(L * 100, 1)}$ cm de circunferencia media tiene un entrehierro de $${dn(g * 1000, 1)}$ mm. Está bobinado con $${N}$ vueltas por las que circulan $${dn(I, 1)}$ A. ¿${ask === "B" ? "Cuánto vale $B$ (T) en el entrehierro" : "Cuánto vale $H$ (kA/m) en el entrehierro"}? ($\\mu_0 = 4\\pi\\times10^{-7}$ T m/A)`, answer: ask === "B" ? B : Hg / 1e3,
        solution: [`[[f2a-medios-magneticos|Ampère para H]]: $\\oint\\vec H\\cdot d\\vec l = NI$ (solo cuenta la corriente libre). Como $B$ es el mismo en todo el circuito, $\\frac{B}{\\mu_0\\mu_r}(L - g) + \\frac{B}{\\mu_0}g = NI$.`,
          `$B = \\frac{\\mu_0NI}{(L - g)/\\mu_r + g} \\approx ${nf(B)}$ T. El entrehierro de ${String(+(g * 1000).toFixed(1)).replace(".", ",")} mm "pesa" ${String(+(g / ((L - g) / mur)).toFixed(1)).replace(".", ",")} veces más que todo el hierro.`,
          ask === "Hg" ? `$H_g = \\frac{B}{\\mu_0} \\approx ${nf(Hg / 1e3)}$ kA/m, mucho mayor que en el hierro.` : `Sin entrehierro sería $\\mu_0\\mu_rNI/L \\approx ${nf(F.mu0 * mur * N * I / L)}$ T (en la práctica, el hierro se satura antes).`],
        // verificación: circulación de H tramo a tramo (1000 tramos de hierro y 50 de aire) contra la corriente encerrada
        verify: { kind: "zero", fn: x => { const Bx = ask === "B" ? x : x * 1e3 * F.mu0; let s = 0; const n = 1000; for (let i = 0; i < n; i++) s += (Bx / (F.mu0 * mur)) * (L - g) / n; for (let i = 0; i < 50; i++) s += (Bx / F.mu0) * g / 50; return [(s - N * I) / (N * I)]; }, tol: 1e-9 } };
    }
  };
  T["f2a-nucleo-num"] = {
    type: "numeric", concepts: ["f2a-medios-magneticos"], difficulty: 2,
    generate(r) {
      const n = r.int(5, 40) * 100, I = r.int(1, 20) / 10, mur = r.pick([1.00002, 50, 200, 800, 1500]), ask = mur < 2 ? "B" : r.pick(["B", "M"]);
      const Hh = n * I, M = (mur - 1) * Hh, B = F.mu0 * mur * Hh;
      return {
        prompt: `Un solenoide largo de $${n}$ vueltas por metro, con $${dn(I, 1)}$ A, tiene un núcleo de permeabilidad relativa $\\mu_r = ${String(mur).replace(".", "{,}")}$ que lo llena. ¿Cuánto vale ${ask === "B" ? "$B$ (mT) adentro" : "la magnetización $M$ (kA/m) del núcleo"}? ($\\mu_0 = 4\\pi\\times10^{-7}$ T m/A)`,
        answer: ask === "B" ? B * 1e3 : M / 1e3,
        solution: [`[[f2a-medios-magneticos|Ampère con H]]: adentro $H = nI = ${Hh}$ A/m, sin importar el material.`,
          `Material lineal: $\\vec M = \\chi_m\\vec H$ con $\\chi_m = \\mu_r - 1$, y $\\vec B = \\mu_0(\\vec H + \\vec M) = \\mu_0\\mu_r\\vec H$.`,
          ask === "B" ? `$B = \\mu_0\\mu_rnI \\approx ${nf(B * 1e3)}$ mT.` : `$M = (\\mu_r - 1)nI \\approx ${nf(M / 1e3)}$ kA/m: equivale a una corriente superficial de magnetización $K_M = M$ sobre el núcleo.`],
        // verificación: B en el centro de un solenoide de largo 100R, sumando el campo de 4000 espiras con la corriente total
        // (libre más de magnetización); para M se despeja de esa B
        verify: { kind: "value", tol: 1e-3, fn: () => { const Rr = 0.01, Ls = 1, Kt = mur * Hh, nz = 4000; let s = 0;
          for (let j = 0; j < nz; j++) { const z = -Ls / 2 + (j + 0.5) * Ls / nz; s += F.mu0 * Kt * (Ls / nz) * Rr * Rr / (2 * (Rr * Rr + z * z) ** 1.5); }
          return ask === "B" ? s * 1e3 : (s / F.mu0 - Hh) / 1e3; } }
      };
    }
  };

  const cards = {
    "f2a-medios-electricos": {
      title: "Dieléctricos: polarización, D y cargas de polarización", aliases: ["vector polarización", "vector desplazamiento", "desplazamiento eléctrico", "ley de Gauss en medios", "susceptibilidad eléctrica", "cargas de polarización"], concepts: ["f2a-medios-electricos"],
      summary: "Un dieléctrico se polariza (P = dipolos por volumen) y aparecen σ_b = P·n̂ y ρ_b = −∇·P. Con D = ε₀E + P, Gauss queda ∮D·dA = q_libre.",
      def: [R`La **polarización** $\vec P$ es el momento dipolar por unidad de volumen. En un material lineal, $\vec P = \varepsilon_0\chi_e\vec E$, con $\kappa = 1 + \chi_e$ (ver [[f2a-dielectricos|dieléctricos]]).`,
        R`**Cargas de polarización:** $\sigma_b = \vec P\cdot\hat n$ en la superficie y $\rho_b = -\nabla\cdot\vec P$ en el volumen. Producen campo como cualquier carga.`,
        R`**Vector desplazamiento:** $\vec D = \varepsilon_0\vec E + \vec P$. La ley de Gauss en medios es $\oint\vec D\cdot d\vec A = q_{libre}$ (o $\nabla\cdot\vec D = \rho_{libre}$). En un medio lineal, $\vec D = \kappa\varepsilon_0\vec E$.`,
        R`**En una interfaz** sin carga libre: se conservan la componente normal de $\vec D$ y la tangencial de $\vec E$.`],
      idea: [R`$\vec D$ sirve porque depende solo de la carga que controlamos (la libre); la de polarización la "pone" el material. Con capas de dieléctricos apiladas, $D$ es el mismo en todas y $E$ es menor donde $\kappa$ es mayor.`],
      demo: [R`**Paso 1 (dipolos en una lámina).** Un bloque con $\vec P$ uniforme es un montón de dipolos alineados. Adentro, la punta $+$ de uno se cancela con la cola $-$ del siguiente; solo quedan sin compensar las cargas en las caras.`,
        R`**Paso 2 (cuánta carga queda).** En una cara de área $dA$, los dipolos con su carga a menos de $dl$ del borde aportan $P\,dA\cos\theta$ (con $\theta$ el ángulo entre $\vec P$ y la normal). Por unidad de área, $\sigma_b = \vec P\cdot\hat n$.`,
        R`**Paso 3 (si P varía).** Si $\vec P$ no es uniforme, lo que sale de un volumen no se compensa con lo que entra: queda $\rho_b = -\nabla\cdot\vec P$.`,
        R`**Paso 4 (Gauss en medios).** Gauss con toda la carga: $\varepsilon_0\nabla\cdot\vec E = \rho_{libre} + \rho_b = \rho_{libre} - \nabla\cdot\vec P$. Pasando de miembro, $\nabla\cdot(\varepsilon_0\vec E + \vec P) = \rho_{libre}$, o sea $\nabla\cdot\vec D = \rho_{libre}$. $\blacksquare$`],
      examples: [{ q: R`Una lámina con $\kappa = 4$ en un campo externo con $D = 2\ \mu$C/m². ¿$E$ y $\sigma_b$?`, steps: [R`$E = \frac{D}{4\varepsilon_0} \approx 5{,}6\times10^4$ V/m.`, R`$P = D - \varepsilon_0E = D\left(1 - \frac14\right) = 1{,}5\ \mu$C/m², y $|\sigma_b| = P$.`] }],
      see: ["f2a-dielectricos", "f2a-medios-magneticos", "f2a-forma-diferencial"]
    },
    "f2a-medios-magneticos": {
      title: "Magnetización, H y circuitos magnéticos", aliases: ["magnetización", "campo H", "intensidad magnética", "circuito magnético", "entrehierro", "corriente de magnetización", "susceptibilidad magnética"], concepts: ["f2a-medios-magneticos"],
      summary: "B = μ₀(H + M). Ampère para H solo cuenta corriente libre: ∮H·dl = I_libre. En un circuito magnético con entrehierro: B = μ₀NI/((L − g)/μᵣ + g).",
      def: [R`La **magnetización** $\vec M$ es el momento magnético por unidad de volumen. Equivale a corrientes de magnetización: $\vec J_M = \nabla\times\vec M$ y, en la superficie, $\vec K_M = \vec M\times\hat n$.`,
        R`**Campo H:** $\vec H = \frac{\vec B}{\mu_0} - \vec M$. La ley de Ampère queda $\oint\vec H\cdot d\vec l = I_{libre}$. En un material lineal, $\vec M = \chi_m\vec H$ y $\vec B = \mu_0\mu_r\vec H$, con $\mu_r = 1 + \chi_m$ (ver [[f2a-materiales-magneticos|materiales magnéticos]]).`,
        R`**Circuito magnético:** en un núcleo con entrehierro, $\vec B$ tiene el mismo flujo en todo el recorrido (porque $\nabla\cdot\vec B = 0$). Ampère con $\vec H$ da $\frac{B}{\mu_0\mu_r}(L - g) + \frac{B}{\mu_0}g = NI$.`],
      idea: [R`Es como un circuito de resistencias en serie: la "resistencia" (reluctancia) de cada tramo es $\frac{\ell}{\mu A}$. El hierro tiene $\mu$ enorme y conduce el flujo con poca reluctancia; un entrehierro de un milímetro puede pesar más que medio metro de hierro.`,
        R`Los transformadores y los motores tienen núcleos sin entrehierros (o muy chicos) justamente para necesitar poca corriente.`],
      demo: [R`**Paso 1 (Ampère con todas las corrientes).** $\nabla\times\vec B = \mu_0(\vec J_{libre} + \vec J_M)$, con $\vec J_M = \nabla\times\vec M$.`,
        R`**Paso 2 (definir H).** Pasando el término de magnetización: $\nabla\times\left(\frac{\vec B}{\mu_0} - \vec M\right) = \vec J_{libre}$, o sea $\nabla\times\vec H = \vec J_{libre}$; en forma integral, $\oint\vec H\cdot d\vec l = I_{libre}$.`,
        R`**Paso 3 (el toroide).** Por simetría, sobre la circunferencia media $H$ es constante en cada tramo. La corriente libre encerrada es $NI$: $H_{Fe}(L - g) + H_gg = NI$.`,
        R`**Paso 4 (mismo B).** El flujo de $\vec B$ se conserva y la sección es la misma, así que $B$ es igual en el hierro y en el aire. Con $H_{Fe} = \frac{B}{\mu_0\mu_r}$ y $H_g = \frac{B}{\mu_0}$ queda $B = \frac{\mu_0NI}{(L - g)/\mu_r + g}$. $\blacksquare$`],
      examples: [{ q: R`Toroide de hierro ($\mu_r = 1000$), $L = 50$ cm, entrehierro de 1 mm, 500 vueltas, 2 A. ¿B?`, steps: [R`$\frac{L - g}{\mu_r} + g \approx 0{,}0005 + 0{,}001 = 0{,}0015$ m.`, R`$B = \frac{4\pi\times10^{-7}\cdot1000}{0{,}0015} \approx 0{,}84$ T.`] }],
      see: ["f2a-materiales-magneticos", "f2a-ampere", "f2a-medios-electricos"]
    }
  };

  E.extendCourse("f102a", {
    concepts: { "f2a-medios-electricos": { name: "Dieléctricos: P y D" }, "f2a-medios-magneticos": { name: "Magnetización y H" } },
    templates: T,
    units: [{
      id: "f2a-medios-u", order: 11, program: "Extra UBA", title: "Medios materiales", icon: "atom",
      diagnostic: ["f2a-dielserie-num", "f2a-entrehierro-num", "f2a-nucleo-num"],
      lessons: [
        { id: "f2a-medios-electricos", title: "Polarización y D", templates: ["f2a-polsup-mc", "f2a-dielserie-num"], theory: ["f2a-medios-electricos"],
          intro: R`$\sigma_b = \vec P\cdot\hat n$, $\rho_b = -\nabla\cdot\vec P$. $\vec D = \varepsilon_0\vec E + \vec P$ y $\oint\vec D\cdot d\vec A = q_{libre}$.` },
        { id: "f2a-medios-magneticos", title: "Magnetización y H", templates: ["f2a-nucleo-num", "f2a-entrehierro-num"], theory: ["f2a-medios-magneticos"],
          intro: R`$\vec B = \mu_0(\vec H + \vec M)$, $\oint\vec H\cdot d\vec l = I_{libre}$. Con entrehierro: $B = \frac{\mu_0NI}{(L - g)/\mu_r + g}$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  EXTRA UBA · THÉVENIN, PUENTES Y FILTROS
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, F = E.f2a, nf = F.nf;
  const T = {};
  const dn = (x, d = 3) => String(+x.toFixed(d)).replace(".", "{,}");

  // circuito: fuente V – R1 – nodo A – R2 – tierra; A – R3 – nodo B – carga RL – tierra (análisis nodal)
  const nodal = (V, R1, R2, R3, RL) => F.solve([[1 / R1 + 1 / R2 + 1 / R3, -1 / R3], [-1 / R3, 1 / R3 + 1 / RL]], [V / R1, 0]);
  T["f2a-thevenin-num"] = {
    type: "numeric", concepts: ["f2a-thevenin"], difficulty: 2,
    generate(r) {
      const V = r.pick([6, 9, 12, 18, 24]), R1 = r.int(1, 10) * 10, R2 = r.int(1, 10) * 10, R3 = r.int(1, 10) * 5, RL = r.int(1, 20) * 10, ask = r.pick(["Vth", "Rth", "IL"]);
      const Vth = V * R2 / (R1 + R2), Rth = R3 + R1 * R2 / (R1 + R2), IL = Vth / (Rth + RL);
      return {
        prompt: `Una fuente de $${V}$ V alimenta un divisor: $R_1 = ${R1}\\ \\Omega$ desde la fuente hasta el nodo A, y $R_2 = ${R2}\\ \\Omega$ de A a tierra. Desde A sale $R_3 = ${R3}\\ \\Omega$ hasta el borne B; el otro borne es tierra. ${ask === "IL" ? `Si se conecta una carga de $${RL}\\ \\Omega$ entre B y tierra, ¿qué corriente (mA) circula por ella?` : `¿Cuánto vale ${ask === "Vth" ? "la tensión de Thévenin (V)" : "la resistencia de Thévenin (Ω)"} vista desde B?`}`,
        answer: { Vth, Rth, IL: IL * 1e3 }[ask],
        solution: [
          `[[f2a-thevenin|Thévenin]]: $V_{th}$ es la tensión entre B y tierra en circuito abierto. Por $R_3$ no circula corriente, así que es la del divisor: $V_{th} = V\\frac{R_2}{R_1 + R_2} = ${dn(Vth, 3)}$ V.`,
          `$R_{th}$: se apaga la fuente (cortocircuito) y se mira desde B: $R_3 + R_1\\parallel R_2 = ${R3} + ${dn(R1 * R2 / (R1 + R2), 3)} = ${dn(Rth, 3)}\\ \\Omega$.`,
          ask === "IL" ? `Con la carga: $I = \\frac{V_{th}}{R_{th} + R_L} \\approx ${dn(IL * 1e3, 3)}$ mA.` : `Cualquier carga que se conecte entre B y tierra ve lo mismo que una fuente $V_{th}$ en serie con $R_{th}$.`
        ],
        // verificación: análisis nodal del circuito completo (en vacío, en cortocircuito o con la carga)
        verify: { kind: "value", tol: 1e-6, fn: () => { if (ask === "IL") return nodal(V, R1, R2, R3, RL)[1] / RL * 1e3; const vo = nodal(V, R1, R2, R3, 1e12)[1], isc = nodal(V, R1, R2, R3, 1e-9)[1] / 1e-9; return ask === "Vth" ? vo : vo / isc; } }
      };
    }
  };
  T["f2a-wheatstone-num"] = {
    type: "numeric", concepts: ["f2a-thevenin"], difficulty: 2,
    generate(r) {
      const R1 = r.int(1, 20) * 10, R2 = r.int(1, 20) * 10, R3 = r.int(1, 20) * 10, Rx = R2 * R3 / R1;
      return {
        prompt: `En un puente de Wheatstone, una rama tiene $R_1 = ${R1}\\ \\Omega$ (arriba) y $R_2 = ${R2}\\ \\Omega$ (abajo); la otra, $R_3 = ${R3}\\ \\Omega$ (arriba) y la resistencia desconocida $R_x$ (abajo). El galvanómetro entre los puntos medios marca cero. ¿Cuánto vale $R_x$ (Ω)?`,
        answer: Rx,
        solution: [`[[f2a-thevenin|Puente de Wheatstone]] equilibrado: si no pasa corriente por el galvanómetro, los dos puntos medios están al mismo potencial, y cada rama es un divisor.`,
          `$\\frac{R_2}{R_1 + R_2} = \\frac{R_x}{R_3 + R_x} \\Rightarrow R_x = \\frac{R_2R_3}{R_1} = \\frac{${R2}\\cdot${R3}}{${R1}} = ${dn(Rx, 3)}\\ \\Omega$. No depende de la tensión de la fuente.`],
        // verificación: análisis nodal con un galvanómetro de 50 Ω entre los puntos medios; con R_x la corriente tiene que anularse
        verify: { kind: "zero", fn: x => { const g = 1 / 50, s = F.solve([[1 / R1 + 1 / R2 + g, -g], [-g, 1 / R3 + 1 / x + g]], [10 / R1, 10 / R3]); return [(s[0] - s[1]) * g / (10 / R1)]; }, tol: 1e-9 }
      };
    }
  };
  // filtro RC en régimen: se simula la ecuación del capacitor (τ = 1) con una entrada senoidal y se mide la amplitud de salida
  const rcGain = (wt, out) => { let vc = 0, t = 0, mx = 0; const P = 2 * Math.PI / wt, dt = Math.min(P / 400, 0.01), tEnd = 30 + 6 * P; const f = (tt, v) => Math.sin(wt * tt) - v;
    while (t < tEnd) { const k1 = f(t, vc), k2 = f(t + dt / 2, vc + dt / 2 * k1), k3 = f(t + dt / 2, vc + dt / 2 * k2), k4 = f(t + dt, vc + dt * k3); vc += dt / 6 * (k1 + 2 * k2 + 2 * k3 + k4); t += dt;
      if (t > tEnd - 2 * P) mx = Math.max(mx, Math.abs(out === "C" ? vc : Math.sin(wt * t) - vc)); } return mx; };
  T["f2a-filtro-num"] = {
    testN: 60, // simulación algo cara: menos instancias en los tests
    type: "numeric", concepts: ["f2a-filtros"], difficulty: 2,
    generate(r) {
      const Rk = r.pick([1, 2.2, 4.7, 10, 22]), Cn = r.pick([10, 22, 47, 100]), out = r.pick(["C", "R"]), ask = r.pick(["fc", "H", "dB"]), RC = Rk * 1e3 * Cn * 1e-9, fc = 1 / (2 * Math.PI * RC);
      const ratio = r.pick([0.25, 0.5, 2, 3, 5]), f = ratio * fc, Hm = out === "C" ? 1 / Math.sqrt(1 + ratio * ratio) : ratio / Math.sqrt(1 + ratio * ratio);
      const fTxt = Math.round(f);
      const Hx = out === "C" ? 1 / Math.sqrt(1 + (fTxt / fc) ** 2) : (fTxt / fc) / Math.sqrt(1 + (fTxt / fc) ** 2);
      return {
        prompt: `Un filtro RC tiene $R = ${String(Rk).replace(".", "{,}")}$ kΩ y $C = ${Cn}$ nF, con la salida tomada sobre ${out === "C" ? "el capacitor" : "la resistencia"}. ${ask === "fc" ? "¿Cuál es su frecuencia de corte (Hz)?" : `Para una entrada senoidal de $${fTxt}$ Hz, ¿cuánto vale ${ask === "H" ? "el cociente de amplitudes $V_{sal}/V_{ent}$" : "la ganancia en decibeles, $20\\log_{10}(V_{sal}/V_{ent})$"}?`}`,
        answer: ask === "fc" ? fc : ask === "H" ? Hx : 20 * Math.log10(Hx),
        solution: [
          `Es un [[f2a-filtros|filtro pasa-${out === "C" ? "bajos" : "altos"}]]: con la salida en ${out === "C" ? "el capacitor, a alta frecuencia $X_C \\to 0$ y la salida se apaga" : "la resistencia, a baja frecuencia el capacitor no deja pasar corriente"}.`,
          `Frecuencia de corte: $f_c = \\frac{1}{2\\pi RC} \\approx ${dn(fc, 1)}$ Hz.`,
          ask === "fc" ? `Ahí $|H| = \\frac{1}{\\sqrt2}$ (−3 dB): la potencia de salida es la mitad.` : `$|H| = ${out === "C" ? "\\frac{1}{\\sqrt{1 + (f/f_c)^2}}" : "\\frac{f/f_c}{\\sqrt{1 + (f/f_c)^2}}"} \\approx ${dn(Hx, 4)}$${ask === "dB" ? `, o sea $${dn(20 * Math.log10(Hx), 2)}$ dB` : ""}.`
        ],
        // verificación: circuito simulado en el tiempo (RK4) con entrada senoidal hasta el régimen; se mide la amplitud
        verify: ask === "fc"
          ? { kind: "zero", fn: x => [rcGain(2 * Math.PI * x * RC, out) - Math.SQRT1_2], tol: 2e-4 }
          : { kind: "value", tol: ask === "H" ? 2e-4 : 2e-3, fn: () => { const gn = rcGain(2 * Math.PI * fTxt * RC, out); return ask === "H" ? gn : 20 * Math.log10(gn); } }
      };
    }
  };
  T["f2a-filtro-vf"] = {
    testN: 60, // simulación algo cara: menos instancias en los tests
    type: "tf", concepts: ["f2a-filtros"], difficulty: 1,
    generate(r) {
      const out = r.pick(["C", "R"]), lo = r.bool(), ratio = lo ? r.pick([0.02, 0.05]) : r.pick([20, 50]), Rk = r.pick([1, 10]), Cn = r.pick([10, 100]);
      const fc = 1 / (2 * Math.PI * Rk * 1e3 * Cn * 1e-9), f = Math.round(ratio * fc), pass = out === "C" ? lo : !lo;
      return {
        prompt: `Un filtro RC con $R = ${Rk}$ kΩ y $C = ${Cn}$ nF tiene la salida sobre ${out === "C" ? "el capacitor" : "la resistencia"}. <b>Verdadero o falso:</b> una señal de $${f}$ Hz sale prácticamente sin atenuar (más del 95 % de la amplitud).`,
        answer: pass,
        explanation: `$f_c = \\frac{1}{2\\pi RC} \\approx ${dn(fc, 0)}$ Hz y la señal está ${lo ? "muy por debajo" : "muy por encima"} de $f_c$. Con la salida en ${out === "C" ? "el capacitor es un pasa-bajos" : "la resistencia es un pasa-altos"} ([[f2a-filtros]]), así que ${pass ? "**pasa** casi entera" : "queda **muy atenuada**"}.`,
        solution: [`Lejos de la frecuencia de corte, un RC deja pasar todo o casi nada, según de qué lado esté la señal.`],
        verify: { kind: "truth", fn: () => rcGain(2 * Math.PI * f * Rk * 1e3 * Cn * 1e-9, out) > 0.95 }
      };
    }
  };
  T["f2a-pasabanda-num"] = {
    type: "numeric", concepts: ["f2a-filtros"], difficulty: 3,
    generate(r) {
      const Rr = r.pick([5, 10, 20, 50, 100]), Lm = r.pick([1, 2, 5, 10, 20]), Cn = r.pick([10, 47, 100, 220]), ask = r.pick(["df", "Q"]);
      const L = Lm * 1e-3, C = Cn * 1e-9, f0 = 1 / (2 * Math.PI * Math.sqrt(L * C)), df = Rr / (2 * Math.PI * L), Q = f0 / df;
      if (Q < 1.5) return null;
      return {
        prompt: `Un RLC serie con $R = ${Rr}\\ \\Omega$, $L = ${Lm}$ mH y $C = ${Cn}$ nF se usa como filtro pasabanda, con la salida sobre la resistencia. ¿Cuánto vale ${ask === "df" ? "su ancho de banda (Hz) entre los puntos de media potencia" : "su factor de calidad $Q = f_0/\\Delta f$"}?`,
        answer: ask === "df" ? df : Q,
        solution: [`[[f2a-filtros|Pasabanda RLC]]: $|H| = \\frac{R}{|Z|}$ es máximo (vale 1) en $f_0 = \\frac{1}{2\\pi\\sqrt{LC}} \\approx ${dn(f0, 0)}$ Hz.`,
          `Los puntos de media potencia ($|H| = \\frac{1}{\\sqrt2}$) cumplen $|\\omega L - \\frac{1}{\\omega C}| = R$, y su diferencia es exactamente $\\Delta\\omega = \\frac RL$: $\\Delta f = \\frac{R}{2\\pi L} \\approx ${dn(df, 1)}$ Hz.`,
          ask === "Q" ? `$Q = \\frac{f_0}{\\Delta f} \\approx ${dn(Q, 2)}$: cuanto más chica $R$, más angosto y selectivo el filtro (así se sintoniza una radio).` : `El ancho de banda no depende de $C$.`],
        // verificación: |H(f)| con impedancias complejas y bisección de los dos puntos de media potencia
        verify: { kind: "value", tol: 1e-6, fn: () => { const Hf = f => { const w = 2 * Math.PI * f, X = w * L - 1 / (w * C); return Rr / Math.hypot(Rr, X); }, half = Math.SQRT1_2;
          const bis = (a, b, up) => { for (let i = 0; i < 200; i++) { const m = (a + b) / 2; if ((Hf(m) > half) === up) b = m; else a = m; } return (a + b) / 2; };
          const f1 = bis(f0 / 100, f0, true), f2 = bis(f0, f0 * 100, false); return ask === "df" ? f2 - f1 : f0 / (f2 - f1); } }
      };
    }
  };

  const cards = {
    "f2a-thevenin": {
      title: "Teorema de Thévenin y puente de Wheatstone", aliases: ["teorema de Thévenin", "equivalente de Thévenin", "Thévenin", "equivalente de Norton", "puente de Wheatstone"], concepts: ["f2a-thevenin"],
      summary: "Cualquier red lineal vista desde dos bornes equivale a una fuente V_th en serie con R_th. El puente de Wheatstone equilibrado cumple R₁R_x = R₂R₃.",
      def: [R`**Thévenin:** una red de fuentes y resistencias, vista desde dos bornes, se comporta como una fuente $V_{th}$ en serie con una resistencia $R_{th}$. $V_{th}$ es la tensión en circuito abierto; $R_{th}$, la resistencia entre los bornes con las fuentes apagadas (las de tensión en cortocircuito). También $R_{th} = \frac{V_{th}}{I_{cc}}$, con la corriente de cortocircuito.`,
        R`**Norton:** la misma red equivale a una fuente de corriente $I_{cc}$ en paralelo con $R_{th}$.`,
        R`**Puente de Wheatstone:** dos divisores en paralelo con un galvanómetro entre sus puntos medios. Está equilibrado (corriente nula por el galvanómetro) si $\frac{R_1}{R_2} = \frac{R_3}{R_x}$.`],
      idea: [R`Thévenin permite estudiar qué pasa al cambiar la carga sin rehacer todo el circuito; por ejemplo, la [[f2a-potencia-electrica|máxima transferencia de potencia]] se da con $R_L = R_{th}$.`,
        R`El puente mide resistencias comparándolas, sin depender de la fuente ni de la calibración del instrumento: solo hay que detectar "cero".`],
      demo: [R`**Paso 1 (linealidad).** En una red de resistencias y fuentes, la tensión entre los bornes es una función lineal de la corriente que se saca: $V = a - bI$ (superposición de las fuentes internas y de la corriente externa).`,
        R`**Paso 2 (identificar a).** Con $I = 0$ (circuito abierto), $V = a$: es $V_{th}$.`,
        R`**Paso 3 (identificar b).** Con las fuentes apagadas, $a = 0$ y $V = -bI$: $b$ es la resistencia vista desde los bornes, $R_{th}$. Una fuente $V_{th}$ en serie con $R_{th}$ cumple la misma relación $V = V_{th} - R_{th}I$.`,
        R`**Paso 4 (Wheatstone).** Sin corriente por el galvanómetro, cada rama es un divisor: $V_C = V\frac{R_2}{R_1 + R_2}$ y $V_D = V\frac{R_x}{R_3 + R_x}$. Igualándolos, $R_2(R_3 + R_x) = R_x(R_1 + R_2)$, o sea $R_x = \frac{R_2R_3}{R_1}$. $\blacksquare$`],
      examples: [{ q: R`Divisor de 12 V con $R_1 = R_2 = 100\ \Omega$. ¿Thévenin desde el punto medio?`, steps: [R`$V_{th} = 6$ V y $R_{th} = 100\parallel100 = 50\ \Omega$.`] }],
      see: ["f2a-kirchhoff", "f2a-resistores", "f2a-potencia-electrica"]
    },
    "f2a-filtros": {
      title: "Filtros: pasa-bajos, pasa-altos y pasabanda", aliases: ["filtro pasa-bajos", "filtro pasa-altos", "filtro pasabanda", "frecuencia de corte", "función de transferencia", "ancho de banda"], concepts: ["f2a-filtros"],
      summary: "RC con salida en C: pasa-bajos, |H| = 1/√(1 + (f/f_c)²). Con salida en R: pasa-altos. f_c = 1/(2πRC). RLC con salida en R: pasabanda de ancho Δf = R/(2πL).",
      def: [R`La **función de transferencia** de un filtro es $H(\omega) = \frac{V_{sal}}{V_{ent}}$ (con fasores, ver [[f2a-reactancia|reactancias]]). Su módulo dice cuánto se atenúa cada frecuencia, y su argumento, cuánto se desfasa.`,
        R`**RC pasa-bajos** (salida en el capacitor): $H = \frac{1}{1 + i\omega RC}$, $|H| = \frac{1}{\sqrt{1 + (f/f_c)^2}}$, con **frecuencia de corte** $f_c = \frac{1}{2\pi RC}$. **Pasa-altos** (salida en la resistencia): $|H| = \frac{f/f_c}{\sqrt{1 + (f/f_c)^2}}$.`,
        R`**Pasabanda RLC** (salida en $R$): $|H| = \frac{R}{|Z|}$, máximo en la [[f2a-resonancia|resonancia]] $f_0$. El **ancho de banda** entre los puntos de media potencia es $\Delta f = \frac{R}{2\pi L}$, y $Q = \frac{f_0}{\Delta f}$.`],
      idea: [R`Un capacitor es un cortocircuito para frecuencias altas y un circuito abierto para frecuencias bajas. Según dónde se mire la salida, el RC deja pasar lo lento o lo rápido.`,
        R`En $f_c$ la salida es $\frac{1}{\sqrt2}$ de la entrada: $-3$ dB, la mitad de la potencia. Lejos de $f_c$ la ganancia cambia 20 dB por década.`],
      demo: [R`**Paso 1 (divisor con impedancias).** En el RC serie, la corriente es $I = \frac{V_{ent}}{R + 1/(i\omega C)}$ y la tensión en el capacitor, $V_C = \frac{I}{i\omega C}$.`,
        R`**Paso 2 (cociente).** $H = \frac{V_C}{V_{ent}} = \frac{1/(i\omega C)}{R + 1/(i\omega C)} = \frac{1}{1 + i\omega RC}$.`,
        R`**Paso 3 (módulo).** $|H| = \frac{1}{\sqrt{1 + (\omega RC)^2}}$; vale $\frac{1}{\sqrt2}$ cuando $\omega RC = 1$, o sea $f_c = \frac{1}{2\pi RC}$.`,
        R`**Paso 4 (ancho del pasabanda).** En el RLC, $|H| = \frac{1}{\sqrt2}$ cuando $|\omega L - \frac{1}{\omega C}| = R$. Las dos raíces positivas de $\omega^2 \mp \frac RL\omega - \frac{1}{LC} = 0$ difieren exactamente en $\frac RL$: $\Delta f = \frac{R}{2\pi L}$. $\blacksquare$`],
      examples: [{ q: R`¿Frecuencia de corte de un RC con 10 kΩ y 100 nF?`, steps: [R`$f_c = \frac{1}{2\pi\cdot10^4\cdot10^{-7}} \approx 159$ Hz.`] }],
      see: ["f2a-reactancia", "f2a-rlc", "f2a-resonancia", "f2a-rc"]
    }
  };

  E.extendCourse("f102a", {
    concepts: { "f2a-thevenin": { name: "Thévenin y puentes" }, "f2a-filtros": { name: "Filtros" } },
    templates: T,
    units: [{
      id: "f2a-circuitos-ext-u", order: 12, program: "Extra UBA", title: "Thévenin, puentes y filtros", icon: "volume-2",
      diagnostic: ["f2a-thevenin-num", "f2a-wheatstone-num", "f2a-filtro-num"],
      lessons: [
        { id: "f2a-thevenin", title: "Thévenin y Wheatstone", templates: ["f2a-thevenin-num", "f2a-wheatstone-num"], theory: ["f2a-thevenin"],
          intro: R`$V_{th}$: tensión en vacío. $R_{th}$: resistencia con las fuentes apagadas. Puente equilibrado: $R_x = \frac{R_2R_3}{R_1}$.` },
        { id: "f2a-filtros", title: "Filtros", templates: ["f2a-filtro-vf", "f2a-filtro-num", "f2a-pasabanda-num"], theory: ["f2a-filtros"],
          intro: R`RC: $f_c = \frac{1}{2\pi RC}$; salida en C, pasa-bajos; en R, pasa-altos. RLC: $\Delta f = \frac{R}{2\pi L}$.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  EXTRA UBA · ONDAS DESDE MAXWELL Y POTENCIAL VECTOR
 *  Temas de Física 3 de la Lic. en Cs. Físicas (FCEN, UBA) que no figuran en el programa de F102A.
 *  Solo se tomó la lista de temas; el texto y los ejercicios son originales.
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, F = E.f2a, nf = F.nf;
  const T = {};
  const c0 = 1 / Math.sqrt(F.mu0 * F.e0);
  const curl = (Fv, p, h = 1e-4) => { const d = (i, j) => { const a = p.slice(), b = p.slice(); a[j] += h; b[j] -= h; return (Fv(a)[i] - Fv(b)[i]) / (2 * h); }; return [d(2, 1) - d(1, 2), d(0, 2) - d(2, 0), d(1, 0) - d(0, 1)]; };
  const div = (Fv, p, h = 1e-3) => [0, 1, 2].reduce((s, i) => { const a = p.slice(), b = p.slice(); a[i] += h; b[i] -= h; return s + (Fv(a)[i] - Fv(b)[i]) / (2 * h); }, 0);
  // flujo de B a través de un círculo de radio r centrado en el eje de un solenoide de radio Rs (Simpson en polares, partido en el borde)
  const solFlux = (B, Rs, r) => { const m = Math.min(r, Rs); return F.simpson(p => B * 2 * Math.PI * p, 0, m, 400); };
  const MEDIOS = [{ n: "vidrio", er: 2.25 }, { n: "teflón", er: 2.1 }, { n: "agua (a frecuencias de radio)", er: 81 }, { n: "un plástico", er: 4 }, { n: "un cerámico", er: 9 }, { n: "polietileno", er: 2.3 }];

  T["f2a-ondamedio-num"] = {
    type: "numeric", concepts: ["f2a-ondas-maxwell"], difficulty: 2,
    generate(r) {
      const m = r.pick(MEDIOS), fr = r.pick([[100, "MHz", 1e8], [300, "MHz", 3e8], [1.5, "GHz", 1.5e9], [2.4, "GHz", 2.4e9], [10, "GHz", 1e10], [50, "MHz", 5e7]]), ask = r.pick(["v", "lam", "n"]);
      const v = c0 / Math.sqrt(m.er), lam = v / fr[2];
      const ans = ask === "v" ? v / 1e8 : ask === "lam" ? lam * 100 : Math.sqrt(m.er);
      return {
        prompt: `Una onda electromagnética de $${String(fr[0]).replace(".", "{,}")}$ ${fr[1]} se propaga en ${m.n}, un medio no magnético con $\\varepsilon_r = ${String(m.er).replace(".", "{,}")}$ y sin cargas ni corrientes libres. ${ask === "v" ? "¿Con qué rapidez se propaga (en $10^8$ m/s)?" : ask === "lam" ? "¿Cuál es su longitud de onda en ese medio (en cm)?" : "¿Cuál es el índice de refracción del medio para esa onda?"} ($c = 1/\\sqrt{\\mu_0\\varepsilon_0} \\approx 2{,}998\\times10^8$ m/s)`,
        answer: ans,
        solution: [`En el medio, las [[f2a-ondas-maxwell|ecuaciones de Maxwell]] dan la ecuación de ondas $\\nabla^2\\vec E = \\mu_0\\varepsilon\\frac{\\partial^2\\vec E}{\\partial t^2}$, con $\\varepsilon = \\varepsilon_r\\varepsilon_0$ ([[f2a-medios-electricos|dieléctrico]]).`,
          `La rapidez es $v = \\frac{1}{\\sqrt{\\mu_0\\varepsilon_r\\varepsilon_0}} = \\frac{c}{\\sqrt{\\varepsilon_r}} \\approx ${nf(v)}$ m/s${ask === "n" ? `, y el índice es $n = \\frac cv = \\sqrt{\\varepsilon_r} = ${nf(ans)}$` : ""}.`,
          ...(ask === "lam" ? [`$\\lambda = \\frac vf \\approx ${nf(lam * 100)}$ cm (más corta que en el vacío, $${nf(c0 / fr[2] * 100)}$ cm).`] : [])],
        // verificación: se arma E = cos(kx − ωt) con lo que da la respuesta y se mira el residuo de la ecuación de ondas por diferencias finitas
        verify: { kind: "zero", tol: 1e-4, fn: a => {
          const w = 2 * Math.PI * fr[2], k = ask === "v" ? w / (a * 1e8) : ask === "lam" ? 2 * Math.PI / (a / 100) : w * a * Math.sqrt(F.mu0 * F.e0);
          const Ef = (x, t) => Math.cos(k * x - w * t), x0 = 0.3 / k, t0 = 0.7 / w, hx = 1e-3 / k, ht = 1e-3 / w;
          const Exx = (Ef(x0 + hx, t0) - 2 * Ef(x0, t0) + Ef(x0 - hx, t0)) / (hx * hx), Ett = (Ef(x0, t0 + ht) - 2 * Ef(x0, t0) + Ef(x0, t0 - ht)) / (ht * ht);
          return [(Exx - F.mu0 * m.er * F.e0 * Ett) / (k * k)];
        } }
      };
    }
  };
  T["f2a-poynting-num"] = {
    type: "numeric", concepts: ["f2a-ondas-maxwell"], difficulty: 2,
    generate(r) {
      const v = r.pick(["I", "E0", "cable"]);
      if (v === "cable") {
        const I = r.int(2, 30) / 2, Rr = r.int(5, 60) / 10, a = r.int(2, 10) / 10, L = r.int(5, 40) / 10, S = I * I * Rr / (2 * Math.PI * a * 1e-3 * L);
        return {
          prompt: `Un alambre de $${String(a).replace(".", "{,}")}$ mm de radio y $${String(L).replace(".", "{,}")}$ m de largo, con resistencia $${String(Rr).replace(".", "{,}")}\\ \\Omega$, lleva una corriente continua de $${String(I).replace(".", "{,}")}$ A. ¿Cuánto vale el vector de Poynting en la superficie del alambre (en kW/m²)?`,
          answer: S / 1e3,
          solution: [`En la superficie: $E = \\frac{V}{L} = \\frac{IR}{L}$ a lo largo del alambre, y $B = \\frac{\\mu_0I}{2\\pi a}$ alrededor ([[f2a-ampere|ley de Ampère]]).`,
            `$\\vec S = \\frac{\\vec E\\times\\vec B}{\\mu_0}$ apunta **hacia adentro**, con módulo $S = \\frac{IR}{L}\\cdot\\frac{I}{2\\pi a} \\approx ${nf(S / 1e3)}$ kW/m².`,
            `Multiplicado por el área lateral $2\\pi aL$ da $I^2R$: la energía que se disipa en el alambre entra por los costados, desde el campo.`],
          // verificación: el flujo de S por la superficie lateral tiene que dar la potencia de Joule I²R
          verify: { kind: "zero", tol: 1e-9, fn: x => [(x * 1e3 * 2 * Math.PI * a * 1e-3 * L - I * I * Rr) / (I * I * Rr)] }
        };
      }
      const E0 = r.int(2, 60) * 50, I = E0 * E0 / (2 * F.mu0 * c0);
      const Iq = r.pick([1360, 1000, 500, 2000, 50, 120]);
      // promedio de S en un período: B se obtiene integrando Faraday (∂B/∂t = −∂E/∂x) en el tiempo, sin usar B = E/c
      const avgS = e0 => {
        const lam = 1, k = 2 * Math.PI / lam, w = k * c0, Tp = 2 * Math.PI / w, n = 2000, h = Tp / n;
        const dEdx = t => -k * e0 * Math.sin(-w * t);
        const Bs = [0]; for (let i = 0; i < n; i++) Bs.push(Bs[i] - h / 2 * (dEdx(i * h) + dEdx((i + 1) * h)));
        const mB = Bs.slice(0, n).reduce((s, x) => s + x, 0) / n;
        let s = 0; for (let i = 0; i < n; i++) s += e0 * Math.cos(-w * i * h) * (Bs[i] - mB);
        return s / n / F.mu0;
      };
      if (v === "I") return {
        prompt: `Una onda electromagnética plana y senoidal viaja por el vacío con un campo eléctrico de amplitud $${E0}$ V/m. ¿Cuál es su intensidad media (en W/m²)? ($\\mu_0 = 4\\pi\\times10^{-7}$ T m/A, $c \\approx 2{,}998\\times10^8$ m/s)`,
        answer: I,
        solution: [`Por Faraday, $B_0 = \\frac{E_0}{c}$, y el [[f2a-ondas-maxwell|vector de Poynting]] vale $S = \\frac{EB}{\\mu_0} = \\frac{E_0^2}{\\mu_0c}\\cos^2(kx - \\omega t)$.`,
          `El promedio de $\\cos^2$ es $\\frac12$: $\\langle S\\rangle = \\frac{E_0^2}{2\\mu_0c} \\approx ${nf(I)}$ W/m².`],
        verify: { kind: "value", tol: 1e-5, fn: () => avgS(E0) }
      };
      const e0 = Math.sqrt(2 * F.mu0 * c0 * Iq);
      return {
        prompt: `Una onda electromagnética plana y senoidal tiene una intensidad media de $${Iq}$ W/m² en el vacío. ¿Cuál es la amplitud de su campo eléctrico (en V/m)? ($\\mu_0 = 4\\pi\\times10^{-7}$ T m/A, $c \\approx 2{,}998\\times10^8$ m/s)`,
        answer: e0,
        solution: [`De $\\langle S\\rangle = \\frac{E_0^2}{2\\mu_0c}$ ([[f2a-ondas-maxwell|vector de Poynting]]): $E_0 = \\sqrt{2\\mu_0c\\langle S\\rangle} \\approx ${nf(e0)}$ V/m.`,
          `El campo magnético tiene amplitud $B_0 = \\frac{E_0}{c} \\approx ${nf(e0 / c0 * 1e6)}$ μT.`],
        verify: { kind: "zero", tol: 1e-5, fn: x => [(avgS(x) - Iq) / Iq] }
      };
    }
  };
  T["f2a-rotA-num"] = {
    type: "numeric", concepts: ["f2a-potencial-vector"], difficulty: 2,
    generate(r) {
      // cada componente de A es c·(monomio en x, y, z); B = ∇×A se deriva exacto y se pide una componente en un punto
      const MON = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 0], [0, 1, 1], [1, 0, 1], [2, 0, 0], [0, 2, 0], [0, 0, 2]];
      const tex = e => ["x", "y", "z"].map((v, i) => e[i] === 0 ? "" : e[i] === 1 ? v : `${v}^{${e[i]}}`).join("");
      const comps = [0, 1, 2].map(() => [[r.nz(-5, 5), r.pick(MON)], [r.nz(-5, 5), r.pick(MON)]]);
      const ev = (t, p) => t.reduce((s, [c, e]) => s + c * p[0] ** e[0] * p[1] ** e[1] * p[2] ** e[2], 0);
      const dv = (t, j, p) => t.reduce((s, [c, e]) => e[j] === 0 ? s : s + c * e[j] * p[0] ** (e[0] - (j === 0)) * p[1] ** (e[1] - (j === 1)) * p[2] ** (e[2] - (j === 2)), 0);
      const P = [r.nz(-3, 3), r.nz(-3, 3), r.nz(-3, 3)], i = r.int(0, 2), j = (i + 1) % 3, k = (i + 2) % 3;
      const ans = dv(comps[k], j, P) - dv(comps[j], k, P);
      if (ans === 0 || comps.some(t => t[0][1] === t[1][1])) return null;
      const show = t => H.poly(t.map(([c, e]) => [c, tex(e)])) || "0";
      const n = ["x", "y", "z"];
      return {
        prompt: `El potencial vector de cierto campo magnético es $\\vec A = \\left(${show(comps[0])},\\ ${show(comps[1])},\\ ${show(comps[2])}\\right)$ (en T·m, con las coordenadas en metros). ¿Cuánto vale $B_${n[i]}$ (en T) en el punto $(${P.join(", ")})$?`,
        answer: ans,
        solution: [`$\\vec B = \\nabla\\times\\vec A$ ([[f2a-potencial-vector|potencial vector]]). Su componente $${n[i]}$ es $B_${n[i]} = \\frac{\\partial A_${n[k]}}{\\partial ${n[j]}} - \\frac{\\partial A_${n[j]}}{\\partial ${n[k]}}$.`,
          `En $(${P.join(", ")})$: $\\frac{\\partial A_${n[k]}}{\\partial ${n[j]}} = ${dv(comps[k], j, P)}$ y $\\frac{\\partial A_${n[j]}}{\\partial ${n[k]}} = ${dv(comps[j], k, P)}$.`,
          `$B_${n[i]} = ${ans}$ T.`],
        // verificación: rotor por diferencias finitas
        verify: { kind: "value", tol: 1e-6, fn: () => curl(p => comps.map(t => ev(t, p)), P, 1e-4)[i] }
      };
    }
  };
  T["f2a-solenoideA-num"] = {
    type: "numeric", concepts: ["f2a-potencial-vector"], difficulty: 3,
    generate(r) {
      const n = r.int(5, 40) * 100, I = r.int(1, 10) / 2, Rs = r.int(1, 5), rr = r.pick([0.25, 0.5, 0.8, 1.5, 2, 3, 5]) * Rs, ask = r.pick(["A", "fem"]);
      const B = F.mu0 * n * I, A = rr < Rs ? B * rr / 200 : B * (Rs / 100) ** 2 / (2 * rr / 100);
      const dIdt = r.int(1, 20) * 10, Ein = A / I * dIdt;
      return {
        prompt: `Un solenoide largo de radio $${Rs}$ cm tiene $${n}$ vueltas por metro y lleva ${ask === "A" ? `$${String(I).replace(".", "{,}")}$ A` : `una corriente que crece a $${dIdt}$ A/s`}. ${ask === "A" ? `En el gauge de Coulomb, ¿cuánto vale el módulo del potencial vector a $${nf(rr)}$ cm del eje (en μT·m)?` : `¿Cuánto vale el campo eléctrico inducido a $${nf(rr)}$ cm del eje (en mV/m)?`} ($\\mu_0 = 4\\pi\\times10^{-7}$ T m/A)`,
        answer: ask === "A" ? A * 1e6 : Ein * 1e3,
        solution: [`Por simetría, $\\vec A$ da vueltas alrededor del eje y su módulo depende solo de $r$. Por [[c2-flujo|Stokes]], $\\oint\\vec A\\cdot d\\vec l = \\Phi_B$: $A\\cdot2\\pi r = \\Phi_B(r)$ ([[f2a-potencial-vector|potencial vector]]).`,
          `Adentro $B = \\mu_0nI${ask === "A" ? ` = ${nf(B * 1e3)}$ mT` : "$"}. ${rr < Rs ? `Como $r < R$: $\\Phi = B\\pi r^2$ y $A = \\frac{Br}{2}$.` : `Como $r > R$: $\\Phi = B\\pi R^2$ y $A = \\frac{BR^2}{2r}$, que **no es cero** aunque afuera $B = 0$.`}`,
          ask === "A" ? `$A \\approx ${nf(A * 1e6)}$ μT·m.` : `El [[f2a-campo-inducido|campo eléctrico inducido]] es $\\vec E = -\\frac{\\partial\\vec A}{\\partial t}$: $E = \\frac{A}{I}\\frac{dI}{dt} \\approx ${nf(Ein * 1e3)}$ mV/m.`],
        // verificación: flujo de B integrado en polares (Simpson) y circulación de A, o ley de Faraday con ese flujo
        verify: { kind: "value", tol: 1e-6, fn: () => {
          const per = solFlux(F.mu0 * n, Rs / 100, rr / 100) / (2 * Math.PI * rr / 100);
          return ask === "A" ? per * I * 1e6 : per * dIdt * 1e3;
        } }
      };
    }
  };
  T["f2a-potA-vf"] = {
    type: "tf", concepts: ["f2a-potencial-vector"], difficulty: 2,
    generate(r) {
      const a = r.nz(1, 5), kind = r.pick(["rot", "gauge", "afuera", "div"]), P = [0.31, -0.57, 0.83];
      if (kind === "rot") {
        const sg = r.pick([1, -1]), Af = p => [-sg * a * p[1], a * p[0], 0];
        return {
          prompt: `<b>Verdadero o falso:</b> el potencial vector $\\vec A = (${sg > 0 ? "-" : ""}${a === 1 ? "" : a}y,\\ ${a === 1 ? "" : a}x,\\ 0)$ (T·m) corresponde a un campo magnético nulo.`,
          answer: sg < 0,
          explanation: `$\\vec B = \\nabla\\times\\vec A$ tiene $B_z = \\frac{\\partial A_y}{\\partial x} - \\frac{\\partial A_x}{\\partial y} = ${a} ${sg > 0 ? "+" : "-"} ${a} = ${sg > 0 ? 2 * a : 0}$ T. ${sg > 0 ? "Es un campo uniforme, no nulo." : `Es nulo: ese $\\vec A$ es el gradiente de $${a === 1 ? "" : a}xy$ ([[f2a-potencial-vector|libertad de gauge]]).`}`,
          solution: [`Un $\\vec A$ que "da vueltas" tiene rotor; uno que es un gradiente, no.`],
          verify: { kind: "truth", fn: () => curl(Af, P).every(x => Math.abs(x) < 1e-6) }
        };
      }
      if (kind === "gauge") {
        const b = r.nz(-4, 4), A0 = p => [a * p[1] * p[2], 0, -a * p[0]], gr = p => [b * p[1] * p[2], b * p[0] * p[2], b * p[0] * p[1]];
        return {
          prompt: `<b>Verdadero o falso:</b> los potenciales vectores $\\vec A = (${a === 1 ? "" : a}yz,\\ 0,\\ -${a === 1 ? "" : a}x)$ y $\\vec A' = \\vec A + \\nabla(${b === 1 ? "" : b === -1 ? "-" : b}xyz)$ dan el mismo campo magnético.`,
          answer: true,
          explanation: `El rotor de un gradiente es siempre cero, así que $\\nabla\\times\\vec A' = \\nabla\\times\\vec A$. Esa es la **libertad de gauge** del [[f2a-potencial-vector|potencial vector]].`,
          solution: [`Lo físico es $\\vec B$; $\\vec A$ queda definido salvo un gradiente.`],
          verify: { kind: "truth", fn: () => { const b1 = curl(A0, P), b2 = curl(p => A0(p).map((x, i) => x + gr(p)[i]), P); return b1.every((x, i) => Math.abs(x - b2[i]) < 1e-6); } }
        };
      }
      if (kind === "afuera") {
        const Rs = r.int(1, 5), n = r.int(5, 40) * 100;
        return {
          prompt: `Un solenoide ideal muy largo, de radio $${Rs}$ cm y $${n}$ vueltas por metro, lleva $${a}$ A. <b>Verdadero o falso:</b> como afuera del solenoide $\\vec B = 0$, ahí se puede tomar $\\vec A = 0$ en todos los puntos.`,
          answer: false,
          explanation: `Una curva que rodea al solenoide encierra flujo, y por Stokes $\\oint\\vec A\\cdot d\\vec l = \\Phi_B \\ne 0$: $\\vec A$ no puede anularse en toda la curva. Afuera $\\vec A$ tiene rotor nulo pero no es cero (lo que se ve en el efecto Aharonov-Bohm) ([[f2a-potencial-vector]]).`,
          solution: [`Con simetría, $A = \\frac{\\Phi}{2\\pi r}$ afuera.`],
          verify: { kind: "truth", fn: () => !(solFlux(F.mu0 * n * a, Rs / 100, 3 * Rs / 100) > 0) }
        };
      }
      const Af = p => [a * p[1] ** 2 * p[2], -a * p[0] * p[2] ** 2, a * p[0] * p[1]];
      return {
        prompt: `<b>Verdadero o falso:</b> el campo $\\vec B = \\nabla\\times\\vec A$, con $\\vec A = (${a === 1 ? "" : a}y^2z,\\ -${a === 1 ? "" : a}xz^2,\\ ${a === 1 ? "" : a}xy)$, cumple $\\nabla\\cdot\\vec B = 0$ en todos lados.`,
        answer: true,
        explanation: `La divergencia de un rotor es siempre cero (las derivadas cruzadas se cancelan de a pares). Por eso escribir $\\vec B = \\nabla\\times\\vec A$ garantiza la ley de Gauss magnética ([[f2a-potencial-vector]]).`,
        solution: [`Vale para cualquier $\\vec A$ con derivadas segundas continuas.`],
        verify: { kind: "truth", fn: () => Math.abs(div(p => curl(Af, p, 1e-3), P, 1e-2)) < 1e-4 }
      };
    }
  };

  const cards = {
    "f2a-ondas-maxwell": {
      title: "Ecuación de ondas desde Maxwell y vector de Poynting", aliases: ["ecuación de ondas electromagnética", "vector de Poynting", "Poynting", "teorema de Poynting", "presión de radiación"], concepts: ["f2a-ondas-maxwell"],
      summary: "Tomando el rotor de Faraday y usando Ampère-Maxwell sin fuentes: ∇²E = με ∂²E/∂t², ondas a v = 1/√(με). La energía fluye con S = E×B/μ₀, y ⟨S⟩ = E₀²/(2μ₀c).",
      def: [R`En una región sin cargas ni corrientes, de un medio lineal con $\varepsilon$ y $\mu$, las [[f2a-forma-diferencial|ecuaciones de Maxwell en forma diferencial]] implican $$\nabla^2\vec E = \mu\varepsilon\frac{\partial^2\vec E}{\partial t^2},\qquad \nabla^2\vec B = \mu\varepsilon\frac{\partial^2\vec B}{\partial t^2}:$$ ondas que viajan a $v = \frac{1}{\sqrt{\mu\varepsilon}}$. En el vacío, $c = \frac{1}{\sqrt{\mu_0\varepsilon_0}}$; en un dieléctrico no magnético, $v = \frac{c}{\sqrt{\varepsilon_r}}$ e índice $n = \sqrt{\varepsilon_r}$.`,
        R`El **vector de Poynting** $\vec S = \frac{1}{\mu_0}\vec E\times\vec B$ es la potencia por unidad de área que lleva el campo. En una onda plana senoidal, $\langle S\rangle = \frac{E_0^2}{2\mu_0c}$ (la intensidad). Al ser absorbida, la onda ejerce una **presión de radiación** $\frac{\langle S\rangle}{c}$ (el doble si se refleja).`],
      idea: [R`Lo nuevo respecto de [[f2b-em|ondas electromagnéticas]] es el camino: no se adivina una onda y se prueba, sino que la ecuación de ondas **sale** de Maxwell, con la rapidez ya puesta. Que $\frac{1}{\sqrt{\mu_0\varepsilon_0}}$ diera la rapidez medida de la luz fue lo que convenció a Maxwell de que la luz es electromagnética.`,
        R`El vector de Poynting cuenta por dónde viaja la energía, y a veces sorprende: en un alambre con corriente, la energía que se disipa entra **por los costados**, desde el campo de afuera, no "por adentro del cable".`],
      demo: [R`**Paso 1 (rotor de Faraday).** Partimos de $\nabla\times\vec E = -\frac{\partial\vec B}{\partial t}$ y tomamos el rotor de los dos lados. Las derivadas en el espacio y en el tiempo conmutan: $\nabla\times(\nabla\times\vec E) = -\frac{\partial}{\partial t}(\nabla\times\vec B)$.`,
        R`**Paso 2 (Ampère-Maxwell).** Sin corrientes, $\nabla\times\vec B = \mu\varepsilon\frac{\partial\vec E}{\partial t}$. Reemplazando: $\nabla\times(\nabla\times\vec E) = -\mu\varepsilon\frac{\partial^2\vec E}{\partial t^2}$.`,
        R`**Paso 3 (identidad del doble rotor).** Para cualquier campo, $\nabla\times(\nabla\times\vec E) = \nabla(\nabla\cdot\vec E) - \nabla^2\vec E$ (se comprueba componente por componente). Sin cargas, la ley de Gauss da $\nabla\cdot\vec E = 0$, así que queda $-\nabla^2\vec E$.`,
        R`**Paso 4 (ecuación de ondas).** Igualando: $\nabla^2\vec E = \mu\varepsilon\frac{\partial^2\vec E}{\partial t^2}$. Para una función $f(x - vt)$, las derivadas segundas cumplen $f_{tt} = v^2f_{xx}$, así que es una ecuación de ondas con $v^2 = \frac{1}{\mu\varepsilon}$. Lo mismo, empezando por el rotor de Ampère-Maxwell, sale para $\vec B$.`,
        R`**Paso 5 (Poynting).** La energía del campo por unidad de volumen es $u = \frac12\varepsilon_0E^2 + \frac{B^2}{2\mu_0}$. Derivando y usando Faraday y Ampère-Maxwell, con la identidad $\nabla\cdot(\vec E\times\vec B) = \vec B\cdot(\nabla\times\vec E) - \vec E\cdot(\nabla\times\vec B)$, queda $\frac{\partial u}{\partial t} + \nabla\cdot\vec S = -\vec J\cdot\vec E$: lo que pierde el campo en un volumen sale por su borde como flujo de $\vec S$ o se lo entrega a las cargas.`,
        R`**Paso 6 (onda plana).** Con $E = E_0\cos(kx - \omega t)$ y $B = \frac Ec$ en fase, $S = \frac{E_0^2}{\mu_0c}\cos^2(kx - \omega t)$, y como el promedio de $\cos^2$ es $\frac12$, $\langle S\rangle = \frac{E_0^2}{2\mu_0c}$. $\blacksquare$`],
      examples: [{ q: R`Luz solar en la Tierra: $1360$ W/m². ¿Amplitud del campo eléctrico?`, steps: [R`$E_0 = \sqrt{2\mu_0c\langle S\rangle} = \sqrt{2\cdot4\pi\times10^{-7}\cdot3\times10^8\cdot1360} \approx 1010$ V/m.`] }],
      see: ["f2a-maxwell", "f2a-forma-diferencial", "f2b-em", "f2a-potencial-vector"]
    },
    "f2a-potencial-vector": {
      title: "Potencial vector", aliases: ["potencial vector", "libertad de gauge", "gauge de Coulomb", "Aharonov-Bohm"], concepts: ["f2a-potencial-vector"],
      summary: "Como ∇·B = 0, se puede escribir B = ∇×A. A queda definido salvo un gradiente (gauge). Por Stokes, ∮A·dl = Φ_B, y E = −∇V − ∂A/∂t.",
      def: [R`Como $\nabla\cdot\vec B = 0$, siempre existe un **potencial vector** $\vec A$ con $$\vec B = \nabla\times\vec A.$$ Es el análogo magnético del [[f2a-potencial|potencial eléctrico]].`,
        R`**Libertad de gauge:** $\vec A$ y $\vec A + \nabla\chi$ dan el mismo $\vec B$, porque el rotor de un gradiente es cero. En el **gauge de Coulomb** se pide además $\nabla\cdot\vec A = 0$, y entonces $\nabla^2\vec A = -\mu_0\vec J$, como Poisson componente por componente.`,
        R`**Circulación:** por [[c2-flujo|Stokes]], $\oint_C\vec A\cdot d\vec l = \Phi_B$, el flujo magnético por una superficie apoyada en $C$. Con campos que cambian, Faraday da $\vec E = -\nabla V - \frac{\partial\vec A}{\partial t}$.`],
      idea: [R`En un solenoide largo, $\vec A$ da vueltas alrededor del eje: adentro $A = \frac{Br}{2}$ y afuera $A = \frac{BR^2}{2r}$. Afuera no hay campo magnético pero $\vec A$ **no** es cero: tiene rotor nulo, pero su circulación alrededor del solenoide es el flujo encerrado.`,
        R`En mecánica clásica eso no tiene consecuencias, pero en cuántica sí: un electrón que rodea al solenoide sin tocar el campo cambia su fase (efecto Aharonov-Bohm). Y el campo eléctrico inducido afuera del solenoide es justamente $-\frac{\partial\vec A}{\partial t}$.`],
      demo: [R`**Paso 1 (por qué existe).** Un campo con divergencia nula en todo el espacio es el rotor de otro (es el recíproco de que la divergencia de un rotor es cero, y se prueba construyendo $\vec A$ por integración). Lo usamos como dato.`,
        R`**Paso 2 (gauge).** Si $\vec A' = \vec A + \nabla\chi$, entonces $\nabla\times\vec A' = \nabla\times\vec A + \nabla\times\nabla\chi$, y el último término es cero porque las derivadas cruzadas de $\chi$ son iguales. Mismo $\vec B$.`,
        R`**Paso 3 (Stokes).** Para una curva $C$ que borda una superficie $S$: $\oint_C\vec A\cdot d\vec l = \iint_S(\nabla\times\vec A)\cdot d\vec S = \iint_S\vec B\cdot d\vec S = \Phi_B$.`,
        R`**Paso 4 (solenoide).** Por la simetría de rotación, $\vec A$ es tangente a las circunferencias centradas en el eje y de módulo constante en cada una. En una de radio $r$: $A\cdot2\pi r = \Phi_B(r)$. Adentro $\Phi = B\pi r^2$, así que $A = \frac{Br}{2}$; afuera $\Phi = B\pi R^2$ y $A = \frac{BR^2}{2r}$.`,
        R`**Paso 5 (campo inducido).** Faraday: $\nabla\times\vec E = -\frac{\partial}{\partial t}\nabla\times\vec A$, o sea $\nabla\times\left(\vec E + \frac{\partial\vec A}{\partial t}\right) = 0$. Un campo de rotor nulo es un gradiente: $\vec E + \frac{\partial\vec A}{\partial t} = -\nabla V$. $\blacksquare$`],
      examples: [{ q: R`$\vec A = (0,\ 3x^2,\ 0)$ T·m. ¿$\vec B$?`, steps: [R`$B_z = \frac{\partial A_y}{\partial x} - \frac{\partial A_x}{\partial y} = 6x$; las otras componentes son cero.`, R`En $x = 1$ m, $B = 6$ T en $\hat z$.`] }],
      tips: [R`$\vec A$ no es único: dos respuestas distintas pueden estar bien si difieren en un gradiente. Lo que se compara es $\vec B$, o la circulación de $\vec A$ en una curva cerrada.`],
      see: ["f2a-campo-inducido", "f2a-ampere", "f2a-forma-diferencial", "f2a-ondas-maxwell"]
    }
  };

  E.extendCourse("f102a", {
    concepts: { "f2a-ondas-maxwell": { name: "Ondas desde Maxwell" }, "f2a-potencial-vector": { name: "Potencial vector" } },
    templates: T,
    units: [{
      id: "f2a-ondas-ext-u", order: 13, program: "Extra UBA", title: "Ondas desde Maxwell y potencial vector", icon: "sparkles",
      diagnostic: ["f2a-ondamedio-num", "f2a-poynting-num", "f2a-rotA-num"],
      lessons: [
        { id: "f2a-ondas-maxwell", title: "Ecuación de ondas y Poynting", templates: ["f2a-ondamedio-num", "f2a-poynting-num"], theory: ["f2a-ondas-maxwell"],
          intro: R`$\nabla^2\vec E = \mu\varepsilon\,\partial_t^2\vec E$: ondas a $v = \frac{1}{\sqrt{\mu\varepsilon}}$. Potencia por área: $\vec S = \frac{1}{\mu_0}\vec E\times\vec B$.` },
        { id: "f2a-potencial-vector", title: "Potencial vector", templates: ["f2a-rotA-num", "f2a-potA-vf", "f2a-solenoideA-num"], theory: ["f2a-potencial-vector"],
          intro: R`$\vec B = \nabla\times\vec A$, $\oint\vec A\cdot d\vec l = \Phi_B$ y $\vec E = -\nabla V - \partial_t\vec A$.` }
      ]
    }],
    cards
  });
})();
