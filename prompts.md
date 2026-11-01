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

## Fuentes y estructura

Todos los textos de abajo se copiaron **por concatenación** de los archivos guardados, sin
reescribirlos. Esas rutas (`prompts/`, `pedidos/`, `registros/`, `sesion/`) son de la carpeta de
notas local `flowsync-m14-notas/`, fuera de este repositorio:

- **prompts al agente:** `prompts/NN/prompt.txt`, el archivo que leyó el lanzador, con la huella que
  calculó al arrancar. Modelo, versión y modo salen del evento `init` de cada captura;
- **pedidos de acompañamiento:** `pedidos/NN-*.txt`, guardados literales al recibirlos. Algunos
  contienen rutas locales de la máquina de trabajo; se conservan tal cual.

Hay tres tipos de entrada, en secciones separadas:

- **A. Prompts enviados al agente del ejercicio (3).** Una sola sesión
  (`b02bcd6b-f6b9-411e-9bf7-c624c3539b23`); el 2 y el 3, retomándola con `--resume`.
- **B. Pedidos a la sesión de acompañamiento (9).** Preparación, configuración, lanzamientos y
  cierre. No llegaron al agente.
- **C. Intervenciones manuales de Pablo.** No son prompts y **no hay texto literal**: se describen a
  partir de lo que Pablo informó y de lo observable sin leer los registros del recolector.

## Cronología

| Orden | Entrada | Hora |
|---|---|---|
| 1 | Pedido de acompañamiento 01 (`pedidos/01-preparar.txt`) | 2026-11-01 16:09 (guardado) |
| 2 | Pedido de acompañamiento 02 (`pedidos/02-sesion-y-prompt-parte-a.txt`) | 2026-11-01 16:26 (guardado) |
| 3 | Pedido de acompañamiento 03 (`pedidos/03-precision-y-lanzar.txt`) | 2026-11-01 16:31 (guardado) |
| 4 | **Prompt al agente 1** (`prompts/01-instrumentar`) | 2026-11-01 16:31 (inicio) |
| 5 | Pedido de acompañamiento 04 (`pedidos/04-aprobar-instrumentacion.txt`) | 2026-11-01 16:41 (guardado) |
| 6 | **Prompt al agente 2** (`prompts/02-aprobar-instrumentacion`) | 2026-11-01 16:41 (inicio) |
| 7 | _Intervención manual:_ Pablo arranca el recolector y la aplicación, genera tráfico y lee las trazas | recolector creado 2026-11-01 16:56; procesos de la aplicación desde 16:57 (observado) |
| 8 | Pedido de acompañamiento 05 (`pedidos/05-prompt-slo.txt`) | 2026-11-01 17:22 (guardado) |
| 9 | _Intervención manual:_ Pablo detiene `make start` | antes del pedido 06 (sin hora registrada) |
| 10 | Pedido de acompañamiento 06 (`pedidos/06-lanzar-slo.txt`) | 2026-11-01 17:28 (guardado) |
| 11 | **Prompt al agente 3** (`prompts/03-slo`) | 2026-11-01 17:29 (inicio) |
| 12 | Pedido de acompañamiento 07 (`pedidos/07-cierre-documental.txt`) | 2026-11-01 17:34 (guardado) |
| 13 | Pedido de acompañamiento 08 (`pedidos/08-precisiones-documentales.txt`) | 2026-11-01 17:38 (guardado) |
| 14 | Pedido de acompañamiento 09 (`pedidos/09-valoracion-y-commit.txt`) | 2026-11-01 18:32 (guardado) |

---

## A. Prompts enviados al agente del ejercicio

## Prompt 1

**Modelo:** `claude-opus-5-5` (Opus 5.5)
**Herramienta:** Claude Code 2.1.316, `claude -p` no interactivo (modo de permisos `auto`), lanzado con `sesion/lanzar.sh`
**Huella:** `2950d48963defbb6068f1aace0b84d45a0734bbeea370fe1ea36e1e47752e72b`
**Hora:** 2026-11-01T16:31:20-03:00 → 2026-11-01T16:33:07-03:00

