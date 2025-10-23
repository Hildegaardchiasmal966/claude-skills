#!/bin/bash
# Regenerates TypeScript types from local Supabase database

set -e

echo "🔄 Updating TypeScript types from local database..."
echo ""

# Check if Supabase is running locally
if ! supabase status &>/dev/null; then
    echo "❌ Error: Local Supabase is not running"
    echo ""
    echo "Start Supabase first:"
    echo "  supabase start"
    exit 1
fi

# Generate types
echo "Generating types..."
supabase gen types typescript --local > lib/supabase/types.ts

if [ $? -eq 0 ]; then
    echo "✅ Types updated successfully"
    echo ""
    echo "Updated: lib/supabase/types.ts"
    echo ""
    echo "Next steps:"
    echo "1. Update application code to use new types"
    echo "2. Run build: npm run build"
    echo "3. Run tests: npm test"
    echo "4. Commit changes with updated types"
else
    echo "❌ Error: Failed to generate types"
    echo ""
    echo "Try:"
    echo "  supabase db reset"
    echo "  supabase db push"
    echo "  bash .claude/skills/supabase-migrations/scripts/update-types.sh"
    exit 1
fi
