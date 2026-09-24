import { CategoriaReclamo, EstadoReclamo, OrigenClasificacion, PrioridadReclamo } from "./enums";

export const ESTADO_LABEL: Record<EstadoReclamo, string> = {
  [EstadoReclamo.RECIBIDO]: "Recibido",
  [EstadoReclamo.EN_REVISION]: "En revision",
  [EstadoReclamo.ASIGNADO]: "Asignado",
  [EstadoReclamo.EN_PROCESO]: "En proceso",
  [EstadoReclamo.RESUELTO]: "Resuelto",
  [EstadoReclamo.RECHAZADO]: "Rechazado",
  [EstadoReclamo.CERRADO]: "Cerrado",
};

export const ESTADO_HEX: Record<EstadoReclamo, string> = {
  [EstadoReclamo.RECIBIDO]: "#2563eb",
  [EstadoReclamo.EN_REVISION]: "#d9a406",
  [EstadoReclamo.ASIGNADO]: "#0891b2",
  [EstadoReclamo.EN_PROCESO]: "#ea580c",
  [EstadoReclamo.RESUELTO]: "#16a34a",
  [EstadoReclamo.RECHAZADO]: "#dc2626",
  [EstadoReclamo.CERRADO]: "#64748b",
};

export const ESTADO_ON_COLOR: Record<EstadoReclamo, string> = {
  [EstadoReclamo.RECIBIDO]: "var(--status-received-on)",
  [EstadoReclamo.EN_REVISION]: "var(--status-review-on)",
  [EstadoReclamo.ASIGNADO]: "var(--status-assigned-on)",
  [EstadoReclamo.EN_PROCESO]: "var(--status-progress-on)",
  [EstadoReclamo.RESUELTO]: "var(--status-resolved-on)",
  [EstadoReclamo.RECHAZADO]: "var(--status-rejected-on)",
  [EstadoReclamo.CERRADO]: "var(--status-closed-on)",
};

export const ESTADO_TEXT_COLOR: Record<EstadoReclamo, string> = {
  [EstadoReclamo.RECIBIDO]: "var(--status-received-text)",
  [EstadoReclamo.EN_REVISION]: "var(--status-review-text)",
  [EstadoReclamo.ASIGNADO]: "var(--status-assigned-text)",
  [EstadoReclamo.EN_PROCESO]: "var(--status-progress-text)",
  [EstadoReclamo.RESUELTO]: "var(--status-resolved-text)",
  [EstadoReclamo.RECHAZADO]: "var(--status-rejected-text)",
  [EstadoReclamo.CERRADO]: "var(--status-closed-text)",
};

export const PRIORIDAD_LABEL: Record<PrioridadReclamo, string> = {
  [PrioridadReclamo.BAJA]: "Baja",
  [PrioridadReclamo.MEDIA]: "Media",
  [PrioridadReclamo.ALTA]: "Alta",
  [PrioridadReclamo.CRITICA]: "Critica",
};

export const PRIORIDAD_HEX: Record<PrioridadReclamo, string> = {
  [PrioridadReclamo.BAJA]: "var(--priority-low)",
  [PrioridadReclamo.MEDIA]: "var(--priority-medium)",
  [PrioridadReclamo.ALTA]: "var(--priority-high)",
  [PrioridadReclamo.CRITICA]: "var(--priority-critical)",
};

export const AREA_SUGERIDA: Record<CategoriaReclamo, string> = {
  [CategoriaReclamo.ALUMBRADO]: "Alumbrado Publico",
  [CategoriaReclamo.BACHES]: "Vialidad y Mantenimiento Vial",
  [CategoriaReclamo.RESIDUOS]: "Higiene Urbana",
  [CategoriaReclamo.ARBOLADO]: "Arbolado y Espacios Verdes",
  [CategoriaReclamo.AGUA_CLOACAS]: "Aguas y Saneamiento",
  [CategoriaReclamo.TRANSITO]: "Transito y Transporte",
  [CategoriaReclamo.RUIDOS]: "Control Urbano",
  [CategoriaReclamo.ESPACIOS_PUBLICOS]: "Espacios Publicos",
  [CategoriaReclamo.SEGURIDAD]: "Seguridad Ciudadana",
  [CategoriaReclamo.OTROS]: "Mesa de Entradas",
};

export const CATEGORIA_HEX: Record<CategoriaReclamo, string> = {
  [CategoriaReclamo.ALUMBRADO]: "var(--category-alumbrado)",
  [CategoriaReclamo.BACHES]: "var(--category-baches)",
  [CategoriaReclamo.RESIDUOS]: "var(--category-residuos)",
  [CategoriaReclamo.ARBOLADO]: "var(--category-arbolado)",
  [CategoriaReclamo.AGUA_CLOACAS]: "var(--category-agua)",
  [CategoriaReclamo.TRANSITO]: "var(--category-transito)",
  [CategoriaReclamo.RUIDOS]: "var(--category-ruidos)",
  [CategoriaReclamo.ESPACIOS_PUBLICOS]: "var(--category-espacios)",
  [CategoriaReclamo.SEGURIDAD]: "var(--category-seguridad)",
  [CategoriaReclamo.OTROS]: "var(--category-otros)",
};

export const CATEGORIA_LABEL: Record<CategoriaReclamo, string> = {
  [CategoriaReclamo.ALUMBRADO]: "Alumbrado",
  [CategoriaReclamo.BACHES]: "Baches",
  [CategoriaReclamo.RESIDUOS]: "Residuos",
  [CategoriaReclamo.ARBOLADO]: "Arbolado",
  [CategoriaReclamo.AGUA_CLOACAS]: "Agua y cloacas",
  [CategoriaReclamo.TRANSITO]: "Transito",
  [CategoriaReclamo.RUIDOS]: "Ruidos",
  [CategoriaReclamo.ESPACIOS_PUBLICOS]: "Espacios publicos",
  [CategoriaReclamo.SEGURIDAD]: "Seguridad",
  [CategoriaReclamo.OTROS]: "Otros",
};

export const ORIGEN_LABEL: Record<OrigenClasificacion, string> = {
  [OrigenClasificacion.CIUDADANO]: "Ciudadano",
  [OrigenClasificacion.MODELO]: "IA",
  [OrigenClasificacion.OPERADOR]: "Operador",
};

export function opcionesEstado() {
  return Object.entries(ESTADO_LABEL).map(([value, label]) => ({ value, label }));
}

export function opcionesPrioridad() {
  return Object.entries(PRIORIDAD_LABEL).map(([value, label]) => ({ value, label }));
}

export function opcionesCategoria() {
  return Object.entries(CATEGORIA_LABEL).map(([value, label]) => ({ value, label }));
}
