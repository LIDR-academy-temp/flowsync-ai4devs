# Imagen de la API de FlowSync. Se construye desde backend/ (`make image`).
#
# Dos etapas: la de construcción tiene las dependencias de desarrollo y el código
# fuente TypeScript; la final solo se lleva build/ (lo que deja `node ace build`)
# con las dependencias de producción, como documenta AdonisJS su despliegue.
#
# No hay ningún ENV con valor: la configuración (APP_KEY, DB_*, ...) entra al
# arrancar el contenedor y `start/env.ts` la valida. Una imagen con valores
# dentro los publica a quien pueda hacer `docker pull` o `docker history`.

# ---------------------------------------------------------------------------
# build: compila TypeScript y genera build/
# ---------------------------------------------------------------------------
# Misma línea de Node que exige el proyecto (Lucid declara >= 24).
FROM node:24 AS build

WORKDIR /app

# Primero solo los manifiestos: mientras no cambien, la capa de `npm ci` sale
# de la caché aunque cambie el código.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# runtime: solo build/ y dependencias de producción
# ---------------------------------------------------------------------------
# Alpine y no slim: ninguna dependencia de producción trae binarios nativos
# (el hash es scrypt de node:crypto y `pg` es JavaScript puro), así que musl no
# rompe nada y la base pesa la mitad.
FROM node:24-alpine AS runtime

WORKDIR /app

# `node ace build` copia package.json y package-lock.json dentro de build/, y
# es ahí donde se instalan las de producción. Se copian primero los manifiestos
# para que la capa de dependencias se cachee igual que en la etapa anterior.
COPY --from=build --chown=node:node /app/build/package.json /app/build/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build --chown=node:node /app/build ./

# El usuario `node` (uid 1000) ya viene en la imagen oficial: sin privilegios.
USER node

EXPOSE 3333

CMD ["node", "bin/server.js"]
