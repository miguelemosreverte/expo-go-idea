#!/bin/bash
set -euo pipefail
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
  echo "Edit .env with your configuration."
else
  echo ".env already exists, skipping."
fi
