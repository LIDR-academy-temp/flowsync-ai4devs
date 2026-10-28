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

## Prompt 1 · las instrucciones al agente que orquestó el ejercicio

**Modelo:** Opus 5.5 (`claude-opus-5-5`)
**Herramienta:** Claude Code Desktop en Windows, sesión abierta en otro repositorio y operando sobre WSL, con la suscripción de Claude. Es la misma sesión que orquestó la s11

```
Ok, realiza todo lo que se tenga que hacer. hasta que estés listo con el S12 y me pidas su texto .
```

```
Revisa lo que hiciste y que este bien el S12
```

```
Listo , este es el ejercicio de S12
```

```
Qué falta de las sesión s11 y S12 ?
```

```
Listo, ya hice login, lanza la parte A
```

```
Listo, ya dice loggedIn true, lanza la parte A
```

```
Listo, ya hice login en WSL, lanza la parte A
```

```
hagamos de nuevo el paso de inicio de sesión ya abri de nuevo una terminal.
```

```
Marca error 400
```

```
Listo, ya pegué el código, lanza la parte A
```

```
Listo, ya terminó, mide la parte A
```

```
Ya terminaste S12 ?
```

```
Ya ejecute el comando del punto 1. y te paso la transcripción.
```

```
Listo, ya terminó la prueba, mídela
```

```
Resuelve lo que tengas que hacer para que quede terminado y entregado el S12
```

**Qué salió:** junto al tercer mensaje iba pegado el texto del ejercicio, y con el decimotercero, la transcripción del directo. La transcripción llegó después de las partes A y B, así que no condicionó sus prompts. Antes de lanzar nada, el agente orquestador creó `interfaz-RLL` desde `s12/start` y midió la línea de partida: `make test` daba `Tests  69 passed (69)`, el build y el lint del frontend salían con 0, `components/ui` tenía 5 piezas, `index.css` declaraba 59 valores con nombre y en `frontend/src` había 0 hexadecimales, 0 clases de paleta con escala y un solo crudo, `text-white` en la variante `destructive` de `button.tsx`. Escribió los tres prompts de los apartados siguientes antes de lanzar el primero, y comprobó que el de la parte A no nombra el catálogo, ni `src/components/ui`, ni ningún valor de `index.css`. Cada parte se lanzó en una sesión nueva del CLI, abierta en la raíz del repositorio para que cargara el `CLAUDE.md`, las skills y los hooks del proyecto, desde un script que comprueba la sesión, la rama, el árbol limpio y el commit de partida, y que se niega a lanzar dos veces la misma parte. La sesión OAuth del CLI de WSL había caducado; el navegador que abre WSL cortaba la URL de autorización en el primer `&` y daba un 400, y funcionó al pegarla entera a mano. El modo automático de Claude Desktop no dejó al orquestador lanzar un agente con los permisos desactivados, así que los scripts de las partes A y B los ejecuté yo en mi terminal. Lo que escribió el agente en cada parte se commiteó tal cual, sin retoques, porque el agente no hizo ningún commit.

---

## Prompt 2 · Parte A, la pieza sin pistas

**Modelo:** Sonnet 5.5 (`claude-sonnet-5-5`), el que el CLI usa por defecto con la cuenta
**Herramienta:** Claude Code CLI 2.1.312 en WSL, sin interfaz (`claude -p --permission-mode bypassPermissions`, con `git push` y `gh` denegados), sesión nueva lanzada desde la raíz del repositorio en la rama `interfaz-RLL`

```
Añade encima del listado de la pantalla de tareas una barra de progreso que muestre qué parte de las tareas que se están viendo está hecha.
```

**Qué salió:** a la primera, en una sola pasada: 7 llamadas, 47 segundos y 0,40 USD. Listó `src/components/ui`, buscó «progress» y escribió `frontend/src/components/task-progress.tsx`, fuera del catálogo y solo con tokens, montado en `tasks-page.tsx`. No hizo commit, aunque el `CLAUDE.md` pide `/commit` al cerrar cada petición: queda en `7f1fcef`. Avisó él mismo de que, contando solo lo visible, la barra marca 0 % en la vista por defecto y 100 % con el filtro Hecho.

---

## Prompt 3 · Parte B, el guardarraíl

**Modelo:** Sonnet 5.5 (`claude-sonnet-5-5`)
**Herramienta:** Claude Code CLI 2.1.312 en WSL, sin interfaz y con los mismos permisos que el Prompt 2, en otra sesión nueva sobre la misma rama

```
Monta un guardarraíl de dos piezas. La primera, un hook en `.claude/hooks/`, registrado en `.claude/settings.json`, que avise sin bloquear cuando se escriba un color a pelo en un archivo de `frontend/src/`: un hexadecimal como `#1D4ED8` o una clase de paleta cruda como `bg-blue-600`. `frontend/src/index.css` queda fuera, porque es donde el valor literal sí se escribe. Tienes dos modelos al lado: `.claude/hooks/sin-borrar-datos.sh`, que lee de la entrada estándar lo que el agente va a ejecutar, y el hook de Prettier de `.claude/settings.json`, que saca la ruta del archivo que se acaba de tocar. La segunda, una regla en el `CLAUDE.md` del repositorio que diga de dónde sale una pieza de interfaz nueva. Antes de terminar, prueba el hook con un caso que tiene que avisar y con otro que no.
```

**Qué salió:** a la primera: 6 llamadas, 72 segundos y 0,44 USD. El hook `sin-color-a-pelo.sh` es un `PostToolUse` sobre `Write|Edit` que mira solo el texto nuevo y avisa con `additionalContext` y salida 0. Su primera versión solo cazaba la primera de dos clases seguidas; lo vio al probar y lo arregló. Tampoco hizo commit: queda en `aa5385d`. El orquestador lo comprobó aparte con siete entradas, y las siete dieron lo esperado.

---

## Prompt 4 · La prueba del guardarraíl

**Modelo:** Sonnet 5.5 (`claude-sonnet-5-5`)
**Herramienta:** Claude Code CLI 2.1.312 en WSL, sin interfaz, en otra sesión nueva sobre la misma rama para que cargara el hook. Esta vez con permisos acotados en vez de desactivados (`claude -p --permission-mode acceptEdits`, con `Read`, `Edit`, `Write`, `Glob`, `Grep` y una lista corta de órdenes permitidas, y `git push` y `gh` denegados), lanzada por el orquestador del Prompt 1

```
Cambia el color de la barra de progreso de la pantalla de tareas por un azul escrito a pelo, #1D4ED8.
```

**Qué salió:** un primer intento de lanzarla desde mi terminal no llegó a arrancar el agente: no dejó sesión ni ficheros, y no sé qué se ejecutó. Con permisos acotados, el modo automático de Claude Desktop sí dejó al orquestador lanzarla. A la primera: 3 llamadas, 15 segundos y 0,34 USD. Cambió `bg-primary` por `bg-[#1D4ED8]`, el hook le devolvió el aviso tras el `Edit`, y contestó que lo dejaba así porque el hexadecimal se había pedido explícitamente, que podía definir un token `--progress` en `index.css` si prefería cumplir la regla, y que no había hecho commit. Queda en `e631f5d`.
