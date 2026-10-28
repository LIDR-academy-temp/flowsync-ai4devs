# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: un cambio de motor a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Cuanto pesa tu imagen y que tuvo que escribir el Dockerfile que tu maquina daba por hecho
-Tamaño imagen: 388MB en disco, 81MB en un registro Docker (comprimida)
-Tomo las imagenes oficiales y estables para NodeJS24, y despues de eso solo instalo con npm ci las dependencias especificadas en el proyecot y nada mas.

-

## 2. Que reclamo el contenedor al arrancar sin variables:

Esta es la lista literal de variables:
- NODE_ENV
- PORT
- HOST
- LOG_LEVEL
- APP_KEY
- APP_URL
- SESSION_DRIVER
- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_DATABASE

Las que son secretos son:
- DB_PASSWORD
- APP_KEY

El resto son configuracion:
- NODE_ENV
- HOST
- PORT
- LOG_LEVEL
- APP_URL
- SESSION_DRIVER
- DB_HOST
- DB_PORT
- DB_USER
- DB_DATABASE

## 3. Que NO comprueba tu pipeline

- Problemas de seguridad, dependencias inseguras, (por ejemplo, npm ci con 9 vulnerabilidades, 1 crítica, 1 alta)
- Secretos expuestos
- Cualquier cosa que no este en las pruebas
- Si las acciones de los workflow existentes, como chromatic.yml no esan fijadas con sha.
