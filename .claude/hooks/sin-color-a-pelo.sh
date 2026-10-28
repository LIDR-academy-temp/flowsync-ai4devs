#!/usr/bin/env bash
# PostToolUse (Write|Edit): AVISA, sin bloquear, cuando el texto que se acaba de
# escribir en un archivo de frontend/src/ lleva un color a pelo:
#   - un hexadecimal de 3, 4, 6 u 8 cifras (#1D4ED8)
#   - una clase de paleta cruda de Tailwind (bg-blue-600, hover:text-red-500,
#     border-white/20...)
# frontend/src/index.css queda fuera: ahí es donde el valor literal sí se escribe.
# El aviso vuelve al agente como contexto adicional (exit 0), no como error.
#
# ESTO ES UNA RED, NO UN CANDADO. Solo mira el texto nuevo de ESTA edición
# (`content` en Write, `new_string` en Edit), no el archivo entero; no ve
# `rgb()`/`hsl()`/`oklch()` ni colores con nombre (`red`), ni clases armadas
# por concatenación. Y puede dar falsos positivos, p. ej. un ancla `#add`.
set -uo pipefail

entrada=$(cat)
ruta=$(printf '%s' "$entrada" | jq -r '.tool_response.filePath // .tool_input.file_path // empty')
[ -n "$ruta" ] || exit 0

raiz="${CLAUDE_PROJECT_DIR:-$PWD}"
case "$ruta" in
  "$raiz/frontend/src/index.css") exit 0 ;;
  "$raiz"/frontend/src/*) ;;
  *) exit 0 ;;
esac

texto=$(printf '%s' "$entrada" | jq -r '.tool_input.content // .tool_input.new_string // empty')
[ -n "$texto" ] || exit 0

paleta='slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
prefijos='bg|text|border|ring|ring-offset|outline|fill|stroke|from|via|to|divide|decoration|accent|caret|shadow|placeholder'
re_hex='(?<![\w&-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])'
re_clase="(?<![\w-])(?:${prefijos})-(?:(?:${paleta})-[0-9]{2,3}|white|black)(?![\w-])"

hallazgos=$(
  printf '%s\n' "$texto" | grep -Po "${re_hex}|${re_clase}" | sort -u | head -10 | paste -sd ' ' -
)
[ -n "$hallazgos" ] || exit 0

ruta_corta=${ruta#"$raiz"/}
aviso="AVISO de sin-color-a-pelo.sh (no bloquea): ${ruta_corta} lleva colores a pelo: ${hallazgos}. Usa los tokens semánticos de frontend/src/index.css (bg-background, text-foreground, bg-primary, text-muted-foreground, border-border, bg-destructive...). Si falta un color, defínelo como token en index.css y úsalo por su nombre."

jq -n --arg m "$aviso" '{hookSpecificOutput: {hookEventName: "PostToolUse", additionalContext: $m}}'
exit 0
