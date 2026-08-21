import { useState } from "react";
import {
  Button,
  Card,
  Center,
  Divider,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";

import { Logo } from "@/components/Logo";
import { useAuth } from "@/auth/AuthContext";
import { ROL_LABEL } from "@/auth/roles";
import { USUARIOS_DEMO, type Usuario } from "@/auth/users";

/**
 * Hardcoded login. Authenticates against the demo users until Group 2's
 * federated login (LDAP + JWT) is wired in; then this form calls that service
 * instead. The quick-access buttons make it easy to try each role.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const { login, loginComo } = useAuth();
  const [email, setEmail] = useState("");

  function entrar(u: Usuario) {
    loginComo(u);
    navigate("/reclamos");
  }

  function entrarConEmail() {
    login(email || "vecino@ciudad.gob.ar");
    navigate("/reclamos");
  }

  return (
    <Center mih="100vh" bg="gray.0">
      <Card withBorder radius="md" padding="xl" w={420}>
        <Stack gap="md">
          <Stack gap={8} align="center">
            <Logo size={44} />
            <Text c="dimmed" size="sm">
              Reclamos y Participacion Ciudadana
            </Text>
          </Stack>

          <TextInput
            label="Correo electronico"
            placeholder="vecino@ciudad.gob.ar"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
          <PasswordInput label="Contrasena" placeholder="Tu contrasena" />

          <Button color="azulUrbano" fullWidth onClick={entrarConEmail}>
            Ingresar
          </Button>

          <Divider label="Acceso rapido (demo)" labelPosition="center" />
          <Text c="dimmed" size="xs" ta="center">
            Login hardcodeado hasta integrar el Login Federado (Grupo 2). Elegi un rol para probar:
          </Text>
          <Group grow>
            {USUARIOS_DEMO.map((u) => (
              <Button
                key={u.id}
                variant="light"
                color="azulUrbano"
                size="xs"
                onClick={() => entrar(u)}
              >
                {ROL_LABEL[u.rol]}
              </Button>
            ))}
          </Group>
        </Stack>
      </Card>
    </Center>
  );
}
