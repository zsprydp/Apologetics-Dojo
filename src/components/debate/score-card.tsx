"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ScoreData {
  totalPoints: number;
  basePoints: number;
  difficultyMultiplier: number;
  argument_quality: number;
  logical_coherence: number;
  scripture_usage: number;
  respectful_tone: number;
  feedback: string;
  summary: string;
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}/{max}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-primary transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ScoreCard({ score }: { score: ScoreData }) {
  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader className="pb-3 text-center">
        <CardTitle className="text-lg">Debate Results</CardTitle>
        <div className="mt-2 flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold">{score.totalPoints}</span>
          <span className="text-sm text-muted-foreground">pts</span>
        </div>
        {score.difficultyMultiplier > 1 && (
          <p className="text-xs text-muted-foreground">
            Base {score.basePoints} × {score.difficultyMultiplier} difficulty bonus
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <ScoreBar label="Argument Quality" value={score.argument_quality} max={25} />
          <ScoreBar label="Logical Coherence" value={score.logical_coherence} max={25} />
          <ScoreBar label="Scripture Usage" value={score.scripture_usage} max={25} />
          <ScoreBar label="Respectful Tone" value={score.respectful_tone} max={25} />
        </div>

        <div className="rounded-md border p-3 space-y-2">
          <p className="text-sm font-medium">Feedback</p>
          <p className="text-sm text-muted-foreground">{score.feedback}</p>
        </div>

        <p className="text-xs text-center text-muted-foreground italic">
          {score.summary}
        </p>
      </CardContent>
    </Card>
  );
}
