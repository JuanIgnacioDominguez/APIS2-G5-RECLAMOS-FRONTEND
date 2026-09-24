import type { CSSProperties } from "react";
import {
  Car,
  Construction,
  Droplets,
  Landmark,
  Lightbulb,
  MoreHorizontal,
  ShieldAlert,
  Sparkles,
  Trash2,
  Trees,
  User,
  Users,
  Volume2,
  type LucideIcon,
} from "lucide-react";

import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import { CategoriaReclamo, PrioridadReclamo } from "@/domain/enums";
import type { EstadoReclamo } from "@/domain/enums";
import {
  CATEGORIA_HEX,
  CATEGORIA_LABEL,
  ESTADO_HEX,
  ESTADO_LABEL,
  ESTADO_ON_COLOR,
  PRIORIDAD_HEX,
  PRIORIDAD_LABEL,
} from "@/domain/labels";
import { ICONO_PRIORIDAD } from "./iconos";

/**
 * Shared "soft color chip" look: vivid text on a saturated wash of the same
 * hue, with a hairline ring in that hue so the chip keeps a crisp edge on any
 * surface. Richer than a flat tint, calmer than a solid fill.
 */
function chipStyle(color: string): CSSProperties {
  return {
    backgroundColor: `color-mix(in oklab, ${color} 18%, transparent)`,
    boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${color} 38%, transparent)`,
    color,
  };
}

/** A leading dot with a soft halo of its own color. */
function ChipDot({ color }: { color: string }) {
  return (
    <span
      className="size-1.5 rounded-full"
      style={{
        backgroundColor: color,
        boxShadow: `0 0 0 2px color-mix(in oklab, ${color} 24%, transparent)`,
      }}
    />
  );
}

/** State: solid pill in the state's own color with white text, so "where the
 * claim is" reads as a strong, unambiguous signal. */
export function EstadoBadge({
  estado,
  className,
}: {
  estado: EstadoReclamo;
  /** Extra classes, e.g. `w-full justify-center` to give every state badge the
   * same width in a list. */
  className?: string;
}) {
  const color = ESTADO_HEX[estado];
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent font-semibold", className)}
      style={{
        backgroundColor: color,
        color: ESTADO_ON_COLOR[estado],
        textShadow: "var(--status-shadow)",
      }}
    >
      {ESTADO_LABEL[estado]}
    </Badge>
  );
}

/** Priority: outlined pill with a directional icon, visually apart from state. */
export function PrioridadBadge({ prioridad }: { prioridad: PrioridadReclamo }) {
  const color = PRIORIDAD_HEX[prioridad];
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

/**
 * Priority as a compact line whose text and icon take the priority's own
 * color: green (low) -> amber (medium) -> red (high) -> deep red (critical).
 * Used on the claim card instead of an outlined pill.
 */
export function PrioridadLinea({ prioridad }: { prioridad: PrioridadReclamo }) {
  const Icono = ICONO_PRIORIDAD[prioridad];
  return (
    <span
      className="inline-flex items-center gap-1 font-medium"
      style={{ color: PRIORIDAD_HEX[prioridad] }}
    >
      <Icono className="size-3.5 shrink-0" strokeWidth={2.25} />
      {PRIORIDAD_LABEL[prioridad]}
    </span>
  );
}

export function CategoriaBadge({ categoria }: { categoria: CategoriaReclamo }) {
  const color = CATEGORIA_HEX[categoria];
  return (
    <Badge
      variant="outline"
      className="gap-1.5 border-transparent font-medium"
      style={chipStyle(color)}
    >
      <ChipDot color={color} />
      {CATEGORIA_LABEL[categoria]}
    </Badge>
  );
}

const ICONO_CATEGORIA: Record<CategoriaReclamo, LucideIcon> = {
  [CategoriaReclamo.ALUMBRADO]: Lightbulb,
  [CategoriaReclamo.BACHES]: Construction,
  [CategoriaReclamo.RESIDUOS]: Trash2,
  [CategoriaReclamo.ARBOLADO]: Trees,
  [CategoriaReclamo.AGUA_CLOACAS]: Droplets,
  [CategoriaReclamo.TRANSITO]: Car,
  [CategoriaReclamo.RUIDOS]: Volume2,
  [CategoriaReclamo.ESPACIOS_PUBLICOS]: Landmark,
  [CategoriaReclamo.SEGURIDAD]: ShieldAlert,
  [CategoriaReclamo.OTROS]: MoreHorizontal,
};

/**
 * Category as an icon + label, with the icon tinted in the category's own
 * brand color (the same tint the feed filters use), so the category reads at
 * a glance. The label stays neutral to keep the state badge dominant.
 * Used on the claim card instead of a colored category chip.
 */
export function CategoriaLinea({ categoria }: { categoria: CategoriaReclamo }) {
  const Icono = ICONO_CATEGORIA[categoria];
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <Icono className="size-3.5 shrink-0" style={{ color: CATEGORIA_HEX[categoria] }} />
      <span className="truncate">{CATEGORIA_LABEL[categoria]}</span>
    </span>
  );
}

/** Just the category's icon, tinted in its own brand color. For lists/filters. */
export function CategoriaIcono({
  categoria,
  className = "size-4",
}: {
  categoria: CategoriaReclamo;
  className?: string;
}) {
  const Icono = ICONO_CATEGORIA[categoria];
  return <Icono className={className} style={{ color: CATEGORIA_HEX[categoria] }} />;
}

/**
 * Ownership tag as plain colored text (no pill): the citizen's own claims read
 * as a green "Tuyo", everyone else's as a slate-blue "De un vecino". Icon plus
 * label, so the meaning never rests on color alone.
 */
export function AutoriaBadge({ mio }: { mio: boolean }) {
  const Icono = mio ? User : Users;
  const color = mio ? "var(--ownership-own)" : "var(--ownership-other)";
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color }}>
      <Icono className="size-3" />
      {mio ? "Tuyo" : "De un vecino"}
    </span>
  );
}

/** Small "IA" tag for claims the model classified. */
export function IaBadge() {
  return (
    <Badge
      variant="outline"
      className="gap-1 border-transparent font-medium"
      style={{
        backgroundColor: "color-mix(in oklab, var(--ai) 12%, transparent)",
        color: "var(--ai)",
      }}
    >
      <Sparkles className="size-3" />
      IA
    </Badge>
  );
}
