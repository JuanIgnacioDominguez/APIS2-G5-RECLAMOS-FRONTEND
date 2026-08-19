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
  },
  fontFamilyMonospace: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  defaultRadius: "md",
});
