# Prompts

Aquí van **todos los prompts que lanzaste** para hacer el ejercicio, en el orden en que los
lanzaste, con el modelo y la herramienta de cada uno.

Esto no es papeleo. Lo que se revisa es **cómo pediste las cosas**, no solo lo que salió: un
resultado flojo con un prompt bueno y un resultado flojo con un prompt vago necesitan feedback
distinto, y sin este archivo no se distinguen.

## Cómo rellenarlo

- Un apartado `## Prompt N` por cada prompt.
- **Pega el prompt tal cual lo lanzaste**, dentro del bloque de código, aunque ocupe diez líneas
  y aunque tenga faltas. No lo reescribas para que quede bien: el que arreglaste mentalmente
  después no es el que lanzaste.
- Incluye también los que **no funcionaron**. Suelen ser los más útiles de leer.
- `Modelo` y `Herramienta` en todos. Si cambiaste de una a otra a mitad, se nota aquí.

Borra el ejemplo de abajo cuando escribas el primero.

---

## Prompt 1

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Actúa como desarrollador backend responsable de instrumentar FlowSync con OpenTelemetry y de demostrar con evidencia que el backend queda listo para enviar trazas a un recolector local.

NO modifiques ningún archivo en este paso. Solo explora y planifica.

Fuente de verdad (léela primero): CLAUDE.md, Makefile, compose.yaml, backend/bin/server.ts, backend/start/env.ts, backend/.env.example, backend/.env.test, .github/workflows/openapi.yml y package.json de backend/.

Enunciado de la Parte A (literal, no lo reinterpretes):
"""
1. Instrumenta el backend con el paquete oficial y añade a `compose.yaml` un servicio llamado `observability`, utilizando la imagen `otel/opentelemetry-collector-contrib:0.162.0`. Debe publicar los puertos **4317 y 4318** y tener un archivo de configuración con un receptor `otlp` para ambos protocolos y un exportador `debug` con `verbosity: detailed` en la tubería de trazas.
    
Con `detailed`, cada tramo muestra su identificador de traza, nombre y horas de inicio y fin. El nivel predeterminado solo muestra un recuento. **El nombre del servicio importa**, porque `docker compose up -d observability` permite arrancarlo sin tocar las bases de datos.


Hay tres detalles que debes vigilar:

- **La importación debe ser la primera línea.** El instalador añade `import '../otel.js'` al principio de `backend/bin/server.ts`. Si el agente la mueve o carga otros módulos antes, la instrumentación puede no activarse. **No aparece ningún error, pero tampoco llegan trazas.**
- **Tres variables nuevas en todos los entornos.** El instalador añade `APP_NAME`, `APP_VERSION` y `APP_ENV` a la validación. Deben estar en `backend/.env`, `backend/.env.example`, `backend/.env.test` y en el bloque `env:` de `.github/workflows/openapi.yml`, que arranca la aplicación en cada pull request. Si falta alguna, el arranque falla y la comprobación del pull request aparece en rojo. Utiliza `APP_NAME=flowsync-api` para identificar el servicio en las trazas.
- **El puerto correcto.** Configura `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318` en `backend/.env`. El puerto 4318 corresponde a OTLP mediante HTTP; el 4317 utiliza gRPC, un protocolo de llamadas remotas entre servicios. Si utilizas el puerto incorrecto, las trazas pueden no llegar sin mostrar un error evidente.

Respeta estas dos restricciones:

- **Instala el paquete con el comando del framework, no con** `npm install`**.** La instalación manual no genera ni registra todos los componentes necesarios.
- **No modifiques el frontend.** Este ejercicio se centra en el backend.

"""
Alcance: solo construir y configurar. Arrancar el recolector, generar tráfico y revisar las trazas lo hago yo. No leas ni resumas los logs del recolector, no crees subagentes, no modifiques el CI más allá de las tres variables y no escribas el SLO ni nada en docs/slo/.

