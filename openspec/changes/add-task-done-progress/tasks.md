> **Punto de partida.** En esta rama ya existe una primera versión de la barra (`2713a63`, con el relleno en `bg-blue-600` desde `d0e58b3`). Estas tareas no la crean desde cero: la llevan a cumplir la spec y las reglas de interfaz de `CLAUDE.md`.

## 1. La pieza en el catálogo

- [x] 1.1 Listar `frontend/src/components/ui/` y confirmar que ninguna de las piezas existentes sirve como barra de progreso
- [x] 1.2 Traer la pieza con `npx shadcn@latest add progress` desde `frontend/`, sin editar a mano el `progress.tsx` que genere (decisión 1 del diseño)
- [x] 1.3 Comprobar en el fichero generado que pista y relleno usan valores con nombre (`bg-primary`, `bg-primary/20`) y que no añade ninguna dependencia fuera de `radix-ui`

## 2. La composición de la pantalla

- [x] 2.1 Reescribir `frontend/src/components/task-progress.tsx` para que delegue la barra en `<Progress>` de `@/components/ui/progress` y deje de pintar sus propios `div` (decisión 2 del diseño)
- [x] 2.2 Calcular el porcentaje con `Math.round` y acotarlo a `[1, 99]` cuando haya alguna hecha y alguna sin hacer (decisión 4 del diseño)
- [x] 2.3 Mantener la guarda que no pinta nada si recibe cero tareas
- [x] 2.4 Pasar a `<Progress>` el `value` en porcentaje, `aria-labelledby` a la etiqueta visible y `getValueLabel` con «N de M hechas» (decisión 5 del diseño); si la firma no lo admite, comprobarlo en los `.d.ts` de `radix-ui` y adaptar la composición, nunca la pieza
- [x] 2.5 Escribir en texto visible el recuento y el porcentaje como «N de M · P %»
- [x] 2.6 Confirmar que en `frontend/src/` ya no queda `bg-blue-600` ni ningún otro color literal introducido por este cambio (el hook `colores-con-nombre.sh` no debe avisar)

## 3. Dónde se monta

- [x] 3.1 Confirmar que `tasks-page.tsx` monta `<TaskProgress>` solo en la rama `visibleTasks.length > 0` y le pasa `visibleTasks`, no `tasks` (decisión 3 del diseño)

## 4. Comprobación

- [x] 4.1 `npm run build` (typecheck incluido) y `npm run lint` en verde desde `frontend/`
- [x] 4.2 En el navegador, recorrer los escenarios de «El progreso de lo que se está viendo»: vista por defecto (0 de N · 0 %), acotada por «Hecho» (N de N · 100 %), y cambiar el estado de una fila para ver que el indicador se recalcula al momento sin nueva petición en la pestaña de red
- [x] 4.3 Recorrer los escenarios de «El indicador solo aparece si hay tareas a la vista»: cargando, error de carga, filtro inválido, filtro válido sin resultados, nada abierto pero sí hechas, y la última fila que sale de la vista
- [x] 4.4 Comprobar el redondeo de los extremos (199 de 200 → 99 %, 1 de 200 → 1 %, 2 de 3 → 67 %) con una lista simulada o una función extraída, sin escribir datos en la base de desarrollo
- [x] 4.5 Comprobar con el árbol de accesibilidad del navegador que el indicador es un `progressbar` con nombre y que anuncia «N de M hechas»
