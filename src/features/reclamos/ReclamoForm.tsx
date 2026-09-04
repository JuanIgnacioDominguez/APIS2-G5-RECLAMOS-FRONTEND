import { useState } from "react";
import {
  Alert,
  Button,
  Grid,
  Group,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCurrentLocation, IconSparkles } from "@tabler/icons-react";

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

  function aplicarSugerencia() {
    if (!sugerencia) return;
    form.setFieldValue("categoria", sugerencia.categoria);
    form.setFieldValue("prioridad", sugerencia.prioridad);
  }

  function fijarUbicacion(lat: number, lng: number) {
    form.setFieldValue("latitud", lat);
    form.setFieldValue("longitud", lng);
  }

  function usarMiUbicacion() {
    if (!navigator.geolocation) return;
    setUbicando(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fijarUbicacion(pos.coords.latitude, pos.coords.longitude);
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
    <form onSubmit={handleSubmit}>
      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap="md">
            <TextInput
              label="Titulo"
              placeholder="Luminaria apagada en la plaza"
              withAsterisk
              {...form.getInputProps("titulo")}
            />
            <Textarea
              label="Descripcion"
              placeholder="Contanos que pasa, hace cuanto y donde."
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
            <Group grow>
              <Select
                label="Categoria"
                placeholder="La sugiere el clasificador"
                clearable
                data={opcionesCategoria()}
                {...form.getInputProps("categoria")}
              />
              <Select
                label="Prioridad"
                placeholder="La sugiere el clasificador"
                clearable
                data={opcionesPrioridad()}
                {...form.getInputProps("prioridad")}
              />
            </Group>
            <Group grow>
              <TextInput label="Direccion" {...form.getInputProps("direccion")} />
              <TextInput label="Barrio" {...form.getInputProps("barrio")} />
            </Group>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack gap="xs">
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
            />
            <Text size="xs" c="dimmed">
              {form.values.latitud !== null && form.values.longitud !== null
                ? `Lat ${form.values.latitud.toFixed(5)}, Lng ${form.values.longitud.toFixed(5)}`
                : "Toca el mapa o usa tu ubicacion para marcar el punto."}
            </Text>
          </Stack>
        </Grid.Col>

        <Grid.Col span={12}>
          <Group justify="flex-end">
            <Button type="submit" loading={loading} color="azulUrbano" size="md">
              Enviar reclamo
            </Button>
          </Group>
        </Grid.Col>
      </Grid>
    </form>
  );
}
