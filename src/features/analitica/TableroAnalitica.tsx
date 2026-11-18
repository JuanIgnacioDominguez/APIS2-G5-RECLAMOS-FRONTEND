import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { obtenerTableroAnalitica } from "@/api/analitica";
import { getAuthToken } from "@/api/client";
import { EstadoError } from "@/components/EstadoError";

const ALTURA_INICIAL = 1200;
const TIPO_ALTURA = "citypass-tablero-altura";

type Estado =
  { fase: "cargando" } | { fase: "listo"; html: string } | { fase: "error"; mensaje: string };

/**
 * Shows Group 8's dashboard in a sandboxed iframe. `srcdoc` is required because
 * an iframe `src` cannot send the Authorization header; the sandbox omits
 * `allow-same-origin` so the dashboard cannot reach our storage or DOM.
 */
export function TableroAnalitica() {
  const [estado, setEstado] = useState<Estado>({ fase: "cargando" });
  const [altura, setAltura] = useState(ALTURA_INICIAL);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const cargar = useCallback((signal?: AbortSignal) => {
    const token = getAuthToken();
    if (!token) {
      setEstado({ fase: "error", mensaje: "No hay una sesion activa." });
      return;
    }
    setEstado({ fase: "cargando" });
    obtenerTableroAnalitica(token, signal)
      .then((html) => setEstado({ fase: "listo", html }))
      .catch((error: unknown) => {
        if (signal?.aborted) return;
        setEstado({
          fase: "error",
          mensaje: error instanceof Error ? error.message : "Analitica no esta disponible.",
        });
      });
  }, []);

  useEffect(() => {
    const controlador = new AbortController();
    cargar(controlador.signal);
    return () => controlador.abort();
  }, [cargar]);

  useEffect(() => {
    function alRecibir(evento: MessageEvent) {
      const datos = evento.data as { tipo?: unknown; altura?: unknown } | null;
      if (evento.source !== iframeRef.current?.contentWindow) return;
      if (datos?.tipo === TIPO_ALTURA && typeof datos.altura === "number" && datos.altura > 0) {
        setAltura(Math.ceil(datos.altura));
      }
    }
    window.addEventListener("message", alRecibir);
    return () => window.removeEventListener("message", alRecibir);
  }, []);

  if (estado.fase === "cargando") {
    return (
      <div className="flex justify-center py-16" role="status" aria-label="Cargando tablero">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (estado.fase === "error") {
    return (
      <EstadoError
        titulo="Analitica no disponible"
        mensaje={estado.mensaje}
        onReintentar={() => cargar()}
      />
    );
  }

  return (
    <iframe
      ref={iframeRef}
      title="Tablero de Analitica"
      sandbox="allow-scripts"
      srcDoc={estado.html}
      className="w-full rounded-lg border-0 bg-card"
      style={{ height: altura }}
    />
  );
}
