/*
 * Las carreras: Licenciatura en Ciencias Básicas, FCEN, Universidad Nacional de Cuyo — Plan Ord. 77/15 C.S.
 * Una por orientación (Física, Matemática, Química y Biología). Cada cuenta elige la suya en Ajustes
 * y la app muestra solo esas materias.
 * ----------------------------------------------------------------------
 * Sale de los trayectos sugeridos publicados (Química: el del plan nuevo, Ord. 8/2023 C.S.).
 * De Biología no está publicado el trayecto: van el ciclo básico y el orientado en el orden del plan.
 * Quedan afuera Inglés e Informática (acreditables), las electivas y el Seminario.
 *
 * Cada materia: code, title y `course` (id del curso en E.courses) si ya tiene contenido.
 * `step` es el orden sugerido dentro del trayecto (1 = primera).
 * `via`: la materia se repasa con otra materia de la app que la cubre de más (ej.: Elementos de Cálculo con Cálculo I).
 * Un año o un semestre puede llevar `label` en lugar del número.
 * El trayecto de Química publica dos materias con el código Q211, y Aplicada y Tecnológica sin código: se dejan así.
 */
(function () {
  const E = window.Efecen;
  // numera los pasos en el orden en que aparecen
  function career(def) {
    let n = 0;
    for (const y of def.years) for (const sm of y.semesters) for (const sub of sm.subjects) sub.step = ++n;
    E.registerCareer(def);
  }
  const PLAN = "Plan Ord. 77/15 C.S. · FCEN UNCuyo";
  // materias del ciclo básico que comparten las orientaciones
  const M101 = { code: "M101", title: "Cálculo I", course: "m101" };
  const M102 = { code: "M102", title: "Cálculo II", course: "m102" };
  const M104 = { code: "M104", title: "Introducción al Álgebra Lineal", course: "m104" };
  const M105 = { code: "M105", title: "Probabilidad y Estadística", course: "m105" };
  const M106 = { code: "M106", title: "Geometría Analítica", course: "m106" };
  const F101 = { code: "F101", title: "Física General I", course: "f101" };
  const F102A = { code: "F102A", title: "Física General II A", course: "f102a" };
  const F102B = { code: "F102B", title: "Física General II B", course: "f102b" };
  const F104 = { code: "F104", title: "Física General III", course: "f104" };
  const Q101 = { code: "Q101", title: "Química General" };
  const Q102 = { code: "Q102", title: "Química Orgánica" };
  const B101 = { code: "B101", title: "Biología General" };
  const C101 = { code: "C101", title: "Historia de la Ciencia" };
  const C102 = { code: "C102", title: "Ciencias de la Tierra" };
  const C104 = { code: "C104", title: "Epistemología de la Ciencia" };
  const M103 = { code: "M103", title: "Cálculo III" };
  const M203 = { code: "M203", title: "Álgebra Lineal" };
  // cada carrera necesita sus propios objetos (career() les pone el paso)
  const s = o => Object.assign({}, o);

  career({
    id: "fis", title: "Lic. en Ciencias Básicas · orientación Física", short: "Física", plan: PLAN,
    years: [
      { n: 1, semesters: [
        { n: 1, subjects: [s(M101), s(Q101), s(B101)] },
        { n: 2, subjects: [s(M104), s(F101)] }
      ] },
      { n: 2, semesters: [
        { n: 1, subjects: [s(F102B), s(M102), s(M106)] },
        { n: 2, subjects: [s(M105), s(F102A), s(C101), s(C102), { code: "F103", title: "Taller Temático de Física" }] }
      ] },
      { n: 3, semesters: [
        { n: 1, subjects: [s(F104), s(M103), s(M203), { code: "F201", title: "Física Experimental I" }] },
        { n: 2, subjects: [{ code: "F203", title: "Mecánica" }, { code: "M209M", title: "Matemática Especial I" }, { code: "F205", title: "Termodinámica" }] }
      ] },
      { n: 4, semesters: [
        { n: 1, subjects: [{ code: "F204", title: "Electromagnetismo" }, { code: "F207", title: "Física Estadística" }, { code: "F202", title: "Física Experimental II", note: "Anual" }] },
        { n: 2, subjects: [{ code: "F206", title: "Mecánica Cuántica" }] }
      ] },
      { n: 5, semesters: [{ n: 1, subjects: [s(C104)] }] }
    ]
  });

  career({
    id: "mat", title: "Lic. en Ciencias Básicas · orientación Matemática", short: "Matemática", plan: PLAN,
    years: [
      { n: 1, semesters: [
        { n: 1, subjects: [s(M101), s(Q101), s(B101)] },
        { n: 2, subjects: [s(M104), s(F101)] }
      ] },
      { n: 2, semesters: [
        { n: 1, subjects: [s(M102), s(M106), s(F102B)] },
        { n: 2, subjects: [s(M105), s(F102A), s(C101)] }
      ] },
      { n: 3, semesters: [
        { n: 1, subjects: [s(M103), s(M203), s(F104)] },
        { n: 2, subjects: [{ code: "M201", title: "Introducción al Análisis I" }, { code: "M204", title: "Estructuras Algebraicas I" }] }
      ] },
      { n: 4, semesters: [
        { n: 1, subjects: [{ code: "M206", title: "Topología General" }, { code: "M202", title: "Introducción al Análisis II" }] },
        { n: 2, subjects: [{ code: "M207", title: "Medida e Integración" }, { code: "M205", title: "Ecuaciones Diferenciales Ordinarias" }] }
      ] },
      { n: 5, semesters: [{ n: 1, subjects: [{ code: "M208", title: "Geometría Diferencial" }, s(C104)] }] }
    ]
  });

  career({
    id: "qui", title: "Lic. en Ciencias Básicas · orientación Química", short: "Química", plan: PLAN + " (ciclo orientado: Ord. 8/2023 C.S.)",
    years: [
      { n: 1, semesters: [
        { n: 1, subjects: [s(M101), s(Q101), s(B101)] },
        { n: 2, subjects: [s(M104), s(F101), { code: "Q205Q", title: "Química General II" }] }
      ] },
      { n: 2, semesters: [
        { n: 1, subjects: [s(F102B), s(M102), s(Q102)] },
        { n: 2, subjects: [s(M105), s(F102A), { code: "Q201", title: "Química Inorgánica" }, { code: "Q203", title: "Química Biológica" }] }
      ] },
      { n: 3, semesters: [
        { n: 1, subjects: [{ code: "Q206", title: "Química Analítica" }, { code: "Q207", title: "Química Inorgánica Avanzada" }] },
        { n: 2, subjects: [{ code: "Q204", title: "Química Física" }, { code: "Q218", title: "Química Orgánica II" }, { code: "Q211", title: "Química Analítica Instrumental" }] }
      ] },
      { n: 4, semesters: [
        { n: 1, subjects: [{ code: "Q211", title: "Química Física II" }, { code: "Q219", title: "Química Analítica Instrumental II" }, { code: "Q224", title: "Gestión y Control de Calidad" }, { code: "Q223", title: "Quimiometría" }] },
        { n: 2, subjects: [{ code: "Q226", title: "Química Física Molecular" }, { code: "Q220", title: "Química Orgánica Superior" }, { code: "Q222", title: "Análisis de Riesgo, Legislación Laboral y Ambiental" }] }
      ] },
      { n: 5, semesters: [
        { n: 1, subjects: [{ code: "", title: "Química Aplicada" }] },
        { n: 2, subjects: [{ code: "", title: "Química Tecnológica" }] }
      ] }
    ]
  });

  career({
    id: "bio", title: "Lic. en Ciencias Básicas · orientación Biología", short: "Biología", plan: PLAN,
    note: "El trayecto sugerido de Biología no está publicado: las materias van en el orden del plan de estudios.",
    years: [
      { label: "Ciclo básico", semesters: [{ label: "", subjects: [
        { code: "ME101", title: "Elementos de Cálculo", course: "m101", via: "M101 Cálculo I" },
        s(Q101), s(B101), s(M104),
        { code: "FE101", title: "Elementos de Física General I", course: "f101", via: "F101 Física General I" },
        s(Q102), s(M105),
        { code: "FE102A", title: "Elementos de Física General II A", course: "f102a", via: "F102A Física General II A" },
        { code: "FE102B", title: "Elementos de Física General II B", course: "f102b", via: "F102B Física General II B" },
        s(C102), { code: "Q203A", title: "Química Biológica" }, s(C101)
      ] }] },
      { label: "Ciclo orientado", semesters: [{ label: "", subjects: [
        { code: "B102", title: "Biología Celular" },
        { code: "B204", title: "Biología Vegetal" },
        { code: "B205", title: "Biología Animal" },
        { code: "B201", title: "Biología Molecular" },
        { code: "B202", title: "Genética" },
        { code: "B203", title: "Microbiología" },
        { code: "B208", title: "Ecología" },
        { code: "B210A", title: "Diversidad Vegetal" },
        { code: "B213", title: "Diversidad Animal I" },
        { code: "B214", title: "Diversidad Animal II" },
        { code: "B206", title: "Fisiología Vegetal" },
        { code: "B209", title: "Evolución" },
        { code: "B207", title: "Fisiología Animal" },
        { code: "B215", title: "Ecología Ambiental y Regional" },
        { code: "B216", title: "Bioestadística" },
        { code: "B217", title: "Evolución Molecular" },
        s(C104)
      ] }] }
    ]
  });
})();
