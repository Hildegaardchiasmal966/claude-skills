# Test Patterns - Culinary Advisor Project

This reference provides concrete examples of TDD patterns specific to the Culinary Advisor Next.js project. Load this file when writing tests to follow established patterns.

## Table of Contents

1. [Component Testing Patterns](#component-testing-patterns)
2. [API Route Testing](#api-route-testing)
3. [Utility Function Testing](#utility-function-testing)
4. [MSW Setup Patterns](#msw-setup-patterns)
5. [Supabase Mocking Patterns](#supabase-mocking-patterns)
6. [Async Testing Patterns](#async-testing-patterns)
7. [Helper Function Patterns](#helper-function-patterns)

---

## Component Testing Patterns

### Pattern: Client Component with User Interaction

Based on `ChatWelcome.test.tsx`:

```typescript
import { describe, test, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('ComponentName', () => {
  const mockCallback = vi.fn()

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('calls callback when user clicks button', async () => {
    const user = userEvent.setup()
    render(<ComponentName onAction={mockCallback} />)

    const button = screen.getByRole('button', { name: /action/i })
    await user.click(button)

    expect(mockCallback).toHaveBeenCalledWith(expectedArg)
  })

  test('validates input before submission', async () => {
    const user = userEvent.setup()
    render(<ComponentName onSubmit={mockCallback} />)

    const input = screen.getByPlaceholderText(/enter text/i)
    await user.type(input, '   ')  // Whitespace only

    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)

    expect(mockCallback).not.toHaveBeenCalled()
  })
})
```

### Pattern: Component with Form Submission

```typescript
test('submits form with trimmed input', async () => {
  const user = userEvent.setup()
  const mockOnSubmit = vi.fn()

  render(<FormComponent onSubmit={mockOnSubmit} />)

  const input = screen.getByPlaceholderText(/enter message/i)
  await user.type(input, '  test message  ')

  const submitButton = screen.getByRole('button', { name: /submit/i })
  await user.click(submitButton)

  expect(mockOnSubmit).toHaveBeenCalledWith('test message')
})
```

### Pattern: Component with Keyboard Interaction

```typescript
test('submits on Enter key press', async () => {
  const user = userEvent.setup()
  const mockOnSubmit = vi.fn()

  render(<InputComponent onSubmit={mockOnSubmit} />)

  const input = screen.getByPlaceholderText(/enter text/i)
  await user.type(input, 'Test message')
  await user.keyboard('{Enter}')

  expect(mockOnSubmit).toHaveBeenCalledWith('Test message')
})

test('does not submit on Enter with Shift key', async () => {
  const mockOnSubmit = vi.fn()
  render(<InputComponent onSubmit={mockOnSubmit} />)

  const input = screen.getByPlaceholderText(/enter text/i)
  fireEvent.change(input, { target: { value: 'Test' } })
  fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })

  expect(mockOnSubmit).not.toHaveBeenCalled()
})
```

### Pattern: Component with Loading States

```typescript
test('displays loading indicator during async operation', async () => {
  const user = userEvent.setup()
  const mockAction = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)))

  render(<ComponentName onAction={mockAction} />)

  const button = screen.getByRole('button', { name: /action/i })
  await user.click(button)

  // Loading indicator should appear
  expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()

  // Wait for operation to complete
  await waitFor(() => {
    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument()
  })
})
```

### Pattern: Component with Disabled States

```typescript
test('disables input when disabled prop is true', () => {
  render(<InputComponent disabled={true} />)

  const input = screen.getByPlaceholderText(/enter text/i)
  expect(input).toHaveProperty('disabled', true)
})

test('disables submit button when input is empty', () => {
  render(<FormComponent />)

  const submitButton = screen.getByRole('button', { name: /submit/i })
  expect(submitButton).toHaveProperty('disabled', true)
})

test('enables submit button when input has text', async () => {
  const user = userEvent.setup()
  render(<FormComponent />)

  const input = screen.getByPlaceholderText(/enter text/i)
  const submitButton = screen.getByRole('button', { name: /submit/i })

  await user.type(input, 'Test')

  expect(submitButton).toHaveProperty('disabled', false)
})
```

### Pattern: Dialog/Modal Components

Based on `RecipeModificationPopover.test.tsx`:

```typescript
test('opens dialog on trigger click', async () => {
  const user = userEvent.setup()

  render(
    <DialogComponent
      trigger={<button>Open</button>}
      onAction={vi.fn()}
    />
  )

  await user.click(screen.getByText('Open'))

  await waitFor(() => {
    expect(screen.getByText('Dialog Title', { selector: 'h2' })).toBeInTheDocument()
  })
})

test('resets state when dialog closes', async () => {
  const user = userEvent.setup()

  render(
    <DialogComponent
      trigger={<button>Open</button>}
      onAction={vi.fn()}
    />
  )

  // Open dialog
  await user.click(screen.getByText('Open'))

  const input = screen.getByPlaceholderText(/enter text/i)
  await user.type(input, 'Test message')

  // Close and reopen
  await user.click(screen.getByText('Open'))

  // Input should be empty (state was reset)
  const reopenedInput = screen.getByPlaceholderText(/enter text/i)
  await waitFor(() => {
    expect(reopenedInput).toHaveValue('')
  })
})
```

---

## API Route Testing

### Pattern: POST Route with MSW

```typescript
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { describe, test, expect, beforeAll, afterAll, afterEach } from 'vitest'

const server = setupServer(
  http.post('/api/recipes', async ({ request }) => {
    const body = await request.json()

    // Validate request
    if (!body.title) {
      return HttpResponse.json(
        { error: 'Title required' },
        { status: 400 }
      )
    }

    return HttpResponse.json(
      { id: 'new-123', ...body },
      { status: 201 }
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('creates recipe with valid data', async () => {
  const response = await fetch('/api/recipes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'New Recipe' })
  })

  expect(response.status).toBe(201)
  const data = await response.json()
  expect(data).toHaveProperty('id')
  expect(data.title).toBe('New Recipe')
})

test('rejects request with missing title', async () => {
  const response = await fetch('/api/recipes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  })

  expect(response.status).toBe(400)
  const data = await response.json()
  expect(data.error).toBe('Title required')
})
```

### Pattern: GET Route with Parameters

```typescript
const server = setupServer(
  http.get('/api/recipes/:id', ({ params }) => {
    const { id } = params

    if (id === '404') {
      return HttpResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      id,
      title: 'Mock Recipe',
      ingredients: []
    })
  })
)

test('fetches recipe by ID', async () => {
  const response = await fetch('/api/recipes/123')
  const data = await response.json()

  expect(data).toEqual({
    id: '123',
    title: 'Mock Recipe',
    ingredients: []
  })
})

test('returns 404 for non-existent recipe', async () => {
  const response = await fetch('/api/recipes/404')

  expect(response.status).toBe(404)
  const data = await response.json()
  expect(data.error).toBe('Recipe not found')
})
```

---

## Utility Function Testing

### Pattern: Pure Function Testing

```typescript
import { describe, test, expect } from 'vitest'
import { formatServings, calculateTotalTime } from './recipeUtils'

describe('formatServings', () => {
  test('formats single serving', () => {
    expect(formatServings(1)).toBe('1 serving')
  })

  test('formats multiple servings', () => {
    expect(formatServings(4)).toBe('4 servings')
  })

  test('handles zero servings', () => {
    expect(formatServings(0)).toBe('0 servings')
  })
})

describe('calculateTotalTime', () => {
  test('sums prep and cook time', () => {
    expect(calculateTotalTime('10 min', '20 min')).toBe('30 min')
  })

  test('handles hours', () => {
    expect(calculateTotalTime('1 hour', '30 min')).toBe('1 hour 30 min')
  })
})
```

### Pattern: Error Handling in Utilities

```typescript
describe('parseIngredients', () => {
  test('splits comma-separated ingredients', () => {
    const result = parseIngredients('eggs, flour, sugar')
    expect(result).toEqual(['eggs', 'flour', 'sugar'])
  })

  test('trims whitespace', () => {
    const result = parseIngredients('  eggs ,  flour  ')
    expect(result).toEqual(['eggs', 'flour'])
  })

  test('throws on empty string', () => {
    expect(() => parseIngredients('')).toThrow('Ingredients required')
  })

  test('throws on invalid format', () => {
    expect(() => parseIngredients(';;invalid;;')).toThrow('Invalid format')
  })
})
```

---

## MSW Setup Patterns

### Pattern: Server Setup with Multiple Handlers

Based on `RecipeModificationPopover.test.tsx`:

```typescript
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const modifiedRecipeJSON = {
  id: 'modified-123',
  title: 'Modified Recipe'
}

const server = setupServer(
  // SSE Streaming endpoint
  http.post('/api/chat', async () => {
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        const chunks = [
          'data: {"choices":[{"delta":{"content":"Here is"}}]}\n',
          'data: {"choices":[{"delta":{"content":" your modified"}}]}\n',
          'data: {"choices":[{"delta":{"content":" recipe!\\n\\n"}}]}\n',
          `data: {"choices":[{"delta":{"content":"\\`\\`\\`recipe-json\\n${JSON.stringify(modifiedRecipeJSON, null, 2)}\\n\\`\\`\\`"}}]}\n`,
          'data: [DONE]\n'
        ]

        chunks.forEach(chunk => {
          controller.enqueue(encoder.encode(chunk))
        })
        controller.close()
      }
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream' }
    })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### Pattern: Override Handler for Specific Test

```typescript
test('handles API error gracefully', async () => {
  // Override handler to return error
  server.use(
    http.post('/api/chat', () => {
      return HttpResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    })
  )

  render(<Component />)

  // Test error handling...
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })
})
```

---

## Supabase Mocking Patterns

### Pattern: Mock Supabase Client

```typescript
import { vi } from 'vitest'

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({
          data: { user: { id: 'test-user-123', email: 'test@example.com' } },
          error: null
        })
      ),
      getSession: vi.fn(() =>
        Promise.resolve({
          data: {
            session: {
              access_token: 'mock-access-token',
              refresh_token: 'mock-refresh-token'
            }
          },
          error: null
        })
      )
    },
    from: vi.fn((table) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({
              data: { id: '123', title: 'Mock Recipe' },
              error: null
            })
          )
        }))
      })),
      insert: vi.fn(() =>
        Promise.resolve({ data: { id: 'new-123' }, error: null })
      )
    }))
  }))
}))
```

### Pattern: Mock Auth Error

```typescript
test('handles authentication errors', async () => {
  const user = userEvent.setup()

  // Mock auth failure
  const mockSupabase = await import('@/lib/supabase/client')
  vi.mocked(mockSupabase.createClient).mockReturnValueOnce({
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({
          data: { user: null },
          error: { message: 'Unauthorized' }
        })
      ),
      getSession: vi.fn()
    }
  } as any)

  render(<Component />)

  // Trigger auth action
  await user.click(screen.getByRole('button'))

  // Verify error handling
  await waitFor(() => {
    expect(screen.getByText(/Authentication required/i)).toBeInTheDocument()
  })
})
```

---

## Async Testing Patterns

### Pattern: waitFor with Timeout

```typescript
test('loads data within timeout', async () => {
  render(<DataComponent />)

  // Loading state
  expect(screen.getByText('Loading...')).toBeInTheDocument()

  // Data loaded (with custom timeout)
  await waitFor(
    () => {
      expect(screen.getByText('Data loaded')).toBeInTheDocument()
    },
    { timeout: 5000 }
  )
})
```

### Pattern: findBy Queries (Implicit Wait)

```typescript
test('displays user message after submission', async () => {
  const user = userEvent.setup()
  render(<ChatComponent />)

  const input = screen.getByPlaceholderText(/message/i)
  await user.type(input, 'Hello')
  await user.keyboard('{Enter}')

  // findBy automatically waits and retries
  const message = await screen.findByText('Hello')
  expect(message).toBeInTheDocument()
})
```

### Pattern: Multiple Async Assertions

```typescript
test('streams response chunks correctly', async () => {
  const user = userEvent.setup()
  render(<StreamingComponent />)

  await user.click(screen.getByRole('button', { name: /start/i }))

  // Wait for streaming to complete
  await waitFor(
    () => {
      expect(screen.getByText(/complete/i)).toBeInTheDocument()
    },
    { timeout: 5000 }
  )

  // Verify final state
  expect(screen.getByText(/result/i)).toBeInTheDocument()
})
```

---

## Helper Function Patterns

### Pattern: Setup Helper for Repeated Rendering

Based on `RecipeModificationPopover.test.tsx`:

```typescript
/**
 * Renders component and opens dialog.
 * Returns user event instance and mock functions.
 */
