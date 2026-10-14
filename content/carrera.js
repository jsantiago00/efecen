/*
 * La carrera: Licenciatura en Ciencias Básicas con orientación en Física
 * FCEN, Universidad Nacional de Cuyo — Plan Ord. 77/15 C.S.
 * ----------------------------------------------------------------------
 * Solo las materias de matemática y física del trayecto sugerido (por ahora quedan afuera
 * Biología, Química, Ciencias de la Tierra, Historia, Epistemología, Inglés, Informática
 * y las Experimentales).
 *
 * Cada materia: code, title y `course` (id del curso en E.courses) si ya tiene contenido.
 * `step` es el orden sugerido dentro del trayecto (1 = primera).
 */
(function () {
  window.Efecen.registerCareer({
    title: "Lic. en Ciencias Básicas · orientación Física",
    short: "Ciencias Básicas · Física",
    plan: "Plan Ord. 77/15 C.S. · FCEN UNCuyo",
    years: [
      { n: 1, semesters: [
        { n: 1, subjects: [{ code: "M101", title: "Cálculo I", course: "m101", step: 1, note: "Anual en el plan (1.º y 2.º semestre)" }] },
        { n: 2, subjects: [
          { code: "M104", title: "Introducción al Álgebra Lineal", course: "m104", step: 2 },
          { code: "F101", title: "Física General I", course: "f101", step: 3 }
        ] }
      ] },
      { n: 2, semesters: [
        { n: 1, subjects: [
          { code: "F102B", title: "Física General II B", course: "f102b", step: 4 },
          { code: "M102", title: "Cálculo II", course: "m102", step: 5 },
          { code: "M106", title: "Geometría Analítica", step: 6 }
        ] },
        { n: 2, subjects: [
          { code: "M105", title: "Probabilidad y Estadística", step: 7 },
          { code: "F102A", title: "Física General II A", step: 8 }
        ] }
      ] },
      { n: 3, semesters: [
        { n: 1, subjects: [
          { code: "F104", title: "Física General III", step: 9 },
          { code: "M103", title: "Cálculo III", step: 10 },
          { code: "M203", title: "Álgebra Lineal", step: 11 }
        ] },
        { n: 2, subjects: [
          { code: "F203", title: "Mecánica", step: 12 },
          { code: "M209", title: "Matemática Especial I", step: 13 },
          { code: "F205", title: "Termodinámica", step: 14 }
        ] }
      ] },
      { n: 4, semesters: [
        { n: 1, subjects: [
          { code: "F204", title: "Electromagnetismo", step: 15 },
          { code: "F207", title: "Física Estadística", step: 16 }
        ] },
        { n: 2, subjects: [{ code: "F206", title: "Mecánica Cuántica", step: 17 }] }
      ] }
    ]
  });
})();
