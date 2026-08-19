import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "@/components/AppLayout";
import { LoginPage } from "@/pages/LoginPage";
import { ReclamosPage } from "@/pages/ReclamosPage";
import { NuevoReclamoPage } from "@/pages/NuevoReclamoPage";
import { ReclamoDetallePage } from "@/pages/ReclamoDetallePage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/reclamos" replace />} />
        <Route path="/reclamos" element={<ReclamosPage />} />
        <Route path="/reclamos/nuevo" element={<NuevoReclamoPage />} />
        <Route path="/reclamos/:id" element={<ReclamoDetallePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/reclamos" replace />} />
    </Routes>
  );
}
