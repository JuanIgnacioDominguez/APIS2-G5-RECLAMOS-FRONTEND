import { Stack, Text, Title } from "@mantine/core";
import { IconMapPin } from "@tabler/icons-react";

import { CitySkyline } from "@/components/CitySkyline";
import "./LoginAside.css";

/**
 * Decorative animated panel for the right side of the login. Purely cosmetic;
 * hidden from assistive tech and motion-safe (respects prefers-reduced-motion).
 */
export function LoginAside() {
  return (
    <Stack className="loginAside" h="100%" justify="space-between" p="xl" aria-hidden="true">
      <div className="loginAside__glow loginAside__glow--a" />
      <div className="loginAside__glow loginAside__glow--b" />

      <IconMapPin className="loginAside__pin loginAside__pin--1" size={28} />
      <IconMapPin className="loginAside__pin loginAside__pin--2" size={36} />
      <IconMapPin className="loginAside__pin loginAside__pin--3" size={24} />

      <div />

      <Stack gap="xs" style={{ position: "relative", zIndex: 1 }}>
        <Title order={2} c="white" style={{ maxWidth: 360 }}>
          Todos los reclamos de tu ciudad, en un solo lugar.
        </Title>
        <Text c="gray.4" style={{ maxWidth: 340 }}>
          Crea, segui y gestiona tus reclamos vecinales de forma agil y transparente.
        </Text>
      </Stack>

      <div style={{ position: "relative", zIndex: 1, opacity: 0.9 }}>
        <CitySkyline />
      </div>
    </Stack>
  );
}
