---
name: backend-feature
description: Orquesta cualquier tarea de backend de FlowSync: explora el Requirement y el código, propone un plan por capas y espera aprobación, lanza test-writer (tests de contrato en rojo), congela los tests por su huella, lanza implementer hasta el verde, comprueba que los tests no cambiaron y cierra con la base (MCP dbhub), el contrato OpenAPI y Postman. Usar SIEMPRE que se toque backend/, aunque no se pida.
---
# Una funcionalidad de backend, de punta a punta

El orden es la garantía: los tests se escriben a partir del spec antes que el código,
se congelan, y el código obedece a los tests y no al revés. **No se reordena ni se
salta ningún paso.** Si uno falla, se dice y se para en ese paso.

Las reglas del proyecto no se copian aquí: ramas, commit y PR están en `CLAUDE.md`,
las de base de datos en `docs/convenciones/base-de-datos.md` y las de migraciones
en `.claude/skills/revisar-migracion/SKILL.md`. Si chocan con esta skill, mandan
ellas.

**Lugares:** `node ace` solo funciona desde `backend/`; `make` se lanza desde la
raíz. Las huellas y las salidas largas van al scratchpad de la sesión, nunca al repo.

## 1. Explora

- Lee el Requirement entero y todos sus Scenarios en `openspec/specs/<capability>/spec.md`. Delimita qué Requirements entran y cuáles no, y escríbelo.
- Lee el código con el que se va a encajar: la capability más parecida (controlador, validador, transformer, servicio, `app/openapi/schemas.ts`, `start/routes.ts`), los modelos que toca, `database/factories/`, `database/seeders/main_seeder.ts` y los tests que ya existen.
- Si hay base de datos implicada, mira el esquema real por el MCP `dbhub` (convención 1). Si no está conectado, dilo (ver «Cierre», paso 8).
- Mira en qué rama estás y aplica la regla de ramas de `CLAUDE.md` antes de tocar nada.

## 2. Propón el plan y PARA

Una tabla con **una fila por capa**, en este orden, con su archivo y su comando:

| Capa | Archivo | Comando |
|---|---|---|
| Tests de contrato | `backend/tests/functional/<cap>/<nombre>.spec.ts` | `node ace make:test <cap>/<nombre> --suite=functional` |
| Migración | `backend/database/migrations/<ts>_….ts` | `node ace make:migration …` |
| Modelo | `backend/app/models/….ts` | `node ace make:model …` |
| Factory | `backend/database/factories/…_factory.ts` | `node ace make:factory …` |
| Seeder | `backend/database/seeders/…_seeder.ts` | `node ace make:seeder …` |
| Validator | `backend/app/validators/….ts` | `node ace make:validator …` |
| Servicio | `backend/app/services/…_service.ts` | `node ace make:service …` |
| Transformer | `backend/app/transformers/…_transformer.ts` | `node ace make:transformer …` |
| Controlador | `backend/app/controllers/…_controller.ts` | `node ace make:controller …` |
| Ruta | `backend/start/routes.ts` | a mano |
| Esquemas OpenAPI | `backend/app/openapi/schemas.ts` | a mano |
| README de la capability | `docs/capabilities/<cap>/README.md` | a mano |

**La capa que no haga falta se declara, no se omite:** su fila dice «no hace falta» y
por qué (p. ej. «Transformer: se reutiliza `TaskAssigneeTransformer`, que ya da
`{ id, fullName, initials }`»).

Añade al plan:
- **El contrato mínimo de persistencia** que compartirán los dos subagentes (tabla y columnas), si los tests necesitan afirmar «no se crea nada» y la API todavía no tiene un camino de lectura. Es lo único fuera del spec que comparten.
- Las decisiones abiertas que el usuario debe ver: `onDelete` de cada clave foránea, CHECK sí o no.
- Si la migración mueve datos, el recuento y la rama (convención 5).

**Para y espera la aprobación explícita del usuario.** Sin ella no se lanza nada.
Si cambia el plan, rehazlo y vuelve a parar.

## 3. Lanza `test-writer`

Agente `test-writer`. Pásale: los Requirements (texto literal o ruta y nombres), la
carpeta de destino, el contrato mínimo de persistencia y las fechas fijas que deban
usarse. Recuérdale que no lee `backend/app/`.

Cuando termine, **lee tú los tests**. Comprueba que hay al menos uno por Scenario, que
las aserciones son estrictas, que no usan el reloj y que los correos van en
`@example.com`.

## 4. Comprueba el rojo

`make test` desde la raíz, con la salida completa guardada en el scratchpad. Enseña:
- el recuento (`Tests N passed, M failed`);
- que los que ya existían siguen en verde;
- por qué falla **cada** test nuevo (la ruta no existe y da 404, la tabla no existe…).

**Si algún test nuevo nace en verde, para y díselo al usuario.** No lo debilites ni
lo borres. Señala también los tests cuyo rojo es accidental: un 404 de «recurso
inexistente» se pone en verde en cuanto existe la tabla, aunque falte la ruta,
porque no se distingue del 404 de «ruta inexistente».

## 5. Congela los tests

```bash
git add backend/tests/functional/<cap>/
shasum -a 256 backend/tests/functional/<cap>/*.spec.ts > <scratchpad>/congelados.sha256
```

