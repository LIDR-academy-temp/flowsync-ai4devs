# SLO de la API de tareas (`/api/v1/tasks`)

| Campo | Valor |
|---|---|
| Servicio | `flowsync-api` (backend AdonisJS) |
| Alcance | Solo las rutas bajo `/api/v1/tasks` |
| SLI | Peticiones buenas / peticiones totales (disponibilidad y latencia combinadas) |
| Objetivo | ≥ 99 % |
| Ventana | Móvil de 28 días |
| Presupuesto de error | 1 % de las peticiones de la ventana (200 peticiones con el volumen hipotético de 20.000) |

Este documento solo define el SLO. No hay todavía ningún panel, consulta ni alerta real que lo calcule.

## Alcance: qué rutas cuentan

Cuentan todas las rutas declaradas en `backend/start/routes.ts` dentro del grupo con prefijo `tasks` y bajo `/api/v1`:

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

Si en el futuro se añade una ruta bajo `/api/v1/tasks`, entra en este SLO sin más trámite. La tabla es una foto del momento, y la regla es el prefijo.

## 1. Indicador de nivel de servicio (SLI)

Una petición es **buena** cuando cumple a la vez dos condiciones:

- **Disponibilidad:** responde con un código HTTP **inferior a 500**.
- **Rendimiento:** su duración es **inferior a 500 milisegundos**.

Sea *R* el conjunto de peticiones a rutas de `/api/v1/tasks` dentro del período evaluado. Para cada petición *r* se toma su código de respuesta, *status(r)*, y su duración, *duración(r)*:

```
                 | { r ∈ R : status(r) < 500  ∧  duración(r) < 500 ms } |
SLI(período)  =  ─────────────────────────────────────────────────────────
                                         | R |
```

- **Numerador:** número de peticiones a `/api/v1/tasks` que responden con un código menor que 500 **y** tardan menos de 500 ms.
- **Denominador:** número total de peticiones a esas mismas rutas en el mismo período.

Precisiones:

- Las dos condiciones son estrictas: un 500 es malo, y una petición de exactamente 500 ms también es mala.
- Las respuestas 4xx (401 sin token, 404 de una tarea inexistente, 422 de validación) son **buenas** si llegan a tiempo. Son errores de quien llama, no del servicio. Una 4xx que tarda 500 ms o más es **mala** por rendimiento.
- Una petición rápida que acaba en 5xx es mala. Una petición lenta que acaba en 2xx también es mala. Basta con que falle una condición.
- La duración es la que mide el propio servidor, desde que recibe la petición hasta que responde. Con la instrumentación de OpenTelemetry ya instalada, es la duración del span HTTP de servidor de cada petición. No incluye la red entre el usuario y el servidor.
- Si en un período no hay ninguna petición (|R| = 0), el SLI no está definido para ese período y no consume presupuesto.

## 2. Objetivo (SLO)

```
SLI(últimos 28 días)  ≥  99 %
```

- El objetivo cubre la disponibilidad y el rendimiento a la vez, con el SLI anterior. No hay objetivos separados para cada uno.
- La **ventana es móvil de 28 días**: en cada momento se evalúan las peticiones de los 28 días anteriores. No se reinicia a principio de mes. Los fallos de hace 29 días ya no cuentan, y los de hoy cuentan durante los próximos 28 días.

## 3. Presupuesto de error

El presupuesto de error es la fracción de peticiones que pueden ser malas sin incumplir el objetivo:

```
presupuesto (fracción)   = 1 − objetivo = 1 − 0,99 = 0,01  (1 %)
presupuesto (peticiones) = volumen de la ventana × 0,01
```

**Ejemplo con un volumen hipotético de 20.000 peticiones en la ventana de 28 días:**

```
presupuesto = 20.000 × (1 − 0,99) = 20.000 × 0,01 = 200 peticiones
```

En 28 días se admiten como máximo **200 peticiones malas** (5xx, o 500 ms o más, o ambas cosas). Con 200 el SLI es exactamente del 99 % (19.800 / 20.000) y el objetivo se cumple. Con 201 malas baja al 98,995 % y se incumple.

