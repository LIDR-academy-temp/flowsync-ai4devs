# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: un cambio de motor a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Las filas que cambian y la rama

Cuántas filas cambian de valor en tu cambio de esquema, medido con una consulta, y en qué rama del
árbol de reversibilidad cae. Si tu migración no toca datos, dilo tal cual: también es una respuesta.

- 388 MB (node:24-alpine). La primera construcción falló con EACCES: con el usuario sin privilegios, `npm ci` no podía crear `node_modules` en `/app`, porque la carpeta era de root; en mi máquina soy dueño de mis carpetas y eso ni se ve. Hubo que pedir una corrección. Además, los tests compilados viajan en la imagen final, porque el build de AdonisJS los mete en `build/`.


## 2. Lo que la batería de pruebas no podía ver

Una cosa que la batería de pruebas no podía ver. Si no encontraste ninguna, escribe qué buscaste y dónde.

- 12 variables: NODE_ENV, PORT, HOST, LOG_LEVEL, APP_KEY, APP_URL, SESSION_DRIVER, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD y DB_DATABASE. Secretos: APP_KEY y DB_PASSWORD. El resto es configuración; DB_USER lo dudé, porque solo no da acceso pero ayuda. En CI, APP_KEY va con un valor inventado, así que ahí deja de ser secreto.

## 3. Tu duda

De qué dudaste, o qué no pudiste comprobar.

- Que la imagen arranque (el trabajo `image` solo la construye), qué lleva dentro (`.env`, tests, usuario, tamaño), el frontend (`test-ui` y `test-web` no están en CI), que las acciones de `openapi.yml` estén fijadas a SHA (usan `@v7` y `ci-lint` no lo detecta) y que exista `RAILWAY_TOKEN`: en mi PR, desde un fork, los trabajos de infraestructura no corren.
