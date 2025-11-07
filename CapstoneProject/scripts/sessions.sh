#!/usr/bin/env bash
set -euo pipefail
base=${BASE:-http://localhost:4000}

email="u$RANDOM@ex.com"
pwd='p@ssw0rd'

curl -s -c cookies.txt -b cookies.txt -X POST "$base/api/auth/register" \
  -H 'Content-Type: application/json' -d "{\"email\":\"$email\",\"password\":\"$pwd\"}" >/dev/null

curl -s -c cookies.txt -b cookies.txt -X POST "$base/api/auth/login" \
  -H 'Content-Type: application/json' -d "{\"email\":\"$email\",\"password\":\"$pwd\"}" >/dev/null

curl -s -c cookies.txt -b cookies.txt "$base/api/sessions" | jq .

sid=$(curl -s -c cookies.txt -b cookies.txt -X POST "$base/api/sessions" | jq -r '.session._id')
echo "SID=$sid"

curl -s -c cookies.txt -b cookies.txt "$base/api/sessions/$sid" | jq . >/dev/null
curl -s -c cookies.txt -b cookies.txt "$base/api/messages?sessionId=$sid" | jq . >/dev/null
echo OK



