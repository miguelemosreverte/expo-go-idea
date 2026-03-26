#!/bin/bash
set -euo pipefail
echo "Starting GauchoCowork dev environment..."
docker compose up -d
echo "Gateway:  http://localhost:3000"
echo "OpenCode: http://localhost:4096"
echo ""
echo "Starting Expo dev server..."
cd apps/mobile && npx expo start
