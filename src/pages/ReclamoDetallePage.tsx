import { useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
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
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";

import { cn } from "cn";
import type { HistorialOut, ReclamoDetalle } from "@/api/types";
import { useAdherirMutation, useObtenerReclamoQuery } from "@/store/citypassApi";
import { CanalOrigen, OrigenClasificacion } from "@/domain/enums";
import { ESTADO_HEX, ESTADO_LABEL, ESTADO_TEXT_COLOR } from "@/domain/labels";
import { formatConfianza, formatFecha, haceCuanto, idCorto } from "@/lib/format";
import { EstadoError } from "@/components/EstadoError";
import { useAuth } from "@/auth/AuthContext";
import { esStaff } from "@/auth/roles";
import {
  CategoriaBadge,
  CategoriaLinea,
  EstadoBadge,
  PrioridadBadge,
  PrioridadLinea,
} from "@/features/reclamos/EstadoBadges";
import { GestionarEstado } from "@/features/reclamos/GestionarEstado";
import { ClasificarReclamo } from "@/features/reclamos/ClasificarReclamo";
import { ComentariosReclamo } from "@/features/reclamos/ComentariosReclamo";
import { PosiblesDuplicados } from "@/features/reclamos/PosiblesDuplicados";
import { MapaUbicacion } from "@/features/mapa/MapaUbicacion";
import { ICONO_ESTADO } from "@/features/reclamos/iconos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
}

