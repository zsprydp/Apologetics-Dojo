import { createClient } from "@/lib/supabase/server";
import { evaluateDebate, type ScoringResult } from "@/lib/ai/scoring";
import { OPPONENT_PERSONAS, DIFFICULTY_LEVELS } from "@/lib/constants";
import type { DifficultyId } from "@/lib/constants";

export const maxDuration = 60;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { sessionId } = (await req.json()) as { sessionId: string };

  if (!sessionId) {
    return new Response("Missing sessionId", { status: 400 });
  }

  const { data: session } = await supabase
    .from("debate_sessions")
    .select("*, families:family_id(name)")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!session) {
    return new Response("Session not found", { status: 404 });
  }

  if (session.ended_at) {
    return Response.json({ ok: true, alreadyEnded: true });
  }

  await supabase
    .from("debate_sessions")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", sessionId);

  const { data: messages } = await supabase
    .from("debate_messages")
    .select("role, content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  const transcript = (messages ?? []).filter(
    (m) => !(m.role === "user" && m.content === "[BEGIN DEBATE]")
  );

  if (transcript.length < 2) {
    return Response.json({ ok: true, scored: false });
  }

  const family = session.families as { name: string } | null;
  const persona = OPPONENT_PERSONAS.find(
    (p) => p.id === session.opponent_persona_id
  );

  let scoring: ScoringResult | null = null;
  try {
    scoring = await evaluateDebate(
      transcript,
      family?.name ?? "General",
      persona?.name ?? "Opponent",
      (session.difficulty ?? "beginner") as DifficultyId
    );
  } catch {
    return Response.json({ ok: true, scored: false, error: "Scoring failed" });
  }

  const scorePayload = {
    totalPoints: scoring.totalPoints,
    basePoints: scoring.basePoints,
    difficultyMultiplier: scoring.difficultyMultiplier,
    argument_quality: scoring.raw.argument_quality,
    logical_coherence: scoring.raw.logical_coherence,
    scripture_usage: scoring.raw.scripture_usage,
    respectful_tone: scoring.raw.respectful_tone,
    feedback: scoring.raw.feedback,
    summary: scoring.raw.summary,
  };

  await supabase
    .from("debate_sessions")
    .update({
      outcome: JSON.stringify(scorePayload),
      transcript_summary: scoring.raw.summary,
    })
    .eq("id", sessionId);

  if (session.family_id) {
    const { data: existing } = await supabase
      .from("skill_scores")
      .select("id, score")
      .eq("profile_id", user.id)
      .eq("family_id", session.family_id)
      .maybeSingle();

    const newScore = (existing?.score ?? 0) + scoring.totalPoints;

    if (existing) {
      await supabase
        .from("skill_scores")
        .update({ score: newScore })
        .eq("id", existing.id);
    } else {
      await supabase.from("skill_scores").insert({
        profile_id: user.id,
        family_id: session.family_id,
        score: newScore,
      });
    }

    const { data: belts } = await supabase
      .from("belt_config")
      .select("id, level, min_score_threshold")
      .order("level", { ascending: false });

    if (belts) {
      const newBelt = belts.find((b) => newScore >= b.min_score_threshold);
      if (newBelt) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("current_belt_id")
          .eq("id", user.id)
          .maybeSingle();

        const currentBelt = belts.find(
          (b) => b.id === profile?.current_belt_id
        );

        if (!currentBelt || newBelt.level > currentBelt.level) {
          await supabase
            .from("profiles")
            .update({ current_belt_id: newBelt.id })
            .eq("id", user.id);
        }
      }
    }
  }

  return Response.json({
    ok: true,
    scored: true,
    score: {
      totalPoints: scoring.totalPoints,
      basePoints: scoring.basePoints,
      difficultyMultiplier: scoring.difficultyMultiplier,
      argument_quality: scoring.raw.argument_quality,
      logical_coherence: scoring.raw.logical_coherence,
      scripture_usage: scoring.raw.scripture_usage,
      respectful_tone: scoring.raw.respectful_tone,
      feedback: scoring.raw.feedback,
      summary: scoring.raw.summary,
    },
  });
}
