# Hallazgos

Las tres líneas de la Parte C del ejercicio del módulo 13, con lo que se midió en esta máquina, no con lo que se suponía.

## 1. Cuánto pesa la imagen y qué tuvo que escribir el Dockerfile que mi máquina daba por hecho

flowsync-api:local pesa **388 MB en disco y 81,1 MB de contenido**.
El Dockerfile tuvo que declarar lo siguiente:
  - la línea de Node, node:24-alpine;
  - las dependencias, con npm ci sobre el lockfile;
  - un usuario sin privilegios (node).

## 2. Qué reclamó el contenedor al arrancar sin variables

El principal reclamo fueron las variables relacionadas con secretos.

12 variables: 
  - 2 son secretos, porque conocerlas da acceso: APP_KEY y DB_PASSWORD.
  - Las otras 10 son configuración, y nada pasaría si salieran en un registro público: NODE_ENV, PORT, HOST, LOG_LEVEL, APP_URL, SESSION_DRIVER, DB_HOST, DB_PORT, DB_USER y DB_DATABASE.

## 3. Qué NO comprueba mi pipeline

El pipeline no valida que la imagen arraque, sólo la contruye.
El comando de make image informo de 9 vulnerabilidades y no hay algo que las valide ni las corrija
