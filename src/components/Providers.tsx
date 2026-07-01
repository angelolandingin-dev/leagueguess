"use client";

import type { ReactNode } from "react";
import { QuizProvider } from "@/providers/QuizProvider";

export function Providers({ children }: { children: ReactNode }) {
  return <QuizProvider>{children}</QuizProvider>;
}
