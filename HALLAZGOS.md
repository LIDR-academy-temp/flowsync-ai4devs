# Hallazgos

Las tres líneas de la Parte C del ejercicio del módulo 13, con lo que se midió en esta máquina, no con lo que se suponía.

## 1. Cuánto pesa la imagen y qué tuvo que escribir el Dockerfile que mi máquina daba por hecho

- `flowsync-api:local` ocupa **388 MB en disco y 81,1 MB de contenido** (`docker images flowsync-api:local`). El Dockerfile tuvo que declarar cinco cosas que el portátil ya tenía resueltas:
  - la línea de Node, `node:24-alpine`, en las dos etapas;
  - las dependencias, con `npm ci` sobre el lockfile;
  - el paso de compilación, `npm run build` hacia `build/`, porque en local `npm run dev` ejecuta el TypeScript sin compilar;
  - una segunda instalación, solo de producción (`npm ci --omit=dev`) dentro de `build/`;
  - un usuario sin privilegios (`node`).

  Además, en la máquina vacía npm no lanzó el `postinstall` de `@swc/core` (aviso `allowScripts`), que en mi `node_modules` ya estaba ejecutado. Y para arrancarla, `make image-run` tuvo que forzar tres valores que en local salen solos: `HOST=0.0.0.0`, `DB_HOST=host.docker.internal` y `APP_URL`.

## 2. Qué reclamó el contenedor al arrancar sin variables

- `docker run --rm flowsync-api:local` murió con `EnvValidationException: Validation failed for one or more environment variables` y una lista literal de **12 variables**: `NODE_ENV`, `PORT`, `HOST`, `LOG_LEVEL`, `APP_KEY`, `APP_URL`, `SESSION_DRIVER`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_DATABASE`.
  - **2 son secretos**, porque conocerlas da acceso: `APP_KEY` (firma y cifra) y `DB_PASSWORD` (abre la base).
  - **Las otras 10 son configuración**, y nada pasaría si salieran en un registro público: `NODE_ENV`, `PORT`, `HOST`, `LOG_LEVEL`, `APP_URL`, `SESSION_DRIVER`, `DB_HOST`, `DB_PORT`, `DB_USER` y `DB_DATABASE`.
  - `TZ`, `DB_RO_PASSWORD` y `CORS_ORIGIN` están en `.env.example`, pero la aplicación no las pide para arrancar.

## 3. Qué NO comprueba mi pipeline

Ninguno de los cinco trabajos de `.github/workflows/ci.yml` afirma nada de esto:

- **El frontend, entero.** Ni `npm run build` (que es su typecheck), ni oxlint, ni `make test-ui`, ni el recorrido de Playwright. `chromatic.yml` solo publica el Storybook, y solo si tiene token.
- **El lint y el typecheck del backend.** `npm run lint` y `npm run typecheck` no corren. `make test` compila al vuelo y no falla por un error de tipos que no se ejecute.
- **Que la imagen arranque.** `image` solo la construye. No la arranca, no mira que no lleve `.env` ni código fuente, no vigila su tamaño y no la publica, así que lo que se despliegue no será este artefacto.
- **Las vulnerabilidades.** `make image` avisó de 9 en las dependencias de producción, una crítica, y ningún trabajo corre `npm audit` ni escanea la imagen.
- **Las migraciones.** Ningún `down` se ejecuta, y las migraciones solo corren contra una base vacía, nunca contra datos como los de desarrollo o producción.
- **La infraestructura en mi pull request.** `infra-plan` e `infra-apply` se saltan porque el PR viene de un fork, no toca `.railway/` y no hay `RAILWAY_TOKEN`. Que estén en verde o saltados no dice nada de Railway, y actionlint tampoco comprueba que el secreto exista.
- **Las acciones que llaman otras acciones.** Fijar `railwayapp/config` a su SHA no fija lo que llama por dentro: su `action.yml` usa `actions/setup-node@v4`, `actions/upload-artifact@v4` y `actions/github-script@v7` por etiqueta, e instala `@railway/cli@latest`.
- **Si el pipeline corrió de verdad en GitHub.** Solo se validó en local, con `make ci-lint` en silencio y con código 0, y simulando el trabajo `test`, con 69 de 69 tests pasando. Falta apuntar qué pasa en el pull request hacia el repositorio del curso.
