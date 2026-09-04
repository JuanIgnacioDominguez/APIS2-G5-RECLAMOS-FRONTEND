import { useEffect, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";

import { sugerirClasificacion } from "@/api/reclamos";
import type { SugerenciaClasificacion } from "@/api/types";
import { validarDescripcion, validarTitulo } from "./validation";

/**
 * Ask the classifier for a category/priority suggestion while the citizen types
 * (US-20). Debounced, and only fires once the title and description are long
 * enough to pass the same bounds the form validates. Errors are swallowed: a
 * missing suggestion must never block the manual flow.
 */
export function useSugerenciaClasificacion(titulo: string, descripcion: string) {
  const [tituloD] = useDebouncedValue(titulo, 500);
  const [descD] = useDebouncedValue(descripcion, 500);
  const [sugerencia, setSugerencia] = useState<SugerenciaClasificacion | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const valido = validarTitulo(tituloD) === null && validarDescripcion(descD) === null;
    if (!valido) {
      setSugerencia(null);
      return;
    }
    let cancelado = false;
    setCargando(true);
    sugerirClasificacion(tituloD.trim(), descD.trim())
      .then((s) => {
        if (!cancelado) setSugerencia(s);
      })
      .catch(() => {
        if (!cancelado) setSugerencia(null);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [tituloD, descD]);

  return { sugerencia, cargando };
}
