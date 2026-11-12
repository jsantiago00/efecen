# efecen: guía para continuar el trabajo

**efecen** es una PWA estilo Duolingo para repasar la **Licenciatura en Ciencias Básicas con orientación en Física** (FCEN, UNCuyo, Plan Ord. 77/15 C.S.). Está hecha en HTML, CSS y JS vanilla, sin build; usa KaTeX y canvas, guarda en localStorage y sincroniza opcionalmente con Firebase. Todo el texto visible está en español rioplatense (voseo). La mascota es **Schrödi**, un gato de Schrödinger: en el texto se escribe con ö, y en ids y archivos va como `schrodi`.

- **Publicada:** https://efecen.com.ar/ (GitHub Pages del repo `jsantiago00/efecen`, rama `main`; dominio propio desde el 26/10, con DNS en Cloudflare y el archivo `CNAME`. Antes estaba en santiagososa.com.ar/efecen/).
- **Estado detallado:** [PROGRESO.md](PROGRESO.md) tiene lo hecho, lo pendiente, las decisiones y las fuentes. **Leelo primero y mantenelo actualizado.**

## Cómo trabajar (acordado con el usuario)

- **Autonomía total.** No pidas permiso para cada paso: el usuario ya dio el OK.
- **Un bloque por vez.** Al terminar una materia o unidad, con los tests en verde, hacé commit y pusheá **a `main` y a `carrera-fcen`**:
  ```sh
  git push origin HEAD:main && git push origin carrera-fcen
  ```
  El usuario prueba desde el celu sobre `main`.
- **Nunca commitees con tests fallando.** Corré `node tests/run-tests.mjs` y que termine en `… chequeos, 0 fallas`. Ojo con `cmd | tail` dentro de un `&&`: oculta el código de salida. Para condicionar el commit al resultado, usá algo como `... | tail -1 | grep -q " 0 fallas"`.
- **Commits.** Autor `juansantiagososa00 <juansantiagososa00@gmail.com>`. El mensaje termina con la línea `Co-Authored-By: Claude <noreply@anthropic.com>`.
- **Service worker.** En cada push que cambie archivos de la app, subí `CACHE` en `service-worker.js` (`efecen-vN` → `efecen-vN+1`); si no, los celulares siguen viendo la versión vieja. Cada archivo nuevo de contenido va también en el array `CONTENT`, y lo verifica un test.
- **PROGRESO.md.** Actualizá la tabla de estado, los pendientes, las decisiones y las fuentes en el mismo commit.

## Orden de trabajo

La pausa de materias nuevas terminó el 18/10/2026. Seguí el orden de pendientes de PROGRESO.md:

1. **Ciclo básico de Química y Biología** (pedido del usuario, 26/10): para que la app sirva también a quien cursa esas orientaciones. Q101 Química General está completa (27/10); las que siguen, si el usuario las pide, están en PROGRESO.md.
2. **3.º año** de Física: F104 Física General III (completa, 26/10) y M103 Cálculo III (completa, 12/11); después M203, M209, F203 y F205.

Las ocho materias de 1.º y 2.º año están completas, con sus evaluaciones, sus unidades «Extra UBA» y un «Examen Extra UBA».

## Estructura