```text
Instrumentá el backend de FlowSync con OpenTelemetry.

Usá el instalador oficial, ejecutado desde backend/:
node ace add @adonisjs/otel

Agregá a compose.yaml un servicio observability con:
- imagen otel/opentelemetry-collector-contrib:0.162.0;
- puertos 4317 y 4318 publicados solo en localhost;
- un archivo de configuración con receptor otlp para gRPC y HTTP, escuchando dentro del contenedor;
- exportador debug con verbosity: detailed en la tubería de trazas.

La importación de ../otel.js debe quedar como primera línea de backend/bin/server.ts, antes de cargar otros módulos.

Agregá APP_NAME, APP_VERSION y APP_ENV a backend/.env, backend/.env.example, backend/.env.test y al bloque env de .github/workflows/openapi.yml. Usá APP_NAME=flowsync-api y valores apropiados para cada entorno en las otras dos variables.

Configurá OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 en backend/.env. No muestres sus valores actuales, no lo agregues a Git y no incluyas secretos en ejemplos, comandos o respuestas.

No modifiques el frontend ni la integración continua fuera de esas tres variables. No implementes todavía el SLO ni escribas HALLAZGOS.md.

No arranques el backend, el frontend ni el recolector: Pablo hará el arranque y generará el tráfico después. Podés ejecutar los tests y las validaciones locales; informá exactamente qué comprobaste.

No leas ni resumas los logs del recolector por ninguna vía. No invoques subagentes. No hagas push, PR ni despliegues.

Si las instrucciones del proyecto requieren aprobación de un plan, presentalo y detenete. Si podés implementar con la autorización vigente, conservá el alcance indicado y registrá las comprobaciones y cualquier paso pendiente.

Para actualizar backend/.env, no leas ni muestres el archivo completo. Usá un procedimiento que modifique únicamente las variables solicitadas, sin imprimir los valores existentes. Si el instalador requiere interacción o encontrás un conflicto de alcance con ci.yml, informalo y detenete antes de resolverlo por tu cuenta.
```

**Qué salió:** Invocó por su cuenta la skill `backend-feature` (CLAUDE.md la exige) y **se detuvo con un plan** sin modificar archivos. Para armarlo descargó el paquete en una carpeta temporal y leyó el instalador sin ejecutarlo. Pidió decidir los valores de `APP_ENV` y la línea comentada del endpoint. Sin denegaciones.

## Prompt 2

**Modelo:** `claude-opus-5-5` (Opus 5.5)
**Herramienta:** Claude Code 2.1.316, `claude -p` no interactivo (modo de permisos `auto`), lanzado con `sesion/lanzar.sh`, continuando la sesión de `01-instrumentar`
**Huella:** `cbb78942a83602a1292f009a700985274ec59fbb2744ce3e9898cc2a346dd309`
**Hora:** 2026-11-01T16:41:57-03:00 → 2026-11-01T16:44:54-03:00

```text
Aprobado el plan de instrumentación, con estas decisiones:

1. Agregá test a los valores permitidos de APP_ENV. Usá los valores que propusiste:
   - .env y .env.example: flowsync-api, 0.0.0, development.
   - .env.test: flowsync-api, 0.0.0, test.
   - openapi.yml: flowsync-api, github.sha mediante la expresión de GitHub Actions, test.
   Conservá NODE_ENV y su comportamiento.

2. Agregá a .env.example una línea comentada:
   # OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
   En backend/.env, configurala activa sin leer ni imprimir los valores existentes.

3. Ejecutá node ace add @adonisjs/otel desde backend/. Si requiere interacción, detenete y devolvé la pregunta exacta. Revisá los cambios reales del instalador: no des por hecho que coinciden con lo leído.

4. Confirmá que import '../otel.js' sea la primera línea de backend/bin/server.ts y que el servicio se identifique como flowsync-api.

5. Implementá observability y su configuración según el plan, sin arrancarlo. No arranques tampoco el backend ni el frontend y no leas logs del recolector por ninguna vía.

6. Ejecutá typecheck, lint, make test, la comprobación OpenAPI existente y docker compose config --quiet. Distinguí qué valida cada comando: Compose no valida el contenido de la configuración del recolector. Si hay fallos, informá su causa y corregí únicamente los relacionados con este cambio.

7. No agregues tests que solo repitan la configuración. No modifiques ci.yml, el frontend, .railway/, el SLO ni HALLAZGOS.md. Registrá como pendiente que los entornos desplegados necesitarán las tres variables nuevas; no configures ni despliegues nada allí.

Podés hacer el commit local que exigen las instrucciones del proyecto, únicamente con los archivos de esta implementación. Revisá el staging y mantené backend/.env fuera de Git.

No invoques subagentes ni hagas push o PR. Al terminar, devolvé el diff, las comprobaciones realmente ejecutadas, el estado de Git y las instrucciones de arranque para Pablo. No afirmes que las trazas llegan: todavía no lo comprobamos.
```

