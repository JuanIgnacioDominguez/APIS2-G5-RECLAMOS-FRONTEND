import {
  Button,
  Card,
  Center,
  Divider,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";

import { Logo } from "@/components/Logo";

/**
 * Login placeholder. The real flow authenticates against Group 2 (Login
 * Federado LDAP + JWT); for now it just lets us into the app while the backend
 * wiring is pending.
 */
export function LoginPage() {
  const navigate = useNavigate();

  return (
    <Center mih="100vh" bg="gray.0">
      <Card withBorder radius="md" padding="xl" w={400}>
        <Stack gap="md">
          <Stack gap={8} align="center">
            <Logo size={44} />
            <Text c="dimmed" size="sm">
              Reclamos y Participacion Ciudadana
            </Text>
          </Stack>

          <TextInput label="Correo electronico" placeholder="vecino@ciudad.gov.ar" />
          <PasswordInput label="Contrasena" placeholder="Tu contrasena" />

          <Button color="azulUrbano" fullWidth onClick={() => navigate("/reclamos")}>
            Ingresar
          </Button>

          <Divider label="o" labelPosition="center" />
          <Button variant="default" fullWidth onClick={() => navigate("/reclamos")}>
            Acceso institucional (LDAP)
          </Button>
        </Stack>
      </Card>
    </Center>
  );
}
