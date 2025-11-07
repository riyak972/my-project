#!/bin/bash
set -e
API_URL="${API_URL:-http://localhost:4000}"
COOKIE="/tmp/beli-cookies.txt"

# Login helper
login() {
  local email=$1 pass=$2
  curl -s -i -c "$COOKIE" -X POST "$API_URL/api/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$email\",\"password\":\"$pass\"}" > /dev/null
}

# Register and login
RAND=$RANDOM
EMAIL="sess_${RAND}@example.com"
PASS="Test123456!"
curl -s -X POST "$API_URL/api/auth/register" -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" > /dev/null
login "$EMAIL" "$PASS"

echo "[session.smoke] Using $API_URL"
# Create session
sres=$(curl -s -b "$COOKIE" -X POST "$API_URL/api/sessions" -H 'Content-Type: application/json' -d '{}')
sid=$(echo "$sres" | sed -n 's/.*"_id":"\([^"]*\)".*/\1/p')
[ -z "$sid" ] && echo "No session id: $sres" >&2 && exit 1

echo "session: $sid"
# Fetch messages via alias /api/messages
m1=$(curl -s -b "$COOKIE" "$API_URL/api/messages?sessionId=$sid")
if ! echo "$m1" | grep -q '"messages"'; then echo "Messages failed: $m1" >&2; exit 1; fi
echo "messages: ok"
