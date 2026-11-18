import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  RUTA_ANALITICA,
  iniciarSesionAnalitica,
  revocarSesionAnalitica,
  type SesionAnalitica,
} from "@/api/analitica";
import { getAuthToken } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
import { EstadoError } from "@/components/EstadoError";

const ALTURA_INICIAL = 1200;
const TIPO_ALTURA = "citypass-tablero-altura";
const ORIGEN_SANDBOX = "null";

type Estado =
  | { fase: "cargando" }
  | { fase: "listo" }
  | { fase: "vencida" }
  | { fase: "error"; mensaje: string };

/**
 * Shows Group 8's dashboard in a sandboxed iframe that navigates to our own
 * backend (same origin through the hosting proxy). The sandbox omits
 * `allow-same-origin`, so the dashboard cannot reach our storage or DOM. The
 * session lasts at most 5 minutes: when it ends the iframe is removed.
 */
export function TableroAnalitica() {
  const { usuario } = useAuth();
  const usuarioId = usuario?.id ?? null;
  const [estado, setEstado] = useState<Estado>({ fase: "cargando" });
  const [altura, setAltura] = useState(ALTURA_INICIAL);
  const [intento, setIntento] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token || !usuarioId) {
      setEstado({ fase: "error", mensaje: "No hay una sesion activa." });
      return;
    }
    const controlador = new AbortController();
    let csrf: SesionAnalitica["csrf_token"] | null = null;
    let temporizador: ReturnType<typeof setTimeout> | undefined;
    setEstado({ fase: "cargando" });

    iniciarSesionAnalitica(token, controlador.signal)
      .then((sesion) => {
        if (controlador.signal.aborted) return;
        csrf = sesion.csrf_token;
        if (sesion.usuario_id !== usuarioId) {
          setEstado({
            fase: "error",
            mensaje: "La sesion de Analitica no corresponde a tu usuario.",
          });
          return;
        }
        const resta = new Date(sesion.expires_at).getTime() - Date.now();
        temporizador = setTimeout(() => setEstado({ fase: "vencida" }), Math.max(resta, 0));
        setEstado({ fase: "listo" });
      })
      .catch((error: unknown) => {
        if (controlador.signal.aborted) return;
        setEstado({
          fase: "error",
          mensaje: error instanceof Error ? error.message : "Analitica no esta disponible.",
        });
      });

    return () => {
      controlador.abort();
      clearTimeout(temporizador);
      // Best effort: the server also expires the session on its own.
      if (csrf) revocarSesionAnalitica(csrf).catch(() => undefined);
    };
  }, [usuarioId, intento]);

  useEffect(() => {
    function alRecibir(evento: MessageEvent) {
      // The sandbox has no allow-same-origin, so the dashboard's origin is the
      // opaque "null". Check the origin and the window before trusting the data.
      if (evento.origin !== ORIGEN_SANDBOX) return;
      if (evento.source !== iframeRef.current?.contentWindow) return;
      const datos = evento.data as { tipo?: unknown; altura?: unknown } | null;
      if (datos?.tipo === TIPO_ALTURA && typeof datos.altura === "number" && datos.altura > 0) {
        setAltura(Math.ceil(datos.altura));
      }
    }
    window.addEventListener("message", alRecibir);
    return () => window.removeEventListener("message", alRecibir);
  }, []);

  const reintentar = useCallback(() => setIntento((n) => n + 1), []);

  if (estado.fase === "cargando") {
    return (
      <div className="flex justify-center py-16" role="status" aria-label="Cargando tablero">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (estado.fase === "vencida") {
    return (
      <EstadoError
        titulo="La sesion del tablero vencio"
        mensaje="Por seguridad el tablero se cierra a los pocos minutos. Volve a abrirlo."
        onReintentar={reintentar}
      />
    );
  }

  if (estado.fase === "error") {
    return (
      <EstadoError
        titulo="Analitica no disponible"
        mensaje={estado.mensaje}
        onReintentar={reintentar}
      />
    );
  }

  return (
    <iframe
      ref={iframeRef}
      title="Tablero de Analitica"
      sandbox="allow-scripts"
      src={RUTA_ANALITICA}
      className="w-full rounded-lg border-0 bg-card"
      style={{ height: altura }}
    />
  );
}
