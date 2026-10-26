/* ===== F101 · Evaluaciones: parciales promocionales y final simulados =====
   Estructura tomada de los exámenes reales (ver docs/parciales/f101.md): problemas de varios incisos, con
   diagramas de cuerpo libre, gráficos cualitativos y resultados numéricos. Los enunciados son propios y los
   datos se sortean en cada intento. Los problemas largos son de desarrollo (`self`): al entregar se ve la
   resolución con los valores numéricos y uno se corrige con la rúbrica. g = 9,8 m/s² en todos. */
(function () {
  const E = window.Efecen, R = String.raw, g = 9.8, G = 6.674e-11;
  const SELF = {};
  // número con coma decimal para TeX
  const nf = (H, x, d = 2) => H.num(x, d).replace(".", "{,}");
  // notación científica en TeX: 3,25 × 10^{-10}
  const sci = (x, d = 3) => {
    if (x === 0) return "0";
    const e = Math.floor(Math.log10(Math.abs(x))), m = x / 10 ** e;
    return `${String(+m.toFixed(d - 1)).replace(".", "{,}")} \\times 10^{${e}}`;
  };

  // choque plástico con rozamiento interno: tejo que cae de una rampa sobre una tabla
  SELF["f1-ex-tejo"] = {
    concepts: ["f1-choques", "f1-energia"],
    generate(r, H) {
      const m = r.pick([0.2, 0.25, 0.3, 0.4, 0.5]), h = r.pick([0.5, 0.6, 0.75, 0.9, 1.2, 1.5]), k = r.pick([2, 3, 4]);
      const M = k * m, v0 = Math.sqrt(2 * g * h), vf = m * v0 / (m + M), W = 0.5 * (m + M) * vf * vf - 0.5 * m * v0 * v0;
      return {
        verify: { kind: "zero", tol: 2e-3, fn: () => { let x = 0, v = 0; const dt = 1e-5; while (x < h) { v += g * dt; x += v * dt; } let vt = v, vb = 0; const fr = 0.3 * m * g; while (vt > vb) { vt -= fr / m * dt; vb += fr / M * dt; } const Wsim = 0.5 * m * vt * vt + 0.5 * M * vb * vb - m * g * h; return [(v - v0) / v0, (vb - vf) / vf, (Wsim - W) / W]; } },
        prompt: `Un tejo de $${nf(H, m)}$ kg baja sin rozamiento por una rampa de $${nf(H, h)}$ m de altura y pasa a una tabla de masa $M = ${k}m$, que está quieta sobre un piso **sin** rozamiento. Por el rozamiento entre el tejo y la tabla, el tejo se frena respecto de la tabla hasta que se mueven juntos ($g = 9{,}8$ m/s²). a) ¿Con qué velocidad llega el tejo a la tabla? b) ¿Cuál es la velocidad común final? c) ¿Cuánto trabajo hace la fricción sobre el sistema tejo + tabla? d) Hacé gráficos cualitativos de la posición y la velocidad de la tabla en función del tiempo, desde el reposo hasta después de alcanzar la velocidad común.`,
        rubric: [
          { text: `a) Conservación de la energía en la rampa: $v_0 = \\sqrt{2gh} \\approx ${nf(H, v0)}$ m/s.`, w: 2 },
          { text: `b) Conservación de la cantidad de movimiento horizontal: $v_f = \\frac{m v_0}{m + M} \\approx ${nf(H, vf)}$ m/s.`, w: 3 },
          { text: `c) $W_{fr} = \\Delta K \\approx ${nf(H, W)}$ J (negativo: la fricción disipa energía).`, w: 3 },
          { text: R`d) La velocidad de la tabla crece linealmente (aceleración constante) y después queda constante; la posición es una parábola y después una recta.`, w: 2 }
        ],
        solution: [
          `a) En la rampa no hay rozamiento: $mgh = \\frac12 m v_0^2$, así que $v_0 = \\sqrt{2 \\cdot 9{,}8 \\cdot ${nf(H, h)}} \\approx ${nf(H, v0)}$ m/s.`,
          `b) Sobre la tabla, las fuerzas horizontales (la fricción entre los dos) son internas y el piso no roza: se conserva $p_x$. $m v_0 = (m + M)\\,v_f$, con $M = ${k}m$: $v_f = \\frac{v_0}{${k + 1}} \\approx ${nf(H, vf)}$ m/s.`,
          `c) El trabajo de la fricción sobre el sistema es la variación de energía cinética: $W = \\frac12 (m + M) v_f^2 - \\frac12 m v_0^2 \\approx ${nf(H, 0.5 * (m + M) * vf * vf)} - ${nf(H, 0.5 * m * v0 * v0)} = ${nf(H, W)}$ J.`,
          `(Fijate que $W = -\\frac{M}{m + M}\\,mgh = -\\frac{${k}}{${k + 1}}\\,mgh$: se pierde esa fracción de la energía inicial.)`,
          R`d) Mientras desliza, la fricción sobre la tabla es constante: la tabla acelera uniformemente desde $0$ ($v$ es una recta creciente, $x$ una parábola). Al alcanzar $v_f$ la fricción desaparece: $v$ queda constante y $x$ crece linealmente.`
        ]
      };
    }
  };

  // dos bloques apilados unidos por una cuerda que pasa por una polea fija
  SELF["f1-ex-bloques"] = {
    concepts: ["f1-rozamiento", "f1-newton", "f1-relativo"],
    generate(r, H) {
      const wA = r.pick([1.2, 1.5, 1.6, 2.0, 2.4]), wB = r.pick([3.0, 3.5, 4.0, 4.8, 5.5]), mu = r.pick([0.2, 0.25, 0.35, 0.4]);
      const T = mu * wA, F = 3 * mu * wA + mu * wB;
      return {
        verify: { kind: "zero", fn: () => { const frAB = mu * wA, frMesa = mu * (wA + wB); return [T - frAB, F - (T + frAB + frMesa), (2 * T) - (T + T)]; } },
        prompt: `El bloque A (peso $${nf(H, wA)}$ N) está apoyado sobre el bloque B (peso $${nf(H, wB)}$ N), que está sobre una mesa. Una cuerda horizontal, ideal, une A con B pasando por una polea fija, sin masa ni fricción, ubicada a la derecha. Se tira de B hacia la izquierda con una fuerza horizontal $F$, de modo que B se mueve con rapidez constante $v$. El coeficiente de rozamiento dinámico entre todas las superficies es $${nf(H, mu)}$. a) Hacé el diagrama de cuerpo libre de cada bloque y de la polea. b) Calculá la tensión de la cuerda y la fuerza $F$. c) ¿Cuál es la velocidad de B respecto de un sistema de referencia fijo en A?`,
        rubric: [
          { text: R`a) DCL de A: peso, normal de B, tensión hacia la polea y fricción de B opuesta a su movimiento relativo.`, w: 2 },
          { text: R`a) DCL de B: peso, normal de la mesa, normal y fricción de A, fricción de la mesa, tensión y $F$. DCL de la polea: dos tensiones y la fuerza del soporte.`, w: 3 },
          { text: `b) $T = \\mu w_A \\approx ${nf(H, T, 3)}$ N.`, w: 2 },
          { text: `b) $F = T + \\mu w_A + \\mu(w_A + w_B) = 3\\mu w_A + \\mu w_B \\approx ${nf(H, F, 3)}$ N.`, w: 3 },
          { text: R`c) A se mueve a $v$ hacia la derecha y B a $v$ hacia la izquierda: $\vec v_{B/A} = 2v$ hacia la izquierda.`, w: 2 }
        ],
        solution: [
          R`La cuerda pasa por la polea: si B se mueve a la izquierda con $v$, A se mueve a la derecha con $v$. Los dos van a velocidad constante: la fuerza neta sobre cada uno es nula.`,
          `**A:** en vertical, $N_A = w_A$. En horizontal, la tensión $T$ (hacia la polea, a la derecha) se equilibra con la fricción dinámica de B, que se opone al deslizamiento de A sobre B: $T = \\mu w_A = ${nf(H, mu)} \\cdot ${nf(H, wA)} \\approx ${nf(H, T, 3)}$ N.`,
          `**B:** la fricción de A sobre B ($\\mu w_A$, a la derecha, por la tercera ley), la fricción de la mesa ($\\mu (w_A + w_B)$, a la derecha) y la tensión ($T$, a la derecha) equilibran a $F$: $F = T + \\mu w_A + \\mu(w_A + w_B) \\approx ${nf(H, F, 3)}$ N.`,
          R`**Polea:** las dos ramas de la cuerda tiran hacia la izquierda con $T$ cada una; el soporte hace $2T$ hacia la derecha.`,
          R`c) $\vec v_{B/A} = \vec v_B - \vec v_A = (-v) - (+v) = -2v$: B se mueve a $2v$ hacia la izquierda respecto de A.`
        ]
      };
    }
  };

  // conservación del momento angular: persona en un taburete con pesas
  SELF["f1-ex-taburete"] = {
    concepts: ["f1-momento-angular", "f1-inercia"],
    generate(r, H) {
      const I0 = r.pick([4.5, 5.0, 6.0, 6.5]), m = r.pick([3, 4, 5, 6]), r1 = r.pick([0.8, 0.85, 1.0]), r2 = r.pick([0.2, 0.25, 0.3]), w1 = r.pick([1.5, 2.5, 3.0]);
      const I1 = I0 + 2 * m * r1 * r1, I2 = I0 + 2 * m * r2 * r2, L = I1 * w1, w2 = L / I2, K1 = 0.5 * I1 * w1 * w1, K2 = 0.5 * I2 * w2 * w2;
      return {
        verify: { kind: "zero", fn: () => { const Kp = (I, w, rr) => 0.5 * I0 * w * w + 2 * 0.5 * m * (w * rr) ** 2; return [I1 * w1 - I2 * w2, (Kp(I1, w2, r2) - Kp(I1, w1, r1)) - (K2 - K1)]; } },
        prompt: `Una persona está sentada en un taburete giratorio sin rozamiento y sostiene dos pesas de $${m}$ kg cada una (puntuales) a $${nf(H, r1)}$ m del eje, girando a $${nf(H, w1)}$ rad/s. El momento de inercia de la persona con el taburete es $${nf(H, I0)}$ kg·m² y no cambia. Después acerca las pesas hasta $${nf(H, r2)}$ m del eje. a) ¿Cuál es el momento angular inicial del sistema? b) ¿Cuál es la velocidad angular final? c) ¿Cuánto cambia la energía cinética del sistema y de dónde sale esa diferencia?`,
        rubric: [
          { text: `a) $I_1 = I_0 + 2mr_1^2 \\approx ${nf(H, I1)}$ kg·m² y $L = I_1\\omega_1 \\approx ${nf(H, L)}$ kg·m²/s.`, w: 3 },
          { text: `b) Sin torque externo se conserva $L$: $\\omega_2 = \\frac{L}{I_2} \\approx ${nf(H, w2)}$ rad/s, con $I_2 \\approx ${nf(H, I2)}$ kg·m².`, w: 4 },
          { text: `c) $\\Delta K = K_2 - K_1 \\approx ${nf(H, K2 - K1)}$ J; aumenta por el trabajo que hace la persona con los brazos.`, w: 3 }
        ],
        solution: [
          `a) $I_1 = ${nf(H, I0)} + 2\\cdot ${m}\\cdot ${nf(H, r1)}^2 \\approx ${nf(H, I1)}$ kg·m², y $L = I_1\\omega_1 \\approx ${nf(H, I1)}\\cdot ${nf(H, w1)} \\approx ${nf(H, L)}$ kg·m²/s.`,
          `b) El eje es vertical y no hay rozamiento: el torque externo es nulo y $L$ se conserva. $I_2 = ${nf(H, I0)} + 2\\cdot ${m}\\cdot ${nf(H, r2)}^2 \\approx ${nf(H, I2)}$ kg·m², así que $\\omega_2 = \\frac{L}{I_2} \\approx ${nf(H, w2)}$ rad/s.`,
          `c) $K_1 = \\frac12 I_1\\omega_1^2 \\approx ${nf(H, K1)}$ J y $K_2 = \\frac12 I_2\\omega_2^2 \\approx ${nf(H, K2)}$ J. La energía aumenta $\\approx ${nf(H, K2 - K1)}$ J: es el trabajo que hace la persona al tirar de las pesas hacia el eje.`
        ]
      };
    }
  };

  // trabajo para mover una masa entre otras dos (energía potencial gravitatoria)
  SELF["f1-ex-trabajo-grav"] = {
    concepts: ["f1-gravitacion", "f1-energia"],
    generate(r, H) {
      const mA = r.pick([2.0, 2.5, 3.0, 4.0]), mB = r.pick([6.0, 6.5, 8.0, 9.0]), d = r.pick([1.2, 1.5, 1.8, 2.0]), s = r.pick([0.3, 0.35, 0.4, 0.5]), mC = r.pick([0.1, 0.15, 0.2, 0.25]);
      const U = (rA, rB) => -G * mC * (mA / rA + mB / rB), Ui = U(d - s, s), Uf = U(s, d - s), W = Uf - Ui;
      return {
        verify: { kind: "zero", tol: 1e-6, fn: () => { const n = 20000, x0 = d - s, x1 = s; let Wn = 0; for (let i = 0; i < n; i++) { const x = x0 + (x1 - x0) * (i + 0.5) / n, Fx = -G * mA * mC / (x * x) + G * mB * mC / ((d - x) ** 2); Wn += -Fx * (x1 - x0) / n; } return [(Wn - W) / Math.abs(W)]; } },
        prompt: `Dos esferas de $${nf(H, mA)}$ kg (A) y $${nf(H, mB)}$ kg (B) están fijas, con sus centros a $${nf(H, d)}$ m. Una tercera esfera C, de $${nf(H, mC)}$ kg, está sobre la recta que une los centros, a $${nf(H, s)}$ m del centro de B. ¿Cuánto trabajo tiene que hacer un agente externo para llevar C, a lo largo de esa recta y sin cambiar su velocidad, hasta $${nf(H, s)}$ m del centro de A? ($G = 6{,}674\\times10^{-11}$ N·m²/kg²)`,
        rubric: [
          { text: R`Usa que el trabajo del agente (a velocidad constante) es $\Delta U$, con $U = -\frac{G m_A m_C}{r_A} - \frac{G m_B m_C}{r_B}$.`, w: 4 },
          { text: `Calcula $U_i \\approx ${sci(Ui)}$ J y $U_f \\approx ${sci(Uf)}$ J con las distancias correctas.`, w: 3 },
          { text: `Resultado: $W = U_f - U_i \\approx ${sci(W)}$ J, con el signo bien interpretado.`, w: 3 }
        ],
        solution: [
          R`Si C se mueve sin cambiar su energía cinética, el trabajo del agente es igual al aumento de la energía potencial: $W = U_f - U_i$, con $U = -G m_C\left(\frac{m_A}{r_A} + \frac{m_B}{r_B}\right)$.`,
          `Al principio $r_A = ${nf(H, d - s)}$ m y $r_B = ${nf(H, s)}$ m: $U_i \\approx ${sci(Ui)}$ J.`,
          `Al final $r_A = ${nf(H, s)}$ m y $r_B = ${nf(H, d - s)}$ m: $U_f \\approx ${sci(Uf)}$ J.`,
          `$W = U_f - U_i \\approx ${sci(W)}$ J. ${W > 0 ? "Es positivo: hay que alejar a C de la esfera más pesada, que la atrae más." : "Es negativo: C se acerca a la esfera más pesada y el agente tiene que frenarla."}`
        ]
      };
    }
  };

  // energía almacenada en un resorte que lanza un bloque por una pendiente con rozamiento
  SELF["f1-ex-resorte-plano"] = {
    concepts: ["f1-energia", "f1-rozamiento"],
    generate(r, H) {
      const m = r.pick([1.0, 1.2, 1.5, 2.0]), th = r.pick([25, 30, 35, 40]), dist = r.pick([4, 5, 6, 7]), v = r.pick([4, 5, 6, 7]), mu = r.pick([0.2, 0.3, 0.4, 0.5]);
      const t = th * Math.PI / 180, Wfr = mu * m * g * Math.cos(t) * dist, Ug = m * g * Math.sin(t) * dist, K = 0.5 * m * v * v, U = K + Ug + Wfr;
      return {
        verify: { kind: "zero", tol: 1e-3, fn: () => { let x = 0, u = Math.sqrt(2 * U / m); const dt = 1e-5, acc = -g * Math.sin(t) - mu * g * Math.cos(t); while (x < dist) { x += u * dt + 0.5 * acc * dt * dt; u += acc * dt; } return [(u - v) / v]; } },
        prompt: `Un bloque de $${nf(H, m)}$ kg está contra un resorte comprimido en la base de una pendiente de $${th}^\\circ$ (punto A). Al soltar el resorte, el bloque sube por la pendiente y en el punto B, $${dist}$ m pendiente arriba de A, tiene una rapidez de $${v}$ m/s (ya sin tocar el resorte). El coeficiente de rozamiento dinámico entre el bloque y la pendiente es $${nf(H, mu)}$ y la masa del resorte es despreciable ($g = 9{,}8$ m/s²). ¿Cuánta energía potencial tenía almacenada el resorte?`,
        rubric: [
          { text: R`Plantea el balance: $U_{res} = K_B + mg\,d\sin\theta + |W_{fr}|$.`, w: 3 },
          { text: `Calcula la fricción con $N = mg\\cos\\theta$: $|W_{fr}| = \\mu mg\\cos\\theta\\, d \\approx ${nf(H, Wfr)}$ J.`, w: 3 },
          { text: `Resultado: $U_{res} \\approx ${nf(H, U, 1)}$ J.`, w: 4 }
        ],
        solution: [
          R`Entre A y B, el trabajo de las fuerzas no conservativas (la fricción) es igual a la variación de la energía mecánica: $-|W_{fr}| = (K_B + U_{g,B}) - U_{res}$, tomando $U_g = 0$ en A y $K_A = 0$.`,
          `$K_B = \\frac12 \\cdot ${nf(H, m)} \\cdot ${v}^2 = ${nf(H, K)}$ J; $U_{g,B} = mg\\,d\\sin\\theta \\approx ${nf(H, Ug)}$ J.`,
          `La normal es $mg\\cos\\theta$, así que $|W_{fr}| = \\mu mg\\cos\\theta\\, d \\approx ${nf(H, Wfr)}$ J.`,
          `$U_{res} = K_B + U_{g,B} + |W_{fr}| \\approx ${nf(H, U, 1)}$ J.`
        ]
      };
    }
  };

  // amplitud máxima de un oscilador con un bloque apoyado encima
  SELF["f1-ex-mas-bloques"] = {
    concepts: ["f1-mas", "f1-rozamiento"],
    generate(r, H) {
      const M = r.pick([2, 3, 4, 5]), m = r.pick([0.5, 1, 1.5]), k = r.pick([80, 120, 150, 200, 250]), mu = r.pick([0.3, 0.4, 0.5, 0.6]);
      const A = mu * g * (M + m) / k, T = 2 * Math.PI * Math.sqrt((M + m) / k);
      return {
        verify: { kind: "zero", tol: 1e-3, fn: () => { const fneed = m * k * A / (M + m); let x = A, u = 0, tt = 0, cross = 0, prev = x; const dt = 1e-5; while (cross < 2) { u -= k / (M + m) * x * dt; x += u * dt; tt += dt; if (prev > 0 && x <= 0 || prev < 0 && x >= 0) cross++; prev = x; } // arrancando en x = A, el segundo cruce por x = 0 ocurre a los 3T/4
          return [(fneed - mu * m * g) / (mu * m * g), (tt - 0.75 * T) / T]; } },
        prompt: `Un bloque de $${M}$ kg descansa sobre una superficie sin fricción, unido a un resorte horizontal de constante $${k}$ N/m fijo a una pared. Encima tiene un segundo bloque de $${nf(H, m)}$ kg; el coeficiente de rozamiento estático entre los bloques es $${nf(H, mu)}$ ($g = 9{,}8$ m/s²). a) ¿Cuál es la amplitud máxima de oscilación con la que el bloque de arriba no resbala? b) ¿Cuál es el período de esa oscilación?`,
        rubric: [
          { text: R`a) Para que no resbale, la fricción estática da la aceleración del bloque de arriba: $|a| \le \mu_s g$.`, w: 3 },
          { text: R`a) Los dos oscilan juntos con $\omega^2 = \frac{k}{M + m}$, y la aceleración máxima es $\omega^2 A$.`, w: 3 },
          { text: `a) $A_{max} = \\frac{\\mu_s g (M + m)}{k} \\approx ${nf(H, A, 3)}$ m. b) $T = 2\\pi\\sqrt{\\frac{M + m}{k}} \\approx ${nf(H, T)}$ s.`, w: 4 }
        ],
        solution: [
          R`Si no hay deslizamiento, los dos bloques se mueven juntos: un oscilador de masa $M + m$ y constante $k$, con $\omega^2 = \frac{k}{M + m}$.`,
          R`La única fuerza horizontal sobre el bloque de arriba es la fricción estática: $f_s = m\,a$. Como $f_s \le \mu_s m g$, hace falta $|a| \le \mu_s g$.`,
          R`En un MAS la aceleración máxima es $\omega^2 A$ (en los extremos). La condición es $\frac{k}{M + m}A \le \mu_s g$.`,
          `a) $A_{max} = \\frac{\\mu_s g (M + m)}{k} = \\frac{${nf(H, mu)}\\cdot 9{,}8 \\cdot ${nf(H, M + m)}}{${k}} \\approx ${nf(H, A, 3)}$ m. b) $T = 2\\pi\\sqrt{\\frac{${nf(H, M + m)}}{${k}}} \\approx ${nf(H, T)}$ s.`
        ]
      };
    }
  };

  // globo aerostático: densidad media del gas caliente
  SELF["f1-ex-globo"] = {
    concepts: ["f1-arquimedes"],
    generate(r, H) {
      const V = r.pick([1800, 2000, 2400, 2600]), wt = r.pick([800, 950, 1100]), wc = r.pick([1500, 1800, 2000]), wp = r.pick([2500, 3000, 3500]), rho = r.pick([1.20, 1.23, 1.25]);
      const W = wt + wc + wp, rin = rho - W / (g * V);
      return {
        verify: { kind: "zero", tol: 1e-9, scale: 1e4, fn: () => [rho * g * V - (wt + wc + wp) - rin * g * V] },
        prompt: `Un globo de aire caliente tiene un volumen de $${V}$ m³. La tela pesa $${wt}$ N y la canasta con su equipo, $${wc}$ N. El globo apenas puede levantar $${wp}$ N más de pasajeros cuando la densidad del aire exterior es $${nf(H, rho)}$ kg/m³ ($g = 9{,}8$ m/s²). ¿Qué densidad media tiene el gas caliente de adentro? (Despreciá el volumen de la tela, la canasta y los pasajeros.)`,
        rubric: [
          { text: R`Empuje de Arquímedes: $E = \rho_{ext}\,g\,V$.`, w: 3 },
          { text: R`Equilibrio: $E = w_{tela} + w_{canasta} + w_{pasajeros} + \rho_{int}\,g\,V$.`, w: 3 },
          { text: `Resultado: $\\rho_{int} \\approx ${nf(H, rin, 3)}$ kg/m³.`, w: 4 }
        ],
        solution: [
          `El globo apenas flota: la fuerza neta es nula. El empuje es el peso del aire exterior desalojado: $E = \\rho_{ext} g V \\approx ${nf(H, rho * g * V, 0)}$ N.`,
          `Hacia abajo actúan los pesos ($${W}$ N en total) y el peso del gas interior, $\\rho_{int} g V$.`,
          `$\\rho_{int} = \\rho_{ext} - \\frac{${W}}{g V} = ${nf(H, rho)} - \\frac{${W}}{9{,}8\\cdot ${V}} \\approx ${nf(H, rin, 3)}$ kg/m³.`
        ]
      };
    }
  };

  E.registerExams("f101", {
    self: SELF,
    // los ítems con `any` sortean entre problemas que aparecieron en distintos años (promocionales, 2024, 2025)
    exams: [
      { id: "p1", kind: "parcial", title: "1.er parcial", topics: "Cinemática, dinámica, energía, choques y fluidos", minutes: 150, pass: 60,
        items: [
          { any: [
            { title: "Dinámica con rozamiento y movimiento relativo", parts: [{ self: "f1-ex-bloques", pts: 35 }] },
            { title: "Una caja en la camioneta", parts: [{ self: "f1-ex-camioneta", pts: 35 }] }
          ] },
          { any: [
            { title: "Choque y trabajo de la fricción", parts: [{ self: "f1-ex-tejo", pts: 35 }] },
            { title: "Choque en un cruce", parts: [{ tpl: "f1-ex-choque2d-v", pts: 20 }, { tpl: "f1-ex-choque2d-ang", pts: 15 }] }
          ] },
          { any: [
            { title: "Fluidos", parts: [{ tpl: "f1-bernoulli-num", pts: 12 }, { tpl: "f1-continuidad-num", pts: 8 }, { tpl: "f1-presion-num", pts: 10 }] },
            { title: "Fluidos: caño con pistón", parts: [{ tpl: "f1-ex-piston", pts: 30 }] },
            { title: "Energía con resorte y rozamiento", parts: [{ self: "f1-ex-resorte-plano", pts: 30 }] }
          ] }
        ] },
      { id: "p2", kind: "parcial", title: "2.º parcial", topics: "Rotación, momento angular, equilibrio y gravitación", minutes: 150, pass: 60,
        items: [
          { any: [
            { title: "Momento angular", parts: [{ self: "f1-ex-taburete", pts: 35 }] },
            { title: "Bala en un blanco que pivotea", parts: [{ self: "f1-ex-bala", pts: 35 }] },
            { title: "Cilindro, cable y bloque", parts: [{ tpl: "f1-ex-cilindro-bloque", pts: 20 }, { tpl: "f1-ex-tambor-marte", pts: 15 }] }
          ] },
          { any: [
            { title: "Equilibrio del cuerpo rígido", parts: [{ tpl: "f1-escalera-num", pts: 15 }, { tpl: "f1-viga-num", pts: 15 }] },
            { title: "Puente levadizo", parts: [{ tpl: "f1-ex-puente-cable", pts: 15 }, { tpl: "f1-ex-puente-cae", pts: 15 }] }
          ] },
          { any: [
            { title: "Gravitación", parts: [{ self: "f1-ex-trabajo-grav", pts: 20 }, { tpl: "f1-orbita-num", pts: 15 }] },
            { title: "Gravitación y lunas", parts: [{ tpl: "f1-ex-luna", pts: 20 }, { pick: ["f1-grav-num", "f1-escape-num"], pts: 15 }] },
            { title: "Rodadura y momento angular", parts: [{ tpl: "f1-rodadura-num", pts: 20 }, { tpl: "f1-patinadora-num", pts: 15 }] }
          ] }
        ] },
      { id: "final", kind: "final", title: "Final (libre)", topics: "Toda la materia: equilibrio, energía, gravitación, oscilaciones y fluidos. Si sos regular, el final incluye los problemas 3, 4 y 5.", minutes: 180, pass: 60,
        items: [
          { title: "Equilibrio", parts: [{ pick: ["f1-escalera-num", "f1-viga-num", "f1-ex-puente-cable"], pts: 20 }] },
          { title: "Energía", parts: [{ any: [{ self: "f1-ex-resorte-plano" }, { tpl: "f1-ex-cilindro-bloque" }, { tpl: "f1-ex-puente-cae" }], pts: 20 }] },
          { title: "Gravitación y órbitas", parts: [{ any: [{ tpl: "f1-grav-num" }, { tpl: "f1-ex-luna" }], pts: 10 }, { pick: ["f1-orbita-num", "f1-kepler-num"], pts: 10 }] },
          { title: "Oscilaciones", parts: [{ any: [{ self: "f1-ex-mas-bloques" }, { tpl: "f1-pendulo-num" }, { tpl: "f1-amort-num" }], pts: 20 }] },
          { title: "Fluidos", parts: [{ any: [{ self: "f1-ex-globo" }, { tpl: "f1-arquimedes-num" }, { tpl: "f1-ex-piston" }], pts: 20 }] }
        ] }
    ]
  });
})();

