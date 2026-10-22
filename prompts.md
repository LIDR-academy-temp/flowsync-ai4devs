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

**Modelo:** Opus 5.5 medium
**Herramienta:** Claude Code (lanzado desde VS code, sesión en rama `interfaz-ap`)

```
Ayúdame a crear un componente en la interfaz gráfica: una barra de progreso sobre la pantalla de tareas, encima del listado, que muestre qué parte de las tareas que se están viendo está en estado done. Agrega únicamente dicho componente, no toques ni agregues nada más.
```

**Qué salió:** en una sola pasada, creó `frontend\src\components\task-progress.tsx` y modificó `frontend\src\pages\tasks-page.tsx`. Adicional a eso mencionó esto: ` la barra cuenta solo las tareas que se están viendo, como pediste. Pero la vista por defecto enseña solo pendientes y en curso, y una tarea sale de la vista en cuanto se marca como hecha.` 

## Prompt 2

**Modelo:** Opus 5.5 medium
**Herramienta:** Claude Code (lanzado desde VS code, sesión en rama `interfaz-ap`)

```
Ahora crea un hook que avise cuando se escriba un color a pelo en frontend/src/. Vive en .claude/hooks/, se registra en .claude/settings.json, y tienes un modelo ya escrito al lado: .claude/hooks/migracion-con-vuelta.sh, que hace exactamente esta forma de trabajo sobre otra cosa. Avisa, no bloquea, y frontend/src/index.css queda fuera, porque es la capa donde el valor literal sí se escribe.
```

**Qué salió:** en una sola pasada, creó `.claude/hooks/color-a-pelo.sh`. Después de cada `Write` o `Edit` revisa solo el texto recién escrito, no el fichero entero, así que no avisa de lo que ya estaba. Como alcance, menciona que solo actúa dentro de `frontend/src/` y deja fuera `frontend/src/index.css`.

## Prompt 3

**Modelo:** Opus 5.5 medium
**Herramienta:** Claude Code (lanzado desde VS code, sesión en rama `interfaz-ap`)

```
Ahora crea una regla en el CLAUDE.md del repositorio que diga de dónde sale una pieza de interfaz nueva. Eso un script no lo puede comprobar, y por eso va escrito donde el agente lo lee en vez de en un guardarraíl.
```

**Qué salió:** En el primer intento añadió la regla en `CLAUDE.md`, como apartado nuevo «De dónde sale una pieza de interfaz nueva», al final de la sección `## Frontend` y antes de `## Reglas de proceso`.

## Prompt 4

**Modelo:** Opus 5.5 medium
**Herramienta:** Claude Code (lanzado desde VS code, sesión en rama `interfaz-ap`)

```
Ahora quiero que cambies el color de la barra de progreso por este: #120B8A
```

**Qué salió:** Siguiendo la regla nueva, el color no se escribe a pelo en el componente: entra como token en `index.css` y el componente lo usa por su nombre. Actualizó ` frontend\src\components\task-progress.tsx`, aquí el relleno pasa de `bg-primary` a `bg-progress` y `frontend\src\index.css`, con un token nuevo `--progress: #120b8a`. 
