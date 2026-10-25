// Pizarra de efecen: una hoja para hacer cuentas con lápiz (pensada para tablets).
// El motor es el de la pizarra del usuario (jsantiago00/pizarra, que a su vez viene de Notillas), pasado a JS sin build:
// - Trazo con perfect-freehand (presión real con lápiz, simulada por velocidad con dedo o mouse), resaltador y formas.
// - Goma por trazo o por área, lazo para mover, escalar, duplicar, recolorear y borrar.
// - Texto con teclado, fórmulas escritas como en la calculadora (AsciiMath → TeX → MathJax en SVG), ejes con funciones y recta numérica.
// - El lápiz dibuja; el dedo mueve la hoja (con dos dedos, zoom; un toque con dos dedos deshace). Rechaza la palma.
// - Los trazos se guardan en IndexedDB (no en localStorage, para no competir con el progreso).
// - En una sesión, cada ejercicio tiene su hoja. Con la tablet acostada se acomoda a la derecha del ejercicio.
// Se carga antes del script de la app; la app la usa a través de E.board.
(function () {
  "use strict";
  const E = window.Efecen = window.Efecen || {};
  const PAGE_W = 1000;                 // ancho de la hoja en unidades lógicas (el alto es infinito)
  const MAX_PAGES = 80;
  const SIZES = { pen: [2.5, 4, 7], hl: [16, 26, 38], eraser: [8, 16, 30] };
  const COLORS = {                     // [tema claro, tema oscuro]
    ink: ["#1E1B3A", "#F0EFFF"], blue: ["#2563EB", "#7AA2FF"], red: ["#DC2626", "#FF7B7B"],
    green: ["#15803D", "#4ADE80"], violet: ["#5B4BDB", "#B3A9FA"], yellow: ["#F5C400", "#FFD84D"]
  };
  const COLOR_LABEL = { ink: "negro", blue: "azul", red: "rojo", green: "verde", violet: "violeta", yellow: "amarillo" };
  const PAPERS = ["grid", "lines", "dots", "blank"];
  const PAPER_LABEL = { grid: "Cuadriculada", lines: "Rayada", dots: "Punteada", blank: "Lisa" };
  // tamaños de letra del texto y las fórmulas (la hoja mide 1000 de ancho)
  const TEXT_SIZES = [{ label: "Chica", v: 22 }, { label: "Mediana", v: 32 }, { label: "Grande", v: 48 }, { label: "Enorme", v: 72 }];
  const HL_ALPHA = 0.38, LASSO_FRACTION = 0.6, FIGURE_LINE = 2.5, PAD = 0.25, LINE_H = 1.25;
  const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  const CURVE_COLORS = ["#2563EB", "#DC2626", "#15803D", "#7B3FC4", "#D9822B"];

  // ---------- geometría (sin DOM; la usan los tests) ----------
  // Un trazo de tinta es { c: color, w: grosor, h: 1 si es resaltador, m: 1 si la presión es simulada, p: [x, y, presión, …] }.
  // Un objeto es { c, w, o: { k: "text" | "math" | "axes" | "line", … }, p: el contorno de su caja (5 puntos) }:
  // así el lazo lo mueve y lo escala, y la goma lo borra, igual que a un trazo. En el texto y las fórmulas, w es el tamaño de letra.
  const radiusAt = (s, i) => (s.h ? s.w : s.w * (0.45 + 0.85 * s.p[i * 3 + 2])) / 2;
  function bbox(s) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, r = 0;
    for (let i = 0; i < s.p.length; i += 3) {
      x0 = Math.min(x0, s.p[i]); x1 = Math.max(x1, s.p[i]); y0 = Math.min(y0, s.p[i + 1]); y1 = Math.max(y1, s.p[i + 1]);
      if (!s.o) r = Math.max(r, radiusAt(s, i / 3));
    }
    return { x0: x0 - r, y0: y0 - r, x1: x1 + r, y1: y1 + r };
  }
  const bbOf = s => s._bb || (s._bb = bbox(s));
  function segDist(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    const t = L ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L)) : 0;
    return Math.hypot(px - ax - t * dx, py - ay - t * dy);
  }
  // ¿el borrador de radio r centrado en (x, y) toca el trazo? (a un objeto, si toca su caja)
  function hits(s, x, y, r) {
    const b = bbOf(s);
    if (x < b.x0 - r || x > b.x1 + r || y < b.y0 - r || y > b.y1 + r) return false;
    if (s.o) return true;
    const P = s.p, n = P.length / 3;
    if (n === 1) return Math.hypot(x - P[0], y - P[1]) <= r + radiusAt(s, 0);
    for (let i = 0; i < n - 1; i++) {
      const rr = r + Math.max(radiusAt(s, i), radiusAt(s, i + 1));
      if (segDist(x, y, P[i * 3], P[i * 3 + 1], P[i * 3 + 3], P[i * 3 + 4]) <= rr) return true;
    }
    return false;
  }
  // punto dentro de un polígono (lista plana x, y), por paridad de cruces
  function pointInPolygon(x, y, poly) {
    let inside = false;
    const n = poly.length / 2;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = poly[2 * i], yi = poly[2 * i + 1], xj = poly[2 * j], yj = poly[2 * j + 1];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  // fracción de los puntos del trazo que caen dentro del lazo
  function fractionInside(pts, poly) {
    const n = Math.floor(pts.length / 3);
    if (!n || poly.length < 6) return 0;
    let k = 0;
    for (let i = 0; i < n; i++) if (pointInPolygon(pts[3 * i], pts[3 * i + 1], poly)) k++;
    return k / n;
  }
  // goma por área: saca los puntos dentro del círculo y devuelve los tramos que sobreviven (o null si no lo toca).
  // Los segmentos largos se subdividen para que el corte sea preciso aunque haya pocos puntos.
  function cutPolyline(pts, cx, cy, r) {
    const n = Math.floor(pts.length / 3), step = Math.max(0.5, r / 3), dense = [];
    for (let i = 0; i < n; i++) {
      if (i > 0) {
        const ax = pts[3 * i - 3], ay = pts[3 * i - 2], ap = pts[3 * i - 1], bx = pts[3 * i], by = pts[3 * i + 1], bp = pts[3 * i + 2];
        const k = Math.ceil(Math.hypot(bx - ax, by - ay) / step);
        for (let j = 1; j < k; j++) { const t = j / k; dense.push(ax + (bx - ax) * t, ay + (by - ay) * t, ap + (bp - ap) * t); }
      }
      dense.push(pts[3 * i], pts[3 * i + 1], pts[3 * i + 2]);
    }
    const pieces = [];
    let cur = [], hit = false;
    for (let i = 0; i < dense.length; i += 3) {
      if (Math.hypot(dense[i] - cx, dense[i + 1] - cy) <= r) { hit = true; if (cur.length) pieces.push(cur); cur = []; }
      else cur.push(dense[i], dense[i + 1], dense[i + 2]);
    }
    if (!hit) return null;
    if (cur.length) pieces.push(cur);
    return pieces.filter(p => p.length >= 6);   // un tramo de un solo punto no se ve como trazo
  }
  // escala uniforme k desde (ox, oy) y traslación (dx, dy)
  function transformPts(pts, k, ox, oy, dx, dy) {
    const out = pts.slice();
    for (let i = 0; i + 1 < out.length; i += 3) { out[i] = ox + (out[i] - ox) * k + dx; out[i + 1] = oy + (out[i + 1] - oy) * k + dy; }
    return out;
  }
  const rectPts = (x0, y0, x1, y1) => [x0, y0, 1, x1, y0, 1, x1, y1, 1, x0, y1, 1, x0, y0, 1];
  // copia limpia de un trazo (sin cachés), con cambios
  const cloneStroke = (s, patch) => { const c = Object.assign({}, s, patch); delete c._bb; delete c._path; delete c._pk; return c; };

  // ---------- contorno del trazo (perfect-freehand) ----------
  // Con lápiz se usa la presión real; con mouse o dedo, se simula por velocidad. El resaltador tiene ancho fijo y puntas planas.
  function fhOptions(s, last) {
    if (s.h) return { size: s.w, thinning: 0, smoothing: 0.5, streamline: 0.5, simulatePressure: false, start: { cap: false }, end: { cap: false }, last };
    const sim = !!s.m;
    return { size: s.w * 0.9, thinning: sim ? 0.5 : 0.6, smoothing: 0.5, streamline: sim ? 0.5 : 0.35, simulatePressure: sim, start: { cap: true, taper: 0 }, end: { cap: true, taper: 0 }, last };
  }
  function triples(p, extra) {
    const out = [];
    for (let i = 0; i + 2 < p.length; i += 3) out.push([p[i], p[i + 1], p[i + 2]]);
    if (extra) for (let i = 0; i + 2 < extra.length; i += 3) out.push([extra[i], extra[i + 1], extra[i + 2]]);
    return out;
  }
  // polígono suavizado con curvas cuadráticas entre puntos medios
  function traceOutline(path, o) {
    const n = o.length;
    if (n < 2) return path;
    path.moveTo(o[0][0], o[0][1]);
    for (let i = 0; i < n; i++) { const a = o[i], b = o[(i + 1) % n]; path.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); }
    path.closePath();
    return path;
  }
  // respaldo sin perfect-freehand: un círculo por punto y un cuadrilátero entre vecinos (unión con la regla nonzero)
  function legacyPath(s, path = new Path2D()) {
    const P = s.p, n = P.length / 3;
    for (let i = 0; i < n; i++) {
      const x = P[i * 3], y = P[i * 3 + 1], r = radiusAt(s, i);
      path.moveTo(x + r, y); path.arc(x, y, r, 0, Math.PI * 2);
      if (!i) continue;
      const ax = P[i * 3 - 3], ay = P[i * 3 - 2], dx = x - ax, dy = y - ay, L = Math.hypot(dx, dy);
      if (L < 1e-6) continue;
      const nx = -dy / L, ny = dx / L, r0 = radiusAt(s, i - 1);
      const q = [[ax + nx * r0, ay + ny * r0], [x + nx * r, y + ny * r], [x - nx * r, y - ny * r], [ax - nx * r0, ay - ny * r0]];
      let area = 0;
      for (let k = 0; k < 4; k++) { const [x0, y0] = q[k], [x1, y1] = q[(k + 1) % 4]; area += x0 * y1 - x1 * y0; }
      if (area < 0) q.reverse();
      path.moveTo(q[0][0], q[0][1]); path.lineTo(q[1][0], q[1][1]); path.lineTo(q[2][0], q[2][1]); path.lineTo(q[3][0], q[3][1]); path.closePath();
    }
    return path;
  }
  // Path2D de un trazo: confirmado (se calcula una vez) o en curso (con los puntos predichos, sin guardar)
  function inkPath(s, live, predicted) {
    const PF = window.PerfectFreehand;
    if (!PF) return legacyPath(s);
    return traceOutline(new Path2D(), PF.getStroke(triples(s.p, predicted), fhOptions(s, !live)));
  }
  const strokePath = s => s._path || (s._path = inkPath(s, false));

  // ---------- historial de una hoja (deshacer / rehacer) ----------
  // add / del / clear, y rep: reemplaza unos trazos por otros en el mismo lugar (goma por área, mover, escalar, editar un objeto)
  function apply(page, act, undo) {
    const S = page.s;
    if (act.a === "add") { if (undo) S.splice(S.lastIndexOf(act.s), 1); else S.push(act.s); }
    else if (act.a === "del") {
      if (undo) for (const [i, s] of act.list) S.splice(i, 0, s);           // list va en orden creciente de índice
      else for (const [, s] of [...act.list].reverse()) S.splice(S.indexOf(s), 1);
    } else if (act.a === "clear") { if (undo) S.push(...act.list); else S.length = 0; }
    else if (act.a === "rep") {
      if (!undo) {
        const idx = act.rem.map(s => S.indexOf(s)).filter(i => i >= 0).sort((a, b) => a - b);
        act._at = idx.map(i => [i, S[i]]);
        for (let k = idx.length - 1; k >= 0; k--) S.splice(idx[k], 1);
        const at = idx.length ? Math.min(idx[0], S.length) : S.length;
        S.splice(at, 0, ...act.add);
      } else {
        for (const s of act.add) { const i = S.indexOf(s); if (i >= 0) S.splice(i, 1); }
        for (const [i, s] of act._at || []) S.splice(i, 0, s);
      }
    } else if (act.a === "seq") {
      if (undo) for (const x of [...act.acts].reverse()) apply(page, x, true);
      else for (const x of act.acts) apply(page, x, false);
    }
  }
  function doAct(page, act) { apply(page, act, false); (page._undo || (page._undo = [])).push(act); page._redo = []; }
  function undo(page) { const a = page._undo && page._undo.pop(); if (!a) return false; apply(page, a, true); (page._redo || (page._redo = [])).push(a); return true; }
  function redo(page) { const a = page._redo && page._redo.pop(); if (!a) return false; apply(page, a, false); page._undo.push(a); return true; }
  // las acciones compuestas (seq) se deshacen y rehacen enteras con apply
  const undoAny = undo, redoAny = redo;
  // borra con el borrador en (x, y): devuelve la acción (o null si no tocó nada)
  function eraseAt(page, x, y, r) {
    const list = [];
    page.s.forEach((s, i) => { if (hits(s, x, y, r)) list.push([i, s]); });
    if (!list.length) return null;
    const act = { a: "del", list };
    apply(page, act, false);
    return act;
  }
  // goma por área: recorta los trazos que toca (los objetos se borran enteros)
  function eraseArea(page, x, y, r) {
    const rem = [], add = [];
    for (const s of page.s) {
      const b = bbOf(s);
      if (x < b.x0 - r || x > b.x1 + r || y < b.y0 - r || y > b.y1 + r) continue;
      if (s.o) { if (hits(s, x, y, r)) rem.push(s); continue; }
      const pieces = cutPolyline(s.p, x, y, r + (s.h ? s.w / 2 : s.w * 0.4));
      if (!pieces) continue;
      rem.push(s);
      for (const p of pieces) add.push(cloneStroke(s, { p }));
    }
    if (!rem.length) return null;
    const act = { a: "rep", rem, add };
    apply(page, act, false);
    return act;
  }
  // para guardar: sin los cachés (_path, _bb) y con los números redondeados
  const round = (v, d) => Math.round(v * d) / d;
  function packStroke(s) {
    const p = s.p.map((v, i) => round(v, i % 3 === 2 ? 100 : 10));
    if (s.o) return { c: s.c, w: round(s.w, 10), o: s.o, p };
    const out = { c: s.c, w: s.w, h: s.h ? 1 : 0 };
    if (s.m) out.m = 1;
    out.p = p;
    return out;
  }
  const packPage = p => ({ id: p.id, k: p.k || null, t: p.t, label: p.label || "", s: p.s.map(packStroke) });

  // ---------- funciones para graficar (sin eval): «x^2 - 3», «2sin(x)», «y = sqrt(x)/2», «|x|», «e^(-x^2)» ----------
  const Ex = (() => {
    const FUNCS = { sin: Math.sin, cos: Math.cos, tan: Math.tan, tg: Math.tan, sen: Math.sin, asin: Math.asin, acos: Math.acos, atan: Math.atan,
      sqrt: Math.sqrt, raiz: Math.sqrt, abs: Math.abs, ln: Math.log, log: Math.log10, exp: Math.exp, floor: Math.floor, ceil: Math.ceil };
    const CONSTS = { pi: Math.PI, "π": Math.PI, e: Math.E };
    const NAMES = [...Object.keys(FUNCS), ...Object.keys(CONSTS), "x"].sort((a, b) => b.length - a.length);
    function tokenize(src) {
      const s = src.replace(/\s+/g, "").replace(/[·×]/g, "*").replace(/÷/g, "/").replace(/[−–]/g, "-").replace(/²/g, "^2").replace(/³/g, "^3").replace(/√/g, "sqrt").replace(/,/g, ".");
      const out = [];
      let i = 0;
      while (i < s.length) {
        const c = s[i];
        if (/[0-9.]/.test(c)) {
          let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++;
          const v = Number(s.slice(i, j));
          if (Number.isNaN(v)) throw new Error(`Número mal escrito: ${s.slice(i, j)}`);
          out.push({ t: "num", v }); i = j;
        } else if (/[a-zA-Zπ]/.test(c)) {
          let j = i; while (j < s.length && /[a-zA-Zπ]/.test(s[j])) j++;
          // «xsin» o «2pix»: se separa en nombres conocidos
          const w = s.slice(i, j).toLowerCase();
          let k = 0;
          while (k < w.length) { const n = NAMES.find(nm => w.startsWith(nm, k)); if (!n) throw new Error(`No conozco «${w.slice(k)}»`); out.push({ t: "id", v: n }); k += n.length; }
          i = j;
        } else if ("+-*/^()|".includes(c)) { out.push({ t: "op", v: c }); i++; }
        else throw new Error(`No entiendo «${c}»`);
      }
      return out;
    }
    function parse(src) {
      const body = src.includes("=") ? src.slice(src.lastIndexOf("=") + 1) : src;   // «y = …»: se ignora lo de la izquierda
      const toks = tokenize(body);
      if (!toks.length) throw new Error("Escribí una función de x");
      let p = 0, inAbs = 0;
      const peek = () => toks[p], isOp = v => peek() && peek().t === "op" && peek().v === v;
      const expect = v => { if (!isOp(v)) throw new Error(`Falta «${v}»`); p++; };
      const startsFactor = () => { const t = peek(); return !!t && (t.t === "num" || t.t === "id" || (t.t === "op" && (t.v === "(" || t.v === "|"))); };
      function sum() { let a = product(); while (isOp("+") || isOp("-")) { const op = toks[p++].v; a = { k: "bin", op, a, b: product() }; } return a; }
      function product() {
        let a = unary();
        for (;;) {
          if (isOp("*") || isOp("/")) { const op = toks[p++].v; a = { k: "bin", op, a, b: unary() }; }
          else if (startsFactor() && !(isOp("|") && inAbs > 0)) a = { k: "bin", op: "*", a, b: power() };   // multiplicación implícita: 2x, 3(x+1)
          else return a;
        }
      }
      function unary() { if (isOp("-")) { p++; return { k: "neg", a: unary() }; } if (isOp("+")) { p++; return unary(); } return power(); }
      function power() { const base = atom(); if (isOp("^")) { p++; return { k: "bin", op: "^", a: base, b: unary() }; } return base; }
      function atom() {
        const t = peek();
        if (!t) throw new Error("La expresión quedó incompleta");
        if (t.t === "num") { p++; return { k: "num", v: t.v }; }
        if (t.t === "id") {
          p++;
          if (t.v === "x") return { k: "x" };
          if (t.v in CONSTS) return { k: "num", v: CONSTS[t.v] };
          if (isOp("(")) { p++; const a = sum(); expect(")"); return { k: "call", f: t.v, a }; }
          return { k: "call", f: t.v, a: power() };
        }
        if (t.v === "(") { p++; const a = sum(); expect(")"); return a; }
        if (t.v === "|") { p++; inAbs++; const a = sum(); inAbs--; expect("|"); return { k: "call", f: "abs", a }; }
        throw new Error(`Sobra «${t.v}»`);
      }
      const tree = sum();
      if (p < toks.length) throw new Error(`Sobra «${toks[p].v}»`);
      return tree;
    }
    function compile(n) {
      switch (n.k) {
        case "num": return () => n.v;
        case "x": return x => x;
        case "neg": { const a = compile(n.a); return x => -a(x); }
        case "call": { const f = FUNCS[n.f], a = compile(n.a); return x => f(a(x)); }
        default: {
          const a = compile(n.a), b = compile(n.b);
          return { "+": x => a(x) + b(x), "-": x => a(x) - b(x), "*": x => a(x) * b(x), "/": x => a(x) / b(x), "^": x => Math.pow(a(x), b(x)) }[n.op];
        }
      }
    }
    const cache = new Map();
    function compileExpr(src) {
      if (cache.has(src)) return cache.get(src);
      let r;
      try { r = { fn: compile(parse(src)), error: null }; } catch (e) { r = { fn: null, error: e.message }; }
      cache.set(src, r);
      return r;
    }
    // la curva en [xmin, xmax], cortada donde se va de rango o no existe (1/x, tan x, raíces de negativos)
    function sample(fn, xmin, xmax, ymin, ymax, steps = 600) {
      const out = [], span = ymax - ymin, lo = ymin - span * 2, hi = ymax + span * 2;
      let cur = [], prevY = null;
      for (let i = 0; i <= steps; i++) {
        const x = xmin + ((xmax - xmin) * i) / steps, y = fn(x), ok = Number.isFinite(y) && y >= lo && y <= hi;
        const jump = prevY !== null && ok && Math.abs(y - prevY) > span * 1.5;   // un salto enorme es una asíntota
        if (!ok || jump) { if (cur.length >= 4) out.push(cur); cur = []; }
        if (ok) cur.push(x, y);
        prevY = ok ? y : null;
      }
      if (cur.length >= 4) out.push(cur);
      return out;
    }
    return { compileExpr, sample };
  })();

  // ---------- fórmulas: AsciiMath → TeX → MathJax en SVG (se carga recién la primera vez) ----------
  const MJ = { st: 0, p: null, ascii: null, svgs: new Map(), imgs: new Map(), listeners: new Set() };
  const loadScript = src => new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("No se pudo cargar " + src)); document.head.appendChild(s); });
  function loadMath() {
    if (MJ.p) return MJ.p;
    MJ.st = 1;
    // SVG autocontenido (sin caché de glifos compartida): se puede dibujar en el canvas y exportar sin fuentes
    window.MathJax = { startup: { typeset: false }, svg: { fontCache: "none" }, options: { enableMenu: false } };
    MJ.p = loadScript("assets/vendor/asciimath2tex/asciimath2tex.js")
      .then(() => loadScript("assets/vendor/mathjax/tex-svg.js"))
      .then(() => window.MathJax.startup.promise)
      .then(() => { MJ.ascii = new window.AsciiMathParser(); MJ.st = 2; for (const f of MJ.listeners) f(); })
      .catch(e => { MJ.st = 3; MJ.err = e.message; for (const f of MJ.listeners) f(); });
    return MJ.p;
  }
  // «x^2 + 2» → SVG; tamaño en ex (medio tamaño de letra). null si MathJax todavía no cargó.
  function mathSvg(src) {
    if (MJ.st !== 2) { if (!MJ.st) loadMath(); return null; }
    let r = MJ.svgs.get(src);
    if (r) return r;
    let tex = src;
    try { tex = MJ.ascii.parse(src); } catch (e) { /* queda el texto tal cual */ }
    const node = window.MathJax.tex2svg(tex.trim() || " ", { display: true }), svgEl = node.querySelector("svg");
    let svg = svgEl ? svgEl.outerHTML : "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>";
    if (!svg.includes("xmlns=")) svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
    const w = /width="([\d.]+)ex"/.exec(svg), h = /height="([\d.]+)ex"/.exec(svg);
    r = { svg, wEx: w ? +w[1] : 1, hEx: h ? +h[1] : 1, error: svg.includes("merror") ? "Revisá la fórmula" : null };
    MJ.svgs.set(src, r);
    return r;
  }
  // la fórmula como imagen del color pedido (null mientras se prepara; avisa al estar lista)
  function mathImage(src, color) {
    const key = color + ":" + src, e = MJ.imgs.get(key);
    if (e) return e.ready ? e.img : null;
    const m = mathSvg(src);
    if (!m || typeof Image === "undefined") return null;
    const px = 24;   // grande: el canvas la escala como vector igual, y el PDF la rasteriza bien
    const svg = m.svg.replace(/width="[\d.]+ex"/, `width="${(m.wEx * px).toFixed(1)}px"`).replace(/height="[\d.]+ex"/, `height="${(m.hEx * px).toFixed(1)}px"`).replace(/currentColor/g, color);
    const img = new Image(), entry = { img, ready: false };
    MJ.imgs.set(key, entry);
    img.onload = () => { entry.ready = true; for (const f of MJ.listeners) f(); };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    return null;
  }
  const measureMath = (src, size) => { const m = mathSvg(src); return m && { w: m.wEx * 0.5 * size, h: m.hEx * 0.5 * size }; };
  let measureCtx = null;
  function measureText(text, size, bold) {
    if (!measureCtx && typeof document !== "undefined") measureCtx = document.createElement("canvas").getContext("2d");
    let w = 0;
    const lines = text.split("\n");
    for (const l of lines) {
      if (measureCtx) { measureCtx.font = fontOf(size, bold); w = Math.max(w, measureCtx.measureText(l).width); }
      else w = Math.max(w, l.length * size * 0.55);
    }
    return { w: Math.max(w, size * 0.5), h: lines.length * size * LINE_H };
  }
  const fontOf = (size, bold) => `${bold ? 700 : 400} ${size}px ${FONT}`;

  // ---------- dibujo de los objetos (en coordenadas de la hoja) ----------
  const boxOf = s => { const b = bbOf(s); return [b.x0, b.y0, b.x1, b.y1]; };
  // un paso «lindo» (1, 2, 5 × 10ⁿ) para que entren unas `target` marcas
  function niceStep(range, target = 10) {
    const raw = range / target, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
  }
  const fmtNum = v => String(Math.round(v * 1e6) / 1e6).replace(".", ",").replace("-", "−");
  function arrow(c, x, y, dx, dy, len) {
    const nx = -dy, ny = dx;
    c.beginPath(); c.moveTo(x, y);
    c.lineTo(x - dx * len + nx * len * 0.5, y - dy * len + ny * len * 0.5);
    c.lineTo(x - dx * len - nx * len * 0.5, y - dy * len - ny * len * 0.5);
    c.closePath(); c.fill();
  }
  function drawAxes(c, a, [x0, y0, x1, y1], color, lw, gridColor) {
    const w = x1 - x0, h = y1 - y0;
    const sx = x => x0 + ((x - a.xmin) / (a.xmax - a.xmin)) * w, sy = y => y1 - ((y - a.ymin) / (a.ymax - a.ymin)) * h;
    const font = Math.max(10, Math.min(w, h) / 26);
    const stepX = niceStep(a.xmax - a.xmin, Math.max(4, Math.round(w / (font * 3)))), stepY = niceStep(a.ymax - a.ymin, Math.max(4, Math.round(h / (font * 2.2))));
    // los ejes pasan por el 0 si está a la vista; si no, por el borde
    const ox = sx(Math.min(Math.max(0, a.xmin), a.xmax)), oy = sy(Math.min(Math.max(0, a.ymin), a.ymax));
    if (a.grid) {
      c.strokeStyle = gridColor; c.lineWidth = Math.max(0.5, lw * 0.3); c.beginPath();
      for (let x = Math.ceil(a.xmin / stepX) * stepX; x <= a.xmax + 1e-9; x += stepX) { c.moveTo(sx(x), y0); c.lineTo(sx(x), y1); }
      for (let y = Math.ceil(a.ymin / stepY) * stepY; y <= a.ymax + 1e-9; y += stepY) { c.moveTo(x0, sy(y)); c.lineTo(x1, sy(y)); }
      c.stroke();
    }
    c.strokeStyle = color; c.fillStyle = color; c.lineWidth = lw; c.lineCap = "round";
    c.beginPath(); c.moveTo(x0, oy); c.lineTo(x1, oy); c.moveTo(ox, y1); c.lineTo(ox, y0); c.stroke();
    arrow(c, x1 + lw, oy, 1, 0, font * 0.8); arrow(c, ox, y0 - lw, 0, -1, font * 0.8);
    c.font = fontOf(font); const tick = font * 0.35;
    c.lineWidth = Math.max(1, lw * 0.7); c.beginPath(); c.textAlign = "center"; c.textBaseline = "top";
    for (let x = Math.ceil(a.xmin / stepX) * stepX; x <= a.xmax - stepX * 0.3; x += stepX) {
      if (Math.abs(x) < stepX * 1e-6) continue;
      c.moveTo(sx(x), oy - tick); c.lineTo(sx(x), oy + tick); c.fillText(fmtNum(x), sx(x), oy + tick * 1.6);
    }
    c.textAlign = "right"; c.textBaseline = "middle";
    for (let y = Math.ceil(a.ymin / stepY) * stepY; y <= a.ymax - stepY * 0.3; y += stepY) {
      if (Math.abs(y) < stepY * 1e-6) continue;
      c.moveTo(ox - tick, sy(y)); c.lineTo(ox + tick, sy(y)); c.fillText(fmtNum(y), ox - tick * 1.8, sy(y));
    }
    c.stroke();
    if (a.xmin <= 0 && a.xmax >= 0 && a.ymin <= 0 && a.ymax >= 0) { c.textAlign = "right"; c.textBaseline = "top"; c.fillText("0", ox - tick * 1.2, oy + tick * 1.2); }
    c.font = fontOf(font * 1.15); c.textAlign = "right"; c.textBaseline = "bottom"; c.fillText("x", x1, oy - tick * 1.5);
    c.textAlign = "left"; c.textBaseline = "top"; c.fillText("y", ox + tick * 2, y0);
    // funciones, recortadas a la caja
    c.save(); c.beginPath(); c.rect(x0, y0, w, h); c.clip(); c.lineWidth = lw * 1.3; c.lineJoin = "round";
    (a.fns || []).forEach((src, i) => {
      const { fn } = Ex.compileExpr(src);
      if (!fn) return;
      c.strokeStyle = CURVE_COLORS[i % CURVE_COLORS.length];
      for (const part of Ex.sample(fn, a.xmin, a.xmax, a.ymin, a.ymax, Math.max(200, Math.round(w / 2)))) {
        c.beginPath(); c.moveTo(sx(part[0]), sy(part[1]));
        for (let j = 2; j < part.length; j += 2) c.lineTo(sx(part[j]), sy(part[j + 1]));
        c.stroke();
      }
    });
    c.restore();
  }
  function drawNumberLine(c, n, [x0, y0, x1, y1], color, lw) {
    const w = x1 - x0, y = (y0 + y1) / 2, font = Math.max(10, Math.min(w / 30, (y1 - y0) / 2.5));
    const sx = v => x0 + font + ((v - n.min) / (n.max - n.min)) * (w - font * 2.5), step = niceStep(n.max - n.min, Math.max(4, Math.round(w / (font * 3))));
    c.strokeStyle = color; c.fillStyle = color; c.lineWidth = lw; c.lineCap = "round";
    c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
    arrow(c, x1 + lw, y, 1, 0, font * 0.8); arrow(c, x0 - lw, y, -1, 0, font * 0.8);
    c.font = fontOf(font); c.textAlign = "center"; c.textBaseline = "top";
    const tick = font * 0.45;
    c.beginPath();
    for (let v = Math.ceil(n.min / step) * step; v <= n.max + 1e-9; v += step) { c.moveTo(sx(v), y - tick); c.lineTo(sx(v), y + tick); c.fillText(fmtNum(v), sx(v), y + tick * 1.5); }
    c.stroke();
  }
  // dibuja un objeto; gridColor es el de la cuadrícula de los ejes
  function drawItem(c, s, color, gridColor) {
    const o = s.o, b = boxOf(s), [x0, y0, x1, y1] = b;
    c.save();
    if (o.k === "text") {
      const pad = s.w * PAD;
      c.fillStyle = color; c.font = fontOf(s.w, o.b); c.textBaseline = "top";
      o.t.split("\n").forEach((line, i) => c.fillText(line, x0 + pad, y0 + pad + i * s.w * LINE_H + s.w * 0.1));
    } else if (o.k === "math") {
      const img = mathImage(o.s, color), pad = s.w * PAD;
      if (img) c.drawImage(img, x0 + pad, y0 + pad, x1 - x0 - 2 * pad, y1 - y0 - 2 * pad);
      else {   // mientras carga: el texto tal cual, en gris
        c.fillStyle = "#888888"; c.font = fontOf(s.w); c.textBaseline = "middle"; c.fillText(o.s, x0 + pad, (y0 + y1) / 2);
      }
    } else if (o.k === "axes") drawAxes(c, o, b, color, s.w, gridColor);
    else if (o.k === "line") drawNumberLine(c, o, b, color, s.w);
    c.restore();
  }

  const T = { bbox, hits, eraseAt, eraseArea, doAct, undo, redo, undoAny, redoAny, packPage, radiusAt, cutPolyline, fractionInside, transformPts, rectPts, Ex };

  // ---------- preferencias de este dispositivo (no se sincronizan) ----------
  const PREF_KEY = "efecen-board";
  // ---------- formas: si el lápiz queda quieto al final del trazo, se vuelve línea, círculo, etc. ----------
  // (adaptado del reconocedor de Notillas; sin DOM, lo usan los tests)
  const Sh = (() => {
    const DEG = Math.PI / 180, N = 64;
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const pathLength = pts => { let l = 0; for (let i = 1; i < pts.length; i++) l += dist(pts[i - 1], pts[i]); return l; };
    function bounds(pts) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const p of pts) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
      return { x0, y0, x1, y1, diag: Math.hypot(x1 - x0, y1 - y0) };
    }
    const centroid = pts => { let x = 0, y = 0; for (const p of pts) { x += p.x; y += p.y; } return { x: x / pts.length, y: y / pts.length }; };
    // remuestreo equiespaciado a n puntos
    function resample(pts, n) {
      const L = pathLength(pts);
      if (pts.length < 2 || L === 0) return Array.from({ length: n }, () => ({ ...pts[0] }));
      const step = L / (n - 1), out = [{ ...pts[0] }];
      let acc = 0, prev = pts[0];
      for (let i = 1; i < pts.length; i++) {
        const cur = pts[i];
        let d = dist(prev, cur);
        while (acc + d >= step && out.length < n) {
          const t = (step - acc) / d, q = { x: prev.x + (cur.x - prev.x) * t, y: prev.y + (cur.y - prev.y) * t };
          out.push(q); prev = q; d = dist(prev, cur); acc = 0;
        }
        acc += d; prev = cur;
      }
      while (out.length < n) out.push({ ...pts[pts.length - 1] });
      return out;
    }
    function distToSeg(p, a, b) {
      const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy;
      const t = l2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2)) : 0;
      return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
    }
    // Ramer–Douglas–Peucker: índices de los vértices que quedan
    function rdp(pts, eps) {
      const keep = new Array(pts.length).fill(false);
      keep[0] = keep[pts.length - 1] = true;
      const stack = [[0, pts.length - 1]];
      while (stack.length) {
        const [a, b] = stack.pop();
        let best = -1, bestD = eps;
        for (let i = a + 1; i < b; i++) { const d = distToSeg(pts[i], pts[a], pts[b]); if (d > bestD) { bestD = d; best = i; } }
        if (best >= 0) { keep[best] = true; stack.push([a, best], [best, b]); }
      }
      return keep.flatMap((k, i) => (k ? [i] : []));
    }
    function angleAt(a, b, c) {
      let d = Math.abs(Math.atan2(a.y - b.y, a.x - b.x) - Math.atan2(c.y - b.y, c.x - b.x)) / DEG;
      return d > 180 ? 360 - d : d;
    }
    function meanDistToPolyline(pts, poly, closed) {
      let sum = 0;
      const n = poly.length, segs = closed ? n : n - 1;
      for (const p of pts) { let best = Infinity; for (let i = 0; i < segs; i++) best = Math.min(best, distToSeg(p, poly[i], poly[(i + 1) % n])); sum += best; }
      return sum / pts.length;
    }
    function densify(verts, closed, step = 3) {
      const out = [], n = verts.length, segs = closed ? n : n - 1;
      for (let i = 0; i < segs; i++) {
        const a = verts[i], b = verts[(i + 1) % n], k = Math.max(1, Math.ceil(dist(a, b) / step));
        for (let j = 0; j < k; j++) out.push({ x: a.x + (b.x - a.x) * j / k, y: a.y + (b.y - a.y) * j / k });
      }
      out.push(closed ? { ...verts[0] } : { ...verts[n - 1] });
      return out;
    }
    // ---- ajustes por mínimos cuadrados ----
    function fitLine(pts) {
      const c = centroid(pts);
      let sxx = 0, syy = 0, sxy = 0;
      for (const p of pts) { const dx = p.x - c.x, dy = p.y - c.y; sxx += dx * dx; syy += dy * dy; sxy += dx * dy; }
      const theta = 0.5 * Math.atan2(2 * sxy, sxx - syy), nx = -Math.sin(theta), ny = Math.cos(theta);
      let sq = 0;
      for (const p of pts) sq += ((p.x - c.x) * nx + (p.y - c.y) * ny) ** 2;
      return { c, theta, rms: Math.sqrt(sq / pts.length) };
    }
    const det3 = m => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    function solve3(m, v) {
      const d = det3(m);
      if (Math.abs(d) < 1e-12) return null;
      return [0, 1, 2].map(k => det3(m.map((row, i) => row.map((x, j) => (j === k ? v[i] : x)))) / d);
    }
    // círculo: ajuste algebraico de Kåsa y unas iteraciones de Gauss–Newton sobre la distancia geométrica
    function fitCircle(pts) {
      let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, sz = 0, sxz = 0, syz = 0;
      const n = pts.length;
      for (const { x, y } of pts) { const z = x * x + y * y; sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y; sz += z; sxz += x * z; syz += y * z; }
      const sol = solve3([[sxx, sxy, sx], [sxy, syy, sy], [sx, sy, n]], [-sxz, -syz, -sz]);
      if (!sol) return null;
      let cx = -sol[0] / 2, cy = -sol[1] / 2, r = Math.sqrt(Math.max(0, cx * cx + cy * cy - sol[2]));
      for (let it = 0; it < 8; it++) {
        const jtj = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], jtr = [0, 0, 0];
        for (const p of pts) {
          const d = Math.max(1e-9, Math.hypot(p.x - cx, p.y - cy)), j = [-(p.x - cx) / d, -(p.y - cy) / d, -1], res = d - r;
          for (let a = 0; a < 3; a++) { jtr[a] += j[a] * res; for (let b = 0; b < 3; b++) jtj[a][b] += j[a] * j[b]; }
        }
        const st = solve3(jtj, jtr.map(v => -v));
        if (!st) break;
        cx += st[0]; cy += st[1]; r += st[2];
        if (Math.hypot(st[0], st[1], st[2]) < 1e-6) break;
      }
      let sq = 0;
      for (const p of pts) sq += (dist(p, { x: cx, y: cy }) - r) ** 2;
      return { cx, cy, r: Math.abs(r), rms: Math.sqrt(sq / n) };
    }
    // elipse: centro y orientación por componentes principales; semiejes por mínimos cuadrados
    function fitEllipse(pts) {
      const c = centroid(pts), { theta } = fitLine(pts), cos = Math.cos(theta), sin = Math.sin(theta);
      let s40 = 0, s04 = 0, s22 = 0, s20 = 0, s02 = 0;
      const uv = pts.map(p => {
        const dx = p.x - c.x, dy = p.y - c.y, u = dx * cos + dy * sin, v = -dx * sin + dy * cos;
        s40 += u ** 4; s04 += v ** 4; s22 += u * u * v * v; s20 += u * u; s02 += v * v;
        return [u, v];
      });
      const det = s40 * s04 - s22 * s22;
      if (Math.abs(det) < 1e-12) return null;
      const A = (s20 * s04 - s02 * s22) / det, B = (s40 * s02 - s22 * s20) / det;
      if (A <= 0 || B <= 0) return null;
      const a = 1 / Math.sqrt(A), b = 1 / Math.sqrt(B);
      let sum = 0;
      for (const [u, v] of uv) { const phi = Math.atan2(v, u), re = a * b / Math.hypot(b * Math.cos(phi), a * Math.sin(phi)); sum += Math.abs(Math.hypot(u, v) - re); }
      return { cx: c.x, cy: c.y, a, b, theta, err: sum / pts.length };
    }
    // ---- reconocimiento ----
    function recognize(input) {
      if (input.length < 3) return null;
      const L = pathLength(input), box = bounds(input);
      if (L < 20 || box.diag < 15) return null;
      const pts = resample(input, N), D = box.diag;
      const closed = dist(pts[0], pts[N - 1]) < 0.18 * D && L > 2 * D * 0.9;
      return closed ? recognizeClosed(pts, D) : recognizeOpen(pts, L, D);
    }
    function recognizeOpen(pts, L, D) {
      const a = pts[0], b = pts[pts.length - 1], chord = dist(a, b), line = fitLine(pts);
      if (chord / L > 0.9 && line.rms / L < 0.03) return lineShape(a, b, line.rms / L);
      const arrow = detectArrow(pts, L, D);
      if (arrow) return arrow;
      const circle = fitCircle(pts);
      if (circle && circle.r < 3 * D && circle.rms / circle.r < 0.045) {
        let sweep = 0, prev = Math.atan2(pts[0].y - circle.cy, pts[0].x - circle.cx);
        for (const p of pts) {
          const ang = Math.atan2(p.y - circle.cy, p.x - circle.cx);
          let d = ang - prev;
          if (d > Math.PI) d -= 2 * Math.PI;
          if (d < -Math.PI) d += 2 * Math.PI;
          sweep += d; prev = ang;
        }
        const deg = Math.abs(sweep) / DEG;
        if (deg >= 30 && deg <= 300) {
          const a0 = Math.atan2(pts[0].y - circle.cy, pts[0].x - circle.cx);
          const verts = Array.from({ length: 49 }, (_, i) => { const t = a0 + sweep * i / 48; return { x: circle.cx + circle.r * Math.cos(t), y: circle.cy + circle.r * Math.sin(t) }; });
          return { kind: "arc", verts, closed: false, center: { x: circle.cx, y: circle.cy }, mode: "similarity", rotate: true, error: circle.rms / circle.r };
        }
      }
      return null;
    }
    // ángulo a múltiplos de 45° si está a menos de 5°
    function snapEnd(a, b) {
      const len = dist(a, b), ang = Math.atan2(b.y - a.y, a.x === b.x && a.y === b.y ? 1 : b.x - a.x);
      const snapped = Math.round(ang / (45 * DEG)) * 45 * DEG, use = Math.abs(ang - snapped) < 5 * DEG ? snapped : ang;
      return { x: a.x + len * Math.cos(use), y: a.y + len * Math.sin(use) };
    }
    const lineShape = (a, b, error) => ({ kind: "line", verts: [a, snapEnd(a, b)], closed: false, center: a, mode: "endpoint", rotate: true, rebuild: tip => [a, snapEnd(a, tip)], error });
    // flecha de un solo trazo: un tramo largo y recto, y al final un gancho corto en V
    function detectArrow(pts, L, D) {
      const idx = rdp(pts, 0.04 * D);
      if (idx.length < 3 || idx.length > 7) return null;
      const tail = pts[idx[0]], tipI = idx[1], tip = pts[tipI], shaft = dist(tail, tip);
      if (shaft < 0.45 * L) return null;
      for (let i = 0; i <= tipI; i++) if (distToSeg(pts[i], tail, tip) > 0.04 * shaft) return null;
      for (let i = tipI; i < pts.length; i++) if (dist(pts[i], tip) > 0.5 * shaft) return null;
      const barbLen = dist(pts[idx[2]], tip);
      if (barbLen < 0.08 * shaft) return null;
      const ang = angleAt(tail, tip, pts[idx[2]]);
      if (ang < 10 || ang > 80) return null;
      const build = t => arrowVerts(tail, t, Math.min(barbLen, 0.4 * dist(tail, t)));
      return { kind: "arrow", verts: build(tip), closed: false, center: tail, mode: "endpoint", rotate: true, rebuild: build, error: 0 };
    }
    function arrowVerts(tail, tip, barb) {
      const ang = Math.atan2(tail.y - tip.y, tail.x - tip.x);
      const b1 = { x: tip.x + barb * Math.cos(ang + 30 * DEG), y: tip.y + barb * Math.sin(ang + 30 * DEG) };
      const b2 = { x: tip.x + barb * Math.cos(ang - 30 * DEG), y: tip.y + barb * Math.sin(ang - 30 * DEG) };
      return [tail, tip, b1, tip, b2];
    }
    function recognizeClosed(pts, D) {
      const loop = pts.slice(0, -1), c = centroid(loop), poly = polygonFrom(loop, c, D);
      const polyErr = poly ? meanDistToPolyline(loop, poly, true) / D : Infinity;
      const ell = fitEllipse(loop), ellErr = ell ? ell.err / D : Infinity;
      if (poly && poly.length >= 3 && poly.length <= 6 && polyErr < 0.03 && polyErr <= ellErr * 1.15) return polygonShape(poly, polyErr);
      if (ell && ellErr < 0.03) {
        const center = { x: ell.cx, y: ell.cy };
        if (Math.min(ell.a, ell.b) / Math.max(ell.a, ell.b) > 0.85) {
          const r = loop.reduce((s, p) => s + dist(p, center), 0) / loop.length;
          return { kind: "circle", verts: ellipseVerts(center, r, r, 0), closed: true, center, mode: "similarity", rotate: false, error: ellErr };
        }
        return { kind: "ellipse", verts: ellipseVerts(center, ell.a, ell.b, ell.theta), closed: true, center, mode: "similarity", rotate: false, error: ellErr };
      }
      return null;
    }
    function ellipseVerts(c, a, b, theta) {
      const cos = Math.cos(theta), sin = Math.sin(theta);
      return Array.from({ length: 72 }, (_, i) => { const t = i / 72 * 2 * Math.PI, u = a * Math.cos(t), v = b * Math.sin(t); return { x: c.x + u * cos - v * sin, y: c.y + u * sin + v * cos }; });
    }
    function polygonFrom(loop, c, D) {
      let far = 0;
      loop.forEach((p, i) => { if (dist(p, c) > dist(loop[far], c)) far = i; });
      const ring = [...loop.slice(far), ...loop.slice(0, far)];
      ring.push(ring[0]);
      let verts = rdp(ring, 0.045 * D).map(i => ring[i]);
      verts.pop();
      // fusiona esquinas muy cercanas y saca las casi llanas
      for (let changed = true; changed && verts.length > 3;) {
        changed = false;
        for (let i = 0; i < verts.length && verts.length > 3; i++) {
          const prev = verts[(i - 1 + verts.length) % verts.length], cur = verts[i], next = verts[(i + 1) % verts.length];
          if (dist(cur, next) < 0.1 * D) { verts[i] = { x: (cur.x + next.x) / 2, y: (cur.y + next.y) / 2 }; verts.splice((i + 1) % verts.length, 1); changed = true; break; }
          if (angleAt(prev, cur, next) > 155) { verts.splice(i, 1); changed = true; break; }
        }
      }
      verts = verts.filter(Boolean);
      return verts.length >= 3 ? verts : null;
    }
    function polygonShape(verts, error) {
      const c = centroid(verts), base = { closed: true, center: c, mode: "similarity", rotate: true, error };
      if (verts.length === 3) return { ...base, kind: "triangle", verts };
      if (verts.length === 4) {
        const angles = verts.map((v, i) => angleAt(verts[(i + 3) % 4], v, verts[(i + 1) % 4]));
        if (angles.every(a => Math.abs(a - 90) < 15)) { const rect = fitRectangle(verts); return { ...base, kind: rect.square ? "square" : "rectangle", verts: rect.verts, center: rect.center }; }
        return { ...base, kind: "quad", verts };
      }
      return { ...base, kind: "polygon", verts: regularize(verts, c) };
    }
    function fitRectangle(v) {
      let sx = 0, sy = 0;
      for (let i = 0; i < 4; i++) { const a = Math.atan2(v[(i + 1) % 4].y - v[i].y, v[(i + 1) % 4].x - v[i].x) * 4; sx += Math.cos(a); sy += Math.sin(a); }
      let theta = Math.atan2(sy, sx) / 4;
      const snapped = Math.round(theta / (90 * DEG)) * 90 * DEG;
      if (Math.abs(theta - snapped) < 7 * DEG) theta = snapped;
      const c = centroid(v), cos = Math.cos(theta), sin = Math.sin(theta);
      let hw = 0, hh = 0;
      for (const p of v) { hw += Math.abs((p.x - c.x) * cos + (p.y - c.y) * sin); hh += Math.abs(-(p.x - c.x) * sin + (p.y - c.y) * cos); }
      hw /= 4; hh /= 4;
      const square = Math.min(hw, hh) / Math.max(hw, hh) > 0.9;
      if (square) hw = hh = (hw + hh) / 2;
      const corner = (u, w) => ({ x: c.x + u * cos - w * sin, y: c.y + u * sin + w * cos });
      return { verts: [corner(-hw, -hh), corner(hw, -hh), corner(hw, hh), corner(-hw, hh)], center: c, square };
    }
    // pentágonos y hexágonos con lados parecidos se vuelven regulares
    function regularize(v, c) {
      const n = v.length, sides = v.map((p, i) => dist(p, v[(i + 1) % n])), mean = sides.reduce((a, b) => a + b, 0) / n;
      if (Math.sqrt(sides.reduce((a, s) => a + (s - mean) ** 2, 0) / n) / mean > 0.2) return v;
      const r = v.reduce((a, p) => a + dist(p, c), 0) / n, a0 = Math.atan2(v[0].y - c.y, v[0].x - c.x);
      const dir = v.reduce((a, p, i) => a + p.x * v[(i + 1) % n].y - v[(i + 1) % n].x * p.y, 0) >= 0 ? 1 : -1;
      return Array.from({ length: n }, (_, i) => { const t = a0 + dir * 2 * Math.PI * i / n; return { x: c.x + r * Math.cos(t), y: c.y + r * Math.sin(t) }; });
    }
    // con el lápiz todavía apoyado, la forma sigue al lápiz: el extremo (líneas, flechas) o escala y rota desde el centro
    function adjustShape(shape, anchor, pen) {
      if (shape.mode === "endpoint" && shape.rebuild) return shape.rebuild(pen);
      const c = shape.center, v0 = { x: anchor.x - c.x, y: anchor.y - c.y }, v1 = { x: pen.x - c.x, y: pen.y - c.y }, l0 = Math.hypot(v0.x, v0.y);
      if (l0 < 1) return shape.verts;
      const k = Math.max(0.1, Math.min(10, Math.hypot(v1.x, v1.y) / l0));
      const rot = shape.rotate ? Math.atan2(v1.y, v1.x) - Math.atan2(v0.y, v0.x) : 0, cos = Math.cos(rot) * k, sin = Math.sin(rot) * k;
      return shape.verts.map(p => ({ x: c.x + (p.x - c.x) * cos - (p.y - c.y) * sin, y: c.y + (p.x - c.x) * sin + (p.y - c.y) * cos }));
    }
    // puntos del trazo (presión constante) a partir de los vértices
    const toStroke = (verts, closed) => densify(verts, closed).flatMap(p => [p.x, p.y, 0.5]);
    const fromStroke = flat => { const out = []; for (let i = 0; i + 1 < flat.length; i += 3) out.push({ x: flat[i], y: flat[i + 1] }); return out; };
    return { recognize, adjustShape, toStroke, fromStroke };
  })();
  const HOLD_MS = 500, HOLD_PX = 6;   // quieto más de 500 ms, moviéndose menos de 6 px de pantalla
  const HANDLE_PX = 14, SEL_PAD_PX = 12, TAP_MS = 280, TAP_MOVE_PX = 12;
  const TOOLS = ["pen", "hl", "eraser", "lasso", "text", "math"];

  const prefs = Object.assign({ show: "auto", pen: false, finger: null, shapes: true, tool: "pen", color: "ink", size: 1, hlColor: "yellow", paper: "grid", promptOpen: true, split: true, eraseMode: "stroke", textSize: 32, bold: false }, (() => {
    try { return JSON.parse(localStorage.getItem(PREF_KEY)) || {}; } catch (e) { return {}; }
  })());
  if (!TOOLS.includes(prefs.tool)) prefs.tool = "pen";
  if (!PAPERS.includes(prefs.paper)) prefs.paper = "grid";
  const savePrefs = () => { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) { /* sin almacenamiento */ } };
  const mq = q => (typeof matchMedia === "function" ? matchMedia(q) : { matches: false, addEventListener() {} });
  const isTablet = () => mq("(pointer: coarse)").matches && typeof screen !== "undefined" && Math.min(screen.width, screen.height) >= 600;
  // con lápiz detectado, el dedo solo mueve la hoja (salvo que se pida lo contrario)
  const fingerDraws = () => (prefs.finger == null ? !prefs.pen : prefs.finger);

  // ---------- almacenamiento ----------
  const DB = {
    p: null,
    open() {
      if (!this.p) this.p = new Promise((res, rej) => {
        if (typeof indexedDB === "undefined") return rej(new Error("sin IndexedDB"));
        const rq = indexedDB.open("efecen-board", 1);
        rq.onupgradeneeded = () => rq.result.createObjectStore("pages", { keyPath: "id" });
        rq.onsuccess = () => res(rq.result);
        rq.onerror = () => rej(rq.error);
      });
      return this.p;
    },
    async run(mode, fn) {
      const db = await this.open();
      return new Promise((res, rej) => {
        const tx = db.transaction("pages", mode), rq = fn(tx.objectStore("pages"));
        tx.oncomplete = () => res(rq && rq.result); tx.onerror = () => rej(tx.error);
      });
    },
    all() { return this.run("readonly", st => st.getAll()); },
    put(p) { return this.run("readwrite", st => st.put(p)); },
    del(id) { return this.run("readwrite", st => st.delete(id)); }
  };

  // ---------- estado ----------
  let pages = null;            // hojas guardadas, de la más vieja a la más nueva
  let page = null;             // hoja visible (puede ser nueva y todavía no estar en pages)
  let ctxInfo = null;          // { key, label, prompt } del ejercicio actual
  let el = null, stage, base, live, bctx, lctx, pop, selBar, dpr = 1, cssW = 0, cssH = 0;
  // docked: la pizarra comparte la pantalla (al costado con la tablet acostada, abajo con la tablet parada)
  let open = false, docked = false, side = false, pushed = false, onChange = () => {};
  const view = { x: 0, y: 0, z: 1 };
  const views = new Map();     // posición de cada hoja mientras la app está abierta
  const dirty = new Set();
  let saveTimer = 0, rafBase = 0;
  let sel = null;              // selección del lazo: { list: [trazos], box: [x0, y0, x1, y1] }
  let editor = null;           // texto o fórmula que se está escribiendo
  const dockMQ = mq("(orientation: landscape) and (min-width: 900px)");

  const theme = () => {
    const t = document.documentElement.dataset.theme;
    return t === "dark" || (!t && mq("(prefers-color-scheme: dark)").matches) ? 1 : 0;
  };
  const colorOf = (s, th) => (COLORS[s.c] || COLORS.ink)[th];
  const scale = () => (cssW / PAGE_W) * view.z;
  const toScreen = (x, y) => { const sc = scale(); return [(x - view.x) * sc, (y - view.y) * sc]; };

  async function loadPages() {
    if (pages) return pages;
    try { pages = (await DB.all()).sort((a, b) => a.t - b.t); }
    catch (e) { pages = []; }
    return pages;
  }
  const newPage = (k, label) => ({ id: "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), k: k || null, t: Date.now(), label: label || "", s: [] });
  function persist(p) {
    if (!pages.includes(p)) {
      if (!p.s.length) return;
      pages.push(p);
      while (pages.length > MAX_PAGES) { const old = pages.shift(); DB.del(old.id).catch(() => {}); }
    }
    dirty.add(p);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, 700);
  }
  function flush() {
    clearTimeout(saveTimer);
    for (const p of dirty) DB.put(packPage(p)).catch(() => {});
    dirty.clear();
  }
  // un cambio confirmado en la hoja: se guarda, se puede deshacer y se redibuja
  function commit(act) { doAct(page, act); persist(page); redraw(); syncBar(); }

  // ---------- DOM ----------
  const ICON = n => `<svg class="ic" aria-hidden="true"><use href="assets/icons/sprite.svg#i-${n}"/></svg>`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const TOOL_INFO = { pen: ["pen-line", "Lápiz"], hl: ["highlighter", "Resaltador"], eraser: ["eraser", "Goma"], lasso: ["lasso", "Lazo: seleccionar, mover y agrandar"], text: ["type", "Texto"], math: ["sigma", "Fórmula"] };
  function build() {
    el = document.createElement("div");
    el.className = "board";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Pizarra");
    el.innerHTML = `<div class="board-bar">
        <div class="bgrp" role="group" aria-label="Herramienta">${TOOLS.map(t => `<button data-b="tool" data-v="${t}" aria-label="${TOOL_INFO[t][1]}" title="${TOOL_INFO[t][1]}">${ICON(TOOL_INFO[t][0])}</button>`).join("")}</div>
        <div class="bgrp">
          <button data-b="insert" aria-label="Insertar ejes, función o recta numérica" title="Insertar figura">${ICON("plus")}</button>
          <button data-b="style" class="bstyle" aria-label="Color y grosor" title="Color y grosor"><i></i></button></div>
        <div class="bgrp">
          <button data-b="undo" aria-label="Deshacer" title="Deshacer (también: toque con dos dedos)">${ICON("undo-2")}</button>
          <button data-b="redo" aria-label="Rehacer" title="Rehacer">${ICON("redo-2")}</button></div>
        <div class="bgrp">
          <button data-b="more" aria-label="Más opciones: hoja, dedo, exportar, borrar" title="Más opciones">${ICON("ellipsis")}</button>
          <button data-b="split" aria-label="Pantalla dividida o completa"></button></div>
        <div class="bgrp bpages">
          <button data-b="prev" aria-label="Hoja anterior">${ICON("chevron-left")}</button>
          <span class="bpage-n"></span>
          <button data-b="next" aria-label="Hoja siguiente">${ICON("chevron-right")}</button>
          <button data-b="new" aria-label="Hoja nueva">${ICON("plus")}</button></div>
        <button class="bclose" data-b="close" aria-label="Cerrar la pizarra">${ICON("x")}</button>
      </div>
      <div class="board-pop" hidden></div>
      <div class="board-prompt" hidden><button data-b="prompt" class="bprompt-h">${ICON("file-text")}<span>Enunciado</span>${ICON("chevron-right")}</button><div class="bprompt-body"></div></div>
      <div class="board-stage"><canvas class="bc-base"></canvas><canvas class="bc-live"></canvas><div class="board-hint" hidden></div><div class="board-sel" hidden></div></div>`;
    document.body.appendChild(el);
    stage = el.querySelector(".board-stage"); pop = el.querySelector(".board-pop"); selBar = el.querySelector(".board-sel");
    base = el.querySelector(".bc-base"); live = el.querySelector(".bc-live");
    bctx = base.getContext("2d");
    // sin { desynchronized: true }: en Android esa capa de baja latencia puede quedar en blanco y tapar la hoja
    lctx = live.getContext("2d");
    // si el navegador descarta los canvas (falta de memoria de la GPU, app en segundo plano), se redibuja todo
    for (const c of [base, live]) c.addEventListener("contextrestored", () => { redraw(); drawLive(); });
    el.addEventListener("click", onBar);
    live.addEventListener("pointerdown", onDown);
    live.addEventListener("pointermove", onMove);
    live.addEventListener("pointerup", onUp);
    live.addEventListener("pointercancel", onUp);
    // el lápiz salió del alcance: se olvida el estado del botón (si no, el próximo toque podía alternar de más)
    live.addEventListener("pointerleave", e => { if (e.pointerType !== "touch" && !cur) { eraserAt = null; drawLive(); if (e.pointerType === "pen") btn = null; } });
    live.addEventListener("wheel", onWheel, { passive: false });
    live.addEventListener("contextmenu", onContextMenu);
    new ResizeObserver(resize).observe(stage);
    // el escenario nunca se desplaza (el navegador lo hacía al enfocar un editor que se sale de la vista)
    stage.addEventListener("scroll", () => { stage.scrollLeft = 0; stage.scrollTop = 0; });
  }
  function syncBar() {
    if (!el) return;
    const on = (b, v, cond) => el.querySelectorAll(`[data-b="${b}"]${v != null ? `[data-v="${v}"]` : ""}`).forEach(x => x.classList.toggle("on", cond));
    for (const t of TOOLS) on("tool", t, prefs.tool === t);
    const th = theme(), st = el.querySelector(".bstyle");
    const colKey = prefs.tool === "hl" ? prefs.hlColor : prefs.color;
    st.hidden = prefs.tool === "lasso";
    st.querySelector("i").style.background = prefs.tool === "eraser" ? "transparent" : COLORS[colKey][th];
    st.querySelector("i").style.setProperty("--d", (prefs.tool === "text" || prefs.tool === "math" ? 12 : 6 + prefs.size * 4) + "px");
    st.classList.toggle("erase", prefs.tool === "eraser");
    const sp = el.querySelector('[data-b="split"]');
    sp.hidden = side;
    sp.innerHTML = ICON(prefs.split ? "maximize-2" : "panel-bottom");
    sp.title = prefs.split ? "Pizarra a pantalla completa" : "Dividir la pantalla: pizarra abajo";
    el.querySelector('[data-b="undo"]').disabled = !(page._undo && page._undo.length);
    el.querySelector('[data-b="redo"]').disabled = !(page._redo && page._redo.length);
    const i = pages.indexOf(page), n = pages.length + (i < 0 ? 1 : 0), pos = i < 0 ? n : i + 1;
    el.querySelector(".bpage-n").textContent = `${pos}/${n}`;
    el.querySelector('[data-b="prev"]').disabled = pos <= 1;
    el.querySelector('[data-b="next"]').disabled = pos >= n;
    el.querySelector('[data-b="new"]').disabled = !page.s.length && i < 0;
    // enunciado (solo con la pizarra a pantalla completa; acostada se ve a la izquierda)
    const pr = el.querySelector(".board-prompt");
    pr.hidden = docked || !ctxInfo || !ctxInfo.prompt || page.k !== ctxInfo.key;
    pr.classList.toggle("open", !!prefs.promptOpen);
  }
  function hint(msg) {
    const h = el.querySelector(".board-hint");
    h.textContent = msg; h.hidden = false;
    clearTimeout(hint.t); hint.t = setTimeout(() => { h.hidden = true; }, 1800);
  }

  // ---------- paneles: color y grosor, insertar, más opciones ----------
  let popKind = null;
  function openPop(kind) {
    if (popKind === kind) return closePop();
    popKind = kind;
    const th = theme(), t = prefs.tool;
    let html = "";
    if (kind === "style") {
      if (t !== "eraser") {
        const cur = t === "hl" ? prefs.hlColor : prefs.color;
        html += `<div class="bpop-row">${Object.keys(COLORS).map(c => `<button class="bcolor ${c === cur ? "on" : ""}" data-b="color" data-v="${c}" aria-label="Color ${COLOR_LABEL[c]}"><i style="background:${COLORS[c][th]}"></i></button>`).join("")}</div>`;
      }
      if (t === "pen" || t === "hl" || t === "eraser") html += `<div class="bpop-row">${[0, 1, 2].map(i => `<button class="bsize ${i === prefs.size ? "on" : ""}" data-b="size" data-v="${i}" aria-label="Grosor ${i + 1}"><i style="--d:${4 + i * 4}px"></i></button>`).join("")}</div>`;
      if (t === "eraser") html += `<div class="bpop-row">${[["stroke", "Por trazo"], ["area", "Por área"]].map(([v, l]) => `<button class="bopt ${prefs.eraseMode === v ? "on" : ""}" data-b="emode" data-v="${v}">${l}</button>`).join("")}</div>`;
      if (t === "text" || t === "math") html += `<div class="bpop-row">${TEXT_SIZES.map(z => `<button class="bopt ${prefs.textSize === z.v ? "on" : ""}" data-b="tsize" data-v="${z.v}">${z.label}</button>`).join("")}</div>`;
    } else if (kind === "insert") {
      html = `<button class="bitem" data-b="ins" data-v="axes">${ICON("axes")}Ejes cartesianos</button>
        <button class="bitem" data-b="ins" data-v="function">${ICON("function")}Graficar una función</button>
        <button class="bitem" data-b="ins" data-v="line">${ICON("ruler-line")}Recta numérica</button>`;
    } else {
      html = `<div class="bpop-row">${PAPERS.map(p => `<button class="bopt ${prefs.paper === p ? "on" : ""}" data-b="paper" data-v="${p}">${PAPER_LABEL[p]}</button>`).join("")}</div>
        <button class="bitem ${fingerDraws() ? "on" : ""}" data-b="finger">${ICON("hand")}${fingerDraws() ? "El dedo dibuja" : "El dedo mueve la hoja"}</button>
        <button class="bitem ${prefs.shapes !== false ? "on" : ""}" data-b="shapes">${ICON("sparkles")}${prefs.shapes !== false ? "Formas automáticas: sí" : "Formas automáticas: no"}</button>
        <button class="bitem" data-b="export" data-v="png">${ICON("download")}Exportar la hoja en PNG</button>
        <button class="bitem" data-b="export" data-v="pdf">${ICON("file-text")}Exportar la hoja en PDF</button>
        <button class="bitem" data-b="clear">${ICON("trash-2")}Borrar todo lo de esta hoja</button>`;
    }
    pop.innerHTML = html;
    pop.hidden = false;
    // debajo del botón que lo abrió, sin salirse de la pizarra
    const btnEl = el.querySelector(`[data-b="${kind}"]`), r = btnEl.getBoundingClientRect(), er = el.getBoundingClientRect();
    pop.style.top = (r.bottom - er.top + 6) + "px";
    pop.style.left = Math.max(8, Math.min(er.width - pop.offsetWidth - 8, r.left - er.left)) + "px";
  }
  function closePop() { popKind = null; if (pop) pop.hidden = true; }

  function setPage(p) {
    if (page) views.set(page.id, { ...view });
    closeEditor(true);
    page = p;
    sel = null;
    Object.assign(view, views.get(p.id) || { x: 0, y: 0, z: 1 });
    cur = null; clearLive();
    syncBar(); redraw();
  }
  function pageFor(key, label) {
    return (key && pages.find(p => p.k === key)) || (page && key && page.k === key ? page : null) || newPage(key, label);
  }

  // ---------- dibujo ----------
  function resize() {
    if (!el) return;
    const r = stage.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    cssW = r.width; cssH = r.height;
    for (const c of [base, live]) { c.width = Math.round(cssW * dpr); c.height = Math.round(cssH * dpr); }
    clampView(); redraw(); drawLive();
  }
  function clampView() {
    const sc = scale(), vw = cssW / sc;
    view.x = Math.max(0, Math.min(view.x, PAGE_W - vw));
    let bottom = 0;
    if (page) for (const s of page.s) bottom = Math.max(bottom, bbOf(s).y1);
    view.y = Math.max(0, Math.min(view.y, bottom + cssH / sc * 0.7));
  }
  function setXform(c) { const sc = scale() * dpr; c.setTransform(sc, 0, 0, sc, -view.x * sc, -view.y * sc); }
  const cssVar = (n, d) => (getComputedStyle(el).getPropertyValue(n).trim() || d);
  // el papel (en coordenadas de pantalla): cuadriculado, rayado, punteado o liso
  function paper(c, w, h, vx, vy, sc, k) {
    c.fillStyle = cssVar("--board-paper", "#fff");
    c.fillRect(0, 0, w, h);
    if (prefs.paper === "blank") return;
    const step = prefs.paper === "lines" ? 40 : 25, rule = cssVar("--board-rule", "#ddd");
    const y0 = Math.floor(vy / step) * step, x0 = Math.floor(vx / step) * step;
    if (prefs.paper === "dots") {
      c.fillStyle = rule;
      const r = Math.max(1, 1.6 * k);
      for (let y = y0; (y - vy) * sc < h; y += step) for (let x = x0; (x - vx) * sc < w; x += step) { c.beginPath(); c.arc((x - vx) * sc, (y - vy) * sc, r, 0, Math.PI * 2); c.fill(); }
      return;
    }
    c.strokeStyle = rule; c.lineWidth = k;
    c.beginPath();
    for (let y = y0; (y - vy) * sc < h; y += step) { const py = Math.round((y - vy) * sc) + 0.5; c.moveTo(0, py); c.lineTo(w, py); }
    if (prefs.paper === "grid") for (let x = x0; (x - vx) * sc < w; x += step) { const px = Math.round((x - vx) * sc) + 0.5; c.moveTo(px, 0); c.lineTo(px, h); }
    c.stroke();
    if (prefs.paper === "lines") {   // margen, como en una hoja rayada
      const px = Math.round((70 - vx) * sc) + 0.5;
      c.strokeStyle = cssVar("--board-margin", "#f99");
      c.beginPath(); c.moveTo(px, 0); c.lineTo(px, h); c.stroke();
    }
  }
  function drawStroke(c, s, th, path) {
    if (s.o) return drawItem(c, s, colorOf(s, th), cssVar("--board-rule", "#ddd"));
    c.globalAlpha = s.h ? HL_ALPHA : 1;
    c.fillStyle = colorOf(s, th);
    c.fill(path || strokePath(s));
    c.globalAlpha = 1;
  }
  // lo que no se dibuja en la capa de abajo: lo que se arrastra con el lazo y lo que se edita con el teclado
  const hiddenSet = () => {
    const h = new Set();
    if (cur && cur.type === "drag" && sel) for (const s of sel.list) h.add(s);
    if (editor && editor.stroke) h.add(editor.stroke);
    return h;
  };
  function redraw() {
    if (!el || !open) return;
    cancelAnimationFrame(rafBase); rafBase = 0;
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paper(bctx, cssW, cssH, view.x, view.y, scale(), 1);
    setXform(bctx);
    const th = theme(), sc = scale(), vx1 = view.x + cssW / sc, vy1 = view.y + cssH / sc, hid = hiddenSet();
    for (const s of page.s) {
      const b = bbOf(s);
      if (hid.has(s) || b.x1 < view.x || b.x0 > vx1 || b.y1 < view.y || b.y0 > vy1) continue;
      drawStroke(bctx, s, th);
    }
    drawLive();
    placeOverlays();
  }
  const redrawSoon = () => { if (!rafBase) rafBase = requestAnimationFrame(redraw); };
  function clearLive() { if (lctx) { lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, live.width, live.height); } }
  // capa de arriba: el trazo en curso, el lazo, la selección y el cursor de la goma
  let eraserAt = null;
  function drawLive() {
    rafLive = 0;
    if (!el || !open) return;
    clearLive(); setXform(lctx);
    const th = theme(), sc = scale(), accent = COLORS.violet[th];
    if (cur && cur.type === "ink") {
      drawStroke(lctx, cur.s, th, inkPath(cur.s, true, cur.s.h ? null : predicted));
    }
    if (cur && cur.type === "lasso") {
      lctx.beginPath();
      const P = cur.pts;
      lctx.moveTo(P[0], P[1]);
      for (let i = 2; i < P.length; i += 2) lctx.lineTo(P[i], P[i + 1]);
      lctx.closePath();
      lctx.fillStyle = accent; lctx.globalAlpha = 0.08; lctx.fill(); lctx.globalAlpha = 1;
      lctx.setLineDash([6 / sc, 5 / sc]); lctx.lineWidth = 1.5 / sc; lctx.strokeStyle = accent; lctx.stroke(); lctx.setLineDash([]);
    }
    if (sel) {
      let box = sel.box;
      if (cur && cur.type === "drag") {
        const d = cur;
        for (const s of sel.list) drawStroke(lctx, cloneStroke(s, { w: s.w * d.k, p: transformPts(s.p, d.k, d.ox, d.oy, d.dx, d.dy) }), th);
        box = [d.ox + (box[0] - d.ox) * d.k + d.dx, d.oy + (box[1] - d.oy) * d.k + d.dy, d.ox + (box[2] - d.ox) * d.k + d.dx, d.oy + (box[3] - d.oy) * d.k + d.dy];
      }
      lctx.setLineDash([6 / sc, 5 / sc]); lctx.lineWidth = 1.5 / sc; lctx.strokeStyle = accent;
      lctx.strokeRect(box[0], box[1], box[2] - box[0], box[3] - box[1]); lctx.setLineDash([]);
      const hs = HANDLE_PX / sc;
      lctx.fillStyle = COLORS.ink[1 - th]; lctx.lineWidth = 2 / sc;
      for (const [x, y] of corners(box)) { lctx.beginPath(); lctx.rect(x - hs / 2, y - hs / 2, hs, hs); lctx.fill(); lctx.stroke(); }
    }
    if (eraserAt && !(cur && cur.type !== "erase")) {
      const r = eraserR();
      lctx.beginPath(); lctx.arc(eraserAt[0], eraserAt[1], r, 0, Math.PI * 2);
      lctx.lineWidth = 1.5 / sc; lctx.strokeStyle = COLORS.ink[th]; lctx.globalAlpha = 0.5; lctx.stroke(); lctx.globalAlpha = 1;
    }
  }
  const corners = b => [[b[0], b[1]], [b[2], b[1]], [b[2], b[3]], [b[0], b[3]]];
  const eraserR = () => SIZES.eraser[prefs.size] / Math.max(view.z, 1) * 1.2;

  // ---------- entrada ----------
  let cur = null;              // en curso: ink { s, path }, erase, lasso, drag o place
  let lastPen = 0, rafLive = 0, predicted = [];
  const touches = new Map();   // dedos que mueven la hoja
  let gesture = null, tap2 = null, tap1 = null;
  function toPage(e) {
    const r = live.getBoundingClientRect(), sc = scale();
    return [view.x + (e.clientX - r.left) / sc, view.y + (e.clientY - r.top) / sc];
  }
  const pressureOf = e => (e.pointerType === "pen" ? Math.max(0.05, Math.min(1, e.pressure || 0.5)) : 0.5);
  // botón del S Pen: Chrome lo informa como botón 2 (barril) y la punta de borrar como 32.
  // - Apretarlo y soltarlo sin tocar la pantalla alterna entre el borrador y la herramienta anterior.
  // - Mantenerlo apretado mientras se escribe borra solo mientras dura el trazo.
  // - Un clic largo (más de 1,5 s) sin tocar no hace nada, por si se apretó sin querer.
  let btn = null, btnReleased = 0, hoverBtnSeen = false;
  const btnPressed = e => e.pointerType === "pen" && (e.buttons & 34) !== 0;
  function trackButton(e) {
    if (e.pointerType !== "pen") return;
    const pressed = btnPressed(e), touching = (e.buttons & 1) !== 0 || e.type === "pointerdown" || !!cur;
    if (pressed) {
      if (!btn) btn = { t: performance.now(), touched: touching };
      else if (touching) btn.touched = true;
      if (!touching) hoverBtnSeen = true;   // este equipo informa el botón al pasar por encima
    } else if (btn) {
      const b = btn; btn = null; btnReleased = performance.now();
      if (!b.touched && btnReleased - b.t < 1500) toggleEraser();
    }
  }
  function setTool(t) {
    if (prefs.tool === t) return;
    prefs.tool = t;
    if (t !== "lasso") clearSelection();
    eraserAt = null;
    savePrefs(); syncBar(); drawLive();
  }
  function toggleEraser() {
    if (prefs.tool === "eraser") setTool(prefs.prevTool && prefs.prevTool !== "eraser" ? prefs.prevTool : "pen");
    else { prefs.prevTool = prefs.tool; setTool("eraser"); }
    hint(prefs.tool === "eraser" ? "Goma" : TOOL_INFO[prefs.tool][1].split(":")[0]);
  }
  // algunos Android no mandan el estado del botón al pasar el lápiz por encima, pero sí un "clic derecho"
  function onContextMenu(e) {
    e.preventDefault();
    // con el lápiz apoyado, un «clic largo» no es el botón (pasaba al dejar el lápiz quieto: cambiaba de modo solo)
    if (cur || hoverBtnSeen || btn || performance.now() - btnReleased < 600 || performance.now() - lastPen > 1500) return;
    toggleEraser();
  }
  function onDown(e) {
    closePop();
    if (editor) { closeEditor(); return; }   // tocar afuera del editor lo confirma
    trackButton(e);
    if (e.pointerType === "pen") {
      e.preventDefault();
      lastPen = performance.now();
      if (!prefs.pen) { prefs.pen = true; savePrefs(); syncBar(); }
    }
    const isTouch = e.pointerType === "touch";
    if (isTouch) {
      // palma: con el lápiz en uso (o recién usado) los dedos no hacen nada
      if ((cur && cur.pen) || performance.now() - lastPen < 500) return;
      if (fingerDraws() && !touches.size && !cur) return startStroke(e);
      if (cur && cur.finger) cancelStroke();
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      // un toque corto con dos dedos deshace; con uno, con Texto o Fórmula, escribe ahí
      if (touches.size === 2) tap2 = { t: performance.now(), moved: 0 };
      if (touches.size === 1) tap1 = { t: performance.now(), x: e.clientX, y: e.clientY, moved: 0, at: toPage(e) };
      else tap1 = null;
      capture(e);
      startGesture();
      return;
    }
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (cur) return;
    if (touches.size) { touches.clear(); gesture = null; }
    startStroke(e);
  }
  // si el puntero ya no está activo (eventos sintéticos, un lápiz que se fue), no cortar el trazo por eso
  function capture(e) { try { live.setPointerCapture(e.pointerId); } catch (err) { /* sigue sin captura */ } }
  function startStroke(e) {
    capture(e);
    const base0 = { id: e.pointerId, pen: e.pointerType === "pen", finger: e.pointerType === "touch" };
    // botón del S Pen (barril) o la punta de borrar: borra mientras se mantiene
    const erase = prefs.tool === "eraser" || (e.buttons & 32) || (e.pointerType === "pen" && (e.buttons & 2));
    const [x, y] = toPage(e);
    if (erase) {
      cur = Object.assign(base0, { type: "erase", acts: [], area: prefs.eraseMode === "area" && prefs.tool === "eraser" });
      eraseMove(x, y);
      return;
    }
    if (prefs.tool === "lasso") {
      const r = live.getBoundingClientRect(), hit = sel && hitSelection(e.clientX - r.left, e.clientY - r.top);
      if (hit) { cur = Object.assign(base0, { type: "drag", mode: hit.mode, start: [x, y], ox: hit.anchor[0], oy: hit.anchor[1], k: 1, dx: 0, dy: 0 }); hideSelBar(); redraw(); return; }
      clearSelection();
      cur = Object.assign(base0, { type: "lasso", pts: [x, y] });
      return;
    }
    if (prefs.tool === "text" || prefs.tool === "math") {
      cur = Object.assign(base0, { type: "place", at: [x, y], sx: e.clientX, sy: e.clientY, moved: false });
      return;
    }
    const hl = prefs.tool === "hl";
    const s = { c: hl ? prefs.hlColor : prefs.color, w: SIZES[hl ? "hl" : "pen"][prefs.size], h: hl ? 1 : 0, p: [x, y, pressureOf(e)] };
    if (e.pointerType !== "pen") s.m = 1;   // sin presión real: perfect-freehand la simula por velocidad
    cur = Object.assign(base0, { type: "ink", s, still: [e.clientX, e.clientY] });
    armHold();
    drawLive();
  }
  // formas: si el lápiz queda quieto, el trazo se vuelve la forma reconocida; mientras siga apoyado, la forma lo sigue
  function armHold() {
    if (!cur || cur.type !== "ink") return;
    clearTimeout(cur.holdT);
    if (prefs.shapes === false || cur.shape || cur.s.h) return;
    const c = cur;
    c.holdT = setTimeout(() => {
      if (cur !== c || c.shape) return;
      const pts = Sh.fromStroke(c.s.p), sh = Sh.recognize(pts);
      if (!sh) return;
      c.shape = sh; c.anchor = pts[pts.length - 1];
      setShape(c, sh.verts);
      if (navigator.vibrate) navigator.vibrate(8);
    }, HOLD_MS);
  }
  function setShape(c, verts) {
    c.s.p = Sh.toStroke(verts, c.shape.closed);
    delete c.s.m;   // las formas tienen grosor parejo
    predicted = [];
    drawLive();
  }
  function onMove(e) {
    if (e.pointerType === "pen") { lastPen = performance.now(); trackButton(e); }
    // se apretó el botón en medio de un trazo: lo escrito queda y sigue borrando
    if (cur && cur.type === "ink" && e.pointerId === cur.id && btnPressed(e)) {
      const c = cur;
      clearTimeout(c.holdT);
      if (c.s.p.length > 3) commitStroke(c);
      cur = { id: c.id, pen: c.pen, type: "erase", acts: [] };
      drawLive();
    }
    if (touches.has(e.pointerId)) {
      const t0 = touches.get(e.pointerId), d = Math.hypot(e.clientX - t0.x, e.clientY - t0.y);
      if (tap2) tap2.moved = Math.max(tap2.moved, d);
      if (tap1) tap1.moved = Math.max(tap1.moved, Math.hypot(e.clientX - tap1.x, e.clientY - tap1.y));
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY }); moveGesture(); return;
    }
    if (!cur || e.pointerId !== cur.id) {
      if (!cur && e.pointerType !== "touch" && prefs.tool === "eraser") { eraserAt = toPage(e); drawLive(); }
      return;
    }
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    const pts = (evs.length ? evs : [e]).map(toPage);
    if (cur.type === "erase") { for (const [x, y] of pts) eraseMove(x, y); return; }
    const [x, y] = pts[pts.length - 1];
    if (cur.type === "lasso") { for (const [px, py] of pts) cur.pts.push(px, py); schedLive(); return; }
    if (cur.type === "place") { if (Math.hypot(e.clientX - cur.sx, e.clientY - cur.sy) > 12) cur.moved = true; return; }
    if (cur.type === "drag") {
      if (cur.mode === "move") { cur.dx = x - cur.start[0]; cur.dy = y - cur.start[1]; }
      else {
        // escala uniforme desde la esquina opuesta, según la distancia
        const d0 = Math.hypot(cur.start[0] - cur.ox, cur.start[1] - cur.oy), d1 = Math.hypot(x - cur.ox, y - cur.oy);
        cur.k = Math.max(0.1, Math.min(10, d1 / Math.max(1, d0)));
      }
      schedLive(); return;
    }
    if (cur.shape) { setShape(cur, Sh.adjustShape(cur.shape, cur.anchor, { x, y })); return; }
    // se movió: vuelve a esperar a que quede quieto
    if (Math.hypot(e.clientX - cur.still[0], e.clientY - cur.still[1]) > HOLD_PX) { cur.still = [e.clientX, e.clientY]; armHold(); }
    const s = cur.s;
    for (let k = 0; k < pts.length; k++) {
      const [px, py] = pts[k], n = s.p.length;
      // puntos repetidos no aportan y engrosan el trazo en perfect-freehand
      if (Math.abs(px - s.p[n - 3]) < 0.05 && Math.abs(py - s.p[n - 2]) < 0.05) continue;
      s.p.push(px, py, pressureOf(evs.length ? evs[k] : e));
    }
    const pr = pressureOf(e);
    predicted = e.getPredictedEvents ? e.getPredictedEvents().slice(0, 3).flatMap(ev => [...toPage(ev), pr]) : [];
    schedLive();
  }
  const schedLive = () => { if (!rafLive) rafLive = requestAnimationFrame(drawLive); };
  function eraseMove(x, y) {
    const r = eraserR();
    // se recorre el tramo desde la posición anterior, para que un movimiento rápido no saltee trazos
    const [px, py] = cur.last || [x, y], steps = Math.max(1, Math.ceil(Math.hypot(x - px, y - py) / (r / 2)));
    let any = false;
    for (let k = 1; k <= steps; k++) {
      const qx = px + (x - px) * k / steps, qy = py + (y - py) * k / steps;
      const act = cur.area ? eraseArea(page, qx, qy, r) : eraseAt(page, qx, qy, r);
      if (act) { cur.acts.push(act); any = true; }
    }
    cur.last = [x, y];
    eraserAt = [x, y];
    if (any) redraw(); else drawLive();
  }
  function onUp(e) {
    trackButton(e);
    if (touches.has(e.pointerId)) {
      touches.delete(e.pointerId);
      if (!touches.size) {
        const now = performance.now();
        if (tap2 && now - tap2.t < TAP_MS && tap2.moved < TAP_MOVE_PX) { if (undoAny(page)) { clearSelection(); redraw(); persist(page); syncBar(); hint("Deshecho"); } }
        else if (tap1 && now - tap1.t < TAP_MS && tap1.moved < TAP_MOVE_PX && (prefs.tool === "text" || prefs.tool === "math")) place(tap1.at);
        tap1 = tap2 = null;
      }
      startGesture(); return;
    }
    if (!cur || e.pointerId !== cur.id) return;
    if (e.pointerType === "pen") lastPen = performance.now();
    const c = cur; cur = null; predicted = [];
    clearTimeout(c.holdT);
    cancelAnimationFrame(rafLive); rafLive = 0;
    const cancel = e.type === "pointercancel";
    if (c.type === "erase") {
      // un arrastre del borrador son varios borrados sucesivos: se deshacen juntos
      if (c.acts.length) { (page._undo || (page._undo = [])).push({ a: "seq", acts: c.acts }); page._redo = []; persist(page); }
      if (c.pen || prefs.tool !== "eraser") eraserAt = null;
      syncBar(); drawLive();
      return;
    }
    if (c.type === "lasso") {
      if (!cancel && c.pts.length >= 6) {
        const list = page.s.filter(s => fractionInside(s.p, c.pts) >= LASSO_FRACTION);
        if (list.length) select(list);
      }
      drawLive(); return;
    }
    if (c.type === "drag") {
      if (!cancel && (c.k !== 1 || c.dx || c.dy)) {
        const add = sel.list.map(s => cloneStroke(s, { w: s.w * c.k, p: transformPts(s.p, c.k, c.ox, c.oy, c.dx, c.dy) }));
        commit({ a: "rep", rem: sel.list, add });
        select(add);
      } else { redraw(); showSelBar(); }
      return;
    }
    if (c.type === "place") { if (!cancel && !c.moved) place(c.at); return; }
    if (cancel && c.finger) { drawLive(); return; }
    commitStroke(c);
    syncBar();
  }
  function commitStroke(c) {
    c.s._path = inkPath(c.s, false);
    doAct(page, { a: "add", s: c.s });
    drawLive();
    setXform(bctx); drawStroke(bctx, c.s, theme());   // se agrega sola, sin redibujar la hoja
    persist(page);
  }
  function cancelStroke() { if (cur) clearTimeout(cur.holdT); cur = null; predicted = []; drawLive(); }

  // gestos con los dedos: uno mueve, dos hacen zoom
  function startGesture() {
    const pts = [...touches.values()];
    if (!pts.length) { gesture = null; return; }
    gesture = { pts: pts.map(p => ({ ...p })), view: { ...view } };
    if (pts.length >= 2) gesture.d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  }
  function moveGesture() {
    if (!gesture) return;
    const pts = [...touches.values()], g = gesture, r = live.getBoundingClientRect();
    if (pts.length >= 2 && g.pts.length >= 2) {
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const m0 = { x: (g.pts[0].x + g.pts[1].x) / 2 - r.left, y: (g.pts[0].y + g.pts[1].y) / 2 - r.top };
      const m1 = { x: (pts[0].x + pts[1].x) / 2 - r.left, y: (pts[0].y + pts[1].y) / 2 - r.top };
      const sc0 = (cssW / PAGE_W) * g.view.z;
      const z = Math.max(1, Math.min(4, g.view.z * d / (g.d || d)));
      const px = g.view.x + m0.x / sc0, py = g.view.y + m0.y / sc0;   // punto de la hoja bajo los dedos
      view.z = z;
      const sc = scale();
      view.x = px - m1.x / sc; view.y = py - m1.y / sc;
    } else {
      const sc = scale();
      view.x = g.view.x - (pts[0].x - g.pts[0].x) / sc;
      view.y = g.view.y - (pts[0].y - g.pts[0].y) / sc;
    }
    clampView(); redrawSoon();
  }
  function onWheel(e) {
    e.preventDefault();
    if (e.ctrlKey) {
      const r = live.getBoundingClientRect(), sc0 = scale();
      const px = view.x + (e.clientX - r.left) / sc0, py = view.y + (e.clientY - r.top) / sc0;
      view.z = Math.max(1, Math.min(4, view.z * Math.exp(-e.deltaY / 300)));
      const sc = scale();
      view.x = px - (e.clientX - r.left) / sc; view.y = py - (e.clientY - r.top) / sc;
    } else { const sc = scale(); view.x += e.deltaX / sc; view.y += e.deltaY / sc; }
    clampView(); redrawSoon();
  }

  // ---------- lazo: selección, mover, escalar ----------
  function select(list) {
    const b = list.map(bbOf).reduce((a, x) => ({ x0: Math.min(a.x0, x.x0), y0: Math.min(a.y0, x.y0), x1: Math.max(a.x1, x.x1), y1: Math.max(a.y1, x.y1) }));
    // margen para que una línea recta no deje una caja chata con las manijas encimadas
    const pad = SEL_PAD_PX / scale();
    sel = { list, box: [b.x0 - pad, b.y0 - pad, b.x1 + pad, b.y1 + pad] };
    drawLive(); showSelBar();
  }
  function clearSelection() { if (!sel) return; sel = null; hideSelBar(); drawLive(); }
  // ¿el punto de pantalla cae en una manija (escalar) o dentro de la selección (mover)?
  function hitSelection(sx, sy) {
    const cs = corners(sel.box), reach = HANDLE_PX * 1.4;
    for (let i = 0; i < 4; i++) {
      const [x, y] = toScreen(cs[i][0], cs[i][1]);
      if (Math.abs(x - sx) <= reach && Math.abs(y - sy) <= reach) return { mode: "scale", anchor: cs[(i + 2) % 4] };
    }
    const [x0, y0] = toScreen(sel.box[0], sel.box[1]), [x1, y1] = toScreen(sel.box[2], sel.box[3]);
    if (sx >= x0 - 8 && sx <= x1 + 8 && sy >= y0 - 8 && sy <= y1 + 8) return { mode: "move", anchor: [sel.box[0], sel.box[1]] };
    return null;
  }
  function showSelBar() {
    if (!sel) return hideSelBar();
    const one = sel.list.length === 1 && sel.list[0].o ? sel.list[0] : null;
    let extra = "";
    if (one) extra = `<button class="bsel-main" data-b="sel-edit">${ICON("square-pen")}Editar</button>` + (one.o.k === "axes" ? `<button class="bsel-fx" data-b="sel-fn" aria-label="Graficar otra función en estos ejes" title="Graficar otra función">f(x)</button>` : "");
    selBar.innerHTML = `${extra}<button data-b="sel-del" aria-label="Borrar lo seleccionado" title="Borrar">${ICON("trash-2")}</button>
      <button data-b="sel-dup" aria-label="Duplicar" title="Duplicar">${ICON("copy")}</button>
      <button data-b="sel-color" aria-label="Cambiar el color" title="Cambiar el color"><i class="bring"></i></button>
      <button data-b="sel-done" aria-label="Listo" title="Listo">${ICON("check")}</button>`;
    selBar.hidden = false;
    placeOverlays();
  }
  function hideSelBar() { if (selBar) selBar.hidden = true; }
  // la barra de la selección y el editor siguen a la hoja cuando se mueve o se hace zoom
  function placeOverlays() {
    if (sel && selBar && !selBar.hidden) {
      const [x0, y0] = toScreen(sel.box[0], sel.box[1]), [x1, y1] = toScreen(sel.box[2], sel.box[3]);
      const w = selBar.offsetWidth, hgt = selBar.offsetHeight || 48;
      selBar.style.left = Math.max(6, Math.min(cssW - w - 6, (x0 + x1) / 2 - w / 2)) + "px";
      selBar.style.top = (y0 - hgt - 10 > 4 ? y0 - hgt - 10 : Math.min(cssH - hgt - 6, y1 + 10)) + "px";
    }
    if (editor) positionEditor();
  }
  function selAction(kind, v) {
    if (!sel) return;
    if (kind === "sel-del") { commit({ a: "rep", rem: sel.list, add: [] }); clearSelection(); }
    else if (kind === "sel-dup") {
      const add = sel.list.map(s => cloneStroke(s, { p: transformPts(s.p, 1, 0, 0, 24, 24) }));
      commit({ a: "rep", rem: [], add }); select(add);
    } else if (kind === "sel-color") {
      const th = theme();
      selBar.innerHTML = Object.keys(COLORS).map(c => `<button data-b="sel-recolor" data-v="${c}" aria-label="Color ${COLOR_LABEL[c]}"><i class="bdot" style="background:${COLORS[c][th]}"></i></button>`).join("") + `<button data-b="sel-back" aria-label="Volver">${ICON("chevron-left")}</button>`;
    } else if (kind === "sel-recolor") {
      // misma forma, otro color: el contorno ya calculado sirve
      const add = sel.list.map(s => { const c = cloneStroke(s, { c: v }); if (s._path) c._path = s._path; return c; });
      commit({ a: "rep", rem: sel.list, add }); select(add);
    } else if (kind === "sel-back") showSelBar();
    else if (kind === "sel-done") clearSelection();
    else if (kind === "sel-edit" || kind === "sel-fn") {
      const s = sel.list[0];
      if (kind === "sel-fn") return dialog("function", s);
      if (s.o.k === "text" || s.o.k === "math") { clearSelection(); openEditor(s.o.k, s); }
      else dialog(s.o.k, s);
    }
  }

  // ---------- texto y fórmulas ----------
  // botones para escribir fórmulas sin saber la sintaxis: insertan AsciiMath
  const SYMBOLS = [["x²", "^2", "Al cuadrado"], ["xⁿ", "^()", "Potencia"], ["√", "sqrt()", "Raíz cuadrada: sqrt(x)"], ["ⁿ√", "root(3)()", "Raíz n-ésima: root(3)(x)"],
    ["a⁄b", "()/()", "Fracción: (a)/(b)"], ["xᵢ", "_()", "Subíndice"], ["π", "pi", "Pi"], ["±", "+-", "Más o menos"], ["·", "*", "Por"],
    ["≤", "<=", "Menor o igual"], ["≥", ">=", "Mayor o igual"], ["≠", "!=", "Distinto"], ["∞", "oo", "Infinito"], ["α", "alpha", "alpha, beta, theta…"],
    ["θ", "theta", "theta"], ["∫", "int_()^()", "Integral: int_a^b"], ["Σ", "sum_()^()", "Sumatoria: sum_(i=1)^n"], ["lím", "lim_(x->)", "Límite: lim_(x->0)"], ["→", "->", "Tiende a"]];
  // tocar la hoja con Texto o Fórmula: crear, o editar el que ya estaba ahí
  function place([x, y]) {
    const tol = 4 / scale();
    for (let i = page.s.length - 1; i >= 0; i--) {
      const s = page.s[i], b = s.o && (s.o.k === "text" || s.o.k === "math") && bbOf(s);
      if (b && x >= b.x0 - tol && x <= b.x1 + tol && y >= b.y0 - tol && y <= b.y1 + tol) return openEditor(s.o.k, s);
    }
    const size = prefs.textSize;
    // la primera línea queda a la altura del toque
    openEditor(prefs.tool, null, x - size * PAD, y - size * (PAD + 0.6));
  }
  function openEditor(kind, stroke, x, y) {
    closeEditor();
    clearSelection();
    const isMath = kind === "math", o = stroke && stroke.o;
    if (stroke) { const b = bbOf(stroke); x = b.x0; y = b.y0; }
    editor = { kind, stroke, x, y, size: stroke ? stroke.w : prefs.textSize, bold: o && o.k === "text" ? !!o.b : !!prefs.bold, color: stroke ? stroke.c : prefs.color };
    const th = theme();
    const box = document.createElement("div");
    box.className = "bedit" + (isMath ? " is-math" : "");
    box.innerHTML = `<div class="bedit-bar" role="toolbar" aria-label="${isMath ? "Fórmula" : "Texto"}">
        <button data-e="smaller" aria-label="Letra más chica" title="Más chica"><span class="bglyph sm">A</span></button>
        <select data-e="size" aria-label="Tamaño de letra">${TEXT_SIZES.map(z => `<option value="${z.v}">${z.label}</option>`).join("")}</select>
        <button data-e="bigger" aria-label="Letra más grande" title="Más grande"><span class="bglyph">A</span></button>
        ${isMath ? "" : `<button data-e="bold" aria-label="Negrita" title="Negrita (Ctrl B)">${ICON("bold")}</button>`}
        <span class="bsep"></span>
        ${Object.keys(COLORS).map(c => `<button data-e="color" data-v="${c}" aria-label="Color ${COLOR_LABEL[c]}"><i class="bdot" style="background:${COLORS[c][th]}"></i></button>`).join("")}
        <span class="bsep"></span>
        ${stroke ? `<button data-e="del" aria-label="Borrar" title="Borrar">${ICON("trash-2")}</button>` : ""}
        <button data-e="ok" class="bedit-ok">Listo</button></div>
      ${isMath ? `<div class="bedit-sym">${SYMBOLS.map(([l, ins, t]) => `<button data-e="sym" data-v="${esc(ins)}" title="${esc(t)}">${l}</button>`).join("")}</div>` : ""}
      <textarea class="bedit-in" rows="1" spellcheck="${!isMath}" autocapitalize="${isMath ? "off" : "sentences"}" autocorrect="${isMath ? "off" : "on"}" placeholder="${isMath ? "x^2 + 2, sqrt(x)/3, (a+b)/2…" : "Escribí acá"}" aria-label="${isMath ? "Fórmula, como en la calculadora: x^2, sqrt(x), (a)/(b)" : "Texto"}"></textarea>
      ${isMath ? `<div class="bedit-prev" aria-live="polite"></div>` : ""}`;
    stage.appendChild(box);
    editor.el = box;
    const ta = box.querySelector("textarea");
    ta.value = o ? (o.k === "text" ? o.t : o.s) : "";
    box.addEventListener("pointerdown", e => { e.stopPropagation(); if (e.target !== ta && !e.target.closest("select")) e.preventDefault(); });
    box.addEventListener("click", onEditorClick);
    box.querySelector('[data-e="size"]').addEventListener("change", e => setEditorSize(+e.target.value));
    ta.addEventListener("input", syncEditor);
    ta.addEventListener("keydown", e => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && (e.key === "+" || e.key === "=")) { e.preventDefault(); setEditorSize(editor.size * 1.15); }
      else if (mod && e.key === "-") { e.preventDefault(); setEditorSize(editor.size / 1.15); }
      else if (mod && e.key.toLowerCase() === "b" && !isMath) { e.preventDefault(); editor.bold = !editor.bold; syncEditor(); }
      else if (e.key === "Escape" || (e.key === "Enter" && (isMath || mod))) { e.preventDefault(); closeEditor(); }
      e.stopPropagation();
    });
    if (isMath) loadMath().then(() => { if (editor && editor.el === box) syncEditor(); });
    redraw();   // el objeto que se edita no se dibuja en la hoja (lo muestra el editor)
    syncEditor();
    // sin desplazar la hoja: el editor puede quedar en parte fuera de la vista
    ta.focus({ preventScroll: true });
    ta.setSelectionRange(ta.value.length, ta.value.length);
  }
  function setEditorSize(v) { editor.size = Math.round(Math.min(200, Math.max(12, v))); prefs.textSize = editor.size; savePrefs(); syncEditor(); }
  function onEditorClick(e) {
    const b = e.target.closest("[data-e]");
    if (!b || !editor) return;
    const ta = editor.el.querySelector("textarea");
    switch (b.dataset.e) {
      case "smaller": setEditorSize(editor.size / 1.15); break;
      case "bigger": setEditorSize(editor.size * 1.15); break;
      case "bold": editor.bold = !editor.bold; prefs.bold = editor.bold; savePrefs(); syncEditor(); break;
      case "color": editor.color = b.dataset.v; prefs.color = b.dataset.v; savePrefs(); syncEditor(); syncBar(); break;
      case "del": ta.value = ""; closeEditor(); return;
      case "ok": closeEditor(); return;
      case "sym": {
        const s = b.dataset.v, a0 = ta.selectionStart, a1 = ta.selectionEnd;
        ta.value = ta.value.slice(0, a0) + s + ta.value.slice(a1);
        // el cursor queda dentro del primer paréntesis vacío, si hay
        const inside = s.indexOf("()"), pos = a0 + (inside >= 0 ? inside + 1 : s.length);
        ta.focus({ preventScroll: true }); ta.setSelectionRange(pos, pos); syncEditor();
        break;
      }
    }
    if (b.dataset.e !== "sym") ta.focus({ preventScroll: true });
  }
  function syncEditor() {
    if (!editor) return;
    const ed = editor, box = ed.el, ta = box.querySelector("textarea"), th = theme();
    const sel0 = box.querySelector('[data-e="size"]');
    if (!TEXT_SIZES.some(z => z.v === ed.size)) {
      let o = sel0.querySelector("option.custom");
      if (!o) { o = document.createElement("option"); o.className = "custom"; sel0.prepend(o); }
      o.value = ed.size; o.textContent = ed.size;
    }
    sel0.value = String(ed.size);
    box.querySelectorAll('[data-e="color"]').forEach(x => x.classList.toggle("on", x.dataset.v === ed.color));
    const bb = box.querySelector('[data-e="bold"]');
    if (bb) bb.classList.toggle("on", ed.bold);
    box.style.color = COLORS[ed.color][th];
    const lines = ta.value.split("\n");
    ta.rows = ed.kind === "math" ? 1 : lines.length;
    ta.cols = Math.max(4, ...lines.map(l => l.length + 2));
    ta.style.fontWeight = ed.bold && ed.kind === "text" ? 700 : 400;
    const prev = box.querySelector(".bedit-prev");
    if (prev) {
      const v = ta.value.trim(), m = v && mathSvg(v);
      prev.innerHTML = m ? `<span class="bmath">${m.svg}</span>${m.error ? `<small class="berr">${m.error}</small>` : ""}`
        : `<small>${MJ.st === 3 ? "No se pudo cargar el armado de fórmulas (hace falta conexión la primera vez)." : MJ.st === 2 ? "Como en la calculadora: x^2 + 2, sqrt(x)/3, (a+b)/(c), alpha" : "Cargando…"}</small>`;
    }
    positionEditor();
  }
  function positionEditor() {
    const ed = editor, sc = scale(), [x, y] = toScreen(ed.x, ed.y);
    ed.el.style.transform = `translate(${x}px, ${y}px)`;
    ed.el.style.setProperty("--fs", ed.size * sc + "px");
    ed.el.style.setProperty("--pad", ed.size * PAD * sc + "px");
    // las barras no se salen de la pizarra: si no entran a la derecha, se corren a la izquierda
    for (const bar of ed.el.querySelectorAll(".bedit-bar, .bedit-sym, .bedit-prev")) {
      bar.style.maxWidth = (cssW - 16) + "px";
      const shift = Math.min(0, cssW - 8 - (x + bar.offsetWidth));
      bar.style.left = Math.max(shift, 8 - x) + "px";
    }
  }
  // confirma lo escrito (o lo descarta, con discard) y cierra el editor
  function closeEditor(discard) {
    if (!editor) return;
    const ed = editor;
    editor = null;
    const ta = ed.el.querySelector("textarea"), isMath = ed.kind === "math";
    const text = isMath ? ta.value.trim() : ta.value.replace(/\s+$/, "");
    ed.el.remove();
    if (discard) { redraw(); return; }
    const before = ed.stroke ? [ed.stroke] : [];
    if (!text) { if (ed.stroke) commit({ a: "rep", rem: before, add: [] }); else redraw(); return; }
    const size = ed.size, dims = (isMath ? measureMath(text, size) : measureText(text, size, ed.bold)) || { w: text.length * size * 0.6, h: size * 1.4 };
    const pad = size * PAD;
    const s = { c: ed.color, w: size, o: isMath ? { k: "math", s: text } : Object.assign({ k: "text", t: text }, ed.bold ? { b: 1 } : {}), p: rectPts(ed.x, ed.y, ed.x + dims.w + 2 * pad, ed.y + dims.h + 2 * pad) };
    const old = ed.stroke;
    if (old && JSON.stringify(old.o) === JSON.stringify(s.o) && old.w === s.w && old.c === s.c) { redraw(); return; }
    commit({ a: "rep", rem: before, add: [s] });
  }

  // ---------- figuras: ejes, funciones y recta numérica ----------
  function viewCenter() {
    const sc = scale(), w = cssW / sc, h = cssH / sc;
    return { x: view.x + w / 2, y: view.y + h / 2, w, h };
  }
  function insertFigure(o, w, h) {
    const c = viewCenter();
    const s = { c: prefs.color, w: FIGURE_LINE, o, p: rectPts(c.x - w / 2, c.y - h / 2, c.x + w / 2, c.y + h / 2) };
    commit({ a: "add", s });
    setTool("lasso");
    select([s]);
  }
  const axesSide = () => { const c = viewCenter(); return Math.max(260, Math.min(700, Math.min(c.w, c.h) * 0.75)); };
  function insert(kind) {
    if (kind === "axes") { const a = axesSide(); insertFigure({ k: "axes", xmin: -5, xmax: 5, ymin: -5, ymax: 5, grid: true, fns: [] }, a, a); }
    else if (kind === "line") { const w = Math.max(360, Math.min(900, viewCenter().w * 0.8)); insertFigure({ k: "line", min: -5, max: 5 }, w, Math.max(60, w / 9)); }
    else dialog("function", sel && sel.list.length === 1 && sel.list[0].o && sel.list[0].o.k === "axes" ? sel.list[0] : null);
  }
  const numOf = (v, d) => { const n = Number(String(v).replace(",", ".").replace("−", "-")); return Number.isFinite(n) ? n : d; };
  // diálogos sobre la pizarra: editar los ejes o la recta, o graficar una función
  function dialog(kind, target) {
    const d = document.createElement("div");
    d.className = "bdlg";
    const o = target && target.o;
    let body = "";
    if (kind === "axes") {
      body = `<h3>Ejes cartesianos</h3><div class="bdlg-grid">
          ${[["xmin", "x desde"], ["xmax", "x hasta"], ["ymin", "y desde"], ["ymax", "y hasta"]].map(([k, l]) => `<label>${l}<input data-k="${k}" inputmode="decimal" value="${fmtNum(o[k]).replace("−", "-")}"></label>`).join("")}</div>
        <label class="bdlg-check"><input type="checkbox" data-k="grid" ${o.grid ? "checked" : ""}> Cuadrícula</label>
        <div class="bdlg-sub">Funciones</div><div class="bdlg-fns">${(o.fns.length ? o.fns : [""]).map((f, i) => fnRow(f, i)).join("")}</div>
        <button type="button" class="bdlg-more" data-d="addfn">${ICON("plus")} Otra función</button>`;
    } else if (kind === "line") {
      body = `<h3>Recta numérica</h3><div class="bdlg-grid"><label>Desde<input data-k="min" inputmode="decimal" value="${fmtNum(o.min).replace("−", "-")}"></label><label>Hasta<input data-k="max" inputmode="decimal" value="${fmtNum(o.max).replace("−", "-")}"></label></div>`;
    } else {
      body = `<h3>Graficar una función</h3><div class="bdlg-fns">${fnRow("", 0, true)}</div>
        <p class="bdlg-note">${target ? "Se agrega a los ejes seleccionados." : "Se dibujan unos ejes nuevos con la función."} Se escribe como en la calculadora: 2x + 1, x^2, sqrt(x), sin(x), |x|.</p>`;
    }
    d.innerHTML = `<form class="bdlg-card">${body}<p class="bdlg-err" hidden></p><div class="bdlg-act"><button type="button" data-d="cancel">Cancelar</button><button class="bdlg-ok">${kind === "function" ? "Graficar" : "Listo"}</button></div></form>`;
    el.appendChild(d);
    const form = d.querySelector("form"), err = d.querySelector(".bdlg-err");
    const close = () => d.remove();
    d.addEventListener("pointerdown", e => { if (e.target === d) close(); });
    d.addEventListener("click", e => {
      const b = e.target.closest("[data-d]");
      if (!b) return;
      if (b.dataset.d === "cancel") close();
      else if (b.dataset.d === "addfn") { const box = d.querySelector(".bdlg-fns"); box.insertAdjacentHTML("beforeend", fnRow("", box.children.length)); box.lastElementChild.querySelector("input").focus(); }
      else if (b.dataset.d === "rmfn") { const row = b.closest(".bdlg-fn"), box = row.parentElement; if (box.children.length > 1) row.remove(); else row.querySelector("input").value = ""; }
    });
    form.addEventListener("submit", e => {
      e.preventDefault();
      const val = k => (d.querySelector(`[data-k="${k}"]`) || {}).value;
      const fns = [...d.querySelectorAll(".bdlg-fn input")].map(x => x.value.trim()).filter(Boolean);
      const bad = fns.map(f => Ex.compileExpr(f).error).find(Boolean);
      if (bad) { err.textContent = bad; err.hidden = false; return; }
      if (kind === "axes") {
        const a = { k: "axes", xmin: numOf(val("xmin"), -5), xmax: numOf(val("xmax"), 5), ymin: numOf(val("ymin"), -5), ymax: numOf(val("ymax"), 5), grid: d.querySelector('[data-k="grid"]').checked, fns };
        if (!(a.xmin < a.xmax && a.ymin < a.ymax)) { err.textContent = "El «desde» tiene que ser menor que el «hasta»."; err.hidden = false; return; }
        updateItem(target, a);
      } else if (kind === "line") {
        const n = { k: "line", min: numOf(val("min"), -5), max: numOf(val("max"), 5) };
        if (!(n.min < n.max)) { err.textContent = "El «desde» tiene que ser menor que el «hasta»."; err.hidden = false; return; }
        updateItem(target, n);
      } else {
        if (!fns.length) { err.textContent = "Escribí una función de x."; err.hidden = false; return; }
        if (target) updateItem(target, Object.assign({}, target.o, { fns: [...target.o.fns, fns[0]] }));
        else { const a = axesSide(); insertFigure({ k: "axes", xmin: -5, xmax: 5, ymin: -5, ymax: 5, grid: true, fns: [fns[0]] }, a, a); }
      }
      close();
    });
    const first = d.querySelector("input");
    if (first) first.focus();
  }
  const fnRow = (f, i) => `<div class="bdlg-fn"><i class="bdot" style="background:${CURVE_COLORS[i % CURVE_COLORS.length]}"></i><span>y =</span><input value="${esc(f)}" placeholder="x^2 - 3, 2sin(x), |x|…" spellcheck="false" autocapitalize="off"><button type="button" data-d="rmfn" aria-label="Quitar función">${ICON("x")}</button></div>`;
  // reemplaza el objeto de un trazo (mismo lugar)
  function updateItem(s, o) {
    const ns = cloneStroke(s, { o });
    commit({ a: "rep", rem: [s], add: [ns] });
    select([ns]);
  }

  // ---------- exportar ----------
  // dibuja la hoja entera (de x = 0 a 1000) en un canvas, con el tema claro
  function renderSheet(pxPerUnit, y0, y1) {
    const c = document.createElement("canvas"), W = Math.round(PAGE_W * pxPerUnit), Hh = Math.round((y1 - y0) * pxPerUnit);
    c.width = W; c.height = Hh;
    const g = c.getContext("2d");
    // papel claro para exportar, aunque la app esté en modo oscuro
    g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, W, Hh);
    const keepPaper = prefs.paper;
    if (keepPaper !== "blank") {
      const step = keepPaper === "lines" ? 40 : 25;
      g.strokeStyle = "#DCE3F0"; g.fillStyle = "#DCE3F0"; g.lineWidth = Math.max(1, pxPerUnit * 0.6);
      g.beginPath();
      for (let y = Math.ceil(y0 / step) * step; y <= y1; y += step) {
        if (keepPaper === "dots") { for (let x = 0; x <= PAGE_W; x += step) { g.moveTo((x + 1.2) * pxPerUnit, (y - y0) * pxPerUnit); g.arc(x * pxPerUnit, (y - y0) * pxPerUnit, 1.2 * pxPerUnit, 0, Math.PI * 2); } }
        else { g.moveTo(0, (y - y0) * pxPerUnit); g.lineTo(W, (y - y0) * pxPerUnit); }
      }
      if (keepPaper === "grid") for (let x = 0; x <= PAGE_W; x += step) { g.moveTo(x * pxPerUnit, 0); g.lineTo(x * pxPerUnit, Hh); }
      if (keepPaper === "dots") g.fill(); else g.stroke();
    }
    g.setTransform(pxPerUnit, 0, 0, pxPerUnit, 0, -y0 * pxPerUnit);
    for (const s of page.s) {
      const b = bbOf(s);
      if (b.y1 < y0 || b.y0 > y1) continue;
      if (s.o) drawItem(g, s, colorOf(s, 0), "#DCDCDC");
      else { g.globalAlpha = s.h ? HL_ALPHA : 1; g.fillStyle = colorOf(s, 0); g.fill(strokePath(s)); g.globalAlpha = 1; }
    }
    return c;
  }
  const contentBottom = () => page.s.reduce((m, s) => Math.max(m, bbOf(s).y1), 0);
  // espera a que estén listas las fórmulas de la hoja (antes de exportar)
  async function mathReady() {
    const list = page.s.filter(s => s.o && s.o.k === "math");
    if (!list.length) return;
    await loadMath();
    for (let k = 0; k < 30 && list.some(s => !mathImage(s.o.s, colorOf(s, 0))); k++) await new Promise(r => setTimeout(r, 100));
  }
  function download(blob, name) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  const fileName = ext => `efecen-${(page.label || "hoja").replace(/[^\wáéíóúñü·.-]+/gi, "-").replace(/-+/g, "-").slice(0, 40)}-${new Date().toISOString().slice(0, 10)}.${ext}`;
  async function exportSheet(kind) {
    if (!page.s.length) return hint("La hoja está vacía");
    await mathReady();
    const bottom = Math.max(contentBottom() + 30, 200);
    if (kind === "png") {
      const c = renderSheet(2, 0, bottom);
      c.toBlob(b => download(b, fileName("png")), "image/png");
      return;
    }
    // PDF: páginas A4 (la hoja mide 1000 de ancho, así que cada página tiene 1000·√2 de alto), cada una como JPEG
    const ph = PAGE_W * Math.SQRT2, imgs = [];
    for (let y = 0; y < bottom; y += ph) {
      const c = renderSheet(1.6, y, y + ph);
      const bin = atob(c.toDataURL("image/jpeg", 0.9).split(",")[1]), bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      imgs.push({ bytes, w: c.width, h: c.height });
    }
    download(new Blob([pdfFromJpegs(imgs)], { type: "application/pdf" }), fileName("pdf"));
  }
  // un PDF mínimo: una página A4 por imagen JPEG, que la ocupa entera
  function pdfFromJpegs(imgs) {
    const enc = new TextEncoder(), parts = [], offsets = [];
    let len = 0;
    const push = x => { const b = typeof x === "string" ? enc.encode(x) : x; parts.push(b); len += b.length; };
    const W = 595.28, Hp = 841.89, n = imgs.length, objs = 2 + 3 * n;
    push("%PDF-1.4\n");
    const obj = (i, body) => { offsets[i] = len; push(`${i} 0 obj\n`); for (const b of [].concat(body)) push(b); push("\nendobj\n"); };
    obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
    obj(2, `<< /Type /Pages /Count ${n} /Kids [${imgs.map((_, k) => `${3 + 3 * k} 0 R`).join(" ")}] >>`);
    imgs.forEach((im, k) => {
      const pg = 3 + 3 * k, content = `q ${W} 0 0 ${Hp} 0 0 cm /Im0 Do Q`;
      obj(pg, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${Hp}] /Resources << /XObject << /Im0 ${pg + 2} 0 R >> >> /Contents ${pg + 1} 0 R >>`);
      obj(pg + 1, [`<< /Length ${content.length} >>\nstream\n`, content, "\nendstream"]);
      obj(pg + 2, [`<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.bytes.length} >>\nstream\n`, im.bytes, "\nendstream"]);
    });
    const xref = len;
    push(`xref\n0 ${objs + 1}\n0000000000 65535 f \n`);
    for (let i = 1; i <= objs; i++) push(String(offsets[i]).padStart(10, "0") + " 00000 n \n");
    push(`trailer\n<< /Size ${objs + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
    const out = new Uint8Array(len);
    let o = 0;
    for (const p of parts) { out.set(p, o); o += p.length; }
    return out;
  }
  T.pdfFromJpegs = pdfFromJpegs;

  // ---------- barra ----------
  function onBar(e) {
    const b = e.target.closest("[data-b]");
    if (!b || b.disabled) return;
    const v = b.dataset.v, k = b.dataset.b;
    if (k.startsWith("sel-")) return selAction(k, v);
    switch (k) {
      case "tool":
        if (prefs.tool === v) { if (v !== "lasso") openPop("style"); return; }   // tocar la herramienta activa abre sus opciones
        closePop(); setTool(v); return;
      case "style": case "insert": case "more": openPop(k); return;
      case "color": if (prefs.tool === "hl") prefs.hlColor = v; else prefs.color = v; closePop(); break;
      case "size": prefs.size = +v; closePop(); break;
      case "emode": prefs.eraseMode = v; closePop(); hint(v === "area" ? "Goma por área: recorta lo que toca" : "Goma por trazo: borra el trazo entero"); break;
      case "tsize": prefs.textSize = +v; closePop(); break;
      case "ins": closePop(); insert(v); return;
      case "undo": if (undoAny(page)) { clearSelection(); redraw(); persist(page); } break;
      case "redo": if (redoAny(page)) { clearSelection(); redraw(); persist(page); } break;
      case "paper": prefs.paper = v; closePop(); hint("Hoja " + PAPER_LABEL[prefs.paper].toLowerCase()); savePrefs(); redraw(); break;
      case "finger": prefs.finger = !fingerDraws(); closePop(); hint(prefs.finger ? "El dedo dibuja" : "El dedo mueve la hoja"); onChange(); break;
      case "shapes": prefs.shapes = prefs.shapes === false; closePop(); hint(prefs.shapes ? "Formas automáticas: dejá el lápiz quieto al terminar" : "Formas automáticas apagadas"); onChange(); break;
      case "export": closePop(); exportSheet(v); return;
      case "clear":
        closePop();
        if (page.s.length && confirm("¿Borrar todo lo de esta hoja? Podés deshacerlo.")) { clearSelection(); commit({ a: "clear", list: [...page.s] }); }
        break;
      case "prev": case "next": {
        const all = pages.includes(page) ? pages : [...pages, page], i = all.indexOf(page) + (k === "next" ? 1 : -1);
        if (all[i]) setPage(all[i]);
        break;
      }
      case "new": setPage(newPage(null, "")); break;
      case "prompt": prefs.promptOpen = !prefs.promptOpen; break;
      case "split": prefs.split = !prefs.split; savePrefs(); layout(); onChange(); return;
      case "close": api.close(); return;
    }
    savePrefs(); syncBar();
  }

  // ---------- disposición ----------
  function layout() {
    if (!el) return;
    side = open && dockMQ.matches;
    const split = open && !side && !!prefs.split;
    docked = side || split;
    el.classList.toggle("docked", side);
    el.classList.toggle("split", split);
    document.body.classList.toggle("board-docked", side);
    document.body.classList.toggle("board-split", split);
    document.body.classList.toggle("board-full", open && !docked);
    // solo a pantalla completa el "atrás" del sistema cierra la pizarra
    if (open && !docked && !pushed) { history.pushState({ efecenBoard: 1 }, "", location.hash || "#/"); pushed = true; }
    else if (docked && pushed) { pushed = false; ignorePop = true; history.back(); }
    if (open) syncBar();
  }
  dockMQ.addEventListener("change", () => { layout(); onChange(); });

  const api = {
    T,
    prefs,
    get isOpen() { return open; },
    available() { return prefs.show === "on" || (prefs.show === "auto" && (prefs.pen || isTablet())); },
    setPref(k, v) { prefs[k] = v; savePrefs(); if (el && open) syncBar(); onChange(); },
    fingerDraws,
    onChange(fn) { onChange = fn; },
    // la app avisa qué ejercicio se está mostrando (o null fuera de una sesión)
    context(info) {
      ctxInfo = info;
      if (!open || !pages) return;
      if (info) setPage(pageFor(info.key, info.label));
      updatePrompt();
      syncBar();
    },
    async open() {
      if (open) return;
      await loadPages();
      if (!el) build();
      open = true;
      el.classList.add("show");
      setPage(ctxInfo ? pageFor(ctxInfo.key, ctxInfo.label) : page || pages[pages.length - 1] || newPage(null, ""));
      updatePrompt();
      layout();
      // a pantalla completa, el botón "atrás" del celu cierra la pizarra
      resize();
      onChange();
    },
    close(fromPop) {
      if (!open) return;
      closeEditor();
      flush();
      closePop(); clearSelection();
      open = false; cur = null; touches.clear(); gesture = null;
      el.querySelectorAll(".bdlg").forEach(x => x.remove());
      el.classList.remove("show");
      layout();
      if (pushed && !fromPop) { pushed = false; ignorePop = true; history.back(); }
      pushed = false;
      onChange();
    },
    toggle() { return open ? api.close() : api.open(); },
    // para las pruebas en el navegador: qué hay en la hoja visible
    debug() { return page ? { n: page.s.length, kinds: page.s.map(s => (s.o ? s.o.k : s.h ? "hl" : "ink")), pts: page.s.map(s => s.p.length / 3), view: { ...view }, tool: prefs.tool } : null; }
  };
  function updatePrompt() {
    if (!el) return;
    el.querySelector(".bprompt-body").innerHTML = ctxInfo && ctxInfo.prompt ? ctxInfo.prompt : "";
  }
  let ignorePop = false;
  // se registra antes que el de la app: si la pizarra está abierta, el "atrás" solo la cierra
  if (typeof window.addEventListener === "function") {
    window.addEventListener("popstate", e => {
      if (ignorePop) { ignorePop = false; e.stopImmediatePropagation(); return; }
      if (open && pushed) { e.stopImmediatePropagation(); pushed = false; api.close(true); }
    });
    window.addEventListener("pointerdown", e => {
      if (e.pointerType === "pen" && !prefs.pen) { prefs.pen = true; savePrefs(); onChange(); }
      // tocar fuera de un panel lo cierra
      if (popKind && !e.target.closest(".board-pop") && !e.target.closest('[data-b="style"],[data-b="insert"],[data-b="more"],[data-b="tool"]')) closePop();
    }, true);
    window.addEventListener("keydown", e => {
      if (!open || editor || e.target.closest && e.target.closest(".bdlg")) return;
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && (k === "z" || k === "y")) {
        e.preventDefault(); e.stopPropagation();
        if ((k === "z" && !e.shiftKey ? undoAny(page) : redoAny(page))) { clearSelection(); redraw(); persist(page); syncBar(); }
      } else if ((k === "delete" || k === "backspace") && sel) { e.preventDefault(); e.stopPropagation(); selAction("sel-del"); }
      else if (k === "escape") { e.stopPropagation(); if (sel) clearSelection(); else if (popKind) closePop(); else if (!docked) api.close(); }
    }, true);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") { closeEditor(); flush(); } else if (open) redraw(); });
    const reTheme = () => { if (open) { syncBar(); redraw(); if (editor) syncEditor(); } };
    mq("(prefers-color-scheme: dark)").addEventListener("change", reTheme);
    if (typeof MutationObserver === "function") new MutationObserver(reTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }
  // una fórmula terminó de cargarse: hay que redibujarla
  MJ.listeners.add(() => { if (open) { redraw(); if (editor) syncEditor(); } });
  E.board = api;
  E.boardShapes = Sh;
})();
