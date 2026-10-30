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

**Modelo:** Opus 5.5 Medium
**Herramienta:** Claude Code

```
Necesito que prepares una imagen Docker del backend (AdonisJS) y tres atajos en el Makefile de la raíz.      
  Crea o modifica estos tres ficheros: backend/Dockerfile, backend/.dockerignore y Makefile (raíz).            
                                                                                                               
  1) backend/Dockerfile, multietapa con dos etapas:                                                            
      Etapa de construcción:                                                                                   
     - Base: Node 24                                            
     - Copia package.json y package-lock.json, ejecuta npm ci con todas las dependencias (dev incluidas),      
  copia el resto del código y ejecuta npm run build.                                                           
       AdonisJS deja la app compilada en build/.                                                               
                                                                                                               
      Etapa final:                                                                                             
     - Base: la imagen de Node 24 más pequeña que sea razonable (por ejemplo node:24-alpine o node:24-slim).   
     - Copia solo build/ desde la etapa anterior.                                                              
     - Dentro de build/, instala las dependencias de producción con npm ci --omit=dev. Es la forma de          
  despliegue que documenta AdonisJS.                                                                           
     - A la imagen final no puede llegar nada de esto: código fuente, dependencias de desarrollo ni ningún     
  .env.                                                                                                        
     - Corre como usuario sin privilegios. Puedes usar el usuario node de la imagen oficial y asegurarte de    
  que es el dueño de los ficheros.                                                                             
     - EXPOSE 3333.                                                                                            
     - CMD ["node", "bin/server.js"], con el directorio de trabajo apuntando a lo que antes era build/.        
     - No pongas ninguna variable de entorno con valor dentro del Dockerfile, ni ENV ni ARG con valores de     
  configuración. Toda la configuración entra al arrancar el contenedor, no al construir la imagen.             
                                                                                                               
  2) backend/.dockerignore:                                                                                    
      Excluye como mínimo node_modules, build, tmp y cualquier fichero .env (.env, .env.*, en cualquier        
  nivel).                                                                                                      
  3) Makefile en la raíz, con tres targets. Usa exactamente estos nombres y márcalos como .PHONY:              
     - image: construye la imagen desde backend/ con la etiqueta flowsync-api:local.                           
     - image-run: arranca la imagen en segundo plano (-d):                                                     
       - Nombre de contenedor: flowsync-api-local.                                                             
       - Publica el puerto IMAGE_PORT del host sobre el 3333 del contenedor. IMAGE_PORT es una variable del    
  Makefile que vale 3334 por defecto (IMA Jump to bottom (ctrl+End) ↓ obrescribir con make image-run
  IMAGE_PORT=XXXX.                                                                                             
       - Pasa backend/.env con --env-file.                                                                     
       - Fuerza además estos tres valores con -e, que tienen prioridad sobre el fichero:                       
           · HOST=0.0.0.0                                                                                      
           · DB_HOST=host.docker.internal, porque dentro del contenedor localhost es el propio contenedor.     
           · APP_URL=http://localhost:$(IMAGE_PORT), porque Docker no expande el ${HOST}:${PORT} que usa el    
  .env.                                                                                                        
       - Termina con un curl -s a http://localhost:$(IMAGE_PORT)/.                                             
       - image-stop: para y borra el contenedor flowsync-api-local. No debe fallar si el contenedor no existe. 

```

## Prompt 2 

**Modelo:** Opus 5.5 Medium
**Herramienta:** Claude Code


