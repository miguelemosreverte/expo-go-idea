# ADR-012: Sandbox Mode

## Status
Accepted

## Context
Agent code execution may need isolation for safety.

## Decision
Gateway supports Docker sandbox mode. OpenCode runs in a container with workspace mounted as volume.

## Alternatives Considered
- **No isolation**: Risk of unintended system changes
- **VM-based sandbox**: Too heavyweight

## Consequences
- Docker required for sandbox mode
- Workspace mounted as volume
- Toggleable from mobile settings
- Performance overhead from containerization
