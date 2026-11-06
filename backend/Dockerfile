FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:24-alpine AS production
WORKDIR /app

COPY --from=build --chown=node:node /app/build ./build

WORKDIR /app/build
RUN npm ci --omit=dev && npm cache clean --force && chown -R node:node /app

USER node
EXPOSE 3333
CMD ["node", "bin/server.js"]
