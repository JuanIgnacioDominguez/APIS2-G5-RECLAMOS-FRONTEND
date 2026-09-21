import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import { Logo } from "@/components/Logo";
import { LoginAside } from "@/components/LoginAside";
import { useAuth } from "@/auth/AuthContext";
import { ROL_LABEL } from "@/auth/roles";
import { CREDENCIALES_DEMO, type CredencialDemo } from "@/auth/users";
import { homePorRol } from "@/config/navigation";

function GoogleIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

/**
 * Login page. Authenticates against the backend dev endpoint
 * (`POST /auth/dev/login`), which returns a real JWT with hardcoded users until
 * Group 2's federated login is integrated. The Google button is a placeholder
 * for that future flow.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [cargando, setCargando] = useState(false);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);

  const form = useForm({
    initialValues: { usuario: "", password: "" },
    validateInputOnBlur: true,
    validate: {
      usuario: (v) => (v.trim() ? null : "Ingresa tu usuario"),
      password: (v) => (v.length > 0 ? null : "Ingresa tu contrasena"),
    },
  });

  async function ingresar(usuario: string, password: string) {
    setCargando(true);
    setErrorLogin(null);
    try {
      const u = await login(usuario, password);
      navigate(homePorRol(u.rol));
    } catch (err) {
      setErrorLogin(err instanceof Error ? err.message : "No se pudo iniciar sesion");
    } finally {
      setCargando(false);
    }
  }

  const onSubmit = form.onSubmit((values) => ingresar(values.usuario.trim(), values.password));

  function entrarDemo(c: CredencialDemo) {
    ingresar(c.usuario, c.password);
  }

  return (
    <Flex mih="100vh">
      <Box flex="1" bg="white">
        <Flex align="center" justify="center" h="100%" p="xl">
          <Stack gap="lg" w="100%" maw={380}>
            <Stack gap={6}>
              <Logo size={40} />
              <Text c="dimmed" size="sm">
                Reclamos y Participacion Ciudadana
              </Text>
            </Stack>

            <div>
              <Text fw={700} fz={24}>
                Ingresa a tu cuenta
              </Text>
              <Text c="dimmed" size="sm">
                Usa tu cuenta ciudadana para continuar.
              </Text>
            </div>

            {errorLogin && (
              <Alert color="rojoEmergencia" icon={<IconAlertTriangle size={16} />} py="xs">
                {errorLogin}
              </Alert>
            )}

            <form onSubmit={onSubmit} noValidate>
              <Stack gap="sm">
                <TextInput
                  label="Usuario"
                  placeholder="vecino1"
                  autoComplete="username"
                  withAsterisk
                  {...form.getInputProps("usuario")}
                />
                <PasswordInput
                  label="Contrasena"
                  placeholder="Tu contrasena"
                  autoComplete="current-password"
                  withAsterisk
                  {...form.getInputProps("password")}
                />
                <Button type="submit" color="azulUrbano" fullWidth loading={cargando} mt={4}>
                  Ingresar
                </Button>
              </Stack>
            </form>

            <Divider label="o" labelPosition="center" />

            <Button
              variant="default"
              fullWidth
              leftSection={<GoogleIcon />}
              onClick={() =>
                notifications.show({
                  color: "azulUrbano",
                  title: "Proximamente",
                  message: "Se habilita al integrar el Login Federado (Grupo 2).",
                })
              }
            >
              Continuar con Google
            </Button>

            <Stack gap={6}>
              <Text c="dimmed" size="xs" ta="center">
                Acceso rapido (demo, hasta integrar el Login Federado del Grupo 2)
              </Text>
              <Group grow gap="xs">
                {CREDENCIALES_DEMO.map((c) => (
                  <Button
                    key={c.usuario}
                    variant="light"
                    color="azulUrbano"
                    size="xs"
                    disabled={cargando}
                    onClick={() => entrarDemo(c)}
                  >
                    {ROL_LABEL[c.rol]}
                  </Button>
                ))}
              </Group>
            </Stack>
          </Stack>
        </Flex>
      </Box>

      <Box flex="1" visibleFrom="md">
        <LoginAside />
      </Box>
    </Flex>
  );
}
