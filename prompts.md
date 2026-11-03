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

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Empaqueta únicamente la API de FlowSync como una imagen Docker reproducible y añade los atajos locales necesarios para construirla, arrancarla y detenerla.

Antes de modificar archivos, inspecciona el backend, su package.json, los scripts de construcción, la versión mínima de Node, backend/start/env.ts, backend/.env.example, el Makefile de la raíz y las reglas de proceso del repositorio. Basa la implementación únicamente en archivos reales del proyecto; no inventes rutas, scripts ni variables.

Crea exactamente estas piezas:

1. backend/Dockerfile

Debe ser una construcción multietapa con exactamente dos etapas.

Etapa de construcción:

- Usa una imagen oficial de Node 24.
- Asume backend/ como contexto de construcción.
- Define un directorio de trabajo explícito.
- Copia primero los archivos que declaran y bloquean las dependencias para aprovechar la caché de capas.
- Ejecuta npm ci incluyendo las dependencias de desarrollo.
- Copia el código necesario del backend.
- Ejecuta npm run build; AdonisJS debe dejar la aplicación compilada en build/.

Etapa final:

- Usa una imagen oficial de Node 24 tan pequeña como sea razonable y compatible con la aplicación.
- La imagen final debe recibir únicamente build/ desde la etapa de construcción.
- Instala dentro de build/ solamente las dependencias de producción mediante npm ci --omit=dev.
- No copies el código fuente, node_modules de construcción, dependencias de desarrollo ni archivos .env.
- Ejecuta la aplicación como un usuario sin privilegios.
- Expón el puerto 3333.
- Arranca desde build/ con node bin/server.js.
- No declares valores de variables de entorno en el Dockerfile: la configuración debe recibirse al arrancar el contenedor.

2. backend/.dockerignore

Debe excluir, como mínimo:

- node_modules
- build
- tmp
- .env
- cualquier variante .env.*

Ningún archivo .env real puede entrar en el contexto ni viajar dentro de la imagen.

3. Añade al Makefile de la raíz exactamente estos tres targets:

image:

- Construye backend/Dockerfile usando backend/ como contexto.
- Etiqueta la imagen como flowsync-api:local.

image-run:

- Usa IMAGE_PORT con valor predeterminado 3334.
- Arranca la imagen en segundo plano.
- Usa como nombre de contenedor flowsync-api-local.
- Publica IMAGE_PORT del host sobre el puerto 3333 del contenedor.
- Carga backend/.env mediante --env-file.
- Sobrescribe HOST=0.0.0.0.
- Sobrescribe DB_HOST=host.docker.internal.
- Sobrescribe APP_URL=http://localhost:<IMAGE_PORT>.
- En Linux, permite que host.docker.internal resuelva al host de Docker.
- Después de arrancar, ejecuta curl -s contra la raíz del puerto publicado.

image-stop:

- Detiene y elimina flowsync-api-local.
- No debe fallar si el contenedor ya no existe.

Restricciones:

- No crees ni modifiques .railway/.
- No escribas ni modifiques workflows.
- No despliegues nada.
- No introduzcas secretos ni valores reales de variables.
- No modifiques código de aplicación, pruebas, package.json ni archivos .env.
- No modifiques prompts.md ni HALLAZGOS.md.
- Modifica únicamente backend/Dockerfile, backend/.dockerignore y Makefile.
- No ejecutes make image, docker run, make image-run ni make image-stop. Yo ejecutaré esas comprobaciones después y necesito conservar su primera salida como evidencia del ejercicio.
- No corrijas anticipadamente problemas que todavía no se hayan observado.
- No copies un Dockerfile externo: deriva la solución de la estructura real del proyecto y de estas restricciones.

Al terminar:

