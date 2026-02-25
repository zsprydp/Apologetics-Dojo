import { createClient } from "@/lib/supabase/server";

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
    .select("id, user_id, ended_at")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!session) {
    return new Response("Session not found", { status: 404 });
  }

  if (session.ended_at) {
    return Response.json({ ok: true, alreadyEnded: true });
  }

  const { error } = await supabase
    .from("debate_sessions")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", sessionId);

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return Response.json({ ok: true });
}
