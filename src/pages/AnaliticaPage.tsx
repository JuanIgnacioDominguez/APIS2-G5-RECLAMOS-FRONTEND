import { PageHeader } from "@/components/PageHeader";
import { TableroAnalitica } from "@/features/analitica/TableroAnalitica";

/** Admin-only page that embeds the Analytics (Group 8) dashboard of this module. */
export function AnaliticaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Analitica"
        descripcion="Indicadores del modulo e informe semanal generado por IA."
      />
      <TableroAnalitica />
    </div>
  );
}
