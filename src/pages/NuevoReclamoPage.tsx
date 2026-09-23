import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { crearReclamo } from "@/api/reclamos";
import type { ReclamoCrear } from "@/api/types";
import { ReclamoForm } from "@/features/reclamos/ReclamoForm";

export function NuevoReclamoPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(datos: ReclamoCrear) {
    setLoading(true);
    try {
      const reclamo = await crearReclamo(datos);
      toast.success("Reclamo creado", { description: "Ya podes seguir su estado." });
      navigate(`/reclamos/${reclamo.id}`);
    } catch (err) {
      toast.error("No se pudo crear el reclamo", {
        description: err instanceof Error ? err.message : "Error inesperado",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 pantalla-sin-scroll">
      <div>
        <h2 className="text-xl font-semibold">Nuevo reclamo</h2>
        <p className="text-muted-foreground">
          Si no elegis categoria y prioridad, las sugiere el clasificador automatico.
        </p>
      </div>

      <ReclamoForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
