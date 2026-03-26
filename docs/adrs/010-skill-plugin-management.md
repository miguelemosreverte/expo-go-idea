# ADR-010: Skill & Plugin Management

## Status
Accepted

## Context
OpenCode supports extensible skills and plugins. Users need to manage them remotely.

## Decision
Mobile app provides skill store UI. Gateway reads/writes `.opencode/skills/` and `opencode.json`.

## Alternatives Considered
- **CLI-only management**: Not mobile-friendly
- **Web dashboard**: Extra deployment, not native

## Consequences
- Gateway skill installer (opkg + git clone)
- Config editing with validation
- Hot-reload after changes via POST /instance/dispose
