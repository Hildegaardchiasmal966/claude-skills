# Function Calling in Gemini Live API

## Overview

The Live API supports tool integration, enabling real-time interactions to go beyond conversation by performing actions and pulling in external context. **Unlike the standard Gemini API, the Live API does NOT support automatic tool response handling**—you must handle tool responses manually in your client code.

## Supported Tools

| Tool | gemini-live-2.5-flash-preview | gemini-2.0-flash-live-001 |
|------|------------------------------|---------------------------|
| **Function Calling** | ✅ | ✅ |
| **Code Execution** | ✅ | ❌ |
| **Google Search** | ✅ | ✅ |
| **URL Context** | ✅ | ❌ |

## Function Calling Basics

### Declaring Functions

Functions are defined in the session setup configuration:

#### Python

```python
from google import genai
from google.genai import types

# Define function
get_weather_tool = types.Tool(
    function_declarations=[
        types.FunctionDeclaration(
            name="get_weather",
            description="Get the current weather for a location",
            parameters={
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City name or coordinates"
                    },
                    "units": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "Temperature unit"
                    }
                },
                "required": ["location"]
            }
        )
    ]
)

# Connect with tools
async with client.aio.live.connect(
    model="gemini-live-2.5-flash-preview",
    config={"response_modalities": ["TEXT"]},
    tools=[get_weather_tool]
) as session:
    # Session with tool support
    pass
```

#### JavaScript

```javascript
const getWeatherTool = {
  functionDeclarations: [{
    name: 'get_weather',
    description: 'Get the current weather for a location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City name or coordinates'
        },
        units: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          description: 'Temperature unit'
        }
      },
      required: ['location']
    }
  }]
};

const session = await ai.live.connect({
  model: 'gemini-live-2.5-flash-preview',
  config: { responseModalities: [Modality.TEXT] },
  tools: [getWeatherTool]
});
```

### Receiving Function Calls

The API sends `toolCall` messages when it wants to execute a function:

#### Python

```python
async for response in session.receive():
    if response.tool_call:
        for call in response.tool_call.function_calls:
            function_name = call.name
            function_args = call.args
            call_id = call.id

            print(f"Function called: {function_name}")
            print(f"Arguments: {function_args}")

            # Execute function
            result = execute_function(function_name, function_args)

            # Send response back
            await session.send_tool_response(
                function_responses=[
                    types.FunctionResponse(
                        id=call_id,
                        name=function_name,
                        response={"result": result}
                    )
                ]
            )
```

#### JavaScript

```javascript
session.callbacks.onmessage = async (message) => {
  if (message.toolCall) {
    for (const call of message.toolCall.functionCalls) {
      const { id, name, args } = call;

      console.log(`Function called: ${name}`);
      console.log(`Arguments:`, args);

      // Execute function
      const result = await executeFunction(name, args);

      // Send response back
      await session.sendToolResponse({
        functionResponses: [{
          id: id,
          name: name,
          response: { result }
        }]
      });
    }
  }
};
```

## Asynchronous Function Execution

By default, functions execute sequentially—the model waits for the response before continuing. For non-blocking execution, add `"behavior": "NON_BLOCKING"` to function definitions.

### Non-Blocking Function Declaration

```python
search_tool = types.Tool(
    function_declarations=[
        types.FunctionDeclaration(
            name="web_search",
            description="Search the web for information",
            parameters={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query"}
                },
                "required": ["query"]
            },
            behavior="NON_BLOCKING"  # Execute without blocking
        )
    ]
)
```

### Scheduling Parameters

When using non-blocking functions, specify how the model should handle responses using `scheduling`:

```python
await session.send_tool_response(
    function_responses=[
        types.FunctionResponse(
            id=call_id,
            name="web_search",
            response={"results": search_results},
            scheduling="INTERRUPT"  # Respond immediately
        )
    ]
)
```

**Scheduling Options:**

| Option | Behavior |
|--------|----------|
| `INTERRUPT` | Stop current generation and respond immediately with tool results |
| `WHEN_IDLE` | Wait until current generation completes, then respond |
| `SILENT` | Store results for later use; don't interrupt or generate response |

## Complete Function Calling Example

### Weather Assistant (Python)

