import data from "./champions.json" assert { type: "json" };
import type { ChampionsData, Champion, Ability, Slot, RawChampion, RawAbility } from "./types";
function parseSlot(s: string): Slot {
  if (s === "i" || s === "q" || s === "w" || s === "e" || s === "r") return s;
  return "i";
}

function buildChampion(raw: RawChampion): Champion {
  const abilities: Ability[] = raw.abilities
    .filter((a: RawAbility) => a.icons.length > 0)
    .map((a: RawAbility) => ({
      champion: raw.name,
      name: a.name,
      slot: parseSlot(a.slot),
      icons: a.icons,
    }));
  return { name: raw.name, abilities };
}

const raw = data as ChampionsData;

export const champions: Champion[] = raw.champions
  .map(buildChampion)
  .filter((c) => c.abilities.length > 0);

export const championIndex: Map<string, Champion> = new Map(
  champions.map((c) => [c.name, c])
);

export const allAbilityNames: string[] = Array.from(
  new Set(champions.flatMap((c) => c.abilities.map((a) => a.name)))
);

export function getChampion(name: string): Champion | undefined {
  return championIndex.get(name);
}

export function getChampionsByPool(pool: string[]): Champion[] {
  return champions.filter((c) => pool.includes(c.name));
}

export function getAbilityNamePool(pool: string[]): string[] {
  return Array.from(
    new Set(
      champions
        .filter((c) => pool.includes(c.name))
        .flatMap((c) => c.abilities.map((a) => a.name))
    )
  );
}

export function getAllChampionNames(): string[] {
  return champions.map((c) => c.name);
}

export const TRANSFORM_CHAMPIONS = ["Jayce", "Elise", "Nidalee", "Gnar"] as const;

function decodeIconName(filename: string, championPrefix?: string): string {
  let name = decodeURIComponent(filename)
    .replace(/_HD\.(png|jpg)$/i, "")
    .replace(/_/g, " ")
    .trim();
  if (championPrefix && name.startsWith(championPrefix + " ")) {
    name = name.slice(championPrefix.length + 1);
  }
  return name;
}

export function isTransformChampion(championName: string): boolean {
  return (TRANSFORM_CHAMPIONS as readonly string[]).includes(championName);
}

export function getChampionAllAbilityNames(championName: string): string[] {
  const champ = championIndex.get(championName);
  if (!champ) return [];
  const names = new Set<string>();
  for (const ability of champ.abilities) {
    names.add(ability.name);
    if (isTransformChampion(championName)) {
      for (const icon of ability.icons) {
        const formName = decodeIconName(icon, championName);
        const stripped = formName.replace(/\s+\d+$/, "");
        if (stripped && stripped !== ability.name) {
          names.add(stripped);
        }
      }
    }
  }
  return Array.from(names);
}
