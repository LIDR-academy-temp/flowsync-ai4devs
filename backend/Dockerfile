# Imagen de la API de FlowSync, en dos etapas.
#
# La configuración entra al arrancar el contenedor (`docker run --env-file ...`,
# ver `make image-run`), nunca al construir: aquí no hay ninguna variable con valor.

# ---------------------------------------------------------------------------
# build: dependencias completas y compilación a build/
# ---------------------------------------------------------------------------
FROM node:24-alpine AS build

WORKDIR /app

# Primero solo los manifiestos, para que la capa de `npm ci` se reaproveche
# mientras no cambien las dependencias.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# final: solo build/ y, dentro, las dependencias de producción
# ---------------------------------------------------------------------------
FROM node:24-alpine AS production

WORKDIR /app

# `node ace build` copia package.json y package-lock.json dentro de build/, así
# que el `npm ci --omit=dev` se hace sobre lo compilado, como documenta AdonisJS.
COPY --from=build --chown=node:node /app/build ./
RUN npm ci --omit=dev && npm cache clean --force

# Usuario sin privilegios que ya trae la imagen oficial de Node.
USER node

EXPOSE 3333

CMD ["node", "bin/server.js"]
