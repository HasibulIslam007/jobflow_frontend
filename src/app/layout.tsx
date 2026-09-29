import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JobFlow AI — AI-Powered Job Management",
  description:
    "Capture, organize, track, and match your job opportunities with AI.",
};

/**
 * Design system: dark-first. `dark` is set statically on <html> so the
 * palette in globals.css resolves on first paint (no flash, no
 * hydration mismatch). `suppressHydrationWarning` keeps React from
 * complaining about className during SSR.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
          <Toaster position="top-right" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
