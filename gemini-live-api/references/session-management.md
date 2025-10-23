# Session Management in Gemini Live API

## Session Lifecycle

A Gemini Live API session follows this lifecycle:

```
1. Connect (WebSocket established)
   ↓
2. Setup (configuration sent)
   ↓
3. setupComplete (server confirms)
   ↓
4. Active Session (bidirectional communication)
   ↓
5. Optional: goAway (server notification)
   ↓
6. Close (WebSocket terminated)
```

## Creating a Session

### Python

```python
from google import genai

client = genai.Client(api_key="YOUR_API_KEY")

async with client.aio.live.connect(
    model="gemini-live-2.5-flash-preview",
    config={
        "response_modalities": ["AUDIO"],
        "speech_config": {
            "voice_config": {"prebuilt_voice_config": {"voice_name": "Kore"}}
        }
    }
) as session:
    # Session is active here
    await session.send_client_content(...)

    async for response in session.receive():
        # Process responses
        pass

# Session automatically closes when exiting context manager
```

### JavaScript

```javascript
const session = await ai.live.connect({
  model: 'gemini-live-2.5-flash-preview',
  config: {
    responseModalities: [Modality.AUDIO],
    speechConfig: {
      voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
    }
  },
  callbacks: {
    onopen: () => console.log('Session opened'),
    onmessage: (message) => { /* handle messages */ },
    onerror: (error) => console.error('Session error:', error),
    onclose: (event) => console.log('Session closed:', event.reason)
  }
});

// Manually close when done
session.close();
```

## Session Configuration

### Initial Setup Message

The first message must be a `BidiGenerateContentSetup` containing:

```python
setup = {
    "model": "models/gemini-live-2.5-flash-preview",  # Required
    "generation_config": {
        "response_modalities": ["AUDIO"],
        "temperature": 1.0,
        "max_output_tokens": 2048
    },
    "system_instruction": {
        "parts": [{"text": "You are a helpful assistant..."}]
    },
    "tools": [tool1, tool2],
    "realtime_input_config": {
        "automatic_activity_detection": {
            "start_of_speech_sensitivity": "HIGH",
            "end_of_speech_sensitivity": "LOW"
        }
    }
}
```

### Mid-Session Configuration Updates

Most parameters can be updated mid-session (except the model):

```python
# Update generation config during active session
await session.send_client_content(
    turns=None,  # No new turns
    generation_config={
        "temperature": 0.7,
        "max_output_tokens": 1024
    }
)
```

**Updatable Parameters:**
- `generation_config` (temperature, max_output_tokens, etc.)
- `system_instruction`
- `tools`
- `realtime_input_config`

**Non-updatable:**
- `model` - Cannot change model mid-session

## Session Duration Limits

### Without Context Compression

| Session Type | Maximum Duration |
|--------------|------------------|
| Audio only | 15 minutes |
| Audio + Video | 2 minutes |
| WebSocket connection | ~10 minutes (regardless of activity) |

### With Context Compression

Enable unlimited session duration:

```python
config = {
    "response_modalities": ["AUDIO"],
    "context_window_compression": {
        "trigger_token_count": 100000  # Start compression at 100k tokens
    }
}
```

**How it works:**
- Sessions track token count against context window limit
- When `trigger_token_count` reached, older content is compressed
- Uses sliding-window mechanism to maintain recent context
- Enables effectively unlimited session duration

## Session Resumption

### Overview

Sessions can be resumed across multiple WebSocket connections, preserving conversation history and state.

**Key Points:**
- Resumption tokens valid for **2 hours** after session termination
- Maintains full conversation context
- Survives network interruptions
- Useful for mobile apps with spotty connectivity

### Enabling Session Resumption

```python
config = {
    "response_modalities": ["TEXT"],
    "session_resumption": {
        "enabled": True
    }
}

async with client.aio.live.connect(
    model="gemini-live-2.5-flash-preview",
    config=config
) as session:
    # Store resumption tokens as they arrive
    async for response in session.receive():
        if response.session_resumption_update:
            token = response.session_resumption_update.resumption_handle
            # Store this token securely (e.g., localStorage, database)
            save_resumption_token(token)
```

### Resuming a Session

```python
# Load stored token
resumption_token = load_resumption_token()

# Resume session with token
async with client.aio.live.connect(
    model="gemini-live-2.5-flash-preview",
    config=config,
    session_resumption_handle=resumption_token
) as session:
    # Session resumes with full history
    # Continue conversation from where you left off
    await session.send_client_content(
        turns={"role": "user", "parts": [{"text": "What were we talking about?"}]},
        turn_complete=True
    )
```

