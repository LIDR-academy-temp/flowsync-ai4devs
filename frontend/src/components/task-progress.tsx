import { Progress } from '@/components/ui/progress'
import { type Task } from '@/lib/types'

type TaskProgressProps = {
  /**
   * Las tareas que se están pintando ahora mismo, ya pasadas por el filtro.
   * La barra mide eso y no el total del equipo: lo que resume es la lista que
   * se tiene delante, así que al cambiar de filtro cambia con ella.
   */
  tasks: readonly Task[]
}

/**
 * Qué parte de la lista visible está hecha. Va encima del listado y lo
 * resume: la cuenta exacta («3 de 12») acompaña siempre al porcentaje, porque
 * el porcentaje va redondeado y por sí solo no deja ver de cuántas tareas
 * habla — «25 %» de cuatro tareas y de cuarenta no es la misma noticia.
 *
 * No se pinta con la lista vacía: una barra de cero sobre cero no mide nada y
 * la pantalla ya tiene sus propios mensajes para ese caso.
 */
export function TaskProgress({ tasks }: TaskProgressProps) {
  if (tasks.length === 0) return null

  const done = tasks.filter((task) => task.status === 'done').length
  const percentage = Math.round((done / tasks.length) * 100)

  return (
    <div className="bg-background mb-4 rounded-lg border p-4">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium">Hechas en esta vista</p>
        <p className="text-muted-foreground text-sm">
          {done} de {tasks.length} · {percentage}%
        </p>
      </div>
      {/* El valor va también en texto para quien use un lector de pantalla:
          el porcentaje a secas diría «25 %» sin decir de qué. */}
      <Progress
        value={percentage}
        aria-label="Tareas hechas en esta vista"
        getValueLabel={() =>
          `${done} de ${tasks.length} tareas hechas (${percentage}%)`
        }
      />
    </div>
  )
}
