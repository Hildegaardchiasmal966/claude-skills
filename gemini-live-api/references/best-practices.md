# Best Practices for Gemini Live API

## Security

### 1. Never Expose API Keys in Client-Side Code

**❌ Bad Practice:**
```javascript
// NEVER do this in browser code!
const ai = new GoogleGenAI({ apiKey: 'AIzaSy...' });
```

**✅ Good Practice:**
Use ephemeral tokens for client-to-server implementations:

```javascript
// Backend endpoint
app.post('/api/generate-token', async (req, res) => {
  const user = authenticate(req);

  const token = await client.auth.create_token({
    expire_time: new Date(Date.now() + 30 * 60 * 1000),  // 30 min
    new_session_expire_time: new Date(Date.now() + 60 * 1000),  // 1 min
    usage_limit: 1
  });

  res.json({ token: token });
});

// Client uses token
const response = await fetch('/api/generate-token');
const { token } = await response.json();
const ai = new GoogleGenAI({ apiKey: token });
```

### 2. Validate Function Call Arguments

Always validate before executing user-influenced functions:

```python
async def handle_tool_call(call):
    if call.name == "send_email":
        # Validate email address
        if not is_valid_email(call.args.get("to")):
            return {"error": "Invalid email address"}

        # Check against allowlist
        if not is_allowed_recipient(call.args.get("to")):
            return {"error": "Recipient not authorized"}

        # Rate limit
        if exceeded_rate_limit(user_id):
            return {"error": "Rate limit exceeded"}

        # Execute safely
        return send_email(**call.args)
```

### 3. Sanitize User Input

```python
def sanitize_input(text: str) -> str:
    # Remove control characters
    text = ''.join(char for char in text if ord(char) >= 32 or char == '\n')

    # Limit length
    return text[:10000]

await session.send_client_content(
    turns={"role": "user", "parts": [{"text": sanitize_input(user_input)}]},
    turn_complete=True
)
```

### 4. Implement User Authentication

```python
class AuthenticatedSession:
    def __init__(self, user_id: str, client: genai.Client):
        self.user_id = user_id
        self.client = client
        self.session = None

    async def connect(self):
        # Verify user still authorized
        if not is_user_authorized(self.user_id):
            raise PermissionError("User not authorized")

        self.session = await self.client.aio.live.connect(...)
        return self.session
```

## Error Handling

### 1. Comprehensive Error Catching

```python
async def robust_session():
    try:
        async with client.aio.live.connect(...) as session:
            try:
                await session.send_client_content(...)

                async for response in session.receive():
                    try:
                        process_response(response)
                    except Exception as e:
                        logger.error(f"Response processing error: {e}")
                        # Continue processing other responses

            except WebSocketException as e:
                logger.error(f"WebSocket error: {e}")
                # Attempt reconnection with backoff

    except AuthenticationError as e:
        logger.error(f"Auth failed: {e}")
        # Refresh credentials

    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        # Graceful degradation
```

### 2. Handle Connection Failures

```javascript
async function connectWithRetry(config, maxAttempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const session = await ai.live.connect(config);
      console.log(`Connected on attempt ${attempt}`);
      return session;

    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error.message);

      if (attempt < maxAttempts) {
        const backoff = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${backoff}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
      }
    }
  }

  throw new Error(`Failed after ${maxAttempts} attempts: ${lastError.message}`);
}
```

### 3. Graceful Degradation

```python
async def send_with_fallback(session, content):
    try:
        await session.send_client_content(content, turn_complete=True)
    except Exception as e:
        logger.error(f"Failed to send content: {e}")

        # Fallback to simpler format
        try:
            await session.send_client_content(
                turns={"role": "user", "parts": [{"text": "Can you repeat that?"}]},
                turn_complete=True
            )
        except Exception as e2:
            logger.error(f"Fallback also failed: {e2}")
            # Show error to user
            show_error_message("Connection issue. Please try again.")
```

## Performance Optimization

### 1. Minimize Latency

**Use Small Audio Chunks:**
```python
# Good: 100-200ms chunks for real-time feel
chunks = create_audio_chunks(audio, chunk_duration_ms=100)

# Bad: Large chunks increase latency
chunks = create_audio_chunks(audio, chunk_duration_ms=1000)
```

**Parallel Processing:**
```python
import asyncio

async def process_audio_chunk(chunk):
    base64_audio = encode_audio_to_base64(chunk)
    await session.send_realtime_input(
        audio=types.Blob(data=base64_audio, mime_type="audio/pcm;rate=16000")
    )

# Process chunks in parallel (with rate limiting)
semaphore = asyncio.Semaphore(5)  # Max 5 concurrent

async def send_with_limit(chunk):
    async with semaphore:
        await process_audio_chunk(chunk)

await asyncio.gather(*[send_with_limit(chunk) for chunk in chunks])
```

**WebWorkers for Browser:**
```javascript
// Main thread
const worker = new Worker('audio-processor.js');

worker.postMessage({ audioData: rawAudio });

worker.onmessage = (e) => {
  const { base64Audio } = e.data;
  session.sendRealtimeInput({ audio: { data: base64Audio, mimeType: 'audio/pcm;rate=16000' } });
};

// audio-processor.js
onmessage = (e) => {
  const { audioData } = e.data;
  const base64Audio = processAndEncode(audioData);
  postMessage({ base64Audio });
};
```

