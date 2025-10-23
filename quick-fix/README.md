# Quick Fix Skill

Fast, efficient workflow for small changes, bug fixes, and UI tweaks using sub-agent orchestration.

## Overview

The Quick Fix skill provides a streamlined alternative to `/feature-dev` for changes that don't require full architectural planning. It uses intelligent sub-agent orchestration with model selection (Sonnet 4.5 for orchestration, Haiku 4.5 for workers) to efficiently handle:

- Styling adjustments
- Bug fixes
- Text/copy updates
- Small UI additions
- Typography improvements
- Consistency fixes

## Quick Start

```bash
# Make a styling change
/quick-fix Make the Save Recipe button match our primary button style

# Fix a bug
/quick-fix The Modify Recipe button isn't working when clicked

# Update typography
/quick-fix Increase line height in recipe descriptions for better readability

# Just ask what needs fixing
/quick-fix
```

## When to Use

### ✅ Use Quick Fix For:
- 1-2 file changes
- Clear, specific requests
- Styling/UI adjustments
- Small bug fixes
- Consistency updates
- Minor functionality tweaks

### ❌ Use Feature Dev Instead For:
- New features needing architecture
- 5+ files with complex dependencies
- Unclear requirements needing discovery
- Major refactoring
- System-wide changes

## Workflow

### Phase 1: Clarify
**Orchestrator (Sonnet 4.5)** understands your request and asks 1-3 focused follow-up questions if anything is unclear.

### Phase 2: Explore
**1 Explorer agent (Haiku 4.5)** quickly locates relevant files and understands current implementation.

### Phase 3: Plan
**2 Solution agents (Haiku 4.5)** work in parallel to create independent solutions. Orchestrator chooses the best based on simplicity and MVP principles.

### Phase 4: Implement
**1 Implementation agent (Haiku/Sonnet)** executes the approved plan, writes tests if needed, updates documentation if needed.

### Phase 5: Verify
**Orchestrator** runs appropriate verification (build/tests for code changes, skip for text-only).

## Agent Architecture

```
┌─────────────────────────────────────┐
│   Orchestrator (Sonnet 4.5)         │
│   - Coordinates workflow             │
│   - Makes decisions                  │
│   - Verifies quality                 │
└──────────┬──────────────────────────┘
           │
           ├─> Phase 2: Explorer Agent (Haiku 4.5)
           │   └─> Find files, understand context
           │
           ├─> Phase 3: Solution Agents (2x Haiku 4.5, parallel)
           │   └─> Independent plans, best chosen
           │
           ├─> Phase 4: Implementation Agent (Haiku/Sonnet)
           │   └─> Execute plan, tests, docs
           │
           └─> Phase 5: Verification
               └─> Build + tests (if code change)
```

### Model Selection Strategy

| Agent | Model | Why |
|-------|-------|-----|
| Orchestrator | Sonnet 4.5 | Decision-making, quality verification |
| Explorer | Haiku 4.5 | Cost-efficient file search |
| Solution (x2) | Haiku 4.5 | Cost-efficient planning |
| Implementation | Haiku 4.5 or Sonnet 4.5 | Haiku for simple, Sonnet for complex |

This optimizes cost while maintaining quality through strategic model selection.

## Quality Standards

All changes must:
- ✅ Follow `CLAUDE.md` project standards
- ✅ Pass build (`npm run build`)
- ✅ Pass tests (`npm test`)
- ✅ Include tests if behavior changes
- ✅ Update docs if theme/styles change
- ✅ Use proper TypeScript (no `any`)
- ✅ Follow Next.js patterns (Server/Client)
- ✅ Use correct Supabase client

## Examples

### Example 1: Styling Change

