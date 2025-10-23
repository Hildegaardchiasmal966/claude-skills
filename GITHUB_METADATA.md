# GitHub Repository Metadata

Use this information when setting up your GitHub repository.

## Repository Name
```
claude-skills
```

## Short Description (for repository header)
```
A curated collection of Agent Skills that extend Claude's capabilities in voice AI, image generation, content creation, and web development
```

## About Section
```
Specialized Agent Skills for Claude Code and Claude.ai - including Gemini Live API integration, Nano Banana image prompts, Substack article generation, and Next.js portfolio building. Built using progressive disclosure patterns for efficient, domain-specific AI capabilities.
```

## Topics/Tags
Add these topics to your repository for discoverability:

```
claude
anthropic
agent-skills
claude-code
ai-agents
gemini-api
voice-ai
image-generation
content-creation
nextjs
substack
portfolio-builder
prompt-engineering
ai-development
claude-ai
skills-framework
progressive-disclosure
```

## Repository Settings

### Features to Enable
- ✅ Issues
- ✅ Discussions (for community Q&A)
- ✅ Wiki (optional, for extended documentation)

### Default Branch
- `main`

### Social Preview Image (Optional)
Consider creating a 1280x640px banner showcasing:
- Claude logo
- Text: "Agent Skills Collection"
- Icons representing the 4 skills (microphone, image, pen, code)

## GitHub Pages (Optional)

If you want a dedicated documentation site:
1. Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` / `docs` folder
4. Create a `docs/` folder with enhanced documentation

## README Badges (Optional)

Add these badges to the top of your README.md:

```markdown
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude-Code-5A67D8)](https://claude.com/claude-code)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Skills: 4](https://img.shields.io/badge/Skills-4-blue.svg)](#)
```

## Release Strategy

When publishing skills:

1. **Version Tags**: Use semantic versioning per skill
   ```
   gemini-live-api-v1.0.0
   nano-banana-prompts-v1.0.0
   substack-editor-v1.0.0
   nextjs-portfolio-builder-v1.0.0
   ```

2. **GitHub Releases**: Create releases with:
   - Tag name (e.g., `gemini-live-api-v1.0.0`)
   - Release title (e.g., "Gemini Live API Skill v1.0.0")
   - Description of features
   - Attached ZIP file for easy download

3. **Changelog**: Maintain CHANGELOG.md per skill or one global file

## Repository URL Structure

When published, your repository will be:
```
https://github.com/[your-username]/claude-skills
```

Skill downloads:
```
https://github.com/[your-username]/claude-skills/releases/download/[tag]/[skill-name].zip
```

## Community Files

Consider adding:
- `CODE_OF_CONDUCT.md` - Community guidelines
- `SECURITY.md` - Security policy and reporting
- `CONTRIBUTING.md` - Detailed contribution guide
- `.github/ISSUE_TEMPLATE/` - Issue templates
- `.github/PULL_REQUEST_TEMPLATE.md` - PR template
