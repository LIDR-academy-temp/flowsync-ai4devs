# SLO de la API de tareas

Este documento **define** un objetivo de nivel de servicio (SLO) para la API de tareas de FlowSync y una alerta asociada. No afirma que el objetivo se cumpla ni que la alerta exista: hoy no hay métricas, reglas de alerta ni panel que lo calculen. Las trazas que el backend envía en local al recolector de OpenTelemetry (servicio `observability` de `compose.yaml`) sirven para comprobar que la instrumentación funciona, pero no demuestran cumplimiento: cubren minutos de tráfico de prueba, no una ventana de 28 días de tráfico real.

En cada apartado se distingue entre:

- **Fijado por la consigna**: valores que vienen dados por el ejercicio y no se discuten aquí.
- **Elegido**: parámetros decididos en este documento, que se pueden revisar.

## 1. Alcance

**Fijado por la consigna:** entran exclusivamente las rutas de `/api/v1/tasks`, incluidas las operaciones sobre tareas individuales. Todas las demás quedan fuera.

Rutas incluidas (todas exigen autenticación, `start/routes.ts`):

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

Rutas excluidas explícitamente, entre otras:

- registro: `POST /api/v1/auth/signup`;
- login: `POST /api/v1/auth/login`;
- health: `GET /health`;
- el resto de `/api/v1` (`GET /api/v1/account/profile`, `POST /api/v1/account/logout`), la documentación OpenAPI (`/api`, `/api.json`, `/api.yaml`) y `GET /`.

**Elegido:** una petición pertenece al alcance cuando el enrutador la asocia a uno de los patrones de la tabla, es decir, cuando su ruta (`http.route`) es una de ellas. Las peticiones a rutas inexistentes bajo `/api/v1/tasks/…` (que responden 404 sin ruta asociada) no entran. Si se añade o retira una ruta del grupo `tasks`, esta tabla se actualiza en el mismo cambio.

## 2. Indicador (SLI)

**Fijado por la consigna:**

- **Denominador:** todas las peticiones del alcance durante la ventana.
- **Numerador (peticiones buenas):** las que cumplen **a la vez** las dos condiciones:
  1. código de estado HTTP **inferior a 500**, y
  2. duración **estrictamente menor que 500 ms**.

```
SLI = peticiones buenas / peticiones totales del alcance
```

Consecuencias de la definición:

- **Una petición mala cuenta una sola vez**, aunque incumpla las dos condiciones. Un 503 que tarda 2 s es una petición mala, no dos. Lo que se cuenta son peticiones, no condiciones incumplidas.
- **Un 4xx rápido cuenta como bueno.** Por este contrato, un 400, 401, 403, 404 o 422 respondido en menos de 500 ms es una petición buena: el servicio respondió bien a una petición incorrecta. Un 4xx que tarda 500 ms o más es malo por la latencia.
- **Exactamente 500 ms es malo**, porque la condición es estrictamente menor.
- **Sin peticiones, el indicador no es calculable.** Si el denominador es 0, el cociente no existe: se informa como «sin datos», nunca como 100 %.

**Elegido:**

- La duración es la que se mide en el servidor, desde que llega la petición hasta que se envía la respuesta. Es la duración del span HTTP de entrada que genera la instrumentación de OpenTelemetry. No incluye la red entre el cliente y el servidor.
- Una petición del alcance que termina sin código de respuesta (por ejemplo, porque la conexión se cortó) cuenta en el denominador y como mala.
- El indicador se calcula con el código HTTP y la duración definidos arriba, no con el estado del span (OK o ERROR) que asigne la instrumentación: ese estado no equivale a esta definición.

## 3. Objetivo

**Fijado por la consigna:** al menos el **99 %** de peticiones buenas en una **ventana móvil de 28 días**.

Al ser móvil, la ventana siempre cubre los 28 días anteriores al momento de la evaluación. No se reinicia a principio de mes.

## 4. Presupuesto de errores

El presupuesto es el número de peticiones malas que se pueden tolerar en la ventana sin incumplir el objetivo:

```
presupuesto = (1 − objetivo) × peticiones totales en la ventana
```

**Fijado por la consigna:** el cálculo se hace sobre un volumen **supuesto** de 20.000 peticiones en 28 días:

```
presupuesto = (1 − 0,99) × 20.000 = 0,01 × 20.000 = 200 peticiones malas
```

