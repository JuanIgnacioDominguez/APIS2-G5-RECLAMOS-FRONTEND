import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  Inbox,
  ListChecks,
  Loader2,
  RefreshCw,
  Search,
  Users,
  WifiOff,
  Workflow,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useCambiarEstadoMutation } from "@/store/citypassApi";
import type { ReclamoBandeja } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EstadoReclamo, OrigenClasificacion } from "@/domain/enums";
import { ESTADO_LABEL } from "@/domain/labels";
import { haceCuanto, idCorto } from "@/lib/format";
import { CategoriaLinea, EstadoBadge, IaBadge, PrioridadLinea } from "./EstadoBadges";
import { ICONO_ESTADO } from "./iconos";
import {
  crearCsvBandeja,
  crearHojaBandeja,
  crearJsonBandeja,
  filtrarBandeja,
  transicionesComunesBandeja,
} from "./bandejaTable";

interface TablaBandejaProps {
  filas: ReclamoBandeja[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

function descargarBlob(blob: Blob, filename: string): void {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = filename;
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function TablaBandeja({ filas, loading, error, onRefresh }: TablaBandejaProps) {
  const [cambiarEstado] = useCambiarEstadoMutation();
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [idsSeleccionados, setIdsSeleccionados] = useState<string[]>([]);
  const [modoSeleccion, setModoSeleccion] = useState(false);
  const [estadoPendiente, setEstadoPendiente] = useState<EstadoReclamo | null>(null);
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  const filtradas = useMemo(() => filtrarBandeja(filas, busqueda), [busqueda, filas]);
  const seleccionadas = useMemo(() => {
    const ids = new Set(idsSeleccionados);
    return filas.filter((fila) => ids.has(fila.id));
  }, [filas, idsSeleccionados]);
  const transicionesComunes = useMemo(
    () => transicionesComunesBandeja(seleccionadas),
    [seleccionadas],
  );

  const seleccionadasVisibles = filtradas.filter((fila) =>
    idsSeleccionados.includes(fila.id),
  ).length;
  const todasSeleccionadas = filtradas.length > 0 && seleccionadasVisibles === filtradas.length;
  const algunasSeleccionadas = seleccionadasVisibles > 0 && !todasSeleccionadas;

  const abrirReclamo = (id: string): void => {
    navigate(`/reclamos/${id}`, {
      state: { origen: { label: "Bandeja de reclamos", to: "/backoffice" } },
    });
  };

  const alternarModoSeleccion = (): void => {
    if (modoSeleccion) {
      setIdsSeleccionados([]);
      setEstadoPendiente(null);
    }
    setModoSeleccion(!modoSeleccion);
  };

  const alternarTodas = (checked: boolean): void => {
    const idsFiltrados = new Set(filtradas.map((fila) => fila.id));
    setIdsSeleccionados((current) => {
      if (checked) return Array.from(new Set([...current, ...idsFiltrados]));
      return current.filter((id) => !idsFiltrados.has(id));
    });
  };

  const alternarFila = (id: string, checked: boolean): void => {
    setIdsSeleccionados((current) => {
      if (checked) return current.includes(id) ? current : [...current, id];
      return current.filter((idSeleccionado) => idSeleccionado !== id);
    });
  };

  const manejarFila = (id: string, seleccionada: boolean): void => {
    if (modoSeleccion) {
      alternarFila(id, !seleccionada);
      return;
    }
    abrirReclamo(id);
  };

  const nombreArchivo = (extension: string): string => {
    const fecha = new Date().toISOString().slice(0, 10);
    return `reclamos-bandeja-${fecha}.${extension}`;
  };

  const exportarCsv = (): void => {
    const csv = crearCsvBandeja(seleccionadas);
    descargarBlob(
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" }),
      nombreArchivo("csv"),
    );
    toast.success("Archivo CSV descargado");
  };

  const exportarExcel = async (): Promise<void> => {
    try {
      const { default: writeExcelFile } = await import("write-excel-file/browser");
      await writeExcelFile(crearHojaBandeja(seleccionadas), {
        columns: [
          { width: 14 },
          { width: 36 },
          { width: 20 },
          { width: 14 },
          { width: 16 },
          { width: 14 },
          { width: 14 },
          { width: 24 },
        ],
        sheet: "Reclamos",
      }).toFile(nombreArchivo("xlsx"));
      toast.success("Archivo Excel descargado");
    } catch {
      toast.error("No se pudo generar el archivo Excel");
    }
  };

  const exportarJson = (): void => {
    const json = crearJsonBandeja(seleccionadas);
    descargarBlob(new Blob([json], { type: "application/json" }), nombreArchivo("json"));
    toast.success("Archivo JSON descargado");
  };

  const confirmarCambioEstado = async (): Promise<void> => {
    if (!estadoPendiente || seleccionadas.length === 0) return;

    const estado = estadoPendiente;
    setActualizandoEstado(true);

    try {
      const resultados = await Promise.allSettled(
        seleccionadas.map((fila) =>
          cambiarEstado({
            id: fila.id,
            cambio: {
              estado,
              motivo: "Cambio masivo desde la bandeja",
            },
          }).unwrap(),
        ),
      );
      const fallidos = seleccionadas.filter((_, index) => resultados[index]?.status === "rejected");
      const exitosos = seleccionadas.length - fallidos.length;
      const primerError = resultados.find(
        (resultado): resultado is PromiseRejectedResult => resultado.status === "rejected",
      )?.reason;

      setEstadoPendiente(null);
      setIdsSeleccionados(fallidos.map((fila) => fila.id));

      if (exitosos === 0) {
        toast.error("No se pudo actualizar el estado", {
          description: primerError?.message ?? "Error inesperado",
        });
        return;
      }

      if (fallidos.length === 0) {
        setModoSeleccion(false);
        toast.success("Estado actualizado", {
          description: `${seleccionadas.length} ${
            seleccionadas.length === 1 ? "reclamo pasó" : "reclamos pasaron"
          } a ${ESTADO_LABEL[estado]}.`,
        });
        return;
      }

      toast.error("Actualizacion parcial", {
        description: `${fallidos.length} no ${
          fallidos.length === 1 ? "pudo actualizarse" : "pudieron actualizarse"
        }. ${primerError?.message ?? ""}`,
      });
    } finally {
      setActualizandoEstado(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div data-tour="bandeja-buscar" className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar en todas las columnas..."
            aria-label="Buscar en todas las columnas de la bandeja"
            disabled={loading}
            className="h-10 bg-muted/20 pl-9"
          />
        </div>

        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
          <div className="flex min-h-8 items-center gap-2">
            <span className="text-sm text-muted-foreground" aria-live="polite">
              {modoSeleccion
                ? `${seleccionadas.length} ${
                    seleccionadas.length === 1 ? "reclamo seleccionado" : "reclamos seleccionados"
                  }`
                : `${filtradas.length} ${filtradas.length === 1 ? "reclamo" : "reclamos"}`}
            </span>
            {modoSeleccion && seleccionadas.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setIdsSeleccionados([])}>
                <X data-icon="inline-start" />
                Limpiar
              </Button>
            )}
          </div>

          {modoSeleccion && seleccionadas.length > 0 && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    disabled={actualizandoEstado || transicionesComunes.length === 0}
                  >
                    <Workflow data-icon="inline-start" />
                    Cambiar estado
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuGroup>
                    {transicionesComunes.map((estado) => {
                      const Icono = ICONO_ESTADO[estado];
                      return (
                        <DropdownMenuItem key={estado} onSelect={() => setEstadoPendiente(estado)}>
                          <Icono />
                          {ESTADO_LABEL[estado]}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    disabled={loading || seleccionadas.length === 0}
                  >
                    <Download data-icon="inline-start" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onSelect={exportarCsv}>
                      <FileText />
                      Exportar como CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => void exportarExcel()}>
                      <FileSpreadsheet />
                      Exportar como Excel
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={exportarJson}>
                      <FileJson />
                      Exportar como JSON
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          <Button
            variant={modoSeleccion ? "destructive" : "outline"}
            size="lg"
            className="min-w-28"
            onClick={alternarModoSeleccion}
            aria-pressed={modoSeleccion}
            disabled={loading || filas.length === 0}
          >
            {modoSeleccion ? (
              <X data-icon="inline-start" />
            ) : (
              <ListChecks data-icon="inline-start" />
            )}
            {modoSeleccion ? "Finalizar" : "Seleccionar"}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            Cargando bandeja...
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
            <WifiOff className="size-9 text-destructive/80" strokeWidth={1.5} />
            <div>
              <p className="font-medium">No se pudo cargar la bandeja</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button variant="outline" onClick={onRefresh}>
              <RefreshCw data-icon="inline-start" />
              Reintentar
            </Button>
          </div>
        )}

        {!loading && !error && filas.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
            <Inbox className="size-9 text-primary/70" strokeWidth={1.5} />
            <p className="font-medium">Bandeja al dia</p>
            <p className="text-sm text-muted-foreground">No hay reclamos entrantes.</p>
          </div>
        )}

        {!loading && !error && filas.length > 0 && (
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {modoSeleccion && (
                  <TableHead className="h-12 w-14 bg-muted/30 text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={
                          todasSeleccionadas ? true : algunasSeleccionadas ? "indeterminate" : false
                        }
                        onCheckedChange={(value) => alternarTodas(value === true)}
                        aria-label="Seleccionar todos los reclamos filtrados"
                        className="size-5 rounded-md"
                      />
                    </div>
                  </TableHead>
                )}
                <TableHead className="h-12 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Reclamo
                </TableHead>
                <TableHead className="h-12 min-w-44 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Categoría
                </TableHead>
                <TableHead className="h-12 w-32 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Prioridad
                </TableHead>
                <TableHead className="h-12 w-32 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Estado
                </TableHead>
                <TableHead className="h-12 bg-muted/30 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Adhesiones
                </TableHead>
                <TableHead className="h-12 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Ingreso
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtradas.length > 0 ? (
                filtradas.map((reclamo) => {
                  const seleccionada = idsSeleccionados.includes(reclamo.id);
                  return (
                    <TableRow
                      key={reclamo.id}
                      data-state={seleccionada ? "selected" : undefined}
                      onClick={() => manejarFila(reclamo.id, seleccionada)}
                      className={
                        modoSeleccion
                          ? "data-[state=selected]:bg-muted/40"
                          : "cursor-pointer data-[state=selected]:bg-muted/40"
                      }
                    >
                      {modoSeleccion && (
                        <TableCell
                          className="w-14 py-3.5 text-center"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className="flex justify-center">
                            <Checkbox
                              checked={seleccionada}
                              onCheckedChange={(value) => alternarFila(reclamo.id, value === true)}
                              aria-label={`Seleccionar reclamo ${reclamo.titulo}`}
                              className="size-5 rounded-md"
                            />
                          </div>
                        </TableCell>
                      )}
                      <TableCell
                        className={modoSeleccion ? "max-w-80 py-3.5" : "max-w-80 py-3.5 pl-4"}
                      >
                        <Button
                          variant="link"
                          className="h-auto max-w-72 justify-start p-0 text-left text-foreground hover:text-primary hover:no-underline"
                          onClick={(event) => {
                            event.stopPropagation();
                            manejarFila(reclamo.id, seleccionada);
                          }}
                          aria-label={`${
                            modoSeleccion ? "Seleccionar" : "Ver"
                          } reclamo ${reclamo.titulo}`}
                        >
                          <span className="truncate">{reclamo.titulo}</span>
                        </Button>
                        <p className="font-mono text-xs text-muted-foreground">
                          {idCorto(reclamo.id)}
                        </p>
                      </TableCell>
                      <TableCell className="min-w-44 py-3.5">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground/80">
                          <CategoriaLinea categoria={reclamo.categoria} />
                          {reclamo.origen_clasificacion === OrigenClasificacion.MODELO && (
                            <IaBadge />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="w-32 py-3.5">
                        <PrioridadLinea prioridad={reclamo.prioridad} />
                      </TableCell>
                      <TableCell className="w-32 py-3.5">
                        <EstadoBadge
                          estado={reclamo.estado}
                          className="w-full justify-center px-3"
                        />
                      </TableCell>
                      <TableCell className="py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-sm">
                          <Users className="size-3.5 text-muted-foreground" />
                          {reclamo.adhesiones_count}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 text-sm text-muted-foreground">
                        {haceCuanto(reclamo.created_at)}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={modoSeleccion ? 7 : 6} className="h-32 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                      <Search className="size-7 text-muted-foreground" strokeWidth={1.5} />
                      <p className="font-medium">Sin resultados</p>
                      <p className="text-sm text-muted-foreground">
                        No hay reclamos que coincidan con la busqueda.
                      </p>
                      <Button variant="outline" size="sm" onClick={() => setBusqueda("")}>
                        Limpiar busqueda
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog
        open={estadoPendiente !== null}
        onOpenChange={(open) => {
          if (!open && !actualizandoEstado) setEstadoPendiente(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar estado</DialogTitle>
            <DialogDescription>
              {seleccionadas.length === 1
                ? "El reclamo seleccionado pasará a:"
                : `Los ${seleccionadas.length} reclamos seleccionados pasarán a:`}
            </DialogDescription>
          </DialogHeader>
          {estadoPendiente && (
            <div className="flex justify-center py-2">
              <EstadoBadge estado={estadoPendiente} />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEstadoPendiente(null)}
              disabled={actualizandoEstado}
            >
              Cancelar
            </Button>
            <Button
              variant={estadoPendiente === EstadoReclamo.RECHAZADO ? "destructive" : "default"}
              onClick={() => void confirmarCambioEstado()}
              disabled={actualizandoEstado || estadoPendiente === null}
            >
              {actualizandoEstado && <Loader2 className="animate-spin" data-icon="inline-start" />}
              Confirmar cambio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
