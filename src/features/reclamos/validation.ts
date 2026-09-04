/**
 * Client-side validation of the claim form.
 *
 * Bounds mirror the backend Pydantic schema (`ReclamoCrear`): titulo 5..150,
 * descripcion 10..5000. Validating here gives instant feedback and avoids a
 * round-trip that the API would reject with 422 anyway.
 */

export interface ReclamoFormValues {
  titulo: string;
  descripcion: string;
  categoria: string | null;
  prioridad: string | null;
  direccion: string;
  barrio: string;
  latitud: number | null;
  longitud: number | null;
}

export function validarTitulo(titulo: string): string | null {
  const value = titulo.trim();
  if (value.length < 5) return "El titulo debe tener al menos 5 caracteres";
  if (value.length > 150) return "El titulo no puede superar los 150 caracteres";
  return null;
}

export function validarDescripcion(descripcion: string): string | null {
  const value = descripcion.trim();
  if (value.length < 10) return "La descripcion debe tener al menos 10 caracteres";
  if (value.length > 5000) return "La descripcion no puede superar los 5000 caracteres";
  return null;
}

/** Field-level validators wired into Mantine's `useForm`. */
export const reclamoValidators = {
  titulo: validarTitulo,
  descripcion: validarDescripcion,
};

/** Whether the whole form is valid; useful for tests and submit guards. */
export function esFormularioValido(values: ReclamoFormValues): boolean {
  return validarTitulo(values.titulo) === null && validarDescripcion(values.descripcion) === null;
}