| Archivo | Qué es |
|---|---|
| `index.html` | La UI (`<script id="app-script">`) y el CSS. |
| `engine.js` | El motor: RNG, helpers `H`, parser de números y expresiones, repaso espaciado, registro de materias, exámenes y estado (`E.store`). Lo cargan `index.html` y los tests. |
| `content/carrera.js` | Las carreras, una por orientación (`fis`, `mat`, `qui`, `bio`): años → semestres → materias, con `code`, `title`, `course` (si ya tiene contenido) y `via` (si se repasa con otra materia). Los pasos se numeran solos. Cada cuenta elige la suya (`S.career`). |
| `content/<código>-<nombre>.js` | **Un archivo por materia**: `m101-calculo1.js`, `m104-algebra-lineal.js`, `f101-fisica1.js`, `f102b-fisica2b.js`, `m102-calculo2.js`, `m106-geometria-analitica.js`, `m105-probabilidad.js`, `f102a-fisica2a.js`, `f104-fisica3.js`, `m103-calculo3.js`, `q101-quimica-general.js`. Se cargan con `<script src>` en `index.html`, en el orden de la carrera. |
| Plan de estudio | `E.plan` en `engine.js` (el reparto, puro y testeado) y `renderPlan`/`planAct` en `index.html`. Se guarda en `S.plan` (ver PROGRESO.md). |
| `content/calendario.js` | Calendario académico de la FCEN: turnos de examen, feriados, recesos y las mesas de cada materia (`mesas[cid][turno] = { date, time, insc, note }`). **Cuando el usuario pase un cronograma de mesas, cargalo acá**: queda para todos. Los PDF van en `calendario academico/`, que no se versiona. |
| `sync.js` | Módulo ES: login con Google y sincronización con Firestore (ver más abajo). |
| `board.js` | Pizarra para escribir con lápiz en tablets: el motor de la pizarra del usuario (`jsantiago00/pizarra`) en JS sin build, con lazo, goma por área, texto, fórmulas (MathJax, bajo demanda) y figuras (ver PROGRESO.md). Expone `E.board`; los trazos van a IndexedDB. Usa `assets/vendor/perfect-freehand/`, `asciimath2tex/` y `mathjax/`. |
| `content/<código>-practica.js` | Ejercicios de escribir la expresión (`expr`) y paso a paso (`multi`) que se suman a lecciones existentes con `E.addPractice`. |
| `content/<código>-examenes.js` | Parciales y finales simulados de la materia (`E.registerExams`). El análisis de los originales está en `docs/parciales/`. |
| `service-worker.js` | Precache offline (stale-while-revalidate). `CACHE` y `CONTENT`. |
| `tests/run-tests.mjs` | Suite: carga el motor y el contenido en un `vm` de Node y verifica todo. |
| `PROGRESO.md` | Bitácora del proyecto. |
| `firestore.rules`, `firebase.json`, `.firebaserc` | Reglas de Firestore (proyecto `efecen-46bfd`). |
| `push/` | Servicio de avisos **efecen-push**: Worker de Cloudflare (`worker.js`), tablas de D1 (`schema.sql`), `wrangler.toml` y tests (`test.mjs`). Ver más abajo. |

Materias completas: M101 Cálculo I, M104 Introducción al Álgebra Lineal, F101 Física General I, F102B Física General II B, M102 Cálculo II, M106 Geometría Analítica, M105 Probabilidad y Estadística, F102A Física General II A, F104 Física General III, M103 Cálculo III y Q101 Química General.

## Cómo se arma una materia

```js
(function () { window.Efecen.registerCourse({ id: "m106", code: "M106", title: "Geometría Analítica", icon: "grid-3x3" }); })();

/* ===== UNIDAD 1 · … ===== */
(function () {
  const E = window.Efecen, H = E.H, R = String.raw;
  const T = {};               // plantillas de esta unidad
  T["ga-algo-num"] = { type: "numeric", concepts: ["ga-algo"], difficulty: 2, generate(r) { … return { prompt, answer, solution: [...], verify: {...} }; } };
  const cards = { "ga-algo": { title, aliases: [...], concepts: [...], summary, def: [...], idea: [...], demo: [...], examples: [{ q, steps: [...] }], tips: [...], see: [...] } };
  E.extendCourse("m106", {
    concepts: { "ga-algo": { name: "…" } },
    templates: T,
    units: [{ id: "ga-xxx-u", order: 1, program: "Unidad 1", title: "…", icon: "target",
      diagnostic: ["tpl1", "tpl2", "tpl3"],          // 3 plantillas de la unidad (test de unidad)
      lessons: [{ id: "ga-l1", title: "…", templates: [...], theory: ["ga-algo"], intro: R`…` }] }],
    cards
  });
})();
```

