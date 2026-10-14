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
  const prefs = Object.assign({ show: "auto", pen: false, finger: null, tool: "pen", color: "ink", size: 1, hlColor: "yellow", paper: "grid", promptOpen: true }, (() => {
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
  let open = false, docked = false, pushed = false, onChange = () => {};
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
          <button data-b="clear" aria-label="Borrar la hoja">${ICON("trash-2")}</button></div>
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
    live.addEventListener("pointerleave", e => { if (e.pointerType !== "touch" && !cur) clearLive(); });
    live.addEventListener("wheel", onWheel, { passive: false });
    live.addEventListener("contextmenu", e => e.preventDefault());
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
  function onDown(e) {
    if (e.pointerType === "pen") {
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
      live.setPointerCapture(e.pointerId);
      startGesture();
      return;
    }
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (cur) return;
    if (touches.size) { touches.clear(); gesture = null; }
    startStroke(e);
  }
  function startStroke(e) {
    live.setPointerCapture(e.pointerId);
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
    cur = { id: e.pointerId, type: e.pointerType, s, path: strokePath(s), n: 1 };
    drawLive();
  }
  function onMove(e) {
    if (e.pointerType === "pen") lastPen = performance.now();
    if (touches.has(e.pointerId)) { touches.set(e.pointerId, { x: e.clientX, y: e.clientY }); moveGesture(); return; }
    if (!cur || e.pointerId !== cur.id) {
      if (!cur && e.pointerType !== "touch" && prefs.tool === "eraser") drawEraserCursor(...toPage(e));
      return;
    }
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    if (cur.erase) { for (const ev of evs.length ? evs : [e]) eraseMove(...toPage(ev)); return; }
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
    if (touches.has(e.pointerId)) { touches.delete(e.pointerId); startGesture(); return; }
    if (!cur || e.pointerId !== cur.id) return;
    if (e.pointerType === "pen") lastPen = performance.now();
    const c = cur; cur = null; predicted = [];
    cancelAnimationFrame(rafLive); rafLive = 0;
    clearLive();
    if (c.erase) {
      // un arrastre del borrador son varios borrados sucesivos: se deshacen juntos
      if (c.acts.length) { (page._undo || (page._undo = [])).push({ a: "seq", acts: c.acts }); page._redo = []; persist(page); }
      syncBar();
      return;
    }
    if (e.type === "pointercancel" && c.type === "touch") { redraw(); return; }
    c.s._path = c.path; c.s._bb = bbox(c.s);
    doAct(page, { a: "add", s: c.s });
    fillStroke(bctx, c.s, theme());   // ya está la transformación de la hoja en bctx
    persist(page);
    syncBar();
  }
  function cancelStroke() { cur = null; predicted = []; clearLive(); }

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
    docked = open && dockMQ.matches;
    el.classList.toggle("docked", docked);
    document.body.classList.toggle("board-docked", docked);
    document.body.classList.toggle("board-full", open && !docked);
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
      if (!docked) { history.pushState({ efecenBoard: 1 }, "", location.hash || "#/"); pushed = true; }
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
      } else if (k === "escape" && !docked && !document.body.classList.contains("learn-open")) { e.stopPropagation(); api.close(); }
    }, true);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); else if (open) redraw(); });
    const reTheme = () => { if (open) { syncBar(); redraw(); } };
    mq("(prefers-color-scheme: dark)").addEventListener("change", reTheme);
    if (typeof MutationObserver === "function") new MutationObserver(reTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }
  E.board = api;
})();
