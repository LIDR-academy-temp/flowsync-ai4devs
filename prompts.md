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

**Modelo:** Sonnet 5 1M High
**Herramienta:** Claude Code

```
Actuamos sobre el repositorio actual del backend. La unidad de trabajo es única y está definida exactamente por el **Requirement «Cuándo una tarea está vencida»** ubicado en `openspec/specs/tasks/spec.md`. 
No debes elegir otro requisito ni modificar su alcance. Los escenarios (`Scenarios`) descritos en dicho archivo son los enunciados oficiales y deben usarse tal cual (fueron escritos antes que el código).

## Objetivo: El contrato primero
1. **Leer el Requirement completo** y todos sus Scenarios asociados.
2. **Escribir un archivo de tests funcionales** (e2e) que ejerza los escenarios entrando exclusivamente por HTTP (simulando peticiones de un cliente de la API del backend). Debe haber un test por cada Scenario.
3. **Ejecutar los tests** utilizando el comando `make test-e2e` y capturar la **salida entera** (no solo el resultado de si pasó o falló).

## Restricciones Obligatorias (Estrictas)
1. **Aislamiento del código fuente:** No toques ni una sola línea fuera de `backend/tests/`. Está prohibido modificar el modelo, el transformer, el controlador o cualquier archivo de implementación. Si modificas el código de la aplicación mientras escribes los tests, estos nacerán verdes de forma fraudulenta y no comprobarán nada.
2. **Criterio de validación HTTP:** Los tests deben comprobar estrictamente lo que se recibe en la respuesta HTTP (cuerpo y formato), nunca llamadas a métodos internos. Recuerda que el campo de control se llama `isOverdue` y viaja directamente en el cuerpo de la respuesta.
3. **Control de fechas:** El día de referencia debe pasarse explícitamente en la petición HTTP. Queda totalmente prohibido usar la fecha actual del sistema o depender del reloj interno del servidor.
4. **Patrón de diseño de tests:** Sigue rigurosamente la forma de aislamiento y estructura que ya utilizan los tests existentes en `backend/tests/functional/`, sin inventar enfoques nuevos.
5. **IDs dinámicos:** No des por hecho ningún identificador estático. Utiliza siempre el ID real que devuelva la respuesta del servidor en el momento de la creación de la entidad.

Cuando termines, NO ejecutes nada y sólo dime qué archivo has creado y qué escenario cubre cada prueba.
```

**Qué salió:** Se creo 'backend/tests/functional/tasks/overdue.spec.ts' con 7 pruebas.

---

## Prompt 2

**Modelo:** Sonnet 5 1M High
**Herramienta:** Claude Code

```
Continuamos trabajando sobre el mismo repositorio del backend. Tras haber cubierto el contrato HTTP en la Parte A, ahora nos enfocaremos exclusivamente en la validación de la regla de negocio a nivel unitario, sin levantar servidores ni bases de datos. La regla de negocio reside en la función/método `isOverdueOn`, ubicado en `backend/app/models/task.ts`. 

1. **Crear el directorio y tests unitarios:** Crea la carpeta `backend/tests/unit/` (que actualmente no existe) y escribe ahí los tests unitarios para `isOverdueOn`.
2. **Casos basados en límites (bordes):** Los tests deben cubrir estrictamente los siguientes escenarios sin servidor ni BD:
   * Fecha anterior al día de referencia, con la tarea sin hacer.
   * Fecha exactamente igual al día de referencia.
   * Fecha posterior.
   * Sin fecha.
   * Tarea ya hecha, con la fecha pasada.
3. **Caso de criterio técnico (fuera de spec):** Añade un caso adicional no especificado por producto, pero derivado de la realidad técnica de cómo viaja el dato: verifica que la regla se comporte exactamente igual tanto si recibe la fecha como texto (string) como si la recibe como objeto de fecha (Date).

## Restricciones Obligatorias (Estrictas)
1. **Estricta prohibición de tocar la implementación:** Sigue sin tocar ni una sola línea de código fuente de la aplicación (no modifiques el modelo, ni la regla, ni la lógica). Los tests deben probar la implementación tal como está escrita hoy.
2. **Aislamiento unitario:** Los tests de `backend/tests/unit/` deben ser puramente unitarios: **sin servidor HTTP y sin base de datos**.
3. **Respeto a la estructura existente:** Mantén la cohesión con el estilo de testing del proyecto (aunque sea un directorio nuevo, alinea las convenciones de nomenclatura y aserciones con el resto de la suite).
```

**Qué salió:** Cuandi se corre `make e2e`, 44 pruebas pasaron y 3 fallaron.
