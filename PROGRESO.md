# Progreso: efecen como "la carrera" (rama `carrera-fcen`)

Objetivo: reconstruir la **Licenciatura en Ciencias Básicas con orientación en Física** (FCEN, UNCuyo, Plan Ord. 77/15 C.S.) para repasarla materia por materia. Este archivo se actualiza a medida que avanza el trabajo.

## Estado

| Paso | Materia | Estado |
|---|---|---|
| 1 | M101 Cálculo I | en curso |
| 2 | M104 Introducción al Álgebra Lineal | pendiente |
| 3 | F101 Física General I | pendiente |
| 4+ | 2.º año en adelante | pendiente (en la carrera como "Próximamente") |

## Hecho

- **Estructura de "la carrera"** (`content/carrera.js`): años → semestres → materias con código y paso del trayecto sugerido. Nueva pestaña *Carrera*; cada materia abre su mapa de unidades.
- **Una materia = un curso en su archivo** (`content/m101-calculo1.js`, …). El archivo registra la materia con `E.registerCourse` y después agrega unidades con `E.extendCourse` (conceptos, plantillas, lecciones y apuntes).
- **Test por unidad**: cada unidad bloqueada tiene un botón «Test de la unidad» (3 ejercicios, se aprueba con 2). Sigue existiendo el diagnóstico de toda la materia, unidad por unidad.
- **Sesión del día**: mezcla los repasos vencidos de todas las materias con la lección actual de la materia activa.
- **Migración**: el progreso guardado bajo `calculo` pasa automáticamente a `m101`.
- **Tests**: toda plantilla nueva necesita `verify`, una verificación numérica independiente. La suite recalcula la respuesta por otro camino: diferencias finitas, Simpson, RK4, eliminación de Gauss, sumas parciales o residuos de las ecuaciones. También chequea la estructura de la carrera y de cada unidad (≥ 4 plantillas, ≥ 2 tipos, apuntes, test de unidad válido) y que el service worker precachee cada archivo de contenido.

## Decisiones tomadas

- **Unidades del programa partidas en dos.** Las unidades 3 y 4 de Cálculo I son muy largas, así que en la app cada una se divide en dos unidades: Derivadas / Aplicaciones de la derivada, e Integrales / Aplicaciones de la integral. Así el test de cada unidad es más fino. El campo `program` de cada unidad indica a qué unidad del programa oficial corresponde.
- **IDs sin cambios.** Se mantienen los ids de lecciones y conceptos del MVP para no perder progreso. Solo cambia el id de la materia (`calculo` → `m101`).
- **Plantillas del MVP sin `verify`.** 17 plantillas conceptuales del MVP (V/F, ordenar, unir, error) no traían `verify` y quedan en una lista explícita en los tests. Toda plantilla nueva lo tiene obligatorio.
- **Unidades con progreso quedan abiertas.** Una unidad queda abierta si ya completaste alguna lección suya, aunque falte la anterior. Esto evita que el progreso viejo quede bloqueado al agregarse unidades antes.

## Fuentes de los temarios

- **M101 Cálculo I**: programa oficial 2026 (FCEN UNCuyo, prof. Romina Calvo), carpeta «Programas 2026, 2.º semestre» de la página [Programas de las materias](https://fcen.uncuyo.edu.ar/programas-de-las-materias). Tiene 5 unidades: conjuntos numéricos y funciones; límite y continuidad; derivadas y aplicaciones; integrales; sucesiones y series.
- **F101 Física General I**: no aparece en las carpetas 2026. Se usa el [programa 2021](https://fcen.uncuyo.edu.ar/upload/fisica-general-i-2021.pdf): unidad transversal de mediciones e incertezas, más 10 unidades (cinemática, dinámica, trabajo y energía, cantidad de movimiento, fluidos, cinemática y dinámica rotacional, equilibrio, gravitación, movimiento periódico).
- **M104 Introducción al Álgebra Lineal**: no aparece en las carpetas 2026. Se usa el [programa 2020](https://fcen.uncuyo.edu.ar/upload/programa-ial-2020-def.pdf): vectores geométricos; matrices y determinantes; sistemas lineales; espacios vectoriales; transformaciones lineales; autovalores y autovectores.

Todo el texto y todos los ejercicios son originales: de los programas solo se toma la lista de temas.
