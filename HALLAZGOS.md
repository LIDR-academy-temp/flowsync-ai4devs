# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: una parte A a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Cuánto pesa la imagen y qué tuvo que escribir el Dockerfile

Cuánto pesa tu imagen y qué tuvo que declarar el Dockerfile que tu máquina daba por hecho: una
dependencia del sistema, una versión, un paso de construcción.

- `flowsync-api:local` ocupa 388 MB en disco (DISK USAGE) y 81.1 MB de contenido (CONTENT SIZE), construida desde cero a la primera con `make image`; el Dockerfile tuvo que declarar lo que mi máquina daba por hecho: Node 24 explícito, instalar las dependencias con `npm ci`, compilar AdonisJS con `npm run build`, copiar solo `build/` a una segunda etapa e instalar allí únicamente las dependencias de producción.

## 2. Qué reclamó el contenedor al arrancar sin variables

La lista literal, cuántas son, y cuáles son un secreto (su conocimiento da acceso) y cuáles
configuración (si aparecieran en un registro público no pasaría nada).

- `docker run --rm flowsync-api:local` sin variables reclamó 12: NODE_ENV, PORT, HOST, LOG_LEVEL, APP_KEY, APP_URL, SESSION_DRIVER, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD y DB_DATABASE; secretos, 2: APP_KEY y DB_PASSWORD; configuración, 10: NODE_ENV, PORT, HOST, LOG_LEVEL, APP_URL, SESSION_DRIVER, DB_HOST, DB_PORT, DB_USER y DB_DATABASE.

## 3. Qué NO comprueba el pipeline

Una lista corta e incómoda: lo que ninguno de los cinco trabajos afirma.

- Los cinco trabajos de `ci.yml` (`make ci-lint` quedó en silencio con código 0) no demuestran que la imagen arranque ni que la API responda (`image` solo la construye), no comprueban que las variables y secretos reales existan en producción (`test` usa valores de CI y no se dio RAILWAY_TOKEN), no despliegan ni hacen ninguna comprobación posterior al despliegue (no existe `.railway/` y no se desplegó nada), no validan las migraciones contra datos reales ni su rollback (`make test` solo las aplica hacia arriba sobre una base vacía), no buscan vulnerabilidades y no comprueban el frontend.
