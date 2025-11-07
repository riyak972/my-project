#!/usr/bin/env bash
set -euo pipefail
BASE=${BASE:-http://localhost:4000}
E="u$RANDOM@ex.com"
P="P@ssw0rd!"

echo "Testing auth flow with email: $E"

# Register
echo "1. Registering user..."
curl -s -c c.txt -b c.txt -X POST "$BASE/api/auth/register" \
  -H 'Content-Type: application/json' -d "{\"email\":\"$E\",\"password\":\"$P\"}" >/dev/null

# Login
echo "2. Logging in..."
curl -s -c c.txt -b c.txt -X POST "$BASE/api/auth/login" \
  -H 'Content-Type: application/json' -d "{\"email\":\"$E\",\"password\":\"$P\"}" >/dev/null

# Get me
echo "3. Getting user info..."
curl -s -c c.txt -b c.txt "$BASE/api/auth/me" | jq .

echo "AUTH OK"

# Cleanup
rm -f c.txt