### 2. Efficient Token Usage

**Enable Context Compression:**
```python
config = {
    "response_modalities": ["TEXT"],
    "context_window_compression": {
        "trigger_token_count": 100000  # Adjust based on use case
    }
}
```

**Monitor Usage:**
```python
async for response in session.receive():
    if response.usage_metadata:
        tokens = response.usage_metadata.total_token_count
        limit = 128000  # Model context window

        if tokens > limit * 0.8:
            logger.warning(f"Approaching token limit: {tokens}/{limit}")

        # Log for analytics
        track_token_usage(tokens)
```

**Optimize Prompts:**
```python
# Inefficient
system_instruction = """You are an assistant. You help users. You are helpful.
You answer questions. You are friendly. You are polite..."""

# Efficient
system_instruction = """You are a helpful, friendly assistant."""
```

### 3. Audio Playback Optimization

**Gap-Free Playback:**
```javascript
let nextStartTime = audioContext.currentTime;

function scheduleAudio(audioBuffer) {
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);

  const startTime = Math.max(audioContext.currentTime, nextStartTime);
  source.start(startTime);

  nextStartTime = startTime + audioBuffer.duration;
}
```

**Pre-buffering:**
```python
class AudioPlaybackManager:
    def __init__(self, buffer_duration_ms=200):
        self.buffer = []
        self.buffer_duration = buffer_duration_ms
        self.is_playing = False

    async def add_chunk(self, audio_chunk):
        self.buffer.append(audio_chunk)

        # Start playback when buffer reaches threshold
        if not self.is_playing and self.get_buffer_duration() >= self.buffer_duration:
            await self.start_playback()
```

## Reliability

### 1. Implement Health Checks

```python
async def health_check(session):
    """Verify session is still responsive"""
    try:
        await asyncio.wait_for(
            session.send_client_content(
                turns={"role": "user", "parts": [{"text": "ping"}]},
                turn_complete=True
            ),
            timeout=5.0
        )
        return True
    except asyncio.TimeoutError:
        logger.warning("Health check timeout")
        return False
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return False
```

### 2. Session Resumption

```python
class ResilientSession:
    def __init__(self, client):
        self.client = client
        self.resumption_token = None

    async def connect(self):
        try:
            session = await self.client.aio.live.connect(
                model="gemini-live-2.5-flash-preview",
                config={
                    "response_modalities": ["TEXT"],
                    "session_resumption": {"enabled": True}
                },
                session_resumption_handle=self.resumption_token
            )

            # Update token as received
            async for response in session.receive():
                if response.session_resumption_update:
                    self.resumption_token = response.session_resumption_update.resumption_handle
                    save_to_storage("resumption_token", self.resumption_token)

                yield response

        except Exception as e:
            logger.error(f"Session error: {e}")

            # Attempt resumption
            if self.resumption_token:
                logger.info("Attempting to resume session...")
                await self.connect()
```

### 3. Resource Cleanup

```python
class ManagedSession:
    def __init__(self, client):
        self.client = client
        self.session = None
        self.audio_stream = None

    async def __aenter__(self):
        self.session = await self.client.aio.live.connect(...)
        return self.session

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        # Always cleanup, even on error
        try:
            if self.audio_stream:
                self.audio_stream.stop()

            if self.session:
                await self.session.close()

        except Exception as e:
            logger.error(f"Cleanup error: {e}")

        return False  # Don't suppress exceptions
```

## Monitoring & Logging

### 1. Comprehensive Logging

```python
import logging
import time

class SessionLogger:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.start_time = time.time()
        self.metrics = {
            "messages_sent": 0,
            "messages_received": 0,
            "errors": 0,
            "tool_calls": 0
        }

    def log_send(self, content):
        self.metrics["messages_sent"] += 1
        logging.info(f"[{self.session_id}] Sent: {content[:100]}...")

    def log_receive(self, response):
        self.metrics["messages_received"] += 1

        if response.tool_call:
            self.metrics["tool_calls"] += len(response.tool_call.function_calls)

        if response.usage_metadata:
            logging.info(f"[{self.session_id}] Tokens: {response.usage_metadata.total_token_count}")

    def log_error(self, error):
        self.metrics["errors"] += 1
        logging.error(f"[{self.session_id}] Error: {error}")

    def get_summary(self):
        duration = time.time() - self.start_time
        return {
            **self.metrics,
            "duration_seconds": duration,
            "session_id": self.session_id
        }
```

### 2. Performance Metrics

```python
class LatencyTracker:
    def __init__(self):
        self.request_times = {}

    def mark_request(self, request_id):
        self.request_times[request_id] = time.time()

    def mark_response(self, request_id):
        if request_id in self.request_times:
            latency = time.time() - self.request_times[request_id]
            del self.request_times[request_id]

            # Log to monitoring system
            log_metric("gemini_live_latency_ms", latency * 1000)

            return latency
```

### 3. Error Rate Monitoring

