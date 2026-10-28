#!/usr/bin/env bash
# PostToolUse (Write|Edit|MultiEdit): AVISA (no bloquea) cuando lo que se acaba
# de escribir en `frontend/src/` trae un color a pelo:
#   - un hexadecimal (`#1D4ED8`, `#fff`, `#00000080`)
#   - una función de color (`rgb()`, `rgba()`, `hsl()`, `hsla()`, `hwb()`,
#     `lab()`, `lch()`, `oklab()`, `oklch()`, `color()`, `color-mix()`)
#   - una clase de la paleta cruda de Tailwind (`bg-blue-600`, `text-white`,
#     `hover:border-zinc-200/50`...)
# `frontend/src/index.css` queda fuera: es la capa donde el valor literal SÍ se
# escribe, y de ahí salen los valores con nombre (`bg-primary`, `text-muted-foreground`...).
#
# El aviso le llega al agente como `additionalContext` (y a la terminal como
# `systemMessage`), con cada valor encontrado y el archivo. Sale siempre con 0:
# el cambio ya está escrito y no se deshace; corregirlo es cosa del agente.
#
# ESTO ES UN AVISO, NO UN CANDADO. Solo mira el texto nuevo de esa escritura
# (`content` de Write, `new_string` de Edit/MultiEdit), no el archivo entero ni
# lo que entre por Bash (`sed`, `cat >`, `npx shadcn add`...). Puede dar falsos
# positivos (un ancla `#add` es hexadecimal válido) y no ve un color armado por
# partes (`'bg-' + color + '-600'`).
set -uo pipefail

entrada=$(cat)
f=$(printf '%s' "$entrada" | jq -r '.tool_input.file_path // .tool_response.filePath // empty')
[ -n "$f" ] || exit 0

root="${CLAUDE_PROJECT_DIR:-}"
[ -n "$root" ] || root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0

case "$f" in
  "$root"/frontend/src/index.css) exit 0 ;;
  "$root"/frontend/src/*) rel="${f#"$root"/}" ;;
  frontend/src/index.css) exit 0 ;;
  frontend/src/*) rel="$f" ;;
  *) exit 0 ;;
esac

texto=$(printf '%s' "$entrada" | jq -r '
  [ .tool_input.content, .tool_input.new_string, (.tool_input.edits // [] | .[].new_string) ]
  | map(select(. != null)) | join("\n")')
[ -n "$texto" ] || exit 0

# perl y no grep: con `grep -o` el carácter de borde que cierra un valor se
# come el que abre el siguiente (`bg-blue-600 text-white` solo daba el primero).
# Las miradas alrededor `(?<!...)`/`(?!...)` evitan contar trozos de otra
# palabra (`getColor(`, `context-white`, `#1D4ED8FF0`).
hallazgos=$(printf '%s\n' "$texto" | perl -ne '
  BEGIN {
    $p = "slate|gray|zinc|neutral|stone|mauve|olive|mist|taupe|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
    $u = "bg|text|border|border-[xytrblse]|divide|outline|ring|ring-offset|inset-ring|shadow|inset-shadow|drop-shadow|text-shadow|fill|stroke|from|via|to|accent|caret|decoration|placeholder";
  }
  print "hexadecimal: $1\n" while /(?<![A-Za-z0-9_&-])(#(?:[0-9A-Fa-f]{8}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{3,4}))(?![0-9A-Za-z_-])/g;
  print "función de color: $1()\n" while /(?<![A-Za-z0-9_-])(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\(/g;
  print "clase de paleta cruda de Tailwind: $1\n" while /(?<![A-Za-z0-9_-])((?:$u)-(?:(?:$p)-(?:50|[1-9]00|950)|white|black)(?:\/[0-9]+)?)(?![A-Za-z0-9_-])/g;
' | awk '!visto[$0]++')
[ -n "$hallazgos" ] || exit 0

aviso="AVISO de .claude/hooks/colores-con-nombre.sh: color a pelo en ${rel}
$(printf '%s\n' "$hallazgos" | sed 's/^/  - /')
En frontend/src/ los colores salen de los valores con nombre de frontend/src/index.css (bg-primary, text-primary-foreground, border-border, text-muted-foreground, bg-destructive...), nunca escritos a mano. Cámbialo por el valor con nombre que corresponda; si no existe ninguno que encaje, dilo en vez de inventar un color. Es solo un aviso: el cambio ya está escrito."

jq -n --arg ctx "$aviso" --arg msg "Color a pelo en ${rel} (aviso, no bloquea)" '{
  systemMessage: $msg,
  hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: $ctx }
}'
exit 0
