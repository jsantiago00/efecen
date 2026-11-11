/* ===== F104 · Escribir la expresión y paso a paso =====
   Se suman a lecciones que ya existen (E.addPractice). */
(function () {
  const E = window.Efecen, H = E.H, F = E.f3;
  const T = {};
  const dec = (x, d = 3) => F.nf(x, d);

  // efecto fotoeléctrico: la energía del fotón, la energía cinética máxima y la longitud de onda umbral
  T["f3-fotoel-multi"] = {
    type: "multi", concepts: ["f3-fotoelectrico"], difficulty: 2,
    generate(r) {
      const lam = 10 * r.int(18, 45), phi = r.int(18, 45) / 10, Eph = F.hc / lam, K = Eph - phi, lam0 = F.hc / phi;
      if (K < 0.2) return null;
      // la energía del fotón por la frecuencia, en el SI (para verificar)
      const hf = F.h * (F.c / (lam * 1e-9)) / F.e;
      return {
        prompt: `Luz de $${lam}$ nm incide sobre un metal cuya función trabajo es $\\phi = ${dec(phi)}$ eV. Usá $hc = 1240$ eV·nm.`,
        parts: [
          { q: "¿Qué energía tiene cada fotón, en eV?", type: "numeric", answer: Eph,
            verify: { kind: "value", fn: () => hf, tol: 1e-4 } },
          { q: "¿Cuál es la energía cinética máxima de los electrones que salen, en eV?", type: "numeric", answer: K,
            traps: [{ value: Eph + phi, msg: "La función trabajo se resta: es la energía que el electrón gasta para salir del metal." }],
            verify: { kind: "zero", fn: x => x + phi - hf, tol: 1e-3 } },
          { q: "¿Hasta qué longitud de onda (en nm) hay efecto fotoeléctrico en este metal?", type: "numeric", answer: lam0,
            // en el umbral, el fotón tiene justo la energía de la función trabajo
            verify: { kind: "zero", fn: x => F.h * F.c / (x * 1e-9) / F.e - phi, tol: 1e-3 } }
        ],
        solution: [
          `Energía del fotón: $E = \\dfrac{hc}{\\lambda} = \\dfrac{1240}{${lam}} = ${dec(Eph)}$ eV.`,
          `[[f3-fotoelectrico|Ecuación de Einstein]]: $K_{\\max} = E - \\phi = ${dec(Eph)} - ${dec(phi)} = ${dec(K)}$ eV.`,
          `En el umbral el fotón apenas alcanza: $\\dfrac{hc}{\\lambda_0} = \\phi$, así que $\\lambda_0 = \\dfrac{1240}{${dec(phi)}} = ${dec(lam0, 4)}$ nm. Con longitudes de onda más largas no sale ningún electrón, por más intensa que sea la luz.`
        ]
      };
    }
  };

  // RK4 para ψ'' = −k²ψ desde 0 hasta X, con ψ(0) = 0 y ψ'(0) = 1: devuelve ψ(X)
  const shoot = (k, X, N = 400) => {
    let p = 0, q = 1;
    const h = X / N, k2 = k * k;
    for (let i = 0; i < N; i++) {
      const a1 = q, b1 = -k2 * p, a2 = q + h / 2 * b1, b2 = -k2 * (p + h / 2 * a1), a3 = q + h / 2 * b2, b3 = -k2 * (p + h / 2 * a2), a4 = q + h * b3, b4 = -k2 * (p + h * a3);
      p += h / 6 * (a1 + 2 * a2 + 2 * a3 + a4); q += h / 6 * (b1 + 2 * b2 + 2 * b3 + b4);
    }
    return p;
  };

  // densidad de probabilidad de un estado del pozo infinito
  T["f3-pozo-dens-expr"] = {
    type: "expr", concepts: ["f3-pozo-infinito"], difficulty: 2, testN: 60,
    generate(r) {
      const L = r.pick([1, 2, 4, 5]), n = r.int(1, 3), dom = [[0.05 * L, 0.95 * L]];
      const arg = L === 1 ? `${n === 1 ? "" : n}\\pi x` : `\\dfrac{${n === 1 ? "" : n}\\pi x}{${L}}`, pre = H.frac(2, L);
      const argM = `${n}*pi*x/${L}`;
      // la verificación resuelve la ecuación de Schrödinger por tiro: busca el k que anula ψ(L) y normaliza numéricamente
      let cache = null;
      const g = x => {
        if (!cache) {
          const k = F.bisect(q => shoot(q, L), (n - 0.5) * Math.PI / L, (n + 0.5) * Math.PI / L, 60);
          cache = { k, norm: F.simpson(t => shoot(k, t, 200) ** 2, 0, L, 200) };
        }
        return shoot(cache.k, x) ** 2 / cache.norm;
      };
      return {
        prompt: `Un electrón está en el estado $n = ${n}$ de un pozo infinito que va de $x = 0$ a $x = ${L}$ nm. Escribí su densidad de probabilidad $|\\psi_{${n}}(x)|^2$ dentro del pozo (con $x$ en nm).`,
        lhs: `|\\psi_{${n}}(x)|^2 = `, answer: `(2/${L})*sin(${argM})^2`, answerTex: `${pre === "1" ? "" : pre}\\sin^{2}\\!\\left(${arg}\\right)`, vars: ["x"], domain: dom,
        traps: [
          { expr: `sqrt(2/${L})*sin(${argM})`, msg: "Esa es la función de onda $\\psi_n$. La densidad de probabilidad es su módulo al cuadrado." },
          { expr: `(1/${L})*sin(${argM})^2`, msg: "Revisá la normalización: el promedio de $\\sin^2$ es $\\frac12$, así que hace falta el factor $\\frac{2}{L}$ para que la integral dé $1$." }
        ],
        solution: [
          `En el [[f3-pozo-infinito|pozo infinito]] entran $n$ medias longitudes de onda: $\\psi_n(x) = \\sqrt{\\dfrac{2}{L}}\\,\\sin\\!\\left(\\dfrac{n\\pi x}{L}\\right)$.`,
          `La densidad es el módulo al cuadrado. Con $L = ${L}$ nm y $n = ${n}$: $|\\psi_{${n}}(x)|^2 = ${pre === "1" ? "" : pre}\\sin^{2}\\!\\left(${arg}\\right)$, en nm$^{-1}$.`,
          `Tiene ${n === 1 ? "un máximo en el centro" : `$${n}$ máximos y $${n - 1}$ ${n === 2 ? "nodo" : "nodos"} dentro del pozo`}, y su integral entre $0$ y $${L}$ da $1$.`
        ],
        verify: { kind: "fnEq", g, dom, tol: 1e-4 }
      };
    }
  };

  E.addPractice("f104", { templates: T, lessons: { "f3-fotoelectrico": ["f3-fotoel-multi"], "f3-pozo-infinito": ["f3-pozo-dens-expr"] } });
})();
