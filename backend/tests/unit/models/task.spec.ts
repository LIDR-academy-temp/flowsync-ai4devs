import Task, { type TaskStatus } from '#models/task'
import { test } from '@japa/runner'
import { builtins, getTypeParser } from 'pg-types'

/**
 * La regla de «vencida», llamada directamente: `Task.isOverdueOn`, sin servidor ni base
 * de datos. Son los bordes del requisito «Cuándo una tarea está vencida» de
 * `openspec/specs/tasks/spec.md`, que por HTTP salen caros.
 *
 * El último caso no sale de la spec: la regla tiene que dar lo mismo reciba la fecha
 * como texto, que es como la asigna `PUT /tasks/:id/due-date`, o como el objeto que
 * entrega el conector al leer la columna `date`. Ese objeto no se construye a mano: lo
 * produce el parser que `pg` tiene registrado para el tipo `DATE` (`pg.types` es este
 * mismo módulo `pg-types`), y la tarea se hidrata desde la fila con
 * `$createFromAdapterResult`, que es lo que hace Lucid con cada fila que lee.
 */
test.group('Task.isOverdueOn', () => {
  const HOY = '2026-08-20'
  const AYER = '2026-08-19'
  const MANANA = '2026-08-21'

  const SIN_HACER: TaskStatus[] = ['pending', 'in_progress']

  const tarea = (dueDate: string | null, status: TaskStatus) =>
    new Task().merge({ dueDate, status })

  test('fecha anterior al día de referencia, y la tarea sin hacer', ({ assert }) => {
    for (const status of SIN_HACER) {
      assert.isTrue(tarea(AYER, status).isOverdueOn(HOY), status)
    }
  })

  test('fecha exactamente igual al día de referencia', ({ assert }) => {
    for (const status of SIN_HACER) {
      assert.isFalse(tarea(HOY, status).isOverdueOn(HOY), status)
    }
  })

  test('fecha posterior al día de referencia', ({ assert }) => {
    for (const status of SIN_HACER) {
      assert.isFalse(tarea(MANANA, status).isOverdueOn(HOY), status)
    }
  })

  test('sin fecha', ({ assert }) => {
    for (const status of SIN_HACER) {
      assert.isFalse(tarea(null, status).isOverdueOn(HOY), status)
    }
  })

  test('tarea ya hecha, con la fecha pasada', ({ assert }) => {
    assert.isFalse(tarea(AYER, 'done').isOverdueOn(HOY))
  })

  test('da lo mismo con la fecha en texto que con la que entrega PostgreSQL', ({ assert }) => {
    const leerColumnaDate = getTypeParser(builtins.DATE, 'text')

    const conTexto: Record<string, boolean> = {}
    const leidaDeLaBase: Record<string, boolean> = {}

    for (const dia of [AYER, HOY, MANANA]) {
      const deLaBase = Task.$createFromAdapterResult({
        id: 1,
        title: 'Revisar el informe',
        status: 'pending',
        due_date: leerColumnaDate(dia),
      })!

      // Lo que de verdad llega al modelo, aunque el esquema generado lo declare `string`.
      assert.instanceOf(deLaBase.dueDate as unknown, Date)

      conTexto[dia] = tarea(dia, 'pending').isOverdueOn(HOY)
      leidaDeLaBase[dia] = deLaBase.isOverdueOn(HOY)
    }

    assert.deepEqual(leidaDeLaBase, conTexto)
  })
})