**Qué salió:** Ejecutó `node ace add @adonisjs/otel` (sin preguntas), corrigió lo que dejó el instalador (el nombre del servicio y la posición del `import`) e implementó variables y recolector. Validaciones: typecheck 0, lint 1 y luego 0 tras Prettier, `docker compose config --quiet` 0, `make test` 70/70 y `openapi:check` 0. **1 denegación:** el hook `datos-que-no-salen` bloqueó el primer commit por el correo real de un mantenedor en el aviso `deprecated` de `glob` dentro del lockfile; el agente lo cambió por uno de `example.com`. Commit `a14242c`.

## Prompt 3

**Modelo:** `claude-opus-5-5` (Opus 5.5)
**Herramienta:** Claude Code 2.1.316, `claude -p` no interactivo (modo de permisos `auto`), lanzado con `sesion/lanzar.sh`, continuando la sesión de `02-aprobar-instrumentacion`
**Huella:** `0396c0bd440053b852d143ea2b46004d1ae15c04d8e33184654e089999903b62`
**Hora:** 2026-11-01T17:29:03-03:00 → 2026-11-01T17:30:15-03:00

```text
Escribí docs/slo/api.md con el objetivo de nivel de servicio del ejercicio.

Alcance:
- Exclusivamente las rutas de /api/v1/tasks, incluidas sus operaciones sobre tareas individuales.
- Excluí explícitamente todas las demás, entre ellas registro, login y health.

Definición:
- Denominador: todas las peticiones del alcance durante la ventana.
- Numerador: las que cumplen simultáneamente código HTTP inferior a 500 y duración estrictamente menor a 500 ms.
- Objetivo: al menos 99 % en una ventana móvil de 28 días.
- Presupuesto: calculalo sobre 20.000 peticiones supuestas. Explicá la fórmula y que el volumen supuesto se sustituye por el real.
- Una petición que incumpla ambas condiciones cuenta una sola vez como mala.
- Explicitá que, por este contrato, un 4xx rápido cuenta como bueno.
- Si no hay peticiones, el indicador no es calculable; no lo presentes como 100 %.

Definí una única alerta basada en la proporción de peticiones malas y el ritmo de consumo del presupuesto, que avise de su agotamiento anticipado. Concretá ventana de evaluación, umbral y cálculo; distinguí esos parámetros elegidos de los valores fijados por la consigna.

El documento define un objetivo: no afirma que se cumpla ni que exista una alerta implementada. Las trazas locales no demuestran cumplimiento durante 28 días.

No leas ni resumas los logs del recolector. No implementes métricas, alertas ni cambios de código, dependencias, workflows o infraestructura. No modifiques todavía HALLAZGOS.md ni prompts.md.

Revisá la coherencia del documento y hacé únicamente el commit documental local permitido por el proyecto. No invoques subagentes, ni hagas push, PR o despliegues.
```

**Qué salió:** Leyó las rutas, escribió `docs/slo/api.md` y lo commiteó (`aa99045`). Sin denegaciones. Una frase ambigua sobre picos breves se reemplazó después a mano, desde la sesión de acompañamiento.

### Restricciones de la sesión y denegaciones

La sesión se lanzó con un entorno reconstruido con `env -i`, fuentes de configuración limitadas a
`project,local`, sin MCP y con reglas que bloquean subagentes, push, PR, publicación, despliegues,
arranques de la aplicación y del recolector, y lectura de registros de contenedores. **No es
aislamiento completo:** las reglas miran el texto de cada comando y no lo que hace un script por
dentro.

