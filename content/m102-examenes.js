/* ===== M102 · Evaluaciones: parciales y final simulados =====
   Estructura de los exámenes reales (ver docs/parciales/m102.md): cinco ejercicios de 20 puntos, cada uno
   de un tema, con «justifique sus respuestas». Enunciados propios y números sorteados; los ejercicios largos
   son de desarrollo (`self`) y se corrigen con la rúbrica. */
(function () {
  const E = window.Efecen, R = String.raw;
  const SELF = {}, T = {};
  const nf = (H, x, d = 3) => H.num(x, d).replace(".", "{,}");
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const tup = xs => `\\left(${xs.join(",\\ ")}\\right)`;
  // a·√n simplificada (a entero)
  const ksq = (a, n) => { let k = a, m = n; for (let f = 2; f * f <= m; f++) while (m % (f * f) === 0) { m /= f * f; k *= f; } return m === 1 ? String(k) : `${k === 1 ? "" : k === -1 ? "-" : k}\\sqrt{${m}}`; };
  // vector entero dividido por √n, simplificado: (a, b, c)/√n
  const unitTex = (H, v0) => { const g0 = v0.reduce((a, b) => gcd(a, b)), v = v0.map(x => x / g0), n2 = v.reduce((s, x) => s + x * x, 0), s = Math.sqrt(n2); return Number.isInteger(s) ? tup(v.map(x => H.frac(x, s))) : `\\frac{1}{${ksq(1, n2)}}${tup(v)}`; };
  // notación científica para errores chicos: 1,23 \times 10^{-7}
  const sci = x => { if (x === 0) return "0"; const e = Math.floor(Math.log10(Math.abs(x))); if (e >= -4) return String(+x.toPrecision(3)).replace(".", "{,}"); return `${String(+(x / 10 ** e).toFixed(2)).replace(".", "{,}")} \\times 10^{${e}}`; };
  // a(x − x0) + b(y − y0) + c(z − z0), sin términos nulos
  const pointNormal = (H, n, P) => ["x", "y", "z"].map((v, i) => [n[i], P[i] === 0 ? v : `(${H.xm(P[i], v)})`]).filter(([c]) => c !== 0).map(([c, t], i) => `${i === 0 ? (c < 0 ? "-" : "") : c < 0 ? " - " : " + "}${Math.abs(c) === 1 ? "" : Math.abs(c)}${t}`).join("");
  const simpson = (f, a, b, n = 400) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3; };

  // ---------- 1.er parcial ----------
  // serie binomial para aproximar una raíz: polinomio de Maclaurin, radio, intervalo y comparación
  SELF["c2-ex-binomial"] = {
    concepts: ["c2-taylor", "c2-series-potencias"],
    generate(r, H) {
      const [pn, pd, rootTex] = r.pick([[1, 2, b => `\\sqrt{${b}}`], [1, 3, b => `\\sqrt[3]{${b}}`], [1, 5, b => `\\sqrt[5]{${b}}`], [-1, 2, b => `\\frac{1}{\\sqrt{${b}}}`], [2, 3, b => `\\sqrt[3]{(${b})^2}`]]);
      const x0 = r.pick([0.1, 0.2, 0.3, -0.1, -0.2, 0.5]), N = r.pick([4, 5]), p = pn / pd, bT = nf(H, 1 + x0, 2);
      // coeficientes binomiales (p k) como fracciones num/den
      const co = [[1, 1]];
      for (let k = 1; k <= N; k++) { const [a, b] = co[k - 1]; let nu = a * (pn - (k - 1) * pd), de = b * pd * k; const g = gcd(nu, de); co.push([nu / g, de / g]); }
      const poly = co.map(([a, b], k) => { const c = H.frac(a, b), m = k === 0 ? "" : k === 1 ? "x" : `x^{${k}}`; if (k === 0) return c; const neg = a < 0, abs = H.frac(Math.abs(a), b); return `${neg ? " - " : " + "}${abs === "1" ? "" : abs}${m}`; }).join("");
      const approx = co.reduce((s, [a, b], k) => s + a / b * x0 ** k, 0), exact = (1 + x0) ** p;
      const pT = H.frac(pn, pd), interval = p > 0 ? "[-1, 1]" : "(-1, 1]";
      return {
        prompt: `Para calcular un valor aproximado de $${rootTex(bT)}$ sin calculadora: a) obtené el desarrollo en serie de Maclaurin de $f(x) = (1 + x)^{${pT}}$ hasta grado ${N}; b) determiná el radio y el intervalo de convergencia de la serie; c) aproximá $${rootTex(bT)}$ con ese polinomio y comparalo con el valor de la calculadora.`,
        rubric: [
          { text: `a) $\\binom{${pT}}{k} = \\frac{p(p - 1)\\cdots(p - k + 1)}{k!}$: $P_${N}(x) = ${poly}$.`, w: 2 },
          { text: `b) Criterio del cociente: $\\left|\\frac{a_{k+1}}{a_k}\\right| = \\frac{|p - k|}{k + 1}|x| \\to |x|$, así que $R = 1$.`, w: 2 },
          { text: `b) Extremos: ${p > 0 ? "con $p > 0$ la serie converge en $x = \\pm 1$" : "con $-1 < p < 0$ converge en $x = 1$ (alternada) y diverge en $x = -1$"}; intervalo $${interval}$.`, w: 2 },
          { text: `c) $x = ${nf(H, x0, 1)}$: $P_${N}(${nf(H, x0, 1)}) \\approx ${nf(H, approx, 7)}$, contra $${nf(H, exact, 7)}$ de la calculadora (error $\\approx ${sci(Math.abs(approx - exact))}$).`, w: 2 }
        ],
        solution: [
          `a) Las derivadas de $(1 + x)^p$ son $f^{(k)}(x) = p(p - 1)\\cdots(p - k + 1)(1 + x)^{p - k}$; en $x = 0$ dan los coeficientes binomiales $\\binom{p}{k}$. Con $p = ${pT}$:`,
          `$$(1 + x)^{${pT}} \\approx ${poly}$$`,
          `b) El cociente de dos términos consecutivos es $\\frac{|p - k|}{k + 1}|x|$, que tiende a $|x|$: la serie converge si $|x| < 1$ y diverge si $|x| > 1$, así que $R = 1$. ${p > 0 ? "En $x = \\pm 1$ los términos son del orden de $\\frac{1}{k^{1 + p}}$ y la serie converge absolutamente" : "En $x = 1$ la serie es alternada con términos que decrecen a $0$ (converge, por Leibniz); en $x = -1$ sus términos son positivos y del orden de $\\frac{1}{k^{1 + p}}$, con $1 + p \\le 1$: diverge"}. Intervalo: $${interval}$.`,
          `c) $${rootTex(bT)} = (1 ${x0 < 0 ? "-" : "+"} ${nf(H, Math.abs(x0), 1)})^{${pT}}$, con $x = ${nf(H, x0, 1)}$ dentro del intervalo: $P_${N}(${nf(H, x0, 1)}) \\approx ${nf(H, approx, 7)}$. La calculadora da $${nf(H, exact, 7)}$: el error es de $${sci(Math.abs(approx - exact))}$, del orden del primer término omitido.`
        ],
        verify: { kind: "zero", tol: 1e-9, fn: () => {
          // coeficientes por la fórmula integral de Cauchy en |z| = 1/2, con (1 + z)^p = exp(p Log(1 + z))
          const res = [], M = 256, rho = 0.5;
          for (let k = 0; k <= N; k++) {
            let re = 0;
            for (let j = 0; j < M; j++) {
              const th = 2 * Math.PI * j / M, wr = 1 + rho * Math.cos(th), wi = rho * Math.sin(th);
              const lr = Math.log(Math.hypot(wr, wi)), li = Math.atan2(wi, wr), mag = Math.exp(p * lr), ang = p * li - k * th;
              re += mag * Math.cos(ang);
            }
            res.push(re / M / rho ** k - co[k][0] / co[k][1]);
          }
          // cociente de términos para k grande: tiende a 1 (radio 1)
          const k = 1e6;
          res.push(Math.abs(p - k) / (k + 1) - 1 > -1e-5 ? 0 : 1);
          res.push(co.reduce((s, [a, b], kk) => s + a / b * x0 ** kk, 0) - approx);
          return res;
        } }
      };
    }
  };

  // punto de intersección de dos rectas tangentes a una curva
  SELF["c2-ex-tangentes"] = {
    concepts: ["c2-curvas-vectoriales"],
    generate(r, H) {
      const fam = r.pick(["trig", "par"]);
      let rt, P1, d1, P2, d2, X, t1T, t2T, curve;
      if (fam === "trig") {
        const a = r.nz(-4, 4), b = r.nz(-4, 4), c = r.nz(-4, 4);
        curve = `\\left(${H.cf(a)}\\operatorname{sen}\\pi t,\\ ${H.cf(b)}\\operatorname{sen}\\pi t,\\ ${H.cf(c)}\\cos\\pi t\\right)`;
        rt = t => [a * Math.sin(Math.PI * t), b * Math.sin(Math.PI * t), c * Math.cos(Math.PI * t)];
        P1 = [0, 0, c]; d1 = [a, b, 0]; P2 = [a, b, 0]; d2 = [0, 0, -c]; X = [a, b, c]; t1T = "0"; t2T = R`\frac12`;
      } else {
        const p = r.nz(-3, 3), q = r.nz(-3, 3), s = r.nz(-3, 3), x0 = r.int(-3, 3), y0 = r.int(-3, 3), z0 = r.int(-3, 3), t1 = r.int(-3, 1), t2 = t1 + 2 * r.int(1, 2);
        curve = `\\left(${H.poly([[p, "t"], [x0, ""]])},\\ ${H.poly([[q, "t^{2}"], [y0, ""]])},\\ ${H.poly([[s, "t"], [z0, ""]])}\\right)`;
        rt = t => [p * t + x0, q * t * t + y0, s * t + z0];
        P1 = rt(t1); d1 = [p, 2 * q * t1, s]; P2 = rt(t2); d2 = [p, 2 * q * t2, s];
        X = [p * (t1 + t2) / 2 + x0, q * t1 * t2 + y0, s * (t1 + t2) / 2 + z0]; t1T = String(t1); t2T = String(t2);
      }
      return {
        prompt: `Dada la función vectorial $\\vec r(t) = ${curve}$, encontrá el punto de intersección de las rectas tangentes a la curva en los puntos donde $t = ${t1T}$ y $t = ${t2T}$.`,
        rubric: [
          { text: `Puntos de tangencia: $\\vec r(${t1T}) = ${tup(P1)}$ y $\\vec r(${t2T}) = ${tup(P2)}$.`, w: 2 },
          { text: `Direcciones (con $\\vec r\\,'$): $${tup(d1)}$ y $${tup(d2)}$ (o múltiplos).`, w: 3 },
          { text: `Rectas tangentes: $L_1: ${tup(P1)} + \\lambda${tup(d1)}$ y $L_2: ${tup(P2)} + \\mu${tup(d2)}$.`, w: 2 },
          { text: `Igualando componentes y resolviendo: se cortan en $${tup(X)}$.`, w: 3 }
        ],
        solution: [
          `La recta tangente en $t_0$ pasa por $\\vec r(t_0)$ con dirección $\\vec r\\,'(t_0)$. ${fam === "trig" ? R`Acá $\vec r\,'(t) = \pi\left(a\cos\pi t,\ b\cos\pi t,\ -c\operatorname{sen}\pi t\right)$; el factor $\pi$ no cambia la dirección.` : R`Acá $\vec r\,'(t)$ tiene la derivada de cada componente.`}`,
          `En $t = ${t1T}$: punto $${tup(P1)}$ y dirección $${tup(d1)}$. En $t = ${t2T}$: punto $${tup(P2)}$ y dirección $${tup(d2)}$.`,
          `$L_1: (x, y, z) = ${tup(P1)} + \\lambda${tup(d1)}$, $L_2: (x, y, z) = ${tup(P2)} + \\mu${tup(d2)}$. Igualando las tres componentes queda un sistema en $\\lambda$ y $\\mu$ que es compatible${fam === "par" ? " (la curva es plana: está en un plano porque $x$ y $z$ son lineales en $t$)" : ""}.`,
          `Resolviéndolo, las rectas se cortan en $${tup(X)}$.`
        ],
        verify: { kind: "zero", tol: 1e-9, scale: 10, fn: () => {
          // mínimos cuadrados para λ y μ, y residuo; además las direcciones son tangentes (diferencias finitas)
          const A = [[0, 0], [0, 0]], bb = [0, 0], col = [d1, d2.map(x => -x)], rhs = P2.map((x, i) => x - P1[i]);
          for (let i = 0; i < 2; i++) { for (let j = 0; j < 2; j++) A[i][j] = col[i].reduce((s, x, k) => s + x * col[j][k], 0); bb[i] = col[i].reduce((s, x, k) => s + x * rhs[k], 0); }
          const det = A[0][0] * A[1][1] - A[0][1] * A[1][0], l = (bb[0] * A[1][1] - A[0][1] * bb[1]) / det, m = (A[0][0] * bb[1] - A[1][0] * bb[0]) / det;
          const Q1 = P1.map((x, i) => x + l * d1[i]), Q2 = P2.map((x, i) => x + m * d2[i]), h = 1e-6;
          const t1n = fam === "trig" ? 0 : +t1T, t2n = fam === "trig" ? 0.5 : +t2T;
          const tang = (t, d) => { const v = rt(t + h).map((x, i) => (x - rt(t - h)[i]) / (2 * h)); return [v[1] * d[2] - v[2] * d[1], v[2] * d[0] - v[0] * d[2], v[0] * d[1] - v[1] * d[0]].map(x => x * 1e-3); };
          return [...Q1.map((x, i) => x - Q2[i]), ...Q1.map((x, i) => x - X[i]), ...tang(t1n, d1), ...tang(t2n, d2)];
        } }
      };
    }
  };

  // vectores tangente unitario y normal principal en t = 0
  SELF["c2-ex-tn"] = {
    concepts: ["c2-curvas-vectoriales", "c2-curvatura"],
    generate(r, H) {
      const a = r.nz(-3, 3), b = r.int(1, 4), perm = r.pick([[0, 1, 2], [1, 2, 0], [2, 0, 1], [0, 2, 1], [1, 0, 2], [2, 1, 0]]);
      // componentes "lógicas": (a t², b cos t, b sen t); perm dice en qué coordenada va cada una
      const comps = [`${H.cf(a)}t^2`, `${H.cf(b)}\\cos t`, `${H.cf(b)}\\operatorname{sen} t`], place = v => { const out = [0, 0, 0]; perm.forEach((pi, i) => { out[pi] = v[i]; }); return out; };
      const rTex = place(comps), Tv = place([0, 0, 1]), Nv = place([2 * a, -b, 0]), kap = Math.sqrt(4 * a * a + b * b) / (b * b);
      const rt = t => place([a * t * t, b * Math.cos(t), b * Math.sin(t)]);
      return {
        prompt: `Dada la función vectorial $\\vec r(t) = \\left(${rTex.join(",\\ ")}\\right)$, hallá para $t = 0$: a) el vector tangente unitario $\\vec T(0)$; b) el vector normal principal $\\vec N(0)$. c) ¿Cuánto vale la curvatura en ese punto?`,
        rubric: [
          { text: `a) $\\vec r\\,'(0) = ${tup(place([0, 0, b]))}$, $\\|\\vec r\\,'(0)\\| = ${b}$ y $\\vec T(0) = ${tup(Tv)}$.`, w: 4 },
          { text: `b) $\\vec T\\,'(0) = \\frac{1}{${b}}${tup(place([2 * a, -b, 0]))}$ (la derivada de $\\|\\vec r\\,'\\|$ se anula en $0$).`, w: 3 },
          { text: `b) $\\vec N(0) = \\frac{\\vec T\\,'(0)}{\\|\\vec T\\,'(0)\\|} = ${unitTex(H, Nv)}$.`, w: 3 },
          { text: `c) $\\kappa = \\frac{\\|\\vec T\\,'(0)\\|}{\\|\\vec r\\,'(0)\\|} = \\frac{\\sqrt{${4 * a * a + b * b}}}{${b * b}} \\approx ${nf(H, kap)}$.`, w: 2 }
        ],
        solution: [
          `a) $\\vec r\\,'(t) = ${tup(place([`${2 * a}t`, `${H.cf(-b)}\\operatorname{sen} t`, `${H.cf(b)}\\cos t`]))}$, así que $\\vec r\\,'(0) = ${tup(place([0, 0, b]))}$ y $\\vec T(0) = \\frac{\\vec r\\,'(0)}{\\|\\vec r\\,'(0)\\|} = ${tup(Tv)}$.`,
          `b) $\\|\\vec r\\,'(t)\\| = \\sqrt{${4 * a * a}t^2 + ${b * b}}$, cuya derivada en $t = 0$ es $0$. Entonces, derivando $\\vec T = \\frac{\\vec r\\,'}{\\|\\vec r\\,'\\|}$ en $0$, solo queda $\\frac{\\vec r\\,''(0)}{\\|\\vec r\\,'(0)\\|}$, con $\\vec r\\,''(0) = ${tup(place([2 * a, -b, 0]))}$.`,
          `$\\vec N(0) = \\frac{\\vec T\\,'(0)}{\\|\\vec T\\,'(0)\\|} = ${unitTex(H, Nv)}$. (Es perpendicular a $\\vec T(0)$, como tiene que ser.)`,
          `c) $\\kappa(0) = \\frac{\\|\\vec T\\,'(0)\\|}{\\|\\vec r\\,'(0)\\|} = \\frac{\\sqrt{${4 * a * a + b * b}}/${b}}{${b}} \\approx ${nf(H, kap)}$.`
        ],
        verify: { kind: "zero", tol: 1e-5, fn: () => {
          // T(t) por diferencias finitas de r, y T' por diferencias de T
          const hh = 1e-6, h = 1e-3, d = t => { const v = rt(t + hh).map((x, i) => (x - rt(t - hh)[i]) / (2 * hh)), n = Math.hypot(...v); return v.map(x => x / n); };
          // T'(0) con diferencias centradas y extrapolación de Richardson
          const D1 = k => d(k).map((x, i) => (x - d(-k)[i]) / (2 * k)), Da = D1(h), Db = D1(h / 2);
          const T0 = d(0), Tp = Db.map((x, i) => (4 * x - Da[i]) / 3), nTp = Math.hypot(...Tp), N0 = Tp.map(x => x / nTp), nN = Math.hypot(...Nv);
          const sp = Math.hypot(...rt(h).map((x, i) => (x - rt(-h)[i]) / (2 * h)));
          return [...T0.map((x, i) => x - Tv[i]), ...N0.map((x, i) => x - Nv[i] / nN), nTp / sp - kap];
        } }
      };
    }
  };

  // límite doble en el origen y continuidad
  SELF["c2-ex-limite"] = {
    concepts: ["c2-varias"],
    generate(r, H) {
      const a = r.nz(-5, 5), fam = r.pick(["xy", "x2y", "xy2", "x3", "dif"]);
      const def = {
        xy: { tex: `\\frac{${H.cf(a)}xy}{x^2 + y^2}`, f: (x, y) => a * x * y / (x * x + y * y), exists: false },
        x2y: { tex: `\\frac{${H.cf(a)}x^2y}{x^2 + y^2}`, f: (x, y) => a * x * x * y / (x * x + y * y), exists: true },
        xy2: { tex: `\\frac{${H.cf(a)}xy^2}{x^2 + y^4}`, f: (x, y) => a * x * y * y / (x * x + y ** 4), exists: false },
        x3: { tex: `\\frac{${H.cf(a)}x^3}{x^2 + y^2}`, f: (x, y) => a * x ** 3 / (x * x + y * y), exists: true },
        dif: { tex: `\\frac{${H.cf(a)}(x^2 - y^2)}{x^2 + y^2}`, f: (x, y) => a * (x * x - y * y) / (x * x + y * y), exists: false }
      }[fam];
      const why = {
        xy: [R`Por las rectas $y = mx$: $f(x, mx) = ` + `\\frac{${H.cf(a)}m}{1 + m^2}$, que depende de $m$ (por ejemplo, $0$ con $m = 0$ y $${H.frac(a, 2)}$ con $m = 1$).`, R`Como dos caminos dan límites distintos, el límite no existe.`],
        x2y: [R`En polares, $|f| = ` + `${Math.abs(a)}` + R`\,r\,|\cos^2\theta\operatorname{sen}\theta| \le ` + `${Math.abs(a)}` + R`\,r \to 0$, sin importar $\theta$.`, R`Por el teorema del sándwich, el límite existe y vale $0$.`],
        xy2: [R`Por las rectas $y = mx$: $f(x, mx) = ` + `\\frac{${H.cf(a)}m^2x}{1 + m^4x^2} \\to 0$. Pero por la parábola $x = y^2$: $f(y^2, y) = \\frac{${H.cf(a)}y^4}{2y^4} = ${H.frac(a, 2)}$.`, R`Dos caminos dan límites distintos: el límite no existe.`],
        x3: [R`En polares, $|f| = ` + `${Math.abs(a)}` + R`\,r\,|\cos^3\theta| \le ` + `${Math.abs(a)}` + R`\,r \to 0$.`, R`Por el sándwich, el límite existe y vale $0$.`],
        dif: [`Por el eje $x$ ($y = 0$): $f = ${a}$. Por el eje $y$ ($x = 0$): $f = ${-a}$.`, R`Dos caminos dan límites distintos: el límite no existe.`]
      }[fam];
      return {
        prompt: `Sea $f(x, y) = ${def.tex}$ si $(x, y) \\neq (0, 0)$, y $f(0, 0) = 0$. Hallá $\\displaystyle\\lim_{(x, y)\\to(0, 0)} f(x, y)$ (o mostrá que no existe) y analizá la continuidad de $f$ en $(0, 0)$.`,
        rubric: [
          { text: def.exists ? R`Prueba por caminos que, si existe, el límite tiene que ser $0$ (rectas o ejes).` : R`Elige caminos adecuados que llegan al origen.`, w: 2 },
          { text: why[0], w: 4 },
          { text: why[1], w: 2 },
          { text: def.exists ? R`Como el límite es $0 = f(0, 0)$, $f$ es continua en el origen.` : R`Sin límite, $f$ no es continua en el origen (aunque esté definida ahí).`, w: 2 }
        ],
        solution: [
          R`Sustituir da $\frac00$: hay que analizar.` + (def.exists ? R` Por los ejes y por las rectas la función tiende a $0$, así que ese es el único candidato.` : ""),
          ...why,
          def.exists ? R`Continuidad: $\lim f = 0 = f(0, 0)$, así que $f$ es continua en $(0, 0)$.` : R`Continuidad: para ser continua hace falta que exista el límite y que coincida con $f(0, 0)$; como no existe, $f$ no es continua en $(0, 0)$.`
        ],
        verify: { kind: "zero", tol: 1e-6, fn: () => {
          const f = def.f, s = 1e-7;
          if (def.exists) { const res = []; for (let k = 0; k < 24; k++) { const th = 2 * Math.PI * k / 24 + 0.1; res.push(f(1e-9 * Math.cos(th), 1e-9 * Math.sin(th))); } res.push(f(1e-18, 1e-9)); return res; }
          // dos caminos que dan valores distintos
          const v1 = fam === "xy2" ? f(s, 0) : f(s, 0), v2 = fam === "xy" ? f(s, s) : fam === "xy2" ? f(s * s, s) : f(0, s);
          return [Math.abs(v1 - v2) > 0.4 ? 0 : 1];
        } }
      };
    }
  };

  // cuádrica: identificar y describir sus trazas
  SELF["c2-ex-trazas"] = {
    concepts: ["c2-cuadricas"],
    generate(r, H) {
      const type = r.pick(["h1", "h2", "elip", "cono", "pe", "ph"]), a = r.int(1, 3), b = r.int(1, 3), c = r.int(1, 3);
      const A = a * a, B = b * b, C = c * c;
      // ecuación entera: se multiplica por A·B·C y se simplifica
      const mk = (ca, cb, cc, rhs) => { const L = A * B * C; let co = [ca * L / A, cb * L / B, cc * L / C, rhs * L]; const g = co.reduce((x, y) => gcd(x, y)); co = co.map(x => x / g); return co; };
      let eq, F, name, traces, pts;
      const P = t => [Math.cos(t), Math.sin(t)];
      if (type === "h1") {
        const co = mk(1, 1, -1, 1); eq = `${H.poly([[co[0], "x^{2}"], [co[1], "y^{2}"], [co[2], "z^{2}"]])} = ${co[3]}`; F = (x, y, z) => x * x / A + y * y / B - z * z / C - 1; name = "un hiperboloide de una hoja (eje $z$)";
        traces = [R`$z = k$: elipses $\frac{x^2}{${A}} + \frac{y^2}{${B}} = 1 + \frac{k^2}{${C}}$, que crecen con $|k|$ (la más chica, en $z = 0$).`, R`$x = 0$: hipérbola $\frac{y^2}{${B}} - \frac{z^2}{${C}} = 1$; $y = 0$: hipérbola $\frac{x^2}{${A}} - \frac{z^2}{${C}} = 1$.`];
        pts = () => [[1, 2, 0.5], [-0.3, 1.1, -2]].map(([u, v, k]) => { const s = Math.sqrt(1 + k * k / C); return [a * s * Math.cos(u), b * s * Math.sin(u), k]; }).concat([0.4, -1.2].map(t => [0, b * Math.cosh(t), c * Math.sinh(t)]));
      } else if (type === "h2") {
        const co = mk(-1, -1, 1, 1); eq = `${H.poly([[co[0], "x^{2}"], [co[1], "y^{2}"], [co[2], "z^{2}"]])} = ${co[3]}`; F = (x, y, z) => -x * x / A - y * y / B + z * z / C - 1; name = "un hiperboloide de dos hojas (eje $z$)";
        traces = [R`$z = k$: si $|k| > ${c}$, elipses $\frac{x^2}{${A}} + \frac{y^2}{${B}} = \frac{k^2}{${C}} - 1$; si $|k| = ${c}$, un punto (los vértices); si $|k| < ${c}$, nada.`, R`$x = 0$: hipérbola $\frac{z^2}{${C}} - \frac{y^2}{${B}} = 1$; $y = 0$: hipérbola $\frac{z^2}{${C}} - \frac{x^2}{${A}} = 1$.`];
        pts = () => [[0.7, 2 * c], [2.2, -1.5 * c]].map(([u, k]) => { const s = Math.sqrt(k * k / C - 1); return [a * s * Math.cos(u), b * s * Math.sin(u), k]; }).concat([0.5, -0.9].map(t => [0, b * Math.sinh(t), c * Math.cosh(t)]));
      } else if (type === "elip") {
        const co = mk(1, 1, 1, 1); eq = `${H.poly([[co[0], "x^{2}"], [co[1], "y^{2}"], [co[2], "z^{2}"]])} = ${co[3]}`; F = (x, y, z) => x * x / A + y * y / B + z * z / C - 1; name = "un elipsoide";
        traces = [R`$z = k$ con $|k| < ${c}$: elipses $\frac{x^2}{${A}} + \frac{y^2}{${B}} = 1 - \frac{k^2}{${C}}$, que se achican hasta un punto en $z = \pm ${c}$.`, R`$x = 0$: elipse $\frac{y^2}{${B}} + \frac{z^2}{${C}} = 1$; $y = 0$: elipse $\frac{x^2}{${A}} + \frac{z^2}{${C}} = 1$.`];
        pts = () => [[0.3, 0.5 * c], [2, -0.8 * c]].map(([u, k]) => { const s = Math.sqrt(1 - k * k / C); return [a * s * Math.cos(u), b * s * Math.sin(u), k]; }).concat([[0, b * Math.cos(1), c * Math.sin(1)]]);
      } else if (type === "cono") {
        const co = mk(1, 1, -1, 0); eq = `${H.poly([[co[0], "x^{2}"], [co[1], "y^{2}"], [co[2], "z^{2}"]])} = 0`; F = (x, y, z) => x * x / A + y * y / B - z * z / C; name = "un cono elíptico (eje $z$, vértice en el origen)";
        traces = [R`$z = k \neq 0$: elipses $\frac{x^2}{${A}} + \frac{y^2}{${B}} = \frac{k^2}{${C}}$; en $z = 0$, solo el origen.`, `$x = 0$: el par de rectas $z = \\pm ${H.frac(c, b) === "1" ? "" : H.frac(c, b)}y$; $y = 0$: el par de rectas $z = \\pm ${H.frac(c, a) === "1" ? "" : H.frac(c, a)}x$.`];
        pts = () => [[0.3, 2], [4, -1]].map(([u, k]) => { const s = Math.abs(k) / c; return [a * s * Math.cos(u), b * s * Math.sin(u), k]; }).concat([[0, 2 * b, 2 * c], [3 * a, 0, -3 * c]]);
      } else if (type === "pe") {
        const L = A * B, co = [L / A, L / B, -L]; const g = co.reduce((x, y) => gcd(x, y)); const cc = co.map(x => x / g);
        eq = `${H.poly([[cc[0], "x^{2}"], [cc[1], "y^{2}"]])} = ${H.poly([[-cc[2], "z"]])}`; F = (x, y, z) => x * x / A + y * y / B - z; name = "un paraboloide elíptico (eje $z$, abre hacia arriba)";
        traces = [R`$z = k > 0$: elipses $\frac{x^2}{${A}} + \frac{y^2}{${B}} = k$; en $z = 0$, el origen; con $k < 0$, nada.`, R`$x = 0$: parábola $z = \frac{y^2}{${B}}$; $y = 0$: parábola $z = \frac{x^2}{${A}}$.`];
        pts = () => [[0.3, 2], [4, 0.5]].map(([u, k]) => [a * Math.sqrt(k) * Math.cos(u), b * Math.sqrt(k) * Math.sin(u), k]).concat([[0, 3, 9 / B], [-2, 0, 4 / A]]);
      } else {
        const L = A * B, co = [L / A, L / B, L]; const g = co.reduce((x, y) => gcd(x, y)); const cc = co.map(x => x / g);
        eq = `${H.poly([[cc[1], "y^{2}"], [-cc[0], "x^{2}"]])} = ${H.poly([[cc[2], "z"]])}`; F = (x, y, z) => y * y / B - x * x / A - z; name = "un paraboloide hiperbólico (silla de montar)";
        traces = [R`$z = k$: hipérbolas $\frac{y^2}{${B}} - \frac{x^2}{${A}} = k$ (eje focal $y$ si $k > 0$, eje $x$ si $k < 0$); en $z = 0$, el par de rectas $y = \pm` + `${H.frac(b, a) === "1" ? "" : H.frac(b, a)}` + R`x$.`, R`$x = 0$: parábola $z = \frac{y^2}{${B}}$, que abre hacia arriba; $y = 0$: parábola $z = -\frac{x^2}{${A}}$, que abre hacia abajo.`];
        pts = () => [[0.6, 2], [-0.4, -3]].map(([t, k]) => (k > 0 ? [a * Math.sqrt(k) * Math.sinh(t), b * Math.sqrt(k) * Math.cosh(t), k] : [a * Math.sqrt(-k) * Math.cosh(t), b * Math.sqrt(-k) * Math.sinh(t), k])).concat([[a, b, 0], [0, 2, 4 / B]]);
      }
      const one = t => t.replace(/\\frac\{([a-z]\^2)\}\{1\}/g, "$1");
      traces = traces.map(one);
      return {
        prompt: `Bosquejá la superficie $${eq}$ usando sus trazas: identificala y describí las trazas en planos paralelos a los planos coordenados.`,
        rubric: [
          { text: `Es ${name}.`, w: 2 },
          { text: traces[0], w: 3 },
          { text: traces[1], w: 3 },
          { text: R`Bosquejo coherente con las trazas.`, w: 2 }
        ],
        solution: [
          `Dividiendo para que quede en forma canónica y mirando los signos, es ${name}.`,
          `Trazas horizontales: ${traces[0]}`,
          `Trazas verticales: ${traces[1]}`,
          R`Con esas curvas se arma el bosquejo: se dibujan algunas trazas horizontales a distintas alturas y las dos verticales.`
        ],
        verify: { kind: "zero", tol: 1e-9, scale: 10, fn: () => pts().map(p => F(...p)) }
      };
    }
  };

  // ---------- 2.º parcial ----------
  // derivada direccional en una dirección que forma un ángulo con el gradiente
  T["c2-ex-dir-angulo-num"] = {
    type: "numeric", concepts: ["c2-gradiente"], difficulty: 2,
    generate(r, H) {
      const a = r.nz(-3, 3), b = r.nz(-2, 2), c = r.int(-2, 2), d = r.int(-3, 3), p = r.nz(-2, 2), ang = r.pick([30, 45, 60, 68, 120, 135, 150]);
      const f = (x, y) => a * x * Math.exp(b * y) + c * x * y * y + d * y;
      const fx = a, fy = a * b * p + d, g = Math.hypot(fx, fy), ans = g * Math.cos(ang * Math.PI / 180);
      if (g === 0) return null;
      return {
        prompt: `Calculá la derivada direccional de $f(x, y) = ${H.poly([[a, `xe^{${H.kx(b, "y")}}`], [c, "xy^{2}"], [d, "y"]])}$ en el punto $P(${p}, 0)$, en la dirección que forma un ángulo de $${ang}^\\circ$ con el gradiente.`,
        answer: ans,
        solution: [`$f_x = ${H.poly([[a, `e^{${H.kx(b, "y")}}`], [c, "y^{2}"]])}$ y $f_y = ${H.poly([[a * b, `xe^{${H.kx(b, "y")}}`], [2 * c, "xy"], [d, ""]])}$. En $P$: $\\nabla f(P) = (${fx}, ${fy})$, con $\\|\\nabla f(P)\\| = ${ksq(1, fx * fx + fy * fy)}$.`,
          R`Como $D_{\vec u}f = \nabla f\cdot\vec u = \|\nabla f\|\,\|\vec u\|\cos\alpha$ y $\vec u$ es unitario:` + ` $D_{\\vec u}f(P) = ${ksq(1, fx * fx + fy * fy)}\\cos ${ang}^\\circ \\approx ${nf(H, ans)}$.`],
        // otro camino: diferencias finitas en la dirección del gradiente girado ese ángulo
        verify: { kind: "value", tol: 1e-6, fn: () => {
          const h = 1e-5, gx = (f(p + h, 0) - f(p - h, 0)) / (2 * h), gy = (f(p, h) - f(p, -h)) / (2 * h), n = Math.hypot(gx, gy), t = ang * Math.PI / 180;
          const u = [(gx * Math.cos(t) - gy * Math.sin(t)) / n, (gx * Math.sin(t) + gy * Math.cos(t)) / n];
          return (f(p + h * u[0], h * u[1]) - f(p - h * u[0], -h * u[1])) / (2 * h);
        } }
      };
    }
  };

  // superficies implícitas: una cuádrica o una con exponencial, por un punto
  function implicitSurface(r, H) {
    if (r.bool()) {
      const ca = r.nz(-3, 3), cb = r.nz(-3, 3), cc = r.nz(-3, 3), P = [r.nz(-3, 3), r.nz(-3, 3), r.nz(-3, 3)], D = ca * P[0] ** 2 + cb * P[1] ** 2 + cc * P[2] ** 2;
      let n = [2 * ca * P[0], 2 * cb * P[1], 2 * cc * P[2]]; const g = n.reduce((x, y) => gcd(x, y)); n = n.map(x => x / g);
      return { P, n, F: (x, y, z) => ca * x * x + cb * y * y + cc * z * z - D, tex: `${H.poly([[ca, "x^{2}"], [cb, "y^{2}"], [cc, "z^{2}"]])} = ${D}`, grad: `\\nabla F = (${H.poly([[2 * ca, "x"]])},\\ ${H.poly([[2 * cb, "y"]])},\\ ${H.poly([[2 * cc, "z"]])})`, gradP: [2 * ca * P[0], 2 * cb * P[1], 2 * cc * P[2]] };
    }
    const al = r.int(-2, 2), be = r.int(-2, 2), x0 = r.int(-3, 4), s = r.int(-2, 2), y0 = s - x0, z0 = r.int(-3, 3), K = 1 + al * x0 + be * y0 - z0;
    const n = [1 + al, 1 + be, -1];
    return { P: [x0, y0, z0], n, F: (x, y, z) => Math.exp(x + y - s) + al * x + be * y - z - K, tex: `e^{${H.poly([[1, "x"], [1, "y"], [-s, ""]])}} ${H.poly([[al, "x"], [be, "y"], [-1, "z"]]).replace(/^(?!-)/, "+ ").replace(/^-/, "- ")} = ${K}`, grad: `\\nabla F = \\left(e^{${H.poly([[1, "x"], [1, "y"], [-s, ""]])}}${al ? H.sg(al) : ""},\\ e^{${H.poly([[1, "x"], [1, "y"], [-s, ""]])}}${be ? H.sg(be) : ""},\\ -1\\right)`, gradP: n };
  }

  // plano tangente y recta normal a una superficie implícita
  SELF["c2-ex-tg-normal"] = {
    concepts: ["c2-gradiente"],
    generate(r, H) {
      const S = implicitSurface(r, H), { P, n } = S, D = n[0] * P[0] + n[1] * P[1] + n[2] * P[2];
      if (n.every(x => x === 0)) return null;
      const plane = `${H.poly([[n[0], "x"], [n[1], "y"], [n[2], "z"]])} = ${D}`;
      return {
        prompt: `Sea la superficie definida implícitamente por $${S.tex}$. Hallá a) el plano tangente y b) la recta normal a la superficie en el punto $P${tup(P)}$.`,
        rubric: [
          { text: `$P$ está en la superficie y $${S.grad}$; en $P$: $\\nabla F(P) = ${tup(S.gradP)}$, que es normal a la superficie.`, w: 4 },
          { text: `a) $\\nabla F(P)\\cdot(X - P) = 0$: $${plane}$.`, w: 3 },
          { text: `b) $(x, y, z) = ${tup(P)} + t${tup(n)}$, $t \\in \\mathbb{R}$.`, w: 3 }
        ],
        solution: [
          `Si $F(x, y, z) = 0$ define la superficie, el gradiente de $F$ es perpendicular a ella en cada punto (es perpendicular a toda curva de la superficie, porque $F$ es constante sobre ella). Acá $${S.grad}$, y en $P$ vale $${tup(S.gradP)}$${S.gradP.some((x, i) => x !== n[i]) ? `, paralelo a $${tup(n)}$` : ""}.`,
          `a) Plano por $P$ con esa normal: $${pointNormal(H, n, P)} = 0$, o sea $${plane}$.`,
          `b) Recta por $P$ con la dirección de la normal: $(x, y, z) = ${tup(P)} + t${tup(n)}$, $t \\in \\mathbb{R}$.`
        ],
        verify: { kind: "zero", tol: 1e-6, scale: 10, fn: () => {
          const h = 1e-6, g = [0, 1, 2].map(i => { const p = P.slice(), m = P.slice(); p[i] += h; m[i] -= h; return (S.F(...p) - S.F(...m)) / (2 * h); });
          const cr = [g[1] * n[2] - g[2] * n[1], g[2] * n[0] - g[0] * n[2], g[0] * n[1] - g[1] * n[0]];
          return [S.F(...P), ...cr.map(x => x / 10)];
        } }
      };
    }
  };

  // V/F: el plano tangente corta al eje z en un punto dado
  T["c2-ex-tg-eje-vf"] = {
    type: "tf", concepts: ["c2-gradiente"], difficulty: 2,
    generate(r, H) {
      const S = implicitSurface(r, H), { P, n } = S;
      if (n[2] === 0) return null;
      const D = n[0] * P[0] + n[1] * P[1] + n[2] * P[2], zt = D / n[2], truth = r.bool(), zc = truth ? zt : zt + r.pick([-2, -1, 1, 2]);
      return {
        prompt: `<b>Verdadero o falso:</b> el plano tangente a la superficie $${S.tex}$ en el punto $P${tup(P)}$ corta al eje $z$ en el punto $(0, 0, ${H.frac(Math.round(zc * n[2]), n[2])})$.`,
        answer: truth,
        explanation: `El gradiente en $P$ es paralelo a $${tup(n)}$, así que el plano tangente es $${H.poly([[n[0], "x"], [n[1], "y"], [n[2], "z"]])} = ${D}$. Con $x = y = 0$: $z = ${H.frac(D, n[2])}$. ${truth ? "Es verdadero." : "Es falso."}`,
        solution: [`$P$ está en la superficie. El gradiente de $F$ en $P$ es normal a la superficie: es paralelo a $${tup(n)}$.`, `Plano tangente: $${H.poly([[n[0], "x"], [n[1], "y"], [n[2], "z"]])} = ${D}$; en el eje $z$ ($x = y = 0$) queda $z = ${H.frac(D, n[2])}$.`],
        verify: { kind: "truth", fn: () => {
          // gradiente numérico, plano y corte con el eje z
          const h = 1e-6, g = [0, 1, 2].map(i => { const p = P.slice(), m = P.slice(); p[i] += h; m[i] -= h; return (S.F(...p) - S.F(...m)) / (2 * h); });
          const z = (g[0] * P[0] + g[1] * P[1] + g[2] * P[2]) / g[2];
          return Math.abs(z - zc) < 1e-5;
        } }
      };
    }
  };

  // puntos críticos y su clasificación
  SELF["c2-ex-criticos"] = {
    concepts: ["c2-extremos"],
    generate(r, H) {
      let f, tex, pts;
      if (r.bool()) {
        const k = r.nz(-3, 3);
        f = (x, y) => x ** 3 + y ** 3 - 3 * k * x * y; tex = `x^3 + y^3${H.sg(-3 * k)}xy`;
        pts = [{ p: [0, 0], fxx: 0, fyy: 0, fxy: -3 * k, kind: "silla" }, { p: [k, k], fxx: 6 * k, fyy: 6 * k, fxy: -3 * k, kind: k > 0 ? "mínimo" : "máximo" }];
      } else {
        const p = r.int(1, 3), q = r.int(-3, 3), s = r.nz(-3, 3);
        f = (x, y) => x ** 3 - 3 * p * p * x + s * (y - q) ** 2; tex = `x^3 - ${3 * p * p}x ${s < 0 ? "-" : "+"} ${Math.abs(s) === 1 ? "" : Math.abs(s)}${q === 0 ? "y^2" : `(${H.xm(q, "y")})^2`}`;
        pts = [{ p: [p, q], fxx: 6 * p, fyy: 2 * s, fxy: 0, kind: s > 0 ? "mínimo" : "silla" }, { p: [-p, q], fxx: -6 * p, fyy: 2 * s, fxy: 0, kind: s < 0 ? "máximo" : "silla" }];
      }
      const D = q => q.fxx * q.fyy - q.fxy * q.fxy;
      const line = q => `$${tup(q.p)}$: $D = (${q.fxx})(${q.fyy}) - (${q.fxy})^2 = ${D(q)}$${D(q) < 0 ? ": punto silla" : `, $f_{xx} = ${q.fxx}$: ${q.kind} relativo, con $f = ${nf(H, f(...q.p))}$`}.`;
      return {
        prompt: `Hallá los puntos críticos de $f(x, y) = ${tex}$ y determiná si en cada uno hay un máximo relativo, un mínimo relativo o un punto silla.`,
        rubric: [
          { text: R`Plantea $f_x = 0$ y $f_y = 0$ y resuelve el sistema.`, w: 2 },
          { text: `Puntos críticos: ${pts.map(q => `$${tup(q.p)}$`).join(" y ")}.`, w: 3 },
          { text: R`Calcula las derivadas segundas y $D = f_{xx}f_{yy} - f_{xy}^2$ en cada punto.`, w: 2 },
          { text: pts.map(q => `$${tup(q.p)}$: ${q.kind === "silla" ? "punto silla" : q.kind}`).join("; ") + ".", w: 3 }
        ],
        solution: [
          `Los puntos críticos son las soluciones de $\\nabla f = \\vec 0$ (la función es diferenciable en todo el plano). Resolviendo $f_x = 0$, $f_y = 0$ se obtienen ${pts.map(q => `$${tup(q.p)}$`).join(" y ")}.`,
          R`Criterio de las derivadas segundas: si $D > 0$ y $f_{xx} > 0$ hay un mínimo; si $D > 0$ y $f_{xx} < 0$, un máximo; si $D < 0$, un punto silla.`,
          ...pts.map(line)
        ],
        verify: { kind: "zero", tol: 1e-5, fn: () => {
          const h = 1e-4, res = [];
          for (const q of pts) {
            const [x, y] = q.p;
            res.push((f(x + h, y) - f(x - h, y)) / (2 * h), (f(x, y + h) - f(x, y - h)) / (2 * h));
            const fxx = (f(x + h, y) - 2 * f(x, y) + f(x - h, y)) / (h * h), fyy = (f(x, y + h) - 2 * f(x, y) + f(x, y - h)) / (h * h);
            const fxy = (f(x + h, y + h) - f(x + h, y - h) - f(x - h, y + h) + f(x - h, y - h)) / (4 * h * h), Dn = fxx * fyy - fxy * fxy;
            const kind = Dn < -1e-3 ? "silla" : Dn > 1e-3 ? (fxx > 0 ? "mínimo" : "máximo") : "?";
            res.push(kind === q.kind ? 0 : 1);
          }
          return res;
        } }
      };
    }
  };

  // área de una región triangular y volumen bajo un plano
  SELF["c2-ex-triangulo"] = {
    concepts: ["c2-dobles"],
    generate(r, H) {
      const p = r.int(1, 4), q = r.int(1, 4), a = r.int(0, 3), b = r.int(0, 3), c = r.int(1, 4);
      const area = H.frac(p * q, 2), Vn = 2 * a * q * p * p + b * q * q * p + 3 * c * q * p, V = Vn / 6;
      const z = H.poly([[a, "x"], [b, "y"], [c, ""]]);
      return {
        prompt: `Sea $z = ${z}$ y sea $R$ la región triangular del plano $xy$ con vértices $(0, 0)$, $(${p}, 0)$ y $(${p}, ${q})$. a) Calculá el área de $R$ con una integral doble. b) Calculá el volumen del sólido que está sobre $R$ y debajo de la superficie.`,
        rubric: [
          { text: `Describe la región: $0 \\le x \\le ${p}$, $0 \\le y \\le ${H.frac(q, p) === "1" ? "" : H.frac(q, p)}x$.`, w: 3 },
          { text: `a) $A = \\int_0^{${p}}\\int_0^{${H.frac(q, p) === "1" ? "" : H.frac(q, p)}x} dy\\,dx = ${area}$.`, w: 3 },
          { text: `b) $V = \\iint_R (${z})\\,dA = ${H.frac(Vn, 6)}$.`, w: 4 }
        ],
        solution: [
          `La región está entre la recta $y = 0$, la recta $x = ${p}$ y la recta por el origen y $(${p}, ${q})$, que es $y = ${H.frac(q, p) === "1" ? "" : H.frac(q, p)}x$. Como región de tipo I: $0 \\le x \\le ${p}$, $0 \\le y \\le ${H.frac(q, p) === "1" ? "" : H.frac(q, p)}x$.`,
          `a) $A = \\int_0^{${p}} ${H.frac(q, p) === "1" ? "" : H.frac(q, p)}x\\,dx = ${H.frac(q, p) === "1" ? "" : H.frac(q, p)}\\cdot\\frac{${p * p}}{2} = ${area}$ (el área del triángulo, $\\frac{\\text{base}\\cdot\\text{altura}}{2}$).`,
          `b) La superficie está sobre $R$ (es positiva ahí), así que $V = \\int_0^{${p}}\\int_0^{${H.frac(q, p) === "1" ? "" : H.frac(q, p)}x} (${z})\\,dy\\,dx$. Integrando en $y$ y después en $x$: $V = ${H.frac(Vn, 6)}${Number.isInteger(V) ? "" : ` \\approx ${nf(H, V)}`}$.`
        ],
        // otro camino: regla del punto medio en una grilla sobre el rectángulo, contando solo los puntos de R
        verify: { kind: "zero", tol: 2e-4, fn: () => {
          // en coordenadas (x, s) con y = s·qx/p, el jacobiano es qx/p y la región es un rectángulo
          const N = 400; let A = 0, Vv = 0;
          for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const x = (i + 0.5) * p / N, s = (j + 0.5) / N, y = s * q * x / p, J = q * x / p * (p / N) * (1 / N); A += J; Vv += (a * x + b * y + c) * J; }
          return [(A - p * q / 2) / (p * q), (Vv - V) / V];
        } }
      };
    }
  };

  // integral triple con el cambio u = x, v = xy, w = z
  SELF["c2-ex-cambio-var"] = {
    concepts: ["c2-triples", "c2-jacobiano"],
    generate(r, H) {
      const a = r.int(1, 2), b = a + r.int(1, 3), c = r.int(1, 4), h = r.int(1, 3), k = r.int(1, 3);
      const fr = H.frac(b, a), lnT = fr.startsWith("\\frac") ? `\\ln${fr}` : `\\ln ${fr}`;
      const kc = k === 1 ? "" : k, I1 = (b - a) * h * c * c / 2, I2 = k * c * c * h * h / 4, val = I1 + I2 * Math.log(b / a);
      return {
        prompt: `Sea $D$ la región del espacio $${a} \\le x \\le ${b}$, $0 \\le xy \\le ${c}$, $0 \\le z \\le ${h}$. Calculá $\\displaystyle\\iiint_D (x^2y + ${kc}xyz)\\,dx\\,dy\\,dz$ con el cambio de variables $u = x$, $v = xy$, $w = z$.`,
        rubric: [
          { text: `La región nueva es una caja: $${a} \\le u \\le ${b}$, $0 \\le v \\le ${c}$, $0 \\le w \\le ${h}$.`, w: 2 },
          { text: R`Inversa $x = u$, $y = \frac{v}{u}$, $z = w$ y jacobiano $\frac{\partial(x, y, z)}{\partial(u, v, w)} = \frac1u$.`, w: 3 },
          { text: `Integrando nuevo: $(uv + ${kc}vw)\\cdot\\frac1u = v + ${kc}\\frac{vw}{u}$.`, w: 2 },
          { text: `Resultado: $${nf(H, I1)} + ${I2 === 1 ? "" : nf(H, I2)}${lnT} \\approx ${nf(H, val)}$.`, w: 3 }
        ],
        solution: [
          `Con $u = x$, $v = xy$, $w = z$ la región queda descripta por $${a} \\le u \\le ${b}$, $0 \\le v \\le ${c}$, $0 \\le w \\le ${h}$: una caja.`,
          R`Despejando, $x = u$, $y = \frac{v}{u}$, $z = w$. El jacobiano es el determinante de las derivadas: $\frac{\partial(x, y, z)}{\partial(u, v, w)} = \begin{vmatrix} 1 & 0 & 0 \\ -\frac{v}{u^2} & \frac1u & 0 \\ 0 & 0 & 1 \end{vmatrix} = \frac1u$ (positivo, porque $u \ge ` + `${a}$).`,
          `El integrando: $x^2y = u\\,v$ y $xyz = v\\,w$. Entonces $\\iiint_D = \\int_{${a}}^{${b}}\\int_0^{${c}}\\int_0^{${h}} \\left(v + ${kc}\\frac{vw}{u}\\right)dw\\,dv\\,du$.`,
          `Separando: $\\int\\!\\!\\int\\!\\!\\int v = (${b} - ${a})\\cdot\\frac{${c * c}}{2}\\cdot ${h} = ${nf(H, I1)}$ y $${kc}\\int\\!\\!\\int\\!\\!\\int \\frac{vw}{u} = ${kc}${lnT}\\cdot\\frac{${c * c}}{2}\\cdot\\frac{${h * h}}{2} = ${I2 === 1 ? "" : nf(H, I2)}${lnT}$. Total $\\approx ${nf(H, val)}$.`
        ],
        // otro camino: integración numérica directa en x, y, z (sin cambio de variables)
        verify: { kind: "zero", tol: 1e-6, fn: () => {
          const inner = x => simpson(y => simpson(z => x * x * y + k * x * y * z, 0, h, 20), 0, c / x, 40);
          return [(simpson(inner, a, b, 80) - val) / val];
        } }
      };
    }
  };

  // ---------- final ----------
  // gradiente de una temperatura: direcciones de máximo y mínimo cambio, y sin cambio
  SELF["c2-ex-gradiente-temp"] = {
    concepts: ["c2-gradiente"],
    generate(r, H) {
      const A = r.pick([10, 20, 30, 50]), p = r.nz(-2, 2), q = r.nz(-2, 2), e = Math.exp(-(p * p + q * q));
      const g = [-2 * A * p * e, -2 * A * q * e], gn = Math.hypot(...g), n2 = p * p + q * q;
      return {
        prompt: `En un cerro muy frío, la temperatura (en °C) es $T(x, y) = ${A}e^{-(x^2 + y^2)}$, con $x$ e $y$ en metros. Un alpinista está en $(${p}, ${q})$. a) ¿En qué dirección tiene que moverse para calentarse lo más rápido posible, y cuál es esa rapidez máxima? b) ¿En qué dirección se enfría más rápido, y con qué rapidez? c) ¿En qué direcciones la temperatura no cambia?`,
        rubric: [
          { text: `$\\nabla T = -${2 * A}e^{-(x^2 + y^2)}(x, y)$; en el punto, $\\nabla T = ${2 * A}e^{-${n2}}${tup([-p, -q])}$.`, w: 2 },
          { text: `a) La del gradiente, $\\vec u = ${unitTex(H, [-p, -q])}$ (hacia la cima); rapidez $\\|\\nabla T\\| = ${2 * A}${n2 === 1 ? "" : ksq(1, n2)}e^{-${n2}} \\approx ${nf(H, gn, 4)}$ °C/m.`, w: 3 },
          { text: `b) La opuesta, $${unitTex(H, [p, q])}$; ahí $D_{\\vec u}T = -\\|\\nabla T\\| \\approx ${nf(H, -gn, 4)}$ °C/m.`, w: 2 },
          { text: `c) Las perpendiculares al gradiente: $\\pm${unitTex(H, [-q, p])}$ (tangentes a la curva de nivel).`, w: 1 }
        ],
        solution: [
          `$\\nabla T = \\left(-${2 * A}xe^{-(x^2 + y^2)},\\ -${2 * A}ye^{-(x^2 + y^2)}\\right)$. En $(${p}, ${q})$: $\\nabla T = ${2 * A}e^{-${n2}}${tup([-p, -q])}$.`,
          R`La derivada direccional es $D_{\vec u}T = \nabla T\cdot\vec u = \|\nabla T\|\cos\alpha$, con $\alpha$ el ángulo entre $\vec u$ y el gradiente.`,
          `a) Es máxima con $\\alpha = 0$: en la dirección $${unitTex(H, [-p, -q])}$, que apunta al origen, donde está la temperatura más alta. La rapidez es $\\|\\nabla T\\| = ${2 * A}\\sqrt{${n2}}\\,e^{-${n2}} \\approx ${nf(H, gn, 4)}$ °C/m.`,
          `b) Es mínima con $\\alpha = \\pi$: dirección $${unitTex(H, [p, q])}$, con $D_{\\vec u}T = -\\|\\nabla T\\| \\approx ${nf(H, -gn, 4)}$ °C/m.`,
          `c) Es nula con $\\alpha = \\frac\\pi2$: en las direcciones $\\pm${unitTex(H, [-q, p])}$, tangentes a la circunferencia de nivel que pasa por el punto.`
        ],
        // otro camino: se barre el ángulo de la dirección y se calculan derivadas direccionales numéricas
        verify: { kind: "zero", tol: 1e-5, fn: () => {
          const Tf = (x, y) => A * Math.exp(-(x * x + y * y)), h = 1e-6;
          let best = -1e9, worst = 1e9, bt = 0;
          for (let i = 0; i < 7200; i++) { const t = 2 * Math.PI * i / 7200, D = (Tf(p + h * Math.cos(t), q + h * Math.sin(t)) - Tf(p - h * Math.cos(t), q - h * Math.sin(t))) / (2 * h); if (D > best) { best = D; bt = t; } worst = Math.min(worst, D); }
          const Dz = (Tf(p - h * q / Math.sqrt(n2), q + h * p / Math.sqrt(n2)) - Tf(p + h * q / Math.sqrt(n2), q - h * p / Math.sqrt(n2))) / (2 * h);
          return [(best - gn) / gn, (worst + gn) / gn, (Math.cos(bt) + p / Math.sqrt(n2)) * 1e-3, Dz / gn];
        } }
      };
    }
  };

  // Lagrange con dos restricciones: plano ∩ cilindro
  SELF["c2-ex-lagrange2"] = {
    concepts: ["c2-lagrange"],
    generate(r, H) {
      const a = r.int(-3, 3), b = r.int(-3, 3), c = r.nz(-3, 3), p = r.nz(-2, 2), q = r.nz(-2, 2), d = r.int(-6, 6), R2 = r.pick([1, 4, 9]);
      const Ap = a - c * p, Bp = b - c * q, M = Ap * Ap + Bp * Bp, Rr = Math.sqrt(R2);
      if (M === 0) return null;
      const fmax = c * d + Rr * Math.sqrt(M), fmin = c * d - Rr * Math.sqrt(M);
      const pt = s => { const x = s * Rr * Ap / Math.sqrt(M), y = s * Rr * Bp / Math.sqrt(M); return [x, y, d - p * x - q * y]; };
      const f = H.poly([[a, "x"], [b, "y"], [c, "z"]]), plane = `${H.poly([[p, "x"], [q, "y"], [1, "z"]])} = ${d}`;
      return {
        prompt: `Usá multiplicadores de Lagrange para hallar los valores extremos de $f(x, y, z) = ${f}$ sujeta a la intersección del plano $${plane}$ y el cilindro $x^2 + y^2 = ${R2}$.`,
        rubric: [
          { text: `Plantea $\\nabla f = \\lambda\\nabla g + \\mu\\nabla h$ con $g = ${H.poly([[p, "x"], [q, "y"], [1, "z"]])}$, $h = x^2 + y^2$: $(${a}, ${b}, ${c}) = \\lambda(${p}, ${q}, 1) + \\mu(2x, 2y, 0)$, más las dos restricciones.`, w: 3 },
          { text: `De la tercera, $\\lambda = ${c}$; entonces $(x, y) \\parallel (${Ap}, ${Bp})$ y, con el cilindro, $(x, y) = \\pm\\frac{${Rr}}{\\sqrt{${M}}}(${Ap}, ${Bp})$.`, w: 3 },
          { text: `Máximo $${c * d} + ${ksq(Rr, M)} \\approx ${nf(H, fmax)}$ y mínimo $${c * d} - ${ksq(Rr, M)} \\approx ${nf(H, fmin)}$, con sus puntos.`, w: 4 }
        ],
        solution: [
          `Las restricciones son $g = ${H.poly([[p, "x"], [q, "y"], [1, "z"]])} = ${d}$ y $h = x^2 + y^2 = ${R2}$; su intersección es una elipse (cerrada y acotada), así que $f$ alcanza un máximo y un mínimo. En ellos, $\\nabla f = \\lambda\\nabla g + \\mu\\nabla h$:`,
          `$${a} = \\lambda\\cdot${H.par(p)} + 2\\mu x$, $${b} = \\lambda\\cdot${H.par(q)} + 2\\mu y$, $${c} = \\lambda$. Reemplazando $\\lambda = ${c}$: $2\\mu x = ${Ap}$ y $2\\mu y = ${Bp}$, así que $(x, y)$ es paralelo a $(${Ap}, ${Bp})$.`,
          `Con $x^2 + y^2 = ${R2}$: $(x, y) = \\pm\\frac{${Rr}}{\\sqrt{${M}}}(${Ap}, ${Bp})$, y $z = ${d} - (${H.poly([[p, "x"], [q, "y"]])})$ del plano.`,
          `Puntos: $\\approx (${pt(1).map(x => nf(H, x)).join(", ")})$, con $f = ${c * d} + ${ksq(Rr, M)} \\approx ${nf(H, fmax)}$ (máximo), y $\\approx (${pt(-1).map(x => nf(H, x)).join(", ")})$, con $f = ${c * d} - ${ksq(Rr, M)} \\approx ${nf(H, fmin)}$ (mínimo).`
        ],
        // otro camino: se recorre la elipse con un parámetro y se buscan el máximo y el mínimo de f
        verify: { kind: "zero", tol: 1e-6, fn: () => {
          let mx = -1e9, mn = 1e9;
          for (let i = 0; i < 20000; i++) { const t = 2 * Math.PI * i / 20000, x = Rr * Math.cos(t), y = Rr * Math.sin(t), z = d - p * x - q * y, v = a * x + b * y + c * z; mx = Math.max(mx, v); mn = Math.min(mn, v); }
          return [(mx - fmax) / Math.max(1, Math.abs(fmax)), (mn - fmin) / Math.max(1, Math.abs(fmin))];
        } }
      };
    }
  };

  // Lagrange con una restricción: función lineal sobre una circunferencia
  SELF["c2-ex-lagrange1"] = {
    concepts: ["c2-lagrange"],
    generate(r, H) {
      const a = r.nz(-4, 4), b = r.nz(-4, 4), k = r.pick([1, 4]), s = Math.sqrt(k), R2 = k * (a * a + b * b), m = s * (a * a + b * b);
      return {
        prompt: `Determiná los valores extremos de $f(x, y) = ${H.poly([[a, "x"], [b, "y"]])}$ sujeta a la restricción $x^2 + y^2 = ${R2}$.`,
        rubric: [
          { text: `Plantea $\\nabla f = \\lambda\\nabla g$: $${a} = 2\\lambda x$, $${b} = 2\\lambda y$ y $x^2 + y^2 = ${R2}$.`, w: 3 },
          { text: `De ahí $(x, y) = \\frac{1}{2\\lambda}(${a}, ${b})$ y, con la restricción, $(x, y) = \\pm${s === 1 ? "" : s}(${a}, ${b})$.`, w: 4 },
          { text: `Máximo $f(${s * a}, ${s * b}) = ${m}$ y mínimo $f(${-s * a}, ${-s * b}) = ${-m}$.`, w: 3 }
        ],
        solution: [
          R`La circunferencia es cerrada y acotada y $f$ es continua: tiene máximo y mínimo sobre ella. En esos puntos los gradientes son paralelos: $\nabla f = \lambda\nabla g$, con $g = x^2 + y^2$.`,
          `$(${a}, ${b}) = \\lambda(2x, 2y)$, así que $x = \\frac{${a}}{2\\lambda}$ e $y = \\frac{${b}}{2\\lambda}$. Reemplazando en la restricción: $\\frac{${a * a + b * b}}{4\\lambda^2} = ${R2}$, de donde $\\frac{1}{2\\lambda} = \\pm${s === 1 ? "1" : s}$.`,
          `Puntos $(${s * a}, ${s * b})$ y $(${-s * a}, ${-s * b})$: $f = ${m}$ (máximo) y $f = ${-m}$ (mínimo).`
        ],
        verify: { kind: "zero", tol: 1e-6, fn: () => {
          let mx = -1e9, mn = 1e9;
          for (let i = 0; i < 20000; i++) { const t = 2 * Math.PI * i / 20000, v = Math.sqrt(R2) * (a * Math.cos(t) + b * Math.sin(t)); mx = Math.max(mx, v); mn = Math.min(mn, v); }
          return [(mx - m) / m, (mn + m) / m];
        } }
      };
    }
  };

  // campo conservativo: potencial, rotacional y divergencia
  SELF["c2-ex-campo"] = {
    concepts: ["c2-campos", "c2-linea"],
    generate(r, H) {
      const bank = [
        { phi: "ye^{x}", P: [[1, "ye^{x}"]], Q: [[1, "e^{x}"]], lap: [[1, "ye^{x}"]], f: (x, y) => y * Math.exp(x), l: (x, y) => y * Math.exp(x) },
        { phi: R`x\operatorname{sen} y`, P: [[1, R`\operatorname{sen} y`]], Q: [[1, R`x\cos y`]], lap: [[-1, R`x\operatorname{sen} y`]], f: (x, y) => x * Math.sin(y), l: (x, y) => -x * Math.sin(y) },
        { phi: "x^{2}y", P: [[2, "xy"]], Q: [[1, "x^{2}"]], lap: [[2, "y"]], f: (x, y) => x * x * y, l: (x, y) => 2 * y },
        { phi: "xy^{3}", P: [[1, "y^{3}"]], Q: [[3, "xy^{2}"]], lap: [[6, "xy"]], f: (x, y) => x * y ** 3, l: (x, y) => 6 * x * y },
        { phi: R`e^{x}\cos y`, P: [[1, R`e^{x}\cos y`]], Q: [[-1, R`e^{x}\operatorname{sen} y`]], lap: [], f: (x, y) => Math.exp(x) * Math.cos(y), l: () => 0 }
      ];
      const [t1, t2] = r.sample(bank, 2), c1 = r.pick([1, 2, 3, -1, -2]), c2 = r.pick([1, 2, 3, -1, -2]);
      const comb = key => [...t1[key].map(([c, m]) => [c * c1, m]), ...t2[key].map(([c, m]) => [c * c2, m])];
      const Pt = H.poly(comb("P")), Qt = H.poly(comb("Q")), phiT = H.poly([[c1, t1.phi], [c2, t2.phi]]), lapT = H.poly(comb("lap"));
      const phi = (x, y) => c1 * t1.f(x, y) + c2 * t2.f(x, y), lap = (x, y) => c1 * t1.l(x, y) + c2 * t2.l(x, y);
      return {
        prompt: `Dado el campo $\\vec F(x, y) = \\left(${Pt}\\right)\\vec i + \\left(${Qt}\\right)\\vec j$: a) determiná si es conservativo y, si lo es, hallá una función potencial; b) calculá el rotacional de $\\vec F$ e interpretá el resultado; c) calculá la divergencia de $\\vec F$ y encontrá un punto donde el flujo neto del campo sea nulo.`,
        rubric: [
          { text: R`a) $\frac{\partial Q}{\partial x} = \frac{\partial P}{\partial y}$ en todo el plano (simplemente conexo): es conservativo.`, w: 3 },
          { text: `a) $\\varphi(x, y) = ${phiT} + C$ (integrando $P$ en $x$ y ajustando con $Q$).`, w: 3 },
          { text: R`b) $\nabla\times\vec F = \left(\frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y}\right)\vec k = \vec 0$: el campo es irrotacional (no hace girar; la circulación por curvas cerradas es nula).`, w: 2 },
          { text: `c) $\\nabla\\cdot\\vec F = ${lapT}$; en el origen vale $0$: ahí el flujo neto (por unidad de área) es nulo.`, w: 2 }
        ],
        solution: [
          `a) Con $P = ${Pt}$ y $Q = ${Qt}$, las derivadas cruzadas coinciden: $\\frac{\\partial P}{\\partial y} = \\frac{\\partial Q}{\\partial x}$. Como el dominio es todo el plano, el campo es conservativo.`,
          `Integrando $P$ respecto de $x$ se obtiene $\\varphi = ${phiT} + g(y)$; derivando respecto de $y$ y comparando con $Q$ resulta $g'(y) = 0$. Potencial: $\\varphi(x, y) = ${phiT} + C$. (Chequeo: $\\nabla\\varphi = \\vec F$.)`,
          R`b) Para un campo plano, $\nabla\times\vec F = \left(\frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y}\right)\vec k = \vec 0$. Un campo gradiente es irrotacional: una ruedita de paletas puesta en el campo no gira, y la integral de línea por cualquier curva cerrada es $0$.`,
          `c) $\\nabla\\cdot\\vec F = \\frac{\\partial P}{\\partial x} + \\frac{\\partial Q}{\\partial y} = ${lapT}$ (es el laplaciano del potencial). En $(0, 0)$ vale $0$: en ese punto no hay fuente ni sumidero, y el flujo neto por unidad de área es nulo.`
        ],
        // otro camino: derivadas numéricas del potencial y del campo
        verify: { kind: "zero", tol: 1e-5, fn: () => {
          const h = 1e-5, res = [], Pf = (x, y) => (phi(x + h, y) - phi(x - h, y)) / (2 * h), Qf = (x, y) => (phi(x, y + h) - phi(x, y - h)) / (2 * h);
          // P y Q de los textos, evaluados con las mismas derivadas del banco
          const der = { "ye^{x}": [(x, y) => y * Math.exp(x), (x, y) => Math.exp(x)], [R`x\operatorname{sen} y`]: [(x, y) => Math.sin(y), (x, y) => x * Math.cos(y)], "x^{2}y": [(x, y) => 2 * x * y, (x, y) => x * x], "xy^{3}": [(x, y) => y ** 3, (x, y) => 3 * x * y * y], [R`e^{x}\cos y`]: [(x, y) => Math.exp(x) * Math.cos(y), (x, y) => -Math.exp(x) * Math.sin(y)] };
          const Pc = (x, y) => c1 * der[t1.phi][0](x, y) + c2 * der[t2.phi][0](x, y), Qc = (x, y) => c1 * der[t1.phi][1](x, y) + c2 * der[t2.phi][1](x, y);
          for (const [x, y] of [[0.3, -0.7], [1.1, 0.4], [-0.5, 1.3]]) {
            res.push(Pf(x, y) - Pc(x, y), Qf(x, y) - Qc(x, y));
            const curl = (Qc(x + h, y) - Qc(x - h, y)) / (2 * h) - (Pc(x, y + h) - Pc(x, y - h)) / (2 * h);
            const div = (Pc(x + h, y) - Pc(x - h, y)) / (2 * h) + (Qc(x, y + h) - Qc(x, y - h)) / (2 * h);
            res.push(curl, div - lap(x, y));
          }
          res.push((Pc(h, 0) - Pc(-h, 0)) / (2 * h) + (Qc(0, h) - Qc(0, -h)) / (2 * h));
          return res;
        } }
      };
    }
  };

  // teorema de Green en una circunferencia
  T["c2-ex-green-circ-num"] = {
    type: "numeric", concepts: ["c2-green"], difficulty: 2,
    generate(r, H) {
      const a = r.int(-6, 6), b = r.int(-3, 3), c = r.int(-3, 3), d = r.int(-6, 6), h = r.int(-3, 3), k = r.int(-3, 3), Rr = r.int(1, 4), ccw = r.bool();
      if (a === d) return null;
      const val = (ccw ? 1 : -1) * (d - a) * Math.PI * Rr * Rr;
      return {
        prompt: `Evaluá $\\displaystyle\\oint_C (${H.poly([[a, "y"], [b, "x"]])})\\,dx + (${H.poly([[c, "y"], [d, "x"]])})\\,dy$, donde $C$ es la circunferencia $${h === 0 ? "x^2" : `(${H.xm(h, "x")})^2`} + ${k === 0 ? "y^2" : `(${H.xm(k, "y")})^2`} = ${Rr * Rr}$ recorrida en sentido ${ccw ? "antihorario" : "horario"}.`,
        answer: val,
        solution: [`Por el teorema de Green (sentido antihorario): $\\oint_C P\\,dx + Q\\,dy = \\iint_D \\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right)dA = \\iint_D (${d} - ${H.par(a)})\\,dA$.`,
          `El integrando es constante: queda $${d - a}$ por el área del disco, $\\pi\\cdot${Rr * Rr}$. ${ccw ? "" : "Como el recorrido es horario, cambia el signo. "}Resultado: $${ccw ? "" : "-"}${d - a === 1 ? "" : d - a === -1 ? "-" : d - a}${Rr * Rr === 1 ? "" : Rr * Rr}\\pi \\approx ${nf(H, val)}$.`.replace("--", "")],
        // otro camino: integral de línea con la parametrización de la circunferencia
        verify: { kind: "value", tol: 1e-8, fn: () => {
          const N = 2000; let s = 0;
          for (let i = 0; i < N; i++) { const t = 2 * Math.PI * i / N * (ccw ? 1 : -1), x = h + Rr * Math.cos(t), y = k + Rr * Math.sin(t), dx = -Rr * Math.sin(t) * (ccw ? 1 : -1), dy = Rr * Math.cos(t) * (ccw ? 1 : -1); s += ((a * y + b * x) * dx + (c * y + d * x) * dy) * 2 * Math.PI / N; }
          return s;
        } }
      };
    }
  };

  // flujo hacia afuera de la región entre dos esferas (teorema de la divergencia)
  T["c2-ex-flujo-esferas-num"] = {
    type: "numeric", concepts: ["c2-flujo"], difficulty: 3, testN: 60,
    generate(r, H) {
      const m = r.int(1, 3), g = r.int(0, m), be = 3 * m - 3 * g, [r1s, r2s] = r.pick([[1, 2], [1, 4], [2, 4], [1, 9], [4, 9]]);
      const R1 = Math.sqrt(r1s), R2 = Math.sqrt(r2s), val = 3 * m * 4 * Math.PI * (R2 ** 5 - R1 ** 5) / 5;
      const F1 = H.poly([[m, "x^{3}"], [be, "xy^{2}"]]), F2 = H.poly([[g, "y^{3}"], [1, R`e^{y}\operatorname{sen} z`]]), F3 = H.poly([[m, "z^{3}"], [1, R`e^{y}\cos z`]]);
      return {
        prompt: `Calculá el flujo de $\\vec F(x, y, z) = \\left(${F1}\\right)\\vec i + \\left(${F2}\\right)\\vec j + \\left(${F3}\\right)\\vec k$ hacia afuera a través de la frontera de la región sólida $D$ entre las esferas $x^2 + y^2 + z^2 = ${r1s}$ y $x^2 + y^2 + z^2 = ${r2s}$.`,
        answer: val,
        solution: [`$\\nabla\\cdot\\vec F = (${H.poly([[3 * m, "x^{2}"], [be, "y^{2}"]])}) + (${H.poly([[3 * g, "y^{2}"], [1, R`e^{y}\operatorname{sen} z`]])}) + (${H.poly([[3 * m, "z^{2}"], [-1, R`e^{y}\operatorname{sen} z`]])}) = ${3 * m}(x^2 + y^2 + z^2)$.`,
          `Por el teorema de la divergencia, el flujo es $\\iiint_D ${3 * m}\\rho^2\\,dV$. En esféricas: $${3 * m}\\int_0^{2\\pi}\\int_0^{\\pi}\\int_{${R1 === 1 ? 1 : Number.isInteger(R1) ? R1 : `\\sqrt{${r1s}}`}}^{${Number.isInteger(R2) ? R2 : `\\sqrt{${r2s}}`}} \\rho^4\\operatorname{sen}\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta = ${3 * m}\\cdot 4\\pi\\cdot\\frac{\\rho^5}{5}\\Big|_{${Number.isInteger(R1) ? R1 : `\\sqrt{${r1s}}`}}^{${Number.isInteger(R2) ? R2 : `\\sqrt{${r2s}}`}} \\approx ${nf(H, val, 2)}$.`],
        // otro camino: integral de superficie sobre las dos esferas (la de adentro con la normal hacia el centro)
        verify: { kind: "value", tol: 1e-4, fn: () => {
          const Fv = (x, y, z) => [m * x ** 3 + be * x * y * y, g * y ** 3 + Math.exp(y) * Math.sin(z), m * z ** 3 + Math.exp(y) * Math.cos(z)];
          const flux = Rr => { const nt = 300, np = 300; let s = 0; for (let i = 0; i < nt; i++) { const th = (i + 0.5) * Math.PI / nt; for (let j = 0; j < np; j++) { const ph = (j + 0.5) * 2 * Math.PI / np, n = [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)], F = Fv(Rr * n[0], Rr * n[1], Rr * n[2]); s += (F[0] * n[0] + F[1] * n[1] + F[2] * n[2]) * Rr * Rr * Math.sin(th) * (Math.PI / nt) * (2 * Math.PI / np); } } return s; };
          return flux(R2) - flux(R1);
        } }
      };
    }
  };

  // volumen entre un cono y una superficie z = √(A − B(x² + y²))
  T["c2-ex-vol-cono-num"] = {
    type: "numeric", concepts: ["c2-dobles"], difficulty: 3,
    generate(r, H) {
      const m = r.pick([1, 2, 3]), A = r.pick([4, 9, 16]), B = r.pick([1, 2, 3]);
      const r02 = A / (m * m + B), r0 = Math.sqrt(r02), V = 2 * Math.PI * ((A ** 1.5 - (A - B * r02) ** 1.5) / (3 * B) - m * r0 ** 3 / 3);
      return {
        prompt: `Calculá el volumen de la región limitada por las gráficas de $f(x, y) = ${H.cf(m)}\\sqrt{x^2 + y^2}$ y $g(x, y) = \\sqrt{${A} - ${B === 1 ? "" : B}(x^2 + y^2)}$.`,
        answer: V,
        solution: [`Las superficies se cortan donde $${m * m}r^2 = ${A} - ${B}r^2$, o sea en $r^2 = ${H.frac(A, m * m + B)}$. Adentro de ese círculo $g \\ge f$.`,
          `En polares: $V = \\int_0^{2\\pi}\\int_0^{r_0} \\left(\\sqrt{${A} - ${B}r^2} - ${m}r\\right)r\\,dr\\,d\\theta = 2\\pi\\left[-\\frac{(${A} - ${B}r^2)^{3/2}}{${3 * B}} - \\frac{${m}r^3}{3}\\right]_0^{r_0} \\approx ${nf(H, V)}$.`],
        // otro camino: integral numérica (Simpson) de la altura por la longitud de cada circunferencia
        verify: { kind: "value", tol: 1e-7, fn: () => simpson(rr => 2 * Math.PI * rr * (Math.sqrt(A - B * rr * rr) - m * rr), 0, r0, 2000) }
      };
    }
  };

  E.registerExams("m102", {
    self: SELF,
    templates: T,
    exams: [
      { id: "p1", kind: "parcial", title: "1.er parcial", topics: "Series de potencias, funciones vectoriales, límites en varias variables y superficies", minutes: 120, pass: 60,
        items: [
          { any: [
            { title: "Sucesiones y series", parts: [{ self: "c2-ex-binomial", pts: 20 }] },
            { title: "Series de potencias", parts: [{ tpl: "c2-taylor-num", pts: 10 }, { tpl: "c2-radio-num", pts: 10 }] }
          ] },
          { title: "Funciones vectoriales: rectas tangentes", parts: [{ self: "c2-ex-tangentes", pts: 20 }] },
          { any: [
            { title: "Funciones vectoriales: T y N", parts: [{ self: "c2-ex-tn", pts: 20 }] },
            { title: "Funciones vectoriales: curvatura y aceleración", parts: [{ tpl: "c2-curvatura-num", pts: 10 }, { tpl: "c2-aceleracion-num", pts: 10 }] }
          ] },
          { any: [
            { title: "Funciones de varias variables: límite y continuidad", parts: [{ self: "c2-ex-limite", pts: 20 }] },
            { title: "Funciones de varias variables", parts: [{ tpl: "c2-limite-vf", pts: 10 }, { tpl: "c2-parcial-num", pts: 10 }] }
          ] },
          { any: [
            { title: "Superficies: trazas", parts: [{ self: "c2-ex-trazas", pts: 20 }] },
            { title: "Superficies y coordenadas", parts: [{ tpl: "c2-cuadrica-mc", pts: 10 }, { tpl: "c2-coord-num", pts: 10 }] }
          ] }
        ] },
      { id: "p2", kind: "parcial", title: "2.º parcial", topics: "Derivadas direccionales, plano tangente, extremos e integración múltiple", minutes: 120, pass: 60,
        items: [
          { any: [
            { title: "Derivada direccional", parts: [{ tpl: "c2-ex-dir-angulo-num", pts: 20 }] },
            { title: "Derivada direccional y gradiente", parts: [{ tpl: "c2-direccional-num", pts: 10 }, { tpl: "c2-gradiente-num", pts: 10 }] }
          ] },
          { any: [
            { title: "Plano tangente y recta normal", parts: [{ self: "c2-ex-tg-normal", pts: 20 }] },
            { title: "Plano tangente", parts: [{ tpl: "c2-ex-tg-eje-vf", pts: 10 }, { tpl: "c2-plano-tangente-num", pts: 10 }] }
          ] },
          { title: "Puntos críticos", parts: [{ self: "c2-ex-criticos", pts: 20 }] },
          { any: [
            { title: "Integral doble: área y volumen", parts: [{ self: "c2-ex-triangulo", pts: 20 }] },
            { title: "Integrales dobles", parts: [{ tpl: "c2-region-num", pts: 10 }, { tpl: "c2-iterada-num", pts: 10 }] }
          ] },
          { any: [
            { title: "Integral triple con cambio de variables", parts: [{ self: "c2-ex-cambio-var", pts: 20 }] },
            { title: "Integrales triples y jacobianos", parts: [{ tpl: "c2-jacobiano-num", pts: 10 }, { tpl: "c2-triple-num", pts: 10 }] }
          ] }
        ] },
      { id: "final", kind: "final", title: "Final", topics: "Varias variables (gradiente, Lagrange, plano tangente) y análisis vectorial (campos conservativos, Green y divergencia).", minutes: 150, pass: 60,
        items: [
          { any: [
            { title: "Gradiente: temperatura en un cerro", parts: [{ self: "c2-ex-gradiente-temp", pts: 20 }] },
            { title: "Plano tangente (V/F) y gradiente", parts: [{ tpl: "c2-ex-tg-eje-vf", pts: 10 }, { tpl: "c2-gradiente-num", pts: 10 }] }
          ] },
          { title: "Multiplicadores de Lagrange", parts: [{ any: [{ self: "c2-ex-lagrange2" }, { self: "c2-ex-lagrange1" }], pts: 20 }] },
          { title: "Campos vectoriales", parts: [{ self: "c2-ex-campo", pts: 20 }] },
          { title: "Teorema de Green o volumen", parts: [{ any: [{ tpl: "c2-ex-green-circ-num" }, { tpl: "c2-ex-vol-cono-num" }], pts: 20 }] },
          { title: "Teorema de la divergencia", parts: [{ tpl: "c2-ex-flujo-esferas-num", pts: 20 }] }
        ] }
    ]
  });
})();

