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
