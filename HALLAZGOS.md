# Hallazgos

## 1. Cuántas trazas llegaron y dónde se fue el tiempo

Llegaron 11 trazas. Una era un `GET /api/v1/account/profile` que hizo el agente mientras
investigaba; las otras 10 son mi recorrido: el registro, seis `GET /api/v1/tasks`, dos
`POST /api/v1/tasks` y un `PATCH /api/v1/tasks/:id/status`.

La más lenta fue el registro, `POST /api/v1/auth/signup`, con 129,7 ms. Sus tres consultas a la
base sumaron 12,6 ms. Los otros 117 ms no aparecen en ningún tramo hijo. Supongo que son el hash
de la contraseña, que no está instrumentado, pero no lo medí.

En `/api/v1/tasks` pasa algo parecido. La más lenta fue un `GET` de 48,3 ms, con 9,2 ms en la
base. También vi que cada petición autenticada hace un `update` en `auth_access_tokens`, o sea
que hasta leer la lista de tareas escribe en la base.

## 2. Qué cambié para que llegaran

En la instrumentación, nada. La primera vez llegaron 0 trazas, sin ningún error. El problema era
que tenía un backend viejo de otro clon mío ocupando el 3333 desde el 14 de octubre, sin
OpenTelemetry. `make start` levantó el instrumentado en otro puerto sin avisar, y el frontend
seguía hablando con el viejo. Lo encontró el agente, con evidencia y sin matar mi proceso. Lo
maté yo (el padre y después el hijo, que quedó huérfano en el puerto), reinicié `make start` y
llegaron.

## 3. El presupuesto de error

Con 20.000 peticiones supuestas en 28 días, el presupuesto da 200 peticiones malas, unas 7 por
día.

Para un mes de uso real de FlowSync me parece razonable, hasta holgado, para la parte de
lentitud: lo que medí en `/tasks` anda por debajo de 50 ms, lejos de los 500. Donde se gasta
rápido es en una caída. Con unas 30 peticiones por hora, una hora caída son unas 30 malas, el 15 %
del presupuesto. Unas siete horas caídas en el mes lo agotan.