/* ===== M102 · Examen Extra UBA =====
   Temas de Análisis I de la Lic. en Cs. Físicas (FCEN, UBA) con más rigor que el programa de M102: límites y
   diferenciabilidad por definición, Taylor e implícita, extremos absolutos e integrales impropias dobles.
   Enunciados propios y datos sorteados. */
(function () {
  const E = window.Efecen, H = E.H;
  const SELF = {};
  const nd = (x, d = 4) => String(H.num(x, d)).replace(".", "{,}");
  const simpson = (f, a, b, n = 300) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3; };
  const line = (g, n = 240) => simpson(u => { const c = Math.cos(u); return c < 1e-12 ? 0 : g(Math.tan(u)) / (c * c); }, -Math.PI / 2, Math.PI / 2, n);

  SELF["c2-ex-diferenciable"] = {
    concepts: ["c2-diferenciabilidad"],
    generate(r) {
      const [p, q] = r.pick([[2, 1], [1, 2]]), c = r.nz(-4, 4), deg = r.pick([30, 45, 60, 120, 135, 150]), th = deg * Math.PI / 180;
      const f = (x, y) => (x === 0 && y === 0 ? 0 : c * x ** p * y ** q / (x * x + y * y)), Du = c * Math.cos(th) ** p * Math.sin(th) ** q;
      const num = `${c === 1 ? "" : c === -1 ? "-" : c}${p === 2 ? "x^2y" : "xy^2"}`;
      return {
        prompt: `Sea $f(x, y) = \\dfrac{${num}}{x^2 + y^2}$ si $(x, y) \\ne (0, 0)$ y $f(0, 0) = 0$.<br>a) Probá que $f$ es continua en el origen.<br>b) Calculá por definición $f_x(0, 0)$ y $f_y(0, 0)$.<br>c) Calculá por definición la derivada direccional en el origen en la dirección que forma $${deg}^\\circ$ con el eje $x$.<br>d) ¿Es $f$ diferenciable en el origen? Justificá.`,
        rubric: [
          { text: `a) En polares, $|f| = ${Math.abs(c)}\\,r\\,|\\cos^${p}\\theta\\sin^${q}\\theta| \\le ${Math.abs(c)}r \\to 0$: es continua ([[c2-limites-rigor|límite por acotación]]).`, w: 2 },
          { text: `b) Sobre los ejes $f$ vale 0, así que $f_x(0, 0) = \\lim_{h\\to0}\\frac{f(h, 0) - 0}{h} = 0$ y $f_y(0, 0) = 0$.`, w: 2 },
          { text: `c) Con $u = (\\cos\\theta, \\sin\\theta)$: $\\frac{f(tu)}{t} = ${c}\\cos^${p}\\theta\\sin^${q}\\theta$, que no depende de $t$: $D_uf(0, 0) \\approx ${nd(Du)}$.`, w: 3 },
          { text: `d) Si fuera [[c2-diferenciabilidad|diferenciable]], valdría $D_uf = \\nabla f\\cdot u = 0$ en toda dirección. Como en $${deg}^\\circ$ da $${nd(Du)} \\ne 0$, no es diferenciable (aunque tenga parciales y sea continua).`, w: 3 }
        ],
        solution: [`Es el ejemplo típico: continua, con todas las derivadas direccionales, pero sin plano tangente, porque $u \\mapsto D_uf$ no es lineal.`,
          `$D_uf(0, 0) = ${c}\\cos^${p}(${deg}^\\circ)\\sin^${q}(${deg}^\\circ) \\approx ${nd(Du)}$.`],
        // otro camino: cocientes incrementales numéricos con t chico
        verify: { kind: "zero", tol: 1e-6, fn: () => { const t = 1e-7; return [f(t, 0) / t, f(0, t) / t, f(t * Math.cos(th), t * Math.sin(th)) / t - Du, f(1e-10, 1e-10) * 1e3]; } }
      };
    }
  };

  SELF["c2-ex-gauss-cuadratica"] = {
    concepts: ["c2-gauss-integral", "c2-impropias-dobles"],
    generate(r) {
      let a, b, c;
      do { a = r.int(1, 5); c = r.int(1, 5); b = r.nz(-3, 3); } while (a * c - b * b <= 0);
      const D = a * c - b * b, I = Math.PI / Math.sqrt(D);
      return {
        prompt: `a) Calculá $\\int_{-\\infty}^{\\infty}e^{-x^2}dx$ pasando a una integral doble en polares, y justificá cada paso.<br>b) Usando a), calculá $\\displaystyle\\iint_{\\mathbb R^2}e^{-(${a === 1 ? "" : a}x^2 ${b > 0 ? "+" : "-"} ${2 * Math.abs(b)}xy + ${c === 1 ? "" : c}y^2)}\\,dA$.`,
        rubric: [
          { text: `a) $I^2 = \\iint_{\\mathbb R^2}e^{-(x^2 + y^2)}dA$ por Fubini (el integrando es positivo, la [[c2-impropias-dobles|integral impropia doble]] se puede calcular con discos). En polares: $\\int_0^{2\\pi}\\int_0^\\infty e^{-r^2}r\\,dr\\,d\\theta = \\pi$, así que $I = \\sqrt\\pi$.`, w: 4 },
          { text: `b) Completando cuadrados en $x$: $${a}x^2 ${b > 0 ? "+" : "-"} ${2 * Math.abs(b)}xy + ${c}y^2 = ${a}\\left(x ${b > 0 ? "+" : "-"} \\frac{${Math.abs(b)}}{${a}}y\\right)^2 + \\frac{${D}}{${a}}y^2$.`, w: 3 },
          { text: `La integral en $x$ da $\\sqrt{\\frac{\\pi}{${a}}}$ (la [[c2-gauss-integral|integral de Gauss]] no cambia al correrla), y la de $y$, $\\sqrt{\\frac{${a}\\pi}{${D}}}$. Total: $\\frac{\\pi}{\\sqrt{${D}}} \\approx ${nd(I)}$.`, w: 3 }
        ],
        solution: [`En general, $\\iint e^{-(ax^2 + 2bxy + cy^2)}dA = \\frac{\\pi}{\\sqrt{ac - b^2}}$ si la forma es definida positiva ($a > 0$, $ac - b^2 > 0$).`,
          `Con los datos, $ac - b^2 = ${D}$ y el resultado es $\\approx ${nd(I)}$.`],
        // otro camino: Simpson doble en cartesianas, con x = tan u e y = tan v
        verify: { kind: "zero", tol: 1e-5, fn: () => [line(x => line(y => Math.exp(-(a * x * x + 2 * b * x * y + c * y * y)))) / I - 1] }
      };
    }
  };

  E.registerExams("m102", {
    self: SELF,
    exams: [
      { id: "uba", kind: "parcial", title: "Examen Extra UBA", topics: "Temas de Análisis I de la UBA con más rigor que el programa: límites y diferenciabilidad por definición, Taylor de orden 2, función implícita, extremos absolutos e integrales impropias dobles.", minutes: 180, pass: 60,
        items: [
          { title: "Diferenciabilidad por definición", parts: [{ self: "c2-ex-diferenciable", pts: 20 }] },
          { title: "Integral de Gauss", parts: [{ self: "c2-ex-gauss-cuadratica", pts: 20 }] },
          { any: [
            { title: "Límites dobles", parts: [{ tpl: "c2-limcamino-num", pts: 12 }, { tpl: "c2-limexiste-mc", pts: 8 }] },
            { title: "Derivadas direccionales", parts: [{ tpl: "c2-direccional-def-num", pts: 12 }, { tpl: "c2-dif-vf", pts: 8 }] }
          ] },
          { any: [
            { title: "Taylor y función implícita", parts: [{ tpl: "c2-taylor2-num", pts: 12 }, { tpl: "c2-implicita-num", pts: 8 }] },
            { title: "Extremos absolutos y regla de la cadena", parts: [{ tpl: "c2-extabs-num", pts: 12 }, { tpl: "c2-cadena2-num", pts: 8 }] }
          ] },
          { any: [
            { title: "Integrales impropias dobles", parts: [{ tpl: "c2-impdoble-num", pts: 12 }, { tpl: "c2-impconv-mc", pts: 8 }] },
            { title: "Gauss y convergencia", parts: [{ tpl: "c2-gauss-num", pts: 12 }, { tpl: "c2-impdoble-vf", pts: 8 }] }
          ] }
        ] }
    ]
  });
})();
