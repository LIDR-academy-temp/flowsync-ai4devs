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

```text
Necesito instrumentar el backend de FlowSync con OpenTelemetry siguiendo estrictamente los requisitos del ejercicio.

ALCANCE:
Trabaja exclusivamente sobre el backend (backend/), la configuración de Docker Compose y los archivos de configuración expresamente indicados.

1. INSTALACIÓN

- Instala el paquete oficial @adonisjs/otel utilizando el comando del framework:
  node ace add @adonisjs/otel
- Ejecuta el comando desde backend/.
- No utilices npm install para instalar este paquete.
- Revisa los cambios generados por el instalador antes de continuar.

2. OPENTELEMETRY COLLECTOR

Modifica compose.yaml para incorporar un servicio llamado observability.

Requisitos:
- Imagen: otel/opentelemetry-collector-contrib:0.162.0.
- Publicar los puertos 4317 y 4318.
- Montar un archivo de configuración del collector.
- Configurar un receptor OTLP que admita gRPC y HTTP.
- Configurar un exportador debug con verbosity: detailed.
- Configurar la tubería de trazas (traces) utilizando el receptor y el exportador anteriores.

El servicio debe poder iniciarse independientemente mediante:
docker compose up -d observability

No debe requerir que se levanten las bases de datos.

3. VARIABLES DE ENTORNO

Asegúrate de incorporar las siguientes variables en:
- backend/.env
- backend/.env.example
- backend/.env.test
- El bloque env: de .github/workflows/openapi.yml.

Variables:
- APP_NAME=flowsync-api
- APP_VERSION: utiliza un valor coherente con la versión del backend.
- APP_ENV: utiliza el entorno correspondiente a cada archivo.

En backend/.env configura además:
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318

No incluyas backend/.env en ningún commit.

4. ORDEN DE INICIALIZACIÓN

Verifica que backend/bin/server.ts tenga:
import '../otel.js'

como su primera línea, antes de cualquier otra importación o inicialización.

5. RESTRICCIONES

- No modifiques el frontend.
- No cambies rutas ni controladores funcionales.
- No modifiques la integración continua fuera de las tres variables indicadas en su bloque env:.
- No corrijas manualmente problemas detectados sin investigar primero su causa.
- No crees subagentes.
- No implementes todavía el SLO.
- No leas ni resumas los logs del collector.

6. VALIDACIÓN

Al finalizar:
1. Comprueba que el backend instala y arranca correctamente.
2. Verifica que el collector puede levantarse independientemente.
3. Comprueba que la importación de OpenTelemetry sigue siendo la primera línea de server.ts.
4. Comprueba que las tres variables están presentes en todos los archivos indicados.
5. Informa qué archivos modificaste y qué validaciones ejecutaste.
6. Identifica cualquier problema pendiente sin intentar ocultarlo.

No continúes con la generación de tráfico ni con la inspección de trazas. Espera mi siguiente instrucción.
```

**Qué salió:** Qué salió: La instrumentación de OpenTelemetry funcionó correctamente. Se identificaron 13 Trace ID únicos en los registros del Collector, evidenciando la recepción de trazas correspondientes a peticiones HTTP como GET /api/v1/tasks y POST /api/v1/tasks, además de spans asociados a operaciones SQL. Esto permitió comprobar la propagación de trazas entre las solicitudes del backend y las operaciones de base de datos.

## Prompt 2

**Modelo:** Opus 1M xHigh  
**Herramienta:** Claude Code

