import { createClient } from "@supabase/supabase-js";
import { sendWeeklyDigest } from "@/lib/email/send";
import { isEmailEnabled } from "@/lib/email/client";

export const maxDuration = 60;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!isEmailEnabled()) {
    return Response.json({ ok: false, reason: "Email not configured" });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return Response.json({ ok: false, reason: "Missing service role key" });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const oneWeekAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name");

  if (!profiles || profiles.length === 0) {
    return Response.json({ ok: true, sent: 0 });
  }

  const { data: belts } = await supabase
    .from("belt_config")
    .select("id, name")
    .order("level", { ascending: true });

  const beltById = new Map((belts ?? []).map((b) => [b.id, b.name]));

  const { data: allScores } = await supabase.from("skill_scores").select("*");
  const { data: allFamilies } = await supabase.from("families").select("id, name");
  const familyById = new Map(
    (allFamilies ?? []).map((f) => [f.id, f.name])
  );

  let sent = 0;

  for (const profile of profiles) {
    const { data: authUser } = await supabase.auth.admin.getUserById(
      profile.id
    );
    const email = authUser?.user?.email;
    if (!email) continue;

    const { data: recentSessions } = await supabase
      .from("debate_sessions")
      .select("outcome")
      .eq("user_id", profile.id)
      .gte("ended_at", oneWeekAgo)
      .not("ended_at", "is", null);

    const sessions = recentSessions ?? [];
    let pointsThisWeek = 0;
    for (const s of sessions) {
      try {
        const parsed = JSON.parse(s.outcome ?? "");
        if (typeof parsed.totalPoints === "number")
          pointsThisWeek += parsed.totalPoints;
      } catch {
        /* skip */
      }
    }

    const userScores = (allScores ?? []).filter(
      (s) => s.profile_id === profile.id
    );
    const totalPoints = userScores.reduce((sum, s) => sum + s.score, 0);

    const topScore = userScores.sort((a, b) => b.score - a.score)[0];
    const topFamily = topScore ? familyById.get(topScore.family_id) ?? null : null;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("current_belt_id")
      .eq("id", profile.id)
      .single();

    const currentBelt = profileData?.current_belt_id
      ? beltById.get(profileData.current_belt_id) ?? "White"
      : "White";

    const ok = await sendWeeklyDigest(
      email,
      profile.display_name ?? "Student",
      {
        sessionsThisWeek: sessions.length,
        pointsThisWeek,
        totalPoints,
        currentBelt,
        topFamily,
      }
    );

    if (ok) sent++;
  }

  return Response.json({ ok: true, sent });
}
