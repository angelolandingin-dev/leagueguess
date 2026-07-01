import type { Mode, Filters, Round, Ability } from "@/data/types";
import { champions } from "@/data/champions";
import { filterChampionsByMeta } from "@/data/champion-meta";

export interface Session {
  mode: Mode;
  filters: Filters;
  currentRoundIndex: number;
  seenChampions: Record<string, number>;
}

export function startSession(opts: {
  mode: Mode;
  filters?: Filters;
}): Session {
  return {
    mode: opts.mode,
    filters: opts.filters || {},
    currentRoundIndex: 0,
    seenChampions: {},
  };
}

function getPool(session: Session): string[] {
  return filterChampionsByMeta(
    champions.map((c) => c.name),
    session.filters
  );
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
    return { champion: chosen, abilitiesPresented: shuffle(chosen.abilities) };
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

function abilityNameMatch(roundName: string, guess: string): boolean {
  return normalize(roundName) === normalize(guess);
}

export function gradeChampionGuess(round: Round, guess: string): boolean {
  return normalize(round.champion.name) === normalize(guess);
}

export function gradeAbilityNameGuess(
  ability: Ability,
  guess: string
): boolean {
  return abilityNameMatch(ability.name, guess);
}


