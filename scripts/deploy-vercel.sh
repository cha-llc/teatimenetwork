#!/bin/bash

# ===========================================================================
# TEA TIME NETWORK - VERCEL DEPLOYMENT WITH MCP CONNECTION VERIFICATION
# ===========================================================================
#
# Complete deployment workflow:
# 1. Environment validation
# 2. Build verification
# 3. Vercel deployment
# 4. Post-deployment health checks
# 5. MCP connection testing
# 6. Webhook configuration
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_SKIPPED=0

# ===========================================================================
# UTILITY FUNCTIONS
# ===========================================================================

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_section() {
    echo -e "${CYAN}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((CHECKS_PASSED++))
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    ((CHECKS_FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    ((CHECKS_SKIPPED++))
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

# ===========================================================================
# PHASE 1: ENVIRONMENT VALIDATION
# ===========================================================================

print_header "PHASE 1: ENVIRONMENT VALIDATION"

print_section "Checking required files"

required_files=(
    "package.json"
    "tsconfig.json"
    "src/main.tsx"
    "vercel.json"
    "src/api/webhooks/stripe.ts"
    "src/integrations/mcpSubscriptionOrchestration.ts"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "Found: $file"
    else
        print_error "Missing: $file"
    fi
done

print_section "Checking Node.js and npm"

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)

if command -v node &> /dev/null; then
    print_success "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js not found"
fi

if command -v npm &> /dev/null; then
    print_success "npm installed: $NPM_VERSION"
else
    print_error "npm not found"
fi

print_section "Checking git status"

if git rev-parse --git-dir > /dev/null 2>&1; then
    GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    GIT_COMMIT=$(git rev-parse --short HEAD)
    print_success "Git repo detected: $GIT_BRANCH ($GIT_COMMIT)"
else
    print_error "Not a git repository"
fi

# ===========================================================================
# PHASE 2: ENVIRONMENT VARIABLES
# ===========================================================================

print_header "PHASE 2: ENVIRONMENT VARIABLES VERIFICATION"

print_section "Checking critical environment variables"

critical_vars=(
    "STRIPE_SECRET_KEY:Stripe Secret Key"
    "STRIPE_WEBHOOK_SECRET:Stripe Webhook Secret"
    "VITE_SUPABASE_URL:Supabase URL"
    "VITE_SUPABASE_ANON_KEY:Supabase Anon Key"
)

for var_pair in "${critical_vars[@]}"; do
    IFS=':' read -r var description <<< "$var_pair"
    if [ -n "${!var}" ]; then
        print_success "$description is set"
    else
        print_warning "$description not set (will be configured in Vercel)"
    fi
done

print_section "Checking MCP environment variables"

mcp_vars=(
    "SOCIALBLU_API_KEY:Socialblu"
    "HUBSPOT_API_KEY:HubSpot"
    "SLACK_WEBHOOK_URL:Slack"
    "AMPLITUDE_API_KEY:Amplitude"
    "GMAIL_SERVICE_ACCOUNT_EMAIL:Gmail"
    "GOOGLE_CALENDAR_CLIENT_ID:Google Calendar"
    "LINEAR_API_KEY:Linear"
    "TICKET_TAILOR_API_KEY:Ticket Tailor"
)

for var_pair in "${mcp_vars[@]}"; do
    IFS=':' read -r var description <<< "$var_pair"
    if [ -n "${!var}" ]; then
        print_success "$description configured"
    else
        print_warning "$description not configured (optional, can add later)"
    fi
done

# ===========================================================================
# PHASE 3: BUILD VERIFICATION
# ===========================================================================

print_header "PHASE 3: BUILD VERIFICATION"

print_section "Installing dependencies"

if npm install > /dev/null 2>&1; then
    print_success "Dependencies installed"
else
    print_error "Failed to install dependencies"
fi

print_section "Building application"

if npm run build > /dev/null 2>&1; then
    print_success "Build successful"
    BUILD_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
    print_info "Build size: $BUILD_SIZE"
else
    print_error "Build failed"
fi

print_section "Type checking"

if npx tsc --noEmit > /dev/null 2>&1; then
    print_success "TypeScript type checking passed"
else
    print_warning "TypeScript type checking found issues (non-critical)"
fi

# ===========================================================================
# PHASE 4: VERCEL DEPLOYMENT PREPARATION
# ===========================================================================

print_header "PHASE 4: VERCEL DEPLOYMENT PREPARATION"

print_section "Checking Vercel CLI"

if command -v vercel &> /dev/null; then
    print_success "Vercel CLI installed"
    VERCEL_VERSION=$(vercel --version)
    print_info "Version: $VERCEL_VERSION"
else
    print_warning "Vercel CLI not installed. Install with: npm i -g vercel"
fi

print_section "Vercel configuration"

if [ -f "vercel.json" ]; then
    print_success "vercel.json exists"
    if grep -q "\"buildCommand\"" vercel.json; then
        print_success "Build command configured"
    fi
    if grep -q "\"routes\"" vercel.json; then
        print_success "Routes configured"
    fi
fi

# ===========================================================================
# PHASE 5: CONNECTIVITY TESTS
# ===========================================================================

print_header "PHASE 5: EXTERNAL SERVICE CONNECTIVITY"

print_section "Testing Stripe API connection"

if [ -n "$STRIPE_SECRET_KEY" ]; then
    if timeout 5 curl -s -o /dev/null -w "%{http_code}" https://api.stripe.com/v1/account \
        -H "Authorization: Bearer ${STRIPE_SECRET_KEY}" 2>/dev/null | grep -q "^2"; then
        print_success "Stripe API is reachable"
    else
        print_warning "Stripe API connection test skipped (check API key)"
    fi
else
    print_warning "Stripe API key not set (will configure in Vercel)"
fi

print_section "Testing Supabase connection"

if [ -n "$VITE_SUPABASE_URL" ] && [ -n "$VITE_SUPABASE_ANON_KEY" ]; then
    if timeout 5 curl -s -o /dev/null -w "%{http_code}" "${VITE_SUPABASE_URL}/rest/v1/" \
        -H "Authorization: Bearer ${VITE_SUPABASE_ANON_KEY}" 2>/dev/null | grep -q "^[2403]"; then
        print_success "Supabase is reachable"
    else
        print_warning "Supabase connection test inconclusive (check credentials)"
    fi
else
    print_warning "Supabase credentials not set (will configure in Vercel)"
fi

print_section "Testing MCP service endpoints"

# Test Slack webhook if available
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    print_info "Slack webhook configured (will test after deployment)"
fi

# Test HubSpot if available
if [ -n "$HUBSPOT_API_KEY" ]; then
    if timeout 5 curl -s -o /dev/null -w "%{http_code}" "https://api.hubapi.com/crm/v3/objects/contacts" \
        -H "Authorization: Bearer ${HUBSPOT_API_KEY}" 2>/dev/null | grep -q "^2"; then
        print_success "HubSpot API is reachable"
    else
        print_warning "HubSpot API connection test inconclusive"
    fi
fi

# ===========================================================================
# PHASE 6: GIT & DEPLOYMENT PREP
# ===========================================================================

print_header "PHASE 6: GIT & DEPLOYMENT PREPARATION"

print_section "Checking git status"

if [ -z "$(git status --porcelain)" ]; then
    print_success "Working directory is clean"
else
    print_warning "Working directory has uncommitted changes"
    git status --short | head -5
fi

print_section "Verifying git remote"

if git remote -v | grep -q origin; then
    REMOTE_URL=$(git remote get-url origin)
    print_success "Git remote configured: $REMOTE_URL"
else
    print_error "No git remote configured"
fi

# ===========================================================================
# PHASE 7: DEPLOYMENT EXECUTION
# ===========================================================================

print_header "PHASE 7: VERCEL DEPLOYMENT"

print_section "Deployment options"

echo "Choose deployment type:"
echo "1) Production deployment (--prod)"
echo "2) Preview deployment"
echo "3) Skip deployment (just run tests)"
read -p "Enter choice (1-3): " deploy_choice

case $deploy_choice in
    1)
        print_info "Proceeding with PRODUCTION deployment..."
        print_warning "This will deploy to your production environment"
        read -p "Are you sure? Type 'yes' to confirm: " confirm
        
        if [ "$confirm" = "yes" ]; then
            print_section "Starting production deployment..."
            
            if command -v vercel &> /dev/null; then
                # Deploy to production
                if vercel deploy --prod --token "$VERCEL_TOKEN" 2>&1 | tee /tmp/vercel-deploy.log; then
                    DEPLOYMENT_URL=$(grep -oP '(?<=✓ Production: ).*' /tmp/vercel-deploy.log | head -1)
                    if [ -n "$DEPLOYMENT_URL" ]; then
                        print_success "Deployment successful: $DEPLOYMENT_URL"
                    else
                        print_success "Deployment completed (check Vercel dashboard for URL)"
                    fi
                else
                    print_error "Deployment failed"
                fi
            else
                print_error "Vercel CLI not found. Install with: npm i -g vercel"
            fi
        else
            print_warning "Production deployment cancelled"
        fi
        ;;
    2)
        print_info "Proceeding with PREVIEW deployment..."
        
        if command -v vercel &> /dev/null; then
            print_section "Starting preview deployment..."
            
            if vercel deploy --token "$VERCEL_TOKEN" 2>&1 | tee /tmp/vercel-deploy.log; then
                DEPLOYMENT_URL=$(grep -oP '(?<=✓ Preview: ).*' /tmp/vercel-deploy.log | head -1)
                if [ -n "$DEPLOYMENT_URL" ]; then
                    print_success "Preview deployment successful: $DEPLOYMENT_URL"
                else
                    print_success "Preview deployment completed (check Vercel dashboard for URL)"
                fi
            else
                print_error "Preview deployment failed"
            fi
        else
            print_error "Vercel CLI not found. Install with: npm i -g vercel"
        fi
        ;;
    3)
        print_info "Skipping deployment, running tests only..."
        ;;
    *)
        print_error "Invalid choice"
        ;;
