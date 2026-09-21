import { describe, expect, it } from "vitest";

import type { ReclamoResumen } from "@/api/types";
import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import { CENTRO_DEFAULT, reclamosUbicados } from "./coords";

function reclamo(id: string, lat: number | null, lng: number | null): ReclamoResumen {
  return {
    id,
    titulo: `Reclamo ${id}`,
    categoria: CategoriaReclamo.BACHES,
    prioridad: PrioridadReclamo.MEDIA,
    estado: EstadoReclamo.RECIBIDO,
    barrio: null,
    latitud: lat,
    longitud: lng,
    adhesiones_count: 0,
    created_at: new Date().toISOString(),
  };
}

describe("reclamosUbicados", () => {
  it("conserva solo los reclamos con latitud y longitud", () => {
    const items = [
      reclamo("1", -34.6, -58.4),
      reclamo("2", null, -58.4),
      reclamo("3", -34.6, null),
      reclamo("4", -34.61, -58.38),
    ];
    expect(reclamosUbicados(items).map((r) => r.id)).toEqual(["1", "4"]);
  });

  it("el centro por defecto es CABA", () => {
    expect(CENTRO_DEFAULT).toEqual([-34.6037, -58.3816]);
  });
});
