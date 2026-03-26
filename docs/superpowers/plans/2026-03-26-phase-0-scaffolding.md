# Phase 0: Monorepo Scaffolding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the complete GauchoCowork Turborepo monorepo — Expo mobile app, Hono gateway, shared TypeScript package — with testing, linting, Docker, Makefile, docs, and scripts. Ready for Phase 1 TDD.

**Architecture:** Turborepo monorepo with pnpm workspaces. `packages/typescript-config` provides shared tsconfig bases. `packages/shared` exports types and re-exports `@opencode-ai/sdk`. `apps/gateway` is a Hono HTTP server (will proxy OpenCode). `apps/mobile` is an Expo Router app with NativeWind and i18n (es-AR default).

**Tech Stack:** Turborepo 2.8, pnpm 9, TypeScript 5.7, Expo SDK 55, Expo Router, NativeWind 4, Zustand 5, Hono 4.12, Vitest 3, Jest + RNTL, ESLint 9, Prettier 3, Docker Compose

---

## File Structure

```
gaucho-cowork/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── .npmrc
├── .gitignore
├── .prettierrc
├── eslint.config.mjs
├── Makefile
├── docker-compose.yml
├── docker-compose.test.yml
├── .env.example
├── README.md
│
├── packages/
│   ├── typescript-config/
│   │   ├── package.json
│   │   ├── base.json
│   │   ├── node.json
│   │   ├── expo.json
│   │   └── library.json
│   └── shared/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── types/
│           │   ├── session.ts
│           │   ├── server.ts
│           │   ├── events.ts
│           │   ├── workspace.ts
│           │   ├── permission.ts
│           │   ├── template.ts
│           │   ├── gateway.ts
│           │   ├── browser.ts
│           │   ├── messaging.ts
│           │   └── skill.ts
│           └── constants/
│               ├── api-routes.ts
│               └── event-types.ts
│
├── apps/
│   ├── gateway/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vitest.config.ts
│   │   ├── Dockerfile
│   │   └── src/
│   │       ├── app.ts
│   │       ├── index.ts
│   │       └── __tests__/
│   │           └── health.test.ts
│   └── mobile/
│       ├── package.json
│       ├── tsconfig.json
│       ├── app.json
│       ├── metro.config.js
│       ├── babel.config.js
│       ├── tailwind.config.js
│       ├── global.css
│       ├── jest.config.ts
│       ├── app/
│       │   ├── _layout.tsx
│       │   └── index.tsx
│       └── src/
│           ├── i18n/
│           │   ├── index.ts
│           │   ├── es-AR.json
│           │   └── en.json
│           └── components/ui/__tests__/
│               └── smoke.test.tsx
│
├── scripts/
│   ├── ops/
│   │   ├── start-dev.sh
│   │   ├── stop-dev.sh
│   │   ├── logs.sh
│   │   └── health-check.sh
│   ├── setup/
│   │   ├── install-deps.sh
│   │   ├── setup-env.sh
│   │   └── setup-emulators.sh
│   └── demo/
│       ├── seed-demo-project.sh
│       ├── demo-whatsapp.sh
│       └── run-demo.sh
│
└── docs/
    ├── overview.md
    ├── architecture.md
    ├── tutorial.md
    ├── setup.md
    └── adrs/
        ├── 001-react-native-expo.md
        ├── 002-gateway-as-orchestrator.md
        ├── 003-opencode-sdk-reuse.md
        ├── 004-sse-vs-websocket.md
        ├── 005-multi-server-management.md
        ├── 006-i18n-es-ar-first.md
        ├── 007-discovery-mdns-qr.md
        ├── 008-browser-control-pattern.md
        ├── 009-messaging-bridge-pattern.md
        ├── 010-skill-plugin-management.md
        ├── 011-workspace-abstraction.md
        ├── 012-sandbox-mode.md
        └── 013-hot-reload-pattern.md
```

---

### Task 1: Root Monorepo Foundation

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `.npmrc`
- Create: `.gitignore`

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "@gaucho/monorepo",
  "private": true,
  "packageManager": "pnpm@9.15.4",
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "clean": "turbo clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.8.0",
    "typescript": "~5.7.0"
  }
}
```

- [ ] **Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

- [ ] **Step 3: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".expo/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true,
      "interactive": true
    }
  }
}
```

- [ ] **Step 4: Create .npmrc**

```ini
node-linker=hoisted
strict-peer-dependencies=false
save-workspace-protocol=rolling
link-workspace-packages=false
```

- [ ] **Step 5: Create .gitignore**

```
# Dependencies
node_modules/

# Build
dist/
build/
.turbo/
*.tsbuildinfo

# Expo
.expo/
ios/
android/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
coverage/

# Demo
demo-project/
```

- [ ] **Step 6: Install root dependencies**

Run: `corepack enable && pnpm install`

Expected: `node_modules/` created, `pnpm-lock.yaml` generated, turbo and typescript installed.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-workspace.yaml turbo.json .npmrc .gitignore pnpm-lock.yaml
git commit -m "init(monorepo): scaffold Turborepo root with pnpm workspaces

> foundation for mobile + gateway + shared packages"
```

---

### Task 2: TypeScript Config Package

**Files:**
- Create: `packages/typescript-config/package.json`
- Create: `packages/typescript-config/base.json`
- Create: `packages/typescript-config/node.json`
- Create: `packages/typescript-config/expo.json`
- Create: `packages/typescript-config/library.json`

- [ ] **Step 1: Create the typescript-config package.json**

```json
{
  "name": "@gaucho/typescript-config",
  "private": true,
  "version": "0.0.0",
  "files": ["*.json"]
}
```

- [ ] **Step 2: Create base.json (shared strict settings)**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "esModuleInterop": true,
    "skipLibCheck": true,
    "target": "es2022",
    "allowJs": true,
    "resolveJsonModule": true,
    "moduleDetection": "force",
    "isolatedModules": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

- [ ] **Step 3: Create node.json (gateway apps)**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 4: Create expo.json (mobile app)**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  }
}
```

