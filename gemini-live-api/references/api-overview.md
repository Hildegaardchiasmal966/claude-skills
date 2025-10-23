# Gemini Live API - Quick Reference

## Overview

The Gemini Live API is a WebSocket-based, stateful API enabling real-time bidirectional communication with Gemini models. It supports concurrent streaming of text, audio, and video inputs with incremental server responses.

## API Endpoint

```
wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent
```

**Note:** Uses `v1beta` versioning - API is in beta and may change.

## Supported Models

### Current Models (as of documentation date)

- **`gemini-2.0-flash-live-preview-04-09`** - General purpose live model
- **`gemini-2.5-flash-native-audio-preview-09-2025`** - Native audio architecture with best speech quality
- **`gemini-live-2.5-flash-preview`** - Latest flash model
- **`gemini-2.0-flash-live-001`** - Stable version for production

### Model Selection Guidance

**For Best Audio Quality:**
Use `gemini-2.5-flash-native-audio-preview-09-2025`
- Most natural and realistic-sounding speech
- Better multilingual performance
- Supports affective dialogue and proactive audio
- Supports thinking modes

**For Production Reliability:**
Use half-cascade models (e.g., `gemini-2.0-flash-live-001`)
- More reliable for tool integration
- Cascaded architecture (native audio input + TTS output)

## Authentication

### Standard API Key
For server-to-server implementations:
```python
from google import genai
client = genai.Client(api_key="YOUR_API_KEY")
```

### Ephemeral Tokens (Recommended for Client-to-Server)
For browser/mobile clients:
```python
# Backend generates token
token = client.auth.create_token(
    expire_time=datetime.now() + timedelta(minutes=30),
    new_session_expire_time=datetime.now() + timedelta(minutes=1),
    usage_limit=1
)

# Client uses token
client = genai.Client(api_key=token)
```

**Token Defaults:**
- Session initiation window: 60 seconds
- Message transmission window: 30 minutes
- Usage limit: 1 session

## Audio Specifications

### Input Audio
- **Format:** 16-bit PCM, little-endian
- **Sample Rate:** 16kHz (automatically resamples if different)
- **Channels:** Mono
- **MIME Type:** `audio/pcm;rate=16000`

### Output Audio
- **Sample Rate:** 24kHz
- **Format:** Base64-encoded PCM

## Session Limits

| Limit Type | Without Compression | With Compression |
|------------|---------------------|------------------|
| Audio-only sessions | 15 minutes | Unlimited |
| Audio+video sessions | 2 minutes | Extended |
| WebSocket connection | ~10 minutes | ~10 minutes |
| Context window (native audio) | 128k tokens | 128k tokens |
| Context window (half-cascade) | 32k tokens | 32k tokens |

## Core Capabilities

### Multimodal Input
- Text, audio, and video streams processed concurrently
- Real-time incremental content generation
- Low latency responses

### Voice Activity Detection (VAD)
- **Automatic Mode:** Built-in speech detection with interruption handling
- **Manual Mode:** Client sends explicit activity start/end signals
- Configurable sensitivity levels

### Function Calling
- Dedicated message types for tool execution
- Async/non-blocking function execution
- Tool response scheduling (INTERRUPT, WHEN_IDLE, SILENT)

### Session Management
- Token-based session resumption
- Automatic context compression
- Session state persistence (2 hours after termination)

### Audio Transcription
- Optional transcription of input audio (`input_audio_transcription`)
- Optional transcription of output audio (`output_audio_transcription`)

## Message Types

### Client → Server Messages

**Setup Message** (first message only):
```python
BidiGenerateContentSetup:
  - model: str
  - generation_config: GenerationConfig
  - system_instruction: Content
  - tools: List[Tool]
  - realtime_input_config: RealtimeInputConfig
  - session_resumption_handle: str (optional)
```

**Client Content** (interrupts generation):
```python
BidiGenerateContentClientContent:
  - turns: List[Content]
  - turn_complete: bool
```

**Realtime Input** (continuous streams):
```python
BidiGenerateContentRealtimeInput:
  - audio: Blob (base64 PCM)
  - video: Blob (optional)
  - activity_start: ActivityStart (manual mode)
  - activity_end: ActivityEnd (manual mode)
  - audio_stream_end: bool
```

**Tool Response**:
```python
BidiGenerateContentToolResponse:
  - function_responses: List[FunctionResponse]
```

### Server → Client Messages

- `setupComplete` - Configuration confirmed
- `serverContent` - Generated model output
- `toolCall` - Function execution request
- `toolCallCancellation` - Tool call aborted
- `goAway` - Disconnection notice with timeLeft
- `sessionResumptionUpdate` - Session state tokens