| Prompt | Qué se denegó | Por qué |
|---|---|---|
| 1 | nada | — |
| 2 | el primer `git commit` | hook del proyecto `datos-que-no-salen`: correo real en el aviso `deprecated` de `glob` dentro de `backend/package-lock.json` |
| 3 | nada | — |

---

## B. Pedidos a la sesión de acompañamiento (no enviados al agente)

**Modelo:** `claude-opus-5-5` (Opus 5.5)
**Herramienta:** Claude Code, sesión interactiva de orquestación

El modelo de esta sesión no está en ninguna captura en archivo: es un dato del entorno de la propia
sesión. Los pedidos van en orden cronológico, tal como se guardaron. El 07, el 08 y el 09 son
los de cierre; su propia ejecución, que escribe este archivo, no se documenta aquí.

## Pedido 01 — `pedidos/01-preparar.txt`

```text
Vamos a preparar el ejercicio del módulo 14 de AI4Devs. Todavía no implementes la instrumentación ni el SLO y no lances otro agente.

Creá dos carpetas nuevas, sin sobrescribir ninguna existente:
- /home/pablo/code/flowsync-ai4devs-m14
- /home/pablo/code/flowsync-m14-notas

Guardá este pedido literal en las notas y registrá comandos, resultados y cambios. No guardes valores de secretos.

Preparación:

1. Consultá únicamente la rama s14/start de:
   https://github.com/LIDR-academy-temp/flowsync-ai4devs.git
   No consultes s14/end ni la solución del mentor.

2. Cloná esa rama y creá slo-pp desde ella. Registrá el SHA base. Dejá upstream con push desactivado; el destino de entrega lo resolveremos después.

3. Leé las instrucciones del proyecto, sus hooks y skills. Informá cuáles afectan a la sesión del agente: aprobaciones, commits automáticos, subagentes, PR y acceso a credenciales. No leas configuraciones personales con secretos.

4. Comprobá Docker, Make y Node. Usá Node 24.8.0 de asdf, disponible en la máquina, sin cambiar la configuración global.

5. Revisá los puertos y los servicios existentes antes de arrancar nada. Las bases del módulo 13 pueden ocupar 54410 y 54411.
   Si pertenecen inequívocamente al clon del módulo 13, podés detener solo esos dos contenedores, conservando sus volúmenes y datos. No uses down -v ni toques otros servicios. Si no podés identificar su propiedad, detenete e informalo.

6. Revisá las recetas antes de ejecutar make setup. Prepará el entorno y comprobá:
   - make test
   - make test-unit
   - arranque HTTP del backend y frontend.
   No registres usuarios ni crees tareas todavía.
   Detené al terminar únicamente los procesos de aplicación que hayas iniciado.

7. Si necesitás limitar la publicación de las bases a localhost, hacelo mediante un override local fuera de Git y documentalo.

8. Registrá la línea de base:
   - primera línea de backend/bin/server.ts;
   - instrumentación y dependencias existentes;
   - configuración de Compose y workflows;
   - nombres de variables exigidas, sin sus valores;
   - estado de Git antes y después del setup.
   No restaures automáticamente los cambios del setup: mostrales el diff y explicalos.

Límites del ejercicio:
- La implementación deberá usar node ace add @adonisjs/otel.
- El recolector será observability, con imagen
  otel/opentelemetry-collector-contrib:0.162.0.
- No se modifica el frontend.
- El agente no debe leer ni resumir los logs del recolector: esa comprobación la hará Pablo.
- No se crea un subagente auditor.
- Los cambios de CI se limitan a las tres variables indicadas por la consigna.

No hagas commits, push, PR ni despliegues. No modifiques la guía, el libro ni los clones anteriores.

Al terminar, devolvé el estado del entorno, los tests, el diff del setup y cualquier bloqueo. Detenete antes del primer prompt de implementación.
```

## Pedido 02 — `pedidos/02-sesion-y-prompt-parte-a.txt`

