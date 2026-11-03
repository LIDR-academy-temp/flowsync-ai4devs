# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: un cambio de motor a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Las filas que cambian y la rama

Cuántas filas cambian de valor en tu cambio de esquema, medido con una consulta, y en qué rama del
árbol de reversibilidad cae. Si tu migración no toca datos, dilo tal cual: también es una respuesta.

- Llegaron 3 trazas distintas. En la más lenta, una petición a /api/v1/tasks, el tramo Server duró X ms y sus consultas a la base Y ms: el tiempo se fue en [la base / el resto de la petición].

## 2. Lo que la batería de pruebas no podía ver

Una cosa que la batería de pruebas no podía ver. Si no encontraste ninguna, escribe qué buscaste y dónde.

- Nada en la instrumentación: funcionó a la primera. Al principio contaba 0 porque make start se había caído por dependencias del frontend sin instalar; tras instalarlas con npm ci y generar tráfico, llegaron.

## 3. Tu duda

De qué dudaste, o qué no pudiste comprobar.

- 200 peticiones en 28 días (20.000 × 1 %), unas 7 al día. Para FlowSync me parece poco