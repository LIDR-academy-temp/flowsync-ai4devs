import type { Task } from '@/lib/types'

type TaskProgressProps = {
  /** Las tareas que se están viendo ahora mismo, ya pasadas por el filtro. */
  tasks: readonly Task[]
}

/**
 * Qué parte de lo que hay en pantalla está hecho. Se calcula sobre las tareas
 * visibles y no sobre todas las del equipo: la barra describe la vista, igual
 * que el listado que tiene debajo.
 */
export function TaskProgress({ tasks }: TaskProgressProps) {
  const total = tasks.length
  const done = tasks.filter((task) => task.status === 'done').length
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <div className="mb-4 grid gap-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span id="task-progress-label" className="font-medium">
          Progreso
        </span>
        <span className="text-muted-foreground">
          {done} de {total} hechas · {percent}%
        </span>
      </div>
      <div
        className="bg-muted h-2 overflow-hidden rounded-full"
        role="progressbar"
        aria-labelledby="task-progress-label"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${done} de ${total} tareas hechas`}
      >
        <div
          className="bg-progress h-full rounded-full transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
