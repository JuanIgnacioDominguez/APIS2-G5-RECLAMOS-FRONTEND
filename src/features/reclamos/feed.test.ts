import { describe, expect, it } from "vitest";

import type { ReclamoResumen } from "@/api/types";
import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import { barriosDisponibles, filtrarFeed } from "./feed";

function reclamo(over: Partial<ReclamoResumen>): ReclamoResumen {
  return {
    id: over.id ?? "1",
    titulo: over.titulo ?? "Reclamo",
    categoria: over.categoria ?? CategoriaReclamo.ALUMBRADO,
    prioridad: over.prioridad ?? PrioridadReclamo.MEDIA,
    estado: over.estado ?? EstadoReclamo.RECIBIDO,
    barrio: "barrio" in over ? (over.barrio ?? null) : "Centro",
    latitud: null,
    longitud: null,
    adhesiones_count: over.adhesiones_count ?? 0,
    created_at: over.created_at ?? "2026-09-01T10:00:00Z",
  };
}

describe("barriosDisponibles", () => {
  it("devuelve barrios distintos, ordenados y sin vacios ni nulos", () => {
    const items = [
      reclamo({ id: "1", barrio: "Palermo" }),
      reclamo({ id: "2", barrio: "Centro" }),
      reclamo({ id: "3", barrio: "Palermo" }),
      reclamo({ id: "4", barrio: null }),
      reclamo({ id: "5", barrio: "   " }),
    ];
    expect(barriosDisponibles(items)).toEqual(["Centro", "Palermo"]);
  });

  it("devuelve lista vacia cuando no hay barrios", () => {
    expect(barriosDisponibles([reclamo({ barrio: null })])).toEqual([]);
  });
});

describe("filtrarFeed", () => {
  const items = [
    reclamo({
      id: "viejo",
      barrio: "Centro",
      categoria: CategoriaReclamo.ALUMBRADO,
      estado: EstadoReclamo.RECIBIDO,
      created_at: "2026-09-01T10:00:00Z",
    }),
    reclamo({
      id: "nuevo",
      barrio: "Palermo",
      categoria: CategoriaReclamo.BACHES,
      estado: EstadoReclamo.RESUELTO,
      created_at: "2026-09-10T10:00:00Z",
    }),
  ];

  it("ordena por fecha de creacion, mas nuevo primero por defecto", () => {
    const res = filtrarFeed(items, { categoria: null, barrio: null, estado: null });
    expect(res.map((r) => r.id)).toEqual(["nuevo", "viejo"]);
  });

  it("ordena por mas antiguos cuando se pide", () => {
    const res = filtrarFeed(items, {
      categoria: null,
      barrio: null,
      estado: null,
      orden: "antiguos",
    });
    expect(res.map((r) => r.id)).toEqual(["viejo", "nuevo"]);
  });

  it("ordena por adhesiones cuando se pide", () => {
    const conAdhesiones = [
      reclamo({ id: "pocas", adhesiones_count: 1, created_at: "2026-09-05T10:00:00Z" }),
      reclamo({ id: "muchas", adhesiones_count: 9, created_at: "2026-09-01T10:00:00Z" }),
    ];
    const res = filtrarFeed(conAdhesiones, {
      categoria: null,
      barrio: null,
      estado: null,
      orden: "adhesiones",
    });
    expect(res.map((r) => r.id)).toEqual(["muchas", "pocas"]);
  });

  it("filtra por barrio", () => {
    const res = filtrarFeed(items, { categoria: null, barrio: "Palermo", estado: null });
    expect(res.map((r) => r.id)).toEqual(["nuevo"]);
  });

  it("filtra por categoria y estado combinados", () => {
    const res = filtrarFeed(items, {
      categoria: CategoriaReclamo.ALUMBRADO,
      barrio: null,
      estado: EstadoReclamo.RECIBIDO,
    });
    expect(res.map((r) => r.id)).toEqual(["viejo"]);
  });

  it("no muta el arreglo original", () => {
    const original = [...items];
    filtrarFeed(items, { categoria: null, barrio: null, estado: null });
    expect(items).toEqual(original);
  });
});
