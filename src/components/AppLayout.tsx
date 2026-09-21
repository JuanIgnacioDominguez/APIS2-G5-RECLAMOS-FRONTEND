import { useState } from "react";
import {
  ActionIcon,
  Anchor,
  AppShell,
  Avatar,
  Badge,
  Box,
  Breadcrumbs,
  Burger,
  Combobox,
  Divider,
  Group,
  Loader,
  Menu,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
  useCombobox,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  IconBellOff,
  IconChevronsLeft,
  IconChevronsRight,
  IconLogout,
  IconSearch,
} from "@tabler/icons-react";
import { NavLink as RouterNavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { Logo } from "@/components/Logo";
import { migasPara, navModulo, type Miga, type NavItem } from "@/config/navigation";
import { CitySkyline } from "@/components/CitySkyline";
import { useAuth } from "@/auth/AuthContext";
import { esStaff, ROL_LABEL } from "@/auth/roles";
import { ESTADO_COLOR, ESTADO_LABEL } from "@/domain/labels";
import { useBusquedaReclamos } from "@/features/reclamos/useBusquedaReclamos";

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
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const link = (
    <NavLink
      className="sidebar-link"
      component={RouterNavLink}
      to={item.to}
      label={collapsed ? undefined : item.label}
      aria-label={item.label}
      onClick={onNavigate}
      leftSection={<item.icon size={19} stroke={1.6} />}
      active={active}
      variant="filled"
      color="azulUrbano"
      c={active ? "white" : "gray.4"}
      styles={{
        root: {
          borderRadius: "var(--mantine-radius-md)",
          justifyContent: collapsed ? "center" : undefined,
          paddingInline: collapsed ? 0 : undefined,
        },
        label: { fontSize: "var(--mantine-font-size-sm)", fontWeight: 500 },
      }}
    />
  );

  if (!collapsed) return link;
  return (
    <Tooltip label={item.label} position="right" withArrow openDelay={200}>
      {link}
    </Tooltip>
  );
}

