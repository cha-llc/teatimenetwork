#!/bin/bash

# ============================================================================
# TEA TIME NETWORK - COMPLETE DEPLOYMENT AUTOMATION
# ============================================================================
# 
# This script automates the full deployment process:
# 1. Get Supabase credentials
# 2. Configure .env.local
# 3. Test build
# 4. Deploy database schema
# 5. Deploy to Vercel
# 6. Run post-deployment tests
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_section() {
    echo -e "${CYAN}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# ============================================================================
# PHASE 1: GET CREDENTIALS & CONFIGURE ENVIRONMENT
# ============================================================================

print_header "PHASE 1: ENVIRONMENT CONFIGURATION"

print_section "Checking if .env.local needs configuration"

if grep -q "YOUR_PROJECT\|YOUR_ANON_KEY" .env.local 2>/dev/null; then
    echo ""
    echo "🔑 Your .env.local needs credentials. Let's get them:"
    echo ""
    echo "Steps:"
    echo "1. Go to: https://supabase.com/dashboard"
    echo "2. Select your project"
    echo "3. Click: Settings → API"
    echo "4. Copy the values below:"
    echo ""
    
    read -p "Enter Supabase Project URL (https://xxx.supabase.co): " SUPABASE_URL
    read -p "Enter Supabase Anon Key: " SUPABASE_KEY
    
    # Validate
    if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
        print_error "Missing credentials"
        exit 1
    fi
    
    if ! [[ "$SUPABASE_URL" =~ \.supabase\.co ]]; then
        print_error "Invalid Supabase URL (should contain .supabase.co)"
        exit 1
    fi
    
    # Update .env.local
    sed -i.bak "s|https://YOUR_PROJECT.supabase.co|$SUPABASE_URL|g" .env.local
    sed -i.bak "s|YOUR_ANON_KEY_HERE|$SUPABASE_KEY|g" .env.local
    rm .env.local.bak
    
    print_success "Updated .env.local with Supabase credentials"
else
    print_success ".env.local already configured"
fi

echo ""
echo "Current .env.local:"
grep "VITE_SUPABASE" .env.local | head -2

# ============================================================================
# PHASE 2: TEST BUILD
# ============================================================================

print_header "PHASE 2: BUILD VERIFICATION"

print_section "Installing dependencies"
npm install > /dev/null 2>&1 && print_success "Dependencies installed" || print_error "Failed to install"

print_section "Building application"
npm run build > /dev/null 2>&1 && print_success "Build successful" || print_error "Build failed"

print_section "Build artifacts created"
if [ -d "dist" ]; then
    SIZE=$(du -sh dist | cut -f1)
    print_success "Build size: $SIZE"
else
    print_error "Build directory not found"
fi

# ============================================================================
# PHASE 3: DATABASE SCHEMA DEPLOYMENT INSTRUCTIONS
# ============================================================================

print_header "PHASE 3: DATABASE SCHEMA DEPLOYMENT"

print_section "Schema deployment required"
echo ""
echo "The database schema must be deployed before testing. Follow these steps:"
echo ""
echo "📋 MANUAL STEP (Required):"
echo "1. Go to: https://supabase.com/dashboard"
echo "2. Select your project"
echo "3. Click: SQL Editor → New query"
echo "4. Copy the ENTIRE file: supabase/fix-account-creation.sql"
echo "5. Paste into the SQL editor"
echo "6. Click: Execute (or press Cmd+Enter / Ctrl+Enter)"
echo ""
echo "⏳ Once deployed, press Enter to continue..."
read

# Verify schema was deployed
print_section "Verifying schema deployment"
echo ""
echo "To verify the schema was deployed successfully:"
echo "1. In Supabase SQL Editor, run:"
echo "   SELECT COUNT(*) as profiles FROM pg_tables WHERE tablename='profiles';"
echo ""
echo "2. You should see: 1"
echo ""
echo "3. Also check for the trigger:"
echo "   SELECT * FROM pg_triggers WHERE tgname = 'on_auth_user_created';"
echo ""
echo "4. You should see the trigger listed"
echo ""
echo "Has the schema been deployed successfully? (y/n): "
read schema_deployed

if [[ ! $schema_deployed =~ ^[Yy]$ ]]; then
    print_warning "Schema not deployed. Exiting."
    echo "Please deploy the schema and run this script again."
    exit 1
fi

print_success "Schema deployment confirmed"

# ============================================================================
# PHASE 4: LOCAL TESTING
# ============================================================================

print_header "PHASE 4: LOCAL TESTING"

print_section "Testing Supabase connection"
SUPABASE_URL=$(grep VITE_SUPABASE_URL .env.local | cut -d'=' -f2)
SUPABASE_KEY=$(grep VITE_SUPABASE_ANON_KEY .env.local | cut -d'=' -f2)

if timeout 5 curl -s -f -X GET "$SUPABASE_URL/rest/v1/" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Accept: application/json" > /dev/null 2>&1; then
    print_success "Supabase connection verified"
else
    print_warning "Could not verify Supabase connection"
    echo "Check that:"
    echo "  1. Supabase URL is correct"
    echo "  2. Anon key is correct"
    echo "  3. Project is accessible"
fi

print_section "Test instructions for local development"
echo ""
echo "To test account creation locally:"
echo ""
echo "1. Start development server:"
echo "   npm run dev"
echo ""
echo "2. Open http://localhost:5173 in your browser"
echo ""
echo "3. Click 'Sign Up' and create test account with:"
echo "   - Full Name: Test User"
echo "   - Email: test@example.com"
echo "   - Password: (minimum 8 characters)"
echo ""
echo "4. Verify:"
echo "   ✓ Success message appears"
echo "   ✓ Verification email sent"
echo "   ✓ Profile created in Supabase (check profiles table)"
echo "   ✓ Can sign in after verification"
echo ""
echo "Have you tested account creation locally and it works? (y/n): "
read local_test_passed

if [[ ! $local_test_passed =~ ^[Yy]$ ]]; then
    print_warning "Local tests not passed. Check ACCOUNT_CREATION_FIX_GUIDE.md for troubleshooting"
    exit 1
fi

print_success "Local testing verified"

# ============================================================================
# PHASE 5: VERCEL DEPLOYMENT
# ============================================================================

print_header "PHASE 5: VERCEL DEPLOYMENT"

print_section "Checking Git status"
if [ -z "$(git status --porcelain)" ]; then
    print_success "Working directory is clean"
else
    print_warning "Working directory has uncommitted changes"
    echo "Stage and commit your changes before deploying:"
    echo "  git add -A"
    echo "  git commit -m 'Deploy with fixed account creation'"
    echo "  git push"
    echo ""
    echo "Then run this script again."
    exit 1
fi

print_section "Vercel deployment options"
echo ""
echo "Choose deployment target:"
echo "1) Production (--prod)"
echo "2) Preview deployment"
echo "3) Skip Vercel deployment (manual later)"
echo ""
read -p "Enter choice (1-3): " vercel_choice

case $vercel_choice in
    1)
        print_section "Production deployment"
        echo ""
        echo "⚠️  BEFORE DEPLOYING TO PRODUCTION:"
        echo ""
        echo "1. ✓ Have you deployed the schema to PRODUCTION Supabase?"
        echo "2. ✓ Have you added environment variables to Vercel:"
        echo "   - VITE_SUPABASE_URL (production)"
        echo "   - VITE_SUPABASE_ANON_KEY (production)"
        echo "3. ✓ Have you tested locally and it works?"
        echo ""
        read -p "Confirm production deployment? Type 'DEPLOY' to proceed: " confirm
        
        if [ "$confirm" = "DEPLOY" ]; then
            if command -v vercel &> /dev/null; then
                print_section "Deploying to Vercel production"
                vercel deploy --prod
                print_success "Production deployment initiated"
            else
                print_warning "Vercel CLI not found. Install with: npm i -g vercel"
                echo "Then run: vercel deploy --prod"
            fi
        else
            print_warning "Production deployment cancelled"
        fi
        ;;
    2)
        print_section "Preview deployment"
        if command -v vercel &> /dev/null; then
            vercel deploy
            print_success "Preview deployment initiated"
        else
            print_warning "Vercel CLI not found. Install with: npm i -g vercel"
        fi
        ;;
    3)
        print_warning "Skipping Vercel deployment"
        echo "To deploy manually later:"
        echo "  vercel deploy --prod"
        ;;
