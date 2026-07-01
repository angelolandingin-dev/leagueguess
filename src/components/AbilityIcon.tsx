import type { Ability } from "@/data/types";
import { getIconPath } from "@/lib/icon-url";

interface AbilityIconProps {
  ability: Ability;
  size?: "sm" | "md" | "lg";
  variantIndex?: number;
  alt?: string;
  grayscale?: boolean;
  rotation?: boolean;
  rotationAngle?: number;
}

export function AbilityIcon({
  ability,
  size = "md",
  variantIndex = 0,
  alt = "",
  grayscale = true,
  rotation = true,
  rotationAngle = 0,
}: AbilityIconProps) {
  const iconFile = ability.icons[variantIndex % ability.icons.length] || ability.icons[0];
  const src = getIconPath(ability.champion, iconFile);

  const sizeMap = {
    sm: "h-12 w-12",
    md: "h-20 w-20",
    lg: "h-32 w-32 sm:h-44 sm:w-44",
  };

  return (
    <div
      className={`${sizeMap[size]} rounded-md border border-border bg-surface-2 overflow-hidden flex items-center justify-center`}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-contain transition-all duration-300"
        style={{
          filter: grayscale ? "grayscale(1)" : "brightness(1.12) contrast(1.05)",
          transform: `rotate(${rotation ? rotationAngle : 0}deg)`,
        }}
        loading="lazy"
      />
    </div>
  );
}
