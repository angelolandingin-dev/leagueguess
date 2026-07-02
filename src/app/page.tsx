"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuiz } from "@/providers/QuizProvider";
import { Swords, Layers, Zap, List } from "lucide-react";

export default function HomePage() {
  const { state, dispatch } = useQuiz();
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="hero-drift absolute inset-0 opacity-[0.04] pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-primary blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-accent-2 blur-3xl animate-pulse" style={{ animationDelay: "3s" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-lg">
        <div className="text-center space-y-2">
          <h1 className="font-heading text-5xl sm:text-6xl font-bold tracking-tight">
            <span className="text-primary">League</span>Guess
          </h1>
          <p className="text-muted-foreground text-base">
            Identify champions and abilities from their icons
          </p>
        </div>

        <div className="grid w-full gap-4 sm:grid-cols-2">
          <Card
            className={`cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${state.mode === "single" ? "ring-2 ring-primary" : ""}`}
            onClick={() => dispatch({ type: "SET_MODE", mode: "single" })}
          >
            <CardHeader>
              <Swords className="h-8 w-8 text-primary mb-1" />
              <CardTitle className="text-lg">Single Ability</CardTitle>
              <CardDescription>
                Guess champion + ability name from one icon
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground" />
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${state.mode === "batch" ? "ring-2 ring-primary" : ""}`}
            onClick={() => dispatch({ type: "SET_MODE", mode: "batch" })}
          >
            <CardHeader>
              <Layers className="h-8 w-8 text-primary mb-1" />
              <CardTitle className="text-lg">Full Kit</CardTitle>
              <CardDescription>
                Identify champion from full ability set
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground" />
          </Card>
        </div>

        <div className="flex gap-3 w-full justify-center flex-wrap">
          <button
            onClick={() => dispatch({ type: "TOGGLE_ABILITY_LIST" })}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              state.abilityList
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            Ability List {state.abilityList ? "ON" : "OFF"}
          </button>
        </div>

        <Button
          size="lg"
          className="w-full text-base font-semibold gap-2"
          onClick={() => {
            dispatch({ type: "START_SESSION" });
            router.push("/play");
          }}
        >
          <Zap className="h-5 w-5" />
          Start Game
        </Button>
      </div>
    </div>
  );
}
