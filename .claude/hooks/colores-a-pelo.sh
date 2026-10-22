#!/usr/bin/env bash
# PostToolUse (Write|Edit): avisa, SIN bloquear (exit 0), cuando un fichero de
# frontend/src/ que acaba de escribirse lleva un color a pelo en vez de un token
# de src/index.css. `frontend/src/index.css` queda fuera: es justo donde viven los
# tokens, y ahí los colores literales son la definición, no un atajo.
#
# Lo que busca, línea a línea:
#   - un hexadecimal de color (#fff, #ffffff, #ffffff80)
#   - una notación funcional: rgb(), rgba(), hsl(), hsla(), oklch(), oklab(),
#     lab(), lch(), hwb(), color-mix()
#   - una clase de Tailwind con un color de su paleta (bg-red-500, text-slate-600,
#     border-zinc-200, bg-white, text-black…) en vez de uno del tema (bg-primary,
#     text-muted-foreground, bg-background…)
#
# ESTO ES UNA RED, NO UN CANDADO. Lo que NO ve: colores con nombre («red»,
# «steelblue») dentro de un `style`, un color armado por partes en JavaScript, o
# un fichero cambiado por fuera de las herramientas Write/Edit (un `sed` desde
# Bash, por ejemplo). Solo atrapa el descuido obvio, y lo que pide a cambio es
# una decisión: o se usa un token, o se añade el token a index.css.
set -uo pipefail

f=$(jq -r '.tool_response.filePath // .tool_input.file_path // empty')
[ -n "$f" ] || exit 0

root="${CLAUDE_PROJECT_DIR:-}"
[ -n "$root" ] || root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0

# Las dos rutas pasan por el mismo normalizador antes de compararse: en Windows
# la misma ruta llega con `\` o con `/`, con la unidad en cualquier caja y, en
# Git Bash, como `E:/...` o como `/e/...`. `realpath -m` las deja iguales y
# resuelve los `..`, para que `frontend/src/../../x` no cuele como de dentro.
normaliza() {
  local p=${1//\\//}
  realpath -m -- "$p" 2>/dev/null || printf '%s' "$p"
}
f=$(normaliza "$f")
root=$(normaliza "$root")
shopt -s nocasematch
case "$f" in
  "$root"/frontend/src/index.css) exit 0 ;;
  "$root"/frontend/src/*) ;;
  *) exit 0 ;;
esac
shopt -u nocasematch

[ -f "$f" ] || exit 0

paleta='red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone'
utilidad='bg|text|border|ring|outline|fill|stroke|from|via|to|accent|caret|decoration|divide|placeholder|shadow|inset-ring|ring-offset'

re_hex='#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})([^[:alnum:]_]|$)'
re_funcional='(^|[^[:alnum:]_-])(rgba?|hsla?|oklch|oklab|lab|lch|hwb|color-mix)\('
re_tailwind="(^|[^[:alnum:]_-])(${utilidad})-((${paleta})-[0-9]{2,3}|white|black)([^[:alnum:]_-]|$)"

hallazgos=$(grep -nE -e "$re_hex" -e "$re_funcional" -e "$re_tailwind" "$f" | head -n 20)
[ -n "$hallazgos" ] || exit 0

relativo=${f#"$root"/}
aviso="AVISO de colores-a-pelo.sh: ${relativo} lleva un color escrito a pelo. Los colores del frontend salen de los tokens de frontend/src/index.css (bg-primary, text-muted-foreground, bg-background, border…); si hace falta uno nuevo, se añade ahí como token y se usa por su nombre. No bloquea: es una decisión que hay que tomar a sabiendas."

# Salida JSON: `additionalContext` le llega a Claude con las líneas señaladas y
# `systemMessage` se lo enseña a la persona. Exit 0: no bloquea nada.
jq -n --arg aviso "$aviso" --arg lineas "$hallazgos" '{
  hookSpecificOutput: {
    hookEventName: "PostToolUse",
    additionalContext: ($aviso + "\nLíneas:\n" + $lineas)
  },
  systemMessage: $aviso
}'

exit 0