- Comprueba únicamente la sintaxis y coherencia estática de los archivos sin construir ni arrancar la imagen.
- Muestra la lista exacta de archivos modificados.
- Resume las decisiones tomadas.
- Cierra la petición siguiendo las reglas de commit del repositorio e incluye en el commit solamente backend/Dockerfile, backend/.dockerignore y Makefile.
```

**Qué salió:** creó el Dockerfile multietapa, el `.dockerignore` y los tres targets; `make image` construyó a la primera, pero el primer `make image-run` falló con error 56 porque el `curl` se ejecutó antes de que la API estuviera lista.



## Prompt 2

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Corrige únicamente el target image-run del Makefile a partir del fallo real observado en su primera ejecución.

Evidencia literal:

make image-run arrancó el contenedor flowsync-api-local, pero el curl ejecutado inmediatamente terminó con:

make: *** [Makefile:174: image-run] Error 56

Después se comprobó:

- El contenedor seguía en estado running.
- docker logs mostró: "started HTTP server on 0.0.0.0:3333".
- Un curl realizado cuando la API ya estaba lista respondió correctamente.
- El problema es una condición de carrera: el target consulta la API antes de que esté preparada.

Modifica exclusivamente el target image-run del Makefile para que espere de manera acotada hasta que la raíz de http://localhost:$(IMAGE_PORT)/ responda correctamente.

Requisitos:

- Conserva la construcción y todos los parámetros actuales de docker run.
- Conserva el nombre flowsync-api-local.
- Conserva IMAGE_PORT y su valor predeterminado.
- Implementa reintentos con un límite claro; no uses una espera infinita.
- Si la API no llega a responder dentro del límite, el target debe terminar con código distinto de cero.
- Cuando responda, debe imprimir el cuerpo de la respuesta, incluido {"hello":"world"}.
- No ocultes el fallo con || true.
- No uses un sleep fijo como única comprobación: debe verificarse realmente la respuesta HTTP.
- No modifiques backend/Dockerfile, backend/.dockerignore, código de aplicación, pruebas, archivos .env, prompts.md, HALLAZGOS.md ni ningún workflow.
- No ejecutes make image-run ni ningún comando que arranque o modifique contenedores; yo haré la segunda comprobación y necesito conservar su primera salida después de la corrección.
- Al terminar, muestra el diff del Makefile y cierra la petición siguiendo las reglas de commit del repositorio, incluyendo solamente Makefile.
```

**Qué salió:** corrigió únicamente `image-run` con una espera acotada de hasta 30 intentos; la segunda ejecución respondió `{"hello":"world"}`.




## Prompt 3

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Crea el pipeline de integración continua de FlowSync y un único atajo local para validar todos los workflows.

Antes de modificar archivos:

- Lee las reglas del repositorio.
- Inspecciona el Makefile de la raíz.
- Inspecciona .github/workflows/openapi.yml y .github/workflows/revisor.yml para respetar el estilo existente.
- Inspecciona backend/.env.test y backend/start/env.ts para determinar qué variables exige el backend durante los tests y cuáles no están definidas en el archivo de pruebas.
- Inspecciona los scripts reales del backend.
- Comprueba cómo make test y make image funcionan actualmente.
- No supongas nombres de variables, comandos ni rutas.
- Consulta por red los repositorios oficiales de todas las acciones de terceros necesarias y resuelve cada versión requerida a su SHA de commit completo. No inventes ni recuerdes los SHA de memoria.

Crea exactamente:

1. .github/workflows/ci.yml
2. Un target ci-lint en el Makefile de la raíz.

No crees ningún otro archivo.

El workflow debe cancelar la ejecución anterior cuando llegue otro push o actualización del pull request para la misma rama, mediante un grupo de concurrencia adecuado.

Debe contener exactamente cinco jobs con estos identificadores:

1. test

Pregunta que responde: ¿la suite completa del backend pasa en una máquina limpia?

Requisitos:

- Usa un runner Ubuntu.
- Declara permisos mínimos en el propio job; nunca uses write-all.
- Ejecuta PostgreSQL como service container con la imagen pgvector/pgvector:pg17.
- Publica PostgreSQL en el puerto 54411, que es el que backend/.env.test espera.
- Configura:
  - usuario flowsync;
  - contraseña flowsync;
  - base flowsync_test.
- Añade un health check real de PostgreSQL y espera a que el servicio esté saludable.
- Prepara Node 24.
- Instala las dependencias necesarias respetando el lockfile.
- Define en el entorno del job únicamente las variables que backend/start/env.ts exige y que backend/.env.test no proporciona, siguiendo el patrón comprobado en openapi.yml.
- Ejecuta exactamente make test desde la raíz. No sustituyas este comando por llamadas directas a node ace, npm test u otros comandos.
- Conserva correctamente el código de salida de make test: si falla, el job debe quedar rojo.
- Publica en $GITHUB_STEP_SUMMARY el recuento de tests de la ejecución. No lo dejes únicamente en un echo perdido en el log.
- No ocultes errores con || true.

