import type { Task } from '@/lib/types'

type TaskProgressProps = {
  /** Las tareas que pinta la lista ahora mismo, ya pasadas por el filtro. */
  tasks: readonly Task[]
}

/**
 * Qué parte de lo que se ve está terminado. Se calcula sobre la lista tal como
 * se pinta, no sobre todo el equipo: en la vista por defecto, que deja fuera
 * las hechas, marca 0 %, y con el filtro «Hechas» marca 100 %.
 *
 * Solo se monta con alguna tarea delante: con la lista vacía no hay porcentaje
 * que dar, y un 0 % ahí se leería como «nada hecho» cuando no hay nada.
 */
export function TaskProgress({ tasks }: TaskProgressProps) {
  const done = tasks.filter((task) => task.status === 'done').length
  const percent = Math.round((done / tasks.length) * 100)

  return (
    <div className="mb-3 grid gap-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span id="task-progress-label" className="text-muted-foreground">
          Terminadas en esta vista
        </span>
        <span className="font-medium tabular-nums">
          {done} de {tasks.length} · {percent} %
        </span>
      </div>
      <div
        className="bg-progress/15 h-2 overflow-hidden rounded-full"
        role="progressbar"
        aria-labelledby="task-progress-label"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${percent} % (${done} de ${tasks.length})`}
      >
        <div
          className="bg-progress h-full rounded-full transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
