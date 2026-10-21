# Hallazgos


## 1. Dónde aterrizó la pieza y con qué valores

- Dentro del catálogo: `src/components/ui/` pasó de 5 a 6 piezas con un `progress.tsx` de forma shadcn, compuesto desde `src/components/task-progress.tsx`; colores a pelo fuera de `index.css`, 0 antes y 0 después (el único literal, `text-white` en `ui/button.tsx`, ya estaba); usó solo tokens (`bg-primary`, `text-muted-foreground`) y los valores con nombre siguieron en 59, aunque por su cuenta cambió la base de la barra a "visibles + ya hechas".

## 2. Qué creo que decidió eso

- No es lo que esperaba tras las lecciones: mi prompt no nombró el catálogo, pero el `CLAUDE.md` del repo sí (shadcn en `src/components/ui/`, `npx shadcn@latest add`, tokens en `src/index.css`), y tenía `button.tsx` de modelo y `radix-ui` instalado, así que el experimento midió un agente con vocabulario documentado, no uno sin catálogo; lo que no estaba escrito en ningún sitio, qué cuenta como "tareas que se están viendo", lo decidió solo.

## 3. Qué avisó el guardarraíl y qué no pudo ver

- A mano, `colores-por-tokens.sh` caza `#1D4ED8`, `bg-blue-600` y `text-white` sin bloquear y calla en `index.css`, pero en la prueba real no avisó nada: el agente convirtió el azul en un token `--progress: #1d4ed8` dentro de `index.css` (valores con nombre 59 → 62), escrito vía Bash, y pintó la barra desde fuera de `ui/` con un selector sobre `data-slot=progress-indicator`; el hook no ve eso, ni un hex con nombre igual en claro y oscuro, ni nombres CSS (`royalblue`, comprobado), ni clases armadas por partes, ni `MultiEdit`, ni una pieza reinventada: el agente cumplió la letra de la regla, no su intención.
