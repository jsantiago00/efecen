# efecen: guía para continuar el trabajo

**efecen** es una PWA estilo Duolingo para repasar la **Licenciatura en Ciencias Básicas con orientación en Física** (FCEN, UNCuyo, Plan Ord. 77/15 C.S.). Está hecha en HTML, CSS y JS vanilla, sin build; usa KaTeX y canvas, guarda en localStorage y sincroniza opcionalmente con Firebase. Todo el texto visible está en español rioplatense (voseo). La mascota es **Schrödi**, un gato de Schrödinger: en el texto se escribe con ö, y en ids y archivos va como `schrodi`.

- **Publicada:** https://santiagososa.com.ar/efecen/ (GitHub Pages del repo `jsantiago00/efecen`, rama `main`).
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

## Pausa vigente

**Hasta el domingo 18/10/2026 no se crean materias nuevas** (pedido del usuario). Antes de esa fecha, trabajá solo en lo que el usuario pida, como funciones de la app o arreglos. Después, seguí el orden de pendientes de PROGRESO.md:

1. M106 Geometría Analítica (programa 2026).
2. M105 Probabilidad y Estadística. No hay programa: usá un temario estándar y anotalo.
3. F102A Física General II A (programa 2026).
4. 3.º y 4.º año.

## Estructura

| Archivo | Qué es |
|---|---|
| `index.html` | Todo el motor (`<script id="engine">`) y la UI (`<script id="app-script">`), más el CSS. |
| `content/carrera.js` | La carrera: años → semestres → materias, con `code`, `title`, `course` (si ya tiene contenido) y `step` (orden sugerido). |
| `content/<código>-<nombre>.js` | **Un archivo por materia**: `m101-calculo1.js`, `m104-algebra-lineal.js`, `f101-fisica1.js`, `f102b-fisica2b.js`, `m102-calculo2.js`. Se cargan con `<script src>` en `index.html`, en el orden de la carrera. |
| `sync.js` | Módulo ES: login con Google y sincronización con Firestore (ver más abajo). |
| `service-worker.js` | Precache offline (stale-while-revalidate). `CACHE` y `CONTENT`. |
| `tests/run-tests.mjs` | Suite: carga el motor y el contenido en un `vm` de Node y verifica todo. |
| `PROGRESO.md` | Bitácora del proyecto. |
| `firestore.rules`, `firebase.json`, `.firebaserc` | Reglas de Firestore (proyecto `efecen-46bfd`). |

Materias completas: M101 Cálculo I, M104 Introducción al Álgebra Lineal, F101 Física General I, F102B Física General II B y M102 Cálculo II.

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

- **Prefijos de ids por materia:** `c2-` (M102), `al-` (M104), `f1-` (F101), `f2b-` (F102B). Para M101 no hay prefijo: sus ids vienen del MVP.
- **Requisitos por unidad** (los chequean los tests):
  - al menos 4 plantillas de al menos 2 tipos;
  - teoría con hipervínculos;
  - `order` y `program`;
  - un `diagnostic` válido;
  - cada plantilla en exactamente una lección.
- **Tipos de plantilla:** `numeric` (`answer`), `mc` (`options`/`correct`, usá `H.mc(r, correcta, distractores, { text: true })`), `tf` (`answer` booleano + `explanation`), `order` (`steps`), `match` (`pairs`), `error`.
- **RNG `r`:** `r.int(a, b)`, `r.nz(a, b)` (sin 0), `r.pick(arr)`, `r.bool()`, `r.distinct(n, a, b)`, `r.sample(arr, n)`, `r.shuffle(arr)`. Ojo: `u.map(x => x * r.pick([...]))` sortea **un valor por componente**; si querés el mismo factor, sorteálo antes. `generate` puede devolver `null` para descartar una instancia y probar otra.
- **Helpers `H`:** `H.num(x, d)`, `H.frac(p, q)`, `H.poly([[c, "x^{2}"], …])`, `H.par`, `H.sg`, `H.xm(h, "x")`. Para mostrar decimales con coma en TeX: `String(x).replace(".", "{,}")`.
- **Links en la teoría:**
  - `[[id|texto]]` enlaza a otra ficha, de cualquier materia;
  - los `aliases` se auto-enlazan y tienen que ser **únicos entre todas las materias** (el test avisa qué alias choca; sacalo de la ficha nueva);
  - **no pongas LaTeX dentro del texto de un link**;
  - no enlaces a fichas que todavía no existen (el test falla): agregá el link cuando la ficha exista.
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

## Firebase (sincronización)

- **Proyecto:** `efecen-46bfd`. App web: `efecen-web`. Firestore en `southamerica-east1`. Login de Google activo.
- **`sync.js`:** se importa desde `gstatic.com/firebasejs/10.14.1` y expone `Efecen.sync` (`user`, `signIn()`, `signOut()`, `changed()`).
  - Guarda en `users/{uid}`: `{ data: JSON del estado, updatedAt, app }`.
  - Al entrar y al volver a la app, baja lo remoto y lo combina con `E.store.merge` (idempotente y sin pérdida; tiene tests). Después sube el resultado.
  - Cada `save()` de la app llama a `E.sync.changed()`, que sube con un debounce de 2 s.
- **Ganchos de la app:** `E.syncHooks.get/set/status`. La UI está en `accountCard()`, dentro de `renderSettings`.
- **Reglas:** cada usuario solo accede a su documento. Para desplegarlas: `firebase deploy --only firestore:rules`. Hace falta el Firebase CLI con login; si la sesión en la nube no lo tiene, pedile al usuario que lo haga desde su compu.
- **Si cambia el estado guardado** (`E.store.defaults`): actualizá `E.store.migrate` y `E.store.merge`, y sus tests.