```text
Continuamos con el módulo 14. Prepará la sesión del agente y el prompt de la parte A; todavía no lo lances.

Trabajá con:
- Clon: /home/pablo/code/flowsync-ai4devs-m14
- Notas: /home/pablo/code/flowsync-m14-notas

1. Guardá este pedido literal y registrá las acciones en NOTAS.md.

2. Conservá los diffs del setup. Confirmá que los únicos cambios son los bloques libc de los dos lockfiles y el salto de línea final de backend/.env.example. Si coinciden, restaurá únicamente esos tres archivos. No toques los .env ni el override local.

3. Prepará un lanzador tomando como referencia el del módulo 13, sin modificar aquel:
   - Node 24.8.0 y configuración project,local.
   - Sin credenciales personales heredadas ni plugins de usuario.
   - MCP y subagentes bloqueados.
   - Push, PR, publicación y despliegues bloqueados.
   - Commits locales permitidos en slo-pp.
   - backend-feature se conserva: si pide aprobar el plan, se detiene.
   - Permití la instalación oficial y las comprobaciones locales necesarias.
   - Permití actionlint, incluido el hook workflow-valido.sh.
   - El agente no debe leer, capturar ni resumir los logs del recolector, tampoco mediante archivos o comandos alternativos.
   - No afirmes aislamiento completo: documentá los límites reales.

   Conservá la captura filtrada antes de escribirla, las huellas del prompt y configuración, y el estado de Git antes y después. No copies secretos a las notas ni al prompt.

4. Guardá el siguiente texto como prompts/01-instrumentar/prompt.txt, sin agregarle instrucciones dentro:

Instrumentá el backend de FlowSync con OpenTelemetry.

Usá el instalador oficial, ejecutado desde backend/:
node ace add @adonisjs/otel

Agregá a compose.yaml un servicio observability con:
- imagen otel/opentelemetry-collector-contrib:0.162.0;
- puertos 4317 y 4318 publicados solo en localhost;
- un archivo de configuración con receptor otlp para gRPC y HTTP, escuchando dentro del contenedor;
- exportador debug con verbosity: detailed en la tubería de trazas.

La importación de ../otel.js debe quedar como primera línea de backend/bin/server.ts, antes de cargar otros módulos.

Agregá APP_NAME, APP_VERSION y APP_ENV a backend/.env, backend/.env.example, backend/.env.test y al bloque env de .github/workflows/openapi.yml. Usá APP_NAME=flowsync-api y valores apropiados para cada entorno en las otras dos variables.

Configurá OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 en backend/.env. No muestres sus valores actuales, no lo agregues a Git y no incluyas secretos en ejemplos, comandos o respuestas.

No modifiques el frontend ni la integración continua fuera de esas tres variables. No implementes todavía el SLO ni escribas HALLAZGOS.md.

No arranques el backend, el frontend ni el recolector: Pablo hará el arranque y generará el tráfico después. Podés ejecutar los tests y las validaciones locales; informá exactamente qué comprobaste.

No leas ni resumas los logs del recolector por ninguna vía. No invoques subagentes. No hagas push, PR ni despliegues.

Si las instrucciones del proyecto requieren aprobación de un plan, presentalo y detenete. Si podés implementar con la autorización vigente, conservá el alcance indicado y registrá las comprobaciones y cualquier paso pendiente.

5. Verificá la configuración y el lanzador sin abrir una sesión. No ejecutes el prompt ni instales OpenTelemetry todavía.

Devolvé el estado de Git, los archivos preparados, la huella del prompt y cualquier limitación o conflicto detectado.
```

## Pedido 03 — `pedidos/03-precision-y-lanzar.txt`

```text
Guardá este pedido literal. Agregá al final de prompts/01-instrumentar/prompt.txt la precisión siguiente:

Para actualizar backend/.env, no leas ni muestres el archivo completo. Usá un procedimiento que modifique únicamente las variables solicitadas, sin imprimir los valores existentes. Si el instalador requiere interacción o encontrás un conflicto de alcance con ci.yml, informalo y detenete antes de resolverlo por tu cuenta.

Registrá el agregado y recalculá la huella. No cambies las reglas ni el lanzador.

Después lanzá:
sesion/lanzar.sh prompts/01-instrumentar

Esperá el resultado y revisá la captura filtrada y el estado de Git. Si pide aprobar un plan, devolvé el plan y detenete. No envíes un segundo prompt automáticamente.

Informá qué ejecutó realmente, los archivos y commits creados, las validaciones y las denegaciones. No leas los logs del recolector.
```

