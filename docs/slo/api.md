# SLO de la API de tareas

Objetivo de nivel de servicio de la API de FlowSync, medido con la telemetría
de OpenTelemetry del backend (ver `observability/otel-collector.yaml`).

> **Estado: propuesta.** Dos valores no salen de ninguna medición y hay que
> confirmarlos: el umbral de duración (500 ms) y el volumen de 20.000 peticiones.
> Hoy el colector solo imprime con el exportador `debug`: no hay almacén de
> métricas ni sistema de alertas donde evaluar este SLO. Las consultas y la
> alerta de abajo son la definición; falta el destino donde ejecutarlas.

## Alcance

Entra en el SLO todo lo que cuelga de `/api/v1/tasks`:

- `GET/POST /api/v1/tasks`
- `GET /api/v1/tasks/trash`
- `GET/DELETE /api/v1/tasks/:id`
- `POST /api/v1/tasks/:id/restore`
- `PATCH /api/v1/tasks/:id/status`
- `PUT /api/v1/tasks/:id/due-date`
- `GET/POST /api/v1/tasks/:id/comments`

### Exclusiones

Quedan fuera, y no cuentan ni como buenas ni como malas, las rutas que no son
de `/api/v1/tasks`:

| Ruta | Motivo |
|---|---|
| `POST /api/v1/auth/signup` | Registro: lleva hash de contraseña y su coste y su perfil de fallos son distintos. |
| `POST /api/v1/auth/login` | Login: igual que el registro, y los 401 son parte normal de su uso. |
| `GET /api/v1/account/profile`, `POST /api/v1/account/logout` | Cuenta, no tareas. |
| Health check y rutas sin coincidencia (404 sin `http.route`) | No son uso de la API por parte de una persona. |

Si alguna de estas rutas necesita su propio objetivo, tendrá su propio SLO. No
se mezcla con este.

## SLI

Fracción de peticiones buenas sobre peticiones válidas, en ventana móvil de 28
días.

```
SLI = peticiones buenas / peticiones válidas
```

- **Petición válida:** `http.route` empieza por `/api/v1/tasks`.
- **Petición buena:** cumple las dos condiciones a la vez:
  - **Código:** `http.response.status_code` < 500. Los 4xx (401, 404, 422) son
    errores del cliente: la API respondió bien, así que cuentan como buenas.
  - **Duración:** `http.server.request.duration` ≤ **500 ms** (umbral
    propuesto, por confirmar).
- **Petición mala:** cualquier válida que no sea buena (5xx, o más lenta que el
  umbral).

Consulta de referencia (PromQL, con los nombres que da el exportador de
Prometheus a las métricas de OTel):

```promql
sum(rate(http_server_request_duration_seconds_bucket{
      http_route=~"/api/v1/tasks.*",
      http_response_status_code!~"5..",
      le="0.5"}[28d]))
/
sum(rate(http_server_request_duration_seconds_count{
      http_route=~"/api/v1/tasks.*"}[28d]))
```

## Objetivo

**SLI ≥ 99 % en 28 días.**

## Presupuesto de error

Presupuesto = 1 − 0,99 = **1 %** de las peticiones válidas.

| Peticiones válidas en 28 días | Peticiones malas permitidas |
|---|---|
| 20.000 | **200** |

> **Estimado.** Las 20.000 peticiones son una hipótesis de volumen, no un dato
> medido (el backend aún no exporta métricas a ningún sitio). Si el tráfico real
> es otro, el presupuesto cambia en proporción: 1 % de lo que sea. Rehacer la
> cuenta con el recuento real antes de tomarse el número al pie de la letra.

Con ese volumen son unas 714 peticiones al día, unas 30 a la hora: poco tráfico,
así que cada petición mala pesa mucho.

## Alerta

Una sola alerta, por **consumo anticipado del presupuesto** (burn rate): avisa
cuando el presupuesto se gasta más deprisa de lo que permite llegar a 28 días.

| Campo | Valor |
|---|---|
| Nombre | `TasksApiErrorBudgetBurn` |
| Condición | Tasa de peticiones malas ≥ **14,4 × 1 %** (= 14,4 %) en la ventana de **1 h**, y también en la de **5 min** |
| Qué significa | A ese ritmo se consume el 2 % del presupuesto de 28 días en una hora y se agota en 2 días |
| Mínimo de tráfico | Al menos 10 peticiones válidas en la ventana de 1 h, para que 2 fallos sueltos no disparen la alerta |
| Severidad | Aviso a quien esté de guardia |

La ventana corta de 5 min evita que la alerta siga activa cuando el problema ya
se ha corregido. Son dos ventanas de **la misma** alerta, no dos alertas.

```promql
(
  1 - (
    sum(rate(http_server_request_duration_seconds_bucket{http_route=~"/api/v1/tasks.*",http_response_status_code!~"5..",le="0.5"}[1h]))
    / sum(rate(http_server_request_duration_seconds_count{http_route=~"/api/v1/tasks.*"}[1h]))
  ) > 14.4 * 0.01
)
and
(
  1 - (
    sum(rate(http_server_request_duration_seconds_bucket{http_route=~"/api/v1/tasks.*",http_response_status_code!~"5..",le="0.5"}[5m]))
    / sum(rate(http_server_request_duration_seconds_count{http_route=~"/api/v1/tasks.*"}[5m]))
  ) > 14.4 * 0.01
)
and
sum(increase(http_server_request_duration_seconds_count{http_route=~"/api/v1/tasks.*"}[1h])) >= 10
```

Con 30 peticiones a la hora, el 14,4 % son unas 4 peticiones malas en una hora.
Es sensible a propósito: con tan poco tráfico un incidente real se ve en pocas
peticiones. Si da falsos avisos, el ajuste es subir el mínimo de tráfico, no
añadir más alertas.

## Pendiente

- Confirmar el umbral de 500 ms con datos reales de latencia.
- Medir el volumen real de `/api/v1/tasks` y rehacer el presupuesto.
- Enviar las métricas a un almacén (hoy el colector solo usa el exportador
  `debug`) y cargar la consulta y la alerta ahí.
