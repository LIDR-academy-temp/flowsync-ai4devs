import Task from '#models/task'
import { test } from '@japa/runner'
import type { TaskStatus } from '#models/task'

/**
 * La regla de «vencida» llamada directamente: `Task#isOverdueOn` sobre una
 * instancia en memoria. Sin servidor, sin base de datos: el modelo nunca se
 * guarda ni se consulta.
 *
 * El día de referencia es siempre un literal fijo; ningún test mira el reloj.
 */
test.group('Task.isOverdueOn', () => {
  const HOY = '2026-08-20'
  const AYER = '2026-08-19'
  const MANANA = '2026-08-21'

  function tarea(dueDate: string | null, status: TaskStatus = 'pending') {
    const task = new Task()
    task.dueDate = dueDate
    task.status = status
    return task
  }

  test('fecha anterior al día de referencia y sin hacer: vencida', ({ assert }) => {
    assert.isTrue(tarea(AYER).isOverdueOn(HOY))
  })

  test('fecha igual al día de referencia: no vencida', ({ assert }) => {
    assert.isFalse(tarea(HOY).isOverdueOn(HOY))
  })

  test('fecha posterior al día de referencia: no vencida', ({ assert }) => {
    assert.isFalse(tarea(MANANA).isOverdueOn(HOY))
  })

  test('sin fecha: no vencida', ({ assert }) => {
    assert.isFalse(tarea(null).isOverdueOn(HOY))
  })

  test('hecha (done) con la fecha pasada: no vencida', ({ assert }) => {
    assert.isFalse(tarea(AYER, 'done').isOverdueOn(HOY))
  })

  /**
   * No sale de la spec. La columna `due_date` es `date` en PostgreSQL y el
   * driver `pg` (pg-types, OID 1082 → postgres-date) la entrega como un `Date`
   * de JavaScript a medianoche **local**, aunque `database/schema.ts` declare
   * `string`: `@column()` sin `consume` deja pasar el valor tal cual. Así que
   * una tarea leída de la base trae un `Date`, y la regla tiene que dar la
   * misma respuesta que con el texto `AAAA-MM-DD`.
   *
   * `new Date(año, mesBase0, día)` construye exactamente ese objeto (medianoche
   * local) con valores literales, sin reloj.
   */
  test('da lo mismo con dueDate como texto AAAA-MM-DD que como Date de pg', ({ assert }) => {
    const casos: Array<[string, Date]> = [
      [AYER, new Date(2026, 7, 19)],
      [HOY, new Date(2026, 7, 20)],
      [MANANA, new Date(2026, 7, 21)],
    ]

    for (const [texto, fecha] of casos) {
      const comoTexto = tarea(texto).isOverdueOn(HOY)
      // El tipo declarado es `string | null`; en ejecución llega un `Date`.
      const comoDate = tarea(fecha as unknown as string).isOverdueOn(HOY)

      assert.equal(comoDate, comoTexto, `dueDate ${texto} como Date frente a como texto`)
    }
  })
})
