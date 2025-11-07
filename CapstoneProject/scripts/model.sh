#!/usr/bin/env bash
set -euo pipefail
base=${BASE:-http://localhost:4000}

sid=${SID:?SID missing}

curl -s "$base/api/config" | jq .

# switch to mock
curl -s -c cookies.txt -b cookies.txt -X PATCH "$base/api/sessions/$sid" \
  -H 'Content-Type: application/json' -d '{"provider":"mock","model":"mock-model"}' | jq . >/dev/null

# optional switch to gemini if enabled
if curl -s "$base/api/config" | jq -r '.providers[] | select(.name=="gemini") | .enabled' | grep -q true; then
  curl -s -c cookies.txt -b cookies.txt -X PATCH "$base/api/sessions/$sid" \
    -H 'Content-Type: application/json' -d '{"provider":"gemini","model":"gemini-2.5-flash"}' | jq . >/dev/null
fi

echo OK