```python
import asyncio
from google import genai
from google.genai import types

def get_weather(location: str, units: str = "celsius") -> dict:
    """Mock weather function - replace with actual API call"""
    return {
        "location": location,
        "temperature": 22,
        "units": units,
        "conditions": "Partly cloudy"
    }

async def weather_assistant():
    client = genai.Client(api_key="YOUR_API_KEY")

    # Define tool
    weather_tool = types.Tool(
        function_declarations=[
            types.FunctionDeclaration(
                name="get_weather",
                description="Get current weather for a location",
                parameters={
                    "type": "object",
                    "properties": {
                        "location": {"type": "string"},
                        "units": {
                            "type": "string",
                            "enum": ["celsius", "fahrenheit"]
                        }
                    },
                    "required": ["location"]
                }
            )
        ]
    )

    # Connect with tool
    async with client.aio.live.connect(
        model="gemini-live-2.5-flash-preview",
        config={"response_modalities": ["TEXT"]},
        tools=[weather_tool]
    ) as session:

        # User asks about weather
        await session.send_client_content(
            turns={"role": "user", "parts": [{"text": "What's the weather in Paris?"}]},
            turn_complete=True
        )

        # Process responses
        async for response in session.receive():
            # Handle tool calls
            if response.tool_call:
                for call in response.tool_call.function_calls:
                    if call.name == "get_weather":
                        # Execute function
                        result = get_weather(**call.args)

                        # Send response
                        await session.send_tool_response(
                            function_responses=[
                                types.FunctionResponse(
                                    id=call.id,
                                    name=call.name,
                                    response=result
                                )
                            ]
                        )

            # Handle text responses
            if response.text:
                print(response.text, end="")

            # Check if generation complete
            if response.server_content and response.server_content.generation_complete:
                break

asyncio.run(weather_assistant())
```

### Multi-Function Example (JavaScript)

```javascript
// Define multiple functions
const tools = [{
  functionDeclarations: [
    {
      name: 'get_weather',
      description: 'Get current weather',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string' }
        },
        required: ['location']
      }
    },
    {
      name: 'search_restaurants',
      description: 'Search for restaurants nearby',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string' },
          cuisine: { type: 'string' }
        },
        required: ['location']
      },
      behavior: 'NON_BLOCKING'
    }
  ]
}];

// Function implementations
const functions = {
  get_weather: async (args) => {
    return { temp: 22, conditions: 'sunny' };
  },
  search_restaurants: async (args) => {
    return { restaurants: ['Restaurant A', 'Restaurant B'] };
  }
};

// Connect and handle calls
const session = await ai.live.connect({
  model: 'gemini-live-2.5-flash-preview',
  config: { responseModalities: [Modality.TEXT] },
  tools: tools,
  callbacks: {
    onmessage: async (message) => {
      if (message.toolCall) {
        // Handle multiple function calls
        const responses = await Promise.all(
          message.toolCall.functionCalls.map(async (call) => {
            const result = await functions[call.name](call.args);
            return {
              id: call.id,
              name: call.name,
              response: result
            };
          })
        );

        // Send all responses
        await session.sendToolResponse({ functionResponses: responses });
      }

      if (message.text) {
        console.log(message.text);
      }
    }
  }
});

await session.sendClientContent({
  turns: [{ role: 'user', parts: [{ text: 'What\'s the weather and where can I eat Italian food in Rome?' }] }],
  turnComplete: true
});
```

## Google Search Integration

Enable web search to ground responses in current information:

```python
# Enable Google Search
google_search_tool = types.Tool(google_search={})

async with client.aio.live.connect(
    model="gemini-live-2.5-flash-preview",
    config={"response_modalities": ["TEXT"]},
    tools=[google_search_tool]
) as session:
    await session.send_client_content(
        turns={"role": "user", "parts": [{"text": "What are the latest AI news today?"}]},
        turn_complete=True
    )

    async for response in session.receive():
        if response.text:
            print(response.text)

        # Check for grounding metadata
        if response.grounding_metadata:
            print(f"Sources: {response.grounding_metadata.grounding_chunks}")
```

**Note:** Google Search runs automatically—no manual tool response handling required.

## Code Execution

Enable the model to write and execute Python code:

```python
# Enable code execution
code_exec_tool = types.Tool(code_execution={})

async with client.aio.live.connect(
    model="gemini-live-2.5-flash-preview",
    config={"response_modalities": ["TEXT"]},
    tools=[code_exec_tool]
) as session:
    await session.send_client_content(
        turns={"role": "user", "parts": [{"text": "Calculate the 20th Fibonacci number"}]},
        turn_complete=True
    )

    async for response in session.receive():
        if response.text:
            print(response.text)
```

**Note:** Code execution runs automatically in a sandboxed environment.

## URL Context

Fetch and include content from URLs in real-time:

