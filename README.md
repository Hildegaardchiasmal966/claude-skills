# Claude Skills Collection

A curated collection of specialized [Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) that extend Claude's capabilities. Each skill packages domain expertise, workflows, and resources using progressive disclosure to keep Claude efficient while providing deep specialization.

**What are Agent Skills?** Think of them as "onboarding guides for agents" - organized directories that equip Claude with procedural knowledge for specialized tasks. [Learn more →](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)

---

## 🎙️ Voice & Media Skills

### Gemini Live API
Build real-time voice and video interactions with Google's Gemini Live API. Handles bidirectional audio streaming, interruption support, function calling, session management, and voice customization.

**Use for:** Voice assistants, conversational AI, real-time transcription, interactive storytelling

### Nano Banana Prompts
Generate optimized prompts for Gemini 2.5 Flash Image using proven best practices. Natural language templates for photography, art styles, product shots, and iterative editing.

**Use for:** Social media graphics, marketing materials, professional headshots, creative projects

---

## ✍️ Content Creation

### Substack Editor
Transform topics and documents into engaging Substack articles with authentic voice, SEO optimization, and strategic CTAs. Includes humanization checklist to eliminate AI-isms.

**Use for:** Newsletter writing, thought leadership, content repurposing, subscriber growth

---

## 🚀 Web Development

### Next.js Portfolio Builder
Initialize production-ready Next.js 15 projects with TypeScript, Tailwind CSS, shadcn/ui, and professional components. Eliminates 30-60 minutes of manual setup.

**Use for:** Personal portfolios, business landing pages, blog/content hubs, professional websites

### Next.js + Supabase Patterns
Interactive guide for implementing Next.js 15 App Router with Supabase SSR. Helps choose between Server/Client components, select correct Supabase client, and follow security patterns.

**Use for:** Building Next.js pages, components, API routes with Supabase integration

### Supabase Migrations
Safe workflow for database schema changes with automatic type generation and RLS validation. Guides creation, testing, and application of migrations.

**Use for:** Adding tables, modifying schema, creating indexes, updating RLS policies

---

## 🛠️ Development Workflow

### Test-Driven Development (TDD)
Enforces red-green-refactor cycle: write test first, watch it fail, write minimal code to pass. Ensures tests verify actual behavior by requiring failure first.

**Use for:** Any feature implementation or bugfix where quality and reliability matter

### Pre-Commit Quality
Runs mandatory quality checks before commits: build verification, test suite, and pattern validation. Automates code review standards.

**Use for:** Verifying code quality meets project standards before committing

### Quick Fix
Fast workflow for small changes and bug fixes using sub-agent orchestration. Handles styling adjustments, minor functionality fixes, and UI tweaks efficiently.

**Use for:** Style changes, text updates, small UI elements, typography improvements

---

## 📦 Installation

### Prerequisites
- [Claude Code](https://claude.com/claude-code) or Claude.ai account
- Node.js 18+ (for web development skills)
- Python 3.8+ (for gemini-live-api scripts)

### Option 1: Download Individual Skills
1. Download skill ZIP from [releases](https://github.com/lifegenieai/claude-skills/releases)
2. In Claude Code/Claude.ai: Settings → Skills → Upload Skill
3. Enable for your conversations

### Option 2: Clone Repository
```bash
git clone https://github.com/lifegenieai/claude-skills.git
cd claude-skills
# Point Claude Code to skill directories in settings
```

### Using Skills
Skills activate automatically when you ask Claude to perform relevant tasks:

```
"Build a voice assistant with Gemini Live API"
"Create a professional headshot prompt for Nano Banana"
"Write a Substack article about remote work"
"Build me a portfolio website"
"Add a recipe_tags table with RLS policies"
"Fix the Save Recipe button styling"
```

---

## 🗂️ Skill Structure

Each skill follows a consistent pattern:

```
skill-name/
├── SKILL.md              # Core skill definition with YAML frontmatter
├── references/           # Domain-specific documentation
├── scripts/              # Utility scripts (optional)
└── assets/               # Templates, components (optional)
```

See [CLAUDE.md](./CLAUDE.md) for detailed architecture and best practices.

---

## 🤝 Contributing

Contributions welcome! To add or improve skills:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-skill`)
3. Follow skill structure in CLAUDE.md
4. Test with Claude Code
5. Submit pull request

**Guidelines:**
- Self-contained and well-documented
- Clear examples and use cases
- Progressive disclosure principles
- Update README with skill description

---

## 📚 Resources

- [Agent Skills Documentation](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)
- [Skills Engineering Blog](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Claude Code](https://claude.com/claude-code)
- [Anthropic Cookbook - Skills](https://github.com/anthropics/claude-cookbooks/tree/main/skills)

---

## 📝 License

MIT License - see [LICENSE](./LICENSE) for details.

---

**Questions?** Open an issue or start a discussion. Built with [Claude Code](https://claude.com/claude-code) 🚀
