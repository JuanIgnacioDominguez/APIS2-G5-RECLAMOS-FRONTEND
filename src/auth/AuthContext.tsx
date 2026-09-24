import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { setAuthToken, setUnauthorizedHandler } from "@/api/client";
import { loginDev } from "@/api/auth";
import { citypassApi } from "@/store/citypassApi";
import { useAppDispatch } from "@/store/hooks";
import { rolPrincipal } from "./roles";
import type { Usuario } from "./users";

interface Sesion {
  usuario: Usuario;
  token: string;
}

interface AuthContextValue {
  usuario: Usuario | null;
  autenticado: boolean;
  login: (usuario: string, password: string) => Promise<Usuario>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "citypass.auth.sesion";
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
  const dispatch = useAppDispatch();
  const [sesion, setSesion] = useState<Sesion | null>(() => {
    const inicial = usuarioInicial ? { usuario: usuarioInicial, token: "seed" } : leerAlmacenado();
    setAuthToken(inicial?.token ?? null);
    return inicial;
  });

  useEffect(() => {
    setAuthToken(sesion?.token ?? null);
  }, [sesion]);

  const logout = useCallback(() => {
    setSesion(null);
    setAuthToken(null);
    dispatch(citypassApi.util.resetApiState());
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, [dispatch]);

  useEffect(() => {
    const porVencimiento = () => {
      try {
        sessionStorage.setItem(SESION_VENCIDA_KEY, "1");
      } catch {
        // ignore
      }
      logout();
    };
    setUnauthorizedHandler(porVencimiento);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const login = useCallback(
    async (usuario: string, password: string) => {
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
      dispatch(citypassApi.util.resetApiState());
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nueva));
      } catch {
        // ignore
      }
      return u;
    },
    [dispatch],
  );

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
