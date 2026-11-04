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
Voy a instrumentar el backend con OpenTelemetry usando el paquete oficial @adonisjs/otel. Antes de hacer nada, explora y respóndeme. En este prompt no crees ni modifiques ningún archivo y no instales nada.

Esto es observabilidad, no una feature de backend: no hay Requirement ni contrato nuevo, así que no hace falta la skill backend-feature ni sus subagentes, ni aquí ni en los siguientes encargos.

Mi máquina: Windows 11 con Git Bash (no WSL) y Docker Desktop. Las dos bases están levantadas y estoy en la rama slo-MC.

Responde citando archivo:línea, o la URL de la documentación que hayas leído. No lo deduzcas de memoria: el stack va en versiones más nuevas que lo que conoces.

1. Qué hace `node ace add @adonisjs/otel` según su documentación oficial: qué archivos crea, cuáles modifica y qué variables añade a la validación.
2. Cómo arranca hoy backend/bin/server.ts y qué significa ahí que la instrumentación se cargue antes que todo lo demás.
3. Todos los sitios del repositorio donde hay que declarar una variable de entorno para que la aplicación arranque: archivos .env, backend/start/env.ts, workflows y cualquier otro. Para cada workflow, di si arranca la aplicación y de dónde saca sus variables.
4. Cómo evitar que un servicio nuevo de compose.yaml se levante con `make db-up`.

Termina con los riesgos que ves, de más a menos probable. Nada más.
```

## Prompt 2

**Modelo:** Claude Opus 5.5
**Herramienta:** Claude Code

```
Instrumenta el backend con OpenTelemetry. Trabaja en la rama actual, slo-MC; no crees otra.

Instalación:
- Usa el comando del framework, desde backend/: `node ace add @adonisjs/otel`. No uses npm install: la instalación manual no genera ni registra todo lo necesario.
- La importación que añade el instalador debe quedar como primera línea de backend/bin/server.ts. No la muevas ni cargues nada antes.

Variables:
- APP_NAME, APP_VERSION y APP_ENV en backend/.env, backend/.env.example, backend/.env.test y en el bloque env: de .github/workflows/openapi.yml. Usa APP_NAME=flowsync-api. Elige los otros dos valores según lo que acepte la validación que deje el instalador en backend/start/env.ts, y dime cuáles usaste.
- OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 en backend/.env, que está ignorado por git y debe seguir así.
- No toques ningún otro workflow ni nada más de la integración continua.

Recolector:
- Añade a compose.yaml un servicio llamado exactamente `observability`, con la imagen otel/opentelemetry-collector-contrib:0.162.0, que publique los puertos 4317 y 4318 y monte un archivo de configuración versionado en el repositorio.
- Ese archivo: un receptor otlp para los dos protocolos y un exportador debug con verbosity: detailed en la tubería de trazas.
- `make db-up` no debe levantarlo: tiene que arrancar solo con `docker compose up -d observability`. Sigue el estilo de comentarios de compose.yaml.

No toques el frontend. Esto no es una feature de backend: no hace falta la skill backend-feature ni su plan, y no uses subagentes.

No arranques la aplicación ni el recolector, y no leas sus registros: los levanto yo y lo que salga es mi dato. Sí puedes ejecutar `make test` y, desde backend/, `npm run typecheck` y `npm run openapi:check`; dime qué dieron.

Al terminar:
1. Los archivos creados o modificados, con una línea de por qué.
2. Una lista aparte de todo lo que hayas añadido por tu cuenta, con el motivo.
3. Commit en slo-MC, sin los cambios de solo finales de línea de backend/.adonisjs ni de backend/database/schema.ts. No abras ningún pull request.
```

## Prompt 3

**Modelo:** Claude Opus 5.5
**Herramienta:** Claude Code

```
Las trazas no llegan al recolector. La aplicación funciona con normalidad y no veo ningún error.

Lo que he hecho, en orden: docker compose up -d observability, make start y tráfico desde el navegador.
Lo que he medido, literal:

