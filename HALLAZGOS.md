# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: una parte A a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

> La plantilla que trae `s12/start` es la de un ejercicio de migraciones (filas que cambian, rama del
> árbol de reversibilidad). Los tres apartados de abajo son los que pide el ejercicio de la s12.

## 1. Dónde aterrizó la pieza y con qué valores

Dentro o fuera del catálogo, cuántos colores a pelo había antes y cuántos después.

- Fuera del catálogo y sin colores a pelo: la barra quedó en `frontend/src/components/task-progress.tsx`, un componente propio montado en `tasks-page.tsx` que no importa ninguna pieza de `components/ui` (solo el tipo `Task`) y dibuja la barra con dos `div`; `components/ui` tenía 5 piezas antes y 5 después (`alert`, `button`, `card`, `input`, `label`), `index.css` siguió con sus 59 valores con nombre, y los colores a pelo en `frontend/src` fueron 0 hexadecimales y 0 clases de paleta con escala antes y después de la parte A, con el único crudo de partida, el `text-white` de la variante `destructive` de `button.tsx`, igual en 1; todos los colores de la barra son tokens (`bg-muted`, `bg-primary`, `text-muted-foreground`), y el único hexadecimal que hay ahora, `#1D4ED8`, lo metió después la prueba del guardarraíl, que lo pedía a propósito.

## 2. Qué crees que decidió eso

Se deduce mirando qué información tenía delante el agente cuando escribió.

- Creo que lo decidió lo que vio y lo que no vio: listó `src/components/ui`, buscó «progress» en el código, no encontró ninguna pieza con ese nombre y, en vez de traerla con `npx shadcn@latest add progress`, la dibujó él, aunque el `CLAUDE.md` del proyecto, que cargó, ya decía que las piezas de `ui/` se traen con ese comando; esa frase está escrita como descripción del stack y no como orden para cuando falta una pieza, y no pesó frente a una petición de una frase que no hablaba de catálogo; los colores, en cambio, no se los inventó porque todo lo que leyó, `tasks-page.tsx` y las piezas de `ui/`, usaba tokens y copió ese vocabulario; es el mismo resultado de la clase, se inventó la pieza y no el color, aunque allí la pieza entró escrita a mano en `components/ui` y aquí se quedó fuera, en `components/`.

## 3. Qué avisó el guardarraíl y qué no pudo ver

Un script solo caza lo que es mecánico; lo demás se queda fuera.

- Avisó de lo que se le provocó: al pedirle la barra en `#1D4ED8`, el agente cambió `bg-primary` por `bg-[#1D4ED8]`, el `PostToolUse:Edit` de `sin-color-a-pelo.sh` le devolvió dentro de la sesión «lleva colores a pelo: #1D4ED8» con los tokens que debía usar, y el agente lo dejó porque el azul se había pedido explícitamente, ofreciendo pasarlo a un token `--progress` en `index.css`, así que los hexadecimales de `frontend/src` pasaron de 0 a 1 y el aviso no impidió nada, que es lo que se le pidió; lo que no puede ver: que la barra entera es una pieza propia fuera de `components/ui` (eso solo lo dice la regla nueva de `CLAUDE.md`, y la parte A se escribió antes de que existiera), los colores en `rgb()`, `hsl()` u `oklch()`, los colores con nombre, las clases armadas por concatenación, la deuda que ya había (mira solo el texto nuevo de cada edición), lo que una persona escriba fuera de Claude Code, y en macOS nada en absoluto, porque usa `grep -P`, que el `grep` de macOS no tiene, y allí falla en silencio.
