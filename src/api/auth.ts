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
