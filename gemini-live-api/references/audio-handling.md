# Audio Handling in Gemini Live API

## Audio Format Requirements

### Input Audio (Microphone → API)
- **Format:** 16-bit PCM, little-endian
- **Sample Rate:** 16kHz (automatically resamples if different rate provided)
- **Channels:** Mono
- **MIME Type:** `audio/pcm;rate=16000`
- **Encoding:** Base64 string in request payload

### Output Audio (API → Speaker)
- **Format:** 16-bit PCM, base64-encoded
- **Sample Rate:** 24kHz
- **Channels:** Mono
- **Delivery:** Streamed incrementally in server responses

## Audio Processing Pipeline

### Input Pipeline (Sending to API)

```
Microphone
    ↓
Audio Input (various formats)
    ↓
Convert to Float32 or Int16
    ↓
Resample to 16kHz (if needed)
    ↓
Convert to Int16 PCM
    ↓
Encode to Base64
    ↓
Send via session.send_realtime_input()
```

### Output Pipeline (Receiving from API)

```
Receive base64 audio from API
    ↓
Decode base64 to bytes
    ↓
Convert bytes to Int16 array
    ↓
Convert to Float32 (for most audio libraries)
    ↓
Resample to target rate (if needed, usually keep 24kHz)
    ↓
Queue for playback
    ↓
Schedule playback without gaps
    ↓
Play through speakers
```

## Sending Audio to the API

### Python Example - File-based

```python
from pathlib import Path
from google import genai

# Read audio file (must be PCM format)
audio_bytes = Path("sample.pcm").read_bytes()

# Send to API
await session.send_realtime_input(
    audio=types.Blob(
        data=audio_bytes,
        mime_type="audio/pcm;rate=16000"
    )
)
```

### Python Example - Streaming with PyAudio

```python
import pyaudio
import asyncio
from scripts.audio_utils import pyaudio_callback_to_base64

p = pyaudio.PyAudio()

def callback(in_data, frame_count, time_info, status):
    # Convert to base64 and send to API
    base64_audio = pyaudio_callback_to_base64(in_data, frame_count)

    # Schedule async send
    asyncio.create_task(
        session.send_realtime_input(
            audio=types.Blob(data=base64_audio, mime_type="audio/pcm;rate=16000")
        )
    )

    return (in_data, pyaudio.paContinue)

stream = p.open(
    format=pyaudio.paFloat32,
    channels=1,
    rate=16000,
    input=True,
    frames_per_buffer=1024,
    stream_callback=callback
)
```

### JavaScript Example - Browser Microphone

```javascript
// Get microphone access
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const audioContext = new AudioContext({ sampleRate: 16000 });
const source = audioContext.createMediaStreamSource(stream);

// Process audio
const processor = audioContext.createScriptProcessor(4096, 1, 1);

processor.onaudioprocess = async (e) => {
  const inputData = e.inputBuffer.getChannelData(0);

  // Convert Float32 to Int16
  const int16Data = new Int16Array(inputData.length);
  for (let i = 0; i < inputData.length; i++) {
    int16Data[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
  }

  // Convert to base64
  const base64Audio = btoa(
    String.fromCharCode(...new Uint8Array(int16Data.buffer))
  );

  // Send to API
  await session.sendRealtimeInput({
    audio: { data: base64Audio, mimeType: 'audio/pcm;rate=16000' }
  });
};

source.connect(processor);
processor.connect(audioContext.destination);
```

## Receiving Audio from the API

### Python Example - Basic

```python
async for response in session.receive():
    if response.data:
        # response.data contains base64-encoded audio
        audio_base64 = response.data

        # Decode and play (see audio_utils.py)
        from scripts.audio_utils import convert_from_gemini_output_format
        audio_array = convert_from_gemini_output_format(audio_base64, 'float32')

        # Play with your audio library
        # sounddevice.play(audio_array, 24000)
```

### JavaScript Example - Gap-Free Playback

```javascript
const audioContext = new AudioContext({ sampleRate: 24000 });
let nextStartTime = audioContext.currentTime;

session.callbacks.onmessage = async (message) => {
  if (message.data) {
    // Decode base64 to audio buffer
    const binaryString = atob(message.data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Convert to Int16 then Float32
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    // Create audio buffer
    const audioBuffer = audioContext.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);

    // Schedule playback without gaps
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);

    const startTime = Math.max(audioContext.currentTime, nextStartTime);
    source.start(startTime);

    // Update next start time
    nextStartTime = startTime + audioBuffer.duration;
  }
};
```

