import {
  Bell,
  CheckCheck,
  ChevronRight,
  CircleDot,
  Inbox,
  Loader2,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import type { Notificacion } from "@/api/types";
import { EstadoVacio } from "@/components/EstadoVacio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "cn";
import { formatFecha, haceCuanto } from "@/lib/format";
import { esEndpointNoDisponible, REFRESCO_NOTIFICACIONES_MS } from "@/lib/notificaciones";
import {
  citypassApi,
  useListarNotificacionesQuery,
  useMarcarNotificacionLeidaMutation,
  useMarcarTodasNotificacionesLeidasMutation,
} from "@/store/citypassApi";

const PARAMETROS_NOTIFICACIONES = { page: 1, size: 50, unread_only: false };

export function NotificacionItem({
  notificacion,
  onAbrir,
}: {
  notificacion: Notificacion;
  onAbrir: () => void;
}) {
  const Icono =
    notificacion.tipo === "COMENTARIO"
      ? MessageCircle
      : notificacion.tipo === "NUEVO_RECLAMO"
        ? Inbox
        : CircleDot;
  const tipoLabel =
    notificacion.tipo === "COMENTARIO"
      ? "Comentario"
      : notificacion.tipo === "NUEVO_RECLAMO"
        ? "Nuevo reclamo"
        : "Estado";

  return (
    <Card
      data-testid="notificacion-item"
      className={cn(
        "group overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md",
        !notificacion.leida && "border-primary/30 bg-primary/[0.04]",
      )}
    >
      <button
        type="button"
        onClick={onAbrir}
        aria-label={`${notificacion.titulo}. ${notificacion.mensaje}. ${notificacion.leida ? "Leída" : "No leída"}`}
        className="flex w-full items-start gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 sm:p-5"
      >
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-xl transition-colors",
            notificacion.leida
              ? "bg-muted text-muted-foreground group-hover:bg-muted/80"
              : "bg-primary/10 text-primary",
          )}
        >
          <Icono className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-foreground">{notificacion.titulo}</span>
            <Badge variant="outline" className="text-[10px]">
              {tipoLabel}
            </Badge>
            {!notificacion.leida && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                Nueva
              </span>
            )}
          </span>
          <span className="mt-1 block line-clamp-2 text-sm leading-5 text-muted-foreground">
            {notificacion.mensaje}
          </span>
          <span className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{haceCuanto(notificacion.created_at)}</span>
            <span aria-hidden>·</span>
            <span>{formatFecha(notificacion.created_at)}</span>
          </span>
        </span>
        <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </button>
    </Card>
  );
}

export function NotificacionesPage() {
  const navigate = useNavigate();
  const { sinEndpoint } = citypassApi.endpoints.listarNotificaciones.useQueryState(
    PARAMETROS_NOTIFICACIONES,
    {
      selectFromResult: ({ error }) => ({ sinEndpoint: esEndpointNoDisponible(error) }),
    },
  );
  const { data, error, isFetching, isLoading, refetch } = useListarNotificacionesQuery(
    PARAMETROS_NOTIFICACIONES,
    { pollingInterval: sinEndpoint ? 0 : REFRESCO_NOTIFICACIONES_MS, skipPollingIfUnfocused: true },
  );
  const [marcarNotificacionLeida] = useMarcarNotificacionLeidaMutation();
  const [marcarTodas, { isLoading: marcandoTodas }] = useMarcarTodasNotificacionesLeidasMutation();

  const notificaciones = data?.items ?? [];
  const noLeidas = data?.unread_count ?? 0;

  async function abrirNotificacion(notificacion: Notificacion): Promise<void> {
    if (!notificacion.leida) {
      try {
        await marcarNotificacionLeida(notificacion.id).unwrap();
      } catch {
        toast.error("No se pudo marcar la notificación como leída");
      }
    }
    navigate(`/reclamos/${notificacion.reclamo_id}`);
  }

  async function marcarTodasComoLeidas(): Promise<void> {
    try {
      await marcarTodas().unwrap();
      toast.success("Notificaciones marcadas como leídas");
    } catch {
      toast.error("No se pudieron marcar las notificaciones como leídas");
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-accent via-card to-card px-5 py-6 shadow-sm sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -top-20 -right-10 size-56 rounded-full border border-primary/10 bg-primary/5" />
        <div className="pointer-events-none absolute -right-4 -bottom-24 size-48 rounded-full border border-chart-2/10" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Bell className="size-6" />
            </span>
            <div>
              <p className="text-sm font-semibold text-primary">Centro de avisos</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                Notificaciones
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Seguí los cambios de estado y los comentarios relacionados con tus reclamos.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-64">
            <div className="rounded-xl border bg-background/70 px-4 py-3">
              <p className="text-2xl font-bold tabular-nums">{noLeidas}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">sin leer</p>
            </div>
            <div className="rounded-xl border bg-background/70 px-4 py-3">
              <p className="text-2xl font-bold tabular-nums">{notificaciones.length}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">en tu bandeja</p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Actividad reciente</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Las notificaciones no leídas quedan marcadas hasta que las abras.
          </p>
        </div>
        {noLeidas > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={marcarTodasComoLeidas}
            disabled={marcandoTodas}
            className="w-fit gap-2"
          >
            {marcandoTodas ? <Loader2 className="size-4 animate-spin" /> : <CheckCheck />}
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            Cargando notificaciones...
          </div>
        </Card>
      ) : !error && notificaciones.length === 0 ? (
        <Card data-tour="notif-lista">
          <EstadoVacio
            icono={Bell}
            titulo="Sin novedades"
            mensaje="Cuando un reclamo cambie de estado o reciba una respuesta oficial, lo vas a ver acá."
          />
        </Card>
      ) : error ? (
        <Card>
          <EstadoVacio
            icono={RefreshCw}
            titulo={
              sinEndpoint ? "Notificaciones no disponibles" : "No pudimos cargar tus notificaciones"
            }
            mensaje={
              sinEndpoint
                ? "El servicio de notificaciones todavía no está disponible. Podés volver a intentarlo más tarde."
                : "Revisa la conexión e intenta nuevamente."
            }
          >
            <Button type="button" variant="outline" onClick={refetch} className="gap-2">
              <RefreshCw className="size-4" />
              Reintentar
            </Button>
          </EstadoVacio>
        </Card>
      ) : (
        <div className="flex flex-col gap-3" data-tour="notif-lista" aria-live="polite">
          {isFetching && <p className="text-xs text-muted-foreground">Actualizando...</p>}
          {notificaciones.map((notificacion) => (
            <NotificacionItem
              key={notificacion.id}
              notificacion={notificacion}
              onAbrir={() => abrirNotificacion(notificacion)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
