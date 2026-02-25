/**
 * Apologetics Dojo constants: opponent personas, belt levels, difficulty modifiers, theological guardrails.
 */

export const OPPONENT_PERSONAS = [
  { id: "skeptic", name: "Friendly Skeptic", description: "Curious but unconvinced; asks clarifying questions." },
  { id: "atheist", name: "Secular Atheist", description: "Logical, evidence-focused; challenges religious claims." },
  { id: "relativist", name: "Moral Relativist", description: "Questions absolute truth and moral objectivity." },
  { id: "scientist", name: "Scientific Materialist", description: "Prioritizes naturalistic explanations and science." },
  { id: "sufferer", name: "Hurting Doubter", description: "Struggles with doubt due to pain or loss." },
  { id: "intellectual", name: "Intellectual Challenger", description: "Well-read; uses philosophy and history." },
] as const;

export type OpponentPersonaId = (typeof OPPONENT_PERSONAS)[number]["id"];

export const BELT_LEVELS = [
  { level: 1, name: "White", minScore: 0, colorHex: "#f5f5f5" },
  { level: 2, name: "Yellow", minScore: 100, colorHex: "#facc15" },
  { level: 3, name: "Orange", minScore: 250, colorHex: "#fb923c" },
  { level: 4, name: "Green", minScore: 450, colorHex: "#22c55e" },
  { level: 5, name: "Blue", minScore: 700, colorHex: "#3b82f6" },
  { level: 6, name: "Purple", minScore: 1000, colorHex: "#a855f7" },
  { level: 7, name: "Brown", minScore: 1400, colorHex: "#92400e" },
  { level: 8, name: "Black", minScore: 2000, colorHex: "#171717" },
] as const;

export const DIFFICULTY_LEVELS = [
  { id: "beginner", name: "Beginner", modifier: 1.0, description: "Slower pace, simpler objections." },
  { id: "intermediate", name: "Intermediate", modifier: 1.25, description: "Standard difficulty." },
  { id: "advanced", name: "Advanced", modifier: 1.5, description: "Faster, more complex objections." },
  { id: "expert", name: "Expert", modifier: 2.0, description: "Maximum challenge." },
] as const;

export type DifficultyId = (typeof DIFFICULTY_LEVELS)[number]["id"];

/** Theological guardrails: boundaries and principles for AI-generated content. */
export const THEOLOGICAL_GUARDRAILS = {
  /** Do not affirm doctrines contrary to historic Christian orthodoxy (e.g. denial of Trinity, deity of Christ). */
  orthodoxy: "Content must align with historic Christian orthodoxy.",
  /** Avoid misrepresenting other faiths or straw-manning objections. */
  charity: "Represent opposing views fairly and charitably.",
  /** Do not generate pastoral or medical advice; point to Scripture and qualified humans. */
  noPastoralAdvice: "Do not substitute for pastoral or professional advice.",
  /** Scripture quotes should be accurate and in context. */
  scriptureAccuracy: "Scripture must be quoted accurately and in context.",
  /** Tone should be respectful and edifying. */
  tone: "Maintain a respectful, edifying tone in all dialogue.",
} as const;

export type GuardrailKey = keyof typeof THEOLOGICAL_GUARDRAILS;
