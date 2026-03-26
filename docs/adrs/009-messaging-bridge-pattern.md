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
