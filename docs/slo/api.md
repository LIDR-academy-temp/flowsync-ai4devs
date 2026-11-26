# Objetivo de nivel de servicio de la API

Se calcula sobre lo que la instrumentación ya guarda: cada petición deja un tramo (*span*) con su ruta (`http.route`), su código (`http.response.status_code`) y su duración.

## Indicador (SLI, *Service Level Indicator*)

- **Numerador:** peticiones a rutas de `/api/v1/tasks` contestadas con un código menor de 500 **y** en menos de 500 milisegundos.
- **Denominador:** todas las peticiones a rutas de `/api/v1/tasks`.

## Objetivo (SLO, *Service Level Objective*)

El indicador es de al menos el **99 %** en una **ventana móvil de 28 días**.

## Presupuesto de error

Con un volumen **supuesto** de 20.000 peticiones en la ventana, pueden incumplir **200 peticiones**. El supuesto se sustituye por el volumen real en cuanto se mida.

## Alerta (una, por síntoma)

Avisar cuando, al ritmo actual, el presupuesto se agotaría antes de cerrar la ventana: la proporción de peticiones a `/api/v1/tasks` que fallan o tardan de más consume el presupuesto más deprisa que lo que dura la ventana.

Para calcularlo: de los tramos de petición, filtrar los que tienen `http.route` bajo `/api/v1/tasks`; contar los que tienen `http.response.status_code` igual o superior a 500 o duran 500 ms o más; dividir entre todos los filtrados y comparar con el 1 % permitido.

## Lo que este objetivo no cubre

Las rutas que no son de `/api/v1/tasks`, como el registro y el inicio de sesión. Si importan, necesitan su propio objetivo con su propio presupuesto.
