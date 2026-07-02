"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import type { Mode, Filters, Round } from "@/data/types";
import {
  startSession,
  pickRound,
  getChampionPoolNames,
  getAbilityNamePoolForSession,
  gradeChampionGuess,
  gradeAbilityNameGuess,
  type Session,
} from "@/lib/quiz-engine";
import {
  loadAll,
  saveTotalGames,
  saveLifetimeAttempts,
  saveLifetimeCorrect,
  saveLifetimeSkipped,
  saveSeenChampions,
  saveLastSettings,
  saveToggleStates,
  saveTheme,
  resetAll,
} from "@/lib/storage";
import { normalizeChampionName } from "@/data/aliases";

const ROTATIONS = [0, 90, 180, 270];

interface QuizState {
  mode: Mode;
  filters: Filters;
  session: Session | null;
  currentRound: Round | null;
  phase: "idle" | "ready" | "champion" | "names" | "naming" | "result" | "complete";
  championGuess: string;
  abilityGuess: string;
  championGuesses: { guess: string; correct: boolean }[];
  abilityGuesses: { guess: string; correct: boolean }[];
  lastChampionCorrect: boolean | null;
  lastAbilityCorrect: boolean | null;
  lastRoundSkipped: boolean;
  championPool: string[];
  abilityNamePool: string[];
  sessionComplete: boolean;
  theme: "dark" | "light";
  totalGames: number;
  lifetimeAttempts: number;
  lifetimeCorrect: number;
  lifetimeSkipped: number;
  sessionAttempts: number;
  sessionCorrect: number;
  sessionSkipped: number;
  shownIconIndex: number;
  roundGrayscale: boolean;
  roundRotation: boolean;
  roundRotationAngle: number;
  roundGrayscaleLocked: boolean;
  roundRotationLocked: boolean;
  abilityList: boolean;
  feedbackKey: number;
  batchAbilityStatus: ("pending" | "correct" | "skipped")[];
  batchAbilityKeys: Record<number, number>;
  message: string | null;
  messageType: "correct" | "incorrect" | null;
}

type Action =
  | { type: "SET_MODE"; mode: Mode }
  | { type: "SET_FILTERS"; filters: Filters }
  | { type: "SET_CHAMPION_GUESS"; guess: string }
  | { type: "SET_ABILITY_GUESS"; guess: string }
  | { type: "TOGGLE_ROUND_GRAYSCALE" }
  | { type: "TOGGLE_ROUND_ROTATION" }
  | { type: "TOGGLE_ABILITY_LIST" }
  | { type: "START_SESSION" }
  | { type: "SUBMIT_CHAMPION"; guess: string }
  | { type: "SUBMIT_ABILITY"; guess: string }
  | { type: "NEXT_ROUND" }
  | { type: "CLEAR_MESSAGE" }
  | { type: "TOGGLE_THEME" }
  | { type: "LOAD_PERSISTED"; data: ReturnType<typeof loadAll> }
  | { type: "RESET_STATS" }
  | { type: "SUBMIT_BATCH_ABILITY"; abilityIndex: number; guess: string }
  | { type: "SKIP_ROUND" }
  | { type: "SKIP_BATCH_ABILITY" }
  | { type: "FINISH_SESSION" }
  | { type: "RETURN_HOME" };

