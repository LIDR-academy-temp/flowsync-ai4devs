# SLO de la API de tareas

Qué promete FlowSync a quien usa las tareas: que sus peticiones responden bien y a tiempo. Este documento fija cómo se mide, cuánto margen hay y cuándo se avisa.

## Alcance

**Dentro:** toda ruta que pertenezca a `/api/v1/tasks`, es decir, cuyo `http.route` sea exactamente `/api/v1/tasks` o empiece por `/api/v1/tasks/`. Hoy son estas (`backend/start/routes.ts`):

| Método | Ruta |
|---|---|
| GET, POST | `/api/v1/tasks` |
| GET | `/api/v1/tasks/trash` |
| GET, DELETE | `/api/v1/tasks/:id` |
| POST | `/api/v1/tasks/:id/restore` |
| PATCH | `/api/v1/tasks/:id/status` |
| PUT | `/api/v1/tasks/:id/due-date` |
| GET, POST | `/api/v1/tasks/:id/comments` |

**Fuera:** todas las demás, como el registro (`/api/v1/auth/signup`) y el inicio de sesión (`/api/v1/auth/login`), además de `/api/v1/account/*`, `/health`, `/` y la documentación OpenAPI. Una caída del login impide llegar a las tareas, pero este SLO no la cuenta.

## Indicador (SLI)

Es la fracción de peticiones a tareas que responden sin error del servidor y a tiempo:

```text
        peticiones a tareas con código < 500 y duración ≤ 500 ms
SLI = ──────────────────────────────────────────────────────────
                        peticiones a tareas
```

| Parte | Condición | Atributo de `http.server.duration` |
|---|---|---|
| Denominador | La ruta pertenece a `/api/v1/tasks` | `http.route` |
| Numerador | Lo anterior, y el código es menor que 500 | `http.status_code` |
| Numerador | Lo anterior, y la petición dura 500 ms o menos | el valor del histograma, en ms |

- **Los 4xx cuentan como buenos si llegan a tiempo.** Un 401, un 404 o un 422 son una respuesta correcta del servicio a una petición que no se podía atender.
- **Una petición mala es la que responde 5xx o tarda más de 500 ms.** Un 5xx es malo aunque sea rápido.
- **Una URL sin ruta registrada no cuenta**, porque no pertenece a ninguna ruta de tareas.

> **Valor propuesto, pendiente de confirmar:** el límite de 500 ms no venía en el encargo. Se ha elegido porque es un límite del histograma, lo que permite contar sin aproximar, y no por una medición: todavía no hay datos de las rutas de tareas.

## Objetivo (SLO)

**El 99 % de las peticiones a tareas son buenas, en una ventana móvil de 28 días.**

La ventana es móvil: en cada momento se miran los últimos 28 días, sin reinicio a principio de mes.

## Presupuesto de error

```text
presupuesto = (100 % − 99 %) × 20.000 peticiones = 200 peticiones malas cada 28 días
```

> **El volumen es un supuesto.** Las 20.000 peticiones por ventana de 28 días no están medidas y solo sirven para dar un orden de magnitud. Se sustituirán por el volumen real en cuanto haya 28 días de datos, y entonces se recalcularán el presupuesto y los valores de ejemplo de la alerta. El objetivo del 99 % no depende de este supuesto.

## Alerta

Hay una sola, y se basa en lo que percibe quien usa la API, no en causas internas como la CPU, la memoria o la base de datos.

**Nombre:** Las peticiones a tareas fallan o van lentas a un ritmo que agotará el presupuesto.

**Condición:**

```text
                   peticiones malas en las últimas 24 h / peticiones en las últimas 24 h
ritmo de consumo = ─────────────────────────────────────────────────────────────────────  > 1
                                                  0,01
```

Con un ritmo de consumo `R` sostenido, el presupuesto se agota en `28 / R` días. Un ritmo de 1 lo agota justo en 28 días, así que cualquier valor mayor que 1 lo agota antes de que termine la ventana.

Con el volumen supuesto, equivalente a unas 714 peticiones al día:

| Peticiones malas al día | Ritmo de consumo | El presupuesto se agota en |
|---|---|---|
| 7 | 0,98 | no salta |
| 8 | 1,12 | 25 días |
| 14 | 1,96 | 14,3 días |
| 71 | 9,94 | 2,8 días |

Si fallan todas las peticiones, la alerta salta a la octava mala: unos 16 minutos a un ritmo de unas 30 peticiones por hora. Se apaga cuando el ritmo de las últimas 24 horas vuelve a ser 1 o menos.

**Al recibirla:** comprobar qué rutas de tareas concentran las peticiones malas y si son 5xx o lentitud. La causa se busca después de confirmar el síntoma.

> Con poco tráfico, la proporción se mueve mucho con pocas peticiones: con 50 peticiones en un día, una sola mala ya supera el umbral. Hay que revisar la ventana de 24 horas al sustituir el volumen supuesto por el real.

## Estado de la medición

Este SLO está definido, pero **todavía no se puede medir ni alertar**:

- **Sin datos de producción.** `backend/config/otel.ts` solo activa OpenTelemetry con `NODE_ENV=development`, y producción no tiene collector.
- **Sin almacenamiento.** El collector solo tiene el exportador `debug`, que escribe en sus logs y no guarda series para calcular 28 días ni evaluar la alerta.
- **Rutas de tareas sin observar.** La métrica `http.server.duration` ya lleva `http.route` y `http.status_code`, pero solo se ha comprobado con rutas de `auth` y `account`.

Tampoco se medirán las peticiones que no lleguen al backend, como las de una caída total de la plataforma: el indicador sale de lo que registra el propio servidor. En ese caso tampoco habría datos con los que saltar la alerta.
