import type { Icon } from "@tabler/icons-react";
import {
  IconBell,
  IconBike,
  IconBuildingEstate,
  IconChartHistogram,
  IconHelpCircle,
  IconHome,
  IconInbox,
  IconList,
  IconMasksTheater,
  IconPlus,
  IconSettings,
  IconShieldExclamation,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";

import { Rol } from "@/auth/roles";

export interface NavItem {
  label: string;
  to: string;
  icon: Icon;
  /** null = this module (Grupo 5, Reclamos). A number = the group that owns it. */
  ownerGroup: number | null;
}

/** Platform sections owned by other groups; shown as placeholders for everyone. */
export const OTROS_SERVICIOS: NavItem[] = [
  { label: "Inicio", to: "/inicio", icon: IconHome, ownerGroup: 0 },
  { label: "Movilidad", to: "/movilidad", icon: IconBike, ownerGroup: 3 },
  { label: "Residuos", to: "/residuos", icon: IconTrash, ownerGroup: 4 },
  { label: "Emergencias", to: "/emergencias", icon: IconShieldExclamation, ownerGroup: 6 },
  { label: "Espacios Publicos", to: "/espacios", icon: IconBuildingEstate, ownerGroup: 7 },
  { label: "Cultura y Eventos", to: "/cultura", icon: IconMasksTheater, ownerGroup: 7 },
  { label: "Analitica Urbana", to: "/analitica", icon: IconChartHistogram, ownerGroup: 8 },
];

/** Secondary links at the bottom of the sidebar. */
export const CUENTA: NavItem[] = [
  { label: "Mi cuenta", to: "/cuenta", icon: IconUser, ownerGroup: 2 },
  { label: "Notificaciones", to: "/notificaciones", icon: IconBell, ownerGroup: 0 },
  { label: "Configuracion", to: "/configuracion", icon: IconSettings, ownerGroup: 0 },
  { label: "Ayuda", to: "/ayuda", icon: IconHelpCircle, ownerGroup: 0 },
];

/**
 * Our module's navigation, which differs by role: a citizen manages their own
 * claims, an operator works the backoffice inbox, and an admin also gets the
 * metrics panel.
 */
export function navModulo(rol: Rol): NavItem[] {
  if (rol === Rol.CIUDADANO) {
    return [
      { label: "Mis reclamos", to: "/reclamos", icon: IconList, ownerGroup: null },
      { label: "Nuevo reclamo", to: "/reclamos/nuevo", icon: IconPlus, ownerGroup: null },
    ];
  }
  const items: NavItem[] = [
    { label: "Bandeja", to: "/backoffice", icon: IconInbox, ownerGroup: null },
  ];
  if (rol === Rol.ADMIN) {
    items.push({ label: "Panel", to: "/panel", icon: IconChartHistogram, ownerGroup: null });
  }
  return items;
}

/** Landing route after login, by role. */
export function homePorRol(rol: Rol): string {
  return rol === Rol.CIUDADANO ? "/reclamos" : "/backoffice";
}

/** Human name of the group that owns a not-yet-integrated section. */
export const GRUPO_NOMBRE: Record<number, string> = {
  0: "la plataforma CityPass+",
  2: "el Grupo 2 (Login Federado)",
  3: "el Grupo 3 (Movilidad Urbana)",
  4: "el Grupo 4 (Gestion de Residuos)",
  6: "el Grupo 6 (Emergencias y Seguridad)",
  7: "el Grupo 7 (Espacios Publicos y Cultura)",
  8: "el Grupo 8 (Analitica Urbana e IA)",
};

/** Look up a placeholder section by its route (used by SectionPlaceholder). */
export function navItemPorRuta(ruta: string): NavItem | undefined {
  return [...OTROS_SERVICIOS, ...CUENTA].find((item) => item.to === ruta);
}
