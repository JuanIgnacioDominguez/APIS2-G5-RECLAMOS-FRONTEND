import { Button, Group, Select, Stack, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";

import type { ReclamoCrear } from "@/api/types";
import type { CategoriaReclamo, PrioridadReclamo } from "@/domain/enums";
import { opcionesCategoria, opcionesPrioridad } from "@/domain/labels";
import { reclamoValidators, type ReclamoFormValues } from "./validation";

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