function reducer(state: QuizState, action: Action): QuizState {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.mode };
    case "SET_FILTERS":
      return { ...state, filters: action.filters };
    case "SET_CHAMPION_GUESS":
      return { ...state, championGuess: action.guess };
    case "SET_ABILITY_GUESS":
      return { ...state, abilityGuess: action.guess };
    case "TOGGLE_ROUND_GRAYSCALE": {
      if (state.roundGrayscaleLocked) return state;
      return {
        ...state,
        roundGrayscale: false,
        roundGrayscaleLocked: true,
        sessionAttempts: state.sessionAttempts + 2,
      };
    }
    case "TOGGLE_ROUND_ROTATION": {
      if (state.roundRotationLocked) return state;
      return {
        ...state,
        roundRotation: false,
        roundRotationLocked: true,
        sessionAttempts: state.sessionAttempts + 2,
      };
    }
    case "TOGGLE_ABILITY_LIST": {
      const next = !state.abilityList;
      saveToggleStates({ abilityList: next });
      return { ...state, abilityList: next };
    }
    case "START_SESSION": {
      const session = startSession({
        mode: state.mode,
        filters: state.filters,
      });
      const round = pickRound(session);
      const pool = getChampionPoolNames(session);
      const abilityPool = getAbilityNamePoolForSession(session);
      const iconIdx =
        state.mode === "single" && round && round.abilitiesPresented[0].icons.length > 1
          ? Math.floor(Math.random() * round.abilitiesPresented[0].icons.length)
          : 0;
      return {
        ...state,
        session,
        currentRound: round,
        phase: "champion",
        championGuess: "",
        abilityGuess: "",
        championGuesses: [],
        abilityGuesses: [],
        lastChampionCorrect: null,
        lastAbilityCorrect: null,
        lastRoundSkipped: false,
        championPool: pool,
        abilityNamePool: abilityPool,
        sessionComplete: false,
        sessionAttempts: 0,
        sessionCorrect: 0,
        sessionSkipped: 0,
        shownIconIndex: iconIdx,
        roundGrayscale: true,
        roundRotation: true,
        roundRotationAngle: ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)],
        roundGrayscaleLocked: false,
        roundRotationLocked: false,
        feedbackKey: 0,
        batchAbilityStatus: [],
        batchAbilityKeys: {},
        message: null,
        messageType: null,
      };
    }
    case "SUBMIT_CHAMPION": {
      if (!state.session || !state.currentRound) return state;
      const normalized = normalizeChampionName(action.guess);
      const correct = gradeChampionGuess(state.currentRound, normalized);

      if (!correct) {
        return {
          ...state,
          championGuess: normalized,
          championGuesses: [...state.championGuesses, { guess: action.guess, correct: false }],
          sessionAttempts: state.sessionAttempts + 1,
          lastRoundSkipped: false,
        };
      }

      const isSingle = state.mode === "single";
      const nextCorrect = {
        ...state,
        championGuess: normalized,
        championGuesses: [...state.championGuesses, { guess: action.guess, correct: true }],
        lastChampionCorrect: true,
        lastRoundSkipped: false,
        sessionAttempts: state.sessionAttempts + 1,
        sessionCorrect: state.sessionCorrect + 1,
        message: null,
        messageType: null,
      };
      if (isSingle) {
        return { ...nextCorrect, phase: "names", feedbackKey: state.feedbackKey + 1 };
      }
      return {
        ...nextCorrect,
        phase: "naming",
        batchAbilityStatus: state.currentRound.abilitiesPresented.map(() => "pending"),
        batchAbilityKeys: {},
      };
    }
    case "SUBMIT_BATCH_ABILITY": {
      if (state.phase !== "naming" || !state.currentRound) return state;
      const batchAbilities = state.currentRound.abilitiesPresented;
      const batchAbility = batchAbilities[action.abilityIndex];
      if (!batchAbility) return state;

      const correct = gradeAbilityNameGuess(batchAbility, action.guess);

      if (!correct) {
        return {
          ...state,
          sessionAttempts: state.sessionAttempts + 1,
          lastRoundSkipped: false,
          batchAbilityKeys: {
            ...state.batchAbilityKeys,
            [action.abilityIndex]: (state.batchAbilityKeys[action.abilityIndex] || 0) + 1,
          },
          message: "✗ Wrong ability! Try again.",
          messageType: "incorrect",
        };
      }

      const newStatus = [...state.batchAbilityStatus];
      newStatus[action.abilityIndex] = "correct";
      const allDone = newStatus.every((s) => s !== "pending");

      if (allDone) {
        return {
          ...state,
          batchAbilityStatus: newStatus,
          sessionAttempts: state.sessionAttempts + 1,
          sessionCorrect: state.sessionCorrect + 1,
          lastRoundSkipped: false,
          phase: "result",
          message: null,
          messageType: null,
        };
      }

      return {
        ...state,
        batchAbilityStatus: newStatus,
        sessionAttempts: state.sessionAttempts + 1,
        sessionCorrect: state.sessionCorrect + 1,
        lastRoundSkipped: false,
        message: null,
        messageType: null,
      };
    }
    case "SUBMIT_ABILITY": {
      if (!state.session || !state.currentRound || !state.currentRound.abilitiesPresented[0])
        return state;
      const ability = state.currentRound.abilitiesPresented[0];
      const correct = gradeAbilityNameGuess(ability, action.guess);

      if (!correct) {
        return {
          ...state,
          abilityGuess: action.guess,
          abilityGuesses: [...state.abilityGuesses, { guess: action.guess, correct: false }],
          sessionAttempts: state.sessionAttempts + 1,
          lastRoundSkipped: false,
        };
      }

      return {
        ...state,
        abilityGuess: action.guess,
        abilityGuesses: [...state.abilityGuesses, { guess: action.guess, correct: true }],
        lastAbilityCorrect: true,
        lastRoundSkipped: false,
        sessionAttempts: state.sessionAttempts + 1,
        sessionCorrect: state.sessionCorrect + 1,
        phase: "result",
        message: null,
        messageType: null,
      };
    }
    case "NEXT_ROUND": {
      if (!state.session) return state;
      const round = pickRound(state.session);
      const iconIdx =
        state.mode === "single" && round && round.abilitiesPresented[0].icons.length > 1
          ? Math.floor(Math.random() * round.abilitiesPresented[0].icons.length)
          : 0;
      return {
        ...state,
        currentRound: round,
        phase: "champion",
        championGuess: "",
        abilityGuess: "",
        championGuesses: [],
        abilityGuesses: [],
        lastChampionCorrect: null,
        lastAbilityCorrect: null,
        lastRoundSkipped: false,
        shownIconIndex: iconIdx,
        feedbackKey: state.feedbackKey + 1,
        roundGrayscale: true,
        roundRotation: true,
        roundRotationAngle: ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)],
        roundGrayscaleLocked: false,
        roundRotationLocked: false,
        batchAbilityStatus: [],
        batchAbilityKeys: {},
        message: null,
        messageType: null,
        sessionComplete: false,
      };
    }
    case "SKIP_ROUND": {
      if (!state.session || !state.currentRound) return state;
      return {
        ...state,
        phase: "result",
        lastRoundSkipped: true,
        sessionSkipped: state.sessionSkipped + 1,
      };
    }
    case "SKIP_BATCH_ABILITY": {
      if (state.phase !== "naming") return state;
      const currentIdx = state.batchAbilityStatus.findIndex((s) => s === "pending");
      if (currentIdx === -1) return state;
      const newStatus = [...state.batchAbilityStatus];
      newStatus[currentIdx] = "skipped";
      const allDone = newStatus.every((s) => s !== "pending");
      if (allDone) {
        return {
          ...state,
          batchAbilityStatus: newStatus,
          phase: "result",
          lastRoundSkipped: true,
          sessionSkipped: state.sessionSkipped + 1,
        };
      }
      return {
        ...state,
        batchAbilityStatus: newStatus,
        sessionSkipped: state.sessionSkipped + 1,
        batchAbilityKeys: {
          ...state.batchAbilityKeys,
          [currentIdx]: (state.batchAbilityKeys[currentIdx] || 0) + 1,
        },
      };
    }
    case "CLEAR_MESSAGE":
      return { ...state, message: null, messageType: null };
    case "FINISH_SESSION": {
      return {
        ...state,
        phase: "complete",
        sessionComplete: true,
        totalGames: state.totalGames + 1,
        lifetimeAttempts: state.lifetimeAttempts + state.sessionAttempts,
        lifetimeCorrect: state.lifetimeCorrect + state.sessionCorrect,
        lifetimeSkipped: state.lifetimeSkipped + state.sessionSkipped,
      };
    }
    case "RETURN_HOME": {
      return { ...state, phase: "idle", session: null, currentRound: null, sessionComplete: false };
    }
    case "TOGGLE_THEME": {
      const next = state.theme === "dark" ? "light" : "dark";
      saveTheme(next);
      return { ...state, theme: next };
    }
    case "LOAD_PERSISTED": {
      const d = action.data;
      return {
        ...state,
        totalGames: d.totalGames,
        lifetimeAttempts: d.lifetimeAttempts,
        lifetimeCorrect: d.lifetimeCorrect,
        lifetimeSkipped: d.lifetimeSkipped,
        mode: d.lastMode || state.mode,
        theme: d.theme || state.theme,
        abilityList: d.toggles?.abilityList ?? true,
      };
    }
    case "RESET_STATS": {
      resetAll();
      return {
        ...state,
        totalGames: 0,
        lifetimeAttempts: 0,
        lifetimeCorrect: 0,
        lifetimeSkipped: 0,
      };
    }
    default:
      return state;
  }
}

