#!/bin/bash

# Auth endpoint smoke test
# Tests: register → login → me (with cookie)

API_URL="http://localhost:4000"
EMAIL="test-$(date +%s)@example.com"
PASSWORD="testing123"

echo "=== Auth Endpoint Test ==="
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
REGISTER_BODY=$(echo "$REGISTER_RESPONSE" | sed '$d')

echo "Status: $REGISTER_HTTP_CODE"
echo "Response:"
echo "$REGISTER_BODY" | head -20
echo ""

if [ "$REGISTER_HTTP_CODE" != "201" ]; then
  echo "❌ Register failed!"
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
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

echo "Status: $LOGIN_HTTP_CODE"
echo "Response Headers:"
echo "$LOGIN_BODY" | grep -i "set-cookie\|content-type" || echo "No Set-Cookie found"
echo ""
echo "Response Body:"
echo "$LOGIN_BODY" | grep -A 10 "^{" | head -5
echo ""

if [ "$LOGIN_HTTP_CODE" != "200" ]; then
  echo "❌ Login failed!"
  exit 1
fi

echo "✅ Login successful"
echo ""

# Test 3: Get /me (with cookie)
echo "3. Getting /me with cookie..."
ME_RESPONSE=$(curl -i -s -w "\n%{http_code}" -X GET "$API_URL/api/auth/me" \
  -b /tmp/auth-cookies.txt)

ME_HTTP_CODE=$(echo "$ME_RESPONSE" | tail -n1)
ME_BODY=$(echo "$ME_RESPONSE" | sed '$d')

echo "Status: $ME_HTTP_CODE"
echo "Response:"
echo "$ME_BODY" | grep -A 10 "^{" | head -5
echo ""

if [ "$ME_HTTP_CODE" != "200" ]; then
  echo "❌ /me failed!"
  exit 1
fi

echo "✅ /me successful"
echo ""
echo "=== All tests passed! ==="

