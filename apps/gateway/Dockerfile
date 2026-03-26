# ---- Build stage ----
FROM node:22-alpine AS build

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./

# Copy only the packages needed for gateway
COPY packages/ packages/
COPY apps/gateway/package.json apps/gateway/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy gateway source
COPY apps/gateway/ apps/gateway/

# Build shared first, then gateway
RUN pnpm turbo build --filter=@gaucho/gateway...

# ---- Production stage ----
FROM node:22-slim AS production

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

RUN groupadd -r gaucho && useradd -r -g gaucho -m gaucho

WORKDIR /app

COPY --from=build /app/package.json /app/pnpm-workspace.yaml ./
COPY --from=build /app/apps/gateway/dist apps/gateway/dist
COPY --from=build /app/apps/gateway/package.json apps/gateway/
COPY --from=build /app/apps/gateway/node_modules apps/gateway/node_modules
COPY --from=build /app/packages packages
COPY --from=build /app/node_modules node_modules

USER gaucho

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "apps/gateway/dist/index.js"]
