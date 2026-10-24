/*
 * M106 · Geometría Analítica — Lic. en Ciencias Básicas (FCEN, UNCuyo), Plan Ord. 77/15 C.S.
 * ==========================================================================================
 * Temario: programa oficial 2026 de Geometría Analítica (prof. Silvia Raichman), 6 unidades:
 *   1 Vectores y álgebra vectorial · 2 Planos y rectas · 3 Cónicas · 4 Superficies
 *   5 Coordenadas polares, cilíndricas y esféricas · 6 Ecuación general de segundo grado
 * Ids con prefijo "ga-". Todo el texto y los ejercicios son originales.
 */
(function () {
  window.Efecen.registerCourse({ id: "m106", code: "M106", title: "Geometría Analítica", icon: "grid-3x3" });
})();

/* =====================================================================
 *  UNIDAD 1 · VECTORES Y ÁLGEBRA VECTORIAL (repaso con aplicaciones)
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const T = {};
  const nd = (x, d = 4) => H.num(x, d).replace(".", "{,}");
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const sub = (a, b) => a.map((x, i) => x - b[i]);
  const add = (a, b, k = 1) => a.map((x, i) => x + k * b[i]);
  const scal = (a, k) => a.map(x => x * k);
  const norm = a => Math.sqrt(dot(a, a));
  const isZero = a => a.every(x => x === 0);
  const vec = (r, m = 4) => [r.int(-m, m), r.int(-m, m), r.int(-m, m)];
  const pt = p => `(${p.join(", ")})`;
  const AX = ["x", "y", "z"], GR = ["\\alpha", "\\beta", "\\gamma"];
  const DEG = Math.PI / 180;
  // raíz simplificada: 12 -> 2√3
  const rad = n => { let k = 1, m = n; for (let f = 2; f * f <= m; f++) while (m % (f * f) === 0) { m /= f * f; k *= f; } return { k, m }; };
  const sqrtTex = n => { const { k, m } = rad(n); return m === 1 ? String(k) : `${k === 1 ? "" : k}\\sqrt{${m}}`; };
  const halfSqrtTex = n => { const { k, m } = rad(n); if (m === 1) return H.frac(k, 2); if (k % 2 === 0) return `${k === 2 ? "" : k / 2}\\sqrt{${m}}`; return `\\frac{${k === 1 ? "" : k}\\sqrt{${m}}}{2}`; };

  // ---- verificadores independientes (no usan producto vectorial ni mixto) ----
  // área de un triángulo con la fórmula de Herón (versión estable numéricamente)
  const heron = (A, B, C) => {
    const [a, b, c] = [norm(sub(B, C)), norm(sub(A, C)), norm(sub(A, B))].sort((x, y) => y - x);
    return 0.25 * Math.sqrt(Math.max(0, (a + (b + c)) * (c - (a - b)) * (c + (a - b)) * (a + (b - c))));
  };
  // distancia de la punta de w al plano generado por u y v, ortonormalizando con Gram-Schmidt
  const gsHeight = (u, v, w) => {
    const e1 = scal(u, 1 / norm(u)), v2 = add(v, e1, -dot(v, e1)), e2 = scal(v2, 1 / norm(v2));
    return norm(add(add(w, e1, -dot(w, e1)), e2, -dot(w, e2)));
  };
  // eliminación de Gauss con pivoteo parcial
  const gaussSolve = (A, b) => {
    const n = A.length, M = A.map((row, i) => row.concat([b[i]]));
    for (let c = 0; c < n; c++) {
      let p = c; for (let i = c + 1; i < n; i++) if (Math.abs(M[i][c]) > Math.abs(M[p][c])) p = i;
      [M[c], M[p]] = [M[p], M[c]];
      for (let i = 0; i < n; i++) if (i !== c) { const f = M[i][c] / M[c][c]; for (let j = c; j <= n; j++) M[i][j] -= f * M[c][j]; }
    }
    return M.map((row, i) => row[n] / row[i]);
  };
  // mínimo de una función unimodal por sección áurea
  const golden = (f, a, b) => {
    const g = (Math.sqrt(5) - 1) / 2;
    let x1 = b - g * (b - a), x2 = a + g * (b - a), f1 = f(x1), f2 = f(x2);
    for (let i = 0; i < 200; i++) {
      if (f1 < f2) { b = x2; x2 = x1; f2 = f1; x1 = b - g * (b - a); f1 = f(x1); }
      else { a = x1; x1 = x2; f1 = f2; x2 = a + g * (b - a); f2 = f(x2); }
    }
    return (a + b) / 2;
  };

  // ---- cosenos directores con ángulos notables ----
  const ANG = [30, 45, 60, 90, 120, 135, 150], ANGZ = [0, 30, 45, 60, 90, 120, 135, 150, 180];
  const Q4 = a => Math.round(4 * Math.cos(a * DEG) ** 2);              // 4·cos²: 3, 2, 1, 0 o 4
  const COS = { 0: "1", 30: "\\frac{\\sqrt3}{2}", 45: "\\frac{\\sqrt2}{2}", 60: "\\frac12", 90: "0", 120: "-\\frac12", 135: "-\\frac{\\sqrt2}{2}", 150: "-\\frac{\\sqrt3}{2}", 180: "-1" };
  const SQ = ["0", "\\frac12", "\\frac{\\sqrt2}{2}", "\\frac{\\sqrt3}{2}", "1"];   // √(n/4)
  const PAIRS = [];
  for (const a of ANG) for (const b of ANG) if (Q4(a) + Q4(b) <= 4) PAIRS.push([a, b]);
  // vectores unitarios que forman α con el eje x: (cos α, sen α cos φ, sen α sen φ). Se busca φ para que el
  // ángulo con y sea β y se devuelven los dos vectores posibles (otra parametrización, sin la identidad de los cosenos)
  const fromAlphaBeta = (al, be) => {
    const sa = Math.sin(al * DEG), c = Math.cos(be * DEG) / sa;
    if (Math.abs(c) > 1 + 1e-12) return [];
    const ph = Math.acos(Math.max(-1, Math.min(1, c)));
    return [ph, -ph].map(p => [Math.cos(al * DEG), sa * Math.cos(p), sa * Math.sin(p)]);
  };
  const angleZ = v => Math.atan2(Math.hypot(v[0], v[1]), v[2]) / DEG;

  T["ga-cosdir-num"] = {
    type: "numeric", concepts: ["ga-cosenos-directores"], difficulty: 2,
    generate(r) {
      const kind = r.pick(["angulo", "angulo", "gamma", "comp"]);
      if (kind === "angulo") {
        const A = vec(r), B = vec(r), v = sub(B, A), i = r.int(0, 2), N = dot(v, v);
        if (isZero(v)) return null;
        const ans = Math.acos(v[i] / Math.sqrt(N)) / DEG;
        return {
          prompt: `¿Qué ángulo (en grados) forma el vector $\\overrightarrow{AB}$, con $A = ${pt(A)}$ y $B = ${pt(B)}$, con el semieje positivo de las $${AX[i]}$?`,
          answer: ans,
          solution: [`$\\overrightarrow{AB} = B - A = ${pt(v)}$, de módulo $|\\overrightarrow{AB}| = \\sqrt{${N}}$.`,
            `El [[ga-cosenos-directores|coseno director]] respecto del eje $${AX[i]}$ es esa componente dividida por el módulo: $\\cos${GR[i]} = \\frac{${v[i]}}{\\sqrt{${N}}}$.`,
            `$${GR[i]} = \\arccos\\left(\\frac{${v[i]}}{\\sqrt{${N}}}\\right) \\approx ${nd(ans, 2)}^\\circ$.${v[i] < 0 ? " Es obtuso porque la componente es negativa." : ""}`],
          // verificación: el ángulo con atan2(|v × e|, v·e), que no pasa por el coseno director
          verify: { kind: "value", tol: 1e-9, fn: () => { const e = [0, 0, 0]; e[i] = 1; return Math.atan2(norm(cross(v, e)), dot(v, e)) / DEG; } }
        };
      }
      const [al, be] = r.pick(PAIRS), n = 4 - Q4(al) - Q4(be), up = r.bool(), s = up ? 1 : -1;
      if (kind === "comp" && n === 0) return null;
      const cg = s * Math.sqrt(n) / 2, gam = Math.acos(cg) / DEG;
      const cgTex = n === 0 ? "0" : (s < 0 ? "-" : "") + SQ[n];
      const sol = [`Los [[ga-cosenos-directores|cosenos directores]] cumplen $\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1$.`,
        `$\\cos^2\\gamma = 1 - ${H.frac(Q4(al), 4)} - ${H.frac(Q4(be), 4)} = ${H.frac(n, 4)}$, así que $\\cos\\gamma = ${n === 0 ? "0" : "\\pm " + SQ[n]}$.`];
      if (n > 0) sol.push(`Como la componente $z$ es ${up ? "positiva" : "negativa"}, $\\cos\\gamma = ${cgTex}$.`);
      const sgnTxt = n === 0 ? "" : `, y su componente $z$ es ${up ? "positiva" : "negativa"}`;
      // verificación: se construye el vector con otra parametrización y se mide su ángulo con el eje z
      const cand = () => fromAlphaBeta(al, be).filter(v => n === 0 || Math.sign(v[2]) === s);
      if (kind === "gamma") {
        return {
          prompt: `Un vector forma un ángulo de $${al}^\\circ$ con el eje $x$ y de $${be}^\\circ$ con el eje $y$${sgnTxt}. ¿Qué ángulo (en grados) forma con el eje $z$?`,
          answer: Math.round(gam), answerTex: String(Math.round(gam)),
          solution: [...sol, `$\\gamma = ${Math.round(gam)}^\\circ$.`],
          verify: { kind: "value", tol: 1e-6, fn: () => angleZ(cand()[0]) }
        };
      }
      const m = r.pick([2, 4, 6, 8, 10]), ans = m * cg;
      return {
        prompt: `Un vector $\\vec v$ de módulo $${m}$ forma un ángulo de $${al}^\\circ$ con el eje $x$ y de $${be}^\\circ$ con el eje $y$${sgnTxt}. ¿Cuánto vale su componente $v_z$?`,
        answer: ans,
        solution: [...sol, `Cada componente es el módulo por su coseno director: $v_z = |\\vec v|\\cos\\gamma = ${m}\\cdot ${cgTex.startsWith("-") ? `\\left(${cgTex}\\right)` : cgTex} \\approx ${nd(ans)}$.`],
        verify: { kind: "value", tol: 1e-6, fn: () => m * cand()[0][2] }
      };
    }
  };

  T["ga-cosdir-vf"] = {
    type: "tf", concepts: ["ga-cosenos-directores"], difficulty: 2,
    generate(r) {
      const truth = r.bool();
      let al, be, ga;
      if (truth) { [al, be] = r.pick(PAIRS); const n = 4 - Q4(al) - Q4(be); ga = r.pick(ANGZ.filter(g => Q4(g) === n)); }
      else { al = r.pick(ANG); be = r.pick(ANG); ga = r.pick(ANGZ.filter(g => Q4(al) + Q4(be) + Q4(g) !== 4)); }
      const sum = Q4(al) + Q4(be) + Q4(ga);
      return {
        prompt: `<b>Verdadero o falso:</b> existe un vector que forma ángulos de $${al}^\\circ$, $${be}^\\circ$ y $${ga}^\\circ$ con los ejes $x$, $y$ y $z$, respectivamente.`,
        answer: sum === 4,
        explanation: `Los [[ga-cosenos-directores|ángulos directores]] de cualquier vector cumplen $\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1$. Acá la suma da $${H.frac(Q4(al), 4)} + ${H.frac(Q4(be), 4)} + ${H.frac(Q4(ga), 4)} = ${H.frac(sum, 4)}$, ${sum === 4 ? `así que sí existe: es el versor $\\left(${COS[al]}, ${COS[be]}, ${COS[ga]}\\right)$ (o cualquier múltiplo positivo).` : "que no es $1$: no hay ningún vector con esos ángulos."}`,
        solution: [`Los cosenos directores son las componentes del versor, y el versor tiene módulo $1$.`],
        // verificación: se construyen los unitarios con ángulo α con x y β con y (otra parametrización) y se mira su ángulo con z
        verify: { kind: "truth", fn: () => fromAlphaBeta(al, be).some(v => Math.abs(angleZ(v) - ga) < 1e-6) }
      };
    }
  };

  // ---- proyecciones y bases ortonormales ----
  const NICE = [[1, 2, 2], [2, 3, 6], [1, 4, 8], [2, 6, 9], [0, 3, 4], [4, 4, 7], [3, 4, 12], [0, 5, 12], [1, 1, 1]];
  const niceDir = r => { const b = r.pick(NICE), p = r.shuffle([0, 1, 2]); return [0, 1, 2].map(i => (r.bool() ? 1 : -1) * b[p[i]] || 0); };
  T["ga-proy-num"] = {
    type: "numeric", concepts: ["ga-proyeccion-eje"], difficulty: 2,
    generate(r) {
      const u = niceDir(r), A = vec(r), B = vec(r), w = sub(B, A), kind = r.pick(["esc", "esc", "perp"]);
      if (isZero(w)) return null;
      const U = dot(u, u), nu = Math.sqrt(U), p = dot(w, u) / nu, perp = Math.sqrt(Math.max(0, dot(w, w) - p * p));
      const ans = kind === "esc" ? p : perp, pTex = rad(U).m === 1 ? H.frac(dot(w, u), rad(U).k) : `\\frac{${dot(w, u)}}{${sqrtTex(U)}}`;
      return {
        prompt: `Sea $e$ el eje que pasa por el origen con la dirección y el sentido de $\\vec u = ${pt(u)}$, y sean $A = ${pt(A)}$, $B = ${pt(B)}$. Calculá ${kind === "esc" ? "la proyección (con signo) de $\\overrightarrow{AB}$ sobre el eje $e$" : "el módulo de la componente de $\\overrightarrow{AB}$ perpendicular al eje $e$"}.`,
        answer: ans,
        solution: [`$\\overrightarrow{AB} = ${pt(w)}$, $|\\vec u| = ${sqrtTex(U)}$ y $\\overrightarrow{AB}\\cdot\\vec u = ${dot(w, u)}$.`,
          `[[ga-proyeccion-eje|Proyección sobre el eje]]: $\\overrightarrow{AB}\\cdot\\hat u = \\frac{\\overrightarrow{AB}\\cdot\\vec u}{|\\vec u|} = ${pTex}${kind === "esc" ? ` \\approx ${nd(p)}` : ""}$.`,
          ...(kind === "perp" ? [`Por Pitágoras, la componente perpendicular mide $\\sqrt{|\\overrightarrow{AB}|^2 - (\\overrightarrow{AB}\\cdot\\hat u)^2} = \\sqrt{${dot(w, w)} - ${H.num(p * p, 4).replace(".", "{,}")}} \\approx ${nd(perp)}$.`] : [])],
        // verificación: se minimiza |AB − t·û| con sección áurea; el t óptimo es la proyección y el mínimo, la perpendicular
        verify: { kind: "value", tol: 1e-5, fn: () => {
          const f = t => { const d = add(w, u, -t / nu); return dot(d, d); }, t = golden(f, -60, 60);
          return kind === "esc" ? t : Math.sqrt(Math.max(0, f(t)));
        } }
      };
    }
  };

  // bases ortonormales con entradas racionales: filas de matrices ortogonales enteras divididas por k
  const ORTHO = [[[1, 2, 2], [2, 1, -2], [2, -2, 1], 3], [[2, 3, 6], [3, -6, 2], [6, 2, -3], 7], [[1, 4, 8], [4, 7, -4], [8, -4, 1], 9], [[2, 6, 9], [6, 7, -6], [9, -6, 2], 11]];
  T["ga-base-num"] = {
    type: "numeric", concepts: ["ga-proyeccion-eje"], difficulty: 2,
    generate(r) {
      const [r1, r2, r3, k] = r.pick(ORTHO), perm = r.shuffle([0, 1, 2]);
      const rows = r.shuffle([r1, r2, r3]).map(row => { const s = r.bool() ? 1 : -1; return perm.map(j => s * row[j] || 0); });
      const v = vec(r, 6), i = r.int(0, 2), num = dot(v, rows[i]);
      if (isZero(v)) return null;
      const eTex = j => `\\tfrac1{${k}}${pt(rows[j])}`;
      return {
        prompt: `Los vectores $\\hat e_1 = ${eTex(0)}$, $\\hat e_2 = ${eTex(1)}$ y $\\hat e_3 = ${eTex(2)}$ forman una base ortonormal. Si $\\vec v = ${pt(v)} = c_1\\hat e_1 + c_2\\hat e_2 + c_3\\hat e_3$, ¿cuánto vale $c_${i + 1}$?`,
        answer: num / k, answerTex: H.frac(num, k),
        solution: [`En una [[ga-proyeccion-eje|base ortonormal]] cada coordenada es una proyección: $c_j = \\vec v\\cdot\\hat e_j$ (no hace falta resolver un sistema).`,
          `$c_${i + 1} = \\frac1{${k}}\\big(${v.map((x, j) => `${H.par(x)}\\cdot${H.par(rows[i][j])}`).join(" + ")}\\big) = ${H.frac(num, k)}$.`],
        // verificación: se resuelve el sistema c₁ê₁ + c₂ê₂ + c₃ê₃ = v por eliminación de Gauss
        verify: { kind: "value", tol: 1e-9, fn: () => gaussSolve([0, 1, 2].map(a => [0, 1, 2].map(j => rows[j][a] / k)), v)[i] }
      };
    }
  };

  // ---- áreas, volúmenes y coplanaridad ----
  T["ga-areavol-num"] = {
    type: "numeric", concepts: ["ga-areas-volumenes"], difficulty: 2,
    generate(r) {
      const kind = r.pick(["tri", "par", "tetra", "paral", "altura"]);
      const A = vec(r, 3), B = vec(r, 3), C = vec(r, 3), D = vec(r, 3);
      const pts3 = kind === "tri" || kind === "tetra" || kind === "altura";
      const u = pts3 ? sub(B, A) : vec(r, 3), v = pts3 ? sub(C, A) : vec(r, 3), w = pts3 ? sub(D, A) : vec(r, 3);
      const n = cross(u, v), N = dot(n, n), M = dot(n, w);
      if (N === 0 || ((kind === "tetra" || kind === "paral" || kind === "altura") && M === 0)) return null;
      const uL = pts3 ? "\\overrightarrow{AB}" : "\\vec u", vL = pts3 ? "\\overrightarrow{AC}" : "\\vec v", wL = pts3 ? "\\overrightarrow{AD}" : "\\vec w";
      const P = { tri: `el área del triángulo de vértices $A = ${pt(A)}$, $B = ${pt(B)}$ y $C = ${pt(C)}$`,
        par: `el área del paralelogramo de lados $\\vec u = ${pt(u)}$ y $\\vec v = ${pt(v)}$`,
        tetra: `el volumen del tetraedro de vértices $A = ${pt(A)}$, $B = ${pt(B)}$, $C = ${pt(C)}$ y $D = ${pt(D)}$`,
        paral: `el volumen del paralelepípedo de aristas $\\vec u = ${pt(u)}$, $\\vec v = ${pt(v)}$ y $\\vec w = ${pt(w)}$`,
        altura: `la altura del tetraedro de vértices $A = ${pt(A)}$, $B = ${pt(B)}$, $C = ${pt(C)}$ y $D = ${pt(D)}$ medida desde $D$ (la distancia de $D$ al plano $ABC$)` }[kind];
      const { k, m } = rad(N);
      const ans = { tri: Math.sqrt(N) / 2, par: Math.sqrt(N), tetra: Math.abs(M) / 6, paral: Math.abs(M), altura: Math.abs(M) / Math.sqrt(N) }[kind];
      const aTex = { tri: halfSqrtTex(N), par: sqrtTex(N), tetra: H.frac(Math.abs(M), 6), paral: String(Math.abs(M)), altura: m === 1 ? H.frac(Math.abs(M), k) : `\\frac{${Math.abs(M)}}{${sqrtTex(N)}}` }[kind];
      const sol = [];
      if (pts3) sol.push(`Vectores desde $A$: $${uL} = ${pt(u)}$, $${vL} = ${pt(v)}$${kind === "tri" ? "" : `, $${wL} = ${pt(w)}$`}.`);
      sol.push(`$${uL}\\times ${vL} = ${pt(n)}$, de módulo $\\sqrt{${N}}${m !== N ? ` = ${sqrtTex(N)}` : ""}$.`);
      if (kind !== "tri" && kind !== "par") sol.push(`[[al-producto-vectorial|Producto mixto]]: $[${uL}, ${vL}, ${wL}] = (${uL}\\times ${vL})\\cdot ${wL} = ${M}$.`);
      sol.push({ tri: `[[ga-areas-volumenes|Área del triángulo]]: la mitad del paralelogramo, $\\frac12\\sqrt{${N}} = ${aTex} \\approx ${nd(ans)}$.`,
        par: `[[ga-areas-volumenes|Área del paralelogramo]]: $|\\vec u\\times\\vec v| = ${aTex} \\approx ${nd(ans)}$.`,
        tetra: `[[ga-areas-volumenes|Volumen del tetraedro]]: un sexto del paralelepípedo, $\\frac{|${M}|}{6} = ${aTex} \\approx ${nd(ans)}$.`,
        paral: `[[ga-areas-volumenes|Volumen del paralelepípedo]]: $|${M}| = ${aTex}$.`,
        altura: `Volumen del paralelepípedo sobre área de su base: $h = \\frac{|[${uL}, ${vL}, ${wL}]|}{|${uL}\\times ${vL}|} = ${aTex} \\approx ${nd(ans)}$ (es la [[ga-proyeccion-eje|proyección]] de $${wL}$ sobre la normal).` }[kind]);
      return {
        prompt: `Calculá ${P}.`,
        answer: ans, answerTex: aTex,
        solution: sol,
        // verificación: Herón para el área de la base y Gram-Schmidt para la altura (sin productos vectorial ni mixto)
        verify: { kind: "value", tol: 1e-7, fn: () => {
          const O = [0, 0, 0], base = heron(O, u, v);
          return { tri: base, par: 2 * base, tetra: base * gsHeight(u, v, w) / 3, paral: 2 * base * gsHeight(u, v, w), altura: gsHeight(u, v, w) }[kind];
        } }
      };
    }
  };

  const MED = ["\\text{área del paralelogramo de } \\vec u, \\vec v", "\\text{área del triángulo de } \\vec u, \\vec v", "\\text{volumen del paralelepípedo}", "\\text{volumen del tetraedro}"];
  T["ga-medidas-match"] = {
    type: "match", concepts: ["ga-areas-volumenes"], difficulty: 2,
    generate(r) {
      const u = vec(r, 3), v = vec(r, 3), w = vec(r, 3), n = cross(u, v), N = dot(n, n), M = Math.abs(dot(n, w));
      if (N === 0 || M === 0) return null;
      const vals = [Math.sqrt(N), Math.sqrt(N) / 2, M, M / 6];
      for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) if (Math.abs(vals[i] - vals[j]) < 1e-9) return null;
      const texs = [sqrtTex(N), halfSqrtTex(N), String(M), H.frac(M, 6)];
      return {
        prompt: `Con $\\vec u = ${pt(u)}$, $\\vec v = ${pt(v)}$ y $\\vec w = ${pt(w)}$ (el paralelepípedo y el tetraedro son los de aristas $\\vec u, \\vec v, \\vec w$ desde un mismo vértice), uní cada valor con lo que mide.`,
        pairs: [0, 1, 2, 3].map(i => [{ tex: texs[i] }, { tex: MED[i] }]),
        solution: [`$\\vec u\\times\\vec v = ${pt(n)}$, con módulo $${sqrtTex(N)}$: es el [[ga-areas-volumenes|área del paralelogramo]], y el triángulo tiene la mitad.`,
          `$[\\vec u, \\vec v, \\vec w] = (\\vec u\\times\\vec v)\\cdot\\vec w = ${dot(n, w)}$: en valor absoluto es el volumen del paralelepípedo, y el del tetraedro es un sexto.`],
        // verificación: Herón y Gram-Schmidt recalculan los cuatro valores
        verify: { kind: "truth", target: true, fn: () => {
          const b = heron([0, 0, 0], u, v), h = gsHeight(u, v, w), ref = [2 * b, b, 2 * b * h, b * h / 3];
          return ref.every((x, i) => Math.abs(x - vals[i]) < 1e-7 * Math.max(1, x));
        } }
      };
    }
  };

  T["ga-coplanar-num"] = {
    type: "numeric", concepts: ["ga-coplanaridad"], difficulty: 2,
    generate(r) {
      const kind = r.pick(["vec", "pts"]), s = r.nz(-2, 2), t = r.nz(-2, 2), i = r.int(0, 2);
      let u, v, w0, A, B, C, D0;
      if (kind === "vec") { u = vec(r, 3); v = vec(r, 3); w0 = add(scal(u, s), v, t); }
      else { A = vec(r, 3); B = vec(r, 3); C = vec(r, 3); u = sub(B, A); v = sub(C, A); D0 = add(add(A, u, s), v, t); w0 = sub(D0, A); }
      const n = cross(u, v);
      if (n[i] === 0 || Math.max(...w0.map(Math.abs)) > 12) return null;
      const show = p => `(${p.map((x, j) => (j === i ? "k" : x)).join(", ")})`;
      const ans = kind === "vec" ? w0[i] : D0[i];
      const rest = dot(n, w0) - n[i] * w0[i];   // parte del producto mixto que no depende de k
      const wk = kind === "vec" ? "\\vec w" : "\\overrightarrow{AD}";
      const wkTex = kind === "vec" ? show(w0) : `(${w0.map((x, j) => (j === i ? (A[i] ? `k${H.sg(-A[i])}` : "k") : x)).join(", ")})`;
      const kA = kind === "pts" && A[i] !== 0 ? `(k${H.sg(-A[i])})` : "k", rs = rest ? H.sg(rest) : "";
      const lin = kind === "vec" ? `${H.cf(n[i])}k${rs}` : `${H.cf(n[i])}${kA}${rs}`;
      return {
        prompt: kind === "vec" ? `¿Para qué valor de $k$ los vectores $\\vec u = ${pt(u)}$, $\\vec v = ${pt(v)}$ y $\\vec w = ${show(w0)}$ son coplanares?`
          : `¿Para qué valor de $k$ los puntos $A = ${pt(A)}$, $B = ${pt(B)}$, $C = ${pt(C)}$ y $D = ${show(D0)}$ están en un mismo plano?`,
        answer: ans,
        solution: [...(kind === "pts" ? [`Se trabaja con los vectores que salen de $A$: $\\overrightarrow{AB} = ${pt(u)}$, $\\overrightarrow{AC} = ${pt(v)}$, $\\overrightarrow{AD} = ${wkTex}$.`] : []),
          `Son [[ga-coplanaridad|coplanares]] si y solo si el producto mixto es $0$. Primero, $${kind === "vec" ? "\\vec u\\times\\vec v" : "\\overrightarrow{AB}\\times\\overrightarrow{AC}"} = ${pt(n)}$.`,
          `Producto mixto: $${pt(n)}\\cdot ${wk} = ${lin}$.`,
          `Igualando a $0$: $k = ${ans}$.`],
        // verificación: con ese k, el tercer vector es combinación lineal de los otros dos (residuo de mínimos cuadrados nulo)
        verify: { kind: "zero", fn: k => {
          const w = kind === "vec" ? w0.map((x, j) => (j === i ? k : x)) : sub(D0.map((x, j) => (j === i ? k : x)), A);
          const [a, b] = gaussSolve([[dot(u, u), dot(u, v)], [dot(u, v), dot(v, v)]], [dot(u, w), dot(v, w)]);
          return [norm(add(add(w, u, -a), v, -b))];
        } }
      };
    }
  };

  const cards = {
    "ga-cosenos-directores": {
      title: "Módulo, versor y cosenos directores", aliases: ["cosenos directores", "ángulos directores", "versor", "vector unitario"], concepts: ["ga-cosenos-directores"],
      summary: "El versor de v es v/|v|; sus componentes son los cosenos directores cos α, cos β, cos γ, que cumplen cos²α + cos²β + cos²γ = 1.",
      def: [R`**Módulo** de $\vec v = (v_1, v_2, v_3)$: $|\vec v| = \sqrt{v_1^2 + v_2^2 + v_3^2}$, la [[al-producto-escalar|norma]] euclídea.`,
        R`**Versor** de $\vec v \neq \vec 0$: $\hat v = \frac{\vec v}{|\vec v|}$, el vector de módulo $1$ con la misma dirección y el mismo sentido.`,
        R`**Ángulos directores** $\alpha, \beta, \gamma \in [0^\circ, 180^\circ]$: los que forma $\vec v$ con los semiejes positivos $x$, $y$, $z$. Sus cosenos son los **cosenos directores**: $$\cos\alpha = \frac{v_1}{|\vec v|}, \qquad \cos\beta = \frac{v_2}{|\vec v|}, \qquad \cos\gamma = \frac{v_3}{|\vec v|}, \qquad \cos^2\alpha + \cos^2\beta + \cos^2\gamma = 1.$$`],
      idea: [R`Los cosenos directores son **las coordenadas del versor**: $\hat v = (\cos\alpha, \cos\beta, \cos\gamma)$. Describen la dirección sin importar el largo, y por eso alcanza con dos ángulos: el tercero queda fijo salvo el sentido (agudo u obtuso).`,
        R`No cualquier terna de ángulos sirve. Por ejemplo, ningún vector forma $45^\circ$ con los tres ejes, porque $3\cdot\frac12 \neq 1$; en cambio, $(1, 1, 1)$ forma con los tres el mismo ángulo, de coseno $\frac{1}{\sqrt3}$ (unos $54{,}7^\circ$).`],
      demo: [R`**Paso 1.** Tomamos el versor $\vec e_1 = (1, 0, 0)$ del eje $x$. Por la definición geométrica del [[al-producto-escalar|producto escalar]], $\vec v\cdot\vec e_1 = |\vec v|\,|\vec e_1|\cos\alpha = |\vec v|\cos\alpha$, porque $\vec e_1$ tiene módulo $1$.`,
        R`**Paso 2.** Calculamos el mismo producto con componentes: $\vec v\cdot\vec e_1 = v_1\cdot 1 + v_2\cdot 0 + v_3\cdot 0 = v_1$. Igualamos las dos expresiones y dividimos por $|\vec v| \neq 0$: $\cos\alpha = \frac{v_1}{|\vec v|}$. Con $\vec e_2$ y $\vec e_3$ se obtienen igual $\cos\beta$ y $\cos\gamma$.`,
        R`**Paso 3.** Juntando las tres, $(\cos\alpha, \cos\beta, \cos\gamma) = \frac{1}{|\vec v|}(v_1, v_2, v_3) = \hat v$: los cosenos directores son las componentes del versor.`,
        R`**Paso 4.** El versor tiene módulo $1$, porque un escalar positivo sale de la norma multiplicando: $|\hat v| = \frac{1}{|\vec v|}\,|\vec v| = 1$. Escribimos ese módulo al cuadrado con las componentes del Paso 3: $$\cos^2\alpha + \cos^2\beta + \cos^2\gamma = |\hat v|^2 = 1. \;\blacksquare$$`],
      examples: [{ q: R`Un vector forma $60^\circ$ con el eje $x$ y $45^\circ$ con el eje $y$, y su componente $z$ es negativa. ¿Qué ángulo forma con el eje $z$?`,
        steps: [R`$\cos^2\gamma = 1 - \frac14 - \frac12 = \frac14$, así que $\cos\gamma = \pm\frac12$.`, R`La componente $z$ es negativa, entonces $\cos\gamma < 0$: $\cos\gamma = -\frac12$ y $\gamma = 120^\circ$.`] }],
      tips: [R`Los ángulos directores van de $0^\circ$ a $180^\circ$: si la componente es negativa, el ángulo es obtuso. No le saques el valor absoluto a la componente.`],
      see: ["al-producto-escalar", "al-vectores", "ga-proyeccion-eje"]
    },
    "ga-proyeccion-eje": {
      title: "Proyección sobre un eje y bases ortonormales", aliases: ["proyección sobre un eje", "proyección sobre el eje", "componente perpendicular"], concepts: ["ga-proyeccion-eje"],
      summary: "La proyección de v sobre el eje de versor û es v·û, con signo. En una base ortonormal, cada coordenada de v es su producto escalar con el vector de la base.",
      def: [R`Un **eje** es una recta orientada, dada por un versor $\hat u$. La **proyección (con signo)** de $\vec v$ sobre el eje es $$\vec v\cdot\hat u = \frac{\vec v\cdot\vec u}{|\vec u|},$$ y el vector proyección es $(\vec v\cdot\hat u)\,\hat u$.`,
        R`La **componente perpendicular** es $\vec v_\perp = \vec v - (\vec v\cdot\hat u)\,\hat u$, y mide $|\vec v_\perp| = \sqrt{|\vec v|^2 - (\vec v\cdot\hat u)^2}$.`,
        R`Una base $\{\hat e_1, \hat e_2, \hat e_3\}$ es **ortonormal** si sus vectores tienen módulo $1$ y son perpendiculares dos a dos. En ella, las coordenadas de $\vec v$ son $c_j = \vec v\cdot\hat e_j$.`],
      idea: [R`Proyectar sobre un eje es medir **la sombra** de $\vec v$ cuando la luz cae perpendicular al eje. El signo dice si la sombra apunta en el sentido del eje o al revés: es positiva si el ángulo entre $\vec v$ y $\hat u$ es agudo.`,
        R`En una base ortonormal no hace falta resolver ningún sistema para sacar coordenadas: cada una es una proyección. Por eso esas bases son tan cómodas, y por eso conviene fabricarlas con [[al-gram-schmidt]].`],
      demo: [R`**Paso 1 (proyección).** Queremos escribir $\vec v = t\,\hat u + \vec w$ con $\vec w$ perpendicular al eje. Multiplicamos escalarmente por $\hat u$ los dos lados; como el producto escalar es lineal, $\vec v\cdot\hat u = t\,(\hat u\cdot\hat u) + \vec w\cdot\hat u$.`,
        R`**Paso 2.** Usamos que $\hat u\cdot\hat u = |\hat u|^2 = 1$, porque es un versor, y que $\vec w\cdot\hat u = 0$, porque son perpendiculares. Queda $t = \vec v\cdot\hat u$: ese número es la proyección. Si el eje viene dado por un $\vec u$ no unitario, se usa $\hat u = \frac{\vec u}{|\vec u|}$ y sale $t = \frac{\vec v\cdot\vec u}{|\vec u|}$.`,
        R`**Paso 3 (componente perpendicular).** Desarrollamos $|\vec v|^2 = (t\hat u + \vec w)\cdot(t\hat u + \vec w) = t^2 + 2t\,\hat u\cdot\vec w + |\vec w|^2$. El término del medio es $0$ por la perpendicularidad, así que vale Pitágoras, $|\vec v|^2 = t^2 + |\vec w|^2$, y despejando, $|\vec w| = \sqrt{|\vec v|^2 - t^2}$.`,
        R`**Paso 4 (coordenadas en una base ortonormal).** Si $\vec v = c_1\hat e_1 + c_2\hat e_2 + c_3\hat e_3$, multiplicamos escalarmente por $\hat e_j$. Por linealidad, $\vec v\cdot\hat e_j = \sum_i c_i\,(\hat e_i\cdot\hat e_j)$. En una base ortonormal $\hat e_i\cdot\hat e_j$ vale $1$ si $i = j$ y $0$ si no, así que de la suma sobrevive un solo término: $c_j = \vec v\cdot\hat e_j$. $\blacksquare$`],
      examples: [{ q: R`Proyectá $\vec v = (3, 0, 4)$ sobre el eje orientado por $\vec u = (2, 1, -2)$.`,
        steps: [R`$|\vec u| = 3$ y $\vec v\cdot\vec u = 6 + 0 - 8 = -2$.`, R`Proyección: $-\frac23$. Es negativa: la sombra apunta al revés del eje, porque el ángulo es obtuso.`, R`Componente perpendicular: $\sqrt{25 - \frac49} = \frac{\sqrt{221}}{3} \approx 4{,}96$.`] }],
      tips: [R`La proyección escalar se divide por $|\vec u|$ **una** vez; el vector proyección, $\frac{\vec v\cdot\vec u}{|\vec u|^2}\,\vec u$, por $|\vec u|^2$. Es el error más común.`],
      see: ["al-producto-escalar", "al-gram-schmidt", "ga-cosenos-directores"]
    },
    "ga-areas-volumenes": {
      title: "Áreas y volúmenes con los productos vectorial y mixto", aliases: ["área del paralelogramo", "área del triángulo", "volumen del paralelepípedo", "volumen del tetraedro"], concepts: ["ga-areas-volumenes"],
      summary: "Área del paralelogramo de lados u, v: |u × v|; la del triángulo, la mitad. Volumen del paralelepípedo: |[u, v, w]|; el del tetraedro, un sexto.",
      def: [R`**Área del paralelogramo** de lados $\vec u$, $\vec v$: $|\vec u\times\vec v|$. **Área del triángulo** $ABC$: $\frac12|\overrightarrow{AB}\times\overrightarrow{AC}|$.`,
        R`**Volumen del paralelepípedo** de aristas $\vec u, \vec v, \vec w$: $|[\vec u, \vec v, \vec w]|$, donde el [[al-producto-vectorial|producto mixto]] es $$[\vec u, \vec v, \vec w] = (\vec u\times\vec v)\cdot\vec w = \det\begin{pmatrix} u_1 & u_2 & u_3\\ v_1 & v_2 & v_3\\ w_1 & w_2 & w_3\end{pmatrix}.$$`,
        R`**Volumen del tetraedro** $ABCD$: $\frac16\big|[\overrightarrow{AB}, \overrightarrow{AC}, \overrightarrow{AD}]\big|$.`],
      idea: [R`El producto vectorial **mide área** y apunta perpendicular a ella. Al multiplicarlo escalarmente por $\vec w$ nos quedamos con «área por altura», que es volumen. El signo del producto mixto dice la orientación de la terna; para medir se toma el valor absoluto.`,
        R`El triángulo es medio paralelogramo, y el tetraedro es un sexto del paralelepípedo: el prisma triangular es la mitad del paralelepípedo, y la pirámide es un tercio del prisma de igual base y altura.`],
      demo: [R`**Paso 1 (área).** El paralelogramo de lados $\vec u$ y $\vec v$ tiene base $|\vec u|$ y altura $|\vec v|\sin\theta$, donde $\theta$ es el ángulo entre ellos: la altura es el cateto opuesto a $\theta$ en el triángulo rectángulo de hipotenusa $|\vec v|$. Su área es $|\vec u|\,|\vec v|\sin\theta$.`,
        R`**Paso 2.** Ese número es el módulo del [[al-producto-vectorial|producto vectorial]]. Por la identidad de Lagrange, $|\vec u\times\vec v|^2 = |\vec u|^2|\vec v|^2 - (\vec u\cdot\vec v)^2 = |\vec u|^2|\vec v|^2(1 - \cos^2\theta) = |\vec u|^2|\vec v|^2\sin^2\theta$, y como $\sin\theta \ge 0$ en $[0, \pi]$, la raíz da exactamente el área.`,
        R`**Paso 3 (triángulo).** La diagonal $BC$ parte el paralelogramo de lados $\overrightarrow{AB}$ y $\overrightarrow{AC}$ en dos triángulos congruentes, porque tienen los tres lados iguales. Uno de ellos es $ABC$, así que su área es la mitad.`,
        R`**Paso 4 (volumen).** El paralelepípedo tiene por base el paralelogramo de $\vec u$ y $\vec v$, de área $|\vec n|$ con $\vec n = \vec u\times\vec v$. La altura es la distancia de la punta de $\vec w$ al plano de la base, medida en la dirección perpendicular, que es la de $\vec n$: es el valor absoluto de la [[ga-proyeccion-eje|proyección]] de $\vec w$ sobre $\vec n$, $h = \frac{|\vec n\cdot\vec w|}{|\vec n|}$.`,
        R`**Paso 5.** Volumen igual a base por altura: $|\vec n|\cdot\frac{|\vec n\cdot\vec w|}{|\vec n|} = |(\vec u\times\vec v)\cdot\vec w|$. Si escribimos $\vec u\times\vec v$ por componentes y lo multiplicamos por $\vec w$, aparece exactamente el desarrollo del [[al-determinante|determinante]] de la matriz de filas $\vec u, \vec v, \vec w$ por su tercera fila.`,
        R`**Paso 6 (tetraedro).** El tetraedro es una pirámide con base el triángulo $ABC$, que es medio paralelogramo, y la misma altura $h$. Como el volumen de una pirámide es un tercio de base por altura, $V = \frac13\cdot\frac12|\vec n|\cdot h = \frac16|[\overrightarrow{AB}, \overrightarrow{AC}, \overrightarrow{AD}]|$. $\blacksquare$`],
      examples: [{ q: R`Volumen del tetraedro de vértices $O = (0, 0, 0)$, $A = (1, 2, 0)$, $B = (0, 1, 3)$ y $C = (2, 0, 1)$.`,
        steps: [R`$[\vec a, \vec b, \vec c] = \det\begin{pmatrix}1&2&0\\0&1&3\\2&0&1\end{pmatrix} = 1\cdot(1 - 0) - 2\cdot(0 - 6) + 0 = 13$.`, R`$V = \frac{13}{6} \approx 2{,}17$.`] }],
      tips: [R`El producto mixto puede dar negativo: para un volumen, tomá el valor absoluto. Si da $0$, no hay volumen porque los vectores son coplanares ([[ga-coplanaridad]]).`],
      see: ["al-producto-vectorial", "al-determinante", "ga-coplanaridad"]
    },
    "ga-coplanaridad": {
      title: "Coplanaridad y producto mixto", aliases: ["coplanaridad", "vectores coplanares", "puntos coplanares"], concepts: ["ga-coplanaridad"],
      summary: "Tres vectores son coplanares si y solo si su producto mixto es 0. Cuatro puntos lo son si lo son los tres vectores que salen de uno de ellos hacia los otros.",
      def: [R`Tres vectores $\vec u, \vec v, \vec w$ son **coplanares** si, dibujados desde un mismo origen, quedan en un mismo plano. Equivale a que sean [[al-vectores|linealmente dependientes]], y a que $$[\vec u, \vec v, \vec w] = (\vec u\times\vec v)\cdot\vec w = 0.$$`,
        R`Cuatro puntos $A, B, C, D$ son coplanares si lo son $\overrightarrow{AB}$, $\overrightarrow{AC}$ y $\overrightarrow{AD}$.`],
      idea: [R`El producto mixto es, salvo el signo, el volumen del paralelepípedo que forman los tres vectores ([[ga-areas-volumenes]]). Si son coplanares, el paralelepípedo está «aplastado» y no encierra volumen.`,
        R`Para hallar un parámetro que haga coplanares a tres vectores, se plantea el determinante: si el parámetro aparece en un solo lugar, queda una ecuación lineal.`],
      demo: [R`**Paso 1 (si son coplanares, da cero).** Si $\vec u$ y $\vec v$ son paralelos, $\vec u\times\vec v = \vec 0$ y el producto mixto vale $0$. Si no, generan el plano que los contiene, y $\vec n = \vec u\times\vec v$ es perpendicular a ese plano. Si $\vec w$ está en el mismo plano, también es perpendicular a $\vec n$, así que $\vec n\cdot\vec w = 0$.`,
        R`**Paso 2 (si da cero, son coplanares).** Supongamos $(\vec u\times\vec v)\cdot\vec w = 0$. Si $\vec u\times\vec v = \vec 0$, los dos primeros son paralelos y los tres caben en cualquier plano que contenga a $\vec u$ y a $\vec w$. Si no, $\vec w$ es perpendicular a $\vec n$, y los vectores perpendiculares a $\vec n$ forman justamente el plano de $\vec u$ y $\vec v$: $\vec w$ está ahí.`,
        R`**Paso 3 (dependencia lineal).** El producto mixto es el [[al-determinante|determinante]] de la matriz de filas $\vec u, \vec v, \vec w$, y un determinante se anula si y solo si sus filas son linealmente dependientes. Por eso «coplanares», «dependientes» y «producto mixto nulo» dicen lo mismo.`,
        R`**Paso 4 (cuatro puntos).** $A, B, C, D$ están en un plano si y solo si los vectores que van de $A$ a los otros tres quedan en un plano por $A$. Basta aplicar lo anterior a $\overrightarrow{AB}$, $\overrightarrow{AC}$ y $\overrightarrow{AD}$. $\blacksquare$`],
      examples: [{ q: R`¿Para qué $k$ son coplanares $(1, 0, 2)$, $(0, 1, 1)$ y $(2, k, 3)$?`,
        steps: [R`$\det\begin{pmatrix}1&0&2\\0&1&1\\2&k&3\end{pmatrix} = 1\cdot(3 - k) - 0 + 2\cdot(0 - 2) = -1 - k$.`, R`Se anula para $k = -1$. Chequeo: $(2, -1, 3) = 2\,(1, 0, 2) - (0, 1, 1)$.`] }],
      tips: [R`Con cuatro puntos no uses los vectores posición $\vec A, \vec B, \vec C, \vec D$: hay que restar, porque el plano no tiene por qué pasar por el origen.`],
      see: ["ga-areas-volumenes", "al-producto-vectorial", "al-vectores"]
    }
  };
  for (const c of Object.values(cards)) c.group = "ga-vectores-u";

  E.extendCourse("m106", {
    concepts: { "ga-cosenos-directores": { name: "Versores y cosenos directores" }, "ga-proyeccion-eje": { name: "Proyecciones y bases ortonormales" },
      "ga-areas-volumenes": { name: "Áreas y volúmenes" }, "ga-coplanaridad": { name: "Coplanaridad" } },
    templates: T,
    units: [{
      id: "ga-vectores-u", order: 1, program: "Unidad 1", title: "Vectores y álgebra vectorial", icon: "target",
      diagnostic: ["ga-cosdir-num", "ga-proy-num", "ga-areavol-num"],
      lessons: [
        { id: "ga-vec-l1", title: "Versores y cosenos directores", templates: ["ga-cosdir-num", "ga-cosdir-vf"], theory: ["ga-cosenos-directores"],
          intro: R`Los cosenos directores son las componentes del versor: $\cos^2\alpha + \cos^2\beta + \cos^2\gamma = 1$.` },
        { id: "ga-vec-l2", title: "Proyecciones y bases ortonormales", templates: ["ga-proy-num", "ga-base-num"], theory: ["ga-proyeccion-eje"],
          intro: R`La proyección sobre un eje es $\vec v\cdot\hat u$; en una base ortonormal, cada coordenada es una proyección.` },
        { id: "ga-vec-l3", title: "Áreas, volúmenes y coplanaridad", templates: ["ga-areavol-num", "ga-medidas-match", "ga-coplanar-num"], theory: ["ga-areas-volumenes", "ga-coplanaridad"],
          intro: R`$|\vec u\times\vec v|$ es un área y $|[\vec u, \vec v, \vec w]|$ un volumen; si el producto mixto es $0$, los vectores son coplanares.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 2 · PLANOS Y RECTAS
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const T = {};
  const nd = (x, d = 4) => H.num(x, d).replace(".", "{,}");
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const sub = (a, b) => a.map((x, i) => x - b[i]);
  const add = (a, b, k = 1) => a.map((x, i) => x + k * b[i]);
  const scal = (a, k) => a.map(x => x * k || 0);
  const norm = a => Math.sqrt(dot(a, a));
  const isZero = a => a.every(x => x === 0);
  const vec = (r, m = 4) => [r.int(-m, m), r.int(-m, m), r.int(-m, m)];
  const pt = p => `(${p.join(", ")})`;
  const AX = ["x", "y", "z"], DEG = Math.PI / 180;
  const rad = n => { let k = 1, m = n; for (let f = 2; f * f <= m; f++) while (m % (f * f) === 0) { m /= f * f; k *= f; } return { k, m }; };
  const sqrtTex = n => { const { k, m } = rad(n); return m === 1 ? String(k) : `${k === 1 ? "" : k}\\sqrt{${m}}`; };
  const sq = n => (rad(n).m === 1 ? String(rad(n).k) : `\\sqrt{${n}}`);   // √n sin simplificar, salvo si es entera
  const g2 = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  const gcdv = a => a.reduce(g2, 0) || 1;
  // divide por el factor común y deja positivo el primer coeficiente no nulo
  const simp = a => { const g = gcdv(a), f = a.find(x => x !== 0) || 1; return a.map(x => (x / g) * Math.sign(f) || 0); };
  const lhs = n => H.poly([[n[0], "x"], [n[1], "y"], [n[2], "z"]]);
  const plane = (n, d) => `${lhs(n)} = ${d}`;
  const F = (n, d) => H.poly([[n[0], "x"], [n[1], "y"], [n[2], "z"], [-d, ""]]);     // n·X − d
  const line2 = (a, b, c) => `${H.poly([[a, "x"], [b, "y"]])} = ${c}`;
  const symTex = (P, u) => {
    const nz = [0, 1, 2].filter(i => u[i] !== 0);
    if (nz.length < 2) return null;
    const fixed = [0, 1, 2].filter(i => u[i] === 0).map(i => `${AX[i]} = ${P[i]}`);
    return nz.map(i => `\\frac{${H.xm(P[i], AX[i])}}{${u[i]}}`).join(" = ") + (fixed.length ? `,\\; ${fixed.join(",\\; ")}` : "");
  };
  const paramTex = (P, u, t = "t") => `(x, y, z) = ${pt(P)} + ${t}\\,${pt(u)}`;
  const lineTex = (P, u) => symTex(P, u) || paramTex(P, u);

  // ---- herramientas numéricas para las verificaciones (caminos distintos de las fórmulas de la solución) ----
  const gaussSolve = (A, b) => {
    const n = A.length, M = A.map((row, i) => row.concat([b[i]]));
    for (let c = 0; c < n; c++) {
      let p = c; for (let i = c + 1; i < n; i++) if (Math.abs(M[i][c]) > Math.abs(M[p][c])) p = i;
      [M[c], M[p]] = [M[p], M[c]];
      for (let i = 0; i < n; i++) if (i !== c) { const f = M[i][c] / M[c][c]; for (let j = c; j <= n; j++) M[i][j] -= f * M[c][j]; }
    }
    return M.map((row, i) => row[n] / row[i]);
  };
  const rank = A => {
    const M = A.map(row => row.slice()), rows = M.length, cols = M[0].length; let rk = 0;
    for (let c = 0; c < cols && rk < rows; c++) {
      let p = rk; for (let i = rk + 1; i < rows; i++) if (Math.abs(M[i][c]) > Math.abs(M[p][c])) p = i;
      if (Math.abs(M[p][c]) < 1e-9) continue;
      [M[rk], M[p]] = [M[p], M[rk]];
      for (let i = 0; i < rows; i++) if (i !== rk) { const f = M[i][c] / M[rk][c]; for (let j = c; j < cols; j++) M[i][j] -= f * M[rk][j]; }
      rk++;
    }
    return rk;
  };
  const golden = (f, a, b) => {
    const g = (Math.sqrt(5) - 1) / 2;
    let x1 = b - g * (b - a), x2 = a + g * (b - a), f1 = f(x1), f2 = f(x2);
    for (let i = 0; i < 200; i++) {
      if (f1 < f2) { b = x2; x2 = x1; f2 = f1; x1 = b - g * (b - a); f1 = f(x1); }
      else { a = x1; x1 = x2; f1 = f2; x2 = a + g * (b - a); f2 = f(x2); }
    }
    return (a + b) / 2;
  };
  const bisect = (f, a, b) => {
    let fa = f(a);
    for (let i = 0; i < 200; i++) { const m = (a + b) / 2, fm = f(m); if ((fm > 0) === (fa > 0)) { a = m; fa = fm; } else b = m; }
    return (a + b) / 2;
  };

  // ---- lección 1: ecuaciones del plano ----
  T["ga-plano3p-num"] = {
    type: "numeric", concepts: ["ga-plano"], difficulty: 2,
    generate(r) {
      const A = vec(r, 3), B = vec(r, 3), C = vec(r, 3), u = sub(B, A), v = sub(C, A), n0 = cross(u, v), i = r.int(0, 2);
      if (isZero(n0)) return null;
      const n = simp(n0), d = dot(n, A);
      if (n[i] === 0 || d === 0) return null;
      return {
        prompt: `El plano que pasa por $A = ${pt(A)}$, $B = ${pt(B)}$ y $C = ${pt(C)}$ corta al eje $${AX[i]}$ en un punto. ¿Cuánto vale ahí la coordenada $${AX[i]}$? (Es el denominador de $${AX[i]}$ en la ecuación segmentaria).`,
        answer: d / n[i], answerTex: H.frac(d, n[i]),
        solution: [`Dos vectores del plano: $\\overrightarrow{AB} = ${pt(u)}$ y $\\overrightarrow{AC} = ${pt(v)}$.`,
          `Una normal es su [[al-producto-vectorial|producto vectorial]]: $\\overrightarrow{AB}\\times\\overrightarrow{AC} = ${pt(n0)}$${n.some((x, j) => x !== n0[j]) ? `; simplificada, $\\vec n = ${pt(n)}$` : ""}.`,
          `[[ga-plano|Ecuación general]], imponiendo que pase por $A$: $${plane(n, d)}$.`,
          `Sobre el eje $${AX[i]}$ las otras dos coordenadas valen $0$: $${H.cf(n[i])}${AX[i]} = ${d}$, así que $${AX[i]} = ${H.frac(d, n[i])}$.`],
        // verificación: se escribe el punto como A + s·AB + t·AC y se piden nulas las otras dos coordenadas (sistema 2×2)
        verify: { kind: "value", tol: 1e-9, fn: () => {
          const [j, k] = [0, 1, 2].filter(q => q !== i), [s, t] = gaussSolve([[u[j], v[j]], [u[k], v[k]]], [-A[j], -A[k]]);
          return A[i] + s * u[i] + t * v[i];
        } }
      };
    }
  };

  T["ga-plano-order"] = {
    type: "order", concepts: ["ga-plano"], difficulty: 2,
    generate(r) {
      const A = vec(r, 3), B = vec(r, 3), C = vec(r, 3), u = sub(B, A), v = sub(C, A), n0 = cross(u, v);
      if (isZero(n0)) return null;
      const n = simp(n0), d = dot(n, A), N = dot(n, n), s = d < 0 ? -1 : 1;
      if (d === 0 || N === 1) return null;
      const ns = scal(n, s), den = sqrtTex(N), del = Math.abs(d) / Math.sqrt(N);
      return {
        prompt: `Ordená los pasos para escribir en forma normal de Hesse el plano que pasa por $A = ${pt(A)}$, $B = ${pt(B)}$ y $C = ${pt(C)}$.`,
        steps: [
          `Armar dos vectores del plano: $\\overrightarrow{AB} = ${pt(u)}$ y $\\overrightarrow{AC} = ${pt(v)}$.`,
          `Calcular una normal: $\\overrightarrow{AB}\\times\\overrightarrow{AC} = ${pt(n0)}$${n.some((x, j) => x !== n0[j]) ? `, que simplificada es $\\vec n = ${pt(n)}$` : ""}.`,
          `Imponer que pase por $A$: $${plane(n, d)}$.`,
          `Calcular el módulo de la normal: $|\\vec n| = \\sqrt{${N}}${den !== `\\sqrt{${N}}` ? ` = ${den}` : ""}$.`,
          `Dividir por $${s < 0 ? "-" : ""}|\\vec n|$ para que el término independiente quede positivo: $\\frac{${lhs(ns)}}{${den}} = \\frac{${Math.abs(d)}}{${den}}$.`
        ],
        solution: [`[[ga-plano|Forma normal de Hesse]]: $\\hat n\\cdot X = \\delta$, con $\\hat n$ unitario y $\\delta \\ge 0$. Acá $\\delta = \\frac{${Math.abs(d)}}{${den}} \\approx ${nd(del)}$ es la distancia del plano al origen.`,
          `El orden natural: dos vectores del plano, la normal, la ecuación general, el módulo y la división.`],
        // verificación: la ecuación final tiene normal unitaria, δ ≥ 0, y la cumplen los tres puntos dados
        verify: { kind: "truth", target: true, fn: () => {
          const nh = scal(ns, 1 / Math.sqrt(N));
          return Math.abs(norm(nh) - 1) < 1e-12 && del >= 0 && [A, B, C].every(P => Math.abs(dot(nh, P) - del) < 1e-9);
        } }
      };
    }
  };

  // ---- lección 2: planos paralelos, distancias y haces ----
  T["ga-dist-planos-num"] = {
    type: "numeric", concepts: ["ga-distancias"], difficulty: 2,
    generate(r) {
      const n = vec(r, 4);
      if (isZero(n) || gcdv(n) !== 1) return null;
      const P = vec(r, 3), d1 = dot(n, P), k = r.pick([1, 2, -1, -2, 3]), e = r.nz(-9, 9), d2 = k * (d1 + e), nk = scal(n, k), N = dot(n, n);
      const ans = Math.abs(e) / Math.sqrt(N);
      return {
        prompt: `Los planos $\\pi_1: ${plane(n, d1)}$ y $\\pi_2: ${plane(nk, d2)}$ son paralelos. ¿A qué distancia están?`,
        answer: ans,
        solution: [k === 1 ? `Las dos ecuaciones ya tienen la misma normal $\\vec n = ${pt(n)}$.`
          : `La normal de $\\pi_2$ es $${k}$ veces la de $\\pi_1$. Dividiendo $\\pi_2$ por $${k}$ queda $${plane(n, d1 + e)}$, con la misma normal $\\vec n = ${pt(n)}$.`,
          `[[ga-distancias|Distancia entre planos paralelos]]: $D = \\frac{|d_1 - d_2|}{|\\vec n|} = \\frac{|${d1} - ${H.par(d1 + e)}|}{${sq(N)}} = \\frac{${Math.abs(e)}}{${sq(N)}} \\approx ${nd(ans)}$.`],
        // verificación: desde un punto de π₁ se avanza por la normal hasta tocar π₂ (bisección) y se mide el recorrido
        verify: { kind: "value", tol: 1e-7, fn: () => Math.abs(bisect(t => dot(nk, add(P, n, t)) - d2, -1e3, 1e3)) * norm(n) }
      };
    }
  };

  T["ga-dist-error"] = {
    type: "error", concepts: ["ga-distancias"], difficulty: 2,
    generate(r) {
      const n = vec(r, 4), P = vec(r, 4), d = r.nz(-8, 8);
      if (n.filter(x => x !== 0).length < 2) return null;
      const N = dot(n, n), s = dot(n, P), val = s - d;
      if (s === 0 || val === 0) return null;
      const ans = Math.abs(val) / Math.sqrt(N), subst = n.map((c, j) => `${H.par(c)}\\cdot${H.par(P[j])}`).join(" + ");
      const ok = [
        `Fórmula, con el plano escrito como $ax + by + cz = d$: $D = \\frac{|ax_0 + by_0 + cz_0 - d|}{\\sqrt{a^2 + b^2 + c^2}}$.`,
        `Normal: $\\vec n = ${pt(n)}$, con $|\\vec n| = \\sqrt{${n.map(c => `${H.par(c)}^2`).join(" + ")}} = \\sqrt{${N}}$.`,
        `Numerador: $|${subst} - ${H.par(d)}| = |${val}| = ${Math.abs(val)}$.`,
        `$D = \\frac{${Math.abs(val)}}{\\sqrt{${N}}} \\approx ${nd(ans)}$.`];
      const steps = ok.slice(), kind = r.pick(["norma", "signo", "raiz"]);
      let wrongIndex, fix;
      if (kind === "norma") {
        const L1 = n.reduce((a, c) => a + Math.abs(c), 0); wrongIndex = 1;
        steps[1] = `Normal: $\\vec n = ${pt(n)}$, con $|\\vec n| = ${n.map(c => Math.abs(c)).join(" + ")} = ${L1}$.`;
        steps[3] = `$D = \\frac{${Math.abs(val)}}{${L1}} \\approx ${nd(Math.abs(val) / L1)}$.`;
        fix = `El módulo es la raíz de la suma de los cuadrados, $|\\vec n| = \\sqrt{${N}}$, no la suma de los valores absolutos.`;
      } else if (kind === "signo") {
        const w = s + d; wrongIndex = 2;
        steps[2] = `Numerador: $|${subst} + ${H.par(d)}| = |${w}| = ${Math.abs(w)}$.`;
        steps[3] = `$D = \\frac{${Math.abs(w)}}{\\sqrt{${N}}} \\approx ${nd(Math.abs(w) / Math.sqrt(N))}$.`;
        fix = `Con el plano escrito como $\\ldots = ${d}$ hay que **restar** $d$: el numerador es $|${s} - ${H.par(d)}| = ${Math.abs(val)}$.`;
      } else {
        wrongIndex = 3;
        steps[3] = `$D = \\frac{${Math.abs(val)}}{${N}} \\approx ${nd(Math.abs(val) / N)}$.`;
        fix = `Se divide por el módulo $|\\vec n| = \\sqrt{${N}}$, no por su cuadrado: $D \\approx ${nd(ans)}$.`;
      }
      return {
        prompt: `Alguien calculó así la [[ga-distancias|distancia]] del punto $P = ${pt(P)}$ al plano $${plane(n, d)}$. <b>Tocá el primer paso incorrecto.</b>`,
        steps, wrongIndex, fix, solution: ok,
        // verificación: el pie de la perpendicular se busca por bisección sobre la recta P + t·n y se mide |t|·|n|
        verify: { kind: "truth", target: true, fn: () => Math.abs(Math.abs(bisect(t => dot(n, add(P, n, t)) - d, -1e3, 1e3)) * norm(n) - ans) < 1e-7 }
      };
    }
  };

  T["ga-haz-num"] = {
    type: "numeric", concepts: ["ga-haz-planos"], difficulty: 3,
    generate(r) {
      const n1 = vec(r, 3), n2 = vec(r, 3);
      if (isZero(cross(n1, n2))) return null;
      const Q = vec(r, 3), d1 = dot(n1, Q), d2 = dot(n2, Q), P = vec(r, 3), e1 = dot(n1, P) - d1, e2 = dot(n2, P) - d2;
      if (e1 === 0 || e2 === 0) return null;
      const raw = [...sub(scal(n1, e2), scal(n2, e1)), e2 * d1 - e1 * d2], arr = simp(raw), Nn = arr.slice(0, 3), Dn = arr[3], i = r.int(0, 2);
      if (Nn[i] === 0) return null;
      return {
        prompt: `De todos los planos que contienen a la recta intersección de $\\pi_1: ${plane(n1, d1)}$ y $\\pi_2: ${plane(n2, d2)}$, tomá el que pasa por $P = ${pt(P)}$. ¿En qué valor de $${AX[i]}$ corta ese plano al eje $${AX[i]}$?`,
        answer: Dn / Nn[i], answerTex: H.frac(Dn, Nn[i]),
        solution: [`[[ga-haz-planos|Haz de planos]] de eje $\\pi_1 \\cap \\pi_2$: $(${F(n1, d1)}) + \\lambda\\,(${F(n2, d2)}) = 0$.`,
          `Reemplazando $P$: $${e1} + \\lambda\\cdot${H.par(e2)} = 0$, así que $\\lambda = ${H.frac(-e1, e2)}$.`,
          `Multiplicando todo por $${e2}$ para no arrastrar fracciones${arr.some((x, j) => x !== raw[j]) ? " y simplificando" : ""}: $${plane(Nn, Dn)}$.`,
          `Sobre el eje $${AX[i]}$: $${H.cf(Nn[i])}${AX[i]} = ${Dn}$, así que $${AX[i]} = ${H.frac(Dn, Nn[i])}$.`],
        // verificación: se calculan dos puntos de la recta (sistema 2×2), se arma el plano por ellos y P, y se corta con el eje
        verify: { kind: "value", tol: 1e-9, fn: () => {
          const L = cross(n1, n2), m = [0, 1, 2].reduce((a, b) => (Math.abs(L[b]) > Math.abs(L[a]) ? b : a), 0), [j, k] = [0, 1, 2].filter(q => q !== m);
          const [xj, xk] = gaussSolve([[n1[j], n1[k]], [n2[j], n2[k]]], [d1, d2]), X0 = [0, 0, 0]; X0[j] = xj; X0[k] = xk;
          const mm = cross(L, sub(P, X0));
          return dot(mm, X0) / mm[i];
        } }
      };
    }
  };

  // ---- lección 3: la recta en el espacio ----
  T["ga-recta-interseccion-num"] = {
    type: "numeric", concepts: ["ga-recta-espacio"], difficulty: 2,
    generate(r) {
      if (r.bool()) {
        const n1 = vec(r, 3), n2 = vec(r, 3), L = cross(n1, n2), k = r.int(0, 2);
        if (L[k] === 0) return null;
        const Q = vec(r, 4); Q[k] = 0;
        const d1 = dot(n1, Q), d2 = dot(n2, Q), [a, b] = [0, 1, 2].filter(q => q !== k), j = r.pick([a, b]);
        return {
          prompt: `La recta $r$ es la intersección de los planos $${plane(n1, d1)}$ y $${plane(n2, d2)}$. ¿En qué punto atraviesa el plano $${AX[k]} = 0$? Respondé su coordenada $${AX[j]}$.`,
          answer: Q[j],
          solution: [`El director de la [[ga-recta-espacio|recta como intersección de dos planos]] es $\\vec n_1\\times\\vec n_2 = ${pt(L)}$. Su componente $${AX[k]}$ no es $0$, así que la recta sí atraviesa el plano $${AX[k]} = 0$.`,
            `Con $${AX[k]} = 0$ queda el sistema $${H.poly([[n1[a], AX[a]], [n1[b], AX[b]]])} = ${d1}$, $\\;${H.poly([[n2[a], AX[a]], [n2[b], AX[b]]])} = ${d2}$.`,
            `Resolviéndolo, $${AX[a]} = ${Q[a]}$ y $${AX[b]} = ${Q[b]}$: el punto es $${pt(Q)}$.`],
          // verificación: se toma otro punto de la recta (con la coordenada k = 7) y se avanza por n₁ × n₂ hasta k = 0
          verify: { kind: "value", tol: 1e-9, fn: () => {
            const [xa, xb] = gaussSolve([[n1[a], n1[b]], [n2[a], n2[b]]], [d1 - 7 * n1[k], d2 - 7 * n2[k]]), X0 = [0, 0, 0];
            X0[a] = xa; X0[b] = xb; X0[k] = 7;
            return add(X0, L, -7 / L[k])[j];
          } }
        };
      }
      const P0 = vec(r, 3), u = vec(r, 3), n = vec(r, 3);
      if (isZero(u) || isZero(n) || dot(u, n) === 0) return null;
      const t0 = r.int(-2, 2), X = add(P0, u, t0), d = dot(n, X), j = r.int(0, 2);
      return {
        prompt: `¿En qué punto corta la recta $${lineTex(P0, u)}$ al plano $${plane(n, d)}$? Respondé su coordenada $${AX[j]}$.`,
        answer: X[j],
        solution: [`En paramétricas, la recta es $X = ${pt(P0)} + t\\,${pt(u)}$.`,
          `Reemplazando en el plano: $${H.poly([[dot(n, u), "t"], [dot(n, P0), ""]])} = ${d}$, así que $t = ${t0}$.`,
          `Como $\\vec u\\cdot\\vec n = ${dot(u, n)} \\neq 0$, hay un solo punto de corte ([[ga-recta-espacio|recta y plano]]): $${pt(X)}$.`],
        // verificación: bisección sobre t de la ecuación del plano evaluada en la recta
        verify: { kind: "value", tol: 1e-7, fn: () => add(P0, u, bisect(t => dot(n, add(P0, u, t)) - d, -1e3, 1e3))[j] }
      };
    }
  };

  T["ga-recta-plano-vf"] = {
    type: "tf", concepts: ["ga-recta-espacio"], difficulty: 2,
    generate(r) {
      const n = vec(r, 3);
      if (isZero(n)) return null;
      const kind = r.pick(["contenida", "paralela", "perpendicular", "oblicua"]), P = vec(r, 3);
      let u, d;
      if (kind === "contenida" || kind === "paralela") { u = cross(n, vec(r, 2)); d = dot(n, P) + (kind === "paralela" ? r.nz(-5, 5) : 0); }
      else if (kind === "perpendicular") { u = scal(n, r.pick([1, -1, 2])); d = dot(n, P) + r.int(-5, 5); }
      else { u = vec(r, 3); d = dot(n, P) + r.int(-5, 5); if (dot(u, n) === 0 || isZero(cross(u, n))) return null; }
      if (isZero(u)) return null;
      const CL = { contenida: "$r$ está contenida en $\\pi$", paralela: "$r$ es paralela a $\\pi$ sin estar contenida en él", perpendicular: "$r$ es perpendicular a $\\pi$", unico: "$r$ corta a $\\pi$ en un único punto" };
      const claim = r.pick(Object.keys(CL));
      const truth = { contenida: kind === "contenida", paralela: kind === "paralela", perpendicular: kind === "perpendicular", unico: kind === "perpendicular" || kind === "oblicua" };
      const un = dot(u, n), g0 = dot(n, P) - d;
      return {
        prompt: `<b>Verdadero o falso:</b> dados la recta $r: ${lineTex(P, u)}$ y el plano $\\pi: ${plane(n, d)}$, ${CL[claim]}.`,
        answer: truth[claim],
        explanation: `Director $\\vec u = ${pt(u)}$ y normal $\\vec n = ${pt(n)}$: $\\vec u\\cdot\\vec n = ${un}$. ` + (un === 0
          ? `Como da $0$, la recta es paralela al plano o está contenida en él; el punto $${pt(P)}$ ${g0 === 0 ? "cumple" : "no cumple"} la ecuación del plano, así que ${g0 === 0 ? "está contenida" : "es paralela sin tocarlo"}.`
          : `Como no da $0$, la recta corta al plano en un único punto. Además, $\\vec u$ ${kind === "perpendicular" ? "es" : "no es"} múltiplo de $\\vec n$, así que ${kind === "perpendicular" ? "es" : "no es"} perpendicular al plano.`) + ` (Ver [[ga-recta-espacio|recta y plano]]).`,
        solution: [`Se compara el director con la normal: perpendiculares (producto escalar $0$) significa recta paralela o contenida; paralelos, recta perpendicular al plano.`],
        // verificación: se evalúa la ecuación del plano en tres puntos de la recta y se compara u con direcciones del plano
        verify: { kind: "truth", fn: () => {
          const g = t => dot(n, add(P, u, t)) - d, vals = [0, 1, 2].map(g);
          const contained = vals.every(x => Math.abs(x) < 1e-9), parallel = !contained && Math.abs(vals[0] - vals[1]) < 1e-9 && Math.abs(vals[1] - vals[2]) < 1e-9;
          const dirs = [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map(e => cross(n, e)), perp = dirs.every(w => Math.abs(dot(u, w)) < 1e-9);
          return { contenida: contained, paralela: parallel, perpendicular: perp, unico: !contained && !parallel }[claim];
        } }
      };
    }
  };

  // ---- lección 4: dos rectas ----
  const POS = ["Coincidentes", "Paralelas distintas", "Secantes (se cortan en un punto)", "Alabeadas (se cruzan sin cortarse)"];
  T["ga-pos-rectas-mc"] = {
    type: "mc", concepts: ["ga-posicion-rectas"], difficulty: 2,
    generate(r) {
      const kind = r.int(0, 3), P = vec(r, 3), u = vec(r, 3);
      if (isZero(u)) return null;
      let Q, v, X, m, j;
      if (kind <= 1) {
        m = r.pick([1, 2, -1, -2, 3]); v = scal(u, m); j = r.nz(-2, 2);
        const w = kind === 0 ? scal(u, j) : vec(r, 2);
        if (kind === 1 && isZero(cross(w, u))) return null;
        Q = add(P, w);
      } else {
        v = vec(r, 3); if (isZero(cross(u, v))) return null;
        const t0 = r.int(-2, 2), s0 = r.int(-2, 2); X = add(P, u, t0);
        Q = add(add(X, v, -s0), kind === 3 ? cross(u, v) : [0, 0, 0]);
      }
      if (Math.max(...Q.map(Math.abs)) > 15) return null;
      const c = cross(u, v), PQ = sub(Q, P), mix = dot(PQ, c);
      return {
        prompt: `¿Cómo son las rectas $r_1: ${lineTex(P, u)}$ y $r_2: ${paramTex(Q, v, "s")}$?`,
        ...H.mc(r, POS[kind], POS.filter((_, i) => i !== kind), { text: true }),
        solution: kind <= 1
          ? [`Directores: $\\vec u = ${pt(u)}$ y $\\vec v = ${pt(v)}$, que son paralelos: $\\vec v = ${m}\\,\\vec u$.`,
            `[[ga-posicion-rectas|Posiciones relativas]]: falta ver si $Q = ${pt(Q)}$ está en $r_1$, que pasa por $P = ${pt(P)}$. ${kind === 0 ? `Sí: $\\overrightarrow{PQ} = ${pt(PQ)} = ${j}\\,\\vec u$, así que son coincidentes.` : `No: $\\overrightarrow{PQ} = ${pt(PQ)}$ no es paralelo a $\\vec u$, así que son paralelas distintas.`}`]
          : [`Directores: $\\vec u = ${pt(u)}$ y $\\vec v = ${pt(v)}$, que no son paralelos: $\\vec u\\times\\vec v = ${pt(c)} \\neq \\vec 0$.`,
            `Con $P = ${pt(P)}$ en $r_1$ y $Q = ${pt(Q)}$ en $r_2$: $[\\overrightarrow{PQ}, \\vec u, \\vec v] = ${pt(PQ)}\\cdot${pt(c)} = ${mix}$.`,
            kind === 2 ? `Da $0$: son [[ga-posicion-rectas|secantes]], y se cortan en $${pt(X)}$.` : `No da $0$: son [[ga-posicion-rectas|alabeadas]].`],
        // verificación: rangos (por Gauss) del sistema t·u − s·v = PQ y de su matriz ampliada
        verify: { kind: "truth", target: true, fn: () => {
          const A = [0, 1, 2].map(i => [u[i], -v[i]]), Ab = A.map((row, i) => row.concat([PQ[i]])), rA = rank(A), rAb = rank(Ab);
          const cls = rA === 1 ? (rAb === 1 ? 0 : 1) : (rAb === 2 ? 2 : 3);
          return cls === kind;
        } }
      };
    }
  };

  T["ga-dist-rectas-num"] = {
    type: "numeric", concepts: ["ga-distancias"], difficulty: 3,
    generate(r) {
      const kind = r.pick(["punto", "paralelas", "alabeadas", "alabeadas"]), P = vec(r, 3), u = vec(r, 3);
      if (isZero(u)) return null;
      const U = dot(u, u);
      if (kind !== "alabeadas") {
        const P0 = vec(r, 3), w = sub(P0, P), c = cross(w, u), C2 = dot(c, c);
        if (C2 === 0) return null;
        const ans = Math.sqrt(C2 / U), v = scal(u, r.pick([2, -1, -2, 3]));
        return {
          prompt: kind === "punto" ? `Calculá la distancia del punto $P_0 = ${pt(P0)}$ a la recta $r: ${lineTex(P, u)}$.`
            : `Las rectas $r_1: ${lineTex(P, u)}$ y $r_2: ${paramTex(P0, v, "s")}$ son paralelas. ¿A qué distancia están?`,
          answer: ans,
          solution: [...(kind === "paralelas" ? [`Como son paralelas, la distancia es la de cualquier punto de $r_2$ (por ejemplo $P_0 = ${pt(P0)}$) a $r_1$.`] : []),
            `La recta pasa por $P = ${pt(P)}$ con director $\\vec u = ${pt(u)}$, y $\\overrightarrow{PP_0} = ${pt(w)}$.`,
            `$\\overrightarrow{PP_0}\\times\\vec u = ${pt(c)}$, de módulo $${sq(C2)}$.`,
            `[[ga-distancias|Distancia de un punto a una recta]]: $D = \\frac{|\\overrightarrow{PP_0}\\times\\vec u|}{|\\vec u|} = \\frac{${sq(C2)}}{${sq(U)}} \\approx ${nd(ans)}$.`],
          // verificación: se minimiza |P₀ − (P + t·u)| sobre t con sección áurea
          verify: { kind: "value", tol: 1e-6, fn: () => { const f = t => { const e = sub(P0, add(P, u, t)); return dot(e, e); }; return Math.sqrt(f(golden(f, -60, 60))); } }
        };
      }
      const Q = vec(r, 3), v = vec(r, 3), V = dot(v, v), c = cross(u, v), C2 = dot(c, c);
      if (C2 === 0 || dot(u, v) ** 2 > 0.9 * U * V) return null;
      const PQ = sub(Q, P), mix = dot(PQ, c);
      if (mix === 0) return null;
      const ans = Math.abs(mix) / Math.sqrt(C2);
      return {
        prompt: `Las rectas $r_1: ${lineTex(P, u)}$ y $r_2: ${paramTex(Q, v, "s")}$ son alabeadas. Calculá la distancia entre ellas.`,
        answer: ans,
        solution: [`Directores $\\vec u = ${pt(u)}$ y $\\vec v = ${pt(v)}$: $\\vec u\\times\\vec v = ${pt(c)}$ es la dirección de la [[ga-distancias|perpendicular común]].`,
          `Con $P = ${pt(P)}$ y $Q = ${pt(Q)}$: $\\overrightarrow{PQ} = ${pt(PQ)}$ y $[\\overrightarrow{PQ}, \\vec u, \\vec v] = ${mix}$.`,
          `$D = \\frac{|[\\overrightarrow{PQ}, \\vec u, \\vec v]|}{|\\vec u\\times\\vec v|} = \\frac{${Math.abs(mix)}}{${sq(C2)}} \\approx ${nd(ans)}$.`],
        // verificación: minimización alternada (en t con s fijo, en s con t fijo) de la distancia entre puntos de las rectas
        verify: { kind: "value", tol: 1e-7, fn: () => {
          let t = 0, s = 0;
          for (let it = 0; it < 4000; it++) { t = dot(sub(add(Q, v, s), P), u) / U; s = dot(sub(add(P, u, t), Q), v) / V; }
          return norm(sub(add(P, u, t), add(Q, v, s)));
        } }
      };
    }
  };

  // ---- lección 5: ángulos y rectas en el plano ----
  T["ga-angulo-num"] = {
    type: "numeric", concepts: ["ga-angulos"], difficulty: 2,
    generate(r) {
      const kind = r.pick(["planos", "recta-plano", "rectas"]), a = vec(r, 3), b = vec(r, 3);
      if (isZero(a) || isZero(b) || isZero(cross(a, b))) return null;
      const A2 = dot(a, a), B2 = dot(b, b), p = dot(a, b), c = Math.abs(p) / Math.sqrt(A2 * B2);
      const ans = (kind === "recta-plano" ? Math.asin(c) : Math.acos(c)) / DEG;
      const P = vec(r, 3), Q = vec(r, 3), d1 = r.int(-6, 6), d2 = r.int(-6, 6);
      const [X, Y] = { planos: ["\\vec n_1", "\\vec n_2"], "recta-plano": ["\\vec u", "\\vec n"], rectas: ["\\vec u", "\\vec v"] }[kind];
      const fn = kind === "recta-plano" ? "\\sin" : "\\cos";
      return {
        prompt: { planos: `Calculá el ángulo agudo (en grados) entre los planos $${plane(a, d1)}$ y $${plane(b, d2)}$.`,
          "recta-plano": `Calculá el ángulo (en grados) entre la recta $${lineTex(P, a)}$ y el plano $${plane(b, d1)}$.`,
          rectas: `Calculá el ángulo agudo (en grados) entre las rectas $${lineTex(P, a)}$ y $${paramTex(Q, b, "s")}$.` }[kind],
        answer: ans,
        solution: [`[[ga-angulos|${{ planos: "Ángulo entre dos planos", "recta-plano": "Ángulo entre una recta y un plano", rectas: "Ángulo entre rectas" }[kind]}]]: $${fn}\\theta = \\frac{|${X}\\cdot${Y}|}{|${X}|\\,|${Y}|}$${kind === "planos" ? ", con las normales" : kind === "rectas" ? ", con los directores" : ", con el director y la normal"}.`,
          `$${X} = ${pt(a)}$ y $${Y} = ${pt(b)}$: $${X}\\cdot${Y} = ${p}$, $|${X}| = ${sq(A2)}$, $|${Y}| = ${sq(B2)}$.`,
          `$${fn}\\theta = \\frac{${Math.abs(p)}}{${sq(A2 * B2)}} \\approx ${nd(c)}$, así que $\\theta \\approx ${nd(ans, 2)}^\\circ$.`],
        // verificación: diedro con vectores de cada plano perpendiculares a la intersección; recta–plano con la sombra de u;
        // rectas con el teorema del coseno en el triángulo de lados u, v y u − v
        verify: { kind: "value", tol: 1e-6, fn: () => {
          if (kind === "planos") { const L = cross(a, b), w1 = cross(L, a), w2 = cross(L, b); return Math.atan2(norm(cross(w1, w2)), Math.abs(dot(w1, w2))) / DEG; }
          if (kind === "recta-plano") { const sh = add(a, b, -p / B2); return Math.atan2(norm(sub(a, sh)), norm(sh)) / DEG; }
          const D2 = dot(sub(a, b), sub(a, b)), th = Math.acos((A2 + B2 - D2) / (2 * Math.sqrt(A2 * B2))) / DEG;
          return Math.min(th, 180 - th);
        } }
      };
    }
  };

  T["ga-haz-rectas-num"] = {
    type: "numeric", concepts: ["ga-recta-plano-xy"], difficulty: 2,
    generate(r) {
      const I = [r.int(-4, 4), r.int(-4, 4)], a1 = r.nz(-4, 4), b1 = r.int(-4, 4), a2 = r.int(-4, 4), b2 = r.nz(-4, 4);
      if (a1 * b2 - a2 * b1 === 0) return null;
      const c1 = a1 * I[0] + b1 * I[1], c2 = a2 * I[0] + b2 * I[1], P = [r.int(-5, 5), r.int(-5, 5)];
      const e1 = a1 * P[0] + b1 * P[1] - c1, e2 = a2 * P[0] + b2 * P[1] - c2;
      if (e1 === 0 || e2 === 0 || P[0] === I[0]) return null;
      const [A, B, C] = simp([e2 * a1 - e1 * a2, e2 * b1 - e1 * b2, e2 * c1 - e1 * c2]), kind = r.pick(["pend", "ord", "absc"]);
      if (kind === "absc" && A === 0) return null;
      const ans = { pend: -A / B, ord: C / B, absc: C / A }[kind], aTex = { pend: H.frac(-A, B), ord: H.frac(C, B), absc: H.frac(C, A) }[kind];
      return {
        prompt: `En el plano $xy$, considerá la recta que pasa por $P = (${P.join(", ")})$ y por el punto de intersección de $r_1: ${line2(a1, b1, c1)}$ y $r_2: ${line2(a2, b2, c2)}$. ¿Cuánto vale ${{ pend: "su pendiente", ord: "su ordenada al origen", absc: "su abscisa al origen (donde corta al eje $x$)" }[kind]}?`,
        answer: ans, answerTex: aTex,
        solution: [`[[ga-recta-plano-xy|Haz de rectas]] por $r_1 \\cap r_2$: $(${H.poly([[a1, "x"], [b1, "y"], [-c1, ""]])}) + \\lambda\\,(${H.poly([[a2, "x"], [b2, "y"], [-c2, ""]])}) = 0$.`,
          `Reemplazando $P$: $${e1} + \\lambda\\cdot${H.par(e2)} = 0$, así que $\\lambda = ${H.frac(-e1, e2)}$.`,
          `Sacando denominadores y simplificando: $${line2(A, B, C)}$.`,
          { pend: `Despejando $y$, la pendiente es $m = -\\frac ab = ${aTex}$.`, ord: `Con $x = 0$: $y = ${aTex}$.`, absc: `Con $y = 0$: $x = ${aTex}$.` }[kind]],
        // verificación: se calcula el punto de corte con Cramer y se arma la recta por dos puntos
        verify: { kind: "value", tol: 1e-9, fn: () => {
          const det = a1 * b2 - a2 * b1, x = (c1 * b2 - c2 * b1) / det, y = (a1 * c2 - a2 * c1) / det, m = (P[1] - y) / (P[0] - x);
          return { pend: m, ord: P[1] - m * P[0], absc: P[0] - P[1] / m }[kind];
        } }
      };
    }
  };

  const cards = {
    "ga-plano": {
      title: "Ecuaciones del plano", aliases: ["ecuación general del plano", "ecuación segmentaria del plano", "forma normal de Hesse", "Hesse", "plano por tres puntos"], concepts: ["ga-plano"],
      summary: "Plano por P₀ con normal n: n·(X − P₀) = 0, o sea ax + by + cz = d. Segmentaria: x/p + y/q + z/r = 1. Normal de Hesse: n̂·X = δ, con δ ≥ 0 la distancia al origen.",
      def: [R`**Punto y normal:** el plano que pasa por $P_0 = (x_0, y_0, z_0)$ y es perpendicular a $\vec n = (a, b, c) \neq \vec 0$ es $$\vec n\cdot(X - P_0) = 0 \iff a(x - x_0) + b(y - y_0) + c(z - z_0) = 0.$$`,
        R`**Ecuación general:** $ax + by + cz = d$. Los coeficientes de $x$, $y$, $z$ son las componentes de una normal.`,
        R`**Por tres puntos** no alineados $A, B, C$: se toma $\vec n = \overrightarrow{AB}\times\overrightarrow{AC}$ ([[al-producto-vectorial]]) y se impone que pase por $A$. **Vectorial:** $X = A + s\,\overrightarrow{AB} + t\,\overrightarrow{AC}$, con $s, t \in \mathbb R$.`,
        R`**Segmentaria:** si el plano corta a los ejes en $(p, 0, 0)$, $(0, q, 0)$ y $(0, 0, r)$, con $p, q, r \neq 0$: $\;\frac xp + \frac yq + \frac zr = 1$.`,
        R`**Normal de Hesse:** $\hat n\cdot X = \delta$, con $\hat n$ unitario y $\delta \ge 0$. Se obtiene dividiendo la general por $\pm|\vec n|$, con el signo de $d$, y $\delta$ es la distancia del plano al origen.`],
      idea: [R`Un plano queda fijo con **un punto y una dirección perpendicular**: los vectores que salen de $P_0$ y son perpendiculares a $\vec n$ barren todo el plano. Las otras formas son la misma información reordenada: la segmentaria muestra dónde corta a los ejes, y la de Hesse, a qué distancia del origen pasa.`,
        R`La normal no es única: cualquier múltiplo no nulo sirve. Conviene simplificarla, dividiendo por el factor común, antes de seguir con las cuentas.`],
      demo: [R`**Paso 1 (punto y normal).** Un punto $X$ está en el plano exactamente cuando el vector $X - P_0$ queda acostado en el plano, o sea, cuando es perpendicular a $\vec n$. Con el [[al-producto-escalar|producto escalar]], eso se escribe $\vec n\cdot(X - P_0) = 0$.`,
        R`**Paso 2 (general).** Desarrollamos ese producto con componentes y pasamos las constantes a la derecha: $ax + by + cz = ax_0 + by_0 + cz_0$. Llamando $d$ al número de la derecha queda $ax + by + cz = d$. Al revés, si $(a, b, c) \neq \vec 0$ la ecuación tiene alguna solución $P_0$, y restándole $\vec n\cdot P_0 = d$ vuelve a la forma del Paso 1: siempre es un plano de normal $(a, b, c)$.`,
        R`**Paso 3 (segmentaria).** Si $d \neq 0$ dividimos por $d$: $\frac ad x + \frac bd y + \frac cd z = 1$. Con $a, b, c \neq 0$ llamamos $p = \frac da$, $q = \frac db$, $r = \frac dc$, y queda $\frac xp + \frac yq + \frac zr = 1$. Poniendo $y = z = 0$ sale $x = p$: el plano corta al eje $x$ en $(p, 0, 0)$, y lo mismo pasa con los otros ejes.`,
        R`**Paso 4 (Hesse).** Dividimos la general por $\sigma|\vec n|$, donde $\sigma = \pm 1$ es el signo de $d$: $\frac{\sigma\vec n}{|\vec n|}\cdot X = \frac{|d|}{|\vec n|}$. El vector de la izquierda es unitario, porque dividimos un vector por su módulo, y el número de la derecha, $\delta = \frac{|d|}{|\vec n|}$, no es negativo.`,
        R`**Paso 5 (qué mide δ).** El punto del plano más cercano al origen está sobre la recta que sale del origen en la dirección perpendicular, la de $\hat n$: es de la forma $X = t\hat n$. Reemplazando en $\hat n\cdot X = \delta$ y usando $\hat n\cdot\hat n = 1$ sale $t = \delta$, así que ese punto está a distancia $\delta$ del origen. $\blacksquare$`],
      examples: [{ q: R`Plano por $A = (1, 0, 2)$, $B = (2, 1, 2)$ y $C = (1, 2, 3)$, en forma general y de Hesse.`,
        steps: [R`$\overrightarrow{AB} = (1, 1, 0)$ y $\overrightarrow{AC} = (0, 2, 1)$, así que $\vec n = (1\cdot1 - 0\cdot2,\; 0\cdot0 - 1\cdot1,\; 1\cdot2 - 1\cdot0) = (1, -1, 2)$.`,
          R`Por $A$: $x - y + 2z = 1 - 0 + 4 = 5$.`,
          R`$|\vec n| = \sqrt6$ y $d > 0$: $\frac{x - y + 2z}{\sqrt6} = \frac{5}{\sqrt6}$. El plano pasa a $\frac{5}{\sqrt6} \approx 2{,}04$ del origen.`] }],
      tips: [R`Si los tres puntos están alineados, $\overrightarrow{AB}\times\overrightarrow{AC} = \vec 0$: no definen un único plano.`,
        R`Un plano que pasa por el origen ($d = 0$) no tiene ecuación segmentaria, y uno paralelo a un eje (por ejemplo, sin término en $z$) no lo corta: le falta ese denominador.`],
      see: ["c2-rectas-planos", "al-producto-vectorial", "ga-distancias", "ga-haz-planos"]
    },
    "ga-haz-planos": {
      title: "Haz de planos", aliases: ["haz de planos", "planos que contienen a una recta"], concepts: ["ga-haz-planos"],
      summary: "Los planos que contienen a la recta π₁ ∩ π₂ son α·π₁ + β·π₂ = 0; en la práctica se usa π₁ + λ·π₂ = 0, que los da a todos menos a π₂.",
      def: [R`Si $\pi_1: F_1(X) = a_1x + b_1y + c_1z - d_1 = 0$ y $\pi_2: F_2(X) = a_2x + b_2y + c_2z - d_2 = 0$ se cortan en una recta $r$, el **haz de planos** de eje $r$ es el conjunto de todos los planos que contienen a $r$: $$\alpha\,F_1(X) + \beta\,F_2(X) = 0, \qquad (\alpha, \beta) \neq (0, 0).$$`,
        R`Con $\alpha = 1$ y $\beta = \lambda$ se obtienen todos menos $\pi_2$.`],
      idea: [R`Es como una puerta que gira sobre sus bisagras: el eje es la recta, y cada valor de $\lambda$ es una posición de la puerta. Para elegir uno se impone una condición más, por ejemplo que pase por un punto fuera de la recta.`,
        R`La ventaja es que no hace falta calcular la recta: el plano buscado sale directamente de las ecuaciones de $\pi_1$ y $\pi_2$.`],
      demo: [R`**Paso 1 (todos contienen a la recta).** Si $X$ está en $r$, está en los dos planos, así que $F_1(X) = F_2(X) = 0$, y entonces $\alpha F_1(X) + \beta F_2(X) = 0$: $X$ cumple la ecuación de la combinación.`,
        R`**Paso 2 (es un plano).** La combinación es de primer grado, con normal $\alpha\vec n_1 + \beta\vec n_2$. Como $\pi_1$ y $\pi_2$ se cortan en una recta, sus normales no son paralelas, es decir, son [[al-vectores|linealmente independientes]], y esa combinación no se anula si $(\alpha, \beta) \neq (0, 0)$: la ecuación es la de un plano de verdad.`,
        R`**Paso 3 (no falta ninguno).** Sea $\pi$ un plano que contiene a $r$, y sea $Q$ un punto de $\pi$ fuera de $r$. Elegimos $\alpha = F_2(Q)$ y $\beta = -F_1(Q)$, que no son los dos cero porque $Q$ no está en los dos planos a la vez. Con esa elección, la combinación se anula en $Q$: $F_2(Q)F_1(Q) - F_1(Q)F_2(Q) = 0$.`,
        R`**Paso 4.** El plano de la combinación contiene a $r$ (Paso 1) y a $Q$. Como una recta y un punto fuera de ella determinan un único plano, ese plano es $\pi$. $\blacksquare$`],
      examples: [{ q: R`Plano que contiene a la recta $\begin{cases} x + y = 1\\ z = 2\end{cases}$ y pasa por el origen.`,
        steps: [R`Haz: $(x + y - 1) + \lambda\,(z - 2) = 0$.`, R`En $(0, 0, 0)$: $-1 - 2\lambda = 0$, así que $\lambda = -\frac12$.`,
          R`Multiplicando por $2$: $2x + 2y - z = 0$. Chequeo: $(1, 0, 2)$ está en la recta y cumple $2 + 0 - 2 = 0$.`] }],
      tips: [R`Si el punto impuesto da $F_2(Q) = 0$, el plano buscado es el propio $\pi_2$, que la forma con $\lambda$ no incluye.`],
      see: ["ga-plano", "ga-recta-espacio", "ga-recta-plano-xy"]
    },
    "ga-recta-espacio": {
      title: "La recta en el espacio", aliases: ["ecuaciones simétricas", "forma simétrica de la recta", "vector director", "recta como intersección de dos planos"], concepts: ["ga-recta-espacio"],
      summary: "Recta por P₀ con director u: X = P₀ + t·u (vectorial), sus tres coordenadas (paramétricas), (x − x₀)/u₁ = (y − y₀)/u₂ = (z − z₀)/u₃ (simétricas), o como intersección de dos planos, con director n₁ × n₂.",
      def: [R`**Vectorial:** $X = P_0 + t\,\vec u$, $t \in \mathbb R$, con $P_0$ un punto de la recta y $\vec u \neq \vec 0$ el **vector director**.`,
        R`**Paramétricas:** $x = x_0 + tu_1$, $y = y_0 + tu_2$, $z = z_0 + tu_3$. **Simétricas** (si $u_1, u_2, u_3 \neq 0$): $$\frac{x - x_0}{u_1} = \frac{y - y_0}{u_2} = \frac{z - z_0}{u_3}.$$ Si una componente es $0$, esa coordenada queda fija aparte (por ejemplo, $z = z_0$).`,
        R`**Como intersección de dos planos** no paralelos: $\begin{cases} a_1x + b_1y + c_1z = d_1\\ a_2x + b_2y + c_2z = d_2\end{cases}$, con director $\vec u = \vec n_1\times\vec n_2$.`,
        R`**Recta y plano** $\vec n\cdot X = d$: si $\vec u\cdot\vec n \neq 0$ se cortan en un único punto; si $\vec u\cdot\vec n = 0$, la recta es paralela al plano o está contenida en él, según si $P_0$ cumple la ecuación. Si $\vec u$ es paralelo a $\vec n$, la recta es perpendicular al plano.`],
      idea: [R`La paramétrica es un **movimiento**: $t$ es el tiempo, $P_0$ la posición inicial y $\vec u$ la velocidad. Las simétricas salen de despejar $t$ de cada coordenada e igualar.`,
        R`Para cortar una recta con un plano, se reemplazan las paramétricas en la ecuación del plano: queda una ecuación de primer grado en $t$.`],
      demo: [R`**Paso 1 (paramétricas y simétricas).** La igualdad vectorial $X = P_0 + t\vec u$ vale componente a componente, y eso da las tres paramétricas. Si $u_1 \neq 0$, de la primera se despeja $t = \frac{x - x_0}{u_1}$, y lo mismo con las otras dos; como el $t$ es el mismo en las tres, los tres cocientes son iguales.`,
        R`**Paso 2 (director de la intersección).** La recta está en $\pi_1$, así que su director es perpendicular a la normal $\vec n_1$; por estar en $\pi_2$, también es perpendicular a $\vec n_2$. El [[al-producto-vectorial|producto vectorial]] $\vec n_1\times\vec n_2$ es perpendicular a los dos y no es nulo, porque las normales no son paralelas. En el espacio, los vectores perpendiculares a dos vectores independientes forman una sola dirección, así que $\vec n_1\times\vec n_2$ es un director.`,
        R`**Paso 3 (un punto de la intersección).** Falta un punto: se le da un valor a una coordenada (por ejemplo $z = 0$) y se resuelve el sistema de $2\times2$ que queda en las otras dos. Funciona si la componente $z$ del director no es nula, porque entonces la recta sí atraviesa el plano $z = 0$.`,
        R`**Paso 4 (recta y plano).** Reemplazamos $X = P_0 + t\vec u$ en $\vec n\cdot X = d$ y usamos la linealidad del producto escalar: $\vec n\cdot P_0 + t\,(\vec n\cdot\vec u) = d$. Si $\vec n\cdot\vec u \neq 0$ se despeja un único $t$, o sea, un único punto de corte. Si $\vec n\cdot\vec u = 0$, la ecuación no depende de $t$: o la cumple todo $t$ (recta contenida) o ninguno (recta paralela). $\blacksquare$`],
      examples: [{ q: R`Escribí en forma simétrica la recta $\begin{cases} x + y + z = 3\\ x - y = 1\end{cases}$.`,
        steps: [R`$\vec u = (1, 1, 1)\times(1, -1, 0) = (1\cdot0 - 1\cdot(-1),\; 1\cdot1 - 1\cdot0,\; 1\cdot(-1) - 1\cdot1) = (1, 1, -2)$.`,
          R`Con $z = 0$: $x + y = 3$ y $x - y = 1$, así que $x = 2$, $y = 1$.`, R`$\frac{x - 2}{1} = \frac{y - 1}{1} = \frac{z}{-2}$.`] }],
      tips: [R`Una misma recta tiene infinitas ecuaciones: el punto puede ser cualquiera de la recta y el director puede multiplicarse por cualquier número no nulo. Para comparar dos rectas no compares ecuaciones: compará directores y fijate si un punto de una está en la otra.`],
      see: ["c2-rectas-planos", "ga-plano", "ga-posicion-rectas"]
    },
    "ga-recta-plano-xy": {
      title: "La recta en el plano", aliases: ["recta en el plano", "ecuación segmentaria de la recta", "forma pendiente-ordenada", "haz de rectas", "ordenada al origen"], concepts: ["ga-recta-plano-xy"],
      summary: "En el plano: y = mx + h (pendiente y ordenada), x/p + y/q = 1 (segmentaria), ax + by = c con normal (a, b), y el haz α·r₁ + β·r₂ = 0 de las rectas que pasan por r₁ ∩ r₂.",
      def: [R`**General:** $ax + by = c$, con $(a, b) \neq (0, 0)$. El vector $(a, b)$ es **normal** a la recta y $(-b, a)$ es director.`,
        R`**Pendiente y ordenada al origen** (si $b \neq 0$): $y = mx + h$, con $m = -\frac ab$ y $h = \frac cb$. **Por dos puntos:** $m = \frac{y_2 - y_1}{x_2 - x_1}$ e $y - y_1 = m(x - x_1)$.`,
        R`**Segmentaria** (corta a los ejes en $(p, 0)$ y $(0, q)$, con $p, q \neq 0$): $\frac xp + \frac yq = 1$. **Normal:** $x\cos\omega + y\sin\omega = \delta$, con $\delta \ge 0$ la distancia al origen.`,
        R`**Haz de rectas** por el punto de corte de $r_1: a_1x + b_1y - c_1 = 0$ y $r_2: a_2x + b_2y - c_2 = 0$: $\;\alpha(a_1x + b_1y - c_1) + \beta(a_2x + b_2y - c_2) = 0$.`,
        R`**Distancia** de $(x_0, y_0)$ a $ax + by = c$: $\frac{|ax_0 + by_0 - c|}{\sqrt{a^2 + b^2}}$. Dos rectas son paralelas si sus normales lo son, y perpendiculares si $m_1m_2 = -1$.`],
      idea: [R`Es el caso plano de [[ga-plano]]: en $\mathbb R^2$ una ecuación de primer grado define una recta, igual que en $\mathbb R^3$ define un plano. Por eso la normal, la forma de Hesse, la distancia y el haz funcionan igual, con una coordenada menos.`,
        R`El haz evita calcular el punto de intersección: se impone directamente la condición que falta.`],
      demo: [R`**Paso 1 (normal).** Si $P_1$ y $P_2$ están en la recta, al restar sus ecuaciones se cancela $c$ y queda $a(x_2 - x_1) + b(y_2 - y_1) = 0$, o sea $(a, b)\cdot(P_2 - P_1) = 0$: la normal es perpendicular a todo vector de la recta. Un director es entonces $(-b, a)$, que cumple $(a, b)\cdot(-b, a) = 0$.`,
        R`**Paso 2 (pendiente).** Si $b \neq 0$ despejamos $y$: $y = -\frac ab x + \frac cb$. Avanzar $1$ en $x$ cambia $y$ en $-\frac ab$: esa es la pendiente $m$. Con $x = 0$ sale $y = \frac cb$, la ordenada al origen.`,
        R`**Paso 3 (segmentaria).** Si $c \neq 0$ dividimos por $c$: $\frac ac x + \frac bc y = 1$, y con $a, b \neq 0$ llamamos $p = \frac ca$ y $q = \frac cb$. Poniendo $y = 0$ sale $x = p$, y poniendo $x = 0$, $y = q$: son los cortes con los ejes.`,
        R`**Paso 4 (haz).** Es el mismo argumento que en el [[ga-haz-planos|haz de planos]]. El punto de corte $I$ anula las dos expresiones, así que anula cualquier combinación, y la combinación es una recta porque las normales de $r_1$ y $r_2$ no son paralelas. Al revés, para una recta por $I$ y otro punto $Q$ suyo, la elección $\alpha = F_2(Q)$, $\beta = -F_1(Q)$ hace que la combinación pase por $Q$, y dos puntos distintos determinan una sola recta. $\blacksquare$`],
      examples: [{ q: R`Recta que pasa por $(0, 0)$ y por el punto de corte de $x + y = 4$ y $x - y = 2$.`,
        steps: [R`Haz: $(x + y - 4) + \lambda\,(x - y - 2) = 0$.`, R`En $(0, 0)$: $-4 - 2\lambda = 0$, $\lambda = -2$, y queda $(x + y - 4) - 2(x - y - 2) = -x + 3y = 0$.`,
          R`$y = \frac13 x$. Chequeo: el punto de corte es $(3, 1)$, y cumple $1 = \frac13\cdot 3$.`] }],
      tips: [R`Una recta vertical $x = k$ no tiene pendiente (ni forma $y = mx + h$), y una que pasa por el origen no tiene segmentaria.`],
      see: ["ga-haz-planos", "ga-plano", "ga-distancias"]
    },
    "ga-posicion-rectas": {
      title: "Posiciones relativas de dos rectas", aliases: ["posiciones relativas de dos rectas", "rectas secantes", "rectas paralelas", "rectas coincidentes", "rectas que se cruzan"], concepts: ["ga-posicion-rectas"],
      summary: "Con directores paralelos, las rectas son coincidentes o paralelas distintas; si no, se cortan cuando el producto mixto [PQ, u, v] es 0 y son alabeadas cuando no lo es.",
      def: [R`Sean $r_1: X = P + t\vec u$ y $r_2: X = Q + s\vec v$. Hay cuatro posibilidades:`,
        R`**Coincidentes:** $\vec u \parallel \vec v$ y $Q \in r_1$. **Paralelas distintas:** $\vec u \parallel \vec v$ y $Q \notin r_1$.`,
        R`**Secantes:** $\vec u \nparallel \vec v$ y $[\overrightarrow{PQ}, \vec u, \vec v] = 0$; se cortan en un único punto. **Alabeadas:** $\vec u \nparallel \vec v$ y $[\overrightarrow{PQ}, \vec u, \vec v] \neq 0$; no se cortan ni son paralelas.`],
      idea: [R`En el plano, dos rectas no paralelas siempre se cortan. En el espacio hay lugar para que una pase «por arriba» de la otra: son las alabeadas, como una ruta y el puente que la cruza.`,
        R`El producto mixto dice si $r_1$ y $r_2$ caben en un mismo plano: las coplanares no paralelas se cortan, y las que no son coplanares se cruzan.`],
      demo: [R`**Paso 1 (planteo).** Las rectas tienen un punto común si y solo si existen $t$ y $s$ con $P + t\vec u = Q + s\vec v$, o sea, $t\vec u - s\vec v = \overrightarrow{PQ}$. Son tres ecuaciones (una por coordenada) con dos incógnitas.`,
        R`**Paso 2 (directores paralelos).** Si $\vec v = k\vec u$, las dos rectas tienen la misma dirección. Si comparten un punto, comparten todos, porque desde ese punto avanzan en la misma dirección: son coincidentes. Por eso basta ver si $Q$ está en $r_1$; si no está, son paralelas distintas.`,
        R`**Paso 3 (no paralelos: si se cortan, el mixto es cero).** Si hay solución, $\overrightarrow{PQ} = t\vec u - s\vec v$ es combinación lineal de $\vec u$ y $\vec v$. Entonces los tres vectores son [[ga-coplanaridad|coplanares]] y el producto mixto vale $0$.`,
        R`**Paso 4 (si el mixto es cero, se cortan).** Si $[\overrightarrow{PQ}, \vec u, \vec v] = 0$, los tres vectores son linealmente dependientes. Como $\vec u$ y $\vec v$ son independientes (no son paralelos), en esa dependencia tiene que aparecer $\overrightarrow{PQ}$, y se puede despejar $\overrightarrow{PQ} = t\vec u - s\vec v$ para algunos $t, s$: eso da el punto común. Es único, porque si hubiera dos, las rectas compartirían la recta que los une y serían la misma. $\blacksquare$`],
      examples: [{ q: R`$r_1: X = (0, 0, 0) + t\,(1, 0, 0)$ y $r_2: X = (0, 1, 1) + s\,(0, 1, 0)$.`,
        steps: [R`Los directores no son paralelos.`, R`$[\overrightarrow{PQ}, \vec u, \vec v] = \det\begin{pmatrix}0&1&1\\1&0&0\\0&1&0\end{pmatrix} = 1 \neq 0$: son alabeadas.`,
          R`Se ve también a ojo: $r_1$ es el eje $x$, y $r_2$ es paralela al eje $y$ a altura $z = 1$, así que nunca toca al eje $x$.`] }],
      tips: [R`Que los directores no sean paralelos **no** alcanza para que se corten: falta el producto mixto. Es el error más frecuente.`],
      see: ["c2-rectas-planos", "ga-coplanaridad", "ga-distancias", "ga-recta-espacio"]
    },
    "ga-distancias": {
      title: "Distancias entre puntos, rectas y planos", aliases: ["distancia entre planos paralelos", "distancia de un punto a una recta", "distancia entre rectas alabeadas", "perpendicular común"], concepts: ["ga-distancias"],
      summary: "Punto–plano: |n·P₀ − d|/|n|. Planos paralelos: |d₁ − d₂|/|n|. Punto–recta: |PP₀ × u|/|u|. Rectas alabeadas: |[PQ, u, v]|/|u × v|.",
      def: [R`**Punto–plano:** de $P_0$ a $ax + by + cz = d$, $\;D = \frac{|ax_0 + by_0 + cz_0 - d|}{\sqrt{a^2 + b^2 + c^2}}$.`,
        R`**Planos paralelos** $\vec n\cdot X = d_1$ y $\vec n\cdot X = d_2$, escritos con la misma normal: $\;D = \frac{|d_1 - d_2|}{|\vec n|}$.`,
        R`**Punto–recta:** de $P_0$ a $X = P + t\vec u$, $\;D = \frac{|\overrightarrow{PP_0}\times\vec u|}{|\vec u|}$. Sirve también para dos rectas paralelas, tomando $P_0$ en una de ellas.`,
        R`**Rectas alabeadas** $X = P + t\vec u$ y $X = Q + s\vec v$: $\;D = \frac{|[\overrightarrow{PQ}, \vec u, \vec v]|}{|\vec u\times\vec v|}$, medida sobre la **perpendicular común**.`],
      idea: [R`Todas son la misma idea: la distancia es el largo del segmento más corto, y ese segmento es **perpendicular** a lo que se mide. Por eso aparecen proyecciones sobre una normal (planos, alabeadas) o la altura de un paralelogramo (punto–recta).`],
      demo: [R`**Paso 1 (punto–plano).** Tomamos un punto $Q$ del plano. El segmento más corto de $P_0$ al plano es perpendicular a él, o sea, va en la dirección de $\vec n$, así que su largo es el valor absoluto de la [[ga-proyeccion-eje|proyección]] de $\overrightarrow{QP_0}$ sobre $\vec n$: $D = \frac{|\vec n\cdot(P_0 - Q)|}{|\vec n|}$. Como $Q$ está en el plano, $\vec n\cdot Q = d$, y el numerador queda $|ax_0 + by_0 + cz_0 - d|$.`,
        R`**Paso 2 (planos paralelos).** Tomamos $P_0$ en el primer plano, así que $\vec n\cdot P_0 = d_1$, y le aplicamos el Paso 1 respecto del segundo: $D = \frac{|d_1 - d_2|}{|\vec n|}$. Si las normales de las ecuaciones son múltiplos distintos, antes hay que dividir una para que queden iguales.`,
        R`**Paso 3 (punto–recta).** Armamos el paralelogramo de lados $\vec u$ y $\overrightarrow{PP_0}$. Su área es $|\overrightarrow{PP_0}\times\vec u|$ ([[ga-areas-volumenes]]) y su base mide $|\vec u|$. La altura sobre esa base es justamente la distancia de $P_0$ a la recta, y vale área sobre base.`,
        R`**Paso 4 (alabeadas: la dirección).** El segmento más corto entre las dos rectas es perpendicular a ambas: si no lo fuera, se lo podría acortar corriendo uno de sus extremos. Su dirección es entonces la de $\vec n = \vec u\times\vec v$, que no es nulo porque las rectas no son paralelas.`,
        R`**Paso 5.** El plano que contiene a $r_1$ con normal $\vec n$ existe, porque $\vec u \perp \vec n$, y lo mismo pasa con $r_2$; esos dos planos son paralelos. La distancia entre las rectas es la distancia entre esos planos, que es la proyección de $\overrightarrow{PQ}$ sobre $\vec n$: $D = \frac{|\overrightarrow{PQ}\cdot(\vec u\times\vec v)|}{|\vec u\times\vec v|}$, y el numerador es el [[al-producto-vectorial|producto mixto]]. $\blacksquare$`],
      examples: [{ q: R`Distancia de $P_0 = (1, 2, 3)$ al eje $x$, $\;X = (0, 0, 0) + t\,(1, 0, 0)$.`,
        steps: [R`$\overrightarrow{PP_0}\times\vec u = (1, 2, 3)\times(1, 0, 0) = (0, 3, -2)$.`, R`$D = \frac{\sqrt{13}}{1} \approx 3{,}61$, que coincide con $\sqrt{2^2 + 3^2}$, como tenía que pasar.`] }],
      tips: [R`Antes de usar la fórmula de planos paralelos, igualá las normales: $x + y = 1$ y $2x + 2y = 6$ distan $\frac{|1 - 3|}{\sqrt2}$, no $\frac{|1 - 6|}{\sqrt2}$.`],
      see: ["c2-rectas-planos", "ga-proyeccion-eje", "ga-posicion-rectas", "ga-areas-volumenes"]
    },
    "ga-angulos": {
      title: "Ángulos entre rectas y planos", aliases: ["ángulo entre dos planos", "ángulo entre planos", "ángulo entre rectas", "ángulo entre una recta y un plano", "ángulo diedro"], concepts: ["ga-angulos"],
      summary: "Entre planos: el de las normales, cos θ = |n₁·n₂|/(|n₁||n₂|). Entre rectas: el de los directores. Entre recta y plano: sen θ = |u·n|/(|u||n|).",
      def: [R`Se toma siempre el ángulo **agudo**, entre $0^\circ$ y $90^\circ$; por eso aparecen valores absolutos.`,
        R`**Dos planos:** $\cos\theta = \frac{|\vec n_1\cdot\vec n_2|}{|\vec n_1|\,|\vec n_2|}$. Son perpendiculares si $\vec n_1\cdot\vec n_2 = 0$ y paralelos si las normales lo son.`,
        R`**Dos rectas** de directores $\vec u$ y $\vec v$: $\cos\theta = \frac{|\vec u\cdot\vec v|}{|\vec u|\,|\vec v|}$ (vale también para alabeadas).`,
        R`**Recta y plano:** $\sin\theta = \frac{|\vec u\cdot\vec n|}{|\vec u|\,|\vec n|}$, el complemento del ángulo entre $\vec u$ y la normal.`],
      idea: [R`El ángulo entre dos planos (el **diedro**) se ve mirando de frente la recta en que se cortan: los planos se ven como dos rectas, y sus normales, perpendiculares a ellas, forman el mismo ángulo.`,
        R`Entre una recta y un plano, lo natural es el ángulo entre la recta y su sombra sobre el plano. La normal está a $90^\circ$ de esa sombra, y por eso aparece el seno en lugar del coseno.`],
      demo: [R`**Paso 1 (rectas).** El ángulo entre dos rectas es el de sus directores, que sale de la definición del [[al-producto-escalar|producto escalar]]: $\cos\varphi = \frac{\vec u\cdot\vec v}{|\vec u|\,|\vec v|}$. Cambiar $\vec v$ por $-\vec v$, que da la misma recta, cambia $\varphi$ por $180^\circ - \varphi$; quedarse con el agudo equivale a poner valor absoluto.`,
        R`**Paso 2 (planos).** Cortamos los dos planos con un plano perpendicular a su recta de intersección. Ahí se ven como dos rectas que forman el ángulo diedro $\theta$. Las normales $\vec n_1$ y $\vec n_2$ son perpendiculares a la recta de intersección, así que están en ese plano de corte, y cada una es perpendicular a una de las dos rectas.`,
        R`**Paso 3.** Girar dos rectas $90^\circ$ dentro del mismo plano no cambia el ángulo entre ellas, así que el ángulo agudo entre las normales es $\theta$, y vale la fórmula del Paso 1 con $\vec n_1$ y $\vec n_2$.`,
        R`**Paso 4 (recta y plano).** Sea $\varphi$ el ángulo agudo entre $\vec u$ y la normal: $\cos\varphi = \frac{|\vec u\cdot\vec n|}{|\vec u|\,|\vec n|}$. La recta, su sombra sobre el plano y la normal están en un mismo plano, y la normal es perpendicular a la sombra, así que $\theta + \varphi = 90^\circ$. Entonces $\sin\theta = \cos\varphi$. $\blacksquare$`],
      examples: [{ q: R`Ángulo entre los planos $x + y = 0$ e $y + z = 1$.`,
        steps: [R`$\vec n_1 = (1, 1, 0)$, $\vec n_2 = (0, 1, 1)$: $\vec n_1\cdot\vec n_2 = 1$ y los dos módulos valen $\sqrt2$.`, R`$\cos\theta = \frac12$, así que $\theta = 60^\circ$.`] },
        { q: R`Ángulo entre la recta de director $(1, 1, 0)$ y el plano $z = 0$.`, steps: [R`$\vec n = (0, 0, 1)$ y $\vec u\cdot\vec n = 0$, así que $\sin\theta = 0$ y $\theta = 0^\circ$: la recta es horizontal, paralela al plano.`] }],
      tips: [R`No mezcles: para recta–plano va el **seno** con la normal. Si usás el coseno, obtenés el complemento.`],
      see: ["al-producto-escalar", "ga-plano", "ga-recta-espacio"]
    }
  };
  for (const c of Object.values(cards)) c.group = "ga-planos-rectas-u";

  E.extendCourse("m106", {
    concepts: { "ga-plano": { name: "Ecuaciones del plano" }, "ga-haz-planos": { name: "Haz de planos" }, "ga-recta-espacio": { name: "La recta en el espacio" },
      "ga-recta-plano-xy": { name: "La recta en el plano" }, "ga-posicion-rectas": { name: "Posiciones de dos rectas" }, "ga-distancias": { name: "Distancias" }, "ga-angulos": { name: "Ángulos" } },
    templates: T,
    units: [{
      id: "ga-planos-rectas-u", order: 2, program: "Unidad 2", title: "Planos y rectas", icon: "map",
      diagnostic: ["ga-plano3p-num", "ga-pos-rectas-mc", "ga-dist-rectas-num"],
      lessons: [
        { id: "ga-pr-l1", title: "Ecuaciones del plano", templates: ["ga-plano3p-num", "ga-plano-order"], theory: ["ga-plano"],
          intro: R`Un plano queda fijo con un punto y una normal: $ax + by + cz = d$, con $\vec n = (a, b, c)$.` },
        { id: "ga-pr-l2", title: "Distancias y haces de planos", templates: ["ga-dist-planos-num", "ga-dist-error", "ga-haz-num"], theory: ["ga-distancias", "ga-haz-planos"],
          intro: R`La distancia a un plano se mide sobre la normal; los planos que contienen a una recta forman un haz $\pi_1 + \lambda\pi_2 = 0$.` },
        { id: "ga-pr-l3", title: "La recta en el espacio", templates: ["ga-recta-interseccion-num", "ga-recta-plano-vf"], theory: ["ga-recta-espacio"],
          intro: R`Recta: $X = P_0 + t\vec u$; como intersección de dos planos, su director es $\vec n_1\times\vec n_2$.` },
        { id: "ga-pr-l4", title: "Dos rectas: posición y distancia", templates: ["ga-pos-rectas-mc", "ga-dist-rectas-num"], theory: ["ga-posicion-rectas", "ga-distancias"],
          intro: R`Dos rectas pueden ser coincidentes, paralelas, secantes o alabeadas; el producto mixto decide entre las dos últimas.` },
        { id: "ga-pr-l5", title: "Ángulos y rectas en el plano", templates: ["ga-angulo-num", "ga-haz-rectas-num"], theory: ["ga-angulos", "ga-recta-plano-xy"],
          intro: R`Los ángulos salen de normales y directores; en el plano $xy$, el haz de rectas resuelve sin calcular intersecciones.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 3 · CÓNICAS
 *  Circunferencia, traslación de ejes, parábola, elipse, hipérbola y tangentes.
 *  Verificaciones: centros por interpolación sobre los ejes, semiejes por bisección
 *  sobre semirrectas, focos con la definición métrica, tangencias minimizando.
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const T = {};
  const nd = (x, d = 4) => H.num(x, d).replace(".", "{,}");
  const sq = (v, h) => (h === 0 ? `${v}^2` : `(${H.xm(h, v)})^2`);
  const over = (top, q) => (q === 1 ? top : `\\frac{${top}}{${q}}`);
  const cf = n => (n === 1 ? "" : n === -1 ? "-" : String(n));
  const eq2 = (A, C, D, Ee, F) => H.poly([[A, "x^{2}"], [C, "y^{2}"], [D, "x"], [Ee, "y"], [F, ""]]) + " = 0";
  const gcdAll = arr => arr.reduce((g, v) => H.gcd(g, v), 0) || 1;
  // raíz cuadrada simplificada sobre q: √n / q
  function sqrtFrac(n, q) {
    let o = 1, i = n;
    for (let f = 2; f * f <= i; f++) while (i % (f * f) === 0) { i /= f * f; o *= f; }
    const g = H.gcd(o, q); o /= g; q /= g;
    const top = i === 1 ? String(o) : `${o === 1 ? "" : o}\\sqrt{${i}}`;
    return q === 1 ? top : `\\frac{${top}}{${q}}`;
  }

  // ---- herramientas numéricas de las verificaciones ----
  // vértice de una función cuadrática de una variable, interpolando sus valores en -1, 0 y 1
  const vtx1 = g => { const a = (g(1) + g(-1) - 2 * g(0)) / 2, b = (g(1) - g(-1)) / 2; return -b / (2 * a); };
  // centro de una cónica sin término xy: el punto donde se anulan las dos derivadas parciales
  const center2 = G => [vtx1(t => G(t, 0)), vtx1(t => G(0, t))];
  // distancia desde (cx, cy), donde G < 0, hasta la curva G = 0 en la dirección (ux, uy), por bisección
  function rayRoot(G, cx, cy, ux, uy) {
    let lo = 0, hi = 1;
    while (G(cx + hi * ux, cy + hi * uy) <= 0) { hi *= 2; if (hi > 1e7) return NaN; }
    for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (G(cx + m * ux, cy + m * uy) > 0) hi = m; else lo = m; }
    return (lo + hi) / 2;
  }
  // clasifica Ax² + Cy² + Dx + Ey + F = 0 mirando el signo de la ecuación muy lejos del origen (0 circ., 1 elipse, 2 parábola, 3 hipérbola)
  function classifyConic(F) {
    const Rr = 1e6, gs = [];
    for (let i = 0; i < 360; i++) { const t = (i + 0.5) * Math.PI / 180; gs.push(F(Rr * Math.cos(t), Rr * Math.sin(t)) / (Rr * Rr)); }
    const mx = Math.max(...gs), mn = Math.min(...gs), small = Math.min(...gs.map(Math.abs));
    if (mn < -1e-3 && mx > 1e-3) return 3;
    if (small < 1e-3) return 2;
    return mx - mn < 1e-3 * Math.abs(mx) ? 0 : 1;
  }
  // excentricidad medida sobre la curva (cónica centrada en el origen): semiejes por bisección, asíntotas por el cambio de signo lejano
  function eNum(F) {
    const kind = classifyConic(F);
    if (kind === 0) return 0;
    if (kind === 2) return 1;
    if (kind === 1) {
      let mx = 0, mn = Infinity;
      for (let i = 0; i < 720; i++) { const t = i * Math.PI / 360, q = rayRoot(F, 0, 0, Math.cos(t), Math.sin(t)); mx = Math.max(mx, q); mn = Math.min(mn, q); }
      return Math.sqrt(1 - (mn / mx) ** 2);
    }
    const horiz = Number.isFinite(rayRoot(F, 0, 0, 1, 0)), Rr = 1e7, s = th => Math.sign(F(Rr * Math.cos(th), Rr * Math.sin(th)));
    let lo = 0, hi = Math.PI / 2;
    const s0 = s(lo);
    for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (s(m) === s0) lo = m; else hi = m; }
    const phi = (lo + hi) / 2;
    return horiz ? 1 / Math.cos(phi) : 1 / Math.sin(phi);
  }
  // mínimo de una función convexa en un intervalo (búsqueda ternaria)
  function ternMin(g, a, b) {
    for (let i = 0; i < 300; i++) { const m1 = a + (b - a) / 3, m2 = b - (b - a) / 3; if (g(m1) < g(m2)) b = m2; else a = m1; }
    return g((a + b) / 2);
  }

  /* ---------- Lección 1 · circunferencia y traslación ---------- */
  T["ga-circ-num"] = {
    type: "numeric", concepts: ["ga-circunferencia"], difficulty: 2,
    generate(r) {
      const h = r.int(-5, 5), k = r.int(-5, 5), r2 = r.int(1, 45), m = r.pick([1, 1, 2, 3]), ask = r.pick(["r", "r", "h", "k"]);
      const D = -2 * h, Ee = -2 * k, F = h * h + k * k - r2, rr = Math.sqrt(r2);
      const G = (x, y) => m * (x * x + y * y + D * x + Ee * y + F);
      const what = ask === "r" ? "el radio" : ask === "h" ? "la abscisa del centro" : "la ordenada del centro";
      const ans = ask === "r" ? rr : ask === "h" ? h : k;
      return {
        prompt: `Hallá ${what} de la circunferencia $${eq2(m, m, m * D, m * Ee, m * F)}$.`,
        answer: ans,
        solution: [
          m === 1 ? `Los coeficientes de $x^2$ e $y^2$ ya valen $1$.` : `Dividimos todo por $${m}$ para que $x^2$ e $y^2$ tengan coeficiente $1$: $${eq2(1, 1, D, Ee, F)}$.`,
          `Completamos cuadrados ([[ga-circunferencia|ecuación general de la circunferencia]]): sumamos $${h * h}$ y $${k * k}$ a los dos lados y queda $${sq("x", h)} + ${sq("y", k)} = ${r2}$.`,
          `Centro $(${h}, ${k})$ y radio $\\sqrt{${r2}}${Number.isInteger(rr) ? ` = ${rr}` : ` \\approx ${nd(rr)}`}$.`
        ],
        // verificación: centro por interpolación sobre los ejes; con el radio respondido, los puntos a esa distancia anulan la ecuación
        verify: ask === "r"
          ? { kind: "zero", fn: v => { const [cx, cy] = center2(G); return [0, 1, 2, 3, 4, 5].map(i => G(cx + v * Math.cos(1.1 * i), cy + v * Math.sin(1.1 * i)) / (m * (v * v + 1))); } }
          : { kind: "value", fn: () => center2(G)[ask === "h" ? 0 : 1] }
      };
    }
  };
  T["ga-traslacion-tf"] = {
    type: "tf", concepts: ["ga-traslacion"], difficulty: 2,
    generate(r) {
      const hyp = r.bool(), h = r.nz(-4, 4), k = r.nz(-4, 4);
      const [a, b] = hyp ? [r.int(1, 4), r.int(1, 4)] : r.distinct(2, 1, 4), s = hyp ? -1 : 1;
      // b²(x - h)² + s·a²(y - k)² = a²b²
      const A = b * b, C = s * a * a, D = -2 * h * b * b, Ee = -2 * s * k * a * a, F = b * b * h * h + s * a * a * k * k - a * a * b * b;
      const G = (x, y) => (A * x * x + C * y * y + D * x + Ee * y + F) / (a * a * b * b);
      const variant = r.pick(["ok", "ok", "ok", "signo", "cruz"]);
      let [hh, kk] = [h, k];
      if (variant === "signo") [hh, kk] = r.pick([[-h, k], [h, -k], [-h, -k]]);
      if (variant === "cruz") [hh, kk] = h === k ? [-h, -k] : [k, h];
      const truth = hh === h && kk === k;
      const canon = `${over("x'^2", a * a)} ${hyp ? "-" : "+"} ${over("y'^2", b * b)} = 1`;
      return {
        prompt: `<b>Verdadero o falso:</b> si trasladás los ejes al punto $O'(${hh}, ${kk})$, la ecuación $${eq2(A, C, D, Ee, F)}$ se transforma en $${canon}$.`,
        answer: truth,
        explanation: truth
          ? `Completando cuadrados, el centro es $(${h}, ${k})$. Con la [[ga-traslacion|traslación de ejes]] $x = x'${H.sg(h)}$, $y = y'${H.sg(k)}$ desaparecen los términos lineales y queda $${canon}$.`
          : `Completando cuadrados, el centro es $(${h}, ${k})$, no $(${hh}, ${kk})$. Trasladando a $O'(${hh}, ${kk})$ siguen apareciendo términos lineales en $x'$ o en $y'$ ([[ga-traslacion|traslación de ejes]]).`,
        solution: [
          `Agrupamos y completamos cuadrados: $${cf(b * b)}${sq("x", h)} ${hyp ? "-" : "+"} ${cf(a * a)}${sq("y", k)} = ${a * a * b * b}$.`,
          `Dividimos por $${a * a * b * b}$: $${over(sq("x", h), a * a)} ${hyp ? "-" : "+"} ${over(sq("y", k), b * b)} = 1$.`,
          `El nuevo origen tiene que ser el centro $(${h}, ${k})$: con $x' = ${H.xm(h, "x")}$ e $y' = ${H.xm(k, "y")}$ se llega a la forma canónica.`
        ],
        // verificación: puntos de la curva canónica, llevados a las coordenadas viejas con el O' propuesto, tienen que anular la ecuación original
        verify: { kind: "truth", fn: () => {
          for (let i = 0; i < 24; i++) {
            const t = -1.5 + i * 0.13, xp = hyp ? (i % 2 ? -1 : 1) * a * Math.cosh(t) : a * Math.cos(2 * t), yp = hyp ? b * Math.sinh(t) : b * Math.sin(2 * t);
            if (Math.abs(G(xp + hh, yp + kk)) > 1e-9) return false;
          }
          return true;
        } }
      };
    }
  };

  /* ---------- Lección 2 · foco, directriz y parábola ---------- */
  T["ga-parabola-num"] = {
    type: "numeric", concepts: ["ga-parabola"], difficulty: 2,
    generate(r) {
      const vert = r.bool(), h = r.int(-4, 4), k = r.int(-4, 4), p = r.pick([-3, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 3]), m = r.pick([1, 1, 2]);
      const ask = r.pick(["foco", "directriz", "lado"]), q = 4 * p;
      // vertical: (x - h)² = 4p(y - k); horizontal: (y - k)² = 4p(x - h)
      const [A, C, D, Ee, F] = vert ? [m, 0, -2 * h * m, -q * m, m * (h * h + q * k)] : [0, m, -q * m, -2 * k * m, m * (k * k + q * h)];
      const G = (x, y) => A * x * x + C * y * y + D * x + Ee * y + F;
      const [hu, hv, U, V] = vert ? [h, k, "x", "y"] : [k, h, "y", "x"];
      const rhs = hv === 0 ? `${q}${V}` : `${q}(${H.xm(hv, V)})`;
      const opens = vert ? (p > 0 ? "arriba" : "abajo") : (p > 0 ? "la derecha" : "la izquierda");
      const ans = ask === "foco" ? hv + p : ask === "directriz" ? hv - p : Math.abs(q);
      const what = ask === "foco" ? `la coordenada $${V}$ del foco` : ask === "directriz" ? `el valor $c$ de la directriz $${V} = c$` : "la longitud del lado recto";
      return {
        prompt: `Para la parábola $${eq2(A, C, D, Ee, F)}$, hallá ${what}.`,
        answer: ans,
        solution: [
          `${m === 1 ? "" : `Dividimos por $${m}$ y `}completamos el cuadrado en $${U}$: $${sq(U, hu)} = ${rhs}$.`,
          `Es una [[ga-parabola|parábola]] de vértice $(${h}, ${k})$, con eje paralelo al eje $${V}$, y $4p = ${q}$: $p = ${nd(p)}$, abre hacia ${opens}.`,
          ask === "foco" ? `El foco está a distancia $|p|$ del vértice sobre el eje: $${V}_F = ${hv}${H.sg(p).replace(".", "{,}")} = ${nd(ans)}$.`
            : ask === "directriz" ? `La directriz está del otro lado del vértice, también a $|p|$: $${V} = ${hv} - ${H.par(p).replace(".", "{,}")} = ${nd(ans)}$.`
              : `El lado recto es la cuerda que pasa por el foco perpendicular al eje: mide $|4p| = ${nd(ans)}$.`
        ],
        // verificación: vértice por interpolación de la curva; con la respuesta se arma foco y directriz y se chequea la equidistancia
        verify: { kind: "zero", fn: v => {
          const Gu = (u, w) => (vert ? G(u, w) : G(w, u)), curve = u => -Gu(u, 0) / (Gu(u, 1) - Gu(u, 0));
          const uv = vtx1(curve), vv = curve(uv);
          let f;
          if (ask === "foco") f = v; else if (ask === "directriz") f = 2 * vv - v; else f = curve(uv + v / 2);
          const d = 2 * vv - f;
          return [1, -1.7, 2.5, -3.2].map(du => { const u = uv + du, w = curve(u); return Math.hypot(u - uv, w - f) - Math.abs(w - d); });
        } }
      };
    }
  };
  const ELL = [[5, 4], [5, 3], [13, 12], [13, 5], [10, 8], [10, 6], [17, 15], [17, 8]];
  T["ga-conica-match"] = {
    type: "match", concepts: ["ga-conica-def"], difficulty: 2,
    generate(r) {
      const items = [];
      { const Rr = r.int(1, 9); items.push({ tex: `x^2 + y^2 = ${Rr * Rr}`, e: 0, eTex: "e = 0", F: (x, y) => x * x + y * y - Rr * Rr }); }
      {
        const p = r.nz(-4, 4), vert = r.bool(), lin = `${4 * p}${vert ? "y" : "x"}`;
        items.push({ tex: vert ? `x^2 = ${lin}` : `y^2 = ${lin}`, e: 1, eTex: "e = 1", F: vert ? (x, y) => x * x - 4 * p * y : (x, y) => y * y - 4 * p * x });
      }
      {
        let a, b;
        if (r.bool()) [a, b] = r.pick(ELL); else { [a, b] = r.distinct(2, 2, 7); if (a < b) [a, b] = [b, a]; }
        const vert = r.bool(), c2 = a * a - b * b, [dx, dy] = vert ? [b * b, a * a] : [a * a, b * b];
        items.push({ tex: `\\frac{x^2}{${dx}} + \\frac{y^2}{${dy}} = 1`, e: Math.sqrt(c2) / a, eTex: `e = ${sqrtFrac(c2, a)}`, F: (x, y) => dy * x * x + dx * y * y - dx * dy });
      }
      {
        const a = r.int(1, 6), b = r.int(1, 6), vert = r.bool(), c2 = a * a + b * b;
        const tex = vert ? `${over("y^2", a * a)} - ${over("x^2", b * b)} = 1` : `${over("x^2", a * a)} - ${over("y^2", b * b)} = 1`;
        items.push({ tex, e: Math.sqrt(c2) / a, eTex: `e = ${sqrtFrac(c2, a)}`, F: vert ? (x, y) => b * b * y * y - a * a * x * x - a * a * b * b : (x, y) => b * b * x * x - a * a * y * y - a * a * b * b });
      }
      const order = r.shuffle(items);
      return {
        prompt: `Uní cada cónica con su excentricidad.`,
        pairs: order.map(it => [{ tex: it.tex }, { tex: it.eTex }]),
        solution: [
          `La [[ga-conica-def|excentricidad de una cónica]] es el cociente entre la distancia al foco y la distancia a la directriz: $e = 0$ en la circunferencia, $0 < e < 1$ en la elipse, $e = 1$ en la parábola y $e > 1$ en la hipérbola.`,
          `En la elipse y en la hipérbola, $e = \\frac ca$, con $c^2 = a^2 - b^2$ en la elipse y $c^2 = a^2 + b^2$ en la hipérbola ($a$ es el semieje que va hacia los focos).`
        ],
        // verificación: la excentricidad se mide sobre cada curva (semiejes por bisección, ángulo de las asíntotas por el signo lejano)
        verify: { kind: "truth", target: true, fn: () => order.every(it => Math.abs(eNum(it.F) - it.e) < 1e-6) }
      };
    }
  };

  /* ---------- Lección 3 · elipse e hipérbola ---------- */
  T["ga-elipse-num"] = {
    type: "numeric", concepts: ["ga-elipse"], difficulty: 2,
    generate(r) {
      const [sx, sy] = r.distinct(2, 1, 6), h = r.int(-4, 4), k = r.int(-4, 4), ask = r.pick(["a", "b", "2c", "e"]);
      let co = [sy * sy, sx * sx, -2 * h * sy * sy, -2 * k * sx * sx, sy * sy * h * h + sx * sx * k * k - sx * sx * sy * sy];
      const g = gcdAll(co); co = co.map(v => v / g);
      const [A, C, D, Ee, F] = co, G = (x, y) => A * x * x + C * y * y + D * x + Ee * y + F;
      const a = Math.max(sx, sy), b = Math.min(sx, sy), c2 = a * a - b * b, c = Math.sqrt(c2);
      const ans = ask === "a" ? a : ask === "b" ? b : ask === "2c" ? 2 * c : c / a;
      const what = { a: "el semieje mayor", b: "el semieje menor", "2c": "la distancia entre los focos", e: "la excentricidad" }[ask];
      return {
        prompt: `Para la elipse $${eq2(A, C, D, Ee, F)}$, calculá ${what}.`,
        answer: ans,
        solution: [
          `Agrupando y [[cuadratica|completando cuadrados]] se llega a $${over(sq("x", h), sx * sx)} + ${over(sq("y", k), sy * sy)} = 1$.`,
          `Es una [[ga-elipse|elipse]] de centro $(${h}, ${k})$ con eje mayor ${sx > sy ? "horizontal" : "vertical"}: $a = ${a}$, $b = ${b}$ y $c = \\sqrt{a^2 - b^2} = \\sqrt{${c2}}$.`,
          ask === "a" ? `Semieje mayor: $a = ${a}$.` : ask === "b" ? `Semieje menor: $b = ${b}$.` : ask === "2c" ? `Distancia focal: $2c = 2\\sqrt{${c2}} \\approx ${nd(ans)}$.` : `$e = \\frac ca = \\frac{\\sqrt{${c2}}}{${a}} \\approx ${nd(ans)}$.`
        ],
        // verificación: radios de la curva desde el centro (interpolado), por bisección; los focos con la suma de distancias constante
        verify: (() => {
          const radii = () => {
            const [cx, cy] = center2(G); let mx = 0, mn = Infinity, dir = [1, 0];
            for (let i = 0; i < 720; i++) { const t = i * Math.PI / 360, q = rayRoot(G, cx, cy, Math.cos(t), Math.sin(t)); if (q > mx) { mx = q; dir = [Math.cos(t), Math.sin(t)]; } mn = Math.min(mn, q); }
            return { cx, cy, mx, mn, dir };
          };
          if (ask === "a" || ask === "b") return { kind: "value", fn: () => { const q = radii(); return ask === "a" ? q.mx : q.mn; } };
          return { kind: "zero", fn: v => {
            const q = radii(), cc = ask === "2c" ? v / 2 : v * q.mx;
            const F1 = [q.cx + cc * q.dir[0], q.cy + cc * q.dir[1]], F2 = [q.cx - cc * q.dir[0], q.cy - cc * q.dir[1]];
            return [0.3, 1.1, 2.0, 2.9, 4.4].map(t => { const s = rayRoot(G, q.cx, q.cy, Math.cos(t), Math.sin(t)), P = [q.cx + s * Math.cos(t), q.cy + s * Math.sin(t)];
              return (Math.hypot(P[0] - F1[0], P[1] - F1[1]) + Math.hypot(P[0] - F2[0], P[1] - F2[1]) - 2 * q.mx) / q.mx; });
          } };
        })()
      };
    }
  };
  T["ga-hiperbola-num"] = {
    type: "numeric", concepts: ["ga-hiperbola"], difficulty: 2,
    generate(r) {
      const a = r.int(1, 6), b = r.int(1, 6), h = r.int(-4, 4), k = r.int(-4, 4), vert = r.bool(), ask = r.pick(["2a", "2c", "e", "m"]);
      // horizontal: b²(x-h)² - a²(y-k)² = a²b²; vertical: b²(y-k)² - a²(x-h)² = a²b²
      let co = vert
        ? [-a * a, b * b, 2 * h * a * a, -2 * k * b * b, -a * a * h * h + b * b * k * k - a * a * b * b]
        : [b * b, -a * a, -2 * h * b * b, 2 * k * a * a, b * b * h * h - a * a * k * k - a * a * b * b];
      const g = gcdAll(co); co = co.map(v => v / g);
      const [A, C, D, Ee, F] = co, G = (x, y) => A * x * x + C * y * y + D * x + Ee * y + F;
      const c2 = a * a + b * b, c = Math.sqrt(c2), slope = vert ? a / b : b / a;
      const ans = ask === "2a" ? 2 * a : ask === "2c" ? 2 * c : ask === "e" ? c / a : slope;
      const what = { "2a": "la distancia entre los vértices", "2c": "la distancia entre los focos", e: "la excentricidad", m: "la pendiente positiva de las asíntotas" }[ask];
      const canon = vert ? `${over(sq("y", k), a * a)} - ${over(sq("x", h), b * b)} = 1` : `${over(sq("x", h), a * a)} - ${over(sq("y", k), b * b)} = 1`;
      return {
        prompt: `Para la hipérbola $${eq2(A, C, D, Ee, F)}$, calculá ${what}.`,
        answer: ans,
        solution: [
          `[[cuadratica|Completando cuadrados]]: $${canon}$.`,
          `Es una [[ga-hiperbola|hipérbola]] de centro $(${h}, ${k})$ con eje transverso ${vert ? "vertical" : "horizontal"}: $a = ${a}$, $b = ${b}$ y $c = \\sqrt{a^2 + b^2} = \\sqrt{${c2}}$.`,
          ask === "2a" ? `Los vértices están a $a$ del centro: $2a = ${2 * a}$.`
            : ask === "2c" ? `$2c = 2\\sqrt{${c2}} \\approx ${nd(ans)}$.`
              : ask === "e" ? `$e = \\frac ca = \\frac{\\sqrt{${c2}}}{${a}} \\approx ${nd(ans)}$.`
                : `Las asíntotas son $${H.xm(k, "y")} = \\pm${vert ? `\\frac{${a}}{${b}}` : `\\frac{${b}}{${a}}`}(${H.xm(h, "x")})$: pendiente $${H.frac(vert ? a : b, vert ? b : a)} \\approx ${nd(ans)}$.`
        ],
        // verificación: vértice por bisección desde el centro interpolado, focos con la diferencia de distancias constante, asíntotas por el cambio de signo lejano
        verify: (() => {
          const geo = () => {
            const [cx, cy] = center2(G), rx = rayRoot(G, cx, cy, 1, 0);
            const dir = Number.isFinite(rx) ? [1, 0] : [0, 1], aN = Number.isFinite(rx) ? rx : rayRoot(G, cx, cy, 0, 1);
            return { cx, cy, dir, aN };
          };
          if (ask === "2a") return { kind: "value", fn: () => 2 * geo().aN };
          if (ask === "m") return { kind: "value", fn: () => {
            const [cx, cy] = center2(G), Rr = 1e7, s = th => Math.sign(G(cx + Rr * Math.cos(th), cy + Rr * Math.sin(th)));
            let lo = 0, hi = Math.PI / 2; const s0 = s(lo);
            for (let i = 0; i < 100; i++) { const mm = (lo + hi) / 2; if (s(mm) === s0) lo = mm; else hi = mm; }
            return Math.tan((lo + hi) / 2);
          } };
          return { kind: "zero", fn: v => {
            const q = geo(), cc = ask === "2c" ? v / 2 : v * q.aN, base = Math.atan2(q.dir[1], q.dir[0]);
            const F1 = [q.cx + cc * q.dir[0], q.cy + cc * q.dir[1]], F2 = [q.cx - cc * q.dir[0], q.cy - cc * q.dir[1]];
            return [0, 0.05, -0.08, 0.12, Math.PI + 0.1, Math.PI - 0.14].map(al => {
              const t = base + al, s = rayRoot(G, q.cx, q.cy, Math.cos(t), Math.sin(t)), P = [q.cx + s * Math.cos(t), q.cy + s * Math.sin(t)];
              return (Math.abs(Math.hypot(P[0] - F1[0], P[1] - F1[1]) - Math.hypot(P[0] - F2[0], P[1] - F2[1])) - 2 * q.aN) / q.aN;
            });
          } };
        })()
      };
    }
  };

  /* ---------- Lección 4 · recta y cónica, tangentes ---------- */
  T["ga-tangente-num"] = {
    type: "numeric", concepts: ["ga-tangente-conica"], difficulty: 2,
    generate(r) {
      const A = r.int(1, 4), C = r.pick([-4, -3, -2, -1, 1, 2, 3, 4]), D = r.int(-6, 6), Ee = r.int(-6, 6), x0 = r.int(-3, 3), y0 = r.int(-3, 3);
      const F = -(A * x0 * x0 + C * y0 * y0 + D * x0 + Ee * y0), ask = r.pick(["m", "m", "b"]);
      const nx = 2 * A * x0 + D, ny = 2 * C * y0 + Ee, c0 = D * x0 + Ee * y0 + 2 * F;
      if (ny === 0 || (ask === "b" && x0 === 0)) return null;
      if (A * C * F - A * Ee * Ee / 4 - C * D * D / 4 === 0) return null; // cónica degenerada
      const G = (x, y) => A * x * x + C * y * y + D * x + Ee * y + F, m = -nx / ny, bb = y0 - m * x0;
      return {
        prompt: `La cónica $${eq2(A, C, D, Ee, F)}$ pasa por $P_0(${x0}, ${y0})$. Calculá ${ask === "m" ? "la pendiente" : "la ordenada al origen"} de la recta tangente en $P_0$.`,
        answer: ask === "m" ? m : bb,
        solution: [
          `[[ga-tangente-conica|Desdoblamiento]]: se reemplaza $x^2$ por $${H.par(x0)}x$, $y^2$ por $${H.par(y0)}y$, $x$ por $\\frac{x ${H.sg(x0).trim()}}{2}$ e $y$ por $\\frac{y ${H.sg(y0).trim()}}{2}$.`,
          `Multiplicando por $2$, la tangente es $${H.poly([[nx, "x"], [ny, "y"], [c0, ""]])} = 0$.`,
          ask === "m" ? `Pendiente: $m = ${H.frac(-nx, ny)} \\approx ${nd(m)}$.` : `Despejando $y$: $m = ${H.frac(-nx, ny)}$ y la ordenada al origen es $${H.frac(-c0, ny)} \\approx ${nd(bb)}$.`
        ],
        // verificación: gradiente numérico de la ecuación en P0 (derivación implícita) o perpendicularidad entre el gradiente y la recta
        verify: ask === "m" ? { kind: "implicit", F: G, p: x0, q: y0 }
          : { kind: "zero", fn: b => { const hh = 1e-5, gx = (G(x0 + hh, y0) - G(x0 - hh, y0)) / (2 * hh), gy = (G(x0, y0 + hh) - G(x0, y0 - hh)) / (2 * hh);
            return [(gx * x0 + gy * (y0 - b)) / (Math.hypot(gx, gy) * Math.hypot(x0, y0 - b))]; } }
      };
    }
  };
  // rectas y = mx + n tangentes a elipses (n² = a²m² + b²) y a hipérbolas (n² = a²m² - b²) con números enteros
  const TANG_E = [], TANG_H = [];
  for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) for (let m = 1; m <= 3; m++) {
    const se = a * a * m * m + b * b, sh = a * a * m * m - b * b;
    if (a !== b && Number.isInteger(Math.sqrt(se))) TANG_E.push([a, b, m, Math.sqrt(se)]);
    if (sh > 0 && Number.isInteger(Math.sqrt(sh))) TANG_H.push([a, b, m, Math.sqrt(sh)]);
  }
  const POS = ["Secante: la corta en dos puntos.", "Tangente: tienen un único punto común, doble.", "Exterior: no tienen puntos comunes.", "La corta en un único punto, sin ser tangente."];
  T["ga-recta-conica-mc"] = {
    type: "mc", concepts: ["ga-tangente-conica"], difficulty: 2,
    generate(r) {
      const kind = r.pick([0, 0, 1, 1, 2, 2, 3]);
      let hyp = kind === 3 || r.bool(0.4), a, b, m, n, mTex;
      if (kind === 1) { [a, b, m, n] = r.pick(hyp ? TANG_H : TANG_E); }
      else if (kind === 3) { a = r.int(1, 6); b = r.int(1, 6); m = b / a; n = r.nz(-5, 5); }
      else {
        a = r.int(1, 6); b = r.int(1, 6); m = r.int(1, 3);
        if (hyp && a * a * m * m - b * b <= 0) return null;
        const S = hyp ? a * a * m * m - b * b : a * a * m * m + b * b, lim = Math.sqrt(S);
        // elipse: secante si n² < S; hipérbola (|m| > b/a): secante si n² > S
        const inside = kind === 0 ? !hyp : hyp; // n² < S
        if (inside) { const top = Math.ceil(lim) - 1; n = r.int(-top, top); if (n * n >= S) return null; }
        else { n = Math.floor(lim) + r.int(1, 3); if (n * n <= S) return null; }
        if (n === 0 && r.bool(0.7)) return null;
      }
      const sgn = r.pick([1, -1]); m *= sgn; if (r.bool()) n = -n;
      mTex = kind === 3 ? (Math.abs(m) === 1 ? (m < 0 ? "-" : "") : (m < 0 ? "-" : "") + `\\frac{${b / H.gcd(a, b)}}{${a / H.gcd(a, b)}}`) : cf(m);
      const lineTex = `y = ${mTex}x${n === 0 ? "" : H.sg(n)}`;
      const conTex = hyp ? `${over("x^2", a * a)} - ${over("y^2", b * b)} = 1` : a === b ? `x^2 + y^2 = ${a * a}` : `${over("x^2", a * a)} + ${over("y^2", b * b)} = 1`;
      const Fc = (x, y) => b * b * x * x + (hyp ? -1 : 1) * a * a * y * y - a * a * b * b;
      const q2 = Math.round(b * b + (hyp ? -1 : 1) * a * a * m * m), q1 = Math.round((hyp ? -1 : 1) * 2 * a * a * m * n), q0 = (hyp ? -1 : 1) * a * a * n * n - a * a * b * b;
      return {
        prompt: `¿Cuál es la posición de la recta $${lineTex}$ respecto de la cónica $${conTex}$?`,
        ...H.mc(r, POS[kind], POS.filter((_, i) => i !== kind), { text: true }),
        solution: [
          `Reemplazamos $y$ en la ecuación de la cónica (multiplicada por $${a * a * b * b}$) y queda ${kind === 3 ? "una ecuación de primer grado" : "una cuadrática"} en $x$: $${H.poly([[q2, "x^{2}"], [q1, "x"], [q0, ""]])} = 0$.`,
          kind === 3 ? `El término en $x^2$ se anula porque la recta es paralela a una asíntota: hay una sola solución, pero no es tangente ([[ga-tangente-conica|posición relativa de una recta y una cónica]]).`
            : `Su discriminante es ${kind === 0 ? "positivo: dos puntos de corte" : kind === 1 ? "cero: un punto doble, la recta es tangente" : "negativo: no hay puntos comunes"} ([[ga-tangente-conica|posición relativa de una recta y una cónica]]).`
        ],
        // verificación: g(x) = F(x, mx + n); se mira la curvatura con diferencias y el extremo de g por búsqueda ternaria
        verify: { kind: "truth", target: true, fn: () => {
          const gf = x => Fc(x, m * x + n), curv = gf(1) + gf(-1) - 2 * gf(0);
          let got;
          if (Math.abs(curv) < 1e-9) got = Math.abs(gf(1) - gf(0)) > 1e-9 ? 3 : -1;
          else {
            const s = Math.sign(curv), ext = s * ternMin(x => s * gf(x), -1e4, 1e4), v = s * ext;
            got = v < -1e-7 ? 0 : v > 1e-7 ? 2 : 1;
          }
          return got === kind;
        } }
      };
    }
  };
  // tangentes desde un punto exterior a x² + y² = r² con pendientes racionales
  const EXT = [];
  for (let rr = 1; rr <= 5; rr++) for (let x0 = -7; x0 <= 7; x0++) for (let y0 = -7; y0 <= 7; y0++) {
    const s2 = x0 * x0 + y0 * y0 - rr * rr, s = Math.sqrt(s2);
    if (s2 > 0 && Number.isInteger(s) && x0 * x0 !== rr * rr && x0 * y0 * rr !== 0) EXT.push([rr, x0, y0, s]);
  }
  T["ga-tangente-order"] = {
    type: "order", concepts: ["ga-tangente-conica"], difficulty: 3,
    generate(r) {
      const [rr, x0, y0, s] = r.pick(EXT), den = x0 * x0 - rr * rr;
      const n1 = x0 * y0 + rr * s, n2 = x0 * y0 - rr * s, m1 = n1 / den, m2 = n2 / den;
      const line = (num, mv) => {
        if (mv === 0) return `y = ${y0}`;
        const mt = Math.abs(mv - 1) < 1e-12 ? "" : Math.abs(mv + 1) < 1e-12 ? "-" : H.frac(num, den);
        return `${H.xm(y0, "y")} = ${mt}(${H.xm(x0, "x")})`;
      };
      return {
        prompt: `Ordená los pasos para hallar las rectas tangentes a $x^2 + y^2 = ${rr * rr}$ trazadas desde $P(${x0}, ${y0})$.`,
        steps: [
          `Planteamos el haz de rectas que pasan por $P$: $${H.xm(y0, "y")} = m(${H.xm(x0, "x")})$.`,
          `Sustituimos $y = m(${H.xm(x0, "x")})${H.sg(y0)}$ en la circunferencia: queda una ecuación de segundo grado en $x$.`,
          `Pedimos discriminante nulo (un único punto común, doble): $${H.poly([[den, "m^{2}"], [-2 * x0 * y0, "m"], [y0 * y0 - rr * rr, ""]])} = 0$.`,
          `Resolvemos la cuadrática en $m$: $m_1 = ${H.frac(n1, den)}$ y $m_2 = ${H.frac(n2, den)}$.`,
          `Las tangentes son $${line(n1, m1)}$ y $${line(n2, m2)}$.`
        ],
        solution: [`Desde un punto exterior salen dos tangentes. Con el haz de rectas por $P$, la condición de [[ga-tangente-conica|tangencia]] es que la ecuación de la intersección tenga discriminante cero, y eso da una cuadrática en la pendiente $m$.`],
        // verificación: para cada pendiente, la distancia mínima del centro a la recta (minimizada numéricamente) es el radio
        verify: { kind: "truth", target: true, fn: () => m1 !== m2 && [m1, m2].every(mv => Math.abs(ternMin(x => x * x + (mv * (x - x0) + y0) ** 2, -1e3, 1e3) - rr * rr) < 1e-6) }
      };
    }
  };

  T["ga-eje-radical-num"] = {
    type: "numeric", concepts: ["ga-circunferencia"], difficulty: 3,
    generate(r) {
      const h1 = r.int(-4, 4), k1 = r.int(-4, 4), h2 = r.int(-4, 4), k2 = r.int(-4, 4), q1 = r.int(2, 30), q2 = r.int(2, 30);
      const d = Math.hypot(h2 - h1, k2 - k1), r1 = Math.sqrt(q1), r2 = Math.sqrt(q2);
      // tienen que cortarse en dos puntos, con un margen para que la cuerda no sea minúscula
      if (d === 0 || d >= r1 + r2 - 0.3 || d <= Math.abs(r1 - r2) + 0.3) return null;
      const D1 = -2 * h1, E1 = -2 * k1, F1 = h1 * h1 + k1 * k1 - q1, D2 = -2 * h2, E2 = -2 * k2, F2 = h2 * h2 + k2 * k2 - q2;
      const a = D1 - D2, b = E1 - E2, c = F1 - F2, ask = r.pick(["m", "n", "cuerda", "lambda"]);
      if ((ask === "m" || ask === "n") && b === 0) return null;
      const C1 = (x, y) => x * x + y * y + D1 * x + E1 * y + F1, C2 = (x, y) => x * x + y * y + D2 * x + E2 * y + F2;
      // para la familia: un punto entero que no esté en ninguna de las dos
      const P = [r.int(-5, 5), r.int(-5, 5)];
      if (ask === "lambda" && (C1(...P) === 0 || C2(...P) === 0)) return null;
      const dist = Math.abs(a * h1 + b * k1 + c) / Math.hypot(a, b), chord = 2 * Math.sqrt(q1 - dist * dist), lam = -C1(...P) / C2(...P);
      if (ask === "lambda" && Math.abs(lam + 1) < 1e-9) return null;
      const ans = { m: -a / b, n: -c / b, cuerda: chord, lambda: lam }[ask];
      const eqA = eq2(1, 1, D1, E1, F1), eqB = eq2(1, 1, D2, E2, F2), line = `${H.poly([[a, "x"], [b, "y"], [c, ""]])} = 0`;
      return {
        prompt: `Las circunferencias $C_1: ${eqA}$ y $C_2: ${eqB}$ se cortan en dos puntos. ${{ m: "Calculá la pendiente de su eje radical (la recta que pasa por los dos puntos de corte).", n: "Calculá la ordenada al origen de su eje radical (la recta que pasa por los dos puntos de corte).", cuerda: "Calculá la longitud de la cuerda común.", lambda: `En la familia $C_1 + \\lambda C_2 = 0$, ¿qué valor de $\\lambda$ da la circunferencia que pasa también por $(${P[0]}, ${P[1]})$?` }[ask]}`,
        answer: ans,
        solution: ask === "lambda" ? [`Toda curva de la [[ga-circunferencia|familia de circunferencias]] $C_1 + \\lambda C_2 = 0$ pasa por los puntos donde se anulan $C_1$ y $C_2$ a la vez, o sea, por los dos puntos de corte.`,
          `Para que pase por $(${P[0]}, ${P[1]})$: $C_1(${P[0]}, ${P[1]}) + \\lambda\\, C_2(${P[0]}, ${P[1]}) = ${C1(...P)} ${C2(...P) < 0 ? "-" : "+"} ${Math.abs(C2(...P))}\\lambda = 0$, de donde $\\lambda = ${H.frac(-C1(...P), C2(...P))} \\approx ${nd(lam)}$.`]
          : [`Restando las ecuaciones se cancelan $x^2$ e $y^2$: queda el [[ga-circunferencia|eje radical]] $${line}$ (es $C_1 + \\lambda C_2 = 0$ con $\\lambda = -1$). Los dos puntos de corte lo cumplen, porque anulan las dos ecuaciones.`,
            ask === "cuerda" ? `Centro de $C_1$: $(${h1}, ${k1})$, radio $\\sqrt{${q1}}$. Su distancia al eje radical es $\\frac{|${a}\\cdot${H.par(h1)} ${b < 0 ? "-" : "+"} ${Math.abs(b)}\\cdot${H.par(k1)} ${c < 0 ? "-" : "+"} ${Math.abs(c)}|}{\\sqrt{${a * a + b * b}}} \\approx ${nd(dist)}$.`
              : `Despejando $y$ (se divide por $${b}$), ${ask === "m" ? `la pendiente es $-\\frac{${a}}{${b}} = ${H.frac(-a, b)}$` : `la ordenada al origen es $-\\frac{${c}}{${b}} = ${H.frac(-c, b)}$`}${Number.isInteger(ans) ? "" : `, o sea $\\approx ${nd(ans)}$`}. El eje radical es perpendicular a la recta que une los centros.`,
            ...(ask === "cuerda" ? [`La cuerda es perpendicular al radio que la biseca: por Pitágoras, mide $2\\sqrt{${q1} - ${nd(dist * dist)}} \\approx ${nd(chord)}$.`] : [])],
        // verificación: los puntos de corte se buscan recorriendo C₁ con su paramétrica y bisecando el signo de C₂
        verify: { kind: "value", tol: 1e-7, fn: () => {
          const pt = t => [h1 + r1 * Math.cos(t), k1 + r1 * Math.sin(t)], g = t => C2(...pt(t)), N = 720, roots = [];
          for (let i = 0; i < N; i++) {
            // grilla corrida un poco para que ningún corte caiga justo en un borde; se descartan las raíces repetidas
            let lo = 2 * Math.PI * (i + 0.137) / N, hi = 2 * Math.PI * (i + 1.137) / N;
            if (g(lo) * g(hi) > 0) continue;
            for (let j = 0; j < 80; j++) { const m = (lo + hi) / 2; if (g(lo) * g(m) <= 0) hi = m; else lo = m; }
            const X = pt((lo + hi) / 2);
            if (!roots.some(Y => Math.hypot(X[0] - Y[0], X[1] - Y[1]) < 1e-6)) roots.push(X);
          }
          const [A, B] = roots;
          if (ask === "lambda") {
            // circunferencia por A, B y P (x² + y² + Dx + Ey + F = 0, sistema 3×3 por Cramer); su D tiene que ser (D₁ + λD₂)/(1 + λ)
            const rows = [A, B, P].map(([x, y]) => [x, y, 1, -(x * x + y * y)]);
            const det = M => M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
            const M0 = rows.map(w => w.slice(0, 3)), Dc = det(rows.map(w => [w[3], w[1], w[2]])) / det(M0), Ec = det(rows.map(w => [w[0], w[3], w[2]])) / det(M0);
            // se usa el coeficiente que mejor separa las dos circunferencias (con D₁ = D₂ el de x no dice nada)
            return Math.abs(D2 - Dc) > Math.abs(E2 - Ec) ? (Dc - D1) / (D2 - Dc) : (Ec - E1) / (E2 - Ec);
          }
          const m = (B[1] - A[1]) / (B[0] - A[0]);
          return { m, n: A[1] - m * A[0], cuerda: Math.hypot(B[0] - A[0], B[1] - A[1]) }[ask];
        } }
      };
    }
  };

  T["ga-param-conica-num"] = {
    type: "numeric", concepts: ["ga-conica-def"], difficulty: 2,
    generate(r) {
      const kind = r.pick(["elipse", "elipse", "hiperbola", "parabola"]), h = r.int(-4, 4), k = r.int(-4, 4), swap = r.bool();
      const X = (s, v) => (s === 0 ? `${v}` : `${s} ${v.startsWith("-") ? "-" : "+"} ${v.replace(/^-/, "")}`);
      let px, py, ans, ask, sol, verify, name;
      if (kind === "parabola") {
        // sin girar: x = h + 2pt, y = k + pt², o sea (x − h)² = 4p(y − k); girada: x = h + pt², y = k + 2pt
        const p = r.nz(-3, 3), e1 = `${2 * p}t`, e2 = `${cf(p)}t^2`;
        [px, py] = swap ? [X(h, e2), X(k, e1)] : [X(h, e1), X(k, e2)];
        name = "una parábola"; ask = "la distancia del vértice al foco"; ans = Math.abs(p);
        const [U, V, u0, v0] = swap ? ["y", "x", k, h] : ["x", "y", h, k];
        sol = [`Se despeja $t = \\frac{${H.xm(u0, U)}}{${2 * p}}$ de la ecuación de $${U}$ y se reemplaza en la otra: $${H.xm(v0, V)} = ${p}\\cdot\\frac{${sq(U, u0)}}{${4 * p * p}}$, o sea $${sq(U, u0)} = ${4 * p}${v0 === 0 ? V : `(${H.xm(v0, V)})`}$.`,
          `Es una [[ga-parabola|parábola]] con vértice $(${h}, ${k})$ y $4p = ${4 * p}$: el foco está a $|p| = ${Math.abs(p)}$ del vértice.`];
        // verificación: con el foco y la directriz a la distancia respondida, cada punto de la paramétrica equidista de los dos
        verify = { kind: "zero", fn: v => [-2, -1, -0.4, 0.5, 1.3, 2.2].map(t => {
          const lin = 2 * p * t, cua = p * t * t, P = swap ? [h + cua, k + lin] : [h + lin, k + cua], s = Math.sign(p);
          const F = swap ? [h + s * v, k] : [h, k + s * v], dDir = swap ? Math.abs(P[0] - (h - s * v)) : Math.abs(P[1] - (k - s * v));
          return (Math.hypot(P[0] - F[0], P[1] - F[1]) - dDir) / 10;
        }) };
      } else {
        const [a, b] = r.distinct(2, 1, 6), hyp = kind === "hiperbola";
        const f1 = hyp ? "\\sec t" : "\\cos t", f2 = hyp ? "\\tan t" : "\\sin t";
        [px, py] = swap ? [X(h, `${cf(b)}${f2}`), X(k, `${cf(a)}${f1}`)] : [X(h, `${cf(a)}${f1}`), X(k, `${cf(b)}${f2}`)];
        const c = Math.sqrt(hyp ? a * a + b * b : Math.abs(a * a - b * b)), big = hyp ? a : Math.max(a, b);
        ask = r.pick(["c", "e"]); ans = ask === "c" ? c : c / big;
        name = hyp ? "una hipérbola" : "una elipse";
        const U = swap ? "y" : "x", V = swap ? "x" : "y", u0 = swap ? k : h, v0 = swap ? h : k;
        sol = [hyp ? `Como $\\sec^2 t - \\tan^2 t = 1$: $\\frac{${sq(U, u0)}}{${a * a}} - \\frac{${sq(V, v0)}}{${b * b}} = 1$, una [[ga-hiperbola|hipérbola]] de centro $(${h}, ${k})$ con $a = ${a}$ y $b = ${b}$.`
          : `Como $\\cos^2 t + \\sin^2 t = 1$: $\\frac{${sq(U, u0)}}{${a * a}} + \\frac{${sq(V, v0)}}{${b * b}} = 1$, una [[ga-elipse|elipse]] de centro $(${h}, ${k})$ con semiejes $${a}$ y $${b}$.`,
          hyp ? `$c = \\sqrt{a^2 + b^2} = \\sqrt{${a * a + b * b}} \\approx ${nd(c)}$${ask === "e" ? `, y $e = \\frac ca \\approx ${nd(ans)}$` : ""}.`
            : `$c = \\sqrt{${Math.max(a, b) ** 2} - ${Math.min(a, b) ** 2}} \\approx ${nd(c)}$${ask === "e" ? `, y $e = \\frac{c}{${big}} \\approx ${nd(ans)}$` : ""}.`];
        ask = ask === "c" ? "la distancia del centro a cada foco" : "la excentricidad";
        // verificación: con los focos a la distancia que da la respuesta, la suma (elipse) o la diferencia (hipérbola)
        // de las distancias a los focos es la misma en todos los puntos de la paramétrica
        verify = { kind: "zero", fn: v => {
          const cc = ask === "la excentricidad" ? v * big : v, alongU = hyp || a > b, dir = (alongU !== swap) ? [1, 0] : [0, 1];
          const F1 = [h + cc * dir[0], k + cc * dir[1]], F2 = [h - cc * dir[0], k - cc * dir[1]];
          const vals = [0.3, 0.9, 1.2, 2.0, 2.6, 4.0, 5.5].map(t => {
            const u = a * (hyp ? 1 / Math.cos(t) : Math.cos(t)), w = b * (hyp ? Math.tan(t) : Math.sin(t)), P = swap ? [h + w, k + u] : [h + u, k + w];
            const d1 = Math.hypot(P[0] - F1[0], P[1] - F1[1]), d2 = Math.hypot(P[0] - F2[0], P[1] - F2[1]);
            return hyp ? Math.abs(d1 - d2) : d1 + d2;
          });
          return vals.map(x => (x - vals[0]) / 10);
        } };
      }
      return {
        prompt: `Las ecuaciones paramétricas $x = ${px}$, $y = ${py}$ describen ${name}. Calculá ${ask}.`,
        answer: ans, solution: sol, verify
      };
    }
  };

  T["ga-tangente-ext-num"] = {
    type: "numeric", concepts: ["ga-tangente-conica"], difficulty: 3,
    generate(r) {
      const circ = r.bool(), a = r.int(1, 5), b = circ ? a : r.int(1, 5), x1 = r.int(-6, 6), y1 = r.int(-6, 6);
      if (!circ && a === b) return null;
      if (x1 * x1 / (a * a) + y1 * y1 / (b * b) <= 1.05 || x1 * x1 === a * a) return null;
      // y − y₁ = m(x − x₁) es tangente si n = y₁ − m x₁ cumple n² = a²m² + b²
      const A2 = x1 * x1 - a * a, B2 = -2 * x1 * y1, C2 = y1 * y1 - b * b, disc = B2 * B2 - 4 * A2 * C2;
      const m1 = (-B2 + Math.sqrt(disc)) / (2 * A2), m2 = (-B2 - Math.sqrt(disc)) / (2 * A2), ans = Math.max(m1, m2);
      const eq = circ ? `x^2 + y^2 = ${a * a}` : `${a === 1 ? "x^2" : `\\frac{x^2}{${a * a}}`} + ${b === 1 ? "y^2" : `\\frac{y^2}{${b * b}}`} = 1`;
      return {
        prompt: `Desde el punto exterior $P(${x1}, ${y1})$ se trazan las dos rectas tangentes a ${circ ? "la circunferencia" : "la elipse"} $${eq}$. Calculá la mayor de sus pendientes.`,
        answer: ans,
        solution: [`[[ga-tangente-conica|Tangentes desde un punto exterior]]: el haz de rectas por $P$ es $y = mx + n$ con $n = ${H.poly([[y1, ""], [-x1, "m"]])}$.`,
          `Una recta $y = mx + n$ es tangente a $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$ si $n^2 = a^2m^2 + b^2$ (el discriminante de la intersección se anula). Acá: $(${H.poly([[y1, ""], [-x1, "m"]])})^2 = ${H.poly([[a * a, "m^{2}"], [b * b, ""]])}$.`,
          `Queda $${H.poly([[A2, "m^{2}"], [B2, "m"], [C2, ""]])} = 0$, con raíces $m \\approx ${nd(Math.min(m1, m2))}$ y $m \\approx ${nd(ans)}$.`],
        // verificación: sobre la recta con la pendiente respondida, el mínimo de x²/a² + y²/b² − 1 es cero (la toca sin cortarla)
        verify: { kind: "zero", tol: 1e-6, fn: m => [ternMin(x => x * x / (a * a) + (y1 + m * (x - x1)) ** 2 / (b * b) - 1, -1e3, 1e3)] }
      };
    }
  };

  const cards = {
    "ga-conica-def": {
      group: "ga-conicas-u", title: "Definición general de cónica: foco, directriz y excentricidad",
      aliases: ["definición por foco y directriz", "foco y directriz", "excentricidad de una cónica", "directriz de una cónica"], concepts: ["ga-conica-def"],
      summary: "Una cónica es el lugar de los puntos cuya distancia a un foco es e veces su distancia a una recta directriz. e < 1 elipse, e = 1 parábola, e > 1 hipérbola.",
      def: [R`Dados un punto $F$ (**foco**), una recta $d$ que no pasa por $F$ (**directriz**) y un número $e > 0$ (**excentricidad**), la **cónica** es el conjunto de puntos $P$ del plano con $$\frac{d(P, F)}{d(P, d)} = e.$$`,
        R`Según $e$: **elipse** si $0 < e < 1$, **parábola** si $e = 1$, **hipérbola** si $e > 1$. La **circunferencia** se considera el caso límite $e = 0$ (el foco es el centro y la directriz se va al infinito).`,
        R`Las cuatro aparecen al cortar un cono doble con un plano, por eso se llaman cónicas ([[c2-conicas|secciones cónicas]]).`],
      idea: [R`La excentricidad mide cuánto «pesa» la directriz frente al foco. Con $e$ chico, para estar en la curva hay que estar mucho más cerca del foco que de la directriz, y la curva queda encerrada alrededor del foco: una elipse casi redonda. Con $e = 1$ la curva se escapa al infinito por un solo lado (parábola), y con $e > 1$ se abre en dos ramas.`,
        R`Una misma definición describe las tres curvas: esa es la ventaja frente a las definiciones con dos focos. Además es la que da la forma polar $r = \frac{ed}{1 + e\cos\theta}$ ([[c2-polares|cónicas en polares]]).`],
      demo: [R`**Paso 1 (planteo).** Elegimos ejes con el foco en el origen, $F = (0, 0)$, y la directriz vertical $x = d$, con $d > 0$. La distancia de $P = (x, y)$ al foco es $\sqrt{x^2 + y^2}$ (distancia euclídea) y a la directriz es $|d - x|$ (la distancia a una recta vertical se mide en horizontal).`,
        R`**Paso 2.** La condición $d(P, F) = e\,d(P, d)$ tiene los dos lados positivos, así que podemos elevar al cuadrado sin agregar soluciones: $$x^2 + y^2 = e^2(d - x)^2 = e^2d^2 - 2e^2d\,x + e^2x^2.$$`,
        R`**Paso 3.** Pasamos todo al lado izquierdo y agrupamos los términos en $x^2$: $$(1 - e^2)\,x^2 + 2e^2d\,x + y^2 - e^2d^2 = 0.$$ Es una ecuación de segundo grado sin término $xy$, y el tipo de curva lo decide el signo del coeficiente de $x^2$ comparado con el de $y^2$, que es $1$.`,
        R`**Paso 4 ($e = 1$).** El coeficiente de $x^2$ se anula y queda $y^2 = -2d\,x + d^2$: falta un cuadrado, así que es una parábola (despejando, $x$ es una función cuadrática de $y$).`,
        R`**Paso 5 ($e < 1$).** Ahora $1 - e^2 > 0$: los dos cuadrados tienen el mismo signo. Completando el cuadrado en $x$ se llega a $(1 - e^2)(x - x_0)^2 + y^2 = K$ con $K > 0$, que es una elipse.`,
        R`**Paso 6 ($e > 1$).** Ahora $1 - e^2 < 0$: los cuadrados tienen signos opuestos y, completando el cuadrado, aparece una hipérbola. $\blacksquare$`],
      examples: [{ q: R`Hallá la cónica de foco $(0, 0)$, directriz $x = 4$ y $e = \frac12$.`, steps: [R`$x^2 + y^2 = \frac14(4 - x)^2$, o sea $4x^2 + 4y^2 = 16 - 8x + x^2$.`, R`$3x^2 + 8x + 4y^2 = 16$: los dos cuadrados tienen el mismo signo, es una [[ga-elipse|elipse]].`, R`Completando cuadrados: $3\left(x + \frac43\right)^2 + 4y^2 = \frac{64}{3}$.`] }],
      tips: [R`No confundas la excentricidad con la distancia focal: $e$ no tiene unidades y se compara con $1$.`, R`Si te dan $e$ y un foco pero no la directriz, la cónica no queda determinada.`],
      see: ["ga-parabola", "ga-elipse", "ga-hiperbola", "c2-conicas"]
    },
    "ga-circunferencia": {
      group: "ga-conicas-u", title: "Circunferencia: ecuaciones y familias",
      aliases: ["ecuación general de la circunferencia", "ecuación de la circunferencia", "familia de circunferencias", "potencia de un punto"], concepts: ["ga-circunferencia"],
      summary: "Puntos a distancia r de un centro C. (x − h)² + (y − k)² = r²; la general x² + y² + Dx + Ey + F = 0 es circunferencia si D² + E² − 4F > 0.",
      def: [R`La **circunferencia** de centro $C$ y radio $r > 0$ es el conjunto de puntos $P$ con $|\vec{CP}| = r$ (ecuación **vectorial**).`,
        R`**Paramétrica:** $x = h + r\cos t$, $y = k + r\sin t$, con $t \in [0, 2\pi)$. **Cartesiana:** $(x - h)^2 + (y - k)^2 = r^2$.`,
        R`**General:** $x^2 + y^2 + Dx + Ey + F = 0$. Tiene centro $\left(-\frac D2, -\frac E2\right)$ y $r^2 = \frac{D^2 + E^2 - 4F}{4}$: si ese número es positivo es una circunferencia, si es $0$ es un punto y si es negativo no hay puntos.`,
        R`**Familia de circunferencias:** si $C_1 = 0$ y $C_2 = 0$ son dos circunferencias que se cortan, $C_1 + \lambda C_2 = 0$ (con $\lambda \neq -1$) son circunferencias que pasan por los mismos puntos de corte. Con $\lambda = -1$ queda la recta por esos puntos (el eje radical).`],
      idea: [R`Para reconocerla en la forma general: $x^2$ e $y^2$ con el **mismo coeficiente** y **sin término** $xy$. Se divide por ese coeficiente y se completan cuadrados.`,
        R`Al reemplazar un punto $P_0$ en la ecuación general (con coeficiente $1$ en los cuadrados) se obtiene la **potencia** de $P_0$: negativa si está adentro, cero si está en la circunferencia y positiva si está afuera.`],
      demo: [R`**Paso 1 (cartesiana).** $P = (x, y)$ está en la circunferencia si su distancia al centro $(h, k)$ es $r$. Por la fórmula de distancia (Pitágoras), $\sqrt{(x - h)^2 + (y - k)^2} = r$, y como los dos lados son positivos, elevar al cuadrado no cambia el conjunto: $(x - h)^2 + (y - k)^2 = r^2$.`,
        R`**Paso 2 (paramétrica).** Si $x = h + r\cos t$, $y = k + r\sin t$, entonces $(x - h)^2 + (y - k)^2 = r^2(\cos^2 t + \sin^2 t) = r^2$ por la identidad pitagórica, así que el punto está en la curva. Y todo punto de la curva es de esa forma, porque $\left(\frac{x - h}{r}, \frac{y - k}{r}\right)$ es un punto de la circunferencia unidad y tiene un ángulo $t$.`,
        R`**Paso 3 (general → centro y radio).** Completamos cuadrados: $x^2 + Dx = \left(x + \frac D2\right)^2 - \frac{D^2}{4}$, y lo mismo con $y$. La ecuación queda $$\left(x + \tfrac D2\right)^2 + \left(y + \tfrac E2\right)^2 = \frac{D^2 + E^2 - 4F}{4}.$$ El lado izquierdo es el cuadrado de la distancia a $\left(-\frac D2, -\frac E2\right)$, que nunca es negativo: de ahí salen los tres casos según el signo del lado derecho.`,
        R`**Paso 4 (familias).** Si $P_0$ está en las dos circunferencias, $C_1(P_0) = 0$ y $C_2(P_0) = 0$, así que $C_1(P_0) + \lambda C_2(P_0) = 0$: todo punto común está en cada miembro de la familia. La ecuación $C_1 + \lambda C_2 = 0$ tiene $(1 + \lambda)$ como coeficiente de $x^2$ y de $y^2$ y no tiene término $xy$, así que, si $\lambda \neq -1$, dividiendo por $1 + \lambda$ vuelve a ser de la forma general. $\blacksquare$`],
      examples: [{ q: R`Centro y radio de $2x^2 + 2y^2 - 8x + 12y - 6 = 0$.`, steps: [R`Dividimos por $2$: $x^2 + y^2 - 4x + 6y - 3 = 0$.`, R`$(x - 2)^2 + (y + 3)^2 = 3 + 4 + 9 = 16$.`, R`Centro $(2, -3)$, radio $4$.`] }],
      tips: [R`Antes de completar cuadrados, dividí por el coeficiente de $x^2$: si no, el radio sale mal.`, R`Si $D^2 + E^2 - 4F \le 0$, no es una circunferencia «de verdad»: revisá antes de dar el radio.`],
      see: ["ga-traslacion", "ga-tangente-conica", "cuadratica"]
    },
    "ga-traslacion": {
      group: "ga-conicas-u", title: "Traslación de ejes",
      aliases: ["traslación de ejes", "trasladar los ejes", "traslación de coordenadas"], concepts: ["ga-traslacion"],
      summary: "Correr el origen a O'(h, k) sin girar los ejes: x = x' + h, y = y' + k. Sirve para llevar una cónica a su forma canónica.",
      def: [R`Una **traslación de ejes** cambia el origen $O$ por $O' = (h, k)$ y deja los ejes paralelos a los originales. Si un punto tiene coordenadas $(x, y)$ en el sistema viejo y $(x', y')$ en el nuevo, $$x = x' + h, \qquad y = y' + k.$$`,
        R`Para obtener la ecuación de una curva en el sistema nuevo, se reemplaza $x$ por $x' + h$ e $y$ por $y' + k$.`],
      idea: [R`Trasladar no deforma nada: la curva es la misma, solo cambia el lugar desde donde la miramos. Si ponemos el origen en el centro de una elipse (o en el vértice de una parábola), desaparecen los términos de primer grado y la ecuación queda en su forma más simple.`,
        R`Completar cuadrados es justamente encontrar la traslación que hace falta: en $(x - 3)^2$ ya está escrito que conviene usar $x' = x - 3$.`],
      demo: [R`**Paso 1.** Sea $P$ un punto cualquiera. Como vectores, $\vec{OP} = \vec{OO'} + \vec{O'P}$: para ir del origen viejo a $P$ se puede pasar por el origen nuevo.`,
        R`**Paso 2.** Los ejes nuevos tienen las mismas direcciones y unidades que los viejos, así que las componentes de $\vec{O'P}$ en la base de siempre son las coordenadas nuevas $(x', y')$. Las de $\vec{OP}$ son $(x, y)$ y las de $\vec{OO'}$ son $(h, k)$.`,
        R`**Paso 3.** Igualando componentes en la suma del Paso 1 queda $x = h + x'$, $y = k + y'$. Despejando, $x' = x - h$, $y' = y - k$. $\blacksquare$`,
        R`**Paso 4 (para qué sirve).** En $A(x - h)^2 + C(y - k)^2 = K$ reemplazamos $x - h = x'$, $y - k = y'$ y queda $Ax'^2 + Cy'^2 = K$, sin términos lineales: la forma canónica centrada en $O'$.`],
      examples: [{ q: R`Trasladá los ejes para simplificar $x^2 + 4y^2 - 6x + 16y + 21 = 0$.`, steps: [R`Completando cuadrados: $(x - 3)^2 + 4(y + 2)^2 = 9 + 16 - 21 = 4$.`, R`Con $O' = (3, -2)$: $x'^2 + 4y'^2 = 4$, o sea $\frac{x'^2}{4} + y'^2 = 1$, una [[ga-elipse|elipse]].`] }],
      tips: [R`Ojo con el signo: si aparece $(x + 2)^2$, el nuevo origen tiene $h = -2$.`, R`La traslación no elimina el término $xy$: para eso hace falta rotar los ejes.`],
      see: ["ga-circunferencia", "ga-elipse", "cuadratica"]
    },
    "ga-parabola": {
      group: "ga-conicas-u", title: "Parábola",
      aliases: ["lado recto", "foco de la parábola", "eje de la parábola", "propiedad de reflexión de la parábola"], concepts: ["ga-parabola"],
      summary: "Puntos que equidistan de un foco y una directriz. y² = 4px: foco (p, 0), directriz x = −p, lado recto |4p|.",
      def: [R`La **parábola** es el conjunto de puntos que están a la misma distancia de un punto $F$ (**foco**) que de una recta $d$ (**directriz**): es la cónica con $e = 1$.`,
        R`**Canónicas** (vértice en el origen): $y^2 = 4px$, con foco $(p, 0)$ y directriz $x = -p$ (eje horizontal; abre a la derecha si $p > 0$); o $x^2 = 4py$, con foco $(0, p)$ y directriz $y = -p$ (eje vertical). Con vértice en $(h, k)$: $(y - k)^2 = 4p(x - h)$ o $(x - h)^2 = 4p(y - k)$.`,
        R`**Elementos:** vértice, eje (la recta por el foco perpendicular a la directriz), parámetro $p$ (distancia del vértice al foco) y **lado recto**, la cuerda por el foco perpendicular al eje, que mide $|4p|$. **Paramétricas:** $x = pt^2$, $y = 2pt$.`,
        R`**Propiedad de reflexión:** un rayo paralelo al eje se refleja en la parábola y pasa por el foco.`],
      idea: [R`Por la reflexión, las antenas parabólicas y los faros tienen esta forma: todo lo que llega paralelo al eje se concentra en el foco, y lo que sale del foco sale en un haz paralelo.`,
        R`El vértice está exactamente a mitad de camino entre el foco y la directriz, porque él también tiene que equidistar de los dos.`],
      demo: [R`**Paso 1 (canónica).** Tomamos foco $F = (p, 0)$ y directriz $x = -p$. La distancia de $P = (x, y)$ al foco es $\sqrt{(x - p)^2 + y^2}$ y a la directriz es $|x + p|$. Igualamos y elevamos al cuadrado (los dos lados son positivos): $(x - p)^2 + y^2 = (x + p)^2$.`,
        R`**Paso 2.** Desarrollando los binomios, $x^2$ y $p^2$ aparecen en los dos lados y se cancelan: $-2px + y^2 = 2px$, o sea $y^2 = 4px$.`,
        R`**Paso 3 (lado recto).** La cuerda pasa por el foco, así que tiene $x = p$. Reemplazando, $y^2 = 4p^2$, de donde $y = \pm 2p$: los extremos están a $2|p|$ del eje y la cuerda mide $4|p|$.`,
        R`**Paso 4 (tangente).** Por [[ga-tangente-conica|desdoblamiento]], la tangente en $P_0 = (x_0, y_0)$ es $y_0y = 2p(x + x_0)$. Cortándola con el eje ($y = 0$) se obtiene el punto $T = (-x_0, 0)$.`,
        R`**Paso 5 (reflexión).** $|FT| = p + x_0$ (distancia sobre el eje entre $-x_0$ y $p$, con $x_0 \ge 0$ si $p > 0$). Además $|FP_0| = x_0 + p$, porque es igual a la distancia de $P_0$ a la directriz. Entonces el triángulo $FTP_0$ es isósceles y sus ángulos en $T$ y en $P_0$ son iguales.`,
        R`**Paso 6.** El ángulo en $T$ es el que forma la tangente con el eje, que es el mismo que forma con el rayo horizontal que llega a $P_0$ (rectas paralelas cortadas por una transversal). El ángulo en $P_0$ es el que forma la tangente con $P_0F$. Como son iguales, el rayo horizontal se refleja hacia el foco (ángulo de incidencia igual al de reflexión). $\blacksquare$`],
      examples: [{ q: R`Elementos de $y^2 - 4y - 8x + 28 = 0$.`, steps: [R`$(y - 2)^2 = 8x - 24 = 8(x - 3)$.`, R`Vértice $(3, 2)$, $4p = 8$, $p = 2$: abre a la derecha.`, R`Foco $(5, 2)$, directriz $x = 1$, lado recto $8$.`] }],
      tips: [R`La variable que está **al cuadrado** es la que **no** marca el eje: en $(y - k)^2 = 4p(x - h)$ el eje es horizontal.`, R`El signo de $p$ dice hacia dónde abre; el lado recto siempre es positivo.`],
      see: ["ga-conica-def", "ga-tangente-conica", "c2-conicas"]
    },
    "ga-elipse": {
      group: "ga-conicas-u", title: "Elipse",
      aliases: ["semieje mayor", "semieje menor", "eje mayor", "propiedad de reflexión de la elipse"], concepts: ["ga-elipse"],
      summary: "Puntos con PF₁ + PF₂ = 2a. x²/a² + y²/b² = 1 con a > b, c² = a² − b², e = c/a < 1.",
      def: [R`La **elipse** es el conjunto de puntos $P$ cuya suma de distancias a dos puntos fijos $F_1$, $F_2$ (**focos**) es constante: $|PF_1| + |PF_2| = 2a$, con $2a > |F_1F_2| = 2c$.`,
        R`**Canónica** (centro en el origen, focos en el eje $x$): $\frac{x^2}{a^2} + \frac{y^2}{b^2} = 1$ con $b^2 = a^2 - c^2$. Si los focos están en el eje $y$, el denominador mayor va debajo de $y^2$. Con centro $(h, k)$ se reemplaza $x$ por $x - h$ e $y$ por $y - k$.`,
        R`**Elementos:** semieje mayor $a$, semieje menor $b$, vértices $(\pm a, 0)$ y $(0, \pm b)$, focos $(\pm c, 0)$, excentricidad $e = \frac ca < 1$, lado recto $\frac{2b^2}{a}$ y directrices $x = \pm\frac ae$. **Paramétricas:** $x = a\cos t$, $y = b\sin t$.`,
        R`**Propiedad de reflexión:** un rayo que sale de un foco se refleja en la elipse y pasa por el otro foco.`],
      idea: [R`Es la «circunferencia estirada»: si atás un hilo de largo $2a$ a dos clavos y lo mantenés tenso con un lápiz, dibujás una elipse. Si los clavos se juntan ($c = 0$), sale una circunferencia de radio $a$.`,
        R`El semieje mayor es siempre el denominador más grande: mirá dónde está para saber hacia qué eje van los focos. Las salas «de los susurros» usan la reflexión: lo que se dice en un foco se oye en el otro.`],
      demo: [R`**Paso 1 (canónica).** La deducción completa, eliminando las raíces de $\sqrt{(x + c)^2 + y^2} + \sqrt{(x - c)^2 + y^2} = 2a$ con dos elevaciones al cuadrado, está en [[c2-conicas]]. Llega a $(a^2 - c^2)x^2 + a^2y^2 = a^2(a^2 - c^2)$ y, llamando $b^2 = a^2 - c^2 > 0$, a la forma canónica.`,
        R`**Paso 2 (paramétricas).** Con $x = a\cos t$, $y = b\sin t$: $\frac{x^2}{a^2} + \frac{y^2}{b^2} = \cos^2 t + \sin^2 t = 1$. Y todo punto de la elipse es de esa forma, porque $\left(\frac xa, \frac yb\right)$ está en la circunferencia unidad.`,
        R`**Paso 3 (lado recto).** La cuerda pasa por el foco: $x = c$. Entonces $\frac{y^2}{b^2} = 1 - \frac{c^2}{a^2} = \frac{b^2}{a^2}$, de donde $y = \pm\frac{b^2}{a}$ y la cuerda mide $\frac{2b^2}{a}$.`,
        R`**Paso 4 (reflexión: los puntos de la tangente).** Sea $P$ un punto de la elipse y $t$ la tangente en $P$. Todo otro punto $Q$ de $t$ está afuera de la elipse, porque la elipse es convexa y la tangente la deja de un solo lado. Afuera, la suma de distancias a los focos es mayor que $2a$: $|QF_1| + |QF_2| > 2a = |PF_1| + |PF_2|$.`,
        R`**Paso 5.** Entonces $P$ es el punto de $t$ que hace mínima la suma $|XF_1| + |XF_2|$. Reflejamos $F_2$ respecto de $t$ y obtenemos $F_2'$: para todo $X$ de $t$, $|XF_2| = |XF_2'|$, así que minimizar la suma es minimizar $|XF_1| + |XF_2'|$, y eso pasa cuando $X$ está sobre el segmento $F_1F_2'$.`,
        R`**Paso 6.** Como $F_1$, $P$ y $F_2'$ están alineados, los ángulos que forman $PF_1$ y $PF_2'$ con $t$ son opuestos por el vértice, y el de $PF_2'$ es igual al de $PF_2$ por la simetría. Así, $PF_1$ y $PF_2$ forman ángulos iguales con la tangente: el rayo que sale de $F_1$ se refleja hacia $F_2$. $\blacksquare$`],
      examples: [{ q: R`Elementos de $9x^2 + 25y^2 = 225$.`, steps: [R`Dividimos por $225$: $\frac{x^2}{25} + \frac{y^2}{9} = 1$, $a = 5$, $b = 3$.`, R`$c = \sqrt{25 - 9} = 4$: focos $(\pm 4, 0)$, $e = \frac45$.`, R`Lado recto $\frac{2\cdot 9}{5} = \frac{18}{5}$.`] }],
      tips: [R`En la elipse $a$ es el más grande, así que $c^2 = a^2 - b^2$: si te da negativo, cambiaste $a$ por $b$.`, R`La excentricidad de una elipse siempre está entre $0$ y $1$.`],
      see: ["ga-hiperbola", "ga-conica-def", "c2-conicas"]
    },
    "ga-hiperbola": {
      group: "ga-conicas-u", title: "Hipérbola",
      aliases: ["eje transverso", "eje conjugado", "hipérbola equilátera", "propiedad de reflexión de la hipérbola"], concepts: ["ga-hiperbola"],
      summary: "Puntos con |PF₁ − PF₂| = 2a. x²/a² − y²/b² = 1, c² = a² + b², asíntotas y = ±(b/a)x, e = c/a > 1.",
      def: [R`La **hipérbola** es el conjunto de puntos $P$ con $\big||PF_1| - |PF_2|\big| = 2a$, donde $F_1$, $F_2$ son los focos y $2a < |F_1F_2| = 2c$.`,
        R`**Canónica** (focos en el eje $x$): $\frac{x^2}{a^2} - \frac{y^2}{b^2} = 1$ con $b^2 = c^2 - a^2$. Si el término positivo es el de $y^2$, los focos están en el eje $y$.`,
        R`**Elementos:** eje transverso (el que contiene los focos y los vértices $(\pm a, 0)$), eje conjugado (de longitud $2b$), focos $(\pm c, 0)$, excentricidad $e = \frac ca > 1$ y **asíntotas** $y = \pm\frac ba\,x$. Si $a = b$ es **equilátera**: asíntotas perpendiculares y $e = \sqrt2$. **Paramétricas:** $x = \pm a\cosh t$, $y = b\sinh t$.`,
        R`**Propiedad de reflexión:** un rayo dirigido hacia un foco se refleja en la hipérbola (del lado de afuera de la rama) hacia el otro foco.`],
      idea: [R`Las asíntotas son la «armazón» de la hipérbola: se dibuja el rectángulo de lados $2a$ y $2b$ centrado en el centro, sus diagonales son las asíntotas, y las ramas salen de los vértices y se les pegan.`,
        R`El signo menos va siempre delante del término del eje que **no** tiene focos. Y acá $c$ es el más grande de los tres: $c^2 = a^2 + b^2$.`],
      demo: [R`**Paso 1 (paramétricas).** Con $x = a\cosh t$, $y = b\sinh t$: $\frac{x^2}{a^2} - \frac{y^2}{b^2} = \cosh^2 t - \sinh^2 t = 1$, por la identidad fundamental de las funciones hiperbólicas. Como $\cosh t \ge 1$, se recorre la rama derecha; con $-a\cosh t$, la izquierda.`,
        R`**Paso 2 (asíntotas).** Despejamos $y$ y sacamos $x^2$ de la raíz: $$y = \pm\frac ba\sqrt{x^2 - a^2} = \pm\frac ba\,|x|\sqrt{1 - \frac{a^2}{x^2}}.$$ Cuando $|x| \to \infty$, $\frac{a^2}{x^2} \to 0$ y la raíz tiende a $1$.`,
        R`**Paso 3.** Para ver que la distancia a la recta tiende a cero (no solo el cociente), restamos en la rama de arriba con $x > 0$: $$\frac ba\,x - \frac ba\sqrt{x^2 - a^2} = \frac ba\cdot\frac{a^2}{x + \sqrt{x^2 - a^2}},$$ multiplicando y dividiendo por el conjugado. El denominador crece sin límite, así que la diferencia tiende a $0$.`,
        R`**Paso 4 (excentricidad de la equilátera).** Si $a = b$, $c^2 = 2a^2$ y $e = \frac ca = \sqrt2$. Las asíntotas $y = \pm x$ tienen pendientes cuyo producto es $-1$: son perpendiculares. $\blacksquare$`],
      examples: [{ q: R`Elementos de $16x^2 - 9y^2 = 144$.`, steps: [R`$\frac{x^2}{9} - \frac{y^2}{16} = 1$: $a = 3$, $b = 4$.`, R`$c = \sqrt{9 + 16} = 5$: focos $(\pm 5, 0)$, $e = \frac53$.`, R`Asíntotas $y = \pm\frac43x$.`] }],
      tips: [R`En la hipérbola $a$ **no** tiene por qué ser mayor que $b$: $a$ es el del término positivo.`, R`Las rectas paralelas a una asíntota cortan a la hipérbola en un solo punto, pero no son tangentes.`],
      see: ["ga-elipse", "ga-conica-def", "c2-conicas"]
    },
    "ga-tangente-conica": {
      group: "ga-conicas-u", title: "Recta y cónica: posición relativa y tangentes",
      aliases: ["desdoblamiento", "regla del desdoblamiento", "tangente a una cónica", "posición relativa de una recta y una cónica"], concepts: ["ga-tangente-conica"],
      summary: "Al cortar una recta con una cónica queda una cuadrática: Δ > 0 secante, Δ = 0 tangente, Δ < 0 exterior. Tangente en P₀ por desdoblamiento.",
      def: [R`**Posición relativa.** Se reemplaza la recta en la ecuación de la cónica y queda una ecuación en una variable. Si es de segundo grado, su discriminante decide: $\Delta > 0$ **secante** (dos puntos), $\Delta = 0$ **tangente** (un punto doble), $\Delta < 0$ **exterior** (ninguno). Si el término cuadrático se anula (recta paralela al eje de una parábola o a una asíntota de una hipérbola), hay un único punto y la recta no es tangente.`,
        R`**Tangente en un punto de la cónica (desdoblamiento).** Si $P_0 = (x_0, y_0)$ está en $Ax^2 + Cy^2 + Dx + Ey + F = 0$, la tangente en $P_0$ es $$Ax_0x + Cy_0y + D\,\frac{x + x_0}{2} + E\,\frac{y + y_0}{2} + F = 0.$$`,
        R`**Tangentes desde un punto exterior** $P_1$: se plantea el haz de rectas por $P_1$, $y - y_1 = m(x - x_1)$, se lo corta con la cónica y se pide $\Delta = 0$; sale una ecuación en $m$ (con la recta vertical por $P_1$ aparte).`],
      idea: [R`Una recta tangente «toca y se va»: al cortarla con la curva, los dos puntos de intersección se funden en uno. Eso es exactamente una raíz doble, o sea discriminante cero.`,
        R`El desdoblamiento es una regla mnemotécnica: cada cuadrado $x^2$ se «desdobla» en $x_0x$ y cada término lineal $x$ en el promedio $\frac{x + x_0}{2}$. Detrás está el [[c2-gradiente|gradiente]]: es normal a la curva.`],
      demo: [R`**Paso 1.** Llamamos $G(x, y) = Ax^2 + Cy^2 + Dx + Ey + F$. La cónica es la curva de nivel $G = 0$, y el gradiente $\nabla G = (2Ax + D,\ 2Cy + E)$ es perpendicular a las curvas de nivel ([[c2-gradiente|gradiente]]). Por eso, en $P_0$ la tangente es la recta por $P_0$ perpendicular a $\nabla G(P_0)$ (suponiendo que no es el vector nulo).`,
        R`**Paso 2.** La recta por $P_0$ con normal $(2Ax_0 + D,\ 2Cy_0 + E)$ es $$(2Ax_0 + D)(x - x_0) + (2Cy_0 + E)(y - y_0) = 0.$$`,
        R`**Paso 3.** Distribuimos: $2Ax_0x + Dx + 2Cy_0y + Ey - (2Ax_0^2 + Dx_0 + 2Cy_0^2 + Ey_0) = 0$. Como $P_0$ está en la cónica, $Ax_0^2 + Cy_0^2 = -Dx_0 - Ey_0 - F$, y entonces el paréntesis vale $-2Dx_0 - 2Ey_0 - 2F + Dx_0 + Ey_0 = -Dx_0 - Ey_0 - 2F$.`,
        R`**Paso 4.** Reemplazando: $2Ax_0x + 2Cy_0y + D(x + x_0) + E(y + y_0) + 2F = 0$. Dividiendo por $2$ se obtiene la regla del desdoblamiento. $\blacksquare$`,
        R`**Paso 5 (discriminante).** Si la recta $y = mx + n$ corta a la cónica, los puntos comunes tienen $x$ raíz de la cuadrática $G(x, mx + n) = 0$. Una cuadrática tiene dos, una (doble) o ninguna raíz real según el signo de $\Delta$, y cada raíz da un punto de corte.`],
      examples: [{ q: R`Tangente a $x^2 + 2y^2 = 9$ en $(1, 2)$.`, steps: [R`Desdoblamiento: $1\cdot x + 2\cdot 2\,y = 9$.`, R`$x + 4y = 9$, pendiente $-\frac14$.`] }],
      tips: [R`Antes de desdoblar, chequeá que el punto esté en la cónica: si no está, la fórmula da otra recta (la polar), no una tangente.`, R`En el haz de rectas por un punto falta la vertical: probala aparte.`],
      see: ["ga-circunferencia", "ga-parabola", "recta-tangente", "implicita"]
    }
  };

  E.extendCourse("m106", {
    concepts: {
      "ga-conica-def": { name: "Cónica: foco, directriz y excentricidad" }, "ga-circunferencia": { name: "Circunferencia" },
      "ga-traslacion": { name: "Traslación de ejes" }, "ga-parabola": { name: "Parábola" }, "ga-elipse": { name: "Elipse" },
      "ga-hiperbola": { name: "Hipérbola" }, "ga-tangente-conica": { name: "Recta y cónica: tangentes" }
    },
    templates: T,
    units: [{
      id: "ga-conicas-u", order: 3, program: "Unidad 3", title: "Cónicas", icon: "target",
      diagnostic: ["ga-circ-num", "ga-elipse-num", "ga-recta-conica-mc"],
      lessons: [
        { id: "ga-conicas-l1", title: "Circunferencia y traslación de ejes", templates: ["ga-circ-num", "ga-traslacion-tf", "ga-eje-radical-num"], theory: ["ga-circunferencia", "ga-traslacion"],
          intro: R`Completar cuadrados es trasladar los ejes al centro: $(x - h)^2 + (y - k)^2 = r^2$.` },
        { id: "ga-conicas-l2", title: "Foco, directriz y parábola", templates: ["ga-parabola-num", "ga-conica-match"], theory: ["ga-conica-def", "ga-parabola"],
          intro: R`Una sola definición para todas: $d(P, F) = e\,d(P, d)$. Con $e = 1$, la parábola.` },
        { id: "ga-conicas-l3", title: "Elipse e hipérbola", templates: ["ga-elipse-num", "ga-hiperbola-num", "ga-param-conica-num"], theory: ["ga-elipse", "ga-hiperbola"],
          intro: R`Suma de distancias constante (elipse, $c^2 = a^2 - b^2$) o diferencia constante (hipérbola, $c^2 = a^2 + b^2$).` },
        { id: "ga-conicas-l4", title: "Rectas tangentes", templates: ["ga-tangente-num", "ga-recta-conica-mc", "ga-tangente-order", "ga-tangente-ext-num"], theory: ["ga-tangente-conica"],
          intro: R`Recta y cónica: una cuadrática y su discriminante. Tangente en un punto: desdoblamiento.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 4 · SUPERFICIES
 *  Esfera, superficies cilíndricas, cónicas, de revolución y regladas; cuádricas.
 *  Verificaciones: centros por interpolación, radios por bisección, gradientes numéricos,
 *  áreas de secciones con la fórmula del zapatero, puntos girados alrededor del eje y
 *  clasificación de cuádricas mirando qué ejes cortan la superficie.
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const T = {};
  const nd = (x, d = 4) => H.num(x, d).replace(".", "{,}");
  const sq = (v, h) => (h === 0 ? `${v}^2` : `(${H.xm(h, v)})^2`);
  const over = (top, q) => (q === 1 ? top : `\\frac{${top}}{${q}}`);
  const cf = n => (n === 1 ? "" : n === -1 ? "-" : String(n));
  const pt = p => `(${p.join(", ")})`;
  const XYZ = ["x", "y", "z"];
  const eq3 = (m, D, Ee, F, G0) => H.poly([[m, "x^{2}"], [m, "y^{2}"], [m, "z^{2}"], [D, "x"], [Ee, "y"], [F, "z"], [G0, ""]]) + " = 0";
  const plane = (n, d) => `${H.poly([[n[0], "x"], [n[1], "y"], [n[2], "z"]])} = ${d}`;
  const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  const cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const unit = u => { const l = Math.hypot(...u); return u.map(x => x / l); };
  const add = (p, u, t = 1) => p.map((x, i) => x + t * u[i]);

  // ---- herramientas numéricas de las verificaciones ----
  const vtx1 = g => { const a = (g(1) + g(-1) - 2 * g(0)) / 2, b = (g(1) - g(-1)) / 2; return -b / (2 * a); };
  // centro de una superficie x² + y² + z² + …: donde se anulan las tres derivadas parciales (interpolando sobre cada eje)
  const center3 = G => [vtx1(t => G([t, 0, 0])), vtx1(t => G([0, t, 0])), vtx1(t => G([0, 0, t]))];
  // distancia desde p (con G(p) < 0) hasta G = 0 en la dirección u, por bisección
  function rayRoot(G, p, u) {
    let lo = 0, hi = 1;
    while (G(add(p, u, hi)) <= 0) { hi *= 2; if (hi > 1e7) return NaN; }
    for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (G(add(p, u, m)) > 0) hi = m; else lo = m; }
    return (lo + hi) / 2;
  }
  const grad = (G, p) => [0, 1, 2].map(i => { const h = 1e-5, e = [0, 0, 0]; e[i] = h; return (G(add(p, e)) - G(add(p, e, -1))) / (2 * h); });

  /* ---------- Lección 1 · superficie esférica ---------- */
  T["ga-esfera-num"] = {
    type: "numeric", concepts: ["ga-esfera"], difficulty: 2,
    generate(r) {
      const C = [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)], r2 = r.int(1, 40), m = r.pick([1, 1, 2]), ask = r.pick(["r", "r", 0, 1, 2]);
      const D = C.map(c => -2 * c), G0 = dot(C, C) - r2, rr = Math.sqrt(r2);
      const G = p => m * (dot(p, p) + dot(D, p) + G0);
      const ans = ask === "r" ? rr : C[ask];
      return {
        prompt: `Hallá ${ask === "r" ? "el radio" : `la coordenada $${XYZ[ask]}$ del centro`} de la superficie esférica $${eq3(m, m * D[0], m * D[1], m * D[2], m * G0)}$.`,
        answer: ans,
        solution: [
          m === 1 ? `Los tres cuadrados ya tienen coeficiente $1$.` : `Dividimos por $${m}$ para que los cuadrados tengan coeficiente $1$.`,
          `Completamos cuadrados en cada variable ([[ga-esfera|ecuación de la esfera]]): $${sq("x", C[0])} + ${sq("y", C[1])} + ${sq("z", C[2])} = ${r2}$.`,
          `Centro $${pt(C)}$ y radio $\\sqrt{${r2}}${Number.isInteger(rr) ? ` = ${rr}` : ` \\approx ${nd(rr)}`}$.`
        ],
        // verificación: centro interpolado; los puntos a la distancia respondida, en varias direcciones, anulan la ecuación
        verify: ask === "r"
          ? { kind: "zero", fn: v => { const c = center3(G); return [[1, 0, 0], [0, 0.6, 0.8], [0.48, 0.6, -0.64], [-0.36, -0.48, 0.8]].map(u => G(add(c, u, v)) / (m * (v * v + 1))); } }
          : { kind: "value", fn: () => center3(G)[ask] }
      };
    }
  };
  T["ga-esfera-tg-num"] = {
    type: "numeric", concepts: ["ga-esfera"], difficulty: 2,
    generate(r) {
      const C = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)], n = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)], ax = r.int(0, 2);
      if (n[ax] === 0 || dot(n, n) < 2) return null;
      const P0 = add(C, n), d = dot(n, P0), D = C.map(c => -2 * c), G0 = dot(C, C) - dot(n, n);
      const G = p => dot(p, p) + dot(D, p) + G0, ans = d / n[ax];
      return {
        prompt: `El punto $P_0${pt(P0)}$ está en la superficie esférica $${eq3(1, D[0], D[1], D[2], G0)}$. ¿En qué valor corta al eje $${XYZ[ax]}$ el plano tangente en $P_0$?`,
        answer: ans,
        solution: [
          `Completando cuadrados, el centro es $C${pt(C)}$.`,
          `El plano tangente es perpendicular al radio ([[ga-esfera|plano tangente a la esfera]]): su normal es $\\vec{CP_0} = ${pt(n)}$ y pasa por $P_0$, así que es $${plane(n, d)}$.`,
          `Sobre el eje $${XYZ[ax]}$ las otras dos coordenadas valen $0$: $${n[ax]}${XYZ[ax]} = ${d}$, o sea $${XYZ[ax]} = ${H.frac(d, n[ax])}${Number.isInteger(ans) ? "" : ` \\approx ${nd(ans)}`}$.`
        ],
        // verificación: el punto del eje encontrado y P0 determinan un vector perpendicular al gradiente numérico de la ecuación en P0
        verify: { kind: "zero", fn: v => { const Q = [0, 0, 0]; Q[ax] = v; const g = grad(G, P0), w = add(Q, P0, -1); return [dot(g, w) / (Math.hypot(...g) * (Math.hypot(...w) + 1))]; } }
      };
    }
  };
  T["ga-esfera-plano-num"] = {
    type: "numeric", concepts: ["ga-esfera"], difficulty: 3,
    generate(r) {
      const C = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)], n = [r.int(-2, 2), r.int(-2, 2), r.int(-2, 2)], t = r.int(-6, 6);
      const nn = dot(n, n);
      if (nn === 0) return null;
      const del2 = t * t / nn, R2 = Math.floor(del2) + r.int(1, 30), d = dot(n, C) + t, rho = Math.sqrt(R2 - del2);
      const D = C.map(c => -2 * c), G0 = dot(C, C) - R2, G = p => dot(p, p) + dot(D, p) + G0;
      return {
        prompt: `Calculá el radio de la circunferencia en la que el plano $${plane(n, d)}$ corta a la superficie esférica $${eq3(1, D[0], D[1], D[2], G0)}$.`,
        answer: rho,
        solution: [
          `Completando cuadrados: centro $C${pt(C)}$ y radio $R = \\sqrt{${R2}}$.`,
          `Distancia del centro al plano: $\\delta = \\frac{|\\vec n\\cdot C - ${H.par(d)}|}{|\\vec n|} = \\frac{|${dot(n, C)} - ${H.par(d)}|}{\\sqrt{${nn}}} = \\frac{${Math.abs(t)}}{\\sqrt{${nn}}}$, menor que $R$: el plano es secante.`,
          `El radio de la sección sale de Pitágoras con el radio $R$ y la distancia $\\delta$ ([[ga-esfera|superficie esférica]]): $\\rho = \\sqrt{R^2 - \\delta^2} = \\sqrt{${R2} - ${H.frac(t * t, nn)}} \\approx ${nd(rho)}$.`
        ],
        // verificación: pie de la perpendicular proyectando sobre una base ortonormal del plano, y radio por bisección desde ese pie
        verify: { kind: "value", fn: () => {
          const c = center3(G), j = [0, 1, 2].reduce((b, i) => (Math.abs(n[i]) > Math.abs(n[b]) ? i : b), 0);
          const P1 = [0, 0, 0]; P1[j] = d / n[j];
          const e = j === 0 ? [0, 1, 0] : [1, 0, 0], u = unit(cross(n, e)), w = unit(cross(n, u)), dc = add(c, P1, -1);
          const foot = add(add(P1, u, dot(dc, u)), w, dot(dc, w));
          return rayRoot(G, foot, unit(add(u, w)));
        } }
      };
    }
  };

  /* ---------- Lección 2 · superficies cilíndricas y cónicas ---------- */
  T["ga-sup-cil-tf"] = {
    type: "tf", concepts: ["ga-sup-cilindrica"], difficulty: 1,
    generate(r) {
      const miss = r.int(0, 2), [ui, vi] = [0, 1, 2].filter(i => i !== miss), [u, v] = r.bool() ? [ui, vi] : [vi, ui];
      const kind = r.pick(["ell", "hyp", "par"]), A = r.int(1, 5), B = r.int(1, 5), K = r.int(1, 12), c0 = r.int(-4, 4);
      const U = XYZ[u], V = XYZ[v];
      const tex = kind === "ell" ? `${cf(A)}${U}^2 + ${cf(B)}${V}^2 = ${K}` : kind === "hyp" ? `${cf(A)}${U}^2 - ${cf(B)}${V}^2 = ${K}` : `${V} = ${H.poly([[A, `${U}^{2}`], [c0, ""]])}`;
      const F = p => (kind === "ell" ? A * p[u] ** 2 + B * p[v] ** 2 - K : kind === "hyp" ? A * p[u] ** 2 - B * p[v] ** 2 - K : p[v] - A * p[u] ** 2 - c0);
      const claim = r.bool() ? miss : r.pick([u, v]), truth = claim === miss;
      const curve = kind === "ell" ? "una elipse" : kind === "hyp" ? "una hipérbola" : "una parábola";
      return {
        prompt: `<b>Verdadero o falso:</b> en el espacio, $${tex}$ es una superficie cilíndrica con generatrices paralelas al eje $${XYZ[claim]}$.`,
        answer: truth,
        explanation: `En la ecuación no aparece $${XYZ[miss]}$: si un punto la cumple, también la cumple todo punto que difiera de él solo en la coordenada $${XYZ[miss]}$. Por eso contiene cada recta paralela al eje $${XYZ[miss]}$ que pasa por uno de sus puntos: es una [[ga-sup-cilindrica|superficie cilíndrica]] cuya directriz es ${curve} del plano $${XYZ[miss]} = 0$${truth ? "." : `, con generatrices paralelas al eje $${XYZ[miss]}$, no al eje $${XYZ[claim]}$.`}`,
        solution: [`Una ecuación en la que falta una variable representa un cilindro con generatrices paralelas al eje de esa variable.`],
        // verificación: la ecuación no cambia al moverse en la dirección del eje propuesto (desde puntos y con pasos variados)
        verify: { kind: "truth", fn: () => [[0.3, -1.2, 2.1], [1.7, 0.4, -0.9], [-2.2, 1.1, 0.5]].every((p, i) => { const e = [0, 0, 0]; e[claim] = 1.3 + i; return Math.abs(F(add(p, e)) - F(p)) < 1e-9; }) }
      };
    }
  };
  T["ga-sup-conica-num"] = {
    type: "numeric", concepts: ["ga-sup-conica"], difficulty: 3, testN: 100,
    generate(r) {
      const V = [r.int(-2, 2), r.int(-2, 2), r.nz(-6, 6)], a = r.int(1, 5), b = r.int(1, 5), c = r.nz(-6, 6), ask = r.pick(["area", "sx"]);
      if (c === V[2]) return null;
      const lam = (V[2] - c) / V[2], ans = ask === "area" ? Math.PI * a * b * lam * lam : a * Math.abs(lam);
      const dir = a === b ? `la circunferencia $x^2 + y^2 = ${a * a}$, $z = 0$` : `la elipse $${over("x^2", a * a)} + ${over("y^2", b * b)} = 1$, $z = 0$`;
      return {
        prompt: `Considerá la superficie cónica de vértice $V${pt(V)}$ cuya directriz es ${dir}. Calculá ${ask === "area" ? "el área de la región que encierra" : "el semieje paralelo al eje $x$ de"} la sección que produce el plano $z = ${c}$.`,
        answer: ans,
        solution: [
          `Cada generatriz une $V$ con un punto $Q$ de la directriz: $X = V + \\lambda(Q - V)$ ([[ga-sup-conica|superficie cónica]]). La altura $z = ${c}$ se alcanza con $\\lambda = \\frac{${V[2]} - ${H.par(c)}}{${V[2]}} = ${H.frac(V[2] - c, V[2])}$, el mismo para todas las generatrices.`,
          `Entonces la sección es la directriz achicada (o agrandada) desde $V$ con razón $|\\lambda| = ${H.frac(Math.abs(V[2] - c), Math.abs(V[2]))}$: semiejes $${a}|\\lambda|$ y $${b}|\\lambda|$.`,
          ask === "area" ? `Área: $\\pi\\cdot${a}\\cdot${b}\\cdot\\lambda^2 \\approx ${nd(ans)}$ (las áreas se multiplican por $\\lambda^2$).` : `Semieje paralelo al eje $x$: $${a}\\cdot${H.frac(Math.abs(V[2] - c), Math.abs(V[2]))} ${Number.isInteger(ans) ? "=" : "\\approx"} ${nd(ans)}$.`
        ],
        // verificación: se corta cada generatriz con el plano por bisección y se mide la sección (zapatero o ancho máximo)
        verify: { kind: "value", fn: () => {
          const N = 2000, pts = [];
          for (let i = 0; i < N; i++) {
            const th = 2 * Math.PI * i / N, Q = [a * Math.cos(th), b * Math.sin(th), 0], dq = add(Q, V, -1), z = l => V[2] + l * dq[2] - c;
            let lo = -50, hi = 50; const slo = Math.sign(z(lo));
            for (let k = 0; k < 60; k++) { const mm = (lo + hi) / 2; if (Math.sign(z(mm)) === slo) lo = mm; else hi = mm; }
            const X = add(V, dq, (lo + hi) / 2); pts.push([X[0], X[1]]);
          }
          if (ask === "sx") { const xs = pts.map(p => p[0]); return (Math.max(...xs) - Math.min(...xs)) / 2; }
          let A2 = 0; for (let i = 0; i < N; i++) { const p = pts[i], q = pts[(i + 1) % N]; A2 += p[0] * q[1] - q[0] * p[1]; }
          return Math.abs(A2) / 2;
        }, tol: 1e-5 }
      };
    }
  };

  /* ---------- Lección 3 · superficies de revolución ---------- */
  // curvas de un plano coordenado que giran alrededor de un eje de ese plano: u es la otra coordenada del plano, v la tercera
  function revCase(r) {
    const w = r.int(0, 2), [u, v] = r.shuffle([0, 1, 2].filter(i => i !== w)), Wv = XYZ[w], U = XYZ[u], Vv = XYZ[v];
    const kind = r.pick(["parab", "cono", "elip", "hip1", "hip2", "cil"]), rho = p => Math.hypot(p[u], p[v]);
    const s2 = `${U}^2 + ${Vv}^2`, d2 = `${U}^2 - ${Vv}^2`;
    let curve, sub, opts, name, samp;
    if (kind === "parab") {
      const k = r.nz(-3, 3);
      curve = `${Wv} = ${cf(k)}${U}^2`; sub = `${Wv} = ${cf(k)}\\left(\\sqrt{${s2}}\\right)^2`; name = "un paraboloide de revolución";
      opts = [[`${Wv} = ${cf(k)}(${s2})`, p => p[w] - k * (p[u] ** 2 + p[v] ** 2)],
        [`${Wv}^2 + ${Vv}^2 = ${cf(k * k)}${U}^4`, p => p[w] ** 2 + p[v] ** 2 - k * k * p[u] ** 4],
        [`${Wv} = ${cf(k)}(${d2})`, p => p[w] - k * (p[u] ** 2 - p[v] ** 2)],
        [`${Wv}^2 = ${cf(k)}(${s2})`, p => p[w] ** 2 - k * (p[u] ** 2 + p[v] ** 2)]];
      samp = t => [t, k * t * t];
    } else if (kind === "cono") {
      const k = r.nz(-3, 3);
      curve = `${Wv} = ${cf(k)}${U}`; sub = `${Wv} = ${cf(k)}\\left(\\pm\\sqrt{${s2}}\\right)`; name = "un cono circular";
      opts = [[`${Wv}^2 = ${cf(k * k)}(${s2})`, p => p[w] ** 2 - k * k * (p[u] ** 2 + p[v] ** 2)],
        [`${Wv}^2 + ${Vv}^2 = ${cf(k * k)}${U}^2`, p => p[w] ** 2 + p[v] ** 2 - k * k * p[u] ** 2],
        [`${Wv} = ${cf(k)}(${s2})`, p => p[w] - k * (p[u] ** 2 + p[v] ** 2)],
        [`${Wv}^2 = ${cf(k * k)}(${d2})`, p => p[w] ** 2 - k * k * (p[u] ** 2 - p[v] ** 2)]];
      samp = t => [t, k * t];
    } else if (kind === "cil") {
      const c = r.int(2, 5);
      curve = `${U} = ${c}`; sub = `\\pm\\sqrt{${s2}} = ${c}`; name = "un cilindro circular";
      opts = [[`${s2} = ${c * c}`, p => p[u] ** 2 + p[v] ** 2 - c * c],
        [`${U}^2 + ${Wv}^2 = ${c * c}`, p => p[u] ** 2 + p[w] ** 2 - c * c],
        [`${d2} = ${c * c}`, p => p[u] ** 2 - p[v] ** 2 - c * c],
        [`${s2} = ${c}`, p => p[u] ** 2 + p[v] ** 2 - c]];
      samp = t => [c, t];
    } else {
      const [a, b] = kind === "elip" ? r.distinct(2, 1, 4) : [r.int(1, 4), r.int(1, 4)], A = a * a, B = b * b;
      const fr = (top, q) => (q === 1 ? (top.includes("+") || top.includes("-") ? `(${top})` : top) : `\\frac{${top}}{${q}}`);
      const sg = kind === "elip" ? "+" : "-";
      if (kind === "hip2") {
        curve = `${over(`${Wv}^2`, B)} - ${over(`${U}^2`, A)} = 1`; sub = `${over(`${Wv}^2`, B)} - ${over(`\\left(\\sqrt{${s2}}\\right)^2`, A)} = 1`; name = "un hiperboloide de dos hojas de revolución";
        opts = [[`${over(`${Wv}^2`, B)} - ${fr(s2, A)} = 1`, p => p[w] ** 2 / B - (p[u] ** 2 + p[v] ** 2) / A - 1],
          [`${fr(`${Wv}^2 + ${Vv}^2`, B)} - ${over(`${U}^2`, A)} = 1`, p => (p[w] ** 2 + p[v] ** 2) / B - p[u] ** 2 / A - 1],
          [`${over(`${Wv}^2`, B)} - ${fr(d2, A)} = 1`, p => p[w] ** 2 / B - (p[u] ** 2 - p[v] ** 2) / A - 1],
          [`${fr(s2, A)} - ${over(`${Wv}^2`, B)} = 1`, p => (p[u] ** 2 + p[v] ** 2) / A - p[w] ** 2 / B - 1]];
        samp = t => [a * Math.sinh(t), b * Math.cosh(t) * (t > 0.2 ? -1 : 1)];
      } else {
        const sgn = kind === "elip" ? 1 : -1;
        curve = `${over(`${U}^2`, A)} ${sg} ${over(`${Wv}^2`, B)} = 1`; sub = `${over(`\\left(\\sqrt{${s2}}\\right)^2`, A)} ${sg} ${over(`${Wv}^2`, B)} = 1`;
        name = kind === "elip" ? "un elipsoide de revolución" : "un hiperboloide de una hoja de revolución";
        opts = [[`${fr(s2, A)} ${sg} ${over(`${Wv}^2`, B)} = 1`, p => (p[u] ** 2 + p[v] ** 2) / A + sgn * p[w] ** 2 / B - 1],
          [`${over(`${U}^2`, A)} ${sg} ${fr(`${Wv}^2 + ${Vv}^2`, B)} = 1`, p => p[u] ** 2 / A + sgn * (p[w] ** 2 + p[v] ** 2) / B - 1],
          [`${fr(d2, A)} ${sg} ${over(`${Wv}^2`, B)} = 1`, p => (p[u] ** 2 - p[v] ** 2) / A + sgn * p[w] ** 2 / B - 1],
          [`${fr(s2, A)} ${kind === "elip" ? "-" : "+"} ${over(`${Wv}^2`, B)} = 1`, p => (p[u] ** 2 + p[v] ** 2) / A - sgn * p[w] ** 2 / B - 1]];
        samp = kind === "elip" ? t => [a * Math.cos(t), b * Math.sin(t)] : t => [a * Math.cosh(t), b * Math.sinh(t)];
      }
    }
    // puntos de la superficie: cada punto de la curva girado un ángulo φ alrededor del eje
    const points = () => {
      const out = [];
      for (const t of [-1.3, -0.6, 0.25, 0.9, 1.7]) for (const ph of [0.4, 1.9, 3.3, 5.1]) {
        const [u0, w0] = samp(t), p = [0, 0, 0]; p[u] = u0 * Math.cos(ph); p[v] = u0 * Math.sin(ph); p[w] = w0; out.push(p);
      }
      return out;
    };
    const fits = fn => points().every(p => Math.abs(fn(p)) < 1e-9 * (1 + Math.hypot(...p) ** 4));
    return { w, u, v, Wv, U, Vv, curve, sub, opts, name, fits, rho };
  }
  T["ga-revolucion-mc"] = {
    type: "mc", concepts: ["ga-sup-revolucion"], difficulty: 2,
    generate(r) {
      const q = revCase(r);
      const [good, ...bad] = q.opts;
      return {
        prompt: `La curva $${q.curve}$, $${q.Vv} = 0$, gira alrededor del eje $${q.Wv}$. ¿Qué ecuación tiene la superficie de revolución que genera?`,
        ...H.mc(r, good[0], bad.map(o => o[0])),
        solution: [
          `Cada punto de la curva describe un paralelo: una circunferencia perpendicular al eje $${q.Wv}$ con centro en él ([[ga-sup-revolucion|superficie de revolución]]). En el paralelo, $${q.Wv}$ no cambia y la distancia al eje es $\\sqrt{${q.U}^2 + ${q.Vv}^2}$.`,
          `Por eso se reemplaza $${q.U}$ por $\\pm\\sqrt{${q.U}^2 + ${q.Vv}^2}$: $${q.sub}$, o sea $${good[0]}$, que es ${q.name}.`
        ],
        // verificación: puntos de la curva girados ángulos variados alrededor del eje cumplen la correcta y no las otras
        verify: { kind: "truth", target: true, fn: () => q.fits(good[1]) && bad.every(o => !q.fits(o[1])) }
      };
    }
  };
  T["ga-revolucion-order"] = {
    type: "order", concepts: ["ga-sup-revolucion"], difficulty: 2,
    generate(r) {
      const q = revCase(r), good = q.opts[0];
      return {
        prompt: `Ordená los pasos para hallar la superficie que genera la curva $${q.curve}$, $${q.Vv} = 0$, al girar alrededor del eje $${q.Wv}$.`,
        steps: [
          `Tomamos un punto $P(x, y, z)$ de la superficie: viene de un punto $P_0$ de la curva que, al girar, describió el paralelo que pasa por $P$.`,
          `En el paralelo la coordenada $${q.Wv}$ no cambia y el radio es la distancia al eje: $${q.Wv}_0 = ${q.Wv}$ y $|${q.U}_0| = \\sqrt{${q.U}^2 + ${q.Vv}^2}$.`,
          `Como $P_0$ está en la curva, reemplazamos sus coordenadas en la ecuación: $${q.sub}$.`,
          `Simplificamos: $${good[0]}$, que es ${q.name}.`
        ],
        solution: [`Toda [[ga-sup-revolucion|superficie de revolución]] se arma igual: el paralelo de cada punto conserva la coordenada del eje y tiene radio igual a la distancia al eje.`],
        // verificación: la ecuación final se cumple en puntos de la curva girados alrededor del eje
        verify: { kind: "truth", target: true, fn: () => q.fits(good[1]) }
      };
    }
  };

  /* ---------- Lección 4 · cuádricas y superficies regladas ---------- */
  const QNAMES = ["Elipsoide", "Hiperboloide de una hoja", "Hiperboloide de dos hojas", "Cono elíptico", "Paraboloide elíptico", "Paraboloide hiperbólico"];
  // clasifica una cuádrica centrada en el origen con ejes en los ejes coordenados, evaluando la ecuación
  function classifyQuadric(F) {
    const rnd = [[0.3, -0.7, 1.1], [1.3, 0.2, -0.4], [-0.6, 1.4, 0.9]];
    const even = rnd.every(p => Math.abs(F(p) - F(p.map(x => -x))) < 1e-9);
    if (!even) {
      // paraboloide: la parte cuadrática (promedio de F(Ru) y F(-Ru)) es semidefinida en el elíptico y toma los dos signos en el hiperbólico
      let mn = Infinity, mx = -Infinity;
      for (let i = 0; i < 24; i++) for (let j = 0; j < 48; j++) {
        const th = Math.PI * (i + 0.5) / 24, ph = 2 * Math.PI * j / 48, u = [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)], Rr = 1e4;
        const q = (F(u.map(x => x * Rr)) + F(u.map(x => -x * Rr))) / 2 / (Rr * Rr); mn = Math.min(mn, q); mx = Math.max(mx, q);
      }
      return mn > -1e-6 || mx < 1e-6 ? 4 : 5;
    }
    const f0 = F([0, 0, 0]);
    if (Math.abs(f0) < 1e-12) return 3;
    const G = p => -Math.sign(f0) * F(p); // ahora G(0) < 0
    // cuántos ejes coordenados cortan a la superficie: 3 elipsoide, 2 hiperboloide de una hoja, 1 de dos hojas
    const hits = [0, 1, 2].filter(i => { const e = [0, 0, 0]; e[i] = 1; return Number.isFinite(rayRoot(G, [0, 0, 0], e)); }).length;
    return hits === 3 ? 0 : hits === 2 ? 1 : hits === 1 ? 2 : -1;
  }
  T["ga-cuadrica-match"] = {
    type: "match", concepts: ["ga-cuadricas-tipos"], difficulty: 2,
    generate(r) {
      const kinds = r.sample([0, 1, 2, 3, 4, 5], 4);
      const items = kinds.map(kind => {
        const [u, v, w] = r.shuffle([0, 1, 2]), p = r.int(1, 5), q = r.int(1, 5), s = r.int(1, 5), K = r.int(1, 20), co = [0, 0, 0];
        let F, tex;
        if (kind <= 3) {
          co[u] = p; co[v] = kind === 2 ? -q : q; co[w] = kind === 0 ? s : -s;
          const rhs = kind === 3 ? 0 : K;
          tex = `${H.poly(XYZ.map((x, i) => [co[i], `${x}^{2}`]))} = ${rhs}`;
          F = P => co[0] * P[0] ** 2 + co[1] * P[1] ** 2 + co[2] * P[2] ** 2 - rhs;
        } else {
          co[u] = p; co[v] = kind === 4 ? q : -q;
          tex = `${XYZ[w]} = ${H.poly(XYZ.map((x, i) => [co[i], `${x}^{2}`]))}`;
          F = P => co[0] * P[0] ** 2 + co[1] * P[1] ** 2 + co[2] * P[2] ** 2 - P[w];
        }
        return { kind, tex, F };
      });
      return {
        prompt: `Uní cada ecuación con la cuádrica que representa.`,
        pairs: items.map(it => [{ tex: it.tex }, { tex: `\\text{${QNAMES[it.kind]}}` }]),
        solution: [
          `Si las tres variables están al cuadrado y igualadas a una constante positiva, se cuentan los signos menos ([[ga-cuadricas-tipos|cuádricas con centro]]): ninguno, elipsoide; uno, hiperboloide de una hoja; dos, hiperboloide de dos hojas. Igualadas a $0$ y con signos mezclados: cono.`,
          `Si una variable aparece sin cuadrado ([[ga-cuadricas-tipos|cuádricas sin centro]]): paraboloide elíptico si los dos cuadrados tienen el mismo signo y paraboloide hiperbólico (la silla de montar) si tienen signos opuestos.`
        ],
        // verificación: simetría central, signo de la parte cuadrática lejos del origen y cantidad de ejes que cortan a la superficie
        verify: { kind: "truth", target: true, fn: () => items.every(it => classifyQuadric(it.F) === it.kind) }
      };
    }
  };
  T["ga-reglada-tf"] = {
    type: "tf", concepts: ["ga-sup-reglada"], difficulty: 3,
    generate(r) {
      const hyp = r.bool(), a = r.int(1, 3), b = r.int(1, 3), c = r.int(1, 3), truth = r.bool(), sg = r.pick([1, -1]);
      let surf, F, P, d, fam;
      if (hyp) {
        surf = `${over("x^2", a * a)} + ${over("y^2", b * b)} - ${over("z^2", c * c)} = 1`;
        F = X => X[0] ** 2 / (a * a) + X[1] ** 2 / (b * b) - X[2] ** 2 / (c * c) - 1;
        [P, d] = r.bool() ? [[a, 0, 0], [0, b, sg * c]] : [[0, b, 0], [a, 0, sg * c]];
        fam = "el hiperboloide de una hoja";
        if (!truth) { if (r.bool()) d = d.map((x, i) => (i === 2 ? 2 * x : x)); else P = P.map(x => 2 * x); }
      } else {
        const mu = r.nz(-2, 2);
        surf = `z = ${over("x^2", a * a)} - ${over("y^2", b * b)}`;
        F = X => X[0] ** 2 / (a * a) - X[1] ** 2 / (b * b) - X[2];
        [P, d] = sg > 0 ? [[a * mu, -b * mu, 0], [a, b, 4 * mu]] : [[a * mu, b * mu, 0], [a, -b, 4 * mu]];
        fam = "el paraboloide hiperbólico";
        if (!truth) { if (r.bool()) d = [d[0], d[1], 2 * mu]; else P = [P[0], P[1], 1]; }
      }
      const lineTex = `(x, y, z) = ${pt(P)} + t${pt(d)}`;
      const X1 = add(P, d), val = F(X1);
      return {
        prompt: `<b>Verdadero o falso:</b> la recta $${lineTex}$ está contenida en la superficie $${surf}$.`,
        answer: truth,
        explanation: truth
          ? `Reemplazando $x$, $y$, $z$ por las coordenadas de la recta, la ecuación se cumple para todo $t$ (los términos en $t$ y en $t^2$ se cancelan): ${fam} es una [[ga-sup-reglada|superficie reglada]].`
          : `No alcanza con que la superficie sea [[ga-sup-reglada|reglada]]: esta recta no está en ella. Por ejemplo, con $t = 1$ se obtiene el punto $${pt(X1)}$, que no cumple la ecuación (el miembro izquierdo menos el derecho da $${nd(val)}$ en vez de $0$).`,
        solution: [`Para ver si una recta está contenida en una superficie, se reemplaza su forma paramétrica en la ecuación: tiene que quedar una identidad, válida para todo $t$.`],
        // verificación: se evalúa la ecuación en muchos puntos de la recta
        verify: { kind: "truth", fn: () => [-2.5, -1, -0.3, 0.7, 1, 2.2].every(t => Math.abs(F(add(P, d, t))) < 1e-9) }
      };
    }
  };

  T["ga-sup-cil-num"] = {
    type: "numeric", concepts: ["ga-sup-cilindrica"], difficulty: 3,
    generate(r) {
      const kind = r.pick(["par", "circ", "ell"]), l = r.int(-3, 3), m = r.int(-3, 3), n = r.nz(-3, 3), A = r.int(1, 3), B = r.int(1, 4), K = r.int(1, 25);
      if (l === 0 && m === 0) return null;
      const x0 = r.int(-4, 4), z0 = r.nz(-4, 4), u = x0 - l * z0 / n;
      // directriz f(x, y) = 0 en z = 0; el punto (x₀, y₀, z₀) está en la superficie si f(x₀ − l z₀/n, y₀ − m z₀/n) = 0
      const f = (x, y) => (kind === "par" ? y - A * x * x : kind === "circ" ? x * x + y * y - K : A * x * x + B * y * y - K);
      let w;
      if (kind === "par") w = A * u * u;
      else { const s = kind === "circ" ? K - u * u : (K - A * u * u) / B; if (s <= 0.05) return null; w = Math.sqrt(s); }
      const y0 = w + m * z0 / n, pz = x => (x < 0 ? `(${nd(x)})` : nd(x)), tf = H.frac(z0, n), tp = tf.startsWith("-") ? `(${tf})` : tf;
      const dirTex = kind === "par" ? `y = ${cf(A)}x^2` : kind === "circ" ? `x^2 + y^2 = ${K}` : `${cf(A)}x^2 + ${cf(B)}y^2 = ${K}`;
      return {
        prompt: `Una superficie cilíndrica tiene directriz $${dirTex}$, $z = 0$, y generatrices paralelas a $\\vec v = ${pt([l, m, n])}$. El punto $(${x0}, y_0, ${z0})$ está en la superficie${kind === "par" ? "" : " y su generatriz corta a la directriz en un punto con $y > 0$"}. Calculá $y_0$.`,
        answer: y0,
        solution: [`La generatriz por $P = (${x0}, y_0, ${z0})$ es $P - t\\vec v$; corta al plano $z = 0$ cuando $${z0} ${n < 0 ? "+" : "-"} ${Math.abs(n) === 1 ? "" : Math.abs(n)}t = 0$, o sea en $t = ${H.frac(z0, n)}$ ([[ga-sup-cilindrica|superficie cilíndrica]]).`,
          `Ese punto es $Q = (${x0} - ${pz(l)}\\cdot ${tp},\\ y_0 - ${pz(m)}\\cdot ${tp},\\ 0)$, con abscisa $x_Q = ${nd(u)}$.`,
          kind === "par" ? `$Q$ está en la directriz: su ordenada es $y_Q = ${A === 1 ? "" : `${A}\\cdot`}${pz(u)}^2 = ${nd(w)}$.` : `$Q$ está en la directriz con ordenada positiva: $y_Q = \\sqrt{${kind === "circ" ? `${K} - ${pz(u)}^2` : `\\frac{${K} - ${A === 1 ? "" : `${A}\\cdot`}${pz(u)}^2}{${B}}`}} \\approx ${nd(w)}$.`,
          `Como $y_Q = y_0 - ${pz(m)}\\cdot ${tp}$, queda $y_0 \\approx ${nd(y0)}$.`],
        // verificación: desde el punto respondido se baja por la generatriz con bisección hasta z = 0 y se evalúa la directriz
        verify: { kind: "zero", fn: v => {
          let lo = -100, hi = 100; const zz = t => z0 - t * n;
          for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (Math.sign(zz(mid)) === Math.sign(zz(lo))) lo = mid; else hi = mid; }
          const t = (lo + hi) / 2, Q = [x0 - t * l, v - t * m];
          return [f(Q[0], Q[1]) / (1 + Math.abs(K)), kind === "par" ? 0 : (Q[1] > 0 ? 0 : 1)];
        } }
      };
    }
  };

  T["ga-revolucion-num"] = {
    type: "numeric", concepts: ["ga-sup-revolucion"], difficulty: 2,
    generate(r) {
      const kind = r.pick(["ell", "hyp1", "hyp2", "par"]), a = r.int(1, 5), c = r.int(1, 5), A = r.int(1, 4), z0 = r.nz(-6, 6), ask = r.pick(["radio", "area"]);
      // generatriz en el plano yz, eje de giro z: el paralelo a la altura z₀ tiene radio ρ con f(ρ, z₀) = 0
      const f = (y, z) => (kind === "ell" ? y * y / (a * a) + z * z / (c * c) - 1 : kind === "hyp1" ? y * y / (a * a) - z * z / (c * c) - 1 : kind === "hyp2" ? z * z / (c * c) - y * y / (a * a) - 1 : z - A * y * y);
      const rho2 = kind === "ell" ? a * a * (1 - z0 * z0 / (c * c)) : kind === "hyp1" ? a * a * (1 + z0 * z0 / (c * c)) : kind === "hyp2" ? a * a * (z0 * z0 / (c * c) - 1) : z0 / A;
      if (rho2 <= 0.05) return null;
      const rho = Math.sqrt(rho2), ans = ask === "radio" ? rho : Math.PI * rho2;
      const fr = (v, d) => (d === 1 ? v : `\\frac{${v}}{${d}}`);
      const curve = { ell: `${fr("y^2", a * a)} + ${fr("z^2", c * c)} = 1`, hyp1: `${fr("y^2", a * a)} - ${fr("z^2", c * c)} = 1`, hyp2: `${fr("z^2", c * c)} - ${fr("y^2", a * a)} = 1`, par: `z = ${cf(A)}y^2` }[kind];
      const surf = { ell: `${fr("x^2 + y^2", a * a)} + ${fr("z^2", c * c)} = 1`, hyp1: `${fr("x^2 + y^2", a * a)} - ${fr("z^2", c * c)} = 1`, hyp2: `${fr("z^2", c * c)} - ${fr("x^2 + y^2", a * a)} = 1`, par: `z = ${cf(A)}(x^2 + y^2)` }[kind];
      const name = { ell: "un elipsoide de revolución", hyp1: "un hiperboloide de una hoja de revolución", hyp2: "un hiperboloide de dos hojas de revolución", par: "un paraboloide de revolución" }[kind];
      return {
        prompt: `La curva $${curve}$, $x = 0$, gira alrededor del eje $z$. Calculá ${ask === "radio" ? "el radio de" : "el área del círculo que encierra"} la circunferencia que se obtiene al cortar la superficie con el plano $z = ${z0}$.`,
        answer: ans,
        solution: [`Se conserva $z$ y se reemplaza $y^2$ por $x^2 + y^2$ ([[ga-sup-revolucion|superficie de revolución]]): $${surf}$, ${name}.`,
          `Con $z = ${z0}$ queda $x^2 + y^2 = ${nd(rho2)}$: una circunferencia (un paralelo) de radio $\\sqrt{${nd(rho2)}} \\approx ${nd(rho)}$${ask === "area" ? `, que encierra un área $\\pi\\cdot${nd(rho2)} \\approx ${nd(ans)}$` : ""}.`],
        // verificación: el punto de la curva generatriz a la altura z₀ (por bisección en y > 0) está a distancia ρ del eje,
        // y al girarlo en varios ángulos sigue cumpliendo la ecuación de la superficie
        verify: { kind: "value", tol: 1e-7, fn: () => {
          const g = y => f(y, z0); let lo = 0, hi = 1;
          while (Math.sign(g(hi)) === Math.sign(g(lo))) hi *= 2;
          for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (Math.sign(g(m)) === Math.sign(g(lo))) lo = m; else hi = m; }
          const y = (lo + hi) / 2, S = (X, Y, Z) => f(Math.hypot(X, Y), Z);
          const okRot = [0.4, 1.7, 3.9].every(t => Math.abs(S(y * Math.cos(t), y * Math.sin(t), z0)) < 1e-9);
          return okRot ? (ask === "radio" ? y : Math.PI * y * y) : NaN;
        } }
      };
    }
  };

  // cuádricas canónicas y sus paramétricas (para identificar una superficie a partir de su parametrización)
  const PARAM_SUP = [
    { name: "Elipsoide", par: (a, b, c) => `(${cf(a)}\\sin\\varphi\\cos\\theta,\\ ${cf(b)}\\sin\\varphi\\sin\\theta,\\ ${cf(c)}\\cos\\varphi)`, pts: (a, b, c, u, v) => [a * Math.sin(u) * Math.cos(v), b * Math.sin(u) * Math.sin(v), c * Math.cos(u)], vars: "\\varphi, \\theta", eq: (x, y, z) => x * x + y * y + z * z - 1 },
    { name: "Hiperboloide de una hoja", par: (a, b, c) => `(${cf(a)}\\cosh u\\cos\\theta,\\ ${cf(b)}\\cosh u\\sin\\theta,\\ ${cf(c)}\\sinh u)`, pts: (a, b, c, u, v) => [a * Math.cosh(u) * Math.cos(v), b * Math.cosh(u) * Math.sin(v), c * Math.sinh(u)], vars: "u, \\theta", eq: (x, y, z) => x * x + y * y - z * z - 1 },
    { name: "Hiperboloide de dos hojas", par: (a, b, c) => `(${cf(a)}\\sinh u\\cos\\theta,\\ ${cf(b)}\\sinh u\\sin\\theta,\\ ${cf(c)}\\cosh u)`, pts: (a, b, c, u, v) => [a * Math.sinh(u) * Math.cos(v), b * Math.sinh(u) * Math.sin(v), c * Math.cosh(u)], vars: "u, \\theta", eq: (x, y, z) => z * z - x * x - y * y - 1 },
    { name: "Paraboloide elíptico", par: (a, b, c) => `(${cf(a)}u\\cos\\theta,\\ ${cf(b)}u\\sin\\theta,\\ ${cf(c)}u^2)`, pts: (a, b, c, u, v) => [a * u * Math.cos(v), b * u * Math.sin(v), c * u * u], vars: "u, \\theta", eq: (x, y, z) => z - x * x - y * y },
    { name: "Paraboloide hiperbólico", par: (a, b, c) => `(${cf(a)}u,\\ ${cf(b)}v,\\ ${cf(c)}(u^2 - v^2))`, pts: (a, b, c, u, v) => [a * u, b * v, c * (u * u - v * v)], vars: "u, v", eq: (x, y, z) => z - x * x + y * y },
    { name: "Cono elíptico", par: (a, b, c) => `(${cf(a)}u\\cos\\theta,\\ ${cf(b)}u\\sin\\theta,\\ ${cf(c)}u)`, pts: (a, b, c, u, v) => [a * u * Math.cos(v), b * u * Math.sin(v), c * u], vars: "u, \\theta", eq: (x, y, z) => x * x + y * y - z * z },
    { name: "Cilindro elíptico", par: (a, b, c) => `(${cf(a)}\\cos\\theta,\\ ${cf(b)}\\sin\\theta,\\ ${cf(c)}u)`, pts: (a, b, c, u, v) => [a * Math.cos(v), b * Math.sin(v), c * u], vars: "u, \\theta", eq: (x, y) => x * x + y * y - 1 }
  ];
  const PARAM_WHY = {
    "Elipsoide": R`$\frac{x^2}{a^2} + \frac{y^2}{b^2} = \sin^2\varphi$ y $\frac{z^2}{c^2} = \cos^2\varphi$: la suma da $1$.`,
    "Hiperboloide de una hoja": R`$\frac{x^2}{a^2} + \frac{y^2}{b^2} = \cosh^2 u$ y $\frac{z^2}{c^2} = \sinh^2 u$: como $\cosh^2 u - \sinh^2 u = 1$, queda $\frac{x^2}{a^2} + \frac{y^2}{b^2} - \frac{z^2}{c^2} = 1$.`,
    "Hiperboloide de dos hojas": R`$\frac{x^2}{a^2} + \frac{y^2}{b^2} = \sinh^2 u$ y $\frac{z^2}{c^2} = \cosh^2 u$: queda $\frac{z^2}{c^2} - \frac{x^2}{a^2} - \frac{y^2}{b^2} = 1$.`,
    "Paraboloide elíptico": R`$\frac{x^2}{a^2} + \frac{y^2}{b^2} = u^2$ y $\frac zc = u^2$: queda $\frac zc = \frac{x^2}{a^2} + \frac{y^2}{b^2}$.`,
    "Paraboloide hiperbólico": R`$\frac xa = u$, $\frac yb = v$ y $\frac zc = u^2 - v^2$: queda $\frac zc = \frac{x^2}{a^2} - \frac{y^2}{b^2}$, una silla de montar.`,
    "Cono elíptico": R`$\frac{x^2}{a^2} + \frac{y^2}{b^2} = u^2 = \frac{z^2}{c^2}$: la ecuación es homogénea, un cono con vértice en el origen.`,
    "Cilindro elíptico": R`$\frac{x^2}{a^2} + \frac{y^2}{b^2} = 1$ y $z$ es libre: falta una variable, así que es un cilindro paralelo al eje $z$.`
  };
  T["ga-param-sup-mc"] = {
    type: "mc", concepts: ["ga-cuadricas-tipos"], difficulty: 2,
    generate(r) {
      const i = r.int(0, PARAM_SUP.length - 1), Q = PARAM_SUP[i], a = r.int(1, 5), b = r.int(1, 5), c = r.int(1, 5);
      const others = r.sample(PARAM_SUP.filter((_, j) => j !== i).map(o => o.name), 3);
      return {
        prompt: `¿Qué superficie describe $X(${Q.vars}) = ${Q.par(a, b, c)}$?`,
        ...H.mc(r, Q.name, others, { text: true }),
        solution: [`Se eliminan los parámetros dividiendo cada coordenada por su coeficiente y usando una identidad ([[ga-cuadricas-tipos|cuádricas]]): ${PARAM_WHY[Q.name]}`, `Con $a = ${a}$, $b = ${b}$ y $c = ${c}$, es un ${Q.name.toLowerCase()}.`],
        // verificación: puntos de la parametrización cumplen la ecuación canónica (escalada) de la correcta y no la de las otras
        verify: { kind: "truth", target: true, fn: () => {
          const P = [[0.3, 0.7], [0.9, 2.1], [1.4, 4.0], [0.6, 5.3], [1.1, 1.2]].map(([u, v]) => Q.pts(a, b, c, u, v)), fits = q => P.every(([x, y, z]) => Math.abs(q.eq(x / a, y / b, z / c)) < 1e-9);
          return fits(Q) && PARAM_SUP.filter(o => o !== Q).every(o => !fits(o));
        } }
      };
    }
  };

  const cards = {
    "ga-esfera": {
      group: "ga-superficies-u", title: "Superficie esférica",
      aliases: ["superficie esférica", "ecuación de la esfera", "plano tangente a la esfera"], concepts: ["ga-esfera"],
      summary: "Puntos a distancia R de un centro: (x − a)² + (y − b)² + (z − c)² = R². El plano tangente es perpendicular al radio.",
      def: [R`La **superficie esférica** de centro $C = (a, b, c)$ y radio $R > 0$ es el conjunto de puntos $P$ con $|\vec{CP}| = R$: $$(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2.$$`,
        R`**Forma general:** $x^2 + y^2 + z^2 + Dx + Ey + Fz + G = 0$, con centro $\left(-\frac D2, -\frac E2, -\frac F2\right)$ y $R^2 = \frac{D^2 + E^2 + F^2}{4} - G$ (si es positivo).`,
        R`**Plano tangente** en $P_0$: el plano por $P_0$ perpendicular al radio, $\vec{CP_0}\cdot(X - P_0) = 0$.`,
        R`**Plano y esfera:** si $\delta$ es la distancia del centro al plano, el plano es secante si $\delta < R$ (la corta en una circunferencia de radio $\sqrt{R^2 - \delta^2}$), tangente si $\delta = R$ y exterior si $\delta > R$.`],
      idea: [R`Es la [[ga-circunferencia|circunferencia]] con una dimensión más: la misma fórmula de distancia con tres coordenadas, y el mismo truco de completar cuadrados para leer centro y radio.`,
        R`Las secciones planas de una esfera son siempre circunferencias: el círculo más grande (círculo máximo) lo da un plano que pasa por el centro.`],
      demo: [R`**Paso 1 (ecuación).** Por la [[al-euclideo|distancia euclídea]], $|\vec{CP}| = \sqrt{(x - a)^2 + (y - b)^2 + (z - c)^2}$. Pedir que valga $R$ es lo mismo que pedir que su cuadrado valga $R^2$, porque los dos son positivos.`,
        R`**Paso 2 (forma general).** Completamos cuadrados en cada variable: $x^2 + Dx = \left(x + \frac D2\right)^2 - \frac{D^2}{4}$, y lo mismo con $y$ y $z$. Pasando las constantes al otro lado se obtiene el centro y el $R^2$ del recuadro.`,
        R`**Paso 3 (plano tangente).** La esfera es la superficie de nivel $G(x, y, z) = 0$ de $G = (x - a)^2 + (y - b)^2 + (z - c)^2 - R^2$. Su [[c2-gradiente|gradiente]] es $\nabla G = 2(x - a,\ y - b,\ z - c) = 2\,\vec{CP}$, que es normal a la superficie. Por eso el plano tangente en $P_0$ tiene normal $\vec{CP_0}$.`,
        R`**Paso 4 (sección plana).** Sea $H$ el pie de la perpendicular desde $C$ al plano, con $|CH| = \delta$. Para un punto $P$ del plano, el triángulo $CHP$ es rectángulo en $H$, así que por Pitágoras $|CP|^2 = \delta^2 + |HP|^2$.`,
        R`**Paso 5.** $P$ está en la esfera si y solo si $|CP|^2 = R^2$, o sea $|HP|^2 = R^2 - \delta^2$. Si $\delta < R$, son los puntos del plano a distancia $\sqrt{R^2 - \delta^2}$ de $H$: una circunferencia. Si $\delta = R$, solo $H$; si $\delta > R$, ninguno. $\blacksquare$`],
      examples: [{ q: R`Centro, radio y plano tangente en $(3, 2, 2)$ de $x^2 + y^2 + z^2 - 2x - 4z - 4 = 0$.`, steps: [R`$(x - 1)^2 + y^2 + (z - 2)^2 = 9$: centro $(1, 0, 2)$, radio $3$.`, R`$\vec{CP_0} = (2, 2, 0)$: el plano es $2(x - 3) + 2(y - 2) = 0$, o sea $x + y = 5$.`] }],
      tips: [R`Si al completar cuadrados el lado derecho da negativo, no hay superficie: revisá las cuentas antes de sacar la raíz.`],
      see: ["ga-circunferencia", "ga-cuadricas-tipos", "c2-rectas-planos"]
    },
    "ga-sup-cilindrica": {
      group: "ga-superficies-u", title: "Superficies cilíndricas",
      aliases: ["superficie cilíndrica", "superficies cilíndricas", "generatriz", "generatrices"], concepts: ["ga-sup-cilindrica"],
      summary: "Las genera una recta que se mueve paralela a una dirección fija apoyándose en una curva (la directriz). Si falta una variable en la ecuación, es un cilindro paralelo a ese eje.",
      def: [R`Dadas una curva $C$ (**directriz**) y una dirección $\vec v$, la **superficie cilíndrica** es la unión de todas las rectas paralelas a $\vec v$ (**generatrices**) que pasan por los puntos de $C$.`,
        R`Si la directriz es $f(x, y) = 0$, $z = 0$ y $\vec v = (l, m, n)$ con $n \neq 0$, la superficie es $$f\!\left(x - \frac lnz,\ y - \frac mnz\right) = 0.$$`,
        R`**Caso particular:** una ecuación en la que falta una variable, como $f(x, y) = 0$ en el espacio, es la superficie cilíndrica de directriz $f(x, y) = 0$, $z = 0$ y generatrices paralelas al eje $z$.`],
      idea: [R`Pensá en un sello que se arrastra: la curva del plano se «estira» a lo largo de la dirección $\vec v$. Por eso $x^2 + y^2 = 4$ en el espacio no es una circunferencia sino un tubo, e $y = x^2$ es una canaleta.`,
        R`La palabra «cilindro» acá es general: la directriz puede ser cualquier curva, no solo una circunferencia.`],
      demo: [R`**Paso 1.** $P = (x, y, z)$ está en la superficie si la generatriz que pasa por $P$ corta a la directriz. Esa generatriz es $P - t\vec v$, con $t \in \mathbb R$.`,
        R`**Paso 2.** La directriz está en el plano $z = 0$, así que buscamos el $t$ que anula la tercera coordenada: $z - tn = 0$, o sea $t = \frac zn$ (por eso hace falta $n \neq 0$: la dirección no puede ser paralela al plano de la directriz).`,
        R`**Paso 3.** Con ese $t$, el punto de corte es $Q = \left(x - \frac lnz,\ y - \frac mnz,\ 0\right)$. $P$ está en la superficie exactamente cuando $Q$ está en la directriz, es decir, cuando $f\!\left(x - \frac lnz,\ y - \frac mnz\right) = 0$.`,
        R`**Paso 4 (caso particular).** Con $\vec v = (0, 0, 1)$ es $l = m = 0$ y queda $f(x, y) = 0$: la ecuación no depende de $z$. $\blacksquare$`],
      examples: [{ q: R`Superficie cilíndrica de directriz $x^2 + y^2 = 1$, $z = 0$, y generatrices paralelas a $(1, 0, 1)$.`, steps: [R`$l = 1$, $m = 0$, $n = 1$: se reemplaza $x$ por $x - z$.`, R`$(x - z)^2 + y^2 = 1$, un cilindro oblicuo.`] }],
      tips: [R`En el plano, $x^2 + y^2 = 4$ es una circunferencia; en el espacio es un cilindro. Fijate siempre en qué espacio estás.`],
      see: ["ga-sup-conica", "ga-sup-reglada", "c2-cuadricas"]
    },
    "ga-sup-conica": {
      group: "ga-superficies-u", title: "Superficies cónicas",
      aliases: ["superficie cónica", "superficies cónicas", "vértice de la superficie cónica"], concepts: ["ga-sup-conica"],
      summary: "Unión de las rectas que pasan por un punto fijo V (el vértice) y por los puntos de una curva directriz. Con vértice en el origen, la ecuación es homogénea.",
      def: [R`Dados un punto $V$ (**vértice**) y una curva $C$ (**directriz**) que no lo contiene, la **superficie cónica** es la unión de las rectas $VQ$ con $Q \in C$ (sus **generatrices**).`,
        R`Si la directriz es $f(x, y) = 0$, $z = 0$ y $V = (x_0, y_0, z_0)$ con $z_0 \neq 0$, un punto $P = (x, y, z)$ con $z \ne z_0$ está en la superficie si $$f\!\left(x_0 + \lambda(x - x_0),\ y_0 + \lambda(y - y_0)\right) = 0, \qquad \lambda = \frac{z_0}{z_0 - z}.$$`,
        R`Con el vértice en el origen, la ecuación que se obtiene es **homogénea**: todos sus términos tienen el mismo grado, como en $x^2 + y^2 = z^2$.`],
      idea: [R`Es como una linterna: desde el vértice salen rayos que pasan por la directriz. Los cortes con planos paralelos al de la directriz son copias de la directriz, agrandadas o achicadas desde el vértice.`,
        R`La homogeneidad dice lo mismo en lenguaje algebraico: si $P$ está en el cono, $tP$ también, para todo $t$. La superficie está hecha de rectas por el origen.`],
      demo: [R`**Paso 1.** $P$ está en la superficie si la recta $VP$ corta a la directriz. Los puntos de esa recta son $V + \lambda(P - V)$.`,
        R`**Paso 2.** Buscamos el punto de la recta en el plano $z = 0$: la tercera coordenada es $z_0 + \lambda(z - z_0) = 0$, de donde $\lambda = \frac{z_0}{z_0 - z}$ (si $z = z_0$, la recta es paralela al plano y no lo corta).`,
        R`**Paso 3.** Las otras dos coordenadas de ese punto son $x_0 + \lambda(x - x_0)$ e $y_0 + \lambda(y - y_0)$, y tienen que cumplir la ecuación de la directriz: es la fórmula del recuadro.`,
        R`**Paso 4 (secciones paralelas).** Al revés, el punto de la generatriz $VQ$ a la altura $z = h$ es $V + \mu(Q - V)$ con $\mu = \frac{z_0 - h}{z_0}$, el mismo para todo $Q$. Entonces la sección es la directriz transformada por la homotecia de centro $V$ y razón $\mu$: las longitudes se multiplican por $|\mu|$ y las áreas por $\mu^2$. $\blacksquare$`],
      examples: [{ q: R`Cono de vértice $(0, 0, 2)$ y directriz $x^2 + y^2 = 1$, $z = 0$.`, steps: [R`$\lambda = \frac{2}{2 - z}$: $\frac{4x^2}{(2 - z)^2} + \frac{4y^2}{(2 - z)^2} = 1$.`, R`$4x^2 + 4y^2 = (2 - z)^2$: un cono circular con vértice en $(0, 0, 2)$.`] }],
      tips: [R`Para reconocer un cono con vértice en el origen, fijate si la ecuación es homogénea: $x^2 + y^2 - z^2 = 0$ lo es, $x^2 + y^2 - z^2 = 1$ no.`],
      see: ["ga-sup-cilindrica", "ga-cuadricas-tipos", "ga-conica-def"]
    },
    "ga-sup-revolucion": {
      group: "ga-superficies-u", title: "Superficies de revolución",
      aliases: ["superficie de revolución", "superficies de revolución", "eje de revolución", "paralelos y meridianos"], concepts: ["ga-sup-revolucion"],
      summary: "La genera una curva que gira alrededor de un eje. Si la curva f(y, z) = 0 gira alrededor del eje z, la superficie es f(±√(x² + y²), z) = 0.",
      def: [R`Al girar una curva $C$ (la **generatriz** o meridiano) alrededor de una recta (el **eje de revolución**), cada punto de $C$ describe una circunferencia perpendicular al eje con centro en él (un **paralelo**). La unión de esos paralelos es la **superficie de revolución**.`,
        R`**Regla:** si la curva está en el plano $yz$, $f(y, z) = 0$, y gira alrededor del eje $z$, la superficie es $$f\!\left(\pm\sqrt{x^2 + y^2},\ z\right) = 0.$$ En general, se conserva la variable del eje y la otra se reemplaza por la distancia al eje.`],
      idea: [R`Un torno: la pieza gira y la cuchilla dibuja el perfil. Cortando la superficie con planos perpendiculares al eje se ven circunferencias, y con planos que contienen al eje se ve el perfil (los meridianos).`,
        R`Así salen muchas cuádricas: la parábola $z = y^2$ girando alrededor del eje $z$ da el paraboloide $z = x^2 + y^2$; la recta $z = y$, el cono $z^2 = x^2 + y^2$.`],
      demo: [R`**Paso 1.** Sea $P = (x, y, z)$ un punto de la superficie. Por definición, $P$ está en el paralelo de algún punto $P_0 = (0, y_0, z_0)$ de la curva.`,
        R`**Paso 2.** El paralelo está en el plano perpendicular al eje $z$ que pasa por $P_0$, así que todos sus puntos tienen la misma altura: $z = z_0$.`,
        R`**Paso 3.** El paralelo es una circunferencia con centro en el eje, $(0, 0, z_0)$, y radio igual a la distancia de $P_0$ al eje, $|y_0|$. Como $P$ está en ella, su distancia al eje es la misma: $\sqrt{x^2 + y^2} = |y_0|$, o sea $y_0 = \pm\sqrt{x^2 + y^2}$.`,
        R`**Paso 4.** $P_0$ cumple la ecuación de la curva, $f(y_0, z_0) = 0$. Reemplazando lo obtenido en los pasos 2 y 3: $f\!\left(\pm\sqrt{x^2 + y^2},\ z\right) = 0$. Y al revés, todo punto que cumple esto está en el paralelo de un punto de la curva. $\blacksquare$`],
      examples: [{ q: R`Hacé girar la elipse $\frac{y^2}{4} + z^2 = 1$, $x = 0$, alrededor del eje $z$.`, steps: [R`Se conserva $z$ y se reemplaza $y^2$ por $x^2 + y^2$.`, R`$\frac{x^2 + y^2}{4} + z^2 = 1$: un elipsoide de revolución (achatado).`] }],
      tips: [R`La variable que **se conserva** es la del eje. Si te equivocás de eje, sale otra superficie.`, R`Una superficie de revolución alrededor del eje $z$ tiene $x$ e $y$ solo en la combinación $x^2 + y^2$.`],
      see: ["ga-cuadricas-tipos", "volumen-revolucion", "c2-cuadricas"]
    },
    "ga-sup-reglada": {
      group: "ga-superficies-u", title: "Superficies regladas",
      aliases: ["superficie reglada", "superficies regladas", "doblemente reglada"], concepts: ["ga-sup-reglada"],
      summary: "Por cada punto pasa una recta contenida en la superficie. Planos, cilindros y conos lo son; entre las cuádricas, también el hiperboloide de una hoja y el paraboloide hiperbólico.",
      def: [R`Una superficie es **reglada** si por cada uno de sus puntos pasa al menos una recta contenida en ella. Es **doblemente reglada** si pasan dos rectas distintas.`,
        R`Son regladas: los planos, las [[ga-sup-cilindrica|superficies cilíndricas]] y las [[ga-sup-conica|superficies cónicas]]. Entre las cuádricas con puntos reales, además, el **hiperboloide de una hoja** y el **paraboloide hiperbólico**, que son doblemente regladas.`],
      idea: [R`Es sorprendente que una superficie curva esté hecha de rectas, pero se ve en la práctica: las torres de enfriamiento y muchas estructuras de hormigón son hiperboloides de una hoja armados con vigas rectas.`,
        R`La clave algebraica es factorizar: si la ecuación se puede escribir como $AB = CD$, las rectas $A = \lambda C$, $\lambda B = D$ están contenidas en la superficie.`],
      demo: [R`**Paso 1 (hiperboloide).** Pasamos un término al otro lado y factorizamos como diferencia de cuadrados: $\frac{x^2}{a^2} - \frac{z^2}{c^2} = 1 - \frac{y^2}{b^2}$ se escribe $$\left(\frac xa - \frac zc\right)\left(\frac xa + \frac zc\right) = \left(1 - \frac yb\right)\left(1 + \frac yb\right).$$`,
        R`**Paso 2.** Para cada $\lambda$ consideramos la recta, intersección de dos planos, $\frac xa - \frac zc = \lambda\left(1 - \frac yb\right)$ y $\lambda\left(\frac xa + \frac zc\right) = 1 + \frac yb$. Multiplicando miembro a miembro las dos ecuaciones y simplificando $\lambda$ (si $\lambda \neq 0$) se obtiene la ecuación factorizada del Paso 1: todo punto de la recta está en la superficie.`,
        R`**Paso 3.** Intercambiando el papel de los factores de la derecha ($\frac xa - \frac zc = \mu\left(1 + \frac yb\right)$ y $\mu\left(\frac xa + \frac zc\right) = 1 - \frac yb$) sale una segunda familia de rectas. Por eso el hiperboloide es doblemente reglado.`,
        R`**Paso 4 (paraboloide hiperbólico).** $z = \frac{x^2}{a^2} - \frac{y^2}{b^2} = \left(\frac xa - \frac yb\right)\left(\frac xa + \frac yb\right)$. Las rectas $\frac xa - \frac yb = \lambda$, $z = \lambda\left(\frac xa + \frac yb\right)$ están en la superficie, porque al reemplazar la primera en la factorización se obtiene la segunda; y lo mismo con los factores intercambiados. $\blacksquare$`],
      examples: [{ q: R`¿Está la recta $(1, 0, 0) + t(0, 1, 1)$ en $x^2 + y^2 - z^2 = 1$?`, steps: [R`Reemplazamos: $1 + t^2 - t^2 = 1$.`, R`Se cumple para todo $t$: sí, está contenida.`] }],
      tips: [R`El elipsoide, el hiperboloide de dos hojas y el paraboloide elíptico **no** son reglados: no contienen ninguna recta.`, R`Para chequear que una recta está en una superficie, reemplazá su paramétrica y fijate que quede una identidad en $t$.`],
      see: ["ga-cuadricas-tipos", "ga-sup-cilindrica", "ga-sup-conica"]
    },
    "ga-cuadricas-tipos": {
      group: "ga-superficies-u", title: "Cuádricas con y sin centro",
      aliases: ["cuádricas con centro", "cuádricas sin centro", "hiperboloide de una hoja", "hiperboloide de dos hojas", "paraboloide elíptico"], concepts: ["ga-cuadricas-tipos"],
      summary: "Con centro: elipsoide, hiperboloides de una y dos hojas, cono. Sin centro: paraboloides elíptico e hiperbólico. Se reconocen por los signos y por la variable lineal.",
      def: [R`**Con centro** (simétricas respecto de un punto), en forma canónica: **elipsoide** $\frac{x^2}{a^2} + \frac{y^2}{b^2} + \frac{z^2}{c^2} = 1$; **hiperboloide de una hoja** $\frac{x^2}{a^2} + \frac{y^2}{b^2} - \frac{z^2}{c^2} = 1$; **hiperboloide de dos hojas** $-\frac{x^2}{a^2} - \frac{y^2}{b^2} + \frac{z^2}{c^2} = 1$; **cono** $\frac{x^2}{a^2} + \frac{y^2}{b^2} - \frac{z^2}{c^2} = 0$.`,
        R`**Sin centro:** **paraboloide elíptico** $z = \frac{x^2}{a^2} + \frac{y^2}{b^2}$ y **paraboloide hiperbólico** $z = \frac{x^2}{a^2} - \frac{y^2}{b^2}$.`,
        R`**Paramétricas:** elipsoide $(a\sin\varphi\cos\theta,\ b\sin\varphi\sin\theta,\ c\cos\varphi)$; hiperboloide de una hoja $(a\cosh u\cos\theta,\ b\cosh u\sin\theta,\ c\sinh u)$; de dos hojas $(a\sinh u\cos\theta,\ b\sinh u\sin\theta,\ \pm c\cosh u)$; paraboloide elíptico $(au\cos\theta,\ bu\sin\theta,\ u^2)$; hiperbólico $\left(u,\ v,\ \frac{u^2}{a^2} - \frac{v^2}{b^2}\right)$.`],
      idea: [R`Para reconocerlas se miran las **trazas** (cortes con planos paralelos a los coordenados): el hiperboloide de una hoja tiene trazas $z = k$ que son elipses para todo $k$ (es un tubo), y el de dos hojas solo tiene trazas si $|z| \ge c$ (son dos copas separadas). Más ejemplos en [[c2-cuadricas]].`,
        R`Regla rápida con todo igualado a $1$: contá los signos menos. Ninguno, elipsoide; uno, una hoja; dos, dos hojas. El eje de los hiperboloides es el de la variable con el signo distinto.`],
      demo: [R`**Paso 1 (centro).** En las cinco ecuaciones con centro, las variables aparecen solo al cuadrado. Si $(x, y, z)$ cumple la ecuación, también la cumple $(-x, -y, -z)$, porque $(-x)^2 = x^2$: la superficie es simétrica respecto del origen. En los paraboloides, $z$ aparece lineal y $(-x, -y, -z)$ no cumple la ecuación (salvo si $z = 0$): no hay centro.`,
        R`**Paso 2 (paramétricas del elipsoide).** $\frac{x^2}{a^2} + \frac{y^2}{b^2} = \sin^2\varphi(\cos^2\theta + \sin^2\theta) = \sin^2\varphi$, y sumando $\frac{z^2}{c^2} = \cos^2\varphi$ da $1$ por la identidad pitagórica.`,
        R`**Paso 3 (hiperboloides).** En la de una hoja, $\frac{x^2}{a^2} + \frac{y^2}{b^2} = \cosh^2 u$ y $\cosh^2 u - \sinh^2 u = 1$. En la de dos hojas, $\frac{z^2}{c^2} - \frac{x^2}{a^2} - \frac{y^2}{b^2} = \cosh^2 u - \sinh^2 u = 1$.`,
        R`**Paso 4 (cuántas hojas).** En el de dos hojas, la traza $z = k$ es $\frac{x^2}{a^2} + \frac{y^2}{b^2} = \frac{k^2}{c^2} - 1$, que solo tiene puntos si $|k| \ge c$. Entre $z = -c$ y $z = c$ no hay nada, así que la superficie queda partida en dos. En el de una hoja la traza es $\frac{x^2}{a^2} + \frac{y^2}{b^2} = 1 + \frac{k^2}{c^2} > 0$: hay una elipse en cada altura y la superficie es de una sola pieza. $\blacksquare$`],
      examples: [{ q: R`Identificá $4x^2 - y^2 + 4z^2 = 4$.`, steps: [R`Dividimos por $4$: $x^2 - \frac{y^2}{4} + z^2 = 1$.`, R`Un solo signo menos, en $y$: hiperboloide de una hoja con eje $y$.`] }],
      tips: [R`Antes de contar signos, dejá la constante del lado derecho **positiva**. $x^2 + y^2 - z^2 = -1$ es de dos hojas, no de una.`, R`Si la ecuación tiene términos lineales, completá cuadrados y trasladá; si tiene productos cruzados, hay que rotar.`],
      see: ["c2-cuadricas", "ga-sup-reglada", "ga-sup-revolucion", "ga-esfera"]
    }
  };

  E.extendCourse("m106", {
    concepts: {
      "ga-esfera": { name: "Superficie esférica" }, "ga-sup-cilindrica": { name: "Superficies cilíndricas" }, "ga-sup-conica": { name: "Superficies cónicas" },
      "ga-sup-revolucion": { name: "Superficies de revolución" }, "ga-sup-reglada": { name: "Superficies regladas" }, "ga-cuadricas-tipos": { name: "Cuádricas" }
    },
    templates: T,
    units: [{
      id: "ga-superficies-u", order: 4, program: "Unidad 4", title: "Superficies", icon: "atom",
      diagnostic: ["ga-esfera-num", "ga-sup-conica-num", "ga-cuadrica-match"],
      lessons: [
        { id: "ga-superficies-l1", title: "Superficie esférica", templates: ["ga-esfera-num", "ga-esfera-tg-num", "ga-esfera-plano-num"], theory: ["ga-esfera"],
          intro: R`$(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2$; el plano tangente es perpendicular al radio.` },
        { id: "ga-superficies-l2", title: "Superficies cilíndricas y cónicas", templates: ["ga-sup-cil-tf", "ga-sup-conica-num", "ga-sup-cil-num"], theory: ["ga-sup-cilindrica", "ga-sup-conica"],
          intro: R`Rectas paralelas que se apoyan en una curva (cilindro) o rectas que pasan por un vértice (cono).` },
        { id: "ga-superficies-l3", title: "Superficies de revolución", templates: ["ga-revolucion-mc", "ga-revolucion-order", "ga-revolucion-num"], theory: ["ga-sup-revolucion"],
          intro: R`Una curva que gira: se conserva la variable del eje y la otra pasa a ser la distancia al eje.` },
        { id: "ga-superficies-l4", title: "Cuádricas y superficies regladas", templates: ["ga-cuadrica-match", "ga-reglada-tf", "ga-param-sup-mc"], theory: ["ga-cuadricas-tipos", "ga-sup-reglada"],
          intro: R`Elipsoide, hiperboloides, cono y paraboloides; algunas están hechas de rectas.` }
      ]
    }],
    cards
  });
})();

/* M106 · Geometría Analítica, unidades 5 y 6 (temporal, se une a m106-geometria-analitica.js) */

/* =====================================================================
 *  UNIDAD 5 · COORDENADAS POLARES, CILÍNDRICAS Y ESFÉRICAS
 *  Rectas y circunferencias en polares, cónicas con foco en el polo, gráficas polares
 *  (rosas, caracoles, lemniscatas, espirales) y superficies coordenadas en el espacio.
 *  Verificaciones: pasaje a cartesianas, circuncírculo de tres puntos, vértices y foco reales,
 *  conteo numérico de pétalos y de ceros, área por el zapatero, pertenencia de puntos reflejados
 *  y ecuaciones implícitas cartesianas evaluadas sobre los puntos dibujados.
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const T = {};
  const nd = (x, d = 4) => H.num(x, d).replace(".", "{,}");
  const cf = c => (c === 1 ? "" : c === -1 ? "-" : String(c));
  const DEG = Math.PI / 180;
  const TRIG = { cos: Math.cos, sin: Math.sin };
  // ángulos "lindos" en grados y su escritura en radianes
  const ANG = [[0, "0"], [30, "\\frac{\\pi}{6}"], [45, "\\frac{\\pi}{4}"], [60, "\\frac{\\pi}{3}"], [90, "\\frac{\\pi}{2}"], [120, "\\frac{2\\pi}{3}"],
    [135, "\\frac{3\\pi}{4}"], [150, "\\frac{5\\pi}{6}"], [180, "\\pi"], [210, "\\frac{7\\pi}{6}"], [240, "\\frac{4\\pi}{3}"], [270, "\\frac{3\\pi}{2}"],
    [300, "\\frac{5\\pi}{3}"], [315, "\\frac{7\\pi}{4}"], [330, "\\frac{11\\pi}{6}"]];

  // ---------- gráficos de curvas polares ----------
  // El graficador solo dibuja funciones y = f(x): la curva se corta en tramos donde x es monótona
  // (o donde deja de estar definida) y cada tramo se interpola linealmente entre los puntos muestreados.
  function interp(xs, ys, x) {
    const n = xs.length;
    if (!(x >= xs[0] && x <= xs[n - 1])) return NaN;
    let lo = 0, hi = n - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (xs[m] <= x) lo = m; else hi = m; }
    const dx = xs[hi] - xs[lo];
    return dx > 0 ? ys[lo] + (ys[hi] - ys[lo]) * (x - xs[lo]) / dx : ys[lo];
  }
  function curvePieces(X, Y, t0, t1, N = 900) {
    const pieces = [];
    let run = [], dir = 0, prev = null;
    const flush = () => {
      if (run.length < 2) return;
      const pts = run.slice().sort((p, q) => p[0] - q[0]);
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
      if (xs[xs.length - 1] - xs[0] > 1e-12) pieces.push({ from: xs[0], to: xs[xs.length - 1], nodes: pts, f: x => interp(xs, ys, x) });
    };
    for (let i = 0; i <= N; i++) {
      const t = t0 + (t1 - t0) * i / N, x = X(t), y = Y(t);
      if (!isFinite(x) || !isFinite(y)) { flush(); run = []; dir = 0; prev = null; continue; }
      if (prev) {
        const d = Math.sign(x - prev[0]);
        if (d !== 0 && dir !== 0 && d !== dir) { flush(); run = [prev]; }
        if (d !== 0) dir = d;
      }
      run.push([x, y]); prev = [x, y];
    }
    flush();
    return pieces;
  }
  const polarPieces = (f, t0, t1, N) => curvePieces(t => f(t) * Math.cos(t), t => f(t) * Math.sin(t), t0, t1, N);
  // ventana del gráfico: la caja de la curva con un margen
  function polarGraph(pieces) {
    const all = pieces.flatMap(p => p.nodes);
    const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const pad = 0.15 * Math.max(x1 - x0, y1 - y0, 1);
    return { pieces, xr: [x0 - pad, x1 + pad], yr: [y0 - pad, y1 + pad] };
  }

  /* ---------- Lección 1 · rectas, circunferencias y distancias en polares ---------- */
  T["ga-polar-num"] = {
    type: "numeric", concepts: ["ga-polares-rectas-circ"], difficulty: 2,
    generate(r) {
      if (r.bool()) {
        // distancia entre dos puntos dados en polares (teorema del coseno)
        const r1 = r.int(1, 8), r2 = r.int(1, 8);
        const [[a1, t1], [a2, t2]] = r.sample(ANG, 2);
        let dA = Math.abs(a2 - a1) % 360; if (dA > 180) dA = 360 - dA;
        const ans = Math.sqrt(r1 * r1 + r2 * r2 - 2 * r1 * r2 * Math.cos(dA * DEG));
        if (ans < 1e-9) return null;
        return {
          prompt: `Calculá la distancia entre los puntos de coordenadas polares $P_1 = \\left(${r1}, ${t1}\\right)$ y $P_2 = \\left(${r2}, ${t2}\\right)$.`,
          answer: ans,
          solution: [`[[ga-polares-rectas-circ|Distancia en polares]]: el triángulo $OP_1P_2$ tiene lados $r_1$ y $r_2$ que forman en el polo el ángulo $\\theta_2 - \\theta_1$; por el teorema del coseno, $d^2 = r_1^2 + r_2^2 - 2r_1r_2\\cos(\\theta_2 - \\theta_1)$.`,
            `El ángulo entre los dos radios es $${dA}^\\circ$ y $\\cos ${dA}^\\circ \\approx ${nd(Math.cos(dA * DEG))}$.`,
            `$d^2 = ${r1 * r1} + ${r2 * r2} - ${2 * r1 * r2}\\cos ${dA}^\\circ \\approx ${nd(ans * ans)}$, así que $d \\approx ${nd(ans)}$.`],
          // verificación: se pasan los dos puntos a cartesianas y se mide con Pitágoras
          verify: { kind: "value", tol: 1e-9, fn: () => Math.hypot(r1 * Math.cos(a1 * DEG) - r2 * Math.cos(a2 * DEG), r1 * Math.sin(a1 * DEG) - r2 * Math.sin(a2 * DEG)) }
        };
      }
      // circunferencia que pasa por el polo: r = A cos θ + B sen θ
      const A = r.int(-8, 8), B = r.int(-8, 8);
      if (A === 0 && B === 0) return null;
      const ask = r.pick(["R", "h", "k"]);
      if (ask === "h" && A === 0) return null;
      if (ask === "k" && B === 0) return null;
      const rad = Math.hypot(A, B) / 2, ans = ask === "R" ? rad : ask === "h" ? A / 2 : B / 2;
      const f = t => A * Math.cos(t) + B * Math.sin(t);
      const eq = `r = ${H.poly([[A, "\\cos\\theta"], [B, "\\sin\\theta"]])}`;
      return {
        prompt: `La curva $${eq}$ es una circunferencia. Calculá ${ask === "R" ? "su radio" : ask === "h" ? "la coordenada $x$ de su centro" : "la coordenada $y$ de su centro"}.`,
        answer: ans,
        solution: [`Multiplicamos por $r$ para armar $r^2$, $r\\cos\\theta$ y $r\\sin\\theta$ ([[ga-polares-rectas-circ|circunferencias en polares]]): $r^2 = ${H.poly([[A, "r\\cos\\theta"], [B, "r\\sin\\theta"]])}$, o sea $x^2 + y^2 = ${H.poly([[A, "x"], [B, "y"]])}$.`,
          `Completando cuadrados: $\\left(x ${A >= 0 ? "-" : "+"} ${H.frac(Math.abs(A), 2)}\\right)^2 + \\left(y ${B >= 0 ? "-" : "+"} ${H.frac(Math.abs(B), 2)}\\right)^2 = ${H.frac(A * A + B * B, 4)}$.`,
          `Centro $\\left(${H.frac(A, 2)}, ${H.frac(B, 2)}\\right)$ y radio $\\frac{\\sqrt{${A * A + B * B}}}{2} \\approx ${nd(rad)}$.`],
        // verificación: circunferencia circunscripta a tres puntos de la curva, calculados en cartesianas
        verify: { kind: "value", tol: 1e-7, fn: () => {
          const P = [0.3, 1.4, 2.5].map(t => [f(t) * Math.cos(t), f(t) * Math.sin(t)]);
          const [[ax, ay], [bx, by], [cx, cy]] = P, D = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
          const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / D;
          const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / D;
          return ask === "R" ? Math.hypot(ax - ux, ay - uy) : ask === "h" ? ux : uy;
        } }
      };
    }
  };
  T["ga-polar-recta-mc"] = {
    type: "mc", concepts: ["ga-polares-rectas-circ"], difficulty: 2,
    generate(r) {
      const v = r.pick(["recta", "recta", "vertical", "circ"]);
      let cart, F, opts; // opts: [tex, f(θ)], la primera es la correcta
      const trigSum = (a, b) => H.poly([[a, "\\cos\\theta"], [b, "\\sin\\theta"]]);
      if (v === "recta") {
        const a = r.nz(-5, 5), b = r.nz(-5, 5), c = r.nz(-9, 9);
        cart = `${H.poly([[a, "x"], [b, "y"]])} = ${c}`; F = (x, y) => (a * x + b * y - c) / Math.abs(c);
        const den = (p, q) => t => p * Math.cos(t) + q * Math.sin(t);
        opts = [[`r = \\dfrac{${c}}{${trigSum(a, b)}}`, t => c / den(a, b)(t)],
          [`r = \\dfrac{${c}}{${trigSum(b, a)}}`, t => c / den(b, a)(t)],
          [`r = ${c}\\left(${trigSum(a, b)}\\right)`, t => c * den(a, b)(t)],
          [`r = \\dfrac{${-c}}{${trigSum(a, b)}}`, t => -c / den(a, b)(t)],
          [`r = \\dfrac{${c}}{${trigSum(a, -b)}}`, t => c / den(a, -b)(t)]];
      } else if (v === "vertical") {
        const k = r.nz(-6, 6), xv = r.bool();
        cart = `${xv ? "x" : "y"} = ${k}`; F = (x, y) => ((xv ? x : y) - k) / Math.abs(k);
        const T1 = xv ? "\\cos" : "\\sin", T2 = xv ? "\\sin" : "\\cos", f1 = xv ? Math.cos : Math.sin, f2 = xv ? Math.sin : Math.cos;
        opts = [[`r = \\dfrac{${k}}{${T1}\\theta}`, t => k / f1(t)], [`r = \\dfrac{${k}}{${T2}\\theta}`, t => k / f2(t)],
          [`r = ${k}${T1}\\theta`, t => k * f1(t)], [`\\theta = ${k}`, null], [`r = \\dfrac{${-k}}{${T1}\\theta}`, t => -k / f1(t)]];
      } else {
        const a = r.int(-4, 4), b = r.int(-4, 4);
        if (a === 0 && b === 0) return null;
        cart = `${H.poly([[1, "x^{2}"], [1, "y^{2}"], [-2 * a, "x"], [-2 * b, "y"]])} = 0`;
        F = (x, y) => (x * x + y * y - 2 * a * x - 2 * b * y) / (a * a + b * b);
        const g = (p, q) => t => p * Math.cos(t) + q * Math.sin(t);
        opts = [[`r = ${trigSum(2 * a, 2 * b)}`, g(2 * a, 2 * b)], [`r = ${trigSum(a, b)}`, g(a, b)], [`r = ${trigSum(2 * b, 2 * a)}`, g(2 * b, 2 * a)],
          [`r = ${trigSum(-2 * a, -2 * b)}`, g(-2 * a, -2 * b)], [`r^2 = ${trigSum(2 * a, 2 * b)}`, null]];
      }
      const fOf = new Map(opts);
      const mc = H.mc(r, opts[0][0], r.shuffle(opts.slice(1)).map(o => o[0]));
      const shown = mc.options.map(o => o.replace(/^\$\\displaystyle /, "").replace(/\$$/, ""));
      return {
        prompt: `¿Cuál es la ecuación en polares de $${cart}$?`,
        ...mc,
        solution: [`Reemplazamos $x = r\\cos\\theta$ e $y = r\\sin\\theta$ ([[ga-polares-rectas-circ|rectas y circunferencias en polares]]).`,
          v === "circ" ? `Como $x^2 + y^2 = r^2$, queda $r^2 = r\\left(${opts[0][0].slice(4)}\\right)$; dividiendo por $r$ (el polo ya está en la curva) sale $${opts[0][0]}$.` : `Sacamos $r$ de factor común y despejamos: $${opts[0][0]}$ (para las direcciones paralelas a la recta el denominador se anula: por ahí no hay punto).`],
        // verificación: los puntos de la opción correcta cumplen la ecuación cartesiana; los de las otras, no
        verify: { kind: "truth", target: true, fn: () => {
          const fits = f => { if (!f) return false; for (let i = 0; i < 180; i++) { const t = 0.013 + i * Math.PI / 90, rr = f(t); if (!isFinite(rr) || Math.abs(rr) > 1e6) continue; if (Math.abs(F(rr * Math.cos(t), rr * Math.sin(t))) > 1e-9) return false; } return true; };
          return shown.every((o, i) => fits(fOf.get(o)) === (i === mc.correct));
        } }
      };
    }
  };

  /* ---------- Lección 2 · cónicas con un foco en el polo ---------- */
  // r = k / (m + s·n·trig θ): e = n/m, ed = k/m
  function conicaPolar(r) {
    const m = r.int(1, 5), n = r.int(1, 6), k = r.int(1, 12), s = r.pick([1, -1]), tr = r.pick(["cos", "sin"]);
    const f = t => k / (m + s * n * TRIG[tr](t));
    const tex = `r = \\dfrac{${k}}{${m} ${s > 0 ? "+" : "-"} ${n === 1 ? "" : n}\\${tr}\\theta}`;
    // dirección del eje focal hacia la directriz
    const phi = tr === "cos" ? (s > 0 ? 0 : Math.PI) : (s > 0 ? Math.PI / 2 : 3 * Math.PI / 2);
    return { m, n, k, s, tr, f, tex, phi, e: n / m, d: k / n };
  }
  const tipo = e => (e < 1 ? "elipse" : e === 1 ? "parábola" : "hipérbola");
  T["ga-conica-polar-num"] = {
    type: "numeric", concepts: ["ga-conica-polar"], difficulty: 2,
    generate(r) {
      const c = conicaPolar(r), ask = r.pick(["e", "d", "v"]);
      if (ask === "e" && c.n === c.m) return null;
      const { m, n, k, f, phi } = c;
      const ans = ask === "e" ? c.e : ask === "d" ? c.d : k / (m + n);
      const norm = `Dividimos numerador y denominador por $${m}$: $r = \\dfrac{${H.frac(k, m)}}{1 ${c.s > 0 ? "+" : "-"} ${H.frac(n, m) === "1" ? "" : H.frac(n, m)}\\${c.tr}\\theta}$, así que $e = ${H.frac(n, m)}$ (${tipo(n / m)}) y $ed = ${H.frac(k, m)}$.`;
      const P = t => { const rr = f(t); return [rr * Math.cos(t), rr * Math.sin(t)]; };
      let verify;
      if (ask === "e") {
        // los dos vértices sobre el eje focal dan el centro y a; c es la distancia del centro al foco (el polo)
        verify = { kind: "value", tol: 1e-9, fn: () => { const A = P(phi), B = P(phi + Math.PI), C = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]; return Math.hypot(...C) / (Math.hypot(A[0] - B[0], A[1] - B[1]) / 2); } };
      } else if (ask === "d") {
        // con la directriz correcta, el cociente distancia al foco / distancia a la directriz es el mismo en todos los puntos
        verify = { kind: "zero", tol: 1e-9, fn: d => {
          const u = [Math.cos(phi), Math.sin(phi)], ratio = t => { const Q = P(t); return Math.hypot(...Q) / Math.abs(d - (Q[0] * u[0] + Q[1] * u[1])); };
          return [ratio(phi + 0.3) - ratio(phi + 0.9), ratio(phi + 0.9) - ratio(phi - 1.3)];
        } };
      } else {
        // distancia mínima del polo a la curva, buscada numéricamente entre los puntos con r > 0
        verify = { kind: "value", tol: 1e-9, fn: () => {
          let best = Infinity, bt = 0;
          for (let i = 0; i < 3600; i++) { const t = i * Math.PI / 1800, rr = f(t); if (rr > 0 && rr < best) { best = rr; bt = t; } }
          let a = bt - 0.002, b = bt + 0.002;
          for (let j = 0; j < 100; j++) { const x1 = a + (b - a) * 0.382, x2 = a + (b - a) * 0.618; if (f(x1) < f(x2)) b = x2; else a = x1; }
          return f((a + b) / 2);
        } };
      }
      return {
        prompt: `La cónica $${c.tex}$ tiene un foco en el polo. Calculá ${ask === "e" ? "su excentricidad" : ask === "d" ? "la distancia del foco (el polo) a la directriz correspondiente" : "la distancia del foco (el polo) al vértice más cercano"}.`,
        answer: ans,
        solution: [`[[ga-conica-polar|Cónica en polares]]: la forma es $r = \\dfrac{ed}{1 \\pm e\\cos\\theta}$ (o con seno), con un $1$ en el denominador.`, norm,
          ask === "e" ? `Excentricidad $e = ${H.frac(n, m)} \\approx ${nd(c.e)}$.`
            : ask === "d" ? `$d = \\dfrac{ed}{e} = \\dfrac{${H.frac(k, m)}}{${H.frac(n, m)}} = ${H.frac(k, n)} \\approx ${nd(c.d)}$.`
            : `El vértice más cercano es donde el denominador es máximo, $${m} + ${n} = ${m + n}$: $r = ${H.frac(k, m + n)} \\approx ${nd(ans)}$.`],
        verify
      };
    }
  };
  const TIPOS = ["Elipse", "Parábola", "Hipérbola", "Circunferencia"];
  T["ga-conica-polar-mc"] = {
    type: "mc", concepts: ["ga-conica-polar"], difficulty: 1,
    generate(r) {
      const c = conicaPolar(r);
      if (r.int(0, 3) === 0) { c.n = c.m * r.int(1, 2); c.tex = c.tex.replace(/\{\d+ ([+-]) \d*\\/, `{${c.m} $1 ${c.n === 1 ? "" : c.n}\\`); }
      const { m, n, k, s, tr } = c, kind = n < m ? 0 : n === m ? 1 : 2;
      const shape = r.bool() ? c.tex : `${m === 1 ? "" : m}r ${s > 0 ? "+" : "-"} ${n === 1 ? "" : n}r\\${tr}\\theta = ${k}`;
      return {
        prompt: `¿Qué cónica es $${shape}$?`,
        ...H.mc(r, TIPOS[kind], TIPOS.filter((_, i) => i !== kind), { text: true }),
        solution: [shape === c.tex ? `Está en la forma $r = \\dfrac{k}{m \\pm n\\${tr}\\theta}$.` : `Despejando $r$: $r = \\dfrac{${k}}{${m} ${s > 0 ? "+" : "-"} ${n === 1 ? "" : n}\\${tr}\\theta}$.`,
          `Para leer la [[ga-conica-polar|excentricidad]] hay que dejar un $1$ en el denominador: $e = \\frac{${n}}{${m}}${n % m === 0 ? ` = ${n / m}` : ""}$, ${kind === 0 ? "menor que $1$: elipse" : kind === 1 ? "igual a $1$: parábola" : "mayor que $1$: hipérbola"}.`],
        // verificación: elipse si el denominador nunca se anula (curva acotada), parábola si se anula sin cambiar de signo, hipérbola si cambia de signo
        verify: { kind: "truth", target: true, fn: () => {
          let lo = Infinity;
          for (let i = 0; i < 720; i++) lo = Math.min(lo, m + s * n * TRIG[tr](i * Math.PI / 360));
          const got = lo > 1e-9 ? 0 : lo > -1e-9 ? 1 : 2;
          return got === kind;
        } }
      };
    }
  };

  /* ---------- Lección 3 · gráficas polares ---------- */
  T["ga-curva-polar-num"] = {
    type: "numeric", concepts: ["ga-curvas-polares"], difficulty: 2,
    generate(r) {
      const v = r.pick(["rosa", "rosa", "lemniscata", "caracol"]);
      if (v === "rosa") {
        const a = r.int(1, 5), n = r.int(2, 7), tr = r.pick(["cos", "sin"]), ans = n % 2 ? n : 2 * n;
        return {
          prompt: `¿Cuántos pétalos tiene la rosa $r = ${a === 1 ? "" : a}\\${tr}(${n}\\theta)$?`,
          answer: ans,
          solution: [`En $[0, 2\\pi)$, $\\${tr}(${n}\\theta)$ se anula $${2 * n}$ veces y entre dos ceros dibuja un pétalo ([[ga-curvas-polares|rosas]]).`,
            n % 2 ? `Como $${n}$ es impar, $r(\\theta + \\pi) = -r(\\theta)$: la segunda mitad repite los mismos pétalos. Quedan $${n}$.` : `Como $${n}$ es par, los $${2 * n}$ arcos caen en direcciones distintas: $${2 * n}$ pétalos.`],
          // verificación: se buscan las puntas (máximos de |r|) y se cuentan los puntos distintos del plano
          verify: { kind: "value", tol: 1e-12, fn: () => {
            const N = 360 * n, f = t => a * TRIG[tr](n * t), tips = [];
            for (let i = 0; i < N; i++) {
              const t = 2 * Math.PI * i / N, y = Math.abs(f(t)), y0 = Math.abs(f(t - 2 * Math.PI / N)), y1 = Math.abs(f(t + 2 * Math.PI / N));
              if (y > y0 && y >= y1) { const P = [f(t) * Math.cos(t), f(t) * Math.sin(t)]; if (!tips.some(q => Math.hypot(q[0] - P[0], q[1] - P[1]) < 1e-6 * a)) tips.push(P); }
            }
            return tips.length;
          } }
        };
      }
      if (v === "lemniscata") {
        const a = r.int(1, 6), tr = r.pick(["cos", "sin"]);
        return {
          prompt: `Calculá el área total encerrada por la lemniscata $r^2 = ${a * a === 1 ? "" : a * a}\\${tr}(2\\theta)$ (los dos lazos).`,
          answer: a * a,
          solution: [`Solo hay curva donde $\\${tr}(2\\theta) \\ge 0$. Un lazo es $\\theta \\in ${tr === "cos" ? "\\left[-\\frac{\\pi}{4}, \\frac{\\pi}{4}\\right]" : "\\left[0, \\frac{\\pi}{2}\\right]"}$ ([[ga-curvas-polares|lemniscata]]).`,
            `[[c2-polares|Área en polares]]: $\\frac12\\int r^2\\,d\\theta = \\frac12\\int ${a * a === 1 ? "" : a * a}\\${tr}(2\\theta)\\,d\\theta = \\frac{${a * a}}{2}$ por lazo.`, `Con los dos lazos: $${a * a}$.`],
          // verificación: área del polígono que recorre un lazo (fórmula del zapatero), por dos
          verify: { kind: "value", tol: 1e-5, fn: () => {
            const t0 = tr === "cos" ? -Math.PI / 4 : 0, N = 40000; let A = 0, px = 0, py = 0;
            for (let i = 1; i <= N; i++) { const t = t0 + (Math.PI / 2) * i / N, rr = a * Math.sqrt(Math.max(0, TRIG[tr](2 * t))), qx = rr * Math.cos(t), qy = rr * Math.sin(t); A += px * qy - qx * py; px = qx; py = qy; }
            return Math.abs(A);
          } }
        };
      }
      const a = r.int(1, 5), b = r.bool() ? a : r.int(1, 5), tr = r.pick(["cos", "sin"]), s = r.pick([1, -1]);
      const ans = b > a ? 2 : b === a ? 1 : 0;
      return {
        prompt: `¿Cuántas veces pasa por el polo la curva $r = ${a} ${s > 0 ? "+" : "-"} ${b === 1 ? "" : b}\\${tr}\\theta$ mientras $\\theta$ recorre $[0, 2\\pi)$?`,
        answer: ans,
        solution: [`Pasa por el polo cuando $r = 0$: $\\${tr}\\theta = ${s > 0 ? "-" : ""}${H.frac(a, b)}$ ([[ga-curvas-polares|caracoles]]).`,
          b > a ? `Como $${b} > ${a}$, ese valor está entre $-1$ y $1$ y hay dos ángulos que lo cumplen: el caracol tiene un lazo interior y pasa $2$ veces.` : b === a ? `Es una cardioide: $\\${tr}\\theta = ${s > 0 ? "-1" : "1"}$ en un solo ángulo, así que pasa $1$ vez (y ahí hace punta).` : `Como $${a} > ${b}$, el valor tiene módulo mayor que $1$: nunca pasa ($0$ veces).`],
        // verificación: se cuentan los ceros y los cambios de signo de r en una grilla fina
        verify: { kind: "value", tol: 1e-12, fn: () => {
          const N = 3600, f = t => a + s * b * TRIG[tr](t); let z = 0;
          for (let i = 0; i < N; i++) { const y = f(2 * Math.PI * i / N), y1 = f(2 * Math.PI * (i + 1) / N); if (Math.abs(y) < 1e-9) z++; else if (Math.abs(y1) >= 1e-9 && y * y1 < 0) z++; }
          return z;
        } }
      };
    }
  };
  // curvas para unir con su gráfico; F es la ecuación cartesiana (normalizada) que sale de eliminar r y θ
  const CURVAS = {
    circ(r) { const k = r.pick([2, 3, 4]), tr = r.pick(["cos", "sin"]);
      return { tex: `r = ${k}\\${tr}\\theta`, pieces: polarPieces(t => k * TRIG[tr](t), 0, Math.PI), F: (x, y) => (x * x + y * y - k * (tr === "cos" ? x : y)) / (k * k) }; },
    cardioide(r) { const c = r.pick([1, 2]), s = r.pick([1, -1]), tr = r.pick(["cos", "sin"]);
      return { tex: `r = ${c === 1 ? `1 ${s > 0 ? "+" : "-"} \\${tr}\\theta` : `${c}(1 ${s > 0 ? "+" : "-"} \\${tr}\\theta)`}`, pieces: polarPieces(t => c * (1 + s * TRIG[tr](t)), 0, 2 * Math.PI),
        F: (x, y) => { const q = x * x + y * y, X = tr === "cos" ? x : y; return ((q - s * c * X) ** 2 - c * c * q) / c ** 4; } }; },
    caracol(r) { const c = r.pick([1, 2]), s = r.pick([1, -1]);
      return { tex: `r = ${c} ${s > 0 ? "+" : "-"} ${2 * c}\\cos\\theta`, pieces: polarPieces(t => c + s * 2 * c * Math.cos(t), 0, 2 * Math.PI),
        F: (x, y) => { const q = x * x + y * y; return ((q - 2 * s * c * x) ** 2 - c * c * q) / c ** 4; } }; },
    rosa3(r) { const c = r.pick([2, 3]), tr = r.pick(["cos", "sin"]);
      return { tex: `r = ${c}\\${tr}(3\\theta)`, pieces: polarPieces(t => c * TRIG[tr](3 * t), 0, Math.PI),
        F: (x, y) => { const q = x * x + y * y; return (q * q - c * (tr === "cos" ? x ** 3 - 3 * x * y * y : 3 * x * x * y - y ** 3)) / c ** 4; } }; },
    rosa4(r) { const c = r.pick([2, 3]), tr = r.pick(["cos", "sin"]);
      return { tex: `r = ${c}\\${tr}(2\\theta)`, pieces: polarPieces(t => c * TRIG[tr](2 * t), 0, 2 * Math.PI),
        F: (x, y) => { const q = x * x + y * y; return (q ** 3 - c * c * (tr === "cos" ? (x * x - y * y) ** 2 : 4 * x * x * y * y)) / c ** 6; } }; },
    lemniscata(r) { const c = r.pick([2, 3]), tr = r.pick(["cos", "sin"]);
      return { tex: `r^2 = ${c * c}\\${tr}(2\\theta)`, pieces: polarPieces(t => c * Math.sqrt(TRIG[tr](2 * t)), 0, 2 * Math.PI, 2400),
        F: (x, y) => { const q = x * x + y * y; return (q * q - c * c * (tr === "cos" ? x * x - y * y : 2 * x * y)) / c ** 4; } }; },
    espiral(r) { const k = r.pick([2, 3, 4]);
      return { tex: `r = \\frac{\\theta}{${k}}`, pieces: polarPieces(t => t / k, 0, 4 * Math.PI, 1500),
        F: (x, y) => { const rho = Math.hypot(x, y), ph = Math.atan2(y, x); let best = Infinity; for (let j = -1; j <= 3; j++) best = Math.min(best, Math.abs(k * rho - (ph + 2 * Math.PI * j))); return best / (4 * Math.PI); } }; }
  };
  T["ga-curva-polar-match"] = {
    type: "match", concepts: ["ga-curvas-polares"], difficulty: 2, testN: 150,
    generate(r) {
      const keys = r.sample(Object.keys(CURVAS), 4), cs = keys.map(k => CURVAS[k](r));
      return {
        prompt: `Uní cada ecuación polar con su gráfico.`,
        pairs: cs.map(c => [{ tex: c.tex }, { graph: polarGraph(c.pieces) }]),
        solution: [`Pistas ([[ga-curvas-polares|gráficas polares]]): $r = k\\cos\\theta$ es una circunferencia que pasa por el polo; $r = a \\pm b\\cos\\theta$ es un caracol (cardioide si $a = b$, con lazo si $b > a$); $r = a\\cos(n\\theta)$ es una rosa de $n$ pétalos ($2n$ si $n$ es par); $r^2 = a^2\\cos(2\\theta)$ es un ocho; $r = \\frac{\\theta}{k}$ se aleja girando.`],
        // verificación: cada punto dibujado cumple la ecuación cartesiana de su curva
        verify: { kind: "truth", target: true, fn: () => cs.every(c => c.pieces.length > 0 && c.pieces.every(p => p.nodes.every(([x, y]) => Math.abs(c.F(x, y)) < 1e-8))) }
      };
    }
  };
  const SIMS = ["eje polar", "eje $y$", "polo"];
  T["ga-simetria-polar-vf"] = {
    type: "tf", concepts: ["ga-curvas-polares"], difficulty: 2,
    generate(r) {
      const fam = r.pick(["caracol", "rosa", "rosa", "lemniscata"]), tr = r.pick(["cos", "sin"]), which = r.int(0, 2);
      let tex, member, sample, truth, why;
      if (fam === "caracol") {
        const a = r.int(1, 4), b = r.int(1, 4), f = t => a + b * TRIG[tr](t);
        tex = `r = ${a} + ${b === 1 ? "" : b}\\${tr}\\theta`;
        member = (rho, ph) => Math.abs(f(ph) - rho) < 1e-9 || Math.abs(f(ph + Math.PI) + rho) < 1e-9;
        sample = t => f(t);
        truth = tr === "cos" ? [true, false, false] : [false, true, false];
        why = truth[which]
          ? `Cambiar $\\theta$ por ${tr === "cos" ? "$-\\theta$ no cambia $\\cos\\theta$" : "$\\pi - \\theta$ no cambia $\\sin\\theta$"}: la ecuación queda igual y la curva es simétrica respecto del ${SIMS[which]}.`
          : `La curva llega a $r = ${a + b}$ en $\\theta = ${tr === "cos" ? "0" : "\\frac{\\pi}{2}"}$, pero en la dirección opuesta ${a > b ? `solo llega a $r = ${a - b}$` : "solo toca el polo"}: el reflejo de ese punto ${which === 0 ? "en el eje polar" : which === 1 ? "en el eje $y$" : "por el polo"} no está en la curva.`;
      } else if (fam === "rosa") {
        const a = r.int(1, 4), n = r.int(2, 5), f = t => a * TRIG[tr](n * t);
        tex = `r = ${a === 1 ? "" : a}\\${tr}(${n}\\theta)`;
        member = (rho, ph) => Math.abs(f(ph) - rho) < 1e-9 || Math.abs(f(ph + Math.PI) + rho) < 1e-9;
        sample = t => f(t);
        truth = n % 2 === 0 ? [true, true, true] : tr === "cos" ? [true, false, false] : [false, true, false];
        const tips = n % 2 === 0 ? `las $${2 * n}$ direcciones ${tr === "cos" ? `$\\frac{k\\pi}{${n}}$` : `$\\frac{\\pi}{${2 * n}} + \\frac{k\\pi}{${n}}$`}` : `las $${n}$ direcciones ${tr === "cos" ? `$\\frac{2k\\pi}{${n}}$` : `$\\frac{\\pi}{${2 * n}} + \\frac{2k\\pi}{${n}}$`}`;
        why = `Las puntas de los pétalos están en ${tips}. ${truth[which] ? `Al reflejar ${which === 0 ? "en el eje polar ($\\theta \\to -\\theta$)" : which === 1 ? "en el eje $y$ ($\\theta \\to \\pi - \\theta$)" : "por el polo ($\\theta \\to \\theta + \\pi$)"} ese conjunto va a parar a sí mismo: hay simetría.` : `Al reflejar ${which === 0 ? "en el eje polar ($\\theta \\to -\\theta$)" : which === 1 ? "en el eje $y$ ($\\theta \\to \\pi - \\theta$)" : "por el polo ($\\theta \\to \\theta + \\pi$)"}, la punta ${tr === "cos" ? "$\\theta = 0$" : `$\\theta = \\frac{\\pi}{${2 * n}}$`} cae en una dirección sin pétalo: no hay simetría.`}`;
      } else {
        const a = r.int(1, 4), g = t => a * a * TRIG[tr](2 * t);
        tex = `r^2 = ${a * a === 1 ? "" : a * a}\\${tr}(2\\theta)`;
        member = (rho, ph) => Math.abs(g(ph) - rho * rho) < 1e-9 * a * a;
        sample = t => Math.sqrt(g(t));
        truth = tr === "cos" ? [true, true, true] : [false, false, true];
        why = tr === "cos" ? `Cambiar $\\theta$ por $-\\theta$ o por $\\pi - \\theta$ deja igual $\\cos(2\\theta)$, y como aparece $r^2$, cambiar $r$ por $-r$ tampoco cambia nada: es simétrica respecto de los dos ejes y del polo.`
          : which === 2 ? `Como aparece $r^2$, cambiar $r$ por $-r$ no cambia la ecuación: es simétrica respecto del polo.` : `Los lazos están donde $\\sin(2\\theta) \\ge 0$: en el primer y el tercer cuadrante. Reflejados en un eje caen en el segundo o el cuarto, donde no hay curva.`;
      }
      return {
        prompt: `<b>Verdadero o falso:</b> la curva $${tex}$ es simétrica respecto del ${SIMS[which]}.`,
        answer: truth[which],
        explanation: `${why} Más en [[ga-curvas-polares|simetrías en polares]].`,
        solution: [`Las pruebas por sustitución son suficientes pero no necesarias: si fallan, conviene mirar la curva (o un punto concreto) antes de concluir.`],
        // verificación: se reflejan muchos puntos de la curva y se chequea si el reflejo sigue en la curva
        verify: { kind: "truth", fn: () => {
          const refl = [(x, y) => [x, -y], (x, y) => [-x, y], (x, y) => [-x, -y]][which];
          for (let i = 0; i < 720; i++) {
            const t = 0.0007 + i * Math.PI / 360, rr = sample(t);
            if (!isFinite(rr)) continue;
            const [x, y] = refl(rr * Math.cos(t), rr * Math.sin(t)), rho = Math.hypot(x, y);
            if (rho < 1e-9) continue;
            if (!member(rho, Math.atan2(y, x))) return false;
          }
          return true;
        } }
      };
    }
  };

  /* ---------- Lección 4 · coordenadas cilíndricas y esféricas ---------- */
  const PHI = [[30, "\\frac{\\pi}{6}"], [45, "\\frac{\\pi}{4}"], [60, "\\frac{\\pi}{3}"], [90, "\\frac{\\pi}{2}"], [120, "\\frac{2\\pi}{3}"], [135, "\\frac{3\\pi}{4}"], [150, "\\frac{5\\pi}{6}"]];
  T["ga-esfericas-num"] = {
    type: "numeric", concepts: ["ga-cilindricas-esfericas"], difficulty: 2,
    generate(r) {
      const v = r.pick(["cart", "esf", "cil"]);
      const conv = "(con $\\rho \\ge 0$, $\\varphi \\in [0, \\pi]$ medido desde el eje $z$ positivo y $\\theta$ el ángulo de las polares)";
      if (v === "cart") {
        const x = r.int(-4, 4), y = r.int(-4, 4), z = r.int(-4, 4), ask = r.pick(["rho", "phi", "theta"]);
        if (x === 0 && y === 0) return null;
        const rho = Math.hypot(x, y, z), phi = Math.acos(z / rho) / DEG;
        let th = Math.atan2(y, x) / DEG; if (th < 0) th += 360;
        const ans = ask === "rho" ? rho : ask === "phi" ? phi : th;
        return {
          prompt: `Pasá el punto $(${x}, ${y}, ${z})$ a esféricas $(\\rho, \\varphi, \\theta)$ ${conv}. ¿Cuánto vale ${ask === "rho" ? "$\\rho$" : ask === "phi" ? "$\\varphi$, en grados" : "$\\theta$, en grados entre $0$ y $360$"}?`,
          answer: ans,
          solution: [`$\\rho = \\sqrt{x^2 + y^2 + z^2} = \\sqrt{${x * x + y * y + z * z}} \\approx ${nd(rho)}$.`,
            ask === "phi" ? `$\\cos\\varphi = \\frac{z}{\\rho} = \\frac{${z}}{\\sqrt{${x * x + y * y + z * z}}}$, y como $\\varphi \\in [0, \\pi]$ no hay que elegir cuadrante: $\\varphi \\approx ${nd(phi)}^\\circ$.`
              : ask === "theta" ? `$\\theta$ es el ángulo polar de $(x, y) = (${x}, ${y})$, que está ${y === 0 ? (x > 0 ? "sobre el semieje $x$ positivo" : "sobre el semieje $x$ negativo") : x === 0 ? (y > 0 ? "sobre el semieje $y$ positivo" : "sobre el semieje $y$ negativo") : `en el ${x > 0 ? (y > 0 ? "primer" : "cuarto") : (y > 0 ? "segundo" : "tercer")} cuadrante`}: $\\theta \\approx ${nd(th)}^\\circ$.` : `Es la distancia del punto al origen.`],
          // verificación: con la respuesta y las otras dos coordenadas se reconstruye el punto
          verify: { kind: "zero", tol: 1e-9, fn: val => {
            const [R0, P0, T0] = ask === "rho" ? [val, phi, th] : ask === "phi" ? [rho, val, th] : [rho, phi, val];
            const ok = P0 >= 0 && P0 <= 180 && T0 >= 0 && T0 < 360 ? 0 : 1;
            return [R0 * Math.sin(P0 * DEG) * Math.cos(T0 * DEG) - x, R0 * Math.sin(P0 * DEG) * Math.sin(T0 * DEG) - y, R0 * Math.cos(P0 * DEG) - z, ok];
          } }
        };
      }
      if (v === "esf") {
        const rho = r.int(1, 8), [p, pt] = r.pick(PHI), [t, tt] = r.pick(ANG), ask = r.pick(["x", "y", "z"]);
        const P = [rho * Math.sin(p * DEG) * Math.cos(t * DEG), rho * Math.sin(p * DEG) * Math.sin(t * DEG), rho * Math.cos(p * DEG)];
        const ans = P["xyz".indexOf(ask)];
        return {
          prompt: `Un punto tiene coordenadas esféricas $(\\rho, \\varphi, \\theta) = \\left(${rho}, ${pt}, ${tt}\\right)$ ${conv}. ¿Cuánto vale su coordenada $${ask}$?`,
          answer: ans,
          solution: [`[[ga-cilindricas-esfericas|De esféricas a cartesianas]]: $x = \\rho\\sin\\varphi\\cos\\theta$, $y = \\rho\\sin\\varphi\\sin\\theta$, $z = \\rho\\cos\\varphi$.`,
            `$${ask} = ${ask === "z" ? `${rho}\\cos\\left(${pt}\\right)` : `${rho}\\sin\\left(${pt}\\right)\\${ask === "x" ? "cos" : "sin"}\\left(${tt}\\right)`} \\approx ${nd(ans)}$.`],
          // verificación: el punto reconstruido está a distancia ρ del origen y forma los ángulos pedidos
          verify: { kind: "zero", tol: 1e-9, fn: val => {
            const Q = P.slice(); Q["xyz".indexOf(ask)] = val;
            const d = Math.hypot(...Q), res = [d - rho, Math.acos(Math.max(-1, Math.min(1, Q[2] / d))) - p * DEG];
            const az = Math.atan2(Q[1], Q[0]) - t * DEG; res.push(Math.sin(az), Math.cos(az) > 0 ? 0 : 1);
            return res;
          } }
        };
      }
      const rr = r.int(1, 6), [t, tt] = r.pick(ANG), z = r.int(-6, 6), ask = r.pick(["rho", "phi"]);
      const rho = Math.hypot(rr, z), phi = Math.acos(z / rho) / DEG, ans = ask === "rho" ? rho : phi;
      return {
        prompt: `Un punto tiene coordenadas cilíndricas $(r, \\theta, z) = \\left(${rr}, ${tt}, ${z}\\right)$. En esféricas ${conv}, ¿cuánto vale ${ask === "rho" ? "$\\rho$" : "$\\varphi$, en grados"}?`,
        answer: ans,
        solution: [`El ángulo $\\theta$ es el mismo en los dos sistemas. En el semiplano $\\theta = ${tt}$, el punto está a distancia $r = ${rr}$ del eje $z$ y a altura $z = ${z}$ ([[ga-cilindricas-esfericas|cilíndricas y esféricas]]).`,
          ask === "rho" ? `$\\rho = \\sqrt{r^2 + z^2} = \\sqrt{${rr * rr + z * z}} \\approx ${nd(rho)}$.` : `$\\cos\\varphi = \\frac{z}{\\rho} = \\frac{${z}}{\\sqrt{${rr * rr + z * z}}}$, así que $\\varphi \\approx ${nd(phi)}^\\circ$.`],
        // verificación: pasando las dos descripciones a cartesianas tiene que salir el mismo punto
        verify: { kind: "zero", tol: 1e-9, fn: val => {
          const [R0, P0] = ask === "rho" ? [val, phi] : [rho, val];
          const A = [rr * Math.cos(t * DEG), rr * Math.sin(t * DEG), z], B = [R0 * Math.sin(P0 * DEG) * Math.cos(t * DEG), R0 * Math.sin(P0 * DEG) * Math.sin(t * DEG), R0 * Math.cos(P0 * DEG)];
          return A.map((a, i) => a - B[i]);
        } }
      };
    }
  };
  const SUP = ["Esfera con centro en el origen", "Cilindro circular de eje $z$", "Semiplano que contiene al eje $z$", "Plano horizontal",
    "Cono (una hoja) con vértice en el origen y eje $z$", "Esfera que pasa por el origen, con centro en el eje $z$", "Paraboloide de revolución de eje $z$"];
  T["ga-sup-coord-mc"] = {
    type: "mc", concepts: ["ga-cilindricas-esfericas"], difficulty: 2,
    generate(r) {
      const c = r.int(1, 6), [al, at] = r.pick([[30, "\\frac{\\pi}{6}"], [45, "\\frac{\\pi}{4}"], [60, "\\frac{\\pi}{3}"], [120, "\\frac{2\\pi}{3}"], [135, "\\frac{3\\pi}{4}"]]);
      const k = r.nz(-3, 3), a = al * DEG;
      // cada caso: ecuación, superficie, puntos de la superficie (cartesianos, a partir de dos parámetros) y prueba cartesiana
      const cyl = (rr, th, z) => [rr * Math.cos(th), rr * Math.sin(th), z];
      const sph = (rho, ph, th) => [rho * Math.sin(ph) * Math.cos(th), rho * Math.sin(ph) * Math.sin(th), rho * Math.cos(ph)];
      const S = [
        { eq: `r = ${c}`, sys: "cilíndricas", kind: 1, pt: (u, w) => cyl(c, w, u), test: (x, y) => x * x + y * y - c * c },
        { eq: `\\theta = ${at}`, sys: "cilíndricas", kind: 2, pt: (u, w) => cyl(Math.abs(u) + 0.1, a, w), test: (x, y) => Math.abs(-Math.sin(a) * x + Math.cos(a) * y) + (Math.cos(a) * x + Math.sin(a) * y >= 0 ? 0 : 1) },
        { eq: `z = ${k}`, sys: "cilíndricas", kind: 3, pt: (u, w) => cyl(Math.abs(u), w, k), test: (x, y, z) => z - k },
        { eq: `z = ${cf(k)}r`, sys: "cilíndricas", kind: 4, pt: (u, w) => cyl(Math.abs(u), w, k * Math.abs(u)), test: (x, y, z) => x * x + y * y - z * z / (k * k) + (z * k >= 0 ? 0 : 1) },
        { eq: `r^2 + z^2 = ${c * c}`, sys: "cilíndricas", kind: 0, pt: (u, w) => { const ph = (u + 3) / 6 * Math.PI; return cyl(c * Math.sin(ph), w, c * Math.cos(ph)); }, test: (x, y, z) => x * x + y * y + z * z - c * c },
        { eq: `z = ${cf(k)}r^2`, sys: "cilíndricas", kind: 6, pt: (u, w) => cyl(Math.abs(u), w, k * u * u), test: (x, y, z) => z - k * (x * x + y * y) },
        { eq: `\\rho = ${c}`, sys: "esféricas", kind: 0, pt: (u, w) => sph(c, (u + 3) / 6 * Math.PI, w), test: (x, y, z) => x * x + y * y + z * z - c * c },
        { eq: `\\varphi = ${at}`, sys: "esféricas", kind: 4, pt: (u, w) => sph(Math.abs(u), a, w), test: (x, y, z) => x * x + y * y - Math.tan(a) ** 2 * z * z + (z * Math.cos(a) >= 0 ? 0 : 1) },
        { eq: `\\theta = ${at}`, sys: "esféricas", kind: 2, pt: (u, w) => sph(Math.abs(w) + 0.1, (u + 3) / 6 * Math.PI * 0.98 + 0.01, a), test: (x, y) => Math.abs(-Math.sin(a) * x + Math.cos(a) * y) + (Math.cos(a) * x + Math.sin(a) * y >= 0 ? 0 : 1) },
        { eq: `\\rho\\cos\\varphi = ${k}`, sys: "esféricas", kind: 3, pt: (u, w) => { const ph = k > 0 ? (u + 3) / 6 * 1.4 + 0.05 : Math.PI - (u + 3) / 6 * 1.4 - 0.05; return sph(k / Math.cos(ph), ph, w); }, test: (x, y, z) => z - k },
        { eq: `\\rho\\sin\\varphi = ${c}`, sys: "esféricas", kind: 1, pt: (u, w) => { const ph = (u + 3) / 6 * 2.8 + 0.17; return sph(c / Math.sin(ph), ph, w); }, test: (x, y) => x * x + y * y - c * c },
        { eq: `\\rho = ${2 * c}\\cos\\varphi`, sys: "esféricas", kind: 5, pt: (u, w) => { const ph = (u + 3) / 6 * 1.5; return sph(2 * c * Math.cos(ph), ph, w); }, test: (x, y, z) => x * x + y * y + z * z - 2 * c * z }
      ];
      const s = r.pick(S);
      const why = [`fijar la distancia al origen da una esfera centrada en él`, `fijar la distancia al eje $z$ da un cilindro`, `fijar $\\theta$ deja libres la distancia al eje y la altura: un semiplano que arranca en el eje $z$`,
        `fijar la altura da un plano horizontal`, `la distancia al eje es proporcional a la altura (o el ángulo con el eje $z$ está fijo): un cono con vértice en el origen; como $r, \\rho \\ge 0$, es una sola hoja`,
        `multiplicando por $\\rho$: $x^2 + y^2 + z^2 = ${2 * c}z$, o sea $x^2 + y^2 + (z - ${c})^2 = ${c * c}$`, `$z$ es proporcional a $r^2 = x^2 + y^2$: un paraboloide de revolución`][s.kind];
      return {
        prompt: `¿Qué superficie es $${s.eq}$, en coordenadas ${s.sys}?`,
        ...H.mc(r, SUP[s.kind], r.shuffle(SUP.filter((_, i) => i !== s.kind)), { text: true }),
        solution: [`[[ga-cilindricas-esfericas|Superficies coordenadas]]: ${why}.`],
        // verificación: muchos puntos de la superficie (en ${s.sys}) cumplen la ecuación cartesiana de la opción correcta
        verify: { kind: "truth", target: true, fn: () => { for (let i = 0; i < 25; i++) for (let j = 0; j < 12; j++) { const P = s.pt(-3 + i * 0.25, j * Math.PI / 6 + 0.2); if (Math.abs(s.test(...P)) > 1e-9 * Math.max(1, Math.hypot(...P)) ** 2) return false; } return true; } }
      };
    }
  };

  const G = "ga-coordenadas-u";
  const rosa3 = polarGraph(polarPieces(t => 2 * Math.cos(3 * t), 0, Math.PI));
  const caracolG = polarGraph(polarPieces(t => 1 + 2 * Math.cos(t), 0, 2 * Math.PI));
  const cards = {
    "ga-polares-rectas-circ": {
      group: G, title: "Rectas y circunferencias en polares", aliases: ["ecuación polar de la recta", "ecuación polar de una recta", "ecuación polar de la circunferencia", "distancia en polares"], concepts: ["ga-polares-rectas-circ"],
      summary: "Recta a distancia p del polo, con normal de ángulo α: r cos(θ − α) = p. Circunferencia de centro (a, b) que pasa por el polo: r = 2a cos θ + 2b sen θ. Distancia entre dos puntos: teorema del coseno.",
      def: [R`Un punto en [[c2-polares|polares]] es $(r, \theta)$, con $x = r\cos\theta$ e $y = r\sin\theta$. El mismo punto tiene muchos nombres: $(r, \theta)$, $(r, \theta + 2k\pi)$ y $(-r, \theta + \pi)$.`,
        R`**Recta (forma normal).** Si la perpendicular desde el polo a la recta mide $p \ge 0$ y forma un ángulo $\alpha$ con el eje polar, la recta es $$r\cos(\theta - \alpha) = p.$$ En general, $ax + by = c$ se escribe $r = \dfrac{c}{a\cos\theta + b\sin\theta}$. Casos particulares: $x = k$ es $r = \frac{k}{\cos\theta}$, $y = k$ es $r = \frac{k}{\sin\theta}$, y una recta que pasa por el polo es $\theta = \theta_0$.`,
        R`**Circunferencia.** Con centro en el polo: $r = R$. Con centro $(a, b)$ y pasando por el polo: $r = 2a\cos\theta + 2b\sin\theta$. En general, con centro de coordenadas polares $(r_0, \theta_0)$ y radio $R$: $$r^2 - 2rr_0\cos(\theta - \theta_0) + r_0^2 = R^2.$$`,
        R`**Distancia** entre $(r_1, \theta_1)$ y $(r_2, \theta_2)$: $$d^2 = r_1^2 + r_2^2 - 2r_1r_2\cos(\theta_2 - \theta_1).$$`],
      idea: [R`Las polares miran todo desde el polo: lo natural es preguntar "a qué distancia" y "en qué dirección". Por eso son tan simples la circunferencia centrada en el polo ($r = R$, distancia fija) y la recta que pasa por él ($\theta = \theta_0$, dirección fija).`,
        R`Para pasar una ecuación cartesiana a polares se reemplaza $x = r\cos\theta$, $y = r\sin\theta$ y $x^2 + y^2 = r^2$. Para volver, hay que armar $r\cos\theta$, $r\sin\theta$ o $r^2$, muchas veces multiplicando todo por $r$.`],
      demo: [R`**Paso 1 (recta: planteo).** Sea $N$ el pie de la perpendicular desde el polo $O$ a la recta, y $\vec u = (\cos\alpha, \sin\alpha)$ el versor de $O$ hacia $N$, de modo que $N = p\,\vec u$. Un punto $P$ está en la recta exactamente cuando $\overrightarrow{NP}$ es perpendicular a $\vec u$, o sea cuando la proyección de $\overrightarrow{OP}$ sobre $\vec u$ mide $p$: $\overrightarrow{OP}\cdot\vec u = p$ (es la [[al-producto-escalar|proyección escalar]]).`,
        R`**Paso 2.** Con $P = r(\cos\theta, \sin\theta)$, el producto escalar es $r(\cos\theta\cos\alpha + \sin\theta\sin\alpha)$. Por la fórmula del coseno de una resta, el paréntesis es $\cos(\theta - \alpha)$, y queda $r\cos(\theta - \alpha) = p$.`,
        R`**Paso 3 (recta cualquiera).** En $ax + by = c$ reemplazamos $x$ e $y$: $r(a\cos\theta + b\sin\theta) = c$. Donde el paréntesis no se anula, despejamos $r$. Donde se anula, la dirección $\theta$ es paralela a la recta y no hay punto: tiene sentido que $r$ "no exista".`,
        R`**Paso 4 (circunferencia por el polo).** Completando cuadrados, $(x - a)^2 + (y - b)^2 = a^2 + b^2$ es lo mismo que $x^2 + y^2 = 2ax + 2by$: una circunferencia de centro $(a, b)$ que pasa por el origen. En polares, $r^2 = 2ar\cos\theta + 2br\sin\theta$. Dividimos por $r$: la única solución que podría perderse es $r = 0$, el polo, pero ese punto ya está en $r = 2a\cos\theta + 2b\sin\theta$ (en el ángulo donde el lado derecho se anula). Queda $r = 2a\cos\theta + 2b\sin\theta$.`,
        R`**Paso 5 (distancia y circunferencia general).** El polo $O$ y dos puntos $P_1$, $P_2$ forman un triángulo con lados $OP_1 = r_1$ y $OP_2 = r_2$ que forman el ángulo $\theta_2 - \theta_1$. El teorema del coseno da el tercer lado: $d^2 = r_1^2 + r_2^2 - 2r_1r_2\cos(\theta_2 - \theta_1)$. Si $P_1$ es el centro $(r_0, \theta_0)$ y $P_2 = (r, \theta)$, pedir $d = R$ es la ecuación general de la circunferencia. $\blacksquare$`],
      examples: [{ q: R`Pasá $x + y = 2$ a polares y hallá la distancia del polo a la recta.`, steps: [R`$r(\cos\theta + \sin\theta) = 2$.`, R`Como $\cos\theta + \sin\theta = \sqrt2\cos\left(\theta - \frac{\pi}{4}\right)$, queda $r\cos\left(\theta - \frac{\pi}{4}\right) = \sqrt2$.`, R`Es la forma normal con $p = \sqrt2$ y $\alpha = \frac{\pi}{4}$: la recta está a distancia $\sqrt2$ del polo.`] },
        { q: R`¿Qué curva es $r = 6\sin\theta$?`, steps: [R`Multiplicamos por $r$: $x^2 + y^2 = 6y$.`, R`$x^2 + (y - 3)^2 = 9$: circunferencia de centro $(0, 3)$ y radio $3$, que pasa por el polo.`] }],
      tips: [R`Al dividir por $r$ o por $\cos\theta$, revisá si perdés puntos: el polo suele estar en la curva igual.`, R`Un punto tiene infinitos pares $(r, \theta)$. Para ver si está en una curva, probá también con $(-r, \theta + \pi)$.`],
      see: ["c2-polares", "al-producto-escalar", "ga-conica-polar"]
    },
    "ga-conica-polar": {
      group: G, title: "Cónicas en coordenadas polares", aliases: ["ecuación polar de una cónica", "cónicas en polares", "cónica en polares"], concepts: ["ga-conica-polar"],
      summary: "Con un foco en el polo y la directriz a distancia d: r = ed/(1 ± e cos θ) o r = ed/(1 ± e sen θ). Si e < 1 es una elipse, si e = 1 una parábola y si e > 1 una hipérbola.",
      def: [R`Una cónica es el lugar de los puntos cuya distancia a un foco es $e$ veces su distancia a una recta fija (la directriz); el número $e > 0$ es la **excentricidad**. Si el foco está en el polo y la directriz a distancia $d$:`,
        R`$$r = \frac{ed}{1 + e\cos\theta}\ \ (\text{directriz } x = d), \qquad r = \frac{ed}{1 - e\cos\theta}\ \ (x = -d),$$ $$r = \frac{ed}{1 + e\sin\theta}\ \ (y = d), \qquad r = \frac{ed}{1 - e\sin\theta}\ \ (y = -d).$$`,
        R`Es una **elipse** si $e < 1$, una **parábola** si $e = 1$ y una **hipérbola** si $e > 1$. Si la ecuación viene como $r = \frac{k}{m + n\cos\theta}$, primero se divide por $m$: $e = \frac nm$ y $ed = \frac km$.`,
        R`Los **vértices** están sobre el eje focal: en $\theta = 0$ y $\theta = \pi$ (con coseno) o en $\theta = \frac\pi2$ y $\frac{3\pi}{2}$ (con seno). En la elipse, $r_{\min} + r_{\max} = 2a$.`],
      idea: [R`Una sola fórmula para las tres cónicas: lo único que cambia es $e$. Si $e < 1$, el denominador $1 + e\cos\theta$ nunca se anula y la curva queda acotada (elipse). Si $e = 1$, se anula en una sola dirección y por ahí la curva se va al infinito (parábola). Si $e > 1$, se anula en dos direcciones, las de las asíntotas, y los $r$ negativos dibujan la otra rama (hipérbola).`,
        R`Es la forma natural de las órbitas: el Sol está en un foco y $r(\theta)$ es la distancia del planeta al Sol ([[f1-gravitacion]]).`],
      demo: [R`**Paso 1 (planteo).** Ponemos el foco en el polo $O$ y la directriz en la recta $x = d$, con $d > 0$. Tomamos un punto $P = (r\cos\theta, r\sin\theta)$ con $r \ge 0$, del mismo lado de la directriz que el foco ($x < d$). Su distancia al foco es $r$, y su distancia a la directriz es $d - x = d - r\cos\theta$.`,
        R`**Paso 2.** La definición de cónica pide que la distancia al foco sea $e$ veces la distancia a la directriz: $$r = e\,(d - r\cos\theta).$$`,
        R`**Paso 3.** Pasamos el término con $r$ a la izquierda y sacamos factor común: $r(1 + e\cos\theta) = ed$. Dividiendo (el paréntesis es positivo justamente para los puntos del lado del foco), $$r = \frac{ed}{1 + e\cos\theta}.$$`,
        R`**Paso 4 (las otras directrices).** Si la directriz es $x = -d$, la distancia a ella es $x + d = d + r\cos\theta$, y el mismo despeje da el signo menos. Si es $y = \pm d$, se cambia $x = r\cos\theta$ por $y = r\sin\theta$ y aparece el seno.`,
        R`**Paso 5 (el eje mayor de la elipse).** Con $e < 1$, los vértices están en $\theta = 0$, a distancia $\frac{ed}{1 + e}$ del foco, y en $\theta = \pi$, a distancia $\frac{ed}{1 - e}$, del otro lado. Como los dos vértices y el foco están alineados sobre el eje, el eje mayor mide la suma: $$2a = \frac{ed}{1 + e} + \frac{ed}{1 - e} = \frac{2ed}{1 - e^2}. \;\blacksquare$$`],
      examples: [{ q: R`Analizá $r = \dfrac{10}{2 + 3\cos\theta}$.`, steps: [R`Dividimos por $2$: $r = \dfrac{5}{1 + \frac32\cos\theta}$, así que $e = \frac32 > 1$: es una hipérbola.`, R`$ed = 5$, entonces $d = \frac{5}{3/2} = \frac{10}{3}$: la directriz es $x = \frac{10}{3}$.`, R`Vértices: $\theta = 0$ da $r = 2$, el punto $(2, 0)$; $\theta = \pi$ da $r = -10$, que es el punto $(10, 0)$. El centro es $(6, 0)$, así que $a = 4$ y $c = 6$: $e = \frac ca = \frac32$, como tenía que dar.`] }],
      tips: [R`Antes de leer $e$, el número suelto del denominador tiene que ser $1$: en $\frac{6}{3 + 3\sin\theta}$ es $e = 1$ (parábola), no $e = 3$.`, R`Si $e > 1$ y te da un $r$ negativo, no es un error: es un punto de la otra rama.`],
      see: ["c2-conicas", "c2-polares", "ga-polares-rectas-circ"]
    },
    "ga-curvas-polares": {
      group: G, title: "Gráficas polares: rosas, caracoles y lemniscatas", aliases: ["lemniscata", "lemniscatas", "caracol de Pascal", "rosas polares", "espiral de Arquímedes", "simetrías en polares"], concepts: ["ga-curvas-polares"],
      summary: "Rosa r = a cos(nθ): n pétalos si n es impar y 2n si es par. Caracol r = a + b cos θ: con lazo si b > a, cardioide si a = b. Lemniscata r² = a² cos 2θ, de área a². Las simetrías se prueban sustituyendo.",
      def: [R`**Rosas** $r = a\cos(n\theta)$ o $r = a\sin(n\theta)$, con $n \ge 2$ entero: pétalos de largo $|a|$; hay $n$ si $n$ es impar y $2n$ si $n$ es par.`,
        { graph: rosa3, caption: R`La rosa $r = 2\cos(3\theta)$: tres pétalos.` },
        R`**Caracoles** (de Pascal) $r = a + b\cos\theta$ o $r = a + b\sin\theta$, con $a, b > 0$: si $b > a$ tienen un **lazo interior**; si $a = b$ son una **cardioide**; si $a > b$ no pasan por el polo.`,
        { graph: caracolG, caption: R`El caracol $r = 1 + 2\cos\theta$, con su lazo interior.` },
        R`**Lemniscata** $r^2 = a^2\cos(2\theta)$ (o $a^2\sin(2\theta)$): un ocho con dos lazos que se cruzan en el polo; encierra un área total $a^2$.`,
        R`**Espiral de Arquímedes** $r = a\theta$: en cada vuelta se aleja $2\pi a$ del polo.`,
        R`**Simetrías** (pruebas suficientes): si la ecuación no cambia al reemplazar $\theta$ por $-\theta$, la curva es simétrica respecto del **eje polar**; si no cambia con $\theta \to \pi - \theta$, respecto del **eje $y$**; si no cambia con $r \to -r$ (o con $\theta \to \theta + \pi$), respecto del **polo**.`],
      idea: [R`Para dibujar una curva polar, pensá $r(\theta)$ como una función común: graficala en un plano $(\theta, r)$ y después "enrollala" alrededor del polo. Cada arco entre dos ceros de $r$ es un pétalo o un lazo, y donde $r < 0$ el punto se dibuja del lado opuesto.`,
        R`Eso explica la cuenta de pétalos: $\cos(n\theta)$ tiene $2n$ arcos en $[0, 2\pi)$. Si $n$ es par, cada arco cae en un lugar distinto; si es impar, los arcos negativos se dibujan encima de los positivos y quedan $n$.`],
      demo: [R`**Paso 1 (simetría respecto del eje polar).** Reflejar en el eje polar manda el punto $(r, \theta)$ al $(r, -\theta)$: la distancia al polo no cambia y el ángulo cambia de signo. Si la ecuación no cambia al reemplazar $\theta$ por $-\theta$, cada punto reflejado también la cumple, así que la curva es simétrica.`,
        R`**Paso 2 (eje $y$ y polo).** Del mismo modo, reflejar en el eje $y$ manda $(r, \theta)$ a $(r, \pi - \theta)$, y la simetría central respecto del polo lo manda a $(-r, \theta)$, que es el mismo punto que $(r, \theta + \pi)$. Son pruebas **suficientes, no necesarias**: como cada punto tiene muchos nombres, una curva puede ser simétrica aunque la sustitución cambie la ecuación. Por ejemplo, $r = \sin(2\theta)$ es simétrica respecto del eje polar, aunque $\theta \to -\theta$ le cambia el signo.`,
        R`**Paso 3 (pétalos: los arcos).** $r = a\cos(n\theta)$ se anula cuando $n\theta = \frac\pi2 + k\pi$: son $2n$ ángulos equiespaciados en $[0, 2\pi)$. Entre dos ceros seguidos, $r$ no cambia de signo, así que cada uno de esos $2n$ arcos dibuja un pétalo: sale del polo, llega hasta $|a|$ en la mitad del arco, $\theta = \frac{k\pi}{n}$, y vuelve.`,
        R`**Paso 4 (¿hacia dónde apunta cada pétalo?).** El pétalo del arco $k$ apunta en la dirección $\frac{k\pi}{n}$ si ahí $r > 0$ ($k$ par) y en la opuesta, $\frac{k\pi}{n} + \pi = \frac{(k + n)\pi}{n}$, si $r < 0$ ($k$ impar).`,
        R`**Paso 5 (la cuenta).** Si $n$ es par, $k + n$ tiene la paridad de $k$: los pétalos impares apuntan a múltiplos impares de $\frac\pi n$ y los pares a múltiplos pares. Las $2n$ direcciones son todas distintas: hay $2n$ pétalos. Si $n$ es impar, $k + n$ es par cuando $k$ es impar: los pétalos impares caen exactamente sobre los pares y solo quedan $n$.`,
        R`**Paso 6 (área de la lemniscata).** Con el [[c2-polares|área en polares]], $A = \frac12\int r^2\,d\theta$. Un lazo de $r^2 = a^2\cos(2\theta)$ corresponde a $\theta \in \left[-\frac\pi4, \frac\pi4\right]$, donde $\cos(2\theta) \ge 0$: $$\frac12\int_{-\pi/4}^{\pi/4} a^2\cos(2\theta)\,d\theta = \frac{a^2}{2}\left[\frac{\sin(2\theta)}{2}\right]_{-\pi/4}^{\pi/4} = \frac{a^2}{2}.$$ Con los dos lazos, el área total es $a^2$. $\blacksquare$`],
      examples: [{ q: R`Describí $r = 1 + 2\cos\theta$.`, steps: [R`Es un caracol con $a = 1 < b = 2$: tiene lazo interior.`, R`Pasa por el polo cuando $\cos\theta = -\frac12$, o sea en $\theta = \frac{2\pi}{3}$ y en $\theta = \frac{4\pi}{3}$; entre esos ángulos $r < 0$ y se dibuja el lazo.`, R`Es simétrica respecto del eje polar, porque cambiar $\theta$ por $-\theta$ no cambia $\cos\theta$. Corta al eje en $r(0) = 3$ y, con el lazo, en $\theta = \pi$: $r = -1$, que es el punto $(1, 0)$.`] }],
      tips: [R`Para contar pétalos no alcanza con mirar $n$: $r = \cos(3\theta)$ tiene $3$, pero $r = \cos(2\theta)$ tiene $4$.`, R`En $r^2 = a^2\cos(2\theta)$ solo hay curva donde $\cos(2\theta) \ge 0$.`],
      see: ["c2-polares", "ga-polares-rectas-circ"]
    },
    "ga-cilindricas-esfericas": {
      group: G, title: "Cilíndricas y esféricas: conversiones y superficies coordenadas", aliases: ["superficies coordenadas", "superficie coordenada", "colatitud"], concepts: ["ga-cilindricas-esfericas"],
      summary: "Cilíndricas (r, θ, z); esféricas (ρ, φ, θ), con φ medido desde el eje z. Fijando una coordenada: r = c es un cilindro, θ = c un semiplano, z = c un plano, ρ = c una esfera y φ = c un cono.",
      def: [R`**Cilíndricas** $(r, \theta, z)$: $x = r\cos\theta$, $y = r\sin\theta$, $z = z$. **Esféricas** $(\rho, \varphi, \theta)$: $x = \rho\sin\varphi\cos\theta$, $y = \rho\sin\varphi\sin\theta$, $z = \rho\cos\varphi$, con $\rho \ge 0$ y $0 \le \varphi \le \pi$ ([[c2-coord-espacio|coordenadas en el espacio]]).`,
        R`**Al revés:** $r = \sqrt{x^2 + y^2}$, $\rho = \sqrt{x^2 + y^2 + z^2}$, $\cos\varphi = \frac{z}{\rho}$ y $\tan\theta = \frac yx$ (eligiendo el cuadrante de $(x, y)$). Entre los dos sistemas: $r = \rho\sin\varphi$ y $z = \rho\cos\varphi$.`,
        R`**Superficies coordenadas** (se fija una coordenada). En cilíndricas: $r = c$ es un cilindro de eje $z$, $\theta = c$ un semiplano que contiene al eje $z$ y $z = c$ un plano horizontal. En esféricas: $\rho = c$ es una esfera centrada en el origen, $\varphi = c$ un cono de eje $z$ con vértice en el origen (el plano $xy$ si $\varphi = \frac\pi2$) y $\theta = c$, otra vez, un semiplano.`,
        R`**Otras útiles:** $\rho\cos\varphi = c$ es el plano $z = c$; $\rho\sin\varphi = c$ es el cilindro $r = c$; $\rho = 2c\cos\varphi$ es la esfera $x^2 + y^2 + (z - c)^2 = c^2$; $z = kr$ es un cono y $z = kr^2$ un paraboloide de revolución.`],
      idea: [R`Cada sistema se adapta a una simetría. Las cilíndricas, a lo que gira alrededor del eje $z$: cilindros, conos y paraboloides de revolución. Las esféricas, a lo que tiene un centro: esferas y conos con vértice en el origen.`,
        R`Pensá $\varphi$ como la **colatitud**: vale $0$ en el polo norte, $\frac\pi2$ en el ecuador y $\pi$ en el polo sur (la latitud geográfica es $\frac\pi2 - \varphi$). Y $\theta$ es la longitud.`],
      demo: [R`**Paso 1 (de dónde salen las fórmulas).** Como se ve en [[c2-coord-espacio]], la distancia del punto al eje $z$ es $r = \rho\sin\varphi$ y su altura es $z = \rho\cos\varphi$ (catetos de un triángulo rectángulo de hipotenusa $\rho$); en el plano $xy$ se usan polares con ese $r$.`,
        R`**Paso 2 ($\rho$).** Sumamos los cuadrados y usamos $\cos^2 + \sin^2 = 1$ dos veces: $x^2 + y^2 = \rho^2\sin^2\varphi\,(\cos^2\theta + \sin^2\theta) = \rho^2\sin^2\varphi$, y sumando $z^2 = \rho^2\cos^2\varphi$ queda $x^2 + y^2 + z^2 = \rho^2$. Como $\rho \ge 0$, $\rho = \sqrt{x^2 + y^2 + z^2}$: es la distancia al origen.`,
        R`**Paso 3 ($\varphi$).** Dividimos $z = \rho\cos\varphi$ por $\rho$: $\cos\varphi = \frac z\rho$. El arcocoseno devuelve ángulos entre $0$ y $\pi$, justo el rango de $\varphi$, así que $\varphi = \arccos\frac z\rho$ sin discutir cuadrantes (a diferencia de $\theta$).`,
        R`**Paso 4 ($\varphi = c$ es un cono).** Si $\varphi = c$, con $c \ne \frac\pi2$, entonces $r = \rho\sin c$ y $z = \rho\cos c$, así que $r = z\tan c$: la distancia al eje es proporcional a la altura. Es un cono de eje $z$, vértice en el origen y semiángulo $c$. Como $\rho \ge 0$, $z$ tiene el signo de $\cos c$: es una sola hoja.`,
        R`**Paso 5 ($\rho = 2c\cos\varphi$).** Multiplicamos por $\rho$ para armar coordenadas cartesianas: $\rho^2 = 2c\rho\cos\varphi$, o sea $x^2 + y^2 + z^2 = 2cz$. Completando cuadrados, $x^2 + y^2 + (z - c)^2 = c^2$: una esfera de centro $(0, 0, c)$ que pasa por el origen. Multiplicar por $\rho$ solo podría agregar el origen, que ya estaba (con $\varphi = \frac\pi2$). $\blacksquare$`],
      examples: [{ q: R`Pasá el punto $(1, -1, \sqrt6)$ a esféricas.`, steps: [R`$\rho = \sqrt{1 + 1 + 6} = 2\sqrt2$.`, R`$\cos\varphi = \frac{\sqrt6}{2\sqrt2} = \frac{\sqrt3}{2}$, así que $\varphi = \frac\pi6$.`, R`$(x, y) = (1, -1)$ está en el cuarto cuadrante: $\theta = \frac{7\pi}{4}$.`] }],
      tips: [R`Ojo con las convenciones: en muchos libros de física $\theta$ y $\varphi$ están intercambiados. Acá $\varphi$ se mide desde el eje $z$ y $\theta$ es el ángulo de las polares.`, R`$\varphi = \frac\pi4$ es solo la mitad de arriba del cono $z^2 = x^2 + y^2$; la de abajo es $\varphi = \frac{3\pi}{4}$.`],
      see: ["c2-coord-espacio", "c2-polares", "c2-cuadricas"]
    }
  };

  E.extendCourse("m106", {
    concepts: {
      "ga-polares-rectas-circ": { name: "Rectas y circunferencias en polares" }, "ga-conica-polar": { name: "Cónicas en polares" },
      "ga-curvas-polares": { name: "Gráficas polares" }, "ga-cilindricas-esfericas": { name: "Cilíndricas y esféricas" }
    },
    templates: T,
    units: [{
      id: G, order: 5, program: "Unidad 5", title: "Coordenadas polares, cilíndricas y esféricas", icon: "map",
      diagnostic: ["ga-polar-num", "ga-conica-polar-num", "ga-esfericas-num"],
      lessons: [
        { id: "ga-l5-polares", title: "Rectas y circunferencias en polares", templates: ["ga-polar-num", "ga-polar-recta-mc"], theory: ["ga-polares-rectas-circ"],
          intro: R`Una recta es $r\cos(\theta - \alpha) = p$; una circunferencia por el polo, $r = 2a\cos\theta + 2b\sin\theta$.` },
        { id: "ga-l5-conicas", title: "Cónicas en polares", templates: ["ga-conica-polar-num", "ga-conica-polar-mc"], theory: ["ga-conica-polar"],
          intro: R`Con un foco en el polo, $r = \frac{ed}{1 \pm e\cos\theta}$: la excentricidad decide si es elipse, parábola o hipérbola.` },
        { id: "ga-l5-curvas", title: "Gráficas polares", templates: ["ga-curva-polar-num", "ga-curva-polar-match", "ga-simetria-polar-vf"], theory: ["ga-curvas-polares"],
          intro: R`Rosas, caracoles, lemniscatas y espirales: pétalos, lazos, ceros y simetrías.` },
        { id: "ga-l5-espacio", title: "Cilíndricas y esféricas", templates: ["ga-esfericas-num", "ga-sup-coord-mc"], theory: ["ga-cilindricas-esfericas"],
          intro: R`$x = \rho\sin\varphi\cos\theta$, $y = \rho\sin\varphi\sin\theta$, $z = \rho\cos\varphi$, y qué superficie sale al fijar cada coordenada.` }
      ]
    }],
    cards
  });
})();

/* =====================================================================
 *  UNIDAD 6 · ECUACIÓN GENERAL DE SEGUNDO GRADO
 *  Forma matricial y formas cuadráticas, rotación de ejes, teorema de los ejes principales,
 *  identificación de cónicas (autovalores e invariantes) y de cuádricas.
 *  Las cónicas y cuádricas se arman a partir de autovectores enteros ortogonales, así que los
 *  coeficientes son enteros. Verificaciones: autovalores por Jacobi o por el método de la potencia,
 *  rotación numérica con los coeficientes leídos evaluando el polinomio, semiejes optimizando
 *  sobre las direcciones, determinantes por Gauss y formas evaluadas en vectores al azar.
 * ===================================================================== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const T = {};
  const nd = (x, d = 4) => H.num(x, d).replace(".", "{,}");
  const DEG = Math.PI / 180;
  const half = v => H.frac(v, 2);
  const pm = A => `\\begin{pmatrix} ${A.map(r => r.join(" & ")).join(" \\\\ ")} \\end{pmatrix}`;
  const pmh = A => pm(A.map(r => r.map(x => H.frac(Math.round(2 * x), 2)))); // matriz con medios enteros
  const sqrtTex = n => { const q = Math.round(Math.sqrt(n)); return q * q === n ? String(q) : `\\sqrt{${n}}`; };
  const vtex = w => `(${w.join(", ")})`;
  const det3 = M => M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
  const mm = (A, B) => A.map(row => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)));
  const tr = A => A[0].map((_, j) => A.map(row => row[j]));
  const quad = (S, X) => S.reduce((s, row, i) => s + row.reduce((t, a, j) => t + a * X[i] * X[j], 0), 0);

  // autovalores y autovectores de una matriz simétrica por el método de Jacobi (rotaciones planas)
  function jacobi(S) {
    const n = S.length, I = () => S.map((r, i) => r.map((_, j) => (i === j ? 1 : 0)));
    let A = S.map(r => r.slice()), V = I();
    const scale = S.flat().reduce((s, x) => s + x * x, 0) || 1;
    for (let sweep = 0; sweep < 60; sweep++) {
      let off = 0;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += A[i][j] ** 2;
      if (off < 1e-28 * scale) break;
      for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
        if (Math.abs(A[p][q]) < 1e-300) continue;
        const th = (A[q][q] - A[p][p]) / (2 * A[p][q]);
        const t = (th >= 0 ? 1 : -1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
        const J = I(); J[p][p] = c; J[q][q] = c; J[p][q] = s; J[q][p] = -s;
        A = mm(mm(tr(J), A), J); V = mm(V, J);
      }
    }
    return { vals: A.map((r, i) => r[i]), vecs: tr(V) }; // vecs[i] es el autovector de vals[i]
  }
  // mayor autovalor por el método de la potencia (desplazado para que sea el dominante)
  function powerMax(S) {
    const sh = S.flat().reduce((s, x) => s + Math.abs(x), 0) + 1;
    let v = S.map((_, i) => 0.31 + 0.23 * i);
    for (let it = 0; it < 6000; it++) {
      const w = S.map((row, i) => row.reduce((s, a, j) => s + a * v[j], 0) + sh * v[i]), nn = Math.hypot(...w);
      v = w.map(x => x / nn);
    }
    return quad(S, v) / v.reduce((s, x) => s + x * x, 0);
  }
  const powerMin = S => -powerMax(S.map(r => r.map(x => -x)));

  /* ---------- cónicas con coeficientes enteros ---------- */
  // α(w·X − s)²: los ejes de la cónica son las direcciones w = (p, q) y (−q, p)
  const conic = () => ({ A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 });
  function addSq(P, al, p, q, s) { P.A += al * p * p; P.B += 2 * al * p * q; P.C += al * q * q; P.D -= 2 * al * p * s; P.E -= 2 * al * q * s; P.F += al * s * s; }
  function addLin(P, g, p, q, s) { P.D += g * p; P.E += g * q; P.F -= g * s; }
  const eq2 = P => H.poly([[P.A, "x^{2}"], [P.B, "xy"], [P.C, "y^{2}"], [P.D, "x"], [P.E, "y"], [P.F, ""]]) + " = 0";
  const evalP = (P, x, y) => P.A * x * x + P.B * x * y + P.C * y * y + P.D * x + P.E * y + P.F;
  const KINDS2 = ["Elipse", "Hipérbola", "Parábola", "Dos rectas que se cortan", "Dos rectas paralelas", "Un solo punto", "Ningún punto real"];
  const W2 = [[1, 0], [1, 1], [1, -1], [2, 1], [1, 2], [2, -1], [1, -2], [3, 1], [1, 3], [3, -1], [1, -3]];
  // kind: índice de KINDS2. Devuelve la ecuación y los datos de su forma canónica.
  function makeConic(r, kind, noAxis) {
    const [p, q] = r.pick(noAxis ? W2.slice(1) : W2), h = r.int(-3, 3), k = r.int(-3, 3), n = p * p + q * q;
    const s1 = p * h + q * k, s2 = -q * h + p * k, P = conic();
    const a = r.int(1, 3); let b = r.int(1, 3), K = 0;
    if (kind === 0 || kind === 5 || kind === 6) {
      if (b === a) b = a === 3 ? 1 : a + 1;
      K = kind === 0 ? r.int(1, 12) : kind === 5 ? 0 : -r.int(1, 12);
      addSq(P, a, p, q, s1); addSq(P, b, -q, p, s2);
    } else if (kind === 1 || kind === 3) {
      K = kind === 1 ? r.nz(-12, 12) : 0; b = -b;
      addSq(P, a, p, q, s1); addSq(P, b, -q, p, s2);
    } else if (kind === 2) { b = 0; addSq(P, a, p, q, s1); addLin(P, r.nz(-4, 4), -q, p, s2); }
    else { b = 0; K = r.int(1, 12); addSq(P, a, p, q, s1); }
    P.F -= K;
    const sg = r.pick([1, -1]);
    if (sg < 0) for (const key in P) P[key] = -P[key];
    for (const key in P) P[key] += 0; // sin ceros negativos
    return { P, p, q, h, k, n, l1: sg * a * n, l2: sg * b * n, rhs: sg * K };
  }
  // invariantes: d4 = 4δ = 4AC − B², D8 = 8Δ (determinante de la matriz completa por 8)
  const inv2 = P => ({ d4: 4 * P.A * P.C - P.B * P.B, D8: det3([[2 * P.A, P.B, P.D], [P.B, 2 * P.C, P.E], [P.D, P.E, 2 * P.F]]), tr: P.A + P.C });
  const kindFromInv = ({ d4, D8, tr: t }) => (d4 > 0 ? (D8 === 0 ? 5 : D8 * t < 0 ? 0 : 6) : d4 < 0 ? (D8 === 0 ? 3 : 1) : (D8 === 0 ? 4 : 2));
  const Mbar = P => [[P.A, P.B / 2, P.D / 2], [P.B / 2, P.C, P.E / 2], [P.D / 2, P.E / 2, P.F]];
  // clasificación numérica, por otro camino: se giran los ejes, se leen los coeficientes nuevos evaluando
  // el polinomio en puntos de los ejes girados y se completan cuadrados
  function classifyNum(P) {
    const sc = Math.max(1, ...Object.values(P).map(Math.abs)), tol = 1e-9 * sc;
    const th = 0.5 * Math.atan2(P.B, P.A - P.C), c = Math.cos(th), s = Math.sin(th);
    const f = (u, v) => evalP(P, u * c - v * s, u * s + v * c);
    const F0 = f(0, 0), A1 = (f(1, 0) + f(-1, 0)) / 2 - F0, C1 = (f(0, 1) + f(0, -1)) / 2 - F0, D1 = (f(1, 0) - f(-1, 0)) / 2, E1 = (f(0, 1) - f(0, -1)) / 2;
    const B1 = f(1, 1) - A1 - C1 - D1 - E1 - F0;
    if (Math.abs(B1) > tol) return -1;
    const za = Math.abs(A1) < tol, zc = Math.abs(C1) < tol;
    if (!za && !zc) {
      const K = -F0 + D1 * D1 / (4 * A1) + E1 * E1 / (4 * C1);
      if (A1 * C1 > 0) return Math.abs(K) < tol ? 5 : K * A1 > 0 ? 0 : 6;
      return Math.abs(K) < tol ? 3 : 1;
    }
    if (za && zc) return -1;
    const [L, M1, N1] = za ? [C1, E1, D1] : [A1, D1, E1];
    if (Math.abs(N1) > tol) return 2;
    const K = -F0 + M1 * M1 / (4 * L);
    return Math.abs(K) < tol ? 7 : K * L > 0 ? 4 : 6;
  }
  const deltaTex = iv => H.frac(iv.d4, 4), DeltaTex = iv => H.frac(iv.D8, 8);
  const tipoTex = d4 => (d4 > 0 ? "elíptico" : d4 < 0 ? "hiperbólico" : "parabólico");
  function conclText(k, iv) {
    return [`Como $\\Delta = ${DeltaTex(iv)}$ y $A + C = ${iv.tr}$ tienen signos opuestos, es una elipse real.`,
      `Como $\\Delta \\ne 0$, es una hipérbola.`, `Como $\\Delta \\ne 0$, es una parábola.`,
      `Como $\\Delta = 0$, es degenerada: dos rectas que se cortan.`,
      `Como $\\Delta = 0$, es degenerada: en los ejes principales queda $\\lambda x'^2 = k$ con $\\frac{k}{\\lambda} > 0$, o sea dos rectas paralelas.`,
      `Como $\\Delta = 0$, la elipse se reduce a un solo punto, su centro.`,
      `Como $\\Delta = ${DeltaTex(iv)}$ y $A + C = ${iv.tr}$ tienen el mismo signo, no hay puntos reales (elipse imaginaria).`][k];
  }

  /* ---------- Lección 1 · forma matricial y formas cuadráticas ---------- */
  T["ga-matriz-forma-mc"] = {
    type: "mc", concepts: ["ga-forma-cuadratica"], difficulty: 1,
    generate(r) {
      let Q, good, cands, val, vars;
      if (r.bool()) {
        const A = r.int(-6, 6), B = r.nz(-9, 9), C = r.int(-6, 6);
        if (A === C) return null;
        Q = H.poly([[A, "x^{2}"], [B, "xy"], [C, "y^{2}"]]); vars = "(x, y)";
        good = [[A, B / 2], [B / 2, C]];
        cands = [[[A, B], [B, C]], [[C, B / 2], [B / 2, A]], [[A, -B / 2], [-B / 2, C]], [[A, B], [0, C]]];
        val = X => A * X[0] ** 2 + B * X[0] * X[1] + C * X[1] ** 2;
      } else {
        const a = r.int(-5, 5), b = r.int(-5, 5), c = r.int(-5, 5), [d, e, f] = r.distinct(3, -6, 6);
        if (d === 0 || e === 0 || f === 0) return null;
        Q = H.poly([[a, "x^{2}"], [b, "y^{2}"], [c, "z^{2}"], [d, "xy"], [e, "xz"], [f, "yz"]]); vars = "(x, y, z)";
        good = [[a, d / 2, e / 2], [d / 2, b, f / 2], [e / 2, f / 2, c]];
        cands = [[[a, d, e], [d, b, f], [e, f, c]], [[a, d / 2, f / 2], [d / 2, b, e / 2], [f / 2, e / 2, c]], [[a, -d / 2, e / 2], [-d / 2, b, f / 2], [e / 2, f / 2, c]], [[a, d, e], [0, b, f], [0, 0, c]]];
        val = X => a * X[0] ** 2 + b * X[1] ** 2 + c * X[2] ** 2 + d * X[0] * X[1] + e * X[0] * X[2] + f * X[1] * X[2];
      }
      const byTex = new Map([[pmh(good), good], ...cands.map(m => [pmh(m), m])]);
      const mc = H.mc(r, pmh(good), r.shuffle(cands.map(pmh)));
      const shown = mc.options.map(o => o.replace(/^\$\\displaystyle /, "").replace(/\$$/, ""));
      return {
        prompt: `¿Cuál es la matriz **simétrica** $M$ tal que $${Q} = X^tMX$, con $X = ${vars}^t$?`,
        ...mc,
        solution: [`[[ga-forma-cuadratica|Forma cuadrática]]: en la diagonal van los coeficientes de los cuadrados y afuera, en los dos casilleros simétricos, la **mitad** de cada término cruzado.`,
          `$M = ${pmh(good)}$. Las otras opciones no son simétricas o no reproducen la forma (si ponés el coeficiente entero, el término cruzado sale el doble).`],
        // verificación: la opción correcta es simétrica y X^t M X coincide con la forma en vectores al azar; las demás fallan en algo
        verify: { kind: "truth", target: true, fn: () => shown.every((o, i) => {
          const M = byTex.get(o), n = M.length, sym = M.every((row, a) => row.every((x, b) => x === M[b][a]));
          let same = true;
          for (let t = 0; t < 6; t++) { const X = Array.from({ length: n }, (_, j) => Math.sin(1.7 * t + 2.3 * j + 0.4)); if (Math.abs(quad(M, X) - val(X)) > 1e-9) same = false; }
          return (sym && same) === (i === mc.correct);
        }) }
      };
    }
  };
  // bases ortogonales de vectores enteros en R³ (los ejes principales de las cuádricas)
  const B3 = [[[1, 1, 0], [1, -1, 0], [0, 0, 1]], [[1, 0, 1], [1, 0, -1], [0, 1, 0]], [[0, 1, 1], [0, 1, -1], [1, 0, 0]], [[1, 1, 1], [1, -1, 0], [1, 1, -2]],
    [[1, 2, 2], [2, 1, -2], [2, -2, 1]], [[1, 1, -1], [1, 0, 1], [1, -2, -1]], [[2, 1, 0], [1, -2, 0], [0, 0, 1]], [[0, 1, 2], [0, 2, -1], [1, 0, 0]]];
  const n3 = w => w[0] * w[0] + w[1] * w[1] + w[2] * w[2];
  const matFrom = (ws, al) => [0, 1, 2].map(i => [0, 1, 2].map(j => ws.reduce((s, w, l) => s + al[l] * w[i] * w[j], 0)));
  const quad3Tex = M => H.poly([[M[0][0], "x^{2}"], [M[1][1], "y^{2}"], [M[2][2], "z^{2}"], [2 * M[0][1], "xy"], [2 * M[0][2], "xz"], [2 * M[1][2], "yz"]]);
  const DEF = ["definida positiva", "definida negativa", "indefinida"];
  T["ga-definida-vf"] = {
    type: "tf", concepts: ["ga-forma-cuadratica"], difficulty: 2,
    generate(r) {
      let Qtex, cls, S, why;
      if (r.bool()) {
        const A = r.nz(-6, 6), C = r.nz(-6, 6), B = r.int(-8, 8), d4 = 4 * A * C - B * B;
        if (d4 === 0) return null;
        cls = d4 > 0 ? (A > 0 ? 0 : 1) : 2; S = [[A, B / 2], [B / 2, C]];
        Qtex = H.poly([[A, "x^{2}"], [B, "xy"], [C, "y^{2}"]]);
        why = `Su matriz es $M = ${pmh(S)}$, con $\\det M = AC - \\frac{B^2}{4} = ${H.frac(d4, 4)}$. ${d4 > 0 ? `Como es positivo, los dos autovalores tienen el mismo signo, el de $A = ${A}$: es ${DEF[cls]}.` : `Como es negativo, los autovalores tienen signos opuestos: es indefinida.`}`;
      } else {
        const ws = r.pick(B3), al = [r.nz(-3, 3), r.nz(-3, 3), r.nz(-3, 3)];
        S = matFrom(ws, al); Qtex = quad3Tex(S);
        const lam = al.map((a, i) => a * n3(ws[i]));
        cls = lam.every(l => l > 0) ? 0 : lam.every(l => l < 0) ? 1 : 2;
        why = `Su matriz $M = ${pmh(S)}$ tiene autovectores ${ws.map(vtex).map(t => `$${t}$`).join(", ")} (son ortogonales; chequeá $M\\vec w = \\lambda\\vec w$) con autovalores $${lam.join(",\\ ")}$: ${cls === 2 ? "hay de los dos signos, así que es indefinida" : `todos ${cls === 0 ? "positivos" : "negativos"}, así que es ${DEF[cls]}`}.`;
      }
      const claim = r.bool() ? cls : r.pick([0, 1, 2].filter(x => x !== cls));
      return {
        prompt: `<b>Verdadero o falso:</b> la forma cuadrática $Q = ${Qtex}$ es ${DEF[claim]}.`,
        answer: claim === cls,
        explanation: `${why} Más en [[ga-forma-cuadratica|formas cuadráticas]].`,
        solution: [`El signo de una forma cuadrática lo deciden los signos de los [[al-autovalores|autovalores]] de su matriz.`],
        // verificación: autovalores calculados numéricamente con el método de Jacobi
        verify: { kind: "truth", fn: () => { const { vals } = jacobi(S); const got = Math.min(...vals) > 1e-9 ? 0 : Math.max(...vals) < -1e-9 ? 1 : 2; return got === claim; } }
      };
    }
  };

  /* ---------- Lección 2 · rotación de ejes ---------- */
  T["ga-rotacion-num"] = {
    type: "numeric", concepts: ["ga-rotacion-ejes"], difficulty: 2,
    generate(r) {
      const A = r.int(-6, 6), B = r.nz(-8, 8), C = r.int(0, 3) === 0 ? A : r.int(-6, 6), D = r.int(-5, 5), Ee = r.int(-5, 5), F = r.int(-9, 9);
      let two = Math.atan2(B, A - C) / DEG; if (two <= 0) two += 180;
      const ans = two / 2, P = { A, B, C, D, E: Ee, F };
      return {
        prompt: `¿Qué ángulo $\\theta$, con $0^\\circ < \\theta < 90^\\circ$, hay que rotar los ejes para que desaparezca el término en $xy$ de $${eq2(P)}$? Respondé en grados.`,
        answer: ans,
        solution: [`[[ga-rotacion-ejes|Rotación de ejes]]: el término cruzado nuevo es $B' = B\\cos(2\\theta) - (A - C)\\sin(2\\theta)$, que se anula cuando $\\cot(2\\theta) = \\frac{A - C}{B}$. Los términos lineales no influyen.`,
          A === C ? `Acá $A = C$, así que $\\cot(2\\theta) = 0$: $2\\theta = 90^\\circ$ y $\\theta = 45^\\circ$.`
            : `$\\cot(2\\theta) = \\frac{${A - C}}{${B}} \\approx ${nd((A - C) / B)}$. Con $2\\theta$ entre $0^\\circ$ y $180^\\circ$${(A - C) / B < 0 ? " (la cotangente es negativa, así que $2\\theta$ pasa los $90^\\circ$)" : ""}: $2\\theta \\approx ${nd(two)}^\\circ$.`,
          `$\\theta \\approx ${nd(ans)}^\\circ$.`],
        // verificación: se giran los ejes ese ángulo y se mide el término cruzado evaluando la parte cuadrática en los ejes nuevos
        verify: { kind: "zero", tol: 1e-9, fn: deg => {
          const t = deg * DEG, c = Math.cos(t), s = Math.sin(t), Q = (u, v) => { const x = u * c - v * s, y = u * s + v * c; return A * x * x + B * x * y + C * y * y; };
          return [(Q(1, 1) - Q(1, 0) - Q(0, 1)) / (Math.abs(A) + Math.abs(B) + Math.abs(C)), deg > 0 && deg < 90 ? 0 : 1];
        } }
      };
    }
  };
  T["ga-rotacion-order"] = {
    type: "order", concepts: ["ga-ejes-principales"], difficulty: 2,
    generate(r) {
      const [p, q] = r.pick(W2.slice(1)), n = p * p + q * q, a = r.nz(-3, 3), b = r.nz(-3, 3), K = r.nz(-12, 12);
      if (a === b) return null;
      const A = a * p * p + b * q * q, B = 2 * (a - b) * p * q, C = a * q * q + b * p * p, l1 = a * n, l2 = b * n;
      const M = [[A, B / 2], [B / 2, C]];
      return {
        prompt: `Ordená los pasos para llevar $${H.poly([[A, "x^{2}"], [B, "xy"], [C, "y^{2}"]])} = ${K}$ a sus ejes principales.`,
        steps: [
          `Escribimos la matriz de la forma cuadrática: $M = ${pmh(M)}$.`,
          `Planteamos $\\det(M - \\lambda I) = 0$: $${H.poly([[1, "\\lambda^{2}"], [-(A + C), "\\lambda"], [A * C - B * B / 4, ""]])} = 0$, con raíces $\\lambda_1 = ${l1}$ y $\\lambda_2 = ${l2}$.`,
          `Buscamos los autovectores: $${vtex([p, q])}$ para $\\lambda_1$ y $${vtex([-q, p])}$ para $\\lambda_2$, que son ortogonales.`,
          `Los normalizamos y armamos la rotación $P = \\frac{1}{${sqrtTex(n)}}${pm([[p, -q], [q, p]])}$, con $\\det P = 1$.`,
          `Con $X = PX'$ desaparece el término cruzado: $${H.poly([[l1, "x'^{2}"], [l2, "y'^{2}"]])} = ${K}$.`
        ],
        solution: [`[[ga-ejes-principales|Teorema de los ejes principales]]: los autovalores de $M$ son los coeficientes nuevos y los autovectores unitarios, las columnas de la rotación.`],
        // verificación: (λ, v) son autopares de M, y la forma evaluada en X = PX' da la expresión canónica
        verify: { kind: "all", list: [{ kind: "eig", A: M, lambda: l1, v: [p, q] }, { kind: "eig", A: M, lambda: l2, v: [-q, p] },
          { kind: "truth", target: true, fn: () => { for (let t = 0; t < 6; t++) { const u = Math.cos(t + 0.3) * 2, v = Math.sin(1.9 * t), x = (p * u - q * v) / Math.sqrt(n), y = (q * u + p * v) / Math.sqrt(n); if (Math.abs(quad(M, [x, y]) - (l1 * u * u + l2 * v * v)) > 1e-9 * (Math.abs(l1) + Math.abs(l2))) return false; } return true; } }] }
      };
    }
  };

  /* ---------- Lección 3 · ejes principales e identificación de cónicas ---------- */
  // extremo (máximo con sg = 1, mínimo con sg = −1) de g(θ) en [0, π) entre los θ donde ok(θ): grilla y sección áurea
  function extremo(g, ok, sg) {
    let bt = null, bv = -Infinity;
    for (let i = 0; i < 3600; i++) { const t = i * Math.PI / 3600; if (ok(t)) { const v = sg * g(t); if (v > bv) { bv = v; bt = t; } } }
    let a = bt - Math.PI / 3600, b = bt + Math.PI / 3600;
    for (let j = 0; j < 80; j++) { const x1 = a + (b - a) * 0.382, x2 = a + (b - a) * 0.618; if (sg * g(x1) > sg * g(x2)) b = x2; else a = x1; }
    return g((a + b) / 2);
  }
  T["ga-semiejes-num"] = {
    type: "numeric", concepts: ["ga-ejes-principales"], difficulty: 3,
    generate(r) {
      const hyp = r.bool(), c = makeConic(r, hyp ? 1 : 0, true), { P, l1, l2, rhs, h, k } = c;
      const ask = hyp ? r.pick(["vert", "foco"]) : r.pick(["mayor", "menor"]);
      const s1 = rhs / l1, s2 = rhs / l2; // cuadrados de los semiejes (con signo)
      let ans;
      if (!hyp) ans = Math.sqrt(ask === "mayor" ? Math.max(s1, s2) : Math.min(s1, s2));
      else ans = ask === "vert" ? Math.sqrt(Math.max(s1, s2)) : Math.sqrt(Math.abs(s1) + Math.abs(s2));
      const Fc = evalP(P, h, k);
      const canon = `${H.poly([[l1, "x'^{2}"], [l2, "y'^{2}"]])} = ${rhs}`;
      return {
        prompt: `La cónica $${eq2(P)}$ es ${hyp ? "una hipérbola" : "una elipse"}. Calculá ${ask === "mayor" ? "la longitud de su semieje mayor" : ask === "menor" ? "la longitud de su semieje menor" : ask === "vert" ? "la distancia de su centro a cada vértice" : "la distancia de su centro a cada foco"}.`,
        answer: ans,
        solution: [`**Centro:** anulamos las derivadas, $${H.poly([[2 * P.A, "x"], [P.B, "y"], [P.D, ""]])} = 0$ y $${H.poly([[P.B, "x"], [2 * P.C, "y"], [P.E, ""]])} = 0$: el centro es $(${h}, ${k})$, y al trasladar ahí el término independiente pasa a ser $${Fc}$.`,
          `**Ejes principales:** los [[al-autovalores|autovalores]] de $M = ${pmh([[P.A, P.B / 2], [P.B / 2, P.C]])}$ salen de $${H.poly([[1, "\\lambda^{2}"], [-(P.A + P.C), "\\lambda"], [(4 * P.A * P.C - P.B * P.B) / 4, ""]])} = 0$: $\\lambda_1 = ${l1}$, $\\lambda_2 = ${l2}$ ([[ga-ejes-principales|teorema de los ejes principales]]).`,
          `Queda $${canon}$, o sea $\\frac{x'^2}{${H.frac(rhs, l1)}} + \\frac{y'^2}{${H.frac(rhs, l2)}} = 1$.`.replace("+ \\frac{y'^2}{-", "- \\frac{y'^2}{").replace("\\frac{x'^2}{-", "-\\frac{x'^2}{"),
          hyp ? (ask === "vert" ? `El denominador positivo es $a^2 = ${H.frac(rhs, s1 > s2 ? l1 : l2)}$: $a \\approx ${nd(ans)}$.` : `$c^2 = a^2 + b^2 = ${H.frac(Math.abs(rhs), Math.abs(l1))} + ${H.frac(Math.abs(rhs), Math.abs(l2))}$, así que $c \\approx ${nd(ans)}$.`)
            : `El semieje ${ask} es la raíz del denominador ${ask === "mayor" ? "más grande" : "más chico"}: $\\approx ${nd(ans)}$.`],
        // verificación: el centro se busca resolviendo el gradiente y los semiejes, optimizando sobre las direcciones
        verify: { kind: "value", tol: 1e-7, fn: () => {
          const det = 4 * P.A * P.C - P.B * P.B, x0 = (-P.D * 2 * P.C + P.B * P.E) / det, y0 = (-2 * P.A * P.E + P.B * P.D) / det, F0 = evalP(P, x0, y0);
          const Q = t => P.A * Math.cos(t) ** 2 + P.B * Math.cos(t) * Math.sin(t) + P.C * Math.sin(t) ** 2, g = t => -F0 / Q(t);
          const pos = t => g(t) > 0 && isFinite(g(t)), neg = t => g(t) < 0 && isFinite(g(t));
          if (!hyp) return Math.sqrt(extremo(g, pos, ask === "mayor" ? 1 : -1));
          const a2 = extremo(g, pos, -1);
          return ask === "vert" ? Math.sqrt(a2) : Math.sqrt(a2 - extremo(g, neg, 1));
        } }
      };
    }
  };
  T["ga-foco-rotada-num"] = {
    type: "numeric", concepts: ["ga-ejes-principales"], difficulty: 3,
    generate(r) {
      const hyp = r.bool(), cc = makeConic(r, hyp ? 1 : 0, true), { P, p, q, n, l1, l2, rhs, h, k } = cc;
      const s1 = rhs / l1, s2 = rhs / l2;
      if (hyp && s1 * s2 >= 0) return null;
      // eje focal: en la elipse, el del semieje mayor; en la hipérbola, el del cuadrado positivo
      const first = hyp ? s1 > 0 : s1 > s2, u = first ? [p, q] : [-q, p], nu = Math.sqrt(n), dir = u.map(x => x / nu);
      const c = Math.sqrt(hyp ? Math.abs(s1) + Math.abs(s2) : Math.abs(s1 - s2));
      if (Math.abs(dir[0]) < 1e-9 || c < 1e-9) return null;
      const sgn = dir[0] > 0 ? 1 : -1, Fx = h + sgn * c * dir[0], Fy = k + sgn * c * dir[1], ask = r.pick(["x", "y"]), ans = ask === "x" ? Fx : Fy;
      const canon = `${H.poly([[l1, "x'^{2}"], [l2, "y'^{2}"]])} = ${rhs}`;
      return {
        prompt: `La cónica $${eq2(P)}$ es ${hyp ? "una hipérbola" : "una elipse"} con los ejes girados. De sus dos focos, tomá el de mayor abscisa y calculá su ${ask === "x" ? "abscisa" : "ordenada"} en el sistema $xy$.`,
        answer: ans,
        solution: [`**Centro:** se anulan las derivadas parciales, $${H.poly([[2 * P.A, "x"], [P.B, "y"], [P.D, ""]])} = 0$ y $${H.poly([[P.B, "x"], [2 * P.C, "y"], [P.E, ""]])} = 0$: es $(${h}, ${k})$.`,
          `**Ejes principales** ([[ga-ejes-principales|teorema de los ejes principales]]): los autovalores de $M = ${pmh([[P.A, P.B / 2], [P.B / 2, P.C]])}$ son $\\lambda_1 = ${l1}$ y $\\lambda_2 = ${l2}$, con autovectores $${vtex([p, q])}$ y $${vtex([-q, p])}$. En los ejes girados y trasladados queda $${canon}$.`,
          `Los cuadrados de los semiejes son $${H.frac(rhs, l1)}$ y $${H.frac(rhs, l2)}$; ${hyp ? "el positivo marca el eje real" : "el mayor marca el eje focal"}, en la dirección de $${vtex(u)}$. Además $c^2 = ${hyp ? "a^2 + b^2" : "a^2 - b^2"} = ${nd(c * c)}$, así que $c \\approx ${nd(c)}$.`,
          `Los focos son el centro $\\pm\\, c$ por el versor $\\frac{1}{\\sqrt{${n}}}${vtex(u)}$: el de mayor abscisa es $(${nd(Fx)};\\ ${nd(Fy)})$.`],
        // verificación: con los dos focos (el respondido y su simétrico respecto del centro), la suma (elipse) o la diferencia
        // (hipérbola) de las distancias es la misma en todos los puntos de la curva, sacados de la ecuación en x e y
        verify: { kind: "zero", tol: 1e-7, fn: v => {
          const F1 = ask === "x" ? [v, Fy] : [Fx, v], F2 = [2 * h - F1[0], 2 * k - F1[1]], F0 = evalP(P, h, k), vals = [];
          for (let i = 0; i < 48; i++) {
            const t = (i + 0.3) * Math.PI / 24, ct = Math.cos(t), st = Math.sin(t), Q = P.A * ct * ct + P.B * ct * st + P.C * st * st, rr = -F0 / Q;
            if (!(rr > 0)) continue;
            const X = [h + Math.sqrt(rr) * ct, k + Math.sqrt(rr) * st], d1 = Math.hypot(X[0] - F1[0], X[1] - F1[1]), d2 = Math.hypot(X[0] - F2[0], X[1] - F2[1]);
            vals.push(hyp ? Math.abs(d1 - d2) : d1 + d2);
          }
          return vals.length < 6 ? [1] : vals.map(x => x - vals[0]);
        } }
      };
    }
  };

  function invSolution(P, iv, kind) {
    return [`Invariantes ([[ga-identificar-conica|identificación de cónicas]]): $\\delta = AC - \\frac{B^2}{4} = ${deltaTex(iv)}$ y $\\Delta = \\det\\bar M = ${DeltaTex(iv)}$, con $\\bar M = ${pmh(Mbar(P))}$.`,
      `Como $\\delta ${iv.d4 > 0 ? "> 0" : iv.d4 < 0 ? "< 0" : "= 0"}$, es de tipo ${tipoTex(iv.d4)}.`, conclText(kind, iv)];
  }
  T["ga-identificar-conica-mc"] = {
    type: "mc", concepts: ["ga-identificar-conica"], difficulty: 3,
    generate(r) {
      const kind = r.pick([0, 0, 1, 1, 2, 2, 3, 4, 5, 6]), { P } = makeConic(r, kind, r.int(0, 3) > 0), iv = inv2(P);
      return {
        prompt: `¿Qué es el conjunto de los puntos que cumplen $${eq2(P)}$?`,
        ...H.mc(r, KINDS2[kind], r.shuffle(KINDS2.filter((_, i) => i !== kind)), { text: true }),
        solution: invSolution(P, iv, kind),
        // verificación: rotación numérica y completar cuadrados (otro camino que los invariantes); además, los invariantes tienen que dar lo mismo
        verify: { kind: "truth", target: true, fn: () => classifyNum(P) === kind && kindFromInv(iv) === kind }
      };
    }
  };
  T["ga-conica-error"] = {
    type: "error", concepts: ["ga-identificar-conica"], difficulty: 3,
    generate(r) {
      const kind = r.pick([0, 1, 2, 3, 5, 6]), { P } = makeConic(r, kind, true), iv = inv2(P);
      if (P.D === 0 && P.E === 0) return null;
      const M2 = [[P.A, P.B / 2], [P.B / 2, P.C]];
      const step0 = (M, d4) => `La matriz de la parte cuadrática es $M = ${pmh(M)}$, así que $\\delta = \\det M = ${H.frac(d4, 4)}$.`;
      const step1 = (d4, t) => `Como $\\delta ${d4 > 0 ? "> 0" : d4 < 0 ? "< 0" : "= 0"}$, la cónica es de tipo ${t}.`;
      const step2 = (Mb, D8) => `La matriz completa es $\\bar M = ${pmh(Mb)}$, con $\\Delta = \\det\\bar M = ${H.frac(D8, 8)}$.`;
      const ok = [step0(M2, iv.d4), step1(iv.d4, tipoTex(iv.d4)), step2(Mbar(P), iv.D8), conclText(kind, iv)];
      const steps = ok.slice(), err = r.pick(["mat", "tipo", "delta", "concl"]);
      let wrongIndex, fix;
      if (err === "mat") {
        wrongIndex = 0;
        const d4w = 4 * (P.A * P.C - P.B * P.B), ivw = { ...iv, d4: d4w };
        steps[0] = step0([[P.A, P.B], [P.B, P.C]], d4w); steps[1] = step1(d4w, tipoTex(d4w)); steps[3] = conclText(kindFromInv(ivw), ivw);
        fix = `Afuera de la diagonal va la mitad del coeficiente de $xy$, $\\frac{B}{2} = ${half(P.B)}$; entonces $\\delta = ${deltaTex(iv)}$.`;
      } else if (err === "tipo") {
        wrongIndex = 1;
        const fake = iv.d4 > 0 ? -1 : 1, ivw = { ...iv, d4: fake };
        steps[1] = step1(iv.d4, tipoTex(fake)); steps[3] = conclText(kindFromInv(ivw), ivw);
        fix = `El tipo lo da el signo de $\\delta$: positivo, elíptico; negativo, hiperbólico; cero, parabólico. Acá es ${tipoTex(iv.d4)}.`;
      } else if (err === "delta") {
        wrongIndex = 2;
        const D8w = det3([[2 * P.A, P.B, 2 * P.D], [P.B, 2 * P.C, 2 * P.E], [2 * P.D, 2 * P.E, 2 * P.F]]), ivw = { ...iv, D8: D8w };
        steps[2] = step2([[P.A, P.B / 2, P.D], [P.B / 2, P.C, P.E], [P.D, P.E, P.F]], D8w); steps[3] = conclText(kindFromInv(ivw), ivw);
        fix = `En la matriz completa también van las mitades de los coeficientes lineales, $\\frac{D}{2} = ${half(P.D)}$ y $\\frac{E}{2} = ${half(P.E)}$; con eso $\\Delta = ${DeltaTex(iv)}$.`;
      } else {
        wrongIndex = 3;
        steps[3] = [`Como $\\Delta = ${DeltaTex(iv)}$ y $A + C = ${iv.tr}$ tienen signos opuestos, no hay puntos reales.`, `Como $\\Delta \\ne 0$, son dos rectas que se cortan.`,
          `Como $\\Delta \\ne 0$, son dos rectas paralelas.`, `Como $\\delta < 0$, es una hipérbola.`, null, `Como $\\delta > 0$, es una elipse real.`,
          `Como $\\Delta = ${DeltaTex(iv)}$ y $A + C = ${iv.tr}$ tienen el mismo signo, es una elipse real.`][kind];
        fix = `${conclText(kind, iv)} ([[ga-identificar-conica|criterio de los invariantes]])`;
      }
      return {
        prompt: `Alguien identificó la cónica $${eq2(P)}$ con los invariantes. <b>Tocá el primer paso incorrecto.</b>`,
        steps, wrongIndex, fix,
        solution: ok,
        // verificación: determinantes por Gauss y clasificación por rotación numérica
        verify: { kind: "all", list: [{ kind: "det", A: M2, target: iv.d4 / 4 }, { kind: "det", A: Mbar(P), target: iv.D8 / 8 },
          { kind: "truth", target: true, fn: () => classifyNum(P) === kind && kindFromInv(iv) === kind }] }
      };
    }
  };

  /* ---------- Lección 4 · cuádricas ---------- */
  const KINDS3 = ["Elipsoide", "Hiperboloide de una hoja", "Hiperboloide de dos hojas", "Cono", "Paraboloide elíptico", "Paraboloide hiperbólico", "Cilindro elíptico", "Cilindro hiperbólico"];
  // Σ α_i (w_i·X)² + β (w_3·X) = K
  function makeQuadric(r, kind) {
    const ws = r.shuffle(r.pick(B3).slice()), p = () => r.int(1, 3);
    let al, beta = 0, K = 0;
    if (kind === 0) { al = [p(), p(), p()]; K = r.int(1, 12); }
    else if (kind === 1) { al = [p(), p(), -p()]; K = r.int(1, 12); }
    else if (kind === 2) { al = [p(), -p(), -p()]; K = r.int(1, 12); }
    else if (kind === 3) { al = r.bool() ? [p(), p(), -p()] : [p(), -p(), -p()]; }
    else if (kind === 4 || kind === 5) { al = [p(), kind === 4 ? p() : -p(), 0]; beta = r.nz(-3, 3); K = r.int(-6, 6); }
    else { al = [p(), kind === 6 ? p() : -p(), 0]; K = kind === 6 ? r.int(1, 12) : r.nz(-12, 12); }
    const lam = al.map((a, i) => a * n3(ws[i]));
    if (lam[0] === lam[1] && lam[1] === lam[2]) return null; // sería una esfera
    if ((kind === 6) && lam[0] === lam[1]) return null;      // cilindro circular: mejor no
    const sg = r.pick([1, -1]);
    al = al.map(a => sg * a + 0); beta = sg * beta + 0; K = sg * K + 0;
    const M = matFrom(ws, al), lin = ws[2].map(v => beta * v + 0);
    return { ws, al, beta, K, M, lin, lam: al.map((a, i) => a * n3(ws[i])), flip: sg < 0 };
  }
  const quadricTex = q => `${H.poly([[q.M[0][0], "x^{2}"], [q.M[1][1], "y^{2}"], [q.M[2][2], "z^{2}"], [2 * q.M[0][1], "xy"], [2 * q.M[0][2], "xz"], [2 * q.M[1][2], "yz"], [q.lin[0], "x"], [q.lin[1], "y"], [q.lin[2], "z"]])} = ${q.K}`;
  function canonTex(q) {
    let s = H.poly([[q.lam[0], "x'^{2}"], [q.lam[1], "y'^{2}"], [q.lam[2], "z'^{2}"]]);
    if (q.beta) { const n = n3(q.ws[2]), rt = Math.round(Math.sqrt(n)), c = rt * rt === n ? `${Math.abs(q.beta) * rt}` : `${Math.abs(q.beta) === 1 ? "" : Math.abs(q.beta)}\\sqrt{${n}}\\,`; s += ` ${q.beta > 0 ? "+" : "-"} ${c === "1" ? "" : c}z'`; }
    return `${s} = ${q.K}`;
  }
  // clasificación numérica: autovalores y autovectores por Jacobi, término lineal en los ejes nuevos y completar cuadrados
  function classify3(M, lin, K) {
    const { vals, vecs } = jacobi(M), sc = Math.max(1, ...M.flat().map(Math.abs), ...lin.map(Math.abs), Math.abs(K)), tol = 1e-8 * sc;
    const L = vecs.map(v => v.reduce((s, x, i) => s + x * lin[i], 0));
    const nz = vals.map(v => Math.abs(v) > tol);
    let k = K;
    vals.forEach((v, i) => { if (nz[i]) k += L[i] * L[i] / (4 * v); });
    const lams = vals.filter((_, i) => nz[i]);
    if (lams.length === 3) {
      if (Math.abs(k) < tol) return lams.some(l => l > 0) && lams.some(l => l < 0) ? 3 : -1;
      const pos = lams.filter(l => l * k > 0).length;
      return pos === 3 ? 0 : pos === 2 ? 1 : pos === 1 ? 2 : -1;
    }
    if (lams.length === 2) {
      const zi = nz.indexOf(false), same = lams[0] * lams[1] > 0;
      if (Math.abs(L[zi]) > tol) return same ? 4 : 5;
      if (same) return k * lams[0] > tol ? 6 : -1;
      return Math.abs(k) > tol ? 7 : -1;
    }
    return -1;
  }
  function quadricWhy(q, kind) {
    const s = q.flip && kind < 3 ? "Para dejar positivo el término independiente multiplicamos todo por $-1$" : "";
    return [s ? `${s}: quedan ${kind === 0 ? "los tres autovalores positivos" : kind === 1 ? "dos autovalores positivos y uno negativo" : kind === 2 ? "un autovalor positivo y dos negativos" : ""}.` : "",
      [`Los tres autovalores tienen el signo del término independiente: elipsoide.`, `Dos autovalores tienen el signo del término independiente y uno no: hiperboloide de una hoja.`,
        `Un solo autovalor tiene el signo del término independiente: hiperboloide de dos hojas.`, `Los autovalores tienen signos distintos y el término independiente (después de completar cuadrados) es $0$: cono.`,
        `Hay un autovalor nulo y en su dirección queda un término lineal; los otros dos tienen el mismo signo: paraboloide elíptico.`,
        `Hay un autovalor nulo y en su dirección queda un término lineal; los otros dos tienen signos opuestos: paraboloide hiperbólico.`,
        `Hay un autovalor nulo y $z'$ no aparece: es un cilindro sobre la cónica que forman las otras dos variables, una elipse.`,
        `Hay un autovalor nulo y $z'$ no aparece: es un cilindro sobre la cónica que forman las otras dos variables, una hipérbola.`][kind]].filter(Boolean).join(" ");
  }
  T["ga-cuadrica-mc"] = {
    type: "mc", concepts: ["ga-identificar-cuadrica"], difficulty: 3,
    generate(r) {
      const kind = r.int(0, 7), q = makeQuadric(r, kind);
      if (!q) return null;
      return {
        prompt: `¿Qué superficie es $${quadricTex(q)}$?`,
        ...H.mc(r, KINDS3[kind], r.shuffle(KINDS3.filter((_, i) => i !== kind)), { text: true }),
        solution: [`La matriz de la parte cuadrática es $M = ${pmh(q.M)}$ ([[ga-identificar-cuadrica|identificación de cuádricas]]).`,
          `Tiene autovectores ortogonales ${q.ws.map(w => `$${vtex(w)}$`).join(", ")}, con autovalores $${q.lam.join(",\\ ")}$ (chequealo con $M\\vec w = \\lambda\\vec w$).`,
          `En los ejes principales, con $z'$ sobre el último autovector: $${canonTex(q)}$.`, quadricWhy(q, kind)],
        // verificación: autovalores por Jacobi, término lineal llevado a los ejes nuevos y completar cuadrados
        verify: { kind: "truth", target: true, fn: () => classify3(q.M, q.lin, q.K) === kind }
      };
    }
  };
  T["ga-cuadrica-num"] = {
    type: "numeric", concepts: ["ga-identificar-cuadrica", "ga-ejes-principales"], difficulty: 3,
    generate(r) {
      const ell = r.bool(), q = makeQuadric(r, ell ? 0 : r.int(1, 3));
      if (!q) return null;
      const ask = ell ? r.pick(["largo", "corto"]) : r.pick(["max", "min"]);
      const lmax = Math.max(...q.lam), lmin = Math.min(...q.lam);
      const ans = ell ? Math.sqrt(q.K / (ask === "largo" ? (q.K > 0 ? lmin : lmax) : (q.K > 0 ? lmax : lmin))) : ask === "max" ? lmax : lmin;
      return {
        prompt: ell ? `La superficie $${quadricTex(q)}$ es un elipsoide. Calculá la longitud de su semieje más ${ask}.`
          : `Calculá el ${ask === "max" ? "mayor" : "menor"} autovalor de la matriz de la forma cuadrática de $${quadricTex(q)}$.`,
        answer: ans,
        solution: [`$M = ${pmh(q.M)}$ tiene autovectores ortogonales ${q.ws.map(w => `$${vtex(w)}$`).join(", ")}: por ejemplo, $M${vtex(q.ws[0])}^t = ${q.lam[0]}\\,${vtex(q.ws[0])}^t$. Los autovalores son $${q.lam.join(",\\ ")}$ ([[ga-ejes-principales|ejes principales]]).`,
          ell ? `En los ejes principales queda $${canonTex(q)}$, y cada semieje es $\\sqrt{\\frac{${q.K}}{\\lambda}}$: el más ${ask} corresponde al autovalor de módulo más ${ask === "largo" ? "chico" : "grande"}. Da $\\approx ${nd(ans)}$.`
            : `El ${ask === "max" ? "mayor" : "menor"} es $${ans}$. Chequeo: la suma de los autovalores es la traza, $${q.lam.reduce((s, x) => s + x, 0)}$.`],
        // verificación: método de la potencia (con desplazamiento), que no usa los autovectores
        verify: { kind: "value", tol: 1e-7, fn: () => {
          if (!ell) return ask === "max" ? powerMax(q.M) : powerMin(q.M);
          const S = q.K > 0 ? q.M : q.M.map(row => row.map(x => -x)), K = Math.abs(q.K);
          return Math.sqrt(K / (ask === "largo" ? powerMin(S) : powerMax(S)));
        } }
      };
    }
  };

  const G = "ga-segundo-grado-u";
  const cards = {
    "ga-forma-cuadratica": {
      group: G, title: "Formas cuadráticas y forma matricial", aliases: ["forma cuadrática", "formas cuadráticas", "matriz completa de la cónica", "definida positiva", "definida negativa", "forma cuadrática indefinida"], concepts: ["ga-forma-cuadratica"],
      summary: "Ax² + Bxy + Cy² = XᵗMX con M simétrica: A y C en la diagonal, B/2 afuera. La ecuación general es XᵗMX + KX + F = 0. El signo de la forma lo deciden los autovalores de M.",
      def: [R`Una **forma cuadrática** en dos variables es $Q(x, y) = Ax^2 + Bxy + Cy^2$. Se escribe con una única matriz **simétrica**: $$Q = \begin{pmatrix} x & y\end{pmatrix}\begin{pmatrix} A & \frac B2 \\ \frac B2 & C\end{pmatrix}\begin{pmatrix} x \\ y\end{pmatrix} = X^tMX.$$`,
        R`La **ecuación general de segundo grado** $Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0$ queda $X^tMX + KX + F = 0$, con $K = \begin{pmatrix} D & E\end{pmatrix}$. También se usa la **matriz completa** de $3 \times 3$: $$\bar M = \begin{pmatrix} A & \frac B2 & \frac D2 \\ \frac B2 & C & \frac E2 \\ \frac D2 & \frac E2 & F\end{pmatrix}, \qquad \begin{pmatrix} x & y & 1\end{pmatrix}\bar M\begin{pmatrix} x \\ y \\ 1\end{pmatrix} = 0.$$`,
        R`En tres variables, $Q = ax^2 + by^2 + cz^2 + dxy + exz + fyz$ tiene matriz $\begin{pmatrix} a & \frac d2 & \frac e2 \\ \frac d2 & b & \frac f2 \\ \frac e2 & \frac f2 & c\end{pmatrix}$: en la diagonal los cuadrados y afuera la **mitad** de cada término cruzado.`,
        R`$Q$ es **definida positiva** si $Q(X) > 0$ para todo $X \ne 0$, **definida negativa** si $Q(X) < 0$ para todo $X \ne 0$, e **indefinida** si toma valores de los dos signos (las que se anulan en alguna dirección sin cambiar de signo son semidefinidas). Equivale a que los [[al-autovalores|autovalores]] de $M$ sean todos positivos, todos negativos o de signos distintos.`],
      idea: [R`¿Por qué $\frac B2$? En el producto $X^tMX$, el término en $xy$ aparece dos veces, una por cada casillero de afuera de la diagonal. Se podría repartir $B$ de muchas maneras, pero repartirlo en partes iguales da una matriz [[al-matrices|simétrica]], y las simétricas tienen autovalores reales y autovectores ortogonales: eso es lo que después permite girar los ejes.`,
        R`En dos variables hay un criterio rápido: si $\det M = AC - \frac{B^2}{4} > 0$, la forma es definida, con el signo de $A$; si $\det M < 0$, es indefinida.`],
      demo: [R`**Paso 1.** Multiplicamos primero $M$ por el vector: $MX = \begin{pmatrix} Ax + \frac B2 y \\ \frac B2 x + Cy\end{pmatrix}$.`,
        R`**Paso 2.** Ahora el producto escalar con $X$: $X^tMX = x\left(Ax + \frac B2 y\right) + y\left(\frac B2 x + Cy\right) = Ax^2 + \frac B2 xy + \frac B2 xy + Cy^2$. Los dos términos cruzados suman $Bxy$, así que da $Q$.`,
        R`**Paso 3 (es la única simétrica).** Si $S = \begin{pmatrix} p & s \\ s & u\end{pmatrix}$ da la misma forma para todo $(x, y)$, evaluamos en vectores convenientes: $(1, 0)$ da $p = A$, $(0, 1)$ da $u = C$, y $(1, 1)$ da $p + 2s + u = A + B + C$, de donde $s = \frac B2$. Así que $S = M$.`,
        R`**Paso 4 (matriz completa).** Con $(x, y, 1)$ la cuenta es la misma: cada término de afuera de la diagonal aparece dos veces, así que $\frac D2$ en dos casilleros da $Dx$, $\frac E2$ da $Ey$, y el casillero $F$ se multiplica por $1 \cdot 1$.`,
        R`**Paso 5 (criterio con el determinante).** Si $A \ne 0$, [[cuadratica|completamos cuadrados]] en $x$: $$Q = A\left(x + \frac{B}{2A}y\right)^2 + \left(C - \frac{B^2}{4A}\right)y^2 = A\left(x + \frac{B}{2A}y\right)^2 + \frac{\det M}{A}\,y^2.$$ Si $\det M > 0$, los dos coeficientes tienen el signo de $A$ y $Q$ tiene ese signo salvo en $(0, 0)$: es definida. Si $\det M < 0$, tienen signos opuestos; eligiendo $y = 0$ o $x = -\frac{B}{2A}y$ se obtienen valores de cada signo: es indefinida.`,
        R`**Paso 6 (con autovalores).** Por el [[ga-ejes-principales|teorema de los ejes principales]], en otros ejes ortogonales $Q = \lambda_1x'^2 + \lambda_2y'^2$ (o con tres términos en el espacio). Una suma de cuadrados con esos coeficientes es positiva para todo vector no nulo si y solo si todos los $\lambda_i$ son positivos, y lo mismo con el signo negativo. $\blacksquare$`],
      examples: [{ q: R`Escribí la matriz de $Q = 3x^2 - 4xy + 5y^2$ y decidí si es definida.`, steps: [R`$M = \begin{pmatrix} 3 & -2 \\ -2 & 5\end{pmatrix}$: el $-4$ se reparte en dos $-2$.`, R`$\det M = 15 - 4 = 11 > 0$ y $A = 3 > 0$: es definida positiva.`] }],
      tips: [R`Error clásico: poner $B$ entero afuera de la diagonal. Para $2xy$ va $1$ en cada casillero, no $2$.`, R`El criterio del determinante es solo para $2 \times 2$. En el espacio, mirá los signos de los tres autovalores.`],
      see: ["al-matrices", "al-autovalores", "ga-ejes-principales"]
    },
    "ga-rotacion-ejes": {
      group: G, title: "Rotación de ejes", aliases: ["rotación de ejes", "rotación de coordenadas", "término cruzado", "término en xy"], concepts: ["ga-rotacion-ejes"],
      summary: "x = x' cos θ − y' sen θ, y = x' sen θ + y' cos θ. Eligiendo cot 2θ = (A − C)/B desaparece el término x'y'. A + C y B² − 4AC no cambian.",
      def: [R`**Rotar los ejes** un ángulo $\theta$ es usar ejes nuevos $x'$, $y'$, girados $\theta$ en sentido antihorario. Las coordenadas de un mismo punto se relacionan por $$x = x'\cos\theta - y'\sin\theta, \qquad y = x'\sin\theta + y'\cos\theta,$$ o sea $X = RX'$ con $R = \begin{pmatrix}\cos\theta & -\sin\theta \\ \sin\theta & \cos\theta\end{pmatrix}$, que es ortogonal: $R^{-1} = R^t$.`,
        R`Al reemplazar en $Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0$, el coeficiente nuevo del término cruzado es $$B' = B\cos(2\theta) - (A - C)\sin(2\theta).$$ Se anula eligiendo $$\cot(2\theta) = \frac{A - C}{B}$$ ($\theta = 45^\circ$ si $A = C$). Siempre hay una solución con $0^\circ < \theta < 90^\circ$.`,
        R`Se conservan $A + C$, $B^2 - 4AC$ y $F$: son **invariantes** de la rotación.`],
      idea: [R`El término $xy$ aparece porque los ejes de la cónica están inclinados respecto de $x$ e $y$. Rotar es "girar la cabeza" hasta verla derecha: en los ejes nuevos no hay término cruzado y la cónica se reconoce como siempre, completando cuadrados.`,
        R`Los términos lineales no influyen en el ángulo: solo giran con los ejes. Por eso el ángulo depende únicamente de $A$, $B$ y $C$.`],
      demo: [R`**Paso 1 (las fórmulas).** Tomamos un punto a distancia $\rho$ del origen, que en los ejes nuevos forma un ángulo $\alpha$ con el eje $x'$: $x' = \rho\cos\alpha$, $y' = \rho\sin\alpha$. Como el eje $x'$ está girado $\theta$, respecto del eje $x$ el ángulo es $\alpha + \theta$: $x = \rho\cos(\alpha + \theta)$, $y = \rho\sin(\alpha + \theta)$.`,
        R`**Paso 2.** Desarrollamos con las fórmulas del seno y del coseno de una suma ([[identidades-trig]]): $x = \rho\cos\alpha\cos\theta - \rho\sin\alpha\sin\theta = x'\cos\theta - y'\sin\theta$, e $y = \rho\cos\alpha\sin\theta + \rho\sin\alpha\cos\theta = x'\sin\theta + y'\cos\theta$.`,
        R`**Paso 3 (el término cruzado).** Escribimos $c = \cos\theta$, $s = \sin\theta$, reemplazamos en la parte cuadrática y juntamos lo que multiplica a $x'y'$. De $Ax^2 = A(cx' - sy')^2$ sale $-2Acs$; de $Bxy = B(cx' - sy')(sx' + cy')$ sale $B(c^2 - s^2)$; de $Cy^2 = C(sx' + cy')^2$ sale $2Ccs$. En total, $$B' = B(c^2 - s^2) - 2(A - C)cs.$$`,
        R`**Paso 4.** Por las fórmulas del ángulo doble, $c^2 - s^2 = \cos(2\theta)$ y $2cs = \sin(2\theta)$: $B' = B\cos(2\theta) - (A - C)\sin(2\theta)$.`,
        R`**Paso 5 (el ángulo).** Si $B = 0$ no hay nada que rotar. Si $B \ne 0$, pedir $B' = 0$ es $B\cos(2\theta) = (A - C)\sin(2\theta)$; ahí $\sin(2\theta) \ne 0$ (si no, también sería $\cos(2\theta) = 0$, imposible), y dividiendo, $\cot(2\theta) = \frac{A - C}{B}$. La cotangente toma todos los valores reales en $(0, \pi)$: hay un $2\theta$ entre $0^\circ$ y $180^\circ$, o sea un $\theta$ entre $0^\circ$ y $90^\circ$.`,
        R`**Paso 6 (invariantes).** Juntando de la misma manera los términos en $x'^2$ y en $y'^2$: $A' = Ac^2 + Bcs + Cs^2$ y $C' = As^2 - Bcs + Cc^2$. Sumando y usando $c^2 + s^2 = 1$, $A' + C' = A + C$. Además $B^2 - 4AC = -4\det M$, y la matriz nueva es $R^tMR$, cuyo [[al-determinante|determinante]] es $\det R^t\det M\det R = \det M$ porque $\det R = 1$. $\blacksquare$`],
      examples: [{ q: R`Eliminá el término cruzado de $x^2 + 4xy + y^2 = 3$.`, steps: [R`$A = C$, así que $\theta = 45^\circ$ y $c = s = \frac{\sqrt2}{2}$.`, R`$A' = \frac12 + 2 + \frac12 = 3$ y $C' = \frac12 - 2 + \frac12 = -1$ (chequeo: $A' + C' = 2 = A + C$).`, R`Queda $3x'^2 - y'^2 = 3$, o sea $x'^2 - \frac{y'^2}{3} = 1$: una hipérbola con eje focal sobre la recta $y = x$.`] }],
      tips: [R`Para no calcular $\theta$ en grados, alcanza con $\cos\theta$ y $\sin\theta$: de $\cot(2\theta)$ sacá $\cos(2\theta)$ (con el mismo signo que la cotangente) y usá $\cos\theta = \sqrt{\frac{1 + \cos 2\theta}{2}}$, $\sin\theta = \sqrt{\frac{1 - \cos 2\theta}{2}}$.`],
      see: ["ga-forma-cuadratica", "ga-ejes-principales", "identidades-trig"]
    },
    "ga-ejes-principales": {
      group: G, title: "Teorema de los ejes principales", aliases: ["teorema de los ejes principales", "ejes principales"], concepts: ["ga-ejes-principales"],
      summary: "Si M es simétrica, hay una matriz ortogonal P (columnas: autovectores unitarios) con PᵗMP diagonal. Con X = PX', la forma queda λ₁x'² + λ₂y'² (+ λ₃z'²), sin términos cruzados.",
      def: [R`**Teorema.** Si $M$ es simétrica de $n \times n$, existe una matriz ortogonal $P$, cuyas columnas son autovectores unitarios de $M$ ortogonales entre sí, tal que $P^tMP = D$ es diagonal, con los autovalores $\lambda_1, \dots, \lambda_n$ en la diagonal. Con el cambio $X = PX'$, $$X^tMX = \lambda_1x_1'^2 + \dots + \lambda_nx_n'^2.$$ Las rectas por el origen en las direcciones de esos autovectores son los **ejes principales**.`,
        R`Para la ecuación completa, $X^tMX + KX + F = 0$ pasa a $\lambda_1x'^2 + \lambda_2y'^2 + (KP)X' + F = 0$; después se completan cuadrados para sacar los términos lineales.`,
        R`Si $\det P = 1$, el cambio es una [[ga-rotacion-ejes|rotación]]; si da $-1$, alcanza con cambiar el signo de una columna.`],
      idea: [R`Los autovectores son las direcciones en las que la forma "no mezcla" coordenadas: sobre el versor $\vec u$ de un autovector, $Q(t\vec u) = \lambda t^2$. Para la elipse $Q = 1$, los semiejes miden $\frac{1}{\sqrt{\lambda_1}}$ y $\frac{1}{\sqrt{\lambda_2}}$: el autovalor más grande da el semieje más corto.`,
        R`Es la versión matricial de la rotación de ejes, pero sin calcular ángulos, y funciona igual en tres variables, donde girar "a mano" sería un lío.`],
      demo: [R`**Paso 1 (autovalores reales).** Para $M = \begin{pmatrix} a & b \\ b & c\end{pmatrix}$, el polinomio característico es $\lambda^2 - (a + c)\lambda + (ac - b^2)$. Su discriminante es $(a + c)^2 - 4(ac - b^2) = (a - c)^2 + 4b^2 \ge 0$, una suma de cuadrados: las dos raíces son reales.`,
        R`**Paso 2 (autovectores ortogonales).** Sean $M\vec u = \lambda_1\vec u$ y $M\vec v = \lambda_2\vec v$ con $\lambda_1 \ne \lambda_2$. Por un lado, $(M\vec u)\cdot\vec v = \lambda_1\,\vec u\cdot\vec v$. Por otro, como $M$ es simétrica se puede pasar al otro lado del producto escalar: $(M\vec u)\cdot\vec v = \vec u\cdot(M^t\vec v) = \vec u\cdot(M\vec v) = \lambda_2\,\vec u\cdot\vec v$. Restando, $(\lambda_1 - \lambda_2)\,\vec u\cdot\vec v = 0$, y como $\lambda_1 \ne \lambda_2$, $\vec u\cdot\vec v = 0$. (Si $\lambda_1 = \lambda_2$, el discriminante del Paso 1 es $0$, así que $a = c$ y $b = 0$: $M = \lambda I$ y cualquier par de ejes ortogonales sirve).`,
        R`**Paso 3 (la matriz $P$).** Normalizamos $\vec u$ y $\vec v$ y los ponemos como columnas de $P$. Como son unitarios y ortogonales, $P^tP = I$: $P$ es ortogonal. Además, multiplicar $M$ por cada columna da esa columna por su autovalor: $MP = PD$.`,
        R`**Paso 4.** Multiplicando $MP = PD$ a izquierda por $P^t$ y usando $P^tP = I$: $P^tMP = D$.`,
        R`**Paso 5 (la forma).** Con $X = PX'$, $X^t = X'^tP^t$, así que $X^tMX = X'^t(P^tMP)X' = X'^tDX' = \lambda_1x'^2 + \lambda_2y'^2$, y la parte lineal queda $KX = (KP)X'$. En $n$ variables el argumento de los Pasos 2 a 5 es el mismo; lo que hace falta es que siempre haya una base de autovectores ortogonales, que es la [[al-diagonalizacion|diagonalización ortogonal]] de las matrices simétricas. $\blacksquare$`],
      examples: [{ q: R`Llevá $5x^2 - 4xy + 8y^2 = 36$ a ejes principales.`, steps: [R`$M = \begin{pmatrix} 5 & -2 \\ -2 & 8\end{pmatrix}$: $\lambda^2 - 13\lambda + 36 = 0$, así que $\lambda_1 = 4$ y $\lambda_2 = 9$.`, R`Autovectores: $(2, 1)$ para $4$ y $(-1, 2)$ para $9$ (son ortogonales).`, R`$4x'^2 + 9y'^2 = 36$, o sea $\frac{x'^2}{9} + \frac{y'^2}{4} = 1$: una elipse de semiejes $3$ (en la dirección $(2, 1)$) y $2$.`] }],
      tips: [R`Chequeo rápido: $\lambda_1 + \lambda_2 = A + C$ (la traza) y $\lambda_1\lambda_2 = \det M$.`, R`Si $\lambda_1 = \lambda_2$, la forma ya es $\lambda(x^2 + y^2)$: es una circunferencia y cualquier par de ejes ortogonales sirve.`],
      see: ["al-diagonalizacion", "al-autovalores", "ga-rotacion-ejes", "ga-forma-cuadratica"]
    },
    "ga-identificar-conica": {
      group: G, title: "Identificación de cónicas: autovalores e invariantes", aliases: ["invariantes de una cónica", "discriminante de una cónica", "cónica degenerada", "cónicas degeneradas"], concepts: ["ga-identificar-conica"],
      summary: "Con δ = AC − B²/4 = det M y Δ = det de la matriz completa: δ > 0 es de tipo elíptico, δ < 0 hiperbólico y δ = 0 parabólico; Δ = 0 indica que la cónica es degenerada.",
      def: [R`Para $Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0$ se usan dos invariantes: $\delta = \det M = AC - \frac{B^2}{4}$ (es lo mismo que mirar el signo de $B^2 - 4AC = -4\delta$) y $\Delta = \det\bar M$, el determinante de la [[ga-forma-cuadratica|matriz completa]].`,
        R`**Tipo elíptico** ($\delta > 0$, autovalores del mismo signo): elipse real si $\Delta$ y $A + C$ tienen signos opuestos; un solo punto si $\Delta = 0$; ningún punto real (elipse imaginaria) si $\Delta$ y $A + C$ tienen el mismo signo.`,
        R`**Tipo hiperbólico** ($\delta < 0$, autovalores de signos opuestos): hipérbola si $\Delta \ne 0$; dos rectas que se cortan si $\Delta = 0$.`,
        R`**Tipo parabólico** ($\delta = 0$, un autovalor nulo): parábola si $\Delta \ne 0$; si $\Delta = 0$, dos rectas paralelas, una recta doble o ningún punto.`],
      idea: [R`La parte cuadrática decide cómo se ve la curva **de lejos**: cerrada, con dos asíntotas o abierta en una sola dirección. Eso es $\delta$, el producto de los autovalores. $\Delta$ dice si la curva es "de verdad" o se degeneró: si $\Delta = 0$, la ecuación se factoriza en rectas o se reduce a un punto.`],
      demo: [R`**Paso 1 (son invariantes).** Un cambio de ejes ortogonal $X = PX'$ con $\det P = 1$ cambia $M$ por $P^tMP$, que tiene el mismo determinante: $\delta$ no cambia. Una rotación seguida de una traslación se escribe en coordenadas $(x, y, 1)$ como una matriz $S = \begin{pmatrix} P & \vec c \\ 0 & 1\end{pmatrix}$ con $\det S = \det P = 1$, y la matriz completa pasa a $S^t\bar MS$: tampoco cambia $\Delta$.`,
        R`**Paso 2 (con centro, $\delta \ne 0$).** Con los [[ga-ejes-principales|ejes principales]] y el origen en el centro, la ecuación es $\lambda_1x'^2 + \lambda_2y'^2 + F' = 0$, cuya matriz completa es diagonal, con $\lambda_1, \lambda_2, F'$. Entonces $\delta = \lambda_1\lambda_2$ y $\Delta = \lambda_1\lambda_2F'$, o sea $F' = \frac{\Delta}{\delta}$.`,
        R`**Paso 3 (tipo elíptico).** Si $\delta > 0$, los autovalores tienen el mismo signo, que es el de su suma $\lambda_1 + \lambda_2 = A + C$. La ecuación $\lambda_1x'^2 + \lambda_2y'^2 = -F'$ tiene puntos (una elipse) si $-F'$ tiene ese mismo signo, es decir si $F' = \frac\Delta\delta$, que tiene el signo de $\Delta$, es de signo opuesto a $A + C$. Si $\Delta = 0$, solo la cumple el centro; si no, no la cumple nadie.`,
        R`**Paso 4 (tipo hiperbólico).** Si $\delta < 0$, los autovalores tienen signos opuestos y $\lambda_1x'^2 + \lambda_2y'^2 = -F'$ es una hipérbola cuando $F' \ne 0$, o sea cuando $\Delta \ne 0$. Si $\Delta = 0$, la ecuación se factoriza como $\left(\sqrt{|\lambda_1|}\,x' - \sqrt{|\lambda_2|}\,y'\right)\left(\sqrt{|\lambda_1|}\,x' + \sqrt{|\lambda_2|}\,y'\right) = 0$: dos rectas que se cortan en el centro.`,
        R`**Paso 5 (tipo parabólico).** Si $\delta = 0$, un autovalor es nulo, digamos $\lambda_2$. Girando y trasladando en $x'$ queda $\lambda_1x'^2 + E'y' + F'' = 0$, con matriz completa $\begin{pmatrix} \lambda_1 & 0 & 0 \\ 0 & 0 & \frac{E'}{2} \\ 0 & \frac{E'}{2} & F''\end{pmatrix}$, de determinante $-\frac{\lambda_1E'^2}{4}$. Así que $\Delta \ne 0$ exactamente cuando $E' \ne 0$, que es la parábola. Si $E' = 0$, queda $\lambda_1x'^2 = -F''$: dos rectas paralelas, una doble o nada. $\blacksquare$`],
      examples: [{ q: R`Identificá $x^2 + 2xy + y^2 - 4x + 4y = 0$.`, steps: [R`$\delta = 1\cdot 1 - 1 = 0$: tipo parabólico.`, R`$\Delta = \det\begin{pmatrix} 1 & 1 & -2 \\ 1 & 1 & 2 \\ -2 & 2 & 0\end{pmatrix} = -16 \ne 0$: es una parábola.`] },
        { q: R`Identificá $x^2 - y^2 + 2y - 1 = 0$.`, steps: [R`$\delta = -1 < 0$: tipo hiperbólico.`, R`$\Delta = \det\begin{pmatrix} 1 & 0 & 0 \\ 0 & -1 & 1 \\ 0 & 1 & -1\end{pmatrix} = 0$: degenerada. En efecto, $x^2 - (y - 1)^2 = 0$ son las rectas $y = 1 \pm x$.`] }],
      tips: [R`Antes de las cuentas largas, mirá $\delta$: te dice si buscás una elipse, una hipérbola o una parábola. $\Delta$ solo sirve para saber si se degeneró.`, R`$A + C$ y $\delta$ también dan los autovalores: son las raíces de $\lambda^2 - (A + C)\lambda + \delta = 0$.`],
      see: ["ga-ejes-principales", "al-determinante", "c2-conicas"]
    },
    "ga-identificar-cuadrica": {
      group: G, title: "Identificación de cuádricas", aliases: ["identificación de cuádricas", "cuádrica degenerada", "cuádricas degeneradas"], concepts: ["ga-identificar-cuadrica"],
      summary: "Se diagonaliza la matriz 3×3 de la parte cuadrática: los signos de los autovalores, junto con el término independiente o lineal que queda, dicen si es elipsoide, hiperboloide, cono, paraboloide o cilindro.",
      def: [R`La ecuación $X^tMX + KX + F = 0$ en el espacio, con $M$ simétrica de $3 \times 3$, se lleva a [[ga-ejes-principales|ejes principales]] con $X = PX'$ y después se completan cuadrados. Con autovalores $\lambda_1, \lambda_2, \lambda_3$:`,
        R`**Los tres no nulos** (hay centro): queda $\lambda_1x'^2 + \lambda_2y'^2 + \lambda_3z'^2 = k$. Con $k > 0$, es un **elipsoide** si los tres son positivos, un **hiperboloide de una hoja** si dos son positivos y uno negativo, y un **hiperboloide de dos hojas** si uno es positivo y dos negativos. Con $k = 0$ y signos distintos, es un **cono**.`,
        R`**Un autovalor nulo**, $\lambda_3 = 0$: si queda un término lineal en $z'$, $\lambda_1x'^2 + \lambda_2y'^2 = cz'$ es un **paraboloide elíptico** ($\lambda_1\lambda_2 > 0$) o **hiperbólico** ($\lambda_1\lambda_2 < 0$); si no queda, $z'$ no aparece y es un **cilindro** elíptico o hiperbólico (o algo degenerado).`,
        R`**Dos autovalores nulos:** un cilindro parabólico, o planos.`],
      idea: [R`Es lo mismo que con las cónicas, con un eje más. Los signos de los autovalores dicen cómo se ve la superficie de lejos: si todos coinciden con el de $k$, es cerrada (elipsoide); cada signo distinto la abre en una dirección. Para no confundir los hiperboloides: con $k > 0$, la cantidad de hojas es la cantidad de autovalores negativos.`],
      demo: [R`**Paso 1 (ejes principales).** Por el teorema de los ejes principales hay una $P$ ortogonal con $P^tMP$ diagonal. Con $X = PX'$, la ecuación queda $\lambda_1x'^2 + \lambda_2y'^2 + \lambda_3z'^2 + (KP)X' + F = 0$: sin términos cruzados.`,
        R`**Paso 2 (completar cuadrados).** Para cada $\lambda_i \ne 0$, $\lambda_ix'^2 + k_ix' = \lambda_i\left(x' + \frac{k_i}{2\lambda_i}\right)^2 - \frac{k_i^2}{4\lambda_i}$: trasladando esa coordenada desaparece el término lineal y el número que sobra se suma al término independiente. Si $\lambda_i = 0$, el término lineal no se puede absorber así.`,
        R`**Paso 3 (con centro).** Si los tres son no nulos, queda $\lambda_1X^2 + \lambda_2Y^2 + \lambda_3Z^2 = k$. Con $k > 0$, dividimos por $k$: cada cuadrado queda dividido por $\frac{k}{\lambda_i}$, con signo $+$ si $\lambda_i > 0$ y $-$ si $\lambda_i < 0$. Son las formas canónicas de las [[c2-cuadricas|cuádricas]]: $+++$ elipsoide, $++-$ una hoja, $+--$ dos hojas. (Si $k < 0$, se multiplica todo por $-1$). Con $k = 0$ la ecuación es homogénea: si $X$ la cumple, $tX$ también, así que la superficie está hecha de rectas por el centro, un cono, salvo que los tres signos coincidan y solo quede el centro.`,
        R`**Paso 4 (sin centro).** Si $\lambda_3 = 0$ y queda un término $cz'$ con $c \ne 0$, trasladamos $z'$ para absorber la constante: $\lambda_1X^2 + \lambda_2Y^2 + cZ = 0$. Los cortes $Z = $ constante son elipses si $\lambda_1\lambda_2 > 0$ (paraboloide elíptico) e hipérbolas si $\lambda_1\lambda_2 < 0$ (paraboloide hiperbólico). Si $c = 0$, la ecuación no depende de $Z$: todos los cortes son la misma cónica $\lambda_1X^2 + \lambda_2Y^2 = k$, y es un cilindro sobre ella. $\blacksquare$`],
      examples: [{ q: R`Identificá $2xy + z^2 = 1$.`, steps: [R`$M = \begin{pmatrix} 0 & 1 & 0 \\ 1 & 0 & 0 \\ 0 & 0 & 1\end{pmatrix}$. El bloque de $x, y$ tiene autovalores $1$ y $-1$ (autovectores $(1, 1, 0)$ y $(1, -1, 0)$), y $(0, 0, 1)$ da otro $1$.`, R`En ejes principales: $x'^2 - y'^2 + z'^2 = 1$. Con $k = 1 > 0$ hay un solo autovalor negativo: hiperboloide de una hoja.`] }],
      tips: [R`Chequeos útiles: $\lambda_1 + \lambda_2 + \lambda_3$ es la traza de $M$ y $\lambda_1\lambda_2\lambda_3 = \det M$. Si $\det M = 0$ hay un autovalor nulo: buscá un paraboloide o un cilindro.`],
      see: ["ga-ejes-principales", "c2-cuadricas", "ga-identificar-conica"]
    }
  };

  E.extendCourse("m106", {
    concepts: {
      "ga-forma-cuadratica": { name: "Formas cuadráticas" }, "ga-rotacion-ejes": { name: "Rotación de ejes" }, "ga-ejes-principales": { name: "Ejes principales" },
      "ga-identificar-conica": { name: "Identificación de cónicas" }, "ga-identificar-cuadrica": { name: "Identificación de cuádricas" }
    },
    templates: T,
    units: [{
      id: G, order: 6, program: "Unidad 6", title: "Ecuación general de segundo grado", icon: "zap",
      diagnostic: ["ga-rotacion-num", "ga-identificar-conica-mc", "ga-cuadrica-mc"],
      lessons: [
        { id: "ga-l6-matricial", title: "Forma matricial y formas cuadráticas", templates: ["ga-matriz-forma-mc", "ga-definida-vf"], theory: ["ga-forma-cuadratica"],
          intro: R`$Ax^2 + Bxy + Cy^2 = X^tMX$, con $\frac B2$ afuera de la diagonal. Los autovalores de $M$ dicen su signo.` },
        { id: "ga-l6-rotacion", title: "Rotación de ejes", templates: ["ga-rotacion-num", "ga-rotacion-order"], theory: ["ga-rotacion-ejes", "ga-ejes-principales"],
          intro: R`Girando los ejes un ángulo con $\cot(2\theta) = \frac{A - C}{B}$, o con los autovectores de $M$, desaparece el término en $xy$.` },
        { id: "ga-l6-conicas", title: "Identificación de cónicas", templates: ["ga-semiejes-num", "ga-identificar-conica-mc", "ga-conica-error", "ga-foco-rotada-num"], theory: ["ga-ejes-principales", "ga-identificar-conica"],
          intro: R`Centro, ejes principales y forma canónica; y para clasificar rápido, los invariantes $\delta$ y $\Delta$.` },
        { id: "ga-l6-cuadricas", title: "Identificación de cuádricas", templates: ["ga-cuadrica-mc", "ga-cuadrica-num"], theory: ["ga-identificar-cuadrica"],
          intro: R`Lo mismo en el espacio: autovalores de una matriz de $3 \times 3$ y lo que queda después de completar cuadrados.` }
      ]
    }],
    cards
  });
})();

