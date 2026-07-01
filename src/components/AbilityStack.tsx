"use client";

import type { Ability } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { AbilityIcon } from "@/components/AbilityIcon";

const slotLabels: Record<string, string> = {
  i: "P",
  q: "Q",
  w: "W",
  e: "E",
  r: "R",
};

interface AbilityStackProps {
  abilities: Ability[];
  size?: "sm" | "md";
  showLabels?: boolean;
  reveal?: boolean;
  grayscale?: boolean;
  rotation?: boolean;
}

export function AbilityStack({
  abilities,
  size = "md",
  showLabels = true,
  reveal = false,
  grayscale = true,
  rotation = true,
}: AbilityStackProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {abilities.map((ability) => (
        <div key={ability.slot} className="flex flex-col items-center gap-1.5">
          <div className="relative">
            {ability.icons.length > 1 ? (
              <div className="relative">
                <AbilityIcon
                  ability={ability}
                  size={size}
                  variantIndex={0}
                  alt={reveal ? `${ability.name} (${slotLabels[ability.slot]})` : ""}
                  grayscale={grayscale}
                  rotation={rotation}
                />
                {ability.icons.length > 1 && (
                  <div className="absolute -bottom-1 -right-1 flex">
                    {ability.icons.slice(0, Math.min(ability.icons.length, 3)).map((_, i) => (
                      <div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-primary border border-background"
                        style={{ marginLeft: i > 0 ? -2 : 0 }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <AbilityIcon
                ability={ability}
                size={size}
                alt={reveal ? `${ability.name} (${slotLabels[ability.slot]})` : ""}
                grayscale={grayscale}
                rotation={rotation}
              />
            )}
          </div>
          {showLabels && (
            <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 h-5">
              {slotLabels[ability.slot]}
            </Badge>
          )}
          {reveal && (
            <span className="text-xs text-center leading-tight max-w-[80px]">
              {ability.name}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
