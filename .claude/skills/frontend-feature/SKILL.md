---
name: frontend-feature
description: Procedimiento obligatorio para cualquier pieza de interfaz nueva de FlowSync. Explora el encargo y el catálogo de frontend/src/components/ui/, propone un plan con la pieza, de dónde sale cada parte y la lista de estados con su historia, y se para a esperar aprobación. Después escribe las historias con el subagente story-writer, comprueba el rojo con make test-ui, las congela por su huella, construye la pieza con el subagente ui-implementer hasta el verde, comprueba que las historias no cambiaron y cierra con lint, build, commit en una rama feat/… y pull request. Usar siempre que se cree una pieza de interfaz, aunque nadie lo pida.
---
# Una pieza de interfaz, de encargo a verde

Este es el orden, y no se cambia: **explorar → plan → (aprobación) → historias → rojo → congelar → implementar → verde → huella intacta → cierre**. Es el mismo esqueleto que `backend-feature`, con las historias de Storybook en el papel de los tests de contrato.

Rutas: `make` desde la **raíz** del repo; `npm`/`npx` del frontend desde **`frontend/`** (o `npm --prefix frontend …` desde la raíz).

## 0. Antes de empezar

- Rama: la regla de `CLAUDE.md` («Reglas de proceso»). Desde `main` o una `sN/*`, crea `feat/<slug>`. Si ya estás en una rama de trabajo de esta misma unidad, sigues en ella.
- Mira `git status --short` y apunta lo que ya estaba sin commitear. No es de esta tarea, los subagentes no lo tocan y no entra en el commit.
- Corre `make test-ui` una vez y apunta el resultado: si alguna historia ya estaba en rojo, no se le atribuye a esta tarea.

## 1. Explorar

- Lee el encargo entero y sácale los **estados** de la pieza: vacía, cargando, con datos, con error, deshabilitada, con texto largo… y, por cada uno, si tiene comportamiento (algo que se teclea, se pulsa o llega de la red) o es solo visual.
- Lee el catálogo: `ls frontend/src/components/ui/` y las piezas que puedan servir. Hoy hay `alert`, `button`, `card`, `input`, `label` y `progress`; compruébalo, que crece.
- Lee las composiciones que se parezcan (`src/components/`, `src/pages/`) y sus historias, `.storybook/preview.tsx` y `.storybook/msw-handlers.ts`.
- Decide las **piezas de contrato** que las historias van a fijar y la implementación tendrá que respetar: ruta del archivo y nombre del export, props con sus tipos, y los **nombres accesibles** (rótulos, roles, textos) que buscarán los `play`. Si no se fijan ahora, quien escribe las historias y quien construye la pieza eligen nombres distintos.

## 2. Plan, y PARA

Presenta:

**La pieza:** archivo, export, props, y si es reutilizable (va en `ui/`) o una composición de pantalla.

**De dónde sale cada parte**, una fila por parte, sin omitir ninguna:

| Parte | Origen | Archivo | Comando |
|---|---|---|---|
| … | catálogo (`ui/` ya la tiene) | `src/components/ui/<x>.tsx` | — |
| … | CLI | `src/components/ui/<x>.tsx` | `npx shadcn@latest add <x>` |
| … | nueva y declarada: <porqué: no hay pieza en el catálogo, o la que hay no sirve> | `src/components/…` | a mano |
| Llamada a la API (si hace falta) | nueva | `src/lib/api.ts` | a mano |
| Handlers de MSW (si hace falta) | nuevo endpoint simulado | `.storybook/msw-handlers.ts` | a mano |

**Los estados**, una fila por estado:

| Estado | Historia | ¿Comportamiento? | Qué comprueba su `play` |
|---|---|---|---|
| … | `export const …` | sí / no (visual) | … / — (lo revisa Chromatic) |

Debajo: las piezas de contrato del paso 1 y las decisiones abiertas que vea quien aprueba.

**Detente aquí y espera la aprobación explícita.** No lances ningún subagente, no ejecutes el CLI de shadcn ni crees ningún archivo antes. Si piden cambios, rehaz el plan y vuelve a parar.

## 3. Historias: subagente `story-writer`

Lánzalo en primer plano. Pásale el encargo, la tabla de estados, las piezas de contrato y la ruta de cada `*.stories.tsx`. Al volver, léelas tú: una historia por estado, `play` en cada estado con comportamiento, localizadores por rol y rótulo, datos fijos. Pasa desde `frontend/`:

```bash
npx prettier --check <historias> && npx oxlint <historias>
```

Esto va **antes** de congelar: después ya no se pueden tocar.

## 4. Comprueba el rojo

```bash
make test-ui > <scratchpad>/rojo.txt 2>&1; sed 's/\x1b\[[0-9;]*m//g' <scratchpad>/rojo.txt | grep -E 'FAIL|✓|×|Test Files|Tests '
```