/* ===== F101 · Evaluaciones: más variantes (parciales 2024 y 2025) =====
   Problemas de nivel parcial con corrección automática (cada uno con verify por simulación o por otro
   planteo) y problemas de desarrollo nuevos. g = 9,8 m/s² en todos. */
(function () {
  const E = window.Efecen, R = String.raw, g = 9.8;
  const T = {}, SELF = {};
  const nf = (H, x, d = 2) => H.num(x, d).replace(".", "{,}");
  // integra x'' = acc(x, v) con un paso fijo (método de Verlet en velocidad), hasta que stop(x, v, t)
  const sim = (x, v, acc, stop, dt = 1e-5, tmax = 100) => {
    let t = 0, a = acc(x, v);
    while (!stop(x, v, t) && t < tmax) { x += v * dt + 0.5 * a * dt * dt; const a2 = acc(x, v); v += 0.5 * (a + a2) * dt; a = a2; t += dt; }
    return { x, v, t };
  };

  // caja que resbala en la caja de una camioneta que arranca
  T["f1-ex-camioneta"] = {
    type: "numeric", concepts: ["f1-rozamiento", "f1-relativo"], difficulty: 3, testN: 60,
    generate(r, H) {
      const m = r.pick([10, 12, 15, 20]), mus = r.pick([0.15, 0.19, 0.22]), muk = +(mus - r.pick([0.03, 0.04, 0.05])).toFixed(2), a = r.pick([2.4, 2.6, 2.8, 3.0]), d = r.pick([1.2, 1.5, 1.8, 2.1]);
      if (a <= mus * g) return null;
      const arel = a - muk * g, t = Math.sqrt(2 * d / arel);
      return {
        prompt: `Una caja de $${m}$ kg está en la caja de una camioneta, a $${nf(H, d)}$ m del borde trasero (abierto). Los coeficientes de rozamiento entre la caja y el piso son $\\mu_s = ${nf(H, mus)}$ y $\\mu_k = ${nf(H, muk)}$. La camioneta arranca con aceleración $${nf(H, a)}$ m/s² ($g = 9{,}8$ m/s²). ¿Cuánto tarda la caja en caerse por atrás (en s)?`,
        answer: t, tolerance: 0.01,
        solution: [
          `Para acompañar a la camioneta, la caja necesitaría una fuerza $ma = ${nf(H, m * a, 1)}$ N, pero el rozamiento estático da como máximo $\\mu_s mg = ${nf(H, mus * m * g, 1)}$ N: **resbala**.`,
          `Resbalando, el rozamiento dinámico la acelera hacia adelante con $a_c = \\mu_k g = ${nf(H, muk * g)}$ m/s². Respecto de la camioneta, la caja va hacia atrás con $a_{rel} = ${nf(H, a)} - ${nf(H, muk * g)} = ${nf(H, arel, 3)}$ m/s².`,
          `$${nf(H, d)} = \\frac12 a_{rel}t^2 \\Rightarrow t = \\sqrt{\\frac{2\\cdot${nf(H, d)}}{${nf(H, arel, 3)}}} \\approx ${nf(H, t, 3)}$ s.`
        ],
        verify: { kind: "value", tol: 1e-3, fn: () => { let xc = 0, vc = 0, xk = d, vk = 0, tt = 0; const dt = 1e-5; while (xk > xc && tt < 50) { vc += a * dt; xc += vc * dt; vk += muk * g * dt; xk += vk * dt; tt += dt; } return tt; } }
      };
    }
  };

  // choque plástico en un cruce (2D): rapidez y dirección de los restos
  const choque = (r) => {
    const m1 = r.pick([800, 1000, 1200, 1500]), m2 = r.pick([1600, 2000, 2400, 2500]), v1 = r.pick([10, 12, 15, 18]), v2 = r.pick([8, 10, 12, 14]);
    const vx = m2 * v2 / (m1 + m2), vy = m1 * v1 / (m1 + m2);
    return { m1, m2, v1, v2, vx, vy, v: Math.hypot(vx, vy), ang: Math.atan2(vy, vx) * 180 / Math.PI };
  };
  const choqueTxt = (H, c) => `Un auto de $${c.m1}$ kg que va hacia el norte a $${c.v1}$ m/s choca en un cruce con una camioneta de $${c.m2}$ kg que va hacia el este a $${c.v2}$ m/s. Quedan enganchados y se mueven juntos.`;
  T["f1-ex-choque2d-v"] = {
    type: "numeric", concepts: ["f1-choques", "f1-momento"], difficulty: 2,
    generate(r, H) {
      const c = choque(r);
      return {
        prompt: `${choqueTxt(H, c)} ¿Con qué rapidez (m/s) salen los restos justo después del choque?`,
        answer: c.v, tolerance: 0.01,
        solution: [R`Durante el choque las fuerzas externas son despreciables: se conserva $\vec p$ en cada eje.`,
          `Este: $${c.m2}\\cdot${c.v2} = ${c.m1 + c.m2}\\,v_x \\Rightarrow v_x \\approx ${nf(H, c.vx, 3)}$ m/s. Norte: $${c.m1}\\cdot${c.v1} = ${c.m1 + c.m2}\\,v_y \\Rightarrow v_y \\approx ${nf(H, c.vy, 3)}$ m/s.`,
          `$v = \\sqrt{v_x^2 + v_y^2} \\approx ${nf(H, c.v, 3)}$ m/s.`],
        verify: { kind: "zero", tol: 1e-9, scale: 1e5, fn: v => { const th = Math.atan2(c.vy, c.vx); return [c.m2 * c.v2 - (c.m1 + c.m2) * v * Math.cos(th), c.m1 * c.v1 - (c.m1 + c.m2) * v * Math.sin(th)]; } }
      };
    }
  };
  T["f1-ex-choque2d-ang"] = {
    type: "numeric", concepts: ["f1-choques", "f1-vectores"], difficulty: 2,
    generate(r, H) {
      const c = choque(r);
      return {
        prompt: `${choqueTxt(H, c)} ¿Qué ángulo (en grados) forma la velocidad de los restos con la dirección este, hacia el norte?`,
        answer: c.ang, tolerance: 0.01,
        solution: [`Por conservación de la cantidad de movimiento: $v_x = \\frac{${c.m2}\\cdot${c.v2}}{${c.m1 + c.m2}}$ y $v_y = \\frac{${c.m1}\\cdot${c.v1}}{${c.m1 + c.m2}}$.`,
          `$\\tan\\theta = \\frac{v_y}{v_x} = \\frac{${c.m1}\\cdot${c.v1}}{${c.m2}\\cdot${c.v2}} \\approx ${nf(H, c.vy / c.vx, 3)}$, así que $\\theta \\approx ${nf(H, c.ang, 1)}^\\circ$ al norte del este.`],
        verify: { kind: "zero", tol: 1e-9, scale: 1e5, fn: ang => { const t = ang * Math.PI / 180, v = Math.hypot(c.vx, c.vy); return [c.m2 * c.v2 - (c.m1 + c.m2) * v * Math.cos(t), c.m1 * c.v1 - (c.m1 + c.m2) * v * Math.sin(t)]; } }
      };
    }
  };

  // cilindro que gira con un bloque colgado de un cable enrollado
  T["f1-ex-cilindro-bloque"] = {
    type: "numeric", concepts: ["f1-energia", "f1-inercia"], difficulty: 2, testN: 60,
    generate(r, H) {
      const M = r.pick([4, 6, 8, 10]), m = r.pick([1, 1.5, 2, 3]), R0 = r.pick([0.1, 0.15, 0.2, 0.25]), h = r.pick([1.5, 2, 2.5, 3]);
      const v = Math.sqrt(2 * m * g * h / (m + M / 2));
      return {
        prompt: `Un cable liviano está enrollado en un cilindro macizo de $${M}$ kg y radio $${nf(H, R0)}$ m, que gira sin fricción alrededor de un eje horizontal fijo. Del extremo libre cuelga un bloque de $${nf(H, m)}$ kg, que se suelta desde el reposo a $${nf(H, h)}$ m del piso; el cable no resbala ($g = 9{,}8$ m/s², $I = \\frac12 MR^2$). ¿Con qué rapidez (m/s) llega el bloque al piso?`,
        answer: v, tolerance: 0.01,
        solution: [R`No hay fuerzas no conservativas que hagan trabajo: se conserva la energía mecánica. Además $v = \omega R$ (el cable no resbala).`,
          `$mgh = \\frac12 mv^2 + \\frac12\\left(\\frac12 MR^2\\right)\\frac{v^2}{R^2} = \\frac12\\left(m + \\frac M2\\right)v^2$.`,
          `$v = \\sqrt{\\frac{2mgh}{m + M/2}} = \\sqrt{\\frac{2\\cdot${nf(H, m)}\\cdot 9{,}8\\cdot${nf(H, h)}}{${nf(H, m + M / 2)}}} \\approx ${nf(H, v, 3)}$ m/s. (No depende de $R$.)`],
        // dinámica con Newton: bloque mg − T = ma y cilindro T R = I α, resolviendo T en cada paso
        verify: { kind: "value", tol: 1e-4, fn: () => { const I = 0.5 * M * R0 * R0; const acc = () => { const a = m * g / (m + I / (R0 * R0)); return a; }; return sim(0, 0, acc, x => x >= h).v; } }
      };
    }
  };

  // tambor que se prueba en la Tierra y se usa en Marte
  T["f1-ex-tambor-marte"] = {
    type: "numeric", concepts: ["f1-energia", "f1-inercia"], difficulty: 3,
    generate(r, H) {
      const m = r.pick([10, 12, 15, 20]), hE = r.pick([4, 5, 6]), frac = r.pick([0.3, 0.35, 0.4, 0.45]), gM = 3.71;
      const KT = Math.round(frac * m * g * hE), hM = hE * g / gM;
      return {
        prompt: `Una masa de $${m}$ kg cuelga de un alambre enrollado en un tambor uniforme que gira sin fricción. En la Tierra ($g = 9{,}8$ m/s²), al caer $${hE}$ m desde el reposo, la masa le da al tambor $${KT}$ J de energía cinética. Si el mismo sistema se usa en Marte ($g = 3{,}71$ m/s²), ¿qué distancia (en m) tiene que caer la masa para darle al tambor esos mismos $${KT}$ J?`,
        answer: hM, tolerance: 0.01,
        solution: [R`Como $v = \omega R$, en cualquier instante $\frac{K_{tambor}}{K_{masa}} = \frac{\frac12 I\omega^2}{\frac12 mv^2} = \frac{I}{mR^2}$: la energía se reparte siempre en la misma proporción.`,
          `Entonces $K_{tambor}$ es una fracción fija de $mgh$. Para la misma $K_{tambor}$ hace falta el mismo $mgh$: $g_T h_T = g_M h_M$.`,
          `$h_M = \\frac{9{,}8\\cdot${hE}}{3{,}71} \\approx ${nf(H, hM, 2)}$ m.`],
        verify: { kind: "zero", tol: 1e-9, fn: hm => { const q = KT / (m * g * hE - KT); /* I/(mR²) */ return [m * gM * hm * q / (1 + q) - KT]; } }
      };
    }
  };

  // bala que se incrusta en un blanco cuadrado que pivotea en su borde superior
  const bala = r => {
    const M = r.pick([0.5, 0.75, 1.0]), s = r.pick([0.2, 0.25, 0.3]), m = r.pick([1.5, 2, 2.5]) / 1000, v = r.pick([300, 350, 400]);
    const I = M * s * s / 3 + m * (s / 2) ** 2, w = m * v * (s / 2) / I, hc = 0.5 * I * w * w / ((M + m) * g);
    return { M, s, m, v, I, w, hc };
  };
  const balaTxt = (H, b) => `Un blanco es una tabla cuadrada de madera de $${nf(H, b.M)}$ kg y $${nf(H, b.s)}$ m de lado, que cuelga de un eje horizontal sin fricción en su borde superior. Una bala de $${nf(H, b.m * 1000, 1)}$ g que viaja horizontalmente a $${b.v}$ m/s le pega de frente en el centro y queda incrustada ($g = 9{,}8$ m/s²; para la tabla, $I = \\frac13 Ms^2$ respecto del borde).`;
  T["f1-ex-bala-w"] = {
    type: "numeric", concepts: ["f1-momento-angular"], difficulty: 3,
    generate(r, H) {
      const b = bala(r);
      return {
        prompt: `${balaTxt(H, b)} ¿Qué rapidez angular (rad/s) tiene la tabla justo después del impacto?`,
        answer: b.w, tolerance: 0.01,
        solution: [R`Durante el impacto, la fuerza del eje no hace torque respecto de él y el peso casi no actúa: se conserva el momento angular respecto del eje.`,
          `$m v \\frac{s}{2} = \\left(\\frac13 Ms^2 + m\\frac{s^2}{4}\\right)\\omega$, así que $\\omega \\approx \\frac{${nf(H, b.m * b.v * b.s / 2, 4)}}{${nf(H, b.I, 5)}} \\approx ${nf(H, b.w, 3)}$ rad/s.`],
        verify: { kind: "zero", tol: 1e-9, fn: w => [b.m * b.v * b.s / 2 - (b.M * b.s * b.s / 3 + b.m * b.s * b.s / 4) * w] }
      };
    }
  };
  T["f1-ex-bala-h"] = {
    type: "numeric", concepts: ["f1-momento-angular", "f1-energia"], difficulty: 3, testN: 60,
    generate(r, H) {
      const b = bala(r);
      return {
        prompt: `${balaTxt(H, b)} ¿Qué altura máxima (en cm) sube el centro de la tabla respecto de su posición de equilibrio?`,
        answer: b.hc * 100, tolerance: 0.01,
        solution: [`Primero, conservación del momento angular en el impacto: $\\omega \\approx ${nf(H, b.w, 3)}$ rad/s.`,
          R`Después del impacto no hay fuerzas no conservativas que hagan trabajo: $\frac12 I\omega^2 = (M + m)\,g\,h$, porque el centro de la tabla y la bala suben lo mismo.`,
          `$h = \\frac{I\\omega^2}{2(M + m)g} \\approx ${nf(H, b.hc * 100, 2)}$ cm.`],
        // simula el péndulo físico después del choque hasta que se detiene
        verify: { kind: "value", tol: 1e-3, fn: () => { const d = b.s / 2, K = (b.M + b.m) * g * d / b.I; const out = sim(0, b.w, th => -K * Math.sin(th), (th, w) => w <= 0, 1e-5); return d * (1 - Math.cos(out.x)) * 100; } }
      };
    }
  };

  // puente levadizo sostenido por un cable horizontal
  T["f1-ex-puente-cable"] = {
    type: "numeric", concepts: ["f1-equilibrio", "f1-torque"], difficulty: 3,
    generate(r, H) {
      const W = r.pick([30000, 40000, 45000, 50000]), L = r.pick([10, 12, 14]), th = r.pick([30, 37, 45, 53]), d = r.pick([3, 3.5, 4]);
      const t = th * Math.PI / 180, Tn = W * (L / 2) * Math.cos(t) / (d * Math.sin(t));
      return {
        prompt: `Un puente levadizo uniforme de $${L}$ m y $${W}$ N se sostiene a $${th}^\\circ$ sobre la horizontal con un cable **horizontal**, unido al puente a $${nf(H, d)}$ m de la rótula (medidos a lo largo del puente). ¿Cuál es la tensión del cable (en kN)?`,
        answer: Tn / 1000, tolerance: 0.01,
        solution: [R`Tomamos torques respecto de la rótula: así las dos componentes de la fuerza de la rótula no aparecen.`,
          `El peso actúa en el centro, a $${L / 2}$ m: su brazo es $${L / 2}\\cos${th}^\\circ$. El cable es horizontal y está a $${nf(H, d)}$ m: su brazo es $${nf(H, d)}\\sin${th}^\\circ$.`,
          `$T\\cdot${nf(H, d)}\\sin${th}^\\circ = ${W}\\cdot${L / 2}\\cos${th}^\\circ \\Rightarrow T \\approx ${nf(H, Tn / 1000, 2)}$ kN. (La rótula hace $${W / 1000}$ kN hacia arriba y $T$ hacia afuera.)`],
        // otro planteo: torques respecto del punto donde está el cable (ahí sí aparece la rótula, con Nx = T y Ny = W)
        verify: { kind: "zero", tol: 1e-9, scale: 1e6, fn: ans => { const T1 = ans * 1000, px = d * Math.cos(t), py = d * Math.sin(t), cx = (L / 2) * Math.cos(t); return [-px * W + py * T1 - W * (cx - px)]; } }
      };
    }
  };

  // puente levadizo que cae cuando se corta el cable
  T["f1-ex-puente-cae"] = {
    type: "numeric", concepts: ["f1-torque", "f1-energia"], difficulty: 3, testN: 60,
    generate(r, H) {
      const L = r.pick([6, 8, 10]), th = r.pick([45, 50, 60, 70]), t = th * Math.PI / 180;
      const w = Math.sqrt(3 * g * Math.sin(t) / L);
      return {
        prompt: `Un puente levadizo uniforme de $${L}$ m está articulado sin fricción en un extremo y se sostiene a $${th}^\\circ$ sobre la horizontal con un cable en el otro extremo. Si el cable se corta, ¿qué rapidez angular (rad/s) tiene el puente justo antes de quedar horizontal? (Modelalo como una varilla: $I = \\frac13 ML^2$ respecto de la articulación; $g = 9{,}8$ m/s².)`,
        answer: w, tolerance: 0.01,
        solution: [R`La aceleración angular cambia con el ángulo (el torque del peso depende de $\theta$), así que no sirven las ecuaciones de $\alpha$ constante: usamos energía.`,
          `El centro de masa baja $\\frac L2\\sin${th}^\\circ$: $Mg\\frac L2\\sin${th}^\\circ = \\frac12\\cdot\\frac13 ML^2\\omega^2$.`,
          `$\\omega = \\sqrt{\\frac{3g\\sin${th}^\\circ}{L}} \\approx ${nf(H, w, 3)}$ rad/s.`],
        verify: { kind: "value", tol: 1e-3, fn: () => { const out = sim(t, 0, th1 => -(3 * g / (2 * L)) * Math.cos(th1), th1 => th1 <= 0, 1e-5); return -out.v; } }
      };
    }
  };

  // Bernoulli + equilibrio: pistón con resorte en un tubo vertical conectado al caño
  T["f1-ex-piston"] = {
    type: "numeric", concepts: ["f1-hidrodinamica", "f1-hidrostatica", "f1-hooke"], difficulty: 3,
    generate(r, H) {
      const rho = 1000, v0 = r.pick([1.0, 1.2, 1.5]), P0 = r.pick([1.6e5, 1.8e5, 2.0e5]), h = r.pick([0.2, 0.3, 0.4]), A = r.pick([2, 3, 4]) * 1e-4, mp = r.pick([0.5, 1.0, 1.5]), k = r.pick([800, 1000, 1500]);
      const v = 4 * v0, P = P0 + 0.5 * rho * (v0 * v0 - v * v), Pp = P - rho * g * h, x = (Pp * A - mp * g) / k;
      if (x <= 0) return null;
      return {
        prompt: `Por un caño horizontal circula agua ($\\rho = 1000$ kg/m³). En una sección de radio $2r$ la presión es $${nf(H, P0 / 1000, 0)}$ kPa y la velocidad $${nf(H, v0)}$ m/s; después el caño se angosta a radio $r$. Sobre la parte angosta hay un tubo vertical de sección $${nf(H, A * 1e4, 0)}$ cm² con un pistón de $${nf(H, mp)}$ kg, en equilibrio a $${nf(H, h)}$ m sobre el eje del caño, apoyado contra un resorte de $k = ${k}$ N/m (arriba del pistón hay vacío). ¿Cuánto está comprimido el resorte (en cm)? ($g = 9{,}8$ m/s²)`,
        answer: x * 100, tolerance: 0.01,
        solution: [
          `Continuidad: el área es 4 veces menor, así que $v = 4v_0 = ${nf(H, v)}$ m/s.`,
          `Bernoulli entre las dos secciones (misma altura): $P = P_0 + \\frac12\\rho(v_0^2 - v^2) \\approx ${nf(H, P / 1000, 2)}$ kPa.`,
          `El agua del tubo vertical está quieta: en el pistón la presión es $P - \\rho g h \\approx ${nf(H, Pp / 1000, 2)}$ kPa.`,
          `Equilibrio del pistón (vacío arriba): $(P - \\rho g h)A = m g + kx$, así que $x = \\frac{${nf(H, Pp * A, 2)} - ${nf(H, mp * g, 2)}}{${k}} \\approx ${nf(H, x * 100, 2)}$ cm.`
        ],
        // otro camino: energía por unidad de volumen (Bernoulli generalizado) desde C hasta el pistón
        verify: { kind: "zero", tol: 1e-9, scale: 1e3, fn: xc => { const e0 = P0 + 0.5 * rho * v0 * v0, ep = e0 - 0.5 * rho * (4 * v0) ** 2 - rho * g * h; return [ep * A - mp * g - k * xc / 100]; } }
      };
    }
  };

  // gravitación: aceleración orbital de una luna a partir de la gravedad en la superficie del planeta
  T["f1-ex-luna"] = {
    type: "numeric", concepts: ["f1-gravitacion", "f1-orbitas"], difficulty: 2,
    generate(r, H) {
      const R0 = r.pick([25000, 24800, 58200, 69900]) * 1e3, gs = r.pick([8.9, 10.4, 11.1, 24.8]), hh = r.pick([100000, 130000, 190000, 400000]) * 1e3;
      const rr = R0 + hh, a = gs * R0 * R0 / (rr * rr);
      return {
        prompt: `Un planeta tiene un radio de $${nf(H, R0 / 1e3, 0)}$ km y en su superficie la gravedad es $${nf(H, gs)}$ m/s². Una de sus lunas está en órbita circular a $${nf(H, hh / 1e3, 0)}$ km **sobre la superficie**. ¿Cuál es la aceleración (en m/s²) de la luna debida a su movimiento orbital?`,
        answer: a, tolerance: 0.01,
        solution: [R`En la superficie, $g = \frac{GM}{R^2}$, así que $GM = gR^2$.`,
          `La luna está a $r = R + h = ${nf(H, rr / 1e3, 0)}$ km del centro. Su aceleración (centrípeta) la da la gravedad: $a = \\frac{GM}{r^2} = g\\frac{R^2}{r^2}$.`,
          `$a = ${nf(H, gs)}\\cdot\\left(\\frac{${nf(H, R0 / 1e3, 0)}}{${nf(H, rr / 1e3, 0)}}\\right)^2 \\approx ${nf(H, a, 4)}$ m/s².`],
        // otro camino: período de la órbita (Kepler) y aceleración centrípeta 4π² r / T²
        verify: { kind: "value", tol: 1e-9, fn: () => { const GM = gs * R0 * R0, Tp = 2 * Math.PI * Math.sqrt(rr ** 3 / GM); return 4 * Math.PI * Math.PI * rr / (Tp * Tp); } }
      };
    }
  };

  // ---------- desarrollo ----------
  SELF["f1-ex-camioneta"] = {
    concepts: ["f1-rozamiento", "f1-newton"],
    generate(r, H) {
      const m = r.pick([10, 12, 15]), mus = r.pick([0.18, 0.2, 0.22]), muk = +(mus - 0.04).toFixed(2), a = r.pick([2.4, 2.6, 2.8]), d = r.pick([1.5, 1.8, 2.0]);
      if (a <= mus * g) return null;
      const arel = a - muk * g, t = Math.sqrt(2 * d / arel), xt = 0.5 * a * t * t;
      return {
        prompt: `Una caja de $${m}$ kg descansa en el piso de la caja de una camioneta sin puerta trasera, a $${nf(H, d)}$ m del borde. Los coeficientes de rozamiento son $\\mu_s = ${nf(H, mus)}$ y $\\mu_k = ${nf(H, muk)}$. La camioneta arranca con aceleración $${nf(H, a)}$ m/s² ($g = 9{,}8$ m/s²). a) ¿Puede la caja mantenerse sobre la camioneta sin resbalar? Justificá con el DCL y la fuerza neta que necesitaría. b) Si resbala, ¿cuánto tarda en caerse por atrás? c) ¿Qué distancia recorre la camioneta en ese tiempo?`,
        rubric: [
          { text: R`a) DCL: peso, normal y rozamiento (hacia adelante). Necesitaría $ma$, mayor que $\mu_s mg$: resbala.`, w: 4 },
          { text: `b) Aceleración relativa $a - \\mu_k g \\approx ${nf(H, arel, 3)}$ m/s² y $t \\approx ${nf(H, t, 3)}$ s.`, w: 3 },
          { text: `c) $x = \\frac12 a t^2 \\approx ${nf(H, xt, 2)}$ m.`, w: 3 }
        ],
        solution: [
          `a) Si no resbalara, la caja tendría la aceleración de la camioneta, y la única fuerza horizontal sobre ella es el rozamiento: haría falta $f = ma = ${nf(H, m * a, 1)}$ N. El máximo estático es $\\mu_s mg = ${nf(H, mus * m * g, 1)}$ N: no alcanza, **resbala**.`,
          `b) Resbalando, $f_k = \\mu_k mg$ la acelera hacia adelante con $\\mu_k g = ${nf(H, muk * g)}$ m/s². Respecto de la camioneta retrocede con $${nf(H, arel, 3)}$ m/s²: $t = \\sqrt{\\frac{2\\cdot${nf(H, d)}}{${nf(H, arel, 3)}}} \\approx ${nf(H, t, 3)}$ s.`,
          `c) La camioneta parte del reposo: $x = \\frac12\\cdot${nf(H, a)}\\cdot${nf(H, t, 3)}^2 \\approx ${nf(H, xt, 2)}$ m.`
        ],
        verify: { kind: "zero", tol: 1e-3, fn: () => { let xc = 0, vc = 0, xk = d, vk = 0, tt = 0; const dt = 1e-5; while (xk > xc && tt < 50) { vc += a * dt; xc += vc * dt; vk += muk * g * dt; xk += vk * dt; tt += dt; } return [(tt - t) / t, (xc - xt) / xt]; } }
      };
    }
  };
  SELF["f1-ex-bala"] = {
    concepts: ["f1-momento-angular", "f1-energia"],
    generate(r, H) {
      const b = bala(r), d = b.s / 2;
      // rapidez mínima para dar la vuelta completa: el centro tiene que subir 2d
      const wmin = Math.sqrt(2 * (b.M + b.m) * g * 2 * d / b.I), vmin = wmin * b.I / (b.m * d);
      return {
        prompt: `${balaTxt(H, b)} a) ¿Qué rapidez angular tiene la tabla justo después del impacto? ¿Qué principio de conservación usaste y por qué vale? b) ¿Qué altura máxima sube el centro de la tabla? Justificá el principio que uses. c) ¿Qué rapidez mínima tendría que tener la bala para que la tabla dé una vuelta completa?`,
        rubric: [
          { text: `a) Momento angular respecto del eje (la fuerza del eje no hace torque): $\\omega \\approx ${nf(H, b.w, 3)}$ rad/s.`, w: 4 },
          { text: R`a) Justifica: durante el choque, el torque externo respecto del eje es despreciable (no se conserva la energía).`, w: 1 },
          { text: `b) Energía mecánica después del impacto: $h \\approx ${nf(H, b.hc * 100, 2)}$ cm.`, w: 3 },
          { text: R`b) Justifica: después del impacto solo hace trabajo el peso.`, w: 1 },
          { text: `c) Que el centro suba $2\\cdot\\frac s2$: $\\omega_{min} \\approx ${nf(H, wmin, 2)}$ rad/s y $v_{min} \\approx ${nf(H, vmin, 0)}$ m/s.`, w: 4 }
        ],
        solution: [
          `a) $I = \\frac13 Ms^2 + m\\left(\\frac s2\\right)^2 \\approx ${nf(H, b.I, 5)}$ kg·m². Conservación del momento angular respecto del eje: $mv\\frac s2 = I\\omega$, así que $\\omega \\approx ${nf(H, b.w, 3)}$ rad/s.`,
          `b) Desde justo después del impacto, $\\frac12 I\\omega^2 = (M + m)gh$: $h \\approx ${nf(H, b.hc * 100, 2)}$ cm.`,
          `c) Para dar la vuelta, el centro tiene que llegar arriba de todo (subir $s$) con $\\omega \\ge 0$: $\\frac12 I\\omega_{min}^2 = (M + m)g\\,s$, o sea $\\omega_{min} \\approx ${nf(H, wmin, 2)}$ rad/s. Con el momento angular: $v_{min} = \\frac{I\\omega_{min}}{m s/2} \\approx ${nf(H, vmin, 0)}$ m/s.`
        ],
        verify: { kind: "zero", tol: 2e-3, fn: () => { const K = (b.M + b.m) * g * d / b.I; const out = sim(0, b.w, th => -K * Math.sin(th), (th, w) => w <= 0, 1e-5); const up = sim(0, wmin * 1.001, th => -K * Math.sin(th), (th, w) => th >= Math.PI || w <= 0, 1e-5); return [(d * (1 - Math.cos(out.x)) - b.hc) / b.hc, up.x >= Math.PI ? 0 : 1]; } }
      };
    }
  };

  E.registerExams("f101", { self: SELF, templates: T });
})();

