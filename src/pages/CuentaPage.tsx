import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ClipboardList,
  Eye,
  Inbox,
  Loader2,
  Mail,
  Plus,
  ShieldCheck,
  Sparkles,
  Timer,
  User,
  type LucideIcon,
} from "lucide-react";

import { bandeja, contarResueltos, listarReclamos } from "@/api/reclamos";
import { useAuth } from "@/auth/AuthContext";
import { esStaff, Rol, ROL_LABEL } from "@/auth/roles";
import { navModulo, NAV_CUENTA, type NavItem } from "@/config/navigation";
import { contarPorTab } from "@/features/reclamos/filters";
import { calcularKpisBandeja } from "@/features/reclamos/bandejaTable";
import { useAsync } from "@/hooks/useAsync";
import { PageHeader } from "@/components/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** Compact stat for the summary card: tinted icon chip, big value, label. */
function DatoResumen({
  icono: Icono,
  etiqueta,
  valor,
  color,
}: {
  icono: LucideIcon;
  etiqueta: string;
  valor: string | number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-muted/40 p-3">
      <span
        aria-hidden
        className="flex size-14 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `color-mix(in oklab, ${color} 16%, transparent)`, color }}
      >
        <Icono className="size-7" />
      </span>
      <div className="min-w-0">
        <p className="text-3xl leading-none font-semibold tabular-nums">{valor}</p>
        <p className="mt-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {etiqueta}
        </p>
      </div>
    </div>
  );
}

/**
 * Read-only profile of the logged-in user. Identity comes from the JWT that
 * Group 2's federated login issues, and our backend exposes no profile
 * endpoint, so name, email and role cannot be edited from here.
 */
