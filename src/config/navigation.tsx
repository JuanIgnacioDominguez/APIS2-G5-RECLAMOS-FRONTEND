import {
  BarChart3,
  Bell,
  CircleHelp,
  Inbox,
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
  /** Marks the item whose sidebar badge shows a live pending count (only "/backoffice" today). */
  contador?: boolean;
}

/** A labeled group of nav items in the sidebar. */
export interface NavSection {
  label: string;
  items: NavItem[];
}

/** One crumb in the header's breadcrumb trail. Omit `to` for the current page. */
export interface Miga {
  label: string;
  to?: string;
}

const MAPA: NavItem = { label: "Mapa", to: "/mapa", icon: MapPin };

// Citizens get the public feed plus the map. Staff already see every claim in
// "Todos los reclamos", so their Comunidad section is just the map.
const COMUNIDAD: NavItem[] = [
  { label: "Reclamos de la ciudad", to: "/feed", icon: Newspaper },
  MAPA,
];

/** Personal section pinned to the bottom of the sidebar, same for every role. */
export const NAV_CUENTA: NavItem[] = [
  { label: "Mi cuenta", to: "/cuenta", icon: User },
  { label: "Notificaciones", to: "/notificaciones", icon: Bell },
  { label: "Configuracion", to: "/configuracion", icon: Settings },
  { label: "Ayuda", to: "/ayuda", icon: CircleHelp },
];

/**
 * Navigation of the Reclamos module, grouped into labeled sidebar sections.
 * This frontend is only the claims system, so the menu differs by role: a
 * citizen manages their own claims, an operator works the backoffice inbox,
 * and an admin also gets the metrics panel.
 */
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

/** Landing route after login, by role. */
export function homePorRol(rol: Rol): string {
  return rol === Rol.CIUDADANO ? "/reclamos" : "/backoffice";
}

/**
 * Breadcrumb trail for the header, built from the URL (no fetch: a claim's id
 * segment is only ever shortened for display, never resolved).
 *
 * `origen` is the parent crumb for a claim's detail page. It comes from
 * `location.state.origen`, set by whoever linked into the detail (see
 * `ReclamoCard`), so a claim opened from "Reclamos de la ciudad" breadcrumbs
 * back to the feed instead of always landing on "Mis reclamos" / "Todos los
 * reclamos" - the list the viewer may not have come from, and where a claim
 * that is not theirs will not even appear.
 */
export function migasPara(pathname: string, staff: boolean, origen?: Miga): Miga[] {
  if (pathname === "/reclamos") {
    return [{ label: staff ? "Todos los reclamos" : "Mis reclamos" }];
  }
  if (pathname === "/reclamos/nuevo") {
    return [{ label: "Reclamos", to: "/reclamos" }, { label: "Nuevo reclamo" }];
  }
  const detalle = /^\/reclamos\/([^/]+)$/.exec(pathname);
  if (detalle) {
    // Without an explicit origin we cannot tell whose claim this is, so a
    // citizen falls back to "Reclamos de la ciudad" (which lists every claim)
    // instead of "Mis reclamos", where a claim that is not theirs never shows.
    // Staff still fall back to "Todos los reclamos", which lists all of them.
    const padre = origen ?? {
      label: staff ? "Todos los reclamos" : "Reclamos de la ciudad",
      to: staff ? "/reclamos" : "/feed",
    };
    return [padre, { label: idCorto(detalle[1]) }];
  }
  if (pathname === "/feed") return [{ label: "Reclamos de la ciudad" }];
  if (pathname === "/backoffice") return [{ label: "Bandeja de reclamos" }];
  if (pathname === "/panel") return [{ label: "Panel de metricas" }];
  if (pathname === "/mapa") return [{ label: "Mapa de reclamos" }];
  const personal = NAV_CUENTA.find((i) => i.to === pathname);
  if (personal) return [{ label: personal.label }];
  return [];
}
