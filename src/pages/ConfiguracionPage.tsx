import { useSyncExternalStore } from "react";
import { HelpCircle, Moon, Palette, Settings2, ShieldCheck, Sun } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ayudaActiva,
  establecerAyudaActiva,
  notificarCambioAyuda,
  suscribirAyuda,
} from "@/lib/ayudaGuiada";
import { establecerTema, suscribirTema, temaActual, temaServidor, type Tema } from "@/lib/tema";

export function ConfiguracionPage() {
  const tema = useSyncExternalStore(suscribirTema, temaActual, temaServidor);
  const ayuda = useSyncExternalStore(
    suscribirAyuda,
    () => ayudaActiva(),
    () => true,
  );

  function elegir(nuevo: Tema): void {
    if (nuevo !== tema) establecerTema(nuevo);
  }

  function cambiarAyuda(activa: boolean): void {
    establecerAyudaActiva(activa);
    notificarCambioAyuda();
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        titulo="Configuración"
        descripcion="Preferencias de esta aplicación en tu navegador."
        accion={<Badge variant="secondary">Preferencias locales</Badge>}
      />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card data-tour="config-apariencia" className="overflow-hidden">
            <CardHeader className="flex-row items-start justify-between gap-4 border-b">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-chart-1/10 text-chart-1">
                  <Palette className="size-5" />
                </span>
                <div>
                  <CardTitle>Apariencia</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Elegí cómo se ve CityPass+ en este dispositivo.
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="hidden sm:inline-flex">
                Visual
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-3 pt-4 sm:grid-cols-2">
              <Button
                type="button"
                variant={tema === "light" ? "default" : "outline"}
                aria-pressed={tema === "light"}
                onClick={() => elegir("light")}
                className="h-auto min-h-20 justify-start gap-3 p-4 text-left"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-background/70 text-foreground">
                  <Sun className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold">Claro</span>
                  <span className="mt-0.5 block text-xs font-normal opacity-75">
                    Luminoso durante el día
                  </span>
                </span>
              </Button>
              <Button
                type="button"
                variant={tema === "dark" ? "default" : "outline"}
                aria-pressed={tema === "dark"}
                onClick={() => elegir("dark")}
                className="h-auto min-h-20 justify-start gap-3 p-4 text-left"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-background/10 text-foreground">
                  <Moon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold">Oscuro</span>
                  <span className="mt-0.5 block text-xs font-normal opacity-75">
                    Cómodo de noche
                  </span>
                </span>
              </Button>
            </CardContent>
          </Card>

          <Card data-tour="config-ayuda" className="overflow-hidden">
            <CardHeader className="flex-row items-start justify-between gap-4 border-b">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-chart-3/15 text-chart-3">
                  <HelpCircle className="size-5" />
                </span>
                <div>
                  <CardTitle>Ayuda guiada</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Activá el recorrido que te muestra cómo usar cada pantalla.
                  </p>
                </div>
              </div>
              <Badge variant={ayuda ? "default" : "outline"} className="hidden sm:inline-flex">
                {ayuda ? "Activa" : "Pausada"}
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-3 pt-4 sm:grid-cols-2">
              <Button
                type="button"
                variant={ayuda ? "default" : "outline"}
                aria-label="Activada"
                aria-pressed={ayuda}
                onClick={() => cambiarAyuda(true)}
                className="h-auto min-h-16 justify-start gap-3 p-4 text-left"
              >
                <span className="grid size-9 place-items-center rounded-lg bg-background/15">
                  <HelpCircle className="size-4" />
                </span>
                <span>
                  <span className="block font-semibold">Activada</span>
                  <span className="mt-0.5 block text-xs font-normal opacity-75">
                    Mostrar el botón flotante
                  </span>
                </span>
              </Button>
              <Button
                type="button"
                variant={!ayuda ? "default" : "outline"}
                aria-label="Desactivada"
                aria-pressed={!ayuda}
                onClick={() => cambiarAyuda(false)}
                className="h-auto min-h-16 justify-start gap-3 p-4 text-left"
              >
                <span className="grid size-9 place-items-center rounded-lg bg-background/10">
                  <HelpCircle className="size-4" />
                </span>
                <span>
                  <span className="block font-semibold">Desactivada</span>
                  <span className="mt-0.5 block text-xs font-normal opacity-75">
                    Ocultar el recorrido
                  </span>
                </span>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit bg-muted/30">
          <CardContent className="flex flex-col gap-4">
            <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <Settings2 className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold">Solo en este navegador</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                La apariencia y la ayuda guiada se guardan localmente. No modifican tu cuenta ni se
                envían al servidor.
              </p>
            </div>
            <div className="flex items-start gap-2 rounded-xl bg-card/70 p-3 text-xs leading-5 text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-chart-2" />
              Tus preferencias viajan con este dispositivo y podés cambiarlas cuando quieras.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
