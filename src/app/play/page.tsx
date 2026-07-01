"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuiz } from "@/providers/QuizProvider";
import { AnswerCombobox } from "@/components/AnswerCombobox";
import { AbilityIcon } from "@/components/AbilityIcon";
import { AbilityStack } from "@/components/AbilityStack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, SkipForward, Eye, RotateCw, EyeOff, RotateCcw } from "lucide-react";

export default function PlayPage() {
  const { state, dispatch } = useQuiz();
  const router = useRouter();

  useEffect(() => {
    if (state.phase === "idle" || !state.session) {
      router.replace("/");
    }
    if (state.phase === "complete") {
      router.replace("/end");
    }
  }, [state.phase, state.session, router]);

  useEffect(() => {
    if (state.message) {
      const timer = setTimeout(() => {
        dispatch({ type: "CLEAR_MESSAGE" });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.message, dispatch]);

  if (state.phase === "idle" || !state.session || !state.currentRound) {
    return null;
  }

  if (state.mode === "single") {
    return <SingleModeView />;
  }
  return <BatchModeView />;
}

function SingleModeView() {
  return <SingleModeContent />;
}

function BatchModeView() {
  return <BatchModeContent />;
}

function SingleModeContent() {
  const { state, dispatch } = useQuiz();
  const ability = state.currentRound?.abilitiesPresented[0];
  const router = useRouter();
  const inputAreaRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [cardsMaxH, setCardsMaxH] = useState(200);

  const [textAbilityValue, setTextAbilityValue] = useState("");
  const isResult = state.phase === "result";

  useEffect(() => {
    const calc = () => {
      if (!inputAreaRef.current) return;
      const rect = inputAreaRef.current.getBoundingClientRect();
      const available = window.innerHeight - rect.bottom - 100;
      setCardsMaxH(Math.max(60, available));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  useEffect(() => {
    if (cardsRef.current) {
      cardsRef.current.scrollTop = 0;
    }
  }, [state.championGuesses.length, state.abilityGuesses.length]);

  if (!ability) return null;

  const championAbilityPool = state.currentRound
    ? state.currentRound.champion.abilities.map((a) => a.name).sort(() => Math.random() - 0.5)
    : [];

  const allGuesses = [
    ...state.championGuesses.map((g, i) => ({ ...g, key: `c-${i}` })),
    ...state.abilityGuesses.map((g, i) => ({ ...g, key: `a-${i}` })),
  ];

  const GuessCard = ({ guess, correct }: { guess: string; correct: boolean }) => (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium shrink-0 ${
        correct
          ? "border-success/40 bg-success/10 text-success"
          : "border-destructive/40 bg-destructive/10 text-destructive"
      }`}
    >
      <span>{correct ? "✓" : "✗"}</span>
      <span className="truncate">{guess}</span>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-8 gap-6 max-w-lg mx-auto w-full mt-[10vh]">
      <div className="flex gap-4">
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          Attempts: {state.sessionAttempts}
        </span>
        <span className="font-mono text-sm tabular-nums text-success">
          Correct: {state.sessionCorrect}
        </span>
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          Skipped: {state.sessionSkipped}
        </span>
      </div>

      {/* Main icon + toggles + result buttons row */}
      <div className={`flex items-start gap-5 justify-center ${isResult ? "w-full" : ""}`}>
        <div className="flex flex-col items-center gap-3">
          <div className={`shrink-0 ${isResult && !state.lastRoundSkipped ? "rounded-xl ring-2 ring-success/60 ring-offset-4 ring-offset-background" : ""} ${isResult && state.lastRoundSkipped ? "rounded-xl ring-2 ring-muted-foreground/40 ring-offset-4 ring-offset-background" : ""}`}>
            <AbilityIcon
              key={`icon-${state.feedbackKey}`}
              ability={ability}
              size="lg"
              grayscale={isResult ? false : state.roundGrayscale}
              rotation={isResult ? false : state.roundRotation}
              rotationAngle={state.roundRotationAngle}
            />
          </div>
          {!isResult && (
            <div className="flex gap-2">
              <button
                onClick={() => dispatch({ type: "TOGGLE_ROUND_GRAYSCALE" })}
                disabled={state.roundGrayscaleLocked}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  state.roundGrayscaleLocked
                    ? "bg-destructive/20 text-destructive line-through opacity-60 cursor-not-allowed"
                    : "bg-primary/15 text-primary hover:bg-primary/25"
                }`}
                title="Toggle grayscale (off = +2 attempts)"
              >
                {state.roundGrayscaleLocked ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                Gray
              </button>
              <button
                onClick={() => dispatch({ type: "TOGGLE_ROUND_ROTATION" })}
                disabled={state.roundRotationLocked}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  state.roundRotationLocked
                    ? "bg-destructive/20 text-destructive line-through opacity-60 cursor-not-allowed"
                    : "bg-primary/15 text-primary hover:bg-primary/25"
                }`}
                title="Toggle rotation (off = +2 attempts)"
              >
                {state.roundRotationLocked ? <RotateCcw className="h-3 w-3" /> : <RotateCw className="h-3 w-3" />}
                Rotate
              </button>
            </div>
          )}
        </div>
        {isResult && (
          <div className="flex flex-col gap-2 pt-1">
            {state.lastRoundSkipped && (
              <div className="text-xs text-muted-foreground mb-1 space-y-0.5">
                <p className="font-medium text-foreground">{state.currentRound?.champion.name}</p>
                <p>— {ability.name}</p>
              </div>
            )}
            <button
              onClick={() => dispatch({ type: "NEXT_ROUND" })}
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Next Round
            </button>
            <button
              onClick={() => {
                dispatch({ type: "FINISH_SESSION" });
                router.push("/end");
              }}
              className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              End Session
            </button>
          </div>
        )}
      </div>

      <div ref={inputAreaRef} className={`w-full space-y-3 ${isResult ? "opacity-0 h-0 overflow-hidden pointer-events-none" : ""}`}>
        {state.phase === "champion" && (
          <>
            <label className="text-sm font-medium text-muted-foreground">
              Which champion?
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <AnswerCombobox
                  id="champion-guess"
                  candidates={state.championPool}
                  onSelect={(v) => {
                    dispatch({ type: "SET_CHAMPION_GUESS", guess: v });
                    dispatch({ type: "SUBMIT_CHAMPION", guess: v });
                  }}
                  placeholder="Search champion..."
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch({ type: "SKIP_ROUND" })}
                className="shrink-0 gap-1.5"
              >
                <SkipForward className="h-4 w-4" />
                Skip
              </Button>
            </div>
          </>
        )}

        {state.phase === "names" && (
          <>
            <label className="text-sm font-medium text-muted-foreground">
              Which ability?
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                {state.abilityList ? (
                  <AnswerCombobox
                    key={`ability-${state.feedbackKey}`}
                    id="ability-guess"
                    candidates={championAbilityPool}
                    onSelect={(v) => {
                      dispatch({ type: "SET_ABILITY_GUESS", guess: v });
                      dispatch({ type: "SUBMIT_ABILITY", guess: v });
                    }}
                    placeholder="Search ability name..."
                  />
                ) : (
                  <Input
                    key={`ability-text-${state.feedbackKey}`}
                    value={textAbilityValue}
                    onChange={(e) => setTextAbilityValue(e.target.value)}
                    placeholder="Type ability name..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const value = textAbilityValue.trim();
                        if (value) {
                          setTextAbilityValue("");
                          dispatch({ type: "SET_ABILITY_GUESS", guess: value });
                          dispatch({ type: "SUBMIT_ABILITY", guess: value });
                        }
                      }
                    }}
                  />
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch({ type: "SKIP_ROUND" })}
                className="shrink-0 gap-1.5"
              >
                <SkipForward className="h-4 w-4" />
                Skip
              </Button>
            </div>
          </>
        )}
      </div>

      <div
        ref={cardsRef}
        className="w-full overflow-y-auto flex flex-col gap-1.5"
        style={{ maxHeight: cardsMaxH }}
      >
        {[...allGuesses].reverse().map((g) => (
          <GuessCard key={g.key} guess={g.guess} correct={g.correct} />
        ))}
      </div>

      {!isResult && (
        <button
          onClick={() => {
            dispatch({ type: "FINISH_SESSION" });
            router.push("/end");
          }}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors mt-auto"
        >
          End Session
        </button>
      )}
    </div>
  );
}

function BatchModeContent() {
  const { state, dispatch } = useQuiz();
  const champion = state.currentRound?.champion;
  const abilities = state.currentRound?.abilitiesPresented ?? [];
  const router = useRouter();

  if (!champion) return null;

  const abilityNamePool = abilities.map((a) => a.name);

  return (
    <div className="flex flex-1 flex-col px-4 py-8 gap-6 max-w-lg mx-auto w-full mt-[10vh]">
      <div className="flex justify-center gap-4">
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          Kit {state.session!.currentRoundIndex + 1}
        </span>
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          Attempts: {state.sessionAttempts}
        </span>
        <span className="font-mono text-sm tabular-nums text-success">
          Correct: {state.sessionCorrect}
        </span>
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          Skipped: {state.sessionSkipped}
        </span>
      </div>

      {state.phase !== "result" && (
        <AbilityStack
          abilities={champion.abilities}
          size="sm"
          showLabels
        />
      )}

      {state.message && (
        <div
          className={`text-sm font-medium px-3 py-1.5 rounded-md text-center ${
            state.messageType === "incorrect"
              ? "text-destructive bg-destructive/10"
              : "text-success bg-success/10"
          }`}
        >
          {state.message}
        </div>
      )}

      {state.phase === "champion" && (
        <div className="w-full space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Which champion?
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <AnswerCombobox
                key={`batch-champion-${state.feedbackKey}`}
                id="batch-champion-guess"
                candidates={state.championPool}
                onSelect={(v) => {
                  dispatch({ type: "SET_CHAMPION_GUESS", guess: v });
                  dispatch({ type: "SUBMIT_CHAMPION", guess: v });
                }}
                placeholder="Search champion..."
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: "SKIP_ROUND" })}
              className="shrink-0 gap-1.5"
            >
              <SkipForward className="h-4 w-4" />
              Skip
            </Button>
          </div>
        </div>
      )}

      {state.phase === "naming" && (
        <div className="w-full space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Identify each ability</span>
            <span className="font-mono tabular-nums">
              {state.batchAbilityStatus.filter((s) => s === "correct").length}/{abilities.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {abilities.map((ability, idx) => {
              const isSolved = state.batchAbilityStatus[idx] === "correct";
              const isCurrent =
                !isSolved &&
                state.batchAbilityStatus.slice(0, idx).every((s) => s === "correct");

              return (
                <div
                  key={`ability-row-${idx}`}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                    isCurrent
                      ? "border-primary bg-primary/5"
                      : isSolved
                        ? "border-success/30 bg-success/5"
                        : "border-border opacity-50"
                  }`}
                >
                  <AbilityIcon
                    ability={ability}
                    size="sm"
                  />
                  <span className="font-mono text-xs uppercase text-muted-foreground w-5 shrink-0">
                    {ability.slot}
                  </span>
                  <div className="flex-1 min-w-0">
                    {isSolved ? (
                      <div className="flex items-center gap-2 text-success font-medium truncate">
                        <span>✓</span>
                        <span>{ability.name}</span>
                      </div>
                    ) : (
                      <AnswerCombobox
                        key={`batch-ability-${idx}-${state.batchAbilityKeys[idx] || 0}`}
                        id={`batch-ability-${idx}`}
                        candidates={abilityNamePool}
                        onSelect={(v) => {
                          dispatch({
                            type: "SUBMIT_BATCH_ABILITY",
                            abilityIndex: idx,
                            guess: v,
                          });
                        }}
                        placeholder="Name this ability..."
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {state.phase === "result" && (
        <ResultView
          championCorrect={!!state.lastChampionCorrect}
          abilityCorrect={true}
          championName={champion.name}
          onNext={() => dispatch({ type: "NEXT_ROUND" })}
          onEnd={() => {
            dispatch({ type: "FINISH_SESSION" });
            router.push("/end");
          }}
        />
      )}
    </div>
  );
}

function ResultView({
  championCorrect,
  abilityCorrect,
  championName,
  abilityName,
  onNext,
  onEnd,
}: {
  championCorrect: boolean;
  abilityCorrect?: boolean;
  championName: string;
  abilityName?: string;
  onNext: () => void;
  onEnd: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className={`text-2xl font-bold ${championCorrect ? "text-success" : "text-destructive"}`}>
        {championCorrect ? "Correct!" : "Incorrect"}
      </div>
      <div className="text-center">
        <p className={championCorrect ? "text-success" : "text-destructive"}>
          {championCorrect ? "✓" : "✗"} {championName}
        </p>
        {abilityName && (
          <p className={abilityCorrect ? "text-success" : "text-destructive"}>
            {abilityCorrect ? "✓" : "✗"} {abilityName}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={onNext}
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Next Round
        </button>
        <button
          onClick={onEnd}
          className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="h-4 w-4 mr-1.5" />
          End Session
        </button>
      </div>
    </div>
  );
}