- Todas las historias nuevas tienen que fallar. Si la pieza no existe, fallan **por el import** (`Failed to resolve import`): es un rojo válido, pero dilo, porque no prueba nada del comportamiento. Lo que sí lo prueba es el paso 3: que cada estado con comportamiento tenga un `play` que no pasaría con un `<div />`.
- **Si la pieza ya existe** (se está ampliando) y alguna historia nace en verde, para y dilo. Las que no tienen `play` nacerán en verde siempre: son estados visuales y está bien, pero se enumeran. Una con `play` en verde se devuelve a `story-writer`.
- Las historias que ya existían siguen igual que en el paso 0.

## 5. Congela las historias

```bash
git add <historias>
shasum <historias> | tee <scratchpad>/congelados.sha
```

Enseña la huella en el chat. Esa huella es la garantía: no hay hook ni script que la sustituya.

## 6. Implementación: subagente `ui-implementer`

Lánzalo en primer plano con el encargo, el plan aprobado entero, la lista de historias congeladas y los cambios ajenos sin commitear del paso 0. Trabaja hasta que `make test-ui` salga en verde.

**Disputas.** Si devuelve una, se la trasladas a quien aprobó el plan tal cual: historia, archivo y línea, lo que dice el encargo, lo que exige la historia y la propuesta. No cambias la historia tú, y él tampoco. Si se acepta, la corrige `story-writer`, se vuelve a comprobar el rojo y a congelar (pasos 4 y 5) antes de seguir.

## 7. Verde y huella intacta

```bash
shasum -c <scratchpad>/congelados.sha
git diff --stat -- <historias>              # vacío: nada sin stagear encima de lo congelado
git status --short -- '*.stories.tsx'       # nada nuevo fuera de lo que ya había
make test-ui                                # tú, no solo el subagente
```

Si la huella no cuadra, la pieza no se da por buena aunque esté en verde: dilo y para.

Si se usó el CLI de shadcn, revisa tú también `git diff -- frontend/package.json frontend/package-lock.json`: ni el paquete `cn`, ni `radix-ui` subido, ni nada que el plan no recoja.

## 8. Cierre

1. Desde `frontend/`: `npm run lint` (oxlint) y `npm run build` (typecheck + Vite). Los dos limpios.
2. Commit con la skill `/commit`, en la rama del paso 0. Solo lo de esta tarea: los cambios ajenos del paso 0 se quedan fuera. Si en el plan hubo una parte «nueva y declarada», el mensaje lo dice con su porqué. Si el hook `datos-que-no-salen.sh` bloquea, se sustituye el dato, no se esquiva.
3. Pull request con `gh pr create` y una descripción completa: la pieza, de dónde sale cada parte, la tabla de estados → historias y la huella. El PR dispara `.github/workflows/chromatic.yml`, que publica el Storybook en Chromatic: los estados visuales sin `play` se revisan ahí.
4. El subagente `adversarial-reviewer` sobre ese PR, lo último. Según las «Reglas de proceso» de `CLAUDE.md`, el PR y el review van una vez por unidad de trabajo: si esta pieza no cierra la unidad, se dejan para cuando la cierre.
5. Responde solo con la URL del PR.

## Lo que ya se aprendió haciéndolo

- **El CLI de shadcn cuela cosas en `package.json`.** La primera vez declaró `cn` como paquete npm, lo instaló, la pieza importó de él en vez de `@/lib/utils` y subió `radix-ui`. Se deshace todo y el import se apunta a `@/lib/utils`.
- **Toda instalación en el frontend va con `--legacy-peer-deps`.** Y una dependencia que tenga hermana instalada se fija a la misma versión: `@playwright/test` se instaló en la 1.64.1 del driver `playwright` para que no se desfasaran.
- **`make test-ui` tarda casi un minuto, no segundos**: arranca Chromium y Storybook. Para iterar, `npx vitest run --project=storybook <archivo>` desde `frontend/`; el `make test-ui` entero, al empezar y al cerrar.
- **Una historia sin `play` solo comprueba que se pinta.** Nace en rojo porque el import no resuelve y pasa con cualquier implementación. El comportamiento se fija en el `play`; lo visual, en Chromatic.
- **Los estados de un componente se prueban en historias, no en Playwright.** El recorrido de navegador (`make test-web`, `frontend/e2e/`) es uno solo, de registro a primera tarea, y necesita la aplicación levantada. Esta skill no añade recorridos.
- **El preview ya monta router, sesión y MSW.** Una historia fija su dirección con `parameters.route` y cambia una respuesta de la API con `beforeEach: ({ msw }) => msw.use(...)` en la propia historia, sin tocar los handlers globales.
- **`storybook init` dejó ejemplos en `src/stories/` que rompían el build.** Cualquier generador que se ejecute se revisa con `git status` antes de seguir.
- **El hook de Prettier reformatea lo que se edita.** Las historias se formatean antes de congelarlas; si no, el primer Edit sobre ellas cambia la huella.
- **El a11y del addon está en `test: 'todo'`**: las violaciones se ven en el panel pero no hacen fallar `make test-ui`. No cuentes con él como comprobación.
- **El pre-push corre `make test-ui`** (si se activó con `make hooks`). Un push con historias en rojo se cancela.
- **Correos solo en `example.com`** en historias y handlers: el hook de commits bloquea cualquier otro dominio.
