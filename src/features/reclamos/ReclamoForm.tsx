import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2, LocateFixed, MapPin, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";

import type { ReclamoCrear } from "@/api/types";
import type { CategoriaReclamo, PrioridadReclamo } from "@/domain/enums";
import {
  CATEGORIA_LABEL,
  PRIORIDAD_LABEL,
  opcionesCategoria,
  opcionesPrioridad,
} from "@/domain/labels";
import { formatConfianza } from "@/lib/format";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MapaSelector } from "@/features/mapa/MapaSelector";
import {
  buscarDireccion,
  CENTRO_AMBA,
  direccionDesdePunto,
  sugerirDirecciones,
  type SugerenciaDireccion,
} from "@/features/mapa/geocoding";
import { esFormularioValido, reclamoValidators, type ReclamoFormValues } from "./validation";
import { useSugerenciaClasificacion } from "./useSugerencia";

/** Sentinel select value meaning "no elegido, lo sugiere el clasificador". */
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
    titulo: (touched.titulo || submitted) ? erroresCampo.titulo : null,
    descripcion: (touched.descripcion || submitted) ? erroresCampo.descripcion : null,
  };

  const { sugerencia } = useSugerenciaClasificacion(values.titulo, values.descripcion);
  const [ubicando, setUbicando] = useState(false);
  const [buscandoDir, setBuscandoDir] = useState(false);
  const [opcionesDir, setOpcionesDir] = useState<SugerenciaDireccion[]>([]);
  // Skips the next autocomplete fetch when the address was set programmatically
  // (map click, geolocation, a picked suggestion) instead of typed by the user.
  const omitirSugerencia = useRef(false);
  const dirDebounced = useDebouncedValue(values.direccion, 300);

  // Proximity centre for ranking suggestions: the dropped pin if any, else the
  // citizen's device location, else Greater Buenos Aires. Kept in a ref so the
  // fetch effect reads the latest centre without re-running on every pin move.
  const [centroDispositivo, setCentroDispositivo] = useState(CENTRO_AMBA);
  const centroRef = useRef(CENTRO_AMBA);
  centroRef.current =
    values.latitud !== null && values.longitud !== null
      ? { lat: values.latitud, lng: values.longitud }
      : centroDispositivo;

  // Best-effort: bias toward the citizen's real location. Denied → stays AMBA.
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCentroDispositivo({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 8000, maximumAge: 600000 },
    );
  }, []);

  // Fetch address candidates as the citizen types, cancelling stale requests.
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
      .catch(() => {
        /* aborted or offline: keep the previous options */
      });
    return () => ctrl.abort();
  }, [dirDebounced]);

  function aplicarSugerencia() {
    if (!sugerencia) return;
    setValues((v) => ({ ...v, categoria: sugerencia.categoria, prioridad: sugerencia.prioridad }));
  }

  // A candidate chosen from the dropdown: fill address, neighbourhood and pin.
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

  // Point picked on the map (or from geolocation): drop the pin and reverse
  // geocode so the address and neighbourhood fields fill themselves in.
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
      // Keep the coordinates even if the address lookup fails.
    }
  }

  // Address typed by the citizen: geocode it and move the pin to the real point.
  async function buscarPorDireccion() {
    const texto = values.direccion.trim();
    if (texto.length < 4) return;
    setBuscandoDir(true);
    try {
      const lugar = await buscarDireccion(texto, centroRef.current);
      if (!lugar) {
        toast("No encontramos esa direccion", {
          description: "Revisa como esta escrita o marca el punto en el mapa.",
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
      toast.error("No se pudo buscar la direccion", {
        description: "Intenta de nuevo en unos segundos.",
      });
    } finally {
      setBuscandoDir(false);
    }
  }

  function usarMiUbicacion() {
    if (!navigator.geolocation) return;
    setUbicando(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void fijarUbicacion(pos.coords.latitude, pos.coords.longitude);
        setUbicando(false);
      },
      () => setUbicando(false),
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
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 min-w-0 flex-col">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 md:grid-cols-12 md:items-stretch">
        <div className="min-h-0 min-w-0 md:col-span-5">
          <div className="flex h-full flex-col gap-4 overflow-x-hidden overflow-y-auto">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="titulo">
                Titulo <span className="text-destructive">*</span>
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

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="descripcion">
                Descripcion <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="descripcion"
                placeholder="Contanos que pasa, hace cuanto y donde."
                rows={4}
                value={values.descripcion}
                aria-invalid={!!errores.descripcion}
                onBlur={() => setTouched((t) => ({ ...t, descripcion: true }))}
                onChange={(e) => setValue("descripcion", e.target.value)}
              />
              {errores.descripcion && (
                <p className="text-xs text-destructive">{errores.descripcion}</p>
              )}
            </div>

            {sugerencia && (
              <Alert className="border-primary/20 bg-primary/5">
                <Sparkles className="size-4 text-primary" />
                <AlertTitle>Sugerencia automatica</AlertTitle>
                <AlertDescription>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      Categoria <b>{CATEGORIA_LABEL[sugerencia.categoria]}</b>, prioridad{" "}
                      <b>{PRIORIDAD_LABEL[sugerencia.prioridad]}</b> (
                      {formatConfianza(sugerencia.confianza)} de confianza).
                    </span>
                    <Button type="button" size="xs" variant="secondary" onClick={aplicarSugerencia}>
                      Aplicar
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  value={values.categoria ?? AUTO}
                  onValueChange={(v) => setValue("categoria", v === AUTO ? null : v)}
                >
                  <SelectTrigger id="categoria" className="w-full" aria-label="Categoria">
                    <SelectValue placeholder="La sugiere el clasificador" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AUTO}>La sugiere el clasificador</SelectItem>
                    {opcionesCategoria().map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="prioridad">Prioridad</Label>
                <Select
                  value={values.prioridad ?? AUTO}
                  onValueChange={(v) => setValue("prioridad", v === AUTO ? null : v)}
                >
                  <SelectTrigger id="prioridad" className="w-full" aria-label="Prioridad">
                    <SelectValue placeholder="La sugiere el clasificador" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AUTO}>La sugiere el clasificador</SelectItem>
                    {opcionesPrioridad().map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
                <Label htmlFor="direccion">Direccion</Label>
                <div className="relative">
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
                        aria-label="Buscar direccion en el mapa"
                        onClick={() => void buscarPorDireccion()}
                      >
                        {buscandoDir ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Search />
                        )}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  {opcionesDir.length > 0 && (
                    <ul
                      role="listbox"
                      className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg bg-popover py-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
                    >
                      {opcionesDir.map((o) => (
                        <li key={o.etiqueta}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={false}
                            className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
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
                    </ul>
                  )}
                </div>
              </div>

              <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
                <Label htmlFor="barrio">Barrio</Label>
                <Input
                  id="barrio"
                  value={values.barrio}
                  onChange={(e) => setValue("barrio", e.target.value)}
                />
              </div>

              <p className="col-span-2 -mt-1.5 text-xs text-muted-foreground">
                Empeza a escribir y elegi una sugerencia, o marca el punto en el mapa.
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-0 md:col-span-7">
          <div className="flex h-full flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Ubicacion en el mapa</span>
              <Button
                type="button"
                size="xs"
                variant="secondary"
                disabled={ubicando}
                onClick={usarMiUbicacion}
              >
                {ubicando ? <Loader2 className="animate-spin" /> : <LocateFixed />}
                Usar mi ubicacion
              </Button>
            </div>
            <MapaSelector
              lat={values.latitud}
              lng={values.longitud}
              onPick={fijarUbicacion}
              altura={620}
              className="mapa-columna-fill"
            />
            <p className="text-xs text-muted-foreground">
              {values.latitud !== null && values.longitud !== null
                ? `Lat ${values.latitud.toFixed(5)}, Lng ${values.longitud.toFixed(5)}`
                : "Toca el mapa o usa tu ubicacion para marcar el punto."}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 mb-4 flex shrink-0 justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          Enviar reclamo
        </Button>
      </div>
    </form>
  );
}
