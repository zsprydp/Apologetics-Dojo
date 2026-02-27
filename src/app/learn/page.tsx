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
import {
  DIFFICULTY_LEVELS,
  OPPONENT_PERSONAS,
  LEARNING_TRACK_CURRICULUM,
} from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export default async function LearnPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?error=Please%20sign%20in%20to%20view%20learning%20tracks.");
  }

  const { data: tracks } = await supabase
    .from("learning_tracks")
    .select("*")
    .order("sort_order", { ascending: true });

  const { data: families } = await supabase
    .from("families")
    .select("id, name, slug, description")
    .order("sort_order", { ascending: true });

  const { data: userSessions } = await supabase
    .from("debate_sessions")
    .select("family_id, difficulty, opponent_persona_id, ended_at, outcome")
    .eq("user_id", user.id);

  const familyBySlug = new Map(
    (families ?? []).map((f) => [f.slug, f])
  );
  const personaById = new Map(
    OPPONENT_PERSONAS.map((p) => [p.id, p])
  );
  const difficultyById = new Map(
    DIFFICULTY_LEVELS.map((d) => [d.id, d])
  );

  type CompletedKey = string;
  const completedSet = new Set<CompletedKey>();
  for (const s of userSessions ?? []) {
    if (!s.ended_at || !s.family_id) continue;
    const family = (families ?? []).find((f) => f.id === s.family_id);
    if (family) {
      completedSet.add(
        `${family.slug}::${s.difficulty}::${s.opponent_persona_id}`
      );
    }
  }

  const trackColors = ["bg-blue-50 border-blue-200", "bg-orange-50 border-orange-200", "bg-purple-50 border-purple-200"];

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <main className="mx-auto w-full max-w-4xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Learning Tracks</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Structured paths to build your apologetics skills step by step.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </header>

        {(tracks ?? []).map((track, trackIdx) => {
          const curriculum =
            LEARNING_TRACK_CURRICULUM[track.slug] ?? [];
          const completedCount = curriculum.filter((step) =>
            completedSet.has(
              `${step.familySlug}::${step.difficulty}::${step.persona}`
            )
          ).length;

          return (
            <Card key={track.id} className={trackColors[trackIdx % trackColors.length]}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{track.name}</CardTitle>
                  <span className="text-xs font-medium text-muted-foreground">
                    {completedCount}/{curriculum.length} completed
                  </span>
                </div>
                <CardDescription>{track.description}</CardDescription>
                {curriculum.length > 0 && (
                  <div className="mt-2 h-1.5 w-full rounded-full bg-background/60">
                    <div
                      className="h-1.5 rounded-full bg-primary transition-all"
                      style={{
                        width: `${curriculum.length > 0 ? (completedCount / curriculum.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {curriculum.map((step, idx) => {
                    const family = familyBySlug.get(step.familySlug);
                    const persona = personaById.get(step.persona);
                    const difficulty = difficultyById.get(step.difficulty);
                    const isCompleted = completedSet.has(
                      `${step.familySlug}::${step.difficulty}::${step.persona}`
                    );

                    if (!family) return null;

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg border bg-card p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isCompleted ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}`}>
                            {isCompleted ? "✓" : idx + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{family.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {difficulty?.name} · vs {persona?.name}
                            </p>
                          </div>
                        </div>
                        {isCompleted ? (
                          <span className="text-xs font-medium text-green-600">Done</span>
                        ) : (
                          <Button asChild size="sm" variant="outline">
                            <Link
                              href={`/dashboard?family=${family.slug}&difficulty=${step.difficulty}&persona=${step.persona}`}
                            >
                              Start
                            </Link>
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </main>
    </div>
  );
}
