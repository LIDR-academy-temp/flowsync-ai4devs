<!-- Generado desde la lección de ejercicio del módulo: no se edita a mano. -->

# Ejercicio FlowSync: empaqueta la API y escribe su pipeline

Es la última lección del módulo y la única que se hace con el portátil delante. Trae el setup del entorno, la tarea y cómo se entrega, todo en un sitio. Tiene dos partes técnicas, la imagen (Parte A) y el pipeline (Parte B), y una última con tres líneas sobre lo que has visto (Parte C).

> 📌 **Ve guardando cada prompt tal cual lo lanzas**, desde el primero. Se entregan, y reescribirlos al final de memoria no sirve: lo que se revisa es **cómo lo pediste**, no la versión limpia que recuerdas. Hay un archivo esperándolos en el propio repositorio.

---

## 🔁 Cómo funciona este módulo

Hay tres momentos, y saberlos cambia cómo aprovechas cada uno.

**1. Lo intentas tú.** Sobre el proyecto de abajo, con tu agente y con el reloj puesto. Entregas lo que te salga, **con lo que tenga**. La entrega a medias no es un problema: este paso no se puntúa por completarlo, y lo que se discute en vivo son las cosas con las que te chocaste.

**2. Lo ves resuelto en el directo.** El mentor empaqueta esta misma API y escribe este mismo pipeline, sobre este mismo proyecto, y lo despliega después contra una plataforma, que es el paso que tú no haces. Si a ti no te salió, ahí ves que se puede y cómo. Por eso conviene **mirar sin teclear**: lo vas a repetir con calma después.

**3. Lo replicas.** Los prompts que use el mentor te llegan por escrito. Con ellos vuelves a tu entorno y rehaces el recorrido, que es donde se asienta.

> ⚠️ **En el paso 3 no esperes salidas idénticas, y no es un fallo tuyo.** La inteligencia artificial (IA) no es determinista: con el mismo prompt cambian el orden de las capas del Dockerfile, los nombres de las etapas y hasta cuánto acaba pesando la imagen. Lo que se repite es la forma: dos etapas, una lista de variables que la aplicación reclama al arrancar sin ellas, y cinco trabajos en el pipeline. Lo que se repite es **la forma del recorrido**, no el texto.

---

## 🛠️ Deja el entorno listo

### 1. Comprueba lo que necesita tu máquina

Cuatro cosas, cada una con el comando que dice si la tienes y el síntoma de tenerla mal. Compruébalas **antes** de clonar nada: las cuatro fallan más tarde y con mensajes que no mencionan la causa.

- **Docker, corriendo**: `docker ps`. Si dice `Cannot connect to the Docker daemon`, está instalado y **apagado**. Ojo, que ese mensaje es igual que el de no tenerlo. Se instala desde `https://docs.docker.com/get-started/get-docker/`. En este módulo Docker no es solo para las bases de datos: **construye y arranca la imagen de la API y ejecuta el validador del pipeline**, así que sin él no hay ejercicio.
- **Node.js 24 o superior**: `node -v`. La capa de base de datos de este proyecto declara **24 como mínimo**, así que con versiones anteriores la instalación avisa y el arranque puede morir con errores que no hablan de versiones. Se instala desde `https://nodejs.org`. Y aquí importa doble: la imagen que vas a construir lleva dentro esa misma línea de Node.
- **`make`**: `make --version`. Si no responde: en macOS viene con las herramientas de línea de comandos (`xcode-select --install`); en Linux, con el paquete `build-essential` o equivalente.
- **Una cuenta de GitHub**: la entrega es un pull request desde tu propio fork hacia el repositorio del curso.

> 🖥️ **Dónde funciona esto, porque no es en todas partes igual.** En **macOS** y en **Linux**, tal cual. En **Windows**, **dentro de WSL** (*Windows Subsystem for Linux*, el subsistema de Linux para Windows), y esto no es una preferencia: los atajos del proyecto están escritos con órdenes de shell de macOS y Linux (`cp`, `test`, `rm`), así que **en PowerShell no funcionan**.
>
> Y la parte que se olvida: **todo tiene que estar dentro de WSL**, no solo el último comando. El clon, Node, Docker y `make`. Lo que instales en Windows no existe dentro de esa terminal. Clona además dentro del sistema de ficheros de Linux (`~/…`) y no en `/mnt/c`, o la instalación de dependencias irá muy lenta.

