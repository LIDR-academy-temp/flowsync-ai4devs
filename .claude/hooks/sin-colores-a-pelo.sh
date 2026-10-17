#!/usr/bin/env bash
# PostToolUse (Write|Edit): avisa —no bloquea— cuando lo que se acaba de escribir
# en frontend/src/ lleva un color a pelo:
#   - un hexadecimal (#1D4ED8)
#   - una clase de la paleta cruda de Tailwind (bg-blue-600, text-red-500/50...)
#   - un rgb()/rgba()/hsl()/hsla()/oklch()/oklab() con valores literales
# El fichero ya está escrito; el aviso le llega al agente como contexto
# (exit 0 + additionalContext) con archivo, línea y valor.
#
# Fuera de alcance: frontend/src/index.css (ahí viven los valores literales) y
# todo lo que no esté bajo frontend/src/. Un `hsl(var(--x))` no es un color a
# pelo: remite a un valor con nombre, así que no avisa.
#
# Solo mira lo escrito: en un Write, el contenido entero; en un Edit, las líneas
# del fichero que vienen de `new_string`, para no avisar de colores antiguos que
# esa edición no ha tocado. Falsos positivos conocidos: un ancla como
# `href="#add"` parece un hexadecimal de tres cifras.
set -uo pipefail

entrada=$(cat)
f=$(printf '%s' "$entrada" | jq -r '.tool_response.filePath // .tool_input.file_path // empty')
[ -n "$f" ] || exit 0

root="${CLAUDE_PROJECT_DIR:-}"
[ -n "$root" ] || root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0

src="$root/frontend/src"
case "$f" in
  "$src/index.css") exit 0 ;;
  "$src"/*) ;;
  *) exit 0 ;;
esac
rel="frontend/src/${f#"$src"/}"

# Lo escrito: `content` (Write) o `new_string` (Edit).
escrito=$(printf '%s' "$entrada" | jq -r '.tool_input.content // .tool_input.new_string // empty')
[ -n "$escrito" ] || exit 0

tmp_escrito=$(mktemp) || exit 0
trap 'rm -f "$tmp_escrito"' EXIT
printf '%s\n' "$escrito" > "$tmp_escrito"

# Líneas a revisar, como "número<TAB>texto". Con un Edit sobre un fichero que
# existe se numeran las del fichero y se conservan solo las que salen de lo
# escrito; si no, se numera lo escrito tal cual.
if printf '%s' "$entrada" | jq -e '.tool_input.new_string != null' >/dev/null 2>&1 && [ -f "$f" ]; then
  lineas=$(awk -F'\n' 'NR == FNR { nuevo[$0] = 1; next } ($0 in nuevo) { printf "%d\t%s\n", FNR, $0 }' "$tmp_escrito" "$f")
else
  lineas=$(awk '{ printf "%d\t%s\n", NR, $0 }' "$tmp_escrito")
fi
[ -n "$lineas" ] || exit 0

TAB=$'\t'
nombres='slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
utilidades='bg|text|border|border-[xytblrse]|ring|ring-offset|fill|stroke|from|via|to|outline|decoration|divide|accent|caret|shadow|placeholder'

re_hex='(^|[^[:alnum:]_&#-])#([0-9A-Fa-f]{8}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{3})([^[:alnum:]_-]|$)'
re_paleta="(^|[^[:alnum:]_-])(${utilidades})-(${nombres})-(50|[1-9]00|950)(/[0-9]+)?([^[:alnum:]_-]|$)"
re_funcion='(^|[^[:alnum:]_-])(rgba?|hsla?|oklch|oklab)\([^)]*\)'

hallazgos=""
while IFS="$TAB" read -r n texto; do
  [ -n "$n" ] || continue
  while IFS= read -r v; do
    [ -n "$v" ] || continue
    hallazgos+="  - ${rel}:${n} → ${v}"$'\n'
  done < <(
    {
      printf '%s\n' "$texto" | grep -oE "$re_hex" | grep -oE '#[0-9A-Fa-f]+'
      printf '%s\n' "$texto" | grep -oE "$re_paleta" | grep -oE "(${utilidades})-(${nombres})-(50|[1-9]00|950)(/[0-9]+)?"
      printf '%s\n' "$texto" | grep -oE "$re_funcion" | grep -oE '(rgba?|hsla?|oklch|oklab)\(.*' | grep -vE '^[a-z]+\([[:space:]]*var\('
    } 2>/dev/null
  )
done <<< "$lineas"

[ -n "$hallazgos" ] || exit 0

mensaje="Color a pelo en lo que acabas de escribir (el archivo se ha guardado igual):
${hallazgos}Usa un valor con nombre de frontend/src/index.css (bg-primary, text-muted-foreground, border-border, text-destructive...) en vez de un literal. Si no hay ninguno que sirva, define el token nuevo en index.css y úsalo por su nombre."

jq -n --arg m "$mensaje" '{hookSpecificOutput: {hookEventName: "PostToolUse", additionalContext: $m}}'
exit 0
