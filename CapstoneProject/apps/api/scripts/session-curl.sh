#!/bin/bash

# Session endpoint smoke test
# Tests: register → login → POST /api/sessions → GET /api/sessions

API_URL="http://localhost:4000"
EMAIL="test-$(date +%s)@example.com"
PASSWORD="testing123"

echo "=== Session Endpoint Test ==="
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

# Test 3: POST /api/sessions (create session)
echo "3. Creating new session..."
SESSION_CREATE_RESPONSE=$(curl -i -s -w "\n%{http_code}" -X POST "$API_URL/api/sessions" \
  -H "Content-Type: application/json" \
  -d "{}" \
  -b /tmp/auth-cookies.txt)

SESSION_CREATE_HTTP_CODE=$(echo "$SESSION_CREATE_RESPONSE" | tail -n1)
SESSION_CREATE_BODY=$(echo "$SESSION_CREATE_RESPONSE" | sed '$d')

echo "Status: $SESSION_CREATE_HTTP_CODE"
echo "Response:"
echo "$SESSION_CREATE_BODY" | grep -A 10 "^{" | head -10 || echo "No JSON body"
echo ""

if [ "$SESSION_CREATE_HTTP_CODE" != "201" ]; then
  echo "❌ Create session failed! Status: $SESSION_CREATE_HTTP_CODE"
  echo "Full response:"
  echo "$SESSION_CREATE_BODY"
  exit 1
fi

echo "✅ Create session successful"
SESSION_ID=$(echo "$SESSION_CREATE_BODY" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Session ID: $SESSION_ID"
echo ""

# Test 4: GET /api/sessions
echo "4. Getting sessions list..."
SESSION_LIST_RESPONSE=$(curl -i -s -w "\n%{http_code}" -X GET "$API_URL/api/sessions" \
  -b /tmp/auth-cookies.txt)

SESSION_LIST_HTTP_CODE=$(echo "$SESSION_LIST_RESPONSE" | tail -n1)
SESSION_LIST_BODY=$(echo "$SESSION_LIST_RESPONSE" | sed '$d')

echo "Status: $SESSION_LIST_HTTP_CODE"
echo "Response:"
echo "$SESSION_LIST_BODY" | grep -A 10 "^\[" | head -10 || echo "No JSON body"
echo ""

if [ "$SESSION_LIST_HTTP_CODE" != "200" ]; then
  echo "❌ Get sessions failed! Status: $SESSION_LIST_HTTP_CODE"
  exit 1
fi

echo "✅ Get sessions successful"
echo ""
echo "=== All tests passed! ==="

