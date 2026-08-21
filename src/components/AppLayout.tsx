import {
  ActionIcon,
  AppShell,
  Avatar,
  Badge,
  Divider,
  Group,
  Indicator,
  Menu,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { IconBell, IconLogout, IconSearch } from "@tabler/icons-react";
import { NavLink as RouterNavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { Logo } from "@/components/Logo";
import { CUENTA, SERVICIOS, type NavItem } from "@/config/navigation";
import { CitySkyline } from "@/components/CitySkyline";
import { useAuth } from "@/auth/AuthContext";
import { ROL_LABEL } from "@/auth/roles";

function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function SidebarLink({ item, active }: { item: NavItem; active: boolean }) {
  const propio = item.ownerGroup === null;
  return (
    <NavLink
      component={RouterNavLink}
      to={item.to}
      label={item.label}
      leftSection={<item.icon size={19} stroke={1.6} />}
      rightSection={
        propio ? (
          <Badge size="xs" variant="light" color="ambar" radius="sm">
            activo
          </Badge>
        ) : undefined
      }
      active={active}
      variant="filled"
      color="azulUrbano"
      c="gray.3"
      styles={{
        root: { borderRadius: "var(--mantine-radius-md)" },
        label: { fontSize: "var(--mantine-font-size-sm)" },
      }}
    />
  );
}

export function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);

  function salir() {
    logout();
    navigate("/login");
  }

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: 264, breakpoint: "sm" }}
      padding="lg"
      layout="alt"
    >
      <AppShell.Header withBorder>
        <Group h="100%" px="lg" justify="space-between" wrap="nowrap">
          <TextInput
            flex={1}
            maw={440}
            radius="md"
            placeholder="Buscar reclamos, categorias, ubicaciones..."
            leftSection={<IconSearch size={16} />}
          />
          <Group gap="lg" wrap="nowrap">
            <Indicator label="3" size={16} color="rojoEmergencia" offset={4}>
              <ActionIcon variant="subtle" color="gray" size="lg" aria-label="Notificaciones">
                <IconBell size={20} />
              </ActionIcon>
            </Indicator>
            <Menu position="bottom-end" withArrow>
              <Menu.Target>
                <UnstyledButton aria-label="Cuenta">
                  <Group gap="sm" wrap="nowrap">
                    <Avatar color="azulUrbano" radius="xl">
                      {usuario ? iniciales(usuario.nombre) : "?"}
                    </Avatar>
                    <div style={{ lineHeight: 1.15 }}>
                      <Text size="sm" fw={600}>
                        {usuario?.nombre ?? "Invitado"}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {usuario ? ROL_LABEL[usuario.rol] : "Sin sesion"}
                      </Text>
                    </div>
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{usuario?.email}</Menu.Label>
                <Menu.Item leftSection={<IconLogout size={16} />} onClick={salir}>
                  Cerrar sesion
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar bg="azulNoche.9" style={{ border: "none" }}>
        <AppShell.Section p="md">
          <Logo size={34} wordmarkColor="white" />
        </AppShell.Section>

        <AppShell.Section grow component={ScrollArea} px="sm">
          <Text size="xs" c="gray.6" fw={600} tt="uppercase" mb={6} px="xs">
            Servicios
          </Text>
          <Stack gap={4}>
            {SERVICIOS.map((item) => (
              <SidebarLink key={item.to} item={item} active={isActive(item.to)} />
            ))}
          </Stack>

          <Divider my="md" color="azulNoche.7" />

          <Stack gap={4}>
            {CUENTA.map((item) => (
              <SidebarLink key={item.to} item={item} active={isActive(item.to)} />
            ))}
          </Stack>
        </AppShell.Section>

        <AppShell.Section>
          <CitySkyline />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main bg="gray.0">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
