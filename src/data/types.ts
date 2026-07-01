export type Slot = "i" | "q" | "w" | "e" | "r";

export interface Ability {
  champion: string;
  name: string;
  slot: Slot;
  icons: string[];
}

export interface Champion {
  name: string;
  abilities: Ability[];
}

export interface RawAbility {
  description: string;
  name: string;
  icons: string[];
  slot: string;
}

export interface RawChampion {
  name: string;
  abilities: RawAbility[];
}

export interface ChampionsData {
  totalAbilities: number;
  champions: RawChampion[];
  generated: string;
  totalChampions: number;
}

export type Mode = "single" | "batch";

export interface Filters {
  region?: string;
  era?: string;
  class?: string;
}

export interface RoundResult {
  championName: string;
  championCorrect: boolean;
  abilityName?: string;
  abilityCorrect?: boolean;
  abilitySlot?: string;
}

export interface GameState {
  mode: Mode;
  filters: Filters;
  sessionAttempts: number;
  sessionCorrect: number;
  sessionSkipped: number;
  lifetimeAttempts: number;
  lifetimeCorrect: number;
  lifetimeSkipped: number;
  totalGames: number;
  currentRoundIndex: number;
  rounds: Round[];
  history: RoundResult[];
  phase: "champion" | "names" | "result";
}

export interface Round {
  champion: Champion;
  abilitiesPresented: Ability[];
}

export interface SessionSettings {
  mode: Mode;
  filters: Filters;
}
