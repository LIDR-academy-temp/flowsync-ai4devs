# Prompts

## Prompt 1

**Modelo:** Opus 5.5 (`claude-opus-5-5`)
**Herramienta:** Claude Code

```
Trabaja en el backend de FlowSync siguiendo estas instrucciones por fases. Antes de empezar, comprueba que la rama actual sea slo-<iniciales> y no s14/start. Si no lo es, detente y avísame.

<tarea_a>
Instrumenta backend/ con OpenTelemetry:

1. Desde backend/, instala el paquete oficial con `node ace add @adonisjs/otel`. No uses npm install.
2. Comprueba que `import '../otel.js'` siga siendo la primera línea de backend/bin/server.ts.
3. Añade APP_NAME, APP_VERSION y APP_ENV a backend/.env, backend/.env.example, backend/.env.test y al bloque env: de .github/workflows/openapi.yml. Usa APP_NAME=flowsync-api. No hagas ningún otro cambio en la integración continua.
4. Configura OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 en backend/.env.
5. Añade a compose.yaml un servicio llamado observability con la imagen otel/opentelemetry-collector-contrib:0.162.0, que publique los puertos 4317 y 4318.
6. Crea su archivo de configuración, con un receptor otlp para gRPC y HTTP y un exportador debug con verbosity: detailed en la tubería de trazas.

Restricciones:
- No modifiques el frontend.
- No leas ni resumas los registros del recolector.
- No crees subagentes.
- No añadas backend/.env a Git.

Al terminar, DETENTE. Resume los cambios e indícame que debo hacer lo siguiente:
1. Ejecutar `docker compose up -d observability`.
2. Ejecutar `make start`.
3. Registrarme, crear dos tareas y cambiar el estado de una desde el navegador.
4. Revisar las trazas con `docker compose logs observability`.
5. Contar las trazas con `docker compose logs observability | grep "Trace ID" | sort -u | wc -l`.

Espera mi mensaje antes de continuar. Si te digo que no llegan trazas, investiga la causa y corrígela sin leer los registros del recolector. Revisa el código y la configuración, o pídeme la información que necesites.
```

**Qué salió:** funcionó a la primera. Instaló `@adonisjs/otel` con `node ace add`, dejó `import '../otel.js'` en la línea 1 de `bin/server.ts` (el instalador lo había puesto bajo un comentario), añadió las variables, el servicio `observability` y `observability/otel-collector.yaml`. Añadió por su cuenta `test` al enum de `APP_ENV` para `.env.test` y la CI. Lint, typecheck y 70/70 tests en verde.

## Prompt 2

**Modelo:** Opus 5.5 (`claude-opus-5-5`)
**Herramienta:** Claude Code

```
<tarea_b>
Cuando te confirme que revisé las trazas, crea docs/slo/api.md exclusivamente para las rutas de /api/v1/tasks, sin cambiar las rutas ni los valores. Debe incluir:

1. SLI: fracción de peticiones a esas rutas que responden con un código inferior a 500 y tardan menos de 500 milisegundos, con numerador y denominador definidos según la ruta, el código de respuesta y la duración.
2. Objetivo: al menos el 99 % de esas peticiones deben cumplir el indicador durante una ventana móvil de 28 días.
3. Presupuesto de error: número de peticiones que pueden incumplir el indicador, calculado con un volumen supuesto de 20.000 peticiones durante la ventana. Indica claramente que ese volumen se sustituirá por el real.
4. Una única alerta basada en un problema que percibe el usuario, no en una causa interna, que avise cuando el ritmo de consumo indique que el presupuesto se agotará antes de terminar la ventana.

Indica también que todas las rutas ajenas a /api/v1/tasks, como el registro y el inicio de sesión, quedan fuera del objetivo y que, si se necesita medirlas, deberán tener su propio objetivo y presupuesto.

Solo documenta la alerta; no la implementes.
```

**Qué salió:** funcionó a la primera. `docs/slo/api.md` con las 10 rutas de `/api/v1/tasks`, SLI por `http.route`, código y duración, objetivo del 99 % en 28 días, presupuesto de 200 peticiones (volumen supuesto marcado como sustituible) y una sola alerta de ritmo de consumo (> 1 en 24 h y en 1 h, con mínimo de 50 peticiones), solo documentada.
