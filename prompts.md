## Prompt 1

**Modelo:** Claude Opus 5.5
**Herramienta:** Claude Code (app de escritorio, sobre el repo en WSL)

```
Contexto: el backend de FlowSync es AdonisJS y está en backend/. Quiero instrumentarlo con
OpenTelemetry usando el paquete oficial @adonisjs/otel y mandar las trazas a un recolector
local que corre en Docker.

Haz esto, en este orden:

1. Desde backend/, instala el paquete con el comando del framework: `node ace add @adonisjs/otel`.
   No uses npm install: deja que el instalador genere y registre sus ficheros.
2. Comprueba que `import '../otel.js'` queda como PRIMERA línea de backend/bin/server.ts, antes
   del bloque de comentarios y de cualquier otro import. No la muevas ni pongas nada delante.
3. El instalador añade APP_NAME, APP_VERSION y APP_ENV a la validación de backend/start/env.ts.
   Añádelas en los cuatro sitios donde se arranca la app: backend/.env, backend/.env.example,
   backend/.env.test y el bloque env: de .github/workflows/openapi.yml. Usa APP_NAME=flowsync-api,
   APP_VERSION coherente con backend/package.json y APP_ENV acorde a cada entorno.
4. En backend/.env pon OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 (OTLP por HTTP, no el
   4317 de gRPC) y deja la misma variable documentada en backend/.env.example.
5. Añade a compose.yaml un servicio llamado exactamente `observability` con la imagen
   otel/opentelemetry-collector-contrib:0.162.0, que publique los puertos 4317 y 4318 y monte un
   fichero de configuración del recolector con: un receptor otlp con los protocolos grpc y http,
   un exportador debug con verbosity: detailed y una pipeline de traces otlp -> debug.
   Sigue el estilo de comentarios que ya tiene compose.yaml.

Restricciones: no toques frontend/, no cambies ninguna ruta de la API y no hagas commits en
s14/start (trabajo en la rama slo-marco-bello).

Al terminar, pasa el typecheck y `make test`, y dime qué ficheros has cambiado y con qué comandos
arranco el recolector y la aplicación.
```

**Qué salió:** funcionó a la primera (typecheck y 70/70 tests en verde). El instalador dejó el import en la línea 5, detrás de su comentario, y el agente lo subió; además añadió `test` al enum de `APP_ENV` y puso los receptores en `0.0.0.0` por iniciativa propia.

## Prompt 2

**Modelo:** Claude Opus 5.5
**Herramienta:** Claude Code (app de escritorio, sobre el repo en WSL)

```
Escribe el objetivo de nivel de servicio de la API en docs/slo/api.md (crea la carpeta).
El alcance son SOLO las rutas bajo /api/v1/tasks: lístalas tal como están en
backend/start/routes.ts, sin cambiarlas.

El documento tiene que incluir:

1. El SLI como fracción, con numerador y denominador:
   - numerador: peticiones a /api/v1/tasks que responden con un código menor que 500 Y tardan
     menos de 500 ms;
   - denominador: todas las peticiones a /api/v1/tasks.
   Indica de qué dato de los tramos HTTP de tipo Server sale cada cosa (ruta, código de respuesta
   y duración).
2. El objetivo: al menos el 99 % de esas peticiones cumplen el SLI en una ventana móvil de 28 días.
3. El presupuesto de error expresado en peticiones, calculado con un volumen supuesto de 20.000
   peticiones en la ventana. Deja claro que ese volumen es una suposición que hay que sustituir
   por el real.
4. Una única alerta basada en lo que percibe el usuario (peticiones con error o lentas), no en
   causas internas como CPU o base de datos: debe saltar cuando el ritmo de consumo del
   presupuesto indique que se agotará antes de que termine la ventana. Explica el umbral y la
   ventana de evaluación que eliges.
5. Una sección "Fuera del objetivo" con todas las rutas que no son /api/v1/tasks (registro,
   inicio de sesión, etc., sacadas de routes.ts), indicando que si hay que medirlas necesitan
   su propio objetivo y presupuesto.

No cambies rutas ni valores y no toques código. En español y conciso.
```

**Qué salió:** a la primera. Presupuesto de 200 peticiones; comprobó en `node_modules/@adonisjs/otel` que los atributos `http.route` y `http.response.status_code` existen. El prompt de diagnóstico del borrador no hizo falta: las trazas llegaron (primero conté 3 por la exportación por lotes; al repetir, 9).

## Prompt 3

**Modelo:** Claude Opus 5.5
**Herramienta:** Claude Code (app de escritorio, sobre el repo en WSL)

Los datos los medí yo con un comando `awk` sobre `docker compose logs observability` que calcula la
duración de cada tramo; al agente solo le pasé los números, no los registros.

```
Vacía HALLAZGOS.md (tiene la plantilla de otro ejercicio) y deja solo un título y tres líneas,
una por punto, con estos datos que he medido yo:

1. Trazas: llegaron 9 trazas distintas. En la más lenta, POST /api/v1/tasks, el tramo Server duró
   145,1 ms y el tramo que más tiempo consumió fue el propio Server: el insert flowsync.tasks solo
   4,4 ms; la segunda creación tardó 27,5 ms.
2. Para que llegaran: funcionó a la primera; al principio solo conté 3 porque el SDK exporta por
   lotes, y al repetir eran 9.
3. Presupuesto de error: 200 peticiones en 28 días con 20.000 supuestas; me parece poco
   para un mes de uso real de FlowSync.

No inventes datos ni añadas nada que no te haya dado.
```

**Qué salió:** a la primera. El agente añadió dos cosas que no le di explícitamente: que la causa probable es el arranque en frío y el porqué de «poco» (unas 7 peticiones al día).
