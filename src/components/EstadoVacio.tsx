import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Composed empty state: a soft brand-tinted icon, a title and a hint, plus an
 * optional action. Shares the visual language of {@link EstadoError} so loading,
 * error and empty results all feel like one system.
 */
export function EstadoVacio({
  icono: Icono,
  titulo,
  mensaje,
  children,
}: {
  icono: LucideIcon;
  titulo: string;
  mensaje?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex justify-center py-12">
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icono className="size-7" />
        </span>
        <p className="text-lg font-semibold">{titulo}</p>
        {mensaje && <p className="text-sm text-muted-foreground">{mensaje}</p>}
        {children}
      </div>
    </div>
  );
}
