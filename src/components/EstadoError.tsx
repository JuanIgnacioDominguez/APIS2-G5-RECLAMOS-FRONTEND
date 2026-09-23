import { RefreshCw, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Friendly error state with an explanation and a retry action, used wherever a
 * fetch can fail. Replaces the bare red alert with something recoverable.
 */
export function EstadoError({
  titulo = "No se pudo cargar",
  mensaje,
  onReintentar,
}: {
  titulo?: string;
  mensaje?: string | null;
  onReintentar?: () => void;
}) {
  return (
    <div className="flex justify-center py-12">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <WifiOff className="size-10 text-destructive/80" strokeWidth={1.5} />
        <p className="text-lg font-semibold">{titulo}</p>
        <p className="text-sm text-muted-foreground">
          {mensaje ?? "Revisa tu conexion o que el servicio este disponible e intenta de nuevo."}
        </p>
        {onReintentar && (
          <Button variant="outline" onClick={onReintentar} className="mt-1 gap-2">
            <RefreshCw className="size-4" />
            Reintentar
          </Button>
        )}
      </div>
    </div>
  );
}
