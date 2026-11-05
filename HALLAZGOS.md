# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: un cambio de motor a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Cuántas trazas aparecieron y qué tramo consumió más tiempo en la más lenta

Aparecieron 11 trazas y el tramo que mas consumio fue update flowsync.auth_access_tokens
-

## 2. Que cambiaste para conseguir que llegaran

No tuve problemas con las trazas, llegaron desde el comienzo

-

## 3. Cuánto presupuesto de error obtuviste, expresado en peticiones

Se pueden incumplir 200 peticiones (un 5xx, o 500 ms o más) en 28 días. Lo cual equivale a unas 7 por día.

En cuanto a peticiones parece una medida razonable, si las peticiones se distribuyen de manera uniforme en el mes, se tendrias unas 700 por dia, de las cules 7 podrian fallar.

En cuanto al tiempo quizas es demasiado, el 1% en 28 dias son alrededor de 7h. El servicio podria estar caido casi 7h y aun así cumplir el objetivo

-
