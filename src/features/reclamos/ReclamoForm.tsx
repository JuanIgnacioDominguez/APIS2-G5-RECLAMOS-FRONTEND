import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  FileText,
  Loader2,
  LocateFixed,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Tags,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import type { ReclamoCrear } from "@/api/types";
import type { CategoriaReclamo, PrioridadReclamo } from "@/domain/enums";
import {
  CATEGORIA_HEX,
  CATEGORIA_LABEL,
  PRIORIDAD_HEX,
  PRIORIDAD_LABEL,
  opcionesCategoria,
  opcionesPrioridad,
} from "@/domain/labels";
import { formatConfianza } from "@/lib/format";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapaSelector } from "@/features/mapa/MapaSelector";
import {
  buscarDireccion,
  CENTRO_AMBA,
  direccionDesdePunto,
  sugerirDirecciones,
  type SugerenciaDireccion,
} from "@/features/mapa/geocoding";
import { esFormularioValido, reclamoValidators, type ReclamoFormValues } from "./validation";
import { ICONO_CATEGORIA, ICONO_PRIORIDAD } from "./iconos";
import { useSugerenciaClasificacion } from "./useSugerencia";

const AUTO = "auto";

interface Props {
  onSubmit: (datos: ReclamoCrear) => void;
  loading?: boolean;
}

const VALORES_INICIALES: ReclamoFormValues = {
  titulo: "",
  descripcion: "",
  categoria: null,
  prioridad: null,
  direccion: "",
  barrio: "",
  latitud: null,
  longitud: null,
};

function SeccionTitulo({ icon: Icon, children }: { icon: LucideIcon; children: string }) {
  return (
    <CardTitle className="flex items-center gap-2 text-base font-semibold">
      <Icon className="size-[18px] text-primary" strokeWidth={2.2} />
      {children}
    </CardTitle>
  );
}

