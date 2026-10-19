import type { TaskStatus } from '@/lib/types'

type TaskProgressProps = {
  /** Cuántas tareas del equipo hay en cada estado, sin mirar el filtro. */
  counts: Record<TaskStatus, number>
}

/**
 * El avance del equipo: qué parte de todas sus tareas está hecha. Se calcula
 * sobre el total y no sobre lo que enseña la lista, que por defecto deja fuera
 * justo las hechas —medido sobre la vista, el avance saldría siempre a cero.
 */
export function TaskProgress({ counts }: TaskProgressProps) {
  const total = counts.pending + counts.in_progress + counts.done
  const percent = total === 0 ? 0 : Math.round((counts.done / total) * 100)

  return (
    <div className="bg-background mb-4 rounded-lg border p-4">
      <div className="mb-2 flex items-baseline justify-between gap-4 text-sm">
        <span id="task-progress-label" className="font-medium">
          Avance del equipo
        </span>
        <span className="text-muted-foreground tabular-nums">
          {total === 0
            ? 'Sin tareas todavía'
            : `${counts.done} de ${total} hechas · ${percent} %`}
        </span>
      </div>
      <div
        className="bg-muted h-2 overflow-hidden rounded-full"
        role="progressbar"
        aria-labelledby="task-progress-label"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${counts.done} de ${total} tareas hechas`}
      >
        <div
          className="bg-primary h-full rounded-full transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
