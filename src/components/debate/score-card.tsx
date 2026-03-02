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

interface BeltPromotion {
  name: string;
  colorHex: string;
  level: number;
}

export function ScoreCard({
  score,
  beltPromotion,
  sessionId,
}: {
  score: ScoreData;
  beltPromotion?: BeltPromotion | null;
  sessionId?: string;
}) {
  function handleShare() {
    const url = `${window.location.origin}/share/${sessionId}`;
    const text = `I scored ${score.totalPoints} pts debating apologetics on Apologetics Dojo! Can you beat my score?`;
    if (navigator.share) {
      navigator.share({ title: "Apologetics Dojo", text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
      alert("Link copied to clipboard!");
    }
  }
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
        {beltPromotion && (
          <div className="mt-3 flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-2" style={{ borderColor: beltPromotion.colorHex }}>
            <div
              className="h-6 w-6 rounded-full border"
              style={{ backgroundColor: beltPromotion.colorHex }}
            />
            <span className="text-sm font-semibold">
              Belt promoted to {beltPromotion.name}!
            </span>
          </div>
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

        {sessionId && (
          <button
            type="button"
            onClick={handleShare}
            className="mx-auto flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium hover:bg-accent transition-colors"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Share result
          </button>
        )}
      </CardContent>
    </Card>
  );
}
