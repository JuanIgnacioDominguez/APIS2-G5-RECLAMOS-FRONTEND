import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

/** Accent tones for the KPI icon, mapped to the CityPass+ chart tokens. */
const TONO: Record<string, string> = {
  azul: "var(--chart-1)",
  verde: "var(--chart-2)",
  ambar: "var(--chart-3)",
  rojo: "var(--chart-4)",
  neutral: "var(--muted-foreground)",
};

export type KpiTono = keyof typeof TONO;

/**
 * A single dashboard KPI: label, value, an optional hint, and a tinted icon.
 * Built on the shadcn Card so it inherits the app's light/dark tokens.
 */
export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tono = "azul",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tono?: KpiTono;
}) {
  const color = TONO[tono] ?? TONO.azul;
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold leading-none tabular-nums">{value}</p>
          {hint && <p className="mt-1.5 truncate text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span
          aria-hidden
          className="flex size-11 shrink-0 items-center justify-center rounded-xl"
          style={{
            backgroundColor: `color-mix(in oklab, ${color} 12%, transparent)`,
            color,
          }}
        >
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}
