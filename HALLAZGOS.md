# Hallazgos

Los **tres puntos** del ejercicio del módulo 14. Los títulos corresponden a los puntos de la
consigna, consultada en la plataforma del curso; la consigna no está en este repositorio (el README
de la rama de partida es el del módulo 13). Debajo de cada punto, la evidencia, marcada así:

- **observado:** lo vio Pablo al ejecutar o lo comprobamos leyendo archivos o salidas reales;
- **pendiente:** no se hizo o no se comprobó. Falta de evidencia no es lo mismo que un fallo.

**Procedencia de las lecturas de trazas.**

- Pablo arrancó el recolector y la API, generó el tráfico, leyó los registros del recolector y
  localizó la traza.
- Compartió fragmentos de esos registros con **ChatGPT, en la conversación de acompañamiento**, y
  ChatGPT calculó y comparó las duraciones.
- La consigna reservaba esa lectura para la persona, así que esto es **ayuda de análisis** y una
  diferencia respecto de la consigna.
- **Claude Code no leyó los registros del recolector:** ni el agente que implementó la
  instrumentación ni la sesión de Claude Code que preparó y documentó la práctica.

## 1. Lo que muestran las trazas

- **Observado** (por Pablo, con los cálculos de ChatGPT descritos arriba): **13 trazas
  distintas**. En la traza seleccionada de `GET /api/v1/tasks`, la petición duró **44,287 ms**, y
  la consulta SQL más lenta dentro de ella fue `UPDATE auth_access_tokens`, con **2,411 ms**.
- **Pendiente:** no se identificó **la traza más lenta del conjunto**. Los valores de arriba son de
  la traza elegida, no un máximo.

## 2. Qué hizo falta para que llegaran las trazas

- **Observado** (por Pablo):
  - el primer arranque **falló con Node.js v20.20.2**: `ERR_UNKNOWN_FILE_EXTENSION` al cargar
    `backend/bin/console.ts`;
  - Pablo repitió `make start` usando **Node 24.8.0** y después observó trazas del servicio
    `flowsync-api`.
- **Observado** en el commit de la instrumentación (`a14242c`), que es lo que el agente configuró:
  - el instalador oficial, `node ace add @adonisjs/otel`;
  - `import '../otel.js'` como primera línea de `backend/bin/server.ts`;
  - `APP_NAME`, `APP_VERSION` y `APP_ENV` en los `.env` y en `openapi.yml`;
  - `OTEL_EXPORTER_OTLP_ENDPOINT` en el `.env` local;
  - el servicio `observability` en `compose.yaml`.
- **No documentado:** ningún otro ajuste de instrumentación para que las trazas llegaran.
- **Pendiente:** una **copia local** de la salida completa del fallo con Node 20. La salida existe en
  la conversación de ChatGPT; aquí solo se registra el error, sin reconstruir la salida literal.

## 3. El presupuesto de errores

- **Observado** (cálculo de `docs/slo/api.md`): con un objetivo de **99 %** en **28 días** y
  **20.000 peticiones** supuestas, el presupuesto es de **200 peticiones malas**.
  - Es un supuesto: en operación se recalcula con el volumen real.
  - Nada mide hoy ese indicador: no hay métricas ni alerta implementadas.
- **Valoración de Pablo** (redacción propuesta por ChatGPT y aprobada por Pablo): «Para FlowSync,
  un 1 % de peticiones malas me parece aceptable como objetivo inicial. Pero 200 peticiones
  problemáticas pueden afectar bastante si se concentran en pocos minutos o impiden guardar tareas.
  Además, el indicador cuenta tanto errores del servidor como respuestas de 500 ms o más: no todas
  tienen el mismo impacto.»
