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

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Añade en la pantalla de tareas, justo encima del listado, una barra de progreso que muestre qué proporción de las tareas visibles está en estado done.
```

**Qué salió:** pidió aclarar qué significaba «visibles»; elegí la interpretación literal, creó la barra fuera de `components/ui` y mantuvo el catálogo en 5 piezas. La medición inicial encontró 0 colores con el patrón usado; el guardarraíl posterior descubrió 1 preexistente (`text-white`), pero la barra no añadió ninguno.



## Prompt 2

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Monta el guardarraíl de interfaz del proyecto en dos piezas.

Primera pieza: crea un hook de Claude Code dentro de `.claude/hooks/` y regístralo en `.claude/settings.json`, junto con los hooks existentes. Usa `.claude/hooks/migracion-con-vuelta.sh` como modelo de la forma de integración.

El hook debe avisar cuando una operación de escritura introduzca colores literales dentro de `frontend/src/`, incluyendo colores hexadecimales y clases de paleta cruda como `bg-blue-600`, `text-red-500` o equivalentes. Debe excluir `frontend/src/index.css`, porque allí se declaran los valores base. El hook es informativo: muestra un aviso claro, pero nunca bloquea la operación.

Segunda pieza: añade una regla breve en la sección de proceso de `CLAUDE.md` que indique que, antes de crear una pieza de interfaz, se revisan las piezas existentes en `frontend/src/components/ui`; si no existe una adecuada, la nueva pieza reutilizable se incorpora allí y después se consume desde la pantalla. La regla también debe indicar que los estilos deben utilizar los valores con nombre definidos por el proyecto y no colores literales.

No cambies la barra de progreso ni ningún otro componente del frontend. No instales Storybook, herramientas de testing visual ni dependencias nuevas.

Comprueba la sintaxis del hook y demuestra que una operación que no escribe colores literales no genera avisos. Explica qué archivos modificaste y cómo verificaste que el hook avisa sin bloquear. Cierra el trabajo siguiendo las reglas de commit del repositorio.
```

**Qué salió:** no encontró el hook de referencia mencionado y utilizó dos hooks existentes; creó un `PostToolUse` que avisa sin bloquear, añadió la regla a `CLAUDE.md` y demostró el aviso con `bg-blue-600`. Detectó además un `text-white` preexistente.




## Prompt 3

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Cambia el relleno de la barra de progreso a bg-blue-600, escrito tal cual como color literal. No uses un valor con nombre en su lugar.
```

**Qué salió:** advirtió que la petición contradecía `CLAUDE.md`, realizó el cambio por ser una decisión explícita, el hook detectó `bg-blue-600` y avisó sin bloquear; el cambio quedó en el commit `d0e58b3`.
