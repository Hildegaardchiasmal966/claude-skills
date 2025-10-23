# Next.js Portfolio Builder Skill - Quick Start

## What You've Got

A comprehensive skill for building modern portfolio websites and landing pages with:

✅ **Complete Next.js 15 starter template** with TypeScript, React, and shadcn/ui
✅ **Ready-to-use components**: Header, Footer, Contact Form, Blog Cards
✅ **Design pattern guides**: Best practices for layouts, styling, and responsive design
✅ **Deployment documentation**: Complete Vercel deployment guide
✅ **Initialization script**: Quick project setup from template

## Installation

1. Download the packaged skill: `nextjs-portfolio-builder.zip`
2. Install it in Claude by going to Settings → Skills → Upload Skill
3. Enable the skill for your project or conversation

## How It Works

Once installed, just ask Claude to build you a website:

**Example prompts:**
- "Build me a portfolio site"
- "Create my personal website" 
- "I need a landing page for my business"
- "Build a web app for managing prompts"

Claude will automatically:
1. Initialize a new Next.js project from the template
2. Customize it based on your requirements
3. Add components like navigation, footer, and contact forms
4. Provide deployment instructions for Vercel

## What's Included

### Starter Template (`assets/nextjs-starter/`)
- Next.js 15 with App Router
- TypeScript configuration
- Tailwind CSS with shadcn/ui theming
- 5 pre-built UI components (Button, Card, Input, Label, Textarea)
- Responsive layout structure
- SEO-ready metadata configuration

### Component Templates (`assets/component-templates/`)
- **Header**: Sticky navigation with logo and CTA
- **Footer**: Links and social media connections
- **Contact Form**: Validated form with react-hook-form + zod
- **Blog Card**: Display blog posts with external link support

### Reference Guides (`references/`)
- **design-patterns.md**: Layout patterns, responsive design, theming, typography, accessibility, SEO
- **vercel-deployment.md**: Complete deployment workflow, custom domains, environment variables, troubleshooting

### Scripts (`scripts/`)
- **init_project.py**: Initialize new projects from template

## Tech Stack

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: High-quality component library
- **react-hook-form + zod**: Form validation
- **Vercel**: Deployment platform (optimized for Next.js)

## Key Features

✨ **Modern Design**: Clean, professional layouts with shadcn/ui components
✨ **Fully Responsive**: Mobile-first design that works on all devices
✨ **Form Validation**: Built-in validation for contact forms and inputs
✨ **Blog Integration**: Support for linking to Substack, Medium, LinkedIn, X/Twitter posts
✨ **Dark Mode Ready**: CSS variables support theme switching
✨ **SEO Optimized**: Proper metadata configuration
✨ **Production Ready**: One-click deployment to Vercel

## Example Workflow

```
User: "Build me a portfolio site with a contact form and blog section"

Claude will:
1. Run init_project.py to create a new Next.js project
2. Add Header and Footer components
3. Create a hero section with your information
4. Add the ContactForm component with validation
5. Create a blog section with BlogCard components
6. Provide deployment instructions for Vercel
7. Deliver the complete project ready to run
```

## Getting Started

After Claude creates your project:

```powershell
# Navigate to the project
cd your-project-name

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

## Deployment

Push to GitHub and deploy on Vercel (takes ~2 minutes):
1. Push your code to GitHub
2. Import repository on vercel.com
3. Click "Deploy"
4. Done! Your site is live

## Customization

Every generated site can be customized:
- Content: Edit the text, images, and links
- Styling: Modify Tailwind classes and theme variables
- Components: Add new shadcn/ui components
- Pages: Create new routes in the `app/` directory
- Features: Add API routes, authentication, database integration

## Benefits Over Manual Setup

Instead of spending 30-60 minutes setting up:
- Next.js configuration
- TypeScript setup
- Tailwind CSS integration
- shadcn/ui component installation
- Boilerplate code and structure

You get a production-ready starter in seconds, with:
- Best practices baked in
- Pre-built components ready to use
- Design patterns to follow
- Deployment guide included

## Support

Need help? Claude can:
- Explain any part of the generated code
- Add new features or components
- Debug issues
- Customize styling and layout
- Guide you through deployment

Just ask!

---

**Created with the skill-creator skill** 🎨
