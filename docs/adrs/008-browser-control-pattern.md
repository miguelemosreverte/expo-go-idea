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
