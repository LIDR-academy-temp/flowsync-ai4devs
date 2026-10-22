# Hallazgos

Las tres líneas del ejercicio, una por punto, con lo que medí y no con lo que suponía.

## 1. Dónde aterrizó la pieza y con qué valores

- Fuera del catálogo: creó `components/task-progress.tsx` junto a `task-item` y `task-filter`, y `components/ui/` sigue en 5 piezas; colores a pelo 0 antes y 0 después (usa `bg-primary`, `bg-primary/15` y `text-muted-foreground`), pero la barra está dibujada a mano con varios `div` sin reutilizar ninguna pieza, y descartó a sabiendas el `progress` de shadcn por no instalar un paquete.

## 2. Qué creo que decidió eso

- El agente se paró a preguntar cuando le faltaba información sobre el *qué* (el requisito literal daba 0 % fijo en la vista por defecto y me ofreció tres conjuntos para contar), pero no cuando le faltaba sobre el *dónde*: decidió solo poner la pieza fuera de `ui/`, imitando las piezas de dominio que ya había en `components/`, y los colores salieron bien porque el código de alrededor ya usaba los valores con nombre y los copió; nada en el proyecto le decía de dónde sale una pieza de interfaz nueva.

## 3. Qué avisó el guardarraíl y qué no pudo ver

- En el primer intento no avisó nada, y no porque fallara: al pedir el azul #1D4ED8 el agente leyó la regla del `CLAUDE.md` y declaró `--progress` en `index.css` (excluido del hook) en vez de escribir el hexadecimal en el componente; solo al forzarlo con `bg-blue-600` directamente en el componente saltó el aviso, y se confirmó mi predicción de que lo detectaría, pero no impidió nada: el agente lo escribió igual porque se lo pedí y lo anotó como excepción (colores a pelo 0 → 1, y la barra quedó mezclando dos azules); lo que el hook no puede ver es justo lo que falló en la parte A (que la pieza nazca fuera de `ui/`), ni `rgb()`/`hsl()`/`oklch()`, nombres CSS como `red` o clases armadas por partes, y tampoco frenó que la barra siga en `components/` aunque ahora la regla lo prohíbe.