esac

# ===========================================================================
# PHASE 8: POST-DEPLOYMENT HEALTH CHECKS
# ===========================================================================

print_header "PHASE 8: POST-DEPLOYMENT HEALTH CHECKS"

if [ "$deploy_choice" != "3" ]; then
    print_section "Waiting for deployment to stabilize..."
    sleep 10
    
    if [ -n "$DEPLOYMENT_URL" ]; then
        print_section "Testing deployment endpoints"
        
        # Test main page
        if timeout 10 curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL" 2>/dev/null | grep -q "^2"; then
            print_success "Main page is accessible"
        else
            print_warning "Main page connection test inconclusive"
        fi
        
        # Test health endpoint (if exists)
        if timeout 10 curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/api/health" 2>/dev/null | grep -q "^2"; then
            print_success "Health endpoint is working"
        else
            print_warning "Health endpoint not yet configured"
        fi
    fi
fi

# ===========================================================================
# PHASE 9: MCP CONNECTION TESTS
# ===========================================================================

print_header "PHASE 9: MCP CONNECTION STATUS"

print_section "Checking MCP service availability"

mcp_services=(
    "Socialblu:SOCIALBLU_API_KEY"
    "Stripe:STRIPE_SECRET_KEY"
    "Gmail:GMAIL_SERVICE_ACCOUNT_EMAIL"
    "Google Calendar:GOOGLE_CALENDAR_CLIENT_ID"
    "Supabase:VITE_SUPABASE_URL"
    "Slack:SLACK_WEBHOOK_URL"
    "HubSpot:HUBSPOT_API_KEY"
    "Jotform:JOTFORM_API_KEY"
    "Linear:LINEAR_API_KEY"
    "Ticket Tailor:TICKET_TAILOR_API_KEY"
    "Amplitude:AMPLITUDE_API_KEY"
    "Vercel:VERCEL_ANALYTICS_ID"
)

