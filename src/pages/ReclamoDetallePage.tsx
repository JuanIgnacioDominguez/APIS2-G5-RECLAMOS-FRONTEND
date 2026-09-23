import { useState } from "react";
import { Clock, Loader2, MapPin, Sparkles, Users, Zap } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "react-router-dom";

import { adherir, obtenerReclamo } from "@/api/reclamos";
import { CanalOrigen, OrigenClasificacion } from "@/domain/enums";
import { CATEGORIA_LABEL, COLOR_HEX, ESTADO_LABEL, PRIORIDAD_LABEL } from "@/domain/labels";
import { formatConfianza, formatFecha } from "@/lib/format";
import { useAsync } from "@/hooks/useAsync";
import { EstadoError } from "@/components/EstadoError";
import { useAuth } from "@/auth/AuthContext";
import { esStaff } from "@/auth/roles";
import { CategoriaBadge, EstadoBadge, PrioridadBadge } from "@/features/reclamos/EstadoBadges";
import { GestionarEstado } from "@/features/reclamos/GestionarEstado";
import { ClasificarReclamo } from "@/features/reclamos/ClasificarReclamo";
import { ComentariosReclamo } from "@/features/reclamos/ComentariosReclamo";
import { MapaUbicacion } from "@/features/mapa/MapaUbicacion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function DatoFila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-sm text-muted-foreground">{etiqueta}</span>
      <span className="text-right text-sm font-medium">{valor}</span>
    </div>
  );
}

export function ReclamoDetallePage() {
  const { id = "" } = useParams();
  const { usuario } = useAuth();
  const { data: reclamo, loading, error, reload } = useAsync(() => obtenerReclamo(id), [id]);
  const [adhiriendo, setAdhiriendo] = useState(false);
  const [adhesiones, setAdhesiones] = useState<number | null>(null);
  const staff = usuario ? esStaff(usuario.rol) : false;

  async function handleAdherir() {
    setAdhiriendo(true);
    try {
      const res = await adherir(id);
      setAdhesiones(res.adhesiones_count);
      toast.success("Adhesion registrada", {
        description: "Gracias por sumarte a este reclamo.",
      });
    } catch (err) {
      toast.error("No se pudo adherir", {
        description: err instanceof Error ? err.message : "Error inesperado",
      });
    } finally {
      setAdhiriendo(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !reclamo) {
    return <EstadoError mensaje={error ?? "Reclamo no encontrado"} onReintentar={reload} />;
  }

  const totalAdhesiones = adhesiones ?? reclamo.adhesiones_count;
  // A citizen cannot adhere to their own claim.
  const esPropio = usuario?.id === reclamo.ciudadano_id;
  const tieneUbicacion = reclamo.latitud !== null && reclamo.longitud !== null;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{reclamo.titulo}</h1>
          <p className="text-sm text-muted-foreground">{formatFecha(reclamo.created_at)}</p>
        </div>
        <EstadoBadge estado={reclamo.estado} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <CategoriaBadge categoria={reclamo.categoria} />
        <PrioridadBadge prioridad={reclamo.prioridad} />
        {!staff && (
          <Badge
            variant="outline"
            className="border-transparent font-medium"
            style={{
              backgroundColor: `color-mix(in oklab, ${esPropio ? COLOR_HEX.verdeUrbano : COLOR_HEX.azulNoche} 12%, transparent)`,
              color: esPropio ? COLOR_HEX.verdeUrbano : COLOR_HEX.azulNoche,
            }}
          >
            {esPropio ? "Mi reclamo" : "Reclamo de la ciudad"}
          </Badge>
        )}
        {reclamo.origen_clasificacion !== OrigenClasificacion.CIUDADANO &&
          reclamo.confianza_clasificacion !== null && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="gap-1 border-transparent font-medium"
                  style={{
                    backgroundColor: "color-mix(in oklab, var(--chart-1) 12%, transparent)",
                    color: "var(--chart-1)",
                  }}
                >
                  <Sparkles className="size-3" />
                  {formatConfianza(reclamo.confianza_clasificacion)} de confianza
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {reclamo.origen_clasificacion === OrigenClasificacion.MODELO
                  ? "Categoria y prioridad sugeridas por el clasificador automatico."
                  : "Categoria y/o prioridad corregidas por un operador."}
              </TooltipContent>
            </Tooltip>
          )}
        {reclamo.canal === CanalOrigen.EVENTO && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="gap-1 border-dashed text-muted-foreground">
                <Zap className="size-3" />
                Generado automaticamente
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              Este reclamo lo abrio el sistema a partir de un evento de otro modulo (Residuos o
              Emergencias), no un vecino.
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Descripcion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed">{reclamo.descripcion}</p>
              {reclamo.direccion && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-4" />
                  <span>
                    {reclamo.direccion}
                    {reclamo.barrio ? `, ${reclamo.barrio}` : ""}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {tieneUbicacion && (
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="size-4 text-primary" />
                  Ubicacion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MapaUbicacion latitud={reclamo.latitud!} longitud={reclamo.longitud!} />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
              <div className="flex items-center gap-2">
                <Users className="size-5 text-primary" />
                <span className="font-medium">
                  {totalAdhesiones}{" "}
                  {totalAdhesiones === 1 ? "vecino adherido" : "vecinos adheridos"}
                </span>
              </div>
              {esPropio ? (
                <span className="text-sm text-muted-foreground">Es tu reclamo</span>
              ) : (
                <Button onClick={handleAdherir} disabled={adhiriendo} className="gap-2">
                  {adhiriendo ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Users className="size-4" />
                  )}
                  A mi tambien me pasa
                </Button>
              )}
            </CardContent>
          </Card>

          <ComentariosReclamo
            reclamoId={reclamo.id}
            comentarios={reclamo.comentarios}
            onComentado={reload}
          />
        </div>

        <div className="flex flex-col gap-6">
          {staff && (
            <>
              <GestionarEstado
                reclamoId={reclamo.id}
                estadoActual={reclamo.estado}
                categoria={reclamo.categoria}
                asignadoActual={reclamo.asignado_a}
                areaActual={reclamo.area_responsable}
                onActualizado={reload}
              />
              <ClasificarReclamo
                reclamoId={reclamo.id}
                categoriaActual={reclamo.categoria}
                prioridadActual={reclamo.prioridad}
                onActualizado={reload}
              />
            </>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <DatoFila etiqueta="Categoria" valor={CATEGORIA_LABEL[reclamo.categoria]} />
              <DatoFila etiqueta="Prioridad" valor={PRIORIDAD_LABEL[reclamo.prioridad]} />
              <DatoFila etiqueta="Estado" valor={ESTADO_LABEL[reclamo.estado]} />
              <DatoFila etiqueta="Barrio" valor={reclamo.barrio ?? "-"} />
              {reclamo.asignado_a && <DatoFila etiqueta="Asignado a" valor={reclamo.asignado_a} />}
              {reclamo.area_responsable && (
                <DatoFila etiqueta="Area responsable" valor={reclamo.area_responsable} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trazabilidad</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-4 border-l border-border pl-6">
                {reclamo.historial.map((h) => (
                  <li key={h.id} className="relative">
                    <span className="absolute -left-[27px] flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Clock className="size-2.5" />
                    </span>
                    <p className="text-sm font-medium leading-none">
                      {ESTADO_LABEL[h.estado_nuevo]}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatFecha(h.created_at)}
                    </p>
                    {h.motivo && <p className="mt-1 text-sm">{h.motivo}</p>}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
