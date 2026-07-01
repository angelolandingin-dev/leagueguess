import data from "@/data/champions.json" assert { type: "json" };
import type { ChampionsData } from "@/data/types";

const championsData = data as ChampionsData;

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <h1 className="font-heading text-2xl font-bold tracking-tight">About</h1>

        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-foreground font-semibold mb-1">How to Play</h2>
            <p><strong className="text-foreground">Single Ability:</strong> You are shown one ability icon. Identify the champion it belongs to and the ability name. 15 rounds with streak multiplier.</p>
            <p className="mt-2"><strong className="text-foreground">Full Kit:</strong> You are shown all abilities of one champion. Identify the champion only. 10 rounds.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold mb-1">Data Source</h2>
            <p>
              Champion and ability data sourced from the{" "}
              <a
                href="https://wiki.leagueoflegends.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                League of Legends Wiki
              </a>{" "}
              under fair use, via a one-time educational dataset snapshot.
            </p>
            <p className="mt-1">
              <span className="text-muted-foreground">Snapshot date: </span>
              <span className="font-mono text-xs">{championsData.generated}</span>
            </p>
            <p className="mt-1">
              <span className="text-muted-foreground">Champions: </span>
              {championsData.totalChampions}
              <span className="text-muted-foreground"> · Abilities: </span>
              {championsData.totalAbilities}
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold mb-1">Disclaimer</h2>
            <p>
              LeagueGuess is a fan project. League of Legends is a registered trademark of Riot Games, Inc. This project is not affiliated with or endorsed by Riot Games.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