### JavaScript Example

```javascript
// Enable resumption
let latestResumptionToken = null;

const session = await ai.live.connect({
  model: 'gemini-live-2.5-flash-preview',
  config: {
    responseModalities: [Modality.TEXT],
    sessionResumption: { enabled: true }
  },
  callbacks: {
    onmessage: (message) => {
      if (message.sessionResumptionUpdate) {
        latestResumptionToken = message.sessionResumptionUpdate.resumptionHandle;
        localStorage.setItem('gemini_resumption_token', latestResumptionToken);
      }
    }
  }
});

// Later, resume session
const storedToken = localStorage.getItem('gemini_resumption_token');

const resumedSession = await ai.live.connect({
  model: 'gemini-live-2.5-flash-preview',
  config: { responseModalities: [Modality.TEXT] },
  sessionResumptionHandle: storedToken
});
```

## Handling goAway Messages

The server sends `goAway` messages before forcibly closing the connection:

```python
async for response in session.receive():
    if response.go_away:
        time_left = response.go_away.time_left  # Duration object

        print(f"Server closing in {time_left.seconds} seconds")
        print(f"Reason: {response.go_away.reason}")

        # Graceful shutdown logic
        if time_left.seconds > 5:
            # Save state, flush buffers
            await save_conversation_state()
            await flush_audio_buffers()

        # Optionally establish new session
        if should_continue:
            new_session = await client.aio.live.connect(...)
```

**Common goAway Reasons:**
- Session timeout (~10 min WebSocket limit)
- Server maintenance
- Resource constraints
- Policy violations

## Generation Complete Detection

Track when model finishes responding:

```python
async for response in session.receive():
    if response.server_content:
        if response.server_content.generation_complete:
            print("Model finished responding")
            # Safe to send next user message
            # Update UI to show "ready" state

        if response.server_content.interrupted:
            print("Response was interrupted by user")
            # Clear audio playback queue
```

**Use cases:**
- Turn-based conversation flow
- UI state management (show/hide loading indicators)
- Timing analytics
- Determining safe points to send new input

## WebSocket Connection Management

### Connection Callbacks

Monitor connection state with callbacks:

```javascript
const session = await ai.live.connect({
  model: 'gemini-live-2.5-flash-preview',
  config: { responseModalities: [Modality.TEXT] },
  callbacks: {
    onopen: () => {
      console.log('WebSocket opened');
      // Initialize UI, start microphone, etc.
    },
    onmessage: (message) => {
      console.log('Message received:', message);
    },
    onerror: (error) => {
      console.error('WebSocket error:', error);
      // Show error UI, attempt reconnection
    },
    onclose: (event) => {
      console.log('WebSocket closed');
      console.log('Code:', event.code);
      console.log('Reason:', event.reason);

      // Handle cleanup
      // Optionally reconnect with resumption token
    }
  }
});
```

### Reconnection Strategy

```javascript
async function connectWithRetry(maxRetries = 3) {
  let attempt = 0;
  let resumptionToken = localStorage.getItem('gemini_resumption_token');

  while (attempt < maxRetries) {
    try {
      const session = await ai.live.connect({
        model: 'gemini-live-2.5-flash-preview',
        config: { responseModalities: [Modality.TEXT] },
        sessionResumptionHandle: resumptionToken,
        callbacks: {
          onclose: (event) => {
            if (event.code !== 1000) {  // Not normal closure
              console.log('Abnormal closure, will retry');
            }
          }
        }
      });

      return session;

    } catch (error) {
      attempt++;
      console.log(`Connection attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      } else {
        throw new Error('Max connection retries reached');
      }
    }
  }
}
```

## State Persistence Patterns

### Conversation History

```python
class ConversationManager:
    def __init__(self):
        self.history = []
        self.resumption_token = None

    async def send_message(self, session, text):
        # Add to history
        self.history.append({"role": "user", "text": text})

        # Send to API
        await session.send_client_content(
            turns={"role": "user", "parts": [{"text": text}]},
            turn_complete=True
        )

    async def receive_response(self, session):
        full_response = ""

        async for response in session.receive():
            if response.session_resumption_update:
                self.resumption_token = response.session_resumption_update.resumption_handle

            if response.text:
                full_response += response.text

            if response.server_content and response.server_content.generation_complete:
                # Add to history
                self.history.append({"role": "model", "text": full_response})
                return full_response

        return full_response

    def save_state(self):
        return {
            "history": self.history,
            "resumption_token": self.resumption_token
        }

    def load_state(self, state):
        self.history = state["history"]
        self.resumption_token = state["resumption_token"]
