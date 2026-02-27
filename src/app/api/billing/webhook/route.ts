import { createClient } from "@supabase/supabase-js";
import { stripe, isStripeEnabled } from "@/lib/billing/stripe";

export async function POST(req: Request) {
  if (!isStripeEnabled()) {
    return new Response("Stripe not configured", { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return new Response("Missing signature or secret", { status: 400 });
  }

  let event;
  try {
    event = stripe!.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return new Response("Missing service role key", { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  if (
    event.type === "checkout.session.completed" ||
    event.type === "customer.subscription.updated"
  ) {
    const subscription = event.type === "checkout.session.completed"
      ? event.data.object
      : event.data.object;

    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.toString();

    if (customerId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();

      if (profile) {
        await supabase
          .from("profiles")
          .update({ stripe_plan: "pro" })
          .eq("id", profile.id);
      }
    }
  }

  if (
    event.type === "customer.subscription.deleted" ||
    event.type === "invoice.payment_failed"
  ) {
    const obj = event.data.object;
    const customerId =
      typeof obj.customer === "string"
        ? obj.customer
        : obj.customer?.toString();

    if (customerId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();

      if (profile) {
        await supabase
          .from("profiles")
          .update({ stripe_plan: "free" })
          .eq("id", profile.id);
      }
    }
  }

  return Response.json({ received: true });
}
