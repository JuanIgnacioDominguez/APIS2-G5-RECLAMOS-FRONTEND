import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  FolderOpen,
  Inbox,
  Loader2,
  Plus,
  Search,
  Timer,
  WifiOff,
} from "lucide-react";

import { listarReclamos } from "@/api/reclamos";
import { useAuth } from "@/auth/AuthContext";
import { esStaff } from "@/auth/roles";
import type { CategoriaReclamo } from "@/domain/enums";
import { opcionesCategoria } from "@/domain/labels";
import { useAsync } from "@/hooks/useAsync";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReclamoCard } from "@/features/reclamos/ReclamoCard";
import { TABS, contarPorTab, filtrarReclamos, type TabReclamos } from "@/features/reclamos/filters";

const TODAS = "todas";

export function ReclamosPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const staff = usuario ? esStaff(usuario.rol) : false;
  const [tab, setTab] = useState<TabReclamos>("todos");
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState<CategoriaReclamo | null>(null);

  const { data, loading, error, reload } = useAsync(() => listarReclamos(), []);
  const items = useMemo(() => data?.items ?? [], [data]);
  const counts = useMemo(() => contarPorTab(items), [items]);
  const visibles = useMemo(
    () => filtrarReclamos(items, tab, texto, categoria),
    [items, tab, texto, categoria],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FolderOpen className="size-6" />
          </span>
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
        <Button onClick={() => navigate("/reclamos/nuevo")}>
          <Plus />
          {staff ? "Cargar reclamo" : "Nuevo reclamo"}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total" value={counts.todos} icon={Inbox} tono="azul" />
        <KpiCard label="Abiertos" value={counts.abiertos} icon={FolderOpen} tono="azul" />
        <KpiCard label="En proceso" value={counts.en_proceso} icon={Timer} tono="ambar" />
        <KpiCard label="Resueltos" value={counts.resueltos} icon={CheckCircle2} tono="verde" />
      </div>

      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <Tabs value={tab} onValueChange={(v) => setTab(v as TabReclamos)}>
            <TabsList>
              {TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="gap-1.5">
                  {t.label}
                  <Badge variant="secondary" className="px-1.5 tabular-nums">
                    {counts[t.value]}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={categoria ?? TODAS}
              onValueChange={(v) => setCategoria(v === TODAS ? null : (v as CategoriaReclamo))}
            >
              <SelectTrigger className="w-[190px]" aria-label="Filtrar por categoria">
                <SelectValue placeholder="Todas las categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODAS}>Todas las categorias</SelectItem>
                {opcionesCategoria().map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Buscar por titulo"
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <div className="p-4">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              Cargando reclamos...
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <WifiOff className="size-6" />
              </span>
              <div>
                <p className="font-medium">No se pudo cargar</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" onClick={reload}>
                Reintentar
              </Button>
            </div>
          )}

          {!loading && !error && visibles.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Inbox className="size-6" />
              </span>
              <p className="font-medium">Todavia no hay reclamos</p>
              <p className="text-sm text-muted-foreground">
                Cuando cargues un reclamo o ajustes los filtros, vas a verlos aca.
              </p>
              <Button
                variant="outline"
                className="mt-1"
                onClick={() => navigate("/reclamos/nuevo")}
              >
                <Plus />
                Crear el primero
              </Button>
            </div>
          )}

          {!loading && !error && visibles.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibles.map((reclamo) => (
                <ReclamoCard key={reclamo.id} reclamo={reclamo} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
