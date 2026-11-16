import { useLento } from "@/hooks/useLento";

export const MENSAJE_SERVIDOR_LENTO =
  "El servidor está despertando; la primera carga puede tardar hasta un minuto. No cierres la página.";

/** Explains a long wait. Renders nothing until the request has been pending a few seconds. */
export function AvisoServidorLento({ activo }: { activo: boolean }) {
  const lento = useLento(activo);
  if (!lento) return null;
  return (
    <p role="status" className="text-center text-xs text-muted-foreground">
      {MENSAJE_SERVIDOR_LENTO}
    </p>
  );
}
