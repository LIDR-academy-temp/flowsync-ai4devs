#!/usr/bin/env bash
# PostToolUse (Write|Edit): AVISA, no bloquea, cuando un archivo de
# frontend/src/ lleva un color escrito a pelo:
#   - un hexadecimal de 3, 4, 6 u 8 cifras (#1D4ED8, #fff, también dentro de
#     una clase arbitraria como bg-[#1D4ED8])
#   - una clase de la paleta cruda de Tailwind (bg-blue-600, hover:text-red-500,
#     border-slate-200/50...)
# Se salta frontend/src/index.css: ahí es donde SÍ se declaran los valores, como
# tokens, y el resto los consume por su nombre (bg-primary, text-muted-foreground).
#
# Mira el archivo entero tal como ha quedado, no solo lo que trae la edición:
# así un color que ya estaba también sale en el aviso.
#
# Lo que NO ve: colores en otra notación (rgb(), hsl(), oklch(), nombres CSS
# como `red`), clases armadas por partes (`bg-${color}-600`) y archivos fuera
# de frontend/src/. Y avisa de más con fragmentos que solo parecen hexadecimales
# (`href="#add"`): es un aviso, se lee y se decide.
set -uo pipefail

f=$(jq -r '.tool_response.filePath // .tool_input.file_path // empty')
[ -n "$f" ] || exit 0

case "$f" in
  "$CLAUDE_PROJECT_DIR"/frontend/src/index.css) exit 0 ;;
  "$CLAUDE_PROJECT_DIR"/frontend/src/*) ;;
  *) exit 0 ;;
esac
[ -f "$f" ] || exit 0

hex='#([0-9A-Fa-f]{8}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{3,4})([^0-9A-Za-z_-]|$)'
colores='slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
utilidades='bg|text|border(-[xytrblse])?|ring(-offset)?|outline|fill|stroke|from|via|to|divide|placeholder|accent|caret|decoration|shadow'
paleta="(^|[^[:alnum:]_-])-?($utilidades)-($colores)-(50|[1-9]00|950)([^[:alnum:]_-]|$)"

hallazgos=$(grep -nE "$hex|$paleta" "$f" | cut -c1-200)
[ -n "$hallazgos" ] || exit 0

total=$(printf '%s\n' "$hallazgos" | wc -l | tr -d ' ')
rel=${f#"$CLAUDE_PROJECT_DIR"/}
aviso="AVISO de colores-a-pelo.sh: $rel tiene $total línea(s) con un color escrito a pelo (hexadecimal o clase de paleta cruda de Tailwind):
$(printf '%s\n' "$hallazgos" | head -n 15)
Los colores se declaran como tokens en frontend/src/index.css y en el resto se usan por su nombre (bg-primary, text-muted-foreground, border-destructive...). Si no hay un token que encaje, se añade allí antes de usarlo. Esto es un aviso, no un bloqueo: si el color es intencionado, déjalo y explica por qué."

jq -n --arg aviso "$aviso" --arg corto "Color a pelo en $rel ($total línea(s)); ver colores-a-pelo.sh" '{
  systemMessage: $corto,
  hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: $aviso }
}'
exit 0
