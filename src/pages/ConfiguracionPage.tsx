import { useSyncExternalStore } from "react";
import { HelpCircle, Moon, Sun } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ayudaActiva,
  establecerAyudaActiva,
  notificarCambioAyuda,
  suscribirAyuda,
} from "@/lib/ayudaGuiada";
import { establecerTema, suscribirTema, temaActual, temaServidor, type Tema } from "@/lib/tema";

/** Local preferences. Only the theme exists today; it is stored in the browser. */
export function ConfiguracionPage() {
  const tema = useSyncExternalStore(suscribirTema, temaActual, temaServidor);
  const ayuda = useSyncExternalStore(
    suscribirAyuda,
    () => ayudaActiva(),
    () => true,
  );

  function elegir(nuevo: Tema) {
    if (nuevo !== tema) establecerTema(nuevo);
  }

  function cambiarAyuda(activa: boolean) {
    establecerAyudaActiva(activa);
    // Notify subscribers in this tab so the floating button appears/disappears
    // right away, without waiting for a page reload.
    notificarCambioAyuda();
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        titulo="Configuracion"
        descripcion="Preferencias de esta aplicacion en tu navegador."
      />
      <Card data-tour="config-apariencia">
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

      <Card data-tour="config-ayuda">
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <HelpCircle className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium">Ayuda guiada</p>
              <p className="text-sm text-muted-foreground">
                Muestra el boton flotante que abre un recorrido por cada pantalla.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant={ayuda ? "default" : "outline"} onClick={() => cambiarAyuda(true)}>
              Activada
            </Button>
            <Button variant={!ayuda ? "default" : "outline"} onClick={() => cambiarAyuda(false)}>
              Desactivada
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
