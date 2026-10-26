/* ===== F102B · Paso a paso =====
   Se suman a lecciones que ya existen (E.addPractice). */
(function () {
  const E = window.Efecen, H = E.H;
  const T = {};
  const cA = 4186, cH = 2100, Lf = 3.34e5; // J/(kg·K) y J/kg, los mismos de la unidad de calorimetría

  T["f2b-calorim-multi"] = {
    type: "multi", concepts: ["f2b-calor"], difficulty: 3,
    generate(r) {
      const gh = r.pick([50, 100, 150, 200]), ga = r.pick([400, 500, 800, 1000]), mh = gh / 1000, ma = ga / 1000;
      const Th = r.pick([-5, -10, -20]), Ta = r.pick([40, 50, 60, 70, 80]);
      const Q1 = mh * cH * -Th, Q2 = mh * Lf;
      // si el agua no alcanza para derretir todo el hielo, el equilibrio queda en 0 °C: se descarta
      if (Q1 + Q2 >= ma * cA * Ta) return null;
      const Tf = (ma * cA * Ta - Q1 - Q2) / ((ma + mh) * cA);
      // verificación: bisección sobre el calor total intercambiado, sumando cada tramo por separado
      const net = T => mh * cH * (0 - Th) + mh * Lf + mh * cA * (T - 0) + ma * cA * (T - Ta);
      const bis = () => { let lo = 0, hi = Ta; for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (net(m) > 0) hi = m; else lo = m; } return (lo + hi) / 2; };
      return {
        prompt: `En un recipiente aislado con $${ga}$ g de agua a $${Ta}$ °C se echan $${gh}$ g de hielo a $${Th}$ °C. Tomá $c_{agua} = 4186$ J/(kg·K), $c_{hielo} = 2100$ J/(kg·K) y $L_f = 3{,}34\\times10^{5}$ J/kg.`,
        parts: [
          { q: "¿Cuánto calor necesita el hielo para llegar a 0 °C (en kJ)?", type: "numeric", answer: Q1 / 1000,
            traps: [{ value: mh * cA * -Th / 1000, msg: "Mientras es hielo, se usa el calor específico del hielo ($2100$ J/(kg·K)), no el del agua." }],
            verify: { kind: "integral", f: () => mh * cH / 1000, a: Th, b: 0 } },
          { q: "¿Y para derretirse, ya a 0 °C (en kJ)?", type: "numeric", answer: Q2 / 1000, verify: { kind: "value", fn: () => mh * Lf / 1000 } },
          { q: "¿A qué temperatura queda la mezcla (en °C)?", type: "numeric", answer: Tf,
            traps: [{ value: (ma * cA * Ta - Q1) / ((ma + mh) * cA), msg: "Te faltó el calor latente: para derretirse, el hielo absorbe $mL_f$ sin cambiar de temperatura." }],
            verify: { kind: "value", fn: bis, tol: 1e-6 } }
        ],
        solution: [
          `[[f2b-calor|Calorimetría]]: el agua cede calor y el hielo lo absorbe en tres tramos. Primero se calienta hasta 0 °C: $Q_1 = m_h c_h\\,\\Delta T = ${String(mh).replace(".", "{,}")}\\cdot 2100\\cdot ${-Th} = ${H.num(Q1)}$ J.`,
          `Después se funde a 0 °C: $Q_2 = m_h L_f = ${H.num(Q2)}$ J.`,
          `El agua alcanza para fundirlo todo, porque al bajar hasta 0 °C cedería $m_a c_a T_a = ${H.num(ma * cA * Ta)}$ J. Entonces el equilibrio está arriba de 0 °C.`,
          `Balance: $Q_1 + Q_2 + m_h c_a T_f + m_a c_a (T_f - ${Ta}) = 0$, así que $T_f = \\dfrac{m_a c_a T_a - Q_1 - Q_2}{(m_a + m_h)\\,c_a} \\approx ${H.num(Tf, 2).replace(".", "{,}")}$ °C.`
        ]
      };
    }
  };

  E.addPractice("f102b", { templates: T, lessons: { "f2b-calorimetria": ["f2b-calorim-multi"] } });
})();
