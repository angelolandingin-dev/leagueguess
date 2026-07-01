import { Badge } from "@/components/ui/badge";

interface ScoreChipProps {
  label: string;
  value: string | number;
  variant?: "default" | "secondary" | "outline" | "success" | "danger";
}

export function ScoreChip({ label, value, variant = "default" }: ScoreChipProps) {
  return (
    <Badge variant={variant === "success" ? "default" : variant === "danger" ? "destructive" : variant} className="gap-1.5 font-mono tabular-nums text-sm py-1.5">
      <span className="text-muted-foreground font-sans text-xs">{label}</span>
      {value}
    </Badge>
  );
}