2. image

Pregunta que responde: ¿la imagen de la API puede construirse desde cero?

Requisitos:

- Usa un runner Ubuntu.
- Declara permisos mínimos en el job.
- Hace checkout del repositorio.
- Ejecuta exactamente make image desde la raíz.
- No arranca el contenedor.
- Añade un comentario claro indicando que este job demuestra que la imagen se construye, pero no demuestra que la API arranque ni responda.

3. lint-workflows

Pregunta que responde: ¿los archivos de .github/workflows son válidos para actionlint?

Requisitos:

- Usa un runner Ubuntu.
- Declara permisos mínimos en el job.
- Hace checkout del repositorio.
- Ejecuta exactamente make ci-lint desde la raíz.

Los jobs test, image y lint-workflows deben ser independientes y ejecutarse en paralelo. No añadas dependencias needs entre ellos.

4. infra-plan

Pregunta que responde: ¿qué cambiaría en la infraestructura si el cambio se fusionara?

Requisitos:

- Solo debe ejecutar el plan en eventos pull_request que realmente toquen .railway/**.
- Solo debe ejecutar el plan si el pull request procede del mismo repositorio; nunca para un pull request procedente de un fork.
- Declara los permisos mínimos necesarios en el job, incluidos únicamente los imprescindibles para publicar el plan como comentario en el pull request.
- Usa la acción oficial railwayapp/config en la versión v1.2.0.
- Fija esa acción al SHA completo correspondiente a v1.2.0 y deja la versión legible en un comentario al lado.
- Usa command: plan.
- Recibe el token exclusivamente mediante el secreto RAILWAY_TOKEN.
- No escribas ni simules el valor del secreto.
- El plan debe poder publicarse como comentario del pull request.
- No crees .railway/ para hacer que este job se ejecute.
- Si GitHub Actions no permite expresar el filtro de rutas directamente en el if del job, implementa dentro del mismo job una detección fiable de cambios y condiciona únicamente la ejecución del plan, sin añadir un sexto job. Explica este límite con un comentario breve.

5. infra-apply

Pregunta que responde: ¿se aplican los cambios de infraestructura después de fusionar el pull request?

Requisitos:

- Usa la misma acción oficial railwayapp/config fijada al SHA completo de v1.2.0, con la versión indicada en un comentario.
- Usa command: apply.
- Recibe el token únicamente mediante el secreto RAILWAY_TOKEN.
- Solo ejecuta apply cuando el evento sea el cierre de un pull request, el pull request haya sido fusionado y el cambio incluya .railway/**.
- Nunca debe aplicar infraestructura para un pull request no fusionado.
- Declara permisos mínimos en el job.
- No crees ni modifiques .railway/.

Reglas para todas las acciones:

- Toda acción de terceros, incluidas las acciones oficiales de GitHub, debe estar fijada a un SHA de commit completo de 40 caracteres.
- Deja la etiqueta o versión humana en un comentario junto al SHA.
- Resuelve los SHA consultando por red los repositorios oficiales; no los inventes.
- No uses etiquetas móviles directamente en uses:.
- No uses write-all.
- No introduzcas secretos en el archivo.

Target ci-lint del Makefile:

- Debe llamarse exactamente ci-lint.
- Valida todos los archivos de .github/workflows/.
- No instala actionlint en la máquina.
- Usa la imagen oficial de Docker rhysd/actionlint:1.7.12.
- Monta la raíz del repositorio dentro del contenedor.
- Ejecuta actionlint con salida de color mediante -color.
- Debe propagar el código de salida: si actionlint encuentra un problema, make ci-lint debe fallar.
- No ocultes errores con || true.

Restricciones:

- No crees ni modifiques .railway/.
- No despliegues nada.
- No añadas RAILWAY_TOKEN ni ningún otro secreto.
- No modifiques backend/Dockerfile, backend/.dockerignore, código de aplicación, pruebas, archivos .env, prompts.md ni HALLAZGOS.md.
- Modifica únicamente .github/workflows/ci.yml y Makefile.
- No ejecutes make ci-lint: yo ejecutaré su primera validación y necesito conservar la salida como evidencia.
- No corrijas anticipadamente un resultado de actionlint que todavía no se haya observado.
- No modifiques los workflows existentes openapi.yml y revisor.yml.
- No añadas más de los cinco jobs pedidos.

Al terminar:

- Revisa estáticamente que el YAML tenga los cinco jobs exactos y que las acciones estén fijadas a SHA completos.
- Muestra la lista exacta de archivos modificados.
- Explica qué garantiza y qué no garantiza cada job.
- Indica las fuentes oficiales utilizadas para resolver cada SHA.
- Cierra la petición siguiendo las reglas de commit del repositorio e incluye en el commit únicamente .github/workflows/ci.yml y Makefile.
```

**Qué salió:** creó `ci.yml` con los cinco jobs y añadió `ci-lint`; `make ci-lint` descargó `rhysd/actionlint:1.7.12` y terminó en silencio con código 0.



## Prompt 4

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Completa únicamente HALLAZGOS.md con las tres líneas del ejercicio de la sesión 13, usando exclusivamente la evidencia real obtenida. No corrijas ni modifiques la implementación.

Evidencia de la Parte A:

- make image terminó correctamente en la primera ejecución.
- Docker informó para flowsync-api:local:
  - DISK USAGE: 388 MB.
  - CONTENT SIZE: 81.1 MB.
- La imagen se construyó desde cero con Node 24.
- El Dockerfile tuvo que declarar explícitamente Node 24, instalar dependencias con npm ci, compilar AdonisJS con npm run build, copiar build/ a una segunda etapa e instalar allí únicamente dependencias de producción.
- docker run --rm flowsync-api:local, sin variables, reclamó literalmente 12 variables:
  NODE_ENV, PORT, HOST, LOG_LEVEL, APP_KEY, APP_URL, SESSION_DRIVER, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD y DB_DATABASE.
- Clasificación:
  - Secretos: APP_KEY y DB_PASSWORD.
  - Configuración: NODE_ENV, PORT, HOST, LOG_LEVEL, APP_URL, SESSION_DRIVER, DB_HOST, DB_PORT, DB_USER y DB_DATABASE.
- La primera ejecución de make image-run arrancó el servidor, pero su curl inmediato terminó con error 56 por una condición de carrera.
- Se solicitó una única corrección para añadir una espera acotada que comprobara realmente la respuesta HTTP.
- Después de la corrección, make image-run respondió {"hello":"world"}.

Evidencia de la Parte B:

- Se creó .github/workflows/ci.yml con cinco jobs:
  test, image, lint-workflows, infra-plan e infra-apply.
- make ci-lint descargó rhysd/actionlint:1.7.12 y después quedó en silencio con código 0.
- No existe .railway/ y no se proporcionó RAILWAY_TOKEN.
- No se desplegó nada.

En HALLAZGOS.md conserva exactamente los tres apartados de la plantilla y sustituye sus instrucciones o guiones vacíos por una sola línea en cada apartado:

1. La primera línea debe indicar ambos tamaños de la imagen y explicar qué tuvo que declarar el Dockerfile que mi máquina daba por hecho: Node 24 y el proceso explícito de instalación y construcción.

2. La segunda línea debe incluir la lista literal de las 12 variables reclamadas y clasificarlas entre secretos y configuración. No incluyas ningún valor.

3. La tercera línea debe decir concretamente qué NO comprueba el pipeline:
   - no demuestra que la imagen arranque ni que la API responda;
   - no comprueba que las variables y secretos reales existan en producción;
   - no realiza un despliegue ni una comprobación posterior al despliegue;
   - no valida migraciones ni rollback de datos;
   - no busca vulnerabilidades;
   - no comprueba el frontend.

Debe ser exactamente una línea de contenido por apartado, aunque cada línea sea larga.

Restricciones:

- No modifiques prompts.md.
- No modifiques Dockerfile, Makefile, workflows, código, pruebas ni archivos .env.
- No crees .railway/.
- Modifica únicamente HALLAZGOS.md.
- No inventes resultados.
- No escribas valores de secretos.
- Al terminar, muestra el diff de HALLAZGOS.md y cierra la petición siguiendo las reglas de commit del repositorio, incluyendo únicamente HALLAZGOS.md.
```

**Qué salió:** detectó que `HALLAZGOS.md` conservaba la plantilla de la sesión 10, pidió aclaración, elegí adaptar los encabezados a la sesión 13 y escribió las tres líneas con la evidencia medida.
