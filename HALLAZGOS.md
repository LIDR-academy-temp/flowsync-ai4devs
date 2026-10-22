# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: una parte A a medias con estas tres líneas escritas vale más que lo contrario, porque lo
que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

Los recuentos de abajo se hicieron con la misma regla que aplica el hook (`.claude/hooks/colores-a-pelo.sh`:
hexadecimales, `rgb()`/`oklch()` y compañía, y clases de paleta cruda de Tailwind) sobre `frontend/src/`
sin `index.css`, comparando la rama de partida (`f9787c8`) con el cierre (`0663a54`).

## 1. Dónde aterrizó la pieza y con qué valores

Dentro o fuera del catálogo, cuántos colores a pelo había antes y cuántos después, y si reutilizó
algo que ya existía.

- La barra aterrizó **fuera del catálogo**, en `frontend/src/components/task-progress.tsx`:
  `src/components/ui/` tenía 5 piezas antes (alert, button, card, input, label) y sigue teniendo 5,
  cuando shadcn tiene un `progress` que no se trajo; el componente dibuja la barra con dos `div` y un
  `role="progressbar"` sin reutilizar ninguna pieza con nombre, pero **todos sus valores son tokens
  de `index.css`** (`bg-primary` sobre `bg-muted`, `text-muted-foreground`), así que los colores a
  pelo pasaron de **1 a 1** (el `text-white` de la variante destructiva de `ui/button.tsx`, que ya
  venía de shadcn), los valores con nombre de `index.css` se quedaron en 59 tras la parte A y subieron
  a **62** al cerrar la parte B (`--progress` en claro, en oscuro, y `--color-progress` en el tema), y
  el `bg-[#1D4ED8]` pedido a propósito existió en el árbol de trabajo el tiempo de un aviso y nunca
  llegó a un commit.

## 2. Qué crees que decidió eso

Se deduce mirando qué información tenía delante el agente cuando escribió.

- Lo decidió lo que el agente tenía delante y lo que no: el `CLAUDE.md` de partida decía que
  `src/components/ui/` «se trae con `npx shadcn@latest add` y no se edita a mano» y nada sobre de
  dónde sale una pieza nueva, así que la única regla empujaba la pieza *fuera* de `ui/`; los dos
  vecinos que leyó antes de escribir (`task-filter.tsx`, `task-item.tsx`) son componentes propios en
  `src/components/` montados con `Button` y clases de token, y los imitó hasta en los comentarios;
  justificó el `div` a mano con que «no hay nada que accionar, solo leer» y además el `npm install`
  estaba roto por el certificado del proxy, con lo que un `npx shadcn add progress` ni se intentó; y
  los tokens no salieron de ninguna regla sino de que **en el código que leyó no había ni un color a
  pelo que copiar** (una skill de visualización que se cargó sola solo aportó la cifra al lado de la
  barra). El resultado contradice en parte la lección: sin catálogo nombrado no inventó colores, pero
  sí inventó la pieza.

## 3. Qué avisó el guardarraíl y qué no pudo ver

Un script solo caza lo que es mecánico; lo demás se queda fuera.

- Al pedir el azul a pelo, el hook saltó en el mismo `Edit` y señaló la línea
  (`42: className="… bg-[#1D4ED8] …"`) con el mensaje de que los colores salen de los tokens de
  `index.css` y que no bloquea, y el agente paró ahí sin commitear hasta que se eligió convertirlo
  en token (tras lo cual calló); lo que **no pudo ver** es lo que importa en la parte A: que la pieza
  se dibujara a mano existiendo `progress` en el catálogo, que no reutilizara nada de `ui/`, y que el
  azul literal en modo oscuro no tuviera contraste, además de lo mecánico que se le escapa por
  diseño: colores con nombre (`red`, `steelblue`) en un `style`, un color armado por partes en
  JavaScript, cualquier fichero cambiado desde Bash (`sed`, `npx shadcn add`) en vez de con
  `Write`/`Edit`, y el `text-white` que ya estaba en `ui/button.tsx`, que solo señalaría si alguien
  volviera a tocar ese fichero. Esa mitad va escrita en el `CLAUDE.md` como regla, porque es la que
  ningún script comprueba.
