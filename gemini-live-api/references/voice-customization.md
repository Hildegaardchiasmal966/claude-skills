# Voice Customization in Gemini Live API

## Available Voices

The Gemini Live API offers multiple prebuilt voices with distinct personalities and characteristics:

| Voice Name | Characteristics | Best For |
|------------|----------------|----------|
| **Aoede** | Calm, measured, professional | Business applications, formal assistants, educational content |
| **Charon** | Authoritative, confident, clear | News reading, announcements, instructional content |
| **Fenrir** | Dynamic, engaging, energetic | Marketing, entertainment, interactive games |
| **Kore** | Warm, friendly, approachable | Customer service, personal assistants, casual conversations |
| **Puck** | Playful, expressive, whimsical | Children's apps, creative content, storytelling |
| **Zephyr** | Smooth, balanced, neutral | General purpose, versatile applications |

### Selecting a Voice

#### Python

```python
config = {
    "response_modalities": ["AUDIO"],
    "speech_config": {
        "voice_config": {
            "prebuilt_voice_config": {
                "voice_name": "Kore"  # Choose: Aoede, Charon, Fenrir, Kore, Puck, Zephyr
            }
        }
    }
}

async with client.aio.live.connect(
    model="gemini-live-2.5-flash-preview",
    config=config
) as session:
    # Voice agent with selected voice
    pass
```

#### JavaScript

```javascript
const config = {
  responseModalities: [Modality.AUDIO],
  speechConfig: {
    voiceConfig: {
      prebuiltVoiceConfig: {
        voiceName: 'Kore'  // Choose: Aoede, Charon, Fenrir, Kore, Puck, Zephyr
      }
    }
  }
};

const session = await ai.live.connect({
  model: 'gemini-live-2.5-flash-preview',
  config: config
});
```

## Native Audio vs Half-Cascade Architecture

### Native Audio (Recommended for Best Quality)

Models: `gemini-2.5-flash-native-audio-preview-09-2025`

**Advantages:**
- **Most natural and realistic-sounding speech**
- **Better multilingual performance**
- **Affective dialogue capability** - Can express emotions and tone
- **Proactive audio responses** - Model can initiate speech based on context
- **Thinking mode support** - Internal reasoning before speaking
- **Superior prosody** - Natural rhythm, stress, and intonation

**When to use:**
- High-quality voice experiences are priority
- Emotional expression matters
- Multilingual conversations
- Natural conversation flow is critical

### Half-Cascade Architecture

Models: `gemini-2.0-flash-live-001`, others

**Architecture:** Native audio input → Text processing → Text-to-Speech output

**Advantages:**
- **Better production reliability**
- **More stable for tool integration**
- **Consistent output quality**

**When to use:**
- Tool calling is heavily used
- Production stability is critical
- Text processing pipeline is preferred

## Language Configuration

### Setting Language

```python
config = {
    "response_modalities": ["AUDIO"],
    "speech_config": {
        "voice_config": {
            "prebuilt_voice_config": {"voice_name": "Kore"}
        },
        "language_code": "de-DE"  # German
    }
}
```

### Supported Languages

The API supports multiple languages. Common language codes:

| Language | Code | Example |
|----------|------|---------|
| English (US) | `en-US` | Default |
| English (UK) | `en-GB` | British English |
| Spanish (Spain) | `es-ES` | Español |
| Spanish (Mexico) | `es-MX` | Español (México) |
| French | `fr-FR` | Français |
| German | `de-DE` | Deutsch |
| Italian | `it-IT` | Italiano |
| Portuguese (Brazil) | `pt-BR` | Português |
| Japanese | `ja-JP` | 日本語 |
| Korean | `ko-KR` | 한국어 |
| Chinese (Simplified) | `zh-CN` | 中文 |
| Chinese (Traditional) | `zh-TW` | 中文 (台灣) |
| Hindi | `hi-IN` | हिन्दी |
| Arabic | `ar-SA` | العربية |
| Russian | `ru-RU` | Русский |