export function ReclamoForm({ onSubmit, loading }: Props) {
  const [values, setValues] = useState<ReclamoFormValues>(VALORES_INICIALES);
  const [touched, setTouched] = useState<Partial<Record<"titulo" | "descripcion", boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  function setValue<K extends keyof ReclamoFormValues>(key: K, value: ReclamoFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const erroresCampo = {
    titulo: reclamoValidators.titulo(values.titulo),
    descripcion: reclamoValidators.descripcion(values.descripcion),
  };
  const errores = {
    titulo: touched.titulo || submitted ? erroresCampo.titulo : null,
    descripcion: touched.descripcion || submitted ? erroresCampo.descripcion : null,
  };

  const { sugerencia } = useSugerenciaClasificacion(values.titulo, values.descripcion);
  const [ubicando, setUbicando] = useState(false);
  const [errorUbicacion, setErrorUbicacion] = useState<string | null>(null);
  const [buscandoDir, setBuscandoDir] = useState(false);
  const [opcionesDir, setOpcionesDir] = useState<SugerenciaDireccion[]>([]);
  const omitirSugerencia = useRef(false);
  const dirDebounced = useDebouncedValue(values.direccion, 1000);

  const centroRef = useRef(CENTRO_AMBA);
  centroRef.current =
    values.latitud !== null && values.longitud !== null
      ? { lat: values.latitud, lng: values.longitud }
      : CENTRO_AMBA;

  useEffect(() => {
    if (omitirSugerencia.current) {
      omitirSugerencia.current = false;
      return;
    }
    if (dirDebounced.trim().length < 4) {
      setOpcionesDir([]);
      return;
    }
    const ctrl = new AbortController();
    sugerirDirecciones(dirDebounced, { cerca: centroRef.current, signal: ctrl.signal })
      .then(setOpcionesDir)
      .catch(() => undefined);
    return () => ctrl.abort();
  }, [dirDebounced]);

  function aplicarSugerencia() {
    if (!sugerencia) return;
    setValues((v) => ({ ...v, categoria: sugerencia.categoria, prioridad: sugerencia.prioridad }));
  }

  function elegirSugerenciaDir(elegida: SugerenciaDireccion) {
    omitirSugerencia.current = true;
    setValues((v) => ({
      ...v,
      direccion: elegida.direccion,
      latitud: elegida.latitud,
      longitud: elegida.longitud,
      barrio: elegida.barrio || v.barrio,
    }));
    setOpcionesDir([]);
  }

  async function fijarUbicacion(lat: number, lng: number) {
    setValues((v) => ({ ...v, latitud: lat, longitud: lng }));
    try {
      const lugar = await direccionDesdePunto(lat, lng);
      if (lugar?.direccion) {
        omitirSugerencia.current = true;
        setValue("direccion", lugar.direccion);
      }
      if (lugar?.barrio) setValue("barrio", lugar.barrio);
    } catch {
      return;
    }
  }

  async function buscarPorDireccion() {
    const texto = values.direccion.trim();
    if (texto.length < 4) return;
    setBuscandoDir(true);
    try {
      const lugar = await buscarDireccion(texto, centroRef.current);
      if (!lugar) {
        toast("No encontramos esa dirección", {
          description: "Revisá cómo está escrita o marcá el punto en el mapa.",
        });
        return;
      }
      omitirSugerencia.current = true;
      setValues((v) => ({
        ...v,
        latitud: lugar.latitud,
        longitud: lugar.longitud,
        direccion: lugar.direccion,
        barrio: lugar.barrio && !v.barrio.trim() ? lugar.barrio : v.barrio,
      }));
      setOpcionesDir([]);
    } catch {
      toast.error("No se pudo buscar la dirección", {
        description: "Intentá de nuevo en unos segundos.",
      });
    } finally {
      setBuscandoDir(false);
    }
  }

  function usarMiUbicacion() {
    if (!navigator.geolocation) {
      const mensaje = "Tu navegador no permite acceder a la ubicación.";
      setErrorUbicacion(mensaje);
      toast.error("No se pudo usar tu ubicación", { description: mensaje });
      return;
    }
    setErrorUbicacion(null);
    setUbicando(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void fijarUbicacion(pos.coords.latitude, pos.coords.longitude);
        setUbicando(false);
        toast.success("Ubicación actualizada", {
          description: "Marcamos tu ubicación en el mapa.",
        });
      },
      (error) => {
        const mensaje =
          error.code === 1
            ? "Permití el acceso a tu ubicación desde el navegador."
            : "No pudimos obtener tu ubicación. Intentá de nuevo.";
        setUbicando(false);
        setErrorUbicacion(mensaje);
        toast.error("No se pudo usar tu ubicación", { description: mensaje });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!esFormularioValido(values)) return;
    onSubmit({
      titulo: values.titulo.trim(),
      descripcion: values.descripcion.trim(),
      categoria: (values.categoria as CategoriaReclamo | null) ?? null,
      prioridad: (values.prioridad as PrioridadReclamo | null) ?? null,
      direccion: values.direccion.trim() || null,
      barrio: values.barrio.trim() || null,
      latitud: values.latitud,
      longitud: values.longitud,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(17rem,0.9fr)] lg:gap-5">
        <div data-tour="nuevo-paso1" className="flex min-w-0 flex-col gap-4">
          <Card className="rounded-2xl ring-1 ring-border">
            <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <SeccionTitulo icon={FileText}>Información del reclamo</SeccionTitulo>
              <p className="text-sm text-muted-foreground sm:text-right">
                Describí el problema con tus propias palabras.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="titulo">
                  Título <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="titulo"
                  placeholder="Luminaria apagada en la plaza"
                  value={values.titulo}
                  aria-invalid={!!errores.titulo}
                  onBlur={() => setTouched((t) => ({ ...t, titulo: true }))}
                  onChange={(e) => setValue("titulo", e.target.value)}
                />
                {errores.titulo && <p className="text-xs text-destructive">{errores.titulo}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="descripcion">
                  Descripción <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="descripcion"
                  placeholder="Contanos qué pasa, hace cuánto y dónde."
                  rows={5}
                  value={values.descripcion}
                  aria-invalid={!!errores.descripcion}
                  onBlur={() => setTouched((t) => ({ ...t, descripcion: true }))}
                  onChange={(e) => setValue("descripcion", e.target.value)}
                  className="resize-y"
                />
                {errores.descripcion && (
                  <p className="text-xs text-destructive">{errores.descripcion}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl ring-1 ring-border">
            <CardHeader>
              <SeccionTitulo icon={MapPin}>Ubicación</SeccionTitulo>
              <CardAction>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={ubicando}
                  onClick={usarMiUbicacion}
                >
                  {ubicando ? <Loader2 className="animate-spin" /> : <LocateFixed />}
                  Usar mi ubicación
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
              {errorUbicacion && (
                <p
                  role="alert"
                  className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive"
                >
                  {errorUbicacion}
                </p>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="direccion">Dirección</Label>
                  <div className="relative">
                    <Popover
                      open={opcionesDir.length > 0}
                      onOpenChange={(abierto) => {
                        if (!abierto) setOpcionesDir([]);
                      }}
                    >
                      <PopoverAnchor asChild>
                        <div>
                          <InputGroup>
                            <InputGroupInput
                              id="direccion"
                              placeholder="Av. Rivadavia 800"
                              autoComplete="off"
                              value={values.direccion}
                              onChange={(e) => setValue("direccion", e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  void buscarPorDireccion();
                                }
                              }}
                            />
                            <InputGroupAddon align="inline-end">
                              <InputGroupButton
                                type="button"
                                size="icon-xs"
                                aria-label="Buscar dirección en el mapa"
                                onClick={() => void buscarPorDireccion()}
                              >
                                {buscandoDir ? <Loader2 className="animate-spin" /> : <Search />}
                              </InputGroupButton>
                            </InputGroupAddon>
                          </InputGroup>
                        </div>
                      </PopoverAnchor>
                      <PopoverContent
                        role="listbox"
                        aria-label="Sugerencias de dirección"
                        align="start"
                        sideOffset={4}
                        collisionPadding={8}
                        onOpenAutoFocus={(event) => event.preventDefault()}
                        onCloseAutoFocus={(event) => event.preventDefault()}
                        className="max-h-64 w-(--radix-popover-trigger-width) max-w-[calc(100vw-2rem)] gap-0 overflow-y-auto p-1"
                      >
                        {opcionesDir.map((o) => (
                          <li key={o.etiqueta}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={false}
                              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                              onClick={() => elegirSugerenciaDir(o)}
                            >
                              <MapPin className="size-3.5 shrink-0 text-primary" />
                              <span className="min-w-0">
                                <span className="block truncate font-medium">{o.principal}</span>
                                {o.secundaria && (
                                  <span className="block truncate text-xs text-muted-foreground">
                                    {o.secundaria}
                                  </span>
                                )}
                              </span>
                            </button>
                          </li>
                        ))}
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="barrio">Barrio</Label>
                  <Input
                    id="barrio"
                    placeholder="Centro"
                    value={values.barrio}
                    onChange={(e) => setValue("barrio", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl ring-1 ring-border">
            <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <SeccionTitulo icon={Tags}>Clasificación</SeccionTitulo>
              <p className="text-sm text-muted-foreground sm:text-right">
                Elegí una opción o dejá que el sistema la sugiera.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {sugerencia && (
                <Alert className="border-primary/20 bg-primary/5 p-3">
                  <Sparkles className="size-4 text-primary" />
                  <AlertTitle className="font-semibold">Sugerencia automática</AlertTitle>
                  <AlertDescription>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span>
                        Categoría <b>{CATEGORIA_LABEL[sugerencia.categoria]}</b>, prioridad{" "}
                        <b>{PRIORIDAD_LABEL[sugerencia.prioridad]}</b> (
                        {formatConfianza(sugerencia.confianza)} de confianza).
                      </span>
                      <Button
                        type="button"
                        size="xs"
                        variant="secondary"
                        onClick={aplicarSugerencia}
                      >
                        Aplicar
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select
                    value={values.categoria ?? AUTO}
                    onValueChange={(v) => setValue("categoria", v === AUTO ? null : v)}
                  >
                    <SelectTrigger id="categoria" className="w-full" aria-label="Categoría">
                      <SelectValue placeholder="La sugiere el clasificador" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Categoría</SelectLabel>
                        <SelectItem value={AUTO}>
                          <span className="flex items-center gap-2">
                            <Sparkles className="size-4 text-muted-foreground" />
                            La sugiere el clasificador
                          </span>
                        </SelectItem>
                        <SelectSeparator />
                        {opcionesCategoria().map((o) => {
                          const Icono = ICONO_CATEGORIA[o.value as CategoriaReclamo];
                          return (
                            <SelectItem key={o.value} value={o.value}>
                              <span className="flex items-center gap-2">
                                <Icono
                                  className="size-4"
                                  style={{ color: CATEGORIA_HEX[o.value as CategoriaReclamo] }}
                                />
                                {o.label}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prioridad">Prioridad</Label>
                  <Select
                    value={values.prioridad ?? AUTO}
                    onValueChange={(v) => setValue("prioridad", v === AUTO ? null : v)}
                  >
                    <SelectTrigger id="prioridad" className="w-full" aria-label="Prioridad">
                      <SelectValue placeholder="La sugiere el clasificador" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Prioridad</SelectLabel>
                        <SelectItem value={AUTO}>
                          <span className="flex items-center gap-2">
                            <Sparkles className="size-4 text-muted-foreground" />
                            La sugiere el clasificador
                          </span>
                        </SelectItem>
                        <SelectSeparator />
                        {opcionesPrioridad().map((o) => {
                          const Icono = ICONO_PRIORIDAD[o.value as PrioridadReclamo];
                          return (
                            <SelectItem key={o.value} value={o.value}>
                              <span className="flex items-center gap-2">
                                <Icono
                                  className="size-4"
                                  style={{ color: PRIORIDAD_HEX[o.value as PrioridadReclamo] }}
                                />
                                {o.label}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside data-tour="nuevo-paso2" className="flex min-w-0 flex-col gap-4 lg:h-full">
          <Card className="flex min-h-0 flex-1 flex-col rounded-2xl ring-1 ring-border">
            <CardHeader>
              <SeccionTitulo icon={MapPin}>Mapa del reclamo</SeccionTitulo>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
              <MapaSelector
                lat={values.latitud}
                lng={values.longitud}
                onPick={fijarUbicacion}
                altura={360}
                className="mapa-columna-fill lg:!min-h-[240px]"
              />
              <div className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                {values.latitud !== null && values.longitud !== null
                  ? `Lat ${values.latitud.toFixed(5)}, Lng ${values.longitud.toFixed(5)}`
                  : "Tocá el mapa o usá tu ubicación para marcar el punto."}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <Card className="rounded-2xl ring-1 ring-border">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-4" />
            </span>
            <div>
              <p className="font-semibold">Todo listo para enviar</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Revisá los datos. Tu información se usa únicamente para gestionar este reclamo.
              </p>
            </div>
          </div>
          <Button
            type="submit"
            size="lg"
            data-tour="nuevo-enviar"
            disabled={loading}
            className="h-10 w-full gap-2 px-5 sm:w-auto"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Plus className="size-4" />}
            {loading ? "Procesando..." : "Enviar reclamo"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
