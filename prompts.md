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

## Cómo los lancé

Los tres prompts fueron en la misma sesión de Claude Code, desde la raíz del repo y en la rama
`slo-gt`. Usé la config aislada (`CLAUDE_CONFIG_DIR=~/.claude-aislado claude`), así que el agente
no cargaba mi `CLAUDE.md` global ni mis hooks, solo lo del proyecto. Los prompts los preparé con
otra sesión de Claude a partir del enunciado y los lancé tal cual.

Antes de empezar, en `s14/start` (`a13f657`), `make test` dio 70 tests en verde en 4 s. En
`backend/bin/server.ts` no había nada de OpenTelemetry: arrancaba con el bloque de comentarios y
el primer import era `await import('reflect-metadata')`. `compose.yaml` solo tenía `db` y `db-test`.

---

# Parte A: instrumentar el backend

## Prompt 1

**Modelo:** Sonnet 5.5 (`claude-sonnet-5-5`), esfuerzo high
**Herramienta:** Claude Code 2.1.318 (config aislada)

```
Quiero instrumentar el backend con OpenTelemetry y mandar las trazas a un recolector local.

Backend:
- Instalá el paquete oficial @adonisjs/otel desde backend/ con node ace add @adonisjs/otel, no con npm install.
- El import de la instrumentación tiene que quedar como primera línea de backend/bin/server.ts. No muevas nada antes.
- El instalador agrega APP_NAME, APP_VERSION y APP_ENV a la validación. Tienen que estar en backend/.env, backend/.env.example, backend/.env.test y en el bloque env: de .github/workflows/openapi.yml. APP_NAME=flowsync-api.
- En backend/.env poné OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318.

Recolector:
- Agregá a compose.yaml un servicio llamado observability con la imagen otel/opentelemetry-collector-contrib:0.162.0, que publique 4317 y 4318.
- Con su archivo de configuración: un receptor otlp con grpc y http, y un exportador debug con verbosity: detailed en la tubería de trazas.

No toques el frontend ni otros workflows. No arranques nada: el recolector y la app los levanto yo.
```

**Qué salió:** Lo primero que hizo fue cargar la skill `backend-feature`, porque el `CLAUDE.md`
del proyecto dice que cualquier tarea de backend va con ella. Después decidió no seguir su flujo
(plan por capas, tests de contrato) porque esto no tiene rutas ni tablas, y lo dijo. Esta vez
editó con `Bash`.

Instaló el paquete con `node ace add`, que creó `otel.ts` y `config/otel.ts` y dejó
`import '../otel.js'` como primera sentencia de `server.ts`. Lo comprobé y los `await import`
de después siguen como estaban. Cambió el `APP_NAME=adonisjs_app` que dejó el instalador por
`flowsync-api`, puso las tres variables en los tres `.env` y en `openapi.yml`, y el endpoint
solo en `backend/.env`. En `.env.test` y en CI usó `APP_ENV=development`, porque el enum solo
acepta development, staging y production.

El recolector quedó en `observability/otel-collector.yaml`, con los receptores en `0.0.0.0`
dentro del contenedor. Por su cuenta publicó los puertos solo en `127.0.0.1`, porque el
recolector no tiene autenticación, y lo explicó. Pasó typecheck, eslint y `openapi:check`. No
arrancó nada y no hizo commit, así que lo commiteé yo. 1 min 39 s.

Después levanté el recolector (`Everything is ready`), arranqué `make start`, me registré, creé
dos tareas y le cambié el estado a una. `grep "Trace ID" | sort -u | wc -l` dio 0. La app
funcionaba normal y el recolector no mostraba ningún error.

## Prompt 2

**Modelo:** Sonnet 5.5 (`claude-sonnet-5-5`), esfuerzo high
**Herramienta:** Claude Code 2.1.318 (config aislada)
**Sesión:** la misma que el Prompt 1

Le pasé solo el síntoma, sin ninguna pista de la causa.

```
Levanté el recolector (docker compose logs observability dice "Everything is ready. Begin running and processing data."), arranqué la app con make start después de instrumentar, me registré, creé dos tareas y le cambié el estado a una. La app funciona bien, pero no llega ninguna traza: docker compose logs observability | grep "Trace ID" | sort -u | wc -l da 0, y el recolector no muestra errores. Investigá por qué no llegan y corregilo. No leas los registros del recolector ni toques el frontend: la comprobación de si llegan la hago yo.
```