- [ ] **Step 5: Create library.json (shared packages)**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 6: Install workspace packages**

Run: `pnpm install`

Expected: pnpm recognizes @gaucho/typescript-config as a workspace package.

- [ ] **Step 7: Commit**

```bash
git add packages/typescript-config/ pnpm-lock.yaml
git commit -m "init(typescript): add shared tsconfig base configs

> strict TypeScript bases for node, expo, and library packages"
```

---

### Task 3: Shared Types Package

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/types/session.ts`
- Create: `packages/shared/src/types/server.ts`
- Create: `packages/shared/src/types/events.ts`
- Create: `packages/shared/src/types/workspace.ts`
- Create: `packages/shared/src/types/permission.ts`
- Create: `packages/shared/src/types/template.ts`
- Create: `packages/shared/src/types/gateway.ts`
- Create: `packages/shared/src/types/browser.ts`
- Create: `packages/shared/src/types/messaging.ts`
- Create: `packages/shared/src/types/skill.ts`
- Create: `packages/shared/src/constants/api-routes.ts`
- Create: `packages/shared/src/constants/event-types.ts`

- [ ] **Step 1: Create shared package.json**

```json
{
  "name": "@gaucho/shared",
  "version": "0.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "lint": "echo 'no lint config yet'"
  },
  "devDependencies": {
    "@gaucho/typescript-config": "workspace:*",
    "typescript": "~5.7.0"
  }
}
```

- [ ] **Step 2: Create shared tsconfig.json**

```json
{
  "extends": "@gaucho/typescript-config/library.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create type files**

`packages/shared/src/types/session.ts`:
```typescript
export interface Session {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export type SessionStatus = 'idle' | 'running' | 'error';
```

`packages/shared/src/types/server.ts`:
```typescript
export interface ServerConnection {
  id: string;
  name: string;
  url: string;
  status: ServerStatus;
  lastSeen: string | null;
}

export type ServerStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface AuthToken {
  token: string;
  expiresAt: string;
}
```

`packages/shared/src/types/events.ts`:
```typescript
export interface SSEEvent<T = unknown> {
  type: string;
  data: T;
  id?: string;
  retry?: number;
}

export interface ExecutionStep {
  id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
}

export interface AgentTodo {
  id: string;
  content: string;
  completed: boolean;
}
```

`packages/shared/src/types/workspace.ts`:
```typescript
export interface Workspace {
  id: string;
  name: string;
  path: string;
  isActive: boolean;
}
```

`packages/shared/src/types/permission.ts`:
```typescript
export interface PermissionRequest {
  id: string;
  sessionId: string;
  tool: string;
  args: Record<string, unknown>;
  timestamp: string;
}

export type PermissionResponse = 'allow_once' | 'always' | 'deny';
```

`packages/shared/src/types/template.ts`:
```typescript
export interface Template {
  id: string;
  name: string;
  description: string;
  prompt: string;
  tags: string[];
  createdAt: string;
}
```

`packages/shared/src/types/gateway.ts`:
```typescript
export interface GatewayHealth {
  status: 'ok' | 'degraded' | 'error';
  opencode: 'connected' | 'disconnected';
  timestamp: string;
}

export interface GatewayConfig {
  port: number;
  opencodeHost: string;
  opencodePort: number;
}
```

`packages/shared/src/types/browser.ts`:
```typescript
export interface BrowserStatus {
  connected: boolean;
  currentUrl: string | null;
  tabCount: number;
}

export interface BrowserAction {
  id: string;
  type: 'navigate' | 'click' | 'type' | 'screenshot';
  args: Record<string, unknown>;
  status: 'pending' | 'approved' | 'denied' | 'completed';
}
```

`packages/shared/src/types/messaging.ts`:
```typescript
export type MessagingChannel = 'whatsapp' | 'telegram';

export interface MessagingStatus {
  channel: MessagingChannel;
  connected: boolean;
  pairingRequired: boolean;
}

export interface MessagingConversation {
  id: string;
  channel: MessagingChannel;
  peerId: string;
  peerName: string;
  workspaceId: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
}
```

`packages/shared/src/types/skill.ts`:
```typescript
export interface Skill {
  name: string;
  description: string;
  path: string;
  enabled: boolean;
}

export interface Plugin {
  name: string;
  version: string;
  enabled: boolean;
  config: Record<string, unknown>;
}
```

- [ ] **Step 4: Create constants**

`packages/shared/src/constants/api-routes.ts`:
```typescript
export const API_ROUTES = {
  // OpenCode endpoints
  HEALTH: '/global/health',
  EVENTS: '/global/event',
  SESSIONS: '/session',
  SESSION: (id: string) => `/session/${id}` as const,
  MESSAGES: (sessionId: string) => `/session/${sessionId}/message` as const,
  CONFIG: '/config',
  PROVIDERS: '/provider',
  CONFIG_PROVIDERS: '/config/providers',
  PROJECT: '/project',
  PROJECT_CURRENT: '/project/current',
  INSTANCE_DISPOSE: '/instance/dispose',

  // Gateway endpoints
  GATEWAY_HEALTH: '/health',
  GATEWAY_AUTH: '/auth/login',
  GATEWAY_DISCOVERY: '/discovery/info',
  GATEWAY_PUSH: '/push/subscribe',
  GATEWAY_TEMPLATES: '/templates',
  GATEWAY_BROWSER: '/browser',
  GATEWAY_MESSAGING: '/messaging',
  GATEWAY_SKILLS: '/skills',
  GATEWAY_WORKSPACES: '/workspaces',
  GATEWAY_CONFIG: '/gateway/config',
  GATEWAY_LOGS: '/logs',
  GATEWAY_RELOAD: '/reload',
} as const;
```

`packages/shared/src/constants/event-types.ts`:
```typescript
export const EVENT_TYPES = {
  SESSION_CREATED: 'session.created',
  SESSION_UPDATED: 'session.updated',
  SESSION_DELETED: 'session.deleted',
  MESSAGE_CREATED: 'message.created',
  MESSAGE_UPDATED: 'message.updated',
  MESSAGE_COMPLETED: 'message.completed',
  TOOL_CALL: 'tool.call',
  TOOL_RESULT: 'tool.result',
  PERMISSION_REQUESTED: 'permission.requested',
  PERMISSION_RESPONDED: 'permission.responded',
  AGENT_TODO_CREATED: 'agent.todo.created',
  AGENT_TODO_UPDATED: 'agent.todo.updated',
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];
```

- [ ] **Step 5: Create barrel export**

`packages/shared/src/index.ts`:
```typescript
// Types
export type { Session, Message, SessionStatus } from './types/session';
export type { ServerConnection, ServerStatus, AuthToken } from './types/server';
export type { SSEEvent, ExecutionStep, AgentTodo } from './types/events';
export type { Workspace } from './types/workspace';
export type { PermissionRequest, PermissionResponse } from './types/permission';
export type { Template } from './types/template';
export type { GatewayHealth, GatewayConfig } from './types/gateway';
export type { BrowserStatus, BrowserAction } from './types/browser';
export type {
  MessagingChannel,
  MessagingStatus,
  MessagingConversation,
} from './types/messaging';
export type { Skill, Plugin } from './types/skill';

// Constants
export { API_ROUTES } from './constants/api-routes';
export { EVENT_TYPES } from './constants/event-types';
export type { EventType } from './constants/event-types';
```

- [ ] **Step 6: Install and build**

Run: `pnpm install && pnpm turbo build --filter=@gaucho/shared`

Expected: `packages/shared/dist/` created with compiled JS + declaration files.

- [ ] **Step 7: Commit**

```bash
git add packages/shared/ pnpm-lock.yaml
git commit -m "init(shared): add shared types and constants package

> type definitions for session, server, events, workspace, permissions, templates, browser, messaging, skills + OpenCode/gateway API route constants"
```

---

### Task 4: Gateway Scaffold

**Files:**
- Create: `apps/gateway/package.json`
- Create: `apps/gateway/tsconfig.json`
- Create: `apps/gateway/vitest.config.ts`
- Create: `apps/gateway/Dockerfile`
- Create: `apps/gateway/src/app.ts`
- Create: `apps/gateway/src/index.ts`

- [ ] **Step 1: Create gateway package.json**

```json
{
  "name": "@gaucho/gateway",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "echo 'no lint config yet'",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@gaucho/shared": "workspace:*",
    "hono": "^4.12.0",
    "@hono/node-server": "^1.13.0"
  },
  "devDependencies": {
    "@gaucho/typescript-config": "workspace:*",
    "@types/node": "^22.0.0",
    "tsx": "^4.0.0",
    "typescript": "~5.7.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Create gateway tsconfig.json**

```json
{
  "extends": "@gaucho/typescript-config/node.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
  },
});
```

- [ ] **Step 4: Create Dockerfile**

```dockerfile
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
```

- [ ] **Step 5: Create src/app.ts (Hono app, exported for testing)**

```typescript
import { Hono } from 'hono';

