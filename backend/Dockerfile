# API de FlowSync (AdonisJS 7). Se construye desde la carpeta backend/:
#   docker build -t flowsync-api:local backend
# o con `make image`, desde la raíz.

# ---------------------------------------------------------------------------
# Etapa de build: todas las dependencias, para compilar y comprobar tipos
# ---------------------------------------------------------------------------
FROM node:24-alpine AS build

WORKDIR /app

# Solo los manifiestos primero: mientras no cambien, la capa de `npm ci` se reutiliza.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# `node ace build` deja en build/ la aplicación compilada junto con package.json y
# package-lock.json. Las dependencias de producción se instalan dentro de build/
# (es como documenta el framework su despliegue), de modo que build/ es autosuficiente.
RUN npm run build \
 && cd build \
 && npm ci --omit=dev

# ---------------------------------------------------------------------------
# Etapa final: solo build/ (con sus dependencias de producción)
# ---------------------------------------------------------------------------
FROM node:24-alpine

WORKDIR /app

# Sin código fuente, sin dependencias de desarrollo y sin ningún .env. La
# configuración entra al arrancar el contenedor (-e o --env-file), no aquí:
# por eso no hay ni un ENV con valor en este fichero.
COPY --from=build --chown=node:node /app/build ./

# `node` es el usuario sin privilegios que ya trae la imagen oficial.
USER node

EXPOSE 3333

CMD ["node", "bin/server.js"]
