# Railway configuration

This project defines its Railway infrastructure in code.

```txt
.railway/railway.ts
```

Use this file to describe the Railway project you want: services, databases, buckets, custom domains, replicas, groups, and environment variables.

The TypeScript file imports `railway/iac`. In FlowSync the SDK lives in this folder, not at the repository root (which has no `package.json` on purpose):

```bash
cd .railway && npm ci
```

## Variables que se conservan en la plataforma (`preserve()`)

`railway.ts` declara tres variables sin valor: existen, pero su valor vive solo en Railway. Hay que darlas de alta **antes del primer arranque**, una vez creados los servicios y antes de desplegarlos:

| Servicio | Variable | Qué es |
|---|---|---|
| `db` | `POSTGRES_PASSWORD` | contraseña de PostgreSQL; la API la lee por referencia como `DB_PASSWORD` |
| `api` | `APP_KEY` | clave de cifrado de AdonisJS |
| `api` | `APP_URL` | URL pública de la API, con `https://` (el dominio que asigne Railway) |

Se dan de alta **siempre por la entrada estándar**, nunca con el valor en la línea de comandos: un `KEY=VALUE` como argumento queda en el historial de la shell y lo ve cualquiera que liste los procesos.

```bash
# Secretos: se generan y se pasan por una tubería, sin que nadie llegue a verlos.
openssl rand -hex 32 | railway variable set POSTGRES_PASSWORD --stdin --service db --skip-deploys
openssl rand -hex 32 | railway variable set APP_KEY --stdin --service api --skip-deploys

# APP_URL no es secreta, pero entra igual: se lanza, se pega el valor y se cierra con Ctrl-D.
railway variable set APP_URL --stdin --service api --skip-deploys
```

`--skip-deploys` evita que cada alta lance un despliegue a medias. Cambiar `POSTGRES_PASSWORD` cuando la base ya está inicializada no cambia la contraseña de PostgreSQL (la imagen solo la lee al crear el directorio de datos): rotarla es un `ALTER ROLE` en la base, además de esto.

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
