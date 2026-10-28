import type { Task } from '@/lib/types'

type TaskProgressProps = {
  /** Las tareas que hay en pantalla ahora mismo, ya pasadas por el filtro. */
  tasks: readonly Task[]
}

/**
 * Qué parte de lo que se está viendo está hecha. Se calcula sobre la vista y
 * no sobre todo el espacio: cambia con el filtro y con cada cambio de estado,
 * sin pedir nada al servidor.
 *
 * Es un `div` con `role="progressbar"` y no un `<progress>` nativo, que cada
 * navegador pinta a su manera y no se deja vestir con los tokens del tema.
 */
export function TaskProgress({ tasks }: TaskProgressProps) {
  const total = tasks.length
  const done = tasks.filter((task) => task.status === 'done').length
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)
  const summary = `${done} de ${total} ${total === 1 ? 'tarea hecha' : 'tareas hechas'}`

  return (
    <div className="mb-4 grid gap-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span id="task-progress-label" className="text-muted-foreground">
          {summary}
        </span>
        <span className="font-medium tabular-nums" aria-hidden="true">
          {percent}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-labelledby="task-progress-label"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${percent}% — ${summary}`}
        className="bg-muted h-2 overflow-hidden rounded-full"
      >
        <div
          className="bg-progress h-full rounded-full transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
