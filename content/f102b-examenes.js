/* ===== F102B · Evaluaciones: parciales y final simulados =====
   Estructura de los exámenes reales (ver docs/parciales/f102b.md): tres parciales (termodinámica, ondas y
   óptica) y la parte práctica del final regular, con problemas de varios incisos que hay que justificar.
   Enunciados propios y datos sorteados; los datos de las figuras van en el texto. */
(function () {
  const E = window.Efecen, R = String.raw;
  const SELF = {}, T = {};
  const Rg = 8.314, cLuz = 3e8, vSon = 344;
  const nf = (H, x, d = 2) => H.num(x, d).replace(".", "{,}");
  // notación científica en TeX: 3,25 \times 10^{-10}
  const sci = (x, d = 3) => {
    if (x === 0) return "0";
    const e = Math.floor(Math.log10(Math.abs(x))), m = x / 10 ** e;
    if (e >= -2 && e <= 3) return String(+x.toPrecision(d)).replace(".", "{,}");
    return `${String(+m.toFixed(d - 1)).replace(".", "{,}")} \\times 10^{${e}}`;
  };
  const deg = x => x * 180 / Math.PI, rad = x => x * Math.PI / 180;
  // integral de Simpson (para recalcular trabajos)
  const simpson = (f, a, b, n = 400) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3; };

  // ---------- termodinámica ----------
  // ciclo P-V: tres formas y los dos sentidos. Devuelve los tramos con Q, W y ΔU.
  function cycle(r) {
    const kind = r.pick(["rect", "iso", "lin"]), mono = r.bool();
    const Cv = mono ? 1.5 * Rg : 2.5 * Rg, P1 = r.pick([100, 150, 200]) * 1e3, P2 = P1 * r.pick([2, 3]), V1 = r.pick([1, 2, 3]) * 1e-3, V2 = V1 * r.pick([2, 3]);
    // la cantidad de gas, redondeada a dos cifras, para que el estado de menor PV esté cerca de T0
    const T0 = r.pick([250, 280, 300, 320, 350]), n = +(P1 * V1 / (Rg * T0)).toPrecision(2);
    let pts, segs;
    if (kind === "rect") {
      pts = { A: [V1, P2], B: [V2, P2], C: [V2, P1], D: [V1, P1] };
      segs = [["A", "B", "isobárico"], ["B", "C", "isocórico"], ["C", "D", "isobárico"], ["D", "A", "isocórico"]];
    } else if (kind === "iso") {
      pts = { A: [V1, P2], B: [V2, P2], C: [V2, P2 * V1 / V2] };
      segs = [["A", "B", "isobárico"], ["B", "C", "isocórico"], ["C", "A", "isotérmico"]];
    } else {
      pts = { A: [V1, P1], B: [V2, P2], C: [V2, P1] };
      segs = [["A", "B", "recto en el diagrama P-V"], ["B", "C", "isocórico"], ["C", "A", "isobárico"]];
    }
    // sentido: el original es horario (máquina); al invertirlo es un refrigerador
    const engine = r.bool();
    if (!engine) segs = segs.slice().reverse().map(([a, b, t]) => [b, a, t]);
    const Tof = p => p[0] * p[1] / (n * Rg);
    const list = segs.map(([a, b, t]) => {
      const [Va, Pa] = pts[a], [Vb, Pb] = pts[b];
      const W = t === "isobárico" ? Pa * (Vb - Va) : t === "isocórico" ? 0 : t === "isotérmico" ? Pa * Va * Math.log(Vb / Va) : (Pa + Pb) / 2 * (Vb - Va);
      const dU = n * Cv * (Tof(pts[b]) - Tof(pts[a]));
      return { a, b, t, W, dU, Q: dU + W, Va, Pa, Vb, Pb };
    });
    const Wn = list.reduce((s, x) => s + x.W, 0), Qin = list.filter(x => x.Q > 0).reduce((s, x) => s + x.Q, 0), Qout = list.filter(x => x.Q < 0).reduce((s, x) => s + x.Q, 0);
    return { kind, n, mono, Cv, pts, list, engine, Wn, Qin, Qout, Tof };
  }
  const ptTex = (H, p) => `(${nf(H, p[0] * 1e3, 3)}\\ \\text{L},\\ ${nf(H, p[1] / 1e3, 1)}\\ \\text{kPa})`;
  const cycleText = (H, c) => `Los estados son ${Object.entries(c.pts).map(([k, p]) => `$${k} = ${ptTex(H, p)}$`).join(", ")}, y el ciclo recorre ${c.list.map(s => `$${s.a} \\to ${s.b}$ (${s.t})`).join(", ")}`;
  // verificación: trabajo por integración numérica de P dV y primera ley tramo por tramo
  const cycleVerify = (c, extra) => ({ kind: "zero", tol: 1e-6, scale: 1, fn: () => {
    const res = [];
    for (const s of c.list) {
      const P = s.t === "isotérmico" ? V => s.Pa * s.Va / V : s.t === "isocórico" ? () => s.Pa : V => s.Pa + (s.Pb - s.Pa) * (V - s.Va) / ((s.Vb - s.Va) || 1);
      const W = s.t === "isocórico" ? 0 : simpson(P, s.Va, s.Vb);
      // ΔU con la teoría cinética: N·(f/2)·k·ΔT = (f/2)·Δ(PV)
      const dU = (c.mono ? 1.5 : 2.5) * (s.Pb * s.Vb - s.Pa * s.Va);
      res.push((W - s.W) / Math.max(1, Math.abs(c.Qin)), (dU - s.dU) / Math.max(1, Math.abs(c.Qin)));
    }
    res.push(c.list.reduce((t, s) => t + s.dU, 0) / c.Qin);
    return res.concat(extra ? extra() : []);
  } });

  SELF["f2b-ex-ciclo"] = {
    concepts: ["f2b-primera-ley", "f2b-procesos"],
    generate(r, H) {
      const c = cycle(r);
      const rows = c.list.map(s => `$${s.a}\\to ${s.b}$: $W = ${nf(H, s.W, 1)}$ J, $\\Delta U = ${nf(H, s.dU, 1)}$ J, $Q = ${nf(H, s.Q, 1)}$ J`);
      return {
        prompt: `$${nf(H, c.n)}$ mol de un gas ideal ${c.mono ? "monoatómico" : "diatómico"} ${c.n === 1 ? "recorre" : "recorren"} un ciclo. ${cycleText(H, c)}. Calculá, justificando el cálculo en cada proceso: a) el calor total intercambiado; b) el trabajo realizado por el sistema; c) el cambio de energía interna. ($R = 8{,}314$ J/(mol K))`,
        rubric: [
          { text: `Temperaturas de los estados con $T = \\frac{PV}{nR}$ y $\\Delta U = nC_V\\Delta T$ con $C_V = ${c.mono ? R`\frac32` : R`\frac52`}R$.`, w: 2 },
          { text: `Trabajo de cada tramo: ${c.list.map(s => `$W_{${s.a}${s.b}} = ${nf(H, s.W, 1)}$ J`).join(", ")}.`, w: 3 },
          { text: `Calor de cada tramo por la primera ley ($Q = \\Delta U + W$): ${c.list.map(s => `$Q_{${s.a}${s.b}} = ${nf(H, s.Q, 1)}$ J`).join(", ")}.`, w: 3 },
          { text: `Totales: $Q = W = ${nf(H, c.Wn, 1)}$ J y $\\Delta U = 0$ (es un ciclo).`, w: 2 }
        ],
        solution: [
          `Temperaturas ($T = PV/nR$): ${Object.entries(c.pts).map(([k, p]) => `$T_${k} = ${nf(H, c.Tof(p), 1)}$ K`).join(", ")}.`,
          R`En cada tramo: isobárico, $W = P\,\Delta V$; isocórico, $W = 0$; isotérmico, $W = nRT\ln\frac{V_f}{V_i}$ (y $\Delta U = 0$); recto, $W$ es el área del trapecio bajo la recta. Siempre $\Delta U = nC_V\Delta T$ y $Q = \Delta U + W$.`,
          ...rows,
          `a) $Q_{total} = ${nf(H, c.Wn, 1)}$ J. b) $W_{total} = ${nf(H, c.Wn, 1)}$ J (${c.Wn > 0 ? "positivo: el ciclo es horario y el gas hace trabajo neto sobre el entorno" : "negativo: el ciclo es antihorario y el entorno hace trabajo sobre el gas"}). c) $\\Delta U_{total} = 0$, porque el gas vuelve al estado inicial y $U$ es función de estado.`
        ],
        verify: cycleVerify(c)
      };
    }
  };

  // el del final: temperaturas, calor y trabajo totales, y eficiencia o coeficiente de rendimiento
  SELF["f2b-ex-ciclo-final"] = {
    concepts: ["f2b-primera-ley", "f2b-segunda-ley"],
    generate(r, H) {
      const c = cycle(r);
      const names = Object.keys(c.pts), eff = c.Wn / c.Qin, cop = c.Qin / Math.abs(c.Wn);
      return {
        prompt: `$${nf(H, c.n)}$ mol de un gas ideal ${c.mono ? "monoatómico" : "diatómico"} ${c.n === 1 ? "realiza" : "realizan"} un proceso cíclico. ${cycleText(H, c)}. a) Calculá las temperaturas ${names.map(k => `$T_${k}$`).join(", ")}. b) Calculá el calor total, indicando si entra o sale. c) Calculá el trabajo total, indicando si lo hace el gas sobre el entorno o el entorno sobre el gas. d) Si es una máquina térmica, calculá su eficiencia; si es un refrigerador, su coeficiente de rendimiento. ($R = 8{,}314$ J/(mol K))`,
        rubric: [
          { text: `a) ${names.map(k => `$T_${k} = ${nf(H, c.Tof(c.pts[k]), 1)}$ K`).join(", ")}.`, w: 1 },
          { text: `b) $Q_{total} = ${nf(H, c.Wn, 1)}$ J: ${c.Wn > 0 ? "entra" : "sale"} calor neto (absorbe $${nf(H, c.Qin, 1)}$ J y cede $${nf(H, -c.Qout, 1)}$ J).`, w: 1 },
          { text: `c) $W_{total} = ${nf(H, c.Wn, 1)}$ J: ${c.Wn > 0 ? "el gas hace trabajo sobre el entorno" : "el entorno hace trabajo sobre el gas"}.`, w: 1 },
          { text: c.engine ? `d) Es una máquina (ciclo horario): $e = \\frac{W}{Q_{abs}} = ${nf(H, eff, 4)}$ ($${nf(H, eff * 100, 2)}\\,\\%$).` : `d) Es un refrigerador (ciclo antihorario): $K = \\frac{Q_{abs}}{|W|} = ${nf(H, cop, 3)}$.`, w: 1 }
        ],
        solution: [
          `a) Con $T = \\frac{PV}{nR}$: ${names.map(k => `$T_${k} = \\frac{${nf(H, c.pts[k][1], 0)}\\cdot${nf(H, c.pts[k][0], 3)}}{${nf(H, c.n)}\\cdot 8{,}314} \\approx ${nf(H, c.Tof(c.pts[k]), 1)}$ K`).join("; ")}.`,
          ...c.list.map(s => `$${s.a}\\to ${s.b}$ (${s.t}): $W = ${nf(H, s.W, 1)}$ J, $\\Delta U = ${nf(H, s.dU, 1)}$ J, $Q = ${nf(H, s.Q, 1)}$ J.`),
          `b) y c) En el ciclo $\\Delta U = 0$, así que $Q_{total} = W_{total} = ${nf(H, c.Wn, 1)}$ J (el área encerrada en el diagrama P-V, con signo según el sentido de recorrido).`,
          c.engine ? `d) El ciclo es horario y $W > 0$: es una máquina térmica. $e = \\frac{W}{Q_{abs}} = \\frac{${nf(H, c.Wn, 1)}}{${nf(H, c.Qin, 1)}} \\approx ${nf(H, eff, 4)}$.` : `d) El ciclo es antihorario y $W < 0$: es un refrigerador. Absorbe $Q_{abs} = ${nf(H, c.Qin, 1)}$ J por ciclo (de la fuente fría) con un trabajo de $${nf(H, -c.Wn, 1)}$ J: $K = \\frac{Q_{abs}}{|W|} \\approx ${nf(H, cop, 3)}$.`
        ],
        // además: el sentido de recorrido coincide con el tipo de dispositivo (máquina si W > 0)
        verify: cycleVerify(c, () => [(c.engine ? 1 : -1) * Math.sign(c.Wn) - 1])
      };
    }
  };

  // calorímetro con hielo y una esfera caliente: calor específico de la esfera
  T["f2b-ex-calorim-c"] = {
    type: "numeric", concepts: ["f2b-calor"], difficulty: 3, testN: 60,
    generate(r, H) {
      const cw = 4186, ci = 2100, Lf = 3.34e5, ccu = 390;
      const mc = r.pick([0.2, 0.3, 0.4, 0.5]), mw = r.pick([0.2, 0.25, 0.3, 0.4]), T0 = r.pick([18, 20, 22, 25]), mi = r.pick([0.03, 0.05, 0.08, 0.1]), Ti = -r.pick([5, 10, 15, 20]);
      const ms = r.pick([0.2, 0.3, 0.4, 0.5]), Ts = r.pick([120, 150, 200, 250, 300]), Tf = T0 + r.pick([-4, -2, 2, 4, 5]);
      const gain = mc * ccu * (Tf - T0) + mw * cw * (Tf - T0) + mi * (ci * (0 - Ti) + Lf + cw * Tf);
      const cs = gain / (ms * (Ts - Tf));
      if (!(cs > 100 && cs < 2000)) return null;
      return {
        prompt: `Un calorímetro de cobre de $${nf(H, mc * 1000, 0)}$ g contiene $${nf(H, mw * 1000, 0)}$ g de agua, todo en equilibrio a $${T0}\\,^\\circ$C. Se introducen a la vez un bloque de hielo de $${nf(H, mi * 1000, 0)}$ g a $${Ti}\\,^\\circ$C y una esfera de $${nf(H, ms * 1000, 0)}$ g de una aleación desconocida, a $${Ts}\\,^\\circ$C. Al llegar al equilibrio todo el hielo se fundió y la temperatura es $${Tf}\\,^\\circ$C. ¿Cuál es el calor específico de la esfera (J/(kg K))? ($c_{Cu} = 390$, $c_{agua} = 4186$, $c_{hielo} = 2100$ J/(kg K), $L_f = 3{,}34\\times10^5$ J/kg; sin pérdidas.)`,
        answer: cs,
        solution: [R`Sin pérdidas, la suma de todos los calores es cero: $Q_{Cu} + Q_{agua} + Q_{hielo} + Q_{esfera} = 0$.`,
          `El hielo se calienta hasta $0\\,^\\circ$C, se funde y el agua que forma llega a $${Tf}\\,^\\circ$C: $Q_{hielo} = m_h[c_h\\cdot${-Ti} + L_f + c_a\\cdot${Tf}] \\approx ${nf(H, mi * (ci * -Ti + Lf + cw * Tf), 0)}$ J.`,
          `Calorímetro y agua: $(m_{Cu}c_{Cu} + m_ac_a)(${Tf} - ${T0}) \\approx ${nf(H, (mc * ccu + mw * cw) * (Tf - T0), 0)}$ J.`,
          `La esfera entrega lo que ganan los demás: $m_ec_e(${Ts} - ${Tf}) = ${nf(H, gain, 0)}$ J, así que $c_e = \\frac{${nf(H, gain, 0)}}{${nf(H, ms)}\\cdot${Ts - Tf}} \\approx ${nf(H, cs, 1)}$ J/(kg K).`],
        // otro camino: se simula el intercambio de calor paso a paso (entalpías), con el hielo que se funde
        verify: { kind: "zero", tol: 2e-3, fn: c => {
          const Hice = T => (T < 0 ? mi * ci * T : mi * (Lf + cw * T)), Tice = h => (h < 0 ? h / (mi * ci) : h < mi * Lf ? 0 : (h - mi * Lf) / (mi * cw));
          const Cpool = mc * ccu + mw * cw;
          let hp = Cpool * T0, hi = Hice(Ti), hs = ms * c * Ts;
          const k = 0.5;  // W/K: acoplamiento de cada cuerpo con el agua
          for (let it = 0; it < 200000; it++) {
            const tp = hp / Cpool, ti = Tice(hi), ts = hs / (ms * c), dt = 20;
            const qi = k * (tp - ti) * dt, qs = k * (ts - tp) * dt;
            hi += qi; hs -= qs; hp += qs - qi;
            if (Math.abs(ts - tp) < 1e-6 && Math.abs(tp - ti) < 1e-6) break;
          }
          return [(hp / Cpool - Tf) / 10];
        } }
      };
    }
  };

  // dos barras en serie: temperatura de la unión en régimen estacionario
  T["f2b-ex-union-num"] = {
    type: "numeric", concepts: ["f2b-transferencia"], difficulty: 2,
    generate(r, H) {
      const mats = [["oro", 314], ["plata", 427], ["cobre", 401], ["aluminio", 237], ["latón", 109], ["acero", 50.2], ["plomo", 35.3]];
      const [m1, m2] = r.sample(mats, 2), Th = r.pick([60, 80, 100, 120]), Tc = r.pick([0, 10, 20, 30]), L1 = r.pick([1, 1, 2]), L2 = r.pick([1, 1, 3]);
      const g1 = m1[1] / L1, g2 = m2[1] / L2, Tj = (g1 * Th + g2 * Tc) / (g1 + g2);
      const same = L1 === L2;
      return {
        prompt: `Una barra de ${m1[0]} ($k = ${nf(H, m1[1], 1)}$ W/(m K)) y una de ${m2[0]} ($k = ${nf(H, m2[1], 1)}$ W/(m K)), de la misma sección, están unidas por un extremo y aisladas lateralmente${same ? ", y tienen la misma longitud" : L2 > L1 ? `; la de ${m2[0]} es ${L2 / L1} veces más larga que la de ${m1[0]}` : `; la de ${m1[0]} es ${L1 / L2} veces más larga que la de ${m2[0]}`}. El extremo libre de la de ${m1[0]} está a $${Th}\\,^\\circ$C y el de la de ${m2[0]}, a $${Tc}\\,^\\circ$C. En estado estacionario, ¿cuál es la temperatura de la unión (°C)?`,
        answer: Tj,
        solution: [R`En estado estacionario no se acumula energía en la unión: el flujo de calor por las dos barras es el mismo, $H = \frac{k_1A(T_1 - T)}{L_1} = \frac{k_2A(T - T_2)}{L_2}$.`,
          `Despejando: $T = \\frac{\\frac{k_1}{L_1}T_1 + \\frac{k_2}{L_2}T_2}{\\frac{k_1}{L_1} + \\frac{k_2}{L_2}} \\approx ${nf(H, Tj)}\\,^\\circ$C.`,
          R`La unión queda más cerca de la temperatura del extremo de la barra que conduce mejor (por unidad de longitud).`],
        // otro camino: ecuación del calor estacionaria discretizada (volúmenes finitos) resuelta con Thomas
        verify: { kind: "value", tol: 1e-6, fn: () => {
          const N1 = 40 * L1, N2 = 40 * L2, dx = 1 / 40, N = N1 + N2, k = i => (i < N1 ? m1[1] : m2[1]);
          // temperaturas en los centros de las celdas; conductancias entre celdas (en serie)
          const a = [], b = [], c = [], d = [];
          for (let i = 0; i < N; i++) {
            const gl = i === 0 ? 2 * k(0) / dx : 1 / (dx / (2 * k(i - 1)) + dx / (2 * k(i))), gr = i === N - 1 ? 2 * k(i) / dx : 1 / (dx / (2 * k(i)) + dx / (2 * k(i + 1)));
            a.push(i === 0 ? 0 : -gl); c.push(i === N - 1 ? 0 : -gr); b.push(gl + gr); d.push((i === 0 ? gl * Th : 0) + (i === N - 1 ? gr * Tc : 0));
          }
          for (let i = 1; i < N; i++) { const w = a[i] / b[i - 1]; b[i] -= w * c[i - 1]; d[i] -= w * d[i - 1]; }
          const x = new Array(N); x[N - 1] = d[N - 1] / b[N - 1];
          for (let i = N - 2; i >= 0; i--) x[i] = (d[i] - c[i] * x[i + 1]) / b[i];
          // temperatura en la interfaz entre la celda N1 − 1 y la N1
          const kl = k(N1 - 1), kr = k(N1);
          return (kl * x[N1 - 1] + kr * x[N1]) / (kl + kr);
        } }
      };
    }
  };

  // entropía de dos cuerpos iguales que llegan al equilibrio
  SELF["f2b-ex-entropia-dos"] = {
    concepts: ["f2b-entropia", "f2b-segunda-ley"],
    generate(r, H) {
      const m = r.pick([0.5, 1, 1.5, 2]), mat = r.pick([["cobre", 390], ["aluminio", 900], ["hierro", 450], ["agua", 4186]]), T1 = r.pick([280, 300, 320, 350]), T2 = T1 + r.pick([40, 60, 80, 100, 150]);
      const c = mat[1], Tf = (T1 + T2) / 2, dS = m * c * Math.log(Tf * Tf / (T1 * T2));
      return {
        prompt: `Dos cuerpos de ${mat[0]} ($c = ${c}$ J/(kg K)) de $${nf(H, m)}$ kg cada uno, a $T_1 = ${T1}$ K y $T_2 = ${T2}$ K, se ponen en contacto térmico dentro de un recipiente aislado hasta equilibrarse a $T$. a) Demostrá que el cambio total de entropía es $\\Delta S = mc\\ln\\frac{T^2}{T_1T_2}$. b) Con la conservación de la energía, expresá $T$ en función de $T_1$ y $T_2$. c) Demostrá que $\\Delta S$ no puede ser negativo y calculá su valor con los datos.`,
        rubric: [
          { text: R`a) Proceso reversible equivalente para cada cuerpo: $\Delta S_i = \int \frac{mc\,dT}{T} = mc\ln\frac{T}{T_i}$; la suma da $mc\ln\frac{T^2}{T_1T_2}$.`, w: 3 },
          { text: R`b) $mc(T - T_1) + mc(T - T_2) = 0 \Rightarrow T = \frac{T_1 + T_2}{2}$.`, w: 2 },
          { text: R`c) $\frac{T^2}{T_1T_2} = \frac{(T_1 + T_2)^2}{4T_1T_2} \ge 1$ porque $(T_1 + T_2)^2 - 4T_1T_2 = (T_1 - T_2)^2 \ge 0$; es $0$ solo si $T_1 = T_2$.`, w: 3 },
          { text: `c) $T = ${nf(H, Tf, 1)}$ K y $\\Delta S = ${nf(H, m * c)}\\ln\\frac{${nf(H, Tf * Tf, 0)}}{${T1 * T2}} \\approx ${nf(H, dS, 3)}$ J/K.`, w: 2 }
        ],
        solution: [
          R`a) La entropía es función de estado: se calcula con un proceso reversible entre los mismos estados, calentando o enfriando cada cuerpo de a poco. Para cada uno, $dS = \frac{dQ}{T} = \frac{mc\,dT}{T}$, así que $\Delta S_1 = mc\ln\frac{T}{T_1}$ y $\Delta S_2 = mc\ln\frac{T}{T_2}$. Sumando (propiedad del logaritmo): $\Delta S = mc\ln\frac{T^2}{T_1T_2}$.`,
          R`b) El recipiente está aislado: lo que cede uno lo gana el otro, $mc(T - T_1) + mc(T - T_2) = 0$, de donde $T = \frac{T_1 + T_2}{2}$.`,
          R`c) Reemplazando, $\frac{T^2}{T_1T_2} = \frac{(T_1 + T_2)^2}{4T_1T_2}$. Como $(T_1 + T_2)^2 - 4T_1T_2 = (T_1 - T_2)^2 \ge 0$, el cociente es $\ge 1$ y su logaritmo es $\ge 0$: $\Delta S \ge 0$, con igualdad solo si $T_1 = T_2$ (no hay proceso). Es la segunda ley en un sistema aislado.`,
          `Con los datos: $T = ${nf(H, Tf, 1)}$ K y $\\Delta S = ${nf(H, m)}\\cdot${c}\\cdot\\ln\\frac{${nf(H, Tf, 1)}^2}{${T1}\\cdot${T2}} \\approx ${nf(H, dS, 3)}$ J/K.`
        ],
        // otro camino: los cuerpos intercambian calor de a poco y se suma dQ/T de cada uno
        verify: { kind: "zero", tol: 1e-4, fn: () => {
          let a = T1, b = T2, S = 0;
          const C = m * c;
          for (let i = 0; i < 200000 && b - a > 1e-9; i++) { const dQ = 0.0005 * C * (b - a); S += dQ / ((a + a + dQ / C) / 2) - dQ / ((b + b - dQ / C) / 2); a += dQ / C; b -= dQ / C; }
          return [(S - dS) / Math.max(1e-3, Math.abs(dS)), (a - Tf) / Tf];
        } }
      };
    }
  };

  // cuerpo a temperatura constante que pierde calor por conducción y radiación: entropía
  SELF["f2b-ex-entropia-amb"] = {
    concepts: ["f2b-entropia", "f2b-transferencia"],
    generate(r, H) {
      const A = r.pick([0.02, 0.05, 0.08, 0.1]), Bc = r.pick([2, 3, 5]) * 1e-10, Th = r.pick([310, 311, 313]), Ta = r.pick([280, 285, 290, 295, 300]), dt = r.pick([60, 600, 3600]);
      const P = A * (Th - Ta) + Bc * (Th ** 4 - Ta ** 4), Samb = P * dt / Ta, Sb = -P * dt / Th, Stot = Samb + Sb;
      return {
        prompt: `Un huevo se mantiene (por mecanismos internos) a $T_h = ${Th}$ K en un ambiente muy grande a $T_a = ${Ta}$ K. Pierde calor a una tasa $P = A(T_h - T_a) + B(T_h^4 - T_a^4)$, con $A = ${nf(H, A)}$ W/K (conducción) y $B = ${sci(Bc, 1)}$ W/K⁴ (radiación). a) Calculá el cambio de entropía del ambiente en $${dt}$ s. b) Calculá el cambio de entropía asociado al calor que sale del huevo y el total. c) Con la segunda ley, explicá qué pasa si $T_a = T_h$ y por qué el total no puede ser negativo.`,
        rubric: [
          { text: `a) $P \\approx ${nf(H, P, 3)}$ W; el ambiente recibe $Q = P\\Delta t$ a $T_a$ constante: $\\Delta S_{amb} = \\frac{P\\Delta t}{T_a} \\approx ${nf(H, Samb, 3)}$ J/K.`, w: 3 },
          { text: `b) El calor sale a $T_h$: $\\Delta S = -\\frac{P\\Delta t}{T_h} \\approx ${nf(H, Sb, 3)}$ J/K, y el total es $P\\Delta t\\left(\\frac{1}{T_a} - \\frac{1}{T_h}\\right) \\approx ${nf(H, Stot, 4)}$ J/K $> 0$.`, w: 3 },
          { text: R`c) Si $T_a = T_h$, $P = 0$ y no hay flujo: la entropía no cambia. Huevo + ambiente es un sistema aislado, así que $\Delta S_{total} \ge 0$: el calor solo fluye espontáneamente del cuerpo caliente al frío.`, w: 2 }
        ],
        solution: [
          `a) $P = ${nf(H, A)}\\cdot${Th - Ta} + ${sci(Bc, 1)}\\cdot(${Th}^4 - ${Ta}^4) \\approx ${nf(H, P, 3)}$ W. El ambiente es tan grande que recibe ese calor sin cambiar de temperatura: $\\Delta S_{amb} = \\frac{Q}{T_a} = \\frac{P\\Delta t}{T_a} \\approx ${nf(H, Samb, 3)}$ J/K.`,
          `b) El calor $P\\Delta t$ sale del huevo a $T_h$, lo que aporta $-\\frac{P\\Delta t}{T_h} \\approx ${nf(H, Sb, 3)}$ J/K. Total: $\\Delta S = P\\Delta t\\,\\frac{T_h - T_a}{T_hT_a} \\approx ${nf(H, Stot, 4)}$ J/K, positivo porque $T_h > T_a$.`,
          R`c) Si $T_a = T_h$, los dos términos de $P$ se anulan: no hay flujo de calor y la entropía no cambia. En general, huevo + ambiente forman un sistema aislado y la segunda ley exige $\Delta S_{total} \ge 0$: como $\frac{T_h - T_a}{T_hT_a}$ tiene el signo de $P$, el producto nunca es negativo.`
        ],
        verify: { kind: "zero", tol: 1e-9, fn: () => {
          // la potencia, sumando el flujo por conducción y por radiación por separado, y el total con la forma factorizada
          const Pc = A * (Th - Ta), Pr = Bc * (Th - Ta) * (Th + Ta) * (Th * Th + Ta * Ta);
          return [(Pc + Pr - P) / P, ((Pc + Pr) * dt * (Th - Ta) / (Th * Ta) - Stot) / Stot];
        } }
      };
    }
  };

  // ---------- ondas ----------
  // movimiento de una partícula de la cuerda en un punto y un instante dados
  T["f2b-ex-particula-mc"] = {
    type: "mc", concepts: ["f2b-ondas"], difficulty: 2,
    generate(r, H) {
      const fn = r.pick(["cos", "sen"]), s = r.pick([1, -1]);
      const [ax, axT] = r.pick([[0, "0"], [1 / 8, R`\frac{\lambda}{8}`], [1 / 6, R`\frac{\lambda}{6}`], [1 / 4, R`\frac{\lambda}{4}`], [1 / 3, R`\frac{\lambda}{3}`], [1 / 2, R`\frac{\lambda}{2}`], [3 / 4, R`\frac{3\lambda}{4}`]]);
      const [bt, btT] = r.pick([[0, "0"], [1 / 8, R`\frac{T}{8}`], [1 / 4, R`\frac{T}{4}`], [1 / 2, R`\frac{T}{2}`], [3 / 4, R`\frac{3T}{4}`]]);
      const f = fn === "cos" ? Math.cos : Math.sin, df = fn === "cos" ? x => -Math.sin(x) : Math.cos;
      const phi = 2 * Math.PI * (ax + s * bt), y = f(phi), v = df(phi) * s * 2 * Math.PI;  // en unidades de A y 1/T
      const cats = ["quieta en un máximo; la fuerza apunta hacia abajo", "quieta en un mínimo; la fuerza apunta hacia arriba", "pasa por $y = 0$ subiendo, con rapidez máxima y fuerza nula", "pasa por $y = 0$ bajando, con rapidez máxima y fuerza nula", "sube y acelera (fuerza hacia arriba)", "sube y frena (fuerza hacia abajo)", "baja y acelera (fuerza hacia abajo)", "baja y frena (fuerza hacia arriba)"];
      const classify = (y, v, eps) => (Math.abs(v) < eps ? (y > 0 ? 0 : 1) : Math.abs(y) < eps ? (v > 0 ? 2 : 3) : v > 0 ? (y < 0 ? 4 : 5) : (y > 0 ? 6 : 7));
      const k = classify(y, v, 1e-9), word = s > 0 ? "+" : "-";
      const { options, correct } = H.mc(r, cats[k], r.shuffle(cats.filter((_, i) => i !== k)), { text: true });
      return {
        prompt: `Una onda en una cuerda es $y(x, t) = A\\${fn === "cos" ? "cos" : "operatorname{sen}"}(kx ${word} \\omega t)$, con $\\lambda$ la longitud de onda y $T$ el período. ¿Qué hace la partícula de la cuerda que está en $x = ${axT}$ en el instante $t = ${btT}$?`,
        options, correct,
        solution: [`Su velocidad es $v_y = \\frac{\\partial y}{\\partial t}$ y su aceleración, $a_y = -\\omega^2 y$ (la fuerza tiene el sentido de $a_y$). La partícula acelera si $v_y$ y $a_y$ tienen el mismo signo.`,
          `Fase: $kx ${word} \\omega t = 2\\pi\\left(${H0(ax)} ${word} ${H0(bt)}\\right)$. Ahí $y = ${fmt(y, "A")}$ y $v_y = ${fmt(v / (2 * Math.PI), "\\omega A")}$.`,
          `Entonces la partícula ${cats[k]}.`],
        verify: { kind: "truth", target: true, fn: () => {
          // con diferencias finitas en el tiempo
          const Y = t => f(2 * Math.PI * (ax + s * t)), h = 1e-5;
          const vn = (Y(bt + h) - Y(bt - h)) / (2 * h), an = (Y(bt + h) - 2 * Y(bt) + Y(bt - h)) / (h * h);
          const yy = Y(bt), kk = classify(yy, vn, 1e-6);
          return kk === k && (Math.abs(yy) < 1e-6 || Math.sign(an) === -Math.sign(yy));
        } }
      };
      function H0(x) { return x === 0 ? "0" : x === 1 / 8 ? R`\frac18` : x === 1 / 6 ? R`\frac16` : x === 1 / 4 ? R`\frac14` : x === 1 / 3 ? R`\frac13` : x === 1 / 2 ? R`\frac12` : R`\frac34`; }
      function fmt(x, u) { const z = Math.abs(x) < 1e-12 ? 0 : +x.toFixed(3); return z === 0 ? "0" : z === 1 ? u : z === -1 ? `-${u}` : `${String(z).replace(".", "{,}")}\\,${u}`; }
    }
  };

  // radar: Doppler doble
  T["f2b-ex-radar-num"] = {
    type: "numeric", concepts: ["f2b-sonido"], difficulty: 3,
    generate(r, H) {
      const f0 = r.pick([20, 25, 30, 35, 40]) * 1e3, kmh = r.pick([54, 72, 86.4, 90, 108, 120]), u = kmh / 3.6, ask = r.pick(["auto", "vuelta", "pulsos"]);
      const f1 = f0 * (vSon + u) / vSon, f2 = f1 * vSon / (vSon - u);
      const ans = ask === "auto" ? f1 : ask === "vuelta" ? f2 : f2 - f0;
      return {
        prompt: `Un radar de velocidad emite sonido de $${nf(H, f0 / 1e3, 0)}$ kHz hacia un auto que se acerca a $${nf(H, kmh, 1)}$ km/h. ${ask === "auto" ? "¿Con qué frecuencia (Hz) recibe la onda el auto?" : ask === "vuelta" ? "¿Con qué frecuencia (Hz) vuelve al radar la onda reflejada por el auto?" : "¿Cuál es la diferencia (Hz) entre la frecuencia que vuelve al radar y la emitida (la frecuencia de pulsaciones)?"} (Velocidad del sonido: $344$ m/s.)`,
        answer: ans, tolerance: ask === "pulsos" ? 0.01 : 0.0005,
        solution: [`El auto es un receptor que se acerca a la fuente quieta: $f_1 = f_0\\frac{v + u}{v} = ${nf(H, f0, 0)}\\cdot\\frac{344 + ${nf(H, u, 2)}}{344} \\approx ${nf(H, f1, 1)}$ Hz.`,
          `Al reflejarla, el auto es una fuente que se acerca al radar quieto: $f_2 = f_1\\frac{v}{v - u} \\approx ${nf(H, f2, 1)}$ Hz.`,
          ask === "pulsos" ? `Diferencia: $f_2 - f_0 \\approx ${nf(H, f2 - f0, 1)}$ Hz.` : `La respuesta es $${nf(H, ans, 1)}$ Hz.`],
        // otro camino: se siguen dos crestas consecutivas en su ida y vuelta
        verify: { kind: "value", tol: 1e-7, fn: () => {
          const X0 = 500, hit = tn => (X0 + vSon * tn) / (vSon + u), back = tn => { const th = hit(tn); return th + (X0 - u * th) / vSon; };
          const g1 = 1 / (hit(1 / f0) - hit(0)), g2 = 1 / (back(1 / f0) - back(0));
          return ask === "auto" ? g1 : ask === "vuelta" ? g2 : g2 - f0;
        } }
      };
    }
  };

  // onda estacionaria y(x, t) = A sen(kx) sen(ωt)
  SELF["f2b-ex-estacionaria"] = {
    concepts: ["f2b-ondas"],
    generate(r, H) {
      const n = r.pick([2, 3, 4]), L = r.pick([50, 60, 75, 100, 120, 150]), m = r.pick([10, 15, 20, 25, 30, 45]), A = r.pick([2, 3, 4, 5]);
      const k = n * Math.PI / L, w = n * m * Math.PI, v = w / k / 100, vmax = A * w / 100;
      const ord = ["", "primer", "segundo", "tercer", "cuarto"][n];
      return {
        prompt: `Una cuerda tensa, atada en los dos extremos, oscila en su ${ord} armónico según $y(x, t) = (${A}\\ \\text{cm})\\operatorname{sen}\\left[\\left(${H.frac(n, L)}\\pi\\ \\text{rad/cm}\\right)x\\right]\\operatorname{sen}\\left[(${n * m}\\pi\\ \\text{rad/s})\\,t\\right]$, con el origen en el extremo izquierdo. a) ¿Cuál es la rapidez de las ondas viajeras (m/s)? b) ¿Cuál es la rapidez transversal máxima de la cuerda (m/s)? c) ¿Qué largo tiene la cuerda y qué ecuación tendría si vibrara en su primer armónico (con amplitud $A_1$)?`,
        rubric: [
          { text: `a) $v = \\frac{\\omega}{k} = \\frac{${n * m}\\pi}{${H.frac(n, L)}\\pi} = ${m * L}$ cm/s $= ${nf(H, v)}$ m/s.`, w: 3 },
          { text: `b) $v_y = \\frac{\\partial y}{\\partial t} = A\\omega\\operatorname{sen}(kx)\\cos(\\omega t)$, máxima en los antinodos: $A\\omega = ${A}\\cdot${n * m}\\pi \\approx ${nf(H, vmax, 3)}$ m/s.`, w: 3 },
          { text: `c) En el armónico $n$, $L = \\frac{n\\lambda}{2} = \\frac{n\\pi}{k} = ${L}$ cm; el primero tiene $k_1 = \\frac{\\pi}{${L}}$ rad/cm y $\\omega_1 = \\frac{\\omega}{${n}} = ${m}\\pi$ rad/s: $y = A_1\\operatorname{sen}\\left(\\frac{\\pi x}{${L}}\\right)\\operatorname{sen}(${m}\\pi t)$.`, w: 4 }
        ],
        solution: [
          `a) La onda estacionaria es la superposición de dos viajeras con el mismo $k$ y el mismo $\\omega$; su rapidez es $v = \\frac{\\omega}{k} = ${m * L}$ cm/s $= ${nf(H, v)}$ m/s.`,
          `b) Derivando respecto de $t$: $v_y = A\\omega\\operatorname{sen}(kx)\\cos(\\omega t)$. Su máximo es $A\\omega = ${A}\\ \\text{cm}\\cdot${n * m}\\pi\\ \\text{s}^{-1} \\approx ${nf(H, vmax * 100, 1)}$ cm/s $\\approx ${nf(H, vmax, 3)}$ m/s, en los antinodos.`,
          `c) Los extremos son nodos: $\\operatorname{sen}(kL) = 0$, y en el ${ord} armónico $kL = ${n}\\pi$, así que $L = ${L}$ cm. El primer armónico tiene $\\lambda_1 = 2L$, o sea $k_1 = \\frac{\\pi}{${L}}$ rad/cm, y la misma rapidez $v$ (la cuerda es la misma): $\\omega_1 = vk_1 = ${m}\\pi$ rad/s. Queda $y(x, t) = A_1\\operatorname{sen}\\left(\\frac{\\pi x}{${L}}\\right)\\operatorname{sen}(${m}\\pi t)$.`
        ],
        verify: { kind: "zero", tol: 1e-4, fn: () => {
          // cumple la ecuación de onda con esa v (diferencias finitas) y la rapidez máxima sale de muestrear v_y
          const Y = (x, t) => A * Math.sin(k * x) * Math.sin(w * t), hx = 1e-3, ht = 1e-6, vc = v * 100, res = [];
          for (const [x, t] of [[L / 7, 0.013], [L / 3, 0.071], [0.8 * L, 0.2]]) {
            const ytt = (Y(x, t + ht) - 2 * Y(x, t) + Y(x, t - ht)) / (ht * ht), yxx = (Y(x + hx, t) - 2 * Y(x, t) + Y(x - hx, t)) / (hx * hx);
            res.push((ytt - vc * vc * yxx) / (A * w * w));
          }
          let mx = 0;
          for (let i = 0; i <= 4000; i++) for (const tt of [0, Math.PI / w]) mx = Math.max(mx, Math.abs((Y(i * L / 4000, tt + ht) - Y(i * L / 4000, tt - ht)) / (2 * ht)));
          res.push((mx / 100 - vmax) / vmax, Math.sin(k * L), Math.sin(Math.PI / L * L));
          return res;
        } }
      };
    }
  };

  // onda estacionaria electromagnética frente a un metal: distancias entre nodos
  T["f2b-ex-em-nodos-num"] = {
    type: "numeric", concepts: ["f2b-em"], difficulty: 2,
    generate(r, H) {
      const [f, uso] = r.pick([[2.4e9, "el wifi"], [5e9, "el wifi de 5 GHz"], [0.9e9, "un celular"], [1.8e9, "un celular"], [10e9, "un radar"]]);
      const lam = cLuz / f * 100, ask = r.pick(["EB", "EE", "sB", "sE"]);
      const ans = ask === "EB" || ask === "sB" ? lam / 4 : lam / 2;
      const q = { EB: "un nodo del campo eléctrico y el nodo del campo magnético más cercano", EE: "dos nodos consecutivos del campo eléctrico", sB: "la superficie del metal y el nodo del campo magnético más cercano", sE: "la superficie del metal y el primer nodo del campo eléctrico fuera de ella" }[ask];
      return {
        prompt: `Las ondas electromagnéticas de ${uso} tienen $${nf(H, f / 1e9, 1)}$ GHz. Una de ellas se refleja en una placa metálica y forma una onda estacionaria. ¿Cuál es la distancia (cm) entre ${q}? ($c = 3\\times10^8$ m/s)`,
        answer: ans,
        solution: [`$\\lambda = \\frac{c}{f} = ${nf(H, lam, 3)}$ cm.`,
          R`En el metal (conductor) el campo eléctrico tangencial se anula: la superficie es un nodo de $\vec E$. Los nodos de $\vec E$ están separados $\frac{\lambda}{2}$, y los de $\vec B$ están a mitad de camino (donde $\vec E$ tiene antinodos), a $\frac{\lambda}{4}$ de los de $\vec E$.`,
          `La distancia pedida es $${ask === "EB" || ask === "sB" ? R`\frac{\lambda}{4}` : R`\frac{\lambda}{2}`} = ${nf(H, ans, 3)}$ cm.`],
        // otro camino: se buscan los ceros de E(x) ∝ sen(kx) y B(x) ∝ cos(kx) por barrido y bisección
        verify: { kind: "value", tol: 1e-7, fn: () => {
          const kk = 2 * Math.PI / lam, zeros = g => { const zs = []; let x = 1e-9, gx = g(x); for (let i = 1; i <= 4000 && zs.length < 3; i++) { const x2 = i * lam / 2000, g2 = g(x2); if (gx * g2 <= 0) { let a = x, b = x2; for (let j = 0; j < 80; j++) { const mm = (a + b) / 2; if (g(a) * g(mm) <= 0) b = mm; else a = mm; } zs.push((a + b) / 2); } x = x2; gx = g2; } return zs; };
          const zE = zeros(x => Math.sin(kk * x)), zB = zeros(x => Math.cos(kk * x));
          return ask === "EB" ? Math.abs(zB[0] - zE[0]) : ask === "EE" ? zE[1] - zE[0] : ask === "sB" ? zB[0] : zE[0];
        } }
      };
    }
  };

  // cuerda de guitarra: tensión, antinodos y función de onda
  SELF["f2b-ex-guitarra"] = {
    concepts: ["f2b-ondas", "f2b-sonido"],
    generate(r, H) {
      const m = r.pick([0.8, 1, 1.2, 1.5, 2]) * 1e-3, L = r.pick([0.6, 0.65, 0.7]), n = r.pick([2, 3, 4]), f = r.pick([800, 1000, 1500, 2000]);
      const mu = m / L, lam = 2 * L / n, v = lam * f, Tn = mu * v * v;
      const ord = ["", "primer", "segundo", "tercer", "cuarto"][n];
      return {
        prompt: `Una cuerda de guitarra de $${nf(H, m * 1e3, 1)}$ g y $${nf(H, L * 100, 0)}$ cm, atada en los dos extremos, vibra en su ${ord} armónico y produce en el aire un sonido de $${f}$ Hz. a) ¿Cuál es la tensión de la cuerda? b) ¿Cuántos antinodos se ven en la cuerda? c) Escribí la función de onda de esa onda estacionaria.`,
        rubric: [
          { text: `a) $\\lambda = \\frac{2L}{${n}} = ${nf(H, lam, 3)}$ m, $v = \\lambda f = ${nf(H, v, 1)}$ m/s y $\\mu = \\frac{m}{L} = ${sci(mu)}$ kg/m.`, w: 2 },
          { text: `a) $T = \\mu v^2 \\approx ${nf(H, Tn, 1)}$ N (el sonido tiene la misma frecuencia que la cuerda).`, w: 2 },
          { text: `b) ${n} antinodos (y ${n + 1} nodos, contando los extremos).`, w: 2 },
          { text: `c) $y(x, t) = A\\operatorname{sen}(${nf(H, 2 * Math.PI / lam, 2)}\\,x)\\cos(${nf(H, 2 * Math.PI * f, 0)}\\,t)$ (SI), con $k = \\frac{${n}\\pi}{L}$ y $\\omega = 2\\pi f$.`, w: 2 }
        ],
        solution: [
          `a) La cuerda vibra con la misma frecuencia que el sonido que produce: $f = ${f}$ Hz. En el ${ord} armónico entran ${n} medias longitudes de onda: $\\lambda = \\frac{2L}{${n}} = ${nf(H, lam, 3)}$ m, así que $v = \\lambda f = ${nf(H, v, 1)}$ m/s.`,
          `Con $v = \\sqrt{T/\\mu}$ y $\\mu = \\frac{${nf(H, m * 1e3, 1)}\\times10^{-3}}{${nf(H, L, 2)}} = ${sci(mu)}$ kg/m: $T = \\mu v^2 \\approx ${nf(H, Tn, 1)}$ N.`,
          `b) Cada media longitud de onda tiene un antinodo: hay ${n}.`,
          `c) Con nodos en $x = 0$ y $x = L$: $y(x, t) = A\\operatorname{sen}(kx)\\cos(\\omega t)$, con $k = \\frac{2\\pi}{\\lambda} \\approx ${nf(H, 2 * Math.PI / lam, 2)}$ rad/m y $\\omega = 2\\pi f \\approx ${nf(H, 2 * Math.PI * f, 0)}$ rad/s.`
        ],
        // otro camino: se simula la cuerda con diferencias finitas (esquema exacto con número de Courant 1)
        verify: { kind: "zero", tol: 2e-3, fn: () => {
          const N = 60 * n, dx = L / N, c = Math.sqrt(Tn / mu), dt = dx / c, ia = N / (2 * n);
          let prev = [], cur = [];
          for (let i = 0; i <= N; i++) cur.push(Math.sin(n * Math.PI * i / N));
          // primer paso con velocidad inicial nula
          let next = cur.map((y, i) => (i === 0 || i === N ? 0 : 0.5 * (cur[i - 1] + cur[i + 1])));
          prev = cur; cur = next;
          let t = dt;
          while (cur[ia] > 0) { next = cur.map((y, i) => (i === 0 || i === N ? 0 : cur[i - 1] + cur[i + 1] - prev[i])); prev = cur; cur = next; t += dt; }
          const t0 = t - dt * cur[ia] / (cur[ia] - prev[ia]);  // cruce por cero = cuarto de período
          return [(1 / (4 * t0) - f) / f];
        } }
      };
    }
  };

  // ---------- óptica ----------
  // doble rendija: posición de un máximo o un mínimo
  T["f2b-ex-young-pos-num"] = {
    type: "numeric", concepts: ["f2b-interferencia"], difficulty: 2,
    generate(r, H) {
      const d = r.pick([0.2, 0.25, 0.3, 0.4, 0.5]), L = r.pick([1, 1.2, 1.5, 2]), lam = r.pick([450, 500, 546, 589, 633, 650]), m = r.int(1, 25), max = r.bool();
      const y = (max ? m : m - 0.5) * lam * 1e-9 * L / (d * 1e-3) * 1e3;
      if (y * 1e-3 / L > 0.05) return null;  // que la aproximación de ángulos pequeños valga
      return {
        prompt: `En un experimento de doble rendija, $d = ${nf(H, d)}$ mm, $L = ${nf(H, L, 1)}$ m y $\\lambda = ${lam}$ nm. ¿A qué distancia (mm) del centro de la pantalla está ${max ? `el máximo de orden ${m}` : `el ${m}.º mínimo (contando desde el centro)`}? (Ángulos pequeños.)`,
        answer: y,
        solution: [max ? R`Hay interferencia constructiva si la diferencia de caminos es un número entero de longitudes de onda: $d\operatorname{sen}\theta = m\lambda$.` : R`Hay interferencia destructiva si la diferencia de caminos es un número semientero de longitudes de onda: $d\operatorname{sen}\theta = \left(m - \frac12\right)\lambda$ para el $m$-ésimo mínimo.`,
          `Con ángulos pequeños, $y = L\\tan\\theta \\approx L\\operatorname{sen}\\theta$: $y = ${max ? m : `${nf(H, m - 0.5, 1)}`}\\cdot\\frac{\\lambda L}{d} \\approx ${nf(H, y, 3)}$ mm.`],
        // otro camino: diferencia de caminos exacta hasta ese punto de la pantalla
        verify: { kind: "zero", tol: 2e-3, fn: yy => { const Y = yy * 1e-3, dd = d * 1e-3, D = Math.hypot(L, Y + dd / 2) - Math.hypot(L, Y - dd / 2); return [D / (lam * 1e-9) / (max ? m : m - 0.5) - 1]; } }
      };
    }
  };

  // luz blanca: qué longitudes de onda tienen un máximo en una posición
  T["f2b-ex-luz-blanca-num"] = {
    type: "numeric", concepts: ["f2b-interferencia"], difficulty: 3,
    generate(r, H) {
      const d = r.pick([0.2, 0.3, 0.4, 0.5]), L = r.pick([1, 1.2, 1.5]), y = r.pick([2.2, 3, 4.5, 6, 8, 10]), ask = r.pick(["mayor", "menor", "cuantas"]);
      const D = y * d / L * 1e3;  // diferencia de caminos en nm
      const ls = [];
      for (let m = 1; m < 100; m++) { const l = D / m; if (l >= 400 && l <= 700) ls.push(l); }
      if (!ls.length) return null;
      // sin casos al borde del intervalo (ahí la aproximación de ángulos pequeños podría cambiar la cuenta)
      for (let m = 1; m < 100; m++) if (Math.abs(D / m - 400) < 1 || Math.abs(D / m - 700) < 1) return null;
      const ans = ask === "mayor" ? ls[0] : ask === "menor" ? ls[ls.length - 1] : ls.length;
      return {
        prompt: `Una doble rendija con $d = ${nf(H, d)}$ mm se ilumina con luz blanca (de $400$ a $700$ nm) y la pantalla está a $${nf(H, L, 1)}$ m. En el punto de la pantalla a $${nf(H, y, 1)}$ mm del centro, ${ask === "cuantas" ? "¿cuántas longitudes de onda del visible tienen un máximo de interferencia?" : `¿cuál es la ${ask} longitud de onda (nm) del visible que tiene ahí un máximo de interferencia?`} (Ángulos pequeños.)`,
        answer: ans,
        solution: [`La diferencia de caminos en ese punto es $\\Delta = \\frac{yd}{L} = ${nf(H, D, 1)}$ nm. Hay un máximo si $\\Delta = m\\lambda$, o sea $\\lambda = \\frac{${nf(H, D, 1)}}{m}$ nm.`,
          `Las que caen entre $400$ y $700$ nm: ${ls.map(l => `$${nf(H, l, 1)}$`).join(", ")} nm.`,
          `Respuesta: $${ask === "cuantas" ? ls.length : nf(H, ans, 1)}$${ask === "cuantas" ? "" : " nm"}.`],
        // otro camino: diferencia de caminos exacta y barrido de las longitudes de onda
        verify: { kind: "value", tol: 3e-3, fn: () => {
          const Y = y * 1e-3, dd = d * 1e-3, Dx = (Math.hypot(L, Y + dd / 2) - Math.hypot(L, Y - dd / 2)) * 1e9, found = [];
          let prev = Math.floor(Dx / 400);
          for (let l = 400; l <= 700.0001; l += 0.01) { const q = Math.floor(Dx / l); if (q !== prev) { found.push(Dx / prev); prev = q; } }
          if (Dx / 400 === Math.floor(Dx / 400)) found.unshift(400);
          const all = found.filter(l => l >= 400 && l <= 700).sort((a, b) => b - a);
          return ask === "mayor" ? all[0] : ask === "menor" ? all[all.length - 1] : all.length;
        } }
      };
    }
  };

  // cuña de aire: espesor del separador a partir de las franjas
  T["f2b-ex-cuna-num"] = {
    type: "numeric", concepts: ["f2b-interferencia"], difficulty: 2,
    generate(r, H) {
      const lam = r.pick([500, 546, 589, 600, 633]), N = r.int(8, 40), L = r.pick([2.5, 3, 3.5, 4, 5]);
      const h = N * lam / 2 / 1000;  // μm
      return {
        prompt: `Dos placas de vidrio planas se tocan en un borde y en el otro están separadas por un alambre fino de diámetro $h$, formando una cuña de aire de $${nf(H, L, 1)}$ cm de largo. Con luz de $${lam}$ nm a incidencia normal se cuentan $${N}$ franjas brillantes a lo largo de la cuña. ¿Cuánto vale $h$ (μm)?`,
        answer: h,
        solution: [R`La luz reflejada en la cara de abajo del vidrio de arriba no cambia de fase, y la reflejada en el vidrio de abajo (aire → vidrio) cambia en media longitud de onda. Hay una franja brillante donde $2t = \left(m + \frac12\right)\lambda$: en el borde que se toca ($t = 0$) la franja es oscura.`,
          `De una franja brillante a la siguiente el espesor aumenta $\\frac{\\lambda}{2}$. Con ${N} franjas a lo largo de la cuña, $h \\approx ${N}\\cdot\\frac{\\lambda}{2} = ${nf(H, h, 3)}$ μm.`],
        // otro camino: se cuentan los máximos de la intensidad reflejada a lo largo de la cuña
        verify: { kind: "zero", tol: 1e-9, fn: hh => {
          const I = x => Math.sin(2 * Math.PI * (hh * 1000) * x / lam) ** 2;  // 2t/λ + ½ → sen²(2πt/λ)
          let cnt = 0, a = I(0), b = I(1e-6);
          for (let i = 2; i <= 200000; i++) { const c = I(i / 200000); if (b > a && b >= c) cnt++; a = b; b = c; }
          return [cnt - N];
        } }
      };
    }
  };

  // interferencia con difracción: un orden de interferencia que falta
  SELF["f2b-ex-interf-difr"] = {
    concepts: ["f2b-interferencia", "f2b-difraccion"],
    generate(r, H) {
      const d = r.pick([12, 15, 18, 20, 24, 30]), m = r.pick([3, 4, 5, 6]), lam = r.pick([450, 500, 550, 600, 633]);
      const a = d / m, dth = deg(Math.asin(lam / 1000 / d)), th1 = deg(Math.asin(lam / 1000 / a));
      if (lam / 1000 / a >= 1) return null;
      return {
        prompt: `En un experimento de doble rendija la difracción no es despreciable. Las rendijas están separadas $d = ${d}$ μm y se usa luz de $${lam}$ nm. Se observa que el máximo de interferencia de orden ${m} coincide con el primer mínimo de difracción. a) ¿Qué ancho tiene cada rendija? b) ¿Qué separación angular hay entre el máximo central y el primer máximo de interferencia? c) ¿Qué separación angular hay entre el primer mínimo de difracción y el máximo central? ¿Cuántas franjas brillantes hay dentro del máximo central de difracción?`,
        rubric: [
          { text: `a) $d\\operatorname{sen}\\theta = ${m}\\lambda$ y $a\\operatorname{sen}\\theta = \\lambda$ en el mismo ángulo: $a = \\frac{d}{${m}} = ${nf(H, a)}$ μm.`, w: 2 },
          { text: `b) $\\operatorname{sen}\\theta_1 = \\frac{\\lambda}{d}$: $\\theta_1 \\approx ${nf(H, dth, 3)}^\\circ$.`, w: 2 },
          { text: `c) $\\operatorname{sen}\\theta = \\frac{\\lambda}{a}$: $\\theta \\approx ${nf(H, th1, 3)}^\\circ$, y dentro del máximo central quedan $2\\cdot${m - 1} + 1 = ${2 * m - 1}$ franjas brillantes (el orden ${m} falta).`, w: 2 }
        ],
        solution: [
          `a) El máximo de orden ${m} de interferencia cumple $d\\operatorname{sen}\\theta = ${m}\\lambda$, y el primer mínimo de difracción, $a\\operatorname{sen}\\theta = \\lambda$. Si coinciden, dividiendo: $\\frac{d}{a} = ${m}$, así que $a = ${nf(H, a)}$ μm.`,
          `b) Máximos de interferencia: $\\operatorname{sen}\\theta_k = \\frac{k\\lambda}{d}$. Para $k = 1$: $\\operatorname{sen}\\theta_1 = \\frac{${lam}\\times10^{-9}}{${d}\\times10^{-6}} \\approx ${nf(H, lam / 1000 / d, 4)}$, $\\theta_1 \\approx ${nf(H, dth, 3)}^\\circ$ (con ángulos chicos, la separación entre máximos consecutivos es casi constante).`,
          `c) Primer mínimo de difracción: $\\operatorname{sen}\\theta = \\frac{\\lambda}{a} \\approx ${nf(H, lam / 1000 / a, 4)}$, $\\theta \\approx ${nf(H, th1, 3)}^\\circ$. Los órdenes $0, \\pm1, \\dots, \\pm${m - 1}$ quedan dentro: ${2 * m - 1} franjas brillantes.`
        ],
        // otro camino: intensidad del patrón I(θ) = cos²(πd sen θ/λ)·sinc²(πa sen θ/λ)
        verify: { kind: "zero", tol: 1e-6, fn: () => {
          const I = s => { const b = Math.PI * a * s / (lam / 1000), sc = Math.abs(b) < 1e-12 ? 1 : Math.sin(b) / b; return Math.cos(Math.PI * d * s / (lam / 1000)) ** 2 * sc * sc; };
          // primer cero de la envolvente de difracción: barrido y bisección sobre sen(πa s/λ)
          const env = x => Math.sin(Math.PI * a * x / (lam / 1000));
          let lo = 0, hi = 0;
          for (let i = 1; i < 20000; i++) { const x = i / 20000; if (env(x) <= 0) { lo = (i - 1) / 20000; hi = x; break; } }
          for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (env(mid) > 0) lo = mid; else hi = mid; }
          const s0 = (lo + hi) / 2;
          // las franjas brillantes dentro del máximo central y el orden que falta
          let bright = 0;
          for (let k = -(m + 1); k <= m + 1; k++) { const x = k * lam / 1000 / d; if (Math.abs(x) < s0 - 1e-9 && I(x) > 1e-3) bright++; }
          return [(deg(Math.asin(s0)) - th1) / th1, I(m * lam / 1000 / d), bright - (2 * m - 1)];
        } }
      };
    }
  };

  // doble rendija con un orden faltante: posición de un orden alto, ancho y orden máximo
  SELF["f2b-ex-young-faltante"] = {
    concepts: ["f2b-interferencia", "f2b-difraccion"],
    generate(r, H) {
      const d = r.pick([0.015, 0.02, 0.025, 0.03]), lam = r.pick([450, 532, 600, 633, 660]), L = r.pick([2, 3, 4, 5]), m = r.pick([3, 4, 5, 6]);
      // un orden alto pero con θ < 45°, como en el examen
      const nmax0 = Math.floor(d * 1e-3 / (lam * 1e-9) - 1e-9), q = r.int(Math.max(5, Math.floor(0.3 * nmax0)), Math.floor(0.7 * nmax0));
      if (q % m === 0) return null;
      const s = q * lam * 1e-9 / (d * 1e-3), y = L * Math.tan(Math.asin(s)), a = d / m * 1e3;
      let qmax = nmax0;
      while (qmax % m === 0) qmax--;
      return {
        prompt: `Por dos ranuras angostas separadas $${nf(H, d, 3)}$ mm pasa luz coherente de $${lam}$ nm, y el patrón se observa en una pantalla a $${L}$ m. Se observa que la franja de orden ${m} no aparece. a) ¿A qué distancia del centro de la pantalla está la franja de orden ${q}? b) ¿Cuál es el ancho de las ranuras? c) ¿Cuál es el orden máximo de franja brillante que se ve?`,
        rubric: [
          { text: `a) $\\operatorname{sen}\\theta = \\frac{${q}\\lambda}{d} \\approx ${nf(H, s, 4)}$ (no es un ángulo chico): $\\theta \\approx ${nf(H, deg(Math.asin(s)), 2)}^\\circ$ e $y = L\\tan\\theta \\approx ${nf(H, y, 3)}$ m.`, w: 4 },
          { text: `b) El orden ${m} falta porque coincide con el primer mínimo de difracción: $a = \\frac{d}{${m}} \\approx ${nf(H, a, 2)}$ μm.`, w: 3 },
          { text: `c) $\\operatorname{sen}\\theta < 1 \\Rightarrow k < \\frac{d}{\\lambda} \\approx ${nf(H, d * 1e-3 / (lam * 1e-9), 2)}$; sin contar los múltiplos de ${m}, el máximo orden visible es ${qmax}.`, w: 3 }
        ],
        solution: [
          `a) Máximo de orden $k$: $d\\operatorname{sen}\\theta = k\\lambda$. Para $k = ${q}$: $\\operatorname{sen}\\theta = \\frac{${q}\\cdot${lam}\\times10^{-9}}{${nf(H, d, 3)}\\times10^{-3}} \\approx ${nf(H, s, 4)}$. No es un ángulo chico, así que no vale $y \\approx L\\theta$: $\\theta \\approx ${nf(H, deg(Math.asin(s)), 2)}^\\circ$ e $y = L\\tan\\theta \\approx ${nf(H, y, 3)}$ m.`,
          `b) Una franja de interferencia falta cuando cae en un mínimo de difracción: $d\\operatorname{sen}\\theta = ${m}\\lambda$ y $a\\operatorname{sen}\\theta = \\lambda$ a la vez, así que $a = \\frac{d}{${m}} \\approx ${nf(H, a, 2)}$ μm.`,
          `c) Como $\\operatorname{sen}\\theta \\le 1$, los órdenes posibles cumplen $k \\le \\frac{d}{\\lambda} \\approx ${nf(H, d * 1e-3 / (lam * 1e-9), 2)}$ (el ángulo de $90^\\circ$ no llega a la pantalla). Faltan los múltiplos de ${m}: el orden más alto que se ve es ${qmax}.`
        ],
        verify: { kind: "zero", tol: 1e-6, fn: () => {
          const lm = lam * 1e-9, dd = d * 1e-3, aa = a * 1e-6;
          const I = sn => { const b = Math.PI * aa * sn / lm, sc = Math.abs(b) < 1e-12 ? 1 : Math.sin(b) / b; return Math.cos(Math.PI * dd * sn / lm) ** 2 * sc * sc; };
          // a) se busca el máximo del término de interferencia cerca del orden q (sección dorada en el ángulo)
          let lo = Math.asin((q - 0.4) * lm / dd), hi = Math.asin(Math.min(1, (q + 0.4) * lm / dd));
          const g = th => -(Math.cos(Math.PI * dd * Math.sin(th) / lm) ** 2);
          for (let i = 0; i < 200; i++) { const m1 = lo + (hi - lo) * 0.382, m2 = lo + (hi - lo) * 0.618; if (g(m1) < g(m2)) hi = m2; else lo = m1; }
          const yy = L * Math.tan((lo + hi) / 2);
          // c) el mayor orden con intensidad apreciable antes de 90°
          let top = 0;
          for (let k = 1; k * lm / dd < 1; k++) if (I(k * lm / dd) > 1e-6) top = k;
          return [(yy - y) / y, I(m * lm / dd), top - qmax];
        } }
      };
    }
  };

  // sistema de dos lentes delgadas
  SELF["f2b-ex-dos-lentes"] = {
    concepts: ["f2b-lentes"],
    generate(r, H) {
      const f1 = r.pick([10, 12, 15, 20]), f2 = r.pick([-20, -15, -10, 10, 15, 20, 25]), s1 = r.pick([20, 25, 30, 40, 45, 60]), D = r.pick([30, 40, 50, 60, 80]);
      if (s1 === f1) return null;
      const i1 = 1 / (1 / f1 - 1 / s1), s2 = D - i1;
      if (Math.abs(s2) < 1 || Math.abs(s2 - f2) < 1) return null;
      const i2 = 1 / (1 / f2 - 1 / s2), m1 = -i1 / s1, m2 = -i2 / s2, mt = m1 * m2;
      if (Math.abs(i2) > 500 || Math.abs(mt) > 20) return null;
      const t1 = f2 > 0 ? "convergente" : "divergente";
      return {
        prompt: `Un objeto de $2$ cm está a $${s1}$ cm a la izquierda de una lente convergente de $f_1 = ${f1}$ cm. A $${D}$ cm a la derecha de esa lente hay una lente ${t1} de $f_2 = ${f2}$ cm. a) ¿Dónde se forma la imagen final? b) ¿Cuál es el aumento total y el tamaño de la imagen? c) ¿Es real o virtual, derecha o invertida? Hacé el trazado de rayos.`,
        rubric: [
          { text: `a) Primera lente: $\\frac{1}{s'_1} = \\frac{1}{${f1}} - \\frac{1}{${s1}}$, $s'_1 \\approx ${nf(H, i1)}$ cm; objeto de la segunda: $s_2 = ${D} - s'_1 \\approx ${nf(H, s2)}$ cm${s2 < 0 ? " (virtual)" : ""}.`, w: 3 },
          { text: `a) Segunda lente: $s'_2 \\approx ${nf(H, i2)}$ cm (${i2 > 0 ? "a la derecha" : "a la izquierda"} de la segunda lente).`, w: 3 },
          { text: `b) $m = m_1m_2 = \\left(-\\frac{s'_1}{s_1}\\right)\\left(-\\frac{s'_2}{s_2}\\right) \\approx ${nf(H, mt, 3)}$; la imagen mide $${nf(H, Math.abs(2 * mt))}$ cm.`, w: 2 },
          { text: `c) ${i2 > 0 ? "Real" : "Virtual"} e ${mt > 0 ? "derecha" : "invertida"}; trazado de rayos coherente.`, w: 2 }
        ],
        solution: [
          `Usamos $\\frac{1}{s} + \\frac{1}{s'} = \\frac{1}{f}$ con $s' > 0$ para imágenes reales (del lado de salida de la luz).`,
          `a) Primera lente: $\\frac{1}{s'_1} = \\frac{1}{${f1}} - \\frac{1}{${s1}}$, así que $s'_1 \\approx ${nf(H, i1)}$ cm${i1 < 0 ? " (imagen virtual, a la izquierda de la lente)" : ""}. Esa imagen es el objeto de la segunda lente: $s_2 = ${D} - (${nf(H, i1)}) \\approx ${nf(H, s2)}$ cm${s2 < 0 ? ": es un objeto virtual, porque la luz llega a la segunda lente antes de formar la imagen" : ""}.`,
          `Segunda lente: $\\frac{1}{s'_2} = \\frac{1}{${f2}} - \\frac{1}{${nf(H, s2)}}$, $s'_2 \\approx ${nf(H, i2)}$ cm: la imagen final está ${i2 > 0 ? "a la derecha" : "a la izquierda"} de la segunda lente, a $${nf(H, Math.abs(i2))}$ cm.`,
          `b) $m_1 = -\\frac{s'_1}{s_1} \\approx ${nf(H, m1, 3)}$, $m_2 = -\\frac{s'_2}{s_2} \\approx ${nf(H, m2, 3)}$ y $m = m_1m_2 \\approx ${nf(H, mt, 3)}$: la imagen mide $${nf(H, Math.abs(2 * mt))}$ cm.`,
          `c) Es ${i2 > 0 ? "real (los rayos convergen de verdad a la derecha)" : "virtual (los rayos salen divergiendo)"} e ${mt > 0 ? "derecha" : "invertida"} respecto del objeto.`
        ],
        // otro camino: trazado de rayos con matrices ABCD (traslaciones y lentes delgadas)
        verify: { kind: "zero", tol: 1e-7, fn: () => {
          const mul = (A, B) => [[A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]], [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]];
          const Tr = x => [[1, x], [0, 1]], Ln = f => [[1, 0], [-1 / f, 1]];
          const M = [Tr(i2), Ln(f2), Tr(D), Ln(f1), Tr(s1)].reduce((acc, X) => mul(acc, X));
          return [M[0][1] / 100, M[0][0] - mt];
        } }
      };
    }
  };

  // reflexión total hacia el agua: rapidez de la luz en el vidrio
  T["f2b-ex-agua-critico-num"] = {
    type: "numeric", concepts: ["f2b-optica"], difficulty: 3,
    generate(r, H) {
      const th = r.pick([55, 57, 59.2, 61, 63, 65, 68, 70]), nw = 1.33, ng = nw / Math.sin(rad(th)), v = cLuz / ng;
      return {
        prompt: `Un cubo grande de vidrio tiene agua ($n = 1{,}33$) contra una de sus caras. Un haz de luz que viaja dentro del vidrio llega a esa cara, y se observa que a partir de un ángulo de incidencia de $${nf(H, th, 1)}^\\circ$ (medido desde la normal) no entra luz al agua. ¿Cuál es la rapidez de la luz en ese vidrio (en $10^8$ m/s)?`,
        answer: v / 1e8,
        solution: [R`Que no entre luz al agua a partir de cierto ángulo es reflexión total interna: ese ángulo es el crítico, donde el refractado sale rasante ($90^\circ$).`,
          `Por Snell: $n_v\\operatorname{sen}\\theta_c = n_a\\operatorname{sen}90^\\circ$, así que $n_v = \\frac{1{,}33}{\\operatorname{sen}${nf(H, th, 1)}^\\circ} \\approx ${nf(H, ng, 4)}$.`,
          `$v = \\frac{c}{n_v} \\approx ${nf(H, v / 1e8, 4)}\\times10^8$ m/s.`],
        // otro camino: con el índice que da la respuesta, se busca por bisección el ángulo desde el que Snell no tiene solución
        verify: { kind: "zero", tol: 1e-6, fn: x => {
          const n = cLuz / (x * 1e8);
          let lo = 0, hi = Math.PI / 2;
          for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (n * Math.sin(mid) / nw > 1) hi = mid; else lo = mid; }
          return [(deg(lo) - th) / th];
        } }
      };
    }
  };

  // vela solar: intensidad, presión de radiación y comparación con la gravedad
  SELF["f2b-ex-vela-solar"] = {
    concepts: ["f2b-em"],
    generate(r, H) {
      const Ls = r.pick([200, 300, 400, 500, 800]), m = r.pick([500, 1000, 2000, 3000]), k = r.pick([0.5, 0.7, 1, 1.5, 2]);
      const P = 3.85e26, r0 = k * 1.496e11, Msun = 1.989e30, G = 6.674e-11;
      const I = P / (4 * Math.PI * r0 * r0), prad = 2 * I / cLuz, F = prad * Ls * Ls, Fg = G * Msun * m / (r0 * r0);
      if (Math.abs(F / Fg - 1) < 0.05) return null;
      return {
        prompt: `Una nave sin tripulación con una vela solar cuadrada de $${Ls}$ m de lado (masa total $${m}$ kg) está en reposo a $r_0 = ${sci(r0)}$ m de una estrella que irradia $P = 3{,}85\\times10^{26}$ W. La vela refleja perfectamente y está perpendicular a la dirección de la estrella. a) Calculá la intensidad de la radiación en $r_0$. b) Calculá la presión de radiación sobre la vela. c) La gravedad de la estrella sobre la nave es $F_g = ${sci(Fg)}$ N. ¿La nave se acerca o se aleja de la estrella? Justificá.`,
        rubric: [
          { text: `a) $I = \\frac{P}{4\\pi r_0^2} \\approx ${nf(H, I, 1)}$ W/m².`, w: 4 },
          { text: `b) Reflector perfecto: $p = \\frac{2I}{c} \\approx ${sci(prad)}$ Pa.`, w: 4 },
          { text: `c) $F_{rad} = pA \\approx ${sci(F)}$ N, ${F > Fg ? "mayor" : "menor"} que $F_g$: la nave ${F > Fg ? "se aleja" : "se acerca"}.`, w: 3 }
        ],
        solution: [
          `a) La potencia se reparte sobre una esfera de radio $r_0$: $I = \\frac{P}{4\\pi r_0^2} = \\frac{3{,}85\\times10^{26}}{4\\pi(${sci(r0)})^2} \\approx ${nf(H, I, 1)}$ W/m².`,
          `b) La onda transporta momento $\\frac{I}{c}$ por unidad de área y de tiempo. Si la vela la refleja, el momento se invierte y el cambio es el doble: $p = \\frac{2I}{c} \\approx ${sci(prad)}$ Pa.`,
          `c) La fuerza de radiación es $F = pA = ${sci(prad)}\\cdot${Ls}^2 \\approx ${sci(F)}$ N, hacia afuera. La gravedad es $${sci(Fg)}$ N, hacia la estrella. Como ${F > Fg ? "la radiación gana" : "la gravedad gana"}, la nave, que parte del reposo, ${F > Fg ? "se aleja" : "se acerca"}. (Las dos fuerzas van como $1/r^2$, así que la que gana sigue ganando a cualquier distancia.)`
        ],
        // otro camino: la potencia que atraviesa la esfera, integrando I en ángulos; y el momento por fotones
        verify: { kind: "zero", tol: 1e-6, fn: () => {
          let tot = 0;
          const nt = 4000;
          for (let i = 0; i < nt; i++) { const th = (i + 0.5) * Math.PI / nt; tot += I * r0 * r0 * Math.sin(th) * (Math.PI / nt) * (2 * Math.PI); }
          const hf = 6.626e-34 * 5.5e14, Nph = I * Ls * Ls / hf;  // fotones por segundo sobre la vela (la frecuencia no importa)
          return [(tot - P) / P, (2 * Nph * hf / cLuz - F) / F];
        } }
      };
    }
  };

  E.registerExams("f102b", {
    self: SELF,
    templates: T,
    exams: [
      { id: "p1", kind: "parcial", title: "1.er parcial", topics: "Termodinámica: calorimetría, conducción, primera y segunda ley, entropía", minutes: 120, pass: 60,
        items: [
          { title: "Ciclo termodinámico", parts: [{ self: "f2b-ex-ciclo", pts: 20 }] },
          { title: "Calorimetría con cambio de fase", parts: [{ tpl: "f2b-ex-calorim-c", pts: 20 }] },
          { any: [
            { title: "Conducción en barras en serie", parts: [{ tpl: "f2b-ex-union-num", pts: 20 }] },
            { title: "Conducción y radiación", parts: [{ tpl: "f2b-conduccion-num", pts: 12 }, { tpl: "f2b-radiacion-vf", pts: 8 }] }
          ] },
          { title: "Entropía de dos cuerpos", parts: [{ self: "f2b-ex-entropia-dos", pts: 20 }] },
          { any: [
            { title: "Entropía del ambiente", parts: [{ self: "f2b-ex-entropia-amb", pts: 20 }] },
            { title: "Segunda ley", parts: [{ tpl: "f2b-entropia-num", pts: 10 }, { tpl: "f2b-segunda-vf", pts: 10 }] }
          ] }
        ] },
      { id: "p2", kind: "parcial", title: "2.º parcial", topics: "Ondas mecánicas, sonido, efecto Doppler y ondas electromagnéticas", minutes: 120, pass: 60,
        items: [
          { title: "Movimiento de las partículas de una cuerda", parts: [{ tpl: "f2b-ex-particula-mc", pts: 10 }, { tpl: "f2b-ex-particula-mc", pts: 10 }, { tpl: "f2b-onda-num", pts: 10 }] },
          { any: [
            { title: "Radar de velocidad", parts: [{ tpl: "f2b-ex-radar-num", pts: 20 }] },
            { title: "Sonido", parts: [{ tpl: "f2b-sonido-num", pts: 10 }, { tpl: "f2b-ex-radar-num", pts: 10 }] }
          ] },
          { title: "Onda estacionaria en una cuerda", parts: [{ self: "f2b-ex-estacionaria", pts: 30 }] },
          { title: "Onda estacionaria electromagnética", parts: [{ tpl: "f2b-ex-em-nodos-num", pts: 10 }, { pick: ["f2b-ex-em-nodos-num", "f2b-em-num"], pts: 10 }] }
        ] },
      { id: "p3", kind: "parcial", title: "3.er parcial", topics: "Óptica geométrica y física: interferencia, difracción, lentes, refracción y presión de radiación", minutes: 120, pass: 60,
        items: [
          { title: "Interferencia en la doble rendija", parts: [{ tpl: "f2b-ex-young-pos-num", pts: 7 }, { tpl: "f2b-ex-luz-blanca-num", pts: 7 }] },
          { title: "Láminas delgadas", parts: [{ tpl: "f2b-pelicula-num", pts: 7 }, { tpl: "f2b-ex-cuna-num", pts: 7 }] },
          { title: "Interferencia y difracción", parts: [{ self: "f2b-ex-interf-difr", pts: 18 }] },
          { any: [
            { title: "Sistema de dos lentes", parts: [{ self: "f2b-ex-dos-lentes", pts: 22 }] },
            { title: "Lentes y espejos", parts: [{ tpl: "f2b-lente-num", pts: 12 }, { tpl: "f2b-optica-vf", pts: 10 }] }
          ] },
          { title: "Refracción y reflexión total", parts: [{ tpl: "f2b-ex-agua-critico-num", pts: 18 }] },
          { title: "Presión de radiación", parts: [{ self: "f2b-ex-vela-solar", pts: 14 }] }
        ] },
      { id: "final", kind: "final", title: "Final regular (parte práctica)", topics: "Ciclos termodinámicos, ondas estacionarias e interferencia con difracción. Sin justificación, los ejercicios no suman puntos.", minutes: 120, pass: 60,
        items: [
          { title: "Ciclo de un gas ideal", parts: [{ self: "f2b-ex-ciclo-final", pts: 40 }] },
          { title: "Cuerda de guitarra", parts: [{ self: "f2b-ex-guitarra", pts: 30 }] },
          { title: "Doble rendija con un orden faltante", parts: [{ self: "f2b-ex-young-faltante", pts: 30 }] }
        ] }
    ]
  });
})();

