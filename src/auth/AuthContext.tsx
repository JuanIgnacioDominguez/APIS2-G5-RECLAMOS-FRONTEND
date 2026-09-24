import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { setAuthToken, setUnauthorizedHandler } from "@/api/client";
import { loginDev } from "@/api/auth";
import { rolPrincipal } from "./roles";
import type { Usuario } from "./users";

interface Sesion {
  usuario: Usuario;
  token: string;
}

interface AuthContextValue {
  usuario: Usuario | null;
  autenticado: boolean;
  /** Log in against the backend dev endpoint; resolves with the user or throws. */
  login: (usuario: string, password: string) => Promise<Usuario>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "citypass.auth.sesion";
/** Set when a 401 ended the session, so the login page can explain why. */
export const SESION_VENCIDA_KEY = "citypass.auth.vencida";

function leerAlmacenado(): Sesion | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Sesion) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({
  children,
  usuarioInicial = null,
}: {
  children: ReactNode;
  usuarioInicial?: Usuario | null;
}) {
  const [sesion, setSesion] = useState<Sesion | null>(() => {
    const inicial = usuarioInicial ? { usuario: usuarioInicial, token: "seed" } : leerAlmacenado();
    // Seed the api client's token here, in the initializer, so it is set before
    // any child renders. React runs children's effects before the parent's, so
    // a page firing its fetch in a `useEffect` would otherwise send the first
    // request (right after an F5) with no Authorization header and get a 401.
    setAuthToken(inicial?.token ?? null);
    return inicial;
  });

  // Keep the api client's bearer token in sync with later session changes
  // (login / logout). The initial value is already seeded above.
  useEffect(() => {
    setAuthToken(sesion?.token ?? null);
  }, [sesion]);

  const logout = useCallback(() => {
    setSesion(null);
    setAuthToken(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  // Drop the session when any authenticated call returns 401 (expired/revoked
  // token), so the route guard sends the user back to login. We flag it as an
  // expiry (vs. a manual logout) so the login page can say why they're back.
  useEffect(() => {
    const porVencimiento = () => {
      try {
        sessionStorage.setItem(SESION_VENCIDA_KEY, "1");
      } catch {
        // storage unavailable: the notice is a nice-to-have, skip it
      }
      logout();
    };
    setUnauthorizedHandler(porVencimiento);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const login = useCallback(async (usuario: string, password: string) => {
    const { access_token, usuario: perfil } = await loginDev(usuario, password);
    const u: Usuario = {
      id: perfil.id,
      nombre: perfil.nombre,
      email: perfil.email,
      rol: rolPrincipal(perfil.roles),
    };
    const nueva: Sesion = { usuario: u, token: access_token };
    setSesion(nueva);
    setAuthToken(access_token);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nueva));
    } catch {
      // storage may be unavailable (private mode); session stays in memory
    }
    return u;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ usuario: sesion?.usuario ?? null, autenticado: sesion !== null, login, logout }),
    [sesion, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
