import { useState, type ReactNode } from "react";
import { ArrowRight, Building2, Loader2, Settings2, User, UserCheck } from "lucide-react";
import { toast } from "sonner";

import { cambiarEstado } from "@/api/reclamos";
import { useAuth } from "@/auth/AuthContext";
import type { CategoriaReclamo } from "@/domain/enums";
import { EstadoReclamo } from "@/domain/enums";
import { AREA_SUGERIDA, ESTADO_HEX, ESTADO_LABEL } from "@/domain/labels";
import { esFinal, transicionesDesde } from "@/domain/estados";
import { ICONO_ESTADO } from "./iconos";
import { EstadoBadge } from "./EstadoBadges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
/**
 * Frame around the control: a full card on its own, or a plain titled section
 * when embedded next to another panel (`embebido`).
 */
function Marco({ embebido, children }: { embebido: boolean; children: ReactNode }) {
  if (embebido) {
    return (
      <section className="flex h-full min-w-0 flex-col gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <Settings2 className="size-[18px] text-primary" />
            Gestión del reclamo
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Actualizá el estado y la asignación del reclamo.
          </p>
        </div>
        {children}
      </section>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings2 className="size-5 text-primary" />
          Gestión
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">{children}</CardContent>
    </Card>
  );
}

export function GestionarEstado({
  reclamoId,
  estadoActual,
  categoria,
  asignadoActual = null,
  areaActual = null,
  onActualizado,
  embebido = false,
}: {
  reclamoId: string;
  estadoActual: EstadoReclamo;
  categoria?: CategoriaReclamo;
  asignadoActual?: string | null;
  areaActual?: string | null;
  onActualizado: () => void;
  /** Render without the card chrome, as a section inside a shared panel. */
  embebido?: boolean;
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
      <Marco embebido={embebido}>
        <p className="text-sm text-muted-foreground">
          El reclamo está en un estado final; no admite más cambios.
        </p>
      </Marco>
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
    <Marco embebido={embebido}>
      <div className="rounded-xl border bg-muted/40 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            {nuevo ? "Transicion" : "Estado actual"}
          </span>
          <div className="flex items-center gap-1.5">
            <EstadoBadge estado={estadoActual} />
            {nuevo && (
              <>
                <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                <EstadoBadge estado={nuevo as EstadoReclamo} />
              </>
            )}
          </div>
        </div>
        <Separator className="my-2.5" />
        <dl className="grid gap-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <User className="size-3.5 shrink-0" />
              Asignado a
            </dt>
            <dd className="truncate font-medium">{asignadoActual || "Sin asignar"}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <Building2 className="size-3.5 shrink-0" />
              Área
            </dt>
            <dd className="truncate font-medium">{areaActual || "Sin definir"}</dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="gestionar-estado">Nuevo estado</Label>
        <Select value={nuevo ?? ""} onValueChange={setNuevo}>
          <SelectTrigger id="gestionar-estado" className="w-full" aria-label="Nuevo estado">
            <SelectValue placeholder="Elegí una transición" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Transición</SelectLabel>
              {opciones.map((e) => {
                const Icono = ICONO_ESTADO[e];
                return (
                  <SelectItem key={e} value={e}>
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: ESTADO_HEX[e] }}
                      />
                      <Icono className="size-4 text-muted-foreground" />
                      {ESTADO_LABEL[e]}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectGroup>
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
            <Label htmlFor="gestionar-area">Área responsable</Label>
            <Input
              id="gestionar-area"
              value={areaResponsable}
              onChange={(e) => setAreaResponsable(e.target.value)}
              placeholder={areaSugerida ?? "Área municipal"}
            />
          </div>
        </>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="gestionar-motivo">
          {esResolucion ? "Resolución" : "Motivo (opcional)"}
        </Label>
        <Textarea
          id="gestionar-motivo"
          placeholder={esResolucion ? "Describí cómo se resolvió" : "Nota para el historial"}
          rows={2}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
      </div>
      <Button
        disabled={!nuevo || guardando}
        onClick={aplicar}
        className={embebido ? "mt-auto w-full" : undefined}
      >
        {guardando && <Loader2 className="animate-spin" />}
        Aplicar cambio
      </Button>
    </Marco>
  );
}