**Qué salió:** Fue el más interesante de los tres. No tocó la instrumentación. Primero vio que
la app tenía una conexión abierta al 4318, así que el envío existía. Después levantó una copia
del backend en el 3334 contra un receptor falso suyo en el 4328, y ahí sí llegaron trazas,
también con la variable leída solo del `.env`. Con eso descartó el código.

En un momento intentó un `pkill` que el modo automático le bloqueó por demasiado amplio, porque
podía matar mi app. Lo reconoció y paró solo sus procesos, por PID.

La causa era otra: el 3333 lo tenía un backend viejo de mi otro clon (`flowsync-ai4devs`, sin
`-temp`). Era un `node ace serve --hmr` que tenía corriendo desde el 22 de septiembre, con un
hijo del 14 de octubre, y ese backend no tiene OpenTelemetry. Mi `make start` encontró el puerto
ocupado y levantó el backend instrumentado en otro puerto, sin avisar. El frontend seguía
hablando con el 3333, o sea con el viejo. Por eso la app andaba y no llegaba nada.

No mató ese proceso porque es de otra copia mía, y me dijo cómo hacerlo. Lo comprobé con `lsof`
y `ps` antes de tocar nada. El `kill` al padre no alcanzó: el hijo quedó huérfano escuchando en
el 3333 y lo tuve que matar aparte. No cambió ningún archivo. 2 min 31 s.

Con el 3333 libre reinicié `make start`. Antes de generar tráfico había 1 traza, que era un
`GET /api/v1/account/profile` con 401 que hizo el agente para identificar el proceso. Me
registré con otro usuario, creé dos tareas, cambié un estado y quedaron 11.

---

# Parte B: el objetivo de nivel de servicio

## Prompt 3

**Modelo:** Sonnet 5.5 (`claude-sonnet-5-5`), esfuerzo high
**Herramienta:** Claude Code 2.1.318 (config aislada)
**Sesión:** la misma que los prompts 1 y 2

```
Ahora escribí el objetivo de nivel de servicio de la API en docs/slo/api.md. Solo para las rutas de /api/v1/tasks, con estos valores, que no cambies:

- Indicador (SLI): fracción de peticiones a esas rutas que responden con código menor a 500 y tardan menos de 500 ms. Escribilo como fracción, con numerador y denominador, usando la ruta, el código de respuesta y la duración de cada petición.
- Objetivo: al menos el 99 % de esas peticiones cumplen el indicador, en una ventana móvil de 28 días.
- Presupuesto de error: en peticiones, suponiendo 20.000 peticiones en la ventana. Dejá claro que ese volumen es una suposición y se reemplaza por el real.
- Una sola alerta, basada en lo que nota el usuario y no en una causa interna: que avise cuando el ritmo de consumo del presupuesto indique que se va a agotar antes de que termine la ventana. Mostrá la cuenta del umbral.
- Decí explícitamente qué rutas quedan fuera: todo lo que no sea /api/v1/tasks, como el registro y el login. Si hace falta medirlas, llevan su propio objetivo y presupuesto.

No toques código ni configuración, solo ese documento.
```

**Qué salió:** Escribió `docs/slo/api.md` con todo lo pedido. Sacó las diez rutas de `tasks` de
`routes.ts` y aclaró que se miden por el patrón de la ruta, no por la URL con el id. El
presupuesto le dio 200 peticiones malas en 28 días (unas 7 por día), con la fórmula para cuando
haya volumen real. Las rutas de fuera las nombró: registro, login, `account/*` y cualquier ruta
nueva que no cuelgue de `/tasks`.

Lo que más me llamó la atención fue la alerta. La armó al pie de la letra del enunciado: salta si
la tasa de consumo pasa de 1 en las últimas 24 horas, que con el volumen supuesto son 8 o más
peticiones malas en un día. Descartó mirar una sola hora porque "una sola mala ya supera el 1 %".
Eso es cierto con umbral 1, pero la lección recomienda avisar cuando se gasta el 2 % del
presupuesto en una hora, que para 28 días es una tasa de 13,44. Con unas 30 peticiones por hora
serían unas 4 malas en una hora. No llegó a plantear esa opción. No se lo corregí: lo traigo así
para compararlo en el directo.

Declaró tres decisiones que no le di: las 24 horas de la alerta, que los 4xx cuentan como buenos
si son rápidos, y medir por patrón de ruta. También agregó un apartado que dice que hoy nada
calcula el indicador ni manda avisos. No hizo commit. 54 s.