**Note:** Voice quality and availability may vary by language. Native audio models generally provide better multilingual performance.

## Making Voices Sound Natural

### Use Native Audio Models

For the most natural-sounding voices:

```python
model = "gemini-2.5-flash-native-audio-preview-09-2025"

config = {
    "response_modalities": ["AUDIO"],
    "speech_config": {
        "voice_config": {
            "prebuilt_voice_config": {"voice_name": "Kore"}
        }
    }
}
```

### Affective Dialogue

Native audio models can express emotions and tone variations. Guide the model with system instructions:

```python
system_instruction = {
    "parts": [{
        "text": """You are a warm, empathetic voice assistant.
        Express appropriate emotions in your tone:
        - Show enthusiasm when discussing exciting topics
        - Use a calm, soothing tone for stressful situations
        - Maintain an upbeat, energetic tone for motivational content
        - Speak thoughtfully and carefully when explaining complex topics
        """
    }]
}

config = {
    "response_modalities": ["AUDIO"],
    "system_instruction": system_instruction,
    "speech_config": {
        "voice_config": {
            "prebuilt_voice_config": {"voice_name": "Kore"}
        }
    }
}
```

### Conversational Prompting

The way you phrase system instructions and prompts affects speech naturalness:

**Less Natural:**
```python
system_instruction = "You are an assistant. Answer questions."
```

**More Natural:**
```python
system_instruction = """You are a friendly conversation partner.
Speak naturally and conversationally, as if talking to a friend.
Use casual language, contractions, and natural pauses.
Vary your sentence structure and rhythm to keep things interesting.
"""
```

### Natural Pauses and Pacing

Influence pacing through content structure:

**Faster Pacing:**
- Shorter sentences
- Active voice
- Direct statements

**Slower Pacing:**
- Longer sentences with clauses
- Descriptive language
- Thoughtful explanations

**Example:**

```python
# Faster, more energetic
prompt = "Quick! Tell me three fun facts about space!"

# Slower, more thoughtful
prompt = "I'd love to learn about the fascinating characteristics of black holes. Please explain in detail."
```

## Adjusting Cadence and Speaking Style

### Through System Instructions

```python
# Energetic, fast-paced
system_instruction = """You are an enthusiastic sports commentator.
Speak with energy and excitement! Use short, punchy sentences.
Keep the pace quick and dynamic. Show your passion!"""

# Calm, measured
system_instruction = """You are a meditation guide.
Speak slowly and calmly. Use gentle, soothing language.
Take your time with each word. Create a peaceful atmosphere."""

# Professional, clear
system_instruction = """You are a professional news anchor.
Speak clearly and authoritatively. Maintain a steady, measured pace.
Enunciate carefully. Project confidence and credibility."""

# Conversational, casual
system_instruction = """You are a friendly podcast host.
Chat naturally like you're talking to a friend over coffee.
Be relaxed and conversational. Use casual language and contractions."""
```

### Thought Process Influence

Use thinking modes to add natural pauses:

```python
prompt = "Let me think about this carefully... [pause] Okay, here's what I think..."
```

### Response Length Control

Control cadence indirectly by influencing response length:

```python
config = {
    "response_modalities": ["AUDIO"],
    "max_output_tokens": 150  # Shorter responses = quicker delivery
}

system_instruction = """Keep responses concise and to the point.
Aim for 1-2 sentences unless more detail is specifically requested."""
```

## Temperature and Creativity Effects

Temperature affects not just content but also speaking style:

```python
# Lower temperature (0.3-0.7) - More consistent, predictable tone
config = {
    "response_modalities": ["AUDIO"],
    "temperature": 0.5,
    "speech_config": {"voice_config": {"prebuilt_voice_config": {"voice_name": "Charon"}}}
}

# Higher temperature (1.0-1.5) - More varied, expressive delivery
config = {
    "response_modalities": ["AUDIO"],
    "temperature": 1.2,
    "speech_config": {"voice_config": {"prebuilt_voice_config": {"voice_name": "Puck"}}}
}
```

