# Architecture Patterns for Gemini Live API

## Implementation Approaches

There are two primary architectural patterns for implementing the Gemini Live API:

1. **Client-to-Server** - Client connects directly to Gemini
2. **Server-to-Server** - Your backend proxies between client and Gemini

## Client-to-Server Architecture

### Overview

```
User's Browser/Mobile App
        ↓ WebSocket
Gemini Live API
```

The client application connects directly to the Gemini Live API via WebSocket.

### Advantages

- **Lower latency** - Direct connection eliminates proxy hop
- **Reduced server costs** - No backend infrastructure for proxying
- **Simplified architecture** - Fewer moving parts
- **Better streaming performance** - No intermediate buffering

### Disadvantages

- **Security concerns** - Requires exposing API credentials to client
- **Limited control** - Cannot intercept or modify requests/responses
- **No request logging** - Harder to monitor usage
- **Client-side rate limiting** - More difficult to enforce

### Implementation with Ephemeral Tokens

**CRITICAL:** Never expose your standard API key in client code. Always use ephemeral tokens.

#### Backend (Python/Flask)

```python
from flask import Flask, jsonify, request
from google import genai
from datetime import datetime, timedelta
import os

app = Flask(__name__)
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

@app.route('/api/generate-token', methods=['POST'])
def generate_token():
    # Authenticate user
    user_id = authenticate_user(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    # Check rate limits
    if exceeded_rate_limit(user_id):
        return jsonify({"error": "Rate limit exceeded"}), 429

    # Generate ephemeral token
    token = client.auth.create_token(
        expire_time=datetime.now() + timedelta(minutes=30),
        new_session_expire_time=datetime.now() + timedelta(minutes=1),
        usage_limit=1,  # One session per token
        model_config={
            "model": "gemini-live-2.5-flash-preview",
            "config": {
                "response_modalities": ["AUDIO"]
            }
        }
    )

    # Log token generation
    log_token_issued(user_id, token)

    return jsonify({"token": token})
```

#### Frontend (JavaScript)

```javascript
// 1. Request ephemeral token from your backend
async function getEphemeralToken() {
  const response = await fetch('/api/generate-token', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userAuthToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to get ephemeral token');
  }

  const { token } = await response.json();
  return token;
}

// 2. Use token to connect to Gemini
async function connectToGemini() {
  const token = await getEphemeralToken();

  const ai = new GoogleGenAI({ apiKey: token });

  const session = await ai.live.connect({
    model: 'gemini-live-2.5-flash-preview',
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
      }
    },
    callbacks: {
      onopen: () => console.log('Connected to Gemini'),
      onmessage: handleMessage,
      onerror: (error) => console.error('Error:', error),
      onclose: (event) => console.log('Disconnected:', event.reason)
    }
  });

  return session;
}

// 3. Handle responses
function handleMessage(message) {
  if (message.text) {
    displayText(message.text);
  }

  if (message.data) {
    playAudio(message.data);
  }

  if (message.toolCall) {
    handleToolCall(message.toolCall);
  }
}
```

### Security Best Practices

1. **Token expiration:** Keep tokens short-lived (15-30 min max)
2. **Usage limits:** Restrict tokens to single sessions
3. **Model locking:** Lock token to specific model configuration
4. **User authentication:** Verify user before issuing tokens
5. **Rate limiting:** Limit tokens per user per time period
6. **Monitoring:** Track token usage and anomalies

## Server-to-Server Architecture

### Overview

```
User's Browser/Mobile App
        ↓ WebSocket/HTTP
Your Backend Server
        ↓ WebSocket
Gemini Live API
```

Your backend acts as a proxy between the client and Gemini.

### Advantages

- **Better security** - API key never exposed to client
- **Full control** - Intercept, modify, log all requests/responses
- **Centralized monitoring** - Track all usage from one place
- **Flexible rate limiting** - Enforce limits server-side
- **Data processing** - Pre-process inputs, post-process outputs
- **Multi-tenant** - Manage sessions for multiple users

### Disadvantages

- **Higher latency** - Additional network hop
- **Server costs** - Infrastructure for WebSocket proxying
- **More complexity** - Additional backend components
- **Scaling challenges** - WebSocket connections are stateful

### Implementation

#### Backend (Python/FastAPI + WebSockets)

