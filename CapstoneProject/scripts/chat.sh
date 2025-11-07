#!/usr/bin/env bash
set -euo pipefail
base=${BASE:-http://localhost:4000}

sid=${SID:?SID missing}

curl -s -c cookies.txt -b cookies.txt -X POST "$base/api/chat" \
  -H 'Content-Type: application/json' \
  -d "{\"sessionId\":\"$sid\",\"content\":\"hello\"}" | jq . >/dev/null

curl -s -c cookies.txt -b cookies.txt "$base/api/messages?sessionId=$sid" | jq .
echo OK



