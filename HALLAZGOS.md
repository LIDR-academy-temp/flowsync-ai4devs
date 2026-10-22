# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: un cambio de motor a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Dónde aterrizó la pieza y con qué valores?

Con los números que contaste: dentro o fuera del catálogo, cuántos colores a pelo había antes y cuántos después.

- Fuera del catálogo: `TaskProgress` es un componente escrito a mano en `frontend/src/components/task-progress.tsx`, aunque shadcn tiene `progress`; colores a pelo en ese fichero: 0 al crearlo (`bg-primary`, `bg-muted`) y 1 después de pedir el azul (`bg-[#2563eb]`); solo medí ese fichero. `grep -c "^  --" frontend/src/index.css` originalmente tiene 59 y despues del cambio siguen los mismos.

## 2. Qué crees que decidió eso

Es la pregunta interesante del ejercicio, y la respuesta no está en ningún sitio: se deduce mirando qué información tenía delante el agente cuando escribió. Si tu resultado no es el que esperabas al leer las lecciones, dilo tal cual: es el dato del ejercicio.

- Decidió lo que tenía delante: busco «progress» solo en el código local y `components/ui/` no traía ninguno (alert, button, card, input, label), así que concluyo que no existía y lo escribio a mano; el catálogo de shadcn no se ve desde el repo y no creo que se haya consultado, aunque `CLAUDE.md` ya decía que los componentes se traen con `shadcn add`; los colores seguramente salieron de los tokens por imitar a los vecinos, no por ninguna regla (la regla se escribió después).

## 3. Qué avisó el guardarraíl y qué no pudo ver

Un script solo caza lo que es mecánico; lo demás se queda fuera, y saber cuál es ese resto es la mitad del asunto.

- Avisó del color: `línea 1: h-full bg-[#2563eb]`, por stderr y sin bloquear (el log registró `ejecutado` y `ALERTA`), pero solo al arrancar Claude desde la raíz; desde `frontend/` no cargó ningún hook del proyecto; no ve el origen del componente (que sea de mano y no de shadcn), nombres CSS (`red`), `color-mix()`, colores armados con variables, ni escrituras fuera de Write/Edit/MultiEdit (`sed -i`, Bash, MCP).