## Voice Activity Detection (VAD)

### Automatic Mode (Default)

The API automatically detects when the user starts and stops speaking.

#### Configuration Options

```python
config = {
    "response_modalities": ["TEXT"],  # or ["AUDIO"]
    "realtime_input_config": {
        "automatic_activity_detection": {
            "start_of_speech_sensitivity": "HIGH",  # or "LOW"
            "end_of_speech_sensitivity": "HIGH",    # or "LOW"
            "start_of_speech_prefix_padding_duration_millis": 300,
            "end_of_speech_silence_duration_millis": 500
        }
    }
}
```

#### Sensitivity Levels

**Start-of-Speech:**
- `HIGH` - Triggers faster, may catch false positives
- `LOW` - More conservative, may miss quiet speech starts

**End-of-Speech:**
- `HIGH` - Ends quickly after silence, may cut off pauses
- `LOW` - Waits longer, captures natural pauses

**Prefix Padding:**
Captures audio before detected speech start (helps catch the first syllable).

**Silence Duration:**
How long to wait after silence before considering speech ended.

### Manual Mode

Disable automatic detection and control activity explicitly.

```python
config = {
    "response_modalities": ["TEXT"],
    "realtime_input_config": {
        "automatic_activity_detection": {"disabled": True}
    }
}

# Manually signal activity
await session.send_realtime_input(activity_start=types.ActivityStart())

# Send audio...
await session.send_realtime_input(
    audio=types.Blob(data=audio_data, mime_type="audio/pcm;rate=16000")
)

# Signal activity ended
await session.send_realtime_input(activity_end=types.ActivityEnd())
```

**When to use manual mode:**
- Custom VAD implementation
- Push-to-talk interfaces
- Precise control over when model responds
- Integration with existing speech detection

## Handling Interruptions

### Detecting Interruptions

The API sends an `interrupted` flag when user speech is detected during model output.

```python
async for response in session.receive():
    if response.server_content and response.server_content.interrupted:
        # User interrupted the model
        # Stop playback immediately
        audio_queue.clear()
        stop_current_playback()

    if response.data:
        # Queue new audio...
```

### JavaScript Interruption Handling

```javascript
let currentAudioSources = [];

session.callbacks.onmessage = (message) => {
  if (message.serverContent?.interrupted) {
    // Stop all queued audio immediately
    currentAudioSources.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Already stopped
      }
    });
    currentAudioSources = [];
    nextStartTime = audioContext.currentTime;
  }

  if (message.data) {
    // Create and schedule new audio
    const source = createAudioSource(message.data);
    currentAudioSources.push(source);
    source.start(nextStartTime);
    nextStartTime += source.buffer.duration;

    // Clean up finished sources
    source.onended = () => {
      const index = currentAudioSources.indexOf(source);
      if (index > -1) currentAudioSources.splice(index, 1);
    };
  }
};
```

### Interruption Best Practices

1. **Immediate Cessation:** Stop all queued audio immediately when interrupted
2. **Clear Buffers:** Remove all pending audio chunks from playback queue
3. **Reset Timing:** Reset scheduling variables (e.g., `nextStartTime`)
4. **Visual Feedback:** Show user that interruption was detected
5. **Graceful Resume:** Model will automatically respond to the interruption

## Audio Stream Management

### Sending audio_stream_end

When microphone input pauses for more than 1 second, send a stream end event to flush cached audio:

```python
await session.send_realtime_input(audio_stream_end=True)
```

**Why this matters:**
- Flushes audio processing pipeline
- Ensures all audio is processed
- Signals natural pause in conversation

### Chunking Strategies

**Small Chunks (100-200ms):**
- Lower latency
- More responsive
- Higher overhead
- Better for real-time conversation

**Large Chunks (500-1000ms):**
- Lower overhead
- More efficient bandwidth usage
- Slightly higher latency
- Good for batch processing

**Recommended:** 100-200ms chunks for live conversation.

```python
from scripts.audio_utils import create_audio_chunks

# Split audio into 100ms chunks
chunks = create_audio_chunks(audio_data, chunk_duration_ms=100)

for chunk in chunks:
    base64_chunk = encode_audio_to_base64(chunk)
    await session.send_realtime_input(
        audio=types.Blob(data=base64_chunk, mime_type="audio/pcm;rate=16000")
    )
```

## Transcription

Enable transcription to see text representation of audio.

### Input Audio Transcription

```python
config = {
    "response_modalities": ["AUDIO"],
    "input_audio_transcription": True
}

async for response in session.receive():
    if response.text:
        # Transcription of user's speech
        print(f"User said: {response.text}")
```

