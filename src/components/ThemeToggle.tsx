import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { alternarTema, suscribirTema, temaActual, temaServidor } from "@/lib/tema";

/** Header button that flips between light and dark. */
export function ThemeToggle() {
  const tema = useSyncExternalStore(suscribirTema, temaActual, temaServidor);
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={alternarTema}
      aria-label={tema === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
    >
      {tema === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
