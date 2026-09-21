import type { Icon } from "@tabler/icons-react";
import {
  IconChartHistogram,
  IconInbox,
  IconList,
  IconMapPin,
  IconNews,
  IconPlus,
} from "@tabler/icons-react";

import { Rol } from "@/auth/roles";
import { idCorto } from "@/lib/format";

export interface NavItem {
  label: string;
  to: string;
  icon: Icon;
}

/** One crumb in the header's breadcrumb trail. Omit `to` for the current page. */
export interface Miga {
  label: string;
  to?: string;
}

/**
 * Navigation of the Reclamos module. This frontend is only the claims system,
 * so the menu differs by role: a citizen manages their own claims, an operator
 * works the backoffice inbox, and an admin also gets the metrics panel.
 */
export function navModulo(rol: Rol): NavItem[] {
  if (rol === Rol.CIUDADANO) {
    return [
      { label: "Reclamos de la ciudad", to: "/feed", icon: IconNews },
      { label: "Mis reclamos", to: "/reclamos", icon: IconList },
      { label: "Nuevo reclamo", to: "/reclamos/nuevo", icon: IconPlus },
      { label: "Mapa", to: "/mapa", icon: IconMapPin },
    ];
  }
  const items: NavItem[] = [
    { label: "Bandeja", to: "/backoffice", icon: IconInbox },
    { label: "Reclamos de la ciudad", to: "/feed", icon: IconNews },
    { label: "Todos los reclamos", to: "/reclamos", icon: IconList },
  ];
  if (rol === Rol.ADMIN) {
    items.push({ label: "Panel", to: "/panel", icon: IconChartHistogram });
  }
  items.push({ label: "Mapa", to: "/mapa", icon: IconMapPin });
  return items;
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
