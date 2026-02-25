import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChatInterface } from "@/components/debate/chat-interface";
import { DIFFICULTY_LEVELS, OPPONENT_PERSONAS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { DebateMessage } from "@/types/database";

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

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top nav */}
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

      {/* Chat area fills remaining height */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          sessionId={sessionId}
          personaName={persona?.name ?? "Opponent"}
          familyName={familyResult?.data?.name ?? "General"}
          difficulty={difficulty?.name ?? session.difficulty}
          initialMessages={chatMessages}
          isEnded={!!session.ended_at}
        />
      </div>
    </div>
  );
}
