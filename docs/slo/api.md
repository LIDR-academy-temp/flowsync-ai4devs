# SLO de la API: rutas de tareas

Objetivo de nivel de servicio (Service Level Objective, SLO) de la API de FlowSync. Cubre **solo** las rutas que cuelgan de `/api/v1/tasks`; el resto de la API (`auth`, `account`) queda fuera de este documento.

## Alcance

Las rutas del grupo `tasks` de `backend/start/routes.ts`, todas con autenticación:

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

Una ruta nueva bajo `/api/v1/tasks` entra en el SLO sin cambiar este documento.

## Indicador (Service Level Indicator, SLI)

Fracción de peticiones a esas rutas que **responden con un código inferior a 500 y tardan menos de 500 milisegundos**.

```
SLI = peticiones buenas / peticiones totales
```

Una petición es **buena** si cumple las dos condiciones a la vez:

1. código de respuesta `< 500`, y
2. duración `< 500 ms`.

Consecuencias que conviene tener claras:

- Un `4xx` (validación, `401` sin token, `404` de una tarea que no existe) **cuenta como buena** si llega a tiempo: es un error de quien llama, no del servicio.
- Un `2xx` que tarda 500 ms o más **cuenta como mala**: una respuesta correcta pero lenta también incumple.
- Un `5xx` es mala aunque sea rápida.

### Cómo se mide

La duración es la del lado del servidor, la del span HTTP de entrada que genera `@adonisjs/otel` (`backend/config/otel.ts`), no la que ve el navegador. De cada span se usan estos atributos:

| Dato | Atributo del span |
|---|---|
| Ruta | `http.route` empieza por `/api/v1/tasks` |
| Código | `http.response.status_code` |
| Duración | fin − inicio del span |

Hoy el collector (`observability/otel-collector.yaml`) solo tiene el exportador `debug`: las trazas llegan, pero no se guardan en ningún sitio donde se pueda calcular el SLI. Para medirlo de verdad hace falta un backend de trazas o métricas detrás del collector.

## Objetivo (SLO)

**Al menos el 99 % de las peticiones a las rutas de tareas deben cumplir el indicador, durante una ventana móvil de 28 días.**

La ventana es **móvil**: en cada momento se miran los últimos 28 días, no un mes de calendario que se reinicia. Así una mala racha no desaparece el día 1 del mes siguiente.

## Presupuesto de error

El presupuesto de error es la fracción de peticiones que pueden incumplir el indicador sin romper el objetivo:

```
presupuesto = (1 − 0,99) × peticiones en la ventana
```

Suponiendo **20.000 peticiones** en los 28 días:

```
presupuesto = 0,01 × 20.000 = 200 peticiones
```

| Dato | Valor |
|---|---|
| Peticiones en la ventana (supuesto) | 20.000 |
| Objetivo | 99 % |
| Peticiones buenas necesarias | ≥ 19.800 |
| **Presupuesto de error** | **200 peticiones malas** |
| Media diaria (200 / 28) | ≈ 7 peticiones malas al día |

Es decir, en 28 días pueden incumplir el indicador como mucho **200 peticiones**, sumando las que dan `5xx` y las que tardan 500 ms o más. La petición mala número 201 dentro de la ventana rompe el SLO.

El presupuesto es proporcional al tráfico: con más o menos peticiones, sigue siendo el 1 % de las que haya en la ventana, no 200 fijas.
