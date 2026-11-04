# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: un cambio de motor a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Cuántas trazas aparecieron y qué tramo consumió más tiempo en la más lenta,
Encontre 3 trazas (11 spans en total), la traza más lenta fue POST /api/v1/auth/signup, con 321,3 ms. El tramo hijo que más tiempo consumió fue insert flowsync_test.users, con 2,7 ms; el resto de los 321,3 ms no lo cubre ningún span hijo.

| Traza | Duración | Spans | Tiempo en base de datos |
| :--- | :--- | :--- | :--- |
| `POST /api/v1/auth/signup` | 321,3 ms | 4 | 7,6 ms |
| `POST /api/v1/auth/login` | 118,6 ms | 3 | 2,8 ms |
| `GET /api/v1/account/profile` | 75,4 ms | 4 | 2,8 ms |

-

## 2. Qué cambiaste para conseguir que llegaran.

No hubo que cambiar la instrumentación: funciono desde el primer prompt. Los tropiezos fueron que node ace no arrancaba en Windows y hubo que pasar a WSL, que el collector necesitaba escuchar en 0.0.0.0 (se configuró desde el principio) y que la primera prueba no envió nada porque el servidor tardó más de lo esperado en arrancar.

-

## 3. Cuánto presupuesto de error obtuviste, expresado en peticiones

Presupuesto de error de 200, para un estimado de 1000 peticiones al dia, son 10 peticiones malas al dia (1.7 por persona), y una caida de 1h 36min en 28 dias. Para un sistema que soporta 6 usuarios me parece razonable. Subir el objetivo a 99.9% significaria 10mins de tiempo fuera cada 28 dias lo que es muy exigente para flowsync y un solo despliegue fallido podria comerselos.

-
