# Créditos y licencias

Todos los assets están copiados dentro del repo (`/assets`) para que la app funcione offline. No se carga nada por hotlink.

| Asset | Archivos | Autor | Fuente | Licencia |
|---|---|---|---|---|
| Sonidos de interfaz («Interface Sounds» 1.0): `confirmation_002` → `correct.ogg`, `error_006` → `wrong.ogg`, `select_002` → `tap.ogg` | `assets/sounds/` | Kenney (kenney.nl) | https://kenney.nl/assets/interface-sounds | CC0 1.0 |
| Jingles («Music Jingles»): `jingles_PIZZI01` → `complete.ogg`, `jingles_NES03` → `streak.ogg` | `assets/sounds/` | Kenney (kenney.nl) | https://kenney.nl/assets/music-jingles | CC0 1.0 |
| Íconos de interfaz (32 íconos de Lucide 1.48.0, empaquetados como sprite) | `assets/icons/sprite.svg` | Lucide Contributors | https://lucide.dev | ISC (ver `assets/icons/LICENSE-lucide.txt`) |
| Tipografía Nunito (variable, subset latin) | `assets/fonts/nunito-latin-wght.woff2` | Vernon Adams, Cyreal, Jacques Le Bailly | Google Fonts vía Fontsource 5.3.0 | SIL Open Font License 1.1 (ver `assets/fonts/OFL.txt`) |
| KaTeX 0.16.29 (JS, CSS y fuentes woff2) | `assets/vendor/katex/` | Khan Academy y colaboradores | https://katex.org | MIT (ver `assets/vendor/katex/LICENSE`) |
| Mascota «Schrödi», el gato de Schrödinger en su caja (SVG animado con 7 estados, favicon e íconos PNG de la PWA) | `assets/img/schrodi.svg`, `assets/icons/icon-*.png`, mascota inline en `index.html` (función `mascot`), generador `tools/make_icons.py` | Diseño original de este proyecto | — | CC0 1.0 |

Los ejercicios son originales y se generan por plantillas (`content/*.js`). El orden de los temas sigue la estructura clásica de los cursos universitarios de Cálculo; no se copió ningún enunciado ni texto de libros.

Hoy no hay assets CC BY. Si se agrega alguno (por ejemplo, íconos de game-icons.net para logros), hay que sumarlo a esta tabla **y** a la pantalla «Créditos» de la app (`renderCredits` en `index.html`).
