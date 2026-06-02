#!/usr/bin/env node
// Sets Supabase auth Site URL + Redirect URL for the deployed app.
// Uses the Supabase Management API.
//
// Usage:
//   SUPABASE_ACCESS_TOKEN=sbp_... DEPLOY_URL=https://tournex.x.workers.dev \
//     node scripts/configure-supabase.mjs

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const DEPLOY_URL = process.env.DEPLOY_URL;
const PROJECT_REF = "mhohuwpaikqevwqqpihc";

if (!TOKEN || !DEPLOY_URL) {
  console.error("✗ Need SUPABASE_ACCESS_TOKEN and DEPLOY_URL env vars.");
  process.exit(1);
}

const SITE_URL = DEPLOY_URL.replace(/\/$/, "");
const REDIRECT_URLS = [
  `${SITE_URL}/auth/callback`,
  "http://localhost:3000/auth/callback",
];

async function api(path, init = {}) {
  const res = await fetch(`https://api.supabase.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

async function main() {
  console.log("─────────────────────────────────────");
  console.log(" Supabase URL configuration");
  console.log("─────────────────────────────────────");
  console.log(`Site URL: ${SITE_URL}\n`);

  const current = await api(
    `/v1/projects/${PROJECT_REF}/config/auth`,
  );
  console.log("Current Site URL:", current.site_url);

  await api(`/v1/projects/${PROJECT_REF}/config/auth`, {
    method: "PATCH",
    body: JSON.stringify({
      site_url: SITE_URL,
      uri_allow_list: REDIRECT_URLS.join(","),
    }),
  });

  console.log("✓ Updated Site URL and redirect URLs.");
  console.log(`  - ${REDIRECT_URLS.join("\n  - ")}`);
}

main().catch((err) => {
  console.error("✗ Supabase config failed:", err.message);
  process.exit(1);
});
