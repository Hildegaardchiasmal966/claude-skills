#!/bin/bash
# Validates that a migration includes RLS policies

set -e

if [ -z "$1" ]; then
    echo "❌ Error: Migration file path required"
    echo ""
    echo "Usage: bash validate-rls.sh <migration_file>"
    echo "Example: bash validate-rls.sh supabase/migrations/20240101000000_add_table.sql"
    exit 1
fi

MIGRATION_FILE="$1"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "🔍 Validating RLS policies in: $MIGRATION_FILE"
echo ""

ERRORS=0

# Check if migration creates tables
HAS_CREATE_TABLE=$(grep -c "CREATE TABLE" "$MIGRATION_FILE" || true)

if [ "$HAS_CREATE_TABLE" -gt 0 ]; then
    echo "Found $HAS_CREATE_TABLE CREATE TABLE statement(s)"

    # Check for RLS enable
    HAS_ENABLE_RLS=$(grep -c "ENABLE ROW LEVEL SECURITY" "$MIGRATION_FILE" || true)

    if [ "$HAS_ENABLE_RLS" -eq 0 ]; then
        echo "❌ FAIL: No 'ENABLE ROW LEVEL SECURITY' statement found"
        echo ""
        echo "Add this for each table:"
        echo "  ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;"
        echo ""
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ RLS enabled on $HAS_ENABLE_RLS table(s)"
    fi

    # Check for policies
    HAS_POLICIES=$(grep -c "CREATE POLICY" "$MIGRATION_FILE" || true)

    if [ "$HAS_POLICIES" -eq 0 ]; then
        echo "❌ FAIL: No 'CREATE POLICY' statements found"
        echo ""
        echo "Add policies for each table. Example:"
        echo "  CREATE POLICY \"policy_name\""
        echo "    ON public.table_name"
        echo "    FOR SELECT"
        echo "    USING (user_id = auth.uid());"
        echo ""
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ Found $HAS_POLICIES policy statement(s)"
    fi
else
    echo "ℹ️  No CREATE TABLE statements found"
    echo "   (RLS validation only applies to new tables)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
    echo "✅ RLS validation passed"
    echo ""
    echo "Next steps:"
    echo "1. Test locally: supabase db push"
    echo "2. Update types: bash .claude/skills/supabase-migrations/scripts/update-types.sh"
    exit 0
else
    echo "❌ RLS validation failed with $ERRORS error(s)"
    echo ""
    echo "Fix the issues above before applying migration."
    echo "See .claude/modules/supabase-security.md for RLS patterns."
    exit 1
fi
