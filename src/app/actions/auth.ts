"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email/send";

function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

function encoded(message: string): string {
  return encodeURIComponent(message);
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = asString(formData.get("email"));
  const password = asString(formData.get("password"));

  if (!email || !password) {
    redirect(`/signin?error=${encoded("Email and password are required.")}`);
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/signin?error=${encoded(error.message)}`);
  }

  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = asString(formData.get("email"));
  const password = asString(formData.get("password"));
  const displayName = asString(formData.get("display_name")) || undefined;

  if (!email || !password) {
    redirect(`/signup?error=${encoded("Email and password are required.")}`);
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: displayName ? { display_name: displayName } : undefined,
    },
  });

  if (error) {
    redirect(`/signup?error=${encoded(error.message)}`);
  }

  if (data.session) {
    const name = displayName ?? email.split("@")[0];
    sendWelcomeEmail(email, name).catch(() => {});
    redirect("/dashboard");
  }

  redirect(
    `/signin?message=${encoded(
      "Check your email to confirm your account, then sign in."
    )}`
  );
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
