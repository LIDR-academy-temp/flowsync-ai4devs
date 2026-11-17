# syntax=docker/dockerfile:1
#
# Imagen de la API de FlowSync, en dos etapas:
#   1. build:   compila la aplicación (AdonisJS deja el resultado en build/).
#   2. runtime: solo build/ y sus dependencias de producción.
#
# Ninguna variable de entorno lleva valor aquí: la configuración entra al
# arrancar el contenedor (`docker run --env-file ...`), no al construir la
# imagen. `start/env.ts` se niega a arrancar si falta alguna.

# ---------------------------------------------------------------------------
# Etapa 1: construcción. Node 24, la misma línea que exige el proyecto.
# ---------------------------------------------------------------------------
FROM node:24-alpine AS build

WORKDIR /app

# Primero solo los manifiestos: mientras no cambien, esta capa (y el `npm ci`)
# sale de la caché aunque cambie el código.
COPY package.json package-lock.json ./
RUN npm ci

# Todas las dependencias (las de desarrollo incluidas: `node ace build` usa
# TypeScript y el ensamblador), y después el código.
COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# Etapa 2: imagen final. Solo build/ y las dependencias de producción dentro de
# build/, que es como AdonisJS documenta su despliegue. Ni código fuente, ni
# dependencias de desarrollo, ni ningún .env.
# ---------------------------------------------------------------------------
FROM node:24-alpine AS runtime

WORKDIR /app

COPY --from=build /app/build/package.json /app/build/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build --chown=node:node /app/build ./

# `node` ya existe en la imagen oficial (uid 1000): no se corre como root.
USER node

EXPOSE 3333

CMD ["node", "bin/server.js"]
