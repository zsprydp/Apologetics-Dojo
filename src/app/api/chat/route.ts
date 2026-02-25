import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { createClient } from "@/lib/supabase/server";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import type { OpponentPersonaId, DifficultyId } from "@/lib/constants";

export const maxDuration = 60;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { messages, sessionId } = body as {
    messages: UIMessage[];
    sessionId: string;
  };

  if (!sessionId || typeof sessionId !== "string") {
    return new Response("Missing sessionId", { status: 400 });
  }

  const { data: session } = await supabase
    .from("debate_sessions")
    .select("*, families:family_id(name, description)")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!session) {
    return new Response("Session not found", { status: 404 });
  }

  if (session.ended_at) {
    return new Response("Session has ended", { status: 400 });
  }

  const family = session.families as { name: string; description: string | null } | null;

  const systemPrompt = buildSystemPrompt({
    personaId: (session.opponent_persona_id ?? "skeptic") as OpponentPersonaId,
    difficultyId: (session.difficulty ?? "beginner") as DifficultyId,
    familyName: family?.name ?? "General Apologetics",
    familyDescription: family?.description ?? null,
  });

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  if (lastUserMessage) {
    const textContent = lastUserMessage.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("") ?? "";

    if (textContent && textContent !== "[BEGIN DEBATE]") {
      await supabase.from("debate_messages").insert({
        session_id: sessionId,
        role: "user",
        content: textContent,
      });
    }
  }

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages: modelMessages,
    onFinish: async ({ text }) => {
      await supabase.from("debate_messages").insert({
        session_id: sessionId,
        role: "assistant",
        content: text,
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
