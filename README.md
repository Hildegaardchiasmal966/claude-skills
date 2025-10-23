# Claude Skills Collection

A curated collection of specialized [Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) that extend Claude's capabilities in specific domains. Each skill packages domain expertise, workflows, and resources into reusable components that can be installed in Claude Code, Claude.ai, or used with the Claude Agent SDK.

## What Are Agent Skills?

Agent Skills are organized directories containing instructions, reference documentation, scripts, and resources that give Claude specialized capabilities. They use **progressive disclosure** to load information only when needed, keeping Claude efficient while providing deep domain expertise.

Think of skills as "onboarding guides for agents" - they equip Claude with procedural knowledge and organizational context for specialized tasks without bloating the context window.

**Learn more**: [Equipping Agents for the Real World with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)

---

## 🎙️ Gemini Live API

**Build real-time voice and video interactions with Google's Gemini Live API**

### What It Does

Provides comprehensive guidance for implementing natural voice conversations with Gemini models, including bidirectional audio streaming, interruption handling, function calling in live sessions, and voice customization.

### Why It's Important

Real-time voice interactions are becoming critical for AI applications, but implementing them correctly requires understanding audio formats, WebSocket management, session handling, and natural conversation flows. This skill codifies best practices and working patterns so you don't have to start from scratch.

### Key Features

- **Audio Streaming**: Handle 16kHz PCM input and 24kHz output with real-time processing
- **Voice Activity Detection**: Automatic speech detection with natural interruption handling
- **Function Calling**: Integrate tools and APIs into live voice sessions
- **Session Management**: Connection lifecycle, resumption tokens, context compression
- **Voice Customization**: Multiple voices, speech configuration, natural prosody
- **Production Patterns**: Security best practices, error handling, optimization strategies

### Use Cases

```
"Build a voice assistant that can be interrupted naturally mid-response"
→ Claude references audio-handling.md for VAD configuration and interruption patterns

"Add function calling to my live voice session"
→ Claude uses function-calling.md for tool declarations and async execution patterns

"Implement real-time transcription with audio playback"
→ Claude applies architecture-patterns.md for complete implementation approach
```

### Example Scenarios

- **Customer Support Bot**: Natural voice conversations with interruption support and real-time information lookup
- **Voice-Controlled Assistant**: Hands-free operation with function calling for calendar, email, and search
- **Interactive Storytelling**: AI narrator that responds naturally to user interjections
- **Language Tutor**: Real-time pronunciation feedback with conversational practice

### What's Included

- 7 comprehensive reference guides (API overview, audio handling, function calling, session management, voice customization, best practices, architecture patterns)
- Python audio utilities for PCM encoding/decoding and sample rate conversion
- Working examples from production implementations

---

## 🎨 Nano Banana Prompts

**Generate optimized prompts for Gemini 2.5 Flash Image (Nano Banana)**

### What It Does

Transforms your image ideas into high-quality prompts using proven best practices for natural language descriptions, photography techniques, art styles, and iterative editing workflows.

### Why It's Important

Getting great results from image generation models requires understanding prompt structure, camera terminology, lighting descriptions, and artistic styles. This skill encapsulates October 2025 best practices so you can create compelling images without becoming a prompt engineering expert.

### Key Features

- **Natural Language Templates**: Structured prompts that describe scenes, not keyword lists
- **Photography Control**: Camera, lens, lighting, and composition specifications
- **Art & Illustration**: Styles, mediums, techniques, and color palette guidance
- **Text Rendering**: Best practices for in-image text (under 25 characters)
- **Multi-Turn Editing**: Conversational refinement workflows
- **Product & Landscape Photography**: Specialized templates for commercial use

### Use Cases

```
"Create a professional headshot for LinkedIn"
→ Claude generates: "Professional corporate headshot of mid-30s woman with shoulder-length
   brown hair in charcoal blazer. Shot with 85mm f/2.0, studio three-point lighting..."

"Make a watercolor illustration for a children's book"
→ Claude applies illustration templates with soft brushstrokes and pastel palettes

"Generate product photos for my e-commerce site"
→ Claude uses product photography patterns with proper lighting and angles
```

