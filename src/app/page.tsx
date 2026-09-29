import Link from "next/link";
import {
  ArrowRightIcon,
  BellRingIcon,
  BriefcaseIcon,
  ChartNoAxesColumnIcon,
  ClipboardPasteIcon,
  FileSearchIcon,
  FileTextIcon,
  KanbanSquareIcon,
  Link2Icon,
  ScanTextIcon,
  SparklesIcon,
  UploadIcon,
  ZapIcon,
} from "lucide-react";
import { AiBadge } from "@/components/ui/ai-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GlassCard, GlassCardSheen } from "@/components/ui/glass-card";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "cn";

/**
 * Public JobFlow AI landing page.
 *
 * Server-rendered marketing surface only: every capability below maps to an
 * existing product route or API-backed feature (capture, jobs pipeline,
 * resume intelligence, resume-job matching, deadline reminders, career
 * analytics). No metrics, testimonials, or integrations are claimed.
 */

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "AI Resume", href: "#ai-resume" },
] as const;

const FEATURES = [
  {
    icon: ScanTextIcon,
    title: "AI Job Capture",
    description:
      "Paste a posting, upload a PDF, drop a screenshot, or share a link. AI reads it and creates a structured opportunity card.",
    points: ["Text, PDF, image, and URL intake", "Inline AI extraction"],
  },
  {
    icon: KanbanSquareIcon,
    title: "Application Tracking",
    description:
      "Move every opportunity through saved, preparing, applied, interview, offer, and rejected — with notes and deadlines attached.",
    points: ["Pipeline board and detail view", "Deadline reminders built in"],
  },
  {
    icon: FileSearchIcon,
    title: "Resume Intelligence",
    description:
      "Upload a resume and AI pulls out skills, experience, projects, and education, then scores it and flags what is missing.",
    points: ["Skills and experience breakdown", "AI score and gap analysis"],
  },
  {
    icon: SparklesIcon,
    title: "AI Job Matching",
    description:
      "Score any resume against any saved job to see matched skills, missing skills, and concrete next-step recommendations.",
    points: ["Match score per job", "Actionable recommendations"],
  },
] as const;

const STEPS = [
  {
    icon: ClipboardPasteIcon,
    step: "Step 1",
    title: "Capture",
    description:
      "Bring the posting however you found it — pasted text, PDF, screenshot, or link.",
  },
  {
    icon: ZapIcon,
    step: "Step 2",
    title: "AI Extract",
    description:
      "AI pulls out the role, company, location, salary, deadline, and required skills.",
  },
  {
    icon: BriefcaseIcon,
    step: "Step 3",
    title: "Track",
    description:
      "Work the pipeline, log notes, set deadline reminders, and stay on schedule.",
  },
  {
    icon: FileTextIcon,
    step: "Step 4",
    title: "Match & Improve",
    description:
      "Match your resume to the role, review gaps, and sharpen the next application.",
  },
] as const;

const AI_CAPABILITIES = [
  {
    icon: ScanTextIcon,
    title: "Posting extraction",
    description:
      "Title, company, location, salary, deadline, skills, and quality signals — extracted from the original posting.",
    href: "/jobs/create",
    linkLabel: "Try job capture",
  },
  {
    icon: FileTextIcon,
    title: "Resume analysis",
    description:
      "Summary, skills, experience, education, projects, ATS-style score, and missing information for every upload.",
    href: "/resume",
    linkLabel: "Explore resume intelligence",
  },
  {
    icon: SparklesIcon,
    title: "Resume-to-job matching",
    description:
      "Match score with matched and missing skills plus recommendations, generated per resume and job pair.",
    href: "/resume",
    linkLabel: "See how matching works",
  },
  {
    icon: ChartNoAxesColumnIcon,
    title: "Career analytics",
    description:
      "Career score, pipeline funnel, skill gaps, target roles, and insights computed from your own tracked records.",
    href: "/analytics",
    linkLabel: "View analytics",
  },
  {
    icon: BellRingIcon,
    title: "Deadline reminders",
    description:
      "Choose how many days ahead to be alerted and get in-app and email reminders before a deadline passes.",
    href: "/notifications",
    linkLabel: "Manage reminders",
  },
  {
    icon: UploadIcon,
    title: "Flexible AI setup",
    description:
      "Use JobFlow AI, bring your own Gemini API key, or let automatic mode switch between the two.",
    href: "/settings/ai",
    linkLabel: "Open AI settings",
  },
] as const;