```python
class ErrorRateMonitor:
    def __init__(self, window_size=100):
        self.window = deque(maxlen=window_size)

    def record_result(self, success: bool):
        self.window.append(1 if success else 0)

    def get_error_rate(self):
        if not self.window:
            return 0.0

        success_count = sum(self.window)
        return 1.0 - (success_count / len(self.window))

    def should_alert(self, threshold=0.1):
        return self.get_error_rate() > threshold
```

## Testing

### 1. Unit Test Audio Processing

```python
import pytest
from scripts.audio_utils import *

def test_float32_to_int16_conversion():
    float_audio = np.array([0.5, -0.5, 0.0], dtype=np.float32)
    int_audio = float32_to_int16(float_audio)

    assert int_audio.dtype == np.int16
    assert int_audio[0] == 16383  # 0.5 * 32767
    assert int_audio[1] == -16384  # -0.5 * 32768
    assert int_audio[2] == 0

def test_base64_encoding_decoding():
    original = np.array([100, -100, 200], dtype=np.int16)
    base64_str = encode_audio_to_base64(original)
    decoded = decode_base64_to_audio(base64_str)

    np.testing.assert_array_equal(original, decoded)
```

### 2. Integration Tests

```python
@pytest.mark.asyncio
async def test_session_connection():
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

    async with client.aio.live.connect(
        model="gemini-live-2.5-flash-preview",
        config={"response_modalities": ["TEXT"]}
    ) as session:
        # Verify connection established
        assert session is not None

        # Send test message
        await session.send_client_content(
            turns={"role": "user", "parts": [{"text": "Hello"}]},
            turn_complete=True
        )

        # Verify response
        response_received = False
        async for response in session.receive():
            if response.text:
                response_received = True
                break

        assert response_received
```

### 3. Load Testing

```python
import asyncio

async def load_test(num_concurrent_sessions=10):
    """Test with multiple concurrent sessions"""
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

    async def single_session_test():
        async with client.aio.live.connect(
            model="gemini-live-2.5-flash-preview",
            config={"response_modalities": ["TEXT"]}
        ) as session:
            await session.send_client_content(
                turns={"role": "user", "parts": [{"text": "Test"}]},
                turn_complete=True
            )

            async for response in session.receive():
                if response.server_content and response.server_content.generation_complete:
                    break

    # Run concurrent sessions
    await asyncio.gather(*[single_session_test() for _ in range(num_concurrent_sessions)])
```

## Common Pitfalls to Avoid

### 1. ❌ Not Handling Interruptions

```python
# Bad: Ignores interruptions
async for response in session.receive():
    if response.data:
        play_audio(response.data)
```

```python
# Good: Handles interruptions
async for response in session.receive():
    if response.server_content and response.server_content.interrupted:
        stop_all_audio()
        clear_audio_queue()

    if response.data:
        queue_audio(response.data)
```

### 2. ❌ Blocking the Event Loop

```python
# Bad: Synchronous I/O blocks event loop
def handle_tool_call(call):
    result = requests.get(f"https://api.example.com/data")  # Blocks!
    return result.json()
```

```python
# Good: Use async I/O
async def handle_tool_call(call):
    async with aiohttp.ClientSession() as session:
        async with session.get("https://api.example.com/data") as response:
            return await response.json()
```

### 3. ❌ Not Setting response_modalities

```python
# Bad: Unclear what format you want
config = {}  # Defaults may change
```

```python
# Good: Explicit modality selection
config = {"response_modalities": ["AUDIO"]}
```

### 4. ❌ Ignoring Token Limits

```python
# Bad: No monitoring
async for response in session.receive():
    process(response)
```

```python
# Good: Monitor and act
async for response in session.receive():
    if response.usage_metadata:
        if response.usage_metadata.total_token_count > 120000:
            # Approaching 128k limit
            await summarize_and_clear_context()
```

### 5. ❌ Not Cleaning Up Resources

```javascript
// Bad: No cleanup
const session = await ai.live.connect({...});
// Session left open
```

```javascript
// Good: Always cleanup
const session = await ai.live.connect({...});
try {
  // Use session
} finally {
  session.close();
  audioContext.close();
  mediaStream.getTracks().forEach(track => track.stop());
}
```

## Production Checklist

- [ ] Use ephemeral tokens for client-side apps
- [ ] Implement comprehensive error handling
- [ ] Add connection retry logic with exponential backoff
- [ ] Enable session resumption for mobile apps
- [ ] Monitor token usage and implement compression
- [ ] Log all errors and performance metrics
- [ ] Validate and sanitize all user inputs
- [ ] Implement rate limiting on function calls
- [ ] Handle interruptions properly
- [ ] Clean up all resources (sessions, audio contexts, streams)
- [ ] Test with various network conditions
- [ ] Monitor error rates and latency
- [ ] Implement graceful degradation
- [ ] Add health checks for long-running sessions
- [ ] Document all configuration choices
- [ ] Set up alerting for high error rates
- [ ] Test audio processing on target devices
- [ ] Verify WebSocket connection stability
- [ ] Implement user authentication
- [ ] Add usage analytics and monitoring
