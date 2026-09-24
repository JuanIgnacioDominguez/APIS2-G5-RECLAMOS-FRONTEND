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

export const ICONO_ESTADO: Record<EstadoReclamo, LucideIcon> = {
  RECIBIDO: Inbox,
  EN_REVISION: Eye,
  ASIGNADO: UserCheck,
  EN_PROCESO: Cog,
  RESUELTO: CheckCircle2,
  RECHAZADO: XCircle,
  CERRADO: Archive,
};

export const ICONO_PRIORIDAD: Record<PrioridadReclamo, LucideIcon> = {
  BAJA: ChevronDown,
  MEDIA: Equal,
  ALTA: ChevronUp,
  CRITICA: ChevronsUp,
};
