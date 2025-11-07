#!/bin/bash
# End-to-End Message Testing Script
# Tests: register -> login -> create session -> send message -> fetch messages

set -e

API_URL="${API_URL:-http://localhost:4000}"
COOKIE_FILE="/tmp/chatbot-test-cookies.txt"
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="Test123456!"

echo "=== E2E Message Testing ==="
echo "API URL: $API_URL"
echo "Test user: $TEST_EMAIL"
echo ""

# Clean up old cookies
rm -f "$COOKIE_FILE"

# Step 1: Register
echo "1️⃣  Registering user..."
register_response=$(curl -s -c "$COOKIE_FILE" -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

if echo "$register_response" | grep -q '"user"'; then
  echo "✅ Registration successful"
else
  echo "❌ Registration failed: $register_response"
  rm -f "$COOKIE_FILE"
  exit 1
fi

# Step 2: Login (refresh cookies)
echo ""
echo "2️⃣  Logging in..."
login_response=$(curl -s -c "$COOKIE_FILE" -b "$COOKIE_FILE" -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

if echo "$login_response" | grep -q '"token"'; then
  echo "✅ Login successful"
else
  echo "❌ Login failed: $login_response"
  rm -f "$COOKIE_FILE"
  exit 1
fi

# Step 3: Create session
echo ""
echo "3️⃣  Creating session..."
session_response=$(curl -s -b "$COOKIE_FILE" -X POST "$API_URL/api/sessions" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Session"}')

session_id=$(echo "$session_response" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$session_id" ]; then
  echo "❌ Failed to create session: $session_response"
  rm -f "$COOKIE_FILE"
  exit 1
fi

echo "✅ Session created: $session_id"

# Step 4: Send message (non-streaming)
echo ""
echo "4️⃣  Sending message (non-streaming)..."
send_response=$(curl -s -b "$COOKIE_FILE" -X POST "$API_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$session_id\",\"content\":\"Hello, this is a test message\"}")

if echo "$send_response" | grep -q '"message"'; then
  echo "✅ Message sent successfully"
else
  echo "⚠️  Send response: $send_response"
  # Don't exit - provider might not be configured, which is OK for testing routes
fi

# Step 5: Fetch messages via /api/sessions/messages?sessionId=...
echo ""
echo "5️⃣  Fetching messages via /api/sessions/messages?sessionId=..."
messages_response_1=$(curl -s -b "$COOKIE_FILE" -w "\n%{http_code}" "$API_URL/api/sessions/messages?sessionId=$session_id")
status_1=$(echo "$messages_response_1" | tail -1)
body_1=$(echo "$messages_response_1" | sed '$d')

echo "Status: $status_1"
if [ "$status_1" = "200" ]; then
  message_count=$(echo "$body_1" | grep -o '"_id"' | wc -l | tr -d ' ')
  echo "✅ Fetched successfully - Message count: $message_count"
else
  echo "❌ Failed to fetch: $body_1"
fi

# Step 6: Fetch messages via /api/sessions/:id/messages
echo ""
echo "6️⃣  Fetching messages via /api/sessions/$session_id/messages..."
messages_response_2=$(curl -s -b "$COOKIE_FILE" -w "\n%{http_code}" "$API_URL/api/sessions/$session_id/messages")
status_2=$(echo "$messages_response_2" | tail -1)
body_2=$(echo "$messages_response_2" | sed '$d')

echo "Status: $status_2"
if [ "$status_2" = "200" ]; then
  message_count=$(echo "$body_2" | grep -o '"_id"' | wc -l | tr -d ' ')
  echo "✅ Fetched successfully - Message count: $message_count"
else
  echo "❌ Failed to fetch: $body_2"
fi

# Step 7: Fetch messages via /api/messages?sessionId=... (alias)
echo ""
echo "7️⃣  Fetching messages via /api/messages?sessionId=... (alias)"
messages_response_3=$(curl -s -b "$COOKIE_FILE" -w "\n%{http_code}" "$API_URL/api/messages?sessionId=$session_id")
status_3=$(echo "$messages_response_3" | tail -1)
body_3=$(echo "$messages_response_3" | sed '$d')

echo "Status: $status_3"
if [ "$status_3" = "200" ]; then
  message_count=$(echo "$body_3" | grep -o '"_id"' | wc -l | tr -d ' ')
  echo "✅ Fetched successfully - Message count: $message_count"
else
  echo "❌ Failed to fetch: $body_3"
fi

# Cleanup
rm -f "$COOKIE_FILE"

echo ""
echo "=== Summary ==="
echo "✅ All critical paths tested"

if [ "$status_1" = "200" ] && [ "$status_2" = "200" ] && [ "$status_3" = "200" ]; then
  echo "✅ All message fetch endpoints working (200 OK)"
  exit 0
else
  echo "⚠️  Some endpoints returned non-200 status"
  exit 1
fi
