import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { useCrearReclamoMutation } from "@/store/citypassApi";
import type { ReclamoCrear, ReclamoSimilar } from "@/api/types";
import { ReclamoForm } from "@/features/reclamos/ReclamoForm";
import { ReclamosSimilaresDialog } from "@/features/reclamos/ReclamosSimilares";
import { PageHeader } from "@/components/PageHeader";
import { useAdherirMutation, useBuscarSimilaresMutation } from "@/store/citypassApi";

export function NuevoReclamoPage() {
  const navigate = useNavigate();
  const [crearReclamo] = useCrearReclamoMutation();
  const [loading, setLoading] = useState(false);
  const [similares, setSimilares] = useState<ReclamoSimilar[]>([]);
  const [pendiente, setPendiente] = useState<ReclamoCrear | null>(null);
  const [buscarSimilaresMutation] = useBuscarSimilaresMutation();
  const [adherirMutation] = useAdherirMutation();

  async function crear(datos: ReclamoCrear) {
    setLoading(true);
    try {
      const reclamo = await crearReclamo(datos).unwrap();
      toast.success("Reclamo creado", { description: "Ya podés seguir su estado." });
      navigate(`/reclamos/${reclamo.id}`);
    } catch (err) {
      toast.error("No se pudo crear el reclamo", {
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Error inesperado",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(datos: ReclamoCrear) {
    setLoading(true);
    let parecidos: ReclamoSimilar[] = [];
    try {
      parecidos = await buscarSimilaresMutation({
        titulo: datos.titulo,
        descripcion: datos.descripcion,
        categoria: datos.categoria,
        latitud: datos.latitud,
        longitud: datos.longitud,
        barrio: datos.barrio,
      }).unwrap();
    } catch {
      parecidos = [];
    }

    if (parecidos.length === 0) {
      await crear(datos);
      return;
    }

    setSimilares(parecidos);
    setPendiente(datos);
    setLoading(false);
  }

  async function sumarme(id: string) {
    setLoading(true);
    try {
      const res = await adherirMutation(id).unwrap();
      toast.success("Te sumaste al reclamo", {
        description: `Ya son ${res.adhesiones_count} vecinos.`,
      });
      setSimilares([]);
      setPendiente(null);
      navigate(`/reclamos/${id}`);
    } catch (err) {
      const desc =
        err && typeof err === "object" && "message" in err && typeof err.message === "string"
          ? err.message
          : "Error inesperado";
      toast.error("No se pudo adherir", { description: desc });
      setLoading(false);
    }
  }

  function cargarIgual() {
    if (!pendiente) return;
    const datos = pendiente;
    setSimilares([]);
    setPendiente(null);
    void crear(datos);
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <PageHeader
        titulo="Nuevo reclamo"
        descripcion="Contanos qué pasa y ayudanos a encontrarlo más rápido."
      />

      <ReclamoForm onSubmit={handleSubmit} loading={loading} />

      <ReclamosSimilaresDialog
        open={similares.length > 0}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setSimilares([]);
            setPendiente(null);
          }
        }}
        similares={similares}
        onSumarme={sumarme}
        onCargarIgual={cargarIgual}
        procesando={loading}
      />
    </div>
  );
}
