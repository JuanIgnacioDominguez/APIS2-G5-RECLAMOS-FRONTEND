import { useEffect, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";

import { listarReclamos } from "@/api/reclamos";
import type { ReclamoResumen } from "@/api/types";

const LARGO_MINIMO = 2;
const LIMITE_RESULTADOS = 6;

/**
 * Global header search: debounced lookup against the `texto` filter of
 * `GET /reclamos`, capped to a handful of results for a dropdown preview.
 * Queries under the minimum length never hit the network.
 */
export function useBusquedaReclamos(texto: string) {
  const [textoD] = useDebouncedValue(texto.trim(), 300);
  const [resultados, setResultados] = useState<ReclamoResumen[]>([]);
  const [buscando, setBuscando] = useState(false);
  const activa = textoD.length >= LARGO_MINIMO;

  useEffect(() => {
    if (!activa) {
      setResultados([]);
      setBuscando(false);
      return;
    }
    let cancelado = false;
    setBuscando(true);
    listarReclamos({ texto: textoD, size: LIMITE_RESULTADOS })
      .then((pagina) => {
        if (!cancelado) setResultados(pagina.items);
      })
      .catch(() => {
        if (!cancelado) setResultados([]);
      })
      .finally(() => {
        if (!cancelado) setBuscando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [textoD, activa]);

  return { resultados, buscando, activa };
}
