# ADR-007: Server Discovery via mDNS and QR

## Status
Accepted

## Context
Users need to find their gateway from mobile without typing IP addresses.

## Decision
Three discovery methods: mDNS (`_gaucho._tcp`), QR code scanning, manual URL entry.

## Alternatives Considered
- **Manual URL only**: Poor UX for non-technical users
- **Cloud discovery**: Violates "users own their data" principle

## Consequences
- Zero-config local network discovery
- QR code for remote/complex setups
- Deep link support: `gauchocowork://connect?url=...`
