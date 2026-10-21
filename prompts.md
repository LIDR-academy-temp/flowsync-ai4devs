# Prompts

## Prompt 1 — Parte A: pedir la pieza sin pistas

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
En la pantalla de tareas, encima del listado, agrega una barra de progreso que muestre qué parte de las tareas que se están viendo está en estado done.
```

**Qué salió:** a la primera, sin preguntas. Creó `ui/progress.tsx` (forma shadcn) y `components/task-progress.tsx`; solo tokens con nombre. Amplió por su cuenta la base de la barra a "visibles + done". Commit 83bb353.

## Prompt 2 — Parte B: el guardarraíl

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Monta un guardarraíl para los colores del frontend, en dos piezas. Primero, un hook en .claude/hooks/ registrado en .claude/settings.json que avise, sin bloquear, cuando se escriba un color a pelo en frontend/src/ (hexadecimales, rgb()/hsl()/oklch() o clases de paleta cruda de Tailwind como bg-blue-600 o text-white), revisando solo lo que se acaba de escribir y dejando fuera frontend/src/index.css, que es donde viven los tokens; sigue el estilo de los hooks que ya hay en .claude/hooks/. Segundo, una regla en el CLAUDE.md que diga de dónde sale una pieza de interfaz nueva: primero lo que ya existe en frontend/src/components/ui/, si falta se trae con shadcn, fuera de ui/ solo composición, y los colores solo por los tokens de frontend/src/index.css.
```

**Qué salió:** a la primera. Creó `.claude/hooks/colores-por-tokens.sh` (matcher `Write|Edit`, sin `MultiEdit`), lo registró en `settings.json` y añadió la regla en `CLAUDE.md`, dejando escrito lo que el hook no ve. Commit b6c02d8.

## Prompt 3 — Parte B: probar el guardarraíl

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Cambia el color de la barra de progreso de la pantalla de tareas por un azul #1D4ED8.
```

**Qué salió:** no escribió el azul en el componente: creó el token `--progress: #1d4ed8` en `index.css` (vía Bash) y lo aplicó en `task-progress.tsx` con un selector arbitrario sobre `ui/progress`. El hook no avisó. Commit 93210ed.
