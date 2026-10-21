#!/usr/bin/env bash
# PostToolUse (Write|Edit): avisa, sin bloquear (exit 0), cuando lo que se
# acaba de escribir en frontend/src/ trae un color a pelo:
#   - hexadecimal (#fff, #1e40af, #1e40af80)
#   - función de color (rgb, rgba, hsl, hsla, hwb, lab, lch, oklab, oklch)
#   - clase de paleta cruda de Tailwind (bg-blue-600, text-white, hover:border-zinc-200/50)
# Los colores salen de los tokens de frontend/src/index.css (bg-primary,
# text-muted-foreground, border-border...), así que ese fichero queda fuera.
#
# Solo mira el texto nuevo (`content` de Write, `new_string` de Edit), no el
# fichero entero: lo que ya estaba no vuelve a avisar en cada edición.
#
# ESTO ES UN AVISO, NO UN CANDADO. Lo que NO ve:
#   - Colores armados por partes (`bg-${color}-600`), con nombre CSS (`red`,
#     `tomato`) o en `style={{ color: 'red' }}`.
#   - Lo que se escriba fuera de Write/Edit (Bash, `npx shadcn add`).
# Y algún falso positivo: un `#abc` que no sea color (un ancla, un texto).
set -uo pipefail

entrada=$(cat)
f=$(printf '%s' "$entrada" | jq -r '.tool_input.file_path // empty')
root="${CLAUDE_PROJECT_DIR:-}"
[ -n "$f" ] && [ -n "$root" ] || exit 0

case "$f" in
  "$root"/frontend/src/index.css) exit 0 ;;
  "$root"/frontend/src/*) ;;
  *) exit 0 ;;
esac

nuevo=$(printf '%s' "$entrada" | jq -r '.tool_input.content // .tool_input.new_string // empty')
[ -n "$nuevo" ] || exit 0

# Se trocea en palabras (una por línea) antes de buscar: así cada patrón se
# ancla a la palabra entera y `bg-red-500 text-white` da los dos, cosa que un
# grep -o con bordes consumidos no hace. Se conservan `:` y `!` (variantes e
# important de Tailwind), `/` (opacidad) y `(` (funciones de color); los
# corchetes caen, así que `bg-[#fff]` deja `#fff` suelto y también avisa.
re_hex='(^|[:!])#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})$'
re_funcion='(^|[:!(-])(rgba?|hsla?|hwb|lab|lch|oklab|oklch)\('
utilidad='(bg|text|border(-[xytrblse])?|ring(-offset)?|outline|divide|decoration|placeholder|caret|accent|fill|stroke|shadow|inset-shadow|inset-ring|from|via|to)'
paleta='(slate|gray|zinc|neutral|stone|mauve|olive|mist|taupe|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|[1-9]00|950)'
re_tailwind="(^|[:!])${utilidad}-(${paleta}|black|white)(/[0-9]+)?$"

hallazgos=$(printf '%s\n' "$nuevo" \
  | tr -c '[:alnum:]#_/:!(-' '\n' \
  | grep -oE -e "$re_hex" -e "$re_funcion" -e "$re_tailwind" \
  | sed -E 's/^[:!(-]//' \
  | sort -u)
[ -n "$hallazgos" ] || exit 0

rel="${f#"$root"/}"
lista=$(printf '%s\n' "$hallazgos" | sed 's/^/  - /')
aviso="Aviso de colores-por-tokens.sh: $rel trae colores a pelo:
$lista
Los colores salen solo de los tokens de frontend/src/index.css (bg-primary, text-muted-foreground, border-border, bg-destructive...). Si falta un token, se añade allí y se usa por su nombre."

jq -n --arg aviso "$aviso" --arg rel "$rel" '{
  systemMessage: ("Colores a pelo en " + $rel + " (aviso, no bloquea)"),
  hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: $aviso }
}'
exit 0
