# Imagen de la API de FlowSync. Se construye y se arranca con `make image` e
# `make image-run` desde la raíz del repo.
#
# Ninguna variable de entorno lleva valor aquí: la configuración (APP_KEY,
# DB_*, HOST, PORT...) entra al arrancar el contenedor, nunca en la imagen.

# ---------------------------------------------------------------------------
# Construcción: todas las dependencias, compilación y dependencias de producción
# ---------------------------------------------------------------------------
FROM node:24-alpine AS build

WORKDIR /app

# Primero solo los manifiestos, para que la capa de `npm ci` se reutilice
# mientras no cambien las dependencias.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# `node ace build` deja en build/ el JS compilado más package.json y
# package-lock.json; ahí dentro se instalan solo las de producción.
RUN npm run build \
 && cd build \
 && npm ci --omit=dev \
 && npm cache clean --force

# ---------------------------------------------------------------------------
# Final: solo build/, sin código fuente ni dependencias de desarrollo
# ---------------------------------------------------------------------------
FROM node:24-alpine

WORKDIR /app

# Los ficheros quedan de root y el proceso corre como `node` (el usuario sin
# privilegios que trae la imagen): la aplicación puede leer su código pero no
# reescribirlo.
COPY --from=build /app/build ./

USER node

EXPOSE 3333

CMD ["node", "bin/server.js"]
