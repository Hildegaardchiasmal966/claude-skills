import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Amazing Portfolio
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/#about"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              About
            </Link>
            <Link
              href="/#skills"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Skills
            </Link>
            <Link
              href="/#projects"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Projects
            </Link>
            <Link
              href="/#blog"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Blog
            </Link>
            <Link
              href="/#contact"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Contact
            </Link>
          </nav>
        </div>
        <Button variant="default" size="sm" asChild>
          <Link href="/#contact">Get in Touch</Link>
        </Button>
      </div>
    </header>
  );
}
