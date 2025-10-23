# Amazing Portfolio

A modern, responsive portfolio website built with Next.js 15, TypeScript, React, and shadcn/ui. This portfolio showcases your work, skills, and blog posts with a beautiful, professional design.

## Features

✨ **Modern Design**: Clean, professional interface with gradient accents and smooth animations
🎨 **shadcn/ui Components**: Beautiful, accessible UI components
🌓 **Dark Mode Support**: Automatic theme switching with CSS variables
📱 **Fully Responsive**: Mobile-first design that looks great on all devices
⚡ **Performance Optimized**: Built with Next.js 15 for optimal speed
🎯 **SEO Ready**: Comprehensive metadata and semantic HTML
♿ **Accessible**: WCAG compliant with proper ARIA labels
📝 **Blog Integration**: Support for external blog links (Medium, Substack, LinkedIn, Twitter)
📧 **Contact Form**: Validated form with react-hook-form and zod

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Form Validation**: react-hook-form + zod
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ and npm installed on your system
- Git (for version control and deployment)

### Installation

1. Navigate to the project directory:
```powershell
cd amazing-portfolio
```

2. Install dependencies:
```powershell
npm install
```

3. Run the development server:
```powershell
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see your portfolio!

## Customization Guide

### 1. Update Personal Information

**Header & Footer (`components/header.tsx` and `components/footer.tsx`)**:
- Replace "Amazing Portfolio" with your name
- Update social media links (GitHub, LinkedIn, Twitter)
- Customize navigation links

**Home Page (`app/page.tsx`)**:
- Update the hero section with your headline and tagline
- Modify the About section with your bio
- Add your actual skills in the skills array
- Replace project examples with your real projects
- Update blog posts with your actual articles

### 2. Update Metadata

**Layout (`app/layout.tsx`)**:
- Change the title and description
- Add your OpenGraph image
- Update any other SEO metadata

### 3. Customize Colors and Theme

The project uses CSS variables for theming. Edit `app/globals.css` to change:
- Primary colors
- Background colors
- Border colors
- Font settings

### 4. Add More Pages

Create new pages in the `app/` directory:

```typescript
// app/about/page.tsx
export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-6">About Me</h1>
      {/* Your content */}
    </main>
  );
}
```

### 5. Implement Contact Form Submission

The contact form currently logs to console. To implement real email sending:

1. Choose an email service (Resend, SendGrid, or Nodemailer)
2. Create an API route at `app/api/contact/route.ts`
3. Update the `onSubmit` function in `components/contact-form.tsx`

Example with Resend:

```typescript
// app/api/contact/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const body = await request.json();
  
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: "your-email@example.com",
    subject: `Contact form: ${body.name}`,
    html: `<p>From: ${body.email}</p><p>${body.message}</p>`,
  });
  
  return NextResponse.json({ success: true });
}
```

## Deployment to Vercel

### Quick Deploy

1. Push your code to GitHub:
```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New Project"
4. Import your GitHub repository
5. Click "Deploy"

Your site will be live in minutes at `your-project.vercel.app`!

### Custom Domain (Optional)

1. In your Vercel dashboard, go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update your DNS records as instructed
5. Wait for SSL certificate provisioning (automatic)

## Project Structure

```
amazing-portfolio/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with header/footer
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── header.tsx        # Navigation header
│   ├── footer.tsx        # Site footer
│   ├── contact-form.tsx  # Contact form with validation
│   └── blog-card.tsx     # Blog post card
├── lib/                  # Utilities
│   └── utils.ts          # Helper functions
└── public/               # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Performance Tips

- Use Next.js Image component for all images
- Implement lazy loading for heavy components
- Optimize images before adding to `public/`
- Monitor bundle size with `npm run build`

## Accessibility

This portfolio follows WCAG 2.1 guidelines:
- Semantic HTML structure
- Proper heading hierarchy
- ARIA labels for interactive elements
- Keyboard navigation support
- Sufficient color contrast

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

This is a personal portfolio template. Feel free to fork and customize for your own use!

## License

MIT License - feel free to use this template for your own portfolio.

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Vercel Deployment Docs](https://vercel.com/docs)

## Support

For questions or issues, please refer to:
- Next.js: https://github.com/vercel/next.js/discussions
- shadcn/ui: https://github.com/shadcn/ui/discussions
- Tailwind CSS: https://github.com/tailwindlabs/tailwindcss/discussions

---

Built with ❤️ using Next.js, TypeScript, and shadcn/ui