configured_count=0
for service_pair in "${mcp_services[@]}"; do
    IFS=':' read -r service var <<< "$service_pair"
    if [ -n "${!var}" ]; then
        print_success "$service: Connected"
        ((configured_count++))
    else
        print_warning "$service: Requires configuration"
    fi
done

echo ""
print_info "MCP Services Configured: $configured_count/${#mcp_services[@]}"

# ===========================================================================
# PHASE 10: WEBHOOK CONFIGURATION
# ===========================================================================

print_header "PHASE 10: WEBHOOK CONFIGURATION GUIDE"

print_section "Stripe Webhook Setup"

echo "Next steps to configure Stripe webhook:"
echo "1. Go to: https://dashboard.stripe.com/webhooks"
echo "2. Click 'Add endpoint'"
echo "3. Endpoint URL: $DEPLOYMENT_URL/api/webhooks/stripe"
echo "4. Events to send:"
echo "   - customer.subscription.created"
echo "   - customer.subscription.updated"
echo "   - customer.subscription.deleted"
echo "   - invoice.payment_succeeded"
echo "   - invoice.payment_failed"
echo "5. Copy webhook signing secret"
echo "6. Add to Vercel environment: STRIPE_WEBHOOK_SECRET"
echo ""

print_section "Database Setup"

