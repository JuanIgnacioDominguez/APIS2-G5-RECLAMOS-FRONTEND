import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Consistent page heading: an optional identity icon, the title in the display
 * face, a dimmed one-line description, and a right-aligned slot for the page's
 * primary action. Keeps every screen's top on the same rhythm.
 */
export function PageHeader({
  icono: Icono,
  titulo,
  descripcion,
  accion,
}: {
  icono?: LucideIcon;
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-3">
        {Icono && (
          <span className="hidden size-11 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
            <Icono className="size-6" />
          </span>
        )}
        <div className="space-y-0.5">
          <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
          {descripcion && <p className="text-sm text-muted-foreground">{descripcion}</p>}
        </div>
      </div>
      {accion}
    </div>
  );
}
