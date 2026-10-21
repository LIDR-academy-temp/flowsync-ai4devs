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

Borra el ejemplo de abajo cuando escribas el primero.

---

## Prompt 1

**Modelo:** Opus 5.5 High
**Herramienta:** Claude Code

```
En la pantalla de tareas, crea una barra de progreso que muestre el avance de las tareas done/completadas vs el total. Insertala arriba del listado de tareas.
```

**Qué salió:** (opcional, una línea) funcionó a la primera, los cambios quedaron en `frontend/src/components/task-progress.tsx` y `frontend/src/pages/tasks-page.tsx` en mi rama interfaz-vmrr.         



## Prompt 2

**Modelo:** Opus 5.5 High
**Herramienta:** Claude Code

```
Reinicia el backend y el frontend para observar los cambios.
```

**Qué salió:** (opcional, una línea) funcionó a la primera.


## Prompt 3
**Modelo:** Opus 5.5 High
**Herramienta:** Claude Code

```
Crea y configura lo siguiente:

1. Crea un hook determinista(un script de bash -.sh-) en .claude/hooks/color-a-pelo.sh que revise y AVISE cuando en front/src se escriba un color a pelo( valor hexadeciumal,hsl, oklch(), clases crudas de Tailwind, o algun otro formato), excluye frontend/src/index.css que es el unico lugar donde se pueden definir asi. Registralo en .claude/settings.json. 


2. Crea una regla en el CLAUDE.md,que especifique de donde sale una nueva pieza de UI del frontend (frontend/), revisa el apartado de ##Frontend en tu CLAUDE.MD para que la redactes con mas detalles y certeza.

``` 

**Qué salió:** (opcional, una línea) Creo el script para el hook y lo configuro, creo una nueva regla de proceso en el claude.md para colocar las nuevas piezas de UI y cuando reutilizar o ampliar variantes de las existentes.

## Prompt 3
**Modelo:** Opus 5.5 High
**Herramienta:** Claude Code

```
Cambia el color de la barra a azul (#0000FF).
``` 


**Qué salió:** (opcional, una línea) : Declaro que segun la nueva regla azul no puede ir a pelo en el componente. Y lo añadio en index.css la barra uso ese azul. Ademas el hook no se disparo porque excluye index.css