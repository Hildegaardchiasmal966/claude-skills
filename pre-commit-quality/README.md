# Pre-Commit Quality Skill

## What This Is

A Claude Skill that automates the pre-commit quality checklist from `.claude/modules/code-review-standards.md`.

## How It Works

This skill provides:
1. **Executable workflow** - Runs build, tests, and pattern validation
2. **References modules** - Points to existing documentation (no duplication)
3. **Simple checks** - Validates common anti-patterns in staged code

## Structure

```
pre-commit-quality/
├── SKILL.md                      # Main skill instructions
├── README.md                     # This file
└── scripts/
    └── validate-patterns.sh      # Pattern validation script
```

## Usage in Claude Code

When you're ready to commit, ask Claude:
- "Run pre-commit checks"
- "Validate my code before committing"
- "Check if my code meets quality standards"

Claude will:
1. Read the SKILL.md workflow
2. Execute `npm run build`
3. Execute `npm test`
4. Run `validate-patterns.sh` to check for anti-patterns
5. Report results and guide fixes if needed

## What It Checks

### Build
- TypeScript compiles without errors
- No type errors
- All imports resolve

### Tests
- All test suites pass
- No failing tests

### Patterns (via validate-patterns.sh)
- ❌ No `any` types (use specific types or `unknown`)
- ❌ No wrong Supabase client usage (server vs client)
- ⚠️  No `console.log` in production code

## Relationship to Modules

**This skill automates, modules document:**

- **Module**: `.claude/modules/code-review-standards.md` = What the standards ARE
- **Skill**: This skill = HOW to check if you followed them

The skill references modules but doesn't duplicate them.

## Manual Usage

You can also run the validation script directly:

```bash
# Make sure you have files staged for commit
git add .

# Run validation
bash .claude/skills/pre-commit-quality/scripts/validate-patterns.sh
```

## Extending This Skill

Keep it simple! To add more checks:
1. Add check to `validate-patterns.sh` (keep it simple, use grep)
2. Document the check in `SKILL.md` under "Common Issues"
3. Reference the relevant module for details

## Philosophy

- **Simple over complex**: Bash + grep beats sophisticated AST parsing
- **Automate over document**: Let Claude run the checks, not just read about them
- **Reference over duplicate**: Point to modules for "why", provide "how"
- **Solo entrepreneur**: Fast, practical, good enough

## Success Metrics

- ✅ Catches anti-patterns before commit
- ✅ Reduces PR review cycles
- ✅ Takes < 30 seconds to run
- ✅ Clear error messages when checks fail
- ✅ References existing documentation
