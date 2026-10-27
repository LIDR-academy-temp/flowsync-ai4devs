#!/usr/bin/env bash
# PostToolUse (Write|Edit|MultiEdit): AVISA (exit 2) cuando lo que se acaba de
# escribir en `frontend/src/` trae un color a pelo:
#   - un hexadecimal literal (`#fff`, `#1e40af`, `bg-[#0f0]`…)
#   - una clase de la paleta cruda de Tailwind: familia de color más número
#     (`bg-blue-600`, `text-red-500`, `hover:border-slate-200`, `ring-sky-400/50`…)
# `frontend/src/index.css` queda EXCEPTUADO: es la capa donde el valor literal
# sí se escribe, y una sola vez. Cualquier archivo fuera de `frontend/src/`
# sale con 0 sin decir nada.
#
# AVISA, NO BLOQUEA. En PostToolUse la escritura ya está hecha cuando esto
# corre: el exit 2 solo le enseña el mensaje al agente. Hay casos legítimos; lo
# que se busca es que la desviación se vea, no que sea imposible.
#
# Solo mira el texto que entra en esta operación (`content` en Write,
# `new_string` en Edit, cada `edits[].new_string` en MultiEdit), no el archivo
# entero: lo que ya estaba no se vuelve a señalar en cada edición.
#
# ESTO ES UNA RED, NO UN CANDADO. Lo que NO ve:
#   - Lo que se escribe por Bash (`sed`, heredoc, `cat >`): no pasa por Write
#     ni Edit.
#   - Una clase armada por partes (`'bg-' + color + '-600'`) o en una variable.
#   - `rgb(`, `oklch(`, `bg-white`, `text-black` o colores CSS por nombre
#     (`red`, `tomato`): no son ni hexadecimal ni familia más número.
# Y puede avisar de más: un `#123` en un comentario parece un hexadecimal.
set -uo pipefail

entrada=$(cat)

# La ruta, como la saca el hook de Prettier de `settings.json`.
f=$(printf '%s' "$entrada" | jq -r '.tool_response.filePath // .tool_input.file_path // empty')
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
    my $familia = "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
    my $utilidad = "bg|text|border(?:-[trblxyse])?|ring(?:-offset)?|outline|divide|fill|stroke|from|via|to|shadow|decoration|accent|caret|placeholder";
    print for /(?<![&\w])(#(?:[[:xdigit:]]{8}|[[:xdigit:]]{6}|[[:xdigit:]]{3,4}))(?![\w-])/g;
    print for /(?<![\w-])((?:$utilidad)-(?:$familia)-(?:50|[1-9]00|950)(?:\/\d+)?)(?![\w-])/g;
  ' | sort -u | paste -sd ',' - | sed 's/,/, /g'
)
[ -n "$hallazgos" ] || exit 0

rel=${f#"$root"/}
{
  echo "AVISO de color-con-nombre.sh: ${rel} introduce colores a pelo: ${hallazgos}."
  echo "El valor con nombre está en frontend/src/index.css (bg-primary, text-muted-foreground, border, bg-destructive…); úsalo en su lugar, o declara por qué este caso es la excepción."
  echo "No se ha bloqueado nada: la escritura ya está hecha."
} >&2
exit 2
