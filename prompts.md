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
Vamos a realizar únicamente la Parte A del ejercicio de la sesión 11: escribir los tests funcionales del Requirement «Cuándo una tarea está vencida».

Objetivo:
Crear un archivo de tests funcionales que cubra, mediante peticiones HTTP, todos los Scenarios del Requirement «Cuándo una tarea está vencida» definido en:

openspec/specs/tasks/spec.md

Instrucciones obligatorias:

1. Lee completo ese Requirement y todos sus Scenarios antes de escribir los tests.
2. Inspecciona los tests existentes en backend/tests/functional/ para reutilizar:
   - su estructura;
   - la autenticación;
   - las factories;
   - el aislamiento de la base de datos;
   - la forma de crear tareas;
   - la forma de realizar peticiones HTTP y comprobar respuestas.
3. Escribe un test funcional por cada Scenario del Requirement.
4. Los tests deben entrar por HTTP, igual que un cliente real. No pruebes directamente isOverdueOn ni ningún método interno.
5. Comprueba el campo isOverdue recibido en el cuerpo de la respuesta.
6. Pasa explícitamente el día de referencia en cada petición. No uses la fecha actual, Date.now(), new Date() sin una fecha fija ni ningún reloj del sistema.
7. No supongas identificadores: utiliza siempre el id devuelto al crear la tarea.
8. Modifica exclusivamente archivos dentro de backend/tests/.
9. No modifiques implementación, modelos, controladores, transformers, validadores, rutas, migraciones, configuración, documentación ni archivos generados.
10. No intentes corregir la implementación aunque los tests fallen.
11. No hagas commit ni crees otra rama.

Cuando termines de escribirlos:

1. Ejecuta make test-e2e desde la raíz del repositorio.
2. Conserva y muéstrame la salida completa.
3. Indica:
   - cuántos tests existentes continúan pasando;
   - cuántos tests nuevos pasan;
   - cuántos tests nuevos fallan;
   - el nombre exacto de cada test nuevo que pasa o falla;
   - por qué falla cada caso, sin corregirlo.
4. Si todos los tests nuevos nacen verdes, detente y adviértemelo: no cambies implementación ni debilites las aserciones.

Antes de terminar, muestra:

git status -sb
git diff --name-status
git diff --stat

No hagas ningún cambio después de ejecutar los tests.
```

**Qué salió:** (opcional, una línea) funcionó a la primera / tuve que insistir / me inventó una ruta que no existe.



## Prompt 2

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Realiza únicamente la Parte B del ejercicio de la sesión 11: bajar la regla de vencimiento a tests unitarios.

Contexto:
La regla está implementada en el método isOverdueOn de:

backend/app/models/task.ts

Ya existe el archivo funcional:

backend/tests/functional/tasks/overdue.spec.ts

No lo modifiques. Tampoco corrijas todavía la implementación: el ejercicio debe terminar con los tests nuevos en rojo.

Objetivo:
Crear el directorio backend/tests/unit/ si todavía no existe y escribir tests unitarios que llamen directamente a isOverdueOn, sin servidor HTTP y sin base de datos.

Casos obligatorios:

1. Una tarea pendiente con fecha anterior al día de referencia está vencida.
2. Una tarea pendiente con fecha exactamente igual al día de referencia no está vencida.
3. Una tarea pendiente con fecha posterior al día de referencia no está vencida.
4. Una tarea pendiente sin fecha no está vencida.
5. Una tarea done con fecha anterior al día de referencia no está vencida.
6. La regla produce el mismo resultado cuando la fecha llega:
   - como texto AAAA-MM-DD;
   - como objeto Date equivalente.

Restricciones obligatorias:

- Modifica exclusivamente archivos dentro de backend/tests/unit/.
- No modifiques backend/tests/functional/.
- No modifiques modelos, controladores, transformers, rutas, validadores, migraciones, configuración ni archivos generados.
- No uses HTTP.
- No conectes ni consultes la base de datos.
- No uses factories que persistan registros.
- No uses la fecha actual ni ningún reloj del sistema.
- Usa fechas fijas y explícitas.
- No cambies los tipos o la implementación para conseguir que compile o pase.
- Si TypeScript no permite representar el objeto Date debido al tipo declarado actualmente, resuelve esa necesidad únicamente dentro del test mediante una conversión explícita que documente la discrepancia real entre el tipo declarado y el valor recibido en ejecución.
- No debilites ninguna aserción.
- No hagas commit ni crees otra rama.

Antes de escribir, inspecciona:

- backend/app/models/task.ts;
- la configuración actual de las suites de Japa;
- las convenciones mínimas necesarias del proyecto.

Después:

1. Ejecuta make test-unit desde la raíz.
2. Muéstrame la salida completa.
3. Indica para cada test nuevo si pasó o falló y por qué.
4. No corrijas ningún fallo.
5. Muestra al terminar:

git status -sb
git diff --name-status
git diff --stat
git diff --check

Detente después de informar los resultados. No modifiques nada más.
```

**Qué salió:** (opcional, una línea) funcionó a la primera / tuve que insistir / me inventó una ruta que no existe.



## Prompt 3

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Completa únicamente HALLAZGOS.md y no modifiques ningún otro archivo.

Usa exclusivamente la evidencia medida durante las partes A y B del ejercicio. El archivo debe contener exactamente tres apartados, con una sola línea de respuesta en cada uno:

1. Casos nuevos que fallaron y tests anteriores que continuaron verdes.
2. Casos nuevos que pasaron y explicación del verde engañoso.
3. Una duda concreta surgida durante el ejercicio.

Datos medidos:

- Antes del ejercicio existían 40 tests y todos pasaban.
- Se añadieron 7 tests funcionales: 4 pasaron y 3 fallaron.
- Se añadieron 8 tests unitarios: 6 pasaron y 2 fallaron.
- En total fallaron 5 de los 15 casos nuevos.
- Los 40 tests anteriores continuaron verdes.
- Los funcionales que necesitaban reconocer una fecha pasada como vencida recibieron false porque PostgreSQL entrega dueDate como Date, aunque el tipo declarado dice string.
- El test unitario de una tarea done con fecha pasada falló porque isOverdueOn no comprueba el estado.
- Los casos Date con fecha igual o posterior pasaron por una razón engañosa: esperaban false y la comparación defectuosa también devuelve siempre false.
- La duda fue si el verde de los casos igual y posterior demostraba compatibilidad entre string y Date; los tests mostraron que no.

Requisitos:

- Conserva la estructura existente de HALLAZGOS.md si ya viene como plantilla.
- Escribe una sola línea por apartado.
- Sé concreto e incluye las cifras medidas.
- No corrijas la implementación.
- No modifiques los tests.
- No hagas commit.
- Al terminar muestra git diff --check y git status -sb.
```

**Qué salió:** (opcional, una línea) funcionó a la primera / tuve que insistir / me inventó una ruta que no existe.
