# SLO de la API de tareas (`/api/v1/tasks`)

Objetivo de nivel de servicio de las rutas de tareas de FlowSync. Cubre **solo** lo que cuelga de
`/api/v1/tasks` (las diez rutas registradas en `backend/start/routes.ts`: listado, alta, detalle,
borrado, papelera y restauración, cambio de estado, fecha de vencimiento y comentarios). La
medida sale de las trazas que el backend emite con `@adonisjs/otel`: el span raíz de cada
petición (`Kind: Server`) trae la ruta en `http.route`, el código en `http.status_code` y la
latencia como `End time − Start time`.

## 1. SLI

Fracción de peticiones conformes:

```
        peticiones a /api/v1/tasks con HTTP status < 500 y latencia < 500 ms
SLI = ─────────────────────────────────────────────────────────────────────────
                 total de peticiones válidas a /api/v1/tasks
```

- **Numerador:** peticiones a cualquier ruta bajo `/api/v1/tasks` cuya respuesta tenga un
  código HTTP menor que 500 **y** cuya latencia, medida en el span raíz, sea menor que 500 ms.
- **Denominador:** todas las peticiones válidas a `/api/v1/tasks`. Un 4xx (sin token, tarea
  que no existe, cuerpo mal formado) es una petición válida que el servicio atendió bien: cuenta
  en el denominador y, si bajó de 500 ms, también en el numerador.

## 2. SLO

**El 99 % o más** de las peticiones a `/api/v1/tasks` cumplen el SLI.

Ventana: **rolling window de 28 días**. Se mira siempre el tramo de los últimos 28 días, no el
mes natural, para que el objetivo no se «reinicie» el día 1.

## 3. Presupuesto de error

Con un volumen hipotético de **20.000 peticiones** en la ventana:

```
20000 × (1 − 0,99) = 200
```

Es decir, **200 peticiones** pueden fallar (status >= 500) o tardar 500 ms o más sin incumplir el
SLO. Cada petición mala consume una unidad del presupuesto, sea por error o por latencia.

> Las 20.000 peticiones son un volumen de trabajo para hacer las cuentas. En cuanto haya tráfico
> real de producción, el presupuesto se recalcula con ese volumen: el 1 % se mantiene, el número
> absoluto cambia.

## 4. Alerta: burn rate

Una sola alerta, por síntoma de usuario. Nada de CPU, memoria ni pods: lo que importa es si la
gente está recibiendo errores o esperas.

- **Qué mide:** el *burn rate*, el ritmo al que se gasta el presupuesto de error respecto al
  ritmo «justo» que lo agotaría exactamente al final de la ventana. Con un burn rate de 1 el
  presupuesto se acaba a los 28 días; con 2, a los 14; con 14, en dos días.
- **Cuándo salta:** cuando el ritmo actual de peticiones malas (status >= 500 o latencia
  >= 500 ms) **agotaría las 200 peticiones del presupuesto antes de que termine la ventana de
  28 días**, es decir, cuando el burn rate supera 1 de forma sostenida.
- **Qué significa:** que si no cambia nada el SLO se incumplirá. No dice qué falla; dice que
  alguien tiene que mirar.

## 5. Frontera: lo que este SLO no cubre

Estas rutas existen en `backend/start/routes.ts` y quedan **fuera** de este SLO. Cada una
tiene un perfil de uso distinto y necesitaría su propio SLI:

- `/api/v1/auth/signup` (alta de cuenta; en este repo es `signup`, no `register`)
- `/api/v1/auth/login`
- `/api/v1/account/*` (`profile`, `logout`)
- `/health` (la llama la plataforma de despliegue, no quien usa la API)
- la documentación OpenAPI: `/api`, `/api.json` y `/api.yaml`

También queda fuera la ruta raíz `/`, que solo devuelve un saludo.
