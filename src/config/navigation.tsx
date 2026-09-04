import type { Icon } from "@tabler/icons-react";
import { IconChartHistogram, IconInbox, IconList, IconMapPin, IconPlus } from "@tabler/icons-react";

import { Rol } from "@/auth/roles";

export interface NavItem {
  label: string;
  to: string;
  icon: Icon;
}

/**
 * Navigation of the Reclamos module. This frontend is only the claims system,
 * so the menu differs by role: a citizen manages their own claims, an operator
 * works the backoffice inbox, and an admin also gets the metrics panel.
 */
export function navModulo(rol: Rol): NavItem[] {
  if (rol === Rol.CIUDADANO) {
    return [
      { label: "Mis reclamos", to: "/reclamos", icon: IconList },
      { label: "Nuevo reclamo", to: "/reclamos/nuevo", icon: IconPlus },
      { label: "Mapa", to: "/mapa", icon: IconMapPin },
    ];
  }
  const items: NavItem[] = [{ label: "Bandeja", to: "/backoffice", icon: IconInbox }];
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