const app = new Hono();

app.get('/health', (c) =>
  c.json({ status: 'ok', timestamp: new Date().toISOString() }),
);

export default app;
```

- [ ] **Step 6: Create src/index.ts (server entry)**

```typescript
import { serve } from '@hono/node-server';
import app from './app';

const port = parseInt(process.env.PORT ?? '3000', 10);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Gateway listening on port ${info.port}`);
});
```

- [ ] **Step 7: Install, build, and verify**

Run: `pnpm install && pnpm turbo build --filter=@gaucho/gateway`

Expected: `apps/gateway/dist/` created with compiled JS.

- [ ] **Step 8: Commit**

```bash
git add apps/gateway/ pnpm-lock.yaml
git commit -m "init(gateway): scaffold Hono gateway with health endpoint

> Node.js + Hono HTTP server, multi-stage Dockerfile, Vitest config"
```

---

### Task 5: Mobile App Scaffold

**Files:**
- Create: `apps/mobile/package.json`
- Create: `apps/mobile/tsconfig.json`
- Create: `apps/mobile/app.json`
- Create: `apps/mobile/metro.config.js`
- Create: `apps/mobile/babel.config.js`
- Create: `apps/mobile/tailwind.config.js`
- Create: `apps/mobile/global.css`
- Create: `apps/mobile/app/_layout.tsx`
- Create: `apps/mobile/app/index.tsx`
- Create: `apps/mobile/src/i18n/index.ts`
- Create: `apps/mobile/src/i18n/es-AR.json`
- Create: `apps/mobile/src/i18n/en.json`

- [ ] **Step 1: Create mobile package.json**

```json
{
  "name": "@gaucho/mobile",
  "version": "0.0.0",
  "private": true,
  "main": "expo-router/entry",
  "scripts": {
    "dev": "expo start",
    "build": "expo export",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "echo 'no lint config yet'",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@gaucho/shared": "workspace:*",
    "expo": "~55.0.0",
    "expo-constants": "~17.1.0",
    "expo-linking": "~7.1.0",
    "expo-router": "~55.0.0",
    "expo-status-bar": "~2.2.0",
    "i18next": "^24.0.0",
    "nativewind": "^4.2.0",
    "react": "18.3.1",
    "react-i18next": "^15.0.0",
    "react-native": "0.76.9",
    "react-native-safe-area-context": "~5.4.0",
    "react-native-screens": "~4.11.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.25.0",
    "@gaucho/typescript-config": "workspace:*",
    "@testing-library/react-native": "^13.0.0",
    "@types/react": "~18.3.0",
    "jest": "^29.0.0",
    "jest-expo": "~55.0.0",
    "tailwindcss": "^3.4.0",
    "typescript": "~5.7.0"
  }
}
```

**Note:** After creating this file, run `npx expo install --check` from `apps/mobile/` to verify version compatibility. If expo reports mismatches, run `npx expo install --fix` to auto-correct.

