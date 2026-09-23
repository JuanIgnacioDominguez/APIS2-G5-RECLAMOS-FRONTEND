import { useState } from "react";
import { NavLink as RouterNavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, LogOut, Search } from "lucide-react";

import { LogoMark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { migasPara, navModulo } from "@/config/navigation";
import { useAuth } from "@/auth/AuthContext";
import { esStaff, ROL_LABEL } from "@/auth/roles";
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

export function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const staff = usuario ? esStaff(usuario.rol) : false;
  const migas = migasPara(pathname, staff);
  const items = usuario ? navModulo(usuario.rol) : [];

  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);

  function salir() {
    logout();
    navigate("/login");
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="h-16 justify-center border-b border-sidebar-border">
          <Marca />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Reclamos</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.to)}
                      tooltip={item.label}
                      className="data-[active=true]:bg-primary data-[active=true]:font-medium data-[active=true]:text-primary-foreground data-[active=true]:hover:bg-primary data-[active=true]:hover:text-primary-foreground"
                    >
                      <RouterNavLink to={item.to}>
                        <item.icon />
                        <span>{item.label}</span>
                      </RouterNavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="text-xs text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
          CityPass+ · Reclamos
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-auto gap-2 px-2 py-1.5" aria-label="Cuenta">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {usuario ? iniciales(usuario.nombre) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left leading-tight sm:block">
                    <p className="text-sm font-medium">{usuario?.nombre ?? "Invitado"}</p>
                    <p className="text-xs text-muted-foreground">
                      {usuario ? ROL_LABEL[usuario.rol] : "Sin sesion"}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
                  {usuario?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={salir}>
                  <LogOut />
                  Cerrar sesion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 bg-muted/30 p-4 sm:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
