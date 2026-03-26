# GauchoCowork Architecture

## System Overview

```
Mobile App (Expo) --HTTPS+SSE--> Gateway (Hono) --HTTP+SSE--> OpenCode (Go)
```

### Mobile App (`apps/mobile`)
React Native + Expo. Handles UI, local state, SSE streaming, offline templates.

### Gateway (`apps/gateway`)
Node.js + Hono. Spawns/monitors OpenCode, JWT auth, push relay, feature endpoints.

### Shared (`packages/shared`)
TypeScript types, constants, @opencode-ai/sdk re-exports.

## Data Flow

1. User sends prompt from mobile
2. Gateway authenticates and proxies to OpenCode
3. OpenCode streams SSE events
4. Gateway relays to mobile (+ push for background)
5. Mobile renders execution timeline and chat

## ADRs

See [adrs/](./adrs/) for architectural decision records.
