import { defineConfig } from '@adonisjs/otel'
import env from '#start/env'

export default defineConfig({
  serviceName: env.get('APP_NAME', 'flowsync-backend'),
  serviceVersion: env.get('APP_VERSION', '0.0.1'),
  environment: env.get('APP_ENV', 'development'),
})
