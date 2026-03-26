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
