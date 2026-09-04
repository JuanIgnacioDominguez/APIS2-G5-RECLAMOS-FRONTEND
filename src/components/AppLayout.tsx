import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Burger,
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
import { useDisclosure } from "@mantine/hooks";
import { IconBell, IconLogout, IconSearch } from "@tabler/icons-react";
import { NavLink as RouterNavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { Logo } from "@/components/Logo";
import { navModulo, type NavItem } from "@/config/navigation";
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

function SidebarLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <NavLink
      component={RouterNavLink}
      to={item.to}
      label={item.label}
      onClick={onNavigate}
      leftSection={<item.icon size={19} stroke={1.6} />}
      active={active}
      variant="filled"
      color="azulUrbano"
      c="gray.3"
      styles={{
        root: {
          borderRadius: "var(--mantine-radius-md)",
          transition: "background-color 150ms ease",
        },
        label: { fontSize: "var(--mantine-font-size-sm)" },
      }}
    />
  );
}

export function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);

  function salir() {
    logout();
    navigate("/login");
  }

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        width: 264,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="lg"
    >
      <AppShell.Header withBorder>
        <Group h="100%" px="lg" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
            <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
            <TextInput
              w={{ base: 0, xs: 220, md: 360 }}
              radius="md"
              placeholder="Buscar reclamos..."
              leftSection={<IconSearch size={16} />}
              visibleFrom="xs"
            />
          </Group>
          <Group gap="lg" wrap="nowrap">
            <Indicator label="3" size={16} color="rojoEmergencia" offset={4}>
              <ActionIcon variant="subtle" color="gray" size="lg" aria-label="Notificaciones">
                <IconBell size={20} />
              </ActionIcon>
            </Indicator>
            <Menu position="bottom-end" withArrow shadow="md">
              <Menu.Target>
                <UnstyledButton aria-label="Cuenta" style={{ borderRadius: 8 }}>
                  <Group gap="sm" wrap="nowrap">
                    <Avatar color="azulUrbano" radius="xl">
                      {usuario ? iniciales(usuario.nombre) : "?"}
                    </Avatar>
                    <Box style={{ lineHeight: 1.15 }} visibleFrom="sm">
                      <Text size="sm" fw={600}>
                        {usuario?.nombre ?? "Invitado"}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {usuario ? ROL_LABEL[usuario.rol] : "Sin sesion"}
                      </Text>
                    </Box>
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
            Reclamos
          </Text>
          <Stack gap={4}>
            {(usuario ? navModulo(usuario.rol) : []).map((item) => (
              <SidebarLink
                key={item.to}
                item={item}
                active={isActive(item.to)}
                onNavigate={closeMobile}
              />
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
