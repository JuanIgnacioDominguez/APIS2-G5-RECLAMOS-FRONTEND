import { CircleHelp } from "lucide-react";

import { EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import { CATEGORIA_LABEL, ESTADO_LABEL, PRIORIDAD_LABEL } from "@/domain/labels";
import { EstadoBadge, PrioridadBadge } from "@/features/reclamos/EstadoBadges";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SIGNIFICADO_ESTADO: Record<EstadoReclamo, string> = {
  RECIBIDO: "El reclamo llego y espera ser revisado.",
  EN_REVISION: "Un operador esta evaluando el caso.",
  ASIGNADO: "Se derivo a un agente o area responsable.",
  EN_PROCESO: "Se esta trabajando en la solucion.",
  RESUELTO: "El problema se soluciono; queda un plazo para confirmarlo.",
  RECHAZADO: "No corresponde tramitarlo. No admite cambios.",
  CERRADO: "Finalizado. No admite cambios.",
};

const SIGNIFICADO_PRIORIDAD: Record<PrioridadReclamo, string> = {
  BAJA: "Molestia sin riesgo, se atiende en orden.",
  MEDIA: "Afecta la vida diaria del barrio.",
  ALTA: "Requiere atencion pronta.",
  CRITICA: "Riesgo para las personas: se atiende primero.",
};

/** In-app guide: what each state and priority means, and how a claim flows. */
export function AyudaPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        icono={CircleHelp}
        titulo="Ayuda"
        descripcion="Como funciona un reclamo y que significa cada etiqueta."
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estados</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {(Object.keys(ESTADO_LABEL) as EstadoReclamo[]).map((e) => (
            <div key={e} className="flex items-center gap-4 py-2.5">
              <div className="w-32 shrink-0">
                <EstadoBadge estado={e} />
              </div>
              <p className="text-sm text-muted-foreground">{SIGNIFICADO_ESTADO[e]}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prioridades</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {(Object.keys(PRIORIDAD_LABEL) as PrioridadReclamo[]).map((p) => (
            <div key={p} className="flex items-center gap-4 py-2.5">
              <div className="w-32 shrink-0">
                <PrioridadBadge prioridad={p} />
              </div>
              <p className="text-sm text-muted-foreground">{SIGNIFICADO_PRIORIDAD[p]}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {Object.values(CATEGORIA_LABEL).join(" · ")}. Si no elegis una al cargar el reclamo, la
            sugiere el clasificador automatico y un operador puede corregirla.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
