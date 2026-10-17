import type { Task } from '@/lib/types'

type TaskProgressProps = {
  /** Las tareas que se están viendo, ya acotadas por el filtro. */
  tasks: readonly Task[]
}

/**
 * Qué parte de las tareas de la vista está en `done`. Cuenta solo lo que se
 * pinta: con la vista por defecto, que deja fuera las hechas, marcará 0 %, y
 * con el filtro «Hecho» marcará 100 %. Es lo que se pidió, no un descuido.
 *
 * Con la lista vacía no hay proporción que decir, así que no se pinta nada.
 */
export function TaskProgress({ tasks }: TaskProgressProps) {
  if (tasks.length === 0) return null

  const done = tasks.filter((task) => task.status === 'done').length
  const percent = Math.round((done / tasks.length) * 100)

  return (
    <div className="mb-3">
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="text-muted-foreground">
          {done} de {tasks.length}{' '}
          {tasks.length === 1 ? 'tarea hecha' : 'tareas hechas'}
        </span>
        <span className="font-medium tabular-nums">{percent} %</span>
      </div>
      <div
        className="bg-muted h-2 overflow-hidden rounded-full"
        role="progressbar"
        aria-label="Tareas hechas de las que se ven"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div
          className="bg-progress h-full rounded-full transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
