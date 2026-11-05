# Imagen de la API de FlowSync. Se construye con `make image`, con backend/
# como contexto.
#
# Dos etapas: en `build` se instalan todas las dependencias y se compila; en la
# final solo viaja build/, con sus dependencias de producción instaladas dentro,
# que es como documenta AdonisJS su despliegue.
#
# No hay ningún ENV ni ARG con valor: la configuración que valida start/env.ts
# entra al arrancar el contenedor, nunca al construir la imagen.

# ---------------------------------------------------------------------------
# build: compila la aplicación
# ---------------------------------------------------------------------------

# Node 24: es el mínimo que declaran en `engines` @adonisjs/core, @adonisjs/lucid,
# @adonisjs/assembler y @tuyau/core. package.json no fija ninguna versión.
FROM node:24-alpine AS build

WORKDIR /app

# Primero solo el manifiesto y el lockfile: esta capa se reutiliza mientras no
# cambien las dependencias, aunque cambie el código.
COPY package.json package-lock.json ./
RUN npm ci

# `node ace build` no arranca la aplicación, así que no necesita ninguna
# variable de entorno. Deja en build/ el JS compilado y copia ahí package.json
# y package-lock.json, que son los que usa el `npm ci` de la etapa final.
COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# final: solo lo que se ejecuta
# ---------------------------------------------------------------------------

# Alpine: la imagen oficial de Node 24 más pequeña que trae npm, que hace falta
# para el `npm ci --omit=dev`. La distroless no lo trae, y la slim (Debian) pesa
# bastante más. musl no da problemas: ninguna dependencia compila nada al
# instalarse, y la única con binario nativo (@ast-grep/napi) tiene su variante
# musl en el lockfile.
FROM node:24-alpine

WORKDIR /app

COPY --from=build /app/build ./

# Se instala como root a propósito: el código y node_modules quedan de root, y
# el proceso, que corre como `node`, no puede reescribirlos. La caché de npm se
# borra para que no pese en la capa.
RUN npm ci --omit=dev && npm cache clean --force

# Usuario sin privilegios (uid 1000) que ya trae la imagen oficial de Node.
USER node

EXPOSE 3333

# Sin `npm start` por medio: así el SIGTERM de `docker stop` le llega a Node,
# y bin/server.js lo escucha para cerrar ordenadamente.
CMD ["node", "bin/server.js"]
