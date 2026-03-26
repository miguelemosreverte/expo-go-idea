# ADR-006: i18n es-AR First

## Status
Accepted

## Context
Targeting Argentine market first. Need localized UI.

## Decision
react-i18next with es-AR (Argentine Spanish) as default, en (English) as fallback.

## Alternatives Considered
- **English only**: Misses target market
- **Hardcoded strings**: Impossible to localize later

## Consequences
- All UI strings via `t()` function
- Translation files maintained per language
- es-AR.json is the source of truth