- **Prefijos de ids por materia:** `c2-` (M102), `al-` (M104), `f1-` (F101), `f2b-` (F102B), `ga-` (M106), `pe-` (M105; su primer bloque define la biblioteca estadística `E.pye`), `f2a-` (F102A; su primer bloque define `E.f2a`, con constantes, Simpson, RK4 y el campo de cargas puntuales), `f3-` (F104; su primer bloque define `E.f3`, con constantes de física moderna, Simpson, bisección, sección áurea y boosts), `c3-` (M103, que es variable compleja; su primer bloque define `E.c3`, con aritmética de complejos como pares `[re, im]`, integrales de contorno numéricas, raíces por Durand-Kerner y formato de $a + bi$; las respuestas complejas se piden en un `multi`, parte real y parte imaginaria), `qg-` (Q101; su primer bloque define `E.qg`, con masas atómicas, lector de fórmulas, balanceo por el núcleo de la matriz y configuraciones electrónicas). Para M101 no hay prefijo: sus ids vienen del MVP.
- **Requisitos por unidad** (los chequean los tests):
  - al menos 4 plantillas de al menos 2 tipos;
  - teoría con hipervínculos;
  - `order` y `program`;
  - un `diagnostic` válido;
  - cada plantilla en exactamente una lección.
- **Tipos de plantilla:** `numeric` (`answer`), `mc` (`options`/`correct`, usá `H.mc(r, correcta, distractores, { text: true })`), `tf` (`answer` booleano + `explanation`), `order` (`steps`), `match` (`pairs`), `error`, y dos más (pedido del usuario, 26/10):
  - `expr`: se escribe una función. Lleva `answer` como texto para el parser (`"2*x*cos(x^2)"`), `answerTex`, `vars` (`["x"]`, `["t"]`, `["x", "y"]`), `domain` (`[[lo, hi], …]`, uno por variable), `lhs` opcional (TeX que va antes, como `"f'(x) = "`) y `constant: true` para las primitivas. La app compara evaluando en puntos del dominio, así que acepta cualquier forma equivalente. Para armar sumas de términos con signos y fracciones, usá `H.terms([{ p, q, m, t }])` y `H.pw(e, v)`.
  - `multi` (paso a paso): `parts: [{ q, type: "numeric" | "expr" | "mc", …, verify }]`. Se responde de a una parte, y cada parte lleva su `verify`. Si una parte sale mal, se muestra la correcta y se sigue con la próxima. Sirve para separar el planteo (la ecuación, la normal, la función a optimizar) de la cuenta.
- **Errores típicos (`traps`, opcional):** `traps: [{ value, msg }]` en las numéricas, `[{ expr, msg }]` en las `expr` y `[{ option, msg }]` en las `mc`. Si la respuesta coincide con una trampa, se muestra `msg` como pista. Además, `E.diagnose` reconoce solo errores generales (el signo, un factor 2, $g$, grados y radianes, potencias de 10, la inversa, una raíz o el redondeo), así que agregá trampas solo para los errores propios del tema. El test verifica que una trampa nunca se acepte como respuesta correcta.
- **Ejercicios nuevos en lecciones existentes:** van en `content/<código>-practica.js` con `E.addPractice(cid, { templates, lessons: { idLección: [idPlantilla] } })`. Así no se tocan los archivos grandes de cada materia.
- **RNG `r`:** `r.int(a, b)`, `r.nz(a, b)` (sin 0), `r.pick(arr)`, `r.bool()`, `r.distinct(n, a, b)`, `r.sample(arr, n)`, `r.shuffle(arr)`. Ojo: `u.map(x => x * r.pick([...]))` sortea **un valor por componente**; si querés el mismo factor, sorteálo antes. `generate` puede devolver `null` para descartar una instancia y probar otra.
- **Helpers `H`:** `H.num(x, d)`, `H.frac(p, q)`, `H.poly([[c, "x^{2}"], …])`, `H.par`, `H.sg`, `H.xm(h, "x")`. Para mostrar decimales con coma en TeX: `String(x).replace(".", "{,}")`.
- **Links en la teoría:**
  - `[[id|texto]]` enlaza a otra ficha, de cualquier materia;
  - los `aliases` se auto-enlazan y tienen que ser **únicos entre todas las materias** (el test avisa qué alias choca; sacalo de la ficha nueva);
  - **no pongas LaTeX dentro del texto de un link**;
  - no enlaces a fichas que todavía no existen (el test falla): agregá el link cuando la ficha exista.
