#!/bin/bash

# Script to create test users in Supabase
# Run this with: bash scripts/create_test_users.sh

# Set your Supabase project details
SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"
SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}"
SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"

echo "Creating test users in Supabase..."
echo "SUPABASE_URL: $SUPABASE_URL"

# Create test user 1: Shravani
curl -X POST "${SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "shravani@sonata-software.com",
    "password": "TestPassword123!",
    "email_confirm": true,
    "user_metadata": {
      "name": "Shravani",
      "assigned_users": ["SSNA-0014", "SSNA-0021"]
    }
  }'

echo ""
echo "User 1 created (or already exists): shravani@sonata-software.com / TestPassword123!"
echo ""

# Create test user 2: Venki
curl -X POST "${SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "venki@sonata-software.com",
    "password": "TestPassword123!",
    "email_confirm": true,
    "user_metadata": {
      "name": "Venki",
      "assigned_users": ["SSSG-0007", "OB-0022"]
    }
  }'

echo ""
echo "User 2 created (or already exists): venki@sonata-software.com / TestPassword123!"
echo ""
echo "✅ Test users setup complete!"
