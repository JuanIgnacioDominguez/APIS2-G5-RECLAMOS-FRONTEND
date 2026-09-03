/**
 * The logged-in user and the demo credentials for the quick-access buttons.
 *
 * These credentials match the backend's dev login (`app/api/v1/auth_dev.py`):
 * one user per role, password equal to the username. TEMPORARY until Group 2's
 * federated login is integrated.
 */

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
