# Progreso: efecen como "la carrera"

Objetivo: reconstruir la **Licenciatura en Ciencias Básicas con orientación en Física** (FCEN, UNCuyo, Plan Ord. 77/15 C.S.) para repasarla materia por materia.

Trabajo en la rama `carrera-fcen`. Por pedido durante la noche, cada bloque terminado (con los tests en verde) se pushea también a `main`, para poder probarlo en el celu.

## Estado

| Paso | Materia | Estado | Plantillas | Fichas |
|---|---|---|---|---|
| 1 | M101 Cálculo I | **completa**: las 5 unidades del programa (7 unidades en la app) | 105 | 64 |
| 2 | M104 Introducción al Álgebra Lineal | **completa**: las 6 unidades del programa | 29 | 18 |
| 3 | F101 Física General I | **completa**: unidad transversal y 10 unidades | 62 | 34 |
| 4 | F102B Física General II B | **completa**: las 8 unidades del programa (termodinámica, ondas, óptica geométrica, interferencia y difracción) | 35 | 16 |
| 5 | M102 Cálculo II | **completa**: las 8 unidades del programa | 48 | 25 |
| 6+ | M106, M105, F102A, … | pendiente: aparecen en la carrera como "Próximamente" | — | — |

Cada unidad tiene teoría con hipervínculos (definición, idea, demostración, ejemplos, errores comunes), al menos 4 plantillas de al menos 2 tipos, y test de unidad.

## Hecho

- **La carrera** (`content/carrera.js`): años → semestres → materias, con código y paso del trayecto sugerido. Hay una pestaña *Carrera*, y cada materia abre su mapa de unidades, numeradas según el programa oficial.
- **Una materia = un curso en su archivo:** `content/m101-calculo1.js`, `content/m104-algebra-lineal.js`, `content/f101-fisica1.js`, `content/f102b-fisica2b.js`, `content/m102-calculo2.js`. Cada archivo registra la materia con `E.registerCourse` y agrega cada unidad con `E.extendCourse` (conceptos, plantillas, lecciones y apuntes).
- **Test por unidad:** cada unidad bloqueada tiene «Test de la unidad» (3 ejercicios, se aprueba con 2). Se mantiene el diagnóstico de la materia completa, que va unidad por unidad.
- **Sesión del día:** mezcla los repasos vencidos de todas las materias con la lección actual de la materia activa.
- **Apuntes y estadísticas por materia:** la pestaña *Aprender* y la de *Stats* tienen un selector de materia. Los links entre materias funcionan; por ejemplo, desde Física se llega a la ficha de derivada de Cálculo.
- **Migración:** el progreso guardado bajo `calculo` pasa automáticamente a `m101`.

### Tests (`node tests/run-tests.mjs [instancias] [materia]`)

- **Verificación independiente obligatoria:** toda plantilla nueva tiene `verify`, y la suite recalcula la respuesta por otro camino. Usa diferencias finitas, Simpson (también en intervalos infinitos) y RK4 para simular las ecuaciones de movimiento (incluidos eventos como "llega al piso" u "órbita completa"). También eliminación de Gauss (determinante, rango, sistemas, inversa, Rouché-Frobenius, nulidad), sumas parciales, estimaciones numéricas de cociente y exponente en series, y residuos de las condiciones de equilibrio y de las leyes de conservación.
- **Chequeos estructurales:** posición en la carrera, unidades (≥ 4 plantillas, ≥ 2 tipos, apuntes, test de unidad válido), links de los apuntes, alias únicos y precache del service worker.
- **Plantillas lentas:** las de simulación cara declaran `testN` para limitar instancias, y la suite avisa cuáles tardan más de 8 s.
- **Resultado:** la última corrida completa (M101, M104, F101 y F102B) dio 833.636 chequeos sin fallas; M102 pasa sus tests por separado (173.292 chequeos con 300 instancias). La prueba de humo en el navegador (todas las plantillas y 270 vistas de apuntes) salió limpia.
- **Cálculo II:** las cónicas y cuádricas se clasifican evaluando la ecuación lejos del origen y en planos de corte (sin mirar los signos de la fórmula); los coeficientes de Taylor se recalculan con la fórmula integral de Cauchy en el plano complejo; las longitudes de curvas, con poligonales; las áreas polares, con la fórmula del zapatero.
- **Corridas rápidas:** con menos de 10 instancias por plantilla se saltea el chequeo de variedad (antes daba fallas falsas).
- **Óptica y ondas:** las lentes se verifican trazando rayos con matrices ABCD; las ondas estacionarias, simulando la cuerda con diferencias finitas; la doble rendija, con la diferencia de caminos exacta (sin aproximar ángulos chicos).

