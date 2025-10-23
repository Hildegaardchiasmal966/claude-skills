import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ContactForm from "@/components/contact-form";
import BlogCard from "@/components/blog-card";
import { ArrowRight, Code2, Palette, Rocket, Zap, Globe, Database } from "lucide-react";

export default function Home() {
  const skills = [
    {
      icon: Code2,
      title: "Frontend Development",
      description: "React, Next.js, TypeScript, and modern JavaScript frameworks"
    },
    {
      icon: Palette,
      title: "UI/UX Design",
      description: "Creating beautiful, intuitive user interfaces with Tailwind CSS"
    },
    {
      icon: Database,
      title: "Backend Systems",
      description: "Node.js, databases, APIs, and server-side architecture"
    },
    {
      icon: Rocket,
      title: "Performance",
      description: "Optimizing applications for speed and scalability"
    },
    {
      icon: Globe,
      title: "Web Standards",
      description: "Accessibility, SEO, and modern web best practices"
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Staying current with cutting-edge technologies and trends"
    }
  ];

  const projects = [
    {
      title: "E-Commerce Platform",
      description: "A full-stack e-commerce solution with payment integration, inventory management, and real-time analytics.",
      tags: ["Next.js", "TypeScript", "PostgreSQL", "Stripe"],
      link: "#"
    },
    {
      title: "AI Content Generator",
      description: "An AI-powered content creation tool that helps writers generate engaging articles and social media posts.",
      tags: ["React", "OpenAI", "Node.js", "MongoDB"],
      link: "#"
    },
    {
      title: "Project Management Dashboard",
      description: "A comprehensive dashboard for teams to track projects, collaborate, and manage workflows efficiently.",
      tags: ["Next.js", "shadcn/ui", "Prisma", "tRPC"],
      link: "#"
    }
  ];

  const blogPosts = [
    {
      title: "Building Modern Web Applications with Next.js 15",
      description: "Explore the latest features in Next.js 15 and how they revolutionize web development.",
      date: "2025-10-10",
      platform: "medium" as const,
      externalUrl: "https://medium.com/@yourusername/nextjs-15-features"
    },
    {
      title: "The Future of UI: shadcn/ui and Component Libraries",
      description: "Why shadcn/ui is changing how we think about component libraries and design systems.",
      date: "2025-09-25",
      platform: "substack" as const,
      externalUrl: "https://yoursubstack.substack.com/shadcn-ui"
    },
    {
      title: "TypeScript Best Practices for Large-Scale Applications",
      description: "Essential patterns and practices for maintaining type safety in complex TypeScript projects.",
      date: "2025-09-15",
      platform: "linkedin" as const,
      externalUrl: "https://linkedin.com/pulse/typescript-best-practices"
    }
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 md:py-32">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Amazing Portfolio
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Crafting exceptional digital experiences through innovative design and cutting-edge technology
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link href="/#projects">
                View Projects <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/#contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">About Me</h2>
            <p className="text-lg text-muted-foreground">
              I'm a passionate developer and designer dedicated to creating beautiful, functional web applications. 
              With years of experience in modern web technologies, I specialize in building scalable solutions 
              that delight users and drive business results.
            </p>
            <p className="text-lg text-muted-foreground">
              My approach combines technical expertise with creative problem-solving, ensuring every project 
              not only meets requirements but exceeds expectations. I believe in writing clean, maintainable 
              code and creating intuitive user experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="border-t">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Skills & Expertise</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Leveraging modern technologies to build exceptional digital products
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill, index) => {
              const Icon = skill.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{skill.title}</CardTitle>
                    <CardDescription>{skill.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Featured Projects</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Showcasing some of my best work and recent accomplishments
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader>
                  <CardTitle className="hover:text-primary transition-colors">
                    <Link href={project.link}>{project.title}</Link>
                  </CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="text-xs px-2 py-1 bg-secondary rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={project.link}
                    className="text-sm text-primary hover:underline inline-flex items-center"
                  >
                    View Project <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="border-t">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Latest Articles</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Thoughts on development, design, and the future of the web
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post, index) => (
              <BlogCard key={index} {...post} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Get in Touch</h2>
              <p className="text-lg text-muted-foreground">
                Have a project in mind? Let's work together to bring your ideas to life.
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Send me a message</CardTitle>
                <CardDescription>
                  Fill out the form below and I'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
