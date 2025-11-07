#!/bin/bash
set -e
API_URL="${API_URL:-http://localhost:4000}"
RAND=$RANDOM
EMAIL="user_${RAND}@example.com"
PASS="Test123456!"

echo "[auth.smoke] Using $API_URL"
# Register
reg=$(curl -s -i -X POST "$API_URL/api/auth/register" -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")
echo "$reg" | head -n 1
# Login
login=$(curl -s -i -c /tmp/beli-cookies.txt -X POST "$API_URL/api/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")
set_cookie=$(echo "$login" | grep -i '^set-cookie:')
if [ -z "$set_cookie" ]; then echo "No Set-Cookie on login" >&2; exit 1; fi
echo "$login" | head -n 1
# Me
me=$(curl -s -b /tmp/beli-cookies.txt "$API_URL/api/auth/me")
if ! echo "$me" | grep -q '"user"'; then echo "Me failed: $me" >&2; exit 1; fi
echo "$me"
