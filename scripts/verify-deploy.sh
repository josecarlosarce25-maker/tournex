#!/usr/bin/env bash
# Smoke test for a deployed Tournex instance.
# Usage: ./scripts/verify-deploy.sh https://tournex.x.workers.dev

set -e

if [ -z "${1:-}" ]; then
  echo "Usage: $0 <deploy-url>"
  exit 1
fi

URL="${1%/}"

echo "▌ Verifying $URL ..."
echo

check() {
  local path="$1"
  local desc="$2"
  local expected="${3:-200}"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" "$URL$path")
  if [ "$code" = "$expected" ]; then
    echo "✓ $desc → $code"
  else
    echo "✗ $desc → $code (expected $expected)"
    return 1
  fi
}

check "/" "Landing page"
check "/login" "Login page"
check "/manifest.webmanifest" "PWA manifest"
check "/sitemap.xml" "Sitemap"
check "/robots.txt" "robots.txt"
check "/icon.svg" "Favicon"
# Dashboard renders a shell then redirects client-side (Cloudflare SSR),
# so a signed-out hit returns 200 with the redirect happening in the browser.
check "/dashboard" "Dashboard reachable" "200"
# /api/checkout is POST-only; a GET correctly returns 405 (endpoint exists).
check "/api/checkout" "Checkout API exists (GET → 405)" "405"

echo
echo "✓ All checks passed."