```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from google import genai
import asyncio
import json
import os

app = FastAPI()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Track active sessions
sessions = {}

@app.websocket("/ws/chat/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()

    # Create Gemini session
    gemini_session = await client.aio.live.connect(
        model="gemini-live-2.5-flash-preview",
        config={
            "response_modalities": ["AUDIO"],
            "speech_config": {
                "voice_config": {"prebuilt_voice_config": {"voice_name": "Kore"}}
            }
        }
    )

    sessions[user_id] = gemini_session

    try:
        # Create tasks for bidirectional streaming
        receive_task = asyncio.create_task(receive_from_client(websocket, gemini_session))
        send_task = asyncio.create_task(send_to_client(websocket, gemini_session))

        # Wait for either to complete
        await asyncio.gather(receive_task, send_task)

    except WebSocketDisconnect:
        print(f"Client {user_id} disconnected")

    finally:
        # Cleanup
        await gemini_session.close()
        del sessions[user_id]

async def receive_from_client(websocket: WebSocket, gemini_session):
    """Forward messages from client to Gemini"""
    try:
        while True:
            # Receive from client
            data = await websocket.receive_json()

            # Process/validate message
            message_type = data.get("type")

            if message_type == "client_content":
                await gemini_session.send_client_content(
                    turns=data.get("turns"),
                    turn_complete=data.get("turn_complete", True)
                )

            elif message_type == "realtime_input":
                await gemini_session.send_realtime_input(
                    audio=data.get("audio")
                )

            elif message_type == "tool_response":
                await gemini_session.send_tool_response(
                    function_responses=data.get("function_responses")
                )

    except WebSocketDisconnect:
        pass

async def send_to_client(websocket: WebSocket, gemini_session):
    """Forward responses from Gemini to client"""
    try:
        async for response in gemini_session.receive():
            # Convert response to JSON-serializable format
            response_data = {}

            if response.text:
                response_data["text"] = response.text

            if response.data:
                response_data["audio"] = response.data

            if response.tool_call:
                response_data["tool_call"] = serialize_tool_call(response.tool_call)

            if response.server_content:
                response_data["interrupted"] = response.server_content.interrupted
                response_data["generation_complete"] = response.server_content.generation_complete

            # Send to client
            await websocket.send_json(response_data)

    except WebSocketDisconnect:
        pass

def serialize_tool_call(tool_call):
    """Convert tool call to JSON-serializable format"""
    return {
        "function_calls": [
            {
                "id": call.id,
                "name": call.name,
                "args": dict(call.args)
            }
            for call in tool_call.function_calls
        ]
    }
```

#### Frontend (JavaScript)

```javascript
class GeminiClient {
  constructor(userId) {
    this.userId = userId;
    this.ws = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`wss://your-backend.com/ws/chat/${this.userId}`);

      this.ws.onopen = () => {
        console.log('Connected to backend');
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      };

      this.ws.onclose = () => {
        console.log('Disconnected from backend');
      };
    });
  }

  sendMessage(text) {
    this.ws.send(JSON.stringify({
      type: 'client_content',
      turns: [{ role: 'user', parts: [{ text }] }],
      turn_complete: true
    }));
  }

  sendAudio(base64Audio) {
    this.ws.send(JSON.stringify({
      type: 'realtime_input',
      audio: { data: base64Audio, mimeType: 'audio/pcm;rate=16000' }
    }));
  }

  sendToolResponse(functionResponses) {
    this.ws.send(JSON.stringify({
      type: 'tool_response',
      function_responses: functionResponses
    }));
  }

  handleMessage(data) {
    if (data.text) {
      console.log('Text:', data.text);
    }

    if (data.audio) {
      this.playAudio(data.audio);
    }

    if (data.tool_call) {
      this.handleToolCall(data.tool_call);
    }

    if (data.interrupted) {
      this.handleInterruption();
    }
  }

  // ... additional methods
}
```

### Advanced: Request/Response Transformation

```python
async def receive_from_client(websocket: WebSocket, gemini_session):
    """With request transformation"""
    while True:
        data = await websocket.receive_json()

        # Log request
        log_request(user_id, data)

        # Content moderation
        if data.get("type") == "client_content":
            text = data["turns"][0]["parts"][0]["text"]

            if contains_inappropriate_content(text):
                await websocket.send_json({
                    "error": "Content policy violation"
                })
                continue

        # Inject context
        if data.get("type") == "client_content":
            # Add user preferences or context
            user_context = get_user_context(user_id)
            data["turns"][0]["parts"].insert(0, {"text": user_context})

        # Forward to Gemini
        await forward_to_gemini(gemini_session, data)
```

## Hybrid Architecture

Combine both approaches for optimal balance:

```
Critical/Sensitive Operations → Server-to-Server
Real-time Voice Conversations → Client-to-Server (with ephemeral tokens)
```

### Example

```javascript
class HybridGeminiClient {
  constructor() {
    this.mode = null;
    this.session = null;
  }

