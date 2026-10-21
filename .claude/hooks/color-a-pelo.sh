#!/usr/bin/env bash
# PostToolUse (Write|Edit): AVISA, sin bloquear, cuando lo que se acaba de
# escribir en frontend/src/ trae un color a pelo en vez de un token del tema:
#   - hexadecimal: #rgb, #rgba, #rrggbb, #rrggbbaa (también dentro de `bg-[#…]`)
#   - funciones de color: rgb(), rgba(), hsl(), hsla(), hwb(), lab(), lch(),
#     oklab(), oklch()
#   - la paleta fija de Tailwind: `bg-red-500`, `text-white`, `border-black`…
# frontend/src/index.css queda fuera: es la capa de tokens, donde el valor
# literal sí se escribe (`--primary: oklch(...)`), y el resto lo usa por nombre
# (`bg-primary`, `text-muted-foreground`, `var(--border)`).
#
# Solo mira el texto que entra en esta escritura (`content` de un Write,
# `new_string` de un Edit), no el fichero entero: avisa de lo que se escribe
# ahora, no de lo que ya estaba.
#
# ESTO ES UN AVISO, NO UN CANDADO. Lo que NO ve:
#   - Colores que no se escriben con Write/Edit: `npx shadcn add`, un `sed`, un
#     `git checkout`, o el editor de una persona.
#   - Colores con nombre de CSS (`red`, `white`, `rebeccapurple`) fuera de las
#     clases de Tailwind: en el código salen demasiado como palabras normales.
#   - Un color armado por partes (`'#' + hex`, `` `rgb(${r}…)` `` con la función
#     en otra línea).
# Y puede avisar de más: un ancla como `href="#fab"` tiene forma de hexadecimal.
set -uo pipefail

entrada=$(cat)

f=$(printf '%s' "$entrada" | jq -r '.tool_input.file_path // empty')
[ -n "$f" ] || exit 0

root="${CLAUDE_PROJECT_DIR:-}"
[ -n "$root" ] || root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0

# En Windows llegan rutas con `\` y a veces con `C:` o `/c/` según quién las
# escriba: se igualan las dos antes de compararlas.
normalizar() {
  local p="${1//\\//}"
  command -v cygpath >/dev/null 2>&1 && p=$(cygpath -m "$p" 2>/dev/null || printf '%s' "$p")
  printf '%s' "$p"
}
f=$(normalizar "$f")
root=$(normalizar "$root")

shopt -s nocasematch
case "$f" in
  "$root"/*) rel="${f#"$root"/}" ;;
  *) exit 0 ;;
esac
case "$rel" in
  frontend/src/index.css) exit 0 ;;
  frontend/src/*) ;;
  *) exit 0 ;;
esac
shopt -u nocasematch

texto=$(printf '%s' "$entrada" | jq -r '.tool_input.content // .tool_input.new_string // empty')
[ -n "$texto" ] || exit 0

re_hex='(^|[^[:alnum:]_&#-])#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})([^[:alnum:]_-]|$)'
re_funcion='(^|[^[:alnum:]_-])(rgba?|hsla?|hwb|lab|lch|oklab|oklch)\('
re_paleta='(^|[^[:alnum:]_-])(bg|text|border(-[xytrbl])?|ring(-offset)?|outline|fill|stroke|from|via|to|decoration|divide|shadow|accent|caret|placeholder)-((slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|[1-9]00|950)|white|black)([^[:alnum:]_-]|$)'

# Las líneas del texto escrito que traen un color, con su número en el fichero
# cuando se puede saber (en un Edit, la primera línea idéntica que haya).
hallazgos=$(printf '%s\n' "$texto" | grep -nE -e "$re_hex" -e "$re_funcion" -e "$re_paleta")
[ -n "$hallazgos" ] || exit 0

lineas=""
while IFS= read -r h; do
  n="${h%%:*}"
  linea="${h#*:}"
  if printf '%s' "$entrada" | jq -e '.tool_input.new_string' >/dev/null 2>&1 && [ -f "$f" ]; then
    n=$(grep -nF -- "$linea" "$f" 2>/dev/null | head -n1 | cut -d: -f1)
  fi
  recorte=$(printf '%s' "$linea" | sed -E 's/^[[:space:]]+//' | cut -c1-160)
  lineas+="  ${rel}${n:+:$n}: ${recorte}"$'\n'
done <<< "$hallazgos"

aviso="AVISO de color-a-pelo.sh: hay colores escritos a pelo en ${rel}:
${lineas}Los colores salen de los tokens de frontend/src/index.css (\`bg-primary\`, \`text-muted-foreground\`, \`border-border\`, \`var(--destructive)\`…). Si falta uno, se añade allí como token (en :root y en .dark) y aquí se usa por su nombre. Es un aviso, no un bloqueo: si el literal tiene que quedarse, dilo y explica por qué."

jq -n --arg aviso "$aviso" '{
  systemMessage: $aviso,
  hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: $aviso }
}'
exit 0
