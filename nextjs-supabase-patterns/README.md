# Next.js + Supabase Pattern Assistant

## What This Is

A Claude Skill that guides implementation of Next.js 15 App Router features with Supabase SSR, following patterns from your project modules.

## Purpose

Helps you make the right architectural decisions:
- **Server or Client Component?** Decision tree guides you
- **Which Supabase client?** Clear table shows correct import
- **How to pass data?** Security patterns prevent leaks
- **Common patterns?** Code templates ready to use

## How It Works

This skill provides:
1. **Decision trees** - Answer questions to get the right pattern
2. **Quick reference tables** - Fast lookup for common scenarios
3. **Code templates** - Copy-paste starting points
4. **Security checklists** - Verify you're following best practices
5. **References to modules** - Deep dive when needed

## Structure

```
nextjs-supabase-patterns/
├── SKILL.md       # Main guide with patterns and decisions
└── README.md      # This file
```

Simple and focused - no scripts needed, just guidance.

## Usage in Claude Code

Ask Claude:
- "I need to build a page that shows user recipes"
- "Should this be a Server or Client Component?"
- "Which Supabase client do I use in a Server Action?"
- "How do I pass user data to a Client Component?"

Claude will:
1. Load this skill's decision trees
2. Guide you to the right pattern
3. Provide code template to start from
4. Reference detailed docs when needed

## Common Scenarios Covered

### Server Component Patterns
- Fetching data from Supabase
- Displaying lists and details
- Parallel data fetching
- Error handling

### Client Component Patterns
- Interactive buttons and forms
- State management
- Real-time subscriptions
- User input handling

### Data Flow Patterns
- Server → Client data passing
- Security (only pass required fields)
- Type safety with Supabase types

### Server Action Patterns
- Form submissions
- Mutations with validation
- Cache revalidation
- Error handling

## Relationship to Modules

**This skill guides, modules document:**

- **Module**: `.claude/modules/nextjs-patterns.md` = Educational reference
- **Skill**: This skill = Implementation guide

The skill provides quick decisions and templates, while modules provide deep understanding.

## Quick Decision Tree

```
Need user interaction? (onClick, useState, etc.)
├─ YES → Client Component
└─ NO → Fetch data from DB?
    ├─ YES → Server Component
    └─ NO → Server Component (default)
```

## Quick Client Reference

| Environment | Import |
|------------|--------|
| Server Component | `@/lib/supabase/server` |
| Client Component | `@/lib/supabase/client` |
| Server Action | `@/lib/supabase/server` |
| Middleware | `@/lib/supabase/middleware` |

## Philosophy

- **Decide fast** - Decision trees get you to the right pattern quickly
- **Code fast** - Templates provide starting points
- **Verify fast** - Checklists ensure security
- **Learn when needed** - References point to deep docs

No over-engineering. Just clear guidance to build features correctly.

## Success Metrics

- ✅ Always choose correct component type
- ✅ Always use correct Supabase client
- ✅ Zero data security leaks
- ✅ Patterns match project standards
- ✅ Reduce "which pattern do I use?" questions to <30 seconds

## Next Steps

This skill is ready to use. When building features:
1. Ask Claude which pattern to use
2. Follow the skill's guidance
3. Copy template code
4. Customize for your feature
5. Run pre-commit checks before committing
