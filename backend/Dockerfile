# syntax=docker/dockerfile:1
#
# Imagen de la API de FlowSync. Multietapa: la primera compila con todas las
# dependencias y la segunda solo lleva build/ con las de producción.
# Ninguna variable de configuración con valor: todo entra al arrancar el contenedor
# (ver `make image-run` en el Makefile de la raíz).

# Node 24: el proyecto no tiene .nvmrc ni "engines" propio, pero las dependencias
# de AdonisJS 7 exigen "node": ">=24.0.0" (package-lock.json) y el CI de OpenAPI
# usa node-version 24. Un portátil puede ir por delante (25.x); aquí se fija la 24.
# Alpine (musl) en las dos etapas: las dependencias nativas (@swc/core en build,
# @ast-grep/napi también en producción, que arrastra @adonisjs/auth vía
# @adonisjs/assembler) traen binarios precompilados para linux-*-musl, así que no
# hace falta python, make ni g++ para compilar nada con node-gyp.
FROM node:24-alpine AS build

WORKDIR /app

# Primero solo los manifiestos, para que la capa de `npm ci` se reutilice mientras
# no cambien las dependencias. Con todas (también devDependencies): el build usa
# TypeScript, @adonisjs/assembler y @poppinss/ts-exec.
COPY package.json package-lock.json ./
RUN npm ci

# El resto del código (lo que filtra .dockerignore: sin .env, node_modules, build ni tmp).
# .adonisjs/ va versionado y se copia: el build lo necesita para compilar sin arrancar nada.
COPY . .

# `node ace build` compila a build/ y copia allí package.json y package-lock.json.
RUN npm run build


FROM node:24-alpine AS runtime

WORKDIR /app

# Solo el resultado compilado; ni el código fuente ni los node_modules de la etapa anterior.
COPY --from=build /app/build ./

# Dependencias de producción dentro de build/, como documenta AdonisJS para desplegar.
# Se limpia la caché de npm para que no se quede en la capa.
RUN npm ci --omit=dev && npm cache clean --force

# Usuario sin privilegios que ya trae la imagen oficial de Node (uid 1000).
USER node

EXPOSE 3333

CMD ["node", "bin/server.js"]