> **Las 20.000 peticiones son un volumen hipotético** que solo sirve para ilustrar el cálculo. En una implementación real el presupuesto se calcula con el **volumen efectivo** de peticiones a `/api/v1/tasks` durante la ventana móvil, y cambia con el tráfico: si en los últimos 28 días hubo 35.000 peticiones, el presupuesto es de 350. Si hubo 8.000, es de 80. El 1 % es fijo, el número de peticiones no.

## 4. Alerta

Hay **una única alerta**, orientada al usuario: salta porque el servicio está fallando a quien usa las tareas, no por una causa interna.

**Tasa de consumo del presupuesto (burn rate)** en un intervalo:

```
tasa de consumo  =  fracción de peticiones malas en el intervalo  /  0,01
                 =  (1 − SLI(intervalo)) / (1 − 0,99)
```

- **Tasa = 1:** el presupuesto se gasta justo al ritmo que permite la ventana. Si se mantiene, se agota exactamente al cabo de 28 días.
- **Tasa > 1:** si el ritmo se mantiene, el presupuesto **se agota antes de terminar la ventana de 28 días**. Con tasa 2 se agota en 14 días, y con tasa 4 en 7.

**Alerta «Presupuesto de error de `/api/v1/tasks` en riesgo de agotarse»**

- **Condición:** la tasa de consumo es mayor que 1 calculada sobre las **últimas 6 horas** y también sobre los **últimos 30 minutos**.
  - La de 6 horas confirma que el ritmo es sostenido y no un pico aislado.
  - La de 30 minutos confirma que el problema sigue vivo, para que la alerta no se quede disparada cuando ya se ha resuelto.
- **Significado:** al ritmo actual, el presupuesto de 28 días se agotará antes de que termine la ventana, y el SLO se incumplirá.
- **A quién avisa:** al equipo que mantiene la API de tareas.
- **Qué hacer:** ver qué rutas de `/api/v1/tasks` concentran las peticiones malas, si son 5xx o lentas, y desde cuándo, con las trazas de esas peticiones.

**Fuera de alcance:** no se definen alertas sobre causas internas (CPU, memoria, conexiones a la base, consultas lentas, colas). Esas señales sirven para diagnosticar *por qué* salta la alerta, no para decidir *si* hay que despertar a alguien. Si una consulta lenta no llega a afectar al SLI, no es un problema para el usuario.

**Limitación con poco tráfico:** con el volumen hipotético (unas 30 peticiones por hora), la ventana de 6 horas tiene unas 180 peticiones. Dos peticiones malas en ese intervalo ya superan el 1 %. Al implementar la alerta habrá que comprobar con el tráfico real si dispara demasiado. Si es así, se exige un número mínimo de peticiones en el intervalo antes de evaluarla, sin cambiar el objetivo ni la ventana.

## 5. Exclusiones

**Todas las rutas que no pertenecen a `/api/v1/tasks` quedan fuera de este SLO.** No suman en el numerador ni en el denominador, y no consumen su presupuesto de error. Por ejemplo:

- **Registro:** `POST /api/v1/auth/signup`.
- **Inicio de sesión:** `POST /api/v1/auth/login`.
- Perfil y cierre de sesión: `GET /api/v1/account/profile` y `POST /api/v1/account/logout`.
- Cualquier otra ruta fuera del prefijo `/api/v1/tasks`, incluidas las peticiones a rutas inexistentes.

Que una ruta esté excluida no significa que no importe. Significa que este SLO no la mide. Si hace falta medir el registro, el inicio de sesión o cualquier otra ruta, necesitará **su propio SLI, su propio SLO y su propio presupuesto de error**, porque su tráfico, su latencia razonable y su impacto en el usuario son distintos. Mezclarlas aquí diluiría la señal: un fallo masivo de login podría quedar escondido entre el volumen de tareas, o al revés.