- **Figuras interactivas** (pedido del usuario, 20/10): van en `content/<código>-figuras.js` con `E.addFigures(cid, { "id-ficha": [{ viz, caption }] })` y quedan al final de «La idea».
  - Un `viz` es `{ xr, yr, equal, h, sliders: [{ k, label, min, max, step, v }], play: { k, max, speed, loop }, draw(g, p) }`.
  - `draw` dibuja con el lápiz `g` en coordenadas del mundo (sus métodos están en `E.VIZ_API`) y devuelve una línea de TeX, sin `$`; los tramos separados por `\qquad` pueden bajar de renglón.
  - La suite la dibuja con un lápiz falso en los extremos de cada deslizador y en varios instantes de la animación.
  - Conviene mirarla en Chromium: Playwright está instalado, así que se pueden sacar capturas.
- **Demostraciones:** toda ficha que enuncie una fórmula o un teorema lleva `demo`: de dónde sale, paso a paso (pedido del usuario). Solo las definiciones, recetas y postulados pueden ir sin ella. Escribila como **pasos numerados** («**Paso 1.** …»), uno por idea, y justificá cada paso con palabras: qué propiedad se usa y por qué. No encadenes cuentas sin explicar (pedido del usuario, 15/10). La «idea» explica la intuición, sin repetir la demo.
- **Física:** g = 9,8 m/s², aclarado en cada enunciado.
- **Contenido 100 % original.** De los programas oficiales solo se toma la lista de temas.

## Verificación independiente (obligatoria)

Toda plantilla nueva lleva `verify`, y la suite recalcula la respuesta **por otro camino**: simulación, otro método numérico u otra parametrización, no la misma fórmula. Lo ejecuta `runVerify` en `tests/run-tests.mjs`.

- **Tipos útiles:**
  - `value` (`fn()` vs la respuesta, `tol`);
  - `zero` (`fn(answer)` devuelve residuos ≈ 0);
  - `truth` (`fn()` === `target`, por defecto la respuesta; en `mc` y `match` pasá `target: true`, porque no hay `answer`);
  - `deriv` (`f`, `x0`);
  - `integral` (`f`, `a`, `b`);
  - `ode` (RK4: `f(t, y)`, `y0`, `t1`, `dt`, `out`; para eventos, `until` **y** `g`, que es la función cuyo cero se interpola);
  - de álgebra lineal: `det`, `rank`, `solve`, `inv`, `eig`, `rouche`, `nullity`;
  - para las `expr` (la respuesta llega como función y se compara en puntos al azar de `dom`): `derivOf` (`f`, `wrt`, `k`: la derivada numérica de `f`, por `k` si hace falta, como en $E = -dV/dx$), `primOf` (`f`: la derivada numérica de la respuesta tiene que dar `f`) y `fnEq` (`g`, calculada por otro camino, por ejemplo con una simulación);
  - `all`.
- **Tolerancias:** preferí tolerancias relativas cuando la escala de los valores varía.
- **Plantillas lentas:** declarán `testN` (por ejemplo 60) y la suite avisa las que tardan más de 8 s.
- **Variedad:** cada plantilla tiene que dar al menos 5 variantes distintas (al menos 2 en V/F). Con menos de 10 instancias ese chequeo se saltea.

**Comandos:**

```sh
node tests/run-tests.mjs              # todo, 300 instancias por plantilla (tarda varios minutos)
node tests/run-tests.mjs 300 m102     # solo una materia (los chequeos estructurales corren igual)
node tests/run-tests.mjs 20           # pasada rápida antes de commitear
```

**Prueba en el navegador (opcional):** `python -m http.server 4173` y abrir `http://127.0.0.1:4173/`. En la consola, `efecenDebug.preview("tpl-id", seed, "m102")` muestra una plantilla y `efecenDebug.learn("card-id")` abre una ficha. En la nube puede no haber navegador: alcanza con la suite.

## Escritura de archivos: trampas conocidas

- **Escapes.** Los textos de las plantillas son template literals: en TeX va `\\frac`. En los campos de las fichas se usa `R\`…\`` (String.raw), con una sola barra. Si generás o editás código con Python, usá strings crudos `r'''…'''` o escribí el archivo directamente; un heredoc o un string normal se come las barras invertidas.
- **Bloques nuevos.** Escribilos en un archivo aparte, revisalos y recién ahí agregalos al de la materia. Después corré los tests de esa materia.

## Evaluaciones (parciales y finales)

