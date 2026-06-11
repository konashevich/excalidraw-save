#!/usr/bin/env bash
# One-time GCP fix for Error 400: redirect_uri_mismatch (Google Drive sign-in).
set -euo pipefail

CLIENT_ID="${GOOGLE_OAUTH_CLIENT_ID:-658308114676-0ova0t3ht70bualff010nb5j6pc6j3ha.apps.googleusercontent.com}"
PROJECT="diagrams-free"
EDIT_URL="https://console.cloud.google.com/auth/clients/${CLIENT_ID}?project=${PROJECT}"

cat <<EOF
Google Drive sign-in — fix redirect_uri_mismatch
================================================

The app sends this redirect URI (must match GCP exactly):

  https://diagrams.free/

1. Open OAuth client (konoshevich@gmail.com):

   ${EDIT_URL}

2. Under "Authorized JavaScript origins" add if missing:

   https://diagrams.free

3. Under "Authorized redirect URIs" add:

   https://diagrams.free/
   https://diagrams.free/oauth-callback.html

   (Trailing slash on the first URI matters — Google treats it as different from
   https://diagrams.free without slash.)

4. Save. Changes can take a few minutes.

5. Retry sign-in in an incognito window on https://diagrams.free

Client ID in production bundle: ${CLIENT_ID}
EOF

if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$EDIT_URL" >/dev/null 2>&1 || true
elif command -v open >/dev/null 2>&1; then
  open "$EDIT_URL" || true
fi
