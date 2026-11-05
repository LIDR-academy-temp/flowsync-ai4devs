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
La instalación de OpenTelemetry dejó un comentario antes de la importación en backend/bin/server.ts.

El ejercicio exige que esta instrucción sea literalmente la primera línea del archivo:

import '../otel.js'

Mueve únicamente esa importación a la línea 1 y conserva el resto del archivo. No modifiques el frontend ni amplíes el alcance. Después verifica el resultado mostrando las primeras cinco líneas de backend/bin/server.ts.
```

**Qué salió:** (opcional, una línea) funcionó a la primera / tuve que insistir / me inventó una ruta que no existe.




## Prompt 2

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Completa las variables requeridas para la instrumentación OpenTelemetry del backend.

Realiza únicamente estos cambios:

1. En backend/.env:
   - cambia APP_NAME a flowsync-api
   - conserva APP_VERSION=0.0.1
   - conserva APP_ENV=development
   - añade OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318

2. En backend/.env.example:
   - cambia APP_NAME a flowsync-api
   - conserva APP_VERSION=0.0.1
   - conserva APP_ENV=development
   - no añadas OTEL_EXPORTER_OTLP_ENDPOINT porque este endpoint corresponde al entorno local

3. En backend/.env.test, añade:
   APP_NAME=flowsync-api
   APP_VERSION=0.0.1
   APP_ENV=test

4. En el bloque env del job correspondiente de .github/workflows/openapi.yml, añade:
   APP_NAME: flowsync-api
   APP_VERSION: 0.0.1
   APP_ENV: test

No modifiques el frontend ni otros archivos. No añadas secretos y no intentes versionar backend/.env.

Al terminar, muestra únicamente:
- el diff de los archivos modificados
- la salida de una búsqueda de APP_NAME, APP_VERSION, APP_ENV y OTEL_EXPORTER_OTLP_ENDPOINT en esos cuatro archivos
```

**Qué salió:** Las variables se añadieron, pero make test detectó que la validación de APP_ENV no admitía el valor test.



## Prompt 3

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Configura un OpenTelemetry Collector local para FlowSync.

Respeta estrictamente este alcance:

1. Crea en la raíz del repositorio el archivo otel-collector-config.yaml con:
   - un receptor otlp
   - protocolo grpc escuchando en 0.0.0.0:4317
   - protocolo http escuchando en 0.0.0.0:4318
   - un exportador debug con verbosity: detailed
   - un pipeline traces que use el receptor otlp y el exportador debug

2. Añade al compose.yaml un servicio llamado observability con:
   - imagen exacta: otel/opentelemetry-collector-contrib:0.162.0
   - montaje de solo lectura de ./otel-collector-config.yaml en
     /etc/otelcol-contrib/config.yaml
   - comando que utilice ese archivo de configuración
   - publicación del puerto 4317 del host al 4317 del contenedor
   - publicación del puerto 4318 del host al 4318 del contenedor

3. Conserva sin cambios los servicios db y db-test, así como el volumen db-data.

4. No levantes contenedores todavía, no modifiques el frontend y no cambies ningún otro archivo.

5. Al terminar:
   - ejecuta docker compose config para validar la configuración
   - muestra el diff de compose.yaml
   - muestra el contenido completo de otel-collector-config.yaml
```

**Qué salió:** (opcional, una línea) funcionó a la primera / tuve que insistir / me inventó una ruta que no existe.



## Prompt 4

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Crea la documentación del SLO y los hallazgos del ejercicio de observabilidad.

1. Crea docs/slo/api.md con estas condiciones exactas:

- Alcance: solamente las solicitudes a la ruta /api/v1/tasks.
- SLI: fracción de solicitudes a /api/v1/tasks que cumplen simultáneamente:
  a) código HTTP menor que 500;
  b) duración menor que 500 ms.
- Fórmula: solicitudes válidas y rápidas divididas entre todas las solicitudes a /api/v1/tasks.
- SLO: al menos 99 % durante una ventana móvil de 28 días.
- Presupuesto de error de referencia: para 20 000 solicitudes, el 1 % permite 200 solicitudes con error o duración igual o superior a 500 ms.
- Aclara que 20 000 es un volumen provisional que será reemplazado por tráfico real.
- Define una alerta basada en síntomas del usuario y consumo del presupuesto de error: debe avisar cuando la tasa de consumo proyecte que el presupuesto se agotará antes de finalizar los 28 días.
- Excluye explícitamente todas las rutas diferentes de /api/v1/tasks, incluidas registro y login.

2. Crea HALLAZGOS.md con exactamente tres líneas sustantivas, sin título ni líneas vacías:

1. Se observaron 18 trazas únicas; en la traza 055633616effe95711adb8f41dd3f6c5, el span servidor GET /api/v1/tasks tardó aproximadamente 637.56 ms y el span de base de datos más lento fue select flowsync.auth_access_tokens, con aproximadamente 417.94 ms.
2. Las trazas llegaron sin corregir la configuración: fue necesario reiniciar la aplicación instrumentada, generar tráfico y esperar la exportación por lotes; el conteo inicial de cero se hizo antes de generar ese tráfico.
3. Para 20 000 solicitudes, el presupuesto de error es de 200; me parece un punto inicial razonable, pero debe revisarse con el volumen y comportamiento reales de producción.

No modifiques código, frontend, configuración, workflows ni otros documentos.

Al terminar, muestra:
- el contenido completo de docs/slo/api.md;
- el contenido completo de HALLAZGOS.md;
- el número de líneas de HALLAZGOS.md.
```

**Qué salió:** (opcional, una línea) funcionó a la primera / tuve que insistir / me inventó una ruta que no existe.


## Prompt 5

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Corrige el fallo de validación detectado por make test.

Error actual:

EnvValidationException: "APP_ENV" env variable must be one of
"development,staging,production" (Current value: "test")

La configuración de pruebas usa correctamente APP_ENV=test tanto en backend/.env.test como en .github/workflows/openapi.yml.

Realiza únicamente este cambio:

- En backend/start/env.ts, localiza la validación de APP_ENV y añade "test" a los valores permitidos.
- Debe aceptar exactamente: development, staging, production y test.
- No cambies APP_ENV=test en backend/.env.test.
- No cambies APP_ENV=test en .github/workflows/openapi.yml.
- No modifiques NODE_ENV, el frontend ni ningún otro archivo.

Después:
1. muestra el diff concreto de backend/start/env.ts;
2. ejecuta make test;
3. informa el resultado final de las pruebas.
```

**Qué salió:** (opcional, una línea) funcionó a la primera / tuve que insistir / me inventó una ruta que no existe.