function VistaGestionReclamo({ reclamo, refrescando, onRecargar }: VistaGestionProps) {
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
        <div className="flex shrink-0 items-center gap-2 xl:justify-end">
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
              onActualizado={onRecargar}
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
              onActualizado={onRecargar}
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
            <ComentariosReclamo
              reclamoId={reclamo.id}
              comentarios={reclamo.comentarios}
              onComentado={onRecargar}
            />
          </div>
        </div>
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
  const [adhesiones, setAdhesiones] = useState<number | null>(null);
  const staff = usuario ? esStaff(usuario.rol) : false;
  const mensajeError =
    error && "message" in error && typeof error.message === "string" ? error.message : null;

  async function handleAdherir() {
    try {
      const res = await adherirMutation(id).unwrap();
      setAdhesiones(res.adhesiones_count);
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
    return <VistaGestionReclamo reclamo={reclamo} refrescando={isFetching} onRecargar={refetch} />;
  }

  const totalAdhesiones = adhesiones ?? reclamo.adhesiones_count;
  const esPropio = usuario?.id === reclamo.ciudadano_id;
  const puedeAdherir = !esPropio;
  const tieneUbicacion = reclamo.latitud !== null && reclamo.longitud !== null;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <Card data-tour="detalle-header" className="py-5">
        <CardContent className="flex flex-wrap items-start justify-between gap-x-6 gap-y-5 px-5 sm:px-6">
          <div className="min-w-0 space-y-2.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="-ml-2 h-7 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Volver
            </Button>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-muted-foreground">
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
                {idCorto(reclamo.id)}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3.5 shrink-0" />
                {formatFecha(reclamo.created_at)}
              </span>
              <span aria-hidden className="text-foreground/30">
                ·
              </span>
              <span>{haceCuanto(reclamo.created_at)}</span>
              {isFetching && (
                <span className="inline-flex items-center gap-1 text-primary">
                  <span aria-hidden className="text-foreground/30">
                    ·
                  </span>
                  <Loader2 className="size-3 animate-spin" />
                  Actualizando
                </span>
              )}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-[1.7rem]">
              {reclamo.titulo}
            </h1>
            {reclamo.descripcion.trim() && (
              <p className="max-w-2xl text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {reclamo.descripcion}
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-end justify-between gap-4 self-stretch">
            <EstadoBadge estado={reclamo.estado} className="h-auto px-3 py-1 text-sm" />
            <div className="flex flex-col items-end gap-2">
              <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1 text-sm font-medium text-foreground/80">
                <CategoriaLinea categoria={reclamo.categoria} />
                <span aria-hidden className="text-foreground/30">
                  |
                </span>
                <PrioridadLinea prioridad={reclamo.prioridad} />
              </div>
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                {reclamo.origen_clasificacion !== OrigenClasificacion.CIUDADANO &&
                  reclamo.confianza_clasificacion !== null && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className="gap-1 border-transparent font-medium"
                          style={{
                            backgroundColor: "color-mix(in oklab, var(--ai) 12%, transparent)",
                            color: "var(--ai)",
                          }}
                        >
                          <Sparkles className="size-3" />
                          {formatConfianza(reclamo.confianza_clasificacion)} de confianza
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        {reclamo.origen_clasificacion === OrigenClasificacion.MODELO
                          ? "Categoría y prioridad sugeridas por el clasificador automático."
                          : "Categoría y/o prioridad corregidas por un operador."}
                      </TooltipContent>
                    </Tooltip>
                  )}
                <Badge
                  variant="outline"
                  className="border-transparent font-medium"
                  style={{
                    backgroundColor: `color-mix(in oklab, ${esPropio ? "var(--ownership-own)" : "var(--ownership-community)"} 12%, transparent)`,
                    color: esPropio ? "var(--ownership-own)" : "var(--ownership-community)",
                  }}
                >
                  {esPropio ? "Mi reclamo" : "Reclamo de la ciudad"}
                </Badge>
                {reclamo.canal === CanalOrigen.EVENTO && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="gap-1 border-dashed text-muted-foreground"
                      >
                        <Zap className="size-3" />
                        Generado automáticamente
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      Este reclamo lo abrió el sistema a partir de un evento de otro módulo
                      (Residuos o Emergencias), no un vecino.
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          <Card data-tour="detalle-adhesion">
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="size-5 text-primary" />
                <span className="font-medium">
                  {totalAdhesiones}{" "}
                  {totalAdhesiones === 1 ? "vecino adherido" : "vecinos adheridos"}
                </span>
              </div>
              {esPropio ? (
                <span className="text-sm text-muted-foreground">Es tu reclamo</span>
              ) : (
                puedeAdherir && (
                  <Button onClick={handleAdherir} disabled={adhiriendo} className="gap-2">
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

          <div data-tour="detalle-comentarios">
            <ComentariosReclamo
              reclamoId={reclamo.id}
              comentarios={reclamo.comentarios}
              onComentado={refetch}
            />
          </div>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto lg:overflow-x-hidden lg:pr-1 lg:pb-2">
          {(tieneUbicacion || reclamo.direccion) && (
            <Card data-tour="detalle-ubicacion" className="overflow-hidden">
              <CardHeader>
                <SeccionTitulo icon={MapPin}>Ubicación</SeccionTitulo>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {tieneUbicacion && (
                  <MapaUbicacion
                    latitud={reclamo.latitud!}
                    longitud={reclamo.longitud!}
                    alto={170}
                  />
                )}
                {reclamo.direccion && (
                  <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 size-4 shrink-0" />
                    <span>
                      {reclamo.direccion}
                      {reclamo.barrio ? `, ${reclamo.barrio}` : ""}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <SeccionTitulo icon={ListChecks}>Detalles</SeccionTitulo>
            </CardHeader>
            <CardContent className="space-y-2">
              <DatoFila etiqueta="Barrio" valor={reclamo.barrio ?? "-"} />
              {reclamo.asignado_a && <DatoFila etiqueta="Asignado a" valor={reclamo.asignado_a} />}
              {reclamo.area_responsable && (
                <DatoFila etiqueta="Área responsable" valor={reclamo.area_responsable} />
              )}
              <Separator className="my-1" />
              <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Radio className="size-3.5" />
                  Canal
                </span>
                <span className="text-right text-sm font-medium capitalize">
                  {reclamo.canal.toLowerCase()}
                </span>
              </div>
              <DatoFila etiqueta="Última actualización" valor={haceCuanto(reclamo.updated_at)} />
            </CardContent>
          </Card>

          <Card data-tour="detalle-trazabilidad">
            <CardHeader>
              <SeccionTitulo icon={History}>Trazabilidad</SeccionTitulo>
            </CardHeader>
            <CardContent>
              <HistorialTimeline historial={reclamo.historial} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