## Pedido 04 — `pedidos/04-aprobar-instrumentacion.txt`

```text
Guardá este pedido literal y prepará el prompt 02 de aprobación. Retomá la misma sesión de prompts/01-instrumentar con el lanzador existente, sin cambiar su configuración.

Texto del prompt para el agente:

Aprobado el plan de instrumentación, con estas decisiones:

1. Agregá test a los valores permitidos de APP_ENV. Usá los valores que propusiste:
   - .env y .env.example: flowsync-api, 0.0.0, development.
   - .env.test: flowsync-api, 0.0.0, test.
   - openapi.yml: flowsync-api, github.sha mediante la expresión de GitHub Actions, test.
   Conservá NODE_ENV y su comportamiento.

2. Agregá a .env.example una línea comentada:
   # OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
   En backend/.env, configurala activa sin leer ni imprimir los valores existentes.

3. Ejecutá node ace add @adonisjs/otel desde backend/. Si requiere interacción, detenete y devolvé la pregunta exacta. Revisá los cambios reales del instalador: no des por hecho que coinciden con lo leído.

4. Confirmá que import '../otel.js' sea la primera línea de backend/bin/server.ts y que el servicio se identifique como flowsync-api.

5. Implementá observability y su configuración según el plan, sin arrancarlo. No arranques tampoco el backend ni el frontend y no leas logs del recolector por ninguna vía.

6. Ejecutá typecheck, lint, make test, la comprobación OpenAPI existente y docker compose config --quiet. Distinguí qué valida cada comando: Compose no valida el contenido de la configuración del recolector. Si hay fallos, informá su causa y corregí únicamente los relacionados con este cambio.

7. No agregues tests que solo repitan la configuración. No modifiques ci.yml, el frontend, .railway/, el SLO ni HALLAZGOS.md. Registrá como pendiente que los entornos desplegados necesitarán las tres variables nuevas; no configures ni despliegues nada allí.

Podés hacer el commit local que exigen las instrucciones del proyecto, únicamente con los archivos de esta implementación. Revisá el staging y mantené backend/.env fuera de Git.

No invoques subagentes ni hagas push o PR. Al terminar, devolvé el diff, las comprobaciones realmente ejecutadas, el estado de Git y las instrucciones de arranque para Pablo. No afirmes que las trazas llegan: todavía no lo comprobamos.

Fin del prompt.

Esperá el resultado, revisá la captura filtrada y registrá archivos, commits, validaciones y denegaciones. Si se detiene por una pregunta o bloqueo, devolvelo sin enviar otro prompt automáticamente.
```

## Pedido 05 — `pedidos/05-prompt-slo.txt`

