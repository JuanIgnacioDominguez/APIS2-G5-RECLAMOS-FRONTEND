import { AppShell, Group, NavLink, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconBuildingCommunity, IconMessageReport, IconPlus, IconList } from "@tabler/icons-react";
import { NavLink as RouterNavLink, Outlet, useLocation } from "react-router-dom";

const LINKS = [
  { to: "/reclamos", label: "Mis reclamos", icon: IconList },
  { to: "/reclamos/nuevo", label: "Nuevo reclamo", icon: IconPlus },
];

export function AppLayout() {
  const location = useLocation();

  return (
    <AppShell header={{ height: 60 }} navbar={{ width: 260, breakpoint: "sm" }} padding="lg">
      <AppShell.Header bg="azulNoche.9" c="white" withBorder={false}>
        <Group h="100%" px="md" gap="sm">
          <ThemeIcon variant="transparent" c="white" size="lg">
            <IconBuildingCommunity />
          </ThemeIcon>
          <Title order={4} c="white">
            CityPass<span style={{ color: "var(--mantine-color-ambar-5)" }}>+</span>
          </Title>
          <Text c="gray.4" size="sm">
            Reclamos y Participacion Ciudadana
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar bg="azulNoche.9" p="md">
        <Stack gap={4}>
          <Group gap="xs" mb="sm" c="white">
            <IconMessageReport size={20} />
            <Text fw={600}>Reclamos</Text>
          </Group>
          {LINKS.map((link) => {
            const active =
              link.to === "/reclamos"
                ? location.pathname === "/reclamos"
                : location.pathname.startsWith(link.to);
            return (
              <NavLink
                key={link.to}
                component={RouterNavLink}
                to={link.to}
                label={link.label}
                leftSection={<link.icon size={18} />}
                active={active}
                variant="filled"
                color="azulUrbano"
                c="white"
                styles={{ root: { borderRadius: "var(--mantine-radius-md)" } }}
              />
            );
          })}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main bg="gray.0">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