function BusquedaGlobal() {
  const navigate = useNavigate();
  const [texto, setTexto] = useState("");
  const { resultados, buscando, activa } = useBusquedaReclamos(texto);
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  function irAReclamo(id: string) {
    setTexto("");
    combobox.closeDropdown();
    navigate(`/reclamos/${id}`);
  }

  return (
    <Combobox store={combobox} withinPortal onOptionSubmit={irAReclamo}>
      <Combobox.Target>
        <TextInput
          w={{ base: 0, xs: 240, md: 380 }}
          radius="md"
          variant="filled"
          placeholder="Buscar reclamos..."
          leftSection={<IconSearch size={16} />}
          rightSection={buscando ? <Loader size={14} /> : null}
          visibleFrom="xs"
          value={texto}
          onChange={(event) => {
            setTexto(event.currentTarget.value);
            combobox.openDropdown();
            combobox.updateSelectedOptionIndex();
          }}
          onFocus={() => activa && combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              combobox.selectNextOption();
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              combobox.selectPreviousOption();
            } else if (event.key === "Enter") {
              combobox.clickSelectedOption();
            }
          }}
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          {!activa && <Combobox.Empty>Escribi al menos 2 letras para buscar</Combobox.Empty>}
          {activa && !buscando && resultados.length === 0 && (
            <Combobox.Empty>Sin resultados para &quot;{texto.trim()}&quot;</Combobox.Empty>
          )}
          {activa &&
            resultados.map((r) => (
              <Combobox.Option value={r.id} key={r.id}>
                <Group justify="space-between" wrap="nowrap" gap="sm">
                  <Text size="sm" lineClamp={1}>
                    {r.titulo}
                  </Text>
                  <Badge size="sm" variant="light" color={ESTADO_COLOR[r.estado]} radius="sm">
                    {ESTADO_LABEL[r.estado]}
                  </Badge>
                </Group>
              </Combobox.Option>
            ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

function MigasHeader({ migas }: { migas: Miga[] }) {
  const navigate = useNavigate();
  if (migas.length === 0) return null;
  return (
    <Breadcrumbs separator="/" style={{ flexWrap: "nowrap" }}>
      {migas.map((miga, i) =>
        miga.to ? (
          <Anchor key={i} size="sm" c="dimmed" fw={500} onClick={() => navigate(miga.to!)}>
            {miga.label}
          </Anchor>
        ) : (
          <Text key={i} size="sm" fw={600} truncate>
            {miga.label}
          </Text>
        ),
      )}
    </Breadcrumbs>
  );
}

const NAVBAR_ANCHO = 264;
const NAVBAR_ANCHO_RAIL = 80;

export function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const esEscritorio = useMediaQuery("(min-width: 48em)") ?? true;
  const railColapsado = esEscritorio && !desktopOpened;
  const migas = migasPara(pathname, usuario ? esStaff(usuario.rol) : false);

  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);

  function salir() {
    logout();
    navigate("/login");
  }

  return (
    <AppShell
      layout="alt"
      header={{ height: 64 }}
      navbar={{
        width: { base: NAVBAR_ANCHO, sm: desktopOpened ? NAVBAR_ANCHO : NAVBAR_ANCHO_RAIL },
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened },
      }}
      padding={{ base: "md", sm: 40 }}
    >
      <AppShell.Header withBorder>
        <div
          className="app-header-grid"
          style={{ height: "100%", paddingInline: "var(--mantine-spacing-lg)" }}
        >
          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
            <MigasHeader migas={migas} />
          </Group>

          <Group justify="center" wrap="nowrap">
            <BusquedaGlobal />
          </Group>

          <Group gap="lg" wrap="nowrap" justify="flex-end">
            <Menu position="bottom-end" withArrow shadow="md" width={240}>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" size="lg" aria-label="Notificaciones">
                  <IconBellOff size={20} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Notificaciones</Menu.Label>
                <Text size="sm" c="dimmed" px="sm" pb="xs">
                  Sin novedades por el momento.
                </Text>
              </Menu.Dropdown>
            </Menu>
            <Menu position="bottom-end" withArrow shadow="md" width={220}>
              <Menu.Target>
                <UnstyledButton
                  className="account-trigger"
                  aria-label="Cuenta"
                  px="xs"
                  py={4}
                  style={{ borderRadius: "var(--mantine-radius-md)" }}
                >
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
                <Divider my={4} />
                <Menu.Item
                  leftSection={<IconLogout size={16} />}
                  color="rojoEmergencia"
                  onClick={salir}
                >
                  Cerrar sesion
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </div>
      </AppShell.Header>

      <AppShell.Navbar bg="azulNoche.9" style={{ border: "none" }}>
        <AppShell.Section p="md" style={{ display: "flex", justifyContent: "center" }}>
          <Logo size={30} wordmarkColor="white" withWordmark={!railColapsado} />
        </AppShell.Section>

        <AppShell.Section grow component={ScrollArea} px="sm">
          {!railColapsado && (
            <Text size="xs" c="gray.6" fw={600} tt="uppercase" mb={6} px="xs">
              Reclamos
            </Text>
          )}
          <Stack gap={4}>
            {(usuario ? navModulo(usuario.rol) : []).map((item) => (
              <SidebarLink
                key={item.to}
                item={item}
                active={isActive(item.to)}
                collapsed={railColapsado}
                onNavigate={closeMobile}
              />
            ))}
          </Stack>
        </AppShell.Section>

        {!railColapsado && (
          <AppShell.Section>
            <CitySkyline />
          </AppShell.Section>
        )}

        <Tooltip label={desktopOpened ? "Contraer menu" : "Expandir menu"} position="right">
          <ActionIcon
            className="navbar-flap"
            variant="filled"
            color="azulNoche.7"
            radius="xl"
            size={28}
            visibleFrom="sm"
            onClick={toggleDesktop}
            aria-label={desktopOpened ? "Contraer menu lateral" : "Expandir menu lateral"}
          >
            {desktopOpened ? <IconChevronsLeft size={15} /> : <IconChevronsRight size={15} />}
          </ActionIcon>
        </Tooltip>
      </AppShell.Navbar>

      <AppShell.Main bg="gray.0">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
