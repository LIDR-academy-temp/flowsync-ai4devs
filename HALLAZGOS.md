# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: un cambio de motor a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Cuánto pesa tu imagen y qué tuvo que escribir el Dockerfile que tu máquina daba por hecho

Una dependencia del sistema, una versión, un paso de construcción: lo que en tu portátil ya estaba y en una máquina vacía hubo que declarar

- La imagen pesa 388 MB (124 MB son las dependencias de producción de `npm ci --omit=dev`; el código compilado, 1,2 MB); el Dockerfile tuvo que declarar lo que mi portátil daba por hecho: Node 24 (`node:24-alpine`, local v24.14.1), copiar `package-lock.json` para que `npm ci` sea reproducible, compilar con `npm run build` a `build/`, reinstalar dependencias dentro de `build/`, bajar a `USER node` y dejar fuera el `.env` con `.dockerignore`; no encontré dependencias nativas del sistema que añadir.

## 2. Qué reclamó el contenedor al arrancar sin variables

La lista literal, cuántas son, y cuáles de ellas son un secreto (su conocimiento da acceso) y cuáles configuración (si aparecieran en un registro público no pasaría nada). Es la clasificación de la lección de secretos, aplicada a tu lista real.

- Reclamó 12 variables: `NODE_ENV`, `PORT`, `HOST`, `LOG_LEVEL`, `APP_KEY`, `APP_URL`, `SESSION_DRIVER`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`; 2 son secretos (`APP_KEY` y `DB_PASSWORD`, su conocimiento da acceso) y 10 son configuración (el resto; `DB_USER` por sí solo no da acceso, pero iría mejor junto a los secretos en producción).

## 3. Qué NO comprueba tu pipeline

Una lista corta e incómoda: lo que ninguno de los cinco trabajos afirma. Es la columna de la derecha de la tabla que leíste, rellena para el tuyo.

- No comprueba que la imagen arranque (`image` solo la construye), ni que hable con una base de datos real (los tests corren contra un Postgres efímero del propio CI, no contra el de producción ni con la imagen), ni el frontend (ningún trabajo hace lint, build ni historias de él), ni vulnerabilidades o secretos dentro de la imagen, ni que se despliegue en ningún sitio; `lint-workflows` solo valida sintaxis, `infra-plan`/`infra-apply` no se han ejecutado nunca (no existe `.railway/`) y `test` usa `make -o db-up test`, no exactamente el comando local.
