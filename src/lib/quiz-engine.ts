import type { Mode, Round, Ability } from "@/data/types";
import { champions, getAllChampionNames } from "@/data/champions";

export interface Session {
  mode: Mode;
  currentRoundIndex: number;
  seenChampions: Record<string, number>;
}

export function startSession(opts: {
  mode: Mode;
}): Session {
  return {
    mode: opts.mode,
    currentRoundIndex: 0,
    seenChampions: {},
  };
}

function getPool(_session: Session): string[] {
  return getAllChampionNames();
}

export function getChampionPoolNames(session: Session): string[] {
  return getPool(session);
}

export function getAbilityNamePoolForSession(session: Session): string[] {
  const pool = getPool(session);
  const names = new Set<string>();
  for (const c of champions) {
    if (pool.includes(c.name)) {
      for (const a of c.abilities) {
        names.add(a.name);
      }
    }
  }
  return shuffle(Array.from(names));
}

export function pickRound(session: Session): Round | null {
  const pool = getPool(session);
  const eligible = champions.filter((c) => pool.includes(c.name));
  if (eligible.length === 0) return null;

  const chosen = eligible[Math.floor(Math.random() * eligible.length)];

  session.seenChampions[chosen.name] = (session.seenChampions[chosen.name] || 0) + 1;

  if (session.mode === "batch") {
    const SLOT_ORDER: Record<string, number> = { i: 0, q: 1, w: 2, e: 3, r: 4 };
    const sorted = [...chosen.abilities].sort((a, b) => SLOT_ORDER[a.slot] - SLOT_ORDER[b.slot]);
    return { champion: chosen, abilitiesPresented: sorted };
  }

  const ability = pickWeightedAbility(chosen.abilities);
  return { champion: chosen, abilitiesPresented: [ability] };
}

function pickWeightedAbility(abilities: Ability[]): Ability {
  if (abilities.length === 0) throw new Error("pickWeightedAbility: empty abilities array");
  const withWeights = abilities.map((a) => ({
    ability: a,
    weight: Math.min(a.icons.length, 5),
  }));
  const total = withWeights.reduce((s, w) => s + w.weight, 0);
  let rand = Math.random() * total;
  for (const w of withWeights) {
    rand -= w.weight;
    if (rand <= 0) return w.ability;
  }
  return withWeights[0].ability;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[''']/g, "'")
    .replace(/[^a-z0-9\s']/g, "")
    .trim();
}

function iconFilenameToName(filename: string, champion: string): string {
  const prefix = champion.replace(/'/g, '').replace(/\s+/g, '_') + '_';
  let name = filename.startsWith(prefix) ? filename.slice(prefix.length) : filename;
  name = name.replace(/\.\w+$/, '');
  name = name.replace(/_HD\d*$/, '').replace(/_HD$/, '');
  name = name.replace(/%21/g, '!').replace(/%27/g, "'").replace(/%2C/g, ',').replace(/%2E/g, '.');
  name = name.replace(/_/g, ' ');
  return name.trim();
}

export function gradeChampionGuess(round: Round, guess: string): boolean {
  return normalize(round.champion.name) === normalize(guess);
}

export function gradeAbilityNameGuess(
  ability: Ability,
  guess: string,
  shownIcon?: string
): boolean {
  const guessNorm = normalize(guess);
  if (normalize(ability.name) === guessNorm) return true;
  if (!shownIcon) return false;

  const iconName = iconFilenameToName(shownIcon, ability.champion);
  const iconNorm = normalize(iconName);

  if (iconNorm === guessNorm) return true;
  if (iconNorm.includes(guessNorm) || guessNorm.includes(iconNorm)) return true;

  return false;
}


