import {
  Archive,
  CarFront,
  CheckCircle2,
  ChevronDown,
  ChevronsUp,
  ChevronUp,
  Cog,
  Construction,
  Droplets,
  Equal,
  Eye,
  Inbox,
  Landmark,
  Lightbulb,
  Shapes,
  ShieldAlert,
  Trash2,
  TreePine,
  UserCheck,
  Volume2,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import type { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";

/**
 * Shared iconography for the claim vocabulary, so dropdowns, cards and
 * legends always show the same glyph per value. Colors stay in
 * `domain/labels` (`CATEGORIA_HEX`, `ESTADO_HEX`, `PRIORIDAD_HEX`); this
 * module only maps values to icons.
 */

/** One recognizable icon per category. */
export const ICONO_CATEGORIA: Record<CategoriaReclamo, LucideIcon> = {
  ALUMBRADO: Lightbulb,
  BACHES: Construction,
  RESIDUOS: Trash2,
  ARBOLADO: TreePine,
  AGUA_CLOACAS: Droplets,
  TRANSITO: CarFront,
  RUIDOS: Volume2,
  ESPACIOS_PUBLICOS: Landmark,
  SEGURIDAD: ShieldAlert,
  OTROS: Shapes,
};

/** One recognizable icon per state. */
export const ICONO_ESTADO: Record<EstadoReclamo, LucideIcon> = {
  RECIBIDO: Inbox,
  EN_REVISION: Eye,
  ASIGNADO: UserCheck,
  EN_PROCESO: Cog,
  RESUELTO: CheckCircle2,
  RECHAZADO: XCircle,
  CERRADO: Archive,
};

/** Directional icons reading as a calm-to-urgent ramp. */
export const ICONO_PRIORIDAD: Record<PrioridadReclamo, LucideIcon> = {
  BAJA: ChevronDown,
  MEDIA: Equal,
  ALTA: ChevronUp,
  CRITICA: ChevronsUp,
};