- [ ] **Step 2: Create mobile tsconfig.json**

```json
{
  "extends": "@gaucho/typescript-config/expo.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create app.json**

```json
{
  "expo": {
    "name": "GauchoCowork",
    "slug": "gaucho-cowork",
    "version": "0.1.0",
    "orientation": "portrait",
    "scheme": "gauchocowork",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.gaucho.cowork"
    },
    "android": {
      "package": "com.gaucho.cowork"
    },
    "web": {
      "bundler": "metro",
      "output": "static"
    },
    "plugins": ["expo-router"]
  }
}
```

- [ ] **Step 4: Create metro.config.js (monorepo + NativeWind)**

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = withNativeWind(config, { input: './global.css' });
```

- [ ] **Step 5: Create babel.config.js**

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
```

- [ ] **Step 6: Create tailwind.config.js + global.css**

`apps/mobile/tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: { extend: {} },
  plugins: [],
};
```

`apps/mobile/global.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 7: Create i18n config and translation files**

`apps/mobile/src/i18n/index.ts`:
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import esAR from './es-AR.json';
import en from './en.json';

i18n.use(initReactI18next).init({
  resources: {
    'es-AR': { translation: esAR },
    en: { translation: en },
  },
  lng: 'es-AR',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
```

`apps/mobile/src/i18n/es-AR.json`:
```json
{
  "common": {
    "loading": "Cargando...",
    "error": "Error",
    "retry": "Reintentar",
    "cancel": "Cancelar",
    "save": "Guardar",
    "delete": "Eliminar"
  },
  "app": {
    "name": "GauchoCowork"
  }
}
```

`apps/mobile/src/i18n/en.json`:
```json
{
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "retry": "Retry",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete"
  },
  "app": {
    "name": "GauchoCowork"
  }
}
```

- [ ] **Step 8: Create Expo Router screens**

`apps/mobile/app/_layout.tsx`:
```tsx
import '../global.css';
import '../src/i18n';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

`apps/mobile/app/index.tsx`:
```tsx
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-gray-900">{t('app.name')}</Text>
    </View>
  );
}
```

- [ ] **Step 9: Install dependencies**

Run: `pnpm install`

Expected: All mobile dependencies installed. If expo reports version mismatches, run `cd apps/mobile && npx expo install --fix` then `pnpm install` again from root.

- [ ] **Step 10: Commit**

```bash
git add apps/mobile/ pnpm-lock.yaml
git commit -m "init(mobile): scaffold Expo app with Router, NativeWind, i18n

> Expo SDK 55, es-AR default language, NativeWind v4 styling, monorepo metro config"
```

---

### Task 6: Test Infrastructure

**Files:**
- Create: `apps/mobile/jest.config.ts`
- Create: `apps/mobile/src/components/ui/__tests__/smoke.test.tsx`
- Create: `apps/gateway/src/__tests__/health.test.ts`

- [ ] **Step 1: Create Jest config for mobile**

`apps/mobile/jest.config.ts`:
```typescript
import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|native-base|react-native-svg|nativewind)',
  ],
};

export default config;
```

- [ ] **Step 2: Create mobile smoke test**

`apps/mobile/src/components/ui/__tests__/smoke.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

describe('Smoke test', () => {
  it('renders text', () => {
    render(<Text>GauchoCowork</Text>);
    expect(screen.getByText('GauchoCowork')).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run mobile tests**

Run: `cd apps/mobile && npx jest --no-cache`

Expected: 1 test passed.

- [ ] **Step 4: Create gateway health test**

`apps/gateway/src/__tests__/health.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import app from '../app';

describe('GET /health', () => {
  it('returns status ok', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
  });
});
```

- [ ] **Step 5: Run gateway tests**

Run: `cd apps/gateway && npx vitest run`

Expected: 1 test passed.

- [ ] **Step 6: Run all tests from root**

Run: `pnpm turbo test`

Expected: Both mobile and gateway tests pass.

- [ ] **Step 7: Commit**

```bash
git add apps/mobile/jest.config.ts apps/mobile/src/components/ui/__tests__/ apps/gateway/src/__tests__/
git commit -m "init(testing): configure Jest + Vitest with smoke tests

> mobile: Jest + RNTL smoke test, gateway: Vitest + Hono request test"
```

---

### Task 7: Linting & Formatting

**Files:**
- Create: `eslint.config.mjs`
- Create: `.prettierrc`

- [ ] **Step 1: Install lint/format dependencies**

Run: `pnpm add -D -w eslint @eslint/js typescript-eslint prettier eslint-config-prettier`

- [ ] **Step 2: Create eslint.config.mjs**

```javascript
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.expo/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/*.js',
      '**/*.mjs',
    ],
  },
);
```

- [ ] **Step 3: Create .prettierrc**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

- [ ] **Step 4: Update root package.json scripts**

Add to `scripts` in root `package.json`:
```json
"lint:root": "eslint .",
"format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
"format:check": "prettier --check \"**/*.{ts,tsx,json,md}\""
```

- [ ] **Step 5: Update sub-package lint scripts**

In `apps/gateway/package.json`, change `"lint"` to:
```json
"lint": "eslint src/"
```

In `apps/mobile/package.json`, change `"lint"` to:
```json
"lint": "eslint app/ src/"
```

In `packages/shared/package.json`, change `"lint"` to:
```json
"lint": "eslint src/"
```

- [ ] **Step 6: Verify lint passes**

Run: `pnpm turbo lint`

Expected: No errors (may show warnings on first run — fix any).

- [ ] **Step 7: Commit**

```bash
git add eslint.config.mjs .prettierrc package.json apps/gateway/package.json apps/mobile/package.json packages/shared/package.json pnpm-lock.yaml
git commit -m "init(lint): configure ESLint 9 flat config + Prettier

