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

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Busca valores de color escritos a pelo en frontend/src/. Hexadecimales (#1D4ED8) o clases de paleta cruda (bg-blue-600). 

Lístame todos los que encuentres y múestrame la cantidad que son.
```

## Prompt 2

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Crea una barra de progreso sobre la pantalla de tareas, encima del listado, que enseñe qué parte de las tareas que se están viendo está en estado done.
```

## Prompt 3

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
## Objetivo

Implementar la Parte B del ejercicio FlowSync mediante dos mecanismos complementarios:

1. Un hook de Claude Code que advierta cuando se introduzcan colores literales en el frontend, sin bloquear la operación.
2. Una regla en `CLAUDE.md` que obligue al agente a consultar el catálogo de componentes antes de crear una nueva pieza de interfaz.

## 1. Análisis previo

Antes de modificar el repositorio:

- Inspecciona `.claude/hooks/migracion-con-vuelta.sh` para comprender el patrón de implementación existente.
- Revisa `.claude/settings.json` y `CLAUDE.md`.
- Identifica el catálogo de componentes y los tokens de diseño definidos en `frontend/src/index.css`.
- Reutiliza las convenciones y mecanismos existentes.

## 2. Implementación del hook

Crea un hook en `.claude/hooks/` y regístralo en `.claude/settings.json`.

### Requisitos funcionales

- Detectar colores literales como valores hexadecimales, `rgb()`, `rgba()`, `hsl()` y `hsla()`.
- Aplicarse exclusivamente a archivos dentro de `frontend/src/`.
- Excluir `frontend/src/index.css`, donde se definen los tokens.
- Emitir una advertencia clara recomendando utilizar los tokens del sistema de diseño.
- No bloquear la operación ni impedir que Claude continúe trabajando.

### Detección de cambios

**El hook debe detectar preferentemente colores literales introducidos por la operación actual, no simplemente colores existentes en el archivo.**

Para ello:

- Considera la información disponible en los eventos de escritura o edición de Claude Code.
- En operaciones de edición, analiza el contenido nuevo introducido por la modificación.
- En operaciones de creación o escritura completa, analiza el contenido escrito.
- Evita advertencias por colores preexistentes que no hayan sido modificados.
- Si las limitaciones del mecanismo de hooks impiden distinguir con precisión los cambios, documenta esa limitación y adopta una solución sencilla y razonable, priorizando evitar falsos positivos.

No implementes un sistema complejo de seguimiento de estados ni agregues dependencias innecesarias para resolver este requisito.

## 3. Regla de gobernanza en CLAUDE.md

Incorpora una regla que establezca:

**Antes de crear una nueva pieza o componente de interfaz, el agente debe consultar el catálogo de componentes existente.**

El agente debe:

- Reutilizar un componente existente cuando resuelva la necesidad.
- Priorizar su adaptación mediante configuración o composición cuando sea posible.
- Crear un componente nuevo únicamente cuando no exista una alternativa adecuada.
- Respetar los tokens, patrones y convenciones del sistema de diseño.
- Evitar introducir componentes o estilos duplicados.

La regla debe incluir la ubicación real del catálogo, identificada durante el análisis del repositorio.

Esta verificación es semántica y debe implementarse como una instrucción para el agente, no como un hook.

## 4. Validación

Comprueba los siguientes escenarios:

1. Introducir un color literal en un componente genera una advertencia.
2. Modificar un archivo que ya contiene colores literales, sin agregar nuevos, no genera advertencias innecesarias.
3. Introducir un color literal en `frontend/src/index.css` no genera advertencias.
4. Utilizar tokens de diseño no genera advertencias.
5. El hook no bloquea las operaciones.
6. Los hooks existentes continúan funcionando.
7. La regla de `CLAUDE.md` queda integrada sin duplicar instrucciones existentes.

## 5. Entregables

Al finalizar:

- Resume los archivos creados o modificados.
- Explica qué evento dispara el hook y cómo identifica los colores introducidos.
- Muestra la regla incorporada en `CLAUDE.md`.
- Presenta los resultados de las pruebas realizadas.
- Documenta las limitaciones conocidas.

## Restricciones

- Realiza únicamente los cambios necesarios.
- No refactorices componentes existentes.
- No modifiques los tokens del sistema de diseño.
- No agregues dependencias innecesarias.
- El hook debe advertir, nunca bloquear.
```


## Prompt 4

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Cambia el color de la barra de progreso sobre la pantalla de tareas, por un color azul escrito a pelo. No uses el catálogo.

```