### Output Audio Transcription

```python
config = {
    "response_modalities": ["AUDIO"],
    "output_audio_transcription": True
}

async for response in session.receive():
    if response.text:
        # Transcription of model's speech
        print(f"Model said: {response.text}")

    if response.data:
        # Play audio...
```

**Benefits:**
- User feedback (show what's being heard/said)
- Accessibility
- Debugging
- Logging conversations

## Common Audio Issues & Solutions

### Issue: Choppy or Distorted Audio

**Causes:**
- Incorrect sample rate conversion
- Float32 ↔ Int16 conversion errors
- Audio buffer overflow/underflow

**Solutions:**
- Verify sample rates (16kHz input, 24kHz output)
- Use proper audio utilities for conversion
- Implement queue-based playback scheduling

### Issue: Audio Gaps or Overlaps

**Causes:**
- Improper playback scheduling
- Not tracking `nextStartTime` correctly
- Race conditions in audio scheduling

**Solutions:**
- Use `nextStartTime` pattern for gap-free playback
- Schedule audio sources sequentially
- Track and update timing variables atomically

### Issue: Delayed Responses

**Causes:**
- Large chunk sizes
- Network latency
- Processing overhead

**Solutions:**
- Reduce chunk size to 100-200ms
- Use WebSocket connection closer to API region
- Optimize audio processing pipeline

### Issue: Interruptions Not Working

**Causes:**
- Not checking `interrupted` flag
- Not stopping audio playback
- Not clearing audio queue

**Solutions:**
- Monitor `response.server_content.interrupted`
- Immediately stop all active audio sources
- Clear pending audio buffers

### Issue: Microphone Not Working

**Causes:**
- Incorrect permissions
- Wrong sample rate configuration
- Audio context not resumed (browser)

**Solutions:**
- Request microphone permissions properly
- Configure AudioContext with correct sample rate
- Call `audioContext.resume()` after user interaction

## Performance Optimization

### Minimize Latency

1. **Use small chunks:** 100-200ms for real-time feel
2. **Optimize encoding:** Pre-compute conversion tables
3. **Parallel processing:** Encode while sending previous chunk
4. **WebWorkers (browser):** Move encoding off main thread

### Reduce Bandwidth

1. **Silence detection:** Don't send silent chunks
2. **VAD threshold:** Adjust sensitivity to avoid sending noise
3. **Compression considerations:** API doesn't support compressed audio, but minimize data size through proper chunking

### Smooth Playback

1. **Buffer management:** Keep 100-200ms of audio buffered
2. **Timing precision:** Use high-resolution timers
3. **Interruption handling:** Implement clean cutoff logic
4. **Error recovery:** Handle missing chunks gracefully

## Audio Library Integration Examples

### PyAudio

```python
import pyaudio
from scripts.audio_utils import pyaudio_callback_to_base64

# Input stream
stream = p.open(
    format=pyaudio.paFloat32,
    channels=1,
    rate=16000,
    input=True,
    stream_callback=input_callback
)

# Output stream
output_stream = p.open(
    format=pyaudio.paFloat32,
    channels=1,
    rate=24000,
    output=True
)

# Play audio
output_stream.write(float32_audio.tobytes())
```

### sounddevice

```python
import sounddevice as sd
from scripts.audio_utils import sounddevice_to_base64

# Input callback
def input_callback(indata, frames, time, status):
    base64_audio = sounddevice_to_base64(indata, frames)
    # Send to API...

# Start input stream
sd.InputStream(
    samplerate=16000,
    channels=1,
    callback=input_callback
).start()

# Play output
sd.play(float32_audio, samplerate=24000)
```

### Web Audio API (JavaScript)

See complete examples in earlier sections of this document.

## Testing Audio Pipeline

### Loopback Test

Test your audio processing by sending recorded audio and verifying output:

```python
# 1. Record audio
test_audio = record_audio(duration=5)

# 2. Send to API
await session.send_realtime_input(
    audio=types.Blob(data=test_audio, mime_type="audio/pcm;rate=16000")
)

# 3. Receive and verify
async for response in session.receive():
    if response.text:
        print(f"Transcription: {response.text}")
        # Verify transcription matches expected content
```

### Echo Test

Build a simple echo implementation to test bidirectional audio:

```python
async for response in session.receive():
    if response.data:
        # Play received audio immediately
        play_audio(response.data)
```

This helps verify:
- Audio encoding/decoding
- Sample rate conversions
- Playback scheduling
- Latency measurements
