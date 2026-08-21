/**
 * Hardcoded users for development, one per role. TEMPORARY: they stand in for
 * Group 2's federated login (LDAP + JWT) until that module is integrated over
 * HTTPS. When it is, `login` fetches a real JWT and these presets go away.
 */

import { Rol } from "./roles";

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
}

export const USUARIOS_DEMO: Usuario[] = [
  { id: "vecino-1", nombre: "Martin Gonzalez", email: "vecino@ciudad.gob.ar", rol: Rol.CIUDADANO },
  { id: "operador-1", nombre: "Ana Operadora", email: "operador@ciudad.gob.ar", rol: Rol.OPERADOR },
  { id: "admin-1", nombre: "Admin CityPass", email: "admin@ciudad.gob.ar", rol: Rol.ADMIN },
];

/** Find a demo user by email (case-insensitive), used by the hardcoded login. */
export function buscarUsuarioDemo(email: string): Usuario | undefined {
  const normalizado = email.trim().toLowerCase();
  return USUARIOS_DEMO.find((u) => u.email.toLowerCase() === normalizado);
}
