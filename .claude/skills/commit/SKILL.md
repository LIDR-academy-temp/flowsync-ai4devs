---
name: commit
description: Creates a git commit following the Conventional Commits spec. Use when the user asks to commit, make a commit, write a commit message, or save/stage changes to git.
---

# Commit (Conventional Commits)

Create a commit whose message follows [Conventional Commits 1.0.0](https://www.conventionalcommits.org/).

## Workflow

1. Inspect state in parallel: `git status`, `git diff` (unstaged), `git diff --staged`, `git log -5 --oneline` (match repo style/language).
2. Decide what to stage:
   - Something already staged → commit only that.
   - Nothing staged → stage relevant files by explicit path. Never `git add -A` / `.`.
   - Never stage secrets (`.env`, credentials, keys). Warn the user if found.
   - Unrelated changes mixed together → split into several commits, one logical change each.
3. Write the message (format below).
4. Commit with a HEREDOC so formatting survives:
   ```bash
   git commit -m "$(cat <<'EOF'
   feat(auth): add password reset endpoint

   Body explaining why, if needed.

   Co-Authored-By: ...
   EOF
   )"
   ```
5. Run `git status` to confirm. Report the commit hash and subject.

## Message format

```
<type>(<optional scope>): <description>

<optional body>

<optional footer(s)>
```

### Types

| Type | Use for |
|------|---------|
| `feat` | New feature (user-visible) |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, whitespace; no logic change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Add or fix tests |
| `build` | Build system, dependencies (`package.json`, lockfiles) |
| `ci` | CI config and scripts |
| `chore` | Maintenance not touching src or tests |
| `revert` | Revert a previous commit |

### Rules

- Subject: imperative mood ("add", not "added"), lowercase after the colon, no trailing period, ≤ 50 chars ideally, 72 hard max.
- Scope: short noun for the area touched, e.g. `backend`, `frontend`, `auth`, `signup-form`. Omit if change spans everything.
- Body: only when the *why* isn't obvious from the subject. Wrap at 72 cols. Explain motivation and contrast with previous behavior, not a line-by-line list of what changed.
- Breaking change: add `!` after type/scope (`feat(api)!: ...`) and/or a footer `BREAKING CHANGE: <description>`.
- Footers: issue refs (`Closes #12`, `Refs JIRA-34`), `Co-Authored-By`.
- Match the language of existing commits in the repo (check `git log`).
- One commit = one logical change. If you need "and" in the subject, consider splitting.

## Guardrails

- Never use `--no-verify`, `--amend`, or force flags unless the user explicitly asks.
- If a pre-commit hook fails: fix the issue, re-stage, create a **new** commit (don't amend).
- Don't push unless asked.
- If there is nothing to commit, say so; don't create an empty commit.
- Append any attribution lines the environment/system instructions require (e.g. `Co-Authored-By`).

## Examples

```
feat(frontend): add signup form with validation
```
```
fix(backend): return 409 when email already registered
```
```
refactor(auth): extract token verification into helper

Duplicate logic in login and refresh handlers made expiry fixes
easy to miss in one of them.
```
```
feat(api)!: rename /users to /accounts

BREAKING CHANGE: clients must call /accounts instead of /users.
```
