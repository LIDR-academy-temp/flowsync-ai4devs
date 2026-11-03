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

**Modelo:** Sonnet 5.5
**Herramienta:** Claude Code

```
Instrumenta el backend con OpenTelemetry usando el paquete oficial
@adonisjs/otel. Instálalo desde backend/ con node ace add @adonisjs/otel,
no con npm install.

Además:
- Añade a compose.yaml un servicio llamado observability con la imagen
  otel/opentelemetry-collector-contrib:0.162.0, que publique los puertos 4317
  y 4318 y monte un archivo de configuración con un receptor otlp para grpc y
  http, y un exportador debug con verbosity: detailed en la tubería de trazas.
- La importación que añade el instalador en backend/bin/server.ts tiene que
  quedar como primera línea del archivo.
- Las variables APP_NAME, APP_VERSION y APP_ENV deben estar en backend/.env,
  backend/.env.example, backend/.env.test y en el bloque env: de
  .github/workflows/openapi.yml. Usa APP_NAME=flowsync-api.
- En backend/.env pon OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318.

No toques el frontend ni ningún otro workflow. No arranques nada: lo haré yo.
```

**Qué salió:** (opcional, una línea) funcionó a la primera / tuve que insistir / me inventó una ruta que no existe.