### Example Scenarios

- **Social Media Content**: Create engaging visuals for posts, stories, and profiles
- **Marketing Materials**: Generate hero images, product photos, and promotional graphics
- **Creative Projects**: Book covers, poster designs, album artwork
- **Professional Headshots**: LinkedIn profiles, team pages, speaker bios
- **Iterative Design**: Start with concept, refine through conversational editing

### What's Included

- Complete prompt templates for photography, art, products, landscapes, and abstract styles
- Camera and lighting reference guides
- Text rendering best practices
- Multi-turn editing workflows
- Aspect ratio recommendations

---

## ✍️ Substack Editor

**Transform topics and documents into engaging Substack articles**

### What It Does

Takes your ideas, rough drafts, or documents and transforms them into publication-ready Substack articles with authentic voice, engaging storytelling, and optimization for reader engagement and SEO.

### Why It's Important

Writing compelling online content requires balancing voice, structure, engagement hooks, SEO optimization, and Substack-specific best practices. This skill ensures every article follows proven patterns for maximum impact while maintaining an authentic, human voice.

### Key Features

- **EB Voice & Tone**: Enthusiastic, supportive, engaging style that connects with readers
- **Humanization**: Eliminates AI-isms, varies sentence structure, adds personal touches
- **Substack Optimization**: Hooks, CTAs, visual hierarchy, subscriber growth strategies
- **SEO Integration**: Keyword placement, meta descriptions, internal linking opportunities
- **HTML Artifacts**: Copy-paste ready content for Substack's editor
- **Engagement Strategy**: Questions, CTAs, and reader interaction points

### Use Cases

```
"Write a Substack post about async communication in remote teams"
→ Claude creates 1,500-word article with hook, personal stories, practical benefits,
   reality check, and engagement question

"Transform this technical report into an engaging article"
→ Claude reads document, extracts key insights, rewrites with storytelling and
   accessibility for general audience

"Create a post that will drive subscriptions"
→ Claude applies optimization guide with strategic CTAs and compelling value proposition
```

### Example Scenarios

- **Content Creators**: Regular publication schedule with consistent voice and quality
- **Thought Leadership**: Transform expertise into accessible, engaging articles
- **Newsletter Writers**: Optimize for opens, clicks, and subscriber growth
- **Repurposing Content**: Turn reports, research, or presentations into articles
- **Solo Entrepreneurs**: Professional content without hiring a writer

### What's Included

- EB style guide with voice, tone, and writing patterns
- Humanization checklist (5-stage workflow)
- Substack content optimization guide (hooks, CTAs, SEO, engagement)
- HTML artifact generation for direct copy/paste

---

## 🚀 Next.js Portfolio Builder

**Build modern portfolio websites and landing pages in seconds**

### What It Does

Initializes complete, production-ready Next.js 15 projects with TypeScript, Tailwind CSS, shadcn/ui components, and professional templates - eliminating 30-60 minutes of manual setup.

### Why It's Important

Setting up a modern web development stack requires configuring multiple tools, learning framework conventions, and establishing best practices. This skill provides a battle-tested starting point so you can focus on building features, not fighting configuration.

### Key Features

- **Complete Starter Template**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui pre-configured
- **Pre-Built Components**: Header, Footer, Contact Form (with validation), Blog Cards
- **Design Patterns**: Responsive layouts, theming, typography, accessibility guidelines
- **Deployment Ready**: Vercel optimization with complete deployment documentation
- **Form Validation**: react-hook-form + zod schemas included
- **SEO Optimized**: Metadata configuration and best practices

### Use Cases

