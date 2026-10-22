import type { Task } from '@/lib/types'

type TaskProgressProps = {
  tasks: readonly Task[]
}

/**
 * Qué parte de las tareas que se ven está hecha. Solo cuenta lo que recibe: si
 * la vista deja fuera las hechas, el porcentaje lo refleja tal cual.
 */
export function TaskProgress({ tasks }: TaskProgressProps) {
  if (tasks.length === 0) return null

  const doneCount = tasks.filter((task) => task.status === 'done').length
  const percentage = Math.round((doneCount / tasks.length) * 100)

  return (
    <div className="bg-background mb-4 rounded-lg border p-4">
      <div className="mb-2 flex items-baseline justify-between text-sm">
        <span id="task-progress-label" className="font-medium">
          Progreso
        </span>
        <span className="text-muted-foreground">
          {doneCount} de {tasks.length} hechas · {percentage}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-labelledby="task-progress-label"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        className="bg-muted h-2 overflow-hidden rounded-full"
      >
        <div
          className="bg-primary h-full rounded-full transition-[width]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
