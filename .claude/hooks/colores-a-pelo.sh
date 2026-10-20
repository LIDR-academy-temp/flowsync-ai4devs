#!/usr/bin/env bash
# PostToolUse (Write|Edit): tras escribir un archivo de frontend/src/, AVISA si
# trae un color escrito a pelo en vez de un token de src/index.css. No bloquea
# nunca (sale siempre 0): el aviso vuelve a Claude como `additionalContext` en
# un JSON por la salida estándar, y a la persona como `systemMessage`.
#
# Mismo momento y mismo filtro de archivos que el hook de Prettier de
# settings.json, más estrecho: solo frontend/src/, y fuera frontend/src/index.css,
# que es justo donde los valores se declaran.
#
# Lo que VE, en el archivo entero tal y como queda en disco:
#   - Hexadecimales de 3, 4, 6 u 8 cifras (`#fff`, `#1e40af`, `bg-[#1e40af]`).
#   - Funciones de color: rgb(), rgba(), hsl(), hsla(), oklch().
#   - Clases de la paleta cruda de Tailwind, con o sin variante delante
#     (`hover:`, `dark:`…): `bg-blue-600`, `text-red-500`, `border-x-gray-200`,
#     `ring-emerald-400/50`, y también `text-white` / `bg-black`.
#
# Lo que NO ve:
#   - Colores por nombre de CSS (`red`, `tomato`), `transparent`/`currentColor`,
#     y lab(), lch(), hwb(), oklab() o color(): solo las cinco funciones de arriba.
#   - Clases armadas en tiempo de ejecución (`bg-${tono}-600`) o que llegan por
#     una variable, una prop o un objeto de configuración desde otro archivo.
#   - Archivos que no se tocan con Write/Edit: lo que escriba un `sed`, un
#     script o `npx shadcn add` por Bash, y todo lo que hay fuera de src/.
#   - Si el color es nuevo o ya estaba: mira el archivo entero, así que editar
#     una línea de un archivo que ya tenía uno vuelve a avisar (p. ej. el
#     `text-white` del `button.tsx` generado por shadcn).
#   - Falsos positivos posibles: un ancla o un texto con forma de hex (`#add`,
#     `#cafe`) también avisa. Por eso avisa y no bloquea.
set -uo pipefail

f=$(jq -r '.tool_response.filePath // .tool_input.file_path // empty')
root="${CLAUDE_PROJECT_DIR:-}"
[ -n "$f" ] && [ -n "$root" ] && [ -f "$f" ] || exit 0

case "$f" in
  "$root"/frontend/src/index.css) exit 0 ;;
  "$root"/frontend/src/*) ;;
  *) exit 0 ;;
esac

NO='[^[:alnum:]_-]'
HEX="(^|[^[:alnum:]_&/-])#([[:xdigit:]]{3,4}|[[:xdigit:]]{6}|[[:xdigit:]]{8})($NO|\$)"
FUNC="(^|$NO)(rgba?|hsla?|oklch)\\("
PALETA='slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
UTIL='bg|text|border|border-[trblxyse]|ring|ring-offset|outline|divide|fill|stroke|from|via|to|shadow|accent|caret|decoration|placeholder'
CLASE="(^|$NO)($UTIL)-(($PALETA)-(50|[1-9]00|950)|white|black)($NO|\$)"

hallazgos=$(grep -nE "$HEX|$FUNC|$CLASE" "$f" | cut -c1-160 | head -20)
[ -n "$hallazgos" ] || exit 0

rel="${f#"$root"/}"
aviso="AVISO de colores-a-pelo.sh: $rel tiene colores escritos a pelo:
$hallazgos

Los colores salen de los tokens de frontend/src/index.css (bg-primary, text-muted-foreground, bg-destructive, border…), no de valores sueltos ni de la paleta cruda de Tailwind. Si falta un token, se declara en index.css y se usa por su nombre. Si es un falso positivo o un componente generado de src/components/ui/, déjalo y dilo."

jq -n --arg ctx "$aviso" --arg msg "colores-a-pelo: $rel tiene colores escritos a pelo" '{
  systemMessage: $msg,
  hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: $ctx }
}'
exit 0
