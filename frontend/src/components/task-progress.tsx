import { Progress } from '@/components/ui/progress'
import type { Task } from '@/lib/types'
import { cn } from '@/lib/utils'

type TaskProgressProps = {
  /** Las tareas que se están pintando, no las que trajo la API. */
  tasks: readonly Task[]
  className?: string
}

/**
 * El porcentaje entero de hechas, con los extremos reservados: «100 %» solo si
 * está todo hecho y «0 %» solo si no lo está nada. Un `Math.round` a secas
 * daría 100 % con 199 de 200, y un `Math.floor`, 0 % con 1 de 200.
 */
function donePercent(done: number, total: number) {
  if (total === 0 || done === 0) return 0
  if (done === total) return 100
  return Math.min(99, Math.max(1, Math.round((done / total) * 100)))
}

/**
 * Qué parte de lo que hay en pantalla está hecho. Se calcula sobre la lista
 * visible y nada más: con el filtro por defecto, que deja fuera las hechas,
 * marca 0 %, y con el de «Hecho», 100 %. Sin tareas no pinta nada, para que
 * ningún sitio pueda acabar enseñando un «0 de 0».
 */
export function TaskProgress({ tasks, className }: TaskProgressProps) {
  const total = tasks.length
  if (total === 0) return null

  const done = tasks.filter((task) => task.status === 'done').length
  const percent = donePercent(done, total)
  const valueText = `${done} de ${total} hechas`

  return (
    <div className={cn('grid gap-2', className)}>
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span id="task-progress-label" className="text-muted-foreground">
          Hechas en esta vista
        </span>
        <span className="font-medium tabular-nums">
          {done} de {total}
          <span className="text-muted-foreground"> · {percent} %</span>
        </span>
      </div>
      {/* El valor va en porcentaje porque la pieza del catálogo calcula el
          ancho del relleno sobre 100. Esa pieza se queda el `value` y no se lo
          pasa a Radix, que sin él la da por indeterminada: por eso el valor y
          su lectura en palabras se le dan aquí, explícitos. */}
      {/* Excepción declarada: el relleno va en `bg-green-600`, color a pelo,
          por decisión explícita y solo en esta barra. Se pinta desde aquí, por
          el `data-slot` del indicador, para no tocar la pieza del catálogo. */}
      <Progress
        className="*:data-[slot=progress-indicator]:bg-green-600"
        value={percent}
        aria-labelledby="task-progress-label"
        aria-valuenow={percent}
        aria-valuetext={valueText}
      />
    </div>
  )
}
