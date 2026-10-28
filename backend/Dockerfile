# Etapa 1: construcción. Todas las dependencias, para poder compilar.
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Deja la app compilada, con su package.json y su lockfile, en /app/build
RUN npm run build

# Etapa 2: final. Solo lo compilado y las dependencias de producción.
# Sin código fuente, sin dependencias de desarrollo y sin .env: la configuración
# entra al arrancar el contenedor (docker run -e / --env-file).
FROM node:24-alpine
# WORKDIR crea /app como root y --chown solo afecta a lo copiado, no al directorio:
# se crea aquí con dueño node para que npm ci pueda escribir /app/node_modules.
RUN mkdir /app && chown node:node /app
WORKDIR /app
COPY --from=build --chown=node:node /app/build ./
USER node
RUN npm ci --omit=dev && npm cache clean --force
EXPOSE 3333
CMD ["node", "bin/server.js"]
