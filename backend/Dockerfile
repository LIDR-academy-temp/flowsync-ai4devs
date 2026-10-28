# Imagen de la API de FlowSync. Contexto de construcción: backend/.
#
# Dos etapas: la primera instala todo (devDependencies incluidas, hacen falta
# para compilar TypeScript) y deja la aplicación compilada en build/; la segunda
# recibe solo build/ e instala ahí las dependencias de producción, con el
# package.json y el package-lock.json que `node ace build` copia dentro.
#
# Ningún valor de configuración vive aquí: las variables de start/env.ts se
# pasan al arrancar el contenedor (ver `make image-run`).

# ---------------------------------------------------------------------------
# construcción
# ---------------------------------------------------------------------------
FROM node:24 AS build

WORKDIR /app

# Primero solo lo que declara y bloquea las dependencias: mientras no cambien,
# la capa de `npm ci` sale de la caché.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# ejecución
# ---------------------------------------------------------------------------
# Alpine basta: ninguna dependencia de producción tiene módulos nativos (pg es
# JavaScript puro y el hash es scrypt, de node:crypto).
FROM node:24-alpine

WORKDIR /app/build

COPY --from=build /app/build ./

# Se instala como root y se ejecuta como `node` (el usuario sin privilegios que
# trae la imagen oficial): el proceso no puede reescribir su propio código.
RUN npm ci --omit=dev && npm cache clean --force

USER node

EXPOSE 3333

CMD ["node", "bin/server.js"]
