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

## Cómo se lanzaron

Lancé todo desde la raíz del repo, en la rama `interfaz-gt`, con Claude Code en una config aislada
(`CLAUDE_CONFIG_DIR=~/.claude-aislado claude`). Esa config no carga mi `CLAUDE.md` global ni mis
hooks, así que el agente solo tenía las instrucciones y los hooks del proyecto.

Antes del primer prompt medí la línea de partida en `s12/start` (`f9787c8`):

- `frontend/src/components/ui/`: 5 piezas (alert, button, card, input, label).
- `frontend/src/index.css`: 59 valores con nombre.
- Colores a pelo en `frontend/src/` fuera de `index.css`: 0. Busqué hexadecimales, clases de paleta
  cruda tipo `bg-blue-600` y `rgb()`/`hsl()`/`oklch()`. Lo más parecido es un `text-white` en la
  variante `destructive` del botón, que viene así de shadcn.
- El botón declara las variantes default, destructive, outline, secondary, ghost y link, y los
  tamaños default, xs, sm, lg, icon, icon-xs, icon-sm e icon-lg.

No escribí estos números en el repo hasta terminar la parte A, para que el agente no los leyera.

---

# Parte A: la barra de progreso

## Prompt 1

**Modelo:** Sonnet 5.5 (`claude-sonnet-5-5`)
**Herramienta:** Claude Code 2.1.302 (config aislada, `CLAUDE_CONFIG_DIR=~/.claude-aislado`)

```
Agregá en la pantalla de tareas, encima del listado, una barra de progreso que muestre qué parte de las tareas que se están viendo está en estado done.
```

**Qué salió:** Antes de escribir nada me hizo una pregunta. Con "las tareas que se están viendo"
la barra iba a quedar casi siempre en 0% o 100%: la vista por defecto (pendientes y en curso) nunca
muestra tareas done, cada filtro muestra un solo estado y no hay una vista con todas. Me dio a elegir
entre contar todas las del equipo (la que recomendaba, que cambiaba la carga de datos) o hacerlo
literal, solo con las visibles. Elegí la literal, porque es la pieza que pide el ejercicio y no quería
que tocara la carga. No lo cuento como corrección, porque preguntó antes de escribir.

Después creó `frontend/src/components/task-progress.tsx` (45 líneas), fuera de `components/ui/`, que
siguió con 5 piezas, y lo montó en `pages/tasks-page.tsx` con 5 líneas. La barra la dibujó a mano:
dos `div`, el ancho en un `style` y `role="progressbar"`. Dijo que lo hizo así "porque no hay un
componente de progreso en components/ui/". O sea que miró el catálogo, no encontró la pieza y no lo
amplió, aunque el `CLAUDE.md` dice que las piezas de shadcn se traen con `npx shadcn@latest add` y
shadcn tiene `progress`. No reutilizó ninguna pieza. Los colores son todos con nombre (`bg-muted`,
`bg-primary`, `text-muted-foreground`): 0 colores a pelo antes y 0 después. Build y lint pasan, lo
comprobé yo. No la probó en el navegador y no hizo commit, aunque el `CLAUDE.md` pide commitear al
cerrar cada petición.

---

# Parte B: el guardarraíl

El enunciado dice que hay un hook de modelo, `.claude/hooks/migracion-con-vuelta.sh`, pero no está ni
en `s12/start` ni en ninguna otra rama del repo temporal. Así que en el prompt le apunté a los hooks
que sí hay: `datos-que-no-salen.sh`, `sin-borrar-datos.sh` y el de Prettier en `settings.json`.

## Prompt 2

**Modelo:** Sonnet 5.5 (`claude-sonnet-5-5`)
**Herramienta:** Claude Code 2.1.302 (config aislada, `CLAUDE_CONFIG_DIR=~/.claude-aislado`)
**Sesión:** la misma que el Prompt 1

```
Ahora quiero armar un guardarraíl para los colores del frontend. Son dos cosas distintas:

1. Un hook en .claude/hooks/ que avise cuando se escribe un color a pelo en un archivo de frontend/src/: un hexadecimal (#1D4ED8), una clase de la paleta cruda de Tailwind (bg-blue-600, text-red-500, etc.) o un rgb()/hsl()/oklch(). Registralo en .claude/settings.json y usá como modelo los hooks que ya hay en .claude/hooks/ y cómo están registrados.
- Tiene que avisar, no bloquear: el archivo se escribe igual, y al agente le llega el aviso con el archivo, la línea y el valor, y que use un valor con nombre de frontend/src/index.css.
- frontend/src/index.css queda afuera, porque ahí es donde sí van los valores literales.
- Que solo mire archivos de frontend/src/.
- Antes de darlo por terminado probalo pasándole por stdin el JSON que le llegaría al hook, con cuatro casos: un .tsx con un color a pelo, un .tsx sin colores, index.css con un hexadecimal y un archivo fuera de frontend/src/ con un hexadecimal. Pasame qué devolvió en cada caso y con qué código de salida.

2. Una regla en el CLAUDE.md del repo, en la sección de Frontend, que diga de dónde sale una pieza de interfaz nueva, en este orden:
- primero, una que ya exista en src/components/ui/;
- si no está y shadcn/ui la tiene, se trae con npx shadcn@latest add <componente>, no se dibuja a mano;
- solo si no hay ninguna de las dos, se arma en src/components/ con piezas de src/components/ui/, y se avisa en la respuesta que se armó y por qué.

No toques nada fuera de .claude/ y CLAUDE.md. La barra de progreso queda como está.
```

