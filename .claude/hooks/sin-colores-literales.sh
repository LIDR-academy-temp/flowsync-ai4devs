#!/usr/bin/env bash
# PostToolUse (Write|Edit): AVISA —no bloquea nada, sale 0 siempre— cuando lo
# que se ha escrito dentro de `frontend/src/` trae un color literal en vez de
# un token del sistema. Mira solo el texto que se INTRODUCE (`content` de
# Write, `new_string` de Edit), no el fichero entero: lo que importa es lo que
# añade este cambio, no lo que ya estaba.
#
# Va en PostToolUse y no en PreToolUse a propósito, y no es un detalle: de un
# hook que sale 0 en PreToolUse, Claude NO ve el stderr, y `systemMessage` no
# está garantizado en ese evento. El aviso se quedaría sin llegar a nadie. En
# PostToolUse sí hay dos canales documentados y ninguno bloquea:
#   - `hookSpecificOutput.additionalContext`, que aparece junto al resultado de
#     la herramienta y por tanto lo lee Claude;
#   - `systemMessage`, que es lo que ve la persona.
# Con `exit 0` la escritura ya está hecha y se queda hecha: esto informa, no
# impide. (El `exit 2` de PostToolUse también serviría —la tabla de la
# documentación dice «can block: No»— pero enmarca el aviso como un error del
# hook, y esto no es un error.)
#
# Qué cuenta como color literal:
#   - hexadecimal: #fff, #ffffff, #ffffffff (también dentro de un valor
#     arbitrario de Tailwind, `bg-[#1e40af]`)
#   - clase de paleta cruda con escala: bg-blue-500, hover:text-red-600,
#     dark:border-zinc-800/50
#   - utilidad de blanco o negro crudo: bg-white, text-black
#   - función de color con valores a pelo: rgb(), rgba(), hsl(), oklch()…
#   - color con nombre en una declaración CSS: `color: red`
#
# Lo que hay que usar en su lugar son los tokens semánticos del tema
# (bg-background, text-muted-foreground, border-destructive…), definidos en
# `frontend/src/index.css`. Por eso ese fichero está EXENTO: es la única
# frontera del proyecto donde un color literal es la respuesta correcta —
# Tailwind v4 no tiene `tailwind.config.js` y los tokens viven ahí.
#
# ESTO ES UNA RED, NO UN CANDADO. Lo que NO ve:
#   - Una escritura que no pase por Write ni por Edit: `sed -i`, un heredoc,
#     `python - <<PY`, `npx shadcn add`, `prettier --write`… todo eso entra por
#     Bash y este hook ni se entera. Es el agujero grande y es consciente:
#     taparlo pedía interceptar Bash y adivinar qué fichero toca cada orden.
#   - Un color que llega indirecto: una variable con el hex (`const AZUL =`
#     armado por partes), una clase construida en tiempo de ejecución
#     (`` `bg-${color}-500` ``), un `style` con un valor que viene de la API.
#   - Un token inventado: `bg-marca` pasa limpio aunque no exista en el tema.
#     Eso lo caza el navegador, no esto.
# Y al revés: puede avisar de más. Un `#deadbeef` en un comentario o en el
# fragmento de una URL parece un hex. El aviso no bloquea justamente por eso:
# decide la persona.
set -uo pipefail

entrada=$(cat)

ruta=$(printf '%s' "$entrada" | jq -r '.tool_input.file_path // empty')
[ -n "$ruta" ] || exit 0

root="${CLAUDE_PROJECT_DIR:-}"
[ -n "$root" ] || root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0

