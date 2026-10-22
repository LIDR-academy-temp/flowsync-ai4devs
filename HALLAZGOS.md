# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: un cambio de motor a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Dónde aterrizó la pieza y con qué valores

- Fue creada fuera del catálogo, en `frontend/src/components/task-progress.tsx`, `components/ui/` tenía 5 piezas antes y 5 después, sin variación. El elemento fue creado directamente con `div` y `role="progressbar"`, directamente con clases de Tailwind CSS. En la sección B, el azul solicitado con el código hexadecimal fue declarado como un nuevo token en `frontend/src/index.css`. En `frontend/src/components/task-progress.tsx` el relleno pasa de `bg-primary` a `bg-progress`

## 2. Qué crees que decidió eso

- Lo decidió lo que el agente tenía delante. `CLAUDE.md` le dice que los tokens viven en `src/index.css` y que **shadcn** está en `src/components/ui/`.  de partida decía que
  `src/components/ui/` «se trae con `npx shadcn@latest add` y no se edita a mano» y nada sobre de
  dónde sale una pieza nueva, así que la única regla empujaba la pieza *fuera* de `ui/`; los dos
  vecinos que leyó antes de escribir (`task-filter.tsx`, `task-item.tsx`) son componentes propios en
  `src/components/` montados con `Button` y clases de token, y los imitó hasta en los comentarios;
  justificó el `div` a mano con que «no hay nada que accionar, solo leer» y además el `npm install`
  estaba roto por el certificado del proxy, con lo que un `npx shadcn add progress` ni se intentó; y
  los tokens no salieron de ninguna regla sino de que **en el código que leyó no había ni un color a
  pelo que copiar** (una skill de visualización que se cargó sola solo aportó la cifra al lado de la
  barra). El resultado contradice en parte la lección: sin catálogo nombrado no inventó colores, pero
  sí inventó la pieza.

## 3. Qué avisó el guardarraíl y qué no pudo ver

De qué dudaste, o qué no pudiste comprobar.

-
