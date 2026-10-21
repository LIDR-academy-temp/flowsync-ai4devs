type TaskProgressProps = {
  done: number
  total: number
}

/**
 * El avance del equipo: cuántas tareas están hechas sobre el total. Cuenta
 * todas, no solo las de la vista actual — el filtro acota lo que se ve, no
 * lo que se ha hecho.
 *
 * Es un `progressbar` nativo con sus `aria-*`, así que un lector de pantalla
 * anuncia el mismo dato que se lee en el texto de al lado.
 */
export function TaskProgress({ done, total }: TaskProgressProps) {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="bg-background mb-4 grid gap-2 rounded-lg border p-4">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span id="task-progress-label" className="font-medium">
          Progreso del equipo
        </span>
        <span className="text-muted-foreground tabular-nums">
          {done} de {total} {total === 1 ? 'hecha' : 'hechas'} · {percent}%
        </span>
      </div>
      <div
        className="bg-muted h-2 overflow-hidden rounded-full"
        role="progressbar"
        aria-labelledby="task-progress-label"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-valuetext={`${done} de ${total} tareas hechas`}
      >
        <div
          className="bg-progress h-full rounded-full transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
