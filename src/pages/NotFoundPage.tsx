import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

/** 404 page for unknown routes. */
export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex max-w-[420px] flex-col items-center gap-2 text-center">
        <span className="text-8xl leading-none font-extrabold tracking-tight text-primary">
          404
        </span>
        <h3 className="text-xl font-semibold">No encontramos esta pagina</h3>
        <p className="text-muted-foreground">
          La direccion no existe o el reclamo que buscabas ya no esta disponible.
        </p>
        <div className="mt-4 flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" />
            Volver
          </Button>
          <Button onClick={() => navigate("/")}>
            <Home className="size-4" />
            Ir al inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
