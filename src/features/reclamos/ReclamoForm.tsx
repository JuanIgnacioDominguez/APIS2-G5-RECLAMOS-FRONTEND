import { Alert, Button, Group, Select, Stack, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconSparkles } from "@tabler/icons-react";

import type { ReclamoCrear } from "@/api/types";
import type { CategoriaReclamo, PrioridadReclamo } from "@/domain/enums";
import {
  CATEGORIA_LABEL,
  PRIORIDAD_LABEL,
  opcionesCategoria,
  opcionesPrioridad,
} from "@/domain/labels";
import { formatConfianza } from "@/lib/format";
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
    },
    validate: reclamoValidators,
    validateInputOnBlur: true,
  });

  const { sugerencia } = useSugerenciaClasificacion(form.values.titulo, form.values.descripcion);

  function aplicarSugerencia() {
    if (!sugerencia) return;
    form.setFieldValue("categoria", sugerencia.categoria);
    form.setFieldValue("prioridad", sugerencia.prioridad);
  }

  const handleSubmit = form.onSubmit((values) => {
    onSubmit({
      titulo: values.titulo.trim(),
      descripcion: values.descripcion.trim(),
      categoria: (values.categoria as CategoriaReclamo | null) ?? null,
      prioridad: (values.prioridad as PrioridadReclamo | null) ?? null,
      direccion: values.direccion.trim() || null,
      barrio: values.barrio.trim() || null,
    });
  });

  return (
    <form onSubmit={handleSubmit}>
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
        <Group justify="flex-end">
          <Button type="submit" loading={loading} color="azulUrbano">
            Enviar reclamo
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
