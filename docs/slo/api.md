# SLO de la API de tareas

Objetivo de nivel de servicio de la API de FlowSync para las rutas de tareas. Se mide con las trazas que el backend manda al collector `observability` (`backend/config/otel.ts`, `observability/otel-collector.yaml`): cada petición deja un tramo raíz de tipo servidor con la ruta (`http.route`), el código de respuesta (`http.response.status_code`) y sus horas de inicio y fin.

## Alcance

**Dentro:** todas las rutas del grupo `/api/v1/tasks` de `backend/start/routes.ts`, con cualquier método.

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

**Fuera:**

- Todo lo que no cuelgue de `/api/v1/tasks`: `/api/v1/account/*`, la documentación de la API, `/` y cualquier petición que no case con ninguna ruta (no tiene `http.route`).
- **El registro (`POST /api/v1/auth/signup`) y el inicio de sesión (`POST /api/v1/auth/login`).** Su duración la marca el hash de la contraseña, que es lento a propósito (en las primeras medidas, entre 445 y 710 ms frente a menos de 300 ms en tareas), y mezclarlos aquí obligaría a aflojar el umbral para todos. Si hace falta medirlos, llevan **su propio objetivo y su propio presupuesto**, en un documento aparte.

## 1. Indicador

Fracción de peticiones buenas sobre peticiones válidas en la ventana:

```
            peticiones buenas
SLI = ─────────────────────────────
           peticiones válidas
```

- **Denominador (válidas):** tramos raíz de servidor cuya `http.route` empieza por `/api/v1/tasks`.
- **Numerador (buenas):** de esas, las que cumplen **las dos** condiciones:
  - `http.response.status_code` < 500, y
  - duración (hora de fin − hora de inicio) **≤ 500 ms**.

Una petición es mala si responde con 5xx, si tarda más de 500 ms o si se corta sin llegar a responder (tramo con estado de error y sin código).

Los 4xx cuentan como buenos. Una tarea que no existe (404), un token caducado (401) o un formulario inválido (422) son respuestas correctas del servicio a una petición equivocada, no un fallo que el usuario sufra por culpa de la API.

**Umbral de 500 ms: decisión pendiente de revisar.** No venía dado. Sale de las primeras medidas (37 peticiones de tareas en desarrollo, media de 80 ms y máximo de 284 ms) con margen. Cuando haya tráfico real, se ajusta al percentil que vean los usuarios.

## 2. Objetivo

**El 99 % de las peticiones válidas son buenas, en una ventana móvil de 28 días.**

La ventana es móvil: en cada momento se miran los últimos 28 días, no el mes natural. Así el presupuesto no se reinicia de golpe el día 1, y 28 días contienen siempre cuatro semanas completas, con el mismo número de lunes y de fines de semana.

## 3. Presupuesto de error

El presupuesto es el 1 % que el objetivo deja fallar:

```
presupuesto = (1 − 0,99) × peticiones válidas en 28 días
            = 0,01 × 20.000
            = 200 peticiones malas en 28 días
```

> **El volumen de 20.000 peticiones es un supuesto.** Se sustituirá por el volumen real de peticiones válidas de los últimos 28 días en cuanto haya trazas de producción. El presupuesto en peticiones cambia con él; el objetivo del 99 % no.

Con ese volumen, el presupuesto da unas 7 peticiones malas al día, o una cada 3,4 horas de media.

## 4. Alerta

Una sola alerta, sobre lo que percibe el usuario (peticiones de tareas que fallan o tardan demasiado), no sobre causas internas como CPU, memoria o conexiones a la base. Las causas se buscan en las trazas después de que salte la alerta.

**Ritmo de consumo** del presupuesto en un intervalo:

```
          fracción de peticiones malas en el intervalo
ritmo = ───────────────────────────────────────────────
                       1 − 0,99
```

Con un ritmo de 1, el presupuesto se agota justo al terminar los 28 días. Con un ritmo R > 1 se agota en 28 / R días, **antes de que termine la ventana**. Por ejemplo, con un ritmo de 2 se agota en 14 días y con uno de 14 en dos días.

**Condición de la alerta:**

```
ritmo en las últimas 24 h > 1   Y   ritmo en la última hora > 1
```

- **La ventana de 24 horas** dice que el consumo sostenido agotaría el presupuesto antes de que acabe la ventana de 28 días. Con el volumen supuesto, eso son más de unas 7 peticiones malas en las últimas 24 horas (≈ 714 válidas). Una ventana más corta sería ruido: con unas 30 peticiones por hora, una sola petición mala en una hora ya da un ritmo de más de 3.
- **La ventana de 1 hora** hace que la alerta se apague sola cuando el problema ha parado, sin esperar a que el día malo salga de la ventana de 24 horas.

Cuando salta, el aviso lleva el ritmo actual y los días que quedan hasta agotar el presupuesto a ese ritmo (28 / R).

## Supuestos de medida

- El muestreo de trazas está al 100 %, el valor por defecto de `@adonisjs/otel`. Si se baja `samplingRatio`, el indicador se calcula sobre la muestra y el volumen del presupuesto hay que reescalarlo.
- La instrumentación HTTP ignora las peticiones `OPTIONS` (preflight de CORS), así que no entran en el denominador.
- Hoy el collector solo imprime las trazas con el exportador `debug`: no hay todavía dónde guardarlas, calcular el indicador ni evaluar la alerta. Este documento define qué se mide; montar ese cálculo es un paso aparte.
