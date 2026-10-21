#!/usr/bin/env bash
# PostToolUse (Write|Edit|MultiEdit): AVISA, sin bloquear nunca, cuando lo que
# se acaba de escribir en `frontend/src/` trae un color literal:
#   - un hexadecimal (`#fff`, `#1e40af`, `bg-[#0f0]`…)
#   - una función de color (`rgb(`, `rgba(`, `hsl(`, `hsla(`, `oklch(`, `oklab(`)
#   - una clase de la paleta cruda de Tailwind (`bg-blue-600`, `text-red-500`,
#     `hover:border-slate-200`, `bg-white`, `text-black`…)
# `frontend/src/index.css` queda fuera: ahí se declaran los valores base.
#
# Solo mira el texto que entra en esta operación (`content` en Write,
# `new_string` en Edit, cada `edits[].new_string` en MultiEdit), no el fichero
# entero: lo que ya estaba no se vuelve a señalar en cada edición.
#
# ESTO ES UN AVISO, NO UN CANDADO. Sale siempre con 0 y la escritura ya está
# hecha. Lo que NO ve:
#   - Lo que se escribe por Bash (`sed`, heredoc, `cat >`): no pasa por Write
#     ni Edit.
#   - Una clase armada por partes (`'bg-' + color + '-600'`) o en una variable.
#   - Colores por nombre CSS (`red`, `tomato`) fuera de una clase de Tailwind.
# Y puede avisar de más: un `#123` en un comentario parece un hexadecimal.
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

texto=$(printf '%s' "$entrada" | jq -r '
  .tool_input
  | [.content, .new_string, (.edits // [] | .[].new_string)]
  | map(select(. != null)) | join("\n")')
[ -n "$texto" ] || exit 0

# Los bordes van en lookarounds (perl) y no en la propia coincidencia: si se
# consumieran, el espacio entre dos clases seguidas (`bg-blue-600 text-red-500`)
# serviría solo a la primera y la segunda se escaparía.
hallazgos=$(
  printf '%s\n' "$texto" | perl -nle '
    my $paleta = "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
    my $utilidad = "bg|text|border(?:-[trblxyse])?|ring(?:-offset)?|outline|divide|fill|stroke|from|via|to|shadow|decoration|accent|caret|placeholder";
    print for /(?<![&\w])(#(?:[[:xdigit:]]{8}|[[:xdigit:]]{6}|[[:xdigit:]]{3,4}))(?![\w-])/g;
    print for /(?<![\w-])((?i:rgba?|hsla?|oklch|oklab)\()/g;
    print for /(?<![\w-])((?:$utilidad)-(?:(?:$paleta)-(?:50|[1-9]00|950)|black|white)(?:\/\d+)?)(?![\w-])/g;
  ' | sort -u | paste -sd ',' - | sed 's/,/, /g'
)
[ -n "$hallazgos" ] || exit 0

rel=${f#"$root"/}
aviso="Aviso de colores-con-nombre.sh: ${rel} incluye colores literales (${hallazgos}). Usa los valores con nombre de frontend/src/index.css (bg-primary, text-muted-foreground, border, bg-destructive…) o una pieza de frontend/src/components/ui. No se ha bloqueado nada."

jq -n --arg m "$aviso" '{
  systemMessage: $m,
  hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: $m }
}'
exit 0
