# SLO de la API de tareas

Un objetivo de nivel de servicio para lo que la persona hace todo el día en FlowSync: ver, crear y mover tareas. Se mide con las trazas que el backend exporta por OpenTelemetry (`@adonisjs/otel`, servicio `flowsync-api`), una por petición.

## Alcance

Entran las peticiones a las rutas bajo `/api/v1/tasks`, tal como las declara `start/routes.ts`:

| Método | Ruta |
|---|---|
| GET | `/api/v1/tasks` |
| POST | `/api/v1/tasks` |
| GET | `/api/v1/tasks/trash` |
| GET | `/api/v1/tasks/:id` |
| DELETE | `/api/v1/tasks/:id` |
| POST | `/api/v1/tasks/:id/restore` |
| PATCH | `/api/v1/tasks/:id/status` |
| PUT | `/api/v1/tasks/:id/due-date` |
| GET | `/api/v1/tasks/:id/comments` |
| POST | `/api/v1/tasks/:id/comments` |

**Quedan fuera** todas las demás: `/api/v1/auth/signup`, `/api/v1/auth/login`, `/api/v1/account/profile`, `/api/v1/account/logout`, `/health`, `/`, `/api`, `/api.json` y `/api.yaml`. No es que no importen: se comportan distinto y mezclarlas falsearía el número. El registro, por ejemplo, tardó 505 ms en la primera medición porque calcula el hash de la contraseña a propósito despacio; con él dentro, el SLO de tareas pagaría el coste de una decisión de seguridad. Si hay que medir el registro y el inicio de sesión, tendrán **su propio objetivo y su propio presupuesto**.

Una ruta nueva bajo `/api/v1/tasks` entra en el objetivo sin tocar este documento, porque el filtro es el prefijo. Se añade a la tabla en el mismo cambio que la ruta.

## Indicador (SLI)

La fracción de peticiones buenas sobre las peticiones válidas, contadas sobre el tramo de tipo `Server` de cada traza:

```
             peticiones a /api/v1/tasks* con código < 500 y duración < 500 ms
SLI  =  ─────────────────────────────────────────────────────────────────────────
                        peticiones a /api/v1/tasks*
```

- **Ruta:** el atributo `http.route` del tramo empieza por `/api/v1/tasks`. Se usa la ruta declarada (`/api/v1/tasks/:id/status`), no la URL con el id, para que el filtro no dependa de los datos.
- **Código:** `http.response.status_code` menor que 500. Un 4xx cuenta como buena: el servicio respondió bien a una petición que estaba mal (un 401 sin token, un 422 de validación). Un 5xx cuenta como mala.
- **Duración:** `End time` menos `Start time` del tramo `Server`, estrictamente menor que 500 ms. Una petición que responde 200 en 600 ms es mala: para la persona, la pantalla tardó.

Lo que el indicador **no ve**: una petición que no llega al servidor (caída del proceso, del proxy o de la red) no deja tramo y no entra ni en el numerador ni en el denominador. Si el servicio está caído del todo, el SLI no baja, se queda sin datos. Esa caída la vigila otra comprobación (`/health`), no este SLO.

## Objetivo

**Al menos el 99 % de las peticiones a `/api/v1/tasks*` cumplen el indicador, en una ventana móvil de 28 días.**

Móvil quiere decir que cada día se mira hacia atrás 28 días: no hay un día 1 en el que el presupuesto se reinicia. 28 días son cuatro semanas exactas, así que cada ventana contiene los mismos días de la semana y un lunes con mucho tráfico no hace subir ni bajar el número según en qué mes caiga.

## Presupuesto de error

El 1 % restante es lo que se puede permitir fallar sin incumplir el objetivo.

| | Valor |
|---|---|
| Volumen supuesto en la ventana | 20.000 peticiones |
| Fracción permitida de malas | 1 % |
| **Presupuesto** | **20.000 × 0,01 = 200 peticiones malas en 28 días** |
| Ritmo que lo agota justo al final | 200 / 28 ≈ 7 peticiones malas al día |

**Las 20.000 peticiones son una suposición** para poder escribir el número. En cuanto haya tráfico real, el presupuesto es el 1 % del denominador medido en los últimos 28 días, y este apartado se actualiza con el volumen observado. El porcentaje es el compromiso; las 200 peticiones son solo su traducción con un volumen que todavía no se ha medido.

## Alerta

Una sola, y sobre lo que la persona nota (peticiones que fallan o tardan), no sobre una causa (CPU, memoria, una consulta lenta). Las causas se buscan en las trazas cuando la alerta ya ha saltado.

Se basa en el **ritmo de consumo** del presupuesto (burn rate): la fracción de peticiones malas observada, dividida por la permitida (1 %). A ritmo 1 el presupuesto se agota exactamente al final de los 28 días; por encima de 1, antes.

> **Avisa cuando, en las últimas 24 horas, el ritmo de consumo es igual o mayor que 2 y hay al menos 10 peticiones malas.**
>
> A ese ritmo, los 200 errores permitidos se gastan en 14 días: el presupuesto se agotará antes de que termine la ventana, con dos semanas de margen para actuar.

Por qué estos números:

- **24 horas y no una hora.** Con 20.000 peticiones en 28 días salen unas 714 al día y unas 30 por hora. En una hora, una sola petición lenta ya es un 3 % y dispararía la alerta por ruido. En 24 horas, un ritmo de 2 son unas 14 peticiones malas, que ya no es casualidad.
- **Ritmo 2 y no 1.** Justo por encima de 1 el aviso saltaría con cualquier día algo peor que la media, y el presupuesto existe precisamente para absorber esos días.
- **Al menos 10 peticiones malas.** Protege de los días con muy poco tráfico, en los que dos peticiones lentas de 50 ya serían un 4 %.

Lo que la alerta dice al saltar: el ritmo de las últimas 24 horas, cuántas peticiones malas lleva la ventana y cuánto presupuesto queda. Quien la recibe empieza por las trazas de las peticiones malas, filtrando por `http.route` y por duración.

## Cómo se mide hoy

En local, el destino de las trazas es el recolector `observability` de `compose.yaml`, que las escribe en sus registros (`docker compose logs observability`). No guarda nada ni calcula el SLI: sirve para comprobar que las trazas llegan y qué contienen. Calcular el indicador y la alerta exige un destino que almacene las trazas (o una métrica derivada de ellas) durante 28 días. Como la instrumentación y el destino son independientes, ese cambio es una variable de entorno (`OTEL_EXPORTER_OTLP_ENDPOINT`), no tocar el código.
