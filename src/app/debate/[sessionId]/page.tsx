import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChatInterface } from "@/components/debate/chat-interface";
import { DIFFICULTY_LEVELS, OPPONENT_PERSONAS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { DebateMessage } from "@/types/database";
import type { ScoreData } from "@/components/debate/score-card";

function parseScore(outcome: string | null): ScoreData | null {
  if (!outcome) return null;
  try {
    const parsed = JSON.parse(outcome);
    if (typeof parsed.totalPoints === "number") return parsed as ScoreData;
  } catch {
    /* not JSON — old-format or empty */
  }
  return null;
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

  const { data: session } = await supabase
    .from("debate_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!session) {
    notFound();
  }

  const persona =
    OPPONENT_PERSONAS.find((p) => p.id === session.opponent_persona_id) ?? null;
  const difficulty =
    DIFFICULTY_LEVELS.find((d) => d.id === session.difficulty) ?? null;

  const familyResult = session.family_id
    ? await supabase
        .from("families")
        .select("name")
        .eq("id", session.family_id)
        .maybeSingle()
    : null;

  const { data: existingMessages } = await supabase
    .from("debate_messages")
    .select("id, role, content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })
    .returns<Pick<DebateMessage, "id" | "role" | "content">[]>();

  const chatMessages = (existingMessages ?? []).map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const savedScore = parseScore(session.outcome);

  return (
    <div className="flex h-dvh flex-col bg-background">
      <nav className="flex items-center justify-between border-b px-4 py-2">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          &larr; Dashboard
        </Link>
        <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
          {sessionId.slice(0, 8)}…
        </span>
      </nav>

      <div className="flex-1 overflow-hidden">
        <ChatInterface
          sessionId={sessionId}
          personaName={persona?.name ?? "Opponent"}
          familyName={familyResult?.data?.name ?? "General"}
          difficulty={difficulty?.name ?? session.difficulty}
          initialMessages={chatMessages}
          isEnded={!!session.ended_at}
          savedScore={savedScore}
        />
      </div>
    </div>
  );
}
