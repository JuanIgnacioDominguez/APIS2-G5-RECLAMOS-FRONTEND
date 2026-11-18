import { CloudLightning } from "lucide-react";

import type { AlertaClimaticaOut } from "@/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OPCIONES_REFRESCO } from "@/lib/refresco";
import { useListarAlertasActivasQuery } from "@/store/citypassApi";
import { cn } from "cn";
import { formatearFenomeno, formatHasta, ordenarAlertas, resumirBarrios } from "./alertasVigentes";
import { NIVEL_ALERTA_CLASES, NIVEL_ALERTA_LABEL } from "./nivelAlerta";

function TarjetaAlerta({ alerta }: { alerta: AlertaClimaticaOut }) {
  const { visibles, restantes } = resumirBarrios(alerta.barrios);
  return (
    <li className="flex flex-col gap-1.5 rounded-xl border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-xs font-semibold",
            NIVEL_ALERTA_CLASES[alerta.nivel],
          )}
        >
          {NIVEL_ALERTA_LABEL[alerta.nivel]}
        </span>
        <span className="text-sm font-semibold">{formatearFenomeno(alerta.fenomeno)}</span>
      </div>
      <p className="text-sm text-foreground/80">
        {visibles.length > 0
          ? `${visibles.join(", ")}${restantes > 0 ? ` y ${restantes} más` : ""}`
          : "Zona definida por coordenadas"}
      </p>
      <p className="text-xs text-muted-foreground">Hasta {formatHasta(alerta.vigencia_hasta)}</p>
    </li>
  );
}

export function ListaAlertasVigentes({ alertas }: { alertas: AlertaClimaticaOut[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {ordenarAlertas(alertas).map((alerta) => (
        <TarjetaAlerta key={alerta.alerta_id} alerta={alerta} />
      ))}
    </ul>
  );
}

/**
 * Staff panel with the weather alerts in force. Like the activities panel, it
 * stays hidden while loading, on error or when there are none, so it never gets
 * in the way of the inbox. It refreshes with the rest of the screen, which is
 * how an alert shows up on its own once the event arrives.
 */
export function AlertasVigentesPanel() {
  const { data } = useListarAlertasActivasQuery(undefined, OPCIONES_REFRESCO);
  if (!data || data.length === 0) return null;
  return (
    <Card aria-label="Alertas climáticas vigentes">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CloudLightning className="size-4 text-destructive" />
          Alertas climáticas vigentes ({data.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ListaAlertasVigentes alertas={data} />
      </CardContent>
    </Card>
  );
}