## Pizarra (tablets con lápiz)

- **`board.js`** (archivo aparte, se carga antes del script de la app): una hoja para hacer cuentas con el lápiz, estilo Samsung Notes.
  - **Herramientas:** lápiz con presión, resaltador y borrador por trazo, con 6 colores (se adaptan al tema oscuro) y 3 grosores.
  - **Edición:** deshacer y rehacer, y borrar la hoja (también se puede deshacer).
  - **Hoja:** cuadriculada, rayada o lisa, de alto infinito, con zoom (pellizco con dos dedos o Ctrl + rueda).
  - **Lápiz y dedo:** el lápiz dibuja y el dedo mueve la hoja. Mientras se usa el lápiz se ignoran los toques, así la palma no raya. Botón del S Pen: si lo apretás y soltás sin tocar la pantalla, alterna entre el borrador y la herramienta anterior. Si lo mantenés apretado mientras escribís, borra solo durante ese trazo; si lo apretás en medio de un trazo, lo escrito queda y sigue borrando. Chrome lo informa como botón 2 (barril), o como un «clic derecho» si no manda el estado al pasar el lápiz por encima. Si nunca se usó un lápiz, el dedo dibuja. Hay un interruptor para eso.
  - **Hojas:** cada ejercicio de una sesión tiene la suya, y se puede volver a las anteriores con ‹ ›. Fuera de una sesión se abre la última. Se guardan hasta 80 hojas.
  - **Disposición:** con la tablet acostada (≥ 900 px de ancho), la pizarra ocupa la mitad derecha y el ejercicio queda a la izquierda. Parada, por defecto ocupa la mitad de abajo y deja el ejercicio o la ficha arriba. Con el botón de expandir pasa a pantalla completa, con el enunciado arriba, plegable. El «atrás» del sistema la cierra.
- **Dónde aparece:** un botón con un lápiz en la barra de inicio, en la de cada ejercicio, en *Aprender* y en cada ficha de los apuntes (cada ficha tiene su hoja). Solo se muestra en tablets (puntero táctil y pantalla de al menos 600 px de lado) o si ya se usó un lápiz en ese dispositivo. En Ajustes se puede elegir Auto, Siempre o Nunca.
- **Tests:** la suite prueba la parte sin DOM: alcance del borrador, deshacer y rehacer, y guardado compacto. El dibujo con lápiz, el borrado, el arrastre con el dedo, el zoom y la persistencia se probaron en Chromium emulando una tablet de 1280 × 800 y de 800 × 1280.

## Demostraciones en los apuntes

