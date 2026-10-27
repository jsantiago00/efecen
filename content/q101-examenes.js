/* ===== Q101 · Evaluaciones: parciales y examen global simulados =====
   Estructura de los exámenes reales (ver docs/parciales/q101.md): tres parciales y un examen global, todos con
   ítems de opción múltiple de 2 a 20 puntos (algunos con cuentas). 1.er parcial: estructura atómica, enlace,
   estequiometría y estados de agregación; 2.º parcial: soluciones; 3.er parcial: cinética, equilibrio, ácidos y
   bases y electroquímica; global: toda la materia. Enunciados propios y datos sorteados. */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, Q = E.qg, nf = Q.nf, dn = Q.dn;
  const SELF = {};
  const tx = (f, q) => Q.tex(f, q);
  const KW = 1e-14, pH = h => -Math.log10(h);

  // ---------- problema integrador: redox, reactivo limitante y gas ----------
  const RXI = [
    { name: "dióxido de manganeso con ácido clorhídrico", r: [["MnO2", 1], ["HCl", 4]], p: [["MnCl2", 1], ["Cl2", 1], ["H2O", 2]], gas: "Cl2", salt: "MnCl2",
      half: [R`\mathrm{MnO_2} + 4\mathrm{H^+} + 2e^- \to \mathrm{Mn^{2+}} + 2\mathrm{H_2O}`, R`2\mathrm{Cl^-} \to \mathrm{Cl_2} + 2e^-`] },
    { name: "cobre con ácido nítrico diluido", r: [["Cu", 3], ["HNO3", 8]], p: [["Cu(NO3)2", 3], ["NO", 2], ["H2O", 4]], gas: "NO", salt: "Cu(NO3)2",
      half: [R`\mathrm{NO_3^-} + 4\mathrm{H^+} + 3e^- \to \mathrm{NO} + 2\mathrm{H_2O}`, R`\mathrm{Cu} \to \mathrm{Cu^{2+}} + 2e^-`] }
  ];
  SELF["qg-ex-redox-limitante"] = {
    concepts: ["qg-estequiometria", "qg-redox"],
    generate(r) {
      const x = r.pick(RXI), [[fa, ca], [fb, cb]] = x.r, gas = x.p.find(s => s[0] === x.gas), w = x.p.find(s => s[0] === "H2O");
      const ma = r.int(20, 120), ratio = r.pick([0.6, 0.8, 1.3, 1.8]), na = ma / Q.mm(fa), mb = +(na * cb / ca * ratio * Q.mm(fb)).toFixed(1), nb = mb / Q.mm(fb);
      const xi = Math.min(na / ca, nb / cb), lim = na / ca < nb / cb ? fa : fb, mw = xi * w[1] * Q.mm("H2O"), yld = r.pick([75, 80, 85, 90]), tC = r.pick([20, 25, 27]), P = r.pick([1, 0.95]);
      const nGas = xi * gas[1] * yld / 100, Vg = nGas * Q.R * (tC + 273.15) / P;
      return {
        prompt: `Se hacen reaccionar $${ma}$ g de $${tx(fa)}$ con $${dn(mb, 1)}$ g de $${tx(fb)}$ (${x.name}). Se forman $${tx(x.salt)}$, $${tx(x.gas)}$ y agua.<br>a) Balanceá la ecuación por el método del ion-electrón.<br>b) Indicá el reactivo limitante.<br>c) Calculá la masa de agua que se forma.<br>d) Si el rendimiento es del $${yld}\\,\\%$, ¿qué volumen de $${tx(x.gas)}$ se recoge a $${tC}$ °C y $${dn(P, 2)}$ atm?`,
        rubric: [
          { text: `a) Hemirreacciones: $${x.half[0]}$ y $${x.half[1]}$. Igualando electrones: $${x.r.map(([f, c]) => `${c > 1 ? c : ""}${tx(f)}`).join(" + ")} \\to ${x.p.map(([f, c]) => `${c > 1 ? c : ""}${tx(f)}`).join(" + ")}$ ([[qg-redox|ion-electrón]]).`, w: 3 },
          { text: `b) Moles: $${tx(fa)}$ $${nf(na, 4)}$, $${tx(fb)}$ $${nf(nb, 4)}$. Divididos por los coeficientes: $${nf(na / ca, 4)}$ y $${nf(nb / cb, 4)}$. Limita el $${tx(lim)}$ ([[qg-estequiometria|reactivo limitante]]).`, w: 2 },
          { text: `c) Se forman $${w[1]}\\cdot${nf(xi, 4)} = ${nf(xi * w[1], 4)}$ mol de agua: $${dn(mw, 2)}$ g.`, w: 2 },
          { text: `d) Moles de gas: $${gas[1]}\\cdot${nf(xi, 4)}\\cdot${dn(yld / 100, 2)} \\approx ${nf(nGas, 4)}$; $V = \\frac{nRT}{P} \\approx ${dn(Vg, 2)}$ L ([[qg-gases|gas ideal]]).`, w: 3 }
        ],
        solution: [`El orden siempre es el mismo: ecuación balanceada, moles, limitante, y recién ahí las masas o volúmenes pedidos (con el rendimiento al final).`],
        // otro camino: balance por el núcleo de la matriz, reacción simulada en pasitos y gas en el SI
        verify: { kind: "zero", tol: 1e-4, fn: () => {
          const bal = Q.balance([...x.r.map(([f]) => ({ f, side: -1 })), ...x.p.map(([f]) => ({ f, side: 1 }))]), want = [...x.r, ...x.p].map(s => s[1]);
          let a = na, b = nb, prodW = 0;
          const N = 100000, d = Math.max(na / ca, nb / cb) / N;
          for (let i = 0; i < N && a > 1e-15 && b > 1e-15; i++) { const s = Math.min(d, a / ca, b / cb); a -= s * ca; b -= s * cb; prodW += s * w[1]; }
          const nG = prodW / w[1] * gas[1] * yld / 100, V = nG * Q.Rsi * (tC + 273.15) / (P * 101325) * 1000;
          return [...bal.map((c, i) => c - want[i]), prodW * Q.mm("H2O") / mw - 1, V / Vg - 1, (lim === fa) === (a < b * ca / cb) ? 0 : 1];
        } }
      };
    }
  };

  // ---------- problema de soluciones: ácido comercial, dilución y neutralización ----------
  const COMM = [["HCl", 37, 1.19, 1, "ácido clorhídrico"], ["HNO3", 65, 1.40, 1, "ácido nítrico"], ["H2SO4", 96, 1.84, 2, "ácido sulfúrico"]];
  SELF["qg-ex-soluciones"] = {
    concepts: ["qg-concentracion", "qg-dilucion"],
    generate(r) {
      const [f, pct, d, nH, nm] = r.pick(COMM), M = Q.mm(f), C1 = pct * 10 * d / M, C2 = r.pick([0.1, 0.2, 0.25, 0.5]), V2 = r.pick([250, 500, 1000]);
      const V1 = C2 * V2 / C1, Va = r.pick([10, 20, 25]), mNaOH = nH * C2 * Va / 1000 * Q.mm("NaOH");
      return {
        prompt: `En el laboratorio hay ${nm} ($${tx(f)}$) comercial al $${pct}\\,\\%$ m/m, de densidad $${dn(d, 2)}$ g/mL.<br>a) Calculá su molaridad.<br>b) ¿Qué volumen hay que tomar para preparar $${V2}$ mL de solución $${dn(C2, 2)}$ M?<br>c) ¿Cuántos gramos de NaOH neutralizan por completo $${Va}$ mL de la solución diluida?`,
        rubric: [
          { text: `a) En 1 L hay $${dn(1000 * d, 0)}$ g de solución, con $${dn(10 * pct * d, 1)}$ g de $${tx(f)}$: $M = \\frac{${dn(10 * pct * d, 1)}}{${dn(M, 2)}} \\approx ${dn(C1, 2)}$ M ([[qg-concentracion|molaridad]]).`, w: 4 },
          { text: `b) $V_1 = \\frac{C_2V_2}{C_1} = \\frac{${dn(C2, 2)}\\cdot${V2}}{${dn(C1, 2)}} \\approx ${dn(V1, 2)}$ mL, completando con agua hasta $${V2}$ mL ([[qg-dilucion|dilución]]).`, w: 3 },
          { text: `c) Moles de H⁺: $${nH}\\cdot${dn(C2, 2)}\\cdot${dn(Va / 1000, 3)} = ${nf(nH * C2 * Va / 1000, 4)}$; hacen falta otros tantos de NaOH: $${dn(mNaOH, 3)}$ g ([[qg-neutralizacion|neutralización]]).`, w: 3 }
        ],
        solution: [`Para pasar de % m/m a molaridad conviene tomar 1 L de solución y usar la densidad para saber cuánto pesa.`],
        // otro camino: se arma 1 kg de solución comercial (no 1 L), se mide su volumen y se cuentan moles; la dilución se hace "mezclando"
        verify: { kind: "zero", tol: 1e-9, fn: () => {
          const mass = 1000, vol = mass / d / 1000, n = mass * pct / 100 / M, c1 = n / vol;
          const nTaken = c1 * V1 / 1000, c2 = nTaken / (V2 / 1000);
          return [c1 / C1 - 1, c2 / C2 - 1, (nH * c2 * Va / 1000 * (Q.A.Na + Q.A.O + Q.A.H)) / mNaOH - 1];
        } }
      };
    }
  };

  // ---------- problema de titulación de un ácido débil ----------
  const WEAK = [["CH3COOH", 1.8e-5, "ácido acético"], ["HCOOH", 1.8e-4, "ácido fórmico"], ["C6H5COOH", 6.3e-5, "ácido benzoico"]];
  SELF["qg-ex-titulacion"] = {
    concepts: ["qg-neutralizacion", "qg-ph-debil"],
    generate(r) {
      const [f, Ka, nm] = r.pick(WEAK), Ca = r.pick([0.05, 0.1, 0.2]), Va = r.pick([20, 25, 50]), Cb = r.pick([0.1, 0.2]);
      const Veq = Ca * Va / Cb, x0 = (-Ka + Math.sqrt(Ka * Ka + 4 * Ka * Ca)) / 2, pH0 = pH(x0), pHhalf = pH(Ka);
      const Cs = Ca * Va / (Va + Veq), Kb = KW / Ka, oh = (-Kb + Math.sqrt(Kb * Kb + 4 * Kb * Cs)) / 2, pHeq = 14 - pH(oh);
      return {
        prompt: `Se titulan $${Va}$ mL de ${nm} ($${tx(f)}$, $K_a = ${nf(Ka, 2)}$) $${dn(Ca, 2)}$ M con NaOH $${dn(Cb, 2)}$ M.<br>a) ¿Qué volumen de NaOH se gasta hasta el punto de equivalencia?<br>b) ¿Cuál es el pH inicial?<br>c) ¿Cuál es el pH cuando se agregó la mitad de ese volumen?<br>d) ¿Cuál es el pH en el punto de equivalencia? ¿Por qué no es 7?`,
        rubric: [
          { text: `a) $V_{eq} = \\frac{C_aV_a}{C_b} = ${dn(Veq, 2)}$ mL ([[qg-neutralizacion|equivalencia]]).`, w: 2 },
          { text: `b) Ácido débil: $\\frac{x^2}{${dn(Ca, 2)} - x} = K_a$, $x \\approx ${nf(x0, 3)}$ M, pH $\\approx ${dn(pH0, 2)}$ ([[qg-ph-debil|Ka]]).`, w: 3 },
          { text: `c) A mitad de camino, la mitad del ácido pasó a su base conjugada: $[\\mathrm{HA}] = [\\mathrm{A^-}]$, así que $[\\mathrm{H^+}] = K_a$ y pH $= pK_a \\approx ${dn(pHhalf, 2)}$.`, w: 2 },
          { text: `d) Queda la sal, $${dn(Cs, 4)}$ M de $\\mathrm{A^-}$, que hidroliza con $K_b = \\frac{K_w}{K_a} \\approx ${nf(Kb, 3)}$: $[\\mathrm{OH^-}] \\approx ${nf(oh, 3)}$ M, pH $\\approx ${dn(pHeq, 2)}$, básico por la hidrólisis del anión.`, w: 3 }
        ],
        solution: [`La curva de titulación de un ácido débil empieza más arriba que la de uno fuerte, tiene una zona amortiguada alrededor de pH = pKa y su equivalencia cae en pH básico.`],
        // otro camino: en cada punto se resuelve el balance de cargas completo, [H⁺] + [Na⁺] = [A⁻] + [OH⁻], por bisección
        // (a mitad de camino, pH = pKa desprecia el H⁺ del ácido: la diferencia es de milésimas de pH)
        verify: { kind: "zero", tol: 1e-2, fn: () => {
          const at = Vb => { const Vt = (Va + Vb) / 1000, CA = Ca * Va / 1000 / Vt, Na = Cb * Vb / 1000 / Vt; return pH(Q.solveH(h => CA * Ka / (Ka + h) - Na)); };
          return [at(0) - pH0, at(Veq / 2) - pHhalf, at(Veq) - pHeq];
        } }
      };
    }
  };

  E.registerExams("q101", {
    self: SELF,
    exams: [
      { id: "p1", kind: "parcial", title: "1.er parcial", topics: "Estructura atómica y tabla periódica, enlace y estructura molecular, reacciones y estequiometría, y estados de agregación.", minutes: 120, pass: 60,
        items: [
          { title: "Estructura atómica", parts: [{ pick: ["qg-config-mc", "qg-particulas-num", "qg-cuanticos-vf"], pts: 8 }] },
          { title: "Tabla periódica", parts: [{ pick: ["qg-tendencia-order", "qg-tendencia-vf"], pts: 8 }] },
          { title: "Uniones químicas", parts: [{ pick: ["qg-geometria-mc", "qg-tipo-enlace-mc", "qg-polaridad-vf"], pts: 8 }] },
          { title: "Estructura molecular", parts: [{ pick: ["qg-carga-formal-num", "qg-orden-enlace-num"], pts: 8 }] },
          { title: "Ecuaciones químicas", parts: [{ pick: ["qg-balanceo-num", "qg-ion-electron-num"], pts: 8 }] },
          { title: "Mol y fórmulas", parts: [{ pick: ["qg-mol-num", "qg-empirica-num"], pts: 8 }] },
          { title: "Reactivo limitante", parts: [{ tpl: "qg-limitante-num", pts: 12 }] },
          { title: "Rendimiento y pureza", parts: [{ tpl: "qg-rendimiento-num", pts: 10 }] },
          { title: "Gases", parts: [{ pick: ["qg-gas-ideal-num", "qg-gas-densidad-num", "qg-sobre-agua-num"], pts: 10 }] },
          { title: "Estados de agregación", parts: [{ pick: ["qg-fuerzas-mc", "qg-solidos-mc", "qg-ebullicion-vf", "qg-gas-proporcion-mc"], pts: 5 }] },
          { title: "Problema integrador", parts: [{ self: "qg-ex-redox-limitante", pts: 15 }] }
        ] },
      { id: "p2", kind: "parcial", title: "2.º parcial", topics: "Soluciones: concentración, dilución, solubilidad, propiedades coligativas y coloides.", minutes: 120, pass: 60,
        items: [
          { title: "Solubilidad", parts: [{ tpl: "qg-saturacion-mc", pts: 10 }] },
          { title: "Sistemas dispersos", parts: [{ tpl: "qg-coloides-vf", pts: 5 }] },
          { title: "Molaridad", parts: [{ tpl: "qg-molaridad-num", pts: 10 }] },
          { title: "Dilución", parts: [{ tpl: "qg-dilucion-num", pts: 10 }] },
          { title: "Unidades de concentración", parts: [{ tpl: "qg-conversion-num", pts: 15 }] },
          { title: "Gases en solución", parts: [{ tpl: "qg-henry-num", pts: 10 }] },
          { title: "Presión de vapor", parts: [{ tpl: "qg-raoult-num", pts: 10 }] },
          { title: "Crioscopía y ebulloscopía", parts: [{ tpl: "qg-crioscopia-num", pts: 10 }] },
          { title: "Presión osmótica", parts: [{ pick: ["qg-osmotica-num", "qg-coligativas-order"], pts: 10 }] },
          { title: "Problema de soluciones", parts: [{ self: "qg-ex-soluciones", pts: 10 }] }
        ] },
      { id: "p3", kind: "parcial", title: "3.er parcial", topics: "Cinética, equilibrio químico, ácidos y bases y electroquímica.", minutes: 120, pass: 60,
        items: [
          { title: "Velocidad de reacción", parts: [{ pick: ["qg-velocidad-relativa-num", "qg-grafico-mc"], pts: 6 }] },
          { title: "Cinética", parts: [{ pick: ["qg-integrada-num", "qg-vida-media-num", "qg-arrhenius-num"], pts: 8 }] },
          { title: "Constante de equilibrio", parts: [{ pick: ["qg-expresion-k-mc", "qg-cociente-mc"], pts: 6 }] },
          { title: "Cálculos de equilibrio", parts: [{ pick: ["qg-ice-num", "qg-kc-num", "qg-kp-num"], pts: 10 }] },
          { title: "Le Chatelier", parts: [{ tpl: "qg-lechatelier-mc", pts: 6 }] },
          { title: "pH", parts: [{ pick: ["qg-ph-fuerte-num", "qg-conjugado-mc"], pts: 8 }] },
          { title: "Ácidos débiles", parts: [{ tpl: "qg-ph-debil-num", pts: 10 }] },
          { title: "Hidrólisis", parts: [{ tpl: "qg-hidrolisis-mc", pts: 6 }] },
          { title: "Neutralización", parts: [{ tpl: "qg-neutralizacion-num", pts: 10 }] },
          { title: "Pilas", parts: [{ pick: ["qg-pila-num", "qg-anodo-mc", "qg-espontanea-vf"], pts: 8 }] },
          { title: "Electrólisis y Nernst", parts: [{ pick: ["qg-faraday-num", "qg-nernst-num"], pts: 8 }] },
          { title: "Problema de titulación", parts: [{ self: "qg-ex-titulacion", pts: 14 }] }
        ] },
      { id: "final", kind: "final", title: "Examen global", topics: "Toda la materia, con ítems de distinto peso como en el examen global de la cátedra.", minutes: 180, pass: 60,
        items: [
          { title: "Configuración electrónica", parts: [{ tpl: "qg-config-mc", pts: 5 }] },
          { title: "Redox y reactivo limitante", parts: [{ self: "qg-ex-redox-limitante", pts: 20 }] },
          { title: "Uniones químicas", parts: [{ pick: ["qg-tipo-enlace-mc", "qg-geometria-mc"], pts: 5 }] },
          { title: "Gases", parts: [{ pick: ["qg-gas-proporcion-mc", "qg-graham-num"], pts: 3 }] },
          { title: "Soluciones diluidas", parts: [{ pick: ["qg-coligativas-order", "qg-coloides-vf"], pts: 3 }] },
          { title: "Estados de agregación", parts: [{ pick: ["qg-fuerzas-mc", "qg-ebullicion-vf"], pts: 3 }] },
          { title: "Neutralización", parts: [{ tpl: "qg-neutralizacion-num", pts: 10 }] },
          { title: "Sólidos", parts: [{ tpl: "qg-solidos-mc", pts: 3 }] },
          { title: "Cociente de reacción", parts: [{ tpl: "qg-cociente-mc", pts: 3 }] },
          { title: "Equilibrio", parts: [{ pick: ["qg-kp-num", "qg-ice-num"], pts: 10 }] },
          { title: "pH", parts: [{ tpl: "qg-ph-fuerte-num", pts: 10 }] },
          { title: "Estequiometría", parts: [{ pick: ["qg-limitante-num", "qg-rendimiento-num"], pts: 10 }] },
          { title: "Hidrólisis", parts: [{ tpl: "qg-hidrolisis-mc", pts: 5 }] },
          { title: "Electroquímica", parts: [{ pick: ["qg-espontanea-vf", "qg-anodo-mc"], pts: 3 }] },
          { title: "Electrólisis", parts: [{ tpl: "qg-faraday-num", pts: 7 }] }
        ] }
    ]
  });
})();
