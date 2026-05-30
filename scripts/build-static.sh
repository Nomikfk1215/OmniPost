#!/bin/bash
# Build static site for GitHub Pages
# API routes are temporarily excluded (GH Pages can't serve them)

set -e

echo "=== Preparing static build for GitHub Pages ==="

# 1. Temporarily hide API routes (not compatible with static export)
if [ -d "src/app/api" ]; then
  mv src/app/api src/app/api._bak
  echo "  ✓ Moved api/ out of build"
fi

# Also hide other server-dependent pages that can't work on static hosting
# Workspace, settings, records, accounts pages will 404 or redirect to home
# We keep landing + docs which work fine as static pages

# 2. Clean previous build artifacts
rm -rf .next out

# 3. Build with static export
echo "=== Building static site ==="
NEXT_STATIC_EXPORT=true next build

# 4. Restore API routes
if [ -d "src/app/api._bak" ]; then
  mv src/app/api._bak src/app/api
  echo "  ✓ Restored api/"
fi

echo "=== Static build complete: ./out ==="
