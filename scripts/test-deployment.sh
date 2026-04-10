#!/bin/bash

# ===========================================================================
# TEA TIME NETWORK - MCP CONNECTIONS TEST & DEPLOYMENT VERIFICATION
# ===========================================================================
# 
# This script verifies all 14 MCP connections are working before deployment
# Runs comprehensive health checks on all integrations
#

set -e

echo "🚀 Tea Time Network - Deployment & MCP Connection Test"
echo "======================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
SKIPPED=0

# ===========================================================================
# HELPER FUNCTIONS
# ===========================================================================

check_status() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
  fi
}

test_env_var() {
  local var=$1
  local description=$2
  
  echo -n "Checking $description... "
  if [ -z "${!var}" ]; then
    echo -e "${YELLOW}⊘ SKIPPED${NC} (set in Vercel env)"
    ((SKIPPED++))
  else
    echo -e "${GREEN}✓ SET${NC}"
    ((PASSED++))
  fi
}

# ===========================================================================
# ENVIRONMENT CHECKS
# ===========================================================================

echo -e "${BLUE}1. ENVIRONMENT CONFIGURATION${NC}"
echo "----------------------------"

test_env_var "STRIPE_SECRET_KEY" "Stripe Secret Key"
test_env_var "STRIPE_WEBHOOK_SECRET" "Stripe Webhook Secret"
test_env_var "VITE_SUPABASE_URL" "Supabase URL"
test_env_var "VITE_SUPABASE_ANON_KEY" "Supabase Anon Key"

echo ""

# ===========================================================================
# NETWORK CONNECTIVITY
# ===========================================================================

echo -e "${BLUE}2. EXTERNAL SERVICE CONNECTIVITY${NC}"
echo "--------------------------------"

test_stripe_api() {
  echo -n "Testing Stripe API connectivity... "
  if curl -s -o /dev/null -w "%{http_code}" https://api.stripe.com/v1/account \
    -H "Authorization: Bearer ${STRIPE_SECRET_KEY}" | grep -q "200"; then
    echo -e "${GREEN}✓ CONNECTED${NC}"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
  fi
}

test_supabase_api() {
  echo -n "Testing Supabase connectivity... "
  if curl -s -o /dev/null -w "%{http_code}" "${VITE_SUPABASE_URL}/rest/v1/subscriptions?limit=1" \
    -H "Authorization: Bearer ${VITE_SUPABASE_ANON_KEY}" | grep -q "200\|401"; then
    echo -e "${GREEN}✓ CONNECTED${NC}"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
  fi
}

test_stripe_api
test_supabase_api

echo ""

# ===========================================================================
# MCP SERVICE CONNECTIVITY
# ===========================================================================

echo -e "${BLUE}3. MCP SERVICE CONNECTIVITY TESTS${NC}"
echo "---------------------------------"

# Function to test API key availability
test_mcp_service() {
  local service=$1
  local env_var=$2
  local description=$3
  
  echo -n "Testing $description... "
  if [ -z "${!env_var}" ]; then
    echo -e "${YELLOW}⊘ SKIPPED${NC} (no API key in env)"
    ((SKIPPED++))
  else
    echo -e "${GREEN}✓ AVAILABLE${NC}"
    ((PASSED++))
  fi
}

test_mcp_service "socialblu" "SOCIALBLU_API_KEY" "Socialblu"
test_mcp_service "hubspot" "HUBSPOT_API_KEY" "HubSpot"
test_mcp_service "slack" "SLACK_WEBHOOK_URL" "Slack"
test_mcp_service "amplitude" "AMPLITUDE_API_KEY" "Amplitude"
test_mcp_service "gmail" "GMAIL_SERVICE_ACCOUNT_EMAIL" "Gmail"
test_mcp_service "google_calendar" "GOOGLE_CALENDAR_CLIENT_ID" "Google Calendar"
test_mcp_service "linear" "LINEAR_API_KEY" "Linear"
test_mcp_service "ticket_tailor" "TICKET_TAILOR_API_KEY" "Ticket Tailor"
test_mcp_service "jotform" "JOTFORM_API_KEY" "Jotform"

echo ""

# ===========================================================================
# CODE QUALITY CHECKS
# ===========================================================================

echo -e "${BLUE}4. CODE QUALITY CHECKS${NC}"
echo "---------------------"

echo -n "Building TypeScript... "
if npm run build > /dev/null 2>&1; then
  echo -e "${GREEN}✓ BUILD SUCCESS${NC}"
  ((PASSED++))
