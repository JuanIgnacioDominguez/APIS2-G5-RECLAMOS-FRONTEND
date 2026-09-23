import { Bell } from "lucide-react";

import { EstadoVacio } from "@/components/EstadoVacio";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";

/** Placeholder until the backend exposes a notifications feed. */
export function NotificacionesPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        icono={Bell}
        titulo="Notificaciones"
        descripcion="Avisos sobre el avance de tus reclamos."
      />
      <Card>
        <EstadoVacio
          icono={Bell}
          titulo="Sin novedades"
          mensaje="Cuando un reclamo cambie de estado o reciba una respuesta oficial, lo vas a ver aca."
        />
      </Card>
    </div>
  );
}