```
"Build me a portfolio site with a contact form"
→ Claude initializes Next.js project, adds Header/Footer, creates validated ContactForm,
   provides deployment instructions

"Create a landing page for my business"
→ Claude generates hero section, feature highlights, CTA sections using pre-built components

"I need a blog section with external post links"
→ Claude implements BlogCard components linking to Substack, Medium, LinkedIn posts
```

### Example Scenarios

- **Personal Portfolio**: Showcase projects, skills, experience with professional design
- **Business Landing Page**: Product/service presentation with lead capture
- **Professional Website**: About, projects, resume/CV integration
- **Blog/Content Hub**: Article listings with newsletter signup
- **Agency Websites**: Multiple pages with consistent branding

### What's Included

- Next.js 15 starter template (TypeScript, Tailwind, shadcn/ui)
- 5 pre-built UI components + 4 professional page components
- Design patterns guide (layouts, responsive design, theming, accessibility, SEO)
- Vercel deployment guide (domains, SSL, environment variables, troubleshooting)
- Python initialization script for quick project setup

---

## 📦 Installation

### Prerequisites

- [Claude Code](https://claude.com/claude-code) or Claude.ai account
- For nextjs-portfolio-builder: Node.js 18+ and npm
- For gemini-live-api scripts: Python 3.8+

### Installing Skills

**Option 1: Download Individual Skills**

1. Download the skill's ZIP file from the releases section
2. In Claude Code or Claude.ai, go to Settings → Skills
3. Click "Upload Skill" and select the ZIP file
4. Enable the skill for your conversations

**Option 2: Clone Repository and Use Locally**

```bash
# Clone the repository
git clone https://github.com/yourusername/claude-skills.git
cd claude-skills

# Each skill can be accessed directly as a directory
# Point Claude Code to the skill directory in settings
```

### Using Skills

Once installed, skills activate automatically when you ask Claude to perform relevant tasks:

```
"Build a voice assistant with Gemini Live API"
→ gemini-live-api skill activates

"Create a prompt for a professional headshot"
→ nano-banana-prompts skill activates

"Write a Substack article about remote work"
→ substack-editor skill activates

"Build me a portfolio website"
→ nextjs-portfolio-builder skill activates
```

You can also explicitly invoke skills by referencing them by name.

---

## 🛠️ Development

Each skill follows a consistent structure:

```
skill-name/
├── SKILL.md                  # Core skill definition with YAML frontmatter
├── references/               # Domain-specific documentation
│   └── *.md
├── scripts/                  # Utility scripts
│   └── *.py
└── assets/                   # Templates, components (if applicable)
```

### Creating New Skills

See [CLAUDE.md](./CLAUDE.md) for detailed guidance on skill architecture and best practices.

**Quick Start:**
1. Create a new directory with a descriptive name
2. Write SKILL.md with YAML frontmatter (name, description)
3. Add reference documentation in `references/`
4. Include utility scripts or templates as needed
5. Test by asking Claude to use the skill

---

## 🤝 Contributing

Contributions are welcome! If you've built a useful skill or want to improve existing ones:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-skill`)
3. Follow the skill structure documented in CLAUDE.md
4. Submit a pull request with a clear description

### Contribution Guidelines

- Skills should be self-contained and well-documented
- Include clear examples and use cases
- Follow progressive disclosure principles
- Test skills with Claude Code before submitting
- Update README.md with skill description

---

## 📚 Resources

- [Agent Skills Documentation](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)
- [Skills Engineering Blog Post](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Claude Code](https://claude.com/claude-code)
- [Anthropic Cookbook - Skills](https://github.com/anthropics/claude-cookbooks/tree/main/skills)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)

---

## 📝 License

These skills are provided as-is for educational and development purposes. Individual skills may reference external APIs and services that have their own terms of use.

---

## 🙏 Acknowledgments

Built with [Claude Code](https://claude.com/claude-code) using the skill-creator pattern. Special thanks to the Anthropic team for developing the Agent Skills framework.

---

**Have questions or feedback?** Open an issue or start a discussion. Happy building! 🚀
