#!/bin/bash
# Route Manifest Script
# Fetches and displays all API routes from the backend

set -e

API_URL="${API_URL:-http://localhost:4000}"

echo "=== API Route Manifest ==="
echo "Fetching from: $API_URL/__routes"
echo ""

if ! curl -sf "$API_URL/__routes" > /dev/null 2>&1; then
  echo "❌ ERROR: Backend server not reachable at $API_URL"
  echo "Make sure the API server is running:"
  echo "  pnpm --filter @apps/api dev"
  exit 1
fi

response=$(curl -s "$API_URL/__routes")

if command -v jq &> /dev/null; then
  echo "$response" | jq -r '.routes[] | "\(.method)\t\(.path)"' | sort -k2
  echo ""
  echo "Total routes:" $(echo "$response" | jq '.routes | length')
else
  echo "$response"
  echo ""
  echo "⚠️  Install 'jq' for prettier output: brew install jq"
fi

echo ""
echo "✅ Route manifest fetched successfully"
