import type { ObjetoAfectado } from "@/domain/enums";
import { opcionesObjetoAfectado } from "@/domain/labels";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICONO_OBJETO_AFECTADO } from "./iconos";

const SIN_OBJETO = "ninguno";

export function SelectObjetoAfectado({
  id,
  valor,
  onCambio,
  permitirVacio = true,
}: {
  id: string;
  valor: ObjetoAfectado | null;
  onCambio: (valor: ObjetoAfectado | null) => void;
  // The API treats a missing value as "unchanged", so a set value cannot be cleared.
  permitirVacio?: boolean;
}) {
  return (
    <Select
      value={valor ?? SIN_OBJETO}
      onValueChange={(v) => onCambio(v === SIN_OBJETO ? null : (v as ObjetoAfectado))}
    >
      <SelectTrigger id={id} className="w-full" aria-label="Objeto afectado">
        <SelectValue placeholder="Sin especificar" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Sobre qué pasó</SelectLabel>
          {permitirVacio && (
            <>
              <SelectItem value={SIN_OBJETO}>Sin especificar</SelectItem>
              <SelectSeparator />
            </>
          )}
          {opcionesObjetoAfectado().map((o) => {
            const Icono = ICONO_OBJETO_AFECTADO[o.value as ObjetoAfectado];
            return (
              <SelectItem key={o.value} value={o.value}>
                <span className="flex items-center gap-2">
                  <Icono className="size-4 text-muted-foreground" />
                  {o.label}
                </span>
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