```python
# Enable URL context
url_context_tool = types.Tool(url_context={})

async with client.aio.live.connect(
    model="gemini-live-2.5-flash-preview",
    config={"response_modalities": ["TEXT"]},
    tools=[url_context_tool]
) as session:
    await session.send_client_content(
        turns={"role": "user", "parts": [{"text": "Summarize https://example.com/article"}]},
        turn_complete=True
    )

    async for response in session.receive():
        if response.text:
            print(response.text)
```

## Tool Call Cancellation

The API may cancel tool calls if they're no longer needed (e.g., user interrupts):

```python
async for response in session.receive():
    if response.tool_call_cancellation:
        for cancellation in response.tool_call_cancellation.ids:
            print(f"Tool call {cancellation} was cancelled")
            # Clean up any in-progress operations for this call
```

## Combining Multiple Tools

Use multiple tools together for powerful applications:

```python
tools = [
    types.Tool(google_search={}),
    types.Tool(code_execution={}),
    types.Tool(function_declarations=[
        types.FunctionDeclaration(
            name="save_to_database",
            description="Save information to database",
            parameters={
                "type": "object",
                "properties": {
                    "data": {"type": "object", "description": "Data to save"}
                },
                "required": ["data"]
            }
        )
    ])
]

async with client.aio.live.connect(
    model="gemini-live-2.5-flash-preview",
    config={"response_modalities": ["TEXT"]},
    tools=tools
) as session:
    # Model can now search, execute code, and call custom functions
    pass
```

## Best Practices

### Function Design

1. **Clear descriptions:** Model relies on descriptions to decide when to call functions
2. **Specific parameters:** Use enums and constraints to guide model
3. **Error handling:** Return error objects for failed function calls
4. **Idempotency:** Design functions to be safely retried

### Response Handling

1. **Validate arguments:** Check function arguments before execution
2. **Timeout handling:** Don't block indefinitely on function execution
3. **Error responses:** Return structured error information
4. **Logging:** Track all function calls for debugging

### Performance

1. **Non-blocking for independent operations:** Use `NON_BLOCKING` for parallel execution
2. **Batch responses:** Send multiple tool responses together when possible
3. **Caching:** Cache function results when appropriate
4. **Async execution:** Use async/await for I/O operations

## Common Patterns

### Search and Summarize

```python
tools = [
    types.Tool(google_search={}),
    types.Tool(function_declarations=[
        types.FunctionDeclaration(
            name="format_results",
            description="Format search results in specific structure",
            parameters={...},
            behavior="NON_BLOCKING"
        )
    ])
]
```

### Data Retrieval + Processing

```python
tools = [
    types.Tool(function_declarations=[
        types.FunctionDeclaration(
            name="fetch_data",
            description="Fetch data from database",
            behavior="NON_BLOCKING"
        ),
        types.FunctionDeclaration(
            name="process_data",
            description="Process and transform data"
        )
    ])
]
```

### Interactive Voice Assistant with Actions

```python
config = {
    "response_modalities": ["AUDIO"],
    "speech_config": {"voice_config": {"prebuilt_voice_config": {"voice_name": "Kore"}}}
}

tools = [
    types.Tool(google_search={}),
    types.Tool(function_declarations=[
        types.FunctionDeclaration(name="set_reminder", ...),
        types.FunctionDeclaration(name="control_smart_home", ...),
        types.FunctionDeclaration(name="send_message", ...)
    ])
]

# Voice assistant that can search, set reminders, control devices, etc.
```

## Error Handling

```python
async for response in session.receive():
    if response.tool_call:
        for call in response.tool_call.function_calls:
            try:
                # Execute function
                result = execute_function(call.name, call.args)

                # Send success response
                await session.send_tool_response(
                    function_responses=[
                        types.FunctionResponse(
                            id=call.id,
                            name=call.name,
                            response={"success": True, "data": result}
                        )
                    ]
                )
            except Exception as e:
                # Send error response
                await session.send_tool_response(
                    function_responses=[
                        types.FunctionResponse(
                            id=call.id,
                            name=call.name,
                            response={
                                "success": False,
                                "error": str(e),
                                "error_type": type(e).__name__
                            }
                        )
                    ]
                )
```

## Debugging Tips

1. **Log all tool calls:** Track when functions are called and with what arguments
2. **Validate function schemas:** Ensure parameter schemas match your implementation
3. **Test functions independently:** Verify function logic before integration
4. **Monitor timing:** Track function execution time to avoid timeouts
5. **Check cancellations:** Handle tool call cancellations gracefully
