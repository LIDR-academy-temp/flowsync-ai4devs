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
  instrumentación ni la sesión de Claude Code que preparó y documentó la práctica. Durante el
  prompt 03 (el del SLO) el recolector estaba en marcha, y la lectura de sus registros seguía
  prohibida para el agente. Es una restricción declarada y no un aislamiento técnico completo (ver
  `prompts.md`).

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
- **Observado en archivos versionados** (commit `a14242c`, lo que configuró el agente):
  - el instalador oficial, `node ace add @adonisjs/otel`, que agrega `backend/otel.ts`,
    `backend/config/otel.ts`, el provider en `backend/adonisrc.ts` y el middleware en
    `backend/start/kernel.ts`;
  - correcciones del agente sobre lo que dejó el instalador: `import '../otel.js'` como primera
    línea de `backend/bin/server.ts`, y `test` entre los valores de `APP_ENV` en
    `backend/start/env.ts`;
  - `APP_NAME`, `APP_VERSION` y `APP_ENV` en `backend/.env.example`, `backend/.env.test` y el bloque
    `env` de `.github/workflows/openapi.yml`; `OTEL_EXPORTER_OTLP_ENDPOINT` solo como línea
    comentada en `backend/.env.example`;
  - el servicio `observability` en `compose.yaml` y su configuración en
    `observability/otel-collector.yaml`.
- **Configurado en el `backend/.env` local** (no versionado; no se puede verificar desde el
  repositorio): `APP_NAME`, `APP_VERSION`, `APP_ENV` y
  `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318`, según la captura de la sesión del agente.
- **Sin ajustes posteriores:** después de ese commit, Pablo no hizo ajustes adicionales de
  instrumentación para que las trazas llegaran; solo repitió el arranque con Node 24.8.0.
- **Pendiente:** una **copia local** de la salida completa del fallo con Node 20. La salida existe en
  la conversación de ChatGPT; aquí solo se registra el error, sin reconstruir la salida literal.
- **Pendiente, entornos desplegados:** `backend/start/env.ts` exige ahora `APP_NAME`, `APP_VERSION`
  y `APP_ENV`, y la configuración versionada de Railway (`.railway/railway.ts`) no las define. No
  comprobamos las variables efectivas de ese entorno ni ejecutamos despliegues: antes de desplegar
  hay que definirlas.
- **Pendiente, `.env` preexistentes:** `make env` no modifica un `backend/.env` que ya existe. Quien
  ya lo tenga necesitará incorporar las tres variables antes de arrancar.
- **Modificación manual en el lockfile:** el hook `datos-que-no-salen` bloqueó el commit por un
  falso positivo, el correo real de un mantenedor dentro del aviso `deprecated` de una versión vieja
  de `glob` en `backend/package-lock.json`. El agente reemplazó ese texto por
  `mantenedor@example.com`. El bloqueo consta en `docs/seguridad/registro-de-bloqueos.md`. Un
  `npm install` posterior puede restaurar el texto original y volver a disparar el hook.

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
