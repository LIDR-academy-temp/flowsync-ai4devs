# SLO de la API: tareas

Objetivo de servicio de la API de FlowSync para el uso del producto: ver la lista
de tareas, crearlas, moverlas de estado y comentarlas. Se mide sobre lo que
recibe la persona que usa la aplicación, no sobre el estado interno del backend.

## 1. Indicador (SLI)

```
                 peticiones buenas a /api/v1/tasks
SLI  =  ───────────────────────────────────────────────
             peticiones válidas a /api/v1/tasks
```

Cada petición se clasifica con tres datos del span `Server` que deja
`@adonisjs/otel` (ver `backend/config/otel.ts` y `observability/otel-collector.yaml`):

| Dato | Atributo del span |
|---|---|
| Ruta | `http.route` (la plantilla, p. ej. `/api/v1/tasks/:id/status`, no la URL con el id) |
| Código de respuesta | `http.response.status_code` |
| Duración | fin − inicio del span `Server` |

**Denominador: peticiones válidas.** Todas las peticiones cuyo `http.route`
empieza por `/api/v1/tasks`. A día de hoy son estas (`backend/start/routes.ts`):

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

Una ruta nueva bajo `/api/v1/tasks` entra en el objetivo sin tocar este documento.
Una petición que no casa con ninguna ruta no lleva `http.route`, así que no
cuenta.

**Numerador: peticiones buenas.** Las válidas que cumplen **las dos** condiciones:

- **Código distinto de 5xx.** Un 4xx (401 sin token, 404 de una tarea que no
  existe, 422 de validación) es una respuesta correcta del servicio a una
  petición incorrecta, y cuenta como buena.
- **Duración ≤ 500 ms.** Una respuesta correcta que tarda más de eso cuenta como
  mala: desde fuera, una lista que no carga y una lista que da error son el
  mismo problema. El umbral es una propuesta: en desarrollo las peticiones a
  `/api/v1/tasks` tardaron entre 6 y 43 ms (trazas del 2026-11-04), y 500 ms
  deja margen para producción. Hay que revisarlo cuando haya datos reales.

## 2. Objetivo (SLO)

**El 99 % de las peticiones válidas son buenas, en una ventana móvil de 28 días.**

La ventana es móvil: cada día se mira hacia atrás 28 días, no por meses
naturales. 28 días son cuatro semanas completas, así que cada ventana contiene
el mismo número de lunes y de fines de semana.

## 3. Presupuesto de error

```
presupuesto  =  (1 − 0,99) × peticiones válidas en 28 días
             =  0,01 × 20.000
             =  200 peticiones malas en 28 días
```

> **El volumen de 20.000 peticiones es un supuesto, no una medida.** Se
> sustituirá por el número real de peticiones válidas de los últimos 28 días en
> cuanto se pueda contar, y el presupuesto se recalculará con él. Todas las
> cifras en peticiones de este documento derivan de ese supuesto y cambian con él.

Con el volumen supuesto, el presupuesto da para unas 7 peticiones malas al día
(200 / 28 ≈ 7,1).

## 4. Alerta

Hay **una sola alerta**, y salta por un síntoma que la persona usuaria nota:
peticiones a sus tareas que fallan o tardan demasiado. No hay alertas por causa
interna (CPU, memoria, conexiones a la base, reinicios). Si una causa interna no
llega a la persona usuaria, no consume presupuesto y no despierta a nadie. Si
llega, la detecta esta alerta.

**Nombre:** `api-tasks-presupuesto-se-agota`

**Condición.** Salta cuando se cumplen las dos cosas a la vez:

1. **El ritmo de consumo de las últimas 24 horas agotaría el presupuesto antes
   de que termine la ventana:**

   ```
   peticiones malas en las últimas 24 h  >  presupuesto / 28
   ```

   Gastar más de 1/28 del presupuesto en un día equivale a un ritmo de consumo
   (*burn rate*) mayor que 1. Si ese ritmo se mantiene, los 28 días de
   presupuesto se gastan en menos de 28 días, así que el SLO se incumple antes
   de que se cierre la ventana. Con el volumen supuesto, salta con **8 o más
   peticiones malas en 24 h**.

2. **Sigue pasando:** al menos una petición mala en la última hora. Así la
   alerta se apaga sola en cuanto el problema para, sin esperar a que las 24 h
   se vacíen.

El umbral va en fracción del presupuesto, no en un número fijo de peticiones,
para que siga valiendo cuando el volumen real sustituya al supuesto.

**Qué dice el aviso:** cuántas peticiones malas ha habido en 24 h, qué parte del
presupuesto de 28 días queda y qué rutas (`http.route`) acumulan las malas.

## 5. Fuera del objetivo

Quedan fuera **todas las rutas que no pertenecen a `/api/v1/tasks`**. Sus
peticiones no entran ni en el numerador ni en el denominador, y no consumen
presupuesto. Hoy son:

| Método | Ruta | Qué es |
|---|---|---|
| POST | `/api/v1/auth/signup` | registro |
| POST | `/api/v1/auth/login` | inicio de sesión |
| GET | `/api/v1/account/profile` | perfil de la sesión |
| POST | `/api/v1/account/logout` | cierre de sesión |
| GET | `/health` | comprobación de salud |
| GET | `/` | raíz |
| — | rutas de la documentación OpenAPI (`openapi.registerRoutes()`) | documentación |

Que estén fuera no significa que no importen: no tienen objetivo propio en este
documento.

## 6. Lo que falta para poder medirlo

Hoy el SLI **no se puede calcular de forma continua**. El collector local
(`observability` en `compose.yaml`) solo tiene el exportador `debug`, que escribe
las trazas en su log y no las guarda. Para medir el SLO y evaluar la alerta hace
falta un sistema que almacene las trazas o las métricas derivadas de ellas y
permita contar por `http.route`, código y duración en ventanas de 1 h, 24 h y
28 días. Esa pieza está fuera de este documento.
