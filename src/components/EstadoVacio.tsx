import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

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
        <Icono className="size-10 text-primary/70" strokeWidth={1.5} />
        <p className="text-lg font-semibold">{titulo}</p>
        {mensaje && <p className="text-sm text-muted-foreground">{mensaje}</p>}
        {children}
      </div>
    </div>
  );
}
