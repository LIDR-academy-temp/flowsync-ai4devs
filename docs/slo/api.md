# SLO de la API de FlowSync

Objetivo de nivel de servicio (SLO) de la API, expresado como un único indicador (SLI), un
objetivo, un presupuesto de error y una sola alerta por síntoma.

## Alcance

Cubre **solo las rutas bajo `/api/v1/tasks`**, tal y como las declara
[`backend/start/routes.ts`](../../backend/start/routes.ts) en el grupo con prefijo `tasks`:

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

**Quedan expresamente fuera** el registro (`POST /api/v1/auth/signup`), el inicio de sesión
(`POST /api/v1/auth/login`), el perfil y el cierre de sesión (`/api/v1/account/*`), la raíz, el
`/health` y cualquier otra ruta presente o futura que no cuelgue de `/api/v1/tasks`. Si una ruta
nueva se añade a ese grupo, entra en el alcance sin tener que tocar este documento.

## SLI

Fracción de peticiones buenas sobre peticiones totales:

```
        peticiones a /api/v1/tasks con código de respuesta < 500 y duración < 500 ms
SLI = ───────────────────────────────────────────────────────────────────────────────
                        todas las peticiones a /api/v1/tasks
```

- **Numerador:** peticiones a cualquiera de las rutas del alcance cuyo código HTTP es menor que
  500 **y** cuya duración, medida en el servidor, es menor que 500 ms. Las dos condiciones a la vez.
- **Denominador:** todas las peticiones a esas rutas, sea cual sea su código o duración.

Un 4xx cuenta como petición buena: una validación rechazada o un 401 son respuestas correctas de la
API, no un fallo del servicio. Un 5xx o una respuesta lenta cuentan como malas aunque el cliente
acabe recibiendo lo que pedía.

**Datos necesarios.** Para calcular el SLI hace falta, **de cada petición**, tres cosas: la **ruta**
(para saber si está en el alcance), el **código de respuesta** y la **duración**. Las tres salen de
la instrumentación con OpenTelemetry del backend (`@adonisjs/otel`): cada petición genera un span con
`http.route`, `http.response.status_code` y su duración. Sin alguno de los tres datos la petición no
se puede clasificar y el SLI no se puede calcular.

## Objetivo

**99 %** de peticiones buenas sobre una **ventana móvil de 28 días**.

Móvil quiere decir que en cada momento se mira hacia atrás los últimos 28 días completos, no el mes
natural: el objetivo se cumple o se incumple de forma continua, sin «reinicio» a primeros de mes.

## Presupuesto de error

El complemento del objetivo: **1 %** de las peticiones de la ventana pueden incumplir el SLI (ser un
5xx, tardar 500 ms o más, o las dos cosas).

Con el **supuesto de 20.000 peticiones** a `/api/v1/tasks` en los 28 días:

| | |
|---|---|
| Peticiones en la ventana (supuesto) | 20.000 |
| Objetivo | 99 % |
| Presupuesto de error | 1 % = **200 peticiones** |

Esas 200 peticiones son las que pueden fallar en toda la ventana sin incumplir el objetivo. El 20.000
es un supuesto de partida para que el presupuesto tenga una cifra concreta: **se sustituirá por el
volumen real** de peticiones de la ventana en cuanto la instrumentación lleve 28 días recogiendo
datos, y el presupuesto en peticiones se recalculará a partir de él. Lo que no cambia es el 1 %.

## Alerta

Una única alerta, **por síntoma**: no avisa de que un servidor esté caído ni de que la base vaya
lenta, sino de que **el presupuesto de error se está consumiendo tan deprisa que se agotará antes de
que termine la ventana**. Si el presupuesto se gasta a ritmo sostenible, no suena nada aunque haya
errores.

**Referencia:** avisar cuando se haya consumido el **2 % del presupuesto en 1 hora**, lo que
corresponde a una **tasa de consumo (burn rate) de 13,44** para una ventana de 28 días.

De dónde sale el 13,44: la ventana tiene 28 × 24 = 672 horas. A tasa 1 (consumo exactamente
sostenible) en una hora se gasta 1/672 del presupuesto. Gastar el 2 % en una hora es 13,44 veces esa
cantidad (0,02 × 672 = 13,44). A ese ritmo el presupuesto entero duraría 672 / 13,44 = 50 horas, poco
más de dos días.

En términos del SLI, con objetivo 99 % la alerta equivale a que en la última hora la fracción de
peticiones malas supere 13,44 × 1 % = **13,44 %** de las peticiones a `/api/v1/tasks`.

Condición de la alerta, en una línea:

```
peticiones malas en la última hora / peticiones totales en la última hora  >  0,1344
```

Con el supuesto de 20.000 peticiones en 28 días (unas 30 por hora de media), el 2 % del presupuesto
son 4 peticiones malas en una hora. Con tan poco volumen la alerta es sensible a una sola ráfaga; al
sustituir el supuesto por el volumen real habrá que comprobar que el umbral sigue teniendo sentido.