```text
Prepará y lanzá el prompt 03 del módulo 14, retomando la sesión del agente desde prompts/02-aprobar-instrumentacion (verificá el nombre real de la carpeta).

Guardá este pedido y el prompt literal antes de lanzarlo. Conservá la configuración y las restricciones vigentes. El recolector está funcionando: usá PERMITIR_RECOLECTOR=1 si el lanzador lo requiere. Si exige detener la aplicación, avisame antes; no la detengas automáticamente.

Texto para el agente:

Escribí docs/slo/api.md con el objetivo de nivel de servicio del ejercicio.

Alcance:
- Exclusivamente las rutas de /api/v1/tasks, incluidas sus operaciones sobre tareas individuales.
- Excluí explícitamente todas las demás, entre ellas registro, login y health.

Definición:
- Denominador: todas las peticiones del alcance durante la ventana.
- Numerador: las que cumplen simultáneamente código HTTP inferior a 500 y duración estrictamente menor a 500 ms.
- Objetivo: al menos 99 % en una ventana móvil de 28 días.
- Presupuesto: calculalo sobre 20.000 peticiones supuestas. Explicá la fórmula y que el volumen supuesto se sustituye por el real.
- Una petición que incumpla ambas condiciones cuenta una sola vez como mala.
- Explicitá que, por este contrato, un 4xx rápido cuenta como bueno.
- Si no hay peticiones, el indicador no es calculable; no lo presentes como 100 %.

Definí una única alerta basada en la proporción de peticiones malas y el ritmo de consumo del presupuesto, que avise de su agotamiento anticipado. Concretá ventana de evaluación, umbral y cálculo; distinguí esos parámetros elegidos de los valores fijados por la consigna.

El documento define un objetivo: no afirma que se cumpla ni que exista una alerta implementada. Las trazas locales no demuestran cumplimiento durante 28 días.

No leas ni resumas los logs del recolector. No implementes métricas, alertas ni cambios de código, dependencias, workflows o infraestructura. No modifiques todavía HALLAZGOS.md ni prompts.md.

Revisá la coherencia del documento y hacé únicamente el commit documental local permitido por el proyecto. No invoques subagentes, ni hagas push, PR o despliegues.

Fin del prompt.

Registrá el resultado y el estado de Git. No envíes otro prompt automáticamente.
```

## Pedido 06 — `pedidos/06-lanzar-slo.txt`

```text
Ya detuve make start. Verificá que 3333 y 5173 estén libres y lanzá el prompt preparado:

PERMITIR_RECOLECTOR=1 sesion/lanzar.sh prompts/03-slo --continuar prompts/02-aprobar-instrumentacion

No cambies el prompt, la configuración ni el lanzador. Registrá el resultado y detenete al terminar, sin enviar otro prompt.
```

## Pedido 07 — `pedidos/07-cierre-documental.txt`

```text
Cerrá la documentación local del módulo 14. Podés editar los documentos directamente, sin lanzar al agente.

1. Guardá este pedido literal y registrá las acciones en NOTAS.md.

2. En docs/slo/api.md, reemplazá únicamente la frase ambigua sobre picos breves por:
   “Esta alerta usa una única ventana de una hora. Puede diluir picos breves y no distingue por sí sola un pico de un fallo sostenido con la misma proporción de peticiones malas.”
   Conservá los parámetros y cálculos restantes.

3. Prepará HALLAZGOS.md con los tres puntos de la consigna, distinguiendo lo observado de lo pendiente:
   - Pablo contó 13 trazas distintas. En la traza seleccionada de GET /api/v1/tasks, la petición duró 44,287 ms y la consulta SQL más lenta fue UPDATE auth_access_tokens, con 2,411 ms. No se identificó la traza más lenta del conjunto.
   - El primer arranque falló con Node 20.20.2. Pablo repitió make start usando Node 24.8.0 y después observó trazas de flowsync-api. No se documentó otro ajuste de instrumentación para conseguir que llegaran.
   - El presupuesto calculado es de 200 peticiones malas sobre 20.000 en 28 días. Dejá pendiente la opinión de Pablo sobre si le parece mucho o poco; no la inventes.

   Aclaración de procedencia: Pablo ejecutó los comandos y localizó la traza; el asistente de esta conversación calculó y comparó las duraciones a partir de los fragmentos compartidos. Esto constituye ayuda de análisis y debe quedar registrado, porque la consigna reservaba esa lectura para la persona.

4. Completá prompts.md con los tres prompts enviados al agente, copiados literalmente de sus archivos, indicando modelo y herramienta según las capturas. Separá los pedidos de acompañamiento y las intervenciones manuales. No reconstruyas textos ausentes ni presentes resúmenes como literales.

5. No leas los logs del recolector. No cambies código, configuración, dependencias ni workflows. No hagas push, PR ni commit todavía.

Revisá el diff, los enlaces, los datos sensibles y git diff --check. Devolvé los documentos y las preguntas pendientes antes del commit.
```

## Pedido 08 — `pedidos/08-precisiones-documentales.txt`

