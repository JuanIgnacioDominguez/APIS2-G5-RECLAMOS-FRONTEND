/**
 * Development login endpoints. TEMPORARY scaffolding: the backend's
 * `POST /auth/dev/login` mints a real HS256 JWT with the same shape Group 2's
 * Federated Login will use, so this client keeps working against the real
 * issuer once it is wired in.
 */

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

/** Exchange dev credentials for a real JWT (401 on bad credentials). */
export function loginDev(usuario: string, password: string): Promise<TokenOut> {
  return request<TokenOut>("/auth/dev/login", {
    method: "POST",
    body: { usuario, password },
  });
}
