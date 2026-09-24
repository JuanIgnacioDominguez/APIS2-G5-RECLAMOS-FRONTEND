import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "@/components/AppLayout";
import { RequireAuth } from "@/auth/RequireAuth";
import { useAuth } from "@/auth/AuthContext";
import { homePorRol } from "@/config/navigation";

const LoginPage = lazy(() =>
  import("@/pages/LoginPage").then((module) => ({ default: module.LoginPage })),
);
const ReclamosPage = lazy(() =>
  import("@/pages/ReclamosPage").then((module) => ({ default: module.ReclamosPage })),
);
const FeedPublicoPage = lazy(() =>
  import("@/pages/FeedPublicoPage").then((module) => ({ default: module.FeedPublicoPage })),
);
const NuevoReclamoPage = lazy(() =>
  import("@/pages/NuevoReclamoPage").then((module) => ({ default: module.NuevoReclamoPage })),
);
const ReclamoDetallePage = lazy(() =>
  import("@/pages/ReclamoDetallePage").then((module) => ({ default: module.ReclamoDetallePage })),
);
const BandejaPage = lazy(() =>
  import("@/pages/BandejaPage").then((module) => ({ default: module.BandejaPage })),
);
const DashboardPage = lazy(() =>
  import("@/pages/DashboardPage").then((module) => ({ default: module.DashboardPage })),
);
const PanelPage = lazy(() =>
  import("@/pages/PanelPage").then((module) => ({ default: module.PanelPage })),
);
const MapaPublicoPage = lazy(() =>
  import("@/pages/MapaPublicoPage").then((module) => ({ default: module.MapaPublicoPage })),
);
const CuentaPage = lazy(() =>
  import("@/pages/CuentaPage").then((module) => ({ default: module.CuentaPage })),
);
const NotificacionesPage = lazy(() =>
  import("@/pages/NotificacionesPage").then((module) => ({ default: module.NotificacionesPage })),
);
const ConfiguracionPage = lazy(() =>
  import("@/pages/ConfiguracionPage").then((module) => ({ default: module.ConfiguracionPage })),
);
const AyudaPage = lazy(() =>
  import("@/pages/AyudaPage").then((module) => ({ default: module.AyudaPage })),
);
const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })),
);

function conSuspense(children: ReactNode) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-64 place-items-center" role="status" aria-live="polite">
          <span className="text-sm text-muted-foreground">Cargando...</span>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

// Land each role on its own home (citizen: their claims; staff: the backoffice).
function InicioSegunRol() {
  const { usuario } = useAuth();
  return <Navigate to={usuario ? homePorRol(usuario.rol) : "/login"} replace />;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={conSuspense(<LoginPage />)} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<InicioSegunRol />} />
          <Route path="/reclamos" element={conSuspense(<ReclamosPage />)} />
          <Route path="/feed" element={conSuspense(<FeedPublicoPage />)} />
          <Route path="/reclamos/nuevo" element={conSuspense(<NuevoReclamoPage />)} />
          <Route path="/reclamos/:id" element={conSuspense(<ReclamoDetallePage />)} />
          <Route path="/mapa" element={conSuspense(<MapaPublicoPage />)} />
          <Route path="/cuenta" element={conSuspense(<CuentaPage />)} />
          <Route path="/notificaciones" element={conSuspense(<NotificacionesPage />)} />
          <Route path="/configuracion" element={conSuspense(<ConfiguracionPage />)} />
          <Route path="/ayuda" element={conSuspense(<AyudaPage />)} />
          <Route element={<RequireAuth soloStaff />}>
            <Route path="/dashboard" element={conSuspense(<DashboardPage />)} />
            <Route path="/backoffice" element={conSuspense(<BandejaPage />)} />
          </Route>
          <Route element={<RequireAuth soloAdmin />}>
            <Route path="/panel" element={conSuspense(<PanelPage />)} />
          </Route>
          <Route path="*" element={conSuspense(<NotFoundPage />)} />
        </Route>
      </Route>
    </Routes>
  );
}
