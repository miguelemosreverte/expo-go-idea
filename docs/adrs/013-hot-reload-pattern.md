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
