import { Rol } from "./roles";

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
}

export interface CredencialDemo {
  usuario: string;
  password: string;
  rol: Rol;
}

export const CREDENCIALES_DEMO: CredencialDemo[] = [
  { usuario: "vecino1", password: "vecino1", rol: Rol.CIUDADANO },
  { usuario: "operador1", password: "operador1", rol: Rol.OPERADOR },
  { usuario: "admin1", password: "admin1", rol: Rol.ADMIN },
];
