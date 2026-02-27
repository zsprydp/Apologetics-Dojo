import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  } catch {
    /* not JSON */
  }
  return null;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ScoreMini({ score }: { score: ScoreData }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="font-semibold text-sm">{score.totalPoints} pts</span>
      <span className="text-muted-foreground">
        Q{score.argument_quality} · L{score.logical_coherence} · S{score.scripture_usage} · T{score.respectful_tone}
      </span>
    </div>
  );
}

export default async function SessionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?error=Please%20sign%20in%20to%20view%20sessions.");
  }

  const { data: sessions } = await supabase
    .from("debate_sessions")
    .select("id, family_id, difficulty, opponent_persona_id, started_at, ended_at, outcome, transcript_summary")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false });

  const familyIds = [
    ...new Set((sessions ?? []).map((s) => s.family_id).filter(Boolean)),
  ];

  const { data: families } = familyIds.length
    ? await supabase
        .from("families")
        .select("id, name")
        .in("id", familyIds as string[])
    : { data: [] };

  const familyById = new Map((families ?? []).map((f) => [f.id, f.name]));
  const personaById = new Map(
    OPPONENT_PERSONAS.map((p) => [p.id, p.name])
  );
  const difficultyById = new Map(
    DIFFICULTY_LEVELS.map((d) => [d.id, d.name])
  );

  const allSessions = sessions ?? [];
  const completed = allSessions.filter((s) => s.ended_at);
  const inProgress = allSessions.filter((s) => !s.ended_at);

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <main className="mx-auto w-full max-w-4xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Session History</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {allSessions.length} total session{allSessions.length !== 1 ? "s" : ""} · {completed.length} completed
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/dashboard">New debate</Link>
            </Button>
          </div>
        </header>

        {inProgress.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">In Progress</CardTitle>
              <CardDescription>Sessions you haven&apos;t finished yet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {inProgress.map((session) => {
                const family = session.family_id
                  ? familyById.get(session.family_id) ?? "Unknown"
                  : "General";
                const persona = session.opponent_persona_id
                  ? personaById.get(session.opponent_persona_id) ?? session.opponent_persona_id
                  : "Unknown";

                return (
                  <Link
                    key={session.id}
                    href={`/debate/${session.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {family} · {persona}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {difficultyById.get(session.difficulty) ?? session.difficulty} · Started {formatDate(session.started_at)}
                      </p>
                    </div>
                    <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                      Resume
                    </span>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Completed Sessions</CardTitle>
            <CardDescription>
              Click any session to review the full transcript and score
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {completed.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No completed sessions yet. Start a debate from the{" "}
                <Link href="/dashboard" className="underline">
                  dashboard
                </Link>
                .
              </p>
            ) : (
              completed.map((session) => {
                const family = session.family_id
                  ? familyById.get(session.family_id) ?? "Unknown"
                  : "General";
                const persona = session.opponent_persona_id
                  ? personaById.get(session.opponent_persona_id) ?? session.opponent_persona_id
                  : "Unknown";
                const score = parseScore(session.outcome);

                return (
                  <Link
                    key={session.id}
                    href={`/debate/${session.id}`}
                    className="flex flex-col gap-1.5 rounded-lg border p-3 hover:bg-accent/50 transition-colors sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {family} · {persona}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {difficultyById.get(session.difficulty) ?? session.difficulty} · {formatDate(session.started_at)}
                      </p>
                      {session.transcript_summary && (
                        <p className="mt-1 text-xs text-muted-foreground italic line-clamp-1">
                          {session.transcript_summary}
                        </p>
                      )}
                    </div>
                    {score ? (
                      <div className="shrink-0">
                        <ScoreMini score={score} />
                      </div>
                    ) : (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        No score
                      </span>
                    )}
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
