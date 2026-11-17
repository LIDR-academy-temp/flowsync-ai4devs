# Prompts

Todos los prompts lanzados en esta sesión, en orden. Solo hay dos: **no pedí cada pieza con un prompt
propio**, como sugiere el ejercicio (Dockerfile, atajos, workflow…); lancé el enunciado entero de una vez.
Eso es un hallazgo sobre cómo lo pedí, no un descuido del registro.

## Prompt 1

**Modelo:** Claude Sonnet 5.5 (`claude-sonnet-5-5`)
**Herramienta:** Claude Code (extensión de VS Code)

```
Haz este ejercicio completo

[A continuación iba pegado, entero, el enunciado «Ejercicio FlowSync: empaqueta la API y escribe su
pipeline» (entorno, Parte A, Parte B, Parte C, cómo se entrega). No se reproduce aquí por extensión:
es el texto del ejercicio, no palabras mías.]
```

**Qué salió:** el agente exploró el repo y escribió `backend/Dockerfile`, `backend/.dockerignore`, los
atajos del Makefile y `.github/workflows/ci.yml`. No pudo arrancar Docker Desktop (apagado; el sistema
de permisos denegó lanzarlo), así que paró y lo dijo. Tuve que pedir una segunda pasada (prompt 3).

## Prompt 2

**Modelo:** Claude Sonnet 5.5 (`claude-sonnet-5-5`)
**Herramienta:** Claude Code (extensión de VS Code)

```
cambiale el nombre de la rama a EQ, ya que yo represento a Edwin Quintana
```

**Qué salió:** la rama `pipeline-mb` (iniciales deducidas del usuario de git, un error mío) pasó a
`pipeline-eq`. Aún no se había empujado nada.

## Prompt 3

**Modelo:** Claude Sonnet 5.5 (`claude-sonnet-5-5`)
**Herramienta:** Claude Code (extensión de VS Code)

```
Ya encendi docker, haz el ejercicio completo
```

**Qué salió:** con Docker encendido el agente ejecutó `make image`, `docker run --rm flowsync-api:local`,
`make image-run`, `make test` y `make ci-lint`, y completó `HALLAZGOS.md` con lo medido. Hubo dos
tropiezos que son hallazgo: `make image` falló la primera vez por el DNS de Docker Desktop (repetido
sin cambios, construyó) y `make ci-lint` falló por la conversión de rutas de Git Bash en Windows
(corregido en el Makefile con `MSYS_NO_PATHCONV=1`).
