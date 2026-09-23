import { ChevronDown, ChevronUp, ChevronsUp, Equal, Sparkles, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import {
  CATEGORIA_LABEL,
  COLOR_HEX,
  ESTADO_COLOR,
  ESTADO_LABEL,
  PRIORIDAD_COLOR,
  PRIORIDAD_LABEL,
} from "@/domain/labels";

/** State: tinted pill with a leading dot, so it reads as "where the claim is". */
export function EstadoBadge({ estado }: { estado: EstadoReclamo }) {
  const color = COLOR_HEX[ESTADO_COLOR[estado]];
  return (
    <Badge
      variant="outline"
      className="gap-1.5 border-transparent font-medium"
      style={{ backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`, color }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      {ESTADO_LABEL[estado]}
    </Badge>
  );
}

const ICONO_PRIORIDAD: Record<PrioridadReclamo, LucideIcon> = {
  BAJA: ChevronDown,
  MEDIA: Equal,
  ALTA: ChevronUp,
  CRITICA: ChevronsUp,
};

/** Priority: outlined pill with a directional icon, visually apart from state. */
export function PrioridadBadge({ prioridad }: { prioridad: PrioridadReclamo }) {
  const color = COLOR_HEX[PRIORIDAD_COLOR[prioridad]];
  const Icono = ICONO_PRIORIDAD[prioridad];
  return (
    <Badge
      variant="outline"
      className="gap-1 bg-transparent font-semibold"
      style={{ borderColor: color, color }}
    >
      <Icono strokeWidth={2.5} />
      {PRIORIDAD_LABEL[prioridad]}
    </Badge>
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
