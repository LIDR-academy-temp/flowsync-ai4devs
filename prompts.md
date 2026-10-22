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

**Modelo:** Opus 5.5 xLow
**Herramienta:** Claude Code

```
 Parte A: En la pantalla de tareas del Front End , justo encima del listado, añade una barra de progreso que muestre que proporcion de las tareas visibles esta en estado "Done".

```

**Qué salió:**  Pidio aclarar "visibles", elegi la interpretación literal; creo la barra de progreso fuera de components/ui y mantuvo el catalogo en 5 piezas y 59 decisiones de diseño que no entendia muy bien; la medición inicial encontro 0 colores con el patron usado; el guardarraíl posterior descubrio 1 pre-existente (text-white), pero la barra no lo añadio.


## Prompt 2

**Modelo:** Opus 5.5 xLow
**Herramienta:** Claude Code


```
 Parte B: Monta un guardarraíl de interfaz del proyecto en dos partes:

 Primera parte: crea un hook de Claude Code dentro de @claude/hooks/ y regístralo en @.claude/settings.json, junto con los hooks existentes. Usa @claude/hooks/migracion-con-vuelta.sh` como modelo de la forma de integracion.
 El hook debe avisar cuando una operacion de escritura introduzca colores literales dentro de @frontend/src/, incluyendo colores hexadecimales y clases de paleta cruda como `bg-blue-600`, `text-red-500` o equivalentes. Debe excluir @frontend/src/index.css, p>
 
 Segunda parte: añade una regla breve en la sección de proceso de `CLAUDE.md` que indique que, antes de crear una pieza de interfaz, se revisan las piezas existentes en `frontend/src/components/ui`; si no existe una adecuada, la nueva pieza reutilizable se i>
 No cambies la barra de progreso ni ningún otro componente del frontend. No instales Storybook, herramientas de visual testing ni dependencias nuevas.
 
 Finalmente, comprueba la sintaxis del hook y demuestra que una operacion que no escribe colores literales no genera avisos.
 Explicame que archivos modificaste y como verificaste que el hook avisa sin bloquear.
 Y cierra el trabajo siguiendo las reglas de commit al repositorio.

```

**Qué salió:**  25 Reviso los hooks existentes para copiar su forma; limito a #frontend/src/ y mantine la exclusion de @index.css para el aviso; prueba una escritura sin colores literales y reescribe el hook a PostToolUse corrigiendo la regla del CLAUDE.ms que decia PreToolUse; no puede comitear porque mis credenciales de Git han expirado y no tiene con que firmar (tocara refrescar a mano al final) y por resumir, el hook avisa pero no bloquea porque es PostToolUse; si fuese PreToolUse el aviso del hook no llegaria a nadie.
 

## Prompt 3

**Modelo:** Opus 5.5 xLow
**Herramienta:** Claude Code

```
Quiero que cambies la barra de progreso que acabas de crear con un relleno bg-blue-600, escrito a pelo como color literal.
No quiero que utilices un valor con nombre en su lugar. Recuerda no tocar el catalogo.
```

**Qué salió:**  Se prueba el nuevo hook que avisa pero no bloquea; muestra el aviso por additionalContext y escribe llegando al CSS compilado sin tocar el catalogo; intenta commitear en 0bb5da3 pero persiste el error de credenciales de Git que paso a corregir manualmente.

