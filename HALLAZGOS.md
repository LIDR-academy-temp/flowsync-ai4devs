# Hallazgos

## 1. Dónde aterrizó la pieza y con qué valores

- Fuera del catálogo: la barra quedó en `frontend/src/components/task-progress.tsx`, junto a `task-filter.tsx` y `task-item.tsx`. `components/ui/` tenía 5 piezas antes (alert, button, card, input, label) y siguió con 5. No reutilizó ninguna: la barra está dibujada a mano con dos `div` y `role="progressbar"`, y no trajo el `progress` de shadcn. Colores a pelo en `frontend/src/` sin contar `index.css`: había 1 antes (`text-white` de paleta cruda en `ui/button.tsx`, que es de shadcn) y siguió habiendo 1 después de la parte A. Los colores salieron de valores con nombre (`bg-primary`, `bg-primary/15`, `text-muted-foreground`), y los valores con nombre de `index.css` siguieron en 59. En la parte B, el azul pedido a pelo subió los literales a 2 (`bg-[#2563eb]`, commit `acf1846`). Al relanzar el mismo prompt con la regla ya en `CLAUDE.md`, el agente preguntó, se eligió la regla, el azul pasó a `index.css` como `--progress` (valores con nombre: de 59 a 62) y los literales volvieron a 1.

## 2. Qué creo que decidió eso

- Lo que el agente tenía delante y no un catálogo. Para él, `components/ui/` no era «el sitio de las piezas»: era terreno de shadcn, porque `CLAUDE.md` dice que ahí van componentes generados que se traen con `npx shadcn add` y no se editan a mano. Las piezas propias de la pantalla de tareas (`task-filter`, `task-item`) viven en `components/`, y ahí la dejó, por imitación de las vecinas. Al listar `ui/` vio que no había barra de progreso. Descartó traer la de shadcn para no meter una dependencia nueva, y la dibujó. Los colores salieron con nombre por lo mismo: el archivo que tenía abierto (`tasks-page.tsx`) solo usa clases de valores con nombre y no había ningún literal que copiar, no porque nadie se lo pidiera. Contra lo que esperaba de las lecciones, no inventó colores: el código de alrededor ya hacía de catálogo de valores. Sí se cumplió la otra mitad: sin una regla que dijera que lo genérico va en `ui/`, la pieza no entró en el catálogo. Y el literal solo se evitó cuando la regla estuvo escrita. Antes, con el hook ya montado, obedeció el prompt y dejó el `#2563eb`.

## 3. Qué avisó el guardarraíl y qué no pudo ver

- Avisó de `task-progress.tsx:44: #2563eb` nada más escribirlo, sin bloquear, y el literal se commiteó igual. No pudo ver:
  - si la pieza va dentro o fuera de `components/ui/`, ni si se reutilizó o se redibujó;
  - las clases de paleta cruda (`bg-blue-600`, `text-white`), que el hook no busca; el `text-white` de `button.tsx` sigue ahí sin aviso;
  - radios, tamaños y otros valores arbitrarios (`rounded-[7px]`, `h-[13px]`), que la regla también prohíbe;
  - colores con nombre de CSS (`'blue'`), colores montados por partes y todo lo que se escribe por Bash. Mi último cambio en `index.css` y el componente lo hice con un script de Python y el hook no se disparó: lo tuve que lanzar a mano;
  - si el valor con nombre elegido tiene sentido: `--progress` usa el mismo azul en modo oscuro, y el script no dice nada del contraste ni de si `bg-destructive` sería un uso indebido.
