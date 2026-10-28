# Imagen de la API de FlowSync, en dos etapas. Se construye con `make image`.
#
# - build: todas las dependencias y `npm run build` (`node ace build`), que deja
#   la aplicación compilada en build/ junto con su package.json y su
#   package-lock.json.
# - runtime: solo build/ y, dentro, las dependencias de producción, que es como
#   AdonisJS documenta su despliegue. Ni el código fuente, ni las devDependencies,
#   ni ningún .env (el .dockerignore los deja fuera del contexto).
#
# No hay ningún ENV con valor: la configuración entra al arrancar el contenedor
# (`docker run --env-file ...`, ver `make image-run`). Sin ella, start/env.ts
# aborta el arranque con la lista de variables que faltan.

FROM node:24-alpine AS build
WORKDIR /app

# Primero solo los manifiestos: la capa de `npm ci` se reutiliza mientras no
# cambien las dependencias, aunque cambie el código.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:24-alpine AS runtime
WORKDIR /app

COPY --from=build /app/build ./
RUN npm ci --omit=dev && npm cache clean --force

# El código queda en propiedad de root y el proceso corre como `node` (uid 1000,
# ya viene en la imagen base): la aplicación no puede reescribirse a sí misma.
USER node

EXPOSE 3333
CMD ["node", "bin/server.js"]
