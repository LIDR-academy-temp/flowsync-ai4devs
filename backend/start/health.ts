import db from '@adonisjs/lucid/services/db'
import { DbCheck } from '@adonisjs/lucid/database'
import { HealthChecks } from '@adonisjs/core/health'

/**
 * Comprobaciones de `GET /health`: lo que tiene que funcionar para que la API
 * pueda trabajar, no solo responder.
 *
 * Hoy es solo la base de datos: sin ella ninguna ruta de `/api/v1` sirve. El
 * scaffolding de `node ace configure health_checks` trae también
 * `DiskSpaceCheck` y `MemoryHeapCheck`, y se quitan a propósito: miden la
 * máquina, no la aplicación, y un umbral de disco del anfitrión haría que la
 * plataforma reiniciara una API que funciona.
 */
export const healthChecks = new HealthChecks().register([new DbCheck(db.connection())])
