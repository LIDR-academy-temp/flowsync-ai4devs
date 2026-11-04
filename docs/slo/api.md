# Objetivo de nivel de servicio de la API de tareas

Alcance: **solo las rutas de `/api/v1/tasks`**. Todo lo demás queda fuera (ver [Qué queda fuera](#qué-queda-fuera)).

Los valores de este documento (indicador, objetivo, ventana y alerta) están fijados. El único dato que hay que reemplazar es el volumen de peticiones, que aquí es una suposición.

## Rutas cubiertas

Las que cuelgan del prefijo `tasks` en `backend/start/routes.ts`, todas bajo `/api/v1`:

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

Una petición pertenece al conjunto cuando su **ruta** (el patrón de la ruta, `/api/v1/tasks/:id/status`, no la URL con el identificador concreto) empieza por `/api/v1/tasks`. Si se añade una ruta al grupo `tasks`, entra sola en el objetivo.

## Indicador (SLI)

Para cada petición se toman tres datos: su **ruta**, su **código de respuesta** y su **duración**.

```
                 peticiones con  ruta ∈ /api/v1/tasks  Y  código < 500  Y  duración < 500 ms
SLI  =  ──────────────────────────────────────────────────────────────────────────────────────
                 peticiones con  ruta ∈ /api/v1/tasks
```

- **Numerador** (peticiones buenas): peticiones a las rutas cubiertas cuyo código de respuesta es menor que 500 **y** cuya duración es menor que 500 ms.
- **Denominador** (peticiones válidas): todas las peticiones a las rutas cubiertas en la ventana.
- Una petición es **mala** si cumple al menos una de estas dos: código ≥ 500, o duración ≥ 500 ms. Una petición con 200 que tarda 800 ms es mala; una con 500 que tarda 20 ms también.
- Los códigos 4xx (401, 404, 422…) cuentan como buenos si responden en menos de 500 ms: son respuestas correctas a una petición que el cliente hizo mal, no un fallo del servicio.
- La duración es la que mide el servidor, desde que recibe la petición hasta que termina la respuesta (la duración del span HTTP de OpenTelemetry), con el código de estado y la ruta como atributos del mismo span.

## Objetivo (SLO)

**Al menos el 99 % de las peticiones a `/api/v1/tasks` cumplen el indicador, en una ventana móvil de 28 días.**

```
SLI (últimos 28 días) ≥ 0,99
```

## Presupuesto de error

El presupuesto es la fracción de peticiones que puede ser mala sin incumplir el objetivo: `1 − 0,99 = 0,01` (el 1 %).

> **Suposición, no un dato medido.** Los números de esta sección parten de **20.000 peticiones a `/api/v1/tasks` en la ventana de 28 días**. Es un volumen supuesto. Cuando haya tráfico real, se sustituye por el medido y se rehace la cuenta con la misma fórmula.

```
presupuesto (peticiones) = volumen de la ventana × (1 − objetivo)
                         = 20.000 × 0,01
                         = 200 peticiones malas en 28 días
```

| Dato | Valor (con el volumen supuesto) |
|---|---|
| Volumen en la ventana | 20.000 peticiones (**suposición**) |
| Peticiones buenas mínimas | 19.800 |
| **Presupuesto de error** | **200 peticiones malas** |
| Ritmo de consumo «de crucero» | 200 / 28 días ≈ 7,14 peticiones malas por día |
| Volumen medio supuesto | 20.000 / 28 ≈ 714 peticiones por día |

Con el volumen real `V`, el presupuesto es `V × 0,01`.

## Alerta

Hay **una sola alerta**. Mira lo que nota la persona que usa la API (peticiones que fallan o van lentas), no una causa interna: no hay alertas por CPU, memoria, conexiones a la base ni nada parecido.

**Se dispara cuando el ritmo de consumo del presupuesto indica que se agotará antes de que termine la ventana.**

### Cuenta del umbral

El **ritmo de consumo** (*burn rate*) compara la fracción de peticiones malas que se está viendo con la que el presupuesto permite:

```
ritmo de consumo = (peticiones malas / peticiones válidas, en el periodo de observación) / (1 − objetivo)
                 = (peticiones malas / peticiones válidas) / 0,01
```

- Con ritmo de consumo **1** se gasta el presupuesto justo al ritmo que lo agotaría en los 28 días exactos: `28 días / 1 = 28 días`. Es el límite.
- Con ritmo **mayor que 1** el presupuesto se agota antes: `28 días / ritmo`. Con ritmo 2, en 14 días; con ritmo 4, en 7.

Por tanto, «se va a agotar antes de que termine la ventana» equivale a **ritmo de consumo > 1**, que es lo mismo que **más del 1 % de peticiones malas** en el periodo de observación:

```
umbral:  peticiones malas / peticiones válidas  >  0,01
```

**Periodo de observación: las últimas 24 horas.** (Decisión de este documento; es lo único de la alerta que no viene dado, y se puede cambiar sin tocar el resto.) Con el volumen supuesto:

```
peticiones válidas en 24 h ≈ 20.000 / 28 ≈ 714
umbral en peticiones       = 714 × 0,01 ≈ 7,14   →   la alerta salta con 8 o más peticiones malas en 24 h
```

Esas 8 son el 4 % del presupuesto de 200. Si el tráfico real es distinto, el umbral se recalcula con la fracción (`> 1 %`), que no depende del volumen; el número de peticiones es solo la lectura de esa fracción con el volumen supuesto.

Con tan poco tráfico, un periodo corto no serviría: en una hora hay unas 30 peticiones y una sola mala ya supera el 1 %. Por eso el periodo es de 24 horas. Si el volumen real fuera mucho mayor, se podría acortar.

### Resumen de la alerta

| Campo | Valor |
|---|---|
| Condición | peticiones malas / peticiones válidas > 0,01 en las últimas 24 h (ritmo de consumo > 1) |
| Qué mide | experiencia de la persona usuaria: códigos ≥ 500 y respuestas de 500 ms o más |
| Qué significa | si ese ritmo se mantuviera, el presupuesto de 28 días se agotaría antes de que acabe la ventana |
| Cuántas hay | una |
| Destino del aviso | por definir (no existe todavía ningún sistema de alertas) |

## Qué queda fuera

**Todo lo que no sea `/api/v1/tasks` queda fuera de este objetivo, de su presupuesto y de su alerta.** En concreto:

- `POST /api/v1/auth/signup` (registro) y `POST /api/v1/auth/login` (login).
- `GET /api/v1/account/profile` y `POST /api/v1/account/logout`.
- Cualquier otra ruta, ahora o futura, que no cuelgue de `/api/v1/tasks`.

Sus peticiones no entran ni en el numerador ni en el denominador, y no consumen presupuesto. Si hace falta medirlas, **cada grupo de rutas lleva su propio objetivo y su propio presupuesto**, en su propio documento, con su indicador, su volumen y su alerta.

## Estado de la medición

Hoy el backend manda trazas a un recolector local (`observability` en `compose.yaml`) que solo las imprime. No hay almacenamiento de series, ni cálculo del indicador, ni sistema de alertas. Este documento fija **qué** hay que medir y **cuándo** avisar; cómo se calcula y se envía el aviso es trabajo aparte.
