import { useState } from "react";
import { Tags, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { reclasificar } from "@/api/reclamos";
import type { CategoriaReclamo, PrioridadReclamo } from "@/domain/enums";
import { opcionesCategoria, opcionesPrioridad } from "@/domain/labels";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Staff-only control to correct a claim's category and priority (US-14), via
 * `PATCH /reclamos/{id}/clasificacion`. Does not change the claim's state.
 */
export function ClasificarReclamo({
  reclamoId,
  categoriaActual,
  prioridadActual,
  onActualizado,
}: {
  reclamoId: string;
  categoriaActual: CategoriaReclamo;
  prioridadActual: PrioridadReclamo;
  onActualizado: () => void;
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Tags className="size-5 text-primary" />
          Clasificacion
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="clasificar-categoria">Categoria</Label>
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger id="clasificar-categoria" className="w-full" aria-label="Categoria">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {opcionesCategoria().map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
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
              {opcionesPrioridad().map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button disabled={sinCambios || guardando} onClick={aplicar}>
          {guardando && <Loader2 className="animate-spin" />}
          Guardar clasificacion
        </Button>
      </CardContent>
    </Card>
  );
}
