import {
  BarChart3,
  Bell,
  CircleHelp,
  Inbox,
  LayoutDashboard,
  List,
  MapPin,
  Newspaper,
  Settings,
  User,
  type LucideIcon,
} from "lucide-react";

import { Rol } from "@/auth/roles";
import { idCorto } from "@/lib/format";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  contador?: boolean;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export interface Miga {
  label: string;
  to?: string;
}

const MAPA: NavItem = { label: "Mapa", to: "/mapa", icon: MapPin };

const COMUNIDAD: NavItem[] = [
  { label: "Reclamos de la ciudad", to: "/feed", icon: Newspaper },
  MAPA,
];

export const NAV_CUENTA: NavItem[] = [
  { label: "Mi cuenta", to: "/cuenta", icon: User },
  { label: "Notificaciones", to: "/notificaciones", icon: Bell },
  { label: "Configuracion", to: "/configuracion", icon: Settings },
  { label: "Ayuda", to: "/ayuda", icon: CircleHelp },
];

export function navModulo(rol: Rol): NavSection[] {
  if (rol === Rol.CIUDADANO) {
    return [
      { label: "Mis reclamos", items: [{ label: "Mis reclamos", to: "/reclamos", icon: List }] },
      { label: "Comunidad", items: COMUNIDAD },
    ];
  }

  const secciones: NavSection[] = [
    {
      label: "Gestion",
      items: [
        { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
        { label: "Bandeja", to: "/backoffice", icon: Inbox, contador: true },
        { label: "Todos los reclamos", to: "/reclamos", icon: List },
      ],
    },
  ];
  if (rol === Rol.ADMIN) {
    secciones.push({
      label: "Analitica",
      items: [{ label: "Panel", to: "/panel", icon: BarChart3 }],
    });
  }
  secciones.push({ label: "Comunidad", items: [MAPA] });
  return secciones;
}

export function homePorRol(rol: Rol): string {
  return rol === Rol.CIUDADANO ? "/reclamos" : "/backoffice";
}

export function migasPara(pathname: string, staff: boolean, origen?: Miga): Miga[] {
  if (pathname === "/reclamos") {
    return [{ label: staff ? "Todos los reclamos" : "Mis reclamos" }];
  }
  if (pathname === "/reclamos/nuevo") {
    return [{ label: "Reclamos", to: "/reclamos" }, { label: "Nuevo reclamo" }];
  }
  const detalle = /^\/reclamos\/([^/]+)$/.exec(pathname);
  if (detalle) {
    const padre = origen ?? {
      label: staff ? "Todos los reclamos" : "Reclamos de la ciudad",
      to: staff ? "/reclamos" : "/feed",
    };
    return [padre, { label: idCorto(detalle[1]) }];
  }
  if (pathname === "/feed") return [{ label: "Reclamos de la ciudad" }];
  if (pathname === "/dashboard") return [{ label: "Dashboard" }];
  if (pathname === "/backoffice") return [{ label: "Bandeja de reclamos" }];
  if (pathname === "/panel") return [{ label: "Panel de metricas" }];
  if (pathname === "/mapa") return [{ label: "Mapa de reclamos" }];
  const personal = NAV_CUENTA.find((i) => i.to === pathname);
  if (personal) return [{ label: personal.label }];
  return [];
}
