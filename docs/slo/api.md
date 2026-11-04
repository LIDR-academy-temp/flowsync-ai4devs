# SLO de la API: rutas de tareas

Objetivo de nivel de servicio de las rutas bajo `/api/v1/tasks`. **Hoy nada lo calcula y la alerta no existe**: es lo que se quiere medir, no lo que se mide (ver [Qué se puede medir hoy](#qué-se-puede-medir-hoy)).

## Resumen

| | |
|---|---|
| Alcance | las 10 rutas bajo `/api/v1/tasks` |
| Indicador | peticiones con código inferior a 500 y duración inferior a 500 ms |
| Objetivo | al menos el 99 % durante una ventana móvil de 28 días |
| Volumen | 20.000 peticiones en la ventana: **una suposición** |
| Presupuesto de error | 200 peticiones malas en 28 días, con ese volumen |
| Alerta | ritmo de consumo superior a 1 sobre las últimas 72 horas |

## Alcance

Las rutas tal como están en [`backend/start/routes.ts`](../../backend/start/routes.ts), con el prefijo del grupo ya aplicado:

| Método | Ruta | Controlador | Línea |
|---|---|---|---|
| GET | `/api/v1/tasks` | `Tasks.index` | 58 |
| POST | `/api/v1/tasks` | `Tasks.store` | 59 |
| GET | `/api/v1/tasks/trash` | `TaskTrash.index` | 61 |
| GET | `/api/v1/tasks/:id` | `Tasks.show` | 62 |
| DELETE | `/api/v1/tasks/:id` | `Tasks.destroy` | 63 |
| POST | `/api/v1/tasks/:id/restore` | `TaskTrash.restore` | 64 |
| PATCH | `/api/v1/tasks/:id/status` | `TaskStatuses.update` | 65 |
| PUT | `/api/v1/tasks/:id/due-date` | `TaskDueDates.update` | 66 |
| GET | `/api/v1/tasks/:id/comments` | `TaskComments.index` | 67 |
| POST | `/api/v1/tasks/:id/comments` | `TaskComments.store` | 68 |

Si se añade una ruta bajo `/api/v1/tasks`, entra en el alcance y esta tabla se actualiza.

### Rutas que quedan fuera

Todas las que no pertenecen a `/api/v1/tasks`:

- Registro e inicio de sesión: `POST /api/v1/auth/signup` y `POST /api/v1/auth/login`.
- Cuenta: `GET /api/v1/account/profile` y `POST /api/v1/account/logout`.
- Las que no son de la API versionada: `/`, `/health`, `/api`, `/api.json` y `/api.yaml`.

No consumen este presupuesto ni hacen saltar esta alerta, aunque estén caídas. En particular, si falla el inicio de sesión, quien no tenga ya un token no llega a estas rutas: ese problema no se ve aquí. Si hay que medirlas, tendrán su propio objetivo y su propio presupuesto.

## Indicador (SLI)

Para cada petición se usan tres datos: su **ruta**, su **código de respuesta** y su **duración**.

```text
                 peticiones de D con código < 500 y duración < 500 ms
SLI  =  ───────────────────────────────────────────────────────────────
         D = peticiones cuya ruta es una de las de la tabla de alcance
```

Es una fracción sobre las peticiones de los últimos 28 días. Una petición es **buena** si cumple las dos condiciones a la vez y **mala** en cualquier otro caso.

### Lo que el indicador deja implícito

| Caso | Decisión | Por qué |
|---|---|---|
| 4xx rápido | **cuenta como bueno** | la API respondió bien a una petición incorrecta: un token caducado (401) o un dato inválido (422) no es un fallo del servicio |
| 4xx de 500 ms o más | malo | quien lo recibe ha esperado igual |
| 2xx o 3xx de 500 ms o más | malo | responder bien pero tarde incumple el indicador |
| Código exactamente 500 | malo | la condición es «inferior a 500» |
| Duración exactamente 500 ms | malo | la condición es «menos de 500 ms» |
| `OPTIONS` | **fuera del numerador y del denominador** | son comprobaciones CORS que lanza el navegador, no peticiones de quien usa la API; no están en `routes.ts` y la instrumentación las ignora por defecto |
| `HEAD` | dentro | `router.get` registra también `HEAD`, así que entra en la misma ruta |
| Sin código de respuesta (conexión cortada) | malo | no cumple «responde con un código inferior a 500» |
| Ruta inexistente, como `/api/v1/tasks/1/otra` | fuera | no coincide con ninguna ruta de la tabla |
| `:id` inexistente, como `GET /api/v1/tasks/999` | dentro | coincide con una ruta; con un 404 rápido es buena |

Contar los 4xx como buenos tiene un coste: si un error de código devuelve 404 o 422 a peticiones válidas, este SLO no lo ve. Lo mismo con una conexión cortada por el cliente, que consume presupuesto sin ser culpa del servicio. Se acepta para mantener un indicador simple.

La duración se mide en el servidor: no incluye la red ni lo que tarde el navegador.

### Nombres de atributo

Son los que aparecen en trazas reales del recolector de desarrollo:

| Dato | Atributo |
|---|---|
| Ruta | `http.route` |
| Código de respuesta | `http.response.status_code` |
| Método | `http.method` |
| Duración | fin menos inicio del tramo con `Kind: Server` |

Falta mirar un 5xx causado por una excepción: el middleware de `@adonisjs/otel` escribe el código después de `next()`, y falta ver qué valor queda en ese caso.

## Objetivo (SLO)

**Al menos el 99 % de las peticiones del alcance cumplen el indicador durante una ventana móvil de 28 días.**

La ventana es móvil: cada momento se evalúa sobre los 28 días anteriores (672 horas), no sobre un mes natural.

## Presupuesto de error

```text
presupuesto = volumen × (1 − objetivo)
            = 20.000 × (1 − 0,99)
            = 20.000 × 0,01
            = 200 peticiones malas en 28 días
```

Es decir, 19.800 buenas como mínimo, y una media de 200 / 28 ≈ 7,1 malas al día.

> **Las 20.000 peticiones son una suposición, no una medida.** Se sustituirán por el volumen real de la ventana en cuanto exista. Lo que se mantiene es el 1 %: el presupuesto y el umbral de la alerta se recalculan con ese volumen, así que el 200 y el 22 de este documento cambiarán.

## Alerta

Hay una única alerta. Avisa de lo que percibe quien usa la API, peticiones de tareas que fallan o tardan, y no de una causa interna como la CPU o la base de datos.

**Salta cuando el ritmo de consumo del presupuesto es superior a 1 sobre las últimas 72 horas.**

Un ritmo de 1 agota el presupuesto justo en 28 días. Por encima de 1, a ese paso, se agota antes: se habrían consumido más de 200 peticiones malas en una ventana de 28 días.

### La cuenta, para 28 días

```text
ventana  = 28 días × 24 h = 672 h
periodo  = 72 h
parte de la ventana = 72 / 672 = 10,71 %

ritmo = (malas en 72 h / presupuesto) / (72 / 672)

ritmo > 1  ⇔  malas en 72 h > 200 × 72 / 672 = 21,43
           ⇔  22 o más peticiones malas en 72 horas
```

Con 30 días la parte sería 72 / 720 = 10 % y saldrían 20 peticiones, así que la cuenta no es intercambiable.

El tiempo que queda a un ritmo dado es 28 días / ritmo. Con el volumen supuesto, repartido por igual (20.000 / 672 ≈ 29,8 peticiones por hora):

| Situación | Ritmo | Tarda en saltar | El presupuesto se agotaría en |
|---|---|---|---|
| Todas las peticiones malas | 100 | unos 44 minutos (22 / 29,8 h) | 6,7 horas |
| 3 % de malas sostenido | 3 | unas 25 horas | 9,3 días |
| 1,5 % de malas sostenido | 1,5 | unas 49 horas | 18,7 días |
| 1 % o menos | hasta 1 | no salta | no se agota antes de 28 días |

### Por qué 72 horas

Con este volumen, las reglas habituales de periodo corto se quedan con muy pocas peticiones:

| Periodo | Ritmo (cuenta a 28 días) | Peticiones malas | Problema |
|---|---|---|---|
| 1 h | 2 % × 672 / 1 = 13,44 | 4 de unas 30 | cuatro peticiones hacen saltar el aviso |
| 6 h | 5 % × 672 / 6 = 5,6 | 10 de unas 179 | un 3 % sostenido nunca llega a 10 en 6 horas: agotaría el presupuesto en 9,3 días sin avisar |
| **72 h** | **10,71 % × 672 / 72 = 1** | **22 de unas 2.143** | **es el único de los tres que cubre cualquier ritmo sostenido superior a 1** |

El umbral compara las malas con el presupuesto, no con el tráfico del periodo. Así, una sola petición mala de madrugada, con poco tráfico, no hace saltar el aviso.

### Lo que esta alerta no hace bien

- **Tarda en apagarse.** Sigue activa hasta que las peticiones malas salen del periodo de 72 horas, aunque el problema ya esté resuelto.
- **Una ráfaga corta también la dispara.** 22 peticiones malas en un minuto hacen saltar el aviso, aunque el servicio se recupere enseguida.
- **Mira el ritmo, no lo gastado.** No tiene en cuenta el presupuesto que ya se consumió antes de esas 72 horas.
- **Depende del volumen.** Con tráfico real mucho mayor o menor hay que volver a hacer la cuenta.

### Qué dice el aviso

El texto describe el síntoma, y entre corchetes van los datos que se rellenan al saltar:

> **API de tareas: las peticiones están fallando o tardando demasiado.**
> En las últimas 72 horas, [N] peticiones a `/api/v1/tasks` han respondido con un error 5xx, no han llegado a responder o han tardado 500 ms o más. Quien usa la aplicación puede estar viendo errores o esperas al trabajar con sus tareas.
> A este ritmo ([R] veces el permitido), el presupuesto de error de 28 días se agota en [28 / R] días. El objetivo es que al menos el 99 % de las peticiones vaya bien.

## Qué se puede medir hoy

**Hoy nada calcula este SLO ni dispara la alerta.** Lo que existe:

- **El recolector solo escribe en sus registros.** El servicio `observability` de [`compose.yaml`](../../compose.yaml) usa un exportador `debug`. No guarda las trazas en ningún almacén que se pueda consultar, no calcula fracciones ni ventanas y no avisa a nadie.
- **Solo está en desarrollo.** Se levanta a mano con Docker Compose. [`.railway/railway.ts`](../../.railway/railway.ts) no define ni recolector ni destino de trazas, así que en producción no hay nada que recoja estos datos.
- **Ya se han visto trazas reales, pero solo en desarrollo.** Sirvieron para confirmar los nombres de atributo; nada las procesa todavía.
- **El volumen es una suposición.** No hay ninguna medida del tráfico real.
- **El registro del recolector no dura 28 días.** Se pierde al recrear el contenedor.

Para que este documento deje de ser solo una intención harían falta tres cosas: guardar las trazas o una métrica derivada durante al menos 28 días, en producción; calcular sobre eso el indicador; y evaluar la regla de la alerta. Nada de eso forma parte de este documento.
