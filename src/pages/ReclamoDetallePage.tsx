import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Building2,
  Clock,
  Download,
  ExternalLink,
  FileText,
  History,
  ListChecks,
  Loader2,
  MapPin,
  Radio,
  RefreshCw,
  Smartphone,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";

import { cn } from "cn";
import type { HistorialOut, ReclamoDetalle } from "@/api/types";
import { useAdherirMutation, useObtenerReclamoQuery } from "@/store/citypassApi";
import { CanalOrigen } from "@/domain/enums";
import { ESTADO_HEX, ESTADO_LABEL, ESTADO_TEXT_COLOR } from "@/domain/labels";
import { formatFecha, haceCuanto, idCorto } from "@/lib/format";
import { EstadoError } from "@/components/EstadoError";
import { useAuth } from "@/auth/AuthContext";
import { esStaff } from "@/auth/roles";
import { CategoriaBadge, EstadoBadge, PrioridadBadge } from "@/features/reclamos/EstadoBadges";
import { GestionarEstado } from "@/features/reclamos/GestionarEstado";
import { ClasificarReclamo } from "@/features/reclamos/ClasificarReclamo";
import { ComentariosReclamo } from "@/features/reclamos/ComentariosReclamo";
import { ReclamoResumenCard } from "@/features/reclamos/ReclamoResumenCard";
import { PosiblesDuplicados } from "@/features/reclamos/PosiblesDuplicados";
import { MapaUbicacion } from "@/features/mapa/MapaUbicacion";
import { ICONO_ESTADO } from "@/features/reclamos/iconos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CANAL_LABEL: Record<CanalOrigen, string> = {
  APP: "App",
  WEB: "Web",
  TELEFONO: "Teléfono",
  PRESENCIAL: "Presencial",
  EVENTO: "Evento",
};

function DatoFila({
  etiqueta,
  valor,
  icono: Icono,
}: {
  etiqueta: string;
  valor: ReactNode;
  icono?: LucideIcon;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-2.5">
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {Icono && <Icono className="size-3.5" />}
        {etiqueta}
      </span>
      <span className="text-right text-sm font-medium">{valor}</span>
    </div>
  );
}

function SeccionTitulo({ icon: Icon, children }: { icon: LucideIcon; children: string }) {
  return (
    <CardTitle className="flex items-center gap-2 text-base font-semibold">
      <Icon className="size-[18px] text-primary" strokeWidth={2.2} />
      {children}
    </CardTitle>
  );
}

function formatFechaCreacion(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "-";
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(fecha);
}

function urlSeguro(valor: string): string | null {
  try {
    const url = new URL(valor, window.location.origin);
    const protocolo = url.protocol;
    if (["http:", "https:", "blob:"].includes(protocolo) || url.href.startsWith("data:image/")) {
      return valor;
    }
  } catch {
    return null;
  }
  return null;
}

function nombreArchivo(url: string): string {
  try {
    const ruta = new URL(url, window.location.origin).pathname;
    const ultimo = ruta.split("/").filter(Boolean).at(-1);
    return ultimo ? decodeURIComponent(ultimo) : "Imagen adjunta";
  } catch {
    return "Imagen adjunta";
  }
}

function tipoArchivo(nombre: string): string {
  const partes = nombre.split(".");
  return partes.length > 1 ? (partes.at(-1)?.toUpperCase() ?? "Imagen") : "Imagen";
}

function FotoAdjunta({ foto }: { foto: string }) {
  const src = urlSeguro(foto);
  if (!src) return null;
  const nombre = nombreArchivo(src);
  const tipo = tipoArchivo(nombre);

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-2.5">
      <a href={src} target="_blank" rel="noreferrer" className="shrink-0">
        <img
          src={src}
          alt={`Evidencia del reclamo: ${nombre}`}
          className="size-14 rounded-lg border object-cover"
          loading="lazy"
        />
      </a>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{nombre}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Imagen · {tipo}</p>
      </div>
      <Button asChild variant="outline" size="icon-sm">
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          download={nombre}
          aria-label={`Descargar ${nombre}`}
        >
          <Download />
        </a>
      </Button>
    </div>
  );
}

