import { Navigate, Outlet, useLocation } from "react-router-dom";

import { esStaff, type Rol } from "./roles";
import { useAuth } from "./AuthContext";

/**
 * Route guard. Redirects to /login when there is no session, and (optionally)
 * to /reclamos when the section requires a staff role the user does not have.
 * Mirrors the backend's UsuarioDep / StaffDep gate on the client.
 */
export function RequireAuth({ soloStaff = false }: { soloStaff?: boolean }) {
  const { usuario } = useAuth();
  const location = useLocation();

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (soloStaff && !esStaff(usuario.rol as Rol)) {
    return <Navigate to="/reclamos" replace />;
  }
  return <Outlet />;
}
