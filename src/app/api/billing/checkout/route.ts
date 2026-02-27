import { createClient } from "@/lib/supabase/server";
import { stripe, isStripeEnabled } from "@/lib/billing/stripe";
import { PLANS } from "@/lib/billing/plans";

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

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe!.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe!.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: PLANS.pro.stripePriceId, quantity: 1 }],
    success_url: `${siteUrl}/settings?success=${encodeURIComponent("Welcome to Pro! Your subscription is active.")}`,
    cancel_url: `${siteUrl}/settings`,
    metadata: { supabase_user_id: user.id },
  });

  return Response.json({ url: session.url });
}
