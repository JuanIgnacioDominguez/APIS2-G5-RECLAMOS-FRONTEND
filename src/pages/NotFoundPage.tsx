import { Button, Center, Group, Stack, Text, Title } from "@mantine/core";
import { IconArrowLeft, IconHome2 } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

/** 404 page for unknown routes. */
export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Center mih="60vh">
      <Stack align="center" gap="xs" maw={420}>
        <Text fw={800} fz={96} lh={1} c="azulUrbano.2" style={{ letterSpacing: "-0.04em" }}>
          404
        </Text>
        <Title order={3} ta="center">
          No encontramos esta pagina
        </Title>
        <Text c="dimmed" ta="center">
          La direccion no existe o el reclamo que buscabas ya no esta disponible.
        </Text>
        <Group mt="md">
          <Button
            variant="default"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate(-1)}
          >
            Volver
          </Button>
          <Button
            color="azulUrbano"
            leftSection={<IconHome2 size={16} />}
            onClick={() => navigate("/")}
          >
            Ir al inicio
          </Button>
        </Group>
      </Stack>
    </Center>
  );
}
