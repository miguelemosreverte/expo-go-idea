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
