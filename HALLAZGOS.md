# Hallazgos

Ejercicio s12: una barra de progreso encima del listado de la pantalla de tareas, pedida sin decirle al agente de dónde sacarla. Una línea por punto, con lo que medí.

## 1. Dónde aterrizó la pieza y con qué valores

- **Fuera del catálogo.** La pieza quedó en `frontend/src/components/task-progress.tsx`, y `frontend/src/components/ui/` siguió con **5 piezas antes y 5 después**. Colores: **0 hexadecimales antes y 0 después** fuera de `index.css`, y **1 clase de paleta cruda antes y 1 después** (el `text-white` que shadcn generó en `ui/button.tsx`). Valores con nombre: **59 antes y 59 después** en la Parte A. No dibujó colores, pero tampoco reutilizó nada: hizo la barra a mano con `div` y `role="progressbar"`, sin traer el `progress` de shadcn. Después de la prueba del azul, `index.css` pasó a **61** valores con nombre y a 1 hex (`--progress: #1d4ed8`), y los hex fuera de `index.css` siguieron en 0.

## 2. Qué creo que decidió eso

- El `CLAUDE.md` que tenía delante el agente sí le decía que los tokens viven en `src/index.css` y que los componentes de shadcn se generan en `src/components/ui/` «y no se editan a mano». Pero ninguna línea le decía que una pieza nueva debía **salir** de ahí, y la carpeta solo tenía 5 piezas, ninguna con forma de barra. Leyó `ui/` como código generado de terceros y `components/` como el sitio de lo propio (allí están `task-item` y `task-filter`, sus vecinos en la misma pantalla), así que copió a sus vecinos. De ahí salen la ubicación y los colores: los vecinos ya usan `bg-muted`, `bg-primary` y `text-muted-foreground`. **Contra lo que esperaba al leer las lecciones, no inventó colores. Inventó la pieza.** Con un catálogo de tokens completo y uno de componentes casi vacío, el agente respeta el primero y se salta el segundo.

## 3. Qué avisó el guardarraíl y qué no pudo ver

- Al pedirle a propósito «cambia la barra por este azul: #1D4ED8», el hook **no avisó de nada**. El agente ya había leído la regla nueva, así que creó el valor con nombre `--progress: #1d4ed8` en `index.css` (la zona excluida) y usó `bg-progress`. Lo frenó la regla escrita, no el script. Simulé a mano el Edit con `bg-[#1D4ED8]` en el componente y ahí el hook sí avisa. Lo que el hook **no puede ver**: si la pieza se buscó antes en `ui/` o en shadcn (el fallo real de la Parte A pasó sin un solo aviso); si un valor con nombre nuevo tiene sentido o es un hex disfrazado (`--progress` no tiene variante `.dark` y rompe la convención `oklch` del archivo); lo que entra por Bash (`sed`, `npx shadcn add`); los colores armados por partes; y el `text-white` que ya estaba en `ui/button.tsx` si nadie lo edita. Además, el modelo que citaba el enunciado (`.claude/hooks/migracion-con-vuelta.sh`) no existe en `s12/start`, así que usé como modelo `datos-que-no-salen.sh` y `sin-borrar-datos.sh`.
