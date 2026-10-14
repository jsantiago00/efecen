# efecen

PWA tipo Duolingo para repasar matemática y física universitaria en sesiones de 5-10 minutos por día. Funciona offline, se instala en el celu y guarda el progreso en el navegador.

**Fase 1 (actual):** Cálculo en una variable: Límites y continuidad (5 lecciones) y Derivadas (6 lecciones), 37 plantillas paramétricas.

## Correrla local

Cualquier servidor estático sirve (el service worker no anda con `file://`):

```sh
python -m http.server 4173
# abrir http://127.0.0.1:4173
```

## Publicar en GitHub Pages

1. Subí el repo a GitHub.
2. *Settings → Pages → Build and deployment*: elegí *Deploy from a branch*, rama `main` y carpeta `/ (root)`.
3. Al publicar cambios, subí la constante `CACHE` en `service-worker.js` (`efecen-v2`, …) para que los celulares bajen la versión nueva.

## Estructura

```
index.html            shell + CSS + motor (<script id="engine">) + UI (<script id="app-script">)
content/calculo.js    curso de Cálculo: conceptos, plantillas y unidades (solo datos)
service-worker.js     precache + stale-while-revalidate
manifest.json         PWA
assets/               vendor (KaTeX), fuente, íconos, sonidos, mascota
tests/run-tests.mjs   tests del motor y del contenido
tools/make_icons.py   regenera los PNG de la PWA
```

## Cómo agregar contenido

Todo vive en `content/<curso>.js`:

1. **Concepto** (la unidad de repetición espaciada): `concepts: { "der-cadena": { name: "Regla de la cadena" } }`.
2. **Plantilla**: un objeto con `type`, `concepts`, `difficulty` (1-3) y `generate(r)`, que recibe un RNG con semilla y devuelve una instancia. Devolver `null` le pide al motor otros valores.
3. **Lección**: agregala a `units[].lessons` con la lista de plantillas y un `intro` corto (repaso teórico).

Tipos de instancia:

| `type` | campos |
|---|---|
| `mc` | `options` (LaTeX), `correct` (usá `H.mc(r, correcta, distractores)`) |
| `numeric` | `answer`, `answerTex?`, `tolerance?` (relativa, por defecto 0.01) |
| `tf` | `answer` (bool), `explanation` |
| `order` | `steps` en el orden correcto (la UI los mezcla) |
| `match` | `pairs: [[izq, der], …]`, cada lado `{ tex }` o `{ graph }` |
| `error` | `steps`, `wrongIndex`, `fix`, y `solution` con los pasos correctos |

Todas llevan `prompt` y `solution` (pasos en LaTeX, con `$…$` o `$$…$$`). Opcionalmente, `graph` (`{ fns | pieces, points, asym, xr, yr }`) dibuja un gráfico con canvas y `verify` permite que los tests comprueben numéricamente la respuesta (`limit`, `liminf`, `deriv`, `deriv2`, `deriv-fn`, `implicit`).

Para ver una plantilla puntual, en la consola del navegador: `efecenDebug.preview("der-cadena-mc", 42)`.

## Apuntes (teoría con hipervínculos)

`content/<curso>-teoria.js` define fichas con definición, idea, demostración, ejemplos resueltos y errores comunes (ver el comentario al principio de `content/calculo-teoria.js`). Hay tres formas de llegar a una ficha:

- **Links explícitos** en cualquier texto (apuntes, enunciados o resoluciones): `[[regla-cadena]]` o `[[regla-cadena|texto visible]]`.
- **Autolink:** los `aliases` de cada ficha («regla de la cadena», «Bolzano», «por izquierda»…) se convierten solos en links dentro de enunciados, resoluciones e intros de lección, una vez por ficha y por bloque, y nunca adentro del LaTeX.
- **Desde la app:** la pestaña *Aprender* (índice con buscador), el botón «apuntes» de cada lección en el mapa, el botón «¿No te acordás? Aprendelo de cero» en la intro de la lección y los chips «Repasá la teoría» del feedback.

El panel de apuntes se abre encima de lo que estés haciendo, también en medio de un ejercicio, y tiene su propio historial: «atrás» vuelve a la ficha anterior.

## Tests

```sh
node tests/run-tests.mjs        # 300 instancias por plantilla
node tests/run-tests.mjs 2000   # más exhaustivo
```

Validan el parser numérico, el SM-2, la estructura de los cursos, que todo el LaTeX compile en KaTeX estricto, que las opciones no se repitan y, cuando la plantilla trae `verify`, que la respuesta coincida con un cálculo numérico independiente.

## Mecánica

- **XP:** 10 por acierto al primer intento, 5 si sale en el reintento, +10 al completar una lección (+5 si es perfecta).
- **Racha:** días seguidos con al menos una sesión terminada. **Meta diaria:** configurable (20/50/100/150 XP).
- **Lección completada:** al menos 75% de aciertos al primer intento. Desbloquea la siguiente; una unidad se desbloquea al completar la anterior.
- **Repetición espaciada:** SM-2 por concepto, con la nota calculada a partir del acierto y del tiempo. Se actualiza una vez por concepto y por día. La «Sesión del día» trae hasta 5 repasos vencidos más la lección actual.
- **Diagnóstico:** 3 ejercicios por unidad. Con 2 de 3 aprobás la unidad y pasás a la siguiente; si no, se corta ahí. Las unidades aprobadas quedan desbloqueadas y sus conceptos entran al SRS como repaso.
- **Backup:** Ajustes → Exportar/Importar (JSON).

Créditos de assets: [CREDITS.md](CREDITS.md).
