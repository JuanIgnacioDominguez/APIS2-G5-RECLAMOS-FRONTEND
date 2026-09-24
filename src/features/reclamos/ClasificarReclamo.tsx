import { useState, type ReactNode } from "react";
import { Tags, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { reclasificar } from "@/api/reclamos";
import type { CategoriaReclamo, PrioridadReclamo } from "@/domain/enums";
import {
  CATEGORIA_HEX,
  PRIORIDAD_HEX,
  opcionesCategoria,
  opcionesPrioridad,
} from "@/domain/labels";
import { ICONO_CATEGORIA, ICONO_PRIORIDAD } from "./iconos";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Staff-only control to correct a claim's category and priority (US-14), via
 * `PATCH /reclamos/{id}/clasificacion`. Does not change the claim's state.
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
            <Tags className="size-[18px] text-primary" />
            Clasificación
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Definí la categoría y prioridad del reclamo.
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
          <Tags className="size-5 text-primary" />
          Clasificación
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">{children}</CardContent>
    </Card>
  );
}

export function ClasificarReclamo({
  reclamoId,
  categoriaActual,
  prioridadActual,
  onActualizado,
  embebido = false,
}: {
  reclamoId: string;
  categoriaActual: CategoriaReclamo;
  prioridadActual: PrioridadReclamo;
  onActualizado: () => void;
  /** Render without the card chrome, as a section inside a shared panel. */
  embebido?: boolean;
}) {
  const [categoria, setCategoria] = useState<string>(categoriaActual);
  const [prioridad, setPrioridad] = useState<string>(prioridadActual);
  const [guardando, setGuardando] = useState(false);

  const sinCambios = categoria === categoriaActual && prioridad === prioridadActual;

  async function aplicar() {
    setGuardando(true);
    try {
      await reclasificar(reclamoId, {
        categoria: categoria as CategoriaReclamo,
        prioridad: prioridad as PrioridadReclamo,
      });
      toast.success("Reclamo clasificado", {
        description: "Se actualizo la categoria y/o prioridad.",
      });
      onActualizado();
    } catch (err) {
      toast.error("No se pudo clasificar", {
        description: err instanceof Error ? err.message : "Error inesperado",
      });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Marco embebido={embebido}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="clasificar-categoria">Categoría</Label>
        <Select value={categoria} onValueChange={setCategoria}>
          <SelectTrigger id="clasificar-categoria" className="w-full" aria-label="Categoría">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Categoría</SelectLabel>
              {opcionesCategoria().map((o) => {
                const Icono = ICONO_CATEGORIA[o.value as CategoriaReclamo];
                return (
                  <SelectItem key={o.value} value={o.value}>
                    <span className="flex items-center gap-2">
                      <Icono
                        className="size-4"
                        style={{ color: CATEGORIA_HEX[o.value as CategoriaReclamo] }}
                      />
                      {o.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="clasificar-prioridad">Prioridad</Label>
        <Select value={prioridad} onValueChange={setPrioridad}>
          <SelectTrigger id="clasificar-prioridad" className="w-full" aria-label="Prioridad">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Prioridad</SelectLabel>
              {opcionesPrioridad().map((o) => {
                const Icono = ICONO_PRIORIDAD[o.value as PrioridadReclamo];
                return (
                  <SelectItem key={o.value} value={o.value}>
                    <span className="flex items-center gap-2">
                      <Icono
                        className="size-4"
                        style={{ color: PRIORIDAD_HEX[o.value as PrioridadReclamo] }}
                      />
                      {o.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Button
        disabled={sinCambios || guardando}
        onClick={aplicar}
        className={embebido ? "mt-auto w-full" : undefined}
      >
        {guardando && <Loader2 className="animate-spin" />}
        Guardar clasificación
      </Button>
    </Marco>
  );
}
