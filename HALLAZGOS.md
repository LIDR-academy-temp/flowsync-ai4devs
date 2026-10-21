# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: un cambio de motor a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Donde aterrizo la pieza y con que valores
- La nueva pieza quedado fuera del catalogo en frontend/src/components/task-progress.tsx y reutilizo los colores ya declarado --muted

## 2. Que crees que decidio esto

- Decidio usar los colores ya definidos en lugar de inventarse uno nuevo,siguiendo la regla blanda en el claude.md definida en ##FRONTEND: "los tokens viven en `src/index.css`)"
La nueva barra decidio meterla en frontend/src/components/ porque se trata de un componente formado de primitivos de la UI ya que no existe un solo elemento como un elemento boton `<button>` que haga todo el trabajo.

-

## 3. Que aviso el guardarrail y que no pudo ver

- El guardarrail aviso que debido a las nuevas reglas en el claude.md no se pueden usar valores brutos para los colores y que habria que definirlos en el `src/index.css` y usarlos asi, lo que hizo sin falla.
- El hook no se pudo validar debido al cumplimiento de la regla anterior(metio el cambio en `src/index.css` donde no revisa), y desconoce las reglas blandas del claude.md sin embargo esta ahi por si no se cumplen avisara si un color se usa en bruto/valor literal.