> strict TypeScript rules, consistent formatting across monorepo"
```

---

### Task 8: Docker Compose & Environment

**Files:**
- Create: `docker-compose.yml`
- Create: `docker-compose.test.yml`
- Create: `.env.example`

- [ ] **Step 1: Create docker-compose.yml**

```yaml
services:
  gateway:
    build:
      context: .
      dockerfile: apps/gateway/Dockerfile
    ports:
      - '3000:3000'
    environment:
      - PORT=3000
      - OPENCODE_HOST=opencode
      - OPENCODE_PORT=4096
      - JWT_SECRET=${JWT_SECRET:-dev-secret}
      - GATEWAY_PASSWORD=${GATEWAY_PASSWORD:-gaucho}
    depends_on:
      opencode:
        condition: service_healthy
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 10s
      timeout: 5s
      retries: 5

  opencode:
    image: golang:1.22-alpine
    working_dir: /workspace
    command: >
      sh -c "apk add --no-cache curl git &&
             curl -fsSL https://opencode.ai/install | sh &&
             opencode serve --hostname 0.0.0.0 --port 4096 --cors http://localhost:3000"
    ports:
      - '4096:4096'
    volumes:
      - ./demo-project:/workspace
    environment:
      - OPENCODE_SERVER_PASSWORD=${OPENCODE_SERVER_PASSWORD:-opencode}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:4096/global/health']
      interval: 10s
      timeout: 5s
      retries: 10
```

- [ ] **Step 2: Create docker-compose.test.yml**

```yaml
services:
  opencode:
    image: golang:1.22-alpine
    working_dir: /workspace
    command: >
      sh -c "apk add --no-cache curl git &&
             curl -fsSL https://opencode.ai/install | sh &&
             opencode serve --hostname 0.0.0.0 --port 4096 --cors '*'"
    ports:
      - '4096:4096'
    volumes:
      - ./demo-project:/workspace
    environment:
      - OPENCODE_SERVER_PASSWORD=${OPENCODE_SERVER_PASSWORD:-opencode}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:4096/global/health']
      interval: 5s
      timeout: 5s
      retries: 20
```

- [ ] **Step 3: Create .env.example**

```bash
# Gateway
PORT=3000
JWT_SECRET=change-me-in-production
GATEWAY_PASSWORD=gaucho

# OpenCode
OPENCODE_HOST=localhost
OPENCODE_PORT=4096
OPENCODE_SERVER_PASSWORD=opencode

# AI Providers (configure at least one)
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# Push Notifications (optional)
FCM_SERVICE_ACCOUNT=

# Messaging (optional)
TELEGRAM_BOT_TOKEN=
```

- [ ] **Step 4: Commit**

```bash
git add docker-compose.yml docker-compose.test.yml .env.example
git commit -m "init(docker): add Docker Compose for dev and test

