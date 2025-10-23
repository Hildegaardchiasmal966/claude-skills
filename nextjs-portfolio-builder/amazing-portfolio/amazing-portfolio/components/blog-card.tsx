import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface BlogCardProps {
  title: string;
  description: string;
  date: string;
  slug?: string;
  externalUrl?: string;
  platform?: "substack" | "medium" | "linkedin" | "twitter";
}

export default function BlogCard({
  title,
  description,
  date,
  slug,
  externalUrl,
  platform,
}: BlogCardProps) {
  const href = externalUrl || `/blog/${slug}`;
  const isExternal = !!externalUrl;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <time dateTime={date}>{new Date(date).toLocaleDateString()}</time>
          </div>
          {platform && (
            <span className="text-xs px-2 py-1 bg-secondary rounded-md capitalize">
              {platform}
            </span>
          )}
        </div>
        <CardTitle className="hover:text-primary transition-colors">
          <Link
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
          >
            {title}
          </Link>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-sm text-primary hover:underline"
        >
          Read more →
        </Link>
      </CardContent>
    </Card>
  );
}
