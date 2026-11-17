import { decodificarClaims, rolesDesdeClaims } from "@/auth/federado";
import { ApiError, request } from "./client";

export interface UsuarioOut {
  id: string;
  nombre: string;
  email: string;
  roles: string[];
}

export interface TokenOut {
  access_token: string;
  token_type: string;
  expires_in: number;
  usuario: UsuarioOut;
}

export function loginDev(usuario: string, password: string): Promise<TokenOut> {
  return request<TokenOut>("/auth/dev/login", {
    method: "POST",
    body: { usuario, password },
  });
}

const IDP_URL = import.meta.env.VITE_IDP_URL ?? "https://api.citypass-login.pp.ua";
const IDP_CLIENT_ID = import.meta.env.VITE_IDP_CLIENT_ID ?? "citypass-reclamos-web";

/**
 * Production has no dev login (the backend mounts it only in development), so
 * staff sign in against the Login Federado there. Local dev and tests keep the
 * dev login, which is what the local backend serves.
 */
export function loginFederadoActivo(): boolean {
  return import.meta.env.PROD;
}

/**
 * Staff login against the Login Federado straight from the browser (its CORS
 * allows our origin). The token it returns is the real one our backend
 * validates against the IdP's JWKS, so it is also the one Analytics needs.
 */
export async function loginFederado(usuario: string, password: string): Promise<TokenOut> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${IDP_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: usuario, password, clientId: IDP_CLIENT_ID }),
    });
  } catch {
    throw new ApiError(0, "No pudimos conectar con el Login Federado. Intenta de nuevo.", "red");
  }

  const cuerpo = (await respuesta.json().catch(() => null)) as {
    access_token?: string;
    expires_in?: number;
    detail?: string;
    message?: string;
  } | null;

  if (!respuesta.ok || !cuerpo?.access_token) {
    const mensaje =
      respuesta.status === 401
        ? "Usuario o contrasena incorrectos"
        : (cuerpo?.detail ?? cuerpo?.message ?? "No se pudo iniciar sesion");
    throw new ApiError(respuesta.status || 502, mensaje);
  }

  const claims = decodificarClaims(cuerpo.access_token);
  const roles = claims ? rolesDesdeClaims(claims) : [];
  if (!claims?.sub || roles.length === 0) {
    throw new ApiError(403, "Tu usuario no tiene permisos en el modulo de Reclamos");
  }

  return {
    access_token: cuerpo.access_token,
    token_type: "bearer",
    expires_in: cuerpo.expires_in ?? 0,
    usuario: {
      id: claims.sub,
      nombre: claims.name ?? claims.preferred_username ?? claims.sub,
      email: claims.email ?? "",
      roles,
    },
  };
}

export interface RegistroCiudadano {
  email: string;
  nombre: string;
}

// Citizens register and log in against this backend, not the Login Federado
// (that one is only for municipal staff). Passwordless since G5D-433: the
// account is identified by email alone. The response keeps the same shape as
// loginDev, so the session handling downstream is identical.
export function registrarCiudadano(datos: RegistroCiudadano): Promise<TokenOut> {
  return request<TokenOut>("/auth/ciudadanos/registro", {
    method: "POST",
    body: datos,
  });
}

export function loginCiudadano(email: string): Promise<TokenOut> {
  return request<TokenOut>("/auth/ciudadanos/login", {
    method: "POST",
    body: { email },
  });
}
