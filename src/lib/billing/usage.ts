import { createClient } from "@/lib/supabase/server";
import { PLANS, type PlanId } from "./plans";

export interface UsageInfo {
  plan: PlanId;
  sessionsThisMonth: number;
  limit: number;
  canStartSession: boolean;
  remaining: number;
}

export async function getUserUsage(userId: string): Promise<UsageInfo> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_plan")
    .eq("id", userId)
    .maybeSingle();

  const plan: PlanId =
    profile?.stripe_plan === "pro" ? "pro" : "free";
  const limit = PLANS[plan].sessionsPerMonth;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("debate_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("started_at", startOfMonth.toISOString());

  const sessionsThisMonth = count ?? 0;
  const remaining = Math.max(0, limit - sessionsThisMonth);

  return {
    plan,
    sessionsThisMonth,
    limit,
    canStartSession: limit === Infinity || sessionsThisMonth < limit,
    remaining: limit === Infinity ? Infinity : remaining,
  };
}
