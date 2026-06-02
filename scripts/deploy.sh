#!/usr/bin/env bash
# Tournex one-command deploy.
#
# Reads keys from .env.deploy (gitignored), then:
#   1. Creates Stripe products + prices
#   2. Writes .env.local with all needed values
#   3. Builds with @opennextjs/cloudflare
#   4. Deploys to Cloudflare Workers via wrangler
#   5. Creates Stripe webhook pointing at the deployed URL
#   6. Sets STRIPE_WEBHOOK_SECRET as a Worker secret
#   7. Configures Supabase auth URLs
#   8. Prints the live URL
#
# .env.deploy must contain:
#   STRIPE_PUBLISHABLE_KEY=pk_test_...
#   STRIPE_SECRET_KEY=sk_test_...
#   CLOUDFLARE_API_TOKEN=...
#   CLOUDFLARE_ACCOUNT_ID=...   (optional — wrangler can detect)
#   SUPABASE_ACCESS_TOKEN=sbp_... (optional — only needed for Supabase URL config)

set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"

if [ ! -f .env.deploy ]; then
  echo "✗ .env.deploy not found. Create it with required keys (see top of this script)."
  exit 1
fi

# shellcheck disable=SC1091
set -a
source .env.deploy
set +a

REQUIRED=(STRIPE_PUBLISHABLE_KEY STRIPE_SECRET_KEY CLOUDFLARE_API_TOKEN)
for v in "${REQUIRED[@]}"; do
  if [ -z "${!v:-}" ]; then
    echo "✗ $v is missing in .env.deploy"
    exit 1
  fi
done

# Supabase keys are already known (project mhohuwpaikqevwqqpihc).
SUPABASE_URL="https://mhohuwpaikqevwqqpihc.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ob2h1d3BhaWtxZXZ3cXFwaWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MjM0MDQsImV4cCI6MjA5NDM5OTQwNH0.0z7OMqnwTqeryyaNeZlKc-V3XyD3MzaP2qXLmBoUjhU"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ob2h1d3BhaWtxZXZ3cXFwaWhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODgyMzQwNCwiZXhwIjoyMDk0Mzk5NDA0fQ.vHoe-jyZs5L7MLHXFRcPTmLlQxr821jTR_92vHO1CTU"

echo
echo "═══════════════════════════════════════════"
echo "   Tournex Deployment — start"
echo "═══════════════════════════════════════════"
echo

# ── 1. Create Stripe products + prices ──────────────────────────────────
echo "▌ 1/7 Creating Stripe products + prices..."
STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" node scripts/setup-stripe.mjs

PRICE_PRO_MONTHLY=$(node -e "console.log(require('./.deploy/stripe-prices.json').pro_monthly)")
PRICE_PRO_ANNUAL=$(node -e "console.log(require('./.deploy/stripe-prices.json').pro_annual)")
PRICE_CLUB_MONTHLY=$(node -e "console.log(require('./.deploy/stripe-prices.json').club_monthly)")
PRICE_CLUB_ANNUAL=$(node -e "console.log(require('./.deploy/stripe-prices.json').club_annual)")

# ── 2. Write .env.local for the Next.js build ───────────────────────────
echo
echo "▌ 2/7 Writing .env.local..."
cat > .env.local <<EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=placeholder_replaced_after_webhook_creation
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=$PRICE_PRO_MONTHLY
NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL=$PRICE_PRO_ANNUAL
NEXT_PUBLIC_STRIPE_PRICE_CLUB_MONTHLY=$PRICE_CLUB_MONTHLY
NEXT_PUBLIC_STRIPE_PRICE_CLUB_ANNUAL=$PRICE_CLUB_ANNUAL
EOF
echo "✓ .env.local written"

# ── 3. Build for Cloudflare Workers ─────────────────────────────────────
echo
echo "▌ 3/7 Building with @opennextjs/cloudflare..."
npx opennextjs-cloudflare build > .deploy/build.log 2>&1
echo "✓ Build successful (log: .deploy/build.log)"

