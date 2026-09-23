import { useEffect, useState } from "react";
import { NavLink as RouterNavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronsUpDown, LogOut, Plus, Search } from "lucide-react";

import { bandeja } from "@/api/reclamos";
import { LogoMark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { migasPara, navModulo, type Miga } from "@/config/navigation";
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
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function Marca() {
  return (
    <div className="flex items-center gap-2 px-1">
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

/** Command palette (Cmd/Ctrl-K style) to jump to a claim by title. */
function BusquedaGlobal() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState("");
  const { resultados, buscando, activa } = useBusquedaReclamos(texto);

  function ir(id: string) {
    setOpen(false);
    setTexto("");
    navigate(`/reclamos/${id}`);
  }

  return (
    <>
      <Button
        variant="outline"
        className="w-full max-w-sm justify-start gap-2 text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        Buscar reclamos...
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <CommandInput
            value={texto}
            onValueChange={setTexto}
            placeholder="Buscar reclamos por titulo..."
          />
          <CommandList>
            {!activa && <CommandEmpty>Escribi al menos 2 letras para buscar.</CommandEmpty>}
            {activa && buscando && <p className="p-4 text-sm text-muted-foreground">Buscando...</p>}
            {activa && !buscando && resultados.length === 0 && (
              <CommandEmpty>Sin resultados.</CommandEmpty>
            )}
            {resultados.length > 0 && (
              <CommandGroup heading="Reclamos">
                {resultados.map((r) => (
                  <CommandItem key={r.id} value={r.id} onSelect={() => ir(r.id)}>
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
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="size-8 rounded-lg">
            <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
              {iniciales(usuario.nombre)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{usuario.nombre}</span>
            <span className="truncate text-xs text-sidebar-foreground/60">
              {ROL_LABEL[usuario.rol]}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
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

export function AppLayout() {
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const staff = usuario ? esStaff(usuario.rol) : false;
  const origenState = (location.state as { origen?: Miga } | null)?.origen;
  const migas = migasPara(pathname, staff, origenState);
  const secciones = usuario ? navModulo(usuario.rol) : [];
  const pendientes = usePendientesBandeja(staff);

  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Marca />
          {usuario?.rol === Rol.CIUDADANO && (
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Nuevo reclamo"
                  onClick={() => navigate("/reclamos/nuevo")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                >
                  <Plus />
                  <span>Nuevo reclamo</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          )}
        </SidebarHeader>
        <SidebarContent>
          {secciones.map((seccion) => (
            <SidebarGroup key={seccion.label}>
              <SidebarGroupLabel className="text-[11px] tracking-wider text-sidebar-foreground/50 uppercase">
                {seccion.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {seccion.items.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.to)}
                        tooltip={item.label}
                        className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:hover:bg-sidebar-primary"
                      >
                        <RouterNavLink to={item.to}>
                          <item.icon />
                          <span>{item.label}</span>
                        </RouterNavLink>
                      </SidebarMenuButton>
                      {item.contador && !!pendientes && (
                        <SidebarMenuBadge className="bg-primary text-primary-foreground">
                          {pendientes}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <NavUser />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
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

          <div className="flex flex-1 justify-center px-2">
            <BusquedaGlobal />
          </div>

          <div className="flex items-center gap-1">
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

        <main className="flex-1 bg-muted/40 p-4 sm:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
