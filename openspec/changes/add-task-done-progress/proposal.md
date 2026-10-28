## Why

En la pantalla de tareas no hay forma de ver de un vistazo cuánto de lo que se tiene delante ya está terminado: hay que recorrer las filas y contar. Una barra de progreso encima del listado lo dice con dos números, el recuento y el porcentaje, sin pedir nada nuevo al servidor.

## What Changes

- **Encima del listado** aparece un indicador de progreso con el recuento de tareas en estado `done` sobre el total de las que se están viendo («N de M») y su porcentaje, acompañados de una barra que se llena en esa proporción.
- **La base del cálculo es lo que está a la vista**, no el espacio entero: las filas que se pintan con el filtro aplicado. Cuando una tarea sale de la vista por un cambio de estado propio, el indicador se recalcula sin volver a pedir la lista.
- **No aparece cuando no hay tareas a la vista**: ni mientras carga, ni ante un error de carga, ni en ninguno de los finales de una lista sin filas (filtro inválido, filtro válido sin resultados, nada abierto pero sí hechas, espacio vacío).
- **El porcentaje no exagera ni esconde**: «100 %» solo cuando todas las tareas a la vista están hechas, y «0 %» solo cuando no lo está ninguna.
- **Accesible**: el indicador se expone como barra de progreso con su etiqueta y sus valores, y el recuento está escrito en texto, no solo en el ancho de la barra.
- **Solo frontend**: los números salen de la lista que `GET /api/v1/tasks` ya devuelve. Sin endpoints, parámetros ni campos nuevos.

### Consecuencia que se acepta a sabiendas

Con los filtros que existen hoy, cada vista es un subconjunto de estados que o excluye las hechas (vista por defecto, «Pendiente», «En curso») o solo las contiene («Hecho»). El indicador, calculado sobre lo visible, marcará por tanto **0 %** en las tres primeras y **100 %** en la última. Es lo que se pide —la proporción de lo que se está viendo— y se deja escrito para que nadie lo tome por un fallo. Medir sobre el espacio entero exigiría pedir también las hechas, y queda fuera de este change.

### Fuera de alcance

- Medir el progreso sobre todas las tareas del espacio, por persona o por periodo.
- Cualquier cambio en el backend o en el contrato de la API.
- Animaciones o celebraciones al llegar al 100 %.

## Capabilities

### New Capabilities

Ninguna. El indicador es parte de la pantalla de la lista de tareas.

### Modified Capabilities

- `tasks`: la pantalla de la lista gana un indicador de progreso de lo hecho sobre lo visible, con sus reglas de cuándo se muestra y cómo redondea.

## Impact

**Estado de partida.** En esta rama ya existe una primera versión (commit `2713a63`, `frontend/src/components/task-progress.tsx`) que calcula lo pedido pero incumple dos reglas de proceso de `CLAUDE.md` que llegaron después: la pieza reutilizable vive fuera de `frontend/src/components/ui/`, y el relleno usa el color literal `bg-blue-600` (`d0e58b3`). Este change fija el comportamiento y lleva la implementación a cumplir esas reglas.

**Frontend.** `src/components/ui/` (pieza de progreso del catálogo), `src/components/task-progress.tsx` y `src/pages/tasks-page.tsx`.

**Backend.** Ninguno. Sin migración, sin cambios en OpenAPI ni en Postman.

**Riesgos.** Sin runner de tests en el frontend, la verificación es manual (`npm run build`, `npm run lint` y comprobación en el navegador). El cálculo depende de que la lista pintada sea la ya filtrada (`visibleTasks`); si alguien le pasara la lista cruda de la API, el indicador contaría filas que no se ven.
