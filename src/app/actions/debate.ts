"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DIFFICULTY_LEVELS, OPPONENT_PERSONAS } from "@/lib/constants";

function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

function encoded(message: string): string {
  return encodeURIComponent(message);
}

const VALID_DIFFICULTIES: Set<string> = new Set(
  DIFFICULTY_LEVELS.map((d) => d.id)
);
const VALID_PERSONAS: Set<string> = new Set(OPPONENT_PERSONAS.map((p) => p.id));

export async function startDebateSession(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?error=Please%20sign%20in%20to%20start%20a%20session.");
  }

  const familyId = asString(formData.get("family_id"));
  const difficulty = asString(formData.get("difficulty"));
  const opponentPersonaId = asString(formData.get("opponent_persona_id"));

  if (!familyId || !difficulty || !opponentPersonaId) {
    redirect("/dashboard?error=Please%20complete%20all%20debate%20fields.");
  }

  if (!VALID_DIFFICULTIES.has(difficulty)) {
    redirect("/dashboard?error=Invalid%20difficulty%20selected.");
  }

  if (!VALID_PERSONAS.has(opponentPersonaId)) {
    redirect("/dashboard?error=Invalid%20opponent%20persona%20selected.");
  }

  const { data, error } = await supabase
    .from("debate_sessions")
    .insert({
      user_id: user.id,
      family_id: familyId,
      difficulty,
      opponent_persona_id: opponentPersonaId,
    })
    .select("id")
    .single();

  if (error || !data) {
    const message = error?.message ?? "Unable to start debate session.";
    redirect(`/dashboard?error=${encoded(message)}`);
  }

  redirect(`/debate/${data.id}`);
}
