import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) notFound();

  const { data: group } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (!group) notFound();

  const { data: members } = await supabase
    .from("group_members")
    .select("user_id, role, joined_at, profiles:user_id(display_name, current_belt_id)")
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true });

  const memberIds = (members ?? []).map((m) => m.user_id);

  const { data: allScores } = memberIds.length
    ? await supabase
        .from("skill_scores")
        .select("profile_id, score")
        .in("profile_id", memberIds)
    : { data: [] };

  const { data: recentSessions } = memberIds.length
    ? await supabase
        .from("debate_sessions")
        .select("user_id, family_id, difficulty, started_at, ended_at, outcome")
        .in("user_id", memberIds)
        .not("ended_at", "is", null)
        .order("ended_at", { ascending: false })
        .limit(10)
    : { data: [] };

  const { data: belts } = await supabase
    .from("belt_config")
    .select("id, name, color_hex, level")
    .order("level");

  const { data: families } = await supabase
    .from("families")
    .select("id, name");

  const beltById = new Map((belts ?? []).map((b) => [b.id, b]));
  const familyById = new Map((families ?? []).map((f) => [f.id, f.name]));
  const profileById = new Map(
    (members ?? []).map((m) => {
      const p = m.profiles as unknown as { display_name: string | null; current_belt_id: string | null };
      return [m.user_id, p];
    })
  );

  const scoreTotals = new Map<string, number>();
  for (const s of allScores ?? []) {
    scoreTotals.set(s.profile_id, (scoreTotals.get(s.profile_id) ?? 0) + s.score);
  }

  const sortedMembers = [...(members ?? [])].sort((a, b) => {
    return (scoreTotals.get(b.user_id) ?? 0) - (scoreTotals.get(a.user_id) ?? 0);
  });

  const isLeader = membership.role === "leader";

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <main className="mx-auto w-full max-w-4xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{group.name}</h1>
            {group.description && (
              <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/groups">All groups</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </header>

        {isLeader && (
          <div className="rounded-lg border bg-muted/40 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Invite code</p>
              <p className="font-mono text-lg font-bold tracking-widest">{group.invite_code}</p>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs text-right">
              Share this code with group members so they can join.
            </p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leaderboard</CardTitle>
            <CardDescription>{sortedMembers.length} member{sortedMembers.length !== 1 ? "s" : ""}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sortedMembers.map((member, idx) => {
                const profile = profileById.get(member.user_id);
                const total = scoreTotals.get(member.user_id) ?? 0;
                const belt = profile?.current_belt_id ? beltById.get(profile.current_belt_id) : null;

                return (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                        {idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        {belt && (
                          <div
                            className="h-3.5 w-3.5 rounded-full border"
                            style={{ backgroundColor: belt.color_hex ?? "#f5f5f5" }}
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {profile?.display_name ?? "Student"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {belt?.name ?? "White"} belt · {member.role}
                          </p>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-semibold">{total} pts</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
            <CardDescription>Latest completed debates from group members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {(recentSessions ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No completed debates yet.</p>
            ) : (
              (recentSessions ?? []).map((session, i) => {
                const profile = profileById.get(session.user_id);
                const familyName = session.family_id ? familyById.get(session.family_id) ?? "General" : "General";
                let pts: number | null = null;
                try {
                  const p = JSON.parse(session.outcome ?? "");
                  if (typeof p.totalPoints === "number") pts = p.totalPoints;
                } catch { /* ignore */ }

                return (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">
                        {profile?.display_name ?? "Student"} · {familyName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.difficulty} · {new Date(session.started_at).toLocaleDateString()}
                      </p>
                    </div>
                    {pts !== null && (
                      <span className="text-sm font-semibold">{pts} pts</span>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
