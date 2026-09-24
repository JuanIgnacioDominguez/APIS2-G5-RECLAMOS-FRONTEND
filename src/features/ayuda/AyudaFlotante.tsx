import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import { driver } from "driver.js";
import type { DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ayudaActiva, suscribirAyuda } from "@/lib/ayudaGuiada";
import { pasosParaRuta, type PasoTour } from "./tours";

const TITULO_POPOVER = (t: string) =>
  `<span style="font-weight:600;color:var(--foreground)">${t}</span>`;

/** Turn our internal steps into driver.js steps, dropping ones whose anchor is
 * not in the DOM. Centred (selector: null) steps stay. */
function aDriveSteps(pasos: PasoTour[]): DriveStep[] {
  const validos = pasos.filter((p) => p.selector === null || document.querySelector(p.selector));
  return validos.map<DriveStep>((paso) => ({
    element: paso.selector ?? undefined,
    // Skip silently if the anchor disappears between building the tour and
    // reaching the step (route changes, async content, feature flags).
    skipMissingElement: true,
    popover: {
      title: TITULO_POPOVER(paso.titulo),
      description: paso.descripcion,
      side: paso.lado,
      align: "start",
    },
  }));
}

/**
 * Floating help button, pinned bottom-right. On click, launches a guided tour
 * (driver.js) explaining every section of the current screen. Hides itself when
 * the user turns the feature off in Configuración, or when the current route
 * has no tour defined.
 */
export function AyudaFlotante() {
  const { pathname } = useLocation();
  const { usuario } = useAuth();
  const activa = useSyncExternalStore(
    suscribirAyuda,
    () => ayudaActiva(),
    () => true,
  );
  const [driverActivo, setDriverActivo] = useState(false);

  const pasos = useMemo(
    () => pasosParaRuta(pathname, usuario?.rol ?? null),
    [pathname, usuario?.rol],
  );

  const abrirTour = useCallback(() => {
    if (!pasos) return;
    const steps = aDriveSteps(pasos);
    if (steps.length === 0) return;

    const driverObj = driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.55,
      stagePadding: 6,
      stageRadius: 8,
      progressText: "{{current}} de {{total}}",
      nextBtnText: "Siguiente →",
      prevBtnText: "← Anterior",
      doneBtnText: "Listo",
      steps,
      onDestroyStarted: () => {
        driverObj.destroy();
      },
      onDestroyed: () => setDriverActivo(false),
    });

    setDriverActivo(true);
    driverObj.drive();
  }, [pasos]);

  // Close the tour if the route changes while it is open, to avoid orphan
  // highlights over content that no longer exists.
  useEffect(() => {
    setDriverActivo(false);
  }, [pathname]);

  if (!activa || !pasos) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          data-tour="ayuda-fab"
          aria-label="Iniciar recorrido guiado de esta pantalla"
          onClick={abrirTour}
          disabled={driverActivo}
          className="fixed right-5 bottom-5 z-40 size-12 rounded-full bg-primary p-0 text-primary-foreground shadow-lg ring-1 ring-primary/30 transition-transform hover:scale-105 hover:bg-primary hover:shadow-xl focus-visible:scale-105"
        >
          <HelpCircle className="size-6" strokeWidth={2.25} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">Recorrido guiado de la pantalla</TooltipContent>
    </Tooltip>
  );
}
