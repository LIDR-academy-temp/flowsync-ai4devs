# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: un cambio de motor a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Cuánto pesa tu imagen y qué tuvo que escribir el Dockerfile que tu máquina daba por hecho. Una dependencia del sistema, una versión, un paso de construcción: lo que en tu portátil ya estaba y en una máquina vacía hubo que declarar.

La imagen pesó 265MB.
El Dockerfile tuvoe que escribir: 

- La imagen pesa 265MB y salió de primera, sin pedir corrección. 
- Hubo que declarar cuatro cosas que mi máquina daba por hechas:
- Node 24, que package.json no fija: sale del engines de @adonisjs/core, lucid, assembler y @tuyau/core.
- Un paso de compilación (npm run build).
- npm en la imagen final, solo para instalar las dependencias de producción.
- Que la carpeta de la app se puede escribir. Arrancada con el NODE_ENV=development de .env, AdonisJS intentó escribir .adonisjs/server/routes.d.ts y falló con EACCES, porque en la imagen el código es de root.


## 2. Qué reclamó el contenedor al arrancar sin variables. La lista literal, cuántas son, y cuáles de ellas son un secreto (su conocimiento da acceso) y cuáles configuración (si aparecieran en un registro público no pasaría nada). Es la clasificación de la lección de secretos, aplicada a tu lista real.

docker run --rm flowsync-api:local murió con EnvValidationException. 
Reclamó 12 variables: NODE_ENV, PORT, HOST, LOG_LEVEL, APP_KEY, APP_URL, SESSION_DRIVER, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD y DB_DATABASE.
- Secretos (2): APP_KEY y DB_PASSWORD, las dos que start/env.ts declara con Env.schema.secret().
- Configuración (10): el resto.
- Mi .env tiene dos más que no pidió: TZ y DB_RO_PASSWORD. Esta última es un secreto, y --env-file la mete igualmente en el contenedor.


## 3. Qué NO comprueba tu pipeline. Una lista corta e incómoda: lo que ninguno de los cinco trabajos afirma. Es la columna de la derecha de la tabla que leíste, rellena para el tuyo.

- image
	- Afirma que la imagen se construye, no que arranque. 
	- No comprueba el tamaño ni que no haya colado código fuente, dependencias de desarrollo o un .env.
	- No escanea vulnerabilidades de la imagen base ni de las dependencias.
	- No publica la imagen en ningún registro: lo que se construye se descarta.

- lint-workflows
	- Valida la sintaxis y errores conocidos de los workflows, no que hagan lo correcto.
	- No verifica que los SHA correspondan a la versión del comentario, ni que sean de confianza.
	
- Nadie revisa el plan obligatoriamente: aparece como comentario, pero nada impide fusionar sin leerlo.	

-