**Effect on Speech:**
- **Low temperature:** More uniform pacing, consistent tone
- **High temperature:** More variation in delivery, expressive range

## Voice Matching to Use Cases

### Customer Support

```python
config = {
    "response_modalities": ["AUDIO"],
    "speech_config": {
        "voice_config": {"prebuilt_voice_config": {"voice_name": "Kore"}},
        "language_code": "en-US"
    }
}

system_instruction = """You are a patient, helpful customer service agent.
Speak warmly and professionally. Take time to listen and understand.
Show empathy and a genuine desire to help solve problems."""
```

### Educational Content

```python
config = {
    "response_modalities": ["AUDIO"],
    "speech_config": {
        "voice_config": {"prebuilt_voice_config": {"voice_name": "Aoede"}},
        "language_code": "en-US"
    }
}

system_instruction = """You are an engaging teacher.
Speak clearly and at a measured pace. Use simple language first.
Build complexity gradually. Show enthusiasm for the subject.
Use analogies and examples to make concepts accessible."""
```

### Entertainment / Storytelling

```python
config = {
    "response_modalities": ["AUDIO"],
    "speech_config": {
        "voice_config": {"prebuilt_voice_config": {"voice_name": "Puck"}},
        "language_code": "en-US"
    },
    "temperature": 1.2  # More creative and varied
}

system_instruction = """You are an animated storyteller.
Bring stories to life with dynamic delivery and expressive tone.
Vary your pacing - speed up for action, slow down for dramatic moments.
Use your voice to create atmosphere and emotion."""
```

### Professional / Business

```python
config = {
    "response_modalities": ["AUDIO"],
    "speech_config": {
        "voice_config": {"prebuilt_voice_config": {"voice_name": "Charon"}},
        "language_code": "en-US"
    },
    "temperature": 0.7  # Balanced and consistent
}

system_instruction = """You are a professional business consultant.
Speak with authority and confidence. Be concise and clear.
Maintain a polished, professional tone. Focus on actionable insights."""
```

### Meditation / Wellness

```python
config = {
    "response_modalities": ["AUDIO"],
    "speech_config": {
        "voice_config": {"prebuilt_voice_config": {"voice_name": "Aoede"}},
        "language_code": "en-US"
    },
    "temperature": 0.6  # Calm and consistent
}

system_instruction = """You are a gentle meditation guide.
Speak slowly and softly. Use calming, peaceful language.
Create space between thoughts. Your voice should be soothing and relaxing."""
```

## Advanced Voice Techniques

### Dynamic Voice Switching

Change voice mid-conversation (requires new session):

```python
async def switch_voice(client, new_voice_name):
    # Close current session
    # Create new session with different voice
    new_config = {
        "response_modalities": ["AUDIO"],
        "speech_config": {
            "voice_config": {"prebuilt_voice_config": {"voice_name": new_voice_name}}
        }
    }

    session = await client.aio.live.connect(
        model="gemini-2.5-flash-native-audio-preview-09-2025",
        config=new_config
    )

    return session
```

### Contextual Tone Adaptation

```python
system_instruction = """Adapt your speaking style based on context:

For technical questions:
- Speak clearly and precisely
- Take time to explain complex concepts
- Use a measured, professional tone

For casual chat:
- Be warm and friendly
- Use a relaxed, conversational pace
- Show personality and humor

For urgent matters:
- Speak more quickly and directly
- Use an alert, focused tone
- Prioritize clarity and brevity
"""
```

### Emotional Expression (Native Audio Only)

```python
system_instruction = """Express appropriate emotions through your voice:

When the user shares good news:
- Sound genuinely happy and excited
- Increase energy and enthusiasm
- Use an upbeat, celebratory tone

When discussing serious topics:
- Lower your tone slightly
- Speak more thoughtfully and carefully
- Show respect and consideration

When helping with problems:
- Sound patient and reassuring
- Maintain a calm, supportive tone
- Express empathy and understanding
"""
```

## Debugging Voice Issues

### Voice Sounds Robotic