/* ===== F101 · Examen Extra UBA =====
   Temas de Física 1 de la Lic. en Cs. Físicas (FCEN, UBA) que no están en el programa de F101, con el formato de
   un parcial de allá: problemas largos de desarrollo y cuentas. Enunciados propios y datos sorteados. g = 9,8 m/s². */
(function () {
  const E = window.Efecen, R = String.raw, H = E.H;
  const SELF = {};
  const g0 = 9.8;
  const dn = (x, d = 4) => String(H.num(x, d)).replace(".", "{,}");
  // RK4 de paso fijo para sistemas: f(t, y) → dy/dt
  const rk4 = (f, y0, t1, n) => { let y = y0.slice(), t = 0; const h = t1 / n; for (let i = 0; i < n; i++) { const k1 = f(t, y), k2 = f(t + h / 2, y.map((v, j) => v + h / 2 * k1[j])), k3 = f(t + h / 2, y.map((v, j) => v + h / 2 * k2[j])), k4 = f(t + h, y.map((v, j) => v + h * k3[j])); y = y.map((v, j) => v + h / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])); t += h; } return y; };
  // velocidad ganada quemando el combustible de m0 hasta m1 con caudal 1 kg/s (independiente del caudal)
  const burnDv = (m0, m1, u) => rk4((_, y) => [u / y[1], -1], [0, m0], m0 - m1, 4000)[0];

  SELF["f1-ex-etapas"] = {
    concepts: ["f1-cohete"],
    generate(r) {
      const u = r.int(20, 35) * 100, f1 = r.int(20, 60) * 100, d1 = Math.round(f1 / r.pick([8, 10, 12]) / 10) * 10, f2 = r.int(5, 15) * 100, d2 = Math.round(f2 / 10 / 10) * 10, P = r.int(1, 5) * 100;
      const M0 = f1 + d1 + f2 + d2 + P, m2 = f2 + d2 + P;
      const dv1 = u * Math.log(M0 / (M0 - f1)), dv2 = u * Math.log(m2 / (d2 + P)), dvs = u * Math.log(M0 / (d1 + d2 + P));
      return {
        prompt: `Un cohete de dos etapas lleva una carga útil de $${P}$ kg. La primera etapa tiene $${f1}$ kg de combustible y $${d1}$ kg de estructura; la segunda, $${f2}$ kg de combustible y $${d2}$ kg de estructura. En las dos, los gases salen a $${u}$ m/s respecto del cohete. Parte del reposo en el espacio, lejos de todo. Al agotarse la primera etapa, su estructura se suelta y se enciende la segunda.<br>a) ¿Qué velocidad tiene al terminar la primera etapa?<br>b) ¿Y al terminar la segunda?<br>c) Si el mismo combustible y la misma estructura formaran una sola etapa (sin soltar nada), ¿qué velocidad final tendría? ¿Por qué conviene separar en etapas?`,
        rubric: [
          { text: `a) [[f1-cohete|Ecuación del cohete]] con $m_0 = ${M0}$ kg y $m_f = ${M0 - f1}$ kg: $\\Delta v_1 = ${u}\\ln\\frac{${M0}}{${M0 - f1}} \\approx ${dn(dv1)}$ m/s.`, w: 3 },
          { text: `b) Soltada la estructura, la segunda etapa arranca con $${m2}$ kg y termina con $${d2 + P}$ kg: $\\Delta v_2 \\approx ${dn(dv2)}$ m/s, y la velocidad final es $\\approx ${dn(dv1 + dv2)}$ m/s.`, w: 3 },
          { text: `c) En una etapa, $m_f = ${d1 + d2 + P}$ kg: $\\Delta v = ${u}\\ln\\frac{${M0}}{${d1 + d2 + P}} \\approx ${dn(dvs)}$ m/s, menos que con etapas.`, w: 2 },
          { text: `Explicación: soltar la estructura vacía evita seguir acelerando masa inútil; el logaritmo premia achicar la masa final.`, w: 2 }
        ],
        solution: [`Sin fuerzas externas, cada encendido da $\\Delta v = u\\ln\\frac{m_{inicial}}{m_{final}}$, sin importar el caudal.`,
          `Primera etapa: $\\Delta v_1 \\approx ${dn(dv1)}$ m/s. Segunda: $\\Delta v_2 \\approx ${dn(dv2)}$ m/s. Total: $\\approx ${dn(dv1 + dv2)}$ m/s.`,
          `Una sola etapa: $\\approx ${dn(dvs)}$ m/s. La diferencia, $\\approx ${dn(dv1 + dv2 - dvs)}$ m/s, sale de no cargar los $${d1}$ kg de la primera estructura durante el segundo encendido.`],
        // otro camino: cada encendido se integra con RK4 (m dv/dt = u·μ)
        verify: { kind: "zero", tol: 1e-6, fn: () => [(burnDv(M0, M0 - f1, u) - dv1) / dv1, (burnDv(m2, d2 + P, u) - dv2) / dv2, (burnDv(M0, d1 + d2 + P, u) - dvs) / dvs] }
      };
    }
  };

  SELF["f1-ex-aro"] = {
    concepts: ["f1-estabilidad", "f1-rotante"],
    generate(r) {
      const Rr = r.int(1, 5) / 10, fac = r.pick([1.3, 1.5, 1.8, 2, 2.5]), w = Math.round(fac * Math.sqrt(g0 / Rr) * 10) / 10;
      const c0 = g0 / (w * w * Rr), th0 = Math.acos(c0), Om = w * Math.sin(th0), Tp = 2 * Math.PI / Om;
      return {
        prompt: `Una bolita está enhebrada, sin rozamiento, en un aro de radio $R = ${dn(Rr, 1)}$ m que gira con velocidad angular constante $\\omega = ${dn(w, 1)}$ rad/s alrededor de su diámetro vertical. Sea $\\theta$ el ángulo de la bolita medido desde el punto más bajo. ($g = 9{,}8$ m/s²)<br>a) Desde el sistema del aro, escribí la ecuación de movimiento para $\\theta$.<br>b) Encontrá las posiciones de equilibrio y decidí cuáles son estables.<br>c) Calculá el ángulo (en grados) del equilibrio estable con $\\theta > 0$ y el período de las oscilaciones chicas alrededor de él.`,
        rubric: [
          { text: `a) En el sistema del aro actúan el peso, la normal y la [[f1-rotante|fuerza centrífuga]] $m\\omega^2R\\sin\\theta$, horizontal. Proyectando sobre la tangente: $R\\ddot\\theta = \\sin\\theta\\,(\\omega^2R\\cos\\theta - g)$.`, w: 3 },
          { text: `b) Equilibrios: $\\theta = 0$, $\\theta = \\pi$ y $\\cos\\theta_0 = \\frac{g}{\\omega^2R} = ${dn(c0)}$ (existe porque $\\omega^2R > g$). Con $\\omega^2 > \\frac gR$, el fondo es inestable, el punto más alto también, y $\\pm\\theta_0$ son estables ([[f1-estabilidad|estabilidad]]).`, w: 3 },
          { text: `c) $\\theta_0 = \\arccos(${dn(c0)}) \\approx ${dn(th0 * 180 / Math.PI)}^\\circ$.`, w: 2 },
          { text: `Linealizando alrededor de $\\theta_0$: $\\Omega^2 = \\omega^2\\sin^2\\theta_0$, así que $\\Omega \\approx ${dn(Om)}$ rad/s y $T = \\frac{2\\pi}{\\Omega} \\approx ${dn(Tp)}$ s.`, w: 2 }
        ],
        solution: [`La fuerza efectiva tangencial es $m\\sin\\theta(\\omega^2R\\cos\\theta - g)$: se anula en $\\sin\\theta = 0$ o en $\\cos\\theta = \\frac{g}{\\omega^2R}$.`,
          `Derivando $F(\\theta) = \\sin\\theta(\\omega^2R\\cos\\theta - g)$ en $\\theta_0$: $F'(\\theta_0) = \\cos\\theta_0(\\omega^2R\\cos\\theta_0 - g) - \\omega^2R\\sin^2\\theta_0 = -\\omega^2R\\sin^2\\theta_0 < 0$: estable, con $\\Omega^2 = \\omega^2\\sin^2\\theta_0$.`,
          `Con los datos: $\\theta_0 \\approx ${dn(th0 * 180 / Math.PI)}^\\circ$, $T \\approx ${dn(Tp)}$ s.`],
        // otro camino: se suelta la bolita cerca de θ₀ y se mide el período simulado entre dos cruces hacia arriba
        verify: { kind: "zero", tol: 1e-4, fn: () => {
          const f = y => [y[1], Math.sin(y[0]) * (w * w * Rr * Math.cos(y[0]) - g0) / Rr], h = Tp / 4000;
          let y = [th0 + 1e-4, 0], t = 0, cross = [];
          for (let i = 0; i < 12000 && cross.length < 2; i++) {
            const k1 = f(y), k2 = f(y.map((v, j) => v + h / 2 * k1[j])), k3 = f(y.map((v, j) => v + h / 2 * k2[j])), k4 = f(y.map((v, j) => v + h * k3[j]));
            const yn = y.map((v, j) => v + h / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
            if (y[0] - th0 < 0 && yn[0] - th0 >= 0) { const s = (th0 - y[0]) / (yn[0] - y[0]); cross.push(t + s * h); }
            y = yn; t += h;
          }
          return [(cross[1] - cross[0] - Tp) / Tp];
        } }
      };
    }
  };

  E.registerExams("f101", {
    self: SELF,
    exams: [
      { id: "uba", kind: "parcial", title: "Examen Extra UBA", topics: "Temas de Física 1 de la UBA que no están en el programa: sistemas no inerciales, estabilidad y órbitas, relatividad especial y masa variable. Problemas largos, al estilo de un parcial de allá.", minutes: 180, pass: 60,
        items: [
          { title: "Cohete de dos etapas", parts: [{ self: "f1-ex-etapas", pts: 20 }] },
          { title: "Bolita en un aro que gira", parts: [{ self: "f1-ex-aro", pts: 20 }] },
          { any: [
            { title: "Sistemas no inerciales", parts: [{ tpl: "f1-coriolis-num", pts: 12 }, { tpl: "f1-plomada-num", pts: 8 }] },
            { title: "Sistemas no inerciales", parts: [{ tpl: "f1-silla-num", pts: 12 }, { tpl: "f1-ascensor-num", pts: 8 }] }
          ] },
          { any: [
            { title: "Relatividad especial", parts: [{ tpl: "f1-velrel-num", pts: 12 }, { tpl: "f1-simult-vf", pts: 8 }] },
            { title: "Relatividad especial", parts: [{ tpl: "f1-erel-num", pts: 12 }, { pick: ["f1-dilatacion-num", "f1-contraccion-num"], pts: 8 }] }
          ] },
          { any: [
            { title: "Órbitas y masa variable", parts: [{ tpl: "f1-apogeo-num", pts: 12 }, { tpl: "f1-cadena-num", pts: 8 }] },
            { title: "Despegue y cinta transportadora", parts: [{ tpl: "f1-cohete-grav-num", pts: 12 }, { tpl: "f1-cinta-num", pts: 8 }] }
          ] }
        ] }
    ]
  });
})();
