#!/bin/bash
set -euo pipefail
echo "Stopping GauchoCowork dev environment..."
docker compose down
echo "Done."
