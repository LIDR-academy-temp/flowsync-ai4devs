# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: una parte A a medias con estas tres líneas escritas vale más que lo contrario, porque lo
que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Dónde aterrizó la pieza y con qué valores

- Quedó fuera del catálogo, en `frontend/src/components/task-progress.tsx`: `components/ui/` tenía 5 piezas antes y 5 después. La barra está dibujada a mano con dos `div` y `role="progressbar"`, sin reutilizar nada, pero con valores con nombre (`bg-muted`, `bg-primary`, `text-muted-foreground`): colores a pelo fuera de `index.css`, 0 antes y 0 después de la parte A, y los 59 valores con nombre de `index.css` sin cambios.

## 2. Qué creo que decidió eso

- El `CLAUDE.md` del proyecto le daba la mitad del vocabulario y no la otra. Le dice que los tokens viven en `src/index.css` y que shadcn está en `src/components/ui/`, y por eso usó colores con nombre y fue a buscar al catálogo ("no hay un componente de progreso en components/ui/"). Pero no tenía ninguna regla para cuando la pieza falta, y entre traer `progress` de shadcn con `npx shadcn@latest add`, que el mismo `CLAUDE.md` menciona, y dibujarla, la dibujó. Esperaba colores inventados y no los hubo: lo que inventó fue la pieza, justo donde el catálogo tenía un hueco.

## 3. Qué avisó el guardarraíl y qué no pudo ver

- No avisó ni una vez. En las dos pruebas el agente editó por `Bash` (un `python3` en el Prompt 3 y un `sed -i` en el 4), y el hook solo escucha `Write|Edit`, así que el `bg-[#1D4ED8]` entró en el `.tsx` sin aviso (colores a pelo: de 0 a 1) mientras el agente me decía que "el hook va a avisar". Probado a mano, sí caza hexadecimales, paleta cruda y `rgb()`/`oklch()`, pero no ve `style={{ color: 'blue' }}`, `bg-black`/`text-white`, `color-mix()` ni un `Edit` que Prettier reformatea antes de que el hook lo lea. Y lo que de verdad pasó en la parte A, una pieza dibujada a mano fuera del catálogo con valores válidos, ningún script lo puede ver. Eso solo lo frena la regla del `CLAUDE.md`, y en la prueba del azul fue esa regla, no el hook, la que lo llevó a crear un token.
