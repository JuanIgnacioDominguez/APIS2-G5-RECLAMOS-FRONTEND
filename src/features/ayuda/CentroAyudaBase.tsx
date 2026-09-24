import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, Search, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

/** A single FAQ entry. Feature-specific lists extend this with their own tags. */
export interface PreguntaAyuda {
  id: string;
  pregunta: string;
  respuesta: string;
}

/** A help category card used to filter the FAQ list. */
export interface CategoriaAyuda<Clave extends string = string> {
  id: Clave;
  titulo: string;
  descripcion: string;
  icon: LucideIcon;
  icono: string;
}

/** Lowercases and strips accents so the search is diacritic-insensitive. */
export function normalizar(texto: string): string {
  return texto.toLocaleLowerCase("es").normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** A FAQ entry tagged with the category it belongs to. */
export type PreguntaConCategoria<Clave extends string = string> = PreguntaAyuda & {
  categoria: Clave;
};

/**
 * Search and category-filter state shared by both help centers: the query box,
 * the active category, and the handlers that scroll the FAQ into view.
 */
export function useCentroAyuda<Clave extends string>() {
  const [consulta, setConsulta] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState<Clave | null>(null);
  const consultaLimpia = consulta.trim();
  const terminoConsulta = normalizar(consultaLimpia);

  // Typing in the search box always clears the active category filter.
  function buscar(valor: string) {
    setConsulta(valor);
    setCategoriaActiva(null);
  }

  function mostrarCategoria(categoria: Clave) {
    setCategoriaActiva(categoria);
    setConsulta("");
    window.setTimeout(() => {
      document.getElementById("preguntas-frecuentes")?.scrollIntoView?.({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  function verTodas() {
    setCategoriaActiva(null);
    setConsulta("");
  }

  return {
    consulta,
    consultaLimpia,
    terminoConsulta,
    categoriaActiva,
    buscar,
    mostrarCategoria,
    verTodas,
  };
}

/** Filters a FAQ list by active category and diacritic-insensitive text. */
export function filtrarPreguntas<P extends PreguntaConCategoria>(
  preguntas: P[],
  categoriaActiva: string | null,
  terminoConsulta: string,
): P[] {
  const porCategoria = categoriaActiva
    ? preguntas.filter((pregunta) => pregunta.categoria === categoriaActiva)
    : preguntas;
  if (!terminoConsulta) return porCategoria;
  return porCategoria.filter((pregunta) =>
    normalizar(`${pregunta.pregunta} ${pregunta.respuesta}`).includes(terminoConsulta),
  );
}

/** Builds the live subtitle above the FAQ list (result count or fallback). */
export function subtituloPreguntas(opciones: {
  terminoConsulta: string;
  consultaLimpia: string;
  hayCategoria: boolean;
  cantidad: number;
  porDefecto: string;
}): string {
  const { terminoConsulta, consultaLimpia, hayCategoria, cantidad, porDefecto } = opciones;
  if (terminoConsulta) {
    return `${cantidad} resultado${cantidad === 1 ? "" : "s"} para “${consultaLimpia}”`;
  }
  if (hayCategoria) {
    return `${cantidad} guía${cantidad === 1 ? "" : "s"} en esta categoría.`;
  }
  return porDefecto;
}

/** Collapsible FAQ item. */
export function Pregunta({ pregunta }: { pregunta: PreguntaAyuda }) {
  const [abierta, setAbierta] = useState(false);

  return (
    <div
      id={pregunta.id}
      className="scroll-mt-24 rounded-xl border bg-card transition-colors hover:bg-muted/30"
    >
      <button
        type="button"
        onClick={() => setAbierta((valor) => !valor)}
        aria-expanded={abierta}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-medium sm:px-5"
      >
        {pregunta.pregunta}
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            abierta ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
          abierta ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground sm:px-5">
            {pregunta.respuesta}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Hero band with title, description and the diacritic-insensitive search box. */
export function HeroAyuda({
  inputId,
  descripcion,
  consulta,
  onConsultaChange,
  badge,
}: {
  inputId: string;
  descripcion: ReactNode;
  consulta: string;
  onConsultaChange: (valor: string) => void;
  badge?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-accent via-card to-card px-5 py-8 shadow-sm sm:px-8 sm:py-10">
      <div className="relative z-10 max-w-3xl">
        {badge}
        <h1 className={`text-3xl font-semibold tracking-tight sm:text-4xl ${badge ? "mt-2" : ""}`}>
          Centro de ayuda
        </h1>
        <p className={`mt-2 text-base text-muted-foreground ${badge ? "max-w-2xl" : ""}`}>
          {descripcion}
        </p>
        <form
          role="search"
          onSubmit={(event) => event.preventDefault()}
          className="relative mt-7 max-w-2xl"
        >
          <label htmlFor={inputId} className="sr-only">
            Buscar en el centro de ayuda
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={inputId}
            type="search"
            value={consulta}
            onChange={(event) => onConsultaChange(event.target.value)}
            placeholder="Buscar en la ayuda..."
            className="h-12 bg-card pr-4 pl-12 text-base shadow-sm"
          />
        </form>
      </div>
      <IlustracionAyuda />
    </section>
  );
}

/** Grid of clickable category filters. */
export function RejillaCategorias<Clave extends string>({
  categorias,
  activa,
  onSeleccionar,
  className,
  dataTour,
}: {
  categorias: CategoriaAyuda<Clave>[];
  activa: Clave | null;
  onSeleccionar: (categoria: Clave) => void;
  className: string;
  dataTour?: string;
}) {
  return (
    <section data-tour={dataTour} aria-label="Categorías de ayuda" className={className}>
      {categorias.map((categoria) => {
        const Icono = categoria.icon;
        return (
          <button
            key={categoria.id}
            type="button"
            onClick={() => onSeleccionar(categoria.id)}
            aria-pressed={activa === categoria.id}
            className={`group flex items-center gap-3 rounded-xl border p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none ${
              activa === categoria.id ? "border-primary/40 bg-accent/50" : "bg-card"
            }`}
          >
            <span
              className={`grid size-11 shrink-0 place-items-center rounded-xl ${categoria.icono}`}
            >
              <Icono className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{categoria.titulo}</span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {categoria.descripcion}
              </span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </button>
        );
      })}
    </section>
  );
}

/** FAQ panel: header with live result count and the list (or empty state). */
export function TarjetaPreguntas({
  titulo,
  subtitulo,
  mostrarVerTodas,
  onVerTodas,
  resultados,
  hintVacio,
}: {
  titulo: string;
  subtitulo: ReactNode;
  mostrarVerTodas: boolean;
  onVerTodas: () => void;
  resultados: PreguntaAyuda[];
  hintVacio: ReactNode;
}) {
  return (
    <Card id="preguntas-frecuentes" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>{titulo}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
              {subtitulo}
            </p>
          </div>
          {mostrarVerTodas ? (
            <Button variant="ghost" size="sm" onClick={onVerTodas}>
              Ver todas
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {resultados.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-12 text-center">
            <Search className="size-8 text-muted-foreground/60" />
            <p className="mt-3 font-medium">No encontramos esa ayuda</p>
            <p className="mt-1 text-sm text-muted-foreground">{hintVacio}</p>
          </div>
        ) : (
          resultados.map((pregunta) => <Pregunta key={pregunta.id} pregunta={pregunta} />)
        )}
      </CardContent>
    </Card>
  );
}

/** Secondary link button used in the "Accesos rápidos" grid. */
export function AccesoRapido({
  to,
  icon: Icono,
  label,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Button
      asChild
      variant="secondary"
      className="h-auto min-h-16 w-full justify-start gap-3 px-3 py-2.5 text-left"
    >
      <Link to={to}>
        <Icono className="text-chart-1" />
        <span className="text-xs font-medium leading-tight">{label}</span>
      </Link>
    </Button>
  );
}

/** "Accesos rápidos" card: an icon-led header, a grid of links and a note. */
export function TarjetaAccesos({
  icono: Icono,
  descripcion,
  notaIcono: Nota,
  notaTexto,
  children,
}: {
  icono: LucideIcon;
  descripcion: ReactNode;
  notaIcono: LucideIcon;
  notaTexto: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-chart-1/10 text-chart-1">
            <Icono className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold">Accesos rápidos</h2>
            <p className="mt-1 text-sm text-muted-foreground">{descripcion}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">{children}</div>
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          <Nota className="size-4 shrink-0 text-chart-2" />
          {notaTexto}
        </div>
      </CardContent>
    </Card>
  );
}

/** "Atajo de teclado" card describing the global search shortcut. */
export function TarjetaAtajoTeclado({
  icono: Icono,
  descripcionEncabezado,
  descripcionInterna,
}: {
  icono: LucideIcon;
  descripcionEncabezado: ReactNode;
  descripcionInterna: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-chart-1/10 text-chart-1">
            <Icono className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold">Atajo de teclado</h2>
            <p className="mt-1 text-sm text-muted-foreground">{descripcionEncabezado}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-lg bg-muted px-3 py-3">
          <div>
            <p className="text-sm font-medium">Buscador global</p>
            <p className="mt-1 text-xs text-muted-foreground">{descripcionInterna}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <kbd className="rounded-md border bg-card px-2 py-1 font-mono text-xs font-semibold shadow-sm">
              Ctrl
            </kbd>
            <span className="text-xs text-muted-foreground">+</span>
            <kbd className="rounded-md border bg-card px-2 py-1 font-mono text-xs font-semibold shadow-sm">
              K
            </kbd>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">En macOS, usá Cmd + K.</p>
      </CardContent>
    </Card>
  );
}

/** Decorative hero illustration shared by both help centers. */
export function IlustracionAyuda() {
  return (
    <div
      aria-hidden="true"
      className="absolute top-1/2 right-6 hidden w-[22rem] -translate-y-1/2 xl:block"
    >
      <svg
        data-testid="ilustracion-ayuda"
        viewBox="0 0 360 240"
        className="w-full overflow-visible"
      >
        <defs>
          <linearGradient id="ayuda-fondo" x1="40" y1="20" x2="320" y2="220">
            <stop offset="0" stopColor="var(--chart-1)" stopOpacity="0.22" />
            <stop offset="1" stopColor="var(--chart-2)" stopOpacity="0.08" />
          </linearGradient>
          <filter id="ayuda-sombra" x="-30%" y="-30%" width="160%" height="180%">
            <feDropShadow
              dx="0"
              dy="12"
              stdDeviation="12"
              floodColor="var(--sidebar)"
              floodOpacity="0.16"
            />
          </filter>
        </defs>

        <path
          d="M70 35c31-30 96-35 143-13 43 20 88 14 112 53 25 41 3 100-40 127-42 26-90 15-133 25-47 11-100 4-122-38-20-39-3-123 40-154Z"
          fill="url(#ayuda-fondo)"
        />
        <circle cx="300" cy="54" r="8" fill="var(--chart-3)" opacity="0.38" />
        <circle cx="49" cy="185" r="5" fill="var(--chart-2)" opacity="0.55" />
        <path
          d="M39 71h20M49 61v20M293 177h20M303 167v20"
          stroke="var(--chart-1)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.35"
        />

        <g transform="rotate(-6 138 126)" opacity="0.65">
          <rect
            x="70"
            y="55"
            width="170"
            height="120"
            rx="18"
            fill="var(--card)"
            stroke="var(--border)"
          />
          <rect x="88" y="76" width="92" height="9" rx="4.5" fill="var(--chart-1)" opacity="0.16" />
          <rect
            x="88"
            y="98"
            width="124"
            height="7"
            rx="3.5"
            fill="var(--muted-foreground)"
            opacity="0.12"
          />
          <rect
            x="88"
            y="116"
            width="104"
            height="7"
            rx="3.5"
            fill="var(--muted-foreground)"
            opacity="0.1"
          />
        </g>

        <g filter="url(#ayuda-sombra)">
          <rect
            x="82"
            y="45"
            width="196"
            height="146"
            rx="20"
            fill="var(--card)"
            stroke="var(--border)"
          />
          <path d="M82 73h196" stroke="var(--border)" />
          <circle cx="101" cy="59" r="4" fill="var(--chart-4)" opacity="0.65" />
          <circle cx="115" cy="59" r="4" fill="var(--chart-3)" opacity="0.65" />
          <circle cx="129" cy="59" r="4" fill="var(--chart-2)" opacity="0.65" />
          <rect x="103" y="88" width="154" height="38" rx="12" fill="var(--accent)" />
          <circle cx="124" cy="107" r="7" fill="none" stroke="var(--chart-1)" strokeWidth="3" />
          <path d="m130 113 6 6" stroke="var(--chart-1)" strokeWidth="3" strokeLinecap="round" />
          <rect
            x="144"
            y="102"
            width="78"
            height="7"
            rx="3.5"
            fill="var(--muted-foreground)"
            opacity="0.18"
          />
          <rect
            x="103"
            y="143"
            width="112"
            height="9"
            rx="4.5"
            fill="var(--chart-1)"
            opacity="0.2"
          />
          <rect
            x="103"
            y="164"
            width="154"
            height="7"
            rx="3.5"
            fill="var(--muted-foreground)"
            opacity="0.12"
          />
        </g>

        <g filter="url(#ayuda-sombra)">
          <path
            d="M232 18h67a18 18 0 0 1 18 18v38a18 18 0 0 1-18 18h-34l-20 17 3-17h-16a18 18 0 0 1-18-18V36a18 18 0 0 1 18-18Z"
            fill="var(--chart-1)"
          />
          <text
            x="266"
            y="64"
            fill="var(--primary-foreground)"
            fontFamily="var(--font-sans)"
            fontSize="36"
            fontWeight="700"
            textAnchor="middle"
          >
            ?
          </text>
        </g>

        <g transform="rotate(5 91 174)" filter="url(#ayuda-sombra)">
          <rect
            x="39"
            y="145"
            width="105"
            height="61"
            rx="16"
            fill="var(--card)"
            stroke="var(--border)"
          />
          <circle cx="62" cy="166" r="10" fill="var(--chart-2)" opacity="0.16" />
          <path
            d="m58 166 3 3 6-7"
            stroke="var(--chart-2)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="80"
            y="160"
            width="42"
            height="7"
            rx="3.5"
            fill="var(--muted-foreground)"
            opacity="0.18"
          />
          <rect
            x="54"
            y="186"
            width="68"
            height="6"
            rx="3"
            fill="var(--muted-foreground)"
            opacity="0.1"
          />
        </g>

        <g transform="translate(251 139)" filter="url(#ayuda-sombra)">
          <path
            d="M29 0C13 0 0 13 0 29c0 21 29 48 29 48s29-27 29-48C58 13 45 0 29 0Z"
            fill="var(--chart-2)"
          />
          <circle cx="29" cy="29" r="10" fill="var(--card)" />
        </g>
      </svg>
    </div>
  );
}
