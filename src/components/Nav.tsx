"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetClose } from "@/components/ui/sheet";
import { useQuiz } from "@/providers/QuizProvider";
import { Sun, Moon, Menu } from "lucide-react";
import { useState } from "react";

export function Nav() {
  const { state, dispatch } = useQuiz();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-lg font-bold tracking-tight"
          onClick={() => dispatch({ type: "RETURN_HOME" })}
        >
          <span className="font-mono text-primary">LeagueGuess</span>
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          <Link href="/">
            <Button variant="ghost" size="sm">Home</Button>
          </Link>
          <Link href="/stats">
            <Button variant="ghost" size="sm">Stats</Button>
          </Link>
          <Link href="/about">
            <Button variant="ghost" size="sm">About</Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: "TOGGLE_THEME" })}
            aria-label="Toggle theme"
          >
            {state.theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="sm:hidden flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted transition-colors">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-64 p-6">
            <div className="flex flex-col gap-3 mt-8">
              <SheetClose>
                <Link href="/" className="text-lg font-medium block py-2" onClick={() => dispatch({ type: "RETURN_HOME" })}>
                  Home
                </Link>
              </SheetClose>
              <SheetClose>
                <Link href="/stats" className="text-lg font-medium block py-2">
                  Stats
                </Link>
              </SheetClose>
              <SheetClose>
                <Link href="/about" className="text-lg font-medium block py-2">
                  About
                </Link>
              </SheetClose>
              <Button
                variant="ghost"
                className="justify-start px-0 text-lg font-medium"
                onClick={() => {
                  dispatch({ type: "TOGGLE_THEME" });
                  setOpen(false);
                }}
              >
                {state.theme === "dark" ? "Light mode" : "Dark mode"}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
