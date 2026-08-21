/**
 * Roles of the Reclamos module, aligned with the backend authorization:
 * `ciudadano` maps to the backend's UsuarioDep (any authenticated user) and
 * `operador`/`admin` to StaffDep (backoffice). When Group 2's federated login
 * (LDAP + JWT) is wired in, these roles come from the token's claims instead of
 * the hardcoded users here.
 */

export const Rol = {
  CIUDADANO: "ciudadano",
  OPERADOR: "operador",
  ADMIN: "admin",
} as const;
export type Rol = (typeof Rol)[keyof typeof Rol];

export const ROL_LABEL: Record<Rol, string> = {
  [Rol.CIUDADANO]: "Ciudadano",
  [Rol.OPERADOR]: "Operador",
  [Rol.ADMIN]: "Administrador",
};

/** Staff (backoffice) roles: they gate the operator/admin sections. */
export function esStaff(rol: Rol): boolean {
  return rol === Rol.OPERADOR || rol === Rol.ADMIN;
}