async function setupComponent(
  onCallback = vi.fn()
): Promise<{
  user: ReturnType<typeof userEvent.setup>
  onCallback: ReturnType<typeof vi.fn>
}> {
  const user = userEvent.setup()

  render(
    <Component
      onCallback={onCallback}
      trigger={<button>Open</button>}
    />
  )

  await user.click(screen.getByText('Open'))

  await waitFor(() => {
    expect(screen.getByText('Component Title')).toBeInTheDocument()
  })

  return { user, onCallback }
}

// Usage in tests:
test('performs action', async () => {
  const { user, onCallback } = await setupComponent()

  // Test logic here...
})
```

### Pattern: Action Helper for Common Flows

```typescript
/**
 * Types message and submits form.
 * Waits for message to appear in UI.
 */
async function submitMessage(
  user: ReturnType<typeof userEvent.setup>,
  message: string
): Promise<void> {
  const input = screen.getByPlaceholderText(/enter message/i)
  await user.type(input, message)

  const sendButton = screen.getByRole('button', { name: /send/i })
  await user.click(sendButton)

  await screen.findByText(message)
}

// Usage:
test('sends multiple messages', async () => {
  const user = userEvent.setup()
  render(<ChatComponent />)

  await submitMessage(user, 'First message')
  await submitMessage(user, 'Second message')

  expect(screen.getByText('First message')).toBeInTheDocument()
  expect(screen.getByText('Second message')).toBeInTheDocument()
})
```

### Pattern: Assertion Helper for Repeated Checks

```typescript
/**
 * Waits for response to complete streaming.
 * Configurable timeout and expected text pattern.
 */
