#!/bin/bash
set -euo pipefail
echo "Checking gateway..."
curl -sf http://localhost:3000/health && echo " OK" || echo " DOWN"
echo "Checking OpenCode..."
curl -sf http://localhost:4096/global/health && echo " OK" || echo " DOWN"
