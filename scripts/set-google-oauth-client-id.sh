#!/usr/bin/env bash
# Set GitHub secret VITE_APP_GOOGLE_CLIENT_ID after creating OAuth Web client in GCP.
# Usage: ./scripts/set-google-oauth-client-id.sh YOUR_CLIENT_ID.apps.googleusercontent.com

set -euo pipefail

CLIENT_ID="${1:-}"
REPO="${GITHUB_REPO:-konashevich/diagrams-free}"

if [[ -z "$CLIENT_ID" ]]; then
  echo "Usage: $0 <oauth-web-client-id>"
  echo ""
  echo "Create a Web application OAuth client in:"
  echo "  https://console.cloud.google.com/auth/clients?project=diagrams-free"
  echo ""
  echo "Authorized JavaScript origins: https://diagrams.free"
  echo "Authorized redirect URIs:      https://diagrams.free/oauth-callback.html"
  echo ""
  echo "Or copy the auto-created Firebase Web client from:"
  echo "  https://console.cloud.google.com/apis/credentials?project=diagrams-free"
  exit 1
fi

gh secret set VITE_APP_GOOGLE_CLIENT_ID -b "$CLIENT_ID" -R "$REPO"
echo "Set VITE_APP_GOOGLE_CLIENT_ID on $REPO. Push to master to redeploy."
