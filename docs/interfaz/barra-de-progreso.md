# Barra de progreso

`ProgressBar` (`frontend/src/components/progress-bar.tsx`) pinta el avance de algo que se puede contar: tareas hechas de un total, pasos de un formulario, ficheros subidos. Lleva su etiqueta y su cifra, y se anuncia bien con lector de pantalla.

```
Tareas hechas                     3 de 8
███████████████░░░░░░░░░░░░░░░░░░░░░░░░░
```

## Uso

```tsx
import { ProgressBar } from '@/components/progress-bar'

// Un porcentaje: max vale 100 por defecto.
<ProgressBar label="Perfil completado" value={60} />

// Un recuento: value y max en las mismas unidades.
<ProgressBar
  label="Tareas hechas"
  value={done}
  max={total}
  formatValue={(value, max) => `${value} de ${max}`}
/>
```

## Props

| Prop | Tipo | Por defecto | Qué hace |
|---|---|---|---|
| `label` | `string` | — (obligatoria) | Lo que se mide. Se pinta encima de la barra y es su nombre accesible. |
| `value` | `number` | — (obligatoria) | Lo que se lleva hecho, en las mismas unidades que `max`. |
| `max` | `number` | `100` | El total. |
| `formatValue` | `(value, max) => string` | porcentaje redondeado, `«38 %»` | El texto de la cifra, en pantalla y para el lector de pantalla. |
| `showValue` | `boolean` | `true` | Con `false` la cifra no se pinta, pero el lector de pantalla la sigue leyendo. |
| `className` | `string` | — | Clases para el contenedor (ancho, márgenes). La barra ocupa todo el ancho que se le dé. |

## Comportamiento

- **Valores fuera de rango.** `value` se acota entre `0` y `max` antes de pintarse. Radix, por debajo, no recorta un valor fuera de rango: lo descarta (con un error en consola) y anuncia la barra como indeterminada, mientras el indicador se pinta igualmente desbordado.
- **Total cero.** Con `max={0}` (una lista vacía) la barra sale vacía y la cifra por defecto dice `0 %`. A `formatValue` le llega el `max` real, de modo que `${value} de ${max}` dice `0 de 0`.
- **Solo determinada.** No hay modo indeterminado a propósito: si no se sabe cuánto falta, una barra que se mueve sin decir nada miente sobre el avance. Para una espera sin final conocido está `FullScreenLoader`.

## Accesibilidad

- El elemento es un `role="progressbar"` (Radix) con `aria-valuemin`, `aria-valuemax` y `aria-valuenow` en porcentaje, nombrado por la etiqueta visible mediante `aria-labelledby`.
- `aria-valuetext` lleva el mismo texto que la cifra visible, así que el lector dice «3 de 8» y no «37,5».
- La cifra visible va con `aria-hidden` para que no se lea dos veces.

## Cómo está hecho

Se apoya en el primitivo `Progress` de shadcn/ui (`frontend/src/components/ui/progress.tsx`), traído con `npx shadcn@latest add progress`. Al traerlo hubo que corregir dos cosas a mano, y conviene repetirlas si alguien lo vuelve a generar:

1. **El import de `cn`.** El CLI (shadcn 4.22.1) escribió `import { cn } from "cn"` en lugar de `@/lib/utils` y **añadió al `package.json` un paquete de npm llamado `cn`** que no tiene nada que ver con el proyecto. Se desinstaló y el import apunta a `@/lib/utils`, como en el resto de `ui/`. Si se vuelve a ejecutar `shadcn add`, hay que revisar el diff del `package.json`.
2. **El `value` llega a `Root`.** La versión generada se quedaba el `value` para mover el indicador y no se lo pasaba al `Root` de Radix, con lo que la barra no tenía `aria-valuenow` y siempre se anunciaba como indeterminada. Ahora se le pasa.

Los colores salen de los tokens de `src/index.css`: `bg-primary` para el avance y `bg-primary/20` para el fondo, así que siguen al tema claro y al oscuro sin tocar nada.
