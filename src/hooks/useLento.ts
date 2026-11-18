import { useEffect, useState } from "react";

/**
 * True once `activo` has stayed on for `ms` milliseconds. Used to explain a slow
 * request (for example a free-tier server waking up) instead of leaving a spinner.
 */
export function useLento(activo: boolean, ms = 4000): boolean {
  const [lento, setLento] = useState(false);

  useEffect(() => {
    if (!activo) {
      setLento(false);
      return;
    }
    const temporizador = setTimeout(() => setLento(true), ms);
    return () => clearTimeout(temporizador);
  }, [activo, ms]);

  return lento;
}
