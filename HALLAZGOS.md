# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: un cambio de motor a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Las filas que cambian y la rama

Cuántas filas cambian de valor en tu cambio de esquema, medido con una consulta, y en qué rama del
árbol de reversibilidad cae. Si tu migración no toca datos, dilo tal cual: también es una respuesta.

Respuesta: Aparecieron 12 trazas distintas; la más lenta fue POST /api/v1/auth/signup (122,51 ms) y su tramo más largo es el propio tramo de servidor de esa ruta (122,51 ms), ya que sus tres consultas a la base suman solo unos 16 ms (la mayor, select flowsync.users, 6,16 ms).
-

## 2. Lo que la batería de pruebas no podía ver

Una cosa que la batería de pruebas no podía ver. Si no encontraste ninguna, escribe qué buscaste y dónde.

Respuesta: Las trazas llegaron con la instrumentación inicial, sin cambiar nada: no hizo falta depurar ni tocar la configuración.
-

## 3. Tu duda

De qué dudaste, o qué no pudiste comprobar.

Respuesta: Presupuesto de error: 200 peticiones malas en 28 días (20.000 supuestas × 1 %); para un mes de uso real de FlowSync me parece poco.
-
