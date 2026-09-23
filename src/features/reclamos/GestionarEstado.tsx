import { useState } from "react";
import { Loader2, UserCheck } from "lucide-react";
import { toast } from "sonner";

import { cambiarEstado } from "@/api/reclamos";
import { useAuth } from "@/auth/AuthContext";
import type { CategoriaReclamo } from "@/domain/enums";
import { EstadoReclamo } from "@/domain/enums";
import { AREA_SUGERIDA, ESTADO_LABEL } from "@/domain/labels";
import { esFinal, transicionesDesde } from "@/domain/estados";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/**
 * Staff-only control to advance a claim through its state machine (US-16/17).
 * Only valid transitions are offered, so the backend never rejects the change.
 * Moving to "Asignado" also lets staff set who and which area is now
 * responsible (`CambioEstado.asignado_a`/`area_responsable`), a backend field
 * the UI previously never sent.
 */
export function GestionarEstado({
  reclamoId,
  estadoActual,
  categoria,
  asignadoActual = null,
  areaActual = null,
  onActualizado,
}: {
  reclamoId: string;
  estadoActual: EstadoReclamo;
  categoria?: CategoriaReclamo;
  asignadoActual?: string | null;
  areaActual?: string | null;
  onActualizado: () => void;
}) {
  const { usuario } = useAuth();
  const opciones = transicionesDesde(estadoActual);
  const [nuevo, setNuevo] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");
  const [asignadoA, setAsignadoA] = useState(asignadoActual ?? "");
  const [areaResponsable, setAreaResponsable] = useState(areaActual ?? "");
  const [guardando, setGuardando] = useState(false);

  if (esFinal(estadoActual) || opciones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gestion</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            El reclamo esta en un estado final; no admite mas cambios.
          </p>
        </CardContent>
      </Card>
    );
  }

  const esResolucion = nuevo === EstadoReclamo.RESUELTO;
  const esAsignacion = nuevo === EstadoReclamo.ASIGNADO;
  const areaSugerida = categoria ? AREA_SUGERIDA[categoria] : undefined;

  async function aplicar() {
    if (!nuevo) return;
    setGuardando(true);
    try {
      await cambiarEstado(reclamoId, {
        estado: nuevo as EstadoReclamo,
        motivo: motivo.trim() || null,
        resolucion: esResolucion ? motivo.trim() || null : null,
        asignado_a: esAsignacion ? asignadoA.trim() || null : null,
        area_responsable: esAsignacion ? areaResponsable.trim() || null : null,
      });
      toast.success("Estado actualizado", {
        description: `El reclamo paso a ${ESTADO_LABEL[nuevo as EstadoReclamo]}.`,
      });
      setNuevo(null);
      setMotivo("");
      onActualizado();
    } catch (err) {
      toast.error("No se pudo cambiar el estado", {
        description: err instanceof Error ? err.message : "Error inesperado",
      });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Gestion</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="gestionar-estado">Nuevo estado</Label>
          <Select value={nuevo ?? ""} onValueChange={setNuevo}>
            <SelectTrigger id="gestionar-estado" className="w-full" aria-label="Nuevo estado">
              <SelectValue placeholder="Elegi una transicion" />
            </SelectTrigger>
            <SelectContent>
              {opciones.map((e) => (
                <SelectItem key={e} value={e}>
                  {ESTADO_LABEL[e]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {esAsignacion && (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="gestionar-asignado">Asignar a</Label>
              <div className="flex gap-2">
                <Input
                  id="gestionar-asignado"
                  value={asignadoA}
                  onChange={(e) => setAsignadoA(e.target.value)}
                  placeholder="Nombre del agente o cuadrilla"
                />
                {usuario && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Asignarme este reclamo"
                    title="Asignarme"
                    onClick={() => setAsignadoA(usuario.nombre)}
                  >
                    <UserCheck className="size-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="gestionar-area">Area responsable</Label>
              <Input
                id="gestionar-area"
                value={areaResponsable}
                onChange={(e) => setAreaResponsable(e.target.value)}
                placeholder={areaSugerida ?? "Area municipal"}
              />
            </div>
          </>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="gestionar-motivo">
            {esResolucion ? "Resolucion" : "Motivo (opcional)"}
          </Label>
          <Textarea
            id="gestionar-motivo"
            placeholder={esResolucion ? "Describi como se resolvio" : "Nota para el historial"}
            rows={2}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </div>
        <Button disabled={!nuevo || guardando} onClick={aplicar}>
          {guardando && <Loader2 className="animate-spin" />}
          Aplicar cambio
        </Button>
      </CardContent>
    </Card>
  );
}