function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="JobFlow AI home"
      className={cn(
        "inline-flex items-center gap-2.5 font-heading text-base font-semibold tracking-tight text-foreground",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-8 items-center justify-center rounded-xl bg-ai text-ai-foreground shadow-card"
      >
        <ZapIcon className="size-4" />
      </span>
      JobFlow AI
    </Link>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Primary" className="ml-6 hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
          >
            Log in
          </Link>
          <Link href="/register" className={buttonVariants({ size: "sm" })}>
            Get Started
            <ArrowRightIcon aria-hidden="true" />
          </Link>
        </div>
      </div>
      <nav
        aria-label="Sections"
        className="flex items-center gap-1 overflow-x-auto border-t border-border/60 px-4 py-2 md:hidden"
      >
        {NAV_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/login"
          className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-foreground"
        >
          Log in
        </Link>
      </nav>
    </header>
  );
}

function DashboardPreview() {
  return (
    <div
      role="img"
      aria-label="Illustrated preview of a JobFlow AI opportunity card with extraction, match, and deadline panels."
      className="relative"
    >
      <GlassCard className="p-4 sm:p-5">
        <GlassCardSheen />
        <div className="relative space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex size-10 items-center justify-center rounded-xl bg-primary/12 font-heading text-sm font-semibold text-primary"
              >
                FE
              </span>
              <div>
                <p className="font-heading text-card-title text-foreground">
                  Frontend Engineer
                </p>
                <p className="text-caption text-muted-foreground">
                  Example opportunity card
                </p>
              </div>
            </div>
            <StatusPill label="Saved" tone="primary" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-ai/25 bg-ai/[0.06] p-3">
              <p className="flex items-center gap-1.5 text-micro font-medium text-ai">
                <SparklesIcon aria-hidden="true" className="size-3" />
                AI extraction
              </p>
              <p className="mt-1.5 font-heading text-lg font-semibold text-foreground">
                Detected
              </p>
              <p className="text-micro text-muted-foreground">Confidence score</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 shadow-card">
              <p className="flex items-center gap-1.5 text-micro font-medium text-muted-foreground">
                <FileTextIcon aria-hidden="true" className="size-3" />
                Resume match
              </p>
              <p className="mt-1.5 font-heading text-lg font-semibold text-foreground">
                Scored
              </p>
              <p className="text-micro text-muted-foreground">Best resume fit</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 shadow-card">
              <p className="flex items-center gap-1.5 text-micro font-medium text-muted-foreground">
                <BellRingIcon aria-hidden="true" className="size-3" />
                Deadline
              </p>
              <p className="mt-1.5 font-heading text-lg font-semibold text-foreground">
                Scheduled
              </p>
              <p className="text-micro text-muted-foreground">Reminder scheduled</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5" aria-hidden="true">
            {["React", "TypeScript", "Next.js", "REST APIs"].map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
            <span className={cn(buttonVariants({ size: "sm" }), "pointer-events-none")}>
              View job
            </span>
            <AiBadge className="ml-auto">Sample layout</AiBadge>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden">
      <div aria-hidden="true" className="ai-wash pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div className="space-y-6">
          <Badge variant="secondary" className="gap-1.5 py-1 pl-1.5">
            <AiBadge className="border-0 bg-ai/15 px-1.5">AI</AiBadge>
            Capture · Track · Match
          </Badge>
          <div className="space-y-4">
            <h1
              id="hero-heading"
              className="max-w-xl font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
            >
              Manage every job opportunity with AI doing the busywork
            </h1>
            <p className="max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
              Capture any posting in seconds, keep applications organized in one
              pipeline, and match your resume to each role.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}>
              Get Started Free
              <ArrowRightIcon aria-hidden="true" />
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}
            >
              Sign In
            </Link>
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <li className="inline-flex items-center gap-1.5">
              <ClipboardPasteIcon aria-hidden="true" className="size-4 text-ai" />
              Text, PDF, image, or link intake
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Link2Icon aria-hidden="true" className="size-4 text-ai" />
              Structured job cards
            </li>
            <li className="inline-flex items-center gap-1.5">
              <BellRingIcon aria-hidden="true" className="size-4 text-ai" />
              Deadline reminders
            </li>
          </ul>
        </div>
        <DashboardPreview />
      </div>
    </section>
  );
}

