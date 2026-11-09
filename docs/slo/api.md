# SLO de la API: tareas (`/api/v1/tasks`)

**Qué cubre:** todas las rutas de `/api/v1/tasks`, es decir, la propia ruta y las que cuelgan de ella (`/api/v1/tasks/:id`, `/api/v1/tasks/trash`, `/api/v1/tasks/:id/status`, `/api/v1/tasks/:id/comments`...), con cualquier método.

## Indicador (SLI)

Se cuenta sobre los tramos de servidor (`span.kind = server`, uno por petición) cuyo `http.route` es `/api/v1/tasks` o empieza por `/api/v1/tasks/`.

```
        tramos con http.response.status_code < 500  Y  duración < 500 ms
SLI  =  ─────────────────────────────────────────────────────────────────
                              todos esos tramos
```

Un 4xx cuenta como bueno: la API respondió bien a una petición incorrecta. Un 5xx o una respuesta de 500 ms o más cuenta como malo.

## Objetivo (SLO)

**SLI ≥ 99 %** en una **ventana móvil de 28 días**.

## Presupuesto de error

1 % de las peticiones de la ventana. **Supuesto:** 20.000 peticiones en 28 días, lo que da un presupuesto de **200 peticiones malas** (5xx o ≥ 500 ms). Este volumen es provisional: se sustituye por el volumen real medido y el presupuesto se recalcula con él.

## Alerta (una sola)

**Síntoma:** «Quien usa FlowSync está viendo tantas operaciones de tareas fallidas o lentas que, a este ritmo, el presupuesto del mes se acaba antes de que cierre la ventana».

Se calcula con los mismos tramos que el SLI:

- **ritmo de gasto** = (tramos malos ÷ todos los tramos, en un periodo reciente) ÷ 1 %
- **se avisa** si `presupuesto que queda ÷ peticiones malas por hora al ritmo actual` es menor que `horas que faltan para cerrar la ventana`.

Con un ritmo de 1, el presupuesto se acaba justo al cerrar los 28 días. Por encima de 1, se acaba antes.

## Qué NO cubre

Ninguna ruta fuera de `/api/v1/tasks`: ni el registro (`POST /api/v1/auth/signup`), ni el inicio de sesión (`POST /api/v1/auth/login`), ni `/api/v1/account/*`, `/health` o `/`. Si alguna importa, merece su propio objetivo con su propio presupuesto.