> 🔎 **Para este ejercicio no hace falta instalar nada más, y no hace falta ninguna cuenta en ninguna plataforma de despliegue.** El validador de workflows corre dentro de su propia imagen de Docker, así que no se instala. Y la parte que sí usa una plataforma (declarar la infraestructura y pedirle un plan) **queda fuera del ejercicio a propósito**: necesita una cuenta, y crearla trae condiciones que conviene conocer antes. Están en la caja del final de la tarea, para cuando llegues a esa parte.

### 2. Forkea y clona el proyecto

Se trabaja sobre **tu propio fork**, porque sobre el repositorio del curso no tienes permiso de escritura: la entrega es un pull request desde él hacia el del curso.

1. Entra en **https://github.com/LIDR-academy/flowsync-ai4devs** y pulsa **Fork**.
2. Clona **tu fork** y entra en la carpeta.
3. Añade el repositorio original como `upstream` y trae de ahí la rama de partida:

```bash
git remote add upstream https://github.com/LIDR-academy/flowsync-ai4devs.git
git fetch upstream
git checkout -b s13/start upstream/s13/start
```

> 🚨 **La rama de partida se trae de `upstream`, no de tu fork.** El formulario de Fork de GitHub trae marcada la casilla de copiar **solo la rama por defecto**, así que tu fork se lleva `main` y nada más. Un `git checkout s13/start` a secas moriría con un `did not match any file(s) known to git` que **no menciona al fork por ningún lado**. Y aunque desmarcaras la casilla, un fork es **una foto del momento**: no recibe las ramas que se publiquen después.

### 3. Instálalo y levántalo

No hay `package.json` en la raíz. Los comandos de `npm` se ejecutan dentro de `backend/` y de `frontend/`, y el `Makefile` de la raíz ya lo hace por ti.

```bash
make setup   # solo la primera vez: instala dependencias, crea los .env, genera la clave de la aplicación, levanta las bases y migra
make db-up   # levanta las dos bases de datos y espera a que estén sanas
make start   # levanta backend y frontend a la vez; Ctrl-C para los dos
make help    # lista todos los atajos
```

`make start` **se queda corriendo en esa terminal**: para lo demás, abre otra. En este módulo no hace falta tenerlo levantado para la tarea, pero conviene arrancarlo una vez para saber que el entorno está bien.

Comprueba que cada pieza vive:

- **Backend** en `http://localhost:3333`. Desde otra terminal: `curl -s http://localhost:3333`.
- **Frontend** en `http://localhost:5173`. No hace falta abrirlo esta vez: la tarea va sobre la API (*Application Programming Interface*, la interfaz por la que el frontend habla con el servidor) y sobre los archivos del repositorio.
- **Las dos bases de datos** en el **54410** (desarrollo) y el **54411** (pruebas). No se usa el 5432 a propósito: quien tenga un PostgreSQL suyo levantado se lo encontraría ocupado, y el error que vería no menciona a Docker por ningún lado. **La de desarrollo tiene que estar levantada durante la parte A**: la imagen que construyes arranca contra ella.

Y la batería de pruebas del backend, una vez, antes de tocar nada. Es la mejor comprobación de que el entorno está bien montado, y además **es exactamente el comando que tu pipeline va a ejecutar** en la parte B:

```bash
make test        # migra la base de pruebas y corre la suite entera del backend
make test-unit   # solo la suite unitaria
make test-e2e    # solo la funcional: peticiones reales contra la API
```

### 4. Lo que NO hay, antes de tocar nada

Es tu línea de partida, y mirarla ahora es lo que hace que el resultado del ejercicio signifique algo. Un comando:

```bash
ls .github/workflows backend/Dockerfile .railway
```

