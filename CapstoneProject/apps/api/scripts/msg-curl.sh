#!/bin/bash

# Message endpoint smoke test
# Tests: register → login → create session → send message → get messages

API_URL="http://localhost:4000"
EMAIL="test-$(date +%s)@example.com"
PASSWORD="testing123"

echo "=== Message Endpoint Test ==="
echo "API: $API_URL"
echo "Email: $EMAIL"
echo "Password: $PASSWORD"
echo ""

# Test 1: Register
echo "1. Registering new user..."
REGISTER_RESPONSE=$(curl -i -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  -c /tmp/auth-cookies.txt)

REGISTER_HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n1)
if [ "$REGISTER_HTTP_CODE" != "201" ]; then
  echo "❌ Register failed! Status: $REGISTER_HTTP_CODE"
  exit 1
fi
echo "✅ Register successful"
echo ""

# Test 2: Login
echo "2. Logging in..."
LOGIN_RESPONSE=$(curl -i -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  -c /tmp/auth-cookies.txt \
  -b /tmp/auth-cookies.txt)

LOGIN_HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
if [ "$LOGIN_HTTP_CODE" != "200" ]; then
  echo "❌ Login failed! Status: $LOGIN_HTTP_CODE"
  exit 1
fi
echo "✅ Login successful"
echo ""

# Test 3: Create session
echo "3. Creating session..."
SESSION_RESPONSE=$(curl -s -X POST "$API_URL/api/sessions" \
  -H "Content-Type: application/json" \
  -d "{}" \
  -b /tmp/auth-cookies.txt)

SESSION_ID=$(echo "$SESSION_RESPONSE" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$SESSION_ID" ]; then
  echo "❌ Failed to create session"
  echo "$SESSION_RESPONSE"
  exit 1
fi
echo "✅ Session created: $SESSION_ID"
echo ""

# Test 4: Send message (non-stream)
echo "4. Sending message..."
MESSAGE_RESPONSE=$(curl -i -s -w "\n%{http_code}" -X POST "$API_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"content\":\"Hello, this is a test message\"}" \
  -b /tmp/auth-cookies.txt)

MESSAGE_HTTP_CODE=$(echo "$MESSAGE_RESPONSE" | tail -n1)
if [ "$MESSAGE_HTTP_CODE" != "200" ]; then
  echo "❌ Send message failed! Status: $MESSAGE_HTTP_CODE"
  echo "$MESSAGE_RESPONSE" | grep -A 10 "^{" | head -5
  exit 1
fi
echo "✅ Message sent"
echo ""

# Test 5: Get messages (route 1: /api/sessions/messages)
echo "5. Getting messages via /api/sessions/messages?sessionId=..."
MESSAGES_RESPONSE1=$(curl -i -s -w "\n%{http_code}" -X GET "$API_URL/api/sessions/messages?sessionId=$SESSION_ID" \
  -b /tmp/auth-cookies.txt)

MESSAGES_HTTP_CODE1=$(echo "$MESSAGES_RESPONSE1" | tail -n1)
MESSAGES_BODY1=$(echo "$MESSAGES_RESPONSE1" | sed '$d')

echo "Status: $MESSAGES_HTTP_CODE1"
if [ "$MESSAGES_HTTP_CODE1" = "200" ]; then
  echo "✅ Route 1 works!"
  MESSAGE_COUNT=$(echo "$MESSAGES_BODY1" | grep -o '"_id"' | wc -l | tr -d ' ')
  echo "Messages found: $MESSAGE_COUNT"
else
  echo "❌ Route 1 failed!"
  echo "$MESSAGES_BODY1" | grep -A 5 "^{" | head -3
fi
echo ""

# Test 6: Get messages (alternative route)
echo "6. Checking if /api/messages?sessionId= exists..."
MESSAGES_RESPONSE2=$(curl -i -s -w "\n%{http_code}" -X GET "$API_URL/api/messages?sessionId=$SESSION_ID" \
  -b /tmp/auth-cookies.txt 2>&1)

MESSAGES_HTTP_CODE2=$(echo "$MESSAGES_RESPONSE2" | tail -n1)
if [ "$MESSAGES_HTTP_CODE2" = "200" ] || [ "$MESSAGES_HTTP_CODE2" = "404" ]; then
  echo "Route 2 status: $MESSAGES_HTTP_CODE2"
else
  echo "Route 2 not found (expected)"
fi
echo ""

if [ "$MESSAGES_HTTP_CODE1" = "200" ]; then
  echo "=== All tests passed! ==="
else
  echo "=== Tests failed! ==="
  exit 1
fi

