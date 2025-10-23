---
name: test-driven-development
description: Use when implementing any feature or bugfix in the Culinary Advisor Next.js project - write the test first, watch it fail, write minimal code to pass; ensures tests actually verify behavior by requiring failure first
---

# Test-Driven Development (TDD) - Culinary Advisor

## Overview

Write the test first. Watch it fail. Write minimal code to pass.

**Core principle:** If you didn't watch the test fail, you don't know if it tests the right thing.

**Violating the letter of the rules is violating the spirit of the rules.**

## When to Use

**Always:**
- New features (components, API routes, utilities)
- Bug fixes
- Refactoring
- Behavior changes

**Exceptions (ask user first):**
- Throwaway prototypes
- Generated code (Supabase types, migrations)
- Configuration files

Thinking "skip TDD just this once"? Stop. That's rationalization.

## The Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Write code before the test? Delete it. Start over.

**No exceptions:**
- Don't keep it as "reference"
- Don't "adapt" it while writing tests
- Don't look at it
- Delete means delete

Implement fresh from tests. Period.

## Red-Green-Refactor Cycle

### 🔴 RED - Write Failing Test

Write one minimal test showing what should happen.

**For React Components:**
```typescript
// components/SaveButton.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import SaveButton from './SaveButton'

describe('SaveButton', () => {
  test('saves recipe when clicked', async () => {
    const user = userEvent.setup()
    const mockOnSave = vi.fn()

    render(<SaveButton recipeId="123" onSave={mockOnSave} />)

    const button = screen.getByRole('button', { name: /save/i })
    await user.click(button)

    expect(mockOnSave).toHaveBeenCalledWith('123')
  })
})
```

**For Utilities:**
```typescript
// lib/utils/formatRecipe.test.ts
import { describe, test, expect } from 'vitest'
import { formatServings } from './formatRecipe'

describe('formatServings', () => {
  test('formats single serving', () => {
    expect(formatServings(1)).toBe('1 serving')
  })

  test('formats multiple servings', () => {
    expect(formatServings(4)).toBe('4 servings')
  })
})
```

**For API Routes:**
```typescript
// app/api/recipes/route.test.ts
import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  http.post('/api/recipes', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: 'new-123', ...body }, { status: 201 })
  })
)

beforeAll(() => server.listen())
afterAll(() => server.close())

test('creates recipe with valid data', async () => {
  const response = await fetch('/api/recipes', {
    method: 'POST',
    body: JSON.stringify({ title: 'Test Recipe' })
  })

  expect(response.status).toBe(201)
  const data = await response.json()
  expect(data).toHaveProperty('id')
  expect(data.title).toBe('Test Recipe')
})
```

**Requirements:**
- One behavior per test
- Clear descriptive name
- Real code (no mocks unless unavoidable)
- Follow project patterns (see `references/test-patterns.md`)

### ✅ Verify RED - Watch It Fail

**MANDATORY. Never skip.**

```bash
npm test path/to/test.test.ts
```

Confirm:
- Test fails (not errors)
- Failure message is expected ("SaveButton is not defined" or "formatServings is not a function")
- Fails because feature missing (not typos)

**Test passes?** You're testing existing behavior. Fix test.

**Test errors?** Fix error, re-run until it fails correctly.

### 🟢 GREEN - Minimal Code

Write simplest code to pass the test.

**Component Example:**
```typescript
// components/SaveButton.tsx
'use client'

interface SaveButtonProps {
  recipeId: string
  onSave: (id: string) => void
}

export default function SaveButton({ recipeId, onSave }: SaveButtonProps) {
  return (
    <button onClick={() => onSave(recipeId)}>
      Save Recipe
    </button>
  )
}
```

**Utility Example:**
```typescript
// lib/utils/formatRecipe.ts
export function formatServings(count: number): string {
  return count === 1 ? '1 serving' : `${count} servings`
}
```

Don't add features, refactor other code, or "improve" beyond the test.

### ✅ Verify GREEN - Watch It Pass

**MANDATORY.**

```bash
npm test path/to/test.test.ts
```

Confirm:
- Test passes
- All other tests still pass: `npm test`
- Build passes: `npm run build`
- Output pristine (no errors, warnings)

**Test fails?** Fix code, not test.

**Other tests fail?** Fix now before continuing.

### 🔵 REFACTOR - Clean Up

After green only:
- Remove duplication
- Improve names
- Extract helpers
- Add TypeScript types

Keep tests green. Don't add behavior.

**Example Refactor:**
```typescript
// After several tests, extract shared logic
export function formatServings(count: number): string {
  return formatCount(count, 'serving')
}

export function formatCookTime(minutes: number): string {
  return formatCount(minutes, 'minute')
}

function formatCount(n: number, unit: string): string {
  return n === 1 ? `1 ${unit}` : `${n} ${unit}s`
}
```

### Repeat

Next failing test for next feature.

## Project-Specific Testing Patterns

### Component Testing (Next.js)

