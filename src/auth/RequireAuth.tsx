import { Navigate, Outlet, useLocation } from "react-router-dom";

import { Rol, esStaff, type Rol as RolType } from "./roles";
import { useAuth } from "./AuthContext";

/**
 * Route guard. Redirects to /login without a session, and to /reclamos when the
 * section needs a role the user does not have. Mirrors the backend's
 * UsuarioDep / StaffDep gate on the client.
 */
export function RequireAuth({
  soloStaff = false,
  soloAdmin = false,
}: {
  soloStaff?: boolean;
  soloAdmin?: boolean;
}) {
  const { usuario } = useAuth();
  const location = useLocation();

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  const rol = usuario.rol as RolType;
  if (soloAdmin && rol !== Rol.ADMIN) {
    return <Navigate to="/reclamos" replace />;
  }
  if (soloStaff && !esStaff(rol)) {
    return <Navigate to="/reclamos" replace />;
  }
  return <Outlet />;
}