export function CuentaPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const esCiudadano = usuario?.rol === Rol.CIUDADANO;
  const staff = usuario ? esStaff(usuario.rol) : false;

  // Citizen's own claims for the activity summary (role guard inside).
  const resumenPropio = useAsync(
    () =>
      esCiudadano && usuario
        ? listarReclamos({ ciudadano_id: usuario.id, size: 100 })
        : Promise.resolve(null),
    [esCiudadano, usuario?.id],
  );
  const datosBandeja = useAsync(() => (staff ? bandeja() : Promise.resolve(null)), [staff]);
  const resueltosGlobal = useAsync(
    () => (staff ? contarResueltos() : Promise.resolve(null)),
    [staff],
  );

  // One-tap shortcuts: every page the role can reach, except this one.
  const atajos = useMemo<NavItem[]>(() => {
    if (!usuario) return [];
    const vistos = new Set<string>();
    const items = [...navModulo(usuario.rol).flatMap((s) => s.items), ...NAV_CUENTA].filter(
      (i) => i.to !== "/cuenta" && (vistos.has(i.to) ? false : (vistos.add(i.to), true)),
    );
    const nuevo: NavItem[] = esCiudadano
      ? [{ label: "Nuevo reclamo", to: "/reclamos/nuevo", icon: Plus }]
      : [];
    return [...nuevo, ...items].slice(0, 6);
  }, [usuario, esCiudadano]);

  if (!usuario) return null;

  const filas = [
    { icono: User, etiqueta: "Nombre", valor: usuario.nombre },
    { icono: Mail, etiqueta: "Correo", valor: usuario.email },
    { icono: ShieldCheck, etiqueta: "Rol", valor: ROL_LABEL[usuario.rol] },
  ];
  const conteos = contarPorTab(resumenPropio.data?.items ?? []);
  const enCurso = conteos.abiertos + conteos.en_proceso;
  const kpisBandeja = calcularKpisBandeja(datosBandeja.data?.items ?? [], datosBandeja.data?.total);
  const resueltos = resueltosGlobal.data ?? "–";
  const cargandoBandeja = datosBandeja.loading;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader titulo="Mi cuenta" descripcion="Tus datos dentro del modulo de Reclamos." />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card data-tour="cuenta-datos" className="shadow-xs lg:col-span-3">
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="size-16 shadow-md">
                <AvatarFallback className="bg-primary text-xl text-primary-foreground">
                  {iniciales(usuario.nombre)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xl font-semibold tracking-tight">{usuario.nombre}</p>
                <Badge variant="secondary" className="mt-1.5 gap-1">
                  <ShieldCheck className="size-3" />
                  {ROL_LABEL[usuario.rol]}
                </Badge>
              </div>
            </div>
            <dl className="flex flex-col gap-1">
              {filas.map(({ icono: Icono, etiqueta, valor }) => (
                <div
                  key={etiqueta}
                  title={valor}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/60"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icono className="size-4" />
                  </span>
                  <dt className="w-24 shrink-0 text-sm text-muted-foreground">{etiqueta}</dt>
                  <dd className="min-w-0 flex-1 truncate text-sm font-medium">{valor}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-muted-foreground">
              Estos datos vienen de tu sesion y no se pueden editar desde aca.
            </p>
          </CardContent>
        </Card>

        {esCiudadano ? (
          <Card className="shadow-xs lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Mi actividad</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              {resumenPropio.loading ? (
                <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Cargando resumen...
                </div>
              ) : resumenPropio.error ? (
                <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                  No se pudo cargar el resumen.
                </div>
              ) : (
                <>
                  <div className="flex flex-1 flex-col justify-between gap-3">
                    <DatoResumen
                      icono={Inbox}
                      etiqueta="Reclamos"
                      valor={conteos.todos}
                      color="var(--chart-1)"
                    />
                    <DatoResumen
                      icono={Timer}
                      etiqueta="En curso"
                      valor={enCurso}
                      color="var(--chart-3)"
                    />
                    <DatoResumen
                      icono={CheckCircle2}
                      etiqueta="Resueltos"
                      valor={conteos.resueltos}
                      color="var(--chart-2)"
                    />
                  </div>
                  <Button className="w-full" onClick={() => navigate("/reclamos")}>
                    Ver mis reclamos
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xs lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Resumen del modulo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              {cargandoBandeja ? (
                <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Cargando resumen...
                </div>
              ) : !datosBandeja.data ? (
                <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                  {datosBandeja.error ?? "No se pudo cargar el resumen."}
                </div>
              ) : (
                <>
                  <div className="grid flex-1 grid-cols-2 content-center gap-4">
                    <DatoResumen
                      icono={Inbox}
                      etiqueta="Entrantes"
                      valor={kpisBandeja.entrantes}
                      color="var(--chart-1)"
                    />
                    <DatoResumen
                      icono={ClipboardList}
                      etiqueta="Recibidos"
                      valor={kpisBandeja.recibidos}
                      color="var(--chart-3)"
                    />
                    <DatoResumen
                      icono={Eye}
                      etiqueta="En revision"
                      valor={kpisBandeja.enRevision}
                      color="var(--chart-1)"
                    />
                    <DatoResumen
                      icono={CheckCircle2}
                      etiqueta="Resueltos"
                      valor={resueltos}
                      color="var(--chart-2)"
                    />
                    <div className="col-span-2">
                      <DatoResumen
                        icono={Sparkles}
                        etiqueta="Clasificados por IA"
                        valor={kpisBandeja.clasificadosIa}
                        color="var(--chart-2)"
                      />
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => navigate("/backoffice")}>
                    Ir a la bandeja
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="shadow-xs lg:col-span-5">
          <CardHeader>
            <CardTitle className="text-base">Accesos directos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {atajos.map((a) => {
              const Icono = a.icon;
              return (
                <Button
                  key={a.to}
                  variant="outline"
                  className="justify-start gap-2"
                  onClick={() => navigate(a.to)}
                >
                  <Icono className="size-4 text-muted-foreground" />
                  {a.label}
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
