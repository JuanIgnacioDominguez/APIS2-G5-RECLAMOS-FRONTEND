import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";

import type { ActividadOut } from "@/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHorarioActividad } from "@/lib/format";
import { useListarActividadesQuery } from "@/store/citypassApi";
import { cn } from "cn";
import { etiquetaEstadoActividad, rutaReclamosDeActividad } from "./actividades";

function enCurso(actividad: ActividadOut, ahora: Date): boolean {
  return (
    !etiquetaEstadoActividad(actividad.estado) &&
    new Date(actividad.inicio) <= ahora &&
    ahora <= new Date(actividad.fin)
  );
}

function Etiqueta({ texto, tono }: { texto: string; tono: "aviso" | "ok" }) {
  return (
    <span
      className={cn(
        "rounded-md px-1.5 py-0.5 text-xs font-semibold",
        tono === "aviso" ? "bg-warning/15 text-warning" : "bg-success/15 text-success",
      )}
    >
      {texto}
    </span>
  );
}

export function ListaActividades({
  actividades,
  ahora = new Date(),
}: {
  actividades: ActividadOut[];
  ahora?: Date;
}) {
  return (
    <ul className="divide-y">
      {actividades.map((actividad) => {
        const estado = etiquetaEstadoActividad(actividad.estado);
        const lugar = actividad.espacio_nombre ?? actividad.direccion;
        return (
          <li
            key={actividad.id}
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5"
          >
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                {actividad.titulo}
                {estado && <Etiqueta texto={estado} tono="aviso" />}
                {enCurso(actividad, ahora) && <Etiqueta texto="En curso" tono="ok" />}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatHorarioActividad(actividad.inicio, actividad.fin)}
                {lugar ? ` · ${lugar}` : ""}
              </p>
            </div>
            <Link
              to={rutaReclamosDeActividad(actividad.id)}
              className="shrink-0 text-sm font-medium text-primary underline-offset-2 hover:underline"
            >
              {actividad.reclamos_relacionados === 1
                ? "1 reclamo relacionado"
                : `${actividad.reclamos_relacionados} reclamos relacionados`}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Staff panel with the mass activities that still relate claims. It stays
 * hidden while loading, on error or when there are none, so it never gets in
 * the way of the inbox.
 */
export function ActividadesPanel() {
  const { data } = useListarActividadesQuery(undefined);
  if (!data || data.length === 0) return null;
  return (
    <Card data-tour="bandeja-actividades">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="size-4 text-primary" />
          Actividades masivas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ListaActividades actividades={data} />
      </CardContent>
    </Card>
  );
}
