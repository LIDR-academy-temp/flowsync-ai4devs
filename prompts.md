# Prompts

Aquí van **todos los prompts que lanzaste** para hacer el ejercicio, en el orden en que los
lanzaste, con el modelo y la herramienta de cada uno.

Esto no es papeleo. Lo que se revisa es **cómo pediste las cosas**, no solo lo que salió: un
resultado flojo con un prompt bueno y un resultado flojo con un prompt vago necesitan feedback
distinto, y sin este archivo no se distinguen.

## Cómo rellenarlo

- Un apartado `## Prompt N` por cada prompt.
- **Pega el prompt tal cual lo lanzaste**, dentro del bloque de código, aunque ocupe diez líneas
  y aunque tenga faltas. No lo reescribas para que quede bien: el que arreglaste mentalmente
  después no es el que lanzaste.
- Incluye también los que **no funcionaron**. Suelen ser los más útiles de leer.
- `Modelo` y `Herramienta` en todos. Si cambiaste de una a otra a mitad, se nota aquí.

Borra el ejemplo de abajo cuando escribas el primero.

---

## Prompt 1

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Actúa como un experto en DevOps y desarrollo backend con AdonisJS 6. Necesito que generes exactamente tres ficheros con la configuración exacta descrita a continuación, sin explicaciones previas, ni saludos, ni texto adicional, únicamente el contenido de los tres ficheros en bloques de código limpios y bien estructurados.

Los ficheros son:
1. `backend/Dockerfile` (multietapa, Node 24, dos etapas: una de build con npm ci y npm run build dejando el resultado en build/, y una final ligera basada en Node 24 que copia solo build/ y ejecuta npm ci --omit=dev dentro de build/ tal como AdonisJS documenta su despliegue oficial. Sin código fuente innecesario, sin dependencias dev, sin .env. Debe correr como usuario sin privilegios, exponer el puerto 3333, arrancar con node bin/server.js y no incluir ninguna variable de entorno con valor predefinido dentro del Dockerfile).
2. `backend/.dockerignore` (excluyendo node_modules, build, tmp y cualquier fichero .env).
3. `Makefile` situado en la raíz del proyecto con exactamente tres atajos:
   - `image`: construye la imagen Docker usando como etiqueta `flowsync-api:local`.
   - `image-run`: arranca el contenedor en segundo plano con el nombre `flowsync-api-local`, publicando el puerto `IMAGE_PORT` (por defecto 3334) mapeado al puerto 3333 del contenedor, pasando el fichero `backend/.env` como entorno y sobreescribiendo/forzando los valores `HOST=0.0.0.0`, `DB_HOST=host.docker.internal` y `APP_URL=http://localhost:$(IMAGE_PORT)`, finalizando con una comprobación mediante `curl -s` a la raíz del puerto publicado.
   - `image-stop`: para y borra el contenedor `flowsync-api-local`.
```

**Qué salió:** Se crearon dos archivos nuevos y uno se modifico.

---

## Prompt 2

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Actúa como un experto en ingeniería DevOps y automatización de CI/CD con GitHub Actions. Necesito que generes exactamente dos elementos con la configuración detallada a continuación, sin explicaciones previas, ni saludos, ni texto adicional, únicamente el contenido en bloques de código limpios y bien estructurados:

1. Un atajo `ci-lint` en el `Makefile` de la raíz que valide todos los workflows ubicados en `.github/workflows/` utilizando la imagen oficial de Docker `rhysd/actionlint:1.7.12` sin instalación local, montando la raíz del repositorio y pasando el flag `-color`.
2. El fichero `.github/workflows/ci.yml` que cumpla estrictamente con las siguientes reglas e infraestructura de trabajos:

Reglas globales del workflow:
- Concurrencia configurada para cancelar ejecuciones anteriores si llega un nuevo push a la misma rama.
- Permisos mínimos declarados por trabajo (nunca `write-all`).
- Cada acción de terceros debe estar fijada a su SHA de commit completo (con la etiqueta de versión amigable documentada en un comentario al lado).
- Trabajos `test`, `image` y `lint-workflows` ejecutándose en paralelo.

Cinco trabajos definidos:
1. `test`: Comprueba si la suite del backend pasa en una máquina limpia. Incluye un contenedor de servicio con PostgreSQL usando la imagen `pgvector/pgvector:pg17` publicada en el puerto `54411` (esperado por `backend/.env.test`), configurado con usuario `flowsync`, contraseña `flowsync` y base de datos `flowsync_test`, asegurando que el servicio esté sano antes de ejecutar exactamente `make test` (el mismo comando local, sin invocar `node ace` manualmente). Las variables de entorno exigidas por `backend/start/env.ts` que falten en `.env.test` deben inyectarse en el entorno del trabajo (como se hace en `openapi.yml`). Además, el recuento de tests debe publicarse formalmente en el resumen de la ejecución de GitHub Actions (`$GITHUB_STEP_SUMMARY`), no mediante un `echo` plano.
2. `image`: Verifica si el artefacto se puede fabricar desde cero invocando `make image`. Incluye obligatoriamente un comentario que delimite explícitamente su alcance (afirma que la imagen se construye, no que arranque).
3. `lint-workflows`: Valida los propios ficheros del pipeline ejecutando el atajo `make ci-lint`.
4. `infra-plan`: Ejecuta un plan de infraestructura sobre Railway solo en pull requests que modifiquen ficheros dentro de `.railway/**`, y únicamente si el pull request proviene del mismo repositorio y no de un fork (para proteger secretos). Utiliza la acción oficial `railwayapp/config` en su versión `v1.2.0` (fijada por SHA), con `command: plan` y el secreto `RAILWAY_TOKEN`, publicando automáticamente el plan como comentario en el pull request.
5. `infra-apply`: Aplica el mismo plan de Railway mediante `command: apply`, ejecutándose únicamente cuando un pull request es fusionado (merge).
```

**Qué salió:** Se modifico el Makefile con el nuevo shortcut y el fichero `ci.yml`.