**Qué salió:** Creó `.claude/hooks/sin-colores-a-pelo.sh` (82 líneas) y lo registró en
`settings.json` como `PostToolUse` con matcher `Write|Edit`, en el mismo grupo que Prettier. Avisa
saliendo con 0 y un JSON con `additionalContext`, así que no bloquea. Detecta hexadecimales de 3, 4,
6 y 8 cifras, la paleta cruda con variantes y opacidad (`hover:text-red-500/50`) y
`rgb`/`hsl`/`oklch`/`oklab`, pero no `hsl(var(--x))`. En un `Write` mira el contenido entero y en un
`Edit` solo las líneas que vienen de `new_string`. Pasó los cuatro casos: 5 avisos en el `.tsx` con
colores y nada en los otros tres, todos con código 0. Por su cuenta probó también un `Edit` real y
falsos positivos como `&#123;` o `#root`. Avisó de dos limitaciones: un ancla tipo `href="#add"` da
un aviso falso, y con Prettier corriendo a la vez "el número de línea puede desfasarse".

Lo probé yo con casos propios en una copia fuera del repo, y lo de Prettier es peor de lo que dijo.
En un `Edit`, el hook busca en el archivo las líneas de `new_string`. Si Prettier ya cambió esa
línea (por ejemplo, comillas dobles por simples), no la encuentra y no avisa nada. Tampoco avisa con
`style={{ backgroundColor: "blue" }}`, `bg-black text-white`, `color-mix()` ni `lab()`.

En el `CLAUDE.md` puso los tres pasos en la sección de Frontend, y además un párrafo que no le pedí:
que los colores salen de `index.css`, nunca a pelo, y que el hook avisa. Lo dejé. Esta vez tampoco
hizo commit. Lo commiteé yo a mano. 1 min 11 s.

## Prompt 3

**Modelo:** Sonnet 5.5 (`claude-sonnet-5-5`)
**Herramienta:** Claude Code 2.1.302 (config aislada, `CLAUDE_CONFIG_DIR=~/.claude-aislado`)
**Sesión:** nueva, para que cargue el hook y la regla recién escritos

```
Cambiá el color de la barra de progreso por este azul: #1D4ED8
```

**Qué salió:** No escribió el azul a pelo. Creó un token: `--progress: #1d4ed8` en `:root` de
`index.css`, con su `--color-progress`, y en `task-progress.tsx` cambió `bg-primary` por `bg-progress`.
Explicó que el literal va en `index.css` "porque el proyecto solo permite hexadecimales en index.css",
que no tocó `--primary` para no pintar de azul todos los botones y que el token no tiene variante para
`.dark`. Build en verde, no lo vio en el navegador y no hizo commit. 20 s.

Lo importante lo vi en el transcript de la sesión: **el hook no se ejecutó ni una vez**. El agente no
usó `Write` ni `Edit`. Hizo los dos cambios con un `python3` dentro de un `Bash`, y el hook solo escucha
`Write|Edit`. Por lo mismo tampoco corrió el Prettier automático (lo chequeó a mano con
`prettier --check`). Lo que lo frenó fue el `CLAUDE.md`, justo el párrafo de colores que agregó él en
el Prompt 2 sin que se lo pidiera. Si hubiera metido el hex en el `.tsx` por la misma vía, nada lo
habría avisado. Valores con nombre en `index.css`: de 59 a 61. Colores a pelo fuera de `index.css`:
siguen en 0. Este resultado lo commiteé tal cual.

## Prompt 4

**Modelo:** Sonnet 5.5 (`claude-sonnet-5-5`)
**Herramienta:** Claude Code 2.1.302 (config aislada, `CLAUDE_CONFIG_DIR=~/.claude-aislado`)
**Sesión:** la misma que el Prompt 3

Lo agregué porque en el Prompt 3 el hook no llegó a correr, y quería verlo saltar en uso real al
menos una vez.

```
Ahora poné el azul directo en la clase de la barra, con bg-[#1D4ED8], sin pasar por index.css.
```

**Qué salió:** Lo hizo en un solo `Bash`: `git checkout src/index.css`, un `sed -i` sobre
`task-progress.tsx` para cambiar `bg-progress` por `bg-[#1D4ED8]`, `prettier --write` y el build.
Respondió que había quitado el token de `index.css` y que, como esto va contra la regla del
`CLAUDE.md`, "el hook sin-colores-a-pelo.sh va a avisar con este cambio". Las dos cosas son falsas.
El token yo ya lo había commiteado, así que el `checkout` no restauró nada (`Updated 0 paths from the
index`) y `--progress` quedó en `index.css` sin que nadie lo use. Y el hook no avisó: otra vez editó por
`Bash`, y en el transcript el aviso aparece 0 veces. Colores a pelo fuera de `index.css`: de 0 a 1, y
sin ningún aviso. El agente cree que el guardarraíl lo está cuidando y no es así. 8 s.
