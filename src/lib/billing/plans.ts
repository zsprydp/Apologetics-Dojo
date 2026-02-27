export const PLANS = {
  free: {
    name: "Free",
    sessionsPerMonth: 5,
    features: [
      "5 debate sessions per month",
      "All 6 AI opponents",
      "Beginner & Intermediate difficulty",
      "Basic scoring & feedback",
    ],
  },
  pro: {
    name: "Pro",
    sessionsPerMonth: Infinity,
    priceMonthly: 9,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
    features: [
      "Unlimited debate sessions",
      "All 6 AI opponents",
      "All 4 difficulty levels",
      "Detailed scoring & feedback",
      "Learning tracks",
      "Weekly progress emails",
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;
