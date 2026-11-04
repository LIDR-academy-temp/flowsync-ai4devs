# Hallazgos

1. Recuento: 24 trazas únicas (comando: `docker compose logs observability | grep "Trace ID" | sort -u | wc -l`, en Git Bash). En la petición más lenta a `/api/v1/tasks` (`GET`, traza `c68aac06c88d34527d659ce66741b3a5`) el tramo mayor fue el tiempo dentro de Node: span HTTP 131,5 ms, suma de los cinco spans de base de datos 29,7 ms.

2. Las trazas llegaron a la primera, con `service.name` `flowsync-api`, sin cambiar el orden del import ni el puerto 4318. El primer recuento solo vio 2 sondas `curl` a `/api/v1/account/profile` porque los prompts se lanzaron antes del recorrido; las de `/api/v1/tasks` aparecieron al registrar una cuenta, crear dos tareas y cambiar un estado.

3. El presupuesto de este SLO son 200 peticiones malas de cada 20.000 en 28 días. Me parece holgado para un mes de uso normal de FlowSync: con cinco personas y consultas de una tabla, superar 500 ms o devolver un 5xx debería ser raro, y 200 fallos solo se gastan si la base se cae varios minutos seguidos.