**Causes:**
- Using half-cascade model instead of native audio
- Overly formal system instructions
- Very low temperature

**Solutions:**
```python
# Switch to native audio
model = "gemini-2.5-flash-native-audio-preview-09-2025"

# Add conversational system instruction
system_instruction = """Speak naturally and conversationally.
Use contractions, casual language, and varied sentence structure.
Imagine you're chatting with a friend."""

# Increase temperature slightly
config["temperature"] = 1.0
```

### Voice Sounds Inconsistent

**Causes:**
- Temperature too high
- Contradictory system instructions
- Model uncertainty

**Solutions:**
```python
# Lower temperature
config["temperature"] = 0.7

# Provide clear, consistent instructions
system_instruction = """Maintain a consistent friendly and professional tone
throughout the conversation."""
```

### Wrong Language/Accent

**Causes:**
- Missing or incorrect `language_code`
- Model defaulting to detected language

**Solutions:**
```python
config = {
    "response_modalities": ["AUDIO"],
    "speech_config": {
        "voice_config": {"prebuilt_voice_config": {"voice_name": "Kore"}},
        "language_code": "en-US"  # Explicitly set language
    }
}
```

## Best Practices

1. **Match voice to use case:** Consider your audience and context
2. **Use native audio for quality:** When voice naturalness is critical
3. **System instructions matter:** Guide tone and style through clear instructions
4. **Test with real content:** Voice quality varies with different content types
5. **Consider language:** Native audio excels at multilingual experiences
6. **Adjust temperature thoughtfully:** Balance consistency with expressiveness
7. **Provide context:** Help the model understand desired emotional tone
8. **Iterate and refine:** Test different voices and configurations
9. **Monitor user feedback:** Let users guide voice preference choices
10. **Document choices:** Record which voice/config works best for each use case

## Voice Comparison Testing

```python
async def test_voices(client, test_prompt):
    """Test all voices with the same prompt"""
    voices = ["Aoede", "Charon", "Fenrir", "Kore", "Puck", "Zephyr"]

    for voice in voices:
        print(f"\n--- Testing {voice} ---")

        config = {
            "response_modalities": ["AUDIO"],
            "speech_config": {
                "voice_config": {"prebuilt_voice_config": {"voice_name": voice}}
            }
        }

        async with client.aio.live.connect(
            model="gemini-2.5-flash-native-audio-preview-09-2025",
            config=config
        ) as session:
            await session.send_client_content(
                turns={"role": "user", "parts": [{"text": test_prompt}]},
                turn_complete=True
            )

            async for response in session.receive():
                if response.data:
                    # Save audio for comparison
                    save_audio(f"voice_test_{voice}.pcm", response.data)

                if response.server_content and response.server_content.generation_complete:
                    break
```

## Reference Examples

### Energetic Sports Commentator

```python
config = {
    "response_modalities": ["AUDIO"],
    "speech_config": {"voice_config": {"prebuilt_voice_config": {"voice_name": "Fenrir"}}},
    "temperature": 1.2
}

system_instruction = """You're an excited sports commentator!
Bring the energy! Use short, punchy phrases. Build excitement!
React enthusiastically to every development. Make it dramatic!"""
```

### Calm Meditation Guide

```python
config = {
    "response_modalities": ["AUDIO"],
    "speech_config": {"voice_config": {"prebuilt_voice_config": {"voice_name": "Aoede"}}},
    "temperature": 0.6
}

system_instruction = """You are a peaceful meditation guide.
Speak... slowly... and... calmly. Take... your time.
Use gentle words. Create space for reflection.
Your voice is soothing and relaxing."""
```

### Professional News Anchor

```python
config = {
    "response_modalities": ["AUDIO"],
    "speech_config": {"voice_config": {"prebuilt_voice_config": {"voice_name": "Charon"}}},
    "temperature": 0.7
}

system_instruction = """You are a professional news anchor.
Speak clearly and authoritatively. Maintain steady pacing.
Be objective and informative. Project credibility and confidence."""
```
