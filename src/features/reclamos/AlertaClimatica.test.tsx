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
    expect(screen.getByRole("note", { name: /alerta climatica/i })).toBeInTheDocument();
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
});

describe("BadgeAlertaClimatica", () => {
  it("es un chip accesible con el texto de alerta", () => {
    render(<BadgeAlertaClimatica nivel={NivelCriticidad.ALTA} />);
    expect(screen.getByRole("img", { name: /alerta climatica/i })).toBeInTheDocument();
  });
});
