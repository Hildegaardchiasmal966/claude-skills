import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Amazing Portfolio - Web Developer & Designer",
  description: "Crafting exceptional digital experiences through innovative design and cutting-edge technology. Specialized in Next.js, React, TypeScript, and modern web development.",
  openGraph: {
    title: "Amazing Portfolio - Web Developer & Designer",
    description: "Crafting exceptional digital experiences through innovative design and cutting-edge technology.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
