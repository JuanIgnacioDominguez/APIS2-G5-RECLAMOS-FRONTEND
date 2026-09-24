import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as reclamosApi from "@/api/reclamos";
import type { Page, ReclamoBandeja } from "@/api/types";
import {
  CategoriaReclamo,
  EstadoReclamo,
  OrigenClasificacion,
  PrioridadReclamo,
} from "@/domain/enums";
import { renderWithProviders } from "@/test/render";
import { BandejaPage } from "./BandejaPage";

function reclamo(
  id: string,
  titulo: string,
  origen: OrigenClasificacion,
  estado: EstadoReclamo = EstadoReclamo.RECIBIDO,
): ReclamoBandeja {
  return {
    id,
    titulo,
    categoria: CategoriaReclamo.BACHES,
    origen_clasificacion: origen,
    prioridad: PrioridadReclamo.ALTA,
    estado,
    adhesiones_count: 2,
    created_at: new Date().toISOString(),
  };
}

function page(items: ReclamoBandeja[]): Page<ReclamoBandeja> {
  return { items, total: items.length, page: 1, size: 20 };
}

describe("BandejaPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(reclamosApi, "contarResueltos").mockResolvedValue(0);
  });

  it("lista los entrantes del endpoint de bandeja y marca los sugeridos por IA", async () => {
    vi.spyOn(reclamosApi, "bandeja").mockResolvedValue(
      page([
        reclamo("1", "Bache en la esquina", OrigenClasificacion.MODELO),
        reclamo("2", "Semaforo roto", OrigenClasificacion.CIUDADANO),
      ]),
    );

    renderWithProviders(<BandejaPage />);

    expect(await screen.findByText("Bache en la esquina")).toBeInTheDocument();
    expect(screen.getByText("Bache en la esquina").closest("td")).toHaveClass("pl-4");
    expect(screen.getByText("Semaforo roto")).toBeInTheDocument();
    // El clasificado por el modelo muestra el badge "IA".
    expect(screen.getByText("IA")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Categoría" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Prioridad" })).toBeInTheDocument();
    expect(screen.getAllByText("Recibido")[0]).toHaveClass("w-full", "justify-center");
    expect(
      screen.getByText("Bache en la esquina").closest("tr")?.querySelector("td.text-center"),
    ).toHaveTextContent("2");
  });

  it("filtra, selecciona y limpia filas como la tabla de Watermelon UI", async () => {
    vi.spyOn(reclamosApi, "bandeja").mockResolvedValue(
      page([
        reclamo("1", "Bache en la esquina", OrigenClasificacion.MODELO),
        reclamo("2", "Semáforo roto", OrigenClasificacion.CIUDADANO),
      ]),
    );
    const user = userEvent.setup();

    renderWithProviders(<BandejaPage />);

    const search = await screen.findByRole("textbox", {
      name: /buscar en todas las columnas/i,
    });
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Seleccionar" }));

    const finalizar = screen.getByRole("button", { name: "Finalizar" });
    const filaBache = screen.getByRole("row", { name: /Bache en la esquina/i });
    const seleccionarFila = screen.getByRole("checkbox", {
      name: "Seleccionar reclamo Bache en la esquina",
    });

    expect(finalizar).toHaveAttribute("data-variant", "destructive");
    expect(seleccionarFila).toHaveClass("size-5");
    expect(screen.getByText("Bache en la esquina").closest("td")).not.toHaveClass("pl-4");

    await user.click(filaBache);
    expect(seleccionarFila).toBeChecked();
    expect(screen.getByText("1 reclamo seleccionado")).toBeInTheDocument();

    await user.click(filaBache);
    expect(seleccionarFila).not.toBeChecked();

    await user.click(seleccionarFila);
    expect(screen.getByText("1 reclamo seleccionado")).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Seleccionar todos los reclamos filtrados" }),
    ).toHaveAttribute("aria-checked", "mixed");
    expect(screen.getByRole("button", { name: "Cambiar estado" }).parentElement).toBe(
      finalizar.parentElement,
    );
    expect(screen.getByRole("button", { name: "Exportar" }).parentElement).toBe(
      finalizar.parentElement,
    );

    await user.type(search, "semaforo");

    expect(screen.getByText("Semáforo roto")).toBeInTheDocument();
    expect(screen.queryByText("Bache en la esquina")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Limpiar" }));
    expect(screen.getByText("0 reclamos seleccionados")).toBeInTheDocument();

    await user.click(finalizar);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("ofrece las exportaciones de la tabla", async () => {
    vi.spyOn(reclamosApi, "bandeja").mockResolvedValue(
      page([reclamo("1", "Bache en la esquina", OrigenClasificacion.MODELO)]),
    );
    const user = userEvent.setup();

    renderWithProviders(<BandejaPage />);
    await screen.findByText("Bache en la esquina");
    await user.click(screen.getByRole("button", { name: "Seleccionar" }));
    await user.click(
      screen.getByRole("checkbox", { name: "Seleccionar reclamo Bache en la esquina" }),
    );
    await user.click(screen.getByRole("button", { name: "Exportar" }));

    expect(await screen.findByRole("menuitem", { name: "Exportar como CSV" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Exportar como Excel" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Exportar como JSON" })).toBeInTheDocument();
  });

  it("cambia el estado de todos los reclamos seleccionados", async () => {
    vi.spyOn(reclamosApi, "bandeja").mockResolvedValue(
      page([
        reclamo("1", "Bache en la esquina", OrigenClasificacion.MODELO),
        reclamo("2", "Semáforo roto", OrigenClasificacion.CIUDADANO, EstadoReclamo.EN_REVISION),
      ]),
    );
    const cambiarEstadoSpy = vi.spyOn(reclamosApi, "cambiarEstado").mockResolvedValue({} as never);
    const user = userEvent.setup();

    renderWithProviders(<BandejaPage />);
    await screen.findByText("Bache en la esquina");

    await user.click(screen.getByRole("button", { name: "Seleccionar" }));
    await user.click(
      screen.getByRole("checkbox", { name: "Seleccionar todos los reclamos filtrados" }),
    );

    expect(screen.getByText("2 reclamos seleccionados")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cambiar estado" }));
    await user.click(screen.getByRole("menuitem", { name: "Asignado" }));
    await user.click(screen.getByRole("button", { name: "Confirmar cambio" }));

    await waitFor(() => expect(cambiarEstadoSpy).toHaveBeenCalledTimes(2));
    expect(cambiarEstadoSpy).toHaveBeenNthCalledWith(1, "1", {
      estado: EstadoReclamo.ASIGNADO,
      motivo: "Cambio masivo desde la bandeja",
    });
    expect(cambiarEstadoSpy).toHaveBeenNthCalledWith(2, "2", {
      estado: EstadoReclamo.ASIGNADO,
      motivo: "Cambio masivo desde la bandeja",
    });
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Seleccionar" })).toBeInTheDocument();
  });

  it("muestra el estado vacio cuando no hay entrantes", async () => {
    vi.spyOn(reclamosApi, "bandeja").mockResolvedValue(page([]));
    renderWithProviders(<BandejaPage />);
    expect(await screen.findByText(/no hay reclamos entrantes/i)).toBeInTheDocument();
  });

  it("muestra el total global de resueltos y cerrados", async () => {
    vi.spyOn(reclamosApi, "bandeja").mockResolvedValue(page([]));
    vi.mocked(reclamosApi.contarResueltos).mockResolvedValue(7);

    renderWithProviders(<BandejaPage />);

    expect(await screen.findByText("Resueltos")).toBeInTheDocument();
    expect(await screen.findByText("7")).toBeInTheDocument();
  });

  it("muestra un error cuando la API falla", async () => {
    vi.spyOn(reclamosApi, "bandeja").mockRejectedValue(new Error("500 interno"));
    renderWithProviders(<BandejaPage />);
    expect(await screen.findByText(/no se pudo cargar/i)).toBeInTheDocument();
  });
});
