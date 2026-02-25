import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

export default async function DebateSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?error=Please%20sign%20in%20to%20view%20a%20session.");
  }

  const sessionResult = await supabase
    .from("debate_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!sessionResult.data) {
    notFound();
  }

  const session = sessionResult.data;
  const persona =
    OPPONENT_PERSONAS.find((item) => item.id === session.opponent_persona_id) ??
    null;
  const difficulty =
    DIFFICULTY_LEVELS.find((item) => item.id === session.difficulty) ?? null;

  const familyResult = session.family_id
    ? await supabase
        .from("families")
        .select("name, description")
        .eq("id", session.family_id)
        .maybeSingle()
    : null;

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <main className="mx-auto w-full max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Debate Session</CardTitle>
            <CardDescription>
              Session ID: <span className="font-mono text-xs">{session.id}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">Topic family</p>
                <p className="mt-1 font-medium">
                  {familyResult?.data?.name ?? "General"}
                </p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">Opponent persona</p>
                <p className="mt-1 font-medium">
                  {persona?.name ?? session.opponent_persona_id ?? "Unknown"}
                </p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">Difficulty</p>
                <p className="mt-1 font-medium">
                  {difficulty?.name ?? session.difficulty}
                </p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">Started</p>
                <p className="mt-1 font-medium">{formatDate(session.started_at)}</p>
              </div>
            </div>

            <div className="rounded-md border p-4">
              <h2 className="font-medium">Next implementation target</h2>
              <p className="mt-2 text-muted-foreground">
                This placeholder page confirms Session 2 wiring: auth gate, session
                creation, and per-user session loading. Next we can build the live
                debate interface and scoring loop here.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex gap-3">
            <Button asChild>
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