Follow patterns in `testing-standards.md`:

**Server Components:**
```typescript
// Test by rendering and checking output
test('RecipePage displays recipe title', async () => {
  const recipe = { id: '1', title: 'Pasta Carbonara' }
  render(<RecipePage recipe={recipe} />)

  expect(screen.getByText('Pasta Carbonara')).toBeInTheDocument()
})
```

**Client Components:**
```typescript
// Test interactions with userEvent
test('toggles favorite on click', async () => {
  const user = userEvent.setup()
  render(<FavoriteButton recipeId="123" />)

  const button = screen.getByRole('button', { name: /favorite/i })
  await user.click(button)

  expect(button).toHaveAttribute('aria-pressed', 'true')
})
```

### API Mocking with MSW

**ALWAYS use MSW for HTTP/API mocking:**

```typescript
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  http.get('/api/recipes/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      title: 'Mock Recipe'
    })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

**NEVER use `vi.mock` for HTTP requests** - causes hoisting issues.

### Supabase Mocking

Mock Supabase client for unit tests:

```typescript
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({
              data: { id: '123', title: 'Test Recipe' },
              error: null
            })
          )
        }))
      }))
    }))
  }))
}))
```

### Test Organization

```typescript
describe('RecipeCard', () => {
  describe('Rendering', () => {
    test('displays recipe title', () => { /* ... */ })
    test('displays recipe image', () => { /* ... */ })
  })

  describe('User Interactions', () => {
    test('calls onSave when clicked', async () => { /* ... */ })
  })

  describe('Error States', () => {
    test('shows error message on failure', async () => { /* ... */ })
  })
})
```

## Why Order Matters

**"I'll write tests after to verify it works"**

Tests written after code pass immediately. Passing immediately proves nothing:
- Might test wrong thing
- Might test implementation, not behavior
- Might miss edge cases you forgot
- You never saw it catch the bug

Test-first forces you to see the test fail, proving it actually tests something.

**"Deleting X hours of work is wasteful"**

Sunk cost fallacy. Your choice now:
- Delete and rewrite with TDD (X more hours, high confidence)
- Keep it and add tests after (30 min, low confidence, likely bugs)

The "waste" is keeping code you can't trust.

**"TDD is dogmatic, being pragmatic means adapting"**

TDD IS pragmatic:
- Finds bugs before commit (faster than debugging after)
- Prevents regressions (tests catch breaks immediately)
- Documents behavior (tests show how to use code)
- Enables refactoring (change freely, tests catch breaks)

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Too simple to test" | Simple code breaks. Test takes 30 seconds. |
| "I'll test after" | Tests passing immediately prove nothing. |
| "Already manually tested" | Ad-hoc ≠ systematic. No record, can't re-run. |
| "Keep as reference" | You'll adapt it. That's testing after. Delete means delete. |
| "Need to explore first" | Fine. Throw away exploration, start with TDD. |
| "Test hard = design unclear" | Listen to test. Hard to test = hard to use. |

## Red Flags - STOP and Start Over

- Code before test
- Test after implementation
- Test passes immediately
- Can't explain why test failed
- Tests added "later"
- "I already manually tested it"
- "Keep as reference" or "adapt existing code"
- "This is different because..."

**All of these mean: Delete code. Start over with TDD.**

## Verification Checklist

Before marking work complete:

- [ ] Every new function/method/component has a test
- [ ] Watched each test fail before implementing
- [ ] Each test failed for expected reason (feature missing, not typo)
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass: `npm test`
- [ ] Build passes: `npm run build`
- [ ] Output pristine (no errors, warnings)
- [ ] Tests use real code (mocks only if unavoidable - MSW for HTTP)
- [ ] Edge cases and errors covered
- [ ] Coverage ≥80% on new code

Can't check all boxes? You skipped TDD. Start over.

## Project Commands

```bash
# Run specific test file
npm test path/to/file.test.ts

# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Type check
npx tsc --noEmit

# Build (must pass before committing)
npm run build
```

## When Stuck

| Problem | Solution |
|---------|----------|
| Don't know how to test | Write wished-for API. Write assertion first. Ask user. |
| Test too complicated | Design too complicated. Simplify interface. |
| Must mock everything | Code too coupled. Use dependency injection. |
| Test setup huge | Extract helpers. Still complex? Simplify design. |

## Integration with Quality Gates

This project has **pre-commit hooks** that enforce quality:

1. Type check: `npx tsc --noEmit`
2. Tests: `npm test`
3. Build: `npm run build`

**All must pass before committing.** TDD ensures they will.

## Final Rule

```
Production code → test exists and failed first
Otherwise → not TDD
```

No exceptions without user permission.

## Resources

- **Testing Patterns**: See `references/test-patterns.md` for project-specific examples
- **Testing Standards**: `.claude/modules/testing-standards.md` for comprehensive guide
- **Code Review**: `.claude/modules/code-review-standards.md` for quality checklist