Las 20.000 peticiones son un supuesto del ejercicio, no un dato medido. En operación, el volumen supuesto **se sustituye por el real**, es decir, las peticiones del alcance contadas en la ventana. El presupuesto cambia con el tráfico. Con 35.000 peticiones serían 350; con 8.000, 80.

```
presupuesto restante = presupuesto − peticiones malas observadas en la ventana
```

Si el presupuesto restante es negativo, el objetivo no se cumple en esa ventana.

## 5. Alerta

Hay una sola alerta, de **ritmo de consumo del presupuesto** (*burn rate*). Avisa cuando la proporción reciente de peticiones malas haría que el presupuesto de 28 días se agotara mucho antes de que termine la ventana.

### Cálculo

Sobre la ventana de evaluación:

```
proporción de malas = peticiones malas / peticiones totales del alcance
ritmo de consumo    = proporción de malas / (1 − 0,99)
                    = proporción de malas / 0,01
```

Un ritmo de 1 consume el presupuesto exactamente en 28 días. Un ritmo de R lo agota en `28 días / R`, si se mantiene.

### Parámetros

| Parámetro | Valor | Origen |
|---|---|---|
| Objetivo | 99 % | Fijado por la consigna |
| Ventana del SLO | 28 días, móvil | Fijado por la consigna |
| Definición de petición mala | código ≥ 500 o duración ≥ 500 ms | Fijado por la consigna |
| Ventana de evaluación de la alerta | 1 hora, móvil | Elegido |
| Umbral del ritmo de consumo | ≥ 14,4 (equivale a ≥ 14,4 % de peticiones malas en esa hora) | Elegido |
| Volumen mínimo para evaluar | ≥ 20 peticiones del alcance en la hora | Elegido |
| Frecuencia de evaluación | cada 5 minutos | Elegido |

### Condición de disparo

```
peticiones totales del alcance en la última hora ≥ 20
  Y
(peticiones malas en la última hora / peticiones totales en la última hora) / 0,01 ≥ 14,4
```

Si en la última hora hay menos de 20 peticiones, o ninguna, la alerta **no se evalúa**: el indicador no es calculable o no es representativo. Esa hora no se trata como buena ni como mala.

### Por qué estos valores

- **Agotamiento anticipado:** con un ritmo de 14,4 sostenido, el presupuesto de 28 días (672 h) se agota en `672 h / 14,4 ≈ 46,7 h`, menos de dos días. La alerta avisa con tiempo para actuar antes de agotarlo.
- **Consumo por hora que dispara:** una hora a ritmo 14,4 consume `14,4 / 672 ≈ 2,1 %` del presupuesto. Con el volumen supuesto, 20.000 / 672 ≈ 30 peticiones por hora, eso son unas 4 o 5 peticiones malas en una hora (alrededor de 4,3 de las 200 del presupuesto).
- **Volumen mínimo:** con poco tráfico, una sola petición mala dispararía la proporción (1 de 3 = 33 %). Exigir 20 peticiones evita esas falsas alarmas. A cambio, en horas de tráfico muy bajo la alerta queda ciega: en esas horas el consumo del presupuesto solo se ve en el SLI de 28 días.
- **Solo consumos rápidos:** la alerta elegida detecta consumos rápidos del presupuesto. No cubre todos los ritmos que podrían agotarlo: un ritmo sostenido mayor que 1 y menor que 14,4 lo agota antes de que termine la ventana de 28 días sin disparar la alerta (con ritmo 5, en unos 5,6 días: 672 h / 5 = 134,4 h).
- **Una única ventana:** Esta alerta usa una única ventana de una hora. Puede diluir picos breves y no distingue por sí sola un pico de un fallo sostenido con la misma proporción de peticiones malas. Un fallo concentrado en pocos minutos puede disparar la alerta y dejar de cumplir la condición poco después. Es una limitación aceptada para el ejercicio.

## 6. Lo que este documento no es

- No es una medición: no hay hoy ningún cálculo del SLI ni del presupuesto consumido.
- No es una alerta implementada: no existen métricas, reglas ni notificaciones que apliquen el apartado 5.
- No es evidencia de cumplimiento: unas trazas locales de unos minutos no dicen nada sobre una ventana móvil de 28 días con tráfico real.