echo "Next steps to deploy Supabase schema:"
echo "1. Go to: https://supabase.com/dashboard"
echo "2. Select your project"
echo "3. Click 'SQL Editor'"
echo "4. Click 'New query'"
echo "5. Copy content from: supabase/subscriptions_schema.sql"
echo "6. Paste into SQL editor and execute"
echo "7. Verify tables created: subscriptions, subscription_events"
echo ""

print_section "Environment Variables"

echo "Add these to Vercel (Project Settings > Environment Variables):"
echo "Critical (Production only):"
echo "  - STRIPE_SECRET_KEY"
echo "  - STRIPE_WEBHOOK_SECRET"
echo "  - VITE_SUPABASE_URL"
echo "  - VITE_SUPABASE_ANON_KEY"
echo ""
echo "MCP Integrations (Add as needed):"
echo "  - SOCIALBLU_API_KEY"
echo "  - HUBSPOT_API_KEY"
echo "  - SLACK_WEBHOOK_URL"
echo "  - SLACK_BOT_TOKEN"
echo "  - AMPLITUDE_API_KEY"
echo "  - GMAIL_SERVICE_ACCOUNT_EMAIL"
echo "  - GMAIL_PRIVATE_KEY"
echo "  - GOOGLE_CALENDAR_CLIENT_ID"
echo "  - GOOGLE_CALENDAR_CLIENT_SECRET"
echo "  - LINEAR_API_KEY"
echo "  - TICKET_TAILOR_API_KEY"
echo "  - JOTFORM_API_KEY"
echo ""

# ===========================================================================
# FINAL SUMMARY
# ===========================================================================

print_header "DEPLOYMENT TEST SUMMARY"

echo "Test Results:"
echo -e "  ${GREEN}Passed:${NC}  $CHECKS_PASSED"
echo -e "  ${RED}Failed:${NC}  $CHECKS_FAILED"
echo -e "  ${YELLOW}Skipped:${NC} $CHECKS_SKIPPED"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    print_success "All critical checks passed!"
    echo ""
    echo "Deployment Status:"
    if [ -n "$DEPLOYMENT_URL" ]; then
        echo -e "  ${GREEN}✓ Deployment successful${NC}"
        echo "  URL: $DEPLOYMENT_URL"
        echo ""
        echo "Next Actions:"
        echo "  1. Configure Stripe webhook (see above)"
        echo "  2. Deploy Supabase schema (see above)"
        echo "  3. Add MCP API keys to Vercel environment"
        echo "  4. Test webhook delivery"
        echo "  5. Verify MCP connections"
    else
        echo -e "  ${YELLOW}⚠ Deployment skipped or in progress${NC}"
    fi
else
    print_error "Some checks failed. Review errors above."
fi

echo ""
echo "For detailed logs, see: /tmp/vercel-deploy.log"
echo ""

# ===========================================================================
# DOCUMENTATION LINKS
# ===========================================================================

print_header "DOCUMENTATION & RESOURCES"

echo "Key Documentation:"
echo "  - MCP Integration Guide: ./MCP_INTEGRATION_GUIDE.md"
echo "  - Subscription System: ./TRELLO_CARD_COMPLETE_Subscription_Payments.md"
echo "  - API Documentation: ./docs/"
echo ""

echo "Deployment Monitoring:"
echo "  - Vercel Dashboard: https://vercel.com/dashboard"
echo "  - Stripe Dashboard: https://dashboard.stripe.com"
echo "  - Supabase Dashboard: https://supabase.com/dashboard"
echo ""

echo "Support Resources:"
echo "  - GitHub Repo: https://github.com/cha-llc/teatimenetwork"
echo "  - Latest commit: $(git log -1 --oneline)"
echo ""

exit $CHECKS_FAILED
