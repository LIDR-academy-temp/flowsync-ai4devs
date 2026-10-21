#!/usr/bin/env bash
# PostToolUse (Write|Edit): AVISA (exit 2, el cambio ya está hecho y no se
# deshace) cuando un fichero de frontend/src/ trae un color a pelo en vez de un
# token del tema. Revisa el fichero entero, no solo lo que se acaba de escribir,
# así que también saca a la luz los que ya estaban.
#
# Qué cuenta como color a pelo:
#   - Hexadecimal: #fff, #ffffff, #ffffff80 (3, 4, 6 u 8 cifras).
#   - Funciones de color de CSS: rgb(), rgba(), hsl(), hsla(), hwb(), lab(),
#     lch(), oklab(), oklch(), color(), color-mix().
#   - Clases crudas de la paleta de Tailwind: bg-red-500, text-zinc-900/80,
#     hover:border-sky-300, text-white, bg-black/50… (cualquier utilidad de
#     color con una de las 22 paletas o con black/white).
#   - Un color con nombre de CSS como valor de una propiedad de color, en un
#     `style` o en CSS: `color: 'red'`, `backgroundColor: "white"`, `fill: navy`.
#
# Única excepción: frontend/src/index.css, que es donde se definen los tokens
# (variables de `:root` y `.dark`, mapeadas en `@theme`). Los componentes usan
# las utilidades que salen de ellos: bg-background, text-muted-foreground,
# bg-primary, border-border, text-destructive…
#
# Lo que NO ve: un color armado por partes (`'#' + hex`, plantillas), uno que
# llegue de una variable o de una dependencia, y los nombres de color fuera de
# una propiedad de color. Un `#abc` que no sea un color (un ancla `#add`) sí
# saltaría: es un aviso, no un bloqueo, y se lee y se descarta.
set -uo pipefail

f=$(jq -r '.tool_response.filePath // .tool_input.file_path // empty')
[ -n "$f" ] || exit 0
f=${f//\\//}

case "$f" in
  */frontend/src/index.css) exit 0 ;;
  */frontend/src/*) ;;
  *) exit 0 ;;
esac
case "$f" in
  *.ts | *.tsx | *.js | *.jsx | *.mjs | *.cjs | *.css | *.scss | *.html | *.svg) ;;
  *) exit 0 ;;
esac
[ -f "$f" ] || exit 0

paletas='slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
utilidades='bg|text|border|border-[xytrblse]|ring|ring-offset|outline|divide|fill|stroke|from|via|to|shadow|inset-shadow|inset-ring|drop-shadow|placeholder|caret|accent|decoration'
nombres='black|white|red|green|blue|yellow|orange|purple|pink|gray|grey|silver|maroon|navy|teal|olive|lime|aqua|fuchsia|brown|gold|indigo|violet|crimson|coral|salmon|tomato|khaki|beige|ivory|lavender|turquoise|tan'

hex='#[0-9A-Fa-f]{3}([0-9A-Fa-f]{1}|[0-9A-Fa-f]{3}|[0-9A-Fa-f]{5})?([^0-9A-Za-z_-]|$)'
funciones='(^|[^[:alnum:]_.-])(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)[[:space:]]*\('
tailwind="(^|[^[:alnum:]_-])(${utilidades})-((${paletas})-[0-9]{2,3}|black|white)(/[0-9]+)?([^[:alnum:]_-]|$)"
con_nombre="(color|background|background-color|backgroundColor|border-color|borderColor|outline-color|outlineColor|fill|stroke)[[:space:]]*:[[:space:]]*['\"]*(${nombres})([^[:alnum:]_-]|$)"

# Cada separador se duplica antes de buscar: `grep -o` se come el separador
# final de una coincidencia, y sin esto la clase de al lado
# (`bg-red-500 border-white`) se quedaría sin el suyo y no saltaría.
hallazgos=$(sed -E "s/[[:space:]\"'\`{}<>,;=]/&&/g" "$f" 2>/dev/null |
  grep -nEio "${hex}|${funciones}|${tailwind}|${con_nombre}") || exit 0

{
  echo "AVISO de color-a-pelo.sh: ${f##*/frontend/} tiene colores a pelo (línea: lo encontrado):"
  printf '%s\n' "$hallazgos" |
    sed -E "s/[\"'\`]//g; s/[[:space:]]+/ /g; s/^([0-9]+):[^#[:alnum:]]*/  \\1: /; s/[^[:alnum:])%]+\$//"
  echo "El cambio está hecho, pero el color tiene que salir de un token del tema: usa las utilidades que define frontend/src/index.css (bg-background, text-foreground, bg-primary, text-muted-foreground, border-border, text-destructive…), con opacidad si hace falta (bg-primary/10)."
  echo "Si no hay token para lo que necesitas, añádelo en frontend/src/index.css (en :root, en .dark y en @theme) y úsalo desde aquí; no escribas el valor en el componente."
} >&2
exit 2
