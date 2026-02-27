import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "./prompts";
import { OPPONENT_PERSONAS, DIFFICULTY_LEVELS } from "@/lib/constants";
import type { OpponentPersonaId, DifficultyId } from "@/lib/constants";

describe("buildSystemPrompt", () => {
  it("includes the persona name in the prompt", () => {
    const prompt = buildSystemPrompt({
      personaId: "skeptic",
      difficultyId: "beginner",
      familyName: "Existence of God",
      familyDescription: null,
    });
    expect(prompt).toContain("Friendly Skeptic");
  });

  it("includes the family name and description", () => {
    const prompt = buildSystemPrompt({
      personaId: "atheist",
      difficultyId: "intermediate",
      familyName: "Problem of Evil",
      familyDescription: "Logical and evidential problem of evil",
    });
    expect(prompt).toContain("Problem of Evil");
    expect(prompt).toContain("Logical and evidential problem of evil");
  });

  it("includes difficulty-specific instructions", () => {
    const beginner = buildSystemPrompt({
      personaId: "skeptic",
      difficultyId: "beginner",
      familyName: "Test",
      familyDescription: null,
    });
    const expert = buildSystemPrompt({
      personaId: "skeptic",
      difficultyId: "expert",
      familyName: "Test",
      familyDescription: null,
    });
    expect(beginner).toContain("simple and straightforward");
    expect(expert).toContain("maximally challenging");
  });

  it("includes theological guardrails", () => {
    const prompt = buildSystemPrompt({
      personaId: "relativist",
      difficultyId: "beginner",
      familyName: "Morality",
      familyDescription: null,
    });
    expect(prompt).toContain("historic Christian orthodoxy");
    expect(prompt).toContain("respectful, edifying tone");
  });

  it("generates unique prompts for all persona × difficulty combinations", () => {
    const prompts = new Set<string>();
    for (const persona of OPPONENT_PERSONAS) {
      for (const diff of DIFFICULTY_LEVELS) {
        const prompt = buildSystemPrompt({
          personaId: persona.id as OpponentPersonaId,
          difficultyId: diff.id as DifficultyId,
          familyName: "Test Topic",
          familyDescription: null,
        });
        prompts.add(prompt);
        expect(prompt.length).toBeGreaterThan(500);
      }
    }
    expect(prompts.size).toBe(
      OPPONENT_PERSONAS.length * DIFFICULTY_LEVELS.length
    );
  });

  it("includes opening message instructions", () => {
    const prompt = buildSystemPrompt({
      personaId: "skeptic",
      difficultyId: "beginner",
      familyName: "Test",
      familyDescription: null,
    });
    expect(prompt).toContain("Opening message");
    expect(prompt).toContain("FIRST message");
  });
});