# La ruta llega absoluta; se relativiza para poder comparar y para citarla
# corta en el aviso.
rel="${ruta#"$root"/}"
case "$rel" in
  frontend/src/*) ;;
  *) exit 0 ;;
esac

# El fichero de los tokens: aquí los literales son la definición, no el error.
[ "$rel" = "frontend/src/index.css" ] && exit 0

# Solo el texto que entra: `content` (Write) o `new_string` (Edit). El
# `old_string` se deja fuera a propósito — un color que ya estaba y que este
# cambio se limita a mover no lo ha introducido este cambio.
texto=$(printf '%s' "$entrada" | jq -r '
  [ .tool_input.content?, .tool_input.new_string?,
    (.tool_input.edits? // [] | .[]? | .new_string?) ]
  | map(select(type == "string")) | join("\n")
')
[ -n "$texto" ] || exit 0

paleta='slate|gray|grey|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
utilidad='bg|text|border|ring|outline|divide|from|via|to|shadow|decoration|accent|caret|fill|stroke|placeholder'
nombradas='red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey|cyan|magenta|lime|navy|teal|olive|maroon|silver|gold|aqua|fuchsia|indigo|violet|salmon|crimson|khaki|beige|ivory|coral|orchid|plum|tan|turquoise|wheat'

hallazgos=()

# Devuelve hasta tres muestras distintas de lo que casa con el patrón. El
# `sed` quita el carácter de frontera que arrastra el patrón (la comilla o el
# punto y coma que cierran, el espacio siguiente): está en la expresión para
# no picar en una palabra más larga, pero no es parte del color.
muestras() {
  printf '%s\n' "$texto" \
    | grep -oE "$1" 2>/dev/null \
    | sed -E "s/[]['\"[:space:];,:{}<>\\\\]+\$//" \
    | grep -E "${2:-.}" \
    | sort -u | head -3 | paste -sd, - | sed 's/,/, /g'
}

# anotar <nombre de la regla> <patrón> [filtro sobre las muestras]
anotar() {
  local m
  m=$(muestras "$2" "${3:-}")
  [ -n "$m" ] && hallazgos+=("$1|$m")
}

# 1. Hexadecimal de 3, 4, 6 u 8 dígitos. El `[^0-9A-Za-z_-]` del final evita
#    picar en un SHA de siete o en un identificador más largo. Y el filtro
#    pide que un hex CORTO traiga alguna letra `a-f`: `#1234` y `#123` son casi
#    siempre el número de una issue o de un commit, no un color, mientras que
#    `#fff` y `#1e4` sí lo son. De seis u ocho dígitos se acepta tal cual —
#    `#123456` como número de issue no pasa en la práctica.
anotar 'hexadecimal' \
  '#([0-9A-Fa-f]{8}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{3,4})([^0-9A-Za-z_-]|$)' \
  '^#([0-9A-Fa-f]{6,8}$|[0-9A-Fa-f]{0,3}[A-Fa-f])'

# 2. Paleta cruda con escala, con o sin modificador (hover:, dark:, sm:) y con
#    o sin opacidad (/50).
anotar 'clase de paleta cruda' "(${utilidad})-(${paleta})-(50|100|200|300|400|500|600|700|800|900|950)(/[0-9]+)?"

# 3. Blanco y negro crudos: son paleta igual que el resto.
anotar 'blanco o negro crudo' "(${utilidad})-(black|white)(/[0-9]+)?([^0-9A-Za-z_-]|$)"

# 4. Función de color con los valores a pelo.
anotar 'función de color' '(rgba?|hsla?|oklch|oklab|lab|lch|color-mix|hwb)\('

# 5. Color con nombre, pero solo como valor de una declaración CSS: suelto, un
#    nombre como `red` o `plum` es una palabra cualquiera.
anotar 'color con nombre' "(color|background|background-color|border-color|outline-color|text-decoration-color|fill|stroke|caret-color|accent-color)[[:space:]]*:[[:space:]]*(${nombradas})([^0-9A-Za-z_-]|$)"

[ -n "${hallazgos[*]:-}" ] || exit 0

aviso="Aviso de sin-colores-literales.sh — $rel introduce color literal:"
for h in "${hallazgos[@]}"; do
  aviso+=$'\n'"  - ${h%%|*}: ${h#*|}"
done
aviso+=$'\n'"Usa los tokens semánticos del tema (bg-background, text-muted-foreground, border-destructive…), definidos en frontend/src/index.css. Si de verdad hace falta un color nuevo, se añade allí como token y se usa por su nombre."
aviso+=$'\n'"El fichero YA está escrito y se queda así: esto es un aviso, no un bloqueo. Repásalo y cámbialo si procede."

# Dos canales, los dos documentados y ninguno bloqueante: `additionalContext`
# se coloca junto al resultado de la herramienta (lo lee Claude) y
# `systemMessage` es lo que ve la persona. Y se sale 0.
jq -nc --arg m "$aviso" '{
  systemMessage: $m,
  hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: $m }
}'

exit 0
