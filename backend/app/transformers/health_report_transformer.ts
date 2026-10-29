import { BaseTransformer } from '@adonisjs/core/transformers'
import type { HealthCheckReport } from '@adonisjs/core/types/health'

/**
 * El informe de `GET /health` tal y como sale de la API: el estado global y el
 * de cada comprobación, `{ status, checks: [{ name, status }] }`, y nada más.
 *
 * La ruta no pide sesión, y el informe completo de `healthChecks.run()` no se
 * puede enseñar a cualquiera: lleva `debugInfo` (pid, plataforma, versión de
 * Node) y, cuando `DbCheck` falla, el mensaje y el objeto de error del driver,
 * que pueden incluir el host y el puerto de la base. Esto es una lista blanca:
 * un campo nuevo del informe no sale hasta que alguien lo añade aquí.
 */
export default class HealthReportTransformer extends BaseTransformer<HealthCheckReport> {
  toObject() {
    return {
      status: this.resource.status,
      checks: this.resource.checks.map((check) => ({ name: check.name, status: check.status })),
    }
  }
}
