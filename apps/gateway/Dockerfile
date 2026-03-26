FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/gateway/package.json ./apps/gateway/
COPY packages/shared/package.json ./packages/shared/
COPY packages/typescript-config/*.json ./packages/typescript-config/
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/ ./
COPY turbo.json ./
COPY packages/typescript-config/ ./packages/typescript-config/
COPY packages/shared/ ./packages/shared/
COPY apps/gateway/ ./apps/gateway/
RUN pnpm turbo build --filter=@gaucho/gateway...

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/apps/gateway/dist ./dist
COPY --from=builder /app/apps/gateway/package.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