```text
Necesito documentar un Service Level Objective (SLO) para la API de FlowSync.
Crea el archivo:
`docs/slo/api.md`

### Requisitos del SLO
El objetivo debe aplicarse exclusivamente a las rutas pertenecientes a:
`/api/v1/tasks`

### 1. Service Level Indicator (SLI)

Define el indicador como una fracción:

- Numerador: número de peticiones a las rutas `/api/v1/tasks` que responden con un código HTTP inferior a 500 y tienen una duración inferior a 500 milisegundos.
- Denominador: total de peticiones realizadas a esas mismas rutas durante el período evaluado.

Expresa matemáticamente el indicador.

### 2. Objetivo

- Disponibilidad y rendimiento combinados mediante el SLI anterior.
- Objetivo: al menos 99 %.
- Ventana de evaluación: ventana móvil de 28 días.

### 3. Error Budget

Supón un volumen de 20.000 peticiones durante la ventana.

Calcula el presupuesto de error en cantidad de peticiones y explica el cálculo.

Debe quedar explícito que las 20.000 peticiones son un volumen hipotético y que en una implementación real el cálculo debe utilizar el volumen efectivo de peticiones durante la ventana.

### 4. Alerta

Define una única alerta orientada al usuario.

Debe activarse cuando el ritmo de consumo del presupuesto de error indique que se agotará antes de finalizar la ventana de 28 días.

No definas alertas sobre causas internas como CPU, memoria o consultas lentas.

### 5. Exclusiones

Indica expresamente que todas las rutas que no pertenezcan a `/api/v1/tasks` quedan fuera de este SLO.

Incluye como ejemplos:
- Registro.
- Inicio de sesión.

Explica que estas rutas necesitarían su propio SLI, SLO y presupuesto de error si se requiere medirlas.

### Restricciones

- No cambies las rutas.
- No cambies los valores establecidos.
- No implementes mecanismos de monitorización adicionales.
- No modifiques el backend ni el frontend.
- No crees dashboards nialertas reales.
- Limítate a documentar el SLO.

Al finalizar, revisa que el documento incluya los cuatro elementos solicitados y que el presupuesto de error esté expresado en peticiones.
```

**Qué salió:** Se generó `docs/slo/api.md` con la definición del SLO para las rutas `/api/v1/tasks`. Se estableció un objetivo de cumplimiento ≥99 %, una ventana móvil de 28 días y un SLI que combina disponibilidad (HTTP <500) y rendimiento (latencia <500 ms). Se documentó un presupuesto de error del 1 %, equivalente a 200 peticiones malas para un volumen hipotético de 20.000, además de una estrategia de alerta basada en burn rate con ventanas de 6 horas y 30 minutos. También se especificaron las rutas incluidas y excluidas del SLO. La definición quedó documentada, pero todavía no se implementaron métricas, dashboards ni alertas reales.



## Prompt 3

**Modelo:** Opus 1M xHigh  
**Herramienta:** Claude Code

```text
Realiza una validación técnica de la instrumentación de OpenTelemetry y de su compatibilidad con el SLO documentado en `docs/slo/api.md`.

**CONTEXTO**

El SLO establece:
- Alcance: rutas `/api/v1/tasks`.
- Objetivo: ≥99 %.
- Ventana móvil: 28 días.
- Una petición buena debe tener HTTP <500 y duración <500 ms.

**VALIDACIONES**

1. Inspecciona la configuración de OpenTelemetry y los spans HTTP generados.
2. Comprueba si es posible identificar las rutas, códigos HTTP y duración de cada petición.
3. Verifica si las trazas permiten distinguir las operaciones HTTP de los spans SQL.
4. Determina si la información disponible permite calcular el SLI definido o si existen limitaciones.
5. Diferencia los datos efectivamente observados de aquellos que solamente están disponibles como configuración.
6. Identifica cualquier brecha entre la instrumentación actual y los requisitos del SLO.

**RESTRICCIONES**

- No modifiques código ni configuración.
- No implementes métricas, dashboards ni alertas.
- No modifiques `docs/slo/api.md`.
- No inventes datos ni resultados.
- No confundas Trace ID con cantidad de peticiones.

Entrega un informe breve con las validaciones realizadas, evidencias encontradas y limitaciones pendientes.
```

**Qué salió:** Se validó que OpenTelemetry captura correctamente los datos necesarios para evaluar el SLI por petición: ruta, código HTTP y duración. Se analizaron 62 spans, correspondientes a 13 trazas, identificando 13 spans HTTP y 49 spans SQL. De los spans HTTP, 9 correspondieron a `/api/v1/tasks` y cumplieron las condiciones del SLI observado. Se identificó que la instrumentación permite analizar peticiones individuales, pero no calcular el SLO de 28 días debido a la ausencia de almacenamiento persistente, agregación de métricas y consultas por ventana temporal. También se documentaron limitaciones relacionadas con muestreo, pérdida de spans, rutas inexistentes y ausencia de escenarios con errores 5xx.