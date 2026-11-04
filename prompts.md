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
