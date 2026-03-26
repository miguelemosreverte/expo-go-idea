#!/bin/bash
set -euo pipefail
echo "Checking development environment..."

if command -v xcrun &> /dev/null; then
  echo "Xcode CLI tools available"
  xcrun simctl list devices available 2>/dev/null | head -5
else
  echo "Xcode CLI tools not found (needed for iOS simulator)"
fi

if command -v adb &> /dev/null; then
  echo "Android SDK tools available"
else
  echo "Android SDK tools not found (needed for Android emulator)"
fi