```Necesito un pipeline de CI en el archivo `.github/workflows/ci.yml` y un nuevo target `ci-lint` en el Makefile de la raíz.

Antes de escribir nada, lee estos ficheros: `backend/start/env.ts`, `backend/.env.test`, `.github/workflows/openapi.yml` y el Makefile. Quiero que el workflow use lo que ya existe, no que lo reinvente.

1) Target `ci-lint` en el Makefile (márcalo .PHONY)
   Valida todos los workflows de `.github/workflows/` con actionlint sin instalar nada en la máquina. Usa la imagen oficial `rhysd/actionlint:1.7.12`, monta la raíz del repo como volumen y ejecútala desde ahí con `-color`. Algo así:
   docker run --rm -v "$(CURDIR):/repo" -w /repo rhysd/actionlint:1.7.12 -color

2) `.github/workflows/ci.yml` con exactamente cinco trabajos. Cada uno responde a una pregunta.

   a) `test`: ¿la suite del backend pasa en una máquina limpia?
      - Servicio PostgreSQL con la imagen `pgvector/pgvector:pg17`, publicado en el puerto 54411 del runner, que es el que espera `backend/.env.test`. Usuario `flowsync`, contraseña `flowsync`, base `flowsync_test`.
      - Health check (pg_isready) para que el trabajo espere a que la base esté sana.
      - Node 24.
      - El paso que ejecuta los tests es exactamente `make test`, el mismo comando que en local. Nada de `node ace` a mano. Si `make test` necesita dependencias instaladas antes, prepáralas en un paso previo.
      - Las variables que exige `backend/start/env.ts` y que no están en `.env.test` van en el `env:` del trabajo, con el mismo criterio que usa `openapi.yml`.
      - Publica el recuento de tests (pasados, fallidos, total) en el resumen de la ejecución escribiendo en `$GITHUB_STEP_SUMMARY`, no con un echo al log. Guarda la salida de `make test` con `tee` y `set -o pipefail` para no perder el código de salida, y extrae de ahí los números. El resumen tiene que publicarse también si los tests fallan.

   b) `image`: ¿el artefacto se puede fabricar desde cero?
      - Ejecuta `make image` y no arranca el contenedor.
      - Deja un comentario en el YAML que diga explícitamente el límite: este trabajo afirma que la imagen se construye, no que arranque.

   c) `lint-workflows`: ¿los ficheros del pipeline son válidos?
      - Ejecuta `make ci-lint`.

   d) `infra-plan`: ¿qué cambiaría en la infraestructura si se fusiona este cambio?
      - Corre solo en pull requests que toquen `.railway/**`.
      - Corre solo si el PR viene del propio repositorio y no de un fork: `github.event.pull_request.head.repo.full_name == github.repository`.
      - Usa la acción oficial `railwayapp/config` en v1.2.0 con `command: plan` y el token desde el secreto `RAILWAY_TOKEN`, para que el plan se publique como comentario del PR.
      - Lee el `action.yml` de esa versión para usar los nombres de input correctos; no los supongas.

   e) `infra-apply`: lo mismo con `command: apply`.
      - Corre solo cuando el PR se fusiona: evento `pull_request` con `types: [closed]` y `github.event.pull_request.merged == true`.
      - Mismas condiciones de `.railway/**` y de no-fork.

   El filtro por `.railway/**` NO puede ir como `paths` a nivel del workflow, porque eso apagaría también test, image y lint-workflows. Resuélvelo dentro de los dos trabajos de infra sin añadir un sexto trabajo. Por ejemplo: un primer paso que detecte los cambios y deje el resto de pasos condicionados a su salida. Explícame qué opción elegiste.

3) Reglas para todo el fichero
   - Disparadores: push y pull_request (opened, synchronize, reopened, closed). Cuando el evento es el cierre del PR, test, image y lint-workflows no deben correr.
   - Permisos: `permissions: {}` a nivel del workflow y permisos mínimos declarados en cada trabajo. Nunca `write-all`. Solo los trabajos que comentan en el PR llevan `pull-requests: write`.
   - Cada acción de terceros va fijada a su SHA de commit completo (40 caracteres), con la etiqueta de versión en un comentario al lado (`uses: owner/repo@<sha> # vX.Y.Z`). Resuelve cada SHA por red (`gh api` o `git ls-remote`), no de memoria. Si la etiqueta es anotada, el SHA que va es el del commit al que apunta (el `^{}`), no el del objeto tag. Enséñame los comandos que usaste y lo que devolvieron.
   - test, image y lint-workflows corren en paralelo: ninguno con `needs` sobre otro.
   - Concurrencia: si llega otro push a la misma rama, se cancela la ejecución anterior (`concurrency` por workflow y ref, con `cancel-in-progress`). Un `apply` en curso no debe cancelarse nunca.

4) Al terminar
   Ejecuta `make ci-lint`. Tiene que quedarse en silencio y salir con código 0. Pégame la salida literal y el código de salida. Si en algún momento lo ejecutaste, falló y corregiste algo, dímelo también: qué señaló actionlint exactamente y qué cambiaste. No quiero solo el resultado final limpio.

```

