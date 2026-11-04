# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: un cambio de motor a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Cuántas trazas aparecieron y qué tramo consumió más tiempo en la más lenta,
Encontre 4 trazas, la traza más lenta fue POST /api/v1/auth/signup, con 321,3 ms.

| Traza | Duración | Spans | Tiempo en base de datos |
| :--- | :--- | :--- | :--- |
| `POST /api/v1/auth/signup` | 321,3 ms | 4 | 7,6 ms |
| `POST /api/v1/auth/login` | 118,6 ms | 3 | 2,8 ms |
| `GET /api/v1/account/profile` | 75,4 ms | 4 | 2,8 ms |

-

## 2. Qué cambiaste para conseguir que llegaran.

Funciono bien desde el primer prompt.

-

## 3. Cuánto presupuesto de error obtuviste, expresado en peticiones

Presupuesto de error de 200, para un estimado de 1000 peticiones al dia, son 1.7peticiones malaas, y una caida 1h 36h en 28 dias. Para un sistema que soporta 6 usuarios me parece razonable. Subirlo a 99.9% significaria 10mins de tiempo fuera cada 28 dias lo que es muy exigente para flowsync y un solo despliegue fallido podria comerselos.

-
