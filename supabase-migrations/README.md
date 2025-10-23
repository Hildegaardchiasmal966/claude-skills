# Supabase Migration Manager

## What This Is

A Claude Skill that guides safe database schema changes with automatic RLS validation and TypeScript type generation.

## Purpose

Ensures database migrations are:
- **Safe** - Tested locally before production
- **Secure** - RLS policies required on all tables
- **Type-safe** - TypeScript types auto-regenerated
- **Documented** - Clear workflow prevents mistakes

## How It Works

This skill provides:
1. **8-step workflow** - From creation to production
2. **Helper scripts** - Automate repetitive tasks
3. **RLS validation** - Catches security issues
4. **Type generation** - Keeps code in sync with schema
5. **Safety checklist** - Verify before applying

## Structure

```
supabase-migrations/
├── SKILL.md                    # Main workflow guide
├── README.md                   # This file
└── scripts/
    ├── create-migration.sh     # Creates timestamped migration
    ├── validate-rls.sh         # Checks for RLS policies
    └── update-types.sh         # Regenerates TypeScript types
```

## Usage in Claude Code

Ask Claude:
- "I need to add a recipe_tags table"
- "Help me create a migration for adding a column"
- "How do I add RLS policies to a table?"
- "Update TypeScript types after migration"

Claude will:
1. Load the 8-step workflow
2. Guide you through each step
3. Run validation scripts
4. Check RLS policies
5. Regenerate types
6. Verify safety checklist

## The 8-Step Workflow

### 1. Create Migration File
```bash
supabase migration new add_recipe_tags_table
```

### 2. Write Migration SQL
Edit file with schema changes + RLS policies

### 3. Validate RLS Policies
```bash
bash .claude/skills/supabase-migrations/scripts/validate-rls.sh [file]
```

### 4. Test Locally
```bash
supabase db push
```

### 5. Regenerate Types
```bash
bash .claude/skills/supabase-migrations/scripts/update-types.sh
```

### 6. Update Application Code
Search and update files using affected tables

### 7. Run Tests
```bash
npm run build && npm test
```

### 8. Apply to Production
```bash
supabase db push --remote
```

## Helper Scripts

### create-migration.sh
Creates a timestamped migration file.

**Usage:**
```bash
bash .claude/skills/supabase-migrations/scripts/create-migration.sh "migration_name"
```

**Output:**
- Creates `supabase/migrations/[timestamp]_migration_name.sql`
- Shows next steps

### validate-rls.sh
Validates that tables have RLS enabled and policies defined.

**Usage:**
```bash
bash .claude/skills/supabase-migrations/scripts/validate-rls.sh supabase/migrations/[file].sql
```

**Checks:**
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` present
- At least one `CREATE POLICY` statement
- Reports errors with fix suggestions

### update-types.sh
Regenerates TypeScript types from local database schema.

**Usage:**
```bash
bash .claude/skills/supabase-migrations/scripts/update-types.sh
```

**Output:**
- Updates `lib/supabase/types.ts`
- Shows next steps

## Safety Features

**Pre-flight checks:**
- RLS validation catches missing security policies
- Local testing prevents production failures
- Type generation catches TypeScript errors
- Build/test checks catch breaking changes

**Rollback strategy:**
- Reverse migrations documented
- Point-in-time recovery available
- Test locally first = safe production deploys

## Common Patterns Included

### Adding Tables
Complete example with RLS policies and indexes

### Modifying Columns
ALTER TABLE patterns

### RLS Policies
- User owns resource
- Public read, authenticated write
- Relationship-based access

## Relationship to Modules

**This skill automates, modules document:**

- **Module**: `.claude/modules/supabase-security.md` = RLS concepts and patterns
- **Skill**: This skill = Migration workflow with validation

The skill enforces security through automated checks, while the module explains why.

## Philosophy

- **Safety first** - Local testing prevents production disasters
- **Security enforced** - RLS validation catches missing policies
- **Type safety maintained** - Auto-regeneration keeps code in sync
- **Clear process** - 8-step workflow eliminates guesswork

No shortcuts. Every migration follows the same safe process.

## Success Metrics

- ✅ Zero production migration failures
- ✅ 100% RLS policy coverage on new tables
- ✅ TypeScript types always in sync with schema
- ✅ All migrations tested locally first
- ✅ Clear rollback strategy for every change

## Common Use Cases

**Adding a new feature table:**
1. Create migration
2. Add CREATE TABLE + RLS + indexes
3. Validate RLS
4. Test locally
5. Regenerate types
6. Build feature
7. Apply to production

**Adding a column to existing table:**
1. Create migration
2. Add ALTER TABLE
3. Test locally
4. Regenerate types
5. Update code
6. Apply to production

**Updating RLS policies:**
1. Create migration
2. DROP POLICY + CREATE POLICY
3. Test locally
4. Verify access patterns
5. Apply to production

## Next Steps

This skill is ready to use. When you need to change the database:
1. Ask Claude to guide you through a migration
2. Follow the 8-step workflow
3. Use helper scripts to automate tasks
4. Run safety checklist before production
5. Apply migration with confidence
