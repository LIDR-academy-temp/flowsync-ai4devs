# Hallazgos — Módulo 12, interfaz y su catálogo

> La plantilla que trae `s12/start` es la del módulo 10 (cambio de motor, filas, árbol de
> reversibilidad). Las tres preguntas de abajo son las de la lección del ejercicio del módulo 12.

## 1. Dónde aterrizó la pieza y con qué valores

- Fuera del catálogo: creó `frontend/src/components/task-progress.tsx`, y `src/components/ui/` siguió con 5 piezas antes y después; usó solo valores con nombre (59 → 59 en la parte A; 61 tras la prueba del azul), con 0 colores a pelo nuevos fuera de `index.css` (el único literal, `text-white` en `ui/button.tsx`, ya estaba); no reutilizó `Card` ni trajo la barra de progreso de shadcn: dibujó su propio recuadro.

## 2. Qué crees que decidió eso

- Imitó a sus vecinos: el `CLAUDE.md` ya le decía que los colores viven en `index.css` (y los respetó), pero en `ui/` no había ninguna barra y en la pantalla de tareas nadie usa la tarjeta (la página usa aviso, botón, campo y etiqueta; sus hermanos `task-item` y `task-filter`, solo el botón), así que compuso su pieza como un componente propio más, junto a esos hermanos, en vez de traerla de shadcn; y al pedirle después la regla de «de dónde sale una pieza nueva», la redactó poniendo primero los componentes propios y nombrando su propia barra: legitimó lo que ya había hecho.

## 3. Qué avisó el guardarraíl y qué no pudo ver

- El hook avisa sin bloquear (probado con un archivo de prueba y con el `text-white` de `button.tsx`), pero ante «pon la barra en azul #1D4ED8» no avisó: el agente declaró `--progress: #1d4ed8` en `index.css`, que el hook excluye por diseño, y la barra lo usa por nombre; queda el único valor en hexadecimal entre los de `oklch`, sin versión para modo oscuro y nombrado por su uso, no por su rol: el script caza el literal, no si un valor nuevo está justificado, y la propia regla («si falta un token, se declara») le abrió esa puerta.

## 4. Mi resultado frente al del directo (añadido el 22/10/2026, después de la sesión)

- **La pieza salió al revés.** En clase, medido tres veces, el agente trajo la barra al catálogo con el CLI de shadcn y compuso con ella; el mío la dibujó a mano fuera de `ui/`. En los colores coincidimos: ni el de clase ni el mío inventaron uno.
- **La pregunta de producto, también al revés.** En clase, `/opsx:propose` se detuvo a preguntar si la barra mide lo visible, que con el filtro por defecto marcaría siempre cero. El mío no preguntó: decidió solo medir todas las tareas, y lo dejó explicado en un comentario del código.
- **Por qué creo que difirió**, como hipótesis que no pude aislar: (1) en clase el cambio se propuso con OpenSpec antes de construirlo, y ese paso obliga a explorar y saca las preguntas a la superficie; mi prompt fue directo a construir; (2) el prompt de clase pedía que la pieza «encaje con el resto de la pantalla», y el mío no; (3) mi sesión corrió con esfuerzo medio, que explora menos y favorece copiar a los vecinos de carpeta.
- **El guardarraíl, en las dos versiones.** El de clase sale con código 2 por la salida de error; el mío devuelve el aviso como contexto adicional con código 0. Los dos le llegan al agente. Ante el azul, el de clase cantó porque el encargo pedía `bg-blue-600` en la barra y prohibía tocar el catálogo; el mío pidió un hexadecimal sin esa restricción, y el agente lo sacó por la puerta del valor con nombre, donde el hook no mira.
- **Lo que me llevo:** que la pieza entre al catálogo no depende del modelo, depende de que el proceso le haga mirar antes de escribir. Proponer antes de aplicar es un control, no un trámite.