## Response Modalities

**Important:** Can only set ONE modality per session.

```python
# Text responses
config = {"response_modalities": ["TEXT"]}

# Audio responses
config = {"response_modalities": ["AUDIO"]}

# Cannot use both simultaneously
# config = {"response_modalities": ["TEXT", "AUDIO"]}  # ❌ NOT SUPPORTED
```

## Generation Configuration

### Supported Parameters
- `temperature` - Randomness (0.0-2.0, default ~1.0)
- `maxOutputTokens` - Max response length
- `topP` - Nucleus sampling threshold
- `topK` - Top-k sampling parameter
- `presencePenalty` - Penalize repeated topics
- `frequencyPenalty` - Penalize repeated tokens
- `responseModalities` - TEXT or AUDIO (pick one)
- `speechConfig` - Voice and language settings

### Unsupported Parameters
The following standard API parameters are NOT supported in Live API:
- `responseLogprobs`
- `responseMimeType`
- `logprobs`
- `responseSchema`
- `stopSequence`
- `routingConfig`
- `audioTimestamp`

## Usage Tracking

The API reports token usage in `UsageMetadata`:

```python
async for message in session.receive():
    if message.usage_metadata:
        print(f"Prompt tokens: {message.usage_metadata.prompt_token_count}")
        print(f"Response tokens: {message.usage_metadata.candidates_token_count}")
        print(f"Total: {message.usage_metadata.total_token_count}")

        # Modality-specific breakdown
        for detail in message.usage_metadata.response_tokens_details:
            print(f"{detail.modality}: {detail.token_count}")
```

Tracks:
- Prompt/response token counts
- Cached content tokens
- Modality-specific breakdowns (text, audio, video)
- Tool-use prompt tokens
- Thinking model tokens (where applicable)

## Error Codes

Common WebSocket closure codes:
- `1000` - Normal closure
- `1001` - Going away (server shutdown)
- `1006` - Abnormal closure (connection lost)
- `1008` - Policy violation (auth failure, rate limit)
- `1011` - Server error

## Rate Limits

Rate limits vary by model and tier. Check current limits at:
https://ai.google.dev/gemini-api/docs/rate-limits

**General guidance:**
- Standard tier: Lower concurrent sessions
- Pro tier: Higher throughput and concurrent sessions
- Enterprise: Custom limits

## SDK Installation

### Python
```bash
pip install google-genai
```

```python
from google import genai
client = genai.Client(api_key="YOUR_API_KEY")
```

### JavaScript/TypeScript
```bash
npm install @google/genai
```

```javascript
import { GoogleGenAI, Modality } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: "YOUR_API_KEY" });
```

## Quick Start Example

### Python
```python
from google import genai

client = genai.Client(api_key="YOUR_API_KEY")
model = "gemini-live-2.5-flash-preview"
config = {"response_modalities": ["TEXT"]}

async with client.aio.live.connect(model=model, config=config) as session:
    await session.send_client_content(
        turns={"role": "user", "parts": [{"text": "Hello!"}]},
        turn_complete=True
    )

    async for response in session.receive():
        if response.text:
            print(response.text, end="")
```

### JavaScript
```javascript
const session = await ai.live.connect({
  model: 'gemini-live-2.5-flash-preview',
  config: { responseModalities: [Modality.TEXT] },
  callbacks: {
    onmessage: (message) => {
      if (message.text) console.log(message.text);
    }
  }
});

await session.sendClientContent({
  turns: [{ role: 'user', parts: [{ text: 'Hello!' }] }],
  turnComplete: true
});
```

## Important Constraints

1. **One modality per session** - Cannot use TEXT and AUDIO simultaneously
2. **Session duration limits** - 15 min (audio only), 2 min (audio+video) without compression
3. **WebSocket timeout** - Connections close after ~10 minutes regardless of activity
4. **Resumption window** - 2 hours after session termination
5. **Context window** - 128k (native audio) or 32k (half-cascade) tokens
6. **Manual mode required** - Automatic tool response handling not supported

## Additional Resources

- **Official Documentation:** https://ai.google.dev/gemini-api/docs/live
- **API Reference:** https://ai.google.dev/api/live
- **Python SDK Docs:** https://googleapis.github.io/python-genai/
- **JS SDK Docs:** https://googleapis.github.io/js-genai/
- **Interactive Demo:** Google AI Studio (https://aistudio.google.com/)
- **Rate Limits:** https://ai.google.dev/gemini-api/docs/rate-limits
