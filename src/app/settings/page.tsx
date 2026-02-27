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
import { updateProfile, updatePassword } from "@/app/actions/settings";
import { getUserUsage } from "@/lib/billing/usage";
import { PLANS } from "@/lib/billing/plans";

type SearchParams = Record<string, string | string[] | undefined>;

function getSingle(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  return typeof value === "string" ? decodeURIComponent(value) : undefined;
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const success = getSingle(params, "success");
  const error = getSingle(params, "error");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?error=Please%20sign%20in%20to%20view%20settings.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const usage = await getUserUsage(user.id);
  const planInfo = PLANS[usage.plan];

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <main className="mx-auto w-full max-w-2xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </header>

        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {success}
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>Update your display name</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display_name">Display name</Label>
                <Input
                  id="display_name"
                  name="display_name"
                  defaultValue={profile?.display_name ?? ""}
                  placeholder="Your name"
                  required
                  minLength={1}
                  maxLength={50}
                />
              </div>
              <Button type="submit" size="sm">
                Save changes
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Change password</CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new_password">New password</Label>
                <Input
                  id="new_password"
                  name="new_password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm new password</Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Repeat new password"
                />
              </div>
              <Button type="submit" size="sm">
                Update password
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan &amp; Usage</CardTitle>
            <CardDescription>
              Current plan: <span className="font-semibold">{planInfo.name}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sessions this month</span>
              <span className="font-medium">
                {usage.sessionsThisMonth}
                {usage.limit !== Infinity ? ` / ${usage.limit}` : " (unlimited)"}
              </span>
            </div>
            {usage.limit !== Infinity && (
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(100, (usage.sessionsThisMonth / usage.limit) * 100)}%`,
                  }}
                />
              </div>
            )}
            <ul className="space-y-1 text-xs text-muted-foreground">
              {planInfo.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            {usage.plan === "free" && (
              <p className="text-xs text-muted-foreground italic">
                Upgrade to Pro for unlimited sessions and all difficulty levels. Stripe integration coming soon.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
            <CardDescription>Email: {user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Account ID: <span className="font-mono">{user.id.slice(0, 8)}…</span>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
