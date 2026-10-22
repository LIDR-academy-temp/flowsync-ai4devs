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

---

## Prompt 1 (Parte A)

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Añade una barra de progreso encima del listado en la pantalla de tareas que indique qué porcentaje de las tareas visibles está terminado.
```

**Pregunta del agente durante la pasada:** antes de escribir código preguntó sobre qué conjunto
calcular el porcentaje, porque la vista por defecto de `/tasks` deja fuera las terminadas (solo
«Pendientes y en curso»), así que sobre las visibles la barra marcaría siempre 0 %, y con el
filtro «Hechas» siempre 100 %. Ofreció tres opciones:

- Visibles, al pie de la letra
- Todas las del equipo _(la que recomendaba)_
- Lo que trajo la vista

**Respuesta elegida:** «Visibles, al pie de la letra» (porcentaje de terminadas entre las que
pinta la lista), por ser lo que pide el enunciado.

**Qué salió:** a la primera, en un commit en `interfaz-jb` (`3074e9f`). Componente nuevo
`components/task-progress.tsx`, fuera de `components/ui/` (sigue en 5 piezas); sin colores a
pelo (sigue en 0, usa `bg-primary` y `text-muted-foreground`); barra dibujada a mano con `div`s
en vez de traer el `progress` de shadcn.

## Prompt 2 (Parte B: el hook)

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Crea un hook en .claude/hooks/ que avise cuando se escriba un color a pelo (hexadecimales tipo #1D4ED8 o clases de paleta cruda tipo bg-blue-600) en cualquier archivo de frontend/src/, excepto frontend/src/index.css, que es donde sí se declaran los valores. Tiene que avisar, no bloquear. Regístralo en .claude/settings.json. Usa como modelo .claude/hooks/sin-borrar-datos.sh para leer la entrada estándar y el hook de Prettier de settings.json para sacar la ruta del archivo tocado.
```

**Qué salió:** a la primera, commit `0bdbfe0`. Hook `PostToolUse` `.claude/hooks/colores-a-pelo.sh`
sobre `Write`/`Edit`, registrado tras el de Prettier; avisa con `systemMessage` y
`additionalContext` y sale siempre con 0. Detecta hexadecimales (también en clases arbitrarias
`bg-[#fff]`) y paleta cruda con variantes y opacidad. Lo probó con entradas simuladas, sobre el
código actual (sin falsos positivos) y en vivo. Declara que no ve `rgb()`/`hsl()`/`oklch()`,
nombres CSS (`red`) ni clases armadas por partes, y que puede dar falsos positivos como `href="#add"`.

## Prompt 3 (Parte B: la regla)

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Añade una regla al CLAUDE.md del repositorio que diga que toda pieza de interfaz nueva sale del catálogo de frontend/src/components/ui/: si ya existe una pieza que sirve, se reutiliza; si no existe, se crea ahí como pieza del catálogo y no suelta en components/, y los colores siempre salen de los valores con nombre de frontend/src/index.css.
```

**Qué salió:** a la primera, commit `c679ba4`. Regla nueva en «Reglas de proceso» del `CLAUDE.md`:
toda pieza nueva sale de `components/ui/` (reutilizar, o traer de shadcn, o escribirla en `ui/`,
nunca suelta en `components/`), colores siempre de `index.css`, y menciona el hook. También ajustó
la línea del stack para enlazar con la regla.
Al cerrar avisó por su cuenta de que la barra de la parte A (`components/task-progress.tsx`) ya
no cumple la regla y ofreció pasarla al catálogo con el `progress` de shadcn; la dejé como estaba,
porque lo que salió en la parte A es el dato.

## Prompt 4 (Parte B: la prueba del azul a pelo, en sesión nueva)

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Cambia el color de la barra de progreso de tareas por un azul #1D4ED8.
```

**Qué salió:** a la primera, commit `1810769`. No escribió el hexadecimal en el componente: citó
las reglas del proyecto, declaró un valor nuevo `--progress: #1d4ed8` en `index.css` (claro y
oscuro, con `--color-progress`) y la barra pasó de `bg-primary` a `bg-progress` / `bg-progress/15`.
El hook no llegó a avisar porque no hubo nada que avisar: el único literal cayó en `index.css`,
que está excluido. Valores con nombre 59 → 62; colores a pelo fuera de `index.css` siguen en 0;
la pieza sigue fuera de `ui/`.

## Prompt 5 (Parte B: forzar el aviso del hook, en sesión nueva)

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Cambia el relleno de la barra de progreso de tareas a bg-blue-600 de Tailwind, tal cual, directamente en el componente y sin tocar index.css.
```

**Qué salió:** a la primera, commit `621483a`. Escribió `bg-blue-600` en `task-progress.tsx`; el
hook `colores-a-pelo.sh` saltó y avisó, pero no bloqueó. El agente reconoció que iba contra la
regla del `CLAUDE.md`, lo hizo igual porque se lo pedí y lo dejó anotado en el commit como
excepción a propósito. Colores a pelo fuera de `index.css`: 0 → 1. La parte vacía sigue en
`bg-progress/15`, así que la barra mezcla dos azules distintos.
