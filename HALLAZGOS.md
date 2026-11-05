# Hallazgos

Aquí van **las tres líneas** del ejercicio.

## 1. Cuántas trazas aparecieron y qué tramo consumió más tiempo en la más lenta

- Llegaron 27 trazas al colector (2 de la prueba del agente y 25 de mi tráfico: registro, 5 tareas creadas, 2 cambios de estado y los listados); la más lenta de `/api/v1/tasks` fue un GET de 58,5 ms en el que las 4 consultas a la base (select y update de `auth_access_tokens`, select de `users`, select de `tasks`) suman solo 13,8 ms, así que el tramo que más consumió fue el propio servidor (middleware de autenticación y Node), unos 45 ms.

## 2. Qué cambiaste para que llegaran; si funcionó a la primera, decirlo; si no llegaron, cuál era el problema

- Llegaron a la primera, sin cambiar nada tras el prompt; lo que sí se chocó fue el hook `datos-que-no-salen` del repo, que bloqueó el commit dos veces por el correo público del mantenedor de `glob` dentro de `package-lock.json` (un falso positivo sobre un archivo generado, que el siguiente `npm install` puede volver a traer), y la traza mostró algo que las pruebas no ven: tras registrarse, el frontend pide la lista de tareas 7 veces en el mismo segundo.

## 3. Cuánto presupuesto de error obtuviste en peticiones y si te parece mucho o poco para un mes real de FlowSync

- 200 peticiones, el 1 % de un volumen supuesto de 20.000; con ese tráfico (unas 30 por hora) equivalen a casi 7 horas de caída total al mes, lo que me parece holgado para FlowSync, pero el supuesto es lo frágil: si el volumen real es diez veces menor y cada acción del usuario dispara 7 peticiones, el presupuesto se agota en un puñado de clics durante un incidente, y la suite de pruebas no aporta trazas porque `APP_ENV` no admite `test`.
