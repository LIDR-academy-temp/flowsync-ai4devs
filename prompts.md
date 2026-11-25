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

**Modelo:** Claude Opus 5.5
**Herramienta:** Claude Code

```
Lee entero el Requirement «Cuándo una tarea está vencida» de openspec/specs/tasks/spec.md, con todos sus Scenarios. Esos Scenarios son el enunciado: no añadas casos ni quites ninguno.

Escribe un único archivo de tests funcionales en backend/tests/functional/ que los ejerza entrando por HTTP, igual que entra el cliente que consume este backend. Escribe un test por Scenario y ponle el título del Scenario.

Reglas:
1. No toques ni una línea fuera de backend/tests/. Si para escribir un test necesitas cambiar algo fuera de ahí, para y dímelo en vez de cambiarlo.
2. Comprueba lo que sale en la respuesta, no lo que devuelve un método interno. El campo se llama isOverdue y viaja en el cuerpo.
3. El día de referencia se le pasa a la petición. Ningún test usa la fecha de hoy ni ningún reloj.
4. Aísla los datos como lo hacen los tests que ya hay en backend/tests/functional/. No inventes otra forma.
5. No des por hecho ningún identificador: usa el que te devuelva la creación.
6. El resultado esperado de cada test sale de su Scenario, no del código. Puedes mirar el código para saber cómo se hacen las peticiones, pero no para decidir qué deben responder. Si la spec no dice algo que necesitas, como cómo se pasa el día de referencia, pregúntame antes de decidirlo tú.

Deja los tests tal como salgan. Si alguno falla, no arregles la implementación ni ajustes el test para que pase.

Cuando esté escrito, ejecútalo con make test-e2e desde la raíz y pégame la salida entera, sin resumirla ni recortarla. Después dime, Scenario por Scenario, si su test pasó o falló.

Esta petición no cierra la unidad de trabajo, así que no abras PR.
```

**Qué salió:** escribió `backend/tests/functional/tasks/overdue.spec.ts` con 7 tests, uno por Scenario (4 pasan, 3 fallan): una tarea con fecha del día anterior al de referencia llega con `isOverdue: false`, lo que tumba «Fecha del día anterior» y deja «Darla por hecha la deja de vencer» y «Aplazar resuelve el vencimiento» parados en su comprobación previa, sin llegar a su THEN. No preguntó cómo pasar el día de referencia: lo mandó como `today` en la query tras ver en el validador que lee `request.all()`. Para «creada hace semanas» creó la tarea con `Task.create` en vez de por HTTP.