- El usuario pidió que las fórmulas tengan su deducción (por ejemplo, faltaba cos(a+b)). La ficha `identidades-trig` (M101) ahora tiene la suma y la resta de seno, coseno y tangente, el ángulo doble, sen² y cos² en función de cos 2x, y la demostración de cada una a partir de cos(a−b) (distancia entre dos puntos de la circunferencia unidad).
- **M101:** se agregó la demostración en 22 fichas: identidades trigonométricas, radianes, teorema del factor, conjugado, límites laterales, sustitución directa, límites infinitos, recta tangente, derivación implícita, crecimiento y signo de f′, función inversa, transformaciones, funciones trigonométricas, propiedades del logaritmo, modelos exponenciales, criterio de la segunda derivada, propiedades de la integral, sustitución trigonométrica, fracciones simples, ecuaciones separables, área entre curvas, y volúmenes y longitud de arco. Las que quedan sin demostración son definiciones o recetas: función, indeterminaciones, técnicas de límites trigonométricos, asíntotas, continuidad, tipos de discontinuidad, derivadas sucesivas, composición y optimización.
- **M104:** se agregó la demostración en las 14 fichas que no la tenían; ahora todas las de la materia tienen una.
- **F101:** se agregó la demostración en 18 fichas. Quedan sin ella magnitudes y unidades, cifras significativas y leyes de Newton, que son definiciones o postulados.
- **F102B:** se agregó la demostración en las 13 fichas que no la tenían; ahora todas las de la materia tienen una.
- **M102:** se agregó la demostración en las 22 fichas que no la tenían; ahora todas las de la materia tienen una.
- **Resultado:** quedan 12 fichas sin demostración en toda la carrera, y son definiciones, recetas o postulados (9 de M101 y 3 de F101). **Para las materias nuevas:** toda ficha que enuncie una fórmula o un teorema lleva su demostración.

## Evaluaciones: parciales y finales simulados

- **Material de la cátedra:** el usuario subió a su Google Drive la carpeta «Apunteca» (Matemáticas y Física, con parciales, finales y resoluciones). Se lee con el conector de Drive y **no va al repo**, que es público. Por cada materia se lee una muestra (los años recientes, con resoluciones) y se deja el análisis en `docs/parciales/<materia>.md`. Los enunciados de la app son propios y tienen los números sorteados.
- **Motor** (`index.html`, engine): `E.registerExams(cid, { self, exams })`, `E.buildExam`, `E.instantiateSelf` y `E.rubricPoints`. Un examen tiene ítems con partes:
  - `tpl`: una plantilla fija, que se corrige sola;
  - `pick`: una plantilla al azar entre varias;
  - `self`: un ejercicio de desarrollo generado, con `prompt`, `rubric` (criterios con peso) y `solution`.
- **Interfaz:** en la pantalla de cada materia hay una tarjeta «Evaluaciones».
  - Al empezar, una portada con el tiempo, la cantidad de ejercicios y la nota para aprobar.
  - Durante el examen: reloj (al terminar el tiempo se entrega solo), navegación libre entre ejercicios, sin correcciones ni apuntes, y con la pizarra disponible.
  - Al entregar: corrección automática y autocorrección con rúbrica de los ejercicios de desarrollo.
  - Al final: la nota, aprobado o no, la XP y los conceptos para reforzar. Cada parte cuenta para el repaso espaciado.
- **Estado:** `S.exams["m101/p1"] = { best, attempts: [{ d, t, score }] }`. `E.store.merge` hace la unión de los intentos y se queda con la mejor nota (tiene tests).
- **Tests:** cada examen suma 100 y sus plantillas existen. Los ejercicios de desarrollo se generan con 40 semillas: la rúbrica tiene que repartir exacto los puntos, el LaTeX tiene que ser válido y no puede haber «undefined».
- **M101:** 1.er, 2.º y 3.er parcial, y el final práctico, armados según `docs/parciales/m101.md`.
- **M104 y F101:** las dos tienen sus evaluaciones (`content/m104-examenes.js` y `content/f101-examenes.js`), y su análisis está en `docs/parciales/m104.md` y `docs/parciales/f101.md`.
  - **M104:** 1.er y 2.º parcial, y la parte escrita del final regular.
  - **F101:** dos parciales promocionales y el final libre.
