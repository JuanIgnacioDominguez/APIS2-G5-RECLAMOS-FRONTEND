import { Rol } from "@/auth/roles";
import type { Usuario } from "@/auth/users";

/** Seeded users for tests, one per role (shape of the backend's dev users). */
export const CIUDADANO: Usuario = {
  id: "vecino-1",
  nombre: "Vecina Perez",
  email: "vecino1@citypass.local",
  rol: Rol.CIUDADANO,
};

export const OPERADOR: Usuario = {
  id: "operador-1",
  nombre: "Operador Municipal",
  email: "operador1@citypass.local",
  rol: Rol.OPERADOR,
};

export const ADMIN: Usuario = {
  id: "admin-1",
  nombre: "Administrador del Modulo",
  email: "admin1@citypass.local",
  rol: Rol.ADMIN,
};
