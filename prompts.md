# Prompts

Todos los prompts lanzados para hacer el ejercicio, en el orden en que se lanzaron. Todos con el
mismo modelo y la misma herramienta: **Claude Fable 5.1** en **Claude Code** (CLI, sesión única,
en la rama de trabajo del ejercicio).

---

## Prompt 1

**Modelo:** Claude Fable 5.1
**Herramienta:** Claude Code

```
Añade el recolector local de trazas. Nada más.

En compose.yaml, un servicio nuevo llamado observability:
- imagen: otel/opentelemetry-collector-contrib:0.162.0
- puertos publicados en el host: 4317 (gRPC) y 4318 (HTTP)
- monta un fichero de config del repo, por ejemplo otel-collector-config.yaml

Ese fichero debe tener:
- receivers.otlp con protocolos http (4318) y grpc (4317)
- exporters.debug con verbosity: detailed
- service.pipelines.traces: receiver otlp, sin processors, exporter debug

No levantes el contenedor todavía. No toques backend/ ni frontend/. No hagas commit.
Al terminar, enséñame el diff de compose.yaml y el yaml del collector.
```

**Qué salió:** funcionó a la primera; `docker compose config` validó los tres servicios. Lo lancé dos veces seguidas por error (el mismo texto) y la segunda solo volvió a enseñar el diff.

## Prompt 2

**Modelo:** Claude Fable 5.1
**Herramienta:** Claude Code

```
Instrumenta el backend con OpenTelemetry. Sigue estas reglas al pie de la letra.

Desde backend/, instala SOLO así:
  node ace add @adonisjs/otel
No uses npm install para ese paquete.

Después comprueba backend/bin/server.ts. La primera línea de ejecución tiene que ser exactamente:
  import '../otel.js'
Tiene que ir antes de reflect-metadata y de cualquier otro import. Si el instalador no la dejó ahí, muévela tú. Si queda detrás, no hay trazas.

El instalador añade APP_NAME, APP_VERSION y APP_ENV a la validación de entorno. Decláralas en los cuatro sitios, con los mismos nombres:
- backend/.env
    APP_NAME=flowsync-api
    APP_VERSION=1.0.0
    APP_ENV=development
    OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
- backend/.env.example (mismos nombres; valores de ejemplo, sin secretos)
- backend/.env.test (APP_ENV=test)
- .github/workflows/openapi.yml, dentro del bloque env: del job check, las tres APP_*. No añadas más variables al workflow.

El endpoint OTLP es HTTP en el puerto 4318. No uses 4317.

No toques frontend/. No escribas docs/slo/api.md todavía. No hagas commit. backend/.env no se versiona.

Al terminar, enséñame:
- las primeras 15 líneas de backend/bin/server.ts
- el diff de .env.example, .env.test y openapi.yml
- git status, y confirma que backend/.env no está en el índice
```

**Qué salió:** `node ace add` falló primero por el certificado del proxy corporativo (`SELF_SIGNED_CERT_IN_CHAIN`); se resolvió con `NODE_USE_SYSTEM_CA=1`. El instalador dejó el import bien puesto, pero el enum de `APP_ENV` no admitía `test` y hubo que añadirlo a mano, además de pasar prettier por lo que generó.

## Prompt 3

**Modelo:** Claude Fable 5.1
**Herramienta:** Claude Code

```
Levanta el recolector y la aplicación. No generes tráfico falso con curl ni con scripts.

1. docker compose up -d observability
2. docker compose logs observability
   Tiene que salir: "Everything is ready. Begin running and processing data."
   Si no sale, para y dime el error. No cambies el puerto a 4317.
3. make start
4. Dime las URLs (API en 3333, frontend en 5173) y espera.

Yo voy a registrar un usuario, crear dos tareas y cambiar el estado de una. No toques código mientras tanto. No hagas commit.
```

**Qué salió:** el recolector arrancó a la primera. `make start` cayó por el frontend (faltaba `@storybook/addon-vitest` en `node_modules`): hizo falta `npm ci` en `frontend/`, y luego cerrar un backend huérfano que se quedó en el 3333. Contra lo pedido, el modelo lanzó dos `curl` de comprobación a `/api/v1/account/profile` que acabaron siendo las únicas trazas.

## Prompt 4

**Modelo:** Claude Fable 5.1
**Herramienta:** Claude Code

