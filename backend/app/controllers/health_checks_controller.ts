import { healthChecks } from '#start/health'
import type { HttpContext } from '@adonisjs/core/http'

export default class HealthChecksController {
  /**
   * 200 solo si todas las comprobaciones salen `ok`; un `warning` también da
   * 503. Del informe solo viajan el estado global y el de cada comprobación:
   * `debugInfo` lleva versión de Node, pid y plataforma, y el `message` y el
   * `meta` de un fallo de `DbCheck` llevan el error del driver (host y puerto
   * incluidos) con su stack.
   */
  async show({ response, serialize }: HttpContext) {
    const report = await healthChecks.run()

    response.status(report.status === 'ok' ? 200 : 503)

    return serialize.withoutWrapping({
      status: report.status,
      checks: report.checks.map(({ name, status }) => ({ name, status })),
    })
  }
}
