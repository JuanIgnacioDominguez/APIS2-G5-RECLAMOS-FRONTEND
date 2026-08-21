import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { setAuthToken } from "@/api/client";
import { Rol } from "./roles";
import { buscarUsuarioDemo, type Usuario } from "./users";

interface AuthContextValue {
  usuario: Usuario | null;
  autenticado: boolean;
  /** Log in by email. Unknown emails default to a ciudadano (hardcoded). */
  login: (email: string) => Usuario;
  /** Log in directly as a known demo user (used by the quick-access buttons). */
  loginComo: (usuario: Usuario) => Usuario;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "citypass.auth.usuario";

/**
 * Stand-in for a real JWT. It carries the same shape the backend expects
 * (`sub`, `roles`) so swapping in Group 2's token later touches only the login
 * call, not the rest of the app.
 */
function tokenFalso(usuario: Usuario): string {
  const payload = btoa(JSON.stringify({ sub: usuario.id, roles: [usuario.rol] }));
  return `dev.${payload}`;
}

function leerAlmacenado(): Usuario | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Usuario) : null;
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
  const [usuario, setUsuario] = useState<Usuario | null>(usuarioInicial ?? leerAlmacenado);

  // Keep the api client's bearer token in sync with the session on mount.
  useEffect(() => {
    if (usuario) setAuthToken(tokenFalso(usuario));
  }, [usuario]);

  const establecer = useCallback((u: Usuario) => {
    setUsuario(u);
    setAuthToken(tokenFalso(u));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } catch {
      // storage may be unavailable (private mode); session stays in memory
    }
    return u;
  }, []);

  const login = useCallback(
    (email: string) => {
      const encontrado = buscarUsuarioDemo(email);
      const u: Usuario = encontrado ?? {
        id: `vecino-${email.trim().toLowerCase()}`,
        nombre: email.split("@")[0] || "Vecino",
        email: email.trim(),
        rol: Rol.CIUDADANO,
      };
      return establecer(u);
    },
    [establecer],
  );

  const logout = useCallback(() => {
    setUsuario(null);
    setAuthToken(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ usuario, autenticado: usuario !== null, login, loginComo: establecer, logout }),
    [usuario, login, establecer, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
