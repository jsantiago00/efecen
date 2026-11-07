/* Calendario académico de la FCEN (UNCuyo): turnos de examen, feriados y recesos.
   Fuente: Calendario Académico 2026 (Res. 456/2025-CD, Anexo Único) y el calendario gráfico 2026-2027.
   Lo usa el plan de estudio: al cargar un final se elige el turno, y la semana marca feriados y mesas.

   `mesas`: la mesa de cada materia en cada llamado, cuando la facultad la publica y alguien la pasa:
     mesas: { f101: { "2026-12-1": { date: "2026-12-01", time: "9:00", insc: ["2026-11-23", "2026-11-25"], note } } }
   (`insc`: del primero al último día para inscribirse en SIU Guaraní). Así queda para todos los que usan
   efecen. Si una materia no tiene fecha en un llamado, se propone el primer día del llamado y cada uno
   la ajusta. */
(function () {
  window.Efecen.registerCalendar({
    source: "Calendario Académico 2026 de la FCEN (Res. 456/2025-CD)",
    turnos: [
      { id: "2026-02-1", label: "Febrero 2026 · 1.er llamado", from: "2026-02-09", to: "2026-02-13" },
      { id: "2026-02-2", label: "Febrero 2026 · 2.º llamado", from: "2026-02-23", to: "2026-02-27" },
      { id: "2026-05-x", label: "Mesas extendidas de mayo", days: ["2026-05-04", "2026-05-12", "2026-05-20", "2026-05-28", "2026-06-05"] },
      { id: "2026-07-1", label: "Julio 2026 · 1.er llamado", from: "2026-06-29", to: "2026-07-03" },
      { id: "2026-07-2", label: "Julio 2026 · 2.º llamado", from: "2026-07-27", to: "2026-07-31" },
      { id: "2026-09-x", label: "Mesas extendidas de septiembre", days: ["2026-09-01", "2026-09-09", "2026-09-18", "2026-09-24", "2026-09-28"] },
      { id: "2026-12-1", label: "Diciembre 2026 · 1.er llamado", from: "2026-11-30", to: "2026-12-04" },
      { id: "2026-12-2", label: "Diciembre 2026 · 2.º llamado", from: "2026-12-14", to: "2026-12-18" },
      { id: "2027-02-1", label: "Febrero 2027 · 1.er llamado", from: "2027-02-15", to: "2027-02-19" },
      { id: "2027-03-2", label: "Marzo 2027 · 2.º llamado", from: "2027-03-01", to: "2027-03-05" }
    ],
    // Primer llamado de noviembre-diciembre 2026, según «Fechas EXÁMENES noviembre/diciembre 2026» de la FCEN.
    // La inscripción abre el lunes 23/11 a las 10 h y cierra tres días hábiles antes de cada mesa.
    mesas: {
      m101: { "2026-12-1": { date: "2026-11-30", time: "8:30", insc: ["2026-11-23", "2026-11-25"] } },
      f102a: { "2026-12-1": { date: "2026-11-30", time: "9:00", insc: ["2026-11-23", "2026-11-25"] } },
      f102b: { "2026-12-1": { date: "2026-11-30", time: "9:00", insc: ["2026-11-23", "2026-11-25"] } },
      f101: { "2026-12-1": { date: "2026-12-01", time: "9:00", insc: ["2026-11-23", "2026-11-25"],
        note: "Los libres rinden también el lunes 30/11 a las 14 h en el Laboratorio de Física; el martes, la teoría y la práctica." } },
      f104: { "2026-12-1": { date: "2026-12-02", time: "9:00", insc: ["2026-11-23", "2026-11-26"] } },
      m105: { "2026-12-1": { date: "2026-12-02", time: "9:00", insc: ["2026-11-23", "2026-11-26"] } },
      m102: { "2026-12-1": { date: "2026-12-03", time: "9:00", insc: ["2026-11-23", "2026-11-27"] } },
      m104: { "2026-12-1": { date: "2026-12-03", time: "15:00", insc: ["2026-11-23", "2026-11-27"] } },
      m106: { "2026-12-1": { date: "2026-12-04", time: "9:00", insc: ["2026-11-23", "2026-11-30"] } },
      q101: { "2026-12-1": { date: "2026-12-04", time: "9:00", insc: ["2026-11-23", "2026-11-30"] } }
    },
    // feriados nacionales que caen desde noviembre de 2026 (los anteriores ya pasaron)
    feriados: [
      { date: "2026-11-23", name: "Día de la Soberanía Nacional" },
      { date: "2026-12-08", name: "Inmaculada Concepción" },
      { date: "2026-12-25", name: "Navidad" },
      { date: "2027-01-01", name: "Año Nuevo" },
      { date: "2027-02-08", name: "Carnaval" },
      { date: "2027-02-09", name: "Carnaval" },
      { date: "2027-03-24", name: "Día de la Memoria" }
    ],
    receso: [
      { from: "2026-07-06", to: "2026-07-17", name: "Receso invernal" },
      { from: "2026-12-21", to: "2027-01-29", name: "Receso estival" }
    ]
  });
})();
