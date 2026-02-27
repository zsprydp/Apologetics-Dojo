import { describe, it, expect } from "vitest";
import {
  OPPONENT_PERSONAS,
  BELT_LEVELS,
  DIFFICULTY_LEVELS,
  THEOLOGICAL_GUARDRAILS,
  LEARNING_TRACK_CURRICULUM,
} from "./constants";

describe("OPPONENT_PERSONAS", () => {
  it("has exactly 6 personas", () => {
    expect(OPPONENT_PERSONAS).toHaveLength(6);
  });

  it("each persona has a unique id", () => {
    const ids = OPPONENT_PERSONAS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("each persona has a non-empty name and description", () => {
    for (const p of OPPONENT_PERSONAS) {
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.description.length).toBeGreaterThan(0);
    }
  });
});

describe("BELT_LEVELS", () => {
  it("has 8 belt levels", () => {
    expect(BELT_LEVELS).toHaveLength(8);
  });

  it("levels are in ascending order", () => {
    for (let i = 1; i < BELT_LEVELS.length; i++) {
      expect(BELT_LEVELS[i].level).toBeGreaterThan(BELT_LEVELS[i - 1].level);
    }
  });

  it("min scores are in ascending order", () => {
    for (let i = 1; i < BELT_LEVELS.length; i++) {
      expect(BELT_LEVELS[i].minScore).toBeGreaterThan(
        BELT_LEVELS[i - 1].minScore
      );
    }
  });

  it("starts at White with 0 points", () => {
    expect(BELT_LEVELS[0].name).toBe("White");
    expect(BELT_LEVELS[0].minScore).toBe(0);
  });

  it("ends at Black with 2000 points", () => {
    expect(BELT_LEVELS[7].name).toBe("Black");
    expect(BELT_LEVELS[7].minScore).toBe(2000);
  });

  it("each belt has a valid hex color", () => {
    const hexRegex = /^#[0-9a-f]{6}$/i;
    for (const belt of BELT_LEVELS) {
      expect(belt.colorHex).toMatch(hexRegex);
    }
  });
});

describe("DIFFICULTY_LEVELS", () => {
  it("has 4 difficulty levels", () => {
    expect(DIFFICULTY_LEVELS).toHaveLength(4);
  });

  it("modifiers increase with difficulty", () => {
    for (let i = 1; i < DIFFICULTY_LEVELS.length; i++) {
      expect(DIFFICULTY_LEVELS[i].modifier).toBeGreaterThan(
        DIFFICULTY_LEVELS[i - 1].modifier
      );
    }
  });

  it("beginner modifier is 1.0 (no bonus)", () => {
    const beginner = DIFFICULTY_LEVELS.find((d) => d.id === "beginner");
    expect(beginner?.modifier).toBe(1.0);
  });

  it("expert modifier is 2.0 (double points)", () => {
    const expert = DIFFICULTY_LEVELS.find((d) => d.id === "expert");
    expect(expert?.modifier).toBe(2.0);
  });
});

describe("THEOLOGICAL_GUARDRAILS", () => {
  it("has all 5 guardrail keys", () => {
    const keys = Object.keys(THEOLOGICAL_GUARDRAILS);
    expect(keys).toContain("orthodoxy");
    expect(keys).toContain("charity");
    expect(keys).toContain("noPastoralAdvice");
    expect(keys).toContain("scriptureAccuracy");
    expect(keys).toContain("tone");
    expect(keys).toHaveLength(5);
  });

  it("each guardrail is a non-empty string", () => {
    for (const value of Object.values(THEOLOGICAL_GUARDRAILS)) {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(10);
    }
  });
});

describe("LEARNING_TRACK_CURRICULUM", () => {
  it("has 3 tracks", () => {
    expect(Object.keys(LEARNING_TRACK_CURRICULUM)).toHaveLength(3);
  });

  it("each track has 4 steps", () => {
    for (const [slug, steps] of Object.entries(LEARNING_TRACK_CURRICULUM)) {
      expect(steps).toHaveLength(4);
      for (const step of steps) {
        expect(step.familySlug).toBeTruthy();
        expect(step.difficulty).toBeTruthy();
        expect(step.persona).toBeTruthy();
      }
    }
  });

  it("all personas in curriculum exist in OPPONENT_PERSONAS", () => {
    const validIds = new Set(OPPONENT_PERSONAS.map((p) => p.id));
    for (const steps of Object.values(LEARNING_TRACK_CURRICULUM)) {
      for (const step of steps) {
        expect(validIds.has(step.persona)).toBe(true);
      }
    }
  });

  it("all difficulties in curriculum exist in DIFFICULTY_LEVELS", () => {
    const validIds = new Set(DIFFICULTY_LEVELS.map((d) => d.id));
    for (const steps of Object.values(LEARNING_TRACK_CURRICULUM)) {
      for (const step of steps) {
        expect(validIds.has(step.difficulty)).toBe(true);
      }
    }
  });

  it("foundations track uses beginner difficulty", () => {
    const foundations = LEARNING_TRACK_CURRICULUM["foundations"];
    for (const step of foundations) {
      expect(step.difficulty).toBe("beginner");
    }
  });

  it("advanced-engagement uses advanced or expert", () => {
    const advanced = LEARNING_TRACK_CURRICULUM["advanced-engagement"];
    for (const step of advanced) {
      expect(["advanced", "expert"]).toContain(step.difficulty);
    }
  });
});
