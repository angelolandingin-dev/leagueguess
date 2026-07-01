"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuiz } from "@/providers/QuizProvider";
import { RotateCcw, Home, Swords } from "lucide-react";

export default function EndPage() {
  const { state, dispatch } = useQuiz();
  const router = useRouter();

  const attempts = state.sessionAttempts;
  const correct = state.sessionCorrect;
  const skipped = state.sessionSkipped;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Swords className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Session Complete</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-surface-2 p-3 text-center">
              <div className="font-mono text-2xl font-bold text-primary tabular-nums">{attempts}</div>
              <div className="text-xs text-muted-foreground">Attempts</div>
            </div>
            <div className="rounded-lg bg-surface-2 p-3 text-center">
              <div className="font-mono text-2xl font-bold text-success tabular-nums">{correct}</div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div className="rounded-lg bg-surface-2 p-3 text-center">
              <div className="font-mono text-2xl font-bold tabular-nums">{skipped}</div>
              <div className="text-xs text-muted-foreground">Skipped</div>
            </div>
          </div>
          {attempts > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Accuracy: {Math.round((correct / (attempts - skipped || attempts)) * 100)}%
            </p>
          )}
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button
            className="flex-1 gap-2"
            onClick={() => {
              dispatch({ type: "START_SESSION" });
              setTimeout(() => router.push("/play"), 0);
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Play Again
          </Button>
          <Link href="/">
            <Button variant="outline" className="flex-1 gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
