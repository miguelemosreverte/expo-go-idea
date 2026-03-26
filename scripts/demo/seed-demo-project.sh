#!/bin/bash
set -euo pipefail
DEMO_DIR="demo-project"
mkdir -p "$DEMO_DIR"
cat > "$DEMO_DIR/README.md" << 'HEREDOC'
# Demo Project

Demo workspace for GauchoCowork development.
HEREDOC
echo "Demo project seeded at $DEMO_DIR"
