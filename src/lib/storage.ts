import type { Mode } from "@/data/types";

const PREFIX = "leagueguess.";

interface PersistedData {
  totalGames: number;
  lifetimeAttempts: number;
  lifetimeCorrect: number;
  lifetimeSkipped: number;
  lastMode?: Mode;
  seenChampions: Record<string, number>;
  theme?: "dark" | "light";
  toggles?: { abilityList: boolean };
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function get<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
  }
}

function remove(key: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
  }
}

export function loadAll(): PersistedData {
  return {
    totalGames: get<number>("totalGames", 0),
    lifetimeAttempts: get<number>("lifetimeAttempts", 0),
    lifetimeCorrect: get<number>("lifetimeCorrect", 0),
    lifetimeSkipped: get<number>("lifetimeSkipped", 0),
    seenChampions: get<Record<string, number>>("seenChampions", {}),
    lastMode: get<Mode | undefined>("lastMode", undefined),
    theme: get<"dark" | "light" | undefined>("theme", undefined),
    toggles: get<{ abilityList: boolean } | undefined>("toggles", undefined),
  };
}

export function saveTotalGames(n: number): void {
  set("totalGames", n);
}

export function saveLifetimeAttempts(n: number): void {
  set("lifetimeAttempts", n);
}

export function saveLifetimeCorrect(n: number): void {
  set("lifetimeCorrect", n);
}

export function saveLifetimeSkipped(n: number): void {
  set("lifetimeSkipped", n);
}

export function saveSeenChampions(seen: Record<string, number>): void {
  set("seenChampions", seen);
}

export function saveLastSettings(mode: Mode): void {
  set("lastMode", mode);
}

export function saveTheme(theme: "dark" | "light"): void {
  set("theme", theme);
}

export function saveToggleStates(toggles: { abilityList: boolean }): void {
  set("toggles", toggles);
}

export function loadTheme(): "dark" | "light" {
  return get<"dark" | "light">("theme", "dark");
}

export function resetAll(): void {
  remove("totalGames");
  remove("lifetimeAttempts");
  remove("lifetimeCorrect");
  remove("lifetimeSkipped");
  remove("seenChampions");
  remove("lastMode");
  remove("toggles");
}
