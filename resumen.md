# Resumen del ejercicio

**Herramienta y modelo:** Claude Code con Opus 5.5 High, en cuatro prompts.

## Qué se pidió

1. Instrumentar el backend con OpenTelemetry y añadir el collector `observability` a `compose.yaml`.
2. Identificar la traza más lenta.
3. Definir el SLO de la API de tareas en `docs/slo/api.md`.
4. Calcular el presupuesto de error y valorarlo frente a aplicaciones similares.

## Qué salió

- **Instrumentación:** se usó `@adonisjs/otel`, activo solo en desarrollo, sin datos de usuario en los spans y con los puertos 4317 y 4318 solo en loopback. Las trazas llegaron al collector.
- **Traza más lenta:** `POST /api/v1/auth/signup`, con 321,3 ms, de los que solo 7,6 ms son de base de datos. Le siguen `POST /api/v1/auth/login` (118,6 ms) y `GET /api/v1/account/profile` (75,4 ms).
- **SLO:** 99 % de peticiones a `/api/v1/tasks` con código menor que 500 y duración de 500 ms o menos, en una ventana móvil de 28 días. El límite de 500 ms es una suposición, porque el prompt no lo indicaba. Hay una sola alerta, con ritmo de consumo mayor que 1 medido en 24 horas.
- **Presupuesto de error:** 200 peticiones malas cada 28 días, sobre un volumen supuesto de 20.000.

## Conclusión

Con unas 1.000 peticiones por día laborable y 6 personas, el presupuesto equivale a 1 h 36 min de caída en horario laboral cada 28 días, o unas 1,7 peticiones malas por persona y día. Es razonable para un MVP, aunque aplicaciones similares se comprometen al 99,9 %. Subir a ese objetivo dejaría unos 10 minutos de margen, que un solo despliegue fallido podría agotar. Se revisará con 28 días de datos reales y, si hay holgura, se podría subir a 99,5 %.

## Limitación

El SLO todavía no se puede medir: producción no envía telemetría y el exportador `debug` solo escribe en los logs, sin guardar series para calcular 28 días ni evaluar la alerta.
