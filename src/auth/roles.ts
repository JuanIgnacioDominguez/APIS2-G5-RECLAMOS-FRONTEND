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

export function esStaff(rol: Rol): boolean {
  return rol === Rol.OPERADOR || rol === Rol.ADMIN;
}

export function rolPrincipal(roles: string[]): Rol {
  if (roles.includes(Rol.ADMIN)) return Rol.ADMIN;
  if (roles.includes(Rol.OPERADOR)) return Rol.OPERADOR;
  return Rol.CIUDADANO;
}
