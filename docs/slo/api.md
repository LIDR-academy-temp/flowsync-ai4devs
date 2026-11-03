# Objetivo de nivel de servicio: API de tareas (`/api/v1/tasks`)

## Alcance

Este objetivo cubre **solo** las rutas bajo `/api/v1/tasks`.

**Quedan fuera todas las demás rutas**, entre ellas `/api/v1/auth/signup`, `/api/v1/auth/login`, `/api/v1/account/profile` y `/api/v1/account/logout`. Sus peticiones no cuentan ni en el numerador ni en el denominador. Si se quiere medir alguna de ellas (por ejemplo el registro o el inicio de sesión), necesita su propio objetivo y su propio presupuesto de error; no comparte el de este documento.

## Indicador (SLI)

Fracción de peticiones a `/api/v1/tasks` que responden con un código menor que 500 y tardan menos de 500 ms:

```
                 nº de peticiones con ruta ∈ /api/v1/tasks  Y  código < 500  Y  duración < 500 ms
SLI  =  ──────────────────────────────────────────────────────────────────────────────────────────
                          nº de peticiones con ruta ∈ /api/v1/tasks
```

- **Denominador:** toda petición cuya ruta sea `/api/v1/tasks` o cuelgue de ella, sea cual sea su código y su duración.
- **Numerador:** las del denominador cuyo código de respuesta es menor que 500 **y** cuya duración es menor que 500 ms. Una petición que falla en cualquiera de las dos condiciones es «mala».
- Los códigos 4xx cuentan como buenos: son errores del cliente, no del servicio.
- La duración es la del servidor, de la entrada de la petición a la salida de la respuesta. No incluye la red del cliente.

## Objetivo (SLO)

**SLI ≥ 99 %** sobre una **ventana móvil de 28 días**.

## Presupuesto de error

Presupuesto = 1 − 99 % = **1 %** de las peticiones de la ventana.

> **Supuesto, no dato medido.** Se supone un volumen de **20.000 peticiones** a `/api/v1/tasks` en los 28 días. Es un valor de partida para poder escribir cifras; se sustituirá por el volumen real en cuanto se mida.

Con ese supuesto: 20.000 × 1 % = **200 peticiones malas** (con código ≥ 500 o con duración ≥ 500 ms) permitidas en 28 días. A la 201.ª se incumple el objetivo.

Si el volumen real es `N`, el presupuesto es `N × 0,01` peticiones.

## Alerta

Una única alerta, sobre lo que percibe quien usa la API (peticiones lentas o con error en `/api/v1/tasks`) y no sobre una causa interna (CPU, memoria, conexiones a la base de datos…).

**Se dispara cuando el ritmo de consumo del presupuesto (_burn rate_) es ≥ 6 en la última hora y también en los últimos 5 minutos.**

```
burn rate  =  (1 − SLI en la ventana corta)  /  0,01
```

- Un burn rate de 1 agota el presupuesto exactamente al terminar los 28 días. Por encima de 1 sostenido, se agota antes.
- Con burn rate 6 el presupuesto se agota en 28 / 6 ≈ **4,7 días**, mucho antes de que acabe la ventana: es una señal de que hay que actuar.
- La condición de 5 minutos hace que la alerta se apague pronto cuando el problema ya está resuelto.
- Con el volumen supuesto (~30 peticiones por hora) una sola petición mala ya pesa mucho. Para evitar falsas alarmas, la alerta exige un **mínimo de 20 peticiones** a `/api/v1/tasks` en la última hora. Este mínimo y el umbral de 6 se revisarán con el volumen real.

## Cómo se mide

Las trazas del servidor HTTP que emite OpenTelemetry (ver `backend/config/otel.ts`) llevan la ruta, el código de respuesta y la duración de cada petición; de ahí salen el numerador y el denominador. La herramienta que evalúe la alerta aún no está elegida.
