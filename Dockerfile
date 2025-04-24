# Etapa de construcción
FROM node:21-alpine3.18 AS builder

WORKDIR /app

# Habilitar Corepack y preparar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate
ENV PNPM_HOME=/usr/local/bin

# Copiar archivos de dependencias
COPY package*.json .npmrc .yarnrc.yml ./
COPY pnpm-lock.yaml ./

# Instalar dependencias de compilación y Python
RUN apk add --update --no-cache --virtual .gyp \
    python3 \
    python3-dev \    # Necesario para pip/setuptools [[5]]
    make \
    g++ \
    build-base \     # Herramientas de compilación esenciales [[6]]
    linux-headers \  # Headers del kernel para módulos nativos [[6]]
    musl-dev \       # Librerías C para Alpine [[6]]
    git

# Copiar código fuente y construir
COPY . .
RUN pnpm install && pnpm run build

# Eliminar dependencias temporales
RUN apk del .gyp

# Etapa de despliegue (sin cambios)
FROM node:21-alpine3.18 AS deploy
WORKDIR /app
ARG PORT
ENV PORT $PORT
EXPOSE $PORT

# Copiar artefactos desde builder
COPY --from=builder /app/assets ./assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/*.json /app/*-lock.yaml ./

# Configuración final
RUN corepack enable && corepack prepare pnpm@latest --activate 
ENV PNPM_HOME=/usr/local/bin
RUN npm cache clean --force && pnpm install --production --ignore-scripts \
    && addgroup -g 1001 -S nodejs && adduser -S -u 1001 nodejs \
    && rm -rf $PNPM_HOME/.npm $PNPM_HOME/.node-gyp

CMD ["pnpm", "start"]