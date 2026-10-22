import {
  CATEGORIAS_QUE_AFECTAN_CIRCULACION,
  ESTADOS_FINALES,
  EstadoReclamo,
  type CategoriaReclamo,
} from "./enums";

export function afectaCirculacion(categoria: CategoriaReclamo): boolean {
  return CATEGORIAS_QUE_AFECTAN_CIRCULACION.has(categoria);
}

// An incident stops counting for the route once it is solved or closed.
export function esIncidenteActivo(reclamo: {
  categoria: CategoriaReclamo;
  estado: EstadoReclamo;
}): boolean {
  return (
    afectaCirculacion(reclamo.categoria) &&
    reclamo.estado !== EstadoReclamo.RESUELTO &&
    !ESTADOS_FINALES.has(reclamo.estado)
  );
}
