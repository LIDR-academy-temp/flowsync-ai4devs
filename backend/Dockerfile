# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# build: compila el TypeScript con todas las dependencias (node ace build → build/)
# ---------------------------------------------------------------------------
FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# production: solo el compilado y las dependencias de ejecución.
# Sin ENV a propósito: la configuración (y los secretos) entran al arrancar el
# contenedor (--env-file, -e), nunca cocinados en la imagen.
# ---------------------------------------------------------------------------
FROM node:24-alpine AS production

WORKDIR /app

COPY --from=build /app/build ./
# Las dependencias se instalan como root: /app queda de solo lectura para `node`,
# que es quien arranca el proceso y no necesita escribir en él.
RUN npm ci --omit=dev

USER node

EXPOSE 3333

CMD ["node", "bin/server.js"]
