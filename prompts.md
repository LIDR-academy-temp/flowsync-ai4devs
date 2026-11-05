# Prompts

Los prompts que lancé para hacer el ejercicio, en el orden en que los lancé, con el modelo y la
herramienta de cada uno. Pegados tal cual salieron.

---

## Prompt 1 — Parte A: instrumentar y levantar el colector

**Modelo:** Claude Fable 5.1, esfuerzo alto
**Herramienta:** Claude Code

```
Buenas tardes,
- Instrumenta el backend de FlowSync con OpenTelemetry usando el paquete oficial: desde backend/ ejecuta `node ace add @adonisjs/otel` (no npm install).
- Añade a compose.yaml un servicio `observability` con la imagen otel/opentelemetry-collector-contrib:0.162.0, puertos 4317 y 4318, y un archivo de configuración con receptor otlp (grpc y http) y exportador `debug` con `verbosity: detailed` en la tubería de trazas.
- Asegura que `import '../otel.js'` sea la primera línea de backend/bin/server.ts.
- Agrega APP_NAME=flowsync-api, APP_VERSION y APP_ENV en backend/.env, .env.example, .env.test y en el bloque env: de .github/workflows/openapi.yml.
- Agrega OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 en backend/.env.
- No modifiques el frontend. No corrijas nada a mano fuera de esto.
```

**Qué salió:** funcionó a la primera (una traza real en el colector en la propia verificación del agente). El hook `datos-que-no-salen` del repo bloqueó el commit dos veces por un correo público dentro de `package-lock.json`; el agente lo sustituyó por uno de example.com como indica el hook y registró los dos bloqueos. Dejó `APP_ENV=development` en `.env.test` porque el enum que generó el paquete no admite `test`.

---

## Prompt 2 — Parte B: el SLO en docs/slo/api.md

**Modelo:** Claude Fable 5.1, esfuerzo alto
**Herramienta:** Claude Code

```
Crea docs/slo/api.md con el objetivo de nivel de servicio de la API de FlowSync.

Alcance: solo las rutas de /api/v1/tasks. Declara expresamente que quedan fuera registro, inicio de sesión y cualquier otra ruta.

SLI como fracción: numerador = peticiones a /api/v1/tasks con código < 500 y duración < 500 ms; denominador = todas las peticiones a esas rutas. Indica que se necesita ruta, código y duración de cada petición.

Objetivo: 99 % sobre una ventana móvil de 28 días.

Presupuesto de error en peticiones: con el supuesto de 20.000 peticiones en la ventana, el 1 % son 200 peticiones que pueden incumplir; aclara que el 20.000 se sustituirá por el volumen real.

Una única alerta, por síntoma: avisar cuando la tasa de consumo del presupuesto indique que se agotará antes de terminar la ventana (referencia: 2 % del presupuesto en 1 h, tasa 13,44 para 28 días).

No leas ni resumas los logs del colector, no crees subagentes, no toques CI.
```

**Qué salió:** funcionó a la primera. El documento sacó las 10 rutas del grupo `/api/v1/tasks` de `routes.ts`, derivó el 13,44 (0,02 × 672 h) y anotó por su cuenta que con 30 peticiones por hora el 2 % del presupuesto son 4 peticiones malas, así que la alerta es sensible a una sola ráfaga.
