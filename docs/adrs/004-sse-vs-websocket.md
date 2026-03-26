# ADR-004: SSE vs WebSocket

## Status
Accepted

## Context
OpenCode streams events via SSE at `/global/event`. Need real-time event streaming on mobile.

## Decision
Use SSE (Server-Sent Events) matching OpenCode's native protocol.

## Alternatives Considered
- **WebSocket**: Bidirectional but OpenCode doesn't offer WS endpoint
- **Polling**: Wasteful, high latency

## Consequences
- Zero protocol translation needed
- Reconnect logic required (exponential backoff)
- AppState-aware connect/disconnect for battery efficiency
