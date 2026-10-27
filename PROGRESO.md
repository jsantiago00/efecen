# Progreso: efecen como "la carrera"

Objetivo: reconstruir la **Licenciatura en Ciencias Básicas con orientación en Física** (FCEN, UNCuyo, Plan Ord. 77/15 C.S.) para repasarla materia por materia.

Trabajo en la rama `carrera-fcen`. Por pedido durante la noche, cada bloque terminado (con los tests en verde) se pushea también a `main`, para poder probarlo en el celu.

## Estado

| Paso | Materia | Estado | Plantillas | Fichas |
|---|---|---|---|---|
| 1 | M101 Cálculo I | **completa**: las 5 unidades del programa (7 unidades en la app) | 105 | 64 |
| 2 | M104 Introducción al Álgebra Lineal | **completa**: las 6 unidades del programa (repasada el 21/10), más 3 unidades «Extra UBA» | 53 | 29 |
| 3 | F101 Física General I | **completa**: unidad transversal y 10 unidades, más 4 unidades «Extra UBA» | 82 | 43 |
| 4 | F102B Física General II B | **completa**: las 8 unidades del programa (termodinámica, ondas, óptica geométrica, interferencia y difracción; repasada el 21/10), más 4 unidades «Extra UBA» | 62 | 30 |
| 5 | M102 Cálculo II | **completa**: las 8 unidades del programa (repasada el 21/10), más 3 unidades «Extra UBA» | 65 | 33 |
| 6 | M106 Geometría Analítica | **completa**: las 6 unidades del programa (repasada el 24/10) | 61 | 33 |
| 7 | M105 Probabilidad y Estadística | **completa**: 8 unidades de un temario estándar (no hay programa publicado; repasada el 24/10), más 3 unidades «Extra UBA» | 73 | 41 |
| 8 | F102A Física General II A | **completa**: las 9 unidades del programa (electrostática, circuitos, magnetismo, inducción y alterna; repasada el 21/10), más 4 unidades «Extra UBA» | 77 | 53 |
| 9 | F104 Física General III | **completa** (26/10): las 7 unidades (relatividad; fotones; Bohr; ondas de materia e incerteza; Schrödinger y pozo infinito; oscilador, escalón, barrera y pozo finito; hidrógeno), 9 figuras y las evaluaciones (dos parciales y el final). No se encontró el programa; el temario sale de los parciales de 2021 (`docs/parciales/f104.md`) | 36 | 18 |
| 10+ | resto de 3.º y 4.º año | pendientes; aparecen como "Próximamente" | — | — |
| básico | Q101 Química General | **en curso** (26/10): unidades 1 a 3 de 9 (estructura atómica; enlace; estequiometría). Es del ciclo básico de las cuatro orientaciones | 25 | 14 |

Cada unidad tiene teoría con hipervínculos (definición, idea, demostración, ejemplos, errores comunes), al menos 4 plantillas de al menos 2 tipos, y test de unidad.

## Extra UBA: lo que la UBA da y la UNCuyo no (desde el 25/10)

Pedido del usuario: sumar a cada materia los temas que la Lic. en Cs. Físicas de la FCEN-UBA incluye en su materia equivalente y que no están en el programa de la UNCuyo. Así la app sirve para encontrar debilidades y estudiar con el mejor nivel disponible.

- **Cómo se agregan:** como unidades al final de la materia, con `program: "Extra UBA"` y `order` a continuación de las del programa. Siguen todas las reglas: plantillas con `verify` independiente, teoría con links y demostraciones, y test de unidad.
- **Fuente:** la carpeta local `Bibliografía - Cs. Físicas - FCEN - UBA/` (17 GB). Está ignorada por git porque tiene libros con copyright y el repo es público. Se usan solo las guías y los parciales en PDF con texto, para sacar la **lista de temas y el tipo de ejercicio**. Las fotos y los escaneos no sirven. Nada se copia: enunciados, teoría y ejercicios son originales.
- **Equivalencias UBA → UNCuyo:**
  - Física 1 → F101;
  - Física 2 (oscilaciones, ondas y óptica) → F102B;
  - Física 3 (electromagnetismo) → F102A;
  - Física 4 → F206;
  - Matemática 1 (Análisis I, que en Física es cálculo en varias variables) → M102;
  - Matemática 2 (álgebra lineal) → M104 y M203;
  - Matemática 3 (Análisis II) → M102 y M103;
  - Matemática 4 (Análisis III) → M209;
  - Mecánica Clásica → F203;
  - Física Teórica 1, 2 y 3 → F204, F206 y F207;
  - Métodos Estadísticos en Física Experimental (optativa) → M105.
  - Cálculo Numérico no tiene equivalente en el plan de la UNCuyo.

