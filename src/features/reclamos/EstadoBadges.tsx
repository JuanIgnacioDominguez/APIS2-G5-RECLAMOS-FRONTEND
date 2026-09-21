import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import {
  CATEGORIA_LABEL,
  ESTADO_COLOR,
  ESTADO_LABEL,
  PRIORIDAD_COLOR,
  PRIORIDAD_LABEL,
} from "@/domain/labels";

// The domain color keys mapped to the CityPass+ hex values, so the shadcn Badge
// can be tinted per status without leaving the palette.
const COLOR_HEX: Record<string, string> = {
  gray: "#64748b",
  azulUrbano: "#2563a6",
  ambar: "#d99838",
  verdeUrbano: "#4f8a72",
  rojoEmergencia: "#c83e4d",
};

function BadgeColoreado({ colorKey, children }: { colorKey: string; children: ReactNode }) {
  const color = COLOR_HEX[colorKey] ?? COLOR_HEX.azulUrbano;
  return (
    <Badge
      variant="outline"
      className="border-transparent font-medium"
      style={{
        backgroundColor: `color-mix(in oklab, ${color} 12%, transparent)`,
        color,
      }}
    >
      {children}
    </Badge>
  );
}

export function EstadoBadge({ estado }: { estado: EstadoReclamo }) {
  return <BadgeColoreado colorKey={ESTADO_COLOR[estado]}>{ESTADO_LABEL[estado]}</BadgeColoreado>;
}

export function PrioridadBadge({ prioridad }: { prioridad: PrioridadReclamo }) {
  return (
    <BadgeColoreado colorKey={PRIORIDAD_COLOR[prioridad]}>
      {PRIORIDAD_LABEL[prioridad]}
    </BadgeColoreado>
  );
}

export function CategoriaBadge({ categoria }: { categoria: CategoriaReclamo }) {
  return (
    <Badge variant="secondary" className="font-medium">
      {CATEGORIA_LABEL[categoria]}
    </Badge>
  );
}

/** Small "IA" tag for claims the model classified. */
export function IaBadge() {
  return (
    <Badge
      variant="outline"
      className="gap-1 border-transparent font-medium"
      style={{
        backgroundColor: "color-mix(in oklab, var(--chart-1) 12%, transparent)",
        color: "var(--chart-1)",
      }}
    >
      <Sparkles className="size-3" />
      IA
    </Badge>
  );
}