/* ===== F102B · Examen Extra UBA =====
   Temas de Física 2 de la Lic. en Cs. Físicas (FCEN, UBA) que no están en el programa de F102B: oscilaciones acopladas,
   polarización, ondas entre medios y dispersión, instrumentos ópticos y coherencia. Enunciados propios y datos sorteados. */
(function () {
  const E = window.Efecen, H = E.H;
  const SELF = {};
  const dn = (x, d = 4) => String(H.num(x, d)).replace(".", "{,}");
  const mul = (P, Q) => [[P[0][0] * Q[0][0] + P[0][1] * Q[1][0], P[0][0] * Q[0][1] + P[0][1] * Q[1][1]], [P[1][0] * Q[0][0] + P[1][1] * Q[1][0], P[1][0] * Q[0][1] + P[1][1] * Q[1][1]]];
  const Sp = d => [[1, d], [0, 1]], Ln = f => [[1, 0], [-1 / f, 1]];
  const simpson = (f, a, b, n = 400) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3; };
  // J₁ por su representación integral y su primer cero por bisección (de ahí sale el 1,22 de Rayleigh)
  const J1 = x => simpson(t => Math.cos(t - x * Math.sin(t)), 0, Math.PI) / Math.PI;
  const j11 = (() => { let a = 3, b = 4.5; for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (J1(a) * J1(m) <= 0) b = m; else a = m; } return (a + b) / 2; })();

  SELF["f2b-ex-telescopio"] = {
    concepts: ["f2b-instrumentos", "f2b-resolucion"],
    generate(r) {
      const fo = r.int(10, 40) * 5, fc = r.pick([1, 1.5, 2, 2.5, 4]), D = r.int(4, 20), lam = r.pick([500, 550, 600]), dL = 3.84e8;
      const M = fo / fc, th = 1.22 * lam * 1e-9 / (D / 100), s = th * dL, eye = 2.9e-4, seen = th * M >= eye;
      return {
        prompt: `Un telescopio astronómico tiene un objetivo de $${fo}$ cm de focal y $${D}$ cm de diámetro, y un ocular de $${dn(fc, 2)}$ cm. Se ajusta para mirar con el ojo relajado. Se observa la Luna (a $3{,}84\\times10^8$ m) con luz de $${lam}$ nm.<br>a) ¿Qué aumento angular tiene y qué largo tiene el tubo?<br>b) ¿Cuál es la mínima separación angular que resuelve el objetivo, según Rayleigh? ¿A qué distancia sobre la Luna corresponde?<br>c) El ojo resuelve unos $2{,}9\\times10^{-4}$ rad. ¿Limita el ojo o el objetivo? Justificá.`,
        rubric: [
          { text: `a) Con los focos coincidentes, [[f2b-instrumentos|telescopio]]: $|M| = \\frac{f_{ob}}{f_{oc}} = ${dn(M)}$ y largo $f_{ob} + f_{oc} = ${dn(fo + fc)}$ cm.`, w: 3 },
          { text: `b) [[f2b-resolucion|Criterio de Rayleigh]] para una abertura circular: $\\theta_{min} = 1{,}22\\frac{\\lambda}{D} \\approx ${dn(th * 1e6)}$ μrad, que a la distancia de la Luna son $\\approx ${dn(s / 1000)}$ km.`, w: 4 },
          { text: `c) Por el ocular, ese ángulo se ve de $\\theta_{min}|M| \\approx ${dn(th * M * 1e4)}\\times10^{-4}$ rad. ${seen ? "Es mayor que la resolución del ojo: lo que se pierde lo pierde el objetivo (limita la difracción)." : "Es menor que la resolución del ojo: con este ocular, limita el ojo; con más aumento se vería el detalle que el objetivo resuelve."}`, w: 3 }
        ],
        solution: [`El aumento angular multiplica todos los ángulos por $${dn(M)}$; el detalle más fino que llega al plano focal lo fija la difracción en el objetivo, $1{,}22\\lambda/D$.`,
          `$\\theta_{min} \\approx ${dn(th * 1e6)}$ μrad, $s \\approx ${dn(s / 1000)}$ km; por el ocular, $\\approx ${dn(th * M * 1e4)}\\times10^{-4}$ rad contra $2{,}9\\times10^{-4}$ rad del ojo.`],
        // otro camino: aumento con la matriz ABCD del telescopio (elemento D) y el 1,22 como primer cero de J₁ dividido por π
        verify: { kind: "zero", tol: 1e-3, fn: () => {
          const Mx = mul(Ln(fc), mul(Sp(fo + fc), Ln(fo))), thJ = j11 / Math.PI * lam * 1e-9 / (D / 100);
          return [Math.abs(Mx[1][0]) * fo, Math.abs(Mx[1][1]) / M - 1, thJ / th - 1, (thJ * M >= eye) === seen ? 0 : 1];
        } }
      };
    }
  };

  SELF["f2b-ex-acopladas"] = {
    concepts: ["f2b-acopladas"],
    generate(r) {
      const m = r.int(1, 8) / 2, k = r.int(10, 80) * 5, kap = k * r.pick([0.04, 0.05, 0.08, 0.1, 0.15]), A = r.int(1, 5);
      const w1 = Math.sqrt(k / m), w2 = Math.sqrt((k + 2 * kap) / m), ts = Math.PI / (w2 - w1);
      return {
        prompt: `Dos masas iguales de $${dn(m, 1)}$ kg están sobre una mesa sin rozamiento, unidas cada una a una pared por un resorte de $k = ${k}$ N/m y entre sí por un resorte débil de $\\kappa = ${dn(kap, 3)}$ N/m. En $t = 0$ la masa 1 se aparta $${A}$ cm de su equilibrio y se suelta; la masa 2 está quieta en su equilibrio.<br>a) Escribí las ecuaciones de movimiento y encontrá los modos normales y sus frecuencias.<br>b) Escribí $x_1(t)$ y $x_2(t)$.<br>c) ¿Cuánto tarda la masa 1 en quedarse quieta por primera vez (toda la energía pasó a la masa 2)?`,
        rubric: [
          { text: `a) $m\\ddot x_1 = -kx_1 - \\kappa(x_1 - x_2)$ y $m\\ddot x_2 = -kx_2 - \\kappa(x_2 - x_1)$. [[f2b-acopladas|Modos normales]]: en fase ($x_1 = x_2$), con $\\omega_1 = \\sqrt{k/m} \\approx ${dn(w1)}$ rad/s, y en contrafase ($x_1 = -x_2$), con $\\omega_2 = \\sqrt{(k + 2\\kappa)/m} \\approx ${dn(w2)}$ rad/s.`, w: 4 },
          { text: `b) Con esas condiciones iniciales: $x_1 = \\frac A2(\\cos\\omega_1t + \\cos\\omega_2t) = A\\cos\\frac{(\\omega_2 - \\omega_1)t}{2}\\cos\\frac{(\\omega_1 + \\omega_2)t}{2}$ y $x_2 = A\\sin\\frac{(\\omega_2 - \\omega_1)t}{2}\\sin\\frac{(\\omega_1 + \\omega_2)t}{2}$: [[f2b-ondas|batidos]].`, w: 3 },
          { text: `c) La envolvente de $x_1$ se anula cuando $\\frac{(\\omega_2 - \\omega_1)t}{2} = \\frac\\pi2$: $t^* = \\frac{\\pi}{\\omega_2 - \\omega_1} \\approx ${dn(ts)}$ s.`, w: 3 }
        ],
        solution: [`Sumando y restando las ecuaciones se desacoplan: $q_\\pm = x_1 \\pm x_2$ oscilan con $\\omega_1$ y $\\omega_2$.`,
          `La energía pasa de una masa a la otra con el ritmo de la diferencia de frecuencias: $t^* \\approx ${dn(ts)}$ s, mucho más que un período ($\\approx ${dn(2 * Math.PI / w1)}$ s) porque el acople es débil.`],
        // otro camino: det(K − ω²M) = 0 para las dos frecuencias, y simulación con RK4 hasta t*, donde x₁ tiene que dar 0
        verify: { kind: "zero", tol: 2e-4, fn: () => {
          const det = w => (k + kap - m * w * w) ** 2 - kap * kap;
          const f = y => [y[2], y[3], (-k * y[0] - kap * (y[0] - y[1])) / m, (-k * y[1] - kap * (y[1] - y[0])) / m];
          const n = 40000, h = ts / n; let y = [A, 0, 0, 0];
          for (let i = 0; i < n; i++) { const k1 = f(y), k2 = f(y.map((v, j) => v + h / 2 * k1[j])), k3 = f(y.map((v, j) => v + h / 2 * k2[j])), k4 = f(y.map((v, j) => v + h * k3[j])); y = y.map((v, j) => v + h / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])); }
          return [det(w1) / (k * k), det(w2) / (k * k), y[0] / A];
        } }
      };
    }
  };

  E.registerExams("f102b", {
    self: SELF,
    exams: [
      { id: "uba", kind: "parcial", title: "Examen Extra UBA", topics: "Temas de Física 2 de la UBA que no están en el programa: oscilaciones acopladas, polarización, ondas entre medios y dispersión, instrumentos ópticos y coherencia.", minutes: 180, pass: 60,
        items: [
          { title: "Osciladores acoplados", parts: [{ self: "f2b-ex-acopladas", pts: 20 }] },
          { title: "Telescopio y resolución", parts: [{ self: "f2b-ex-telescopio", pts: 20 }] },
          { any: [
            { title: "Polarización", parts: [{ tpl: "f2b-malus-num", pts: 12 }, { tpl: "f2b-pol-vf", pts: 8 }] },
            { title: "Polarización", parts: [{ tpl: "f2b-brewster-num", pts: 12 }, { tpl: "f2b-lamina-num", pts: 8 }] }
          ] },
          { any: [
            { title: "Ondas entre medios", parts: [{ tpl: "f2b-union-num", pts: 12 }, { tpl: "f2b-grupo-num", pts: 8 }] },
            { title: "Fourier y dispersión", parts: [{ tpl: "f2b-fourier-num", pts: 12 }, { tpl: "f2b-dispersion-vf", pts: 8 }] },
            { title: "Modos de una cadena", parts: [{ pick: ["f2b-cadena-num", "f2b-triatomica-num"], pts: 12 }, { tpl: "f2b-prisma-num", pts: 8 }] }
          ] },
          { any: [
            { title: "Microscopio y coherencia", parts: [{ tpl: "f2b-microscopio-num", pts: 12 }, { tpl: "f2b-coherencia-vf", pts: 8 }] },
            { title: "Coherencia y lupa", parts: [{ tpl: "f2b-coherencia-num", pts: 12 }, { tpl: "f2b-lupa-num", pts: 8 }] }
          ] }
        ] }
    ]
  });
})();
