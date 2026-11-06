# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: un cambio de motor a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Cuántas trazas aparecieron y qué tramo consumió más tiempo en la más lenta

Utilizando los datos que anotaste.

- Aparecieron 15 trazas (57 spans, medidas en el log del colector 0.164.0); la más lenta fue `POST /api/v1/auth/signup` con 109,6 ms, y de ellos el único span hijo, `select flowsync.users`, consumió 22,3 ms: los ~87 ms restantes ocurren dentro del handler sin span propio (sospecho del hash de la contraseña, pero no lo he comprobado).

## 2. Qué cambiaste para conseguir que llegaran

Si al principio no aparecieron, explica cuál era el problema. Si funcionó al primer intento, indícalo también.

- No funcionó al primer intento: instalé `@adonisjs/otel`, pero el backend no arrancaba porque el `.env` sin salto de línea final unió `APP_ENV` y `OTEL_SERVICE_NAME` en una sola variable, y después no llegó nada porque el colector 0.116.1 caía con `SIGSEGV` en este kernel, así que lo cambié a 0.164.0 (también volví opcionales `APP_NAME`, `APP_VERSION` y `APP_ENV` para no romper CI).

## 3. Cuánto presupuesto de error obtuviste, expresado en peticiones

Y si te parece mucho o poco para un mes de uso real de FlowSync.

- Obtuve 200 peticiones malas (1 % de 20.000 en 28 días, unas 7 al día), que me parece suficiente para un mes de uso real pequeño, pero es una estimación sin medir: el volumen de 20.000 es una hipótesis y con unas 30 peticiones a la hora bastan unas 4 malas para disparar la alerta, así que habría que rehacer la cuenta con el tráfico real.
