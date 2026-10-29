import { healthChecks } from '#start/health'
import { HealthResponse } from '#openapi/schemas'
import type { HttpContext } from '@adonisjs/core/http'
import { ApiOperation, ApiResponse } from '@foadonis/openapi/decorators'
import HealthReportTransformer from '#transformers/health_report_transformer'

export default class HealthChecksController {
  /**
   * Comprobación de vida para la plataforma que despliega la API: dice si puede
   * trabajar, no solo si el proceso responde (eso ya lo dice `GET /`).
   *
   * Sin sesión, porque quien la llama es la plataforma. Por eso la respuesta
   * pasa por `HealthReportTransformer` y no es el informe entero.
   */
  @ApiOperation({
    summary: 'Comprobar que la API puede trabajar',
    description:
      'Ejecuta las comprobaciones de `start/health.ts` (hoy, la conexión a la base de datos) y responde 200 si todas pasan y 503 si alguna falla. No pide sesión. Solo devuelve el estado global y el de cada comprobación: ni mensajes de error, ni datos de la conexión, ni del proceso.',
  })
  @ApiResponse({
    status: 200,
    description: 'Todas las comprobaciones pasan.',
    type: () => HealthResponse,
  })
  @ApiResponse({
    status: 503,
    description: 'Alguna comprobación falla; su `status` es `error`. Mismo cuerpo que el 200.',
    type: () => HealthResponse,
  })
  async show({ response, serialize }: HttpContext) {
    const report = await healthChecks.run()

    // Como en `TasksController.store`: el estado se marca aparte porque
    // `serialize()` entrega una promesa, y pasársela a
    // `response.serviceUnavailable()` dejaría el cuerpo vacío.
    response.status(report.isHealthy ? 200 : 503)
    return serialize(HealthReportTransformer.transform(report))
  }
}
