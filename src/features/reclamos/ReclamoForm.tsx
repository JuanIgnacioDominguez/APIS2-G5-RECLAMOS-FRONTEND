import { useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  Alert,
  Autocomplete,
  Button,
  Grid,
  Group,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconCurrentLocation,
  IconMapPin,
  IconMapPinSearch,
  IconSparkles,
} from "@tabler/icons-react";

import type { ReclamoCrear } from "@/api/types";
import type { CategoriaReclamo, PrioridadReclamo } from "@/domain/enums";
import {
  CATEGORIA_LABEL,
  PRIORIDAD_LABEL,
  opcionesCategoria,
  opcionesPrioridad,
} from "@/domain/labels";
import { formatConfianza } from "@/lib/format";
import { MapaSelector } from "@/features/mapa/MapaSelector";
import {
  buscarDireccion,
  CENTRO_AMBA,
  direccionDesdePunto,
  sugerirDirecciones,
  type SugerenciaDireccion,
} from "@/features/mapa/geocoding";
import { reclamoValidators, type ReclamoFormValues } from "./validation";
import { useSugerenciaClasificacion } from "./useSugerencia";

interface Props {
  onSubmit: (datos: ReclamoCrear) => void;
  loading?: boolean;
}

export function ReclamoForm({ onSubmit, loading }: Props) {
  const form = useForm<ReclamoFormValues>({
    initialValues: {
      titulo: "",
      descripcion: "",
      categoria: null,
      prioridad: null,
      direccion: "",
      barrio: "",
      latitud: null,
      longitud: null,
    },
    validate: reclamoValidators,
    validateInputOnBlur: true,
  });

  const { sugerencia } = useSugerenciaClasificacion(form.values.titulo, form.values.descripcion);
  const [ubicando, setUbicando] = useState(false);
  const [buscandoDir, setBuscandoDir] = useState(false);
  const [opcionesDir, setOpcionesDir] = useState<SugerenciaDireccion[]>([]);
  // Skips the next autocomplete fetch when the address was set programmatically
  // (map click, geolocation, a picked suggestion) instead of typed by the user.
  const omitirSugerencia = useRef(false);
  const [dirDebounced] = useDebouncedValue(form.values.direccion, 300);

  // Proximity centre for ranking suggestions: the dropped pin if any, else the
  // citizen's device location, else Greater Buenos Aires. Kept in a ref so the
  // fetch effect reads the latest centre without re-running on every pin move.
  const [centroDispositivo, setCentroDispositivo] = useState(CENTRO_AMBA);
  const centroRef = useRef(CENTRO_AMBA);
  centroRef.current =
    form.values.latitud !== null && form.values.longitud !== null
      ? { lat: form.values.latitud, lng: form.values.longitud }
      : centroDispositivo;

  // Best-effort: bias toward the citizen's real location. Denied → stays AMBA.
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCentroDispositivo({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 8000, maximumAge: 600000 },
    );
  }, []);

  // Fetch address candidates as the citizen types, cancelling stale requests.
  useEffect(() => {
    if (omitirSugerencia.current) {
      omitirSugerencia.current = false;
      return;
    }
    if (dirDebounced.trim().length < 4) {
      setOpcionesDir([]);
      return;
    }
    const ctrl = new AbortController();
    sugerirDirecciones(dirDebounced, { cerca: centroRef.current, signal: ctrl.signal })
      .then(setOpcionesDir)
      .catch(() => {
        /* aborted or offline: keep the previous options */
      });
    return () => ctrl.abort();
  }, [dirDebounced]);

  function aplicarSugerencia() {
    if (!sugerencia) return;
    form.setFieldValue("categoria", sugerencia.categoria);
    form.setFieldValue("prioridad", sugerencia.prioridad);
  }

  // A candidate chosen from the dropdown: fill address, neighbourhood and pin.
  function elegirSugerenciaDir(etiqueta: string) {
    const elegida = opcionesDir.find((o) => o.etiqueta === etiqueta);
    if (!elegida) return;
    omitirSugerencia.current = true;
    form.setFieldValue("direccion", elegida.direccion);
    form.setFieldValue("latitud", elegida.latitud);
    form.setFieldValue("longitud", elegida.longitud);
    if (elegida.barrio) form.setFieldValue("barrio", elegida.barrio);
    setOpcionesDir([]);
  }

  // Point picked on the map (or from geolocation): drop the pin and reverse
  // geocode so the address and neighbourhood fields fill themselves in.
  async function fijarUbicacion(lat: number, lng: number) {
    form.setFieldValue("latitud", lat);
    form.setFieldValue("longitud", lng);
    try {
      const lugar = await direccionDesdePunto(lat, lng);
      if (lugar?.direccion) {
        omitirSugerencia.current = true;
        form.setFieldValue("direccion", lugar.direccion);
      }
      if (lugar?.barrio) form.setFieldValue("barrio", lugar.barrio);
    } catch {
      // Keep the coordinates even if the address lookup fails.
    }
  }

  // Address typed by the citizen: geocode it and move the pin to the real point.
  async function buscarPorDireccion() {
    const texto = form.values.direccion.trim();
    if (texto.length < 4) return;
    setBuscandoDir(true);
    try {
      const lugar = await buscarDireccion(texto, centroRef.current);
      if (!lugar) {
        notifications.show({
          color: "ambar",
          title: "No encontramos esa direccion",
          message: "Revisa como esta escrita o marca el punto en el mapa.",
        });
        return;
      }
      form.setFieldValue("latitud", lugar.latitud);
      form.setFieldValue("longitud", lugar.longitud);
      omitirSugerencia.current = true;
      form.setFieldValue("direccion", lugar.direccion);
      if (lugar.barrio && !form.values.barrio.trim()) {
        form.setFieldValue("barrio", lugar.barrio);
      }
      setOpcionesDir([]);
    } catch {
      notifications.show({
        color: "rojoEmergencia",
        title: "No se pudo buscar la direccion",
        message: "Intenta de nuevo en unos segundos.",
      });
    } finally {
      setBuscandoDir(false);
    }
  }

  function usarMiUbicacion() {
    if (!navigator.geolocation) return;
    setUbicando(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void fijarUbicacion(pos.coords.latitude, pos.coords.longitude);
        setUbicando(false);
      },
      () => setUbicando(false),
    );
  }

  const handleSubmit = form.onSubmit((values) => {
    onSubmit({
      titulo: values.titulo.trim(),
      descripcion: values.descripcion.trim(),
      categoria: (values.categoria as CategoriaReclamo | null) ?? null,
      prioridad: (values.prioridad as PrioridadReclamo | null) ?? null,
      direccion: values.direccion.trim() || null,
      barrio: values.barrio.trim() || null,
      latitud: values.latitud,
      longitud: values.longitud,
    });
  });

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <Grid gutter="xl" align="stretch" style={{ flex: 1, minHeight: 0, minWidth: 0 }}>
        <Grid.Col span={{ base: 12, md: 5 }} style={{ minHeight: 0, minWidth: 0 }}>
          <Stack gap="md" h="100%" style={{ overflowY: "auto", overflowX: "hidden" }}>
            <TextInput
              label="Titulo"
              placeholder="Luminaria apagada en la plaza"
              size="md"
              withAsterisk
              {...form.getInputProps("titulo")}
            />
            <Textarea
              label="Descripcion"
              placeholder="Contanos que pasa, hace cuanto y donde."
              size="md"
              minRows={4}
              autosize
              withAsterisk
              {...form.getInputProps("descripcion")}
            />
            {sugerencia && (
              <Alert
                color="azulUrbano"
                variant="light"
                icon={<IconSparkles size={16} />}
                title="Sugerencia automatica"
              >
                <Group justify="space-between" wrap="wrap" gap="xs">
                  <span>
                    Categoria <b>{CATEGORIA_LABEL[sugerencia.categoria]}</b>, prioridad{" "}
                    <b>{PRIORIDAD_LABEL[sugerencia.prioridad]}</b> (
                    {formatConfianza(sugerencia.confianza)} de confianza).
                  </span>
                  <Button size="xs" variant="light" color="azulUrbano" onClick={aplicarSugerencia}>
                    Aplicar
                  </Button>
                </Group>
              </Alert>
            )}
            <Grid gutter="sm" align="flex-end">
              <Grid.Col span={6}>
                <Select
                  label="Categoria"
                  placeholder="La sugiere el clasificador"
                  size="md"
                  clearable
                  data={opcionesCategoria()}
                  {...form.getInputProps("categoria")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Prioridad"
                  placeholder="La sugiere el clasificador"
                  size="md"
                  clearable
                  data={opcionesPrioridad()}
                  {...form.getInputProps("prioridad")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, xs: 7 }}>
                <Autocomplete
                  label="Direccion"
                  placeholder="Av. Rivadavia 800"
                  size="md"
                  data={opcionesDir.map((o) => o.etiqueta)}
                  filter={({ options }) => options}
                  limit={6}
                  maxDropdownHeight={300}
                  comboboxProps={{ shadow: "md" }}
                  renderOption={({ option }) => {
                    const s = opcionesDir.find((o) => o.etiqueta === option.value);
                    return (
                      <Group gap="sm" wrap="nowrap">
                        <ThemeIcon size="sm" radius="xl" variant="light" color="azulUrbano">
                          <IconMapPin size={13} />
                        </ThemeIcon>
                        <div style={{ minWidth: 0 }}>
                          <Text size="sm" fw={500} lineClamp={1}>
                            {s?.principal ?? option.value}
                          </Text>
                          {s?.secundaria && (
                            <Text size="xs" c="dimmed" lineClamp={1}>
                              {s.secundaria}
                            </Text>
                          )}
                        </div>
                      </Group>
                    );
                  }}
                  value={form.values.direccion}
                  error={form.errors.direccion}
                  onChange={(v) => {
                    // Picking a suggestion sends its full label; resolve it to the
                    // short address + pin. Free typing just updates the field.
                    if (opcionesDir.some((o) => o.etiqueta === v)) {
                      elegirSugerenciaDir(v);
                    } else {
                      form.setFieldValue("direccion", v);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void buscarPorDireccion();
                    }
                  }}
                  rightSection={
                    <ActionIcon
                      variant="subtle"
                      color="azulUrbano"
                      loading={buscandoDir}
                      onClick={() => void buscarPorDireccion()}
                      aria-label="Buscar direccion en el mapa"
                    >
                      <IconMapPinSearch size={18} />
                    </ActionIcon>
                  }
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, xs: 5 }}>
                <TextInput label="Barrio" size="md" {...form.getInputProps("barrio")} />
              </Grid.Col>
              <Grid.Col span={12}>
                <Text size="xs" c="dimmed" mt={-6}>
                  Empeza a escribir y elegi una sugerencia, o marca el punto en el mapa.
                </Text>
              </Grid.Col>
            </Grid>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 7 }} style={{ minWidth: 0 }}>
          <Stack gap="xs" h="100%">
            <Group justify="space-between">
              <Text fw={500} size="sm">
                Ubicacion en el mapa
              </Text>
              <Button
                size="xs"
                variant="light"
                color="azulUrbano"
                leftSection={<IconCurrentLocation size={14} />}
                loading={ubicando}
                onClick={usarMiUbicacion}
              >
                Usar mi ubicacion
              </Button>
            </Group>
            <MapaSelector
              lat={form.values.latitud}
              lng={form.values.longitud}
              onPick={fijarUbicacion}
              altura={620}
              className="mapa-columna-fill"
            />
            <Text size="xs" c="dimmed">
              {form.values.latitud !== null && form.values.longitud !== null
                ? `Lat ${form.values.latitud.toFixed(5)}, Lng ${form.values.longitud.toFixed(5)}`
                : "Toca el mapa o usa tu ubicacion para marcar el punto."}
            </Text>
          </Stack>
        </Grid.Col>
      </Grid>

      <Group justify="flex-end" mt="md" mb="md" style={{ flexShrink: 0 }}>
        <Button type="submit" loading={loading} color="azulUrbano" size="md">
          Enviar reclamo
        </Button>
      </Group>
    </form>
  );
}
