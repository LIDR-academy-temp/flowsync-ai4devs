import type { Task } from '@/lib/types'

type TaskProgressProps = {
  /** Las tareas que se están pintando, no las que trajo la API. */
  tasks: readonly Task[]
}

/**
 * Qué parte de lo que hay en pantalla está hecho. Se calcula sobre la lista
 * visible y nada más: con el filtro por defecto, que deja fuera las hechas,
 * marca 0 %, y con el de «Hecho», 100 %.
 */
export function TaskProgress({ tasks }: TaskProgressProps) {
  const done = tasks.filter((task) => task.status === 'done').length
  const percent = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0

  return (
    <div className="mb-3 grid gap-1.5">
      <div className="text-muted-foreground flex justify-between text-sm">
        <span id="task-progress-label">Hechas de las que ves</span>
        <span>
          {done} de {tasks.length} · {percent} %
        </span>
      </div>
      <div
        className="bg-primary/15 h-2 overflow-hidden rounded-full"
        role="progressbar"
        aria-labelledby="task-progress-label"
        aria-valuemin={0}
        aria-valuemax={tasks.length}
        aria-valuenow={done}
        aria-valuetext={`${done} de ${tasks.length} hechas`}
      >
        <div
          className="bg-primary h-full transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
