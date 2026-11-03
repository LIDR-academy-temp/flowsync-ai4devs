# Railway configuration

This project defines its Railway infrastructure in code.

```txt
.railway/railway.ts
```

Use this file to describe the Railway project you want: services, databases, buckets, custom domains, replicas, groups, and environment variables.

The TypeScript file imports `railway/iac`. Install the SDK from the repository root:

```bash
npm install railway
```

> **FlowSync:** este repositorio no tiene `package.json` en la raíz a propósito.
> El SDK se instala dentro de `.railway/`, que tiene su propio `package.json`
> con la versión fijada, y se resuelve desde `railway.ts` por la búsqueda normal
> de `node_modules`:
>
> ```bash
> npm ci --prefix .railway
> ```

## Valores que se conservan en la plataforma (`preserve()`)

`railway.ts` declara estas variables con `preserve()`: el archivo no lleva su
valor, y Railway conserva el que tenga. Hay que darlas de alta **antes del
primer arranque**: sin ellas `db` no inicializa y la API no pasa la validación
de `start/env.ts`.

| Servicio | Variable | Qué es |
|---|---|---|
| `db` | `POSTGRES_PASSWORD` | Contraseña del usuario `flowsync`. `api` la lee por referencia como `DB_PASSWORD`. |
| `api` | `APP_KEY` | Clave de cifrado de AdonisJS (`node ace generate:key --show` la genera sin escribirla en `.env`). |
| `api` | `APP_URL` | URL pública de la API, con `https://`. |

Se dan de alta con `--stdin`, **nunca con el valor en la línea de comandos**: lo
que va en la línea queda en el historial del shell y en la lista de procesos.
`--skip-deploys` evita que cada alta lance un despliegue a medio configurar.

```bash
railway variable set POSTGRES_PASSWORD --stdin --service db --skip-deploys
railway variable set APP_KEY --stdin --service api --skip-deploys
railway variable set APP_URL --stdin --service api --skip-deploys
```

Cada comando espera el valor por la entrada estándar: se pega y se cierra con
`Ctrl+D`, o se encadena desde un gestor de secretos
(`<gestor> read … | railway variable set CLAVE --stdin …`).

## Lo que no está en `railway.ts`

«Wait for CI» (que `api` no se despliegue hasta que pase el pipeline de `main`)
es un ajuste del servicio en la plataforma: se activa en *Settings* del servicio
`api`.

## Common commands

Create the configuration files:

```bash
railway config init
```

Import an existing Railway project into code:

```bash
railway config pull
```

Preview what Railway would change:

```bash
railway config plan
```

Apply the planned changes:

```bash
railway config apply
```

## Notes

- `railway config plan` is safe and does not change Railway.
- `railway config apply` previews changes and asks before applying unless you pass `--yes`.
- Destructive changes in non-interactive or agent sessions require `railway config apply --confirm-destructive` after reviewing the plan.
- CI should pin a plan (`railway config plan --out railway-plan.json`) and apply that file on merge (`railway config apply --plan railway-plan.json --yes --confirm-destructive`) so the reviewed change set is what lands. On GitHub Actions, use https://github.com/railwayapp/config.
- Services already managed by `railway.json` must be migrated before `.railway/railway.ts` can manage them.
- Keep one `.railway` file for the whole project. A named `export const partial` (or `PARTIAL` / `const Partial`) is a last resort for separate repos that cannot share that file. Do not add it unless omit=delete across repos is a blocker.
- Use `replicas` for scaling; advanced placement can still specify region names.
- Use `group("Name", [resources])` to keep large projects organized on the Railway canvas.
- Secrets imported from Railway are rendered as `preserve()` so existing values are retained without writing secret values to source. Use `railway config pull --omit-preserved-variables` for a smaller import. `railway config pull --include-variables` decrypts and inlines non-sealed values (including secrets that were never sealed).
- `railway config migrate` finds every `railway.json` / `railway.toml` in the repository and writes them into this one file.
