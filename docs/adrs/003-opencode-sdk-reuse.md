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
