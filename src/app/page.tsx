import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background font-sans">
      <main className="flex w-full max-w-2xl flex-col items-center gap-10 px-6 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Apologetics Dojo
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Train in apologetics through structured debate practice. Choose your opponent, defend the faith, and rank up.
        </p>
        {user ? (
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className="flex h-12 items-center justify-center rounded-full bg-primary px-6 text-primary-foreground font-medium transition-colors hover:bg-primary/90"
            >
              Go to dashboard
            </Link>
            <form action={signOut}>
              <Button type="submit" variant="outline" className="h-12 rounded-full px-6">
                Sign out
              </Button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="flex h-12 items-center justify-center rounded-full bg-primary px-6 text-primary-foreground font-medium transition-colors hover:bg-primary/90"
            >
              Get started
            </Link>
            <Link
              href="/signin"
              className="flex h-12 items-center justify-center rounded-full border border-input bg-background px-6 font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Sign in
            </Link>
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          {user
            ? "You are signed in and ready for the next build session."
            : "Session 1 complete — database and project setup ready."}
        </p>
      </main>
    </div>
  );
}
