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
    exams: [
      { id: "p1", kind: "parcial", title: "1.er parcial promocional", topics: "Cinemática, dinámica, energía, choques y fluidos", minutes: 150, pass: 60,
        items: [
          { title: "Fluidos", parts: [{ tpl: "f1-bernoulli-num", pts: 12 }, { tpl: "f1-continuidad-num", pts: 8 }, { tpl: "f1-presion-num", pts: 10 }] },
          { title: "Choque y trabajo de la fricción", parts: [{ self: "f1-ex-tejo", pts: 35 }] },
          { title: "Dinámica con rozamiento y movimiento relativo", parts: [{ self: "f1-ex-bloques", pts: 35 }] }
        ] },
      { id: "p2", kind: "parcial", title: "2.º parcial promocional", topics: "Rotación, momento angular, equilibrio y gravitación", minutes: 150, pass: 60,
        items: [
          { title: "Momento angular", parts: [{ self: "f1-ex-taburete", pts: 35 }] },
          { title: "Equilibrio del cuerpo rígido", parts: [{ tpl: "f1-escalera-num", pts: 15 }, { tpl: "f1-viga-num", pts: 15 }] },
          { title: "Gravitación", parts: [{ self: "f1-ex-trabajo-grav", pts: 20 }, { tpl: "f1-orbita-num", pts: 15 }] }
        ] },
      { id: "final", kind: "final", title: "Final (libre)", topics: "Toda la materia: equilibrio, energía, gravitación, oscilaciones y fluidos. Si sos regular, el final incluye los problemas 3, 4 y 5.", minutes: 180, pass: 60,
        items: [
          { title: "Equilibrio", parts: [{ pick: ["f1-escalera-num", "f1-viga-num"], pts: 20 }] },
          { title: "Energía, resorte y rozamiento", parts: [{ self: "f1-ex-resorte-plano", pts: 20 }] },
          { title: "Gravitación y órbitas", parts: [{ tpl: "f1-grav-num", pts: 10 }, { tpl: "f1-orbita-num", pts: 10 }] },
          { title: "Oscilaciones", parts: [{ self: "f1-ex-mas-bloques", pts: 20 }] },
          { title: "Flotación", parts: [{ self: "f1-ex-globo", pts: 20 }] }
        ] }
    ]
  });
})();
