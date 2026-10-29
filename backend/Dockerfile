# Imagen de la API de FlowSync. Se construye desde la raíz con `make image`.
#
# Dos etapas: la primera compila con todas las dependencias; la segunda solo
# lleva `build/` (lo que deja `node ace build`) con las de producción, que es
# como AdonisJS documenta su despliegue. Ni el código fuente, ni las
# dependencias de desarrollo, ni ningún `.env` llegan a la imagen final.
#
# No hay ninguna variable de entorno con valor: la configuración entra al
# arrancar el contenedor (`docker run --env-file ...`), no al construirlo.

# ---------------------------------------------------------------------------
# construcción
# ---------------------------------------------------------------------------
FROM node:24-alpine AS build

WORKDIR /app

# Primero solo los manifiestos, para que la capa de `npm ci` se reutilice
# mientras no cambien las dependencias.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# final
# ---------------------------------------------------------------------------
FROM node:24-alpine

WORKDIR /app

# `node ace build` copia a `build/` el package.json y el package-lock.json,
# así que la instalación de producción se hace ahí dentro.
COPY --from=build /app/build ./
RUN npm ci --omit=dev && npm cache clean --force

# Los ficheros quedan de root y la aplicación corre como `node` (el usuario sin
# privilegios que trae la imagen oficial): puede leer su código, no reescribirlo.
USER node

EXPOSE 3333

CMD ["node", "bin/server.js"]
