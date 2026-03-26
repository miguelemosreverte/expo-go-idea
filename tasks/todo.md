# Phase 0: Monorepo Scaffolding

Plan: [`docs/superpowers/plans/2026-03-26-phase-0-scaffolding.md`](../docs/superpowers/plans/2026-03-26-phase-0-scaffolding.md)

## Tasks

- [x] Task 1: Root Monorepo Foundation
- [x] Task 2: TypeScript Config Package
- [x] Task 3: Shared Types Package
- [x] Task 4: Gateway Scaffold
- [x] Task 5: Mobile App Scaffold
- [x] Task 6: Test Infrastructure
- [x] Task 7: Linting & Formatting
- [x] Task 8: Docker Compose & Environment
- [x] Task 9: Makefile
- [x] Task 10: Operations & Setup Scripts
- [x] Task 11: Documentation & ADRs
- [x] Task 12: SDK Integration & Final Verification

# Phase 1: Core Features

- [x] Task 1: Gateway Auth (JWT login endpoint)
- [x] Task 2: Gateway Session Routes (CRUD proxy to OpenCode)
- [x] Task 3: Gateway SSE Proxy (stream events from OpenCode)
- [x] Task 4: Gateway Permission Routes (approve/deny from mobile)
- [x] Task 5: Mobile Auth Screen (login + token storage)
- [x] Task 6: Mobile Session List Screen
- [x] Task 7: Mobile Chat Screen (send prompts, render timeline)
- [x] Task 8: Mobile Permission Modal

# Phase 2: End-to-End Wiring & Polish

- [x] Task 1: Mobile SSE streaming (live event timeline in chat)
- [x] Task 2: Mobile pull-to-refresh + loading states
- [x] Task 3: Gateway enhanced health (OpenCode connectivity check)
- [x] Task 4: Gateway error handling middleware
- [x] Task 5: Mobile server discovery screen (connect to gateway)
- [x] Task 6: Mobile execution timeline component
- [x] Task 7: Gateway workspace routes
- [x] Task 8: Mobile workspace switcher

# Phase 3: Advanced Features

- [x] Task 1: Gateway browser proxy routes (screenshots + approve/deny)
- [x] Task 2: Gateway messaging bridge routes (WhatsApp/Telegram)
- [x] Task 3: Gateway skill/plugin management routes
- [x] Task 4: Mobile browser control screen
- [x] Task 5: Mobile skill management screen
- [x] Task 6: Mobile settings screen (theme, language, notifications)
- [x] Task 7: Push notification relay (FCM via gateway)
- [x] Task 8: Mobile offline template support

# Phase 4: Production Hardening

- [x] Task 1: Gateway rate limiting + CORS
- [x] Task 2: Gateway request logging middleware
- [x] Task 3: Gateway OpenCode process management (spawn/restart)
- [x] Task 4: Mobile secure token storage (expo-secure-store)
- [x] Task 5: Mobile error boundary + crash reporting
- [x] Task 6: Docker production config
- [x] Task 7: CI/CD pipeline (GitHub Actions)
- [x] Task 8: Comprehensive integration tests
