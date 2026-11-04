# SLO de la API: rutas de tareas (`/api/v1/tasks`)

Objetivo de nivel de servicio (*Service Level Objective*, SLO) de las rutas de
`/api/v1/tasks`. Se mide con los tramos (*spans*) que el backend ya emite con
OpenTelemetry (`@adonisjs/otel`, configurado en `backend/config/otel.ts`): no
hace falta instrumentar nada más.

## Alcance

Las diez rutas registradas bajo `/api/v1/tasks` (`node ace list:routes`):

| Método | Ruta (`http.route`) |
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

Cada petición se identifica por el patrón de su ruta, no por la URL:
`GET /api/v1/tasks/42` cuenta como `GET /api/v1/tasks/:id`. Una ruta nueva que
se registre bajo `/api/v1/tasks` entra en el objetivo sin tocar este documento.

## 1. Indicador (SLI)

Fracción de las peticiones a esas rutas que responden con un código inferior a
500 **y** tardan menos de 500 milisegundos:

```
        peticiones con http.route bajo /api/v1/tasks, http.status_code < 500 y duración < 500 ms
SLI = ────────────────────────────────────────────────────────────────────────────────────────────
        peticiones con http.route bajo /api/v1/tasks
```

- **Denominador (peticiones válidas):** cada tramo de servidor HTTP del servicio
  `flowsync-api` cuyo `http.route` empieza por `/api/v1/tasks`.
- **Numerador (peticiones buenas):** las del denominador que, además, cumplen
  las dos condiciones a la vez: `http.status_code` menor que 500 y duración
  menor que 500 ms. Basta con que falle una para que la petición cuente como
  incumplimiento.

De dónde sale cada dato:

| Dato | En el tramo | Quién lo pone |
|---|---|---|
| Ruta | `http.route` | el middleware de `@adonisjs/otel`, y lo repite `@opentelemetry/instrumentation-http` al cerrar la respuesta |
| Código de respuesta | `http.status_code` | `@opentelemetry/instrumentation-http`, al cerrar la respuesta |
| Duración | fin − inicio del tramo de servidor | el SDK de OpenTelemetry |

Notas:

- **Un 4xx cuenta como bueno** si tarda menos de 500 ms: es una respuesta
  correcta a una petición que no se podía atender (sin sesión, con datos que no
  pasan la validación, a una tarea que no existe).
- **El código se lee de `http.status_code`, no de `http.response.status_code`.**
  El middleware de `@adonisjs/otel` escribe este último después de
  `await next()`, y cuando la respuesta sale de una excepción —que es como se
  produce un 500— no llega a escribirlo. `http.status_code` lo pone la
  instrumentación HTTP al cerrar la respuesta y está siempre. Es el nombre de la
  convención por defecto: si algún día se activa
  `OTEL_SEMCONV_STABILITY_OPT_IN=http`, el atributo pasa a llamarse
  `http.response.status_code` y hay que revisar esta definición.
- **La duración es la del servidor:** desde que llega la petición hasta que
  termina la respuesta. No incluye la red hasta quien la hizo.
- **No entran en el denominador** las peticiones `OPTIONS` (el paquete no las
  traza) ni las URLs bajo el prefijo que no coinciden con ninguna ruta (no
  tienen `http.route`).

## 2. Objetivo

Al menos el **99 %** de las peticiones válidas deben ser buenas, medido sobre una
**ventana móvil de 28 días**:

```
SLI (últimos 28 días) ≥ 0,99
```

Móvil quiere decir que en cada momento se mira lo ocurrido en los 28 días
anteriores; no es un mes natural que vuelve a empezar de cero.

## 3. Presupuesto de error

Es el número de peticiones que pueden incumplir el indicador dentro de la
ventana sin romper el objetivo:

```
presupuesto = peticiones en la ventana × (1 − objetivo)
            = 20.000 × (1 − 0,99)
            = 20.000 × 0,01
            = 200 peticiones
```

> **20.000 es un volumen supuesto.** Cuando haya datos, se sustituye por el
> número real de peticiones válidas de los últimos 28 días:
> presupuesto = N real × 0,01.

Referencias con el volumen supuesto:

- 20.000 / 28 ≈ 714 peticiones al día.
- 200 / 28 ≈ 7,1 incumplimientos al día. Gastar a ese ritmo agota el
  presupuesto justo al final de la ventana: es un ritmo de consumo de 1.

## 4. Alerta

Una sola alerta: **las peticiones a tareas fallan o van lentas más de lo que
permite el objetivo.**

- **Se basa en lo que percibe quien usa la API:** peticiones a `/api/v1/tasks`
  que responden con un 5xx o tardan 500 ms o más, exactamente lo que el
  indicador cuenta como incumplimiento. No hay alertas por causas internas (CPU,
  memoria, conexiones a la base de datos, errores en el log): si no afectan a
  esas peticiones no consumen presupuesto, y si las afectan ya salta esta.
- **Ritmo de consumo**, medido sobre las últimas 24 horas:

  ```
  ritmo = (incumplimientos en las últimas 24 h / peticiones válidas en las últimas 24 h) / (1 − 0,99)
  ```

- **Dispara cuando el ritmo es mayor que 1.** Con un ritmo de 1 el presupuesto
  se gasta exactamente en 28 días; por encima de 1 se agotaría antes de terminar
  la ventana. A un ritmo dado, el presupuesto dura 28 / ritmo días: con ritmo 2,
  unos 14 días; con ritmo 4, unos 7.
- **Con el volumen supuesto** (≈ 714 peticiones en 24 horas), dispara con más de
  7,1 incumplimientos en 24 horas, es decir, con 8 o más. La condición se expresa
  como fracción (más del 1 % de las peticiones de las últimas 24 horas) para que
  siga valiendo con el volumen real.

## Rutas fuera de este objetivo

Este SLO cubre solo `/api/v1/tasks`. Quedan fuera todas las rutas que no
pertenecen a ese prefijo:

| Método | Ruta | Qué es |
|---|---|---|
| POST | `/api/v1/auth/signup` | registro |
| POST | `/api/v1/auth/login` | inicio de sesión |
| GET | `/api/v1/account/profile` | perfil de la sesión |
| POST | `/api/v1/account/logout` | cierre de sesión |
| GET | `/health` | comprobación de vida de la plataforma (además, no se traza) |
| GET | `/` | respuesta de prueba |
| GET | `/api`, `/api.json`, `/api.yaml` | documentación OpenAPI |

Sus peticiones no entran ni en el numerador ni en el denominador, y no consumen
este presupuesto. **Si se quieren medir, necesitan su propio objetivo y su propio
presupuesto de error.**

## Cómo se mide hoy

- **Datos:** los tramos de servidor del servicio `flowsync-api` (`APP_NAME`),
  que el backend envía por OTLP sobre HTTP al recolector `observability` de
  `compose.yaml`.
- **Limitación:** el recolector solo tiene el exportador `debug`, que escribe
  los tramos en su log y no los guarda. Para calcular la fracción sobre 28 días
  y evaluar la alerta hace falta enviarlos a un sistema que los almacene o que
  derive métricas de ellos. Eso queda fuera de este documento.