```text
Aplicá estas precisiones documentales:

1. Identificá la ayuda como “ChatGPT, en la conversación de acompañamiento”. Pablo compartió fragmentos de los logs allí y ChatGPT calculó y comparó las duraciones. Claude Code no los leyó. Conservá explícita esa diferencia respecto de la consigna.

2. El fallo con Node 20 no está pendiente de observar: ocurrió y su salida está en la conversación de ChatGPT. Lo que falta es una copia local. Registralo así, sin reconstruir una salida literal:
   ERR_UNKNOWN_FILE_EXTENSION al cargar backend/bin/console.ts, con Node.js v20.20.2.
   El arranque posterior se hizo con Node 24.8.0.

3. Conservá como pendiente identificar la traza más lenta de las 13. La traza analizada es una seleccionada; no cambies esa afirmación.

4. Los tres títulos de HALLAZGOS.md sirven: corresponden a los puntos de la consigna consultada en la plataforma.

5. Los tres documentos irán juntos en un commit documental, pero todavía no lo hagas: falta la valoración personal de Pablo sobre el presupuesto.

No lances al agente ni leas logs del recolector.
```

## Pedido 09 — `pedidos/09-valoracion-y-commit.txt`

```text
Apruebo esta valoración para HALLAZGOS.md:

“Para FlowSync, un 1 % de peticiones malas me parece aceptable como objetivo inicial. Pero 200 peticiones problemáticas pueden afectar bastante si se concentran en pocos minutos o impiden guardar tareas. Además, el indicador cuenta tanto errores del servidor como respuestas de 500 ms o más: no todas tienen el mismo impacto.”

Incorporala como mi valoración, con redacción propuesta por ChatGPT y aprobada por mí.

Guardá este pedido literal y actualizá prompts.md y NOTAS.md. Conservá los límites y pendientes ya documentados.

Revisá el diff final, los datos sensibles y git diff --cached --check. Prepará por nombre únicamente:
- HALLAZGOS.md
- prompts.md
- docs/slo/api.md

Hacé el commit documental local con la identidad ya configurada. No lances agentes, no leas logs, no hagas push ni PR y no modifiques otros archivos.

Informá el hash, los archivos incluidos y el estado final de Git. La práctica queda documentada localmente; la entrega sigue pendiente.
```

---

## C. Intervenciones manuales de Pablo (sin texto literal)

- **Arranque y tráfico:** Pablo levantó el recolector (`observability`, contenedor creado a las
  16:56) y la aplicación (procesos desde las 16:57, observados por la sesión de acompañamiento al
  revisar los puertos), generó tráfico y leyó los registros del recolector.
  - **No hay captura** de esos comandos ni de su salida.
  - El primer arranque falló con Node.js v20.20.2 (`ERR_UNKNOWN_FILE_EXTENSION` al cargar
    `backend/bin/console.ts`), y Pablo lo repitió con `make start` usando Node 24.8.0. La salida
    completa está en la conversación de ChatGPT; **no hay copia local**.
- **Valoración del presupuesto:** la de `HALLAZGOS.md` es de Pablo, con redacción propuesta por
  ChatGPT y aprobada por Pablo (pedido 09).
- **Lectura de trazas:** Pablo contó 13 trazas y localizó la de `GET /api/v1/tasks` (44,287 ms; la
  consulta más lenta, `UPDATE auth_access_tokens`, 2,411 ms).
  - Pablo compartió fragmentos de los registros con **ChatGPT, en la conversación de
    acompañamiento**, y ChatGPT calculó y comparó las duraciones. Es ayuda de análisis, distinta de
    lo que pedía la consigna (ver `HALLAZGOS.md`).
  - Claude Code no leyó esos registros ni esos fragmentos.
- **Parada:** Pablo detuvo `make start` antes del pedido 06, para que el lanzador aceptara arrancar.

## Ausencias (marcadas, no reconstruidas)

- No hay captura en archivo de las **respuestas** de la sesión de acompañamiento. Están resumidas
  en `NOTAS.md` de la carpeta de notas.
- No hay texto literal de los comandos manuales de Pablo, ni de los registros del recolector.
- La salida completa del fallo con Node 20 existe en la conversación de ChatGPT, pero no hay copia
  local.
- La consigna del módulo 14 no está en este repositorio: el README de la rama de partida es el del
  módulo 13.
