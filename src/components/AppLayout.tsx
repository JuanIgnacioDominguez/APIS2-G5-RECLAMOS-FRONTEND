import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { NavLink as RouterNavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  LogOut,
  Plus,
  Search,
} from "lucide-react";

import { bandeja } from "@/api/reclamos";
import { LogoMark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { migasPara, NAV_CUENTA, navModulo, type Miga, type NavItem } from "@/config/navigation";
import { useAsync } from "@/hooks/useAsync";
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

/** Live count of pending claims (RECIBIDO/EN_REVISION), for the Bandeja badge. */
function usePendientesBandeja(activo: boolean): number | null {
  const { data, reload } = useAsync(
    () => (activo ? bandeja(1, 1) : Promise.resolve(null)),
    [activo],
  );
  useEffect(() => {
    if (!activo) return;
    const id = setInterval(reload, REFRESCO_BANDEJA_MS);
    return () => clearInterval(id);
  }, [activo, reload]);
  return data?.total ?? null;
}

/**
 * Spotlight-style command palette opened from the header search icon (or with
 * Ctrl/Cmd-K): it guides the user around the app (pages and quick actions) and
 * searches claims by title, all in one place.
 */
function BusquedaGlobal() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState("");
  const { resultados, buscando, activa } = useBusquedaReclamos(texto);

  // Ctrl/Cmd-K toggles the palette from anywhere in the app.
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

  // Every page the current role can reach, de-duplicated by route.
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

/** One sidebar link: 44px row, soft hover, translucent blue selected state. */
function ItemNav({
  item,
  activo,
  conteo,
}: {
  item: NavItem;
  activo: boolean;
  conteo: number | null;
}) {
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

/** Account menu in the sidebar footer (shadcn's stock `NavUser` pattern). */
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

/** Collapse toggle rendered as a sidebar-colored folder-divider tab on the right
 * edge: a tall raised flap with a soft shadow and only its outer corners rounded,
 * so it reads as a bookmark/separator. On hover the chevron nudges toward where
 * it points; it flips with the collapsed/expanded state. */
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

  // On a claim's detail page the URL always lives under "/reclamos", so a plain
  // prefix match would light up "Mis reclamos" even for a claim opened from the
  // feed or the map. Highlight instead the section the user actually came from
  // (its breadcrumb parent), falling back to the same default as the breadcrumb.
  const enDetalle = /^\/reclamos\/[^/]+$/.test(pathname) && pathname !== "/reclamos/nuevo";
  const rutaActiva = enDetalle ? (origenState?.to ?? (staff ? "/reclamos" : "/feed")) : pathname;
  const isActive = (to: string) => rutaActiva === to || rutaActiva.startsWith(`${to}/`);

  return (
    <SidebarProvider style={{ "--sidebar-width-icon": "4.5rem" } as CSSProperties}>
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

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-t-2 border-b border-t-primary bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <SidebarTrigger />
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Notificaciones">
                  <Bell />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                <p className="px-2 pb-2 text-sm text-muted-foreground">
                  Sin novedades por el momento.
                </p>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main
          className={
            esMapa
              ? "flex-1 bg-muted/40 p-0 dark:bg-background"
              : "flex-1 bg-muted/40 p-4 dark:bg-background sm:p-6"
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
      </SidebarInset>
    </SidebarProvider>
  );
}