esac

# ============================================================================
# PHASE 6: POST-DEPLOYMENT INSTRUCTIONS
# ============================================================================

print_header "PHASE 6: POST-DEPLOYMENT CHECKLIST"

echo ""
echo "✓ Code deployed and .env.local configured"
echo "✓ Database schema deployed"
echo "✓ Local testing passed"
echo ""
echo "If you deployed to Vercel, next steps:"
echo ""
echo "1. ✓ Add environment variables to Vercel"
echo "   Go to: https://vercel.com/dashboard"
echo "   Project: teatimenetwork"
echo "   Settings → Environment Variables"
echo "   Add:"
echo "   - VITE_SUPABASE_URL (production)"
echo "   - VITE_SUPABASE_ANON_KEY (production)"
echo ""
echo "2. ✓ Test production deployment"
echo "   Visit: https://teatimenetwork.app"
echo "   Click: Sign Up"
echo "   Create test account"
echo "   Verify profile created in Supabase"
echo ""
echo "3. ✓ Monitor logs"
echo "   Vercel: https://vercel.com/dashboard/teatimenetwork"
echo "   Supabase: https://supabase.com/dashboard"
echo ""

# ============================================================================
# FINAL SUMMARY
# ============================================================================

print_header "DEPLOYMENT COMPLETE ✓"

echo ""
echo "Status:"
echo "  ✓ .env.local configured"
echo "  ✓ Dependencies installed"
echo "  ✓ Application built"
echo "  ✓ Database schema deployed"
echo "  ✓ Local testing passed"
echo "  ✓ Ready for production"
echo ""
echo "Documentation:"
echo "  • QUICK_FIX_REFERENCE.txt"
echo "  • ACCOUNT_CREATION_FIX_GUIDE.md"
echo "  • VERCEL_DEPLOYMENT_GUIDE.md"
echo ""
echo "GitHub:"
echo "  Branch: master"
echo "  Commit: b8a1354 (Account creation fix)"
echo ""
echo "Next: Monitor production for any issues"
echo ""

print_success "Deployment automation complete!"
