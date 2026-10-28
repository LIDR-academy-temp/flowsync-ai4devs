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

**Modelo:** Sonnet 5.5
**Herramienta:** Claude Code

```
Necesito empaquetar la API en una imagen de Docker. Crea backend/Dockerfile,
backend/.dockerignore y tres atajos en el Makefile de la raíz.

Dockerfile, en dos etapas:
- Construcción: Node 24 (la versión que exige el proyecto), npm ci con todas
  las dependencias y npm run build, que deja la app compilada en build/.
- Final: imagen base de Node 24 lo más pequeña posible. Solo copia build/,
  y dentro de build/ instala las dependencias de producción con
  npm ci --omit=dev. Ni código fuente, ni dependencias de desarrollo, ni
  ningún .env en la imagen final.
- Corre con un usuario sin privilegios, expone el 3333 y arranca con
  node bin/server.js.
- Ninguna variable de entorno con valor dentro del Dockerfile (ni ENV ni ARG
  con valores): la configuración entra al arrancar el contenedor.

.dockerignore: deja fuera node_modules, build, tmp y cualquier .env.

Atajos del Makefile, con estos nombres exactos:
- image: construye la imagen con la etiqueta flowsync-api:local.
- image-run: arranca en segundo plano un contenedor llamado
  flowsync-api-local, publica IMAGE_PORT (por defecto 3334) sobre el 3333,
  usa backend/.env como fichero de entorno y fuerza encima
  HOST=0.0.0.0, DB_HOST=host.docker.internal y
  APP_URL=http://localhost:<IMAGE_PORT>. Termina con un curl -s a la raíz
  del puerto publicado.
- image-stop: para y borra ese contenedor.

No construyas ni arranques la imagen: lo haré yo.
```

**Qué salió:** (opcional, una línea) funcionó, se creo el archivo de doker y actulizo archivos

## Prompt 2

**Modelo:** Sonnet 5.5
**Herramienta:** Claude Code

```
make image falla en la etapa final con este error:

EACCES: permission denied, mkdir '/app/node_modules'
en la línea: RUN npm ci --omit=dev && npm cache clean --force (ya como USER node)

Corrígelo manteniendo las restricciones: la imagen final sigue corriendo como
usuario sin privilegios, sin ENV ni ARG con valores, y solo con build/ y sus
dependencias de producción. Explícame en una frase la causa.
No construyas la imagen: lo haré yo.
```

**Qué salió:** (opcional, una línea) funcionó, se creo el archivo de doker y actulizo archivos
