import type { Task } from '@/lib/types'

type TaskProgressProps = {
  tasks: readonly Task[]
}

/**
 * Qué parte de las tareas que se están viendo está hecha. Cuenta lo que recibe,
 * no lo que hay en el servidor: si la vista deja fuera las hechas, el progreso
 * será 0 % y no es un fallo.
 */
export function TaskProgress({ tasks }: TaskProgressProps) {
  const total = tasks.length
  if (total === 0) return null

  const done = tasks.filter((task) => task.status === 'done').length
  const percent = Math.round((done / total) * 100)
  const summary = `${done} de ${total} ${total === 1 ? 'tarea hecha' : 'tareas hechas'}`

  return (
    <div className="mb-3">
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span id="task-progress-label" className="font-medium">
          Progreso
        </span>
        <span className="text-muted-foreground">
          {summary} · {percent} %
        </span>
      </div>
      <div
        role="progressbar"
        aria-labelledby="task-progress-label"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${summary} (${percent} %)`}
        className="bg-muted h-2 overflow-hidden rounded-full"
      >
        <div
          className="h-full bg-[#1D4ED8] w-full origin-left transition-transform motion-reduce:transition-none"
          style={{ transform: `scaleX(${percent / 100})` }}
        />
      </div>
    </div>
  )
}
