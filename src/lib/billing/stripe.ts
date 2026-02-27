import Stripe from "stripe";

const apiKey = process.env.STRIPE_SECRET_KEY;

export const stripe = apiKey
  ? new Stripe(apiKey)
  : null;

export function isStripeEnabled(): boolean {
  return stripe !== null;
}
