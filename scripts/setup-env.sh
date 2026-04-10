#!/bin/bash

# ============================================================================
# TEA TIME NETWORK - ENVIRONMENT VARIABLE SETUP
# ============================================================================
#
# This script helps you set up the required environment variables for
# Tea Time Network to work properly.
#
# CRITICAL ISSUE FIXED:
# The app was trying to connect to hardcoded/incorrect Supabase credentials
# These MUST come from environment variables
#

echo "🔧 Tea Time Network - Environment Setup"
echo "========================================"
echo ""

# ============================================================================
# STEP 1: GET SUPABASE CREDENTIALS
# ============================================================================

echo "📋 STEP 1: Get Supabase Credentials"
echo "-----------------------------------"
echo ""
echo "You need to get your Supabase credentials:"
echo ""
echo "1. Go to: https://supabase.com/dashboard"
echo "2. Select your project"
echo "3. Click: Settings → API"
echo "4. Copy:"
echo "   - Project URL (looks like: https://xxxxx.supabase.co)"
echo "   - Anon Key (starts with eyJ...)"
echo ""

read -p "Press Enter when you have these values ready..."

echo ""
echo "Enter your Supabase Project URL:"
read -r VITE_SUPABASE_URL

echo ""
echo "Enter your Supabase Anon Key:"
read -r VITE_SUPABASE_ANON_KEY

# Validate inputs
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
  echo "❌ Error: Missing Supabase credentials"
  exit 1
fi

if ! [[ "$VITE_SUPABASE_URL" =~ \.supabase\.co ]]; then
  echo "❌ Error: Invalid Supabase URL (should contain .supabase.co)"
  exit 1
fi

echo "✅ Supabase credentials validated"

# ============================================================================
# STEP 2: CREATE .env.local FILE (Development)
# ============================================================================

echo ""
echo "📝 STEP 2: Create .env.local"
echo "----------------------------"
echo ""

if [ -f ".env.local" ]; then
  read -p ".env.local already exists. Overwrite? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Skipping .env.local creation"
  else
    create_env_local=true
  fi
else
  create_env_local=true
fi

if [ "$create_env_local" = true ]; then
  cat > .env.local << EOF
# ============================================================================
# TEA TIME NETWORK - ENVIRONMENT VARIABLES
# ============================================================================
# Created: $(date)
#
# CRITICAL: These variables must be set for the app to work!
# DO NOT commit this file to git
# ============================================================================

# SUPABASE CREDENTIALS (REQUIRED)
VITE_SUPABASE_URL=$VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# STRIPE (Optional for local development)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_XXXX_or_pk_live_XXXX

# MCP SERVICES (Optional for local development)
# SOCIALBLU_API_KEY=
# HUBSPOT_API_KEY=
# SLACK_WEBHOOK_URL=
# AMPLITUDE_API_KEY=
# etc...

# APP CONFIGURATION
VITE_APP_URL=http://localhost:5173
NODE_ENV=development
EOF

  echo "✅ Created .env.local with Supabase credentials"
  echo "   File location: $(pwd)/.env.local"
fi

# ============================================================================
# STEP 3: VERIFY SUPABASE SETUP
# ============================================================================

echo ""
echo "🔍 STEP 3: Verify Supabase Configuration"
echo "----------------------------------------"
echo ""

echo "Checking Supabase database..."
curl -s -f -X GET "$VITE_SUPABASE_URL/rest/v1/" \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
  -H "Accept: application/json" > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo "✅ Supabase connection successful"
else
  echo "❌ Supabase connection failed"
  echo "   Check that:"
  echo "   1. URL is correct"
  echo "   2. Anon key is correct"
  echo "   3. Project exists and is accessible"
  exit 1
fi

# ============================================================================
# STEP 4: DEPLOY SCHEMA (if needed)
# ============================================================================

echo ""
echo "🗄️  STEP 4: Database Schema"
echo "----------------------------"
echo ""
echo "The app requires the following tables in Supabase:"
echo "  ✓ auth.users (automatic with Supabase)"
echo "  ✓ profiles (must be created)"
echo "  ✓ subscriptions (must be created)"
echo "  ✓ subscription_events (must be created)"
echo ""
echo "To deploy the schema:"
echo "1. Go to: https://supabase.com/dashboard"
echo "2. Select your project"
echo "3. Click: SQL Editor → New query"
echo "4. Copy content from: ./supabase/fix-account-creation.sql"
echo "5. Paste and execute in the SQL editor"
echo ""
echo "Then verify with:"
echo "  SELECT COUNT(*) FROM profiles;"
echo ""

read -p "Have you deployed the schema? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "⚠️  Schema not deployed. Account creation may fail!"
else
  echo "✅ Schema deployment confirmed"
fi

# ============================================================================
# STEP 5: FINAL CHECK
# ============================================================================

echo ""
echo "✅ Environment Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Start development server: npm run dev"
echo "2. Open http://localhost:5173"
echo "3. Click 'Sign Up'"
echo "4. Create an account"
echo "5. Check email for verification link"
echo ""
echo "If signup still fails:"
echo "  - Check browser console for errors"
echo "  - Check Vercel/Supabase logs"
echo "  - Verify .env.local values are correct"
echo "  - Verify database schema is deployed"
echo ""

# ============================================================================
# CLEANUP
# ============================================================================

# Unset variables to prevent leaking credentials
unset VITE_SUPABASE_URL
unset VITE_SUPABASE_ANON_KEY

echo "🎉 Setup complete!"
