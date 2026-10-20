import { useId } from 'react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const percentFormat = new Intl.NumberFormat('es', {
  style: 'percent',
  maximumFractionDigits: 0,
})

type ProgressBarProps = {
  /** Lo que se mide. Se pinta encima de la barra y es su nombre accesible. */
  label: string
  /** Cuánto se lleva hecho, en las mismas unidades que `max`. */
  value: number
  /** El total. Por defecto 100, para pasar directamente un porcentaje. */
  max?: number
  /**
   * Cómo se lee la cifra, en pantalla y en el lector de pantalla. Por defecto,
   * el porcentaje redondeado («38 %»); para contar cosas, algo como
   * `(value, max) => \`${value} de ${max}\``.
   */
  formatValue?: (value: number, max: number) => string
  /** `false` oculta la cifra en pantalla; el lector de pantalla la sigue leyendo. */
  showValue?: boolean
  className?: string
}

/**
 * Una barra de progreso con su etiqueta y su cifra, para cualquier avance que
 * se pueda contar: tareas hechas de un total, pasos de un formulario…
 *
 * Solo es determinada a propósito: si no se sabe cuánto falta, una barra que
 * se mueve sin decir nada miente sobre el avance, y para eso ya está el
 * `FullScreenLoader`.
 *
 * El valor se acota entre 0 y `max` antes de llegar a Radix, que con un valor
 * fuera de rango no lo recorta: lo descarta y deja la barra en estado
 * indeterminado, y un `max` de 0 (una lista vacía) acabaría igual.
 */
export function ProgressBar({
  label,
  value,
  max = 100,
  formatValue = (current, total) =>
    percentFormat.format(total > 0 ? current / total : 0),
  showValue = true,
  className,
}: ProgressBarProps) {
  const labelId = useId()
  const total = Math.max(max, 0)
  const current = Math.min(Math.max(value, 0), total)
  const percent = total > 0 ? (current / total) * 100 : 0
  const valueText = formatValue(current, total)

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span id={labelId} className="font-medium">
          {label}
        </span>
        {/* La cifra ya viaja en `aria-valuetext`: aquí se oculta al lector de
            pantalla para que no la lea dos veces. */}
        {showValue && (
          <span
            className="text-muted-foreground tabular-nums"
            aria-hidden="true"
          >
            {valueText}
          </span>
        )}
      </div>
      <Progress
        value={percent}
        aria-labelledby={labelId}
        getValueLabel={() => valueText}
      />
    </div>
  )
}
