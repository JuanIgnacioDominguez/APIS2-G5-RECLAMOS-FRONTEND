import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "@/components/AppLayout";
import { RequireAuth } from "@/auth/RequireAuth";
import { useAuth } from "@/auth/AuthContext";
import { CUENTA, OTROS_SERVICIOS, homePorRol } from "@/config/navigation";
import { LoginPage } from "@/pages/LoginPage";
import { ReclamosPage } from "@/pages/ReclamosPage";
import { NuevoReclamoPage } from "@/pages/NuevoReclamoPage";
import { ReclamoDetallePage } from "@/pages/ReclamoDetallePage";
import { BandejaPage } from "@/pages/BandejaPage";
import { PanelPage } from "@/pages/PanelPage";
import { SectionPlaceholder } from "@/pages/SectionPlaceholder";

// Every non-Reclamos section is owned by another group and shows a placeholder
// until its API is integrated over HTTPS.
const placeholderRoutes = [...OTROS_SERVICIOS, ...CUENTA].filter(
  (item) => item.ownerGroup !== null,
);

// Land each role on its own home (citizen: their claims; staff: the backoffice).
function InicioSegunRol() {
  const { usuario } = useAuth();
  return <Navigate to={usuario ? homePorRol(usuario.rol) : "/login"} replace />;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<InicioSegunRol />} />
          <Route path="/reclamos" element={<ReclamosPage />} />
          <Route path="/reclamos/nuevo" element={<NuevoReclamoPage />} />
          <Route path="/reclamos/:id" element={<ReclamoDetallePage />} />
          {placeholderRoutes.map((item) => (
            <Route key={item.to} path={item.to} element={<SectionPlaceholder />} />
          ))}
          <Route element={<RequireAuth soloStaff />}>
            <Route path="/backoffice" element={<BandejaPage />} />
          </Route>
          <Route element={<RequireAuth soloAdmin />}>
            <Route path="/panel" element={<PanelPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<InicioSegunRol />} />
    </Routes>
  );
}