- **Variedad entre intentos:** las partes y los ítems pueden tener `any`, que sortea entre ejercicios de distintos años, y cada materia puede tener **plantillas propias del examen** (`templates` en `E.registerExams`), con corrección automática y `verify`, que no pertenecen a ninguna lección. La suite las prueba como a las demás: tipo, LaTeX, `verify` obligatorio y variedad. Exige además que todas las alternativas de un ítem valgan lo mismo. El 15/10 se leyó una segunda muestra de M101, F101 y M104 (ver «Segunda muestra» en cada `docs/parciales/*.md`).
- **Verificación en desarrollo:** los ejercicios de desarrollo con cuentas llevan `verify`, como las plantillas, y la suite lo corre. Se recalcula por otro camino: simulación del movimiento, integración numérica de fuerzas, Gauss, A·A⁻¹ = I y residuos de A·x = b.
- **Pendiente:**
  - las evaluaciones de F102B y M102;
  - las plantillas de nivel parcial que faltan (ver el final de cada `docs/parciales/*.md`).

## Juegos

- **Jefe de unidad.** Al completar una unidad aparece un nodo rojo al final de su camino, con un jefe: una paradoja famosa (Zenón, el demonio de Maxwell, el hotel de Hilbert, el monstruo de Weierstrass…). El jefe tiene 8 de vida y vos 3 vidas. Cada acierto le saca 1, y desde el tercero seguido, 2. Las preguntas salen de todas las plantillas de la unidad, de menor a mayor dificultad, y no hay reintentos. Si lo vencés, el nodo queda con una corona y suma 30 XP (15 las veces siguientes).
- **Contrarreloj.** Dura 60 s y trae preguntas rápidas (opción múltiple, V/F y encontrar el error) de las lecciones abiertas de la materia. Si hay pocas, suma numéricas fáciles. Cada acierto vale 10 puntos, multiplicados por 1 + ⌊racha/3⌋ (hasta ×4). Se guarda el récord por materia. Se entra desde Inicio o desde la tarjeta «Juegos» del mapa.
- Los dos juegos califican los conceptos en el repaso espaciado, igual que una sesión común.
- **Estado:** `S.courses[cid].bosses[unitId] = { won, wins }` y `S.courses[cid].rush` (récord). Al combinar dispositivos, `E.store.merge` deja el jefe vencido si lo está en alguno, `wins` con el máximo y el récord con el máximo. Tiene tests.
- **Ejercicio del día.** Aparece en Inicio y sale de las lecciones que ya completaste, de todas las materias. Elige entre las plantillas de dificultad 3 si hay al menos 3; si no, entre las de dificultad 2 y 3. Nunca es un V/F. Es el mismo todo el día, en todos los dispositivos, porque la semilla es la fecha (`E.dailySeed` y `E.dailyPick`, con tests). Tenés un solo intento: si lo resolvés bien suma 30 XP, y si no, muestra la resolución. Igual califica el repaso espaciado. Se cuentan los días seguidos resueltos. El estado va en `S.daily[fecha] = { cid, tpl, ok }`, con los últimos 120 días. Al combinar dispositivos, un día queda resuelto si lo está en alguno.
- **Idea para más adelante:** un memotest de fórmulas (unir cada fórmula con su nombre).

## Cuenta y sincronización (Firebase)

