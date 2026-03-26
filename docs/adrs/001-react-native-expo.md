# ADR-001: React Native with Expo

## Status
Accepted

## Context
Need cross-platform mobile that can use @opencode-ai/sdk TypeScript package directly, with strong SSE support and a large Argentine developer pool.

## Decision
React Native with Expo SDK 55+, Expo Router for navigation, NativeWind for styling.

## Alternatives Considered
- **Flutter**: Requires rewriting OpenCode SDK in Dart
- **Kotlin KMP**: Niche talent pool in Argentina
- **Tauri Mobile**: Too immature for production

## Consequences
- Direct @opencode-ai/sdk import
- Large React Native developer pool in Argentina
- OTA updates via EAS Update
- Expo managed workflow limits some native module access
