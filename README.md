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
