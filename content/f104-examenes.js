/* ===== F104 · Evaluaciones: parciales y final simulados =====
   Estructura de los exámenes reales (ver docs/parciales/f104.md): preguntas conceptuales (de 5 a 15 puntos) y problemas
   (de 10 a 30 puntos). 1.er parcial: mecánica cuántica en una dimensión; 2.º parcial: hidrógeno, relatividad y
   oscilador; final: de todo. Enunciados propios y datos sorteados. */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw, F = E.f3, nf = F.nf;
  const SELF = {};
  const dn = (x, d = 4) => String(H.num(x, d)).replace(".", "{,}");
  const RAD = {
    "1,0": r => 2 * Math.exp(-r), "2,0": r => (1 - r / 2) * Math.exp(-r / 2) / Math.SQRT2, "2,1": r => r * Math.exp(-r / 2) / Math.sqrt(24),
    "3,0": r => 2 / Math.sqrt(27) * (1 - 2 * r / 3 + 2 * r * r / 27) * Math.exp(-r / 3), "3,1": r => 8 / (27 * Math.sqrt(6)) * r * (1 - r / 6) * Math.exp(-r / 3), "3,2": r => 4 / (81 * Math.sqrt(30)) * r * r * Math.exp(-r / 3)
  };
  const LL = ["s", "p", "d"];
  const phi = (n, L) => x => Math.sqrt(2 / L) * Math.sin(n * Math.PI * x / L);

  // ---------- 1.er parcial: mecánica cuántica en una dimensión ----------
  SELF["f3-ex-paquete"] = {
    concepts: ["f3-incerteza"],
    generate(r) {
      const k0 = r.int(2, 20), dk = r.pick([0.5, 1, 2, 4]), p0 = dk / (2 * Math.PI), x1 = 2 * Math.PI / dk;
      return {
        prompt: `Un electrón está descripto por el paquete $\\psi(x) = \\frac{1}{\\sqrt{2\\pi}}\\int_{-\\infty}^{\\infty}\\phi(k)e^{ikx}dk$, con $\\phi(k) = \\frac{1}{\\sqrt{\\Delta k}}$ si $|k - k_0| < \\frac{\\Delta k}{2}$ y $\\phi(k) = 0$ si no, donde $k_0 = ${k0}$ nm⁻¹ y $\\Delta k = ${dn(dk, 2)}$ nm⁻¹.<br>a) Calculá $\\psi(x)$.<br>b) ¿Está normalizada? Calculá $|\\psi(0)|^2$.<br>c) Calculá $\\langle p\\rangle$ usando las simetrías del problema.<br>d) Estimá el ancho del paquete con la distancia entre los dos primeros ceros a cada lado de $x = 0$, y comparalo con $\\Delta k$.`,
        rubric: [
          { text: `a) $\\psi(x) = \\frac{1}{\\sqrt{2\\pi\\Delta k}}\\int_{k_0 - \\Delta k/2}^{k_0 + \\Delta k/2}e^{ikx}dk = \\frac{e^{ik_0x}}{\\sqrt{2\\pi\\Delta k}}\\cdot\\frac{2\\sin(\\Delta k\\,x/2)}{x}$.`, w: 3 },
          { text: `b) Por Parseval, $\\int|\\psi|^2dx = \\int|\\phi|^2dk = \\frac{1}{\\Delta k}\\Delta k = 1$: está normalizada. $|\\psi(0)|^2 = \\frac{\\Delta k}{2\\pi} \\approx ${dn(p0)}$ nm⁻¹.`, w: 3 },
          { text: `c) $|\\phi(k)|^2$ es simétrica alrededor de $k_0$, así que $\\langle p\\rangle = \\hbar\\langle k\\rangle = \\hbar k_0 = ${k0}\\hbar$ nm⁻¹ ([[f3-incerteza|paquete de ondas]]).`, w: 2 },
          { text: `d) Los primeros ceros están en $x = \\pm\\frac{2\\pi}{\\Delta k} \\approx \\pm${dn(x1)}$ nm: el ancho es $\\sim\\frac{4\\pi}{\\Delta k}$, inversamente proporcional a $\\Delta k$, como pide la incerteza.`, w: 2 }
        ],
        solution: [`La integral de una exponencial da $\\frac{e^{ikx}}{ix}$ evaluada en los extremos: $e^{ik_0x}\\frac{e^{i\\Delta kx/2} - e^{-i\\Delta kx/2}}{ix} = e^{ik_0x}\\frac{2\\sin(\\Delta kx/2)}{x}$.`,
          `Cuanto más angosto es $\\phi(k)$ (más definido el momento), más ancho es $\\psi(x)$ (menos definida la posición).`],
        // otro camino: la transformada se calcula numéricamente en varios x, y la norma con Simpson sobre una ventana amplia
        verify: { kind: "zero", tol: 3e-3, fn: () => {
          const res = [];
          for (const x of [0.37, 1.9, 5.3]) {
            const re = F.simpson(k => Math.cos(k * x), k0 - dk / 2, k0 + dk / 2, 400) / Math.sqrt(2 * Math.PI * dk), im = F.simpson(k => Math.sin(k * x), k0 - dk / 2, k0 + dk / 2, 400) / Math.sqrt(2 * Math.PI * dk);
            res.push(Math.hypot(re, im) - 2 * Math.abs(Math.sin(dk * x / 2) / x) / Math.sqrt(2 * Math.PI * dk));
          }
          const X = 4000 / dk, sinc2 = x => (Math.abs(x) < 1e-9 ? dk * dk / 4 : Math.sin(dk * x / 2) ** 2 / (x * x)) * 4 / (2 * Math.PI * dk);
          res.push(F.simpson(sinc2, -X, X, 400000) - 1);
          return res;
        } }
      };
    }
  };
  SELF["f3-ex-kets"] = {
    concepts: ["f3-superposicion"],
    generate(r) {
      const a = r.pick([1, 2, 3]), b = r.pick([1, 2]), c = r.pick([1, 2]), N2 = a * a + b * b + c * c, Eav = (a * a + 4 * b * b + 9 * c * c) / N2;
      return {
        prompt: `Un electrón en un pozo infinito está en el estado $|\\psi\\rangle = ${a === 1 ? "" : a}|1\\rangle + ${b === 1 ? "" : b}i|2\\rangle - ${c === 1 ? "" : c}|3\\rangle$, donde $|n\\rangle$ son los autoestados normalizados, con $\\hat H|n\\rangle = E_n|n\\rangle$ y $E_n = n^2E_1$.<br>a) Calculá la norma de $|\\psi\\rangle$ y normalizalo.<br>b) Calculá $\\langle 2|\\psi\\rangle$ y $\\langle 4|\\psi\\rangle$ para el estado normalizado.<br>c) Escribí $|\\Psi(t)\\rangle$ si $|\\psi\\rangle$ es el estado en $t = 0$.<br>d) Calculá $\\langle\\hat H\\rangle$ en unidades de $E_1$. ¿Cambia con el tiempo?`,
        rubric: [
          { text: `a) $\\langle\\psi|\\psi\\rangle = ${a * a} + ${b * b} + ${c * c} = ${N2}$ ([[f3-superposicion|kets]]); normalizado: $\\frac{1}{\\sqrt{${N2}}}|\\psi\\rangle$.`, w: 3 },
          { text: `b) $\\langle 2|\\psi\\rangle = \\frac{${b === 1 ? "" : b}i}{\\sqrt{${N2}}}$ y $\\langle 4|\\psi\\rangle = 0$ (base ortonormal).`, w: 2 },
          { text: `c) $|\\Psi(t)\\rangle = \\frac{1}{\\sqrt{${N2}}}\\left(${a === 1 ? "" : a}e^{-iE_1t/\\hbar}|1\\rangle + ${b === 1 ? "" : b}ie^{-i4E_1t/\\hbar}|2\\rangle - ${c === 1 ? "" : c}e^{-i9E_1t/\\hbar}|3\\rangle\\right)$.`, w: 2 },
          { text: `d) $\\langle\\hat H\\rangle = \\frac{${a * a}\\cdot1 + ${b * b}\\cdot4 + ${c * c}\\cdot9}{${N2}}E_1 \\approx ${dn(Eav)}E_1$, constante: los módulos de los coeficientes no cambian.`, w: 3 }
        ],
        solution: [`Las fases $e^{-iE_nt/\\hbar}$ no cambian $|c_n|^2$, así que las probabilidades de cada energía y $\\langle H\\rangle$ se conservan.`],
        // otro camino: el estado se arma como función en [0, 1]; norma, proyecciones y ⟨H⟩ (derivada segunda numérica) con Simpson
        verify: { kind: "zero", tol: 1e-6, fn: () => {
          const re = x => a * phi(1, 1)(x) - c * phi(3, 1)(x), im = x => b * phi(2, 1)(x), h = 1e-4, d2 = f => x => (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
          const nrm = F.simpson(x => re(x) ** 2 + im(x) ** 2, 0, 1, 4000), p4 = F.simpson(x => re(x) * phi(4, 1)(x), 0, 1, 4000);
          const Hn = -F.simpson(x => re(x) * d2(re)(x) + im(x) * d2(im)(x), 0, 1, 4000) / nrm / Math.PI ** 2;
          return [nrm - N2, p4, Hn / Eav - 1];
        } }
      };
    }
  };

  // ---------- 2.º parcial: hidrógeno, relatividad y oscilador ----------
  SELF["f3-ex-velocidades"] = {
    concepts: ["f3-intervalo"],
    generate(r) {
      const u1 = r.pick([0.3, 0.5, 0.6, 0.7]), u2 = r.pick([0.8, 0.9, 0.95]), same = (u2 - u1) / (1 - u1 * u2), opp = (u1 + u2) / (1 + u1 * u2);
      return {
        prompt: `Desde la Tierra se ven dos naves que viajan sobre la misma recta a $${dn(u1, 2)}c$ y $${dn(u2, 2)}c$.<br>a) ¿Con qué velocidad ve la nave lenta a la rápida si van en el mismo sentido?<br>b) ¿Y si van en sentidos opuestos?<br>c) Mostrá que el resultado de b) es menor que $c$ para cualquier par de velocidades menores que $c$.`,
        rubric: [
          { text: `a) Suma relativista ([[f1-lorentz|Lorentz]]): $u' = \\frac{u_2 - u_1}{1 - u_1u_2/c^2} \\approx ${dn(same)}c$ (Galileo daría $${dn(u2 - u1, 2)}c$).`, w: 4 },
          { text: `b) $u' = \\frac{u_1 + u_2}{1 + u_1u_2/c^2} \\approx ${dn(opp)}c$, menor que $c$ aunque la suma clásica sea $${dn(u1 + u2, 2)}c$.`, w: 4 },
          { text: `c) $1 - \\frac{u'}{c} = \\frac{(1 - \\beta_1)(1 - \\beta_2)}{1 + \\beta_1\\beta_2} > 0$ si $\\beta_1, \\beta_2 < 1$.`, w: 2 }
        ],
        solution: [`Con rapideces, las velocidades se suman: $\\phi' = \\phi_1 + \\phi_2$, y $\\tanh$ de cualquier número tiene módulo menor que 1 ([[f3-intervalo|cono de luz]]).`],
        // otro camino: suma de rapideces (arctanh) y tangente hiperbólica
        verify: { kind: "zero", tol: 1e-12, fn: () => [Math.tanh(Math.atanh(u2) - Math.atanh(u1)) - same, Math.tanh(Math.atanh(u2) + Math.atanh(u1)) - opp] }
      };
    }
  };
  SELF["f3-ex-oscilador"] = {
    concepts: ["f3-oscilador"],
    generate(r) {
      const x0 = r.pick([0.05, 0.1, 0.2, 0.5, 1]), C = Math.pow(Math.PI * x0 * x0, -0.25), dx = x0 / Math.SQRT2;
      return {
        prompt: `Una partícula está en el estado fundamental de un oscilador armónico, $\\varphi_0(x) = C_0e^{-x^2/2x_0^2}$, con $x_0 = \\sqrt{\\frac{\\hbar}{m\\omega}} = ${dn(x0, 2)}$ nm.<br>a) Encontrá $C_0$ (real y positiva).<br>b) Calculá $\\Delta x$ y $\\Delta p$.<br>c) Verificá la relación de incerteza de Heisenberg.`,
        rubric: [
          { text: `a) $\\int C_0^2e^{-x^2/x_0^2}dx = C_0^2\\sqrt\\pi x_0 = 1$: $C_0 = (\\pi x_0^2)^{-1/4} \\approx ${dn(C)}$ nm$^{-1/2}$.`, w: 3 },
          { text: `b) Por simetría $\\langle x\\rangle = \\langle p\\rangle = 0$. $\\langle x^2\\rangle = \\frac{x_0^2}{2}$, así que $\\Delta x = \\frac{x_0}{\\sqrt2} \\approx ${dn(dx)}$ nm; y $\\langle p^2\\rangle = \\frac{\\hbar^2}{2x_0^2}$, así que $\\Delta p = \\frac{\\hbar}{\\sqrt2x_0}$ ([[f3-oscilador|oscilador cuántico]]).`, w: 4 },
          { text: `c) $\\Delta x\\,\\Delta p = \\frac{x_0}{\\sqrt2}\\cdot\\frac{\\hbar}{\\sqrt2x_0} = \\frac\\hbar2$: es el mínimo que permite [[f3-incerteza|Heisenberg]].`, w: 3 }
        ],
        solution: [`Las integrales salen de $\\int e^{-u^2}du = \\sqrt\\pi$ y $\\int u^2e^{-u^2}du = \\frac{\\sqrt\\pi}{2}$, con $u = \\frac{x}{x_0}$.`],
        // otro camino: integrales con Simpson y la derivada por diferencias finitas
        verify: { kind: "zero", tol: 1e-6, fn: () => {
          const f = x => C * Math.exp(-x * x / (2 * x0 * x0)), L = 12 * x0, h = x0 * 1e-4;
          const n0 = F.simpson(x => f(x) ** 2, -L, L, 4000), x2 = F.simpson(x => x * x * f(x) ** 2, -L, L, 4000), d2 = F.simpson(x => ((f(x + h) - f(x - h)) / (2 * h)) ** 2, -L, L, 4000);
          return [n0 - 1, Math.sqrt(x2) / dx - 1, Math.sqrt(x2 * d2) - 0.5];
        } }
      };
    }
  };
  SELF["f3-ex-orbital"] = {
    concepts: ["f3-hidrogeno"],
    generate(r) {
      const st = r.pick(["1s", "2p"]), is1 = st === "1s";
      const Cn = is1 ? "\\frac{1}{\\sqrt{\\pi a_0^3}}" : "\\frac{1}{\\sqrt{32\\pi a_0^5}}", rav = is1 ? 1.5 : 5, rmp = is1 ? 1 : 4;
      return {
        prompt: `La función de onda ${st}${is1 ? "" : "$_z$"} del hidrógeno es $\\varphi(r, \\theta) = C\\,${is1 ? "e^{-r/a_0}" : "r\\cos\\theta\\,e^{-r/2a_0}"}$.<br>a) Verificá que $C = ${Cn}$ la normaliza.<br>b) Calculá $\\langle r\\rangle$ en unidades de $a_0$.<br>c) Encontrá el máximo de la densidad radial de probabilidad y comparalo con b).`,
        rubric: [
          { text: `a) $\\int|\\varphi|^2dV = C^2\\int_0^\\infty ${is1 ? "r^2e^{-2r/a_0}dr\\cdot4\\pi" : "r^4e^{-r/a_0}dr\\cdot\\frac{4\\pi}{3}"} = C^2\\cdot${is1 ? "\\frac{a_0^3}{4}\\cdot4\\pi" : "24a_0^5\\cdot\\frac{4\\pi}{3}"} = 1$, con $\\int_0^\\infty u^ne^{-u}du = n!$ ([[f3-hidrogeno|funciones del hidrógeno]]).`, w: 4 },
          { text: `b) $\\langle r\\rangle = ${rav === 1.5 ? "\\frac32" : "5"}\\,a_0$ (con la misma integral, una potencia más de $r$).`, w: 3 },
          { text: `c) $P(r) \\propto ${is1 ? "r^2e^{-2r/a_0}" : "r^4e^{-r/a_0}"}$ es máxima en $r = ${rmp}\\,a_0$: no coincide con $\\langle r\\rangle$, porque la distribución tiene una cola larga hacia afuera.`, w: 3 }
        ],
        solution: [`Para estados con $l = n - 1$ el radio más probable es $n^2a_0$, el de Bohr, pero el valor medio es mayor.`],
        // otro camino: integrales en 3D con Simpson (radial por la parte angular calculada aparte) y el máximo por sección áurea
        verify: { kind: "zero", tol: 1e-6, fn: () => {
          const ang = is1 ? 4 * Math.PI : 2 * Math.PI * F.simpson(t => Math.cos(t) ** 2 * Math.sin(t), 0, Math.PI, 400), C2 = is1 ? 1 / Math.PI : 1 / (32 * Math.PI), rad = rr => (is1 ? Math.exp(-2 * rr) : rr * rr * Math.exp(-rr));
          const nrm = C2 * ang * F.simpson(rr => rad(rr) * rr * rr, 0, 80, 8000), rm = C2 * ang * F.simpson(rr => rad(rr) * rr ** 3, 0, 80, 8000), mp = F.golden(rr => -rad(rr) * rr * rr, 0.01, 30);
          return [nrm - 1, rm - rav, mp - rmp];
        } }
      };
    }
  };

  // ---------- final ----------
  SELF["f3-ex-pozo-x"] = {
    concepts: ["f3-superposicion"],
    generate(r) {
      const L = r.pick([0.5, 1, 2]), [ca, cb] = r.pick([[1, 1], [1, 2], [2, 1], [1, 3]]), N2 = ca * ca + cb * cb, x12 = -16 * L / (9 * Math.PI * Math.PI);
      const xav = L / 2 + 2 * ca * cb / N2 * x12, E1 = F.k2e * (Math.PI / L) ** 2, Eav = (ca * ca + 4 * cb * cb) / N2 * E1;
      return {
        prompt: `Un electrón está en un pozo infinito entre $x = 0$ y $x = L = ${dn(L, 1)}$ nm, en el estado $\\psi = \\frac{1}{\\sqrt{${N2}}}\\left(${ca === 1 ? "" : ca}\\varphi_1 + ${cb === 1 ? "" : cb}\\varphi_2\\right)$, con $\\varphi_n = \\sqrt{\\frac2L}\\sin\\frac{n\\pi x}{L}$.<br>a) Calculá $\\langle x\\rangle$.<br>b) Calculá $\\langle\\hat H\\rangle$ en eV.<br>c) ¿Con qué período oscila $\\langle x\\rangle$? ($\\frac{\\hbar^2}{2m_e} = 0{,}0381$ eV·nm², $h = 4{,}136\\times10^{-15}$ eV·s)`,
        rubric: [
          { text: `a) $\\langle x\\rangle = \\frac{${ca * ca}\\langle1|x|1\\rangle + ${cb * cb}\\langle2|x|2\\rangle + 2\\cdot${ca * cb}\\langle1|x|2\\rangle}{${N2}}$, con $\\langle n|x|n\\rangle = \\frac L2$ y $\\langle1|x|2\\rangle = -\\frac{16L}{9\\pi^2}$: $\\langle x\\rangle \\approx ${dn(xav)}$ nm.`, w: 4 },
          { text: `b) $E_1 = 0{,}0381\\left(\\frac{\\pi}{${dn(L, 1)}}\\right)^2 \\approx ${dn(E1)}$ eV, $E_2 = 4E_1$: $\\langle H\\rangle = \\frac{${ca * ca} + 4\\cdot${cb * cb}}{${N2}}E_1 \\approx ${dn(Eav)}$ eV ([[f3-superposicion|superposición]]).`, w: 3 },
          { text: `c) El término cruzado oscila con $\\omega = \\frac{E_2 - E_1}{\\hbar}$: $T = \\frac{h}{3E_1} \\approx ${dn(4.1357e-15 / (3 * E1) * 1e15)}$ fs.`, w: 3 }
        ],
        solution: [`El término cruzado $\\langle1|x|2\\rangle$ sale de $\\frac2L\\int_0^Lx\\sin\\frac{\\pi x}{L}\\sin\\frac{2\\pi x}{L}dx$, usando $\\sin a\\sin b = \\frac12[\\cos(a - b) - \\cos(a + b)]$ e integrando por partes.`],
        // otro camino: Simpson para ⟨x⟩ y la derivada segunda numérica para ⟨H⟩
        verify: { kind: "zero", tol: 1e-6, fn: () => {
          const ps = x => (ca * phi(1, L)(x) + cb * phi(2, L)(x)) / Math.sqrt(N2), h = L * 1e-4;
          return [(F.simpson(x => x * ps(x) ** 2, 0, L, 4000) - xav) / L, -F.k2e * F.simpson(x => ps(x) * (ps(x + h) - 2 * ps(x) + ps(x - h)) / (h * h), 0, L, 4000) / Eav - 1];
        } }
      };
    }
  };
  SELF["f3-ex-nave"] = {
    concepts: ["f3-intervalo"],
    generate(r) {
      const b = r.pick([0.6, 0.8, 0.9, 0.95, 0.99]), D = r.pick([3, 5, 10, 20]), g = 1 / Math.sqrt(1 - b * b), c = 2.99792458e5;
      const tE = D / (b * c) * 1e6, t0 = tE / g, Dn = D / g;
      return {
        prompt: `En una nave que viaja a $${dn(b, 2)}c$ respecto de la Tierra, un núcleo inestable que va con la nave vive un tiempo $\\tau_0$ (medido en la nave). Mientras vive, la nave recorre $${D}$ km según la Tierra. ($c = 3\\times10^5$ km/s)<br>a) ¿Cuánto vive el núcleo según la Tierra?<br>b) ¿Cuánto vale $\\tau_0$?<br>c) ¿Qué distancia recorre la Tierra según el núcleo?`,
        rubric: [
          { text: `a) $\\Delta t = \\frac{D}{v} = \\frac{${D}}{${dn(b, 2)}\\cdot3\\times10^5}$ s $\\approx ${dn(tE)}$ μs.`, w: 3 },
          { text: `b) $\\gamma \\approx ${dn(g)}$ y el tiempo propio es $\\tau_0 = \\frac{\\Delta t}{\\gamma} \\approx ${dn(t0)}$ μs ([[f1-relatividad|dilatación del tiempo]]).`, w: 4 },
          { text: `c) Para el núcleo, la Tierra se mueve a $${dn(b, 2)}c$ durante $\\tau_0$: $v\\tau_0 = \\frac{D}{\\gamma} \\approx ${dn(Dn)}$ km, la distancia contraída.`, w: 3 }
        ],
        solution: [`Los dos eventos (nace y decae) ocurren en el mismo lugar de la nave: el tiempo de la nave es el propio ([[f3-intervalo|intervalo]]).`],
        // otro camino: boost con la rapidez de los eventos (0, 0) y (Δt, D) al sistema de la nave
        verify: { kind: "zero", tol: 1e-9, fn: () => { const ct = c * tE * 1e-6, [t2, x2] = F.boost(Math.atanh(b), ct, D); return [x2 / D, t2 / c * 1e6 / t0 - 1, b * t2 / Dn - 1]; } }
      };
    }
  };
  SELF["f3-ex-virial"] = {
    concepts: ["f3-hidrogeno"],
    generate(r) {
      const [n, l] = r.pick([[2, 0], [2, 1], [3, 0], [3, 1], [3, 2]]), En = -F.Ry / (n * n), V = 2 * En;
      return {
        prompt: `El electrón de un átomo de hidrógeno está en el estado ${n}${LL[l]}, con energía $E_${n} = -\\frac{13{,}6}{${n * n}}$ eV y función radial $R_{${n}${l}}(r)$ conocida.<br>a) Planteá $\\langle V\\rangle$ con $V = -\\frac{e^2}{4\\pi\\varepsilon_0r}$ y calculalo, sabiendo que $\\left\\langle\\frac1r\\right\\rangle = \\frac{1}{n^2a_0}$.<br>b) Sin hacer más integrales, calculá la energía cinética media.<br>c) ¿Depende el resultado de $l$? Explicá.`,
        rubric: [
          { text: `a) $\\langle V\\rangle = -\\frac{e^2}{4\\pi\\varepsilon_0}\\int_0^\\infty\\frac1r|R_{${n}${l}}|^2r^2dr = -\\frac{e^2}{4\\pi\\varepsilon_0a_0}\\cdot\\frac{1}{${n * n}} = -\\frac{27{,}2}{${n * n}}$ eV $\\approx ${dn(V)}$ eV.`, w: 4 },
          { text: `b) $\\langle T\\rangle = E_${n} - \\langle V\\rangle = ${dn(En)} - (${dn(V)}) \\approx ${dn(-En)}$ eV, o sea $-E_n$ ([[f3-hidrogeno|teorema del virial]]).`, w: 4 },
          { text: `c) No: $\\left\\langle\\frac1r\\right\\rangle$ y $E_n$ solo dependen de $n$, aunque $\\langle r\\rangle$ sí depende de $l$.`, w: 2 }
        ],
        solution: [`El teorema del virial para un potencial $\\propto\\frac1r$ dice $2\\langle T\\rangle = -\\langle V\\rangle$; con $E = T + V$ sale todo.`],
        // otro camino: ⟨1/r⟩ con la función radial explícita (Simpson) y ⟨T⟩ con la derivada numérica de R
        verify: { kind: "zero", tol: 1e-5, fn: () => {
          const f = RAD[`${n},${l}`], h = 1e-5, d = x => (f(x + h) - f(x - h)) / (2 * h), Eh = 2 * F.Ry;
          const inv = F.simpson(x => f(x) ** 2 * x, 0, 80, 8000), T = Eh / 2 * F.simpson(x => (d(x) ** 2 + (x > 0 ? l * (l + 1) * f(x) ** 2 / (x * x) : 0)) * x * x, 1e-6, 80, 8000);
          return [-Eh * inv / V - 1, T / -En - 1];
        } }
      };
    }
  };

  E.registerExams("f104", {
    self: SELF,
    exams: [
      { id: "p1", kind: "parcial", title: "1.er parcial", topics: "Mecánica cuántica en una dimensión: ondas de materia, incerteza, paquetes, pozo infinito y superposiciones (con fotones en las preguntas).", minutes: 150, pass: 60,
        items: [
          { title: "Pregunta conceptual 1", parts: [{ pick: ["f3-incerteza-num", "f3-ondas-vf", "f3-foton-vf"], pts: 15 }] },
          { title: "Pregunta conceptual 2", parts: [{ pick: ["f3-pozo-vf", "f3-pozo-prob-num", "f3-tunel-vf"], pts: 15 }] },
          { title: "Problema 1", parts: [{ pick: ["f3-debroglie-num", "f3-paquete-num", "f3-compton-num"], pts: 10 }] },
          { title: "Problema 2: paquete de ondas", parts: [{ self: "f3-ex-paquete", pts: 30 }] },
          { title: "Problema 3: superposición en el pozo", parts: [{ self: "f3-ex-kets", pts: 30 }] }
        ] },
      { id: "p2", kind: "parcial", title: "2.º parcial", topics: "Átomo de hidrógeno, relatividad especial y oscilador armónico cuántico.", minutes: 150, pass: 60,
        items: [
          { title: "Pregunta conceptual 1", parts: [{ pick: ["f3-cuanticos-mc", "f3-serie-mc"], pts: 5 }] },
          { title: "Pregunta conceptual 2", parts: [{ tpl: "f3-degeneracion-num", pts: 5 }] },
          { title: "Pregunta conceptual 3", parts: [{ pick: ["f3-momento-num", "f3-bohr-vf"], pts: 5 }] },
          { title: "Pregunta conceptual 4", parts: [{ tpl: "f3-causal-vf", pts: 5 }] },
          { title: "Pregunta conceptual 5", parts: [{ pick: ["f3-intervalo-num", "f3-doppler-num"], pts: 10 }] },
          { any: [
            { title: "Problema 1: suma de velocidades", parts: [{ self: "f3-ex-velocidades", pts: 20 }] },
            { title: "Problema 1: núcleo en una nave", parts: [{ self: "f3-ex-nave", pts: 20 }] }
          ] },
          { title: "Problema 2: oscilador armónico", parts: [{ self: "f3-ex-oscilador", pts: 20 }] },
          { title: "Problema 3: orbital del hidrógeno", parts: [{ self: "f3-ex-orbital", pts: 30 }] }
        ] },
      { id: "final", kind: "final", title: "Final", topics: "Toda la materia: preguntas conceptuales de fotones, cuántica, hidrógeno y relatividad, y tres problemas (pozo, relatividad, hidrógeno).", minutes: 180, pass: 60,
        items: [
          { title: "Pregunta conceptual 1", parts: [{ pick: ["f3-cuanticos-mc", "f3-degeneracion-num", "f3-momento-num"], pts: 5 }] },
          { title: "Pregunta conceptual 2", parts: [{ pick: ["f3-foton-vf", "f3-fotoelectrico-num", "f3-wien-num"], pts: 5 }] },
          { title: "Pregunta conceptual 3", parts: [{ pick: ["f3-incerteza-num", "f3-ondas-vf", "f3-tunel-vf"], pts: 5 }] },
          { title: "Pregunta conceptual 4", parts: [{ pick: ["f3-decay-num", "f3-causal-vf", "f3-umbral-num"], pts: 5 }] },
          { title: "Pregunta conceptual 5", parts: [{ pick: ["f3-intervalo-num", "f3-transicion-num", "f3-oscilador-num"], pts: 10 }] },
          { title: "Problema 1: pozo infinito", parts: [{ self: "f3-ex-pozo-x", pts: 20 }] },
          { any: [
            { title: "Problema 2: relatividad", parts: [{ self: "f3-ex-nave", pts: 20 }] },
            { title: "Problema 2: relatividad", parts: [{ self: "f3-ex-velocidades", pts: 20 }] }
          ] },
          { title: "Problema 3: virial en el hidrógeno", parts: [{ self: "f3-ex-virial", pts: 30 }] }
        ] }
    ]
  });
})();
