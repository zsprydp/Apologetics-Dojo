"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "@/components/debate/message-bubble";
import { ScoreCard, type ScoreData } from "@/components/debate/score-card";

interface ChatInterfaceProps {
  sessionId: string;
  personaName: string;
  familyName: string;
  difficulty: string;
  initialMessages: { id: string; role: "user" | "assistant"; content: string }[];
  isEnded: boolean;
  savedScore?: ScoreData | null;
}

function getMessageText(message: UIMessage): string {
  return (
    message.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("") ?? ""
  );
}

export function ChatInterface({
  sessionId,
  personaName,
  familyName,
  difficulty,
  initialMessages,
  isEnded,
  savedScore,
}: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");
  const [ended, setEnded] = useState(isEnded);
  const [endingSession, setEndingSession] = useState(false);
  const [scoreData, setScoreData] = useState<ScoreData | null>(savedScore ?? null);
  const hasRequestedOpening = useRef(false);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { sessionId },
      }),
    [sessionId]
  );

  const [chatError, setChatError] = useState<string | null>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport,
    messages: initialMessages.map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      parts: [{ type: "text" as const, text: m.content }],
    })),
    onError: (err) => {
      setChatError(err.message || "Failed to get AI response. Check your API key.");
    },
  });

  const isLoading = status === "streaming" || status === "submitted";
  const displayError = chatError || (error?.message ?? null);

  const triggerOpening = useCallback(() => {
    if (!hasRequestedOpening.current) {
      hasRequestedOpening.current = true;
      sendMessage({ text: "[BEGIN DEBATE]" });
    }
  }, [sendMessage]);

  useEffect(() => {
    if (
      initialMessages.length === 0 &&
      messages.length === 0 &&
      !isLoading &&
      !ended
    ) {
      triggerOpening();
    }
  }, [initialMessages.length, messages.length, isLoading, ended, triggerOpening]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!isLoading && inputRef.current && !ended) {
      inputRef.current.focus();
    }
  }, [isLoading, ended]);

  async function handleEndSession() {
    setEndingSession(true);
    try {
      const res = await fetch("/api/debate/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        const data = await res.json();
        setEnded(true);
        if (data.scored && data.score) {
          setScoreData(data.score as ScoreData);
        }
      }
    } finally {
      setEndingSession(false);
    }
  }

  function handleSend() {
    const text = input.trim();
    if (!text || isLoading || ended) return;
    setInput("");
    sendMessage({ text });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const visibleMessages = messages.filter((m) => {
    const text = getMessageText(m);
    return !(m.role === "user" && text === "[BEGIN DEBATE]");
  });

  return (
    <div className="flex h-full flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">{personaName}</p>
          <p className="text-xs text-muted-foreground">
            {familyName} · {difficulty}
          </p>
        </div>
        {!ended && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleEndSession}
            disabled={endingSession || isLoading}
          >
            {endingSession ? "Scoring your debate…" : "End debate"}
          </Button>
        )}
        {ended && (
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {scoreData ? `${scoreData.totalPoints} pts earned` : "Session ended"}
          </span>
        )}
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {displayError && (
          <div className="mx-auto max-w-md rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <p className="font-medium">Unable to reach AI opponent</p>
            <p className="mt-1 text-xs">{displayError}</p>
            <button
              type="button"
              onClick={() => {
                setChatError(null);
                hasRequestedOpening.current = false;
              }}
              className="mt-2 text-xs underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {visibleMessages.length === 0 && isLoading && !displayError && (
          <div className="flex justify-center py-12">
            <p className="text-sm text-muted-foreground animate-pulse">
              {personaName} is preparing an opening statement…
            </p>
          </div>
        )}

        {visibleMessages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role as "user" | "assistant"}
            content={getMessageText(message)}
            personaName={personaName}
            isStreaming={
              isLoading &&
              message.id === visibleMessages[visibleMessages.length - 1]?.id &&
              message.role === "assistant"
            }
          />
        ))}

        {isLoading &&
          visibleMessages.length > 0 &&
          visibleMessages[visibleMessages.length - 1]?.role === "user" && (
            <div className="flex items-center gap-2 px-1">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
              </div>
              <span className="text-xs text-muted-foreground">
                {personaName} is typing…
              </span>
            </div>
          )}
      </div>

      {/* Score card overlay */}
      {scoreData && (
        <div className="border-t px-4 py-4 overflow-y-auto max-h-[50vh]">
          <ScoreCard score={scoreData} />
          <div className="mt-3 text-center">
            <a href="/dashboard" className="text-sm underline text-muted-foreground hover:text-foreground">
              Return to dashboard
            </a>
          </div>
        </div>
      )}

      {/* Input area */}
      {!ended && !endingSession ? (
        <div className="border-t px-4 py-3">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type your argument…"
              rows={2}
              disabled={isLoading || ended}
              className="flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
            <Button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="self-end"
            >
              Send
            </Button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      ) : endingSession ? (
        <div className="border-t px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground animate-pulse">
            Evaluating your debate performance…
          </p>
        </div>
      ) : !scoreData ? (
        <div className="border-t px-4 py-3 text-center">
          <p className="text-sm text-muted-foreground">
            This debate has ended.{" "}
            <a href="/dashboard" className="underline hover:text-foreground">
              Return to dashboard
            </a>
          </p>
        </div>
      ) : null}
    </div>
  );
}
