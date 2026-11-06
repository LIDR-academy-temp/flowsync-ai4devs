/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  // Node
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  // App
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string({ format: 'url', tld: false }),

  // Session
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory', 'database'] as const),

  // Base de datos (PostgreSQL en Docker, ver compose.yaml en la raíz)
  DB_HOST: Env.schema.string(),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.secret(),
  DB_DATABASE: Env.schema.string(),

  // Observabilidad (OpenTelemetry). Con valor por defecto para que CI y los
  // clones sin .env sigan arrancando. El exportador OTLP lo configura el SDK
  // con las variables estándar OTEL_* (ver .env.example), no este schema.
  APP_NAME: Env.schema.string.optional(),
  APP_VERSION: Env.schema.string.optional(),
  APP_ENV: Env.schema.enum.optional(['development', 'staging', 'production'] as const),
})
