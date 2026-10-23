#!/usr/bin/env bash
# PostToolUse hook (Edit|Write): format backend/ and frontend/ files with the
# backend's Prettier + @adonisjs/prettier-config (frontend has no formatter of
# its own and already follows the same style: no semis, single quotes).
f=$(jq -r '.tool_response.filePath // .tool_input.file_path')
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
case "$f" in
  "$root"/backend/*|"$root"/frontend/*) ;;
  *) exit 0 ;;
esac
case "$f" in
  */node_modules/*|*/package-lock.json|*/.adonisjs/*) exit 0 ;;
esac
cd "$root/backend" || exit 0
./node_modules/.bin/prettier --config package.json --ignore-unknown --write "$f"
