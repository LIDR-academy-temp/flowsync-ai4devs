import Task, { type TaskStatus } from '#models/task'
import { DateTime } from 'luxon'
import { test } from '@japa/runner'

/**
 * La regla de «vencida» llamada directamente, sin servidor y sin base de datos: cada
 * test construye una `Task` en memoria y pregunta a `isOverdueOn`. Los bordes salen de
 * los scenarios del requisito «Cuándo una tarea está vencida» de
 * `openspec/specs/tasks/spec.md`, y los tests que salen de un scenario llevan su título.
 *
 * El día de referencia es un día fijo: ningún test mira el reloj.
 */
test.group('Task.isOverdueOn', () => {
  const HOY = '2026-08-20'
  const AYER = '2026-08-19'
  const MANANA = '2026-08-21'

  /**
   * Una tarea en memoria, sin guardar. La fecha se admite también como `Date` porque es
   * lo que pone en el modelo el driver `pg` al leer una columna `date` (sin type parser
   * propio la convierte en un `Date` a medianoche local), aunque el tipo declarado sea
   * `string | null`.
   */
  function tarea(status: TaskStatus, dueDate: string | Date | null) {
    const task = new Task()
    task.status = status
    task.dueDate = dueDate as string | null

    return task
  }

  /** El mismo día del calendario como lo entrega `pg`: medianoche en la hora local. */
  function comoObjeto(dia: string) {
    const [anio, mes, dd] = dia.split('-').map(Number)

    return new Date(anio, mes - 1, dd)
  }

  test('Fecha del día anterior', ({ assert }) => {
    assert.isTrue(tarea('pending', AYER).isOverdueOn(HOY))
  })

  test('Vencer hoy todavía no es estar vencida', ({ assert }) => {
    assert.isFalse(tarea('pending', HOY).isOverdueOn(HOY))
  })

  test('Fecha futura', ({ assert }) => {
    assert.isFalse(tarea('pending', MANANA).isOverdueOn(HOY))
  })

  test('Sin fecha no se vence nunca', ({ assert }) => {
    const task = tarea('pending', null)
    // «Creada hace semanas»: siete antes del día de referencia.
    task.createdAt = DateTime.fromISO('2026-07-01T09:00:00Z')

    assert.isFalse(task.isOverdueOn(HOY))
  })

  test('Una tarea hecha con la fecha pasada', ({ assert }) => {
    assert.isFalse(tarea('done', AYER).isOverdueOn(HOY))
  })

  // No es un scenario: sale de la regla del requisito, «su estado no es `done`». En curso
  // tampoco es hecha, así que con la fecha pasada vence igual que una pendiente.
  test('una tarea en curso con la fecha anterior sí está vencida', ({ assert }) => {
    assert.isTrue(tarea('in_progress', AYER).isOverdueOn(HOY))
  })

  // No sale de la spec: la regla no puede depender de cómo llegue la fecha al modelo.
  test('da lo mismo con la fecha como texto que como objeto de fecha', ({ assert }) => {
    for (const dia of [AYER, HOY, MANANA]) {
      const conTexto = tarea('pending', dia).isOverdueOn(HOY)
      const conObjeto = tarea('pending', comoObjeto(dia)).isOverdueOn(HOY)

      assert.strictEqual(conObjeto, conTexto, `fecha ${dia} contra ${HOY}`)
    }
  })
})