Dos de las tres rutas **no existen**, y ese error es la respuesta: este proyecto **ya tiene pipeline** (dos workflows, `openapi.yml`, que comprueba el documento de la API en cada cambio propuesto, y `revisor.yml`, la revisión con un agente, que se salta los pull requests que llegan desde un fork), y **no tiene imagen ni infraestructura**. Abre los dos workflows y léelos: el tuyo va a vivir al lado y va a seguir su estilo.

Apunta también, ahora, qué variables tiene `backend/.env`. Vas a necesitar compararlas con lo que la imagen te reclame.

### 5. Crea tu rama

Trabaja en **tu propia rama**, no en `s13/start`. Créala **antes del primer prompt** con este nombre: `git checkout -b pipeline-<tus-iniciales>`. (El propio proyecto le prohíbe al agente commitear en una rama de partida, así que en cuanto tenga algo que guardar creará una rama nueva y commiteará ahí, **en cada prompt**. Es el proyecto haciendo lo que se le mandó. `git branch` y `git log --oneline` te enseñan dónde está todo, y `git status` saldrá limpio aunque acaben de escribirse cinco archivos.) Si el agente commitea en una rama suya, tráete esos commits a la tuya con `git merge <esa-rama>` antes de empujar.

---

## 📋 La tarea

**Empaqueta la API en una imagen que se construya desde cero, arráncala y apunta qué le faltaba; después escribe el pipeline del repositorio, un trabajo por pregunta, y valídalo sin salir de tu máquina.**

Es el mismo encargo que se resuelve en el directo, con la misma unidad de trabajo y los mismos insumos. **Los prompts los escribes tú**, y son la mitad de lo que se entrega.

> ✋ **Y el corte es fijo: el ejercicio termina con el pipeline validado en local.** No escribas la declaración de la infraestructura (la carpeta `.railway/`), no pidas ningún plan a ninguna plataforma y no despliegues nada. Eso necesita una cuenta que no se te pide, y se ve resuelto en el directo, donde lo que se compara es **tu resultado con el de la clase**.

### 🅰️ Parte A: la imagen, y lo que le falta para arrancar

Pídele al agente, en tus propias palabras, **un `backend/Dockerfile` multietapa** y **un `backend/.dockerignore`**, más **tres atajos en el `Makefile` de la raíz**. Lo que tiene que cumplir, porque es lo que cumple el del directo:

- **Dos etapas.** En la de construcción, la misma línea de Node que exige el proyecto (24), `npm ci` con todas las dependencias y `npm run build`, que en AdonisJS deja la aplicación compilada en `build/`. En la final, una imagen base de Node 24 lo más pequeña posible, **solo `build/`**, y dentro de `build/` las dependencias de producción (`npm ci --omit=dev`), que es como el propio framework documenta su despliegue. Ni el código fuente, ni las dependencias de desarrollo, ni ningún `.env` viajan a la imagen final.
- Corre como **usuario sin privilegios**, expone el 3333 y arranca con `node bin/server.js`. **Ninguna variable de entorno con valor dentro del Dockerfile**: la configuración entra al arrancar el contenedor, no al construir la imagen.
- El `.dockerignore` deja fuera `node_modules`, `build`, `tmp` y cualquier `.env`.
- Los tres atajos, con estos nombres y no otros, porque son los que se usan en clase: **`image`** construye la imagen con la etiqueta `flowsync-api:local`; **`image-run`** la arranca en segundo plano con el nombre de contenedor `flowsync-api-local`, publicando el puerto `IMAGE_PORT` (por defecto 3334) sobre el 3333 del contenedor, pasándole `backend/.env` como fichero de entorno y forzando encima tres valores (`HOST=0.0.0.0` y `DB_HOST=host.docker.internal`, porque dentro del contenedor `localhost` es el propio contenedor, y `APP_URL=http://localhost:<IMAGE_PORT>`, porque Docker no expande el `${HOST}:${PORT}` que ese fichero usa), y termina con un `curl -s` a la raíz del puerto publicado; **`image-stop`** para y borra el contenedor.

Después, en este orden, y sin que el agente lo haga por ti:

