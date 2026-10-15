// Pizarra de efecen: una hoja para hacer cuentas con lápiz (pensada para tablets).
// - Lápiz con presión, resaltador y borrador por trazo; deshacer y rehacer; varias hojas.
// - El lápiz dibuja; el dedo mueve la hoja (con dos dedos, zoom). Rechaza la palma mientras se usa el lápiz.
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
  const PAPERS = ["grid", "lines", "blank"];
  const PAPER_LABEL = { grid: "Cuadriculada", lines: "Rayada", blank: "Lisa" };

  // ---------- geometría (sin DOM; la usan los tests) ----------
  // Un trazo es { c: color, w: grosor, h: 1 si es resaltador, p: [x, y, presión, x, y, presión, …] }.
  const radiusAt = (s, i) => (s.h ? s.w : s.w * (0.45 + 0.85 * s.p[i * 3 + 2])) / 2;
  function bbox(s) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, r = 0;
    for (let i = 0; i < s.p.length; i += 3) {
      x0 = Math.min(x0, s.p[i]); x1 = Math.max(x1, s.p[i]); y0 = Math.min(y0, s.p[i + 1]); y1 = Math.max(y1, s.p[i + 1]);
      r = Math.max(r, radiusAt(s, i / 3));
    }
    return { x0: x0 - r, y0: y0 - r, x1: x1 + r, y1: y1 + r };
  }
  function segDist(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    const t = L ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L)) : 0;
    return Math.hypot(px - ax - t * dx, py - ay - t * dy);
  }
  // ¿el borrador de radio r centrado en (x, y) toca el trazo?
  function hits(s, x, y, r) {
    const b = s._bb || (s._bb = bbox(s));
    if (x < b.x0 - r || x > b.x1 + r || y < b.y0 - r || y > b.y1 + r) return false;
    const P = s.p, n = P.length / 3;
    if (n === 1) return Math.hypot(x - P[0], y - P[1]) <= r + radiusAt(s, 0);
    for (let i = 0; i < n - 1; i++) {
      const rr = r + Math.max(radiusAt(s, i), radiusAt(s, i + 1));
      if (segDist(x, y, P[i * 3], P[i * 3 + 1], P[i * 3 + 3], P[i * 3 + 4]) <= rr) return true;
    }
    return false;
  }
  // contorno del trazo: un círculo por punto y un cuadrilátero entre puntos vecinos, todos con la
  // misma orientación, así el relleno (regla nonzero) es la unión, sin huecos y con grosor variable
  function addSegment(path, s, i) {
    const P = s.p, ax = P[i * 3], ay = P[i * 3 + 1], bx = P[i * 3 + 3], by = P[i * 3 + 4];
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy);
    if (L < 1e-6) return;
    const nx = -dy / L, ny = dx / L, r0 = radiusAt(s, i), r1 = radiusAt(s, i + 1);
    const q = [[ax + nx * r0, ay + ny * r0], [bx + nx * r1, by + ny * r1], [bx - nx * r1, by - ny * r1], [ax - nx * r0, ay - ny * r0]];
    let area = 0;
    for (let k = 0; k < 4; k++) { const [x0, y0] = q[k], [x1, y1] = q[(k + 1) % 4]; area += x0 * y1 - x1 * y0; }
    if (area < 0) q.reverse();
    path.moveTo(q[0][0], q[0][1]); path.lineTo(q[1][0], q[1][1]); path.lineTo(q[2][0], q[2][1]); path.lineTo(q[3][0], q[3][1]); path.closePath();
  }
  function addDot(path, s, i) {
    const x = s.p[i * 3], y = s.p[i * 3 + 1], r = radiusAt(s, i);
    path.moveTo(x + r, y); path.arc(x, y, r, 0, Math.PI * 2);
  }
  function strokePath(s, from = 0, path = new Path2D()) {
    const n = s.p.length / 3;
    for (let i = from; i < n; i++) { addDot(path, s, i); if (i > 0) addSegment(path, s, i - 1); }
    return path;
  }

  // ---------- historial de una hoja (deshacer / rehacer) ----------
  function apply(page, act, undo) {
    const S = page.s;
    if (act.a === "add") { if (undo) S.splice(S.lastIndexOf(act.s), 1); else S.push(act.s); }
    else if (act.a === "del") {
      if (undo) for (const [i, s] of act.list) S.splice(i, 0, s);           // list va en orden creciente de índice
      else for (const [, s] of [...act.list].reverse()) S.splice(S.indexOf(s), 1);
    } else if (act.a === "clear") { if (undo) S.push(...act.list); else S.length = 0; }
  }
  function doAct(page, act) { apply(page, act, false); (page._undo || (page._undo = [])).push(act); page._redo = []; }
  function undo(page) { const a = page._undo && page._undo.pop(); if (!a) return false; apply(page, a, true); (page._redo || (page._redo = [])).push(a); return true; }
  function redo(page) { const a = page._redo && page._redo.pop(); if (!a) return false; apply(page, a, false); page._undo.push(a); return true; }
  // borra con el borrador en (x, y): devuelve la acción (o null si no tocó nada)
  function eraseAt(page, x, y, r) {
    const list = [];
    page.s.forEach((s, i) => { if (hits(s, x, y, r)) list.push([i, s]); });
    if (!list.length) return null;
    const act = { a: "del", list };
    apply(page, act, false);
    return act;
  }
  // para guardar: sin los cachés (_path, _bb) y con los números redondeados
  const round = (v, d) => Math.round(v * d) / d;
  const packStroke = s => ({ c: s.c, w: s.w, h: s.h ? 1 : 0, p: s.p.map((v, i) => round(v, i % 3 === 2 ? 100 : 10)) });
  const packPage = p => ({ id: p.id, k: p.k || null, t: p.t, label: p.label || "", s: p.s.map(packStroke) });

  const T = { bbox, hits, eraseAt, doAct, undo, redo, packPage, radiusAt };

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

  const prefs = Object.assign({ show: "auto", pen: false, finger: null, shapes: true, tool: "pen", color: "ink", size: 1, hlColor: "yellow", paper: "grid", promptOpen: true, split: true }, (() => {
    try { return JSON.parse(localStorage.getItem(PREF_KEY)) || {}; } catch (e) { return {}; }
  })());
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
  let el = null, base, live, bctx, lctx, dpr = 1, cssW = 0, cssH = 0;
  // docked: la pizarra comparte la pantalla (al costado con la tablet acostada, abajo con la tablet parada)
  let open = false, docked = false, side = false, pushed = false, onChange = () => {};
  const view = { x: 0, y: 0, z: 1 };
  const views = new Map();     // posición de cada hoja mientras la app está abierta
  const dirty = new Set();
  let saveTimer = 0, rafBase = 0;
  const dockMQ = mq("(orientation: landscape) and (min-width: 900px)");

  const theme = () => {
    const t = document.documentElement.dataset.theme;
    return t === "dark" || (!t && mq("(prefers-color-scheme: dark)").matches) ? 1 : 0;
  };
  const colorOf = (s, th) => (COLORS[s.c] || COLORS.ink)[th];
  const scale = () => (cssW / PAGE_W) * view.z;

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

  // ---------- DOM ----------
  const ICON = n => `<svg class="ic" aria-hidden="true"><use href="assets/icons/sprite.svg#i-${n}"/></svg>`;
  function build() {
    el = document.createElement("div");
    el.className = "board";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Pizarra");
    el.innerHTML = `<div class="board-bar">
        <div class="bgrp" role="group" aria-label="Herramienta">
          <button data-b="tool" data-v="pen" aria-label="Lápiz">${ICON("pen-line")}</button>
          <button data-b="tool" data-v="hl" aria-label="Resaltador">${ICON("highlighter")}</button>
          <button data-b="tool" data-v="eraser" aria-label="Borrador">${ICON("eraser")}</button></div>
        <div class="bgrp" role="group" aria-label="Color">${Object.keys(COLORS).map(c => `<button class="bcolor" data-b="color" data-v="${c}" aria-label="Color ${c}"><i></i></button>`).join("")}</div>
        <div class="bgrp" role="group" aria-label="Grosor">${[0, 1, 2].map(i => `<button class="bsize" data-b="size" data-v="${i}" aria-label="Grosor ${i + 1}"><i style="--d:${4 + i * 4}px"></i></button>`).join("")}</div>
        <div class="bgrp">
          <button data-b="undo" aria-label="Deshacer">${ICON("undo-2")}</button>
          <button data-b="redo" aria-label="Rehacer">${ICON("redo-2")}</button></div>
        <div class="bgrp">
          <button data-b="paper" aria-label="Tipo de hoja">${ICON("grid-3x3")}</button>
          <button data-b="finger" aria-label="Dibujar con el dedo">${ICON("hand")}</button>
          <button data-b="clear" aria-label="Borrar la hoja">${ICON("trash-2")}</button>
          <button data-b="split" aria-label="Pantalla dividida o completa"></button></div>
        <div class="bgrp bpages">
          <button data-b="prev" aria-label="Hoja anterior">${ICON("chevron-left")}</button>
          <span class="bpage-n"></span>
          <button data-b="next" aria-label="Hoja siguiente">${ICON("chevron-right")}</button>
          <button data-b="new" aria-label="Hoja nueva">${ICON("plus")}</button></div>
        <button class="bclose" data-b="close" aria-label="Cerrar la pizarra">${ICON("x")}</button>
      </div>
      <div class="board-prompt" hidden><button data-b="prompt" class="bprompt-h">${ICON("file-text")}<span>Enunciado</span>${ICON("chevron-right")}</button><div class="bprompt-body"></div></div>
      <div class="board-stage"><canvas class="bc-base"></canvas><canvas class="bc-live"></canvas><div class="board-hint" hidden></div></div>`;
    document.body.appendChild(el);
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
    live.addEventListener("pointerleave", e => { if (e.pointerType !== "touch" && !cur) { clearLive(); if (e.pointerType === "pen") btn = null; } });
    live.addEventListener("wheel", onWheel, { passive: false });
    live.addEventListener("contextmenu", onContextMenu);
    new ResizeObserver(resize).observe(el.querySelector(".board-stage"));
  }
  function syncBar() {
    const on = (b, v, cond) => el.querySelectorAll(`[data-b="${b}"]${v != null ? `[data-v="${v}"]` : ""}`).forEach(x => x.classList.toggle("on", cond));
    for (const t of ["pen", "hl", "eraser"]) on("tool", t, prefs.tool === t);
    const colKey = prefs.tool === "hl" ? prefs.hlColor : prefs.color, th = theme();
    el.querySelectorAll('[data-b="color"]').forEach(x => {
      x.classList.toggle("on", x.dataset.v === colKey && prefs.tool !== "eraser");
      x.querySelector("i").style.background = COLORS[x.dataset.v][th];
      x.disabled = prefs.tool === "eraser";
    });
    el.querySelectorAll('[data-b="size"]').forEach(x => x.classList.toggle("on", +x.dataset.v === prefs.size));
    on("finger", null, fingerDraws());
    const sp = el.querySelector('[data-b="split"]');
    sp.hidden = side;
    sp.innerHTML = ICON(prefs.split ? "maximize-2" : "panel-bottom");
    sp.title = prefs.split ? "Pizarra a pantalla completa" : "Dividir la pantalla: pizarra abajo";
    el.querySelector('[data-b="paper"]').title = "Hoja " + PAPER_LABEL[prefs.paper].toLowerCase();
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

  function setPage(p) {
    if (page) views.set(page.id, { ...view });
    page = p;
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
    const st = el.querySelector(".board-stage"), r = st.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    cssW = r.width; cssH = r.height;
    for (const c of [base, live]) { c.width = Math.round(cssW * dpr); c.height = Math.round(cssH * dpr); }
    clampView(); redraw(); drawLive();
  }
  function clampView() {
    const sc = scale(), vw = cssW / sc;
    view.x = Math.max(0, Math.min(view.x, PAGE_W - vw));
    let bottom = 0;
    if (page) for (const s of page.s) bottom = Math.max(bottom, (s._bb || (s._bb = bbox(s))).y1);
    view.y = Math.max(0, Math.min(view.y, bottom + cssH / sc * 0.7));
  }
  function setXform(c) { const sc = scale() * dpr; c.setTransform(sc, 0, 0, sc, -view.x * sc, -view.y * sc); }
  function paper(c) {
    const cs = getComputedStyle(el), sc = scale();
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.fillStyle = cs.getPropertyValue("--board-paper").trim() || "#fff";
    c.fillRect(0, 0, cssW, cssH);
    if (prefs.paper === "blank") return;
    const step = prefs.paper === "grid" ? 25 : 40;
    c.strokeStyle = cs.getPropertyValue("--board-rule").trim() || "#ddd";
    c.lineWidth = 1;
    c.beginPath();
    const y0 = Math.floor(view.y / step) * step;
    for (let y = y0; (y - view.y) * sc < cssH; y += step) { const py = Math.round((y - view.y) * sc) + 0.5; c.moveTo(0, py); c.lineTo(cssW, py); }
    if (prefs.paper === "grid") {
      const x0 = Math.floor(view.x / step) * step;
      for (let x = x0; (x - view.x) * sc < cssW; x += step) { const px = Math.round((x - view.x) * sc) + 0.5; c.moveTo(px, 0); c.lineTo(px, cssH); }
    }
    c.stroke();
    if (prefs.paper === "lines") {   // margen, como en una hoja rayada
      const px = Math.round((70 - view.x) * sc) + 0.5;
      c.strokeStyle = cs.getPropertyValue("--board-margin").trim() || "#f99";
      c.beginPath(); c.moveTo(px, 0); c.lineTo(px, cssH); c.stroke();
    }
  }
  function fillStroke(c, s, th, path) {
    c.globalAlpha = s.h ? 0.38 : 1;
    c.fillStyle = colorOf(s, th);
    c.fill(path || s._path || (s._path = strokePath(s)));
    c.globalAlpha = 1;
  }
  function redraw() {
    if (!el || !open) return;
    cancelAnimationFrame(rafBase); rafBase = 0;
    paper(bctx);
    setXform(bctx);
    const th = theme(), sc = scale(), vx1 = view.x + cssW / sc, vy1 = view.y + cssH / sc;
    for (const s of page.s) {
      const b = s._bb || (s._bb = bbox(s));
      if (b.x1 < view.x || b.x0 > vx1 || b.y1 < view.y || b.y0 > vy1) continue;
      fillStroke(bctx, s, th);
    }
  }
  const redrawSoon = () => { if (!rafBase) rafBase = requestAnimationFrame(redraw); };
  function clearLive() { if (lctx) { lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, live.width, live.height); } }

  // ---------- entrada ----------
  let cur = null;              // trazo en curso: { id, s, path, n, erase, act }
  let lastPen = 0, rafLive = 0, predicted = [];
  const touches = new Map();   // dedos que mueven la hoja
  let gesture = null;
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
  function toggleEraser() {
    if (prefs.tool === "eraser") prefs.tool = prefs.prevTool && prefs.prevTool !== "eraser" ? prefs.prevTool : "pen";
    else { prefs.prevTool = prefs.tool; prefs.tool = "eraser"; }
    savePrefs(); syncBar(); clearLive();
    hint(prefs.tool === "eraser" ? "Borrador" : prefs.tool === "hl" ? "Resaltador" : "Lápiz");
  }
  // algunos Android no mandan el estado del botón al pasar el lápiz por encima, pero sí un "clic derecho"
  function onContextMenu(e) {
    e.preventDefault();
    // con el lápiz apoyado, un «clic largo» no es el botón (pasaba al dejar el lápiz quieto: cambiaba de modo solo)
    if (cur || hoverBtnSeen || btn || performance.now() - btnReleased < 600 || performance.now() - lastPen > 1500) return;
    toggleEraser();
  }
  function onDown(e) {
    trackButton(e);
    if (e.pointerType === "pen") {
      e.preventDefault();
      lastPen = performance.now();
      if (!prefs.pen) { prefs.pen = true; savePrefs(); syncBar(); }
    }
    const isTouch = e.pointerType === "touch";
    if (isTouch) {
      // palma: con el lápiz en uso (o recién usado) los dedos no hacen nada
      if (cur && cur.type === "pen" || performance.now() - lastPen < 500) return;
      if (fingerDraws() && !touches.size && !cur) return startStroke(e);
      if (cur && cur.type === "touch") { cancelStroke(); }
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
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
    // botón del S Pen (barril) o la punta de borrar: borra mientras se mantiene
    const erase = prefs.tool === "eraser" || (e.buttons & 32) || (e.pointerType === "pen" && (e.buttons & 2));
    const [x, y] = toPage(e);
    if (erase) {
      cur = { id: e.pointerId, type: e.pointerType, erase: true, acts: [] };
      eraseMove(x, y);
      return;
    }
    const hl = prefs.tool === "hl";
    const s = { c: hl ? prefs.hlColor : prefs.color, w: SIZES[hl ? "hl" : "pen"][prefs.size], h: hl ? 1 : 0, p: [x, y, pressureOf(e)] };
    cur = { id: e.pointerId, type: e.pointerType, s, path: strokePath(s), n: 1, still: [e.clientX, e.clientY] };
    armHold();
    drawLive();
  }
  // formas: si el lápiz queda quieto, el trazo se vuelve la forma reconocida; mientras siga apoyado, la forma lo sigue
  function armHold() {
    if (!cur || cur.erase) return;
    clearTimeout(cur.holdT);
    if (!prefs.shapes || cur.shape) return;
    const c = cur;
    c.holdT = setTimeout(() => {
      if (cur !== c || c.erase || c.shape) return;
      const pts = Sh.fromStroke(c.s.p), sh = Sh.recognize(pts);
      if (!sh) return;
      c.shape = sh; c.anchor = pts[pts.length - 1];
      setShape(c, sh.verts);
      if (navigator.vibrate) navigator.vibrate(8);
    }, HOLD_MS);
  }
  function setShape(c, verts) {
    c.s.p = Sh.toStroke(verts, c.shape.closed);
    c.path = strokePath(c.s); c.n = c.s.p.length / 3;
    predicted = [];
    drawLive();
  }
  function onMove(e) {
    if (e.pointerType === "pen") { lastPen = performance.now(); trackButton(e); }
    // se apretó el botón en medio de un trazo: lo escrito queda y sigue borrando
    if (cur && !cur.erase && e.pointerId === cur.id && btnPressed(e)) {
      const c = cur;
      clearTimeout(c.holdT);
      if (c.s.p.length > 3) commitStroke(c);
      cur = { id: c.id, type: c.type, erase: true, acts: [] };
      clearLive();
    }
    if (touches.has(e.pointerId)) { touches.set(e.pointerId, { x: e.clientX, y: e.clientY }); moveGesture(); return; }
    if (!cur || e.pointerId !== cur.id) {
      if (!cur && e.pointerType !== "touch" && prefs.tool === "eraser") drawEraserCursor(...toPage(e));
      return;
    }
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    if (cur.erase) { for (const ev of evs.length ? evs : [e]) eraseMove(...toPage(ev)); return; }
    if (cur.shape) { const [x, y] = toPage(e); setShape(cur, Sh.adjustShape(cur.shape, cur.anchor, { x, y })); return; }
    // se movió: vuelve a esperar a que quede quieto
    if (Math.hypot(e.clientX - cur.still[0], e.clientY - cur.still[1]) > HOLD_PX) { cur.still = [e.clientX, e.clientY]; armHold(); }
    const s = cur.s, minD = 0.6 / Math.max(view.z, 1);
    for (const ev of evs.length ? evs : [e]) {
      const [x, y] = toPage(ev), n = s.p.length;
      if (Math.hypot(x - s.p[n - 3], y - s.p[n - 2]) < minD) continue;
      // la presión se suaviza un poco para que el grosor no salte
      s.p.push(x, y, s.p[n - 1] * 0.6 + pressureOf(ev) * 0.4);
    }
    const n = s.p.length / 3;
    if (n > cur.n) { strokePath(s, cur.n, cur.path); cur.n = n; }   // agrega solo lo nuevo al contorno
    predicted = e.getPredictedEvents ? e.getPredictedEvents().slice(0, 3).map(toPage) : [];
    if (!rafLive) rafLive = requestAnimationFrame(drawLive);
  }
  function drawLive() {
    rafLive = 0;
    if (!cur || cur.erase) return;
    clearLive(); setXform(lctx);
    const th = theme();
    fillStroke(lctx, cur.s, th, cur.path);
    if (predicted.length) {   // trazo predicho: baja la latencia percibida; no se guarda
      const s = cur.s, n = s.p.length, last = s.p.slice(n - 3), pr = last[2];
      const ghost = { c: s.c, w: s.w, h: s.h, p: [...last, ...predicted.flatMap(([x, y]) => [x, y, pr])] };
      if (!s.h) fillStroke(lctx, ghost, th, strokePath(ghost));
    }
  }
  function eraseMove(x, y) {
    const r = SIZES.eraser[prefs.size] / Math.max(view.z, 1) * 1.2;
    // se recorre el tramo desde la posición anterior, para que un movimiento rápido no saltee trazos
    const [px, py] = cur.last || [x, y], steps = Math.max(1, Math.ceil(Math.hypot(x - px, y - py) / (r / 2)));
    let any = false;
    for (let k = 1; k <= steps; k++) {
      const act = eraseAt(page, px + (x - px) * k / steps, py + (y - py) * k / steps, r);
      if (act) { cur.acts.push(act); any = true; }
    }
    cur.last = [x, y];
    if (any) redraw();
    drawEraserCursor(x, y);
  }
  function drawEraserCursor(x, y) {
    clearLive(); setXform(lctx);
    const r = SIZES.eraser[prefs.size] / Math.max(view.z, 1) * 1.2;
    lctx.beginPath(); lctx.arc(x, y, r, 0, Math.PI * 2);
    lctx.lineWidth = 1.5 / scale(); lctx.strokeStyle = COLORS.ink[theme()]; lctx.globalAlpha = 0.5; lctx.stroke(); lctx.globalAlpha = 1;
  }
  function onUp(e) {
    trackButton(e);
    if (touches.has(e.pointerId)) { touches.delete(e.pointerId); startGesture(); return; }
    if (!cur || e.pointerId !== cur.id) return;
    if (e.pointerType === "pen") lastPen = performance.now();
    const c = cur; cur = null; predicted = [];
    clearTimeout(c.holdT);
    cancelAnimationFrame(rafLive); rafLive = 0;
    clearLive();
    if (c.erase) {
      // un arrastre del borrador son varios borrados sucesivos: se deshacen juntos
      if (c.acts.length) { (page._undo || (page._undo = [])).push({ a: "seq", acts: c.acts }); page._redo = []; persist(page); }
      syncBar();
      return;
    }
    if (e.type === "pointercancel" && c.type === "touch") { redraw(); return; }
    commitStroke(c);
    syncBar();
  }
  function commitStroke(c) {
    c.s._path = c.path; c.s._bb = bbox(c.s);
    doAct(page, { a: "add", s: c.s });
    fillStroke(bctx, c.s, theme());   // ya está la transformación de la hoja en bctx
    persist(page);
  }
  function cancelStroke() { if (cur) clearTimeout(cur.holdT); cur = null; predicted = []; clearLive(); }

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

  // ---------- barra ----------
  function onBar(e) {
    const b = e.target.closest("[data-b]");
    if (!b || b.disabled) return;
    const v = b.dataset.v;
    switch (b.dataset.b) {
      case "tool": prefs.tool = v; break;
      case "color": if (prefs.tool === "hl") prefs.hlColor = v; else prefs.color = v; break;
      case "size": prefs.size = +v; break;
      case "undo": if (undoAny(page)) { redraw(); persist(page); } break;
      case "redo": if (redoAny(page)) { redraw(); persist(page); } break;
      case "paper": prefs.paper = PAPERS[(PAPERS.indexOf(prefs.paper) + 1) % PAPERS.length]; hint("Hoja " + PAPER_LABEL[prefs.paper].toLowerCase()); redraw(); break;
      case "finger": prefs.finger = !fingerDraws(); hint(prefs.finger ? "El dedo dibuja" : "El dedo mueve la hoja"); break;
      case "clear":
        if (page.s.length && confirm("¿Borrar todo lo de esta hoja? Podés deshacerlo.")) { doAct(page, { a: "clear", list: [...page.s] }); redraw(); persist(page); }
        break;
      case "prev": case "next": {
        const all = pages.includes(page) ? pages : [...pages, page], i = all.indexOf(page) + (b.dataset.b === "next" ? 1 : -1);
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
  // deshacer / rehacer con las acciones compuestas del borrador
  function undoAny(p) {
    const a = p._undo && p._undo[p._undo.length - 1];
    if (!a) return false;
    if (a.a !== "seq") return undo(p);
    p._undo.pop();
    for (const x of [...a.acts].reverse()) apply(p, x, true);
    (p._redo || (p._redo = [])).push(a);
    return true;
  }
  function redoAny(p) {
    const a = p._redo && p._redo[p._redo.length - 1];
    if (!a) return false;
    if (a.a !== "seq") return redo(p);
    p._redo.pop();
    for (const x of a.acts) apply(p, x, false);
    p._undo.push(a);
    return true;
  }
  T.undoAny = undoAny; T.redoAny = redoAny;

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
      flush();
      open = false; cur = null; touches.clear(); gesture = null;
      el.classList.remove("show");
      layout();
      if (pushed && !fromPop) { pushed = false; ignorePop = true; history.back(); }
      pushed = false;
      onChange();
    },
    toggle() { return open ? api.close() : api.open(); }
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
    }, true);
    window.addEventListener("keydown", e => {
      if (!open) return;
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && (k === "z" || k === "y")) {
        e.preventDefault(); e.stopPropagation();
        if ((k === "z" && !e.shiftKey ? undoAny(page) : redoAny(page))) { redraw(); persist(page); syncBar(); }
      } else if (k === "escape" && !docked) { e.stopPropagation(); api.close(); }
    }, true);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); else if (open) redraw(); });
    const reTheme = () => { if (open) { syncBar(); redraw(); } };
    mq("(prefers-color-scheme: dark)").addEventListener("change", reTheme);
    if (typeof MutationObserver === "function") new MutationObserver(reTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }
  E.board = api;
  E.boardShapes = Sh;
})();
