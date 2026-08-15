#!/usr/bin/env bash
# Deploy Day Tracker to Cloudflare Pages (project: day-tracker).
#
# The canonical patient-facing address is daytracker.sudhir-kothari.net, served by
# this Pages project. The GitHub Pages copy at
# sudhirkots.github.io/Apps/parkinsons-day-tracker/ still exists because the repo
# serves other projects from the same site — but it is NOT the one to hand out.
#
# Run this after every change that should reach patients. Pushing to git alone
# updates only the GitHub copy, which is how the two silently drift apart.
#
#   ./deploy.sh
#
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WRANGLER="$SRC/../Clinic Website/node_modules/.bin/wrangler"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

if [ ! -x "$WRANGLER" ]; then
  echo "wrangler not found at $WRANGLER" >&2
  echo "It lives in the Clinic Website project's node_modules." >&2
  exit 1
fi

# Ship the app only. README, explainer script and screenshots are development
# material and have no business on a patient-facing address.
cp "$SRC/index.html" "$SRC/app.js" "$SRC/styles.css" \
   "$SRC/manifest.webmanifest" "$SRC/service-worker.js" "$STAGE/"
cp -r "$SRC/assets" "$STAGE/assets"

# Guard against the mistake that has already bitten once: shipping a changed
# app.js under an unchanged ?v=N, so the service worker keeps serving the old one.
VER_APP="$(grep -o 'APP_VERSION = "v[0-9]*"' "$SRC/app.js" | grep -o '[0-9]*')"
VER_HTML="$(grep -o 'app\.js?v=[0-9]*' "$SRC/index.html" | grep -o '[0-9]*$')"
VER_SW="$(grep -o 'day-tracker-v[0-9]*' "$SRC/service-worker.js" | grep -o '[0-9]*$')"

if [ "$VER_APP" != "$VER_HTML" ] || [ "$VER_APP" != "$VER_SW" ]; then
  echo "Version mismatch — these three must agree before deploying:" >&2
  echo "  APP_VERSION in app.js:        v$VER_APP" >&2
  echo "  ?v= query in index.html:      v$VER_HTML" >&2
  echo "  CACHE name in service-worker: v$VER_SW" >&2
  echo "Bump all three together, or installed phones keep the old build." >&2
  exit 1
fi

echo "Deploying v$VER_APP ..."
"$WRANGLER" pages deploy "$STAGE" \
  --project-name day-tracker --branch main --commit-dirty=true

echo
echo "Live at https://daytracker.sudhir-kothari.net (and day-tracker-ec6.pages.dev)"
echo "Check Menu shows · v$VER_APP"