Con eso, entregame:
1. Cada restricción y cada dato exacto (paquete, comando de instalación, nombre del servicio, imagen y versión, puertos, receptor, exportador, verbosity, variables y sus valores, endpoint) convertidos en requisitos verificables, con el comando que comprobaría cada uno.
2. Ambigüedades, formuladas como preguntas. No decidas por mí.
3. Archivos que vas a crear o modificar, con el motivo. Confirma que ninguno está en frontend/.
4. Riesgos que veas en el estado actual (orden de imports en server.ts, validación de env, workflow de CI, conflictos de puertos). Solo listalos.
```

## Prompt 2

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Plan aprobado. Impleméntalo.

Respuesta a tus preguntas: 
1. APP_ENV cargarla con development ya que el instalador no adminte test.
2. APP_VERSION: Usá el del package.json.
3. Archivo de configuración del recolector: Montarlo en| /etc/otelcol-contrib/config.yaml.
4. Puertos 4317 y 4318, como base de datos en 127.0.0.1 como db
5. Saltear la regla de uso de subagentes que indica uar Skill backend-feature y que está escrita en CLAUDE.md 
6. Haz el commit al terminar la construcción

Límites:
- Instala el paquete solo con `node ace add @adonisjs/otel`, ejecutado desde backend/. Nada de npm install.
- No toques nada en frontend/.
- `import '../otel.js'` debe quedar como primera línea de backend/bin/server.ts. No la muevas ni cargues otros módulos antes.
- APP_NAME=flowsync-api, APP_VERSION y APP_ENV deben estar en backend/.env, backend/.env.example, backend/.env.test y en el bloque env: de .github/workflows/openapi.yml. No cambies nada más del CI.
- OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 en backend/.env. backend/.env no se commitea.
- No arranques el recolector ni la app, y no leas sus logs: eso lo hago yo.
- Si haces commits, que sean en la rama actual, nunca en s14/start.
- Si algo no encaja con el plan o con el enunciado, detente y pregúntame en lugar de decidir.

Criterios de aceptación (cada uno con comando y salida real):
1. `head -1 backend/bin/server.ts` muestra `import '../otel.js'`.
2. `grep -n "APP_NAME\|APP_VERSION\|APP_ENV"` sobre los 4 archivos muestra las 3 variables en cada uno, con APP_NAME=flowsync-api.
3. `grep OTEL_EXPORTER_OTLP_ENDPOINT backend/.env` muestra http://localhost:4318.
4. `docker compose config` valida y muestra el servicio observability con la imagen otel/opentelemetry-collector-contrib:0.162.0 y los puertos 4317 y 4318.
5. El archivo de configuración del recolector tiene un receptor otlp con grpc y http, el exportador debug con verbosity: detailed y la pipeline de traces que los une. Muestra el archivo.
6. `make test` pasa. Si algo falla, repórtalo tal cual; no lo silencies ni ajustes tests para que pasen.
7. `git diff --stat` (y `git log --oneline` si hiciste commits) no muestra cambios en frontend/ ni en backend/.env.

Entrega: tabla criterio | esperado | observado | evidencia (comando + salida). Lo no comprobado va como PENDIENTE. Al final, lista qué podría impedir que lleguen las trazas aunque todo esté en verde.
```

## Prompt 3

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Actúa como responsable de definir un SLO que se pueda medir con los datos que ya emite el backend de FlowSync.

Escribe el SLO en docs/slo/api.md. No modifiques ningún otro archivo.

Requisitos del enunciado:
"""
Definirás un objetivo de nivel de servicio (Service Level Objective, SLO) en docs/slo/api.md, exclusivamente para las rutas de /api/v1/tasks, con estos valores:

- Indicador (Service Level Indicator, SLI): fracción de peticiones a esas rutas que responden con un código inferior a 500 y tardan menos de 500 milisegundos.

- Objetivo: al menos el 99 % de esas peticiones deben cumplir el indicador durante una ventana móvil de 28 días.

- Presupuesto de error: calcula cuántas peticiones pueden incumplir el objetivo, suponiendo 20.000 peticiones durante la ventana.


El documento debe incluir cuatro elementos:

1. El indicador como fracción, con numerador y denominador, utilizando la ruta, el código de respuesta y la duración de cada petición.

2. El objetivo del 99 % y su ventana móvil de 28 días.

3. El presupuesto de error expresado en peticiones, calculado con el volumen supuesto de 20.000 peticiones. Debe quedar claro que ese volumen se sustituirá por el real.

3. Una única alerta basada en un problema que percibe el usuario, no en una causa interna. Debe avisar cuando el ritmo de consumo del presupuesto indique que se agotará antes de terminar la ventana.

Rutas quedan fuera del objetivo: todas las que no pertenezcan a /api/v1/tasks, como el registro y el inicio de sesión. Si necesitas medirlas, deberán tener su propio objetivo y presupuesto.
"""

Criterios para dar el documento por terminado:
1. El indicador aparece como fracción, con un numerador y un denominador definidos por ruta, código de respuesta y duración de cada petición.
2. El objetivo es 99 % en una ventana móvil de 28 días.
3. El presupuesto de error está expresado en peticiones, con el cálculo a la vista, y aclara que 20.000 es un volumen supuesto que se reemplazará por el real.
4. Hay una sola alerta, basada en lo que percibe el usuario y disparada por el ritmo de consumo del presupuesto.
5. Hay una sección con las rutas que quedan fuera, que dice que si se quieren medir necesitan su propio objetivo y presupuesto.

Si algo del enunciado es ambiguo, pregúntame en lugar de decidir. Al terminar, muéstrame el archivo completo y `git diff --stat`.
```
