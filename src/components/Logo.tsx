import { Group, Text } from "@mantine/core";

interface LogoProps {
  /** Height of the pin mark in px. */
  size?: number;
  /** Show the "CityPass+" wordmark next to the mark. */
  withWordmark?: boolean;
  /** Color of the wordmark text (the mark keeps its brand colors). */
  wordmarkColor?: string;
}

/**
 * CityPass+ logo: a city skyline inside a location pin (cyan dome + navy tip).
 * Rebuilt as inline SVG so it scales and stays crisp; swap for the official
 * asset by dropping the file in and pointing an <img> at it.
 */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="CityPass+"
    >
      {/* navy teardrop tip */}
      <path d="M14 58 L48 118 L82 58 Z" fill="#154a6b" />
      {/* cyan dome */}
      <path d="M48 6 C26 6 14 24 14 42 L14 58 L82 58 L82 42 C82 24 70 6 48 6 Z" fill="#0f9bc7" />
      {/* white skyline silhouette along the dome's horizon */}
      <path
        d="M22 58 L22 44 L30 44 L30 36 L38 36 L38 48 L44 48 L44 28 L52 24 L52 48 L58 48 L58 40 L66 40 L66 46 L74 46 L74 58 Z"
        fill="#ffffff"
      />
    </svg>
  );
}

export function Logo({ size = 32, withWordmark = true, wordmarkColor }: LogoProps) {
  return (
    <Group gap={8} wrap="nowrap">
      <LogoMark size={size} />
      {withWordmark && (
        <Text fw={700} fz={size * 0.62} c={wordmarkColor} style={{ letterSpacing: "-0.02em" }}>
          CityPass
          <span style={{ color: "var(--mantine-color-ambar-5)" }}>+</span>
        </Text>
      )}
    </Group>
  );
}
