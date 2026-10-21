import type { Task } from '@/lib/types'

type TaskProgressProps = {
  /**
   * Lo que trajo la carga de esta vista, más lo creado en ella. No es lo que
   * se pinta: con el filtro por defecto las hechas salen de la lista en cuanto
   * se marcan, y medir solo las filas visibles daría siempre 0% —o siempre
   * 100% con «Hecho»—. Se mide lo que la vista tenía entre manos.
   */
  tasks: readonly Task[]
}

/**
 * Qué parte del trabajo de esta vista está hecha. Vuelve a empezar al recargar
 * o al cambiar de filtro, porque es entonces cuando cambia lo que se mide.
 */
export function TaskProgress({ tasks }: TaskProgressProps) {
  const total = tasks.length
  const done = tasks.filter((task) => task.status === 'done').length
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)
  const summary =
    total === 1 ? `${done} de 1 hecha` : `${done} de ${total} hechas`

  return (
    <div className="mb-4 grid gap-1.5">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span id="task-progress-label" className="font-medium">
          Progreso de esta vista
        </span>
        <span className="text-muted-foreground tabular-nums">
          {summary} · {percent}%
        </span>
      </div>
      <div
        className="bg-primary/15 h-2 overflow-hidden rounded-full"
        role="progressbar"
        aria-labelledby="task-progress-label"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={summary}
      >
        <div
          className="h-full rounded-full bg-[#2563eb] transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