  async connectForVoice() {
    // Client-to-server for low latency
    this.mode = 'voice';
    const token = await fetch('/api/generate-token').then(r => r.json());
    const ai = new GoogleGenAI({ apiKey: token.token });
    this.session = await ai.live.connect({ /* voice config */ });
  }

  async connectForSensitiveOperation() {
    // Server-to-server for security
    this.mode = 'secure';
    this.session = new WebSocket('wss://your-backend.com/ws/secure');
  }
}
```

## Reference Implementations

### Official Examples

1. **ai-news-app** - Your current implementation
   - Browser-based client-to-server with ephemeral tokens
   - Real-time audio streaming
   - Interruption handling
   - Session management

2. **Google AI Studio** - Interactive demo
   - https://aistudio.google.com/
   - Test Live API features
   - Experiment with different configurations

3. **Python Cookbook**
   - PyAudio integration examples
   - Server-side implementation patterns

### Community Examples

- **Daily Integration** - WebRTC with Gemini Live
- **LiveKit Integration** - Real-time streaming platform
- **Voximplant Integration** - Voice communication platform

## Scaling Considerations

### Client-to-Server Scaling

Challenges:
- Each client needs ephemeral token
- Token generation endpoint must scale
- Rate limiting across distributed clients

Solutions:
```python
# Use Redis for distributed rate limiting
from redis import Redis
from datetime import datetime, timedelta

redis_client = Redis()

def check_rate_limit(user_id: str, limit: int = 10, window_seconds: int = 60):
    key = f"rate_limit:{user_id}"
    current = redis_client.get(key)

    if current and int(current) >= limit:
        return False

    pipe = redis_client.pipeline()
    pipe.incr(key)
    pipe.expire(key, window_seconds)
    pipe.execute()

    return True
```

### Server-to-Server Scaling

Challenges:
- WebSocket connections are stateful
- Horizontal scaling requires session affinity
- Resource usage per connection

Solutions:

**1. Load Balancer with Session Affinity**
```nginx
upstream backend {
    ip_hash;  # Session affinity
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
}
```

**2. Redis for Session State**
```python
import redis
import pickle

redis_client = redis.Redis()

async def save_session_state(user_id: str, state: dict):
    redis_client.setex(
        f"session:{user_id}",
        3600,  # 1 hour TTL
        pickle.dumps(state)
    )

async def load_session_state(user_id: str):
    data = redis_client.get(f"session:{user_id}")
    return pickle.loads(data) if data else None
```

**3. Horizontal Pod Autoscaling (Kubernetes)**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: gemini-proxy
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: gemini-proxy
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Cost Optimization

### Token Usage Monitoring

```python
class TokenBudgetManager:
    def __init__(self, monthly_budget_tokens: int):
        self.budget = monthly_budget_tokens
        self.used = 0

    def track_usage(self, tokens: int):
        self.used += tokens

        if self.used > self.budget * 0.9:
            alert_approaching_budget()

        if self.used >= self.budget:
            raise BudgetExceededException()

    def get_remaining(self):
        return self.budget - self.used
```

### Efficient Session Management

```python
# Close idle sessions
class SessionManager:
    def __init__(self):
        self.sessions = {}
        self.last_activity = {}

    async def cleanup_idle_sessions(self, idle_timeout_seconds=300):
        now = time.time()

        for user_id, last_time in list(self.last_activity.items()):
            if now - last_time > idle_timeout_seconds:
                session = self.sessions.pop(user_id, None)
                if session:
                    await session.close()
                    del self.last_activity[user_id]
```

## Decision Matrix

| Factor | Client-to-Server | Server-to-Server |
|--------|------------------|------------------|
| Latency | ⭐⭐⭐ Best | ⭐⭐ Good |
| Security | ⭐⭐ Good (with tokens) | ⭐⭐⭐ Best |
| Control | ⭐ Limited | ⭐⭐⭐ Full |
| Costs | ⭐⭐⭐ Low | ⭐⭐ Medium |
| Complexity | ⭐⭐⭐ Simple | ⭐⭐ Moderate |
| Monitoring | ⭐ Difficult | ⭐⭐⭐ Easy |
| Scaling | ⭐⭐⭐ Easy | ⭐⭐ Moderate |

**Recommendation:**
- **Voice conversation apps:** Client-to-server with ephemeral tokens
- **Enterprise applications:** Server-to-server
- **Hybrid apps:** Mix both based on feature requirements
