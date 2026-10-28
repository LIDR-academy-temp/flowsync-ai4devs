# Imagen de la API de FlowSync (AdonisJS 7). Se construye desde backend/:
#   docker build -t flowsync-api backend
# La configuración (NODE_ENV, APP_KEY, DB_*...) entra al arrancar, nunca aquí:
#   docker run --env-file backend/.env.production -p 3333:3333 flowsync-api

# ---------------------------------------------------------------------------
# Construcción: dependencias completas y `node ace build`, que deja en build/
# el JavaScript compilado junto con su package.json y su package-lock.json.
# ---------------------------------------------------------------------------
FROM node:24.22.1-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# `node ace build` compila también los tests; no tienen nada que hacer en la imagen.
RUN npm run build && rm -rf build/tests build/bin/test.js build/bin/test.js.map

# ---------------------------------------------------------------------------
# Ejecución: solo build/ y las dependencias de producción, sin código fuente,
# sin dependencias de desarrollo y sin ningún .env.
# ---------------------------------------------------------------------------
FROM node:24.22.1-alpine3.24 AS runtime

WORKDIR /build

# Los ficheros quedan de root y el proceso corre como `node`: la aplicación
# puede leer su código pero no reescribirlo.
COPY --from=build /app/build /build
RUN npm ci --omit=dev && npm cache clean --force

USER node

EXPOSE 3333

CMD ["node", "bin/server.js"]
