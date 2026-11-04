import { defineConfig } from '@adonisjs/otel'
import env from '#start/env'

export default defineConfig({
  serviceName: env.get('APP_NAME', 'flowsync-backend'),
  serviceVersion: env.get('APP_VERSION', '0.0.0'),
  environment: env.get('APP_ENV', env.get('NODE_ENV')),

  /**
   * Solo en desarrollo: producción todavía no tiene collector al que exportar, y
   * cada envío fallido acabaría como ruido en sus logs. Se abre cuando lo tenga.
   */
  enabled: env.get('NODE_ENV') === 'development',

  /**
   * Sin datos de la persona en los spans. Por defecto el paquete añade `user.id`,
   * `user.email` y `user.roles`, y el exportador `debug` del collector los
   * escribiría tal cual en los logs de Docker.
   */
  userContext: false,
})
