import { createClient } from "@/lib/supabase/server";
import { stripe, isStripeEnabled } from "@/lib/billing/stripe";

export async function POST() {
  if (!isStripeEnabled()) {
    return new Response("Stripe not configured", { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.stripe_customer_id) {
    return new Response("No billing account found", { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe!.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${siteUrl}/settings`,
  });

  return Response.json({ url: session.url });
}