```

### Session Metadata

```python
class SessionMetadata:
    def __init__(self):
        self.start_time = None
        self.total_tokens = 0
        self.turn_count = 0
        self.tools_called = []

    def update_from_response(self, response):
        if response.usage_metadata:
            self.total_tokens = response.usage_metadata.total_token_count

        if response.tool_call:
            for call in response.tool_call.function_calls:
                self.tools_called.append({
                    "name": call.name,
                    "timestamp": time.time()
                })

        if response.server_content and response.server_content.generation_complete:
            self.turn_count += 1
```

## Multi-Session Management

For applications handling multiple concurrent users:

```python
class SessionPool:
    def __init__(self, client):
        self.client = client
        self.sessions = {}  # user_id -> session

    async def get_or_create_session(self, user_id, config):
        if user_id in self.sessions:
            return self.sessions[user_id]

        session = await self.client.aio.live.connect(
            model="gemini-live-2.5-flash-preview",
            config=config
        )

        self.sessions[user_id] = session
        return session

    async def close_session(self, user_id):
        if user_id in self.sessions:
            await self.sessions[user_id].close()
            del self.sessions[user_id]

    async def close_all(self):
        for session in self.sessions.values():
            await session.close()
        self.sessions.clear()
```

## Resource Cleanup

### Proper Cleanup Pattern

```python
# Python context manager handles cleanup automatically
async with client.aio.live.connect(...) as session:
    # Use session
    pass
# Session closed, resources released

# Manual cleanup if needed
session = await client.aio.live.connect(...)
try:
    # Use session
    pass
finally:
    await session.close()
```

### JavaScript Cleanup

```javascript
const session = await ai.live.connect({ /* config */ });

try {
  // Use session
} finally {
  // Always close session
  session.close();

  // Release audio resources
  if (audioContext) {
    await audioContext.close();
  }

  // Stop media streams
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
  }
}
```

## Best Practices

1. **Use context managers (Python):** Ensures automatic cleanup
2. **Enable session resumption:** For better user experience across network issues
3. **Monitor goAway messages:** Implement graceful shutdown
4. **Track generation_complete:** Know when it's safe to send next message
5. **Implement reconnection logic:** Handle network interruptions
6. **Store resumption tokens securely:** Enable session persistence
7. **Monitor token usage:** Trigger compression before hitting limits
8. **Clean up resources:** Always close sessions and release media streams
9. **Handle errors gracefully:** Don't let connection errors crash the app
10. **Log session lifecycle events:** For debugging and analytics

## Common Patterns

### Long-Running Voice Assistant

```python
config = {
    "response_modalities": ["AUDIO"],
    "context_window_compression": {"trigger_token_count": 100000},
    "session_resumption": {"enabled": True}
}

async with client.aio.live.connect(model=model, config=config) as session:
    # Can run indefinitely with compression
    # Can resume if connection drops
    pass
```

### Turn-Based Conversation

```python
async def turn_based_conversation(session):
    while True:
        # Send user message
        user_input = await get_user_input()
        await session.send_client_content(
            turns={"role": "user", "parts": [{"text": user_input}]},
            turn_complete=True
        )

        # Wait for complete response
        async for response in session.receive():
            if response.text:
                print(response.text, end="")

            if response.server_content and response.server_content.generation_complete:
                break  # Ready for next turn
```

### Mobile App with Offline Support

```javascript
// Save resumption token
let token = null;

session.callbacks.onmessage = (message) => {
  if (message.sessionResumptionUpdate) {
    token = message.sessionResumptionUpdate.resumptionHandle;
    await saveToDevice('resumption_token', token);
  }
};

// On app restart
const savedToken = await loadFromDevice('resumption_token');
if (savedToken) {
  try {
    session = await ai.live.connect({
      model: 'gemini-live-2.5-flash-preview',
      config: { /* ... */ },
      sessionResumptionHandle: savedToken
    });
    // Resumed successfully
  } catch (error) {
    // Token expired or invalid, start new session
    session = await ai.live.connect({ /* ... */ });
  }
}
```
