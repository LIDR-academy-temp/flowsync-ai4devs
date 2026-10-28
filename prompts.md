# Prompts

Aquí van **todos los prompts que lanzaste** para hacer el ejercicio, en el orden en que los
lanzaste, con el modelo y la herramienta de cada uno.

Esto no es papeleo. Lo que se revisa es **cómo pediste las cosas**, no solo lo que salió: un
resultado flojo con un prompt bueno y un resultado flojo con un prompt vago necesitan feedback
distinto, y sin este archivo no se distinguen.

## Cómo rellenarlo

- Un apartado `## Prompt N` por cada prompt.
- **Pega el prompt tal cual lo lanzaste**, dentro del bloque de código, aunque ocupe diez líneas
  y aunque tenga faltas. No lo reescribas para que quede bien: el que arreglaste mentalmente
  después no es el que lanzaste.
- Incluye también los que **no funcionaron**. Suelen ser los más útiles de leer.
- `Modelo` y `Herramienta` en todos. Si cambiaste de una a otra a mitad, se nota aquí.

> Nota de método: cada prompt se lanzó a un **subagente nuevo de Claude Code** (sin el contexto de
> la sesión que hizo las mediciones de partida), abierto en la raíz del repositorio. Así el agente
> que escribe la pieza solo tiene delante lo que tendría un agente recién arrancado: el repo y su
> `CLAUDE.md`. Ninguno de los prompts nombra el catálogo, la ruta de las piezas ni un valor con nombre.

---

## Prompt 1 — Parte A: la pieza, sin pistas (una sola pasada)

**Modelo:** Claude Opus 5.5 (`claude-opus-5-5`)
**Herramienta:** Claude Code (subagente `general-purpose`, contexto limpio)

```
En la pantalla de tareas, encima del listado, añade una barra de progreso que enseñe qué parte de las tareas que se están viendo está en estado done. No abras PR.
```

**Qué salió:** una sola pasada, commit `2e65ea7` en mi rama. Pieza nueva `frontend/src/components/task-progress.tsx`, **fuera** de `components/ui/` (sigue en 5 piezas). Colores solo con valores con nombre (`bg-muted`, `bg-primary`, `text-muted-foreground`), 0 hex antes y después. No reutilizó nada del catálogo: dibujó la barra a mano con `div` + `role="progressbar"`, sin traer el `progress` de shadcn. Avisó por su cuenta de que, con el filtro por defecto (pendientes + en curso), la barra siempre marca 0 %.

---

## Prompt 2 — Parte B: el guardarraíl (hook + regla)

**Modelo:** Claude Opus 5.5 (`claude-opus-5-5`)
**Herramienta:** Claude Code (subagente `general-purpose`, contexto limpio)

```
Monta un guardarraíl en dos piezas, sin tocar nada más del frontend:

1) Un hook en .claude/hooks/, registrado en .claude/settings.json, que AVISE (no bloquee) cuando se escriba un color a pelo en frontend/src/: hexadecimales tipo #1D4ED8, funciones de color (rgb(), hsl(), oklch()...) y clases de paleta cruda de Tailwind tipo bg-blue-600 o text-white. frontend/src/index.css queda fuera, porque es la capa donde el valor literal sí se escribe. El aviso tiene que llegarle al agente (no solo a la terminal) y decirle qué valor encontró y en qué archivo. Copia la forma de los hooks que ya hay en .claude/hooks/ (el enunciado cita como modelo .claude/hooks/migracion-con-vuelta.sh, pero en esta rama no existe). Pruébalo a mano con un caso que avise, uno que no, y uno sobre index.css.

2) Una regla en el CLAUDE.md del repositorio que diga de dónde sale una pieza de interfaz nueva: primero se busca en frontend/src/components/ui/; si no está y shadcn la tiene, se trae con npx shadcn@latest add; solo si no existe en ninguno de los dos se escribe una propia, y siempre con los valores con nombre de frontend/src/index.css, nunca colores a pelo. Que diga también que esa regla no la comprueba ningún script.

No abras PR.
```

**Qué salió:** a la primera. Hook nuevo `.claude/hooks/colores-con-nombre.sh` (PostToolUse `Write|Edit|MultiEdit`, sale siempre con 0 y avisa por `additionalContext`) y regla en `CLAUDE.md`, sección Frontend. Su primera versión con `grep -o` se perdía coincidencias seguidas (`bg-blue-600 text-white` solo daba la primera); lo detectó en su propia prueba y lo pasó a `perl`. No commiteó: el commit lo hice yo.

---

## Prompt 3 — Parte B: probar el guardarraíl pidiendo lo que el proyecto no quiere

**Modelo:** Claude Opus 5.5 (`claude-opus-5-5`)
**Herramienta:** Claude Code (subagente `general-purpose`, contexto limpio)

```
Cambia el color de la barra de progreso de la pantalla de tareas por este azul: #1D4ED8. No abras PR.
```

**Qué salió:** el hook **no saltó**. El agente leyó la regla nueva del `CLAUDE.md` y, en vez de escribir el hex en el componente, creó un valor con nombre nuevo (`--progress: #1d4ed8` en `:root` + `--color-progress` en `@theme`) y puso `bg-progress` en la barra. El literal acabó en `index.css`, que el hook excluye a propósito. No añadió variante para `.dark`, y lo dijo. Simulé a mano el Edit que habría puesto `bg-[#1D4ED8]` en `task-progress.tsx`, y el hook sí avisa (`hexadecimal: #1D4ED8`, salida 0).
