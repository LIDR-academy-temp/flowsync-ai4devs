#!/usr/bin/env bash
# PostToolUse (Write|Edit|MultiEdit): avisa, SIN bloquear, de los colores
# escritos a pelo en frontend/src/:
#   - hexadecimales (#fff, #2563eb, también en clases como bg-[#2563eb])
#   - rgb()/rgba(), hsl()/hsla() y oklch()
# Deja fuera frontend/src/index.css: es la capa donde los valores literales sí
# se escriben, y de la que tiene que salir el color en todo lo demás.
#
# El aviso le llega a Claude como `additionalContext` y el hook sale siempre
# con 0: el archivo ya está escrito, y esto es para corregirlo, no para
# deshacerlo.
#
# ESTO ES UNA RED, NO UN CANDADO. Lo que NO ve, o ve de más:
#   - Mira el archivo entero tal y como queda, no solo lo que se acaba de
#     escribir: un color que ya estaba también se avisa.
#   - Un ancla o un identificador que parezca hexadecimal (`href="#add"`,
#     `#123` en un comentario) da un falso aviso.
#   - Un color armado por partes (`'#' + hex`, `` `rgb(${r}…)` `` con el
#     nombre en otra variable) o uno con nombre (`red`, `white`, `bg-red-500`)
#     no se ve.
#   - Lo que se escriba por Bash (sed, heredoc) no pasa por aquí.
set -uo pipefail

f=$(jq -r '.tool_response.filePath // .tool_input.file_path // empty')
[ -n "$f" ] || exit 0

src="${CLAUDE_PROJECT_DIR:-$PWD}/frontend/src"
case "$f" in
  "$src"/index.css) exit 0 ;;
  "$src"/*) ;;
  *) exit 0 ;;
esac
[ -f "$f" ] || exit 0

# Un hexadecimal de 3, 4, 6 u 8 cifras que no forme parte de otra palabra ni
# de una entidad HTML (`&#123;`), o una función de color hasta su paréntesis.
encontrados=$(grep -noE '(^|[^[:alnum:]_&#])#([[:xdigit:]]{8}|[[:xdigit:]]{6}|[[:xdigit:]]{3,4})([^[:alnum:]_-]|$)|(^|[^[:alnum:]_-])(rgba?|hsla?|oklch)\([^)]*\)?' "$f" 2>/dev/null |
  sed -E 's/^([0-9]+):[^#[:alpha:]]*(#[[:xdigit:]]+|[[:alpha:]]+\([^)]*\)?).*$/\1: \2/')
[ -n "$encontrados" ] || exit 0

rel="${f#"${CLAUDE_PROJECT_DIR:-$PWD}"/}"
aviso="AVISO de color-a-pelo.sh: $rel tiene colores escritos a pelo:
$(printf '%s\n' "$encontrados" | sed "s|^|  - $rel:|")
El color tiene que salir de los valores con nombre de frontend/src/index.css (clases de Tailwind como bg-primary o text-muted-foreground, o var(--…)), no de un literal. Si falta un valor, se añade allí con nombre y se usa desde aquí."

jq -n --arg aviso "$aviso" '{
  systemMessage: $aviso,
  hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: $aviso }
}'
exit 0
