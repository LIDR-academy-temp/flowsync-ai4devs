import Task, { type TaskStatus } from '#models/task'
import { test } from '@japa/runner'

/**
 * La regla de «vencida», `Task.isOverdueOn`, sin servidor ni base de datos: se
 * instancia el modelo en memoria y se le pregunta. Los casos son los bordes de
 * la regla del requisito «Cuándo una tarea está vencida» de
 * `openspec/specs/tasks/spec.md`: hay fecha, es **anterior** al día de
 * referencia, y la tarea no está hecha.
 *
 * Las fechas son fijas y el día de referencia se pasa siempre por parámetro:
 * ningún test depende del reloj.
 */
test.group('Task.isOverdueOn', () => {
  const DIA_DE_REFERENCIA = '2026-08-20'
  const DIA_ANTERIOR = '2026-08-19'
  const DIA_POSTERIOR = '2026-08-21'

  /** Una tarea en memoria con solo lo que la regla mira. */
  function tarea(dueDate: string | Date | null, status: TaskStatus = 'pending'): Task {
    const task = new Task()
    // `dueDate` está tipada `string | null`; el cast existe solo para el caso
    // en que el dato viaja como `Date`.
    task.dueDate = dueDate as string | null
    task.status = status

    return task
  }

  test('con fecha anterior al día de referencia y sin hacer está vencida', ({ assert }) => {
    assert.strictEqual(tarea(DIA_ANTERIOR).isOverdueOn(DIA_DE_REFERENCIA), true)
  })

  test('con fecha igual al día de referencia no está vencida', ({ assert }) => {
    assert.strictEqual(tarea(DIA_DE_REFERENCIA).isOverdueOn(DIA_DE_REFERENCIA), false)
  })

  test('con fecha posterior al día de referencia no está vencida', ({ assert }) => {
    assert.strictEqual(tarea(DIA_POSTERIOR).isOverdueOn(DIA_DE_REFERENCIA), false)
  })

  test('sin fecha no está vencida', ({ assert }) => {
    assert.strictEqual(tarea(null).isOverdueOn(DIA_DE_REFERENCIA), false)
  })

  test('hecha, con la fecha ya pasada, no está vencida', ({ assert }) => {
    assert.strictEqual(tarea(DIA_ANTERIOR, 'done').isOverdueOn(DIA_DE_REFERENCIA), false)
  })

  // Fuera de spec: criterio técnico. Un día del calendario puede llegar al
  // modelo como texto `AAAA-MM-DD` o como `Date` (así lo entregan algunos
  // drivers para una columna `date`). La regla tiene que dar la misma lectura
  // con las dos formas, en cada lado del borde.
  const FORMAS = [
    { nombre: 'anterior', dia: DIA_ANTERIOR },
    { nombre: 'igual', dia: DIA_DE_REFERENCIA },
    { nombre: 'posterior', dia: DIA_POSTERIOR },
  ]

  for (const { nombre, dia } of FORMAS) {
    test(`con fecha ${nombre} da la misma lectura como texto que como Date`, ({ assert }) => {
      const comoTexto = tarea(dia).isOverdueOn(DIA_DE_REFERENCIA)
      const comoDate = tarea(new Date(`${dia}T00:00:00Z`)).isOverdueOn(DIA_DE_REFERENCIA)

      assert.strictEqual(comoDate, comoTexto)
    })
  }
})