- Proyecto Firebase `efecen-46bfd`, con login de Google. La app web se llama `efecen-web` y Firestore está en `southamerica-east1`.
- `sync.js` (módulo aparte) maneja el login y guarda el progreso en `users/{uid}`, como texto JSON en el campo `data`. Si no carga, por ejemplo sin conexión, la app sigue funcionando en modo local.
- Al entrar y al volver a la app se baja el progreso remoto y se combina con el local con `E.store.merge`. Lo acumulable queda con el máximo o la unión; los ajustes, la racha y la materia activa se toman del dispositivo usado más recientemente. Los tests verifican que combinar sea idempotente y que no pierda nada.
- **Invitación a entrar.** Si al abrir la app no hay sesión iniciada, en Inicio aparece un cartel de Schrödi con «Entrar con Google» y «Ahora no». Sale recién cuando Firebase confirma que no hay nadie logueado (`E.sync.ready`) y desaparece al entrar. «Ahora no» lo pospone 7 días en ese dispositivo (localStorage `efecen-login-ask`). Sin conexión, sync.js no carga y el cartel no aparece.
- **Liga de la semana.** Es un ranking entre quienes entraron con Google. Cada uno publica en `leagues/{lunes}/players/{uid}` = `{ name, photo, xp, updatedAt }`. El `xp` es el de la semana, de lunes a domingo, sumado de `xpByDay` del progreso ya combinado entre dispositivos (`E.weekXp`). El nombre es el primer nombre más la inicial del apellido (`E.leagueName`). Se publica después de cada subida, solo si cambió. Para leer se traen los 30 primeros y, si no estás entre ellos, tu puesto con un conteo. En Ajustes → Cuenta se puede dejar de aparecer: `settings.league` se sincroniza y, si está apagado, se borra tu fila. Se ve en Inicio y en Stats, y la pantalla está en `#/liga`. Las reglas solo dejan escribir la fila propia, con xp entero entre 0 y 30000. **Hay que publicar las reglas nuevas**; mientras tanto la liga dice «todavía no está activada» y el resto anda igual.
- **Meta diaria fija:** `E.DAILY_GOAL = 50` XP para todos, para que la liga sea pareja. Se sacó el selector de Ajustes.
- Las reglas están en `firestore.rules` y cada usuario solo accede a su documento. Para desplegarlas: `firebase deploy --only firestore:rules`.
- Dominios autorizados en Auth: localhost, 127.0.0.1, santiagososa.com.ar, www.santiagososa.com.ar y los de Firebase.

## Decisiones tomadas

- **Temarios.**
  - Cálculo I usa el programa 2026.
  - Física General II B usa el programa 2026.
  - Física General I y Álgebra Lineal no figuran en las carpetas 2026 de la facultad, así que usé las versiones publicadas más recientes (2021 y 2020).
  - Física General I sigue el orden del programa: después de energía y cantidad de movimiento vienen fluidos, y la rotación queda para las unidades 6 a 8.
- **Unidades largas partidas.** Las unidades 3 y 4 de Cálculo I se dividen en dos unidades de la app cada una, para que el test de unidad sea más fino. El campo `program` indica la unidad del programa oficial.
- **IDs sin cambios.** Se mantienen los ids de lecciones y conceptos del MVP; solo cambia el id de la materia (`calculo` → `m101`). Los nuevos llevan prefijo por materia (`f1-`, `al-`).
- **Unidades con progreso quedan abiertas**, aunque falte la anterior. Así el progreso viejo no quedó bloqueado cuando se agregó la Unidad 1 de Cálculo antes de Límites.
- **Plantillas del MVP sin `verify`.** Las 17 plantillas conceptuales del MVP (V/F, ordenar, unir, error) no traían `verify` y quedan en una lista explícita de los tests. Toda plantilla nueva lo tiene obligatorio.
- **Convención g = 9,8 m/s²**, aclarada en cada enunciado de física.
- **Alias compartidos.** «producto vectorial» pasó de Física a Álgebra Lineal, y en Física «valor medio» se cambió por «promedio», porque choca con el teorema del valor medio. En Física II B no se usa «segunda ley» (es de Newton en F101); el alias es «segunda ley de la termodinámica».
- **Push a `main` después de cada bloque**, como se pidió durante la noche.
- **Pizarra local.** Los trazos se guardan en IndexedDB y no se sincronizan con la nube: pesan mucho más que el progreso y son borradores. Sus ajustes (mostrarla y dibujar con el dedo) también son de cada dispositivo, porque cada uno tiene lápiz o no.
- **Pizarra sin `desynchronized`.** El canvas del trazo en curso usaba `getContext("2d", { desynchronized: true })` para bajar la latencia. En la tablet del usuario (Android, S Pen) el trazo y la hoja desaparecían al escribir y había que recargar. Se sacó esa opción, y la hoja se redibuja si el navegador descarta el canvas o si la app vuelve del segundo plano.
- **`id` propio en el manifest.** El celu y la tablet decían que la app ya estaba instalada aunque no se veía. Sin `id`, Chrome identifica la PWA por su `start_url`, y un WebAPK viejo con esa identidad bloquea la instalación. Pasa, por ejemplo, si solo se sacó el ícono de la pantalla de inicio, porque eso no la desinstala. Primero se agregó `"id": "efecen-app"`, y después se cambió a `"id": "/efecen/"`, explícito y dentro de su carpeta. Ojo: Chrome resuelve el `id` contra el origen, no contra `start_url`. Por eso la app «A Juegar», con `"id": "./"`, quedó registrada en la tablet con id `https://santiagososa.com.ar/`, que es la raíz de todo el dominio, y es la sospechosa de que efecen figure como «ya instalada». Además se agregó una sección «Instalar la app» en Ajustes. Ahí aparece un botón cuando el navegador ofrece la instalación (`beforeinstallprompt`) y, si no, las instrucciones, incluido cómo desinstalar la versión fantasma. No cambiar ese `id`: cambiarlo crea otra app distinta.
- **Orientación libre.** En `manifest.json`, `orientation` pasó de `portrait` a `any`, para poder usar la tablet acostada con la pizarra al costado. En la app instalada, Chrome toma el cambio cuando actualiza el ícono instalado, y eso puede tardar.