```
Mide las trazas que ya recibió el recolector. No generes peticiones nuevas.

1. docker compose logs observability
2. Cuenta trazas únicas:
   docker compose logs observability | grep "Trace ID" | sort -u | wc -l
   En PowerShell el equivalente es válido si grep/wc no existen; dime el comando que usaste y el número.
3. Localiza una petición a /api/v1/tasks.
   - Span raíz: Kind Server, nombre y duración.
   - Spans de base de datos: Kind Client, duración de cada uno.
   - Compara la duración del span HTTP con la suma de los spans de base de datos.
   - Di qué tramo se comió más tiempo en la petición más lenta a /api/v1/tasks: tiempo dentro de Node o tiempo en la base de datos. Cita los números del log, no los estimes.
4. Confirma que service.name es flowsync-api.

No edites código. No escribas HALLAZGOS.md todavía. Pégame los números.
```

**Qué salió:** lo lancé antes de hacer el recorrido manual, así que solo había 2 trazas (las dos sondas del prompt anterior) y ninguna a `/api/v1/tasks`; el modelo lo dijo en vez de inventarse cifras. Hay que repetirlo después del recorrido.

## Prompt 5

**Modelo:** Claude Fable 5.1
**Herramienta:** Claude Code

```
Escribe docs/slo/api.md. Solo las rutas bajo /api/v1/tasks. No programes alertas, ni agentes, ni lectores de logs, ni toques CI.

El documento tiene que traer, con estas cifras:

1. SLI, como fracción:
   numerador = peticiones a /api/v1/tasks con HTTP status < 500 y latencia < 500 ms
   denominador = total de peticiones válidas a /api/v1/tasks

2. SLO: >= 99 % de peticiones conformes con ese SLI.
   Ventana: rolling window de 28 días.

3. Presupuesto de error con el volumen hipotético de 20.000 peticiones:
   20000 × (1 − 0.99) = 200 peticiones con fallo o latencia >= 500 ms.
   Deja escrito que ese volumen se sustituye por el tráfico real de producción.

4. Una sola alerta, por síntoma de usuario: burn rate. Se dispara cuando el ritmo de peticiones malas agotaría el presupuesto antes de acabar la ventana de 28 días. Nada de CPU ni de pods.

5. Frontera: este SLO no cubre /api/v1/auth/signup, /api/v1/auth/login, /api/v1/account/*, /health ni la documentación OpenAPI (/api, /api.json, /api.yaml). Esas rutas necesitarían su propio SLI. Usa estos paths: en este repo el alta es signup, no register. Compruébalo en backend/start/routes.ts antes de escribirlo.

No toques frontend/. No hagas commit.
```

**Qué salió:** funcionó a la primera; comprobó `routes.ts` y las diez rutas de tareas antes de escribir.

## Prompt 6

**Modelo:** Claude Fable 5.1
**Herramienta:** Claude Code

```
Sustituye el contenido de HALLAZGOS.md por tres respuestas, una línea cada una, con estos datos medidos (no los cambies):

1. Recuento: <N> trazas únicas (comando: <el que usaste>). En la petición más lenta a /api/v1/tasks el tramo mayor fue <Node o la base de datos>: span HTTP <X> ms, suma de spans de base de datos <Y> ms.

2. Las trazas <llegaron a la primera / no llegaron>. Lo que hubo que corregir: <nada, o la causa real: orden del import, puerto 4318, contenedor>.

3. El presupuesto de este SLO son 200 peticiones malas de cada 20.000 en 28 días. Di si eso te parece holgado o ajustado para un mes de uso normal de FlowSync, en una frase y con tu criterio.

No añadas una cuarta sección. No toques código. No hagas commit.
```

**Qué salió:** la primera redacción contó 2 trazas y dejó el tramo mayor como no medible, porque aún no había peticiones a tareas. Tras el recorrido (alta, dos tareas y un cambio de estado) se reescribió con la medición real: 24 trazas únicas y, en el `GET /api/v1/tasks` más lento, 131,5 ms de span HTTP frente a 29,7 ms de base de datos.

## Prompt 7

**Modelo:** Claude Fable 5.1
**Herramienta:** Claude Code

```
Checklist de cierre. No hagas commit, no hagas push, no abras el pull request.

Comprueba y dime sí o no, con la prueba al lado:
- backend/bin/server.ts: la primera línea es import '../otel.js'
- APP_NAME, APP_VERSION y APP_ENV están en backend/.env, backend/.env.example, backend/.env.test y en el env: de .github/workflows/openapi.yml
- OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 está en backend/.env
- los logs de observability tienen service.name flowsync-api
- git diff --stat no muestra nada bajo frontend/
- backend/.env no está en el índice (git check-ignore y git status)
- docs/slo/api.md tiene SLI, SLO 99 %, ventana de 28 días, presupuesto 200, alerta de burn rate y rutas excluidas
- HALLAZGOS.md tiene las tres respuestas

Si algo falla, corrige solo eso. Lista los archivos que entrarían en el commit y confirma que backend/.env no está entre ellos.
```

**Qué salió:** todo sí, sin nada que corregir; `backend/.env` ignorado por `backend/.gitignore`.

