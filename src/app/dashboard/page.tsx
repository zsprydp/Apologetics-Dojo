import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { startDebateSession } from "@/app/actions/debate";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DIFFICULTY_LEVELS, OPPONENT_PERSONAS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { BeltConfig, Profile } from "@/types/database";

type SearchParams = Record<string, string | string[] | undefined>;

function getSingle(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  return typeof value === "string" ? decodeURIComponent(value) : undefined;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

async function ensureProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  email: string | null | undefined,
  defaultBeltId: string | null
) {
  const existingResult = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle<Profile>();

  if (existingResult.data) {
    if (!existingResult.data.current_belt_id && defaultBeltId) {
      const { data: updated } = await supabase
        .from("profiles")
        .update({ current_belt_id: defaultBeltId })
        .eq("id", userId)
        .select("*")
        .single<Profile>();
      return updated ?? { ...existingResult.data, current_belt_id: defaultBeltId };
    }
    return existingResult.data;
  }

  const fallbackName = email?.split("@")[0] ?? "Student";
  const createdResult = await supabase
    .from("profiles")
    .insert({
      id: userId,
      display_name: fallbackName,
      current_belt_id: defaultBeltId,
    })
    .select("*")
    .single<Profile>();

  if (createdResult.data) {
    return createdResult.data;
  }

  const reloadResult = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle<Profile>();

  return reloadResult.data;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const error = getSingle(params, "error");
  const message = getSingle(params, "message");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?error=Please%20sign%20in%20to%20continue.");
  }

  const beltsResult = await supabase
    .from("belt_config")
    .select("*")
    .order("level", { ascending: true });
  const belts = beltsResult.data ?? [];
  const beltById = new Map<string, BeltConfig>(belts.map((belt) => [belt.id, belt]));
  const defaultBeltId = belts[0]?.id ?? null;

  const profile = await ensureProfile(supabase, user.id, user.email, defaultBeltId);
  const currentBelt = profile?.current_belt_id
    ? beltById.get(profile.current_belt_id) ?? null
    : null;

  const familiesResult = await supabase
    .from("families")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  const families = familiesResult.data ?? [];
  const familyById = new Map(families.map((family) => [family.id, family]));

  const skillScoresResult = await supabase
    .from("skill_scores")
    .select("*")
    .eq("profile_id", user.id)
    .order("score", { ascending: false })
    .limit(8);
  const skillScores = skillScoresResult.data ?? [];

  const recentSessionsResult = await supabase
    .from("debate_sessions")
    .select("id, family_id, difficulty, opponent_persona_id, started_at, ended_at, outcome")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(5);
  const recentSessions = recentSessionsResult.data ?? [];

  const personaById = new Map(OPPONENT_PERSONAS.map((persona) => [persona.id, persona]));
  const hasFamilies = families.length > 0;

  const totalScore = skillScores.reduce((sum, s) => sum + s.score, 0);
  const nextBelt = currentBelt
    ? belts.find((b) => b.level === currentBelt.level + 1) ?? null
    : belts[1] ?? null;
  const currentThreshold = currentBelt?.min_score_threshold ?? 0;
  const nextThreshold = nextBelt?.min_score_threshold ?? currentThreshold;
  const progressPct =
    nextThreshold > currentThreshold
      ? Math.min(
          100,
          Math.round(
            ((totalScore - currentThreshold) / (nextThreshold - currentThreshold)) * 100
          )
        )
      : 100;

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-xl border bg-card p-6 text-card-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Apologetics Dojo Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Signed in as <span className="font-medium">{user.email}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
              Home
            </Link>
            <form action={signOut}>
              <Button type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </div>
        </header>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-lg border px-4 py-3 text-sm text-muted-foreground">
            {message}
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your current account status and rank</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Display name</span>
                <span className="font-medium">{profile?.display_name ?? "Not set"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Current belt</span>
                <div className="flex items-center gap-2">
                  {currentBelt && (
                    <div
                      className="h-4 w-4 rounded-full border"
                      style={{ backgroundColor: currentBelt.color_hex ?? "#f5f5f5" }}
                    />
                  )}
                  <span className="font-medium">
                    {currentBelt ? `${currentBelt.name} (L${currentBelt.level})` : "Unranked"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Total points</span>
                <span className="font-medium">{totalScore} pts</span>
              </div>
              {nextBelt && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Progress to {nextBelt.name}
                    </span>
                    <span className="font-medium">
                      {totalScore} / {nextBelt.min_score_threshold}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${progressPct}%`,
                        backgroundColor: nextBelt.color_hex ?? "#facc15",
                      }}
                    />
                  </div>
                </div>
              )}
              {!nextBelt && currentBelt && currentBelt.level === 8 && (
                <p className="text-xs text-muted-foreground text-center">
                  Maximum rank achieved
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Start Debate Session</CardTitle>
              <CardDescription>Pick a family, difficulty, and opponent persona</CardDescription>
            </CardHeader>
            <CardContent>
              {hasFamilies ? (
                <form action={startDebateSession} className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label htmlFor="family_id" className="text-sm font-medium">
                      Topic family
                    </label>
                    <select
                      id="family_id"
                      name="family_id"
                      required
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    >
                      {families.map((family) => (
                        <option key={family.id} value={family.id}>
                          {family.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="difficulty" className="text-sm font-medium">
                      Difficulty
                    </label>
                    <select
                      id="difficulty"
                      name="difficulty"
                      required
                      defaultValue="beginner"
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    >
                      {DIFFICULTY_LEVELS.map((difficulty) => (
                        <option key={difficulty.id} value={difficulty.id}>
                          {difficulty.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="opponent_persona_id" className="text-sm font-medium">
                      Opponent persona
                    </label>
                    <select
                      id="opponent_persona_id"
                      name="opponent_persona_id"
                      required
                      defaultValue="skeptic"
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    >
                      {OPPONENT_PERSONAS.map((persona) => (
                        <option key={persona.id} value={persona.id}>
                          {persona.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <Button type="submit" className="w-full md:w-auto">
                      Start session
                    </Button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No topic families found yet. Run a seed migration for `families` before starting
                  a debate session.
                </p>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                This creates a `debate_sessions` row and opens the session page.
              </p>
            </CardFooter>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent sessions</CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>Latest 5 debate attempts</span>
                <Link href="/sessions" className="text-xs underline hover:no-underline">
                  View all
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sessions yet.</p>
              ) : (
                recentSessions.map((session) => {
                  const familyName = session.family_id
                    ? familyById.get(session.family_id)?.name ?? "Unknown family"
                    : "General";
                  const persona = session.opponent_persona_id
                    ? personaById.get(session.opponent_persona_id)?.name ?? session.opponent_persona_id
                    : "Unknown persona";
                  let pts: number | null = null;
                  try {
                    const parsed = JSON.parse(session.outcome ?? "");
                    if (typeof parsed.totalPoints === "number") pts = parsed.totalPoints;
                  } catch { /* ignore */ }

                  return (
                    <Link
                      key={session.id}
                      href={`/debate/${session.id}`}
                      className="flex items-center justify-between rounded-md border p-3 hover:bg-accent/50"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {familyName} · {persona}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {session.difficulty} · {formatDate(session.started_at)}
                        </p>
                      </div>
                      {pts !== null ? (
                        <span className="shrink-0 text-sm font-semibold">{pts} pts</span>
                      ) : !session.ended_at ? (
                        <span className="shrink-0 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                          In progress
                        </span>
                      ) : null}
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skill snapshot</CardTitle>
              <CardDescription>Current score by family</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {skillScores.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No skill scores yet. Complete a few sessions to populate this panel.
                </p>
              ) : (
                skillScores.map((score) => {
                  const familyName =
                    familyById.get(score.family_id)?.name ?? "Unknown family";
                  const beltName = score.belt_id
                    ? beltById.get(score.belt_id)?.name ?? "Unranked"
                    : "Unranked";

                  return (
                    <div key={score.id} className="rounded-md border p-3">
                      <p className="text-sm font-medium">{familyName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Score {score.score} · Belt {beltName}
                      </p>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