> gateway + opencode services, health checks, environment template"
```

---

### Task 9: Makefile

**Files:**
- Create: `Makefile`

- [ ] **Step 1: Create Makefile**

**IMPORTANT: All indented lines in Makefile recipes MUST use real tab characters, not spaces.**

```makefile
.PHONY: help setup dev test test-unit test-integration test-e2e \
        lint typecheck build clean \
        docker-up docker-down docker-logs \
        build-mobile-ios build-mobile-android build-gateway demo

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-25s\033[0m %s\n", $$1, $$2}'

setup: ## Install deps + build shared
	corepack enable
	pnpm install
	pnpm turbo build --filter=@gaucho/shared
	@echo "Setup complete. Run 'make dev' to start."

dev: ## Gateway (Docker) + Expo dev server
	@echo "Starting dev environment..."
	pnpm turbo dev

test: test-unit ## Run all in-memory tests

test-unit: ## Jest (mobile) + Vitest (gateway)
	pnpm turbo test

test-integration: ## Integration tests (requires Docker)
	docker compose -f docker-compose.test.yml up -d
	@echo "Waiting for OpenCode to be healthy..."
	@sleep 15
	pnpm turbo test:integration || true
	docker compose -f docker-compose.test.yml down

test-e2e: ## Maestro E2E tests
	cd apps/mobile && maestro test e2e/

lint: ## ESLint + Prettier check
	pnpm turbo lint
	pnpm format:check

typecheck: ## tsc --noEmit across all packages
	pnpm turbo typecheck

build: ## Build all packages
	pnpm turbo build

clean: ## Remove node_modules, .turbo, dist
	pnpm turbo clean
	rm -rf node_modules apps/*/node_modules packages/*/node_modules
	rm -rf apps/*/dist packages/*/dist
	rm -rf .turbo apps/*/.turbo packages/*/.turbo

docker-up: ## Start gateway + opencode
	docker compose up -d

docker-down: ## Stop Docker services
	docker compose down

docker-logs: ## Tail Docker logs
	docker compose logs -f

build-mobile-ios: ## EAS Build iOS
	cd apps/mobile && eas build --platform ios

build-mobile-android: ## EAS Build Android
	cd apps/mobile && eas build --platform android

build-gateway: ## Docker build gateway image
	docker build -f apps/gateway/Dockerfile -t gaucho-gateway .

demo: docker-up ## Full demo: Docker + seed + open
	@./scripts/demo/seed-demo-project.sh
	@echo ""
	@echo "Gateway:  http://localhost:3000"
	@echo "OpenCode: http://localhost:4096"
	@echo ""
	@echo "Run 'make docker-logs' to see logs."
```

- [ ] **Step 2: Verify help target works**

Run: `make help`

Expected: Formatted list of all targets with descriptions.

- [ ] **Step 3: Commit**

```bash
git add Makefile
git commit -m "init(make): add Makefile with all dev targets

> setup, dev, test, lint, typecheck, build, docker, demo targets"
```

---

### Task 10: Operations & Setup Scripts

**Files:**
- Create: `scripts/ops/start-dev.sh`
- Create: `scripts/ops/stop-dev.sh`
- Create: `scripts/ops/logs.sh`
- Create: `scripts/ops/health-check.sh`
- Create: `scripts/setup/install-deps.sh`
- Create: `scripts/setup/setup-env.sh`
- Create: `scripts/setup/setup-emulators.sh`
- Create: `scripts/demo/seed-demo-project.sh`
- Create: `scripts/demo/demo-whatsapp.sh`
- Create: `scripts/demo/run-demo.sh`

- [ ] **Step 1: Create ops scripts**

`scripts/ops/start-dev.sh`:
```bash
#!/bin/bash
set -euo pipefail
echo "Starting GauchoCowork dev environment..."
docker compose up -d
echo "Gateway:  http://localhost:3000"
echo "OpenCode: http://localhost:4096"
echo ""
echo "Starting Expo dev server..."
cd apps/mobile && npx expo start
```

`scripts/ops/stop-dev.sh`:
```bash
#!/bin/bash
set -euo pipefail
echo "Stopping GauchoCowork dev environment..."
docker compose down
echo "Done."
```

`scripts/ops/logs.sh`:
```bash
#!/bin/bash
set -euo pipefail
docker compose logs -f "${@}"
```

`scripts/ops/health-check.sh`:
```bash
#!/bin/bash
set -euo pipefail
echo "Checking gateway..."
curl -sf http://localhost:3000/health && echo " OK" || echo " DOWN"
echo "Checking OpenCode..."
curl -sf http://localhost:4096/global/health && echo " OK" || echo " DOWN"
```

- [ ] **Step 2: Create setup scripts**

`scripts/setup/install-deps.sh`:
```bash
#!/bin/bash
set -euo pipefail
echo "Installing dependencies..."
corepack enable
pnpm install
echo "Building shared package..."
pnpm turbo build --filter=@gaucho/shared
echo "Setup complete!"
```

`scripts/setup/setup-env.sh`:
```bash
#!/bin/bash
set -euo pipefail
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
  echo "Edit .env with your configuration."
else
  echo ".env already exists, skipping."
fi
```

`scripts/setup/setup-emulators.sh`:
```bash
#!/bin/bash
set -euo pipefail
echo "Checking development environment..."

if command -v xcrun &> /dev/null; then
  echo "Xcode CLI tools available"
  xcrun simctl list devices available 2>/dev/null | head -5
else
  echo "Xcode CLI tools not found (needed for iOS simulator)"
fi

if command -v adb &> /dev/null; then
  echo "Android SDK tools available"
else
  echo "Android SDK tools not found (needed for Android emulator)"
fi
```

- [ ] **Step 3: Create demo scripts**

`scripts/demo/seed-demo-project.sh`:
```bash
#!/bin/bash
set -euo pipefail
DEMO_DIR="demo-project"
mkdir -p "$DEMO_DIR"
cat > "$DEMO_DIR/README.md" << 'HEREDOC'
# Demo Project

Demo workspace for GauchoCowork development.
HEREDOC
echo "Demo project seeded at $DEMO_DIR"
```

`scripts/demo/demo-whatsapp.sh`:
```bash
#!/bin/bash
set -euo pipefail
echo "WhatsApp bridge demo"
echo "Requires Phase 8 implementation."
echo "Will demonstrate WhatsApp <-> OpenCode messaging."
```

`scripts/demo/run-demo.sh`:
```bash
#!/bin/bash
set -euo pipefail
echo "=== GauchoCowork Full Demo ==="

./scripts/demo/seed-demo-project.sh
docker compose up -d

echo "Waiting for services..."
sleep 10

./scripts/ops/health-check.sh

echo ""
echo "Gateway:  http://localhost:3000"
echo "OpenCode: http://localhost:4096"
echo "Press Ctrl+C to stop."
docker compose logs -f
```

- [ ] **Step 4: Make all scripts executable**

Run: `chmod +x scripts/**/*.sh`

- [ ] **Step 5: Commit**

```bash
git add scripts/
git commit -m "init(scripts): add ops, setup, and demo scripts

> start/stop dev, health checks, environment setup, demo seeding"
```

---

### Task 11: Documentation & ADRs

**Files:**
- Create: `docs/overview.md`
- Create: `docs/architecture.md`
- Create: `docs/tutorial.md`
- Create: `docs/setup.md`
- Create: `docs/adrs/001-react-native-expo.md` through `docs/adrs/013-hot-reload-pattern.md`
- Create: `README.md`

- [ ] **Step 1: Create core docs**

`docs/overview.md`:
```markdown
# GauchoCowork Overview

Mobile-first OpenCode wrapper for the Argentine market. Connect your phone to a self-hosted OpenCode instance for AI-powered coding assistance.

## Key Features

- Multi-server management with mDNS/QR discovery
- Real-time SSE streaming with execution timeline
- Permission handling with push notifications
- Browser control (remote screenshots + approve/deny)
- Messaging bridges (WhatsApp/Telegram)
- Skill/plugin management from mobile
- Workspace switching
- Templates (offline + sync)
- i18n (es-AR default, en fallback)
```

`docs/architecture.md`:
```markdown
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
```

`docs/tutorial.md`:
```markdown
# GauchoCowork Tutorial

## Prerequisites

- Node.js 20+, pnpm 9+, Docker, Expo Go on phone

## Quick Start

1. `git clone <repo> && cd gaucho-cowork`
2. `make setup`
3. `cp .env.example .env` (edit with your API keys)
4. `make dev`
5. Scan QR code with Expo Go
```

`docs/setup.md`:
```markdown
# Development Setup

## Requirements

- Node.js 20 LTS
- pnpm 9.x (`corepack enable`)
- Docker & Docker Compose v2
- Xcode (iOS) / Android Studio (Android)

## Install

```bash
corepack enable
make setup
cp .env.example .env
make dev
```

## Commands

Run `make help` for all targets.
```

- [ ] **Step 2: Create ADRs 001-004**

`docs/adrs/001-react-native-expo.md`:
```markdown
# ADR-001: React Native with Expo

## Status
Accepted

## Context
Need cross-platform mobile that can use @opencode-ai/sdk TypeScript package directly, with strong SSE support and a large Argentine developer pool.

## Decision
React Native with Expo SDK 55+, Expo Router for navigation, NativeWind for styling.

## Alternatives Considered
- **Flutter**: Requires rewriting OpenCode SDK in Dart
- **Kotlin KMP**: Niche talent pool in Argentina
- **Tauri Mobile**: Too immature for production

## Consequences
- Direct @opencode-ai/sdk import
- Large React Native developer pool in Argentina
- OTA updates via EAS Update
- Expo managed workflow limits some native module access
```

`docs/adrs/002-gateway-as-orchestrator.md`:
```markdown
# ADR-002: Gateway as Orchestrator

## Status
Accepted

## Context
Mobile cannot run OpenCode directly. Need an intermediary that spawns, monitors, authenticates, and extends OpenCode with mobile-specific features.

## Decision
Node.js/Hono gateway that spawns `opencode serve`, provides JWT auth, reverse proxies API calls, and relays push notifications.

## Alternatives Considered
- **Direct mobile-to-OpenCode**: No auth layer, no push relay
- **Nginx reverse proxy**: No application logic for push, messaging, skills

## Consequences
- Single entry point for mobile
- JWT auth layer for security
- Push notification relay for background alerts
- Extensible for messaging bridges, browser control, skill management
```

`docs/adrs/003-opencode-sdk-reuse.md`:
```markdown
# ADR-003: OpenCode SDK Reuse

## Status
Accepted

## Context
Need typed HTTP client for OpenCode API from TypeScript.

## Decision
Use `@opencode-ai/sdk` package. Re-export from `@gaucho/shared`.

## Alternatives Considered
- **Hand-written HTTP client**: Maintenance burden, drift risk
- **OpenAPI codegen**: Extra build step, less community support

## Consequences
- Maintained by OpenCode team, stays in sync
- Typed API calls out of the box
- Dependency on external package release cycle
```

`docs/adrs/004-sse-vs-websocket.md`:
```markdown
# ADR-004: SSE vs WebSocket

## Status
Accepted

## Context
OpenCode streams events via SSE at `/global/event`. Need real-time event streaming on mobile.

## Decision
Use SSE (Server-Sent Events) — matches OpenCode's native protocol.

## Alternatives Considered
- **WebSocket**: Bidirectional but OpenCode doesn't offer WS endpoint
- **Polling**: Wasteful, high latency

## Consequences
- Zero protocol translation needed
- Reconnect logic required (exponential backoff)
- React Native needs `react-native-sse` or fetch-based parser
- AppState-aware connect/disconnect for battery efficiency
```

- [ ] **Step 3: Create ADRs 005-009**

`docs/adrs/005-multi-server-management.md`:
```markdown
# ADR-005: Multi-Server Management

## Status
Accepted

## Context
Power users run multiple OpenCode instances (work, personal, client projects).

## Decision
Mobile app supports multiple server connections with active server switching.

## Alternatives Considered
- **Single server only**: Too limiting for power users

## Consequences
- Server store manages multiple connections
- Active server concept for routing API calls
- Discovery (mDNS, QR, URL) for easy server addition
```

`docs/adrs/006-i18n-es-ar-first.md`:
```markdown
# ADR-006: i18n es-AR First

## Status
Accepted

## Context
Targeting Argentine market first. Need localized UI.

## Decision
react-i18next with es-AR (Argentine Spanish) as default, en (English) as fallback.

## Alternatives Considered
- **English only**: Misses target market
- **Hardcoded strings**: Impossible to localize later

## Consequences
- All UI strings via `t()` function
- Translation files maintained per language
- es-AR.json is the source of truth
```

`docs/adrs/007-discovery-mdns-qr.md`:
```markdown
# ADR-007: Server Discovery via mDNS and QR

## Status
Accepted

## Context
Users need to find their gateway from mobile without typing IP addresses.

## Decision
Three discovery methods: mDNS (`_gaucho._tcp`), QR code scanning, manual URL entry.

## Alternatives Considered
- **Manual URL only**: Poor UX for non-technical users
- **Cloud discovery**: Violates "users own their data" principle

## Consequences
- Zero-config local network discovery
- QR code for remote/complex setups
- Deep link support: `gauchocowork://connect?url=...`
```

`docs/adrs/008-browser-control-pattern.md`:
```markdown
# ADR-008: Browser Control Pattern

## Status
Accepted

## Context
OpenWork uses opencode-browser plugin for browser automation. Mobile users need to monitor and approve browser actions.

## Decision
Gateway manages browser plugin lifecycle. Mobile shows live screenshots and approve/deny for browser actions.

## Alternatives Considered
- **No browser support**: Misses key OpenCode capability
- **Web-only browser view**: Not mobile-native

## Consequences
- Requires opencode-browser plugin installed on user's OpenCode
- Screenshot streaming (SSE or polling)
- Browser permission events routed to mobile push
```

`docs/adrs/009-messaging-bridge-pattern.md`:
```markdown
# ADR-009: Messaging Bridge Pattern

## Status
Accepted

## Context
OpenWork bridges WhatsApp/Telegram into OpenCode sessions via CLI setup. We want mobile-native configuration.

## Decision
Gateway embeds Baileys (WhatsApp) + Telegraf (Telegram). Users configure from mobile app.

## Alternatives Considered
- **External bot services**: Added cost, dependency
- **CLI-only setup**: Poor mobile UX

## Consequences
- QR pairing for WhatsApp from mobile
- Bot token config for Telegram from mobile
- Per-workspace message routing
- Message relay to/from OpenCode sessions
```

- [ ] **Step 4: Create ADRs 010-013**

`docs/adrs/010-skill-plugin-management.md`:
```markdown
# ADR-010: Skill & Plugin Management

## Status
Accepted

## Context
OpenCode supports extensible skills and plugins. Users need to manage them remotely.

## Decision
Mobile app provides skill store UI. Gateway reads/writes `.opencode/skills/` and `opencode.json`.

## Alternatives Considered
- **CLI-only management**: Not mobile-friendly
- **Web dashboard**: Extra deployment, not native

## Consequences
- Gateway skill installer (opkg + git clone)
- Config editing with validation
- Hot-reload after changes via POST /instance/dispose
```

`docs/adrs/011-workspace-abstraction.md`:
```markdown
# ADR-011: Workspace Abstraction

## Status
Accepted

## Context
Users work on multiple projects. Each project has its own OpenCode config.

## Decision
Workspace = project directory + OpenCode config bundle. Switchable from mobile.

## Alternatives Considered
- **Single workspace**: Too limiting
- **Server-managed only**: No mobile switching

## Consequences
- Workspace manager in gateway
- Workspace switcher UI in mobile
- Active workspace determines OpenCode project context
```

`docs/adrs/012-sandbox-mode.md`:
```markdown
# ADR-012: Sandbox Mode

## Status
Accepted

## Context
Agent code execution may need isolation for safety.

## Decision
Gateway supports Docker sandbox mode. OpenCode runs in a container with workspace mounted as volume.

## Alternatives Considered
- **No isolation**: Risk of unintended system changes
- **VM-based sandbox**: Too heavyweight

## Consequences
- Docker required for sandbox mode
- Workspace mounted as volume
- Toggleable from mobile settings
- Performance overhead from containerization
```

`docs/adrs/013-hot-reload-pattern.md`:
```markdown
# ADR-013: Hot Reload Pattern

## Status
Accepted

## Context
After config/skill/plugin changes, OpenCode needs to pick up new configuration.

## Decision
Gateway exposes `/reload` which calls OpenCode's `POST /instance/dispose`. Mobile triggers reload after config changes.

## Alternatives Considered
- **Full restart**: Disrupts all sessions
- **File watcher**: Complex, unreliable across Docker boundaries

## Consequences
- Active sessions may be briefly interrupted
- Mobile shows confirmation dialog before reload
- Reload triggered after: skill install/remove, plugin toggle, config edit
```

- [ ] **Step 5: Create README.md**

```markdown
# GauchoCowork

Mobile-first OpenCode wrapper for the Argentine market. Run AI-powered coding agents from your phone.

## Quick Start

```bash
make setup    # Install dependencies
make dev      # Start dev environment
make test     # Run tests
```

## Architecture

```
Mobile (Expo) --> Gateway (Hono) --> OpenCode (Go)
```

| Component | Tech | Path |
|-----------|------|------|
| Mobile | React Native, Expo 55, Expo Router, NativeWind, Zustand | `apps/mobile/` |
| Gateway | Node.js, Hono, JWT, SSE proxy | `apps/gateway/` |
| Shared | TypeScript types, @opencode-ai/sdk re-exports | `packages/shared/` |

## Development

| Command | Description |
|---------|-------------|
| `make setup` | Install deps + build shared |
| `make dev` | Start dev servers |
| `make test` | Run unit tests |
| `make lint` | ESLint + Prettier |
| `make typecheck` | TypeScript check |
| `make docker-up` | Start Docker services |
| `make docker-down` | Stop Docker services |
| `make demo` | Full demo environment |

## Project Structure

```
gaucho-cowork/
├── apps/
│   ├── mobile/        # React Native (Expo) mobile app
│   └── gateway/       # Node.js (Hono) gateway server
├── packages/
│   ├── shared/        # Shared types + SDK re-exports
│   └── typescript-config/  # Shared tsconfig bases
├── scripts/           # Dev scripts (ops, setup, demo)
└── docs/              # Documentation + ADRs
```

## Docs

- [Overview](docs/overview.md)
- [Architecture](docs/architecture.md)
- [Setup](docs/setup.md)
- [Tutorial](docs/tutorial.md)
- [ADRs](docs/adrs/)

## License

MIT
```

- [ ] **Step 6: Commit**

```bash
git add docs/ README.md
git commit -m "init(docs): add documentation, ADRs 001-013, and README

> architecture overview, setup guide, tutorial, 13 architectural decision records"
```

---

### Task 12: SDK Integration & Final Verification

**Files:**
- Modify: `packages/shared/package.json` (add @opencode-ai/sdk dependency)
- Modify: `packages/shared/src/index.ts` (add SDK re-exports)

- [ ] **Step 1: Add @opencode-ai/sdk to shared package**

Add to `packages/shared/package.json` dependencies:
```json
"dependencies": {
  "@opencode-ai/sdk": "^1.3.0"
}
```

- [ ] **Step 2: Add SDK re-exports to barrel**

Append to `packages/shared/src/index.ts`:
```typescript
// OpenCode SDK re-exports
export { createOpencodeClient } from '@opencode-ai/sdk';
```

**Note:** If `@opencode-ai/sdk` has different exports, check `node_modules/@opencode-ai/sdk/dist/index.d.ts` for available exports and adjust. The key export we need is the client factory function.

- [ ] **Step 3: Install and rebuild**

Run: `pnpm install && pnpm turbo build --filter=@gaucho/shared`

Expected: Shared package builds with SDK re-exports.

- [ ] **Step 4: Run full verification**

Run: `make setup && make test`

Expected:
- `make setup`: deps installed, shared package built
- `make test`: all tests pass (gateway health test + mobile smoke test)

- [ ] **Step 5: Verify typecheck**

Run: `make typecheck`

Expected: No TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add packages/shared/ pnpm-lock.yaml
git commit -m "init(sdk): integrate @opencode-ai/sdk in shared package

> SDK client re-exported from @gaucho/shared for mobile + gateway consumption"
```

---

## Parallel Execution Notes

Tasks that can run in parallel if using subagent-driven development:
- **Tasks 4 + 5**: Gateway and mobile scaffolds are independent (both depend on tasks 1-3)
- **Tasks 6 + 7**: Test infrastructure and lint config are independent
- **Tasks 9 + 10 + 11**: Makefile, scripts, and docs are independent

Sequential dependencies:
- Task 1 → 2 → 3 (root → tsconfig → shared)
- Tasks 4, 5 depend on 3
- Task 6 depends on 4 and 5
- Task 12 depends on all
