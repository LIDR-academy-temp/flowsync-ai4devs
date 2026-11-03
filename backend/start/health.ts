import db from '@adonisjs/lucid/services/db'
import { HealthChecks } from '@adonisjs/core/health'
import { DbCheck } from '@adonisjs/lucid/database'

/**
 * Comprobaciones que dicen si la API puede trabajar, no solo si responde.
 *
 * Solo la base de datos: sin ella no hay nada que servir. Las de disco y
 * memoria que trae `node ace configure health_checks` se quitaron a propósito:
 * sus umbrales por defecto miden la máquina, no la aplicación, y en un
 * contenedor darían 503 por motivos ajenos a FlowSync.
 */
export const healthChecks = new HealthChecks().register([new DbCheck(db.connection())])
