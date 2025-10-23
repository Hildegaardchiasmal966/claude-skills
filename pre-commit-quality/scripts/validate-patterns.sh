#!/bin/bash
# Validates common anti-patterns from code-review-standards.md
# Checks only staged files for commit

set -e

echo "🔍 Validating code patterns..."
echo ""

ERRORS=0

# Get list of staged TypeScript/TSX files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$' || true)

if [ -z "$STAGED_FILES" ]; then
    echo "✅ No TypeScript files to validate"
    exit 0
fi

echo "Checking files:"
echo "$STAGED_FILES" | sed 's/^/  - /'
echo ""

# Check 1: No 'any' types
echo "→ Checking for 'any' types..."
ANY_TYPES=$(echo "$STAGED_FILES" | xargs grep -n ": any\|<any>\|as any\|any\[\]" 2>/dev/null || true)

if [ -n "$ANY_TYPES" ]; then
    echo "❌ FAIL: Found 'any' types (use specific types or 'unknown')"
    echo ""
    echo "$ANY_TYPES" | sed 's/^/  /'
    echo ""
    echo "Fix: Replace 'any' with:"
    echo "  - Specific type: Recipe, User, etc."
    echo "  - 'unknown' if type is truly unknown"
    echo "  - Type guards for union types"
    echo ""
    ERRORS=$((ERRORS + 1))
else
    echo "✅ No 'any' types found"
fi

# Check 2: Correct Supabase client imports
echo "→ Checking Supabase client usage..."

# Find Server Components (files in app/ without 'use client')
for file in $STAGED_FILES; do
    if [[ "$file" == app/* ]] && ! grep -q "^'use client'" "$file" 2>/dev/null; then
        # This is a Server Component
        if grep -q "from '@/lib/supabase/client'" "$file" 2>/dev/null; then
            echo "❌ FAIL: Server Component using browser client"
            echo "  File: $file"
            echo ""
            echo "Fix: Use server client in Server Components:"
            echo "  import { createClient } from '@/lib/supabase/server'"
            echo ""
            ERRORS=$((ERRORS + 1))
        fi
    fi

    # Find Client Components (files with 'use client')
    if grep -q "^'use client'" "$file" 2>/dev/null; then
        # This is a Client Component
        if grep -q "from '@/lib/supabase/server'" "$file" 2>/dev/null; then
            echo "❌ FAIL: Client Component using server client"
            echo "  File: $file"
            echo ""
            echo "Fix: Use browser client in Client Components:"
            echo "  import { createClient } from '@/lib/supabase/client'"
            echo ""
            ERRORS=$((ERRORS + 1))
        fi
    fi
done

if [ $ERRORS -eq 0 ]; then
    echo "✅ Supabase client usage correct"
fi

# Check 3: No console.log in production code (excluding test files)
echo "→ Checking for console.log in production code..."
CONSOLE_LOGS=$(echo "$STAGED_FILES" | grep -v "test\|spec" | xargs grep -n "console\.log\|console\.error" 2>/dev/null || true)

if [ -n "$CONSOLE_LOGS" ]; then
    echo "⚠️  WARNING: Found console statements in production code"
    echo ""
    echo "$CONSOLE_LOGS" | sed 's/^/  /'
    echo ""
    echo "Note: console.log is fine in test files, but should be removed from production code"
    echo ""
    ERRORS=$((ERRORS + 1))
else
    echo "✅ No console statements in production code"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
    echo "✅ All pattern validations passed"
    echo ""
    exit 0
else
    echo "❌ Found $ERRORS pattern violation(s)"
    echo ""
    echo "Fix the issues above and run validation again."
    echo "See .claude/modules/code-review-standards.md for details."
    echo ""
    exit 1
fi