# ── 4. Deploy to Cloudflare Workers ─────────────────────────────────────
echo
echo "▌ 4/7 Deploying to Cloudflare Workers..."
export CLOUDFLARE_API_TOKEN

# Auto-detect account ID if not provided.
if [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
  ACCOUNTS_RESP=$(curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    "https://api.cloudflare.com/client/v4/accounts")
  CLOUDFLARE_ACCOUNT_ID=$(echo "$ACCOUNTS_RESP" | \
    node -e "let d=''; process.stdin.on('data', c=>d+=c).on('end',()=>{try{const j=JSON.parse(d);if(j.success&&j.result[0])console.log(j.result[0].id)}catch{}})")
  if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo "✗ Could not auto-detect Cloudflare account. Set CLOUDFLARE_ACCOUNT_ID in .env.deploy."
    exit 1
  fi
  echo "→ Detected account: $CLOUDFLARE_ACCOUNT_ID"
fi
export CLOUDFLARE_ACCOUNT_ID

DEPLOY_OUTPUT=$(npx wrangler deploy 2>&1)
echo "$DEPLOY_OUTPUT" | tail -20

# Extract the deployed URL from wrangler output.
DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://[a-zA-Z0-9.-]+\.workers\.dev' | head -1)
if [ -z "$DEPLOY_URL" ]; then
  echo "✗ Could not parse deploy URL. Set DEPLOY_URL manually and re-run from step 5."
  exit 1
fi
echo "✓ Deployed to $DEPLOY_URL"

# ── 5. Create Stripe webhook ────────────────────────────────────────────
echo
echo "▌ 5/7 Creating Stripe webhook..."
STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" DEPLOY_URL="$DEPLOY_URL" \
  node scripts/setup-stripe-webhook.mjs

WEBHOOK_SECRET=$(node -e "console.log(require('./.deploy/stripe-webhook.json').secret)")

# ── 6. Set STRIPE_WEBHOOK_SECRET as a Worker secret + redeploy ──────────
echo
echo "▌ 6/7 Setting Worker secrets..."
echo "$WEBHOOK_SECRET" | npx wrangler secret put STRIPE_WEBHOOK_SECRET
echo "$STRIPE_SECRET_KEY" | npx wrangler secret put STRIPE_SECRET_KEY
echo "$SUPABASE_SERVICE_ROLE_KEY" | npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
echo "✓ Secrets set"

# Update .env.local with real webhook secret, rebuild, redeploy
sed -i.bak "s|STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET|" .env.local
rm -f .env.local.bak
echo "→ Rebuilding with webhook secret..."
npx opennextjs-cloudflare build > .deploy/build2.log 2>&1
npx wrangler deploy > .deploy/redeploy.log 2>&1
echo "✓ Redeployed"

# ── 7. Configure Supabase Site URL ──────────────────────────────────────
if [ -n "${SUPABASE_ACCESS_TOKEN:-}" ]; then
  echo
  echo "▌ 7/7 Configuring Supabase auth URLs..."
  SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" DEPLOY_URL="$DEPLOY_URL" \
    node scripts/configure-supabase.mjs
else
  echo
  echo "▌ 7/7 (skipped — no SUPABASE_ACCESS_TOKEN in .env.deploy)"
  echo "    Configure manually at:"
  echo "    https://supabase.com/dashboard/project/mhohuwpaikqevwqqpihc/auth/url-configuration"
  echo "    Site URL: $DEPLOY_URL"
  echo "    Redirect URLs: $DEPLOY_URL/auth/callback"
fi

# ── Done ─────────────────────────────────────────────────────────────────
echo
echo "═══════════════════════════════════════════"
echo "   ✓ Tournex deployment complete"
echo "═══════════════════════════════════════════"
echo "   Live at: $DEPLOY_URL"
echo
echo "   Remaining manual steps (~2 min):"
echo "   1. Google Cloud → OAuth client → add JS origin: $DEPLOY_URL"
echo "      https://console.cloud.google.com/apis/credentials"
echo
echo "   Test it: $DEPLOY_URL"
echo "═══════════════════════════════════════════"
