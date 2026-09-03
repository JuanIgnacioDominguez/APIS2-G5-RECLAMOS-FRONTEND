import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { setAuthToken } from "@/api/client";
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
    if (usuarioInicial) return { usuario: usuarioInicial, token: "seed" };
    return leerAlmacenado();
  });

  // Keep the api client's bearer token in sync with the session.
  useEffect(() => {
    setAuthToken(sesion?.token ?? null);
  }, [sesion]);

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

  const logout = useCallback(() => {
    setSesion(null);
    setAuthToken(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
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
