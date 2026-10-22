type TaskProgressProps = {
  /** Cuántas de las tareas de la vista están hechas. */
  done: number
  /** Cuántas tareas tiene la vista en total. Con cero no se pinta nada. */
  total: number
}

/**
 * Qué parte de lo que se está viendo está hecho: una barra con la cifra al
 * lado, porque una barra sola no dice si es 1 de 2 o 50 de 100.
 *
 * Es un `role="progressbar"` nativo y no un componente de shadcn a propósito:
 * no hay nada que accionar, solo leer, y el lector de pantalla recibe la misma
 * frase que se ve. El relleno va en el token `progress` sobre `muted`: el azul
 * vive en `index.css` con su paso claro y su paso oscuro, no aquí.
 */
export function TaskProgress({ done, total }: TaskProgressProps) {
  // Sin tareas no hay progreso que medir: cero de cero no es «0 %», es nada.
  if (total === 0) return null

  const ratio = done / total
  // El redondeo no puede mentir en los extremos: «100 %» solo cuando no queda
  // nada, y «0 %» solo cuando no hay nada hecho. 199 de 200 es 99 %, y 1 de
  // 300 es 1 %, aunque la aritmética diga otra cosa.
  const percent =
    done === 0
      ? 0
      : done === total
        ? 100
        : Math.min(99, Math.max(1, Math.round(ratio * 100)))
  const summary = `${done} de ${total} ${done === 1 ? 'hecha' : 'hechas'}`

  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className="font-medium">Progreso de esta vista</span>
        <span className="text-muted-foreground tabular-nums">
          {summary} · {percent} %
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Tareas hechas de las que estás viendo"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-valuetext={`${summary}, ${percent} %`}
        className="bg-muted h-2 w-full overflow-hidden rounded-full"
      >
        <div
          className="bg-progress h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none"
          // El ancho va con la proporción exacta, no con la cifra redondeada:
          // la barra no se ve llena hasta que lo está.
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  )
}
