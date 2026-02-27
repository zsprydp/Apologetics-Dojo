import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { OPPONENT_PERSONAS, BELT_LEVELS } from "@/lib/constants";

function SwordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
      <line x1="13" y1="19" x2="19" y2="13" />
      <line x1="16" y1="16" x2="20" y2="20" />
      <line x1="19" y1="21" x2="21" y2="19" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

function BarChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

const STEPS = [
  {
    number: "1",
    title: "Pick your challenge",
    description: "Choose a topic family, difficulty level, and AI opponent persona.",
    icon: TargetIcon,
  },
  {
    number: "2",
    title: "Debate in real-time",
    description: "Defend your position against an AI opponent that adapts to your level.",
    icon: MessageIcon,
  },
  {
    number: "3",
    title: "Get scored & ranked",
    description: "Receive detailed feedback on argument quality, logic, scripture usage, and tone.",
    icon: BarChartIcon,
  },
];

const FEATURES = [
  {
    title: "6 AI Opponents",
    description: "From Friendly Skeptic to Intellectual Challenger — each persona argues differently.",
    icon: SwordIcon,
  },
  {
    title: "4 Difficulty Levels",
    description: "Beginner to Expert. Higher difficulty earns more points with a score multiplier.",
    icon: ShieldIcon,
  },
  {
    title: "Belt Ranking System",
    description: "Earn points per topic, climb from White to Black belt across 8 ranks.",
    icon: TrophyIcon,
  },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      {/* Nav */}
      <nav className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <span className="text-lg font-bold tracking-tight">Apologetics Dojo</span>
          <div className="flex gap-2">
            {user ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <form action={signOut}>
                  <Button type="submit" variant="outline" size="sm">Sign out</Button>
                </form>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/signin">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/signup">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-4 py-20 text-center sm:py-28">
        <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Free to use during beta
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Sharpen your faith through
          <span className="block text-primary">structured AI debate</span>
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Practice defending Christianity against realistic objections. Choose your opponent, debate in real-time, get scored on argument quality, and rank up through a martial-arts belt system.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          {user ? (
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg" className="rounded-full px-8">
                <Link href="/signup">Start training free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                <Link href="/signin">Sign in</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            How it works
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <step.icon className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm font-medium text-muted-foreground">Step {step.number}</p>
                <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Built for serious practice
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-none bg-muted/40">
                <CardContent className="flex flex-col items-start gap-3 pt-6">
                  <feature.icon className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Opponents */}
      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Meet your opponents
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground">
            Each AI persona argues from a distinct worldview, giving you diverse practice across different objection styles.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {OPPONENT_PERSONAS.map((persona) => (
              <div
                key={persona.id}
                className="flex items-start gap-3 rounded-xl border bg-card p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {persona.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{persona.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{persona.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Belt system */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Rank up with every debate
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground">
            Earn points based on your performance. Higher difficulty debates earn bonus multipliers. Climb through 8 belt ranks as your skills grow.
          </p>
          <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-3">
            {BELT_LEVELS.map((belt) => (
              <div
                key={belt.level}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className="h-10 w-10 rounded-full border-2 border-border"
                  style={{ backgroundColor: belt.colorHex }}
                />
                <span className="text-xs font-medium">{belt.name}</span>
                <span className="text-[10px] text-muted-foreground">{belt.minScore} pts</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t bg-primary py-16 text-primary-foreground">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to defend what you believe?
          </h2>
          <p className="max-w-md text-sm text-primary-foreground/80">
            Join Apologetics Dojo and start training today. Pick a topic, face an AI opponent, and sharpen your ability to give an answer for the hope that you have.
          </p>
          {user ? (
            <Button asChild size="lg" variant="secondary" className="rounded-full px-8">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          ) : (
            <Button asChild size="lg" variant="secondary" className="rounded-full px-8">
              <Link href="/signup">Create free account</Link>
            </Button>
          )}
          <p className="text-xs text-primary-foreground/60">
            1 Peter 3:15 — &ldquo;Always be prepared to give an answer to everyone who asks you to give the reason for the hope that you have.&rdquo;
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 text-center text-xs text-muted-foreground">
          <p>Apologetics Dojo — AI-powered apologetics training</p>
          <p>Built with Next.js, Supabase, and OpenAI</p>
        </div>
      </footer>
    </div>
  );
}