1. **`make image`.** Va a tardar: la primera vez se baja la imagen base de Node. Cuando termine, apunta el **tamaño** con `docker images flowsync-api:local`.
2. **`docker run --rm flowsync-api:local`, sin ninguna variable.** Va a morir en menos de un segundo. **Copia el mensaje entero**, con su lista: es el dato del ejercicio, y es la lista de lo que esta aplicación necesita para existir. Compárala con las variables que apuntaste de `backend/.env`.
3. **`make image-run`**, con la base de desarrollo levantada. Tiene que responder `{"hello":"world"}` desde dentro del contenedor. Si no responde, mira `docker logs flowsync-api-local` antes de tocar nada: el mensaje dice qué variable rechazó. Y **`make image-stop`** al terminar.

Tres restricciones, y ninguna es decorativa:

- **Una sola pasada por prompt.** Si la imagen no arranca, apúntalo, mira el mensaje y pide **una** corrección. Si tuviste que pedirla, eso es un hallazgo, no un fallo.
- **No copies un Dockerfile de internet.** Lo que se estudia es qué escribe el agente cuando le das las restricciones de arriba y qué añade por su cuenta.
- **No arregles a mano lo que salga.** Lo que salga es el dato.

### 🅱️ Parte B: el pipeline, un trabajo por pregunta

Pídele al agente **`.github/workflows/ci.yml`** y **un atajo `ci-lint`** en el `Makefile` de la raíz. El atajo valida todos los workflows de `.github/workflows/` con actionlint **sin instalar nada**: usa su imagen oficial de Docker, `rhysd/actionlint:1.7.12`, montando la raíz del repositorio y con `-color`. El workflow tiene **cinco trabajos, y cada uno responde a una pregunta**, porque es lo que cumple el del directo:

1. **`test`**: ¿la suite del backend pasa en una máquina limpia? PostgreSQL como contenedor de servicio con la imagen `pgvector/pgvector:pg17` publicada en el puerto `54411`, que es el que `backend/.env.test` ya espera (usuario `flowsync`, contraseña `flowsync`, base `flowsync_test`), esperando a que esté sano. Y **exactamente `make test`**, el mismo comando que corres en tu máquina; ni un `node ace` a mano. Las variables que `backend/start/env.ts` exige y que no están en `.env.test` van en el entorno del trabajo, como hace `openapi.yml`.
2. **`image`**: ¿el artefacto se puede fabricar desde cero? `make image`. Sin arrancar el contenedor: este trabajo afirma que la imagen se construye, no que arranque, y ese límite tiene que estar escrito en un comentario.
3. **`lint-workflows`**: ¿los propios archivos del pipeline son válidos? `make ci-lint`.
4. **`infra-plan`**: ¿qué cambiaría en la infraestructura si este cambio se fusiona? Solo en pull requests que toquen `.railway/**`, y solo si el pull request viene del propio repositorio y no de un fork, porque un fork no recibe los secretos. Con la acción oficial `railwayapp/config` en su versión `v1.2.0`, `command: plan` y el token en el secreto `RAILWAY_TOKEN`, para que el plan se publique como comentario del pull request.
5. **`infra-apply`**: el mismo plan, con `command: apply`, solo cuando el pull request se fusiona.

Y las reglas para todo el archivo: permisos mínimos declarados por trabajo, nunca `write-all`; cada acción de terceros **fijada a su SHA de commit completo** (*Secure Hash Algorithm*, el identificador de un commit), con la etiqueta de versión en un comentario al lado y resuelto por red, no de memoria; `test`, `image` y `lint-workflows` en paralelo; la ejecución anterior cancelada si llega otro push a la misma rama; y el recuento de tests publicado en el **resumen de la ejecución**, no en un `echo` que se pierde en el registro.

Después: **`make ci-lint`**. Tiene que quedarse en silencio con código 0. **Si canta, lo que canta es el dato**: apúntalo y pide una corrección. Y si el agente ya lo ejecutó por su cuenta y corrigió algo, apunta eso también.

> ⚠️ **No pongas ningún secreto en ningún archivo para que "funcione".** El trabajo `infra-plan` referencia un secreto que tú no tienes, y está bien así: en tu pull request ese trabajo **no correrá** (no toca `.railway/`, y no hay token). Un pipeline que corre la mitad sin llaves y la otra mitad solo para lo de dentro no está roto: está diseñado sabiendo que la mitad de fuera no tiene llaves.

