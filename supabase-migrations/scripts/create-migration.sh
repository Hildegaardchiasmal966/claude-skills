#!/bin/bash
# Creates a new Supabase migration file with timestamp

set -e

if [ -z "$1" ]; then
    echo "❌ Error: Migration name required"
    echo ""
    echo "Usage: bash create-migration.sh <migration_name>"
    echo "Example: bash create-migration.sh add_recipe_tags_table"
    exit 1
fi

MIGRATION_NAME="$1"

# Use supabase CLI to create migration
echo "Creating migration: $MIGRATION_NAME"
supabase migration new "$MIGRATION_NAME"

# Get the created file
MIGRATION_FILE=$(ls -t supabase/migrations/*.sql | head -1)

echo ""
echo "✅ Migration file created: $MIGRATION_FILE"
echo ""
echo "Next steps:"
echo "1. Edit the migration file with your SQL changes"
echo "2. Validate RLS: bash .claude/skills/supabase-migrations/scripts/validate-rls.sh $MIGRATION_FILE"
echo "3. Test locally: supabase db push"
echo "4. Update types: bash .claude/skills/supabase-migrations/scripts/update-types.sh"
