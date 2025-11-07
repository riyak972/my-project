#!/bin/bash
set -e
API_URL="${API_URL:-http://localhost:4000}"
COOKIE="/tmp/beli-cookies.txt"

# Register/login
RAND=$RANDOM
EMAIL="chat_${RAND}@example.com"
PASS="Test123456!"

curl -s -X POST "$API_URL/api/auth/register" -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" > /dev/null
curl -s -i -c "$COOKIE" -X POST "$API_URL/api/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" > /dev/null

# Create session
s=$(curl -s -b "$COOKIE" -X POST "$API_URL/api/sessions" -H 'Content-Type: application/json' -d '{}')
sid=$(echo "$s" | sed -n 's/.*"_id":"\([^"]*\)".*/\1/p')
[ -z "$sid" ] && echo "No session id: $s" >&2 && exit 1

echo "[chat.smoke] session=$sid"
# Send chat (non-stream)
send=$(curl -s -b "$COOKIE" -X POST "$API_URL/api/chat" -H 'Content-Type: application/json' -d "{\"sessionId\":\"$sid\",\"content\":\"Hello from smoke test\",\"provider\":\"mock\"}")
code=$?
if [ $code -ne 0 ]; then echo "Send failed" >&2; exit 1; fi

# Fetch messages and ensure user message exists
msgs=$(curl -s -b "$COOKIE" "$API_URL/api/messages?sessionId=$sid")
if ! echo "$msgs" | grep -q '"messages"'; then echo "Messages missing: $msgs" >&2; exit 1; fi
if ! echo "$msgs" | grep -q 'Hello from smoke test'; then echo "User message not found" >&2; exit 1; fi

echo "OK"
