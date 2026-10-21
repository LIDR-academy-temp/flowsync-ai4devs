#!/usr/bin/env bash
# PostToolUse (Write|Edit): AVISA, no bloquea, cuando lo que el agente acaba de
# escribir en frontend/src/ trae un color a pelo:
#   - un hexadecimal (#1D4ED8, #fff, también dentro de `bg-[#1D4ED8]`)
#   - una función de color (rgb(), rgba(), hsl(), hsla(), hwb(), lab(), lch(),
#     oklab(), oklch())
#   - una clase de paleta cruda de Tailwind (bg-blue-600, text-white,
#     hover:border-slate-200/50…)
# frontend/src/index.css queda fuera: es la capa donde el valor literal sí se
# escribe, con nombre. Fuera de ella, el color sale de ese nombre (bg-primary,
# text-muted-foreground, var(--destructive)).
#
# Solo mira el texto nuevo (`content` de Write, `new_string` de Edit), no el
# archivo entero: lo que ya estaba no vuelve a avisar, salvo que una edición lo
# reescriba. Sale siempre con 0; el aviso viaja como JSON: `additionalContext`
# para el agente y `systemMessage` para la persona.
#
# ESTO ES UNA RED, NO UN CANDADO. Lo que NO ve:
#   - Lo que se escribe por Bash (`sed -i`, heredoc, `cat >`, `npx shadcn add`):
#     este hook solo salta con Write y Edit.
#   - Colores con nombre de CSS (`red`, `style={{ color: 'tomato' }}`) y clases
#     armadas en tiempo de ejecución (`bg-${tono}-500`).
#   - Lo que queda fuera de frontend/src/ (index.html, public/, SVG sueltos).
#   - Si la pieza salió del catálogo o se dibujó de cero, y si el valor con
#     nombre elegido es el que toca. Eso no es mecánico: lo dice la regla «De
#     dónde sale una pieza de interfaz nueva» del CLAUDE.md.
set -uo pipefail

entrada=$(cat)

root="${CLAUDE_PROJECT_DIR:-}"
[ -n "$root" ] || root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0

f=$(printf '%s' "$entrada" | jq -r '.tool_response.filePath // .tool_input.file_path // empty')
case "$f" in
  "$root"/frontend/src/index.css) exit 0 ;;
  "$root"/frontend/src/*) ;;
  *) exit 0 ;;
esac

texto=$(printf '%s' "$entrada" | jq -r '
  [.tool_input.content, .tool_input.new_string, (.tool_input.edits // [] | .[].new_string)]
  | map(select(. != null)) | join("\n")')
[ -n "$texto" ] || exit 0

paleta='slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
utilidad='bg|text|border(?:-[xytrblse])?|ring(?:-offset)?|outline|decoration|divide|from|via|to|fill|stroke|shadow|inset-shadow|inset-ring|drop-shadow|text-shadow|accent|caret|placeholder'
# Bordes como lookarounds de Perl: no consumen, así dos colores seguidos
# (`bg-red-500 text-white`) salen los dos.
antes='(?<![\w-])'
despues='(?![\w-])'

re_hex="#(?:[0-9A-Fa-f]{8}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{3})${despues}"
re_funcion="${antes}(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\([^()]*\)"
re_clase="${antes}(?:${utilidad})-(?:(?:${paleta})-(?:50|[1-9]00|950)|white|black)${despues}"

hallazgos=$(printf '%s\n' "$texto" \
  | RE="${re_hex}|${re_funcion}|${re_clase}" perl -ne 'print "$&\n" while /$ENV{RE}/g' \
  | sort -u)
[ -n "$hallazgos" ] || exit 0

rel="${f#"$root"/}"
detalle=""
while IFS= read -r valor; do
  lineas=$(grep -nF -- "$valor" "$f" 2>/dev/null | cut -d: -f1 | paste -sd, -)
  detalle+="  - ${valor}${lineas:+ (línea ${lineas})}"$'\n'
done <<< "$hallazgos"

aviso="Aviso de .claude/hooks/color-a-pelo.sh (no bloquea): acabas de escribir colores a pelo en ${rel}:
${detalle}En el frontend el color sale de los valores con nombre de frontend/src/index.css (bg-primary, text-muted-foreground, border-border, var(--destructive)…). Si ninguno encaja, declara primero el valor nuevo en index.css con nombre (en :root y en .dark) y úsalo por su nombre. Si el color a pelo es intencionado, díselo a la persona de forma explícita en vez de dejarlo pasar."

jq -n --arg aviso "$aviso" --arg resumen "Color a pelo en ${rel}: $(printf '%s' "$hallazgos" | paste -sd, - | sed 's/,/, /g')" '{
  systemMessage: $resumen,
  hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: $aviso }
}'
exit 0
