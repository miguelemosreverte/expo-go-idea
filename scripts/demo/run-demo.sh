#!/bin/bash
set -euo pipefail
echo "=== GauchoCowork Full Demo ==="

./scripts/demo/seed-demo-project.sh
docker compose up -d

echo "Waiting for services..."
sleep 10

./scripts/ops/health-check.sh

echo ""
echo "Gateway:  http://localhost:3000"
echo "OpenCode: http://localhost:4096"
echo "Press Ctrl+C to stop."
docker compose logs -f