1 - docker compose ps observability
NAME                               IMAGE                                          COMMAND                  SERVICE         CREATED         STATUS         PORTS
flowsync-ai4devs-observability-1   otel/opentelemetry-collector-contrib:0.162.0   "/otelcol-contrib --…"   observability   5 seconds ago   Up 5 seconds   127.0.0.1:4317-4318->4317-4318/tcp

docker compose logs observability | grep "Trace ID" | sort -u | wc -l
0

Investiga la causa antes de cambiar nada. No me des una lista de posibilidades: comprueba cada una con un comando o leyendo un archivo, y dime qué has visto. Puedes hacer peticiones de prueba al recolector desde mi máquina. No leas docker compose logs: si necesitas algo de ahí, pídemelo y te lo pego.

Cuando la tengas, explícame en dos líneas cuál era la causa y por qué no daba ningún error. Después corrige solo eso y haz commit en slo-MC. Vuelvo a probar yo.
```

## Prompt 4

**Modelo:** Claude Opus 5.5
**Herramienta:** Claude Code

```
Escribe el objetivo de nivel de servicio de la API en docs/slo/api.md. Trabaja en slo-MC. Solo ese archivo: no cambies código, rutas, configuración ni workflows. No uses subagentes ni leas los registros del recolector.

Valores, que no se cambian:
- Alcance: solo las rutas bajo /api/v1/tasks. Lístalas tal como están en backend/start/routes.ts.
- Indicador (SLI): fracción de peticiones a esas rutas que responden con un código inferior a 500 y tardan menos de 500 milisegundos.
- Objetivo: al menos el 99 % de esas peticiones cumplen el indicador durante una ventana móvil de 28 días.
- Volumen supuesto: 20.000 peticiones en la ventana.

No he conseguido trazas: marca los nombres de atributo como sin comprobar

El documento tiene que incluir:
1. El indicador como fracción, con numerador y denominador explícitos, usando la ruta, el código de respuesta y la duración de cada petición.
2. El objetivo del 99 % y su ventana móvil de 28 días.
3. El presupuesto de error en peticiones, con la cuenta a la vista. Debe quedar claro que las 20.000 son una suposición y que se sustituirán por el volumen real.
4. Una única alerta, basada en un problema que percibe quien usa la API y no en una causa interna: que avise cuando el ritmo de consumo del presupuesto indique que se agotará antes de terminar la ventana. Di con qué umbral y sobre qué periodo, y muestra la cuenta para 28 días, no para 30. Quien lea el aviso debe entender qué síntoma está pasando.

Además:
- Una sección que diga qué rutas quedan fuera: todas las que no pertenezcan a /api/v1/tasks, como el registro y el inicio de sesión. Si hay que medirlas, tendrán su propio objetivo y presupuesto.
- Di qué pasa con lo que el indicador deja implícito: que un 4xx cuenta como bueno, y qué decides con las peticiones OPTIONS si las hay.
- Di con honestidad qué se puede medir hoy: el recolector solo escribe en sus registros, así que nada calcula todavía este SLO ni dispara la alerta.

Sin más alertas, sin paneles y sin implementar nada. Al terminar, dime qué has decidido por tu cuenta y haz commit en slo-MC. No abras ningún pull request.
```

## Prompt 5

**Modelo:** Claude Opus 5.5
**Herramienta:** Claude Code

```
Ya he visto trazas reales en el recolector. No había ningún defecto: mi recuento dio 0 porque medí sin haber generado tráfico contra la API.

Actualiza solo docs/slo/api.md. Los atributos que he visto en mis trazas son http.route, http.response.status_code y http.method, y la duración es el fin menos el inicio del tramo con Kind: Server. Quita las marcas de "sin comprobar" de esos nombres, deja una sola opción donde ahora hay dos, y corrige la frase que dice que aún no se han visto trazas reales.

No cambies los valores del objetivo, el presupuesto ni la alerta. No toques ningún otro archivo ni leas los registros del recolector. Haz commit en slo-MC y no abras ningún pull request.
```
