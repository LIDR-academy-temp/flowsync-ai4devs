# Prompts

Aquí van **todos los prompts que lanzaste** para hacer el ejercicio, en el orden en que los
lanzaste, con el modelo y la herramienta de cada uno.

Esto no es papeleo. Lo que se revisa es **cómo pediste las cosas**, no solo lo que salió: un
resultado flojo con un prompt bueno y un resultado flojo con un prompt vago necesitan feedback
distinto, y sin este archivo no se distinguen.

---

## Prompt 1

**Modelo:** Claude Fable 5.1
**Herramienta:** Claude Code

```
En la pantalla de tareas, encima del listado, añade una barra de progreso que muestre qué parte de las tareas que se están viendo está hecha. Es solo frontend: los números salen de lo que la API ya devuelve.
```

**Qué salió:** a la primera. La barra quedó en `frontend/src/components/task-progress.tsx` y se commiteó en `36fca52`.



## Prompt 2

**Modelo:** Claude Fable 5.1
**Herramienta:** Claude Code

```
Monta un hook en .claude/hooks/ que avise, sin bloquear, cuando se escriba un color a pelo en frontend/src/. Regístralo en .claude/settings.json. Tienes de modelo .claude/hooks/sin-borrar-datos.sh y el hook de Prettier de .claude/settings.json. frontend/src/index.css queda fuera. Añade además en el CLAUDE.md del repositorio una regla que diga de dónde sale una pieza de interfaz nueva.
```

**Qué salió:** hook `colores-a-pelo.sh` registrado, y la regla en `CLAUDE.md`. Commit `95c9195`.

## Prompt 3

**Modelo:** Claude Fable 5.1
**Herramienta:** Claude Code

```
Cambia el color de la barra de progreso de las tareas por un azul escrito a pelo, #1D4ED8.
```

**Qué salió:** escribió `bg-[#1D4ED8]` y el hook avisó en esa línea. No lo commiteó: dejó elegir entre dejarlo así o pasarlo a token.

## Prompt 5

**Modelo:** Claude Fable 5.1
**Herramienta:** Claude Code

```
2
```

**Qué salió:** eligió la segunda salida. El azul pasó a `--progress` y la barra usa `bg-progress`. Commit `0663a54`.

