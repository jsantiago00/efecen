// Motor de efecen: RNG, helpers de LaTeX, parser, repaso espaciado, registro de materias y estado.
// Lo carga index.html antes del contenido, y los tests lo ejecutan en un vm de Node.
(function (root) {
  "use strict";
  const E = root.Efecen = { version: "0.1.0", courses: {}, courseOrder: [] };

  // ---------- RNG con semilla (mulberry32) ----------
  E.rng = function (seed) {
    let a = seed >>> 0;
    const next = () => {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const r = {
      seed, next,
      int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
      nz: (lo, hi) => { let v; do v = r.int(lo, hi); while (v === 0); return v; },
      pick: arr => arr[Math.floor(next() * arr.length)],
      bool: (p = 0.5) => next() < p,
      sign: () => (next() < 0.5 ? -1 : 1),
      shuffle: arr => { const a2 = arr.slice(); for (let i = a2.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a2[i], a2[j]] = [a2[j], a2[i]]; } return a2; },
      sample: (arr, n) => r.shuffle(arr).slice(0, n),
      distinct: (n, lo, hi, opts = {}) => {
        const out = [];
        let guard = 0;
        while (out.length < n && guard++ < 1000) {
          const v = r.int(lo, hi);
          if (opts.nonzero && v === 0) continue;
          if (opts.exclude && opts.exclude.includes(v)) continue;
          if (!out.includes(v)) out.push(v);
        }
        return out;
      }
    };
    return r;
  };
  E.newSeed = () => (Math.random() * 4294967296) >>> 0;

  // ---------- Helpers para escribir LaTeX ----------
  // métodos del lápiz `g` de las figuras interactivas (bloques `viz` de los apuntes; los dibuja la UI)
  E.VIZ_API = ["grid", "axes", "fn", "curve", "line", "arrow", "dot", "circle", "rect", "poly", "text", "px"];
  const H = E.H = {};
  H.gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  // fracción reducida en LaTeX
  H.frac = (p, q) => {
    if (q === 0) return "\\text{indef.}";
    if (q < 0) { p = -p; q = -q; }
    const g = H.gcd(p, q); p /= g; q /= g;
    if (q === 1) return String(p);
    return (p < 0 ? "-" : "") + `\\frac{${Math.abs(p)}}{${q}}`;
  };
  // número "lindo": entero si lo es, si no hasta d decimales
  H.num = (x, d = 3) => {
    if (!isFinite(x)) return x > 0 ? "\\infty" : "-\\infty";
    const r = Math.round(x);
    if (Math.abs(x - r) < 1e-9) return String(r === 0 ? 0 : r);
    const s = String(+x.toFixed(d));
    return s === "-0" ? "0" : s;
  };
  H.m = s => `$\\displaystyle ${s}$`;
  H.xp = (n, v = "x") => (n === 0 ? "" : n === 1 ? v : `${v}^{${n}}`);
  // término con signo: term(-3,"x^{2}",false) -> " - 3x^{2}"
  H.term = (c, mono, first) => {
    if (c === 0) return "";
    const sign = c < 0 ? "-" : first ? "" : "+";
    const a = Math.abs(c);
    const body = mono ? (a === 1 ? mono : a + mono) : String(a);
    return first ? sign + body : ` ${sign} ${body}`;
  };
  // poly([[3,"x^{2}"],[-1,"x"],[5,""]]) -> "3x^{2} - x + 5"
  H.poly = terms => {
    let out = "", first = true;
    for (const [c, mono] of terms) {
      if (c === 0) continue;
      out += H.term(c, mono, first);
      first = false;
    }
    return out || "0";
  };
  // coeficientes de mayor a menor grado
  H.polyc = (coeffs, v = "x") => H.poly(coeffs.map((c, i) => [c, H.xp(coeffs.length - 1 - i, v)]));
  H.peval = (coeffs, x) => coeffs.reduce((acc, c) => acc * x + c, 0);
  // sustitución visible: psub([6,-4,1], 2) -> "6\cdot 2^{2} - 4\cdot 2 + 1"
  H.psub = (coeffs, v) => {
    const deg = coeffs.length - 1, pv = v < 0 ? `(${v})` : String(v);
    let out = "", first = true;
    coeffs.forEach((c, i) => {
      const k = deg - i;
      if (c === 0) return;
      const a = Math.abs(c), sign = c < 0 ? "-" : first ? "" : "+";
      const body = k === 0 ? String(a) : (a === 1 ? "" : a + "\\cdot ") + pv + (k > 1 ? `^{${k}}` : "");
      out += first ? sign + body : ` ${sign} ${body}`;
      first = false;
    });
    return out || "0";
  };
  // "x - 3", "x + 2", "x"
  H.xm = (r, v = "x") => (r === 0 ? v : r > 0 ? `${v} - ${r}` : `${v} + ${-r}`);
  // coeficiente delante de un paréntesis: 1 -> "", -1 -> "-"
  H.cf = c => (c === 1 ? "" : c === -1 ? "-" : String(c));
  H.kx = (k, v = "x") => (k === 1 ? v : k === -1 ? "-" + v : k + v);
  // número entre paréntesis si es negativo (para sustituciones)
  H.par = v => (typeof v === "number" && v < 0 ? `(${H.num(v)})` : typeof v === "number" ? H.num(v) : v);
  // " + 3" / " - 3"
  H.sg = v => (v < 0 ? ` - ${H.num(-v)}` : ` + ${H.num(v)}`);
  H.angles = [
    { v: Math.PI / 6, t: "\\frac{\\pi}{6}" }, { v: Math.PI / 4, t: "\\frac{\\pi}{4}" },
    { v: Math.PI / 3, t: "\\frac{\\pi}{3}" }, { v: Math.PI / 2, t: "\\frac{\\pi}{2}" }
  ];
  // armar opción múltiple: dedup + completar con fallbacks + mezclar
  H.mc = (r, correct, distractors, opts = {}) => {
    const seen = new Set([correct]);
    const ds = [];
    for (const d of [...distractors, ...(opts.fallback || [])]) {
      if (ds.length >= (opts.n || 4) - 1) break;
      if (d != null && !seen.has(d)) { seen.add(d); ds.push(d); }
    }
    const raw = opts.keepOrder ? [correct, ...ds] : r.shuffle([correct, ...ds]);
    const options = opts.text ? raw : raw.map(H.m);
    return { options, correct: raw.indexOf(correct) };
  };

  // ---------- Parser numérico seguro (sin eval) ----------
  const NAMES = ["sqrt", "exp", "sin", "cos", "tan", "ln", "log", "pi", "e"];
  const FN = { sqrt: Math.sqrt, ln: Math.log, log: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, exp: Math.exp };
  E.parseNum = function (src) {
    if (src == null) return NaN;
    // notación científica: 1,3E-5, 1,3e7 (e pegada a un dígito y seguida de dígitos) y 1,3 x 10^7; «2e» sola sigue siendo 2·e
    let s = String(src).trim().replace(/(\d)\s*[xX×·*]\s*10\s*\^/g, "$1*10^").replace(/(\d)E([+-]?\d+)/g, "$1*10^($2)").replace(/(\d)e(\d+)/g, "$1*10^($2)").toLowerCase()
      .replace(/,/g, ".").replace(/π/g, "pi").replace(/√/g, "sqrt")
      .replace(/[·×]/g, "*").replace(/[−–]/g, "-").replace(/\s+/g, "");
    if (!s) return NaN;
    const open = (s.match(/\(/g) || []).length - (s.match(/\)/g) || []).length;
    if (open > 0) s += ")".repeat(open);
    const toks = [];
    let i = 0;
    while (i < s.length) {
      const ch = s[i];
      const num = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));
      if (num) { toks.push({ t: "n", v: parseFloat(num[1]) }); i += num[1].length; continue; }
      if ("+-*/^()".includes(ch)) { toks.push({ t: ch }); i++; continue; }
      const name = NAMES.find(n => s.startsWith(n, i));
      if (name) { toks.push({ t: "id", v: name }); i += name.length; continue; }
      return NaN;
    }
    let k = 0;
    const eat = t => (toks[k] && toks[k].t === t ? (k++, true) : false);
    const expr = () => { let v = term(); for (;;) { if (eat("+")) v += term(); else if (eat("-")) v -= term(); else return v; } };
    const term = () => {
      let v = unary();
      for (;;) {
        if (eat("*")) v *= unary();
        else if (eat("/")) v /= unary();
        else { const p = toks[k]; if (p && (p.t === "n" || p.t === "id" || p.t === "(")) v *= power(); else return v; }
      }
    };
    const unary = () => (eat("-") ? -unary() : eat("+") ? unary() : power());
    const power = () => { const b = atom(); return eat("^") ? Math.pow(b, unary()) : b; };
    const atom = () => {
      const p = toks[k++];
      if (!p) throw 0;
      if (p.t === "n") return p.v;
      if (p.t === "(") { const v = expr(); if (!eat(")")) throw 0; return v; }
      if (p.t === "id") {
        if (p.v === "pi") return Math.PI;
        if (p.v === "e") return Math.E;
        return FN[p.v](power());
      }
      throw 0;
    };
    try { const v = expr(); return k === toks.length ? v : NaN; } catch (e) { return NaN; }
  };
  // ¿la respuesta numérica es correcta? tolerancia relativa, o redondeo a 2 decimales
  E.checkNumeric = function (user, answer, tol = 0.01) {
    if (!isFinite(user)) return false;
    const diff = Math.abs(user - answer);
    if (diff <= tol * Math.abs(answer) + 1e-9) return true;
    if (Math.abs(user - Math.round(answer * 100) / 100) < 1e-9) return true;
    return Math.abs(answer) < 1e-9 && Math.abs(user) < 1e-6;
  };

  // ---------- Fechas (siempre en hora local) ----------
  const pad = n => String(n).padStart(2, "0");
  E.fmtDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  E.today = () => E.fmtDate(new Date());
  // la meta diaria es fija para todos (como en la liga compiten todos con las mismas reglas)
  E.DAILY_GOAL = 50;
  // liga semanal: la semana va de lunes a domingo; se identifica por la fecha de su lunes
  E.weekStart = str => { const [y, m, d] = str.split("-").map(Number), wd = (new Date(y, m - 1, d).getDay() + 6) % 7; return E.addDays(str, -wd); };
  E.weekXp = (s, date) => { const w = E.weekStart(date); let t = 0; for (let i = 0; i < 7; i++) t += s.xpByDay[E.addDays(w, i)] || 0; return t; };
  // nombre que se muestra en la liga: el primer nombre y la inicial del apellido
  E.leagueName = full => { const p = String(full || "").trim().split(/\s+/).filter(Boolean); return !p.length ? "Anónimo" : (p[0] + (p[1] ? " " + p[1][0].toUpperCase() + "." : "")).slice(0, 40); };
  E.addDays = (str, n) => { const [y, m, d] = str.split("-").map(Number); return E.fmtDate(new Date(y, m - 1, d + n)); };
  E.diffDays = (a, b) => { const [y1, m1, d1] = a.split("-").map(Number); const [y2, m2, d2] = b.split("-").map(Number); return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 864e5); };

  // ---------- Repetición espaciada (SM-2 simplificado, por concepto) ----------
  E.srs = {
    newCard: () => ({ ef: 2.5, int: 0, reps: 0, due: null, last: null, seen: 0, ok: 0 }),
    // nota 0-5 a partir del desempeño (sin autoevaluación)
    grade(ok, ms, difficulty = 1) {
      if (!ok) return 1;
      const s = ms / 1000 / difficulty;
      return s < 25 ? 5 : s < 70 ? 4 : 3;
    },
    update(card, q, today) {
      const c = Object.assign(E.srs.newCard(), card);
      if (q < 3) { c.reps = 0; c.int = 1; }
      else {
        c.reps += 1;
        c.int = c.reps === 1 ? 1 : c.reps === 2 ? 3 : Math.max(1, Math.round(c.int * c.ef));
      }
      c.ef = Math.max(1.3, +(c.ef + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)).toFixed(3));
      c.due = E.addDays(today, c.int);
      c.last = today;
      return c;
    }
  };

  // ---------- Registro de cursos ----------
  // ---------- Registro de materias (una materia = un curso) ----------
  // Cada archivo de materia llama una vez a E.registerCourse y después a E.extendCourse por
  // cada unidad (conceptos, plantillas, lecciones y apuntes). Así se agrega contenido de a una unidad.
  E.cards = {};      // id -> ficha de apuntes (ids únicos entre materias)
  E.termIndex = [];  // [{ alias, id }] para el autolink
  E.career = null;
  E.registerCareer = def => { E.career = def; };
  E.registerCourse = function (c) {
    c.concepts = c.concepts || {};
    c.templates = c.templates || {};
    c.units = c.units || [];
    c.theory = { cards: {}, lessons: {} };
    E.courses[c.id] = c;
    if (!E.courseOrder.includes(c.id)) E.courseOrder.push(c.id);
    indexCourse(c);
    return c;
  };
  E.extendCourse = function (cid, ext) {
    const c = E.courses[cid];
    if (!c) throw new Error("Materia no registrada: " + cid);
    Object.assign(c.concepts, ext.concepts || {});
    Object.assign(c.templates, ext.templates || {});
    for (const u of ext.units || []) {
      const i = c.units.findIndex(x => x.id === u.id);
      if (i >= 0) c.units[i] = u; else c.units.push(u);
    }
    const defGroup = ext.units && ext.units.length === 1 ? ext.units[0].id : null;
    for (const [id, card] of Object.entries(ext.cards || {})) {
      card.id = id; card.course = cid; card.group = card.group || defGroup;
      c.theory.cards[id] = card;
      E.cards[id] = card;
      for (const a of card.aliases || []) E.termIndex.push({ alias: a.toLowerCase(), id });
    }
    Object.assign(c.theory.lessons, ext.lessons || {});
    E._termRe = null;
    indexCourse(c);
  };
  // figuras interactivas para fichas que ya existen: { "id-ficha": [bloque, …] }. Cada bloque va al final de la
  // sección `sec` (por defecto «La idea»).
  E.addFigures = function (cid, figs) {
    for (const [id, list] of Object.entries(figs)) {
      const card = E.cards[id];
      if (!card || card.course !== cid) throw new Error(`Ficha inexistente en ${cid}: ${id}`);
      for (const b of list) { const sec = b.sec || "idea"; (card[sec] = card[sec] || []).push(b); }
    }
  };
  // compatibilidad con el formato anterior de apuntes
  E.registerTheory = (cid, th) => E.extendCourse(cid, { cards: th.cards, lessons: th.lessons });
  function indexCourse(c) {
    c.units.sort((a, b) => (a.order || 0) - (b.order || 0));
    c.tplLesson = {}; c.conceptUnit = {}; c.lessonList = [];
    for (const [id, t] of Object.entries(c.templates)) t.id = id;
    c.units.forEach((u, ui) => {
      u.index = ui;
      u.lessons = u.lessons || [];
      u.lessons.forEach((l, li) => {
        l.unit = u; l.index = li;
        l.concepts = [...new Set(l.templates.flatMap(t => (c.templates[t] ? c.templates[t].concepts : [])))];
        l.templates.forEach(t => { c.tplLesson[t] = l; });
        l.concepts.forEach(k => { if (!c.conceptUnit[k]) c.conceptUnit[k] = u; });
        l.theory = c.theory.lessons[l.id] || l.theory || [];
        c.lessonList.push(l);
      });
    });
    // concepto -> fichas, priorizando el orden en que aparecen en las lecciones
    c.conceptCards = {};
    const order = [...new Set([...c.lessonList.flatMap(l => l.theory), ...Object.keys(c.theory.cards)])].filter(id => c.theory.cards[id]);
    // orden de lectura de los apuntes: el del recorrido de las lecciones (las fichas sueltas, al final)
    c.cardOrder = order;
    // la lección donde se presenta cada ficha; en las siguientes que la listan, la ficha es de repaso
    c.cardFirstLesson = {};
    for (const l of c.lessonList) for (const id of l.theory) if (!c.cardFirstLesson[id]) c.cardFirstLesson[id] = l;
    for (const id of order) {
      const card = c.theory.cards[id];
      if (card) for (const k of card.concepts || []) (c.conceptCards[k] = c.conceptCards[k] || []).push(id);
    }
  }
  // test de una unidad: las plantillas declaradas o, si no hay, una de cada lección (las más difíciles)
  E.unitDiagnostic = function (c, u) {
    if (u.diagnostic && u.diagnostic.length) return u.diagnostic;
    const ls = u.lessons;
    const pick = ls.length <= 3 ? ls : [ls[0], ls[Math.floor(ls.length / 2)], ls[ls.length - 1]];
    return pick.map(l => l.templates.slice().sort((a, b) => c.templates[b].difficulty - c.templates[a].difficulty)[0]);
  };
  const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  E.termRegex = () => E._termRe || (E._termRe = E.termIndex.length
    ? new RegExp(`(?<![\\p{L}\\p{N}])(${E.termIndex.map(t => t.alias).sort((a, b) => b.length - a.length).map(escRe).join("|")})(?![\\p{L}\\p{N}])`, "giu")
    : null);
  // Convierte un trozo de texto (sin LaTeX) en HTML: [[id|texto]] -> link, **negrita**,
  // y si ctx.auto, los términos conocidos -> link (una vez por ficha y por bloque).
  E.linkText = function (text, ctx = {}) {
    const seen = ctx.seen || new Set();
    const link = (id, label) => `<a class="term" role="link" tabindex="0" data-act="learn" data-id="${id}">${label}</a>`;
    let out = String(text)
      .replace(/\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g, (m, id, label) => {
        const card = E.cards[id];
        if (!card) return label || id;
        seen.add(id);
        return link(id, label || card.title);
      })
      .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
    const re = ctx.auto && E.termRegex();
    if (!re) return out;
    let inA = false;
    return out.split(/(<[^>]+>)/).map(piece => {
      if (piece.startsWith("<")) { if (/^<a\b/.test(piece)) inA = true; else if (/^<\/a>/.test(piece)) inA = false; return piece; }
      if (inA) return piece;
      return piece.replace(re, m => {
        const t = E.termIndex.find(x => x.alias === m.toLowerCase());
        if (!t || seen.has(t.id) || t.id === ctx.exclude) return m;
        seen.add(t.id);
        return link(t.id, m);
      });
    }).join("");
  };

  // genera una instancia reproducible de una plantilla
  E.instantiate = function (course, tplId, seed) {
    const t = course.templates[tplId];
    for (let tries = 0; tries < 30; tries++) {
      const inst = t.generate(E.rng(seed + tries * 7919), H);
      if (inst) { inst.type = inst.type || t.type; return inst; }
    }
    throw new Error("No se pudo generar " + tplId);
  };

  // ---------- evaluaciones: parciales y finales simulados ----------
  // E.exams[cid] = { self: { id: { concepts, generate(r, H, args) → { prompt, rubric: [{ text, w }], solution } } }, list: [examen] }
  // examen: { id, kind: "parcial" | "final", title, topics, minutes, pass, items: [{ title, parts: [parte] }] }
  // parte: { pts, tpl } (plantilla fija), { pts, pick: [...] } (una al azar), { pts, self, args } (de desarrollo,
  // autocorregida) o { pts, any: [alternativas] }: en cada intento se sortea una de las alternativas (cada una es
  // una parte sin pts), así un mismo examen puede traer ejercicios distintos, como pasa de un año a otro.
  // Las plantillas de nivel examen (corrección automática, con verify) van en `templates` y se buscan ahí si la
  // materia no tiene una con ese id.
  E.exams = {};
  E.registerExams = function (cid, def) {
    const prev = E.exams[cid] || { self: {}, templates: {}, list: [] };
    E.exams[cid] = { self: Object.assign(prev.self, def.self), templates: Object.assign(prev.templates, def.templates), list: prev.list.concat(def.exams || []) };
  };
  E.examTemplate = (cid, id) => (E.courses[cid].templates[id] || (E.exams[cid] && E.exams[cid].templates[id]));
  E.instantiateExam = function (cid, id, seed) {
    const t = E.examTemplate(cid, id);
    return E.instantiate({ templates: { [id]: t } }, id, seed);
  };
  E.instantiateSelf = function (cid, id, seed, args) {
    const g = E.exams[cid].self[id];
    for (let tries = 0; tries < 30; tries++) {
      const o = g.generate(E.rng(seed + tries * 7919), H, args);
      if (o) return Object.assign({ type: "self", concepts: g.concepts || [] }, o);
    }
    throw new Error("No se pudo generar " + id);
  };
  // reparte los puntos de una parte entre los criterios de la rúbrica (en medios puntos, sumando exacto)
  E.rubricPoints = function (rubric, pts) {
    const W = rubric.reduce((t, x) => t + x.w, 0);
    let acc = 0;
    return rubric.map((x, i) => {
      if (i === rubric.length - 1) return pts - acc;
      const v = Math.round(pts * x.w / W * 2) / 2;
      acc += v;
      return v;
    });
  };
  // arma un intento: cada parte con su plantilla (sorteada si hay varias) y su semilla
  E.buildExam = function (cid, examId, seed) {
    const ex = E.exams[cid].list.find(e => e.id === examId), r = E.rng(seed), parts = [];
    // un ítem también puede ser { any: [ítems] }: se sortea el ejercicio entero (todas las alternativas valen lo mismo)
    const items = ex.items.map(it => (it.any ? r.pick(it.any) : it));
    items.forEach((it, i) => it.parts.forEach((p0, j) => {
      const p = p0.any ? r.pick(p0.any) : p0;
      parts.push({
        item: i, label: it.parts.length > 1 ? `${i + 1}.${j + 1}` : `${i + 1}`, pts: p0.pts,
        tpl: p.tpl || (p.pick ? r.pick(p.pick) : null), self: p.self || null, args: p.args || null, seed: r.int(1, 1e9)
      });
    }));
    return { exam: Object.assign({}, ex, { items }), parts };
  };

  // ---------- Ejercicio del día ----------
  // Sale de las lecciones ya completadas y es el mismo todo el día (la semilla es la fecha).
  // Se queda con las plantillas más exigentes que tengas: dificultad 3 si hay al menos 3, si no 2 y 3.
  // `cands` es una lista de { cid, tpl, difficulty, type } en un orden fijo.
  E.dailySeed = date => { let h = 2166136261; for (const ch of "efecen-dia-" + date) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h % 1e9 + 1; };
  E.dailyPick = (cands, date) => {
    const ok = cands.filter(c => c.type !== "tf" && c.difficulty >= 2);
    if (!ok.length) return null;
    const hard = ok.filter(c => c.difficulty >= 3), pool = hard.length >= 3 ? hard : ok;
    const r = E.rng(E.dailySeed(date));
    return Object.assign({ seed: r.int(1, 1e9) }, r.pick(pool));
  };

  // ---------- Estado persistente ----------
  E.store = {
    key: "efecen:v1",
    defaults: () => ({
      app: "efecen", version: 1,
      settings: { goal: 50, sound: true, theme: "auto", league: true },
      xp: 0, streak: 0, bestStreak: 0, lastActive: null,
      xpByDay: {}, activeCourse: null,
      courses: {}, srs: {}, log: [], answered: 0, answeredOk: 0, read: {},
      exams: {}, // "m101/p1" -> { best, attempts: [{ d, t, score }] } (los más nuevos primero)
      daily: {} // ejercicio del día: "2026-10-15" -> { cid, tpl, ok }
    }),
    migrate(s) {
      const d = E.store.defaults();
      for (const k of Object.keys(d)) if (s[k] === undefined) s[k] = d[k];
      s.settings = Object.assign(d.settings, s.settings);
      // materias renombradas al pasar a "la carrera" (calculo -> m101)
      for (const [o, n] of Object.entries(E.store.renamed)) {
        if (s.courses[o] && !s.courses[n]) s.courses[n] = s.courses[o];
        delete s.courses[o];
        for (const k of Object.keys(s.srs)) if (k.startsWith(o + "/")) { s.srs[n + k.slice(o.length)] = s.srs[k]; delete s.srs[k]; }
        if (s.activeCourse === o) s.activeCourse = n;
        for (const l of s.log) if (l.c === o) l.c = n;
      }
      return s;
    },
    renamed: { calculo: "m101" },
    valid: s => !!s && typeof s === "object" && s.app === "efecen" && typeof s.version === "number" && typeof s.srs === "object" && typeof s.courses === "object",
    load() {
      try {
        const raw = localStorage.getItem(E.store.key);
        if (!raw) return E.store.defaults();
        const s = JSON.parse(raw);
        return E.store.valid(s) ? E.store.migrate(s) : E.store.defaults();
      } catch (e) { return E.store.defaults(); }
    },
    save(s) { try { localStorage.setItem(E.store.key, JSON.stringify(s)); return true; } catch (e) { return false; } },
    // combina el progreso de dos dispositivos sin perder nada: todo lo acumulable se queda con el máximo
    // o la unión, y lo "de estado" (ajustes, materia activa, racha) se toma del más reciente.
    // Es idempotente y conmutativo en lo acumulable, así que sincronizar dos veces no cambia nada.
    merge(a, b) {
      a = E.store.migrate(JSON.parse(JSON.stringify(a))); b = E.store.migrate(JSON.parse(JSON.stringify(b)));
      const newer = (b.lastActive || "") > (a.lastActive || "") ? b : a, older = newer === a ? b : a;
      const out = JSON.parse(JSON.stringify(newer));
      const max = (x, y) => Math.max(x || 0, y || 0);
      out.xp = max(a.xp, b.xp); out.answered = max(a.answered, b.answered); out.answeredOk = max(a.answeredOk, b.answeredOk);
      out.bestStreak = max(a.bestStreak, b.bestStreak);
      if (a.lastActive === b.lastActive) out.streak = max(a.streak, b.streak);
      out.activeCourse = newer.activeCourse || older.activeCourse;
      for (const [d, x] of Object.entries(older.xpByDay)) out.xpByDay[d] = max(out.xpByDay[d], x);
      for (const id of Object.keys(older.read)) out.read[id] = true;
      // tarjetas de repaso: la que más se practicó (a igualdad, la de repaso más reciente)
      for (const [k, c] of Object.entries(older.srs)) {
        const o = out.srs[k];
        if (!o || c.seen > o.seen || (c.seen === o.seen && (c.last || "") > (o.last || ""))) out.srs[k] = c;
      }
      for (const [cid, oc] of Object.entries(older.courses)) {
        const st = out.courses[cid] = out.courses[cid] || { lessons: {}, diag: null };
        st.lessons = st.lessons || {}; st.unitsOpen = Object.assign({}, oc.unitsOpen || {}, st.unitsOpen || {});
        st.diag = st.diag || oc.diag || null;
        // juegos: un jefe vencido en algún dispositivo queda vencido; el récord del contrarreloj, el máximo
        if (oc.bosses) {
          st.bosses = st.bosses || {};
          for (const [uid, ob] of Object.entries(oc.bosses)) {
            const b = st.bosses[uid] = st.bosses[uid] || {};
            b.won = !!(b.won || ob.won); b.wins = max(b.wins, ob.wins);
          }
        }
        if (st.rush || oc.rush) st.rush = max(st.rush, oc.rush);
        for (const [lid, ol] of Object.entries(oc.lessons || {})) {
          const l = st.lessons[lid] = st.lessons[lid] || {};
          l.done = !!(l.done || ol.done); l.plays = max(l.plays, ol.plays); l.best = max(l.best, ol.best);
        }
      }
      for (const st of Object.values(out.courses)) { st.lessons = st.lessons || {}; st.unitsOpen = st.unitsOpen || {}; if (st.diag === undefined) st.diag = null; }
      // evaluaciones: la unión de los intentos (sin repetir) y la mejor nota
      for (const [k, oe] of Object.entries(older.exams)) {
        const e = out.exams[k] = out.exams[k] || { best: 0, attempts: [] }, have = new Set(e.attempts.map(x => x.t));
        e.best = max(e.best, oe.best);
        e.attempts = e.attempts.concat((oe.attempts || []).filter(x => !have.has(x.t))).sort((x, y) => y.t - x.t).slice(0, 30);
      }
      // ejercicio del día: si se resolvió bien en algún dispositivo, cuenta como resuelto
      for (const [d, od] of Object.entries(older.daily)) {
        const x = out.daily[d];
        if (!x || (od.ok && !x.ok)) out.daily[d] = od;
      }
      const seen = new Set();
      out.log = a.log.concat(b.log).filter(l => { const k = JSON.stringify(l); return seen.has(k) ? false : seen.add(k); })
        .sort((x, y) => (y.d > x.d ? 1 : y.d < x.d ? -1 : 0)).slice(0, 60);
      return out;
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
