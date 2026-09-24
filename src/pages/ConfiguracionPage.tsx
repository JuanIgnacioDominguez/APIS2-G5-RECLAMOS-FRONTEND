import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { establecerTema, suscribirTema, temaActual, temaServidor, type Tema } from "@/lib/tema";

/** Local preferences. Only the theme exists today; it is stored in the browser. */
export function ConfiguracionPage() {
  const tema = useSyncExternalStore(suscribirTema, temaActual, temaServidor);

  function elegir(nuevo: Tema) {
    if (nuevo !== tema) establecerTema(nuevo);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        titulo="Configuracion"
        descripcion="Preferencias de esta aplicacion en tu navegador."
      />
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-medium">Apariencia</p>
            <p className="text-sm text-muted-foreground">Elegi el tema claro u oscuro.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={tema === "light" ? "default" : "outline"}
              onClick={() => elegir("light")}
            >
              <Sun />
              Claro
            </Button>
            <Button
              variant={tema === "dark" ? "default" : "outline"}
              onClick={() => elegir("dark")}
            >
              <Moon />
              Oscuro
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
