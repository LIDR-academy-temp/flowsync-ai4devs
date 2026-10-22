#!/usr/bin/env bash
# PostToolUse (Write|Edit|MultiEdit): AVISA, sin bloquear, cuando
# el texto que se acaba de escribir en frontend/src/ lleva un color literal:
#   - hexadecimal: #fff, #1a2b3c, #1a2b3c80
#   - funcional: rgb(), rgba(), hsl(), hsla(), hwb(), lab(), lch(), oklab(), oklch()
#   - clase de paleta de Tailwind: bg-red-500, text-slate-900/50, border-blue-200
# `frontend/src/index.css` queda fuera: ahí viven los tokens, que es justo donde
# se definen los colores. El resto debe usar los tokens (`bg-primary`,
# `text-muted-foreground`, `var(--...)`).
#
# Solo mira lo que esta llamada ha escrito (`content` o `new_string`), no el
# fichero entero: avisa de lo nuevo, no de la deuda que ya hubiera.
#
# Sin hallazgos sale con exit 0. Con hallazgos escribe el aviso en stderr y sale
# con exit 2: en PostToolUse eso no bloquea ni deshace nada (el fichero ya está
# escrito), solo hace llegar el aviso a Claude.
#
# ESTO ES UNA RED, NO UN CANDADO. Lo que NO ve:
#   - Un color escrito de otra forma: nombres CSS (`red`, `rebeccapurple`),
#     `color-mix()`, `style={{ color: ... }}` armado con variables, o un valor
#     construido en tiempo de ejecución.
#   - Lo que se escribe fuera de Write/Edit/MultiEdit (`sed -i`, `tee`, un
#     script con Bash) o por el servidor MCP.
#   - Falsos positivos posibles: un ancla `#bad` o `#face` se lee como hex.
set -uo pipefail

entrada=$(cat)

fichero=$(printf '%s' "$entrada" | jq -r '.tool_input.file_path // empty')

# TRAZA TEMPORAL: una línea por ejecución, para saber si Claude Code lanza el
# hook. Quitar este bloque y la línea ALERTA de abajo cuando se confirme.
traza="${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/.sin-colores-literales.log"
printf '%s ejecutado fichero=%s\n' "$(date +%T)" "${fichero:-<vacío>}" >>"$traza" 2>/dev/null

[ -n "$fichero" ] || exit 0

# Solo frontend/src/, y sin index.css (los tokens).
case "$fichero" in
  */frontend/src/index.css) exit 0 ;;
  */frontend/src/*) ;;
  *) exit 0 ;;
esac

# Lo escrito: Write trae `content`, Edit `new_string`, MultiEdit `edits[]`.
texto=$(printf '%s' "$entrada" | jq -r '
  [.tool_input.content, .tool_input.new_string, (.tool_input.edits[]?.new_string)]
  | map(select(. != null)) | join("\n")')
[ -n "$texto" ] || exit 0

hallazgos=$(
  printf '%s\n' "$texto" | grep -nE \
    -e '(^|[^&[:alnum:]_])#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})([^[:alnum:]_]|$)' \
    -e '(^|[^[:alnum:]_-])(rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(' \
    -e '(^|[^[:alnum:]_])(bg|text|border|ring|fill|stroke|from|via|to|outline|decoration|divide|accent|caret|shadow)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}' \
    | cut -c1-120 | sed -E 's/^([0-9]+):/línea \1: /' | head -n 10
)
[ -n "$hallazgos" ] || exit 0

aviso="Colores literales en ${fichero#*/frontend/}. Los colores salen de los tokens de frontend/src/index.css (bg-primary, text-muted-foreground, var(--...)), no se escriben a mano. Si falta un color, añade el token a index.css. Hallazgos (líneas relativas a lo escrito en esta llamada):
$hallazgos"

printf '%s ALERTA fichero=%s\n' "$(date +%T)" "$fichero" >>"$traza" 2>/dev/null

# exit 2 en PostToolUse NO deshace nada: el fichero ya está escrito. Solo hace
# que stderr le llegue a Claude, que es el canal fiable para el aviso.
printf 'sin-colores-literales: %s\n' "$aviso" >&2
exit 2
