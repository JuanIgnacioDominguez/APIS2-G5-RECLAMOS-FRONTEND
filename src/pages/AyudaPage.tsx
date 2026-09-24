import { useAuth } from "@/auth/AuthContext";
import { esStaff, Rol } from "@/auth/roles";
import { CentroAyudaCiudadano } from "@/features/CentroAyudaCiudadano";
import { CentroAyudaOperador } from "@/features/CentroAyudaOperador";

export function AyudaPage() {
  const { usuario } = useAuth();
  const staff = usuario ? esStaff(usuario.rol) : false;

  if (staff) return <CentroAyudaOperador esAdmin={usuario?.rol === Rol.ADMIN} />;
  return <CentroAyudaCiudadano />;
}
