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

export interface Round {
  champion: Champion;
  abilitiesPresented: Ability[];
}
