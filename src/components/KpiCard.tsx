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
 * A single dashboard KPI: a tinted icon chip, the label, the value, and an
 * optional hint. The color lives in the icon chip (not a decorative border),
 * so the metric stays scannable and the panel reads as a professional tool.
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
    <Card className="transition-shadow hover:shadow-sm">
      <CardContent className="flex items-center gap-3">
        <div
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-lg"
          style={{ backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`, color }}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-0.5 text-2xl font-semibold leading-none tabular-nums">{value}</p>
          {hint && <p className="mt-1.5 truncate text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
