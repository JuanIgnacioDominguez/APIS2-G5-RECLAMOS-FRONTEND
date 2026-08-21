import { Badge } from "@mantine/core";

import type { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import {
  CATEGORIA_LABEL,
  ESTADO_COLOR,
  ESTADO_LABEL,
  PRIORIDAD_COLOR,
  PRIORIDAD_LABEL,
} from "@/domain/labels";

export function EstadoBadge({ estado }: { estado: EstadoReclamo }) {
  return (
    <Badge color={ESTADO_COLOR[estado]} variant="light" radius="sm">
      {ESTADO_LABEL[estado]}
    </Badge>
  );
}

export function PrioridadBadge({ prioridad }: { prioridad: PrioridadReclamo }) {
  return (
    <Badge color={PRIORIDAD_COLOR[prioridad]} variant="filled" radius="sm">
      {PRIORIDAD_LABEL[prioridad]}
    </Badge>
  );
}

export function CategoriaBadge({ categoria }: { categoria: CategoriaReclamo }) {
  return (
    <Badge color="gray" variant="outline" radius="sm">
      {CATEGORIA_LABEL[categoria]}
    </Badge>
  );
}
