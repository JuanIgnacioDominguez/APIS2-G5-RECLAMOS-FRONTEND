/**
 * Mantine theme for CityPass+ (Grupo 5).
 *
 * Colors and typography follow the shared design system: Azul Urbano as the
 * brand primary, Space Grotesk for headings, Inter for UI text.
 */

import { createTheme, type MantineColorsTuple } from "@mantine/core";

const azulUrbano: MantineColorsTuple = [
  "#eef4fb",
  "#dbe6f4",
  "#b2cbe9",
  "#87afdf",
  "#6497d6",
  "#4f89d1",
  "#2563a6", // brand
  "#1f568f",
  "#194778",
  "#0f3661",
];

const verdeUrbano: MantineColorsTuple = [
  "#eef6f2",
  "#dcece4",
  "#b6d8c7",
  "#8dc3a9",
  "#6bb190",
  "#57a681",
  "#4f8a72", // design token
  "#3f7460",
  "#31624f",
  "#20503e",
];

const ambar: MantineColorsTuple = [
  "#fdf6ea",
  "#f7e9cf",
  "#eecf9c",
  "#e6b566",
  "#dfa03c",
  "#dc9524",
  "#d99838", // design token
  "#b47a1c",
  "#8f5f13",
  "#6b4708",
];

const rojoEmergencia: MantineColorsTuple = [
  "#fceceD",
  "#f6d3d6",
  "#eda3ab",
  "#e5717d",
  "#de4a59",
  "#da3244",
  "#c83e4d", // design token
  "#ab2634",
  "#8f1d29",
  "#75121d",
];

const azulNoche: MantineColorsTuple = [
  "#eef1f4",
  "#d6dbe1",
  "#aab5c2",
  "#7d8da1",
  "#5a6c85",
  "#455872",
  "#39506b",
  "#293c53",
  "#1c2c40",
  "#142430", // sidebar background
];

export const theme = createTheme({
  primaryColor: "azulUrbano",
  primaryShade: 6,
  colors: {
    azulUrbano,
    verdeUrbano,
    ambar,
    rojoEmergencia,
    azulNoche,
  },
  fontFamily:
    'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
  headings: {
    fontFamily:
      '"Space Grotesk", Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, sans-serif',
    fontWeight: "700",
    sizes: {
      h1: { fontSize: "2rem", lineHeight: "1.2" },
      h2: { fontSize: "1.55rem", lineHeight: "1.25" },
      h3: { fontSize: "1.25rem", lineHeight: "1.3" },
      h4: { fontSize: "1.05rem", lineHeight: "1.35" },
      h5: { fontSize: "0.9rem", lineHeight: "1.4" },
    },
  },
  fontFamilyMonospace: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  defaultRadius: "md",

  // Shadows tinted toward the deep-navy brand ground instead of neutral black,
  // so elevation reads as part of the palette (trust-first, low glare).
  shadows: {
    xs: "0 1px 2px rgba(20, 36, 48, 0.06)",
    sm: "0 2px 8px rgba(20, 36, 48, 0.07)",
    md: "0 8px 24px rgba(20, 36, 48, 0.09)",
    lg: "0 14px 36px rgba(20, 36, 48, 0.11)",
    xl: "0 24px 52px rgba(20, 36, 48, 0.14)",
  },

  components: {
    Button: {
      defaultProps: { radius: "md", fw: 600 },
    },
    ActionIcon: {
      defaultProps: { radius: "md" },
    },
    Card: {
      defaultProps: { shadow: "xs" },
    },
    Paper: {
      defaultProps: { radius: "md" },
    },
    TextInput: {
      defaultProps: { radius: "md" },
    },
    PasswordInput: {
      defaultProps: { radius: "md" },
    },
    Select: {
      defaultProps: { radius: "md", checkIconPosition: "right" },
    },
    Textarea: {
      defaultProps: { radius: "md" },
    },
    Badge: {
      defaultProps: { radius: "sm" },
    },
    Table: {
      defaultProps: { verticalSpacing: "sm", horizontalSpacing: "lg" },
    },
    Tabs: {
      defaultProps: { radius: "md" },
    },
    Tooltip: {
      defaultProps: { withArrow: true, color: "azulNoche.8" },
    },
  },
});
