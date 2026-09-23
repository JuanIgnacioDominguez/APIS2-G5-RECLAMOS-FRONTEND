import { BarChart3, Inbox, List, MapPin, Newspaper, type LucideIcon } from "lucide-react";

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

const COMUNIDAD: NavItem[] = [
  { label: "Reclamos de la ciudad", to: "/feed", icon: Newspaper },
  { label: "Mapa", to: "/mapa", icon: MapPin },
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
    secciones.push({ label: "Analitica", items: [{ label: "Panel", to: "/panel", icon: BarChart3 }] });
  }
  secciones.push({ label: "Comunidad", items: COMUNIDAD });
  return secciones;
}

/** Landing route after login, by role. */
export function homePorRol(rol: Rol): string {
  return rol === Rol.CIUDADANO ? "/reclamos" : "/backoffice";
}

/**
 * Breadcrumb trail for the header, built from the URL alone (no fetch: a
 * claim's id segment is only ever shortened for display, never resolved).
 */
export function migasPara(pathname: string, staff: boolean): Miga[] {
  if (pathname === "/reclamos") {
    return [{ label: staff ? "Todos los reclamos" : "Mis reclamos" }];
  }
  if (pathname === "/reclamos/nuevo") {
    return [{ label: "Reclamos", to: "/reclamos" }, { label: "Nuevo reclamo" }];
  }
  const detalle = /^\/reclamos\/([^/]+)$/.exec(pathname);
  if (detalle) {
    return [{ label: "Reclamos", to: "/reclamos" }, { label: idCorto(detalle[1]) }];
  }
  if (pathname === "/feed") return [{ label: "Reclamos de la ciudad" }];
  if (pathname === "/backoffice") return [{ label: "Bandeja de reclamos" }];
  if (pathname === "/panel") return [{ label: "Panel de metricas" }];
  if (pathname === "/mapa") return [{ label: "Mapa de reclamos" }];
  return [];
}