async function waitForResponse(
  expectedTextPattern: string | RegExp = /complete/i,
  timeout = 5000
): Promise<void> {
  await waitFor(
    () => {
      expect(screen.getByText(expectedTextPattern)).toBeInTheDocument()
    },
    { timeout }
  )
}

// Usage:
test('handles response', async () => {
  await submitMessage(user, 'Test')
  await waitForResponse(/success/i)
})
```

---

## Testing Checklist

Before completing any feature:

- [ ] Test written FIRST (before implementation)
- [ ] Test failed with expected error message
- [ ] Minimal code written to pass test
- [ ] Test passes
- [ ] All tests pass: `npm test`
- [ ] Build passes: `npm run build`
- [ ] MSW used for HTTP mocking (not vi.mock)
- [ ] Supabase client properly mocked
- [ ] Async operations use waitFor or findBy
- [ ] Helper functions extracted for repeated logic
- [ ] Tests grouped with describe blocks
- [ ] Coverage ≥80% on new code

---

## Quick Reference

```typescript
// Component Test
const user = userEvent.setup()
render(<Component />)
await user.click(screen.getByRole('button'))
await waitFor(() => {
  expect(screen.getByText('...')).toBeInTheDocument()
})

// MSW Setup
const server = setupServer(
  http.get('/api/data', () => HttpResponse.json({ data: '...' }))
)
beforeAll(() => server.listen())
afterAll(() => server.close())

// Supabase Mock
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({ /* mock client */ }))
}))

// Helper Function
async function setupTest() {
  const user = userEvent.setup()
  render(<Component />)
  return { user }
}
```