El `git add` no es un commit: deja los tests en el índice para que cualquier cambio
posterior aparezca en `git diff`. La huella es la garantía; no hay hook que lo vigile.

## 6. Lanza `implementer`

Agente `implementer`. Pásale: los Requirements, el plan aprobado (la tabla), el
contrato de persistencia, la lista de tests congelados y la instrucción de llegar a
`make test` en verde sin tocar `backend/tests/`.

**Si devuelve una disputa** sobre un test, no la resuelvas tú: llévasela al usuario
con el test, lo que exige y lo que dice el spec. Si el usuario da la razón a la
disputa, el test lo reescribe `test-writer`, se vuelve al paso 4 y se congela de
nuevo. Nunca lo edita `implementer` ni lo editas tú.

## 7. Comprueba que los tests no cambiaron y que todo está en verde

```bash
shasum -a 256 -c <scratchpad>/congelados.sha256   # tiene que dar OK en todos
git diff --stat -- backend/tests/                 # tiene que salir vacío
make test                                         # verde entero, ejecutado por ti
```

No te fíes del informe del subagente: ejecútalo tú. Si `make test` falla **al
arrancar** justo después de crear un controlador, ejecuta una vez
`npm --prefix backend test` (regenera el registro de rutas en `.adonisjs/`) y repite.

Ejecuta el seeder nuevo sobre la base de desarrollo, desde `backend/`:
`node ace db:seed --files=./database/seeders/<nombre>_seeder.ts`. Lánzalo **dos
veces** para demostrar que es idempotente: el recuento no puede cambiar entre la
primera y la segunda.

## 8. Cierre: lo que no se puede dejar para después

**a. La base de desarrollo, por el MCP `dbhub`.** Con `search_objects` y
`execute_sql`: que existe la tabla, sus columnas con tipo y nulabilidad, sus claves
foráneas con su `ON DELETE` y sus CHECK, y las filas que dejó el seeder (recuento y
una muestra). `dbhub` se conecta como `flowsync_ro`, que **no existe** hasta haber
lanzado `make db-readonly`. Si el MCP sale como fallido al conectar (`Connection
closed`), lo más probable es que falte ese rol: díselo al usuario (`! make
db-readonly` y reconectar con `/mcp`). Si no se puede, haz la comprobación por
`psql` en modo solo lectura dentro del contenedor y **di que no se hizo por el MCP**.

**b. El contrato OpenAPI.**
```bash
npm --prefix backend run openapi:generate
npm --prefix backend run openapi:check
```
`openapi:check` tiene que salir con 0 después de `generate`. Fallo conocido (visto el
2026-10-20): los dos comandos fallaban al cargar ace con `Invalid command exported
from "openapi_check.js" file. Invalid URL`, y ya fallaban antes del cambio. Si sigue
así, dilo con la salida, no des el contrato por regenerado y sigue. No lo arregles
dentro de esta skill: es otra tarea.

**c. Postman.** Busca las herramientas del MCP de Postman (`ToolSearch` con
«postman»). En el workspace **FlowSync**, que se crea si no existe:
- si la spec de la API ya existe, actualízala con `docs/api/openapi.json` y sincroniza su colección;
- si no existe, créala a partir de `docs/api/openapi.json` y genera la colección.

Si el MCP de Postman no está configurado o no responde, dilo y sigue. Si el paso b no
regeneró el documento, avisa de que Postman recibe un `openapi.json` sin el cambio.

## 9. Informe final

- Tabla capa → archivo → comando con el que se creó (o «a mano», o «no hace falta» y por qué).
- Los tests: el recuento en rojo antes y en verde después, con los títulos nuevos.
- El resultado de `shasum -c`.
- Las decisiones del implementador que el usuario debería revisar.
- Lo que quedó sin hacer en el cierre (dbhub, OpenAPI, Postman) y por qué.
- `git status -sb`.

El commit no forma parte de esta skill: va con `/commit` según `CLAUDE.md`. Y en ese
commit tienen que ir el diff de `.adonisjs/` y el README de la capability.

## Lo que falló la primera vez (comentarios, 2026-10-20)

- **Los tests necesitaban ver la base y la API no tenía lectura:** el `GET` del hilo era un Requirement posterior. Se resolvió acordando en el plan la tabla y las columnas, y pasándoselas a los dos subagentes.
- **`--files=<capability>` no ejecuta nada.** Hay que pasar cada fichero: `--files=<cap>/<fichero>`.
- **El implementador intentó vaciar `db-test` con un `TRUNCATE`** para probar el seeder, y el hook `sin-borrar-datos.sh` lo bloqueó. No se esquiva: el seeder se prueba sobre desarrollo, en el paso 7.
- **`docker compose restart db-test` deja la base de pruebas vacía**, porque está en `tmpfs`. `make test` vuelve a migrarla sola; `node ace test` a secas no.
- **`dbhub` no conectó en toda la sesión** porque faltaba `make db-readonly`. Compruébalo al empezar, no al cerrar.
- **`npm run lint` ya fallaba en `tests/functional/tasks/overdue.spec.ts`** (2 avisos que no son del cambio). Distingue lo heredado de lo nuevo antes de dar el lint por roto.
