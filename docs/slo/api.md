# SLO de la API de tareas (`/api/v1/tasks`)

Objetivo de nivel de servicio de la parte de la API que usa el tablero de tareas. Se mide sobre
las trazas que el backend exporta con `@adonisjs/otel` (servicio `flowsync-api`).

## Alcance

Solo las rutas del grupo `tasks` de `backend/start/routes.ts`, todas autenticadas:

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

## 1. Indicador (SLI)

```
SLI = peticiones buenas / peticiones válidas
```

- **Denominador (peticiones válidas):** todas las peticiones cuyo tramo de tipo `Server` tiene un
  `http.route` que empieza por `/api/v1/tasks`.
- **Numerador (peticiones buenas):** las del denominador que cumplen las dos condiciones:
  - `http.response.status_code` < 500, y
  - duración del tramo (`End time` − `Start time`) < 500 ms.

De dónde sale cada dato, en el tramo `Server` de cada petición:

| Dato | Atributo / campo del tramo |
|---|---|
| Ruta | `http.route` (patrón, p. ej. `/api/v1/tasks/:id/status`; también va en el nombre del tramo, `PATCH /api/v1/tasks/:id/status`) |
| Código de respuesta | `http.response.status_code` |
| Duración | `End time` − `Start time` del tramo |

Un 4xx (401 sin sesión, 404, 422 de validación) cuenta como **bueno**: es un error de quien llama,
no del servicio. Una petición lenta cuenta como mala aunque responda 200.

## 2. Objetivo

**Al menos el 99 %** de las peticiones válidas son buenas, en una **ventana móvil de 28 días**.

## 3. Presupuesto de error

```
presupuesto = (1 − 0,99) × peticiones en la ventana
            = 0,01 × 20.000
            = 200 peticiones malas en 28 días
```

**20.000 es un volumen supuesto**, no medido. Cuando haya datos, se sustituye por el número real de
peticiones válidas de los últimos 28 días y el presupuesto se recalcula con la misma fórmula.

## 4. Alerta

Una sola alerta, sobre lo que nota el usuario (peticiones de tareas que fallan con 5xx o tardan
500 ms o más), no sobre causas internas como CPU, memoria o la base de datos.

**Ritmo de consumo** (*burn rate*) = fracción de peticiones malas ÷ 0,01. Con ritmo 1 el presupuesto
se acaba justo al cerrar la ventana; por encima de 1, antes.

**Salta cuando** se cumplen las tres a la vez:

1. ritmo de consumo ≥ 2 en las **últimas 6 horas**;
2. ritmo de consumo ≥ 2 en los **últimos 30 minutos** (confirma que sigue pasando ahora);
3. al menos **4 peticiones malas** en esas 6 horas.

Por qué estos valores:

- Con ritmo 2 sostenido, el presupuesto de 28 días se agota en **14 días**: a mitad de ventana.
- 6 horas filtran un pico aislado; la ventana de 30 minutos evita que siga sonando cuando el
  problema ya pasó.
- Con 20.000 peticiones en 28 días hay unas 30 por hora, unas 180 en 6 horas. Ritmo 2 equivale a un
  2 % de malas, unas 3,6 peticiones; el mínimo de 4 evita que salte por una o dos peticiones lentas
  con poco tráfico.

## Fuera del objetivo

Todo lo que no cuelga de `/api/v1/tasks` queda fuera de este SLO y **no consume su presupuesto**:

| Método | Ruta |
|---|---|
| POST | `/api/v1/auth/signup` (registro) |
| POST | `/api/v1/auth/login` (inicio de sesión) |
| GET | `/api/v1/account/profile` |
| POST | `/api/v1/account/logout` |
| GET | `/health` |
| GET | `/` |
| GET | `/api`, `/api.json`, `/api.yaml` (documentación OpenAPI) |

Si alguna de estas hay que medirla (por ejemplo el registro, que es lento a propósito por el hash de
la contraseña), necesita **su propio SLO y su propio presupuesto**: mezclarla aquí ocultaría los
fallos de una parte en el volumen de la otra.