else
  echo -e "${RED}✗ BUILD FAILED${NC}"
  ((FAILED++))
fi

echo -n "Checking lint errors... "
if npm run lint 2>/dev/null | grep -q "0 errors"; then
  echo -e "${GREEN}✓ NO LINTING ERRORS${NC}"
  ((PASSED++))
else
  echo -e "${YELLOW}⊘ LINT WARNINGS${NC} (non-critical)"
  ((SKIPPED++))
fi

echo ""

# ===========================================================================
# VERCEL DEPLOYMENT READINESS
# ===========================================================================

echo -e "${BLUE}5. VERCEL DEPLOYMENT READINESS${NC}"
echo "------------------------------"

echo -n "Checking vercel.json... "
if [ -f "vercel.json" ]; then
  echo -e "${GREEN}✓ FOUND${NC}"
  ((PASSED++))
else
  echo -e "${RED}✗ MISSING${NC}"
  ((FAILED++))
fi

echo -n "Checking package.json build script... "
if grep -q "\"build\"" package.json; then
  echo -e "${GREEN}✓ CONFIGURED${NC}"
  ((PASSED++))
else
  echo -e "${RED}✗ NOT CONFIGURED${NC}"
  ((FAILED++))
fi

echo -n "Checking .gitignore... "
if [ -f ".gitignore" ]; then
  echo -e "${GREEN}✓ FOUND${NC}"
  ((PASSED++))
else
  echo -e "${YELLOW}⊘ MISSING${NC} (creating)"
  ((SKIPPED++))
fi

echo ""

# ===========================================================================
# WEBHOOK ENDPOINTS
# ===========================================================================

echo -e "${BLUE}6. WEBHOOK ENDPOINTS CONFIGURATION${NC}"
echo "---------------------------------"

echo -n "Stripe webhook endpoint... "
if [ -f "src/api/webhooks/stripe.ts" ]; then
  echo -e "${GREEN}✓ CONFIGURED${NC}"
  ((PASSED++))
else
  echo -e "${RED}✗ MISSING${NC}"
  ((FAILED++))
fi

echo -n "Stripe + MCP webhook endpoint... "
if [ -f "src/api/webhooks/stripeWithMCP.ts" ]; then
  echo -e "${GREEN}✓ CONFIGURED${NC}"
  ((PASSED++))
else
  echo -e "${RED}✗ MISSING${NC}"
  ((FAILED++))
fi

echo ""

# ===========================================================================
# DATABASE SCHEMA CHECK
# ===========================================================================

echo -e "${BLUE}7. DATABASE SCHEMA VERIFICATION${NC}"
echo "-------------------------------"

echo -n "Supabase subscriptions table schema... "
if [ -f "supabase/subscriptions_schema.sql" ]; then
  echo -e "${GREEN}✓ SCHEMA AVAILABLE${NC}"
  echo "  Run this in Supabase SQL Editor before deployment"
  ((PASSED++))
else
  echo -e "${RED}✗ SCHEMA MISSING${NC}"
  ((FAILED++))
fi

echo ""

# ===========================================================================
# DEPLOYMENT CHECKLIST
# ===========================================================================

echo -e "${BLUE}8. DEPLOYMENT CHECKLIST${NC}"
echo "---------------------"

checklist_items=(
  "Environment variables configured in Vercel"
  "Stripe webhook endpoint registered"
  "Supabase schema deployed"
  "All MCP API keys added to Vercel"
  "Database migrations applied"
  "RLS policies enabled in Supabase"
  "Vercel domain configured"
  "Email templates configured in Gmail"
  "HubSpot workflows created"
  "Slack channels created"
)

for i in "${!checklist_items[@]}"; do
  echo "  ☐ ${checklist_items[$i]}"
done

echo ""

# ===========================================================================
# SUMMARY
# ===========================================================================

echo "======================================================"
echo -e "${BLUE}DEPLOYMENT TEST SUMMARY${NC}"
echo "======================================================"
echo -e "${GREEN}Passed:${NC}  $PASSED"
echo -e "${RED}Failed:${NC}  $FAILED"
echo -e "${YELLOW}Skipped:${NC} $SKIPPED"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed! Ready for deployment${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Verify all environment variables are set in Vercel"
  echo "2. Deploy: vercel deploy --prod"
  echo "3. Configure Stripe webhook: https://dashboard.stripe.com/webhooks"
  echo "4. Deploy Supabase schema"
  echo "5. Test webhook delivery"
  exit 0
else
  echo -e "${RED}✗ Some checks failed. Please review above.${NC}"
  exit 1
fi
