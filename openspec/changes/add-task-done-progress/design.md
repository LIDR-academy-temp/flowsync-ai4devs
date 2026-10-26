## Context

Ver `proposal.md` — Why. La pantalla de la lista (`frontend/src/pages/tasks-page.tsx`) ya separa lo que trajo la API (`tasks`) de lo que se pinta (`visibleTasks`, la lista filtrada por `matchesFilter`), y ya decide por ramas qué enseñar: cargando, filtro inválido, filas, y los finales de una lista sin filas. El indicador solo necesita colgarse de la rama con filas y leer `visibleTasks`.

En esta rama hay una primera versión (`2713a63`): `frontend/src/components/task-progress.tsx` pinta la barra a mano con dos `div`, `role="progressbar"` y el relleno en `bg-blue-600` (`d0e58b3`). Después llegaron dos reglas de `CLAUDE.md` que esa versión incumple: antes de crear una pieza de interfaz se revisa `frontend/src/components/ui/`, y si ninguna sirve la pieza reutilizable se añade ahí primero; y los estilos usan valores con nombre de `index.css`, nunca colores literales.

El catálogo tiene hoy cinco piezas (`alert`, `button`, `card`, `input`, `label`), ninguna de progreso. shadcn/ui tiene `progress`, construido sobre `radix-ui`, que ya es dependencia del frontend.

Restricciones: solo frontend; sin runner de tests en el frontend; los componentes de `components/ui/` se traen con `npx shadcn@latest add` y no se editan a mano.

## Goals / Non-Goals

**Goals:**

- Que el indicador cuente exactamente lo que se ve y desaparezca cuando no se ve nada.
- Que la barra salga del catálogo y no de marcado propio, y que no quede ningún color literal.
- Que el porcentaje nunca diga «100 %» ni «0 %» cuando no es verdad.

**Non-Goals:**

- Medir sobre el espacio entero (exigiría pedir también las hechas).
- Tocar el backend o el contrato de la API.
- Rediseñar la fila de tarea o el control de filtro.

## Decisions

### 1. La barra es la pieza `progress` de shadcn, traída al catálogo

Se añade con `npx shadcn@latest add progress`, que escribe `frontend/src/components/ui/progress.tsx` sobre `radix-ui` (`Progress.Root` + `Progress.Indicator`) con la pista en `bg-primary/20` y el relleno en `bg-primary`. Se usa tal cual sale.

**Alternativa descartada:** mantener la barra hecha a mano en `task-progress.tsx` y solo cambiar `bg-blue-600` por `bg-primary`. Arregla el color pero no la procedencia: dejaría fuera del catálogo una pieza que cualquier otra pantalla querrá reutilizar, que es justo lo que la regla de `CLAUDE.md` existe para evitar.

### 2. `TaskProgress` se queda como composición de pantalla, no como pieza del catálogo

`frontend/src/components/task-progress.tsx` sigue existiendo, pero pasa a ser la composición propia de FlowSync: calcula el recuento y el porcentaje a partir de las tareas que recibe, escribe la etiqueta y el texto «N de M · P %», y delega la barra en `<Progress>` de `components/ui`. Lo genérico (la barra) vive en el catálogo; lo que sabe de tareas, fuera.

**Alternativa descartada:** calcular dentro de `tasks-page.tsx` y usar `<Progress>` directamente allí. La página ya es larga y carga con cuatro finales distintos; meter ahí el redondeo y la accesibilidad del indicador la hace más difícil de leer sin ganar nada.

### 3. La base es `visibleTasks`, y se monta solo en la rama con filas

`tasks-page.tsx` ya pinta `<TaskProgress tasks={visibleTasks} />` dentro de la rama `visibleTasks.length > 0`. Se mantiene así: esa ubicación es lo que garantiza que no aparezca cargando, con error, con filtro inválido ni en ningún vacío, sin que el componente tenga que saber nada de esos estados. Como `visibleTasks` se recalcula en cada render a partir del estado optimista, el indicador se actualiza en el mismo instante en que una fila sale de la vista.

