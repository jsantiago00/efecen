/*
 * Apuntes de Cálculo: fichas de teoría navegables con hipervínculos.
 * ------------------------------------------------------------------
 * Cada ficha:
 *   group     sección del índice ("herramientas", "limites", "continuidad", "derivadas")
 *   title     nombre visible
 *   aliases   términos que, si aparecen en un ejercicio o resolución, se vuelven link a esta ficha
 *   concepts  conceptos del curso que explica (para "Practicar este tema" y los links del feedback)
 *   summary   una línea (índice y cabecera)
 *   def / idea / demo / tips   bloques: texto (con $LaTeX$, **negrita**, <br>) o { graph, caption } / { svg, caption }
 *   examples  [{ q, steps: [...] }]
 *   see       ids de fichas relacionadas
 * Links explícitos dentro del texto:  [[id]]  o  [[id|texto visible]]
 *
 * Todo el texto es original.
 */
(function () {
  const E = window.Efecen;
  const R = String.raw;

  // Figura para la demostración de sen x / x (circunferencia de radio 1, x ≈ 40°)
  const UNIT_CIRCLE = `<svg viewBox="0 0 236 200" class="fig" role="img" aria-label="Circunferencia unitaria con los triángulos OAP y OAT y el sector OAP">
    <path d="M30 175 L190 175 L190 40.7 Z" style="fill:var(--gold);opacity:.3"/>
    <path d="M30 175 L190 175 A160 160 0 0 0 152.6 72.2 Z" style="fill:var(--primary);opacity:.18"/>
    <path d="M30 175 L190 175 L152.6 72.2 Z" style="fill:var(--primary);opacity:.3"/>
    <path d="M190 175 A160 160 0 0 0 30 15" style="fill:none;stroke:var(--muted);stroke-width:1.5"/>
    <path d="M22 175 H206 M30 183 V10" style="stroke:var(--muted);stroke-width:1.2"/>
    <path d="M30 175 L190 40.7" style="stroke:currentColor;stroke-width:2"/>
    <path d="M152.6 72.2 V175" style="stroke:var(--primary);stroke-width:3"/>
    <path d="M190 175 V40.7" style="stroke:var(--fire);stroke-width:3"/>
    <path d="M62 175 A32 32 0 0 0 54.5 154.4" style="fill:none;stroke:currentColor;stroke-width:1.5"/>
    <g style="fill:currentColor;font:700 13px Nunito,sans-serif">
      <text x="16" y="193">O</text><text x="186" y="193">A</text><text x="146" y="64">P</text><text x="196" y="40">T</text>
      <text x="68" y="166" style="font-style:italic">x</text><text x="104" y="192">1</text>
      <text x="118" y="132" style="fill:var(--primary)">sen x</text>
      <text x="196" y="112" style="fill:var(--fire)">tan x</text>
    </g></svg>`;

  const cards = {
    /* ========================= HERRAMIENTAS ========================= */
    "funcion": {
      group: "herramientas", title: "Función, dominio e imagen", aliases: ["dominio"], concepts: ["graficos"],
      summary: "Una regla que a cada x del dominio le asigna un único valor f(x).",
      def: [R`Una **función** $f: A \to B$ es una regla que a cada elemento $x$ del conjunto $A$ (el **dominio**) le asigna **un único** elemento $f(x)$ de $B$. El conjunto de valores que efectivamente toma se llama **imagen**.`],
      idea: [R`Pensala como una máquina: entra $x$, sale $f(x)$. Para calcular [[limite|límites]] o [[derivada|derivadas]] importa mucho **dónde está definida**: por ejemplo $\frac{1}{x-2}$ no está definida en $x=2$ y $\sqrt{x}$ solo existe para $x \ge 0$.`,
        R`Las familias básicas tienen gráficos que conviene reconocer de un vistazo: $x^2$ es una parábola, $|x|$ una V, $\frac1x$ tiene [[asintotas|asíntotas]], $\sqrt x$ y $\ln x$ arrancan en un punto y crecen cada vez más lento, $e^x$ crece muy rápido y $\sin x$ oscila. Sumar una constante afuera sube o baja el gráfico; cambiar $x$ por $x - c$ lo corre $c$ a la derecha.`],
      examples: [{ q: R`¿Cuál es el dominio de $f(x)=\dfrac{\sqrt{x+3}}{x-1}$?`, steps: [R`La raíz pide $x+3\ge 0$, o sea $x \ge -3$.`, R`El denominador no puede ser $0$: $x \ne 1$.`, R`Dominio: $[-3, 1)\cup(1, +\infty)$.`] }],
      see: ["limite", "continuidad", "grafico-derivada"]
    },
    "radian": {
      group: "herramientas", title: "Radianes", aliases: ["radianes", "radián"], concepts: ["lim-trig", "der-trig"],
      summary: "La medida natural de los ángulos: el largo del arco en la circunferencia de radio 1.",
      def: [R`Un ángulo mide $x$ **radianes** si, en una circunferencia de radio $1$, el arco que abarca mide $x$. Una vuelta entera es $2\pi$, así que $180^\circ = \pi$ y $1^\circ = \frac{\pi}{180}$.`],
      idea: [R`Los límites y las derivadas de funciones trigonométricas **solo dan "lindo" en radianes**. El [[lim-trig-notable|límite notable]] $\frac{\sin x}{x} \to 1$ sale de comparar el arco (que mide $x$) con el seno, y eso funciona porque el arco mide exactamente $x$. En grados daría $\frac{\pi}{180}$ y todas las [[derivadas-trig|derivadas trigonométricas]] arrastrarían ese factor.`],
      examples: [{ q: R`Pasá $135^\circ$ a radianes.`, steps: [R`Multiplicamos por $\frac{\pi}{180^\circ}$: $135\cdot\frac{\pi}{180} = \frac{3\pi}{4}$.`] }],
      see: ["lim-trig-notable", "identidades-trig"]
    },
    "identidades-trig": {
      group: "herramientas", title: "Identidades trigonométricas útiles", aliases: ["identidad pitagórica", "identidades trigonométricas"], concepts: ["lim-trig", "der-trig"],
      summary: "sen² + cos² = 1, tan = sen/cos y ángulo doble: las que más se usan en cálculo.",
      def: [R`$$\sin^2 x + \cos^2 x = 1 \qquad \tan x = \frac{\sin x}{\cos x} \qquad \sec x = \frac{1}{\cos x}$$`,
        R`$$\sin(2x) = 2\sin x\cos x \qquad \cos(2x) = \cos^2 x - \sin^2 x = 1 - 2\sin^2 x$$`,
        R`$$\sin(a+b) = \sin a\cos b + \cos a\sin b$$`],
      idea: [R`La primera es Pitágoras en la circunferencia de radio $1$: el punto $(\cos x, \sin x)$ está a distancia $1$ del origen. En límites aparece mucho como $1 - \cos^2 x = \sin^2 x$, al multiplicar por el [[conjugado]] $1+\cos x$.`],
      examples: [{ q: R`Simplificá $\dfrac{1-\cos^2 x}{\sin x}$.`, steps: [R`Por la identidad pitagórica, $1-\cos^2 x = \sin^2 x$.`, R`$\dfrac{\sin^2 x}{\sin x} = \sin x$ (para $\sin x \neq 0$).`] }],
      see: ["lim-1-cos", "derivadas-trig", "radian"]
    },
    "factorizar": {
      group: "herramientas", title: "Factorizar polinomios", aliases: ["factorizamos", "factorizar", "factorizando", "Ruffini"], concepts: ["lim-factorizar"],
      summary: "Si r es raíz de p(x), entonces (x − r) divide a p(x).",
      def: [R`**Teorema del factor:** si $p(r) = 0$, entonces $p(x) = (x - r)\,q(x)$ para algún polinomio $q$ de un grado menos. El cociente $q$ sale dividiendo, por ejemplo con la regla de **Ruffini**.`,
        R`Para una cuadrática con raíces $r_1, r_2$: $\;x^2 + bx + c = (x - r_1)(x - r_2)$, con $r_1 + r_2 = -b$ y $r_1 r_2 = c$.`],
      idea: [R`Es la herramienta clave para la [[indeterminacion|indeterminación]] $\frac{0}{0}$ en cocientes de polinomios: si al sustituir $x=a$ arriba y abajo da $0$, entonces $a$ es raíz de los dos, así que **los dos tienen el factor $(x-a)$**, que se cancela.`],
      examples: [{ q: R`Factorizá $x^2 - x - 6$.`, steps: [R`Buscamos dos números que sumen $1$ (porque $-b = 1$) y multipliquen $-6$: son $3$ y $-2$.`, R`$x^2 - x - 6 = (x-3)(x+2)$.`, R`Chequeo: $(x-3)(x+2) = x^2 + 2x - 3x - 6$ ✓.`] }],
      tips: [R`Error típico con los signos: si las raíces son $3$ y $-2$, los factores son $(x-3)$ y $(x+2)$. **La raíz va con el signo cambiado.**`],
      see: ["indeterminacion", "conjugado"]
    },
    "conjugado": {
      group: "herramientas", title: "Multiplicar por el conjugado", aliases: ["conjugado"], concepts: ["lim-conjugado"],
      summary: "(A − B)(A + B) = A² − B²: sirve para sacar raíces del numerador.",
      def: [R`El **conjugado** de $A - B$ es $A + B$. Su producto es una diferencia de cuadrados: $$(A-B)(A+B) = A^2 - B^2.$$`],
      idea: [R`Si $A = \sqrt{\text{algo}}$, al elevar al cuadrado la raíz desaparece. Por eso, en un límite $\frac{\sqrt{g(x)} - c}{x - a}$ que da [[indeterminacion|indeterminación]] $\frac{0}{0}$, multiplicamos **arriba y abajo** por $\sqrt{g(x)} + c$ (eso es multiplicar por $1$, no cambia nada). El numerador queda $g(x) - c^2$ y aparece el factor $(x-a)$ para cancelar.`,
        R`Mismo truco con $1 - \cos x$: su conjugado es $1 + \cos x$ y el producto da $1 - \cos^2 x = \sin^2 x$ (ver [[lim-1-cos]]).`],
      examples: [{ q: R`Calculá $\displaystyle\lim_{x\to 4}\frac{\sqrt{x}-2}{x-4}$.`, steps: [R`Sustituyendo queda $\frac{0}{0}$.`, R`Multiplicamos por $\frac{\sqrt{x}+2}{\sqrt{x}+2}$: el numerador es $(\sqrt x)^2 - 2^2 = x - 4$.`, R`Queda $\dfrac{x-4}{(x-4)(\sqrt{x}+2)} = \dfrac{1}{\sqrt{x}+2}$ para $x\neq 4$.`, R`Sustituimos: $\dfrac{1}{2+2} = \dfrac14$.`] }],
      see: ["indeterminacion", "lim-1-cos"]
    },

    /* ========================= LÍMITES ========================= */
    "limite": {
      group: "limites", title: "Límite de una función", aliases: ["definición de límite", "límite bilateral"], concepts: ["lim-grafico", "lim-sustitucion"],
      summary: "f(x) se acerca a L cuando x se acerca a a, sin importar qué pasa justo en a.",
      def: [R`Decimos que $\displaystyle\lim_{x\to a} f(x) = L$ si podemos hacer que $f(x)$ esté **tan cerca de $L$ como queramos** tomando $x$ suficientemente cerca de $a$, **con $x \ne a$**.`,
        R`**Versión formal ($\varepsilon$-$\delta$):** para todo $\varepsilon > 0$ existe $\delta > 0$ tal que $$0 < |x - a| < \delta \implies |f(x) - L| < \varepsilon.$$`],
      idea: [R`El límite mira lo que pasa **alrededor** de $a$, no en $a$. Por eso una función puede tener límite en un punto donde no está definida, o donde vale otra cosa:`,
        { graph: { fns: [x => x / 2 + 1], points: [{ x: 2, y: 2, open: true }, { x: 2, y: -1 }], xr: [-3, 5], yr: [-3, 4] }, caption: R`Acá $\lim_{x\to 2} f(x) = 2$ aunque $f(2) = -1$.` },
        R`El límite existe si y solo si existen los [[limites-laterales|límites laterales]] y son iguales.`],
      demo: [R`**Una prueba con $\varepsilon$-$\delta$:** veamos que $\lim_{x\to 1}(3x+2) = 5$.`,
        R`Dado $\varepsilon>0$ queremos $|3x + 2 - 5| < \varepsilon$, o sea $3|x - 1| < \varepsilon$.`,
        R`Alcanza con $\delta = \varepsilon/3$: si $|x-1| < \delta$, entonces $|f(x) - 5| = 3|x-1| < 3\delta = \varepsilon$. $\blacksquare$`],
      examples: [{ q: R`Si $f(x) = \dfrac{x^2-1}{x-1}$, ¿existe $\lim_{x\to1} f(x)$?`, steps: [R`$f$ no está definida en $x=1$, pero eso no importa para el límite.`, R`Para $x\ne1$: $\dfrac{(x-1)(x+1)}{x-1} = x+1$.`, R`Entonces $\lim_{x\to1} f(x) = 2$.`] }],
      see: ["limites-laterales", "algebra-limites", "sustitucion", "indeterminacion"]
    },
    "limites-laterales": {
      group: "limites", title: "Límites laterales", aliases: ["límites laterales", "límite lateral", "laterales", "por izquierda", "por derecha"], concepts: ["lim-laterales", "lim-grafico"],
      summary: "Acercarse a a solo desde la izquierda (x < a) o solo desde la derecha (x > a).",
      def: [R`$\displaystyle\lim_{x\to a^-} f(x)$ es el límite tomando solo $x < a$ (**por izquierda**), y $\displaystyle\lim_{x\to a^+} f(x)$ tomando solo $x > a$ (**por derecha**).`,
        R`**Teorema:** $\displaystyle\lim_{x\to a} f(x) = L$ si y solo si los dos laterales existen y valen $L$.`],
      idea: [R`Son clave en funciones **a trozos**, donde de cada lado vale una fórmula distinta. Si los laterales no coinciden hay un salto y el límite no existe.`,
        { graph: { pieces: [{ f: x => x + 1, to: 1 }, { f: x => x - 2, from: 1 }], points: [{ x: 1, y: 2, open: true }, { x: 1, y: -1 }], xr: [-3, 5], yr: [-4, 4] }, caption: R`Por izquierda tiende a $2$, por derecha a $-1$: el límite en $x=1$ no existe.` }],
      examples: [{ q: R`Si $f(x)=\begin{cases} 2x+1 & x<1\\ x^2+2 & x\ge 1\end{cases}$, ¿existe $\lim_{x\to1}f(x)$?`, steps: [R`Por izquierda vale $2x+1$, que tiende a $3$.`, R`Por derecha vale $x^2+2$, que tiende a $3$.`, R`Coinciden: el límite existe y vale $3$.`] }],
      see: ["limite", "discontinuidades"]
    },
    "algebra-limites": {
      group: "limites", title: "Propiedades de los límites", aliases: ["propiedades de los límites", "álgebra de límites"], concepts: ["lim-sustitucion"],
      summary: "El límite de una suma, producto o cociente es la suma, producto o cociente de los límites (si existen).",
      def: [R`Si $\displaystyle\lim_{x\to a} f(x) = L$ y $\displaystyle\lim_{x\to a} g(x) = M$ son números, entonces:`,
        R`$$\lim (f \pm g) = L \pm M \qquad \lim (f\cdot g) = L\cdot M \qquad \lim \frac{f}{g} = \frac{L}{M}\ \ (\text{si } M \neq 0)$$`,
        R`y también $\lim c\,f = c\,L$, $\;\lim f^n = L^n$ y $\lim \sqrt[n]{f} = \sqrt[n]{L}$ (cuando la raíz tiene sentido).`],
      idea: [R`Estas reglas justifican la [[sustitucion|sustitución directa]] en polinomios y cocientes. **Ojo:** la del cociente solo vale si $M \ne 0$. Si $L = M = 0$ estamos ante una [[indeterminacion|indeterminación]] y hay que trabajar más.`],
      demo: [R`**Suma:** dado $\varepsilon > 0$, elegimos $\delta_1$ con $|f(x) - L| < \varepsilon/2$ y $\delta_2$ con $|g(x) - M| < \varepsilon/2$.`,
        R`Con $\delta = \min(\delta_1, \delta_2)$ y la desigualdad triangular: $|f + g - (L+M)| \le |f - L| + |g - M| < \varepsilon$. $\blacksquare$`],
      see: ["limite", "sustitucion"]
    },
    "sustitucion": {
      group: "limites", title: "Sustitución directa", aliases: ["sustitución directa", "sustituir", "sustituimos", "sustituyendo", "alcanza con sustituir"], concepts: ["lim-sustitucion"],
      summary: "Si f es continua en a, el límite es simplemente f(a).",
      def: [R`Si $f$ es [[continuidad|continua]] en $a$, entonces $\displaystyle\lim_{x\to a} f(x) = f(a)$: alcanza con **reemplazar $x$ por $a$**.`,
        R`Son continuas en todo su dominio: polinomios, cocientes de polinomios (donde el denominador no se anula), raíces, $\sin$, $\cos$, $e^x$, $\ln x$, y sumas, productos, cocientes y composiciones de ellas.`],
      idea: [R`**Siempre probá sustituir primero.** Puede pasar una de tres cosas:`,
        R`1. Da un número: ese es el límite.<br>2. Da $\frac{k}{0}$ con $k \ne 0$: es un [[limites-infinitos|límite infinito]] (mirá los signos).<br>3. Da $\frac{0}{0}$, $\frac{\infty}{\infty}$, etc.: es una [[indeterminacion|indeterminación]] y hay que transformar la expresión.`],
      examples: [{ q: R`Calculá $\displaystyle\lim_{x\to 2}\frac{x^2+1}{x+3}$.`, steps: [R`En $x=2$ el denominador vale $5 \neq 0$: la función es continua ahí.`, R`Sustituimos: $\dfrac{4+1}{5} = 1$.`] }],
      see: ["algebra-limites", "indeterminacion", "continuidad"]
    },
    "indeterminacion": {
      group: "limites", title: "Indeterminaciones", aliases: ["indeterminación", "indeterminaciones", "indeterminado", "forma indeterminada"], concepts: ["lim-factorizar", "lim-conjugado"],
      summary: "0/0, ∞/∞, ∞ − ∞, 0·∞…: expresiones cuyo límite depende del caso.",
      def: [R`Una **forma indeterminada** es una expresión como $\frac{0}{0}$, $\frac{\infty}{\infty}$, $\infty - \infty$, $0\cdot\infty$, $1^\infty$, $0^0$ o $\infty^0$ que aparece al sustituir y que **no determina** el valor del límite: según la función, puede dar cualquier cosa.`],
      idea: [R`Mirá estos tres límites, todos de la forma $\frac00$ en $x = 0$: $$\lim_{x\to 0}\frac{2x}{x} = 2 \qquad \lim_{x\to 0}\frac{x^2}{x} = 0 \qquad \lim_{x\to 0}\frac{x}{x^2}\ \text{no existe}$$ Por eso "$\frac00$" no es un resultado: es una señal de que hay que **transformar la expresión**.`,
        R`Herramientas según el caso: [[factorizar|factorizar y cancelar]], multiplicar por el [[conjugado]], usar los [[lim-trig-notable|límites notables]] o dividir por la mayor potencia en los [[limites-al-infinito|límites al infinito]]. (Más adelante, la regla de L'Hôpital.)`],
      examples: [{ q: R`Calculá $\displaystyle\lim_{x\to 3}\frac{x^2-9}{x-3}$.`, steps: [R`Sustituyendo queda $\frac{0}{0}$: indeterminado.`, R`[[factorizar|Factorizamos]]: $x^2 - 9 = (x-3)(x+3)$.`, R`Cancelamos $(x-3)$ y queda $x + 3 \to 6$.`] }],
      tips: [R`¿Por qué se puede cancelar? Porque el [[limite]] no mira $x = a$: para $x \neq a$ las dos expresiones son **iguales**, así que tienen el mismo límite.`],
      see: ["factorizar", "conjugado", "lim-trig-tecnicas"]
    },
    "sandwich": {
      group: "limites", title: "Teorema del sándwich", aliases: ["teorema del sándwich", "sándwich", "teorema de encaje"], concepts: ["lim-trig"],
      summary: "Si g ≤ f ≤ h y g, h tienden al mismo L, entonces f también tiende a L.",
      def: [R`Si cerca de $a$ (salvo quizás en $a$) vale $$g(x) \le f(x) \le h(x)$$ y $\displaystyle\lim_{x\to a} g(x) = \lim_{x\to a} h(x) = L$, entonces $\displaystyle\lim_{x\to a} f(x) = L$.`],
      idea: [R`$f$ queda "apretada" entre dos funciones que van al mismo lugar: no le queda otra que ir ahí también. Es la herramienta para límites donde no se puede despejar nada, como el [[lim-trig-notable|límite notable]] $\frac{\sin x}{x}$.`,
        { graph: { fns: [x => x * x * Math.sin(1 / x), x => x * x, x => -x * x], xr: [-1, 1], yr: [-1, 1] }, caption: R`En violeta, $x^2\sin(1/x)$; en naranja y verde, $\pm x^2$. Queda apretada y tiende a $0$.` }],
      demo: [R`Dado $\varepsilon > 0$, para $x$ suficientemente cerca de $a$ tenemos $L - \varepsilon < g(x)$ y $h(x) < L + \varepsilon$.`,
        R`Entonces $L - \varepsilon < g(x) \le f(x) \le h(x) < L + \varepsilon$, o sea $|f(x) - L| < \varepsilon$. $\blacksquare$`],
      examples: [{ q: R`Calculá $\displaystyle\lim_{x\to 0} x^2 \sin\!\left(\frac1x\right)$.`, steps: [R`No se puede sustituir: $\sin(1/x)$ oscila y no tiene límite.`, R`Pero $-1 \le \sin(1/x) \le 1$, así que $-x^2 \le x^2\sin(1/x) \le x^2$.`, R`Como $\pm x^2 \to 0$, por el sándwich el límite es $0$.`] }],
      see: ["lim-trig-notable", "limite"]
    },
    "lim-trig-notable": {
      group: "limites", title: "El límite notable sen x / x", aliases: ["límite notable", "límites notables"], concepts: ["lim-trig"],
      summary: "lim (x→0) sen(x)/x = 1: la base de todos los límites trigonométricos.",
      def: [R`$$\lim_{x\to 0}\frac{\sin x}{x} = 1$$ con $x$ medido en [[radian|radianes]]. Más en general, si $u(x) \to 0$ (y $u \neq 0$ cerca): $$\lim \frac{\sin u}{u} = 1.$$`],
      idea: [R`Para $x$ chico, **$\sin x \approx x$**: el seno y el arco casi coinciden. El gráfico de $\frac{\sin x}{x}$ no está definido en $0$, pero se acerca a $1$ por los dos lados:`,
        { graph: { fns: [x => Math.sin(x) / x], points: [{ x: 0, y: 1, open: true }], xr: [-10, 10], yr: [-1, 2] }, caption: R`$y = \frac{\sin x}{x}$, con el agujero en $(0, 1)$.` },
        R`Al sustituir queda $\frac{0}{0}$, una [[indeterminacion|indeterminación]], y no hay nada que factorizar. Por eso hace falta una demostración geométrica.`],
      demo: [R`Tomamos $0 < x < \frac{\pi}{2}$ en la circunferencia de radio $1$, con $P = (\cos x, \sin x)$, $A = (1, 0)$ y $T$ el punto donde la recta tangente en $A$ corta la recta $OP$:`,
        { svg: UNIT_CIRCLE, caption: R`Triángulo $OAP$ ⊂ sector $OAP$ ⊂ triángulo $OAT$.` },
        R`Comparando áreas: $$\underbrace{\tfrac12\sin x}_{\triangle OAP} \;\le\; \underbrace{\tfrac12 x}_{\text{sector}} \;\le\; \underbrace{\tfrac12\tan x}_{\triangle OAT}$$ El área del sector es $\frac{x}{2}$ justamente porque $x$ está en [[radian|radianes]].`,
        R`Dividimos por $\frac12 \sin x > 0$: $\;1 \le \dfrac{x}{\sin x} \le \dfrac{1}{\cos x}$. Invirtiendo (se dan vuelta las desigualdades): $$\cos x \le \frac{\sin x}{x} \le 1.$$`,
        R`Como $\cos x \to 1$ cuando $x\to 0$, por el [[sandwich|teorema del sándwich]] $\frac{\sin x}{x} \to 1$ por derecha. Por izquierda es lo mismo, porque $\frac{\sin x}{x}$ es par: $\frac{\sin(-x)}{-x} = \frac{\sin x}{x}$. $\blacksquare$`],
      examples: [
        { q: R`Calculá $\displaystyle\lim_{x\to 0}\frac{\sin(5x)}{x}$.`, steps: [R`Para usar el límite notable necesitamos **el mismo argumento abajo**: $5x$.`, R`Multiplicamos y dividimos por $5$: $\dfrac{\sin(5x)}{x} = 5\cdot\dfrac{\sin(5x)}{5x}$.`, R`Con $u = 5x \to 0$, $\dfrac{\sin u}{u} \to 1$. El límite es $5$.`] },
        { q: R`Calculá $\displaystyle\lim_{x\to 0}\frac{\tan x}{x}$.`, steps: [R`$\tan x = \frac{\sin x}{\cos x}$, así que $\dfrac{\tan x}{x} = \dfrac{\sin x}{x}\cdot\dfrac{1}{\cos x}$.`, R`El primer factor tiende a $1$ y el segundo a $\frac{1}{1} = 1$.`, R`Resultado: $1$.`] }
      ],
      tips: [R`**Solo vale si el argumento tiende a $0$.** Por ejemplo $\lim_{x\to\infty}\frac{\sin x}{x} = 0$ (no $1$): ahí el seno queda acotado y $x$ crece.`,
        R`El argumento del seno y el denominador tienen que ser **exactamente iguales**: $\frac{\sin 3x}{3x} \to 1$, pero $\frac{\sin 3x}{x} \to 3$.`],
      see: ["lim-trig-tecnicas", "lim-1-cos", "sandwich", "radian", "derivadas-trig"]
    },
    "lim-1-cos": {
      group: "limites", title: "El límite notable (1 − cos x)/x²", aliases: ["uno menos coseno"], concepts: ["lim-trig"],
      summary: "lim (x→0) (1 − cos x)/x² = 1/2, y (1 − cos x)/x → 0.",
      def: [R`$$\lim_{x\to 0}\frac{1 - \cos x}{x^2} = \frac{1}{2} \qquad\qquad \lim_{x\to 0}\frac{1-\cos x}{x} = 0$$`],
      idea: [R`Para $x$ chico, $\cos x \approx 1 - \frac{x^2}{2}$ (es el comienzo de su serie de Taylor), así que $1 - \cos x \approx \frac{x^2}{2}$.`],
      demo: [R`Multiplicamos y dividimos por el [[conjugado]] $1 + \cos x$ y usamos la [[identidades-trig|identidad pitagórica]]: $$\frac{1-\cos x}{x^2} = \frac{1-\cos^2 x}{x^2(1+\cos x)} = \frac{\sin^2 x}{x^2}\cdot\frac{1}{1+\cos x}.$$`,
        R`Reescribimos como $\left(\dfrac{\sin x}{x}\right)^2 \cdot \dfrac{1}{1+\cos x}$, que tiende a $1^2\cdot\dfrac{1}{2} = \dfrac{1}{2}$ por el [[lim-trig-notable|límite notable]]. $\blacksquare$`,
        R`El segundo sale del primero: $\dfrac{1-\cos x}{x} = x\cdot\dfrac{1-\cos x}{x^2} \to 0\cdot\frac12 = 0$.`],
      examples: [{ q: R`Calculá $\displaystyle\lim_{x\to 0}\frac{1-\cos(4x)}{x^2}$.`, steps: [R`Queremos $(4x)^2$ abajo: $\dfrac{1-\cos 4x}{x^2} = 16\cdot\dfrac{1-\cos 4x}{(4x)^2}$.`, R`Con $u = 4x \to 0$: $\dfrac{1-\cos u}{u^2}\to\dfrac12$.`, R`Resultado: $16\cdot\frac12 = 8$.`] }],
      see: ["lim-trig-notable", "conjugado", "lim-trig-tecnicas"]
    },
    "lim-trig-tecnicas": {
      group: "limites", title: "Cómo resolver límites trigonométricos", aliases: ["límites trigonométricos", "límite trigonométrico"], concepts: ["lim-trig"],
      summary: "Receta: sustituí, y si da 0/0 armá los límites notables con el argumento correcto.",
      def: [R`Los dos resultados que se usan todo el tiempo (con $u \to 0$): $$\frac{\sin u}{u} \to 1 \qquad\qquad \frac{1-\cos u}{u^2} \to \frac12$$ Sus demostraciones están en [[lim-trig-notable]] y [[lim-1-cos]].`],
      idea: [R`**Receta en 4 pasos:**`,
        R`1. **Sustituí.** Si no da una indeterminación, listo: las trigonométricas son [[continuidad|continuas]].<br>2. Pasá todo a $\sin$ y $\cos$ ($\tan = \frac{\sin}{\cos}$, etc.).<br>3. **Armá el argumento:** por cada $\sin(\square)$, hacé aparecer el mismo $\square$ en el denominador, multiplicando y dividiendo.<br>4. Reemplazá cada cociente notable por su límite y operá con lo que sobra.`,
        R`Multiplicar y dividir por lo mismo es multiplicar por $1$: no cambia la función, solo la escribe de forma que se vea el límite notable.`],
      examples: [
        { q: R`Calculá $\displaystyle\lim_{x\to 0}\frac{\sin(3x)}{\sin(7x)}$.`, steps: [R`Sustituyendo queda $\frac00$.`, R`Armamos los dos notables: $\dfrac{\sin 3x}{\sin 7x} = \dfrac{\sin 3x}{3x}\cdot\dfrac{7x}{\sin 7x}\cdot\dfrac{3x}{7x}$.`, R`Los dos primeros factores tienden a $1$, y $\dfrac{3x}{7x} = \dfrac37$.`, R`Resultado: $\dfrac{3}{7}$.`] },
        { q: R`Calculá $\displaystyle\lim_{x\to 0}\frac{x\tan x}{1-\cos x}$.`, steps: [R`Da $\frac00$. Pasamos a seno y coseno: $\dfrac{x\sin x}{\cos x\,(1-\cos x)}$.`, R`Dividimos arriba y abajo por $x^2$: $\dfrac{\frac{\sin x}{x}}{\cos x\cdot\frac{1-\cos x}{x^2}}$.`, R`Tiende a $\dfrac{1}{1\cdot\frac12} = 2$.`] }
      ],
      tips: [R`Error típico: "$\frac{\sin 3x}{\sin 7x} = \frac{3}{7}$ porque se simplifica el seno". ¡Una función no se simplifica! Acá el resultado coincide de casualidad, pero el razonamiento está mal: con $x \to \frac{\pi}{2}$ da $\frac{-1}{-1} = 1$, no $\frac37$.`],
      see: ["lim-trig-notable", "lim-1-cos", "identidades-trig"]
    },
    "limites-infinitos": {
      group: "limites", title: "Límites infinitos", aliases: ["límite infinito", "límites infinitos"], concepts: ["lim-infinitos"],
      summary: "Cuando el denominador tiende a 0 y el numerador no, el cociente se va a ±∞.",
      def: [R`$\displaystyle\lim_{x\to a} f(x) = +\infty$ significa que $f(x)$ se hace **más grande que cualquier número** cuando $x$ se acerca a $a$. Formalmente: para todo $M > 0$ existe $\delta > 0$ tal que $0<|x-a|<\delta \implies f(x) > M$.`],
      idea: [R`Si al [[sustitucion|sustituir]] queda $\frac{k}{0}$ con $k \ne 0$, el cociente "explota". El **signo** sale de mirar el signo de $k$ y el de lo que tiende a $0$ de cada lado:`,
        R`$x - a \to 0^+$ si $x \to a^+$, y $x - a \to 0^-$ si $x\to a^-$. En cambio $(x-a)^2 \to 0^+$ siempre.`,
        { graph: { fns: [x => 1 / (x - 1)], asym: { x: [1] }, xr: [-4, 6], yr: [-5, 5] }, caption: R`$\frac{1}{x-1}$ tiende a $-\infty$ por izquierda y a $+\infty$ por derecha.` }],
      examples: [{ q: R`Calculá $\displaystyle\lim_{x\to 2^-}\frac{3}{x-2}$.`, steps: [R`Si $x \to 2^-$, entonces $x < 2$ y $x - 2 \to 0^-$.`, R`Positivo sobre negativo muy chico: $-\infty$.`] }],
      tips: [R`Decir que el límite "es $+\infty$" es una forma de decir que **no existe** como número, pero describe cómo no existe.`],
      see: ["asintotas", "limites-laterales"]
    },
    "limites-al-infinito": {
      group: "limites", title: "Límites al infinito", aliases: ["límite al infinito", "límites al infinito", "mayor potencia", "coeficientes principales"], concepts: ["lim-infinito"],
      summary: "En cocientes de polinomios mandan los términos de mayor grado.",
      def: [R`$\displaystyle\lim_{x\to\infty} f(x) = L$ si $f(x)$ se acerca a $L$ cuando $x$ crece sin cota. El resultado básico es $\displaystyle\lim_{x\to\infty}\frac{1}{x^k} = 0$ para $k > 0$.`],
      idea: [R`Para un cociente de polinomios $\frac{p(x)}{q(x)}$, **dividimos todo por la mayor potencia del denominador**:`,
        R`• Si el grado de $p$ es menor que el de $q$, el límite es $0$.<br>• Si los grados son iguales, da el cociente de los **coeficientes principales**.<br>• Si el grado de $p$ es mayor, tiende a $\pm\infty$.`],
      demo: [R`Con $p(x) = a_n x^n + \dots$ y $q(x) = b_n x^n + \dots$ (mismo grado), dividimos por $x^n$: $$\frac{a_n + \frac{a_{n-1}}{x} + \dots}{b_n + \frac{b_{n-1}}{x} + \dots} \to \frac{a_n}{b_n}$$ porque cada $\frac{c}{x^k} \to 0$.`],
      examples: [{ q: R`Calculá $\displaystyle\lim_{x\to\infty}\frac{4x^2 - x}{2x^2 + 5}$.`, steps: [R`Dividimos por $x^2$: $\dfrac{4 - \frac1x}{2 + \frac{5}{x^2}}$.`, R`Tiende a $\dfrac{4}{2} = 2$.`] }],
      see: ["asintotas", "indeterminacion"]
    },
    "asintotas": {
      group: "limites", title: "Asíntotas", aliases: ["asíntota", "asíntotas", "asíntota vertical", "asíntota horizontal"], concepts: ["lim-asintotas"],
      summary: "Rectas a las que el gráfico se pega: verticales (límite infinito) y horizontales (límite al infinito).",
      def: [R`La recta $x = a$ es **asíntota vertical** de $f$ si alguno de los [[limites-laterales|límites laterales]] en $a$ es $\pm\infty$.`,
        R`La recta $y = L$ es **asíntota horizontal** si $\displaystyle\lim_{x\to+\infty} f(x) = L$ o $\displaystyle\lim_{x\to-\infty} f(x) = L$.`],
      idea: [R`En una función racional, las verticales están en los ceros del denominador **que no anulan también el numerador** (si lo anulan, puede ser una [[discontinuidades|discontinuidad evitable]]). Las horizontales salen de los [[limites-al-infinito|límites al infinito]].`,
        { graph: { fns: [x => (2 * x + 1) / (x - 1)], asym: { x: [1], y: [2] }, xr: [-6, 6], yr: [-5, 8] }, caption: R`$\frac{2x+1}{x-1}$, con asíntotas $x=1$ e $y=2$.` }],
      examples: [{ q: R`Encontrá las asíntotas de $f(x) = \dfrac{2x+1}{x-1}$.`, steps: [R`Vertical: el denominador se anula en $x=1$ y el numerador vale $3 \ne 0$, así que $x = 1$ es asíntota.`, R`Horizontal: los grados son iguales, $\lim_{x\to\pm\infty} f = \frac21 = 2$, así que $y = 2$.`] }],
      see: ["limites-infinitos", "limites-al-infinito"]
    },

    /* ========================= CONTINUIDAD ========================= */
    "continuidad": {
      group: "continuidad", title: "Continuidad", aliases: ["continua", "continuas", "continuidad"], concepts: ["continuidad"],
      summary: "f es continua en a si lim (x→a) f(x) = f(a): se dibuja sin levantar el lápiz.",
      def: [R`$f$ es **continua en $a$** si se cumplen tres cosas: $f(a)$ está definida, $\lim_{x\to a} f(x)$ existe y $$\lim_{x\to a} f(x) = f(a).$$`,
        R`$f$ es continua en un intervalo si lo es en cada punto (en los extremos, con [[limites-laterales|límites laterales]]).`],
      idea: [R`Intuitivamente: el gráfico no tiene saltos, agujeros ni asíntotas en ese tramo. Es exactamente la condición que permite la [[sustitucion|sustitución directa]].`],
      examples: [{ q: R`¿Qué valor de $k$ hace continua a $f(x)=\begin{cases} x + k & x<2\\ x^2 & x\ge 2\end{cases}$?`, steps: [R`Solo hay que revisar $x=2$ (cada trozo es un polinomio).`, R`Por izquierda el límite es $2 + k$. Por derecha (y $f(2)$) vale $4$.`, R`Igualamos: $2 + k = 4 \Rightarrow k = 2$.`] }],
      see: ["discontinuidades", "bolzano", "derivable-continua"]
    },
    "discontinuidades": {
      group: "continuidad", title: "Tipos de discontinuidad", aliases: ["discontinuidad", "discontinuidades", "evitable", "de salto"], concepts: ["continuidad"],
      summary: "Evitable (agujero), de salto (laterales distintos) o infinita (asíntota).",
      def: [R`Si $f$ no es continua en $a$, la discontinuidad puede ser:`,
        R`• **Evitable:** el límite existe pero no coincide con $f(a)$, o $f(a)$ no existe. Se arregla redefiniendo un punto.<br>• **De salto:** los [[limites-laterales|límites laterales]] existen pero son distintos.<br>• **Infinita:** algún lateral es $\pm\infty$ (hay [[asintotas|asíntota vertical]]).`],
      idea: [{ graph: { fns: [x => x / 2 + 1], points: [{ x: 2, y: 2, open: true }], xr: [-3, 5], yr: [-2, 4] }, caption: R`Evitable: un agujero en $x = 2$.` },
        { graph: { pieces: [{ f: () => 1, to: 0 }, { f: () => -1, from: 0 }], points: [{ x: 0, y: 1 }, { x: 0, y: -1, open: true }], xr: [-4, 4], yr: [-3, 3] }, caption: R`De salto en $x = 0$.` }],
      examples: [{ q: R`¿Qué discontinuidad tiene $\dfrac{x^2-4}{x-2}$ en $x=2$?`, steps: [R`No está definida en $2$, pero $\dfrac{(x-2)(x+2)}{x-2} = x+2 \to 4$.`, R`El límite existe: es **evitable** (definiendo $f(2)=4$ queda continua).`] }],
      see: ["continuidad", "asintotas"]
    },
    "bolzano": {
      group: "continuidad", title: "Teorema de Bolzano y del valor intermedio", aliases: ["Bolzano", "valor intermedio"], concepts: ["bolzano"],
      summary: "Una función continua que cambia de signo en [a, b] tiene una raíz en el medio.",
      def: [R`**Bolzano:** si $f$ es [[continuidad|continua]] en $[a,b]$ y $f(a)\cdot f(b) < 0$, existe $c \in (a,b)$ con $f(c) = 0$.`,
        R`**Valor intermedio** (generalización): si $f$ es continua en $[a,b]$, toma **todos** los valores entre $f(a)$ y $f(b)$.`],
      idea: [R`Si arrancás abajo del eje y terminás arriba **sin levantar el lápiz**, en algún momento cruzaste el eje. Las dos hipótesis importan: sin continuidad se puede "saltar" el cero, como $\frac1x$ en $[-1,1]$.`],
      demo: [R`Idea de la prueba (bisección): partimos $[a,b]$ a la mitad y nos quedamos con la mitad donde sigue habiendo cambio de signo. Repitiendo, los intervalos se achican hacia un punto $c$. Por continuidad, $f(c)$ es límite de valores positivos y también de valores negativos, así que $f(c) = 0$. La prueba completa usa la completitud de $\mathbb{R}$.`],
      examples: [{ q: R`¿Tiene $x^3 + x - 1$ una raíz en $(0,1)$?`, steps: [R`Es un polinomio, así que es continua.`, R`$f(0) = -1 < 0$ y $f(1) = 1 > 0$.`, R`Por Bolzano, sí: existe $c \in (0,1)$ con $f(c) = 0$.`] }],
      tips: [R`Si $f(a)$ y $f(b)$ tienen el **mismo** signo, Bolzano no dice nada: puede haber raíces o no.`],
      see: ["continuidad"]
    },

    /* ========================= DERIVADAS ========================= */
    "derivada": {
      group: "derivadas", title: "Derivada", aliases: ["cociente incremental", "definición de derivada", "usando la definición", "derivada por definición"], concepts: ["der-definicion"],
      summary: "f'(a) = lim (h→0) [f(a+h) − f(a)]/h: la pendiente de la recta tangente.",
      def: [R`$$f'(a) = \lim_{h\to 0}\frac{f(a+h) - f(a)}{h}$$ si ese límite existe. La expresión de adentro es el **cociente incremental**.`],
      idea: [R`El cociente incremental es la pendiente de la recta secante que pasa por $(a, f(a))$ y $(a+h, f(a+h))$. Cuando $h \to 0$, la secante gira hasta la [[recta-tangente|recta tangente]]: $f'(a)$ es su pendiente. En física, si $f$ es la posición, $f'$ es la velocidad instantánea.`],
      demo: [R`**Ejemplo:** derivada de $f(x) = x^2$ por definición.`,
        R`$\dfrac{(x+h)^2 - x^2}{h} = \dfrac{2xh + h^2}{h} = 2x + h$ (para $h\neq0$).`,
        R`Tomando $h \to 0$: $f'(x) = 2x$. $\blacksquare$`],
      examples: [{ q: R`¿Qué es el límite $\displaystyle\lim_{h\to 0}\frac{(3+h)^2 - 9}{h}$?`, steps: [R`Es la definición de $f'(3)$ con $f(x) = x^2$ (porque $f(3) = 9$).`, R`Como $f'(x) = 2x$, vale $6$.`] }],
      tips: [R`Al calcular por definición, **nunca reemplaces $h=0$ antes de cancelar**: daría $\frac00$, una [[indeterminacion|indeterminación]].`],
      see: ["recta-tangente", "derivable-continua", "regla-potencia"]
    },
    "derivable-continua": {
      group: "derivadas", title: "Derivable implica continua", aliases: ["derivable", "derivabilidad", "no es derivable"], concepts: ["der-continuidad"],
      summary: "Toda función derivable es continua; la recíproca es falsa (|x| en 0).",
      def: [R`**Teorema:** si $f$ es derivable en $a$, entonces $f$ es [[continuidad|continua]] en $a$.`, R`La recíproca es **falsa**: $|x|$ es continua en $0$ pero no es derivable ahí.`],
      idea: [R`Una función no es derivable en $a$ cuando tiene un **pico** (pendientes laterales distintas), una **tangente vertical** (como $\sqrt[3]{x}$ en $0$) o una **discontinuidad**.`,
        { graph: { fns: [x => Math.abs(x)], xr: [-4, 4], yr: [-1, 4] }, caption: R`$|x|$ tiene pendiente $-1$ a la izquierda y $1$ a la derecha.` }],
      demo: [R`Para $x \ne a$: $$f(x) - f(a) = \frac{f(x) - f(a)}{x - a}\cdot(x - a).$$`,
        R`Cuando $x \to a$, el primer factor tiende a $f'(a)$ y el segundo a $0$, así que $f(x) - f(a) \to f'(a)\cdot 0 = 0$, o sea $\lim_{x\to a} f(x) = f(a)$. $\blacksquare$`],
      examples: [{ q: R`¿Es derivable $|x|$ en $0$?`, steps: [R`El cociente $\dfrac{|h| - 0}{h}$ vale $1$ si $h > 0$ y $-1$ si $h < 0$.`, R`Los [[limites-laterales|límites laterales]] son distintos: no existe $f'(0)$.`] }],
      see: ["derivada", "continuidad"]
    },
    "regla-potencia": {
      group: "derivadas", title: "Regla de la potencia", aliases: ["regla de la potencia", "término a término"], concepts: ["der-potencia"],
      summary: "(xⁿ)' = n·xⁿ⁻¹ para cualquier exponente real; la derivada es lineal.",
      def: [R`$$(x^n)' = n\,x^{n-1} \qquad\text{para todo } n \in \mathbb{R}$$ Además la derivada es **lineal**: $(a f + b g)' = a f' + b g'$, así que los polinomios se derivan **término a término**.`],
      idea: [R`Vale también con exponentes negativos o fraccionarios, reescribiendo: $\frac{1}{x^3} = x^{-3}$ y $\sqrt{x} = x^{1/2}$.`],
      demo: [R`Para $n$ natural, por el binomio de Newton: $(x+h)^n = x^n + n x^{n-1}h + (\text{términos con } h^2)$.`,
        R`Entonces $\dfrac{(x+h)^n - x^n}{h} = n x^{n-1} + h\cdot(\dots) \to n x^{n-1}$. $\blacksquare$ Para exponente real se prueba más adelante con $x^n = e^{n\ln x}$.`],
      examples: [{ q: R`Derivá $f(x) = 3x^4 - \dfrac{2}{x^2} + \sqrt{x}$.`, steps: [R`Reescribimos: $3x^4 - 2x^{-2} + x^{1/2}$.`, R`$f'(x) = 12x^3 + 4x^{-3} + \frac12 x^{-1/2} = 12x^3 + \dfrac{4}{x^3} + \dfrac{1}{2\sqrt{x}}$.`] }],
      tips: [R`Con exponente negativo, el exponente igual **baja** en uno: $(x^{-2})' = -2x^{-3}$, no $-2x^{-1}$.`],
      see: ["derivada", "regla-producto"]
    },
    "regla-producto": {
      group: "derivadas", title: "Regla del producto", aliases: ["regla del producto"], concepts: ["der-producto"],
      summary: "(uv)' = u'v + uv'.",
      def: [R`$$(u\,v)' = u'\,v + u\,v'$$`],
      idea: [R`Pensalo como un rectángulo de lados $u$ y $v$: si los dos lados crecen un poquito, el área crece en dos franjas, $u'v$ y $uv'$ (el cuadradito de la esquina es despreciable). **Ojo:** $(uv)' \neq u'v'$.`],
      demo: [R`Sumamos y restamos $u(x+h)v(x)$: $$\frac{u(x+h)v(x+h) - u(x)v(x)}{h} = u(x+h)\,\frac{v(x+h)-v(x)}{h} + v(x)\,\frac{u(x+h)-u(x)}{h}.$$`,
        R`Cuando $h\to0$: $u(x+h)\to u(x)$, porque $u$ es [[derivable-continua|derivable y por lo tanto continua]], y los cocientes tienden a $v'$ y $u'$. $\blacksquare$`],
      examples: [{ q: R`Derivá $f(x) = x^2\sin x$.`, steps: [R`$u = x^2$, $u' = 2x$; $\;v = \sin x$, $v' = \cos x$.`, R`$f'(x) = 2x\sin x + x^2\cos x$.`] }],
      see: ["regla-cociente", "regla-cadena"]
    },
    "regla-cociente": {
      group: "derivadas", title: "Regla del cociente", aliases: ["regla del cociente"], concepts: ["der-cociente"],
      summary: "(u/v)' = (u'v − uv')/v².",
      def: [R`$$\left(\frac{u}{v}\right)' = \frac{u'\,v - u\,v'}{v^2} \qquad (v \neq 0)$$`],
      idea: [R`Para acordarse del orden: **"la de arriba derivada por la de abajo, menos la de arriba por la de abajo derivada, todo sobre la de abajo al cuadrado"**. El orden importa por el signo menos.`],
      demo: [R`Escribimos $\frac{u}{v} = u\cdot v^{-1}$ y usamos la [[regla-producto|regla del producto]] y la [[regla-cadena|de la cadena]]: $$\left(u v^{-1}\right)' = u' v^{-1} + u\cdot\left(-v^{-2}v'\right) = \frac{u'v - uv'}{v^2}. \;\blacksquare$$`],
      examples: [{ q: R`Derivá $f(x) = \dfrac{x}{x^2+1}$.`, steps: [R`$u' = 1$ y $v' = 2x$.`, R`$f'(x) = \dfrac{1\cdot(x^2+1) - x\cdot 2x}{(x^2+1)^2} = \dfrac{1 - x^2}{(x^2+1)^2}$.`] }],
      tips: [R`Errores típicos: invertir el orden del numerador, u olvidarse de elevar al cuadrado el denominador.`],
      see: ["regla-producto", "derivadas-trig"]
    },
    "derivadas-trig": {
      group: "derivadas", title: "Derivadas trigonométricas", aliases: ["derivadas trigonométricas", "derivada del seno", "derivada del coseno"], concepts: ["der-trig"],
      summary: "(sen x)' = cos x, (cos x)' = −sen x, (tan x)' = sec² x.",
      def: [R`$$(\sin x)' = \cos x \qquad (\cos x)' = -\sin x \qquad (\tan x)' = \sec^2 x$$ $$(\sec x)' = \sec x\tan x \qquad (\cot x)' = -\csc^2 x$$ Todo con $x$ en [[radian|radianes]].`],
      idea: [R`La pendiente del seno en cada punto es el valor del coseno: en $x = 0$ el seno sube con pendiente $1 = \cos 0$, y en $x = \frac\pi2$ está en su máximo, con pendiente $0 = \cos\frac\pi2$.`,
        { graph: { fns: [x => Math.sin(x), x => Math.cos(x)], xr: [-7, 7], yr: [-2, 2] }, caption: R`En violeta $\sin x$, en naranja su derivada $\cos x$.` }],
      demo: [R`Por definición y con la fórmula del [[identidades-trig|seno de una suma]]: $$\frac{\sin(x+h) - \sin x}{h} = \sin x\,\frac{\cos h - 1}{h} + \cos x\,\frac{\sin h}{h}.$$`,
        R`Por los límites notables, $\frac{\sin h}{h}\to 1$ ([[lim-trig-notable]]) y $\frac{\cos h - 1}{h}\to 0$ ([[lim-1-cos]]). Queda $(\sin x)' = \cos x$. $\blacksquare$`,
        R`Las demás salen de esta: $\cos x = \sin(\frac\pi2 - x)$, y $\tan = \frac{\sin}{\cos}$ con la [[regla-cociente|regla del cociente]].`],
      examples: [{ q: R`Derivá $\tan x$ usando que $\tan x = \frac{\sin x}{\cos x}$.`, steps: [R`$\left(\dfrac{\sin x}{\cos x}\right)' = \dfrac{\cos x\cos x - \sin x\,(-\sin x)}{\cos^2 x}$.`, R`$= \dfrac{\cos^2 x + \sin^2 x}{\cos^2 x} = \dfrac{1}{\cos^2 x} = \sec^2 x$.`] }],
      see: ["lim-trig-notable", "regla-cadena", "identidades-trig"]
    },
    "exp-log": {
      group: "derivadas", title: "Exponencial y logaritmo", aliases: ["exponencial", "logaritmo", "número e"], concepts: ["der-explog"],
      summary: "(eˣ)' = eˣ y (ln x)' = 1/x.",
      def: [R`$$(e^x)' = e^x \qquad (\ln x)' = \frac{1}{x} \quad (x>0)$$ Más en general, $(a^x)' = a^x \ln a$.`],
      idea: [R`El **número $e \approx 2{,}718$** es justamente la base para la cual la exponencial es su propia derivada: su pendiente en cada punto es igual a su altura. Dicho de otra forma, $\displaystyle\lim_{h\to0}\frac{e^h - 1}{h} = 1$.`],
      demo: [R`**$e^x$:** $\dfrac{e^{x+h} - e^x}{h} = e^x\cdot\dfrac{e^h - 1}{h} \to e^x \cdot 1$.`,
        R`**$\ln x$:** como $e^{\ln x} = x$, derivando con la [[regla-cadena|regla de la cadena]] queda $e^{\ln x}\cdot(\ln x)' = 1$, o sea $x\,(\ln x)' = 1$. $\blacksquare$`],
      examples: [{ q: R`Derivá $f(x) = 3e^x - 2\ln x$ y evaluá en $x=1$.`, steps: [R`$f'(x) = 3e^x - \dfrac{2}{x}$.`, R`$f'(1) = 3e - 2 \approx 6{,}15$.`] }],
      see: ["regla-cadena", "regla-potencia"]
    },
    "regla-cadena": {
      group: "derivadas", title: "Regla de la cadena", aliases: ["regla de la cadena", "cadena"], concepts: ["der-cadena"],
      summary: "(f(g(x)))' = f'(g(x))·g'(x): derivada de afuera por derivada de adentro.",
      def: [R`$$\big(f(g(x))\big)' = f'\big(g(x)\big)\cdot g'(x)$$ En notación de Leibniz, con $y = f(u)$ y $u = g(x)$: $\;\dfrac{dy}{dx} = \dfrac{dy}{du}\cdot\dfrac{du}{dx}$.`],
      idea: [R`Si $u$ cambia $g'$ veces más rápido que $x$, e $y$ cambia $f'$ veces más rápido que $u$, entonces $y$ cambia $f'\cdot g'$ veces más rápido que $x$: como dos engranajes.`,
        R`**Receta:** identificá la función de afuera y la de adentro. Derivá la de afuera **dejando la de adentro igual**, y multiplicá por la derivada de la de adentro. Si hay más capas, se repite.`],
      demo: [R`Idea, cuando $g(x+h) \neq g(x)$ para $h$ chico: $$\frac{f(g(x+h)) - f(g(x))}{h} = \frac{f(g(x+h)) - f(g(x))}{g(x+h) - g(x)}\cdot\frac{g(x+h) - g(x)}{h}.$$`,
        R`Con $k = g(x+h) - g(x) \to 0$ (porque $g$ es continua), el primer factor tiende a $f'(g(x))$ y el segundo a $g'(x)$. $\blacksquare$ La prueba completa evita dividir por $0$ con una función auxiliar.`],
      examples: [
        { q: R`Derivá $(x^2+1)^5$.`, steps: [R`Afuera: $u^5$. Adentro: $u = x^2 + 1$.`, R`$5(x^2+1)^4\cdot 2x = 10x(x^2+1)^4$.`] },
        { q: R`Derivá $\sin^2(3x)$.`, steps: [R`Hay tres capas: $(\cdot)^2$, $\sin(\cdot)$ y $3x$.`, R`$2\sin(3x)\cdot\cos(3x)\cdot 3 = 6\sin(3x)\cos(3x)$.`] }
      ],
      tips: [R`Error típico: olvidarse de multiplicar por $g'(x)$, o derivar lo de adentro y dejarlo adentro: $(\sin(x^2))' = 2x\cos(x^2)$, **no** $\cos(2x)$.`],
      see: ["regla-producto", "derivadas-trig", "implicita"]
    },
    "recta-tangente": {
      group: "derivadas", title: "Recta tangente", aliases: ["recta tangente"], concepts: ["der-tangente"],
      summary: "y = f(a) + f'(a)(x − a).",
      def: [R`La recta tangente al gráfico de $f$ en $(a, f(a))$ es $$y = f(a) + f'(a)\,(x - a).$$`],
      idea: [R`Es la recta que pasa por el punto y tiene pendiente $f'(a)$, la [[derivada]]. Cerca de $a$, $f(x) \approx f(a) + f'(a)(x-a)$: es la **mejor aproximación lineal** de $f$.`,
        { graph: { fns: [x => x * x / 2, x => 2 * x - 2], points: [{ x: 2, y: 2 }], xr: [-2, 5], yr: [-3, 6] }, caption: R`En violeta $y=\frac{x^2}{2}$; en naranja su tangente en $x=2$, $\;y = 2x - 2$.` }],
      examples: [{ q: R`Encontrá la tangente a $f(x) = x^2/2$ en $x = 2$.`, steps: [R`$f(2) = 2$ y $f'(x) = x$, así que $f'(2) = 2$.`, R`$y = 2 + 2(x - 2) = 2x - 2$.`] }],
      see: ["derivada", "implicita"]
    },
    "implicita": {
      group: "derivadas", title: "Derivación implícita", aliases: ["derivación implícita", "implícitamente", "implícita"], concepts: ["der-implicita"],
      summary: "Derivar ambos lados respecto de x tratando a y como y(x), y despejar y'.",
      def: [R`Si una curva está dada por una ecuación $F(x, y) = 0$ sin despejar $y$, derivamos **ambos lados respecto de $x$** pensando $y = y(x)$. Cada vez que derivamos algo con $y$ aparece un factor $y'$, por la [[regla-cadena|regla de la cadena]]. Después despejamos $y'$.`],
      idea: [R`¿Por qué aparece $y'$? Porque $\frac{d}{dx}\left(y^2\right) = 2y\cdot y'$, igual que $\frac{d}{dx}\left(g(x)^2\right) = 2g(x)\,g'(x)$.`],
      examples: [
        { q: R`Calculá la pendiente de $x^2 + y^2 = 25$ en $(3, 4)$.`, steps: [R`Derivamos: $2x + 2y\,y' = 0$.`, R`Despejamos: $y' = -\dfrac{x}{y}$.`, R`En $(3,4)$: $y' = -\dfrac34$.`] },
        { q: R`Calculá $y'$ en $xy + y^2 = 6$.`, steps: [R`[[regla-producto|Regla del producto]] en $xy$: $y + x\,y' + 2y\,y' = 0$.`, R`$y'(x + 2y) = -y \Rightarrow y' = -\dfrac{y}{x + 2y}$.`] }
      ],
      see: ["regla-cadena", "recta-tangente"]
    },
    "derivadas-sucesivas": {
      group: "derivadas", title: "Derivadas sucesivas", aliases: ["derivada segunda", "derivadas sucesivas", "derivadas de orden superior"], concepts: ["der-sucesivas"],
      summary: "f'' es la derivada de f': mide cómo cambia la pendiente (concavidad, aceleración).",
      def: [R`La **derivada segunda** es $f'' = (f')'$, la tercera es $f''' = (f'')'$, y en general $f^{(n)}$.`],
      idea: [R`Si $f$ es la posición, $f'$ es la velocidad y $f''$ la **aceleración**. Geométricamente, $f'' > 0$ indica concavidad hacia arriba: la pendiente crece.`],
      examples: [{ q: R`Si $f(x) = \sin(2x)$, calculá $f''(x)$.`, steps: [R`$f'(x) = 2\cos(2x)$, por la [[regla-cadena|regla de la cadena]].`, R`$f''(x) = -4\sin(2x)$.`] }],
      tips: [R`Con $e^{kx}$, cada derivada multiplica por $k$: $\left(e^{kx}\right)^{(n)} = k^n e^{kx}$.`],
      see: ["derivada", "grafico-derivada"]
    },
    "grafico-derivada": {
      group: "derivadas", title: "Leer f' en el gráfico de f", aliases: ["gráfico de la derivada"], concepts: ["der-grafica", "graficos"],
      summary: "Donde f crece, f' > 0; donde decrece, f' < 0; en máximos y mínimos, f' = 0.",
      def: [R`Si $f' > 0$ en un intervalo, $f$ **crece** ahí; si $f' < 0$, **decrece**. En un máximo o mínimo local con tangente, $f' = 0$.`],
      idea: [R`Para dibujar $f'$ a partir de $f$, recorré el gráfico de $f$ de izquierda a derecha y preguntate **qué tan empinado está** en cada punto: esa pendiente es la altura de $f'$.`,
        { graph: { fns: [x => x ** 3 / 3 - 2 * x, x => x * x - 2], xr: [-4, 4], yr: [-4, 4] }, caption: R`En violeta $f = \frac{x^3}{3} - 2x$; en naranja $f' = x^2 - 2$, que se anula justo donde $f$ tiene su máximo y su mínimo.` }],
      examples: [{ q: R`Si $f$ es una parábola con mínimo en $x = 1$, ¿cómo es $f'$?`, steps: [R`A la izquierda de $1$, $f$ decrece: $f' < 0$. A la derecha crece: $f' > 0$.`, R`$f'(1) = 0$. De hecho, $f'$ es una recta creciente que corta el eje en $x = 1$.`] }],
      see: ["derivada", "derivadas-sucesivas", "funcion"]
    }
  };

  E.registerTheory("calculo", {
    groups: [
      { id: "herramientas", title: "Herramientas" },
      { id: "limites", title: "Límites" },
      { id: "continuidad", title: "Continuidad" },
      { id: "derivadas", title: "Derivadas" }
    ],
    cards,
    // qué fichas conviene leer antes de cada lección (en orden)
    lessons: {
      "lim-idea": ["limite", "limites-laterales", "sustitucion", "algebra-limites"],
      "lim-00": ["indeterminacion", "factorizar", "conjugado"],
      "lim-trig": ["lim-trig-tecnicas", "lim-trig-notable", "lim-1-cos", "sandwich", "radian", "identidades-trig"],
      "lim-inf": ["limites-infinitos", "limites-al-infinito", "asintotas"],
      "cont": ["continuidad", "discontinuidades", "bolzano", "funcion"],
      "der-def": ["derivada", "derivable-continua"],
      "der-basicas": ["regla-potencia", "derivadas-trig", "exp-log"],
      "der-prodcoc": ["regla-producto", "regla-cociente"],
      "der-trans": ["derivadas-trig", "exp-log"],
      "der-cadena": ["regla-cadena"],
      "der-apl": ["recta-tangente", "implicita", "derivadas-sucesivas", "grafico-derivada"]
    }
  });
})();
