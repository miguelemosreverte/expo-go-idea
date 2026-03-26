#!/bin/bash
set -euo pipefail
echo "Installing dependencies..."
corepack enable
pnpm install
echo "Building shared package..."
pnpm turbo build --filter=@gaucho/shared
echo "Setup complete!"
