import { useEffect, useState } from "react";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { sugerirClasificacion } from "@/api/reclamos";
import type { SugerenciaClasificacion } from "@/api/types";
import { validarDescripcion, validarTitulo } from "./validation";

export function useSugerenciaClasificacion(titulo: string, descripcion: string) {
  const tituloD = useDebouncedValue(titulo, 500);
  const descD = useDebouncedValue(descripcion, 500);
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
