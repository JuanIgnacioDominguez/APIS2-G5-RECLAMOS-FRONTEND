import { request } from "./client";

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
