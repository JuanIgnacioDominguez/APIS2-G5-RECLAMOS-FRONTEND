import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as reclamosApi from "@/api/reclamos";
import { renderWithProviders } from "@/test/render";
import { ReclamoForm } from "./ReclamoForm";

// The map is not exercised here; expose its onPick as a plain button.
vi.mock("@/features/mapa/MapaSelector", () => ({
  MapaSelector: ({ onPick }: { onPick: (lat: number, lng: number) => void }) => (
    <button type="button" onClick={() => onPick(-34.6, -58.38)}>
      elegir-en-mapa
    </button>
  ),
}));

vi.mock("@/features/mapa/geocoding", () => ({
  buscarDireccion: vi.fn(),
  direccionDesdePunto: vi.fn(),
  sugerirDirecciones: vi.fn(),
  CENTRO_AMBA: { lat: -34.68, lng: -58.42 },
}));

import {
  buscarDireccion,
  direccionDesdePunto,
  sugerirDirecciones,
} from "@/features/mapa/geocoding";

const ESPERA = { timeout: 4000 };

function inputDireccion(): HTMLInputElement {
  return screen.getByRole("textbox", { name: "Dirección" });
}
function inputBarrio(): HTMLInputElement {
  return screen.getByRole("textbox", { name: "Barrio" });
}

// Define `navigator.geolocation` without replacing the whole navigator object
// (userEvent relies on other navigator members), restoring it after each test.
let restaurarGeo: (() => void) | undefined;
function stubGeolocation(getCurrentPosition: Geolocation["getCurrentPosition"]) {
  const original = Object.getOwnPropertyDescriptor(navigator, "geolocation");
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: { getCurrentPosition },
  });
  restaurarGeo = () => {
    if (original) Object.defineProperty(navigator, "geolocation", original);
    else Reflect.deleteProperty(navigator, "geolocation");
  };
}

describe("ReclamoForm - geocodificacion", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(sugerirDirecciones).mockResolvedValue([]);
    vi.mocked(buscarDireccion).mockReset();
    vi.mocked(direccionDesdePunto).mockReset();
    // The category suggestion hook must not hit the network.
    vi.spyOn(reclamosApi, "sugerirClasificacion").mockRejectedValue(new Error("sin backend"));
  });

  afterEach(() => {
    restaurarGeo?.();
    restaurarGeo = undefined;
  });

  it("al marcar un punto en el mapa completa direccion y barrio (reverse)", async () => {
    vi.mocked(direccionDesdePunto).mockResolvedValue({
      latitud: -34.6,
      longitud: -58.38,
      direccion: "Avenida Rivadavia 800",
      barrio: "Monserrat",
    });

    renderWithProviders(<ReclamoForm onSubmit={vi.fn()} />);
    await userEvent.click(screen.getByText("elegir-en-mapa"));

    await waitFor(() => expect(inputDireccion().value).toBe("Avenida Rivadavia 800"), ESPERA);
    expect(inputBarrio().value).toBe("Monserrat");
  });

  it("informa cuando el navegador niega el permiso de ubicacion", async () => {
    stubGeolocation((_ok, error) => {
      error?.({ code: 1 } as GeolocationPositionError);
    });

    renderWithProviders(<ReclamoForm onSubmit={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /usar mi ubicación/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/permití el acceso/i);
  });

  it("busca la direccion escrita y mueve el punto (forward)", async () => {
    vi.mocked(buscarDireccion).mockResolvedValue({
      latitud: -34.6,
      longitud: -58.4,
      direccion: "Avenida Corrientes 3200",
      barrio: "Balvanera",
    });

    renderWithProviders(<ReclamoForm onSubmit={vi.fn()} />);
    await userEvent.type(inputDireccion(), "Corrientes 3200");
    await userEvent.click(screen.getByLabelText(/buscar dirección en el mapa/i));

    await waitFor(() => expect(inputDireccion().value).toBe("Avenida Corrientes 3200"), ESPERA);
    expect(inputBarrio().value).toBe("Balvanera");
    expect(buscarDireccion).toHaveBeenCalled();
  });

  it("usa la ubicacion del dispositivo cuando el vecino la pide", async () => {
    vi.mocked(direccionDesdePunto).mockResolvedValue({
      latitud: -34.7,
      longitud: -58.4,
      direccion: "Calle Falsa 123",
      barrio: "Lanus",
    });
    stubGeolocation((ok) =>
      ok({ coords: { latitude: -34.7, longitude: -58.4 } } as GeolocationPosition),
    );

    renderWithProviders(<ReclamoForm onSubmit={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /usar mi ubicación/i }));

    await waitFor(() => expect(inputDireccion().value).toBe("Calle Falsa 123"), ESPERA);
  });

  it("muestra sugerencias de direccion mientras se escribe", async () => {
    vi.mocked(sugerirDirecciones).mockResolvedValue([
      {
        latitud: -34.7,
        longitud: -58.4,
        direccion: "Avenida Mitre 500",
        barrio: "Lanus",
        principal: "Avenida Mitre 500",
        secundaria: "Lanus, Buenos Aires",
        etiqueta: "Avenida Mitre 500 - Lanus, Buenos Aires",
      },
    ]);

    renderWithProviders(<ReclamoForm onSubmit={vi.fn()} />);
    await userEvent.type(inputDireccion(), "Mitre 500");

    expect(await screen.findByText("Avenida Mitre 500", {}, ESPERA)).toBeInTheDocument();
    expect(screen.getByText("Lanus, Buenos Aires")).toBeInTheDocument();
  });
});