## Pendiente (en el orden del trayecto)

**En pausa (pedido del usuario, 14/10/2026):** no se crean materias nuevas hasta el domingo; antes vienen otras funciones: el login con Firebase y la pizarra ya están hechos.

1. **M106 Geometría Analítica** (programa 2026, id `1zJG9qufZgWfBU6f1gS-BFlFjg1Yy7PVN`).
2. **M105 Probabilidad y Estadística:** no encontré el programa; habría que usar un temario estándar.
3. **F102A Física General II A** (programa 2026, Ruben Santos, 2.º semestre, id `1BxA2eBt5T1-dD9DsLp7OTR9daGUVkvwi`).
4. **3.º y 4.º año.**

Ideas sueltas: sumar plantillas de tipo «unir» y «encontrá el error» en Física, y gráficos de x(t) y v(t) en cinemática.

## Fuentes de los temarios

- **M101 Cálculo I:** programa oficial 2026 (prof. Romina Calvo), en la carpeta «Programas 2026, 2.º semestre» de [Programas de las materias](https://fcen.uncuyo.edu.ar/programas-de-las-materias).
- **M104 Introducción al Álgebra Lineal:** [programa 2020](https://fcen.uncuyo.edu.ar/upload/programa-ial-2020-def.pdf).
- **F101 Física General I:** [programa 2021](https://fcen.uncuyo.edu.ar/upload/fisica-general-i-2021.pdf).
- **M102 Cálculo II:** programa oficial 2026 (prof. Fernanda Massut), en la carpeta de programas 2026 de [Programas de las materias](https://fcen.uncuyo.edu.ar/programas-de-las-materias) (Drive, id `1fk1ekCbqvSeZW7QsuRLCluEq4qAS84jW`).
- **F102B Física General II B:** programa oficial 2026, en la carpeta de programas 2026 de [Programas de las materias](https://fcen.uncuyo.edu.ar/programas-de-las-materias) (Drive, id `16hZ72EbvPHfhWjXEY54p2Vi6ThuxTNvt`).
- **Plan de estudios y trayecto sugerido:** el que indicó el usuario, consistente con la [distribución curricular](https://fcen.uncuyo.edu.ar/distribucion-curricular) de la facultad.

De los programas solo se tomó la lista de temas. Todo el texto y todos los ejercicios son originales.
