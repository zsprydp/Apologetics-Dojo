"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

function encoded(message: string): string {
  return encodeURIComponent(message);
}

export async function createGroup(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const name = asString(formData.get("name")).trim();
  const description = asString(formData.get("description")).trim();

  if (!name || name.length < 2) {
    redirect(`/groups?error=${encoded("Group name must be at least 2 characters.")}`);
  }

  const { data: group, error } = await supabase
    .from("groups")
    .insert({ name, description: description || null, created_by: user.id })
    .select("id")
    .single();

  if (error || !group) {
    redirect(`/groups?error=${encoded(error?.message ?? "Failed to create group.")}`);
  }

  await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "leader",
  });

  redirect(`/groups/${group.id}`);
}

export async function joinGroup(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const code = asString(formData.get("invite_code")).trim().toLowerCase();

  if (!code) {
    redirect(`/groups?error=${encoded("Please enter an invite code.")}`);
  }

  const { data: group } = await supabase
    .from("groups")
    .select("id")
    .eq("invite_code", code)
    .maybeSingle();

  if (!group) {
    redirect(`/groups?error=${encoded("Invalid invite code.")}`);
  }

  const { data: existing } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", group.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    redirect(`/groups/${group.id}`);
  }

  await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "member",
  });

  redirect(`/groups/${group.id}`);
}
