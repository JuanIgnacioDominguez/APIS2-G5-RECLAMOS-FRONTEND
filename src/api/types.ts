/**
 * TypeScript mirror of the backend HTTP contracts (`app/schemas/reclamo.py`).
 * Keep these in sync with the OpenAPI schema the backend publishes.
 */

import type {
  CanalOrigen,
  CategoriaReclamo,
  EstadoReclamo,
  OrigenClasificacion,
  PrioridadReclamo,
} from "@/domain/enums";

export interface ReclamoCrear {
  titulo: string;
  descripcion: string;
  categoria?: CategoriaReclamo | null;
  prioridad?: PrioridadReclamo | null;
  direccion?: string | null;
  barrio?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  fotos?: string[];
  canal?: CanalOrigen;
}

export interface CambioEstado {
  estado: EstadoReclamo;
  motivo?: string | null;
  asignado_a?: string | null;
  area_responsable?: string | null;
  resolucion?: string | null;
}

export interface ReclamoResumen {
  id: string;
  titulo: string;
  categoria: CategoriaReclamo;
  prioridad: PrioridadReclamo;
  estado: EstadoReclamo;
  barrio: string | null;
  latitud: number | null;
  longitud: number | null;
  adhesiones_count: number;
  created_at: string;
}

export interface ReclamoOut extends ReclamoResumen {
  ciudadano_id: string;
  descripcion: string;
  origen_clasificacion: OrigenClasificacion;
  confianza_clasificacion: number | null;
  canal: CanalOrigen;
  direccion: string | null;
  fotos: string[];
  asignado_a: string | null;
  area_responsable: string | null;
  resolucion: string | null;
  correlation_id: string | null;
  updated_at: string;
  resuelto_at: string | null;
  cerrado_at: string | null;
}

export interface HistorialOut {
  id: string;
  estado_anterior: EstadoReclamo | null;
  estado_nuevo: EstadoReclamo;
  motivo: string | null;
  usuario_id: string;
  created_at: string;
}

export interface ComentarioOut {
  id: string;
  reclamo_id: string;
  autor_id: string;
  autor_nombre: string | null;
  texto: string;
  es_oficial: boolean;
  created_at: string;
}

export interface ReclamoDetalle extends ReclamoOut {
  historial: HistorialOut[];
  comentarios: ComentarioOut[];
}

export interface SugerenciaClasificacion {
  categoria: CategoriaReclamo;
  prioridad: PrioridadReclamo;
  confianza: number;
  evidencia: string[];
  modelo: string;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export interface ReclamoBandeja {
  id: string;
  titulo: string;
  categoria: CategoriaReclamo;
  origen_clasificacion: OrigenClasificacion;
  prioridad: PrioridadReclamo;
  estado: EstadoReclamo;
  adhesiones_count: number;
  created_at: string;
}

export interface ReclasificacionPedido {
  categoria?: CategoriaReclamo | null;
  prioridad?: PrioridadReclamo | null;
}

export interface ConteoPorClave {
  clave: string;
  cantidad: number;
}

export interface Estadisticas {
  total: number;
  por_estado: ConteoPorClave[];
  por_categoria: ConteoPorClave[];
  por_prioridad: ConteoPorClave[];
  tiempo_resolucion_horas_promedio: number | null;
}

export interface FiltroReclamos {
  estado?: EstadoReclamo;
  categoria?: CategoriaReclamo;
  prioridad?: PrioridadReclamo;
  barrio?: string;
  texto?: string;
  orden?: string;
  page?: number;
  size?: number;
}
