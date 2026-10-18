import Task from '#models/task'
import { test } from '@japa/runner'

/**
 * La regla de vencimiento, llamada directamente: `Task.isOverdueOn`. Vencida si,
 * y solo si, hay fecha, esa fecha es **anterior** al día de referencia y la tarea
 * no está `done` (requisito «Cuándo una tarea está vencida» de
 * `openspec/specs/tasks/spec.md`).
 *
 * Sin HTTP ni base de datos: la tarea se construye en memoria y nunca se guarda.
 * Todas las fechas son fijas; ningún test mira el reloj.
 */
test.group('Task | isOverdueOn', () => {
  const HOY = '2026-08-20'

  /** Una tarea en memoria, sin persistir. */
  function tarea(status: Task['status'], dueDate: Task['dueDate']): Task {
    const task = new Task()
    task.title = 'Revisar el informe'
    task.status = status
    task.dueDate = dueDate

    return task
  }

  /**
   * La fecha tal y como llega de PostgreSQL. El esquema generado declara
   * `dueDate: string | null`, pero el driver `pg` convierte por defecto una
   * columna `date` en un `Date` de JS a medianoche **local**: el tipo declarado
   * no es el valor que se recibe en ejecución. El `as unknown as string` no
   * oculta esa discrepancia, la reproduce, para poder probar la regla contra
   * lo que de verdad le llega al leer una tarea de la base.
   */
  function comoLlegaDeLaBase(anio: number, mes: number, dia: number): string {
    return new Date(anio, mes - 1, dia) as unknown as string
  }

  test('pendiente con fecha anterior al día de referencia: vencida', ({ assert }) => {
    assert.isTrue(tarea('pending', '2026-08-19').isOverdueOn(HOY))
  })

  test('pendiente con fecha igual al día de referencia: no vencida', ({ assert }) => {
    assert.isFalse(tarea('pending', '2026-08-20').isOverdueOn(HOY))
  })

  test('pendiente con fecha posterior al día de referencia: no vencida', ({ assert }) => {
    assert.isFalse(tarea('pending', '2026-08-21').isOverdueOn(HOY))
  })

  test('pendiente sin fecha: no vencida', ({ assert }) => {
    assert.isFalse(tarea('pending', null).isOverdueOn(HOY))
  })

  test('done con fecha anterior al día de referencia: no vencida', ({ assert }) => {
    assert.isFalse(tarea('done', '2026-08-19').isOverdueOn(HOY))
  })

  test('fecha anterior: mismo resultado como texto y como Date', ({ assert }) => {
    const comoTexto = tarea('pending', '2026-08-19').isOverdueOn(HOY)
    const comoDate = tarea('pending', comoLlegaDeLaBase(2026, 8, 19)).isOverdueOn(HOY)

    assert.isTrue(comoTexto)
    assert.isTrue(comoDate)
  })

  test('fecha igual: mismo resultado como texto y como Date', ({ assert }) => {
    const comoTexto = tarea('pending', '2026-08-20').isOverdueOn(HOY)
    const comoDate = tarea('pending', comoLlegaDeLaBase(2026, 8, 20)).isOverdueOn(HOY)

    assert.isFalse(comoTexto)
    assert.isFalse(comoDate)
  })

  test('fecha posterior: mismo resultado como texto y como Date', ({ assert }) => {
    const comoTexto = tarea('pending', '2026-08-21').isOverdueOn(HOY)
    const comoDate = tarea('pending', comoLlegaDeLaBase(2026, 8, 21)).isOverdueOn(HOY)

    assert.isFalse(comoTexto)
    assert.isFalse(comoDate)
  })
})
