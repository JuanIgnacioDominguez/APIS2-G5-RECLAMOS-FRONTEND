import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  FolderOpen,
  History,
  Inbox,
  LayoutGrid,
  Loader2,
  Plus,
  Search,
  ThumbsUp,
  Timer,
  WifiOff,
  type LucideIcon,
} from "lucide-react";

import { useListarReclamosQuery } from "@/store/citypassApi";
import { useAuth } from "@/auth/AuthContext";
import { esStaff } from "@/auth/roles";
import type { CategoriaReclamo } from "@/domain/enums";
import { CATEGORIA_HEX, opcionesCategoria } from "@/domain/labels";
import { cn } from "cn";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICONO_CATEGORIA } from "@/features/reclamos/iconos";
import { ReclamoCard } from "@/features/reclamos/ReclamoCard";
import { TABS, contarPorTab, filtrarReclamos, type TabReclamos } from "@/features/reclamos/filters";
import type { OrdenFeed } from "@/features/reclamos/feed";

const TODAS = "todas";

const OPCIONES_ORDEN: { value: OrdenFeed; label: string; icon: LucideIcon }[] = [
  { value: "recientes", label: "Mas recientes", icon: Clock },
  { value: "antiguos", label: "Mas antiguos", icon: History },
  { value: "adhesiones", label: "Mas apoyados", icon: ThumbsUp },
];

/** Segmented status filter with a sliding highlight that follows the active tab. */
function TabsFiltro({
  value,
  onChange,
  counts,
}: {
  value: TabReclamos;
  onChange: (tab: TabReclamos) => void;
  counts: Record<TabReclamos, number>;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filtrar por estado"
      className="inline-flex items-center gap-1 rounded-lg bg-muted p-1"
    >
      {TABS.map((t) => {
        const activo = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            type="button"
            aria-selected={activo}
            onClick={() => onChange(t.value)}
            className={cn(
              "relative z-0 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring/60",
              activo ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {activo && (
              <motion.span
                layoutId="tab-activo"
                className="absolute inset-0 -z-10 rounded-md bg-primary shadow-sm"
                transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.9 }}
              />
            )}
            {t.label}
            <span
              className={cn(
                "min-w-5 rounded-full px-1.5 py-0.5 text-center text-xs tabular-nums transition-colors duration-200",
                activo
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-foreground/8 text-muted-foreground",
              )}
            >
              {counts[t.value]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function ReclamosPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const staff = usuario ? esStaff(usuario.rol) : false;
  const [tab, setTab] = useState<TabReclamos>("todos");
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState<CategoriaReclamo | null>(null);
  const [orden, setOrden] = useState<OrdenFeed>("recientes");

  // RTK Query caches by (staff, ciudadano_id, orden) so switching tabs and
  // coming back shows the previous list instantly; a background refetch keeps
  // it fresh. `isLoading` only fires the first time; later revalidations use
  // `isFetching` and never blank the screen.
  const { data, isLoading, error, refetch } = useListarReclamosQuery(
    staff ? { orden } : { ciudadano_id: usuario?.id, orden },
  );
  const mensajeError =
    error && "message" in error && typeof error.message === "string" ? error.message : null;
  const items = useMemo(() => data?.items ?? [], [data]);
  const counts = useMemo(() => contarPorTab(items), [items]);
  const visibles = useMemo(
    () => filtrarReclamos(items, tab, texto, categoria),
    [items, tab, texto, categoria],
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-col gap-6">
        <div data-tour="reclamos-header" className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">
                {staff ? "Todos los reclamos" : "Mis reclamos"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {staff
                  ? "Todos los reclamos de la ciudad, mas alla de la bandeja de entrada."
                  : "Crea, segui y gestiona tus reclamos en la ciudad."}
              </p>
            </div>
          </div>
          <Button
            size="lg"
            data-tour="reclamos-nuevo"
            onClick={() => navigate("/reclamos/nuevo")}
            className="h-10 gap-2 rounded-lg px-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <Plus className="size-4" />
            {staff ? "Cargar reclamo" : "Nuevo reclamo"}
          </Button>
        </div>

        <div data-tour="reclamos-kpis" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Total" value={counts.todos} icon={Inbox} tono="azul" />
          <KpiCard label="Abiertos" value={counts.abiertos} icon={FolderOpen} tono="azul" />
          <KpiCard label="En proceso" value={counts.en_proceso} icon={Timer} tono="ambar" />
          <KpiCard label="Resueltos" value={counts.resueltos} icon={CheckCircle2} tono="verde" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card p-4 shadow-xs ring-1 ring-foreground/10">
          <div data-tour="reclamos-tabs">
            <TabsFiltro value={tab} onChange={setTab} counts={counts} />
          </div>
          <div data-tour="reclamos-filtros" className="flex flex-wrap items-center gap-2">
            <div className="relative w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Buscar por titulo"
                className="pl-9"
              />
            </div>
            <Select
              value={categoria ?? TODAS}
              onValueChange={(v) => setCategoria(v === TODAS ? null : (v as CategoriaReclamo))}
            >
              <SelectTrigger className="w-[190px]" aria-label="Filtrar por categoria">
                <SelectValue placeholder="Todas las categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categoria</SelectLabel>
                  <SelectItem value={TODAS}>
                    <span className="flex items-center gap-2">
                      <LayoutGrid className="size-4 text-muted-foreground" />
                      Todas las categorias
                    </span>
                  </SelectItem>
                  <SelectSeparator />
                  {opcionesCategoria().map((o) => {
                    const Icono = ICONO_CATEGORIA[o.value as CategoriaReclamo];
                    return (
                      <SelectItem key={o.value} value={o.value}>
                        <span className="flex items-center gap-2">
                          <Icono
                            className="size-4"
                            style={{ color: CATEGORIA_HEX[o.value as CategoriaReclamo] }}
                          />
                          {o.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={orden} onValueChange={(v) => setOrden(v as OrdenFeed)}>
              <SelectTrigger className="w-[170px]" aria-label="Ordenar por">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Ordenar por</SelectLabel>
                  {OPCIONES_ORDEN.map((o) => {
                    const Icono = o.icon;
                    return (
                      <SelectItem key={o.value} value={o.value}>
                        <span className="flex items-center gap-2">
                          <Icono className="size-4 text-muted-foreground" />
                          {o.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            Cargando reclamos...
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <WifiOff className="size-9 text-destructive/80" strokeWidth={1.5} />
            <div>
              <p className="font-medium">No se pudo cargar</p>
              <p className="text-sm text-muted-foreground">{mensajeError}</p>
            </div>
            <Button variant="outline" onClick={refetch}>
              Reintentar
            </Button>
          </div>
        )}

        {!isLoading && !error && visibles.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Inbox className="size-9 text-primary/70" strokeWidth={1.5} />
            <p className="font-medium">Todavia no hay reclamos</p>
            <p className="text-sm text-muted-foreground">
              Cuando cargues un reclamo o ajustes los filtros, vas a verlos aca.
            </p>
            <Button variant="outline" className="mt-1" onClick={() => navigate("/reclamos/nuevo")}>
              <Plus />
              Crear el primero
            </Button>
          </div>
        )}

        {!isLoading && !error && visibles.length > 0 && (
          <motion.div
            layout
            data-tour="reclamos-lista"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {visibles.map((reclamo) => (
                <motion.div
                  key={reclamo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <ReclamoCard
                    reclamo={reclamo}
                    autoria={staff ? "ciudad" : "mio"}
                    origen={{
                      label: staff ? "Todos los reclamos" : "Mis reclamos",
                      to: "/reclamos",
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </MotionConfig>
  );
}
