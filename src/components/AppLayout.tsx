import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { NavLink as RouterNavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  CircleDot,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Loader2,
  LogOut,
  MessageCircle,
  Plus,
  Search,
} from "lucide-react";

import { AyudaFlotante } from "@/features/ayuda/AyudaFlotante";
import { LogoMark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { migasPara, NAV_CUENTA, navModulo, type Miga, type NavItem } from "@/config/navigation";
import {
  citypassApi,
  useBandejaQuery,
  useContarNotificacionesQuery,
  useListarNotificacionesQuery,
  useMarcarNotificacionLeidaMutation,
} from "@/store/citypassApi";
import { esEndpointNoDisponible, REFRESCO_NOTIFICACIONES_MS } from "@/lib/notificaciones";
import type { Notificacion } from "@/api/types";
import { haceCuanto } from "@/lib/format";
import { useAuth } from "@/auth/AuthContext";
import { esStaff, Rol, ROL_LABEL } from "@/auth/roles";
import { useBusquedaReclamos } from "@/features/reclamos/useBusquedaReclamos";
import { EstadoBadge } from "@/features/reclamos/EstadoBadges";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const PRECARGA_RUTAS: Readonly<Partial<Record<string, () => Promise<unknown>>>> = {
  "/mapa": () => import("@/pages/MapaPublicoPage"),
};

function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function Marca() {
  return (
    <div className="flex items-center gap-2 px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
      <LogoMark size={28} />
      <span className="text-lg font-semibold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden">
        CityPass<span className="text-[#e6b566]">+</span>
      </span>
    </div>
  );
}

const REFRESCO_BANDEJA_MS = 45_000;

function usePendientesBandeja(activo: boolean): number | null {
  const { data } = useBandejaQuery(
    { page: 1, size: 1 },
    { skip: !activo, pollingInterval: REFRESCO_BANDEJA_MS, skipPollingIfUnfocused: true },
  );
  return data?.total ?? null;
}

function useNotificacionesNoLeidas(activo: boolean): number {
  const { sinEndpoint } = citypassApi.endpoints.contarNotificaciones.useQueryState(undefined, {
    selectFromResult: ({ error }) => ({ sinEndpoint: esEndpointNoDisponible(error) }),
  });
  const { data } = useContarNotificacionesQuery(undefined, {
    skip: !activo,
    pollingInterval: sinEndpoint ? 0 : REFRESCO_NOTIFICACIONES_MS,
    skipPollingIfUnfocused: true,
  });
  return data?.unread_count ?? 0;
}

const PARAMETROS_PREVIEW_NOTIFICACIONES = { page: 1, size: 3, unread_only: false };

function NotificacionPreviewItem({
  notificacion,
  onAbrir,
}: {
  notificacion: Notificacion;
  onAbrir: () => void;
}) {
  const Icono = notificacion.tipo === "COMENTARIO" ? MessageCircle : CircleDot;

  return (
    <button
      type="button"
      onClick={onAbrir}
      aria-label={`${notificacion.titulo}. ${notificacion.mensaje}. ${
        notificacion.leida ? "Leída" : "No leída"
      }`}
      className={`group flex w-full items-start gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 ${
        notificacion.leida ? "hover:bg-accent" : "bg-primary/[0.04] hover:bg-primary/[0.08]"
      }`}
    >
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-lg ${
          notificacion.leida ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
        }`}
      >
        <Icono className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {notificacion.titulo}
          </span>
          {!notificacion.leida && (
            <span className="size-1.5 shrink-0 rounded-full bg-destructive" aria-hidden />
          )}
        </span>
        <span className="mt-0.5 block line-clamp-2 text-xs leading-4 text-muted-foreground">
          {notificacion.mensaje}
        </span>
        <span className="mt-1 block text-[11px] text-muted-foreground">
          {haceCuanto(notificacion.created_at)}
        </span>
      </span>
    </button>
  );
}

function NotificacionesPopover({ noLeidas }: { noLeidas: number }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [marcarLeida] = useMarcarNotificacionLeidaMutation();
  const { sinEndpoint } = citypassApi.endpoints.listarNotificaciones.useQueryState(
    PARAMETROS_PREVIEW_NOTIFICACIONES,
    {
      selectFromResult: ({ error }) => ({ sinEndpoint: esEndpointNoDisponible(error) }),
    },
  );
  const { data, error, isLoading } = useListarNotificacionesQuery(
    PARAMETROS_PREVIEW_NOTIFICACIONES,
    {
      skip: !open,
      pollingInterval: sinEndpoint ? 0 : REFRESCO_NOTIFICACIONES_MS,
      skipPollingIfUnfocused: true,
    },
  );
  const notificaciones = data?.items ?? [];

  function abrirNotificacion(notificacion: Notificacion): void {
    setOpen(false);
    if (!notificacion.leida) {
      void marcarLeida(notificacion.id).catch(() => undefined);
    }
    navigate(`/reclamos/${notificacion.reclamo_id}`);
  }

  function abrirBandeja(): void {
    setOpen(false);
    navigate("/notificaciones");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={noLeidas > 0 ? `Notificaciones: ${noLeidas} sin leer` : "Notificaciones"}
          className="relative"
        >
          <Bell />
          {noLeidas > 0 && (
            <span
              data-testid="notificaciones-no-leidas"
              aria-hidden
              className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive ring-2 ring-background"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        aria-label="Notificaciones recientes"
        data-testid="notificaciones-preview"
        className="w-80 max-w-[calc(100vw-2rem)] gap-0 p-0"
      >
        <PopoverHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <PopoverTitle className="text-sm font-semibold">Notificaciones</PopoverTitle>
            {noLeidas > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {noLeidas} sin leer
              </span>
            )}
          </div>
          <PopoverDescription className="mt-1 text-xs">Actividad reciente</PopoverDescription>
        </PopoverHeader>
        <div className="max-h-80 overflow-y-auto p-2" aria-live="polite">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-3 py-6 text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Cargando...
            </div>
          ) : error ? (
            <p className="px-3 py-6 text-center text-xs leading-5 text-muted-foreground">
              {sinEndpoint
                ? "Las notificaciones no están disponibles por ahora."
                : "No pudimos cargar tus notificaciones."}
            </p>
          ) : notificaciones.length === 0 ? (
            <div className="px-3 py-6 text-center">
              <p className="text-sm font-medium text-foreground">Todavía no hay avisos</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Te avisaremos cuando tengas novedades sobre tus reclamos.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {notificaciones.map((notificacion) => (
                <NotificacionPreviewItem
                  key={notificacion.id}
                  notificacion={notificacion}
                  onAbrir={() => abrirNotificacion(notificacion)}
                />
              ))}
            </div>
          )}
        </div>
        <div className="border-t p-2">
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-center gap-2"
            onClick={abrirBandeja}
          >
            Ver todas
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function BusquedaGlobal() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState("");
  const { resultados, buscando, activa } = useBusquedaReclamos(texto);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const paginas = useMemo(() => {
    if (!usuario) return [] as NavItem[];
    const items = [...navModulo(usuario.rol).flatMap((s) => s.items), ...NAV_CUENTA];
    const vistos = new Set<string>();
    return items.filter((i) => (vistos.has(i.to) ? false : (vistos.add(i.to), true)));
  }, [usuario]);

  const q = texto.trim().toLowerCase();
  const paginasFiltradas = q ? paginas.filter((p) => p.label.toLowerCase().includes(q)) : paginas;
  const esCiudadano = usuario?.rol === Rol.CIUDADANO;
  const mostrarNuevo = esCiudadano && (q === "" || "nuevo reclamo crear".includes(q));
  const cortoParaBuscar = q.length > 0 && !activa;
  const sinNada =
    paginasFiltradas.length === 0 &&
    !mostrarNuevo &&
    !cortoParaBuscar &&
    (!activa || (!buscando && resultados.length === 0));

  function irA(to: string) {
    setOpen(false);
    setTexto("");
    navigate(to);
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Buscar reclamos"
        onClick={() => setOpen(true)}
      >
        <Search />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <CommandInput
            value={texto}
            onValueChange={setTexto}
            placeholder="Buscar reclamos o ir a una pagina..."
          />
          <CommandList>
            {sinNada && <CommandEmpty>Sin resultados.</CommandEmpty>}

            {(paginasFiltradas.length > 0 || mostrarNuevo) && (
              <CommandGroup heading="Ir a">
                {mostrarNuevo && (
                  <CommandItem value="accion-nuevo" onSelect={() => irA("/reclamos/nuevo")}>
                    <Plus />
                    <span className="flex-1">Nuevo reclamo</span>
                  </CommandItem>
                )}
                {paginasFiltradas.map((p) => (
                  <CommandItem key={p.to} value={`pagina-${p.to}`} onSelect={() => irA(p.to)}>
                    <p.icon />
                    <span className="flex-1">{p.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {cortoParaBuscar && (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                Escribi al menos 2 letras para buscar reclamos.
              </p>
            )}

            {activa && (
              <CommandGroup heading="Reclamos">
                {buscando && <p className="px-3 py-2 text-sm text-muted-foreground">Buscando...</p>}
                {!buscando && resultados.length === 0 && (
                  <p className="px-3 py-2 text-sm text-muted-foreground">Sin reclamos.</p>
                )}
                {resultados.map((r) => (
                  <CommandItem key={r.id} value={r.id} onSelect={() => irA(`/reclamos/${r.id}`)}>
                    <span className="flex-1 truncate">{r.titulo}</span>
                    <EstadoBadge estado={r.estado} />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}

function ItemNav({
  item,
  activo,
  conteo,
}: {
  item: NavItem;
  activo: boolean;
  conteo: number | null;
}) {
  const { setOpenMobile } = useSidebar();
  const tieneConteo = !!conteo;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={activo}
        tooltip={item.label}
        className="h-11 gap-3 rounded-lg px-3.5 text-sm font-medium text-sidebar-foreground/75 hover:bg-sidebar-item-hover hover:text-sidebar-item-active-foreground data-[active=true]:bg-sidebar-item-active data-[active=true]:text-sidebar-item-active-foreground data-[active=true]:ring-1 data-[active=true]:ring-inset data-[active=true]:ring-sidebar-item-active-ring data-[active=true]:hover:bg-sidebar-item-active [&>svg]:size-5 [&>svg]:text-sidebar-foreground/55 hover:[&>svg]:text-sidebar-item-active-foreground data-[active=true]:[&>svg]:text-sidebar-item-active-icon group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:!rounded-lg group-data-[collapsible=icon]:!px-0 group-data-[collapsible=icon]:[&>svg]:size-5"
      >
        <RouterNavLink
          to={item.to}
          onClick={() => setOpenMobile(false)}
          onFocus={() => void PRECARGA_RUTAS[item.to]?.()}
          onPointerEnter={() => void PRECARGA_RUTAS[item.to]?.()}
        >
          <item.icon />
          <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
        </RouterNavLink>
      </SidebarMenuButton>
      {tieneConteo && (
        <SidebarMenuBadge className="top-1/2! mr-1 -translate-y-1/2 rounded-full bg-sidebar-badge-bg text-[11px] font-semibold text-sidebar-badge-fg group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:top-0! group-data-[collapsible=icon]:mr-0 group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:min-w-4 group-data-[collapsible=icon]:translate-y-0 group-data-[collapsible=icon]:text-[10px]">
          {conteo > 99 ? "99+" : conteo}
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );
}

function NavUser() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  function salir() {
    logout();
    navigate("/login");
  }

  if (!usuario) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          aria-label="Cuenta"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!p-0"
        >
          <Avatar className="size-8 rounded-lg">
            <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
              {iniciales(usuario.nombre)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-medium">{usuario.nombre}</span>
            <span className="truncate text-xs text-sidebar-foreground/60">
              {ROL_LABEL[usuario.rol]}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
        side="top"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
          {usuario.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={salir}>
          <LogOut />
          Cerrar sesion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ManijaSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const contraido = state === "collapsed";
  const Icono = contraido ? ChevronRight : ChevronLeft;
  const nudge = contraido ? "group-hover:translate-x-0.5" : "group-hover:-translate-x-0.5";
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label={contraido ? "Expandir barra lateral" : "Contraer barra lateral"}
      title={contraido ? "Expandir" : "Contraer"}
      className="group absolute top-1/2 right-0 z-20 hidden h-28 w-4 -translate-y-1/2 translate-x-full items-center justify-center rounded-r-xl bg-sidebar text-sidebar-foreground/70 shadow-popover ring-1 ring-sidebar-border transition-all hover:w-5 hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none md:flex"
    >
      <Icono className={`size-3.5 transition-transform duration-200 ${nudge}`} strokeWidth={2.5} />
    </button>
  );
}

function CerrarMenuAlNavegar() {
  const { key } = useLocation();
  const { setOpenMobile } = useSidebar();
  useEffect(() => setOpenMobile(false), [key, setOpenMobile]);
  return null;
}

export function AppLayout() {
  const location = useLocation();
  const { pathname } = location;
  const esMapa = /^\/mapa\/?$/.test(pathname);
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const staff = usuario ? esStaff(usuario.rol) : false;
  const origenState = (location.state as { origen?: Miga } | null)?.origen;
  const migas = migasPara(pathname, staff, origenState);
  const secciones = usuario ? navModulo(usuario.rol) : [];
  const pendientes = usePendientesBandeja(staff);
  const notificacionesNoLeidas = useNotificacionesNoLeidas(usuario !== null);

  const enDetalle = /^\/reclamos\/[^/]+$/.test(pathname) && pathname !== "/reclamos/nuevo";
  const rutaActiva = enDetalle ? (origenState?.to ?? (staff ? "/reclamos" : "/feed")) : pathname;
  const isActive = (to: string) => rutaActiva === to || rutaActiva.startsWith(`${to}/`);

  return (
    <SidebarProvider style={{ "--sidebar-width-icon": "4.5rem" } as CSSProperties}>
      <CerrarMenuAlNavegar />
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border p-3">
          <Marca />
        </SidebarHeader>
        <SidebarContent className="gap-0 px-2 py-3">
          {usuario?.rol === Rol.CIUDADANO && (
            <SidebarGroup className="pt-0">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Nuevo reclamo"
                    onClick={() => navigate("/reclamos/nuevo")}
                    className="h-11 justify-center gap-2 rounded-lg bg-primary px-3.5 font-semibold text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_1px_3px_rgba(0,0,0,0.35)] transition-colors hover:bg-primary/85 hover:text-primary-foreground active:bg-primary/75 active:text-primary-foreground group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:!rounded-lg group-data-[collapsible=icon]:!px-0"
                  >
                    <Plus strokeWidth={2.5} />
                    <span className="group-data-[collapsible=icon]:hidden">Nuevo reclamo</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          )}
          {secciones.map((seccion) => (
            <SidebarGroup key={seccion.label}>
              <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider text-sidebar-foreground/45 uppercase">
                {seccion.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {seccion.items.map((item) => (
                    <ItemNav
                      key={item.to}
                      item={item}
                      activo={isActive(item.to)}
                      conteo={item.contador ? pendientes : null}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
          <SidebarGroup className="mt-auto border-t border-sidebar-border pt-3">
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {NAV_CUENTA.map((item) => (
                  <ItemNav key={item.to} item={item} activo={isActive(item.to)} conteo={null} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <NavUser />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <ManijaSidebar />
      </Sidebar>

      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-t-2 border-b border-t-primary bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <SidebarTrigger aria-label="Abrir o cerrar menú" className="size-11 shrink-0 md:size-8" />
          <span className="min-w-0 truncate font-semibold md:hidden">CityPass+</span>
          <Separator orientation="vertical" className="h-6" />
          <Breadcrumb className="hidden md:block">
            <BreadcrumbList>
              {migas.map((miga, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  {i > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {miga.to ? (
                      <BreadcrumbLink onClick={() => navigate(miga.to!)} className="cursor-pointer">
                        {miga.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{miga.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex-1" />

          <div className="flex items-center gap-1">
            <BusquedaGlobal />
            <ThemeToggle />
            <NotificacionesPopover noLeidas={notificacionesNoLeidas} />
          </div>
        </header>

        <main
          className={
            esMapa
              ? "min-w-0 flex-1 bg-muted/40 p-0 dark:bg-background"
              : "citypass-content min-w-0 flex-1 bg-muted/40 p-4 dark:bg-background sm:p-6"
          }
        >
          {esMapa ? (
            <Outlet />
          ) : (
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          )}
        </main>
        <AyudaFlotante />
      </SidebarInset>
    </SidebarProvider>
  );
}