const initialState: QuizState = {
  mode: "single",
  filters: {},
  session: null,
  currentRound: null,
  phase: "idle",
  championGuess: "",
  abilityGuess: "",
  championGuesses: [],
  abilityGuesses: [],
  lastChampionCorrect: null,
  lastAbilityCorrect: null,
  lastRoundSkipped: false,
  championPool: [],
  abilityNamePool: [],
  sessionComplete: false,
  theme: "dark",
  totalGames: 0,
  lifetimeAttempts: 0,
  lifetimeCorrect: 0,
  lifetimeSkipped: 0,
  sessionAttempts: 0,
  sessionCorrect: 0,
  sessionSkipped: 0,
  roundGrayscale: true,
  roundRotation: true,
  roundRotationAngle: 0,
  roundGrayscaleLocked: false,
  roundRotationLocked: false,
  abilityList: true,
  feedbackKey: 0,
  batchAbilityStatus: [],
  batchAbilityKeys: {},
  message: null,
  messageType: null,
};

const QuizContext = createContext<{
  state: QuizState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const data = loadAll();
    dispatch({ type: "LOAD_PERSISTED", data });
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(state.theme);
  }, [state.theme]);

  useEffect(() => {
    if (state.phase === "complete" && state.session) {
      saveTotalGames(state.totalGames);
      saveLifetimeAttempts(state.lifetimeAttempts);
      saveLifetimeCorrect(state.lifetimeCorrect);
      saveLifetimeSkipped(state.lifetimeSkipped);
      saveSeenChampions(state.session.seenChampions);
      saveLastSettings(state.mode);
    }
  }, [
    state.phase,
    state.session,
    state.totalGames,
    state.lifetimeAttempts,
    state.lifetimeCorrect,
    state.lifetimeSkipped,
    state.mode,
  ]);

  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz must be used within QuizProvider");
  return ctx;
}
