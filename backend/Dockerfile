# Imagen del backend de FlowSync. Se construye desde la raíz con `make image`
# (contexto: backend/) y se arranca con `make image-run`.
#
# Dos etapas: la primera compila con todas las dependencias; la segunda solo
# recibe build/ e instala en él las de producción, como documenta AdonisJS
# para desplegar. Ni el código fuente, ni las dependencias de desarrollo, ni
# ningún .env llegan a la imagen final.
#
# No hay ENV ni ARG con valor: toda la configuración (incluido NODE_ENV) entra
# al arrancar el contenedor, no al construir la imagen.

# ---------------------------------------------------------------------------
# construcción
# ---------------------------------------------------------------------------

# Node 24: es lo que exigen @adonisjs/core, lucid, auth... (engines >=24.0.0).
# Alpine también aquí para que los binarios nativos de desarrollo (@swc/core,
# @ast-grep/napi) se resuelvan con la variante musl, que el lockfile ya trae.
FROM node:24-alpine AS build

WORKDIR /app

# Primero lo que declara las dependencias: mientras package.json y el lockfile
# no cambien, esta capa sale de la caché aunque cambie el código.
COPY package.json package-lock.json ./
RUN npm ci

# Después el código. .adonisjs/ tiene que estar en el contexto: el import
# #generated/* apunta a él y `node ace build` lo compila dentro de build/.
COPY . .

# `node ace build` no arranca la aplicación, así que no valida el entorno y
# compila sin ningún .env. Aborta si hay errores de TypeScript.
RUN npm run build

# ---------------------------------------------------------------------------
# final
# ---------------------------------------------------------------------------

# La imagen de Node 24 más pequeña que trae npm, que hace falta para el
# `npm ci --omit=dev` dentro de build/ (las distroless no lo tienen).
FROM node:24-alpine

WORKDIR /app

# Mismo orden que arriba: el package.json y el lockfile que `node ace build`
# copia a build/ primero, para no reinstalar si solo cambia el código. La
# caché de npm se borra porque en tiempo de ejecución no sirve y ocupa.
COPY --from=build /app/build/package.json /app/build/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/build ./

# Los ficheros se quedan de root y el proceso corre como `node` (uid 1000, ya
# existe en la imagen oficial): el servidor solo lee, así que no necesita poder
# escribir en su propio código.
USER node

EXPOSE 3333

# bin/server.ts escucha SIGTERM, así que `docker stop` lo apaga ordenadamente.
CMD ["node", "bin/server.js"]
