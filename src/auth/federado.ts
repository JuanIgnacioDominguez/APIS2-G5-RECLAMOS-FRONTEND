/**
 * Pure helpers for the Login Federado (Group 2) staff session: read the access
 * token's claims and map its LDAP groups to the roles the UI works with. The
 * signature is never checked here; the backend validates it on every request.
 */

import { Rol } from "./roles";

export interface ClaimsFederado {
  sub?: string;
  name?: string;
  preferred_username?: string;
  email?: string;
  groups?: string[] | string;
  [clave: string]: unknown;
}

// Mirrors JWT_STAFF_GRUPOS_OPERADOR / JWT_STAFF_GRUPOS_ADMIN in the backend's
// render.yaml: a group nobody mapped grants nothing.
const GRUPO_A_ROL: Record<string, Rol> = {
  "reclamos-operadores": Rol.OPERADOR,
  "reclamos-administradores": Rol.ADMIN,
};

export function decodificarClaims(token: string): ClaimsFederado | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as ClaimsFederado;
  } catch {
    return null;
  }
}

/** Roles granted by the token's groups; empty when none of them is a Reclamos group. */
export function rolesDesdeClaims(claims: ClaimsFederado): string[] {
  const crudo = claims.groups;
  const grupos = Array.isArray(crudo)
    ? crudo
    : typeof crudo === "string"
      ? crudo.split(/[\s,]+/)
      : [];
  return [...new Set(grupos.map((g) => GRUPO_A_ROL[g.trim().toLowerCase()]).filter(Boolean))];
}
