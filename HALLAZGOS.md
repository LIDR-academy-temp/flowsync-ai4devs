# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: un cambio de motor a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.


## 1. Cuánto pesa tu imagen y qué tuvo que escribir el Dockerfile

Cuánto pesa tu imagen y qué tuvo que escribir el Dockerfile que tu máquina daba por hecho. Una dependencia del sistema, una versión, un paso de construcción: lo que en tu portátil ya estaba y en una máquina vacía hubo que declarar.

Tamaño de la imagen: 252 MB (167 MB de node:24-alpine y 85 MB de dependencias de producción; la aplicación compilada son 0,6 MB). 
El Dockerfile tuvo que declarar lo que mi portátil daba por hecho: la versión de Node (salió la 24.22.1, no mi 24.13.1, y npm 11.19.1 en vez de 11.8.0, instalar dependencias desde el lockfile dos veces, compilar con npm run build, y correr como un usuario sin privilegios (de ahí el EACCES al escribir .adonisjs/). No hizo falta ningún paquete del sistema: scrypt viene en Node y pg es JavaScript puro.
-

## 2. Qué reclamó el contenedor al arrancar sin variables.

La lista literal, cuántas son, y cuáles de ellas son un secreto (su conocimiento da acceso) y cuáles configuración (si aparecieran en un registro público no pasaría nada). Es la clasificación de la lección de secretos, aplicada a tu lista real.

 Lista de 12 variables, 2 secretos y 10 de configuración:
  Secreto : APP_KEY, DB_PASSWORD
  Configuración: NODE_ENV, PORT, HOST, LOG_LEVEL, APP_URL, SESSION_DRIVER, DB_HOST, DB_PORT, DB_USER, DB_DATABASE 

Salida literal:

 EnvValidationException: Validation failed for one or more environment variables

- Missing environment variable "NODE_ENV"
- Missing environment variable "PORT"
- Missing environment variable "HOST"
- Missing environment variable "LOG_LEVEL"
- Missing environment variable "APP_KEY"
- Missing environment variable "APP_URL"
- Missing environment variable "SESSION_DRIVER"
- Missing environment variable "DB_HOST"
- Missing environment variable "DB_PORT"
- Missing environment variable "DB_USER"
- Missing environment variable "DB_PASSWORD"
- Missing environment variable "DB_DATABASE"

 ⁃ at new EnvValidator (node_modules/@adonisjs/env/build/index.js:127:17)
 ⁃ at Env.rules (node_modules/@adonisjs/env/build/index.js:221:10)
 ⁃ at Env.create (node_modules/@adonisjs/env/build/index.js:205:23)
 ⁃ (async file://start/env.js:2:16) 

Lo que pasó con make image-run: la API respondió, pero el curl falló con el error 56 por la carrera con el proxy de puertos de Docker Desktop, y apareció el aviso EACCES de ejecutar en modo development sobre código de root.
-

## 3. Qué NO comprueba tu pipeline.

Una lista corta e incómoda: lo que ninguno de los cinco trabajos afirma. Es la columna de la derecha de la tabla que leíste, rellena para el tuyo.

El pipeline no comprueba: que la imagen arranque (solo se construye) ni que los tests corran sobre el build/ que va en ella; que la imagen de CI sea la que se despliega (no se publica, y node:24-alpine se mueve); que la imagen esté limpia (9 vulnerabilidades, 1 crítica, y sale en verde); nada del frontend (ni build, ni make test-ui); el lint del backend; el down de las migraciones; que no entren secretos (el hook solo corre en Claude); el plan de infraestructura de los PR desde forks y de los pushes directos a main; las acciones internas de railwayapp/config y las imágenes de Docker, que van por etiqueta y no por SHA.