> 🔑 **Para cuando uses una plataforma de despliegue.** Declarar la infraestructura en un archivo y pedirle un plan a una plataforma exige una cuenta con sesión iniciada. Tres cosas verificadas contra su documentación el 12 de septiembre de 2026, para que no te pillen a medias: **(1)** la cuenta se verifica automáticamente por la antigüedad y la actividad de tu cuenta de GitHub, y si no pasa te deja en un modo restringido con la red saliente recortada, sin nadie a quien reclamar; **(2)** el plan de entrada es un crédito único que dura semanas, no meses, y al agotarse los servicios se apagan; **(3)** su sistema antiguo de configuración por archivo está deprecado con fecha de corte, y buena parte de lo que encontrarás en internet enseña ese. Si te creas la cuenta, hazlo con días de antelación y no despliegues nada que no puedas apagar.

### Parte C: las tres líneas

En un `HALLAZGOS.md` en la raíz del repositorio:

1. **Cuánto pesa tu imagen y qué tuvo que escribir el Dockerfile que tu máquina daba por hecho.** Una dependencia del sistema, una versión, un paso de construcción: lo que en tu portátil ya estaba y en una máquina vacía hubo que declarar.
2. **Qué reclamó el contenedor al arrancar sin variables.** La lista literal, cuántas son, y cuáles de ellas son un **secreto** (su conocimiento da acceso) y cuáles **configuración** (si aparecieran en un registro público no pasaría nada). Es la clasificación de la lección de secretos, aplicada a tu lista real.
3. **Qué NO comprueba tu pipeline.** Una lista corta e incómoda: lo que ninguno de los cinco trabajos afirma. Es la columna de la derecha de la tabla que leíste, rellena para el tuyo.

**El entregable no es tener la imagen perfecta: son las tres líneas.** Una parte A a medias con las tres líneas escritas vale más que lo contrario, porque lo que importa es dónde te chocaste.

### Cómo saber que la has hecho bien

- **La imagen final no lleva el código fuente ni las dependencias de desarrollo.** Si pesa lo mismo que tu carpeta de trabajo, la segunda etapa se está copiando todo.
- **Ningún `.env` viajó dentro**, y ninguna variable tiene valor escrito en el Dockerfile. Ese es el fallo que más caro sale y no lo canta nadie.
- **Tienes el mensaje literal del arranque sin variables**, copiado entero. Es el dato del ejercicio, y reconstruirlo de memoria no vale.
- **`make ci-lint` se queda en silencio con código 0.** Si canta, apunta lo que dijo: eso también es entrega.
- **Cada acción de terceros está fijada a su SHA completo**, resuelto por red y no de memoria. Una etiqueta de versión se puede mover debajo de ti.
- **La tercera línea nombra cosas concretas que tu pipeline no comprueba**, no *«faltan cosas»*.

> Entrégalo con lo que tenga.

---

## 📤 Cómo se entrega

1. Trabaja en la rama **`pipeline-<tus-iniciales>`** que creaste al preparar el entorno, no en `s13/start`.
2. **Guarda tus prompts en `prompts.md`, en la raíz.** Ese nombre y esa ubicación no son negociables: es lo que lee la herramienta que revisa las entregas. El repositorio ya lo trae con su plantilla puesta. **Cada prompt va en su propio bloque de código**, con el modelo y la herramienta que usaste.
3. Empuja tu rama a tu fork (`git push -u origin pipeline-<tus-iniciales>`) y abre el **pull request desde tu fork hacia el repositorio del curso** (`github.com/LIDR-academy/flowsync-ai4devs`; comprueba que el repositorio base que te propone GitHub es ese y no tu fork), con `HALLAZGOS.md` y `prompts.md` dentro. **Puede que tu pipeline no llegue a correr sobre ese pull request**: en un repositorio público, las Actions de quien colabora por primera vez suelen esperar a que alguien las apruebe, y los dos trabajos de infraestructura se saltan de todos modos, porque un fork no recibe los secretos. Si corre, mira qué pasa; si no, apúntalo. En los dos casos, **apúntalo en la tercera línea si cambia tu respuesta**.