| Materia | Extra UBA hecho | Extra UBA pendiente |
|---|---|---|
| F101 | **Sistemas no inerciales:** fuerzas de inercia, centrífuga y Coriolis. **Estabilidad:** pequeñas oscilaciones y potencial efectivo. **Relatividad especial:** dilatación, contracción, Lorentz, simultaneidad y energía. **Masa variable (26/10):** ecuación del cohete (en el espacio y con gravedad), cinta transportadora y cadena que cae sobre una balanza. | — |
| F102B | **Oscilaciones acopladas:** modos normales, batidos, molécula triatómica y cadena de N masas. **Polarización:** estados, Malus, Brewster y láminas retardadoras. **Ondas:** reflexión y transmisión entre medios (impedancia), Fourier en una cuerda, velocidad de grupo y prismas. **Instrumentos y coherencia (26/10):** lupa, microscopio y telescopio (aumento angular), longitud de coherencia y franjas en un Michelson. | — |
| F102A | **Electrostática avanzada:** forma diferencial (divergencia, rotor, Poisson y Laplace), método de imágenes y desarrollo multipolar. **Medios:** P, D y cargas de polarización; M, H y circuitos magnéticos con entrehierro. **Circuitos:** Thévenin, puente de Wheatstone y filtros (pasa-bajos, pasa-altos y pasabanda). **Ondas y potencial vector (26/10):** ecuación de ondas desde Maxwell en medios, vector de Poynting (también en un alambre), potencial vector, gauge y solenoide. | — |
| M102 | **Rigor en varias variables:** límites dobles por caminos y en polares, diferenciabilidad (direccionales por definición, parciales sin diferenciabilidad). **Taylor de orden 2** en dos variables y regla de la cadena de segundo orden, **función implícita** y **extremos absolutos** en regiones compactas. **Integrales impropias dobles (26/10):** criterio de las potencias en el plano y el espacio, integrales en regiones no acotadas e integral de Gauss. | — |
| M101 | No hay equivalente: en Cs. Físicas de la UBA, el cálculo en una variable se da en el CBC, y «Análisis I» es cálculo en varias variables (se usó para M102). | — |
| M104 | **Producto interno general** (en polinomios, con integrales), proyección sobre subespacios y cuadrados mínimos; **teorema espectral** y clasificación de formas cuadráticas. **Forma de Jordan**, Cayley-Hamilton, exponencial de matrices ($\vec x\,' = A\vec x$) y recurrencias lineales. **Espacios complejos (26/10):** producto interno con conjugado, proyección, matrices unitarias y hermíticas. | — |
| M105 | **Física experimental:** propagación con covarianza y cambio de variables, promedio ponderado y ajustes por χ² (Δχ² = 1, χ²/ν), límites superiores de Poisson. **Bayes, Monte Carlo y Cramér-Rao:** priors conjugados (Beta-binomial, Gamma-Poisson), transformada inversa, error de Monte Carlo, información de Fisher. **Función característica y K-S (26/10):** aceptación y rechazo, momentos y sumas con la función característica, estadístico y decisión de Kolmogorov-Smirnov. | — |
| M106 | — | Sin equivalente directo en la UBA (la geometría analítica se da en el CBC); queda para después |

- **F102B: verificaciones.** Los modos se verifican simulando el sistema y midiendo períodos, o con $\det(M^{-1}K - \omega^2I) = 0$ por Gauss. La polarización, con matrices de Jones complejas y promediando 720 polarizaciones de entrada para la luz natural. Brewster, con el coeficiente de Fresnel $r_p$. La unión de cuerdas, con una simulación por diferencias finitas del pulso. El prisma, trazando el rayo y minimizando la desviación por sección áurea.
- **F102A: verificaciones.** Poisson y el rotor se verifican con diferencias finitas. Las imágenes, integrando la carga inducida sobre el plano (fuerza y $-\frac12qV_{ind}$), o anulando el potencial sobre la esfera. Los multipolos, con el potencial exacto lejos. Los dieléctricos en serie, resolviendo $\nabla\cdot(\varepsilon\nabla V) = 0$ en 1D. El núcleo, sumando 4000 espiras con la corriente libre más la de magnetización. Thévenin y Wheatstone, por análisis nodal. Los filtros RC, simulando el circuito en el tiempo. El pasabanda, bisecando los puntos de media potencia.
- **Pendientes chicos (26/10): verificaciones.** El cohete se integra con RK4; la cinta, simulando un grano que patina; la cadena, derivando numéricamente la cantidad de movimiento total. Los instrumentos ópticos, con matrices ABCD (aumento con el elemento C o D); la coherencia, sumando 400 longitudes de onda y buscando el primer cero del contraste. La ecuación de ondas, con el residuo por diferencias finitas; Poynting, obteniendo B de Faraday integrada en el tiempo; el potencial vector, con el rotor numérico y el flujo por Simpson. Las impropias dobles, en cartesianas con cambios de variable que llevan el infinito a un intervalo (x = tan u, y = c + t/(1 − t)) y, para decidir convergencia, integrando sobre [ε, 1]² con dos ε. Los complejos, con la representación real ℝ²ⁿ (la hermítica 2×2 como simétrica real 4×4). La función característica, con derivadas complejas por diferencias finitas; K-S, recorriendo una grilla fina y con la serie de Kolmogorov para el valor p.
- **Relatividad: verificación con rapidez.** Las plantillas se verifican con un boost construido como exponencial de la matriz de rapidez (serie de Taylor), sin usar γ, aplicado a los eventos.

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

## Figuras interactivas en los apuntes (20/10)

- **Pedido del usuario:** ejemplos visuales para entender mejor los conceptos. Ya había gráficos estáticos (24 en M101, 4 en F101); ahora las fichas pueden tener **figuras interactivas**, con deslizadores, animación con «Reproducir» y una lectura de valores que se actualiza.
- **Motor** (`index.html`):
  - el bloque `viz`, dibujado en canvas con el lápiz `g`: ejes, grilla, funciones, curvas, flechas, puntos, círculos, rectángulos, polígonos y texto, en coordenadas del mundo, con la opción `equal` para la geometría de la física;
  - `E.addFigures` las agrega a fichas que ya existen;
  - la animación se corta sola al salir de la ficha.
- **M101** (`content/m101-figuras.js`), 8 figuras:
  - la secante que tiende a la tangente;
  - las sumas de Riemann, con tres reglas;
  - las transformaciones $a\,f(x - h) + k$;
  - el teorema del valor medio;
  - la función inversa reflejada en $y = x$;
  - la definición ε-δ del límite;
  - las sumas parciales de una serie geométrica;
  - el signo de $f'$ junto con el gráfico de $f$.
- **F101** (`content/f101-figuras.js`), 8 figuras, casi todas animadas:
  - el tiro oblicuo, con las componentes de la velocidad;
  - $x(t)$ y $v(t)$ en el MRUV;
  - el movimiento circular, con $v$ y $a_c$;
  - el plano inclinado con rozamiento y su diagrama de fuerzas;
  - el MAS como proyección de un fasor, con el resorte;
  - el péndulo, con las barras de energía;
  - un choque en una dimensión con coeficiente de restitución;
  - los tres regímenes del oscilador amortiguado.
- **F102A** (`content/f102a-figuras.js`), 8 figuras:
  - las líneas de campo de dos cargas (se integran desde las positivas) y sus curvas equipotenciales (marching squares);
  - una carga girando en un campo magnético, con la velocidad y la fuerza;
  - la carga y la corriente de un RC;
  - la barra sobre rieles, con el área, el flujo y la corriente inducida;
  - el flujo y la fem de un generador;
  - los fasores de un RLC serie;
  - la curva de resonancia según $Q$.
- **M104** (`content/m104-figuras.js`), 8 figuras en el plano:
  - combinación lineal (regla del paralelogramo) y producto escalar con la proyección;
  - el determinante como área orientada de las columnas;
  - una transformación lineal que deforma la cuadrícula, animada desde la identidad;
  - un sistema de 2 × 2 como dos rectas (se cortan, son paralelas o coinciden);
  - autovectores: $A\vec x$ contra $\vec x$ dando la vuelta, y las potencias $A^n\vec x$ que se alinean con el autovector dominante;
  - Gram-Schmidt, restando la proyección paso a paso.
- **F102B** (`content/f102b-figuras.js`), 9 figuras:
  - isotermas del gas ideal; isotérmica contra adiabática, con el trabajo; ciclo de Carnot y su rendimiento; distribución de Maxwell;
  - onda viajera (la forma avanza, la partícula oscila) y armónicos de una onda estacionaria;
  - refracción y reflexión total; lente delgada con los rayos principales; doble rendija con la envolvente de difracción.
- **M102** (`content/m102-figuras.js`), 8 figuras:
  - curvas de Lissajous con el vector velocidad y curvas polares (rosas, cardioide, caracoles) dibujándose;
  - polinomios de Taylor de $\sin x$, $e^x$ y $\ln(1 + x)$ (con su radio de convergencia) y la serie de Fourier de una cuadrada (Gibbs);
  - la circunferencia osculatriz; curvas de nivel con el gradiente; multiplicadores de Lagrange sobre una circunferencia;
  - el campo de pendientes de la ecuación logística con su solución.
- **M106** (`content/m106-figuras.js`), 7 figuras de cónicas:
  - la definición por foco y directriz según la excentricidad;
  - las propiedades métricas de la elipse (suma de distancias), la hipérbola (diferencia, con asíntotas) y la parábola (foco y directriz, con la reflexión);
  - la traslación de ejes, la rotación que elimina el término $Bxy$ y la tangente a una elipse con su propiedad focal.
- **M105** (`content/m105-figuras.js`), 8 figuras: la binomial con su aproximación normal, la Poisson, áreas bajo la normal, el teorema central del límite (promedio de exponenciales contra la normal), 25 intervalos de confianza simulados, $\alpha$, $\beta$ y potencia de una prueba, la recta de regresión con sus residuos y la verosimilitud de una proporción. Las muestras salen de un generador con semilla, para que la figura no cambie sola.
- **Tests:** cada figura se dibuja con un lápiz falso que exige coordenadas finitas en los extremos y en el medio de cada deslizador, y en varios instantes de la animación; además se chequea el TeX de la lectura. Se probaron en Chromium, en una pantalla de 400 px de ancho.
- **Listo (21/10):** las ocho materias de 1.º y 2.º año tienen figuras.
- **Titileo de la lectura (21/10):** el usuario vio que las fórmulas debajo de las figuras titilaban en el celu durante la animación. Se rehacía todo el KaTeX en cada cuadro (unas 50 veces por segundo). Ahora, mientras corre la animación, la lectura se actualiza a lo sumo unas 7 veces por segundo y solo se recompone el tramo (separado por `\qquad`) que cambió; al pausar queda el valor final.

## M105 Probabilidad y Estadística (20/10)

- **Archivo:** `content/m105-probabilidad.js`, con prefijo `pe-`. El primer bloque registra la materia y una biblioteca estadística compartida, `E.pye`:
  - $\Phi$ por su serie de Taylor;
  - gamma y beta incompletas regularizadas, de donde salen las distribuciones χ², t y F;
  - cuantiles por bisección;
  - combinatoria, estadísticos de una muestra y formato de números (`nf` para TeX, `nt` para texto común).
- **Unidades:** 8, con 46 plantillas y 31 fichas, todas las fórmulas con su demostración paso a paso (56 y 33 después del repaso del 24/10).
- **Verificación independiente:**
  - probabilidades por enumeración exhaustiva (dados, subconjuntos, permutaciones) y por poblaciones construidas a partir de las tablas;
  - la binomial por convolución de Bernoulli, la Poisson con la gamma incompleta;
  - densidades, colas y cuantiles integrando la densidad con Simpson, sin las funciones incompletas;
  - máxima verosimilitud y mínimos cuadrados, optimizando numéricamente;
  - el sesgo de $S^2$ promediando sobre todas las muestras posibles.
- **Alias que chocaban:** «regla del producto» (es de derivadas, en M101) y «exponencial» (M101). M105 enlaza a la ficha de errores de F101 para «promedio» y «campana de Gauss», y a la de Cauchy-Schwarz de M104.

## F102A Física General II A (20/10)

- **Archivo:** `content/f102a-fisica2a.js`, con prefijo `f2a-`. El primer bloque registra la materia y una biblioteca compartida, `E.f2a`: las constantes ($k$, $\varepsilon_0$, $\mu_0$, $e$, $m_e$, $m_p$), `nf` (número para TeX, en notación científica si es muy chico o muy grande), Simpson, RK4 para sistemas, Gauss para sistemas lineales, sección áurea, y el campo y el potencial de cargas puntuales en el plano.
- **Hechas:** U1 Carga y campo eléctrico (Coulomb, campo, distribuciones continuas, Gauss, conductores) U2 Potencial eléctrico (energía potencial, potencial, gradiente, equipotenciales) y U3 Capacitancia y dieléctricos (placas, esférico y cilíndrico, serie y paralelo, energía, dieléctricos con la batería conectada o no). U4 Corriente, resistencia y fem (deriva, resistividad y temperatura, fem y resistencia interna, potencia y máxima transferencia). U5 Circuitos de CC (serie y paralelo, Kirchhoff, RC, amperímetros y voltímetros). U6 Campo magnético (fuerza de Lorentz, ciclotrón, selector y espectrómetro, fuerza sobre cables, torque sobre espiras, efecto Hall). U7 Fuentes de campo magnético (Biot-Savart, cables paralelos, Ampère con cable grueso, solenoide y toroide, materiales magnéticos). U8 Inducción (Faraday, Lenz, fem de movimiento y generadores, inductancia propia y mutua, RL). U9 Corriente alterna (valores eficaces, reactancias y fasores, RLC, resonancia, potencia y transformador). $k$ se define como $1/(4\pi\varepsilon_0)$ exacto, para que las fórmulas con $k$ y con $\varepsilon_0$ den lo mismo.
- **Verificación independiente:**
  - las fuerzas, como $-dU/dx$, y el campo, como $-\nabla V$, con derivadas numéricas;
  - el campo de varillas, anillos, discos y esferas, integrando Coulomb numéricamente (en la esfera, cáscara por cáscara, con el ángulo reparametrizado para resolver el pico cerca de la carga);
  - el potencial, con la integral de línea del campo hasta el infinito, o sumando $k\,dq/r$ sobre la carga;
  - la energía de un sistema, armándolo carga por carga;
  - las distancias mínimas y las rapideces, integrando el movimiento con RK4.
  - las capacitancias, con el campo de dos planos sumado como discos enormes, integrando el campo de Gauss con carga unitaria, o con el potencial del nodo intermedio (sistema lineal) en las redes;
  - los dieléctricos, con el campo de las cargas libres y de polarización.
  - las resistencias, tratando el alambre como tubos finos en paralelo; los circuitos simples, como sistemas lineales; la máxima potencia, con sección áurea.
  - las redes de resistencias, por análisis nodal general; Kirchhoff, por mallas en la respuesta y por nodos en la verificación; los RC, integrando la ecuación del circuito con RK4.
  - las órbitas en un campo magnético, integrando la fuerza de Lorentz con RK4 hasta el cuarto de vuelta; el selector, simulando el desvío; las fuerzas y torques, sumando $I\,d\vec l\times\vec B$ y $\vec r\times\vec F$ lado por lado.
  - Biot-Savart vectorial numérico sobre cada curva; el toroide, sumando una por una las $N$ espiras; el cable grueso, sumando hilos finos en una grilla polar.
  - las fem inducidas, derivando numéricamente el flujo (con Richardson); la barra que frena, con RK4; la inductancia, integrando la densidad de energía $B^2/2\mu_0$; Lenz, con el signo de $-d\Phi/dt$.
  - la alterna: valores eficaces promediando $v^2$ numéricamente; las reactancias derivando o integrando la tensión; el RLC simulado en el tiempo (RK4) hasta el régimen, midiendo amplitud, potencia media y desfase; la resonancia y el factor $Q$, buscando el máximo y los puntos de media potencia.
- **Notación científica en las respuestas:** el campo de respuesta acepta `1,6e-19`, `1,6E-19` y `1,6×10^-19`, y hay una tecla «×10^». La vista previa y la respuesta correcta se muestran en notación científica cuando el número es muy chico o muy grande. «2e» sola sigue siendo 2·e, y «2e-1» es 2e − 1 (para no romper Cálculo).
- **Test nuevo:** avisa si queda un comando de TeX o una coma `{,}` fuera de `$…$`, y ahora también se valida con KaTeX el texto de las figuras (antes no se chequeaba).

## Repaso de los dos primeros años (desde el 21/10)

Pedido del usuario: dejar bien terminados 1.º y 2.º año antes de seguir con 3.º y 4.º. Primero se sumaron figuras a todas las materias (ver «Figuras interactivas»). Después se revisa cada materia buscando temas que se evalúan pero no se practican, empezando por las más chicas.

- **M104 (21/10).** No se pudo bajar el programa: la red de la sesión no llega a fcen.uncuyo.edu.ar y no está en el Drive. Se usaron los temas de los parciales y finales analizados en `docs/parciales/m104.md`. Se agregaron 10 plantillas y 3 fichas, en cuatro lecciones nuevas y una ampliada:
  - **Matrices especiales y ecuaciones matriciales:** clasificar una matriz (simétrica, antisimétrica, ortogonal) y resolver $AX = B$ o $XA = B$. Ficha nueva con la descomposición simétrica + antisimétrica, y la demo de que las ortogonales conservan normas y tienen $\det = \pm1$.
  - **Rango** (en la lección de Gauss), calculado con el mayor menor no nulo y verificado por eliminación.
  - **Coordenadas y cambio de base:** de una base a otra en $\mathbb R^2$ y coordenadas de un polinomio en la base $\{1, x - a, (x - a)^2\}$.
  - **Composición e isomorfismos:** elemento de la matriz de $S\circ T$ (verificado aplicando la composición a los canónicos) y V/F de isomorfismo. Ficha nueva con $[S\circ T] = [S][T]$ y $[T^{-1}] = [T]^{-1}$.
  - **Polinomio característico y multiplicidades:** coeficientes del polinomio (traza, menores principales, determinante; verificado evaluando $\det(A - \lambda I)$ por Gauss) y si una triangular con un autovalor doble es diagonalizable. Ficha nueva con $m_g \le m_a$ y el criterio de diagonalización.

- **F102B (21/10).** Se comparó con el programa 2026. Se agregaron 7 plantillas y 4 fichas:
  - **Motores, heladeras y bombas de calor** (lección nueva en la U4): ciclo de Otto (verificado armando el ciclo con temperaturas) y balances de refrigeradores y bombas de calor. Ficha nueva con la demo de la eficiencia del Otto.
  - **Ondas estacionarias, energía y Doppler** (lección nueva en la U5): armónicos de cuerdas y tubos (verificados buscando las raíces de las condiciones de borde), potencia de una onda en una cuerda (promediando $-F\,y_x\,y_t$) y efecto Doppler (siguiendo dos crestas hasta el observador). Ficha nueva de Doppler.
  - **Refracción en una superficie esférica** (en la lección de lentes): pecera, varilla de vidrio y profundidad aparente, verificadas trazando dos rayos con Snell exacta. Ficha nueva con la demo paraxial.
  - **Criterio de Rayleigh** (en la lección de la rendija), verificado con el primer cero de $\sin$ y de $J_1$. Ficha nueva.

- **M102 (21/10).** Se comparó con el programa 2026. Faltaban superficies paramétricas y área de una superficie (U6.4 y U7.5), Stokes como ejercicio y los diferenciales (U5.10). Se agregaron 4 plantillas y 1 ficha:
  - **Superficies paramétricas y área** (lección nueva en la U6): área de planos, paraboloides, casquetes esféricos y conos (verificada integrando $\|\vec r_u\times\vec r_v\|$ con otra parametrización), y reconocer la superficie de una parametrización (verificado con la ecuación implícita). Ficha nueva con la demo de $dS$.
  - **Stokes** (en la lección de teoremas): circulación por una circunferencia con el rotor, verificada con la integral de línea directa.
  - **Diferencial total** (en la lección del gradiente): cambio aproximado de un volumen, verificado con derivadas numéricas.

- **F102A (21/10).** Se comparó con el programa 2026. Faltaban los dipolos (U1), el campo de una carga en movimiento (U7), los campos eléctricos inducidos, la corriente de desplazamiento y las ecuaciones de Maxwell (U8), y la alterna rectificada, el RLC paralelo y las potencias reactiva y aparente (U9). Se agregaron 7 plantillas y 2 fichas, y se amplió otra plantilla:
  - **Dipolo en un campo uniforme** (en la lección de Coulomb): torque, energía y trabajo para girarlo, verificados con las dos cargas por separado y el trabajo como $\int\tau\,d\theta$. La ficha de campo eléctrico suma la demo de $U = -\vec p\cdot\vec E$.
  - **Campo de una carga en movimiento** (en Biot-Savart), verificado con $\vec B = \vec v\times\vec E/c^2$. La ficha suma de dónde sale a partir de $I\,d\vec l$.
  - **Campos inducidos y ecuaciones de Maxwell** (lección nueva en la U8): campo eléctrico inducido dentro y fuera de un solenoide, corriente de desplazamiento y campo magnético entre las placas de un capacitor, y un V/F de Maxwell. Se verifican con un Biot-Savart en el plano calculado por cuerdas del disco (otro camino que Faraday y Ampère-Maxwell), el flujo de un dipolo magnético integrado sobre una esfera y un RC simulado con RK4. Fichas nuevas de campo eléctrico inducido y de corriente de desplazamiento y ecuaciones de Maxwell.
  - **Potencia y circuitos en paralelo** (lección nueva en la U9): potencias activa, reactiva y aparente, factor de potencia y su corrección con un capacitor (verificados simulando la corriente del motor con RK4, con $Q = \langle v(t)\,i(t + T/4)\rangle$), y RLC paralelo (verificado sumando las corrientes de cada rama en el tiempo). Se ampliaron las fichas de potencia y de RLC.
  - **Rectificada:** la plantilla de valores eficaces suma la onda completa y el valor medio, y la ficha de alterna, la rectificación con su demo.
  - **Exámenes:** las plantillas nuevas entran como alternativas en el 3.er parcial y en el final.

- **M105 (24/10).** No hay programa publicado, así que se comparó con lo que piden el parcial de 2020 y el final de 2021 (`docs/parciales/m105.md`) y con un temario estándar. Se evaluaban sin práctica el muestreo estratificado y sistemático, la regla de Sturges y la asimetría y curtosis numéricas; además faltaban la comparación de dos medias y la inferencia en la regresión. Se agregaron 10 plantillas y 2 fichas, en dos lecciones nuevas y cinco ampliadas:
  - **Muestreo y Sturges** (en la lección 1 de la U1): asignación proporcional (verificada con un sistemático de paso $N/n$ sobre la lista ordenada por estrato), posición y paso del sistemático (recorriendo la lista), y cantidad y ancho de clases (verificada con potencias de 2, sin logaritmos). La ficha de muestreo suma las fórmulas y la demo de que todos tienen probabilidad $n/N$; la de tablas, la regla de Sturges con su demo a partir de la binomial.
  - **Asimetría y curtosis** (en la lección de cuartiles), verificadas con los momentos crudos y la varianza por pares.
  - **Exponencial y uniforme** (en la U4): mediana, percentiles, falta de memoria y la uniforme condicionada, verificadas integrando la densidad con Simpson.
  - **Combinaciones de normales** (en la U5): encastre eje-buje y $P(aX + bY > c)$, verificadas con una convolución numérica. La ficha de conjuntas suma el teorema con su demo por la función generadora de momentos.
  - **Distribución de $S^2$** (en la lección de χ², t y F), verificada integrando la densidad χ².
  - **Comparación de dos medias** (lección nueva en la U7): varianza combinada, $t$ y margen del intervalo (verificados armando datos con esas medias y desvíos y un ANOVA de dos grupos, $F = t^2$), y datos pareados (verificados con $s_x^2 + s_y^2 - 2\,cov$). Ficha nueva con la demo.
  - **Residuos e inferencia para la pendiente** (lección nueva en la U8): $s_e$, error estándar de $b_1$, $t$ e intervalo (verificados con los residuos uno por uno y $t^2 = SC_R/(SC_E/(n-2))$), y un V/F de propiedades de los residuos (verificado recalculándolos o reajustando la recta). Ficha nueva con las ecuaciones normales, $SC_T = SC_R + SC_E$ y $Var(b_1) = \sigma^2/S_{xx}$.
  - **Exámenes:** las plantillas nuevas entran como alternativas en los dos parciales.

- **M106 (24/10).** Se comparó con el programa 2026 y con los exámenes de `docs/parciales/m106.md`. Las fichas ya tenían la teoría, pero faltaba practicar con números las familias de circunferencias y el eje radical, las paramétricas de las cónicas, las tangentes desde un punto exterior, las superficies cilíndricas con generatrices oblicuas, los paralelos de las superficies de revolución, las paramétricas de las cuádricas y los focos de una cónica rotada. Se agregaron 7 plantillas, sin fichas nuevas:
  - **Eje radical y familia de circunferencias** (lección 1 de la U3): pendiente, ordenada al origen y cuerda común, verificadas buscando los puntos de corte sobre la paramétrica de una circunferencia; y el $\lambda$ de la familia que pasa por un punto, verificado con la circunferencia por tres puntos.
  - **Paramétricas de cónicas** (lección 3): distancia focal y excentricidad de elipses e hipérbolas, y el foco de una parábola, verificados con la definición métrica sobre los puntos de la paramétrica.
  - **Tangentes desde un punto exterior** (lección 4), verificadas minimizando la ecuación de la cónica sobre la recta.
  - **Superficies** (U4): la coordenada de un punto de un cilindro oblicuo (verificada bajando por la generatriz con bisección), el radio y el área de un paralelo de una superficie de revolución (verificados bisecando la curva generatriz y girando el punto) e identificar una cuádrica por su paramétrica (verificado con la ecuación canónica en puntos de la parametrización).
  - **Focos de una cónica rotada** (U6), verificados con la propiedad focal en puntos sacados de la ecuación en $x$ e $y$.
  - **Exámenes:** las plantillas nuevas entran como alternativas en los dos parciales y en el final.

## Preguntar (25/10, pedido del usuario)

- **Para qué:** cuando algo no se entiende, poder preguntarlo o pedir otra explicación.
- **Cómo:** botones «No entiendo este paso» en cada paso de las demostraciones, «Preguntar sobre esto» al final de la definición, de «La idea» y de los ejemplos, y «Preguntar sobre este ejercicio» en la corrección. Abren `claude.ai/new?q=…` con la pregunta armada (materia, ficha, la demo entera con el paso marcado, o el enunciado, la respuesta y la resolución del ejercicio) y la copian al portapapeles, por si se prefiere pegarla en otro lado (`askClaude` en `index.html`).
- **Por qué así:** la app es estática y sin servidor; llamar a una IA desde el navegador necesitaría una clave de API, que en un repo público quedaría expuesta. Si más adelante se quiere la respuesta dentro de la app, haría falta una función de Firebase (plan Blaze) que guarde la clave.

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

- **Formas automáticas (15/10).** Se adaptó a JS el reconocedor de Notillas (`src/recognition/`), que vive en `board.js` como `Sh` y se expone en `E.boardShapes`. Si el lápiz queda quieto 500 ms (moviéndose menos de 6 px), el trazo se vuelve una línea (con ajuste a 45°), flecha, arco, círculo, elipse, triángulo, rectángulo, cuadrado o polígono regular. Sin levantar el lápiz, la forma se ajusta: el extremo sigue al lápiz, o la forma escala y rota desde el centro. Se apaga en Ajustes → Pizarra. Tiene tests con trazos «temblorosos».
- **Botón del S Pen, más robusto.**
  - Un clic sin tocar (de menos de 1,5 s) alterna el borrador.
  - Mantenido mientras se escribe, borra solo ese trazo.
  - Si el lápiz sale del alcance, se olvida el estado del botón.
  - El «clic derecho» de respaldo ya no actúa con el lápiz apoyado. Era la causa probable del comportamiento errático: dejar el lápiz quieto disparaba un clic largo que cambiaba de modo.
  - Tampoco actúa si el equipo ya informa el botón al pasar por encima.
- **`setPointerCapture`** puede fallar sin cortar el trazo.

- **Motor de la pizarra del usuario (25/10).** A pedido del usuario, `board.js` pasó a usar el motor de su pizarra (`jsantiago00/pizarra`, React + TypeScript), reescrito en JS sin build. Se conservó lo propio de efecen (una hoja por ejercicio, IndexedDB, botón del S Pen, formas, disposición en la tablet) y se sumó:
  - **Trazo con perfect-freehand** (`assets/vendor/perfect-freehand/`): presión real con lápiz y simulada por velocidad con dedo o mouse (campo `m` del trazo). Las hojas viejas se ven igual, con el trazo nuevo.
  - **Lazo:** seleccionar (cuenta un trazo si el 60 % de sus puntos queda adentro), mover, escalar desde las esquinas, duplicar, cambiar el color y borrar (también con Supr).
  - **Goma por trazo o por área** (la de área recorta los trazos); se elige tocando la goma activa.
  - **Texto** con teclado (tamaño, negrita, color) y **fórmulas** escritas como en la calculadora (`x^2 + sqrt(x)/3`), con botones de símbolos y vista previa. Se pasan a TeX con asciimath2tex y MathJax arma un SVG que se dibuja en el canvas (`assets/vendor/mathjax/tex-svg.js`, 2 MB: se carga recién la primera vez que se usa una fórmula y el service worker lo guarda al usarlo, no se precarga).
  - **Figuras:** ejes cartesianos con cuadrícula y funciones (parser propio, sin eval), y recta numérica, con sus diálogos para editar el rango y las funciones.
  - **Hoja punteada**, **deshacer con un toque de dos dedos** y **exportar** la hoja a PNG o a PDF (un generador de PDF mínimo con una página A4 por imagen JPEG, sin jsPDF).
  - **Barra:** las herramientas, insertar figura, color y grosor (o tocando la herramienta activa), deshacer, rehacer y un menú «⋯» con el tipo de hoja, el dedo, las formas, exportar y borrar la hoja.
  - **Objetos:** `{ c, w, o: { k: "text" | "math" | "axes" | "line", … }, p: rectángulo de 5 puntos }`, así el lazo, la goma, el deshacer y el guardado los tratan como a cualquier trazo. El historial suma la acción `rep` (reemplazar en el mismo lugar).
  - **Tests:** goma por área con deshacer y rehacer, reemplazos, fracción dentro del lazo, guardado de objetos, funciones para graficar y el PDF. En Chromium (tablet de 1280 × 800 y 800 × 1280, celular de 390 × 780): trazo, formas, lazo, goma por área, texto, fórmula, ejes con función, recta numérica, guardado al recargar, tema oscuro, deshacer con dos dedos y exportar. `E.board.debug()` dice qué hay en la hoja.

## Fórmulas en los apuntes

- Las fórmulas destacadas (`$$…$$`) van centradas y numeradas (1), (2)… dentro de cada ficha, con una sola numeración para toda la ficha, así se pueden citar.
- Una fórmula en línea larga (más de ~30 símbolos y con un =, ≤, →…) pasa sola a su propio renglón, numerada. Las cortas no se cortan al final del renglón (`.km`, `nowrap`).
- Si una fórmula numerada no entra en el ancho, `fitEqs` la parte en renglones alineados (`aligned`) en cada signo de relación de primer nivel. Si hace falta, también la parte antes de cada + o −, o deja el lado izquierdo solo. Recién después la achica, hasta el 60 %. Las pocas que no se pueden partir solas están escritas a mano con `aligned`.

## Demostraciones en los apuntes

- El usuario pidió que las fórmulas tengan su deducción (por ejemplo, faltaba cos(a+b)). La ficha `identidades-trig` (M101) ahora tiene la suma y la resta de seno, coseno y tangente, el ángulo doble, sen² y cos² en función de cos 2x, y la demostración de cada una a partir de cos(a−b) (distancia entre dos puntos de la circunferencia unidad).
- **M101:** se agregó la demostración en 22 fichas: identidades trigonométricas, radianes, teorema del factor, conjugado, límites laterales, sustitución directa, límites infinitos, recta tangente, derivación implícita, crecimiento y signo de f′, función inversa, transformaciones, funciones trigonométricas, propiedades del logaritmo, modelos exponenciales, criterio de la segunda derivada, propiedades de la integral, sustitución trigonométrica, fracciones simples, ecuaciones separables, área entre curvas, y volúmenes y longitud de arco. Las que quedan sin demostración son definiciones o recetas: función, indeterminaciones, técnicas de límites trigonométricos, asíntotas, continuidad, tipos de discontinuidad, derivadas sucesivas, composición y optimización.
- **M104:** se agregó la demostración en las 14 fichas que no la tenían; ahora todas las de la materia tienen una.
- **F101:** se agregó la demostración en 18 fichas. Quedan sin ella magnitudes y unidades, cifras significativas y leyes de Newton, que son definiciones o postulados.
- **F102B:** se agregó la demostración en las 13 fichas que no la tenían; ahora todas las de la materia tienen una.
- **M102:** se agregó la demostración en las 22 fichas que no la tenían; ahora todas las de la materia tienen una.
- **Reescritura paso a paso (15/10).** El usuario dijo que las demostraciones no se entendían: encadenaban cuentas sin explicar. Se reescribieron las 144 en pasos numerados («**Paso N.**»), cada uno justificado con palabras. De paso se completaron pruebas que tenían huecos, por ejemplo: la regla de la cadena sin dividir por cero, el TFC, Bolzano por bisección, el resto de Lagrange, Schwarz, Lagrange para el producto vectorial (antes era circular), la recíproca de det ≠ 0 ⇒ inversible y la cota de Carnot por Clausius. El estilo quedó anotado en CLAUDE.md.
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
- **M104, F101, M106, F102B, M102, M105 y F102A:** tienen sus evaluaciones (`content/<código>-examenes.js`), y su análisis está en `docs/parciales/`.
  - **M104:** 1.er y 2.º parcial, y la parte escrita del final regular.
  - **F101:** dos parciales promocionales y el final libre.
  - **M106 (19/10):** 1.er y 2.º parcial, y el examen de promoción, que tiene la misma estructura que el final regular. Se leyeron los parciales y la promoción de 2024, y la promoción y el final de 2025. Hay 9 ejercicios de desarrollo (base ortonormal, haz de planos, eje radical, tangentes en el lado recto, paraboloide, superficie cilíndrica, esfera, cónica en polares con su deducción, cónica rotada e hiperboloide en cilíndricas o esféricas) y una plantilla de examen (`ga-ex-matriz-p`).
  - **F102B (19/10):** los tres parciales (termodinámica, ondas y óptica) y la parte práctica del final regular. Se leyeron los parciales 1 y 3 de 2026, el 2.º de 2025 y el final regular de junio de 2025. Hay 11 ejercicios de desarrollo (ciclos P-V en tres formas y los dos sentidos, entropía, ondas estacionarias, cuerda de guitarra, interferencia con difracción, dos lentes, vela solar) y 9 plantillas de examen. Se verifican con simulaciones: intercambio de calor paso a paso, ecuación del calor discretizada, crestas del Doppler, cuerda con diferencias finitas, intensidad del patrón de rendijas y matrices ABCD.
  - **M102 (19/10):** 1.er y 2.º parcial de regularidad y el final. Se leyeron el 1.er parcial de 2026, el 2.º de 2025, los finales de julio de 2024 y 2025, y el tercer parcial virtual de 2021. Hay 13 ejercicios de desarrollo (serie binomial, tangentes que se cortan, T y N, límites dobles, trazas de cuádricas, plano tangente, puntos críticos, integrales sobre un triángulo, cambio de variables, gradiente de una temperatura, Lagrange con una y dos restricciones, campo conservativo) y 5 plantillas de examen. Los coeficientes de la serie se verifican con la fórmula integral de Cauchy; Lagrange, recorriendo la curva de restricción; Green, con la integral de línea; el flujo, integrando sobre las dos esferas.
  - **M105 (20/10):** en Apunteca solo hay un informe de parcial (2020) y un final práctico (2021), los dos sobre bases de datos reales. Quedaron un 1.er parcial (análisis descriptivo, muestreo estratificado y probabilidad), un 2.º parcial de inferencia armado con las plantillas del temario y el final práctico (intervalos para la varianza y la media a partir de datos, correlación y regresión, y ANOVA por estación), con datos chicos que se pueden calcular a mano. Hay 6 ejercicios de desarrollo, que se verifican con la fórmula de pares para la varianza, el conteo para los cuartiles, la integración de las densidades χ², t y F y la minimización de la suma de cuadrados.
  - **F102A (20/10):** se leyeron los tres parciales de 2022 (cinco problemas de 20 puntos) y el cuestionario del final de febrero de 2022 (diez preguntas). Quedaron los tres parciales (electrostática; circuitos y magnetostática; inducción y alterna) y un final de diez preguntas cortas, cada una sorteada entre dos plantillas. Hay 5 ejercicios de desarrollo (capacitores con una llave, esfera con densidad variable, barra semiinfinita, espira que atraviesa un campo y filtro RLC) y 3 plantillas de examen (esferita frente a una lámina, cilindro con bobina en un plano inclinado y arcos con corriente).
- **Exámenes Extra UBA (26/10).** F101, F102B, F102A, M102, M104 y M105 tienen un «Examen Extra UBA» aparte (id `uba`), sin tocar los parciales y finales que simulan los de la UNCuyo. Se agrega al final de cada `content/<código>-examenes.js` con otra llamada a `E.registerExams`. Cada uno tiene dos problemas de desarrollo nuevos al estilo de los parciales de la UBA (con rúbrica y `verify`) y tres ítems con alternativas tomadas de las plantillas Extra UBA. Los problemas son:
  - **F101:** cohete de dos etapas (cada encendido integrado con RK4) y bolita en un aro que gira (período medido en una simulación);
  - **F102B:** osciladores acoplados débilmente (determinante y simulación hasta el traspaso de energía) y telescopio con resolución (matriz ABCD y el 1,22 como primer cero de J₁);
  - **F102A:** Poynting en un capacitor que se carga (corriente de desplazamiento integrada y derivada numérica de la energía) y coaxial con dieléctrico (ecuación radial resuelta por diferencias finitas);
  - **M102:** diferenciabilidad por definición (cocientes incrementales numéricos) e integral de Gauss de una forma cuadrática (Simpson doble en cartesianas);
  - **M104:** diagonalización unitaria de una hermítica (iteración de potencias en aritmética compleja) y sistema x′ = Ax con un bloque de Jordan (RK4);
  - **M105:** ajuste ponderado de una recta por χ² (gradiente y hessiano numéricos de χ²) y tasa de un contador con Bayes (posterior en una grilla y su cuantil 0,9).
- **Variedad entre intentos:** las partes y los ítems pueden tener `any`, que sortea entre ejercicios de distintos años, y cada materia puede tener **plantillas propias del examen** (`templates` en `E.registerExams`), con corrección automática y `verify`, que no pertenecen a ninguna lección. La suite las prueba como a las demás: tipo, LaTeX, `verify` obligatorio y variedad. Exige además que todas las alternativas de un ítem valgan lo mismo. El 15/10 se leyó una segunda muestra de M101, F101 y M104 (ver «Segunda muestra» en cada `docs/parciales/*.md`).
- **Verificación en desarrollo:** los ejercicios de desarrollo con cuentas llevan `verify`, como las plantillas, y la suite lo corre. Se recalcula por otro camino: simulación del movimiento, integración numérica de fuerzas, Gauss, A·A⁻¹ = I y residuos de A·x = b.
- **Pendiente:** lo que no pasó a la app, anotado al final de cada `docs/parciales/*.md` (por ejemplo, Stokes en M102 y lente con espejo en F102B).

## F104 Física General III (26/10)

- **Temario:** sin programa publicado; sale de los parciales y el final de 2021 (`docs/parciales/f104.md`) y de un temario estándar de física moderna. La relatividad de F101 (dilatación, contracción, Lorentz y energía) se da por vista y se enlaza; F104 suma el intervalo y la causalidad, el Doppler relativista y el cuadrimomento (umbrales y decaimientos).
- **Biblioteca `E.f3`** (primer bloque de `content/f104-fisica3.js`): constantes CODATA (con la constante de Rydberg y el radio de Bohr calculados a partir de ellas), Simpson, bisección, sección áurea, boosts con la rapidez, el método del disparo para la ecuación de Schrödinger (`F.shoot`, `F.eigen`) y la transmisión por un potencial a tramos (`F.transmit`, con ψ complejo integrado desde la onda transmitida).
- **Verificaciones:** boosts armados con la rapidez; pulsos emitidos y recibidos para el Doppler; masa invariante y bisección para umbrales y decaimientos; máximo e integral del espectro de Planck; frenado del fotoelectrón simulado; cuadrimomento conservado en Compton; la órbita de Bohr resuelta en SI (con masa reducida para el deuterio); aceleración relativista simulada para De Broglie; suma de 200 ondas para Davisson-Germer; paquetes gaussianos integrados con derivadas numéricas; autovalores del pozo y del oscilador por disparo; escalón y barrera integrando la ecuación compleja; estados ligados del pozo finito por el teorema de oscilación de Sturm; funciones radiales del hidrógeno integradas con Simpson; y L² armado con matrices escalera.

- **Evaluaciones (`content/f104-examenes.js`):** 1.er parcial (cuántica en una dimensión: dos preguntas conceptuales de 15 puntos, un problema corto y dos de 30: paquete con φ(k) rectangular, y superposición con kets), 2.º parcial (cinco preguntas de hidrógeno y relatividad, y problemas de suma de velocidades o núcleo en una nave, oscilador y orbital 1s o 2p) y final (cinco preguntas de toda la materia; pozo con ⟨x⟩ y ⟨H⟩, relatividad, y virial en el hidrógeno). Los problemas se verifican con la transformada calculada numéricamente, integrales con Simpson, suma de rapideces y boosts.
- **Figuras (`content/f104-figuras.js`):** diagrama de Minkowski con los ejes de otro observador, espectro de Planck, niveles de Bohr con la transición, paquete gaussiano en x y en k, autofunciones del pozo, superposición animada, transmisión por una barrera, oscilador con niveles y autofunciones, y densidades radiales del hidrógeno. No se pudieron mirar en Chromium (en esta compu no está Playwright); la suite las dibuja con el lápiz falso.

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
- Dominios autorizados en Auth: localhost, 127.0.0.1, efecen.com.ar, www.efecen.com.ar, santiagososa.com.ar, www.santiagososa.com.ar y los de Firebase.

## Mejoras del motor y de la práctica (desde el 26/10)

Pedido del usuario: aplicar las mejoras que surgieron de una revisión de la app. Se hacen en la rama `mejoras` (en un worktree aparte, mientras otra sesión sigue con Extra UBA) y se pushean a `main` y a `carrera-fcen` después de cada bloque.

- **Motor en `engine.js`.** El `<script id="engine">` de `index.html` pasó a un archivo propio, que cargan la app y los tests (antes los tests lo recortaban del HTML con una expresión regular). Está en el precache del service worker.
- **Sin `.gitattributes`.** En el repo todo está en LF y Git convierte a CRLF al hacer checkout en Windows (`core.autocrlf`); los avisos «LF will be replaced by CRLF» son solo informativos y no hay diffs fantasma. Forzar `eol=lf` cambiaría la copia de trabajo de otras sesiones sin ganar nada.
- **Escribir la expresión (`expr`).** Antes casi todo se respondía con un número (430 de las ~610 plantillas). Ahora se puede pedir que se escriba una función: la derivada, una primitiva, la solución de una ecuación diferencial, $v(t)$ a partir de $x(t)$, una derivada parcial o el campo a partir del potencial. El parser de `engine.js` (`E.parseExpr`) arma un árbol que sirve para evaluar y para pasar a TeX. La vista previa muestra cómo leyó la app lo que se escribió (si «e^2x» quedó como $e^2x$ o como $e^{2x}$). `E.checkExpr` compara evaluando en 12 puntos fijos del dominio, con tolerancia relativa de $2\cdot10^{-3}$: acepta cualquier forma equivalente, y `0,333x^3` por $x^3/3$, pero no `0,33x^3`. Con `constant: true` (primitivas), alcanza con que la diferencia sea constante. `parseNum` es ahora el caso sin variables del mismo parser y mantiene su comportamiento. Lo nuevo: `sen`, `tg`, `arcsen`, `|x|`, `²`, y `sen(x)^2` es $(\sin x)^2$.
- **Paso a paso (`multi`).** Un problema se responde en etapas, cada una numérica, de expresión o de opción múltiple, con su propio `verify`. Si una etapa sale mal, se muestra la correcta (con la pista, si la hay) y se sigue con la próxima, así los pasos siguientes se practican igual. Cuenta como acierto solo si salen todas.
- **Pistas para errores típicos.** Al equivocarse aparece una pista. `E.diagnose` reconoce errores generales en cualquier ejercicio numérico: el signo, el doble o la mitad, un factor $g$ (solo si el enunciado usa $g = 9{,}8$), grados por radianes, la inversa, el cuadrado o la raíz, un corrimiento de potencias de 10 (unidades) y el redondeo (a menos del 5 %). En las de expresión reconoce el signo, un factor constante y una constante de más. Las plantillas pueden traer además `traps` con los errores propios del tema (por ejemplo, olvidarse la derivada de lo de adentro en la regla de la cadena), y el test verifica que una trampa nunca se acepte como respuesta correcta.
- **Ejercicios nuevos (`content/<código>-practica.js`, con `E.addPractice`):**
  - **M101:** derivadas por reglas, producto y cociente, y cadena; primitivas inmediatas, por sustitución y por partes; ecuaciones separables (verificadas con RK4); optimización (cerca contra una pared y caja sin tapa: primero se escribe la función, después el punto crítico y el valor) y área entre una parábola y una recta.
  - **F101:** $v(t)$ y $a(t)$ a partir de $x(t)$; velocidad y aceleración en el MAS (verificadas simulando el oscilador); plano inclinado con rozamiento (la normal, el rozamiento y la aceleración, verificada integrando las fuerzas en ejes fijos); tiro oblicuo (verificado con eventos de RK4); choque plástico seguido de frenado (con el centro de masa y la energía en el sistema del centro de masa).
  - **M102:** derivadas parciales, y aproximación con el plano tangente en tres pasos.
  - **F102A:** el campo a partir del potencial; un circuito de dos fuentes por nodos (verificado por mallas); carga de un capacitor (verificada integrando el circuito).
  - **F102B:** hielo en agua en tres pasos (verificado por bisección del balance de calor).
- **Mapa de temas (Estadísticas).** Cada concepto de cada unidad aparece como un chip: verde (firme, 80 % o más de acierto), amarillo (en camino), rojo (flojo, menos de 60 %) o gris (sin datos), con borde punteado si se practicó menos de 3 veces. Al tocarlo se practica ese tema. En «Temas débiles», el botón «Practicar lo más flojo» arma una sesión de 8 ejercicios con los 4 temas más flojos de la materia.
- **Reportar un error.** En la corrección de cada ejercicio y al final de cada apunte hay un botón que abre un issue de GitHub ya armado: materia, plantilla y semilla (con el `efecenDebug.preview(…)` para reproducirlo), el enunciado, la respuesta de la app y lo que respondió la persona. Los `verify` controlan los números, pero no el texto de la teoría ni de los enunciados: esto cubre lo que los tests no ven.
- **Sin carga diferida de las materias (medido el 26/10).** Con Playwright y la CPU frenada (como un celular de gama media), el arranque con la app en caché tarda: ×1, DOMContentLoaded ≈ 70 ms y ejecución de JS ≈ 26 ms; ×4, ≈ 340 ms y ≈ 100 ms; ×6, ≈ 490 ms y ≈ 150 ms, con 2,9 MB de contenido. Cargar cada materia recién al abrirla ahorraría como mucho una parte de esos 100 ms. A cambio, rompería los links y alias entre materias, el buscador de Aprender y el ejercicio del día, que usan todas las materias. Conviene revisarlo si con ×4 el arranque pasa de 1 s, por ejemplo cuando estén 3.º y 4.º año.
- **Trampas en plantillas viejas (primera tanda):** derivada de raíz y logaritmo sin la derivada de lo de adentro (M101), varianza dividiendo por $n$ (M105), tiempo de vuelo hasta la altura máxima y altura sin la inicial (F101), plano inclinado sin rozamiento o con el rozamiento sumado (F101), Coulomb con $1/r$ (F102A), resistencias todas en serie (F102A), capacitores combinados como resistencias (F102A) y despeje de la ecuación de lentes con suma (F102B).
- **Pendiente de esta parte:** más trampas en las plantillas más usadas de cada materia, y más paso a paso en F102A, F102B y M104.

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
- **`id` propio en el manifest.** El celu y la tablet decían que la app ya estaba instalada aunque no se veía. Sin `id`, Chrome identifica la PWA por su `start_url`, y un WebAPK viejo con esa identidad bloquea la instalación. Pasa, por ejemplo, si solo se sacó el ícono de la pantalla de inicio, porque eso no la desinstala. Primero se agregó `"id": "efecen-app"`, y después se cambió a `"id": "/efecen/"`, explícito y dentro de su carpeta. Ojo: Chrome resuelve el `id` contra el origen, no contra `start_url`. Por eso la app «A Juegar», con `"id": "./"`, quedó registrada en la tablet con id `https://santiagososa.com.ar/`, que es la raíz de todo el dominio, y es la sospechosa de que efecen figure como «ya instalada». Además se agregó una sección «Instalar la app» en Ajustes. Ahí aparece un botón cuando el navegador ofrece la instalación (`beforeinstallprompt`) y, si no, las instrucciones, incluido cómo desinstalar la versión fantasma. No cambiar ese `id`: cambiarlo crea otra app distinta. **Mudanza a efecen.com.ar (26/10):** con el dominio propio la app está en la raíz de otro origen, que ya es otra app para el navegador, así que el `id` pasó a `"/"`. La versión instalada desde santiagososa.com.ar hay que desinstalarla e instalar la nueva; el progreso vuelve con el login de Google (localStorage es por origen).
- **Orden de los apuntes (24/10, pedido del usuario).** En Aprender, cada unidad lista sus fichas en el orden del recorrido de las lecciones (`c.cardOrder`, que arma `indexCourse`), no en el orden en que están escritas en el archivo. En M101 salían primero las fichas «herramienta» del MVP (radianes, identidades, factorizar, conjugado) y después las del programa. Un test chequea que el orden respete las lecciones. Además, en M101:
  - la lección «Regla de la cadena» pasó antes que «Trigonométricas, exp y ln», que ya pedía derivar tan(4x) o x² sen(2x), y los ejercicios de «Reglas básicas» y de «Producto y cociente» ya no usan la cadena (k·sen x en lugar de sen(kx), y eˣ en lugar de e^{kx});
  - las demostraciones que usaban temas de lecciones posteriores se rehicieron con lo ya visto: la derivada del coseno, de ln x y de aˣ por definición, la potencia real con límites, la integral de funciones pares e impares con sumas de Riemann y el modelo exponencial sin derivadas; el «por qué en grados queda feo» de radianes pasó como ejemplo a la ficha de la regla de la cadena;
  - en los apuntes de cada lección, las fichas que se presentan ahí van en «Leelos en este orden» y las de lecciones anteriores (por ejemplo, «Función, dominio e imagen» en Continuidad) pasan a «Para repasar», con la lección y la unidad donde se vieron (`c.cardFirstLesson`); antes se listaban todas juntas y parecían temas nuevos;
  - quedan solo anticipos marcados a propósito: la derivada de la tangente avisa que usa el cociente de la lección siguiente, y «f′ > 0 implica que f crece» remite al teorema de Lagrange.
- **Orientación libre.** En `manifest.json`, `orientation` pasó de `portrait` a `any`, para poder usar la tablet acostada con la pizarra al costado. En la app instalada, Chrome toma el cambio cuando actualiza el ícono instalado, y eso puede tardar.

## Pendiente (en el orden del trayecto)

La pausa del 14/10 terminó el 18/10. M106 quedó hecha el 19/10.

Las evaluaciones de M106, F102B y M102 quedaron hechas el 19/10.

1. **Q101 Química General** (pedido del usuario, 26/10: que la app sirva también a quien cursa Química o Biología). Faltan las unidades 4 a 9 (estados de agregación, soluciones, cinética, equilibrio, ácidos y bases, electroquímica), las evaluaciones y el Extra UBA. Al hacer la unidad 9, enlazar `qg-redox` desde la ficha `qg-balanceo`.
2. **Resto de 3.º año**, en el orden del trayecto: M103 Cálculo III, M203 Álgebra Lineal, F203 Mecánica, M209 Matemática Especial I y F205 Termodinámica.
3. **Extra UBA de F104** (Física 4 de la UBA) cuando se retome esa tabla.
4. **Extra UBA de M106:** sin equivalente directo en la UBA; queda para después.

Ideas sueltas: sumar plantillas de tipo «unir» y «encontrá el error» en Física, y gráficos de x(t) y v(t) en cinemática.

**Elegir la carrera (26/10, pedido del usuario).** Para que la app sirva también a quien cursa Química o Biología, `content/carrera.js` registra las cuatro orientaciones (`fis`, `mat`, `qui`, `bio`) con todas las materias del plan, salvo Inglés, Informática, electivas y Seminario. Cada cuenta elige la suya en Inicio (la primera vez) o en Ajustes, y se guarda en `S.career` (con `careerAt`, para que en `merge` gane la elegida último). Inicio, La carrera, Aprender y Ajustes muestran solo esas materias; sin elegir, queda Física. En Biología, Elementos de Cálculo y las tres Elementos de Física se repasan con nuestras materias completas (`via`). Química usa el trayecto del plan nuevo (Ord. 8/2023); de Biología no hay trayecto publicado y van el ciclo básico y el orientado en el orden del plan.

**Pizarras que vencen (26/10, pedido del usuario).** Cada hoja guarda la fecha de su última edición (`u`) y, al abrir la pizarra, se borran las que no cambiaron en 7 días. El menú «Más opciones» lo avisa, junto a exportar. Sigue el tope de 80 hojas.

**Otras orientaciones (26/10, pedido del usuario).** [docs/orientaciones.md](docs/orientaciones.md) compara Física, Matemática, Química y Biología: materias, horas y temarios, con los programas 2024-2026. Es para elegir qué cursar; por ahora no se suma contenido a la app. Las carpetas de programas son públicas: se listan con `https://drive.google.com/embeddedfolderview?id=<carpeta>` y se bajan con `https://drive.google.com/uc?export=download&id=<archivo>`.

## Fuentes de los temarios

- **Q101 Química General:** programa oficial 2025, en la carpeta «Primer semestre 2025» de [Programas de las materias](https://fcen.uncuyo.edu.ar/programas-de-las-materias) (Drive, id `176j1bRUNS2GDxQOBChAnngwyfo7F2dT_`). 9 unidades: estructura atómica y tabla periódica, enlace, estequiometría, estados de agregación, soluciones, cinética, equilibrio, ácidos y bases, electroquímica.
- **M101 Cálculo I:** programa oficial 2026 (prof. Romina Calvo), en la carpeta «Programas 2026, 2.º semestre» de [Programas de las materias](https://fcen.uncuyo.edu.ar/programas-de-las-materias).
- **M104 Introducción al Álgebra Lineal:** [programa 2020](https://fcen.uncuyo.edu.ar/upload/programa-ial-2020-def.pdf).
- **F101 Física General I:** [programa 2021](https://fcen.uncuyo.edu.ar/upload/fisica-general-i-2021.pdf).
- **M102 Cálculo II:** programa oficial 2026 (prof. Fernanda Massut), en la carpeta de programas 2026 de [Programas de las materias](https://fcen.uncuyo.edu.ar/programas-de-las-materias) (Drive, id `1fk1ekCbqvSeZW7QsuRLCluEq4qAS84jW`).
- **M106 Geometría Analítica:** programa oficial 2026 (prof. Silvia Raichman), Drive, id `1zJG9qufZgWfBU6f1gS-BFlFjg1Yy7PVN`. 6 unidades: vectores, planos y rectas, cónicas, superficies, coordenadas polares/cilíndricas/esféricas y ecuación general de segundo grado.
- **M105 Probabilidad y Estadística:** no se encontró el programa. Se usó un temario estándar de un primer curso, en 8 unidades: estadística descriptiva, probabilidad, variables discretas, variables continuas, conjuntas y distribuciones muestrales, estimación, pruebas de hipótesis (con χ² y ANOVA) y regresión y correlación. Se contrastó con los temas del final de febrero de 2021 que está en Apunteca.
- **F102A Física General II A:** programa oficial 2026 (prof. Rubén Santos), Drive, id `1BxA2eBt5T1-dD9DsLp7OTR9daGUVkvwi`. 9 unidades: carga y campo eléctrico, potencial, capacitancia y dieléctricos, corriente y resistencia, circuitos de CC, campo magnético, fuentes de campo magnético, inducción y corriente alterna.
- **F102B Física General II B:** programa oficial 2026, en la carpeta de programas 2026 de [Programas de las materias](https://fcen.uncuyo.edu.ar/programas-de-las-materias) (Drive, id `16hZ72EbvPHfhWjXEY54p2Vi6ThuxTNvt`).
- **Plan de estudios y trayecto sugerido:** el que indicó el usuario, consistente con la [distribución curricular](https://fcen.uncuyo.edu.ar/distribucion-curricular) de la facultad.
- **Extra UBA de F101:** guías de Física 1 de Cs. Físicas (FCEN-UBA), 1.er cuatrimestre de 2023: prácticas 4 (oscilaciones y estabilidad), 5 (sistemas no inerciales), 10 (gravitación) y 13 (relatividad, optativa). Están en la carpeta local de bibliografía, en `Física 1/03 - Ejercicios/F1 - Guía de ejs (2023)`.
- **Extra UBA de F102B:** guías de Física 2 de Cs. Físicas (FCEN-UBA), 2.º cuatrimestre de 2011: 1 (oscilaciones libres, forzadas y acopladas, y modos de cuerdas y tubos), 3 (óptica geométrica), 4 (polarización) y 5 (interferencia y difracción). Están en `Física 2/02 - Ejercicios/Guia de Ejercicios (2011)`. Los parciales recientes están escaneados y no se usaron.
- **Extra UBA de M105:** parciales de Métodos Estadísticos en Física Experimental (MEFE, optativa de Cs. Físicas, FCEN-UBA) de 2015 y 2019 en PDF con texto, y los apuntes de la cátedra (Monte Carlo, valor p, cinturón de confianza), en `Optativas/Métodos Estadísticos en Física Experimental (MEFE)`.
- **Extra UBA de M104:** guías de Matemática 2 de Cs. Físicas (FCEN-UBA): prácticas 0 a 6, de sistemas a espacios con producto interno, pasando por la forma de Jordan (`Matemática 2/03 - Ejercicios/Guias de mate 2.pdf`), y parciales de 2021 y 2025 en PDF con texto.
- **Extra UBA de M102:** parciales y finales de Análisis I (Matemática 1) de Cs. Físicas (FCEN-UBA), 2021-2023, en PDF con texto (por ejemplo, el 2.º parcial del 1.er cuatrimestre de 2023 y el final del 10/12/2021), en `Matemática 1 [Análisis 1]`.
- **Extra UBA de F102A:** guías de Física 3 de Cs. Físicas (FCEN-UBA) de 2013 y 2014: 1 (electrostática), 3 (corrientes estacionarias y Thévenin), 4 (magnetostática y medios magnéticos) y 5 (campos variables). También las preguntas de final de la cátedra Dmitruk (2025-2026). Están en `Física 3/03 - Ejercicios/Guia de Ejercicios (2014)` y en `Física 3/05 - Finales`.

De los programas solo se tomó la lista de temas. Todo el texto y todos los ejercicios son originales.
