import { defineConfig, destinations } from '@adonisjs/otel'
import env from '#start/env'

/**
 * Trazas por OTLP/HTTP al collector del servicio `observability` de
 * compose.yaml (`docker compose up -d observability`). Solo trazas: el
 * collector no tiene tuberías de métricas ni de logs y las rechazaría.
 *
 * Sin OTEL_EXPORTER_OTLP_ENDPOINT el SDK no arranca: así ni CI ni la imagen
 * de producción, que no tienen collector, intentan exportar a ningún sitio.
 * Con NODE_ENV=test tampoco arranca nunca (lo decide el paquete).
 */
const endpoint = env.get('OTEL_EXPORTER_OTLP_ENDPOINT')

export default defineConfig({
  enabled: endpoint !== undefined,
  serviceName: env.get('APP_NAME', 'flowsync-api'),
  serviceVersion: env.get('APP_VERSION', '0.0.1'),
  environment: env.get('APP_ENV', 'development'),
  destinations: endpoint ? { collector: destinations.otlp({ endpoint, signals: ['traces'] }) } : {},
})
