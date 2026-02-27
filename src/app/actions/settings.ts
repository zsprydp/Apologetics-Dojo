"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

function encoded(message: string): string {
  return encodeURIComponent(message);
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?error=Please%20sign%20in.");
  }

  const displayName = asString(formData.get("display_name")).trim();

  if (!displayName) {
    redirect(`/settings?error=${encoded("Display name cannot be empty.")}`);
  }

  if (displayName.length > 50) {
    redirect(`/settings?error=${encoded("Display name must be 50 characters or less.")}`);
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", user.id);

  if (error) {
    redirect(`/settings?error=${encoded(error.message)}`);
  }

  redirect(`/settings?success=${encoded("Display name updated.")}`);
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?error=Please%20sign%20in.");
  }

  const newPassword = asString(formData.get("new_password"));
  const confirmPassword = asString(formData.get("confirm_password"));

  if (!newPassword || newPassword.length < 6) {
    redirect(`/settings?error=${encoded("Password must be at least 6 characters.")}`);
  }

  if (newPassword !== confirmPassword) {
    redirect(`/settings?error=${encoded("Passwords do not match.")}`);
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    redirect(`/settings?error=${encoded(error.message)}`);
  }

  redirect(`/settings?success=${encoded("Password updated successfully.")}`);
}
