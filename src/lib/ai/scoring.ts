import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { DIFFICULTY_LEVELS, type DifficultyId } from "@/lib/constants";

export const debateScoreSchema = z.object({
  argument_quality: z
    .number()
    .min(0)
    .max(25)
    .describe("How well-structured, relevant, and persuasive the arguments were (0-25)"),
  logical_coherence: z
    .number()
    .min(0)
    .max(25)
    .describe("Logical consistency, avoidance of fallacies, sound reasoning (0-25)"),
  scripture_usage: z
    .number()
    .min(0)
    .max(25)
    .describe("Accurate and contextual use of Scripture or theological references (0-25)"),
  respectful_tone: z
    .number()
    .min(0)
    .max(25)
    .describe("Charitable, respectful, and edifying tone throughout (0-25)"),
  feedback: z
    .string()
    .describe("2-3 sentence constructive feedback for the student"),
  summary: z
    .string()
    .describe("1 sentence summary of the debate"),
});

export type DebateScore = z.infer<typeof debateScoreSchema>;

export interface ScoringResult {
  raw: DebateScore;
  basePoints: number;
  difficultyMultiplier: number;
  totalPoints: number;
}

export async function evaluateDebate(
  transcript: { role: string; content: string }[],
  familyName: string,
  personaName: string,
  difficultyId: DifficultyId
): Promise<ScoringResult> {
  const difficulty = DIFFICULTY_LEVELS.find((d) => d.id === difficultyId);
  const multiplier = difficulty?.modifier ?? 1.0;

  const formattedTranscript = transcript
    .map((m) => `[${m.role === "user" ? "Student" : "Opponent"}]: ${m.content}`)
    .join("\n\n");

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: debateScoreSchema,
    prompt: `You are an expert apologetics debate evaluator. Score the STUDENT's performance in this debate.

## Context
- Topic family: ${familyName}
- AI opponent persona: ${personaName}
- Difficulty level: ${difficulty?.name ?? difficultyId}

## Scoring rubric
Rate the STUDENT (not the opponent) on each dimension from 0-25:
- argument_quality: Were arguments well-structured, relevant to the topic, and persuasive?
- logical_coherence: Was reasoning logically consistent? Were fallacies avoided?
- scripture_usage: Were Scripture or theological references used accurately and in context? (Award partial credit if the student made strong philosophical arguments without explicit Scripture.)
- respectful_tone: Was the tone charitable, respectful, and edifying?

Be fair but encouraging. A beginner making a sincere effort deserves reasonable scores.

## Transcript
${formattedTranscript}`,
  });

  const basePoints =
    object.argument_quality +
    object.logical_coherence +
    object.scripture_usage +
    object.respectful_tone;

  const totalPoints = Math.round(basePoints * multiplier);

  return {
    raw: object,
    basePoints,
    difficultyMultiplier: multiplier,
    totalPoints,
  };
}
