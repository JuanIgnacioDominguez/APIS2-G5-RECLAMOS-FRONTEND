import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "@/components/AppLayout";
import { RequireAuth } from "@/auth/RequireAuth";
import { CUENTA, SERVICIOS } from "@/config/navigation";
import { LoginPage } from "@/pages/LoginPage";
import { ReclamosPage } from "@/pages/ReclamosPage";
import { NuevoReclamoPage } from "@/pages/NuevoReclamoPage";
import { ReclamoDetallePage } from "@/pages/ReclamoDetallePage";
import { SectionPlaceholder } from "@/pages/SectionPlaceholder";

// Every CityPass+ section except Reclamos is owned by another group and shows a
// placeholder until its API is integrated over HTTPS.
const placeholderRoutes = [...SERVICIOS, ...CUENTA].filter((item) => item.ownerGroup !== null);

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/reclamos" replace />} />
          <Route path="/reclamos" element={<ReclamosPage />} />
          <Route path="/reclamos/nuevo" element={<NuevoReclamoPage />} />
          <Route path="/reclamos/:id" element={<ReclamoDetallePage />} />
          {placeholderRoutes.map((item) => (
            <Route key={item.to} path={item.to} element={<SectionPlaceholder />} />
          ))}
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/reclamos" replace />} />
    </Routes>
  );
}