El componente conserva igualmente la guarda de `tasks.length === 0` (no pinta nada) como defensa, para que usarlo en otro sitio no pueda dar un «0 de 0».

### 4. Redondeo con los extremos reservados

`percent = Math.round(done / total * 100)`, y después, si `0 < done < total`, se acota a `[1, 99]`. Así 199 de 200 da «99 %» y 1 de 200 da «1 %», y «100 %» y «0 %» quedan reservados para los casos en que son literalmente verdad.

**Alternativa descartada:** `Math.floor`. Evita el falso «100 %» pero introduce un falso «0 %» (1 de 200), que es el mismo error por el otro lado.

### 5. Accesibilidad: el valor va a Radix en porcentaje, el texto en recuento

La pieza de shadcn pinta el relleno con `translateX(-${100 - value}%)`, es decir, espera `value` en escala 0–100. Se le pasa `value={percent}` (con el `max` por defecto, 100), `aria-labelledby` apuntando a la etiqueta visible y `getValueLabel` para que el anuncio sea «N de M hechas» en vez de un porcentaje desnudo. Radix pone `role="progressbar"`, `aria-valuemin`, `aria-valuemax` y `aria-valuenow`. El recuento y el porcentaje se escriben además como texto visible al lado de la etiqueta.

**Ajuste al implementar:** la pieza generada desestructura `value` para calcular el relleno y no se lo pasa a `Progress.Root`, así que Radix la da por indeterminada (sin `aria-valuenow` y sin usar `getValueLabel`). Como Radix aplica las props recibidas después de sus propios atributos ARIA, la composición pasa `aria-valuenow={percent}` y `aria-valuetext="N de M hechas"` explícitos, sin tocar la pieza. Queda `data-state="indeterminate"` en el nodo, que nada usa para pintar.

**Alternativa descartada:** pasar `value={done}` y `max={total}`, que es más fiel en ARIA pero rompe el ancho del relleno de la pieza generada, y arreglarlo exigiría editar `components/ui/progress.tsx` a mano, cosa que el proyecto no permite.

## Risks / Trade-offs

- [Con los filtros actuales el indicador solo marca 0 % o 100 %] → Se acepta y queda escrito en la propuesta y en los escenarios de la spec; medir sobre el espacio entero es otro change.
- [Que alguien le pase la lista cruda de la API en lugar de `visibleTasks`] → El comentario del prop de `TaskProgress` dice que son las tareas que se pintan; el escenario «Se recalcula sin volver a pedir la lista» lo destaparía en la comprobación manual.
- [`shadcn add` escribe en `components/ui/` una versión que puede diferir de la mostrada aquí] → Se usa la que genere, sin editarla; si su firma no admite `getValueLabel` o `aria-labelledby` por `...props`, se comprueba en los `.d.ts` de `radix-ui` antes de adaptar la composición, nunca la pieza.
- [El registro de shadcn declara hoy `cn` como dependencia npm: `shadcn add progress` (4.22.1 y 3.8.5) instaló el paquete `cn@0.5.0`, importó de él en vez de `@/lib/utils` y subió `radix-ui` de 1.6.7 a 1.8.1] → Se desinstaló, se restauraron `package.json` y `package-lock.json`, y la única edición sobre `ui/progress.tsx` es la línea del import, que apunta al alias `utils` de `components.json` como las otras cinco piezas. Al traer la próxima pieza del catálogo habrá que mirar lo mismo.
- [Sin runner de tests] → Verificación manual con `npm run build`, `npm run lint` y el navegador, recorriendo cada escenario de la spec.

## Migration Plan

Sin datos ni esquema. El despliegue es el del frontend; volver atrás es revertir el commit.

## Open Questions

Ninguna que bloquee. Si producto quiere que la barra diga algo distinto de 0 % en la vista por defecto, la conversación es sobre medir el espacio entero, y va en un change aparte.