function HistorialTimeline({ historial }: { historial: HistorialOut[] }) {
  if (historial.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin movimientos registrados.</p>;
  }

  const eventos = [...historial].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <ol className="relative space-y-4">
      {eventos.map((historialItem, indice) => {
        const fill = ESTADO_HEX[historialItem.estado_nuevo];
        const color = ESTADO_TEXT_COLOR[historialItem.estado_nuevo];
        const Icono = ICONO_ESTADO[historialItem.estado_nuevo];
        const esActual = indice === 0;
        const esAlta = historialItem.estado_anterior === null;

        return (
          <li key={historialItem.id} className="relative flex gap-3">
            <div className="flex flex-col items-center">
              <span
                aria-hidden
                className="grid size-8 shrink-0 place-items-center rounded-full"
                style={{
                  backgroundColor: `color-mix(in oklab, ${fill} 16%, transparent)`,
                  color,
                }}
              >
                <Icono className="size-[18px]" />
              </span>
              {indice < eventos.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
            </div>
            <div className="-mt-0.5 min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-sm font-semibold" style={{ color }}>
                  {esAlta ? "Alta del reclamo" : ESTADO_LABEL[historialItem.estado_nuevo]}
                </span>
                {esActual && (
                  <Badge
                    variant="outline"
                    className="h-5 border-transparent bg-primary/10 px-1.5 text-[10px] font-medium text-primary"
                  >
                    Actual
                  </Badge>
                )}
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3" />
                {formatFecha(historialItem.created_at)}
                <span aria-hidden>·</span>
                {haceCuanto(historialItem.created_at)}
              </p>
              {historialItem.motivo && (
                <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-sm leading-relaxed">
                  {historialItem.motivo}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

interface VistaGestionProps {
  reclamo: ReclamoDetalle;
  refrescando: boolean;
  onRecargar: () => void;
  onVolver: () => void;
}

function VistaGestionReclamo({ reclamo, refrescando, onRecargar, onVolver }: VistaGestionProps) {
  const tieneUbicacion = reclamo.latitud !== null && reclamo.longitud !== null;
  const mapaUrl =
    reclamo.latitud !== null && reclamo.longitud !== null
      ? `https://www.openstreetmap.org/?mlat=${reclamo.latitud}&mlon=${reclamo.longitud}#map=17/${reclamo.latitud}/${reclamo.longitud}`
      : null;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5">
      <section
        data-tour="detalle-header"
        className="flex flex-col gap-3 pb-1 xl:flex-row xl:items-start xl:justify-between"
      >
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-balance sm:text-[1.7rem]">
              Reclamo {idCorto(reclamo.id)}
            </h1>
            <div className="flex flex-wrap items-center gap-1.5">
              <EstadoBadge estado={reclamo.estado} />
              <CategoriaBadge categoria={reclamo.categoria} />
              <PrioridadBadge prioridad={reclamo.prioridad} />
              {reclamo.barrio && (
                <Badge variant="outline" className="gap-1 text-muted-foreground">
                  <MapPin className="size-3" />
                  {reclamo.barrio}
                </Badge>
              )}
              <Badge variant="outline" className="gap-1 text-muted-foreground">
                <Smartphone className="size-3" />
                {CANAL_LABEL[reclamo.canal]}
              </Badge>
            </div>
          </div>
          {reclamo.titulo && (
            <p className="text-base font-medium text-pretty text-foreground/80">{reclamo.titulo}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 xl:justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onVolver}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Volver
          </Button>
          <p className="text-xs text-muted-foreground">
            Creado el {formatFechaCreacion(reclamo.created_at)}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRecargar}
            disabled={refrescando}
            aria-label="Actualizar reclamo"
          >
            <RefreshCw className={cn(refrescando && "animate-spin")} />
          </Button>
        </div>
      </section>

      {/* Masonry: management (col 1) and classification (col 2) up top, the
          description and comments spanning both below; the right column (col 3)
          runs full height with location, details and traceability. */}
      <div className="grid items-start gap-4 lg:grid-cols-3">
        <Card data-tour="detalle-gestion" className="rounded-2xl ring-1 ring-border">
          <CardContent className="pt-6">
            <GestionarEstado
              reclamoId={reclamo.id}
              estadoActual={reclamo.estado}
              categoria={reclamo.categoria}
              asignadoActual={reclamo.asignado_a}
              areaActual={reclamo.area_responsable}
              embebido
            />
          </CardContent>
        </Card>

        <Card data-tour="detalle-clasificacion" className="rounded-2xl ring-1 ring-border">
          <CardContent className="pt-6">
            <ClasificarReclamo
              reclamoId={reclamo.id}
              categoriaActual={reclamo.categoria}
              prioridadActual={reclamo.prioridad}
              embebido
            />
          </CardContent>
        </Card>

        <aside className="flex min-w-0 flex-col gap-4 lg:col-start-3 lg:row-span-2">
          {(tieneUbicacion || reclamo.direccion) && (
            <Card data-tour="detalle-ubicacion" className="rounded-2xl ring-1 ring-border">
              <CardHeader className="flex-row items-center justify-between gap-3">
                <SeccionTitulo icon={MapPin}>Ubicación</SeccionTitulo>
                {mapaUrl && (
                  <CardAction>
                    <Button asChild variant="outline" size="sm" className="text-primary">
                      <a href={mapaUrl} target="_blank" rel="noreferrer">
                        Ver en mapa
                        <ExternalLink />
                      </a>
                    </Button>
                  </CardAction>
                )}
              </CardHeader>
              <CardContent>
                {tieneUbicacion && (
                  <MapaUbicacion
                    latitud={reclamo.latitud!}
                    longitud={reclamo.longitud!}
                    alto={180}
                  />
                )}
                {reclamo.direccion && !tieneUbicacion && (
                  <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    {reclamo.direccion}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Card data-tour="detalle-detalles" className="rounded-2xl ring-1 ring-border">
            <CardHeader>
              <SeccionTitulo icon={ListChecks}>Detalles</SeccionTitulo>
            </CardHeader>
            <CardContent className="divide-y px-5 pb-3">
              <DatoFila etiqueta="Barrio" valor={reclamo.barrio ?? "Sin barrio"} />
              <DatoFila
                etiqueta="Asignado a"
                valor={reclamo.asignado_a ?? "Sin asignar"}
                icono={Users}
              />
              <DatoFila
                etiqueta="Área responsable"
                valor={reclamo.area_responsable ?? "Sin definir"}
                icono={Building2}
              />
              <DatoFila etiqueta="Canal" valor={CANAL_LABEL[reclamo.canal]} icono={Radio} />
              <DatoFila etiqueta="Última actualización" valor={haceCuanto(reclamo.updated_at)} />
            </CardContent>
          </Card>

          <Card data-tour="detalle-trazabilidad" className="rounded-2xl ring-1 ring-border">
            <CardHeader>
              <SeccionTitulo icon={History}>Trazabilidad</SeccionTitulo>
            </CardHeader>
            <CardContent>
              <HistorialTimeline historial={reclamo.historial} />
            </CardContent>
          </Card>
        </aside>

        <div className="flex min-w-0 flex-col gap-4 lg:col-span-2 lg:col-start-1">
          <PosiblesDuplicados reclamoId={reclamo.id} />

          <Card data-tour="detalle-informacion" className="rounded-2xl ring-1 ring-border">
            <CardHeader>
              <SeccionTitulo icon={FileText}>Información del reclamo</SeccionTitulo>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="max-w-3xl text-sm leading-6 text-pretty text-foreground/80">
                {reclamo.descripcion || "El reclamo no incluye una descripción adicional."}
              </p>
              {reclamo.resolucion && (
                <div className="rounded-xl border border-success/30 bg-success-surface p-4">
                  <p className="mb-1 text-sm font-semibold text-success">Resolución</p>
                  <p className="text-sm leading-relaxed text-foreground/80">{reclamo.resolucion}</p>
                </div>
              )}
              {reclamo.fotos.length > 0 && (
                <div className="space-y-2">
                  {reclamo.fotos.map((foto, indice) => (
                    <FotoAdjunta key={`${foto}-${indice}`} foto={foto} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div data-tour="detalle-comentarios">
            <ComentariosReclamo reclamoId={reclamo.id} comentarios={reclamo.comentarios} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface VistaCiudadanoProps {
  reclamo: ReclamoDetalle;
  totalAdhesiones: number;
  esPropio: boolean;
  puedeAdherir: boolean;
  adhiriendo: boolean;
  refrescando: boolean;
  onAdherir: () => void;
  onRecargar: () => void;
  onVolver: () => void;
}

function VistaCiudadanoReclamo({
  reclamo,
  totalAdhesiones,
  esPropio,
  puedeAdherir,
  adhiriendo,
  refrescando,
  onAdherir,
  onRecargar,
  onVolver,
}: VistaCiudadanoProps) {
  const tieneUbicacion = reclamo.latitud !== null && reclamo.longitud !== null;
  const mapaUrl =
    reclamo.latitud !== null && reclamo.longitud !== null
      ? `https://www.openstreetmap.org/?mlat=${reclamo.latitud}&mlon=${reclamo.longitud}#map=17/${reclamo.latitud}/${reclamo.longitud}`
      : null;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5">
      <section
        data-tour="detalle-header"
        className="flex flex-col gap-3 pb-1 xl:flex-row xl:items-start xl:justify-between"
      >
        <div className="flex min-w-0 flex-col gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onVolver}
            className="w-fit gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Volver
          </Button>
          <div className="min-w-0 space-y-3">
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-balance sm:text-[1.7rem]">
              Reclamo {idCorto(reclamo.id)}
            </h1>
            {reclamo.titulo && (
              <p className="text-base font-medium text-pretty text-foreground/80">
                {reclamo.titulo}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 xl:justify-end">
          <p className="text-xs text-muted-foreground">
            Creado el {formatFechaCreacion(reclamo.created_at)}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRecargar}
            disabled={refrescando}
            aria-label="Actualizar reclamo"
          >
            <RefreshCw className={cn(refrescando && "animate-spin")} />
          </Button>
        </div>
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
          <div data-tour="detalle-resumen">
            <ReclamoResumenCard reclamo={reclamo} esPropio={esPropio} />
          </div>

          <Card data-tour="detalle-adhesion" className="rounded-2xl ring-1 ring-border">
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Users className="size-4" />
                </span>
                <div>
                  <p className="font-semibold">Participación</p>
                  <p className="text-sm text-muted-foreground">
                    {totalAdhesiones}{" "}
                    {totalAdhesiones === 1 ? "vecino se sumó" : "vecinos se sumaron"}
                  </p>
                </div>
              </div>
              {esPropio ? (
                <span className="text-sm text-muted-foreground">Es tu reclamo</span>
              ) : (
                puedeAdherir && (
                  <Button onClick={onAdherir} disabled={adhiriendo} className="gap-2">
                    {adhiriendo ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Users className="size-4" />
                    )}
                    A mí también me pasa
                  </Button>
                )
              )}
            </CardContent>
          </Card>

          <Card data-tour="detalle-informacion" className="rounded-2xl ring-1 ring-border">
            <CardHeader>
              <SeccionTitulo icon={FileText}>Descripción</SeccionTitulo>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="max-w-3xl text-sm leading-6 text-pretty text-foreground/80">
                {reclamo.descripcion || "El reclamo no incluye una descripción adicional."}
              </p>
              {reclamo.resolucion && (
                <div className="rounded-xl border border-success/30 bg-success-surface p-4">
                  <p className="mb-1 text-sm font-semibold text-success">Resolución</p>
                  <p className="text-sm leading-relaxed text-foreground/80">{reclamo.resolucion}</p>
                </div>
              )}
              {reclamo.fotos.length > 0 && (
                <div className="space-y-2">
                  {reclamo.fotos.map((foto, indice) => (
                    <FotoAdjunta key={`${foto}-${indice}`} foto={foto} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div data-tour="detalle-comentarios">
            <ComentariosReclamo reclamoId={reclamo.id} comentarios={reclamo.comentarios} />
          </div>
        </div>

        <aside className="flex min-w-0 flex-col gap-4">
          <Card data-tour="detalle-trazabilidad" className="rounded-2xl ring-1 ring-border">
            <CardHeader>
              <SeccionTitulo icon={History}>Seguimiento</SeccionTitulo>
            </CardHeader>
            <CardContent>
              <HistorialTimeline historial={reclamo.historial} />
            </CardContent>
          </Card>

          {(tieneUbicacion || reclamo.direccion) && (
            <Card data-tour="detalle-ubicacion" className="rounded-2xl ring-1 ring-border">
              <CardHeader className="flex-row items-center justify-between gap-3">
                <SeccionTitulo icon={MapPin}>Ubicación</SeccionTitulo>
                {mapaUrl && (
                  <CardAction>
                    <Button asChild variant="outline" size="sm" className="text-primary">
                      <a href={mapaUrl} target="_blank" rel="noreferrer">
                        Ver en mapa
                        <ExternalLink />
                      </a>
                    </Button>
                  </CardAction>
                )}
              </CardHeader>
              <CardContent>
                {tieneUbicacion && (
                  <MapaUbicacion
                    latitud={reclamo.latitud!}
                    longitud={reclamo.longitud!}
                    alto={180}
                  />
                )}
                {reclamo.direccion && !tieneUbicacion && (
                  <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    {reclamo.direccion}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Card data-tour="detalle-detalles" className="rounded-2xl ring-1 ring-border">
            <CardHeader>
              <SeccionTitulo icon={ListChecks}>Detalles</SeccionTitulo>
            </CardHeader>
            <CardContent className="divide-y px-5 pb-3">
              <DatoFila etiqueta="Barrio" valor={reclamo.barrio ?? "Sin barrio"} />
              <DatoFila etiqueta="Canal" valor={CANAL_LABEL[reclamo.canal]} icono={Radio} />
              <DatoFila etiqueta="Adhesiones" valor={totalAdhesiones} icono={Users} />
              <DatoFila etiqueta="Última actualización" valor={haceCuanto(reclamo.updated_at)} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

export function ReclamoDetallePage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  // RTK Query: the cached detail shows instantly on back-navigation and a
  // background refetch keeps it fresh. `isLoading` is only true the very first
  // time; `isFetching` covers subsequent revalidations without hiding the UI.
  const {
    data: reclamo,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useObtenerReclamoQuery(id, { skip: !id });
  const [adherirMutation, { isLoading: adhiriendo }] = useAdherirMutation();
  const staff = usuario ? esStaff(usuario.rol) : false;
  const mensajeError =
    error && "message" in error && typeof error.message === "string" ? error.message : null;

  async function handleAdherir() {
    try {
      await adherirMutation(id).unwrap();
      toast.success("Adhesión registrada", {
        description: "Gracias por sumarte a este reclamo.",
      });
    } catch (err) {
      const desc =
        err && typeof err === "object" && "message" in err && typeof err.message === "string"
          ? err.message
          : "Error inesperado";
      toast.error("No se pudo adherir", { description: desc });
    }
  }

  if (isLoading && !reclamo) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !reclamo) {
    return <EstadoError mensaje={mensajeError ?? "Reclamo no encontrado"} onReintentar={refetch} />;
  }
  if (!reclamo) {
    return <EstadoError mensaje="Reclamo no encontrado" onReintentar={refetch} />;
  }

  if (staff) {
    return (
      <VistaGestionReclamo
        reclamo={reclamo}
        refrescando={isFetching}
        onRecargar={refetch}
        onVolver={() => navigate(-1)}
      />
    );
  }

  const totalAdhesiones = reclamo.adhesiones_count;
  const esPropio = usuario?.id === reclamo.ciudadano_id;
  const puedeAdherir = !esPropio;

  return (
    <VistaCiudadanoReclamo
      reclamo={reclamo}
      totalAdhesiones={totalAdhesiones}
      esPropio={esPropio}
      puedeAdherir={puedeAdherir}
      adhiriendo={adhiriendo}
      refrescando={isFetching}
      onAdherir={handleAdherir}
      onRecargar={refetch}
      onVolver={() => navigate(-1)}
    />
  );
}
