"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useQuiz } from "@/providers/QuizProvider";
import { Trophy, BarChart3, Trash2, Swords, SkipForward, Crosshair, Hash } from "lucide-react";
import Link from "next/link";

export default function StatsPage() {
  const { state, dispatch } = useQuiz();

  const hasData = state.totalGames > 0;
  const lifetimeAttempts = state.lifetimeAttempts;
  const lifetimeCorrect = state.lifetimeCorrect;
  const lifetimeSkipped = state.lifetimeSkipped;
  const accuracy = lifetimeAttempts > 0 ? Math.round((lifetimeCorrect / lifetimeAttempts) * 100) : 0;

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <h1 className="font-heading text-2xl font-bold tracking-tight">Stats</h1>

        {!hasData ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <BarChart3 className="mx-auto mb-3 h-10 w-10 opacity-40" />
              <p>Play your first game to see stats.</p>
              <Link href="/" className="mt-3 inline-block text-sm text-primary hover:underline">
                Go home →
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <Hash className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <div className="font-mono text-xl font-bold tabular-nums">{lifetimeAttempts}</div>
                  <div className="text-xs text-muted-foreground">Total Attempts</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Swords className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <div className="font-mono text-xl font-bold tabular-nums">{lifetimeCorrect}</div>
                  <div className="text-xs text-muted-foreground">Correct Guesses</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <SkipForward className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <div className="font-mono text-xl font-bold tabular-nums">{lifetimeSkipped}</div>
                  <div className="text-xs text-muted-foreground">Skipped</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Trophy className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <div className="font-mono text-xl font-bold tabular-nums">{state.totalGames}</div>
                  <div className="text-xs text-muted-foreground">Games Played</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <Crosshair className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <div className="font-mono text-xl font-bold tabular-nums">{accuracy}%</div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </CardContent>
              </Card>
            </div>

            <Dialog>
              <DialogTrigger>
                <Button variant="destructive" className="w-full gap-2">
                  <Trash2 className="h-4 w-4" />
                  Reset Stats
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset all stats?</DialogTitle>
                  <DialogDescription>
                    This will clear your best scores, streak, and game history. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={() => dispatch({ type: "RESET_STATS" })}
                  >
                    Reset
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
}
