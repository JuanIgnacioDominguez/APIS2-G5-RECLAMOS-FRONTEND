import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { NivelCriticidad } from "@/domain/enums";
import {
  AvisoAlertaClimatica,
  BadgeAlertaClimatica,
  MENSAJE_ALERTA_CLIMATICA,
} from "./AlertaClimatica";

describe("AvisoAlertaClimatica", () => {
  it("muestra el titulo y el mensaje sin prometer plazos", () => {
    render(<AvisoAlertaClimatica nivel={NivelCriticidad.MEDIA} />);
    expect(screen.getByRole("note", { name: /alerta clim[aá]tica/i })).toBeInTheDocument();
    expect(screen.getByText(/activa en tu zona/i)).toBeInTheDocument();
    expect(screen.getByText(MENSAJE_ALERTA_CLIMATICA)).toBeInTheDocument();
    // Never promises to resolve or gives a deadline.
    expect(screen.queryByText(/no podemos resolver/i)).not.toBeInTheDocument();
  });

  it("usa el estilo fuerte en CRITICA y el suave en BAJA", () => {
    const { container, rerender } = render(
      <AvisoAlertaClimatica nivel={NivelCriticidad.CRITICA} />,
    );
    expect(container.querySelector(".text-destructive")).toBeInTheDocument();

    rerender(<AvisoAlertaClimatica nivel={NivelCriticidad.BAJA} />);
    expect(container.querySelector(".text-warning")).toBeInTheDocument();
  });

  it("muestra el nivel de la alerta cuando llega", () => {
    render(<AvisoAlertaClimatica nivel={NivelCriticidad.ALTA} />);
    expect(screen.getByText("Nivel Alta")).toBeInTheDocument();
  });

  it("para el staff habla del reclamo y no del vecino", () => {
    render(<AvisoAlertaClimatica nivel={NivelCriticidad.ALTA} paraStaff />);
    expect(screen.getByText(/reclamo bajo alerta clim[aá]tica/i)).toBeInTheDocument();
    expect(screen.getByText("Nivel Alta")).toBeInTheDocument();
    expect(screen.queryByText(/activa en tu zona/i)).not.toBeInTheDocument();
    expect(screen.queryByText(MENSAJE_ALERTA_CLIMATICA)).not.toBeInTheDocument();
  });

  it("no muestra el nivel cuando no llega", () => {
    render(<AvisoAlertaClimatica nivel={null} />);
    expect(screen.queryByText(/^Nivel /)).not.toBeInTheDocument();
  });
});

describe("BadgeAlertaClimatica", () => {
  it("es un chip accesible con el texto de alerta y el nivel", () => {
    render(<BadgeAlertaClimatica nivel={NivelCriticidad.ALTA} />);
    expect(screen.getByRole("img", { name: "Alerta climática: Alta" })).toBeInTheDocument();
    expect(screen.getByText("Alerta climática: Alta")).toBeInTheDocument();
  });

  it("muestra solo el titulo cuando no hay nivel", () => {
    render(<BadgeAlertaClimatica />);
    expect(screen.getByRole("img", { name: "Alerta climática" })).toBeInTheDocument();
  });

  it("cada nivel tiene un color distinto", () => {
    const clases = Object.values(NivelCriticidad).map((nivel) => {
      const { unmount } = render(<BadgeAlertaClimatica nivel={nivel} />);
      const clase = screen.getByRole("img").className;
      unmount();
      return clase;
    });
    expect(new Set(clases).size).toBe(4);
  });

  it("CRITICA se pinta con el rojo solido del tema", () => {
    render(<BadgeAlertaClimatica nivel={NivelCriticidad.CRITICA} />);
    expect(screen.getByRole("img").className).toContain("bg-destructive ");
  });
});
