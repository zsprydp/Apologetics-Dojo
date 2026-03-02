import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import { createGroup, joinGroup } from "@/app/actions/groups";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const error = typeof params.error === "string" ? decodeURIComponent(params.error) : null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id, role, groups:group_id(id, name, description, invite_code, created_by)")
    .eq("user_id", user.id);

  const myGroups = (memberships ?? []).map((m) => ({
    ...(m.groups as unknown as { id: string; name: string; description: string | null; invite_code: string; created_by: string }),
    role: m.role,
  }));

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <main className="mx-auto w-full max-w-3xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Groups</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create or join a study group to track progress together.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </header>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Create a group</CardTitle>
              <CardDescription>Start a new church or study group</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createGroup} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Group name</Label>
                  <Input id="name" name="name" required placeholder="e.g. Youth Apologetics" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input id="description" name="description" placeholder="What this group is about" />
                </div>
                <Button type="submit" size="sm" className="w-full">Create group</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Join a group</CardTitle>
              <CardDescription>Enter an invite code from your leader</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={joinGroup} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="invite_code">Invite code</Label>
                  <Input id="invite_code" name="invite_code" required placeholder="e.g. a1b2c3d4" className="font-mono" />
                </div>
                <Button type="submit" size="sm" variant="outline" className="w-full">Join group</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {myGroups.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">My groups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {myGroups.map((group) => (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{group.name}</p>
                    {group.description && (
                      <p className="text-xs text-muted-foreground">{group.description}</p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                    {group.role}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
