# syntax=docker/dockerfile:1

# Etapa de construcción: todas las dependencias y `npm run build`, que deja la
# aplicación compilada en build/ (con package.json y package-lock.json dentro).
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa final: solo build/ y las dependencias de producción instaladas dentro
# de build/, como documenta AdonisJS. Sin código fuente, sin dependencias de
# desarrollo y sin .env: la configuración entra al arrancar el contenedor.
FROM node:24-alpine
RUN mkdir /app && chown node:node /app
WORKDIR /app
USER node
COPY --from=build --chown=node:node /app/build ./
RUN npm ci --omit=dev
EXPOSE 3333
CMD ["node", "bin/server.js"]
