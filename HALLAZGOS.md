# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: un cambio de motor a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Dónde aterrizó la pieza y con qué valores

- Fue creada fuera del catálogo, en `frontend/src/components/task-progress.tsx`, `components/ui/` tenía 5 piezas antes y 5 después, sin variación. El elemento fue creado directamente con `div` y `role="progressbar"`, directamente con clases de Tailwind CSS. En la sección B, el azul solicitado con el código hexadecimal fue declarado como un nuevo token en `frontend/src/index.css`. En `frontend/src/components/task-progress.tsx` el relleno pasa de `bg-primary` a `bg-progress`

## 2. Qué crees que decidió eso

- Lo decidió lo que el agente tenía delante. `CLAUDE.md` le dice que los tokens viven en `src/index.css` y que **shadcn** está en `src/components/ui/` y nada acerca de dónde sale una pieza nueva. Así que compuso su pieza como un componente propio más, en vez de traerla de shadcn. En la sección B, al lanzar el prompt con el azul en hexadecimal, con la regla ya en CLAUDE.md, el nuevo color pasó a `frontend/src/index.css` como `--progress`, incrementando los valores con nombre de 59 a 62.

## 3. Qué avisó el guardarraíl y qué no pudo ver

- El hook avisa pero no bloquea. Sin embargo, al pedirle directamente que cambie el color de la barra no avisó: el color no se escribe a pelo en el componente: entra como token en `index.css` y el componente lo usa por su nombre, así Tailwind genera `bg-progress`. El agente menciona también un problema de contraste al usar el mismo azul para el modo oscuro.