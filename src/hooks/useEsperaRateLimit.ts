import { useCallback, useEffect, useRef, useState } from "react";

// The backend sends Retry-After, but CORS does not expose it to the browser,
// so we wait a fixed, indicative window after a 429 instead of reading it.
export const ESPERA_RATE_LIMIT_SEGUNDOS = 60;

export interface EsperaRateLimit {
  enEspera: boolean;
  restante: number;
  iniciar: () => void;
}

// Per-action cooldown after a rate-limit (429). One instance per action: each
// screen uses a separate one so a blocked "comentar" never blocks "adherir".
export function useEsperaRateLimit(segundos: number = ESPERA_RATE_LIMIT_SEGUNDOS): EsperaRateLimit {
  const [restante, setRestante] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const limpiar = useCallback(() => {
    if (timer.current !== null) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const iniciar = useCallback(() => {
    limpiar();
    setRestante(segundos);
    timer.current = setInterval(() => {
      setRestante((s) => {
        if (s <= 1) {
          limpiar();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [segundos, limpiar]);

  // Clear the interval on unmount.
  useEffect(() => limpiar, [limpiar]);

  return { enEspera: restante > 0, restante, iniciar };
}
