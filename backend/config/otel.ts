import { defineConfig, destinations } from '@adonisjs/otel'
import env from '#start/env'

/**
 * OpenTelemetry. Cada petición abre una traza (instrumentación HTTP + el
 * `otel_middleware` de `start/kernel.ts`) y todo lo que ocurre dentro cuelga
 * de ella con el mismo `trace_id`. En la suite de tests está apagado (lo
 * decide el paquete cuando `NODE_ENV=test`).
 *
 * Destino: el servicio `observability` de `compose.yaml` (OpenTelemetry
 * Collector), por OTLP/HTTP en el 4318. Solo se mandan trazas porque el
 * collector solo tiene la tubería de trazas; métricas y logs no tienen destino.
 */
export default defineConfig({
  serviceName: env.get('APP_NAME', 'flowsync-backend'),
  serviceVersion: env.get('APP_VERSION', '0.0.0'),
  environment: env.get('APP_ENV', 'development'),

  destinations: {
    collector: destinations.otlp({
      endpoint: env.get('OTEL_EXPORTER_OTLP_ENDPOINT', 'http://localhost:4318'),
      signals: ['traces'],
    }),
  },

  /**
   * Por defecto el middleware pone en cada tramo el `id`, el `email` y el
   * `role` de quien hace la petición. Nos quedamos solo con el `id`: el
   * exportador `debug` imprime los tramos enteros en los logs del collector.
   */
  userContext: {
    resolver: (ctx) => (ctx.auth?.user ? { id: ctx.auth.user.id } : null),
  },

  instrumentations: {
    /**
     * Pino es el logger de AdonisJS. La instrumentación oficial añade
     * `trace_id`, `span_id` y `trace_flags` a cada línea escrita dentro de una
     * petición, para cruzar logs y trazas. No reenvía los logs por OTLP: no
     * hay tubería de logs en el collector.
     */
    '@opentelemetry/instrumentation-pino': {
      disableLogSending: true,
    },

    /**
     * El paquete la trae apagada. Encendida, cada consulta de Lucid sale como
     * tramo hijo de la petición que la lanzó.
     */
    '@opentelemetry/instrumentation-pg': {
      enabled: true,
    },
  },
})
