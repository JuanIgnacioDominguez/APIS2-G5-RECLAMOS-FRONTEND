import type { ReactNode } from "react";

/**
 * Consistent page heading: the title in the display face, a dimmed one-line
 * description, and a right-aligned slot for the page's primary action. Keeps
 * every screen's top on the same rhythm.
 */
export function PageHeader({
  titulo,
  descripcion,
  accion,
}: {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-0.5">
        <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
        {descripcion && <p className="text-sm text-muted-foreground">{descripcion}</p>}
      </div>
      {accion}
    </div>
  );
}