function Features() {
  return (
    <section aria-labelledby="features-heading" id="features" className="scroll-mt-24">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-medium text-ai">Features</p>
          <h2 id="features-heading" className="font-heading text-3xl font-semibold tracking-tight text-balance">
            Everything your job search needs in one workspace
          </h2>
          <p className="text-pretty text-muted-foreground">
            From the first captured posting to the final application, jobs feed
            the pipeline, resumes feed matches, and reminders keep it on time.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="h-full">
              <CardHeader>
                <span className="flex size-9 items-center justify-center rounded-xl bg-ai/12 text-ai">
                  <feature.icon aria-hidden="true" className="size-4" />
                </span>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {feature.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span aria-hidden="true" className="mt-2 size-1 rounded-full bg-ai" />
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      id="how-it-works"
      className="scroll-mt-24 border-y border-border/70 bg-surface/50"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-medium text-ai">How it works</p>
          <h2 id="how-it-works-heading" className="font-heading text-3xl font-semibold tracking-tight text-balance">
            From posting to application in four steps
          </h2>
          <p className="text-pretty text-muted-foreground">
            Repeat this loop for every role: capture it, let AI structure it,
            track it, and match your resume before you apply.
          </p>
        </div>
        <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item) => (
            <li key={item.title}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
                      <item.icon aria-hidden="true" className="size-4" />
                    </span>
                    <span className="text-micro font-medium text-muted-foreground">
                      {item.step}
                    </span>
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function AiCapabilities() {
  return (
    <section aria-labelledby="ai-heading" id="ai-resume" className="scroll-mt-24">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-4 lg:sticky lg:top-24">
            <p className="text-sm font-medium text-ai">AI capabilities</p>
            <h2 id="ai-heading" className="font-heading text-3xl font-semibold tracking-tight text-balance">
              AI that reads postings and resumes
            </h2>
            <p className="text-pretty text-muted-foreground">
              Every capability below already exists in the product. Extraction
              creates structured jobs, analysis scores your resume, matching
              links the two, and analytics plus reminders keep things moving.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className={buttonVariants({ variant: "ai" })}>
                <SparklesIcon aria-hidden="true" />
                Get Started Free
              </Link>
              <Link href="/resume" className={buttonVariants({ variant: "outline" })}>
                <FileTextIcon aria-hidden="true" />
                Review resume intelligence
              </Link>
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {AI_CAPABILITIES.map((item) => (
              <li key={item.title}>
                <Card className="h-full">
                  <CardHeader>
                    <span className="flex size-9 items-center justify-center rounded-xl bg-ai/12 text-ai">
                      <item.icon aria-hidden="true" className="size-4" />
                    </span>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-ai underline-offset-4 hover:underline"
                    >
                      {item.linkLabel}
                      <ArrowRightIcon aria-hidden="true" className="size-3.5" />
                    </Link>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section aria-labelledby="cta-heading" className="px-4 pb-14 sm:px-6 sm:pb-20">
      <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border border-ai/25 bg-ai/[0.06] px-6 py-12 shadow-card sm:px-10 sm:py-16">
        <div aria-hidden="true" className="ai-wash pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-2xl space-y-5 text-center">
          <AiBadge>Ready when you are</AiBadge>
          <h2 id="cta-heading" className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Stop juggling tabs. Start moving applications forward.
          </h2>
          <p className="mx-auto max-w-xl text-pretty text-muted-foreground">
            Create an account, capture your first posting, upload your resume,
            and see exactly where every opportunity stands.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/register" className={cn(buttonVariants({ variant: "ai", size: "lg" }), "w-full sm:w-auto")}>
              Get Started Free
              <ArrowRightIcon aria-hidden="true" />
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">
            AI-powered job management: capture postings, track applications,
            and match your resume to the right roles.
          </p>
        </div>
        <nav aria-label="Product" className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div className="space-y-3">
            <p className="font-medium text-foreground">Product</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="#features" className="transition-colors hover:text-foreground">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="transition-colors hover:text-foreground">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="#ai-resume" className="transition-colors hover:text-foreground">
                  AI Resume
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="font-medium text-foreground">Workspace</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-foreground">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="transition-colors hover:text-foreground">
                  Jobs
                </Link>
              </li>
              <li>
                <Link href="/applications" className="transition-colors hover:text-foreground">
                  Applications
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="font-medium text-foreground">Account</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/login" className="transition-colors hover:text-foreground">
                  Log in
                </Link>
              </li>
              <li>
                <Link href="/register" className="transition-colors hover:text-foreground">
                  Get Started
                </Link>
              </li>
              <li>
                <Link href="/resume" className="transition-colors hover:text-foreground">
                  Resume
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} JobFlow AI. All rights reserved.</p>
          <p>Capture, organize, track, and match your job opportunities with AI.</p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:text-foreground"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="flex w-full flex-1 flex-col">
        <Hero />
        <Features />
        <HowItWorks />
        <AiCapabilities />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

