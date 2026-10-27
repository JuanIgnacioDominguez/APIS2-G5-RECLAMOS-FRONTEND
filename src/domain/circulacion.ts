import {
  CATEGORIAS_QUE_AFECTAN_CIRCULACION,
  ESTADOS_FINALES,
  EstadoReclamo,
  type CategoriaReclamo,
} from "./enums";

// The backend now owns this rule and sends `afecta_circulacion` on every
// reclamo. This helper mirrors the same criterion and is only for the create
// form, where there is no reclamo yet and we preview the effect of the chosen
// category before submitting. For an existing reclamo, read `afecta_circulacion`.
export function afectaCirculacion(categoria: CategoriaReclamo): boolean {
  return CATEGORIAS_QUE_AFECTAN_CIRCULACION.has(categoria);
}

// An incident stops counting for the route once it is solved or closed.
export function esIncidenteActivo(reclamo: {
  afecta_circulacion: boolean;
  estado: EstadoReclamo;
}): boolean {
  return (
    reclamo.afecta_circulacion &&
    reclamo.estado !== EstadoReclamo.RESUELTO &&
    !ESTADOS_FINALES.has(reclamo.estado)
  );
}
