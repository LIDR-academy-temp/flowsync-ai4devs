# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

FlowSync is a monorepo with two independent npm projects (no root `package.json`, no workspaces). Run every command from inside `backend/` or `frontend/`.

- `backend/`: AdonisJS 7 JSON API (Lucid ORM on SQLite via better-sqlite3, VineJS, Japa tests, Tuyau route registry)
- `frontend/`: React 19 + Vite 8 + TypeScript. It is still the untouched Vite template and is not wired to the backend yet.

Commit messages follow Conventional Commits with a scope and are written in Spanish (e.g. `fix(backend): ...`).

## Commands

### Backend (`cd backend`)

First-time setup after a clean clone:
```sh
npm install
cp .env.example .env
node ace generate:key        # fills APP_KEY in .env
node ace migration:run       # creates tmp/db.sqlite3 and regenerates database/schema.ts
```

```sh
npm run dev                  # node ace serve --hmr (http://localhost:3333)
npm run build                # production build into build/
npm run lint                 # eslint (@adonisjs/eslint-config)
npm run format               # prettier
npm run typecheck            # tsc --noEmit
npm test                     # node ace test (all suites)
node ace test unit           # one suite: unit | functional
node ace test --files=tests/functional/auth.spec.ts   # one file
node ace test --tests="logs in with valid credentials" # one test by title
node ace list:routes
```

Test suites are defined in `adonisrc.ts`: `unit` covers `tests/unit/**/*.spec.ts` (2s timeout) and `functional` covers `tests/functional/**/*.spec.ts` (30s timeout, HTTP server started automatically). Neither directory exists yet. `.env.test` sets `SESSION_DRIVER=memory`.

### Frontend (`cd frontend`)

```sh
npm install
npm run dev       # vite (http://localhost:5173)
npm run build     # tsc -b && vite build
npm run lint      # oxlint (not eslint)
```

## Backend architecture

**Generated code.** Several files are generated and should not be edited by hand:
- `database/schema.ts`: Lucid schema classes (`UserSchema`, `AuthAccessTokenSchema`, …) generated from the migrations when `node ace migration:run` runs. Models extend these classes (`class User extends compose(UserSchema, withAuthFinder(hash))`), so columns are declared by migrations and never re-declared on the model. Custom type mappings go in `database/schema_rules.ts`.
- `.adonisjs/server/controllers.ts`: controller index created by the `indexEntities` hook in `adonisrc.ts`. Routes reference controllers through it (`[controllers.AccessTokens, 'store']` imported from `#generated/controllers`) rather than importing them directly. New controllers appear there after the dev server or an ace command runs.
- `.adonisjs/client/registry/*`: typed route registry from Tuyau (`generateRegistry()` hook). It is exported as `backend/registry` and `backend/data` in `package.json` for a typed frontend client, and `tests/bootstrap.ts` uses it to type the Japa API client.

These generated files are committed, so regenerate and commit them whenever routes, controllers or migrations change.

**Imports** use the Node subpath aliases from `package.json` (`#models/*`, `#controllers/*`, `#validators/*`, `#transformers/*`, `#start/*`, `#config/*`, `#generated/*`, …). They carry a `.js` extension at runtime even though the sources are `.ts`.

**Request pipeline** (`start/kernel.ts`):
- Server middleware: `force_json_response` rewrites every request's `Accept` header to JSON, so errors always come back as JSON. Then container bindings and CORS.
- Router middleware: bodyparser, session, shield, auth init, `silent_auth`.
- Named middleware: `auth`, applied per route group.

**Auth** (`config/auth.ts`): the default guard is `api`, an opaque access-token guard that stores tokens in the `auth_access_tokens` table via `User.accessTokens` (`DbAccessTokensProvider`). A session-based `web` guard is also configured. Signup and login both return `{ user, token }`, and the client sends the token as `Authorization: Bearer <token>`.

**Response shape.** `providers/api_provider.ts` adds `ctx.serialize()` to `HttpContext`. Its `ApiSerializer` wraps payloads as `{ data: ... }` and validates Lucid paginator metadata. Controllers return `serialize(SomeTransformer.transform(model))`; use `serialize.withoutWrapping(...)` to skip the wrapper. Transformers (`app/transformers/`, extending `BaseTransformer`) whitelist which model fields go out (computed getters such as `User.initials` included).

**Validation.** VineJS validators live in `app/validators/` and are built with `vine.create({...})`. Controllers call them with `request.validateUsing(...)`. `start/validator.ts` globally transforms VineJS dates into Luxon `DateTime`.

**Routes** (`start/routes.ts`): everything sits under `/api/v1`. `auth/signup` and `auth/login` are public, and `account/profile` and `account/logout` are behind `middleware.auth()`.

**CORS** allows every origin in development and none in other environments (`config/cors.ts`).

## Reglas de proceso
- Antes de tocar código: crear una rama nueva (`git checkout -b feat/<slug>`). Nunca commitear directo en `main`/`s1/start`.
- Al cerrar la tarea: usar la skill `/commit`, luego `gh pr create` con una descripción completa de los cambios en el cuerpo del PR.
- Después de abrir el PR: usar el subagente `adversarial-reviewer` sobre él, antes de darlo por terminado.
- No repitas ese resumen en el chat: la sesión se va a perder, el PR no. Responde solo con la URL del PR.