### El plazo

**El plazo es antes del directo.**

---

## 📚 Si vas justo de tiempo

Prioriza la lección sobre **por qué lo que se despliega no es tu código sino una imagen**, que es la parte A entera, y la que trata **qué garantiza cada etapa del pipeline**, que es la parte B. Las otras tres pueden esperar, aunque la de secretos y entornos es la que te da el vocabulario de la segunda línea que entregas.

Y si el reloj aprieta de verdad, la prioridad es la **parte A**: la imagen y su lista de variables son el dato más rico del ejercicio.

---

## ✅ Antes de conectarte, comprueba

- [ ] Estás en la rama de partida, sobre **tu fork**, y `git push` funciona.
- [ ] `docker ps` devuelve una tabla, `node -v` responde `v24` o más, y `make --version` responde.
- [ ] **`make image` construyó**, y tienes apuntado el tamaño.
- [ ] **Tienes copiado el mensaje entero** del arranque sin variables, con su lista.
- [ ] **`make ci-lint` corrió una vez** y tienes anotado lo que salió.
- [ ] **Traes `HALLAZGOS.md`** con sus tres líneas, y el Dockerfile y el workflow dentro del cambio.
- [ ] **`prompts.md` está relleno**, con modelo y herramienta en cada bloque.
- [ ] **Tu rama se llama `pipeline-<tus-iniciales>` y el pull request está abierto contra el repositorio del curso.**

> Trae el archivo tal como quedó, sin maquillarlo: lo que le falta es la mitad de lo interesante.

---

## 🎯 Qué te llevas del Módulo 13

**El modelo mental**: que el valor de declarar la infraestructura en un archivo no es automatizarla, es que aparece un diff y, antes de aplicar nada, un plan que enumera lo que se crearía, lo que se modificaría y lo que se destruiría, y que ese plan es la única revisión que en código de aplicación no existe. Que lo que se despliega no es tu código sino una imagen que lleva la máquina dentro, y que construirla desde cero te obliga a escribir lo que dabas por hecho. Que un pipeline en verde no significa que el cambio esté bien, sino que ninguna de las comprobaciones que hay ha fallado, y que cada trabajo responde a una pregunta y no responde a las demás. Que el mejor secreto es el que no existe, que una credencial se clasifica por si su conocimiento da acceso, y que la mitad del pipeline que necesita llaves no corre para un cambio que viene de fuera. Y que una funcionalidad que existe no es una funcionalidad que tú tengas: el plan y la visibilidad del repositorio son parte de la arquitectura.

**Lo que queda en el proyecto**: un Dockerfile de la API en dos etapas con su `.dockerignore`, y tres atajos de `make` para construir, arrancar y parar la imagen. Un workflow `ci.yml` con cinco trabajos, cada uno con su pregunta y su límite escrito, las acciones fijadas a un identificador de commit, y la mitad de infraestructura que solo corre para lo de dentro; más un atajo `ci-lint` que lo valida con el mismo comando en tu máquina y en la máquina limpia. Un fichero de hallazgos con tus tres líneas: el tamaño de tu imagen, la lista de lo que reclamó el contenedor, y lo que tu pipeline no comprueba. Y el registro de tus prompts, con la forma exacta en que pediste la imagen y el pipeline, que es lo que te permite explicar después por qué salió lo que salió.

> 👥 **Qué te llevas según de dónde vengas.**
> - **Si eres dev**: lo que merece tu tiempo es la lista de lo que cada paso del pipeline no comprueba, porque ahí están sus huecos. Y en un despliegue, saber qué se deshace y qué no, que es lo que decide el orden de los pasos.
> - **Si vienes de producto o gestión**: declarar la infraestructura en un archivo convierte una decisión en algo que alguien propuso y otro aprobó. «Está todo en verde» significa que ninguna de las comprobaciones que existen ha fallado, y «esto no se puede hacer con lo que tenemos» pesa más con la línea de la documentación que lo dice.
> - **Si no tienes background técnico**: el código es la receta, y lo que se despliega es el plato ya hecho. Un control de calidad solo garantiza lo que mide.
