import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OPPONENT_PERSONAS, DIFFICULTY_LEVELS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { ScoreData } from "@/components/debate/score-card";

function parseScore(outcome: string | null): ScoreData | null {
  if (!outcome) return null;
  try {
    const parsed = JSON.parse(outcome);
    if (typeof parsed.totalPoints === "number") return parsed as ScoreData;
  } catch { /* ignore */ }
  return null;
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}/{max}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

type PageProps = { params: Promise<{ sessionId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sessionId } = await params;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("debate_sessions")
    .select("outcome, transcript_summary, difficulty, opponent_persona_id, family_id")
    .eq("id", sessionId)
    .not("ended_at", "is", null)
    .maybeSingle();

  if (!session) return { title: "Debate Not Found — Apologetics Dojo" };

  const score = parseScore(session.outcome);
  const persona = OPPONENT_PERSONAS.find((p) => p.id === session.opponent_persona_id);
  const difficulty = DIFFICULTY_LEVELS.find((d) => d.id === session.difficulty);

  const { data: family } = session.family_id
    ? await supabase.from("families").select("name").eq("id", session.family_id).maybeSingle()
    : { data: null };

  const title = score
    ? `${score.totalPoints} pts — ${family?.name ?? "Debate"} | Apologetics Dojo`
    : `Debate Result | Apologetics Dojo`;

  const description = session.transcript_summary
    ?? `${family?.name ?? "Apologetics"} debate vs ${persona?.name ?? "AI"} at ${difficulty?.name ?? ""} difficulty.`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://apologeticsdojo.app";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${siteUrl}/share/${sessionId}`,
      siteName: "Apologetics Dojo",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SharePage({ params }: PageProps) {
  const { sessionId } = await params;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("debate_sessions")
    .select("id, outcome, transcript_summary, difficulty, opponent_persona_id, family_id, user_id, ended_at")
    .eq("id", sessionId)
    .not("ended_at", "is", null)
    .maybeSingle();

  if (!session) notFound();

  const score = parseScore(session.outcome);
  const persona = OPPONENT_PERSONAS.find((p) => p.id === session.opponent_persona_id);
  const difficulty = DIFFICULTY_LEVELS.find((d) => d.id === session.difficulty);

  const { data: family } = session.family_id
    ? await supabase.from("families").select("name").eq("id", session.family_id).maybeSingle()
    : { data: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", session.user_id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <main className="mx-auto w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Apologetics Dojo</h1>
          <p className="mt-1 text-sm text-muted-foreground">Debate Results</p>
        </div>

        <Card>
          <CardHeader className="text-center pb-2">
            <p className="text-sm text-muted-foreground">
              {profile?.display_name ?? "A student"} debated
            </p>
            <CardTitle className="text-lg">
              {family?.name ?? "General Apologetics"}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              vs {persona?.name ?? "AI"} · {difficulty?.name ?? session.difficulty}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {score ? (
              <>
                <div className="text-center">
                  <span className="text-5xl font-bold">{score.totalPoints}</span>
                  <span className="ml-1 text-sm text-muted-foreground">pts</span>
                  {score.difficultyMultiplier > 1 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {score.difficultyMultiplier}x difficulty bonus
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <ScoreBar label="Argument Quality" value={score.argument_quality} max={25} />
                  <ScoreBar label="Logical Coherence" value={score.logical_coherence} max={25} />
                  <ScoreBar label="Scripture Usage" value={score.scripture_usage} max={25} />
                  <ScoreBar label="Respectful Tone" value={score.respectful_tone} max={25} />
                </div>
                {score.feedback && (
                  <div className="rounded-md border p-3">
                    <p className="text-sm text-muted-foreground">{score.feedback}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                Session completed without scoring.
              </p>
            )}

            {session.transcript_summary && (
              <p className="text-xs text-center text-muted-foreground italic">
                {session.transcript_summary}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Think you can do better?
          </p>
          <Button asChild size="lg" className="rounded-full px-8">
            <Link href="/signup">Start training free</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