```
User: Make the Save Recipe button use our primary button style

Phase 1: Request is clear, no questions needed
Phase 2: Explorer finds RecipeCard.tsx, identifies Button component
Phase 3: Two plans generated:
  - Plan A: Use Button component (simpler)
  - Plan B: Create custom styles (more complex)
  → Chose Plan A (simpler, reuses existing)
Phase 4: Replaced inline div with Button component
Phase 5: Build passed, tests passed ✅

Result: 1 file changed, no tests needed (styling only)
```

### Example 2: Bug Fix

```
User: The Modify Recipe button isn't working

Phase 1: Ask "What should happen when clicked?"
         User: "Should open a dialog"
Phase 2: Explorer traces click handler, finds propagation issue
Phase 3: Two plans:
  - Plan A: Add stopPropagation (minimal)
  - Plan B: Restructure event system (complex)
  → Chose Plan A (simpler)
Phase 4: Added stopPropagation, wrote regression test
Phase 5: Build passed, tests passed ✅

Result: 1 file changed, 1 test added
```

### Example 3: Typography Improvement

```
User: Make recipe descriptions more readable

Phase 1: Ask "Any specific font or spacing preferences?"
         User: "Use Playfair for headings, increase line height"
Phase 2: Explorer finds recipe description component, theme
Phase 3: Two plans:
  - Plan A: Utility classes (reusable)
  - Plan B: Inline styles (quick)
  → Chose Plan A (follows patterns)
Phase 4: Applied Tailwind utility classes
Phase 5: Build passed ✅

Result: 1 file changed, no tests needed (styling)
```

## File Structure

```
.claude/
├── commands/
│   └── quick-fix.md          # Slash command entry point
└── skills/
    └── quick-fix/
        ├── SKILL.md           # Main skill documentation
        ├── README.md          # This file
        └── agents/
            ├── explorer.md    # File search agent
            ├── solution.md    # Planning agent
            └── implementation.md  # Execution agent
```

## Differences from Feature Dev

| Aspect | Quick Fix | Feature Dev |
|--------|-----------|-------------|
| **Phases** | 5 phases | 7 phases |
| **Agents** | 4 total (1 explorer, 2 solution, 1 impl) | 6+ total (2-3 each phase) |
| **Exploration** | Targeted search | Comprehensive analysis |
| **Planning** | 2 quick plans, choose best | Multiple architectures |
| **Implementation** | Single agent | Team coordination |
| **Use Case** | 1-2 file changes | Multi-file features |
| **Duration** | Minutes | 10-30+ minutes |
| **Cost** | Low (mostly Haiku) | Higher (mostly Sonnet) |

## Tips for Best Results

**Be specific when possible:**
- ✅ "Change button color to `bg-culinary-sage`"
- ❌ "Make it prettier"

**Provide context for bugs:**
- ✅ "When I click Save, nothing happens - should save to library"
- ❌ "Button broken"

**Reference existing patterns:**
- ✅ "Match the style of our primary CTA buttons"
- ✅ "Use the same hover effect as recipe cards"

**Trust the clarification phase:**
- If unclear, orchestrator will ask
- Answer questions for better results
- Don't overthink initial request

## Configuration

The skill uses agent definitions from `.claude/skills/quick-fix/agents/`:
- `explorer.md` - Haiku 4.5
- `solution.md` - Haiku 4.5
- `implementation.md` - Haiku 4.5 (can override to Sonnet)

Model selection happens automatically based on change complexity.

## Troubleshooting

**"Too many questions in Phase 1"**
- Be more specific in initial request
- Provide examples or context upfront

**"Solution seems too complex"**
- Review both plans in Phase 3
- Ask orchestrator to simplify
- Consider if this should be /feature-dev instead

**"Build failed after implementation"**
- Orchestrator will attempt auto-fix
- If complex, will ask for guidance
- Review error output provided

**"Should I write tests?"**
- Solution agents decide based on project standards
- Behavior changes → yes
- Styling only → no
- Bug fixes → usually yes

## Version

1.0.0

## Author

Created for Culinary Advisor Next.js project following skill-creator best practices.
