// Client-side mirror of the backend's registration rules. Validating here is a
// better UX than waiting for the 422, but the backend stays the source of truth.

export const NOMBRE_MIN = 2;
export const NOMBRE_MAX = 120;
export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 128;

// Intentionally permissive: the backend has the authoritative check. This only
// catches the obvious "that is not an email" before we hit the network.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
}

export interface ErroresRegistro {
  nombre?: string;
  email?: string;
  password?: string;
}

export function validarRegistro(datos: DatosRegistro): ErroresRegistro {
  const errores: ErroresRegistro = {};

  const nombre = datos.nombre.trim();
  if (nombre.length < NOMBRE_MIN || nombre.length > NOMBRE_MAX) {
    errores.nombre = `El nombre debe tener entre ${NOMBRE_MIN} y ${NOMBRE_MAX} caracteres.`;
  }

  if (!EMAIL_RE.test(datos.email.trim())) {
    errores.email = "Ingresá un email válido.";
  }

  // Length is what matters: no composition rules (no uppercase/symbols required).
  if (datos.password.length < PASSWORD_MIN || datos.password.length > PASSWORD_MAX) {
    errores.password = `La contraseña debe tener entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres.`;
  }

  return errores;
}

export function hayErrores(errores: ErroresRegistro): boolean {
  return Object.keys(errores).length > 0;
}
