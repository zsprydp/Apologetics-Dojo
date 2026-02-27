import { describe, it, expect } from "vitest";
import { debateScoreSchema } from "./scoring";

describe("debateScoreSchema", () => {
  it("validates a valid score object", () => {
    const valid = {
      argument_quality: 20,
      logical_coherence: 18,
      scripture_usage: 15,
      respectful_tone: 22,
      feedback: "Good job on your arguments.",
      summary: "A productive debate on the existence of God.",
    };
    const result = debateScoreSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects scores above 25", () => {
    const invalid = {
      argument_quality: 30,
      logical_coherence: 18,
      scripture_usage: 15,
      respectful_tone: 22,
      feedback: "Good",
      summary: "Summary",
    };
    const result = debateScoreSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects negative scores", () => {
    const invalid = {
      argument_quality: -5,
      logical_coherence: 18,
      scripture_usage: 15,
      respectful_tone: 22,
      feedback: "Good",
      summary: "Summary",
    };
    const result = debateScoreSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects missing feedback", () => {
    const invalid = {
      argument_quality: 20,
      logical_coherence: 18,
      scripture_usage: 15,
      respectful_tone: 22,
      summary: "Summary",
    };
    const result = debateScoreSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects missing summary", () => {
    const invalid = {
      argument_quality: 20,
      logical_coherence: 18,
      scripture_usage: 15,
      respectful_tone: 22,
      feedback: "Good",
    };
    const result = debateScoreSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("allows zero scores", () => {
    const valid = {
      argument_quality: 0,
      logical_coherence: 0,
      scripture_usage: 0,
      respectful_tone: 0,
      feedback: "You didn't participate.",
      summary: "No debate occurred.",
    };
    const result = debateScoreSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("allows maximum scores", () => {
    const valid = {
      argument_quality: 25,
      logical_coherence: 25,
      scripture_usage: 25,
      respectful_tone: 25,
      feedback: "Perfect debate performance.",
      summary: "An exceptional debate.",
    };
    const result = debateScoreSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});
