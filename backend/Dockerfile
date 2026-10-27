# Imagen de la API de FlowSync. Dos etapas: en la primera se compila con todas
# las dependencias; a la final solo llega build/ con sus dependencias de
# producción. Ninguna configuración se hornea aquí: todo entra al arrancar el
# contenedor (ver `make image-run`).

# ---------------------------------------------------------------------------
# construcción
# ---------------------------------------------------------------------------
FROM node:24-alpine AS build

WORKDIR /app

# Primero solo los manifiestos, para que la capa de npm ci se reaproveche
# mientras no cambien las dependencias.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# final
# ---------------------------------------------------------------------------
FROM node:24-alpine

# WORKDIR crea el directorio como root: se le da a node para que npm ci pueda
# escribir node_modules sin correr como root.
WORKDIR /app
RUN chown node:node /app

# `node ace build` deja en build/ el package.json y el package-lock.json: la
# instalación de producción se hace ahí, como documenta AdonisJS.
COPY --from=build --chown=node:node /app/build ./

USER node

RUN npm ci --omit=dev && npm cache clean --force

EXPOSE 3333

CMD ["node", "bin/server.js"]
