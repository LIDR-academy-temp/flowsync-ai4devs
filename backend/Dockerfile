# Imagen de la API de FlowSync, en dos etapas.
#
# La configuración entra al arrancar el contenedor (--env-file / -e), nunca al
# construir: aquí no hay ninguna variable de entorno con valor ni ningún .env.

# ---------------------------------------------------------------------------
# Construcción: todas las dependencias y `node ace build`, que deja la
# aplicación compilada en build/ junto con su package.json y su lockfile.
# ---------------------------------------------------------------------------
# Node 24, la misma línea que exige el proyecto (@adonisjs/lucid: node >=24).
FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# Final: solo build/ y, dentro, las dependencias de producción. Ni el código
# fuente ni las dependencias de desarrollo viajan hasta aquí.
# ---------------------------------------------------------------------------
FROM node:24-alpine

WORKDIR /app

# La imagen oficial trae el usuario sin privilegios `node`; la aplicación es suya
# para que npm ci pueda escribir node_modules sin pasar por root.
RUN chown node:node /app
USER node

COPY --from=build --chown=node:node /app/build ./
RUN npm ci --omit=dev && npm cache clean --force

EXPOSE 3333

CMD ["node", "bin/server.js"]