- **Material original:** está en el Google Drive del usuario, carpeta **Apunteca**, y se lee con el conector de Drive. **Nunca lo subas al repo**: es público y el material es de la cátedra.
- **Cómo leerlo con criterio:**
  - primero listá nombres y tamaños;
  - después leé una muestra: los años recientes, con sus resoluciones, y PDF con texto antes que escaneos;
  - salteá «Apuntes y Libros» y los duplicados «(1)».
- **Qué anotar:** solo la estructura (temas, tipos de ejercicio y puntajes), en `docs/parciales/<materia>.md`. No copies enunciados ni nombres de estudiantes.
- **Cómo armarlos:** en `content/<código>-examenes.js`, con plantillas existentes (`tpl` o `pick`) y ejercicios de desarrollo propios (`self`, con rúbrica). Cada examen suma 100 puntos (lo verifica un test). Si un ejercicio de desarrollo tiene cuentas, lleva `verify`, igual que las plantillas. Para que cada intento traiga ejercicios distintos, usá `any` en las partes o en los ítems: todas las alternativas de un ítem tienen que valer lo mismo. Las plantillas de nivel examen que no pertenecen a ninguna lección van en `templates`, con `verify`.

## Avisos (notificaciones push)

- **Servicio:** `efecen-push`, un Worker de Cloudflare con D1 y un cron por minuto, en `https://push.efecen.com.ar`. Detalle en [push/README.md](push/README.md).
- **Reparto:** el texto de los avisos nunca sale del dispositivo. La app lo deja en la caché `efecen-avisos` y al servicio le manda solo la suscripción y las horas. El servicio manda un push sin contenido, y `service-worker.js` (`showAvisos`) arma la notificación.
- **En la app:** `E.reminders` y `E.reminderAt` en `engine.js` (puros, con tests) y el bloque «AVISOS» de `index.html` (`avisosList`, `avisosSyncNow`, `avisosProbar`, `avisosSetHtml`). La dirección del servicio y la clave pública están en `PUSH`.
- **Pantalla «Cómo se usa»** (`renderHelp`, `#/ayuda`): explica la app en pocos pasos. Cuando agregues una función que el usuario tenga que descubrir, sumala ahí. Para no recargar las pantallas, lo secundario va en secciones plegables (`<details class="fold" data-fold="…" ${foldOpen("…")}>`).
- **Si cambia el Worker:** corré `node --no-warnings push/test.mjs` y publicá con `npx wrangler deploy` desde `push/`. No depende del push a GitHub.
- **Si cambia la clave pública VAPID:** va igual en `push/wrangler.toml` y en `PUSH.key`. La privada es un secreto del Worker (`VAPID_PRIVATE_JWK`) y no se versiona.

## Firebase (sincronización)

- **Proyecto:** `efecen-46bfd`. App web: `efecen-web`. Firestore en `southamerica-east1`. Login de Google activo.
- **`sync.js`:** se importa desde `gstatic.com/firebasejs/10.14.1` y expone `Efecen.sync` (`user`, `signIn()`, `signOut()`, `changed()`).
  - Guarda en `users/{uid}`: `{ data: JSON del estado, updatedAt, app }`.
  - Al entrar y al volver a la app, baja lo remoto y lo combina con `E.store.merge` (idempotente y sin pérdida; tiene tests). Después sube el resultado.
  - Cada `save()` de la app llama a `E.sync.changed()`, que sube con un debounce de 2 s.
- **Liga semanal:** `Efecen.sync.league` (`publish()`, `load(n)`) escribe y lee `leagues/{lunes}/players/{uid}`. La meta diaria es fija (`E.DAILY_GOAL`). Si cambian las reglas de XP, actualizá también el texto «Cómo se suma» de `renderLeague`.
- **Ganchos de la app:** `E.syncHooks.get/set/status`. La UI está en `accountCard()`, dentro de `renderSettings`.
- **Reglas:** cada usuario solo accede a su documento. Para desplegarlas: `firebase deploy --only firestore:rules`. Hace falta el Firebase CLI con login; si la sesión en la nube no lo tiene, pedile al usuario que lo haga desde su compu.
- **Si cambia el estado guardado** (`E.store.defaults`): actualizá `E.store.migrate` y `E.store.merge`, y sus tests.
