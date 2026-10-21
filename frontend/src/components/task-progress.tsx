import { Progress } from '@/components/ui/progress'
import type { Task } from '@/lib/types'

type TaskProgressProps = {
  /**
   * Lo que se está viendo más lo que se ha cerrado desde esta vista. Las que
   * se marcan como hechas salen de la vista por defecto, y si dejaran también
   * de contar la barra se quedaría clavada en 0 %: justo al cerrar una tarea,
   * que es cuando tiene que avanzar.
   */
  tasks: readonly Task[]
}

/**
 * Qué parte de lo que se está viendo ya está hecho. No es el avance del
 * equipo entero: la base es lo que ha traído el filtro activo.
 */
export function TaskProgress({ tasks }: TaskProgressProps) {
  const total = tasks.length
  const done = tasks.filter((task) => task.status === 'done').length
  const percent = Math.round((done / total) * 100)
  const summary =
    total === 1
      ? `${done} de 1 tarea hecha`
      : `${done} de ${total} tareas hechas`

  return (
    <div className="mb-4 grid gap-2">
      <div className="flex items-baseline justify-between text-sm">
        <span id="task-progress-label" className="font-medium">
          Progreso de esta vista
        </span>
        <span className="text-muted-foreground tabular-nums">
          {summary} · {percent} %
        </span>
      </div>
      <Progress
        value={percent}
        aria-labelledby="task-progress-label"
        aria-valuetext={`${summary} (${percent} %)`}
      />
    </div>
  )
}
